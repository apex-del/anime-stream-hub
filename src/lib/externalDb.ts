// External pipeline DB (publishable key — safe in client)
const EXT_URL = "https://fzrpquslqktavfqbmccu.supabase.co";
const EXT_KEY = "sb_publishable_1Mj9H6h54_sJqKdTCHjLkQ_bxid-IGr";

const headers = { apikey: EXT_KEY, Authorization: `Bearer ${EXT_KEY}` };

export interface StreamLink {
  id: string;
  mal_id: number;
  episode_number: number;
  quality: string;
  category: "sub" | "dub";
  service_name: string;
  service_url: string;
  embed_url: string | null;
  status: string;
}

export interface DownloadLink {
  id: string;
  mal_id: number;
  episode_number: number;
  quality: string;
  category: string;
  service_name: string;
  service_url: string;
  status: string;
  link_type?: string;
}

// Shortened (monetized) links — cuty / exe / gplinks
export interface ShortLink {
  id: string;
  mal_id: number;
  episode_number: number;
  quality: string;
  category: string;
  service_name: string; // host (mixdrop, filepress, etc.)
  original_url: string;
  short_url: string;
  short_service: "cuty" | "exe" | "gplinks" | string;
  link_type: string; // both | download | embed
  status: string;
}

export interface ExtEpisode {
  episode_number: number;
  title: string | null;
  title_english: string | null;
  aired_string: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
  thumbnail: string | null;
}

const EMBED_HOSTS = new Set(["vidara", "turbovid", "turboviplay", "abyss"]);
const STREAM_PRIORITY: Record<string, number> = { vidara: 0, turbovid: 1, abyss: 2 };

function normalizeServiceName(service: string) {
  const s = service.toLowerCase().trim();
  if (s === "turboviplay") return "turbovid";
  return s;
}

function normalizePlayerUrl(url?: string | null) {
  const value = (url || "").trim();
  if (!value) return "";
  return value.replace(/^https:\/\/vidaraa\.cc\//i, "https://vidara.to/");
}

export async function fetchStreams(malId: number, episode?: number): Promise<StreamLink[]> {
  const params = new URLSearchParams({
    select: "*",
    mal_id: `eq.${malId}`,
    status: "eq.active",
    order: "service_name.asc",
  });
  if (episode != null) params.set("episode_number", `eq.${episode}`);
  const [streamRes, uploadRows] = await Promise.all([
    fetch(`${EXT_URL}/rest/v1/streaming_urls?${params}`, { headers }),
    fetchDownloads(malId, episode),
  ]);
  const rows: StreamLink[] = streamRes.ok ? await streamRes.json() : [];
  const uploadStreams: StreamLink[] = uploadRows
    .filter(
      (u) =>
        u.status === "completed" &&
        (u.link_type ?? "both") !== "download" &&
        EMBED_HOSTS.has(normalizeServiceName(u.service_name))
    )
    .map((u) => ({
      id: `upload-${u.id}`,
      mal_id: u.mal_id,
      episode_number: u.episode_number,
      quality: u.quality,
      category: (u.category === "dub" ? "dub" : "sub") as "sub" | "dub",
      service_name: normalizeServiceName(u.service_name),
      service_url: normalizePlayerUrl(u.service_url),
      embed_url: normalizePlayerUrl(u.service_url),
      status: "active",
    }));
  // Drop rows that have no usable player URL (empty embed + service url),
  // and de-duplicate identical URLs so the same server isn't listed twice.
  const seen = new Set<string>();
  return [...rows, ...uploadStreams].filter((s) => {
    s.service_name = normalizeServiceName(s.service_name);
    s.embed_url = normalizePlayerUrl(s.embed_url || s.service_url);
    s.service_url = normalizePlayerUrl(s.service_url || s.embed_url);
    const url = (s.embed_url || s.service_url || "").trim();
    if (!url) return false;
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  }).sort((a, b) => (STREAM_PRIORITY[a.service_name] ?? 99) - (STREAM_PRIORITY[b.service_name] ?? 99));
}

export async function fetchDownloads(malId: number, episode?: number): Promise<DownloadLink[]> {
  const params = new URLSearchParams({
    select: "*",
    mal_id: `eq.${malId}`,
    order: "service_name.asc",
  });
  if (episode != null) params.set("episode_number", `eq.${episode}`);
  const r = await fetch(`${EXT_URL}/rest/v1/uploads?${params}`, { headers });
  if (!r.ok) return [];
  return r.json();
}

export async function fetchShortLinks(malId: number, episode?: number): Promise<ShortLink[]> {
  const params = new URLSearchParams({
    select: "*",
    mal_id: `eq.${malId}`,
    status: "eq.completed",
    order: "service_name.asc",
  });
  if (episode != null) params.set("episode_number", `eq.${episode}`);
  const r = await fetch(`${EXT_URL}/rest/v1/shortened_urls?${params}`, { headers });
  if (!r.ok) return [];
  return r.json();
}

// Backup episode list from the pipeline DB (used when Jikan has none)
export async function fetchExtEpisodes(malId: number): Promise<ExtEpisode[]> {
  const params = new URLSearchParams({
    select: "episode_number,title,title_english,aired_string,score,filler,recap,thumbnail",
    anime_mal_id: `eq.${malId}`,
    order: "episode_number.asc",
  });
  const r = await fetch(`${EXT_URL}/rest/v1/episodes?${params}`, { headers });
  if (!r.ok) return [];
  return r.json();
}
