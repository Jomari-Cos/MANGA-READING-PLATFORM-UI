import { Search, Bell, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { LibraryEntry, listenToLibraryChanges, readLibrary } from "../services/library";

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<LibraryEntry[]>([]);

  useEffect(() => {
    const update = () => setEntries(readLibrary());
    update();
    return listenToLibraryChanges(update);
  }, []);

  const notifications = useMemo(() => {
    const recent = [...entries].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 4);
    if (recent.length === 0) {
      return [
        {
          title: "No library activity yet",
          description: "Bookmark a title or open a chapter to start tracking updates.",
        },
      ];
    }
    return recent.map((entry) => ({
      title: entry.manga.title,
      description:
        entry.status === "reading"
          ? `Reading progress saved at ${entry.lastChapter || `${entry.progress}%`}`
          : entry.status === "completed"
          ? "Marked as completed"
          : entry.status === "plan"
          ? "Added to plan to read"
          : "Bookmarked",
    }));
  }, [entries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #00D4FF 100%)' }}>
              <span className="text-xl font-bold">M</span>
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-[#7C4DFF] to-[#00D4FF] bg-clip-text text-transparent">
              MangaVerse
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search manga, manhwa, webtoons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-[#1F2430] border-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => navigate('/search')}
            >
              <Search className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="w-5 h-5" />
                  {entries.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center p-0 bg-[#FF5E8A] text-white border-0 text-xs">
                      {Math.min(entries.length, 9)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-white/10 rounded-2xl p-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-1">
                  {notifications.map((item, index) => (
                    <button
                      key={`${item.title}-${index}`}
                      className="w-full text-left rounded-xl px-3 py-3 hover:bg-muted/50 transition-colors"
                      onClick={() => navigate("/library")}
                    >
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#FF5E8A] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
