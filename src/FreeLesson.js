import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import StudentPlayer from './StudentPlayer';
import { OutLoudIcon } from './components/OutLoudBrand';

const FreeLessonStyles = () => (
  <style>{`
    .ola-free-glass {
      background: linear-gradient(142deg, rgba(255, 255, 255, 0.88) 0%, rgba(244, 246, 255, 0.72) 100%);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1.5px solid rgba(255, 255, 255, 0.96);
      box-shadow:
        0 26px 60px -16px rgba(30, 34, 70, 0.32),
        0 0 42px -10px rgba(255, 199, 73, 0.45),
        inset 0 2px 2px #ffffff;
    }
    .ola-free-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 5px 0 #1e2246, 0 14px 28px -6px rgba(255, 199, 73, 0.65);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s cubic-bezier(0.22, 1, 0.36, 1), filter 0.14s ease-out;
    }
    .ola-free-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 7px 0 #1e2246, 0 18px 34px -6px rgba(255, 199, 73, 0.82);
    }
    .ola-free-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
      transition-duration: 0.06s;
    }
    @keyframes olaFreeModalIn {
      0% { opacity: 0; transform: translateY(16px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes olaFreeSpark {
      0% { transform: translateY(0px) scale(0.35); opacity: 1; }
      70% { opacity: 1; }
      100% { transform: translateY(-76px) scale(1.05); opacity: 0; }
    }
    .ola-free-modal-in {
      animation: olaFreeModalIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .ola-free-spark {
      animation: olaFreeSpark 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
  `}</style>
);

