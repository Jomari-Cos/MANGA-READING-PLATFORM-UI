import { useParams, Link } from "react-router";
import { Star, Bookmark, Share2, Download, Play, Eye, BookOpen, ArrowDownUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Chapter, Manga, featuredManga, trendingManga, popularManga, newReleases, mockChapters } from "../data/mockData";
import { MangaCard } from "../components/MangaCard";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { fetchChapters, fetchManga, fetchMangaById } from "../services/api";
import { getLibraryEntry, listenToLibraryChanges, toggleBookmark } from "../services/library";

const allManga = [...featuredManga, ...trendingManga, ...popularManga, ...newReleases];

export function MangaDetailPage() {
  const { id } = useParams();
  const [manga, setManga] = useState<Manga | undefined>(() => allManga.find(m => m.id === id));
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersNotice, setChaptersNotice] = useState("");
  const [chapterOrder, setChapterOrder] = useState<"asc" | "desc">("asc");
  const [recommendations, setRecommendations] = useState<Manga[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    const update = () => setIsBookmarked(Boolean(getLibraryEntry(id)));
    update();
    return listenToLibraryChanges(update);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetchMangaById(id)
      .then(setManga)
      .catch(() => setManga(allManga.find(m => m.id === id)));

    fetchChapters(id, chapterOrder)
      .then((items) => {
        setChapters(items);
        setChaptersNotice(items.length > 0 ? "" : "Readable chapters are not available for this source yet.");
      })
      .catch(() => {
        const localManga = allManga.find(m => m.id === id);
        setChapters(localManga ? mockChapters : []);
        setChaptersNotice(localManga ? "" : "Could not load chapters from the backend.");
      });

    fetchManga(24)
      .then(setRecommendations)
      .catch(() => setRecommendations(allManga));
  }, [id, chapterOrder]);

  if (!manga) {
    return <div className="text-center py-16">Manga not found</div>;
  }

  const similarManga = (recommendations.length > 0 ? recommendations : allManga).filter(m =>
    m.id !== manga.id && 
    m.genres.some(g => manga.genres.includes(g))
  ).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] sm:h-[500px]">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        {/* Content */}
        <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end h-full pb-8 gap-6">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
            >
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 pb-4"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-[#7C4DFF] border-0">{manga.type}</Badge>
                <Badge 
                  className="border-0"
                  style={{
                    backgroundColor: manga.status === 'Ongoing' ? '#4CAF50' : manga.status === 'Completed' ? '#7C4DFF' : '#FFD54F',
                    color: '#fff'
                  }}
                >
                  {manga.status}
                </Badge>
                <Badge variant="secondary">{manga.releaseYear}</Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {manga.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#FFD54F] text-[#FFD54F]" />
                  <span className="font-bold text-xl">{manga.rating}</span>
                  <span className="text-muted-foreground">/10</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>{manga.views} views</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{manga.chapters} Chapters</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-2">
                <span className="text-foreground font-medium">Author:</span> {manga.author}
              </p>
              {manga.source && (
                <p className="text-muted-foreground mb-2">
                  <span className="text-foreground font-medium">Source:</span> {manga.source === 'mangadex' ? 'MangaDex' : manga.source === 'anilist' ? 'AniList' : manga.source === 'myanimelist' ? 'MyAnimeList' : manga.source === 'kitsu' ? 'Kitsu' : manga.source === 'webtoons' ? 'Webtoon' : manga.source}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {manga.genres.map(genre => (
                  <Badge key={genre} variant="secondary" className="bg-muted/50">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Link to={chapters.length > 0 ? `/reader/${manga.id}/${chapters[0].number}` : "#"}>
                  <Button
                    size="lg"
                    disabled={chapters.length === 0}
                    className="bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl gap-2 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5" />
                    {chapters.length > 0 ? "Start Reading" : "No Chapters"}
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-xl gap-2"
                  onClick={() => setIsBookmarked(toggleBookmark(manga))}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                <Button size="lg" variant="secondary" className="rounded-xl" aria-label="Share">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="secondary" className="rounded-xl" aria-label="Download">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="synopsis" className="space-y-6">
          <TabsList className="bg-card p-1 h-auto rounded-2xl">
            <TabsTrigger value="synopsis" className="rounded-xl px-6 py-3">Synopsis</TabsTrigger>
            <TabsTrigger value="chapters" className="rounded-xl px-6 py-3">Chapters</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl px-6 py-3">Reviews</TabsTrigger>
            <TabsTrigger value="recommendations" className="rounded-xl px-6 py-3">Similar</TabsTrigger>
          </TabsList>

          {/* Synopsis */}
          <TabsContent value="synopsis">
            <div className="bg-card rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {manga.synopsis}
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{manga.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{manga.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author:</span>
                      <span>{manga.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Release Year:</span>
                      <span>{manga.releaseYear}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="text-[#FFD54F]">{manga.rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views:</span>
                      <span>{manga.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chapters:</span>
                      <span>{manga.chapters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bookmarks:</span>
                      <span>142K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Chapters */}
          <TabsContent value="chapters">
            <div className="bg-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chapters</h2>
                <Button variant="secondary" className="rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => setChapterOrder((order) => order === "asc" ? "desc" : "asc")}
                >
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  {chapterOrder === "asc" ? "Oldest First" : "Newest First"}
                </Button>
              </div>

              <div className="space-y-2">
                {chaptersNotice && chapters.length === 0 && (
                  <div className="rounded-xl bg-muted/40 border border-white/10 p-6 text-center text-muted-foreground">
                    {chaptersNotice}
                  </div>
                )}
                {chapters.map((chapter) => (
                  <Link key={chapter.id} to={`/reader/${manga.id}/${chapter.number}`}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${chapter.read ? 'bg-[#7C4DFF]' : 'bg-muted'}`} />
                        <div>
                          <h4 className="font-medium">{chapter.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {chapter.releaseDate ? new Date(chapter.releaseDate).toLocaleDateString() : "Unknown date"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {chapter.read && (
                          <Badge variant="secondary" className="bg-[#7C4DFF]/20 text-[#7C4DFF]">
                            Read
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <div className="bg-card rounded-2xl p-8 border border-white/10 text-center py-16">
              <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to review this manga</p>
              <Button className="bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl">
                Write a Review
              </Button>
            </div>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations">
            <div>
              <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {similarManga.map((rec, index) => (
                  <MangaCard key={rec.id} manga={rec} index={index} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
