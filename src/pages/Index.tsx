import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import AnimeRow from "@/components/AnimeRow";
import { useTopAnime, useSeasonNow } from "@/hooks/useAnime";

export default function Home() {
  const { data: topData, isLoading: topLoading } = useTopAnime();
  const { data: airingData, isLoading: airingLoading } = useTopAnime("airing");
  const { data: popularData, isLoading: popularLoading } = useTopAnime("bypopularity");
  const { data: seasonData, isLoading: seasonLoading } = useSeasonNow();

  const heroAnime = topData?.data || [];

  return (
    <Layout>
      {/* Hero */}
      {heroAnime.length > 0 && <HeroSection animeList={heroAnime} />}

      {/* Loading hero placeholder */}
      {topLoading && (
        <div className="h-[70vh] min-h-[500px] bg-card animate-pulse" />
      )}

      <div className="space-y-2 pb-12">
        <AnimeRow
          title="🔥 Trending Now"
          animeList={airingData?.data || []}
          isLoading={airingLoading}
        />

        <AnimeRow
          title="📺 This Season"
          animeList={seasonData?.data || []}
          isLoading={seasonLoading}
        />

        <AnimeRow
          title="⭐ Most Popular"
          animeList={popularData?.data || []}
          isLoading={popularLoading}
        />

        <AnimeRow
          title="🏆 Top Rated"
          animeList={topData?.data || []}
          isLoading={topLoading}
        />
      </div>
    </Layout>
  );
}
