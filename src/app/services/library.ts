import { Manga } from "../data/mockData";

export type LibraryStatus = "reading" | "completed" | "bookmarked" | "plan";

export interface LibraryEntry {
  manga: Manga;
  status: LibraryStatus;
  progress: number;
  lastChapter?: string;
  updatedAt: string;
}

const STORAGE_KEY = "mangaverse.library.v1";
const EVENT_NAME = "mangaverse-library-change";

function emitChange() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function listenToLibraryChanges(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function readLibrary(): LibraryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as LibraryEntry[];
  } catch {
    return [];
  }
}

function writeLibrary(entries: LibraryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  emitChange();
}

export function getLibraryEntry(mangaId: string): LibraryEntry | undefined {
  return readLibrary().find((entry) => entry.manga.id === mangaId);
}

export function upsertLibraryEntry(
  manga: Manga,
  updates: Partial<Omit<LibraryEntry, "manga" | "updatedAt">>,
) {
  const entries = readLibrary();
  const existingIndex = entries.findIndex((entry) => entry.manga.id === manga.id);
  const existing = existingIndex >= 0 ? entries[existingIndex] : undefined;
  const next: LibraryEntry = {
    manga,
    status: updates.status ?? existing?.status ?? "bookmarked",
    progress: updates.progress ?? existing?.progress ?? 0,
    lastChapter: updates.lastChapter ?? existing?.lastChapter,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    entries[existingIndex] = next;
  } else {
    entries.unshift(next);
  }
  writeLibrary(entries);
}

export function removeLibraryEntry(mangaId: string) {
  writeLibrary(readLibrary().filter((entry) => entry.manga.id !== mangaId));
}

export function toggleBookmark(manga: Manga) {
  const existing = getLibraryEntry(manga.id);
  if (existing?.status === "bookmarked" && existing.progress === 0) {
    removeLibraryEntry(manga.id);
    return false;
  }
  upsertLibraryEntry(manga, { status: existing?.status === "reading" ? "reading" : "bookmarked" });
  return true;
}

export function recordReadingProgress(manga: Manga, chapterNumber: string | number, totalChapters?: number) {
  const chapter = Number(chapterNumber) || 1;
  const total = totalChapters && totalChapters > 0 ? totalChapters : manga.chapters;
  const progress = total > 0 ? Math.min(100, Math.round((chapter / total) * 100)) : 1;
  upsertLibraryEntry(manga, {
    status: progress >= 100 ? "completed" : "reading",
    progress,
    lastChapter: `Chapter ${chapterNumber}`,
  });
}
