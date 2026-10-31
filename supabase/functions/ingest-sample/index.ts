import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const { lesson_id, node_id, audio_url, display_text } = await req.json();

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. CACHE CHECK: Select * so we never fail on column name differences
    const { data: existingSample } = await supabaseAdmin
      .from("speech_exercise_samples")
      .select("*")
      .eq("lesson_id", lesson_id)
      .eq("node_id", node_id)
      .maybeSingle();

    if (
      existingSample &&
      existingSample.reference_acoustic_profile &&
      existingSample.reference_audio_url === audio_url
    ) {
      return new Response(JSON.stringify({ success: true, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // 2. CALL PYTHON WORKER WITH AUTO-RETRY ON 502/503/504
    const workerUrl = Deno.env.get("ACOUSTIC_WORKER_URL");
    const workerSecret = Deno.env.get("ACOUSTIC_WORKER_SECRET");

    if (!workerSecret || !workerUrl) {
      throw new Error("Missing Secrets: ACOUSTIC_WORKER_URL or ACOUSTIC_WORKER_SECRET not set.");
    }

    let workerRes: Response | null = null;
    let lastErrorText = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      workerRes = await fetch(`${workerUrl}/ingest-sample`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-worker-secret": workerSecret },
        body: JSON.stringify({
          audio_url: audio_url,
          display_text: display_text
        })
      });

      if (workerRes.ok) break;

      lastErrorText = await workerRes.text();
      if (workerRes.status >= 500 && attempt < 3) {
        await new Promise((r) => setTimeout(r, 2500 * attempt));
        continue;
      }
      throw new Error(`Worker Error (${workerRes.status}): ${lastErrorText}`);
    }

    if (!workerRes || !workerRes.ok) {
      throw new Error(`Worker Error: ${lastErrorText}`);
    }

    const { reference_acoustic_profile } = await workerRes.json();

    // 3. SAVE PROFILE TO DB (Adaptive payload without 'created_by')
    const baseRecord: Record<string, any> = {
      lesson_id,
      node_id,
      reference_audio_url: audio_url,
      reference_acoustic_profile,
      cefr_level: "A1",
      dialect: "en-US"
    };

    // Try with display_text first, fallback to reference_text or baseRecord if column doesn't exist
    let { error: upsertError } = await supabaseAdmin
      .from("speech_exercise_samples")
      .upsert({ ...baseRecord, display_text }, { onConflict: "lesson_id,node_id" });

    if (upsertError && upsertError.message.includes("display_text")) {
      const retry1 = await supabaseAdmin
        .from("speech_exercise_samples")
        .upsert({ ...baseRecord, reference_text: display_text }, { onConflict: "lesson_id,node_id" });
      upsertError = retry1.error;
    }

    if (upsertError && upsertError.message.includes("reference_text")) {
      const retry2 = await supabaseAdmin
        .from("speech_exercise_samples")
        .upsert(baseRecord, { onConflict: "lesson_id,node_id" });
      upsertError = retry2.error;
    }

    if (upsertError) throw new Error(`DB Upsert Error: ${upsertError.message}`);

    return new Response(JSON.stringify({ success: true, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});