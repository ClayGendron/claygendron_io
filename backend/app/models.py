from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Boolean, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database import Base


class Session(Base):
    """Visitor session - one per browser session."""

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Device info
    user_agent = Column(String(500))
    device_type = Column(String(20))  # mobile, tablet, desktop
    browser = Column(String(50))
    browser_version = Column(String(20))
    os = Column(String(50))
    os_version = Column(String(20))

    # Location (optional, from IP)
    country = Column(String(2))  # ISO country code
    city = Column(String(100))

    # Source
    referrer = Column(String(500))
    referrer_domain = Column(String(100))
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(100))

    # Viewport
    screen_width = Column(Integer)
    screen_height = Column(Integer)

    # Relationships
    page_views = relationship("PageView", back_populates="session", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="session", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_sessions_started_at", "started_at"),
        Index("ix_sessions_referrer_domain", "referrer_domain"),
    )


class PageView(Base):
    """Individual page visit."""

    __tablename__ = "page_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)

    # Page info
    path = Column(String(500), nullable=False)
    title = Column(String(200))
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Engagement metrics (updated via events)
    time_on_page = Column(Integer, default=0)  # seconds
    scroll_depth = Column(Integer, default=0)  # percentage 0-100
    is_bounce = Column(Boolean, default=True)

    # Referrer for this specific page view
    referrer = Column(String(500))

    # Relationship
    session = relationship("Session", back_populates="page_views")
    events = relationship("Event", back_populates="page_view", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_page_views_session_id", "session_id"),
        Index("ix_page_views_path", "path"),
        Index("ix_page_views_timestamp", "timestamp"),
    )


class Event(Base):
    """Custom interaction events."""

    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    page_view_id = Column(UUID(as_uuid=True), ForeignKey("page_views.id"), nullable=True)

    # Event info
    event_type = Column(String(50), nullable=False)  # scroll, click, visibility, etc.
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Event data (flexible JSON)
    data = Column(JSON, default=dict)

    # Relationships
    session = relationship("Session", back_populates="events")
    page_view = relationship("PageView", back_populates="events")

    __table_args__ = (
        Index("ix_events_session_id", "session_id"),
        Index("ix_events_event_type", "event_type"),
        Index("ix_events_timestamp", "timestamp"),
    )
