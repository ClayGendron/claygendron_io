import math
import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Index, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB


def calculate_reading_minutes(content: str) -> int:
    """Calculate estimated reading time from content word count."""
    return max(1, math.ceil(len(content.split()) / 200))


# ---------------------------------------------------------------------------
# Analytics Models
# ---------------------------------------------------------------------------


class Session(SQLModel, table=True):
    __tablename__ = "sessions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), primary_key=True),
    )
    started_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen_at: datetime = Field(default_factory=datetime.utcnow)

    # Device info
    user_agent: Optional[str] = Field(default=None, max_length=500)
    device_type: Optional[str] = Field(default=None, max_length=20)
    browser: Optional[str] = Field(default=None, max_length=50)
    browser_version: Optional[str] = Field(default=None, max_length=20)
    os: Optional[str] = Field(default=None, max_length=50)
    os_version: Optional[str] = Field(default=None, max_length=20)

    # Location
    country: Optional[str] = Field(default=None, max_length=2)
    city: Optional[str] = Field(default=None, max_length=100)

    # Source
    referrer: Optional[str] = Field(default=None, max_length=500)
    referrer_domain: Optional[str] = Field(default=None, max_length=100)
    utm_source: Optional[str] = Field(default=None, max_length=100)
    utm_medium: Optional[str] = Field(default=None, max_length=100)
    utm_campaign: Optional[str] = Field(default=None, max_length=100)

    # Viewport
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None

    # Relationships
    page_views: list["PageView"] = Relationship(
        back_populates="session",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    events: list["Event"] = Relationship(
        back_populates="session",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    __table_args__ = (
        Index("ix_sessions_started_at", "started_at"),
        Index("ix_sessions_referrer_domain", "referrer_domain"),
    )


class PageView(SQLModel, table=True):
    __tablename__ = "page_views"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), primary_key=True),
    )
    session_id: uuid.UUID = Field(
        sa_column=Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False),
    )

    # Page info
    path: str = Field(max_length=500)
    title: Optional[str] = Field(default=None, max_length=200)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Engagement metrics
    time_on_page: int = Field(default=0)
    scroll_depth: int = Field(default=0)
    is_bounce: bool = Field(default=True)

    # Referrer
    referrer: Optional[str] = Field(default=None, max_length=500)

    # Relationships
    session: Optional[Session] = Relationship(back_populates="page_views")
    events: list["Event"] = Relationship(
        back_populates="page_view",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    __table_args__ = (
        Index("ix_page_views_session_id", "session_id"),
        Index("ix_page_views_path", "path"),
        Index("ix_page_views_timestamp", "timestamp"),
    )


class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), primary_key=True),
    )
    session_id: uuid.UUID = Field(
        sa_column=Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False),
    )
    page_view_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(UUID(as_uuid=True), ForeignKey("page_views.id"), nullable=True),
    )

    # Event info
    event_type: str = Field(max_length=50)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Event data (flexible JSON)
    data: Optional[dict] = Field(default_factory=dict, sa_column=Column(JSON, default=dict))

    # Relationships
    session: Optional[Session] = Relationship(back_populates="events")
    page_view: Optional[PageView] = Relationship(back_populates="events")

    __table_args__ = (
        Index("ix_events_session_id", "session_id"),
        Index("ix_events_event_type", "event_type"),
        Index("ix_events_timestamp", "timestamp"),
    )


# ---------------------------------------------------------------------------
# Content Models
# ---------------------------------------------------------------------------


class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(sa_column=Column(String(200), unique=True, index=True, nullable=False))
    title: str = Field(max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=500)
    content: Optional[str] = Field(default=None, sa_column=Column(Text))
    date: Optional[datetime] = None
    pinned: bool = Field(default=False)
    published: bool = Field(default=False)
    order: int = Field(default=0)
    impacts: Optional[list[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    tags: Optional[list[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    tools: Optional[list[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    links: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        Index("ix_projects_published_order", "published", "order"),
    )


class BlogPost(SQLModel, table=True):
    __tablename__ = "blog_posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(sa_column=Column(String(200), unique=True, index=True, nullable=False))
    title: str = Field(max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=500)
    content: Optional[str] = Field(default=None, sa_column=Column(Text))
    date: datetime = Field(default_factory=datetime.utcnow)
    reading_minutes: int = Field(default=1)
    published: bool = Field(default=False)
    tags: Optional[list[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        Index("ix_blog_posts_published_date", "published", "date"),
    )


class About(SQLModel, table=True):
    __tablename__ = "about"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: Optional[str] = Field(default=None, max_length=200)
    introduction: Optional[str] = Field(default=None, sa_column=Column(Text))
    focus: Optional[str] = Field(default=None, max_length=200)
    interests: Optional[str] = Field(default=None, max_length=200)
    languages: Optional[str] = Field(default=None, max_length=200)
    location: Optional[str] = Field(default=None, max_length=200)
    current_title: Optional[str] = Field(default=None, max_length=200)
    current_employer: Optional[str] = Field(default=None, max_length=200)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    work_areas: list["AboutWorkArea"] = Relationship(
        back_populates="about",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "order_by": "AboutWorkArea.order",
        },
    )


class AboutWorkArea(SQLModel, table=True):
    __tablename__ = "about_work_areas"

    id: Optional[int] = Field(default=None, primary_key=True)
    about_id: int = Field(foreign_key="about.id")
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    order: int = Field(default=0)

    about: Optional[About] = Relationship(back_populates="work_areas")
