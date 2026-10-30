import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './SupabaseClient';

export default function RecordCompareActivity({
  lessonId,
  lesson_id,
  nodeId,
  node_id,
  displayText,
  targetText,
  referenceAudioUrl,
  audioUrl,
  node = {},
  onComplete,
}) {
  // Normalize props regardless of how parent components pass them
  const activeLessonId = lessonId || lesson_id || node.lesson_id || 'default-lesson';
  const activeNodeId = nodeId || node_id || node.id || 'default-node';
  const activeText = displayText || targetText || node.display_text || node.text || '';
  const activeRefAudio = referenceAudioUrl || audioUrl || node.audio_url || node.reference_audio_url || '';

  // Audio & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [studentAudioUrl, setStudentAudioUrl] = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [isPlayingStudent, setIsPlayingStudent] = useState(false);

  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const refAudioPlayer = useRef(null);
  const studentAudioPlayer = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (studentAudioUrl) URL.revokeObjectURL(studentAudioUrl);
    };
  }, [studentAudioUrl]);

  // Convert recorded Blob to pure Base64 string (stripping the data URL prefix)
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64String = dataUrl.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start Microphone Recording
  const startRecording = async () => {
    setErrorMsg(null);
    setEvaluationResult(null);
    setSelectedTokenIndex(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setStudentAudioUrl(localUrl);

        try {
          const base64 = await blobToBase64(audioBlob);
          setAudioBase64(base64);
        } catch (err) {
          setErrorMsg('Failed to process recorded audio.');
        }

        // Release microphone hardware lock
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setErrorMsg('Microphone access denied. Please enable microphone permissions in your browser.');
    }
  };

  // Stop Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Submit Audio to Supabase Edge Function -> Google Cloud Run Worker
  const handleEvaluate = async () => {
    if (!audioBase64) {
      setErrorMsg('Please record your voice before submitting.');
      return;
    }

    setIsEvaluating(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-speech', {
        body: {
          lesson_id: activeLessonId,
          node_id: activeNodeId,
          audio_base64: audioBase64,
          attempt_number: attemptCount,
        },
      });

      if (error) throw error;

      setEvaluationResult(data);

      // Only increment the attempt counter if it was a real speech attempt
      if (!data?.is_ghost_attempt) {
        setAttemptCount((prev) => prev + 1);
      }

      if (data?.passed && onComplete) {
        onComplete(data);
      }
    } catch (err) {
      console.error('Speech evaluation error:', err);
      setErrorMsg(err.message || 'Could not reach the acoustic evaluation server. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Map token status/color from the Edge Function to Tailwind styles
  const getTokenStyle = (token) => {
    const state = (token.visual_state || token.status || token.color || '').toLowerCase();

    if (state === 'green' || state === 'correct' || state === 'pass') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (state === 'yellow' || state === 'warning' || state === 'near') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (state === 'red' || state === 'error' || state === 'fail') {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    if (state === 'grey_strikethrough' || state === 'omitted' || state === 'missing') {
      return 'bg-slate-700/40 text-slate-400 line-through border-slate-600';
    }
    return 'bg-slate-800 text-slate-200 border-slate-700';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header & Attempt Counter */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Acoustic Practice
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">Record & Compare</h2>
        </div>
        <div className="text-xs font-medium bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
          Attempt #{attemptCount}
        </div>
      </div>

      {/* Target Phrase / Graded Tokens Display */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-6 text-center">
        {!evaluationResult || !evaluationResult.token_grades ? (
          <p className="text-2xl font-medium text-slate-100 leading-relaxed tracking-wide">
            {activeText || 'Listen to the reference audio and repeat the phrase clearly.'}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {evaluationResult.token_grades.map((token, idx) => {
                const wordText = token.word || token.token || token.text || '';
                const interEvent = evaluationResult.inter_word_events?.find(
                  (e) => e.after_index === idx || e.word_index === idx
                );

                return (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => setSelectedTokenIndex(selectedTokenIndex === idx ? null : idx)}
                      className={`px-3 py-1.5 rounded-lg border text-lg font-medium transition-all hover:scale-105 ${getTokenStyle(
                        token
                      )}`}
                    >
                      {wordText}
                    </button>

                    {/* Optional Inter-word Event Indicator (Pauses / Linking) */}
                    {interEvent && (
                      <span
                        title={interEvent.message || interEvent.type}
                        className="text-xs px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60"
                      >
                        {interEvent.symbol || '‿'}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">
              Click any highlighted word above to inspect its acoustic breakdown.
            </p>
          </div>
        )}
      </div>

      {/* Selected Word Diagnostic Drawer */}
      {selectedTokenIndex !== null && evaluationResult?.token_grades?.[selectedTokenIndex] && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base">
              Word: &ldquo;{evaluationResult.token_grades[selectedTokenIndex].word ||
                evaluationResult.token_grades[selectedTokenIndex].token ||
                evaluationResult.token_grades[selectedTokenIndex].text}&rdquo;
            </span>
            <button
              type="button"
              onClick={() => setSelectedTokenIndex(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-slate-300">
            {evaluationResult.token_grades[selectedTokenIndex].feedback ||
              evaluationResult.token_grades[selectedTokenIndex].diagnostic ||
              'Pronunciation analyzed against the reference model.'}
          </p>
        </div>
      )}

      {/* Audio Controls: Reference vs Student */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reference Audio Card */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Reference Model</p>
            <p className="text-xs text-slate-400">Listen to target cadence & pronunciation</p>
          </div>
          {activeRefAudio ? (
            <>
              <audio
                ref={refAudioPlayer}
                src={activeRefAudio}
                onEnded={() => setIsPlayingRef(false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  if (!refAudioPlayer.current) return;
                  if (isPlayingRef) {
                    refAudioPlayer.current.pause();
                    setIsPlayingRef(false);
                  } else {
                    refAudioPlayer.current.play();
                    setIsPlayingRef(true);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
              >
                {isPlayingRef ? 'Pause' : 'Listen'}
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-500 italic">No reference audio</span>
          )}
        </div>

        {/* Student Recording Controls */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Your Recording</p>
            <p className="text-xs text-slate-400">
              {isRecording
                ? `Recording... ${formatTime(recordingTime)}`
                : studentAudioUrl
                ? 'Ready to review or evaluate'
                : 'Press Record to start'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {studentAudioUrl && !isRecording && (
              <>
                <audio
                  ref={studentAudioPlayer}
                  src={studentAudioUrl}
                  onEnded={() => setIsPlayingStudent(false)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!studentAudioPlayer.current) return;
                    if (isPlayingStudent) {
                      studentAudioPlayer.current.pause();
                      setIsPlayingStudent(false);
                    } else {
                      studentAudioPlayer.current.play();
                      setIsPlayingStudent(true);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
                >
                  {isPlayingStudent ? 'Stop' : 'Replay'}
                </button>
              </>
            )}

            {!isRecording ? (
              <button
                type="button"
                disabled={isEvaluating}
                onClick={startRecording}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-medium transition"
              >
                {studentAudioUrl ? 'Re-record' : 'Record'}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold animate-pulse transition"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit for AI Evaluation Button */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!audioBase64 || isRecording || isEvaluating}
          onClick={handleEvaluate}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
        >
          {isEvaluating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Acoustics...
            </>
          ) : (
            'Evaluate Pronunciation'
          )}
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-200 px-4 py-3 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      {/* Ghost Attempt Warning */}
      {evaluationResult?.is_ghost_attempt && (
        <div className="bg-amber-950/60 border border-amber-800 text-amber-200 px-4 py-3 rounded-xl text-sm">
          We couldn&apos;t detect clear speech in that recording. Check your microphone and try again—this attempt was not counted against you.
        </div>
      )}

      {/* Prosody & Transcript Feedback Panel */}
      {evaluationResult && !evaluationResult.is_ghost_attempt && (
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-5 space-y-4">
          {evaluationResult.recognized_transcript && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                What the AI Heard
              </span>
              <p className="text-sm text-slate-200 italic mt-1">
                &ldquo;{evaluationResult.recognized_transcript}&rdquo;
              </p>
            </div>
          )}

          {evaluationResult.prosody_diagnostics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-indigo-400 font-semibold block">
                  Rhythm & Pacing
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  {evaluationResult.prosody_diagnostics.pacing_feedback ||
                    evaluationResult.prosody_diagnostics.speech_rate ||
                    'Cadence aligned with reference profile.'}
                </p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-indigo-400 font-semibold block">
                  Intonation & Stress
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  {evaluationResult.prosody_diagnostics.intonation_feedback ||
                    evaluationResult.prosody_diagnostics.pitch_contour ||
                    'Pitch contour evaluated.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}