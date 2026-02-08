from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from app.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    pass


# Create async engine
def get_database_url() -> str:
    """Convert standard postgres URL to async format."""
    url = settings.database_url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


engine = None
async_session_maker = None


async def init_db():
    """Initialize database connection and create tables."""
    global engine, async_session_maker

    if not settings.database_url:
        return

    engine = create_async_engine(
        get_database_url(),
        echo=settings.debug,
        pool_pre_ping=True,
    )

    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Create tables
    async with engine.begin() as conn:
        from app import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connection."""
    global engine
    if engine:
        await engine.dispose()


@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    if not async_session_maker:
        raise RuntimeError("Database not initialized")

    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
