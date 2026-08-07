import React, { useState } from 'react';

const CyclePage = ({ onReturnHome, onRegister }) => {
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

export default CyclePage;
