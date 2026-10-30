import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './SupabaseClient';

// Clean SVG Icons
const ListenIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.5 10H2v4h3.5l5 5V5l-5 5z" /></svg>;
const MicIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const StopIcon = () => <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;
const ScalesIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const CogIcon = () => <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const RetryIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

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

  // STATE MACHINE LOGIC
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

      const passed = apiResult.passed !== undefined ? Boolean(apiResult.passed) : computedScore >= 75;

      if (passed) {
        setPhase('PASSED');
        if (onComplete) onComplete({ overallScore: computedScore, pointsAwarded: 10, passed: true });
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
      if (!data?.is_ghost_attempt) setAttemptCount(prev => prev + 1);
      setApiResult(data);
    } catch (err) {
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
      
      // Mobile Safari strictly requires the play promise to be caught to prevent silent crashes
      const playPromise = refAudioPlayer.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPhase('PLAYING_REF');
        }).catch(error => {
          console.error("Audio block:", error);
          setErrorMsg("Audio blocked by browser. Check volume & permissions.");
          setPhase('LISTEN');
        });
      }
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

            setPhase('COMPARING_REF');
            if (refAudioPlayer.current) {
              refAudioPlayer.current.currentTime = 0;
              refAudioPlayer.current.play().catch(e => console.error("Compare play error:", e));
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
        studentAudioPlayer.current.play().catch(e => console.error("Student play error:", e));
      }
    }
  };

  const handleStudentAudioEnded = () => {
    if (phase === 'COMPARING_STUDENT') {
      setPlaybackDone(true);
      if (!apiResult) setPhase('EVALUATING');
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

  const getButtonConfig = () => {
    switch (phase) {
      case 'LISTEN':
        return { text: 'LISTEN', style: 'bg-blue-600 hover:bg-blue-500 text-white', disabled: false, icon: <ListenIcon /> };
      case 'PLAYING_REF':
        return { text: 'LISTENING...', style: 'bg-blue-600/80 text-white cursor-not-allowed', disabled: true, icon: null };
      case 'RECORD':
        return { text: 'RECORD', style: 'bg-rose-600 hover:bg-rose-500 text-white', disabled: false, icon: <MicIcon /> };
      case 'RECORDING':
        return { text: `STOP (${recordingTime}s)`, style: 'bg-rose-500 text-white animate-pulse', disabled: false, icon: <StopIcon /> };
      case 'COMPARING_REF':
      case 'COMPARING_STUDENT':
        return { text: 'COMPARING...', style: 'bg-[#fcd34d] text-[#08203e] opacity-90 cursor-not-allowed', disabled: true, icon: <ScalesIcon /> };
      case 'EVALUATING':
        return { text: 'GRADING...', style: 'bg-indigo-600 text-white cursor-not-allowed', disabled: true, icon: <CogIcon /> };
      case 'RETRY':
        return { text: 'RETRY', style: 'bg-orange-500 hover:bg-orange-400 text-white', disabled: false, icon: <RetryIcon /> };
      case 'PASSED':
        return { text: 'PASSED', style: 'bg-emerald-500 text-white cursor-not-allowed', disabled: true, icon: <CheckIcon /> };
      default:
        return { text: 'LISTEN', style: 'bg-blue-600 text-white', disabled: false, icon: null };
    }
  };

  const btnProps = getButtonConfig();

  return (
    <div className="w-full font-montserrat bg-black/40 rounded-[2rem] border border-white/10 shadow-inner flex flex-col items-center overflow-hidden min-h-[350px]">
      
      {/* Removed crossOrigin="anonymous" to prevent CORS blocks on mobile */}
      {activeRefAudio && <audio ref={refAudioPlayer} src={activeRefAudio} onEnded={handleRefAudioEnded} className="hidden" preload="auto" />}
      <audio ref={studentAudioPlayer} onEnded={handleStudentAudioEnded} className="hidden" />

      {/* Target Phrase Display */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        {(!playbackDone || !apiResult?.token_grades) ? (
          <p className="text-2xl md:text-3xl font-black text-white leading-relaxed tracking-wide drop-shadow-md text-center">
            {activeText || 'Target phrase will appear here.'}
          </p>
        ) : (
          <div className="space-y-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
              {apiResult.token_grades.map((token, idx) => {
                const wordText = token.word || token.token || token.text || '';
                const interEvent = apiResult.inter_word_events?.find((e) => e.after_index === idx || e.word_index === idx);

                return (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => setSelectedTokenIndex(selectedTokenIndex === idx ? null : idx)}
                      className={`text-2xl md:text-3xl font-black transition-transform hover:scale-105 cursor-pointer ${getTokenStyle(token)}`}
                    >
                      {wordText}
                    </button>
                    {interEvent && (
                      <span title={interEvent.message || interEvent.type} className="text-sm font-black text-[#fcd34d]/70 px-1">
                        {interEvent.symbol || '‿'}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 pt-4">
              Tap any colored word for diagnostic feedback
            </p>
          </div>
        )}

        {/* Selected Word Diagnostic Drawer */}
        {selectedTokenIndex !== null && apiResult?.token_grades?.[selectedTokenIndex] && (
          <div className="bg-black/50 border border-white/20 rounded-2xl p-5 text-sm space-y-2 animate-slide-up mt-6 w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-black text-[#fcd34d] uppercase tracking-wider">
                Word: &ldquo;{apiResult.token_grades[selectedTokenIndex].word || apiResult.token_grades[selectedTokenIndex].token}&rdquo;
              </span>
              <button onClick={() => setSelectedTokenIndex(null)} className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white">✕ Close</button>
            </div>
            <p className="text-white/90 font-medium">
              {apiResult.token_grades[selectedTokenIndex].feedback || apiResult.token_grades[selectedTokenIndex].diagnostic || 'Pronunciation analyzed.'}
            </p>
          </div>
        )}

        {/* Error Banner */}
        {(errorMsg || apiResult?.is_ghost_attempt) && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-5 py-3 rounded-2xl text-xs uppercase tracking-widest font-black text-center mt-6">
            {errorMsg || "We couldn't hear you clearly. Check mic and retry."}
          </div>
        )}
      </div>

      {/* THE DYNAMIC ACTION BUTTON */}
      <div className="w-full p-6 bg-black/20 border-t border-white/5 mt-auto">
        <button
          type="button"
          disabled={btnProps.disabled}
          onClick={handleDynamicAction}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center transition-all shadow-xl ${btnProps.style} ${!btnProps.disabled ? 'hover:scale-[1.02] active:scale-95' : ''}`}
        >
          {btnProps.icon}
          {btnProps.text}
        </button>
      </div>

    </div>
  );
}