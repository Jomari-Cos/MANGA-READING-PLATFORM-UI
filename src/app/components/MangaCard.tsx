import { Star, Bookmark, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Manga } from "../data/mockData";
import { useEffect, useState } from "react";
import { getLibraryEntry, listenToLibraryChanges, toggleBookmark } from "../services/library";

const SOURCE_LABELS: Record<string, string> = {
  mangadex: 'MangaDex',
  anilist: 'AniList',
  myanimelist: 'MyAnimeList',
  kitsu: 'Kitsu',
  webtoons: 'Webtoon',
  web: 'Scraped',
};

interface MangaCardProps {
  manga: Manga;
  index?: number;
}

export function MangaCard({ manga, index = 0 }: MangaCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const update = () => setIsBookmarked(Boolean(getLibraryEntry(manga.id)));
    update();
    return listenToLibraryChanges(update);
  }, [manga.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <Link to={`/manga/${manga.id}`}>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative overflow-hidden rounded-2xl bg-card shadow-lg"
        >
          {/* Cover Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={manga.cover}
              alt={manga.title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-110`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Status Badge */}
            <Badge 
              className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border-0"
              style={{
                backgroundColor: manga.status === 'Ongoing' ? '#4CAF50' : manga.status === 'Completed' ? '#7C4DFF' : '#FFD54F',
                color: '#fff'
              }}
            >
              {manga.status}
            </Badge>

            {/* Type Badge */}
            <Badge className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm border-0">
              {manga.type}
            </Badge>

            {/* Quick Action - Shows on Hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button className="w-full bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl">
                <BookOpen className="w-4 h-4 mr-2" />
                Read Now
              </Button>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Info Section */}
      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/manga/${manga.id}`}>
            <h3 className="font-semibold line-clamp-2 group-hover:text-[#7C4DFF] transition-colors">
              {manga.title}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 w-8 h-8 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              setIsBookmarked(toggleBookmark(manga));
            }}
          >
            <Bookmark
              className={`w-4 h-4 transition-colors ${
                isBookmarked ? 'fill-[#FF5E8A] text-[#FF5E8A]' : ''
              }`}
            />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#FFD54F] text-[#FFD54F]" />
            <span className="font-medium">{manga.rating}</span>
          </div>
          <span>•</span>
          <span>{manga.chapters} chapters</span>
          {manga.source && (
            <Badge variant="secondary" className="px-2 py-1 text-xs uppercase">
              {SOURCE_LABELS[manga.source] ?? manga.source}
            </Badge>
          )}
        </div>

        {manga.genres && (
          <div className="flex flex-wrap gap-1">
            {manga.genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="text-xs bg-muted/50 hover:bg-muted"
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
