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
    title: 'Libros de Actividades',
    desc: 'Workbooks digitales con ejercicios prácticos y feedback.',
    accent: 'lavender',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Club de Conversación',
    desc: 'Espacios relajados para soltar la lengua con otros alumnos.',
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
    title: 'Clases Complementarias',
    desc: 'Refuerzo adicional y tutorías 1-on-1 cuando lo necesites.',
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
  },
  {
    num: '02',
    shortLabel: 'Práctica',
    title: 'PASO 2: Práctica interactiva',
    tag: 'Consolidación 24/7',
    desc: 'Completa los ejercicios para afianzar lo aprendido.',
    detail: 'Refuerza tu comprensión con nuestro workbook digital interactivo y prepara tu mente antes de hablar en vivo.',
    icon: 'https://i.postimg.cc/Cx1bFyYc/Diseno-sin-titulo-(15).png',
  },
  {
    num: '03',
    shortLabel: 'Agenda',
    title: 'PASO 3: Agenda tus clases',
    tag: 'Horario Flexible',
    desc: 'Reserva sesiones 100% en vivo con un profesor.',
    detail: 'Elige el día y la hora que mejor se adapten a tu rutina desde tu calendario interactivo en el Student Hub.',
    icon: 'https://i.postimg.cc/L5KJf7c8/16(3).png',
  },
  {
    num: '04',
    shortLabel: 'En Vivo',
    title: 'PASO 4: Clase 100% en vivo',
    tag: 'Evaluación Real',
    desc: 'Un instructor dictará clases interactivas, completamente prácticas, te aconsejará y te evaluará.',
    detail: 'Recibe corrección inmediata en pronunciación y fluidez mientras validas tu dominio para avanzar a la siguiente unidad.',
    icon: 'https://i.postimg.cc/RVTW6gX3/17(2).png',
  },
  {
    num: '05',
    shortLabel: 'Comunidad',
    title: 'PASO 5: Aplica lo aprendido',
    tag: 'Inmersión Social',
    desc: 'Participa en actividades comunitarias con otros alumnos: foros, debates, club de conversación, salas de chat y más.',
    detail: 'Convierte el inglés en un hábito diario interactuando con compañeros de tu nivel y desbloqueando logros en tu perfil.',
    icon: 'https://i.postimg.cc/MKtGKvpz/18(1).png',
  },
];

