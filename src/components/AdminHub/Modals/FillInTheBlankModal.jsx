import React, { useState, useEffect } from 'react';

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const FillInTheBlankModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [templateText, setTemplateText] = useState(
    initialData.templateText || 'I _____ need your help. I ___ do it alone.'
  );
  const [answerText, setAnswerText] = useState(initialData.answerText || '"don\'t", "can"');
  const [editTarget, setEditTarget] = useState('template');

  const [t_textColor, setT_textColor] = useState(initialData.t_textColor || '#1e2246');
  const [t_boxColor, setT_boxColor] = useState(initialData.t_boxColor || 'transparent');
  const [t_lineColor, setT_lineColor] = useState(initialData.t_lineColor || 'transparent');
  const [t_fontSize, setT_fontSize] = useState(initialData.t_fontSize || '18');
  const [t_fontFamily, setT_fontFamily] = useState(initialData.t_fontFamily || 'Montserrat');
  const [t_borderRadius, setT_borderRadius] = useState(initialData.t_borderRadius || '12');
  const [t_isBold, setT_isBold] = useState(initialData.t_isBold || false);
  const [t_isItalic, setT_isItalic] = useState(initialData.t_isItalic || false);
  const [t_isUnderline, setT_isUnderline] = useState(initialData.t_isUnderline || false);

  const [a_textColor, setA_textColor] = useState(initialData.a_textColor || '#1e2246');
  const [a_boxColor, setA_boxColor] = useState(initialData.a_boxColor || '#ffffff');
  const [a_lineColor, setA_lineColor] = useState(initialData.a_lineColor || '#454d82');
  const [a_fontSize, setA_fontSize] = useState(initialData.a_fontSize || '18');
  const [a_fontFamily, setA_fontFamily] = useState(initialData.a_fontFamily || 'Montserrat');
  const [a_borderRadius, setA_borderRadius] = useState(initialData.a_borderRadius || '10');
  const [a_isBold, setA_isBold] = useState(initialData.a_isBold !== undefined ? initialData.a_isBold : true);
  const [a_isItalic, setA_isItalic] = useState(initialData.a_isItalic || false);
  const [a_isUnderline, setA_isUnderline] = useState(initialData.a_isUnderline || false);

  useEffect(() => {
    if (isOpen) {
      setTemplateText(initialData?.templateText || 'I _____ need your help. I ___ do it alone.');
      setAnswerText(initialData?.answerText || '"don\'t", "can"');
      setT_textColor(initialData?.t_textColor || '#1e2246');
      setT_boxColor(initialData?.t_boxColor || 'transparent');
      setT_lineColor(initialData?.t_lineColor || 'transparent');
      setT_fontSize(initialData?.t_fontSize || '18');
      setT_fontFamily(initialData?.t_fontFamily || 'Montserrat');
      setT_borderRadius(initialData?.t_borderRadius || '12');
      setT_isBold(initialData?.t_isBold || false);
      setT_isItalic(initialData?.t_isItalic || false);
      setT_isUnderline(initialData?.t_isUnderline || false);

      setA_textColor(initialData?.a_textColor || '#1e2246');
      setA_boxColor(initialData?.a_boxColor || '#ffffff');
      setA_lineColor(initialData?.a_lineColor || '#454d82');
      setA_fontSize(initialData?.a_fontSize || '18');
      setA_fontFamily(initialData?.a_fontFamily || 'Montserrat');
      setA_borderRadius(initialData?.a_borderRadius || '10');
      setA_isBold(initialData?.a_isBold !== undefined ? initialData.a_isBold : true);
      setA_isItalic(initialData?.a_isItalic || false);
      setA_isUnderline(initialData?.a_isUnderline || false);
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

  const setActiveTextColor = (v) => (editTarget === 'template' ? setT_textColor(v) : setA_textColor(v));
  const setActiveBoxColor = (v) => (editTarget === 'template' ? setT_boxColor(v) : setA_boxColor(v));
  const setActiveLineColor = (v) => (editTarget === 'template' ? setT_lineColor(v) : setA_lineColor(v));
  const setActiveFontSize = (v) => (editTarget === 'template' ? setT_fontSize(v) : setA_fontSize(v));
  const setActiveFontFamily = (v) => (editTarget === 'template' ? setT_fontFamily(v) : setA_fontFamily(v));
  const setActiveBorderRadius = (v) => (editTarget === 'template' ? setT_borderRadius(v) : setA_borderRadius(v));
  const setActiveIsBold = (v) => (editTarget === 'template' ? setT_isBold(v) : setA_isBold(v));
  const setActiveIsItalic = (v) => (editTarget === 'template' ? setT_isItalic(v) : setA_isItalic(v));
  const setActiveIsUnderline = (v) => (editTarget === 'template' ? setT_isUnderline(v) : setA_isUnderline(v));

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-2xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Cloze
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Fill in the Blank
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Use underscores (<span className="font-extrabold text-[#1e2246] bg-[#fff3d1] px-1.5 rounded">___</span>) to mark each blank space.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-[#454d82] tracking-widest">
              Sentence Template
            </label>
            <textarea
              rows={3}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full p-4 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm placeholder-[#626a9f]/50"
              placeholder="I _____ need your help..."
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex flex-wrap justify-between items-end gap-1">
              <label className="text-[10px] font-bold uppercase text-[#128063] tracking-widest">
                Correct Answer(s)
              </label>
              <span className="text-[10px] font-semibold text-[#626a9f]">
                Separate blanks with commas (e.g. &quot;is&quot;, &quot;Lucas&apos;&quot;)
              </span>
            </div>
            <input
              type="text"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder='"is", "is"'
              className="w-full p-4 bg-white border-2 border-[#dfe2f2] focus:border-[#16a37f] rounded-2xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm placeholder-[#626a9f]/50"
            />
          </div>

          <div className="bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col space-y-4 shadow-inner">
            <div className="flex bg-[#e8eaf7] p-1 rounded-full border border-white">
              <button
                type="button"
                className={`flex-1 text-[10.5px] font-bold py-2.5 rounded-full transition-all uppercase tracking-widest cursor-pointer ${
                  editTarget === 'template'
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246]'
                }`}
                onClick={() => setEditTarget('template')}
              >
                Edit Template
              </button>
              <button
                type="button"
                className={`flex-1 text-[10.5px] font-bold py-2.5 rounded-full transition-all uppercase tracking-widest cursor-pointer ${
                  editTarget === 'answer'
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246]'
                }`}
                onClick={() => setEditTarget('answer')}
              >
                Edit Answers
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Text Color
                </span>
                <input
                  type="color"
                  value={toHex(activeTextColor, '#1e2246')}
                  onChange={(e) => setActiveTextColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Box Color
                </span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(activeBoxColor, '#ffffff')}
                    onChange={(e) => setActiveBoxColor(e.target.value)}
                    disabled={activeBoxColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      activeBoxColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveBoxColor(activeBoxColor === 'transparent' ? '#ffffff' : 'transparent')}
                    className={`w-9 h-10 flex items-center justify-center rounded-xl border-2 text-xs transition-colors cursor-pointer ${
                      activeBoxColor === 'transparent'
                        ? 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                        : 'bg-white border-[#dfe2f2] text-[#454d82]'
                    }`}
                    title="Toggle Transparent"
                  >
                    🚫
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Line Color
                </span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(activeLineColor, '#454d82')}
                    onChange={(e) => setActiveLineColor(e.target.value)}
                    disabled={activeLineColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      activeLineColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveLineColor(activeLineColor === 'transparent' ? '#454d82' : 'transparent')}
                    className={`w-9 h-10 flex items-center justify-center rounded-xl border-2 text-xs transition-colors cursor-pointer ${
                      activeLineColor === 'transparent'
                        ? 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                        : 'bg-white border-[#dfe2f2] text-[#454d82]'
                    }`}
                    title="Toggle Transparent"
                  >
                    🚫
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Style
                </span>
                <div className="flex border-2 border-[#dfe2f2] rounded-xl overflow-hidden bg-white h-10">
                  <button
                    type="button"
                    onClick={() => setActiveIsBold(!activeIsBold)}
                    className={`flex-1 font-extrabold text-sm transition-colors cursor-pointer ${
                      activeIsBold ? 'bg-[#ffc749] text-[#1e2246]' : 'text-[#454d82] hover:bg-[#f4f6fc]'
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIsItalic(!activeIsItalic)}
                    className={`flex-1 italic text-sm border-x border-[#dfe2f2] transition-colors cursor-pointer ${
                      activeIsItalic ? 'bg-[#ffc749] text-[#1e2246]' : 'text-[#454d82] hover:bg-[#f4f6fc]'
                    }`}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIsUnderline(!activeIsUnderline)}
                    className={`flex-1 underline text-sm transition-colors cursor-pointer ${
                      activeIsUnderline ? 'bg-[#ffc749] text-[#1e2246]' : 'text-[#454d82] hover:bg-[#f4f6fc]'
                    }`}
                  >
                    U
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Font Size
                </span>
                <select
                  value={activeFontSize}
                  onChange={(e) => setActiveFontSize(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                >
                  {['12', '14', '16', '18', '20', '24', '28', '32', '36', '42'].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}px
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1.5 col-span-2">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Font</span>
                <select
                  value={activeFontFamily}
                  onChange={(e) => setActiveFontFamily(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                >
                  <option value="Montserrat">Montserrat</option>
                  <option value="Tabarra">Tabarra</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Corners
                </span>
                <input
                  type="number"
                  min="0"
                  value={activeBorderRadius}
                  onChange={(e) => setActiveBorderRadius(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none text-center"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white/75 border-t border-[#626a9f]/15 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-[#1e2246] bg-white border-2 border-[#1e2246] shadow-[0_3px_0_rgba(30,34,70,0.16)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                templateText,
                answerText,
                t_textColor,
                t_boxColor,
                t_lineColor,
                t_fontSize,
                t_fontFamily,
                t_borderRadius,
                t_isBold,
                t_isItalic,
                t_isUnderline,
                a_textColor,
                a_boxColor,
                a_lineColor,
                a_fontSize,
                a_fontFamily,
                a_borderRadius,
                a_isBold,
                a_isItalic,
                a_isUnderline,
              })
            }
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Save ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlankModal;