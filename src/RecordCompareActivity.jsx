import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';

/**
 * CEFR Level Calibration Matrix
 */
const CEFR_PROFILES = {
  A1: {
    passScore: 65,
    wordApprove: 80,
    minWordPass: 60,
    minCoverageRatio: 0.75,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 16,
    closeLetterScore: 72,
    phoneticMatchScore: 75,
    acousticTolerance: 1.12,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  A2: {
    passScore: 70,
    wordApprove: 80,
    minWordPass: 60,
    minCoverageRatio: 0.78,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 18,
    closeLetterScore: 70,
    phoneticMatchScore: 74,
    acousticTolerance: 1.08,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  B1: {
    passScore: 75,
    wordApprove: 82,
    minWordPass: 60,
    minCoverageRatio: 0.80,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 20,
    closeLetterScore: 65,
    phoneticMatchScore: 72,
    acousticTolerance: 1.00,
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
    acousticTolerance: 0.95,
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
    acousticTolerance: 0.90,
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
    acousticTolerance: 0.86,
    wAccuracy: 0.75,
    wCompleteness: 0.10,
    wProsody: 0.15
  }
};

// Conversational interjections: rendered green in UI and excluded from scoring math
const SCRIPT_FILLERS = new Set([
  'uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh', 'er', 'erm'
]);

// Unstressed grammar/function words that are naturally coarticulated in connected speech
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'can', 'you', 'that', 'this', 'i', 'see', 'what', 'is', 'are',
  'am', 'was', 'were', 'your', 'my', 'his', 'her', 'our', 'their', 'its', 'mr',
  'mrs', 'ms', 'dr', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from',
  'it', 'he', 'she', 'we', 'they', 'me', 'him', 'us', 'them', 'do', 'does', 'did',
  'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might',
  'yes', 'yeah', 'yep', 'no', 'not', 'and', 'or', 'but', 'so', 'if', 'as', 'be',
  'hi', 'hey', 'hello', 'good', 'ok', 'okay', 'please', 'thank', 'thanks'
]);

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

  // Audio Playback & Cached Teacher DSP Refs
  const activePlaybackRef = useRef(null);
  const studentAudioUrlRef = useRef(null);
  const teacherDSPRef = useRef(null);
  const cachedTeacherUrlRef = useRef('');

  // Recording & SpeechRecognition Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const sttRestartTimerRef = useRef(null);

  const committedSegmentsRef = useRef([]);
  const currentSegmentRef = useRef([]);
  const speechFlushedRef = useRef(false);

  // Live Backup Frame Capture Refs (In case mobile decodeAudioData fails on short WebM containers)
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const liveRawSamplesRef = useRef([]);
  const liveSampleRateRef = useRef(44100);
  const animationFrameRef = useRef(null);

  const recordingStartTimeRef = useRef(0);
  const isRecordingRef = useRef(false);
  const activeStreamRef = useRef(null);

  const wordsList = targetText.trim().split(/\s+/);

  // ============================================================================
  // 1. AUDIO PLAYBACK LOCK & PHONETIC SKELETON ANALYZER
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

  /**
   * Builds a rich Phonetic-Articulatory Profile for any target word, letter, or digit.
   * Used to verify sibilants (/s/ in "spell", "passport"), syllable counts, vowel height/frontness,
   * and duration weights when scoring audio segments.
   */
  const getWordArticulatoryModel = (rawWord = '') => {
    const clean = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) {
      return {
        clean: '',
        isFiller: true,
        isFunctionWord: true,
        isSingleChar: false,
        syllables: 1,
        weight: 0.5,
        hasStrongSibilant: false,
        hasWeakFricative: false,
        onsetSibilant: false,
        vowelClass: 'mid'
      };
    }

    const isFiller = SCRIPT_FILLERS.has(clean);
    const isSingleChar = clean.length === 1;
    const isFunctionWord = !isSingleChar && FUNCTION_WORDS.has(clean);

    // 1. Single Spelled Letter or Digit Model
    if (isSingleChar) {
      const strongSibChars = new Set(['s', 'c', 'z', 'x', '6', '7']);
      const weakFricChars = new Set(['f', 'h', 'j', 'v', '3']);
      const highFrontChars = new Set(['b', 'c', 'd', 'e', 'g', 'p', 't', 'v', 'z', '3']);
      const backRoundChars = new Set(['o', 'q', 'u', 'w', '0', '2', '4']);
      const multiSyllableChars = new Set(['w', '7', '0']);

      const syllables = clean === 'w' ? 3 : multiSyllableChars.has(clean) ? 2 : 1;
      return {
        clean,
        isFiller: false,
        isFunctionWord: false,
        isSingleChar: true,
        syllables,
        weight: syllables * 0.85,
        hasStrongSibilant: strongSibChars.has(clean),
        hasWeakFricative: weakFricChars.has(clean),
        onsetSibilant: new Set(['s', 'c', 'z', '6', '7']).has(clean),
        vowelClass: highFrontChars.has(clean)
          ? 'high_front'
          : backRoundChars.has(clean)
          ? 'back_round'
          : 'open_mid'
      };
    }

    // 2. Multi-Character Word Model
    let vowelMatches = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g);
    let syllables = Math.max(1, vowelMatches ? vowelMatches.length : 1);

    // Explicit syllable overrides for common irregular words
    const syllableOverrides = {
      passport: 2,
      telephone: 3,
      repeat: 2,
      spell: 1,
      number: 2,
      welcome: 2,
      rivera: 3,
      ernesto: 3,
      morning: 2,
      evening: 2,
      name: 1,
      please: 1,
      where: 1,
      there: 1,
      here: 1
    };
    if (syllableOverrides[clean]) {
      syllables = syllableOverrides[clean];
    }

    // Detect strong alveolar/palatal sibilants (/s/, /z/, /sh/, /ch/, /x/, soft /c/)
    const hasStrongSibilant = /s|z|sh|ch|x|ce|ci|cy/.test(clean);
    const onsetSibilant = /^(?:s|z|sh|ch|ce|ci|cy|ps)/.test(clean);
    const hasWeakFricative = /f|v|th|ph|j|ge|gi/.test(clean);

    // Dominant vowel formant class
    let vowelClass = 'mid';
    if (/ee|ea|ie|ey|i[^aeiou]*e$|^be$|^see$|^we$|^he$|^she$|^me$|repeat/.test(clean)) {
      vowelClass = 'high_front';
    } else if (/oo|ou|ow|oa|o[^aeiou]*e$|port|phone|no|go|so/.test(clean)) {
      vowelClass = 'back_round';
    } else if (/a|e|u/.test(clean)) {
      vowelClass = 'open_mid';
    }

    const baseWeight = isFunctionWord
      ? Math.max(0.55, syllables * 0.65)
      : Math.max(1.0, syllables * 0.95 + clean.length * 0.06);

    return {
      clean,
      isFiller,
      isFunctionWord,
      isSingleChar: false,
      syllables,
      weight: baseWeight,
      hasStrongSibilant,
      hasWeakFricative,
      onsetSibilant,
      vowelClass
    };
  };

  // ============================================================================
  // 2. 6-BAND MEL/FORMANT DSP ENGINE (DECODES BLOB OR LIVE PCM SAMPLES)
  // ============================================================================

  const analyzePCMChannelData = (channelData, sampleRate) => {
    const empty = {
      valid: false,
      voicedSec: 0,
      speakingSpanSec: 0,
      burstCount: 0,
      syllablePeaks: 0,
      pitchVariance: 0,
      avgClarity: 0,
      frames: [],
      activeFrames: [],
      bursts: []
    };

    if (!channelData || channelData.length < 512) return empty;

    const frameSize = Math.max(256, Math.floor(sampleRate * 0.025)); // 25ms frame resolution
    const pitchSize = 1024;
    const detector =
      channelData.length >= pitchSize ? PitchDetector.forFloat32Array(pitchSize) : null;

    // 1-pole IIR low-pass filter coefficients for formant frequency cutoffs:
    // 350Hz (F0/nasal), 900Hz (F1 open), 1850Hz (F2 back/mid), 3200Hz (F2/F3 front), >3200Hz (sibilant /s/)
    const calcAlpha = (cutoffHz) => {
      const dt = 1 / sampleRate;
      const rc = 1 / (2 * Math.PI * cutoffHz);
      return dt / (rc + dt);
    };

    const a350 = calcAlpha(350);
    const a900 = calcAlpha(900);
    const a1850 = calcAlpha(1850);
    const a3200 = calcAlpha(3200);

    const rawFrames = [];

    for (let offset = 0; offset + frameSize <= channelData.length; offset += frameSize) {
      let sumSq = 0;
      let zeroCrossings = 0;

      let lp350 = channelData[offset];
      let lp900 = lp350;
      let lp1850 = lp350;
      let lp3200 = lp350;
      let prev = lp350;

      let eBand1 = 0; // 85 - 350 Hz (Voicing / Nasal)
      let eBand2 = 0; // 350 - 900 Hz (F1 Low/Mid Vowel Height)
      let eBand3 = 0; // 900 - 1850 Hz (F2 Back/Central Vowel)
      let eBand4 = 0; // 1850 - 3200 Hz (F2/F3 High-Front Vowel /i:/)
      let eBand5 = 0; // 3200 - 7500+ Hz (Sibilant /s, z, sh, ch/)

      for (let k = 0; k < frameSize; k++) {
        const s = channelData[offset + k];
        sumSq += s * s;

        if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) {
          zeroCrossings++;
        }
        prev = s;

        lp350 += a350 * (s - lp350);
        lp900 += a900 * (s - lp900);
        lp1850 += a1850 * (s - lp1850);
        lp3200 += a3200 * (s - lp3200);

        const b1 = lp350;
        const b2 = lp900 - lp350;
        const b3 = lp1850 - lp900;
        const b4 = lp3200 - lp1850;
        const b5 = s - lp3200;

        eBand1 += b1 * b1;
        eBand2 += b2 * b2;
        eBand3 += b3 * b3;
        eBand4 += b4 * b4;
        eBand5 += b5 * b5;
      }

      const rms = Math.sqrt(sumSq / frameSize);
      const zcr = zeroCrossings / frameSize;
      const totalE = Math.max(1e-8, eBand1 + eBand2 + eBand3 + eBand4 + eBand5);

      const b1_low = eBand1 / totalE;
      const b2_f1 = eBand2 / totalE;
      const b3_f2low = eBand3 / totalE;
      const b4_f2high = eBand4 / totalE;
      const b5_sib = eBand5 / totalE;

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
        b1_low,
        b2_f1,
        b3_f2low,
        b4_f2high,
        b5_sib,
        vowelEnergy: rms * (b1_low + b2_f1 + b3_f2low + b4_f2high),
        pitch,
        clarity
      });
    }

    if (rawFrames.length === 0) return empty;

    const sortedRms = rawFrames.map((f) => f.rms).sort((a, b) => a - b);
    const noiseFloor = sortedRms[Math.floor(sortedRms.length * 0.18)] || 0.001;
    const peakRms = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.02;

    const voiceThreshold = Math.max(
      0.0045,
      Math.min(0.022, noiseFloor * 2.4, peakRms * 0.18)
    );

    let firstActive = -1;
    let lastActive = -1;
    let activeCount = 0;

    // Group contiguous active frames into discrete vocal bursts (words / spelled letters)
    const bursts = [];
    let currentBurstFrames = [];
    let silenceRun = 0;

    rawFrames.forEach((f, idx) => {
      f.normEnergy = Math.min(1, f.rms / Math.max(0.01, peakRms));
      // Capture both voiced vowels AND high-frequency voiceless sibilants (like /s/ in "spell")
      const isVoiced = f.rms >= voiceThreshold;
      const isSibilantOnset =
        f.rms >= voiceThreshold * 0.55 && (f.b5_sib >= 0.25 || f.zcr >= 0.15);

      f.active = isVoiced || isSibilantOnset;

      if (f.active) {
        activeCount++;
        if (firstActive === -1) firstActive = idx;
        lastActive = idx;
        silenceRun = 0;
        currentBurstFrames.push(f);
      } else {
        silenceRun++;
        // A silence gap >= 3 frames (75ms) closes the current vocal burst
        if (silenceRun >= 3 && currentBurstFrames.length >= 2) {
          bursts.push(currentBurstFrames);
          currentBurstFrames = [];
        } else if (silenceRun >= 3) {
          currentBurstFrames = [];
        }
      }
    });

    if (currentBurstFrames.length >= 2) {
      bursts.push(currentBurstFrames);
    }

    if (firstActive === -1 || activeCount < 2) return empty;

    const trimmedFrames = rawFrames.slice(firstActive, lastActive + 1);
    const activeFrames = trimmedFrames.filter((f) => f.active);

    // Count distinct syllable nuclei peaks across the utterance
    let syllablePeaks = 0;
    let lastPeakIdx = -4;
    for (let i = 1; i < trimmedFrames.length - 1; i++) {
      const cur = trimmedFrames[i];
      if (
        cur.active &&
        cur.normEnergy >= 0.18 &&
        cur.vowelEnergy >= trimmedFrames[i - 1].vowelEnergy &&
        cur.vowelEnergy >= trimmedFrames[i + 1].vowelEnergy &&
        i - lastPeakIdx >= 4 // At least 100ms between syllable nuclei
      ) {
        syllablePeaks++;
        lastPeakIdx = i;
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
        : 0.65;

    return {
      valid: true,
      voicedSec: activeCount * 0.025,
      speakingSpanSec: trimmedFrames.length * 0.025,
      burstCount: Math.max(1, bursts.length),
      syllablePeaks: Math.max(bursts.length, syllablePeaks),
      pitchVariance,
      avgClarity,
      frames: trimmedFrames,
      activeFrames,
      bursts
    };
  };

  // Extracts DSP features from a URL or Blob, falling back to live captured PCM samples if container decoding fails
  const extractAudioDSP = async (audioSource, allowLiveFallback = false) => {
    let tempCtx = null;
    try {
      if (audioSource) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        tempCtx = new AudioCtx();

        let arrayBuffer = null;
        if (typeof audioSource === 'string') {
          const resp = await fetch(audioSource);
          if (resp.ok) arrayBuffer = await resp.arrayBuffer();
        } else if (audioSource instanceof Blob && audioSource.size > 0) {
          arrayBuffer = await audioSource.arrayBuffer();
        }

        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
          const channelData = audioBuffer.getChannelData(0);
          const decoded = analyzePCMChannelData(channelData, audioBuffer.sampleRate);
          if (decoded.valid) return decoded;
        }
      }
    } catch (e) {
      console.warn("Audio container decode fallback to live PCM:", e);
    } finally {
      if (tempCtx && tempCtx.state !== 'closed') {
        try { tempCtx.close(); } catch (e) {}
      }
    }

    // Fallback to live captured PCM samples if WebM container decode failed on mobile
    if (allowLiveFallback && liveRawSamplesRef.current.length > 0) {
      const totalLen = liveRawSamplesRef.current.reduce((s, arr) => s + arr.length, 0);
      const merged = new Float32Array(totalLen);
      let offset = 0;
      for (const chunk of liveRawSamplesRef.current) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return analyzePCMChannelData(merged, liveSampleRateRef.current || 44100);
    }

    return analyzePCMChannelData(null, 44100);
  };

  // Pre-decode and cache Teacher Reference Audio whenever audioUrl changes
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
  // 3. PAUSE-STRIPPED WORD SEGMENTER & ARTICULATORY-SPECTRAL EVALUATOR
  // ============================================================================

  /**
   * Segments active (pause-stripped) frames into word slices proportional to each word's
   * articulatory weight, snapping boundaries to local energy valleys (consonant boundaries).
   * Also strips leading filler bursts (like "Hmm." or "Uh...") from the Teacher Audio if needed.
   */
  const segmentActiveFramesIntoWords = (dsp, wordModels, stripLeadingFillersCount = 0) => {
    if (!dsp || !dsp.valid || !dsp.activeFrames.length || !wordModels.length) return [];

    let workingFrames = dsp.activeFrames;

    // If Teacher Audio starts with conversational fillers ("Hmm.", "Uh..."),
    // strip the leading filler burst(s) so Teacher Word 0 aligns with the first content word ("Can")
    if (stripLeadingFillersCount > 0 && dsp.bursts.length > wordModels.length) {
      const burstsToSkip = Math.min(
        stripLeadingFillersCount,
        dsp.bursts.length - wordModels.length
      );
      const remainingBursts = dsp.bursts.slice(burstsToSkip);
      const flattened = remainingBursts.flat();
      if (flattened.length >= wordModels.length * 2) {
        workingFrames = flattened;
      }
    }

    // If this is an isolated single-letter/digit sequence and the number of discrete bursts matches,
    // use the exact discrete bursts for 1-to-1 letter accuracy
    const allSingleChars = wordModels.every((m) => m.isSingleChar);
    if (allSingleChars && dsp.bursts.length === wordModels.length) {
      return dsp.bursts;
    }

    const totalWeight = wordModels.reduce((s, m) => s + m.weight, 0);
    const totalFrames = workingFrames.length;
    const slices = [];

    let prevBoundary = 0;
    let accumWeight = 0;

    for (let i = 0; i < wordModels.length; i++) {
      accumWeight += wordModels[i].weight;
      if (i === wordModels.length - 1) {
        slices.push(workingFrames.slice(prevBoundary, totalFrames));
        break;
      }

      const idealBoundary = Math.round((accumWeight / totalWeight) * totalFrames);
      const searchRadius = Math.max(2, Math.floor(totalFrames * 0.08));
      const minIdx = Math.max(prevBoundary + 1, idealBoundary - searchRadius);
      const maxIdx = Math.min(totalFrames - (wordModels.length - i), idealBoundary + searchRadius);

      // Snap boundary to the lowest vowel-energy valley within the window
      let bestBoundary = idealBoundary;
      let minValleyEnergy = Infinity;
      for (let k = minIdx; k <= maxIdx; k++) {
        if (workingFrames[k] && workingFrames[k].vowelEnergy < minValleyEnergy) {
          minValleyEnergy = workingFrames[k].vowelEnergy;
          bestBoundary = k;
        }
      }

      bestBoundary = Math.max(prevBoundary + 1, Math.min(totalFrames - 1, bestBoundary));
      slices.push(workingFrames.slice(prevBoundary, bestBoundary));
      prevBoundary = bestBoundary;
    }

    return slices;
  };

  // Computes 6-Band Formant + ZCR Dynamic Time Warping (DTW) similarity between Teacher & Student word slices
  const computeWordSliceDTW = (teacherSlice = [], studentSlice = []) => {
    if (!teacherSlice.length || !studentSlice.length) return null;

    const N = teacherSlice.length;
    const M = studentSlice.length;
    const dtw = Array.from({ length: N + 1 }, () => Array(M + 1).fill(Infinity));
    dtw[0][0] = 0;

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const tf = teacherSlice[i - 1];
        const sf = studentSlice[j - 1];

        // 6-Band Formant + Sibilant + ZCR distance (speaker-pitch invariant!)
        const spectralDist =
          Math.abs(tf.b1_low - sf.b1_low) * 0.7 +
          Math.abs(tf.b2_f1 - sf.b2_f1) * 1.1 +
          Math.abs(tf.b3_f2low - sf.b3_f2low) * 1.1 +
          Math.abs(tf.b4_f2high - sf.b4_f2high) * 1.3 +
          Math.abs(tf.b5_sib - sf.b5_sib) * 2.2 +
          Math.abs(tf.zcr - sf.zcr) * 1.8;

        dtw[i][j] =
          spectralDist + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      }
    }

    const avgDist = dtw[N][M] / (N + M);
    // Calibrated mapping: avgDist <= 0.14 -> ~95%, avgDist ~ 0.30 -> ~70%, avgDist >= 0.48 -> < 45%
    const rawScore = Math.round(114 - avgDist * 155);
    return Math.max(0, Math.min(100, rawScore));
  };

  /**
   * Scores a single student word slice against its Target Articulatory Model & Teacher Reference Slice.
   * Pinpoints replaced words ("repeat" vs "spell", "telephone" vs "passport") and wrong letters ("R I V E R A").
   */
  const scoreAcousticWordSlice = (
    model,
    studentSlice,
    teacherSlice,
    totalStudentActiveFrames,
    totalExpectedWeight
  ) => {
    if (!studentSlice || studentSlice.length === 0) {
      return { score: 0, error_type: 'Omission' };
    }

    // 1. Short Function / Grammar Words ("Can", "you", "that", "I", "see", "What", "is", "your", "Mr.")
    // In connected speech, function words are short and coarticulated; verify active vocal presence
    if (model.isFunctionWord) {
      const meanRms =
        studentSlice.reduce((s, f) => s + f.normEnergy, 0) / studentSlice.length;
      if (meanRms >= 0.10) {
        return { score: 92, error_type: 'None' };
      }
      return { score: 74, error_type: 'Mispronunciation' };
    }

    // Extract articulatory features of the student's word slice
    const maxSib = Math.max(...studentSlice.map((f) => f.b5_sib));
    const maxZcr = Math.max(...studentSlice.map((f) => f.zcr));
    const onsetSlice = studentSlice.slice(0, Math.max(2, Math.ceil(studentSlice.length * 0.45)));
    const onsetSib = Math.max(...onsetSlice.map((f) => f.b5_sib));
    const onsetZcr = Math.max(...onsetSlice.map((f) => f.zcr));

    const avgB2F1 =
      studentSlice.reduce((s, f) => s + f.b2_f1, 0) / studentSlice.length;
    const avgB3F2Low =
      studentSlice.reduce((s, f) => s + f.b3_f2low, 0) / studentSlice.length;
    const avgB4F2High =
      studentSlice.reduce((s, f) => s + f.b4_f2high, 0) / studentSlice.length;

    // Count local syllable peaks inside this word slice
    let localPeaks = 1;
    let lastPk = -3;
    for (let i = 1; i < studentSlice.length - 1; i++) {
      if (
        studentSlice[i].vowelEnergy > studentSlice[i - 1].vowelEnergy &&
        studentSlice[i].vowelEnergy > studentSlice[i + 1].vowelEnergy &&
        studentSlice[i].normEnergy >= 0.22 &&
        i - lastPk >= 3
      ) {
        localPeaks++;
        lastPk = i;
      }
    }
    localPeaks = Math.min(4, Math.max(1, localPeaks - 1));

    // Teacher DTW spectral similarity (if teacher audio slice is available)
    const dtwScore =
      teacherSlice && teacherSlice.length > 0
        ? computeWordSliceDTW(teacherSlice, studentSlice)
        : null;

    let baseScore = dtwScore !== null ? dtwScore : 86;
    let penalty = 0;

    // CHECK A: Sibilant / Fricative Verification (Catches "repeat" for "spell" and "telephone" for "passport")
    if (model.hasStrongSibilant) {
      const teacherMaxSib =
        teacherSlice && teacherSlice.length > 0
          ? Math.max(...teacherSlice.map((f) => f.b5_sib))
          : 0.28;
      const requiredSib = Math.min(0.20, teacherMaxSib * 0.60);

      const hasStudentSibilant = maxSib >= requiredSib || maxZcr >= 0.135;
      if (!hasStudentSibilant) {
        // Target word requires a strong /s, z, sh, ch, c/ sibilant, but student's word had NONE!
        penalty += 42;
      } else if (model.onsetSibilant && onsetSib < requiredSib * 0.75 && onsetZcr < 0.11) {
        // Sibilant was expected at the onset (like "spell" or "S"), but was missing at onset
        penalty += 24;
      }
    } else if (!model.hasStrongSibilant && !model.hasWeakFricative) {
      // Target word has NO sibilant/fricative, but student spoke a strong sibilant word
      if (maxSib >= 0.42 && maxZcr >= 0.22) {
        penalty += 32;
      }
    }

    // CHECK B: Vowel Formant Class Verification (High-Front /i:/ vs Open/Mid /e, a/ vs Back-Round /o, u/)
    if (model.vowelClass === 'high_front') {
      // Words/letters like "E", "I", "V", "B", "see", "repeat" require strong high-F2 (b4_f2high)
      if (avgB4F2High < 0.08 && avgB2F1 > 0.48) {
        penalty += 28;
      }
    } else if (model.vowelClass === 'open_mid') {
      // Words like "spell" (/ɛl/) or letters like "A", "R" have dominant F1/F2-low, not tense /i:/
      if (avgB4F2High > 0.34 && avgB2F1 < 0.18) {
        penalty += 26;
      }
    } else if (model.vowelClass === 'back_round') {
      // Words/letters like "O", "U", "passport" have strong low-F1 + F2-low
      if (avgB4F2High > 0.32 && avgB3F2Low < 0.15) {
        penalty += 26;
      }
    }

    // CHECK C: Syllable Structure & Relative Duration Ratio (Catches 2-syllable "repeat" for 1-syllable "spell", or 3-syllable "telephone" for 2-syllable "passport")
    if (!model.isSingleChar && totalStudentActiveFrames > 8) {
      const expectedShare = model.weight / Math.max(1, totalExpectedWeight);
      const actualShare = studentSlice.length / totalStudentActiveFrames;
      const shareRatio = actualShare / Math.max(0.05, expectedShare);

      // If teacher slice is available, compare relative duration ratio against teacher's word duration
      if (teacherSlice && teacherSlice.length >= 3) {
        const durationRatio = studentSlice.length / teacherSlice.length;
        if (
          (model.syllables === 1 && localPeaks >= 2 && durationRatio > 1.45) ||
          durationRatio > 1.75 ||
          durationRatio < 0.42
        ) {
          penalty += 26;
        }
      } else if (shareRatio > 1.65 || shareRatio < 0.45) {
        penalty += 22;
      }
    }

    const rawFinal = Math.round((baseScore - penalty) * levelProfile.acousticTolerance);
    const clampedScore = Math.max(0, Math.min(100, rawFinal));

    // If multiple phonetic checks failed (score < 60), mark as Red (0% substitution/mispronunciation)
    if (clampedScore < levelProfile.minWordPass) {
      return { score: 0, error_type: 'Mispronunciation' };
    }

    if (clampedScore < levelProfile.wordApprove) {
      return { score: clampedScore, error_type: 'Mispronunciation' };
    }

    return { score: clampedScore, error_type: 'None' };
  };

  // ============================================================================
  // 4. SPEECH RECOGNITION ENGINE (WITH AUTO-RECOVERY & TWO-PASS ANCHORED DP)
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
        }, 120);
      } else {
        speechFlushedRef.current = true;
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  // Reset cleanly whenever the lesson advances to a new exercise node
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
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
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
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch (e) {}
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
  // 5. STT TOKENIZER & TWO-PASS ANCHORED ALIGNMENT (WHEN STT IS AVAILABLE)
  // ============================================================================

  const tokenizeTranscriptString = (rawString, cleanTargets, defaultConfidence = 0.88) => {
    if (!rawString || !rawString.trim()) return [];

    const hasDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));
    const hasSingleLetters = cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

    let text = rawString.toLowerCase();
    text = text.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

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

  const evaluateSttPairMatch = (tWord, sObj) => {
    if (!sObj || !sObj.token) return { score: 0, matchType: 'None' };

    const sWord = sObj.token;
    const conf = typeof sObj.confidence === 'number' ? sObj.confidence : 0.88;
    const lowConfCap = conf < 0.62 ? 74 : 100;

    if (/^\d+$/.test(tWord)) {
      if (tWord === sWord) {
        if (sObj.approx) {
          return { score: levelProfile.closeLetterScore || 72, matchType: 'Close' };
        }
        return { score: Math.min(100, lowConfCap), matchType: 'Exact' };
      }
      return { score: 0, matchType: 'None' };
    }

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
        return { score: Math.min(76, levelProfile.closeLetterScore), matchType: 'Close' };
      }
      return { score: 0, matchType: 'None' };
    }

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

    if (tSkel && sSkel && tSkel === sSkel && editRatio <= 0.42) {
      const pScore = Math.min(78, Math.max(64, levelProfile.phoneticMatchScore));
      return { score: pScore, matchType: 'Close' };
    }

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

  const runTwoPassSttAlignment = (targetContentTokens, spokenTokenObjs) => {
    const N = targetContentTokens.length;
    const M = spokenTokenObjs.length;

    const dp = Array.from({ length: N + 1 }, () => Array(M + 1).fill(0));
    const choice = Array.from({ length: N + 1 }, () => Array(M + 1).fill(''));

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const pair = evaluateSttPairMatch(targetContentTokens[i - 1], spokenTokenObjs[j - 1]);
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
        const pair = evaluateSttPairMatch(targetContentTokens[curr.tIdx], sObj);
        const isYellow = pair.score < levelProfile.wordApprove;
        slotResults[curr.tIdx] = {
          score: pair.score,
          error_type: isYellow ? 'Mispronunciation' : 'None'
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
  // 6. ACOUSTIC-PHONETIC SEQUENCE ALIGNER (WHEN MOBILE OS BLOCKS STT)
  // ============================================================================

  /**
   * Aligns the student's recorded audio against the target words and teacher reference audio
   * when Android blocks webkitSpeechRecognition.
   * Accurately distinguishes:
   * - Omitted words (Grey Strikethrough: `error_type: 'Omission'`, `score: 0`)
   * - Replaced / Wrong words (Red: `error_type: 'Mispronunciation'`, `score: 0`)
   * - Imperfect pronunciation (Yellow: `error_type: 'Mispronunciation'`, `score: 60-79`)
   * - Clear pronunciation (Green: `error_type: 'None'`, `score: 80-100`)
   */
  const runAcousticPhoneticEvaluation = (
    targetContentModels,
    studentDSP,
    teacherDSP,
    leadingFillerCount
  ) => {
    const N = targetContentModels.length;
    if (!studentDSP || !studentDSP.valid || studentDSP.voicedSec < 0.18 || N === 0) {
      return targetContentModels.map(() => ({ score: 0, error_type: 'Omission' }));
    }

    const totalExpectedSyllables = targetContentModels.reduce((s, m) => s + m.syllables, 0);
    const totalExpectedWeight = targetContentModels.reduce((s, m) => s + m.weight, 0);

    // Segment Teacher Reference Audio into per-word reference slices (stripping leading fillers)
    const teacherWordSlices =
      teacherDSP && teacherDSP.valid
        ? segmentActiveFramesIntoWords(teacherDSP, targetContentModels, leadingFillerCount)
        : [];

    // Estimate how many content words the student actually spoke (Omission Detection)
    let expectedVoicedSec = targetContentModels.reduce(
      (s, m) => s + (m.isSingleChar ? 0.17 : m.isFunctionWord ? 0.14 : m.syllables * 0.21),
      0
    );
    if (teacherDSP && teacherDSP.valid && teacherWordSlices.length === N) {
      const teacherContentFrames = teacherWordSlices.reduce((s, sl) => s + sl.length, 0);
      expectedVoicedSec = Math.max(0.35, teacherContentFrames * 0.025 * 0.85);
    }

    const durationCoverage = studentDSP.voicedSec / Math.max(0.30, expectedVoicedSec);
    const syllableCoverage =
      studentDSP.syllablePeaks / Math.max(1, totalExpectedSyllables * 0.80);
    const burstCoverage = studentDSP.burstCount / Math.max(1, N * 0.75);

    const combinedCoverage = Math.min(
      1,
      Math.max(
        durationCoverage * 0.65 + syllableCoverage * 0.35,
        burstCoverage * 0.85
      )
    );

    // Determine how many target content words were actually spoken
    let spokenWordCount = N;
    if (combinedCoverage < 0.84) {
      spokenWordCount = Math.max(1, Math.min(N - 1, Math.round(N * combinedCoverage)));
    }

    // If the student omitted 1 or more words (spokenWordCount < N), find which subset of size
    // `spokenWordCount` best matches the student's spoken audio, and mark the rest as Omission!
    if (spokenWordCount < N) {
      // Check if the student spoke from the start, skipped a middle word, or skipped the end
      let bestSubsetIndices = [];
      let bestSubsetScore = -Infinity;
      let bestSubsetEvaluations = [];

      // Generate candidate subsets of length `spokenWordCount` (contiguous prefixes, suffixes, and single-word skips)
      const candidateSubsets = [];

      // Prefix (spoke first K words, omitted the end)
      candidateSubsets.push(Array.from({ length: spokenWordCount }, (_, i) => i));

      // Suffix (omitted initial word(s), spoke the rest)
      candidateSubsets.push(
        Array.from({ length: spokenWordCount }, (_, i) => N - spokenWordCount + i)
      );

      // Single-word omissions (e.g., omitted "welcome" or a middle word)
      if (spokenWordCount === N - 1) {
        for (let skipIdx = 0; skipIdx < N; skipIdx++) {
          const sub = [];
          for (let i = 0; i < N; i++) {
            if (i !== skipIdx) sub.push(i);
          }
          candidateSubsets.push(sub);
        }
      }

      for (const subset of candidateSubsets) {
        const subModels = subset.map((idx) => targetContentModels[idx]);
        const subWeight = subModels.reduce((s, m) => s + m.weight, 0);
        const studentSlices = segmentActiveFramesIntoWords(studentDSP, subModels, 0);

        let sumScore = 0;
        const evals = [];
        for (let k = 0; k < subset.length; k++) {
          const origIdx = subset[k];
          const res = scoreAcousticWordSlice(
            subModels[k],
            studentSlices[k],
            teacherWordSlices[origIdx] || null,
            studentDSP.activeFrames.length,
            subWeight
          );
          sumScore += res.score;
          evals.push(res);
        }

        if (sumScore > bestSubsetScore) {
          bestSubsetScore = sumScore;
          bestSubsetIndices = subset;
          bestSubsetEvaluations = evals;
        }
      }

      const finalResults = new Array(N).fill(null).map(() => ({
        score: 0,
        error_type: 'Omission'
      }));

      bestSubsetIndices.forEach((targetIdx, k) => {
        finalResults[targetIdx] = bestSubsetEvaluations[k];
      });

      return finalResults;
    }

    // Student spoke all N word slots: segment active frames across the N models and evaluate each word
    const studentWordSlices = segmentActiveFramesIntoWords(
      studentDSP,
      targetContentModels,
      0
    );

    return targetContentModels.map((model, idx) =>
      scoreAcousticWordSlice(
        model,
        studentWordSlices[idx] || [],
        teacherWordSlices[idx] || null,
        studentDSP.activeFrames.length,
        totalExpectedWeight
      )
    );
  };

  // ============================================================================
  // 7. RECORDING, SEQUENTIAL PLAYBACK & HYBRID GRADING WORKFLOW
  // ============================================================================

  // Captures passive PCM samples in the background as a backup in case mobile decodeAudioData fails
  const startLivePCMBackupLoop = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    const analyser = analyserRef.current;
    const buffer = new Float32Array(analyser.fftSize);
    liveSampleRateRef.current = audioCtxRef.current.sampleRate || 44100;

    let lastCaptureTime = 0;
    const loop = (now) => {
      if (now - lastCaptureTime >= 24 && audioCtxRef.current && audioCtxRef.current.state === 'running') {
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
      committedSegmentsRef.current = [];
      currentSegmentRef.current = [];
      speechFlushedRef.current = false;
      isRecordingRef.current = true;

      // 1. Acquire microphone stream for MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      activeStreamRef.current = stream;

      // 2. Attach passive AnalyserNode backup (NOT connected to destination so it never causes speaker feedback)
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtx();
        } else if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        const source = audioCtxRef.current.createMediaStreamSource(stream);
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        analyserRef.current = analyser;
        startLivePCMBackupLoop();
      } catch (audioCtxErr) {
        console.warn("Passive AnalyserNode backup skipped:", audioCtxErr);
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

        // Release getUserMedia hardware immediately so speaker playback has 100% clean routing
        stream.getTracks().forEach((track) => track.stop());
        if (activeStreamRef.current === stream) {
          activeStreamRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          try { audioCtxRef.current.close(); } catch (e) {}
          audioCtxRef.current = null;
        }

        // Allow SpeechRecognition 600ms after mic release to flush any pending transcript
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
        }, 600);

        runPlaybackReview(url, audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Request data slices every 100ms so short recordings are never empty
      recordingStartTimeRef.current = Date.now();
      setPhase('recording');

      // 4. Start SpeechRecognition 150ms after MediaRecorder stabilizes
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

  // Step 3: Stop Recording
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    clearTimeout(sttRestartTimerRef.current);
    cancelAnimationFrame(animationFrameRef.current);

    setPhase('playing_review');

    // 180ms tail buffer prevents clipping the final consonant
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    }, 180);
  };

  // Strictly sequential single-audio player: Teacher Sample finishes completely before Student Recording starts
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

  // Step 4: "Comparing..." (Plays Reference -> 350ms pause -> Student Audio, while grading)
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

  // Step 5: Dual-Engine Evaluation (Two-Pass STT + 6-Band Formant/Sibilant/Syllable DSP)
  const executeGrading = async (audioBlob) => {
    // Wait up to 900ms for SpeechRecognition to flush if the browser supports concurrent STT
    let waitTicks = 9;
    while (!speechFlushedRef.current && waitTicks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitTicks--;
    }

    if (currentSegmentRef.current && currentSegmentRef.current.length > 0) {
      committedSegmentsRef.current.push(...currentSegmentRef.current);
      currentSegmentRef.current = [];
    }

    // Decode student recording (with automatic fallback to live PCM buffer) and teacher reference audio
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

    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current - 180) / 1000);
    const pitchVariance = Math.max(14, studentDSP.pitchVariance || 15);

    const cleanRawTargets = wordsList.map((w) => w.toLowerCase().replace(/[^\w\s]/gi, ''));
    const targetContentIndices = [];
    const targetContentTokens = [];
    const targetContentModels = [];

    let leadingFillerCount = 0;
    let seenContentWord = false;

    cleanRawTargets.forEach((tWord, idx) => {
      if (!tWord) return;
      if (SCRIPT_FILLERS.has(tWord)) {
        if (!seenContentWord) leadingFillerCount++;
      } else {
        seenContentWord = true;
        targetContentIndices.push(idx);
        targetContentTokens.push(tWord);
        targetContentModels.push(getWordArticulatoryModel(tWord));
      }
    });

    const totalContentWords = targetContentTokens.length;

    // 1. Always run the 6-Band Formant, Sibilant & Syllable Acoustic Evaluator on the student's recording
    const acousticEvaluations = runAcousticPhoneticEvaluation(
      targetContentModels,
      studentDSP,
      teacherDSP,
      leadingFillerCount
    );

    // 2. If Browser STT captured segments, also run Two-Pass Anchored STT Alignment
    const allSegments = committedSegmentsRef.current;
    let bestSttAlignment = null;

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
          const alignment = runTwoPassSttAlignment(targetContentTokens, candidateObjs);
          if (!bestSttAlignment || alignment.totalScore > bestSttAlignment.totalScore) {
            bestSttAlignment = alignment;
          }
        }
      }
    }

    // 3. Fuse STT Alignment (when present) with Acoustic-Phonetic Evaluation
    const contentSlotFinal = new Array(totalContentWords).fill(null);

    for (let cIdx = 0; cIdx < totalContentWords; cIdx++) {
      const acRes = acousticEvaluations[cIdx] || { score: 0, error_type: 'Omission' };
      const model = targetContentModels[cIdx];

      if (bestSttAlignment && bestSttAlignment.slotResults[cIdx]) {
        const sttRes = bestSttAlignment.slotResults[cIdx];

        if (sttRes.error_type === 'Omission') {
          // If STT dropped isolated spelled letters/digits after a pause, check if the acoustic burst evaluator verified them
          if (
            model.isSingleChar &&
            bestSttAlignment.anchorCount <= 2 &&
            acRes.error_type !== 'Omission' &&
            acRes.score >= levelProfile.minWordPass
          ) {
            contentSlotFinal[cIdx] = acRes;
          } else {
            contentSlotFinal[cIdx] = { score: 0, error_type: 'Omission' };
          }
        } else if (sttRes.score === 0 && sttRes.error_type === 'Mispronunciation') {
          // STT explicitly caught a wrong/substituted word ("repeat" for "spell", "telephone" for "passport") -> RED!
          contentSlotFinal[cIdx] = { score: 0, error_type: 'Mispronunciation' };
        } else {
          // STT matched the word: blend with acoustic pronunciation quality (if acoustic caught a severe error on a lexical word, pull down)
          if (!model.isFunctionWord && acRes.score === 0) {
            contentSlotFinal[cIdx] = { score: 66, error_type: 'Mispronunciation' };
          } else {
            const blended = Math.round(sttRes.score * 0.72 + Math.max(65, acRes.score) * 0.28);
            const finalWordScore =
              sttRes.score < levelProfile.wordApprove
                ? Math.min(levelProfile.wordApprove - 2, blended)
                : blended;
            contentSlotFinal[cIdx] = {
              score: finalWordScore,
              error_type:
                finalWordScore >= levelProfile.wordApprove ? 'None' : 'Mispronunciation'
            };
          }
        }
      } else {
        // Android blocked webkitSpeechRecognition: use the 6-Band Formant, Sibilant & Syllable Acoustic Evaluator
        contentSlotFinal[cIdx] = acRes;
      }
    }

    // 4. Assemble Full Word-Level Heatmap & Compute CEFR Score
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
      const rawProsody = pitchVariance > 12 ? 100 : Math.max(50, pitchVariance * 6);
      const prosodyScore = rawProsody * (completenessScore / 100);

      localOverallScore =
        accuracyScore * levelProfile.wAccuracy +
        completenessScore * levelProfile.wCompleteness +
        prosodyScore * levelProfile.wProsody;

      if (redMismatchCount > 0) {
        const penalty = (redMismatchCount / totalContentWords) * 20;
        localOverallScore = Math.max(0, localOverallScore - penalty);
      }

      const coverageRatio = matchedContentCount / totalContentWords;
      localPassed =
        localOverallScore >= levelProfile.passScore &&
        coverageRatio >= levelProfile.minCoverageRatio;
    }

    // Apply authoritative local evaluation to UI immediately so Red / Yellow / Grey Strikethrough / Green never get overwritten
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

    // Encode a structured transcript for the Supabase Edge Function so database logs match 1-to-1
    const syncedTranscriptTokens = [];
    targetContentIndices.forEach((origIdx, cIdx) => {
      const res = contentSlotFinal[cIdx];
      const tWord = targetContentTokens[cIdx];
      if (!res || res.error_type === 'Omission') {
        return; // Omitted token is excluded so server also marks Omission
      }
      if (res.score < levelProfile.minWordPass) {
        syncedTranscriptTokens.push('wrong_' + cIdx);
      } else if (res.score < levelProfile.wordApprove) {
        if (tWord.length === 1 && CLOSE_PHONETIC_LETTERS[tWord]) {
          syncedTranscriptTokens.push(CLOSE_PHONETIC_LETTERS[tWord][0]);
        } else if (tWord.length > 2) {
          syncedTranscriptTokens.push(tWord.slice(0, -1));
        } else {
          syncedTranscriptTokens.push('?');
        }
      } else {
        syncedTranscriptTokens.push(tWord);
      }
    });

    try {
      await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: syncedTranscriptTokens.join(' '),
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
            // 1. Skipped / Omitted Word -> Grey with Strikethrough
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