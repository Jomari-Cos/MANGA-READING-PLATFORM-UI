from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import urljoin, urlparse

from playwright.async_api import AsyncBrowser, async_playwright

WEBTOON_DOMAINS = {
    "webtoons.com": "webtoons",
    "tapas.io": "tapas",
    "lezhin.com": "lezhin",
}


class PlaywrightScraper:
    def __init__(self) -> None:
        self.browser: AsyncBrowser | None = None
        self._playwright = None

    async def startup(self) -> None:
        if self.browser is not None:
            return
        self._playwright = await async_playwright().start()
        self.browser = await self._playwright.chromium.launch(headless=True)

    async def close(self) -> None:
        if self.browser is not None:
            await self.browser.close()
            self.browser = None
        if self._playwright is not None:
            await self._playwright.stop()
            self._playwright = None

    async def scrape_url(self, url: str, content_type: str = "Manga") -> dict[str, Any]:
        await self.startup()
        assert self.browser is not None

        page = await self.browser.new_page(user_agent="MangaReaderPlatform/1.0")
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(1000)
            html = await page.content()
            title = await self._metadata(page, ["og:title", "twitter:title", "title"])
            description = await self._metadata(page, ["og:description", "twitter:description", "description"])
            cover = await self._metadata(page, ["og:image", "twitter:image"])
            if not title:
                title = self._guess_title(url)
            parsed = urlparse(url)
            source = self._source_name(parsed.hostname or "")
            if source:
                content_type = "Webtoon"

            structured = self._parse_structured_data(html)
            author = structured.get("author") or "Unknown"
            genres = structured.get("genre") or []
            if isinstance(genres, str):
                genres = [genres]
            release_year = self._release_year(structured.get("datePublished"))
            chapters = self._extract_chapters(html, source or "web", url)
            last_chapter = chapters[-1]["number"] if chapters else None

            return {
                "_id": self._make_id(url, source),
                "title": title,
                "cover": cover,
                "rating": 0,
                "chapters": len(chapters),
                "status": "Ongoing",
                "type": content_type,
                "author": author,
                "genres": genres[:8],
                "synopsis": description,
                "views": "0",
                "releaseYear": release_year,
                "lastChapter": last_chapter,
                "source": source or "web",
                "sourceUrl": url,
                "chapters_data": chapters,
            }
        finally:
            await page.close()

    async def chapter_pages(self, chapter_url: str) -> list[str]:
        await self.startup()
        assert self.browser is not None

        page = await self.browser.new_page(user_agent="MangaReaderPlatform/1.0")
        try:
            await page.goto(chapter_url, wait_until="networkidle", timeout=30000)
            await self._scroll_page(page)
            image_urls = await self._extract_image_urls(page)
            if image_urls:
                return image_urls
            html = await page.content()
            return self._extract_images_from_html(html, chapter_url)
        finally:
            await page.close()

    async def _scroll_page(self, page: Any) -> None:
        for _ in range(3):
            await page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            await page.wait_for_timeout(500)

    async def _extract_image_urls(self, page: Any) -> list[str]:
        candidates = await page.evaluate(
            """
            () => Array.from(document.querySelectorAll('img'))
                .map(img => img.dataset.src || img.src || img.getAttribute('data-src') || img.getAttribute('data-original'))
                .filter(Boolean)
            """
        )
        return self._clean_image_urls(candidates, page.url)

    def _extract_images_from_html(self, html: str, base_url: str) -> list[str]:
        candidates = re.findall(r'<img[^>]+(?:src|data-src|data-original)=["\']([^"\']+)["\']', html, re.I)
        return self._clean_image_urls(candidates, base_url)

    def _clean_image_urls(self, urls: list[str], base_url: str) -> list[str]:
        seen: set[str] = set()
        images: list[str] = []
        for source in urls:
            absolute = urljoin(base_url, source)
            if absolute in seen:
                continue
            if not re.search(r"\.(jpe?g|png|webp|gif)(?:[?#].*)?$", absolute, re.I):
                continue
            if re.search(r"icon|logo|avatar|spinner|button|thumbnail|thumb|banner|gif", absolute, re.I):
                continue
            seen.add(absolute)
            images.append(absolute)
        return images

    async def _metadata(self, page: Any, keys: list[str]) -> str:
        for key in keys:
            if key == "title":
                title = await page.title()
                if title:
                    return title.strip()
                continue
            for selector in [f"meta[property='{key}']", f"meta[name='{key}']"]:
                try:
                    content = await page.get_attribute(selector, "content")
                except Exception:
                    content = None
                if content:
                    return content.strip()
        return ""

    def _parse_structured_data(self, html: str) -> dict[str, Any]:
        for match in re.finditer(r"<script[^>]+type=[\"']application/ld\+json[\"'][^>]*>(.*?)</script>", html, re.S | re.I):
            try:
                data = json.loads(match.group(1).strip())
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get("@type") in {"Series", "TVSeries", "WebSite", "CreativeWork"}:
                            return item
                if isinstance(data, dict):
                    return data
            except Exception:
                continue
        return {}

    def _guess_title(self, url: str) -> str:
        return url.rstrip("/").split("/")[-1].replace("-", " ").title()

    def _source_name(self, hostname: str) -> str:
        for key, value in WEBTOON_DOMAINS.items():
            if key in hostname:
                return value
        return ""

    def _make_id(self, url: str, source: str) -> str:
        if source:
            return f"{source}-{re.sub(r'[^a-zA-Z0-9_-]', '-', url)}"
        return f"scraped-{re.sub(r'[^a-zA-Z0-9_-]', '-', url)}"

    def _release_year(self, date_value: Any) -> int:
        if not date_value:
            return 0
        try:
            return int(str(date_value)[:4])
        except ValueError:
            return 0

    def _extract_chapters(self, html: str, source: str, url: str) -> list[dict[str, Any]]:
        links = re.findall(r"<a[^>]+href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", html, re.S | re.I)
        seen: set[str] = set()
        chapters: list[dict[str, Any]] = []
        for href, label in links:
            if href.lower().startswith("javascript:"):
                continue
            lower = href.lower() + label.lower()
            if "episode" not in lower and "chap" not in lower and "vol" not in lower:
                continue
            chapter_url = self._resolve_url(href, url)
            number = self._extract_number(href) or self._extract_number(label) or str(len(chapters) + 1)
            if number in seen:
                continue
            seen.add(number)
            title = self._clean_text(label) or f"Chapter {number}"
            chapters.append({
                "_id": self._chapter_id(chapter_url, source),
                "manga_id": self._make_id(url, source),
                "number": number,
                "title": title,
                "url": chapter_url,
                "releaseDate": None,
                "read": False,
                "source": source,
            })
            if len(chapters) >= 30:
                break
        return chapters

    def _resolve_url(self, href: str, base_url: str) -> str:
        return urljoin(base_url, href)

    def _chapter_id(self, chapter_url: str, source: str) -> str:
        return f"{source}-{re.sub(r'[^a-zA-Z0-9_-]', '-', chapter_url)}"

    def _extract_number(self, text: str) -> str | None:
        match = re.search(r"(?:chapter|chap|episode|ep|vol(?:ume)?)[^0-9]*([0-9]+(?:\.[0-9]+)?)", text, re.I)
        if match:
            return match.group(1)
        return None

    def _clean_text(self, text: str) -> str:
        return re.sub(r"<[^>]+>", "", text).strip()
