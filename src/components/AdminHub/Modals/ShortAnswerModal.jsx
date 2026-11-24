import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_QUESTION_HTML =
  '<span style="font-family: Montserrat; font-size: 16px; font-weight: 600; color: #1e2246;">Type your question here...</span>';

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const normalizeEditorHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(
    /color\s*:\s*(#ffffff|#fff|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/gi,
    'color: #1e2246'
  );
};

const ShortAnswerModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [questionHtml, setQuestionHtml] = useState(DEFAULT_QUESTION_HTML);
  const [targetAnswer, setTargetAnswer] = useState('');
  const [boxColor, setBoxColor] = useState('#ffffff');
  const [lineColor, setLineColor] = useState('#dfe2f2');
  const [textColor, setTextColor] = useState('#1e2246');
  const [borderRadius, setBorderRadius] = useState('12');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Montserrat');
  const [textDropdown, setTextDropdown] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const loadedHtml = normalizeEditorHtml(initialData?.questionHtml) || DEFAULT_QUESTION_HTML;
      setQuestionHtml(loadedHtml);
      setTargetAnswer(initialData?.targetAnswer || initialData?.correctAnswer || '');
      setBoxColor(initialData?.boxColor || '#ffffff');
      setLineColor(initialData?.lineColor || '#dfe2f2');
      setTextColor(initialData?.textColor || '#1e2246');
      setBorderRadius(initialData?.borderRadius || '12');
      setFontSize(initialData?.fontSize || '16');
      setFontFamily(initialData?.fontFamily || 'Montserrat');
      setTextDropdown(null);

      setTimeout(() => {
        if (editorRef.current) editorRef.current.innerHTML = loadedHtml;
      }, 30);
    }
  }, [isOpen, initialData]);

  const handleFormat = (command, value = null) => {
    if (command === 'fontSizePx') {
      document.execCommand('fontSize', false, '7');
      const fonts = document.querySelectorAll('font[size="7"]');
      fonts.forEach((f) => {
        f.removeAttribute('size');
        f.style.fontSize = `${value}px`;
      });
    } else {
      document.execCommand(command, false, value);
    }
  };

  const handleSave = () => {
    const finalHtml = editorRef.current ? editorRef.current.innerHTML : questionHtml;
    onSave({
      questionHtml: finalHtml,
      targetAnswer,
      correctAnswer: targetAnswer,
      boxColor,
      lineColor,
      textColor,
      borderRadius,
      fontSize,
      fontFamily,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-2xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Written
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Short Answer
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Design the question prompt and define the hidden target answer for grading.
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
          {/* Rich Text Prompt */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase text-[#454d82] tracking-widest mb-2">
              Question Text
            </label>

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
                title="Text Color"
              />

              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setTextDropdown(textDropdown === 'size' ? null : 'size')}
                  className="px-3 py-1.5 border border-white/25 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20"
                >
                  Size <span className="text-[10px] text-[#ffc749]">▼</span>
                </button>
                {textDropdown === 'size' && (
                  <div className="absolute top-full left-0 mt-1.5 w-20 max-h-44 overflow-y-auto bg-white border-2 border-[#1e2246] rounded-xl shadow-xl z-[200] custom-scrollbar p-1">
                    {[12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48].map((sz) => (
                      <div
                        key={sz}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleFormat('fontSizePx', sz);
                          setTextDropdown(null);
                        }}
                        className="px-2 py-1.5 rounded-lg hover:bg-[#ffc749] cursor-pointer text-xs font-bold text-[#1e2246] text-center"
                      >
                        {sz}px
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setTextDropdown(textDropdown === 'font' ? null : 'font')}
                  className="px-3 py-1.5 border border-white/25 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 w-28 justify-between"
                >
                  Font <span className="text-[10px] text-[#ffc749]">▼</span>
                </button>
                {textDropdown === 'font' && (
                  <div className="absolute top-full left-0 mt-1.5 w-44 max-h-44 overflow-y-auto bg-white border-2 border-[#1e2246] rounded-xl shadow-xl z-[200] custom-scrollbar p-1">
                    {[
                      { name: 'Montserrat', family: 'Montserrat, sans-serif' },
                      { name: 'Tabarra', family: 'Tabarra, sans-serif' },
                      { name: 'Arial', family: 'Arial, sans-serif' },
                      { name: 'Times New Roman', family: '"Times New Roman", serif' },
                      { name: 'Courier New', family: '"Courier New", monospace' },
                    ].map((f) => (
                      <div
                        key={f.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleFormat('fontName', f.family);
                          setTextDropdown(null);
                        }}
                        className="px-3 py-1.5 rounded-lg hover:bg-[#ffc749] cursor-pointer text-xs font-bold text-[#1e2246]"
                        style={{ fontFamily: f.family }}
                      >
                        {f.name}
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
              className="w-full p-4 bg-white border-2 border-t-0 border-[#dfe2f2] focus:border-[#454d82] rounded-b-2xl text-[#1e2246] outline-none overflow-y-auto min-h-[84px] max-h-36 rich-text-content shadow-sm"
            />
          </div>

          {/* Target Answer */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-[#128063] tracking-widest">
              Target Answer (Hidden from Student)
            </label>
            <input
              type="text"
              value={targetAnswer}
              onChange={(e) => setTargetAnswer(e.target.value)}
              placeholder="Type the exact expected answer here..."
              className="w-full p-4 bg-white border-2 border-[#dfe2f2] focus:border-[#16a37f] rounded-2xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm placeholder-[#626a9f]/50"
            />
          </div>

          {/* Student Input Box Styling */}
          <div className="bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col space-y-4 shadow-inner">
            <h3 className="font-extrabold text-[#454d82] text-[10.5px] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
              Student Input Box Styling
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Text</span>
                <input
                  type="color"
                  value={toHex(textColor, '#1e2246')}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Box</span>
                <div className="flex gap-1 items-center">
                  <input
                    type="color"
                    value={toHex(boxColor, '#ffffff')}
                    onChange={(e) => setBoxColor(e.target.value)}
                    disabled={boxColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      boxColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setBoxColor(boxColor === 'transparent' ? '#ffffff' : 'transparent')}
                    className={`w-9 h-10 flex items-center justify-center rounded-xl border-2 text-xs cursor-pointer ${
                      boxColor === 'transparent'
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
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Line</span>
                <div className="flex gap-1 items-center">
                  <input
                    type="color"
                    value={toHex(lineColor, '#dfe2f2')}
                    onChange={(e) => setLineColor(e.target.value)}
                    disabled={lineColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      lineColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setLineColor(lineColor === 'transparent' ? '#dfe2f2' : 'transparent')}
                    className={`w-9 h-10 flex items-center justify-center rounded-xl border-2 text-xs cursor-pointer ${
                      lineColor === 'transparent'
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
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Size</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                >
                  {['12', '14', '16', '18', '20', '24'].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}px
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Corners
                </span>
                <input
                  type="number"
                  min="0"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
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
            onClick={handleSave}
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Save ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortAnswerModal;