import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import StudentPlayer from './StudentPlayer';
import ForumBoard from './ForumBoard';
import SeminarRoom from './SeminarRoom';
import { OutLoudHorizontalLogo, OutLoudIcon } from './components/OutLoudBrand';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// ==========================================
// 0. DESIGN ENGINE & ANIMATIONS (OutLoud Landing Grammar)
// ==========================================
const HubThemeStyles = () => (
  <style>{`
    .ola-sh-canvas {
      background: linear-gradient(125deg, #fdebc0 0%, #f6eff5 44%, #e5e8fa 76%, #d9dff8 100%);
    }
    .ola-sh-card-gold {
      background: linear-gradient(160deg, #fff9e8 0%, #ffe69e 100%);
      border: 2px solid #ffffff;
      box-shadow: 0 22px 44px -18px rgba(196, 138, 12, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.96);
    }
    .ola-sh-card-indigo {
      background: linear-gradient(160deg, #747db8 0%, #5b64a0 100%);
      border: 2px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 24px 48px -18px rgba(45, 51, 96, 0.38), inset 0 2px 2px rgba(255, 255, 255, 0.25);
    }
    .ola-sh-card-pearl {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.92) 0%, rgba(242, 244, 253, 0.78) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(55, 63, 118, 0.2), inset 0 2px 2px #ffffff;
    }
    .ola-sh-card-cream {
      background: linear-gradient(160deg, rgba(255, 251, 238, 0.94) 0%, rgba(253, 241, 206, 0.78) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(180, 130, 22, 0.18), inset 0 2px 2px #ffffff;
    }
    .ola-sh-card-ice {
      background: linear-gradient(160deg, rgba(241, 245, 255, 0.92) 0%, rgba(226, 233, 250, 0.78) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(55, 63, 118, 0.18), inset 0 2px 2px #ffffff;
    }
    .ola-sh-lift {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease;
    }
    .ola-sh-lift:hover {
      transform: translateY(-5px);
    }
    .ola-sh-lift:active {
      transform: translateY(-1px) scale(0.99);
      transition-duration: 0.08s;
    }
    .ola-sh-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 10px 22px -6px rgba(255, 199, 73, 0.55);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
    }
    .ola-sh-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246, 0 14px 26px -6px rgba(255, 199, 73, 0.72);
    }
    .ola-sh-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
      transition-duration: 0.06s;
    }
    .ola-sh-btn-outline {
      background: rgba(255, 255, 255, 0.92);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 rgba(30, 34, 70, 0.16);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, background 0.14s ease;
    }
    .ola-sh-btn-outline:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #626a9f;
    }
    .ola-sh-btn-outline:active {
      transform: translateY(2px) scale(0.99);
      box-shadow: 0 1px 0 rgba(30, 34, 70, 0.2);
    }
    @keyframes olaWavePulse {
      0%, 100% { transform: scaleY(0.45); }
      50% { transform: scaleY(1); }
    }
    @keyframes olaFloatGentle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes olaFloatReverse {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(5px); }
    }
    @keyframes olaModalPop {
      0% { opacity: 0; transform: translateY(14px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes olaToastPop {
      0% { opacity: 0; transform: translate(-50%, 16px) scale(0.94); }
      100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
    @keyframes olaSparkFly {
      0% { transform: translateY(0px) scale(0.3); opacity: 1; }
      70% { opacity: 1; }
      100% { transform: translateY(-74px) scale(1.05); opacity: 0; }
    }
    .ola-wave-bar {
      transform-origin: center;
      animation: olaWavePulse 1.5s ease-in-out infinite;
    }
    .group:hover .ola-wave-bar {
      animation-duration: 0.72s;
    }
    .ola-float-gentle { animation: olaFloatGentle 4.2s ease-in-out infinite; }
    .ola-float-reverse { animation: olaFloatReverse 4.8s ease-in-out infinite; }
    .ola-modal-pop { animation: olaModalPop 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .ola-toast-pop { animation: olaToastPop 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .ola-spark-fly { animation: olaSparkFly 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

    .ola-sh-root .font-black { font-weight: 800; }
    .ola-sh-root .font-extrabold { font-weight: 700; }

    .ola-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .ola-no-scrollbar::-webkit-scrollbar { display: none; }

    @media (max-width: 1023px) {
      .ola-sh-card-pearl,
      .ola-sh-card-cream,
      .ola-sh-card-ice {
        background: #fdfcf8 !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border: 2px solid rgba(30, 34, 70, 0.14) !important;
        box-shadow: 0 5px 0 rgba(30, 34, 70, 0.08), 0 12px 24px -14px rgba(30, 34, 70, 0.18) !important;
      }
      .ola-sh-card-gold,
      .ola-sh-card-indigo {
        border: 2px solid #1e2246 !important;
        box-shadow: 0 5px 0 #1e2246 !important;
      }
      .ola-sh-lift:hover {
        transform: none !important;
      }
      .ola-float-gentle,
      .ola-float-reverse,
      .ola-wave-bar {
        animation: none !important;
      }
    }
  `}</style>
);

// ==========================================
// 0.1 DAYLIGHT BACKDROP + BRAND GEOMETRY
// ==========================================
const HubBackdrop = () => (
  <div className="ola-sh-canvas fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Architectural Dot Grid matching Landing Page */}
    <div
      className="absolute inset-0 opacity-75"
      style={{
        backgroundImage: 'radial-gradient(rgba(82, 91, 146, 0.22) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
      }}
    />

    {/* Floating Brand Dot Matrix (Top Left) */}
    <svg
      className="hidden md:block absolute top-28 left-8 w-16 h-16 opacity-60 ola-float-gentle"
      viewBox="0 0 60 60"
      fill="none"
    >
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle
            key={`${r}-${c}`}
            cx={8 + c * 14}
            cy={8 + r * 14}
            r="3"
            fill={(r + c) % 3 === 0 ? '#ffc749' : '#626a9f'}
            opacity={(r + c) % 2 === 0 ? 0.85 : 0.45}
          />
        ))
      )}
    </svg>

    {/* Floating Brand Geometric Shapes (Bottom Right) */}
    <svg
      className="hidden lg:block absolute bottom-10 right-10 w-24 h-24 opacity-65 ola-float-reverse"
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle cx="72" cy="24" r="14" fill="#ffc749" />
      <path d="M58 56 A18 18 0 0 1 94 56 Z" fill="#626a9f" opacity="0.75" />
      <rect x="20" y="64" width="22" height="22" rx="6" fill="#ffc749" opacity="0.8" />
      <path d="M26 24 L29 31 L36 34 L29 37 L26 44 L23 37 L16 34 L23 31 Z" fill="#626a9f" />
    </svg>
  </div>
);

