import React, { useState } from 'react';

const ECOSYSTEM_MINI_CARDS = [
  {
    title: 'Lecciones Dinámicas',
    desc: 'Pantallas interactivas paso a paso sin teoría pesada.',
    accent: 'yellow',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Audios & Voz',
    desc: 'Escucha, graba y compara tu pronunciación al instante.',
    accent: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: 'Workbooks Digitales',
    desc: 'Ejercicios prácticos con corrección visual inmediata.',
    accent: 'lavender',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Club de Conversación',
    desc: 'Espacios dinámicos para hablar con otros alumnos.',
    accent: 'yellow',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Foros & Debates',
    desc: 'Resuelve dudas bilingües y debate en inglés por nivel.',
    accent: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    title: 'Tutorías & Refuerzo',
    desc: 'Clases complementarias y sesiones 1-on-1 a tu medida.',
    accent: 'lavender',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const CYCLE_STEPS = [
  {
    num: '01',
    shortLabel: 'Live Lab',
    title: 'PASO 1: Live Lab',
    tag: 'Adquisición Natural',
    desc: 'Entra a tu cuenta y adquiere nuevo vocabulario de forma interactiva.',
    detail: 'Explora situaciones reales con audio nativo y práctica de voz para interiorizar expresiones sin traducir.',
    icon: 'https://i.postimg.cc/hvd9RVBP/14(3).png',
    highlight: 'Audio nativo + comparación vocal',
  },
  {
    num: '02',
    shortLabel: 'Práctica',
    title: 'PASO 2: Práctica interactiva',
    tag: 'Consolidación 24/7',
    desc: 'Completa los ejercicios para afianzar lo aprendido.',
    detail: 'Refuerza tu comprensión con nuestro workbook digital interactivo y prepara tu mente antes de hablar en vivo.',
    icon: 'https://i.postimg.cc/Cx1bFyYc/Diseno-sin-titulo-(15).png',
    highlight: 'Feedback visual inmediato',
  },
  {
    num: '03',
    shortLabel: 'Agenda',
    title: 'PASO 3: Agenda tus clases',
    tag: 'Horario Flexible',
    desc: 'Reserva sesiones 100% en vivo con un profesor.',
    detail: 'Elige el día y la hora que mejor se adapten a tu rutina desde tu calendario interactivo en el Student Hub.',
    icon: 'https://i.postimg.cc/L5KJf7c8/16(3).png',
    highlight: 'Horarios de lunes a sábado',
  },
  {
    num: '04',
    shortLabel: 'En Vivo',
    title: 'PASO 4: Clase 100% en vivo',
    tag: 'Evaluación Real',
    desc: 'Un instructor dictará clases interactivas, completamente prácticas, te aconsejará y te evaluará.',
    detail: 'Recibe corrección inmediata en pronunciación y fluidez mientras validas tu dominio para avanzar a la siguiente unidad.',
    icon: 'https://i.postimg.cc/RVTW6gX3/17(2).png',
    highlight: 'Acompañamiento real 1-a-1 o grupal',
  },
  {
    num: '05',
    shortLabel: 'Comunidad',
    title: 'PASO 5: Aplica lo aprendido',
    tag: 'Inmersión Social',
    desc: 'Participa en actividades comunitarias con otros alumnos: foros, debates, club de conversación, salas de chat y más.',
    detail: 'Convierte el inglés en un hábito diario interactuando con compañeros de tu nivel y desbloqueando logros en tu perfil.',
    icon: 'https://i.postimg.cc/MKtGKvpz/18(1).png',
    highlight: 'Foros, debates y salas en vivo',
  },
];

const ArrowDownIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
  </svg>
);

export default function LandingMethodSection({ onScrollTo }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = CYCLE_STEPS[activeStepIndex];
  const progressPercent = (activeStepIndex / (CYCLE_STEPS.length - 1)) * 100;

  return (
    <section id="method" className="relative py-16 sm:py-24 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* ================================================== */}
        {/* PART A: HEADER & 3 BACKLIT FROSTED PILLAR CARDS    */}
        {/* ================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="ola-glass-yellow inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#454d82]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#1e2246]">
              Información Acerca de los Cursos
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e2246] tracking-tight leading-tight">
            Un sistema diseñado para{' '}
            <span className="text-[#4c548a]">hablar desde el día uno</span>
          </h2>
          <p className="text-sm sm:text-base text-[#4c5384] font-medium mt-4 leading-relaxed">
            Combinamos inmersión práctica, plataforma 24/7 y acompañamiento real con profesores en vivo.
          </p>
        </div>

        {/* 3 BACKLIT GLASS PILLARS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch">
          {/* CARD 1: INMERSIÓN TOTAL (Warm Sunlit Frosted Glass) */}
          <div className="group relative flex flex-col">
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-65 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top left, rgba(255,199,73,0.75), rgba(255,228,150,0.2) 70%)' }}
            />
            <div className="ola-glass-yellow flex-1 rounded-[2.25rem] p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] flex items-center justify-center p-3 shrink-0 group-hover:rotate-[-5deg] transition-transform duration-300">
                    <img
                      src="https://i.postimg.cc/wMf4YWfP/4(9).png"
                      alt="Inmersión Total"
                      className="w-full h-full object-contain brightness-0"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1e2246] bg-white/70 backdrop-blur-md border border-white px-3.5 py-1.5 rounded-full shadow-sm">
                    01 • Inmersión
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#1e2246] uppercase tracking-tight leading-none mb-4">
                  Inmersión Total
                </h3>

                <p className="text-sm text-[#282d57] font-medium leading-relaxed">
                  Olvídate de la teoría rígida. Hemos diseñado un aprendizaje libre de distracciones, interactivo y directo, basado en{' '}
                  <strong className="font-black text-[#1e2246] underline decoration-[#ffc749] decoration-4 underline-offset-2">
                    situaciones de la vida real
                  </strong>{' '}
                  que te servirá de guía para adquirir un nuevo idioma de forma natural y fluida,{' '}
                  <strong className="font-black text-[#1e2246]">sin traducir</strong> y sin pasar horas estudiando listas de vocabulario o gramática.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onScrollTo?.('#cycle')}
                className="ola-btn-outline relative z-10 mt-8 w-full py-3.5 px-5 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 group/btn"
              >
                <span>Ver el Ciclo de Estudio</span>
                <ArrowDownIcon className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* CARD 2: ACCESO 24/7 (Deep Backlit Indigo Glass) */}
          <div className="group relative flex flex-col">
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, rgba(98,106,159,0.85), rgba(255,199,73,0.4) 75%)' }}
            />
            <div className="ola-glass-indigo flex-1 rounded-[2.25rem] p-7 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] flex items-center justify-center p-3 shrink-0 group-hover:rotate-[5deg] transition-transform duration-300">
                    <img
                      src="https://i.postimg.cc/GhtSxC9d/5(8).png"
                      alt="Acceso 24/7"
                      className="w-full h-full object-contain brightness-0"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ffc749] bg-white/10 backdrop-blur-md border border-white/25 px-3.5 py-1.5 rounded-full">
                    02 • A tu ritmo
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none mb-4">
                  Acceso 24/7
                </h3>

                <p className="text-sm text-white/90 font-medium leading-relaxed mb-4">
                  Accede cuando y donde quieras a lecciones dinámicas, audios, chats, foros,{' '}
                  <strong className="font-black text-[#ffc749]">club de conversación</strong>, clases complementarias, libros de actividades y demás funciones de la app o el sitio web.
                </p>
                <p className="text-sm text-white/80 font-medium leading-relaxed">
                  En ellas encontrarás contenido dinámico e interactivo que te preparará para tu clase en vivo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onScrollTo?.('#levels')}
                className="ola-btn-yellow relative z-10 mt-8 w-full py-3.5 px-5 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 group/btn"
              >
                <span>Niveles y Módulos</span>
                <ArrowDownIcon className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* CARD 3: CLASES 100% EN VIVO (Clear Frosted Glass) */}
          <div className="group relative flex flex-col">
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at bottom right, rgba(121,131,196,0.68), rgba(255,199,73,0.35) 75%)' }}
            />
            <div className="ola-glass flex-1 rounded-[2.25rem] p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1.5">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#626a9f] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] flex items-center justify-center p-3 shrink-0 group-hover:rotate-[-5deg] transition-transform duration-300">
                    <img
                      src="https://i.postimg.cc/Bv7gmh6D/Diseno-sin-titulo-(29).png"
                      alt="Clases 100% En Vivo"
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#454d82] bg-white/75 backdrop-blur-md border border-white px-3.5 py-1.5 rounded-full shadow-sm">
                    03 • Interacción
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#1e2246] uppercase tracking-tight leading-none mb-4">
                  Clases 100% En Vivo
                </h3>

                <p className="text-sm text-[#3e446b] font-medium leading-relaxed">
                  Agenda sesiones individuales o grupales con un{' '}
                  <strong className="font-black text-[#1e2246]">profesor en vivo</strong> según tu disponibilidad. Recibe tutoría{' '}
                  <strong className="font-black text-[#1e2246]">personalizada</strong>, feedback instantáneo y corrección en pronunciación, vocabulario y más.{' '}
                  <strong className="font-black text-[#454d82]">Participa</strong> en escenificaciones, debates, dinámicas y actividades que{' '}
                  <strong className="font-black text-[#1e2246]">te darán confianza</strong> al hablar y permitirán evaluar tu propio progreso.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onScrollTo?.('#enroll')}
                className="ola-btn-outline relative z-10 mt-8 w-full py-3.5 px-5 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 group/btn"
              >
                <span>Inscribirse</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* PART B: SMALLER BACKLIT GLASS ECOSYSTEM CARDS      */}
        {/* ================================================== */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#454d82]">
              Incluido en tu ecosistema OutLoud
            </span>
            <span className="text-[11px] font-bold text-[#50567d] hidden sm:inline">
              Web &amp; Mobile • Disponible 24/7
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {ECOSYSTEM_MINI_CARDS.map((card) => {
              const badgeClass =
                card.accent === 'yellow'
                  ? 'bg-[#ffc749] text-[#1e2246] border-[#1e2246]/25'
                  : card.accent === 'indigo'
                  ? 'bg-[#626a9f] text-white border-white/30'
                  : 'bg-white/85 text-[#454d82] border-[#626a9f]/25';

              return (
                <div
                  key={card.title}
                  className="ola-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 group hover:-translate-y-1.5 cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform ${badgeClass}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#1e2246] leading-snug mb-1">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-[#50567d] font-medium leading-snug">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================== */}
        {/* PART C: INTERACTIVE 5-STEP METHOD ENGINE (#cycle)  */}
        {/* ================================================== */}
        <div id="cycle" className="mt-20 sm:mt-28 scroll-mt-24 relative">
          {/* Strong Dual-Tone Backlight Halo */}
          <div
            className="absolute -inset-4 rounded-[3.2rem] blur-3xl opacity-75 -z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(120deg, rgba(255,199,73,0.48) 0%, rgba(121,131,196,0.52) 50%, rgba(98,106,159,0.55) 100%)',
            }}
          />

          <div className="ola-glass rounded-[2.5rem] overflow-hidden relative">
            {/* Header Bar */}
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-white/70 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#454d82] text-[#ffc749] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Mecánica de Aprendizaje</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1e2246] tracking-tight leading-tight">
                  El Ciclo de Estudio OutLoud
                </h3>
                <p className="text-xs sm:text-sm text-[#4c5384] font-medium mt-1.5">
                  Toca cualquier estación o pulsa <strong className="font-black text-[#1e2246]">Continuar</strong> para ver cómo dominas cada unidad.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start md:self-auto bg-white/70 backdrop-blur-md border border-white rounded-full px-4 py-2 shrink-0 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#50567d]">Paso</span>
                <span className="text-sm font-black text-[#454d82]">{activeStepIndex + 1}</span>
                <span className="text-xs font-bold text-[#50567d]">/ {CYCLE_STEPS.length}</span>
              </div>
            </div>

            {/* Interactive 5-Step Connected Rail */}
            <div className="px-4 sm:px-10 pt-6 pb-2">
              <div className="relative">
                {/* Connecting Progress Track */}
                <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#626a9f] via-[#7c85bc] to-[#ffc749] transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Step Selector Buttons */}
                <div className="grid grid-cols-5 gap-2 sm:gap-4 relative z-10">
                  {CYCLE_STEPS.map((step, idx) => {
                    const isActive = idx === activeStepIndex;
                    const isCompleted = idx < activeStepIndex;

                    return (
                      <button
                        key={step.num}
                        type="button"
                        onClick={() => setActiveStepIndex(idx)}
                        className="flex flex-col items-center group cursor-pointer focus:outline-none"
                      >
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-2 flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-[#ffc749] border-[#1e2246] text-[#1e2246] scale-110 shadow-[0_4px_0_#1e2246,0_10px_22px_rgba(255,199,73,0.6)]'
                              : isCompleted
                              ? 'bg-[#454d82] border-[#1e2246] text-white shadow-md'
                              : 'bg-white/75 border-white text-[#50567d] shadow-sm group-hover:border-[#626a9f] group-hover:text-[#1e2246] group-hover:-translate-y-0.5'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            step.num
                          )}
                        </div>
                        <span
                          className={`mt-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-center leading-tight transition-colors ${
                            isActive ? 'text-[#1e2246]' : 'text-[#50567d] group-hover:text-[#454d82]'
                          }`}
                        >
                          {step.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Spotlight Stage */}
            <div className="p-5 sm:p-10">
              <div
                key={currentStep.num}
                className="bg-white/55 backdrop-blur-xl border border-white/90 rounded-[2rem] p-6 sm:p-9 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center shadow-inner animate-fade-in"
              >
                {/* Visual Icon Stage with Indigo Glass + Backlight */}
                <div className="md:col-span-4 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div
                      className="absolute -inset-4 rounded-[2.5rem] blur-2xl opacity-65 pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(98,106,159,0.7), rgba(255,199,73,0.45))' }}
                    />
                    <div className="ola-glass-indigo relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] flex items-center justify-center p-7">
                      <img
                        src={currentStep.icon}
                        alt={currentStep.title}
                        className="w-full h-full object-contain brightness-0 invert drop-shadow-md"
                      />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] rounded-full px-3 py-1 text-xs font-black shadow-[0_3px_0_#1e2246]">
                      #{currentStep.num}
                    </div>
                  </div>
                </div>

                {/* Copy & Controls */}
                <div className="md:col-span-8 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-white bg-[#454d82] px-3 py-1 rounded-full">
                      {currentStep.tag}
                    </span>
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#1e2246] bg-[#fff3d1] border border-[#ffc749] px-3 py-1 rounded-full">
                      {currentStep.highlight}
                    </span>
                  </div>

                  <h4 className="text-2xl sm:text-3xl font-black text-[#1e2246] uppercase tracking-tight mb-3">
                    {currentStep.title}
                  </h4>

                  <p className="text-base sm:text-lg font-bold text-[#1e2246]/90 leading-relaxed mb-3">
                    {currentStep.desc}
                  </p>

                  <p className="text-xs sm:text-sm font-medium text-[#50567d] leading-relaxed mb-7 max-w-xl">
                    {currentStep.detail}
                  </p>

                  {/* Interactive Navigation Bar */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
                    <button
                      type="button"
                      disabled={activeStepIndex === 0}
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      className="ola-btn-outline px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>

                    {activeStepIndex < CYCLE_STEPS.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveStepIndex((prev) => prev + 1)}
                        className="ola-btn-yellow px-7 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center gap-2"
                      >
                        <span>Continuar</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onScrollTo?.('#enroll')}
                        className="ola-btn-yellow px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center gap-2"
                      >
                        <span>Inscribirme Ahora</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    )}

                    {activeStepIndex === CYCLE_STEPS.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveStepIndex(0)}
                        className="ola-reactive-text text-xs font-black uppercase tracking-widest text-[#454d82] cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Reiniciar Ciclo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Continuous Loop Footer Note */}
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-[11px] font-bold text-[#4c5384]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f] shadow-[0_0_8px_#16a37f] shrink-0" />
                  Al aprobar el Paso 4, tu profesor desbloquea automáticamente la siguiente unidad.
                </span>
                <span className="text-[#1e2246] uppercase tracking-wider font-black flex items-center gap-1.5">
                  <span>Ciclo continuo A1</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-[#454d82]" />
                  <span>C2</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}