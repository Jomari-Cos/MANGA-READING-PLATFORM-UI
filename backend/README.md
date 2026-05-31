# Manga Reader Backend

FastAPI backend for the manga reader UI. It imports public MangaDex metadata and chapter records into MongoDB, then resolves actual chapter page image URLs when the reader opens a chapter.

## Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
py -m uvicorn app.main:app --reload
```

Run MongoDB locally, or update `MONGODB_URI` in `.env`. This repo also includes a local MongoDB service:

```powershell
docker compose up -d mongo
```

## API

- `POST /api/scrape/mangadex?limit=24` incrementally imports popular MangaDex manga and readable chapters into MongoDB.
- `POST /api/scrape/anilist?limit=24` imports AniList manga/manhwa/manhua metadata into MongoDB.
- `POST /api/scrape/all?limit=24` imports from all configured sources.
- Add `refresh_chapters=true` to MangaDex/all sync only when you want to re-check chapters for existing titles. By default, sync updates existing manga metadata, adds new manga, and fetches chapters only for new or chapterless manga.
- `POST /api/scrape/url` imports Open Graph metadata from a public manga/manhua/webtoon page URL.
- `GET /api/manga` returns cached manga.
- `GET /api/manga?q=one%20piece` searches MangaDex and caches results.
- `GET /api/manga/{manga_id}/chapters?order=asc` returns cached/imported chapters from oldest to newest.
- `GET /api/manga/{manga_id}/chapters?order=desc` returns cached/imported chapters from newest to oldest.
- `GET /api/manga/{manga_id}/chapters/{chapter_number}/pages` returns actual page image URLs for reading.
- `POST /api/image-search` accepts an uploaded image and matches it against stored cover hashes.
- `DELETE /api/cache` clears all cached external API responses.
- `DELETE /api/cache?prefix=search` clears only search cache entries.

## Caching

MongoDB stores manga, chapters, cover hashes, and user-imported metadata permanently. The backend also uses a TTL cache collection for external responses:

- MangaDex text search: `SEARCH_CACHE_TTL_SECONDS`, default 1 hour.
- MangaDex chapter page URLs: `CHAPTER_PAGES_CACHE_TTL_SECONDS`, default 15 minutes.

Chapter page URLs are cached briefly because source CDN URLs can change. If results look stale during development, call `DELETE /api/cache`.

Image search is cover-hash based, so it works best with covers or close cover crops. For accurate random manga panel recognition, add a specialized provider such as SauceNAO or Google Vision and call it before falling back to local cover matching.
