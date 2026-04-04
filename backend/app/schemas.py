import re
from datetime import datetime
from typing import Optional

from pydantic import field_validator
from sqlmodel import SQLModel, Field

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _strip_tz(v: datetime | None) -> datetime | None:
    """Strip timezone info so naive datetimes match TIMESTAMP WITHOUT TIME ZONE columns."""
    if v is not None and v.tzinfo is not None:
        return v.replace(tzinfo=None)
    return v


def _validate_slug(v: str) -> str:
    if not SLUG_PATTERN.match(v):
        raise ValueError("Slug must be lowercase alphanumeric with hyphens")
    return v


# ---------------------------------------------------------------------------
# Project Schemas
# ---------------------------------------------------------------------------


class ProjectCreate(SQLModel):
    slug: str = Field(max_length=200)
    title: str = Field(max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=500)
    content: Optional[str] = None
    date: Optional[datetime] = None
    pinned: bool = False
    published: bool = False
    order: int = 0
    impacts: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    tools: Optional[list[str]] = None
    links: Optional[dict] = None

    _slug = field_validator("slug")(_validate_slug)
    _date = field_validator("date")(_strip_tz)


class ProjectUpdate(SQLModel):
    slug: Optional[str] = Field(default=None, max_length=200)
    title: Optional[str] = Field(default=None, max_length=200)
    subtitle: Optional[str] = None
    content: Optional[str] = None
    date: Optional[datetime] = None
    pinned: Optional[bool] = None
    published: Optional[bool] = None
    order: Optional[int] = None
    impacts: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    tools: Optional[list[str]] = None
    links: Optional[dict] = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return _validate_slug(v)
        return v

    _date = field_validator("date")(_strip_tz)


class ProjectListItem(SQLModel):
    id: int
    slug: str
    title: str
    subtitle: Optional[str] = None
    date: Optional[datetime] = None
    pinned: bool
    published: bool
    order: int
    impacts: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    tools: Optional[list[str]] = None
    links: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class ProjectResponse(ProjectListItem):
    content: Optional[str] = None


# ---------------------------------------------------------------------------
# BlogPost Schemas
# ---------------------------------------------------------------------------


class BlogPostCreate(SQLModel):
    slug: str = Field(max_length=200)
    title: str = Field(max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=500)
    content: Optional[str] = None
    date: datetime
    published: bool = False
    tags: Optional[list[str]] = None

    _slug = field_validator("slug")(_validate_slug)
    _date = field_validator("date")(_strip_tz)


class BlogPostUpdate(SQLModel):
    slug: Optional[str] = Field(default=None, max_length=200)
    title: Optional[str] = Field(default=None, max_length=200)
    subtitle: Optional[str] = None
    content: Optional[str] = None
    date: Optional[datetime] = None
    published: Optional[bool] = None
    tags: Optional[list[str]] = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return _validate_slug(v)
        return v

    _date = field_validator("date")(_strip_tz)


class BlogPostListItem(SQLModel):
    id: int
    slug: str
    title: str
    subtitle: Optional[str] = None
    date: datetime
    reading_minutes: int
    published: bool
    tags: Optional[list[str]] = None
    created_at: datetime
    updated_at: datetime


class BlogPostResponse(BlogPostListItem):
    content: Optional[str] = None


# ---------------------------------------------------------------------------
# About Schemas
# ---------------------------------------------------------------------------


class AboutWorkAreaCreate(SQLModel):
    title: str = Field(max_length=200)
    description: Optional[str] = None
    order: int = 0


class AboutWorkAreaUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = None
    order: Optional[int] = None


class AboutWorkAreaResponse(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    order: int


class AboutUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=200)
    introduction: Optional[str] = None
    focus: Optional[str] = Field(default=None, max_length=200)
    interests: Optional[str] = Field(default=None, max_length=200)
    languages: Optional[str] = Field(default=None, max_length=200)
    location: Optional[str] = Field(default=None, max_length=200)
    current_title: Optional[str] = Field(default=None, max_length=200)
    current_employer: Optional[str] = Field(default=None, max_length=200)


class AboutResponse(SQLModel):
    id: int
    title: Optional[str] = None
    introduction: Optional[str] = None
    focus: Optional[str] = None
    interests: Optional[str] = None
    languages: Optional[str] = None
    location: Optional[str] = None
    current_title: Optional[str] = None
    current_employer: Optional[str] = None
    updated_at: datetime
    work_areas: list[AboutWorkAreaResponse] = []


# ---------------------------------------------------------------------------
# Shared Schemas
# ---------------------------------------------------------------------------


class ReorderItem(SQLModel):
    id: int
    order: int


class ReorderRequest(SQLModel):
    items: list[ReorderItem]
