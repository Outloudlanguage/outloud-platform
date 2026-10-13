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
  // State Machine
  // 'idle' | 'playing_sample' | 'recording' | 'playing_review' | 'evaluating' | 'completed'
  const [phase, setPhase] = useState('idle');
  const [attempt, setAttempt] = useState(1);
  const [canContinue, setCanContinue] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  // Evaluation & Word Tracking
  const [wordResults, setWordResults] = useState([]);
  const [failedIndices, setFailedIndices] = useState(new Set());
  const [overallScore, setOverallScore] = useState(null);

  // Audio References
  const sampleAudioRef = useRef(null);
  const studentAudioRef = useRef(null);
  const [studentAudioUrl, setStudentAudioUrl] = useState(null);

  // Hardware & Web API References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const speechTranscriptRef = useRef('');
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const pitchValuesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(0);

  // Clean split of target words for rendering
  const wordsList = targetText.trim().split(/\s+/);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        speechTranscriptRef.current = event.results[0][0].transcript;
      };

      recognition.onerror = () => {
        speechTranscriptRef.current = '';
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (studentAudioUrl) URL.revokeObjectURL(studentAudioUrl);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // 1. Pitch Tracking Loop (AnalyserNode + Pitchy)
  const trackPitch = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    const analyser = analyserRef.current;
    const detector = PitchDetector.forFloat32Array(analyser.fftSize);
    const inputBuffer = new Float32Array(detector.inputLength);

    const update = () => {
      analyser.getFloatTimeDomainData(inputBuffer);
      const [pitch, clarity] = detector.findPitch(inputBuffer, audioCtxRef.current.sampleRate);
      if (clarity > 0.8 && pitch > 50 && pitch < 500) {
        pitchValuesRef.current.push(pitch);
      }
      animationFrameRef.current = requestAnimationFrame(update);
    };

    update();
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      // Clear previous buffers
      audioChunksRef.current = [];
      pitchValuesRef.current = [];
      speechTranscriptRef.current = '';

      // Initialize Web Audio Context for Pitch Tracking
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      trackPitch();

      // Setup MediaRecorder for local playback comparison
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (studentAudioUrl) URL.revokeObjectURL(studentAudioUrl);
        const url = URL.createObjectURL(audioBlob);
        setStudentAudioUrl(url);

        // Turn off microphone tracks
        stream.getTracks().forEach((track) => track.stop());
        cancelAnimationFrame(animationFrameRef.current);

        // Transition straight into the comparative playback review
        runPlaybackReview(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();

      // Trigger Web Speech API recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Fallback if recognition is already running
        }
      }

      setPhase('recording');
    } catch (err) {
      console.error("Microphone access denied or audio initialization failed", err);
      setPhase('idle');
    }
  };

  // 4. Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }
  };

  // 5. Automated Comparative Playback Loop (Sample -> Student)
  const runPlaybackReview = (studentBlobUrl) => {
    setPhase('playing_review');

    // Run grading call in background while playback occurs
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
      // If no sample URL exists, just play the student attempt
      const studentAudio = new Audio(studentBlobUrl);
      studentAudio.play();
      studentAudio.onended = () => {
        setPhase('completed');
      };
    }
  };

  // 6. Server-Side Grading Handshake
  const executeGrading = async () => {
    // NEW: Wait up to 2 seconds for the browser STT to finish its asynchronous transcription
    let retries = 20;
    while (!speechTranscriptRef.current && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
    }

    const durationSec = Math.max(0.1, (Date.now() - recordingStartTimeRef.current) / 1000);

    // Calculate Pitch Standard Deviation
    const pitches = pitchValuesRef.current;
    let pitchVariance = 0;
    if (pitches.length > 1) {
      const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
      const variance = pitches.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pitches.length;
      pitchVariance = Math.sqrt(variance);
    }

    const isGhost = !speechTranscriptRef.current.trim() || durationSec < 0.5;

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

      // Calculate failed indices for subsequent attempt highlight
      const newFailed = new Set();
      (data.word_level_data || []).forEach((w, idx) => {
        if (w.score < 80 || w.error_type === 'Omission') {
          newFailed.add(idx);
        }
      });
      setFailedIndices(newFailed);

      // Scoring & Failsafe Resolution
      if (score >= 60) {
        // Successful pass
        const yieldPercent = attempt === 1 ? 100 : attempt === 2 ? 85 : 70;
        setPointsAwarded(yieldPercent);
        setCanContinue(true);
      } else {
        // Failed attempt
        if (attempt >= 3) {
          // 3-strike failsafe unlocked
          const finalYield = isGhost ? 0 : 50;
          setPointsAwarded(finalYield);
          setCanContinue(true);
        } else {
          setCanContinue(false);
        }
      }
    } catch (err) {
      console.error("Grading invocation failed:", err);
      // Failsafe for client network errors on attempt 3
      if (attempt >= 3) setCanContinue(true);
    }
  };

  // 7. Retrying Attempts
  const handleTryAgain = () => {
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
      {/* Top Meta Indicator */}
      <div className="flex items-center justify-between w-full mb-6 px-2 text-xs font-semibold tracking-wider uppercase text-slate-400">
        <span>Attempt {attempt} / 3</span>
        <span>Target: {cefrLevel}</span>
      </div>

      {/* Dynamic Subtitle / Heatmap Display */}
      <div className="text-xl md:text-2xl text-center leading-relaxed mb-8 select-none min-h-[4rem] flex flex-wrap items-center justify-center gap-2">
        {wordsList.map((word, idx) => {
          // Completed Phase: Render Granular Scorecard
          if (phase === 'completed' && wordResults[idx]) {
            const res = wordResults[idx];
            if (res.error_type === 'Omission') {
              return (
                <span key={idx} className="text-slate-500 line-through opacity-40">
                  {word}
                </span>
              );
            }
            if (res.score >= 80) {
              return (
                <span key={idx} className="text-emerald-400 font-bold">
                  {word}
                </span>
              );
            }
            if (res.score >= 60) {
              return (
                <span key={idx} className="text-[#fcd34d] font-bold">
                  {word}
                </span>
              );
            }
            return (
              <span key={idx} className="text-red-500 font-bold">
                {word}
              </span>
            );
          }

          // Pre-Recording / Recording Phase: Target Lock Escalation
          const isTargeted = failedIndices.has(idx);

          if (attempt === 2 && isTargeted) {
            return (
              <span key={idx} className="font-black underline text-white">
                {word}
              </span>
            );
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

          // Default styling for non-targeted words on retry
          if (attempt > 1 && !isTargeted) {
            return (
              <span key={idx} className="text-white/60 font-normal">
                {word}
              </span>
            );
          }

          // Neutral baseline (Attempt 1)
          return (
            <span key={idx} className="text-white font-medium">
              {word}
            </span>
          );
        })}
      </div>

      {/* Control Interface */}
      <div className="flex flex-col items-center gap-4 w-full">
        {phase === 'idle' && (
          <div className="flex items-center gap-4">
            {audioUrl && (
              <button
                onClick={playSample}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition"
              >
                Hear Sample
              </button>
            )}
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95"
            >
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
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-8 py-3 bg-slate-800 border border-red-500 text-red-400 font-bold rounded-xl shadow-lg transition transform active:scale-95 animate-pulse"
          >
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
                <button
                  onClick={handleTryAgain}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition"
                >
                  Try Again ({3 - attempt} left)
                </button>
              )}

              {canContinue && (
                <button
                  onClick={handleContinue}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition transform active:scale-95"
                >
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