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
    <div className="relative w-full z-30" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-[#e6f0f9] text-outloud-blue px-4 py-3 rounded-xl text-xs md:text-sm font-montserrat font-semibold flex justify-between items-center cursor-pointer hover:bg-[#d6e6f5] transition-colors shadow-sm"
      >
        <span>{value || placeholder}</span>
        <svg className={`w-4 h-4 shrink-0 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {options.length > 0 ? (
              options.map((opt) => (
                <div 
                  key={opt} 
                  onClick={() => { onChange(opt); setIsOpen(false); }} 
                  className="px-4 py-3 text-xs md:text-sm font-montserrat text-outloud-blue hover:bg-student-yellow hover:font-bold cursor-pointer transition-colors border-b border-gray-50 last:border-none"
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs md:text-sm font-montserrat text-gray-400 italic">
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