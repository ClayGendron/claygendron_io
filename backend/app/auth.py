import logging
import secrets
import time
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------------------------------------------------
# In-memory session store:  session_id -> {email, name, exp, ...}
# ---------------------------------------------------------------------------
_sessions: dict[str, dict] = {}
SESSION_COOKIE = "session_id"
SESSION_TTL = 2 * 3600  # 2 hours
OAUTH_STATE_COOKIE = "oauth_state"
OAUTH_STATE_TTL = 600  # 10 minutes — login flows shouldn't take longer

# ---------------------------------------------------------------------------
# JWKS cache for token validation
# ---------------------------------------------------------------------------
_jwks_cache: dict | None = None
_jwks_cache_time: float = 0
_JWKS_CACHE_TTL = 3600


async def _get_jwks() -> dict:
    global _jwks_cache, _jwks_cache_time
    if _jwks_cache and (time.time() - _jwks_cache_time) < _JWKS_CACHE_TTL:
        return _jwks_cache
    jwks_url = (
        f"https://login.microsoftonline.com/{settings.azure_tenant_id}"
        "/discovery/v2.0/keys"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_cache_time = time.time()
        return _jwks_cache


def _find_signing_key(jwks: dict, kid: str):
    for key_data in jwks.get("keys", []):
        if key_data["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key_data)
    raise HTTPException(status_code=401, detail="Signing key not found")


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

@router.get("/login")
async def login():
    """Redirect user to Microsoft login."""
    if not settings.azure_tenant_id or not settings.azure_client_id:
        raise HTTPException(status_code=503, detail="Auth not configured")

    state = secrets.token_urlsafe(32)
    params = urlencode({
        "client_id": settings.azure_client_id,
        "response_type": "code",
        "redirect_uri": settings.azure_redirect_uri,
        "response_mode": "query",
        "scope": "openid email profile",
        "prompt": "select_account",
        "state": state,
    })
    auth_url = (
        f"https://login.microsoftonline.com/{settings.azure_tenant_id}"
        f"/oauth2/v2.0/authorize?{params}"
    )
    redirect = RedirectResponse(auth_url)
    redirect.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
        max_age=OAUTH_STATE_TTL,
        path="/",
    )
    return redirect


@router.get("/callback")
async def callback(code: str, state: str, request: Request):
    """Exchange authorization code for tokens, create session."""
    expected_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if not expected_state or not secrets.compare_digest(expected_state, state):
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    token_url = (
        f"https://login.microsoftonline.com/{settings.azure_tenant_id}"
        "/oauth2/v2.0/token"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data={
            "client_id": settings.azure_client_id,
            "client_secret": settings.azure_client_secret,
            "code": code,
            "redirect_uri": settings.azure_redirect_uri,
            "grant_type": "authorization_code",
            "scope": "openid email profile",
        })

    if resp.status_code != 200:
        logger.error("Token exchange failed: %s", resp.text)
        raise HTTPException(status_code=401, detail="Authentication failed")

    token_data = resp.json()
    id_token = token_data.get("id_token")
    if not id_token:
        raise HTTPException(status_code=401, detail="No id_token returned")

    # Validate the id_token
    try:
        header = jwt.get_unverified_header(id_token)
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

    jwks = await _get_jwks()
    public_key = _find_signing_key(jwks, header["kid"])

    try:
        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=[settings.azure_client_id],
            issuer=[
                f"https://login.microsoftonline.com/{settings.azure_tenant_id}/v2.0",
                f"https://sts.windows.net/{settings.azure_tenant_id}/",
            ],
        )
    except jwt.PyJWTError as e:
        logger.debug("ID token validation failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    # Check allowed emails
    email = (
        payload.get("preferred_username")
        or payload.get("email")
        or payload.get("upn")
        or ""
    ).lower()

    allowed = {
        e.strip().lower()
        for e in settings.admin_allowed_emails.split(",")
        if e.strip()
    }
    if not allowed or email not in allowed:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create server-side session
    session_id = secrets.token_urlsafe(32)
    _sessions[session_id] = {
        "email": email,
        "name": payload.get("name", ""),
        "exp": time.time() + SESSION_TTL,
    }

    # Set HTTP-only cookie and redirect to admin
    redirect = RedirectResponse("/admin", status_code=302)
    redirect.set_cookie(
        key=SESSION_COOKIE,
        value=session_id,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
        max_age=SESSION_TTL,
        path="/",
    )
    redirect.delete_cookie(OAUTH_STATE_COOKIE, path="/")
    return redirect


@router.get("/me")
async def me(request: Request):
    """Return current user info or 401."""
    session = _get_session(request)
    return {"email": session["email"], "name": session["name"]}


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Destroy session and clear cookie."""
    session_id = request.cookies.get(SESSION_COOKIE)
    if session_id and session_id in _sessions:
        del _sessions[session_id]

    response = RedirectResponse("/admin", status_code=302)
    response.delete_cookie(SESSION_COOKIE, path="/")
    return response


# ---------------------------------------------------------------------------
# Dependency for protected routes
# ---------------------------------------------------------------------------

def _get_session(request: Request) -> dict:
    """Extract and validate session from cookie."""
    session_id = request.cookies.get(SESSION_COOKIE)
    if not session_id or session_id not in _sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = _sessions[session_id]
    if time.time() > session["exp"]:
        del _sessions[session_id]
        raise HTTPException(status_code=401, detail="Session expired")

    return session


async def verify_admin(request: Request) -> dict:
    """FastAPI dependency — verifies admin session cookie."""
    return _get_session(request)
