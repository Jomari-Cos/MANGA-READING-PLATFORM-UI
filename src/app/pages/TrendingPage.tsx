import { TrendingUp, Flame } from "lucide-react";
import { MangaCard } from "../components/MangaCard";
import { Manga, trendingManga, popularManga } from "../data/mockData";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { fetchManga } from "../services/api";

const allTrending = [...trendingManga, ...popularManga];

export function TrendingPage() {
  const [mangaList, setMangaList] = useState<Manga[]>(allTrending);

  useEffect(() => {
    fetchManga(60)
      .then((results) => {
        if (results.length > 0) {
          setMangaList(results.sort((a, b) => b.chapters - a.chapters));
        }
      })
      .catch(() => setMangaList(allTrending));
  }, []);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5E8A] to-[#FFD54F] flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Trending Now</h1>
        </div>
        <p className="text-muted-foreground">The hottest manga and manhwa everyone's reading</p>
      </div>

      {/* Trending Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {mangaList.map((manga, index) => (
          <div key={manga.id} className="relative">
            {/* Ranking Badge */}
            {index < 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="absolute -top-2 -left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{
                  background: index === 0 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                    : index === 1
                    ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)'
                    : 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
                }}
              >
                #{index + 1}
              </motion.div>
            )}
            <MangaCard manga={manga} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
