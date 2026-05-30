import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, ExternalLink, Download as DownloadIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import ShareButton from "@/components/ShareButton";
import { useEpisodeDownloads } from "@/hooks/useStreams";

const SERVICE_LABELS: Record<string, string> = {
  upfiles: "UpFiles",
  filepress: "FilePress",
  gofile: "GoFile",
  mixdrop: "MixDrop",
  telegram: "Telegram",
  tg_cc: "Telegram (Backup)",
  pixeldrain: "PixelDrain",
  ddownload: "DDownload",
  anonfiles: "AnonFiles",
  vidara: "Vidara",
};
const label = (s: string) =>
  SERVICE_LABELS[s] || s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const normQuality = (q?: string) => (q || "all").toLowerCase().replace(/\s+/g, "");

export default function DownloadPage() {
  const [params] = useSearchParams();
  const title = params.get("title") || "Unknown Anime";
  const episode = Number(params.get("ep") || "1");
  const animeId = Number(params.get("id") || "0");

  const { data: downloads = [], isLoading } = useEpisodeDownloads(animeId, episode);

  // Real download links — everything that's not a pure-embed (streaming) link
  const dlLinks = useMemo(
    () => downloads.filter((d: any) => (d.link_type ?? "download") !== "embed"),
    [downloads]
  );

  // Service tabs (actual hosts present in the DB)
  const serviceKeys = useMemo(() => {
    const set = new Set<string>();
    dlLinks.forEach((d) => set.add(d.service_name));
    return Array.from(set).sort();
  }, [dlLinks]);

  const serviceTabs = useMemo(
    () => [{ key: "all", label: "All Services" }, ...serviceKeys.map((k) => ({ key: k, label: label(k) }))],
    [serviceKeys]
  );

  // Quality tabs
  const qualityKeys = useMemo(() => {
    const set = new Set<string>();
    dlLinks.forEach((d) => set.add(normQuality(d.quality)));
    return Array.from(set).sort((a, b) =>
      (b.match(/\d+/)?.[0] ?? "0").localeCompare(a.match(/\d+/)?.[0] ?? "0", undefined, { numeric: true })
    );
  }, [dlLinks]);

  const qualityTabs = useMemo(
    () => [{ key: "all", label: "All Quality" }, ...qualityKeys.map((k) => ({ key: k, label: k.toUpperCase() }))],
    [qualityKeys]
  );

  const [activeService, setActiveService] = useState("all");
  const [activeQuality, setActiveQuality] = useState("all");

  useEffect(() => {
    if (!serviceTabs.find((t) => t.key === activeService)) setActiveService("all");
  }, [serviceTabs, activeService]);
  useEffect(() => {
    if (!qualityTabs.find((t) => t.key === activeQuality)) setActiveQuality("all");
  }, [qualityTabs, activeQuality]);

  const visibleLinks = useMemo(() => {
    return dlLinks.filter((d) => {
      const matchService = activeService === "all" || d.service_name === activeService;
      const matchQuality = activeQuality === "all" || normQuality(d.quality) === activeQuality;
      return matchService && matchQuality;
    });
  }, [dlLinks, activeService, activeQuality]);

  const searchQuery = `${title} Episode ${episode} download`;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Link
            to={animeId ? `/anime/${animeId}` : "/"}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Anime
          </Link>
          <ShareButton
            title={`${title} — Episode ${episode} download`}
            text={`Download ${title} Episode ${episode} on AnimeStream`}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            <DownloadIcon className="inline h-6 w-6 text-primary mr-2" />
            Download Episode {episode}
          </h1>
          <p className="text-muted-foreground line-clamp-2">{title}</p>
        </motion.div>

        {/* Safety Notice */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
              <p className="font-bold text-destructive">Safety first</p>
              <p><Shield className="inline h-3.5 w-3.5 text-primary mr-1" />Use a <strong className="text-foreground">VPN</strong> and an <strong className="text-foreground">Ad Blocker</strong> on third-party hosts.</p>
              <p><Shield className="inline h-3.5 w-3.5 text-primary mr-1" />Never download <strong className="text-foreground">.exe</strong> files — only .mkv / .mp4.</p>
              <p><Shield className="inline h-3.5 w-3.5 text-primary mr-1" />We don't host or control these files.</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {!isLoading && dlLinks.length > 0 && (
          <div className="space-y-3 mb-5">
            {/* Quality tabs */}
            {qualityTabs.length > 1 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">Quality</p>
                <div className="flex flex-wrap gap-2">
                  {qualityTabs.map((t) => {
                    const count = t.key === "all" ? dlLinks.length : dlLinks.filter((d) => normQuality(d.quality) === t.key).length;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setActiveQuality(t.key)}
                        className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                          activeQuality === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t.label}<span className="ml-1.5 opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Service tabs */}
            {serviceTabs.length > 1 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">Service</p>
                <div className="flex flex-wrap gap-2">
                  {serviceTabs.map((t) => {
                    const count = t.key === "all" ? dlLinks.length : dlLinks.filter((d) => d.service_name === t.key).length;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setActiveService(t.key)}
                        className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                          activeService === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t.label}<span className="ml-1.5 opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading download links…
          </div>
        ) : visibleLinks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No download links {dlLinks.length > 0 ? "match this filter" : `yet for Episode ${episode}`}. Try a Google search:
            </p>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Search on Google
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleLinks.map((d, i) => (
              <motion.a
                key={d.id}
                href={d.service_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-surface-hover transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate group-hover:text-primary">
                    {label(d.service_name)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                    <span className="uppercase">{d.quality || "all"}</span>
                    {d.category && <span>· {d.category.toUpperCase()}</span>}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
