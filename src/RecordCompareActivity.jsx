import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { PitchDetector } from 'pitchy';

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
  const studentAudioUrlRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  
  const speechTranscriptRef = useRef('');
  const accumulatedTranscriptRef = useRef('');
  const currentSessionTranscriptRef = useRef('');
  const lastSpeechErrorRef = useRef('');

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const pitchValuesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  
  const isRecordingRef = useRef(false);
  const activeStreamRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const hasFinalizedStopRef = useRef(false);

  const wordsList = targetText.trim().split(/\s+/);

  // Full hardware cleanup helper between exercises and on unmount
  const cleanupHardware = () => {
    isRecordingRef.current = false;
    clearTimeout(stopTimeoutRef.current);
    cancelAnimationFrame(animationFrameRef.current);

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    mediaRecorderRef.current = null;

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try { audioCtxRef.current.close(); } catch (e) {}
    }
    audioCtxRef.current = null;
  };

  // Reset state and hardware cleanly whenever the user advances to a new exercise
  useEffect(() => {
    cleanupHardware();
    setPhase('idle');
    setAttempt(1);
    setCanContinue(false);
    setPointsAwarded(0);
    setWordResults([]);
    setFailedIndices(new Set());
    setOverallScore(null);
  }, [targetText, nodeId]);

  // Unmount-only cleanup (NO studentAudioUrl dependency so it never self-aborts on stop)
  useEffect(() => {
    return () => {
      cleanupHardware();
      if (studentAudioUrlRef.current) {
        URL.revokeObjectURL(studentAudioUrlRef.current);
      }
    };
  }, []);

  const trackPitch = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    const analyser = analyserRef.current;
    const detector = PitchDetector.forFloat32Array(analyser.fftSize);
    const inputBuffer = new Float32Array(detector.inputLength);

    let lastTime = 0;
    const update = (time) => {
      if (time - lastTime > 100 && audioCtxRef.current && audioCtxRef.current.state === 'running') { 
        analyser.getFloatTimeDomainData(inputBuffer);
        const [pitch, clarity] = detector.findPitch(inputBuffer, audioCtxRef.current.sampleRate);
        if (clarity > 0.8 && pitch > 50 && pitch < 500) {
          pitchValuesRef.current.push(pitch);
        }
        lastTime = time;
      }
      if (isRecordingRef.current) {
        animationFrameRef.current = requestAnimationFrame(update);
      }
    };

    animationFrameRef.current = requestAnimationFrame(update);
  };

  const playSample = () => {
    if (!audioUrl) return;
    setPhase('playing_sample');
    sampleAudioRef.current = new Audio(audioUrl);
    sampleAudioRef.current.play();
    sampleAudioRef.current.onended = () => {
      setPhase('idle');
    };
  };

  const startRecording = async () => {
    try {
      // 1. Ensure 100% clean slate before starting (makes Exercise 2 identical to Exercise 1)
      cleanupHardware();

      audioChunksRef.current = [];
      pitchValuesRef.current = [];
      speechTranscriptRef.current = '';
      accumulatedTranscriptRef.current = '';
      currentSessionTranscriptRef.current = '';
      lastSpeechErrorRef.current = '';
      isRecordingRef.current = true;
      hasFinalizedStopRef.current = false;

      // 2. Start SpeechRecognition SYNCHRONOUSLY FIRST (locks in the user gesture & permission)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; 
        recognition.interimResults = true; 
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let sessionText = '';
          for (let i = 0; i < event.results.length; ++i) {
            sessionText += event.results[i][0].transcript + ' ';
          }
          currentSessionTranscriptRef.current = sessionText.trim();
          speechTranscriptRef.current = (
            accumulatedTranscriptRef.current + ' ' + currentSessionTranscriptRef.current
          ).trim();
        };

        recognition.onerror = (event) => {
          if (event.error !== 'no-speech') {
            lastSpeechErrorRef.current = event.error;
          }
        };

        recognition.onend = () => {
          if (currentSessionTranscriptRef.current) {
            accumulatedTranscriptRef.current = (
              accumulatedTranscriptRef.current + ' ' + currentSessionTranscriptRef.current
            ).trim();
            currentSessionTranscriptRef.current = '';
            speechTranscriptRef.current = accumulatedTranscriptRef.current;
          }

          if (isRecordingRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognitionRef.current = recognition;
        try { recognition.start(); } catch (e) {}
      }

      // 3. Request audio stream without echoCancellation lock
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

      // 4. Create a fresh AudioContext for every attempt and close it after stopping
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      try {
        audioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      } catch (e) {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 2048;
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

        // Release mic tracks and AudioContext completely so the next exercise starts fresh
        if (activeStreamRef.current) {
          activeStreamRef.current.getTracks().forEach((track) => track.stop());
          activeStreamRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          try { audioCtxRef.current.close(); } catch (e) {}
          audioCtxRef.current = null;
        }

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

  const finalizeHardwareStop = () => {
    if (hasFinalizedStopRef.current) return;
    hasFinalizedStopRef.current = true;
    clearTimeout(stopTimeoutRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);

    // 1. Stop SpeechRecognition FIRST while the mic stream is still alive so it flushes the final words
    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        if (currentSessionTranscriptRef.current) {
          accumulatedTranscriptRef.current = (
            accumulatedTranscriptRef.current + ' ' + currentSessionTranscriptRef.current
          ).trim();
          currentSessionTranscriptRef.current = '';
          speechTranscriptRef.current = accumulatedTranscriptRef.current;
        }
        finalizeHardwareStop();
      };
      try { recognitionRef.current.stop(); } catch (e) {
        finalizeHardwareStop();
      }
    } else {
      finalizeHardwareStop();
    }

    // 2. Safety fallback: stop MediaRecorder & mic after 600ms if onend hasn't fired yet
    stopTimeoutRef.current = setTimeout(() => {
      finalizeHardwareStop();
    }, 600);
  };

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

  const executeGrading = async () => {
    let retries = 15; 
    while (!speechTranscriptRef.current && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
    }

    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current) / 1000);

    const pitches = pitchValuesRef.current;
    let pitchVariance = 0;
    if (pitches.length > 1) {
      const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
      const variance = pitches.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pitches.length;
      pitchVariance = Math.sqrt(variance);
    }

    const isGhost = !speechTranscriptRef.current.trim() || durationSec < 0.5;

    if (!speechTranscriptRef.current.trim()) {
      alert(`DEBUG CHECK: Speech engine captured no text. Mobile Error Code: [${lastSpeechErrorRef.current || 'None'}]. Try speaking clearly after pressing record.`);
    }

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-pronunciation', {
        body: {
          lesson_id: lessonId,
          node_id: nodeId,
          target_text: targetText,
          transcript: speechTranscriptRef.current,
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
      alert("SERVER ERROR: " + err.message);
      console.error("Grading invocation failed:", err);
      if (attempt >= 3) setCanContinue(true);
    }
  };

  const handleTryAgain = () => {
    setAttempt((prev) => prev + 1);
    setOverallScore(null);
    setWordResults([]);
    setPhase('idle');
  };

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