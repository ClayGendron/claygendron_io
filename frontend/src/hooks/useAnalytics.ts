import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '@/lib/analytics';

/**
 * Hook to integrate analytics with React Router
 * Automatically tracks page views on route changes
 */
export function useAnalytics(): void {
  const location = useLocation();
  const initialized = useRef(false);
  const prevPath = useRef<string | null>(null);

  // Initialize analytics on mount
  useEffect(() => {
    if (!initialized.current) {
      analytics.init();
      initialized.current = true;
    }

    return () => {
      analytics.cleanup();
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    // Skip if same path (prevents double tracking)
    if (prevPath.current === location.pathname) {
      return;
    }

    prevPath.current = location.pathname;

    // Small delay to ensure page title is updated
    const timer = setTimeout(() => {
      analytics.trackPageView(location.pathname, document.title);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}

/**
 * Hook to track custom events
 */
export function useTrackEvent() {
  return (eventType: string, data?: Record<string, unknown>) => {
    analytics.trackEvent(eventType, data);
  };
}
