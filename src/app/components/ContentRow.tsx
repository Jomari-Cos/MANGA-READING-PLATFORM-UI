import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MangaCard } from "./MangaCard";
import { Manga } from "../data/mockData";
import { useRef } from "react";
import { Button } from "./ui/button";

interface ContentRowProps {
  title: string;
  manga: Manga[];
  viewAllLink?: string;
}

export function ContentRow({ title, manga, viewAllLink }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="ghost" className="gap-2 text-[#7C4DFF] hover:text-[#6B3FE6]">
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="relative group/row">
        {/* Scroll Buttons - Desktop Only */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
          onClick={() => scroll('left')}
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Manga Grid */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 pb-4"
        >
          {manga.map((item, index) => (
            <div key={item.id} className="flex-shrink-0 w-44 sm:w-52">
              <MangaCard manga={item} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
