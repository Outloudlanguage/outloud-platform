import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';

/**
 * CEFR Level Calibration Matrix
 * Controls pass thresholds, word approval cutoffs, phonetic leniency,
 * acoustic clarity floors, and how much weight is given to lexical vs. acoustic quality.
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
    closeLetterScore: 74,
    phoneticMatchScore: 84,
    clarityFloor: 0.58,
    minConfidence: 0.60,
    lexicalWeight: 0.72,
    acousticWeight: 0.28,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  A2: {
    passScore: 70,
    wordApprove: 80,
    minWordPass: 62,
    minCoverageRatio: 0.75,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 18,
    closeLetterScore: 70,
    phoneticMatchScore: 80,
    clarityFloor: 0.62,
    minConfidence: 0.65,
    lexicalWeight: 0.72,
    acousticWeight: 0.28,
    wAccuracy: 0.55,
    wCompleteness: 0.35,
    wProsody: 0.10
  },
  B1: {
    passScore: 75,
    wordApprove: 82,
    minWordPass: 68,
    minCoverageRatio: 0.80,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 2,
    editPenalty: 22,
    closeLetterScore: 62,
    phoneticMatchScore: 76,
    clarityFloor: 0.68,
    minConfidence: 0.70,
    lexicalWeight: 0.70,
    acousticWeight: 0.30,
    wAccuracy: 0.60,
    wCompleteness: 0.30,
    wProsody: 0.10
  },
  B2: {
    passScore: 80,
    wordApprove: 85,
    minWordPass: 72,
    minCoverageRatio: 0.85,
    maxAllowedEditDistShort: 1,
    maxAllowedEditDistLong: 1,
    editPenalty: 25,
    closeLetterScore: 0,
    phoneticMatchScore: 72,
    clarityFloor: 0.73,
    minConfidence: 0.75,
    lexicalWeight: 0.68,
    acousticWeight: 0.32,
    wAccuracy: 0.65,
    wCompleteness: 0.25,
    wProsody: 0.10
  },
  C1: {
    passScore: 85,
    wordApprove: 88,
    minWordPass: 78,
    minCoverageRatio: 0.90,
    maxAllowedEditDistShort: 0,
    maxAllowedEditDistLong: 1,
    editPenalty: 30,
    closeLetterScore: 0,
    phoneticMatchScore: 68,
    clarityFloor: 0.78,
    minConfidence: 0.80,
    lexicalWeight: 0.65,
    acousticWeight: 0.35,
    wAccuracy: 0.70,
    wCompleteness: 0.15,
    wProsody: 0.15
  },
  C2: {
    passScore: 88,
    wordApprove: 90,
    minWordPass: 82,
    minCoverageRatio: 0.92,
    maxAllowedEditDistShort: 0,
    maxAllowedEditDistLong: 1,
    editPenalty: 35,
    closeLetterScore: 0,
    phoneticMatchScore: 62,
    clarityFloor: 0.82,
    minConfidence: 0.84,
    lexicalWeight: 0.65,
    acousticWeight: 0.35,
    wAccuracy: 0.75,
    wCompleteness: 0.10,
    wProsody: 0.15
  }
};

// Conversational interjections that should not penalize or artificially inflate the student's score
const SCRIPT_FILLERS = new Set([
  'uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh', 'er', 'erm'
]);

// Exact phonetic transcriptions produced by browser STT when a user pronounces individual English letters
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

// Close phonetic letter confusions for L1 Spanish/Romance learners (awards Yellow partial credit at A1-B1, never 100%)
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

// Exact number words for digit exercises
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

// Accent-approximated number words (awards Yellow partial credit at A1-B1)
const CLOSE_NUMBER_HOMOPHONES = {
  tree: '3', free: '3',
  fine: '5',
  sick: '6',icks: '6',
  mine: '9'
};

// Common English Contraction & Equivalence Map
const WORD_EQUIVALENTS = {
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
  ok: ['okay']
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

  // Progressive Disclosure States:
  // 'listen' | 'playing_sample' | 'ready_to_record' | 'recording' | 'playing_review' | 'completed'
  const [phase, setPhase] = useState(audioUrl ? 'listen' : 'ready_to_record');
  const [attempt, setAttempt] = useState(1);
  const [canContinue, setCanContinue] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const [wordResults, setWordResults] = useState([]);
  const [failedIndices, setFailedIndices] = useState(new Set());
  const [overallScore, setOverallScore] = useState(null);

  // Audio Playback & Blob Refs
  const activePlaybackRef = useRef(null);
  const studentAudioUrlRef = useRef(null);
  const teacherAudioFeaturesRef = useRef(null);
  const cachedTeacherUrlRef = useRef('');

  // Recording & SpeechRecognition Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const sttStartTimerRef = useRef(null);

  // Multi-segment & Multi-alternative STT storage
  // Each segment stores { bestTranscript, confidence, alternatives: [{ transcript, confidence }] }
  const committedSegmentsRef = useRef([]);
  const currentSegmentRef = useRef(null);
  const speechFlushedRef = useRef(false);

  // Live Web Audio Refs
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const pitchValuesRef = useRef([]);
  const activeVoiceFramesRef = useRef(0);

  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const isRecordingRef = useRef(false);
  const activeStreamRef = useRef(null);

  const wordsList = targetText.trim().split(/\s+/);

  // ============================================================================
  // 1. UTILITY & PHONETIC ALGORITHMS
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

  // Fast English Phonetic Skeleton Encoder (Distinguishes "spell" -> "SPL" from "repeat" -> "RPT")
  const getPhoneticSkeleton = (word = '') => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return '';
    if (/^\d+$/.test(clean) || clean.length === 1) return clean;

    let s = clean
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

  // Estimate expected syllable count and articulatory traits from target word spelling
  const getExpectedArticulatoryTraits = (word = '') => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return { syllables: 1, hasSibilant: false, minDurationSec: 0.12 };

    if (clean.length === 1) {
      const sibilantLetters = new Set(['s', 'c', 'z', 'x', 'f', 'h', 'j', '6', '7']);
      const multiSyllableLetters = new Set(['w', '7', '0']);
      return {
        syllables: multiSyllableLetters.has(clean) ? 2 : 1,
        hasSibilant: sibilantLetters.has(clean),
        minDurationSec: 0.14
      };
    }

    const vowelGroups = clean.replace(/e$/, '').match(/[aeiouy]+/g);
    const syllables = Math.max(1, vowelGroups ? vowelGroups.length : 1);
    const hasSibilant = /[szxfc]|sh|ch|th/.test(clean);

    return {
      syllables,
      hasSibilant,
      minDurationSec: Math.max(0.16, syllables * 0.14)
    };
  };

  // ============================================================================
  // 2. DSP AUDIO BUFFER ANALYZER & TEACHER-TO-STUDENT DTW ENGINE
  // ============================================================================

  const extractBufferDSPFeatures = async (audioSource) => {
    const empty = {
      valid: false,
      voicedSec: 0,
      speakingSpanSec: 0,
      burstCount: 0,
      syllablePeaks: 0,
      pitchVariance: 0,
      avgClarity: 0,
      frames: []
    };

    if (!audioSource) return empty;

    let tempCtx = null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      tempCtx = new AudioCtx();

      let arrayBuffer = null;
      if (typeof audioSource === 'string') {
        const resp = await fetch(audioSource);
        if (!resp.ok) return empty;
        arrayBuffer = await resp.arrayBuffer();
      } else if (audioSource instanceof Blob) {
        if (audioSource.size === 0) return empty;
        arrayBuffer = await audioSource.arrayBuffer();
      } else {
        return empty;
      }

      const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      const frameSize = Math.max(256, Math.floor(sampleRate * 0.03)); // 30ms frame window
      const pitchSize = 1024;
      const detector =
        channelData.length >= pitchSize ? PitchDetector.forFloat32Array(pitchSize) : null;

      const rawFrames = [];
      for (let offset = 0; offset + frameSize <= channelData.length; offset += frameSize) {
        let sumSq = 0;
        let zeroCrossings = 0;
        let lowEnergy = 0;
        let highEnergy = 0;
        let prevSample = channelData[offset];
        let lowPass = prevSample;

        // Single-pole filter coefficient for ~650Hz split + first-difference for high band
        const alpha = Math.min(0.45, (2 * Math.PI * 650) / sampleRate);

        for (let k = 0; k < frameSize; k++) {
          const s = channelData[offset + k];
          sumSq += s * s;

          if ((s >= 0 && prevSample < 0) || (s < 0 && prevSample >= 0)) {
            zeroCrossings++;
          }

          lowPass = lowPass + alpha * (s - lowPass);
          const highPass = s - prevSample;

          lowEnergy += lowPass * lowPass;
          highEnergy += highPass * highPass;
          prevSample = s;
        }

        const rms = Math.sqrt(sumSq / frameSize);
        const zcr = zeroCrossings / frameSize;
        const totalBand = Math.max(1e-7, sumSq);
        const lowRatio = Math.min(1, lowEnergy / totalBand);
        const highRatio = Math.min(1, highEnergy / totalBand);
        const midRatio = Math.max(0, 1 - Math.min(1, lowRatio * 0.6 + highRatio * 0.6));

        let pitch = 0;
        let clarity = 0;
        if (detector && offset + pitchSize <= channelData.length && rms > 0.004) {
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
          lowRatio,
          midRatio,
          highRatio,
          pitch,
          clarity
        });
      }

      if (rawFrames.length === 0) return empty;

      const sortedRms = rawFrames.map((f) => f.rms).sort((a, b) => a - b);
      const noiseFloor = sortedRms[Math.floor(sortedRms.length * 0.20)] || 0.001;
      const peakRms = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.02;

      const voiceThreshold = Math.max(
        0.0055,
        Math.min(0.024, noiseFloor * 2.6, peakRms * 0.20)
      );

      let firstActive = -1;
      let lastActive = -1;
      let activeCount = 0;
      let bursts = 0;
      let inBurst = false;
      let silenceRun = 0;

      rawFrames.forEach((f, idx) => {
        const isVoicedOrConsonant =
          f.rms >= voiceThreshold || (f.rms >= voiceThreshold * 0.7 && f.zcr > 0.22);
        f.active = isVoicedOrConsonant;

        if (isVoicedOrConsonant) {
          activeCount++;
          if (firstActive === -1) firstActive = idx;
          lastActive = idx;
          silenceRun = 0;
          if (!inBurst) {
            inBurst = true;
            bursts++;
          }
        } else {
          silenceRun++;
          if (silenceRun >= 2) {
            inBurst = false;
          }
        }
      });

      if (firstActive === -1 || activeCount < 2) return empty;

      // Trim leading and trailing silence so teacher and student timelines align on actual speech
      const trimmedFrames = rawFrames.slice(firstActive, lastActive + 1).map((f) => ({
        ...f,
        normEnergy: Math.min(1, f.rms / Math.max(0.01, peakRms))
      }));

      // Count distinct syllable nuclei peaks
      let syllablePeaks = 0;
      let lastPeak = -4;
      for (let i = 1; i < trimmedFrames.length - 1; i++) {
        const cur = trimmedFrames[i];
        if (
          cur.active &&
          cur.normEnergy >= 0.22 &&
          cur.rms >= trimmedFrames[i - 1].rms &&
          cur.rms >= trimmedFrames[i + 1].rms &&
          i - lastPeak >= 3
        ) {
          syllablePeaks++;
          lastPeak = i;
        }
      }

      const validPitches = trimmedFrames.filter((f) => f.clarity >= 0.55 && f.pitch > 0);
      let pitchVariance = 0;
      if (validPitches.length > 1) {
        const meanP = validPitches.reduce((s, f) => s + f.pitch, 0) / validPitches.length;
        const varP =
          validPitches.reduce((s, f) => s + Math.pow(f.pitch - meanP, 2), 0) /
          validPitches.length;
        pitchVariance = Math.sqrt(varP);
      } else if (activeCount >= 4) {
        pitchVariance = 14;
      }

      const avgClarity =
        validPitches.length > 0
          ? validPitches.reduce((s, f) => s + f.clarity, 0) / validPitches.length
          : 0.50;

      return {
        valid: true,
        voicedSec: activeCount * 0.03,
        speakingSpanSec: trimmedFrames.length * 0.03,
        burstCount: bursts,
        syllablePeaks: Math.max(bursts, syllablePeaks),
        pitchVariance,
        avgClarity,
        frames: trimmedFrames
      };
    } catch (e) {
      console.warn("DSP Audio decode warning:", e);
      return empty;
    } finally {
      if (tempCtx && tempCtx.state !== 'closed') {
        try { tempCtx.close(); } catch (e) {}
      }
    }
  };

  // Pre-decode and cache teacher reference audio features for fast DTW comparison
  useEffect(() => {
    let cancelled = false;
    if (audioUrl && audioUrl !== cachedTeacherUrlRef.current) {
      extractBufferDSPFeatures(audioUrl).then((features) => {
        if (!cancelled && features.valid) {
          teacherAudioFeaturesRef.current = features;
          cachedTeacherUrlRef.current = audioUrl;
        }
      });
    } else if (!audioUrl) {
      teacherAudioFeaturesRef.current = null;
      cachedTeacherUrlRef.current = '';
    }
    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  // Speaker-independent Dynamic Time Warping (DTW) similarity between two frame slices (0 - 100)
  const computeSliceDTWSimilarity = (teacherSlice = [], studentSlice = []) => {
    if (!teacherSlice.length || !studentSlice.length) return null;

    const N = teacherSlice.length;
    const M = studentSlice.length;
    const dtw = Array.from({ length: N + 1 }, () => Array(M + 1).fill(Infinity));
    dtw[0][0] = 0;

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const tf = teacherSlice[i - 1];
        const sf = studentSlice[j - 1];

        // Speaker-independent articulatory distance (ZCR + 3 spectral formant bands + energy contour + voicing)
        const dist =
          Math.abs(tf.zcr - sf.zcr) * 1.8 +
          Math.abs(tf.lowRatio - sf.lowRatio) * 0.9 +
          Math.abs(tf.midRatio - sf.midRatio) * 1.0 +
          Math.abs(tf.highRatio - sf.highRatio) * 1.4 +
          Math.abs(tf.normEnergy - sf.normEnergy) * 0.7 +
          Math.abs((tf.clarity > 0.5 ? 1 : 0) - (sf.clarity > 0.5 ? 1 : 0)) * 0.4;

        dtw[i][j] = dist + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      }
    }

    const avgStepDist = dtw[N][M] / (N + M);
    // Map distance [0.10 .. 0.75] -> similarity score [100 .. 35]
    const similarity = Math.max(0, Math.min(100, Math.round(112 - avgStepDist * 115)));
    return similarity;
  };

  // Evaluates the acoustic quality of a specific word slice in the student's recording (0 - 100)
  const evaluateWordAcousticSlice = (word, wordIdx, totalWords, studentDSP, teacherDSP) => {
    if (!studentDSP || !studentDSP.valid || !studentDSP.frames.length) return 55;

    const sFrames = studentDSP.frames;
    const startIdx = Math.floor((wordIdx / totalWords) * sFrames.length);
    const endIdx = Math.max(
      startIdx + 1,
      Math.floor(((wordIdx + 1) / totalWords) * sFrames.length)
    );
    const studentSlice = sFrames.slice(startIdx, endIdx);

    if (!studentSlice.length) return 40;

    const activeFrames = studentSlice.filter((f) => f.active);
    const activityRatio = activeFrames.length / studentSlice.length;
    if (activityRatio < 0.15) return 25; // Almost silent in this word's slot

    const voicedFrames = studentSlice.filter((f) => f.clarity >= 0.50);
    const localClarity =
      voicedFrames.length > 0
        ? voicedFrames.reduce((s, f) => s + f.clarity, 0) / voicedFrames.length
        : studentDSP.avgClarity * 0.85;

    const maxZcr = Math.max(...studentSlice.map((f) => f.zcr));
    const maxHighBand = Math.max(...studentSlice.map((f) => f.highRatio));

    const traits = getExpectedArticulatoryTraits(word);
    let articulatoryScore = Math.min(100, Math.round((localClarity / 0.82) * 92));

    // If the target word has strong sibilants/fricatives (like "spell", "six", "see", "c", "s"),
    // verify that the student's audio slice actually contains high-frequency fricative energy
    if (traits.hasSibilant) {
      if (maxZcr >= 0.14 || maxHighBand >= 0.25) {
        articulatoryScore = Math.min(100, articulatoryScore + 6);
      } else {
        articulatoryScore = Math.max(35, articulatoryScore - 18);
      }
    }

    // If Teacher Reference Audio DSP is available, compute direct DTW spectral similarity
    if (teacherDSP && teacherDSP.valid && teacherDSP.frames.length >= totalWords) {
      const tFrames = teacherDSP.frames;
      const tStart = Math.floor((wordIdx / totalWords) * tFrames.length);
      const tEnd = Math.max(
        tStart + 1,
        Math.floor(((wordIdx + 1) / totalWords) * tFrames.length)
      );
      const teacherSlice = tFrames.slice(tStart, tEnd);
      const dtwSim = computeSliceDTWSimilarity(teacherSlice, studentSlice);

      if (dtwSim !== null) {
        return Math.round(articulatoryScore * 0.55 + dtwSim * 0.45);
      }
    }

    return articulatoryScore;
  };

  // ============================================================================
  // 3. SPEECH RECOGNITION LIFECYCLE (ANDROID-SAFE INITIALIZATION)
  // ============================================================================

  const createSpeechRecognitionInstance = () => {
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
    recognition.maxAlternatives = 5;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const resultItems = [];
      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        const alts = [];
        for (let a = 0; a < res.length; a++) {
          const text = (res[a].transcript || '').trim();
          const conf =
            typeof res[a].confidence === 'number' && res[a].confidence > 0
              ? res[a].confidence
              : 0.86;
          if (text) {
            alts.push({ transcript: text, confidence: conf });
          }
        }
        if (alts.length > 0) {
          resultItems.push({
            bestTranscript: alts[0].transcript,
            confidence: alts[0].confidence,
            alternatives: alts
          });
        }
      }
      if (resultItems.length > 0) {
        currentSegmentRef.current = resultItems;
      }
    };

    recognition.onerror = () => {};

    recognition.onend = () => {
      if (currentSegmentRef.current && currentSegmentRef.current.length > 0) {
        committedSegmentsRef.current.push(...currentSegmentRef.current);
        currentSegmentRef.current = null;
      }

      // If still recording, create a brand-new SpeechRecognition instance so Android never stays stuck
      if (isRecordingRef.current) {
        sttStartTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            const freshRec = createSpeechRecognitionInstance();
            if (freshRec) {
              try { freshRec.start(); } catch (e) {}
            }
          }
        }, 90);
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
    clearTimeout(sttStartTimerRef.current);
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
      clearTimeout(sttStartTimerRef.current);
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
  // 4. HONEST TOKEN NORMALIZER & SEQUENCE ALIGNMENT ENGINE
  // ============================================================================

  // Converts a raw transcript string into normalized content tokens WITHOUT ever forging target words
  const tokenizeTranscriptString = (rawString, cleanTargets, defaultConfidence = 0.86) => {
    if (!rawString || !rawString.trim()) return [];

    const hasDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));
    const hasSingleLetters = cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

    let text = rawString.toLowerCase();
    text = text.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

    // Expand contractions when the target text uses the expanded form (or vice versa)
    const rawWords = text.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(Boolean);
    const expandedContractions = [];
    for (const w of rawWords) {
      if (
        WORD_EQUIVALENTS[w] &&
        !cleanTargets.includes(w) &&
        cleanTargets.includes(WORD_EQUIVALENTS[w][0])
      ) {
        expandedContractions.push(...WORD_EQUIVALENTS[w]);
      } else {
        expandedContractions.push(w);
      }
    }
    text = expandedContractions.join(' ');

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

      const tokensAfterDigits = [];
      for (const tok of text.split(/\s+/).filter(Boolean)) {
        const clean = tok.replace(/[^\w]/gi, '');
        if (EXACT_NUMBER_WORDS[clean] !== undefined) {
          const dStr = EXACT_NUMBER_WORDS[clean];
          if (hasSingleDigits && dStr.length > 1) {
            dStr.split('').forEach((d) =>
              tokensAfterDigits.push({ token: d, confidence: defaultConfidence, approx: false })
            );
          } else {
            tokensAfterDigits.push({ token: dStr, confidence: defaultConfidence, approx: false });
          }
        } else if (CLOSE_NUMBER_HOMOPHONES[clean] !== undefined) {
          tokensAfterDigits.push({
            token: CLOSE_NUMBER_HOMOPHONES[clean],
            confidence: Math.min(defaultConfidence, 0.74),
            approx: true
          });
        } else if (hasSingleDigits && /^\d+$/.test(clean) && clean.length > 1) {
          clean.split('').forEach((d) =>
            tokensAfterDigits.push({ token: d, confidence: defaultConfidence, approx: false })
          );
        } else if (clean && !SCRIPT_FILLERS.has(clean)) {
          tokensAfterDigits.push({ token: clean, confidence: defaultConfidence, approx: false });
        }
      }

      if (!hasSingleLetters) return tokensAfterDigits;
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
          // Split the actual spoken word into its own individual letters (e.g., "ribera" -> r, i, b, e, r, a)
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

  // Scores a single target token against a single spoken token object
  const scoreTokenPairLexical = (tWord, sObj) => {
    if (!sObj || !sObj.token) return { lexicalScore: 0, matchType: 'Omission' };

    const sWord = sObj.token;
    const isApproxHomophone = sObj.approx;

    // 1. Single Digit Target (0-9)
    if (/^\d+$/.test(tWord)) {
      if (tWord === sWord) {
        return {
          lexicalScore: isApproxHomophone ? levelProfile.closeLetterScore || 72 : 100,
          matchType: isApproxHomophone ? 'Close' : 'Exact'
        };
      }
      return { lexicalScore: 0, matchType: 'Mismatch' };
    }

    // 2. Single Spelled Letter Target (a-z)
    if (tWord.length === 1 && /[a-z]/.test(tWord)) {
      const mapped = LETTER_PHONETICS[sWord] || sWord;
      if (tWord === mapped) {
        return { lexicalScore: 100, matchType: 'Exact' };
      }
      if (
        levelProfile.closeLetterScore > 0 &&
        CLOSE_PHONETIC_LETTERS[tWord] &&
        CLOSE_PHONETIC_LETTERS[tWord].includes(mapped)
      ) {
        return { lexicalScore: levelProfile.closeLetterScore, matchType: 'Close' };
      }
      return { lexicalScore: 0, matchType: 'Mismatch' };
    }

    // 3. Multi-Character Word Target
    if (tWord === sWord) {
      return { lexicalScore: 100, matchType: 'Exact' };
    }

    // Check contraction / word equivalence (e.g. "okay" === "ok")
    if (WORD_EQUIVALENTS[tWord] && WORD_EQUIVALENTS[tWord].join('') === sWord) {
      return { lexicalScore: 100, matchType: 'Exact' };
    }

    const dist = getEditDistance(tWord, sWord);
    const maxLen = Math.max(tWord.length, sWord.length);
    const editRatio = dist / maxLen;

    const tSkel = getPhoneticSkeleton(tWord);
    const sSkel = getPhoneticSkeleton(sWord);

    // Check phonetic skeleton match (only if editRatio <= 0.45 so "spell" and "repeat" NEVER match)
    if (tSkel && sSkel && tSkel === sSkel && editRatio <= 0.45) {
      const pScore =
        dist === 1
          ? Math.min(90, levelProfile.phoneticMatchScore + 4)
          : levelProfile.phoneticMatchScore;
      return { lexicalScore: pScore, matchType: 'Phonetic' };
    }

    // Check bounded Levenshtein typo/accent tolerance scaled by CEFR level
    const allowedEdits =
      tWord.length > 4
        ? levelProfile.maxAllowedEditDistLong
        : levelProfile.maxAllowedEditDistShort;

    // Require first letter or phonetic onset to agree on short words so "cat" vs "bat" or "spell" vs "tell" is penalized
    const onsetAgrees =
      tWord[0] === sWord[0] ||
      tSkel[0] === sSkel[0] ||
      (CLOSE_PHONETIC_LETTERS[tWord[0]] && CLOSE_PHONETIC_LETTERS[tWord[0]].includes(sWord[0]));

    if (dist <= allowedEdits && editRatio <= 0.45 && (onsetAgrees || tWord.length >= 5)) {
      const eScore = Math.max(55, 100 - dist * levelProfile.editPenalty);
      return { lexicalScore: eScore, matchType: 'Close' };
    }

    return { lexicalScore: 0, matchType: 'Mismatch' };
  };

  // Aligns a candidate list of spoken tokens against target content tokens via Needleman-Wunsch DP
  const alignTokenSequence = (targetContentTokens, spokenTokenObjs) => {
    const N = targetContentTokens.length;
    const M = spokenTokenObjs.length;
    const GAP_PENALTY = -10;

    const dp = Array.from({ length: N + 1 }, () => Array(M + 1).fill(0));
    const ptr = Array.from({ length: N + 1 }, () => Array(M + 1).fill(''));

    for (let i = 1; i <= N; i++) {
      dp[i][0] = i * GAP_PENALTY;
      ptr[i][0] = 'UP';
    }
    for (let j = 1; j <= M; j++) {
      dp[0][j] = j * GAP_PENALTY;
      ptr[0][j] = 'LEFT';
    }

    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M; j++) {
        const { lexicalScore } = scoreTokenPairLexical(
          targetContentTokens[i - 1],
          spokenTokenObjs[j - 1]
        );
        const weight = lexicalScore > 0 ? lexicalScore : -12;

        const diag = dp[i - 1][j - 1] + weight;
        const up = dp[i - 1][j] + GAP_PENALTY;
        const left = dp[i][j - 1] + GAP_PENALTY;

        if (diag >= up && diag >= left) {
          dp[i][j] = diag;
          ptr[i][j] = 'DIAG';
        } else if (up >= left) {
          dp[i][j] = up;
          ptr[i][j] = 'UP';
        } else {
          dp[i][j] = left;
          ptr[i][j] = 'LEFT';
        }
      }
    }

    const slotMatches = new Array(N).fill(null);
    let ci = N;
    let cj = M;

    while (ci > 0 || cj > 0) {
      if (ci > 0 && cj > 0 && ptr[ci][cj] === 'DIAG') {
        const sObj = spokenTokenObjs[cj - 1];
        const lex = scoreTokenPairLexical(targetContentTokens[ci - 1], sObj);
        slotMatches[ci - 1] = {
          spokenToken: sObj.token,
          confidence: sObj.confidence,
          lexicalScore: lex.lexicalScore,
          matchType: lex.matchType
        };
        ci--;
        cj--;
      } else if (ci > 0 && (cj === 0 || ptr[ci][cj] === 'UP')) {
        slotMatches[ci - 1] = {
          spokenToken: '',
          confidence: 0,
          lexicalScore: 0,
          matchType: 'Omission'
        };
        ci--;
      } else {
        cj--;
      }
    }

    const totalLexical = slotMatches.reduce((s, m) => s + (m ? m.lexicalScore : 0), 0);
    return { slotMatches, totalLexical };
  };

  // ============================================================================
  // 5. RECORDING, PLAYBACK & HYBRID GRADING WORKFLOW
  // ============================================================================

  const trackPitchLive = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    const analyser = analyserRef.current;
    const detector = PitchDetector.forFloat32Array(analyser.fftSize);
    const inputBuffer = new Float32Array(detector.inputLength);

    let lastTime = 0;
    const update = (time) => {
      if (time - lastTime > 45 && audioCtxRef.current && audioCtxRef.current.state === 'running') {
        analyser.getFloatTimeDomainData(inputBuffer);

        let sumSquares = 0;
        for (let i = 0; i < inputBuffer.length; i++) {
          sumSquares += inputBuffer[i] * inputBuffer[i];
        }
        const rms = Math.sqrt(sumSquares / inputBuffer.length);

        const [pitch, clarity] = detector.findPitch(inputBuffer, audioCtxRef.current.sampleRate);
        if (clarity > 0.55 && pitch > 55 && pitch < 550 && rms > 0.005) {
          pitchValuesRef.current.push(pitch);
          activeVoiceFramesRef.current += 1;
        }

        lastTime = time;
      }
      if (isRecordingRef.current) {
        animationFrameRef.current = requestAnimationFrame(update);
      }
    };

    animationFrameRef.current = requestAnimationFrame(update);
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

  // Step 2: Start Recording (Acquires getUserMedia FIRST, then starts SpeechRecognition 150ms later)
  const startRecording = async () => {
    try {
      stopCurrentAudio();
      clearTimeout(sttStartTimerRef.current);

      audioChunksRef.current = [];
      pitchValuesRef.current = [];
      activeVoiceFramesRef.current = 0;

      committedSegmentsRef.current = [];
      currentSegmentRef.current = null;
      speechFlushedRef.current = false;
      isRecordingRef.current = true;

      // 1. Open hardware mic stream FIRST using native device sample rate (prevents Android HAL reset)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      activeStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      } else if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 1024;

      // Connect through a 0-gain node so Android Chrome keeps pulling audio frames
      const silentGain = audioCtxRef.current.createGain();
      silentGain.gain.value = 0;
      source.connect(analyser);
      analyser.connect(silentGain);
      silentGain.connect(audioCtxRef.current.destination);

      analyserRef.current = analyser;
      trackPitchLive();

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

        // Release getUserMedia hardware immediately so SpeechRecognition can flush uncontested
        stream.getTracks().forEach((track) => track.stop());
        if (activeStreamRef.current === stream) {
          activeStreamRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          try { audioCtxRef.current.close(); } catch (e) {}
          audioCtxRef.current = null;
        }

        // Let SpeechRecognition flush its final cloud packet for 650ms after mic release, then stop it
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
        }, 650);

        runPlaybackReview(url, audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();
      setPhase('recording');

      // 2. Start a fresh SpeechRecognition instance 150ms AFTER getUserMedia is stable
      sttStartTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current) {
          const rec = createSpeechRecognitionInstance();
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
    clearTimeout(sttStartTimerRef.current);
    cancelAnimationFrame(animationFrameRef.current);

    setPhase('playing_review');

    // Allow a 200ms tail buffer so the final consonant of the student's speech isn't clipped
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    }, 200);
  };

  // Strictly sequential single-audio player: guarantees Teacher Audio finishes before Student Audio starts
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

  // Step 4: "Comparing..." (Plays Teacher Sample -> 350ms gap -> Student Recording, while grading)
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

  // Step 5: Thorough 3-Layer Hybrid Grading Engine
  const executeGrading = async (audioBlob) => {
    // Wait up to 1,100ms for SpeechRecognition to finish flushing after MediaRecorder stops
    let waitTicks = 11;
    while (!speechFlushedRef.current && waitTicks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitTicks--;
    }

    if (currentSegmentRef.current && currentSegmentRef.current.length > 0) {
      committedSegmentsRef.current.push(...currentSegmentRef.current);
      currentSegmentRef.current = null;
    }

    // Decode student's recorded audio & ensure teacher audio DSP is ready
    const [studentDSP, teacherDSP] = await Promise.all([
      extractBufferDSPFeatures(audioBlob),
      teacherAudioFeaturesRef.current
        ? Promise.resolve(teacherAudioFeaturesRef.current)
        : audioUrl
        ? extractBufferDSPFeatures(audioUrl)
        : Promise.resolve(null)
    ]);

    if (teacherDSP && teacherDSP.valid && !teacherAudioFeaturesRef.current) {
      teacherAudioFeaturesRef.current = teacherDSP;
      cachedTeacherUrlRef.current = audioUrl;
    }

    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current - 200) / 1000);

    const livePitches = pitchValuesRef.current;
    let pitchVariance = studentDSP.pitchVariance;
    if (livePitches.length > 1) {
      const mean = livePitches.reduce((a, b) => a + b, 0) / livePitches.length;
      const variance =
        livePitches.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / livePitches.length;
      pitchVariance = Math.max(pitchVariance, Math.sqrt(variance));
    }

    const cleanRawTargets = wordsList.map((w) => w.toLowerCase().replace(/[^\w\s]/gi, ''));
    const targetContentIndices = [];
    const targetContentTokens = [];

    cleanRawTargets.forEach((tWord, idx) => {
      if (tWord && !SCRIPT_FILLERS.has(tWord)) {
        targetContentIndices.push(idx);
        targetContentTokens.push(tWord);
      }
    });

    // Build candidate token streams across the STT alternatives (up to 5 alternatives)
    const allSegments = committedSegmentsRef.current;
    const hasSttSegments = allSegments.length > 0;

    let bestAlignment = null;
    let bestTranscriptForServer = '';

    if (hasSttSegments && targetContentTokens.length > 0) {
      for (let altIdx = 0; altIdx < 5; altIdx++) {
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
          const alignment = alignTokenSequence(targetContentTokens, candidateObjs);
          if (!bestAlignment || alignment.totalLexical > bestAlignment.totalLexical) {
            bestAlignment = alignment;
            bestTranscriptForServer = candidateObjs.map((o) => o.token).join(' ');
          }
        }
      }
    }

    const voicedSec = Math.max(studentDSP.voicedSec, activeVoiceFramesRef.current * 0.045);
    const hasRealVoice =
      (studentDSP.valid && voicedSec >= 0.20) ||
      (bestAlignment && bestAlignment.totalLexical > 0);

    // Compute honest word-by-word hybrid scores (Lexical + STT Confidence + Acoustic DTW/Articulation)
    const localWordLevelData = [];
    let totalHybridScore = 0;
    let matchedContentCount = 0;
    let hardMismatchCount = 0;
    const totalContentWords = targetContentTokens.length;

    if (!hasRealVoice || durationSec < 0.35 || totalContentWords === 0) {
      wordsList.forEach((rawWord) => {
        localWordLevelData.push({ word: rawWord, score: 0, error_type: 'Omission' });
      });
    } else {
      // Determine how many content tokens were acoustically vocalized if STT was blocked by the OS
      const expectedTotalSyllables = targetContentTokens.reduce(
        (s, w) => s + getExpectedArticulatoryTraits(w).syllables,
        0
      );
      const syllableCoverageRatio = Math.min(
        1,
        studentDSP.syllablePeaks / Math.max(1, expectedTotalSyllables * 0.85)
      );
      const acousticSpokenCount = Math.round(totalContentWords * syllableCoverageRatio);

      // Map content indices for quick lookup
      const contentSlotResults = {};

      for (let cIdx = 0; cIdx < totalContentWords; cIdx++) {
        const targetTok = targetContentTokens[cIdx];
        const origWordIdx = targetContentIndices[cIdx];

        const acousticSliceScore = evaluateWordAcousticSlice(
          targetTok,
          cIdx,
          totalContentWords,
          studentDSP,
          teacherDSP
        );

        let finalWordScore = 0;
        let errorType = 'Omission';

        if (bestAlignment && bestAlignment.slotMatches[cIdx]) {
          const match = bestAlignment.slotMatches[cIdx];

          if (match.matchType === 'Omission') {
            // Check if Android cut off STT mid-spelling/number sequence while user kept speaking clearly
            const sttCapturedCount = bestAlignment.slotMatches.filter(
              (m) => m && m.matchType !== 'Omission'
            ).length;
            const isSpellingOrNumberSeq = targetTok.length === 1 || /^\d+$/.test(targetTok);

            if (
              isSpellingOrNumberSeq &&
              sttCapturedCount > 0 &&
              sttCapturedCount <= Math.ceil(totalContentWords * 0.4) &&
              cIdx < acousticSpokenCount &&
              acousticSliceScore >= 68
            ) {
              finalWordScore = Math.min(84, acousticSliceScore);
              errorType = finalWordScore >= levelProfile.wordApprove ? 'None' : 'Mispronunciation';
            } else {
              finalWordScore = 0;
              errorType = 'Omission';
            }
          } else if (match.lexicalScore === 0 || match.matchType === 'Mismatch') {
            // HARD GATE: The student said a different word/letter (e.g. "repeat" instead of "spell")
            // Never allow acoustic energy to turn a wrong word into a pass!
            finalWordScore = 0;
            errorType = 'Mispronunciation';
            hardMismatchCount++;
          } else {
            // Student said the target word or a close phonetic variant:
            // Blend Lexical Accuracy + Browser STT Confidence + Acoustic Pronunciation Quality
            const conf = match.confidence || 0.85;
            const confidenceScore = Math.min(
              100,
              Math.round((conf / Math.max(0.5, levelProfile.minConfidence)) * 88)
            );

            const pronunciationQuality = Math.round(
              acousticSliceScore * 0.60 + confidenceScore * 0.40
            );

            finalWordScore = Math.round(
              match.lexicalScore * levelProfile.lexicalWeight +
                pronunciationQuality * levelProfile.acousticWeight
            );

            // If it was a non-exact phonetic/accent match, cap at 84% so it shows Yellow or modest Green
            if (match.matchType !== 'Exact') {
              finalWordScore = Math.min(82, finalWordScore);
            }

            // If acoustic clarity or STT confidence was poor (butchered pronunciation), pull score down honestly
            if (acousticSliceScore < 52 || conf < levelProfile.minConfidence - 0.12) {
              finalWordScore = Math.min(68, finalWordScore);
            }

            errorType =
              finalWordScore >= levelProfile.wordApprove ? 'None' : 'Mispronunciation';
          }
        } else {
          // Emergency fallback ONLY when the mobile OS completely blocked SpeechRecognition (0 STT segments)
          if (cIdx < acousticSpokenCount && acousticSliceScore >= 58) {
            // Score strictly by Teacher-vs-Student DTW & articulatory feature match (never automatic 100%)
            finalWordScore = Math.min(85, acousticSliceScore);
            errorType =
              finalWordScore >= levelProfile.wordApprove ? 'None' : 'Mispronunciation';
          } else {
            finalWordScore = 0;
            errorType = cIdx < acousticSpokenCount ? 'Mispronunciation' : 'Omission';
            if (errorType === 'Mispronunciation') hardMismatchCount++;
          }
        }

        contentSlotResults[origWordIdx] = { score: finalWordScore, error_type: errorType };
        totalHybridScore += finalWordScore;
        if (finalWordScore >= levelProfile.minWordPass) {
          matchedContentCount++;
        }
      }

      wordsList.forEach((rawWord, idx) => {
        const cleanT = cleanRawTargets[idx];
        if (!cleanT || SCRIPT_FILLERS.has(cleanT)) {
          localWordLevelData.push({ word: rawWord, score: 100, error_type: 'None' });
        } else {
          const res = contentSlotResults[idx] || { score: 0, error_type: 'Omission' };
          localWordLevelData.push({
            word: rawWord,
            score: res.score,
            error_type: res.error_type
          });
        }
      });
    }

    // Build an honest transcript string for the Supabase Edge Function that reflects actual performance
    const serverTranscriptTokens = [];
    wordsList.forEach((rawWord, idx) => {
      const cleanT = cleanRawTargets[idx];
      if (!cleanT || SCRIPT_FILLERS.has(cleanT)) return;
      const wData = localWordLevelData[idx];
      if (!wData || wData.error_type === 'Omission') return;
      if (wData.score === 0) {
        serverTranscriptTokens.push('wrong_' + idx);
      } else if (wData.score < levelProfile.wordApprove && cleanT.length > 2) {
        serverTranscriptTokens.push(cleanT.slice(0, -1));
      } else {
        serverTranscriptTokens.push(cleanT);
      }
    });

    const transcriptPayload =
      bestTranscriptForServer || serverTranscriptTokens.join(' ');

    // Compute Local CEFR-Weighted Overall Score
    let localOverallScore = 0;
    let localPassed = false;

    if (hasRealVoice && totalContentWords > 0) {
      const accuracyScore = totalHybridScore / totalContentWords;
      const completenessScore = (matchedContentCount / totalContentWords) * 100;
      const rawProsody = pitchVariance > 12 ? 100 : Math.max(45, pitchVariance * 6);
      const prosodyScore = rawProsody * (completenessScore / 100);

      localOverallScore =
        accuracyScore * levelProfile.wAccuracy +
        completenessScore * levelProfile.wCompleteness +
        prosodyScore * levelProfile.wProsody;

      // Apply a direct penalty if the student substituted/missed core content words
      if (hardMismatchCount > 0) {
        const substitutionPenalty = (hardMismatchCount / totalContentWords) * 25;
        localOverallScore = Math.max(0, localOverallScore - substitutionPenalty);
      }

      const coverageRatio = matchedContentCount / totalContentWords;
      localPassed =
        localOverallScore >= levelProfile.passScore &&
        coverageRatio >= levelProfile.minCoverageRatio;
    }

    const isGhost = !hasRealVoice || durationSec < 0.35;

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: transcriptPayload,
          cefr_level: cefrLevel,
          duration_sec: durationSec,
          pitch_variance: pitchVariance,
          attempt_number: attempt,
          is_ghost_attempt: isGhost
        }
      });

      if (error) throw error;

      // Reconcile Server & Local Hybrid evaluation so wrong or butchered words NEVER get a free 100%
      const serverWords = data?.word_level_data || [];
      const mergedWordResults = localWordLevelData.map((localW, idx) => {
        const srvW = serverWords[idx];
        if (!srvW) return localW;

        const cleanT = cleanRawTargets[idx];
        if (!cleanT || SCRIPT_FILLERS.has(cleanT)) {
          return { word: localW.word, score: 100, error_type: 'None' };
        }

        // Take the stricter of the local hybrid score vs. server score when STT is present
        const finalScore = hasSttSegments
          ? Math.min(localW.score, srvW.score ?? localW.score)
          : localW.score;

        let finalErrorType = 'None';
        if (localW.error_type === 'Omission' && finalScore === 0) {
          finalErrorType = 'Omission';
        } else if (finalScore < levelProfile.wordApprove) {
          finalErrorType = 'Mispronunciation';
        }

        return {
          word: localW.word,
          score: finalScore,
          error_type: finalErrorType
        };
      });

      const finalOverallScore = hasSttSegments && typeof data?.overall_score === 'number'
        ? Math.min(localOverallScore, data.overall_score)
        : localOverallScore;

      const passedContentCount = mergedWordResults.filter((w, idx) => {
        const cleanT = cleanRawTargets[idx];
        return cleanT && !SCRIPT_FILLERS.has(cleanT) && w.score >= levelProfile.minWordPass;
      }).length;

      const finalCoverage =
        totalContentWords > 0 ? passedContentCount / totalContentWords : 0;

      const finalPassed =
        finalOverallScore >= levelProfile.passScore &&
        finalCoverage >= levelProfile.minCoverageRatio;

      setOverallScore(finalOverallScore);
      setWordResults(mergedWordResults);

      const newFailed = new Set();
      mergedWordResults.forEach((w, idx) => {
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
          const finalYield = isGhost ? 0 : 50;
          setPointsAwarded(finalYield);
          setCanContinue(true);
        } else {
          setCanContinue(false);
        }
      }
    } catch (err) {
      console.error("Server grading invocation fallback to local hybrid engine:", err);
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
            if (res.error_type === 'Omission') {
              return <span key={idx} className="text-slate-500 line-through opacity-40">{word}</span>;
            }
            if (res.score >= levelProfile.wordApprove) {
              return <span key={idx} className="text-emerald-400 font-bold">{word}</span>;
            }
            if (res.score >= levelProfile.minWordPass) {
              return <span key={idx} className="text-[#fcd34d] font-bold">{word}</span>;
            }
            return <span key={idx} className="text-red-500 font-bold">{word}</span>;
          }

          const isTargeted = failedIndices.has(idx);

          if (attempt === 2 && isTargeted) {
            return <span key={idx} className="font-black underline text-white">{word}</span>;
          }

          if (attempt === 3 && isTargeted) {
            return <span key={idx} className="font-black underline text-[#fcd34d] drop-shadow-[0_0_10px_rgba(252,211,77,0.8)] animate-pulse">{word}</span>;
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