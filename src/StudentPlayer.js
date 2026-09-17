import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';

const extractVideoUrl = (rawInput) => {
  if (!rawInput) return '';
  if (rawInput.includes('<iframe') && rawInput.includes('src=')) {
    const match = rawInput.match(/src=["'](.*?)["']/);
    if (match && match[1]) return match[1];
  }
  return rawInput;
};

// Strips punctuation and spaces for bulletproof string comparison
const cleanStr = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
};

const StudentPlayer = ({ activityType, student, onExit, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [screensData, setScreensData] = useState([]);
  const [allElements, setAllElements] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({});
  
  // Tracking & Penalty States
  const [videoWatched, setVideoWatched] = useState(false);
  const [recordState, setRecordState] = useState('idle'); // idle -> recording -> recorded -> comparing -> retry
  
  // Audio Refs & Feedback States
  const mediaRecorderRef = useRef(null);
  const userAudioRef = useRef(null);
  const targetAudioRef = useRef(null);
  const correctSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);
  const [navButtonState, setNavButtonState] = useState('idle'); // 'idle', 'correct', 'incorrect'
  const [sessionStarted, setSessionStarted] = useState(false); // Mobile Audio Gateway State

  const safeParse = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data === 'object') return data;
    if (typeof data === 'string') {
      try {
        if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
          const cleaned = data.trim().replace('{', '[').replace('}', ']');
          return JSON.parse(cleaned);
        }
        return JSON.parse(data);
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        let rawLevel = student?.level || 'A1';
        let queryLevel = rawLevel === 'Staff' ? 'A1' : rawLevel.split(':')[0].trim(); 
        let rawUnit = String(student?.unit || '1').trim();
        let queryUnit = rawUnit.toLowerCase().startsWith('unit') ? rawUnit : `Unit ${rawUnit}`;

        const { data, error: fetchError } = await supabase
          .from('content_blueprints') 
          .select('*')
          .ilike('level', `${queryLevel}%`) 
          .ilike('unit', queryUnit)   
          .ilike('content_type', activityType)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("No content blueprint found for this specific unit and level.");

        const parsedScreens = safeParse(data.screens, []);
        const parsedBlueprint = safeParse(data.blueprint_data, { elements: [] });
        const elementsArr = parsedBlueprint.elements || [];
        
        const structuredScreens = parsedScreens.map(screenId => {
          return elementsArr.filter(e => e.screenId === screenId);
        });

        if (structuredScreens.length === 0) throw new Error("This blueprint is completely empty.");
        setAllElements(elementsArr);
        setScreensData(structuredScreens);
      } catch (err) {
        setError(`Error loading content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [activityType, student]);

  // Listen for Bunny.net / Cloudflare video completion to remove penalty
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && (data.event === 'ended' || data.type === 'ended' || data.event === 'videoEnded')) {
          setVideoWatched(true);
        }
      } catch(err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

const evaluateElement = (el) => {
    let possible = 0;
    let correct = 0;
    let incorrect = 0;

    if (el.type === 'short_answer' && el.data?.correctAnswer) {
      possible++;
      const ans = cleanStr(studentAnswers[el.id]);
      const target = cleanStr(el.data.correctAnswer);
      if (!ans) incorrect++; 
      else if (ans === target) correct++;
      else incorrect++;
    } 
    else if (el.type === 'fill_in_the_blank' && el.data?.answerText) {
      // 1. Split by commas to isolate each blank's answer group
      const rawGroups = el.data.answerText.split(',');
      
      rawGroups.forEach((group, index) => {
        // 2. Strip ONLY the wrapping quotation marks and edge spaces. 
        // This preserves internal case sensitivity and symbols (e.g., "don't" stays "don't")
        const cleanedTarget = group.replace(/^["'\s]+|["'\s]+$/g, '');
        
        if (cleanedTarget) {
          possible++;
          // 3. Trim the student's answer to remove accidental trailing spaces, but keep cases/symbols intact
          const studentAns = (studentAnswers[`${el.id}_${index}`] || '').trim();
          
          // Allow multiple correct options per blank separated by / or | (e.g., "is/are")
          const validOptions = cleanedTarget.split(/[|/]/).map(w => w.trim());
          
          if (!studentAns) incorrect++;
          else if (validOptions.includes(studentAns)) correct++;
          else incorrect++;
        }
      });
    }
    else if (el.type === 'multiple_selection') {
      el.data.options?.forEach(opt => {
        if (opt.isCorrect) {
          possible++;
          if (studentAnswers[`${el.id}_${opt.id}`]) correct++;
          else incorrect++; 
        } else {
          // Penalize guessing
          if (studentAnswers[`${el.id}_${opt.id}`]) incorrect++; 
        }
      });
    }
    else if (el.type === 'drag_and_drop') {
      el.data.items?.forEach((item, idx) => {
        // Validate against targetText (Correct Answer) instead of studentViewText (Scrambled Option)
        if (item.targetText && item.imageUrl) {
          possible++;
          // We use cleanStr here just in case mobile browsers inject invisible spaces during the Drag & Drop event
          const placed = cleanStr(dndAnswers[`${el.id}_${idx}`]);
          const target = cleanStr(item.targetText);
          
          if (!placed) incorrect++;
          else if (placed === target) correct++;
          else incorrect++;
        }
      });
    }
    else if (el.type === 'slider_bar' && el.data?.options) {
      const correctIdx = el.data.options.findIndex(opt => opt.isCorrect);
      if (correctIdx !== -1) {
        possible++;
        // Fallback to the middle index if the student didn't touch it
        const maxIdx = Math.max(0, el.data.options.length - 1);
        const defaultIdx = Math.floor(maxIdx / 2);
        const ans = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id]) : defaultIdx;
        if (ans === correctIdx) correct++;
        else incorrect++;
      }
    }
    else if (el.type === 'word_search') {
      if (el.data?.placedWords) {
         el.data.placedWords.forEach(pw => {
            possible++;
            const studentCells = studentAnswers[`${el.id}_cells`] || [];
            const allSelected = pw.cells.every(c => studentCells.includes(c));
            if (allSelected) correct++; else incorrect++;
         });
         const studentCells = studentAnswers[`${el.id}_cells`] || [];
         const allCorrectCells = el.data.placedWords.flatMap(pw => pw.cells);
         studentCells.forEach(sc => { if (!allCorrectCells.includes(sc)) incorrect++; });
      }
    }
    else if (el.type === 'crossword' && el.data?.grid) {
      ['across', 'down'].forEach(dir => {
         (el.data[dir] || []).forEach(wordObj => {
            if (wordObj.answer && wordObj.row !== undefined && wordObj.col !== undefined) {
               possible++;
               let isWordCorrect = true;
               for(let i=0; i<wordObj.answer.length; i++) {
                  const r = dir === 'across' ? wordObj.row : wordObj.row + i;
                  const c = dir === 'across' ? wordObj.col + i : wordObj.col;
                  const studentLetter = studentAnswers[`${el.id}_${r}_${c}`] || '';
                  if (studentLetter.toUpperCase() !== wordObj.answer[i].toUpperCase()) isWordCorrect = false;
               }
               if (isWordCorrect) correct++; else incorrect++;
            }
         });
      });
    }
    else if (el.type === 'record_compare') {
       possible++;
       if (studentAnswers[`${el.id}_recorded`]) correct++; else incorrect++;
    }

    return { possible, correct, incorrect };
  };

  const calculateFinalScores = () => {
    // Strictly adhering to the 6 expected database criteria to prevent crashing
    const metrics = {
      Listening: { p: 0, c: 0, i: 0 },
      Speaking: { p: 0, c: 0, i: 0 },
      Grammar: { p: 0, c: 0, i: 0 },
      Writing: { p: 0, c: 0, i: 0 },
      Reading: { p: 0, c: 0, i: 0 },
      Comprehension: { p: 0, c: 0, i: 0 },
    };

    const add = (cat, p, c, i) => {
       metrics[cat].p += p; metrics[cat].c += c; metrics[cat].i += i;
    };

    allElements.forEach(el => {
      const { possible, correct, incorrect } = evaluateElement(el);
      if (possible === 0) return;

      if (el.type === 'record_compare') { add('Listening', possible, correct, incorrect); add('Speaking', possible, correct, incorrect); }
      else if (el.type === 'fill_in_the_blank') { add('Grammar', possible, correct, incorrect); add('Writing', possible, correct, incorrect); }
      else if (el.type === 'drag_and_drop') { add('Reading', possible, correct, incorrect); } // Mapped to Reading
      else if (el.type === 'short_answer') { add('Writing', possible, correct, incorrect); }
      else if (el.type === 'multiple_selection') { add('Comprehension', possible, correct, incorrect); add('Reading', possible, correct, incorrect); }
      else if (el.type === 'slider_bar') { add('Comprehension', possible, correct, incorrect); }
      else if (el.type === 'word_search' || el.type === 'crossword') { add('Reading', possible, correct, incorrect); } // Mapped to Reading
    });

    const finalize = (cat) => {
       const m = metrics[cat];
       if (m.p === 0) return 100; // Default to 100% if category was not tested in this lesson
       const earned = Math.max(0, m.c - (m.i * 0.5)); // Strict -0.5 points per error
       return Math.round((earned / m.p) * 100);
    };

    return {
      Listening: finalize('Listening'),
      Reading: finalize('Reading'), 
      Grammar: finalize('Grammar'),
      Comprehension: finalize('Comprehension'),
      Speaking: finalize('Speaking'),
      Writing: finalize('Writing')
    };
  };

  const handleContinueClick = () => {
    if (navButtonState !== 'idle') return; // Prevent spam-clicking

    if (mediaRecorderRef.current && recordState === 'recording') mediaRecorderRef.current.stop();
    setRecordState('idle');
    if (targetAudioRef.current) targetAudioRef.current.pause();
    if (userAudioRef.current) userAudioRef.current.pause();

    const currentElements = screensData[currentStep] || [];
    const contentElements = currentElements.filter(el => !['nav_button'].includes(el.type));
    
    let screenPossible = 0;
    let screenIncorrect = 0;
    
    contentElements.forEach(el => {
       const { possible, incorrect } = evaluateElement(el);
       screenPossible += possible;
       screenIncorrect += incorrect;
    });

    const proceedToNext = () => {
       setNavButtonState('idle');
       if (currentStep < screensData.length - 1) {
         setCurrentStep(prev => prev + 1);
         const container = document.getElementById('student-player-container');
         if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
         else window.scrollTo({ top: 0, behavior: 'smooth' });
       } else {
         onComplete(calculateFinalScores());
       }
    };

    if (screenPossible > 0) {
       if (screenIncorrect > 0) {
          setNavButtonState('incorrect');
          if (incorrectSoundRef.current) {
             incorrectSoundRef.current.currentTime = 0; // Fixes mobile replay block
             incorrectSoundRef.current.play().catch(()=>{});
          }
       } else {
          setNavButtonState('correct');
          if (correctSoundRef.current) {
             correctSoundRef.current.currentTime = 0; // Fixes mobile replay block
             correctSoundRef.current.play().catch(()=>{});
          }
       }
       setTimeout(proceedToNext, 2000); // Wait 2 full seconds to clearly see visual feedback
    } else {
       proceedToNext();
    }
  };

  const handleDragStart = (e, word) => e.dataTransfer.setData('text/plain', word);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (word) setDndAnswers(prev => ({ ...prev, [zoneId]: word }));
  };

  // Full Recording & Compare Cycle
  const handleRecordAction = async (targetAudioUrl, elId) => {
    // Log that the student engaged with the element
    setStudentAnswers(prev => ({ ...prev, [`${elId}_recorded`]: true }));

    if (recordState === 'idle' || recordState === 'retry') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        let chunks = [];
        mediaRecorderRef.current.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          userAudioRef.current = new Audio(URL.createObjectURL(blob));
          setRecordState('recorded');
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorderRef.current.start();
        setRecordState('recording');
      } catch (e) { alert('Microphone access is required for this exercise.'); }
    } 
    else if (recordState === 'recording') {
      mediaRecorderRef.current?.stop();
    }
    else if (recordState === 'recorded') {
      setRecordState('comparing');
      if (!targetAudioRef.current) targetAudioRef.current = new Audio(targetAudioUrl);
      targetAudioRef.current.src = targetAudioUrl; 
      targetAudioRef.current.play();
      targetAudioRef.current.onended = () => {
         if (userAudioRef.current) {
           userAudioRef.current.play();
           userAudioRef.current.onended = () => setRecordState('retry');
         } else { setRecordState('retry'); }
      };
    }
  };

  const handleStartSession = () => {
     // Silently unlocks mobile audio context on first click
     [correctSoundRef, incorrectSoundRef].forEach(ref => {
         if (ref.current) {
             ref.current.play().then(() => {
                 ref.current.pause();
                 ref.current.currentTime = 0;
             }).catch(()=>{});
         }
     });
     setSessionStarted(true);
  };

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b19]"><div className="w-16 h-16 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b19] text-white font-montserrat px-6 text-center">
      <h2 className="text-4xl font-black text-red-500 mb-4 uppercase tracking-widest drop-shadow-md">Content Not Found</h2>
      <p className="text-red-400 font-bold mb-8">{error}</p>
      <button onClick={onExit} className="px-8 py-4 border-2 border-white/20 bg-white/5 rounded-2xl hover:bg-white/10 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest shadow-xl">Return to Hub</button>
    </div>
  );

  // ==========================================
  // MOBILE AUDIO UNLOCK GATEWAY & MAIN RENDER
  // ==========================================
  const currentElements = screensData[currentStep] || [];
  const contentElements = currentElements.filter(el => !['nav_button'].includes(el.type));
  const dockElements = currentElements.filter(el => ['nav_button', 'record_compare'].includes(el.type));

  return (
    <>
      {/* STABLE AUDIO ELEMENTS: Placed outside the ternary so they NEVER unmount */}
      <audio ref={correctSoundRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      <audio ref={incorrectSoundRef} src="https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3" preload="auto" />

      {!sessionStarted ? (
        <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-[#070b19] text-white font-montserrat px-6 text-center">
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/267655.jpeg" alt="Background" className="absolute inset-0 w-full h-full object-cover object-left md:object-center opacity-40 mix-blend-lighten" />
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] border border-white/20 shadow-2xl flex flex-col items-center max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black text-[#fcd34d] mb-4 uppercase tracking-widest drop-shadow-md">READY?</h2>
            <p className="text-white/80 font-medium mb-10 text-sm md:text-base leading-relaxed">Interactive audio and scoring systems require your permission to initialize. Click below to begin the lesson.</p>
            <button onClick={handleStartSession} className="w-full bg-[#fcd34d] text-[#08203e] font-black px-12 py-6 rounded-full shadow-[0_0_40px_rgba(252,211,77,0.4)] hover:shadow-[0_0_50px_rgba(252,211,77,0.6)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-lg">
              START LESSON
            </button>
          </div>
        </div>
      ) : (
        <div id="student-player-container" className="fixed inset-0 z-[500] flex flex-col bg-[#070b19] text-white font-montserrat overflow-y-auto custom-scrollbar">
          
          {/* Restored Global Background Image */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/267655.jpeg" alt="Background" className="absolute inset-0 w-full h-full object-cover object-left md:object-center opacity-40 mix-blend-lighten" />
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#08203e]/40 blur-[120px] rounded-full mix-blend-screen"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#ca8a04]/10 blur-[150px] rounded-full mix-blend-screen"></div>
          </div>

          {/* Global Navbar */}
          <div className="sticky top-0 h-20 w-full flex items-center justify-between px-6 md:px-12 z-50 shrink-0 border-b border-white/10 bg-[#070b19]/90 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center gap-4">
              <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Header.png" alt="Outloud Logo" className="h-8 md:h-10 object-contain drop-shadow-md" />
              <div className="h-6 w-[1px] bg-white/20 hidden md:block"></div>
              <span className="hidden md:block text-sm font-black text-[#fcd34d] uppercase tracking-widest drop-shadow-sm">{activityType} • Unit {student?.unit || 1}</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 pl-4 pr-1.5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white leading-tight">{student?.first_name} {student?.last_name}</span>
                  <span className="text-[10px] text-[#fcd34d] font-black uppercase tracking-widest">Level {student?.level?.split(':')[0]}</span>
                </div>
                <img src={student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.first_name || 'U')}&background=random&color=fff`} className="w-9 h-9 rounded-full object-cover border border-white/30 shadow-inner" alt="Avatar"/>
              </div>

              <button onClick={onExit} className="text-white/60 hover:text-white transition-all bg-white/5 hover:bg-red-500 hover:border-red-400 p-2 rounded-full border border-white/10 shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-[80rem] mx-auto p-6 md:p-12 relative z-10 flex flex-col pb-32">
            <div className="flex flex-col items-center gap-10 w-full">
              
              {contentElements.map(el => {
                const isMedia = ['video', 'image', 'audio'].includes(el.type);
                const isCard = ['short_answer', 'multiple_selection', 'slider_bar', 'fill_in_the_blank', 'drag_and_drop', 'crossword', 'word_search', 'record_compare'].includes(el.type);
                
                if (isMedia) {
                  return (
                    <div key={el.id} className={`w-full ${el.type === 'video' ? 'max-w-5xl' : 'max-w-4xl'} bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl animate-fade-in relative mx-auto`}>
                      {el.type === 'video' && <iframe src={extractVideoUrl(el.url)} className="w-full aspect-video border-none" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen />}
                      {el.type === 'image' && <img src={el.url || el.data?.imageUrl} alt="Content" className="w-full h-auto max-h-[700px] object-contain rounded-[2.5rem]" />}
                      {el.type === 'audio' && (
                        <div className="p-10 w-full flex flex-col items-center">
                          {el.data?.imageUrl && <img src={el.data.imageUrl} alt="Audio Cover" className="w-full max-w-md rounded-3xl shadow-2xl mb-8 border border-white/10" />}
                          <audio src={el.url || el.data?.audioUrl} controls controlsList="nodownload" className="w-full max-w-2xl" />
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={el.id} className="relative flex flex-col w-full max-w-4xl mx-auto items-center">
                    
                    {/* Dynamically scales down the gigantic hardcoded spans to prevent line breaking */}
                    {el.type === 'text' && (
                      <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-14 border border-white/20 shadow-2xl text-center z-20">
                        <div dangerouslySetInnerHTML={{__html: el.htmlContent}} className="rich-text-content pointer-events-none drop-shadow-md text-sm md:text-base [&_span]:!text-lg md:[&_span]:!text-2xl [&_span]:!leading-tight [&_span]:!whitespace-normal" />
                      </div>
                    )}

                    {isCard && (
                      <div className="w-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-8 md:p-12 flex flex-col gap-6 shadow-2xl h-full justify-between animate-slide-up mt-4">
                        
                        {/* Visual Prompt Recovery for Record and Compare */}
                        {el.data?.imageUrl && <img src={el.data.imageUrl} alt="Visual Prompt" className="w-full h-80 object-cover rounded-3xl shadow-inner border border-white/10 mb-4" />}

                        {/* Target Audio & Transcript for Record & Compare */}
                        {el.type === 'record_compare' && (
                          <div className="w-full flex flex-col items-center justify-center bg-black/30 p-8 rounded-3xl border border-white/10 shadow-inner mt-4">
                            {el.data?.transcriptText && (
                              <div className="w-full text-center mb-6 border-b border-white/10 pb-6">
                                <p className="text-white font-medium text-2xl lg:text-3xl leading-relaxed drop-shadow-md">
                                  "{el.data.transcriptText}"
                                </p>
                              </div>
                            )}
                            {el.data?.audioUrl && (
                              <div className="w-full flex flex-col items-center">
                                <span className="text-white/60 font-black uppercase tracking-widest text-xs mb-4">Original Audio</span>
                                <audio src={el.data.audioUrl} controls controlsList="nodownload" className="w-full max-w-md" />
                              </div>
                            )}
                          </div>
                        )}

                        {el.type === 'fill_in_the_blank' && el.data && (() => {
                           const rawText = el.data.templateText || '';
                           if (!rawText) return null;
                           const parts = rawText.split(/(_+)/);
                           let blankIndex = 0;
                           return (
                              <div className="w-full h-full flex flex-col justify-center items-center mt-6">
                                 <div className="text-center w-full break-words leading-[4rem]" style={{ color: el.data.t_textColor || '#ffffff', fontSize: el.data.t_fontSize ? `${el.data.t_fontSize}px` : '22px', fontFamily: el.data.t_fontFamily || 'Montserrat', fontWeight: el.data.t_isBold ? 'bold' : 'normal' }}>
                                    {parts.map((part, i) => {
                                       if (part.includes('_')) {
                                          const currentBlankIndex = blankIndex++;
                                          const blankWidth = Math.max(80, Math.min(part.length * 20, 300));
                                          return (
                                             <input 
                                                key={i}
                                                type="text"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck="false"
                                                value={studentAnswers[`${el.id}_${currentBlankIndex}`] || ''}
                                                onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${currentBlankIndex}`]: e.target.value}))}
                                                className="mx-3 px-4 py-2 bg-black/50 border-b-4 border-t-0 border-x-0 border-white/50 focus:border-[#fcd34d] text-center outline-none transition-colors shadow-inner rounded-t-xl text-white font-bold"
                                                style={{ width: `${blankWidth}px` }}
                                             />
                                          );
                                       }
                                       return <span key={i} dangerouslySetInnerHTML={{ __html: part }} className="drop-shadow-md" />;
                                    })}
                                 </div>
                              </div>
                           );
                        })()}

                        {el.type === 'short_answer' && el.data && (
                          <div className="flex flex-col w-full h-full justify-center">
                            <div dangerouslySetInnerHTML={{ __html: el.data.questionHtml }} className="w-full break-words text-white mt-2 text-xl font-medium drop-shadow-md mb-6" />
                            <input type="text" placeholder="Type your answer here..." value={studentAnswers[el.id] || ''} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="w-full p-6 bg-black/50 border border-white/20 rounded-2xl text-white font-bold focus:ring-2 focus:ring-[#fcd34d] transition-all shadow-inner placeholder-white/30 text-lg outline-none" />
                          </div>
                        )}

                        {el.type === 'multiple_selection' && el.data && (
                          <div className="flex flex-col w-full">
                            {el.data.promptHtml && <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="mb-8 mt-2 text-xl font-medium drop-shadow-md" />}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                              {el.data.options?.map((opt) => {
                                const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                                return (
                                  <button key={opt.id} onClick={() => setStudentAnswers(prev => ({ ...prev, [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`] }))} style={{ backgroundColor: isSelected ? '#fcd34d' : 'rgba(0,0,0,0.5)', borderColor: isSelected ? '#ca8a04' : 'rgba(255,255,255,0.2)' }} className="w-full p-6 border-2 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95 flex items-center shadow-lg backdrop-blur-sm">
                                    <div className={`w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#08203e]' : 'border-white/40'}`}>
                                      {isSelected && <div className="w-3 h-3 bg-[#08203e] rounded-full"></div>}
                                    </div>
                                    <div dangerouslySetInnerHTML={{__html: opt.html}} className="pointer-events-none text-lg font-bold" style={{ color: isSelected ? '#08203e' : 'white' }} />
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {el.type === 'drag_and_drop' && el.data && (
                          <div className="flex flex-col gap-12 w-full mt-6">
                            <div className="grid grid-cols-2 gap-8 w-full">
                              {el.data.items.map((item, idx) => item.imageUrl && (
                                <div key={idx} className="flex flex-col items-center gap-6">
                                  <img src={item.imageUrl} className="w-full aspect-[4/5] rounded-3xl shadow-xl object-cover border border-white/10" alt="DnD Target" />
                                  <div 
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, `${el.id}_${idx}`)}
                                    className="w-full min-h-[90px] border-2 border-dashed rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center transition-all shadow-inner border-white/40"
                                  >
                                    {dndAnswers[`${el.id}_${idx}`] ? (
                                      <div onClick={(e) => { e.stopPropagation(); setDndAnswers(prev => { const copy = {...prev}; delete copy[`${el.id}_${idx}`]; return copy; })}} className="px-4 py-3 bg-[#fcd34d] text-[#08203e] rounded-xl font-black text-sm md:text-lg shadow-xl w-[90%] text-center hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                                        {dndAnswers[`${el.id}_${idx}`]}
                                      </div>
                                    ) : <span className="text-xs uppercase font-black tracking-widest text-white/40">DROP HERE</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="w-full bg-black/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-inner flex flex-col items-center">
                              <div className="text-center font-black text-[#fcd34d] text-sm uppercase tracking-widest mb-8 drop-shadow-md">Word Bank (Drag to place)</div>
                              <div className="flex flex-wrap justify-center gap-4 w-full">
                                {el.data.items.map((item, idx) => {
                                  if (!item.studentViewText) return null;
                                  const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                                  if (isUsed) return null;
                                  return (
                                    <div 
                                      key={`bank-${idx}`} 
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, item.studentViewText)}
                                      className="px-6 py-4 border-2 rounded-xl font-black text-sm md:text-lg shadow-xl cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-1 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                                    >
                                      {item.studentViewText}
                                    </div>
                                  );
                                })}
                                {Object.keys(dndAnswers).length === el.data.items.filter(i=>i.imageUrl).length && <span className="text-green-400 font-black text-xl tracking-widest uppercase py-4 drop-shadow-md w-full text-center block">All items placed!</span>}
                              </div>
                            </div>
                          </div>
                        )}

                        {el.type === 'slider_bar' && el.data && (() => {
                          const isVert = el.data.orientation === 'vertical';
                          const opts = el.data.options || [];
                          const maxIdx = Math.max(0, opts.length - 1);
                          const currentIdx = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id]) : Math.floor(maxIdx / 2);
                          const activeOpt = opts[currentIdx] || {};
                          const pct = maxIdx === 0 ? 50 : (currentIdx / maxIdx) * 100;
                          return (
                            <div className="w-full flex flex-col h-full min-h-[200px] justify-end relative pb-8 mt-6">
                              <div className="absolute w-full h-full flex flex-col items-center justify-center">
                                <div className="absolute flex items-center justify-center rounded-full shadow-inner overflow-hidden" style={{ backgroundColor: el.data.barColor || 'rgba(255,255,255,0.2)', width: isVert ? `${el.data.barThickness}px` : '100%', height: isVert ? '100%' : `${el.data.barThickness}px` }}></div>
                                <input type="range" min="0" max={maxIdx} step="1" value={currentIdx} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="absolute custom-slider w-full h-full z-10 cursor-pointer" style={{ '--thumb-color': el.data.handleColor || '#fcd34d', transform: isVert ? 'rotate(-90deg)' : 'none', WebkitAppearance: 'none', background: 'transparent' }} />
                                { !isVert && (
                                  <div className="absolute flex flex-col items-center transition-all duration-200 pointer-events-none z-0" style={{ left: `${pct}%`, bottom: 'calc(50% + 25px)', transform: 'translateX(-50%)' }}>
                                    <div className="bg-white text-[#08203e] px-6 py-3 rounded-xl shadow-2xl font-black text-base">{activeOpt.text}</div>
                                    <div className="w-0 h-0 border-solid" style={{ borderWidth: '10px 8px 0 8px', borderColor: 'white transparent transparent transparent' }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {(el.type === 'crossword' || el.type === 'word_search') && el.data && (
                           <div className="w-full flex flex-col md:flex-row gap-10 mt-6">
                             <div className="flex-1 flex flex-col gap-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-6">
                               {el.type === 'crossword' && (
                                 <>
                                   <h3 className="font-black text-[#fcd34d] text-xl uppercase tracking-widest border-b border-white/20 pb-4 drop-shadow-md">Prompts</h3>
                                   <div className="flex gap-10">
                                     <div className="flex-1 flex flex-col gap-5">
                                       <h4 className="text-xs font-black text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">Across</h4>
                                       {el.data.across?.map(a => <div key={`a-${a.num}`} className="text-base text-white flex gap-4"><span className="font-black text-[#fcd34d]">{a.num}.</span><span className="font-medium opacity-90">{a.prompt}</span></div>)}
                                     </div>
                                     <div className="flex-1 flex flex-col gap-5">
                                       <h4 className="text-xs font-black text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">Down</h4>
                                       {el.data.down?.map(d => <div key={`d-${d.num}`} className="text-base text-white flex gap-4"><span className="font-black text-[#fcd34d]">{d.num}.</span><span className="font-medium opacity-90">{d.prompt}</span></div>)}
                                     </div>
                                   </div>
                                 </>
                               )}
                               {el.type === 'word_search' && (
                                 <>
                                   <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="w-full whitespace-pre-wrap break-words border-b border-white/20 pb-6 mb-4 drop-shadow-md text-xl" />
                                   <div className="flex gap-6">
                                     <ul className="flex-1 flex flex-col gap-4 list-none pl-2">
                                       {el.data.targetWords?.slice(0, Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w1-${i}`} className="text-base font-bold text-white/90 tracking-widest flex items-center gap-4"><span className="w-3 h-3 rounded-full bg-[#fcd34d] shadow-[0_0_10px_#fcd34d]"></span>{w}</li>)}
                                     </ul>
                                     <ul className="flex-1 flex flex-col gap-4 list-none pl-2">
                                       {el.data.targetWords?.slice(Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w2-${i}`} className="text-base font-bold text-white/90 tracking-widest flex items-center gap-4"><span className="w-3 h-3 rounded-full bg-[#fcd34d] shadow-[0_0_10px_#fcd34d]"></span>{w}</li>)}
                                     </ul>
                                   </div>
                                 </>
                               )}
                             </div>
                             
                             <div className="flex-[2] bg-black/40 rounded-3xl border border-white/10 p-6 zoom-container flex justify-center items-center min-h-[500px] shadow-inner relative w-full overflow-hidden">
                                {el.type === 'crossword' && (
                                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(35px, 1fr))`, gap: '3px', width: 'fit-content', position: 'relative', zIndex: 10 }}>
                                    {el.data.grid.map((row, rIdx) => 
                                      row.map((cell, cIdx) => (
                                        <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-10 md:w-12">
                                          {cell ? (
                                            <div className="w-full h-full relative">
                                              {cell.num && <span className="absolute top-1 left-1.5 text-[9px] font-black text-white/90 z-10 pointer-events-none drop-shadow-md">{cell.num}</span>}
                                              <input 
                                                type="text" maxLength={1} 
                                                value={studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || ''}
                                                onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${rIdx}_${cIdx}`]: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')}))}
                                                style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal' }}
                                                className="w-full h-full text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition shadow-inner rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold"
                                              />
                                            </div>
                                          ) : <div className="w-full h-full bg-transparent" />}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}

                                {el.type === 'word_search' && (
                                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`, borderWidth: '4px', borderStyle: 'solid', borderColor: el.data.lineColor, backgroundColor: el.data.cellColor }} className="shadow-2xl max-w-full max-h-full aspect-square w-full rounded-2xl overflow-hidden relative z-10">
                                    {el.data.grid?.map((row, rIdx) => 
                                      row.map((char, cIdx) => {
                                        const cellId = `${el.id}_${rIdx}_${cIdx}`;
                                        const isSelected = (studentAnswers[`${el.id}_cells`] || []).includes(cellId);
                                        return (
                                          <div 
                                            key={cellId} 
                                            onClick={() => setStudentAnswers(prev => {
                                               const current = prev[`${el.id}_cells`] || [];
                                               return { ...prev, [`${el.id}_cells`]: current.includes(cellId) ? current.filter(c => c !== cellId) : [...current, cellId] };
                                            })}
                                            style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal', borderRight: cIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none', borderBottom: rIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none', backgroundColor: isSelected ? 'rgba(252, 211, 77, 0.6)' : 'transparent', cursor: 'pointer' }}
                                            className="flex items-center justify-center transition-colors hover:bg-white/20 select-none"
                                          >
                                            {char}
                                          </div>
                                        )
                                      })
                                    )}
                                  </div>
                                )}
                             </div>
                           </div>
                        )}

                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* BOTTOM ACTION DOCK WITH ANTI-OVERFLOW WRAPPER */}
            <div className="w-full mt-auto pt-20 flex flex-col sm:flex-row justify-center items-center gap-4 px-4 relative z-50">
              {dockElements.map(el => {
                if (el.type === 'record_compare') {
                  const btnConfig = {
                    idle: { text: "RECORD AUDIO", class: "bg-white/10 hover:bg-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/20", icon: <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]"></div> },
                    recording: { text: "RECORDING...", class: "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] border-red-400 animate-pulse", icon: null },
                    recorded: { text: "COMPARE", class: "bg-[#5b9bd5] text-white shadow-[0_0_30px_rgba(91,155,213,0.5)] border-blue-400", icon: null },
                    comparing: { text: "COMPARING...", class: "bg-[#5b9bd5] text-white shadow-[0_0_30px_rgba(91,155,213,0.5)] border-blue-400 animate-pulse", icon: null },
                    retry: { text: "RETRY", class: "bg-white/10 hover:bg-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/20", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 3.16L3 8" /><path d="M3 3v5h5" /></svg> }
                  };
                  const config = btnConfig[recordState];
                  
                  return (
                    <button key={el.id} onClick={() => handleRecordAction(el.data?.audioUrl, el.id)} className={`w-full sm:w-auto backdrop-blur-xl border font-black px-8 py-4 md:px-12 md:py-6 rounded-full flex justify-center items-center gap-4 cursor-pointer transition-all uppercase tracking-widest text-sm md:text-lg hover:scale-105 active:scale-95 ${config.class}`}>
                      {config.icon}
                      {config.text}
                    </button>
                  );
                }
                if (el.type === 'nav_button') {
                  let btnClass = "bg-[#fcd34d] text-[#08203e] shadow-[0_0_40px_rgba(252,211,77,0.4)] hover:shadow-[0_0_50px_rgba(252,211,77,0.6)]";
                  let btnText = el.data?.buttonStyle === 'finish_pill' ? 'FINISH & SEE GRADES ✓' : 'CONTINUE ➔';

                  if (navButtonState === 'correct') {
                    btnClass = "bg-green-500 text-white shadow-[0_0_40px_rgba(34,197,94,0.8)] scale-105";
                    btnText = "CORRECT ✓";
                  } else if (navButtonState === 'incorrect') {
                    btnClass = "bg-orange-500 text-white shadow-[0_0_40px_rgba(249,115,22,0.8)] animate-pulse scale-105";
                    btnText = "INCORRECT ✕";
                  }

                  return (
                    <button key={el.id} onClick={handleContinueClick} className={`w-full sm:w-auto font-black px-8 py-4 md:px-16 md:py-6 rounded-full uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-sm md:text-xl text-center ${btnClass}`}>
                      {btnText}
                    </button>
                  );
                }
                return null;
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default StudentPlayer;