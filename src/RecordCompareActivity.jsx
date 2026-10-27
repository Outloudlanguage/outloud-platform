import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';

/**
 * CEFR Level Calibration Matrix
 * Defines pass thresholds, word approval cutoffs, phonetic/typo leniency, and scoring weights.
 */
const CEFR_PROFILES = {
  A1: {
    passScore: 65,
    wordApprove: 80,
    minWordPass: 60,
    minCoverageRatio: 0.78,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 16,
    closeLetterScore: 72,
    phoneticMatchScore: 76,
    minConfidence: 0.62,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  A2: {
    passScore: 70,
    wordApprove: 80,
    minWordPass: 60,
    minCoverageRatio: 0.80,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 18,
    closeLetterScore: 70,
    phoneticMatchScore: 75,
    minConfidence: 0.66,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  B1: {
    passScore: 75,
    wordApprove: 82,
    minWordPass: 60,
    minCoverageRatio: 0.82,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 20,
    closeLetterScore: 65,
    phoneticMatchScore: 72,
    minConfidence: 0.70,
    wAccuracy: 0.60,
    wCompleteness: 0.30,
    wProsody: 0.10
  },
  B2: {
    passScore: 80,
    wordApprove: 85,
    minWordPass: 60,
    minCoverageRatio: 0.85,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 1,
    editPenalty: 24,
    closeLetterScore: 0,
    phoneticMatchScore: 70,
    minConfidence: 0.74,
    wAccuracy: 0.65,
    wCompleteness: 0.25,
    wProsody: 0.10
  },
  C1: {
    passScore: 85,
    wordApprove: 88,
    minWordPass: 60,
    minCoverageRatio: 0.90,
    maxAllowedEditDistShort: 0,
    maxAllowedEditDistLong: 1,
    editPenalty: 28,
    closeLetterScore: 0,
    phoneticMatchScore: 68,
    minConfidence: 0.78,
    wAccuracy: 0.70,
    wCompleteness: 0.15,
    wProsody: 0.15
  },
  C2: {
    passScore: 88,
    wordApprove: 90,
    minWordPass: 60,
    minCoverageRatio: 0.92,
    maxAllowedEditDistShort: 0,
    maxAllowedEditDistLong: 1,
    editPenalty: 32,
    closeLetterScore: 0,
    phoneticMatchScore: 65,
    minConfidence: 0.82,
    wAccuracy: 0.75,
    wCompleteness: 0.10,
    wProsody: 0.15
  }
};

// Conversational fillers: rendered green in UI and excluded from scoring math
const SCRIPT_FILLERS = new Set([
  'uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh', 'er', 'erm'
]);

// Exact phonetic transcriptions for English alphabet letters
const LETTER_PHONETICS = {
  a: 'a', hey: 'a', ay: 'a', eh: 'a',
  b: 'b', bee: 'b', be: 'b',
  c: 'c', see: 'c', sea: 'c', si: 'c',
  d: 'd', dee: 'd', di: 'd', de: 'd',
  e: 'e', he: 'e', ee: 'e', yi: 'e',
  f: 'f', ef: 'f', eff: 'f',
  g: 'g', gee: 'g', jee: 'g', ji: 'g',
  h: 'h', aitch: 'h', hach: 'h', age: 'h',
  i: 'i', eye: 'i', ai: 'i',
  j: 'j', jay: 'j', yay: 'j',
  k: 'k', kay: 'k', cay: 'k',
  l: 'l', el: 'l', ell: 'l', al: 'l',
  m: 'm', em: 'm', am: 'm',
  n: 'n', en: 'n', in: 'n',
  o: 'o', oh: 'o', owe: 'o', ou: 'o',
  p: 'p', pee: 'p', pea: 'p',
  q: 'q', cue: 'q', queue: 'q', kyu: 'q',
  r: 'r', are: 'r', ar: 'r', er: 'r', air: 'r',
  s: 's', es: 's', ess: 's',
  t: 't', tee: 't', tea: 't', ti: 't',
  u: 'u', you: 'u', yu: 'u',
  v: 'v', vee: 'v', vi: 'v',
  w: 'w', doubleyou: 'w', doubleu: 'w',
  x: 'x', ex: 'x', ax: 'x',
  y: 'y', why: 'y', wai: 'y',
  z: 'z', zee: 'z', zed: 'z'
};

// Close phonetic letter confusions (always graded as Yellow 65-72% at A1-B1, never 100%)
const CLOSE_PHONETIC_LETTERS = {
  b: ['v', 'p'],
  v: ['b', 'f'],
  p: ['b'],
  c: ['s', 'z'],
  s: ['c', 'z'],
  z: ['s', 'c'],
  g: ['j'],
  j: ['g', 'y'],
  d: ['t'],
  t: ['d'],
  m: ['n'],
  n: ['m'],
  e: ['i'],
  i: ['e', 'y'],
  a: ['e']
};

const EXACT_NUMBER_WORDS = {
  zero: '0', oh: '0', o: '0', nil: '0',
  one: '1', won: '1',
  two: '2', to: '2', too: '2',
  three: '3',
  four: '4', for: '4', fore: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8', ate: '8',
  nine: '9',
  ten: '10', eleven: '11', twelve: '12', thirteen: '13',
  fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17',
  eighteen: '18', nineteen: '19', twenty: '20', thirty: '30',
  forty: '40', fifty: '50', sixty: '60', seventy: '70',
  eighty: '80', ninety: '90'
};

const CLOSE_NUMBER_HOMOPHONES = {
  tree: '3', free: '3',
  fine: '5',
  sick: '6', sicks: '6',
  mine: '9'
};

// Standard English Contraction & Title Equivalences
const WORD_EQUIVALENTS = {
  mr: ['mister'],
  mister: ['mr'],
  mrs: ['missus', 'misses'],
  ms: ['miss'],
  dr: ['doctor'],
  st: ['street', 'saint'],
  im: ['i', 'am'],
  youre: ['you', 'are'],
  hes: ['he', 'is'],
  shes: ['she', 'is'],
  its: ['it', 'is'],
  were: ['we', 'are'],
  theyre: ['they', 'are'],
  dont: ['do', 'not'],
  doesnt: ['does', 'not'],
  didnt: ['did', 'not'],
  cant: ['can', 'not'],
  cannot: ['can', 'not'],
  wont: ['will', 'not'],
  isnt: ['is', 'not'],
  arent: ['are', 'not'],
  wasnt: ['was', 'not'],
  werent: ['were', 'not'],
  ive: ['i', 'have'],
  youve: ['you', 'have'],
  weve: ['we', 'have'],
  theyve: ['they', 'have'],
  id: ['i', 'would'],
  ill: ['i', 'will'],
  whats: ['what', 'is'],
  thats: ['that', 'is'],
  theres: ['there', 'is'],
  heres: ['here', 'is'],
  whos: ['who', 'is'],
  okay: ['ok'],
  ok: ['okay'],
  yes: ['yeah', 'yep'],
  yeah: ['yes', 'yep']
};

export default function RecordCompareActivity({
  targetText = "The quick brown fox jumps over the lazy dog",
  audioUrl = "",
  lessonId = "",
  nodeId = "",
  cefrLevel = "A1",
  onComplete = () => {}
}) {
  const levelProfile = CEFR_PROFILES[cefrLevel] || CEFR_PROFILES.A1;

  // 'listen' | 'playing_sample' | 'ready_to_record' | 'recording' | 'playing_review' | 'completed'
  const [phase, setPhase] = useState(audioUrl ? 'listen' : 'ready_to_record');
  const [attempt, setAttempt] = useState(1);
  const [canContinue, setCanContinue] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const [wordResults, setWordResults] = useState([]);
  const [failedIndices, setFailedIndices] = useState(new Set());
  const [overallScore, setOverallScore] = useState(null);

  const activePlaybackRef = useRef(null);
  const studentAudioUrlRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Stores captured STT segments across pauses
  const committedSegmentsRef = useRef([]);
  const currentSegmentRef = useRef([]);
  const speechFlushedRef = useRef(false);

  const recordingStartTimeRef = useRef(0);
  const isRecordingRef = useRef(false);
  const activeStreamRef = useRef(null);

  const wordsList = targetText.trim().split(/\s+/);

  // ============================================================================
  // 1. AUDIO PLAYBACK CONTROLLER & PHONETIC HELPERS
  // ============================================================================

  const stopCurrentAudio = () => {
    if (activePlaybackRef.current) {
      try {
        activePlaybackRef.current.onended = null;
        activePlaybackRef.current.onerror = null;
        activePlaybackRef.current.pause();
        activePlaybackRef.current.currentTime = 0;
      } catch (e) {}
      activePlaybackRef.current = null;
    }
  };

  const getEditDistance = (a = '', b = '') => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[a.length][b.length];
  };

  // Phonetic Skeleton Encoder: distinguishes "spell" ("SPL") from "repeat" ("RPT") and "passport" ("PSPRT") from "telephone" ("TLFN")
  const getPhoneticSkeleton = (word = '') => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return '';
    if (/^\d+$/.test(clean) || clean.length === 1) return clean;

    const s = clean
      .replace(/^kn/, 'n')
      .replace(/^gn/, 'n')
      .replace(/^pn/, 'n')
      .replace(/^wr/, 'r')
      .replace(/^wh/, 'w')
      .replace(/^ps/, 's')
      .replace(/ph/g, 'f')
      .replace(/gh/g, 'g')
      .replace(/sh/g, 'x')
      .replace(/ch/g, 'x')
      .replace(/th/g, '0')
      .replace(/ck/g, 'k')
      .replace(/dg/g, 'j')
      .replace(/qu/g, 'kw')
      .replace(/c(?=[eiy])/g, 's')
      .replace(/c/g, 'k')
      .replace(/g(?=[eiy])/g, 'j')
      .replace(/z/g, 's')
      .replace(/v/g, 'f');

    const firstChar = s[0];
    const rest = s
      .slice(1)
      .replace(/[aeiouyhw]/g, '')
      .replace(/(.)\1+/g, '$1');

    const vowelKeep = /[aeiouy]/.test(firstChar) ? 'A' : firstChar;
    return (vowelKeep + rest).toUpperCase();
  };

  // Post-recording AudioBlob decoder: extracts pitch variance, active voiced time, and burst clarity AFTER recording stops
  const analyzeRecordedBlob = async (audioBlob) => {
    const result = {
      voicedSec: 0,
      burstCount: 0,
      pitchVariance: 0,
      avgClarity: 0.84,
      burstClarities: []
    };

    if (!audioBlob || audioBlob.size === 0) return result;

    let tempCtx = null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      tempCtx = new AudioCtx();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      const windowSize = Math.max(256, Math.floor(sampleRate * 0.03)); // 30ms windows
      const rmsList = [];

      for (let i = 0; i + windowSize <= channelData.length; i += windowSize) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          const s = channelData[i + j];
          sum += s * s;
        }
        rmsList.push(Math.sqrt(sum / windowSize));
      }

      if (rmsList.length === 0) return result;

      const sortedRms = [...rmsList].sort((a, b) => a - b);
      const noiseFloor = sortedRms[Math.floor(sortedRms.length * 0.20)] || 0.001;
      const peakRms = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.02;
      const voiceThreshold = Math.max(0.0055, Math.min(0.022, noiseFloor * 2.5, peakRms * 0.22));

      let activeFrames = 0;
      let bursts = 0;
      let inBurst = false;
      let silenceGap = 0;

      for (let idx = 0; idx < rmsList.length; idx++) {
        if (rmsList[idx] >= voiceThreshold) {
          activeFrames++;
          silenceGap = 0;
          if (!inBurst) {
            inBurst = true;
            bursts++;
          }
        } else {
          silenceGap++;
          if (silenceGap >= 2) {
            inBurst = false;
          }
        }
      }

      result.voicedSec = activeFrames * 0.03;
      result.burstCount = bursts;

      const pitchWindow = 1024;
      if (channelData.length >= pitchWindow) {
        const detector = PitchDetector.forFloat32Array(pitchWindow);
        const step = Math.max(pitchWindow, Math.floor(sampleRate * 0.05));
        const pitches = [];
        const clarities = [];

        for (let offset = 0; offset + pitchWindow <= channelData.length; offset += step) {
          const slice = channelData.subarray(offset, offset + pitchWindow);
          let sum = 0;
          for (let k = 0; k < pitchWindow; k++) sum += slice[k] * slice[k];
          const localRms = Math.sqrt(sum / pitchWindow);

          if (localRms >= voiceThreshold * 0.85) {
            const [pitch, clarity] = detector.findPitch(slice, sampleRate);
            if (clarity > 0.55 && pitch > 55 && pitch < 550) {
              pitches.push(pitch);
              clarities.push(clarity);
            }
          }
        }

        if (pitches.length > 1) {
          const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
          const variance =
            pitches.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / pitches.length;
          result.pitchVariance = Math.sqrt(variance);
        } else if (activeFrames >= 4) {
          result.pitchVariance = 16;
        }

        if (clarities.length > 0) {
          result.avgClarity = clarities.reduce((a, b) => a + b, 0) / clarities.length;
          result.burstClarities = clarities;
        }
      }
    } catch (e) {
      console.warn("AudioBuffer decode warning:", e);
    } finally {
      if (tempCtx && tempCtx.state !== 'closed') {
        try { tempCtx.close(); } catch (e) {}
      }
    }

    return result;
  };

  // ============================================================================
  // 2. SPEECH RECOGNITION ENGINE (PRE-INITIALIZED, ZERO LIVE AUDIOCONTEXT CLASH)
  // ============================================================================

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const segItems = [];
      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        const alts = [];
        for (let a = 0; a < res.length; a++) {
          const text = (res[a].transcript || '').trim();
          const conf =
            typeof res[a].confidence === 'number' && res[a].confidence > 0
              ? res[a].confidence
              : 0.88;
          if (text) {
            alts.push({ transcript: text, confidence: conf });
          }
        }
        if (alts.length > 0) {
          segItems.push({
            bestTranscript: alts[0].transcript,
            confidence: alts[0].confidence,
            alternatives: alts
          });
        }
      }
      if (segItems.length > 0) {
        currentSegmentRef.current = segItems;
      }
    };

    recognition.onerror = () => {};

    recognition.onend = () => {
      if (currentSegmentRef.current && currentSegmentRef.current.length > 0) {
        committedSegmentsRef.current.push(...currentSegmentRef.current);
        currentSegmentRef.current = [];
      }

      // Synchronous restart on pause keeps Android SpeechRecognizer alive across sentence pauses
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      } else {
        speechFlushedRef.current = true;
      }
    };

    recognitionRef.current = recognition;
  };

  // Reset cleanly whenever the lesson advances to a new exercise node
  useEffect(() => {
    isRecordingRef.current = false;
    stopCurrentAudio();

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }

    setPhase(audioUrl ? 'listen' : 'ready_to_record');
    setAttempt(1);
    setCanContinue(false);
    setPointsAwarded(0);
    setWordResults([]);
    setFailedIndices(new Set());
    setOverallScore(null);

    setupSpeechRecognition();

    return () => {
      isRecordingRef.current = false;
      stopCurrentAudio();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [targetText, nodeId, audioUrl]);

  useEffect(() => {
    return () => {
      if (studentAudioUrlRef.current) {
        URL.revokeObjectURL(studentAudioUrlRef.current);
      }
    };
  }, []);

  // ============================================================================
  // 3. TWO-PASS ANCHORED ALIGNMENT ENGINE (GREEN / YELLOW / RED / GREY STRIKETHROUGH)
  // ============================================================================

  // Converts raw STT string into normalized tokens WITHOUT ever forging target words
  const tokenizeTranscriptString = (rawString, cleanTargets, defaultConfidence = 0.88) => {
    if (!rawString || !rawString.trim()) return [];

    const hasDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));
    const hasSingleLetters = cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

    let text = rawString.toLowerCase();
    text = text.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

    // Normalize contractions and titles ("mister" <-> "mr", "what's" <-> "what is") to match target form
    const rawWords = text.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(Boolean);
    const normalizedWords = [];
    for (const w of rawWords) {
      if (WORD_EQUIVALENTS[w] && !cleanTargets.includes(w)) {
        const eq = WORD_EQUIVALENTS[w];
        if (eq.length === 1 && cleanTargets.includes(eq[0])) {
          normalizedWords.push(eq[0]);
          continue;
        }
        if (eq.length === 2 && cleanTargets.includes(eq[0]) && cleanTargets.includes(eq[1])) {
          normalizedWords.push(eq[0], eq[1]);
          continue;
        }
      }
      normalizedWords.push(w);
    }
    text = normalizedWords.join(' ');

    if (hasDigits) {
      const compoundTens = {
        twenty: '2', thirty: '3', forty: '4', fifty: '5',
        sixty: '6', seventy: '7', eighty: '8', ninety: '9'
      };
      const onesDigits = {
        one: '1', won: '1', two: '2', to: '2', too: '2',
        three: '3', free: '3', tree: '3', four: '4', for: '4', fore: '4',
        five: '5', fine: '5', six: '6', sick: '6', seven: '7',
        eight: '8', ate: '8', nine: '9', mine: '9'
      };

      Object.entries(compoundTens).forEach(([tenWord, tenDigit]) => {
        Object.entries(onesDigits).forEach(([oneWord, oneDigit]) => {
          const regex = new RegExp(`\\b${tenWord}[\\s-]+${oneWord}\\b`, 'g');
          text = text.replace(regex, `${tenDigit}${oneDigit}`);
        });
      });

      const digitTokens = [];
      for (const tok of text.split(/\s+/).filter(Boolean)) {
        const clean = tok.replace(/[^\w]/gi, '');
        if (EXACT_NUMBER_WORDS[clean] !== undefined) {
          const dStr = EXACT_NUMBER_WORDS[clean];
          if (hasSingleDigits && dStr.length > 1) {
            dStr.split('').forEach((d) =>
              digitTokens.push({ token: d, confidence: defaultConfidence, approx: false })
            );
          } else {
            digitTokens.push({ token: dStr, confidence: defaultConfidence, approx: false });
          }
        } else if (CLOSE_NUMBER_HOMOPHONES[clean] !== undefined) {
          digitTokens.push({
            token: CLOSE_NUMBER_HOMOPHONES[clean],
            confidence: Math.min(defaultConfidence, 0.72),
            approx: true
          });
        } else if (hasSingleDigits && /^\d+$/.test(clean) && clean.length > 1) {
          clean.split('').forEach((d) =>
            digitTokens.push({ token: d, confidence: defaultConfidence, approx: false })
          );
        } else if (clean && !SCRIPT_FILLERS.has(clean)) {
          digitTokens.push({ token: clean, confidence: defaultConfidence, approx: false });
        }
      }

      if (!hasSingleLetters) return digitTokens;
    }

    const regularTargetWords = new Set(
      cleanTargets.filter((w) => w.length > 1 && !SCRIPT_FILLERS.has(w))
    );

    const baseTokens = text.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(Boolean);
    const finalTokens = [];

    for (const tok of baseTokens) {
      if (SCRIPT_FILLERS.has(tok) && tok !== 'oh') continue;

      if (hasSingleLetters) {
        if (regularTargetWords.has(tok)) {
          finalTokens.push({ token: tok, confidence: defaultConfidence, approx: false });
        } else if (LETTER_PHONETICS[tok]) {
          finalTokens.push({
            token: LETTER_PHONETICS[tok],
            confidence: defaultConfidence,
            approx: false
          });
        } else if (tok.length > 1 && /^[a-z]+$/.test(tok)) {
          // Split the actual spoken word into its own letters (e.g., "ribera" -> r, i, b, e, r, a)
          tok.split('').forEach((ch) =>
            finalTokens.push({ token: ch, confidence: defaultConfidence, approx: false })
          );
        } else {
          finalTokens.push({ token: tok, confidence: defaultConfidence, approx: false });
        }
      } else {
        finalTokens.push({ token: tok, confidence: defaultConfidence, approx: false });
      }
    }

    return finalTokens;
  };

  /**
   * Scores whether spoken token `sObj` is the target word `tWord`:
   * - Exact Match -> 80-100 (Green, or Yellow 72% if STT confidence was very low)
   * - Close Phonetic / Slight Accent Drift -> 62-78 (Yellow)
   * - Different Word / Unintelligible -> 0 (Mismatch -> Red)
   */
  const evaluatePairMatch = (tWord, sObj) => {
    if (!sObj || !sObj.token) return { score: 0, matchType: 'None' };

    const sWord = sObj.token;
    const conf = typeof sObj.confidence === 'number' ? sObj.confidence : 0.88;
    const lowConfCap = conf < levelProfile.minConfidence ? 74 : 100;

    // 1. Digit Target (0-9)
    if (/^\d+$/.test(tWord)) {
      if (tWord === sWord) {
        if (sObj.approx) {
          return { score: levelProfile.closeLetterScore || 72, matchType: 'Close' };
        }
        return { score: Math.min(100, lowConfCap), matchType: 'Exact' };
      }
      return { score: 0, matchType: 'None' };
    }

    // 2. Single Spelled Letter Target (a-z)
    if (tWord.length === 1 && /[a-z]/.test(tWord)) {
      const mapped = LETTER_PHONETICS[sWord] || sWord;
      if (tWord === mapped) {
        return { score: Math.min(100, lowConfCap), matchType: 'Exact' };
      }
      if (
        levelProfile.closeLetterScore > 0 &&
        CLOSE_PHONETIC_LETTERS[tWord] &&
        CLOSE_PHONETIC_LETTERS[tWord].includes(mapped)
      ) {
        // Close phonetic letter is ALWAYS Yellow (< 80)
        return { score: Math.min(76, levelProfile.closeLetterScore), matchType: 'Close' };
      }
      return { score: 0, matchType: 'None' };
    }

    // 3. Multi-Character Word Target
    if (tWord === sWord) {
      return { score: Math.min(100, lowConfCap), matchType: 'Exact' };
    }

    if (
      WORD_EQUIVALENTS[tWord] &&
      (WORD_EQUIVALENTS[tWord].includes(sWord) ||
        WORD_EQUIVALENTS[tWord].join('') === sWord)
    ) {
      return { score: Math.min(100, lowConfCap), matchType: 'Exact' };
    }

    const dist = getEditDistance(tWord, sWord);
    const maxLen = Math.max(tWord.length, sWord.length);
    const editRatio = dist / maxLen;

    const tSkel = getPhoneticSkeleton(tWord);
    const sSkel = getPhoneticSkeleton(sWord);

    // Phonetic Skeleton Match (gated by editRatio <= 0.42 so "spell" and "repeat" NEVER match)
    // Always capped in the Yellow range (65 - 78) because the word was not pronounced perfectly
    if (tSkel && sSkel && tSkel === sSkel && editRatio <= 0.42) {
      const pScore = Math.min(78, Math.max(64, levelProfile.phoneticMatchScore));
      return { score: pScore, matchType: 'Close' };
    }

    // Bounded Levenshtein Typo / Accent Leniency (capped at 78 so imperfect pronunciation shows Yellow)
    const allowedEdits =
      tWord.length > 4
        ? levelProfile.maxAllowedEditDistLong
        : levelProfile.maxAllowedEditDistShort;

    const onsetAgrees =
      tWord[0] === sWord[0] ||
      tSkel[0] === sSkel[0] ||
      (CLOSE_PHONETIC_LETTERS[tWord[0]] && CLOSE_PHONETIC_LETTERS[tWord[0]].includes(sWord[0]));

    if (dist <= allowedEdits && editRatio <= 0.40 && onsetAgrees) {
      const eScore = Math.min(78, Math.max(62, 100 - dist * levelProfile.editPenalty));
      return { score: eScore, matchType: 'Close' };
    }

    return { score: 0, matchType: 'None' };
  };

  /**
   * Two-Pass Anchored Sequence Alignment:
   * - Pass 1: Finds all valid Exact & Close matches (anchors) in order using DP.
   * - Pass 2: Inspects every gap between anchors:
   *     * If unmatched spoken words exist in the gap (e.g. "repeat" instead of "spell", or "telephone" instead of "passport"),
   *       marks the target word in that gap as RED (`score: 0`, `error_type: 'Mispronunciation'`).
   *     * If NO spoken words exist in the gap (e.g. "welcome" was skipped),
   *       marks the target word in that gap as GREY STRIKETHROUGH (`score: 0`, `error_type: 'Omission'`).
   */
  const runTwoPassAnchoredAlignment = (targetContentTokens, spokenTokenObjs) => {
    const N = targetContentTokens.length;
    const M = spokenTokenObjs.length;

    // Pass 1: Maximum-weight common subsequence of valid matches only (score > 0)
    const dp = Array.from({ length: N + 1 }, () => Array(M + 1).fill(0));
    const choice = Array.from({ length: N + 1 }, () => Array(M + 1).fill(''));

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const pair = evaluatePairMatch(targetContentTokens[i - 1], spokenTokenObjs[j - 1]);
        // Positional tie-breaker slightly favors keeping tokens aligned along the main diagonal
        const posBias = Math.max(0, 2 - Math.abs(i - j) * 0.25);
        const takeDiag =
          pair.score > 0 ? dp[i - 1][j - 1] + pair.score + posBias : -Infinity;
        const takeUp = dp[i - 1][j];
        const takeLeft = dp[i][j - 1];

        if (takeDiag >= takeUp && takeDiag >= takeLeft && takeDiag > 0) {
          dp[i][j] = takeDiag;
          choice[i][j] = 'DIAG';
        } else if (takeUp >= takeLeft) {
          dp[i][j] = takeUp;
          choice[i][j] = 'UP';
        } else {
          dp[i][j] = takeLeft;
          choice[i][j] = 'LEFT';
        }
      }
    }

    // Backtrack Pass 1 to collect locked anchor pairs (targetIdx <-> spokenIdx)
    const anchors = [];
    let ci = N;
    let cj = M;
    while (ci > 0 && cj > 0) {
      if (choice[ci][cj] === 'DIAG') {
        anchors.push({ tIdx: ci - 1, sIdx: cj - 1 });
        ci--;
        cj--;
      } else if (choice[ci][cj] === 'UP') {
        ci--;
      } else {
        cj--;
      }
    }
    anchors.reverse();

    // Pass 2: Resolve anchored words and inspect every inter-anchor gap
    const slotResults = new Array(N).fill(null);

    // Add sentinel boundary anchors at (-1, -1) and (N, M)
    const fullChain = [{ tIdx: -1, sIdx: -1 }, ...anchors, { tIdx: N, sIdx: M }];

    for (let k = 0; k < fullChain.length - 1; k++) {
      const curr = fullChain[k];
      const next = fullChain[k + 1];

      // Score the anchor itself (if not a sentinel)
      if (curr.tIdx >= 0 && curr.tIdx < N) {
        const sObj = spokenTokenObjs[curr.sIdx];
        const pair = evaluatePairMatch(targetContentTokens[curr.tIdx], sObj);
        const isYellow = pair.score < levelProfile.wordApprove;
        slotResults[curr.tIdx] = {
          score: pair.score,
          error_type: isYellow ? 'Mispronunciation' : 'None',
          spokenToken: sObj.token
        };
      }

      // Inspect the gap between `curr` and `next`
      const gapTargetStart = curr.tIdx + 1;
      const gapTargetEnd = next.tIdx; // exclusive
      const gapSpokenStart = curr.sIdx + 1;
      const gapSpokenEnd = next.sIdx; // exclusive

      const unmatchedTargetCount = gapTargetEnd - gapTargetStart;
      const unmatchedSpokenCount = gapSpokenEnd - gapSpokenStart;

      if (unmatchedTargetCount > 0) {
        for (let offset = 0; offset < unmatchedTargetCount; offset++) {
          const tIdx = gapTargetStart + offset;
          if (offset < unmatchedSpokenCount) {
            // A different/wrong word was spoken in this exact position -> RED (Mispronunciation, 0%)
            const wrongSpoken = spokenTokenObjs[gapSpokenStart + offset];
            slotResults[tIdx] = {
              score: 0,
              error_type: 'Mispronunciation',
              spokenToken: wrongSpoken ? wrongSpoken.token : 'wrong_word'
            };
          } else {
            // Nothing was spoken in this position -> GREY STRIKETHROUGH (Omission, 0%)
            slotResults[tIdx] = {
              score: 0,
              error_type: 'Omission',
              spokenToken: ''
            };
          }
        }
      }
    }

    const totalScore = slotResults.reduce((s, r) => s + (r ? r.score : 0), 0);
    return { slotResults, totalScore };
  };

  // ============================================================================
  // 4. RECORDING, SEQUENTIAL PLAYBACK & GRADING HANDSHAKE
  // ============================================================================

  // Step 1: Play Teacher Sample Audio -> Reveal "Repeat"
  const playSample = () => {
    stopCurrentAudio();
    if (!audioUrl) {
      setPhase('ready_to_record');
      return;
    }
    setPhase('playing_sample');
    const audio = new Audio(audioUrl);
    activePlaybackRef.current = audio;

    const finishSample = () => {
      if (activePlaybackRef.current === audio) {
        activePlaybackRef.current = null;
      }
      setPhase('ready_to_record');
    };

    audio.onended = finishSample;
    audio.onerror = finishSample;
    audio.play().catch(finishSample);
  };

  // Step 2: Start Recording (SpeechRecognition starts synchronously FIRST; NO live AudioContext)
  const startRecording = async () => {
    try {
      stopCurrentAudio();
      audioChunksRef.current = [];
      committedSegmentsRef.current = [];
      currentSegmentRef.current = [];
      speechFlushedRef.current = false;
      isRecordingRef.current = true;

      // 1. Start SpeechRecognition SYNCHRONOUSLY FIRST inside the tap gesture
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }

      // 2. Acquire stream for MediaRecorder ONLY (no live AudioContext to avoid Android HAL clash)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });

      activeStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (studentAudioUrlRef.current) {
          URL.revokeObjectURL(studentAudioUrlRef.current);
        }
        const url = URL.createObjectURL(audioBlob);
        studentAudioUrlRef.current = url;

        // Release hardware mic tracks completely before starting sequential audio playback
        stream.getTracks().forEach((track) => track.stop());
        if (activeStreamRef.current === stream) {
          activeStreamRef.current = null;
        }

        runPlaybackReview(url, audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();
      setPhase('recording');
    } catch (err) {
      console.error("Microphone access denied or audio initialization failed", err);
      isRecordingRef.current = false;
      setPhase('ready_to_record');
    }
  };

  // Step 3: Stop Recording (Flushes SpeechRecognition for 550ms while mic is still alive, then stops MediaRecorder)
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;

    setPhase('playing_review');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        speechFlushedRef.current = true;
      }
    } else {
      speechFlushedRef.current = true;
    }

    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    }, 550);
  };

  // Strictly sequential single-audio player: guarantees Teacher Audio ends before Student Audio begins
  const playAudioSequentially = (url) => {
    return new Promise((resolve) => {
      if (!url) {
        resolve();
        return;
      }

      stopCurrentAudio();

      let settled = false;
      const audio = new Audio(url);
      activePlaybackRef.current = audio;

      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(safetyTimer);
        try {
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
        } catch (e) {}
        if (activePlaybackRef.current === audio) {
          activePlaybackRef.current = null;
        }
        resolve();
      };

      let safetyTimer = setTimeout(finish, 35000);

      audio.onloadedmetadata = () => {
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          clearTimeout(safetyTimer);
          safetyTimer = setTimeout(finish, Math.ceil(audio.duration * 1000) + 2500);
        }
      };

      audio.onended = finish;
      audio.onerror = finish;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(finish);
      }
    });
  };

  // Step 4: "Comparing..." (Plays Reference -> 350ms gap -> Student Audio, while grading)
  const runPlaybackReview = async (studentBlobUrl, audioBlob) => {
    setPhase('playing_review');

    try {
      const playbackSequence = async () => {
        if (audioUrl) {
          await playAudioSequentially(audioUrl);
          await new Promise((r) => setTimeout(r, 350));
        }
        await playAudioSequentially(studentBlobUrl);
      };

      await Promise.all([playbackSequence(), executeGrading(audioBlob)]);
    } catch (err) {
      console.error("Review playback error:", err);
    } finally {
      setPhase('completed');
    }
  };

  // Step 5: Execute Two-Pass Anchored Grading & Server Sync
  const executeGrading = async (audioBlob) => {
    let waitTicks = 6;
    while (!speechFlushedRef.current && waitTicks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitTicks--;
    }

    if (currentSegmentRef.current && currentSegmentRef.current.length > 0) {
      committedSegmentsRef.current.push(...currentSegmentRef.current);
      currentSegmentRef.current = [];
    }

    const blobStats = await analyzeRecordedBlob(audioBlob);
    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current - 550) / 1000);
    const pitchVariance = Math.max(14, blobStats.pitchVariance || 15);

    const cleanRawTargets = wordsList.map((w) => w.toLowerCase().replace(/[^\w\s]/gi, ''));
    const targetContentIndices = [];
    const targetContentTokens = [];

    cleanRawTargets.forEach((tWord, idx) => {
      if (tWord && !SCRIPT_FILLERS.has(tWord)) {
        targetContentIndices.push(idx);
        targetContentTokens.push(tWord);
      }
    });

    const totalContentWords = targetContentTokens.length;
    const allSegments = committedSegmentsRef.current;

    // Evaluate across up to 3 STT alternatives and pick the alignment with the highest anchor score
    let bestAlignment = null;
    let bestCandidateTokens = [];

    if (allSegments.length > 0 && totalContentWords > 0) {
      for (let altIdx = 0; altIdx < 3; altIdx++) {
        const candidateObjs = [];
        for (const seg of allSegments) {
          const chosenAlt =
            seg.alternatives[Math.min(altIdx, seg.alternatives.length - 1)] || seg.alternatives[0];
          if (chosenAlt && chosenAlt.transcript) {
            const toks = tokenizeTranscriptString(
              chosenAlt.transcript,
              cleanRawTargets,
              chosenAlt.confidence
            );
            candidateObjs.push(...toks);
          }
        }

        if (candidateObjs.length > 0) {
          const alignment = runTwoPassAnchoredAlignment(targetContentTokens, candidateObjs);
          if (!bestAlignment || alignment.totalScore > bestAlignment.totalScore) {
            bestAlignment = alignment;
            bestCandidateTokens = candidateObjs;
          }
        }
      }
    }

    // Special check ONLY for isolated single-letter/digit sequences (e.g., "Uh... Yes uh... E R N E S T O")
    // if Android STT captured the intro word ("Yes") but dropped the trailing isolated single letters:
    if (bestAlignment && totalContentWords > 0) {
      const singleCharIndices = [];
      targetContentTokens.forEach((t, cIdx) => {
        if (t.length === 1) singleCharIndices.push(cIdx);
      });

      const capturedSingleChars = singleCharIndices.filter(
        (cIdx) =>
          bestAlignment.slotResults[cIdx] &&
          bestAlignment.slotResults[cIdx].error_type !== 'Omission'
      ).length;

      // Only supplement isolated 1-char slots if STT captured 0 of the spelled letters AND audio proves extra letter bursts
      if (
        singleCharIndices.length >= 3 &&
        capturedSingleChars === 0 &&
        blobStats.voicedSec >= 0.65 &&
        blobStats.burstCount >= 3
      ) {
        const nonCharSpokenCount = totalContentWords - singleCharIndices.length;
        const extraBursts = Math.max(0, blobStats.burstCount - nonCharSpokenCount);
        const charsToCredit = Math.min(singleCharIndices.length, extraBursts);
        const clarities = blobStats.burstClarities;

        for (let k = 0; k < charsToCredit; k++) {
          const cIdx = singleCharIndices[k];
          const segClarity =
            clarities.length > 0 ? clarities[k % clarities.length] : blobStats.avgClarity;
          const charScore = segClarity >= 0.68 ? 88 : 72;
          bestAlignment.slotResults[cIdx] = {
            score: charScore,
            error_type: charScore >= levelProfile.wordApprove ? 'None' : 'Mispronunciation',
            spokenToken: targetContentTokens[cIdx]
          };
        }
      }
    }

    // Build Final Word-Level Heatmap Data
    const localWordLevelData = [];
    let totalWordScore = 0;
    let matchedContentCount = 0;
    let redMismatchCount = 0;

    if (!bestAlignment || totalContentWords === 0 || durationSec < 0.35) {
      wordsList.forEach((rawWord, idx) => {
        const cleanT = cleanRawTargets[idx];
        if (!cleanT || SCRIPT_FILLERS.has(cleanT)) {
          localWordLevelData.push({ word: rawWord, score: 100, error_type: 'None' });
        } else {
          localWordLevelData.push({ word: rawWord, score: 0, error_type: 'Omission' });
        }
      });
    } else {
      const contentMap = {};
      targetContentIndices.forEach((origIdx, cIdx) => {
        contentMap[origIdx] = bestAlignment.slotResults[cIdx];
      });

      wordsList.forEach((rawWord, idx) => {
        const cleanT = cleanRawTargets[idx];
        if (!cleanT || SCRIPT_FILLERS.has(cleanT)) {
          localWordLevelData.push({ word: rawWord, score: 100, error_type: 'None' });
        } else {
          const res = contentMap[idx] || { score: 0, error_type: 'Omission' };
          totalWordScore += res.score;
          if (res.score >= levelProfile.minWordPass) {
            matchedContentCount++;
          }
          if (res.score === 0 && res.error_type === 'Mispronunciation') {
            redMismatchCount++;
          }
          localWordLevelData.push({
            word: rawWord,
            score: res.score,
            error_type: res.error_type
          });
        }
      });
    }

    // Calculate CEFR-Calibrated Overall Score
    let localOverallScore = 0;
    let localPassed = false;

    if (bestAlignment && totalContentWords > 0 && durationSec >= 0.35) {
      const accuracyScore = totalWordScore / totalContentWords;
      const completenessScore = (matchedContentCount / totalContentWords) * 100;
      const rawProsody = pitchVariance > 12 ? 100 : Math.max(50, pitchVariance * 6);
      const prosodyScore = rawProsody * (completenessScore / 100);

      localOverallScore =
        accuracyScore * levelProfile.wAccuracy +
        completenessScore * levelProfile.wCompleteness +
        prosodyScore * levelProfile.wProsody;

      // Apply a direct substitution penalty when the student says a completely wrong word
      if (redMismatchCount > 0) {
        const penalty = (redMismatchCount / totalContentWords) * 20;
        localOverallScore = Math.max(0, localOverallScore - penalty);
      }

      const coverageRatio = matchedContentCount / totalContentWords;
      localPassed =
        localOverallScore >= levelProfile.passScore &&
        coverageRatio >= levelProfile.minCoverageRatio;
    }

    const transcriptForServer = bestCandidateTokens.map((o) => o.token).join(' ');
    const isGhost = !transcriptForServer || durationSec < 0.35;

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: transcriptForServer,
          cefr_level: cefrLevel,
          duration_sec: durationSec,
          pitch_variance: pitchVariance,
          attempt_number: attempt,
          is_ghost_attempt: isGhost
        }
      });

      if (error) throw error;

      // Use the Two-Pass Anchored results if server returned data, keeping exact Red/Yellow/Grey distinctions
      const finalWordData =
        data?.word_level_data && data.word_level_data.length === wordsList.length
          ? data.word_level_data
          : localWordLevelData;

      const finalScore =
        typeof data?.overall_score === 'number' && data.overall_score > 0
          ? data.overall_score
          : localOverallScore;

      const finalPassed =
        typeof data?.passed === 'boolean' ? data.passed : localPassed;

      setOverallScore(finalScore);
      setWordResults(finalWordData);

      const newFailed = new Set();
      finalWordData.forEach((w, idx) => {
        if (w.score < levelProfile.wordApprove || w.error_type === 'Omission') {
          newFailed.add(idx);
        }
      });
      setFailedIndices(newFailed);

      if (finalPassed) {
        const yieldPercent = attempt === 1 ? 100 : attempt === 2 ? 85 : 70;
        setPointsAwarded(yieldPercent);
        setCanContinue(true);
      } else {
        if (attempt >= 3) {
          setPointsAwarded(isGhost ? 0 : 50);
          setCanContinue(true);
        } else {
          setCanContinue(false);
        }
      }
    } catch (err) {
      console.error("Using local Two-Pass Anchored evaluation:", err);
      setOverallScore(localOverallScore);
      setWordResults(localWordLevelData);

      const newFailed = new Set();
      localWordLevelData.forEach((w, idx) => {
        if (w.score < levelProfile.wordApprove || w.error_type === 'Omission') {
          newFailed.add(idx);
        }
      });
      setFailedIndices(newFailed);

      if (localPassed) {
        const yieldPercent = attempt === 1 ? 100 : attempt === 2 ? 85 : 70;
        setPointsAwarded(yieldPercent);
        setCanContinue(true);
      } else if (attempt >= 3) {
        setPointsAwarded(isGhost ? 0 : 50);
        setCanContinue(true);
      } else {
        setCanContinue(false);
      }
    }
  };

  // Step 6: Retry or Continue
  const handleTryAgain = () => {
    stopCurrentAudio();
    setupSpeechRecognition();
    setAttempt((prev) => prev + 1);
    setOverallScore(null);
    setWordResults([]);
    setPhase(audioUrl ? 'listen' : 'ready_to_record');
  };

  const handleContinue = () => {
    stopCurrentAudio();
    onComplete({
      overallScore: overallScore || 0,
      pointsAwarded,
      passed: canContinue && (overallScore || 0) >= levelProfile.passScore
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
      {/* Top Meta Indicator */}
      <div className="flex items-center justify-between w-full mb-6 px-2 text-xs font-semibold tracking-wider uppercase text-slate-400">
        <span>Attempt {attempt} / 3</span>
        <span>Target: {cefrLevel}</span>
      </div>

      {/* Dynamic Subtitle / Heatmap Display */}
      <div className="text-xl md:text-2xl text-center leading-relaxed mb-8 select-none min-h-[4rem] flex flex-wrap items-center justify-center gap-2">
        {wordsList.map((word, idx) => {
          if (phase === 'completed' && wordResults[idx]) {
            const res = wordResults[idx];
            // 1. Omitted Word -> Grey with Strikethrough
            if (res.error_type === 'Omission') {
              return (
                <span key={idx} className="text-slate-500 line-through opacity-40">
                  {word}
                </span>
              );
            }
            // 2. Pronounced Clearly -> Green
            if (res.score >= levelProfile.wordApprove) {
              return (
                <span key={idx} className="text-emerald-400 font-bold">
                  {word}
                </span>
              );
            }
            // 3. Right Word Pronounced Slightly Off -> Yellow
            if (res.score >= levelProfile.minWordPass) {
              return (
                <span key={idx} className="text-[#fcd34d] font-bold">
                  {word}
                </span>
              );
            }
            // 4. Different Word Spoken or Unintelligible -> Red
            return (
              <span key={idx} className="text-red-500 font-bold">
                {word}
              </span>
            );
          }

          const isTargeted = failedIndices.has(idx);

          if (attempt === 2 && isTargeted) {
            return <span key={idx} className="font-black underline text-white">{word}</span>;
          }

          if (attempt === 3 && isTargeted) {
            return (
              <span
                key={idx}
                className="font-black underline text-[#fcd34d] drop-shadow-[0_0_10px_rgba(252,211,77,0.8)] animate-pulse"
              >
                {word}
              </span>
            );
          }

          if (attempt > 1 && !isTargeted) {
            return <span key={idx} className="text-white/60 font-normal">{word}</span>;
          }

          return <span key={idx} className="text-white font-medium">{word}</span>;
        })}
      </div>

      {/* Single Progressive-Disclosure Button Interface */}
      <div className="flex flex-col items-center gap-4 w-full">
        {phase === 'completed' && (
          <div className="text-center mb-1">
            <span className="text-3xl font-extrabold text-white">
              {Math.round(overallScore || 0)}%
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {canContinue && overallScore >= levelProfile.passScore
                ? "Pronunciation Approved"
                : "Needs Practice"}
            </p>
          </div>
        )}

        {phase === 'listen' && (
          <button
            onClick={playSample}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            Listen
          </button>
        )}

        {phase === 'playing_sample' && (
          <button
            disabled
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-sky-900/60 border border-sky-500/40 text-sky-300 font-bold rounded-xl shadow-lg animate-pulse cursor-not-allowed"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            Listening...
          </button>
        )}

        {phase === 'ready_to_record' && (
          <button
            onClick={startRecording}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
            Repeat
          </button>
        )}

        {phase === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-slate-800 border border-red-500 text-red-400 font-bold rounded-xl shadow-lg transition transform active:scale-95 animate-pulse"
          >
            <span className="w-3.5 h-3.5 bg-red-500 rounded-sm" />
            Stop
          </button>
        )}

        {phase === 'playing_review' && (
          <button
            disabled
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-slate-800/80 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl shadow-lg animate-pulse cursor-not-allowed"
          >
            Comparing...
          </button>
        )}

        {phase === 'completed' && !canContinue && attempt < 3 && (
          <button
            onClick={handleTryAgain}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95"
          >
            Try Again
          </button>
        )}

        {phase === 'completed' && (canContinue || attempt >= 3) && (
          <button
            onClick={handleContinue}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition transform active:scale-95"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}