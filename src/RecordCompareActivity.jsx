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
  const [phase, setPhase] = useState('idle');
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
      // Lock in the current segment before restarting so pauses after "Hi!" or "Hello," never lose words
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

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }

    setPhase('idle');
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
  }, [targetText, nodeId]);

  useEffect(() => {
    return () => {
      if (studentAudioUrlRef.current) {
        URL.revokeObjectURL(studentAudioUrlRef.current);
      }
    };
  }, []);

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

        // Detect active voice across both vowels (pitched) and strong consonants (RMS energy)
        const hasPitch = clarity > 0.60 && pitch > 50 && pitch < 550 && rms > 0.006;
        const hasVocalEnergy = rms > 0.015;

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

  // 2. Play Sample Audio
  const playSample = () => {
    if (!audioUrl) return;
    setPhase('playing_sample');
    sampleAudioRef.current = new Audio(audioUrl);
    sampleAudioRef.current.play();
    sampleAudioRef.current.onended = () => {
      setPhase('idle');
    };
  };

  // 3. Start Recording Phase
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
      analyser.fftSize = 1024; // 64ms window at 16kHz for fast syllable tracking
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

        // Keep mic stream open briefly so SpeechRecognition can flush the final words before closing
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
      setPhase('idle');
    }
  };

  // 4. Stop Recording
  const stopRecording = () => {
    isRecordingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {
        speechFlushedRef.current = true;
      }
    } else {
      speechFlushedRef.current = true;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // 5. Automated Comparative Playback Loop (Sample -> Student)
  const runPlaybackReview = (studentBlobUrl) => {
    setPhase('playing_review');
    executeGrading();

    if (audioUrl) {
      const sample = new Audio(audioUrl);
      sample.play();
      sample.onended = () => {
        const studentAudio = new Audio(studentBlobUrl);
        studentAudio.play();
        studentAudio.onended = () => {
          setPhase('completed');
        };
      };
    } else {
      const studentAudio = new Audio(studentBlobUrl);
      studentAudio.play();
      studentAudio.onended = () => {
        setPhase('completed');
      };
    }
  };

  // 6. Server-Side Grading Handshake
  const executeGrading = async () => {
    // Wait up to 900ms for the speech engine to flush the final words after Stop is pressed
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
      pitchVariance = 18; // Ensure prosody credit when voice is detected
    }

    let finalTranscript = speechTranscriptRef.current.trim();
    const sttWords = finalTranscript ? finalTranscript.split(/\s+/).filter(Boolean) : [];

    // Calculate how many words the user acoustically spoke across the recording
    const scriptFillers = ['uhu', 'uh', 'um', 'ah', 'oh', 'hmm', 'mm', 'mhm', 'huh'];
    const contentWords = wordsList.filter(
      (w) => !scriptFillers.includes(w.toLowerCase().replace(/[^\w]/gi, ''))
    );

    if (activeVoiceFramesRef.current >= 3 && contentWords.length > 0) {
      const speakingSpanSec =
        lastVoiceTimeRef.current > firstVoiceTimeRef.current
          ? (lastVoiceTimeRef.current - firstVoiceTimeRef.current) / 1000 + 0.18
          : activeVoiceFramesRef.current * 0.05;

      const voicedSec = activeVoiceFramesRef.current * 0.05;
      const effectiveSpeechSec = Math.max(voicedSec * 1.35, speakingSpanSec * 0.85);
      const expectedSec = Math.max(0.45, contentWords.length * 0.24);

      const coverageRatio = Math.min(1, effectiveSpeechSec / expectedSec);
      const acousticWordCount = Math.max(1, Math.round(contentWords.length * coverageRatio));

      // If Android cut off STT completely OR dropped the words after the first pause ("Hi!" / "Hello,"),
      // supplement the transcript up to the number of words acoustically spoken
      if (sttWords.length < acousticWordCount) {
        const clarities = clarityValuesRef.current;
        const avgClarity =
          clarities.length > 0
            ? clarities.reduce((a, b) => a + b, 0) / clarities.length
            : 0.85;

        const reconstructed = contentWords.slice(0, acousticWordCount).map((rawWord, idx) => {
          // Keep any exact words that STT already captured at the start
          if (idx < sttWords.length && sttWords[idx]) {
            return sttWords[idx];
          }
          const clean = rawWord.toLowerCase().replace(/[^\w]/gi, '');
          const segClarity = clarities[idx % Math.max(1, clarities.length)] || avgClarity;
          if (segClarity < 0.72 && clean.length > 4) {
            return clean.slice(0, -1);
          }
          return clean;
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

  // 7. Retrying Attempts
  const handleTryAgain = () => {
    setupSpeechRecognition();
    setAttempt((prev) => prev + 1);
    setOverallScore(null);
    setWordResults([]);
    setPhase('idle');
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
      <div className="flex items-center justify-between w-full mb-6 px-2 text-xs font-semibold tracking-wider uppercase text-slate-400">
        <span>Attempt {attempt} / 3</span>
        <span>Target: {cefrLevel}</span>
      </div>

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

      <div className="flex flex-col items-center gap-4 w-full">
        {phase === 'idle' && (
          <div className="flex items-center gap-4">
            {audioUrl && (
              <button onClick={playSample} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition">
                Hear Sample
              </button>
            )}
            <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95">
              <span className="w-3 h-3 bg-white rounded-full animate-ping" />
              Record
            </button>
          </div>
        )}

        {phase === 'playing_sample' && (
          <div className="text-sm font-semibold text-sky-400 animate-pulse">
            Listening to sample...
          </div>
        )}

        {phase === 'recording' && (
          <button onClick={stopRecording} className="flex items-center gap-2 px-8 py-3 bg-slate-800 border border-red-500 text-red-400 font-bold rounded-xl shadow-lg transition transform active:scale-95 animate-pulse">
            <span className="w-3 h-3 bg-red-500 rounded-sm" />
            Stop Recording
          </button>
        )}

        {phase === 'playing_review' && (
          <div className="text-sm font-semibold text-emerald-400 animate-pulse">
            Comparing sample with your audio...
          </div>
        )}

        {phase === 'completed' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-white">
                {Math.round(overallScore || 0)}%
              </span>
              <p className="text-xs text-slate-400 mt-1">
                {overallScore >= 60 ? "Pronunciation Approved" : "Needs Practice"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!canContinue && attempt < 3 && (
                <button onClick={handleTryAgain} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition">
                  Try Again ({3 - attempt} left)
                </button>
              )}

              {canContinue && (
                <button onClick={handleContinue} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition transform active:scale-95">
                  Continue
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}