import React, { useState, useEffect, useRef } from 'react';

const AdminDropdown = ({ placeholder, options, value, onChange }) => {
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
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`bg-black/20 text-white border px-5 py-3.5 rounded-xl text-xs md:text-sm font-semibold flex justify-between items-center cursor-pointer transition-all shadow-inner ${isOpen ? 'border-[#fcd34d] bg-white/5' : 'border-white/20 hover:bg-white/10 hover:border-white/30'}`}
      >
        <span className={value ? 'text-white font-bold tracking-wide' : 'text-white/50 tracking-wider uppercase text-[10px]'}>{value || placeholder}</span>
        <svg className={`w-4 h-4 shrink-0 ml-2 transition-transform duration-300 text-[#fcd34d] ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-[#070b19]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden z-50 animate-fade-in">
          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {options.length > 0 ? (
              options.map((opt) => (
                <div 
                  key={opt} 
                  onClick={() => { onChange(opt); setIsOpen(false); }} 
                  className="px-5 py-3.5 text-xs md:text-sm font-semibold text-white/80 hover:bg-[#fcd34d] hover:text-[#08203e] hover:font-black cursor-pointer transition-all border-b border-white/10 last:border-none"
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/40 italic text-center">
                No options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;