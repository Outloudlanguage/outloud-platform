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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, { 
      global: { headers: { Authorization: req.headers.get("Authorization")! } } 
    });

    const { data: { user } } = await supabaseClient.auth.getUser();

    const payload = await req.json();
    const { lesson_id, node_id, audio_url, display_text } = payload;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const workerUrl = Deno.env.get("ACOUSTIC_WORKER_URL");
    const workerSecret = Deno.env.get("ACOUSTIC_WORKER_SECRET");

    if (!workerSecret || !workerUrl) {
      throw new Error("Missing Secrets: ACOUSTIC_WORKER_URL or ACOUSTIC_WORKER_SECRET not set.");
    }

    const workerRes = await fetch(`${workerUrl}/ingest-sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-worker-secret": workerSecret },
      body: JSON.stringify({ 
        audio_url: audio_url, 
        display_text: display_text 
      })
    });

    if (!workerRes.ok) throw new Error(`Worker Error: ${await workerRes.text()}`);
    
    const { reference_acoustic_profile } = await workerRes.json();

    await supabaseAdmin.from("speech_exercise_samples").upsert({
      lesson_id,
      node_id,
      reference_audio_url: audio_url,
      reference_text: display_text,
      reference_acoustic_profile,
      cefr_level: "A1",
      dialect: "en-US",
      created_by: user?.id || null
    }, { onConflict: 'lesson_id,node_id' });

    return new Response(JSON.stringify({ success: true }), { 
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