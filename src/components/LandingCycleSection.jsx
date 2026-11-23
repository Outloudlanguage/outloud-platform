import React, { useState, useEffect, useRef } from 'react';

const STEP_DURATION_MS = 5500;

const CYCLE_STEPS = [
  {
    num: '01',
    shortLabel: 'Live Lab',
    title: 'Live Lab Interactivo',
    desc: 'Escucha situaciones reales y entrena tu pronunciación comparando tu voz al instante, sin traducir.',
    accent: '#ffc749',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3.5 3.5 0 00-3.5 3.5v6a3.5 3.5 0 007 0v-6A3.5 3.5 0 0012 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10.5a7 7 0 01-14 0m7 7V21m-3.5 0h7" />
      </svg>
    ),
  },
  {
    num: '02',
    shortLabel: 'Práctica',
    title: 'Práctica Interactiva',
    desc: 'Afianza lo aprendido con ejercicios dinámicos en tu workbook digital y corrección visual inmediata.',
    accent: '#16a37f',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    shortLabel: 'Agenda',
    title: 'Agenda tus Clases',
    desc: 'Elige el día y la hora que mejor se adapten a tu rutina y reserva tu sesión en vivo en segundos.',
    accent: '#626a9f',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: '04',
    shortLabel: 'En Vivo',
    title: 'Clase 100% En Vivo',
    desc: 'Practica con un profesor real, recibe feedback instantáneo y desbloquea tu siguiente unidad.',
    accent: '#ee665b',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: '05',
    shortLabel: 'Comunidad',
    title: 'Aplica en Comunidad',
    desc: 'Conversa en foros, debates, chats y el club de conversación para convertir el inglés en un hábito.',
    accent: '#ffc749',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

// ==========================================================
// 5 BESPOKE ANIMATED MINI-UI SCENES (Show, Don't Tell)
// ==========================================================
function CycleVisualStage({ stepIndex }) {
  // STAGE 0: LIVE LAB (Audio Wave + Vocal Comparison Match)
  if (stepIndex === 0) {
    return (
      <div key="stage-0" className="ola-stage-in w-full max-w-md mx-auto flex flex-col gap-4">
        {/* Phrase Card with Live Equalizer */}
        <div className="bg-white/85 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-[0_14px_30px_-10px_rgba(69,77,130,0.22)]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#ffc749] border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246]">
                <svg className="w-3.5 h-3.5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </span>
              <div className="flex items-center gap-[3px] h-5">
                {[10, 18, 12, 22, 14, 20, 9, 16, 11].map((h, i) => (
                  <span
                    key={i}
                    className="ola-cyc-wave w-[3px] rounded-full"
                    style={{
                      height: `${h}px`,
                      backgroundColor: i % 3 === 0 ? '#ffc749' : '#626a9f',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#454d82] bg-[#e8eaf7] px-2.5 py-1 rounded-full">
              Unit 1
            </span>
          </div>

          <p className="text-lg sm:text-xl font-black text-[#1e2246] leading-snug">
            &ldquo;Nice to{' '}
            <span className="bg-[#ffc749]/75 px-1.5 py-0.5 rounded-lg">meet you!</span>&rdquo;
          </p>
        </div>

        {/* Voice Match Feedback Bar */}
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 ola-pop-delay-1">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#626a9f] text-[#ffc749] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3.5 3.5 0 00-3.5 3.5v6a3.5 3.5 0 007 0v-6A3.5 3.5 0 0012 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 10.5a7 7 0 01-14 0m7 7V21" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-black text-[#1e2246] mb-1.5">
                <span>Comparación vocal</span>
                <span className="text-[#128063]">96%</span>
              </div>
              <div className="w-full h-2 bg-[#dfe2f2] rounded-full overflow-hidden">
                <div className="ola-bar-fill h-full rounded-full bg-gradient-to-r from-[#626a9f] via-[#ffc749] to-[#16a37f]" style={{ width: '96%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 1: PRÁCTICA INTERACTIVA (Interactive Workbook Snap)
  if (stepIndex === 1) {
    return (
      <div key="stage-1" className="ola-stage-in w-full max-w-md mx-auto flex flex-col gap-4">
        <div className="bg-white/85 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-[0_14px_30px_-10px_rgba(69,77,130,0.22)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#454d82]">
              Workbook Digital
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#128063] bg-[#16a37f]/15 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Correcto</span>
            </span>
          </div>

          {/* Interactive Fill-in-the-Blank Prompt */}
          <p className="text-base sm:text-lg font-extrabold text-[#1e2246] leading-relaxed mb-5">
            I{' '}
            <span className="ola-chip-snap inline-flex items-center gap-1 px-3 py-0.5 mx-1 rounded-xl bg-[#16a37f] text-white font-black shadow-md">
              practice
            </span>{' '}
            English every day.
          </p>

          {/* Answer Option Chips */}
          <div className="flex flex-wrap gap-2">
            {['practicing', 'practice', 'practiced'].map((word) => {
              const isRight = word === 'practice';
              return (
                <span
                  key={word}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black border transition-all ${
                    isRight
                      ? 'bg-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_3px_0_#1e2246]'
                      : 'bg-[#f6f7fc] border-[#dfe2f2] text-[#50567d]/65'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Mastery Gate Progress Strip */}
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 ola-pop-delay-1">
          <div className="w-9 h-9 rounded-xl bg-[#16a37f] text-white flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-black text-[#1e2246] mb-1">
              <span>Progreso de unidad</span>
              <span className="text-[#454d82]">85%</span>
            </div>
            <div className="w-full h-2 bg-[#dfe2f2] rounded-full overflow-hidden">
              <div className="ola-bar-fill h-full rounded-full bg-gradient-to-r from-[#626a9f] to-[#16a37f]" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 2: AGENDA TUS CLASES (Smart Flexible Booking UI)
  if (stepIndex === 2) {
    return (
      <div key="stage-2" className="ola-stage-in w-full max-w-md mx-auto flex flex-col gap-4">
        <div className="bg-white/85 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-[0_14px_30px_-10px_rgba(69,77,130,0.22)]">
          {/* Week Strip */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              { d: 'LUN', n: '14' },
              { d: 'MAR', n: '15' },
              { d: 'MIÉ', n: '16', active: true },
              { d: 'JUE', n: '17' },
              { d: 'VIE', n: '18' },
            ].map((item) => (
              <div
                key={item.d}
                className={`rounded-2xl py-2.5 flex flex-col items-center justify-center border transition-all ${
                  item.active
                    ? 'bg-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_4px_0_#1e2246] -translate-y-0.5'
                    : 'bg-[#f6f7fc] border-[#dfe2f2] text-[#50567d]'
                }`}
              >
                <span className="text-[9px] font-black tracking-wider">{item.d}</span>
                <span className="text-sm font-black mt-0.5">{item.n}</span>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-3 gap-2">
            {['10:00 AM', '4:00 PM', '7:00 PM'].map((slot) => {
              const selected = slot === '7:00 PM';
              return (
                <div
                  key={slot}
                  className={`py-2 px-2 rounded-xl text-center text-[11px] font-black border ${
                    selected
                      ? 'bg-[#626a9f] border-[#1e2246] text-white shadow-md'
                      : 'bg-white border-[#dfe2f2] text-[#50567d]'
                  }`}
                >
                  {slot}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirmed Booking Toast */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center justify-between gap-3 ola-pop-delay-1">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#16a37f] text-white flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-black text-[#1e2246] leading-tight">Clase en vivo reservada</p>
              <p className="text-[10px] font-bold text-[#50567d]">Miércoles • 7:00 PM</p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f] animate-pulse shrink-0" />
        </div>
      </div>
    );
  }

  // STAGE 3: CLASE 100% EN VIVO (Live Teacher + Student Room UI)
  if (stepIndex === 3) {
    return (
      <div key="stage-3" className="ola-stage-in w-full max-w-md mx-auto flex flex-col gap-4">
        <div className="bg-white/85 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-[0_14px_30px_-10px_rgba(69,77,130,0.22)]">
          {/* Top Live Bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 bg-[#ee665b]/15 text-[#c93f34] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#ee665b] animate-ping" />
              <span>En Vivo</span>
            </span>
            <span className="text-[10px] font-black text-[#454d82] uppercase tracking-wider">
              Live Speaking Lab
            </span>
          </div>

          {/* Two Participant Tiles */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl bg-[#626a9f] p-3.5 text-white flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              <div className="w-11 h-11 rounded-full bg-[#ffc749] border-2 border-white text-[#1e2246] flex items-center justify-center font-black text-xs shadow-md">
                PRO
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/95">
                Instructor
              </span>
            </div>

            <div className="rounded-2xl bg-[#fff3d1] border border-[#ffc749] p-3.5 text-[#1e2246] flex flex-col items-center justify-center gap-2">
              <div className="w-11 h-11 rounded-full bg-white border-2 border-[#626a9f] text-[#454d82] flex items-center justify-center shadow-sm">
                <div className="flex items-center gap-[2.5px] h-4">
                  {[8, 15, 10, 14].map((h, i) => (
                    <span
                      key={i}
                      className="ola-cyc-wave w-[2.5px] rounded-full bg-[#626a9f]"
                      style={{ height: `${h}px`, animationDelay: `${i * 0.14}s` }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1e2246]">
                Tú Hablando
              </span>
            </div>
          </div>

          {/* Live Feedback Line */}
          <div className="bg-[#f6f7fc] border border-[#dfe2f2] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#1e2246]">&ldquo;Great fluency &amp; accent!&rdquo;</span>
            <span className="text-[10px] font-black text-[#128063] bg-[#16a37f]/15 px-2 py-0.5 rounded-md shrink-0">
              Aprobado
            </span>
          </div>
        </div>

        {/* Unit Unlock Chip */}
        <div className="bg-[#ffc749] border-2 border-[#1e2246] rounded-2xl px-4 py-3 shadow-[0_4px_0_#1e2246] flex items-center justify-between ola-pop-delay-1">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-[#1e2246]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-black uppercase tracking-wider text-[#1e2246]">
              Siguiente Unidad Desbloqueada
            </span>
          </div>
          <svg className="w-4 h-4 text-[#1e2246]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    );
  }

  // STAGE 4: APLICA EN COMUNIDAD (Forums, Debates & Conversation Club)
  return (
    <div key="stage-4" className="ola-stage-in w-full max-w-md mx-auto flex flex-col gap-3.5">
      {/* Bubble 1 */}
      <div className="bg-white/85 backdrop-blur-xl border border-white rounded-3xl rounded-tl-md p-4 shadow-[0_12px_26px_-10px_rgba(69,77,130,0.22)] max-w-[90%]">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#626a9f]">
            #debate-semanal
          </span>
          <span className="text-[9px] font-bold text-[#50567d]">Ahora</span>
        </div>
        <p className="text-xs sm:text-sm font-bold text-[#1e2246] leading-snug">
          &ldquo;What&apos;s the best city you&apos;ve ever visited and why?&rdquo;
        </p>
      </div>

      {/* Bubble 2 (Student Reply) */}
      <div className="self-end bg-[#626a9f] text-white rounded-3xl rounded-tr-md p-4 shadow-[0_12px_26px_-10px_rgba(69,77,130,0.4)] max-w-[88%] ola-pop-delay-1">
        <p className="text-xs sm:text-sm font-semibold leading-snug">
          &ldquo;I loved Warsaw! The architecture and cafés were unforgettable.&rdquo;
        </p>
      </div>

      {/* Community Live Bar */}
      <div className="bg-white/75 backdrop-blur-xl border border-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between gap-3 ola-pop-delay-2">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {['#ffc749', '#626a9f', '#16a37f'].map((bg, i) => (
              <span
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm"
                style={{ backgroundColor: bg, color: bg === '#ffc749' ? '#1e2246' : '#ffffff' }}
              >
                {['MG', 'JR', 'AL'][i]}
              </span>
            ))}
          </div>
          <span className="text-xs font-black text-[#1e2246]">Club de Conversación</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#128063]">
          <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-pulse" />
          <span>Activo</span>
        </span>
      </div>
    </div>
  );
}

// ==========================================================
// MAIN MODERN INTERACTIVE STUDY CYCLE SECTION
// ==========================================================
export default function LandingCycleSection({ onScrollTo }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);

  const isAutoPlaying = !isPaused && !isHovered;

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % CYCLE_STEPS.length);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, isAutoPlaying]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 42) {
      setActiveIndex((prev) =>
        diff > 0
          ? (prev + 1) % CYCLE_STEPS.length
          : (prev - 1 + CYCLE_STEPS.length) % CYCLE_STEPS.length
      );
    }
    touchStartX.current = null;
  };

  const activeStep = CYCLE_STEPS[activeIndex];

  return (
    <div
      id="cycle"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mt-20 sm:mt-28 scroll-mt-24 relative"
    >
      <style>{`
        @keyframes olaStageIn {
          0% { opacity: 0; transform: translateY(16px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaPopDelay {
          0% { opacity: 0; transform: translateY(10px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaStepProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes olaBarFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes olaChipSnap {
          0% { transform: scale(0.8); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes olaCycWave {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        .ola-stage-in {
          animation: olaStageIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ola-pop-delay-1 {
          opacity: 0;
          animation: olaPopDelay 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.14s forwards;
        }
        .ola-pop-delay-2 {
          opacity: 0;
          animation: olaPopDelay 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.28s forwards;
        }
        .ola-step-progress {
          transform-origin: left;
          animation: olaStepProgress ${STEP_DURATION_MS}ms linear forwards;
        }
        .ola-bar-fill {
          transform-origin: left;
          animation: olaBarFill 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
        }
        .ola-chip-snap {
          animation: olaChipSnap 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.12s both;
        }
        .ola-cyc-wave {
          transform-origin: center;
          animation: olaCycWave 1.05s ease-in-out infinite;
        }
        .ola-cycle-stage-glass {
          background: linear-gradient(
            148deg,
            rgba(235, 238, 255, 0.8) 0%,
            rgba(209, 215, 248, 0.68) 55%,
            rgba(255, 244, 212, 0.72) 100%
          );
          backdrop-filter: blur(28px) saturate(195%);
          -webkit-backdrop-filter: blur(28px) saturate(195%);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow:
            0 24px 54px -14px rgba(72, 80, 136, 0.28),
            inset 0 2px 2px rgba(255, 255, 255, 0.95);
        }
      `}</style>

      {/* CLEAN EDITORIAL HEADER (Zero Clutter Pills) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
        <div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e2246] tracking-tight leading-[1.06]">
            Tu ciclo para{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#454d82]">dominar cada unidad</span>
              <span className="absolute -left-1 -right-1 bottom-1 h-3.5 bg-[#ffc749]/85 -z-0 rounded-full -rotate-1" />
            </span>
          </h3>
          <p className="text-sm sm:text-base text-[#4c5384] font-semibold mt-3 max-w-xl">
            Cinco pasos conectados en bucle continuo que convierten la práctica diaria en fluidez real.
          </p>
        </div>

        {/* Minimal Play/Pause Loop Control */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="ola-glass self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-[#454d82] hover:text-[#1e2246] cursor-pointer shrink-0"
        >
          {isPaused ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
              <span>Reanudar ciclo</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                <rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
              <span>Ciclo automático</span>
            </>
          )}
        </button>
      </div>

      {/* ================================================== */}
      {/* MODERN SPLIT STUDIO: STEP DECK + LIVE UI STAGE     */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* MOBILE HORIZONTAL STEP SELECTOR (Shows above stage on mobile only) */}
        <div className="lg:hidden grid grid-cols-5 gap-1.5">
          {CYCLE_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative rounded-2xl py-2.5 px-1 flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-[#1e2246] border-[#1e2246] text-white shadow-md -translate-y-0.5'
                    : 'bg-white/65 border-white text-[#454d82]'
                }`}
              >
                <span className={`text-xs font-black ${isActive ? 'text-[#ffc749]' : 'text-[#1e2246]'}`}>
                  {step.num}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-tight truncate max-w-full">
                  {step.shortLabel}
                </span>
                {isActive && isAutoPlaying && (
                  <span
                    key={`mprog-${activeIndex}`}
                    className="ola-step-progress absolute bottom-0 left-0 right-0 h-[3px] bg-[#ffc749]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* LEFT COLUMN (DESKTOP): KINETIC ACCORDION STEP DECK */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-3 justify-between">
          {CYCLE_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group relative w-full text-left rounded-[1.6rem] p-4 sm:p-5 transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none ${
                  isActive
                    ? 'bg-white/90 backdrop-blur-2xl border-2 border-[#1e2246] shadow-[0_8px_0_#1e2246,0_18px_36px_-10px_rgba(69,77,130,0.3)] -translate-y-0.5'
                    : 'bg-white/45 hover:bg-white/75 backdrop-blur-xl border border-white/85 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Icon Orb */}
                  <div
                    className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_3px_0_#1e2246] scale-105'
                        : 'bg-white/80 border-white text-[#454d82] group-hover:bg-[#e8eaf7]'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* Step Title & Expanding Copy */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm sm:text-base font-black tracking-tight transition-colors ${
                          isActive ? 'text-[#1e2246]' : 'text-[#3b4170] group-hover:text-[#1e2246]'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <span
                        className={`text-xs font-black tabular-nums ${
                          isActive ? 'text-[#454d82]' : 'text-[#50567d]/60'
                        }`}
                      >
                        {step.num}
                      </span>
                    </div>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isActive ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                    >
                      <p className="overflow-hidden text-xs sm:text-[13px] text-[#4c5384] font-semibold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Auto-Advance Progress Line */}
                {isActive && isAutoPlaying && (
                  <span
                    key={`dprog-${activeIndex}`}
                    className="ola-step-progress absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#626a9f] via-[#ffc749] to-[#16a37f]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN (DESKTOP) / MAIN STAGE (MOBILE): LIVING UI VISUALIZER */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-7 relative flex flex-col"
        >
          {/* Ambient Backlight Glow */}
          <div
            className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-80 -z-10 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 25% 20%, rgba(255,199,73,0.62), transparent 55%), radial-gradient(circle at 80% 80%, rgba(98,106,159,0.58), transparent 62%)',
            }}
          />

          <div className="ola-cycle-stage-glass flex-1 rounded-[2.5rem] p-6 sm:p-9 flex flex-col justify-between relative overflow-hidden min-h-[390px] sm:min-h-[450px]">
            {/* Subtle Dotted Glass Texture */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.3) 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />

            {/* Giant Watermark Number */}
            <span className="pointer-events-none select-none absolute -top-6 right-5 text-[8rem] sm:text-[10rem] font-black leading-none text-[#454d82]/[0.07]">
              {activeStep.num}
            </span>

            {/* Centered Animated UI Preview */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-4">
              <CycleVisualStage stepIndex={activeIndex} />
            </div>

            {/* Mobile Step Caption (Since desktop shows caption inside the left deck) */}
            <div className="lg:hidden relative z-10 mt-4 pt-4 border-t border-white/75 text-center">
              <h4 className="text-lg font-black text-[#1e2246]">{activeStep.title}</h4>
              <p className="text-xs font-semibold text-[#4c5384] mt-1 leading-relaxed">
                {activeStep.desc}
              </p>
            </div>

            {/* Bottom Continuous-Loop Bar & Direct CTA */}
            <div className="relative z-10 mt-5 pt-4 border-t border-white/75 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#3b4170]">
                <svg className="w-4 h-4 text-[#454d82] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Bucle continuo de unidad en unidad (A1 → C2)</span>
              </div>

              <button
                type="button"
                onClick={() => onScrollTo?.('#enroll')}
                className="ola-btn-yellow w-full sm:w-auto px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 shrink-0 group"
              >
                <span>Empezar Ahora</span>
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}