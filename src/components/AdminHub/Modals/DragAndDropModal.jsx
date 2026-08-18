import React, { useState, useEffect, useRef } from 'react';
const DragAndDropModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [items, setItems] = useState(initialData.items || [
    { imageUrl: '', targetText: '', studentViewText: '' },
    { imageUrl: '', targetText: '', studentViewText: '' },
    { imageUrl: '', targetText: '', studentViewText: '' }
  ]);
  const [textColor, setTextColor] = useState(initialData.textColor || '#08203e');
  const [boxColor, setBoxColor] = useState(initialData.boxColor || '#ffffff');
  const [lineColor, setLineColor] = useState(initialData.lineColor || '#08203e');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '14');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [borderRadius, setBorderRadius] = useState(initialData.borderRadius || '8');
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
      setTextColor(initialData.textColor || '#08203e'); setBoxColor(initialData.boxColor || '#ffffff'); setLineColor(initialData.lineColor || '#08203e'); setFontSize(initialData.fontSize || '14'); setFontFamily(initialData.fontFamily || 'Montserrat'); setBorderRadius(initialData.borderRadius || '8'); setIsBold(initialData.isBold || true); setIsItalic(initialData.isItalic || false); setIsUnderline(initialData.isUnderline || false);
    }
  }, [initialData, isOpen]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat flex items-center gap-2">DRAG AND DROP</h2>
          <p className="text-gray-600 text-xs mt-1 leading-relaxed">Upload your image URLs, type the target text (the correct answer) in the cell underneath, and type the "Student view" (the draggable option text) in the bottom cell. Leave a column blank if you only need 2 items.</p>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-8">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="text-center font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-2">Item {index + 1}</div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Image URL</label>
                  <input type="text" value={item.imageUrl} onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)} placeholder="https://..." className="w-full p-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-student-yellow" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Target Text (Correct)</label>
                  <input type="text" value={item.targetText} onChange={(e) => handleItemChange(index, 'targetText', e.target.value)} placeholder="e.g. Airport" className="w-full p-2 bg-white border border-gray-300 rounded border-dashed text-xs focus:outline-none focus:ring-2 focus:ring-student-yellow" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Student View (Option)</label>
                  <input type="text" value={item.studentViewText} onChange={(e) => handleItemChange(index, 'studentViewText', e.target.value)} placeholder="e.g. Airport" className="w-full p-2 bg-white border border-gray-300 rounded border-dashed text-xs focus:outline-none focus:ring-2 focus:ring-student-yellow" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-72 shrink-0 bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col gap-4">
            <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-2 mb-2">Pill Styling</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Text</span>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Box</span>
                <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Outline</span>
                <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-300" />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Style</span>
                <div className="flex border border-gray-300 rounded overflow-hidden bg-white h-8">
                  <button type="button" onClick={() => setIsBold(!isBold)} className={`flex-1 font-bold text-sm ${isBold ? 'bg-outloud-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}>B</button>
                  <button type="button" onClick={() => setIsItalic(!isItalic)} className={`flex-1 italic text-sm border-x border-gray-300 ${isItalic ? 'bg-outloud-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}>I</button>
                  <button type="button" onClick={() => setIsUnderline(!isUnderline)} className={`flex-1 underline text-sm ${isUnderline ? 'bg-outloud-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}>U</button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Size</span>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                  {['10', '12', '14', '16', '18', '20', '24'].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Corners</span>
                <input type="number" min="0" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none text-center" />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Font</span>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                  <option value="Montserrat">Montserrat</option>
                  <option value="Tabarra">Tabarra</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300 hover:bg-gray-200 transition">CANCEL</button>
          <button type="button" onClick={() => onSave({ items, textColor, boxColor, lineColor, fontSize, fontFamily, borderRadius, isBold, isItalic, isUnderline })} className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow hover:scale-105 active:scale-95 transition shadow-md">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default DragAndDropModal;