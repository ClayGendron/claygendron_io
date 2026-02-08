export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags?: string[];
  published: boolean;
}

// This will eventually be generated from markdown files
// For now, we'll use static data as placeholders
export const posts: BlogPost[] = [
  {
    slug: "building-aila",
    title: "Building AILA: Lessons from AI Tutoring at Scale",
    excerpt:
      "What I learned building an AI tutor that serves thousands of students while respecting academic integrity.",
    date: "2025-01-15",
    readingTime: "8 min read",
    tags: ["AI", "Education", "LangGraph"],
    published: true,
  },
  {
    slug: "graph-retrieval-patterns",
    title: "Graph Retrieval Patterns for AI Applications",
    excerpt:
      "Exploring why graph-based retrieval might be the missing piece in your RAG pipeline.",
    date: "2025-01-08",
    readingTime: "6 min read",
    tags: ["Databases", "RAG", "AI"],
    published: true,
  },
  {
    slug: "langgraph-production",
    title: "Taking LangGraph to Production",
    excerpt:
      "Practical lessons from deploying LangGraph agents in a production environment.",
    date: "2024-12-20",
    readingTime: "10 min read",
    tags: ["LangGraph", "Production", "AI"],
    published: true,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug && p.published);
}

export function getAllPosts(): BlogPost[] {
  return posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
