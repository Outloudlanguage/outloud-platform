import React, { useState, useEffect, useRef } from 'react';
const ComprobanteModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">COMPROBANTE DE PAGO</h2>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar flex justify-center bg-gray-50">
          {imageUrl ? <img src={imageUrl} alt="Comprobante" className="max-w-full h-auto rounded-xl shadow-sm border border-gray-200" /> : <p className="text-gray-500 font-bold uppercase text-xs tracking-widest py-10">Imagen no disponible</p>}
        </div>
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300 hover:bg-gray-200 transition">CERRAR</button>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteModal;