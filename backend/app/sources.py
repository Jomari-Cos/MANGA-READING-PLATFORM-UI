from __future__ import annotations

from datetime import datetime
from hashlib import sha1
from typing import Any

import httpx


def _status(status: str | None) -> str:
    return {
        "RELEASING": "Ongoing",
        "FINISHED": "Completed",
        "HIATUS": "Hiatus",
        "CANCELLED": "Hiatus",
    }.get((status or "").upper(), "Ongoing")


def _type(country: str | None, fmt: str | None) -> str:
    if country == "KR":
        return "Manhwa"
    if country == "CN":
        return "Manhua"
    if fmt == "ONE_SHOT":
        return "Manga"
    return "Manga"


class AniListClient:
    endpoint = "https://graphql.anilist.co"

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=25)

    async def close(self) -> None:
        await self.client.aclose()

    async def popular(self, limit: int = 24) -> list[dict[str, Any]]:
        query = """
        query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
              id
              title { romaji english native }
              description(asHtml: false)
              coverImage { large extraLarge }
              averageScore
              chapters
              status
              format
              countryOfOrigin
              genres
              startDate { year }
              siteUrl
              staff(sort: RELEVANCE, perPage: 1) {
                nodes { name { full } }
              }
            }
          }
        }
        """
        response = await self.client.post(self.endpoint, json={"query": query, "variables": {"page": 1, "perPage": min(limit, 50)}})
        response.raise_for_status()
        media = response.json().get("data", {}).get("Page", {}).get("media", [])
        return [self.normalize(item) for item in media]

    def normalize(self, item: dict[str, Any]) -> dict[str, Any]:
        title = item.get("title", {}).get("english") or item.get("title", {}).get("romaji") or item.get("title", {}).get("native") or "Untitled"
        author = "Unknown"
        staff = item.get("staff", {}).get("nodes", [])
        if staff:
            author = staff[0].get("name", {}).get("full") or author

        return {
            "_id": f"anilist-{item['id']}",
            "title": title,
            "cover": item.get("coverImage", {}).get("extraLarge") or item.get("coverImage", {}).get("large") or "",
            "rating": round((item.get("averageScore") or 0) / 10, 1),
            "chapters": item.get("chapters") or 0,
            "status": _status(item.get("status")),
            "type": _type(item.get("countryOfOrigin"), item.get("format")),
            "author": author,
            "genres": item.get("genres", [])[:8],
            "synopsis": item.get("description") or "",
            "views": "0",
            "releaseYear": item.get("startDate", {}).get("year") or 0,
            "source": "anilist",
            "sourceUrl": item.get("siteUrl"),
        }


class OpenGraphScraper:
    async def scrape(self, url: str, content_type: str = "Manga") -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=25, follow_redirects=True, headers={"User-Agent": "MangaReaderPlatform/1.0"}) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text

        def meta(*keys: str) -> str:
            lower = html.lower()
            for key in keys:
                patterns = [
                    f'property="{key.lower()}"',
                    f"name=\"{key.lower()}\"",
                    f"property='{key.lower()}'",
                    f"name='{key.lower()}'",
                ]
                for pattern in patterns:
                    index = lower.find(pattern)
                    if index == -1:
                        continue
                    content_index = lower.find("content=", index)
                    if content_index == -1:
                        continue
                    quote = html[content_index + 8]
                    if quote not in "\"'":
                        continue
                    start = content_index + 9
                    end = html.find(quote, start)
                    if end != -1:
                        return html[start:end].strip()
            return ""

        title = meta("og:title", "twitter:title") or url.rstrip("/").split("/")[-1].replace("-", " ").title()
        description = meta("og:description", "description", "twitter:description")
        cover = meta("og:image", "twitter:image")
        return {
            "_id": f"scraped-{sha1(url.encode('utf-8')).hexdigest()[:16]}",
            "title": title,
            "cover": cover,
            "rating": 0,
            "chapters": 0,
            "status": "Ongoing",
            "type": content_type,
            "author": "Unknown",
            "genres": [],
            "synopsis": description,
            "views": "0",
            "releaseYear": datetime.now().year,
            "source": "web",
            "sourceUrl": url,
        }


