import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';

// ==========================================
// Safe URL Extractor for Bunny/Video IFrames
// ==========================================
const extractVideoUrl = (rawInput) => {
  if (!rawInput) return '';
  if (rawInput.includes('<iframe') && rawInput.includes('src=')) {
    const match = rawInput.match(/src=["'](.*?)["']/);
    if (match && match[1]) return match[1];
  }
  return rawInput;
};

// ==========================================
// THE MAIN PLAYER ENGINE
// ==========================================
const StudentPlayer = ({ activityType, student, onExit, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [screensData, setScreensData] = useState([]);
  const [allElements, setAllElements] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  // Student Interaction States
  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({});
  const [selectedDndWord, setSelectedDndWord] = useState(null);

  // Safe Parser for Database
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
        const { data, error: fetchError } = await supabase
          .from('content_blueprints') 
          .select('*')
          .eq('level', student.level || 'A1: Básico 1')
          .eq('unit', student.unit || 1)
          .eq('content_type', activityType)
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
        console.error("Fetch error:", err);
        setError(`Error loading content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [activityType, student]);

  // ==========================================
  // AUTO-GRADING ENGINE
  // ==========================================
  const calculateFinalScores = () => {
    let totalPossible = 0;
    let totalEarned = 0;

    allElements.forEach(el => {
      if (el.type === 'short_answer' && el.data?.correctAnswer) {
        totalPossible += 1;
        if ((studentAnswers[el.id] || '').trim().toLowerCase() === el.data.correctAnswer.trim().toLowerCase()) {
          totalEarned += 1;
        }
      } 
      else if (el.type === 'fill_in_the_blank' && el.data?.answerText) {
        const targetWords = el.data.answerText.split(',').map(w => w.replace(/["']/g, '').trim().toLowerCase());
        
        targetWords.forEach((targetWord, index) => {
          if (targetWord) {
            totalPossible += 1;
            const studentAns = (studentAnswers[`${el.id}_${index}`] || '').replace(/["']/g, '').trim().toLowerCase();
            if (studentAns === targetWord) {
              totalEarned += 1;
            }
          }
        });
      }
      else if (el.type === 'multiple_selection') {
        el.data.options?.forEach(opt => {
          if (opt.isCorrect) {
            totalPossible += 1;
            if (studentAnswers[`${el.id}_${opt.id}`]) totalEarned += 1;
          }
        });
      } 
      else if (el.type === 'drag_and_drop') {
        el.data.items?.forEach((item, idx) => {
          if (item.studentViewText) {
            totalPossible += 1;
            if (Object.values(dndAnswers).includes(item.studentViewText)) totalEarned += 1;
          }
        });
      }
      else if (el.type === 'slider_bar') {
        totalPossible += 1;
        if (studentAnswers[el.id] !== undefined) totalEarned += 1;
      }
    });

    const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 100;
    
    return {
      Listening: percentage,
      Reading: percentage,
      Grammar: percentage,
      Comprehension: percentage,
      Speaking: percentage,
      Writing: percentage
    };
  };

  const handleContinueClick = () => {
    if (currentStep < screensData.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const finalScores = calculateFinalScores();
      onComplete(finalScores);
    }
  };

  const handleDndDrop = (zoneId) => {
    if (!selectedDndWord) return;
    setDndAnswers(prev => ({ ...prev, [zoneId]: selectedDndWord }));
    setSelectedDndWord(null);
  };

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b19]"><div className="w-16 h-16 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b19] text-white font-montserrat px-6 text-center">
      <h2 className="text-4xl font-black text-red-500 mb-4 uppercase tracking-widest drop-shadow-md">Content Not Found</h2>
      <p className="text-red-400 font-bold mb-8">{error}</p>
      <button onClick={onExit} className="px-8 py-4 border-2 border-white/20 bg-white/5 rounded-2xl hover:bg-white/10 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest shadow-xl">Return to Hub</button>
    </div>
  );

  const currentElements = screensData[currentStep] || [];
  const contentElements = currentElements.filter(el => !['nav_button'].includes(el.type));
  const dockElements = currentElements.filter(el => ['nav_button', 'record_compare'].includes(el.type));

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-[#070b19] text-white font-montserrat overflow-y-auto custom-scrollbar">
      
      {/* Background Mirror */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#08203e]/40 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#ca8a04]/10 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Global Navbar */}
      <div className="sticky top-0 h-20 w-full flex items-center justify-between px-6 md:px-12 z-50 shrink-0 border-b border-white/10 bg-[#070b19]/90 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-8 md:h-10 object-contain drop-shadow-md" />
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

      {/* Dynamic Content Container */}
      <div className="flex-1 w-full max-w-[80rem] mx-auto p-6 md:p-12 relative z-10 flex flex-col pb-32">
        <div className="flex flex-wrap justify-center gap-8 w-full">
          
          {contentElements.map(el => {
            const isMedia = ['video', 'image', 'audio'].includes(el.type);
            const isCard = ['short_answer', 'multiple_selection', 'slider_bar', 'fill_in_the_blank', 'drag_and_drop', 'crossword', 'word_search'].includes(el.type);
            
            if (isMedia) {
              return (
                <div key={el.id} className={`w-full ${el.type === 'video' ? 'max-w-5xl' : 'max-w-3xl'} bg-black/40 rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl animate-fade-in relative mb-8 mx-auto`}>
                  {el.type === 'video' && <iframe src={extractVideoUrl(el.url)} className="w-full aspect-video border-none" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen />}
                  {el.type === 'image' && <img src={el.url || el.data?.imageUrl} alt="Content" className="w-full h-auto max-h-[600px] object-contain rounded-[2rem]" />}
                  {el.type === 'audio' && (
                    <div className="p-8 w-full flex flex-col items-center">
                      {el.data?.imageUrl && <img src={el.data.imageUrl} alt="Audio Cover" className="w-full max-w-sm rounded-2xl shadow-xl mb-8" />}
                      <audio src={el.url || el.data?.audioUrl} controls controlsList="nodownload" className="w-full" />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={el.id} className={`relative flex flex-col ${isCard && el.type !== 'drag_and_drop' && el.type !== 'crossword' && el.type !== 'word_search' ? 'w-full md:w-[calc(50%-16px)]' : 'w-full flex-col items-center'}`}>
                
                {el.type === 'text' && (
                  <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 border border-white/20 shadow-2xl text-center mb-8">
                    <div dangerouslySetInnerHTML={{__html: el.htmlContent}} className="rich-text-content pointer-events-none" />
                  </div>
                )}

                {isCard && (
                  <div className="w-full bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-8 flex flex-col gap-6 shadow-2xl h-full justify-between animate-slide-up">
                    
                    {el.data?.imageUrl && <img src={el.data.imageUrl} alt="Visual Prompt" className="w-full h-64 object-cover rounded-2xl shadow-inner mb-4" />}

                    {el.type === 'fill_in_the_blank' && el.data && (() => {
                       const rawText = el.data.templateText || '';
                       if (!rawText) return null;
                       
                       const parts = rawText.split(/(_+)/);
                       let blankIndex = 0;
                       
                       return (
                          <div className="w-full h-full flex flex-col justify-center items-center mt-4">
                             <div 
                               className="text-center w-full break-words leading-[3rem]"
                               style={{
                                 color: el.data.t_textColor || '#ffffff',
                                 fontSize: el.data.t_fontSize ? `${el.data.t_fontSize}px` : '18px',
                                 fontFamily: el.data.t_fontFamily || 'Montserrat',
                                 fontWeight: el.data.t_isBold ? 'bold' : 'normal',
                                 fontStyle: el.data.t_isItalic ? 'italic' : 'normal',
                                 textDecoration: el.data.t_isUnderline ? 'underline' : 'none'
                               }}
                             >
                                {parts.map((part, i) => {
                                   if (part.includes('_')) {
                                      const currentBlankIndex = blankIndex++;
                                      const blankWidth = Math.max(60, Math.min(part.length * 15, 300));
                                      return (
                                         <input 
                                            key={i}
                                            type="text"
                                            value={studentAnswers[`${el.id}_${currentBlankIndex}`] || ''}
                                            onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${currentBlankIndex}`]: e.target.value}))}
                                            className="mx-2 px-3 py-1 bg-black/40 border-b-2 border-t-0 border-x-0 border-white/50 focus:border-[#fcd34d] text-center outline-none transition-colors shadow-inner rounded-t-md"
                                            style={{ 
                                              width: `${blankWidth}px`, 
                                              color: el.data.a_textColor || '#fcd34d',
                                              fontWeight: el.data.a_isBold ? 'bold' : 'normal',
                                              fontStyle: el.data.a_isItalic ? 'italic' : 'normal',
                                              textDecoration: el.data.a_isUnderline ? 'underline' : 'none'
                                            }}
                                         />
                                      );
                                   }
                                   return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
                                })}
                             </div>
                          </div>
                       );
                    })()}

                    {el.type === 'short_answer' && el.data && (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: el.data.questionHtml }} className="w-full break-words text-white mt-2 text-lg md:text-xl font-medium" />
                        <input type="text" placeholder="Type your answer here..." value={studentAnswers[el.id] || ''} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="w-full p-6 mt-auto bg-black/40 border border-white/20 rounded-2xl text-white font-bold focus:ring-2 focus:ring-[#fcd34d] transition-all shadow-inner placeholder-white/30 text-lg outline-none" />
                      </>
                    )}

                    {el.type === 'multiple_selection' && el.data && (
                      <>
                        {el.data.promptHtml && <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="mb-6 mt-2 text-lg md:text-xl font-medium" />}
                        <div className="flex flex-col gap-4 mt-auto">
                          {el.data.options?.map((opt) => {
                            const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                            return (
                              <button key={opt.id} onClick={() => setStudentAnswers(prev => ({ ...prev, [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`] }))} style={{ backgroundColor: isSelected ? '#fcd34d' : el.data.optBoxColor || 'rgba(0,0,0,0.4)', borderColor: isSelected ? '#ca8a04' : el.data.optLineColor || 'rgba(255,255,255,0.2)', borderWidth: '2px', borderStyle: 'solid', borderRadius: `${el.data.optBorderRadius || 16}px` }} className="w-full p-5 text-left transition-all hover:scale-[1.02] active:scale-95 flex items-center shadow-md">
                                <div className={`w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#08203e]' : 'border-white/40'}`}>
                                  {isSelected && <div className="w-3 h-3 bg-[#08203e] rounded-full"></div>}
                                </div>
                                <div dangerouslySetInnerHTML={{__html: opt.html}} className="pointer-events-none text-lg font-bold" style={{ color: isSelected ? '#08203e' : 'white' }} />
                              </button>
                            )
                          })}
                        </div>
                      </>
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

                    {/* Mobile-Friendly Click-to-Select Drag & Drop */}
                    {el.type === 'drag_and_drop' && el.data && (
                      <div className="flex flex-col gap-10">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                          {el.data.items.map((item, idx) => item.imageUrl && (
                            <div key={idx} className="flex flex-col items-center gap-6">
                              <img src={item.imageUrl} className="w-full aspect-[4/5] rounded-2xl shadow-xl object-cover" alt="DnD Target" />
                              <button 
                                onClick={() => handleDndDrop(`${el.id}_${idx}`)}
                                className={`w-full min-h-[80px] border-2 border-dashed rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center transition-all shadow-inner ${selectedDndWord ? 'border-[#fcd34d] shadow-[0_0_15px_rgba(252,211,77,0.3)] animate-pulse' : 'border-white/40 hover:border-white/60'}`}
                              >
                                {dndAnswers[`${el.id}_${idx}`] ? (
                                  <div onClick={(e) => { e.stopPropagation(); setDndAnswers(prev => { const copy = {...prev}; delete copy[`${el.id}_${idx}`]; return copy; })}} className="px-6 py-4 bg-[#fcd34d] text-[#08203e] rounded-xl font-black text-base shadow-xl w-full text-center hover:scale-105 active:scale-95 transition-transform truncate">
                                    {dndAnswers[`${el.id}_${idx}`]}
                                  </div>
                                ) : <span className={`text-xs uppercase font-black tracking-widest ${selectedDndWord ? 'text-[#fcd34d]' : 'text-white/40'}`}>{selectedDndWord ? 'CLICK TO PLACE' : 'TAP WORD THEN DROP HERE'}</span>}
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="w-full bg-black/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-inner">
                          <div className="text-center font-black text-[#fcd34d] text-xs uppercase tracking-widest mb-6 drop-shadow-md">Word Bank (Tap to select)</div>
                          <div className="flex flex-wrap justify-center gap-4">
                            {el.data.items.map((item, idx) => {
                              if (!item.studentViewText) return null;
                              const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                              if (isUsed) return null;
                              const isSelected = selectedDndWord === item.studentViewText;
                              return (
                                <button key={`bank-${idx}`} onClick={() => setSelectedDndWord(isSelected ? null : item.studentViewText)} className={`px-8 py-4 border rounded-xl font-black text-base shadow-xl cursor-pointer transition-all active:scale-95 ${isSelected ? 'bg-[#fcd34d] text-[#08203e] border-transparent scale-110 shadow-[0_0_20px_rgba(252,211,77,0.5)]' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'}`}>
                                  {item.studentViewText}
                                </button>
                              );
                            })}
                            {Object.keys(dndAnswers).length === el.data.items.filter(i=>i.imageUrl).length && <span className="text-green-400 font-black text-lg tracking-widest uppercase py-4">All items placed!</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Word Search Grid */}
                    {el.type === 'word_search' && el.data && (
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1 flex flex-col gap-8">
                          <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="w-full whitespace-pre-wrap break-words border-b border-white/20 pb-6 mb-4 drop-shadow-md text-xl" />
                          <div className="flex gap-6">
                            <ul className="flex-1 flex flex-col gap-4 list-none pl-2">
                              {el.data.targetWords?.slice(0, Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w1-${i}`} className="text-base font-bold text-white/90 tracking-widest flex items-center gap-4"><span className="w-3 h-3 rounded-full bg-[#fcd34d] shadow-[0_0_10px_#fcd34d]"></span>{w}</li>)}
                            </ul>
                            <ul className="flex-1 flex flex-col gap-4 list-none pl-2">
                              {el.data.targetWords?.slice(Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w2-${i}`} className="text-base font-bold text-white/90 tracking-widest flex items-center gap-4"><span className="w-3 h-3 rounded-full bg-[#fcd34d] shadow-[0_0_10px_#fcd34d]"></span>{w}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="flex-[2] bg-black/40 rounded-3xl border border-white/10 p-6 flex justify-center items-center shadow-inner overflow-x-auto">
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`, borderWidth: '4px', borderStyle: 'solid', borderColor: el.data.lineColor, backgroundColor: el.data.cellColor }} className="shadow-2xl aspect-square min-w-[300px] w-full max-w-[500px] rounded-2xl overflow-hidden">
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
                                    className="flex items-center justify-center transition-colors hover:bg-white/20 select-none aspect-square"
                                  >
                                    {char}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Crossword Grid */}
                    {el.type === 'crossword' && el.data && (
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1 flex flex-col gap-8">
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
                        </div>
                        <div className="flex-[2] bg-black/40 rounded-3xl border border-white/10 p-6 flex justify-center items-center shadow-inner overflow-x-auto">
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(35px, 1fr))`, gap: '3px', width: 'fit-content' }}>
                            {el.data.grid.map((row, rIdx) => 
                              row.map((cell, cIdx) => (
                                <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-10 md:w-14">
                                  {cell ? (
                                    <div className="w-full h-full relative">
                                      {cell.num && <span className="absolute top-1 left-1.5 text-[9px] font-black text-[#08203e]/70 z-10 pointer-events-none">{cell.num}</span>}
                                      <input 
                                        type="text" maxLength={1} 
                                        value={studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || ''}
                                        onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${rIdx}_${cIdx}`]: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')}))}
                                        style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal' }}
                                        className="w-full h-full text-center uppercase focus:outline-none focus:ring-4 focus:ring-[#fcd34d] transition shadow-inner rounded-md bg-white/90 border border-white/20 text-[#08203e] font-black"
                                      />
                                    </div>
                                  ) : <div className="w-full h-full bg-transparent" />}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* BOTTOM ACTION DOCK */}
        <div className="w-full mt-auto pt-16 flex justify-center items-center gap-8 relative z-50">
          {dockElements.map(el => {
            if (el.type === 'record_compare') return (
              <div key={el.id} className="bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black px-12 py-6 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-all uppercase tracking-widest text-lg hover:scale-105 active:scale-95">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]"></div>
                RECORD AUDIO
              </div>
            );
            if (el.type === 'nav_button') return (
              <button key={el.id} onClick={handleContinueClick} className="bg-[#fcd34d] text-[#08203e] font-black px-16 py-6 rounded-full shadow-[0_0_40px_rgba(252,211,77,0.3)] hover:shadow-[0_0_50px_rgba(252,211,77,0.5)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-xl">
                {el.data?.buttonStyle === 'finish_pill' ? 'FINISH WORKBOOK' : 'CONTINUE ➔'}
              </button>
            );
            return null;
          })}
        </div>

      </div>
    </div>
  );
};

export default StudentPlayer;