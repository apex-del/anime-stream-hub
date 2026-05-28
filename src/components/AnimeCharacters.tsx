import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

interface Character {
  character: {
    mal_id: number;
    name: string;
    images: { webp?: { image_url: string }; jpg: { image_url: string } };
  };
  role: string;
  voice_actors: Array<{
    person: { mal_id: number; name: string; images: { jpg: { image_url: string } } };
    language: string;
  }>;
}

const PAGE_SIZE = 12;

export default function AnimeCharacters({ animeId, compact }: { animeId: number; compact?: boolean }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["anime-characters", animeId],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ data: Character[] }>;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!animeId,
  });

  const all = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [all, page]
  );

  if (isLoading) {
    return (
      <section className={compact ? "mt-6" : "mt-10"}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (all.length === 0) return null;

  const japaneseVA = (c: Character) =>
    c.voice_actors.find((va) => va.language === "Japanese") || c.voice_actors[0];

  return (
    <section className={compact ? "mt-6" : "mt-10"}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className={`font-bold flex items-center gap-2 ${compact ? "text-base sm:text-lg" : "text-xl md:text-2xl"}`}>
          <Users className={compact ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"} />
          Characters & Voice Actors
        </h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md bg-secondary disabled:opacity-40 hover:bg-surface-hover"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5">{page}/{totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md bg-secondary disabled:opacity-40 hover:bg-surface-hover"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {pageItems.map((c) => {
          const va = japaneseVA(c);
          return (
            <div
              key={c.character.mal_id}
              className="rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={c.character.images.webp?.image_url || c.character.images.jpg.image_url}
                  alt={c.character.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-1.5 right-1.5 rounded-full bg-secondary/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {c.role}
                </span>
              </div>
              <div className="p-2.5 space-y-1.5">
                <p className="text-xs font-bold line-clamp-1">{c.character.name}</p>
                {va && (
                  <div className="flex items-center gap-1.5 pt-1 border-t border-border/60">
                    <img
                      src={va.person.images.jpg.image_url}
                      alt={va.person.name}
                      className="h-6 w-6 rounded-full object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground line-clamp-1">🎙 {va.person.name}</p>
                      <p className="text-[9px] text-muted-foreground/70">{va.language}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