class JikanClient:
    """Simple MyAnimeList client using the Jikan REST API (https://jikan.moe/).

    Provides a `popular` method that returns normalized manga metadata.
    """

    endpoint = "https://api.jikan.moe/v4"

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=25)

    async def close(self) -> None:
        await self.client.aclose()

    async def popular(self, limit: int = 24) -> list[dict[str, Any]]:
        # Use the top manga endpoint and normalize results
        per_page = min(limit, 50)
        url = f"{self.endpoint}/top/manga?page=1&limit={per_page}"
        response = await self.client.get(url)
        response.raise_for_status()
        data = response.json().get("data", [])
        results: list[dict[str, Any]] = []
        for item in data[:limit]:
            attr = item.get("data") if isinstance(item, dict) and item.get("data") else item
            # Jikan v4 returns objects under `data` in some endpoints; be defensive
            title = (attr.get("title") or attr.get("title_japanese") or attr.get("title_english") or "Untitled")
            cover = (attr.get("images", {}).get("jpg", {}).get("large_image_url")
                     or attr.get("images", {}).get("jpg", {}).get("image_url")
                     or attr.get("image_url")
                     or "")
            authors = attr.get("authors") or []
            author = authors[0].get("name") if authors else "Unknown"
            status = _status(attr.get("status"))
            manga = {
                "_id": f"myanimelist-{attr.get('mal_id')}",
                "title": title,
                "cover": cover,
                "rating": round((attr.get("score") or 0) / 10, 1),
                "chapters": attr.get("chapters") or 0,
                "status": status,
                "type": _type(attr.get("published", {}).get("prop", {}).get("from", {}).get("country", None), attr.get("type")),
                "author": author,
                "genres": [g.get("name") for g in (attr.get("genres") or [])][:8],
                "synopsis": attr.get("synopsis") or "",
                "views": "0",
                "releaseYear": (attr.get("published", {}).get("from", {}) or {}).get("year") if isinstance(attr.get("published", {}), dict) else 0,
                "source": "myanimelist",
                "sourceUrl": attr.get("url") or attr.get("site_url"),
            }
            results.append(manga)
        return results


class KitsuClient:
    """Basic Kitsu REST client for manga (https://kitsu.io/api).

    Provides a `popular` method returning normalized metadata.
    """

    endpoint = "https://kitsu.io/api/edge"

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=25)

    async def close(self) -> None:
        await self.client.aclose()

    async def popular(self, limit: int = 24) -> list[dict[str, Any]]:
        per_page = min(limit, 20)
        url = f"{self.endpoint}/manga?page[limit]={per_page}&sort=-user_count"
        response = await self.client.get(url)
        response.raise_for_status()
        data = response.json().get("data", [])
        results: list[dict[str, Any]] = []
        for item in data[:limit]:
            attr = item.get("attributes", {})
            titles = attr.get("titles") or {}
            title = titles.get("en_jp") or titles.get("en") or attr.get("canonicalTitle") or "Untitled"
            cover = (attr.get("posterImage", {}) or {}).get("original") or (attr.get("posterImage", {}) or {}).get("large") or ""
            author = "Unknown"
            if attr.get("mangaType"):
                mtype = attr.get("mangaType")
            else:
                mtype = "MANGA"
            status = _status(attr.get("status"))
            manga = {
                "_id": f"kitsu-{item.get('id')}",
                "title": title,
                "cover": cover,
                "rating": round((float(attr.get("averageRating") or 0) or 0) / 10, 1),
                "chapters": attr.get("chapterCount") or 0,
                "status": status,
                "type": _type(attr.get("countryOfOrigin"), mtype),
                "author": author,
                "genres": [],
                "synopsis": attr.get("synopsis") or "",
                "views": "0",
                "releaseYear": (attr.get("startDate") or "")[:4] and int((attr.get("startDate") or "")[:4]) if attr.get("startDate") else 0,
                "source": "kitsu",
                "sourceUrl": f"https://kitsu.io/manga/{item.get('id')}",
            }
            results.append(manga)
        return results
