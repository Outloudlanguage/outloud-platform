import React, { useState, useEffect } from 'react';

const DragAndDropModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [items, setItems] = useState(initialData.items || [
    { imageUrl: '', targetText: '', studentViewText: '' },
    { imageUrl: '', targetText: '', studentViewText: '' },
    { imageUrl: '', targetText: '', studentViewText: '' }
  ]);
  const [textColor, setTextColor] = useState(initialData.textColor || '#ffffff');
  const [boxColor, setBoxColor] = useState(initialData.boxColor || 'rgba(255,255,255,0.1)');
  const [lineColor, setLineColor] = useState(initialData.lineColor || 'rgba(255,255,255,0.2)');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '14');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [borderRadius, setBorderRadius] = useState(initialData.borderRadius || '12');
  const [isBold, setIsBold] = useState(initialData.isBold || true);
  const [isItalic, setIsItalic] = useState(initialData.isItalic || false);
  const [isUnderline, setIsUnderline] = useState(initialData.isUnderline || false);

  useEffect(() => {
    if (initialData && isOpen) {
      setItems(initialData.items || [
        { imageUrl: '', targetText: '', studentViewText: '' },
        { imageUrl: '', targetText: '', studentViewText: '' },
        { imageUrl: '', targetText: '', studentViewText: '' }
      ]);
      setTextColor(initialData.textColor || '#ffffff'); setBoxColor(initialData.boxColor || 'rgba(255,255,255,0.1)'); setLineColor(initialData.lineColor || 'rgba(255,255,255,0.2)'); setFontSize(initialData.fontSize || '14'); setFontFamily(initialData.fontFamily || 'Montserrat'); setBorderRadius(initialData.borderRadius || '12'); setIsBold(initialData.isBold || true); setIsItalic(initialData.isItalic || false); setIsUnderline(initialData.isUnderline || false);
    }
  }, [initialData, isOpen]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-5xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">DRAG AND DROP</h2>
          <p className="text-white/70 text-xs mt-2 font-medium leading-relaxed">Upload your image URLs, type the target text (the correct answer) in the cell underneath, and type the "Student view" (the draggable option text) in the bottom cell.</p>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-8">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner">
                <div className="text-center font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Item {index + 1}</div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Image URL</label>
                  <input type="text" value={item.imageUrl} onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)} placeholder="https://..." className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] placeholder-white/30" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Target Text (Correct)</label>
                  <input type="text" value={item.targetText} onChange={(e) => handleItemChange(index, 'targetText', e.target.value)} placeholder="e.g. Airport" className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl border-dashed text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] placeholder-white/30" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Student View (Option)</label>
                  <input type="text" value={item.studentViewText} onChange={(e) => handleItemChange(index, 'studentViewText', e.target.value)} placeholder="e.g. Airport" className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl border-dashed text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] placeholder-white/30" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-full lg:w-72 shrink-0 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-inner">
            <h3 className="font-bold text-[#fcd34d] text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Pill Styling</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Text</span>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Box</span>
                <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Outline</span>
                <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Style</span>
                <div className="flex border border-white/20 rounded-lg overflow-hidden bg-black/20 h-10">
                  <button type="button" onClick={() => setIsBold(!isBold)} className={`flex-1 font-bold text-sm transition-colors ${isBold ? 'bg-[#fcd34d] text-[#08203e]' : 'text-white/70 hover:bg-white/10'}`}>B</button>
                  <button type="button" onClick={() => setIsItalic(!isItalic)} className={`flex-1 italic text-sm border-x border-white/20 transition-colors ${isItalic ? 'bg-[#fcd34d] text-[#08203e]' : 'text-white/70 hover:bg-white/10'}`}>I</button>
                  <button type="button" onClick={() => setIsUnderline(!isUnderline)} className={`flex-1 underline text-sm transition-colors ${isUnderline ? 'bg-[#fcd34d] text-[#08203e]' : 'text-white/70 hover:bg-white/10'}`}>U</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Size</span>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-2 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                  {['10', '12', '14', '16', '18', '20', '24'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Corners</span>
                <input type="number" min="0" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} className="w-full p-2 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Font</span>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-2 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
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
          <button type="button" onClick={() => onSave({ items, textColor, boxColor, lineColor, fontSize, fontFamily, borderRadius, isBold, isItalic, isUnderline })} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default DragAndDropModal;