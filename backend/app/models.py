from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


MangaStatus = Literal["Ongoing", "Completed", "Hiatus"]
MangaType = Literal["Manga", "Manhwa", "Manhua", "Webtoon"]


class Manga(BaseModel):
    id: str = Field(alias="_id")
    title: str
    cover: str
    rating: float = 0
    chapters: int = 0
    status: MangaStatus = "Ongoing"
    type: MangaType = "Manga"
    author: str = "Unknown"
    genres: list[str] = []
    synopsis: str = ""
    views: str = "0"
    releaseYear: int = 0
    lastChapter: str | None = None
    source: str = "mangadex"
    sourceUrl: str | None = None
    coverHash: str | None = None

    class Config:
        populate_by_name = True


class Chapter(BaseModel):
    id: str = Field(alias="_id")
    manga_id: str
    number: str
    title: str
    url: str | None = None
    releaseDate: datetime | None = None
    read: bool = False
    source: str = "mangadex"

    class Config:
        populate_by_name = True


class ChapterPages(BaseModel):
    chapterId: str
    mangaId: str
    number: str
    pages: list[HttpUrl | str]


class ImageSearchResult(BaseModel):
    source: str
    confidence: float
    manga: Manga
    matchedFrom: Literal["local", "web"] = "local"


class ScrapeUrlRequest(BaseModel):
    url: HttpUrl
    type: MangaType = "Manga"
