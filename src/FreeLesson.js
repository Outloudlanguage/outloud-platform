import React, { useState, useEffect, useRef } from 'react';

const FreeLesson = ({ onReturnHome, onReturnToRegister }) => {
  // Navigation & Video States
  const [step, setStep] = useState('welcome'); // 'welcome' -> 'popup' -> 'video' -> 'exercise1' -> 'exercise2' -> 'exercise3' -> 'next_placeholder'
  const [replayCount, setReplayCount] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  // Exercise 1 States & Scoring
  const [scores, setScores] = useState({ correct: 0, incorrect: 0 });
  const [selectedPill, setSelectedPill] = useState(null);
  const [dragSlots, setDragSlots] = useState({
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  });
  
  const allOptions = [
    'PLAZA HOTEL',
    'RECEPTION/\nFRONT DESK',
    'INTERNATIONAL\nAIRPORT',
    'BEDROOM'
  ];
  const [availableOptions, setAvailableOptions] = useState([...allOptions]);

  // Exercise 2 & 3 States (Audio Recording & Playback)
  const originalAudioUrl = "https://Outloud.b-cdn.net/ElevenLabs_2026-07-16T17_24_13_Jason%20-%20Persuasive%20and%20Engaging_pvc_sp100_s50_sb75_v3-%5BAudioTrimmer.com%5D.mp3";
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [activeAudio, setActiveAudio] = useState(null);
  
  const originalAudioRef = useRef(null);
  const recordedAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Setup Original Audio
  useEffect(() => {
    originalAudioRef.current = new Audio(originalAudioUrl);
    originalAudioRef.current.addEventListener('ended', () => {
      setActiveAudio(null);
    });

    return () => {
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        originalAudioRef.current.src = '';
      }
    };
  }, []);

  // Background listener for Bunny.net video
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        let data = e.data;
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch(err) {}
        }
        if (data && (data.event === 'ended' || data.type === 'ended' || data.event === 'videoEnded')) {
          setIsEnded(true);
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleStart = () => setStep('popup');
  const handleContinueToVideo = () => setStep('video');
  const handleContinueToEx1 = () => setStep('exercise1');

  const getIframeUrl = () => {
    const isAutoplay = step === 'video' ? 'true' : 'false';
    return `https://player.mediadelivery.net/embed/723066/49a5d762-d35f-4b6f-ab7b-6565e06371b1?autoplay=${isAutoplay}&loop=false&muted=false&preload=true&responsive=true&primaryColor=005b9f`;
  };

  // --- EXERCISE 1 LOGIC ---
  const handleDragStart = (e, item, source) => e.dataTransfer.setData('text/plain', JSON.stringify({ item, source }));
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
    if (source.startsWith('slot')) processMove(item, source, 'bank');
  };
  const handlePillClick = (item, source) => {
    if (source === 'bank') setSelectedPill(selectedPill === item ? null : item);
    else if (source.startsWith('slot')) { processMove(item, source, 'bank'); setSelectedPill(null); }
  };
  const handleSlotClick = (slotKey) => {
    if (selectedPill) { processMove(selectedPill, 'bank', slotKey); setSelectedPill(null); }
    else if (dragSlots[slotKey]) processMove(dragSlots[slotKey], slotKey, 'bank');
  };
  const processMove = (item, source, target) => {
    setDragSlots(prev => {
      const newSlots = { ...prev };
      if (source === 'bank' && target.startsWith('slot')) {
        if (newSlots[target]) setAvailableOptions(opts => [...opts, newSlots[target]]);
        newSlots[target] = item;
        setAvailableOptions(opts => opts.filter(o => o !== item));
      } else if (source.startsWith('slot') && target === 'bank') {
        newSlots[source] = null;
        setAvailableOptions(opts => [...opts, item]);
      } else if (source.startsWith('slot') && target.startsWith('slot') && source !== target) {
        const targetItem = newSlots[target];
        newSlots[target] = item;
        newSlots[source] = targetItem;
      }
      return newSlots;
    });
  };

  const handleCheckExercise1 = () => {
    let currentCorrect = 0; let currentIncorrect = 0;
    if (dragSlots.slot1 === 'RECEPTION/\nFRONT DESK') currentCorrect++; else currentIncorrect++;
    if (dragSlots.slot2 === 'INTERNATIONAL\nAIRPORT') currentCorrect++; else currentIncorrect++;
    if (dragSlots.slot3 === 'PLAZA HOTEL') currentCorrect++; else currentIncorrect++;
    if (dragSlots.slot4 === 'BEDROOM') currentCorrect++; else currentIncorrect++;
    setScores(prev => ({ correct: prev.correct + currentCorrect, incorrect: prev.incorrect + currentIncorrect }));
    setStep('exercise2');
  };
  const isEx1Complete = Object.values(dragSlots).every(v => v !== null);

  // --- EXERCISE 2 & 3 LOGIC ---
  const playOriginalAudio = () => {
    if (activeAudio === 'user' && recordedAudioRef.current) {
      recordedAudioRef.current.pause(); recordedAudioRef.current.currentTime = 0;
    }
    setActiveAudio('original');
    originalAudioRef.current.currentTime = 0;
    originalAudioRef.current.play();
  };

  const playRecordedAudio = () => {
    if (!recordedAudioRef.current) return;
    if (activeAudio === 'original' && originalAudioRef.current) {
      originalAudioRef.current.pause(); originalAudioRef.current.currentTime = 0;
    }
    setActiveAudio('user');
    setHasCompared(true);
    recordedAudioRef.current.currentTime = 0;
    recordedAudioRef.current.play();
  };

  const toggleRecording = async () => {
    if (activeAudio === 'original') originalAudioRef.current.pause();
    if (activeAudio === 'user') recordedAudioRef.current.pause();
    setActiveAudio(null);

    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);
          if (recordedAudioRef.current) { recordedAudioRef.current.pause(); recordedAudioRef.current.src = ''; }
          recordedAudioRef.current = new Audio(audioUrl);
          recordedAudioRef.current.addEventListener('ended', () => { setActiveAudio(null); });
          setHasRecorded(true);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Para realizar este ejercicio, por favor permite el acceso al micrófono en tu navegador.");
      }
    }
  };

  const handleContinueToEx3 = () => { setStep('exercise3'); setActiveAudio(null); };
  const handleRetryEx2 = () => { setStep('exercise2'); setHasRecorded(false); setHasCompared(false); setActiveAudio(null); };
  const handleContinueToEx4 = () => { setStep('next_placeholder'); };

  return (
    <div className="relative min-h-screen w-full font-sans bg-[#eef5fc] overflow-x-hidden flex flex-col items-center">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png" alt="Bubble Background" className="w-full h-full object-cover" />
      </div>

      {/* TOP HEADER */}
      <div className="relative z-50 w-full max-w-[90rem] flex justify-between items-center px-4 py-2 md:py-3 shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3 w-1/3">
          <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Outloud Logo" className="h-7 md:h-9 object-contain" />
          <div className="h-5 md:h-7 w-[2px] bg-outloud-blue opacity-40"></div>
          <span className="hidden md:block text-xs font-light text-outloud-blue font-montserrat whitespace-nowrap">Online Platform</span>
        </div>
        <div className="w-1/3 flex justify-center">
          {['welcome', 'popup', 'video'].includes(step) && (
            <h1 className="text-xs md:text-base lg:text-lg font-black text-outloud-blue font-montserrat uppercase tracking-wide whitespace-nowrap">A1: UNIT 1 - LESSON 1</h1>
          )}
        </div>
        <div className="flex items-center justify-end w-1/3">
          <button onClick={onReturnToRegister || onReturnHome} className="flex items-center space-x-1.5 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span className="text-[11px] md:text-xs whitespace-nowrap">Regresar a planilla</span>
          </button>
        </div>
      </div>

      {/* STEP 1: WELCOME */}
      {step === 'welcome' && (
        <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-2xl px-4 animate-fade-in-up pb-10">
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.1)] p-8 md:p-12 text-center border border-white/60">
            <h1 className="text-2xl md:text-4xl font-black text-outloud-blue font-montserrat mb-4 tracking-wide uppercase">¡Bienvenido a tu clase de prueba!</h1>
            <p className="text-sm md:text-base text-outloud-blue/80 font-montserrat leading-relaxed">Prepárate para experimentar nuestro método inmersivo. Olvídate de la teoría rígida y de traducir en tu cabeza. Estás a un paso de comenzar a pensar en inglés de forma natural y fluida.</p>
          </div>
          <button onClick={handleStart} className="mt-8 bg-student-yellow text-outloud-blue text-lg md:text-xl font-black font-montserrat px-12 py-4 rounded-full shadow-lg transition-transform animate-pulse hover:scale-105 uppercase tracking-widest border-2 border-transparent">START</button>
        </div>
      )}

      {/* STEP 2 & 3: VIDEO */}
      {(step === 'popup' || step === 'video') && (
        <div className="relative z-10 w-full flex-grow flex items-center justify-center min-h-0 pb-10 px-4">
          <div className="flex flex-row items-center justify-center w-full max-w-6xl gap-4 md:gap-8 h-full">
            <div className="relative flex-grow aspect-video max-h-[80vh] rounded-[2rem] border-4 border-[#3b434b] shadow-[0_25px_50px_rgba(0,0,0,0.3)] bg-black overflow-hidden flex flex-col justify-center">
              <iframe key={`bunny-player-${replayCount}`} src={getIframeUrl()} loading="lazy" className="absolute inset-0 w-full h-full border-none" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;" allowFullScreen={true}></iframe>
              
              {step === 'video' && !isEnded && (
                <button onClick={() => setIsEnded(true)} className="absolute top-4 right-4 z-50 bg-red-600 text-white font-black font-montserrat px-6 py-2 rounded-xl shadow-2xl hover:bg-red-700 animate-pulse border-2 border-white uppercase tracking-widest text-xs">
                  DEV: SKIP VIDEO
                </button>
              )}

              {step === 'popup' && (
                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 z-30 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-10 max-w-lg text-center border border-white/60 animate-fade-in-up">
                    <div className="mb-4 flex justify-center"><svg className="w-10 h-10 text-outloud-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></div>
                    <p className="text-xs sm:text-sm md:text-base text-outloud-blue font-montserrat leading-relaxed mb-6">Vea el video y preste cuidadosa atención al contenido, lo que aprenda en él le servirá más tarde para su <strong className="font-black text-sm sm:text-lg">LECCIÓN EN VIVO</strong> con un instructor y para sus actividades interactivas.</p>
                    <button onClick={handleContinueToVideo} className="w-full bg-outloud-blue hover:bg-blue-900 text-white font-black font-montserrat py-3 rounded-xl shadow-md transition-colors text-xs sm:text-sm uppercase tracking-wide">CONTINUAR</button>
                  </div>
                </div>
              )}
            </div>

            {step === 'video' && (
              <div className="flex flex-col items-center justify-center shrink-0">
                <button 
                  onClick={handleContinueToEx1}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-outloud-blue hover:bg-blue-900 flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                    isEnded ? 'animate-pulse ring-4 ring-student-yellow ring-offset-2 ring-offset-[#eef5fc] scale-110' : ''
                  }`}
                  title="Continuar"
                >
                  <svg className="w-8 h-8 md:w-10 md:h-10 ml-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: EXERCISE 1 (DRAG AND DROP) */}
      {step === 'exercise1' && (
        <div className="relative z-10 w-full max-w-[62rem] mx-auto px-6 md:px-16 lg:px-24 xl:px-32 flex flex-col flex-grow animate-fade-in pb-12">
          
          <div className="mb-2 md:mb-4 shrink-0 w-full text-center md:text-left">
            <h2 className="text-sm md:text-lg lg:text-xl text-outloud-blue font-montserrat">
              <span className="font-black uppercase">LESSON 1: ACTIVITY 1</span> - <span className="font-bold">Comprehension exercise.</span>
            </h2>
            <p className="text-[10px] md:text-[11px] lg:text-xs font-bold text-outloud-blue font-montserrat uppercase tracking-wide mt-0.5">
              DRAG AND DROP: <span className="font-normal">Match the text to the location.</span>
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-5 w-full shrink-0">
            {[
              { id: 'slot1', img: 'https://i.postimg.cc/CLmdVSQX/1(3).png' },
              { id: 'slot2', img: 'https://i.postimg.cc/Hx9d4tGZ/2(4).png' },
              { id: 'slot3', img: 'https://i.postimg.cc/8P0DH5Y3/3(3).png' },
              { id: 'slot4', img: 'https://i.postimg.cc/tTpHTV1S/4(3).png' },
            ].map((col) => (
              <div key={col.id} className="flex flex-col items-center w-full space-y-2 md:space-y-3">
                <div className="w-full aspect-[4/5] rounded-[1rem] lg:rounded-[1.5rem] border-[3px] md:border-4 border-[#08203e] overflow-hidden shadow-lg bg-white relative shrink-0">
                  <img src={col.img} alt={`Location ${col.id}`} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnSlot(e, col.id)} onClick={() => handleSlotClick(col.id)}
                  className={`w-full h-8 md:h-10 lg:h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden ${
                    dragSlots[col.id] ? 'bg-transparent border-none' : 'bg-[#eef5fc]/50 border-2 border-dashed border-[#08203e]'
                  } ${selectedPill ? 'ring-2 ring-student-yellow' : ''}`}
                >
                  {dragSlots[col.id] && (
                    <div draggable onDragStart={(e) => handleDragStart(e, dragSlots[col.id], col.id)} 
                      className="w-full h-full bg-[#08203e] text-white rounded-full flex items-center justify-center text-[9px] md:text-[10px] lg:text-[11px] font-bold font-montserrat text-center px-1 cursor-grab shadow-sm whitespace-pre-line leading-tight"
                    >
                      {dragSlots[col.id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 flex flex-col items-center w-full mt-4 md:mt-6">
            
            {/* FIXED: Hides the pill bank entirely when complete to immediately show the Continue button right below the slots */}
            <div onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnBank} className={`w-full grid grid-cols-4 gap-2 md:gap-4 lg:gap-5 ${isEx1Complete ? 'hidden' : ''}`}>
              {allOptions.map((opt) => {
                if (!availableOptions.includes(opt)) {
                  return <div key={`empty-${opt}`} className="w-full h-8 md:h-10 lg:h-12"></div>;
                }
                return (
                  <div key={opt} draggable onClick={() => handlePillClick(opt, 'bank')} onDragStart={(e) => handleDragStart(e, opt, 'bank')}
                    className={`w-full h-8 md:h-10 lg:h-12 rounded-full font-bold font-montserrat text-[8px] md:text-[10px] lg:text-[11px] text-center shadow-md cursor-grab hover:-translate-y-1 transition-all flex items-center justify-center whitespace-pre-line leading-tight select-none px-1 ${
                      selectedPill === opt ? 'bg-student-yellow text-outloud-blue ring-2 ring-student-yellow/50 scale-105 z-10' : 'bg-[#08203e] text-white hover:bg-blue-900'
                    }`}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>

            {isEx1Complete && (
              <div className="w-full flex justify-center mt-2 animate-fade-in-up">
                <button onClick={handleCheckExercise1} className="bg-student-yellow text-outloud-blue font-black px-10 md:px-14 py-2.5 md:py-3 rounded-full shadow-lg transition-transform hover:scale-105 uppercase tracking-widest text-xs md:text-sm">
                  CONTINUAR
                </button>
              </div>
            )}

            {/* Invisible safety zone to catch dropped pills if user changes their mind after completion */}
            {isEx1Complete && (
              <div onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnBank} className="w-full h-32 flex-grow mt-4"></div>
            )}
            
          </div>
        </div>
      )}

      {/* STEP 5 & 6: EXERCISE 2 & 3 */}
      {(step === 'exercise2' || step === 'exercise3') && (
        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 flex flex-col flex-grow animate-fade-in pb-12">
          
          <div className="mb-4 shrink-0 w-full text-center md:text-left">
            <h2 className="text-base md:text-xl lg:text-2xl text-outloud-blue font-montserrat">
              <span className="font-black uppercase">LESSON 1: ACTIVITY {step === 'exercise2' ? '2' : '3'}</span> - <span className="font-bold">{step === 'exercise2' ? 'Listen and repeat.' : 'Compare.'}</span>
            </h2>
            <p className="text-xs md:text-sm lg:text-base font-medium text-outloud-blue font-montserrat flex items-center flex-wrap justify-center md:justify-start mt-2">
              {step === 'exercise2' ? (
                <>
                  Press the <svg className="w-5 h-5 mx-1 inline text-outloud-blue" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"></path></svg> icon to listen to the original audio... then, press the <svg className="w-5 h-5 mx-1 inline text-outloud-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg> icon to repeat and record your version.
                </>
              ) : (
                <>
                  Press the <svg className="w-5 h-5 mx-1 inline text-outloud-blue" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"></path></svg> icon to listen... then, press the <svg className="w-5 h-5 mx-1 inline text-outloud-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> icon to compare your version to the original.
                </>
              )}
            </p>
          </div>

          <div className="relative w-full max-w-4xl mx-auto bg-[#2a3036] rounded-[2rem] border-4 border-[#3b434b] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden">
            
            <div className="flex flex-row items-center justify-center gap-6 md:gap-12 w-full flex-grow min-h-0">
              
              {/* FIXED: Removed progress bar and explicitly made the image taller using max-h-[65vh] */}
              <div className="h-full max-h-[65vh] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-gray-600 bg-black shrink-0 relative">
                <img src="https://i.postimg.cc/CLmdVSQX/1(3).png" alt="Reception Scene" className="w-full h-full object-cover" />
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-2 py-3 md:py-4 text-center text-white font-montserrat text-xs md:text-sm lg:text-base font-medium tracking-wide border-t border-white/10">
                  Alan: The <span className="underline decoration-2 underline-offset-4 font-bold">bill</span>, please!
                </div>
              </div>

              <div className="flex flex-col justify-center items-center space-y-8">
                
                {/* Center Audio Controls */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex flex-col items-center">
                    <span className="text-white text-[10px] md:text-xs font-bold font-montserrat mb-1">Listen</span>
                    <button onClick={playOriginalAudio} className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl transition-all duration-300 ${activeAudio === 'original' ? 'bg-[#5b9bd5] scale-110' : 'bg-transparent hover:bg-white/10'} ${step === 'exercise2' && !hasRecorded ? 'ring-2 ring-green-500 ring-offset-4 ring-offset-[#2a3036]' : ''}`}>
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"></path></svg>
                    </button>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-white text-[10px] md:text-xs font-bold font-montserrat mb-1">{step === 'exercise2' ? 'Record' : 'Compare'}</span>
                    {step === 'exercise2' ? (
                      <button onClick={toggleRecording} className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-transparent hover:bg-white/10'}`}>
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                      </button>
                    ) : (
                      <button onClick={playRecordedAudio} className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl transition-all duration-300 ${activeAudio === 'user' ? 'bg-[#5b9bd5] scale-110' : 'bg-transparent hover:bg-white/10'} ${step === 'exercise3' && !hasCompared ? 'ring-2 ring-green-500 ring-offset-4 ring-offset-[#2a3036]' : ''}`}>
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* FIXED: Continue/Retry Buttons nested INSIDE the dark box directly below the controls */}
                <div className="flex flex-col items-center justify-center min-h-[4rem] pt-2">
                  {step === 'exercise2' && hasRecorded && !isRecording && (
                    <button onClick={handleContinueToEx3} className="bg-student-yellow text-outloud-blue font-black px-6 md:px-8 py-2 md:py-3 rounded-full shadow-xl transition-transform hover:scale-105 animate-pulse uppercase tracking-widest text-[10px] md:text-xs">
                      CONTINUAR
                    </button>
                  )}
                  
                  {step === 'exercise3' && hasCompared && (
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 animate-fade-in-up">
                      <button 
                        onClick={handleRetryEx2} 
                        title="Retry Exercise"
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border-2 border-outloud-blue text-outloud-blue hover:bg-blue-50 rounded-full shadow-md transition-transform hover:scale-105 shrink-0"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 3.16L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                      </button>
                      <button onClick={handleContinueToEx4} className="bg-student-yellow text-outloud-blue font-black px-6 md:px-8 py-2 md:py-3 rounded-full shadow-xl transition-transform hover:scale-105 animate-pulse uppercase tracking-widest text-[10px] md:text-xs">
                        CONTINUAR
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {step === 'next_placeholder' && (
        <div className="relative z-10 flex-grow flex items-center justify-center text-outloud-blue font-black text-2xl font-montserrat animate-fade-in">
          READY FOR NEXT EXERCISE...
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FreeLesson;