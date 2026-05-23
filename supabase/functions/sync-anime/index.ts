// Pipeline endpoint: ingest a single anime's full data into the cache.
// Auth: requires `x-pipeline-key` header matching SYNC_PIPELINE_KEY secret (if set).
// Body: { mal_id: number } or { mal_id, data, episodes? }  (if data omitted, fetches from Jikan)
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const JIKAN = "https://api.jikan.moe/v4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const pipelineKey = Deno.env.get("SYNC_PIPELINE_KEY");
    if (pipelineKey) {
      const provided = req.headers.get("x-pipeline-key");
      if (provided !== pipelineKey) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const malId = Number(body?.mal_id);
    if (!malId) {
      return new Response(JSON.stringify({ error: "mal_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let data = body?.data;
    let source = "pipeline";
    if (!data) {
      const r = await fetch(`${JIKAN}/anime/${malId}/full`);
      if (!r.ok) throw new Error(`jikan ${r.status}`);
      const j = await r.json();
      data = j.data;
      source = "jikan";
    }

    await supabase.from("anime_cache").upsert({
      mal_id: malId, data, source, synced_at: new Date().toISOString(),
    });

    // Optional: episodes array
    if (Array.isArray(body?.episodes)) {
      await supabase.from("anime_episodes_cache").upsert({
        anime_id: malId, page: 1,
        data: { data: body.episodes, pagination: { last_visible_page: 1, has_next_page: false } },
        synced_at: new Date().toISOString(),
      }, { onConflict: "anime_id,page" });
    }

    return new Response(JSON.stringify({ ok: true, mal_id: malId, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
