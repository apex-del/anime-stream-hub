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

export async function fetchStreams(malId: number, episode?: number): Promise<StreamLink[]> {
  const params = new URLSearchParams({
    select: "*",
    mal_id: `eq.${malId}`,
    status: "eq.active",
    order: "service_name.asc",
  });
  if (episode != null) params.set("episode_number", `eq.${episode}`);
  const r = await fetch(`${EXT_URL}/rest/v1/streaming_urls?${params}`, { headers });
  if (!r.ok) return [];
  const rows: StreamLink[] = await r.json();
  // Drop rows that have no usable player URL (empty embed + service url),
  // and de-duplicate identical URLs so the same server isn't listed twice.
  const seen = new Set<string>();
  return rows.filter((s) => {
    const url = (s.embed_url || s.service_url || "").trim();
    if (!url) return false;
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
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
