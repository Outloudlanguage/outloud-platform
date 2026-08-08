import React, { useState, useEffect } from 'react';

const FreeLesson = ({ onReturnHome }) => {
  // Navigation & Video States
  const [step, setStep] = useState('welcome'); // 'welcome' -> 'popup' -> 'video' -> 'exercise1' -> 'exercise2'
  const [replayCount, setReplayCount] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  // Exercise 1 States & Scoring
  const [scores, setScores] = useState({ correct: 0, incorrect: 0 });
  const [selectedPill, setSelectedPill] = useState(null); // For mobile tap-to-place
  const [dragSlots, setDragSlots] = useState({
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  });
  const [availableOptions, setAvailableOptions] = useState([
    'PLAZA HOTEL',
    'RECEPTION/\nFRONT DESK',
    'INTERNATIONAL\nAIRPORT',
    'BEDROOM',
  ]);

  // Background listener to catch the "video ended" signal from Bunny.net's iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.origin !== "https://player.mediadelivery.net") return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
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

  const handleStart = () => setStep('popup');
  const handleContinueToVideo = () => setStep('video');
  const handleReplay = () => {
    if (replayCount < 1) {
      setReplayCount(1);
      setIsEnded(false);
    }
  };

  const handleContinueNextPhase = () => {
    setStep('exercise1');
  };

  const getIframeUrl = () => {
    const isAutoplay = step === 'video' ? 'true' : 'false';
    return `https://player.mediadelivery.net/embed/723066/49a5d762-d35f-4b6f-ab7b-6565e06371b1?autoplay=${isAutoplay}&loop=false&muted=false&preload=true&responsive=true`;
  };

  // --- DRAG AND DROP / TAP LOGIC FOR EXERCISE 1 ---
  
  // HTML5 Drag
  const handleDragStart = (e, item, source) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, source }));
  };

  const handleDropOnSlot = (e, targetSlot) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData('text/plain');
    if (!dataString) return;
    const { item, source } = JSON.parse(dataString);
    processMove(item, source, targetSlot);
  };

  const handleDropOnBank = (e) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData('text/plain');
    if (!dataString) return;
    const { item, source } = JSON.parse(dataString);
    if (source.startsWith('slot')) {
      processMove(item, source, 'bank');
    }
  };

  // Mobile Tap
  const handlePillClick = (item, source) => {
    if (source === 'bank') {
      setSelectedPill(selectedPill === item ? null : item);
    } else if (source.startsWith('slot')) {
      processMove(item, source, 'bank');
      setSelectedPill(null);
    }
  };

  const handleSlotClick = (slotKey) => {
    if (selectedPill) {
      processMove(selectedPill, 'bank', slotKey);
      setSelectedPill(null);
    } else if (dragSlots[slotKey]) {
      processMove(dragSlots[slotKey], slotKey, 'bank');
    }
  };

  // Universal move processor (handles both Drag & Tap)
  const processMove = (item, source, target) => {
    setDragSlots(prev => {
      const newSlots = { ...prev };
      
      // Bank -> Slot
      if (source === 'bank' && target.startsWith('slot')) {
        if (newSlots[target]) {
          setAvailableOptions(opts => [...opts, newSlots[target]]);
        }
        newSlots[target] = item;
        setAvailableOptions(opts => opts.filter(o => o !== item));
      } 
      // Slot -> Bank
      else if (source.startsWith('slot') && target === 'bank') {
        newSlots[source] = null;
        setAvailableOptions(opts => [...opts, item]);
      }
      // Slot -> Slot (Swap)
      else if (source.startsWith('slot') && target.startsWith('slot') && source !== target) {
        const targetItem = newSlots[target];
        newSlots[target] = item;
        newSlots[source] = targetItem;
      }
      return newSlots;
    });
  };

  const handleCheckExercise1 = () => {
    let currentCorrect = 0;
    let currentIncorrect = 0;

    // Check answers silently against correct mappings
    if (dragSlots.slot1 === 'RECEPTION/\nFRONT DESK') currentCorrect++; else currentIncorrect++;
    if (dragSlots.slot2 === 'INTERNATIONAL\nAIRPORT') currentCorrect++; else currentIncorrect++;
    if (dragSlots.slot3 === 'PLAZA HOTEL') currentCorrect++; else currentIncorrect++;
    if (dragSlots.slot4 === 'BEDROOM') currentCorrect++; else currentIncorrect++;

    setScores(prev => ({
      correct: prev.correct + currentCorrect,
      incorrect: prev.incorrect + currentIncorrect
    }));

    // Move to next exercise
    setStep('exercise2');
  };

  const isEx1Complete = Object.values(dragSlots).every(v => v !== null);

  return (
    <div className="relative min-h-screen w-full font-sans bg-[#eef5fc] overflow-x-hidden flex flex-col items-center">
      
      {/* Background Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png"
          alt="Bubble Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* TOP HEADER */}
      <div className="relative z-50 w-full max-w-[90rem] flex justify-between items-center px-4 py-4 md:px-8 shrink-0">
        
        <div className="flex items-center space-x-2 md:space-x-4 w-1/3">
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

        <div className="w-1/3 flex justify-center">
          {/* Only show central title if we are in the focus/video mode */}
          {(step === 'welcome' || step === 'popup' || step === 'video') && (
            <h1 className="text-sm md:text-xl lg:text-2xl font-black text-outloud-blue font-montserrat uppercase tracking-wide whitespace-nowrap">
              A1: UNIT 1 - LESSON 1
            </h1>
          )}
        </div>

        <div className="flex items-center justify-end w-1/3">
          {/* REPLACED AVATAR WITH RETURN TO FORM BUTTON */}
          <button 
            onClick={onReturnHome} 
            className="flex items-center space-x-1.5 md:space-x-2 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs md:text-sm whitespace-nowrap">Regresar a planilla</span>
          </button>
        </div>

      </div>

      {/* STEP 1: WELCOME SCREEN */}
      {step === 'welcome' && (
        <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-2xl px-4 animate-fade-in-up">
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
        <div className="relative z-10 w-full flex-grow flex items-center justify-center min-h-0 pb-4 px-4">
          <div className="relative w-full max-w-5xl mx-auto aspect-video max-h-[75vh] rounded-[2rem] border-4 border-[#3b434b] shadow-[0_25px_50px_rgba(0,0,0,0.3)] bg-black overflow-hidden flex flex-col justify-center">
            
            <iframe 
              key={`bunny-player-${replayCount}`}
              src={getIframeUrl()} 
              loading="lazy" 
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;" 
              allowFullScreen={true}
            ></iframe>

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

      {/* STEP 4: EXERCISE 1 (DRAG AND DROP) */}
      {step === 'exercise1' && (
        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 md:px-8 pb-10 flex flex-col animate-fade-in">
          
          {/* Header Texts */}
          <div className="mb-6 md:mb-10 w-full">
            <h2 className="text-lg md:text-2xl lg:text-3xl text-outloud-blue font-montserrat">
              <span className="font-black uppercase">LESSON 1: ACTIVITY 1</span> - <span className="font-bold">Comprehension exercise.</span>
            </h2>
            <p className="text-sm md:text-lg lg:text-xl font-bold text-outloud-blue font-montserrat uppercase mt-1 md:mt-2 tracking-wide">
              DRAG AND DROP: <span className="font-normal">Match the text to the location.</span>
            </p>
          </div>

          {/* Grid Area */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 w-full">
            {[
              { id: 'slot1', img: 'https://i.postimg.cc/CLmdVSQX/1(3).png' },
              { id: 'slot2', img: 'https://i.postimg.cc/Hx9d4tGZ/2(4).png' },
              { id: 'slot3', img: 'https://i.postimg.cc/8P0DH5Y3/3(3).png' },
              { id: 'slot4', img: 'https://i.postimg.cc/tTpHTV1S/4(3).png' },
            ].map((col) => (
              <div key={col.id} className="flex flex-col items-center w-full space-y-4">
                {/* Image */}
                <div className="w-full aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] border-4 border-[#08203e] overflow-hidden shadow-lg bg-white">
                  <img src={col.img} alt={`Location ${col.id}`} className="w-full h-full object-cover" />
                </div>
                
                {/* Drop Zone */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnSlot(e, col.id)}
                  onClick={() => handleSlotClick(col.id)}
                  className={`w-full max-w-[90%] h-12 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    dragSlots[col.id] 
                      ? 'bg-[#08203e] border-2 border-transparent shadow-lg scale-105' 
                      : `bg-[#eef5fc]/50 border-2 border-dashed border-[#08203e] ${selectedPill ? 'ring-4 ring-student-yellow/50' : ''}`
                  }`}
                >
                  {dragSlots[col.id] && (
                    <div 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, dragSlots[col.id], col.id)}
                      className="w-full h-full flex items-center justify-center text-white text-[10px] md:text-[11px] lg:text-xs font-bold font-montserrat text-center px-4 cursor-grab whitespace-pre-line leading-tight"
                    >
                      {dragSlots[col.id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Options Bank (Bottom) */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnBank}
            className="mt-12 md:mt-16 w-full flex flex-wrap justify-center gap-3 md:gap-5 min-h-[4rem] p-4 rounded-3xl"
          >
            {availableOptions.map((opt) => (
              <div
                key={opt}
                draggable
                onClick={() => handlePillClick(opt, 'bank')}
                onDragStart={(e) => handleDragStart(e, opt, 'bank')}
                className={`px-6 py-3 rounded-full font-bold font-montserrat text-[10px] md:text-xs lg:text-sm text-center shadow-lg cursor-grab hover:-translate-y-1 transition-all flex items-center justify-center whitespace-pre-line leading-tight select-none ${
                  selectedPill === opt 
                    ? 'bg-student-yellow text-outloud-blue ring-4 ring-student-yellow/50 scale-110' 
                    : 'bg-[#08203e] text-white hover:bg-blue-900'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>

          {/* Continue Button (Appears when all 4 are dropped) */}
          <div className="mt-8 flex justify-center h-[5rem]">
            {isEx1Complete && (
              <button 
                onClick={handleCheckExercise1}
                className="bg-student-yellow text-outloud-blue font-black px-12 md:px-16 py-3 md:py-4 rounded-2xl shadow-xl transition-transform hover:scale-105 uppercase tracking-widest text-sm md:text-lg animate-fade-in-up"
              >
                CONTINUAR
              </button>
            )}
          </div>

        </div>
      )}

      {/* Placeholder for Next Exercise */}
      {step === 'exercise2' && (
        <div className="relative z-10 flex-grow flex items-center justify-center text-outloud-blue font-black text-2xl font-montserrat animate-fade-in">
          READY FOR EXERCISE 2...
        </div>
      )}

      {/* Utility Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        
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