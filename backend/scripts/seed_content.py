"""
Seed the database with content from the frontend's hardcoded data.

Run from the backend directory:
    python -m scripts.seed_content
"""

import asyncio
from datetime import datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import init_db, get_db, close_db
from app.models import Project, BlogPost, About, AboutWorkArea, calculate_reading_minutes


# ---------------------------------------------------------------------------
# Source data (from frontend/src/content/projects.ts)
# ---------------------------------------------------------------------------

PROJECTS = [
    {
        "slug": "aila",
        "title": "AILA",
        "subtitle": "AI Learning Assistant designed to tutor students while maintaining academic integrity. Built for scale at SNHU.",
        "content": (
            "AILA (AI Learning Assistant) is an intelligent tutoring system that helps students learn "
            "without giving away answers. It's designed to maintain academic integrity while providing "
            "personalized, adaptive support.\n\n"
            "The system uses LangGraph-based agent architectures to create conversational flows that "
            "guide students through problems rather than solving them directly. AILA can identify when "
            "a student is struggling and adjust its approach accordingly."
        ),
        "pinned": True,
        "published": True,
        "order": 0,
        "tags": ["AI/ML", "Education", "LangGraph", "Azure"],
        "tools": ["Python", "LangGraph", "Azure OpenAI", "Databricks", "FastAPI", "React"],
        "impacts": [
            "Serves thousands of students across SNHU",
            "Maintains academic integrity through guided learning",
            "Built on Azure with Databricks integration",
            "Uses LangGraph for complex conversation flows",
        ],
        "links": None,
    },
    {
        "slug": "quiverdb",
        "title": "QuiverDB",
        "subtitle": 'A graph database positioned as "DuckDB for graph retrieval" — fast, embeddable, and designed for AI workloads.',
        "content": (
            "QuiverDB is an ambitious project to create an embeddable graph database optimized for AI "
            "retrieval workloads. Think DuckDB's simplicity and performance, but for graph data.\n\n"
            "The goal is to make graph-based retrieval as easy as spinning up a SQLite database, while "
            "maintaining the performance characteristics needed for production AI applications."
        ),
        "pinned": True,
        "published": True,
        "order": 1,
        "tags": ["Database", "Graph", "Rust", "AI Infrastructure"],
        "tools": ["Rust", "Graph Algorithms", "HNSW", "Arrow"],
        "impacts": [
            "Embeddable with zero configuration",
            "Optimized for AI retrieval patterns",
            "Written in Rust for performance",
            "Simple API inspired by DuckDB",
        ],
        "links": {"github": "https://github.com/claygendron/quiverdb"},
    },
    {
        "slug": "claude-code-projects",
        "title": "Claude Code Projects",
        "subtitle": "Collection of tools and utilities built with Claude Code, exploring the boundaries of AI-assisted development.",
        "pinned": False,
        "published": True,
        "order": 2,
        "tags": ["AI", "Tooling", "Python", "TypeScript"],
    },
    {
        "slug": "data-viz-experiments",
        "title": "Data Visualization Experiments",
        "subtitle": "Interactive data visualizations exploring various datasets and storytelling techniques.",
        "pinned": False,
        "published": True,
        "order": 3,
        "tags": ["D3.js", "Data Viz", "TypeScript"],
    },
]


# ---------------------------------------------------------------------------
# Source data (from frontend/src/content/posts.ts + markdown files)
# ---------------------------------------------------------------------------

POSTS_DIR = Path(__file__).parent.parent.parent / "frontend" / "public" / "content" / "posts"

POSTS = [
    {
        "slug": "building-aila",
        "title": "Building AILA: Lessons from AI Tutoring at Scale",
        "subtitle": "What I learned building an AI tutor that serves thousands of students while respecting academic integrity.",
        "date": datetime(2025, 1, 15),
        "published": True,
        "tags": ["AI", "Education", "LangGraph"],
    },
    {
        "slug": "graph-retrieval-patterns",
        "title": "Graph Retrieval Patterns for AI Applications",
        "subtitle": "Exploring why graph-based retrieval might be the missing piece in your RAG pipeline.",
        "date": datetime(2025, 1, 8),
        "published": True,
        "tags": ["Databases", "RAG", "AI"],
    },
    {
        "slug": "langgraph-production",
        "title": "Taking LangGraph to Production",
        "subtitle": "Practical lessons from deploying LangGraph agents in a production environment.",
        "date": datetime(2024, 12, 20),
        "published": True,
        "tags": ["LangGraph", "Production", "AI"],
    },
]


