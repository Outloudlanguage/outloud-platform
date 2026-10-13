import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import levenshtein from "npm:fast-levenshtein"
import { doubleMetaphone } from "npm:double-metaphone"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate the student securely
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized: Invalid session.')

    // 2. Parse the raw metrics sent from the browser
    const { 
      lesson_id, 
      node_id, 
      target_text, 
      transcript, 
      cefr_level = 'A1', 
      duration_sec, 
      pitch_variance, 
      attempt_number,
      is_ghost_attempt 
    } = await req.json()

    let overall_score = 0;
    let accuracy_score = 0;
    let prosody_score = 0;
    let completeness_score = 0;
    let word_level_data = [];

    // 3. Anti-Cheat: Ghost or Silent Attempt Handling
    if (is_ghost_attempt || duration_sec < 0.5 || !transcript.trim()) {
      overall_score = 0;
    } else {
      // 4. Phonetic Processing
      const targetWords = target_text.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
      const spokenWords = transcript.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);

      let totalDistance = 0;
      let matchedWords = 0;

      // Word-by-word Phonetic Levenshtein Distance
      targetWords.forEach((targetWord: string, index: number) => {
        const spokenWord = spokenWords[index] || "";
        
        // Convert both to their core phonetic sounds (e.g., "their" and "there" become the same hash)
        const targetPhonetic = doubleMetaphone(targetWord)[0];
        const spokenPhonetic = doubleMetaphone(spokenWord)[0];

        const distance = levenshtein.get(targetPhonetic || "", spokenPhonetic || "");
        totalDistance += distance;

        let wordScore = 100;
        let isOmission = false;

        if (!spokenWord) {
          wordScore = 0;
          isOmission = true;
        } else if (distance > 0) {
          // Deduct points based on phonetic difference
          wordScore = Math.max(0, 100 - (distance * 25));
        }

        if (wordScore >= 60) matchedWords++;

        word_level_data.push({
          word: targetWord,
          score: wordScore,
          error_type: isOmission ? "Omission" : (distance > 0 ? "Mispronunciation" : "None")
        });
      });

      // 5. Final Math & CEFR Weighting
      accuracy_score = Math.max(0, 100 - (totalDistance * 10)); // Base phonetic accuracy
      completeness_score = (matchedWords / targetWords.length) * 100;
      
      // Prosody sanity check (Did their pitch vary like a human?)
      prosody_score = pitch_variance > 15 ? 100 : Math.max(0, pitch_variance * 5);

      // Example CEFR weighting logic (Beginners vs Advanced)
      if (cefr_level === 'A1' || cefr_level === 'A2') {
        overall_score = (accuracy_score * 0.60) + (completeness_score * 0.30) + (prosody_score * 0.10);
      } else {
        overall_score = (accuracy_score * 0.45) + (completeness_score * 0.25) + (prosody_score * 0.30);
      }
    }

    // 6. Write securely to the database from the server side
    const { error: dbError } = await supabase
      .from('pronunciation_logs')
      .insert({
        user_id: user.id,
        lesson_id,
        node_id,
        target_text,
        recognized_text: transcript,
        cefr_level,
        overall_score,
        accuracy_score,
        prosody_score,
        completeness_score,
        attempt_number,
        is_ghost_attempt: overall_score === 0,
        word_level_data,
        active_duration_sec: duration_sec,
        pitch_variance_hz: pitch_variance
      })

    if (dbError) throw dbError;

    // Return the calculated data to the frontend to trigger the Green/Yellow/Red UI
    return new Response(
      JSON.stringify({
        success: true,
        overall_score,
        word_level_data,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})