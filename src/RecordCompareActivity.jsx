import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';
import { doubleMetaphone } from 'double-metaphone';
import { syllable } from 'syllable';
import levenshtein from 'fast-levenshtein';

/**
 * Progressive CEFR Calibration Matrix (A1 -> C2)
 */
const CEFR_PROFILES = {
  A1: {
    passScore: 65,
    wordApprove: 80,
    minWordPass: 60,
    minCoverageRatio: 0.75,
    maxEditShort: 1,
    maxEditLong: 2,
    editPenalty: 15,
    allowSecondaryMetaphone: true,
    closeLetterScore: 72,
    phoneticWordScore: 75,
    minConfidence: 0.58,
    dtwTolerance: 1.15,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  A2: {
    passScore: 70,
    wordApprove: 80,
    minWordPass: 60,
    minCoverageRatio: 0.78,
    maxEditShort: 1,
    maxEditLong: 2,
    editPenalty: 16,
    allowSecondaryMetaphone: true,
    closeLetterScore: 70,
    phoneticWordScore: 74,
    minConfidence: 0.62,
    dtwTolerance: 1.10,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  B1: {
    passScore: 75,
    wordApprove: 82,
    minWordPass: 60,
    minCoverageRatio: 0.80,
    maxEditShort: 1,
    maxEditLong: 2,
    editPenalty: 20,
    allowSecondaryMetaphone: false,
    closeLetterScore: 66,
    phoneticWordScore: 72,
    minConfidence: 0.66,
    dtwTolerance: 1.00,
    wAccuracy: 0.60,
    wCompleteness: 0.30,
    wProsody: 0.10
  },
  B2: {
    passScore: 80,
    wordApprove: 85,
    minWordPass: 60,
    minCoverageRatio: 0.85,
    maxEditShort: 1,
    maxEditLong: 1,
    editPenalty: 24,
    allowSecondaryMetaphone: false,
    closeLetterScore: 0,
    phoneticWordScore: 70,
    minConfidence: 0.70,
    dtwTolerance: 0.95,
    wAccuracy: 0.65,
    wCompleteness: 0.25,
    wProsody: 0.10
  },
  C1: {
    passScore: 85,
    wordApprove: 88,
    minWordPass: 60,
    minCoverageRatio: 0.90,
    maxEditShort: 0,
    maxEditLong: 1,
    editPenalty: 28,
    allowSecondaryMetaphone: false,
    closeLetterScore: 0,
    phoneticWordScore: 68,
    minConfidence: 0.75,
    dtwTolerance: 0.90,
    wAccuracy: 0.70,
    wCompleteness: 0.15,
    wProsody: 0.15
  },
  C2: {
    passScore: 88,
    wordApprove: 90,
    minWordPass: 60,
    minCoverageRatio: 0.92,
    maxEditShort: 0,
    maxEditLong: 1,
    editPenalty: 32,
    allowSecondaryMetaphone: false,
    closeLetterScore: 0,
    phoneticWordScore: 65,
    minConfidence: 0.80,
    dtwTolerance: 0.85,
    wAccuracy: 0.75,
    wCompleteness: 0.10,
    wProsody: 0.15
  }
};

// Conversational interjections: rendered green in UI and excluded from denominator
const SCRIPT_FILLERS = new Set([
  'uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh', 'er', 'erm'
]);

// Fixed 26-Letter English Alphabet Phonetic Transcription Map
const ALPHABET_PHONETICS = {
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

// L1 Phonetic Letter Confusions (Awards Yellow 66-72% at A1-B1, never 100%)
const CLOSE_ALPHABET_PAIRS = {
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

// Closed-set English Contractions & Titles
const STRUCTURAL_EQUIVALENTS = {
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

// Universal English Number Lexicon (Units, Teens, Tens, Scales)
const NUMBER_UNITS = {
  zero: 0, oh: 0, nil: 0,
  one: 1, won: 1, first: 1,
  two: 2, to: 2, too: 2, second: 2,
  three: 3, third: 3,
  four: 4, for: 4, fore: 4, fourth: 4,
  five: 5, fifth: 5,
  six: 6, sixth: 6,
  seven: 7, seventh: 7,
  eight: 8, ate: 8, eighth: 8,
  nine: 9, ninth: 9,
  ten: 10, tenth: 10,
  eleven: 11, eleventh: 11,
  twelve: 12, twelfth: 12,
  thirteen: 13, thirteenth: 13,
  fourteen: 14, fourteenth: 14,
  fifteen: 15, fifteenth: 15,
  sixteen: 16, sixteenth: 16,
  seventeen: 17, seventeenth: 17,
  eighteen: 18, eighteenth: 18,
  nineteen: 19, nineteenth: 19
};

const NUMBER_TENS = {
  twenty: 20, twentieth: 20,
  thirty: 30, thirtieth: 30,
  forty: 40, fortieth: 40,
  fifty: 50, fiftieth: 50,
  sixty: 60, sixtieth: 60,
  seventy: 70, seventieth: 70,
  eighty: 80, eightieth: 80,
  ninety: 90, ninetieth: 90
};

const CLOSE_DIGIT_HOMOPHONES = {
  tree: '3', free: '3',
  fine: '5',
  sick: '6', sicks: '6',
  mine: '9'
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

  // Audio Playback & Cached Teacher DSP Refs
  const activePlaybackRef = useRef(null);
  const studentAudioUrlRef = useRef(null);
  const teacherDSPRef = useRef(null);
  const cachedTeacherUrlRef = useRef('');

  // Persistent AudioContext & Recording Refs
  const sharedAudioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const liveRawSamplesRef = useRef([]);
  const liveSampleRateRef = useRef(44100);
  const animationFrameRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeStreamRef = useRef(null);

  // Stateful resultIndex SpeechRecognition Refs
  const recognitionRef = useRef(null);
  const sttRestartTimerRef = useRef(null);
  const lockedSegmentsRef = useRef([]);
  const activeInterimRef = useRef(null);
  const speechFlushedRef = useRef(false);

  const recordingStartTimeRef = useRef(0);
  const isRecordingRef = useRef(false);

  const wordsList = targetText.trim().split(/\s+/);

  // ============================================================================
  // 1. UNIVERSAL NLP WRAPPERS (SYLLABLE, DOUBLE-METAPHONE, LEVENSHTEIN, NUMBERS)
  // ============================================================================

  const getSharedAudioContext = async () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!sharedAudioCtxRef.current || sharedAudioCtxRef.current.state === 'closed') {
      sharedAudioCtxRef.current = new AudioCtx();
    }
    if (sharedAudioCtxRef.current.state === 'suspended') {
      try {
        await sharedAudioCtxRef.current.resume();
      } catch (e) {}
    }
    return sharedAudioCtxRef.current;
  };

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

  const computeEditDistance = (a = '', b = '') => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    try {
      if (typeof levenshtein?.get === 'function') {
        return levenshtein.get(a, b);
      }
    } catch (e) {}
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

  const computeMetaphoneCodes = (word = '') => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return ['', ''];
    try {
      const fn = typeof doubleMetaphone === 'function' ? doubleMetaphone : doubleMetaphone?.default;
      if (typeof fn === 'function') {
        const codes = fn(clean);
        if (Array.isArray(codes) && codes.length >= 1) {
          return [codes[0] || '', codes[1] || codes[0] || ''];
        }
      }
    } catch (e) {}
    return [clean, clean];
  };

  const countWordSyllables = (word = '') => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return 1;
    if (clean.length === 1) {
      return clean === 'w' ? 3 : clean === '7' || clean === '0' ? 2 : 1;
    }
    try {
      const fn = typeof syllable === 'function' ? syllable : syllable?.default;
      if (typeof fn === 'function') {
        const count = fn(clean);
        if (count > 0) return count;
      }
    } catch (e) {}
    // Universal algorithmic vowel-cluster heuristic fallback
    const stripped = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    const matches = stripped.match(/[aeiouy]{1,2}/g);
    return Math.max(1, matches ? matches.length : 1);
  };

  // Universal English Number Parser: converts spoken number words into canonical digit strings
  const convertSpokenNumbersInTokens = (tokens, hasTargetDigits, hasSingleDigits) => {
    if (!hasTargetDigits) return tokens;

    const result = [];
    let i = 0;

    while (i < tokens.length) {
      const item = tokens[i];
      const w = item.token;

      if (CLOSE_DIGIT_HOMOPHONES[w] !== undefined) {
        result.push({
          token: CLOSE_DIGIT_HOMOPHONES[w],
          confidence: Math.min(item.confidence, 0.74),
          approx: true
        });
        i++;
        continue;
      }

      // Check for compound tens + units (e.g., "twenty five" -> "25")
      if (NUMBER_TENS[w] !== undefined) {
        let val = NUMBER_TENS[w];
        if (
          i + 1 < tokens.length &&
          NUMBER_UNITS[tokens[i + 1].token] !== undefined &&
          NUMBER_UNITS[tokens[i + 1].token] < 10
        ) {
          val += NUMBER_UNITS[tokens[i + 1].token];
          i += 2;
        } else {
          i++;
        }
        const strVal = String(val);
        if (hasSingleDigits && strVal.length > 1) {
          strVal.split('').forEach((d) =>
            result.push({ token: d, confidence: item.confidence, approx: false })
          );
        } else {
          result.push({ token: strVal, confidence: item.confidence, approx: false });
        }
        continue;
      }

      if (NUMBER_UNITS[w] !== undefined) {
        const strVal = String(NUMBER_UNITS[w]);
        if (hasSingleDigits && strVal.length > 1) {
          strVal.split('').forEach((d) =>
            result.push({ token: d, confidence: item.confidence, approx: false })
          );
        } else {
          result.push({ token: strVal, confidence: item.confidence, approx: false });
        }
        i++;
        continue;
      }

      // Strip ordinal suffixes on digits ("25th" -> "25")
      const ordinalDigitMatch = w.match(/^(\d+)(?:st|nd|rd|th)$/);
      if (ordinalDigitMatch) {
        const dStr = ordinalDigitMatch[1];
        if (hasSingleDigits && dStr.length > 1) {
          dStr.split('').forEach((d) =>
            result.push({ token: d, confidence: item.confidence, approx: false })
          );
        } else {
          result.push({ token: dStr, confidence: item.confidence, approx: false });
        }
        i++;
        continue;
      }

      if (hasSingleDigits && /^\d+$/.test(w) && w.length > 1) {
        w.split('').forEach((d) =>
          result.push({ token: d, confidence: item.confidence, approx: false })
        );
        i++;
        continue;
      }

      result.push(item);
      i++;
    }

    return result;
  };

  // ============================================================================
  // 2. TEACHER-ANCHORED AUDIO DSP & PAUSE-INVARIANT DTW ENGINE
  // ============================================================================

  const analyzePCMBuffer = (channelData, sampleRate) => {
    const empty = {
      valid: false,
      voicedSec: 0,
      burstCount: 0,
      syllablePeaks: 0,
      pitchVariance: 0,
      avgClarity: 0,
      activeFrames: [],
      bursts: []
    };

    if (!channelData || channelData.length < 512) return empty;

    const frameSize = Math.max(256, Math.floor(sampleRate * 0.025)); // 25ms frame window
    const pitchSize = 1024;
    const detector =
      channelData.length >= pitchSize ? PitchDetector.forFloat32Array(pitchSize) : null;

    const calcAlpha = (cutoffHz) => {
      const dt = 1 / sampleRate;
      const rc = 1 / (2 * Math.PI * cutoffHz);
      return dt / (rc + dt);
    };

    const a400 = calcAlpha(400);
    const a1200 = calcAlpha(1200);
    const a3000 = calcAlpha(3000);

    const rawFrames = [];

    for (let offset = 0; offset + frameSize <= channelData.length; offset += frameSize) {
      let sumSq = 0;
      let zeroCrossings = 0;
      let lp400 = channelData[offset];
      let lp1200 = lp400;
      let lp3000 = lp400;
      let prev = lp400;

      let eLow = 0;
      let eMid = 0;
      let eHigh = 0;
      let eSib = 0;

      for (let k = 0; k < frameSize; k++) {
        const s = channelData[offset + k];
        sumSq += s * s;
        if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) zeroCrossings++;
        prev = s;

        lp400 += a400 * (s - lp400);
        lp1200 += a1200 * (s - lp1200);
        lp3000 += a3000 * (s - lp3000);

        const bLow = lp400;
        const bMid = lp1200 - lp400;
        const bHigh = lp3000 - lp1200;
        const bSib = s - lp3000;

        eLow += bLow * bLow;
        eMid += bMid * bMid;
        eHigh += bHigh * bHigh;
        eSib += bSib * bSib;
      }

      const rms = Math.sqrt(sumSq / frameSize);
      const zcr = zeroCrossings / frameSize;
      const tot = Math.max(1e-8, eLow + eMid + eHigh + eSib);

      let pitch = 0;
      let clarity = 0;
      if (detector && offset + pitchSize <= channelData.length && rms > 0.0035) {
        const slice = channelData.subarray(offset, offset + pitchSize);
        const [p, c] = detector.findPitch(slice, sampleRate);
        if (p >= 55 && p <= 550 && c >= 0.45) {
          pitch = p;
          clarity = c;
        }
      }

      rawFrames.push({
        rms,
        zcr,
        rLow: eLow / tot,
        rMid: eMid / tot,
        rHigh: eHigh / tot,
        rSib: eSib / tot,
        vowelEnergy: rms * ((eLow + eMid + eHigh) / tot),
        pitch,
        clarity
      });
    }

    if (rawFrames.length === 0) return empty;

    const sortedRms = rawFrames.map((f) => f.rms).sort((a, b) => a - b);
    const noiseFloor = sortedRms[Math.floor(sortedRms.length * 0.18)] || 0.001;
    const peakRms = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.02;
    const voiceThreshold = Math.max(0.0045, Math.min(0.020, noiseFloor * 2.4, peakRms * 0.18));

    let activeCount = 0;
    const bursts = [];
    let curBurst = [];
    let silenceRun = 0;

    rawFrames.forEach((f) => {
      f.normEnergy = Math.min(1, f.rms / Math.max(0.01, peakRms));
      const isVoiced = f.rms >= voiceThreshold;
      const isSibilant = f.rms >= voiceThreshold * 0.55 && (f.rSib >= 0.25 || f.zcr >= 0.15);
      f.active = isVoiced || isSibilant;

      if (f.active) {
        activeCount++;
        silenceRun = 0;
        curBurst.push(f);
      } else {
        silenceRun++;
        if (silenceRun >= 3 && curBurst.length >= 2) {
          bursts.push(curBurst);
          curBurst = [];
        } else if (silenceRun >= 3) {
          curBurst = [];
        }
      }
    });

    if (curBurst.length >= 2) bursts.push(curBurst);
    if (activeCount < 2) return empty;

    const activeFrames = rawFrames.filter((f) => f.active);

    let syllablePeaks = 0;
    let lastPk = -4;
    for (let i = 1; i < rawFrames.length - 1; i++) {
      const cur = rawFrames[i];
      if (
        cur.active &&
        cur.normEnergy >= 0.18 &&
        cur.vowelEnergy >= rawFrames[i - 1].vowelEnergy &&
        cur.vowelEnergy >= rawFrames[i + 1].vowelEnergy &&
        i - lastPk >= 4
      ) {
        syllablePeaks++;
        lastPk = i;
      }
    }

    const validPitches = activeFrames.filter((f) => f.clarity >= 0.52 && f.pitch > 0);
    let pitchVariance = 0;
    if (validPitches.length > 1) {
      const meanP = validPitches.reduce((s, f) => s + f.pitch, 0) / validPitches.length;
      const varP =
        validPitches.reduce((s, f) => s + Math.pow(f.pitch - meanP, 2), 0) /
        validPitches.length;
      pitchVariance = Math.sqrt(varP);
    } else if (activeCount >= 4) {
      pitchVariance = 15;
    }

    const avgClarity =
      validPitches.length > 0
        ? validPitches.reduce((s, f) => s + f.clarity, 0) / validPitches.length
        : 0.72;

    return {
      valid: true,
      voicedSec: activeCount * 0.025,
      burstCount: Math.max(1, bursts.length),
      syllablePeaks: Math.max(bursts.length, syllablePeaks),
      pitchVariance,
      avgClarity,
      activeFrames,
      bursts
    };
  };

  const extractAudioDSP = async (audioSource, allowLiveFallback = false) => {
    try {
      if (audioSource) {
        const ctx = await getSharedAudioContext();
        let arrayBuffer = null;

        if (typeof audioSource === 'string') {
          const resp = await fetch(audioSource);
          if (resp.ok) arrayBuffer = await resp.arrayBuffer();
        } else if (audioSource instanceof Blob && audioSource.size > 0) {
          arrayBuffer = await audioSource.arrayBuffer();
        }

        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
          const decoded = analyzePCMBuffer(
            audioBuffer.getChannelData(0),
            audioBuffer.sampleRate
          );
          if (decoded.valid) return decoded;
        }
      }
    } catch (e) {
      console.warn("Audio container decode fallback to live PCM:", e);
    }

    if (allowLiveFallback && liveRawSamplesRef.current.length > 0) {
      const totalLen = liveRawSamplesRef.current.reduce((s, arr) => s + arr.length, 0);
      const merged = new Float32Array(totalLen);
      let offset = 0;
      for (const chunk of liveRawSamplesRef.current) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return analyzePCMBuffer(merged, liveSampleRateRef.current || 44100);
    }

    return analyzePCMBuffer(null, 44100);
  };

  // Pre-decode Teacher Reference Audio during the Listen phase
  useEffect(() => {
    let cancelled = false;
    if (audioUrl && audioUrl !== cachedTeacherUrlRef.current) {
      extractAudioDSP(audioUrl, false).then((dsp) => {
        if (!cancelled && dsp.valid) {
          teacherDSPRef.current = dsp;
          cachedTeacherUrlRef.current = audioUrl;
        }
      });
    } else if (!audioUrl) {
      teacherDSPRef.current = null;
      cachedTeacherUrlRef.current = '';
    }
    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  // Dynamic Time Warping (DTW) spectral envelope comparison between Teacher & Student slices
  const computeSliceDTW = (teacherSlice = [], studentSlice = []) => {
    if (!teacherSlice.length || !studentSlice.length) return 85;

    const N = teacherSlice.length;
    const M = studentSlice.length;
    const dtw = Array.from({ length: N + 1 }, () => Array(M + 1).fill(Infinity));
    dtw[0][0] = 0;

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const tf = teacherSlice[i - 1];
        const sf = studentSlice[j - 1];

        const dist =
          Math.abs(tf.rLow - sf.rLow) * 0.8 +
          Math.abs(tf.rMid - sf.rMid) * 1.1 +
          Math.abs(tf.rHigh - sf.rHigh) * 1.2 +
          Math.abs(tf.rSib - sf.rSib) * 1.9 +
          Math.abs(tf.zcr - sf.zcr) * 1.5;

        dtw[i][j] = dist + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      }
    }

    const avgDist = dtw[N][M] / (N + M);
    const rawScore = Math.round((112 - avgDist * 145) * levelProfile.dtwTolerance);
    return Math.max(0, Math.min(100, rawScore));
  };

  // ============================================================================
  // 3. UNIVERSAL TOKEN NORMALIZER & TWO-PASS ANCHORED ALIGNMENT
  // ============================================================================

  const normalizeSpokenStream = (rawString, cleanTargets, defaultConfidence = 0.88) => {
    if (!rawString || !rawString.trim()) return [];

    const hasDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));
    const hasSingleLetters = cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

    let text = rawString.toLowerCase();
    text = text.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

    // 1. Bidirectional Contraction & Title Normalization against Target Format
    const rawWords = text.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(Boolean);
    const structurallyAligned = [];

    let k = 0;
    while (k < rawWords.length) {
      const w = rawWords[k];
      const nextW = k + 1 < rawWords.length ? rawWords[k + 1] : '';

      // Check if 2 consecutive spoken words ("it is") should collapse into a target contraction ("its")
      let collapsedMatch = null;
      if (nextW) {
        for (const [contraction, parts] of Object.entries(STRUCTURAL_EQUIVALENTS)) {
          if (
            parts.length === 2 &&
            parts[0] === w &&
            parts[1] === nextW &&
            cleanTargets.includes(contraction) &&
            !cleanTargets.includes(w)
          ) {
            collapsedMatch = contraction;
            break;
          }
        }
      }

      if (collapsedMatch) {
        structurallyAligned.push({
          token: collapsedMatch,
          confidence: defaultConfidence,
          approx: false
        });
        k += 2;
        continue;
      }

      // Check if a single spoken contraction/title ("mister", "whats") should expand/map to target
      if (STRUCTURAL_EQUIVALENTS[w] && !cleanTargets.includes(w)) {
        const eq = STRUCTURAL_EQUIVALENTS[w];
        if (eq.length === 1 && cleanTargets.includes(eq[0])) {
          structurallyAligned.push({
            token: eq[0],
            confidence: defaultConfidence,
            approx: false
          });
          k++;
          continue;
        }
        if (eq.length === 2 && cleanTargets.includes(eq[0]) && cleanTargets.includes(eq[1])) {
          structurallyAligned.push(
            { token: eq[0], confidence: defaultConfidence, approx: false },
            { token: eq[1], confidence: defaultConfidence, approx: false }
          );
          k++;
          continue;
        }
      }

      if (!SCRIPT_FILLERS.has(w) || w === 'oh') {
        structurallyAligned.push({ token: w, confidence: defaultConfidence, approx: false });
      }
      k++;
    }

    // 2. Universal Number Normalization
    const numberNormalized = convertSpokenNumbersInTokens(
      structurallyAligned,
      hasDigits,
      hasSingleDigits
    );

    // 3. Spelled Letter Canonicalization (if target expects single letters)
    const nonSpelledTargets = new Set(
      cleanTargets.filter((w) => w.length > 1 && !SCRIPT_FILLERS.has(w))
    );

    const letterExpanded = [];
    for (const item of numberNormalized) {
      const tok = item.token;
      if (SCRIPT_FILLERS.has(tok)) continue;

      if (hasSingleLetters) {
        if (nonSpelledTargets.has(tok)) {
          letterExpanded.push(item);
        } else if (ALPHABET_PHONETICS[tok]) {
          letterExpanded.push({
            token: ALPHABET_PHONETICS[tok],
            confidence: item.confidence,
            approx: item.approx
          });
        } else if (tok.length > 1 && /^[a-z]+$/.test(tok)) {
          tok.split('').forEach((ch) =>
            letterExpanded.push({
              token: ch,
              confidence: item.confidence,
              approx: item.approx
            })
          );
        } else {
          letterExpanded.push(item);
        }
      } else {
        letterExpanded.push(item);
      }
    }

    // 4. Stutter / Self-Correction Deduplication (unless target itself repeats the token)
    const targetHasImmediateRepeat = cleanTargets.some(
      (w, idx) => idx > 0 && w === cleanTargets[idx - 1]
    );
    if (targetHasImmediateRepeat) return letterExpanded;

    const deduplicated = [];
    for (const item of letterExpanded) {
      const prev = deduplicated[deduplicated.length - 1];
      if (prev && prev.token === item.token && item.token.length > 1) {
        prev.confidence = Math.max(prev.confidence, item.confidence);
      } else {
        deduplicated.push(item);
      }
    }

    return deduplicated;
  };

  /**
   * Universal Pairwise Evaluator using `double-metaphone`, `syllable`, and `fast-levenshtein`:
   * - Exact or True Homophone Match -> 100% (Green)
   * - Secondary Metaphone / Bounded Levenshtein / L1 Close Letter / Low Confidence -> 64-78% (Yellow)
   * - Unrelated Word -> 0% (Red Mismatch)
   */
  const scoreTokenPairUniversal = (tWord, sObj) => {
    if (!sObj || !sObj.token) return { score: 0, matchType: 'None' };

    const sWord = sObj.token;
    const conf = typeof sObj.confidence === 'number' ? sObj.confidence : 0.88;
    const isLowConfidence = conf < levelProfile.minConfidence;

    // 1. Digit Target
    if (/^\d+$/.test(tWord)) {
      if (tWord === sWord) {
        if (sObj.approx) {
          return { score: levelProfile.closeLetterScore || 72, matchType: 'Close' };
        }
        return { score: isLowConfidence ? 76 : 100, matchType: isLowConfidence ? 'Close' : 'Exact' };
      }
      return { score: 0, matchType: 'None' };
    }

    // 2. Single Spelled Letter Target (a-z)
    if (tWord.length === 1 && /[a-z]/.test(tWord)) {
      const mapped = ALPHABET_PHONETICS[sWord] || sWord;
      if (tWord === mapped) {
        return { score: isLowConfidence ? 76 : 100, matchType: isLowConfidence ? 'Close' : 'Exact' };
      }
      if (
        levelProfile.closeLetterScore > 0 &&
        CLOSE_ALPHABET_PAIRS[tWord] &&
        CLOSE_ALPHABET_PAIRS[tWord].includes(mapped)
      ) {
        return { score: levelProfile.closeLetterScore, matchType: 'Close' };
      }
      return { score: 0, matchType: 'None' };
    }

    // 3. Exact Lexical or Structural Equivalent Match
    if (
      tWord === sWord ||
      (STRUCTURAL_EQUIVALENTS[tWord] &&
        (STRUCTURAL_EQUIVALENTS[tWord].includes(sWord) ||
          STRUCTURAL_EQUIVALENTS[tWord].join('') === sWord))
    ) {
      return { score: isLowConfidence ? 76 : 100, matchType: isLowConfidence ? 'Close' : 'Exact' };
    }

    // 4. Universal Phonetic & Edit Distance Evaluation
    const dist = computeEditDistance(tWord, sWord);
    const maxLen = Math.max(tWord.length, sWord.length);
    const editRatio = dist / maxLen;

    const [tPri, tSec] = computeMetaphoneCodes(tWord);
    const [sPri, sSec] = computeMetaphoneCodes(sWord);
    const tSyl = countWordSyllables(tWord);
    const sSyl = countWordSyllables(sWord);

    const primaryMetaphoneMatch = Boolean(tPri && sPri && tPri === sPri);
    const secondaryMetaphoneMatch = Boolean(
      levelProfile.allowSecondaryMetaphone &&
        ((tSec && sPri && tSec === sPri) || (tPri && sSec && tPri === sSec))
    );

    // True Homophone Check (Identical primary Double Metaphone, identical syllable count, small edit distance) -> 100% Green
    if (primaryMetaphoneMatch && tSyl === sSyl && dist <= 2 && editRatio <= 0.40) {
      return { score: isLowConfidence ? 76 : 100, matchType: isLowConfidence ? 'Close' : 'Exact' };
    }

    // Phonetic Approximation Check -> Yellow (65 - 78%)
    if ((primaryMetaphoneMatch || secondaryMetaphoneMatch) && editRatio <= 0.45) {
      const pScore = Math.min(78, Math.max(65, levelProfile.phoneticWordScore));
      return { score: pScore, matchType: 'Close' };
    }

    // Bounded Levenshtein Edit Tolerance -> Yellow (62 - 78%)
    const allowedEdits =
      tWord.length > 4 ? levelProfile.maxEditLong : levelProfile.maxEditShort;
    const firstCharAgrees =
      tWord[0] === sWord[0] ||
      (tPri && sPri && tPri[0] === sPri[0]) ||
      (CLOSE_ALPHABET_PAIRS[tWord[0]] && CLOSE_ALPHABET_PAIRS[tWord[0]].includes(sWord[0]));

    if (dist <= allowedEdits && editRatio <= 0.40 && firstCharAgrees) {
      const eScore = Math.min(78, Math.max(62, 100 - dist * levelProfile.editPenalty));
      return { score: eScore, matchType: 'Close' };
    }

    return { score: 0, matchType: 'None' };
  };

  /**
   * Two-Pass Anchored Sequence Alignment:
   * - Pass 1: Locks all valid Exact & Close matches (anchors) via Dynamic Programming.
   * - Pass 2: Inspects every inter-anchor gap:
   *     * Unmatched spoken words in gap -> RED (`score: 0`, `error_type: 'Mispronunciation'`)
   *     * Empty gap (0 spoken words) -> GREY STRIKETHROUGH (`score: 0`, `error_type: 'Omission'`)
   */
  const runTwoPassAnchoredAlignment = (targetContentTokens, spokenTokenObjs) => {
    const N = targetContentTokens.length;
    const M = spokenTokenObjs.length;

    const dp = Array.from({ length: N + 1 }, () => Array(M + 1).fill(0));
    const choice = Array.from({ length: N + 1 }, () => Array(M + 1).fill(''));

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const pair = scoreTokenPairUniversal(targetContentTokens[i - 1], spokenTokenObjs[j - 1]);
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

    const slotResults = new Array(N).fill(null);
    const fullChain = [{ tIdx: -1, sIdx: -1 }, ...anchors, { tIdx: N, sIdx: M }];

    for (let k = 0; k < fullChain.length - 1; k++) {
      const curr = fullChain[k];
      const next = fullChain[k + 1];

      if (curr.tIdx >= 0 && curr.tIdx < N) {
        const sObj = spokenTokenObjs[curr.sIdx];
        const pair = scoreTokenPairUniversal(targetContentTokens[curr.tIdx], sObj);
        slotResults[curr.tIdx] = {
          score: pair.score,
          error_type: pair.score < levelProfile.wordApprove ? 'Mispronunciation' : 'None'
        };
      }

      const gapTargetStart = curr.tIdx + 1;
      const gapTargetEnd = next.tIdx;
      const gapSpokenStart = curr.sIdx + 1;
      const gapSpokenEnd = next.sIdx;

      const unmatchedTargetCount = gapTargetEnd - gapTargetStart;
      const unmatchedSpokenCount = gapSpokenEnd - gapSpokenStart;

      if (unmatchedTargetCount > 0) {
        for (let offset = 0; offset < unmatchedTargetCount; offset++) {
          const tIdx = gapTargetStart + offset;
          if (offset < unmatchedSpokenCount) {
            slotResults[tIdx] = { score: 0, error_type: 'Mispronunciation' };
          } else {
            slotResults[tIdx] = { score: 0, error_type: 'Omission' };
          }
        }
      }
    }

    const totalScore = slotResults.reduce((s, r) => s + (r ? r.score : 0), 0);
    return { slotResults, totalScore, anchorCount: anchors.length };
  };

  // ============================================================================
  // 4. TEACHER-ANCHORED DTW FALLBACK (WHEN MOBILE OS BLOCKS STT)
  // ============================================================================

  const evaluateViaTeacherDTW = (targetContentTokens, studentDSP, teacherDSP, leadingFillers) => {
    const N = targetContentTokens.length;
    if (!studentDSP || !studentDSP.valid || studentDSP.voicedSec < 0.18 || N === 0) {
      return targetContentTokens.map(() => ({ score: 0, error_type: 'Omission' }));
    }

    const wordWeights = targetContentTokens.map((w) =>
      Math.max(0.8, countWordSyllables(w) * 0.9 + (w.length === 1 ? 0 : w.length * 0.05))
    );
    const totalWeight = wordWeights.reduce((a, b) => a + b, 0);
    const expectedSyllables = targetContentTokens.reduce(
      (s, w) => s + countWordSyllables(w),
      0
    );

    const sliceFramesByWeights = (frames, weights) => {
      if (!frames.length || !weights.length) return [];
      const sumW = weights.reduce((a, b) => a + b, 0);
      const out = [];
      let prev = 0;
      let acc = 0;
      for (let i = 0; i < weights.length; i++) {
        acc += weights[i];
        const end =
          i === weights.length - 1
            ? frames.length
            : Math.max(prev + 1, Math.min(frames.length - 1, Math.round((acc / sumW) * frames.length)));
        out.push(frames.slice(prev, end));
        prev = end;
      }
      return out;
    };

    let teacherActive = teacherDSP && teacherDSP.valid ? teacherDSP.activeFrames : [];
    if (
      leadingFillers > 0 &&
      teacherDSP &&
      teacherDSP.valid &&
      teacherDSP.bursts.length > N
    ) {
      const skip = Math.min(leadingFillers, teacherDSP.bursts.length - N);
      const stripped = teacherDSP.bursts.slice(skip).flat();
      if (stripped.length >= N * 2) teacherActive = stripped;
    }

    const teacherSlices = teacherActive.length
      ? sliceFramesByWeights(teacherActive, wordWeights)
      : [];

    const expectedSec =
      teacherActive.length > 0
        ? teacherActive.length * 0.025 * 0.82
        : Math.max(0.35, expectedSyllables * 0.18);

    const coverage = Math.min(
      1,
      Math.max(
        studentDSP.voicedSec / Math.max(0.30, expectedSec),
        studentDSP.syllablePeaks / Math.max(1, expectedSyllables * 0.80)
      )
    );

    const spokenCount =
      coverage < 0.84 ? Math.max(1, Math.min(N - 1, Math.round(N * coverage))) : N;

    const studentSlices = sliceFramesByWeights(
      studentDSP.activeFrames,
      wordWeights.slice(0, spokenCount)
    );

    return targetContentTokens.map((w, idx) => {
      if (idx >= spokenCount) {
        return { score: 0, error_type: 'Omission' };
      }
      const sSlice = studentSlices[idx] || [];
      const tSlice = teacherSlices[idx] || [];
      if (!sSlice.length) return { score: 0, error_type: 'Omission' };

      const dtwScore = tSlice.length
        ? computeSliceDTW(tSlice, sSlice)
        : Math.round(Math.min(100, studentDSP.avgClarity * 115));

      if (dtwScore >= levelProfile.wordApprove) {
        return { score: 100, error_type: 'None' };
      }
      if (dtwScore >= levelProfile.minWordPass) {
        return { score: dtwScore, error_type: 'Mispronunciation' };
      }
      return { score: 0, error_type: 'Mispronunciation' };
    });
  };

  // ============================================================================
  // 5. STATEFUL `resultIndex` SPEECH RECOGNITION & RECORDING LIFECYCLE
  // ============================================================================

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimAlts = null;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
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
          if (res.isFinal) {
            lockedSegmentsRef.current.push({ alternatives: alts });
            activeInterimRef.current = null;
          } else {
            interimAlts = { alternatives: alts };
          }
        }
      }

      if (interimAlts) {
        activeInterimRef.current = interimAlts;
      }
    };

    recognition.onerror = () => {};

    recognition.onend = () => {
      // Commit any in-progress interim speech before restarting so pause cutoffs never lose words
      if (activeInterimRef.current) {
        lockedSegmentsRef.current.push(activeInterimRef.current);
        activeInterimRef.current = null;
      }

      if (isRecordingRef.current) {
        clearTimeout(sttRestartTimerRef.current);
        sttRestartTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              const fresh = setupSpeechRecognition();
              if (fresh) {
                try { fresh.start(); } catch (err) {}
              }
            }
          }
        }, 80);
      } else {
        speechFlushedRef.current = true;
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  useEffect(() => {
    isRecordingRef.current = false;
    clearTimeout(sttRestartTimerRef.current);
    cancelAnimationFrame(animationFrameRef.current);
    stopCurrentAudio();

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
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

    return () => {
      isRecordingRef.current = false;
      clearTimeout(sttRestartTimerRef.current);
      cancelAnimationFrame(animationFrameRef.current);
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
      if (sharedAudioCtxRef.current && sharedAudioCtxRef.current.state !== 'closed') {
        try { sharedAudioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  const startLivePCMBackupLoop = () => {
    if (!analyserRef.current || !sharedAudioCtxRef.current) return;
    const analyser = analyserRef.current;
    const buffer = new Float32Array(analyser.fftSize);
    liveSampleRateRef.current = sharedAudioCtxRef.current.sampleRate || 44100;

    let lastCaptureTime = 0;
    const loop = (now) => {
      if (
        now - lastCaptureTime >= 24 &&
        sharedAudioCtxRef.current &&
        sharedAudioCtxRef.current.state === 'running'
      ) {
        analyser.getFloatTimeDomainData(buffer);
        liveRawSamplesRef.current.push(new Float32Array(buffer));
        lastCaptureTime = now;
      }
      if (isRecordingRef.current) {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

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

  // Step 2: Start Recording
  const startRecording = async () => {
    try {
      stopCurrentAudio();
      clearTimeout(sttRestartTimerRef.current);
      cancelAnimationFrame(animationFrameRef.current);

      audioChunksRef.current = [];
      liveRawSamplesRef.current = [];
      lockedSegmentsRef.current = [];
      activeInterimRef.current = null;
      speechFlushedRef.current = false;
      isRecordingRef.current = true;

      // 1. Acquire microphone at native hardware sample rate
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      activeStreamRef.current = stream;

      // 2. Attach passive AnalyserNode to shared AudioContext
      try {
        const ctx = await getSharedAudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        analyserRef.current = analyser;
        startLivePCMBackupLoop();
      } catch (e) {
        console.warn("Passive analyser skipped:", e);
      }

      // 3. Start MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (studentAudioUrlRef.current) {
          URL.revokeObjectURL(studentAudioUrlRef.current);
        }
        const url = URL.createObjectURL(audioBlob);
        studentAudioUrlRef.current = url;

        stream.getTracks().forEach((track) => track.stop());
        if (activeStreamRef.current === stream) {
          activeStreamRef.current = null;
        }

        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (e) {
              speechFlushedRef.current = true;
            }
          } else {
            speechFlushedRef.current = true;
          }
        }, 550);

        runPlaybackReview(url, audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      recordingStartTimeRef.current = Date.now();
      setPhase('recording');

      // 4. Start SpeechRecognition 150ms after stream stabilizes
      sttRestartTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current) {
          const rec = setupSpeechRecognition();
          if (rec) {
            try { rec.start(); } catch (e) {}
          }
        }
      }, 150);
    } catch (err) {
      console.error("Microphone access denied or audio initialization failed", err);
      isRecordingRef.current = false;
      setPhase('ready_to_record');
    }
  };

  // Step 3: Stop Recording (With 280ms Voice-Tail Buffer)
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    clearTimeout(sttRestartTimerRef.current);
    cancelAnimationFrame(animationFrameRef.current);

    setPhase('playing_review');

    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    }, 280);
  };

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

  // Step 5: Execute Universal Two-Pass Anchored Alignment & Teacher-Anchored DTW Verification
  const executeGrading = async (audioBlob) => {
    let waitTicks = 9;
    while (!speechFlushedRef.current && waitTicks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitTicks--;
    }

    if (activeInterimRef.current) {
      lockedSegmentsRef.current.push(activeInterimRef.current);
      activeInterimRef.current = null;
    }

    const [studentDSP, teacherDSP] = await Promise.all([
      extractAudioDSP(audioBlob, true),
      teacherDSPRef.current
        ? Promise.resolve(teacherDSPRef.current)
        : audioUrl
        ? extractAudioDSP(audioUrl, false)
        : Promise.resolve(null)
    ]);

    if (teacherDSP && teacherDSP.valid && !teacherDSPRef.current) {
      teacherDSPRef.current = teacherDSP;
      cachedTeacherUrlRef.current = audioUrl;
    }

    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current - 280) / 1000);
    const pitchVariance = Math.max(14, studentDSP.pitchVariance || 15);

    const cleanRawTargets = wordsList.map((w) => w.toLowerCase().replace(/[^\w\s]/gi, ''));
    const targetContentIndices = [];
    const targetContentTokens = [];

    let leadingFillers = 0;
    let seenContent = false;

    cleanRawTargets.forEach((tWord, idx) => {
      if (!tWord) return;
      if (SCRIPT_FILLERS.has(tWord)) {
        if (!seenContent) leadingFillers++;
      } else {
        seenContent = true;
        targetContentIndices.push(idx);
        targetContentTokens.push(tWord);
      }
    });

    const totalContentWords = targetContentTokens.length;
    const allSegments = lockedSegmentsRef.current;

    // 1. Run Two-Pass Anchored Alignment across STT alternatives
    let bestSttAlignment = null;

    if (allSegments.length > 0 && totalContentWords > 0) {
      for (let altIdx = 0; altIdx < 3; altIdx++) {
        const candidateObjs = [];
        for (const seg of allSegments) {
          const chosenAlt =
            seg.alternatives[Math.min(altIdx, seg.alternatives.length - 1)] || seg.alternatives[0];
          if (chosenAlt && chosenAlt.transcript) {
            const toks = normalizeSpokenStream(
              chosenAlt.transcript,
              cleanRawTargets,
              chosenAlt.confidence
            );
            candidateObjs.push(...toks);
          }
        }

        if (candidateObjs.length > 0) {
          const alignment = runTwoPassAnchoredAlignment(targetContentTokens, candidateObjs);
          if (!bestSttAlignment || alignment.totalScore > bestSttAlignment.totalScore) {
            bestSttAlignment = alignment;
          }
        }
      }
    }

    // 2. Run Teacher-Anchored DTW Evaluation for fallback/isolated single-char verification
    const dtwEvaluations = evaluateViaTeacherDTW(
      targetContentTokens,
      studentDSP,
      teacherDSP,
      leadingFillers
    );

    const contentSlotFinal = new Array(totalContentWords).fill(null);

    for (let cIdx = 0; cIdx < totalContentWords; cIdx++) {
      const tWord = targetContentTokens[cIdx];
      const dtwRes = dtwEvaluations[cIdx] || { score: 0, error_type: 'Omission' };

      if (bestSttAlignment && bestSttAlignment.slotResults[cIdx]) {
        const sttRes = bestSttAlignment.slotResults[cIdx];

        if (sttRes.error_type === 'Omission') {
          // If Android STT cut off isolated single letters/digits after an intro word, check Teacher DTW bursts
          if (
            tWord.length === 1 &&
            bestSttAlignment.anchorCount <= 2 &&
            dtwRes.error_type !== 'Omission' &&
            dtwRes.score >= levelProfile.minWordPass
          ) {
            contentSlotFinal[cIdx] = dtwRes;
          } else {
            contentSlotFinal[cIdx] = { score: 0, error_type: 'Omission' };
          }
        } else {
          // Trust the Two-Pass Anchored STT Alignment directly (100% Green stays 100% Green; 0% Red stays 0% Red)
          contentSlotFinal[cIdx] = sttRes;
        }
      } else {
        // Only if mobile OS blocked STT completely, use Teacher-Anchored DTW Evaluation
        contentSlotFinal[cIdx] = dtwRes;
      }
    }

    // 3. Assemble Heatmap & Compute CEFR Score
    const localWordLevelData = [];
    let totalWordScore = 0;
    let matchedContentCount = 0;
    let redMismatchCount = 0;

    const contentMap = {};
    targetContentIndices.forEach((origIdx, cIdx) => {
      contentMap[origIdx] = contentSlotFinal[cIdx];
    });

    const hasRealAttempt =
      (studentDSP && studentDSP.valid && studentDSP.voicedSec >= 0.18) ||
      (bestSttAlignment && bestSttAlignment.totalScore > 0);

    wordsList.forEach((rawWord, idx) => {
      const cleanT = cleanRawTargets[idx];
      if (!cleanT || SCRIPT_FILLERS.has(cleanT)) {
        localWordLevelData.push({
          word: rawWord,
          score: hasRealAttempt ? 100 : 0,
          error_type: hasRealAttempt ? 'None' : 'Omission'
        });
      } else {
        const res = hasRealAttempt
          ? contentMap[idx] || { score: 0, error_type: 'Omission' }
          : { score: 0, error_type: 'Omission' };

        totalWordScore += res.score;
        if (res.score >= levelProfile.minWordPass && res.error_type !== 'Omission') {
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

    let localOverallScore = 0;
    let localPassed = false;

    if (hasRealAttempt && totalContentWords > 0 && durationSec >= 0.30) {
      const accuracyScore = totalWordScore / totalContentWords;
      const completenessScore = (matchedContentCount / totalContentWords) * 100;
      const rawProsody = pitchVariance > 12 ? 100 : Math.max(60, pitchVariance * 6.5);
      const prosodyScore = rawProsody * (completenessScore / 100);

      localOverallScore =
        accuracyScore * levelProfile.wAccuracy +
        completenessScore * levelProfile.wCompleteness +
        prosodyScore * levelProfile.wProsody;

      if (redMismatchCount > 0) {
        const penalty = (redMismatchCount / totalContentWords) * 20;
        localOverallScore = Math.max(0, localOverallScore - penalty);
      }

      // Clean 100% Ceiling Guarantee: if all content words are Green, score is 100%
      const allContentGreen = contentSlotFinal.every(
        (item) => item && item.score >= levelProfile.wordApprove && item.error_type === 'None'
      );
      if (allContentGreen) {
        localOverallScore = 100;
      }

      const coverageRatio = matchedContentCount / totalContentWords;
      localPassed =
        localOverallScore >= levelProfile.passScore &&
        coverageRatio >= levelProfile.minCoverageRatio;
    }

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
      setPointsAwarded(hasRealAttempt ? 50 : 0);
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }

    // Sync structured transcript & authoritative results to Supabase Edge Function
    const syncedTokens = [];
    targetContentIndices.forEach((origIdx, cIdx) => {
      const res = contentSlotFinal[cIdx];
      const tWord = targetContentTokens[cIdx];
      if (!res || res.error_type === 'Omission') return;
      if (res.score < levelProfile.minWordPass) {
        syncedTokens.push('wrong_' + cIdx);
      } else if (res.score < levelProfile.wordApprove) {
        syncedTokens.push('?');
      } else {
        syncedTokens.push(tWord);
      }
    });

    try {
      await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: syncedTokens.join(' '),
          cefr_level: cefrLevel,
          duration_sec: durationSec,
          pitch_variance: pitchVariance,
          attempt_number: attempt,
          is_ghost_attempt: !hasRealAttempt,
          client_overall_score: localOverallScore,
          client_word_results: localWordLevelData
        }
      });
    } catch (err) {
      console.warn("Background pronunciation log sync warning:", err);
    }
  };

  // Step 6: Retry or Continue
  const handleTryAgain = () => {
    stopCurrentAudio();
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