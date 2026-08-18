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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <div className="w-full max-w-2xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0">
          <h2 className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">FILL IN THE BLANK</h2>
          <p className="text-white/70 text-xs mt-2 font-medium">Type in the text, using "<span className="font-black text-[#fcd34d]">_</span>" to replace the letters of the key words.</p>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold uppercase text-white/70 tracking-widest">Sentence Template</label>
            <textarea rows={3} value={templateText} onChange={(e) => setTemplateText(e.target.value)} className="w-full p-4 bg-white/5 border border-white/20 rounded-xl font-montserrat text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition shadow-inner placeholder-white/30" placeholder="I _____ need your help..." />
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase text-white/70 tracking-widest">Correct Answer(s)</label>
              <span className="text-[9px] text-white/50 tracking-wider">Separate with commas (e.g. "is", "Lucas'")</span>
            </div>
            <input type="text" value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder='"is", "is"' className="w-full p-4 bg-white/5 border border-white/20 rounded-xl font-montserrat text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fcd34d] transition shadow-inner placeholder-white/30" />
          </div>
          
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col space-y-5">
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button type="button" className={`flex-1 text-[10px] font-bold py-3 rounded-lg transition-all uppercase tracking-widest ${editTarget === 'template' ? 'bg-white/20 text-white shadow-md border border-white/20' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`} onClick={() => setEditTarget('template')}>Edit Template</button>
              <button type="button" className={`flex-1 text-[10px] font-bold py-3 rounded-lg transition-all uppercase tracking-widest ${editTarget === 'answer' ? 'bg-white/20 text-white shadow-md border border-white/20' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`} onClick={() => setEditTarget('answer')}>Edit Answers</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-end">
              <div className="flex flex-col space-y-2">
                <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Text Color</span>
                <input type="color" value={activeTextColor} onChange={(e) => setActiveTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/20" />
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Box Color</span>
                <div className="flex gap-2 items-center">
                  <input type="color" value={activeBoxColor === 'transparent' ? '#ffffff' : activeBoxColor} onChange={(e) => setActiveBoxColor(e.target.value)} disabled={activeBoxColor === 'transparent'} className={`flex-grow h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${activeBoxColor === 'transparent' ? 'opacity-40' : ''}`} />
                  <button type="button" onClick={() => setActiveBoxColor(activeBoxColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${activeBoxColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Line Color</span>
                <div className="flex gap-2 items-center">
                  <input type="color" value={activeLineColor === 'transparent' ? '#ffffff' : activeLineColor} onChange={(e) => setActiveLineColor(e.target.value)} disabled={activeLineColor === 'transparent'} className={`flex-grow h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 ${activeLineColor === 'transparent' ? 'opacity-40' : ''}`} />
                  <button type="button" onClick={() => setActiveLineColor(activeLineColor === 'transparent' ? '#ffffff' : 'transparent')} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${activeLineColor === 'transparent' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-inner' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'}`} title="Toggle Transparent">🚫</button>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Style</span>
                <div className="flex border border-white/20 rounded-lg overflow-hidden bg-black/20 h-10">
                  <button type="button" onClick={() => setActiveIsBold(!activeIsBold)} className={`flex-1 font-bold text-sm transition-colors ${activeIsBold ? 'bg-[#fcd34d] text-[#08203e]' : 'text-white/70 hover:bg-white/10'}`}>B</button>
                  <button type="button" onClick={() => setActiveIsItalic(!activeIsItalic)} className={`flex-1 italic text-sm border-x border-white/20 transition-colors ${activeIsItalic ? 'bg-[#fcd34d] text-[#08203e]' : 'text-white/70 hover:bg-white/10'}`}>I</button>
                  <button type="button" onClick={() => setActiveIsUnderline(!activeIsUnderline)} className={`flex-1 underline text-sm transition-colors ${activeIsUnderline ? 'bg-[#fcd34d] text-[#08203e]' : 'text-white/70 hover:bg-white/10'}`}>U</button>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Font Size</span>
                <select value={activeFontSize} onChange={(e) => setActiveFontSize(e.target.value)} className="w-full p-2.5 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                  {['12', '14', '16', '18', '20', '24', '28', '32', '36', '42'].map((sz) => <option key={sz} value={sz}>{sz}px</option>)}
                </select>
              </div>
              <div className="flex flex-col space-y-2 col-span-2">
                <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Font</span>
                <select value={activeFontFamily} onChange={(e) => setActiveFontFamily(e.target.value)} className="w-full p-2.5 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                  <option value="Montserrat">Montserrat</option>
                  <option value="Tabarra">Tabarra</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-[9px] font-bold uppercase text-white/70 tracking-widest text-center">Corners</span>
                <input type="number" min="0" value={activeBorderRadius} onChange={(e) => setActiveBorderRadius(e.target.value)} className="w-full p-2.5 bg-[#070b19] border border-white/20 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCEL</button>
          <button type="button" onClick={() => onSave({ templateText, answerText, t_textColor, t_boxColor, t_lineColor, t_fontSize, t_fontFamily, t_borderRadius, t_isBold, t_isItalic, t_isUnderline, a_textColor, a_boxColor, a_lineColor, a_fontSize, a_fontFamily, a_borderRadius, a_isBold, a_isItalic, a_isUnderline })} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">SAVE</button>
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlankModal;