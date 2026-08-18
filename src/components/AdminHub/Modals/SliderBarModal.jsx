import React, { useState } from 'react';

const SliderBarModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [options, setOptions] = useState(initialData.options || [
    { id: 1, text: 'Pretty', isCorrect: false },
    { id: 2, text: 'Beautiful', isCorrect: true },
    { id: 3, text: 'Gorgeous', isCorrect: false },
  ]);
  const [orientation, setOrientation] = useState(initialData.orientation || 'horizontal');
  const [barColor, setBarColor] = useState(initialData.barColor || 'rgba(255,255,255,0.2)'); 
  const [barThickness, setBarThickness] = useState(initialData.barThickness || '16');
  const [handleColor, setHandleColor] = useState(initialData.handleColor || '#fcd34d');
  const [barText, setBarText] = useState(initialData.barText || '');
  const [barTextColor, setBarTextColor] = useState(initialData.barTextColor || '#ffffff');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '16');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [textColor, setTextColor] = useState(initialData.textColor || '#ffffff');

  const addOption = () => { if (options.length < 10) setOptions([...options, { id: Date.now(), text: `Option ${options.length + 1}`, isCorrect: false }]); };
  const removeOption = (id) => { if (options.length > 2) setOptions(options.filter(o => o.id !== id)); };
  const updateOptionText = (id, text) => { setOptions(options.map(o => o.id === id ? { ...o, text } : o)); };
  const toggleCorrect = (id) => { setOptions(options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)); };

  const handleSave = () => { onSave({ options, orientation, barColor, barThickness, handleColor, barText, barTextColor, fontSize, fontFamily, textColor }); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-3xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">SLIDER BAR</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Create up to 10 nuanced options. Students lose 20% comprehension for resting on an incorrect answer.</p>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          
          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-3">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#fcd34d] drop-shadow-md">Nuance Options (Min 2, Max 10)</h3>
               <button onClick={addOption} disabled={options.length >= 10} className="text-[9px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/20 px-4 py-2 rounded-full shadow-md hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all">+ Add Option ({options.length}/10)</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, index) => (
                   <div key={opt.id} className={`relative bg-white/5 border rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-colors ${opt.isCorrect ? 'border-green-400/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'border-white/10 focus-within:border-[#fcd34d]/50'}`}>
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                         <span className="text-[10px] font-bold text-[#fcd34d] uppercase tracking-widest drop-shadow-md">POSITION {index + 1}</span>
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={opt.isCorrect} onChange={() => toggleCorrect(opt.id)} className="w-4 h-4 text-green-400 bg-transparent border-white/30 rounded focus:ring-green-400 focus:ring-offset-0 cursor-pointer" />
                           <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${opt.isCorrect ? 'text-green-400 drop-shadow-md' : 'text-white/40 group-hover:text-white/80'}`}>{opt.isCorrect ? 'Correct Answer' : 'Mark Correct'}</span>
                         </label>
                      </div>
                      <input type="text" value={opt.text} onChange={(e) => updateOptionText(opt.id, e.target.value)} placeholder="Option Text..." className="w-full p-3 bg-[#070b19] border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#fcd34d] placeholder-white/30 shadow-inner" />
                      {options.length > 2 && <button onClick={() => removeOption(opt.id)} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500/20 text-red-400 rounded-full border border-red-500/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg text-xs" title="Remove Option">✕</button>}
                   </div>
                ))}
             </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
             <div className="flex-[1.5] bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-inner">
               <h3 className="font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Slider Track Styling</h3>
               <div className="grid grid-cols-2 gap-5 items-end">
                  <div className="flex flex-col gap-2 col-span-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest">Orientation</span>
                    <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                      <option value="horizontal">Horizontal ↔</option>
                      <option value="vertical">Vertical ↕</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Track Color</span>
                    <input type="color" value={barColor === 'rgba(255,255,255,0.2)' ? '#ffffff' : barColor} onChange={(e) => setBarColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Handle Color</span>
                    <input type="color" value={handleColor} onChange={(e) => setHandleColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Thickness (px)</span>
                    <input type="number" min="4" max="100" value={barThickness} onChange={(e) => setBarThickness(e.target.value)} className="w-full p-2.5 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Inner Text Color</span>
                    <input type="color" value={barTextColor} onChange={(e) => setBarTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest">Inner Bar Text (Optional)</span>
                    <input type="text" value={barText} onChange={(e) => setBarText(e.target.value)} placeholder="e.g. Intensity ->" className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#fcd34d] placeholder-white/30" />
                  </div>
               </div>
             </div>
             
             <div className="flex-1 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-inner">
               <h3 className="font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Floating Text Styling</h3>
               <div className="grid grid-cols-1 gap-5 items-end">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Text Color</span>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Size</span>
                    <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-2.5 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                      {['12', '14', '16', '18', '20', '24', '28'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
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
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCEL</button>
          <button type="button" onClick={handleSave} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default SliderBarModal;