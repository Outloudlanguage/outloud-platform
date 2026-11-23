import React from 'react';
import { OutLoudIcon } from './OutLoudBrand';
import LandingCycleSection from './LandingCycleSection';

// ==========================================================
// UNSPLASH THEME PHOTOGRAPHY (Easy 1-line swap anytime)
// ==========================================================
const HERO_CARD_IMAGES = {
  immersion:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  access247:
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80',
  liveClasses:
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=900&q=80',
};

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

export default function LandingMethodSection({ onScrollTo }) {
  return (
    <section id="method" className="relative py-16 sm:py-24 scroll-mt-24">
      <style>{`
        /* Unified Luminous Glass Trio — Balanced Optical Weight */
        .ola-pillar-gold {
          background: linear-gradient(152deg, rgba(255, 246, 218, 0.84) 0%, rgba(255, 229, 156, 0.58) 100%);
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow:
            0 20px 44px -14px rgba(196, 138, 12, 0.24),
            0 0 32px -10px rgba(255, 199, 73, 0.45),
            inset 0 2px 2px rgba(255, 255, 255, 0.95);
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .group:hover .ola-pillar-gold {
          transform: translateY(-8px);
          border-color: #ffffff;
          box-shadow:
            0 28px 56px -12px rgba(196, 138, 12, 0.32),
            0 0 46px -4px rgba(255, 199, 73, 0.65),
            inset 0 2px 2px #ffffff;
        }

        .ola-pillar-indigo {
          background: linear-gradient(152deg, rgba(114, 123, 184, 0.92) 0%, rgba(86, 94, 152, 0.88) 100%);
          backdrop-filter: blur(26px) saturate(185%);
          -webkit-backdrop-filter: blur(26px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.46);
          box-shadow:
            0 20px 46px -14px rgba(69, 77, 130, 0.36),
            0 0 36px -10px rgba(98, 106, 159, 0.5),
            inset 0 2px 2px rgba(255, 255, 255, 0.42);
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .group:hover .ola-pillar-indigo {
          transform: translateY(-8px);
          border-color: rgba(255, 199, 73, 0.85);
          box-shadow:
            0 28px 58px -12px rgba(69, 77, 130, 0.46),
            0 0 48px -4px rgba(255, 199, 73, 0.45),
            inset 0 2px 2px rgba(255, 255, 255, 0.55);
        }

        .ola-pillar-frost {
          background: linear-gradient(152deg, rgba(255, 255, 255, 0.8) 0%, rgba(232, 236, 252, 0.64) 100%);
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.94);
          box-shadow:
            0 20px 44px -14px rgba(72, 80, 136, 0.24),
            0 0 32px -10px rgba(121, 131, 196, 0.38),
            inset 0 2px 2px rgba(255, 255, 255, 0.98);
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .group:hover .ola-pillar-frost {
          transform: translateY(-8px);
          border-color: #ffffff;
          box-shadow:
            0 28px 56px -12px rgba(72, 80, 136, 0.34),
            0 0 44px -6px rgba(98, 106, 159, 0.48),
            inset 0 2px 2px #ffffff;
        }

        /* Specular Diagonal Glass Sheen on Hover */
        .ola-sheen-card {
          position: relative;
          overflow: hidden;
        }
        .ola-sheen-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -135%;
          width: 72%;
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
          left: 160%;
        }

        @keyframes olaSignalFlow {
          0%, 100% { opacity: 0.45; transform: scaleY(0.45); }
          50% { opacity: 1; transform: scaleY(1); }
        }
        .ola-signal-bar {
          transform-origin: center;
          animation: olaSignalFlow 1.15s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .ola-signal-bar { animation: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* ================================================== */}
        {/* PART A: HEADER & 3 EDITORIAL PHOTO HERO CARDS      */}
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
            Tres pilares conectados para pensar, practicar y hablar con confianza real.
          </p>
        </div>

        {/* 3 SYMMETRIC PHOTO-DRIVEN HERO CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch">
          {/* ========================================== */}
          {/* CARD 1: INMERSIÓN TOTAL (Sunlit Gold Glass) */}
          {/* ========================================== */}
          <div
            onClick={() => onScrollTo?.('#cycle')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onScrollTo?.('#cycle')}
            className="group relative flex flex-col cursor-pointer focus:outline-none"
          >
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-65 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,199,73,0.78), rgba(255,224,145,0.2) 72%)',
              }}
            />

            <div className="ola-pillar-gold ola-sheen-card flex-1 rounded-[2.4rem] p-5 sm:p-6 flex flex-col justify-between relative">
              {/* Signature Bottom-Right OutLoud Watermark */}
              <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.08] group-hover:opacity-[0.14] group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <OutLoudIcon withTile={false} className="w-44 h-44" />
              </div>

              {/* PHOTO STAGE 1: Real-World Natural Conversation */}
              <div className="relative z-10 h-48 sm:h-52 rounded-[1.75rem] bg-[#f4e4b5] border-2 border-white/90 shadow-[0_12px_28px_-10px_rgba(146,101,8,0.28)] mb-6 overflow-hidden">
                <img
                  src={HERO_CARD_IMAGES.immersion}
                  alt="Estudiantes conversando de forma natural en inglés"
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />
                {/* Warm Editorial Scrim for Palette Harmony */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,199,73,0.06) 0%, rgba(30,34,70,0.08) 55%, rgba(30,34,70,0.48) 100%)',
                  }}
                />
                {/* Floating Frosted Voice Snippet */}
                <div className="absolute bottom-3 left-3 z-10 bg-white/85 backdrop-blur-xl border border-white rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-[2.5px] h-3.5">
                    {[7, 13, 9, 14].map((h, i) => (
                      <span
                        key={i}
                        className="ola-signal-bar w-[2.5px] rounded-full bg-[#626a9f]"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.14}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10.5px] font-black text-[#1e2246] tracking-wide">
                    &ldquo;I&apos;ll take a coffee!&rdquo;
                  </span>
                </div>
              </div>

              {/* BALANCED TYPOGRAPHY BLOCK */}
              <div className="relative z-10 mb-7 px-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#1e2246] uppercase tracking-tight leading-none mb-3">
                  Inmersión Total
                </h3>
                <p className="text-sm text-[#282d57] font-semibold leading-relaxed">
                  Aprende con{' '}
                  <strong className="font-black text-[#1e2246] underline decoration-[#ffc749] decoration-[3px] underline-offset-2">
                    situaciones reales
                  </strong>{' '}
                  de forma natural y fluida, sin traducir ni memorizar teoría rígida.
                </p>
              </div>

              {/* ALIGNED REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 px-1 border-t border-[#1e2246]/12 flex items-center justify-between gap-3">
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
          {/* CARD 2: ACCESO 24/7 (Vibrant Brand Indigo) */}
          {/* ========================================== */}
          <div
            onClick={() => onScrollTo?.('#levels')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onScrollTo?.('#levels')}
            className="group relative flex flex-col cursor-pointer focus:outline-none"
          >
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 35%, rgba(98,106,159,0.82), rgba(255,199,73,0.42) 76%)',
              }}
            />

            <div className="ola-pillar-indigo ola-sheen-card flex-1 rounded-[2.4rem] p-5 sm:p-6 text-white flex flex-col justify-between relative">
              {/* Signature Bottom-Right OutLoud Watermark */}
              <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.11] brightness-0 invert group-hover:opacity-[0.17] group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <OutLoudIcon withTile={false} className="w-44 h-44" />
              </div>

              {/* PHOTO STAGE 2: Studying Anywhere 24/7 with Headphones */}
              <div className="relative z-10 h-48 sm:h-52 rounded-[1.75rem] bg-[#454d82] border-2 border-white/40 shadow-[0_14px_30px_-10px_rgba(30,34,70,0.45)] mb-6 overflow-hidden">
                <img
                  src={HERO_CARD_IMAGES.access247}
                  alt="Estudiante practicando a su propio ritmo con audífonos y laptop"
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />
                {/* Soft Indigo Glass Scrim */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(98,106,159,0.12) 0%, rgba(45,51,96,0.12) 52%, rgba(30,34,70,0.58) 100%)',
                  }}
                />
                {/* Floating Frosted 24/7 Online Tag */}
                <div className="absolute bottom-3 left-3 z-10 bg-[#1e2246]/75 backdrop-blur-xl border border-white/30 rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="w-2 h-2 rounded-full bg-[#ffc749] animate-pulse shadow-[0_0_8px_#ffc749]" />
                  <span className="text-[10.5px] font-black uppercase tracking-widest text-white">
                    Plataforma 24/7
                  </span>
                </div>
              </div>

              {/* BALANCED TYPOGRAPHY BLOCK */}
              <div className="relative z-10 mb-7 px-1">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none mb-3">
                  Acceso 24/7
                </h3>
                <p className="text-sm text-white/95 font-medium leading-relaxed">
                  Lecciones dinámicas, audios, workbooks y{' '}
                  <strong className="font-black text-[#ffc749]">club de conversación</strong> siempre listos para preparar tu clase en vivo.
                </p>
              </div>

              {/* ALIGNED REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 px-1 border-t border-white/20 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#ffc749] group-hover:translate-x-1 transition-transform">
                  Explorar Niveles
                </span>
                <span className="w-10 h-10 rounded-full bg-[#ffc749] text-[#1e2246] flex items-center justify-center shadow-[0_0_20px_rgba(255,199,73,0.45)] group-hover:bg-white group-hover:scale-110 border-2 border-[#1e2246] transition-all duration-200 shrink-0">
                  <ArrowDownIcon className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* CARD 3: CLASES EN VIVO (Frosted Glass)     */}
          {/* ========================================== */}
          <div
            onClick={() => onScrollTo?.('#enroll')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onScrollTo?.('#enroll')}
            className="group relative flex flex-col cursor-pointer focus:outline-none"
          >
            <div
              className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-65 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 75% 75%, rgba(98,106,159,0.62), rgba(22,163,127,0.32) 55%, rgba(255,199,73,0.28) 85%)',
              }}
            />

            <div className="ola-pillar-frost ola-sheen-card flex-1 rounded-[2.4rem] p-5 sm:p-6 flex flex-col justify-between relative">
              {/* Signature Bottom-Right OutLoud Watermark */}
              <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.07] group-hover:opacity-[0.13] group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <OutLoudIcon withTile={false} className="w-44 h-44" />
              </div>

              {/* PHOTO STAGE 3: Real Live Video Session */}
              <div className="relative z-10 h-48 sm:h-52 rounded-[1.75rem] bg-[#dfe2f2] border-2 border-white/95 shadow-[0_12px_28px_-10px_rgba(69,77,130,0.26)] mb-6 overflow-hidden">
                <img
                  src={HERO_CARD_IMAGES.liveClasses}
                  alt="Clase de inglés 100% en vivo por videollamada con profesor"
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />
                {/* Crisp Cool-Lavender Scrim */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(98,106,159,0.06) 0%, rgba(30,34,70,0.08) 54%, rgba(30,34,70,0.52) 100%)',
                  }}
                />
                {/* Floating Frosted Live Session Tag */}
                <div className="absolute bottom-3 left-3 z-10 bg-white/88 backdrop-blur-xl border border-white rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-ping" />
                  <span className="text-[10.5px] font-black uppercase tracking-widest text-[#1e2246]">
                    En Vivo
                  </span>
                  <div className="flex items-center gap-[2px] h-3 pl-0.5">
                    {[6, 11, 8].map((h, i) => (
                      <span
                        key={i}
                        className="ola-signal-bar w-[2.5px] rounded-full bg-[#16a37f]"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.16}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* BALANCED TYPOGRAPHY BLOCK */}
              <div className="relative z-10 mb-7 px-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#1e2246] uppercase tracking-tight leading-none mb-3">
                  Clases 100% En Vivo
                </h3>
                <p className="text-sm text-[#3e446b] font-semibold leading-relaxed">
                  Sesiones individuales o grupales con{' '}
                  <strong className="font-black text-[#1e2246]">profesores reales</strong>, corrección al instante y práctica que te da confianza.
                </p>
              </div>

              {/* ALIGNED REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 px-1 border-t border-[#454d82]/15 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#454d82] group-hover:text-[#1e2246] group-hover:translate-x-1 transition-all">
                  Inscribirme Ahora
                </span>
                <span className="w-10 h-10 rounded-full bg-[#626a9f] text-white flex items-center justify-center shadow-md group-hover:bg-[#ffc749] group-hover:text-[#1e2246] group-hover:scale-110 border-2 border-[#1e2246] transition-all duration-200 shrink-0">
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* PART B: TRICKLE-DOWN KINETIC ECOSYSTEM BENTO CARDS */}
        {/* ================================================== */}
        <div className="mt-14 sm:mt-16">
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
                  ? 'bg-[#626a9f] text-[#ffc749] border-[#1e2246]'
                  : 'bg-[#16a37f] text-white border-[#1e2246]';

              return (
                <div
                  key={card.title}
                  className="group relative rounded-[1.5rem] cursor-default"
                >
                  <div
                    className="absolute -inset-1.5 rounded-[1.8rem] blur-xl opacity-0 group-hover:opacity-80 transition-opacity duration-300 -z-10 pointer-events-none"
                    style={{ background: card.glow }}
                  />

                  <div className="ola-glass ola-sheen-card rounded-[1.5rem] p-4 sm:p-5 flex items-center gap-4 group-hover:-translate-y-1 transition-all duration-200 relative overflow-hidden">
                    <div className="pointer-events-none select-none absolute -bottom-4 -right-4 opacity-[0.04] group-hover:opacity-[0.09] transition-opacity duration-300">
                      <OutLoudIcon withTile={false} className="w-16 h-16" />
                    </div>

                    <div
                      className={`relative z-10 w-12 h-12 rounded-2xl border-2 shadow-[0_3px_0_#1e2246] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300 ${iconStyle}`}
                    >
                      {card.icon}
                    </div>

                    <div className="relative z-10 min-w-0 flex-1">
                      <h4 className="text-sm font-black text-[#1e2246] leading-tight mb-1 group-hover:text-[#454d82] transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-xs text-[#50567d] font-medium leading-snug">
                        {card.desc}
                      </p>
                    </div>

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
        {/* PART C: MODERN LIVING STUDY CYCLE STUDIO (#cycle)  */}
        {/* ================================================== */}
        <LandingCycleSection onScrollTo={onScrollTo} />
      </div>
    </section>
  );
}