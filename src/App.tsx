import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import AnimeDetails from "./pages/AnimeDetails";
import Watch from "./pages/Watch";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import Settings from "./pages/Settings";
import TopCharts from "./pages/TopCharts";
import RandomAnime from "./pages/RandomAnime";
import Download from "./pages/Download";
import Contact from "./pages/Contact";
import Genres from "./pages/Genres";
import WatchList from "./pages/WatchList";
import Schedule from "./pages/Schedule";
import About from "./pages/About";
import Studios from "./pages/Studios";
import Upcoming from "./pages/Upcoming";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/top-charts" element={<TopCharts />} />
          <Route path="/random" element={<RandomAnime />} />
          <Route path="/download" element={<Download />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/about" element={<About />} />
          <Route path="/studios" element={<Studios />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
