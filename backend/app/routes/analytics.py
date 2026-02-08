from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from user_agents import parse as parse_user_agent
from urllib.parse import urlparse

from sqlalchemy import select, update
from app.database import get_db, async_session_maker
from app.models import Session, PageView, Event
from app.config import get_settings

router = APIRouter(tags=["analytics"])
settings = get_settings()


class SessionStartRequest(BaseModel):
    referrer: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class SessionStartResponse(BaseModel):
    session_id: str


class PageViewRequest(BaseModel):
    session_id: str
    path: str
    title: Optional[str] = None
    referrer: Optional[str] = None


class PageViewResponse(BaseModel):
    page_view_id: str


class EventRequest(BaseModel):
    session_id: str
    page_view_id: Optional[str] = None
    event_type: str = Field(..., max_length=50)
    data: Optional[dict] = None


class UpdatePageViewRequest(BaseModel):
    time_on_page: Optional[int] = None
    scroll_depth: Optional[int] = Field(None, ge=0, le=100)


def extract_domain(url: Optional[str]) -> Optional[str]:
    """Extract domain from URL."""
    if not url:
        return None
    try:
        parsed = urlparse(url)
        return parsed.netloc or None
    except Exception:
        return None


def parse_ua(user_agent: str) -> dict:
    """Parse user agent string."""
    try:
        ua = parse_user_agent(user_agent)
        return {
            "device_type": "mobile" if ua.is_mobile else "tablet" if ua.is_tablet else "desktop",
            "browser": ua.browser.family,
            "browser_version": ua.browser.version_string,
            "os": ua.os.family,
            "os_version": ua.os.version_string,
        }
    except Exception:
        return {
            "device_type": "unknown",
            "browser": "unknown",
            "browser_version": "",
            "os": "unknown",
            "os_version": "",
        }


@router.post("/analytics/session", response_model=SessionStartResponse)
async def start_session(request: Request, body: SessionStartRequest):
    """Start a new analytics session."""
    if not settings.database_url or not async_session_maker:
        raise HTTPException(status_code=503, detail="Analytics not configured")

    user_agent = request.headers.get("user-agent", "")
    ua_info = parse_ua(user_agent)

    async with get_db() as db:
        session = Session(
            user_agent=user_agent[:500] if user_agent else None,
            device_type=ua_info["device_type"],
            browser=ua_info["browser"],
            browser_version=ua_info["browser_version"],
            os=ua_info["os"],
            os_version=ua_info["os_version"],
            referrer=body.referrer[:500] if body.referrer else None,
            referrer_domain=extract_domain(body.referrer),
            screen_width=body.screen_width,
            screen_height=body.screen_height,
            utm_source=body.utm_source,
            utm_medium=body.utm_medium,
            utm_campaign=body.utm_campaign,
        )
        db.add(session)
        await db.flush()

        return SessionStartResponse(session_id=str(session.id))


@router.post("/analytics/pageview", response_model=PageViewResponse)
async def track_page_view(body: PageViewRequest):
    """Track a page view."""
    if not settings.database_url or not async_session_maker:
        raise HTTPException(status_code=503, detail="Analytics not configured")

    try:
        session_id = UUID(body.session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    async with get_db() as db:
        # Verify session exists
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Update session last_seen
        await db.execute(
            update(Session)
            .where(Session.id == session_id)
            .values(last_seen_at=datetime.utcnow())
        )

        # Mark previous page views as not bounces (if user navigated)
        await db.execute(
            update(PageView)
            .where(PageView.session_id == session_id)
            .where(PageView.is_bounce == True)  # noqa: E712
            .values(is_bounce=False)
        )

        # Create page view
        page_view = PageView(
            session_id=session_id,
            path=body.path[:500],
            title=body.title[:200] if body.title else None,
            referrer=body.referrer[:500] if body.referrer else None,
        )
        db.add(page_view)
        await db.flush()

        return PageViewResponse(page_view_id=str(page_view.id))


@router.patch("/analytics/pageview/{page_view_id}")
async def update_page_view(page_view_id: str, body: UpdatePageViewRequest):
    """Update page view metrics (time on page, scroll depth)."""
    if not settings.database_url or not async_session_maker:
        raise HTTPException(status_code=503, detail="Analytics not configured")

    try:
        pv_id = UUID(page_view_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid page view ID")

    async with get_db() as db:
        updates = {}
        if body.time_on_page is not None:
            updates["time_on_page"] = body.time_on_page
        if body.scroll_depth is not None:
            updates["scroll_depth"] = body.scroll_depth

        if updates:
            await db.execute(
                update(PageView)
                .where(PageView.id == pv_id)
                .values(**updates)
            )

        return {"success": True}


@router.post("/analytics/event")
async def track_event(body: EventRequest):
    """Track a custom event."""
    if not settings.database_url or not async_session_maker:
        raise HTTPException(status_code=503, detail="Analytics not configured")

    try:
        session_id = UUID(body.session_id)
        page_view_id = UUID(body.page_view_id) if body.page_view_id else None
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    async with get_db() as db:
        event = Event(
            session_id=session_id,
            page_view_id=page_view_id,
            event_type=body.event_type,
            data=body.data or {},
        )
        db.add(event)

        # Update session last_seen
        await db.execute(
            update(Session)
            .where(Session.id == session_id)
            .values(last_seen_at=datetime.utcnow())
        )

        return {"success": True}


@router.post("/analytics/heartbeat")
async def heartbeat(session_id: str):
    """Keep session alive and update last_seen."""
    if not settings.database_url or not async_session_maker:
        return {"success": True}  # Silently succeed if not configured

    try:
        sid = UUID(session_id)
    except ValueError:
        return {"success": False}

    async with get_db() as db:
        await db.execute(
            update(Session)
            .where(Session.id == sid)
            .values(last_seen_at=datetime.utcnow())
        )

    return {"success": True}
