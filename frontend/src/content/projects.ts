export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  featured: boolean;
  status: "active" | "completed" | "archived";
  links?: {
    github?: string;
    demo?: string;
    docs?: string;
  };
  highlights?: string[];
  techStack?: string[];
}

export const projects: Project[] = [
  {
    slug: "aila",
    title: "AILA",
    description:
      "AI Learning Assistant designed to tutor students while maintaining academic integrity. Built for scale at SNHU.",
    longDescription: `AILA (AI Learning Assistant) is an intelligent tutoring system that helps students learn without giving away answers. It's designed to maintain academic integrity while providing personalized, adaptive support.

The system uses LangGraph-based agent architectures to create conversational flows that guide students through problems rather than solving them directly. AILA can identify when a student is struggling and adjust its approach accordingly.`,
    tags: ["AI/ML", "Education", "LangGraph", "Azure"],
    featured: true,
    status: "active",
    highlights: [
      "Serves thousands of students across SNHU",
      "Maintains academic integrity through guided learning",
      "Built on Azure with Databricks integration",
      "Uses LangGraph for complex conversation flows",
    ],
    techStack: [
      "Python",
      "LangGraph",
      "Azure OpenAI",
      "Databricks",
      "FastAPI",
      "React",
    ],
  },
  {
    slug: "quiverdb",
    title: "QuiverDB",
    description:
      'A graph database positioned as "DuckDB for graph retrieval" — fast, embeddable, and designed for AI workloads.',
    longDescription: `QuiverDB is an ambitious project to create an embeddable graph database optimized for AI retrieval workloads. Think DuckDB's simplicity and performance, but for graph data.

The goal is to make graph-based retrieval as easy as spinning up a SQLite database, while maintaining the performance characteristics needed for production AI applications.`,
    tags: ["Database", "Graph", "Rust", "AI Infrastructure"],
    featured: true,
    status: "active",
    links: {
      github: "https://github.com/claygendron/quiverdb",
    },
    highlights: [
      "Embeddable with zero configuration",
      "Optimized for AI retrieval patterns",
      "Written in Rust for performance",
      "Simple API inspired by DuckDB",
    ],
    techStack: ["Rust", "Graph Algorithms", "HNSW", "Arrow"],
  },
  {
    slug: "claude-code-projects",
    title: "Claude Code Projects",
    description:
      "Collection of tools and utilities built with Claude Code, exploring the boundaries of AI-assisted development.",
    tags: ["AI", "Tooling", "Python", "TypeScript"],
    featured: false,
    status: "active",
  },
  {
    slug: "data-viz-experiments",
    title: "Data Visualization Experiments",
    description:
      "Interactive data visualizations exploring various datasets and storytelling techniques.",
    tags: ["D3.js", "Data Viz", "TypeScript"],
    featured: false,
    status: "completed",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getAllProjects(): Project[] {
  return projects;
}
