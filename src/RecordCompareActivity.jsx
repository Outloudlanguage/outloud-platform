import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';

// CEFR Level Calibration Matrix
const CEFR_PROFILES = {
  A1: { passScore: 62, wordApprove: 80, charSec: 0.14, wordSec: 0.20, clarityFloor: 0.58 },
  A2: { passScore: 68, wordApprove: 80, charSec: 0.15, wordSec: 0.22, clarityFloor: 0.62 },
  B1: { passScore: 74, wordApprove: 82, charSec: 0.16, wordSec: 0.24, clarityFloor: 0.68 },
  B2: { passScore: 78, wordApprove: 85, charSec: 0.17, wordSec: 0.25, clarityFloor: 0.74 },
  C1: { passScore: 84, wordApprove: 88, charSec: 0.18, wordSec: 0.26, clarityFloor: 0.80 },
  C2: { passScore: 88, wordApprove: 90, charSec: 0.18, wordSec: 0.28, clarityFloor: 0.84 }
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
  k: 'k', kay: 'k', cay: 'k', okay: 'k',
  l: 'l', el: 'l', ell: 'l', al: 'l',
  m: 'm', em: 'm', am: 'm',
  n: 'n', en: 'n', in: 'n', and: 'n', an: 'n', end: 'n',
  o: 'o', oh: 'o', owe: 'o', ou: 'o',
  p: 'p', pee: 'p', pea: 'p',
  q: 'q', cue: 'q', queue: 'q', kyu: 'q',
  r: 'r', are: 'r', our: 'r', or: 'r', ar: 'r', er: 'r', air: 'r', her: 'r',
  s: 's', es: 's', ess: 's', is: 's', as: 's',
  t: 't', tee: 't', tea: 't', ti: 't', to: 't', too: 't',
  u: 'u', you: 'u', yu: 'u',
  v: 'v', vee: 'v', vi: 'v',
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

  const activePlaybackRef = useRef(null);
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
  const activeVoiceFramesRef = useRef(0);

  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const isRecordingRef = useRef(false);
  const activeStreamRef = useRef(null);

  const wordsList = targetText.trim().split(/\s+/);

  // Stop any currently playing audio so two clips can NEVER overlap
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
    recognition.maxAlternatives = 3;
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
        try { recognitionRef.current.start(); } catch (e) {}
      } else {
        speechFlushedRef.current = true;
      }
    };

    recognitionRef.current = recognition;
  };

  // Reset cleanly whenever the lesson advances to a new exercise node
  useEffect(() => {
    isRecordingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);
    stopCurrentAudio();

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

  // Decodes the recorded audioBlob to count real vocal bursts, active voiced seconds, and per-burst clarity
  const analyzeRecordedBlob = async (audioBlob) => {
    const result = {
      voicedSec: 0,
      burstCount: 0,
      pitchVariance: 0,
      avgClarity: 0.82,
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

      const windowSize = Math.max(256, Math.floor(sampleRate * 0.03)); // 30ms frame windows
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
      const noiseFloor = sortedRms[Math.floor(sortedRms.length * 0.20)] || 0.001;
      const peakRms = sortedRms[Math.floor(sortedRms.length * 0.95)] || 0.02;

      // Require real vocal energy above ambient mic noise
      const voiceThreshold = Math.max(0.005, Math.min(0.022, noiseFloor * 2.5, peakRms * 0.22));

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

      // Count local syllable peaks for connected speech (e.g., "good morning")
      let syllablePeaks = 0;
      let lastPeakIdx = -4;
      for (let idx = 1; idx < rmsList.length - 1; idx++) {
        if (
          rmsList[idx] >= voiceThreshold * 1.15 &&
          rmsList[idx] >= rmsList[idx - 1] &&
          rmsList[idx] >= rmsList[idx + 1] &&
          idx - lastPeakIdx >= 4 // At least 120ms between syllable nuclei
        ) {
          syllablePeaks++;
          lastPeakIdx = idx;
        }
      }

      result.voicedSec = activeFrames * 0.03;
      result.burstCount = Math.max(bursts, Math.min(syllablePeaks, bursts * 2));

      // Extract Pitchy clarity and pitch variance across active frames
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
          const variance = pitches.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / pitches.length;
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
      console.warn("AudioBuffer decode fallback:", e);
    } finally {
      if (tempCtx && tempCtx.state !== 'closed') {
        try { tempCtx.close(); } catch (e) {}
      }
    }

    return result;
  };

  // Normalizes STT tokens into words/digits/letters WITHOUT overwriting wrong spoken letters with targets
  const normalizeSttTokens = (rawTranscript, cleanTargets) => {
    if (!rawTranscript) return [];

    const hasDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));
    const hasSingleLetters = cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

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
    if (!hasSingleLetters) {
      return rawTokens.filter((w) => !SCRIPT_FILLERS.has(w));
    }

    const regularTargetWords = new Set(
      cleanTargets.filter((w) => w.length > 1 && !SCRIPT_FILLERS.has(w))
    );

    const output = [];
    for (const tok of rawTokens) {
      if (SCRIPT_FILLERS.has(tok) && tok !== 'oh') {
        continue;
      }
      if (regularTargetWords.has(tok)) {
        output.push(tok);
      } else if (LETTER_PHONETICS[tok]) {
        output.push(LETTER_PHONETICS[tok]);
      } else if (tok.length > 1 && /^[a-z]+$/.test(tok)) {
        // Explode what the user actually said into single letters (e.g. "ribera" -> r, i, b, e, r, a)
        output.push(...tok.split(''));
      } else {
        output.push(tok);
      }
    }

    return output;
  };

  // Live Pitch Tracker (Connected to a 0-gain node so Android Chrome keeps the audio stream active)
  const trackPitch = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    const analyser = analyserRef.current;
    const detector = PitchDetector.forFloat32Array(analyser.fftSize);
    const inputBuffer = new Float32Array(detector.inputLength);

    let lastTime = 0;
    const update = (time) => {
      if (time - lastTime > 50 && audioCtxRef.current && audioCtxRef.current.state === 'running') {
        analyser.getFloatTimeDomainData(inputBuffer);

        let sumSquares = 0;
        for (let i = 0; i < inputBuffer.length; i++) {
          sumSquares += inputBuffer[i] * inputBuffer[i];
        }
        const rms = Math.sqrt(sumSquares / inputBuffer.length);

        const [pitch, clarity] = detector.findPitch(inputBuffer, audioCtxRef.current.sampleRate);
        if (clarity > 0.58 && pitch > 55 && pitch < 550 && rms > 0.005) {
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

  // Step 1: Play Sample Audio -> Reveal "Repeat"
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
      audioChunksRef.current = [];
      pitchValuesRef.current = [];
      activeVoiceFramesRef.current = 0;

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

        // Release microphone hardware BEFORE starting playback so Android speaker routing is 100% clean
        stream.getTracks().forEach((track) => track.stop());
        if (activeStreamRef.current === stream) {
          activeStreamRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          try { audioCtxRef.current.close(); } catch (e) {}
          audioCtxRef.current = null;
        }

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

  // Step 3: Stop Recording (Flushes STT first while mic is alive, then stops MediaRecorder)
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);

    // Switch button to "Comparing..." immediately for instant UI response
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

    // Give Android SpeechRecognition 600ms while the mic stream is still open to deliver the final words
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    }, 600);
  };

  // Strictly sequential single-audio player: guarantees current clip finishes and pauses before resolving
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

      // Generous 35-second safety ceiling; if metadata provides real duration, cap to duration + 2.5s
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

  // Step 4: "Comparing..." (Plays Reference -> 300ms pause -> Student Audio, while grading)
  const runPlaybackReview = async (studentBlobUrl, audioBlob) => {
    setPhase('playing_review');

    try {
      const playbackSequence = async () => {
        if (audioUrl) {
          await playAudioSequentially(audioUrl);
          // Distinct 300ms gap between teacher audio ending and student recording starting
          await new Promise((r) => setTimeout(r, 300));
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

  // Step 5: Hybrid STT + Waveform Burst Grading Handshake
  const executeGrading = async (audioBlob) => {
    let waitTicks = 5;
    while (!speechFlushedRef.current && waitTicks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitTicks--;
    }

    updateCombinedTranscript();

    const blobStats = await analyzeRecordedBlob(audioBlob);
    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current - 600) / 1000);

    const livePitches = pitchValuesRef.current;
    let pitchVariance = blobStats.pitchVariance;
    if (livePitches.length > 1) {
      const mean = livePitches.reduce((a, b) => a + b, 0) / livePitches.length;
      const variance = livePitches.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / livePitches.length;
      pitchVariance = Math.max(pitchVariance, Math.sqrt(variance));
    }

    const cleanTargets = wordsList
      .map((w) => w.toLowerCase().replace(/[^\w]/gi, ''))
      .filter(Boolean);
    const nonFillerTargets = cleanTargets.filter((w) => !SCRIPT_FILLERS.has(w));
    const fillerCount = cleanTargets.length - nonFillerTargets.length;

    const sttTokens = normalizeSttTokens(speechTranscriptRef.current.trim(), cleanTargets);

    const voicedSec = Math.max(blobStats.voicedSec, activeVoiceFramesRef.current * 0.045);
    const hasRealVoice = voicedSec >= 0.22 || sttTokens.length > 0;

    let finalTranscript = '';

    if (hasRealVoice && nonFillerTargets.length > 0) {
      // Calculate how many content tokens the student actually vocalized based on active voiced audio & bursts
      const expectedVoicedSec = Math.max(
        0.35,
        nonFillerTargets.reduce((sum, w) => {
          return sum + (w.length === 1 ? levelProfile.charSec : levelProfile.wordSec);
        }, 0)
      );

      // Subtract estimated filler time so "Uh..." doesn't count toward spelling/word coverage
      const contentVoicedSec = Math.max(0.15, voicedSec - fillerCount * 0.14);
      const timeRatio = Math.min(1, (contentVoicedSec * 1.15) / expectedVoicedSec);

      const contentBursts = Math.max(1, blobStats.burstCount - Math.floor(fillerCount * 0.5));
      const burstRatio = Math.min(1, contentBursts / Math.max(1, nonFillerTargets.length * 0.85));

      // Require BOTH active voice time and vocal bursts so skipping letters lowers the count honestly
      const acousticCoverage = Math.min(1, timeRatio * 0.65 + burstRatio * 0.35);
      const acousticTokenCount = Math.max(
        1,
        Math.min(nonFillerTargets.length, Math.round(nonFillerTargets.length * acousticCoverage))
      );

      // CASE A: Browser STT captured the student's words/letters (e.g. they spoke clearly OR said wrong letters)
      // Keep the exact STT tokens so any wrong letters/words are graded honestly as mistakes!
      if (sttTokens.length >= Math.max(2, Math.floor(nonFillerTargets.length * 0.5))) {
        finalTranscript = sttTokens.join(' ');
      }
      // CASE B: Android cut off STT mid-sentence (e.g. right after "Uh... Yes uh...") or muted STT completely,
      // while the recorded audioBlob proves the student continued speaking additional words/letters
      else if (sttTokens.length < acousticTokenCount) {
        const clarities = blobStats.burstClarities;
        const avgClarity = blobStats.avgClarity;

        const combined = [];
        for (let idx = 0; idx < acousticTokenCount; idx++) {
          // Preserve any initial tokens that STT did capture
          if (idx < sttTokens.length && sttTokens[idx]) {
            combined.push(sttTokens[idx]);
            continue;
          }

          const targetTok = nonFillerTargets[idx];
          const segClarity =
            clarities.length > 0 ? clarities[idx % clarities.length] : avgClarity;

          // If vocal clarity dipped on this burst, mark it slightly off so it grades Yellow instead of 100%
          if (segClarity < levelProfile.clarityFloor) {
            if (targetTok.length === 1) {
              combined.push('?');
            } else {
              combined.push(targetTok.slice(0, Math.max(1, targetTok.length - 1)));
            }
          } else {
            combined.push(targetTok);
          }
        }
        finalTranscript = combined.join(' ');
      } else {
        finalTranscript = sttTokens.join(' ');
      }
    }

    const isGhost = !finalTranscript || durationSec < 0.35;

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: finalTranscript,
          cefr_level: cefrLevel,
          duration_sec: durationSec,
          pitch_variance: Math.max(14, pitchVariance),
          attempt_number: attempt,
          is_ghost_attempt: isGhost
        }
      });

      if (error) throw error;

      const score = data.overall_score || 0;
      const passed = data.passed !== undefined ? data.passed : score >= levelProfile.passScore;

      setOverallScore(score);
      setWordResults(data.word_level_data || []);

      const newFailed = new Set();
      (data.word_level_data || []).forEach((w, idx) => {
        if (w.score < levelProfile.wordApprove || w.error_type === 'Omission') {
          newFailed.add(idx);
        }
      });
      setFailedIndices(newFailed);

      if (passed) {
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
            if (res.error_type === 'Omission') {
              return <span key={idx} className="text-slate-500 line-through opacity-40">{word}</span>;
            }
            if (res.score >= levelProfile.wordApprove) {
              return <span key={idx} className="text-emerald-400 font-bold">{word}</span>;
            }
            if (res.score >= 60) {
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