import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import AnimeRow from "@/components/AnimeRow";
import AnimeCard from "@/components/AnimeCard";
import LeaderboardGrid from "@/components/LeaderboardGrid";
import { useTopAnime, useSeasonNow } from "@/hooks/useAnime";
import type { JikanAnime } from "@/lib/jikan";

function PosterGrid({
  title,
  emoji,
  animeList,
  isLoading,
}: {
  title: string;
  emoji: string;
  animeList: JikanAnime[];
  isLoading?: boolean;
}) {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          {emoji} {title}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {animeList.slice(0, 12).map((a, i) => (
              <AnimeCard key={a.mal_id} anime={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { data: topData, isLoading: topLoading } = useTopAnime();
  const { data: airingData, isLoading: airingLoading } = useTopAnime("airing");
  const { data: popularData, isLoading: popularLoading } = useTopAnime("bypopularity");
  const { data: seasonData, isLoading: seasonLoading } = useSeasonNow();
  const { data: favoriteData, isLoading: favoriteLoading } = useTopAnime("favorite");

  const heroAnime = topData?.data || [];

  return (
    <Layout>
      {heroAnime.length > 0 && <HeroSection animeList={heroAnime} />}

      {topLoading && (
        <div className="h-[70vh] min-h-[500px] bg-card animate-pulse" />
      )}

      <div className="space-y-2 pb-12">
        <AnimeRow
          title="🔥 Trending Now"
          animeList={airingData?.data || []}
          isLoading={airingLoading}
        />

        <PosterGrid
          title="This Season"
          emoji="📺"
          animeList={seasonData?.data || []}
          isLoading={seasonLoading}
        />

        <PosterGrid
          title="Most Popular"
          emoji="⭐"
          animeList={popularData?.data || []}
          isLoading={popularLoading}
        />

        <PosterGrid
          title="Top Rated"
          emoji="🏆"
          animeList={topData?.data || []}
          isLoading={topLoading}
        />

        <LeaderboardGrid
          title="💖 Fan Favorites"
          animeList={favoriteData?.data || []}
          isLoading={favoriteLoading}
        />
      </div>
    </Layout>
  );
}