export default function LandingMethodSection({ onScrollTo }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = CYCLE_STEPS[activeStepIndex];
  const progressPercent = (activeStepIndex / (CYCLE_STEPS.length - 1)) * 100;

  return (
    <section id="method" className="relative py-16 sm:py-24 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* ================================================== */}
        {/* PART A: SECTION HEADER & 3 HERO PILLAR CARDS       */}
        {/* ================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#fff3d1] border-2 border-[#ffc749] rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#626a9f]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#23274d]">
              Información Acerca de los Cursos
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23274d] tracking-tight leading-tight">
            Un sistema diseñado para{' '}
            <span className="text-[#626a9f]">hablar desde el día uno</span>
          </h2>
          <p className="text-sm sm:text-base text-[#60668a] font-medium mt-4 leading-relaxed">
            Combinamos inmersión práctica, plataforma 24/7 y acompañamiento real con profesores en vivo.
          </p>
        </div>

        {/* 3 HERO CARDS (Cata/Kinta Tactile Reactivity in OutLoud Palette) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* HERO CARD 1: INMERSIÓN TOTAL (Soft Yellow Theme) */}
          <div className="group bg-[#fff3d1] border-2 border-[#23274d] rounded-[2.25rem] p-7 sm:p-8 shadow-[0_8px_0_#23274d] hover:-translate-y-1.5 hover:shadow-[0_12px_0_#23274d] transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#ffc749]/40 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#ffc749] border-2 border-[#23274d] shadow-[0_4px_0_#23274d] flex items-center justify-center p-3 shrink-0 group-hover:rotate-[-4deg] transition-transform">
                  <img
                    src="https://i.postimg.cc/wMf4YWfP/4(9).png"
                    alt="Inmersión Total"
                    className="w-full h-full object-contain brightness-0"
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#23274d] bg-white/80 border border-[#23274d]/20 px-3 py-1.5 rounded-full">
                  ¿Cómo funciona?
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#23274d] uppercase tracking-tight leading-none mb-4">
                Inmersión Total
              </h3>

              <p className="text-sm text-[#23274d]/85 font-medium leading-relaxed">
                Olvídate de la teoría rígida. Hemos diseñado un aprendizaje libre de distracciones, interactivo y directo, basado en{' '}
                <strong className="font-black text-[#23274d] underline decoration-[#ffc749] decoration-4 underline-offset-2">
                  situaciones de la vida real
                </strong>{' '}
                que te servirá de guía para adquirir un nuevo idioma de forma natural y fluida,{' '}
                <strong className="font-black text-[#23274d]">sin traducir</strong> y sin pasar horas estudiando listas de vocabulario o gramática.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onScrollTo?.('#cycle')}
              className="relative z-10 mt-8 w-full py-3.5 px-5 rounded-full bg-white hover:bg-[#ffc749] text-[#23274d] border-2 border-[#23274d] shadow-[0_4px_0_#23274d] active:translate-y-0.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ver el Ciclo de Estudio</span>
              <span>↓</span>
            </button>
          </div>

          {/* HERO CARD 2: ACCESO 24/7 (Featured Brand Indigo Theme) */}
          <div className="group bg-[#626a9f] border-2 border-[#23274d] rounded-[2.25rem] p-7 sm:p-8 text-white shadow-[0_10px_0_#23274d] hover:-translate-y-1.5 hover:shadow-[0_14px_0_#23274d] transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#ffc749] border-2 border-[#23274d] shadow-[0_4px_0_#23274d] flex items-center justify-center p-3 shrink-0 group-hover:rotate-[4deg] transition-transform">
                  <img
                    src="https://i.postimg.cc/GhtSxC9d/5(8).png"
                    alt="Acceso 24/7"
                    className="w-full h-full object-contain brightness-0"
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ffc749] bg-[#23274d]/40 border border-white/15 px-3 py-1.5 rounded-full">
                  Estudia a tu ritmo
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
              className="ola-btn-yellow relative z-10 mt-8 w-full py-3.5 px-5 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Niveles y Módulos</span>
              <span>↓</span>
            </button>
          </div>

          {/* HERO CARD 3: CLASES 100% EN VIVO (Crisp White Theme) */}
          <div className="group bg-white border-2 border-[#23274d] rounded-[2.25rem] p-7 sm:p-8 shadow-[0_8px_0_#23274d] hover:-translate-y-1.5 hover:shadow-[0_12px_0_#23274d] transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#e8eaf7] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#e8eaf7] border-2 border-[#23274d] shadow-[0_4px_0_#23274d] flex items-center justify-center p-3 shrink-0 group-hover:rotate-[-4deg] transition-transform">
                  <img
                    src="https://i.postimg.cc/Bv7gmh6D/Diseno-sin-titulo-(29).png"
                    alt="Clases 100% En Vivo"
                    className="w-full h-full object-contain brightness-0"
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#626a9f] bg-[#e8eaf7] border border-[#626a9f]/25 px-3 py-1.5 rounded-full">
                  Interacción real
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#23274d] uppercase tracking-tight leading-none mb-4">
                Clases 100% En Vivo
              </h3>

              <p className="text-sm text-[#60668a] font-medium leading-relaxed">
                Agenda sesiones individuales o grupales con un{' '}
                <strong className="font-black text-[#23274d]">profesor en vivo</strong> según tu disponibilidad. Recibe tutoría{' '}
                <strong className="font-black text-[#23274d]">personalizada</strong>, feedback instantáneo y corrección en pronunciación, vocabulario y más.{' '}
                <strong className="font-black text-[#626a9f]">Participa</strong> en escenificaciones, debates, dinámicas y actividades que{' '}
                <strong className="font-black text-[#23274d]">te darán confianza</strong> al hablar y permitirán evaluar tu propio progreso.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onScrollTo?.('#enroll')}
              className="relative z-10 mt-8 w-full py-3.5 px-5 rounded-full bg-[#e8eaf7] hover:bg-[#ffc749] text-[#23274d] border-2 border-[#23274d] shadow-[0_4px_0_#23274d] active:translate-y-0.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Inscribirse</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* PART B: SMALLER ECOSYSTEM CARDS (Cata-Style Grid)  */}
        {/* ================================================== */}
        <div className="mt-10 sm:mt-14">
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#626a9f]">
              Incluido en tu plataforma
            </span>
            <span className="text-[11px] font-bold text-[#60668a] hidden sm:inline">
              Web &amp; Mobile • Disponible 24/7
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {ECOSYSTEM_MINI_CARDS.map((card) => {
              const badgeClass =
                card.accent === 'yellow'
                  ? 'bg-[#ffc749] text-[#23274d]'
                  : card.accent === 'indigo'
                  ? 'bg-[#626a9f] text-white'
                  : 'bg-[#e8eaf7] text-[#626a9f]';

              return (
                <div
                  key={card.title}
                  className="ola-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl border border-[#23274d]/15 flex items-center justify-center shrink-0 ${badgeClass}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#23274d] leading-snug mb-1">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-[#60668a] font-medium leading-snug">
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
        <div id="cycle" className="mt-20 sm:mt-28 scroll-mt-24">
          <div className="bg-white border-2 border-[#23274d] rounded-[2.5rem] shadow-[0_12px_0_#23274d] overflow-hidden relative">
            {/* Subtle Corner Brand Patterns */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#fff3d1] opacity-80 pointer-events-none" />
            <div className="absolute -bottom-20 -left-16 w-52 h-52 rounded-full bg-[#e8eaf7] opacity-80 pointer-events-none" />

            {/* Header Bar */}
            <div className="relative z-10 px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b-2 border-[#e8eaf7] flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#e8eaf7] text-[#626a9f] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                  <span>↻</span>
                  <span>Mecánica de Aprendizaje</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#23274d] tracking-tight leading-tight">
                  El Ciclo de Estudio OutLoud
                </h3>
                <p className="text-xs sm:text-sm text-[#60668a] font-medium mt-1.5">
                  Toca cada paso o usa <strong className="text-[#23274d]">Continuar</strong> para recorrer cómo dominas cada unidad.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto bg-[#f6f7fc] border-2 border-[#dfe2f2] rounded-full px-4 py-2 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#60668a]">Paso</span>
                <span className="text-sm font-black text-[#626a9f]">{activeStepIndex + 1}</span>
                <span className="text-xs font-bold text-[#60668a]">/ {CYCLE_STEPS.length}</span>
              </div>
            </div>

            {/* Interactive 5-Step Connected Rail */}
            <div className="relative z-10 px-4 sm:px-10 pt-6 pb-2">
              <div className="relative">
                {/* Desktop Connecting Track */}
                <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-1.5 bg-[#e8eaf7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffc749] transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Step Buttons */}
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
                              ? 'bg-[#ffc749] border-[#23274d] text-[#23274d] scale-110 shadow-[0_4px_0_#23274d]'
                              : isCompleted
                              ? 'bg-[#626a9f] border-[#23274d] text-white'
                              : 'bg-[#f6f7fc] border-[#dfe2f2] text-[#60668a] group-hover:border-[#626a9f] group-hover:text-[#23274d]'
                          }`}
                        >
                          {isCompleted ? '✓' : step.num}
                        </div>
                        <span
                          className={`mt-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-center leading-tight transition-colors ${
                            isActive ? 'text-[#23274d]' : 'text-[#60668a] group-hover:text-[#626a9f]'
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
            <div className="relative z-10 p-6 sm:p-10">
              <div
                key={currentStep.num}
                className="bg-[#f6f7fc] border-2 border-[#dfe2f2] rounded-[2rem] p-6 sm:p-9 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center animate-fade-in"
              >
                {/* Visual Icon Stage */}
                <div className="md:col-span-4 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] bg-[#626a9f] border-2 border-[#23274d] shadow-[0_8px_0_#23274d] flex items-center justify-center p-7">
                      <img
                        src={currentStep.icon}
                        alt={currentStep.title}
                        className="w-full h-full object-contain brightness-0 invert drop-shadow-md"
                      />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-[#ffc749] text-[#23274d] border-2 border-[#23274d] rounded-full px-3 py-1 text-xs font-black shadow-[0_3px_0_#23274d]">
                      #{currentStep.num}
                    </div>
                  </div>
                </div>

                {/* Copy & Controls */}
                <div className="md:col-span-8 flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#626a9f] bg-[#e8eaf7] border border-[#626a9f]/25 px-3 py-1 rounded-full mb-3">
                    {currentStep.tag}
                  </span>

                  <h4 className="text-2xl sm:text-3xl font-black text-[#23274d] uppercase tracking-tight mb-3">
                    {currentStep.title}
                  </h4>

                  <p className="text-base sm:text-lg font-bold text-[#23274d]/90 leading-relaxed mb-3">
                    {currentStep.desc}
                  </p>

                  <p className="text-xs sm:text-sm font-medium text-[#60668a] leading-relaxed mb-7 max-w-xl">
                    {currentStep.detail}
                  </p>

                  {/* Interactive Navigation Bar */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
                    <button
                      type="button"
                      disabled={activeStepIndex === 0}
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      className="ola-btn-outline px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>

                    {activeStepIndex < CYCLE_STEPS.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveStepIndex((prev) => prev + 1)}
                        className="ola-btn-yellow px-7 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer"
                      >
                        Continuar →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onScrollTo?.('#enroll')}
                        className="ola-btn-yellow px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer"
                      >
                        Inscribirme Ahora →
                      </button>
                    )}

                    {activeStepIndex === CYCLE_STEPS.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveStepIndex(0)}
                        className="text-xs font-black uppercase tracking-widest text-[#626a9f] hover:text-[#23274d] px-3 py-2 cursor-pointer"
                      >
                        ↻ Reiniciar Ciclo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Continuous Loop Footer Note */}
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-[11px] font-bold text-[#60668a]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16a37f]" />
                  Al aprobar el Paso 4, tu profesor desbloquea automáticamente la siguiente unidad.
                </span>
                <span className="text-[#626a9f] uppercase tracking-wider font-black">
                  Ciclo continuo A1 → C2
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}