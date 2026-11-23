import React, { useState, useRef, useEffect } from 'react';
import { OutLoudIcon } from './OutLoudBrand';

// ==========================================================
// CONFIG: PASTE YOUR HOSTED AUDIO URL & SUBTITLE TEXT HERE
// ==========================================================
const MODEL_AUDIO_URL = ''; // e.g. 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/hero-sample.mp3'
const MODEL_SUBTITLE_EN = 'Hi! I am ready to speak English OutLoud.';
const MODEL_SUBTITLE_ES = '¡Hola! Estoy listo para hablar inglés en voz alta.';

// ==========================================================
// CUSTOM VECTOR ICONS (Play -> Pause -> Mic -> Repeat -> Check)
// ==========================================================
const PlaySvg = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5.14v14l11-7-11-7z" />
  </svg>
);

const PauseSvg = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="5" width="4" height="14" rx="1.5" />
    <rect x="14" y="5" width="4" height="14" rx="1.5" />
  </svg>
);

const MicSvg = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a4 4 0 00-4 4v7a4 4 0 008 0V5a4 4 0 00-4-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8" />
  </svg>
);

const RepeatSvg = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 2l4 4-4 4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11V9a4 4 0 014-4h14" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 22l-4-4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);

const CheckSvg = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function HeroVoicePractice() {
  // Phases: 'idle' | 'playing_model' | 'ready_to_record' | 'recording' | 'comparing_model' | 'comparing_user' | 'congrats'
  const [phase, setPhase] = useState('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [micError, setMicError] = useState('');
  const [recordSeconds, setRecordSeconds] = useState(0);

  const modelAudioRef = useRef(null);
  const userAudioRef = useRef(null);
  const userBlobUrlRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const speechFallbackTimerRef = useRef(null);

  // Full cleanup helper
  const cleanupResources = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (speechFallbackTimerRef.current) clearTimeout(speechFallbackTimerRef.current);

    if (modelAudioRef.current) {
      modelAudioRef.current.pause();
      modelAudioRef.current.currentTime = 0;
      modelAudioRef.current.onended = null;
      modelAudioRef.current = null;
    }
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
      userAudioRef.current.onended = null;
      userAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (userBlobUrlRef.current) {
      URL.revokeObjectURL(userBlobUrlRef.current);
      userBlobUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupResources();
  }, []);

  const resetAll = () => {
    cleanupResources();
    setPhase('idle');
    setIsPaused(false);
    setRecordSeconds(0);
    setMicError('');
  };

  // Helper: Plays hosted MODEL_AUDIO_URL, or falls back to English SpeechSynthesis until URL is added
  const playModelAudio = (onDone) => {
    if (MODEL_AUDIO_URL && MODEL_AUDIO_URL.trim() !== '') {
      const audio = new Audio(MODEL_AUDIO_URL);
      modelAudioRef.current = audio;
      audio.onended = () => {
        modelAudioRef.current = null;
        onDone();
      };
      audio.onerror = () => {
        modelAudioRef.current = null;
        playSpeechFallback(onDone);
      };
      audio.play().catch(() => {
        modelAudioRef.current = null;
        playSpeechFallback(onDone);
      });
    } else {
      playSpeechFallback(onDone);
    }
  };

  const playSpeechFallback = (onDone) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(MODEL_SUBTITLE_EN);
      utterance.lang = 'en-US';
      utterance.rate = 0.94;
      utterance.onend = () => {
        if (speechFallbackTimerRef.current) clearTimeout(speechFallbackTimerRef.current);
        onDone();
      };
      utterance.onerror = () => {
        speechFallbackTimerRef.current = setTimeout(onDone, 2200);
      };
      // Safety net in case mobile speechSynthesis never fires onend
      speechFallbackTimerRef.current = setTimeout(onDone, 4200);
      window.speechSynthesis.speak(utterance);
    } else {
      speechFallbackTimerRef.current = setTimeout(onDone, 2600);
    }
  };

  // STEP 1: Start listening to model audio
  const handleStartPractice = () => {
    setMicError('');
    setIsPaused(false);
    setPhase('playing_model');
    playModelAudio(() => {
      setIsPaused(false);
      setPhase('ready_to_record');
    });
  };

  // STEP 1b: Pause / Resume while model plays
  const handleTogglePauseModel = () => {
    if (modelAudioRef.current) {
      if (modelAudioRef.current.paused) {
        modelAudioRef.current.play().catch(() => {});
        setIsPaused(false);
      } else {
        modelAudioRef.current.pause();
        setIsPaused(true);
      }
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  // STEP 2: Start Recording User's Voice into Internal Memory
  const handleStartRecording = async () => {
    setMicError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Tu navegador no permite acceso al micrófono en este modo.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const preferredMime =
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : undefined;

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Release microphone hardware immediately
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (userBlobUrlRef.current) URL.revokeObjectURL(userBlobUrlRef.current);
        const blobUrl = URL.createObjectURL(blob);
        userBlobUrlRef.current = blobUrl;

        // Immediately start Back-to-Back Comparison: Model Audio -> User Recording
        runBackToBackComparison(blobUrl);
      };

      recorder.start();
      setRecordSeconds(0);
      setPhase('recording');

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 11) {
            // Auto-stop at 12s so guests don't get stuck recording
            handleStopRecording();
            return 12;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      setMicError('Activa el permiso de micrófono para practicar tu pronunciación.');
    }
  };

  // STEP 3: Stop Recording -> Triggers onstop -> Back-to-Back Autoplay
  const handleStopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // STEP 4: Autoplay Model Audio -> Immediately Followed by User's Recording -> Congrats -> Reset
  const runBackToBackComparison = (blobUrl) => {
    setPhase('comparing_model');

    playModelAudio(() => {
      setPhase('comparing_user');
      const userAudio = new Audio(blobUrl);
      userAudioRef.current = userAudio;

      const finishCycle = () => {
        userAudioRef.current = null;
        setPhase('congrats');
        resetTimerRef.current = setTimeout(() => {
          resetAll();
        }, 2800);
      };

      userAudio.onended = finishCycle;
      userAudio.onerror = finishCycle;
      userAudio.play().catch(finishCycle);
    });
  };

  // Master Button Action Router
  const handleMainButtonClick = () => {
    if (phase === 'idle') {
      handleStartPractice();
    } else if (phase === 'playing_model') {
      handleTogglePauseModel();
    } else if (phase === 'ready_to_record') {
      handleStartRecording();
    } else if (phase === 'recording') {
      handleStopRecording();
    } else if (phase === 'congrats') {
      resetAll();
    }
  };

  const isWaveActive =
    (phase === 'playing_model' && !isPaused) ||
    phase === 'recording' ||
    phase === 'comparing_model' ||
    phase === 'comparing_user';

  const showSubtitles = phase !== 'idle';

  // Dynamic Button Visual Config
  const getButtonConfig = () => {
    switch (phase) {
      case 'playing_model':
        return {
          label: isPaused ? 'Reanudar audio modelo' : 'Escuchando modelo...',
          icon: isPaused ? <PlaySvg className="w-5 h-5 translate-x-0.5" /> : <PauseSvg className="w-5 h-5" />,
          classes: 'ola-btn-yellow',
          pulse: false,
        };
      case 'ready_to_record':
        return {
          label: 'Toca para grabar',
          icon: <MicSvg className="w-5 h-5" />,
          classes: 'ola-btn-yellow ola-invite-pulse',
          pulse: true,
        };
      case 'recording':
        return {
          label: `Grabando (0:${String(recordSeconds).padStart(2, '0')}) • Detener`,
          icon: <PauseSvg className="w-5 h-5" />,
          classes: 'bg-[#ee665b] text-white border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246,0_0_32px_rgba(238,102,91,0.75)] ola-record-pulse',
          pulse: true,
        };
      case 'comparing_model':
        return {
          label: 'Comparando: Audio Modelo',
          icon: <RepeatSvg className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />,
          classes: 'bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246]',
          pulse: false,
        };
      case 'comparing_user':
        return {
          label: 'Comparando: Tu Voz',
          icon: <RepeatSvg className="w-5 h-5 animate-spin" style={{ animationDuration: '2s' }} />,
          classes: 'bg-[#16a37f] text-white border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246,0_0_26px_rgba(22,163,127,0.65)]',
          pulse: false,
        };
      case 'congrats':
        return {
          label: '¡Excelente! Así se habla OutLoud',
          icon: <CheckSvg className="w-5 h-5" />,
          classes: 'bg-[#16a37f] text-white border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246,0_0_30px_rgba(22,163,127,0.7)]',
          pulse: false,
        };
      case 'idle':
      default:
        return {
          label: 'Toca aquí para practicar',
          icon: <PlaySvg className="w-5 h-5 translate-x-0.5" />,
          classes: 'ola-btn-yellow',
          pulse: false,
        };
    }
  };

  const btnConfig = getButtonConfig();

  return (
    <div className="relative w-full max-w-[490px] mx-auto flex items-center justify-center py-6 sm:py-8">
      <style>{`
        @keyframes olaInvitePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 5px 0 #1e2246, 0 0 0 0 rgba(255, 199, 73, 0.85), 0 14px 30px -4px rgba(255, 199, 73, 0.7);
          }
          50% {
            transform: scale(1.045);
            box-shadow: 0 7px 0 #1e2246, 0 0 0 16px rgba(255, 199, 73, 0), 0 18px 38px -2px rgba(255, 199, 73, 0.95);
          }
        }
        @keyframes olaRecordPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 5px 0 #1e2246, 0 0 0 0 rgba(238, 102, 91, 0.8);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 6px 0 #1e2246, 0 0 0 16px rgba(238, 102, 91, 0);
          }
        }
        .ola-invite-pulse {
          animation: olaInvitePulse 1.15s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .ola-record-pulse {
          animation: olaRecordPulse 1s ease-in-out infinite;
        }
      `}</style>

      {/* ================================================== */}
      {/* RESTORED BRAND PATTERNS AROUND THE STUDIO CARD     */}
      {/* ================================================== */}

      {/* TOP-LEFT: Audio Wave Pill Brand Pattern */}
      <div className="ola-float-slow absolute -top-2 left-0 sm:-top-1 sm:-left-4 z-30 bg-[#fff3d1]/95 backdrop-blur-xl border-2 border-[#ffc749] rounded-full px-3.5 py-1.5 shadow-[0_10px_24px_-6px_rgba(255,199,73,0.65)] flex items-center gap-2 pointer-events-none">
        <span className="w-5 h-5 rounded-full bg-[#454d82] flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#ffc749]" />
        </span>
        <div className="flex items-center gap-[3px] h-4">
          {[9, 15, 7, 14, 10, 6].map((h, i) => (
            <span
              key={i}
              className="ola-hero-eq w-[3px] rounded-full bg-[#454d82]"
              style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      {/* TOP-RIGHT: Layered Speech Bubbles Brand Pattern */}
      <div className="ola-float-alt absolute -top-3 right-0 sm:-top-2 sm:-right-4 z-30 pointer-events-none drop-shadow-md">
        <svg width="88" height="58" viewBox="0 0 86 58" fill="none">
          <rect x="6" y="4" width="58" height="34" rx="10" fill="#a8b0de" />
          <path d="M18 38L14 48L28 38H18Z" fill="#a8b0de" />
          <circle cx="22" cy="21" r="3" fill="#ffffff" />
          <circle cx="35" cy="21" r="3" fill="#ffffff" />
          <circle cx="48" cy="21" r="3" fill="#ffffff" />
          <rect x="46" y="22" width="36" height="24" rx="8" fill="#ffc749" />
          <path d="M72 46L76 54L64 46H72Z" fill="#ffc749" />
          <rect x="55" y="32" width="18" height="4" rx="2" fill="#454d82" />
        </svg>
      </div>

      {/* BOTTOM-LEFT: Dot Matrix Brand Pattern */}
      <div className="absolute -bottom-3 -left-1 sm:-bottom-4 sm:-left-6 z-0 pointer-events-none">
        <svg width="74" height="54" viewBox="0 0 64 48" fill="none">
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={6 + col * 13}
                cy={6 + row * 12}
                r="3.4"
                fill={(row + col) % 4 === 0 ? '#ffc749' : '#8f98d1'}
              />
            ))
          )}
        </svg>
      </div>

      {/* BOTTOM-RIGHT: Geometric Quarter-Arcs & Triangle Brand Pattern */}
      <div className="ola-float-alt absolute -bottom-4 -right-1 sm:-bottom-5 sm:-right-5 z-30 pointer-events-none drop-shadow-md">
        <svg width="74" height="66" viewBox="0 0 68 62" fill="none">
          <path d="M12 24A16 16 0 0 1 28 8V24H12Z" fill="#ffc749" />
          <path d="M32 8A20 20 0 0 1 52 28H32V8Z" fill="#a8b0de" />
          <rect x="14" y="30" width="22" height="22" rx="5" fill="#ffc749" />
          <path d="M44 36L58 50H38L44 36Z" fill="#626a9f" />
        </svg>
      </div>

      {/* ================================================== */}
      {/* BACKLIT DEEP-INDIGO GLASS VOICE STUDIO CARD        */}
      {/* ================================================== */}
      <div className="relative w-full z-20">
        {/* Dual-Color Backlight Behind Studio Card */}
        <div
          className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-85 -z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 25% 20%, rgba(255,199,73,0.72), transparent 55%), radial-gradient(circle at 80% 80%, rgba(98,106,159,0.78), transparent 62%)',
          }}
        />

        <div className="ola-glass-indigo rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden">
          {/* Subtle Dot Texture Inside Card */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          {/* Top Status Pill */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-5">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  phase === 'recording'
                    ? 'bg-[#ee665b] animate-ping'
                    : phase === 'congrats' || phase === 'comparing_user'
                    ? 'bg-[#16a37f] animate-pulse'
                    : 'bg-[#ffc749] animate-pulse'
                }`}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ffc749]">
                {phase === 'idle' && 'OutLoud Voice Lab'}
                {phase === 'playing_model' && 'Paso 1 • Escucha'}
                {phase === 'ready_to_record' && 'Paso 2 • Tu Turno'}
                {phase === 'recording' && 'Micrófono Activo'}
                {phase === 'comparing_model' && 'Comparación • Modelo'}
                {phase === 'comparing_user' && 'Comparación • Tu Voz'}
                {phase === 'congrats' && '¡Completado!'}
              </span>
            </div>

            {phase !== 'idle' && (
              <button
                type="button"
                onClick={resetAll}
                className="text-[10px] font-black uppercase tracking-widest text-white/65 hover:text-[#ffc749] transition-colors cursor-pointer"
              >
                Reiniciar
              </button>
            )}
          </div>

          {/* Centerpiece Icon Flanked by Reactive Equalizer Waves */}
          <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-5 my-3">
            {/* Left Equalizer */}
            <div className="flex items-center gap-1 sm:gap-1.5 h-14">
              {[14, 28, 18, 42, 24, 34].map((h, i) => (
                <span
                  key={`sl-${i}`}
                  className={`w-1.5 rounded-full transition-all duration-300 ${isWaveActive ? 'ola-hero-eq' : ''}`}
                  style={{
                    height: isWaveActive ? `${h}px` : `${Math.round(h * 0.42)}px`,
                    backgroundColor:
                      phase === 'recording'
                        ? '#ee665b'
                        : phase === 'comparing_user' || phase === 'congrats'
                        ? '#16a37f'
                        : i % 2 === 0
                        ? '#ffc749'
                        : 'rgba(255,255,255,0.65)',
                    animationDelay: `${i * 0.09}s`,
                  }}
                />
              ))}
            </div>

            {/* OutLoud Headphone Mark */}
            <div
              className={`relative transition-transform duration-300 ${
                phase === 'recording'
                  ? 'scale-105'
                  : phase === 'congrats'
                  ? 'scale-110'
                  : 'ola-float-slow'
              }`}
            >
              <OutLoudIcon className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-[0_16px_26px_rgba(0,0,0,0.4)]" />
            </div>

            {/* Right Equalizer */}
            <div className="flex items-center gap-1 sm:gap-1.5 h-14">
              {[34, 24, 42, 18, 28, 14].map((h, i) => (
                <span
                  key={`sr-${i}`}
                  className={`w-1.5 rounded-full transition-all duration-300 ${isWaveActive ? 'ola-hero-eq' : ''}`}
                  style={{
                    height: isWaveActive ? `${h}px` : `${Math.round(h * 0.42)}px`,
                    backgroundColor:
                      phase === 'recording'
                        ? '#ee665b'
                        : phase === 'comparing_user' || phase === 'congrats'
                        ? '#16a37f'
                        : i % 2 === 1
                        ? '#ffc749'
                        : 'rgba(255,255,255,0.65)',
                    animationDelay: `${(5 - i) * 0.09}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* LIVE SUBTITLES / FEEDBACK STAGE */}
          <div className="relative z-10 min-h-[82px] bg-[#1e2246]/55 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3.5 mb-5 flex flex-col items-center justify-center text-center shadow-inner">
            {phase === 'congrats' ? (
              <div className="animate-fade-in">
                <p className="text-sm sm:text-base font-black text-[#ffc749] tracking-wide">
                  ¡Lo hiciste increíble!
                </p>
                <p className="text-[11px] font-semibold text-white/85 mt-1">
                  Escuchar y comparar tu propia voz acelera tu fluidez desde el día uno.
                </p>
              </div>
            ) : showSubtitles ? (
              <div className="animate-fade-in">
                <p className="text-sm sm:text-base font-black text-white leading-snug">
                  &ldquo;{MODEL_SUBTITLE_EN}&rdquo;
                </p>
                <p className="text-[11px] font-semibold text-[#ffc749]/90 mt-1">
                  {MODEL_SUBTITLE_ES}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-white/95 leading-snug">
                  Escucha, repite y compara tu pronunciación al instante.
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/55 mt-1">
                  Usa tu micrófono • Sin registro
                </p>
              </div>
            )}
          </div>

          {/* Microphone Error Alert (if denied) */}
          {micError && (
            <div className="relative z-10 mb-4 bg-[#ee665b]/20 border border-[#ee665b] text-white text-[11px] font-bold rounded-xl px-3.5 py-2.5 text-center">
              {micError}
            </div>
          )}

          {/* PRIMARY INTERACTIVE VOICE BUTTON */}
          <button
            type="button"
            onClick={handleMainButtonClick}
            disabled={phase === 'comparing_model' || phase === 'comparing_user'}
            className={`relative z-10 w-full py-4 px-5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2.5 transition-all disabled:cursor-default ${btnConfig.classes}`}
          >
            <span className="shrink-0">{btnConfig.icon}</span>
            <span>{btnConfig.label}</span>
          </button>

          {/* Compact 3-Step Visual Indicator Strip */}
          <div className="relative z-10 mt-4 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/60">
            <span className={phase === 'playing_model' ? 'text-[#ffc749]' : ''}>1. Escucha</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className={phase === 'ready_to_record' || phase === 'recording' ? 'text-[#ffc749]' : ''}>
              2. Graba
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span
              className={
                phase === 'comparing_model' || phase === 'comparing_user' || phase === 'congrats'
                  ? 'text-[#16a37f]'
                  : ''
              }
            >
              3. Compara
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}