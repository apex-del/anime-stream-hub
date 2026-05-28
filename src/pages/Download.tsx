import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, ExternalLink, Download as DownloadIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import { useEpisodeDownloads } from "@/hooks/useStreams";

const SERVICE_LABELS: Record<string, string> = {
  upfiles: "UpFiles",
  filepress: "FilePress",
  gofile: "GoFile",
  mixdrop: "MixDrop",
  telegram: "Telegram",
  tg_cc: "Telegram (CC)",
  pixeldrain: "PixelDrain",
  ddownload: "DDownload",
  anonfiles: "AnonFiles",
  vidara: "Vidara",
  cuty: "Cuty.io",
  gplinks: "GPLinks",
};
const label = (s: string) =>
  SERVICE_LABELS[s] || s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Shortener domains we recognise inside the URL string
const SHORTENERS = [
  { key: "cuty", label: "Cuty.io", patterns: ["cuty.io", "cuty.exe", "cuty."] },
  { key: "gplinks", label: "GPLinks", patterns: ["gplinks.in", "gplinks.co", "gplinks."] },
  { key: "upfiles", label: "UpFiles", patterns: ["upfiles.com", "upfiles."] },
];

function detectShortener(url: string): string | null {
  const u = url.toLowerCase();
  for (const s of SHORTENERS) if (s.patterns.some((p) => u.includes(p))) return s.key;
  return null;
}

export default function DownloadPage() {
  const [params] = useSearchParams();
  const title = params.get("title") || "Unknown Anime";
  const episode = Number(params.get("ep") || "1");
  const animeId = Number(params.get("id") || "0");

  const { data: downloads = [], isLoading } = useEpisodeDownloads(animeId, episode);

  // Only true downloads (skip embed-only providers)
  const realDownloads = useMemo(
    () => downloads.filter((d: any) => (d.link_type ?? "download") !== "embed"),
    [downloads]
  );

  // Detect available shorteners in dataset
  const shortenerKeys = useMemo(() => {
    const set = new Set<string>();
    realDownloads.forEach((d) => {
      const k = detectShortener(d.service_url);
      if (k) set.add(k);
    });
    return Array.from(set);
  }, [realDownloads]);

  const tabs = useMemo(
    () => [{ key: "all", label: "All" }, ...shortenerKeys.map((k) => ({ key: k, label: SHORTENERS.find((s) => s.key === k)?.label ?? k }))],
    [shortenerKeys]
  );

  const [activeTab, setActiveTab] = useState<string>("all");
  useEffect(() => {
    if (!tabs.find((t) => t.key === activeTab)) setActiveTab("all");
  }, [tabs, activeTab]);

  const visibleLinks = useMemo(() => {
    if (activeTab === "all") return realDownloads;
    return realDownloads.filter((d) => detectShortener(d.service_url) === activeTab);
  }, [realDownloads, activeTab]);

  const searchQuery = `${title} Episode ${episode} download`;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <Link
          to={animeId ? `/anime/${animeId}` : "/"}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Anime
        </Link>

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

        {/* Shortener tabs */}
        {!isLoading && realDownloads.length > 0 && tabs.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((t) => {
              const count = t.key === "all"
                ? realDownloads.length
                : realDownloads.filter((d) => detectShortener(d.service_url) === t.key).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                    activeTab === t.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className="ml-1.5 opacity-70">({count})</span>
                </button>
              );
            })}
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
              No direct shortened links yet for Episode {episode}. Try a Google search:
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
            {visibleLinks.map((d, i) => {
              const short = detectShortener(d.service_url);
              return (
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
                      {short && (
                        <span className="rounded-full bg-primary/15 text-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase">
                          via {SHORTENERS.find((s) => s.key === short)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                </motion.a>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
