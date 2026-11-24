import React, { useState, useEffect } from 'react';

const NavButtonModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [buttonStyle, setButtonStyle] = useState(initialData.buttonStyle || 'continue_pill');

  useEffect(() => {
    if (isOpen) {
      setButtonStyle(initialData?.buttonStyle || 'continue_pill');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const STYLES = [
    {
      value: 'continue_pill',
      label: '"CONTINUE" Pill',
      preview: (
        <span className="px-4 py-1.5 rounded-full bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] text-[10px] font-extrabold text-[#1e2246] uppercase tracking-wider">
          Continue →
        </span>
      ),
    },
    {
      value: 'finish_pill',
      label: '"FINISH" Pill',
      preview: (
        <span className="px-4 py-1.5 rounded-full bg-[#16a37f] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] text-[10px] font-extrabold text-white uppercase tracking-wider">
          Finish ✓
        </span>
      ),
    },
    {
      value: 'arrow_icon',
      label: 'Circular Arrow Icon',
      preview: (
        <span className="w-8 h-8 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center font-extrabold text-sm">
          →
        </span>
      ),
    },
  ];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-md bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Dock
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-lg uppercase tracking-tight">
              Nav Button Style
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Choose the visual layout for this navigation button.
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

        <div className="p-6 flex flex-col gap-3 bg-[#f4f6fc]">
          {STYLES.map((opt) => {
            const isSelected = buttonStyle === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center justify-between gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#fff9e8] border-[#1e2246] shadow-[0_3px_0_#1e2246]'
                    : 'bg-white border-[#dfe2f2] hover:border-[#626a9f]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-[#1e2246] bg-[#ffc749]' : 'border-[#626a9f]/50'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-[#1e2246] rounded-full" />}
                  </div>
                  <input
                    type="radio"
                    name="navStyle"
                    value={opt.value}
                    checked={isSelected}
                    onChange={(e) => setButtonStyle(e.target.value)}
                    className="hidden"
                  />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#1e2246]">
                    {opt.label}
                  </span>
                </div>
                {opt.preview}
              </label>
            );
          })}
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
            onClick={() => onSave({ buttonStyle })}
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Save ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavButtonModal;