import React, { useState, useRef } from 'react';

// =========================================
// 1. CEFR / IELTS LEVELS DATA (Migrated from LevelsPage.js)
// =========================================
const LEVELS_DATA = [
  {
    id: 'A1',
    title: 'BÁSICO 1',
    score: '0.0 - 2.0',
    duration: '3 MESES',
    units: 'Unidades 1–12',
    height: '20%',
    color: 'bg-[#5b9bd5]',
    textColor: 'text-white',
    planIndex: 0,
    priceLabel: '$20/mes',
    desc: 'Tus primeros pasos. Aprenderás a presentarte, dar información básica y manejar interacciones cotidianas. Este nivel es tu ventana inicial al idioma; aquí construirás la base sólida sobre la cual dominarás el inglés en su totalidad.',
  },
  {
    id: 'A2',
    title: 'BÁSICO 2',
    score: '2.5 - 4.0',
    duration: '3 MESES',
    units: 'Unidades 13–24',
    height: '40%',
    color: 'bg-[#2f5597]',
    textColor: 'text-white',
    planIndex: 0,
    priceLabel: '$20/mes',
    desc: 'Supervivencia asegurada. Podrás comunicarte en situaciones de viaje, ir de compras y conversar sobre tu rutina. Ampliarás tus horizontes progresivamente, adquiriendo las herramientas prácticas necesarias para abarcar todos los aspectos del idioma.',
  },
  {
    id: 'B1',
    title: 'INTER. 1',
    score: '4.5 - 5.0',
    duration: '3 MESES',
    units: 'Unidades 25–36',
    height: '60%',
    color: 'bg-[#ffd966]',
    textColor: 'text-[#23274d]',
    planIndex: 1,
    priceLabel: '$30/mes',
    desc: 'Independencia comunicativa. Expresarás opiniones, describirás experiencias y resolverás imprevistos cotidianos. Le dirás adiós a traducir en tu cabeza, incorporando el inglés de forma integral para desenvolverte en el mundo real.',
  },
  {
    id: 'B2',
    title: 'INTER. 2',
    score: '5.5 - 6.5',
    duration: '3 MESES',
    units: 'Unidades 37–48',
    height: '80%',
    color: 'bg-[#ffc000]',
    textColor: 'text-[#23274d]',
    planIndex: 1,
    priceLabel: '$30/mes',
    desc: 'Fluidez activa. Podrás interactuar con nativos de forma natural, argumentar tus ideas y desenvolverte con total seguridad. Explorarás el idioma a profundidad, preparándote para utilizarlo sin límites en entornos profesionales y personales.',
  },
  {
    id: 'C1',
    title: 'AVANZ. 1',
    score: '7.0 - 8.0',
    duration: '5 MESES',
    units: 'Unidades 49–70',
    height: '90%',
    color: 'bg-[#d9534f]',
    textColor: 'text-white',
    planIndex: 2,
    priceLabel: '$50/mes',
    desc: 'Dominio avanzado. Te expresarás de manera espontánea, comprenderás textos complejos y hablarás con absoluta precisión. Tu inmersión será casi total, otorgándote el poder de dominar el inglés incluso en los contextos más exigentes.',
  },
  {
    id: 'C2',
    title: 'AVANZ. 2',
    score: '8.5 - 9.0',
    duration: '5 MESES',
    units: 'Unidades 71–92',
    height: '100%',
    color: 'bg-[#a30000]',
    textColor: 'text-white',
    planIndex: 2,
    priceLabel: '$50/mes',
    desc: 'Maestría definitiva. Hablarás y comprenderás el idioma captando todos los matices, expresiones idiomáticas y sutilezas. Alcanzarás la meta de aprender el inglés por completo, comunicándote con la misma destreza y naturalidad que un hablante nativo.',
  },
];

