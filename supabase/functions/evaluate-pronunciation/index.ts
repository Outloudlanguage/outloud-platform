import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import levenshtein from "npm:fast-levenshtein"
import { doubleMetaphone } from "npm:double-metaphone"
import { wordsToNumbers } from "npm:words-to-numbers"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Identify User (Guest vs Authenticated)
    const authHeader = req.headers.get('Authorization')
    let user = null;
    
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data } = await supabase.auth.getUser()
      user = data?.user || null;
    }

    const isGuest = !user;

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

    // 2. Anti-Cheat: Ghost or Silent Attempt Handling
    if (is_ghost_attempt || duration_sec < 0.5 || !transcript.trim()) {
      overall_score = 0;
    } else {
      const rawTargetWords = target_text.trim().split(/\s+/);
      
      // --- THE STT PRE-PROCESSOR ---
      let normSpoken = transcript.toLowerCase();

      // Fix "w" spelled out by STT
      normSpoken = normSpoken.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

      // NLP parse all number words ("fifteen" -> "15")
      const parsedNumbers = wordsToNumbers(normSpoken);
      if (parsedNumbers !== null && parsedNumbers !== undefined) {
        normSpoken = parsedNumbers.toString();
      }

      // Explode all clustered digits ("752" -> "7 5 2")
      normSpoken = normSpoken.replace(/(\d)/g, ' $1 ');

      const spokenWords = normSpoken.replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);

      let totalWordScore = 0;
      let matchedWords = 0;
      let validTargetCount = 0;
      let sIdx = 0; 
      
      const scriptFillers = ['uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh'];

      const letterMap: Record<string, string> = {
        'hey': 'a', 'eight': 'a', 'ay': 'a', 'bee': 'b', 'be': 'b', 'me': 'b', 'vee': 'b',
        'see': 'c', 'sea': 'c', 'si': 'c', 'ze': 'c', 'dee': 'd', 'the': 'd', 'di': 'd',
        'he': 'e', 'ee': 'e', 'yi': 'e', 'ef': 'f', 'eff': 'f', 'if': 'f', 'half': 'f',
        'gee': 'g', 'jee': 'g', 'ji': 'g', 'aitch': 'h', 'hach': 'h', 'age': 'h', 'edge': 'h',
        'eye': 'i', 'jay': 'j', 'yay': 'j', 'kay': 'k', 'okay': 'k', 'cay': 'k',
        'el': 'l', 'ell': 'l', 'al': 'l', 'em': 'm', 'am': 'm',
        'en': 'n', 'in': 'n', 'and': 'n', 'an': 'n', 'end': 'n',
        'oh': 'o', 'owe': 'o', 'ou': 'o', 'how': 'o', 'pee': 'p', 'pea': 'p',
        'cue': 'q', 'queue': 'q', 'kyu': 'q', 'are': 'r', 'our': 'r', 'or': 'r', 'ar': 'r', 'er': 'r',
        'es': 's', 'ess': 's', 'is': 's', 'as': 's', 'yes': 's', 'tee': 't', 'tea': 't', 'ti': 't',
        'you': 'u', 'yu': 'u', 'we': 'v', 'vi': 'v', 'doubleyou': 'w', 'doubleu': 'w',
        'ex': 'x', 'ax': 'x', 'eggs': 'x', 'why': 'y', 'wai': 'y', 'while': 'y', 'zee': 'z', 'zed': 'z'
      };

      const strictnessRules: any = {
        'A1': { maxShort: 2, maxLong: 3, penalty: 15, wAcc: 0.50, wComp: 0.40, wPros: 0.10 },
        'A2': { maxShort: 2, maxLong: 3, penalty: 15, wAcc: 0.50, wComp: 0.40, wPros: 0.10 },
        'B1': { maxShort: 1, maxLong: 2, penalty: 20, wAcc: 0.55, wComp: 0.35, wPros: 0.10 },
        'B2': { maxShort: 1, maxLong: 2, penalty: 20, wAcc: 0.55, wComp: 0.35, wPros: 0.10 },
        'C1': { maxShort: 1, maxLong: 2, penalty: 30, wAcc: 0.65, wComp: 0.20, wPros: 0.15 },
        'C2': { maxShort: 0, maxLong: 1, penalty: 40, wAcc: 0.70, wComp: 0.10, wPros: 0.20 }
      };
      const rules = strictnessRules[cefr_level] || strictnessRules['A1'];

      // 3. ANCHOR-BASED ALIGNMENT ENGINE
      rawTargetWords.forEach((rawTWord: string) => {
        const tWord = rawTWord.toLowerCase().replace(/[^\w\s]/gi, '');
        
        if (!tWord) {
          word_level_data.push({ word: rawTWord, score: 100, error_type: "None" });
          return;
        }

        validTargetCount++;
        let bestMatchIdx = -1;
        let bestDistance = 999;
        let isPerfect = false;
        
        let numericTWord = tWord;
        const parsedT = wordsToNumbers(tWord);
        if (parsedT !== null && parsedT !== undefined) numericTWord = parsedT.toString();

        // Scan ahead up to 4 words to naturally recover skipped words
        const maxLookahead = 4; 
        const maxFragments = 15; 

        for (let lookahead = 0; lookahead <= maxLookahead; lookahead++) {
            const searchIdx = sIdx + lookahead;
            if (searchIdx >= spokenWords.length) break;

            const sWord = spokenWords[searchIdx];
            
            // 4A: Exact matches
            if (tWord === sWord || numericTWord === sWord) {
                bestMatchIdx = searchIdx; bestDistance = 0; isPerfect = true; break;
            }
            
            // 4B: Fragment Combiner (Handles Spelling "E-R-N-E-S-T-O" & Numbers)
            let combinedStr = "";
            let combinedSpelled = "";
            const fragmentsToCombine = Math.min(maxFragments, spokenWords.length - searchIdx);

            for (let k = 1; k <= fragmentsToCombine; k++) {
                const frag = spokenWords[searchIdx + k - 1];
                combinedStr += frag;
                combinedSpelled += (letterMap[frag] || frag);

                if (tWord === combinedStr || numericTWord === combinedStr ||
                    tWord === combinedSpelled || numericTWord === combinedSpelled) {
                    bestMatchIdx = searchIdx + k - 1; // Advance past the combined block
                    bestDistance = 0;
                    isPerfect = true;
                    break;
                }
            }
            if (isPerfect) break;

            // 4C: Phonetic Hash Match (Double Metaphone)
            const tHashes = doubleMetaphone(tWord);
            const sHashes = doubleMetaphone(sWord);
            if ((tHashes[0] && sHashes[0] && tHashes[0] === sHashes[0]) || 
                (tHashes[1] && sHashes[0] && tHashes[1] === sHashes[0]) || 
                (tHashes[0] && sHashes[1] && tHashes[0] === sHashes[1])) {
                bestMatchIdx = searchIdx; bestDistance = 0; isPerfect = true; break;
            }

            // 4D: CEFR Typo Leniency (Only if it's NOT a conversational filler)
            if (!scriptFillers.includes(tWord)) {
                const rawDist = levenshtein.get(tWord, sWord);
                let allowedTypo = 0;
                if (tWord.length > 4) allowedTypo = rules.maxLong;
                else if (tWord.length > 1) allowedTypo = rules.maxShort;
                
                if (rawDist <= allowedTypo) {
                    if (bestMatchIdx === -1 || rawDist < bestDistance) {
                        bestMatchIdx = searchIdx;
                        bestDistance = rawDist;
                    }
                }
            }
        }

        // 5. WORD RESOLUTION
        let wordScore = 100;
        let errorType = "None";

        if (bestMatchIdx !== -1) {
          if (bestDistance > 0) {
            wordScore = Math.max(0, 100 - (bestDistance * rules.penalty));
            if (wordScore < 80) errorType = "Mispronunciation";
          }
          if (wordScore >= 60) matchedWords++;
          
          sIdx = bestMatchIdx + 1; // Snaps pointer perfectly to the matched word
        } else {
          if (scriptFillers.includes(tWord)) {
             wordScore = 100; // Forgiven filler
             errorType = "None";
             matchedWords++;
             // DO NOT advance pointer: simply ignore the filler and move on
          } else {
             wordScore = 0;
             errorType = "Omission";
             // DO NOT advance pointer: keeps alignment locked for the next valid word
          }
        }

        totalWordScore += wordScore;
        word_level_data.push({ word: rawTWord, score: wordScore, error_type: errorType });
      });

      // 6. FINAL CEFR WEIGHTED MATH
      accuracy_score = validTargetCount > 0 ? (totalWordScore / validTargetCount) : 100;
      completeness_score = validTargetCount > 0 ? (matchedWords / validTargetCount) * 100 : 100;
      prosody_score = pitch_variance > 15 ? 100 : Math.max(0, pitch_variance * 5);

      overall_score = (accuracy_score * rules.wAcc) + (completeness_score * rules.wComp) + (prosody_score * rules.wPros);
    }

    // 7. SECURE DATABASE WRITE (Registered Users Only)
    if (!isGuest) {
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )

      const { error: dbError } = await supabaseAuth
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
    }

    return new Response(
      JSON.stringify({
        success: true,
        overall_score,
        word_level_data,
        is_guest: isGuest
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