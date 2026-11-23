import React, { useState, useRef, useEffect } from 'react';

// =========================================
// CUSTOM SVG ICONS (Zero Emojis / Raw Glyphs)
// =========================================
const CheckSvg = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

// ArrowLeftSvg removed — carousel now uses far-edge hover (desktop) & live swipe (touch)

const SparkleSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2z" />
  </svg>
);

const EqualizerSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 15v-3m4 6V6m4 12V9m4 9V4m4 11v-4" />
  </svg>
);

// =========================================
// 1. CEFR / IELTS LEVELS (Pure OutLoud Palette)
// =========================================
const LEVELS_DATA = [
  {
    id: 'A1',
    title: 'BÁSICO 1',
    tierLabel: 'Cimientos',
    score: '0.0 – 2.0',
    duration: '3 MESES',
    shortDuration: '3m',
    units: 'Unidades 1–12',
    pct: 20,
    height: '22%',
    barGradient: 'linear-gradient(180deg, #d3d8f7 0%, #9fa8e0 100%)',
    barText: '#1e2246',
    badgeBg: '#e4e8fb',
    badgeText: '#1e2246',
    planIndex: 0,
    priceLabel: '$20/mes',
    desc: 'Tus primeros pasos. Aprenderás a presentarte, dar información básica y manejar interacciones cotidianas. Este nivel es tu ventana inicial al idioma; aquí construirás la base sólida sobre la cual dominarás el inglés en su totalidad.',
  },
  {
    id: 'A2',
    title: 'BÁSICO 2',
    tierLabel: 'Supervivencia',
    score: '2.5 – 4.0',
    duration: '3 MESES',
    shortDuration: '3m',
    units: 'Unidades 13–24',
    pct: 40,
    height: '40%',
    barGradient: 'linear-gradient(180deg, #98a2de 0%, #6d76b3 100%)',
    barText: '#ffffff',
    badgeBg: '#7a83bf',
    badgeText: '#ffffff',
    planIndex: 0,
    priceLabel: '$20/mes',
    desc: 'Supervivencia asegurada. Podrás comunicarte en situaciones de viaje, ir de compras y conversar sobre tu rutina. Ampliarás tus horizontes progresivamente, adquiriendo las herramientas prácticas necesarias para abarcar todos los aspectos del idioma.',
  },
  {
    id: 'B1',
    title: 'INTER. 1',
    tierLabel: 'Independencia',
    score: '4.5 – 5.0',
    duration: '3 MESES',
    shortDuration: '3m',
    units: 'Unidades 25–36',
    pct: 60,
    height: '58%',
    barGradient: 'linear-gradient(180deg, #626a9f 0%, #444c80 100%)',
    barText: '#ffffff',
    badgeBg: '#626a9f',
    badgeText: '#ffffff',
    planIndex: 1,
    priceLabel: '$30/mes',
    desc: 'Independencia comunicativa. Expresarás opiniones, describirás experiencias y resolverás imprevistos cotidianos. Le dirás adiós a traducir en tu cabeza, incorporando el inglés de forma integral para desenvolverte en el mundo real.',
  },
  {
    id: 'B2',
    title: 'INTER. 2',
    tierLabel: 'Fluidez Activa',
    score: '5.5 – 6.5',
    duration: '3 MESES',
    shortDuration: '3m',
    units: 'Unidades 37–48',
    pct: 80,
    height: '76%',
    barGradient: 'linear-gradient(180deg, #454d82 0%, #23274d 100%)',
    barText: '#ffc749',
    badgeBg: '#23274d',
    badgeText: '#ffc749',
    planIndex: 1,
    priceLabel: '$30/mes',
    desc: 'Fluidez activa. Podrás interactuar con nativos de forma natural, argumentar tus ideas y desenvolverte con total seguridad. Explorarás el idioma a profundidad, preparándote para utilizarlo sin límites en entornos profesionales y personales.',
  },
  {
    id: 'C1',
    title: 'AVANZ. 1',
    tierLabel: 'Dominio Ejecutivo',
    score: '7.0 – 8.0',
    duration: '5 MESES',
    shortDuration: '5m',
    units: 'Unidades 49–70',
    pct: 90,
    height: '89%',
    barGradient: 'linear-gradient(180deg, #ffe28a 0%, #ffc749 100%)',
    barText: '#1e2246',
    badgeBg: '#ffc749',
    badgeText: '#1e2246',
    planIndex: 2,
    priceLabel: '$50/mes',
    desc: 'Dominio avanzado. Te expresarás de manera espontánea, comprenderás textos complejos y hablarás con absoluta precisión. Tu inmersión será casi total, otorgándote el poder de dominar el inglés incluso en los contextos más exigentes.',
  },
  {
    id: 'C2',
    title: 'AVANZ. 2',
    tierLabel: 'Maestría Total',
    score: '8.5 – 9.0',
    duration: '5 MESES',
    shortDuration: '5m',
    units: 'Unidades 71–92',
    pct: 100,
    height: '100%',
    barGradient: 'linear-gradient(180deg, #ffc749 0%, #e6a317 55%, #454d82 100%)',
    barText: '#1e2246',
    badgeBg: '#1e2246',
    badgeText: '#ffc749',
    planIndex: 2,
    priceLabel: '$50/mes',
    desc: 'Maestría definitiva. Hablarás y comprenderás el idioma captando todos los matices, expresiones idiomáticas y sutilezas. Alcanzarás la meta de aprender el inglés por completo, comunicándote con la misma destreza y naturalidad que un hablante nativo.',
  },
];

