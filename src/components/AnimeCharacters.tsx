import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

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

export default function AnimeCharacters({ animeId }: { animeId: number }) {
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

  const characters = data?.data?.slice(0, 12) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (characters.length === 0) return null;

  const japaneseVA = (c: Character) =>
    c.voice_actors.find((va) => va.language === "Japanese");

  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Characters & Voice Actors
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {characters.map((c) => {
          const va = japaneseVA(c);
          return (
            <div
              key={c.character.mal_id}
              className="rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/20 transition-colors"
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
              <div className="p-2.5">
                <p className="text-xs font-bold line-clamp-1">{c.character.name}</p>
                {va && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    🎙 {va.person.name}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
