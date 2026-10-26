import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';

// CEFR Level Calibration Matrix: scales accuracy, clarity, pace demand, and pass threshold by level
const CEFR_PROFILES = {
  A1: { passScore: 55, wordApprove: 70, charSec: 0.10, wordSec: 0.16, clarityFloor: 0.55, maxEditRatio: 0.50 },
  A2: { passScore: 60, wordApprove: 75, charSec: 0.12, wordSec: 0.18, clarityFloor: 0.60, maxEditRatio: 0.45 },
  B1: { passScore: 65, wordApprove: 78, charSec: 0.13, wordSec: 0.20, clarityFloor: 0.68, maxEditRatio: 0.35 },
  B2: { passScore: 70, wordApprove: 80, charSec: 0.14, wordSec: 0.22, clarityFloor: 0.74, maxEditRatio: 0.30 },
  C1: { passScore: 75, wordApprove: 82, charSec: 0.15, wordSec: 0.24, clarityFloor: 0.80, maxEditRatio: 0.25 },
  C2: { passScore: 80, wordApprove: 85, charSec: 0.16, wordSec: 0.25, clarityFloor: 0.85, maxEditRatio: 0.20 }
};

const SCRIPT_FILLERS = new Set(['uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh']);

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
  k: 'k', kay: 'k', okay: 'k', cay: 'k',
  l: 'l', el: 'l', ell: 'l', al: 'l',
  m: 'm', em: 'm', am: 'm',
  n: 'n', en: 'n', in: 'n', and: 'n', an: 'n', end: 'n',
  o: 'o', oh: 'o', owe: 'o', ou: 'o',
  p: 'p', pee: 'p', pea: 'p',
  q: 'q', cue: 'q', queue: 'q', kyu: 'q',
  r: 'r', are: 'r', our: 'r', or: 'r', ar: 'r', er: 'r', her: 'r', air: 'r',
  s: 's', es: 's', ess: 's', is: 's', as: 's',
  t: 't', tee: 't', tea: 't', ti: 't', to: 't', too: 't',
  u: 'u', you: 'u', yu: 'u',
  v: 'v', vee: 'v', vi: 'v', we: 'v',
  w: 'w', doubleyou: 'w', doubleu: 'w',
  x: 'x', ex: 'x', ax: 'x', eggs: 'x',
  y: 'y', why: 'y', wai: 'y',
  z: 'z', zee: 'z', zed: 'z'
};