def _load_post_content(slug: str) -> str:
    """Load markdown content for a blog post, stripping frontmatter."""
    md_path = POSTS_DIR / f"{slug}.md"
    if not md_path.exists():
        return ""
    text = md_path.read_text()
    # Strip YAML frontmatter (--- ... ---)
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            text = text[end + 3:].strip()
    return text


# ---------------------------------------------------------------------------
# Source data (from frontend/src/pages/About.tsx)
# ---------------------------------------------------------------------------

ABOUT = {
    "title": "Building tools that make a difference",
    "introduction": (
        "I'm Clay Gendron, an AI engineer focused on building tools that make a meaningful "
        "difference. Currently leading GenAI efforts at Southern New Hampshire University, "
        "where I design and deploy intelligent systems that serve thousands of students.\n\n"
        "My flagship projects include AILA, an AI Learning Assistant designed to tutor students "
        "while maintaining academic integrity, and QuiverDB, a graph database I'm positioning "
        'as "DuckDB for graph retrieval."'
    ),
    "focus": "GenAI & ML Systems",
    "location": "New Hampshire",
    "languages": "Python, Rust, TS",
    "interests": "Graphs, Agents, EdTech",
    "current_title": "GenAI Lead",
    "current_employer": "SNHU",
}

WORK_AREAS = [
    {
        "title": "AI & Machine Learning",
        "description": "Building production AI systems, from LangGraph agent architectures to retrieval-augmented generation pipelines.",
        "order": 0,
    },
    {
        "title": "Data Engineering",
        "description": "Designing data systems that scale, primarily in the Azure and Databricks ecosystem.",
        "order": 1,
    },
    {
        "title": "Education Technology",
        "description": "Creating tools that make education more accessible and effective through thoughtful AI integration.",
        "order": 2,
    },
    {
        "title": "Open Source",
        "description": "Contributing to and building tools that help other developers be more productive.",
        "order": 3,
    },
]


# ---------------------------------------------------------------------------
# Seed logic
# ---------------------------------------------------------------------------


async def seed():
    await init_db()

    async with get_db() as db:
        # --- Projects ---
        for proj_data in PROJECTS:
            existing = await db.execute(
                select(Project).where(Project.slug == proj_data["slug"])
            )
            if existing.scalar_one_or_none():
                print(f"  skip project: {proj_data['slug']} (exists)")
                continue
            project = Project(**proj_data)
            db.add(project)
            print(f"  seed project: {proj_data['slug']}")

        # --- Blog Posts ---
        for post_data in POSTS:
            existing = await db.execute(
                select(BlogPost).where(BlogPost.slug == post_data["slug"])
            )
            if existing.scalar_one_or_none():
                print(f"  skip post: {post_data['slug']} (exists)")
                continue
            content = _load_post_content(post_data["slug"])
            post = BlogPost(
                **post_data,
                content=content,
                reading_minutes=calculate_reading_minutes(content),
            )
            db.add(post)
            print(f"  seed post: {post_data['slug']}")

        # --- About ---
        existing_about = await db.execute(
            select(About).options(selectinload(About.work_areas))
        )
        about = existing_about.scalar_one_or_none()
        if about:
            print("  skip about (exists)")
        else:
            about = About(**ABOUT)
            db.add(about)
            await db.flush()
            for wa_data in WORK_AREAS:
                work_area = AboutWorkArea(about_id=about.id, **wa_data)
                db.add(work_area)
            print("  seed about + work areas")

    await close_db()
    print("\nDone.")


if __name__ == "__main__":
    print("Seeding content...")
    asyncio.run(seed())