// ==========================================
// 0.2 CUSTOM FLAT DUOTONE VECTOR ILLUSTRATIONS
// (Exact 2px #1e2246 stroke grammar from Landing Page)
// ==========================================
const LessonStageIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    {/* Floating mini waveform badge top-left */}
    <div className="absolute top-3 left-3 bg-white/95 border border-[#ffc749] rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm ola-float-gentle">
      <span className="w-2.5 h-2.5 rounded-full bg-[#626a9f] inline-block" />
      <div className="flex items-center gap-0.5 h-3">
        {[6, 11, 7, 12, 8].map((h, i) => (
          <span
            key={i}
            className="ola-wave-bar w-0.5 rounded-full bg-[#1e2246]"
            style={{ height: `${h}px`, animationDelay: `${i * 0.14}s` }}
          />
        ))}
      </div>
    </div>

    {/* Floating mini speech bubble top-right */}
    <div className="absolute top-3 right-3 bg-[#626a9f] text-white rounded-xl rounded-bl-sm px-2.5 py-1 text-[10px] font-bold shadow-sm ola-float-reverse">
      • • •
    </div>

    {/* Left Waveform Bars */}
    <div className="flex items-center gap-1.5 mr-4">
      {[14, 26, 18, 30].map((h, i) => (
        <span
          key={`l-${i}`}
          className="ola-wave-bar w-1.5 rounded-full"
          style={{
            height: `${h}px`,
            backgroundColor: i % 2 === 0 ? '#626a9f' : '#ffc749',
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>

    {/* Central OutLoud Smiling Headphone Mark */}
    <div className="relative z-10 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
      <OutLoudIcon className="w-20 h-20 drop-shadow-[0_10px_18px_rgba(98,106,159,0.28)]" />
    </div>

    {/* Right Waveform Bars */}
    <div className="flex items-center gap-1.5 ml-4">
      {[30, 18, 26, 14].map((h, i) => (
        <span
          key={`r-${i}`}
          className="ola-wave-bar w-1.5 rounded-full"
          style={{
            height: `${h}px`,
            backgroundColor: i % 2 === 0 ? '#ffc749' : '#626a9f',
            animationDelay: `${(i + 2) * 0.18}s`,
          }}
        />
      ))}
    </div>

    {/* Subtle 4-point Sparkle */}
    <svg className="absolute bottom-3 right-5 w-4 h-4 text-[#626a9f]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  </div>
);

const WorkbookStageIllustration = ({ locked }) => (
  <svg className="w-40 h-32 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 130" fill="none">
    {/* Sparkles */}
    <path d="M24 30 L26.5 36.5 L33 39 L26.5 41.5 L24 48 L21.5 41.5 L15 39 L21.5 36.5 Z" fill="#ffc749" />
    <circle cx="154" cy="30" r="4" fill="#ffc749" opacity="0.85" />
    <circle cx="156" cy="96" r="3" fill="#ffffff" opacity="0.65" />

    {/* Open Workbook Base */}
    <rect x="34" y="26" width="56" height="74" rx="10" fill="#ffffff" stroke="#1e2246" strokeWidth="2.5" />
    <rect x="90" y="26" width="56" height="74" rx="10" fill="#fff8e1" stroke="#1e2246" strokeWidth="2.5" />
    {/* Spine */}
    <line x1="90" y1="26" x2="90" y2="100" stroke="#1e2246" strokeWidth="2.5" />

    {/* Left Page Lines + Check */}
    <rect x="44" y="40" width="24" height="6" rx="3" fill="#626a9f" />
    <rect x="44" y="53" width="34" height="4.5" rx="2.25" fill="#d5daf2" />
    <rect x="44" y="64" width="30" height="4.5" rx="2.25" fill="#d5daf2" />
    <rect x="44" y="75" width="36" height="4.5" rx="2.25" fill="#d5daf2" />

    {/* Right Page Interactive Pill + Checkmark Circle */}
    <rect x="102" y="40" width="32" height="10" rx="5" fill="#ffc749" stroke="#1e2246" strokeWidth="1.8" />
    <rect x="102" y="58" width="28" height="4.5" rx="2.25" fill="#626a9f" opacity="0.4" />
    <rect x="102" y="69" width="22" height="4.5" rx="2.25" fill="#626a9f" opacity="0.4" />

    {/* Floating Badge (Emerald Check if unlocked, Coral Lock if locked) */}
    <circle
      cx="142"
      cy="88"
      r="16"
      fill={locked ? '#ee665b' : '#16a37f'}
      stroke="#1e2246"
      strokeWidth="2.4"
    />
    {locked ? (
      <path
        d="M137 88 V84 A5 5 0 0 1 147 84 V88 M135.5 88 H148.5 V95 H135.5 Z"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M135 88 L140 93 L149 83"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const CalendarBentoIllustration = ({ hasSession }) => (
  <svg className="w-36 h-24 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 110" fill="none">
    {/* Calendar Card matching Landing Page 15 / 30 vector */}
    <rect x="40" y="22" width="76" height="68" rx="12" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
    <path d="M40 34 C40 27.37 45.37 22 52 22 H104 C110.63 22 116 27.37 116 34 V40 H40 V34 Z" fill="#626a9f" stroke="#1e2246" strokeWidth="2.4" />
    {/* Rings */}
    <rect x="57" y="14" width="6" height="14" rx="3" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
    <rect x="93" y="14" width="6" height="14" rx="3" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
    {/* Day Tiles */}
    <rect x="50" y="50" width="24" height="24" rx="6" fill="#fff3d1" stroke="#ffc749" strokeWidth="1.6" />
    <rect x="82" y="50" width="24" height="24" rx="6" fill={hasSession ? '#16a37f' : '#454d82'} />
    <text x="62" y="66" textAnchor="middle" fill="#1e2246" fontSize="10" fontWeight="800">
      LIVE
    </text>
    <text x="94" y="66" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
      LAB
    </text>
    {/* Coral Clock Accent */}
    <circle cx="128" cy="70" r="9" fill="#ee665b" stroke="#1e2246" strokeWidth="2" />
    <path d="M128 65 V70 L131 72" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="28" cy="40" r="3.5" fill="#ffc749" />
  </svg>
);

const CommunityBentoIllustration = () => (
  <svg className="w-40 h-24 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 170 110" fill="none">
    {/* Back Bubble */}
    <rect x="28" y="20" width="76" height="46" rx="14" fill="#626a9f" stroke="#1e2246" strokeWidth="2.4" />
    <circle cx="52" cy="43" r="3.5" fill="#ffc749" />
    <circle cx="66" cy="43" r="3.5" fill="#ffffff" />
    <circle cx="80" cy="43" r="3.5" fill="#ffffff" />

    {/* Front Gold Bubble */}
    <rect x="66" y="44" width="76" height="46" rx="14" fill="#ffc749" stroke="#1e2246" strokeWidth="2.4" />
    <rect x="82" y="60" width="44" height="5" rx="2.5" fill="#1e2246" />
    <rect x="82" y="71" width="28" height="5" rx="2.5" fill="#1e2246" opacity="0.45" />

    {/* Sparkles */}
    <path d="M148 24 L150 29 L155 31 L150 33 L148 38 L146 33 L141 31 L146 29 Z" fill="#16a37f" />
    <circle cx="24" cy="78" r="4" fill="#ee665b" opacity="0.75" />
  </svg>
);



// ==========================================
// 0.3 SMALL SHARED UI ICONS
// ==========================================
const CloseSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const LockSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const WhatsAppSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/share/1KxawRX9vA/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@outloudlanguage',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/847PMD2DbV',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const INFO_CATEGORIES = [
  'Website Functionality',
  'General Information',
  'Academy Rules',
  'Upcoming Events',
  'Promos & Discounts',
  'Financial Data',
];

const getProgressData = (student) => {
  const currentUnit = Number(student?.unit) || 1;
  const baseLevel = student?.level ? student.level.split(':')[0].trim() : 'A1';
  const bounds = {
    A1: { start: 1, end: 12 },
    A2: { start: 13, end: 24 },
    B1: { start: 25, end: 36 },
    B2: { start: 37, end: 48 },
    C1: { start: 49, end: 70 },
    C2: { start: 71, end: 92 },
  }[baseLevel] || { start: 1, end: 12 };

  const levelTotalUnits = bounds.end - bounds.start + 1;
  const unitsCompletedInLevel = Math.max(0, currentUnit - bounds.start);
  let progressPercentage = Math.round((unitsCompletedInLevel / levelTotalUnits) * 100);
  if (isNaN(progressPercentage)) progressPercentage = 0;

  return { progressPercentage, currentUnit, levelTotalUnits, baseLevel };
};

// ==========================================
// 1. AIRTIGHT BILLING LOCKOUT OVERLAY
// (Zinli • PayPal • Binance • Moneda Local)
// ==========================================
const PaymentLockoutView = ({ student, onReload, isDismissible, onClose }) => {
  const [payMethod, setPayMethod] = useState('Zinli');
  const [payRef, setPayRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseLevel = student.level ? student.level.split(':')[0].trim() : 'A1';
  const amountDue = ['C1', 'C2'].includes(baseLevel) ? 50 : ['B1', 'B2'].includes(baseLevel) ? 30 : 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payRef.trim()) return;
    setIsSubmitting(true);

    try {
      await Promise.all([
        (async () => {
          await supabase.from('student_payments').insert({
            student_id: student.id,
            payment_type: 'Monthly Renewal',
            amount: amountDue,
            reference_number: `${payMethod}: ${payRef.trim()}`,
            status: 'processing',
          });
          await supabase.from('profiles').update({ payment_status: 'processing' }).eq('id', student.id);
        })(),
        new Promise((resolve) => setTimeout(resolve, 650)),
      ]);
      onReload();
    } catch (err) {
      console.error(err);
      alert('Hubo un error enviando tu pago. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] min-h-screen flex items-center justify-center p-4 font-montserrat overflow-y-auto ${
        isDismissible ? 'bg-[#1e2246]/55 backdrop-blur-xl' : ''
      }`}
    >
      <HubThemeStyles />
      {!isDismissible && <HubBackdrop />}

      {isDismissible && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="fixed top-5 right-5 w-11 h-11 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 z-50 cursor-pointer"
        >
          <CloseSvg className="w-5 h-5" />
        </button>
      )}

      <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.5rem] p-7 sm:p-10 w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="mb-5">
          <OutLoudHorizontalLogo iconClass="w-10 h-10" wordmarkClass="h-8 w-auto" />
        </div>

        {student.payment_status === 'processing' ? (
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#e8eaf7] text-[#454d82] rounded-2xl flex items-center justify-center mb-5 border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246]">
              <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-2">Pago en Revisión</h2>
            <p className="text-sm font-medium text-[#4c5384] mb-6 leading-relaxed">
              Hemos recibido tu referencia. Nuestro equipo está verificando la transacción para activar tu acceso en breve.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] ${
                student.payment_status === 'pending_first_month'
                  ? 'bg-[#ffc749] text-[#1e2246]'
                  : 'bg-[#ee665b]/15 text-[#c93f34]'
              }`}
            >
              <LockSvg className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-2 text-center">
              {student.payment_status === 'pending_first_month' ? 'Activa tu Cuenta' : 'Acceso en Pausa'}
            </h2>
            <p className="text-sm font-medium text-[#4c5384] mb-5 text-center leading-relaxed">
              {student.payment_status === 'pending_first_month'
                ? '¡Bienvenido a OutLoud! Reporta tu primer pago para desbloquear tus lecciones y clases en vivo.'
                : 'Tu ciclo de facturación ha vencido. Reporta tu mensualidad para reactivar tu acceso y renovar tus 4 créditos.'}
            </p>

            <div className="bg-[#fff8e1] border-2 border-[#ffc749] rounded-2xl p-4 mb-5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82]">
                Mensualidad Nivel {baseLevel}
              </span>
              <div className="text-4xl font-extrabold text-[#1e2246] mt-0.5">${amountDue}.00 USD</div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#454d82] mb-1.5">
                  Método de Pago
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-xs text-[#1e2246] font-bold uppercase tracking-wider outline-none cursor-pointer"
                >
                  <option value="Zinli">Zinli</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Binance">Binance</option>
                  <option value="Moneda Local">Moneda Local (Consultar soporte)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#454d82] mb-1.5">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Ej. ID de transacción o comprobante"
                  required
                  className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="ola-sh-btn-yellow w-full py-3.5 mt-2 font-bold tracking-widest text-xs uppercase rounded-full disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Verificando...' : 'Reportar Pago →'}
              </button>
            </form>
          </div>
        )}

        <a
          href="https://wa.me/584226885683"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 text-[#454d82] hover:text-[#128063] transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <WhatsAppSvg className="w-4 h-4 text-[#16a37f]" />
          <span>Soporte &amp; Moneda Local</span>
        </a>
      </div>
    </div>
  );
};

// ==========================================
// 2. LEVEL COMPLETE OVERLAY
// ==========================================
const LevelCompleteOverlay = ({ student }) => {
  if (!student?.level_completed) return null;
  const baseLevel = student.level ? student.level.split(':')[0].trim() : 'A1';

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#1e2246]/60 backdrop-blur-2xl font-montserrat">
      <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.5rem] p-8 sm:p-12 max-w-xl w-full flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246] rounded-full flex items-center justify-center mb-6">
          <CheckSvg className="w-10 h-10" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3.5 py-1 rounded-full mb-3">
          Nivel Completado
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e2246] tracking-tight mb-3">
          ¡Nivel {baseLevel} Completado!
        </h1>
        <p className="text-sm sm:text-base text-[#4c5384] font-medium mb-8 leading-relaxed">
          ¡Felicidades por dominar este nivel! Para desbloquear el siguiente nivel CEFR y continuar tu camino en OutLoud, gestiona tu inscripción de nivel ($10) con soporte.
        </p>
        <a
          href="https://wa.me/584226885683"
          target="_blank"
          rel="noreferrer"
          className="ola-sh-btn-yellow w-full sm:w-auto px-9 py-4 font-bold text-xs uppercase tracking-widest rounded-full inline-flex items-center justify-center gap-2"
        >
          <WhatsAppSvg className="w-4 h-4" />
          <span>Contactar Soporte para Renovar →</span>
        </a>
      </div>
    </div>
  );
};

// ==========================================
// 3. METRICS & PRACTICE CENTER MODAL
// ==========================================
const StudentMetricsModal = ({ isOpen, onClose, student, onStartPractice }) => {
  const [activeTab, setActiveTab] = useState('PERFORMANCE');
  const [practiceType, setPracticeType] = useState('Lesson');
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [metrics, setMetrics] = useState({ hoursLogged: 0, punctuality: 100, radar: [], notes: [] });
  const [loading, setLoading] = useState(true);

  const LEVEL_BOUNDS = {
    A1: { start: 1, end: 12 },
    A2: { start: 13, end: 24 },
    B1: { start: 25, end: 36 },
    B2: { start: 37, end: 48 },
    C1: { start: 49, end: 70 },
    C2: { start: 71, end: 92 },
  };

  useEffect(() => {
    if (!isOpen || !student) return;
    let active = true;
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data: sessions } = await supabase
          .from('live_sessions')
          .select('duration_minutes, status')
          .eq('student_id', student.id)
          .eq('status', 'completed');

        const totalMins = sessions ? sessions.reduce((acc, s) => acc + (s.duration_minutes || 60), 0) : 0;
        const hoursLogged = (totalMins / 60).toFixed(1);

        const { data: records } = await supabase
          .from('academic_records')
          .select('score_percentage, teacher_notes, created_at')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false });

        const manualNotes = records
          ? records.filter((r) => r.teacher_notes && r.teacher_notes !== 'Auto-Graded')
          : [];
        const taskCompletionAvg =
          records && records.length > 0
            ? Math.round(records.reduce((acc, r) => acc + r.score_percentage, 0) / records.length)
            : student.lesson_score || 0;

        if (active) {
          setMetrics({
            hoursLogged,
            punctuality: 95,
            radar: [
              { subject: 'Speaking', A: student.lesson_score || 70 },
              { subject: 'Punctuality', A: 95 },
              { subject: 'Comprehension', A: student.workbook_score || 75 },
              { subject: 'Task Comp.', A: taskCompletionAvg },
            ],
            notes: manualNotes,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMetrics();

    const baseLevel = student.level ? student.level.split(':')[0].trim() : 'A1';
    setExpandedLevel(baseLevel);
    return () => {
      active = false;
    };
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const msSinceJoin = new Date().getTime() - new Date(student.created_at || Date.now()).getTime();
  const weeksSinceJoin = Math.max(1, msSinceJoin / (1000 * 60 * 60 * 24 * 7));
  const actualVelocity = ((student.unit || 1) / weeksSinceJoin).toFixed(1);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[600] flex items-end md:items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-0 md:p-6 font-montserrat"
    >
      <div className="ola-sh-card-pearl ola-modal-pop rounded-t-[2.25rem] md:rounded-[2.5rem] w-full max-w-4xl flex flex-col h-[90vh] md:h-[82vh] overflow-hidden relative">
        <div className="flex flex-col border-b border-[#626a9f]/15 shrink-0 bg-white/70 pt-5 px-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#626a9f] block">
                OutLoud Progress
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#1e2246] tracking-tight">
                Métricas &amp; Practice Center
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            >
              <CloseSvg className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 bg-[#e8eaf7] p-1 rounded-full border border-white">
            <button
              type="button"
              onClick={() => setActiveTab('PERFORMANCE')}
              className={`flex-1 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer ${
                activeTab === 'PERFORMANCE' ? 'bg-[#1e2246] text-[#ffc749] shadow-sm' : 'text-[#454d82]'
              }`}
            >
              Rendimiento
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PRACTICE')}
              className={`flex-1 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer ${
                activeTab === 'PRACTICE' ? 'bg-[#1e2246] text-[#ffc749] shadow-sm' : 'text-[#454d82]'
              }`}
            >
              Practice Center
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
            </div>
          ) : activeTab === 'PERFORMANCE' ? (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-5">
              <div className="bg-white/85 border border-white rounded-3xl p-5 shadow-sm flex flex-col items-center">
                <h3 className="text-xs font-bold text-[#454d82] uppercase tracking-widest mb-2">
                  Radar de Habilidades
                </h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics.radar}>
                      <PolarGrid stroke="rgba(98,106,159,0.22)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b4170', fontSize: 11, fontWeight: 700 }} />
                      <Radar name="Student" dataKey="A" stroke="#454d82" strokeWidth={2.5} fill="#ffc749" fillOpacity={0.55} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/85 border border-white rounded-2xl p-4 shadow-sm text-center">
                    <p className="text-[10px] text-[#626a9f] font-bold uppercase tracking-widest mb-1">Ritmo Semanal</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-extrabold text-[#1e2246]">{actualVelocity}</span>
                      <span className="text-xs font-bold text-[#626a9f]">/ 1.0</span>
                    </div>
                    <p className="text-[10px] text-[#128063] mt-1 uppercase font-bold">Unidades / sem</p>
                  </div>
                  <div className="bg-[#fff8e1] border-2 border-[#ffc749] rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1">Horas en Vivo</p>
                    <span className="text-3xl font-extrabold text-[#1e2246] block">
                      {metrics.hoursLogged} <span className="text-sm font-bold text-[#454d82]">hrs</span>
                    </span>
                  </div>
                </div>

                <div className="flex-1 bg-white/85 border border-white rounded-3xl p-5 shadow-sm flex flex-col">
                  <h3 className="text-xs font-bold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2.5 mb-3">
                    Observaciones del Profesor
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
                    {metrics.notes.length === 0 ? (
                      <p className="text-xs text-[#626a9f] italic text-center py-6">
                        Aún no hay observaciones registradas.
                      </p>
                    ) : (
                      metrics.notes.map((note, i) => (
                        <div
                          key={i}
                          className="bg-[#f6f7fc] p-3.5 rounded-2xl border border-[#dfe2f2] text-xs text-[#282d57] leading-relaxed font-medium"
                        >
                          <span className="text-[9.5px] font-bold text-[#454d82] block mb-1 uppercase tracking-wider">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                          {note.teacher_notes}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex bg-[#e8eaf7] rounded-full p-1 mb-5 shrink-0 border border-white">
                <button
                  type="button"
                  onClick={() => setPracticeType('Lesson')}
                  className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer ${
                    practiceType === 'Lesson' ? 'bg-white text-[#1e2246] shadow-sm' : 'text-[#454d82]'
                  }`}
                >
                  Lessons
                </button>
                <button
                  type="button"
                  onClick={() => setPracticeType('Workbook')}
                  className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer ${
                    practiceType === 'Workbook' ? 'bg-white text-[#1e2246] shadow-sm' : 'text-[#454d82]'
                  }`}
                >
                  Workbooks
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {Object.entries(LEVEL_BOUNDS).map(([lvl, bounds]) => {
                  const studentAbsUnit = student.unit || 1;
                  if (studentAbsUnit < bounds.start) return null;

                  const isExpanded = expandedLevel === lvl;
                  const availableUnits = Math.min(bounds.end, studentAbsUnit) - bounds.start + 1;

                  return (
                    <div key={lvl} className="bg-white/85 border border-white rounded-2xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => setExpandedLevel(isExpanded ? null : lvl)}
                        className="w-full flex justify-between items-center p-4 hover:bg-white transition-colors cursor-pointer"
                      >
                        <span className="font-extrabold text-[#1e2246] text-base tracking-wider">NIVEL {lvl}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-[#1e2246] uppercase tracking-widest bg-[#fff3d1] border border-[#ffc749] px-3 py-1 rounded-full">
                            {availableUnits} Disponibles
                          </span>
                          <svg
                            className={`w-4 h-4 text-[#454d82] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 border-t border-[#626a9f]/15">
                          {Array.from({ length: availableUnits }, (_, i) => bounds.start + i).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => onStartPractice(practiceType, u)}
                              className="aspect-square bg-[#f6f7fc] hover:bg-[#ffc749] text-[#1e2246] border-2 border-[#dfe2f2] hover:border-[#1e2246] rounded-xl flex flex-col items-center justify-center gap-0.5 font-extrabold transition-all active:scale-95 cursor-pointer"
                            >
                              <span className="text-[9px] uppercase tracking-widest text-[#626a9f]">Unit</span>
                              <span className="text-lg">{u}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. NEW TAB JITSI CONTROLLER (Student)
// ==========================================
const JitsiRoom = ({ session, onLeave }) => {
  const [alertState, setAlertState] = useState('active');
  const lastSeenPing = useRef(null);
  const missedTicks = useRef(0);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const roomUrl = `https://meet.jit.si/OLA-Unit${session.unit}-${session.id}#config.prejoinPageEnabled=false`;
    window.open(roomUrl, '_blank');

    const monitor = setInterval(async () => {
      const { data } = await supabase
        .from('live_sessions')
        .select('last_ping_at, status')
        .eq('id', session.id)
        .single();

      if (data) {
        if (data.status !== 'in_progress') {
          if (data.status === 'completed') setAlertState('completed');
          else setAlertState('admin_handled');
          return;
        }

        if (data.last_ping_at) {
          if (lastSeenPing.current === data.last_ping_at) {
            missedTicks.current += 1;
          } else {
            lastSeenPing.current = data.last_ping_at;
            missedTicks.current = 0;
            setAlertState('active');
          }

          if (missedTicks.current >= 60) {
            setAlertState('terminated');
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('Sesión Interrumpida', {
                body: 'La conexión no pudo ser restaurada. Un admin te contactará.',
              });
            }
            new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg')
              .play()
              .catch(() => {});
          } else if (missedTicks.current >= 4 && missedTicks.current < 60) {
            setAlertState('warning');
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('Conexión Perdida', {
                body: 'Tu profesor tiene problemas técnicos. Mantente en la sala.',
              });
            }
            new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg')
              .play()
              .catch(() => {});
          }
        }
      }
    }, 10000);

    return () => clearInterval(monitor);
  }, [session]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#1e2246]/60 backdrop-blur-xl p-4 font-montserrat">
      {alertState === 'active' && (
        <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.25rem] p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center">
          <span className="w-4 h-4 bg-[#16a37f] rounded-full animate-pulse mb-5 shadow-[0_0_15px_#16a37f]" />
          <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-2">Clase en Curso</h2>
          <p className="text-sm font-medium text-[#4c5384] mb-7 leading-relaxed">
            Tu sala de video se abrió en una nueva pestaña. Al finalizar, cierra la pestaña de video y regresa a tu Hub.
          </p>
          <button
            type="button"
            onClick={() => onLeave(false)}
            className="ola-sh-btn-outline w-full py-3.5 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer"
          >
            Volver al Hub
          </button>
        </div>
      )}

      {alertState === 'warning' && (
        <div className="ola-sh-card-gold ola-modal-pop rounded-[2.25rem] p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center">
          <span className="w-6 h-6 bg-[#ffc749] border-2 border-[#1e2246] rounded-full animate-pulse mb-5" />
          <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-2">Conexión Perdida</h2>
          <p className="text-sm font-medium text-[#282d57] leading-relaxed">
            Tu profesor presenta dificultades técnicas. Mantente en la sala; nuestros administradores ya fueron alertados.
          </p>
        </div>
      )}

      {alertState === 'terminated' && (
        <div className="ola-sh-card-pearl ola-modal-pop border-2 border-[#ee665b] rounded-[2.25rem] p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center">
          <span className="w-6 h-6 bg-[#ee665b] rounded-full mb-5" />
          <h2 className="text-2xl font-extrabold text-[#c93f34] tracking-tight mb-2">Sesión Interrumpida</h2>
          <p className="text-sm font-medium text-[#4c5384] mb-7 leading-relaxed">
            No se pudo restaurar la conexión. Cierra la pestaña de video; un administrador te contactará para reprogramar.
          </p>
          <button
            type="button"
            onClick={() => onLeave(false)}
            className="w-full py-3.5 bg-[#ee665b] text-white font-bold text-xs uppercase tracking-widest rounded-full border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {alertState === 'completed' && (
        <div className="ola-sh-card-pearl ola-modal-pop border-2 border-[#16a37f] rounded-[2.25rem] p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center">
          <span className="w-12 h-12 rounded-full bg-[#16a37f] text-white flex items-center justify-center mb-4">
            <CheckSvg className="w-6 h-6" />
          </span>
          <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-2">Clase Finalizada</h2>
          <p className="text-sm font-medium text-[#4c5384] mb-7 leading-relaxed">
            Tu profesor ha cerrado la sesión. Evalúa tu experiencia para ayudarnos a mantener la excelencia.
          </p>
          <button
            type="button"
            onClick={() => onLeave(true)}
            className="ola-sh-btn-yellow w-full py-3.5 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer"
          >
            Evaluar Clase →
          </button>
        </div>
      )}

      {alertState === 'admin_handled' && (
        <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.25rem] p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center">
          <h2 className="text-2xl font-extrabold text-[#454d82] tracking-tight mb-2">Sesión Actualizada</h2>
          <p className="text-sm font-medium text-[#4c5384] mb-7 leading-relaxed">
            Esta sesión fue actualizada por administración. Regresa a tu panel principal.
          </p>
          <button
            type="button"
            onClick={() => onLeave(false)}
            className="ola-sh-btn-yellow w-full py-3.5 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer"
          >
            Volver al Hub
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. GATEKEEPER EVALUATION CROSSROAD
// ==========================================
const EvaluationCrossroad = ({
  data,
  onProceed,
  onRetry,
  onScheduleComplementary,
  onScheduleTutoring,
}) => {
  const { type, scores, fails, unit, level, average, passed } = data;
  const skillEntries = Object.entries(scores);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e2246]/65 backdrop-blur-2xl px-4 md:px-10 font-montserrat overflow-y-auto">
      <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.5rem] p-7 md:p-12 w-full max-w-md md:max-w-4xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
        {passed && (
          <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 flex items-center justify-center">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
              <span key={deg} className="absolute" style={{ transform: `rotate(${deg}deg)` }}>
                <span
                  className="ola-spark-fly block rounded-full"
                  style={{
                    width: idx % 2 === 0 ? '9px' : '6px',
                    height: idx % 2 === 0 ? '9px' : '6px',
                    backgroundColor: idx % 2 === 0 ? '#ffc749' : '#16a37f',
                  }}
                />
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
          <span
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${
              passed ? 'bg-[#16a37f] text-white' : 'bg-[#ee665b]/15 text-[#c93f34]'
            }`}
          >
            {level} • Unit {unit} • {type}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1e2246] leading-tight mb-3">
            {passed ? '¡Completado!' : 'Sigue Practicando'}
          </h1>
          <p className="text-sm font-medium text-[#4c5384] max-w-sm leading-relaxed">
            {passed
              ? 'Superaste el mínimo de 75% y desbloqueaste el siguiente paso de tu ciclo de estudio.'
              : 'Necesitas al menos 75% para avanzar. Revisa tu desglose y elige tu próximo paso.'}
          </p>
        </div>

        <div className="flex-[0.9] flex flex-col items-center justify-center w-full max-w-sm bg-white border-2 border-[#dfe2f2] rounded-[2rem] p-6 shadow-sm">
          <div className="w-full space-y-3 mb-6">
            {skillEntries.map(([skill, score]) => (
              <div key={skill} className="flex items-center justify-between gap-3">
                <span className="w-28 text-left text-xs font-bold text-[#3b4170] truncate">{skill}</span>
                <div className="flex-1 bg-[#e8eaf7] rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      score >= 75 ? 'bg-gradient-to-r from-[#626a9f] to-[#16a37f]' : 'bg-[#ee665b]'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-[#1e2246] w-9 text-right">{score}%</span>
              </div>
            ))}
          </div>

          <div
            className={`text-6xl leading-none font-extrabold mb-6 ${
              passed ? 'text-[#128063]' : 'text-[#c93f34]'
            }`}
          >
            {average}%
          </div>

          <div className="w-full">
            {passed ? (
              <button
                type="button"
                onClick={onProceed}
                className="ola-sh-btn-yellow w-full py-3.5 px-5 font-bold tracking-widest text-xs uppercase rounded-full cursor-pointer"
              >
                {type === 'Lesson' ? 'Ir al Workbook →' : 'Reservar Clase En Vivo →'}
              </button>
            ) : fails === 0 ? (
              <button
                type="button"
                onClick={onRetry}
                className="ola-sh-btn-outline w-full py-3.5 px-5 font-bold tracking-widest text-xs uppercase rounded-full cursor-pointer"
              >
                Intentar de Nuevo
              </button>
            ) : fails === 1 ? (
              <button
                type="button"
                onClick={onScheduleComplementary}
                className="ola-sh-btn-yellow w-full py-3.5 px-5 font-bold tracking-widest text-xs uppercase rounded-full cursor-pointer"
              >
                Reservar Clase Complementaria
              </button>
            ) : (
              <button
                type="button"
                onClick={onScheduleTutoring}
                className="w-full py-3.5 px-5 bg-[#ee665b] text-white border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] font-bold tracking-widest text-xs uppercase rounded-full cursor-pointer"
              >
                Reservar Tutoría 1-on-1
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. POST-CLASS TEACHER EVALUATION MODAL
// ==========================================
const TeacherEvaluationModal = ({ isOpen, session, onClose }) => {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const questions = [
    { id: 'q_demeanor', text: '¿Mantuvo el profesor una actitud positiva, paciente y motivadora durante la clase?' },
    { id: 'q_clarity', text: '¿Explicó el profesor los temas de hoy de forma clara y efectiva?' },
    { id: 'q_facilitation', text: '¿Manejó el profesor activamente la clase y animó a todos a participar?' },
    { id: 'q_content', text: '¿Presentó el profesor el material de una manera estructurada y fácil de seguir?' },
    { id: 'q_time', text: '¿Comenzó el profesor exactamente a tiempo y mantuvo un buen ritmo de clase?' },
  ];

  const isComplete = Object.keys(answers).length === questions.length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await supabase.from('class_evaluations').insert({
        session_id: session.id,
        teacher_id: session.teacher_id,
        student_id: session.student_id,
        q_demeanor: answers.q_demeanor,
        q_clarity: answers.q_clarity,
        q_facilitation: answers.q_facilitation,
        q_content: answers.q_content,
        q_time: answers.q_time,
      });
      onClose();
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-[#1e2246]/60 backdrop-blur-xl font-montserrat overflow-y-auto">
      <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.25rem] p-6 sm:p-8 max-w-lg w-full flex flex-col">
        <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-1 text-center">Califica tu Clase</h2>
        <p className="text-xs sm:text-sm font-medium text-[#4c5384] mb-6 text-center leading-relaxed">
          Ayúdanos a mantener la excelencia. ¿Cómo fue el desempeño de tu profesor hoy?
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-[#dfe2f2] rounded-2xl p-3.5 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#1e2246] leading-snug">
                {idx + 1}. {q.text}
              </span>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: false }))}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border-2 cursor-pointer transition-colors ${
                    answers[q.id] === false
                      ? 'bg-[#ee665b] text-white border-[#1e2246]'
                      : 'bg-[#f6f7fc] text-[#4c5384] border-transparent hover:border-[#ee665b]'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: true }))}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border-2 cursor-pointer transition-colors ${
                    answers[q.id] === true
                      ? 'bg-[#16a37f] text-white border-[#1e2246]'
                      : 'bg-[#f6f7fc] text-[#4c5384] border-transparent hover:border-[#16a37f]'
                  }`}
                >
                  Sí
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={!isComplete || isSubmitting}
          onClick={handleSubmit}
          className={`w-full py-3.5 font-bold text-xs uppercase tracking-widest rounded-full ${
            isComplete ? 'ola-sh-btn-yellow cursor-pointer' : 'bg-[#dfe2f2] text-[#626a9f] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 7. CAPSTONE MOMENTUM MODAL
// ==========================================
const CapstoneMomentumModal = ({ isOpen, student, onProceed }) => {
  if (!isOpen || !student) return null;

  const currentLevel = student.level ? student.level.split(':')[0].trim() : 'A1';
  const nextLevel =
    currentLevel === 'A1'
      ? 'A2'
      : currentLevel === 'A2'
      ? 'B1'
      : currentLevel === 'B1'
      ? 'B2'
      : currentLevel === 'B2'
      ? 'C1'
      : 'C2';

  const msSinceJoin = new Date().getTime() - new Date(student.created_at || Date.now()).getTime();
  const weeks = Math.max(1, Math.floor(msSinceJoin / (1000 * 60 * 60 * 24 * 7)));
  const estimatedHours = (student.unit || 1) * 3;

  return (
    <div className="fixed inset-0 z-[8500] flex items-center justify-center p-4 bg-[#1e2246]/65 backdrop-blur-xl font-montserrat overflow-y-auto">
      <div className="ola-sh-card-pearl ola-modal-pop w-full max-w-2xl rounded-[2.5rem] p-7 sm:p-10 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-full flex items-center justify-center mb-5">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e2246] tracking-tight mb-2">¡Hito Alcanzado!</h2>
        <p className="text-sm text-[#4c5384] font-medium leading-relaxed mb-6 max-w-md">
          Completaste el último Workbook de tu nivel. Mira todo lo que has logrado con tu constancia:
        </p>

        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="bg-white border border-[#dfe2f2] rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#454d82]">{student.unit}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#626a9f] mt-1">Unidades</div>
          </div>
          <div className="bg-[#fff8e1] border-2 border-[#ffc749] rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1e2246]">~{estimatedHours}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#454d82] mt-1">Horas</div>
          </div>
          <div className="bg-white border border-[#dfe2f2] rounded-2xl p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#128063]">{weeks}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#626a9f] mt-1">Semanas</div>
          </div>
        </div>

        <div className="bg-white border border-[#dfe2f2] rounded-2xl p-5 mb-7 text-left w-full">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#454d82] mb-1.5">¿Qué sigue ahora?</h3>
          <p className="text-xs sm:text-sm text-[#282d57] font-medium leading-relaxed mb-3">
            Te espera tu <strong className="font-bold text-[#1e2246]">Live Lab de cierre</strong> para validar tu dominio y explorar el Nivel {nextLevel}.
          </p>
          <div className="bg-[#fff8e1] p-3 rounded-xl border border-[#ffc749] text-xs font-semibold text-[#1e2246]">
            Al finalizar tu Live Lab de cierre, gestiona tu inscripción de nivel ($10) con soporte para desbloquear el Nivel {nextLevel}.
          </div>
        </div>

        <button
          type="button"
          onClick={onProceed}
          className="ola-sh-btn-yellow w-full py-4 font-bold tracking-widest text-xs uppercase rounded-full cursor-pointer"
        >
          Agendar mi Live Lab Final →
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 8. LIVE CALENDAR BOOKING MODAL
// ==========================================
const StudentCalendar = ({ student, filterType, onConfirm, onCancel }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dayFilter, setDayFilter] = useState('ALL');
  const [hourFilter, setHourFilter] = useState('ALL');

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!student || !filterType) return;
      const baseLevel = student.level ? student.level.split(':')[0].trim() : 'A1';

      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('status', 'available')
        .eq('class_type', filterType)
        .eq('level', baseLevel)
        .eq('unit', student.unit || 1);

      if (!error && data) {
        const mappedData = data.map((slot) => {
          if (slot.scheduled_at && !slot.session_date) {
            const d = new Date(slot.scheduled_at);
            return {
              ...slot,
              session_date: d.toISOString().split('T')[0],
              time_slot: d
                .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                .replace(/^0/, ''),
            };
          }
          return slot;
        });
        setAvailableSlots(mappedData);
      }
    };

    fetchAvailability();
  }, [student, filterType]);

  const getWeekDates = (offsetWeeks) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + offsetWeeks * 7);
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const times = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'];

  const getSlotData = (date, timeStr) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.find((s) => s.session_date === dateStr && s.time_slot === timeStr);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !student) return;
    setIsProcessing(true);

    try {
      const [{ error }] = await Promise.all([
        supabase
          .from('live_sessions')
          .update({
            status: 'booked',
            student_id: student.id,
            unit: student.unit || 1,
          })
          .eq('id', selectedSlot.id),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      if (error) throw error;
      setShowConfirmation(false);
      onConfirm();
    } catch (error) {
      console.error('Booking Error:', error);
      alert('Lo sentimos, este horario ya no está disponible.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-3 sm:p-5 font-montserrat overflow-y-auto"
    >
      {showConfirmation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1e2246]/60 backdrop-blur-md p-4">
          <div className="ola-sh-card-pearl ola-modal-pop rounded-[2rem] p-7 sm:p-9 max-w-md w-full flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full mb-3">
              Usa 1 Crédito de Clase en Vivo
            </span>
            <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-2">Confirmar {filterType}</h2>
            <p className="text-sm font-semibold text-[#454d82] mb-7">
              {selectedSlot?.session_date} • {selectedSlot?.time_slot}
            </p>
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="ola-sh-btn-outline flex-1 py-3.5 font-bold text-xs uppercase rounded-full cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isProcessing}
                className="ola-sh-btn-yellow flex-1 py-3.5 font-bold tracking-widest text-xs uppercase rounded-full disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Reservando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ola-sh-card-pearl ola-modal-pop w-full max-w-5xl rounded-[2.25rem] p-5 sm:p-8 flex flex-col lg:flex-row gap-7 relative">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar calendario"
          className="absolute top-5 right-5 w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] rounded-full flex items-center justify-center text-[#1e2246] transition-all active:scale-90 cursor-pointer"
        >
          <CloseSvg className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col gap-4 pr-8 lg:pr-0">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-[#454d82] text-[#ffc749] px-3 py-1 rounded-full mb-2.5">
              Unidad {student?.unit || 1} • {filterType}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] tracking-tight">
              Agenda tu Clase en Vivo
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#4c5384] font-medium leading-relaxed">
            Selecciona cualquier{' '}
            <strong className="font-bold text-[#1e2246] underline decoration-[#ffc749] decoration-2">
              bloque amarillo disponible
            </strong>{' '}
            para reservar tu sesión con un instructor.
          </p>

          <div className="flex flex-col gap-3 mt-1">
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="w-full p-3.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl text-xs font-bold text-[#1e2246] uppercase tracking-wider outline-none cursor-pointer"
            >
              <option value="ALL">Todos los días (Lun – Sáb)</option>
              {dayNames.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={hourFilter}
              onChange={(e) => setHourFilter(e.target.value)}
              className="w-full p-3.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl text-xs font-bold text-[#1e2246] uppercase tracking-wider outline-none cursor-pointer"
            >
              <option value="ALL">Todos los horarios</option>
              {times.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-[1.6] flex flex-col bg-white rounded-3xl border border-[#dfe2f2] p-4 sm:p-5 relative shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              disabled={currentWeekOffset === 0}
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              className="w-8 h-8 rounded-full bg-[#e8eaf7] hover:bg-[#ffc749] text-[#1e2246] flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-center font-extrabold text-[#1e2246] text-xs sm:text-sm uppercase tracking-widest">
              {currentWeekOffset === 0 ? 'Esta Semana' : currentWeekOffset === 1 ? 'Próxima Semana' : 'En 2 Semanas'}
            </h3>
            <button
              type="button"
              disabled={currentWeekOffset === 2}
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="w-8 h-8 rounded-full bg-[#e8eaf7] hover:bg-[#ffc749] text-[#1e2246] flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {dayNames.map((day, idx) => {
              const dimmed = dayFilter !== 'ALL' && dayFilter !== day;
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center bg-[#454d82] text-white py-2 rounded-xl transition-opacity ${
                    dimmed ? 'opacity-35' : 'opacity-100'
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-widest">{day}</span>
                  <span className="text-[9px] font-semibold text-[#ffc749]">
                    {weekDates[idx].getDate()}/{weekDates[idx].getMonth() + 1}
                  </span>
                </div>
              );
            })}

            {times.map((time, tIdx) => (
              <React.Fragment key={time}>
                {dayNames.map((day, dIdx) => {
                  const slotData = getSlotData(weekDates[dIdx], time);
                  const matchesFilter =
                    (dayFilter === 'ALL' || dayFilter === day) &&
                    (hourFilter === 'ALL' || hourFilter === time);
                  const isAvailable = !!slotData && matchesFilter;

                  return (
                    <button
                      type="button"
                      key={`${dIdx}-${tIdx}`}
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSlot(slotData);
                          setShowConfirmation(true);
                        }
                      }}
                      className={`h-10 sm:h-11 flex items-center justify-center text-[8.5px] sm:text-[10px] font-bold tracking-wide rounded-xl transition-all ${
                        isAvailable
                          ? 'bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5'
                          : 'bg-[#f4f6fc] text-[#626a9f]/45 border border-transparent cursor-not-allowed'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. MAIN STUDENT HUB (Reimagined Architecture)
// ==========================================
const StudentHub = ({ onReturnHome, preloadedStudent }) => {
  const [studentData, setStudentData] = useState(null);
  const [classCredits, setClassCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reminderConfig, setReminderConfig] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState(null);
  const [activeJitsiSession, setActiveJitsiSession] = useState(null);
  const [evalSessionTarget, setEvalSessionTarget] = useState(null);

  const [showGatekeeper, setShowGatekeeper] = useState(false);
  const [gatekeeperData, setGatekeeperData] = useState(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState('LAB SESSION');

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showCapstoneMomentum, setShowCapstoneMomentum] = useState(false);

  const [showInfoBoardModal, setShowInfoBoardModal] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showSeminarRoom, setShowSeminarRoom] = useState(false);

  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [practiceContext, setPracticeContext] = useState(null);
  const [completedActivityType, setCompletedActivityType] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hubToast, setHubToast] = useState(null);

  const showToast = (message, tone = 'success') => {
    setHubToast({ message, tone });
    setTimeout(() => {
      setHubToast((curr) => (curr?.message === message ? null : curr));
    }, 3600);
  };

  const fetchAnnouncements = async (levelFullStr) => {
    if (!levelFullStr) return;
    const levelCode = levelFullStr.split(':')[0].trim();
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .or(`audience.eq.EVERYONE_WITH_STAFF,audience.eq.LEVEL_${levelCode}`)
        .order('created_at', { ascending: false });
      if (!error && data) setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const fetchUpcomingSession = async (studentId) => {
    if (!studentId) return;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('student_id', studentId)
      .in('status', ['booked', 'in_progress'])
      .gte('scheduled_at', yesterday)
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      const d = new Date(data.scheduled_at);
      data.session_date = d.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setActiveLiveSession(data);
    }
  };

  const processBillingReminders = (profile) => {
    if (profile.next_billing_date && profile.payment_status === 'good_standing') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const billDate = new Date(profile.next_billing_date);
      billDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.round((billDate - today) / (1000 * 60 * 60 * 24));
      const reminderKey = `acknowledged_billing_${profile.next_billing_date}_day_${daysLeft}`;

      if ((daysLeft === 5 || daysLeft === 1) && !localStorage.getItem(reminderKey)) {
        setReminderConfig({ days: daysLeft, key: reminderKey });
      }
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (preloadedStudent) {
        setStudentData(preloadedStudent);
        setClassCredits(preloadedStudent.available_credits || 0);
        setLoading(false);
        fetchUpcomingSession(preloadedStudent.id);
        fetchAnnouncements(preloadedStudent.level);
        processBillingReminders(preloadedStudent);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setStudentData(profile);
          setClassCredits(profile.available_credits || 0);
          fetchUpcomingSession(profile.id);
          fetchAnnouncements(profile.level);
          processBillingReminders(profile);
        }
      } catch (err) {
        console.error('Error loading student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [preloadedStudent]);

  const handleStartPractice = (type, unit) => {
    setPracticeContext({ type, unit });
    setIsMetricsModalOpen(false);
    setActiveActivity(type);
  };

  const handleStartActivity = async (type) => {
    if (!studentData) return;

    if (studentData.payment_status === 'pending_first_month') {
      setShowActivationModal(true);
      return;
    }

    if (type === 'Lesson' && studentData.lesson_score >= 75) {
      setCompletedActivityType('Lesson');
      return;
    }
    if (type === 'Workbook' && studentData.workbook_score >= 75) {
      setCompletedActivityType('Workbook');
      return;
    }

    if (type === 'InfoBoard') {
      setShowInfoBoardModal(true);
      return;
    }
    if (type === 'Community_CHAT') {
      setShowSeminarRoom(true);
      return;
    }
    if (type === 'Community_BOARD') {
      setShowCommunity(true);
      return;
    }
    if (type === 'Calendar') {
      setCalendarFilter('LAB SESSION');
      setShowCalendar(true);
      return;
    }
    if (type === 'LiveClass') {
      if (activeLiveSession) {
        setIsFetching(true);
        const { data, error } = await supabase
          .from('live_sessions')
          .select('status')
          .eq('id', activeLiveSession.id)
          .single();
        setIsFetching(false);

        if (error) {
          showToast('Error al verificar la sala: ' + error.message, 'error');
          return;
        }

        if (data && data.status !== 'in_progress') {
          showToast('El profesor está abriendo la sala. Intenta en unos segundos.', 'info');
          return;
        }

        setActiveJitsiSession(activeLiveSession);
      } else {
        showToast('No tienes ninguna clase en vivo programada en este momento.', 'info');
      }
      return;
    }

    setActiveActivity(type);
  };

  const handleActivityComplete = async (type, submissionData) => {
    setActiveActivity(null);

    if (practiceContext) {
      setPracticeContext(null);
      showToast('Sesión de práctica completada. Tus notas oficiales no cambiaron.', 'success');
      return;
    }

    if (submissionData?.security_flag === 'raw_payload') {
      if (submissionData.timeSpentSeconds < 300) {
        alert(
          `Infracción de Seguridad: Actividad completada en tiempo irreal (${submissionData.timeSpentSeconds} segundos). El tiempo mínimo requerido es de 5 minutos. Calificación anulada.`
        );
        return;
      }

      setIsFetching(true);
      try {
        const [{ data: gradedResult, error }] = await Promise.all([
          supabase.functions.invoke('secure-grader', {
            body: { payload: submissionData },
          }),
          new Promise((resolve) => setTimeout(resolve, 650)),
        ]);

        if (error) throw error;

        setGatekeeperData({
          type,
          level: studentData?.level || 'A1',
          unit: studentData?.unit || 1,
          scores: gradedResult.scores,
          average: gradedResult.average,
          passed: gradedResult.passed,
          fails: studentData?.unit_fail_count || 0,
        });
        setShowGatekeeper(true);
      } catch (e) {
        console.error('Failed to process secure grading:', e);
        alert('Hubo un error procesando tu calificación. Por favor contacta a soporte.');
      } finally {
        setIsFetching(false);
      }
    } else {
      alert('Infracción de Seguridad: Formato de envío inválido.');
    }
  };

  const handleGatekeeperProceed = async () => {
    try {
      const isLesson = gatekeeperData.type === 'Lesson';
      const updatePayload = isLesson
        ? { lesson_score: gatekeeperData.average }
        : { workbook_score: gatekeeperData.average };

      await supabase.from('profiles').update(updatePayload).eq('id', studentData.id);
      setStudentData((prev) => ({ ...prev, ...updatePayload }));
      setShowGatekeeper(false);

      if (!isLesson) {
        const CAPSTONE_UNITS = [12, 24, 36, 48, 70, 92];
        if (CAPSTONE_UNITS.includes(Number(studentData.unit || 1))) {
          setShowCapstoneMomentum(true);
        } else {
          setCalendarFilter('LIVE LAB SESSION');
          setShowCalendar(true);
        }
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleRetry = async () => {
    try {
      const newFails = (studentData.unit_fail_count || 0) + 1;
      await supabase.from('profiles').update({ unit_fail_count: newFails }).eq('id', studentData.id);
      setStudentData({ ...studentData, unit_fail_count: newFails });
      setShowGatekeeper(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenMetrics = () => {
    if (studentData?.payment_status === 'pending_first_month') {
      setShowActivationModal(true);
    } else {
      setIsMetricsModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative font-montserrat">
        <HubThemeStyles />
        <HubBackdrop />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <OutLoudIcon className="w-16 h-16 animate-bounce" />
          <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // --- BILLING LOCKOUT INTERCEPTOR ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const billingDate = studentData?.next_billing_date ? new Date(studentData.next_billing_date) : null;
  if (billingDate) billingDate.setHours(0, 0, 0, 0);

  const isLockedOut = billingDate && today >= billingDate;

  if (isLockedOut || studentData?.payment_status === 'processing') {
    return (
      <PaymentLockoutView
        student={studentData}
        onReload={() => window.location.reload()}
      />
    );
  }

  if (activeActivity) {
    const playerStudentData = practiceContext
      ? { ...studentData, unit: practiceContext.unit }
      : studentData;
    return (
      <StudentPlayer
        activityType={activeActivity}
        student={playerStudentData}
        onExit={() => {
          setActiveActivity(null);
          setPracticeContext(null);
        }}
        onComplete={(scores) => handleActivityComplete(activeActivity, scores)}
      />
    );
  }

  // Derived Progress & Scores
  const { progressPercentage, currentUnit, levelTotalUnits, baseLevel } = getProgressData(studentData);
  const lessonScore = studentData?.lesson_score || 0;
  const workbookScore = studentData?.workbook_score || 0;
  const isWorkbookUnlocked = lessonScore >= 75;
  const isLiveNow = activeLiveSession?.status === 'in_progress' || !!activeLiveSession?.meeting_link;
  const filteredAnnouncements = activeCategory
    ? announcements.filter((a) => a.category === activeCategory)
    : announcements;

  const circleRadius = 46;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <div className="ola-sh-root min-h-screen relative font-montserrat text-[#1e2246] pb-28 md:pb-16 overflow-x-hidden">
      <HubThemeStyles />
      <HubBackdrop />

      {/* ==========================================
          1. FLOATING LANDING-STYLE TOP NAVBAR
      ========================================== */}
      <header className="sticky top-0 z-40 px-3.5 sm:px-6 lg:px-10 py-3 lg:py-3.5 bg-[#fdfcf8]/95 lg:bg-white/55 lg:backdrop-blur-2xl border-b-2 border-[#1e2246]/10 lg:border-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Real OutLoud Logo */}
          <button
            type="button"
            onClick={onReturnHome}
            className="flex items-center gap-2 cursor-pointer focus:outline-none hover:opacity-90 transition-opacity shrink-0"
            title="Volver al inicio"
          >
            <OutLoudHorizontalLogo iconClass="w-9 h-9 sm:w-10 sm:h-10" wordmarkClass="h-7 sm:h-8 w-auto" />
          </button>

          {/* Center: Floating White Pill Navigation (Desktop — Mirrors Landing Page) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/95 border border-white rounded-full px-2.5 py-1.5 shadow-[0_10px_28px_-10px_rgba(69,77,130,0.22)]">
            <a
              href="#mi-ruta"
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1e2246] text-[#ffc749]"
            >
              Mi Ruta
            </a>
            <button
              type="button"
              onClick={() => handleStartActivity('Calendar')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              Calendario
            </button>
            <button
              type="button"
              onClick={() => handleStartActivity('LiveClass')}
              className="relative px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              {isLiveNow && (
                <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-pulse" />
              )}
              <span>Clase en Vivo</span>
            </button>
            <button
              type="button"
              onClick={() => handleStartActivity('Community_CHAT')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              Seminario
            </button>
            <button
              type="button"
              onClick={() => handleStartActivity('Community_BOARD')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              Foro
            </button>
          </nav>

          {/* Right: Credits Coin Pill + Profile Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleStartActivity('Calendar')}
              className="inline-flex items-center gap-2 bg-white/95 hover:bg-[#fff8e1] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full px-3 sm:px-4 py-1.5 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  classCredits > 0 ? 'bg-[#16a37f]' : 'bg-[#ee665b] animate-pulse'
                }`}
              />
              <span className="text-[11px] sm:text-xs font-extrabold text-[#1e2246] whitespace-nowrap">
                {classCredits} {classCredits === 1 ? 'Crédito' : 'Créditos'}
              </span>
            </button>

            <button
              type="button"
              onClick={onReturnHome}
              title="Volver al inicio"
              className="inline-flex items-center gap-2 bg-white/95 hover:bg-white border border-white rounded-full p-1 pr-3 shadow-sm cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#1e2246] bg-[#e8eaf7] flex items-center justify-center shrink-0">
                {studentData?.avatar_url ? (
                  <img src={studentData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-extrabold text-[#454d82]">
                    {studentData?.first_name?.[0] || 'O'}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[11px] font-bold text-[#1e2246] max-w-[90px] truncate">
                  {studentData?.first_name || 'Student'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#626a9f] mt-0.5">
                  Nivel {baseLevel}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          2. MAIN EDITORIAL CONTENT CONTAINER
      ========================================== */}
      <main id="mi-ruta" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-7 sm:pt-10 space-y-8 sm:space-y-10">
        {/* HERO WELCOME + TWO-TONE HEADLINE */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/90 border border-white rounded-full px-3.5 py-1.5 shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-[#ffc749] border border-[#1e2246]" />
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#454d82]">
                Nivel {baseLevel} • Unidad {currentUnit} de {levelTotalUnits}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.06]">
              <span className="text-[#1e2246]">Hola, {studentData?.first_name || 'Estudiante'}. </span>
              <span className="text-[#626a9f]">
                Tu voz, lista<span className="text-[#ffc749]">.</span>
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#4c5384] font-medium mt-2 max-w-xl">
              Completa tu Lesson, desbloquea el Workbook y practica en vivo con tu profesor.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleOpenMetrics}
              className="ola-sh-btn-outline px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest cursor-pointer text-center"
            >
              Practice Center
            </button>
            <button
              type="button"
              onClick={() => handleStartActivity('Lesson')}
              disabled={isFetching}
              className="ola-sh-btn-yellow px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest cursor-pointer disabled:opacity-50 text-center"
            >
              {isFetching ? 'Cargando...' : 'Continuar →'}
            </button>
          </div>
        </section>

        {/* DARK-NAVY OPERATIONAL LIVE BAR (Echoing Landing Page Banner) */}
        <section className="bg-[#1e2246] text-white rounded-[1.75rem] px-5 py-4 sm:px-7 sm:py-5 shadow-[0_18px_36px_-14px_rgba(30,34,70,0.45)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isLiveNow
                  ? 'bg-[#16a37f] text-white animate-pulse'
                  : activeLiveSession
                  ? 'bg-[#ffc749] text-[#1e2246]'
                  : 'bg-white/10 text-[#ffc749]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffc749]">
                  {isLiveNow
                    ? 'SALA EN VIVO ABIERTA AHORA'
                    : activeLiveSession
                    ? 'PRÓXIMA CLASE EN VIVO AGENDADA'
                    : 'CLASES EN VIVO • RITMO ESTÁNDAR'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/85 font-medium mt-0.5 truncate">
                {activeLiveSession
                  ? `Live Lab Unidad ${activeLiveSession.unit || currentUnit} — ${activeLiveSession.session_date}`
                  : `Tienes ${classCredits} créditos disponibles este mes. Reserva tu próxima sesión con un instructor.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            {activeLiveSession ? (
              <button
                type="button"
                onClick={() => handleStartActivity('LiveClass')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#ffc749] hover:bg-[#ffd66b] text-[#1e2246] font-extrabold text-[11px] uppercase tracking-widest transition-transform active:scale-95 cursor-pointer"
              >
                {isLiveNow ? 'Entrar a la Sala →' : 'Verificar Sala →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStartActivity('Calendar')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/15 hover:bg-[#ffc749] text-white hover:text-[#1e2246] border border-white/25 hover:border-transparent font-bold text-[11px] uppercase tracking-widest transition-colors cursor-pointer"
              >
                Agendar Live Lab →
              </button>
            )}
          </div>
        </section>

        {/* ==========================================
            3. THE 3-CARD HERO STUDY TRIO
            (Butter-Gold Lesson / Indigo Workbook / Pearl Progress)
        ========================================== */}
        <section className="flex flex-col gap-2.5">
          <div className="lg:hidden flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#454d82]">
              Tu Ruta de Estudio
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#626a9f] bg-white px-2.5 py-0.5 rounded-full border border-[#1e2246]/15">
              Desliza →
            </span>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-3 ola-no-scrollbar lg:grid lg:grid-cols-3 lg:gap-6 lg:mx-0 lg:px-0 lg:pb-0 lg:overflow-visible">
          {/* CARD 1: BUTTER-GOLD HERO — LESSON */}
          <button
            type="button"
            onClick={() => handleStartActivity('Lesson')}
            disabled={isFetching}
            className="ola-sh-card-gold ola-sh-lift group relative rounded-[2rem] lg:rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between text-left overflow-hidden cursor-pointer focus:outline-none w-[84vw] max-w-[345px] shrink-0 snap-center lg:w-auto lg:max-w-none min-h-[340px] lg:min-h-[380px]"
          >
            {/* Subtle Corner Watermark matching Landing Page */}
            <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.09] group-hover:opacity-[0.14] transition-opacity">
              <OutLoudIcon withTile={false} className="w-44 h-44" />
            </div>

            {/* Recessed Top Illustration Well */}
            <div className="relative z-10 w-full h-44 rounded-[1.5rem] bg-white/70 border border-white shadow-inner mb-5">
              <LessonStageIllustration />
            </div>

            {/* Editorial Copy */}
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3 py-1 rounded-full">
                  Paso 1 • Unidad {currentUnit}
                </span>
                {lessonScore >= 75 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-[#16a37f] text-white px-2.5 py-1 rounded-full">
                    <CheckSvg className="w-3 h-3" />
                    <span>{lessonScore}%</span>
                  </span>
                ) : lessonScore > 0 ? (
                  <span className="text-[10px] font-bold uppercase bg-white/90 text-[#1e2246] px-2.5 py-1 rounded-full">
                    {lessonScore}%
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-1.5">
                {isFetching ? 'Cargando...' : 'Lesson'}
              </h2>
              <p className="text-xs sm:text-sm text-[#3b4170] font-medium leading-relaxed">
                Escucha, repite y practica pronunciación interactiva con situaciones reales sin traducir.
              </p>
            </div>

            {/* Bottom Action Bar matching Landing Page Cards */}
            <div className="relative z-10 flex items-center justify-between pt-5 mt-4 border-t border-[#1e2246]/10">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1e2246]">
                {lessonScore >= 75 ? 'Lección Completada' : 'Iniciar Lesson'}
              </span>
              <span className="w-10 h-10 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </button>

          {/* CARD 2: PERIWINKLE-INDIGO HERO — WORKBOOK */}
          <button
            type="button"
            onClick={() => isWorkbookUnlocked && handleStartActivity('Workbook')}
            disabled={!isWorkbookUnlocked || isFetching}
            className={`ola-sh-card-indigo group relative rounded-[2rem] lg:rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between text-left overflow-hidden focus:outline-none w-[84vw] max-w-[345px] shrink-0 snap-center lg:w-auto lg:max-w-none min-h-[340px] lg:min-h-[380px] ${
              isWorkbookUnlocked ? 'ola-sh-lift cursor-pointer' : 'opacity-90 cursor-not-allowed'
            }`}
          >
            {/* Subtle Corner Watermark */}
            <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.12]">
              <OutLoudIcon withTile={false} className="w-44 h-44" />
            </div>

            {/* Recessed Top Illustration Well */}
            <div className="relative z-10 w-full h-44 rounded-[1.5rem] bg-white/15 border border-white/25 flex items-center justify-center mb-5">
              <WorkbookStageIllustration locked={!isWorkbookUnlocked} />
            </div>

            {/* Editorial Copy */}
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full">
                  Paso 2 • Unidad {currentUnit}
                </span>
                {!isWorkbookUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-[#1e2246]/65 text-[#ffc749] px-2.5 py-1 rounded-full">
                    <LockSvg className="w-3 h-3" />
                    <span>75% Lesson</span>
                  </span>
                ) : workbookScore >= 75 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-[#16a37f] text-white px-2.5 py-1 rounded-full">
                    <CheckSvg className="w-3 h-3" />
                    <span>{workbookScore}%</span>
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-1.5">
                Workbook
              </h2>
              <p className="text-xs sm:text-sm text-white/85 font-medium leading-relaxed">
                {isWorkbookUnlocked
                  ? 'Refuerza vocabulario y estructuras con ejercicios dinámicos para preparar tu clase en vivo.'
                  : 'Alcanza al menos 75% en tu Lesson de esta unidad para desbloquear el Workbook interactivo.'}
              </p>
            </div>

            {/* Bottom Action Bar matching Indigo Landing Card */}
            <div className="relative z-10 flex items-center justify-between pt-5 mt-4 border-t border-white/15">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ffc749]">
                {!isWorkbookUnlocked
                  ? 'Bloqueado hasta 75%'
                  : workbookScore >= 75
                  ? 'Workbook Completado'
                  : 'Abrir Workbook'}
              </span>
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#1e2246] transition-transform ${
                  isWorkbookUnlocked
                    ? 'bg-[#ffc749] text-[#1e2246] group-hover:translate-x-1'
                    : 'bg-white/20 text-white/75 border-white/30'
                }`}
              >
                {isWorkbookUnlocked ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                ) : (
                  <LockSvg className="w-4 h-4" />
                )}
              </span>
            </div>
          </button>

          {/* CARD 3: PEARL-WHITE FROSTED — PROGRESS & PRACTICE */}
          <button
            type="button"
            onClick={handleOpenMetrics}
            className="ola-sh-card-pearl ola-sh-lift group relative rounded-[2rem] lg:rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between text-left overflow-hidden cursor-pointer focus:outline-none w-[84vw] max-w-[345px] shrink-0 snap-center lg:w-auto lg:max-w-none min-h-[340px] lg:min-h-[380px]"
          >
            {/* Recessed Top Progress Ring Stage */}
            <div className="relative z-10 w-full h-44 rounded-[1.5rem] bg-[#f4f6fc] border border-white shadow-inner flex items-center justify-center gap-5 px-4 mb-5">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r={circleRadius} stroke="rgba(98,106,159,0.18)" strokeWidth="9" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r={circleRadius}
                    stroke="url(#olaShProgGrad)"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="olaShProgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#626a9f" />
                      <stop offset="100%" stopColor="#ffc749" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-[#1e2246] leading-none">
                    {progressPercentage}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#626a9f] mt-1">
                    Nivel {baseLevel}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-1 rounded-full text-center">
                  Unidad {currentUnit}/{levelTotalUnits}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e7faf3] text-[#128063] px-2.5 py-1 rounded-full text-center">
                  Repaso 24/7
                </span>
              </div>
            </div>

            {/* Editorial Copy */}
            <div className="relative z-10 flex-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-3 py-1 rounded-full mb-2.5">
                Analíticas &amp; Repaso
              </span>
              <h2 className="text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-1.5">
                Tu Progreso
              </h2>
              <p className="text-xs sm:text-sm text-[#4c5384] font-medium leading-relaxed">
                Revisa tu radar de habilidades, observaciones de profesores y repasa unidades anteriores en el Practice Center.
              </p>
            </div>

            {/* Bottom Action Bar */}
            <div className="relative z-10 flex items-center justify-between pt-5 mt-4 border-t border-[#626a9f]/15">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#454d82]">
                Ver Métricas y Práctica
              </span>
              <span className="w-10 h-10 rounded-full bg-[#626a9f] text-white flex items-center justify-center shadow-md group-hover:bg-[#1e2246] group-hover:translate-x-1 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </button>
          </div>
        </section>

        {/* ==========================================
            4. QUICK-ACCESS BENTO ROW
            (Mirroring Cohortes / Ventajas / Tarifas from Landing Page)
        ========================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BENTO A: CALENDARIO & LIVE LABS */}
          <button
            type="button"
            onClick={() => handleStartActivity('Calendar')}
            className="ola-sh-card-pearl ola-sh-lift group rounded-[2rem] p-5 flex flex-col justify-between text-left cursor-pointer focus:outline-none"
          >
            <div className="w-full h-32 rounded-[1.35rem] bg-[#f4f6fc] border border-white flex items-center justify-center mb-4">
              <CalendarBentoIllustration hasSession={!!activeLiveSession} />
            </div>
            <div>
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-1 rounded-full mb-2">
                Agenda En Vivo
              </span>
              <h3 className="text-base font-extrabold text-[#1e2246] uppercase tracking-tight mb-1">
                Reserva tu Live Lab
              </h3>
              <p className="text-xs text-[#4c5384] font-medium leading-relaxed">
                {activeLiveSession
                  ? `Próxima sesión: ${activeLiveSession.session_date}. Toca para ver horarios.`
                  : 'Elige día y hora con nuestros instructores usando tus créditos activos.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#626a9f]/12">
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#1e2246]">
                Abrir Calendario
              </span>
              <span className="w-8 h-8 rounded-full bg-[#ffc749] border border-[#1e2246] text-[#1e2246] flex items-center justify-center text-xs font-extrabold">
                →
              </span>
            </div>
          </button>

          {/* BENTO B: COMUNIDAD OUTLOUD (SEMINARIO + FORO) */}
          <div className="ola-sh-card-cream ola-sh-lift group rounded-[2rem] p-5 flex flex-col justify-between text-left">
            <div className="w-full h-32 rounded-[1.35rem] bg-white/80 border border-white flex items-center justify-center mb-4">
              <CommunityBentoIllustration />
            </div>
            <div>
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#ffc749] text-[#1e2246] px-2.5 py-1 rounded-full mb-2">
                Comunidad 24/7
              </span>
              <h3 className="text-base font-extrabold text-[#1e2246] uppercase tracking-tight mb-1">
                Seminario &amp; Foro Q&amp;A
              </h3>
              <p className="text-xs text-[#4c5384] font-medium leading-relaxed">
                Practica en salas de chat en inglés o resuelve dudas y participa en debates con otros alumnos.
              </p>
            </div>
            <div className="flex gap-2 pt-4 mt-4 border-t border-[#1e2246]/10">
              <button
                type="button"
                onClick={() => handleStartActivity('Community_CHAT')}
                className="flex-1 py-2.5 px-3 rounded-full bg-[#1e2246] hover:bg-[#454d82] text-[#ffc749] text-[10.5px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Chat Room
              </button>
              <button
                type="button"
                onClick={() => handleStartActivity('Community_BOARD')}
                className="flex-1 py-2.5 px-3 rounded-full bg-white hover:bg-[#fff3d1] text-[#1e2246] border border-[#1e2246] text-[10.5px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Foro Q&amp;A
              </button>
            </div>
          </div>

          
        </section>

        {/* ==========================================
            5. EDITORIAL OFFICIAL INFO BOARD
        ========================================== */}
        <section className="ola-sh-card-pearl rounded-[2.25rem] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#626a9f]/15">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#ffc749] border-2 border-[#1e2246]" />
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1e2246] uppercase tracking-tight leading-none">
                  Cartelera Oficial OutLoud
                </h2>
                <p className="text-[10.5px] font-semibold text-[#626a9f] mt-0.5">
                  Avisos académicos, eventos, reglas y beneficios
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeCategory && (
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="px-3 py-1.5 rounded-full bg-[#ee665b]/12 text-[#c93f34] text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  ✕ Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStartActivity('InfoBoard')}
                className="px-4 py-1.5 rounded-full bg-white hover:bg-[#1e2246] text-[#1e2246] hover:text-[#ffc749] border border-[#dfe2f2] text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Ver todo ⤢
              </button>
            </div>
          </div>

          {/* Horizontal Instant Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5 custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer border ${
                !activeCategory
                  ? 'bg-[#1e2246] border-[#1e2246] text-[#ffc749]'
                  : 'bg-white border-white text-[#454d82] hover:border-[#626a9f]/35'
              }`}
            >
              Todos ({announcements.length})
            </button>
            {INFO_CATEGORIES.map((cat) => {
              const hasPosts = announcements.some((a) => a.category === cat);
              const isSelected = activeCategory === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActiveCategory(isSelected ? null : cat)}
                  className={`relative px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer border inline-flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1e2246] border-[#1e2246] text-[#ffc749]'
                      : 'bg-white border-white text-[#454d82] hover:border-[#626a9f]/35'
                  }`}
                >
                  <span>{cat}</span>
                  {hasPosts && !isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#ee665b]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacious 2-Column Announcement Cards */}
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white/65 rounded-2xl border border-white py-10 text-center text-xs font-bold uppercase tracking-widest text-[#626a9f]">
              No hay anuncios publicados en esta categoría.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnnouncements.slice(0, 4).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => handleStartActivity('InfoBoard')}
                  className="bg-white/90 hover:bg-white border border-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  {ann.image_url && (
                    <div className="w-full sm:w-28 h-36 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-[#dfe2f2]">
                      <img
                        src={ann.image_url}
                        alt="Cover"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full truncate">
                        {ann.category || 'Aviso'}
                      </span>
                      {ann.created_at && (
                        <span className="text-[10px] font-semibold text-[#626a9f] shrink-0">
                          {new Date(ann.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#1e2246] mb-1 truncate">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-[#4c5384] font-medium leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {ann.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==========================================
            6. SUPPORT & SOCIALS FOOTER STRIP
            (Mirroring the Landing Page Payment Strip)
        ========================================== */}
        <footer className="bg-white/85 backdrop-blur-xl border-2 border-white rounded-[1.75rem] px-5 py-4 sm:px-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#e7faf3] border border-[#16a37f]/40 text-[#128063] flex items-center justify-center shrink-0">
              <WhatsAppSvg className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#1e2246]">
                Soporte Estudiantil OutLoud
              </p>
              <p className="text-xs text-[#4c5384] font-medium">
                Asistencia con tus clases en vivo, créditos o pagos en moneda local.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://wa.me/584226885683"
              target="_blank"
              rel="noreferrer"
              className="ola-sh-btn-outline px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <WhatsAppSvg className="w-3.5 h-3.5 text-[#16a37f]" />
              <span>Solicitar Ayuda</span>
            </a>

            <div className="flex items-center gap-1.5 pl-1">
              {SOCIAL_LINKS.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={soc.name}
                  className="w-9 h-9 rounded-full bg-[#f4f6fc] hover:bg-[#454d82] text-[#454d82] hover:text-white flex items-center justify-center transition-colors"
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>

      {/* ==========================================
7. MOBILE FLOATING EDITORIAL CAPSULE DOCK
      ========================================== */}
      <nav
        className="lg:hidden fixed bottom-3 left-2.5 right-2.5 bg-[#fdfcf8] border-2 border-[#1e2246] rounded-[1.75rem] flex items-center justify-between px-1.5 py-1.5 z-50 shadow-[0_5px_0_#1e2246,0_14px_28px_-8px_rgba(30,34,70,0.32)]"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          type="button"
          onClick={() => handleStartActivity('Calendar')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Agenda</span>
        </button>

        <button
          type="button"
          onClick={() => handleStartActivity('LiveClass')}
          className="relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          {isLiveNow && <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#16a37f] animate-pulse" />}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">En Vivo</span>
        </button>

        <button
          type="button"
          onClick={() => handleStartActivity('Community_CHAT')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => handleStartActivity('Community_BOARD')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Foro</span>
        </button>

        <button
          type="button"
          onClick={handleOpenMetrics}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] -translate-y-0.5 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Práctica</span>
        </button>
      </nav>

      {/* ==========================================
          8. TOASTS, MODALS & OVERLAYS
      ========================================== */}
      {hubToast && (
        <div className="ola-toast-pop fixed bottom-24 lg:bottom-8 left-1/2 z-[9500] px-5 py-3 rounded-full bg-[#1e2246] text-white border-2 border-[#ffc749] shadow-2xl flex items-center gap-2.5 text-xs font-bold max-w-[92vw]">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              hubToast.tone === 'error'
                ? 'bg-[#ee665b]'
                : hubToast.tone === 'info'
                ? 'bg-[#ffc749]'
                : 'bg-[#16a37f]'
            }`}
          />
          <span>{hubToast.message}</span>
        </div>
      )}

      {/* BILLING REMINDER MODAL */}
      {reminderConfig !== null && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat">
          <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.25rem] w-full max-w-md p-7 sm:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-3">Aviso de Facturación</h2>
            <div className="bg-white border border-[#dfe2f2] rounded-2xl p-4 mb-6 w-full">
              <p className="text-sm font-medium text-[#282d57] leading-relaxed mb-3">
                Tu próximo corte de facturación es en{' '}
                <strong className="font-extrabold text-[#454d82] text-base">
                  {reminderConfig.days} {reminderConfig.days === 1 ? 'día' : 'días'}
                </strong>
                .
              </p>
              <p className="text-[11px] font-bold text-[#9b2c23] bg-[#ee665b]/12 py-2 px-3 rounded-xl border border-[#ee665b]/30">
                No aceptamos pagos por adelantado. Recuerda usar tus créditos antes del corte (no acumulativos).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(reminderConfig.key, 'true');
                setReminderConfig(null);
              }}
              className="ola-sh-btn-yellow w-full py-3.5 font-bold tracking-widest text-xs uppercase rounded-full cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED ACTIVITY MODAL */}
      {completedActivityType && (
        <div
          onClick={(e) => e.target === e.currentTarget && setCompletedActivityType(null)}
          className="fixed inset-0 z-[700] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat"
        >
          <div className="ola-sh-card-pearl ola-modal-pop rounded-[2.25rem] p-7 sm:p-9 max-w-md w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#16a37f] text-white border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-full flex items-center justify-center mb-5">
              <CheckSvg className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1e2246] tracking-tight mb-3">
              ¡Actividad Completada!
            </h2>
            <p className="text-[#4c5384] font-medium text-sm leading-relaxed mb-7">
              Ya aprobaste el <strong className="font-bold text-[#1e2246]">{completedActivityType}</strong> de esta unidad. Entra al <strong className="font-bold text-[#454d82]">Practice Center</strong> para repasar libremente sin alterar tu calificación oficial.
            </p>
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <button
                type="button"
                onClick={() => setCompletedActivityType(null)}
                className="ola-sh-btn-outline flex-1 py-3.5 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer"
              >
                Entendido
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompletedActivityType(null);
                  setIsMetricsModalOpen(true);
                }}
                className="ola-sh-btn-yellow flex-1 py-3.5 font-bold tracking-widest text-xs uppercase rounded-full cursor-pointer"
              >
                Practice Center
              </button>
            </div>
          </div>
        </div>
      )}

      <StudentMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        student={studentData}
        onStartPractice={handleStartPractice}
      />

      <LevelCompleteOverlay student={studentData} />

      {activeJitsiSession && (
        <JitsiRoom
          session={activeJitsiSession}
          onLeave={(needsEval) => {
            const sessionData = activeJitsiSession;
            setActiveJitsiSession(null);
            if (needsEval === true) setEvalSessionTarget(sessionData);
          }}
        />
      )}

      <TeacherEvaluationModal
        isOpen={!!evalSessionTarget}
        session={evalSessionTarget}
        onClose={() => setEvalSessionTarget(null)}
      />

      {/* FULL-SCREEN INFO BOARD MODAL */}
      {showInfoBoardModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowInfoBoardModal(false)}
          className="fixed inset-0 z-[650] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 md:p-10 font-montserrat"
        >
          <div className="ola-sh-card-pearl ola-modal-pop w-full h-full max-w-5xl rounded-[2.25rem] flex flex-col overflow-hidden">
            <div className="h-16 md:h-20 border-b border-[#626a9f]/15 bg-white/75 px-6 md:px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#ffc749] border-2 border-[#1e2246]" />
                <div>
                  <h2 className="text-sm md:text-lg font-extrabold uppercase tracking-tight text-[#1e2246]">
                    Cartelera Oficial OutLoud
                  </h2>
                  <p className="text-[10px] text-[#626a9f] font-bold uppercase tracking-widest">
                    Actualizaciones y Comunicados
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoBoardModal(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] cursor-pointer transition-all active:scale-90"
              >
                <CloseSvg className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 md:px-8 border-b border-[#626a9f]/15 bg-white/45 shrink-0">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`px-3.5 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-wider border cursor-pointer ${
                    !activeCategory
                      ? 'bg-[#1e2246] border-[#1e2246] text-[#ffc749]'
                      : 'bg-white border-white text-[#454d82]'
                  }`}
                >
                  Todos ({announcements.length})
                </button>
                {INFO_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-3.5 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-wider border cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#1e2246] border-[#1e2246] text-[#ffc749]'
                        : 'bg-white border-white text-[#454d82]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#626a9f] font-bold uppercase tracking-widest text-xs py-16">
                  No hay anuncios en esta categoría.
                </div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white border border-[#dfe2f2] rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-sm"
                  >
                    {ann.image_url && (
                      <div className="w-full sm:w-40 h-44 sm:h-40 rounded-xl overflow-hidden shrink-0 border border-[#dfe2f2]">
                        <img src={ann.image_url} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col w-full text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1e2246] bg-[#fff3d1] border border-[#ffc749] px-2.5 py-0.5 rounded-full">
                          {ann.category || 'Aviso'}
                        </span>
                        {ann.created_at && (
                          <span className="text-[10px] font-semibold text-[#626a9f]">
                            {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base lg:text-lg font-extrabold text-[#1e2246] mb-2">{ann.title}</h4>
                      <p className="text-xs lg:text-sm text-[#3b4170] leading-relaxed font-normal whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showCommunity && (
        <div className="fixed inset-0 z-[650] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 md:p-10 font-montserrat">
          <div className="w-full h-full max-w-7xl relative shadow-2xl rounded-[2.5rem]">
            <ForumBoard
              currentUser={{
                id: studentData.id,
                role: 'student',
                level: studentData.level || 'A1',
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                avatar_url: studentData.avatar_url,
              }}
              onClose={() => setShowCommunity(false)}
            />
          </div>
        </div>
      )}

      {showSeminarRoom && (
        <div className="fixed inset-0 z-[650] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 md:p-10 font-montserrat">
          <div className="w-full h-full max-w-7xl relative shadow-2xl rounded-[2.5rem]">
            <SeminarRoom
              currentUser={{
                id: studentData.id,
                full_name: `${studentData.first_name} ${studentData.last_name}`,
                avatar_url: studentData.avatar_url,
                level: studentData.level,
              }}
              userRole="student"
              onClose={() => setShowSeminarRoom(false)}
            />
          </div>
        </div>
      )}


      {showGatekeeper && (
        <EvaluationCrossroad
          data={gatekeeperData}
          onProceed={handleGatekeeperProceed}
          onRetry={handleRetry}
          onScheduleComplementary={() => {
            setShowGatekeeper(false);
            setCalendarFilter('COMPLEMENTARY CLASS');
            setShowCalendar(true);
          }}
          onScheduleTutoring={() => {
            setShowGatekeeper(false);
            setCalendarFilter('1-ON-1 TUTORING');
            setShowCalendar(true);
          }}
        />
      )}

      {showCapstoneMomentum && (
        <CapstoneMomentumModal
          isOpen={showCapstoneMomentum}
          student={studentData}
          onProceed={() => {
            setShowCapstoneMomentum(false);
            setCalendarFilter('LIVE LAB SESSION');
            setShowCalendar(true);
          }}
        />
      )}

      {showCalendar && (
        <StudentCalendar
          student={studentData}
          filterType={calendarFilter}
          onCancel={() => setShowCalendar(false)}
          onConfirm={() => {
            setShowCalendar(false);
            fetchUpcomingSession(studentData.id);
            showToast('¡Reserva confirmada exitosamente!', 'success');
          }}
        />
      )}

      {showActivationModal && (
        <PaymentLockoutView
          student={studentData}
          onReload={() => window.location.reload()}
          isDismissible={true}
          onClose={() => setShowActivationModal(false)}
        />
      )}
    </div>
  );
};

export default StudentHub;