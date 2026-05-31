import { BookMarked, BookOpen, CheckCircle2, Download, Clock, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MangaCard } from "../components/MangaCard";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Manga } from "../data/mockData";
import { fetchManga } from "../services/api";
import { LibraryEntry, listenToLibraryChanges, readLibrary, upsertLibraryEntry } from "../services/library";
import { motion } from "motion/react";

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
      <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Link to="/search">
        <Button className="bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl gap-2">
          <Search className="w-4 h-4" />
          Find Manga
        </Button>
      </Link>
    </motion.div>
  );
}

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState("reading");
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [discoverable, setDiscoverable] = useState<Manga[]>([]);

  useEffect(() => {
    const update = () => setEntries(readLibrary());
    update();
    return listenToLibraryChanges(update);
  }, []);

  useEffect(() => {
    fetchManga(12)
      .then(setDiscoverable)
      .catch(() => setDiscoverable([]));
  }, []);

  const groups = useMemo(() => ({
    reading: entries.filter((entry) => entry.status === "reading"),
    completed: entries.filter((entry) => entry.status === "completed"),
    bookmarked: entries.filter((entry) => entry.status === "bookmarked"),
    plan: entries.filter((entry) => entry.status === "plan"),
  }), [entries]);

  const stats = [
    { icon: BookOpen, label: "Reading", value: groups.reading.length, color: "#7C4DFF" },
    { icon: CheckCircle2, label: "Completed", value: groups.completed.length, color: "#4CAF50" },
    { icon: BookMarked, label: "Bookmarked", value: groups.bookmarked.length, color: "#FF5E8A" },
    { icon: Download, label: "Downloaded", value: 0, color: "#00D4FF" },
  ];

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Library</h1>
        <p className="text-muted-foreground">Track your reading progress and manage your collection</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card p-1 h-auto rounded-2xl flex flex-wrap">
          <TabsTrigger value="reading" className="rounded-xl gap-2 px-6 py-3">
            <BookOpen className="w-4 h-4" />
            Reading
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl gap-2 px-6 py-3">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="rounded-xl gap-2 px-6 py-3">
            <BookMarked className="w-4 h-4" />
            Bookmarked
          </TabsTrigger>
          <TabsTrigger value="plan" className="rounded-xl gap-2 px-6 py-3">
            <Clock className="w-4 h-4" />
            Plan to Read
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reading" className="space-y-6">
          {groups.reading.length === 0 ? (
            <EmptyState title="No active reading yet" description="Open a readable manga chapter and it will appear here automatically." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.reading.map((entry, index) => (
                <motion.div
                  key={entry.manga.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl p-4 border border-white/10 flex gap-4"
                >
                  <Link to={`/manga/${entry.manga.id}`} className="w-28 h-40 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={entry.manga.cover} alt={entry.manga.title} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold mb-1 line-clamp-2">{entry.manga.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{entry.manga.author}</p>
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{entry.lastChapter || "Not started"}</span>
                        <span className="font-medium text-[#7C4DFF]">{entry.progress}%</span>
                      </div>
                      <Progress value={entry.progress} className="h-2" />
                      <Link to={`/manga/${entry.manga.id}`}>
                        <Button className="w-full mt-2 bg-[#7C4DFF] hover:bg-[#6B3FE6] rounded-xl text-sm">
                          Continue Reading
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {groups.completed.length === 0 ? (
            <EmptyState title="No completed manga yet" description="Finished titles will be tracked here." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {groups.completed.map((entry, index) => <MangaCard key={entry.manga.id} manga={entry.manga} index={index} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarked">
          {groups.bookmarked.length === 0 ? (
            <EmptyState title="No bookmarks yet" description="Click the bookmark icon on a manga card to save it here." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {groups.bookmarked.map((entry, index) => <MangaCard key={entry.manga.id} manga={entry.manga} index={index} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plan">
          {groups.plan.length === 0 ? (
            <div className="space-y-8">
              <EmptyState title="No manga in your plan to read list" description="Add a few titles from the suggestions below." />
              {discoverable.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Suggestions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {discoverable.slice(0, 6).map((manga) => (
                      <div key={manga.id} className="space-y-3">
                        <MangaCard manga={manga} />
                        <Button
                          variant="secondary"
                          className="w-full rounded-xl"
                          onClick={() => upsertLibraryEntry(manga, { status: "plan", progress: 0 })}
                        >
                          Add to Plan
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {groups.plan.map((entry, index) => <MangaCard key={entry.manga.id} manga={entry.manga} index={index} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
