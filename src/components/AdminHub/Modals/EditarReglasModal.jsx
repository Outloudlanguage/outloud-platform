import React, { useState, useEffect, useRef } from 'react';
const EditarReglasModal = ({ isOpen, initialHtml = '<span style="font-family: Montserrat; font-size: 16px; color: #08203e;">Escribe las reglas de la comunidad aquí...</span>', onSave, onClose }) => {
  const [htmlContent, setHtmlContent] = useState(initialHtml);
  const [textDropdown, setTextDropdown] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => { if (isOpen && editorRef.current) { editorRef.current.innerHTML = htmlContent; } }, [isOpen]);

  const handleFormat = (command, value = null) => {
    if (command === 'fontSizePx') { document.execCommand('fontSize', false, '7'); document.querySelectorAll('font[size="7"]').forEach(f => { f.removeAttribute('size'); f.style.fontSize = `${value}px`; }); } 
    else { document.execCommand(command, false, value); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">EDITAR REGLAS DE LA COMUNIDAD</h2>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
           <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2 rounded-t-xl border border-gray-300 border-b-0">
              <div className="flex border border-gray-300 rounded overflow-hidden bg-white">
                <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('bold');}} className="w-8 h-8 font-bold text-gray-700 hover:bg-gray-100">B</button>
                <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('italic');}} className="w-8 h-8 italic text-gray-700 hover:bg-gray-100 border-l border-gray-300">I</button>
                <button onMouseDown={(e)=>{e.preventDefault(); handleFormat('underline');}} className="w-8 h-8 underline text-gray-700 hover:bg-gray-100 border-l border-gray-300">U</button>
              </div>
              <input type="color" onMouseDown={(e)=>e.preventDefault()} onChange={(e) => handleFormat('foreColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-300" title="Color de Texto" />
              <div className="relative">
                <button onMouseDown={(e)=>e.preventDefault()} onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')} className="p-1.5 px-2 border border-gray-300 rounded text-xs font-semibold focus:outline-none bg-white">Tamaño...</button>
                {textDropdown === 'size' && (<div className="absolute top-full left-0 mt-1 w-16 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[200]">{[12,14,16,18,20,24,28,32].map(sz => (<div key={sz} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleFormat('fontSizePx', sz); setTextDropdown(null); }} className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs">{sz}px</div>))}</div>)}
              </div>
           </div>
           <div ref={editorRef} contentEditable suppressContentEditableWarning className="w-full p-4 bg-white border border-gray-300 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-student-yellow transition overflow-y-auto min-h-[200px] rich-text-content" />
        </div>
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300">CANCELAR</button>
          <button type="button" onClick={() => { onSave(editorRef.current ? editorRef.current.innerHTML : htmlContent); onClose(); }} className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow shadow-md">GUARDAR REGLAS</button>
        </div>
      </div>
    </div>
  );
};

export default EditarReglasModal;