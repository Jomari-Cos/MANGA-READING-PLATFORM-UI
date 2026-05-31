import { Home, Search, Library, TrendingUp, User, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: User, label: "Profile", path: "/profile" },
];

interface DesktopSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: DesktopSidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen glass-light border-r border-white/10 z-50"
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between mb-8">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="open"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #00D4FF 100%)' }}>
                  <span className="text-xl font-bold">M</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#7C4DFF] to-[#00D4FF] bg-clip-text text-transparent">
                  MangaVerse
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" 
                style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #00D4FF 100%)' }}
              >
                <span className="text-xl font-bold">M</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="rounded-full w-8 h-8"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
        </div>

        {!isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="rounded-full w-10 h-10 mb-6 mx-auto"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full ${isOpen ? 'justify-start' : 'justify-center'} rounded-xl h-12 ${
                    isActive ? 'bg-[#7C4DFF] hover:bg-[#6B3FE6]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-3"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Premium Card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-auto p-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
            >
              <Crown className="w-8 h-8 text-black mb-2" />
              <h3 className="font-bold text-black mb-1">Go Premium</h3>
              <p className="text-sm text-black/80 mb-3">Unlock all features</p>
              <Button className="w-full bg-black hover:bg-black/90 text-white">
                Upgrade Now
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
