import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_WS_PROMPT =
  '<span style="font-family: Montserrat; font-size: 18px; font-weight: bold; color: #1e2246;">WORD SEARCH: Find all the words.</span>';

const DEFAULT_WORDS = ['POLICEMAN', 'BARBER', 'CHEF'];

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const normalizeEditorHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(
    /color\s*:\s*(#ffffff|#fff|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/gi,
    'color: #1e2246'
  );
};

const WordSearchModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [promptHtml, setPromptHtml] = useState(DEFAULT_WS_PROMPT);
  const [words, setWords] = useState(DEFAULT_WORDS);

  const [textColor, setTextColor] = useState('#1e2246');
  const [cellColor, setCellColor] = useState('#ffffff');
  const [lineColor, setLineColor] = useState('#1e2246');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Montserrat');
  const [isBold, setIsBold] = useState(true);

  const [textDropdown, setTextDropdown] = useState(null);
  const promptRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const loadedPrompt = normalizeEditorHtml(initialData?.promptHtml) || DEFAULT_WS_PROMPT;
      setPromptHtml(loadedPrompt);
      setWords(initialData?.words?.length ? initialData.words : DEFAULT_WORDS);
      setTextColor(initialData?.textColor || '#1e2246');
      setCellColor(initialData?.cellColor || '#ffffff');
      setLineColor(initialData?.lineColor || '#1e2246');
      setFontSize(initialData?.fontSize || '16');
      setFontFamily(initialData?.fontFamily || 'Montserrat');
      setIsBold(initialData?.isBold !== undefined ? initialData.isBold : true);
      setTextDropdown(null);

      setTimeout(() => {
        if (promptRef.current) promptRef.current.innerHTML = loadedPrompt;
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

  const addWord = () => setWords([...words, '']);
  const removeWord = (index) => {
    if (words.length > 2) setWords(words.filter((_, i) => i !== index));
  };
  const updateWord = (index, val) => {
    setWords((prev) => prev.map((w, idx) => (idx === index ? val.toUpperCase().replace(/[^A-Z]/g, '') : w)));
  };

  const handleSave = () => {
    const finalPrompt = promptRef.current ? promptRef.current.innerHTML : promptHtml;
    const cleanWords = words.filter((w) => w.trim() !== '');
    if (cleanWords.length < 2) return alert('Please enter at least 2 words.');
    onSave({
      promptHtml: finalPrompt,
      words: cleanWords,
      textColor,
      cellColor,
      lineColor,
      fontSize,
      fontFamily,
      isBold,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-4xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Puzzle
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Word Search Generator
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Design your prompt and add target words. The engine will hide them in a letter grid.
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

        {/* Sticky Dark-Navy Formatting Bar */}
        <div className="sticky top-0 z-50 flex flex-wrap gap-2.5 items-center bg-[#1e2246] text-white px-5 py-3 border-b border-white/15 shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-[#ffc749] tracking-widest mr-1">
            Prompt Formatting:
          </span>

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
              <div className="absolute top-full left-0 mt-1.5 w-40 max-h-44 overflow-y-auto bg-white border-2 border-[#1e2246] rounded-xl shadow-xl z-[200] custom-scrollbar p-1">
                {[
                  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
                  { name: 'Tabarra', family: 'Tabarra, sans-serif' },
                  { name: 'Arial', family: 'Arial, sans-serif' },
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

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-7">
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-[#454d82] tracking-widest">
                Prompt Title
              </label>
              <div
                ref={promptRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full p-4 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl text-[#1e2246] outline-none min-h-[64px] rich-text-content shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-extrabold uppercase text-[#454d82] tracking-widest">
                Target Words
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {words.map((w, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={w}
                      onChange={(e) => updateWord(index, e.target.value)}
                      placeholder="WORD"
                      className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-extrabold uppercase tracking-widest text-[#1e2246] outline-none shadow-sm"
                    />
                    {words.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeWord(index)}
                        className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#ee665b]/15 hover:bg-[#ee665b] text-[#c93f34] hover:text-white rounded-full font-bold text-xs transition-colors cursor-pointer"
                        title="Remove Word"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addWord}
                className="mt-1 w-full py-3 bg-[#f4f6fc] hover:bg-[#fff3d1] text-[#1e2246] font-extrabold text-[11px] uppercase tracking-widest border-2 border-dashed border-[#626a9f]/40 hover:border-[#1e2246] rounded-full transition-colors cursor-pointer"
              >
                + Add Word
              </button>
            </div>
          </div>

          {/* Grid Styling */}
          <div className="w-full lg:w-72 bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col gap-4 shadow-inner shrink-0 h-fit">
            <h3 className="font-extrabold text-[#454d82] text-[10.5px] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
              Grid Styling
            </h3>

            <div className="grid grid-cols-2 gap-3.5 items-end">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Text</span>
                <input
                  type="color"
                  value={toHex(textColor, '#1e2246')}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Cell</span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(cellColor, '#ffffff')}
                    onChange={(e) => setCellColor(e.target.value)}
                    disabled={cellColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      cellColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setCellColor(cellColor === 'transparent' ? '#ffffff' : 'transparent')}
                    className={`w-9 h-10 flex items-center justify-center rounded-xl border-2 text-xs cursor-pointer ${
                      cellColor === 'transparent'
                        ? 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                        : 'bg-white border-[#dfe2f2] text-[#454d82]'
                    }`}
                    title="Toggle Transparent"
                  >
                    🚫
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                  Line Color
                </span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(lineColor, '#1e2246')}
                    onChange={(e) => setLineColor(e.target.value)}
                    disabled={lineColor === 'transparent'}
                    className={`flex-grow h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      lineColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setLineColor(lineColor === 'transparent' ? '#1e2246' : 'transparent')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 text-xs cursor-pointer ${
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

              <div className="flex flex-col gap-1.5">
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

              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Style</span>
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`w-full h-10 rounded-xl font-extrabold text-sm border-2 transition-colors cursor-pointer ${
                    isBold
                      ? 'bg-[#ffc749] text-[#1e2246] border-[#1e2246]'
                      : 'bg-white text-[#454d82] border-[#dfe2f2]'
                  }`}
                >
                  B
                </button>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">Font</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                >
                  <option value="Montserrat">Montserrat</option>
                  <option value="Tabarra">Tabarra</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            Generate ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordSearchModal;