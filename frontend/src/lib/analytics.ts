/**
 * Lightweight analytics tracker for claygendron.io
 * Tracks sessions, page views, scroll depth, and time on page
 */

const API_BASE = '/api/analytics';
const IS_LOCAL = window.location.hostname === 'localhost';

interface AnalyticsState {
  sessionId: string | null;
  currentPageViewId: string | null;
  pageEnterTime: number;
  maxScrollDepth: number;
  heartbeatInterval: ReturnType<typeof setInterval> | null;
  scrollHandler: (() => void) | null;
  visibilityHandler: (() => void) | null;
}

const state: AnalyticsState = {
  sessionId: null,
  currentPageViewId: null,
  pageEnterTime: 0,
  maxScrollDepth: 0,
  heartbeatInterval: null,
  scrollHandler: null,
  visibilityHandler: null,
};

// Storage keys
const SESSION_KEY = 'clay_analytics_session';
const SESSION_EXPIRY_KEY = 'clay_analytics_session_expiry';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get UTM parameters from URL
 */
function getUtmParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

/**
 * Check if session is still valid
 */
function isSessionValid(): boolean {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() < parseInt(expiry, 10);
}

/**
 * Extend session expiry
 */
function extendSession(): void {
  localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION));
}

/**
 * Start a new analytics session
 */
async function startSession(): Promise<string | null> {
  if (IS_LOCAL) return null;
  // Check for existing valid session
  const existingSession = localStorage.getItem(SESSION_KEY);
  if (existingSession && isSessionValid()) {
    state.sessionId = existingSession;
    extendSession();
    startHeartbeat();
    return existingSession;
  }

  try {
    const utmParams = getUtmParams();
    const response = await fetch(`${API_BASE}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: document.referrer || null,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        ...utmParams,
      }),
    });

    if (!response.ok) {
      console.warn('[Analytics] Failed to start session:', response.status);
      return null;
    }

    const data = await response.json();
    state.sessionId = data.session_id;

    // Store session in localStorage
    localStorage.setItem(SESSION_KEY, data.session_id);
    extendSession();

    startHeartbeat();
    return data.session_id;
  } catch (error) {
    console.warn('[Analytics] Error starting session:', error);
    return null;
  }
}

/**
 * Calculate current scroll depth as percentage
 */
function calculateScrollDepth(): number {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 100;
  return Math.min(100, Math.round((scrollTop / docHeight) * 100));
}

/**
 * Handle scroll events to track max scroll depth
 */
function handleScroll(): void {
  const currentDepth = calculateScrollDepth();
  if (currentDepth > state.maxScrollDepth) {
    state.maxScrollDepth = currentDepth;
  }
}

/**
 * Track a page view
 */
async function trackPageView(path: string, title?: string): Promise<string | null> {
  if (IS_LOCAL) return null;
  if (!state.sessionId) {
    await startSession();
  }

  if (!state.sessionId) {
    return null;
  }

  // Send update for previous page view before tracking new one
  await sendPageViewUpdate();

  // Reset state for new page
  state.pageEnterTime = Date.now();
  state.maxScrollDepth = 0;
  state.currentPageViewId = null;

  try {
    const response = await fetch(`${API_BASE}/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: state.sessionId,
        path,
        title: title || document.title,
        referrer: document.referrer || null,
      }),
    });

    if (!response.ok) {
      console.warn('[Analytics] Failed to track page view:', response.status);
      return null;
    }

    const data = await response.json();
    state.currentPageViewId = data.page_view_id;

    // Set up scroll tracking
    setupScrollTracking();

    // Extend session
    extendSession();

    return data.page_view_id;
  } catch (error) {
    console.warn('[Analytics] Error tracking page view:', error);
    return null;
  }
}

/**
 * Set up scroll depth tracking
 */
function setupScrollTracking(): void {
  // Remove previous handler if exists
  if (state.scrollHandler) {
    window.removeEventListener('scroll', state.scrollHandler);
  }

  // Create throttled scroll handler
  let ticking = false;
  state.scrollHandler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', state.scrollHandler, { passive: true });

  // Initial scroll depth check
  handleScroll();
}

/**
 * Send page view update with time on page and scroll depth
 */
async function sendPageViewUpdate(): Promise<void> {
  if (!state.currentPageViewId || !state.sessionId) {
    return;
  }

  const timeOnPage = Math.round((Date.now() - state.pageEnterTime) / 1000);

  try {
    await fetch(`${API_BASE}/pageview/${state.currentPageViewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        time_on_page: timeOnPage,
        scroll_depth: state.maxScrollDepth,
      }),
    });
  } catch (error) {
    console.warn('[Analytics] Error updating page view:', error);
  }
}

/**
 * Track a custom event
 */
async function trackEvent(
  eventType: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (IS_LOCAL || !state.sessionId) {
    return;
  }

  try {
    await fetch(`${API_BASE}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: state.sessionId,
        page_view_id: state.currentPageViewId,
        event_type: eventType,
        data: data || {},
      }),
    });

    extendSession();
  } catch (error) {
    console.warn('[Analytics] Error tracking event:', error);
  }
}

/**
 * Send heartbeat to keep session alive
 */
async function sendHeartbeat(): Promise<void> {
  if (!state.sessionId) {
    return;
  }

  try {
    await fetch(`${API_BASE}/heartbeat?session_id=${state.sessionId}`, {
      method: 'POST',
    });
    extendSession();
  } catch (error) {
    // Silently fail heartbeats
  }
}

/**
 * Start heartbeat interval
 */
function startHeartbeat(): void {
  if (state.heartbeatInterval) {
    clearInterval(state.heartbeatInterval);
  }

  // Send heartbeat every 30 seconds
  state.heartbeatInterval = setInterval(sendHeartbeat, 30000);
}

/**
 * Set up visibility change handler to send updates when user leaves
 */
function setupVisibilityHandler(): void {
  if (state.visibilityHandler) {
    document.removeEventListener('visibilitychange', state.visibilityHandler);
  }

  state.visibilityHandler = () => {
    if (document.visibilityState === 'hidden') {
      // Use sendBeacon for reliable delivery when page is closing
      sendPageViewUpdateBeacon();
    }
  };

  document.addEventListener('visibilitychange', state.visibilityHandler);

  // Also handle beforeunload for additional reliability
  window.addEventListener('beforeunload', sendPageViewUpdateBeacon);
}

/**
 * Send page view update using Beacon API for reliability
 */
function sendPageViewUpdateBeacon(): void {
  if (!state.currentPageViewId || !state.sessionId) {
    return;
  }

  const timeOnPage = Math.round((Date.now() - state.pageEnterTime) / 1000);

  const data = JSON.stringify({
    time_on_page: timeOnPage,
    scroll_depth: state.maxScrollDepth,
  });

  navigator.sendBeacon(
    `${API_BASE}/pageview/${state.currentPageViewId}`,
    new Blob([data], { type: 'application/json' })
  );
}

/**
 * Initialize analytics
 */
async function init(): Promise<void> {
  if (IS_LOCAL) return;
  await startSession();
  setupVisibilityHandler();
}

/**
 * Clean up analytics (for unmounting)
 */
function cleanup(): void {
  if (state.heartbeatInterval) {
    clearInterval(state.heartbeatInterval);
  }
  if (state.scrollHandler) {
    window.removeEventListener('scroll', state.scrollHandler);
  }
  if (state.visibilityHandler) {
    document.removeEventListener('visibilitychange', state.visibilityHandler);
  }
}

// Export analytics API
export const analytics = {
  init,
  trackPageView,
  trackEvent,
  sendPageViewUpdate,
  cleanup,
  getSessionId: () => state.sessionId,
};

export default analytics;
