from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from .database import cache_collection


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


async def get_cache(key: str) -> Any | None:
    item = await cache_collection.find_one({"_id": key, "expiresAt": {"$gt": now_utc()}})
    if not item:
        return None
    return item.get("value")


async def set_cache(key: str, value: Any, ttl_seconds: int) -> None:
    await cache_collection.update_one(
        {"_id": key},
        {
            "$set": {
                "value": value,
                "expiresAt": now_utc() + timedelta(seconds=ttl_seconds),
                "updatedAt": now_utc(),
            }
        },
        upsert=True,
    )


async def clear_cache(prefix: str | None = None) -> int:
    filters = {"_id": {"$regex": f"^{prefix}"}} if prefix else {}
    result = await cache_collection.delete_many(filters)
    return result.deleted_count
