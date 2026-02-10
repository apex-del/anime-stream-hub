import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import { getRandomAnime } from "@/lib/jikan";

export default function RandomAnime() {
  const [key, setKey] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["random-anime", key],
    queryFn: getRandomAnime,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const anime = data?.data;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-20 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 flex items-center gap-3">
            <Shuffle className="h-7 w-7 text-primary" />
            Random Anime
          </h1>
          <p className="text-muted-foreground mb-6">
            Feeling lucky? Discover something new!
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setKey((k) => k + 1)}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Finding..." : "Roll the Dice"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading || !anime ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-80 rounded-xl bg-card animate-pulse"
            />
          ) : (
            <motion.div
              key={anime.mal_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center"
            >
              <div className="w-64">
                <AnimeCard anime={anime} index={0} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {anime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 rounded-xl border border-border bg-card p-6"
          >
            <h2 className="font-bold text-lg mb-2">
              {anime.title_english || anime.title}
            </h2>
            {anime.synopsis && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                {anime.synopsis}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {anime.genres?.map((g) => (
                <span
                  key={g.mal_id}
                  className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
