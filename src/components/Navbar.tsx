import { Link, useLocation } from "react-router-dom";
import { Search, X, Download, Heart, LogIn, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "glass border-b border-border" : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="flex h-14 items-center px-4 gap-2 min-w-0">
        {/* Left: Sidebar trigger + brand */}
        <div className="flex items-center gap-3 shrink-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          {!searchOpen && (
            <Link to="/" className="flex items-center gap-2 group md:hidden">
              <Download className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              <span className="text-lg font-bold tracking-tight">
                Anime<span className="text-primary">Stream</span>
              </span>
            </Link>
          )}
        </div>

        {/* Search bar - expands into middle */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-w-0"
            >
              <form onSubmit={handleSearch}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer when search closed */}
        {!searchOpen && <div className="flex-1" />}

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {!searchOpen && (
            <>
              <Link
                to="/favorites"
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors hidden sm:flex"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {user ? (
                <Link
                  to="/settings"
                  className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline truncate max-w-[100px]">
                    {user.email?.split("@")[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
