import React, { useState, useEffect } from 'react';

const NavButtonModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [buttonStyle, setButtonStyle] = useState(initialData.buttonStyle || 'continue_pill');

  useEffect(() => {
    if (initialData && isOpen) {
      setButtonStyle(initialData.buttonStyle || 'continue_pill');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-md bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">Nav Button Style</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Choose the visual layout for this navigation button.</p>
        </div>
        
        <div className="p-6 flex flex-col gap-4 bg-white/5 shadow-inner">
          <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${buttonStyle === 'continue_pill' ? 'bg-white/10 border-[#fcd34d] shadow-[0_0_10px_rgba(252,211,77,0.2)]' : 'bg-black/20 border-white/10 hover:border-white/30'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${buttonStyle === 'continue_pill' ? 'border-[#fcd34d]' : 'border-white/40'}`}>
               {buttonStyle === 'continue_pill' && <div className="w-2.5 h-2.5 bg-[#fcd34d] rounded-full" />}
            </div>
            <input type="radio" name="navStyle" value="continue_pill" checked={buttonStyle === 'continue_pill'} onChange={(e) => setButtonStyle(e.target.value)} className="hidden" />
            <span className={`font-bold text-sm tracking-widest uppercase ${buttonStyle === 'continue_pill' ? 'text-[#fcd34d]' : 'text-white/80'}`}>"CONTINUE" Pill</span>
          </label>
          
          <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${buttonStyle === 'finish_pill' ? 'bg-white/10 border-[#fcd34d] shadow-[0_0_10px_rgba(252,211,77,0.2)]' : 'bg-black/20 border-white/10 hover:border-white/30'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${buttonStyle === 'finish_pill' ? 'border-[#fcd34d]' : 'border-white/40'}`}>
               {buttonStyle === 'finish_pill' && <div className="w-2.5 h-2.5 bg-[#fcd34d] rounded-full" />}
            </div>
            <input type="radio" name="navStyle" value="finish_pill" checked={buttonStyle === 'finish_pill'} onChange={(e) => setButtonStyle(e.target.value)} className="hidden" />
            <span className={`font-bold text-sm tracking-widest uppercase ${buttonStyle === 'finish_pill' ? 'text-[#fcd34d]' : 'text-white/80'}`}>"FINISH" Pill</span>
          </label>
          
          <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${buttonStyle === 'arrow_icon' ? 'bg-white/10 border-[#fcd34d] shadow-[0_0_10px_rgba(252,211,77,0.2)]' : 'bg-black/20 border-white/10 hover:border-white/30'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${buttonStyle === 'arrow_icon' ? 'border-[#fcd34d]' : 'border-white/40'}`}>
               {buttonStyle === 'arrow_icon' && <div className="w-2.5 h-2.5 bg-[#fcd34d] rounded-full" />}
            </div>
            <input type="radio" name="navStyle" value="arrow_icon" checked={buttonStyle === 'arrow_icon'} onChange={(e) => setButtonStyle(e.target.value)} className="hidden" />
            <span className={`font-bold text-sm tracking-widest uppercase ${buttonStyle === 'arrow_icon' ? 'text-[#fcd34d]' : 'text-white/80'}`}>Circular Arrow Icon</span>
          </label>
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCEL</button>
          <button type="button" onClick={() => onSave({ buttonStyle })} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default NavButtonModal;