import React, { useState, useEffect } from 'react';
import { OutLoudIcon, OutLoudHorizontalLogo } from './components/OutLoudBrand';
import LoginModal from './components/LoginModal';
import LandingMethodSection from './components/LandingMethodSection';
import LandingLevelsAndPlans from './components/LandingLevelsAndPlans';
import LandingTrialAndEnroll from './components/LandingTrialAndEnroll';

const NAV_LINKS = [
  { label: 'Método', href: '#method' },
  { label: 'Ciclo', href: '#cycle' },
  { label: 'Niveles', href: '#levels' },
  { label: 'Planes', href: '#plans' },
  { label: 'Prueba Gratis', href: '#free-trial' },
  { label: 'Inscribirse', href: '#enroll' },
];

export default function LandingPage({
  onLogin,
  onInfoClick,
  onPlacementClick,
  onFreeLessonClick,
  onRegisterClick,
}) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (href) => {
    setIsMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen w-full text-[#23274d] font-montserrat overflow-x-hidden relative selection:bg-[#ffc749] selection:text-[#23274d] bg-gradient-to-br from-[#eceffa] via-[#f8f8fe] to-[#fff7e2]">
      {/* ================================================== */}
      {/* SELF-CONTAINED DESIGN ENGINE (Guaranteed to Load)  */}
      {/* ================================================== */}
      <style>{`
        :root {
          --ola-yellow: #ffc749;
          --ola-yellow-deep: #f0b32b;
          --ola-yellow-soft: #fff3d1;
          --ola-indigo: #626a9f;
          --ola-indigo-dark: #4c5384;
          --ola-ink: #23274d;
          --ola-ink-muted: #60668a;
          --ola-bg: #f6f7fc;
          --ola-lavender-soft: #e8eaf7;
          --ola-surface: #ffffff;
          --ola-border: #dfe2f2;
          --ola-mint: #16a37f;
          --ola-coral: #ee665b;
        }

        html { scroll-behavior: smooth; }

        /* Living Mesh Orbs */
        @keyframes olaDriftA {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes olaDriftB {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-45px, 25px) scale(1.1); }
        }
        @keyframes olaDriftC {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(25px, -35px) scale(1.06); }
        }
        @keyframes olaFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        @keyframes olaFloatAlt {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(7px) rotate(2deg); }
        }
        @keyframes olaHeroEq {
          0%, 100% { transform: scaleY(0.32); }
          50% { transform: scaleY(1); }
        }

        .ola-orb-a { animation: olaDriftA 14s ease-in-out infinite; }
        .ola-orb-b { animation: olaDriftB 17s ease-in-out infinite; }
        .ola-orb-c { animation: olaDriftC 15s ease-in-out infinite; }
        .ola-float-slow { animation: olaFloatSlow 4.2s ease-in-out infinite; }
        .ola-float-alt { animation: olaFloatAlt 5.2s ease-in-out infinite; }
        .ola-hero-eq { transform-origin: center; animation: olaHeroEq 1.1s ease-in-out infinite; }

        /* Tactile Backlit Primary Yellow Button */
        .ola-btn-yellow {
          background: linear-gradient(180deg, #ffd466 0%, #ffc749 100%);
          color: #23274d;
          border: 2px solid #23274d;
          box-shadow: 0 5px 0 #23274d, 0 12px 28px -4px rgba(255, 199, 73, 0.65);
          transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.16s ease, filter 0.16s ease;
        }
        .ola-btn-yellow:hover {
          filter: brightness(1.04);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 0 #23274d, 0 18px 34px -4px rgba(255, 199, 73, 0.85);
        }
        .ola-btn-yellow:active {
          transform: translateY(2px) scale(0.99);
          box-shadow: 0 2px 0 #23274d, 0 6px 14px -4px rgba(255, 199, 73, 0.5);
        }

        /* Tactile Frosted Outline Button */
        .ola-btn-outline {
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #23274d;
          border: 2px solid #23274d;
          box-shadow: 0 5px 0 rgba(35, 39, 77, 0.22), 0 10px 24px -8px rgba(98, 106, 159, 0.32);
          transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.16s ease, background-color 0.16s ease;
        }
        .ola-btn-outline:hover {
          background: rgba(255, 255, 255, 0.96);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 7px 0 #626a9f, 0 16px 32px -8px rgba(98, 106, 159, 0.45);
        }
        .ola-btn-outline:active {
          transform: translateY(2px) scale(0.99);
          box-shadow: 0 2px 0 rgba(35, 39, 77, 0.25);
        }

        /* Glassmorphism Card with Ambient Backlight */
        .ola-card {
          background: rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 14px 36px -12px rgba(98, 106, 159, 0.24), inset 0 1px 1px rgba(255, 255, 255, 0.95);
          transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.24s ease, border-color 0.24s ease, background-color 0.24s ease;
        }
        .ola-card:hover {
          background: rgba(255, 255, 255, 0.88);
          transform: translateY(-5px);
          border-color: rgba(98, 106, 159, 0.45);
          box-shadow: 0 22px 44px -12px rgba(98, 106, 159, 0.35), 0 0 28px -6px rgba(255, 199, 73, 0.45), inset 0 1px 1px #ffffff;
        }

        /* Dynamic Reactive Clickable Text Link */
        .ola-reactive-text {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: color 0.18s ease, transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ola-reactive-text::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 100%;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, #ffc749, #626a9f);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ola-reactive-text:hover {
          color: #23274d;
          transform: translateY(-1px);
        }
        .ola-reactive-text:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      {/* ================================================== */}
      {/* LIVING DYNAMIC AMBIENT BACKGROUND CANVAS           */}
      {/* ================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Drifting Luminous Backlight Mesh Orbs */}
        <div
          className="ola-orb-a absolute -top-28 -left-24 w-[440px] h-[440px] sm:w-[620px] sm:h-[620px] rounded-full blur-[95px]"
          style={{ background: 'radial-gradient(circle, rgba(255,199,73,0.42) 0%, rgba(255,243,209,0) 70%)' }}
        />
        <div
          className="ola-orb-b absolute top-[14%] -right-28 w-[460px] h-[460px] sm:w-[680px] sm:h-[680px] rounded-full blur-[105px]"
          style={{ background: 'radial-gradient(circle, rgba(98,106,159,0.34) 0%, rgba(168,176,222,0) 70%)' }}
        />
        <div
          className="ola-orb-c absolute bottom-[-10%] left-[22%] w-[460px] h-[460px] sm:w-[640px] sm:h-[640px] rounded-full blur-[110px]"
          style={{ background: 'radial-gradient(circle, rgba(168,176,222,0.42) 0%, rgba(255,199,73,0.16) 45%, rgba(246,247,252,0) 72%)' }}
        />

        {/* Crisp Architectural Dot-Matrix Grid */}
        <div
          className="absolute inset-0 opacity-65"
          style={{
            backgroundImage: 'radial-gradient(rgba(98, 106, 159, 0.16) 1.3px, transparent 1.3px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient Floating Soundwave Ribbon SVG */}
        <svg
          className="absolute top-[38%] left-0 w-full h-44 opacity-[0.14]"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 110 Q 180 30, 360 110 T 720 110 T 1080 110 T 1440 110"
            stroke="#626a9f"
            strokeWidth="3"
          />
          <path
            d="M0 135 Q 200 185, 400 120 T 820 120 T 1200 135 T 1440 95"
            stroke="#ffc749"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* ================================================== */}
      {/* STICKY FROSTED GLASS HEADER                        */}
      {/* ================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-[500] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/75 backdrop-blur-2xl border-b-2 border-white/80 shadow-[0_12px_32px_-12px_rgba(98,106,159,0.3)] py-2.5'
            : 'bg-white/30 backdrop-blur-md border-b border-white/50 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Optically Aligned, Enlarged Brand Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer focus:outline-none shrink-0"
          >
            <OutLoudHorizontalLogo
              iconClass="w-11 h-11 sm:w-12 sm:h-12"
              wordmarkClass="h-9 sm:h-11 w-auto"
            />
          </button>

          {/* Desktop Frosted Glass Nav Pill */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-xl border-2 border-white/90 rounded-full px-2.5 py-1.5 shadow-[0_8px_24px_-10px_rgba(98,106,159,0.28)]">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="group relative px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider text-[#4c5384] hover:text-[#23274d] hover:bg-[#fff3d1] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative z-10">{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Actions: Placement Test + Unmistakable Yellow Log In */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onPlacementClick}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-[#626a9f] hover:text-[#23274d] bg-white/75 hover:bg-[#e8eaf7] backdrop-blur-xl border-2 border-[#626a9f]/30 hover:border-[#23274d] shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Placement Test</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="ola-btn-yellow bg-[#ffc749] text-[#23274d] border-2 border-[#23274d] px-5 sm:px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>Log In</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="lg:hidden w-10 h-10 rounded-full bg-white/80 backdrop-blur-xl border-2 border-[#23274d] flex items-center justify-center text-[#23274d] cursor-pointer shadow-sm"
            >
              {isMobileMenuOpen ? (
                <span className="font-black text-sm">✕</span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Frosted Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 mx-4 bg-white/90 backdrop-blur-2xl border-2 border-[#23274d] rounded-3xl shadow-[0_12px_0_#23274d] p-4 flex flex-col gap-1.5 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#23274d] hover:bg-[#fff3d1] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="h-px bg-[#dfe2f2] my-1" />
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onPlacementClick?.();
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#626a9f] hover:bg-[#e8eaf7] transition-colors"
            >
              Take Placement Test →
            </button>
          </div>
        )}
      </header>

      {/* ================================================== */}
      {/* HERO SECTION (Backlit Glass + Expressive Personality) */}
      {/* ================================================== */}
      <section className="relative z-10 pt-28 pb-12 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Editorial Headline, Reactive CTAs & Backlit Stat Chips */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 bg-white/75 backdrop-blur-xl border-2 border-white/90 rounded-full px-4 py-1.5 mb-6 shadow-[0_8px_20px_-8px_rgba(98,106,159,0.3)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f] animate-pulse shadow-[0_0_8px_#16a37f]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#626a9f]">
                  OutLoud Language Academy • CEFR A1–C2
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-[#23274d] leading-[1.03] tracking-tight mb-6">
                Your Voice,{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#626a9f]">Amplified.</span>
                  <span className="absolute -left-1 -right-1 bottom-1.5 h-4 bg-[#ffc749]/90 -z-0 rounded-full -rotate-1" />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#4c5384] font-medium leading-relaxed max-w-xl mb-8">
                Aprende inglés hablando desde el primer día. Lecciones interactivas 24/7, práctica vocal instantánea y clases <strong className="font-black text-[#23274d]">100% en vivo</strong> diseñadas para que dejes de traducir en tu cabeza.
              </p>

              {/* Primary Tactile CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  className="ola-btn-yellow bg-[#ffc749] text-[#23274d] border-2 border-[#23274d] w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2.5 group"
                >
                  <span>Try Free Lesson</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('#plans')}
                  className="ola-btn-outline bg-white/80 text-[#23274d] border-2 border-[#23274d] w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer"
                >
                  Explore Plans
                </button>
              </div>

              {/* Reactive Quick-Jump Link */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => scrollToSection('#cycle')}
                  className="ola-reactive-text text-xs font-black uppercase tracking-widest text-[#626a9f] cursor-pointer group"
                >
                  <span>Descubre cómo funciona el ciclo en 5 pasos</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </div>

              {/* Backlit Frosted Glass Metric Cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-9 w-full max-w-lg">
                {[
                  { value: '6', label: 'Niveles CEFR', glow: 'from-[#ffc749]/40 to-transparent' },
                  { value: '92', label: 'Unidades', glow: 'from-[#626a9f]/35 to-transparent' },
                  { value: 'Live', label: 'Teacher Labs', glow: 'from-[#16a37f]/30 to-transparent' },
                ].map((stat) => (
                  <div key={stat.label} className="relative group">
                    <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${stat.glow} blur-lg opacity-60 group-hover:opacity-100 transition-opacity -z-10`} />
                    <div className="bg-white/70 backdrop-blur-xl border-2 border-white/90 rounded-2xl p-3.5 sm:p-4 text-center shadow-sm group-hover:-translate-y-1 transition-transform">
                      <div className="text-2xl sm:text-3xl font-black text-[#23274d] leading-none">{stat.value}</div>
                      <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#626a9f] mt-1.5">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Populated, Backlit Brand World Stage */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-[330px] h-[360px] sm:w-[480px] sm:h-[460px] flex items-center justify-center">
                {/* Luminous Multi-Color Backlight Behind Centerpiece */}
                <div
                  className="absolute w-[290px] h-[290px] sm:w-[400px] sm:h-[400px] rounded-full blur-3xl opacity-75 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,199,73,0.45) 0%, rgba(98,106,159,0.38) 55%, transparent 75%)',
                  }}
                />

                {/* Outer Frosted Glass Halo Ring */}
                <div className="w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full bg-white/45 backdrop-blur-md border-2 border-white/80 shadow-[0_20px_50px_-15px_rgba(98,106,159,0.28)] absolute" />

                {/* Floating Audio Pill (Top-Left) */}
                <div className="ola-float-slow absolute top-3 left-0 sm:top-5 sm:left-2 z-20 bg-[#fff3d1]/90 backdrop-blur-xl border-2 border-[#ffc749] rounded-full px-4 py-2 shadow-[0_12px_25px_-8px_rgba(255,199,73,0.65)] flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#626a9f] flex items-center justify-center shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-[#ffc749] animate-ping" />
                  </span>
                  <div className="flex items-center gap-[3px] h-4">
                    {[10, 16, 8, 14, 11, 7].map((h, i) => (
                      <span
                        key={i}
                        className="ola-hero-eq w-[3px] rounded-full bg-[#626a9f]"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.14}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#23274d] hidden sm:inline">
                    Live Audio
                  </span>
                </div>

                {/* Floating Conversational Speech Card (Top-Right) */}
                <div className="ola-float-alt absolute top-2 right-0 sm:top-6 sm:right-0 z-20 bg-white/80 backdrop-blur-xl border-2 border-white rounded-2xl px-4 py-2.5 shadow-[0_14px_30px_-10px_rgba(98,106,159,0.35)] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#626a9f] text-[#ffc749] font-black text-xs flex items-center justify-center shrink-0">
                    EN
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-[#23274d] leading-tight">&ldquo;Speak OutLoud!&rdquo;</p>
                    <p className="text-[9px] font-bold text-[#626a9f] uppercase tracking-wider">Sin traducir</p>
                  </div>
                </div>

                {/* Left & Right Radiating Equalizer Waves */}
                <div className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  {[14, 28, 18, 42, 24, 48, 20].map((h, i) => (
                    <span
                      key={`hl-${i}`}
                      className="ola-hero-eq w-1.5 rounded-full shadow-sm"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 3 === 0 ? '#ffc749' : '#626a9f',
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  {[20, 48, 24, 42, 18, 28, 14].map((h, i) => (
                    <span
                      key={`hr-${i}`}
                      className="ola-hero-eq w-1.5 rounded-full shadow-sm"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 3 === 0 ? '#ffc749' : '#626a9f',
                        animationDelay: `${(6 - i) * 0.12}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Interactive Centerpiece Headphone Emblem */}
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  title="Probar Lección Gratis"
                  className="relative z-20 ola-float-slow cursor-pointer group focus:outline-none"
                >
                  <OutLoudIcon className="w-40 h-40 sm:w-52 sm:h-52 drop-shadow-[0_24px_34px_rgba(98,106,159,0.34)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]" />
                </button>

                {/* Floating Bottom-Left Glass Chip */}
                <div className="ola-float-alt absolute bottom-5 left-0 sm:bottom-6 sm:left-2 z-20 bg-white/80 backdrop-blur-xl border-2 border-white rounded-2xl px-3.5 py-2.5 shadow-[0_14px_30px_-10px_rgba(98,106,159,0.3)] flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#16a37f]/15 text-[#16a37f] font-black text-xs flex items-center justify-center">
                    ✓
                  </span>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-[#23274d] leading-tight">100% En Vivo</p>
                    <p className="text-[9px] font-bold text-[#60668a] uppercase tracking-wider">Profesores Reales</p>
                  </div>
                </div>

                {/* Floating Bottom-Right Geometric Pattern */}
                <div className="ola-float-slow absolute bottom-4 right-2 sm:bottom-5 sm:right-6 z-20 bg-[#626a9f]/90 backdrop-blur-xl border-2 border-white/30 rounded-2xl px-4 py-2.5 shadow-[0_14px_28px_-8px_rgba(98,106,159,0.5)] text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ffc749]">Acceso 24/7</p>
                  <p className="text-xs font-bold leading-tight">Chat • Foros • Labs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* STAGE 2: COURSE INFO HERO CARDS + 5-STEP CYCLE     */}
      {/* ================================================== */}
      <div className="relative z-10">
        <LandingMethodSection onScrollTo={scrollToSection} />

        {/* ================================================== */}
        {/* STAGE 3: CEFR LEVELS + 3D COVERFLOW PAYMENT PLANS  */}
        {/* ================================================== */}
        <LandingLevelsAndPlans
          onScrollTo={scrollToSection}
          onPlacementClick={onPlacementClick}
        />

        {/* ================================================== */}
        {/* STAGE 4 & 5: FREE TRIAL, ONBOARDING FORM & FOOTER  */}
        {/* ================================================== */}
        <LandingTrialAndEnroll
          onFreeLessonClick={onFreeLessonClick}
          onPlacementClick={onPlacementClick}
          onScrollTo={scrollToSection}
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      </div>

      {/* ================================================== */}
      {/* TACTILE LIGHT-MODE LOGIN MODAL                     */}
      {/* ================================================== */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={onLogin}
        onEnrollClick={() => scrollToSection('#enroll')}
      />
    </div>
  );
}