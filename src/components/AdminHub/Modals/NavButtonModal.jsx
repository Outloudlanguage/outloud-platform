const NavButtonModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [buttonStyle, setButtonStyle] = useState(initialData.buttonStyle || 'continue_pill');

  useEffect(() => {
    if (initialData && isOpen) {
      setButtonStyle(initialData.buttonStyle || 'continue_pill');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-black text-outloud-blue uppercase tracking-wider">Nav Button Style</h2>
          <p className="text-gray-600 text-xs mt-1">Choose the visual layout for this navigation button.</p>
        </div>
        <div className="p-6 flex flex-col gap-4 bg-gray-50">
          <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-outloud-blue">
            <input type="radio" name="navStyle" value="continue_pill" checked={buttonStyle === 'continue_pill'} onChange={(e) => setButtonStyle(e.target.value)} />
            <span className="font-bold text-sm text-outloud-blue">"CONTINUE" Pill</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-outloud-blue">
            <input type="radio" name="navStyle" value="finish_pill" checked={buttonStyle === 'finish_pill'} onChange={(e) => setButtonStyle(e.target.value)} />
            <span className="font-bold text-sm text-outloud-blue">"FINISH" Pill</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-outloud-blue">
            <input type="radio" name="navStyle" value="arrow_icon" checked={buttonStyle === 'arrow_icon'} onChange={(e) => setButtonStyle(e.target.value)} />
            <span className="font-bold text-sm text-outloud-blue">Circular Arrow Icon</span>
          </label>
        </div>
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-200 transition">CANCEL</button>
          <button type="button" onClick={() => onSave({ buttonStyle })} className="px-8 py-2.5 rounded-full font-black bg-student-yellow text-outloud-blue shadow hover:scale-105 transition">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default NavButtonModal;