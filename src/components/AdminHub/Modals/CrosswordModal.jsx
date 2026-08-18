import React, { useState, useEffect, useRef } from 'react';
const CrosswordModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [items, setItems] = useState(initialData.items || [
    { id: 1, word: 'JUSTICE', prompt: 'Fairness in the way people are dealt with' },
    { id: 2, word: 'CAR', prompt: 'A four-wheeled road vehicle' },
    { id: 3, word: 'CAMERA', prompt: 'Device for recording visual images' }
  ]);
  const [textColor, setTextColor] = useState(initialData.textColor || '#08203e');
  const [cellColor, setCellColor] = useState(initialData.cellColor || '#ffffff');
  const [lineColor, setLineColor] = useState(initialData.lineColor || '#08203e');
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">CROSSWORD GENERATOR</h2>
          <p className="text-gray-600 text-xs mt-1">Fill in the target words and prompts. The engine will automatically generate an intersecting grid.</p>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-3">
             <div className="flex justify-between items-end mb-2">
               <div className="flex w-full gap-4 px-2">
                 <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-outloud-blue">WORD</span>
                 <span className="flex-[2] text-[10px] font-bold uppercase tracking-widest text-outloud-blue">PROMPT</span>
               </div>
             </div>
             {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-start relative">
                  <input type="text" value={item.word} onChange={(e) => updateItem(index, 'word', e.target.value)} placeholder="WORD" className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded text-xs font-bold uppercase focus:outline-none focus:border-student-yellow" />
                  <input type="text" value={item.prompt} onChange={(e) => updateItem(index, 'prompt', e.target.value)} placeholder="Hint for the student..." className="flex-[2] p-2 bg-gray-50 border border-gray-300 rounded text-xs focus:outline-none focus:border-student-yellow" />
                  {items.length > 2 && (
                    <button onClick={() => removeItem(item.id)} className="w-6 h-8 text-red-400 hover:text-red-600 font-bold">×</button>
                  )}
                </div>
             ))}
             <button onClick={addItem} className="mt-2 w-full py-2 bg-student-yellow text-outloud-blue font-bold text-xs rounded shadow-sm hover:opacity-80 transition">+ ADD ROW</button>
          </div>
          <div className="w-full lg:w-64 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
             <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-2">Cell Styling</h3>
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
          <button type="button" onClick={() => onSave({ items, textColor, cellColor, lineColor, fontSize, fontFamily, isBold })} className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow hover:scale-105 active:scale-95 transition shadow-md">GENERATE</button>
        </div>
      </div>
    </div>
  );
};

export default CrosswordModal;