import React, { useState, useEffect, useRef } from 'react';

// =========================================
// 1. MOBILE & TABLET PORTRAIT UI (UNTOUCHED)
// =========================================
const MobileCyclePage = ({ onReturnHome, onRegister }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const bottomRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: 'PASO 1: Live Lab',
      desc: 'Entra a tu cuenta y adquiere nuevo vocabulario de forma interactiva',
      icon: 'https://i.postimg.cc/hvd9RVBP/14(3).png',
    },
    {
      id: 2,
      title: 'PASO 2: Práctica interactiva',
      desc: 'Completa los ejercicios para afianzar lo aprendido.',
      icon: 'https://i.postimg.cc/Cx1bFyYc/Diseno-sin-titulo-(15).png',
    },
    {
      id: 3,
      title: 'PASO 3: Agenda tus clases',
      desc: 'Reserva sesiones 100% en vivo con un profesor.',
      icon: 'https://i.postimg.cc/L5KJf7c8/16(3).png',
    },
    {
      id: 4,
      title: 'PASO 4: Clase 100% en vivo',
      desc: 'Un instructor dictará clases interactivas, completamente prácticas, te aconsejará y te evaluará.',
      icon: 'https://i.postimg.cc/RVTW6gX3/17(2).png',
    },
    {
      id: 5,
      title: 'PASO 5: Aplica lo aprendido',
      desc: 'Participa en actividades comunitarias con otros alumnos: foros, debates, club de conversación, salas de chat y más.',
      icon: 'https://i.postimg.cc/MKtGKvpz/18(1).png',
    },
  ];

  // Auto-scroll whenever a new step is revealed
  useEffect(() => {
    if (currentStep > 0 && bottomRef.current) {
      setTimeout(() => {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans bg-[#070b19] text-white flex flex-col overflow-y-auto overflow-x-hidden">
      
      {/* Neon Wavy Background Simulation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/30 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[90px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <div className="relative z-10 flex flex-col w-full px-5 py-6 flex-grow">
        
        {/* Top Header */}
        <div className="flex flex-row justify-between items-center w-full mb-8">
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" 
              alt="Outloud Logo" 
              className="h-8 object-contain opacity-90 drop-shadow-md" 
            />
            <div className="h-6 w-[1px] bg-white/30"></div>
            <span className="text-[10px] font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide">
              Online Platform
            </span>
          </div>

          <button 
            onClick={onReturnHome} 
            className="flex items-center space-x-1.5 text-white/90 font-bold font-montserrat hover:text-[#fcd34d] transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[10px] whitespace-nowrap tracking-wide uppercase">Return Home</span>
          </button>
        </div>

        {/* Main Glass Content Card */}
        <div className="flex-grow bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] w-full flex flex-col items-center py-10 px-6 relative z-10 mb-6 min-h-[75vh]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[2rem]"></div>
          
          {/* Top Button State (INICIAR vs EXPLORANDO) */}
          {currentStep === 0 ? (
            <div className="flex flex-col items-center w-full animate-fade-in-up mt-10 relative z-10">
              <button 
                onClick={handleNext}
                className="bg-[#fcd34d] text-[#08203e] font-black font-montserrat text-sm tracking-widest px-10 py-3.5 rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all active:scale-95 uppercase"
              >
                INICIAR
              </button>
              <p className="text-xs text-white/70 font-montserrat mt-6 text-center leading-relaxed">
                Haz click en el botón e<br/>interactua con el diagrama.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full animate-fade-in mb-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-[#fcd34d] font-black font-montserrat text-[11px] tracking-widest px-6 py-2.5 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                EXPLORANDO
              </div>
              <p className="text-[11px] font-bold text-white/80 font-montserrat mt-5 text-center leading-relaxed">
                Toca el botón de<br/>
                <strong className="font-black text-[#fcd34d] text-[12px]">CONTINUAR</strong> para ver los<br/>
                siguientes pasos
              </p>
            </div>
          )}

          {/* Render Revealed Steps */}
          <div className="flex flex-col w-full items-center space-y-12 relative z-10">
            {steps.slice(0, currentStep).map((step, index) => (
              <div key={step.id} className="flex flex-col items-center w-full animate-fade-in-up">
                <img 
                  src={step.icon} 
                  alt={step.title} 
                  className="w-24 h-24 object-contain mb-4 brightness-0 invert opacity-90 drop-shadow-md"
                />
                <h3 className="text-[15px] font-black text-white drop-shadow-md font-montserrat text-center mb-1">
                  {step.title}
                </h3>
                <p className="text-[12px] text-white/70 font-montserrat text-center leading-relaxed max-w-[240px]">
                  {step.desc}
                </p>
                
                {/* CONTINUAR Button */}
                {index === currentStep - 1 && currentStep < steps.length && (
                  <button 
                    onClick={handleNext}
                    className="mt-8 bg-[#fcd34d] text-[#08203e] font-black font-montserrat text-xs tracking-widest px-10 py-3.5 rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all active:scale-95 uppercase"
                  >
                    CONTINUAR
                  </button>
                )}

                {/* INSCRIBIRSE Button */}
                {index === currentStep - 1 && currentStep === steps.length && (
                  <button 
                    onClick={onRegister}
                    className="mt-8 bg-[#fcd34d] text-[#08203e] font-black font-montserrat text-xs tracking-widest px-10 py-4 rounded-full shadow-[0_0_20px_rgba(252,211,77,0.5)] hover:bg-[#fde68a] hover:scale-105 transition-all active:scale-95 uppercase animate-pulse border-2 border-transparent"
                  >
                    INSCRIBIRSE
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Invisible div to scroll into view smoothly */}
          <div ref={bottomRef} className="h-6 w-full"></div>

        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// =========================================
// 2. DESKTOP & PC UI
// =========================================
const DesktopCyclePage = ({ onReturnHome, onRegister }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  // Custom Icon URLs
  const iconUrls = {
    step1: 'https://i.postimg.cc/hvd9RVBP/14(3).png', // Live Lab (Monitor)
    step2: 'https://i.postimg.cc/Cx1bFyYc/Diseno-sin-titulo-(15).png', // Práctica (Book)
    step3: 'https://i.postimg.cc/L5KJf7c8/16(3).png', // Agenda (Calendar)
    step4: 'https://i.postimg.cc/RVTW6gX3/17(2).png', // Clase 100% (Teacher)
    step5: 'https://i.postimg.cc/MKtGKvpz/18(1).png', // Aplica (Network)
  };

  return (
    <div className="relative h-screen w-full font-sans bg-[#070b19] text-white overflow-hidden flex flex-col p-4 md:p-8">
      <style>{`
        @keyframes pulse-yellow {
          0%, 100% { background-color: #fde68a; box-shadow: 0 0 15px rgba(252, 211, 77, 0.4); }
          50% { background-color: #fcd34d; box-shadow: 0 0 30px rgba(252, 211, 77, 0.8); }
        }
        .btn-blink { animation: pulse-yellow 2s infinite; }
      `}</style>

      {/* Neon Wavy Background Simulation */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex flex-row justify-between items-center w-full max-w-[90rem] mx-auto mb-2 shrink-0">
        <div className="flex items-center">
          <img
            src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png"
            alt="Outloud Logo"
            className="h-10 lg:h-12 object-contain opacity-90 drop-shadow-md shrink-0"
          />
          <div className="mx-4 h-8 w-[2px] bg-white/30 shrink-0"></div>
          <span className="text-base lg:text-xl font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide">
            Online Platform
          </span>
        </div>

        {/* FIXED: Added correct house icon matching Levels/Registration */}
        <button
          onClick={onReturnHome}
          className="flex items-center space-x-2 text-white font-bold font-montserrat hover:text-[#fcd34d] transition-colors z-50 shrink-0 ml-4"
        >
          <svg className="flex-none w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="flex-none text-xs md:text-sm lg:text-base whitespace-nowrap tracking-wider uppercase">
            Return Home
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="flex-none w-5 h-5 md:w-6 md:h-6">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </svg>
        </button>
      </div>

      {/* FIXED ASPECT RATIO CANVAS */}
      <div className="relative z-10 flex-grow w-full max-w-6xl mx-auto flex items-center justify-center">
        <div className="relative w-full aspect-[16/10] lg:aspect-[2/1] max-h-[75vh]">
          
          {/* SVG Arrow Connectors Layer (Glow/Neon styling) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fcd34d" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Start -> Step 1 */}
            {step >= 1 && (
              <path
                d="M 160 220 Q 200 130 250 130"
                fill="none"
                stroke="#fcd34d"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                filter="url(#glow)"
                className="animate-[fadeIn_0.5s_ease-in] drop-shadow-md"
              />
            )}
            {/* Step 1 -> Step 2 */}
            {step >= 2 && (
              <path
                d="M 430 130 L 580 130"
                fill="none"
                stroke="#fcd34d"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                filter="url(#glow)"
                className="animate-[fadeIn_0.5s_ease-in] drop-shadow-md"
              />
            )}

            {/* Step 2 -> Step 3 */}
            {step >= 3 && (
              <path
                d="M 750 130 Q 860 130 860 170"
                fill="none"
                stroke="#fcd34d"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                filter="url(#glow)"
                className="animate-[fadeIn_0.5s_ease-in] drop-shadow-md"
              />
            )}

            {/* Step 3 -> Step 4 */}
            {step >= 4 && (
              <path
                d="M 860 355 Q 860 380 750 380"
                fill="none"
                stroke="#fcd34d"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                filter="url(#glow)"
                className="animate-[fadeIn_0.5s_ease-in] drop-shadow-md"
              />
            )}

            {/* Step 4 -> Step 5 */}
            {step >= 5 && (
              <path
                d="M 580 380 L 440 380"
                fill="none"
                stroke="#fcd34d"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                filter="url(#glow)"
                className="animate-[fadeIn_0.5s_ease-in] drop-shadow-md"
              />
            )}
          </svg>

          {/* ---------------------------------------------------------------- */}
          {/* NODE 0: THE START BUTTON (Center-Left) */}
          <div className="absolute top-1/2 left-[12%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-40 md:w-48 z-20">
            {step === 0 ? (
              <button
                onClick={handleNext}
                className="w-full text-[#08203e] rounded-full py-3 lg:py-4 text-xs md:text-sm font-black font-montserrat tracking-widest btn-blink transition-transform hover:scale-105"
              >
                INICIAR
              </button>
            ) : (
              <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-[#fcd34d] rounded-full py-2.5 lg:py-3 text-xs md:text-sm font-black font-montserrat tracking-widest shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                EXPLORANDO
              </div>
            )}

            <p className="mt-4 text-[10px] md:text-xs text-white/70 font-montserrat font-medium leading-relaxed px-2">
              {step === 0
                ? 'Haz click en el botón e interactua con el diagrama.'
                : 'Toca el botón de CONTINUAR para ver los siguientes pasos'}
            </p>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* NODE 1 (Top Center-Left) */}
          <div
            className={`absolute top-[26%] left-[34%] -translate-x-1/2 -translate-y-1/2 w-48 lg:w-56 text-center transition-all duration-500 ${
              step >= 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={iconUrls.step1}
              alt="Live Lab"
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
            />
            <h4 className="text-[11px] lg:text-[13px] font-black text-white drop-shadow-md font-montserrat uppercase leading-tight">
              PASO 1: Live Lab
            </h4>
            <p className="text-[9px] lg:text-[11px] text-white/70 font-montserrat leading-relaxed mt-1.5">
              Entra a tu cuenta y adquiere nuevo vocabulario de forma
              interactiva
            </p>

            {step === 1 && (
              <button
                onClick={handleNext}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-4 bg-[#fcd34d] text-[#08203e] rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all animate-[fadeIn_0.3s_ease-in]"
              >
                CONTINUAR
              </button>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* NODE 2 (Top Center-Right) */}
          <div
            className={`absolute top-[26%] left-[67%] -translate-x-1/2 -translate-y-1/2 w-48 lg:w-56 text-center transition-all duration-500 ${
              step >= 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={iconUrls.step2}
              alt="Práctica"
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
            />
            <h4 className="text-[11px] lg:text-[13px] font-black text-white drop-shadow-md font-montserrat uppercase leading-tight">
              PASO 2: Práctica interactiva
            </h4>
            <p className="text-[9px] lg:text-[11px] text-white/70 font-montserrat leading-relaxed mt-1.5">
              Completa los ejercicios para afianzar lo aprendido.
            </p>

            {step === 2 && (
              <button
                onClick={handleNext}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-4 bg-[#fcd34d] text-[#08203e] rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all animate-[fadeIn_0.3s_ease-in]"
              >
                CONTINUAR
              </button>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* NODE 3 (Middle Right) */}
          <div
            className={`absolute top-[52%] left-[86%] -translate-x-1/2 -translate-y-1/2 w-48 lg:w-56 text-center transition-all duration-500 ${
              step >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={iconUrls.step3}
              alt="Agenda"
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
            />
            <h4 className="text-[11px] lg:text-[13px] font-black text-white drop-shadow-md font-montserrat uppercase leading-tight">
              PASO 3: Agenda tus clases
            </h4>
            <p className="text-[9px] lg:text-[11px] text-white/70 font-montserrat leading-relaxed mt-1.5">
              Reserva sesiones 100% en vivo con un profesor.
            </p>

            {step === 3 && (
              <button
                onClick={handleNext}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#fcd34d] text-[#08203e] rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all animate-[fadeIn_0.3s_ease-in]"
              >
                CONTINUAR
              </button>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* NODE 4 (Bottom Center-Right) */}
          <div
            className={`absolute top-[76%] left-[67%] -translate-x-1/2 -translate-y-1/2 w-48 lg:w-56 text-center transition-all duration-500 ${
              step >= 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={iconUrls.step4}
              alt="Clase"
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
            />
            <h4 className="text-[11px] lg:text-[13px] font-black text-white drop-shadow-md font-montserrat uppercase leading-tight">
              PASO 4: Clase 100% en vivo
            </h4>
            <p className="text-[9px] lg:text-[11px] text-white/70 font-montserrat leading-relaxed mt-1.5">
              Un instructor dictará clases interactivas, completamente
              prácticas, te aconsejará y te evaluará.
            </p>

            {step === 4 && (
              <button
                onClick={handleNext}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#fcd34d] text-[#08203e] rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all animate-[fadeIn_0.3s_ease-in]"
              >
                CONTINUAR
              </button>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* NODE 5 (Bottom Center-Left) */}
          <div
            className={`absolute top-[76%] left-[34%] -translate-x-1/2 -translate-y-1/2 w-48 lg:w-56 text-center transition-all duration-500 ${
              step >= 5 ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={iconUrls.step5}
              alt="Aplica"
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
            />
            <h4 className="text-[11px] lg:text-[13px] font-black text-white drop-shadow-md font-montserrat uppercase leading-tight">
              PASO 5: Aplica lo aprendido
            </h4>
            <p className="text-[9px] lg:text-[11px] text-white/70 font-montserrat leading-relaxed mt-1.5">
              Participa en actividades comunitarias con otros alumnos: foros,
              debates, club de conversación, salas de chat y más.
            </p>

            {step === 5 && (
              <button
                onClick={onRegister}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#fcd34d] text-[#08203e] rounded-full px-6 py-3 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-[0_0_20px_rgba(252,211,77,0.5)] hover:bg-[#fde68a] hover:scale-105 transition-all animate-pulse border-2 border-transparent"
              >
                INSCRIBIRME
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 3. THE INDEPENDENT ROUTER
// =========================================
const CyclePage = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileCyclePage {...props} /> : <DesktopCyclePage {...props} />;
};

export default CyclePage;