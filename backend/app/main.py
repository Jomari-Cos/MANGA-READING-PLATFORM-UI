from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pymongo import UpdateOne

from .cache import clear_cache, get_cache, set_cache
from .config import get_settings
from .database import chapter_collection, ensure_indexes, manga_collection
from .image_search import average_hash, confidence_from_distance, hamming_distance, hash_remote_image
from .mangadex import MangaDexClient
from .models import Chapter, ChapterPages, ImageSearchResult, Manga, ScrapeUrlRequest
from .sources import AniListClient, OpenGraphScraper, JikanClient, KitsuClient, WebtoonScraper


settings = get_settings()
app = FastAPI(title="Manga Reader API")
client = MangaDexClient()
anilist = AniListClient()
open_graph = OpenGraphScraper()
webtoon = WebtoonScraper()
jikan = JikanClient()
kitsu = KitsuClient()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await ensure_indexes()


@app.on_event("shutdown")
async def shutdown() -> None:
    await client.close()
    await anilist.close()
    await webtoon.close()
    await jikan.close()
    await kitsu.close()


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.delete("/api/cache")
async def delete_cache(prefix: str | None = None) -> dict[str, int]:
    deleted = await clear_cache(prefix)
    return {"deleted": deleted}


def _chapter_sort_key(chapter: dict) -> tuple[float, str]:
    try:
        return (float(chapter.get("number") or 0), chapter.get("_id", ""))
    except ValueError:
        return (0, chapter.get("number") or "")


async def _save_manga(manga: dict) -> dict:
    existing = await manga_collection.find_one({"_id": manga["_id"]})
    if existing and existing.get("coverHash") and not manga.get("coverHash"):
        manga["coverHash"] = existing["coverHash"]
    if manga.get("cover") and not manga.get("coverHash"):
        manga["coverHash"] = await hash_remote_image(manga["cover"])
    await manga_collection.update_one({"_id": manga["_id"]}, {"$set": manga}, upsert=True)
    return manga


async def _save_chapters(manga_id: str, chapters: list[dict]) -> None:
    if not chapters:
        return
    await chapter_collection.bulk_write(
        [
            UpdateOne(
                {"_id": chapter["_id"]},
                {"$set": chapter},
                upsert=True,
            )
            for chapter in chapters
        ],
        ordered=False,
    )
    ordered = sorted(chapters, key=_chapter_sort_key)
    await manga_collection.update_one(
        {"_id": manga_id},
        {"$set": {"chapters": len(ordered), "lastChapter": ordered[-1]["number"]}},
    )


@app.post("/api/scrape/mangadex", response_model=list[Manga], response_model_by_alias=False)
async def scrape_mangadex(
    limit: int = Query(default=24, ge=1, le=100),
    refresh_chapters: bool = Query(default=False),
) -> list[dict]:
    manga_items = await client.popular_manga(limit=limit)
    for manga in manga_items:
        existing = await manga_collection.find_one({"_id": manga["_id"]})
        existing_chapter_count = await chapter_collection.count_documents({"manga_id": manga["_id"]})

        should_fetch_chapters = refresh_chapters or not existing or existing_chapter_count == 0
        chapters = await client.chapters(manga["_id"], limit=500, order="asc") if should_fetch_chapters else []

        if chapters:
            ordered = sorted(chapters, key=_chapter_sort_key)
            manga["chapters"] = len(ordered)
            manga["lastChapter"] = ordered[-1]["number"]
        elif existing:
            manga["chapters"] = existing.get("chapters", existing_chapter_count)
            manga["lastChapter"] = existing.get("lastChapter")
        else:
            manga["chapters"] = 0
            manga["lastChapter"] = None

        await _save_manga(manga)
        if chapters:
            await _save_chapters(manga["_id"], chapters)
    return manga_items


@app.post("/api/scrape/anilist", response_model=list[Manga], response_model_by_alias=False)
async def scrape_anilist(limit: int = Query(default=24, ge=1, le=50)) -> list[dict]:
    manga_items = await anilist.popular(limit=limit)
    for manga in manga_items:
        await _save_manga(manga)
    return manga_items


@app.post("/api/scrape/myanimelist", response_model=list[Manga], response_model_by_alias=False)
async def scrape_myanimelist(limit: int = Query(default=24, ge=1, le=50)) -> list[dict]:
    manga_items = await jikan.popular(limit=limit)
    for manga in manga_items:
        await _save_manga(manga)
        try:
            chapters = await jikan.chapters(manga["_id"], limit=500, order="asc")
        except Exception:
            chapters = []
        if chapters:
            ordered = sorted(chapters, key=_chapter_sort_key)
            manga["chapters"] = len(ordered)
            manga["lastChapter"] = ordered[-1]["number"]
            await _save_chapters(manga["_id"], chapters)
    return manga_items


@app.post("/api/scrape/kitsu", response_model=list[Manga], response_model_by_alias=False)
async def scrape_kitsu(limit: int = Query(default=24, ge=1, le=50)) -> list[dict]:
    manga_items = await kitsu.popular(limit=limit)
    for manga in manga_items:
        await _save_manga(manga)
        try:
            chapters = await kitsu.chapters(manga["_id"], limit=500, order="asc")
        except Exception:
            chapters = []
        if chapters:
            ordered = sorted(chapters, key=_chapter_sort_key)
            manga["chapters"] = len(ordered)
            manga["lastChapter"] = ordered[-1]["number"]
            await _save_chapters(manga["_id"], chapters)
    return manga_items


@app.post("/api/scrape/all", response_model=list[Manga], response_model_by_alias=False)
async def scrape_all(
    limit: int = Query(default=24, ge=1, le=50),
    refresh_chapters: bool = Query(default=False),
) -> list[dict]:
    mangadex_items = await scrape_mangadex(limit=limit, refresh_chapters=refresh_chapters)
    anilist_items = await scrape_anilist(limit=limit)
    myanimelist_items = await scrape_myanimelist(limit=limit)
    kitsu_items = await scrape_kitsu(limit=limit)
    combined: dict[str, dict] = {}
    for manga in [*mangadex_items, *anilist_items, *myanimelist_items, *kitsu_items]:
        combined[manga["_id"]] = manga
    return list(combined.values())


@app.post("/api/scrape/url", response_model=Manga, response_model_by_alias=False)
async def scrape_url(payload: ScrapeUrlRequest) -> dict:
    manga = await webtoon.scrape(str(payload.url), payload.type)
    chapters = manga.pop("chapters_data", None)
    manga = await _save_manga(manga)
    if chapters:
        await _save_chapters(manga["_id"], chapters)
    return manga


@app.get("/api/manga", response_model=list[Manga], response_model_by_alias=False)
async def list_manga(
    q: str | None = None,
    type: str | None = None,
    source: str | None = None,
    limit: int = Query(default=48, ge=1, le=100),
) -> list[dict]:
    if q:
        cache_key = f"search:mangadex:{q.lower().strip()}:{limit}"
        cached = await get_cache(cache_key)
        results = cached if cached is not None else await client.search_manga(q, limit=limit)
        if cached is None:
            await set_cache(cache_key, results, settings.search_cache_ttl_seconds)
        for manga in results:
            existing = await manga_collection.find_one({"_id": manga["_id"]})
            if existing:
                manga["chapters"] = existing.get("chapters", manga["chapters"])
                manga["lastChapter"] = existing.get("lastChapter")
            await _save_manga(manga)
        return results

    filters = {}
    if type:
        filters["type"] = type
    if source:
        filters["source"] = source
    docs = await manga_collection.find(filters).sort("title", 1).limit(limit).to_list(length=limit)
    return docs


@app.get("/api/manga/{manga_id}", response_model=Manga, response_model_by_alias=False)
async def get_manga(manga_id: str) -> dict:
    manga = await manga_collection.find_one({"_id": manga_id})
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found. Search or sync it first.")
    return manga


@app.get("/api/manga/{manga_id}/chapters", response_model=list[Chapter], response_model_by_alias=False)
async def get_chapters(
    manga_id: str,
    order: str = Query(default="asc", pattern="^(asc|desc)$"),
) -> list[dict]:
    chapters = await chapter_collection.find({"manga_id": manga_id}).to_list(length=500)
    if chapters:
        return sorted(chapters, key=_chapter_sort_key, reverse=order == "desc")

    manga = await manga_collection.find_one({"_id": manga_id})
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found")
    if manga.get("source") != "mangadex":
        return []

    chapters = await client.chapters(manga_id, limit=500, order=order)
    if chapters:
        await _save_chapters(manga_id, chapters)
    return sorted(chapters, key=_chapter_sort_key, reverse=order == "desc")


@app.get("/api/manga/{manga_id}/chapters/{chapter_number}/pages", response_model=ChapterPages, response_model_by_alias=False)
async def get_chapter_pages(
    manga_id: str,
    chapter_number: str,
    quality: str = Query(default="data", pattern="^(data|data-saver)$"),
) -> dict:
    chapter = await chapter_collection.find_one({"manga_id": manga_id, "number": chapter_number})
    if not chapter:
        chapters = await get_chapters(manga_id, order="asc")
        chapter = next((item for item in chapters if item["number"] == chapter_number), None)
    if not chapter:
        raise HTTPException(status_code=404, detail="Readable chapter pages are not available for this source")

    cache_key = f"chapter-pages:{chapter['_id']}:{quality}"
    pages = await get_cache(cache_key)
    if pages is None:
        pages = await client.chapter_pages(chapter["_id"], quality=quality)
        await set_cache(cache_key, pages, settings.chapter_pages_cache_ttl_seconds)
    return {
        "chapterId": chapter["_id"],
        "mangaId": manga_id,
        "number": chapter["number"],
        "pages": pages,
    }


@app.post("/api/image-search", response_model=list[ImageSearchResult], response_model_by_alias=False)
async def image_search(image: UploadFile = File(...), limit: int = Query(default=8, ge=1, le=20)) -> list[dict]:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file")

    uploaded_hash = average_hash(await image.read())
    candidates = await manga_collection.find({"cover": {"$ne": ""}}).limit(200).to_list(length=200)
    results = []

    for manga in candidates:
        cover_hash = manga.get("coverHash")
        if not cover_hash:
            cover_hash = await hash_remote_image(manga["cover"])
            if cover_hash:
                await manga_collection.update_one({"_id": manga["_id"]}, {"$set": {"coverHash": cover_hash}})
        if not cover_hash:
            continue

        distance = hamming_distance(uploaded_hash, cover_hash)
        confidence = confidence_from_distance(distance)
        if confidence < 0.58:
            continue
        results.append(
            {
                "source": manga.get("source", "database"),
                "confidence": round(confidence, 3),
                "manga": manga,
                "matchedFrom": "local",
            }
        )

    return sorted(results, key=lambda item: item["confidence"], reverse=True)[:limit]
