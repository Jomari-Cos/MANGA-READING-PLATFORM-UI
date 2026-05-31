import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Bookmark, Star, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Manga } from "../data/mockData";

interface HeroCarouselProps {
  manga: Manga[];
}

export function HeroCarousel({ manga }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % manga.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [manga.length]);

  const currentManga = manga[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % manga.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + manga.length) % manga.length);
  };

  return (
    <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={currentManga.cover}
              alt={currentManga.title}
              className="w-full h-full object-cover"
            />
            {/* Multiple Gradient Overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-end pb-16 sm:pb-20 lg:pb-24">
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-[#7C4DFF] hover:bg-[#6B3FE6] border-0 text-white">
                      {currentManga.type}
                    </Badge>
                    <Badge 
                      className="border-0 text-white"
                      style={{
                        backgroundColor: currentManga.status === 'Ongoing' ? '#4CAF50' : currentManga.status === 'Completed' ? '#7C4DFF' : '#FFD54F'
                      }}
                    >
                      {currentManga.status}
                    </Badge>
                    <Badge variant="secondary" className="bg-card/50 backdrop-blur-sm border-0">
                      #{currentIndex + 1} Trending
                    </Badge>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {currentManga.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-[#FFD54F] text-[#FFD54F]" />
                      <span className="font-semibold">{currentManga.rating}</span>
                      <span className="text-muted-foreground">Rating</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      <span className="font-semibold">{currentManga.views}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{currentManga.chapters} Chapters</span>
                  </div>

                  {/* Synopsis */}
                  <p className="text-muted-foreground mb-6 line-clamp-3 text-sm sm:text-base">
                    {currentManga.synopsis}
                  </p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentManga.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-muted/50 hover:bg-muted">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link to={`/manga/${currentManga.id}`}>
                      <Button size="lg" className="bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl gap-2">
                        <Play className="w-5 h-5" />
                        Read Now
                      </Button>
                    </Link>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-xl gap-2 bg-card/50 backdrop-blur-sm hover:bg-card"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/50 backdrop-blur-sm hover:bg-card z-10"
        onClick={goToPrev}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/50 backdrop-blur-sm hover:bg-card z-10"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {manga.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-[#7C4DFF]'
                : 'w-4 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
