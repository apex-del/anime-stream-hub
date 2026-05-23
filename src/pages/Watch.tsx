import { useState, useMemo } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Server, Play, ChevronLeft, ChevronRight, Star, Calendar, Film } from "lucide-react";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import AnimeComments from "@/components/AnimeComments";
import {
  useAnimeById,
  useAnimeEpisodes,
  useAnimeRecommendations,
} from "@/hooks/useAnime";
import { getDisplayTitle } from "@/lib/jikan";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAuth } from "@/hooks/useAuth";

type AudioType = "sub" | "dub";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEmbed(server: number, slug: string, ep: number, audio: AudioType, malId: number) {
  const dubSuffix = audio === "dub" ? "-dub" : "";
  switch (server) {
    case 1:
      return `https://2anime.xyz/embed/${slug}${dubSuffix}-episode-${ep}`;
    case 2:
      return `https://anitaku.bz/embed.php?id=${slug}${dubSuffix}-episode-${ep}`;
    case 3:
    default:
      return `https://www.youtube.com/embed/?listType=search&list=${encodeURIComponent(
        `${slug.replace(/-/g, " ")} episode ${ep} ${audio === "dub" ? "english dub" : "english sub"}`
      )}`;
  }
}

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const animeId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToHistory } = useWatchHistory();

  const initialEp = Number(searchParams.get("ep")) || 1;
  const [currentEp, setCurrentEp] = useState(initialEp);
  const [audio, setAudio] = useState<AudioType>("sub");
  const [server, setServer] = useState<number>(1);

  const { data: animeData, isLoading } = useAnimeById(animeId);
  const { data: episodesData } = useAnimeEpisodes(animeId, 1);
  const { data: recsData } = useAnimeRecommendations(animeId);

  const anime = animeData?.data;
  const episodes = episodesData?.data || [];
  const totalEps = anime?.episodes || episodes.length || 12;
  const recommendations = recsData?.data?.slice(0, 12) || [];

  const slug = useMemo(() => (anime ? slugify(anime.title) : ""), [anime]);
  const embedUrl = useMemo(
    () => (slug ? buildEmbed(server, slug, currentEp, audio, animeId) : ""),
    [slug, server, currentEp, audio, animeId]
  );

  const updateEp = (n: number) => {
    setCurrentEp(n);
    setSearchParams({ ep: String(n) });
    if (user && anime) {
      addToHistory.mutate({
        anime_id: anime.mal_id,
        anime_title: getDisplayTitle(anime),
        anime_image: anime.images.webp.large_image_url,
        episode_number: n,
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading || !anime) {
    return (
      <Layout>
        <div className="pt-20 container mx-auto px-4">
          <div className="aspect-video w-full bg-card animate-pulse rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="pt-16 sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to={`/anime/${animeId}`}
            className="flex items-center gap-2 rounded-lg bg-secondary hover:bg-surface-hover px-3 py-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Info</span>
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="font-bold text-sm md:text-base truncate">{getDisplayTitle(anime)}</h1>
            <p className="text-xs text-muted-foreground">Episode {currentEp}{anime.episodes ? ` of ${anime.episodes}` : ""}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => currentEp > 1 && updateEp(currentEp - 1)}
              disabled={currentEp <= 1}
              className="p-2 rounded-lg bg-secondary hover:bg-surface-hover disabled:opacity-40 transition-colors"
              aria-label="Previous episode"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => currentEp < totalEps && updateEp(currentEp + 1)}
              disabled={currentEp >= totalEps}
              className="p-2 rounded-lg bg-secondary hover:bg-surface-hover disabled:opacity-40 transition-colors"
              aria-label="Next episode"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Player */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-border shadow-2xl">
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer"
              title={`Watch ${getDisplayTitle(anime)} Ep ${currentEp}`}
            />
          </div>

          {/* Sub/Dub + Servers */}
          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Audio:</span>
              <div className="flex gap-2">
                {(["sub", "dub"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudio(a)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium uppercase transition-all ${
                      audio === a
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <Server className="h-4 w-4" /> Servers:
              </span>
              <div className="flex gap-2 flex-1 min-w-0">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setServer(s)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      server === s
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Server {s}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              If the current server doesn't load, try switching to another server or audio option.
            </p>
          </div>
        </motion.div>

        {/* Episode List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" /> Episodes
            </h2>
            <span className="text-xs text-muted-foreground">{totalEps} total</span>
          </div>

          {totalEps > 40 ? (
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => updateEp(n)}
                  className={`aspect-square rounded-lg text-sm font-bold transition-all ${
                    currentEp === n
                      ? "bg-primary text-primary-foreground scale-105"
                      : "bg-secondary text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: totalEps }, (_, i) => i + 1).map((n) => {
                const epInfo = episodes.find((e) => e.mal_id === n);
                const active = currentEp === n;
                return (
                  <button
                    key={n}
                    onClick={() => updateEp(n)}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all border ${
                      active
                        ? "bg-primary/15 border-primary/40"
                        : "bg-card border-border hover:bg-surface-hover"
                    }`}
                  >
                    <div className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {epInfo?.title || `Episode ${n}`}
                      </p>
                      {epInfo?.aired && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(epInfo.aired).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {active && <Play className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Mini Anime Info */}
        <section className="rounded-xl bg-card border border-border p-4 md:p-5">
          <div className="flex gap-4">
            <img
              src={anime.images.webp.large_image_url}
              alt={getDisplayTitle(anime)}
              className="w-20 md:w-28 rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg line-clamp-2">{getDisplayTitle(anime)}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                {anime.score && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {anime.score}
                  </span>
                )}
                {anime.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {anime.year}
                  </span>
                )}
                <span>{anime.type}</span>
                <span>{anime.status}</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-2">
                {anime.synopsis}
              </p>
              <button
                onClick={() => navigate(`/anime/${animeId}`)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <Info className="h-3.5 w-3.5" /> Show full details
              </button>
            </div>
          </div>
        </section>

        {/* Comments */}
        <AnimeComments animeId={animeId} />

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-lg md:text-xl font-bold mb-3">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((rec, i) => (
                <AnimeCard key={rec.entry.mal_id} anime={rec.entry as any} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
