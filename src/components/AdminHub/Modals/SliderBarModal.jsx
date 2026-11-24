import React, { useState, useEffect } from 'react';

const DEFAULT_SLIDER_OPTIONS = [
  { id: 1, text: 'Pretty', isCorrect: false },
  { id: 2, text: 'Beautiful', isCorrect: true },
  { id: 3, text: 'Gorgeous', isCorrect: false },
];

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const SliderBarModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [options, setOptions] = useState(initialData.options || DEFAULT_SLIDER_OPTIONS);
  const [orientation, setOrientation] = useState(initialData.orientation || 'horizontal');
  const [barColor, setBarColor] = useState(initialData.barColor || '#dfe2f2');
  const [barThickness, setBarThickness] = useState(initialData.barThickness || '14');
  const [handleColor, setHandleColor] = useState(initialData.handleColor || '#ffc749');
  const [barText, setBarText] = useState(initialData.barText || '');
  const [barTextColor, setBarTextColor] = useState(initialData.barTextColor || '#1e2246');
  const [fontSize, setFontSize] = useState(initialData.fontSize || '16');
  const [fontFamily, setFontFamily] = useState(initialData.fontFamily || 'Montserrat');
  const [textColor, setTextColor] = useState(initialData.textColor || '#1e2246');

  useEffect(() => {
    if (isOpen) {
      setOptions(initialData?.options?.length ? initialData.options : DEFAULT_SLIDER_OPTIONS);
      setOrientation(initialData?.orientation || 'horizontal');
      setBarColor(initialData?.barColor || '#dfe2f2');
      setBarThickness(initialData?.barThickness || '14');
      setHandleColor(initialData?.handleColor || '#ffc749');
      setBarText(initialData?.barText || '');
      setBarTextColor(initialData?.barTextColor || '#1e2246');
      setFontSize(initialData?.fontSize || '16');
      setFontFamily(initialData?.fontFamily || 'Montserrat');
      setTextColor(initialData?.textColor || '#1e2246');
    }
  }, [isOpen, initialData]);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: Date.now(), text: `Option ${options.length + 1}`, isCorrect: false }]);
    }
  };
  const removeOption = (id) => {
    if (options.length > 2) setOptions(options.filter((o) => o.id !== id));
  };
  const updateOptionText = (id, text) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };
  const toggleCorrect = (id) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));
  };

  const handleSave = () => {
    onSave({
      options,
      orientation,
      barColor,
      barThickness,
      handleColor,
      barText,
      barTextColor,
      fontSize,
      fontFamily,
      textColor,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-3xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Scale
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Slider Bar
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Create up to 10 nuanced stops and mark the target position.
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

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {/* Options */}
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center border-b border-[#626a9f]/15 pb-3">
              <h3 className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#454d82]">
                Nuance Options (Min 2, Max 10)
              </h3>
              <button
                type="button"
                onClick={addOption}
                disabled={options.length >= 10}
                className="text-[10px] font-extrabold uppercase tracking-widest bg-[#e8eaf7] hover:bg-[#ffc749] text-[#1e2246] border border-[#1e2246]/20 hover:border-[#1e2246] px-4 py-2 rounded-full transition-colors disabled:opacity-40 cursor-pointer"
              >
                + Add Option ({options.length}/10)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {options.map((opt, index) => (
                <div
                  key={opt.id}
                  className={`relative rounded-2xl p-4 flex flex-col gap-2.5 border-2 transition-all ${
                    opt.isCorrect
                      ? 'bg-[#e7faf3] border-[#16a37f] shadow-sm'
                      : 'bg-[#f4f6fc] border-white focus-within:border-[#454d82] shadow-inner'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-[#626a9f]/15 pb-2">
                    <span className="text-[10px] font-extrabold text-[#454d82] uppercase tracking-widest">
                      Position {index + 1}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={() => toggleCorrect(opt.id)}
                        className="w-4 h-4 accent-[#16a37f] rounded cursor-pointer"
                      />
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          opt.isCorrect ? 'text-[#128063]' : 'text-[#626a9f]'
                        }`}
                      >
                        {opt.isCorrect ? 'Correct ✓' : 'Mark Correct'}
                      </span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    placeholder="Option text..."
                    className="w-full p-2.5 bg-white border border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50"
                  />

                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(opt.id)}
                      className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-[#ee665b] text-white rounded-full border-2 border-white flex items-center justify-center hover:brightness-110 shadow-md text-xs font-bold cursor-pointer"
                      title="Remove Option"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Styling Columns */}
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-[1.5] bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col gap-4 shadow-inner">
              <h3 className="font-extrabold text-[#454d82] text-[10.5px] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
                Slider Track Styling
              </h3>

              <div className="grid grid-cols-2 gap-3.5 items-end">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider">Orientation</span>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    <option value="horizontal">Horizontal ↔</option>
                    <option value="vertical">Vertical ↕</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                    Track Color
                  </span>
                  <input
                    type="color"
                    value={toHex(barColor, '#dfe2f2')}
                    onChange={(e) => setBarColor(e.target.value)}
                    className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                    Handle Color
                  </span>
                  <input
                    type="color"
                    value={toHex(handleColor, '#ffc749')}
                    onChange={(e) => setHandleColor(e.target.value)}
                    className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                    Thickness (px)
                  </span>
                  <input
                    type="number"
                    min="4"
                    max="100"
                    value={barThickness}
                    onChange={(e) => setBarThickness(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none text-center"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                    Inner Text Color
                  </span>
                  <input
                    type="color"
                    value={toHex(barTextColor, '#1e2246')}
                    onChange={(e) => setBarTextColor(e.target.value)}
                    className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider">
                    Inner Bar Text (Optional)
                  </span>
                  <input
                    type="text"
                    value={barText}
                    onChange={(e) => setBarText(e.target.value)}
                    placeholder="e.g. Intensity →"
                    className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col gap-4 shadow-inner">
              <h3 className="font-extrabold text-[#454d82] text-[10.5px] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
                Floating Label
              </h3>

              <div className="grid grid-cols-1 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                    Text Color
                  </span>
                  <input
                    type="color"
                    value={toHex(textColor, '#1e2246')}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                    Size
                  </span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    {['12', '14', '16', '18', '20', '24', '28'].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}px
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                    Font
                  </span>
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
            onClick={handleSave}
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Save ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default SliderBarModal;