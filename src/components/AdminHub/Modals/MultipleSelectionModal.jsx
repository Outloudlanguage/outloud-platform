import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_PROMPT_HTML =
  '<span style="font-family: Montserrat; font-size: 18px; font-weight: bold; color: #1e2246;">Type your prompt here...</span>';

const DEFAULT_OPTIONS = [
  { id: 1, html: '<span style="color: #1e2246;">Option A</span>', isCorrect: false },
  { id: 2, html: '<span style="color: #1e2246;">Option B</span>', isCorrect: false },
  { id: 3, html: '<span style="color: #1e2246;">Option C</span>', isCorrect: true },
  { id: 4, html: '<span style="color: #1e2246;">Option D</span>', isCorrect: false },
];

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const normalizeEditorHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(
    /color\s*:\s*(#ffffff|#fff|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/gi,
    'color: #1e2246'
  );
};

const MultipleSelectionModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [promptType, setPromptType] = useState('text');
  const [promptUrl, setPromptUrl] = useState('');
  const [promptHtml, setPromptHtml] = useState(DEFAULT_PROMPT_HTML);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [optBoxColor, setOptBoxColor] = useState('#ffffff');
  const [optLineColor, setOptLineColor] = useState('#dfe2f2');
  const [optBorderRadius, setOptBorderRadius] = useState('16');
  const [textDropdown, setTextDropdown] = useState(null);

  const promptRef = useRef(null);
  const optionsRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      const loadPromptType = initialData?.promptType || 'text';
      const loadPromptUrl = initialData?.promptUrl || '';
      const loadPromptHtml = normalizeEditorHtml(initialData?.promptHtml) || DEFAULT_PROMPT_HTML;

      const loadOptions =
        initialData?.options && initialData.options.length > 0
          ? initialData.options.map((o) => ({ ...o, html: normalizeEditorHtml(o.html) }))
          : DEFAULT_OPTIONS;

      setPromptType(loadPromptType);
      setPromptUrl(loadPromptUrl);
      setPromptHtml(loadPromptHtml);
      setOptions(loadOptions);
      setOptBoxColor(initialData?.optBoxColor || '#ffffff');
      setOptLineColor(initialData?.optLineColor || '#dfe2f2');
      setOptBorderRadius(initialData?.optBorderRadius || '16');
      setTextDropdown(null);

      setTimeout(() => {
        if (loadPromptType === 'text' && promptRef.current) {
          promptRef.current.innerHTML = loadPromptHtml;
        }
        loadOptions.forEach((opt) => {
          if (optionsRefs.current[opt.id]) {
            optionsRefs.current[opt.id].innerHTML = opt.html;
          }
        });
      }, 50);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen && promptType === 'text' && promptRef.current) {
      if (!promptRef.current.innerHTML) promptRef.current.innerHTML = promptHtml;
    }
  }, [promptType, isOpen, promptHtml]);

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

  const addOption = () => {
    if (options.length < 6) {
      const newId = Date.now();
      const nextNum = options.length + 1;
      const newHtml = `<span style="color: #1e2246;">Option ${nextNum}</span>`;
      setOptions([...options, { id: newId, html: newHtml, isCorrect: false }]);
      setTimeout(() => {
        if (optionsRefs.current[newId]) optionsRefs.current[newId].innerHTML = newHtml;
      }, 50);
    }
  };

  const removeOption = (id) => {
    if (options.length > 2) {
      setOptions(options.filter((o) => o.id !== id));
      delete optionsRefs.current[id];
    }
  };

  const toggleCorrect = (id) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));
  };

  const handleSave = () => {
    const finalPromptHtml = promptType === 'text' && promptRef.current ? promptRef.current.innerHTML : promptHtml;
    const finalOptions = options.map((opt) => ({
      ...opt,
      html: optionsRefs.current[opt.id] ? optionsRefs.current[opt.id].innerHTML : opt.html,
    }));
    onSave({
      promptType,
      promptUrl,
      promptHtml: finalPromptHtml,
      options: finalOptions,
      optBoxColor,
      optLineColor,
      optBorderRadius,
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
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Quiz
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Multiple Selection
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Create a prompt and up to 6 rich-text answers. Mark one or more correct choices.
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
            Formatting:
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
              className="px-3 py-1.5 border border-white/25 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors"
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
              className="px-3 py-1.5 border border-white/25 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors w-28 justify-between"
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

          <span className="text-[10px] text-white/65 italic ml-auto hidden md:inline">
            Highlight text below &amp; click tools to format
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {/* Prompt Section */}
          <div className="bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col gap-3.5 shadow-inner">
            <div className="flex justify-between items-center border-b border-[#626a9f]/15 pb-3">
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#454d82]">
                Prompt Type
              </span>
              <div className="flex gap-1 bg-[#e8eaf7] p-1 rounded-full border border-white">
                <button
                  type="button"
                  onClick={() => setPromptType('text')}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    promptType === 'text' ? 'bg-[#1e2246] text-[#ffc749]' : 'text-[#454d82] hover:text-[#1e2246]'
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setPromptType('image')}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    promptType === 'image' ? 'bg-[#1e2246] text-[#ffc749]' : 'text-[#454d82] hover:text-[#1e2246]'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {promptType === 'image' ? (
              <input
                type="text"
                value={promptUrl}
                onChange={(e) => setPromptUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-4 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl text-sm font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50"
              />
            ) : (
              <div
                ref={promptRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full p-4 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl outline-none min-h-[92px] rich-text-content text-[#1e2246] shadow-sm"
              />
            )}
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#454d82]">
                Possible Answers
              </h3>
              <button
                type="button"
                onClick={addOption}
                disabled={options.length >= 6}
                className="text-[10px] font-extrabold uppercase tracking-widest bg-[#e8eaf7] hover:bg-[#ffc749] text-[#1e2246] border border-[#1e2246]/20 hover:border-[#1e2246] px-4 py-2 rounded-full transition-colors disabled:opacity-40 cursor-pointer"
              >
                + Add Option ({options.length}/6)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, index) => {
                const letter = String.fromCharCode(65 + index);
                return (
                  <div
                    key={opt.id}
                    className={`relative rounded-2xl p-4 flex flex-col gap-3 border-2 transition-all ${
                      opt.isCorrect
                        ? 'bg-[#e7faf3] border-[#16a37f] shadow-sm'
                        : 'bg-[#f4f6fc] border-white focus-within:border-[#454d82] shadow-inner'
                    }`}
                  >
                    <div className="flex justify-between items-center border-b border-[#626a9f]/15 pb-2">
                      <span className="inline-flex items-center gap-2 text-[10px] font-extrabold text-[#1e2246] uppercase tracking-widest">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold ${
                            opt.isCorrect ? 'bg-[#16a37f] text-white' : 'bg-[#1e2246] text-[#ffc749]'
                          }`}
                        >
                          {letter}
                        </span>
                        Option {index + 1}
                      </span>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={() => toggleCorrect(opt.id)}
                          className="w-4 h-4 accent-[#16a37f] rounded cursor-pointer"
                        />
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            opt.isCorrect ? 'text-[#128063]' : 'text-[#626a9f]'
                          }`}
                        >
                          {opt.isCorrect ? 'Correct ✓' : 'Mark Correct'}
                        </span>
                      </label>
                    </div>

                    <div
                      ref={(el) => {
                        optionsRefs.current[opt.id] = el;
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full p-3 bg-white border border-[#dfe2f2] focus:border-[#454d82] rounded-xl outline-none min-h-[56px] rich-text-content text-[#1e2246] text-sm font-semibold"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(opt.id)}
                        className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-[#ee665b] text-white rounded-full border-2 border-white flex items-center justify-center hover:brightness-110 shadow-md text-xs font-bold cursor-pointer"
                        title="Remove Option"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pill Styling */}
          <div className="bg-[#f4f6fc] p-5 rounded-3xl border border-white flex flex-col md:flex-row gap-5 items-center shadow-inner">
            <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#454d82] whitespace-nowrap">
              Pill Style:
            </span>

            <div className="flex gap-5 items-end flex-wrap w-full">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider">Box</span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(optBoxColor, '#ffffff')}
                    onChange={(e) => setOptBoxColor(e.target.value)}
                    disabled={optBoxColor === 'transparent'}
                    className={`w-12 h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      optBoxColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setOptBoxColor(optBoxColor === 'transparent' ? '#ffffff' : 'transparent')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 text-xs cursor-pointer ${
                      optBoxColor === 'transparent'
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
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider">Outline</span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={toHex(optLineColor, '#dfe2f2')}
                    onChange={(e) => setOptLineColor(e.target.value)}
                    disabled={optLineColor === 'transparent'}
                    className={`w-12 h-10 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                      optLineColor === 'transparent' ? 'opacity-40' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setOptLineColor(optLineColor === 'transparent' ? '#dfe2f2' : 'transparent')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 text-xs cursor-pointer ${
                      optLineColor === 'transparent'
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
                <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider">Corners (px)</span>
                <input
                  type="number"
                  min="0"
                  value={optBorderRadius}
                  onChange={(e) => setOptBorderRadius(e.target.value)}
                  className="w-20 h-10 p-2 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-bold text-[#1e2246] outline-none text-center"
                />
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
            Save ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultipleSelectionModal;