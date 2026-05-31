import { Home, Search, Library, TrendingUp, User } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-[#7C4DFF]" : "text-muted-foreground"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="bottomNav"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7C4DFF]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "text-[#7C4DFF]" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
