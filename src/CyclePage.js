import React, { useState, useEffect, useRef } from 'react';

// =========================================
// 1. MOBILE & TABLET PORTRAIT UI
// =========================================
const MobileCyclePage = ({ onReturnHome, onRegister }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const bottomRef = useRef(null);

  // Extracted from your original desktop code
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
    <div className="relative min-h-screen w-full font-sans bg-[#eef5fc] flex flex-col overflow-y-auto overflow-x-hidden">
      
      {/* Background Bubbles (Same as Desktop) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png"
          alt="Bubble Background"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      <div className="relative z-10 flex flex-col w-full px-5 py-6 flex-grow">
        
        {/* Top Header */}
        <div className="flex flex-row justify-between items-center w-full mb-8">
          <div className="flex items-center space-x-2">
            <img 
              src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" 
              alt="Outloud Logo" 
              className="h-6 object-contain" 
            />
            <div className="h-5 w-[1px] bg-outloud-blue opacity-40"></div>
            <span className="text-[10px] font-light text-outloud-blue font-montserrat whitespace-nowrap">
              Online Platform
            </span>
          </div>

          <button 
            onClick={onReturnHome} 
            className="flex items-center space-x-1 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition bg-white/50 px-2 py-1 rounded-full backdrop-blur-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[11px] whitespace-nowrap">Return Home</span>
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </button>
        </div>

        {/* Main White Content Card */}
        <div className="flex-grow bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] w-full flex flex-col items-center py-10 px-6 relative z-10 mb-6 min-h-[75vh]">
          
          {/* Top Button State (INICIAR vs EXPLORANDO) */}
          {currentStep === 0 ? (
            <div className="flex flex-col items-center w-full animate-fade-in-up mt-10">
              <button 
                onClick={handleNext}
                className="bg-[#08203e] text-white font-black font-montserrat text-sm tracking-widest px-8 py-3 rounded-xl shadow-[0_8px_20px_rgba(8,32,62,0.3)] hover:scale-105 transition-transform"
              >
                INICIAR
              </button>
              <p className="text-xs text-outloud-blue font-montserrat mt-6 text-center leading-relaxed">
                Haz click en el botón e<br/>interactua con el diagrama.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full animate-fade-in mb-8">
              <div className="bg-white text-outloud-blue border border-gray-100 font-black font-montserrat text-[11px] tracking-widest px-6 py-2.5 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)]">
                EXPLORANDO
              </div>
              <p className="text-[11px] font-bold text-outloud-blue font-montserrat mt-4 text-center leading-relaxed">
                Toca el botón de<br/>
                <strong className="font-black text-[12px]">CONTINUAR</strong> para ver los<br/>
                siguientes pasos
              </p>
            </div>
          )}

          {/* Render Revealed Steps */}
          <div className="flex flex-col w-full items-center space-y-12">
            {steps.slice(0, currentStep).map((step, index) => (
              <div key={step.id} className="flex flex-col items-center w-full animate-fade-in-up">
                <img 
                  src={step.icon} 
                  alt={step.title} 
                  className="w-24 h-24 object-contain mb-4"
                />
                <h3 className="text-[15px] font-black text-outloud-blue font-montserrat text-center mb-1">
                  {step.title}
                </h3>
                <p className="text-[12px] text-outloud-blue font-montserrat text-center leading-relaxed max-w-[240px]">
                  {step.desc}
                </p>
                
                {/* CONTINUAR Button (Renders under the LATEST step unless it's the last step) */}
                {index === currentStep - 1 && currentStep < steps.length && (
                  <button 
                    onClick={handleNext}
                    className="mt-8 bg-student-yellow text-outloud-blue font-black font-montserrat text-xs tracking-widest px-8 py-3 rounded-xl shadow-[0_8px_20px_rgba(250,204,21,0.4)] hover:scale-105 transition-transform uppercase"
                  >
                    CONTINUAR
                  </button>
                )}

                {/* INSCRIBIRSE Button (Renders under the very last step) */}
                {index === currentStep - 1 && currentStep === steps.length && (
                  <button 
                    onClick={onRegister}
                    className="mt-8 bg-student-yellow text-outloud-blue font-black font-montserrat text-xs tracking-widest px-10 py-3.5 rounded-full shadow-[0_8px_20px_rgba(250,204,21,0.4)] hover:scale-105 transition-transform uppercase border-2 border-transparent animate-pulse"
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
// 2. DESKTOP & PC UI (Original Code)
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
    <div className="relative h-screen w-full font-sans bg-[#eef5fc] overflow-hidden flex flex-col p-4 md:p-8">
      <style>{`
        @keyframes pulse-yellow {
          0%, 100% { background-color: #fef08a; box-shadow: 0 0 15px rgba(234, 179, 8, 0.4); }
          50% { background-color: #eab308; box-shadow: 0 0 25px rgba(234, 179, 8, 0.7); }
        }
        .btn-blink { animation: pulse-yellow 1.5s infinite; }
      `}</style>

      {/* Bubble Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png"
          alt="Bubble Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex flex-row justify-between items-center w-full max-w-[90rem] mx-auto mb-2 shrink-0">
        <div className="flex items-center">
          <img
            src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png"
            alt="Outloud Logo"
            className="h-10 lg:h-12 object-contain shrink-0"
          />
          <div className="mx-4 h-8 w-[2px] bg-outloud-blue opacity-40 shrink-0"></div>
          <span className="text-base lg:text-xl font-light text-outloud-blue font-montserrat whitespace-nowrap">
            Online Platform
          </span>
        </div>

        <button
          onClick={onReturnHome}
          className="flex items-center space-x-2 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm lg:text-base whitespace-nowrap">
            Return Home
          </span>
          <svg
            className="w-5 h-5 lg:w-6 lg:h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>
      </div>

      {/* FIXED ASPECT RATIO CANVAS */}
      <div className="relative z-10 flex-grow w-full max-w-6xl mx-auto flex items-center justify-center">
        <div className="relative w-full aspect-[16/10] lg:aspect-[2/1] max-h-[75vh]">
          {/* SVG Arrow Connectors Layer */}
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
              </marker>
            </defs>

            {/* Start -> Step 1 */}
            {step >= 1 && (
              <path
                d="M 160 220 Q 200 130 250 130"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                className="animate-[fadeIn_0.5s_ease-in]"
              />
            )}
            {/* Step 1 -> Step 2 */}
            {step >= 2 && (
              <path
                d="M 430 130 L 580 130"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                className="animate-[fadeIn_0.5s_ease-in]"
              />
            )}

            {/* Step 2 -> Step 3 (Adjusted to stop above the calendar icon) */}
            {step >= 3 && (
              <path
                d="M 750 130 Q 860 130 860 170"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                className="animate-[fadeIn_0.5s_ease-in]"
              />
            )}

            {/* Step 3 -> Step 4 (Adjusted to start below the paragraph text) */}
            {step >= 4 && (
              <path
                d="M 860 355 Q 860 380 750 380"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                className="animate-[fadeIn_0.5s_ease-in]"
              />
            )}

            {/* Step 4 -> Step 5 */}
            {step >= 5 && (
              <path
                d="M 580 380 L 440 380"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="3"
                markerEnd="url(#arrow)"
                className="animate-[fadeIn_0.5s_ease-in]"
              />
            )}
          </svg>

          {/* ---------------------------------------------------------------- */}
          {/* NODE 0: THE START BUTTON (Center-Left) */}
          <div className="absolute top-1/2 left-[12%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-40 md:w-48 z-20">
            {step === 0 ? (
              <button
                onClick={handleNext}
                className="w-full bg-outloud-blue text-white rounded-full py-3 lg:py-4 text-xs md:text-sm font-black font-montserrat tracking-widest btn-blink transition-transform hover:scale-105"
              >
                INICIAR
              </button>
            ) : (
              <div className="w-full bg-white text-outloud-blue rounded-full py-2.5 lg:py-3 text-xs md:text-sm font-black font-montserrat tracking-widest shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-gray-100">
                EXPLORANDO
              </div>
            )}

            <p className="mt-3 text-[10px] md:text-xs text-outloud-blue font-montserrat font-bold leading-tight px-2">
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
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-2"
            />
            <h4 className="text-[11px] lg:text-sm font-black text-outloud-blue font-montserrat uppercase leading-tight">
              PASO 1: Live Lab
            </h4>
            <p className="text-[9px] lg:text-[11px] text-outloud-blue/80 font-montserrat leading-tight mt-1">
              Entra a tu cuenta y adquiere nuevo vocabulario de forma
              interactiva
            </p>

            {step === 1 && (
              <button
                onClick={handleNext}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-4 bg-student-yellow text-outloud-blue rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-md hover:bg-yellow-500 transition-colors animate-[fadeIn_0.3s_ease-in]"
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
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-2"
            />
            <h4 className="text-[11px] lg:text-sm font-black text-outloud-blue font-montserrat uppercase leading-tight">
              PASO 2: Práctica interactiva
            </h4>
            <p className="text-[9px] lg:text-[11px] text-outloud-blue/80 font-montserrat leading-tight mt-1">
              Completa los ejercicios para afianzar lo aprendido.
            </p>

            {step === 2 && (
              <button
                onClick={handleNext}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-4 bg-student-yellow text-outloud-blue rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-md hover:bg-yellow-500 transition-colors animate-[fadeIn_0.3s_ease-in]"
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
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-2"
            />
            <h4 className="text-[11px] lg:text-sm font-black text-outloud-blue font-montserrat uppercase leading-tight">
              PASO 3: Agenda tus clases
            </h4>
            <p className="text-[9px] lg:text-[11px] text-outloud-blue/80 font-montserrat leading-tight mt-1">
              Reserva sesiones 100% en vivo con un profesor.
            </p>

            {step === 3 && (
              <button
                onClick={handleNext}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-student-yellow text-outloud-blue rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-md hover:bg-yellow-500 transition-colors animate-[fadeIn_0.3s_ease-in]"
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
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-2"
            />
            <h4 className="text-[11px] lg:text-sm font-black text-outloud-blue font-montserrat uppercase leading-tight">
              PASO 4: Clase 100% en vivo
            </h4>
            <p className="text-[9px] lg:text-[11px] text-outloud-blue/80 font-montserrat leading-tight mt-1">
              Un instructor dictará clases interactivas, completamente
              prácticas, te aconsejará y te evaluará.
            </p>

            {step === 4 && (
              <button
                onClick={handleNext}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-student-yellow text-outloud-blue rounded-full px-6 py-2.5 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-md hover:bg-yellow-500 transition-colors animate-[fadeIn_0.3s_ease-in]"
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
              className="h-14 md:h-16 lg:h-20 mx-auto object-contain mb-2"
            />
            <h4 className="text-[11px] lg:text-sm font-black text-outloud-blue font-montserrat uppercase leading-tight">
              PASO 5: Aplica lo aprendido
            </h4>
            <p className="text-[9px] lg:text-[11px] text-outloud-blue/80 font-montserrat leading-tight mt-1">
              Participa en actividades comunitarias con otros alumnos: foros,
              debates, club de conversación, salas de chat y más.
            </p>

            {step === 5 && (
              <button
                onClick={onRegister}
                className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-student-yellow text-outloud-blue rounded-full px-6 py-3 text-[11px] lg:text-xs font-black font-montserrat tracking-wider shadow-md hover:bg-yellow-500 transition-colors animate-[fadeIn_0.3s_ease-in]"
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
      // Determines if the device screen is mobile/tablet portrait width
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Serves completely isolated components based on device type
  return isMobile ? <MobileCyclePage {...props} /> : <DesktopCyclePage {...props} />;
};

export default CyclePage;