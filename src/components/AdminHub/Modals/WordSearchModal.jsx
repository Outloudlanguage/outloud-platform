import React, { useState, useEffect, useRef } from 'react';
const WordSearchModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [promptHtml, setPromptHtml] = useState(initialData.promptHtml || '<span style="font-family: Montserrat; font-size: 18px; font-weight: bold; color: #08203e;">WORD SEARCH: Find all the words.</span>');
  const [words, setWords] = useState(initialData.words || ['POLICEMAN', 'BARBER', 'CHEF']);
  
  const [textColor, setTextColor] = useState(initialData.textColor || '#08203e');
  const [cellColor, setCellColor] = useState(initialData.cellColor || '#ffffff');
  const [lineColor, setLineColor] = useState(initialData.lineColor || '#08203e');
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">WORD SEARCH GENERATOR</h2>
          <p className="text-gray-600 text-xs mt-1">Design your prompt and add target words. The engine will randomly hide them in a letter grid.</p>
        </div>
        
        {/* Sticky Toolbar */}
        <div className="sticky top-0 z-50 flex flex-wrap gap-2 items-center bg-gray-100 p-3 border-b border-gray-300 shadow-sm">
           <span className="text-[10px] font-bold uppercase text-gray-500 mr-2">Prompt Formatting:</span>
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
                 {[{ name: 'Montserrat', family: 'Montserrat, sans-serif' }, { name: 'Tabarra', family: 'Tabarra, sans-serif' }, { name: 'Arial', family: 'Arial, sans-serif' }].map(f => <div key={f.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontName', f.family); setTextDropdown(null); }} className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs" style={{fontFamily: f.family}}>{f.name}</div>)}
               </div>
             )}
           </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
             <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Prompt Title</label>
                <div ref={promptRef} contentEditable suppressContentEditableWarning className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-student-yellow transition min-h-[60px] rich-text-content" />
             </div>
             
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Target Words</label>
                <div className="grid grid-cols-2 gap-2">
                  {words.map((w, index) => (
                    <div key={index} className="flex gap-1 relative">
                       <input type="text" value={w} onChange={(e) => updateWord(index, e.target.value)} placeholder="WORD" className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-student-yellow" />
                       {words.length > 2 && <button onClick={() => removeWord(index)} className="w-6 flex items-center justify-center text-red-400 hover:text-red-600 font-bold">×</button>}
                    </div>
                  ))}
                </div>
                <button onClick={addWord} className="mt-2 w-full py-2 bg-student-yellow text-outloud-blue font-bold text-xs rounded shadow-sm hover:opacity-80 transition">+ ADD WORD</button>
             </div>
          </div>
          <div className="w-full lg:w-64 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
             <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-2">Grid Styling</h3>
             <div className="grid grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Text</span>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Cell</span>
                  <input type="color" value={cellColor} onChange={(e) => setCellColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Line Color</span>
                  <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Size</span>
                  <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                    {['12', '14', '16', '18', '20', '24'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Style</span>
                  <button type="button" onClick={() => setIsBold(!isBold)} className={`w-full h-8 rounded font-bold text-sm border ${isBold ? 'bg-outloud-blue text-white border-outloud-blue' : 'bg-white text-gray-700 border-gray-300'}`}>B</button>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Font</span>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                    <option value="Montserrat">Montserrat</option><option value="Tabarra">Tabarra</option><option value="Arial">Arial</option>
                  </select>
                </div>
             </div>
          </div>
        </div>
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300 hover:bg-gray-200 transition">CANCEL</button>
          <button type="button" onClick={handleSave} className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow hover:scale-105 active:scale-95 transition shadow-md">GENERATE</button>
        </div>
      </div>
    </div>
  );
};

export default WordSearchModal;