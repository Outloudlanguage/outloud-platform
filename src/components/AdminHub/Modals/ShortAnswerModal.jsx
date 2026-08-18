import React, { useState, useEffect, useRef } from 'react';

const ShortAnswerModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [questionHtml, setQuestionHtml] = useState(initialData.questionHtml || '<span style="font-family: Montserrat; font-size: 16px; color: #ffffff;">Type your question here...</span>');
  const [targetAnswer, setTargetAnswer] = useState(initialData.targetAnswer || '');
  const [boxColor, setBoxColor] = useState(initialData.boxColor || 'rgba(255,255,255,0.1)');
  const [lineColor, setLineColor] = useState(initialData.lineColor || 'rgba(255,255,255,0.2)');
  const [textColor, setTextColor] = useState(initialData.textColor || '#ffffff');
  const [borderRadius, setBorderRadius] = useState(initialData.borderRadius || '12');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '16');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [textDropdown, setTextDropdown] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (isOpen && editorRef.current) {
       editorRef.current.innerHTML = questionHtml;
    }
  }, [isOpen, questionHtml]);

  const handleFormat = (command, value = null) => {
    if (command === 'fontSizePx') {
      document.execCommand('fontSize', false, '7');
      const fonts = document.querySelectorAll('font[size="7"]');
      fonts.forEach(f => {
        f.removeAttribute('size');
        f.style.fontSize = `${value}px`;
      });
    } else {
      document.execCommand(command, false, value);
    }
  };

  const handleSave = () => {
     const finalHtml = editorRef.current ? editorRef.current.innerHTML : questionHtml;
     onSave({ questionHtml: finalHtml, targetAnswer, boxColor, lineColor, textColor, borderRadius, fontSize, fontFamily });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-2xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">SHORT ANSWER</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Design the question text and define the hidden target answer for grading.</p>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-3">
             <label className="text-[10px] font-bold uppercase text-white/70 tracking-widest">Question Text</label>
             <div className="flex flex-wrap gap-2 items-center bg-black/20 p-2 rounded-t-2xl border border-white/10 border-b-0">
                <div className="flex border border-white/20 rounded-lg overflow-hidden bg-white/5">
                  <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('bold');}} className="w-8 h-8 font-bold text-white/80 hover:bg-white/10 transition-colors">B</button>
                  <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('italic');}} className="w-8 h-8 italic text-white/80 hover:bg-white/10 border-l border-white/20 transition-colors">I</button>
                  <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('underline');}} className="w-8 h-8 underline text-white/80 hover:bg-white/10 border-l border-white/20 transition-colors">U</button>
                </div>
                <input type="color" onMouseDown={(e)=>e.preventDefault()} onChange={(e) => handleFormat('foreColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20" title="Text Color" />
                <div className="relative">
                  <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')} className="p-1.5 px-3 border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                    Size... <span className="text-[10px]">▼</span>
                  </button>
                  {textDropdown === 'size' && (
                    <div className="absolute top-full left-0 mt-1 w-16 max-h-40 overflow-y-auto bg-[#070b19] border border-white/20 rounded-xl shadow-2xl z-[200] custom-scrollbar">
                      {[12,14,16,18,20,24,28,32,36,42,48].map(sz => (
                        <div key={sz} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontSizePx', sz); setTextDropdown(null); }} className="px-2 py-2 hover:bg-white/10 cursor-pointer text-xs text-white text-center transition-colors">{sz}px</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'font' ? null : 'font')} className="p-1.5 px-3 border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors w-32 justify-between">
                    Font... <span className="text-[10px]">▼</span>
                  </button>
                  {textDropdown === 'font' && (
                    <div className="absolute top-full left-0 mt-1 w-40 max-h-40 overflow-y-auto bg-[#070b19] border border-white/20 rounded-xl shadow-2xl z-[200] custom-scrollbar">
                      {[
                        { name: 'Montserrat', family: 'Montserrat, sans-serif' },
                        { name: 'Tabarra', family: 'Tabarra, sans-serif' },
                        { name: 'Arial', family: 'Arial, sans-serif' },
                        { name: 'Times New Roman', family: '"Times New Roman", serif' },
                        { name: 'Courier New', family: '"Courier New", monospace' }
                      ].map(f => (
                        <div key={f.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontName', f.family); setTextDropdown(null); }} className="px-3 py-2 hover:bg-white/10 cursor-pointer text-xs text-white transition-colors" style={{fontFamily: f.family}}>{f.name}</div>
                      ))}
                    </div>
                  )}
                </div>
             </div>
             <div ref={editorRef} contentEditable suppressContentEditableWarning className="w-full p-4 bg-white/5 border border-white/10 rounded-b-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition overflow-y-auto max-h-32 rich-text-content shadow-inner" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold uppercase text-white/70 tracking-widest">Target Answer (Hidden from Student)</label>
            <input type="text" value={targetAnswer} onChange={(e) => setTargetAnswer(e.target.value)} placeholder="Type the exact expected answer here..." className="w-full p-4 bg-white/5 border border-white/20 rounded-xl font-montserrat text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition shadow-inner placeholder-white/30" />
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col space-y-5 shadow-inner">
             <h3 className="font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Student Input Box Styling</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Text</span>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
                </div>
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Box</span>
                  <div className="flex gap-1 items-center">
                    <input type="color" value={boxColor === 'transparent' ? '#ffffff' : boxColor} onChange={(e) => setBoxColor(e.target.value)} disabled={boxColor === 'transparent'} className={`flex-grow h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${boxColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setBoxColor(boxColor === 'transparent' ? 'rgba(255,255,255,0.1)' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${boxColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Line</span>
                  <div className="flex gap-1 items-center">
                    <input type="color" value={lineColor === 'transparent' ? '#ffffff' : lineColor} onChange={(e) => setLineColor(e.target.value)} disabled={lineColor === 'transparent'} className={`flex-grow h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${lineColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setLineColor(lineColor === 'transparent' ? 'rgba(255,255,255,0.2)' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${lineColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Size</span>
                  <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-2 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                    {['12', '14', '16', '18', '20', '24'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                  </select>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Corners</span>
                  <input type="number" min="0" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} className="w-full p-2 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
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

export default ShortAnswerModal;