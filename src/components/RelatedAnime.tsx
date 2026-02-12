import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GitBranch } from "lucide-react";

interface Relation {
  relation: string;
  entry: Array<{ mal_id: number; type: string; name: string; url: string }>;
}

export default function RelatedAnime({ animeId }: { animeId: number }) {
  const { data } = useQuery({
    queryKey: ["anime-relations", animeId],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/relations`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ data: Relation[] }>;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!animeId,
  });

  const relations = data?.data || [];
  const animeRelations = relations.filter((r) =>
    r.entry.some((e) => e.type === "anime")
  );

  if (animeRelations.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        Related Anime
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {animeRelations.map((rel, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-4">
            <span className="text-xs font-bold text-primary mb-2 block">{rel.relation}</span>
            {rel.entry
              .filter((e) => e.type === "anime")
              .map((entry) => (
                <Link
                  key={entry.mal_id}
                  to={`/anime/${entry.mal_id}`}
                  className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                >
                  {entry.name}
                </Link>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
