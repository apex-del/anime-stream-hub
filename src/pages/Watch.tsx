import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Server, Play, ChevronLeft, ChevronRight, Star, Calendar, Film, List } from "lucide-react";
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

const DEMO_VIDEO =
  "https://www.youtube.com/embed/videoseries?list=PLLY8MJl5GiHzC2sB-tEdaaavQ85_y1bL6";

const EPISODES_PER_PAGE = 50;

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEmbed(server: number, slug: string, ep: number, audio: AudioType) {
  const dubSuffix = audio === "dub" ? "-dub" : "";
  switch (server) {
    case 1:
      return `https://2anime.xyz/embed/${slug}${dubSuffix}-episode-${ep}`;
    case 2:
      return `https://anitaku.bz/embed.php?id=${slug}${dubSuffix}-episode-${ep}`;
    case 3:
      return `https://www.youtube.com/embed/?listType=search&list=${encodeURIComponent(
        `${slug.replace(/-/g, " ")} episode ${ep} ${audio === "dub" ? "english dub" : "english sub"}`
      )}`;
    case 4:
    default:
      return DEMO_VIDEO;
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
  const [epPage, setEpPage] = useState(1);

  const { data: animeData, isLoading } = useAnimeById(animeId);
  const { data: episodesData } = useAnimeEpisodes(animeId, 1);
  const { data: recsData } = useAnimeRecommendations(animeId);

  const anime = animeData?.data;
  const episodes = episodesData?.data || [];
  const totalEps = anime?.episodes || episodes.length || 12;
  const recommendations = recsData?.data?.slice(0, 12) || [];

  const slug = useMemo(() => (anime ? slugify(anime.title) : ""), [anime]);
  const embedUrl = useMemo(
    () => (slug ? buildEmbed(server, slug, currentEp, audio) : DEMO_VIDEO),
    [slug, server, currentEp, audio]
  );

  // Auto-jump pagination to the page containing currentEp
  useEffect(() => {
    const page = Math.ceil(currentEp / EPISODES_PER_PAGE);
    setEpPage(page || 1);
  }, [currentEp]);

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

  const totalPages = Math.max(1, Math.ceil(totalEps / EPISODES_PER_PAGE));
  const pageStart = (epPage - 1) * EPISODES_PER_PAGE + 1;
  const pageEnd = Math.min(epPage * EPISODES_PER_PAGE, totalEps);
  const pageEpisodes = useMemo(
    () => Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i),
    [pageStart, pageEnd]
  );

  if (isLoading || !anime) {
    return (
      <Layout>
        <div className="pt-16">
          <div className="aspect-video w-full bg-card animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Full-bleed player */}
      <div className="pt-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full bg-black"
        >
          <div className="aspect-video w-full max-h-[80vh] mx-auto bg-black">
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="w-full h-full block"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer"
              title={`Watch ${getDisplayTitle(anime)} Ep ${currentEp}`}
            />
          </div>
        </motion.div>

        {/* Fixed title bar UNDER iframe */}
        <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 min-w-0">
            <Link
              to={`/anime/${animeId}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-secondary hover:bg-surface-hover px-2.5 py-1.5 text-xs sm:text-sm transition-colors"
              aria-label="Back to info"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xs sm:text-sm md:text-base truncate leading-tight">
                {getDisplayTitle(anime)}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                Episode {currentEp}
                {anime.episodes ? ` of ${anime.episodes}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => currentEp > 1 && updateEp(currentEp - 1)}
                disabled={currentEp <= 1}
                className="p-1.5 rounded-lg bg-secondary hover:bg-surface-hover disabled:opacity-40 transition-colors"
                aria-label="Previous episode"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => currentEp < totalEps && updateEp(currentEp + 1)}
                disabled={currentEp >= totalEps}
                className="p-1.5 rounded-lg bg-secondary hover:bg-surface-hover disabled:opacity-40 transition-colors"
                aria-label="Next episode"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-6xl">
        {/* Sub/Dub + Servers — responsive, no overflow */}
        <div className="rounded-xl bg-card border border-border p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground shrink-0">
              Audio
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {(["sub", "dub"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudio(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium uppercase transition-all ${
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground shrink-0 inline-flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" /> Servers
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
              {[
                { id: 1, label: "Server 1" },
                { id: 2, label: "Server 2" },
                { id: 3, label: "Server 3" },
                { id: 4, label: "Demo" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServer(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border whitespace-nowrap ${
                    server === s.id
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            If a server doesn't load, try another or use the Demo player.
          </p>
        </div>

        {/* Episode List — scrollable + pagination */}
        <section>
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Episodes
            </h2>
            <span className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
              {pageStart}-{pageEnd} / {totalEps}
            </span>
          </div>

          {/* Pagination chips */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setEpPage(p)}
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    epPage === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {(p - 1) * EPISODES_PER_PAGE + 1}-{Math.min(p * EPISODES_PER_PAGE, totalEps)}
                </button>
              ))}
            </div>
          )}

          {totalEps > 40 ? (
            <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border bg-card/40 p-2 sm:p-3">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
                {pageEpisodes.map((n) => (
                  <button
                    key={n}
                    onClick={() => updateEp(n)}
                    className={`aspect-square rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      currentEp === n
                        ? "bg-primary text-primary-foreground scale-105 shadow"
                        : "bg-secondary text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto rounded-xl border border-border bg-card/40 p-2 sm:p-3 space-y-2">
              {pageEpisodes.map((n) => {
                const epInfo = episodes.find((e) => e.mal_id === n);
                const active = currentEp === n;
                return (
                  <button
                    key={n}
                    onClick={() => updateEp(n)}
                    className={`w-full flex items-center gap-3 rounded-lg p-2.5 sm:p-3 text-left transition-all border ${
                      active
                        ? "bg-primary/15 border-primary/40"
                        : "bg-card border-border hover:bg-surface-hover"
                    }`}
                  >
                    <div className={`shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">
                        {epInfo?.title || `Episode ${n}`}
                      </p>
                      {epInfo?.aired && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(epInfo.aired).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {active && <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Mini Anime Info */}
        <section className="rounded-xl bg-card border border-border p-3 sm:p-4 md:p-5">
          <div className="flex gap-3 sm:gap-4">
            <img
              src={anime.images.webp.large_image_url}
              alt={getDisplayTitle(anime)}
              className="w-16 sm:w-20 md:w-28 rounded-lg shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base md:text-lg line-clamp-2">{getDisplayTitle(anime)}</h3>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[11px] sm:text-xs text-muted-foreground">
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
                {anime.type && <span>{anime.type}</span>}
                {anime.status && <span className="truncate">{anime.status}</span>}
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mt-2">
                {anime.synopsis}
              </p>
              <button
                onClick={() => navigate(`/anime/${animeId}`)}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Show full details
              </button>
            </div>
          </div>
        </section>

        {/* Comments */}
        <AnimeComments animeId={animeId} />

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
              <List className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> You Might Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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
