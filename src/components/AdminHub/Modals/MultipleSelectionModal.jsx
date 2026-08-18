import React, { useState, useEffect, useRef } from 'react';
const MultipleSelectionModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [promptType, setPromptType] = useState(initialData.promptType || 'text');
  const [promptUrl, setPromptUrl] = useState(initialData.promptUrl || '');
  const [promptHtml, setPromptHtml] = useState(initialData.promptHtml || '<span style="font-family: Montserrat; font-size: 18px; font-weight: bold; color: #08203e;">Type your prompt here...</span>');
  const [options, setOptions] = useState(initialData.options || [
    { id: 1, html: 'Option A', isCorrect: false },
    { id: 2, html: 'Option B', isCorrect: false },
    { id: 3, html: 'Option C', isCorrect: true },
    { id: 4, html: 'Option D', isCorrect: false }
  ]);
  const [optBoxColor, setOptBoxColor] = useState(initialData.optBoxColor || '#ffffff');
  const [optLineColor, setOptLineColor] = useState(initialData.optLineColor || '#08203e');
  const [optBorderRadius, setOptBorderRadius] = useState(initialData.optBorderRadius || '12');
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

  const addOption = () => { if (options.length < 6) setOptions([...options, { id: Date.now(), html: `Option ${options.length + 1}`, isCorrect: false }]); };
  const removeOption = (id) => { if (options.length > 2) { setOptions(options.filter(o => o.id !== id)); delete optionsRefs.current[id]; } };
  const toggleCorrect = (id) => { setOptions(options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)); };

  const handleSave = () => {
    const finalPromptHtml = promptType === 'text' && promptRef.current ? promptRef.current.innerHTML : promptHtml;
    const finalOptions = options.map(opt => ({ ...opt, html: optionsRefs.current[opt.id] ? optionsRefs.current[opt.id].innerHTML : opt.html }));
    onSave({ promptType, promptUrl, promptHtml: finalPromptHtml, options: finalOptions, optBoxColor, optLineColor, optBorderRadius });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">MULTIPLE SELECTION</h2>
          <p className="text-gray-600 text-xs mt-1">Create a prompt and up to 6 rich-text answers. Students will lose points for selecting incorrect answers.</p>
        </div>
        <div className="sticky top-0 z-50 flex flex-wrap gap-2 items-center bg-gray-100 p-3 border-b border-gray-300 shadow-sm">
           <span className="text-[10px] font-bold uppercase text-gray-500 mr-2">Universal Text Formatting:</span>
           <div className="flex border border-gray-300 rounded overflow-hidden bg-white">
             <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('bold');}} className="w-8 h-8 font-bold text-gray-700 hover:bg-gray-200">B</button>
             <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('italic');}} className="w-8 h-8 italic text-gray-700 hover:bg-gray-200 border-l border-gray-300">I</button>
             <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('underline');}} className="w-8 h-8 underline text-gray-700 hover:bg-gray-200 border-l border-gray-300">U</button>
           </div>
           <input type="color" onMouseDown={(e)=>e.preventDefault()} onChange={(e) => handleFormat('foreColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-300" title="Text Color" />
           <div className="relative">
             <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')} className="p-1.5 px-2 border border-gray-300 rounded text-xs font-semibold focus:outline-none cursor-pointer flex items-center gap-1 bg-white">Size... <span className="text-[10px]">▼</span></button>
             {textDropdown === 'size' && (
               <div className="absolute top-full left-0 mt-1 w-16 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[200] custom-scrollbar">
                 {[12,14,16,18,20,24,28,32,36,42,48].map(sz => <div key={sz} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontSizePx', sz); setTextDropdown(null); }} className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs">{sz}px</div>)}
               </div>
             )}
           </div>
           <div className="relative">
             <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'font' ? null : 'font')} className="p-1.5 px-2 border border-gray-300 rounded text-xs font-semibold focus:outline-none cursor-pointer flex items-center gap-1 bg-white w-28 justify-between">Font... <span className="text-[10px]">▼</span></button>
             {textDropdown === 'font' && (
               <div className="absolute top-full left-0 mt-1 w-36 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[200] custom-scrollbar">
                 {[{ name: 'Montserrat', family: 'Montserrat, sans-serif' }, { name: 'Tabarra', family: 'Tabarra, sans-serif' }, { name: 'Arial', family: 'Arial, sans-serif' }, { name: 'Times New Roman', family: '"Times New Roman", serif' }, { name: 'Courier New', family: '"Courier New", monospace' }].map(f => <div key={f.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontName', f.family); setTextDropdown(null); }} className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs" style={{fontFamily: f.family}}>{f.name}</div>)}
               </div>
             )}
           </div>
           <span className="text-[10px] text-gray-400 italic ml-2">(Highlight any text below and click tools to format)</span>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3">
             <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-outloud-blue">Prompt Type</span>
                <div className="flex gap-2">
                  <button onClick={() => setPromptType('text')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase ${promptType === 'text' ? 'bg-outloud-blue text-white' : 'bg-gray-200 text-gray-500'}`}>Text</button>
                  <button onClick={() => setPromptType('image')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase ${promptType === 'image' ? 'bg-outloud-blue text-white' : 'bg-gray-200 text-gray-500'}`}>Image URL</button>
                </div>
             </div>
             {promptType === 'image' ? <input type="text" value={promptUrl} onChange={(e) => setPromptUrl(e.target.value)} placeholder="https://..." className="w-full p-3 bg-white border border-gray-300 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow transition" /> : <div ref={promptRef} contentEditable suppressContentEditableWarning className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-student-yellow transition min-h-[80px] rich-text-content" />}
          </div>
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-end">
               <h3 className="text-xs font-bold uppercase tracking-widest text-outloud-blue">Possible Answers</h3>
               <button onClick={addOption} disabled={options.length >= 6} className="text-[10px] font-bold uppercase bg-student-yellow text-outloud-blue px-3 py-1.5 rounded shadow-sm hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition">+ Add Option ({options.length}/6)</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, index) => (
                   <div key={opt.id} className="relative bg-white border-2 border-gray-200 rounded-xl p-3 flex flex-col gap-2 shadow-sm focus-within:border-student-yellow transition">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-gray-400">OPTION {index + 1}</span>
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={opt.isCorrect} onChange={() => toggleCorrect(opt.id)} className="w-4 h-4 text-student-yellow rounded focus:ring-student-yellow cursor-pointer" />
                           <span className={`text-[10px] font-bold uppercase transition-colors ${opt.isCorrect ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>{opt.isCorrect ? 'Correct Answer' : 'Mark Correct'}</span>
                         </label>
                      </div>
                      <div ref={(el) => optionsRefs.current[opt.id] = el} contentEditable suppressContentEditableWarning className="w-full p-2 bg-gray-50 border border-transparent rounded focus:outline-none focus:bg-white focus:border-gray-300 transition min-h-[50px] rich-text-content" />
                      {options.length > 2 && <button onClick={() => removeOption(opt.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full border border-red-200 flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-sm" title="Remove Option">×</button>}
                   </div>
                ))}
             </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-6 items-center">
             <span className="text-xs font-bold uppercase tracking-widest text-outloud-blue whitespace-nowrap">Pill Style:</span>
             <div className="flex gap-4 items-end flex-wrap">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Box</span>
                  <div className="flex gap-1 items-center">
                    <input type="color" value={optBoxColor === 'transparent' ? '#ffffff' : optBoxColor} onChange={(e) => setOptBoxColor(e.target.value)} disabled={optBoxColor === 'transparent'} className={`w-10 h-8 rounded cursor-pointer border border-gray-300 ${optBoxColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setOptBoxColor(optBoxColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-8 h-8 flex items-center justify-center rounded border ${optBoxColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Outline</span>
                  <div className="flex gap-1 items-center">
                    <input type="color" value={optLineColor === 'transparent' ? '#ffffff' : optLineColor} onChange={(e) => setOptLineColor(e.target.value)} disabled={optLineColor === 'transparent'} className={`w-10 h-8 rounded cursor-pointer border border-gray-300 ${optLineColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setOptLineColor(optLineColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-8 h-8 flex items-center justify-center rounded border ${optLineColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Corners (px)</span>
                  <input type="number" min="0" value={optBorderRadius} onChange={(e) => setOptBorderRadius(e.target.value)} className="w-16 h-8 p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none text-center" />
                </div>
             </div>
          </div>
        </div>
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300 hover:bg-gray-200 transition">CANCEL</button>
          <button type="button" onClick={handleSave} className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow hover:scale-105 active:scale-95 transition shadow-md">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default MultipleSelectionModal;