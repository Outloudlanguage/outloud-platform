import React, { useState, useEffect, useRef } from 'react';
const SliderBarModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [options, setOptions] = useState(initialData.options || [
    { id: 1, text: 'Pretty', isCorrect: false },
    { id: 2, text: 'Beautiful', isCorrect: true },
    { id: 3, text: 'Gorgeous', isCorrect: false },
  ]);
  const [orientation, setOrientation] = useState(initialData.orientation || 'horizontal');
  const [barColor, setBarColor] = useState(initialData.barColor || '#cbd5e1'); 
  const [barThickness, setBarThickness] = useState(initialData.barThickness || '12');
  const [handleColor, setHandleColor] = useState(initialData.handleColor || '#eab308');
  const [barText, setBarText] = useState(initialData.barText || '');
  const [barTextColor, setBarTextColor] = useState(initialData.barTextColor || '#08203e');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '16');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [textColor, setTextColor] = useState(initialData.textColor || '#08203e');

  const addOption = () => { if (options.length < 10) setOptions([...options, { id: Date.now(), text: `Option ${options.length + 1}`, isCorrect: false }]); };
  const removeOption = (id) => { if (options.length > 2) setOptions(options.filter(o => o.id !== id)); };
  const updateOptionText = (id, text) => { setOptions(options.map(o => o.id === id ? { ...o, text } : o)); };
  const toggleCorrect = (id) => { setOptions(options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)); };

  const handleSave = () => { onSave({ options, orientation, barColor, barThickness, handleColor, barText, barTextColor, fontSize, fontFamily, textColor }); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">SLIDER BAR</h2>
          <p className="text-gray-600 text-xs mt-1">Create up to 10 nuanced options. Students lose 20% comprehension for resting on an incorrect answer.</p>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-end">
               <h3 className="text-xs font-bold uppercase tracking-widest text-outloud-blue">Nuance Options (Min 2, Max 10)</h3>
               <button onClick={addOption} disabled={options.length >= 10} className="text-[10px] font-bold uppercase bg-student-yellow text-outloud-blue px-3 py-1.5 rounded shadow-sm hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition">+ Add Option ({options.length}/10)</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.map((opt, index) => (
                   <div key={opt.id} className="relative bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2 shadow-sm focus-within:border-student-yellow transition">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-gray-400">POSITION {index + 1}</span>
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={opt.isCorrect} onChange={() => toggleCorrect(opt.id)} className="w-4 h-4 text-student-yellow rounded focus:ring-student-yellow cursor-pointer" />
                           <span className={`text-[10px] font-bold uppercase transition-colors ${opt.isCorrect ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>{opt.isCorrect ? 'Correct Answer' : 'Mark Correct'}</span>
                         </label>
                      </div>
                      <input type="text" value={opt.text} onChange={(e) => updateOptionText(opt.id, e.target.value)} placeholder="Option Text..." className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-student-yellow" />
                      {options.length > 2 && <button onClick={() => removeOption(opt.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full border border-red-200 flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-sm text-xs" title="Remove Option">×</button>}
                   </div>
                ))}
             </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
             <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
               <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-2">Slider Track Styling</h3>
               <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Orientation</span>
                    <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none"><option value="horizontal">Horizontal ↔</option><option value="vertical">Vertical ↕</option></select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Track Color</span>
                    <input type="color" value={barColor} onChange={(e) => setBarColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Handle Color</span>
                    <input type="color" value={handleColor} onChange={(e) => setHandleColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Thickness (px)</span>
                    <input type="number" min="4" max="100" value={barThickness} onChange={(e) => setBarThickness(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none text-center" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Inner Text Color</span>
                    <input type="color" value={barTextColor} onChange={(e) => setBarTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Inner Bar Text (Optional)</span>
                    <input type="text" value={barText} onChange={(e) => setBarText(e.target.value)} placeholder="e.g. Intensity ->" className="w-full p-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-student-yellow" />
                  </div>
               </div>
             </div>
             <div className="w-full lg:w-64 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
               <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-2">Floating Text Styling</h3>
               <div className="grid grid-cols-1 gap-4 items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Text Color</span>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Size</span>
                    <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                      {['12', '14', '16', '18', '20', '24', '28'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Font</span>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                      <option value="Montserrat">Montserrat</option><option value="Tabarra">Tabarra</option><option value="Arial">Arial</option>
                    </select>
                  </div>
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

export default SliderBarModal;