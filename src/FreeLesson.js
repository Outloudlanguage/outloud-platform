import React, { useState } from 'react';
import StudentPlayer from './StudentPlayer';

const FreeLesson = ({ onReturnHome, onReturnToRegister }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const guestStudent = {
    first_name: 'Guest',
    last_name: 'Student',
    level: 'A1: Básico 1', 
    unit: 'Unit 1', 
    avatar_url: 'https://ui-avatars.com/api/?name=Free+Trial&background=fcd34d&color=08203e'
  };

  const handleLessonComplete = (scores) => {
    // Calculates the average of all tracked scores
    const scoreValues = Object.values(scores);
    const average = scoreValues.length > 0 ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 100;
    setFinalScore(average);
    setIsCompleted(true);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070b19]">
      
      {/* Background Image Restored */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/267655.jpeg" alt="Background" className="absolute inset-0 w-full h-full object-cover object-left md:object-center opacity-40 mix-blend-lighten" />
      </div>

      <div className={isCompleted ? "pointer-events-none opacity-50 transition-all duration-1000 relative z-10" : "transition-all duration-1000 relative z-10"}>
        <StudentPlayer 
          activityType="Lesson" 
          student={guestStudent} 
          onExit={onReturnHome} 
          onComplete={handleLessonComplete} 
        />
      </div>

      {isCompleted && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#070b19]/80 backdrop-blur-md animate-fade-in font-montserrat">
          <div className="bg-white/10 border border-white/20 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/40 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-1 relative z-10">¡Excelente!</h2>
            <p className="text-[#fcd34d] font-bold text-xs md:text-sm uppercase tracking-widest mb-6 relative z-10">Clase de prueba completada</p>
            
            {/* Enlarged Circle to prevent 100% from clipping */}
            <div className="w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-[#fcd34d] flex items-center justify-center mb-6 relative z-10 bg-[#08203e]/50 shadow-inner">
              <span className="text-4xl md:text-5xl font-black text-white">{finalScore}%</span>
            </div>
            
            <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed mb-8 relative z-10 text-balance">
              Para poner en práctica lo que acabas de aprender y reservar tu <strong className="text-[#fcd34d] font-black">clase en vivo</strong> con nuestros instructores, finaliza tu proceso de registro.
            </p>

            <button 
              onClick={onReturnToRegister} 
              className="w-full py-4 bg-[#fcd34d] hover:bg-white text-[#08203e] font-black tracking-widest text-sm uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(252,211,77,0.3)] hover:scale-105 active:scale-95 relative z-10"
            >
              COMPLETAR REGISTRO
            </button>
            
            <button 
              onClick={onReturnHome} 
              className="mt-6 text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors relative z-10"
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