from __future__ import annotations

from datetime import datetime
from hashlib import sha1
from typing import Any
from urllib.parse import parse_qs, urlparse
import json
import re

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


class WebtoonScraper:
    WEBTOON_DOMAINS = {
        "webtoons.com": "webtoons",
        "tapas.io": "tapas",
        "lezhin.com": "lezhin",
    }

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=25, headers={"User-Agent": "MangaReaderPlatform/1.0"})

    async def close(self) -> None:
        await self.client.aclose()

    async def scrape(self, url: str, content_type: str = "Manga") -> dict[str, Any]:
        parsed = urlparse(url)
        hostname = parsed.hostname or ""
        site = next((value for key, value in self.WEBTOON_DOMAINS.items() if key in hostname), "")
        if not site:
            return await OpenGraphScraper().scrape(url, content_type)

        response = await self.client.get(url)
        response.raise_for_status()
        html = response.text

        title = self._meta(html, "og:title", "twitter:title") or self._guess_title(url)
        description = self._meta(html, "og:description", "description", "twitter:description")
        cover = self._meta(html, "og:image", "twitter:image") or ""
        if site in {"webtoons", "tapas", "lezhin"}:
            content_type = "Webtoon"

        manga_id = self._series_id(site, parsed)
        chapters = self._extract_chapters(site, html, manga_id)
        last_chapter = chapters[-1]["number"] if chapters else None

        return {
            "_id": manga_id,
            "title": title,
            "cover": cover,
            "rating": 0,
            "chapters": len(chapters),
            "status": "Ongoing",
            "type": content_type,
            "author": "Unknown",
            "genres": [],
            "synopsis": description,
            "views": "0",
            "releaseYear": datetime.now().year,
            "lastChapter": last_chapter,
            "source": site,
            "sourceUrl": url,
            "chapters_data": chapters,
        }

    def _meta(self, html: str, *keys: str) -> str:
        lower = html.lower()
        for key in keys:
            patterns = [
                f'property="{key.lower()}"',
                f'name="{key.lower()}"',
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
                if quote not in '"\'':
                    continue
                start = content_index + 9
                end = html.find(quote, start)
                if end != -1:
                    return html[start:end].strip()
        return ""

    def _guess_title(self, url: str) -> str:
        return url.rstrip("/").split("/")[-1].replace("-", " ").title()

    def _series_id(self, site: str, parsed: Any) -> str:
        path_parts = [segment for segment in parsed.path.split("/") if segment]
        if site == "webtoons":
            title_no = parse_qs(parsed.query).get("title_no", [None])[0]
            if title_no:
                return f"webtoons-{title_no}"
            if len(path_parts) >= 2 and path_parts[-1] == "list":
                return f"webtoons-{path_parts[-2]}"
            return f"webtoons-{path_parts[-1] if path_parts else sha1(parsed.path.encode('utf-8')).hexdigest()[:12]}"
        if site == "tapas":
            if len(path_parts) >= 2 and path_parts[0] == "series":
                return f"tapas-{path_parts[1]}"
            return f"tapas-{path_parts[-1] if path_parts else sha1(parsed.path.encode('utf-8')).hexdigest()[:12]}"
        if site == "lezhin":
            if "comic" in path_parts:
                comic_index = path_parts.index("comic")
                if comic_index + 1 < len(path_parts):
                    return f"lezhin-{path_parts[comic_index + 1]}"
            return f"lezhin-{path_parts[-1] if path_parts else sha1(parsed.path.encode('utf-8')).hexdigest()[:12]}"
        return f"scraped-{sha1(url.encode('utf-8')).hexdigest()[:16]}"

    def _extract_chapters(self, site: str, html: str, manga_id: str) -> list[dict[str, Any]]:
        chapters: list[dict[str, Any]] = []
        data = self._find_json_data(html)
        if data:
            episode_list = self._search_for_keys(data, ["episodes", "episodeList", "episode_list", "items", "chapters"])
            if isinstance(episode_list, list):
                chapters = self._normalize_episodes(episode_list, manga_id, site)

        if not chapters:
            chapters = self._find_episode_links(html, manga_id, site)

        return chapters

    def _find_json_data(self, html: str) -> Any | None:
        match = re.search(r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>(.*?)</script>', html, re.S | re.I)
        if not match:
            return None
        try:
            return json.loads(match.group(1))
        except ValueError:
            return None

    def _search_for_keys(self, value: Any, keys: list[str]) -> Any | None:
        if isinstance(value, dict):
            for key, item in value.items():
                if key in keys:
                    return item
                found = self._search_for_keys(item, keys)
                if found is not None:
                    return found
        elif isinstance(value, list):
            for item in value:
                found = self._search_for_keys(item, keys)
                if found is not None:
                    return found
        return None

    def _normalize_episodes(self, items: list[Any], manga_id: str, source: str) -> list[dict[str, Any]]:
        chapters: list[dict[str, Any]] = []
        seen: set[str] = set()
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                continue
            number = str(item.get("episodeNo") or item.get("episodeNumber") or item.get("id") or item.get("episodeId") or item.get("seq") or index + 1)
            if number in seen:
                continue
            seen.add(number)
            title = item.get("title") or item.get("episodeTitle") or item.get("subTitle") or f"Chapter {number}"
            published = item.get("publishedAt") or item.get("createdAt") or item.get("uploadDate") or item.get("date")
            chapter_id = item.get("id") or item.get("episodeId") or f"{manga_id}-{number}"
            release_date = None
            if published:
                try:
                    release_date = datetime.fromisoformat(published.replace("Z", "+00:00"))
                except ValueError:
                    release_date = None
            chapters.append({
                "_id": f"{source}-{manga_id}-chapter-{chapter_id}",
                "manga_id": manga_id,
                "number": number,
                "title": title,
                "releaseDate": release_date,
                "read": False,
                "source": source,
            })
        return chapters

    def _find_episode_links(self, html: str, manga_id: str, source: str) -> list[dict[str, Any]]:
        anchors = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.S | re.I)
        chapters: list[dict[str, Any]] = []
        seen: set[str] = set()
        for href, label in anchors:
            if "episode" not in href and "chap" not in href and "list" not in href:
                continue
            title_text = re.sub(r'<[^>]+>', '', label).strip()
            number = str(len(chapters) + 1)
            if number in seen:
                continue
            seen.add(number)
            chapters.append({
                "_id": f"{source}-{manga_id}-chapter-{number}",
                "manga_id": manga_id,
                "number": number,
                "title": title_text or f"Chapter {number}",
                "releaseDate": None,
                "read": False,
                "source": source,
            })
        return chapters


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

    async def chapters(self, manga_id: str, limit: int = 100, order: str = "asc") -> list[dict[str, Any]]:
        numeric_id = manga_id.split("myanimelist-", 1)[-1] if manga_id.startswith("myanimelist-") else manga_id
        page = 1
        per_page = min(limit, 100)
        chapters: list[dict[str, Any]] = []
        seen: set[str] = set()

        while True:
            response = await self.client.get(
                f"{self.endpoint}/manga/{numeric_id}/chapters",
                params={"page": page, "limit": per_page},
            )
            response.raise_for_status()
            data = response.json().get("data", [])
            if not data:
                break

            for item in data:
                attrs = item.get("attributes", {})
                number = str(attrs.get("chapter") or attrs.get("chapter_number") or item.get("chapter") or "1")
                if number in seen:
                    continue
                seen.add(number)
                title = attrs.get("title") or f"Chapter {number}"
                published = attrs.get("published") or attrs.get("createdAt") or attrs.get("uploadedAt")
                chapter_id = item.get("id") or f"{numeric_id}-{number}"
                chapters.append({
                    "_id": f"myanimelist-{numeric_id}-chapter-{chapter_id}",
                    "manga_id": f"myanimelist-{numeric_id}",
                    "number": number,
                    "title": title,
                    "releaseDate": datetime.fromisoformat(published.replace("Z", "+00:00")) if published else None,
                    "read": False,
                    "source": "myanimelist",
                })

            if len(data) < per_page or len(chapters) >= limit:
                break
            page += 1

        if order == "desc":
            chapters.reverse()
        return chapters


class KitsuClient:
    """Basic Kitsu REST client for manga (https://kitsu.io/api).

    Provides a `popular` method returning normalized metadata.
    """

    endpoint = "https://kitsu.io/api/edge"

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=25)

    async def close(self) -> None:
        await self.client.aclose()

    async def chapters(self, manga_id: str, limit: int = 100, order: str = "asc") -> list[dict[str, Any]]:
        numeric_id = manga_id.split("kitsu-", 1)[-1] if manga_id.startswith("kitsu-") else manga_id
        page = 0
        per_page = min(limit, 20)
        chapters: list[dict[str, Any]] = []
        seen: set[str] = set()

        while len(chapters) < limit:
            response = await self.client.get(
                f"{self.endpoint}/manga/{numeric_id}/chapters",
                params={"page[limit]": per_page, "page[offset]": page * per_page},
            )
            response.raise_for_status()
            data = response.json().get("data", [])
            if not data:
                break

            for item in data:
                attrs = item.get("attributes", {})
                number = str(attrs.get("chapterNumber") or attrs.get("chapter") or item.get("chapter") or "1")
                if number in seen:
                    continue
                seen.add(number)
                title = attrs.get("title") or f"Chapter {number}"
                published = attrs.get("publishedAt") or attrs.get("createdAt")
                chapter_id = item.get("id") or f"{numeric_id}-{number}"
                chapters.append({
                    "_id": f"kitsu-{numeric_id}-chapter-{chapter_id}",
                    "manga_id": f"kitsu-{numeric_id}",
                    "number": number,
                    "title": title,
                    "releaseDate": datetime.fromisoformat(published.replace("Z", "+00:00")) if published else None,
                    "read": False,
                    "source": "kitsu",
                })
                if len(chapters) >= limit:
                    break

            if len(data) < per_page or len(chapters) >= limit:
                break
            page += 1

        if order == "desc":
            chapters.reverse()
        return chapters

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
