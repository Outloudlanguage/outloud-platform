import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import StudentPlayer from './StudentPlayer';
import { OutLoudIcon } from './components/OutLoudBrand';

const FreeLesson = ({ onReturnHome, onReturnToRegister }) => {
  const [isCompleted, setIsCompleted] = useState(false);
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
    avatar_url: 'https://ui-avatars.com/api/?name=Free+Trial&background=ffc749&color=23274d&bold=true',
  };

  const handleLessonComplete = async (submissionData) => {
    if (submissionData?.security_flag === 'raw_payload') {
      try {
        // Flag this as a guest payload so the server knows NOT to save this to the database
        submissionData.isGuest = true;

        const { data: gradedResult, error } = await supabase.functions.invoke('secure-grader', {
          body: { payload: submissionData },
        });

        if (error) throw error;

        setFinalScore(gradedResult.average);
        setIsCompleted(true);
      } catch (err) {
        console.error('Error grading free lesson:', err);
        // Marketing Fail-Safe: If the server request fails for a guest, show 100% so they aren't blocked from registering
        setFinalScore(100);
        setIsCompleted(true);
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f6f7fc] font-montserrat">
      {/* Subtle Light-Mode Decorative Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#fff3d1] rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#e8eaf7] rounded-full blur-3xl opacity-80" />
      </div>

      <div
        className={
          isCompleted
            ? 'pointer-events-none opacity-40 blur-[2px] transition-all duration-700 relative z-10'
            : 'transition-all duration-700 relative z-10'
        }
      >
        <StudentPlayer
          activityType="Lesson"
          student={guestStudent}
          onExit={onReturnHome}
          onComplete={handleLessonComplete}
        />
      </div>

      {/* LIGHT-MODE TACTILE COMPLETION MODAL */}
      {isCompleted && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#23274d]/50 backdrop-blur-md animate-fade-in font-montserrat">
          <div className="bg-white border-2 border-[#23274d] rounded-[2.5rem] p-8 sm:p-11 max-w-lg w-full shadow-[0_14px_0_#23274d] flex flex-col items-center text-center relative overflow-hidden animate-slide-up">
            {/* Corner Accents */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#fff3d1] rounded-full pointer-events-none" />
            <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-[#e8eaf7] rounded-full pointer-events-none" />

            <OutLoudIcon className="w-16 h-16 mb-3 relative z-10 drop-shadow-[0_8px_14px_rgba(98,106,159,0.25)]" />

            <span className="relative z-10 inline-flex items-center gap-1.5 bg-[#e8eaf7] text-[#626a9f] border border-[#626a9f]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
              Clase de prueba completada
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-[#23274d] uppercase tracking-tight mb-6 relative z-10">
              ¡Excelente Trabajo!
            </h2>

            {/* Score Medallion */}
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#fff3d1] border-4 border-[#23274d] shadow-[0_6px_0_#23274d] flex flex-col items-center justify-center mb-6 relative z-10">
              <span className="text-4xl sm:text-5xl font-black text-[#23274d] leading-none">
                {finalScore}%
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#626a9f] mt-1">
                Puntaje Final
              </span>
            </div>

            <p className="text-[#60668a] font-medium text-sm sm:text-base leading-relaxed mb-8 relative z-10 text-balance">
              Para poner en práctica lo que acabas de aprender y reservar tu{' '}
              <strong className="text-[#23274d] font-black underline decoration-[#ffc749] decoration-4 underline-offset-2">
                clase en vivo
              </strong>{' '}
              con nuestros instructores, finaliza tu proceso de registro.
            </p>

            <button
              type="button"
              onClick={onReturnToRegister}
              className="ola-btn-yellow w-full py-4 rounded-full font-black tracking-widest text-xs sm:text-sm uppercase cursor-pointer relative z-10"
            >
              Completar Registro →
            </button>

            <button
              type="button"
              onClick={onReturnHome}
              className="mt-5 text-[#60668a] hover:text-[#23274d] text-xs font-black uppercase tracking-widest transition-colors cursor-pointer relative z-10"
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