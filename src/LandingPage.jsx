import React, { useState, useEffect } from 'react';
import { OutLoudIcon, OutLoudHorizontalLogo } from './components/OutLoudBrand';
import LoginModal from './components/LoginModal';
import LandingMethodSection from './components/LandingMethodSection';

const NAV_LINKS = [
  { label: 'Method', href: '#method' },
  { label: 'Levels', href: '#levels' },
  { label: 'Plans', href: '#plans' },
  { label: 'Free Lesson', href: '#free-trial' },
  { label: 'Enroll', href: '#enroll' },
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
    <div className="min-h-screen w-full bg-[#f6f7fc] text-[#23274d] font-montserrat overflow-x-hidden selection:bg-[#ffc749] selection:text-[#23274d]">
      <style>{`
        @keyframes olaFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        @keyframes olaFloatAlt {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(7px) rotate(2deg); }
        }
        @keyframes olaHeroEq {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        .ola-float-slow { animation: olaFloatSlow 4.2s ease-in-out infinite; }
        .ola-float-alt { animation: olaFloatAlt 5.2s ease-in-out infinite; }
        .ola-hero-eq { transform-origin: center; animation: olaHeroEq 1.15s ease-in-out infinite; }
      `}</style>

      {/* ================================================== */}
      {/* STICKY HEADER WITH PERSISTENT LOGIN TRIGGER        */}
      {/* ================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-[500] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl border-b-2 border-[#e8eaf7] shadow-[0_8px_24px_-12px_rgba(98,106,159,0.25)] py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <OutLoudHorizontalLogo
              iconClass="w-9 h-9 sm:w-11 sm:h-11"
              wordmarkClass="h-7 sm:h-9 w-auto"
            />
          </button>

          {/* Desktop Section Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md border border-[#dfe2f2] rounded-full px-2 py-1.5 shadow-sm">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider text-[#60668a] hover:text-[#23274d] hover:bg-[#e8eaf7]/70 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Actions: Placement Test + Log In */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onPlacementClick}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-[#626a9f] bg-white/80 hover:bg-[#e8eaf7] border-2 border-[#dfe2f2] transition-all cursor-pointer"
            >
              Placement Test
            </button>

            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="ola-btn-yellow px-5 sm:px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center gap-2"
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
              className="lg:hidden w-10 h-10 rounded-full bg-white border-2 border-[#dfe2f2] flex items-center justify-center text-[#23274d] cursor-pointer"
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

        {/* Mobile Slide-Down Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 mx-4 bg-white border-2 border-[#23274d] rounded-3xl shadow-[0_10px_0_#23274d] p-4 flex flex-col gap-1.5 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#23274d] hover:bg-[#e8eaf7] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="h-px bg-[#e8eaf7] my-1" />
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onPlacementClick?.();
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#626a9f] hover:bg-[#fff3d1] transition-colors"
            >
              Take Placement Test →
            </button>
          </div>
        )}
      </header>

      {/* ================================================== */}
      {/* HERO SECTION (Mockup Aesthetic + Dynamic Patterns) */}
      {/* ================================================== */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background Soft Geometric Accents */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#fff3d1]/80 blur-2xl pointer-events-none" />
        <div className="absolute top-12 -right-24 w-96 h-96 rounded-full bg-[#e8eaf7] blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Editorial Headline & Dual CTAs */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white border-2 border-[#dfe2f2] rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f] animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#626a9f]">
                  OutLoud Language Academy • CEFR A1–C2
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#23274d] leading-[1.05] tracking-tight mb-6">
                Your Voice,{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#626a9f]">Amplified.</span>
                  <span className="absolute left-0 bottom-1.5 w-full h-3.5 bg-[#ffc749]/80 -z-0 rounded-full" />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#60668a] font-medium leading-relaxed max-w-xl mb-8">
                Master real-world English through interactive speaking labs, structured digital workbooks, and live sessions with dedicated teachers—built to move you forward every single week.
              </p>

              {/* Primary Tactile CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  className="ola-btn-yellow w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <span>Try Free Lesson</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('#plans')}
                  className="ola-btn-outline w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer"
                >
                  Explore Plans
                </button>
              </div>

              {/* Quick Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10 pt-8 border-t-2 border-[#e8eaf7] w-full max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#23274d]">6</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#60668a]">
                    CEFR Levels
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#626a9f]">92</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#60668a]">
                    Guided Units
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#23274d]">Live</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#60668a]">
                    Teacher Labs
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Dynamic Brand World Composition */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-[320px] h-[320px] sm:w-[440px] sm:h-[420px] flex items-center justify-center">
                {/* Soft Lavender Backdrop Circle */}
                <div className="w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full bg-[#e8eaf7] absolute" />

                {/* Floating Audio Pill (Top-Left) */}
                <div className="ola-float-slow absolute top-3 left-0 sm:top-6 sm:left-2 z-20 bg-[#fff3d1] border-2 border-[#ffc749] rounded-full px-3.5 py-2 shadow-md flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#626a9f] flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#ffc749]" />
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
                </div>

                {/* Floating Speech Bubbles (Top-Right) */}
                <div className="ola-float-alt absolute top-2 right-0 sm:top-6 sm:right-2 z-20">
                  <svg width="96" height="64" viewBox="0 0 86 58" fill="none">
                    <rect x="6" y="4" width="58" height="34" rx="10" fill="#a8b0de" />
                    <path d="M18 38L14 48L28 38H18Z" fill="#a8b0de" />
                    <circle cx="22" cy="21" r="3" fill="#ffffff" />
                    <circle cx="35" cy="21" r="3" fill="#ffffff" />
                    <circle cx="48" cy="21" r="3" fill="#ffffff" />
                    <rect x="46" y="22" width="36" height="24" rx="8" fill="#ffc749" />
                    <path d="M72 46L76 54L64 46H72Z" fill="#ffc749" />
                    <rect x="55" y="32" width="18" height="4" rx="2" fill="#626a9f" />
                  </svg>
                </div>

                {/* Left & Right Radiating Equalizer Waves */}
                <div className="absolute left-0 sm:left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  {[14, 28, 18, 42, 24, 48, 20].map((h, i) => (
                    <span
                      key={`hl-${i}`}
                      className="ola-hero-eq w-1 rounded-full"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 3 === 0 ? '#ffc749' : '#626a9f',
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="absolute right-0 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  {[20, 48, 24, 42, 18, 28, 14].map((h, i) => (
                    <span
                      key={`hr-${i}`}
                      className="ola-hero-eq w-1 rounded-full"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 3 === 0 ? '#ffc749' : '#626a9f',
                        animationDelay: `${(6 - i) * 0.12}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Centerpiece Headphone Emblem */}
                <div className="relative z-20 ola-float-slow">
                  <OutLoudIcon className="w-40 h-40 sm:w-52 sm:h-52 drop-shadow-[0_20px_30px_rgba(98,106,159,0.28)]" />
                </div>

                {/* Bottom-Left Dot Matrix */}
                <div className="absolute bottom-6 left-4 sm:bottom-8 sm:left-6 z-10">
                  <svg width="68" height="50" viewBox="0 0 64 48" fill="none">
                    {[0, 1, 2, 3].map((row) =>
                      [0, 1, 2, 3, 4].map((col) => (
                        <circle
                          key={`${row}-${col}`}
                          cx={6 + col * 13}
                          cy={6 + row * 12}
                          r="3.2"
                          fill={(row + col) % 4 === 0 ? '#ffc749' : '#b7bee6'}
                        />
                      ))
                    )}
                  </svg>
                </div>

                {/* Bottom-Right Geometric Shapes */}
                <div className="ola-float-alt absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-10">
                  <svg width="74" height="66" viewBox="0 0 68 62" fill="none">
                    <path d="M12 24A16 16 0 0 1 28 8V24H12Z" fill="#ffc749" />
                    <path d="M32 8A20 20 0 0 1 52 28H32V8Z" fill="#a8b0de" />
                    <rect x="14" y="30" width="22" height="22" rx="5" fill="#ffc749" />
                    <path d="M44 36L58 50H38L44 36Z" fill="#626a9f" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          </div>
      </section>

      {/* ================================================== */}
      {/* STAGE 2: COURSE INFO HERO CARDS + 5-STEP CYCLE     */}
      {/* ================================================== */}
      <LandingMethodSection onScrollTo={scrollToSection} />

      {/* ================================================== */}
      {/* STAGE 3-5 ANCHOR SLOTS (Live Bridges Until Migrated) */}
      {/* ================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-24 space-y-8">

        <section id="levels" className="ola-card rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#626a9f]">Stage 3 Incoming</span>
            <h3 className="text-2xl font-black text-[#23274d] mt-1">CEFR Levels (A1–C2) &amp; Coverflow Payment Plans</h3>
            <p className="text-sm text-[#60668a] mt-1">Interactive CEFR cards &amp; 3D Coverflow pricing carousel will live right here.</p>
          </div>
          <button type="button" id="plans" onClick={onInfoClick} className="ola-btn-outline px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shrink-0 cursor-pointer">
            View Levels &amp; Plans →
          </button>
        </section>

        <section id="free-trial" className="bg-[#fff3d1] border-2 border-[#ffc749] rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#23274d]">Stage 4 Ready to Launch</span>
            <h3 className="text-2xl font-black text-[#23274d] mt-1">Experience a Real Lesson &amp; Placement Test</h3>
            <p className="text-sm text-[#60668a] mt-1">Test our interactive player or discover your CEFR level right now.</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button type="button" onClick={onFreeLessonClick} className="ola-btn-yellow px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer">
              Launch Free Lesson
            </button>
            <button type="button" onClick={onPlacementClick} className="ola-btn-outline px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer">
              Placement Test
            </button>
          </div>
        </section>

        <section id="enroll" className="bg-[#626a9f] border-2 border-[#23274d] rounded-[2rem] p-8 text-white shadow-[0_8px_0_#23274d] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#ffc749]">Stage 5 Incoming</span>
            <h3 className="text-2xl font-black text-white mt-1">Start Your Onboarding Application</h3>
            <p className="text-sm text-white/80 mt-1">The complete Supabase + Discord registration form will embed right here.</p>
          </div>
          <button type="button" onClick={onRegisterClick} className="ola-btn-yellow px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest shrink-0 cursor-pointer">
            Open Onboarding Form →
          </button>
        </section>
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