// =========================================
// 2. PAYMENT PLANS (Coverflow Tiers)
// =========================================
const PAYMENT_PLANS = [
  {
    id: 'basic',
    tier: 'Niveles A1 – A2',
    name: 'Plan Básico',
    badge: 'Ideal para Comenzar',
    price: 20,
    duration: '3 meses por nivel • 12 unidades c/u',
    theme: 'yellow',
    summary: 'Construye bases sólidas desde cero con pronunciación guiada, vocabulario práctico y acompañamiento semanal.',
    features: [
      '4 créditos mensuales para Clases 100% En Vivo',
      'Acceso 24/7 a Lecciones y Workbooks interactivos',
      'Práctica vocal de escucha y comparación por unidad',
      'Foros Q&A bilingües y salas de chat moderadas',
      'Club de Conversación y seguimiento de progreso',
    ],
  },
  {
    id: 'intermediate',
    tier: 'Niveles B1 – B2',
    name: 'Plan Intermedio',
    badge: 'Más Popular',
    price: 30,
    duration: '3 meses por nivel • 12 unidades c/u',
    theme: 'indigo',
    summary: 'Rompe la barrera de traducir en tu mente y desarrolla fluidez real para viajes, trabajo y charlas espontáneas.',
    features: [
      '4 créditos mensuales para Clases 100% En Vivo',
      'Acceso 24/7 a Lecciones, Audios y Workbooks B1–B2',
      'Debates en inglés moderados por profesores',
      'Feedback personalizado en pronunciación y fluidez',
      'Acceso a clases complementarias y tutorías 1-on-1',
    ],
  },
  {
    id: 'advanced',
    tier: 'Niveles C1 – C2',
    name: 'Plan Avanzado',
    badge: 'Dominio & Maestría',
    price: 50,
    duration: '5 meses por nivel • 22 unidades c/u',
    theme: 'glass',
    summary: 'Alcanza precisión ejecutiva y naturalidad casi nativa con inmersión profunda en matices y contextos complejos.',
    features: [
      '4 créditos mensuales para Sesiones Avanzadas En Vivo',
      'Acceso 24/7 a currículum extendido (22 unidades/nivel)',
      'Simulaciones profesionales, debates y análisis crítico',
      'Preparación alineada a bandas IELTS 7.0 – 9.0',
      'Evaluación personalizada y certificación de dominio',
    ],
  },
];

