from fastapi import APIRouter, HTTPException

from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app import database
from app.models import Project, BlogPost, About
from app.schemas import (
    ProjectListItem,
    ProjectResponse,
    BlogPostListItem,
    BlogPostResponse,
    AboutResponse,
)
from app.cache import content_cache

router = APIRouter(tags=["content"])


def _require_db():
    if not database.async_session_maker:
        raise HTTPException(status_code=503, detail="Database not configured")


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------


@router.get("/projects", response_model=list[ProjectListItem])
async def list_projects():
    """List published projects, ordered by pinned desc then order asc."""
    _require_db()

    cached = content_cache.get("projects:list")
    if cached is not None:
        return cached

    async with get_db() as db:
        result = await db.execute(
            select(Project)
            .where(Project.published == True)  # noqa: E712
            .order_by(desc(Project.pinned), Project.order)
        )
        projects = result.scalars().all()
        data = [ProjectListItem.model_validate(p) for p in projects]
        content_cache.set("projects:list", data)
        return data


@router.get("/projects/{slug}", response_model=ProjectResponse)
async def get_project(slug: str):
    """Get a single published project by slug."""
    _require_db()

    cache_key = f"projects:slug:{slug}"
    cached = content_cache.get(cache_key)
    if cached is not None:
        return cached

    async with get_db() as db:
        result = await db.execute(
            select(Project).where(Project.slug == slug, Project.published == True)  # noqa: E712
        )
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        data = ProjectResponse.model_validate(project)
        content_cache.set(cache_key, data)
        return data


# ---------------------------------------------------------------------------
# Blog Posts
# ---------------------------------------------------------------------------


@router.get("/posts", response_model=list[BlogPostListItem])
async def list_posts():
    """List published posts, ordered by date desc."""
    _require_db()

    cached = content_cache.get("posts:list")
    if cached is not None:
        return cached

    async with get_db() as db:
        result = await db.execute(
            select(BlogPost)
            .where(BlogPost.published == True)  # noqa: E712
            .order_by(desc(BlogPost.date))
        )
        posts = result.scalars().all()
        data = [BlogPostListItem.model_validate(p) for p in posts]
        content_cache.set("posts:list", data)
        return data


@router.get("/posts/{slug}", response_model=BlogPostResponse)
async def get_post(slug: str):
    """Get a single published post by slug."""
    _require_db()

    cache_key = f"posts:slug:{slug}"
    cached = content_cache.get(cache_key)
    if cached is not None:
        return cached

    async with get_db() as db:
        result = await db.execute(
            select(BlogPost).where(BlogPost.slug == slug, BlogPost.published == True)  # noqa: E712
        )
        post = result.scalar_one_or_none()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        data = BlogPostResponse.model_validate(post)
        content_cache.set(cache_key, data)
        return data


# ---------------------------------------------------------------------------
# About
# ---------------------------------------------------------------------------


@router.get("/about", response_model=AboutResponse)
async def get_about():
    """Get the about singleton with work areas."""
    _require_db()

    cached = content_cache.get("about")
    if cached is not None:
        return cached

    async with get_db() as db:
        result = await db.execute(
            select(About).options(selectinload(About.work_areas))
        )
        about = result.scalar_one_or_none()
        if not about:
            raise HTTPException(status_code=404, detail="About not found")
        data = AboutResponse.model_validate(about)
        content_cache.set("about", data)
        return data
