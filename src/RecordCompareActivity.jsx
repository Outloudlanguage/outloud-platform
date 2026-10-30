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
  cefrLevel = 'A1',
  node = {},
  onComplete,
}) {
  const activeLessonId = lessonId || lesson_id || node.lesson_id || 'standalone-lesson';
  const activeNodeId = nodeId || node_id || node.id || 'default-node';
  const activeText = displayText || targetText || node.display_text || node.text || '';
  const activeRefAudio = referenceAudioUrl || audioUrl || node.audio_url || node.reference_audio_url || '';

  // THE STATE MACHINE
  // 'LISTEN' -> 'PLAYING_REF' -> 'RECORD' -> 'RECORDING' -> 
  // 'COMPARING_REF' -> 'COMPARING_STUDENT' -> 'EVALUATING' (if needed) -> 'RETRY' | 'PASSED'
  const [phase, setPhase] = useState('LISTEN');
  const [recordingTime, setRecordingTime] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);
  const [apiResult, setApiResult] = useState(null);
  const [playbackDone, setPlaybackDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const refAudioPlayer = useRef(null);
  const studentAudioPlayer = useRef(null);
  const studentAudioUrlRef = useRef(null); 

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (studentAudioUrlRef.current) URL.revokeObjectURL(studentAudioUrlRef.current);
    };
  }, []);

  // Sync Evaluation Resolution
  // Triggers only when BOTH the back-to-back playback is done AND the API has returned data.
  useEffect(() => {
    if (playbackDone && apiResult) {
      if (apiResult.is_ghost_attempt || apiResult.error) {
        setPhase('RETRY');
        return;
      }

      const tokens = apiResult.token_grades || [];
      const greenOrYellow = tokens.filter((t) => {
        const s = (t.visual_state || t.status || t.color || '').toLowerCase();
        return s === 'green' || s === 'correct' || s === 'pass' || s === 'yellow' || s === 'warning';
      }).length;

      const computedScore =
        apiResult.overall_score ??
        apiResult.overallScore ??
        (tokens.length > 0 ? Math.round((greenOrYellow / tokens.length) * 100) : 0);

      const passed =
        apiResult.passed !== undefined
          ? Boolean(apiResult.passed)
          : computedScore >= 75;

      if (passed) {
        setPhase('PASSED');
        if (onComplete) {
          onComplete({
            overallScore: computedScore,
            pointsAwarded: 10,
            passed: true,
          });
        }
      } else {
        setPhase('RETRY');
      }
    }
  }, [playbackDone, apiResult, onComplete]);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const triggerApiEvaluation = async (base64) => {
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-speech', {
        body: {
          lesson_id: activeLessonId,
          node_id: activeNodeId,
          cefr_level: cefrLevel,
          target_text: activeText,
          audio_base64: base64,
          attempt_number: attemptCount,
        },
      });

      if (error) throw error;
      
      if (!data?.is_ghost_attempt) {
        setAttemptCount(prev => prev + 1);
      }
      
      setApiResult(data);
    } catch (err) {
      console.error('Speech evaluation error:', err);
      setErrorMsg('Could not reach grading server. Try again.');
      setApiResult({ error: true }); 
    }
  };

  const handleDynamicAction = async () => {
    setErrorMsg(null);

    // 1. LISTEN TO MASTER
    if (phase === 'LISTEN' || phase === 'RETRY') {
      if (!refAudioPlayer.current) return;
      setApiResult(null);
      setPlaybackDone(false);
      setSelectedTokenIndex(null);
      setPhase('PLAYING_REF');
      refAudioPlayer.current.currentTime = 0;
      refAudioPlayer.current.play();
    }

    // 2. START RECORDING
    else if (phase === 'RECORD') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
        });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        // 3. AUTO-SUBMIT ON STOP
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const localUrl = URL.createObjectURL(audioBlob);
          studentAudioUrlRef.current = localUrl;
          if (studentAudioPlayer.current) studentAudioPlayer.current.src = localUrl;

          stream.getTracks().forEach((track) => track.stop());

          try {
            const base64 = await blobToBase64(audioBlob);
            triggerApiEvaluation(base64);

            // Lock UI and force back-to-back playback immediately
            setPhase('COMPARING_REF');
            if (refAudioPlayer.current) {
              refAudioPlayer.current.currentTime = 0;
              refAudioPlayer.current.play();
            }
          } catch (err) {
            setErrorMsg('Failed to process recorded audio.');
            setPhase('RETRY');
          }
        };

        mediaRecorder.start();
        setPhase('RECORDING');
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
      } catch (err) {
        setErrorMsg('Microphone access denied. Please enable permissions.');
      }
    }

    // 3. STOP RECORDING
    else if (phase === 'RECORDING') {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const handleRefAudioEnded = () => {
    if (phase === 'PLAYING_REF') {
      setPhase('RECORD'); 
    } else if (phase === 'COMPARING_REF') {
      setPhase('COMPARING_STUDENT');
      if (studentAudioPlayer.current) {
        studentAudioPlayer.current.currentTime = 0;
        studentAudioPlayer.current.play();
      }
    }
  };

  const handleStudentAudioEnded = () => {
    if (phase === 'COMPARING_STUDENT') {
      setPlaybackDone(true);
      if (!apiResult) {
        setPhase('EVALUATING');
      }
    }
  };

  const getTokenStyle = (token) => {
    const state = (token.visual_state || token.status || token.color || '').toLowerCase();
    if (state === 'green' || state === 'correct' || state === 'pass') return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]';
    if (state === 'yellow' || state === 'warning' || state === 'near') return 'text-[#fcd34d] drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]';
    if (state === 'red' || state === 'error' || state === 'fail') return 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]';
    if (state === 'grey_strikethrough' || state === 'omitted' || state === 'missing') return 'text-white/30 line-through';
    return 'text-white';
  };

  const getButtonProps = () => {
    switch (phase) {
      case 'LISTEN':
        return { text: '🔊 Listen', style: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]', disabled: false };
      case 'PLAYING_REF':
        return { text: 'Listening...', style: 'bg-blue-600/50 text-white/70 cursor-not-allowed', disabled: true };
      case 'RECORD':
        return { text: '🎙️ Record', style: 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]', disabled: false };
      case 'RECORDING':
        return { text: `🛑 Stop (${recordingTime}s)`, style: 'bg-rose-500 text-white animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.6)]', disabled: false };
      case 'COMPARING_REF':
        return { text: '⚖️ Comparing (Reference)...', style: 'bg-[#fcd34d]/50 text-[#08203e]/70 cursor-not-allowed', disabled: true };
      case 'COMPARING_STUDENT':
        return { text: '⚖️ Comparing (Your Attempt)...', style: 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_20px_rgba(252,211,77,0.4)] cursor-not-allowed', disabled: true };
      case 'EVALUATING':
        return { text: '⚙️ Grading...', style: 'bg-indigo-600 text-white animate-pulse cursor-not-allowed', disabled: true };
      case 'RETRY':
        return { text: '🔄 Retry', style: 'bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]', disabled: false };
      case 'PASSED':
        return { text: '✅ Evaluated', style: 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-not-allowed', disabled: true };
      default:
        return { text: 'Listen', style: 'bg-blue-600 text-white', disabled: false };
    }
  };

  const btnProps = getButtonProps();

  return (
    <div className="w-full flex flex-col gap-6 text-white font-montserrat p-4 md:p-6 bg-black/20 rounded-[2rem] border border-white/10 shadow-inner">
      
      {activeRefAudio && <audio ref={refAudioPlayer} src={activeRefAudio} onEnded={handleRefAudioEnded} className="hidden" crossOrigin="anonymous" />}
      <audio ref={studentAudioPlayer} onEnded={handleStudentAudioEnded} className="hidden" />

      {/* Target Phrase Display */}
      <div className="text-center min-h-[120px] flex flex-col items-center justify-center">
        {(!playbackDone || !apiResult?.token_grades) ? (
          <p className="text-2xl md:text-3xl font-black text-white leading-relaxed tracking-wide drop-shadow-md">
            {activeText || 'Listen to the reference audio and repeat the phrase clearly.'}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {apiResult.token_grades.map((token, idx) => {
                const wordText = token.word || token.token || token.text || '';
                const interEvent = apiResult.inter_word_events?.find((e) => e.after_index === idx || e.word_index === idx);

                return (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => setSelectedTokenIndex(selectedTokenIndex === idx ? null : idx)}
                      className={`text-2xl md:text-3xl font-black transition-all hover:scale-110 cursor-pointer ${getTokenStyle(token)}`}
                    >
                      {wordText}
                    </button>
                    {interEvent && (
                      <span title={interEvent.message || interEvent.type} className="text-sm font-black text-[#fcd34d]/70">
                        {interEvent.symbol || '‿'}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Tap any colored word for diagnostic feedback
            </p>
          </div>
        )}
      </div>

      {/* Selected Word Diagnostic Drawer */}
      {selectedTokenIndex !== null && apiResult?.token_grades?.[selectedTokenIndex] && (
        <div className="bg-black/50 border border-white/20 rounded-2xl p-5 text-sm space-y-2 animate-slide-up">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-black text-[#fcd34d] uppercase tracking-wider">
              Word: &ldquo;{apiResult.token_grades[selectedTokenIndex].word || apiResult.token_grades[selectedTokenIndex].token}&rdquo;
            </span>
            <button onClick={() => setSelectedTokenIndex(null)} className="text-xs font-bold uppercase text-white/50 hover:text-white">✕ Close</button>
          </div>
          <p className="text-white/90 font-medium">
            {apiResult.token_grades[selectedTokenIndex].feedback || apiResult.token_grades[selectedTokenIndex].diagnostic || 'Pronunciation analyzed.'}
          </p>
        </div>
      )}

      {/* Ghost Attempt / Error Banner */}
      {(errorMsg || apiResult?.is_ghost_attempt) && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-5 py-3 rounded-2xl text-sm font-bold text-center animate-fade-in">
          {errorMsg || "We couldn't hear you clearly. Please check your microphone and try again."}
        </div>
      )}

      {/* Prosody Diagnostics Panel */}
      {playbackDone && apiResult && !apiResult.is_ghost_attempt && !apiResult.error && (
        <div className="bg-black/40 border border-white/15 rounded-3xl p-5 space-y-4 animate-fade-in mt-2">
          {apiResult.recognized_transcript && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">
                What the AI Heard
              </span>
              <p className="text-sm text-white/90 font-medium italic mt-1">
                &ldquo;{apiResult.recognized_transcript}&rdquo;
              </p>
            </div>
          )}

          {apiResult.prosody_diagnostics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#fcd34d] font-black uppercase tracking-widest block">
                  Rhythm & Pacing
                </span>
                <p className="text-xs text-white/80 font-medium mt-1.5">
                  {apiResult.prosody_diagnostics.pacing_feedback ||
                    apiResult.prosody_diagnostics.speech_rate ||
                    'Cadence aligned with reference profile.'}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#fcd34d] font-black uppercase tracking-widest block">
                  Intonation & Stress
                </span>
                <p className="text-xs text-white/80 font-medium mt-1.5">
                  {apiResult.prosody_diagnostics.intonation_feedback ||
                    apiResult.prosody_diagnostics.pitch_contour ||
                    'Pitch contour evaluated.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* THE DYNAMIC ACTION BUTTON */}
      <div className="flex justify-center mt-2">
        <button
          type="button"
          disabled={btnProps.disabled}
          onClick={handleDynamicAction}
          className={`w-full max-w-sm px-8 py-5 rounded-full font-black text-sm md:text-base uppercase tracking-widest transition-all ${btnProps.style} ${!btnProps.disabled ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''}`}
        >
          {btnProps.text}
        </button>
      </div>

    </div>
  );
}