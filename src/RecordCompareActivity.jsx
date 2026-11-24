import React, { useState, useRef, useEffect } from 'react';
import { OutLoudIcon } from './components/OutLoudBrand';

// Clean 2px-Stroked Vector Icons
const ListenIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.5 10H2v4h3.5l5 5V5l-5 5z" />
  </svg>
);

const MicIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
  </svg>
);

const ScalesIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RetryIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const STUDIO_STEPS = [
  { num: 1, label: 'Escucha' },
  { num: 2, label: 'Graba' },
  { num: 3, label: 'Compara' },
  { num: 4, label: 'Confirma' },
];

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

  // PHASES: LISTEN -> PLAYING_REF -> RECORD -> RECORDING -> ANALYZING -> COMPARING_REF -> COMPARING_STUDENT -> CONFIRM (plus RETRY)
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
        let audioCtx = null;
        try {
          const arrayBuffer = e.target.result;
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const channelData = audioBuffer.getChannelData(0);

          // 1. Duration Check
          const wordCount = (expectedText || '').split(/\s+/).length || 1;
          const minDuration = Math.min(0.4 + wordCount * 0.15, 1.0);
          if (audioBuffer.duration < minDuration) {
            return resolve({ passed: false, error: 'Grabación muy corta. Lee la frase completa.' });
          }

          // 2. RMS Vocal Energy Check (Anti-Silence)
          let sumSquares = 0;
          for (let i = 0; i < channelData.length; i++) {
            sumSquares += channelData[i] * channelData[i];
          }
          const rms = Math.sqrt(sumSquares / channelData.length);
          if (rms < 0.005) {
            return resolve({ passed: false, error: 'Volumen muy bajo. Habla más fuerte o revisa tu micrófono.' });
          }

          // 3. Syllabic Modulation Check (Anti-Blowing/White Noise)
          const chunkSize = Math.floor(audioBuffer.sampleRate * 0.1);
          let peakCount = 0;
          let isSpeaking = false;

          for (let i = 0; i < channelData.length; i += chunkSize) {
            let chunkSum = 0;
            const limit = Math.min(i + chunkSize, channelData.length);
            for (let j = i; j < limit; j++) chunkSum += channelData[j] * channelData[j];
            const chunkRms = Math.sqrt(chunkSum / (limit - i));

            if (chunkRms > 0.015) {
              if (!isSpeaking) {
                peakCount++;
                isSpeaking = true;
              }
            } else {
              isSpeaking = false;
            }
          }

          if (peakCount < 1) {
            return resolve({
              passed: false,
              error: 'No detectamos voz clara. Evita soplar sobre el micrófono.',
            });
          }

          resolve({ passed: true });
        } catch (err) {
          console.error('DSP Context Error:', err);
          resolve({ passed: true }); // Fail-open so a browser quirk doesn't block the student
        } finally {
          if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close().catch(() => {});
          }
        }
      };
      reader.onerror = () => resolve({ passed: true });
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  const handleDynamicAction = async () => {
    setErrorMsg(null);

    if (phase === 'LISTEN' || phase === 'RETRY') {
      if (!activeRefAudio) {
        setPhase('RECORD');
        return;
      }
      if (!refAudioPlayer.current) return;

      refAudioPlayer.current.currentTime = 0;
      const playPromise = refAudioPlayer.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPhase('PLAYING_REF');
          })
          .catch((error) => {
            console.error('Audio block:', error);
            setErrorMsg('Audio bloqueado por el navegador. Verifica el volumen y permisos.');
            setPhase('LISTEN');
          });
      }
    } else if (phase === 'RECORD') {
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

          if (studentAudioUrlRef.current) {
            URL.revokeObjectURL(studentAudioUrlRef.current);
          }
          const localUrl = URL.createObjectURL(audioBlob);
          studentAudioUrlRef.current = localUrl;
          if (studentAudioPlayer.current) studentAudioPlayer.current.src = localUrl;
          stream.getTracks().forEach((track) => track.stop());

          // Run Local DSP
          const dspResult = await analyzeAudioLocally(audioBlob, activeText);

          if (!dspResult.passed && attemptCount < 3) {
            setErrorMsg(dspResult.error);
            setAttemptCount((prev) => prev + 1);
            setPhase('RETRY');
            return;
          }

          // Passed (or hit 3-attempt safety limit)
          if (activeRefAudio && refAudioPlayer.current) {
            setPhase('COMPARING_REF');
            refAudioPlayer.current.currentTime = 0;
            refAudioPlayer.current.play().catch((e) => {
              console.error('Compare play error:', e);
              setPhase('CONFIRM');
            });
          } else if (studentAudioPlayer.current) {
            setPhase('COMPARING_STUDENT');
            studentAudioPlayer.current.currentTime = 0;
            studentAudioPlayer.current.play().catch(() => setPhase('CONFIRM'));
          } else {
            setPhase('CONFIRM');
          }
        };

        mediaRecorder.start();
        setPhase('RECORDING');
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
      } catch (err) {
        setErrorMsg('Acceso al micrófono denegado. Activa los permisos en tu navegador.');
      }
    } else if (phase === 'RECORDING') {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else if (phase === 'CONFIRM') {
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
        studentAudioPlayer.current.play().catch((e) => {
          console.error('Student play error:', e);
          setPhase('CONFIRM');
        });
      }
    }
  };

  const handleStudentAudioEnded = () => {
    if (phase === 'COMPARING_STUDENT') {
      setPhase('CONFIRM');
    }
  };

  const currentStepIndex =
    phase === 'LISTEN' || phase === 'PLAYING_REF'
      ? 1
      : phase === 'RECORD' || phase === 'RECORDING' || phase === 'RETRY'
      ? 2
      : phase === 'ANALYZING' || phase === 'COMPARING_REF' || phase === 'COMPARING_STUDENT'
      ? 3
      : 4;

  const isWaveActive = ['PLAYING_REF', 'RECORDING', 'COMPARING_REF', 'COMPARING_STUDENT'].includes(phase);

  const stageTone =
    phase === 'RECORDING'
      ? { badge: 'Grabando • ' + recordingTime + 's', badgeCls: 'bg-[#ee665b] text-white border-[#1e2246]', barA: '#ee665b', barB: '#ffc749' }
      : phase === 'COMPARING_STUDENT'
      ? { badge: 'Reproduciendo: Tu Voz', badgeCls: 'bg-[#16a37f] text-white border-[#1e2246]', barA: '#16a37f', barB: '#ffc749' }
      : phase === 'PLAYING_REF' || phase === 'COMPARING_REF'
      ? { badge: 'Audio Modelo OutLoud', badgeCls: 'bg-[#5b64a0] text-white border-[#1e2246]', barA: '#5b64a0', barB: '#ffc749' }
      : phase === 'ANALYZING'
      ? { badge: 'Analizando Voz...', badgeCls: 'bg-[#1e2246] text-[#ffc749] border-[#1e2246]', barA: '#626a9f', barB: '#ffc749' }
      : phase === 'CONFIRM'
      ? { badge: '¡Práctica Lista!', badgeCls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]', barA: '#16a37f', barB: '#626a9f' }
      : phase === 'RETRY'
      ? { badge: `Intento ${attemptCount} de 3`, badgeCls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]', barA: '#ee665b', barB: '#ffc749' }
      : { badge: phase === 'RECORD' ? 'Tu Turno de Hablar' : 'Paso 1: Escucha Primero', badgeCls: 'bg-white text-[#1e2246] border-[#ffc749]', barA: '#626a9f', barB: '#ffc749' };

  const getButtonConfig = () => {
    switch (phase) {
      case 'LISTEN':
        return {
          text: 'Escuchar Audio Modelo',
          style:
            'bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-[#1e2246] shadow-[0_4px_0_#1e2246,0_12px_24px_-8px_rgba(255,199,73,0.6)] hover:-translate-y-0.5 active:translate-y-0.5',
          disabled: false,
          icon: <ListenIcon />,
        };
      case 'PLAYING_REF':
        return {
          text: 'Escuchando Modelo...',
          style: 'bg-[#5b64a0] text-white border-[#1e2246] opacity-90 cursor-not-allowed',
          disabled: true,
          icon: <ListenIcon />,
        };
      case 'RECORD':
        return {
          text: 'Grabar Mi Voz',
          style:
            'bg-[#ee665b] text-white border-[#1e2246] shadow-[0_4px_0_#1e2246,0_12px_24px_-8px_rgba(238,102,91,0.55)] hover:-translate-y-0.5 active:translate-y-0.5',
          disabled: false,
          icon: <MicIcon />,
        };
      case 'RECORDING':
        return {
          text: `Detener Grabación (${recordingTime}s)`,
          style:
            'bg-[#ee665b] text-white border-[#1e2246] shadow-[0_4px_0_#1e2246] animate-pulse hover:-translate-y-0.5 active:translate-y-0.5',
          disabled: false,
          icon: <StopIcon />,
        };
      case 'ANALYZING':
        return {
          text: 'Verificando Audio...',
          style: 'bg-[#1e2246] text-[#ffc749] border-[#1e2246] cursor-not-allowed',
          disabled: true,
          icon: <CogIcon />,
        };
      case 'COMPARING_REF':
        return {
          text: 'Comparando: Audio Modelo...',
          style: 'bg-[#fff3d1] text-[#1e2246] border-[#1e2246] cursor-not-allowed',
          disabled: true,
          icon: <ScalesIcon />,
        };
      case 'COMPARING_STUDENT':
        return {
          text: 'Comparando: Tu Voz...',
          style: 'bg-[#e7faf3] text-[#128063] border-[#16a37f] cursor-not-allowed',
          disabled: true,
          icon: <ScalesIcon />,
        };
      case 'RETRY':
        return {
          text: 'Escuchar e Intentar de Nuevo',
          style:
            'bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5',
          disabled: false,
          icon: <RetryIcon />,
        };
      case 'CONFIRM':
        return {
          text: 'Confirmar y Continuar →',
          style:
            'bg-[#16a37f] text-white border-[#1e2246] shadow-[0_4px_0_#1e2246,0_12px_24px_-8px_rgba(22,163,127,0.55)] hover:-translate-y-0.5 active:translate-y-0.5',
          disabled: false,
          icon: <CheckIcon />,
        };
      default:
        return {
          text: 'Escuchar',
          style: 'bg-[#ffc749] text-[#1e2246] border-[#1e2246] shadow-[0_4px_0_#1e2246]',
          disabled: false,
          icon: <ListenIcon />,
        };
    }
  };

  const btnProps = getButtonConfig();

  return (
    <div className="w-full font-montserrat flex flex-col gap-5">
      <style>{`
        @keyframes olaRcWaveActive {
          0%, 100% { transform: scaleY(0.32); }
          50% { transform: scaleY(1); }
        }
        @keyframes olaRcWaveIdle {
          0%, 100% { transform: scaleY(0.55); }
          50% { transform: scaleY(0.75); }
        }
        .ola-rc-wave-active {
          transform-origin: center;
          animation: olaRcWaveActive 0.65s ease-in-out infinite;
        }
        .ola-rc-wave-idle {
          transform-origin: center;
          animation: olaRcWaveIdle 2.2s ease-in-out infinite;
        }
      `}</style>

      {activeRefAudio && (
        <audio
          ref={refAudioPlayer}
          src={activeRefAudio}
          onEnded={handleRefAudioEnded}
          className="hidden"
          preload="auto"
        />
      )}
      <audio ref={studentAudioPlayer} onEnded={handleStudentAudioEnded} className="hidden" />

      {/* 1. 4-STEP VOCAL LOOP STEPPER */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 bg-[#f4f6fc] border border-white rounded-full p-1.5 shadow-inner">
        {STUDIO_STEPS.map((step) => {
          const isCompleted = currentStepIndex > step.num;
          const isCurrent = currentStepIndex === step.num;
          return (
            <div
              key={step.num}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                isCurrent
                  ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                  : isCompleted
                  ? 'bg-[#e7faf3] text-[#128063]'
                  : 'text-[#626a9f]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-[#ffc749] text-[#1e2246]'
                    : isCompleted
                    ? 'bg-[#16a37f] text-white'
                    : 'bg-white text-[#626a9f]'
                }`}
              >
                {isCompleted ? '✓' : step.num}
              </span>
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* 2. LANDING-STYLE ANIMATED ACOUSTIC STAGE */}
      <div className="w-full rounded-[2rem] bg-gradient-to-br from-[#fff9e8] via-[#f6f7fc] to-[#e6e9fa] border-2 border-white shadow-inner p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
        {/* Top Status Pill */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-widest mb-6 shadow-sm ${stageTone.badgeCls}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              phase === 'RECORDING'
                ? 'bg-white animate-ping'
                : isWaveActive
                ? 'bg-[#ffc749] animate-pulse'
                : phase === 'CONFIRM'
                ? 'bg-[#16a37f]'
                : 'bg-[#626a9f]'
            }`}
          />
          <span>{stageTone.badge}</span>
        </div>

        {/* Smiling Headphone Icon + Reactive Dual Waveforms */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6">
          {/* Left Waveform */}
          <div className="flex items-center gap-1.5">
            {[16, 30, 22, 36, 18].map((h, i) => (
              <span
                key={`rc-l-${i}`}
                className={`w-1.5 rounded-full transition-colors duration-300 ${
                  isWaveActive ? 'ola-rc-wave-active' : 'ola-rc-wave-idle'
                }`}
                style={{
                  height: `${h}px`,
                  backgroundColor: i % 2 === 0 ? stageTone.barA : stageTone.barB,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>

          {/* Central OutLoud Smiling Headphone Mark */}
          <div
            className={`relative transition-transform duration-300 ${
              phase === 'RECORDING'
                ? 'scale-110'
                : isWaveActive
                ? 'scale-105'
                : ''
            }`}
          >
            {phase === 'RECORDING' && (
              <span className="absolute -inset-2 rounded-[1.6rem] border-2 border-[#ee665b] animate-ping opacity-45 pointer-events-none" />
            )}
            <OutLoudIcon className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_10px_18px_rgba(98,106,159,0.28)]" />
          </div>

          {/* Right Waveform */}
          <div className="flex items-center gap-1.5">
            {[18, 36, 22, 30, 16].map((h, i) => (
              <span
                key={`rc-r-${i}`}
                className={`w-1.5 rounded-full transition-colors duration-300 ${
                  isWaveActive ? 'ola-rc-wave-active' : 'ola-rc-wave-idle'
                }`}
                style={{
                  height: `${h}px`,
                  backgroundColor: i % 2 === 0 ? stageTone.barB : stageTone.barA,
                  animationDelay: `${(i + 2) * 0.12}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Target Phrase Display Well */}
        <div className="w-full max-w-2xl bg-white/90 border border-white rounded-2xl px-5 py-4 sm:px-7 sm:py-5 shadow-sm text-center">
          <span className="block text-[9.5px] font-bold uppercase tracking-widest text-[#626a9f] mb-1.5">
            Frase Objetivo
          </span>
          <p className="text-xl sm:text-3xl font-extrabold text-[#1e2246] leading-snug tracking-tight">
            &ldquo;{activeText || 'Target phrase will appear here.'}&rdquo;
          </p>
        </div>

        {/* Validation Feedback Callout */}
        {errorMsg && (
          <div className="mt-5 w-full max-w-xl bg-[#fff2f1] border-2 border-[#ee665b] text-[#c93f34] px-4 py-3 rounded-2xl text-xs font-extrabold text-center shadow-sm">
            {errorMsg}
          </div>
        )}
      </div>

      {/* 3. NEO-TACTILE ACTION DOCK */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          type="button"
          disabled={btnProps.disabled}
          onClick={handleDynamicAction}
          className={`w-full py-4 px-6 rounded-full border-2 font-extrabold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center transition-all cursor-pointer ${btnProps.style}`}
        >
          {btnProps.icon}
          <span>{btnProps.text}</span>
        </button>

        {phase === 'CONFIRM' && (
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setPhase('RECORD');
            }}
            className="w-full sm:w-auto shrink-0 px-6 py-4 rounded-full bg-white hover:bg-[#fff3d1] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_rgba(30,34,70,0.16)] font-extrabold text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
          >
            ↻ Grabar Otra Vez
          </button>
        )}
      </div>
    </div>
  );
}