import React, { useState } from 'react';
import StudentPlayer from './StudentPlayer';

const FreeLesson = ({ onReturnHome, onReturnToRegister }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  // 1. Simulate a Guest profile to trick StudentPlayer into fetching the exact Trial Lesson
  const guestStudent = {
    first_name: 'Guest',
    last_name: 'Student',
    level: 'A1: Básico 1', 
    unit: 'Unit 1', 
    avatar_url: 'https://ui-avatars.com/api/?name=Free+Trial&background=fcd34d&color=08203e'
  };

  // 2. Intercept the end of the lesson to show the registration prompt instead of the Hub
  const handleLessonComplete = (scores) => {
    setIsCompleted(true);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070b19]">
      
      {/* Render the actual Student Player */}
      <div className={isCompleted ? "blur-md pointer-events-none opacity-40 transition-all duration-1000" : ""}>
        <StudentPlayer 
          activityType="Lesson" 
          student={guestStudent} 
          onExit={onReturnHome} 
          onComplete={handleLessonComplete} 
        />
      </div>

      {/* The Custom Spanish Completion Modal (Overlay) */}
      {isCompleted && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-montserrat">
          <div className="bg-[#08203e]/95 border border-[#fcd34d]/50 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-[0_0_50px_rgba(252,211,77,0.2)] flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-md">¡Excelente Trabajo!</h2>
            <p className="text-[#fcd34d] font-bold text-xs uppercase tracking-widest mb-8">Has completado tu primera lección</p>
            
            <p className="text-white/80 font-medium text-sm md:text-base leading-relaxed mb-8">
              Para poner en práctica lo que acabas de aprender y reservar tu <strong className="text-white font-black">clase en vivo</strong> con uno de nuestros instructores, debes finalizar tu proceso de registro.
            </p>

            <button 
              onClick={onReturnToRegister} 
              className="w-full py-4 bg-[#fcd34d] hover:bg-white text-[#08203e] font-black tracking-widest text-sm uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(252,211,77,0.4)] hover:scale-105 active:scale-95"
            >
              COMPLETAR REGISTRO
            </button>
            
            <button 
              onClick={onReturnHome} 
              className="mt-6 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
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