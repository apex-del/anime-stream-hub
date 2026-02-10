import { useState } from "react";
import { TrendingUp, Trophy, Flame, Star } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useTopAnime } from "@/hooks/useAnime";

const FILTERS = [
  { label: "Most Popular", value: "bypopularity" as const, icon: TrendingUp },
  { label: "Top Rated", value: "favorite" as const, icon: Trophy },
  { label: "Airing Now", value: "airing" as const, icon: Flame },
  { label: "Upcoming", value: "upcoming" as const, icon: Star },
];

export default function TopCharts() {
  const [filter, setFilter] = useState<"bypopularity" | "favorite" | "airing" | "upcoming">("bypopularity");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTopAnime(filter, page);

  const anime = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 flex items-center gap-3">
            <Trophy className="h-7 w-7 text-primary" />
            Top Charts
          </h1>
          <p className="text-muted-foreground mb-6">
            Discover the highest ranked anime
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)
            : anime.map((a, i) => (
                <AnimeCard key={a.mal_id} anime={a} index={i} />
              ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.last_visible_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {page} of {pagination.last_visible_page}
            </span>
            <button
              disabled={!pagination.has_next_page}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
