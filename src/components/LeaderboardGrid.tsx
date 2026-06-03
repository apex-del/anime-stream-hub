import { Link } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { JikanAnime } from "@/lib/jikan";
import { getDisplayTitle } from "@/lib/jikan";

interface LeaderboardGridProps {
  title: string;
  animeList: JikanAnime[];
  isLoading?: boolean;
}

export default function LeaderboardGrid({ title, animeList, isLoading }: LeaderboardGridProps) {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <Link to="/top-charts" className="text-sm text-primary hover:underline">View All →</Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <ol className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {animeList.slice(0, 10).map((anime, i) => (
              <motion.li
                key={anime.mal_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors hover:bg-surface-hover group"
                >
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${
                      i < 3
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <img
                    src={anime.images.webp.small_image_url || anime.images.jpg.small_image_url}
                    alt={getDisplayTitle(anime)}
                    className="h-16 w-12 sm:h-18 sm:w-13 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {getDisplayTitle(anime)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {anime.score && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          {anime.score}
                        </span>
                      )}
                      <span>{anime.type}</span>
                      {anime.episodes && <span>{anime.episodes} eps</span>}
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
