import React, { useState, useEffect, useRef } from 'react';
const ShortAnswerModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [questionHtml, setQuestionHtml] = useState(initialData.questionHtml || '<span style="font-family: Montserrat; font-size: 16px; color: #08203e;">Type your question here...</span>');
  const [targetAnswer, setTargetAnswer] = useState(initialData.targetAnswer || '');
  const [boxColor, setBoxColor] = useState(initialData.boxColor || 'transparent');
  const [lineColor, setLineColor] = useState(initialData.lineColor || '#08203e');
  const [textColor, setTextColor] = useState(initialData.textColor || '#08203e');
  const [borderRadius, setBorderRadius] = useState(initialData.borderRadius || '8');
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">SHORT ANSWER</h2>
          <p className="text-gray-600 text-xs mt-1">Design the question text and define the hidden target answer for grading.</p>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-2">
             <label className="text-[10px] font-bold uppercase text-gray-500">Question Text</label>
             <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2 rounded-t-xl border border-gray-300 border-b-0">
                <div className="flex border border-gray-300 rounded overflow-hidden bg-white">
                  <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('bold');}} className="w-8 h-8 font-bold text-gray-700 hover:bg-gray-100">B</button>
                  <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('italic');}} className="w-8 h-8 italic text-gray-700 hover:bg-gray-100 border-l border-gray-300">I</button>
                  <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('underline');}} className="w-8 h-8 underline text-gray-700 hover:bg-gray-100 border-l border-gray-300">U</button>
                </div>
                <input type="color" onMouseDown={(e)=>e.preventDefault()} onChange={(e) => handleFormat('foreColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-300" title="Text Color" />
                <div className="relative">
                  <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')} className="p-1.5 px-2 border border-gray-300 rounded text-xs font-semibold focus:outline-none cursor-pointer flex items-center gap-1 bg-white">
                    Size... <span className="text-[10px]">▼</span>
                  </button>
                  {textDropdown === 'size' && (
                    <div className="absolute top-full left-0 mt-1 w-16 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[200] custom-scrollbar">
                      {[12,14,16,18,20,24,28,32,36,42,48].map(sz => (
                        <div key={sz} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontSizePx', sz); setTextDropdown(null); }} className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs">{sz}px</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'font' ? null : 'font')} className="p-1.5 px-2 border border-gray-300 rounded text-xs font-semibold focus:outline-none cursor-pointer flex items-center gap-1 bg-white w-28 justify-between">
                    Font... <span className="text-[10px]">▼</span>
                  </button>
                  {textDropdown === 'font' && (
                    <div className="absolute top-full left-0 mt-1 w-36 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[200] custom-scrollbar">
                      {[
                        { name: 'Montserrat', family: 'Montserrat, sans-serif' },
                        { name: 'Tabarra', family: 'Tabarra, sans-serif' },
                        { name: 'Arial', family: 'Arial, sans-serif' },
                        { name: 'Times New Roman', family: '"Times New Roman", serif' },
                        { name: 'Courier New', family: '"Courier New", monospace' }
                      ].map(f => (
                        <div key={f.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontName', f.family); setTextDropdown(null); }} className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs" style={{fontFamily: f.family}}>{f.name}</div>
                      ))}
                    </div>
                  )}
                </div>
             </div>
             <div ref={editorRef} contentEditable suppressContentEditableWarning className="w-full p-3 bg-white border border-gray-300 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-student-yellow transition overflow-y-auto max-h-32 rich-text-content" />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-500">Target Answer (Hidden from Student)</label>
            <input type="text" value={targetAnswer} onChange={(e) => setTargetAnswer(e.target.value)} placeholder="Type the exact expected answer here..." className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow transition" />
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col space-y-4">
             <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-2">Student Input Box Styling</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Text</span>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Box</span>
                  <div className="flex gap-1 items-center">
                    <input type="color" value={boxColor === 'transparent' ? '#ffffff' : boxColor} onChange={(e) => setBoxColor(e.target.value)} disabled={boxColor === 'transparent'} className={`flex-grow h-8 rounded cursor-pointer border border-gray-300 ${boxColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setBoxColor(boxColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-8 h-8 flex items-center justify-center rounded border ${boxColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Line</span>
                  <div className="flex gap-1 items-center">
                    <input type="color" value={lineColor === 'transparent' ? '#ffffff' : lineColor} onChange={(e) => setLineColor(e.target.value)} disabled={lineColor === 'transparent'} className={`flex-grow h-8 rounded cursor-pointer border border-gray-300 ${lineColor === 'transparent' ? 'opacity-40' : ''}`} />
                    <button type="button" onClick={() => setLineColor(lineColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-8 h-8 flex items-center justify-center rounded border ${lineColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'}`} title="Toggle Transparent">🚫</button>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Size</span>
                  <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                    {['12', '14', '16', '18', '20', '24'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Corners</span>
                  <input type="number" min="0" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none text-center" />
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

export default ShortAnswerModal;