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
 * Calculate reading time based on word count
 */
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Simple frontmatter parser that works in the browser
 */
function parseFrontmatter(markdown: string): { data: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: markdown };
  }

  const [, frontmatterStr, content] = match;
  const data: Record<string, unknown> = {};

  // Parse YAML-like frontmatter (simple key: value pairs)
  const lines = frontmatterStr.split("\n");
  let currentKey = "";
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for array item
    if (trimmed.startsWith("- ")) {
      if (inArray && currentKey) {
        arrayValues.push(trimmed.slice(2).replace(/^["']|["']$/g, ""));
      }
      continue;
    }

    // If we were in an array, save it
    if (inArray && currentKey) {
      data[currentKey] = arrayValues;
      inArray = false;
      arrayValues = [];
    }

    // Parse key: value
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();

      if (value === "") {
        // Might be an array starting on next line
        currentKey = key;
        inArray = true;
        arrayValues = [];
      } else if (value.startsWith("[") && value.endsWith("]")) {
        // Inline array like ["tag1", "tag2"]
        const arrayContent = value.slice(1, -1);
        data[key] = arrayContent
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      } else if (value === "true") {
        data[key] = true;
      } else if (value === "false") {
        data[key] = false;
      } else {
        // Remove quotes if present
        data[key] = value.replace(/^["']|["']$/g, "");
      }
      currentKey = key;
    }
  }

  // Handle trailing array
  if (inArray && currentKey) {
    data[currentKey] = arrayValues;
  }

  return { data, content: content.trim() };
}

/**
 * Parse a markdown string with frontmatter
 */
export function parseMarkdown(markdown: string, slug: string): ParsedPost {
  const { data, content } = parseFrontmatter(markdown);
  const frontmatter = data as unknown as PostFrontmatter;

  return {
    frontmatter,
    content,
    slug,
    readingTime: calculateReadingTime(content),
  };
}

/**
 * Fetch and parse a markdown file from the public directory
 */
export async function fetchPost(slug: string): Promise<ParsedPost | null> {
  try {
    const response = await fetch(`/content/posts/${slug}.md`);
    if (!response.ok) {
      return null;
    }
    const markdown = await response.text();
    return parseMarkdown(markdown, slug);
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch the post index (list of all posts with metadata)
 * This reads from a generated index file
 */
export async function fetchPostIndex(): Promise<PostMeta[]> {
  try {
    const response = await fetch("/content/posts/index.json");
    if (!response.ok) {
      return [];
    }
    const posts = (await response.json()) as PostMeta[];
    return posts
      .filter((p) => p.published !== false)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching post index:", error);
    return [];
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
