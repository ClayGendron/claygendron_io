from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends

from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app import database
from app.models import (
    Project,
    BlogPost,
    About,
    AboutWorkArea,
    calculate_reading_minutes,
)
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListItem,
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    BlogPostListItem,
    AboutUpdate,
    AboutResponse,
    AboutWorkAreaCreate,
    AboutWorkAreaUpdate,
    AboutWorkAreaResponse,
    ReorderRequest,
)
from app.auth import verify_admin
from app.cache import content_cache

router = APIRouter(tags=["admin-content"], dependencies=[Depends(verify_admin)])


def _require_db():
    if not database.async_session_maker:
        raise HTTPException(status_code=503, detail="Database not configured")


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------


@router.get("/projects", response_model=list[ProjectListItem])
async def list_projects():
    """List all projects including drafts, ordered by order."""
    _require_db()
    async with get_db() as db:
        result = await db.execute(select(Project).order_by(Project.order))
        projects = result.scalars().all()
        return [ProjectListItem.model_validate(p) for p in projects]


@router.post("/projects", response_model=ProjectResponse, status_code=201)
async def create_project(body: ProjectCreate):
    """Create a new project."""
    _require_db()
    async with get_db() as db:
        # Check slug uniqueness
        existing = await db.execute(
            select(Project).where(Project.slug == body.slug)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Slug already exists")

        project = Project(**body.model_dump())
        db.add(project)
        await db.flush()
        await db.refresh(project)
        content_cache.invalidate_prefix("projects:")
        return ProjectResponse.model_validate(project)


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int):
    """Get a project by ID."""
    _require_db()
    async with get_db() as db:
        project = await db.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectResponse.model_validate(project)


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, body: ProjectUpdate):
    """Update a project."""
    _require_db()
    async with get_db() as db:
        project = await db.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        update_data = body.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            for key, value in update_data.items():
                setattr(project, key, value)
            await db.flush()
            await db.refresh(project)

        content_cache.invalidate_prefix("projects:")
        return ProjectResponse.model_validate(project)


@router.delete("/projects/{project_id}")
async def delete_project(project_id: int):
    """Delete a project."""
    _require_db()
    async with get_db() as db:
        project = await db.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        await db.delete(project)
        content_cache.invalidate_prefix("projects:")
        return {"deleted": True}


@router.patch("/projects/reorder")
async def reorder_projects(body: ReorderRequest):
    """Batch update project order values."""
    _require_db()
    async with get_db() as db:
        for item in body.items:
            project = await db.get(Project, item.id)
            if project:
                project.order = item.order
        content_cache.invalidate_prefix("projects:")
        return {"reordered": True}


# ---------------------------------------------------------------------------
# Blog Posts
# ---------------------------------------------------------------------------


@router.get("/posts", response_model=list[BlogPostListItem])
async def list_posts():
    """List all posts including drafts, ordered by date desc."""
    _require_db()
    async with get_db() as db:
        result = await db.execute(select(BlogPost).order_by(desc(BlogPost.date)))
        posts = result.scalars().all()
        return [BlogPostListItem.model_validate(p) for p in posts]


