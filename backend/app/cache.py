import time
from typing import Any


class ContentCache:
    """Simple in-memory cache with TTL for content API responses."""

    def __init__(self, default_ttl: int = 300):
        self._store: dict[str, tuple[Any, float]] = {}
        self._default_ttl = default_ttl

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        expires_at = time.time() + (ttl if ttl is not None else self._default_ttl)
        self._store[key] = (value, expires_at)

    def invalidate(self, key: str) -> None:
        self._store.pop(key, None)

    def invalidate_prefix(self, prefix: str) -> None:
        keys_to_delete = [k for k in self._store if k.startswith(prefix)]
        for k in keys_to_delete:
            del self._store[k]

    def clear(self) -> None:
        self._store.clear()


content_cache = ContentCache()
