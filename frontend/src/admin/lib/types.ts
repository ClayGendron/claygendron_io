// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  date: string | null;
  pinned: boolean;
  published: boolean;
  order: number;
  impacts: string[] | null;
  tags: string[] | null;
  tools: string[] | null;
  links: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  slug: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  date?: string | null;
  pinned?: boolean;
  published?: boolean;
  order?: number;
  impacts?: string[] | null;
  tags?: string[] | null;
  tools?: string[] | null;
  links?: Record<string, string> | null;
}

export interface ProjectUpdate {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  content?: string | null;
  date?: string | null;
  pinned?: boolean;
  published?: boolean;
  order?: number;
  impacts?: string[] | null;
  tags?: string[] | null;
  tools?: string[] | null;
  links?: Record<string, string> | null;
}

// ---------------------------------------------------------------------------
// Blog Post
// ---------------------------------------------------------------------------

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  date: string;
  reading_minutes: number;
  published: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostCreate {
  slug: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  date: string;
  published?: boolean;
  tags?: string[] | null;
}

export interface BlogPostUpdate {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  content?: string | null;
  date?: string;
  published?: boolean;
  tags?: string[] | null;
}

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export interface AboutWorkArea {
  id: number;
  title: string;
  description: string | null;
  order: number;
}

export interface AboutWorkAreaCreate {
  title: string;
  description?: string | null;
  order?: number;
}

export interface AboutWorkAreaUpdate {
  title?: string;
  description?: string | null;
  order?: number;
}

export interface About {
  id: number;
  title: string | null;
  introduction: string | null;
  focus: string | null;
  interests: string | null;
  languages: string | null;
  location: string | null;
  current_title: string | null;
  current_employer: string | null;
  updated_at: string;
  work_areas: AboutWorkArea[];
}

export interface AboutUpdate {
  title?: string | null;
  introduction?: string | null;
  focus?: string | null;
  interests?: string | null;
  languages?: string | null;
  location?: string | null;
  current_title?: string | null;
  current_employer?: string | null;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface OverviewStats {
  total_sessions: number;
  total_page_views: number;
  unique_visitors_today: number;
  page_views_today: number;
  avg_time_on_page: number;
  avg_scroll_depth: number;
  bounce_rate: number;
  top_pages: Array<{ path: string; views: number }>;
  top_referrers: Array<{ domain: string; count: number }>;
  device_breakdown: Record<string, number>;
}

export interface DailyStats {
  date: string;
  sessions: number;
  page_views: number;
}

export interface SessionItem {
  id: string;
  started_at: string;
  last_seen_at: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer_domain: string | null;
  country: string | null;
  page_view_count: number;
  total_time: number;
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface ReorderItem {
  id: number;
  order: number;
}
