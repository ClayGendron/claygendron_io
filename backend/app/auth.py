import logging
import time

import httpx
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()
security = HTTPBearer()

# Cache JWKS keys in memory
_jwks_cache: dict | None = None
_jwks_cache_time: float = 0
_JWKS_CACHE_TTL = 3600  # 1 hour


async def _get_jwks() -> dict:
    """Fetch and cache Microsoft's JWKS for the configured tenant."""
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


def _find_signing_key(jwks: dict, kid: str) -> jwt.algorithms.RSAAlgorithm:
    """Find the signing key matching the token's kid header."""
    for key_data in jwks.get("keys", []):
        if key_data["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key_data)
    raise HTTPException(status_code=401, detail="Signing key not found")


async def verify_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify admin authentication via Microsoft Entra ID JWT or fallback secret."""
    token = credentials.credentials

    # Fallback: simple shared secret (only available in debug mode)
    if settings.debug and settings.admin_secret and token == settings.admin_secret:
        logger.warning("Admin authenticated via shared secret (debug mode)")
        return {"sub": "admin", "method": "secret"}

    # Microsoft Entra ID JWT validation
    if not settings.azure_tenant_id or not settings.azure_client_id:
        raise HTTPException(status_code=503, detail="Admin auth not configured")

    try:
        header = jwt.get_unverified_header(token)
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

    kid = header.get("kid")
    if not kid:
        raise HTTPException(status_code=401, detail="Invalid token")

    jwks = await _get_jwks()
    public_key = _find_signing_key(jwks, kid)

    # Accept both v1 and v2 issuer formats
    issuers = [
        f"https://login.microsoftonline.com/{settings.azure_tenant_id}/v2.0",
        f"https://sts.windows.net/{settings.azure_tenant_id}/",
    ]

    # Accept both bare client ID and api:// URI as audience
    audiences = [
        settings.azure_client_id,
        f"api://{settings.azure_client_id}",
    ]

    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=audiences,
            issuer=issuers,
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidAudienceError, jwt.InvalidIssuerError, jwt.PyJWTError) as e:
        logger.debug("JWT validation failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    # Restrict admin access to allowed users
    if settings.admin_allowed_emails:
        allowed = {e.strip().lower() for e in settings.admin_allowed_emails.split(",") if e.strip()}
        token_email = (
            payload.get("preferred_username")
            or payload.get("email")
            or payload.get("upn")
            or ""
        ).lower()
        if token_email not in allowed:
            raise HTTPException(status_code=403, detail="Not authorized")

    return payload
