import React from 'react';

const ComprobanteModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-2xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">COMPROBANTE DE PAGO</h2>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex justify-center bg-white/5 shadow-inner min-h-[200px]">
          {imageUrl ? (
             <img src={imageUrl} alt="Comprobante" className="max-w-full h-auto rounded-2xl shadow-lg border border-white/20" />
          ) : (
             <div className="flex flex-col items-center justify-center text-white/40 py-10">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p className="font-bold uppercase text-xs tracking-widest">Imagen no disponible</p>
             </div>
          )}
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onClose} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">CERRAR</button>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteModal;