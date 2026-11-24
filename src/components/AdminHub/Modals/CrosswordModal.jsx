import React, { useState, useEffect } from 'react';

const DEFAULT_ITEMS = [
  { id: 1, word: 'JUSTICE', prompt: 'Fairness in the way people are dealt with' },
  { id: 2, word: 'CAR', prompt: 'A four-wheeled road vehicle' },
  { id: 3, word: 'CAMERA', prompt: 'Device for recording visual images' },
];

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const CrosswordModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [items, setItems] = useState(initialData.items || DEFAULT_ITEMS);
  const [textColor, setTextColor] = useState(initialData.textColor || '#1e2246');
  const [cellColor, setCellColor] = useState(initialData.cellColor || '#ffffff');
  const [lineColor, setLineColor] = useState(initialData.lineColor || '#626a9f');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '16');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [isBold, setIsBold] = useState(initialData.isBold !== undefined ? initialData.isBold : true);

  useEffect(() => {
    if (isOpen) {
      setItems(initialData?.items?.length ? initialData.items : DEFAULT_ITEMS);
      setTextColor(initialData?.textColor || '#1e2246');
      setCellColor(initialData?.cellColor || '#ffffff');
      setLineColor(initialData?.lineColor || '#626a9f');
      setFontSize(initialData?.fontSize || '16');
      setFontFamily(initialData?.fontFamily || 'Montserrat');
      setIsBold(initialData?.isBold !== undefined ? initialData.isBold : true);
    }
  }, [isOpen, initialData]);

  const addItem = () => setItems([...items, { id: Date.now(), word: '', prompt: '' }]);
  const removeItem = (id) => {
    if (items.length > 2) setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (index, field, value) => {
    const newItems = items.map((item, idx) =>
      idx === index
        ? { ...item, [field]: field === 'word' ? value.toUpperCase().replace(/[^A-Z]/g, '') : value }
        : item
    );
    setItems(newItems);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-4xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Puzzle
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Crossword Generator
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Fill in the target words and prompts. The engine will automatically generate an intersecting grid.
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

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-7">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex w-full gap-3 px-1">
              <span className="flex-1 text-[10px] font-extrabold uppercase tracking-widest text-[#454d82]">Word</span>
              <span className="flex-[2] text-[10px] font-extrabold uppercase tracking-widest text-[#454d82]">Prompt</span>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="flex gap-2.5 items-center">
                <input
                  type="text"
                  value={item.word}
                  onChange={(e) => updateItem(index, 'word', e.target.value)}
                  placeholder="WORD"
                  className="flex-1 p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-extrabold uppercase text-[#1e2246] outline-none placeholder-[#626a9f]/50 shadow-sm"
                />
                <input
                  type="text"
                  value={item.prompt}
                  onChange={(e) => updateItem(index, 'prompt', e.target.value)}
                  placeholder="Hint for the student..."
                  className="flex-[2] p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-medium text-[#1e2246] outline-none placeholder-[#626a9f]/50 shadow-sm"
                />
                {items.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="w-9 h-9 shrink-0 bg-[#ee665b]/15 hover:bg-[#ee665b] text-[#c93f34] hover:text-white rounded-full flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                    title="Remove Word"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="mt-2 w-full py-3 bg-[#f4f6fc] hover:bg-[#fff3d1] text-[#1e2246] font-extrabold text-[11px] uppercase tracking-widest border-2 border-dashed border-[#626a9f]/40 hover:border-[#1e2246] rounded-full transition-colors cursor-pointer"
            >
              + Add Row
            </button>
          </div>

          <div className="w-full lg:w-72 bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col gap-4 shadow-inner shrink-0 h-fit">
            <h3 className="font-extrabold text-[#454d82] text-[10.5px] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
              Cell Styling
            </h3>

            <div className="grid grid-cols-2 gap-3.5 items-end">
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
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Cell</span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(cellColor, '#ffffff')}
                    onChange={(e) => setCellColor(e.target.value)}
                    disabled={cellColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      cellColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setCellColor(cellColor === 'transparent' ? '#ffffff' : 'transparent')}
                    className={`w-9 h-10 flex items-center justify-center rounded-xl border-2 text-xs transition-colors cursor-pointer ${
                      cellColor === 'transparent'
                        ? 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                        : 'bg-white border-[#dfe2f2] text-[#454d82]'
                    }`}
                    title="Toggle Transparent"
                  >
                    🚫
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Line Color
                </span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(lineColor, '#626a9f')}
                    onChange={(e) => setLineColor(e.target.value)}
                    disabled={lineColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      lineColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setLineColor(lineColor === 'transparent' ? '#626a9f' : 'transparent')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 text-xs transition-colors cursor-pointer ${
                      lineColor === 'transparent'
                        ? 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                        : 'bg-white border-[#dfe2f2] text-[#454d82]'
                    }`}
                    title="Toggle Transparent"
                  >
                    🚫
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
                  {['12', '14', '16', '18', '20', '24'].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}px
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Style</span>
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`w-full h-10 rounded-xl font-extrabold text-sm border-2 transition-colors cursor-pointer ${
                    isBold
                      ? 'bg-[#ffc749] text-[#1e2246] border-[#1e2246]'
                      : 'bg-white text-[#454d82] border-[#dfe2f2]'
                  }`}
                >
                  B
                </button>
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
            onClick={() => onSave({ items, textColor, cellColor, lineColor, fontSize, fontFamily, isBold })}
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Generate ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrosswordModal;