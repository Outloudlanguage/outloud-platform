import React, { useState, useEffect } from 'react';

const EMPTY_ITEMS = () => [
  { imageUrl: '', targetText: '', studentViewText: '' },
  { imageUrl: '', targetText: '', studentViewText: '' },
  { imageUrl: '', targetText: '', studentViewText: '' },
  { imageUrl: '', targetText: '', studentViewText: '' },
];

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const DragAndDropModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [items, setItems] = useState(initialData.items || EMPTY_ITEMS());
  const [textColor, setTextColor] = useState(initialData.textColor || '#1e2246');
  const [boxColor, setBoxColor] = useState(initialData.boxColor || '#ffffff');
  const [lineColor, setLineColor] = useState(initialData.lineColor || '#1e2246');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '14');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [borderRadius, setBorderRadius] = useState(initialData.borderRadius || '12');
  const [isBold, setIsBold] = useState(initialData.isBold !== undefined ? initialData.isBold : true);
  const [isItalic, setIsItalic] = useState(initialData.isItalic || false);
  const [isUnderline, setIsUnderline] = useState(initialData.isUnderline || false);

  useEffect(() => {
    if (isOpen) {
      setItems(initialData?.items?.length ? initialData.items.map((i) => ({ ...i })) : EMPTY_ITEMS());
      setTextColor(initialData?.textColor || '#1e2246');
      setBoxColor(initialData?.boxColor || '#ffffff');
      setLineColor(initialData?.lineColor || '#1e2246');
      setFontSize(initialData?.fontSize || '14');
      setFontFamily(initialData?.fontFamily || 'Montserrat');
      setBorderRadius(initialData?.borderRadius || '12');
      setIsBold(initialData?.isBold !== undefined ? initialData.isBold : true);
      setIsItalic(initialData?.isItalic || false);
      setIsUnderline(initialData?.isUnderline || false);
    }
  }, [initialData, isOpen]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-7xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Matching
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Drag and Drop
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium leading-relaxed">
              Add your image URLs, type the Target Text (correct answer), and type the Student View (draggable pill text).
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-7">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-3.5 bg-[#f4f6fc] p-4 rounded-2xl border border-white shadow-inner"
              >
                <div className="flex items-center justify-between border-b border-[#626a9f]/15 pb-2">
                  <span className="font-extrabold text-[#454d82] text-[10.5px] uppercase tracking-widest">
                    Item {index + 1}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#ffc749] border border-[#1e2246] text-[#1e2246] text-[10px] font-extrabold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Image URL</label>
                  <input
                    type="text"
                    value={item.imageUrl}
                    onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-medium text-[#1e2246] outline-none placeholder-[#626a9f]/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#128063] uppercase tracking-wider">
                    Target Text (Correct)
                  </label>
                  <input
                    type="text"
                    value={item.targetText}
                    onChange={(e) => handleItemChange(index, 'targetText', e.target.value)}
                    placeholder="e.g. Airport"
                    className="w-full p-2.5 bg-white border-2 border-dashed border-[#16a37f]/60 focus:border-[#16a37f] rounded-xl text-xs font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">
                    Student View (Option)
                  </label>
                  <input
                    type="text"
                    value={item.studentViewText}
                    onChange={(e) => handleItemChange(index, 'studentViewText', e.target.value)}
                    placeholder="e.g. Airport"
                    className="w-full p-2.5 bg-white border-2 border-dashed border-[#626a9f]/45 focus:border-[#454d82] rounded-xl text-xs font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full xl:w-72 shrink-0 bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col gap-4 shadow-inner h-fit">
            <h3 className="font-extrabold text-[#454d82] text-[10.5px] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
              Pill Styling
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Text</span>
                <input
                  type="color"
                  value={toHex(textColor, '#1e2246')}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Box</span>
                <input
                  type="color"
                  value={toHex(boxColor, '#ffffff')}
                  onChange={(e) => setBoxColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Outline
                </span>
                <input
                  type="color"
                  value={toHex(lineColor, '#1e2246')}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Style</span>
                <div className="flex border-2 border-[#dfe2f2] rounded-xl overflow-hidden bg-white h-10">
                  <button
                    type="button"
                    onClick={() => setIsBold(!isBold)}
                    className={`flex-1 font-extrabold text-sm transition-colors cursor-pointer ${
                      isBold ? 'bg-[#ffc749] text-[#1e2246]' : 'text-[#454d82] hover:bg-[#f4f6fc]'
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsItalic(!isItalic)}
                    className={`flex-1 italic text-sm border-x border-[#dfe2f2] transition-colors cursor-pointer ${
                      isItalic ? 'bg-[#ffc749] text-[#1e2246]' : 'text-[#454d82] hover:bg-[#f4f6fc]'
                    }`}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUnderline(!isUnderline)}
                    className={`flex-1 underline text-sm transition-colors cursor-pointer ${
                      isUnderline ? 'bg-[#ffc749] text-[#1e2246]' : 'text-[#454d82] hover:bg-[#f4f6fc]'
                    }`}
                  >
                    U
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Size</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                >
                  {['10', '12', '14', '16', '18', '20', '24'].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}px
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Corners
                </span>
                <input
                  type="number"
                  min="0"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none text-center"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Font</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                >
                  <option value="Montserrat">Montserrat</option>
                  <option value="Tabarra">Tabarra</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white/75 border-t border-[#626a9f]/15 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-[#1e2246] bg-white border-2 border-[#1e2246] shadow-[0_3px_0_rgba(30,34,70,0.16)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                items,
                textColor,
                boxColor,
                lineColor,
                fontSize,
                fontFamily,
                borderRadius,
                isBold,
                isItalic,
                isUnderline,
              })
            }
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Save ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default DragAndDropModal;