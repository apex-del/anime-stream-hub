// Public anime API backed by Supabase cache with Jikan fallback.
// Routes (GET):
//   /anime-api/anime/:id              -> single anime
//   /anime-api/anime/:id/episodes     -> episodes (page query)
//   /anime-api/list/:key              -> cached list by key (top, trending, seasonal, etc.)
//   /anime-api/passthrough?path=...   -> raw Jikan passthrough (cached short-term in lists)
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const JIKAN = "https://api.jikan.moe/v4";
const LIST_TTL_MS = 1000 * 60 * 30; // 30 min for list cache

async function jikan(path: string) {
  const r = await fetch(`${JIKAN}${path}`);
  if (!r.ok) throw new Error(`Jikan ${r.status}`);
  return r.json();
}

function ok(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function err(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    // Strip the /anime-api prefix that Supabase functions use
    const parts = url.pathname.replace(/^\/anime-api\/?/, "").split("/").filter(Boolean);

    // /anime/:id and /anime/:id/episodes
    if (parts[0] === "anime" && parts[1]) {
      const id = Number(parts[1]);
      if (!id) return err("invalid id", 400);

      if (parts[2] === "episodes") {
        const page = Number(url.searchParams.get("page") ?? 1);
        const { data: cached } = await supabase
          .from("anime_episodes_cache")
          .select("data,synced_at")
          .eq("anime_id", id)
          .eq("page", page)
          .maybeSingle();
        if (cached) return ok({ ...cached.data, _cached: true });
        const fresh = await jikan(`/anime/${id}/episodes?page=${page}`);
        await supabase.from("anime_episodes_cache").upsert({
          anime_id: id, page, data: fresh, synced_at: new Date().toISOString(),
        }, { onConflict: "anime_id,page" });
        return ok(fresh);
      }

      // single anime
      const { data: cached } = await supabase
        .from("anime_cache").select("data,synced_at").eq("mal_id", id).maybeSingle();
      if (cached) return ok({ data: cached.data, _cached: true });
      const fresh = await jikan(`/anime/${id}/full`);
      if (fresh?.data) {
        await supabase.from("anime_cache").upsert({
          mal_id: id, data: fresh.data, synced_at: new Date().toISOString(), source: "jikan",
        });
      }
      return ok(fresh);
    }

    // /list/:key  -> cached curated list
    if (parts[0] === "list" && parts[1]) {
      const key = parts.slice(1).join("/") + "?" + url.searchParams.toString();
      const { data: cached } = await supabase
        .from("anime_lists_cache").select("data,synced_at,expires_at").eq("cache_key", key).maybeSingle();
      if (cached && (!cached.expires_at || new Date(cached.expires_at) > new Date())) {
        return ok({ ...cached.data, _cached: true });
      }
      const jikanPath = url.searchParams.get("path");
      if (!jikanPath) return err("missing ?path=", 400);
      const fresh = await jikan(jikanPath);
      await supabase.from("anime_lists_cache").upsert({
        cache_key: key, data: fresh,
        synced_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + LIST_TTL_MS).toISOString(),
      });
      return ok(fresh);
    }

    // passthrough
    if (parts[0] === "passthrough") {
      const path = url.searchParams.get("path");
      if (!path) return err("missing ?path=", 400);
      return ok(await jikan(path));
    }

    return err("not found", 404);
  } catch (e) {
    return err((e as Error).message);
  }
});
