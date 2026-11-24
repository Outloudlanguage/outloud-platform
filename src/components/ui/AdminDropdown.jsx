import React, { useState, useEffect, useRef } from 'react';

const AdminDropdown = ({ placeholder, options = [], value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full z-50 font-montserrat" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex justify-between items-center cursor-pointer transition-all text-left border-2 ${
          isOpen
            ? 'bg-white border-[#1e2246] shadow-[0_3px_0_#1e2246]'
            : 'bg-white/95 hover:bg-white border-[#dfe2f2] hover:border-[#626a9f] shadow-sm'
        }`}
      >
        <span
          className={
            value
              ? 'text-[#1e2246] font-extrabold tracking-tight truncate'
              : 'text-[#626a9f] font-bold tracking-widest uppercase text-[10.5px] truncate'
          }
        >
          {value || placeholder}
        </span>

        <span
          className={`w-6 h-6 rounded-full shrink-0 ml-2 flex items-center justify-center transition-all duration-200 ${
            isOpen
              ? 'bg-[#ffc749] text-[#1e2246] border border-[#1e2246] rotate-180'
              : 'bg-[#f4f6fc] text-[#454d82]'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_8px_0_rgba(30,34,70,0.08),0_20px_38px_-12px_rgba(30,34,70,0.28)] border-2 border-[#1e2246] overflow-hidden z-[90]">
          <div className="max-h-56 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5">
            {options.length > 0 ? (
              options.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#fff3d1] text-[#1e2246] font-extrabold'
                        : 'text-[#3b4170] hover:bg-[#ffc749] hover:text-[#1e2246]'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center text-[10px] font-extrabold shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-[#626a9f] text-center">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;