// =========================================
// 2. PAYMENT PLANS DATA (Coverflow Tiers)
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
      'Práctica vocal de escucha y comparación en cada unidad',
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
    summary: 'Rompe la barrera de traducir en tu mente y desarrolla fluidez real para viajes, trabajo y conversaciones espontáneas.',
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
    theme: 'white',
    summary: 'Alcanza precisión ejecutiva y naturalidad casi nativa con inmersión profunda en matices, argumentos e idiomas complejos.',
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
  const [activePlanIndex, setActivePlanIndex] = useState(1); // Start focused on Intermedio (center)
  const touchStartX = useRef(null);

  const focusedLevelId = hoveredLevelId || activeLevelId;
  const activeLevelObj = LEVELS_DATA.find((l) => l.id === focusedLevelId) || LEVELS_DATA[0];

  const handleJumpToPlan = (planIdx) => {
    setActivePlanIndex(planIdx);
    onScrollTo?.('#plans');
  };

  // Coverflow Navigation
  const handlePrevPlan = () => {
    setActivePlanIndex((prev) => (prev === 0 ? PAYMENT_PLANS.length - 1 : prev - 1));
  };

  const handleNextPlan = () => {
    setActivePlanIndex((prev) => (prev === PAYMENT_PLANS.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) handleNextPlan();
      else handlePrevPlan();
    }
    touchStartX.current = null;
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
          animation: olaBarRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* ================================================== */}
      {/* PART A: CEFR & IELTS LEVEL EXPLORER (#levels)      */}
      {/* ================================================== */}
      <section id="levels" className="py-16 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#e8eaf7] border-2 border-[#626a9f]/30 rounded-full px-4 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#626a9f]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#626a9f]">
                  Según el CEFR y el IELTS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23274d] tracking-tight leading-none">
                Módulos del Curso
              </h2>
              <p className="text-sm sm:text-base text-[#60668a] font-medium mt-3 max-w-2xl leading-relaxed">
                Explora cada nivel, su duración en meses, equivalencia IELTS y el porcentaje de dominio del idioma que alcanzarás al completarlo.
              </p>
            </div>

            <button
              type="button"
              onClick={onPlacementClick}
              className="ola-btn-outline self-start md:self-auto px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer shrink-0"
            >
              ¿No sabes tu nivel? Haz el Test →
            </button>
          </div>

          {/* Main Backlit Frosted Glass Explorer Container */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-[3rem] bg-gradient-to-br from-[#626a9f]/30 via-[#e8eaf7]/50 to-[#ffc749]/35 blur-3xl opacity-85 -z-10 pointer-events-none" />
            <div className="bg-white/75 backdrop-blur-2xl border-2 border-[#23274d] rounded-[2.5rem] shadow-[0_12px_0_#23274d,inset_0_1px_1px_rgba(255,255,255,0.95)] p-5 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* CHART COLUMN (First on Mobile, Right on Desktop) */}
              <div className="lg:col-span-6 lg:order-2 flex flex-col justify-between bg-[#f6f7fc] border-2 border-[#dfe2f2] rounded-[2rem] p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#626a9f]">
                    Progresión de Dominio
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#ffc749] text-[#23274d] border border-[#23274d] px-3 py-1 rounded-full">
                    👆 Toca o pasa sobre una barra
                  </span>
                </div>

                {/* Bar Chart Canvas */}
                <div className="relative w-full h-[270px] sm:h-[330px] flex flex-col pl-12 sm:pl-16 pr-1 pb-9 pt-3">
                  {/* Y-Axis Label */}
                  <div className="absolute left-0 top-3 bottom-9 w-5 flex items-center justify-center pointer-events-none">
                    <span className="-rotate-90 text-[9px] font-black text-[#60668a] tracking-widest whitespace-nowrap uppercase">
                      Dominio
                    </span>
                  </div>

                  {/* X-Axis Label */}
                  <div className="absolute left-0 bottom-1 h-6 w-12 sm:w-16 flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] sm:text-[9px] font-black text-[#60668a] tracking-widest uppercase">
                      Duración
                    </span>
                  </div>

                  {/* Bars & Grid */}
                  <div className="relative w-full flex-1 border-b-2 border-[#23274d]/25 flex items-end gap-1.5 sm:gap-2.5">
                    {/* Horizontal Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[100, 80, 60, 40, 20].map((val) => (
                        <div
                          key={val}
                          className="absolute w-full border-t border-dashed border-[#626a9f]/20"
                          style={{ bottom: `${val}%` }}
                        >
                          <span className="absolute right-full pr-2 top-0 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-[#60668a]">
                            {val}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Bars */}
                    {LEVELS_DATA.map((bar, idx) => {
                      const isSelected = focusedLevelId === bar.id;
                      return (
                        <div
                          key={bar.id}
                          onMouseEnter={() => setHoveredLevelId(bar.id)}
                          onMouseLeave={() => setHoveredLevelId(null)}
                          onClick={() => setActiveLevelId(bar.id)}
                          className="relative flex-1 flex flex-col justify-end h-full cursor-pointer group z-10"
                        >
                          <div
                            className={`ola-bar-rise relative w-full rounded-t-xl border-2 border-b-0 flex flex-col items-center justify-start pt-1.5 sm:pt-2 px-0.5 text-center transition-all duration-200 overflow-hidden ${
                              bar.color
                            } ${
                              isSelected
                                ? 'border-[#23274d] ring-2 ring-[#ffc749] shadow-lg scale-[1.03] z-20'
                                : 'border-[#23274d]/25 opacity-85 hover:opacity-100'
                            }`}
                            style={{ height: bar.height, animationDelay: `${idx * 0.08}s` }}
                          >
                            <span className={`text-[11px] sm:text-xs font-black leading-none ${bar.textColor}`}>
                              {bar.id}
                            </span>
                            <span className={`text-[6px] sm:text-[7px] font-extrabold leading-none mt-1 truncate max-w-full ${bar.textColor}`}>
                              {bar.title}
                            </span>
                            <span className={`hidden sm:inline text-[6.5px] font-bold opacity-90 leading-none mt-0.5 ${bar.textColor}`}>
                              {bar.score}
                            </span>
                          </div>

                          <div
                            className={`absolute -bottom-7 left-1/2 -translate-x-1/2 h-6 flex items-center text-[8px] sm:text-[9px] font-black whitespace-nowrap transition-colors ${
                              isSelected ? 'text-[#626a9f]' : 'text-[#60668a]'
                            }`}
                          >
                            {bar.duration}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Spotlight Box (Especially handy on Mobile) */}
                <div className="mt-4 bg-white border-2 border-[#23274d] rounded-2xl p-4 sm:p-5 shadow-[0_5px_0_#23274d]">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-10 h-10 rounded-xl border-2 border-[#23274d] flex items-center justify-center font-black text-sm shrink-0 ${activeLevelObj.color} ${activeLevelObj.textColor}`}
                      >
                        {activeLevelObj.id}
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-[#23274d] uppercase leading-tight">
                          {activeLevelObj.title} • {activeLevelObj.duration}
                        </h4>
                        <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-wider">
                          IELTS {activeLevelObj.score} • {activeLevelObj.units}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJumpToPlan(activeLevelObj.planIndex)}
                      className="px-3 py-1.5 rounded-full bg-[#fff3d1] hover:bg-[#ffc749] border border-[#23274d] text-[10px] font-black uppercase tracking-wider text-[#23274d] transition-colors shrink-0 cursor-pointer"
                    >
                      {activeLevelObj.priceLabel} →
                    </button>
                  </div>
                  <p className="text-xs text-[#60668a] font-medium leading-relaxed">
                    {activeLevelObj.desc}
                  </p>
                </div>
              </div>

              {/* ALL 6 LEVEL DESCRIPTORS COLUMN (Left on Desktop, Below Chart on Mobile) */}
              <div className="lg:col-span-6 lg:order-1 flex flex-col justify-between gap-2.5 sm:gap-3">
                {LEVELS_DATA.map((lvl) => {
                  const isFocused = focusedLevelId === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onMouseEnter={() => setHoveredLevelId(lvl.id)}
                      onMouseLeave={() => setHoveredLevelId(null)}
                      onClick={() => setActiveLevelId(lvl.id)}
                      className={`rounded-2xl p-3.5 sm:p-4 border-2 flex items-start gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer ${
                        isFocused
                          ? 'bg-[#fff3d1] border-[#23274d] shadow-[0_4px_0_#23274d] -translate-y-0.5'
                          : 'bg-[#f6f7fc] border-transparent hover:border-[#dfe2f2] hover:bg-white'
                      }`}
                    >
                      <div
                        className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 border-[#23274d]/20 flex items-center justify-center font-black text-base transition-transform ${
                          lvl.color
                        } ${lvl.textColor} ${isFocused ? 'scale-105 border-[#23274d]' : ''}`}
                      >
                        {lvl.id}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs sm:text-sm font-black text-[#23274d] uppercase tracking-wide">
                            {lvl.title}
                          </h4>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-white border border-[#dfe2f2] text-[#626a9f] px-2 py-0.5 rounded-md">
                              IELTS {lvl.score}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-[#e8eaf7] text-[#23274d] px-2 py-0.5 rounded-md">
                              {lvl.duration}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#60668a] font-medium leading-relaxed">
                          {lvl.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* PART B: 3D COVERFLOW PAYMENT PLANS (#plans)        */}
      {/* ================================================== */}
      <section id="plans" className="py-16 sm:py-24 scroll-mt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#fff3d1] border-2 border-[#ffc749] rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#23274d]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#23274d]">
                Planes &amp; Mensualidades
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23274d] tracking-tight leading-tight">
              Inversión clara, <span className="text-[#626a9f]">sin sorpresas</span>
            </h2>
            <p className="text-sm sm:text-base text-[#60668a] font-medium mt-3 leading-relaxed">
              Tu mensualidad se ajusta a tu nivel actual. Desliza o haz clic en las tarjetas para comparar cada plan.
            </p>
          </div>

          {/* 3D COVERFLOW STAGE */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-[540px] sm:h-[560px] flex items-center justify-center select-none"
            style={{ perspective: '1200px' }}
          >
            {PAYMENT_PLANS.map((plan, index) => {
              // Circular offset so 3 cards always flank left, center, right cleanly
              let offset = index - activePlanIndex;
              if (offset > 1) offset -= PAYMENT_PLANS.length;
              if (offset < -1) offset += PAYMENT_PLANS.length;

              const isCenter = offset === 0;
              const isLeft = offset === -1;
              const isRight = offset === 1;

              const cardTransform = isCenter
                ? 'translateX(0%) scale(1) rotateY(0deg)'
                : isLeft
                ? 'translateX(-62%) scale(0.84) rotateY(16deg)'
                : 'translateX(62%) scale(0.84) rotateY(-16deg)';

              const themeStyles =
                plan.theme === 'indigo'
                  ? {
                      card: 'bg-[#626a9f]/92 backdrop-blur-2xl text-white border-[#23274d]',
                      glow: '0 14px 0 #23274d, 0 28px 55px -10px rgba(98, 106, 159, 0.55), 0 0 32px -6px rgba(255, 199, 73, 0.35)',
                      badge: 'bg-[#ffc749] text-[#23274d] border-[#23274d]',
                      price: 'text-[#ffc749]',
                      muted: 'text-white/85',
                      checkBg: 'bg-[#ffc749] text-[#23274d]',
                      divider: 'border-white/15',
                    }
                  : plan.theme === 'yellow'
                  ? {
                      card: 'bg-[#fff3d1]/88 backdrop-blur-2xl text-[#23274d] border-[#23274d]',
                      glow: '0 14px 0 #23274d, 0 28px 55px -10px rgba(255, 199, 73, 0.55)',
                      badge: 'bg-white text-[#23274d] border-[#23274d]',
                      price: 'text-[#23274d]',
                      muted: 'text-[#23274d]/80',
                      checkBg: 'bg-[#ffc749] text-[#23274d]',
                      divider: 'border-[#23274d]/15',
                    }
                  : {
                      card: 'bg-white/85 backdrop-blur-2xl text-[#23274d] border-[#23274d]',
                      glow: '0 14px 0 #23274d, 0 28px 55px -10px rgba(98, 106, 159, 0.4)',
                      badge: 'bg-[#e8eaf7] text-[#626a9f] border-[#626a9f]/30',
                      price: 'text-[#626a9f]',
                      muted: 'text-[#60668a]',
                      checkBg: 'bg-[#e8eaf7] text-[#626a9f]',
                      divider: 'border-[#e8eaf7]',
                    };

              return (
                <div
                  key={plan.id}
                  onClick={() => !isCenter && setActivePlanIndex(index)}
                  className={`absolute w-[88%] max-w-[360px] sm:max-w-[400px] rounded-[2.25rem] border-2 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 ease-out ${
                    themeStyles.card
                  } ${
                    isCenter
                      ? 'z-30 opacity-100 shadow-[0_14px_0_#23274d]'
                      : 'z-10 opacity-65 hover:opacity-85 cursor-pointer shadow-xl'
                  }`}
                  style={{
                    transform: cardTransform,
                    transformStyle: 'preserve-3d',
                    filter: isCenter ? 'none' : 'saturate(0.85)',
                    boxShadow: isCenter ? themeStyles.glow : undefined,
                  }}
                >
                  {/* Top Row: Tier & Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${themeStyles.badge}`}>
                        {plan.badge}
                      </span>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${themeStyles.muted}`}>
                        {plan.tier}
                      </span>
                    </div>

                    {/* Title & Price */}
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className={`text-5xl font-black tracking-tight ${themeStyles.price}`}>
                        ${plan.price}
                      </span>
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${themeStyles.muted}`}>
                        USD / mes
                      </span>
                    </div>
                    <p className={`text-[11px] font-bold uppercase tracking-wider mb-4 ${themeStyles.muted}`}>
                      {plan.duration}
                    </p>

                    <p className={`text-xs sm:text-sm font-medium leading-relaxed pb-5 mb-5 border-b-2 ${themeStyles.muted} ${themeStyles.divider}`}>
                      {plan.summary}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-semibold leading-snug">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${themeStyles.checkBg}`}>
                            ✓
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
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
                    className={`w-full py-3.5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer ${
                      plan.theme === 'indigo' || isCenter ? 'ola-btn-yellow' : 'ola-btn-outline'
                    }`}
                  >
                    {isCenter ? `Elegir ${plan.name} →` : 'Ver Detalles'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Coverflow Controls & Dots */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={handlePrevPlan}
              aria-label="Plan anterior"
              className="ola-btn-outline w-11 h-11 rounded-full flex items-center justify-center font-black text-base cursor-pointer"
            >
              ←
            </button>

            <div className="flex items-center gap-2 bg-white border-2 border-[#dfe2f2] rounded-full px-4 py-2">
              {PAYMENT_PLANS.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePlanIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === activePlanIndex ? 'w-8 bg-[#626a9f]' : 'w-2.5 bg-[#dfe2f2] hover:bg-[#626a9f]/50'
                  }`}
                  aria-label={p.name}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextPlan}
              aria-label="Siguiente plan"
              className="ola-btn-outline w-11 h-11 rounded-full flex items-center justify-center font-black text-base cursor-pointer"
            >
              →
            </button>
          </div>

          {/* Onboarding Fee & Billing Transparency Banner */}
          <div className="mt-10 bg-white/75 backdrop-blur-2xl border-2 border-white/90 rounded-[2rem] p-5 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-5 items-center shadow-[0_14px_34px_-12px_rgba(98,106,159,0.24)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff3d1] border-2 border-[#ffc749] flex items-center justify-center font-black text-lg text-[#23274d] shrink-0">
                $10
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#23274d]">
                  Inscripción Única (Onboarding)
                </h4>
                <p className="text-xs text-[#60668a] font-medium mt-0.5">
                  Activa tu cuenta, evaluación diagnóstica y acceso inicial al Student Hub.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:border-l-2 md:border-[#e8eaf7] md:pl-5">
              <div className="w-12 h-12 rounded-2xl bg-[#e8eaf7] border-2 border-[#626a9f]/30 flex items-center justify-center font-black text-lg text-[#626a9f] shrink-0">
                15/30
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#23274d]">
                  Cohortes Flexibles
                </h4>
                <p className="text-xs text-[#60668a] font-medium mt-0.5">
                  Elige tu fecha de corte el día 15 o día 30 de cada mes según tu conveniencia.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:border-l-2 md:border-[#e8eaf7] md:pl-5">
              <div className="w-12 h-12 rounded-2xl bg-[#626a9f] flex items-center justify-center font-black text-lg text-[#ffc749] shrink-0">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#23274d]">
                  Métodos de Pago
                </h4>
                <p className="text-xs text-[#60668a] font-medium mt-0.5">
                  Zelle, Pago Móvil y Efectivo con verificación directa desde tu plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}