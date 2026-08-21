import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// =========================================
// 0. SHARED DROPDOWN COMPONENT (FIXED)
// =========================================
const CustomDropdown = ({
  options,
  value,
  onChange,
  titleEng,
  titleSpan,
  hasError,
}) => {
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
    <div className="relative w-full mb-4" ref={dropdownRef}>
      {/* Added 'relative' here so the absolute dropdown menu respects this container's width */}
      <div className="relative z-20">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full cursor-pointer flex justify-between items-center rounded-full px-4 py-2.5 text-[11px] lg:text-xs font-montserrat transition-all duration-300 border ${
            hasError
              ? 'animate-error-blink border-red-500/50 bg-red-500/10 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
              : 'border-white/10 bg-white/5 text-white hover:bg-white/10 shadow-inner'
          }`}
        >
          <span className="truncate pr-2">{value || titleSpan}</span>
          <svg
            className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {hasError && (
          <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-400 animate-text-blink whitespace-nowrap z-10">
            Debe completar este campo
          </p>
        )}
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out absolute w-full z-50 ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100 mt-2'
            : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="w-full bg-[#070b19]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 cursor-default shrink-0">
              <p className="text-[11px] lg:text-xs font-bold text-[#fcd34d] leading-tight mb-0.5 tracking-wide">
                {titleEng}
              </p>
              <p className="text-[10px] lg:text-[11px] text-white/60 leading-tight">
                {titleSpan}
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2.5 text-[11px] lg:text-xs font-montserrat text-white/90 hover:bg-white/10 hover:text-[#fcd34d] cursor-pointer transition-colors border-b border-white/5 last:border-none"
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 1. MOBILE REGISTRATION UI
// =========================================
const MobileRegistration = ({
  formData, setFormData, errors, isSubmitting, devMessage,
  handleInputChange, handleSubmit, onReturnHome, onFreeTrialClick,
  reasonOptions, fluentOptions, interestOptions, investOptions
}) => {
  return (
    <div className="relative min-h-screen w-full font-sans bg-[#070b19] text-white overflow-y-auto overflow-x-hidden flex flex-col p-4">
      
      {/* Neon Wavy Background Simulation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/30 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[90px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      {/* COMPACT MOBILE HEADER */}
      <div className="relative z-10 flex flex-row justify-between items-center w-full mb-6 shrink-0">
        <div className="flex items-center">
          <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 object-contain shrink-0 opacity-90 drop-shadow-md" />
        </div>
        <button onClick={onReturnHome} className="flex items-center space-x-1.5 text-white/90 font-bold font-montserrat hover:text-[#fcd34d] transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[10px] uppercase tracking-wide">Home</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </button>
      </div>

      {/* MOBILE FORM CARD - overflow-hidden removed to allow dropdowns to pop out */}
      <div className="relative z-10 flex-grow w-full bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/20 p-5 flex flex-col mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[2rem]"></div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 overflow-hidden">
          <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Watermark" className="w-64 h-64 object-contain invert brightness-0" />
        </div>

        <div className="text-center mb-6 shrink-0 relative z-10">
          <h1 className="text-xl font-black text-white font-montserrat tracking-wide leading-tight drop-shadow-md">
            NEW STUDENT<br />REGISTRATION
          </h1>
          <p className="text-[10px] text-[#fcd34d] font-bold font-montserrat mt-1 uppercase tracking-widest">
            (Planilla de Inscripción)
          </p>
        </div>

        <div className="flex flex-col space-y-8 flex-grow relative z-10">
          {/* SECTION 1 */}
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-[#fcd34d] font-montserrat tracking-widest mb-4">
              SECTION 1: PERSONAL INFO
            </h3>

            <div className="mb-4 relative">
              <label className="block text-[11px] font-bold text-white/90 font-montserrat mb-1">
                Full name: <span className="font-normal text-white/60">(Nombre completo:)</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full rounded-full px-4 py-2.5 text-[11px] font-montserrat outline-none transition-all border shadow-inner ${
                  errors.fullName ? 'animate-error-blink border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/10 bg-white/5 text-white focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d]'
                }`}
              />
              {errors.fullName && <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-400 animate-text-blink">Debe completar este campo</p>}
            </div>

            <div className="mb-4 relative">
              <label className="block text-[11px] font-bold text-white/90 font-montserrat mb-1">
                Email address: <span className="font-normal text-white/60">(Correo electrónico:)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full rounded-full px-4 py-2.5 text-[11px] font-montserrat outline-none transition-all border shadow-inner ${
                  errors.email ? 'animate-error-blink border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/10 bg-white/5 text-white focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d]'
                }`}
              />
              {errors.email && <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-400 animate-text-blink">Debe completar este campo</p>}
            </div>

            <div className="mb-4 relative">
              <label className="block text-[11px] font-bold text-white/90 font-montserrat mb-1">
                Whatsapp/phone number:
              </label>
              <div className={`w-full rounded-full px-4 py-2 text-[11px] font-montserrat transition-all border shadow-inner ${
                errors.phone ? 'animate-error-blink border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/10 bg-white/5 text-white focus-within:border-[#fcd34d] focus-within:ring-1 focus-within:ring-[#fcd34d]'
              }`}>
                <PhoneInput defaultCountry="VE" international value={formData.phone} onChange={(value) => handleInputChange('phone', value)} />
              </div>
              {errors.phone && <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-400 animate-text-blink">Debe completar este campo</p>}
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-[#fcd34d] font-montserrat tracking-widest mb-4 whitespace-nowrap">
              SECTION 2: COURSE GOALS
            </h3>

            <CustomDropdown titleEng="Why do you want to learn English?" titleSpan="¿Por qué quieres aprender inglés?" options={reasonOptions} value={formData.reason} onChange={(val) => handleInputChange('reason', val)} hasError={errors.reason} />
            <CustomDropdown titleEng="You expect to be fluent in..." titleSpan="¿En cuánto tiempo te gustaría hablar fluido?" options={fluentOptions} value={formData.fluentTime} onChange={(val) => handleInputChange('fluentTime', val)} hasError={errors.fluentTime} />
            <CustomDropdown titleEng="Select one interest category" titleSpan="Selecciona 1 Interés" options={interestOptions} value={formData.interest} onChange={(val) => handleInputChange('interest', val)} hasError={errors.interest} />
            <CustomDropdown titleEng="How much time can you invest?" titleSpan="¿De cuánto tiempo dispones para aprender?" options={investOptions} value={formData.investTime} onChange={(val) => handleInputChange('investTime', val)} hasError={errors.investTime} />

            <div className="mt-2 relative z-10">
              <div onClick={() => setFormData((prev) => ({ ...prev, referralToggle: !prev.referralToggle }))} className="w-full cursor-pointer flex justify-between items-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 text-[11px] font-montserrat text-white transition-all duration-300 mb-2 shadow-inner">
                <span>Quiero recomendar a alguien</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${formData.referralToggle ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>

              <div className={`grid transition-all duration-300 ease-in-out ${formData.referralToggle ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden flex flex-col space-y-2">
                  <input type="text" placeholder="Nombre del referido" value={formData.refName} onChange={(e) => handleInputChange('refName', e.target.value)} className="w-full rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-[10px] font-montserrat text-white placeholder-white/40 outline-none focus:border-[#fcd34d] transition-colors shadow-inner" />
                  <div className="w-full rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-montserrat text-white focus-within:border-[#fcd34d] transition-all shadow-inner">
                    <PhoneInput defaultCountry="VE" international placeholder="Teléfono del referido" value={formData.refPhone} onChange={(value) => handleInputChange('refPhone', value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BUTTONS */}
          <div className="flex flex-col flex-grow justify-between">
            <div className="flex flex-col space-y-4 pt-2">
              <p className="text-[11px] text-white/80 font-montserrat text-justify leading-relaxed">
                Al hacer click en <strong className="font-black text-white">ENVIAR</strong>, un <strong className="font-black text-white">agente se pondrá en contacto contigo</strong> a través de Whatsapp para formalizar tu inscripción.
              </p>
            </div>

            <div className="flex flex-col space-y-3 mt-6 relative">
              {devMessage && (
                <div className="absolute -top-12 w-full text-center bg-red-500/20 border border-red-500/50 text-red-200 text-[10px] font-bold p-2 rounded-lg font-montserrat shadow-sm z-20 backdrop-blur-md">
                  {devMessage}
                </div>
              )}
              <button type="button" onClick={onFreeTrialClick} className="w-full bg-white/10 border border-white/20 text-white font-black tracking-widest font-montserrat py-3 rounded-full shadow-lg hover:bg-white/20 transition-colors text-[10px] active:scale-95 uppercase">
                FREE TRIAL / PRUEBA GRATIS
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#fcd34d] text-[#08203e] font-black tracking-widest font-montserrat py-3.5 rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] transition-all text-[11px] active:scale-95 disabled:opacity-70 uppercase">
                {isSubmitting ? 'ENVIANDO...' : 'SUBMIT / ENVIAR'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 2. DESKTOP REGISTRATION UI
// =========================================
const DesktopRegistration = ({
  formData, setFormData, errors, isSubmitting, devMessage,
  handleInputChange, handleSubmit, onReturnHome, onFreeTrialClick,
  reasonOptions, fluentOptions, interestOptions, investOptions
}) => {
  return (
    <div className="relative min-h-screen w-full font-sans bg-[#070b19] text-white overflow-y-auto overflow-x-hidden flex flex-col p-4 md:p-8">
      
      {/* Neon Wavy Background Simulation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      {/* Desktop Header */}
      <div className="relative z-10 flex flex-row justify-between items-center w-full max-w-[90rem] mx-auto mb-6 shrink-0">
        <div className="flex items-center">
          <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-10 lg:h-12 object-contain shrink-0 opacity-90 drop-shadow-md" />
          <div className="mx-4 h-8 w-[2px] bg-white/30 shrink-0"></div>
          <span className="text-base lg:text-xl font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide">Online Platform</span>
        </div>

        <button onClick={onReturnHome} className="flex items-center space-x-2 text-white font-bold font-montserrat hover:text-[#fcd34d] transition-colors z-50 shrink-0 ml-4">
          <svg className="flex-none w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="flex-none text-xs md:text-sm lg:text-base whitespace-nowrap uppercase tracking-wider">Return Home</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="flex-none w-5 h-5 md:w-6 md:h-6">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </svg>
        </button>
      </div>

      {/* Main Glassmorphism Form Container - overflow-hidden removed to allow dropdowns to pop out */}
      <div className="relative z-10 flex-grow w-full max-w-[90rem] mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 lg:p-10 flex flex-col mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[2.5rem]"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0 overflow-hidden">
          <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Watermark" className="w-[500px] h-[500px] object-contain invert brightness-0" />
        </div>

        <div className="text-center mb-10 shrink-0 relative z-10">
          <h1 className="text-3xl lg:text-4xl font-black text-white font-montserrat tracking-widest drop-shadow-md">NEW STUDENT REGISTRATION</h1>
          <p className="text-sm lg:text-base text-[#fcd34d] font-bold font-montserrat mt-2 uppercase tracking-widest">(Planilla de Inscripción)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 flex-grow relative z-10">
          {/* COLUMN 1 */}
          <div className="flex flex-col">
            <h3 className="text-xs lg:text-sm font-black text-[#fcd34d] font-montserrat tracking-widest mb-6">SECTION 1: PERSONAL INFO</h3>

            <div className="mb-4 relative">
              <label className="block text-[11px] lg:text-xs font-bold text-white/90 font-montserrat mb-1.5 tracking-wide">
                Full name:<br /><span className="font-medium text-white/60">(Nombre completo:)</span>
              </label>
              <input type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className={`w-full rounded-full px-4 py-3 text-[11px] lg:text-xs font-montserrat outline-none transition-all shadow-inner border ${errors.fullName ? 'animate-error-blink border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/10 bg-white/5 text-white focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d]'}`} />
              {errors.fullName && <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-400 animate-text-blink">Debe completar este campo</p>}
            </div>

            <div className="mb-4 relative">
              <label className="block text-[11px] lg:text-xs font-bold text-white/90 font-montserrat mb-1.5 tracking-wide">
                Email address:<br /><span className="font-medium text-white/60">(Correo electrónico:)</span>
              </label>
              <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`w-full rounded-full px-4 py-3 text-[11px] lg:text-xs font-montserrat outline-none transition-all shadow-inner border ${errors.email ? 'animate-error-blink border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/10 bg-white/5 text-white focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d]'}`} />
              {errors.email && <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-400 animate-text-blink">Debe completar este campo</p>}
            </div>

            <div className="mb-4 relative">
              <label className="block text-[11px] lg:text-xs font-bold text-white/90 font-montserrat mb-1.5 tracking-wide">
                Whatsapp/phone number:<br /><span className="font-medium text-white/60">(Número de teléfono/Whatsapp:)</span>
              </label>
              <div className={`w-full rounded-full px-4 py-2.5 text-[11px] lg:text-xs font-montserrat transition-all shadow-inner border ${errors.phone ? 'animate-error-blink border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/10 bg-white/5 text-white focus-within:border-[#fcd34d] focus-within:ring-1 focus-within:ring-[#fcd34d]'}`}>
                <PhoneInput defaultCountry="VE" international value={formData.phone} onChange={(value) => handleInputChange('phone', value)} />
              </div>
              {errors.phone && <p className="absolute -bottom-4 left-4 text-[9px] font-bold text-red-400 animate-text-blink">Debe completar este campo</p>}
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col md:border-l md:border-r border-white/10 md:px-8 lg:px-12">
            <h3 className="text-xs lg:text-sm font-black text-[#fcd34d] font-montserrat tracking-widest mb-6 whitespace-nowrap">
              SECTION 2: COURSE GOALS<br /><span className="font-medium text-[#fcd34d]/60 tracking-normal">(METAS PARA EL CURSO)</span>
            </h3>

            <CustomDropdown titleEng="Why do you want to learn English?" titleSpan="¿Por qué quieres aprender inglés?" options={reasonOptions} value={formData.reason} onChange={(val) => handleInputChange('reason', val)} hasError={errors.reason} />
            <CustomDropdown titleEng="You expect to be fluent in..." titleSpan="¿En cuánto tiempo te gustaría hablar fluido?" options={fluentOptions} value={formData.fluentTime} onChange={(val) => handleInputChange('fluentTime', val)} hasError={errors.fluentTime} />
            <CustomDropdown titleEng="Select one interest category" titleSpan="Selecciona 1 Interés" options={interestOptions} value={formData.interest} onChange={(val) => handleInputChange('interest', val)} hasError={errors.interest} />
            <CustomDropdown titleEng="How much time can you invest?" titleSpan="¿De cuánto tiempo dispones para aprender?" options={investOptions} value={formData.investTime} onChange={(val) => handleInputChange('investTime', val)} hasError={errors.investTime} />

            <div className="mt-2 relative z-10">
              <div onClick={() => setFormData((prev) => ({ ...prev, referralToggle: !prev.referralToggle }))} className="w-full cursor-pointer flex justify-between items-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-3 text-[11px] lg:text-xs font-montserrat text-white transition-all duration-300 mb-2 shadow-inner">
                <span>Quiero recomendar este curso a alguien</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${formData.referralToggle ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>

              <div className={`grid transition-all duration-300 ease-in-out ${formData.referralToggle ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden flex flex-col space-y-2">
                  <input type="text" placeholder="Nombre del referido" value={formData.refName} onChange={(e) => handleInputChange('refName', e.target.value)} className="w-full rounded-full bg-white/5 border border-white/10 px-4 py-3 text-[10px] lg:text-[11px] font-montserrat text-white placeholder-white/40 outline-none focus:border-[#fcd34d] transition-colors shadow-inner" />
                  <div className="w-full rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-[10px] lg:text-[11px] font-montserrat text-white focus-within:border-[#fcd34d] transition-all shadow-inner">
                    <PhoneInput defaultCountry="VE" international placeholder="Teléfono del referido" value={formData.refPhone} onChange={(value) => handleInputChange('refPhone', value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: INFORMATION & BUTTONS */}
          <div className="flex flex-col flex-grow justify-between">
            <div className="flex flex-col space-y-4 pt-4 md:pt-10">
              <p className="text-[12px] lg:text-[13px] text-white/80 font-montserrat text-justify leading-relaxed">
                Al hacer click en <strong className="font-black text-white">ENVIAR</strong>, tu planilla ingresará en el sistema, y un <strong className="font-black text-white">agente se pondrá en contacto contigo</strong> a través de Whatsapp, te explicará los planes y costos y te ayudará a formalizar tu inscripción.
              </p>
              <p className="text-[12px] lg:text-[13px] text-white/80 font-montserrat text-justify leading-relaxed">
                Asegúrate de que todos tus datos de contacto sean correctos.
              </p>
            </div>

            <div className="flex flex-col space-y-4 mt-10 lg:mt-auto relative">
              {devMessage && (
                <div className="absolute -top-14 w-full text-center bg-red-500/20 border border-red-500/50 text-red-200 text-[10px] lg:text-[11px] font-bold p-2.5 rounded-lg font-montserrat shadow-sm z-20 backdrop-blur-md">
                  {devMessage}
                </div>
              )}
              <button type="button" onClick={onFreeTrialClick} className="w-full bg-white/10 border border-white/20 text-white font-black tracking-widest font-montserrat py-3.5 lg:py-4 rounded-full shadow-lg hover:bg-white/20 transition-colors text-xs lg:text-sm active:scale-95 uppercase">
                FREE TRIAL / PRUEBA GRATIS
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#fcd34d] text-[#08203e] font-black tracking-widest font-montserrat py-3.5 lg:py-4 rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all text-xs lg:text-sm active:scale-95 disabled:opacity-70 uppercase">
                {isSubmitting ? 'ENVIANDO...' : 'SUBMIT / ENVIAR'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 3. THE ROUTER (Main Page Component)
// =========================================
const RegistrationPage = ({ onReturnHome, onFreeTrialClick }) => {
  const [isMobile, setIsMobile] = useState(false);
  const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1534265478179196928/8R96hVzk1NqYi_F-dAzTpeUjnJa5DyXSFWQ338FQGwnKK9FztZt5l7ECE2bZcqhS0fwb';

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', reason: '', fluentTime: '', interest: '', investTime: '', referralToggle: false, refName: '', refPhone: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devMessage, setDevMessage] = useState('');
  const devTimerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!devMessage) return;
    const handleGlobalClick = () => {
      setDevMessage('');
      if (devTimerRef.current) clearTimeout(devTimerRef.current);
    };
    const delayTimer = setTimeout(() => { window.addEventListener('click', handleGlobalClick); }, 50);
    return () => { clearTimeout(delayTimer); window.removeEventListener('click', handleGlobalClick); };
  }, [devMessage]);

  const reasonOptions = ['A) Para viajar', 'B) Por mis estudios', 'C) Por trabajo', 'D) Para mudarme', 'E) Por placer'];
  const fluentOptions = ['A) 3 meses o menos', 'B) 6 meses', 'C) 9 meses o más'];
  const interestOptions = ['A) Música', 'B) Tecnología', 'C) Películas', 'D) Moda', 'E) Viajes', 'F) Artes', 'G) Deportes'];
  const investOptions = ['A) 3 meses o menos', 'B) 6 meses', 'C) 9 meses o más'];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    const requiredFields = ['fullName', 'email', 'phone', 'reason', 'fluentTime', 'interest', 'investTime'];
    requiredFields.forEach((field) => { if (!formData[field]) newErrors[field] = true; });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      // INJECTED DATA: Now explicitly includes invest_time to prevent the 500 rejection error
      const insertPayload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        fluent_time: formData.fluentTime,
        interest: formData.interest,
        invest_time: formData.investTime,
        status: 'pending' 
      };

      const { data: supabaseData, error: supabaseError } = await supabase
        .from('registrations')
        .insert([insertPayload])
        .select('id')
        .single();
        
      if (supabaseError) throw supabaseError;
      const formattedSubmissionId = `Submission #${String(supabaseData.id).padStart(3, '0')}`;

      const discordPayload = {
        username: 'OLA Registry Hub',
        avatar_url: 'https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png',
        embeds: [{
          title: `🎓 Nuevo Estudiante Registrado | ${formattedSubmissionId}`,
          description: `Se ha recibido una nueva planilla de inscripción de **${formData.fullName}**.`,
          color: 1461973,
          fields: [
            { name: '👤 SECTION 1: PERSONAL INFO', value: `**Email:** ${formData.email}\n**WhatsApp:** ${formData.phone}`, inline: false },
            { name: '🎯 SECTION 2: COURSE GOALS', value: `**Motivo:** ${formData.reason.substring(3)}\n**Meta de fluidez:** ${formData.fluentTime.substring(3)}\n**Interés principal:** ${formData.interest.substring(3)}\n**Tiempo disponible:** ${formData.investTime.substring(3)}`, inline: false },
          ],
          footer: { text: 'Outloud Language Academy • Official Registry', icon_url: 'https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png' },
          timestamp: new Date().toISOString(),
        }],
      };

      if (formData.referralToggle && (formData.refName || formData.refPhone)) {
        discordPayload.embeds[0].fields.push({ name: '🤝 REFERRAL INFO', value: `**Refirió a:** ${formData.refName || 'N/A'}\n**Teléfono del referido:** ${formData.refPhone || 'N/A'}`, inline: false });
      }

      await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discordPayload) });
      alert('¡Inscripción enviada con éxito! / Registration submitted successfully!');
      onReturnHome();
    } catch (error) {
      console.error('Database or Discord Pipeline Error:', error);
      alert('Hubo un error al procesar la inscripción. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logicProps = {
    formData, setFormData, errors, isSubmitting, devMessage,
    handleInputChange, handleSubmit, onReturnHome, onFreeTrialClick,
    reasonOptions, fluentOptions, interestOptions, investOptions
  };

  return (
    <>
      <style>{`
        @keyframes blink-bg { 0%, 100% { background-color: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); } 50% { background-color: rgba(239,68,68,0.1); box-shadow: inset 0 0 0 2px rgba(239,68,68,0.5); } }
        @keyframes blink-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .animate-error-blink { animation: blink-bg 1s infinite; }
        .animate-text-blink { animation: blink-text 1s infinite; }
        /* Make Phone Input styling compatible with Dark Glassmorphism */
        .PhoneInput { display: flex; align-items: center; width: 100%; }
        .PhoneInputInput { flex: 1; background: transparent; border: none; outline: none; font-family: 'Montserrat', sans-serif; font-size: inherit; color: white; min-width: 0; }
        .PhoneInputInput::placeholder { color: rgba(255, 255, 255, 0.3); }
        .PhoneInputCountry { margin-right: 12px; flex-shrink: 0; }
        .PhoneInputCountryIcon { width: 24px; height: 16px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 2px; overflow: hidden; }
        .PhoneInputCountrySelectArrow { width: 0.4em; height: 0.4em; margin-left: 6px; border-right: 1.5px solid white; border-bottom: 1.5px solid white; opacity: 0.7; }
        
        /* Custom scrollbar for dark dropdowns */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>
      {isMobile ? <MobileRegistration {...logicProps} /> : <DesktopRegistration {...logicProps} />}
    </>
  );
};

export default RegistrationPage;