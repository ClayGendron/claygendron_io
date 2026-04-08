export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  published?: boolean;
}

export interface ParsedPost {
  frontmatter: PostFrontmatter;
  content: string;
  slug: string;
  readingTime: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
  published: boolean;
}

/**
 * Fetch the post index from the API
 */
export async function fetchPostIndex(): Promise<PostMeta[]> {
  try {
    const response = await fetch("/api/content/posts");
    if (!response.ok) return [];
    const posts = await response.json();
    return posts.map((p: Record<string, unknown>) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      excerpt: p.subtitle ?? "",
      tags: p.tags ?? [],
      readingTime: `${p.reading_minutes} min read`,
      published: p.published,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch a single post by slug from the API
 */
export async function fetchPost(slug: string): Promise<ParsedPost | null> {
  try {
    const response = await fetch(`/api/content/posts/${slug}`);
    if (!response.ok) return null;
    const p = await response.json();
    return {
      frontmatter: {
        title: p.title,
        date: p.date,
        excerpt: p.subtitle ?? "",
        tags: p.tags ?? undefined,
        published: p.published,
      },
      content: p.content ?? "",
      slug: p.slug,
      readingTime: `${p.reading_minutes} min read`,
    };
  } catch {
    return null;
  }
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
