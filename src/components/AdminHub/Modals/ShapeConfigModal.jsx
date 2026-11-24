import React, { useState, useEffect } from 'react';

const toHex = (val, fallback) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback);

const ShapeConfigModal = ({ isOpen, initialData = {}, onSave, onCancel }) => {
  const [shapeType, setShapeType] = useState(initialData.shapeType || 'rect');
  const [fillColor, setFillColor] = useState(initialData.fillColor || '#ffc749');
  const [strokeColor, setStrokeColor] = useState(initialData.strokeColor || '#1e2246');
  const [strokeWidth, setStrokeWidth] = useState(initialData.strokeWidth || '3');
  const [roundness, setRoundness] = useState(initialData.roundness || '12');
  const [opacity, setOpacity] = useState(initialData.opacity || '100');

  useEffect(() => {
    if (isOpen) {
      setShapeType(initialData?.shapeType || 'rect');
      setFillColor(initialData?.fillColor || '#ffc749');
      setStrokeColor(initialData?.strokeColor || '#1e2246');
      setStrokeWidth(initialData?.strokeWidth || '3');
      setRoundness(initialData?.roundness || '12');
      setOpacity(initialData?.opacity || '100');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const previewFill = fillColor === 'transparent' ? 'none' : fillColor;
  const previewStroke = strokeColor === 'transparent' ? 'none' : strokeColor;
  const previewStrokeW = Math.min(12, Math.max(0, Number(strokeWidth) || 0));
  const previewOpacity = Math.min(100, Math.max(10, Number(opacity) || 100)) / 100;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <div className="w-full max-w-2xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-0.5 rounded-full mb-1">
              Content Studio • Vector
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Shape Generator
            </h2>
            <p className="text-[#4c5384] text-xs mt-1 font-medium">
              Configure your custom vector shape below.
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

        <div className="p-6 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
          {/* Live Vector Preview Well */}
          <div className="w-full h-32 rounded-3xl bg-[#f4f6fc] border border-white shadow-inner flex items-center justify-center">
            <svg viewBox="0 0 180 96" className="w-44 h-24" style={{ opacity: previewOpacity }}>
              {shapeType === 'rect' && (
                <rect
                  x="24"
                  y="16"
                  width="132"
                  height="64"
                  rx={Math.min(32, Number(roundness) || 0)}
                  fill={previewFill}
                  stroke={previewStroke}
                  strokeWidth={previewStrokeW}
                />
              )}
              {shapeType === 'circle' && (
                <ellipse
                  cx="90"
                  cy="48"
                  rx="56"
                  ry="34"
                  fill={previewFill}
                  stroke={previewStroke}
                  strokeWidth={previewStrokeW}
                />
              )}
              {shapeType === 'triangle' && (
                <polygon
                  points="90,14 150,82 30,82"
                  fill={previewFill}
                  stroke={previewStroke}
                  strokeWidth={previewStrokeW}
                  strokeLinejoin="round"
                />
              )}
              {shapeType === 'arrow' && (
                <polygon
                  points="22,36 112,36 112,18 158,48 112,78 112,60 22,60"
                  fill={previewFill}
                  stroke={previewStroke}
                  strokeWidth={previewStrokeW}
                  strokeLinejoin="round"
                />
              )}
              {shapeType === 'line' && (
                <line
                  x1="22"
                  y1="48"
                  x2="158"
                  y2="48"
                  stroke={previewStroke === 'none' ? '#1e2246' : previewStroke}
                  strokeWidth={Math.max(2, previewStrokeW)}
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 items-end bg-[#f4f6fc] p-5 rounded-3xl border border-white shadow-inner">
            <div className="flex flex-col space-y-1.5 col-span-2 md:col-span-1">
              <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                Shape Type
              </span>
              <select
                value={shapeType}
                onChange={(e) => setShapeType(e.target.value)}
                className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
              >
                <option value="rect">Square / Rectangle</option>
                <option value="circle">Circle / Ellipse</option>
                <option value="triangle">Triangle</option>
                <option value="arrow">Arrow</option>
                <option value="line">Line</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                Fill Color
              </span>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={toHex(fillColor, '#ffc749')}
                  onChange={(e) => setFillColor(e.target.value)}
                  disabled={fillColor === 'transparent' || shapeType === 'line'}
                  className={`flex-grow h-11 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                    fillColor === 'transparent' || shapeType === 'line' ? 'opacity-40' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setFillColor(fillColor === 'transparent' ? '#ffc749' : 'transparent')}
                  disabled={shapeType === 'line'}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 text-xs transition-colors cursor-pointer disabled:opacity-40 ${
                    fillColor === 'transparent'
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
                Outline Color
              </span>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={toHex(strokeColor, '#1e2246')}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  disabled={strokeColor === 'transparent'}
                  className={`flex-grow h-11 rounded-xl cursor-pointer bg-white border-2 border-[#dfe2f2] p-1 ${
                    strokeColor === 'transparent' ? 'opacity-40' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setStrokeColor(strokeColor === 'transparent' ? '#1e2246' : 'transparent')}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 text-xs transition-colors cursor-pointer ${
                    strokeColor === 'transparent'
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
                Line Thickness
              </span>
              <input
                type="number"
                min="0"
                max="50"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(e.target.value)}
                disabled={strokeColor === 'transparent'}
                className={`w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-bold text-[#1e2246] outline-none text-center ${
                  strokeColor === 'transparent' ? 'opacity-40' : ''
                }`}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                Roundness (px)
              </span>
              <input
                type="number"
                min="0"
                max="200"
                value={roundness}
                onChange={(e) => setRoundness(e.target.value)}
                disabled={shapeType === 'circle' || shapeType === 'line'}
                className={`w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-bold text-[#1e2246] outline-none text-center ${
                  shapeType === 'circle' || shapeType === 'line' ? 'opacity-40' : ''
                }`}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-wider text-center">
                Opacity (%)
              </span>
              <input
                type="number"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(e.target.value)}
                className="w-full p-2.5 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-bold text-[#1e2246] outline-none text-center"
              />
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
            onClick={() => onSave({ shapeType, fillColor, strokeColor, strokeWidth, roundness, opacity })}
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Save ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShapeConfigModal;