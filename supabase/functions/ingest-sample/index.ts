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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // DYNAMIC AUTH: Attempt to get user, but do not throw error if null (Allow admin calls)
    const { data: { user } } = await supabaseClient.auth.getUser();

    const { lesson_id, node_id, reference_audio_url, target_text } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Call Python Acoustic Worker to build profile
    const workerUrl = Deno.env.get("ACOUSTIC_WORKER_URL");
    const workerSecret = Deno.env.get("ACOUSTIC_WORKER_SECRET");

    if (!workerSecret || !workerUrl) {
      throw new Error("Secretos faltantes: ACOUSTIC_WORKER_URL o ACOUSTIC_WORKER_SECRET no están configurados en Supabase.");
    }

    const workerRes = await fetch(`${workerUrl}/ingest-sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-worker-secret": workerSecret },
      body: JSON.stringify({ 
        audio_url: reference_audio_url, 
        display_text: target_text 
      })
    });

    if (!workerRes.ok) throw new Error(`Worker Error: ${await workerRes.text()}`);
    const { reference_acoustic_profile } = await workerRes.json();

    // Securely Save Profile to DB using Service Role
    await supabaseAdmin.from("speech_exercise_samples").upsert({
      lesson_id,
      node_id,
      reference_audio_url,
      reference_text: target_text,
      reference_acoustic_profile,
      cefr_level: "A1", // Default, update as needed
      dialect: "en-US",
      created_by: user?.id || null // Save admin ID if available, otherwise null
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