@router.post("/posts", response_model=BlogPostResponse, status_code=201)
async def create_post(body: BlogPostCreate):
    """Create a new blog post. Auto-calculates reading_minutes."""
    _require_db()
    async with get_db() as db:
        existing = await db.execute(
            select(BlogPost).where(BlogPost.slug == body.slug)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Slug already exists")

        data = body.model_dump()
        data["reading_minutes"] = calculate_reading_minutes(data.get("content") or "")
        post = BlogPost(**data)
        db.add(post)
        await db.flush()
        await db.refresh(post)
        content_cache.invalidate_prefix("posts:")
        return BlogPostResponse.model_validate(post)


@router.get("/posts/{post_id}", response_model=BlogPostResponse)
async def get_post(post_id: int):
    """Get a post by ID."""
    _require_db()
    async with get_db() as db:
        post = await db.get(BlogPost, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return BlogPostResponse.model_validate(post)


@router.put("/posts/{post_id}", response_model=BlogPostResponse)
async def update_post(post_id: int, body: BlogPostUpdate):
    """Update a blog post. Recalculates reading_minutes if content changed."""
    _require_db()
    async with get_db() as db:
        post = await db.get(BlogPost, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        update_data = body.model_dump(exclude_unset=True)
        if update_data:
            if "content" in update_data:
                update_data["reading_minutes"] = calculate_reading_minutes(
                    update_data["content"] or ""
                )
            update_data["updated_at"] = datetime.utcnow()
            for key, value in update_data.items():
                setattr(post, key, value)
            await db.flush()
            await db.refresh(post)

        content_cache.invalidate_prefix("posts:")
        return BlogPostResponse.model_validate(post)


@router.delete("/posts/{post_id}")
async def delete_post(post_id: int):
    """Delete a blog post."""
    _require_db()
    async with get_db() as db:
        post = await db.get(BlogPost, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        await db.delete(post)
        content_cache.invalidate_prefix("posts:")
        return {"deleted": True}


# ---------------------------------------------------------------------------
# About
# ---------------------------------------------------------------------------


@router.get("/about", response_model=AboutResponse)
async def get_about():
    """Get the about singleton with work areas."""
    _require_db()
    async with get_db() as db:
        result = await db.execute(
            select(About).options(selectinload(About.work_areas))
        )
        about = result.scalar_one_or_none()
        if not about:
            raise HTTPException(status_code=404, detail="About not found")
        return AboutResponse.model_validate(about)


@router.put("/about", response_model=AboutResponse)
async def upsert_about(body: AboutUpdate):
    """Upsert the about singleton."""
    _require_db()
    async with get_db() as db:
        result = await db.execute(
            select(About).options(selectinload(About.work_areas))
        )
        about = result.scalar_one_or_none()

        update_data = body.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        if about:
            for key, value in update_data.items():
                setattr(about, key, value)
        else:
            about = About(**update_data)
            db.add(about)

        await db.flush()
        await db.refresh(about)
        content_cache.invalidate("about")
        return AboutResponse.model_validate(about)


@router.post("/about/work-areas", response_model=AboutWorkAreaResponse, status_code=201)
async def create_work_area(body: AboutWorkAreaCreate):
    """Create a new work area under the about singleton."""
    _require_db()
    async with get_db() as db:
        result = await db.execute(select(About))
        about = result.scalar_one_or_none()
        if not about:
            raise HTTPException(status_code=404, detail="About not found — create it first")

        work_area = AboutWorkArea(about_id=about.id, **body.model_dump())
        db.add(work_area)
        await db.flush()
        await db.refresh(work_area)
        content_cache.invalidate("about")
        return AboutWorkAreaResponse.model_validate(work_area)


@router.put("/about/work-areas/{work_area_id}", response_model=AboutWorkAreaResponse)
async def update_work_area(work_area_id: int, body: AboutWorkAreaUpdate):
    """Update a work area."""
    _require_db()
    async with get_db() as db:
        work_area = await db.get(AboutWorkArea, work_area_id)
        if not work_area:
            raise HTTPException(status_code=404, detail="Work area not found")

        update_data = body.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(work_area, key, value)
        await db.flush()
        await db.refresh(work_area)
        content_cache.invalidate("about")
        return AboutWorkAreaResponse.model_validate(work_area)


@router.delete("/about/work-areas/{work_area_id}")
async def delete_work_area(work_area_id: int):
    """Delete a work area."""
    _require_db()
    async with get_db() as db:
        work_area = await db.get(AboutWorkArea, work_area_id)
        if not work_area:
            raise HTTPException(status_code=404, detail="Work area not found")
        await db.delete(work_area)
        content_cache.invalidate("about")
        return {"deleted": True}


@router.patch("/about/work-areas/reorder")
async def reorder_work_areas(body: ReorderRequest):
    """Batch reorder work areas."""
    _require_db()
    async with get_db() as db:
        for item in body.items:
            work_area = await db.get(AboutWorkArea, item.id)
            if work_area:
                work_area.order = item.order
        content_cache.invalidate("about")
        return {"reordered": True}
