import { Link } from "react-router-dom";
import { Trophy, Star } from "lucide-react";
import { useTopAnime } from "@/hooks/useAnime";
import { getDisplayTitle } from "@/lib/jikan";

interface Props {
  limit?: number;
  excludeId?: number;
}

export default function PopularLeaderboard({ limit = 10, excludeId }: Props) {
  const { data, isLoading } = useTopAnime("bypopularity", 1);
  const items = (data?.data || []).filter((a) => a.mal_id !== excludeId).slice(0, limit);

  return (
    <section className="rounded-xl bg-card border border-border p-3 sm:p-4">
      <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Most Popular
      </h2>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <ol className="space-y-1.5">
          {items.map((a, i) => (
            <li key={a.mal_id}>
              <Link
                to={`/anime/${a.mal_id}`}
                className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-surface-hover transition-colors group"
              >
                <span
                  className={`shrink-0 w-6 text-center font-extrabold text-sm ${
                    i < 3 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <img
                  src={a.images.webp.image_url || a.images.jpg.image_url}
                  alt={getDisplayTitle(a)}
                  loading="lazy"
                  className="h-12 w-9 rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {getDisplayTitle(a)}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    {a.score && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                        {a.score}
                      </span>
                    )}
                    {a.type && <span>{a.type}</span>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
