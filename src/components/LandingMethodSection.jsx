import React, { useState } from 'react';

const ECOSYSTEM_MINI_CARDS = [
  {
    title: 'Lecciones Dinámicas',
    desc: 'Pantallas interactivas paso a paso, sin teoría pesada.',
    accent: 'yellow',
    glow: 'rgba(255, 199, 73, 0.55)',
    bar: 'from-[#ffc749] to-[#f0b32b]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Audios & Pronunciación',
    desc: 'Escucha, graba y compara tu voz al instante.',
    accent: 'indigo',
    glow: 'rgba(98, 106, 159, 0.45)',
    bar: 'from-[#626a9f] to-[#454d82]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: 'Workbooks Digitales',
    desc: 'Práctica interactiva con corrección visual inmediata.',
    accent: 'mint',
    glow: 'rgba(22, 163, 127, 0.35)',
    bar: 'from-[#16a37f] to-[#626a9f]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Club de Conversación',
    desc: 'Práctica grupal relajada para ganar soltura real.',
    accent: 'yellow',
    glow: 'rgba(255, 199, 73, 0.55)',
    bar: 'from-[#ffc749] to-[#626a9f]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Foros & Debates',
    desc: 'Resuelve dudas bilingües y debate en inglés por nivel.',
    accent: 'indigo',
    glow: 'rgba(98, 106, 159, 0.45)',
    bar: 'from-[#626a9f] to-[#ffc749]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    title: 'Tutorías & Refuerzo',
    desc: 'Clases complementarias y sesiones 1-a-1 a tu medida.',
    accent: 'mint',
    glow: 'rgba(22, 163, 127, 0.35)',
    bar: 'from-[#16a37f] to-[#ffc749]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
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
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
  </svg>
);

export default function LandingMethodSection({ onScrollTo }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = CYCLE_STEPS[activeStepIndex];
  const progressPercent = (activeStepIndex / (CYCLE_STEPS.length - 1)) * 100;

  return (
    <section id="method" className="relative py-16 sm:py-24 scroll-mt-24">
      <style>{`
        /* Specular Diagonal Glass Sheen on Hover */
        .ola-sheen-card {
          position: relative;
          overflow: hidden;
        }
        .ola-sheen-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -130%;
          width: 75%;
          height: 100%;
          background: linear-gradient(
            115deg,
            transparent 0%,
            rgba(255, 255, 255, 0.36) 45%,
            rgba(255, 255, 255, 0.08) 65%,
            transparent 100%
          );
          transform: skewX(-20deg);
          transition: left 0.72s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          z-index: 25;
        }
        .ola-sheen-card:hover::before {
          left: 155%;
        }

        @keyframes olaOrbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes olaSignalFlow {
          0%, 100% { opacity: 0.35; transform: scaleY(0.5); }
          50% { opacity: 1; transform: scaleY(1); }
        }
        .ola-orbit-ring {
          animation: olaOrbitSpin 22s linear infinite;
        }
        .ola-signal-bar {
          transform-origin: center;
          animation: olaSignalFlow 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* ================================================== */}
        {/* PART A: HEADER & 3 KINETIC GLASS HERO CARDS        */}
        {/* ================================================== */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e2246] tracking-tight leading-[1.06]">
            Habla inglés desde el{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#454d82]">primer día</span>
              <span className="absolute -left-1 -right-1 bottom-1 h-3.5 bg-[#ffc749]/90 -z-0 rounded-full -rotate-1" />
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#4c5384] font-semibold mt-4 leading-relaxed">
            Tres pilares diseñados para pensar, practicar y hablar con confianza real.
          </p>
        </div>

        {/* 3 KINETIC VISUAL-STAGE HERO CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch">
          {/* ========================================== */}
          {/* HERO CARD 1: INMERSIÓN TOTAL (Sunlit Glass) */}
          {/* ========================================== */}
          <div
            onClick={() => onScrollTo?.('#cycle')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onScrollTo?.('#cycle')}
            className="group relative flex flex-col cursor-pointer focus:outline-none"
          >
            {/* Dynamic Corner Backlight */}
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-65 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 20% 15%, rgba(255,199,73,0.82), rgba(255,224,145,0.22) 72%)',
              }}
            />

            <div className="ola-glass-yellow ola-sheen-card flex-1 rounded-[2.4rem] p-6 sm:p-7 flex flex-col justify-between relative">
              {/* Oversized Editorial Watermark Number */}
              <span className="pointer-events-none select-none absolute -top-5 right-4 text-[7.5rem] font-black leading-none text-[#1e2246]/[0.06] group-hover:text-[#1e2246]/[0.1] group-hover:-translate-y-1 transition-all duration-500">
                01
              </span>

              {/* BESPOKE ANIMATED VISUAL STAGE: Immersion Wave & Speech */}
              <div className="relative z-10 h-40 sm:h-44 rounded-[1.75rem] bg-white/55 backdrop-blur-xl border border-white/90 shadow-inner mb-6 overflow-hidden flex flex-col items-center justify-center p-4">
                {/* Soft inner radial glow */}
                <div
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 75% 25%, rgba(255,199,73,0.5), transparent 60%)',
                  }}
                />

                {/* Crossed-out "Traducir" chip (recedes on hover) */}
                <div className="relative z-10 self-start ml-1 mb-2.5 px-3 py-1 rounded-full bg-white/75 border border-[#1e2246]/15 text-[10px] font-extrabold text-[#50567d]/70 line-through decoration-[#ee665b] decoration-2 -rotate-2 group-hover:-translate-x-1 group-hover:opacity-60 transition-all duration-300">
                  Traducir palabra por palabra
                </div>

                {/* Live English Speech Bubble (springs forward on hover) */}
                <div className="relative z-10 self-end mr-1 bg-[#1e2246] text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-[0_12px_24px_-8px_rgba(30,34,70,0.45)] flex items-center gap-3 rotate-1 group-hover:rotate-0 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-[3px] h-5 shrink-0">
                    {[10, 18, 12, 20, 9].map((h, i) => (
                      <span
                        key={i}
                        className="ola-signal-bar w-[3px] rounded-full bg-[#ffc749]"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.14}s` }}
                      />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black leading-tight text-white">
                      &ldquo;I&apos;ll take a coffee!&rdquo;
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#ffc749]">
                      Situación real
                    </p>
                  </div>
                </div>
              </div>

              {/* PUNCHY COPY */}
              <div className="relative z-10 mb-7">
                <h3 className="text-2xl sm:text-[1.75rem] font-black text-[#1e2246] uppercase tracking-tight leading-none mb-3">
                  Inmersión Total
                </h3>
                <p className="text-sm text-[#282d57] font-semibold leading-relaxed">
                  Aprende con{' '}
                  <strong className="font-black text-[#1e2246] underline decoration-[#ffc749] decoration-[3px] underline-offset-2">
                    situaciones de la vida real
                  </strong>{' '}
                  de forma natural y fluida,{' '}
                  <strong className="font-black text-[#1e2246]">sin traducir</strong> ni memorizar teoría rígida.
                </p>
              </div>

              {/* SLEEK REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 border-t border-[#1e2246]/10 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#1e2246] group-hover:translate-x-1 transition-transform">
                  Ver Ciclo de Estudio
                </span>
                <span className="w-10 h-10 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center shadow-md group-hover:bg-[#ffc749] group-hover:text-[#1e2246] group-hover:scale-110 border-2 border-[#1e2246] transition-all duration-200 shrink-0">
                  <ArrowDownIcon className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* HERO CARD 2: ACCESO 24/7 (Center Indigo)   */}
          {/* ========================================== */}
          <div
            onClick={() => onScrollTo?.('#levels')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onScrollTo?.('#levels')}
            className="group relative flex flex-col lg:-translate-y-3 cursor-pointer focus:outline-none"
          >
            {/* Rich Indigo + Gold Backlight */}
            <div
              className="absolute -inset-3.5 rounded-[2.9rem] blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, rgba(98,106,159,0.9), rgba(255,199,73,0.48) 76%)',
              }}
            />

            <div className="ola-glass-indigo ola-sheen-card flex-1 rounded-[2.4rem] p-6 sm:p-7 text-white flex flex-col justify-between relative">
              {/* Oversized Editorial Watermark Number */}
              <span className="pointer-events-none select-none absolute -top-5 right-4 text-[7.5rem] font-black leading-none text-white/[0.07] group-hover:text-[#ffc749]/[0.14] group-hover:-translate-y-1 transition-all duration-500">
                02
              </span>

              {/* BESPOKE ANIMATED VISUAL STAGE: 24/7 Orbital Ecosystem */}
              <div className="relative z-10 h-40 sm:h-44 rounded-[1.75rem] bg-[#1e2246]/55 backdrop-blur-xl border border-white/20 shadow-inner mb-6 overflow-hidden flex items-center justify-center">
                {/* Rotating dashed orbital ring */}
                <div className="ola-orbit-ring w-36 h-36 rounded-full border border-dashed border-white/25 absolute pointer-events-none" />
                <div className="w-24 h-24 rounded-full border border-[#ffc749]/35 absolute pointer-events-none" />

                {/* Centerpiece Glowing 24/7 Core */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_0_26px_rgba(255,199,73,0.6)] flex flex-col items-center justify-center group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300">
                  <span className="text-lg font-black text-[#1e2246] leading-none tracking-tight">24/7</span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-[#454d82] mt-0.5">Online</span>
                </div>

                {/* Orbiting Floating Chips */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[9px] font-black uppercase tracking-wider text-white group-hover:-translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                  Audios
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[9px] font-black uppercase tracking-wider text-[#ffc749] group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                  Club
                </div>
                <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[9px] font-black uppercase tracking-wider text-white group-hover:-translate-x-1 group-hover:translate-y-0.5 transition-transform duration-300">
                  Workbooks
                </div>
                <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[9px] font-black uppercase tracking-wider text-white group-hover:translate-x-1 group-hover:translate-y-0.5 transition-transform duration-300">
                  Foros
                </div>
              </div>

              {/* PUNCHY COPY */}
              <div className="relative z-10 mb-7">
                <h3 className="text-2xl sm:text-[1.75rem] font-black text-white uppercase tracking-tight leading-none mb-3">
                  Acceso 24/7
                </h3>
                <p className="text-sm text-white/90 font-medium leading-relaxed">
                  Lecciones dinámicas, audios, chats, workbooks y{' '}
                  <strong className="font-black text-[#ffc749]">club de conversación</strong> siempre listos para preparar tu clase en vivo.
                </p>
              </div>

              {/* SLEEK REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 border-t border-white/15 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#ffc749] group-hover:translate-x-1 transition-transform">
                  Explorar Niveles
                </span>
                <span className="w-10 h-10 rounded-full bg-[#ffc749] text-[#1e2246] flex items-center justify-center shadow-[0_0_20px_rgba(255,199,73,0.5)] group-hover:bg-white group-hover:scale-110 border-2 border-[#1e2246] transition-all duration-200 shrink-0">
                  <ArrowDownIcon className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* HERO CARD 3: CLASES EN VIVO (Clear Glass)  */}
          {/* ========================================== */}
          <div
            onClick={() => onScrollTo?.('#enroll')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onScrollTo?.('#enroll')}
            className="group relative flex flex-col cursor-pointer focus:outline-none"
          >
            {/* Dynamic Backlight */}
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 80% 80%, rgba(98,106,159,0.68), rgba(22,163,127,0.35) 55%, rgba(255,199,73,0.3) 85%)',
              }}
            />

            <div className="ola-glass ola-sheen-card flex-1 rounded-[2.4rem] p-6 sm:p-7 flex flex-col justify-between relative group-hover:-translate-y-1.5">
              {/* Oversized Editorial Watermark Number */}
              <span className="pointer-events-none select-none absolute -top-5 right-4 text-[7.5rem] font-black leading-none text-[#454d82]/[0.07] group-hover:text-[#454d82]/[0.13] group-hover:-translate-y-1 transition-all duration-500">
                03
              </span>

              {/* BESPOKE ANIMATED VISUAL STAGE: Live Session Connection */}
              <div className="relative z-10 h-40 sm:h-44 rounded-[1.75rem] bg-white/60 backdrop-blur-xl border border-white/95 shadow-inner mb-6 overflow-hidden flex flex-col items-center justify-center p-4 gap-3">
                {/* Live Indicator Header */}
                <div className="inline-flex items-center gap-1.5 bg-[#16a37f]/15 border border-[#16a37f]/35 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#128063]">
                    En Vivo
                  </span>
                </div>

                {/* Teacher <-> Audio Signal <-> Student */}
                <div className="flex items-center justify-center gap-3 w-full">
                  {/* Instructor Tile */}
                  <div className="w-12 h-12 rounded-2xl bg-[#454d82] border-2 border-[#1e2246] shadow-md flex items-center justify-center text-[#ffc749] group-hover:-translate-x-1 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>

                  {/* Animated Signal Bridge */}
                  <div className="flex items-center gap-1 h-7">
                    {[8, 18, 24, 14, 22, 16, 8].map((h, i) => (
                      <span
                        key={i}
                        className="ola-signal-bar w-1 rounded-full"
                        style={{
                          height: `${h}px`,
                          backgroundColor: i % 2 === 0 ? '#626a9f' : '#ffc749',
                          animationDelay: `${i * 0.11}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Student Tile */}
                  <div className="w-12 h-12 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-md flex items-center justify-center text-[#1e2246] group-hover:translate-x-1 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold text-[#454d82] tracking-wide">
                  Feedback inmediato en pronunciación
                </span>
              </div>

              {/* PUNCHY COPY */}
              <div className="relative z-10 mb-7">
                <h3 className="text-2xl sm:text-[1.75rem] font-black text-[#1e2246] uppercase tracking-tight leading-none mb-3">
                  Clases 100% En Vivo
                </h3>
                <p className="text-sm text-[#3e446b] font-semibold leading-relaxed">
                  Sesiones individuales o grupales con{' '}
                  <strong className="font-black text-[#1e2246]">profesores reales</strong>. Recibe corrección al instante y gana confianza real al hablar.
                </p>
              </div>

              {/* SLEEK REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 border-t border-[#454d82]/15 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#454d82] group-hover:text-[#1e2246] group-hover:translate-x-1 transition-all">
                  Inscribirme Ahora
                </span>
                <span className="w-10 h-10 rounded-full bg-[#454d82] text-white flex items-center justify-center shadow-md group-hover:bg-[#ffc749] group-hover:text-[#1e2246] group-hover:scale-110 border-2 border-[#1e2246] transition-all duration-200 shrink-0">
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* PART B: TRICKLE-DOWN KINETIC ECOSYSTEM BENTO CARDS */}
        {/* ================================================== */}
        <div className="mt-14 sm:mt-18">
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#454d82]">
              Incluido en tu ecosistema OutLoud
            </span>
            <span className="text-[11px] font-bold text-[#50567d] hidden sm:inline">
              Web &amp; Mobile • Disponible 24/7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {ECOSYSTEM_MINI_CARDS.map((card) => {
              const iconStyle =
                card.accent === 'yellow'
                  ? 'bg-[#ffc749] text-[#1e2246] border-[#1e2246]'
                  : card.accent === 'indigo'
                  ? 'bg-[#454d82] text-[#ffc749] border-[#1e2246]'
                  : 'bg-[#16a37f] text-white border-[#1e2246]';

              return (
                <div
                  key={card.title}
                  className="group relative rounded-[1.5rem] cursor-default"
                >
                  {/* Subtle Corner Backlight on Hover */}
                  <div
                    className="absolute -inset-1.5 rounded-[1.8rem] blur-xl opacity-0 group-hover:opacity-80 transition-opacity duration-300 -z-10 pointer-events-none"
                    style={{ background: card.glow }}
                  />

                  <div className="ola-glass ola-sheen-card rounded-[1.5rem] p-4 sm:p-5 flex items-center gap-4 group-hover:-translate-y-1 transition-all duration-200">
                    {/* Tactile Micro-Motion Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl border-2 shadow-[0_3px_0_#1e2246] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300 ${iconStyle}`}
                    >
                      {card.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-[#1e2246] leading-tight mb-1 group-hover:text-[#454d82] transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-xs text-[#50567d] font-medium leading-snug">
                        {card.desc}
                      </p>
                    </div>

                    {/* Sliding Bottom Accent Line (Trickle-down Kinetic Cue) */}
                    <div
                      className={`absolute bottom-0 left-5 right-5 h-[3px] rounded-full bg-gradient-to-r ${card.bar} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300`}
                    />
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