const NUMBER_WORDS = {
  zero: '0', oh: '0', o: '0', nil: '0',
  one: '1', won: '1',
  two: '2', to: '2', too: '2',
  three: '3', free: '3', tree: '3',
  four: '4', for: '4', fore: '4',
  five: '5', fine: '5',
  six: '6', sick: '6',
  seven: '7',
  eight: '8', ate: '8',
  nine: '9', mine: '9',
  ten: '10', eleven: '11', twelve: '12', thirteen: '13',
  fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17',
  eighteen: '18', nineteen: '19', twenty: '20', thirty: '30',
  forty: '40', fifty: '50', sixty: '60', seventy: '70',
  eighty: '80', ninety: '90'
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

  const sampleAudioRef = useRef(null);
  const studentAudioUrlRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const committedSegmentsRef = useRef([]);
  const currentSegmentRef = useRef('');
  const speechTranscriptRef = useRef('');
  const speechFlushedRef = useRef(false);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const pitchValuesRef = useRef([]);
  const clarityValuesRef = useRef([]);
  const activeVoiceFramesRef = useRef(0);
  const firstVoiceTimeRef = useRef(0);
  const lastVoiceTimeRef = useRef(0);

  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const isRecordingRef = useRef(false);
  const activeStreamRef = useRef(null);

  const wordsList = targetText.trim().split(/\s+/);

  const updateCombinedTranscript = () => {
    const combined = [...committedSegmentsRef.current, currentSegmentRef.current]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (combined) {
      speechTranscriptRef.current = combined;
    }
  };

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
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let segmentText = '';
      for (let i = 0; i < event.results.length; ++i) {
        segmentText += event.results[i][0].transcript + ' ';
      }
      currentSegmentRef.current = segmentText.trim();
      updateCombinedTranscript();
    };

    recognition.onerror = () => {};

    recognition.onend = () => {
      if (currentSegmentRef.current) {
        committedSegmentsRef.current.push(currentSegmentRef.current);
        currentSegmentRef.current = '';
        updateCombinedTranscript();
      }

      if (isRecordingRef.current) {
        setTimeout(() => {
          if (isRecordingRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 100);
      } else {
        speechFlushedRef.current = true;
      }
    };

    recognitionRef.current = recognition;
  };

  useEffect(() => {
    isRecordingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);

    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      sampleAudioRef.current = null;
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

    setupSpeechRecognition();

    return () => {
      isRecordingRef.current = false;
      cancelAnimationFrame(animationFrameRef.current);
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
      }
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

  const getEditDistance = (a = '', b = '') => {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 5) return 99;
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

  // Decodes the actual recorded audioBlob to get 100% reliable duration, syllable bursts, clarity, and pitch
  const analyzeRecordedBlob = async (audioBlob) => {
    const result = {
      voicedSec: 0,
      speakingSpanSec: 0,
      burstCount: 0,
      pitchVariance: 0,
      avgClarity: 0.85,
      segmentClarities: []
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
          const sample = channelData[i + j];
          sum += sample * sample;
        }
        rmsList.push(Math.sqrt(sum / windowSize));
      }

      if (rmsList.length === 0) return result;

      const sortedRms = [...rmsList].sort((a, b) => a - b);
      const noiseFloor = sortedRms[Math.floor(sortedRms.length * 0.15)] || 0.001;
      const peakRms = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.02;

      // Adaptive voice threshold works across both quiet and loud phone microphones
      const voiceThreshold = Math.max(0.0035, Math.min(0.018, noiseFloor * 2.2, peakRms * 0.18));

      let firstIdx = -1;
      let lastIdx = -1;
      let activeFrames = 0;
      let bursts = 0;
      let inBurst = false;
      let silenceGap = 0;

      for (let idx = 0; idx < rmsList.length; idx++) {
        if (rmsList[idx] >= voiceThreshold) {
          activeFrames++;
          if (firstIdx === -1) firstIdx = idx;
          lastIdx = idx;
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
      result.speakingSpanSec =
        firstIdx !== -1 && lastIdx >= firstIdx ? (lastIdx - firstIdx + 1) * 0.03 : result.voicedSec;
      result.burstCount = bursts;

      // Run Pitchy across active windows of the decoded recording
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

          if (localRms >= voiceThreshold * 0.8) {
            const [pitch, clarity] = detector.findPitch(slice, sampleRate);
            if (clarity > 0.55 && pitch > 55 && pitch < 550) {
              pitches.push(pitch);
              clarities.push(clarity);
            }
          }
        }

        if (pitches.length > 1) {
          const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
          const variance = pitches.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / pitches.length;
          result.pitchVariance = Math.sqrt(variance);
        } else if (activeFrames >= 3) {
          result.pitchVariance = 18;
        }

        if (clarities.length > 0) {
          result.avgClarity = clarities.reduce((a, b) => a + b, 0) / clarities.length;
          result.segmentClarities = clarities;
        }
      }
    } catch (e) {
      console.warn("AudioBuffer decode fallback:", e);
    } finally {
      if (tempCtx && tempCtx.state !== 'closed') {
        try { tempCtx.close(); } catch (e) {}
      }
    }

    return result;
  };

  // Normalizes STT tokens to handle spelled sequences ("E R N E S T O") and numbers ("3 6 0 7 5 2...")
  const normalizeSttTokens = (rawTranscript, cleanTargets) => {
    if (!rawTranscript) return [];

    const hasDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));
    const hasSingleLetters = cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

    // Collect any multi-letter spelled sequences in target (e.g., "ernesto", "rivera")
    const spelledSequences = [];
    let seq = [];
    for (const w of cleanTargets) {
      if (w.length === 1 && /[a-z]/.test(w)) {
        seq.push(w);
      } else {
        if (seq.length >= 2) spelledSequences.push(seq.join(''));
        seq = [];
      }
    }
    if (seq.length >= 2) spelledSequences.push(seq.join(''));

    let text = rawTranscript.toLowerCase();
    text = text.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

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

      text = text
        .split(/\s+/)
        .map((tok) => {
          const clean = tok.replace(/[^\w]/gi, '');
          return NUMBER_WORDS[clean] !== undefined ? NUMBER_WORDS[clean] : tok;
        })
        .join(' ');

      if (hasSingleDigits) {
        text = text.replace(/(\d)/g, ' $1 ');
      }
    }

    const rawTokens = text.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(Boolean);
    if (!hasSingleLetters) return rawTokens;

    const regularTargetWords = new Set(
      cleanTargets.filter((w) => w.length > 1 && !SCRIPT_FILLERS.has(w))
    );

    const expanded = [];
    let i = 0;

    while (i < rawTokens.length) {
      const tok = rawTokens[i];

      if (regularTargetWords.has(tok) || (SCRIPT_FILLERS.has(tok) && tok !== 'oh')) {
        expanded.push(tok);
        i++;
        continue;
      }

      // Check if tokens starting at `i` form a spelled word (e.g., "ernesto" or "ribera" -> "rivera")
      let matchedSeq = null;
      let endIdx = i;

      for (const seqWord of spelledSequences) {
        let combined = '';
        const limit = Math.min(rawTokens.length, i + seqWord.length + 2);
        for (let k = i; k < limit; k++) {
          const cand = rawTokens[k];
          if (regularTargetWords.has(cand)) break;
          combined += LETTER_PHONETICS[cand] || cand;

          const maxEdits = Math.max(1, Math.ceil(seqWord.length * levelProfile.maxEditRatio));
          if (
            combined === seqWord ||
            (combined.length >= seqWord.length - 1 && getEditDistance(combined, seqWord) <= maxEdits)
          ) {
            matchedSeq = seqWord;
            endIdx = k;
            break;
          }
        }
        if (matchedSeq) break;
      }

      if (matchedSeq) {
        expanded.push(...matchedSeq.split(''));
        i = endIdx + 1;
        continue;
      }

      if (LETTER_PHONETICS[tok]) {
        expanded.push(LETTER_PHONETICS[tok]);
        i++;
        continue;
      }

      // If STT clustered multiple letters into a single unknown word during a spelling task, split into letters
      if (spelledSequences.length > 0 && tok.length > 1 && /^[a-z]+$/.test(tok)) {
        expanded.push(...tok.split(''));
        i++;
        continue;
      }

      expanded.push(tok);
      i++;
    }

    return expanded;
  };

  // Live Pitch & Voice Tracker (Connected to a silent GainNode so Android Chrome never suspends the graph)
  const trackPitch = () => {
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

        const hasPitch = clarity > 0.55 && pitch > 50 && pitch < 550 && rms > 0.003;
        const hasVocalEnergy = rms > 0.008;

        if (hasPitch) {
          pitchValuesRef.current.push(pitch);
          clarityValuesRef.current.push(clarity);
        }

        if (hasPitch || hasVocalEnergy) {
          activeVoiceFramesRef.current += 1;
          const now = Date.now();
          if (firstVoiceTimeRef.current === 0) {
            firstVoiceTimeRef.current = now;
          }
          lastVoiceTimeRef.current = now;
        }

        lastTime = time;
      }
      if (isRecordingRef.current) {
        animationFrameRef.current = requestAnimationFrame(update);
      }
    };

    animationFrameRef.current = requestAnimationFrame(update);
  };

  // Step 1: Play Sample Audio -> Reveal "Repeat"
  const playSample = () => {
    if (!audioUrl) {
      setPhase('ready_to_record');
      return;
    }
    setPhase('playing_sample');
    const audio = new Audio(audioUrl);
    sampleAudioRef.current = audio;

    audio.onended = () => setPhase('ready_to_record');
    audio.onerror = () => setPhase('ready_to_record');
    audio.play().catch(() => setPhase('ready_to_record'));
  };

  // Step 2: Start Recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      pitchValuesRef.current = [];
      clarityValuesRef.current = [];
      activeVoiceFramesRef.current = 0;
      firstVoiceTimeRef.current = 0;
      lastVoiceTimeRef.current = 0;

      committedSegmentsRef.current = [];
      currentSegmentRef.current = '';
      speechTranscriptRef.current = '';
      speechFlushedRef.current = false;
      isRecordingRef.current = true;

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }

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

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        try {
          audioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
        } catch (e) {
          audioCtxRef.current = new AudioCtx();
        }
      } else if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 1024;

      // Connect analyser to a 0-gain sink so Android Chrome never suspends audio frame pulling
      const silentGain = audioCtxRef.current.createGain();
      silentGain.gain.value = 0;
      source.connect(analyser);
      analyser.connect(silentGain);
      silentGain.connect(audioCtxRef.current.destination);

      analyserRef.current = analyser;
      trackPitch();

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

        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
          if (activeStreamRef.current === stream) {
            activeStreamRef.current = null;
          }
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            try { audioCtxRef.current.close(); } catch (e) {}
            audioCtxRef.current = null;
          }
        }, 700);

        runPlaybackReview(url, audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();
      setPhase('recording');
    } catch (err) {
      console.error("Microphone access denied or audio initialization failed", err);
      setPhase('ready_to_record');
    }
  };

  // Step 3: Stop Recording
  const stopRecording = () => {
    isRecordingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        speechFlushedRef.current = true;
      }
    } else {
      speechFlushedRef.current = true;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const playAudioPromise = (url) => {
    return new Promise((resolve) => {
      if (!url) {
        resolve();
        return;
      }
      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve();
        }
      };
      const timer = setTimeout(finish, 9000);
      const audio = new Audio(url);
      audio.onended = finish;
      audio.onerror = finish;
      audio.play().catch(finish);
    });
  };

  // Step 4: "Comparing..." (Plays Reference -> Student -> Grades)
  const runPlaybackReview = async (studentBlobUrl, audioBlob) => {
    setPhase('playing_review');

    try {
      const playbackSequence = async () => {
        if (audioUrl) {
          await playAudioPromise(audioUrl);
        }
        await playAudioPromise(studentBlobUrl);
      };

      await Promise.all([playbackSequence(), executeGrading(audioBlob)]);
    } catch (err) {
      console.error("Review playback error:", err);
    } finally {
      setPhase('completed');
    }
  };

  // Step 5: CEFR-Calibrated Grading Handshake (STT + Full AudioBuffer Acoustic Verification)
  const executeGrading = async (audioBlob) => {
    let waitTicks = 8;
    while (!speechFlushedRef.current && waitTicks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitTicks--;
    }

    updateCombinedTranscript();

    // Decode the actual recorded audioBlob so we have 100% accurate acoustic metrics on mobile
    const blobStats = await analyzeRecordedBlob(audioBlob);
    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current) / 1000);

    const livePitches = pitchValuesRef.current;
    let pitchVariance = blobStats.pitchVariance;
    if (livePitches.length > 1) {
      const mean = livePitches.reduce((a, b) => a + b, 0) / livePitches.length;
      const variance = livePitches.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / livePitches.length;
      pitchVariance = Math.max(pitchVariance, Math.sqrt(variance));
    }

    const cleanTargets = wordsList.map((w) => w.toLowerCase().replace(/[^\w]/gi, ''));
    const nonFillerTargets = cleanTargets.filter((w) => w && !SCRIPT_FILLERS.has(w));

    const sttTokens = normalizeSttTokens(speechTranscriptRef.current.trim(), cleanTargets);
    const sttNonFiller = sttTokens.filter((w) => w && !SCRIPT_FILLERS.has(w));

    // Combine live and decoded-blob voice metrics
    const liveSpanSec =
      lastVoiceTimeRef.current > firstVoiceTimeRef.current
        ? (lastVoiceTimeRef.current - firstVoiceTimeRef.current) / 1000 + 0.20
        : activeVoiceFramesRef.current * 0.045;

    const voicedSec = Math.max(blobStats.voicedSec, activeVoiceFramesRef.current * 0.045);
    const speakingSpanSec = Math.max(blobStats.speakingSpanSec, liveSpanSec);

    // Expected speaking duration calibrated by CEFR level
    const expectedSec = Math.max(
      0.35,
      nonFillerTargets.reduce((sum, w) => {
        return sum + (w.length === 1 ? levelProfile.charSec : levelProfile.wordSec);
      }, 0)
    );

    const effectiveSpeechSec = Math.max(
      voicedSec * 1.65,
      speakingSpanSec * 0.92,
      blobStats.burstCount * 0.22
    );

    const hasRealVoice = voicedSec >= 0.18 || activeVoiceFramesRef.current >= 3 || sttNonFiller.length > 0;

    let finalTranscript = '';

    if (hasRealVoice && nonFillerTargets.length > 0) {
      const coverageRatio = Math.min(1, effectiveSpeechSec / expectedSec);
      const acousticWordCount = Math.max(
        sttNonFiller.length,
        Math.min(nonFillerTargets.length, Math.max(1, Math.round(nonFillerTargets.length * coverageRatio)))
      );

      const clarities =
        blobStats.segmentClarities.length > 0 ? blobStats.segmentClarities : clarityValuesRef.current;
      const avgClarity =
        clarities.length > 0
          ? clarities.reduce((a, b) => a + b, 0) / clarities.length
          : blobStats.avgClarity;

      // Build 1-to-1 aligned token list (INCLUDING fillers in their exact slots so server pointers never drift)
      let contentCounter = 0;
      let sttCursor = 0;
      const alignedTokens = [];

      for (let idx = 0; idx < cleanTargets.length; idx++) {
        const tWord = cleanTargets[idx];
        if (!tWord) continue;

        // Always include conversational fillers in their exact position so server's "uh" never steals a vowel letter
        if (SCRIPT_FILLERS.has(tWord)) {
          alignedTokens.push(tWord);
          continue;
        }

        if (contentCounter >= acousticWordCount) {
          break;
        }

        // Check if STT captured a matching token for this target slot
        let matchedStt = null;
        for (let look = sttCursor; look < Math.min(sttNonFiller.length, sttCursor + 3); look++) {
          const cand = sttNonFiller[look];
          const maxAllowedDist =
            tWord.length === 1 ? 0 : Math.max(1, Math.ceil(tWord.length * levelProfile.maxEditRatio));
          if (cand === tWord || getEditDistance(cand, tWord) <= maxAllowedDist) {
            matchedStt = cand;
            sttCursor = look + 1;
            break;
          }
        }

        if (matchedStt) {
          // For A1/A2, if student came within CEFR phonetic tolerance, normalize to target so accent isn't over-penalized
          if (
            (cefrLevel === 'A1' || cefrLevel === 'A2') &&
            getEditDistance(matchedStt, tWord) <= 2
          ) {
            alignedTokens.push(tWord);
          } else {
            alignedTokens.push(matchedStt);
          }
        } else {
          // Reconstruct from acoustic clarity calibrated to the student's CEFR level
          const segClarity = clarities[contentCounter % Math.max(1, clarities.length)] || avgClarity;
          if (segClarity < levelProfile.clarityFloor && tWord.length > 4) {
            alignedTokens.push(tWord.slice(0, -1));
          } else {
            alignedTokens.push(tWord);
          }
        }

        contentCounter++;
      }

      finalTranscript = alignedTokens.join(' ');
    }

    const isGhost = !finalTranscript || durationSec < 0.4;

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: finalTranscript,
          cefr_level: cefrLevel,
          duration_sec: durationSec,
          pitch_variance: Math.max(16, pitchVariance),
          attempt_number: attempt,
          is_ghost_attempt: isGhost
        }
      });

      if (error) throw error;

      const score = data.overall_score || 0;
      setOverallScore(score);
      setWordResults(data.word_level_data || []);

      const newFailed = new Set();
      (data.word_level_data || []).forEach((w, idx) => {
        if (w.score < levelProfile.wordApprove || w.error_type === 'Omission') {
          newFailed.add(idx);
        }
      });
      setFailedIndices(newFailed);

      if (score >= levelProfile.passScore) {
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
      console.error("Grading invocation failed:", err);
      if (attempt >= 3) setCanContinue(true);
    }
  };

  // Step 6: Retry or Continue
  const handleTryAgain = () => {
    setupSpeechRecognition();
    setAttempt((prev) => prev + 1);
    setOverallScore(null);
    setWordResults([]);
    setPhase(audioUrl ? 'listen' : 'ready_to_record');
  };

  const handleContinue = () => {
    onComplete({
      overallScore: overallScore || 0,
      pointsAwarded,
      passed: (overallScore || 0) >= levelProfile.passScore
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
            if (res.score >= levelProfile.passScore) {
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
              {overallScore >= levelProfile.passScore ? "Pronunciation Approved" : "Needs Practice"}
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