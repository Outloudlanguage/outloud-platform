const ShapeConfigModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [shapeType, setShapeType] = useState(initialData.shapeType || 'rect');
  const [fillColor, setFillColor] = useState(initialData.fillColor || '#eab308');
  const [strokeColor, setStrokeColor] = useState(initialData.strokeColor || '#08203e');
  const [strokeWidth, setStrokeWidth] = useState(initialData.strokeWidth || '4');
  const [roundness, setRoundness] = useState(initialData.roundness || '0');
  const [opacity, setOpacity] = useState(initialData.opacity || '100');

  useEffect(() => {
    if (initialData && isOpen) {
      setShapeType(initialData.shapeType || 'rect');
      setFillColor(initialData.fillColor || '#eab308');
      setStrokeColor(initialData.strokeColor || '#08203e');
      setStrokeWidth(initialData.strokeWidth || '4');
      setRoundness(initialData.roundness || '0');
      setOpacity(initialData.opacity || '100');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">SHAPE GENERATOR</h2>
          <p className="text-gray-600 text-xs mt-1">Configure your custom vector shape below.</p>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
            <div className="flex flex-col space-y-1.5 col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Shape Type</span>
              <select value={shapeType} onChange={(e) => setShapeType(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-semibold focus:outline-none">
                <option value="rect">Square / Rectangle</option>
                <option value="circle">Circle / Ellipse</option>
                <option value="triangle">Triangle</option>
                <option value="arrow">Arrow</option>
                <option value="line">Line</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Fill Color</span>
              <div className="flex gap-1 items-center">
                <input type="color" value={fillColor === 'transparent' ? '#ffffff' : fillColor} onChange={(e) => setFillColor(e.target.value)} disabled={fillColor === 'transparent' || shapeType === 'line'} className={`flex-grow h-10 rounded cursor-pointer border border-gray-300 ${fillColor === 'transparent' || shapeType === 'line' ? 'opacity-40' : ''}`} />
                <button type="button" onClick={() => setFillColor(fillColor === 'transparent' ? '#eab308' : 'transparent')} disabled={shapeType === 'line'} className={`w-10 h-10 flex items-center justify-center rounded border ${fillColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'} disabled:opacity-50`} title="Toggle Transparent">🚫</button>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Outline Color</span>
              <div className="flex gap-1 items-center">
                <input type="color" value={strokeColor === 'transparent' ? '#ffffff' : strokeColor} onChange={(e) => setStrokeColor(e.target.value)} disabled={strokeColor === 'transparent'} className={`flex-grow h-10 rounded cursor-pointer border border-gray-300 ${strokeColor === 'transparent' ? 'opacity-40' : ''}`} />
                <button type="button" onClick={() => setStrokeColor(strokeColor === 'transparent' ? '#08203e' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded border ${strokeColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'}`} title="Toggle Transparent">🚫</button>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Line Thickness</span>
              <input type="number" min="0" max="50" value={strokeWidth} onChange={(e) => setStrokeWidth(e.target.value)} disabled={strokeColor === 'transparent'} className={`w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-semibold focus:outline-none text-center ${strokeColor === 'transparent' ? 'opacity-50' : ''}`} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Roundness (px)</span>
              <input type="number" min="0" max="200" value={roundness} onChange={(e) => setRoundness(e.target.value)} disabled={shapeType === 'circle' || shapeType === 'line'} className={`w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-semibold focus:outline-none text-center ${shapeType === 'circle' || shapeType === 'line' ? 'opacity-50' : ''}`} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Opacity (%)</span>
              <input type="number" min="10" max="100" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-semibold focus:outline-none text-center" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300 hover:bg-gray-200 transition">CANCEL</button>
          <button type="button" onClick={() => onSave({ shapeType, fillColor, strokeColor, strokeWidth, roundness, opacity })} className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow hover:scale-105 active:scale-95 transition shadow-md">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default ShapeConfigModal;