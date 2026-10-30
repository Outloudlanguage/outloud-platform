import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. Intercept browser preflight checks explicitly
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { lesson_id, node_id, audio_base64, attempt_number } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch Ground-Truth Sample & CEFR Rules from DB
    const { data: sample } = await supabaseAdmin
      .from("speech_exercise_samples")
      .select("*, cefr_grading_configs(*)")
      .eq("lesson_id", lesson_id)
      .eq("node_id", node_id)
      .single();

    if (!sample || !sample.reference_acoustic_profile) {
      throw new Error("Reference profile not found or not processed.");
    }

    const config = sample.cefr_grading_configs;

    // 2. Call Python Acoustic Worker
    const workerUrl = Deno.env.get("ACOUSTIC_WORKER_URL");
    const workerSecret = Deno.env.get("ACOUSTIC_WORKER_SECRET");

    const workerRes = await fetch(`${workerUrl}/analyze-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-worker-secret": workerSecret! },
      body: JSON.stringify({ 
        reference_acoustic_profile: sample.reference_acoustic_profile, 
        audio_base64 
      })
    });

    if (!workerRes.ok) throw new Error(`Worker Error: ${await workerRes.text()}`);
    const { analysis } = await workerRes.json();

    // 3. Apply CEFR Sliding Scale Grading (The 4-State Matrix)
    let totalScore = 0;
    let validWords = 0;
    
    const gradedTokens = analysis.token_evaluations.map((tok: any) => {
      if (tok.is_filler) return { ...tok, visual_state: "green" };
      
      let state = "red";
      if (tok.omitted) {
        state = "grey_strikethrough";
      } else if (tok.likeness_score >= config.green_phoneme_threshold) {
        state = "green";
      } else if (tok.likeness_score >= config.yellow_phoneme_threshold) {
        state = "yellow";
      }

      totalScore += tok.likeness_score;
      validWords += 1;
      return { ...tok, visual_state: state };
    });

    const phonemeAccuracy = validWords > 0 ? totalScore / validWords : 0;
    const completeness = validWords > 0 ? 
      (gradedTokens.filter((t: any) => !t.omitted && !t.is_filler).length / validWords) * 100 : 0;
    
    // Penalize if cadence is outside tolerance
    let cadenceScore = 100;
    const cadenceDiff = Math.abs(1.0 - analysis.prosody_comparison.cadence_ratio);
    if (cadenceDiff > config.cadence_variance_tolerance) {
      cadenceScore = Math.max(0, 100 - ((cadenceDiff - config.cadence_variance_tolerance) * 100));
    }

    const overallScore = 
      (phonemeAccuracy * config.weight_phoneme_accuracy) +
      (completeness * config.weight_completeness) +
      (cadenceScore * config.weight_prosody_fluency);

    const passed = overallScore >= config.pass_overall_threshold && 
                  (completeness / 100) >= config.min_word_coverage_ratio;

    // 4. Securely Save Grade to DB
    await supabaseAdmin.from("speech_evaluation_attempts").insert({
      user_id: user.id,
      sample_id: sample.id,
      lesson_id,
      node_id,
      cefr_level: sample.cefr_level,
      dialect: sample.dialect,
      attempt_number,
      passed,
      overall_score: overallScore, // Corregido: era overallScore, no overall_score
      phoneme_likeness_score: phonemeAccuracy,
      completeness_score: completeness,
      cadence_fluency_score: cadenceScore,
      student_wpm: analysis.student_wpm,
      sample_wpm: analysis.sample_wpm,
      active_duration_sec: analysis.active_duration_sec,
      token_grades: gradedTokens,
      inter_word_events: analysis.inter_word_events,
      prosody_diagnostics: analysis.prosody_comparison,
      recognized_transcript: analysis.recognized_transcript,
      is_ghost_attempt: analysis.is_ghost_attempt
    });

    // 5. Return complete payload to frontend with exact variables UI expects
    return new Response(JSON.stringify({ 
      success: true, 
      passed,
      overall_score: overallScore,
      is_ghost_attempt: analysis.is_ghost_attempt,
      recognized_transcript: analysis.recognized_transcript,
      prosody_diagnostics: analysis.prosody_comparison,
      token_grades: gradedTokens,
      inter_word_events: analysis.inter_word_events,
      feedback: {
        cadence: cadenceScore < 70 ? "Pacing needs adjustment" : "Good pacing",
        pronunciation: phonemeAccuracy < 70 ? "Needs pronunciation polish" : "Clear pronunciation"
      }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (error: any) {
    // Return structured JSON even on error so mobile devices can parse it cleanly
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 400 
    });
  }
});