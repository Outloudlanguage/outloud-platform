import React, { useState, useEffect, useRef } from 'react';

const EditarReglasModal = ({ isOpen, initialHtml = '<span style="font-family: Montserrat; font-size: 16px; color: #ffffff;">Escribe las reglas de la comunidad aquí...</span>', onSave, onClose }) => {
  const [htmlContent, setHtmlContent] = useState(initialHtml);
  const [textDropdown, setTextDropdown] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => { if (isOpen && editorRef.current) { editorRef.current.innerHTML = htmlContent; } }, [isOpen, htmlContent]);

  const handleFormat = (command, value = null) => {
    if (command === 'fontSizePx') { 
       document.execCommand('fontSize', false, '7'); 
       document.querySelectorAll('font[size="7"]').forEach(f => { f.removeAttribute('size'); f.style.fontSize = `${value}px`; }); 
    } else { 
       document.execCommand(command, false, value); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-3xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">EDITAR REGLAS DE LA COMUNIDAD</h2>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
           <div className="flex flex-wrap gap-2 items-center bg-black/20 p-2 rounded-t-2xl border border-white/10 border-b-0">
              <div className="flex border border-white/20 rounded-lg overflow-hidden bg-white/5">
                <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('bold');}} className="w-8 h-8 font-bold text-white/80 hover:bg-white/10 transition-colors">B</button>
                <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('italic');}} className="w-8 h-8 italic text-white/80 hover:bg-white/10 border-l border-white/20 transition-colors">I</button>
                <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('underline');}} className="w-8 h-8 underline text-white/80 hover:bg-white/10 border-l border-white/20 transition-colors">U</button>
              </div>
              <input type="color" onMouseDown={(e)=>e.preventDefault()} onChange={(e) => handleFormat('foreColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20" title="Color de Texto" />
              <div className="relative">
                <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')} className="p-1.5 px-3 border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                   Tamaño... <span className="text-[10px]">▼</span>
                </button>
                {textDropdown === 'size' && (
                   <div className="absolute top-full left-0 mt-1 w-16 max-h-40 overflow-y-auto bg-[#070b19] border border-white/20 rounded-xl shadow-2xl z-[200] custom-scrollbar">
                      {[12,14,16,18,20,24,28,32,36,42].map(sz => (
                         <div key={sz} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontSizePx', sz); setTextDropdown(null); }} className="px-2 py-2 hover:bg-white/10 cursor-pointer text-xs text-white text-center transition-colors">{sz}px</div>
                      ))}
                   </div>
                )}
              </div>
           </div>
           <div ref={editorRef} contentEditable suppressContentEditableWarning className="w-full p-5 bg-white/5 border border-white/10 rounded-b-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition overflow-y-auto min-h-[250px] rich-text-content shadow-inner" />
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCELAR</button>
          <button type="button" onClick={() => { onSave(editorRef.current ? editorRef.current.innerHTML : htmlContent); onClose(); }} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">GUARDAR REGLAS</button>
        </div>
      </div>
    </div>
  );
};

export default EditarReglasModal;