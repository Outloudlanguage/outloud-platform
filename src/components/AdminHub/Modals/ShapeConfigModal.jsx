import React, { useState, useEffect } from 'react';

const ShapeConfigModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [shapeType, setShapeType] = useState(initialData.shapeType || 'rect');
  const [fillColor, setFillColor] = useState(initialData.fillColor || '#fcd34d');
  const [strokeColor, setStrokeColor] = useState(initialData.strokeColor || '#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(initialData.strokeWidth || '4');
  const [roundness, setRoundness] = useState(initialData.roundness || '0');
  const [opacity, setOpacity] = useState(initialData.opacity || '100');

  useEffect(() => {
    if (initialData && isOpen) {
      setShapeType(initialData.shapeType || 'rect');
      setFillColor(initialData.fillColor || '#fcd34d');
      setStrokeColor(initialData.strokeColor || '#ffffff');
      setStrokeWidth(initialData.strokeWidth || '4');
      setRoundness(initialData.roundness || '0');
      setOpacity(initialData.opacity || '100');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-2xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">SHAPE GENERATOR</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Configure your custom vector shape below.</p>
        </div>
        
        <div className="p-6 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
            <div className="flex flex-col space-y-2 col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Shape Type</span>
              <select value={shapeType} onChange={(e) => setShapeType(e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                <option value="rect">Square / Rectangle</option>
                <option value="circle">Circle / Ellipse</option>
                <option value="triangle">Triangle</option>
                <option value="arrow">Arrow</option>
                <option value="line">Line</option>
              </select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Fill Color</span>
              <div className="flex gap-2 items-center">
                <input type="color" value={fillColor === 'transparent' ? '#ffffff' : fillColor} onChange={(e) => setFillColor(e.target.value)} disabled={fillColor === 'transparent' || shapeType === 'line'} className={`flex-grow h-12 rounded-xl cursor-pointer bg-transparent border border-white/20 ${fillColor === 'transparent' || shapeType === 'line' ? 'opacity-40' : ''}`} />
                <button type="button" onClick={() => setFillColor(fillColor === 'transparent' ? '#fcd34d' : 'transparent')} disabled={shapeType === 'line'} className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-colors ${fillColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'} disabled:opacity-50`} title="Toggle Transparent">🚫</button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Outline Color</span>
              <div className="flex gap-2 items-center">
                <input type="color" value={strokeColor === 'transparent' ? '#ffffff' : strokeColor} onChange={(e) => setStrokeColor(e.target.value)} disabled={strokeColor === 'transparent'} className={`flex-grow h-12 rounded-xl cursor-pointer bg-transparent border border-white/20 ${strokeColor === 'transparent' ? 'opacity-40' : ''}`} />
                <button type="button" onClick={() => setStrokeColor(strokeColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-colors ${strokeColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Line Thickness</span>
              <input type="number" min="0" max="50" value={strokeWidth} onChange={(e) => setStrokeWidth(e.target.value)} disabled={strokeColor === 'transparent'} className={`w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center ${strokeColor === 'transparent' ? 'opacity-50' : ''}`} />
            </div>
            
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Roundness (px)</span>
              <input type="number" min="0" max="200" value={roundness} onChange={(e) => setRoundness(e.target.value)} disabled={shapeType === 'circle' || shapeType === 'line'} className={`w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center ${shapeType === 'circle' || shapeType === 'line' ? 'opacity-50' : ''}`} />
            </div>
            
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest text-center">Opacity (%)</span>
              <input type="number" min="10" max="100" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCEL</button>
          <button type="button" onClick={() => onSave({ shapeType, fillColor, strokeColor, strokeWidth, roundness, opacity })} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default ShapeConfigModal;