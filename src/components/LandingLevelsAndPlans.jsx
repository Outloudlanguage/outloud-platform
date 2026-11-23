import React, { useState, useRef, useEffect } from 'react';

// =========================================
// CUSTOM SVG ICONS (Cero emojis genéricos)
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

const PlusSvg = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
  </svg>
);

const MinusSvg = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

// =========================================
// 1. CEFR / IELTS LEVELS (Paleta OutLoud)
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
    planIndex: 1,
    priceLabel: '$20/mes',
    desc: 'Tus primeros pasos. Aprenderás a presentarte, dar información básica y manejar interacciones cotidianas. Construirás la base sólida sobre la cual dominarás el inglés por completo.',
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
    planIndex: 1,
    priceLabel: '$20/mes',
    desc: 'Supervivencia asegurada. Podrás comunicarte en viajes, compras y conversaciones sobre tu rutina, adquiriendo herramientas prácticas para desenvolverte en situaciones diarias.',
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
    planIndex: 2,
    priceLabel: '$30/mes',
    desc: 'Independencia comunicativa. Expresarás opiniones, describirás experiencias y resolverás imprevistos cotidianos dejando atrás el hábito de traducir en tu cabeza.',
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
    planIndex: 2,
    priceLabel: '$30/mes',
    desc: 'Fluidez activa. Interactuarás con nativos de forma natural, argumentarás tus ideas con seguridad y utilizarás el idioma sin límites en entornos profesionales y personales.',
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
    planIndex: 3,
    priceLabel: '$50/mes',
    desc: 'Dominio avanzado. Te expresarás con espontaneidad y precisión, comprendiendo textos complejos y desenvolviéndote con solvencia en contextos exigentes.',
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
    planIndex: 3,
    priceLabel: '$50/mes',
    desc: 'Maestría definitiva. Captarás todos los matices, expresiones idiomáticas y sutilezas del idioma, comunicándote con la destreza y naturalidad de un hablante nativo.',
  },
];

// =========================================
// 2. BENEFICIOS COMPARTIDOS DE LOS 6 NIVELES CEFR
// =========================================
const CEFR_SHARED_BENEFITS = [
  '4 créditos mensuales para Clases 100% En Vivo',
  'Acceso 24/7 a Lecciones, Audios y Workbooks interactivos',
  'Práctica vocal de escucha y comparación instantánea',
  'Club de Conversación, Foros Q&A y Salas de Chat',
  'Evaluación continua y feedback de instructores reales',
];

// =========================================
// 3. 5 PLANES DE INVERSIÓN (Coverflow 3D)
// =========================================
const PAYMENT_PLANS = [
  {
    id: 'solo',
    shortTab: 'A Tu Ritmo $5',
    tier: '100% Asincrónico',
    name: 'Solo a Tu Ritmo',
    badge: 'Modo Autónomo',
    price: 5,
    duration: 'Acceso ilimitado • Solo tú y el sistema',
    theme: 'solo',
    summary:
      'Estudia a tu paso sin horarios ni sesiones en vivo. Disfruta uso ilimitado de todas las herramientas asincrónicas de OutLoud.',
    features: [
      'Uso ilimitado 24/7 de Lecciones y Workbooks interactivos',
      'Audio nativo y práctica vocal con comparación inmediata',
      'Avance verdaderamente libre, sin horarios ni compromisos',
      'Progreso guardado automáticamente en tu Student Hub',
      'Modalidad 100% individual (sin clases live, docentes ni grupos)',
    ],
  },
  {
    id: 'basic',
    shortTab: 'Básico $20',
    tier: 'Niveles A1 – A2',
    name: 'Plan Básico',
    badge: 'Ideal para Comenzar',
    price: 20,
    duration: '3 meses por nivel • 12 unidades c/u',
    theme: 'yellow',
    summary:
      'Todos los beneficios de la experiencia OutLoud para construir bases sólidas desde cero y empezar a hablar desde el día uno.',
    features: CEFR_SHARED_BENEFITS,
  },
  {
    id: 'intermediate',
    shortTab: 'Intermedio $30',
    tier: 'Niveles B1 – B2',
    name: 'Plan Intermedio',
    badge: 'Más Popular',
    price: 30,
    duration: '3 meses por nivel • 12 unidades c/u',
    theme: 'indigo',
    summary:
      'Los mismos beneficios integrales enfocados en romper la traducción mental y lograr fluidez espontánea en contextos reales.',
    features: CEFR_SHARED_BENEFITS,
  },
  {
    id: 'advanced',
    shortTab: 'Avanzado $50',
    tier: 'Niveles C1 – C2',
    name: 'Plan Avanzado',
    badge: 'Dominio & Maestría',
    price: 50,
    duration: '5 meses por nivel • 22 unidades c/u',
    theme: 'glass',
    summary:
      'Todos los beneficios de la academia aplicados al currículum extendido C1–C2 para precisión ejecutiva y dominio casi nativo.',
    features: CEFR_SHARED_BENEFITS,
  },
  {
    id: 'b2b',
    shortTab: 'B2B $120',
    tier: 'Hasta 10 Alumnos',
    name: 'Grupos B2B',
    badge: 'Empresas & Equipos',
    price: 120,
    duration: '4 lecciones en vivo/mes • Horarios fijados',
    theme: 'b2b',
    summary:
      'Solución llave en mano para empresas o grupos de hasta 10 personas con plan de estudio estructurado y calendario reservado.',
    features: [
      'Hasta 10 alumnos incluidos en el mismo grupo cerrado',
      'Plan de estudio con horarios ya apartados y calendarizados',
      'Mismos 4 créditos / ritmo de 4 lecciones en vivo al mes',
      'Acceso 24/7 a plataforma, audios y workbooks para todo el equipo',
      'Seguimiento de asistencia, avance y evaluación grupal',
    ],
  },
];

