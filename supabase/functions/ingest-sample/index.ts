import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Verify user is authenticated (can add strict admin-only check here)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { lesson_id, node_id, display_text, dialect, audio_base64, cefr_level } = await req.json();

    // 1. Send to Python Acoustic Worker
    const workerUrl = Deno.env.get("ACOUSTIC_WORKER_URL");
    const workerSecret = Deno.env.get("ACOUSTIC_WORKER_SECRET");

    const workerRes = await fetch(`${workerUrl}/ingest-sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-worker-secret": workerSecret! },
      body: JSON.stringify({ display_text, dialect, audio_base64 })
    });

    if (!workerRes.ok) throw new Error(`Worker Error: ${await workerRes.text()}`);
    const { reference_acoustic_profile } = await workerRes.json();

    // 2. Save securely to database using Service Role (bypassing RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: dbError } = await supabaseAdmin.from("speech_exercise_samples").upsert({
      lesson_id,
      node_id,
      cefr_level,
      dialect,
      display_text,
      audio_storage_path: `samples/${lesson_id}/${node_id}.webm`, // Assuming upload handled separately
      reference_acoustic_profile,
      profile_status: "ready"
    }, { onConflict: 'lesson_id, node_id' });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  }
});