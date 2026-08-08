import React, { useState, useEffect } from 'react';

const FreeLesson = ({ onReturnHome }) => {
  // State machine: 'welcome' -> 'popup' -> 'video'
  const [step, setStep] = useState('welcome');
  const [replayCount, setReplayCount] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  // Background listener to catch the "video ended" signal from Bunny.net's iframe
  useEffect(() => {
    const handleMessage = (e) => {
      // Ensure the message is coming from Bunny
      if (e.origin !== "https://player.mediadelivery.net") return;
      
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        // When Bunny says the video is done, trigger our custom end screen
        if (data.event === 'ended' || data.event === 'videoEnded') {
          setIsEnded(true);
        }
      } catch (err) {
        console.error("Error parsing iframe message:", err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleStart = () => {
    setStep('popup');
  };

  const handleContinueToVideo = () => {
    setStep('video');
  };

  const handleReplay = () => {
    if (replayCount < 1) {
      setReplayCount(1);
      setIsEnded(false);
      // Changing the state forces the iframe to re-render and play again
    }
  };

  const handleContinueNextPhase = () => {
    alert("Moving to the interactive activities... (To be coded next!)");
  };

  // Dynamically generate the Bunny iframe URL based on the current step
  const getIframeUrl = () => {
    const isAutoplay = step === 'video' ? 'true' : 'false';
    // Muted is false so students can hear the instructor!
    return `https://player.mediadelivery.net/embed/723066/49a5d762-d35f-4b6f-ab7b-6565e06371b1?autoplay=${isAutoplay}&loop=false&muted=false&preload=true&responsive=true`;
  };

  return (
    <div className="relative h-screen w-full font-sans bg-[#eef5fc] overflow-hidden flex flex-col items-center p-4 lg:p-6">
      
      {/* Background Bubbles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png"
          alt="Bubble Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* TOP HEADER (Focus Mode - Yellow Free) */}
      <div className="relative z-50 w-full max-w-[90rem] flex justify-between items-center mb-4 lg:mb-6 shrink-0">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-2 md:space-x-4 w-1/4">
          <img 
            src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" 
            alt="Outloud Logo" 
            className="h-8 md:h-10 lg:h-11 object-contain" 
          />
          <div className="h-6 md:h-8 w-[2px] bg-outloud-blue opacity-40"></div>
          <span className="hidden md:block text-xs lg:text-sm font-light text-outloud-blue font-montserrat whitespace-nowrap">
            Online Platform
          </span>
        </div>

        {/* Center: Lesson Title */}
        <div className="w-2/4 flex justify-center">
          <h1 className="text-sm md:text-xl lg:text-2xl font-black text-outloud-blue font-montserrat uppercase tracking-wide whitespace-nowrap">
            A1: UNIT 1 - LESSON 1
          </h1>
        </div>

        {/* Right: Exit */}
        <div className="flex items-center justify-end w-1/4">
          <button 
            onClick={onReturnHome} 
            className="flex items-center space-x-2 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition"
          >
            <span className="text-sm md:text-base whitespace-nowrap">Exit</span>
          </button>
        </div>
      </div>

      {/* STEP 1: WELCOME SCREEN */}
      {step === 'welcome' && (
        <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-2xl mx-auto animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.1)] p-8 md:p-12 text-center border border-white/60">
            <h1 className="text-2xl md:text-4xl font-black text-outloud-blue font-montserrat mb-4 tracking-wide uppercase">
              ¡Bienvenido a tu clase de prueba!
            </h1>
            <p className="text-sm md:text-base text-outloud-blue/80 font-montserrat leading-relaxed">
              Prepárate para experimentar nuestro método inmersivo. Olvídate de la teoría rígida y de traducir en tu cabeza. Estás a un paso de comenzar a pensar en inglés de forma natural y fluida.
            </p>
          </div>
          
          <button 
            onClick={handleStart}
            className="mt-8 bg-student-yellow text-outloud-blue text-lg md:text-xl font-black font-montserrat px-12 py-4 rounded-full shadow-lg transition-transform animate-pulse hover:scale-105 uppercase tracking-widest border-2 border-transparent"
          >
            START
          </button>
        </div>
      )}

      {/* STEP 2 & 3: BUNNY.NET VIDEO PLAYER */}
      {(step === 'popup' || step === 'video') && (
        <div className="relative z-10 w-full flex-grow flex items-center justify-center min-h-0 pb-4">
          
          {/* FIXED: Using aspect-video and max-h-[75vh] so the player shrinks to fit the screen height perfectly */}
          <div className="relative w-full max-w-5xl mx-auto aspect-video max-h-[75vh] rounded-[2rem] border-4 border-[#3b434b] shadow-[0_25px_50px_rgba(0,0,0,0.3)] bg-black overflow-hidden flex flex-col justify-center">
            
            {/* The responsive Iframe */}
            <iframe 
              key={`bunny-player-${replayCount}`}
              src={getIframeUrl()} 
              loading="lazy" 
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;" 
              allowFullScreen={true}
            ></iframe>

            {/* INSTRUCTION POPUP (Blocks video interactions until dismissed) */}
            {step === 'popup' && (
              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 z-30 bg-black/60 backdrop-blur-sm">
                <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-10 max-w-lg text-center border border-white/60 animate-fade-in-up">
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-outloud-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-outloud-blue font-montserrat leading-relaxed mb-6 sm:mb-8">
                    Vea el video y preste cuidadosa atención al contenido, lo que aprenda en él le servirá más tarde para su <strong className="font-black text-sm sm:text-lg">LECCIÓN EN VIVO</strong> con un instructor y para sus actividades interactivas.
                  </p>
                  <button 
                    onClick={handleContinueToVideo}
                    className="w-full bg-outloud-blue hover:bg-blue-900 text-white font-black font-montserrat py-3 rounded-xl shadow-md transition-colors text-xs sm:text-sm uppercase tracking-wide"
                  >
                    CONTINUAR
                  </button>
                </div>
              </div>
            )}

            {/* END STATE: CUSTOM REPLAY AND CONTINUE MENU */}
            {isEnded && (
              <div className="absolute inset-0 bg-outloud-blue/90 backdrop-blur-md flex items-center justify-center p-6 z-40 animate-fade-in">
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 max-w-md w-full text-center flex flex-col space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-outloud-blue font-tabarra mb-2 uppercase">¡Excelente trabajo!</h3>
                  <p className="text-xs sm:text-sm text-outloud-blue/80 font-montserrat mb-4">¿Estás listo para continuar con la siguiente fase de tu lección?</p>
                  
                  <button 
                    onClick={handleContinueNextPhase}
                    className="w-full bg-student-yellow hover:bg-yellow-500 text-outloud-blue font-black font-montserrat py-3 sm:py-4 rounded-xl shadow-sm transition-colors text-xs sm:text-sm uppercase tracking-wider"
                  >
                    CONTINUAR
                  </button>

                  {/* Only display the replay button if they haven't used their 1 allowed replay */}
                  {replayCount === 0 && (
                    <button 
                      onClick={handleReplay}
                      className="w-full bg-transparent border-2 border-outloud-blue text-outloud-blue hover:bg-blue-50 font-black font-montserrat py-2 sm:py-3 rounded-xl transition-colors text-[10px] sm:text-xs uppercase tracking-widest mt-2"
                    >
                      REPLAY (1 restante)
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Utility Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FreeLesson;