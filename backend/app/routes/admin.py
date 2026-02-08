from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy import select, func, desc, Integer, case
from sqlalchemy.orm import selectinload
from app.database import get_db, async_session_maker
from app.models import Session, PageView, Event
from app.config import get_settings

router = APIRouter(tags=["admin"])
settings = get_settings()
security = HTTPBearer()


async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin authentication."""
    if not settings.admin_secret:
        raise HTTPException(status_code=503, detail="Admin not configured")
    if credentials.credentials != settings.admin_secret:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return True


class OverviewStats(BaseModel):
    total_sessions: int
    total_page_views: int
    unique_visitors_today: int
    page_views_today: int
    avg_time_on_page: float
    avg_scroll_depth: float
    bounce_rate: float
    top_pages: list[dict]
    top_referrers: list[dict]
    device_breakdown: dict


class SessionDetail(BaseModel):
    id: str
    started_at: datetime
    last_seen_at: datetime
    device_type: Optional[str]
    browser: Optional[str]
    os: Optional[str]
    referrer_domain: Optional[str]
    country: Optional[str]
    page_view_count: int
    total_time: int


class PageViewDetail(BaseModel):
    id: str
    path: str
    title: Optional[str]
    timestamp: datetime
    time_on_page: int
    scroll_depth: int
    is_bounce: bool


@router.get("/overview", response_model=OverviewStats)
async def get_overview(
    days: int = Query(default=7, ge=1, le=90),
    _: bool = Depends(verify_admin),
):
    """Get analytics overview."""
    if not async_session_maker:
        raise HTTPException(status_code=503, detail="Database not configured")

    start_date = datetime.utcnow() - timedelta(days=days)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    async with get_db() as db:
        # Total sessions
        total_sessions = await db.scalar(
            select(func.count(Session.id)).where(Session.started_at >= start_date)
        )

        # Total page views
        total_page_views = await db.scalar(
            select(func.count(PageView.id)).where(PageView.timestamp >= start_date)
        )

        # Today's stats
        unique_visitors_today = await db.scalar(
            select(func.count(Session.id)).where(Session.started_at >= today_start)
        )
        page_views_today = await db.scalar(
            select(func.count(PageView.id)).where(PageView.timestamp >= today_start)
        )

        # Averages
        avg_time = await db.scalar(
            select(func.avg(PageView.time_on_page)).where(
                PageView.timestamp >= start_date,
                PageView.time_on_page > 0,
            )
        )
        avg_scroll = await db.scalar(
            select(func.avg(PageView.scroll_depth)).where(
                PageView.timestamp >= start_date,
                PageView.scroll_depth > 0,
            )
        )

        # Bounce rate
        total_pv = await db.scalar(
            select(func.count(PageView.id)).where(PageView.timestamp >= start_date)
        )
        bounce_pv = await db.scalar(
            select(func.count(PageView.id)).where(
                PageView.timestamp >= start_date,
                PageView.is_bounce == True,  # noqa: E712
            )
        )
        bounce_rate = (bounce_pv / total_pv * 100) if total_pv > 0 else 0

        # Top pages
        top_pages_result = await db.execute(
            select(PageView.path, func.count(PageView.id).label("views"))
            .where(PageView.timestamp >= start_date)
            .group_by(PageView.path)
            .order_by(desc("views"))
            .limit(10)
        )
        top_pages = [{"path": r[0], "views": r[1]} for r in top_pages_result.all()]

        # Top referrers
        top_referrers_result = await db.execute(
            select(Session.referrer_domain, func.count(Session.id).label("count"))
            .where(
                Session.started_at >= start_date,
                Session.referrer_domain.isnot(None),
            )
            .group_by(Session.referrer_domain)
            .order_by(desc("count"))
            .limit(10)
        )
        top_referrers = [{"domain": r[0], "count": r[1]} for r in top_referrers_result.all()]

        # Device breakdown
        device_result = await db.execute(
            select(Session.device_type, func.count(Session.id).label("count"))
            .where(Session.started_at >= start_date)
            .group_by(Session.device_type)
        )
        device_breakdown = {r[0] or "unknown": r[1] for r in device_result.all()}

        return OverviewStats(
            total_sessions=total_sessions or 0,
            total_page_views=total_page_views or 0,
            unique_visitors_today=unique_visitors_today or 0,
            page_views_today=page_views_today or 0,
            avg_time_on_page=round(avg_time or 0, 1),
            avg_scroll_depth=round(avg_scroll or 0, 1),
            bounce_rate=round(bounce_rate, 1),
            top_pages=top_pages,
            top_referrers=top_referrers,
            device_breakdown=device_breakdown,
        )


@router.get("/sessions")
async def list_sessions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    _: bool = Depends(verify_admin),
):
    """List recent sessions."""
    if not async_session_maker:
        raise HTTPException(status_code=503, detail="Database not configured")

    offset = (page - 1) * limit

    async with get_db() as db:
        # Get total count
        total = await db.scalar(select(func.count(Session.id)))

        # Get sessions with page view count
        result = await db.execute(
            select(
                Session,
                func.count(PageView.id).label("pv_count"),
                func.sum(PageView.time_on_page).label("total_time"),
            )
            .outerjoin(PageView)
            .group_by(Session.id)
            .order_by(desc(Session.started_at))
            .offset(offset)
            .limit(limit)
        )

        sessions = []
        for row in result.all():
            session = row[0]
            sessions.append(
                SessionDetail(
                    id=str(session.id),
                    started_at=session.started_at,
                    last_seen_at=session.last_seen_at,
                    device_type=session.device_type,
                    browser=session.browser,
                    os=session.os,
                    referrer_domain=session.referrer_domain,
                    country=session.country,
                    page_view_count=row[1] or 0,
                    total_time=row[2] or 0,
                )
            )

        return {
            "sessions": sessions,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if total else 0,
        }


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    _: bool = Depends(verify_admin),
):
    """Get session details with page views."""
    if not async_session_maker:
        raise HTTPException(status_code=503, detail="Database not configured")

    try:
        sid = UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    async with get_db() as db:
        result = await db.execute(
            select(Session)
            .options(selectinload(Session.page_views))
            .where(Session.id == sid)
        )
        session = result.scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        page_views = [
            PageViewDetail(
                id=str(pv.id),
                path=pv.path,
                title=pv.title,
                timestamp=pv.timestamp,
                time_on_page=pv.time_on_page,
                scroll_depth=pv.scroll_depth,
                is_bounce=pv.is_bounce,
            )
            for pv in sorted(session.page_views, key=lambda x: x.timestamp)
        ]

        return {
            "session": {
                "id": str(session.id),
                "started_at": session.started_at,
                "last_seen_at": session.last_seen_at,
                "user_agent": session.user_agent,
                "device_type": session.device_type,
                "browser": session.browser,
                "browser_version": session.browser_version,
                "os": session.os,
                "os_version": session.os_version,
                "referrer": session.referrer,
                "referrer_domain": session.referrer_domain,
                "screen_width": session.screen_width,
                "screen_height": session.screen_height,
                "utm_source": session.utm_source,
                "utm_medium": session.utm_medium,
                "utm_campaign": session.utm_campaign,
            },
            "page_views": page_views,
        }


@router.get("/pageviews/by-path")
async def get_pageviews_by_path(
    days: int = Query(default=7, ge=1, le=90),
    _: bool = Depends(verify_admin),
):
    """Get page views grouped by path."""
    if not async_session_maker:
        raise HTTPException(status_code=503, detail="Database not configured")

    start_date = datetime.utcnow() - timedelta(days=days)

    async with get_db() as db:
        result = await db.execute(
            select(
                PageView.path,
                func.count(PageView.id).label("views"),
                func.avg(PageView.time_on_page).label("avg_time"),
                func.avg(PageView.scroll_depth).label("avg_scroll"),
                func.sum(PageView.is_bounce.cast(Integer)).label("bounces"),  # noqa: F821
            )
            .where(PageView.timestamp >= start_date)
            .group_by(PageView.path)
            .order_by(desc("views"))
        )

        pages = []
        for row in result.all():
            views = row[1]
            bounces = row[4] or 0
            pages.append({
                "path": row[0],
                "views": views,
                "avg_time_on_page": round(row[2] or 0, 1),
                "avg_scroll_depth": round(row[3] or 0, 1),
                "bounce_rate": round(bounces / views * 100, 1) if views > 0 else 0,
            })

        return {"pages": pages}


@router.get("/daily-stats")
async def get_daily_stats(
    days: int = Query(default=30, ge=1, le=90),
    _: bool = Depends(verify_admin),
):
    """Get daily visitor and page view counts."""
    if not async_session_maker:
        raise HTTPException(status_code=503, detail="Database not configured")

    start_date = datetime.utcnow() - timedelta(days=days)

    async with get_db() as db:
        # Sessions per day
        sessions_result = await db.execute(
            select(
                func.date(Session.started_at).label("date"),
                func.count(Session.id).label("sessions"),
            )
            .where(Session.started_at >= start_date)
            .group_by(func.date(Session.started_at))
            .order_by("date")
        )

        # Page views per day
        pv_result = await db.execute(
            select(
                func.date(PageView.timestamp).label("date"),
                func.count(PageView.id).label("page_views"),
            )
            .where(PageView.timestamp >= start_date)
            .group_by(func.date(PageView.timestamp))
            .order_by("date")
        )

        sessions_by_date = {str(r[0]): r[1] for r in sessions_result.all()}
        pv_by_date = {str(r[0]): r[1] for r in pv_result.all()}

        # Merge into daily stats
        all_dates = set(sessions_by_date.keys()) | set(pv_by_date.keys())
        daily_stats = [
            {
                "date": date,
                "sessions": sessions_by_date.get(date, 0),
                "page_views": pv_by_date.get(date, 0),
            }
            for date in sorted(all_dates)
        ]

        return {"daily_stats": daily_stats}
