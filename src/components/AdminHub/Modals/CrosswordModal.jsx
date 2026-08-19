import React, { useState, useEffect } from 'react';

const CrosswordModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [items, setItems] = useState(initialData.items || [
    { id: 1, word: 'JUSTICE', prompt: 'Fairness in the way people are dealt with' },
    { id: 2, word: 'CAR', prompt: 'A four-wheeled road vehicle' },
    { id: 3, word: 'CAMERA', prompt: 'Device for recording visual images' }
  ]);
  const [textColor, setTextColor] = useState(initialData.textColor || '#ffffff');
  const [cellColor, setCellColor] = useState(initialData.cellColor || 'rgba(255,255,255,0.1)');
  const [lineColor, setLineColor] = useState(initialData.lineColor || 'rgba(255,255,255,0.2)');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '16');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [isBold, setIsBold] = useState(initialData.isBold || true);

  const addItem = () => setItems([...items, { id: Date.now(), word: '', prompt: '' }]);
  const removeItem = (id) => { if(items.length > 2) setItems(items.filter(i => i.id !== id)); };
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'word' ? value.toUpperCase().replace(/[^A-Z]/g, '') : value;
    setItems(newItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-4xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">CROSSWORD GENERATOR</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Fill in the target words and prompts. The engine will automatically generate an intersecting grid.</p>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-4">
             <div className="flex justify-between items-end mb-2">
               <div className="flex w-full gap-4 px-2">
                 <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[#fcd34d] drop-shadow-md">WORD</span>
                 <span className="flex-[2] text-[10px] font-bold uppercase tracking-widest text-[#fcd34d] drop-shadow-md">PROMPT</span>
               </div>
             </div>
             {items.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-start relative group">
                  <input type="text" value={item.word} onChange={(e) => updateItem(index, 'word', e.target.value)} placeholder="WORD" className="flex-1 p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs font-bold uppercase text-white focus:outline-none focus:ring-1 focus:ring-[#fcd34d] placeholder-white/30 shadow-inner" />
                  <input type="text" value={item.prompt} onChange={(e) => updateItem(index, 'prompt', e.target.value)} placeholder="Hint for the student..." className="flex-[2] p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#fcd34d] placeholder-white/30 shadow-inner" />
                  {items.length > 2 && (
                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 mt-1.5 shrink-0 bg-red-500/20 text-red-400 rounded-full border border-red-500/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg text-sm" title="Remove Word">✕</button>
                  )}
                </div>
             ))}
             <button onClick={addItem} className="mt-4 w-full py-3 bg-white/10 text-white font-black text-[10px] uppercase tracking-widest border border-white/20 rounded-full shadow-md hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all">+ ADD ROW</button>
          </div>
          
          <div className="w-full lg:w-72 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-inner">
             <h3 className="font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Cell Styling</h3>
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
          <button type="button" onClick={() => onSave({ items, textColor, cellColor, lineColor, fontSize, fontFamily, isBold })} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">GENERATE</button>
        </div>
      </div>
    </div>
  );
};

export default CrosswordModal;