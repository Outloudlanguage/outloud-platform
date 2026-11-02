import React, { useState, useRef, useEffect } from 'react';

// Clean SVG Icons
const ListenIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.5 10H2v4h3.5l5 5V5l-5 5z" /></svg>;
const MicIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const StopIcon = () => <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;
const ScalesIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const CogIcon = () => <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const RetryIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

export default function RecordCompareActivity({
  displayText,
  targetText,
  referenceAudioUrl,
  audioUrl,
  node = {},
  onComplete,
}) {
  const activeText = displayText || targetText || node.display_text || node.text || '';
  const activeRefAudio = referenceAudioUrl || audioUrl || node.audio_url || node.reference_audio_url || '';

  // PHASES: LISTEN -> PLAYING_REF -> RECORD -> RECORDING -> ANALYZING -> COMPARING_REF -> COMPARING_STUDENT -> CONFIRM
  const [phase, setPhase] = useState('LISTEN');
  const [recordingTime, setRecordingTime] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);

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

  const analyzeAudioLocally = async (audioBlob, expectedText) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const channelData = audioBuffer.getChannelData(0);
          
          // 1. Duration Check
          const wordCount = (expectedText || "").split(/\s+/).length || 1;
          const minDuration = Math.min(0.4 + (wordCount * 0.15), 1.0); 
          if (audioBuffer.duration < minDuration) {
            return resolve({ passed: false, error: "Recording too short. Please read the full phrase." });
          }

          // 2. RMS Vocal Energy Check (Anti-Silence)
          let sumSquares = 0;
          for (let i = 0; i < channelData.length; i++) {
            sumSquares += channelData[i] * channelData[i];
          }
          const rms = Math.sqrt(sumSquares / channelData.length);
          if (rms < 0.005) {
            return resolve({ passed: false, error: "Volume too low. Please speak up or check your microphone." });
          }

          // 3. Syllabic Modulation Check (Anti-Blowing/White Noise)
          const chunkSize = Math.floor(audioBuffer.sampleRate * 0.1); 
          let peakCount = 0;
          let isSpeaking = false;

          for (let i = 0; i < channelData.length; i += chunkSize) {
            let chunkSum = 0;
            let limit = Math.min(i + chunkSize, channelData.length);
            for (let j = i; j < limit; j++) chunkSum += channelData[j] * channelData[j];
            let chunkRms = Math.sqrt(chunkSum / (limit - i));
            
            if (chunkRms > 0.015) {
              if (!isSpeaking) { peakCount++; isSpeaking = true; }
            } else {
              isSpeaking = false;
            }
          }

          if (peakCount < 1) {
            return resolve({ passed: false, error: "No clear speech detected. Avoid blowing into the microphone." });
          }

          resolve({ passed: true });
        } catch (err) {
          console.error("DSP Context Error:", err);
          resolve({ passed: true }); // Fail-open so a browser quirk doesn't block the student
        }
      };
      reader.onerror = () => resolve({ passed: true }); // Fail-open
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  const handleDynamicAction = async () => {
    setErrorMsg(null);

    if (phase === 'LISTEN' || phase === 'RETRY') {
      if (!refAudioPlayer.current) return;
      
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

        mediaRecorder.onstop = async () => {
          setPhase('ANALYZING');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const localUrl = URL.createObjectURL(audioBlob);
          studentAudioUrlRef.current = localUrl;
          if (studentAudioPlayer.current) studentAudioPlayer.current.src = localUrl;
          stream.getTracks().forEach((track) => track.stop());

          // Run Local DSP
          const dspResult = await analyzeAudioLocally(audioBlob, activeText);
          
          if (!dspResult.passed && attemptCount < 3) {
            setErrorMsg(dspResult.error);
            setAttemptCount(prev => prev + 1);
            setPhase('RETRY');
            return;
          }

          // Passed (or hit 3-attempt safety limit)
          setPhase('COMPARING_REF');
          if (refAudioPlayer.current) {
            refAudioPlayer.current.currentTime = 0;
            refAudioPlayer.current.play().catch(e => console.error("Compare play error:", e));
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
    
    else if (phase === 'RECORDING') {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }

    else if (phase === 'CONFIRM') {
      if (onComplete) onComplete({ overallScore: 100, pointsAwarded: 10, passed: true });
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
      setPhase('CONFIRM');
    }
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
      case 'ANALYZING':
        return { text: 'VERIFYING AUDIO...', style: 'bg-indigo-600 text-white cursor-not-allowed', disabled: true, icon: <CogIcon /> };
      case 'COMPARING_REF':
      case 'COMPARING_STUDENT':
        return { text: 'COMPARING...', style: 'bg-[#fcd34d] text-[#08203e] opacity-90 cursor-not-allowed', disabled: true, icon: <ScalesIcon /> };
      case 'RETRY':
        return { text: 'RETRY', style: 'bg-orange-500 hover:bg-orange-400 text-white', disabled: false, icon: <RetryIcon /> };
      case 'CONFIRM':
        return { text: 'CONFIRM & CONTINUE', style: 'bg-emerald-500 hover:bg-emerald-400 text-white', disabled: false, icon: <CheckIcon /> };
      default:
        return { text: 'LISTEN', style: 'bg-blue-600 text-white', disabled: false, icon: null };
    }
  };

  const btnProps = getButtonConfig();

  return (
    <div className="w-full font-montserrat bg-black/40 rounded-[2rem] border border-white/10 shadow-inner flex flex-col items-center overflow-hidden min-h-[350px]">
      
      {activeRefAudio && <audio ref={refAudioPlayer} src={activeRefAudio} onEnded={handleRefAudioEnded} className="hidden" preload="auto" />}
      <audio ref={studentAudioPlayer} onEnded={handleStudentAudioEnded} className="hidden" />

      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <p className="text-2xl md:text-3xl font-black text-white leading-relaxed tracking-wide drop-shadow-md text-center">
          {activeText || 'Target phrase will appear here.'}
        </p>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-5 py-3 rounded-2xl text-xs uppercase tracking-widest font-black text-center mt-6 animate-fade-in">
            {errorMsg}
          </div>
        )}
      </div>

      <div className="w-full p-6 bg-black/20 border-t border-white/5 mt-auto flex flex-col items-center">
        <button
          type="button"
          disabled={btnProps.disabled}
          onClick={handleDynamicAction}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center transition-all shadow-xl ${btnProps.style} ${!btnProps.disabled ? 'hover:scale-[1.02] active:scale-95' : ''}`}
        >
          {btnProps.icon}
          {btnProps.text}
        </button>
        
        {phase === 'CONFIRM' && (
          <button 
            onClick={() => setPhase('RECORD')} 
            className="mt-4 text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors"
          >
            ↻ Try Again
          </button>
        )}
      </div>
    </div>
  );
}