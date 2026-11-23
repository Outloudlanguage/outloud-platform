import React from 'react';
import { OutLoudIcon } from './OutLoudBrand';
import LandingCycleSection from './LandingCycleSection';

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
          background: linear-gradient(152deg, rgba(255, 246, 218, 0.82) 0%, rgba(255, 229, 156, 0.56) 100%);
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
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

        /* Lightened Vibrant Brand Indigo (#626a9f family — no heavy dark navy block) */
        .ola-pillar-indigo {
          background: linear-gradient(152deg, rgba(114, 123, 184, 0.9) 0%, rgba(86, 94, 152, 0.88) 100%);
          backdrop-filter: blur(26px) saturate(185%);
          -webkit-backdrop-filter: blur(26px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.45);
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
          background: linear-gradient(152deg, rgba(255, 255, 255, 0.78) 0%, rgba(232, 236, 252, 0.62) 100%);
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
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

        /* Kinetic Micro-Animations for the 3 Unified Stages */
        @keyframes olaOrbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes olaRippleOut {
          0% { transform: scale(0.86); opacity: 0.72; }
          100% { transform: scale(1.62); opacity: 0; }
        }
        @keyframes olaSignalFlow {
          0%, 100% { opacity: 0.45; transform: scaleY(0.45); }
          50% { opacity: 1; transform: scaleY(1); }
        }
        @keyframes olaGentleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .ola-orbit-ring {
          animation: olaOrbitSpin 24s linear infinite;
        }
        .ola-ripple-1 {
          animation: olaRippleOut 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .ola-ripple-2 {
          animation: olaRippleOut 2.6s cubic-bezier(0.22, 1, 0.36, 1) 1.3s infinite;
        }
        .ola-signal-bar {
          transform-origin: center;
          animation: olaSignalFlow 1.15s ease-in-out infinite;
        }
        .ola-gentle-bob {
          animation: olaGentleBob 3.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .ola-orbit-ring, .ola-ripple-1, .ola-ripple-2, .ola-signal-bar, .ola-gentle-bob {
            animation: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* ================================================== */}
        {/* PART A: HEADER & 3 COHESIVE BRAND-ANCHORED CARDS   */}
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

        {/* 3 SYMMETRIC, LEVEL, BRAND-MARK HERO CARDS */}
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

            <div className="ola-pillar-gold ola-sheen-card flex-1 rounded-[2.4rem] p-6 sm:p-7 flex flex-col justify-between relative">
              {/* Subtle Brand Mark Watermark (Replaces Generic Numbers) */}
              <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.07] group-hover:opacity-[0.12] group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <OutLoudIcon withTile={false} className="w-44 h-44" />
              </div>

              {/* UNIFIED CENTER-WEIGHTED STAGE 1: Brand Voice Radiating Real English */}
              <div className="relative z-10 h-44 sm:h-48 rounded-[1.85rem] bg-white/60 backdrop-blur-xl border border-white/95 shadow-inner mb-6 overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-70 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(255,199,73,0.42) 0%, transparent 66%)',
                  }}
                />

                {/* Expanding Concentric Voice Ripples */}
                <span className="ola-ripple-1 absolute w-24 h-24 rounded-full border-2 border-[#ffc749]/80 pointer-events-none" />
                <span className="ola-ripple-2 absolute w-24 h-24 rounded-full border-2 border-[#626a9f]/45 pointer-events-none" />

                {/* Symmetric Floating English Speech Chips (Top-Left & Bottom-Right) */}
                <div className="ola-gentle-bob absolute top-3 left-3 z-20 bg-[#1e2246] text-white px-3 py-1.5 rounded-2xl rounded-bl-sm shadow-md flex items-center gap-1.5 group-hover:-translate-x-1 transition-transform duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffc749]" />
                  <span className="text-[10px] font-black tracking-wide">&ldquo;Nice to meet you!&rdquo;</span>
                </div>

                <div
                  className="ola-gentle-bob absolute bottom-3 right-3 z-20 bg-white/95 border border-[#1e2246]/15 text-[#1e2246] px-3 py-1.5 rounded-2xl rounded-tr-sm shadow-md flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300"
                  style={{ animationDelay: '1.1s' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#626a9f]" />
                  <span className="text-[10px] font-black tracking-wide">&ldquo;I&apos;ll take a coffee!&rdquo;</span>
                </div>

                {/* Centered Brand Mark Focal Core */}
                <div className="relative z-20 w-[76px] h-[76px] rounded-[1.45rem] bg-white/90 border-2 border-white shadow-[0_12px_26px_-6px_rgba(69,77,130,0.3)] flex items-center justify-center p-2 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <OutLoudIcon className="w-full h-full drop-shadow-sm" />
                </div>
              </div>

              {/* BALANCED TYPOGRAPHY BLOCK (16 Words) */}
              <div className="relative z-10 mb-7">
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
              <div className="relative z-10 mt-auto pt-4 border-t border-[#1e2246]/12 flex items-center justify-between gap-3">
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

            <div className="ola-pillar-indigo ola-sheen-card flex-1 rounded-[2.4rem] p-6 sm:p-7 text-white flex flex-col justify-between relative">
              {/* Subtle Inverted Brand Mark Watermark */}
              <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.1] brightness-0 invert group-hover:opacity-[0.16] group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <OutLoudIcon withTile={false} className="w-44 h-44" />
              </div>

              {/* UNIFIED CENTER-WEIGHTED STAGE 2: Brand Mark 24/7 Orbital Ecosystem */}
              <div className="relative z-10 h-44 sm:h-48 rounded-[1.85rem] bg-white/15 backdrop-blur-xl border border-white/30 shadow-inner mb-6 overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(255,199,73,0.28) 0%, transparent 65%)',
                  }}
                />

                {/* Rotating Orbital Tracks */}
                <div className="ola-orbit-ring w-36 h-36 rounded-full border border-dashed border-white/40 absolute pointer-events-none" />
                <div className="w-24 h-24 rounded-full border border-[#ffc749]/45 absolute pointer-events-none" />

                {/* 4 Symmetric Satellite Ecosystem Nodes */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/35 text-[9.5px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffc749]" />
                  <span>Audios</span>
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/35 text-[9.5px] font-black uppercase tracking-wider text-[#ffc749] flex items-center gap-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Club</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/35 text-[9.5px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a37f]" />
                  <span>Workbooks</span>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/35 text-[9.5px] font-black uppercase tracking-wider text-white flex items-center gap-1.5 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffc749]" />
                  <span>Foros</span>
                </div>

                {/* Centered Brand Mark Focal Core + 24/7 Pill */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-[76px] h-[76px] rounded-[1.45rem] bg-white/95 border-2 border-[#1e2246] shadow-[0_12px_28px_-4px_rgba(30,34,70,0.45)] flex items-center justify-center p-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <OutLoudIcon className="w-full h-full" />
                  </div>
                  <span className="-mt-2.5 px-2.5 py-0.5 rounded-full bg-[#ffc749] border-2 border-[#1e2246] text-[9px] font-black uppercase tracking-widest text-[#1e2246] shadow-sm">
                    24/7
                  </span>
                </div>
              </div>

              {/* BALANCED TYPOGRAPHY BLOCK (16 Words) */}
              <div className="relative z-10 mb-7">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none mb-3">
                  Acceso 24/7
                </h3>
                <p className="text-sm text-white/95 font-medium leading-relaxed">
                  Lecciones dinámicas, audios, workbooks y{' '}
                  <strong className="font-black text-[#ffc749]">club de conversación</strong> siempre listos para preparar tu clase en vivo.
                </p>
              </div>

              {/* ALIGNED REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 border-t border-white/20 flex items-center justify-between gap-3">
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

            <div className="ola-pillar-frost ola-sheen-card flex-1 rounded-[2.4rem] p-6 sm:p-7 flex flex-col justify-between relative">
              {/* Subtle Brand Mark Watermark */}
              <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.06] group-hover:opacity-[0.11] group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <OutLoudIcon withTile={false} className="w-44 h-44" />
              </div>

              {/* UNIFIED CENTER-WEIGHTED STAGE 3: Live Human Connection Bridged by OutLoud */}
              <div className="relative z-10 h-44 sm:h-48 rounded-[1.85rem] bg-white/65 backdrop-blur-xl border border-white/95 shadow-inner mb-6 overflow-hidden flex flex-col items-center justify-center p-4">
                <div
                  className="absolute inset-0 opacity-55 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(121,131,196,0.32) 0%, transparent 66%)',
                  }}
                />

                {/* Top Live Indicator */}
                <div className="relative z-10 inline-flex items-center gap-1.5 bg-[#16a37f]/15 border border-[#16a37f]/35 px-3 py-1 rounded-full mb-3.5">
                  <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-ping" />
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-[#128063]">
                    Sesión en Vivo
                  </span>
                </div>

                {/* Symmetric Teacher <-> Brand Core <-> Student */}
                <div className="relative z-10 flex items-center justify-center gap-2.5 sm:gap-3 w-full">
                  {/* Instructor */}
                  <div className="flex flex-col items-center gap-1 group-hover:-translate-x-1 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-[#626a9f] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#ffc749]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#454d82]">Profe</span>
                  </div>

                  {/* Left Animated Signal */}
                  <div className="flex items-center gap-1 h-7 -mt-3">
                    {[10, 20, 14].map((h, i) => (
                      <span
                        key={`cl-${i}`}
                        className="ola-signal-bar w-1 rounded-full bg-[#626a9f]"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.14}s` }}
                      />
                    ))}
                  </div>

                  {/* Centered Brand Mark Focal Core (Matches Stage 1 & 2 Gravity) */}
                  <div className="w-[62px] h-[62px] -mt-3 rounded-[1.25rem] bg-white border-2 border-[#1e2246] shadow-[0_6px_18px_-4px_rgba(69,77,130,0.3)] flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <OutLoudIcon className="w-full h-full" />
                  </div>

                  {/* Right Animated Signal */}
                  <div className="flex items-center gap-1 h-7 -mt-3">
                    {[14, 20, 10].map((h, i) => (
                      <span
                        key={`cr-${i}`}
                        className="ola-signal-bar w-1 rounded-full bg-[#ffc749]"
                        style={{ height: `${h}px`, animationDelay: `${(2 - i) * 0.14}s` }}
                      />
                    ))}
                  </div>

                  {/* Student */}
                  <div className="flex flex-col items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#1e2246]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#1e2246]">Tú</span>
                  </div>
                </div>
              </div>

              {/* BALANCED TYPOGRAPHY BLOCK (16 Words) */}
              <div className="relative z-10 mb-7">
                <h3 className="text-xl sm:text-2xl font-black text-[#1e2246] uppercase tracking-tight leading-none mb-3">
                  Clases 100% En Vivo
                </h3>
                <p className="text-sm text-[#3e446b] font-semibold leading-relaxed">
                  Sesiones individuales o grupales con{' '}
                  <strong className="font-black text-[#1e2246]">profesores reales</strong>, corrección al instante y práctica que te da confianza.
                </p>
              </div>

              {/* ALIGNED REACTIVE ACTION BAR */}
              <div className="relative z-10 mt-auto pt-4 border-t border-[#454d82]/15 flex items-center justify-between gap-3">
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
                    {/* Micro Brand Watermark Trickle-Down */}
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