import React, { useState, useEffect, useRef } from 'react';
import OutLoudCycleScene from './OutLoudCharacters';

const STEP_DURATION_MS = 5500;

const CYCLE_STEPS = [
  {
    num: '01',
    shortLabel: 'Live Lab',
    title: 'Escucha y repite con voz real',
    stageSubtitle: 'Entrenas tu oído y tu pronunciación en situaciones cotidianas, sin traducir.',
    desc: 'Entra a tu cuenta, escucha voces reales y entrena tu pronunciación hablando desde el primer minuto.',
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
    title: 'Afianza a tu propio ritmo',
    stageSubtitle: 'Ejercicios cortos y dinámicos que fijan lo aprendido antes de tu clase en vivo.',
    desc: 'Completa actividades prácticas en tu workbook digital para consolidar vocabulario y confianza.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    num: '03',
    shortLabel: 'Agenda',
    title: 'Tú eliges cuándo conectar',
    stageSubtitle: 'Reservas el día y la hora que encajan con tu vida junto a un instructor disponible.',
    desc: 'Coordina tus sesiones individuales o grupales según tu horario, sin ataduras rígidas.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: '04',
    shortLabel: 'En Vivo',
    title: 'Conversación real cara a cara',
    stageSubtitle: 'Un profesor te escucha, corrige tu pronunciación al instante y guía tu avance.',
    desc: 'Vives clases 100% prácticas donde hablas de verdad, recibes feedback humano y avanzas de unidad.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: '05',
    shortLabel: 'Comunidad',
    title: 'Habla con personas reales',
    stageSubtitle: 'Foros, debates y club de conversación para convertir el inglés en parte de tu día.',
    desc: 'Comparte con compañeros de tu mismo nivel en dinámicas sociales que te dan soltura natural.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];


// ==========================================================
// MAIN MODERN INTERACTIVE STUDY CYCLE SECTION
// ==========================================================
export default function LandingCycleSection({ onScrollTo }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cycleTick, setCycleTick] = useState(0); // Forces fresh progress animation on every step switch
  const touchStartX = useRef(null);

  // Guaranteed automatic cycling — only pauses if user explicitly toggles Pause
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % CYCLE_STEPS.length);
      setCycleTick((t) => t + 1);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, cycleTick]);

  const handleSelectStep = (idx) => {
    setActiveIndex(idx);
    setCycleTick((t) => t + 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 42) {
      const nextIdx =
        diff > 0
          ? (activeIndex + 1) % CYCLE_STEPS.length
          : (activeIndex - 1 + CYCLE_STEPS.length) % CYCLE_STEPS.length;
      handleSelectStep(nextIdx);
    }
    touchStartX.current = null;
  };

  const activeStep = CYCLE_STEPS[activeIndex];

  return (
    <div id="cycle" className="mt-20 sm:mt-28 scroll-mt-24 relative">
      <style>{`
        @keyframes olaStageIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaPopDelay {
          0% { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaStepProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes olaHumanBreathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes olaBubbleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes olaSmileTalk {
          0%, 100% { transform: scaleY(1); }
          45% { transform: scaleY(0.65); }
          70% { transform: scaleY(1.12); }
        }
        @keyframes olaSteamRise {
          0% { opacity: 0; transform: translateY(4px); }
          50% { opacity: 0.9; transform: translateY(-3px); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes olaCycWave {
          0%, 100% { transform: scaleY(0.45); }
          50% { transform: scaleY(1); }
        }
        @keyframes olaBarFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes olaPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.25); }
        }

        .ola-stage-in {
          animation: olaStageIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ola-pop-delay-1 {
          opacity: 0;
          animation: olaPopDelay 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.16s forwards;
        }
        .ola-human-breathe {
          animation: olaHumanBreathe 3.6s ease-in-out infinite;
        }
        .ola-bubble-bob {
          animation: olaBubbleBob 3.2s ease-in-out infinite;
        }
        .ola-smile-talk {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaSmileTalk 1.6s ease-in-out infinite;
        }
        .ola-steam {
          animation: olaSteamRise 2.2s ease-in-out infinite;
        }
        .ola-wave-float {
          animation: olaBubbleBob 2.4s ease-in-out infinite;
        }
        .ola-cyc-wave {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaCycWave 1.05s ease-in-out infinite;
        }
        .ola-bar-fill {
          transform-box: fill-box;
          transform-origin: left;
          animation: olaBarFill 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
        }
        .ola-pulse-dot {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaPulseDot 1.3s ease-in-out infinite;
        }
        .ola-step-progress {
          transform-origin: left;
          animation: olaStepProgress ${STEP_DURATION_MS}ms linear forwards;
        }
        .ola-cycle-stage-glass {
          background: linear-gradient(
            148deg,
            rgba(235, 238, 255, 0.82) 0%,
            rgba(213, 219, 249, 0.7) 55%,
            rgba(255, 244, 214, 0.76) 100%
          );
          backdrop-filter: blur(28px) saturate(195%);
          -webkit-backdrop-filter: blur(28px) saturate(195%);
          border: 1.5px solid rgba(255, 255, 255, 0.94);
          box-shadow:
            0 24px 54px -14px rgba(72, 80, 136, 0.28),
            inset 0 2px 2px rgba(255, 255, 255, 0.96);
        }
      `}</style>

      {/* CLEAN EDITORIAL HEADER */}
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
            Cinco momentos pensados alrededor de personas reales, práctica constante y conversación en vivo.
          </p>
        </div>

        {/* Clear Play / Pause Toggle */}
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
              <span>Reanudar</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                <rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
              <span>Pausar</span>
            </>
          )}
        </button>
      </div>

      {/* ================================================== */}
      {/* MODERN SPLIT STUDIO: STEP DECK + HUMAN SCENE STAGE */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* MOBILE HORIZONTAL STEP SELECTOR */}
        <div className="lg:hidden grid grid-cols-5 gap-1.5">
          {CYCLE_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => handleSelectStep(idx)}
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
                {isActive && !isPaused && (
                  <span
                    key={`mprog-${cycleTick}`}
                    className="ola-step-progress absolute bottom-0 left-0 right-0 h-[3px] bg-[#ffc749]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* LEFT COLUMN (DESKTOP): KINETIC STEP DECK */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-3 justify-between">
          {CYCLE_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`group relative w-full text-left rounded-[1.6rem] p-4 sm:p-5 transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none ${
                  isActive
                    ? 'bg-white/90 backdrop-blur-2xl border-2 border-[#1e2246] shadow-[0_8px_0_#1e2246,0_18px_36px_-10px_rgba(69,77,130,0.3)] -translate-y-0.5'
                    : 'bg-white/45 hover:bg-white/75 backdrop-blur-xl border border-white/85 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_3px_0_#1e2246] scale-105'
                        : 'bg-white/80 border-white text-[#454d82] group-hover:bg-[#e8eaf7]'
                    }`}
                  >
                    {step.icon}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm sm:text-base font-black tracking-tight transition-colors ${
                          isActive ? 'text-[#1e2246]' : 'text-[#3b4170] group-hover:text-[#1e2246]'
                        }`}
                      >
                        {step.shortLabel}
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
                {isActive && !isPaused && (
                  <span
                    key={`dprog-${cycleTick}`}
                    className="ola-step-progress absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#626a9f] via-[#ffc749] to-[#16a37f]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN (DESKTOP) / MAIN STAGE (MOBILE): CLEAR CONTEXT + HUMAN ILLUSTRATION */}
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

          <div className="ola-cycle-stage-glass flex-1 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[430px] sm:min-h-[480px]">
            {/* Subtle Dotted Glass Texture */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.3) 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />

            {/* Giant Soft Watermark Number */}
            <span className="pointer-events-none select-none absolute -top-5 right-6 text-[7.5rem] sm:text-[9rem] font-black leading-none text-[#454d82]/[0.07]">
              {activeStep.num}
            </span>

            {/* CLEAR STAGE CONTEXT HEADER (Replaces the Empty Top Space) */}
            <div key={`head-${activeStep.num}`} className="ola-stage-in relative z-10 pr-12">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#1e2246] text-[#ffc749] text-[10px] font-black uppercase tracking-widest">
                  Paso {activeStep.num} de 05 • {activeStep.shortLabel}
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-[#1e2246] tracking-tight leading-snug">
                {activeStep.title}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-[#4c5384] mt-1 leading-relaxed max-w-lg">
                {activeStep.stageSubtitle}
              </p>
            </div>

            {/* RIGGED HUMAN EDITORIAL SVG SCENE */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-4 sm:py-5">
              <OutLoudCycleScene stepIndex={activeIndex} />
            </div>

            {/* Bottom Progress Dots + Loop Bar */}
            <div className="relative z-10 pt-4 border-t border-white/75 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {CYCLE_STEPS.map((s, idx) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    aria-label={`Ver paso ${s.num}: ${s.shortLabel}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex
                        ? 'w-8 bg-[#1e2246]'
                        : 'w-2 bg-[#626a9f]/35 hover:bg-[#626a9f]'
                    }`}
                  />
                ))}
                <span className="ml-2 text-[11px] font-extrabold text-[#454d82]">
                  Bucle continuo A1 → C2
                </span>
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