import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';

const StudentPlayer = ({ activityType, student, onExit, onComplete }) => {
  const [elements, setElements] = useState([]);
  const [screens, setScreens] = useState([1]);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Interaction States
  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({});
  const [touchDragState, setTouchDragState] = useState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });

  // Record & Compare States
  const [rcStates, setRcStates] = useState({}); 
  const rcRecorders = useRef({}); 
  const rcChunks = useRef({});    
  const rcPlayers = useRef({});

  useEffect(() => {
    const fetchBlueprint = async () => {
      if (!student) return;
      try {
        const { data, error } = await supabase
          .from('content_blueprints')
          .select('*')
          .eq('level', student.level || 'A1')
          .eq('unit', student.unit || 1)
          .eq('content_type', activityType)
          .maybeSingle();

        if (data && data.blueprint_data) {
          setElements(data.blueprint_data.elements || []);
          setScreens(data.screens || [1]);
        } else {
          // Fallback if empty
          setElements([]);
          setScreens([1]);
        }
      } catch (err) {
        console.error("Error loading activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlueprint();
  }, [student, activityType]);

  // --- MOBILE DRAG & DROP AUTO-SCROLL LOGIC ---
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!touchDragState.isDragging) return;
      e.preventDefault(); 
      const touch = e.touches[0];
      setTouchDragState(prev => ({ ...prev, x: touch.clientX, y: touch.clientY }));

      // Auto-scroll if dragged to top 15% of the viewport
      if (touch.clientY < window.innerHeight * 0.15) {
        window.scrollBy({ top: -15, behavior: 'auto' });
      }
      // Auto-scroll if dragged to bottom 15%
      if (touch.clientY > window.innerHeight * 0.85) {
        window.scrollBy({ top: 15, behavior: 'auto' });
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!touchDragState.isDragging) return;
      const touch = e.changedTouches[0];
      
      // Hide the ghost element momentarily to find what's underneath it
      const ghostEl = document.getElementById('dnd-ghost');
      if (ghostEl) ghostEl.style.display = 'none';
      
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      if (ghostEl) ghostEl.style.display = 'block';

      const zone = dropTarget?.closest('[data-dnd-zone]');
      if (zone) {
        const zoneId = zone.getAttribute('data-dnd-zone');
        setDndAnswers(prev => ({...prev, [zoneId]: touchDragState.text}));
      }
      setTouchDragState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });
    };

    if (touchDragState.isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchDragState.isDragging, touchDragState.text]);

  // --- RECORD & COMPARE LOGIC ---
  const handleRcClick = async (id) => {
    const currentState = rcStates[id]?.phase || 'IDLE';

    if (currentState === 'IDLE' || currentState === 'RETRY') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        rcRecorders.current[id] = recorder;
        rcChunks.current[id] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) rcChunks.current[id].push(e.data); };
        recorder.onstop = () => {
          const audioBlob = new Blob(rcChunks.current[id], { type: 'audio/webm' });
          setRcStates(prev => ({ ...prev, [id]: { phase: 'HAS_RECORDING', url: URL.createObjectURL(audioBlob) } }));
          stream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        setRcStates(prev => ({ ...prev, [id]: { phase: 'RECORDING', url: null } }));
      } catch (err) { alert("Microphone access is required."); }
    } 
    else if (currentState === 'RECORDING') {
      if (rcRecorders.current[id] && rcRecorders.current[id].state !== 'inactive') rcRecorders.current[id].stop();
    } 
    else if (currentState === 'HAS_RECORDING') {
      const audio = new Audio(rcStates[id].url);
      rcPlayers.current[id] = audio;
      audio.onended = () => setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'RETRY' } }));
      audio.play();
      setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'PLAYING' } }));
    }
    else if (currentState === 'PLAYING') {
      if (rcPlayers.current[id]) rcPlayers.current[id].pause();
      setRcStates(prev => ({ ...prev, [id]: { ...prev[id], phase: 'RETRY' } }));
    }
  };

  const handleNextScreen = () => {
    if (currentScreenIndex < screens.length - 1) {
      setCurrentScreenIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Generate mock scores based on completion length for the Gatekeeper
      const mockScores = {
        Listening: Math.floor(Math.random() * 30) + 70, 
        Reading: Math.floor(Math.random() * 30) + 70,
        Grammar: Math.floor(Math.random() * 30) + 70,
        Comprehension: Math.floor(Math.random() * 30) + 70
      };
      onComplete(mockScores);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b19]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fcd34d]"></div>
      </div>
    );
  }

  const currentScreenId = screens[currentScreenIndex];
  const screenElements = elements.filter(el => el.screenId === currentScreenId);
  
  // Separate layout components (record_compare added to cardElements)
  const headers = screenElements.filter(el => el.type === 'text');
  const mediaElements = screenElements.filter(el => ['video', 'image', 'audio'].includes(el.type));
  const cardElements = screenElements.filter(el => ['short_answer', 'multiple_selection', 'slider_bar', 'fill_in_the_blank', 'record_compare'].includes(el.type));
  const fullWidthElements = screenElements.filter(el => ['drag_and_drop', 'crossword', 'word_search', 'shape'].includes(el.type));
  const dockElements = screenElements.filter(el => ['nav_button', 'record_compare'].includes(el.type));

  const renderFormattedText = (el) => {
    const data = el.data || {};
    if (!data.templateText) return null;
    let globalBlankIndex = 0; 
    const lines = data.templateText.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(_+)/);
      return (
        <div key={lineIdx} className="flex items-center flex-wrap gap-2 mb-3">
          {parts.map((part, partIdx) => {
            if (part.startsWith('_')) {
              const currentBlankIndex = globalBlankIndex++;
              return (
                <input 
                  key={partIdx} type="text" 
                  value={studentAnswers[`${el.id}_${currentBlankIndex}`] || ''} 
                  onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${currentBlankIndex}`]: e.target.value}))} 
                  className="inline-block text-center focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition-all shadow-inner" 
                  style={{ backgroundColor: data.a_boxColor, borderColor: data.a_lineColor, borderWidth: '2px', borderStyle: 'solid', borderRadius: `${data.a_borderRadius}px`, width: `${Math.max(part.length * 20, 60)}px`, fontSize: `${data.a_fontSize}px`, color: data.a_textColor, fontWeight: data.a_isBold ? 'bold' : 'normal', padding: '4px 8px' }} 
                />
              );
            }
            return <span key={partIdx} style={{ fontSize: `${data.t_fontSize}px`, color: data.t_textColor, fontWeight: data.t_isBold ? 'bold' : 'normal' }}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="relative min-h-screen w-full font-montserrat bg-[#070b19] text-white overflow-x-hidden flex flex-col pt-20 pb-32">
      
      {/* Top Navigation Bar (Fixed Exit Button) */}
      <div className="fixed top-0 left-0 w-full h-20 bg-[#070b19]/90 backdrop-blur-md border-b border-white/10 z-[100] flex items-center justify-between px-6 shadow-xl">
         <div className="flex items-center gap-4">
            <button onClick={onExit} className="bg-red-600/90 border border-red-400 text-white font-black px-6 py-2.5 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.6)] uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">
               EXIT / CLOSE
            </button>
            <span className="font-bold tracking-widest uppercase text-xs text-white/70">{activityType} Mode</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#fcd34d] tracking-widest uppercase">Screen {currentScreenIndex + 1}/{screens.length}</span>
         </div>
      </div>

      <style>{`
        .zoom-container { touch-action: pan-x pan-y pinch-zoom; overflow: auto; overscroll-behavior: contain; }
        .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: var(--thumb-color); cursor: pointer; margin-top: -14px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); border: 2px solid rgba(255,255,255,0.8); }
        .custom-slider::-moz-range-thumb { height: 28px; width: 28px; border-radius: 50%; background: var(--thumb-color); cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); border: 2px solid rgba(255,255,255,0.8); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      {/* MOBILE GHOST DRAG ELEMENT */}
      {touchDragState.isDragging && (
         <div id="dnd-ghost" className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-90 scale-105" style={{ left: touchDragState.x, top: touchDragState.y }}>
            <div className="px-6 py-3 bg-[#fcd34d] text-[#08203e] rounded-xl font-bold text-sm shadow-2xl border-2 border-white">{touchDragState.text}</div>
         </div>
      )}

      {/* FIXED CANVAS SIZE: max-w-[90rem] instead of 5xl */}
      <div className="w-full max-w-[90rem] mx-auto px-4 md:px-8 flex flex-col gap-6 flex-grow relative z-10 pt-4">
        
        {/* 1. HEADERS */}
        {headers.map(el => (
          <div key={el.id} className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl text-center mb-2 animate-fade-in">
             <div dangerouslySetInnerHTML={{__html: el.htmlContent}} className="rich-text-content" />
          </div>
        ))}

        {/* 2. MEDIA (Video/Image standalone) */}
        {mediaElements.length > 0 && (
           <div className="w-full flex justify-center mb-6">
             {mediaElements.map(el => (
                <div key={el.id} className={`w-full ${el.type === 'audio' ? 'max-w-md bg-white/5 p-4' : 'max-w-4xl bg-black/40 aspect-[4/5] md:aspect-video'} rounded-3xl overflow-hidden border border-white/20 shadow-2xl animate-fade-in`}>
                   {el.type === 'video' && <video src={el.url} controls className="w-full h-full object-cover" />}
                   {el.type === 'image' && <img src={el.url} className="w-full h-full object-contain" alt="Media" />}
                   {el.type === 'audio' && <audio src={el.url} controls className="w-full" />}
                </div>
             ))}
           </div>
        )}

        {/* 3. CARD GRID */}
        {cardElements.length > 0 && (
           <div className="flex flex-wrap justify-center gap-6 w-full animate-fade-in">
              {cardElements.map(el => (
                 <div key={el.id} className="w-full md:w-[calc(50%-12px)] flex flex-col bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-xl hover:bg-white/10 transition-colors">
                    
                    {/* INJECTED: Universal Image Renderer for Cards */}
                    {el.data?.imageUrl && (
                       <img src={el.data.imageUrl} className="w-full h-64 object-contain rounded-xl mb-6 bg-black/20 border border-white/10" alt="Card context" />
                    )}

                    {/* INJECTED: Record & Compare Audio/Prompt Renderer */}
                    {el.type === 'record_compare' && (
                       <>
                         {el.data?.promptHtml && <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="mb-4 text-center text-lg" />}
                         {el.data?.audioUrl && <audio src={el.data.audioUrl} controls className="w-full rounded-xl mt-auto mb-4" />}
                         <div className="text-center text-white/40 text-[10px] uppercase font-bold tracking-widest mt-auto border-t border-white/10 pt-4">
                           (Use the RECORD button below)
                         </div>
                       </>
                    )}

                    {el.type === 'short_answer' && (
                       <>
                         <div dangerouslySetInnerHTML={{ __html: el.data.questionHtml }} className="w-full break-words text-white text-lg mb-6" />
                         <input type="text" placeholder="Type your answer here..." value={studentAnswers[el.id] || ''} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="w-full p-4 mt-auto bg-black/40 border border-white/20 rounded-xl text-white text-base focus:ring-2 focus:ring-[#fcd34d] focus:border-transparent transition-all shadow-inner placeholder-white/30" />
                       </>
                    )}

                    {el.type === 'fill_in_the_blank' && (
                       <div className="w-full h-full flex flex-col justify-center">
                          {renderFormattedText(el)}
                       </div>
                    )}

                    {el.type === 'multiple_selection' && (
                       <>
                         {el.data.promptType === 'image' && el.data.promptUrl ? <img src={el.data.promptUrl} className="w-full h-48 object-contain rounded-xl mb-6 bg-black/20" alt="Prompt" /> : <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="mb-6 text-lg" />}
                         <div className="flex flex-col gap-3 mt-auto">
                            {el.data.options?.map((opt) => {
                               const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                               return (
                                 <button 
                                   key={opt.id} 
                                   onClick={() => setStudentAnswers(prev => ({ ...prev, [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`] }))} 
                                   style={{ backgroundColor: isSelected ? '#fcd34d' : el.data.optBoxColor, borderColor: isSelected ? '#ca8a04' : el.data.optLineColor, borderWidth: (el.data.optLineColor === 'transparent' && !isSelected) ? '0px' : '2px', borderStyle: 'solid', borderRadius: `${el.data.optBorderRadius}px` }} 
                                   className="w-full p-4 text-left transition-all hover:scale-[1.02] active:scale-95 shadow-md flex items-center"
                                 >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#08203e]' : 'border-white/40'}`}>
                                      {isSelected && <div className="w-2.5 h-2.5 bg-[#08203e] rounded-full"></div>}
                                    </div>
                                    <div dangerouslySetInnerHTML={{__html: opt.html}} className="pointer-events-none" style={{ color: isSelected ? '#08203e' : 'inherit' }} />
                                 </button>
                               )
                            })}
                         </div>
                       </>
                    )}

                    {el.type === 'slider_bar' && (() => {
                       const isVert = el.data.orientation === 'vertical';
                       const opts = el.data.options || [];
                       const maxIdx = Math.max(0, opts.length - 1);
                       const currentIdx = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id]) : Math.floor(maxIdx / 2);
                       const activeOpt = opts[currentIdx] || {};
                       const pct = maxIdx === 0 ? 50 : (currentIdx / maxIdx) * 100;

                       return (
                         <div className="w-full flex flex-col h-full min-h-[200px] justify-end relative pb-6 mt-6">
                            <div className="absolute w-full h-full flex flex-col items-center justify-center">
                              <div className="absolute flex items-center justify-center rounded-full shadow-inner overflow-hidden" style={{ backgroundColor: el.data.barColor, width: isVert ? `${el.data.barThickness}px` : '100%', height: isVert ? '100%' : `${el.data.barThickness}px` }}></div>
                              <input type="range" min="0" max={maxIdx} step="1" value={currentIdx} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="absolute custom-slider w-full h-full z-10" style={{ '--thumb-color': el.data.handleColor, transform: isVert ? 'rotate(-90deg)' : 'none', WebkitAppearance: 'none', background: 'transparent' }} />
                              { !isVert && (
                                 <div className="absolute flex flex-col items-center transition-all duration-200 pointer-events-none z-0" style={{ left: `${pct}%`, bottom: 'calc(50% + 20px)', transform: 'translateX(-50%)' }}>
                                    <div className="bg-white text-[#08203e] px-5 py-2.5 rounded-xl shadow-xl font-black text-sm">{activeOpt.text}</div>
                                    <div className="w-0 h-0 border-solid" style={{ borderWidth: '8px 6px 0 6px', borderColor: 'white transparent transparent transparent' }} />
                                 </div>
                              )}
                            </div>
                         </div>
                       );
                    })()}
                 </div>
              ))}
           </div>
        )}

        {/* 4. FULL WIDTH ELEMENTS (D&D, Puzzles) */}
        {fullWidthElements.map(el => (
           <div key={el.id} className="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-10 shadow-xl animate-fade-in mb-6">
              
              {el.type === 'drag_and_drop' && (
                 <div className="flex flex-col gap-8 w-full pb-24 md:pb-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
                       {el.data.items.map((item, idx) => item.imageUrl && (
                         <div key={idx} className="flex flex-col items-center gap-4">
                           <div className="w-full aspect-[4/5] bg-black/20 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                             <img src={item.imageUrl} className="w-full h-full object-cover" alt="target" />
                           </div>
                           <div data-dnd-zone={`${el.id}_${idx}`} className="w-full min-h-[60px] border-2 border-dashed border-white/30 rounded-xl bg-black/40 flex items-center justify-center transition-colors">
                              {dndAnswers[`${el.id}_${idx}`] ? (
                                <div onClick={() => setDndAnswers(prev => { const copy = {...prev}; delete copy[`${el.id}_${idx}`]; return copy; })} className="px-4 py-3 bg-[#fcd34d] text-[#08203e] rounded-xl font-bold text-sm shadow-md cursor-pointer w-full text-center hover:scale-105 active:scale-95 transition-transform truncate">
                                  {dndAnswers[`${el.id}_${idx}`]}
                                </div>
                              ) : <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">DROP HERE</span>}
                           </div>
                         </div>
                       ))}
                    </div>

                    <div className="fixed md:static bottom-0 left-0 w-full md:w-auto bg-[#070b19]/95 md:bg-black/40 backdrop-blur-md md:backdrop-blur-none p-6 md:p-8 md:rounded-2xl border-t md:border border-white/20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-inner z-[90] md:z-auto">
                       <div className="text-center font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest mb-4 drop-shadow-md">Word Bank</div>
                       <div className="flex flex-wrap justify-center gap-3">
                         {el.data.items.map((item, idx) => {
                           if (!item.studentViewText) return null;
                           const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                           if (isUsed) return null;
                           return (
                             <div 
                               key={`bank-${idx}`} 
                               onPointerDown={(e) => { e.preventDefault(); setTouchDragState({ isDragging: true, text: item.studentViewText, x: e.clientX || (e.touches && e.touches[0].clientX), y: e.clientY || (e.touches && e.touches[0].clientY), sourceElId: el.id }); }}
                               className="px-6 py-3.5 bg-white/10 hover:bg-[#fcd34d] hover:text-[#08203e] border border-white/20 rounded-xl text-white font-bold text-sm shadow-lg cursor-grab active:cursor-grabbing transition-colors touch-none"
                             >
                               {item.studentViewText}
                             </div>
                           );
                         })}
                         {Object.keys(dndAnswers).length === el.data.items.filter(i=>i.imageUrl).length && <span className="text-green-400 font-bold text-sm tracking-widest uppercase py-3">All items placed!</span>}
                       </div>
                    </div>
                 </div>
              )}

              {(el.type === 'crossword' || el.type === 'word_search') && (
                 <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
                    <div className="flex-1 flex flex-col gap-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                      {el.type === 'crossword' && (
                        <>
                          <h3 className="font-black text-[#fcd34d] text-lg uppercase tracking-widest border-b border-white/10 pb-3 drop-shadow-md">Prompts</h3>
                          <div className="flex gap-8">
                            <div className="flex-1 flex flex-col gap-4">
                              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-1">Across</h4>
                              {el.data.across?.map(a => <div key={`a-${a.num}`} className="text-sm text-white flex gap-3"><span className="font-black text-[#fcd34d]">{a.num}.</span><span className="font-medium opacity-90">{a.prompt}</span></div>)}
                            </div>
                            <div className="flex-1 flex flex-col gap-4">
                              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-1">Down</h4>
                              {el.data.down?.map(d => <div key={`d-${d.num}`} className="text-sm text-white flex gap-3"><span className="font-black text-[#fcd34d]">{d.num}.</span><span className="font-medium opacity-90">{d.prompt}</span></div>)}
                            </div>
                          </div>
                        </>
                      )}
                      {el.type === 'word_search' && (
                        <>
                          <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="w-full whitespace-pre-wrap break-words border-b border-white/10 pb-4 mb-2 drop-shadow-md text-lg" />
                          <div className="flex gap-4">
                            <ul className="flex-1 flex flex-col gap-3 list-none pl-2">
                              {el.data.targetWords?.slice(0, Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w1-${i}`} className="text-sm font-bold text-white/90 tracking-widest flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#fcd34d] shadow-[0_0_8px_#fcd34d]"></span>{w}</li>)}
                            </ul>
                            <ul className="flex-1 flex flex-col gap-3 list-none pl-2">
                              {el.data.targetWords?.slice(Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w2-${i}`} className="text-sm font-bold text-white/90 tracking-widest flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#fcd34d] shadow-[0_0_8px_#fcd34d]"></span>{w}</li>)}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex-[2] bg-black/40 rounded-3xl border border-white/10 p-4 zoom-container flex justify-center items-center min-h-[400px] shadow-inner relative">
                       <span className="absolute top-4 left-4 text-white/30 text-[10px] uppercase font-bold tracking-widest pointer-events-none z-0">Pinch to Zoom 🔍</span>
                       
                       {el.type === 'crossword' && (
                         <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(35px, 1fr))`, gap: '2px', width: 'fit-content', position: 'relative', zIndex: 10 }}>
                            {el.data.grid.map((row, rIdx) => 
                              row.map((cell, cIdx) => (
                                <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-10 md:w-12">
                                  {cell ? (
                                    <div className="w-full h-full relative">
                                      {cell.num && <span className="absolute top-1 left-1 text-[9px] font-black text-white/70 z-10 pointer-events-none drop-shadow-md">{cell.num}</span>}
                                      <input 
                                        type="text" maxLength={1} 
                                        value={studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || ''}
                                        onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${rIdx}_${cIdx}`]: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')}))}
                                        style={{ backgroundColor: el.data.cellColor, borderColor: el.data.lineColor, color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal' }}
                                        className="w-full h-full text-center uppercase border-2 focus:outline-none focus:ring-4 focus:ring-[#fcd34d] transition shadow-inner rounded-sm"
                                      />
                                    </div>
                                  ) : <div className="w-full h-full bg-transparent" />}
                                </div>
                              ))
                            )}
                         </div>
                       )}

                       {el.type === 'word_search' && (
                         <div 
                           style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`, borderWidth: '3px', borderStyle: 'solid', borderColor: el.data.lineColor, backgroundColor: el.data.cellColor }}
                           className="shadow-2xl max-w-full max-h-full aspect-square w-full rounded-xl overflow-hidden relative z-10"
                         >
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
                                    style={{
                                      color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal',
                                      borderRight: cIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none', borderBottom: rIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none',
                                      backgroundColor: isSelected ? 'rgba(252, 211, 77, 0.6)' : 'transparent', cursor: 'pointer'
                                    }}
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
        ))}
      </div>

      {/* 5. THE BOTTOM DOCK (Record & Compare + Continue) */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#070b19] via-[#070b19]/90 to-transparent pt-20 pb-8 px-6 z-[80] pointer-events-none">
         <div className="max-w-5xl mx-auto flex justify-center items-center gap-6 pointer-events-auto">
            {dockElements.map(el => {
              if (el.type === 'record_compare') {
                const rcPhase = rcStates[el.id]?.phase || 'IDLE';
                let rcText = 'RECORD'; let rcBg = 'bg-white/10 hover:bg-white/20'; let rcBorder = 'border-white/20'; let rcShadow = 'shadow-xl'; let rcTextCol = 'text-white';
                
                if (rcPhase === 'RECORDING') { rcText = 'RECORDING'; rcBg = 'bg-red-600/90'; rcBorder = 'border-red-400'; rcShadow = 'shadow-[0_0_20px_rgba(220,38,38,0.6)]'; } 
                else if (rcPhase === 'HAS_RECORDING') { rcText = 'COMPARE'; rcBg = 'bg-[#fcd34d]'; rcBorder = 'border-transparent'; rcTextCol = 'text-[#08203e]'; rcShadow = 'shadow-[0_0_20px_rgba(252,211,77,0.4)]'; } 
                else if (rcPhase === 'PLAYING') { rcText = 'COMPARING'; rcBg = 'bg-green-500/90'; rcBorder = 'border-green-400'; rcShadow = 'shadow-[0_0_20px_rgba(34,197,94,0.6)]'; } 
                else if (rcPhase === 'RETRY') { rcText = 'RETRY'; }

                return (
                  <button key={el.id} onClick={() => handleRcClick(el.id)} className={`${rcBg} border ${rcBorder} ${rcTextCol} font-black px-10 py-5 rounded-full ${rcShadow} flex items-center gap-3 cursor-pointer transition-all uppercase tracking-widest text-sm hover:scale-105 active:scale-95`}>
                     {(rcPhase === 'RECORDING' || rcPhase === 'PLAYING') && <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>}
                     {rcText}
                  </button>
                );
              }
              if (el.type === 'nav_button') {
                const isFinal = el.data?.buttonStyle === 'finish_pill';
                return (
                  <button key={el.id} onClick={handleNextScreen} className="bg-[#fcd34d] text-[#08203e] font-black px-12 py-5 rounded-full shadow-[0_0_25px_rgba(252,211,77,0.4)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform text-sm">
                     {isFinal ? 'FINISH' : 'CONTINUE ⬇'}
                  </button>
                );
              }
              return null;
            })}
         </div>
      </div>

    </div>
  );
};

export default StudentPlayer;