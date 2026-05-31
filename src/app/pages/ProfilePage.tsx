import { User, BookOpen, Star, Trophy, Calendar, Settings, Crown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { MangaCard } from "../components/MangaCard";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { LibraryEntry, listenToLibraryChanges, readLibrary } from "../services/library";

const achievementsBase = [
  { id: 1, name: "First Read", description: "Read your first chapter", icon: BookOpen },
  { id: 2, name: "Bookmarker", description: "Save 3 manga", icon: Star },
  { id: 3, name: "Completionist", description: "Complete 1 manga", icon: Trophy },
  { id: 4, name: "Loyal Reader", description: "Keep a reading list", icon: Calendar },
  { id: 5, name: "Collector", description: "Save 10 manga", icon: Crown },
  { id: 6, name: "Critic", description: "Explore several genres", icon: Star },
];

export function ProfilePage() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);

  useEffect(() => {
    const update = () => setEntries(readLibrary());
    update();
    return listenToLibraryChanges(update);
  }, []);

  const stats = useMemo(() => {
    const completed = entries.filter((entry) => entry.status === "completed").length;
    const reading = entries.filter((entry) => entry.status === "reading").length;
    const chaptersRead = entries.reduce((total, entry) => {
      const chapter = Number((entry.lastChapter || "").replace(/[^0-9.]/g, ""));
      return total + (Number.isFinite(chapter) ? chapter : 0);
    }, 0);
    return [
      { label: "Chapters Read", value: chaptersRead, color: "#7C4DFF" },
      { label: "Reading", value: reading, color: "#00D4FF" },
      { label: "Manga Completed", value: completed, color: "#4CAF50" },
      { label: "Saved Titles", value: entries.length, color: "#FFD54F" },
    ];
  }, [entries]);

  const favoriteGenres = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((entry) => entry.manga.genres.forEach((genre) => counts.set(genre, (counts.get(genre) || 0) + 1)));
    const max = Math.max(...counts.values(), 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([genre, count]) => ({ genre, count, percentage: Math.round((count / max) * 100) }));
  }, [entries]);

  const achievements = achievementsBase.map((achievement) => ({
    ...achievement,
    unlocked:
      (achievement.id === 1 && entries.some((entry) => entry.status === "reading" || entry.status === "completed")) ||
      (achievement.id === 2 && entries.length >= 3) ||
      (achievement.id === 3 && entries.some((entry) => entry.status === "completed")) ||
      (achievement.id === 4 && entries.some((entry) => entry.status === "plan" || entry.status === "reading")) ||
      (achievement.id === 5 && entries.length >= 10) ||
      (achievement.id === 6 && favoriteGenres.length >= 3),
  }));

  const recentlyRead = entries
    .filter((entry) => entry.status === "reading" || entry.status === "completed")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4);

  const level = Math.max(1, Math.floor(Number(stats[0].value) / 25) + 1);
  const nextLevelProgress = Math.min(100, (Number(stats[0].value) % 25) * 4);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-3xl p-8 mb-8 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#FF5E8A] p-1">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#FFD700] border-4 border-card flex items-center justify-center">
              <span className="text-lg">{level}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold mb-1">Local Reader</h1>
                <p className="text-muted-foreground">Your library is saved in this browser</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-[#7C4DFF] border-0">Level {level}</Badge>
              <Badge variant="secondary">{entries.length > 0 ? "Active Reader" : "New Reader"}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {level + 1}</span>
                <span className="font-medium text-[#7C4DFF]">{nextLevelProgress}%</span>
              </div>
              <Progress value={nextLevelProgress} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-6 border border-white/10"
          >
            <div className="text-4xl font-bold mb-2" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-3xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-6">Favorite Genres</h2>
          <div className="space-y-4">
            {favoriteGenres.length === 0 && <p className="text-muted-foreground">Save and read manga to build your genre profile.</p>}
            {favoriteGenres.map((item, index) => (
              <motion.div key={item.genre} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.genre}</span>
                  <span className="text-sm text-muted-foreground">{item.count} manga</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-[#7C4DFF] to-[#00D4FF]"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-6">Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-2xl border ${achievement.unlocked ? "bg-gradient-to-br from-[#7C4DFF]/20 to-[#00D4FF]/20 border-[#7C4DFF]/30" : "bg-muted/50 border-white/5"}`}
                >
                  <Icon className={`w-8 h-8 mb-2 ${achievement.unlocked ? "text-[#7C4DFF]" : "text-muted-foreground"}`} />
                  <h4 className={`text-sm font-semibold mb-1 ${!achievement.unlocked && "text-muted-foreground"}`}>
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Recently Read</h2>
        {recentlyRead.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 border border-white/10 text-muted-foreground">
            Open a readable chapter and it will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyRead.map((entry, index) => (
              <MangaCard key={entry.manga.id} manga={entry.manga} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
