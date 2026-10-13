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
      const cleanRawTargets = rawTargetWords.map((w: string) => w.toLowerCase().replace(/[^\w\s]/gi, ''));
      
      // --- THE PRE-PROCESSOR STREAM NORMALIZER ---
      let normSpoken = transcript.toLowerCase();

      // Step A: NLP parse all number words ("fifty two" -> "52")
      const parsedNumbers = wordsToNumbers(normSpoken);
      if (parsedNumbers !== null && parsedNumbers !== undefined) {
        normSpoken = parsedNumbers.toString();
      }

      // Step B: Explode all clustered digits ("752" -> "7 5 2")
      normSpoken = normSpoken.replace(/(\d)/g, ' $1 ');

      // Step C: Spelled Word STT Exploder
      // If target expects isolated letters (E R N E S T O), find STT grouped words ("ernesto") and explode them.
      let currentSequence: string[] = [];
      const spelledWordsToExpand: string[] = [];
      for (let w of cleanRawTargets) {
        if (w.length === 1 && /[a-z]/.test(w)) {
          currentSequence.push(w);
        } else {
          if (currentSequence.length >= 2) spelledWordsToExpand.push(currentSequence.join(''));
          currentSequence = [];
        }
      }
      if (currentSequence.length >= 2) spelledWordsToExpand.push(currentSequence.join(''));

      spelledWordsToExpand.forEach(sw => {
        const regex = new RegExp(`\\b${sw}\\b`, 'g');
        normSpoken = normSpoken.replace(regex, sw.split('').join(' '));
      });

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
        'A1': { maxShort: 2, maxLong: 3, penalty: 10, wAcc: 0.50, wComp: 0.40, wPros: 0.10 },
        'A2': { maxShort: 2, maxLong: 3, penalty: 10, wAcc: 0.50, wComp: 0.40, wPros: 0.10 },
        'B1': { maxShort: 1, maxLong: 2, penalty: 15, wAcc: 0.55, wComp: 0.35, wPros: 0.10 },
        'B2': { maxShort: 1, maxLong: 2, penalty: 15, wAcc: 0.55, wComp: 0.35, wPros: 0.10 },
        'C1': { maxShort: 1, maxLong: 2, penalty: 20, wAcc: 0.65, wComp: 0.20, wPros: 0.15 },
        'C2': { maxShort: 1, maxLong: 1, penalty: 25, wAcc: 0.70, wComp: 0.10, wPros: 0.20 }
      };
      const rules = strictnessRules[cefr_level] || strictnessRules['A1'];

      // 4. LINEAR STREAM ALIGNMENT ENGINE
      rawTargetWords.forEach((rawTWord: string) => {
        const tWord = rawTWord.toLowerCase().replace(/[^\w\s]/gi, '');
        
        if (!tWord) {
          word_level_data.push({ word: rawTWord, score: 100, error_type: "None" });
          return;
        }

        validTargetCount++;
        let bestMatchIdx = -1;
        let bestDistance = 999;
        
        let numericTWord = tWord;
        const parsedT = wordsToNumbers(tWord);
        if (parsedT !== null && parsedT !== undefined) numericTWord = parsedT.toString();

        // Scan ahead up to 5 words for natural recovery (ignores skips, locks onto next valid word)
        const searchLimit = Math.min(spokenWords.length - 1, sIdx + 5);
        
        for (let searchIdx = sIdx; searchIdx <= searchLimit; searchIdx++) {
          const sWord = spokenWords[searchIdx];
          let isPerfect = false;
          let rawDist = levenshtein.get(tWord, sWord);

          // 4A: Exact matches
          if (tWord === sWord || numericTWord === sWord) isPerfect = true;
          
          // 4B: Spelled Letter Maps
          if (tWord.length === 1 && /[a-z]/.test(tWord)) {
             if (tWord === (letterMap[sWord] || sWord)) isPerfect = true;
          }

          // 4C: Fragment Combiner (Catches Acronyms like "USA" or clustered spelling "u s a")
          let combinedStr = "";
          let combinedSpelled = "";
          for (let k = 0; k < 5 && (searchIdx + k) < spokenWords.length; k++) {
              const frag = spokenWords[searchIdx + k];
              combinedStr += frag;
              combinedSpelled += (letterMap[frag] || frag);
              
              if (tWord === combinedStr || numericTWord === combinedStr || 
                  tWord === combinedSpelled || numericTWord === combinedSpelled) {
                  bestMatchIdx = searchIdx + k; // Advance pointer past the fragment block
                  bestDistance = 0;
                  isPerfect = true;
                  break;
              }
          }
          if (isPerfect) {
             if (bestMatchIdx === -1) bestMatchIdx = searchIdx;
             bestDistance = 0;
             break;
          }

          // 4D: Phonetic Hashing (Double Metaphone)
          const tHashes = doubleMetaphone(tWord);
          const sHashes = doubleMetaphone(sWord);
          if ((tHashes[0] && sHashes[0] && tHashes[0] === sHashes[0]) || 
              (tHashes[1] && sHashes[0] && tHashes[1] === sHashes[0]) || 
              (tHashes[0] && sHashes[1] && tHashes[0] === sHashes[1])) {
              bestMatchIdx = searchIdx; bestDistance = 0; break;
          }

          // 4E: CEFR Typo Leniency (BANNED for Fillers to prevent greediness)
          if (!scriptFillers.includes(tWord)) {
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
          
          sIdx = bestMatchIdx + 1; // Advance pointer successfully
        } else {
          if (scriptFillers.includes(tWord)) {
             wordScore = 100; // Forgiven filler
             errorType = "None";
             matchedWords++;
             // DO NOT ADVANCE POINTER. We simply ignore it and move on.
          } else {
             wordScore = 0;
             errorType = "Omission";
             // DO NOT ADVANCE POINTER. Ensures alignment stays locked for the next word.
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