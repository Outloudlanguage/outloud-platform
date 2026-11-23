import React, { useState, useRef, useEffect } from 'react';

// ==========================================================
// CONFIG: PEGA AQUÍ TU URL DE AUDIO HOSTED Y EL SUBTÍTULO (SOLO INGLÉS)
// ==========================================================
const MODEL_AUDIO_URL = ''; // Ej: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/hero-sample.mp3'
const MODEL_SUBTITLE_EN = 'Hi! I am ready to speak English OutLoud.';

// ==========================================================
// CUSTOM VECTOR SVGs (Cero emojis genéricos)
// ==========================================================
const RecordMicSvg = ({ className = 'w-12 h-12' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3.5 3.5 0 00-3.5 3.5v6a3.5 3.5 0 007 0v-6A3.5 3.5 0 0012 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10.5a7 7 0 01-14 0m7 7V21m-3.5 0h7" />
  </svg>
);

const PauseSvg = ({ className = 'w-12 h-12' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="4.5" width="4.2" height="15" rx="1.6" />
    <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.6" />
  </svg>
);

const RepeatSvg = ({ className = 'w-11 h-11' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 2l4 4-4 4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11V9a4 4 0 014-4h14" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 22l-4-4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);

const CheckSvg = ({ className = 'w-12 h-12' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ==========================================================
// LIVING 2.5D OUTLOUD MASCOT (Exact Brand Paths, Layered)
// ==========================================================
function AnimatedOutLoudMascot({ mode = 'idle' }) {
  const isTalking = mode === 'talking';

  return (
    <div
      className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center"
      style={{ perspective: '650px' }}
    >
      <div
        className={`w-full h-full ${
          isTalking ? 'ola-mascot-body-talk' : 'ola-mascot-body-idle'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 904.72 904.72"
          className="w-full h-full overflow-visible drop-shadow-[0_16px_26px_rgba(72,80,136,0.3)]"
          aria-label="OutLoud Mascot"
        >
          {/* LAYER 1: Yellow Rounded Tile */}
          <rect
            className={isTalking ? 'ola-tile-talk' : 'ola-tile-idle'}
            x="76.01"
            y="117.44"
            width="751.97"
            height="751.97"
            rx="120.32"
            ry="120.32"
            fill="#ffc749"
            stroke="#ffffff"
            strokeMiterlimit="10"
            strokeWidth="2"
          />

          {/* LAYER 2: Expressive Face / Smile Group (Looks around, smiles, talks) */}
          <g className={isTalking ? 'ola-face-talk' : 'ola-face-idle'}>
            <path
              className={isTalking ? '' : 'ola-cheek-left-idle'}
              fill="#626a9f"
              d="M433.61,831.95c.46-50.58.32-57.11.46-109.97-99.49.15-172.57-44.98-172.07-147.86h172.79c-1.14-48.9,1.55-96.79.04-145.57-2.7-194.75-282.01-186.14-289.21,4.69-7.14,189.25-1.79,393.2,230.02,398.57"
            />
            <path
              className={isTalking ? '' : 'ola-cheek-right-idle'}
              fill="#626a9f"
              d="M470.91,831.95c-.46-50.58-.32-57.11-.46-109.97,99.49.15,172.57-44.98,172.07-147.86h-172.79c1.14-48.9-1.55-96.79-.04-145.57,2.7-194.75,282.01-186.14,289.21,4.69,7.14,189.25,1.79,393.2-230.02,398.57"
            />
          </g>

          {/* LAYER 3: Headphones Arch & Earcups (Parallax head-turn & beat bounce) */}
          <path
            className={isTalking ? 'ola-phones-talk' : 'ola-phones-idle'}
            fill="#626a9f"
            d="M789.62,562.95c-.55-21.4-.23-43.36.09-64.61.35-23.41.71-47.59-.09-71.3-2.56-75.99-45.3-136.01-117.26-164.67-2.47-.98-4.62-1.66-6.71-2.32-4.67-1.47-7.01-2.21-9.55-5.11-2.57-2.93-5.02-6.24-7.61-9.74-2.83-3.82-5.75-7.76-9.04-11.51-47.63-54.12-115.92-85.15-187.36-85.15s-140.5,31.43-188.07,86.23c-3.09,3.57-5.87,7.46-8.55,11.24-2.74,3.85-5.32,7.48-7.91,10.3-1.49,1.62-5.3,2.79-8.99,3.92-2.08.64-4.22,1.29-6.36,2.13-68.92,27.09-113.68,86.62-116.79,155.36-1.14,25.25-.63,51.21-.13,76.31.45,22.42.91,45.6.17,67.95-.03.33-.06.6-.1.83h-.24c-1.81,0-4.25-.37-6.83-.76l-.41-.06c-26.87-4.08-47.39-16.68-60.99-37.46-25.44-38.86-22.34-98.3-10.96-140.98,11-41.25,30.42-63.78,62.95-73.07,5.1-1.46,10.29-2.15,15.79-2.9,2.47-.33,4.95-.67,7.49-1.08l5.93-.95,1.95-5.68c14.93-43.6,37.68-82.76,67.61-116.39,33.36-37.5,73.09-66.57,118.07-86.41,43.23-19.07,89.18-28.74,136.57-28.74s94.7,9.94,138.52,29.56c45.56,20.39,85.62,50.2,119.09,88.59,27.68,31.76,49.54,70.08,64.98,113.9l2.26,6.41,6.79.26c11.97.46,22.87,2.92,33.32,7.51,34.39,15.11,46.78,44.03,54.8,82.79,4.92,23.77,6.43,47.67,4.36,69.11-2.33,24.24-9.01,44.45-19.86,60.09-13.52,19.49-33.51,31.42-59.42,35.44-.49.08-1,.16-1.51.24l-.21.03c-2.05.32-4.14.67-5.79.69Z"
          />
        </svg>
      </div>
    </div>
  );
}

export default function HeroVoicePractice() {
  // Fases: 'idle' | 'playing_model' | 'ready_to_record' | 'recording' | 'comparing_model' | 'comparing_user' | 'congrats'
  const [phase, setPhase] = useState('idle');
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
    setRecordSeconds(0);
    setMicError('');
  };

  // Reproduce la URL alojada o usa SpeechSynthesis en inglés como respaldo temporal
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
      speechFallbackTimerRef.current = setTimeout(onDone, 4200);
      window.speechSynthesis.speak(utterance);
    } else {
      speechFallbackTimerRef.current = setTimeout(onDone, 2600);
    }
  };

  // PASO 1: Tocar el logo -> suena el audio modelo + subtítulo en inglés
  const handleStartPractice = () => {
    setMicError('');
    setPhase('playing_model');
    playModelAudio(() => {
      setPhase('ready_to_record');
    });
  };

  // PASO 2: Tocar el símbolo rojo coral -> graba en memoria interna + subtítulo en inglés
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
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (userBlobUrlRef.current) URL.revokeObjectURL(userBlobUrlRef.current);
        const blobUrl = URL.createObjectURL(blob);
        userBlobUrlRef.current = blobUrl;

        runBackToBackComparison(blobUrl);
      };

      recorder.start();
      setRecordSeconds(0);
      setPhase('recording');

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 11) {
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

  // PASO 3: Tocar el símbolo de pausa -> detiene la grabación
  const handleStopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // PASO 4: Comparación automática (Modelo -> Tu Voz) -> Felicitación -> Reinicio automático
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
        }, 2300);
      };

      userAudio.onended = finishCycle;
      userAudio.onerror = finishCycle;
      userAudio.play().catch(finishCycle);
    });
  };

  const handleCenterClick = () => {
    if (phase === 'idle') {
      handleStartPractice();
    } else if (phase === 'ready_to_record') {
      handleStartRecording();
    } else if (phase === 'recording') {
      handleStopRecording();
    } else if (phase === 'congrats') {
      resetAll();
    }
  };

  const isWaveActive =
    phase === 'playing_model' ||
    phase === 'recording' ||
    phase === 'comparing_model' ||
    phase === 'comparing_user';

  const isCenterClickable =
    phase === 'idle' ||
    phase === 'ready_to_record' ||
    phase === 'recording' ||
    phase === 'congrats';

  return (
    <div className="relative w-full max-w-[490px] mx-auto flex items-center justify-center py-6 sm:py-8">
      <style>{`
        /* Caja lavanda-índigo ligera y moderna */
        .ola-glass-lavender {
          background: linear-gradient(
            148deg,
            rgba(235, 238, 255, 0.78) 0%,
            rgba(205, 211, 246, 0.66) 55%,
            rgba(182, 190, 238, 0.64) 100%
          );
          backdrop-filter: blur(28px) saturate(195%);
          -webkit-backdrop-filter: blur(28px) saturate(195%);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow:
            0 24px 54px -14px rgba(72, 80, 136, 0.28),
            0 0 42px -10px rgba(98, 106, 159, 0.35),
            inset 0 2px 2px rgba(255, 255, 255, 0.95),
            inset 0 -1px 1px rgba(98, 106, 159, 0.14);
        }

        /* ==========================================
           LIVING 2.5D MASCOT ANIMATIONS (IDLE)
           Looks left -> Looks up-right -> Chats -> Beams
           ========================================== */
        @keyframes olaMascotBodyIdle {
          0%, 100% { transform: rotateY(0deg) rotateZ(0deg) translateY(0px) scale(1); }
          12% { transform: rotateY(-20deg) rotateZ(-4.5deg) translateY(-4px) scale(1.02); }
          23% { transform: rotateY(-17deg) rotateZ(-2.5deg) translateY(-2px) scale(1.02); }
          36% { transform: rotateY(20deg) rotateZ(4.5deg) translateY(-5px) scale(1.03); }
          47% { transform: rotateY(15deg) rotateZ(2.5deg) translateY(-2px) scale(1.02); }
          56% { transform: rotateY(0deg) rotateZ(-2deg) translateY(0px) scale(1.03); }
          61% { transform: rotateY(0deg) rotateZ(2.5deg) translateY(-4px) scale(1.05); }
          65% { transform: rotateY(0deg) rotateZ(-2deg) translateY(0px) scale(1.03); }
          69% { transform: rotateY(0deg) rotateZ(2deg) translateY(-3px) scale(1.05); }
          74% { transform: rotateY(0deg) rotateZ(0deg) translateY(0px) scale(1.02); }
          84% { transform: rotateY(0deg) rotateZ(0deg) translateY(-7px) scale(1.07); }
          93% { transform: rotateY(0deg) rotateZ(0deg) translateY(1px) scale(0.99); }
        }

        @keyframes olaFaceIdle {
          0%, 100% { transform: translate(0px, 0px) scale(1, 1); }
          /* Glances left */
          12%, 23% { transform: translate(-34px, -10px) scale(0.96, 1.02); }
          /* Glances up-right */
          36%, 47% { transform: translate(34px, -16px) scale(0.96, 1.02); }
          /* Turns back & chats playfully (3 rhythmic syllables) */
          56% { transform: translate(0px, 0px) scale(1.03, 0.96); }
          60% { transform: translate(0px, 14px) scale(0.94, 1.1); }
          63% { transform: translate(0px, -4px) scale(1.05, 0.93); }
          67% { transform: translate(0px, 16px) scale(0.93, 1.11); }
          70% { transform: translate(0px, -3px) scale(1.04, 0.94); }
          73% { transform: translate(0px, 10px) scale(0.96, 1.07); }
          /* Big happy beam / smile stretch */
          84% { transform: translate(0px, -12px) scale(1.09, 0.9); }
          93% { transform: translate(0px, 2px) scale(0.99, 1.01); }
        }

        @keyframes olaCheekLeftIdle {
          0%, 76%, 94%, 100% { transform: translateX(0px) rotate(0deg); }
          84% { transform: translateX(-10px) rotate(-3.5deg); }
        }

        @keyframes olaCheekRightIdle {
          0%, 76%, 94%, 100% { transform: translateX(0px) rotate(0deg); }
          84% { transform: translateX(10px) rotate(3.5deg); }
        }

        @keyframes olaPhonesIdle {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          12%, 23% { transform: translate(-14px, -4px) rotate(-2deg); }
          36%, 47% { transform: translate(14px, -6px) rotate(2deg); }
          60%, 67% { transform: translate(0px, -10px) rotate(0deg); }
          63%, 70% { transform: translate(0px, 4px) rotate(0deg); }
          84% { transform: translate(0px, -14px) scale(1.03); }
        }

        /* ==========================================
           ACTIVE TALKING ANIMATION (PLAYING MODEL)
           ========================================== */
        @keyframes olaMascotBodyTalk {
          0%, 100% { transform: rotateZ(-3deg) translateY(0px) scale(1.04); }
          50% { transform: rotateZ(3deg) translateY(-6px) scale(1.07); }
        }

        @keyframes olaFaceTalk {
          0%, 100% { transform: translateY(-4px) scale(1.06, 0.92); }
          45% { transform: translateY(18px) scale(0.92, 1.13); }
          70% { transform: translateY(4px) scale(1.03, 0.97); }
        }

        @keyframes olaPhonesTalk {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.03); }
        }

        .ola-mascot-body-idle {
          animation: olaMascotBodyIdle 7.8s cubic-bezier(0.42, 0, 0.25, 1) infinite;
          will-change: transform;
        }
        .ola-face-idle {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaFaceIdle 7.8s cubic-bezier(0.42, 0, 0.25, 1) infinite;
        }
        .ola-cheek-left-idle {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaCheekLeftIdle 7.8s ease-in-out infinite;
        }
        .ola-cheek-right-idle {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaCheekRightIdle 7.8s ease-in-out infinite;
        }
        .ola-phones-idle {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaPhonesIdle 7.8s cubic-bezier(0.42, 0, 0.25, 1) infinite;
        }

        .ola-mascot-body-talk {
          animation: olaMascotBodyTalk 0.92s ease-in-out infinite;
          will-change: transform;
        }
        .ola-face-talk {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaFaceTalk 0.44s ease-in-out infinite;
        }
        .ola-phones-talk {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaPhonesTalk 0.44s ease-in-out infinite;
        }

        /* Pulso intenso en rojo coral para invitar a grabar */
        @keyframes olaCoralPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(238, 102, 91, 0.8), 0 14px 32px -4px rgba(238, 102, 91, 0.65);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 0 20px rgba(238, 102, 91, 0), 0 18px 40px -2px rgba(238, 102, 91, 0.85);
          }
        }
        .ola-coral-pulse {
          animation: olaCoralPulse 1.15s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        @keyframes olaRecordingRing {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(238, 102, 91, 0.55), 0 14px 28px -6px rgba(238, 102, 91, 0.5);
          }
          50% {
            box-shadow: 0 0 0 14px rgba(238, 102, 91, 0), 0 16px 32px -4px rgba(238, 102, 91, 0.65);
          }
        }
        .ola-recording-ring {
          animation: olaRecordingRing 1s ease-in-out infinite;
        }

        @keyframes olaMorphIn {
          0% { opacity: 0; transform: scale(0.72) rotate(-8deg); }
          70% { opacity: 1; transform: scale(1.06) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .ola-morph-in {
          animation: olaMorphIn 0.34s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .ola-mascot-body-idle, .ola-face-idle, .ola-cheek-left-idle,
          .ola-cheek-right-idle, .ola-phones-idle, .ola-mascot-body-talk,
          .ola-face-talk, .ola-phones-talk {
            animation: none !important;
          }
        }
      `}</style>

      {/* ================================================== */}
      {/* PATRONES DE MARCA ALREDEDOR DE LA TARJETA          */}
      {/* ================================================== */}

      {/* TOP-LEFT: Audio Wave Pill */}
      <div className="ola-float-slow absolute -top-2 left-0 sm:-top-1 sm:-left-4 z-30 bg-[#fff3d1]/95 backdrop-blur-xl border-2 border-[#ffc749] rounded-full px-3.5 py-1.5 shadow-[0_10px_24px_-6px_rgba(255,199,73,0.6)] flex items-center gap-2 pointer-events-none">
        <span className="w-5 h-5 rounded-full bg-[#626a9f] flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#ffc749]" />
        </span>
        <div className="flex items-center gap-[3px] h-4">
          {[9, 15, 7, 14, 10, 6].map((h, i) => (
            <span
              key={i}
              className="ola-hero-eq w-[3px] rounded-full bg-[#626a9f]"
              style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      {/* TOP-RIGHT: Layered Speech Bubbles */}
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

      {/* BOTTOM-LEFT: Dot Matrix */}
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

      {/* BOTTOM-RIGHT: Geometric Shapes */}
      <div className="ola-float-alt absolute -bottom-4 -right-1 sm:-bottom-5 sm:-right-5 z-30 pointer-events-none drop-shadow-md">
        <svg width="74" height="66" viewBox="0 0 68 62" fill="none">
          <path d="M12 24A16 16 0 0 1 28 8V24H12Z" fill="#ffc749" />
          <path d="M32 8A20 20 0 0 1 52 28H32V8Z" fill="#a8b0de" />
          <rect x="14" y="30" width="22" height="22" rx="5" fill="#ffc749" />
          <path d="M44 36L58 50H38L44 36Z" fill="#626a9f" />
        </svg>
      </div>

      {/* ================================================== */}
      {/* CAJA LAVANDA-ÍNDIGO LIGHT GLASSMORPHISM            */}
      {/* ================================================== */}
      <div className="relative w-full z-20">
        {/* Backlight suave detrás de la tarjeta */}
        <div
          className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-80 -z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 25% 20%, rgba(255,199,73,0.65), transparent 55%), radial-gradient(circle at 80% 80%, rgba(98,106,159,0.58), transparent 65%)',
          }}
        />

        <div className="ola-glass-lavender rounded-[2.5rem] px-6 py-8 sm:px-8 sm:py-10 relative overflow-hidden">
          {/* Textura sutil de puntos luminosos */}
          <div
            className="absolute inset-0 opacity-35 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(98, 106, 159, 0.28) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* ================================================== */}
          {/* EMBLEMA INTERACTIVO CENTRAL + ONDAS DE AUDIO       */}
          {/* ================================================== */}
          <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 mb-7">
            {/* Ecualizador Izquierdo */}
            <div className="flex items-center gap-1 sm:gap-1.5 h-16">
              {[14, 28, 18, 44, 24, 34].map((h, i) => (
                <span
                  key={`sl-${i}`}
                  className={`w-1.5 rounded-full transition-all duration-300 ${isWaveActive ? 'ola-hero-eq' : ''}`}
                  style={{
                    height: isWaveActive ? `${h}px` : `${Math.round(h * 0.4)}px`,
                    backgroundColor:
                      phase === 'recording' || phase === 'ready_to_record'
                        ? '#ee665b'
                        : phase === 'comparing_user' || phase === 'congrats'
                        ? '#16a37f'
                        : i % 2 === 0
                        ? '#ffc749'
                        : '#626a9f',
                    animationDelay: `${i * 0.09}s`,
                  }}
                />
              ))}
            </div>

            {/* BOTÓN CENTRAL TRANSFORMABLE (Mascota Viva -> Grabar Coral -> Pausa -> Comparar -> Check) */}
            <button
              type="button"
              onClick={handleCenterClick}
              disabled={!isCenterClickable}
              aria-label={
                phase === 'idle'
                  ? 'Iniciar ejercicio de pronunciación'
                  : phase === 'ready_to_record'
                  ? 'Grabar tu pronunciación'
                  : phase === 'recording'
                  ? 'Detener grabación'
                  : 'Práctica de voz OutLoud'
              }
              className={`relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center rounded-[2rem] focus:outline-none transition-transform duration-200 ${
                isCenterClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
              }`}
            >
              {/* FASE IDLE / PLAYING MODEL: MASCOTA INTERACTIVA */}
              {(phase === 'idle' || phase === 'playing_model') && (
                <div key="logo-state" className="ola-morph-in relative flex items-center justify-center">
                  {phase === 'playing_model' && (
                    <span className="absolute -inset-2 rounded-[2.2rem] border-2 border-[#ffc749] animate-ping opacity-45 pointer-events-none" />
                  )}
                  <AnimatedOutLoudMascot mode={phase === 'playing_model' ? 'talking' : 'idle'} />
                </div>
              )}

              {/* FASE READY TO RECORD: SÍMBOLO DE GRABAR PULSANDO FUERTE EN ROJO CORAL */}
              {phase === 'ready_to_record' && (
                <div
                  key="record-state"
                  className="ola-morph-in ola-coral-pulse w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#ee665b] border-[3px] border-white text-white flex flex-col items-center justify-center"
                >
                  <RecordMicSvg className="w-11 h-11 sm:w-12 sm:h-12" />
                  <span className="text-[9px] font-black uppercase tracking-widest mt-1">
                    Grabar
                  </span>
                </div>
              )}

              {/* FASE RECORDING: SÍMBOLO DE PAUSA */}
              {phase === 'recording' && (
                <div
                  key="pause-state"
                  className="ola-morph-in ola-recording-ring w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#ee665b] border-[3px] border-white text-white flex flex-col items-center justify-center"
                >
                  <PauseSvg className="w-11 h-11 sm:w-12 sm:h-12" />
                  <span className="text-[10px] font-black tracking-widest mt-0.5 tabular-nums">
                    0:{String(recordSeconds).padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* FASE COMPARING: SÍMBOLO DE COMPARAR / REPETIR */}
              {(phase === 'comparing_model' || phase === 'comparing_user') && (
                <div
                  key="compare-state"
                  className={`ola-morph-in w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3px] border-white text-white flex flex-col items-center justify-center shadow-xl ${
                    phase === 'comparing_user' ? 'bg-[#16a37f]' : 'bg-[#626a9f]'
                  }`}
                >
                  <RepeatSvg
                    className="w-11 h-11 animate-spin"
                    style={{ animationDuration: '2.4s' }}
                  />
                </div>
              )}

              {/* FASE CONGRATS: CHECK DE ÉXITO */}
              {phase === 'congrats' && (
                <div
                  key="congrats-state"
                  className="ola-morph-in w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#16a37f] border-[3px] border-white text-white flex items-center justify-center shadow-[0_14px_34px_rgba(22,163,127,0.55)]"
                >
                  <CheckSvg className="w-14 h-14" />
                </div>
              )}
            </button>

            {/* Ecualizador Derecho */}
            <div className="flex items-center gap-1 sm:gap-1.5 h-16">
              {[34, 24, 44, 18, 28, 14].map((h, i) => (
                <span
                  key={`sr-${i}`}
                  className={`w-1.5 rounded-full transition-all duration-300 ${isWaveActive ? 'ola-hero-eq' : ''}`}
                  style={{
                    height: isWaveActive ? `${h}px` : `${Math.round(h * 0.4)}px`,
                    backgroundColor:
                      phase === 'recording' || phase === 'ready_to_record'
                        ? '#ee665b'
                        : phase === 'comparing_user' || phase === 'congrats'
                        ? '#16a37f'
                        : i % 2 === 1
                        ? '#ffc749'
                        : '#626a9f',
                    animationDelay: `${(5 - i) * 0.09}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* ================================================== */}
          {/* CAJA DE INSTRUCCIONES / SUBTÍTULOS (SOLO INGLÉS)   */}
          {/* ================================================== */}
          <div className="relative z-10 min-h-[104px] bg-white/80 backdrop-blur-xl border border-white rounded-3xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col items-center justify-center text-center shadow-[0_10px_28px_-12px_rgba(69,77,130,0.22)]">
            {phase === 'idle' && (
              <p className="text-sm sm:text-base font-bold text-[#1e2246] leading-snug max-w-sm animate-fade-in">
                Ejercicio de pronunciación, toca el logo para una práctica rápida.
              </p>
            )}

            {phase === 'ready_to_record' && (
              <div className="animate-fade-in">
                <p className="text-sm sm:text-base font-black text-[#d94a3f] leading-snug">
                  Graba tu pronunciación y compara
                </p>
              </div>
            )}

            {(phase === 'playing_model' ||
              phase === 'recording' ||
              phase === 'comparing_model' ||
              phase === 'comparing_user') && (
              <div className="animate-fade-in">
                {(phase === 'comparing_model' || phase === 'comparing_user') && (
                  <span
                    className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2 ${
                      phase === 'comparing_user'
                        ? 'bg-[#16a37f]/15 text-[#128063]'
                        : 'bg-[#626a9f]/15 text-[#454d82]'
                    }`}
                  >
                    {phase === 'comparing_user' ? 'Tu grabación' : 'Audio modelo'}
                  </span>
                )}
                <p className="text-base sm:text-lg font-black text-[#1e2246] leading-snug tracking-tight">
                  &ldquo;{MODEL_SUBTITLE_EN}&rdquo;
                </p>
              </div>
            )}

            {phase === 'congrats' && (
              <div className="animate-fade-in">
                <p className="text-base font-black text-[#128063] leading-snug">
                  ¡Excelente pronunciación!
                </p>
                <p className="text-xs font-semibold text-[#50567d] mt-1">
                  Así se practica en OutLoud.
                </p>
              </div>
            )}
          </div>

          {/* Alerta si el usuario bloqueó el micrófono */}
          {micError && (
            <div className="relative z-10 mt-3 bg-[#ee665b]/15 border border-[#ee665b] text-[#9b2c23] text-xs font-bold rounded-2xl px-4 py-2.5 text-center">
              {micError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}