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
  onPlacementClick,
  onFreeLessonClick,
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
    <div
      className="min-h-screen w-full text-[#1e2246] font-montserrat overflow-x-hidden relative selection:bg-[#ffc749] selection:text-[#1e2246]"
      style={{
        background:
          'linear-gradient(155deg, #d7dcf5 0%, #eaedfb 32%, #f7eff0 64%, #fdebc0 100%)',
      }}
    >
      {/* ================================================== */}
      {/* TRUE GLASSMORPHISM + BACKLIGHTING DESIGN ENGINE    */}
      {/* ================================================== */}
      <style>{`
        :root {
          --ola-yellow: #ffc749;
          --ola-yellow-deep: #f0b32b;
          --ola-yellow-soft: #fff3d1;
          --ola-indigo: #626a9f;
          --ola-indigo-dark: #454d82;
          --ola-ink: #1e2246;
          --ola-ink-muted: #50567d;
        }

        html { scroll-behavior: smooth; }

        @keyframes olaDriftA {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(55px, 35px) scale(1.1); }
        }
        @keyframes olaDriftB {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-55px, 40px) scale(1.12); }
        }
        @keyframes olaDriftC {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(35px, -45px) scale(1.08); }
        }
        @keyframes olaFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        @keyframes olaFloatAlt {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(7px) rotate(1.5deg); }
        }
        @keyframes olaHeroEq {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }

        .ola-orb-a { animation: olaDriftA 14s ease-in-out infinite; }
        .ola-orb-b { animation: olaDriftB 18s ease-in-out infinite; }
        .ola-orb-c { animation: olaDriftC 16s ease-in-out infinite; }
        .ola-float-slow { animation: olaFloatSlow 4.2s ease-in-out infinite; }
        .ola-float-alt { animation: olaFloatAlt 5.4s ease-in-out infinite; }
        .ola-hero-eq { transform-origin: center; animation: olaHeroEq 1.05s ease-in-out infinite; }

        /* TRUE FROSTED GLASS SURFACES (Specular Rim + Color Refraction) */
        .ola-glass {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.34) 100%);
          backdrop-filter: blur(26px) saturate(185%);
          -webkit-backdrop-filter: blur(26px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.82);
          box-shadow:
            0 18px 42px -14px rgba(55, 63, 118, 0.24),
            0 0 0 1px rgba(98, 106, 159, 0.08),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.95),
            inset 0 -1px 1px rgba(98, 106, 159, 0.08);
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .ola-glass:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.74) 0%, rgba(255, 255, 255, 0.44) 100%);
          border-color: rgba(255, 255, 255, 0.98);
          box-shadow:
            0 24px 52px -12px rgba(55, 63, 118, 0.3),
            0 0 36px -6px rgba(255, 199, 73, 0.42),
            inset 0 1.5px 2px rgba(255, 255, 255, 1);
        }

        /* WARM SUNLIT GOLD FROSTED GLASS */
        .ola-glass-yellow {
          background: linear-gradient(135deg, rgba(255, 244, 210, 0.72) 0%, rgba(255, 224, 145, 0.42) 100%);
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          box-shadow:
            0 20px 44px -14px rgba(202, 138, 4, 0.28),
            0 0 32px -8px rgba(255, 199, 73, 0.5),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.92);
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .ola-glass-yellow:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 255, 255, 1);
          box-shadow:
            0 28px 54px -12px rgba(202, 138, 4, 0.36),
            0 0 46px -4px rgba(255, 199, 73, 0.68),
            inset 0 1.5px 2px rgba(255, 255, 255, 1);
        }

        /* DEEP INDIGO FROSTED GLASS (Guaranteed high contrast for white text) */
        .ola-glass-indigo {
          background: linear-gradient(145deg, rgba(78, 86, 142, 0.88) 0%, rgba(45, 51, 96, 0.82) 100%);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1.5px solid rgba(255, 255, 255, 0.34);
          box-shadow:
            0 22px 48px -12px rgba(30, 34, 70, 0.46),
            0 0 38px -8px rgba(98, 106, 159, 0.58),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.38);
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .ola-glass-indigo:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 199, 73, 0.72);
          box-shadow:
            0 28px 58px -10px rgba(30, 34, 70, 0.55),
            0 0 48px -4px rgba(98, 106, 159, 0.72),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.5);
        }

        /* TACTILE BACKLIT YELLOW CTA */
        .ola-btn-yellow {
          background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
          color: #1e2246;
          border: 2px solid #1e2246;
          box-shadow: 0 5px 0 #1e2246, 0 14px 30px -4px rgba(255, 199, 73, 0.65);
          transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.16s ease, filter 0.16s ease;
        }
        .ola-btn-yellow:hover {
          filter: brightness(1.04);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 0 #1e2246, 0 18px 38px -4px rgba(255, 199, 73, 0.85);
        }
        .ola-btn-yellow:active {
          transform: translateY(2px) scale(0.98);
          box-shadow: 0 2px 0 #1e2246, 0 6px 14px -4px rgba(255, 199, 73, 0.45);
        }

        /* TACTILE GLASS OUTLINE CTA */
        .ola-btn-outline {
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(18px) saturate(170%);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          color: #1e2246;
          border: 2px solid rgba(30, 34, 70, 0.85);
          box-shadow: 0 4px 0 rgba(30, 34, 70, 0.22), 0 12px 26px -8px rgba(98, 106, 159, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.9);
          transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.16s ease, background 0.16s ease;
        }
        .ola-btn-outline:hover {
          background: rgba(255, 255, 255, 0.92);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 7px 0 #626a9f, 0 18px 34px -8px rgba(98, 106, 159, 0.45);
        }
        .ola-btn-outline:active {
          transform: translateY(2px) scale(0.98);
          box-shadow: 0 2px 0 rgba(30, 34, 70, 0.25);
        }

        /* COMPATIBILITY ALIAS FOR EXISTING SUB-COMPONENTS */
        .ola-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.34) 100%);
          backdrop-filter: blur(24px) saturate(185%);
          -webkit-backdrop-filter: blur(24px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 14px 36px -12px rgba(55, 63, 118, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.95);
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .ola-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 255, 255, 1);
          box-shadow: 0 22px 44px -12px rgba(55, 63, 118, 0.32), 0 0 30px -6px rgba(255, 199, 73, 0.5);
        }

        /* KINETIC REACTIVE CLICKABLE TEXT */
        .ola-reactive-text {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ola-reactive-text::after {
          content: '';
          position: absolute;
          left: 0.75rem;
          right: 0.75rem;
          bottom: 2px;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, #ffc749, #626a9f);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ola-reactive-text:hover {
          color: #1e2246;
          background: rgba(255, 255, 255, 0.58);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -8px rgba(98, 106, 159, 0.35);
        }
        .ola-reactive-text:hover::after {
          transform: scaleX(1);
        }
        .ola-reactive-text:active {
          transform: translateY(0px) scale(0.98);
        }
      `}</style>

      {/* ================================================== */}
      {/* RICH LIVING AMBIENT CANVAS (Gives Glass Real Depth) */}
      {/* ================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Bold Luminous Backlight Blobs so Glass Refractions Pop */}
        <div
          className="ola-orb-a absolute -top-24 -left-24 w-[440px] h-[440px] sm:w-[680px] sm:h-[680px] rounded-full blur-[80px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255,199,73,0.72) 0%, rgba(255,214,107,0.34) 45%, rgba(255,243,209,0) 74%)',
          }}
        />
        <div
          className="ola-orb-b absolute top-[12%] -right-28 w-[460px] h-[460px] sm:w-[740px] sm:h-[740px] rounded-full blur-[90px]"
          style={{
            background:
              'radial-gradient(circle, rgba(98,106,159,0.62) 0%, rgba(145,155,218,0.32) 48%, rgba(168,176,222,0) 76%)',
          }}
        />
        <div
          className="ola-orb-c absolute top-[52%] -left-24 w-[440px] h-[440px] sm:w-[640px] sm:h-[640px] rounded-full blur-[95px]"
          style={{
            background:
              'radial-gradient(circle, rgba(121,131,196,0.52) 0%, rgba(255,199,73,0.28) 52%, rgba(246,247,252,0) 78%)',
          }}
        />
        <div
          className="ola-orb-a absolute -bottom-32 right-[10%] w-[460px] h-[460px] sm:w-[700px] sm:h-[700px] rounded-full blur-[90px]"
          style={{
            background:
              'radial-gradient(circle, rgba(255,199,73,0.58) 0%, rgba(98,106,159,0.34) 55%, transparent 78%)',
          }}
        />

        {/* Subtle Architectural Dot-Matrix + Acoustic Wave Rings */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.16) 1.25px, transparent 1.25px)',
            backgroundSize: '26px 26px',
          }}
        />

        <svg
          className="absolute top-[52%] left-0 w-full h-56 opacity-[0.09]"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 120 Q 180 20, 360 120 T 720 120 T 1080 120 T 1440 120"
            stroke="#626a9f"
            strokeWidth="3"
          />
          <path
            d="M0 155 Q 200 225, 400 135 T 820 135 T 1200 155 T 1440 105"
            stroke="#ffc749"
            strokeWidth="3.5"
          />
        </svg>

        <svg
          className="absolute bottom-[18%] left-0 w-full h-48 opacity-[0.18]"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 95 Q 240 175, 480 95 T 960 95 T 1440 95"
            stroke="#626a9f"
            strokeWidth="3"
            strokeDasharray="10 10"
          />
        </svg>
      </div>

      {/* ================================================== */}
      {/* STICKY TRUE-GLASS HEADER                           */}
      {/* ================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-[500] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/60 backdrop-blur-2xl border-b border-white/80 shadow-[0_12px_34px_-10px_rgba(55,63,118,0.28)] py-2.5'
            : 'bg-white/25 backdrop-blur-xl border-b border-white/50 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-3">
          {/* Optically Aligned Brand Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer focus:outline-none shrink-0"
          >
            <OutLoudHorizontalLogo
              iconClass="w-10 h-10 sm:w-12 sm:h-12"
              wordmarkClass="h-8 sm:h-10 w-auto"
            />
          </button>

          {/* Desktop Frosted Glass Nav Pill */}
          <nav className="hidden lg:flex items-center gap-1 ola-glass rounded-full px-2.5 py-1.5">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="relative px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-white/80 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Actions: Placement Test + Yellow Log In */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onPlacementClick}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-[#454d82] hover:text-[#1e2246] bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/90 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Placement Test</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="ola-btn-yellow px-4 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest cursor-pointer flex items-center gap-1.5 sm:gap-2"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>Log In</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Abrir menú"
              className="lg:hidden w-10 h-10 rounded-full bg-white/70 backdrop-blur-xl border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] cursor-pointer shadow-sm"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Glass Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 mx-4 ola-glass rounded-3xl p-4 flex flex-col gap-1.5 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#1e2246] hover:bg-[#fff3d1]/80 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="h-px bg-[#626a9f]/20 my-1" />
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onPlacementClick?.();
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#454d82] hover:bg-white/70 transition-colors flex items-center justify-between"
            >
              <span>Tomar Placement Test</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* ================================================== */}
      {/* HERO SECTION (Backlit Frosted Glass + Personality) */}
      {/* ================================================== */}
      <section className="relative z-10 pt-28 pb-12 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Editorial Headline & Kinetic CTAs */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="ola-glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f] animate-pulse shadow-[0_0_10px_#16a37f]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#454d82]">
                  OutLoud Language Academy • CEFR A1–C2
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.85rem] font-black text-[#1e2246] leading-[1.02] tracking-tight mb-6">
                Your Voice,{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#4c548a]">Amplified.</span>
                  <span className="absolute -left-1.5 -right-1.5 bottom-1.5 h-4 bg-[#ffc749] -z-0 rounded-full -rotate-1 shadow-[0_4px_14px_rgba(255,199,73,0.65)]" />
                </span>
              </h1>

              <p
                className="text-base sm:text-lg text-[#1e2246]/90 font-semibold leading-relaxed max-w-lg mb-8"
                style={{ textShadow: '0 2px 14px rgba(255, 255, 255, 0.9)' }}
              >
                Aprende inglés hablando desde el primer día. Lecciones interactivas 24/7, práctica vocal instantánea y clases{' '}
                <strong className="font-black text-[#1e2246] underline decoration-[#ffc749] decoration-[3px] underline-offset-4">
                  100% en vivo
                </strong>{' '}
                diseñadas para que dejes de traducir en tu cabeza.
              </p>

              {/* Primary Tactile CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  className="ola-btn-yellow w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2.5 group"
                >
                  <span>Probar Lección Gratis</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('#plans')}
                  className="ola-btn-outline w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer"
                >
                  Ver Planes
                </button>
              </div>

              {/* Reactive Clickable Text Link */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => scrollToSection('#cycle')}
                  className="ola-reactive-text text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#454d82] cursor-pointer group"
                >
                  <span>Ver el ciclo de estudio en 5 pasos</span>
                  <svg className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Backlit Frosted Glass Metric Tiles */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 w-full max-w-lg">
                {[
                  { value: '6', label: 'Niveles CEFR', glow: 'rgba(255, 199, 73, 0.55)' },
                  { value: '92', label: 'Unidades', glow: 'rgba(98, 106, 159, 0.45)' },
                  { value: 'Live', label: 'Teacher Labs', glow: 'rgba(22, 163, 127, 0.4)' },
                ].map((stat) => (
                  <div key={stat.label} className="relative group">
                    <div
                      className="absolute -inset-1.5 rounded-3xl blur-xl opacity-55 group-hover:opacity-95 transition-opacity duration-300 -z-10"
                      style={{ background: stat.glow }}
                    />
                    <div className="ola-glass rounded-2xl p-3.5 sm:p-4 text-center group-hover:-translate-y-1.5">
                      <div className="text-2xl sm:text-3xl font-black text-[#1e2246] leading-none">{stat.value}</div>
                      <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#454d82] mt-1.5">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Backlit Frosted Orbital Brand Showcase */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-[330px] h-[390px] sm:w-[490px] sm:h-[480px] flex items-center justify-center">
                {/* Vivid Multi-Color Backlight Behind Centerpiece */}
                <div
                  className="absolute w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full blur-3xl opacity-85 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,199,73,0.68) 0%, rgba(98,106,159,0.52) 55%, transparent 78%)',
                  }}
                />

                {/* Frosted Glass Orbital Ring */}
                <div className="ola-glass w-[248px] h-[248px] sm:w-[350px] sm:h-[350px] rounded-full absolute pointer-events-none" />

                {/* Floating Audio Pill (Top-Left) */}
                <div className="ola-float-slow ola-glass-yellow absolute top-1 left-0 sm:top-4 sm:left-2 z-20 rounded-full px-4 py-2 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#454d82] flex items-center justify-center shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-[#ffc749] animate-ping" />
                  </span>
                  <div className="flex items-center gap-[3px] h-4">
                    {[10, 16, 8, 14, 11, 7].map((h, i) => (
                      <span
                        key={i}
                        className="ola-hero-eq w-[3px] rounded-full bg-[#1e2246]"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.14}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1e2246] hidden sm:inline">
                    Live Audio
                  </span>
                </div>

                {/* Floating Speech Chip (Top-Right) */}
                <div className="ola-float-alt ola-glass absolute top-1 right-0 sm:top-5 sm:right-0 z-20 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#454d82] text-[#ffc749] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    EN
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-[#1e2246] leading-tight">&ldquo;Speak OutLoud!&rdquo;</p>
                    <p className="text-[9px] font-bold text-[#454d82] uppercase tracking-wider">Sin traducir</p>
                  </div>
                </div>

                {/* Left & Right Radiating Equalizer Waves */}
                <div className="absolute left-0 sm:left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  {[14, 28, 18, 42, 24, 48, 20].map((h, i) => (
                    <span
                      key={`hl-${i}`}
                      className="ola-hero-eq w-1.5 rounded-full shadow-sm"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 3 === 0 ? '#ffc749' : '#454d82',
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="absolute right-0 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  {[20, 48, 24, 42, 18, 28, 14].map((h, i) => (
                    <span
                      key={`hr-${i}`}
                      className="ola-hero-eq w-1.5 rounded-full shadow-sm"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 3 === 0 ? '#ffc749' : '#454d82',
                        animationDelay: `${(6 - i) * 0.12}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Interactive Centerpiece Emblem */}
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  title="Probar Lección Gratis"
                  className="relative z-20 ola-float-slow cursor-pointer group focus:outline-none"
                >
                  <OutLoudIcon className="w-36 h-36 sm:w-52 sm:h-52 drop-shadow-[0_24px_34px_rgba(45,51,96,0.34)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]" />
                </button>

                {/* Bottom Orbital Row (Cleanly Spaced on Mobile & Desktop) */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2.5 px-1 z-20">
                  <div className="ola-float-alt ola-glass rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#16a37f] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-[#1e2246] leading-tight">100% En Vivo</p>
                      <p className="text-[9px] font-bold text-[#50567d] uppercase tracking-wider">Profesores</p>
                    </div>
                  </div>

                  <div className="ola-float-slow ola-glass-indigo rounded-2xl px-3.5 py-2.5 text-white text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ffc749] leading-tight">
                      Acceso 24/7
                    </p>
                    <p className="text-[11px] font-bold leading-tight text-white/95">Chat • Foros • Labs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* STAGE 2, 3, 4 & 5 SCROLLING SECTIONS               */}
      {/* ================================================== */}
      <div className="relative z-10">
        <LandingMethodSection onScrollTo={scrollToSection} />

        <LandingLevelsAndPlans
          onScrollTo={scrollToSection}
          onPlacementClick={onPlacementClick}
        />

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