import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, X, Settings, Bookmark, 
  Sun, ZoomIn, ArrowLeft, List, Maximize
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { motion, AnimatePresence } from "motion/react";
import { Chapter, Manga, featuredManga, trendingManga, popularManga, newReleases } from "../data/mockData";
import { fetchChapterPages, fetchChapters, fetchMangaById } from "../services/api";
import { recordReadingProgress } from "../services/library";

const allManga = [...featuredManga, ...trendingManga, ...popularManga, ...newReleases];
const fallbackMangaIds = new Set(allManga.map((item) => item.id));

// Mock manga pages
const generatePages = (chapterNumber: number) => {
  return Array.from({ length: 12 }, (_, i) => 
    `https://images.unsplash.com/photo-${1580000000000 + chapterNumber * 1000 + i}?w=800&h=1200&q=80&fit=crop`
  );
};

type ReadingMode = 'vertical' | 'single' | 'double';

export function ReaderPage() {
  const { id, chapter } = useParams();
  const [manga, setManga] = useState<Manga | undefined>(() => allManga.find(m => m.id === id));
  const chapterNum = chapter || '1';
  
  const [currentPage, setCurrentPage] = useState(0);
  const [readingMode, setReadingMode] = useState<ReadingMode>('vertical');
  const [showControls, setShowControls] = useState(true);
  const [brightness, setBrightness] = useState([100]);
  const [zoom, setZoom] = useState([100]);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [pages, setPages] = useState<string[]>(generatePages(Number(chapterNum) || 1));
  const [pageNotice, setPageNotice] = useState("");

  useEffect(() => {
    if (!id) return;

    fetchMangaById(id)
      .then(setManga)
      .catch(() => setManga(allManga.find(m => m.id === id)));

    fetchChapters(id)
      .then(setChapters)
      .catch(() => setChapters([]));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    setCurrentPage(0);
    fetchChapterPages(id, chapterNum)
      .then((realPages) => {
        setPages(realPages);
        setPageNotice(realPages.length > 0 ? "" : "No source pages found for this chapter.");
      })
      .catch(() => {
        if (fallbackMangaIds.has(id)) {
          setPages(generatePages(Number(chapterNum) || 1));
          setPageNotice("Backend unavailable. Showing demo pages until FastAPI and MongoDB are running.");
          return;
        }
        setPages([]);
        setPageNotice("Readable pages are not available for this source yet.");
      });
  }, [id, chapterNum]);

  useEffect(() => {
    if (manga) {
      recordReadingProgress(manga, chapterNum, chapters.length || manga.chapters);
    }
  }, [manga, chapterNum, chapters.length]);

  const currentChapterIndex = chapters.findIndex((item) => String(item.number) === chapterNum);
  const previousChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1]?.number : String((Number(chapterNum) || 1) - 1);
  const nextChapter = currentChapterIndex >= 0 && chapters[currentChapterIndex + 1]
    ? chapters[currentChapterIndex + 1].number
    : String((Number(chapterNum) || 1) + 1);

  // Auto-hide controls on scroll
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!manga) {
    return <div className="text-center py-16">Manga not found</div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 glass"
          >
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-3">
                <Link to={`/manga/${id}`}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <h2 className="font-semibold">{manga.title}</h2>
                  <p className="text-sm text-muted-foreground">Chapter {chapterNum}</p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bookmark className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-5 h-5" />
                </Button>
                <Link to={`/manga/${id}`}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed top-16 right-0 bottom-0 w-80 glass-light z-40 p-6 overflow-y-auto"
          >
            <h3 className="font-bold text-xl mb-6">Reader Settings</h3>

            {/* Reading Mode */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Reading Mode</label>
              <Select value={readingMode} onValueChange={(v: ReadingMode) => setReadingMode(v)}>
                <SelectTrigger className="bg-background rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical Scroll</SelectItem>
                  <SelectItem value="single">Single Page</SelectItem>
                  <SelectItem value="double">Double Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brightness */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Brightness</label>
                <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4" />
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  min={50}
                  max={150}
                  step={10}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Zoom */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Zoom</label>
                <span className="text-sm text-muted-foreground">{zoom[0]}%</span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomIn className="w-4 h-4" />
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={50}
                  max={200}
                  step={10}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Reading Direction (for single/double page) */}
            {readingMode !== 'vertical' && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Reading Direction</label>
                <Select defaultValue="ltr">
                  <SelectTrigger className="bg-background rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltr">Left to Right</SelectItem>
                    <SelectItem value="rtl">Right to Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div 
        className="pt-16"
        style={{
          filter: `brightness(${brightness[0]}%)`
        }}
      >
        {/* Vertical Scroll Mode */}
        {readingMode === 'vertical' && (
          <div className="max-w-4xl mx-auto">
            {pageNotice && (
              <div className="m-4 rounded-xl bg-card border border-white/10 p-4 text-sm text-muted-foreground text-center">
                {pageNotice}
              </div>
            )}
            {pages.length === 0 && (
              <div className="m-4 rounded-xl bg-card border border-white/10 p-10 text-center">
                <h2 className="text-xl font-semibold mb-2">No readable pages</h2>
                <p className="text-muted-foreground mb-4">
                  This title was imported as metadata only. Sync or open a MangaDex title to read actual pages.
                </p>
                <Link to={`/manga/${id}`}>
                  <Button variant="secondary" className="rounded-xl">Back to Details</Button>
                </Link>
              </div>
            )}
            {pages.map((page, index) => (
              <motion.img
                key={index}
                src={page}
                alt={`Page ${index + 1}`}
                className="w-full"
                style={{ transform: `scale(${zoom[0] / 100})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        )}

        {/* Single Page Mode */}
        {readingMode === 'single' && (
          <div className="flex items-center justify-center min-h-screen p-4">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPage}
                src={pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="max-h-[90vh] max-w-full object-contain"
                style={{ transform: `scale(${zoom[0] / 100})` }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          </div>
        )}

        {/* Double Page Mode */}
        {readingMode === 'double' && (
          <div className="flex items-center justify-center min-h-screen p-4 gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                className="flex gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {currentPage < pages.length && (
                  <img
                    src={pages[currentPage]}
                    alt={`Page ${currentPage + 1}`}
                    className="max-h-[90vh] object-contain"
                    style={{ transform: `scale(${zoom[0] / 100})` }}
                  />
                )}
                {currentPage + 1 < pages.length && (
                  <img
                    src={pages[currentPage + 1]}
                    alt={`Page ${currentPage + 2}`}
                    className="max-h-[90vh] object-contain"
                    style={{ transform: `scale(${zoom[0] / 100})` }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Navigation Buttons (for single/double page) */}
      {readingMode !== 'vertical' && (
        <>
          <AnimatePresence>
            {showControls && currentPage > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
              >
                <Button
                  size="icon"
                  className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm"
                  onClick={goToPrevPage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showControls && currentPage < pages.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
              >
                <Button
                  size="icon"
                  className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm"
                  onClick={goToNextPage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Bottom Controls */}
      {readingMode !== 'vertical' && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass"
            >
              <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {currentPage + 1} / {pages.length}
                  </span>
                  <Slider
                    value={[currentPage]}
                    onValueChange={(v) => setCurrentPage(v[0])}
                    min={0}
                    max={pages.length - 1}
                    step={1}
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Link to={`/reader/${id}/${previousChapter}`}>
                      <Button
                        variant="secondary"
                        className="rounded-xl"
                        disabled={Number(chapterNum) <= 1 && currentChapterIndex <= 0}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Prev Chapter
                      </Button>
                    </Link>
                    <Link to={`/reader/${id}/${nextChapter}`}>
                      <Button className="bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl">
                        Next Chapter
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Vertical Mode Bottom Navigation */}
      {readingMode === 'vertical' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card rounded-2xl p-6 flex items-center justify-between border border-white/10">
            <Link to={`/reader/${id}/${previousChapter}`}>
              <Button
                variant="secondary"
                className="rounded-xl"
                disabled={Number(chapterNum) <= 1 && currentChapterIndex <= 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Chapter
              </Button>
            </Link>
            <Link to={`/reader/${id}/${nextChapter}`}>
              <Button className="bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl">
                Next Chapter
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
