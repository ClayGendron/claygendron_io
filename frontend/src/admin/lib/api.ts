import { msalInstance, loginRequest } from "@/admin/auth/msalConfig";
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  BlogPost,
  BlogPostCreate,
  BlogPostUpdate,
  About,
  AboutUpdate,
  AboutWorkArea,
  AboutWorkAreaCreate,
  AboutWorkAreaUpdate,
  ReorderItem,
  OverviewStats,
  DailyStats,
  SessionItem,
} from "./types";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    await msalInstance.loginRedirect(loginRequest);
    throw new Error("Redirecting to login");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch {
    await msalInstance.loginRedirect(loginRequest);
    throw new Error("Redirecting to login");
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`/api/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projectsApi = {
  list: () => adminFetch<Project[]>("/content/projects"),

  get: (id: number) => adminFetch<Project>(`/content/projects/${id}`),

  create: (data: ProjectCreate) =>
    adminFetch<Project>("/content/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProjectUpdate) =>
    adminFetch<Project>(`/content/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    adminFetch<void>(`/content/projects/${id}`, { method: "DELETE" }),

  reorder: (items: ReorderItem[]) =>
    adminFetch<void>("/content/projects/reorder", {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
};

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export const postsApi = {
  list: () => adminFetch<BlogPost[]>("/content/posts"),

  get: (id: number) => adminFetch<BlogPost>(`/content/posts/${id}`),

  create: (data: BlogPostCreate) =>
    adminFetch<BlogPost>("/content/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: BlogPostUpdate) =>
    adminFetch<BlogPost>(`/content/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    adminFetch<void>(`/content/posts/${id}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const aboutApi = {
  get: () => adminFetch<About>("/content/about"),

  update: (data: AboutUpdate) =>
    adminFetch<About>("/content/about", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  createWorkArea: (data: AboutWorkAreaCreate) =>
    adminFetch<AboutWorkArea>("/content/about/work-areas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateWorkArea: (id: number, data: AboutWorkAreaUpdate) =>
    adminFetch<AboutWorkArea>(`/content/about/work-areas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteWorkArea: (id: number) =>
    adminFetch<void>(`/content/about/work-areas/${id}`, { method: "DELETE" }),

  reorderWorkAreas: (items: ReorderItem[]) =>
    adminFetch<void>("/content/about/work-areas/reorder", {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export const analyticsApi = {
  overview: (days = 7) =>
    adminFetch<OverviewStats>(`/overview?days=${days}`),

  dailyStats: (days = 30) =>
    adminFetch<{ daily_stats: DailyStats[] }>(`/daily-stats?days=${days}`),

  sessions: (limit = 10) =>
    adminFetch<{ sessions: SessionItem[] }>(`/sessions?limit=${limit}`),
};

export { ApiError };
