import { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";

const seasons = ["winter", "spring", "summer", "fall"] as const;
const currentYear = new Date().getFullYear();
const currentSeason = seasons[Math.floor(new Date().getMonth() / 3)];

export default function Seasonal() {
  const [year, setYear] = useState(currentYear);
  const [season, setSeason] = useState<string>(currentSeason);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["seasonal", year, season, page],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}?page=${page}&limit=24`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const animeList = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            <Sparkles className="inline h-6 w-6 text-primary mr-2" />
            Seasonal Anime
          </h1>
          <p className="text-muted-foreground text-sm mb-6">Browse anime by season and year</p>
        </motion.div>

        {/* Season & Year selector */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-1">
            <button onClick={() => setYear((y) => y - 1)} className="p-2 rounded-lg bg-secondary hover:bg-surface-hover transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 rounded-lg bg-secondary text-sm font-bold min-w-[70px] text-center">{year}</span>
            <button onClick={() => setYear((y) => Math.min(y + 1, currentYear + 1))} className="p-2 rounded-lg bg-secondary hover:bg-surface-hover transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => { setSeason(s); setPage(1); }}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                  season === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)
            : animeList.map((anime: any, i: number) => <AnimeCard key={anime.mal_id} anime={anime} index={i} />)}
        </div>

        {animeList.length === 0 && !isLoading && (
          <div className="rounded-lg bg-card border border-border p-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No anime found for {season} {year}</p>
          </div>
        )}

        {pagination && pagination.last_visible_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors">Previous</button>
            <span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {pagination.last_visible_page}</span>
            <button disabled={!pagination.has_next_page} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors">Next</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
