import { Chapter, Manga } from "../data/mockData";

const env = import.meta.env as unknown as {
  VITE_API_URL?: string;
  DEV?: boolean;
};

function normalizeApiBase(url: string): string {
  const trimmed = url.trim().replace(/\/+$|\s+/g, "");
  const absoluteUrl = /^https?:\/\//i.test(trimmed) || trimmed.startsWith("//") || trimmed.startsWith("/")
    ? trimmed
    : `https://${trimmed}`;
  const cleanUrl = absoluteUrl.replace(/\/api$/, "");
  return `${cleanUrl}/api`;
}

export const BACKEND_CONFIGURED = Boolean(env.VITE_API_URL || env.DEV);
export const API_BASE = env.VITE_API_URL
  ? normalizeApiBase(env.VITE_API_URL)
  : env.DEV
  ? "http://localhost:8000/api"
  : "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchManga(limit = 48, source?: string): Promise<Manga[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (source) params.set("source", source);
  return request<Manga[]>(`/manga?${params.toString()}`);
}

export async function searchManga(query: string, limit = 48, source?: string): Promise<Manga[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (source) params.set("source", source);
  return request<Manga[]>(`/manga?${params.toString()}`);
}

export async function scrapeMangaByUrl(url: string, type: "Manga" | "Manhwa" | "Manhua" | "Webtoon" = "Manga"): Promise<Manga> {
  return request<Manga>(`/scrape/url`, {
    method: "POST",
    body: JSON.stringify({ url, type }),
  });
}

export async function syncManga(limit = 24, refreshChapters = false): Promise<Manga[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    refresh_chapters: String(refreshChapters),
  });
  return request<Manga[]>(`/scrape/all?${params.toString()}`, { method: "POST" });
}

export async function fetchMangaById(id: string): Promise<Manga> {
  return request<Manga>(`/manga/${id}`);
}

export async function fetchChapters(mangaId: string, order: "asc" | "desc" = "asc"): Promise<Chapter[]> {
  return request<Chapter[]>(`/manga/${mangaId}/chapters?order=${order}`);
}

export async function fetchChapterPages(
  mangaId: string,
  chapterNumber: string,
  quality: "data" | "data-saver" = "data",
): Promise<string[]> {
  const payload = await request<{ pages: string[] }>(
    `/manga/${mangaId}/chapters/${encodeURIComponent(chapterNumber)}/pages?quality=${quality}`,
  );
  return payload.pages;
}

export interface ImageSearchResult {
  source: string;
  confidence: number;
  manga: Manga;
  matchedFrom: "local" | "web";
}

export async function reverseImageSearch(image: File, limit = 8): Promise<ImageSearchResult[]> {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE}/image-search?limit=${limit}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image search failed: ${response.status}`);
  }

  return response.json() as Promise<ImageSearchResult[]>;
}
