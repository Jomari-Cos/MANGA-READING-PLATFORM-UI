import { HeroCarousel } from "../components/HeroCarousel";
import { ContentRow } from "../components/ContentRow";
import { featuredManga, trendingManga, popularManga, newReleases, genres, Manga } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchManga, syncManga, BACKEND_CONFIGURED } from "../services/api";

const fallbackManga = [...featuredManga, ...trendingManga, ...popularManga, ...newReleases];

export function HomePage() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiNotice, setApiNotice] = useState("");
  const backendConfigured = BACKEND_CONFIGURED;

  const refreshFromBackend = async () => {
    if (!backendConfigured) {
      setManga(fallbackManga);
      setApiNotice("No backend configured. Showing built-in demo manga.");
      return false;
    }

    const cached = await fetchManga(48);
    if (cached.length > 0) {
      setManga(cached);
      setApiNotice(`Loaded ${cached.length} manga from MongoDB.`);
      return true;
    }
    setManga([]);
    setApiNotice("MongoDB is connected, but no manga is saved yet. Click Sync Manga to add new titles.");
    return false;
  };

  const handleSync = async () => {
    if (!backendConfigured) {
      setApiNotice("Sync unavailable because no backend API URL is configured. Set VITE_API_URL or run the backend locally.");
      setManga(fallbackManga);
      return;
    }

    setIsSyncing(true);
    setApiNotice("");
    try {
      const synced = await syncManga(24, true);
      const cached = await fetchManga(48);
      setManga(cached);
      setApiNotice(`Sync complete: metadata and chapters refreshed. ${synced.length} source items checked.`);
    } catch {
      setApiNotice("Backend unavailable. Showing built-in demo manga until FastAPI and MongoDB are running.");
      setManga(fallbackManga);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshFromBackend()
      .catch(() => {
        setApiNotice("Backend unavailable. Showing built-in demo manga until FastAPI and MongoDB are running.");
        setManga(fallbackManga);
      });
  }, []);

  const rows = useMemo(() => {
    const byChapters = [...manga].sort((a, b) => b.chapters - a.chapters);
    const byRating = [...manga].sort((a, b) => b.rating - a.rating);
    return {
      hero: manga.slice(0, 5),
      continueReading: manga.slice(0, 5).map((item) => ({ ...item, progress: Math.random() * 100 })),
      trending: manga.slice(0, 12),
      popular: byChapters.slice(0, 12),
      newReleases: manga.slice(-12).reverse(),
      topRated: byRating.slice(0, 12),
      recommended: manga.slice(6, 18),
    };
  }, [manga]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroCarousel manga={rows.hero.length > 0 ? rows.hero : featuredManga} />

      {/* Content Sections */}
      <div className="max-w-[1920px] mx-auto py-8">
        <div className="px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Live Manga Library</h2>
            <p className="text-sm text-muted-foreground">
              {apiNotice || "Loaded from MongoDB when available, with MangaDex sync ready on demand."}
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing" : "Sync Manga"}
          </Button>
        </div>

        {/* Continue Reading - This would be personalized */}
        <ContentRow
          title="Continue Reading"
          manga={rows.continueReading}
        />

        {/* Trending Today */}
        <ContentRow
          title="Trending Today"
          manga={rows.trending}
          viewAllLink="/trending"
        />

        {/* Genres Section */}
        <section className="mb-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre, index) => (
              <motion.div
                key={genre}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Badge
                  className="px-6 py-3 text-base bg-card hover:bg-[#7C4DFF] transition-colors cursor-pointer border border-white/10 hover:border-[#7C4DFF]"
                >
                  {genre}
                </Badge>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Popular This Week */}
        <ContentRow
          title="Popular This Week"
          manga={rows.popular}
        />

        {/* New Releases */}
        <ContentRow
          title="New Releases"
          manga={rows.newReleases}
        />

        {/* Top Rated */}
        <ContentRow
          title="Top Rated"
          manga={rows.topRated}
        />

        {/* Recommended For You */}
        <ContentRow
          title="Recommended For You"
          manga={rows.recommended}
        />
      </div>
    </div>
  );
}
