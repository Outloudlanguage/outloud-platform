import React, { useState, useEffect, useRef } from 'react';

const EditarReglasModal = ({
  isOpen,
  initialHtml = '<span style="font-family: Montserrat; font-size: 16px; color: #1e2246;">Escribe las reglas de la comunidad aquí...</span>',
  onSave,
  onClose,
}) => {
  const [htmlContent, setHtmlContent] = useState(initialHtml);
  const [textDropdown, setTextDropdown] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHtmlContent(initialHtml);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialHtml;
      }
    }
  }, [isOpen, initialHtml]);

  const handleFormat = (command, value = null) => {
    if (command === 'fontSizePx') {
      document.execCommand('fontSize', false, '7');
      document.querySelectorAll('font[size="7"]').forEach((f) => {
        f.removeAttribute('size');
        f.style.fontSize = `${value}px`;
      });
    } else {
      document.execCommand(command, false, value);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-3xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-center justify-between shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1">
              Comunidad OutLoud
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-lg sm:text-xl uppercase tracking-tight">
              Editar Reglas de la Comunidad
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 items-center bg-[#1e2246] text-white p-2.5 rounded-t-2xl border-2 border-[#1e2246]">
            <div className="flex border border-white/20 rounded-xl overflow-hidden bg-white/10">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat('bold');
                }}
                className="w-8 h-8 font-bold text-white hover:bg-[#ffc749] hover:text-[#1e2246] transition-colors cursor-pointer"
              >
                B
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat('italic');
                }}
                className="w-8 h-8 italic text-white hover:bg-[#ffc749] hover:text-[#1e2246] border-l border-white/20 transition-colors cursor-pointer"
              >
                I
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleFormat('underline');
                }}
                className="w-8 h-8 underline text-white hover:bg-[#ffc749] hover:text-[#1e2246] border-l border-white/20 transition-colors cursor-pointer"
              >
                U
              </button>
            </div>

            <input
              type="color"
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => handleFormat('foreColor', e.target.value)}
              className="w-8 h-8 rounded-xl cursor-pointer bg-white border border-white/30 p-0.5"
              title="Color de Texto"
            />

            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')}
                className="px-3 py-1.5 border border-white/25 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors"
              >
                Tamaño <span className="text-[10px] text-[#ffc749]">▼</span>
              </button>
              {textDropdown === 'size' && (
                <div className="absolute top-full left-0 mt-1.5 w-20 max-h-44 overflow-y-auto bg-white border-2 border-[#1e2246] rounded-xl shadow-xl z-[200] custom-scrollbar p-1">
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 42].map((sz) => (
                    <div
                      key={sz}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        handleFormat('fontSizePx', sz);
                        setTextDropdown(null);
                      }}
                      className="px-2 py-1.5 rounded-lg hover:bg-[#ffc749] cursor-pointer text-xs font-bold text-[#1e2246] text-center transition-colors"
                    >
                      {sz}px
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full p-5 bg-white border-2 border-t-0 border-[#dfe2f2] focus:border-[#454d82] rounded-b-2xl text-[#1e2246] outline-none overflow-y-auto min-h-[250px] rich-text-content shadow-inner"
          />
        </div>

        <div className="p-5 bg-white/75 border-t border-[#626a9f]/15 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-[#1e2246] bg-white border-2 border-[#1e2246] shadow-[0_3px_0_rgba(30,34,70,0.16)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(editorRef.current ? editorRef.current.innerHTML : htmlContent);
              onClose();
            }}
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Guardar Reglas ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarReglasModal;