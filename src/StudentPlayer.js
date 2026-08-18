import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient'; 

const StudentPlayer = ({ lessonData, student, onExit }) => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // --- GRADING & STATE ---
  const [studentAnswers, setStudentAnswers] = useState({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [finalScores, setFinalScores] = useState(null);

  // --- RECORD & COMPARE STATE ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingStates, setRecordingStates] = useState({}); // 'idle', 'recording', 'recorded'
  const [audioBlobs, setAudioBlobs] = useState({}); // el.id -> blobUrl

  // --- RESPONSIVE CANVAS SCALE ---
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (containerRef.current && window.innerWidth >= 768) {
        // Calculate scale to make 1200px fit perfectly in the parent container
        const parentWidth = containerRef.current.parentElement.clientWidth;
        const newScale = Math.min(1, parentWidth / 1200);
        setScale(newScale);
      }
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100); // Trigger after DOM paint
    return () => window.removeEventListener('resize', handleResize);
  }, [currentScreen]);
  
  const isLesson = lessonData?.content_type === 'Lesson';
  const elements = lessonData?.session_data?.blueprint_data?.elements || lessonData?.blueprint_data?.elements || [];
  
  const totalScreens = Array.isArray(lessonData?.screens) 
    ? lessonData.screens.length 
    : lessonData?.screens || 1;

  const progressPercentage = Math.round((currentScreen / totalScreens) * 100);

  const handleNext = () => {
    if (currentScreen < totalScreens) setCurrentScreen(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentScreen > 1) setCurrentScreen(prev => prev - 1);
  };

  // --- RECORD ENGINE ---
  const startRecording = async (id) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlobs(prev => ({ ...prev, [id]: audioUrl }));
        setRecordingStates(prev => ({ ...prev, [id]: 'recorded' }));
      };
      
      mediaRecorder.start();
      setRecordingStates(prev => ({ ...prev, [id]: 'recording' }));
    } catch (err) {
      console.error("Microphone access denied or failed.", err);
      alert("Please allow microphone permissions to use Record & Compare.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
  };

  // --- WRITING EVALUATION ENGINE ---
  const countTypingMistakes = (studentText, targetText) => {
    const s = studentText.trim().toLowerCase();
    const t = targetText.trim().toLowerCase();
    if (!s) return t.length;
    if (!t) return s.length;
    
    const matrix = [];
    for (let i = 0; i <= t.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= s.length; j++) { matrix[0][j] = j; }
    
    for (let i = 1; i <= t.length; i++) {
      for (let j = 1; j <= s.length; j++) {
        if (t.charAt(i - 1) === s.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, 
            matrix[i][j - 1] + 1,     
            matrix[i - 1][j] + 1      
          );
        }
      }
    }
    return matrix[t.length][s.length];
  };

  // --- THE GRADING ENGINE ---
  const handleFinish = async () => {
    const maxPoints = { listeningSpeaking: 0, grammar: 0, comprehension: 0, reading: 0 };
    const earnedPoints = { listeningSpeaking: 0, grammar: 0, comprehension: 0, reading: 0 };
    
    let hasWriting = false;
    let totalWritingMistakes = 0;
    const essaySubmissions = {};

    elements.forEach(el => {
      const isInputType = ['interactive_input', 'fill_in_blank', 'text_input', 'input'].includes(el.type);

      if (isInputType && !el.data?.correctAnswer) {
        essaySubmissions[el.id] = studentAnswers[el.id] || "";
        return;
      }

      if (el.data?.correctAnswer) {
        const category = el.data?.category || 'comprehension';
        if (maxPoints[category] !== undefined) maxPoints[category] += 1;

        let isCorrect = false;

        // Check depending on element logic
        if (el.type === 'drag_and_drop') {
            // Validate Drop Zones
            const dndAns = studentAnswers[el.id] || {}; // { targetIdx: pillIdx }
            isCorrect = el.data.items?.every((item, idx) => dndAns[idx] !== undefined && el.data.items[dndAns[idx]]?.targetText === item.targetText);
        } else {
            // Validate Standard Answers
            const studentAns = studentAnswers[el.id] || "";
            const targetAns = el.data.correctAnswer;
            isCorrect = studentAns.toString().trim().toLowerCase() === targetAns.toString().trim().toLowerCase();
        }

        if (isCorrect && earnedPoints[category] !== undefined) {
          earnedPoints[category] += 1;
        }

        if (isInputType) {
          hasWriting = true;
          const studentAns = studentAnswers[el.id] || "";
          const mistakes = countTypingMistakes(studentAns.toString(), el.data.correctAnswer.toString());
          totalWritingMistakes += mistakes;
        }
      }
    });

    const calculatedScores = {};
    let totalMax = 0;
    let totalEarn = 0;

    Object.keys(maxPoints).forEach(cat => {
      if (maxPoints[cat] > 0) {
        calculatedScores[cat] = Math.round((earnedPoints[cat] / maxPoints[cat]) * 100);
        totalMax += maxPoints[cat];
        totalEarn += earnedPoints[cat];
      }
    });

    if (hasWriting) {
      let writingScore = 100 - (totalWritingMistakes * 10);
      if (writingScore < 0) writingScore = 0; 
      
      calculatedScores.writing = writingScore;
      totalMax += 100; 
      totalEarn += writingScore;
    }

    const totalScore = totalMax > 0 ? Math.round((totalEarn / totalMax) * 100) : 100;

    try {
      await supabase
        .from('student_sessions')
        .update({ 
          session_data: { 
            ...lessonData, 
            studentAnswers, 
            essaySubmissions,
            status: 'pending_teacher_review' 
          },
          score: totalScore
        })
        .eq('student_id', student.id)
        .eq('blueprint_id', lessonData.id);
    } catch (err) {
      console.error("Error saving session answers:", err);
    }

    setFinalScores({ categories: calculatedScores, total: totalScore });
    setShowAnalytics(true); 
  };

  // --- THE CANVAS RENDERER ---
  const renderElement = (el) => {
    const elementStyle = isMobile 
      ? {
          position: 'relative',
          width: '100%',
          minHeight: (el.type === 'image' || el.type === 'video') ? 'auto' : `${el.height}px`,
          zIndex: el.layer || 10,
          marginBottom: '1.25rem',
        }
      : {
          position: 'absolute',
          top: `${el.y}px`,
          left: `${el.x}px`,
          width: `${el.width}px`,
          height: `${el.height}px`,
          zIndex: el.layer || 10,
        };

    // URL Cleaner for Bunny.net / Missing protocols / Iframe Embeds
    const getCleanUrl = (rawUrl) => {
      if (!rawUrl) return '';
      let url = rawUrl.trim();
      if (url.startsWith('<iframe')) {
          const match = url.match(/src="([^"]+)"/);
          return match ? match[1] : '';
      }
      if (!url.startsWith('http') && !url.startsWith('data:')) {
          url = 'https://' + url;
      }
      return url;
    };

    const mediaSource = getCleanUrl(el.src || el.url || el.content || el.data?.src);

    switch (el.type) {
      case 'text':
        return (
          <div key={el.id} style={elementStyle} className="pointer-events-none text-white drop-shadow-md">
            <div dangerouslySetInnerHTML={{ __html: el.htmlContent || el.data?.text || '' }} />
          </div>
        );
      
      case 'image':
        return (
          <img 
            key={el.id} 
            src={mediaSource} 
            alt="Lesson Graphic" 
            style={elementStyle} 
            className={`object-contain rounded-2xl shadow-2xl ${isMobile ? 'mx-auto' : ''}`}
          />
        );
      
      case 'video':
        const isIframe = mediaSource.includes('iframe') || mediaSource.includes('youtube') || mediaSource.includes('mediadelivery');
        return (
          <div key={el.id} style={elementStyle} className="overflow-hidden rounded-2xl shadow-2xl bg-black border border-white/10 flex items-center justify-center pointer-events-auto">
            {mediaSource ? (
              isIframe ? (
                <iframe src={mediaSource} className="w-full h-full border-none" allow="autoplay; fullscreen" title="Video Player" />
              ) : (
                <video controls className="w-full h-full object-cover">
                  <source src={mediaSource} type="video/mp4" />
                </video>
              )
            ) : (
              <span className="text-white/50 text-xs tracking-widest uppercase">Video Missing</span>
            )}
          </div>
        );
        
      case 'audio':
        return (
          <div key={el.id} style={elementStyle} className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg px-4 pointer-events-auto">
            <audio controls src={mediaSource} className="w-full invert opacity-90" />
          </div>
        );
      
      case 'nav_button':
        const isFinish = el.data?.buttonStyle === 'finish_pill' || el.data?.text?.toLowerCase().includes('finish');
        return (
          <button 
            key={el.id} 
            style={elementStyle} 
            onClick={isFinish ? handleFinish : handleNext}
            className={`font-black py-2 md:py-3 rounded-full shadow-xl hover:scale-105 transition-transform uppercase tracking-widest flex items-center justify-center pointer-events-auto ${
              isFinish ? 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_15px_rgba(252,211,77,0.4)]' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            } ${isMobile ? 'text-sm w-full mt-2' : 'text-xs'}`} 
          >
            {el.data?.text || (isFinish ? 'FINISH' : 'CONTINUE')}
          </button>
        );

      case 'drag_and_drop':
        const items = el.data?.items || [];
        const currentDndAnswer = studentAnswers[el.id] || {}; 
        const placedPillIndices = Object.values(currentDndAnswer);

        return (
          <div key={el.id} style={elementStyle} className="flex flex-col items-center gap-6 pointer-events-auto">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-full">
                {items.map((item, idx) => {
                  const placedPillIdx = currentDndAnswer[idx];
                  const placedPill = placedPillIdx !== undefined ? items[placedPillIdx] : null;

                  return (
                  <div 
                    key={`dnd-target-${idx}`} 
                    className="flex flex-col items-center gap-3 w-full h-full"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                       e.preventDefault();
                       const dragPillIdx = e.dataTransfer.getData('text/plain');
                       if(dragPillIdx !== "") {
                          setStudentAnswers(prev => ({
                             ...prev,
                             [el.id]: { ...(prev[el.id] || {}), [idx]: parseInt(dragPillIdx) }
                          }));
                       }
                    }}
                  >
                    <img src={getCleanUrl(item.imageUrl)} alt="Drop target" className="w-full flex-grow object-contain rounded-xl shadow-lg border border-white/10" />
                    <div className={`w-full h-12 shrink-0 border-2 ${placedPill ? 'border-solid border-[#fcd34d] bg-[#fcd34d]/20 text-[#fcd34d]' : 'border-dashed border-white/30 bg-white/5 text-white/50'} rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all`}
                         onClick={() => {
                            if(placedPill) {
                               const newAnswers = {...currentDndAnswer};
                               delete newAnswers[idx];
                               setStudentAnswers(prev => ({...prev, [el.id]: newAnswers}));
                            }
                         }}
                    >
                       {placedPill ? placedPill.studentViewText : 'Drop Here'}
                    </div>
                  </div>
                )})}
             </div>
             
             {/* Draggable Pills Container */}
             <div className="flex flex-wrap justify-center items-end gap-4 mt-2 w-full min-h-[50px]">
                {items.map((item, idx) => {
                  if (placedPillIndices.includes(idx)) return null; 
                  return (
                  <div 
                    key={`pill-${idx}`} 
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', idx)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xs rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 hover:bg-white/20 transition z-50"
                  >
                    {item.studentViewText}
                  </div>
                )})}
             </div>
          </div>
        );

      case 'record_compare':
        const recState = recordingStates[el.id] || 'idle';
        const recAudioUrl = audioBlobs[el.id];
        return (
          <div key={el.id} style={elementStyle} className="flex flex-row justify-center items-center gap-6 pointer-events-auto bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-full shadow-xl w-max mx-auto h-auto">
             <div className="flex flex-col items-center gap-2">
                <span className="text-white/70 text-[8px] font-bold tracking-widest uppercase">Listen</span>
                <button className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition shadow-lg text-white" 
                   onClick={() => { if (mediaSource) new Audio(mediaSource).play(); }}>
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"/></svg>
                </button>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-white/70 text-[8px] font-bold tracking-widest uppercase">{recState === 'recording' ? 'Stop' : 'Record'}</span>
                <button 
                   className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${recState === 'recording' ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/40'}`}
                   onClick={() => recState === 'recording' ? stopRecording() : startRecording(el.id)}>
                   {recState === 'recording' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" /></svg>
                   ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                   )}
                </button>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-white/70 text-[8px] font-bold tracking-widest uppercase">Compare</span>
                <button 
                   className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${!recAudioUrl ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed' : 'bg-[#fcd34d]/20 border border-[#fcd34d]/50 text-[#fcd34d] hover:bg-[#fcd34d]/40 shadow-[0_0_15px_rgba(252,211,77,0.3)]'}`}
                   onClick={() => { if(recAudioUrl) new Audio(recAudioUrl).play(); }}
                   disabled={!recAudioUrl}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </button>
             </div>
          </div>
        );

      case 'multiple_choice':
      case 'option_button':
      case 'quiz_option':
        const isSelected = studentAnswers[el.id] === (el.data?.text || el.content);
        return (
          <button 
            key={el.id} 
            style={elementStyle} 
            onClick={() => setStudentAnswers(prev => ({...prev, [el.id]: (el.data?.text || el.content)}))}
            className={`p-4 rounded-xl shadow-lg transition-all text-left font-bold pointer-events-auto flex items-center justify-center ${
              isSelected 
                ? 'bg-[#fcd34d] text-[#08203e] border border-[#fcd34d] shadow-[0_0_15px_rgba(252,211,77,0.4)]' 
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            {el.data?.text || el.content || 'Option'}
          </button>
        );

      case 'interactive_input':
      case 'fill_in_blank':
      case 'text_input':
      case 'input':
        return (
          <input
            key={el.id}
            style={elementStyle}
            type="text"
            placeholder={el.data?.placeholder || "Type answer..."}
            value={studentAnswers[el.id] || ''}
            onChange={(e) => setStudentAnswers({...studentAnswers, [el.id]: e.target.value})}
            className={`border-b-2 bg-white/5 border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#fcd34d] px-4 rounded-t-md shadow-inner transition-colors pointer-events-auto ${
              isMobile ? 'w-full text-center py-4' : 'py-2'
            }`}
          />
        );

      default:
        // The Red Debugger Box - Instantly flags unrecognized Admin Hub elements
        return (
           <div key={el.id} style={elementStyle} className="bg-red-500/20 border-2 border-dashed border-red-500 text-red-500 flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest pointer-events-none z-50">
              <span className="text-white/50 text-[8px] mb-1">Unrecognized Admin Type</span>
              MISSING: {el.type}
           </div>
        );
    }
  };

  // --- THE ANALYTICS SCREEN UI ---
  if (showAnalytics && finalScores) {
    return (
      <div className="fixed inset-0 z-[400] bg-[#070b19] flex flex-col items-center justify-center font-montserrat overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/40 blur-[120px] rounded-full mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/20 blur-[100px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl p-8 flex flex-col items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl">
          <h2 className="text-xl md:text-2xl font-black text-white/70 mb-2 tracking-widest uppercase drop-shadow-md">
            {lessonData?.level || student?.level}: UNIT {lessonData?.unit || student?.unit}
          </h2>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase drop-shadow-lg">
            {isLesson ? 'LESSON 1' : 'WORKBOOK 1'}
          </h3>
          <h1 className="text-5xl md:text-[5rem] font-black text-[#fcd34d] mb-12 tracking-wide leading-none drop-shadow-[0_0_20px_rgba(252,211,77,0.5)]">
            COMPLETED
          </h1>

          <div className="w-full max-w-md flex flex-col gap-5 mb-12">
            {Object.keys(finalScores.categories).map(cat => {
               const score = finalScores.categories[cat];
               const label = cat === 'listeningSpeaking' ? 'List/Speak' : cat;
               return (
                 <div key={cat} className="flex items-center gap-4">
                   <span className="w-32 text-right text-sm md:text-base font-bold text-white tracking-widest uppercase">{label}:</span>
                   <div className="flex-grow h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-[#fcd34d] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(252,211,77,0.8)]" style={{ width: `${score}%` }}></div>
                   </div>
                 </div>
               );
            })}
          </div>

          <div className="text-[7rem] md:text-[9rem] font-black text-white leading-none mb-8 tracking-tighter drop-shadow-2xl">
            {finalScores.total}%
          </div>

          <button 
            onClick={() => onExit(finalScores.total)} 
            className="bg-[#fcd34d] text-[#08203e] font-black text-sm md:text-base px-12 py-5 rounded-full shadow-[0_0_20px_rgba(252,211,77,0.4)] hover:scale-105 transition-transform uppercase tracking-widest"
          >
            {isLesson ? 'CONTINUE TO WORKBOOK' : 'CONTINUE TO CALENDAR'}
          </button>
        </div>
      </div>
    );
  }

  let visibleElements = isLesson 
    ? elements.filter(el => el.screenId === currentScreen || !el.screenId)
    : elements;

  if (isMobile) {
    visibleElements = [...visibleElements].sort((a, b) => (a.y || 0) - (b.y || 0));
  }

  return (
    <div className="fixed inset-0 z-[300] bg-[#070b19] text-white flex flex-col font-montserrat">
      
      {/* Background Waves */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <div className="relative z-10 flex justify-between items-center w-full px-4 md:px-8 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-6 md:h-8 object-contain opacity-90" />
          <div className="h-4 md:h-6 w-[2px] bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-sm font-black text-white tracking-widest uppercase">{lessonData?.level || student?.level}: UNIT {lessonData?.unit || student?.unit}</span>
            <span className="text-[8px] md:text-[10px] font-bold text-white/50 uppercase">{lessonData?.content_type || 'Activity'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-3 bg-white/10 py-1.5 px-3 rounded-full border border-white/10">
            <span className="text-xs font-bold text-white">{student?.first_name || 'Student'} {student?.last_name || ''}</span>
            <div className="w-6 h-6 rounded-full overflow-hidden">
               <img src="https://i.postimg.cc/P5V486CM/Sin-titulo-(Post-para-Instagram-(45))-(2).png" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <button onClick={() => onExit()} className="text-[9px] md:text-[10px] font-black bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full hover:bg-red-500 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all uppercase tracking-widest">
            Close
          </button>
        </div>
      </div>

      {/* SCALED CANVAS CONTAINER */}
      <div className="relative z-10 flex-grow w-full max-w-[1200px] mx-auto p-4 md:p-8 overflow-y-auto overflow-x-hidden flex justify-center items-start">
        <div 
          ref={containerRef}
          className={`relative w-full bg-white/5 backdrop-blur-md shadow-2xl border border-white/10 ${isMobile ? 'rounded-3xl p-6 flex flex-col' : 'rounded-[2rem] overflow-hidden'}`}
          style={!isMobile ? { 
            width: '1200px', 
            height: '800px', 
            minHeight: '800px',
            transform: `scale(${scale})`, 
            transformOrigin: 'top center' 
          } : { minHeight: '800px' }}
        >
          {visibleElements.map(renderElement)}
        </div>
      </div>

      {isLesson && (
        <div className="relative z-10 w-full bg-white/5 backdrop-blur-xl border-t border-white/10 p-3 md:p-5 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 md:gap-8">
            <button 
              onClick={handlePrev} 
              disabled={currentScreen === 1}
              className={`font-black text-[10px] md:text-xs px-5 md:px-8 py-3 rounded-full uppercase tracking-widest transition-all ${
                currentScreen === 1 ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              Back
            </button>
            <div className="flex-grow flex flex-col gap-2 max-w-lg">
              <div className="flex justify-between text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-widest">
                <span>Progress</span>
                <span className="text-[#fcd34d]">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 md:h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-[#fcd34d] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(252,211,77,0.8)]" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={handleNext} 
              disabled={currentScreen === totalScreens}
              className={`font-black text-[10px] md:text-xs px-5 md:px-8 py-3 rounded-full uppercase tracking-widest transition-all ${
                currentScreen === totalScreens ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' : 'bg-[#fcd34d] text-[#08203e] hover:scale-105 shadow-[0_0_15px_rgba(252,211,77,0.4)]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default StudentPlayer;