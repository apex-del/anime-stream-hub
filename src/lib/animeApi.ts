// Lightweight client for our edge-function anime API (Supabase-backed cache).
// Falls back to direct Jikan if the edge function is unreachable.
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anime-api`;
const JIKAN = "https://api.jikan.moe/v4";

async function callFn(path: string): Promise<any> {
  try {
    const r = await fetch(`${FN_URL}${path}`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    return null;
  }
}

export async function apiGetAnime(id: number) {
  const cached = await callFn(`/anime/${id}`);
  if (cached?.data) return cached;
  const r = await fetch(`${JIKAN}/anime/${id}/full`);
  return r.json();
}

export async function apiGetEpisodes(id: number, page = 1) {
  const cached = await callFn(`/anime/${id}/episodes?page=${page}`);
  if (cached?.data) return cached;
  const r = await fetch(`${JIKAN}/anime/${id}/episodes?page=${page}`);
  return r.json();
}

export async function apiGetList(key: string, jikanPath: string) {
  const cached = await callFn(`/list/${encodeURIComponent(key)}?path=${encodeURIComponent(jikanPath)}`);
  if (cached?.data) return cached;
  const r = await fetch(`${JIKAN}${jikanPath}`);
  return r.json();
}
