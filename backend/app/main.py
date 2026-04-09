from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.database import init_db, close_db
from app.auth import router as auth_router
from app.limiter import limiter
from app.routes import analytics, admin, content, admin_content

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Startup
    if settings.database_url:
        await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title=settings.app_name,
    docs_url="/api/docs" if settings.debug else None,
    redoc_url="/api/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
_cors_origins = (
    ["http://localhost:8000", "http://localhost:8001"]
    if settings.debug
    else [settings.frontend_url]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include API routes
app.include_router(auth_router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(content.router, prefix="/api/content")
app.include_router(admin_content.router, prefix="/api/admin/content")


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "app": settings.app_name}


# Serve static frontend files in production
# The frontend build output should be in ../frontend/dist
FRONTEND_DIR = Path(__file__).parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIR.exists():
    # Serve static assets
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIR / "assets"),
        name="assets",
    )

    # Catch-all route for SPA - must be last
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index = FRONTEND_DIR / "index.html"
        try:
            file_path = (FRONTEND_DIR / full_path).resolve()
            file_path.relative_to(FRONTEND_DIR.resolve())
        except (ValueError, OSError):
            return FileResponse(index)

        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(index)
