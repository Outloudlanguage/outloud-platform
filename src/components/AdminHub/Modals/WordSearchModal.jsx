import React, { useState, useEffect, useRef } from 'react';

const WordSearchModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [promptHtml, setPromptHtml] = useState(initialData.promptHtml || '<span style="font-family: Montserrat; font-size: 18px; font-weight: bold; color: #ffffff;">WORD SEARCH: Find all the words.</span>');
  const [words, setWords] = useState(initialData.words || ['POLICEMAN', 'BARBER', 'CHEF']);
  
  const [textColor, setTextColor] = useState(initialData.textColor || '#ffffff');
  const [cellColor, setCellColor] = useState(initialData.cellColor || 'rgba(255,255,255,0.1)');
  const [lineColor, setLineColor] = useState(initialData.lineColor || 'rgba(255,255,255,0.2)');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '16');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [isBold, setIsBold] = useState(initialData.isBold || true);

  const [textDropdown, setTextDropdown] = useState(null);
  const promptRef = useRef(null);

  useEffect(() => {
    if (isOpen && promptRef.current) {
      promptRef.current.innerHTML = promptHtml;
    }
  }, [isOpen]);

  const handleFormat = (command, value = null) => {
    if (command === 'fontSizePx') {
      document.execCommand('fontSize', false, '7');
      const fonts = document.querySelectorAll('font[size="7"]');
      fonts.forEach(f => { f.removeAttribute('size'); f.style.fontSize = `${value}px`; });
    } else {
      document.execCommand(command, false, value);
    }
  };

  const addWord = () => setWords([...words, '']);
  const removeWord = (index) => { if(words.length > 2) setWords(words.filter((_, i) => i !== index)); };
  const updateWord = (index, val) => {
    const newWords = [...words];
    newWords[index] = val.toUpperCase().replace(/[^A-Z]/g, '');
    setWords(newWords);
  };

  const handleSave = () => {
    const finalPrompt = promptRef.current ? promptRef.current.innerHTML : promptHtml;
    const cleanWords = words.filter(w => w.trim() !== '');
    if (cleanWords.length < 2) return alert('Please enter at least 2 words.');
    onSave({ promptHtml: finalPrompt, words: cleanWords, textColor, cellColor, lineColor, fontSize, fontFamily, isBold });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-4xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">WORD SEARCH GENERATOR</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Design your prompt and add target words. The engine will randomly hide them in a letter grid.</p>
        </div>
        
        {/* Sticky Toolbar */}
        <div className="sticky top-0 z-50 flex flex-wrap gap-3 items-center bg-black/40 p-4 border-b border-white/10 shadow-md backdrop-blur-md">
           <span className="text-[10px] font-bold uppercase text-[#fcd34d] tracking-widest mr-2 drop-shadow-md">Prompt Formatting:</span>
           <div className="flex border border-white/20 rounded-lg overflow-hidden bg-white/5">
             <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('bold');}} className="w-8 h-8 font-bold text-white/80 hover:bg-white/10 transition-colors">B</button>
             <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('italic');}} className="w-8 h-8 italic text-white/80 hover:bg-white/10 border-l border-white/20 transition-colors">I</button>
             <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('underline');}} className="w-8 h-8 underline text-white/80 hover:bg-white/10 border-l border-white/20 transition-colors">U</button>
           </div>
           <input type="color" onMouseDown={(e)=>e.preventDefault()} onChange={(e) => handleFormat('foreColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20" title="Text Color" />
           <div className="relative">
             <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')} className="p-1.5 px-3 border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">Size... <span className="text-[10px]">▼</span></button>
             {textDropdown === 'size' && (
               <div className="absolute top-full left-0 mt-1 w-16 max-h-40 overflow-y-auto bg-[#070b19] border border-white/20 rounded-xl shadow-2xl z-[200] custom-scrollbar">
                 {[12,14,16,18,20,24,28,32,36,42,48].map(sz => <div key={sz} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontSizePx', sz); setTextDropdown(null); }} className="px-2 py-2 hover:bg-white/10 cursor-pointer text-xs text-white text-center transition-colors">{sz}px</div>)}
               </div>
             )}
           </div>
           <div className="relative">
             <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'font' ? null : 'font')} className="p-1.5 px-3 border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors w-32 justify-between">Font... <span className="text-[10px]">▼</span></button>
             {textDropdown === 'font' && (
               <div className="absolute top-full left-0 mt-1 w-40 max-h-40 overflow-y-auto bg-[#070b19] border border-white/20 rounded-xl shadow-2xl z-[200] custom-scrollbar">
                 {[{ name: 'Montserrat', family: 'Montserrat, sans-serif' }, { name: 'Tabarra', family: 'Tabarra, sans-serif' }, { name: 'Arial', family: 'Arial, sans-serif' }].map(f => <div key={f.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontName', f.family); setTextDropdown(null); }} className="px-3 py-2 hover:bg-white/10 cursor-pointer text-xs text-white transition-colors" style={{fontFamily: f.family}}>{f.name}</div>)}
               </div>
             )}
           </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-white/70 tracking-widest">Prompt Title</label>
                <div ref={promptRef} contentEditable suppressContentEditableWarning className="w-full p-4 bg-[#070b19] border border-white/20 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#fcd34d] transition min-h-[60px] rich-text-content shadow-inner" />
             </div>
             
             <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase text-white/70 tracking-widest">Target Words</label>
                <div className="grid grid-cols-2 gap-3">
                  {words.map((w, index) => (
                    <div key={index} className="flex gap-2 relative">
                       <input type="text" value={w} onChange={(e) => updateWord(index, e.target.value)} placeholder="WORD" className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-[#fcd34d] shadow-inner" />
                       {words.length > 2 && <button onClick={() => removeWord(index)} className="w-10 h-full flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl hover:bg-red-500 hover:text-white font-bold transition-colors">✕</button>}
                    </div>
                  ))}
                </div>
                <button onClick={addWord} className="mt-4 w-full py-3 bg-white/10 text-white font-black text-[10px] uppercase tracking-widest border border-white/20 rounded-full shadow-md hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all">+ ADD WORD</button>
             </div>
          </div>
          
          <div className="w-full lg:w-72 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-inner">
             <h3 className="font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Grid Styling</h3>
             <div className="grid grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Text</span>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Cell</span>
                  <div className="flex gap-1 items-center">
                     <input type="color" value={cellColor === 'transparent' ? '#ffffff' : cellColor} onChange={(e) => setCellColor(e.target.value)} disabled={cellColor === 'transparent'} className={`flex-grow h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${cellColor === 'transparent' ? 'opacity-40' : ''}`} />
                     <button type="button" onClick={() => setCellColor(cellColor === 'transparent' ? 'rgba(255,255,255,0.1)' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${cellColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Line Color</span>
                  <div className="flex gap-1 items-center">
                     <input type="color" value={lineColor === 'transparent' ? '#ffffff' : lineColor} onChange={(e) => setLineColor(e.target.value)} disabled={lineColor === 'transparent'} className={`flex-grow h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${lineColor === 'transparent' ? 'opacity-40' : ''}`} />
                     <button type="button" onClick={() => setLineColor(lineColor === 'transparent' ? 'rgba(255,255,255,0.2)' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${lineColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Size</span>
                  <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-2.5 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                    {['12', '14', '16', '18', '20', '24'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Style</span>
                  <button type="button" onClick={() => setIsBold(!isBold)} className={`w-full h-10 rounded-lg font-bold text-sm border transition-colors ${isBold ? 'bg-[#fcd34d] text-[#08203e] border-[#fcd34d]' : 'bg-black/20 text-white/70 border-white/20'}`}>B</button>
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Font</span>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-2.5 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                    <option value="Montserrat">Montserrat</option>
                    <option value="Tabarra">Tabarra</option>
                    <option value="Arial">Arial</option>
                  </select>
                </div>
             </div>
          </div>
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCEL</button>
          <button type="button" onClick={handleSave} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">GENERATE</button>
        </div>
      </div>
    </div>
  );
};

export default WordSearchModal;