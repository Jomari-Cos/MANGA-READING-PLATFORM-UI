import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Loader2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { reverseImageSearch, ImageSearchResult } from "../services/api";
import { Manga } from "../data/mockData";
import { MangaCard } from "./MangaCard";

interface ImageSearchProps {
  localManga: Manga[];
  onResultsFound?: (results: Manga[]) => void;
}

export function ImageSearch({ localManga, onResultsFound }: ImageSearchProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Reset previous results
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setIsSearching(true);
    setShowResults(false);

    try {
      const searchResults = await reverseImageSearch(selectedImage);
      setResults(searchResults);
      setShowResults(true);

      // Notify parent component
      if (onResultsFound) {
        onResultsFound(searchResults.map(r => r.manga));
      }
    } catch (error) {
      console.error('Image search failed:', error);
      alert('Failed to search image. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResults([]);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="w-5 h-5 text-[#7C4DFF]" />
          <h3 className="font-semibold">Search by Image</h3>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-[#7C4DFF] transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Upload a manga cover or panel</p>
              <p className="text-sm text-muted-foreground mb-4">
                We'll search our database and the web to find matching manga
              </p>
              <Button variant="secondary" size="lg" className="rounded-xl">
                Choose Image
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden bg-muted">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full max-h-[400px] object-contain mx-auto"
                />

                {/* Remove Button */}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={handleClear}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search Button */}
              <div className="mt-4 flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search Image
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSearching}
                >
                  Change Image
                </Button>
              </div>
            </motion.div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Search Results</h3>
              <span className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? 'match' : 'matches'} found
              </span>
            </div>

            {/* Results by Source */}
            <div className="space-y-6">
              {/* Local Matches */}
              {results.filter(r => r.matchedFrom === 'local').length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                    <h4 className="font-semibold text-[#4CAF50]">Local Database Matches</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {results
                      .filter(r => r.matchedFrom === 'local')
                      .map((result, index) => (
                        <div key={`local-${result.manga.id}`} className="relative">
                          <MangaCard manga={result.manga} index={index} />
                          <div className="absolute top-2 left-2 bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded-lg">
                            {Math.round(result.confidence * 100)}% match
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Web Matches */}
              {results.filter(r => r.matchedFrom === 'web').length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                    <h4 className="font-semibold text-[#00D4FF]">Web Search Results</h4>
                    <span className="text-xs text-muted-foreground">
                      (Scraped from external sources)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {results
                      .filter(r => r.matchedFrom === 'web')
                      .map((result, index) => (
                        <div key={`web-${result.manga.id}`} className="relative">
                          <MangaCard manga={result.manga} index={index} />
                          <div className="absolute top-2 left-2 space-y-1">
                            <div className="bg-[#00D4FF] text-white text-xs font-bold px-2 py-1 rounded-lg">
                              {Math.round(result.confidence * 100)}% match
                            </div>
                            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-lg truncate max-w-[120px]">
                              {result.source}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {showResults && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-12 text-center"
          >
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              We couldn't find any manga matching this image. Try a different image or search by text.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
