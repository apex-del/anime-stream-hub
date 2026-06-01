import { useMemo, useState, useEffect } from "react";
import { ExternalLink, Link2, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useEpisodeShortLinks } from "@/hooks/useStreams";
import type { ShortLink } from "@/lib/externalDb";

const HOST_LABELS: Record<string, string> = {
  upfiles: "UpFiles",
  filepress: "FilePress",
  gofile: "GoFile",
  mixdrop: "MixDrop",
  telegram: "Telegram",
  tg_cc: "Telegram (Backup)",
  pixeldrain: "PixelDrain",
  ddownload: "DDownload",
  anonfiles: "AnonFiles",
  abyss: "Abyss",
  turboviplay: "TurboVid",
};
const hostLabel = (s: string) =>
  HOST_LABELS[s] || s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const SHORTENER_LABELS: Record<string, string> = {
  cuty: "Cuty",
  exe: "Exe.io",
  gplinks: "GPLinks",
};
const shortLabel = (s: string) => SHORTENER_LABELS[s] || s.replace(/\b\w/g, (c) => c.toUpperCase());

const normQuality = (q?: string) => (q || "all").toLowerCase().replace(/\s+/g, "");

interface Props {
  malId: number;
  episode: number;
  compact?: boolean;
}

/**
 * Shortened (monetized) download links with switchable shortener
 * service tabs (Cuty / Exe / GPLinks) plus quality filtering.
 */
export default function ShortLinks({ malId, episode, compact }: Props) {
  const { data: links = [], isLoading } = useEpisodeShortLinks(malId, episode);

  // Only download-type shortened links (exclude pure embeds)
  const dlLinks = useMemo(
    () => links.filter((l) => (l.link_type ?? "download") !== "embed"),
    [links]
  );

  // Shortener services present
  const shorteners = useMemo(() => {
    const set = new Set<string>();
    dlLinks.forEach((l) => set.add(l.short_service));
    return Array.from(set).sort();
  }, [dlLinks]);

  const [activeShort, setActiveShort] = useState<string>("");
  const [activeQuality, setActiveQuality] = useState("all");

  useEffect(() => {
    if (shorteners.length && !shorteners.includes(activeShort)) {
      setActiveShort(shorteners[0]);
    }
  }, [shorteners, activeShort]);

  const byShort = useMemo(
    () => dlLinks.filter((l) => l.short_service === activeShort),
    [dlLinks, activeShort]
  );

  const qualityKeys = useMemo(() => {
    const set = new Set<string>();
    byShort.forEach((l) => set.add(normQuality(l.quality)));
    return Array.from(set).sort((a, b) =>
      (b.match(/\d+/)?.[0] ?? "0").localeCompare(a.match(/\d+/)?.[0] ?? "0", undefined, { numeric: true })
    );
  }, [byShort]);

  useEffect(() => {
    if (activeQuality !== "all" && !qualityKeys.includes(activeQuality)) setActiveQuality("all");
  }, [qualityKeys, activeQuality]);

  const visible = useMemo(
    () => byShort.filter((l) => activeQuality === "all" || normQuality(l.quality) === activeQuality),
    [byShort, activeQuality]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading download links…
      </div>
    );
  }

  if (dlLinks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <AlertCircle className="h-3.5 w-3.5" /> No shortened download links yet for this episode.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Shortener service tabs */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5" /> Shortener service
        </p>
        <div className="flex flex-wrap gap-2">
          {shorteners.map((s) => {
            const count = dlLinks.filter((l) => l.short_service === s).length;
            return (
              <button
                key={s}
                onClick={() => setActiveShort(s)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                  activeShort === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {shortLabel(s)}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality tabs */}
      {qualityKeys.length > 1 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
            Quality
          </p>
          <div className="flex flex-wrap gap-2">
            {["all", ...qualityKeys].map((q) => (
              <button
                key={q}
                onClick={() => setActiveQuality(q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeQuality === q
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {q === "all" ? "All" : q.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-3"} gap-2.5`}>
        {visible.map((l: ShortLink) => (
          <a
            key={l.id}
            href={l.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 p-3.5 hover:border-primary/40 hover:bg-surface-hover transition-all"
          >
            <div className="min-w-0">
              <div className="text-sm font-bold truncate group-hover:text-primary">
                {hostLabel(l.service_name)}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="uppercase">{l.quality || "all"}</span>
                {l.category && <span>· {l.category.toUpperCase()}</span>}
                <span className="inline-flex items-center gap-0.5 text-primary/70">
                  <ShieldCheck className="h-3 w-3" /> via {shortLabel(l.short_service)}
                </span>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
