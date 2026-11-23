import React, { useState, useEffect } from 'react';
import { OutLoudHorizontalLogo } from './components/OutLoudBrand';
import LoginModal from './components/LoginModal';
import HeroVoicePractice from './components/HeroVoicePractice';
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
  initialLoginOpen = false,
  onLoginModalToggle,
}) {
  const [isLoginOpen, setIsLoginOpen] = useState(initialLoginOpen);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (initialLoginOpen) {
      setIsLoginOpen(true);
    }
  }, [initialLoginOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openLoginModal = () => {
    setIsLoginOpen(true);
    onLoginModalToggle?.(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    onLoginModalToggle?.(false);
  };

  const scrollToSection = (href) => {
    setIsMobileMenuOpen(false);
    if (window.location.hash === '#login') {
      window.history.replaceState({ page: 'home' }, '', '/');
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="ola-landing-type min-h-screen w-full text-[#1e2246] font-montserrat overflow-x-hidden relative selection:bg-[#ffc749] selection:text-[#1e2246]"
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
          50% { transform: translateY(-8px); }
        }
        @keyframes olaFloatAlt {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(6px) rotate(1.5deg); }
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
        .ola-hero-eq { transform-origin: center; animation: olaHeroEq 0.95s ease-in-out infinite; }

        /* TRUE FROSTED GLASS SURFACES */
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

        .ola-glass-indigo {
          background: linear-gradient(145deg, rgba(78, 86, 142, 0.9) 0%, rgba(42, 48, 92, 0.86) 100%);
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
          border-color: rgba(255, 199, 73, 0.72);
          box-shadow:
            0 28px 58px -10px rgba(30, 34, 70, 0.55),
            0 0 48px -4px rgba(98, 106, 159, 0.72),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.5);
        }

        /* TACTILE BACKLIT YELLOW CTA (True Physical Button Press & Crisp Ease-Out) */
        .ola-btn-yellow {
          background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
          color: #1e2246;
          border: 2px solid #1e2246;
          box-shadow: 0 5px 0 #1e2246, 0 14px 30px -4px rgba(255, 199, 73, 0.65);
          transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s cubic-bezier(0.22, 1, 0.36, 1), filter 0.14s ease-out;
        }
        .ola-btn-yellow:hover {
          filter: brightness(1.04);
          transform: translateY(-2.5px);
          box-shadow: 0 7.5px 0 #1e2246, 0 18px 36px -4px rgba(255, 199, 73, 0.85);
        }
        .ola-btn-yellow:active {
          transform: translateY(4px) scale(0.99);
          box-shadow: 0 1px 0 #1e2246, 0 4px 10px -4px rgba(255, 199, 73, 0.4);
          transition-duration: 0.06s;
        }

        /* Spatial Mobile Drawer Unfolding from Top-Right Menu Trigger */
        @keyframes olaDrawerSpring {
          0% { opacity: 0; transform: translateY(-10px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ola-drawer-spring {
          transform-origin: top right;
          animation: olaDrawerSpring 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes olaFreePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 5px 0 #1e2246, 0 0 0 0 rgba(255, 199, 73, 0.8), 0 14px 28px -4px rgba(255, 199, 73, 0.65);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 7px 0 #1e2246, 0 0 0 12px rgba(255, 199, 73, 0), 0 18px 36px -2px rgba(255, 199, 73, 0.9);
          }
        }
        .ola-btn-free-pulse {
          animation: olaFreePulse 2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .ola-btn-free-pulse:hover {
          animation: none;
        }

        /* TACTILE GLASS OUTLINE CTA */
        .ola-btn-outline {
          background: rgba(255, 255, 255, 0.6);
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

        /* REFINED EDITORIAL WEIGHT SCALE (Less Heavy Bold on Desktop & Mobile) */
        .ola-landing-type .font-black { font-weight: 800; }
        .ola-landing-type .font-extrabold { font-weight: 700; }
        .ola-landing-type h3.font-black,
        .ola-landing-type h4.font-black,
        .ola-landing-type h5.font-black,
        .ola-landing-type p.font-black,
        .ola-landing-type span.font-black,
        .ola-landing-type button.font-black,
        .ola-landing-type a.font-black {
          font-weight: 700;
        }
        .ola-landing-type .text-5xl.font-black { font-weight: 800; }
        .ola-landing-type nav button { font-weight: 600; }
        .ola-landing-type p.font-bold,
        .ola-landing-type p.font-semibold,
        .ola-landing-type li.font-semibold {
          font-weight: 500;
        }
        .ola-landing-type p.font-medium,
        .ola-landing-type li.font-medium {
          font-weight: 400;
        }
        .ola-landing-type p strong,
        .ola-landing-type li strong {
          font-weight: 600;
        }
      `}</style>

      {/* ================================================== */}
      {/* RESTORED DOTTED BACKGROUND + LUMINOUS MESH ORBS    */}
      {/* ================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Drifting Luminous Backlight Blobs */}
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

        {/* CRISP ARCHITECTURAL DOTTED BACKGROUND (Restored) */}
        <div
          className="absolute inset-0 opacity-85"
          style={{
            backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.24) 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px',
          }}
        />
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
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-3">
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
              onClick={openLoginModal}
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

        {/* Mobile Slide-Down Glass Drawer (Originates from Top-Right Hamburger) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 mx-4 ola-glass ola-drawer-spring rounded-3xl p-4 flex flex-col gap-1.5">
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
      {/* VISUAL-FIRST HERO (Balanced Margins & Clean Type)  */}
      {/* ================================================== */}
      <section className="relative z-10 pt-28 pb-12 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
        <div className="max-w-[1060px] mx-auto px-5 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
            {/* LEFT COLUMN: Centered-Balanced Editorial Punch */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left lg:pl-2">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-[#1e2246] leading-[1.04] tracking-tight mb-3.5 sm:mb-4">
                Your Voice,{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#454d82]">Amplified.</span>
                  <span className="absolute -left-1.5 -right-1.5 bottom-1.5 h-3.5 bg-[#ffc749] -z-0 rounded-full -rotate-1 shadow-[0_4px_14px_rgba(255,199,73,0.65)]" />
                </span>
              </h1>

              <p
                className="text-sm sm:text-[1.05rem] font-medium text-[#3b4170] max-w-[380px] sm:max-w-[400px] mb-0 lg:mb-7 leading-relaxed"
                style={{ textShadow: '0 2px 12px rgba(255, 255, 255, 0.85)' }}
              >
                Inglés 100% en vivo y práctica vocal interactiva 24/7 — sin traducir.
              </p>

              {/* Desktop Primary Actions */}
              <div className="hidden lg:flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  className="ola-btn-yellow ola-btn-free-pulse px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-2 group"
                >
                  <span>PRUEBA GRATIS</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('#plans')}
                  className="ola-btn-outline px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest cursor-pointer"
                >
                  Ver Planes
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (IMMEDIATELY VISIBLE ON MOBILE): INTERACTIVE VOICE PRACTICE STUDIO */}
            <div className="lg:col-span-6 w-full">
              <HeroVoicePractice onFreeLessonClick={onFreeLessonClick} />

              {/* Mobile Actions Below the Studio */}
              <div className="flex lg:hidden items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  className="ola-btn-yellow ola-btn-free-pulse flex-1 py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  PRUEBA GRATIS
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('#plans')}
                  className="ola-btn-outline flex-1 py-3.5 px-4 rounded-full text-xs font-semibold uppercase tracking-widest cursor-pointer"
                >
                  Ver Planes
                </button>
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
          onOpenLogin={openLoginModal}
        />
      </div>

      {/* ================================================== */}
      {/* BACKLIT GLASS LOGIN MODAL                          */}
      {/* ================================================== */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLoginModal}
        onLogin={onLogin}
        onEnrollClick={() => scrollToSection('#enroll')}
      />
    </div>
  );
}