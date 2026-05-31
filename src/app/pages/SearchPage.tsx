import { Search, SlidersHorizontal, X, Image as ImageIcon, Type } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { MangaCard } from "../components/MangaCard";
import { ImageSearch } from "../components/ImageSearch";
import { featuredManga, trendingManga, popularManga, newReleases, genres, Manga } from "../data/mockData";
import { motion, AnimatePresence } from "motion/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { fetchManga, searchManga } from "../services/api";

const allManga = [...featuredManga, ...trendingManga, ...popularManga, ...newReleases];
const statuses = ['All', 'Ongoing', 'Completed', 'Hiatus'];
const types = ['All', 'Manga', 'Manhwa', 'Manhua', 'Webtoon'];
const sourceOptions = [
  { label: 'All', value: 'all' },
  { label: 'MangaDex', value: 'mangadex' },
  { label: 'AniList', value: 'anilist' },
  { label: 'MyAnimeList', value: 'myanimelist' },
  { label: 'Kitsu', value: 'kitsu' },
  { label: 'Webtoon', value: 'webtoons' },
  { label: 'Scraped', value: 'web' },
];
const years = ['All', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedYear, setSelectedYear] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'views' | 'chapters'>('rating');
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  const [imageSearchResults, setImageSearchResults] = useState<Manga[]>([]);
  const [backendManga, setBackendManga] = useState<Manga[]>(allManga);
  const [isLoading, setIsLoading] = useState(false);
  const [apiNotice, setApiNotice] = useState("");

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    if (searchMode !== 'text') return;

    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      const sourceParam = selectedSource === 'all' ? undefined : selectedSource;
      const load = query.trim()
        ? searchManga(query.trim(), 48, sourceParam)
        : fetchManga(48, sourceParam);

      load
        .then((results) => {
          setBackendManga(results.length > 0 ? results : allManga);
          setApiNotice(results.length > 0 ? "" : "No cached backend results yet. Sync from the home page to populate MongoDB.");
        })
        .catch(() => {
          setBackendManga(allManga);
          setApiNotice("Backend unavailable. Showing built-in demo manga.");
        })
        .finally(() => setIsLoading(false));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [query, searchMode, selectedSource]);

  const toggleGenre = (genre: string) => {
    if (genre === 'All') {
      setSelectedGenres([]);
    } else {
      setSelectedGenres(prev =>
        prev.includes(genre)
          ? prev.filter(g => g !== genre)
          : [...prev, genre]
      );
    }
  };

  const filteredManga = (searchMode === 'image' && imageSearchResults.length > 0
    ? imageSearchResults
    : backendManga
  )
    .filter(manga => {
      const matchesQuery = query === '' ||
        manga.title.toLowerCase().includes(query.toLowerCase()) ||
        manga.author.toLowerCase().includes(query.toLowerCase());

      const matchesGenre = selectedGenres.length === 0 ||
        selectedGenres.some(g => manga.genres.includes(g));

      const matchesStatus = selectedStatus === 'All' || manga.status === selectedStatus;
      const matchesType = selectedType === 'All' || manga.type === selectedType;
      const matchesSource = selectedSource === 'all' || manga.source?.toLowerCase() === selectedSource.toLowerCase();
      const matchesYear = selectedYear === 'All' || manga.releaseYear.toString() === selectedYear;

      return matchesQuery && matchesGenre && matchesStatus && matchesType && matchesSource && matchesYear;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'views') return parseInt(b.views) - parseInt(a.views);
      return b.chapters - a.chapters;
    });

  const handleImageSearchResults = (results: Manga[]) => {
    setImageSearchResults(results);
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search & Discover</h1>

        {/* Search Mode Tabs */}
        <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'text' | 'image')} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card rounded-2xl p-1">
            <TabsTrigger value="text" className="rounded-xl gap-2">
              <Type className="w-4 h-4" />
              Text Search
            </TabsTrigger>
            <TabsTrigger value="image" className="rounded-xl gap-2">
              <ImageIcon className="w-4 h-4" />
              Image Search
            </TabsTrigger>
          </TabsList>

          {/* Text Search Content */}
          <TabsContent value="text" className="space-y-6 mt-6">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search manga, manhwa, webtoons..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 bg-card border-0 rounded-2xl text-lg"
                />
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-2xl gap-2 bg-card"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </Button>
            </div>
          </TabsContent>

          {/* Image Search Content */}
          <TabsContent value="image" className="mt-6">
            <ImageSearch
              localManga={allManga}
              onResultsFound={handleImageSearchResults}
            />
          </TabsContent>
        </Tabs>

        {/* Active Filters */}
        {(selectedGenres.length > 0 || selectedStatus !== 'All' || selectedType !== 'All' || selectedYear !== 'All') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedGenres.map(genre => (
              <Badge key={genre} className="bg-[#7C4DFF] gap-2">
                {genre}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleGenre(genre)} />
              </Badge>
            ))}
            {selectedStatus !== 'All' && (
              <Badge className="bg-[#00D4FF] gap-2">
                {selectedStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('All')} />
              </Badge>
            )}
            {selectedType !== 'All' && (
              <Badge className="bg-[#FF5E8A] gap-2">
                {selectedType}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('All')} />
              </Badge>
            )}
            {selectedSource !== 'all' && (
              <Badge className="bg-[#7C4DFF] gap-2">
                {sourceOptions.find(option => option.value === selectedSource)?.label ?? selectedSource}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSource('all')} />
              </Badge>
            )}
            {selectedYear !== 'All' && (
              <Badge className="bg-[#4CAF50] gap-2">
                {selectedYear}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedYear('All')} />
              </Badge>
            )}
          </motion.div>
        )}
      </div>

      {/* Filters Panel - Only show for text search */}
      <AnimatePresence>
        {showFilters && searchMode === 'text' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-6 space-y-6">
              {/* Genres */}
              <div>
                <h3 className="font-semibold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <Badge
                      key={genre}
                      className={`cursor-pointer transition-colors ${
                        genre === 'All' && selectedGenres.length === 0
                          ? 'bg-[#7C4DFF]'
                          : selectedGenres.includes(genre)
                          ? 'bg-[#7C4DFF]'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status, Type, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-background rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-background rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger className="bg-background rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(source => (
                        <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-background rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section - Only show for text search or when image search has results */}
      {(searchMode === 'text' || (searchMode === 'image' && imageSearchResults.length > 0)) && (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {isLoading ? "Searching..." : (
                <>
                  Found <span className="text-foreground font-semibold">{filteredManga.length}</span> results
                </>
              )}
              {searchMode === 'image' && imageSearchResults.length > 0 && (
                <span className="ml-2 text-xs bg-[#00D4FF] text-white px-2 py-1 rounded-full">
                  From Image Search
                </span>
              )}
              {apiNotice && (
                <span className="block text-xs mt-1">{apiNotice}</span>
              )}
            </p>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-40 bg-card rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="chapters">Chapters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredManga.map((manga, index) => (
              <MangaCard key={manga.id} manga={manga} index={index} />
            ))}
          </div>

          {/* No Results */}
          {filteredManga.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