// =========================================
// 4. EXPLICADOR INTERACTIVO DE CRÉDITOS Y COHORTES
// =========================================
function CreditsAndCohortsExplainer({ onScrollTo }) {
  const [extraCredits, setExtraCredits] = useState(0); // 0, 1 o 2
  const [selectedCohort, setSelectedCohort] = useState(15); // 15 o 30

  const totalLiveCredits = 4 + extraCredits;
  const paceLabel =
    extraCredits === 0
      ? 'Ritmo estándar • 1 clase por semana'
      : extraCredits === 1
      ? 'Ritmo acelerado • 5 sesiones en vivo este mes'
      : 'Ritmo intensivo • 6 sesiones en vivo este mes';

  const paceBenefit =
    extraCredits === 0
      ? 'Ideal para completar 1 unidad semanal (12 unidades en 3 meses) sin saturar tu agenda.'
      : 'Perfecto para adelantar unidades, preparar un viaje o entrevista, o tomar refuerzo 1-a-1 sin cambiar de plan.';

  return (
    <div className="mt-14 sm:mt-16 relative">
      {/* Glow ambiental */}
      <div
        className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-70 -z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(125deg, rgba(255,199,73,0.42) 0%, rgba(98,106,159,0.44) 55%, rgba(22,163,127,0.34) 100%)',
        }}
      />

      <div className="ola-glass rounded-[2.5rem] p-6 sm:p-8 lg:p-10">
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 mb-7 border-b border-white/75">
          <div>
            <span className="inline-flex items-center gap-2 bg-[#454d82] text-[#ffc749] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <SparkleSvg className="w-3 h-3" />
              <span>Sistema Inteligente de Estudio</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1e2246] tracking-tight leading-tight">
              ¿Cómo funcionan los <span className="text-[#454d82]">Créditos</span>,{' '}
              <span className="text-[#128063]">Extra Créditos</span> y{' '}
              <span className="underline decoration-[#ffc749] decoration-4 underline-offset-2">Cohortes</span>?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#4c5384] font-semibold max-w-md leading-relaxed">
            Un modelo diseñado para darte control total de tu tiempo y presupuesto: nunca pagas por clases perdidas ni dependes de horarios rígidos.
          </p>
        </div>

        {/* BLOQUE VISUAL INTERACTIVO (2 Columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
          {/* COLUMNA IZQUIERDA: SIMULADOR VISUAL DE CRÉDITOS + EXTRA CRÉDITOS */}
          <div className="lg:col-span-7 bg-white/65 backdrop-blur-xl border border-white/95 rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] font-black text-xs flex items-center justify-center">
                    1:1
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-[#1e2246] uppercase tracking-wide leading-tight">
                      1 Crédito = 1 Clase 100% En Vivo
                    </h4>
                    <p className="text-[11px] font-semibold text-[#50567d]">
                      Tu mensualidad CEFR recarga 4 créditos cada mes
                    </p>
                  </div>
                </div>

                {/* Control táctil para probar Extra Créditos */}
                <div className="inline-flex items-center gap-2 bg-[#f3f5fc] border border-[#dfe2f2] rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setExtraCredits((prev) => Math.max(0, prev - 1))}
                    disabled={extraCredits === 0}
                    aria-label="Quitar extra crédito"
                    className="w-7 h-7 rounded-full bg-white border border-[#626a9f]/30 text-[#1e2246] flex items-center justify-center cursor-pointer disabled:opacity-35 hover:bg-[#ffc749] active:scale-90 transition-all"
                  >
                    <MinusSvg className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-[10px] font-black uppercase tracking-wider text-[#1e2246]">
                    +{extraCredits} Extra
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraCredits((prev) => Math.min(2, prev + 1))}
                    disabled={extraCredits === 2}
                    aria-label="Sumar extra crédito"
                    className="w-7 h-7 rounded-full bg-[#16a37f] text-white flex items-center justify-center cursor-pointer disabled:opacity-35 hover:brightness-110 active:scale-90 transition-all"
                  >
                    <PlusSvg className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* FICHA VISUAL DE CRÉDITOS DEL MES */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 my-5">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={`base-${num}`}
                    className="rounded-2xl bg-[#fff3d1] border-2 border-[#ffc749] p-3 flex flex-col items-center justify-center text-center shadow-sm"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#ffc749] border border-[#1e2246] text-[#1e2246] font-black text-xs flex items-center justify-center mb-1.5">
                      {num}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#1e2246]">
                      Sem {num}
                    </span>
                    <span className="text-[8px] font-bold text-[#50567d] uppercase">Incluido</span>
                  </div>
                ))}

                {[1, 2].map((extraIdx) => {
                  const isActive = extraCredits >= extraIdx;
                  return (
                    <button
                      key={`extra-${extraIdx}`}
                      type="button"
                      onClick={() =>
                        setExtraCredits((prev) => (prev >= extraIdx ? extraIdx - 1 : extraIdx))
                      }
                      className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer border-2 ${
                        isActive
                          ? 'bg-[#16a37f]/15 border-[#16a37f] shadow-md -translate-y-0.5'
                          : 'bg-white/60 border-dashed border-[#626a9f]/35 hover:border-[#16a37f] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center mb-1.5 transition-colors ${
                          isActive
                            ? 'bg-[#16a37f] text-white'
                            : 'bg-[#e8eaf7] text-[#454d82]'
                        }`}
                      >
                        +{extraIdx}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#1e2246]">
                        Extra
                      </span>
                      <span className="text-[8px] font-bold text-[#128063] uppercase">
                        {isActive ? 'Activo' : 'Tocar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resultado dinámico del simulador */}
            <div className="bg-[#1e2246] text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#ffc749]">
                  {totalLiveCredits} Clases En Vivo • {paceLabel}
                </p>
                <p className="text-xs font-medium text-white/85 mt-1 leading-snug">
                  {paceBenefit}
                </p>
              </div>
              <span className="self-start sm:self-center shrink-0 text-[10px] font-black uppercase tracking-widest bg-white/15 border border-white/25 px-3 py-1.5 rounded-full text-white">
                Flexibilidad Total
              </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: SELECTOR VISUAL DE COHORTES (DÍA 15 vs DÍA 30) */}
          <div className="lg:col-span-5 bg-white/65 backdrop-blur-xl border border-white/95 rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="text-sm font-black text-[#1e2246] uppercase tracking-wide leading-tight">
                    Cohortes de Cobro
                  </h4>
                  <p className="text-[11px] font-semibold text-[#50567d]">
                    Elige tu fecha de corte mensual
                  </p>
                </div>

                {/* Toggle Día 15 / Día 30 */}
                <div className="inline-flex bg-[#e8eaf7] rounded-full p-1 border border-white">
                  {[15, 30].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedCohort(day)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        selectedCohort === day
                          ? 'bg-[#454d82] text-[#ffc749] shadow-sm'
                          : 'text-[#454d82] hover:text-[#1e2246]'
                      }`}
                    >
                      Día {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Línea de tiempo visual del ciclo mensual */}
              <div className="relative bg-white/85 border border-[#dfe2f2] rounded-2xl p-4 my-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#50567d] mb-3">
                  <span>Día 1</span>
                  <span className={selectedCohort === 15 ? 'text-[#1e2246]' : ''}>Día 15</span>
                  <span className={selectedCohort === 30 ? 'text-[#1e2246]' : ''}>Día 30</span>
                </div>

                {/* Barra de línea de tiempo */}
                <div className="relative h-3 bg-[#e8eaf7] rounded-full overflow-visible mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#626a9f] to-[#ffc749] transition-all duration-300"
                    style={{ width: selectedCohort === 15 ? '50%' : '100%' }}
                  />
                  {/* Marcador interactivo */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#ffc749] border-2 border-[#1e2246] shadow-md flex items-center justify-center transition-all duration-300"
                    style={{ left: selectedCohort === 15 ? '50%' : '96%' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#1e2246]" />
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#454d82] text-[#ffc749] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {selectedCohort}
                  </span>
                  <p className="text-xs font-semibold text-[#3b4170] leading-snug">
                    {selectedCohort === 15 ? (
                      <>
                        <strong className="font-black text-[#1e2246]">Cohorte Día 15:</strong> Tu corte cae a mitad de mes. Al reportar tu pago, tus 4 créditos se renuevan de inmediato para el siguiente ciclo.
                      </>
                    ) : (
                      <>
                        <strong className="font-black text-[#1e2246]">Cohorte Día 30:</strong> Tu corte cae a fin de mes. Ideal si prefieres sincronizar tu mensualidad con tu quincena de cierre.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Por qué es beneficioso */}
            <div className="bg-[#fff3d1]/80 border border-[#ffc749] rounded-2xl p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#1e2246] mb-1.5">
                ¿Por qué te beneficia este sistema?
              </p>
              <ul className="space-y-1.5 text-xs font-semibold text-[#282d57]">
                <li className="flex items-start gap-2">
                  <CheckSvg className="w-3.5 h-3.5 text-[#128063] shrink-0 mt-0.5" />
                  <span>Cero clases desperdiciadas: solo usas un crédito cuando agendas tu horario real.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckSvg className="w-3.5 h-3.5 text-[#128063] shrink-0 mt-0.5" />
                  <span>Acelera o refuerza en cualquier momento con Extra Créditos sin subir de tarifa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckSvg className="w-3.5 h-3.5 text-[#128063] shrink-0 mt-0.5" />
                  <span>Sin cargos automáticos sorpresa: tú eliges tu fecha de corte y verificas tu pago.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FRANJA INFERIOR: INSCRIPCIÓN POR NIVEL + COHORTES + MÉTODOS DE PAGO REALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-white/75">
          {/* 1. Inscripción por nivel (NO única) */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center font-black text-base text-[#1e2246] shrink-0">
              $10
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#1e2246]">
                Inscripción por Nivel
              </h4>
              <p className="text-xs text-[#4c5384] font-medium mt-1 leading-snug">
                Se realiza al iniciar tu curso y cada vez que culminas un nivel CEFR para pasar al siguiente. Activa tu nuevo módulo y materiales.
              </p>
            </div>
          </div>

          {/* 2. Extra Créditos bajo demanda */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#454d82] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#ffc749] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#1e2246]">
                Extra Créditos Flexibles
              </h4>
              <p className="text-xs text-[#4c5384] font-medium mt-1 leading-snug">
                Agrega clases adicionales cuando quieras acelerar tu nivel o repasar antes de una evaluación, directo desde tu Hub.
              </p>
            </div>
          </div>

          {/* 3. Métodos de pago reales (Zinli, PayPal, Binance + moneda local) */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#454d82] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#1e2246]">
                Zinli • PayPal • Binance
              </h4>
              <p className="text-xs text-[#4c5384] font-medium mt-1 leading-snug">
                Verificación rápida desde tu cuenta.{' '}
                <button
                  type="button"
                  onClick={() => onScrollTo?.('#enroll')}
                  className="font-black text-[#454d82] underline decoration-[#ffc749] decoration-2 underline-offset-2 hover:text-[#1e2246] cursor-pointer"
                >
                  Consulte sobre pagos en su moneda local.
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================
// COMPONENTE PRINCIPAL: NIVELES + PLANES + CRÉDITOS
// =========================================
export default function LandingLevelsAndPlans({ onScrollTo, onPlacementClick }) {
  const [activeLevelId, setActiveLevelId] = useState('A1');
  const [hoveredLevelId, setHoveredLevelId] = useState(null);
  const [activePlanIndex, setActivePlanIndex] = useState(2); // Inicia centrado en Plan Intermedio ($30)
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverEdge, setHoverEdge] = useState(null);

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

  // Hover automático en bordes laterales en escritorio (velocidad cómoda)
  const stopEdgeHover = () => {
    setHoverEdge(null);
    if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
    if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    hoverDelayRef.current = null;
    hoverIntervalRef.current = null;
  };

  const startEdgeHover = (direction) => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    stopEdgeHover();
    setHoverEdge(direction);

    const step = direction === 'left' ? handlePrevPlan : handleNextPlan;
    hoverDelayRef.current = setTimeout(() => {
      step();
      hoverIntervalRef.current = setInterval(step, 1150);
    }, 240);
  };

  useEffect(() => {
    return () => stopEdgeHover();
  }, []);

  // Swipe táctil fluido en móvil / pantalla táctil
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

  const totalPlans = PAYMENT_PLANS.length;
  const halfPlans = Math.floor(totalPlans / 2);

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
        /* Superficies Coverflow con respaldo opaco para evitar transparencias cruzadas */
        .ola-cf-solo {
          background: linear-gradient(148deg, rgba(236, 252, 246, 0.97) 0%, rgba(212, 243, 234, 0.95) 100%);
          backdrop-filter: blur(28px) saturate(185%);
          -webkit-backdrop-filter: blur(28px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 26px 56px -12px rgba(18, 128, 99, 0.28), 0 0 38px -6px rgba(22, 163, 127, 0.45), inset 0 1.5px 1px #ffffff;
        }
        .ola-cf-yellow {
          background: linear-gradient(148deg, rgba(255, 245, 214, 0.97) 0%, rgba(255, 226, 148, 0.94) 100%);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.94);
          box-shadow: 0 26px 56px -12px rgba(180, 125, 10, 0.32), 0 0 40px -6px rgba(255, 199, 73, 0.65), inset 0 1.5px 1px rgba(255, 255, 255, 0.96);
        }
        .ola-cf-indigo {
          background: linear-gradient(148deg, rgba(102, 111, 168, 0.97) 0%, rgba(69, 77, 130, 0.97) 100%);
          backdrop-filter: blur(28px) saturate(185%);
          -webkit-backdrop-filter: blur(28px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.42);
          box-shadow: 0 26px 60px -12px rgba(45, 51, 96, 0.46), 0 0 42px -6px rgba(98, 106, 159, 0.62), inset 0 1.5px 1px rgba(255, 255, 255, 0.4);
        }
        .ola-cf-glass {
          background: linear-gradient(148deg, rgba(255, 255, 255, 0.96) 0%, rgba(234, 237, 251, 0.93) 100%);
          backdrop-filter: blur(28px) saturate(185%);
          -webkit-backdrop-filter: blur(28px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 26px 56px -12px rgba(55, 63, 118, 0.32), 0 0 38px -6px rgba(145, 155, 218, 0.55), inset 0 1.5px 1px #ffffff;
        }
        .ola-cf-b2b {
          background: linear-gradient(148deg, rgba(44, 50, 96, 0.97) 0%, rgba(28, 32, 68, 0.97) 100%);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1.5px solid rgba(255, 199, 73, 0.55);
          box-shadow: 0 26px 60px -12px rgba(22, 26, 56, 0.54), 0 0 44px -6px rgba(255, 199, 73, 0.48), inset 0 1.5px 1px rgba(255, 255, 255, 0.28);
        }
      `}</style>

      {/* ================================================== */}
      {/* PART A: ESPECTRO DE NIVELES CEFR (#levels)         */}
      {/* ================================================== */}
      <section id="levels" className="py-16 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
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

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[3.2rem] blur-3xl opacity-75 -z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(98,106,159,0.5) 0%, rgba(168,176,222,0.4) 50%, rgba(255,199,73,0.5) 100%)',
              }}
            />

            <div className="ola-glass rounded-[2.5rem] p-5 sm:p-8 lg:p-10">
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
                {/* LEFT: ESPECTRO DE DOMINIO */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-white/45 backdrop-blur-xl border border-white/85 rounded-[2rem] p-5 sm:p-7 shadow-inner">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#454d82]">
                      Espectro de Dominio OutLoud
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full">
                      {activeLevelObj.id} • {activeLevelObj.pct}% Dominio
                    </span>
                  </div>

                  <div className="relative w-full h-[250px] sm:h-[310px] flex flex-col pl-9 sm:pl-12 pr-1 pb-9 pt-4">
                    <div className="relative w-full flex-1 border-b-2 border-[#626a9f]/30 flex items-end gap-2 sm:gap-3.5">
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
                              <div className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/40 pointer-events-none" />
                              <span className="text-xs sm:text-sm font-black leading-none relative z-10">
                                {bar.id}
                              </span>
                              <span className="hidden sm:inline text-[8px] font-extrabold tracking-wider opacity-90 mt-1 relative z-10">
                                {bar.title}
                              </span>
                            </div>

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

                {/* RIGHT: SPOTLIGHT DEL NIVEL */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div
                    key={activeLevelObj.id}
                    className="ola-glass-indigo rounded-[2rem] p-6 sm:p-8 text-white h-full flex flex-col justify-between animate-fade-in relative overflow-hidden"
                  >
                    <div>
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

                      <p className="text-sm text-white/90 font-medium leading-relaxed mb-8">
                        {activeLevelObj.desc}
                      </p>
                    </div>

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
      {/* PART B: 5-PLAN 3D GLASS COVERFLOW (#plans)         */}
      {/* ================================================== */}
      <section id="plans" className="py-16 sm:py-24 scroll-mt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
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
              Los 6 niveles CEFR incluyen los mismos beneficios completos. También puedes estudiar <strong className="font-black text-[#1e2246]">100% a tu ritmo</strong> o inscribir a tu <strong className="font-black text-[#1e2246]">equipo B2B</strong>.
            </p>
          </div>

          {/* Barra Selectora Rápida de los 5 Planes (Visibilidad inmediata de Solo $5 y B2B $120) */}
          <div className="flex items-center justify-center mb-3">
            <div className="ola-glass inline-flex flex-wrap items-center justify-center gap-1.5 rounded-3xl sm:rounded-full p-1.5">
              {PAYMENT_PLANS.map((p, idx) => {
                const isActive = idx === activePlanIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePlanIndex(idx)}
                    className={`px-3.5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#1e2246] text-[#ffc749] shadow-md scale-[1.03]'
                        : 'text-[#454d82] hover:text-[#1e2246] hover:bg-white/75'
                    }`}
                  >
                    {p.shortTab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ESCENARIO COVERFLOW 3D (Hover en bordes en escritorio + Swipe táctil en móvil) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseLeave={stopEdgeHover}
            className="relative w-full min-h-[600px] sm:min-h-[620px] py-6 flex items-center justify-center select-none touch-pan-y"
            style={{ perspective: '1350px' }}
          >
            {/* ZONA HOVER IZQUIERDA (ESCRITORIO) */}
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

            {/* ZONA HOVER DERECHA (ESCRITORIO) */}
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
              if (offset > halfPlans) offset -= totalPlans;
              if (offset < -halfPlans) offset += totalPlans;

              const isCenter = offset === 0;
              const isSide = Math.abs(offset) === 1;
              const isFar = Math.abs(offset) >= 2;

              const dragProgress = dragOffset / 280;
              const liveOffset = offset + dragProgress;

              const translatePct = isFar ? Math.sign(offset) * 86 : liveOffset * 58;
              const liveScale = isFar
                ? 0.68
                : Math.max(0.76, 1 - Math.abs(liveOffset) * 0.18);
              const liveRotateY = isFar ? -Math.sign(offset) * 26 : -liveOffset * 18;
              const cardTransform = `translateX(${translatePct}%) scale(${liveScale}) rotateY(${liveRotateY}deg)`;

              const isDarkCard = plan.theme === 'indigo' || plan.theme === 'b2b';
              const isYellow = plan.theme === 'yellow';
              const isSolo = plan.theme === 'solo';

              const surfaceClass =
                plan.theme === 'b2b'
                  ? 'ola-cf-b2b text-white'
                  : plan.theme === 'indigo'
                  ? 'ola-cf-indigo text-white'
                  : isYellow
                  ? 'ola-cf-yellow text-[#1e2246]'
                  : isSolo
                  ? 'ola-cf-solo text-[#1e2246]'
                  : 'ola-cf-glass text-[#1e2246]';

              const badgeClass = isDarkCard
                ? 'bg-[#ffc749] text-[#1e2246]'
                : isSolo
                ? 'bg-[#16a37f] text-white'
                : isYellow
                ? 'bg-[#1e2246] text-[#ffc749]'
                : 'bg-[#454d82] text-white';

              const priceColor = isDarkCard
                ? 'text-[#ffc749]'
                : isSolo
                ? 'text-[#128063]'
                : isYellow
                ? 'text-[#1e2246]'
                : 'text-[#454d82]';

              const mutedColor = isDarkCard ? 'text-white/80' : 'text-[#4c5384]';
              const dividerColor = isDarkCard ? 'border-white/20' : 'border-[#626a9f]/20';
              const checkBg = isDarkCard
                ? 'bg-[#ffc749] text-[#1e2246]'
                : isSolo
                ? 'bg-[#16a37f] text-white'
                : isYellow
                ? 'bg-[#1e2246] text-[#ffc749]'
                : 'bg-[#626a9f] text-white';

              return (
                <div
                  key={plan.id}
                  onClick={() => !isCenter && !isFar && setActivePlanIndex(index)}
                  className={`absolute w-[88%] max-w-[355px] sm:max-w-[405px] rounded-[2.25rem] p-6 sm:p-8 flex flex-col justify-between ${
                    isDragging
                      ? 'transition-none'
                      : 'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
                  } ${surfaceClass} ${
                    isCenter
                      ? 'z-30 opacity-100'
                      : isSide
                      ? 'z-20 opacity-55 hover:opacity-80 cursor-pointer'
                      : 'z-10 opacity-0 pointer-events-none'
                  }`}
                  style={{
                    transform: cardTransform,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, opacity',
                    filter: isCenter ? 'none' : 'blur(1px) saturate(0.85)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${badgeClass}`}>
                        {plan.badge}
                      </span>
                      <span className={`text-[10.5px] font-black uppercase tracking-widest ${mutedColor}`}>
                        {plan.tier}
                      </span>
                    </div>

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
                    <span>
                      {isCenter
                        ? plan.id === 'b2b'
                          ? 'Solicitar Plan B2B'
                          : `Elegir ${plan.name}`
                        : 'Ver Plan'}
                    </span>
                    <ArrowRightSvg className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Indicador minimalista (sin flechas redundantes) */}
          <div className="flex flex-col items-center justify-center gap-2 mt-3">
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
              Desliza para comparar los 5 planes
            </span>
          </div>

          {/* PART C: EXPLICADOR VISUAL + TEXTUAL DE CRÉDITOS, COHORTES Y PAGOS */}
          <CreditsAndCohortsExplainer onScrollTo={onScrollTo} />
        </div>
      </section>
    </div>
  );
}