import React, { useState, useEffect, useRef } from 'react';

const MultipleSelectionModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [promptType, setPromptType] = useState(initialData.promptType || 'text');
  const [promptUrl, setPromptUrl] = useState(initialData.promptUrl || '');
  const [promptHtml, setPromptHtml] = useState(initialData.promptHtml || '<span style="font-family: Montserrat; font-size: 18px; font-weight: bold; color: #ffffff;">Type your prompt here...</span>');
  const [options, setOptions] = useState(initialData.options || [
    { id: 1, html: '<span style="color: #ffffff;">Option A</span>', isCorrect: false },
    { id: 2, html: '<span style="color: #ffffff;">Option B</span>', isCorrect: false },
    { id: 3, html: '<span style="color: #ffffff;">Option C</span>', isCorrect: true },
    { id: 4, html: '<span style="color: #ffffff;">Option D</span>', isCorrect: false }
  ]);
  const [optBoxColor, setOptBoxColor] = useState(initialData.optBoxColor || 'rgba(255,255,255,0.1)');
  const [optLineColor, setOptLineColor] = useState(initialData.optLineColor || 'rgba(255,255,255,0.2)');
  const [optBorderRadius, setOptBorderRadius] = useState(initialData.optBorderRadius || '16');
  const [textDropdown, setTextDropdown] = useState(null);
  const promptRef = useRef(null);
  const optionsRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      if (promptType === 'text' && promptRef.current) promptRef.current.innerHTML = promptHtml;
      options.forEach(opt => { if (optionsRefs.current[opt.id]) optionsRefs.current[opt.id].innerHTML = opt.html; });
    }
  }, [isOpen, promptType, options.length]); 

  const handleFormat = (command, value = null) => {
    if (command === 'fontSizePx') {
      document.execCommand('fontSize', false, '7');
      const fonts = document.querySelectorAll('font[size="7"]');
      fonts.forEach(f => { f.removeAttribute('size'); f.style.fontSize = `${value}px`; });
    } else {
      document.execCommand(command, false, value);
    }
  };

  const addOption = () => { if (options.length < 6) setOptions([...options, { id: Date.now(), html: `<span style="color: #ffffff;">Option ${options.length + 1}</span>`, isCorrect: false }]); };
  const removeOption = (id) => { if (options.length > 2) { setOptions(options.filter(o => o.id !== id)); delete optionsRefs.current[id]; } };
  const toggleCorrect = (id) => { setOptions(options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)); };

  const handleSave = () => {
    const finalPromptHtml = promptType === 'text' && promptRef.current ? promptRef.current.innerHTML : promptHtml;
    const finalOptions = options.map(opt => ({ ...opt, html: optionsRefs.current[opt.id] ? optionsRefs.current[opt.id].innerHTML : opt.html }));
    onSave({ promptType, promptUrl, promptHtml: finalPromptHtml, options: finalOptions, optBoxColor, optLineColor, optBorderRadius });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-4xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">MULTIPLE SELECTION</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Create a prompt and up to 6 rich-text answers. Students will lose points for selecting incorrect answers.</p>
        </div>

        {/* Sticky Toolbar */}
        <div className="sticky top-0 z-50 flex flex-wrap gap-3 items-center bg-black/40 p-4 border-b border-white/10 shadow-md backdrop-blur-md">
           <span className="text-[10px] font-bold uppercase text-[#fcd34d] tracking-widest mr-2 drop-shadow-md">Text Formatting:</span>
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
                 {[{ name: 'Montserrat', family: 'Montserrat, sans-serif' }, { name: 'Tabarra', family: 'Tabarra, sans-serif' }, { name: 'Arial', family: 'Arial, sans-serif' }, { name: 'Times New Roman', family: '"Times New Roman", serif' }, { name: 'Courier New', family: '"Courier New", monospace' }].map(f => <div key={f.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontName', f.family); setTextDropdown(null); }} className="px-3 py-2 hover:bg-white/10 cursor-pointer text-xs text-white transition-colors" style={{fontFamily: f.family}}>{f.name}</div>)}
               </div>
             )}
           </div>
           <span className="text-[9px] text-white/50 italic ml-2 hidden md:inline">(Highlight any text below and click tools to format)</span>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-inner">
             <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcd34d] drop-shadow-md">Prompt Type</span>
                <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-white/10">
                  <button onClick={() => setPromptType('text')} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${promptType === 'text' ? 'bg-[#fcd34d] text-[#08203e]' : 'bg-transparent text-white/50 hover:text-white'}`}>Text</button>
                  <button onClick={() => setPromptType('image')} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${promptType === 'image' ? 'bg-[#fcd34d] text-[#08203e]' : 'bg-transparent text-white/50 hover:text-white'}`}>Image URL</button>
                </div>
             </div>
             {promptType === 'image' ? <input type="text" value={promptUrl} onChange={(e) => setPromptUrl(e.target.value)} placeholder="https://..." className="w-full p-4 bg-[#070b19] border border-white/20 rounded-xl font-montserrat text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition shadow-inner placeholder-white/30" /> : <div ref={promptRef} contentEditable suppressContentEditableWarning className="w-full p-5 bg-[#070b19] border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition min-h-[100px] rich-text-content text-white shadow-inner" />}
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-end mb-2">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#fcd34d] drop-shadow-md">Possible Answers</h3>
               <button onClick={addOption} disabled={options.length >= 6} className="text-[9px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/20 px-4 py-2 rounded-full shadow-md hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all">+ Add Option ({options.length}/6)</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {options.map((opt, index) => (
                   <div key={opt.id} className={`relative bg-white/5 border-2 rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-colors ${opt.isCorrect ? 'border-green-400/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'border-white/10 focus-within:border-[#fcd34d]/50'}`}>
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                         <span className="text-[10px] font-bold text-[#fcd34d] uppercase tracking-widest">OPTION {index + 1}</span>
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={opt.isCorrect} onChange={() => toggleCorrect(opt.id)} className="w-4 h-4 text-green-400 bg-transparent border-white/30 rounded focus:ring-green-400 focus:ring-offset-0 cursor-pointer" />
                           <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${opt.isCorrect ? 'text-green-400 drop-shadow-md' : 'text-white/40 group-hover:text-white/80'}`}>{opt.isCorrect ? 'Correct Answer' : 'Mark Correct'}</span>
                         </label>
                      </div>
                      <div ref={(el) => optionsRefs.current[opt.id] = el} contentEditable suppressContentEditableWarning className="w-full p-3 bg-[#070b19] border border-transparent rounded-lg focus:outline-none focus:border-[#fcd34d]/50 transition min-h-[60px] rich-text-content text-white shadow-inner" />
                      {options.length > 2 && <button onClick={() => removeOption(opt.id)} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500/20 text-red-400 rounded-full border border-red-500/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg" title="Remove Option">✕</button>}
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6 items-center shadow-inner">
             <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcd34d] drop-shadow-md whitespace-nowrap">Pill Style:</span>
             <div className="flex gap-5 items-end flex-wrap w-full">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest">Box</span>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={optBoxColor === 'transparent' ? '#ffffff' : optBoxColor} onChange={(e) => setOptBoxColor(e.target.value)} disabled={optBoxColor === 'transparent'} className={`w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${optBoxColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setOptBoxColor(optBoxColor === 'transparent' ? 'rgba(255,255,255,0.1)' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${optBoxColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest">Outline</span>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={optLineColor === 'transparent' ? '#ffffff' : optLineColor} onChange={(e) => setOptLineColor(e.target.value)} disabled={optLineColor === 'transparent'} className={`w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${optLineColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setOptLineColor(optLineColor === 'transparent' ? 'rgba(255,255,255,0.2)' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${optLineColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest">Corners (px)</span>
                  <input type="number" min="0" value={optBorderRadius} onChange={(e) => setOptBorderRadius(e.target.value)} className="w-20 h-10 p-2 bg-[#070b19] border border-white/20 rounded-lg text-sm font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
                </div>
             </div>
          </div>
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCEL</button>
          <button type="button" onClick={handleSave} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default MultipleSelectionModal;