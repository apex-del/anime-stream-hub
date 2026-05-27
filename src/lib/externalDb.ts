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
  return r.json();
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
