import React, { useState, useEffect } from 'react';

const FillInTheBlankModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [templateText, setTemplateText] = useState(initialData.templateText || 'I _____ need your help. I ___ do it alone.');
  const [answerText, setAnswerText] = useState(initialData.answerText || '"don\'t", "can"');
  const [editTarget, setEditTarget] = useState('template'); 
  const [t_textColor, setT_textColor] = useState(initialData.t_textColor || '#08203e');
  const [t_boxColor, setT_boxColor] = useState(initialData.t_boxColor || 'transparent');
  const [t_lineColor, setT_lineColor] = useState(initialData.t_lineColor || 'transparent');
  const [t_fontSize, setT_fontSize] = useState(initialData.t_fontSize || '16');
  const [t_fontFamily, setT_fontFamily] = useState(initialData.t_fontFamily || 'Montserrat');
  const [t_borderRadius, setT_borderRadius] = useState(initialData.t_borderRadius || '12');
  const [t_isBold, setT_isBold] = useState(initialData.t_isBold || false);
  const [t_isItalic, setT_isItalic] = useState(initialData.t_isItalic || false);
  const [t_isUnderline, setT_isUnderline] = useState(initialData.t_isUnderline || false);
  const [a_textColor, setA_textColor] = useState(initialData.a_textColor || '#08203e');
  const [a_boxColor, setA_boxColor] = useState(initialData.a_boxColor || 'transparent');
  const [a_lineColor, setA_lineColor] = useState(initialData.a_lineColor || '#08203e');
  const [a_fontSize, setA_fontSize] = useState(initialData.a_fontSize || '16');
  const [a_fontFamily, setA_fontFamily] = useState(initialData.a_fontFamily || 'Montserrat');
  const [a_borderRadius, setA_borderRadius] = useState(initialData.a_borderRadius || '4');
  const [a_isBold, setA_isBold] = useState(initialData.a_isBold || true);
  const [a_isItalic, setA_isItalic] = useState(initialData.a_isItalic || false);
  const [a_isUnderline, setA_isUnderline] = useState(initialData.a_isUnderline || false);

  useEffect(() => {
    if (initialData && isOpen) {
      setTemplateText(initialData.templateText || 'I _____ need your help. I ___ do it alone.');
      setAnswerText(initialData.answerText || '"don\'t", "can"');
      setT_textColor(initialData.t_textColor || '#08203e'); setT_boxColor(initialData.t_boxColor || 'transparent'); setT_lineColor(initialData.t_lineColor || 'transparent'); setT_fontSize(initialData.t_fontSize || '16'); setT_fontFamily(initialData.t_fontFamily || 'Montserrat'); setT_borderRadius(initialData.t_borderRadius || '12'); setT_isBold(initialData.t_isBold || false); setT_isItalic(initialData.t_isItalic || false); setT_isUnderline(initialData.t_isUnderline || false);
      setA_textColor(initialData.a_textColor || '#08203e'); setA_boxColor(initialData.a_boxColor || 'transparent'); setA_lineColor(initialData.a_lineColor || '#08203e'); setA_fontSize(initialData.a_fontSize || '16'); setA_fontFamily(initialData.a_fontFamily || 'Montserrat'); setA_borderRadius(initialData.a_borderRadius || '4'); setA_isBold(initialData.a_isBold || true); setA_isItalic(initialData.a_isItalic || false); setA_isUnderline(initialData.a_isUnderline || false);
      setEditTarget('template');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const activeTextColor = editTarget === 'template' ? t_textColor : a_textColor;
  const activeBoxColor = editTarget === 'template' ? t_boxColor : a_boxColor;
  const activeLineColor = editTarget === 'template' ? t_lineColor : a_lineColor;
  const activeFontSize = editTarget === 'template' ? t_fontSize : a_fontSize;
  const activeFontFamily = editTarget === 'template' ? t_fontFamily : a_fontFamily;
  const activeBorderRadius = editTarget === 'template' ? t_borderRadius : a_borderRadius;
  const activeIsBold = editTarget === 'template' ? t_isBold : a_isBold;
  const activeIsItalic = editTarget === 'template' ? t_isItalic : a_isItalic;
  const activeIsUnderline = editTarget === 'template' ? t_isUnderline : a_isUnderline;

  const setActiveTextColor = (v) => editTarget === 'template' ? setT_textColor(v) : setA_textColor(v);
  const setActiveBoxColor = (v) => editTarget === 'template' ? setT_boxColor(v) : setA_boxColor(v);
  const setActiveLineColor = (v) => editTarget === 'template' ? setT_lineColor(v) : setA_lineColor(v);
  const setActiveFontSize = (v) => editTarget === 'template' ? setT_fontSize(v) : setA_fontSize(v);
  const setActiveFontFamily = (v) => editTarget === 'template' ? setT_fontFamily(v) : setA_fontFamily(v);
  const setActiveBorderRadius = (v) => editTarget === 'template' ? setT_borderRadius(v) : setA_borderRadius(v);
  const setActiveIsBold = (v) => editTarget === 'template' ? setT_isBold(v) : setA_isBold(v);
  const setActiveIsItalic = (v) => editTarget === 'template' ? setT_isItalic(v) : setA_isItalic(v);
  const setActiveIsUnderline = (v) => editTarget === 'template' ? setT_isUnderline(v) : setA_isUnderline(v);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-[#eef5fc] p-5 border-b border-gray-200 shrink-0">
          <h2 className="text-outloud-blue font-black text-lg uppercase tracking-wider font-montserrat">FILL IN THE BLANK</h2>
          <p className="text-gray-600 text-xs mt-1">Type in the text, using "<span className="font-bold text-outloud-blue">_</span>" to replace the letters of the key words.</p>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-500">Sentence Template</label>
            <textarea rows={3} value={templateText} onChange={(e) => setTemplateText(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow transition" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-500">Correct Answer(s)</label>
            <p className="text-[10px] text-gray-400 leading-tight">Type the exact words inside quotation marks, separated by commas (e.g. "is", "Lucas'").</p>
            <input type="text" value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder='"is", "is"' className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow transition" />
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col space-y-4">
            <div className="flex bg-gray-200/70 p-1 rounded-xl">
              <button type="button" className={`flex-1 text-[11px] font-bold py-2.5 rounded-lg transition-all uppercase tracking-wide ${editTarget === 'template' ? 'bg-white shadow-sm text-outloud-blue' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`} onClick={() => setEditTarget('template')}>Edit Sentence Template</button>
              <button type="button" className={`flex-1 text-[11px] font-bold py-2.5 rounded-lg transition-all uppercase tracking-wide ${editTarget === 'answer' ? 'bg-white shadow-sm text-outloud-blue' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`} onClick={() => setEditTarget('answer')}>Edit Correct Answer(s)</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Text Color</span>
                <input type="color" value={activeTextColor} onChange={(e) => setActiveTextColor(e.target.value)} className="w-full h-9 rounded cursor-pointer border border-gray-300" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Box Color</span>
                <div className="flex gap-1 items-center">
                  <input type="color" value={activeBoxColor === 'transparent' ? '#ffffff' : activeBoxColor} onChange={(e) => setActiveBoxColor(e.target.value)} disabled={activeBoxColor === 'transparent'} className={`flex-grow h-9 rounded cursor-pointer border border-gray-300 ${activeBoxColor === 'transparent' ? 'opacity-40' : ''}`} />
                  <button type="button" onClick={() => setActiveBoxColor(activeBoxColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-9 h-9 flex items-center justify-center rounded border ${activeBoxColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'}`} title="Toggle Transparent">🚫</button>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Line Color</span>
                <div className="flex gap-1 items-center">
                  <input type="color" value={activeLineColor === 'transparent' ? '#ffffff' : activeLineColor} onChange={(e) => setActiveLineColor(e.target.value)} disabled={activeLineColor === 'transparent'} className={`flex-grow h-9 rounded cursor-pointer border border-gray-300 ${activeLineColor === 'transparent' ? 'opacity-40' : ''}`} />
                  <button type="button" onClick={() => setActiveLineColor(activeLineColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-9 h-9 flex items-center justify-center rounded border ${activeLineColor === 'transparent' ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-100'}`} title="Toggle Transparent">🚫</button>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Style</span>
                <div className="flex border border-gray-300 rounded overflow-hidden bg-white h-9">
                  <button type="button" onClick={() => setActiveIsBold(!activeIsBold)} className={`flex-1 font-bold text-sm ${activeIsBold ? 'bg-outloud-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}>B</button>
                  <button type="button" onClick={() => setActiveIsItalic(!activeIsItalic)} className={`flex-1 italic text-sm border-x border-gray-300 ${activeIsItalic ? 'bg-outloud-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}>I</button>
                  <button type="button" onClick={() => setActiveIsUnderline(!activeIsUnderline)} className={`flex-1 underline text-sm ${activeIsUnderline ? 'bg-outloud-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}>U</button>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Font Size</span>
                <select value={activeFontSize} onChange={(e) => setActiveFontSize(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                  {['12', '14', '16', '18', '20', '24', '28', '32', '36', '42'].map((sz) => <option key={sz} value={sz}>{sz}px</option>)}
                </select>
              </div>
              <div className="flex flex-col space-y-1.5 col-span-2">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Font</span>
                <select value={activeFontFamily} onChange={(e) => setActiveFontFamily(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none">
                  <option value="Montserrat">Montserrat</option>
                  <option value="Tabarra">Tabarra</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-500 text-center">Corners</span>
                <input type="number" min="0" value={activeBorderRadius} onChange={(e) => setActiveBorderRadius(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none text-center" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300 hover:bg-gray-200 transition">CANCEL</button>
          <button type="button" onClick={() => onSave({ templateText, answerText, t_textColor, t_boxColor, t_lineColor, t_fontSize, t_fontFamily, t_borderRadius, t_isBold, t_isItalic, t_isUnderline, a_textColor, a_boxColor, a_lineColor, a_fontSize, a_fontFamily, a_borderRadius, a_isBold, a_isItalic, a_isUnderline })} className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow hover:scale-105 active:scale-95 transition shadow-md">SAVE</button>
        </div>
      </div>
    </div>
  );
};
export default FillInTheBlankModal;