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
    editPenalty: 16,
    allowSecondaryMetaphone: true,
    closeLetterScore: 72,
    phoneticWordScore: 74,
    minConfidence: 0.60,
    acousticBoost: 10,
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
    editPenalty: 18,
    allowSecondaryMetaphone: true,
    closeLetterScore: 70,
    phoneticWordScore: 73,
    minConfidence: 0.64,
    acousticBoost: 8,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  B1: {
    passScore: 75,
    wordApprove: 82,
    minWordPass: 62,
    minCoverageRatio: 0.80,
    maxEditShort: 1,
    maxEditLong: 2,
    editPenalty: 20,
    allowSecondaryMetaphone: false,
    closeLetterScore: 66,
    phoneticWordScore: 72,
    minConfidence: 0.68,
    acousticBoost: 4,
    wAccuracy: 0.60,
    wCompleteness: 0.30,
    wProsody: 0.10
  },
  B2: {
    passScore: 80,
    wordApprove: 85,
    minWordPass: 65,
    minCoverageRatio: 0.85,
    maxEditShort: 1,
    maxEditLong: 1,
    editPenalty: 24,
    allowSecondaryMetaphone: false,
    closeLetterScore: 0,
    phoneticWordScore: 70,
    minConfidence: 0.72,
    acousticBoost: 0,
    wAccuracy: 0.65,
    wCompleteness: 0.25,
    wProsody: 0.10
  },
  C1: {
    passScore: 85,
    wordApprove: 88,
    minWordPass: 68,
    minCoverageRatio: 0.90,
    maxEditShort: 0,
    maxEditLong: 1,
    editPenalty: 28,
    allowSecondaryMetaphone: false,
    closeLetterScore: 0,
    phoneticWordScore: 68,
    minConfidence: 0.76,
    acousticBoost: -3,
    wAccuracy: 0.70,
    wCompleteness: 0.15,
    wProsody: 0.15
  },
  C2: {
    passScore: 88,
    wordApprove: 90,
    minWordPass: 70,
    minCoverageRatio: 0.92,
    maxEditShort: 0,
    maxEditLong: 1,
    editPenalty: 32,
    allowSecondaryMetaphone: false,
    closeLetterScore: 0,
    phoneticWordScore: 65,
    minConfidence: 0.80,
    acousticBoost: -5,
    wAccuracy: 0.75,
    wCompleteness: 0.10,
    wProsody: 0.15
  }
};

// Conversational interjections: excluded from scoring denominator
const SCRIPT_FILLERS = new Set([
  'uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh', 'er', 'erm'
]);

// Unstressed grammar/function words that naturally coarticulate in connected speech
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'can', 'you', 'that', 'this', 'i', 'what', 'is', 'are',
  'am', 'was', 'were', 'your', 'my', 'his', 'her', 'our', 'their', 'its', 'mr',
  'mrs', 'ms', 'dr', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from',
  'it', 'he', 'she', 'we', 'they', 'me', 'him', 'us', 'them', 'do', 'does', 'did',
  'have', 'has', 'had', 'will', 'would', 'could', 'should', 'and', 'or', 'but',
  'so', 'if', 'as', 'be'
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

// Close L1 Phonetic Letter Confusions (Awards Yellow 66-72% at A1-B1, never 100%)
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

// Precomputed 512-point Hanning window for Radix-2 FFT spectral analysis
const FFT_SIZE = 512;
const HANNING_WINDOW = new Float32Array(FFT_SIZE);
for (let i = 0; i < FFT_SIZE; i++) {
  HANNING_WINDOW[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)));
}

/**
 * In-place Radix-2 Cooley-Tukey Fast Fourier Transform (FFT)
 */
function computeRadix2FFT(real, imag) {
  const n = real.length;
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      const tr = real[i];
      real[i] = real[j];
      real[j] = tr;
      const ti = imag[i];
      imag[i] = imag[j];
      imag[j] = ti;
    }
    let m = n >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wLenR = Math.cos(angle);
    const wLenI = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wR = 1;
      let wI = 0;
      for (let k = 0; k < halfLen; k++) {
        const evenIdx = i + k;
        const oddIdx = i + k + halfLen;
        const uR = real[evenIdx];
        const uI = imag[evenIdx];
        const vR = real[oddIdx] * wR - imag[oddIdx] * wI;
        const vI = real[oddIdx] * wI + imag[oddIdx] * wR;

        real[evenIdx] = uR + vR;
        imag[evenIdx] = uI + vI;
        real[oddIdx] = uR - vR;
        imag[oddIdx] = uI - vI;

        const nextWR = wR * wLenR - wI * wLenI;
        wI = wR * wLenI + wI * wLenR;
        wR = nextWR;
      }
    }
  }
}

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
  const teacherDSPRef = useRef(null);
  const cachedTeacherUrlRef = useRef('');

  const sharedAudioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const liveRawSamplesRef = useRef([]);
  const liveSampleRateRef = useRef(44100);
  const animationFrameRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeStreamRef = useRef(null);

  const recognitionRef = useRef(null);
  const sttRestartTimerRef = useRef(null);
  const lockedSegmentsRef = useRef([]);
  const activeInterimRef = useRef(null);
  const speechFlushedRef = useRef(false);

  const recordingStartTimeRef = useRef(0);
  const isRecordingRef = useRef(false);

  const wordsList = targetText.trim().split(/\s+/);

  // ============================================================================
  // 1. UNIVERSAL NLP & ORTHOGRAPHIC-TO-PHONETIC FEATURE EXTRACTOR
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
      const fn =
        typeof doubleMetaphone === 'function' ? doubleMetaphone : doubleMetaphone?.default;
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
    if (/^\d+$/.test(clean)) {
      if (clean.length === 1) {
        return clean === '7' || clean === '0' ? 2 : 1;
      }
      return clean.length;
    }
    if (clean.length === 1) {
      return clean === 'w' ? 3 : 1;
    }
    try {
      const fn = typeof syllable === 'function' ? syllable : syllable?.default;
      if (typeof fn === 'function') {
        const count = fn(clean);
        if (count > 0) return count;
      }
    } catch (e) {}
    const stripped = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    const matches = stripped.match(/[aeiouy]{1,2}/g);
    return Math.max(1, matches ? matches.length : 1);
  };

  /**
   * Universal Orthographic-to-Phonetic Feature Model (Works on ANY English word, letter, or digit).
   * Extracts expected syllable count, sibilant/fricative presence, and vowel formant class (F1/F2).
   */
  const getUniversalPhoneticSignature = (rawWord = '') => {
    const clean = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) {
      return {
        clean: '',
        syllables: 1,
        isFunctionWord: true,
        isSingleChar: false,
        expectsSibilant: false,
        expectsFricative: false,
        vowelClass: 'any'
      };
    }

    const numSyllables = countWordSyllables(clean);

    // 1. Single Digit (0-9) Phonetic Signatures
    if (/^\d$/.test(clean)) {
      const digitSignatures = {
        '0': { expectsSibilant: true, expectsFricative: false, vowelClass: 'back_round' }, // zero / oh
        '1': { expectsSibilant: false, expectsFricative: false, vowelClass: 'open_mid' },  // one
        '2': { expectsSibilant: false, expectsFricative: false, vowelClass: 'back_round' }, // two
        '3': { expectsSibilant: false, expectsFricative: true, vowelClass: 'high_front' }, // three
        '4': { expectsSibilant: false, expectsFricative: true, vowelClass: 'back_round' }, // four
        '5': { expectsSibilant: false, expectsFricative: true, vowelClass: 'diphthong_ai' }, // five
        '6': { expectsSibilant: true, expectsFricative: false, vowelClass: 'high_front' }, // six
        '7': { expectsSibilant: true, expectsFricative: true, vowelClass: 'front_mid' },   // seven
        '8': { expectsSibilant: false, expectsFricative: false, vowelClass: 'front_mid' },  // eight
        '9': { expectsSibilant: false, expectsFricative: false, vowelClass: 'diphthong_ai' } // nine
      };
      const sig = digitSignatures[clean];
      return {
        clean,
        syllables: numSyllables,
        isFunctionWord: false,
        isSingleChar: true,
        expectsSibilant: sig.expectsSibilant,
        expectsFricative: sig.expectsFricative,
        vowelClass: sig.vowelClass
      };
    }

    // 2. Single Spelled Letter (a-z) Phonetic Signatures
    if (clean.length === 1 && /[a-z]/.test(clean)) {
      const sibilantLetters = new Set(['c', 's', 'x', 'z']);
      const fricativeLetters = new Set(['f', 'h', 'j', 'v']);
      const highFrontLetters = new Set(['b', 'c', 'd', 'e', 'g', 'p', 't', 'v', 'z']);
      const frontMidLetters = new Set(['a', 'f', 'h', 'j', 'k', 'l', 'm', 'n', 's', 'x']);
      const diphthongAiLetters = new Set(['i', 'y']);
      const backRoundLetters = new Set(['o', 'q', 'u', 'w']);

      let vowelClass = 'open_mid'; // 'r' (/ɑr/)
      if (highFrontLetters.has(clean)) vowelClass = 'high_front';
      else if (frontMidLetters.has(clean)) vowelClass = 'front_mid';
      else if (diphthongAiLetters.has(clean)) vowelClass = 'diphthong_ai';
      else if (backRoundLetters.has(clean)) vowelClass = 'back_round';

      return {
        clean,
        syllables: numSyllables,
        isFunctionWord: false,
        isSingleChar: true,
        expectsSibilant: sibilantLetters.has(clean),
        expectsFricative: fricativeLetters.has(clean),
        vowelClass
      };
    }

    // 3. Universal Multi-Character English Word Orthographic-Phonetic Rules
    const isFunctionWord = FUNCTION_WORDS.has(clean);
    const expectsSibilant = /s|z|sh|ch|x|ce|ci|cy|tion|sion/.test(clean);
    const expectsFricative = /f|v|th|ph|j|ge|gi/.test(clean);

    // Deduce dominant vowel formant class from universal English orthographic vowel patterns
    let vowelClass = 'mixed';
    const hasHighFrontPattern =
      /ee|ea|ie|ey|e[^aeiou]+e$|^be$|^he$|^me$|^we$|^she$|^see$|^hi$|y$/.test(clean);
    const hasBackRoundPattern =
      /oo|ou|ow|oa|or|au|aw|o[^aeiou]+e$|^no$|^go$|^so$|^do$|^to$|^you$|^who$|^two$/.test(clean);
    const hasDiphthongAiPattern =
      /igh|i[^aeiou]+e$|^i$|^my$|^by$|^hi$|^why$|^try$/.test(clean);

    if (hasHighFrontPattern && !hasBackRoundPattern) {
      vowelClass = 'high_front';
    } else if (hasBackRoundPattern && !hasHighFrontPattern) {
      vowelClass = 'back_round';
    } else if (hasDiphthongAiPattern) {
      vowelClass = 'diphthong_ai';
    } else if (/^[bcdfghjklmnpqrstvwxyz]*[e][bcdfghjklmnpqrstvwxyz]+$/.test(clean)) {
      vowelClass = 'front_mid'; // Closed short /ɛ/ words (e.g. "spell", "tell", "bed", "ten")
    } else if (/^[bcdfghjklmnpqrstvwxyz]*[a][bcdfghjklmnpqrstvwxyz]+$/.test(clean)) {
      vowelClass = 'open_mid'; // Closed short /æ, ɑ/ words (e.g. "can", "that", "cat")
    }

    return {
      clean,
      syllables: numSyllables,
      isFunctionWord,
      isSingleChar: false,
      expectsSibilant,
      expectsFricative,
      vowelClass
    };
  };

  // ============================================================================
  // 2. TRUE 512-POINT RADIX-2 FFT & FORMANT (F1/F2) DSP ANALYZER
  // ============================================================================

  /**
   * Runs a 512-point Radix-2 FFT on every 20ms frame to extract:
   * - 8 True Hz Frequency Bands (120Hz to 8500Hz)
   * - Exact F1 Formant Frequency (220 - 950 Hz) and F2 Formant Frequency (950 - 2900 Hz)
   * - High-Frequency Sibilant Ratio (3300 - 8500 Hz)
   * - Strict `Math.max` Noise-Floor VAD & Discrete Syllable Unit Segmentation
   */
  const analyzePCMBufferWithFFT = (channelData, sampleRate) => {
    const empty = {
      valid: false,
      voicedSec: 0,
      burstCount: 0,
      syllableUnits: [],
      pitchVariance: 0,
      avgClarity: 0,
      isMonotoneGibberish: false,
      activeFrames: []
    };

    if (!channelData || channelData.length < FFT_SIZE * 2) return empty;

    const hopSize = Math.max(256, Math.floor(sampleRate * 0.020)); // 20ms hop
    const binHz = sampleRate / FFT_SIZE;
    const halfBins = FFT_SIZE >> 1;

    const pitchSize = 1024;
    const detector =
      channelData.length >= pitchSize ? PitchDetector.forFloat32Array(pitchSize) : null;

    // 8 True Phonetic Frequency Bands in Hz:
    // Band 0: 120 - 400 Hz   (Low F1: High/Close Vowels /i, I, u, U/ & Voicing)
    // Band 1: 400 - 650 Hz   (Mid F1: Mid Vowels /e, E, o, O/)
    // Band 2: 650 - 1050 Hz  (High F1: Open Vowels /ae, a, A/ & Low Back F2 /o, u/)
    // Band 3: 1050 - 1650 Hz (Central F2: /a, A, @, r/)
    // Band 4: 1650 - 2300 Hz (Front-Mid F2: /E, ae, ey/)
    // Band 5: 2300 - 3300 Hz (High-Front F2/F3: /i, I, y/)
    // Band 6: 3300 - 4800 Hz (Palatal Sibilants & Fricatives /sh, ch, f, th/)
    // Band 7: 4800 - 8500 Hz (Alveolar Sibilants /s, z/)
    const bandEdgesHz = [120, 400, 650, 1050, 1650, 2300, 3300, 4800, 8500];

    const real = new Float32Array(FFT_SIZE);
    const imag = new Float32Array(FFT_SIZE);
    const rawFrames = [];

    for (let offset = 0; offset + FFT_SIZE <= channelData.length; offset += hopSize) {
      let sumSq = 0;
      let zeroCrossings = 0;
      let prev = channelData[offset];

      for (let i = 0; i < FFT_SIZE; i++) {
        const s = channelData[offset + i];
        sumSq += s * s;
        if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) zeroCrossings++;
        prev = s;

        // Pre-emphasis (0.95) for FFT spectral flattening + Hanning window
        const pre = i === 0 ? s : s - 0.95 * channelData[offset + i - 1];
        real[i] = pre * HANNING_WINDOW[i];
        imag[i] = 0;
      }

      const rms = Math.sqrt(sumSq / FFT_SIZE);
      const zcr = zeroCrossings / FFT_SIZE;

      computeRadix2FFT(real, imag);

      const bandEnergy = new Float32Array(8);
      let f1PeakHz = 500;
      let f1MaxMag = -1;
      let f2PeakHz = 1500;
      let f2MaxMag = -1;

      for (let b = 1; b < halfBins; b++) {
        const freq = b * binHz;
        if (freq < 120 || freq > 8500) continue;

        const magSq = real[b] * real[b] + imag[b] * imag[b];

        // Locate F1 Formant Peak (220 - 920 Hz)
        if (freq >= 220 && freq <= 920 && magSq > f1MaxMag) {
          f1MaxMag = magSq;
          f1PeakHz = freq;
        }
        // Locate F2 Formant Peak (950 - 2900 Hz)
        if (freq > 950 && freq <= 2900 && magSq > f2MaxMag) {
          f2MaxMag = magSq;
          f2PeakHz = freq;
        }

        for (let k = 0; k < 8; k++) {
          if (freq >= bandEdgesHz[k] && freq < bandEdgesHz[k + 1]) {
            bandEnergy[k] += magSq;
            break;
          }
        }
      }

      let totalSpec = 1e-9;
      for (let k = 0; k < 8; k++) totalSpec += bandEnergy[k];

      const bands = new Array(8);
      for (let k = 0; k < 8; k++) {
        bands[k] = bandEnergy[k] / totalSpec;
      }

      const sibilantRatio = bands[6] * 0.45 + bands[7];
      const highFrontRatio = bands[0] * 0.35 + bands[4] * 0.35 + bands[5] * 0.65;
      const backRoundRatio = bands[0] * 0.35 + bands[1] * 0.45 + bands[2] * 0.35;
      const openMidRatio = bands[2] * 0.55 + bands[3] * 0.45;
      const vowelEnergy = rms * (bands[0] + bands[1] + bands[2] + bands[3] + bands[4] + bands[5]);

      let pitch = 0;
      let clarity = 0;
      if (detector && offset + pitchSize <= channelData.length && rms > 0.008) {
        const slice = channelData.subarray(offset, offset + pitchSize);
        const [p, c] = detector.findPitch(slice, sampleRate);
        if (p >= 55 && p <= 550 && c >= 0.52) {
          pitch = p;
          clarity = c;
        }
      }

      rawFrames.push({
        rms,
        zcr,
        bands,
        f1Hz: f1PeakHz,
        f2Hz: f2PeakHz,
        sibilantRatio,
        highFrontRatio,
        backRoundRatio,
        openMidRatio,
        vowelEnergy,
        pitch,
        clarity
      });
    }

    if (rawFrames.length < 4) return empty;

    // FIXED STRICT NOISE-FLOOR GATE: Uses Math.max so ambient noise/silence NEVER triggers voice activity!
    const sortedRms = rawFrames.map((f) => f.rms).sort((a, b) => a - b);
    const noiseFloor = sortedRms[Math.floor(sortedRms.length * 0.20)] || 0.001;
    const peakRms = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.01;

    if (peakRms < 0.012 || peakRms / Math.max(0.0005, noiseFloor) < 2.5) {
      return empty;
    }

    const coreVoiceThreshold = Math.max(
      0.012,
      noiseFloor * 3.8,
      peakRms * 0.20
    );

    rawFrames.forEach((f) => {
      f.normEnergy = Math.min(1, f.rms / Math.max(0.01, peakRms));
      f.coreVoiced = f.rms >= coreVoiceThreshold;
    });

    // Include true sibilant onsets/codas ONLY immediately adjacent (1 frame = 20ms) to a core voiced syllable
    let activeCount = 0;
    const bursts = [];
    let curBurst = [];
    let silenceRun = 0;

    for (let i = 0; i < rawFrames.length; i++) {
      const f = rawFrames[i];
      const adjacentVoiced =
        f.coreVoiced ||
        (i > 0 && rawFrames[i - 1].coreVoiced) ||
        (i + 1 < rawFrames.length && rawFrames[i + 1].coreVoiced);

      const isTrueSibilantEdge =
        adjacentVoiced &&
        f.rms >= coreVoiceThreshold * 0.55 &&
        (f.sibilantRatio >= 0.30 || f.zcr >= 0.18);

      f.active = f.coreVoiced || isTrueSibilantEdge;

      if (f.active) {
        activeCount++;
        silenceRun = 0;
        curBurst.push(f);
      } else {
        silenceRun++;
        // A silence gap >= 3 frames (60ms) closes the current speech burst
        if (silenceRun >= 3 && curBurst.length >= 3) {
          bursts.push(curBurst);
          curBurst = [];
        } else if (silenceRun >= 3) {
          curBurst = [];
        }
      }
    }
    if (curBurst.length >= 3) {
      bursts.push(curBurst);
    }

    if (activeCount < 4 || bursts.length === 0) return empty;

    // Segment each contiguous speech burst into discrete Syllable Units at vowel-energy valleys
    const syllableUnits = [];
    for (const burst of bursts) {
      if (burst.length < 10) {
        syllableUnits.push(burst);
        continue;
      }

      const smoothed = burst.map((_, idx) => {
        const p = burst[Math.max(0, idx - 1)].vowelEnergy;
        const c = burst[idx].vowelEnergy;
        const n = burst[Math.min(burst.length - 1, idx + 1)].vowelEnergy;
        return (p + c * 2 + n) / 4;
      });

      const peakIndices = [];
      const maxVowel = Math.max(...smoothed, 1e-6);

      for (let i = 1; i < smoothed.length - 1; i++) {
        if (
          smoothed[i] >= maxVowel * 0.28 &&
          smoothed[i] >= smoothed[i - 1] &&
          smoothed[i] >= smoothed[i + 1]
        ) {
          if (peakIndices.length === 0 || i - peakIndices[peakIndices.length - 1] >= 6) {
            peakIndices.push(i);
          } else if (smoothed[i] > smoothed[peakIndices[peakIndices.length - 1]]) {
            peakIndices[peakIndices.length - 1] = i;
          }
        }
      }

      if (peakIndices.length <= 1) {
        syllableUnits.push(burst);
      } else {
        const splitPoints = [0];
        for (let p = 0; p < peakIndices.length - 1; p++) {
          const leftPk = peakIndices[p];
          const rightPk = peakIndices[p + 1];
          let minVal = Infinity;
          let minIdx = Math.floor((leftPk + rightPk) / 2);

          for (let k = leftPk + 1; k < rightPk; k++) {
            if (smoothed[k] < minVal) {
              minVal = smoothed[k];
              minIdx = k;
            }
          }

          const smallerPeak = Math.min(smoothed[leftPk], smoothed[rightPk]);
          if (minVal <= smallerPeak * 0.72 && minIdx - splitPoints[splitPoints.length - 1] >= 4) {
            splitPoints.push(minIdx);
          }
        }
        splitPoints.push(burst.length);

        for (let s = 0; s < splitPoints.length - 1; s++) {
          const unit = burst.slice(splitPoints[s], splitPoints[s + 1]);
          if (unit.length >= 3) syllableUnits.push(unit);
        }
      }
    }

    const finalUnits = syllableUnits.length > 0 ? syllableUnits : bursts;

    // Anti-Gibberish / Monotone Repetition Detector (Catches "Blah blah bla", "La la la", "Da da da")
    // Computes the average formant vector (F1, F2, sibilantRatio, Band 0..5) of each syllable unit.
    // If the student spoke >= 2 syllable units and their spectral vectors are nearly identical across all units,
    // flag `isMonotoneGibberish = true`!
    let isMonotoneGibberish = false;
    if (finalUnits.length >= 2) {
      const unitSummaries = finalUnits.map((u) => {
        const avgBands = new Array(8).fill(0);
        let sumF1 = 0;
        let sumF2 = 0;
        let maxSib = 0;
        u.forEach((f) => {
          sumF1 += f.f1Hz;
          sumF2 += f.f2Hz;
          if (f.sibilantRatio > maxSib) maxSib = f.sibilantRatio;
          for (let k = 0; k < 8; k++) avgBands[k] += f.bands[k];
        });
        for (let k = 0; k < 8; k++) avgBands[k] /= u.length;
        return {
          f1: sumF1 / u.length,
          f2: sumF2 / u.length,
          maxSib,
          avgBands
        };
      });

      let pairCount = 0;
      let totalBandDivergence = 0;
      let maxF2Spread = 0;

      for (let i = 0; i < unitSummaries.length; i++) {
        for (let j = i + 1; j < unitSummaries.length; j++) {
          pairCount++;
          const uA = unitSummaries[i];
          const uB = unitSummaries[j];
          const f2Diff = Math.abs(uA.f2 - uB.f2);
          if (f2Diff > maxF2Spread) maxF2Spread = f2Diff;

          let l1Dist = 0;
          for (let k = 0; k < 8; k++) {
            l1Dist += Math.abs(uA.avgBands[k] - uB.avgBands[k]);
          }
          totalBandDivergence += l1Dist;
        }
      }

      const avgPairDivergence = pairCount > 0 ? totalBandDivergence / pairCount : 1;
      const anyUnitHasSibilant = unitSummaries.some((u) => u.maxSib >= 0.22);

      // In repetitive gibberish ("blah blah bla"), average L1 spectral divergence between syllables is < 0.22
      // and F2 spread is tiny (< 240 Hz) with no sibilant articulation
      if (avgPairDivergence < 0.22 && maxF2Spread < 240 && !anyUnitHasSibilant) {
        isMonotoneGibberish = true;
      }
    }

    const activeFrames = bursts.flat();
    const validPitches = activeFrames.filter((f) => f.clarity >= 0.55 && f.pitch > 0);
    let pitchVariance = 0;
    if (validPitches.length > 1) {
      const meanP = validPitches.reduce((s, f) => s + f.pitch, 0) / validPitches.length;
      const varP =
        validPitches.reduce((s, f) => s + Math.pow(f.pitch - meanP, 2), 0) /
        validPitches.length;
      pitchVariance = Math.sqrt(varP);
    } else if (activeCount >= 5) {
      pitchVariance = 14;
    }

    const avgClarity =
      validPitches.length > 0
        ? validPitches.reduce((s, f) => s + f.clarity, 0) / validPitches.length
        : 0.65;

    return {
      valid: true,
      voicedSec: activeCount * 0.020,
      burstCount: bursts.length,
      syllableUnits: finalUnits,
      pitchVariance,
      avgClarity,
      isMonotoneGibberish,
      activeFrames
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
          const decoded = analyzePCMBufferWithFFT(
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
      return analyzePCMBufferWithFFT(merged, liveSampleRateRef.current || 44100);
    }

    return analyzePCMBufferWithFFT(null, 44100);
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

  // ============================================================================
  // 3. 8-BAND FFT + FORMANT (F1/F2) WORD VERIFIER & NON-STRETCHING DP ALIGNER
  // ============================================================================

  /**
   * Computes 8-Band FFT + Formant (F1/F2) + Sibilant DTW Distance between Teacher & Student word slices
   */
  const computeFFTWordSliceDTW = (teacherFrames = [], studentFrames = []) => {
    if (!teacherFrames.length || !studentFrames.length) return null;

    const N = teacherFrames.length;
    const M = studentFrames.length;
    const dtw = Array.from({ length: N + 1 }, () => Array(M + 1).fill(Infinity));
    dtw[0][0] = 0;

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const tf = teacherFrames[i - 1];
        const sf = studentFrames[j - 1];

        // L1 distance across the 8 true FFT frequency bands
        let bandL1 = 0;
        for (let k = 0; k < 8; k++) {
          bandL1 += Math.abs(tf.bands[k] - sf.bands[k]);
        }

        // Normalized F1 and F2 Formant distance in Hz
        const f1Dist = Math.abs(tf.f1Hz - sf.f1Hz) / 700;
        const f2Dist = Math.abs(tf.f2Hz - sf.f2Hz) / 1800;
        const sibDist = Math.abs(tf.sibilantRatio - sf.sibilantRatio) * 1.6;

        const frameCost = bandL1 * 0.45 + f1Dist * 0.25 + f2Dist * 0.35 + sibDist;
        dtw[i][j] = frameCost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      }
    }

    return dtw[N][M] / (N + M);
  };

  /**
   * Evaluates a group of Student Syllable Units against a Target Word's Universal Phonetic Signature
   * AND the Teacher's FFT Reference Slice.
   */
  const evaluateUnitsAgainstWordSignature = (
    targetWord,
    teacherSlice,
    studentUnitGroup,
    unitCount
  ) => {
    const studentFrames = studentUnitGroup.flat();
    if (!studentFrames.length) return { score: 0, error_type: 'Omission' };

    const sig = getUniversalPhoneticSignature(targetWord);

    // Extract Student Slice Phonetic Features from the 512-FFT frames
    const maxSib = Math.max(...studentFrames.map((f) => f.sibilantRatio));
    const maxFricBand = Math.max(...studentFrames.map((f) => f.bands[6] + f.bands[7]));
    const maxZcr = Math.max(...studentFrames.map((f) => f.zcr));

    const avgF1 = studentFrames.reduce((s, f) => s + f.f1Hz, 0) / studentFrames.length;
    const avgF2 = studentFrames.reduce((s, f) => s + f.f2Hz, 0) / studentFrames.length;
    const maxF2 = Math.max(...studentFrames.map((f) => f.f2Hz));
    const minF1 = Math.min(...studentFrames.map((f) => f.f1Hz));

    const avgHighFront =
      studentFrames.reduce((s, f) => s + f.highFrontRatio, 0) / studentFrames.length;
    const avgBackRound =
      studentFrames.reduce((s, f) => s + f.backRoundRatio, 0) / studentFrames.length;
    const avgOpenMid =
      studentFrames.reduce((s, f) => s + f.openMidRatio, 0) / studentFrames.length;

    // 1. Base Score from Teacher 8-Band FFT + Formant DTW (if Teacher Audio loaded)
    let baseScore = 86;
    const dtwDist =
      teacherSlice && teacherSlice.length >= 2
        ? computeFFTWordSliceDTW(teacherSlice, studentFrames)
        : null;

    if (dtwDist !== null) {
      // Typical clean match: dtwDist in [0.15 .. 0.34] -> 85..100
      // Slightly off: dtwDist in (0.34 .. 0.46] -> 62..79 (Yellow)
      // Mismatch ("Blah", wrong word): dtwDist > 0.46 -> < 55 (Red)
      baseScore = Math.round(122 - dtwDist * 145);
    }

    let penalty = 0;

    // 2. UNIVERSAL SIBILANT GATE (/s, z, sh, ch, x, soft c/)
    // Catches saying "blah" or "repeat" for "spell", or "blah" / "telephone" for "passport" / "please" / "six" / "seven" / "0"
    const teacherPeakSib =
      teacherSlice && teacherSlice.length > 0
        ? Math.max(...teacherSlice.map((f) => f.sibilantRatio))
        : sig.expectsSibilant
        ? 0.32
        : 0.08;

    if (sig.expectsSibilant) {
      const requiredSib = Math.min(0.18, Math.max(0.11, teacherPeakSib * 0.48));
      if (maxSib < requiredSib && maxZcr < 0.14) {
        // Target word/letter/digit requires a sibilant, but student's audio had NONE!
        penalty += 45;
      }
    } else if (!sig.expectsSibilant && !sig.expectsFricative && !sig.isFunctionWord) {
      // Target word has NO sibilant/fricative, but student spoke a strong sibilant word
      if (maxSib > 0.38 && maxZcr > 0.22 && teacherPeakSib < 0.16) {
        penalty += 35;
      }
    }

    // 3. UNIVERSAL VOWEL FORMANT (F1/F2) GATE
    // Catches saying "blah" (/ɑ/: high F1 ~750Hz, low-mid F2 ~1200Hz) for "please", "see", "three", "six", "E", "I", "V", "good", "morning", etc.
    if (!sig.isFunctionWord) {
      if (sig.vowelClass === 'high_front') {
        // Requires high F2 (>= 1750 Hz) or strong high-front band ratio, and low-to-mid F1
        const hasHighFront =
          maxF2 >= 1750 || avgF2 >= 1580 || (avgHighFront >= 0.26 && minF1 <= 520);
        if (!hasHighFront) {
          penalty += 40;
        } else if (avgOpenMid > avgHighFront * 1.45 && avgF1 > 640) {
          // Open /ɑ/ vowel ("blah") spoken instead of high-front /i/
          penalty += 36;
        }
      } else if (sig.vowelClass === 'back_round') {
        // Requires back-rounded resonance (low F2 <= 1450 Hz and strong Band 0/1/2)
        const hasBackRound = avgF2 <= 1550 && avgBackRound >= 0.24;
        if (!hasBackRound && avgF2 > 1850) {
          penalty += 35;
        } else if (avgF1 > 680 && avgOpenMid > avgBackRound * 1.35) {
          // Open unrounded /ɑ/ ("blah") spoken instead of rounded /o, u, ʊ, ɔ/ ("good", "two", "four", "O")
          penalty += 34;
        }
      } else if (sig.vowelClass === 'diphthong_ai') {
        // Diphthong /aɪ/ ("Hi", "five", "nine", "I", "Y") glides from open F1 to high F2 (>= 1650 Hz)
        const f2Range =
          Math.max(...studentFrames.map((f) => f.f2Hz)) -
          Math.min(...studentFrames.map((f) => f.f2Hz));
        if (maxF2 < 1620 && f2Range < 220) {
          // Flat monophthong ("blah") spoken instead of diphthong /aɪ/
          penalty += 36;
        }
      } else if (sig.vowelClass === 'front_mid') {
        // Front-mid /eɪ, ɛ/ ("spell", "seven", "eight", "A", "S", "N", "M")
        if (avgF1 > 700 && maxF2 < 1550) {
          penalty += 32;
        } else if (minF1 < 330 && avgF2 > 2200 && sig.syllables === 1) {
          // Tense /i/ ("repeat") spoken instead of /ɛ/ ("spell")
          penalty += 30;
        }
      }
    }

    // 4. SYLLABLE COUNT & DURATION CONSISTENCY GATE
    const sylDiff = Math.abs(unitCount - sig.syllables);
    if (!sig.isFunctionWord) {
      if (sylDiff >= 2) {
        penalty += 35;
      } else if (sylDiff === 1 && sig.syllables >= 2 && unitCount === 1) {
        // Student said a 1-syllable sound ("blah") for a 2-or-3-syllable word ("morning", "passport", "Rivera")
        const minFramesForMultiSyl = sig.syllables * 7; // at least ~140ms per syllable
        if (studentFrames.length < minFramesForMultiSyl) {
          penalty += 34;
        } else {
          penalty += 18;
        }
      } else if (sylDiff === 1 && sig.syllables === 1 && unitCount >= 2) {
        // Student said a 2-syllable word ("repeat") for a 1-syllable word ("spell")
        penalty += 26;
      }
    }

    if (teacherSlice && teacherSlice.length >= 4 && !sig.isFunctionWord) {
      const durRatio = studentFrames.length / teacherSlice.length;
      if (durRatio < 0.38 || durRatio > 2.15) {
        penalty += 28;
      }
    }

    const rawScore = Math.max(
      0,
      Math.min(100, baseScore + (penalty === 0 ? levelProfile.acousticBoost : 0) - penalty)
    );

    if (rawScore < levelProfile.minWordPass) {
      return { score: 0, error_type: 'Mispronunciation' };
    }
    if (rawScore < levelProfile.wordApprove) {
      return { score: rawScore, error_type: 'Mispronunciation' };
    }
    return { score: 100, error_type: 'None' };
  };

  /**
   * Non-Stretching Elastic Syllable-to-Word Alignment:
   * Aligns the Student's detected `syllableUnits` against the Target Words without stretching.
   * - If the student's recording is flagged as repetitive gibberish ("Blah blah bla"), rejects all words!
   * - If the student skipped words, unspoken target words receive 0 units -> `Omission` (Grey Strikethrough).
   * - Function words only pass if at least half of the lexical content words in the sentence pass!
   */
  const alignAudioUnitsToTargetWords = (
    allCleanTargets,
    targetContentIndices,
    targetContentTokens,
    studentDSP,
    teacherDSP
  ) => {
    const N = targetContentTokens.length;
    if (!studentDSP || !studentDSP.valid || studentDSP.voicedSec < 0.18 || N === 0) {
      return targetContentTokens.map(() => ({ score: 0, error_type: 'Omission' }));
    }

    // 1. Slice Teacher Audio across ALL target tokens (including fillers so filler audio never shifts content slices)
    const allTokenWeights = allCleanTargets.map((w) => {
      if (!w) return 0.1;
      if (SCRIPT_FILLERS.has(w)) return 0.75;
      return Math.max(0.85, countWordSyllables(w) * 0.95 + (w.length === 1 ? 0 : w.length * 0.04));
    });
    const totalAllWeight = allTokenWeights.reduce((a, b) => a + b, 0);

    const teacherContentSlices = new Array(N).fill(null);
    if (teacherDSP && teacherDSP.valid && teacherDSP.activeFrames.length >= N * 2) {
      const tFrames = teacherDSP.activeFrames;
      const allSlices = [];
      let prev = 0;
      let acc = 0;
      for (let i = 0; i < allCleanTargets.length; i++) {
        acc += allTokenWeights[i];
        const end =
          i === allCleanTargets.length - 1
            ? tFrames.length
            : Math.max(
                prev + 1,
                Math.min(tFrames.length - 1, Math.round((acc / totalAllWeight) * tFrames.length))
              );
        allSlices.push(tFrames.slice(prev, end));
        prev = end;
      }
      targetContentIndices.forEach((origIdx, cIdx) => {
        teacherContentSlices[cIdx] = allSlices[origIdx] || null;
      });
    }

    // 2. Extract Student Syllable Units (strip leading filler bursts if prompt starts with "Uh..." / "Hmm.")
    let studentUnits = studentDSP.syllableUnits || [];
    const totalExpectedContentSyllables = targetContentTokens.reduce(
      (s, w) => s + countWordSyllables(w),
      0
    );
    const fillerCountInPrompt = allCleanTargets.filter((w) => w && SCRIPT_FILLERS.has(w)).length;

    if (fillerCountInPrompt > 0 && studentUnits.length > totalExpectedContentSyllables) {
      const extraFillerUnits = Math.min(
        fillerCountInPrompt,
        studentUnits.length - totalExpectedContentSyllables
      );
      if (SCRIPT_FILLERS.has(allCleanTargets[0])) {
        studentUnits = studentUnits.slice(extraFillerUnits);
      }
    }

    const M = studentUnits.length;
    if (M === 0) {
      return targetContentTokens.map(() => ({ score: 0, error_type: 'Omission' }));
    }

    // 3. HARD ANTI-GIBBERISH GATE ("Blah blah bla", "La la la", "Da da da"):
    // If the sentence has >= 2 distinct vowel/sibilant classes, and the student spoke monotone repetitive syllables,
    // mark the spoken slots as Red (Mispronunciation, 0%) and any remaining slots as Omission!
    const distinctTargetClasses = new Set(
      targetContentTokens.map((w) => {
        const s = getUniversalPhoneticSignature(w);
        return `${s.vowelClass}_${s.expectsSibilant}`;
      })
    );
    if (studentDSP.isMonotoneGibberish && distinctTargetClasses.size >= 2) {
      return targetContentTokens.map((_, idx) => ({
        score: 0,
        error_type: idx < M ? 'Mispronunciation' : 'Omission'
      }));
    }

    // 4. Non-Stretching Dynamic Programming Alignment (Target Words 0..N-1 vs Student Syllable Units 0..M-1)
    const OMISSION_PENALTY = -14;
    const UNUSED_UNIT_PENALTY = -10;

    const dp = Array.from({ length: N + 1 }, () => Array(M + 1).fill(-Infinity));
    const back = Array.from({ length: N + 1 }, () => Array(M + 1).fill(null));
    dp[0][0] = 0;

    for (let i = 1; i <= N; i++) {
      dp[i][0] = dp[i - 1][0] + OMISSION_PENALTY;
      back[i][0] = { type: 'OMIT', prevI: i - 1, prevU: 0 };
    }
    for (let u = 1; u <= M; u++) {
      dp[0][u] = dp[0][u - 1] + UNUSED_UNIT_PENALTY;
      back[0][u] = { type: 'SKIP_UNIT', prevI: 0, prevU: u - 1 };
    }

    for (let i = 1; i <= N; i++) {
      const tWord = targetContentTokens[i - 1];
      const tSlice = teacherContentSlices[i - 1];
      const expectedSyl = countWordSyllables(tWord);
      const maxUnitsToConsume = Math.min(M, Math.max(2, expectedSyl + 1));

      for (let u = 1; u <= M; u++) {
        // Option A: Target word `i - 1` was OMITTED (consumes 0 student units)
        let bestVal = dp[i - 1][u] + OMISSION_PENALTY;
        let bestMove = { type: 'OMIT', prevI: i - 1, prevU: u };

        // Option B: Skip an extra student unit
        if (dp[i][u - 1] + UNUSED_UNIT_PENALTY > bestVal) {
          bestVal = dp[i][u - 1] + UNUSED_UNIT_PENALTY;
          bestMove = { type: 'SKIP_UNIT', prevI: i, prevU: u - 1 };
        }

        // Option C: Target word `i - 1` consumes `c` contiguous student syllable units
        for (let c = 1; c <= Math.min(u, maxUnitsToConsume); c++) {
          const prevScore = dp[i - 1][u - c];
          if (prevScore === -Infinity) continue;

          const unitGroup = studentUnits.slice(u - c, u);
          const evalRes = evaluateUnitsAgainstWordSignature(
            tWord,
            tSlice,
            unitGroup,
            c
          );

          const sylBonus =
            c === expectedSyl ? 10 : Math.abs(c - expectedSyl) === 1 ? 0 : -14;
          const stepWeight = evalRes.score > 0 ? evalRes.score + sylBonus : -5;

          const candidateVal = prevScore + stepWeight;
          if (candidateVal > bestVal) {
            bestVal = candidateVal;
            bestMove = {
              type: 'MATCH',
              prevI: i - 1,
              prevU: u - c,
              evalRes
            };
          }
        }

        dp[i][u] = bestVal;
        back[i][u] = bestMove;
      }
    }

    const results = new Array(N).fill(null).map(() => ({
      score: 0,
      error_type: 'Omission'
    }));

    let ci = N;
    let cu = M;
    while (ci > 0 || cu > 0) {
      const move = back[ci][cu];
      if (!move) break;
      if (move.type === 'MATCH') {
        results[ci - 1] = move.evalRes;
      } else if (move.type === 'OMIT') {
        results[ci - 1] = { score: 0, error_type: 'Omission' };
      }
      ci = move.prevI;
      cu = move.prevU;
    }

    // 5. Function-Word Coarticulation Guard:
    // If ALL lexical (non-function) words in the sentence failed (0%), do NOT let function words pass on their own!
    const lexicalIndices = [];
    targetContentTokens.forEach((w, idx) => {
      if (!FUNCTION_WORDS.has(w)) lexicalIndices.push(idx);
    });

    if (lexicalIndices.length > 0) {
      const passedLexical = lexicalIndices.filter(
        (idx) => results[idx] && results[idx].score >= levelProfile.minWordPass
      ).length;
      if (passedLexical === 0) {
        for (let idx = 0; idx < N; idx++) {
          if (results[idx].error_type !== 'Omission') {
            results[idx] = { score: 0, error_type: 'Mispronunciation' };
          }
        }
      }
    }

    return results;
  };

  // ============================================================================
  // 4. UNIVERSAL TOKEN NORMALIZER & TWO-PASS ANCHORED STT ALIGNMENT
  // ============================================================================

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

  const normalizeSpokenStream = (rawString, cleanTargets, defaultConfidence = 0.88) => {
    if (!rawString || !rawString.trim()) return [];

    const hasDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));
    const hasSingleLetters = cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

    let text = rawString.toLowerCase();
    text = text.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

    const rawWords = text.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(Boolean);
    const structurallyAligned = [];

    let k = 0;
    while (k < rawWords.length) {
      const w = rawWords[k];
      const nextW = k + 1 < rawWords.length ? rawWords[k + 1] : '';

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

    const numberNormalized = convertSpokenNumbersInTokens(
      structurallyAligned,
      hasDigits,
      hasSingleDigits
    );

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

  const scoreTokenPairUniversal = (tWord, sObj) => {
    if (!sObj || !sObj.token) return { score: 0, matchType: 'None' };

    const sWord = sObj.token;
    const conf = typeof sObj.confidence === 'number' ? sObj.confidence : 0.88;
    const isLowConfidence = conf < levelProfile.minConfidence;

    if (/^\d+$/.test(tWord)) {
      if (tWord === sWord) {
        if (sObj.approx) {
          return { score: levelProfile.closeLetterScore || 72, matchType: 'Close' };
        }
        return {
          score: isLowConfidence ? 76 : 100,
          matchType: isLowConfidence ? 'Close' : 'Exact'
        };
      }
      return { score: 0, matchType: 'None' };
    }

    if (tWord.length === 1 && /[a-z]/.test(tWord)) {
      const mapped = ALPHABET_PHONETICS[sWord] || sWord;
      if (tWord === mapped) {
        return {
          score: isLowConfidence ? 76 : 100,
          matchType: isLowConfidence ? 'Close' : 'Exact'
        };
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

    if (
      tWord === sWord ||
      (STRUCTURAL_EQUIVALENTS[tWord] &&
        (STRUCTURAL_EQUIVALENTS[tWord].includes(sWord) ||
          STRUCTURAL_EQUIVALENTS[tWord].join('') === sWord))
    ) {
      return {
        score: isLowConfidence ? 76 : 100,
        matchType: isLowConfidence ? 'Close' : 'Exact'
      };
    }

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

    if (primaryMetaphoneMatch && tSyl === sSyl && dist <= 2 && editRatio <= 0.40) {
      return {
        score: isLowConfidence ? 76 : 100,
        matchType: isLowConfidence ? 'Close' : 'Exact'
      };
    }

    if ((primaryMetaphoneMatch || secondaryMetaphoneMatch) && editRatio <= 0.45) {
      const pScore = Math.min(78, Math.max(65, levelProfile.phoneticWordScore));
      return { score: pScore, matchType: 'Close' };
    }

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
  // 5. RECORDING, SEQUENTIAL PLAYBACK & HYBRID GRADING LIFECYCLE
  // ============================================================================

  const createFreshSpeechRecognition = () => {
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
      if (activeInterimRef.current) {
        lockedSegmentsRef.current.push(activeInterimRef.current);
        activeInterimRef.current = null;
      }

      if (isRecordingRef.current) {
        clearTimeout(sttRestartTimerRef.current);
        sttRestartTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            const fresh = createFreshSpeechRecognition();
            if (fresh) {
              try { fresh.start(); } catch (err) {}
            }
          }
        }, 150);
      } else {
        speechFlushedRef.current = true;
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  useEffect(() => }