const FreeLesson = ({ onReturnHome, onReturnToRegister }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // LOG FREE LESSON CONVERSION TO ANALYTICS
  useEffect(() => {
    const trackFreeLesson = async () => {
      try {
        await supabase.from('site_analytics').insert({ event_type: 'free_lesson' });
      } catch (err) {
        console.error('Analytics log failed:', err);
      }
    };
    trackFreeLesson();
  }, []);

  const guestStudent = {
    first_name: 'Guest',
    last_name: 'Student',
    level: 'A1: Básico 1',
    unit: 'Unit 1',
    avatar_url: 'https://ui-avatars.com/api/?name=Free+Trial&background=ffc749&color=1e2246&bold=true',
  };

  const handleLessonComplete = async (submissionData) => {
    if (submissionData?.security_flag === 'raw_payload') {
      setIsGrading(true);
      try {
        // Flag as guest payload so backend grades without writing to DB
        submissionData.isGuest = true;

        const [{ data: gradedResult, error }] = await Promise.all([
          supabase.functions.invoke('secure-grader', {
            body: { payload: submissionData },
          }),
          new Promise((resolve) => setTimeout(resolve, 550)),
        ]);

        if (error) throw error;

        setFinalScore(gradedResult.average);
        setIsCompleted(true);
      } catch (err) {
        console.error('Error grading free lesson:', err);
        // Marketing Fail-Safe: Never block a guest from registering on network hiccups
        setFinalScore(100);
        setIsCompleted(true);
      } finally {
        setIsGrading(false);
      }
    }
  };

  const circleRadius = 58;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const safeScore = Math.max(0, Math.min(100, Number(finalScore) || 0));
  const strokeDashoffset = circleCircumference - (safeScore / 100) * circleCircumference;

  return (
    <div
      className="relative w-full min-h-screen font-montserrat text-[#1e2246]"
      style={{
        background: 'linear-gradient(155deg, #d7dcf5 0%, #eaedfb 34%, #f7eff0 66%, #fdebc0 100%)',
      }}
    >
      <FreeLessonStyles />

      {/* Luminous Light-Glass & Dotted Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[85px]"
          style={{
            background: 'radial-gradient(circle, rgba(255,199,73,0.58) 0%, rgba(255,214,107,0.22) 50%, transparent 75%)',
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[440px] h-[440px] rounded-full blur-[90px]"
          style={{
            background: 'radial-gradient(circle, rgba(98,106,159,0.45) 0%, rgba(145,155,218,0.2) 50%, transparent 76%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.22) 1.4px, transparent 1.4px)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      {/* Player Stage */}
      <div
        className={
          isCompleted || isGrading
            ? 'pointer-events-none opacity-45 blur-[2px] transition-all duration-500 relative z-10'
            : 'transition-all duration-500 relative z-10'
        }
      >
        <StudentPlayer
          activityType="Lesson"
          student={guestStudent}
          onExit={onReturnHome}
          onComplete={handleLessonComplete}
        />
      </div>

      {/* GRADING INTERSTITIAL */}
      {isGrading && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center p-4 bg-[#1e2246]/45 backdrop-blur-xl font-montserrat">
          <div className="ola-free-glass ola-free-modal-in rounded-[2.25rem] px-8 py-9 max-w-sm w-full flex flex-col items-center text-center">
            <OutLoudIcon className="w-14 h-14 animate-bounce mb-4" />
            <h3 className="text-lg font-extrabold text-[#1e2246] uppercase tracking-tight mb-1">
              Calculando tu Puntaje
            </h3>
            <p className="text-xs font-medium text-[#4c5384]">
              Evaluando tus respuestas con el motor de OutLoud...
            </p>
          </div>
        </div>
      )}

      {/* LIGHT-GLASS CELEBRATORY COMPLETION MODAL */}
      {isCompleted && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1e2246]/55 backdrop-blur-xl font-montserrat overflow-y-auto">
          <div className="ola-free-glass ola-free-modal-in rounded-[2.5rem] p-7 sm:p-10 max-w-lg w-full flex flex-col items-center text-center relative overflow-hidden my-auto">
            {/* Ambient Corner Glows */}
            <div
              className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-2xl pointer-events-none"
              style={{ background: 'rgba(255, 199, 73, 0.45)' }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-2xl pointer-events-none"
              style={{ background: 'rgba(98, 106, 159, 0.3)' }}
            />

            {/* Celebratory Spark Burst */}
            <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 flex items-center justify-center">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                <span key={deg} className="absolute" style={{ transform: `rotate(${deg}deg)` }}>
                  <span
                    className="ola-free-spark block rounded-full"
                    style={{
                      width: idx % 2 === 0 ? '9px' : '6px',
                      height: idx % 2 === 0 ? '9px' : '6px',
                      backgroundColor: idx % 2 === 0 ? '#ffc749' : '#16a37f',
                    }}
                  />
                </span>
              ))}
            </div>

            <OutLoudIcon className="w-16 h-16 mb-3 relative z-10 drop-shadow-[0_8px_16px_rgba(98,106,159,0.28)]" />

            <span className="relative z-10 inline-flex items-center gap-1.5 bg-[#1e2246] text-[#ffc749] px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2.5">
              Clase de prueba completada
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-5 relative z-10">
              ¡Excelente Trabajo!
            </h2>

            {/* Score Progress Ring Medallion */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center mb-6 z-10 bg-white/80 rounded-full border-2 border-white shadow-inner">
              <svg className="w-full h-full transform -rotate-90 p-2" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={circleRadius} stroke="rgba(98,106,159,0.16)" strokeWidth="9" fill="transparent" />
                <circle
                  cx="70"
                  cy="70"
                  r={circleRadius}
                  stroke="url(#olaFreeScoreGrad)"
                  strokeWidth="9"
                  fill="transparent"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="olaFreeScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#454d82" />
                    <stop offset="55%" stopColor="#16a37f" />
                    <stop offset="100%" stopColor="#ffc749" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1e2246] leading-none">
                  {safeScore}%
                </span>
                <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#454d82] mt-1">
                  Puntaje Final
                </span>
              </div>
            </div>

            <p className="text-[#3b4170] font-medium text-sm sm:text-base leading-relaxed mb-7 relative z-10 max-w-md">
              Para poner en práctica lo que acabas de aprender y reservar tu{' '}
              <strong className="text-[#1e2246] font-bold underline decoration-[#ffc749] decoration-4 underline-offset-2">
                clase en vivo
              </strong>{' '}
              con los instructores de OutLoud, finaliza tu proceso de registro.
            </p>

            <button
              type="button"
              onClick={onReturnToRegister}
              className="ola-free-btn-yellow w-full py-4 rounded-full font-bold tracking-widest text-xs sm:text-sm uppercase cursor-pointer relative z-10"
            >
              Completar Registro →
            </button>

            <button
              type="button"
              onClick={onReturnHome}
              className="mt-4 px-5 py-2 rounded-full text-[#454d82] hover:text-[#1e2246] hover:bg-white/70 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer relative z-10"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeLesson;