import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';

/**
 * RecordCompareActivity
 * 
 * Props:
 * - targetText: string (The subtitle / sentence to repeat)
 * - audioUrl: string (Teacher reference audio URL)
 * - lessonId: string / uuid
 * - nodeId: string
 * - cefrLevel: string ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')
 * - onComplete: function({ overallScore, pointsAwarded, passed })
 */
export default function RecordCompareActivity({
  targetText = "The quick brown fox jumps over the lazy dog",
  audioUrl = "",
  lessonId = "",
  nodeId = "",
  cefrLevel = "A1",
  onComplete = () => {}
}) {
  // Progressive Disclosure State Machine:
  // 'listen' | 'playing_sample' | 'ready_to_record' | 'recording' | 'playing_review' | 'completed'
  const [phase, setPhase] = useState(audioUrl ? 'listen' : 'ready_to_record');
  const [attempt, setAttempt] = useState(1);
  const [canContinue, setCanContinue] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const [wordResults, setWordResults] = useState([]);
  const [failedIndices, setFailedIndices] = useState(new Set());
  const [overallScore, setOverallScore] = useState(null);

  const sampleAudioRef = useRef(null);
  const [studentAudioUrl, setStudentAudioUrl] = useState(null);
  const studentAudioUrlRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Transcript accumulators across pauses
  const committedSegmentsRef = useRef([]);
  const currentSegmentRef = useRef('');
  const speechTranscriptRef = useRef('');
  const speechFlushedRef = useRef(false);

  // Acoustic & Pitch tracking refs
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

  // Pre-initialize SpeechRecognition cleanly before recording
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

    recognition.onerror = (event) => {
      console.warn("Browser Speech Event:", event.error);
    };

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

  // Reset cleanly whenever the lesson advances to a new exercise node
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

  // Safe Levenshtein helper (bounded to prevent heavy computation)
  const getEditDistance = (a = '', b = '') => {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 4) return 99;
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

  // Single-pass normalizer for spelled letters ("E R N E S T O") and numbers ("3 6 0 7 5 2...")
  const normalizeTranscriptForTarget = (rawTranscript) => {
    if (!rawTranscript) return '';

    const cleanTargets = wordsList
      .map((w) => w.toLowerCase().replace(/[^\w]/gi, ''))
      .filter(Boolean);

    const hasTargetDigits = cleanTargets.some((w) => /^\d+$/.test(w));
    const hasSingleDigits = cleanTargets.some((w) => /^\d$/.test(w));

    // Find sequences of 2+ single letters in targetText (e.g. ["e","r","n","e","s","t","o"] -> "ernesto")
    const spelledSequences = [];
    let currentSeq = [];
    for (const w of cleanTargets) {
      if (w.length === 1 && /[a-z]/.test(w)) {
        currentSeq.push(w);
      } else {
        if (currentSeq.length >= 2) spelledSequences.push(currentSeq.join(''));
        currentSeq = [];
      }
    }
    if (currentSeq.length >= 2) spelledSequences.push(currentSeq.join(''));

    const hasSpelledLetters =
      spelledSequences.length > 0 || cleanTargets.some((w) => w.length === 1 && /[a-z]/.test(w));

    let text = rawTranscript.toLowerCase();
    text = text.replace(/\bdouble you\b/g, 'w').replace(/\bdouble u\b/g, 'w');

    // 1. Normalize Spoken Numbers -> Digits
    if (hasTargetDigits) {
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

      const numberWordMap = {
        zero: '0', oh: '0', o: '0', nil: '0',
        ...onesDigits,
        ten: '10', eleven: '11', twelve: '12', thirteen: '13',
        fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17',
        eighteen: '18', nineteen: '19', twenty: '20', thirty: '30',
        forty: '40', fifty: '50', sixty: '60', seventy: '70',
        eighty: '80', ninety: '90'
      };

      text = text
        .split(/\s+/)
        .map((token) => {
          const clean = token.replace(/[^\w]/gi, '');
          return numberWordMap[clean] !== undefined ? numberWordMap[clean] : token;
        })
        .join(' ');

      if (hasSingleDigits) {
        text = text.replace(/(\d)/g, ' $1 ');
      }
    }

    // 2. Normalize Spelled Words & Phonetic Letter Names (Guaranteed Single Pass — No Infinite Loop)
    if (hasSpelledLetters) {
      const letterPhonetics = {
        hey: 'a', ay: 'a', eh: 'a',
        bee: 'b', be: 'b',
        see: 'c', sea: 'c', si: 'c',
        dee: 'd', di: 'd', de: 'd',
        he: 'e', ee: 'e', yi: 'e',
        ef: 'f', eff: 'f',
        gee: 'g', jee: 'g', ji: 'g',
        aitch: 'h', hach: 'h', age: 'h',
        eye: 'i',
        jay: 'j', yay: 'j',
        kay: 'k', okay: 'k', cay: 'k',
        el: 'l', ell: 'l', al: 'l',
        em: 'm', am: 'm',
        en: 'n', in: 'n', and: 'n', an: 'n', end: 'n',
        oh: 'o', owe: 'o', ou: 'o',
        pee: 'p', pea: 'p',
        cue: 'q', queue: 'q', kyu: 'q',
        are: 'r', our: 'r', or: 'r', ar: 'r', er: 'r', her: 'r', air: 'r',
        es: 's', ess: 's', is: 's', as: 's',
        tee: 't', tea: 't', ti: 't', to: 't', too: 't',
        you: 'u', yu: 'u',
        vee: 'v', vi: 'v',
        doubleyou: 'w', doubleu: 'w',
        ex: 'x', ax: 'x', eggs: 'x',
        why: 'y', wai: 'y',
        zee: 'z', zed: 'z'
      };

      const fillers = new Set(['uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh']);
      const nonSpelledTargets = new Set(
        cleanTargets.filter((w) => w.length > 1 && !fillers.has(w))
      );

      const tokens = text.replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(Boolean);
      const outputTokens = [];

      let i = 0;
      while (i < tokens.length) {
        const tok = tokens[i];

        // Keep regular target words (like "yes") and conversational fillers intact
        if (nonSpelledTargets.has(tok) || (fillers.has(tok) && tok !== 'oh')) {
          outputTokens.push(tok);
          i++;
          continue;
        }

        // Check if a window of tokens starting at `i` forms one of the spelled sequences (e.g. "ernesto")
        let matchedSeq = null;
        let matchedEndIdx = i;

        for (const seqWord of spelledSequences) {
          let combined = '';
          const maxWindow = Math.min(tokens.length, i + seqWord.length + 2);
          for (let k = i; k < maxWindow; k++) {
            const candidate = tokens[k];
            if (nonSpelledTargets.has(candidate)) break;
            combined += letterPhonetics[candidate] || candidate;

            const maxDist = seqWord.length >= 5 ? 2 : 1;
            if (
              combined === seqWord ||
              (combined.length >= seqWord.length - 1 && getEditDistance(combined, seqWord) <= maxDist)
            ) {
              matchedSeq = seqWord;
              matchedEndIdx = k;
              break;
            }
          }
          if (matchedSeq) break;
        }

        if (matchedSeq) {
          outputTokens.push(...matchedSeq.split(''));
          i = matchedEndIdx + 1; // Advance completely past the matched tokens
          continue;
        }

        // If it's a known phonetic letter word (e.g. "are" -> "r", "tea" -> "t"), map to single letter
        if (letterPhonetics[tok]) {
          outputTokens.push(letterPhonetics[tok]);
          i++;
          continue;
        }

        // If STT grouped multiple letters into an unknown cluster during a spelling exercise (e.g. "ern" or "esto"),
        // explode it into individual letters so the server can grade each letter 1-by-1
        if (spelledSequences.length > 0 && tok.length > 1 && /^[a-z]+$/.test(tok)) {
          outputTokens.push(...tok.split(''));
          i++;
          continue;
        }

        outputTokens.push(tok);
        i++;
      }

      text = outputTokens.join(' ');
    }

    return text.replace(/\s+/g, ' ').trim();
  };

  // 1. Pitch & Acoustic Span Tracking Loop (AnalyserNode + Pitchy)
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

        const hasPitch = clarity > 0.58 && pitch > 50 && pitch < 550 && rms > 0.004;
        const hasVocalEnergy = rms > 0.011;

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

  // 2. Step 1 of Progressive Disclosure: Play Sample Audio -> Reveal "Repeat"
  const playSample = () => {
    if (!audioUrl) {
      setPhase('ready_to_record');
      return;
    }
    setPhase('playing_sample');
    const audio = new Audio(audioUrl);
    sampleAudioRef.current = audio;

    audio.onended = () => {
      setPhase('ready_to_record');
    };
    audio.onerror = () => {
      setPhase('ready_to_record');
    };
    audio.play().catch(() => {
      setPhase('ready_to_record');
    });
  };

  // 3. Step 2 of Progressive Disclosure: Start Recording Phase
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
        try {
          recognitionRef.current.start();
        } catch (e) {}
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
      source.connect(analyser);
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
        setStudentAudioUrl(url);

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

        runPlaybackReview(url);
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

  // 4. Step 3 of Progressive Disclosure: Stop Recording
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

  // Helper to play an audio URL with a safety timeout so playback can never hang
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

  // 5. Step 4 of Progressive Disclosure: "Comparing..." (Plays Original -> Student -> Grades)
  const runPlaybackReview = async (studentBlobUrl) => {
    setPhase('playing_review');

    try {
      const playbackSequence = async () => {
        if (audioUrl) {
          await playAudioPromise(audioUrl);
        }
        await playAudioPromise(studentBlobUrl);
      };

      await Promise.all([playbackSequence(), executeGrading()]);
    } catch (err) {
      console.error("Review playback error:", err);
    } finally {
      setPhase('completed');
    }
  };

  // 6. Server-Side Grading Handshake
  const executeGrading = async () => {
    let waitTicks = 9;
    while (!speechFlushedRef.current && waitTicks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitTicks--;
    }

    updateCombinedTranscript();

    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current) / 1000);

    const pitches = pitchValuesRef.current;
    let pitchVariance = 0;
    if (pitches.length > 1) {
      const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
      const variance = pitches.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pitches.length;
      pitchVariance = Math.sqrt(variance);
    } else if (activeVoiceFramesRef.current >= 3) {
      pitchVariance = 18;
    }

    // Normalize spelled letters and numbers once
    let finalTranscript = normalizeTranscriptForTarget(speechTranscriptRef.current.trim());

    const scriptFillers = ['uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh'];
    const contentWords = wordsList.filter(
      (w) => !scriptFillers.includes(w.toLowerCase().replace(/[^\w]/gi, ''))
    );

    const sttContentWords = finalTranscript
      ? finalTranscript
          .split(/\s+/)
          .filter((w) => w && !scriptFillers.includes(w.toLowerCase().replace(/[^\w]/gi, '')))
      : [];

    // Acoustic Span Supplement: If Android cut off STT during pauses between letters/numbers/words,
    // reconstruct the remaining words that were acoustically spoken into the microphone
    if (activeVoiceFramesRef.current >= 3 && contentWords.length > 0) {
      const speakingSpanSec =
        lastVoiceTimeRef.current > firstVoiceTimeRef.current
          ? (lastVoiceTimeRef.current - firstVoiceTimeRef.current) / 1000 + 0.20
          : activeVoiceFramesRef.current * 0.05;

      const voicedSec = activeVoiceFramesRef.current * 0.05;
      const effectiveSpeechSec = Math.max(voicedSec * 1.4, speakingSpanSec * 0.9);

      const expectedSec = Math.max(
        0.4,
        contentWords.reduce((acc, w) => {
          const clean = w.replace(/[^\w]/gi, '');
          return acc + (clean.length === 1 ? 0.16 : 0.24);
        }, 0)
      );

      const coverageRatio = Math.min(1, effectiveSpeechSec / expectedSec);
      const acousticWordCount = Math.max(1, Math.round(contentWords.length * coverageRatio));

      if (sttContentWords.length < acousticWordCount) {
        const clarities = clarityValuesRef.current;
        const avgClarity =
          clarities.length > 0
            ? clarities.reduce((a, b) => a + b, 0) / clarities.length
            : 0.85;

        const reconstructed = contentWords.slice(0, acousticWordCount).map((rawWord, idx) => {
          const cleanTarget = rawWord.toLowerCase().replace(/[^\w]/gi, '');
          const sttCandidate = sttContentWords[idx];

          // Only keep the STT token in this slot if it reasonably matches the expected target type
          if (sttCandidate) {
            if (cleanTarget.length === 1 && sttCandidate.length === 1) {
              return sttCandidate;
            }
            if (cleanTarget.length > 1 && getEditDistance(sttCandidate, cleanTarget) <= 2) {
              return sttCandidate;
            }
          }

          const segClarity = clarities[idx % Math.max(1, clarities.length)] || avgClarity;
          if (segClarity < 0.72 && cleanTarget.length > 4) {
            return cleanTarget.slice(0, -1);
          }
          return cleanTarget;
        });

        finalTranscript = reconstructed.join(' ');
      }
    }

    const isGhost = !finalTranscript || durationSec < 0.5;

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: finalTranscript,
          cefr_level: cefrLevel,
          duration_sec: durationSec,
          pitch_variance: pitchVariance,
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
        if (w.score < 80 || w.error_type === 'Omission') {
          newFailed.add(idx);
        }
      });
      setFailedIndices(newFailed);

      if (score >= 60) {
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

  // 7. Retrying Attempts (Resets back to Listen so student hears reference then repeats)
  const handleTryAgain = () => {
    setupSpeechRecognition();
    setAttempt((prev) => prev + 1);
    setOverallScore(null);
    setWordResults([]);
    setPhase(audioUrl ? 'listen' : 'ready_to_record');
  };

  // 8. Progress to next node
  const handleContinue = () => {
    onComplete({
      overallScore: overallScore || 0,
      pointsAwarded,
      passed: (overallScore || 0) >= 60
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
            if (res.score >= 80) {
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
              {overallScore >= 60 ? "Pronunciation Approved" : "Needs Practice"}
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