from __future__ import annotations

from datetime import datetime
from typing import Any

import httpx

from .config import get_settings


settings = get_settings()


def _first_text(value: dict[str, str] | None, preferred: str = "en") -> str:
    if not value:
        return ""
    return value.get(preferred) or next(iter(value.values()), "")


def _relationship_id(item: dict[str, Any], rel_type: str) -> str | None:
    for rel in item.get("relationships", []):
        if rel.get("type") == rel_type:
            return rel.get("id")
    return None


def _cover_url(item: dict[str, Any]) -> str:
    manga_id = item["id"]
    for rel in item.get("relationships", []):
        if rel.get("type") == "cover_art":
            file_name = rel.get("attributes", {}).get("fileName")
            if file_name:
                return f"https://uploads.mangadex.org/covers/{manga_id}/{file_name}.512.jpg"
    return "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80"


def _status(status: str | None) -> str:
    return {
        "ongoing": "Ongoing",
        "completed": "Completed",
        "hiatus": "Hiatus",
        "cancelled": "Hiatus",
    }.get((status or "").lower(), "Ongoing")


def _content_type(tags: list[str]) -> str:
    lowered = {tag.lower() for tag in tags}
    if "long strip" in lowered or "web comic" in lowered:
        return "Webtoon"
    return "Manga"


def _year(date_text: str | None) -> int:
    if not date_text:
        return 0
    try:
        return datetime.fromisoformat(date_text.replace("Z", "+00:00")).year
    except ValueError:
        return 0


def normalize_manga(item: dict[str, Any], chapter_count: int = 0) -> dict[str, Any]:
    attrs = item.get("attributes", {})
    tags = [
        _first_text(tag.get("attributes", {}).get("name"))
        for tag in attrs.get("tags", [])
        if _first_text(tag.get("attributes", {}).get("name"))
    ]
    title = _first_text(attrs.get("title")) or "Untitled"
    manga_id = item["id"]

    return {
        "_id": manga_id,
        "title": title,
        "cover": _cover_url(item),
        "rating": 0,
        "chapters": chapter_count,
        "status": _status(attrs.get("status")),
        "type": _content_type(tags),
        "author": "Unknown",
        "genres": tags[:8],
        "synopsis": _first_text(attrs.get("description")),
        "views": "0",
        "releaseYear": _year(attrs.get("createdAt")),
        "source": "mangadex",
        "sourceUrl": f"https://mangadex.org/title/{manga_id}",
    }


def normalize_chapter(item: dict[str, Any], manga_id: str | None = None) -> dict[str, Any]:
    attrs = item.get("attributes", {})
    number = str(attrs.get("chapter") or "1")
    title = attrs.get("title") or f"Chapter {number}"
    published = attrs.get("publishAt") or attrs.get("createdAt")

    return {
        "_id": item["id"],
        "manga_id": manga_id or _relationship_id(item, "manga") or "",
        "number": number,
        "title": title,
        "releaseDate": datetime.fromisoformat(published.replace("Z", "+00:00")) if published else None,
        "read": False,
        "source": "mangadex",
    }


class MangaDexClient:
    def __init__(self) -> None:
        self.client = httpx.AsyncClient(
            base_url=settings.mangadex_api_base,
            headers={"User-Agent": "MangaReaderPlatform/1.0"},
            timeout=25,
        )

    async def close(self) -> None:
        await self.client.aclose()

    async def popular_manga(self, limit: int = 24) -> list[dict[str, Any]]:
        response = await self.client.get(
            "/manga",
            params=[
                ("limit", min(limit, 100)),
                ("availableTranslatedLanguage[]", "en"),
                ("includes[]", "cover_art"),
                ("contentRating[]", "safe"),
                ("contentRating[]", "suggestive"),
                ("order[followedCount]", "desc"),
            ],
        )
        response.raise_for_status()
        return [normalize_manga(item) for item in response.json().get("data", [])]

    async def search_manga(self, query: str, limit: int = 24) -> list[dict[str, Any]]:
        response = await self.client.get(
            "/manga",
            params=[
                ("title", query),
                ("limit", min(limit, 100)),
                ("availableTranslatedLanguage[]", "en"),
                ("includes[]", "cover_art"),
                ("contentRating[]", "safe"),
                ("contentRating[]", "suggestive"),
                ("order[relevance]", "desc"),
            ],
        )
        response.raise_for_status()
        return [normalize_manga(item) for item in response.json().get("data", [])]

    async def chapters(self, manga_id: str, limit: int = 100, order: str = "asc") -> list[dict[str, Any]]:
        response = await self.client.get(
            f"/manga/{manga_id}/feed",
            params=[
                ("limit", min(limit, 500)),
                ("translatedLanguage[]", "en"),
                ("contentRating[]", "safe"),
                ("contentRating[]", "suggestive"),
                ("order[chapter]", "desc" if order == "desc" else "asc"),
            ],
        )
        response.raise_for_status()
        seen: set[str] = set()
        chapters: list[dict[str, Any]] = []
        for item in response.json().get("data", []):
            chapter = normalize_chapter(item, manga_id)
            if chapter["number"] in seen:
                continue
            seen.add(chapter["number"])
            chapters.append(chapter)
        return chapters

    async def chapter_pages(self, chapter_id: str, quality: str = "data") -> list[str]:
        response = await self.client.get(f"/at-home/server/{chapter_id}")
        response.raise_for_status()
        payload = response.json()
        chapter = payload["chapter"]
        mode = "data-saver" if quality == "data-saver" else "data"
        files = chapter.get("dataSaver") if mode == "data-saver" else chapter.get("data")
        return [f"{payload['baseUrl']}/{mode}/{chapter['hash']}/{file_name}" for file_name in files or []]