export default function LandingLevelsAndPlans({ onScrollTo, onPlacementClick }) {
  const [activeLevelId, setActiveLevelId] = useState('A1');
  const [hoveredLevelId, setHoveredLevelId] = useState(null);
  const [activePlanIndex, setActivePlanIndex] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverEdge, setHoverEdge] = useState(null); // 'left' | 'right' | null

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isHorizontalSwipe = useRef(null);
  const hoverDelayRef = useRef(null);
  const hoverIntervalRef = useRef(null);

  const focusedLevelId = hoveredLevelId || activeLevelId;
  const activeLevelObj = LEVELS_DATA.find((l) => l.id === focusedLevelId) || LEVELS_DATA[0];

  const handleJumpToPlan = (planIdx) => {
    setActivePlanIndex(planIdx);
    onScrollTo?.('#plans');
  };

  const handlePrevPlan = () => {
    setActivePlanIndex((prev) => (prev === 0 ? PAYMENT_PLANS.length - 1 : prev - 1));
  };

  const handleNextPlan = () => {
    setActivePlanIndex((prev) => (prev === PAYMENT_PLANS.length - 1 ? 0 : prev + 1));
  };

  // Desktop Far-Edge Hover Auto-Scroll (comfortable browsing cadence)
  const stopEdgeHover = () => {
    setHoverEdge(null);
    if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
    if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    hoverDelayRef.current = null;
    hoverIntervalRef.current = null;
  };

  const startEdgeHover = (direction) => {
    // Only engage edge-hover scrolling on true mouse/trackpad devices
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    stopEdgeHover();
    setHoverEdge(direction);

    const step = direction === 'left' ? handlePrevPlan : handleNextPlan;
    // Brief gentle delay avoids accidental triggers when passing over the section
    hoverDelayRef.current = setTimeout(() => {
      step();
      hoverIntervalRef.current = setInterval(step, 1150);
    }, 240);
  };

  useEffect(() => {
    return () => stopEdgeHover();
  }, []);

  // Mobile / Touch Live-Tracking 3D Swipe
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontalSwipe.current) {
      // Smooth elastic clamp so cards glide with your thumb
      const clamped = Math.max(-165, Math.min(165, dx));
      setDragOffset(clamped);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current) {
      if (dragOffset < -42) handleNextPlan();
      else if (dragOffset > 42) handlePrevPlan();
    }
    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  };

  return (
    <div className="relative">
      <style>{`
        @keyframes olaBarRise {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .ola-bar-rise {
          transform-origin: bottom;
          animation: olaBarRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        /* Opaque-backed frosted coverflow surfaces so side cards never bleed through */
        .ola-cf-indigo {
          background: linear-gradient(148deg, rgba(69, 77, 130, 0.96) 0%, rgba(35, 39, 77, 0.96) 100%);
          backdrop-filter: blur(28px) saturate(185%);
          -webkit-backdrop-filter: blur(28px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.38);
          box-shadow: 0 26px 60px -12px rgba(30, 34, 70, 0.52), 0 0 42px -6px rgba(98, 106, 159, 0.65), inset 0 1.5px 1px rgba(255, 255, 255, 0.35);
        }
        .ola-cf-yellow {
          background: linear-gradient(148deg, rgba(255, 245, 214, 0.96) 0%, rgba(255, 226, 148, 0.92) 100%);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow: 0 26px 56px -12px rgba(180, 125, 10, 0.32), 0 0 40px -6px rgba(255, 199, 73, 0.65), inset 0 1.5px 1px rgba(255, 255, 255, 0.95);
        }
        .ola-cf-glass {
          background: linear-gradient(148deg, rgba(255, 255, 255, 0.94) 0%, rgba(236, 239, 250, 0.9) 100%);
          backdrop-filter: blur(28px) saturate(185%);
          -webkit-backdrop-filter: blur(28px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 26px 56px -12px rgba(55, 63, 118, 0.32), 0 0 38px -6px rgba(145, 155, 218, 0.55), inset 0 1.5px 1px #ffffff;
        }
      `}</style>

      {/* ================================================== */}
      {/* PART A: OUTLOUD FLUENCY SPECTRUM (#levels)         */}
      {/* ================================================== */}
      <section id="levels" className="py-16 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <div className="ola-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4">
                <EqualizerSvg className="w-4 h-4 text-[#454d82]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#454d82]">
                  Estándar CEFR &amp; Bandas IELTS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e2246] tracking-tight leading-none">
                Módulos del Curso
              </h2>
              <p className="text-sm sm:text-base text-[#4c5384] font-medium mt-3 max-w-2xl leading-relaxed">
                Visualiza tu ruta completa desde tus primeras frases en <strong className="font-black text-[#1e2246]">A1</strong> hasta maestría ejecutiva en <strong className="font-black text-[#1e2246]">C2</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={onPlacementClick}
              className="ola-btn-outline self-start md:self-auto px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer shrink-0 flex items-center gap-2 group"
            >
              <span>¿No sabes tu nivel? Haz el Test</span>
              <ArrowRightSvg className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Main Backlit Frosted Glass Spectrum Shell */}
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[3.2rem] blur-3xl opacity-75 -z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(98,106,159,0.5) 0%, rgba(168,176,222,0.4) 50%, rgba(255,199,73,0.5) 100%)',
              }}
            />

            <div className="ola-glass rounded-[2.5rem] p-5 sm:p-8 lg:p-10">
              {/* Quick Pill Strip for Instant Selection (Mobile & Tablet Friendly) */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/70">
                <div className="flex items-center gap-2 shrink-0">
                  {LEVELS_DATA.map((lvl) => {
                    const isSelected = focusedLevelId === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setActiveLevelId(lvl.id)}
                        className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#1e2246] text-[#ffc749] border-[#1e2246] shadow-md scale-105'
                            : 'bg-white/65 text-[#454d82] border-white hover:bg-white hover:text-[#1e2246]'
                        }`}
                      >
                        {lvl.id}
                      </button>
                    );
                  })}
                </div>

                <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#454d82] shrink-0">
                  <SparkleSvg className="w-3.5 h-3.5 text-[#f0b32b]" />
                  <span>Selecciona cualquier nivel o barra</span>
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-stretch">
                {/* LEFT: ACOUSTIC FLUENCY EQUALIZER CHART */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-white/45 backdrop-blur-xl border border-white/85 rounded-[2rem] p-5 sm:p-7 shadow-inner">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#454d82]">
                      Espectro de Dominio OutLoud
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full">
                      {activeLevelObj.id} • {activeLevelObj.pct}% Dominio
                    </span>
                  </div>

                  {/* Chart Canvas */}
                  <div className="relative w-full h-[250px] sm:h-[310px] flex flex-col pl-9 sm:pl-12 pr-1 pb-9 pt-4">
                    <div className="relative w-full flex-1 border-b-2 border-[#626a9f]/30 flex items-end gap-2 sm:gap-3.5">
                      {/* Horizontal Guide Lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[100, 80, 60, 40, 20].map((val) => (
                          <div
                            key={val}
                            className="absolute w-full border-t border-dashed border-[#626a9f]/20"
                            style={{ bottom: `${val}%` }}
                          >
                            <span className="absolute right-full pr-2 top-0 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-[#50567d]">
                              {val}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Spectrum Bars */}
                      {LEVELS_DATA.map((bar, idx) => {
                        const isSelected = focusedLevelId === bar.id;
                        return (
                          <button
                            key={bar.id}
                            type="button"
                            onMouseEnter={() => setHoveredLevelId(bar.id)}
                            onMouseLeave={() => setHoveredLevelId(null)}
                            onClick={() => setActiveLevelId(bar.id)}
                            className="relative flex-1 flex flex-col justify-end h-full cursor-pointer group z-10 focus:outline-none"
                          >
                            <div
                              className={`ola-bar-rise relative w-full rounded-t-2xl flex flex-col items-center justify-start pt-2 sm:pt-3 px-1 text-center transition-all duration-300 overflow-hidden ${
                                isSelected
                                  ? 'ring-2 ring-[#1e2246] shadow-[0_14px_28px_-6px_rgba(69,77,130,0.45)] -translate-y-1 z-20'
                                  : 'opacity-80 hover:opacity-100 hover:-translate-y-0.5'
                              }`}
                              style={{
                                height: bar.height,
                                background: bar.barGradient,
                                color: bar.barText,
                                animationDelay: `${idx * 0.07}s`,
                              }}
                            >
                              {/* Specular Glass Highlight Inside Bar */}
                              <div className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/40 pointer-events-none" />

                              <span className="text-xs sm:text-sm font-black leading-none relative z-10">
                                {bar.id}
                              </span>
                              <span className="hidden sm:inline text-[8px] font-extrabold tracking-wider opacity-90 mt-1 relative z-10">
                                {bar.title}
                              </span>
                            </div>

                            {/* Clean Non-Colliding Duration Label */}
                            <div
                              className={`absolute -bottom-7 left-1/2 -translate-x-1/2 h-6 flex items-center text-[9px] sm:text-[10px] font-black whitespace-nowrap transition-colors ${
                                isSelected ? 'text-[#1e2246]' : 'text-[#50567d]'
                              }`}
                            >
                              <span className="sm:hidden">{bar.shortDuration}</span>
                              <span className="hidden sm:inline">{bar.duration}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop Compact 6-Tile Quick Selector Matrix (Hidden on Mobile to Prevent Redundancy) */}
                  <div className="hidden lg:grid grid-cols-6 gap-2 mt-5 pt-4 border-t border-[#626a9f]/15">
                    {LEVELS_DATA.map((lvl) => {
                      const isSelected = focusedLevelId === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onMouseEnter={() => setHoveredLevelId(lvl.id)}
                          onMouseLeave={() => setHoveredLevelId(null)}
                          onClick={() => setActiveLevelId(lvl.id)}
                          className={`rounded-xl p-2 text-center transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#1e2246] text-white border-[#1e2246] shadow-md -translate-y-0.5'
                              : 'bg-white/65 text-[#454d82] border-white hover:bg-white'
                          }`}
                        >
                          <div className={`text-xs font-black ${isSelected ? 'text-[#ffc749]' : 'text-[#1e2246]'}`}>
                            {lvl.id}
                          </div>
                          <div className={`text-[9px] font-bold truncate ${isSelected ? 'text-white/80' : 'text-[#50567d]'}`}>
                            {lvl.score}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT: SINGLE UNIFIED LEVEL SPOTLIGHT CARD */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div
                    key={activeLevelObj.id}
                    className="ola-glass-indigo rounded-[2rem] p-6 sm:p-8 text-white h-full flex flex-col justify-between animate-fade-in relative overflow-hidden"
                  >
                    <div>
                      {/* Top Badge Row */}
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-2xl border-2 border-white/40 flex items-center justify-center font-black text-xl shadow-lg shrink-0"
                            style={{ backgroundColor: activeLevelObj.badgeBg, color: activeLevelObj.badgeText }}
                          >
                            {activeLevelObj.id}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#ffc749] block">
                              {activeLevelObj.tierLabel}
                            </span>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none mt-0.5">
                              {activeLevelObj.title}
                            </h3>
                          </div>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-full shrink-0">
                          {activeLevelObj.duration}
                        </span>
                      </div>

                      {/* Key Metrics Pills */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/65 block">
                            Equivalencia IELTS
                          </span>
                          <span className="text-base font-black text-[#ffc749] mt-0.5 block">
                            {activeLevelObj.score}
                          </span>
                        </div>
                        <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/65 block">
                            Currículum
                          </span>
                          <span className="text-base font-black text-white mt-0.5 block">
                            {activeLevelObj.units}
                          </span>
                        </div>
                      </div>

                      {/* Fluency Progress Meter */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-white/75">Dominio Alcanzado</span>
                          <span className="text-[#ffc749]">{activeLevelObj.pct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#ffc749] to-[#ffe599] rounded-full transition-all duration-500"
                            style={{ width: `${activeLevelObj.pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-white/90 font-medium leading-relaxed mb-8">
                        {activeLevelObj.desc}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleJumpToPlan(activeLevelObj.planIndex)}
                      className="ola-btn-yellow w-full py-3.5 px-5 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <span>Ver Plan Correspondiente ({activeLevelObj.priceLabel})</span>
                      <ArrowRightSvg className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* PART B: 3D GLASS COVERFLOW PAYMENT PLANS (#plans)  */}
      {/* ================================================== */}
      <section id="plans" className="py-16 sm:py-24 scroll-mt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="ola-glass-yellow inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4">
              <SparkleSvg className="w-3.5 h-3.5 text-[#1e2246]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#1e2246]">
                Planes &amp; Mensualidades
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e2246] tracking-tight leading-tight">
              Inversión clara, <span className="text-[#4c548a]">sin sorpresas</span>
            </h2>
            <p className="text-sm sm:text-base text-[#4c5384] font-medium mt-3 leading-relaxed">
              Tu mensualidad se ajusta a tu nivel actual. Desliza o toca las tarjetas laterales para comparar cada plan.
            </p>
          </div>

          {/* 3D COVERFLOW STAGE (Desktop Far-Edge Hover + Live Touch Swipe) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseLeave={stopEdgeHover}
            className="relative w-full min-h-[590px] sm:min-h-[610px] py-6 flex items-center justify-center select-none touch-pan-y"
            style={{ perspective: '1300px' }}
          >
            {/* DESKTOP FAR-LEFT HOVER SCROLL ZONE */}
            <div
              onMouseEnter={() => startEdgeHover('left')}
              onMouseLeave={stopEdgeHover}
              onClick={handlePrevPlan}
              aria-hidden="true"
              className="hidden md:block absolute inset-y-8 left-0 w-[18%] lg:w-[22%] z-40 cursor-w-resize rounded-l-[2.5rem] transition-opacity duration-300"
              style={{
                background:
                  hoverEdge === 'left'
                    ? 'linear-gradient(90deg, rgba(255,199,73,0.18) 0%, transparent 100%)'
                    : 'transparent',
              }}
            />

            {/* DESKTOP FAR-RIGHT HOVER SCROLL ZONE */}
            <div
              onMouseEnter={() => startEdgeHover('right')}
              onMouseLeave={stopEdgeHover}
              onClick={handleNextPlan}
              aria-hidden="true"
              className="hidden md:block absolute inset-y-8 right-0 w-[18%] lg:w-[22%] z-40 cursor-e-resize rounded-r-[2.5rem] transition-opacity duration-300"
              style={{
                background:
                  hoverEdge === 'right'
                    ? 'linear-gradient(270deg, rgba(255,199,73,0.18) 0%, transparent 100%)'
                    : 'transparent',
              }}
            />

            {PAYMENT_PLANS.map((plan, index) => {
              let offset = index - activePlanIndex;
              if (offset > 1) offset -= PAYMENT_PLANS.length;
              if (offset < -1) offset += PAYMENT_PLANS.length;

              const isCenter = offset === 0;
              const dragProgress = dragOffset / 280;
              const liveOffset = offset + dragProgress;

              const translatePct = liveOffset * 58;
              const liveScale = Math.max(0.78, 1 - Math.abs(liveOffset) * 0.18);
              const liveRotateY = -liveOffset * 18;
              const cardTransform = `translateX(${translatePct}%) scale(${liveScale}) rotateY(${liveRotateY}deg)`;

              const isIndigo = plan.theme === 'indigo';
              const isYellow = plan.theme === 'yellow';

              const surfaceClass = isIndigo
                ? 'ola-cf-indigo text-white'
                : isYellow
                ? 'ola-cf-yellow text-[#1e2246]'
                : 'ola-cf-glass text-[#1e2246]';

              const badgeClass = isIndigo
                ? 'bg-[#ffc749] text-[#1e2246]'
                : isYellow
                ? 'bg-[#1e2246] text-[#ffc749]'
                : 'bg-[#454d82] text-white';

              const priceColor = isIndigo ? 'text-[#ffc749]' : isYellow ? 'text-[#1e2246]' : 'text-[#454d82]';
              const mutedColor = isIndigo ? 'text-white/80' : 'text-[#4c5384]';
              const dividerColor = isIndigo ? 'border-white/20' : 'border-[#626a9f]/20';
              const checkBg = isIndigo
                ? 'bg-[#ffc749] text-[#1e2246]'
                : isYellow
                ? 'bg-[#1e2246] text-[#ffc749]'
                : 'bg-[#626a9f] text-white';

              return (
                <div
                  key={plan.id}
                  onClick={() => !isCenter && setActivePlanIndex(index)}
                  className={`absolute w-[88%] max-w-[355px] sm:max-w-[405px] rounded-[2.25rem] p-6 sm:p-8 flex flex-col justify-between ${
                    isDragging ? 'transition-none' : 'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
                  } ${surfaceClass} ${
                    isCenter ? 'z-30 opacity-100' : 'z-10 opacity-55 hover:opacity-80 cursor-pointer'
                  }`}
                  style={{
                    transform: cardTransform,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, opacity',
                    filter: isCenter ? 'none' : 'blur(1px) saturate(0.85)',
                  }}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${badgeClass}`}>
                        {plan.badge}
                      </span>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${mutedColor}`}>
                        {plan.tier}
                      </span>
                    </div>

                    {/* Title & Price */}
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className={`text-5xl font-black tracking-tight ${priceColor}`}>
                        ${plan.price}
                      </span>
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${mutedColor}`}>
                        USD / mes
                      </span>
                    </div>
                    <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4 ${mutedColor}`}>
                      {plan.duration}
                    </p>

                    <p className={`text-xs sm:text-sm font-medium leading-relaxed pb-4 mb-4 border-b ${mutedColor} ${dividerColor}`}>
                      {plan.summary}
                    </p>

                    {/* Features with Custom SVG Checks */}
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-semibold leading-snug">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${checkBg}`}>
                            <CheckSvg className="w-3 h-3" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card CTA */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCenter) {
                        setActivePlanIndex(index);
                      } else {
                        onScrollTo?.('#enroll');
                      }
                    }}
                    className={`w-full py-3.5 px-5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 group ${
                      isCenter ? 'ola-btn-yellow' : 'ola-btn-outline'
                    }`}
                  >
                    <span>{isCenter ? `Elegir ${plan.name}` : 'Ver Plan'}</span>
                    <ArrowRightSvg className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Minimal Pagination Indicator (No Redundant Arrows) */}
          <div className="flex flex-col items-center justify-center gap-2.5 mt-4">
            <div className="ola-glass flex items-center gap-2 rounded-full px-4 py-2.5">
              {PAYMENT_PLANS.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePlanIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activePlanIndex ? 'w-8 bg-[#1e2246]' : 'w-2.5 bg-[#626a9f]/35 hover:bg-[#626a9f]'
                  }`}
                  aria-label={p.name}
                />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#50567d]/80 md:hidden">
              Desliza para ver los planes
            </span>
          </div>

          {/* Backlit Glass Onboarding & Billing Strip (Custom SVG Icons) */}
          <div className="mt-12 ola-glass rounded-[2rem] p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center font-black text-base text-[#1e2246] shrink-0">
                $10
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#1e2246]">
                  Inscripción Única (Onboarding)
                </h4>
                <p className="text-xs text-[#4c5384] font-medium mt-0.5 leading-snug">
                  Activa tu cuenta, evaluación diagnóstica y acceso inicial al Student Hub.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:border-l md:border-white/70 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-[#454d82] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#ffc749] shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#1e2246]">
                  Cohortes Día 15 o Día 30
                </h4>
                <p className="text-xs text-[#4c5384] font-medium mt-0.5 leading-snug">
                  Elige la fecha de corte mensual que mejor se adapte a tu presupuesto.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:border-l md:border-white/70 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-white/85 border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#454d82] shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#1e2246]">
                  Zelle • Pago Móvil • Efectivo
                </h4>
                <p className="text-xs text-[#4c5384] font-medium mt-0.5 leading-snug">
                  Verificación directa desde tu plataforma con activación rápida de créditos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}