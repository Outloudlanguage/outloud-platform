import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../SupabaseClient';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { OutLoudIcon, OutLoudHorizontalLogo } from './OutLoudBrand';

const REASON_OPTIONS = [
  'A) Para viajar',
  'B) Por mis estudios',
  'C) Por trabajo',
  'D) Para mudarme',
  'E) Por placer',
];
const FLUENT_OPTIONS = ['A) 3 meses o menos', 'B) 6 meses', 'C) 9 meses o más'];
const INTEREST_OPTIONS = [
  'A) Música',
  'B) Tecnología',
  'C) Películas',
  'D) Moda',
  'E) Viajes',
  'F) Artes',
  'G) Deportes',
];
const INVEST_OPTIONS = ['A) 3 meses o menos', 'B) 6 meses', 'C) 9 meses o más'];

const SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@outloudlanguage' },
  { name: 'Facebook', url: 'https://www.facebook.com/share/1KxawRX9vA/' },
  { name: 'Discord', url: 'https://discord.gg/847PMD2DbV' },
];

// =========================================
// LIGHT-MODE BILINGUAL DROPDOWN
// =========================================
const LightDropdown = ({ options, value, onChange, titleEng, titleSpan, hasError }) => {
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
    <div className="relative w-full mb-5" ref={dropdownRef}>
      <div className="relative z-20">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full cursor-pointer flex justify-between items-center rounded-2xl px-4 py-3 text-left text-xs font-montserrat transition-all border-2 ${
            hasError
              ? 'border-[#ee665b] bg-[#ee665b]/10 text-[#b9382d]'
              : isOpen
              ? 'border-[#626a9f] bg-white text-[#23274d] shadow-md'
              : 'border-[#dfe2f2] bg-[#f6f7fc] text-[#23274d] hover:border-[#626a9f] hover:bg-white'
          }`}
        >
          <span className={`truncate pr-2 ${value ? 'font-bold text-[#23274d]' : 'font-semibold text-[#60668a]'}`}>
            {value || titleSpan}
          </span>
          <svg
            className={`w-4 h-4 shrink-0 text-[#626a9f] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {hasError && (
          <p className="absolute -bottom-4 left-2 text-[10px] font-black text-[#ee665b] whitespace-nowrap">
            Debe completar este campo
          </p>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white border-2 border-[#23274d] rounded-2xl shadow-[0_10px_0_#23274d] overflow-hidden animate-fade-in">
          <div className="px-4 py-3 bg-[#fff3d1] border-b-2 border-[#23274d]/15">
            <p className="text-[11px] font-black text-[#23274d] leading-tight">{titleEng}</p>
            <p className="text-[10px] font-semibold text-[#60668a] leading-tight mt-0.5">{titleSpan}</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {options.map((option, idx) => {
              const selected = value === option;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#e8eaf7] last:border-none cursor-pointer ${
                    selected
                      ? 'bg-[#626a9f] text-white font-black'
                      : 'text-[#23274d] hover:bg-[#e8eaf7]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================
// REUSABLE LIGHT-MODE ONBOARDING FORM CARD
// =========================================
export function OnboardingFormCard({ onFreeTrialClick, onSuccessComplete }) {
  const [formData, setFormData] = useState(() => {
    try {
      const savedData = sessionStorage.getItem('olaRegistrationData');
      return savedData
        ? JSON.parse(savedData)
        : {
            fullName: '',
            email: '',
            phone: '',
            reason: '',
            fluentTime: '',
            interest: '',
            investTime: '',
            referralToggle: false,
            refName: '',
            refPhone: '',
          };
    } catch {
      return {
        fullName: '',
        email: '',
        phone: '',
        reason: '',
        fluentTime: '',
        interest: '',
        investTime: '',
        referralToggle: false,
        refName: '',
        refPhone: '',
      };
    }
  });

  useEffect(() => {
    sessionStorage.setItem('olaRegistrationData', JSON.stringify(formData));
  }, [formData]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const newErrors = {};
    const requiredFields = ['fullName', 'email', 'phone', 'reason', 'fluentTime', 'interest', 'investTime'];
    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = true;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError('Por favor completa todos los campos marcados antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const insertPayload = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        reason: formData.reason,
        fluent_time: formData.fluentTime,
        interest: formData.interest,
        invest_time: formData.investTime,
        status: 'pending',
      };

      const { error: supabaseError } = await supabase.from('registrations').insert([insertPayload]);
      if (supabaseError) throw supabaseError;

      sessionStorage.removeItem('olaRegistrationData');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        reason: '',
        fluentTime: '',
        interest: '',
        investTime: '',
        referralToggle: false,
        refName: '',
        refPhone: '',
      });
      setSubmitSuccess(true);
      onSuccessComplete?.();
    } catch (error) {
      console.error('Database Pipeline Error:', error.message || error);
      setSubmitError('Hubo un error al procesar la inscripción. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ola-light-phone bg-white border-2 border-[#23274d] rounded-[2.5rem] shadow-[0_14px_0_#23274d] p-6 sm:p-8 lg:p-12 relative">
      <style>{`
        .ola-light-phone .PhoneInput { display: flex; align-items: center; width: 100%; }
        .ola-light-phone .PhoneInputInput {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #23274d;
          min-width: 0;
        }
        .ola-light-phone .PhoneInputInput::placeholder { color: rgba(96, 102, 138, 0.55); }
        .ola-light-phone .PhoneInputCountry { margin-right: 10px; flex-shrink: 0; }
        .ola-light-phone .PhoneInputCountryIcon {
          width: 24px;
          height: 16px;
          border: 1px solid #dfe2f2;
          border-radius: 3px;
          overflow: hidden;
        }
        .ola-light-phone .PhoneInputCountrySelectArrow {
          width: 0.45em;
          height: 0.45em;
          margin-left: 6px;
          border-right: 2px solid #626a9f;
          border-bottom: 2px solid #626a9f;
        }
      `}</style>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-2 bg-[#fff3d1] border-2 border-[#ffc749] rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#23274d] mb-3">
          Planilla de Inscripción
        </span>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#23274d] tracking-tight uppercase">
          New Student Registration
        </h3>
        <p className="text-xs sm:text-sm text-[#60668a] font-medium mt-2">
          Completa tus datos y metas para que un asesor de OutLoud active tu cuenta vía WhatsApp.
        </p>
      </div>

      {submitSuccess ? (
        <div className="bg-[#f6f7fc] border-2 border-[#16a37f] rounded-[2rem] p-8 sm:p-10 text-center max-w-xl mx-auto animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#16a37f] text-white flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-md">
            ✓
          </div>
          <h4 className="text-2xl font-black text-[#23274d] uppercase mb-2">
            ¡Inscripción Enviada!
          </h4>
          <p className="text-sm text-[#60668a] font-medium leading-relaxed mb-6">
            Tu planilla ingresó correctamente a nuestro sistema. Un agente administrativo se pondrá en contacto contigo vía WhatsApp muy pronto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onFreeTrialClick && (
              <button
                type="button"
                onClick={onFreeTrialClick}
                className="ola-btn-yellow w-full sm:w-auto px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer"
              >
                Probar Clase Gratis →
              </button>
            )}
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="ola-btn-outline w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              Enviar Otra Planilla
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* COLUMN 1: PERSONAL INFO */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-7 h-7 rounded-lg bg-[#ffc749] border-2 border-[#23274d] text-[#23274d] text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              <h4 className="text-xs font-black text-[#626a9f] uppercase tracking-widest">
                Section 1: Personal Info
              </h4>
            </div>

            {/* Full Name */}
            <div className="mb-5 relative">
              <label className="block text-xs font-black text-[#23274d] mb-1.5">
                Full name <span className="font-semibold text-[#60668a]">(Nombre completo)</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Ej. María González"
                className={`w-full rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-colors border-2 ${
                  errors.fullName
                    ? 'border-[#ee665b] bg-[#ee665b]/10 text-[#b9382d]'
                    : 'border-[#dfe2f2] bg-[#f6f7fc] text-[#23274d] focus:border-[#626a9f] focus:bg-white'
                }`}
              />
              {errors.fullName && (
                <p className="absolute -bottom-4 left-2 text-[10px] font-black text-[#ee665b]">
                  Debe completar este campo
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5 relative">
              <label className="block text-xs font-black text-[#23274d] mb-1.5">
                Email address <span className="font-semibold text-[#60668a]">(Correo electrónico)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@correo.com"
                className={`w-full rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-colors border-2 ${
                  errors.email
                    ? 'border-[#ee665b] bg-[#ee665b]/10 text-[#b9382d]'
                    : 'border-[#dfe2f2] bg-[#f6f7fc] text-[#23274d] focus:border-[#626a9f] focus:bg-white'
                }`}
              />
              {errors.email && (
                <p className="absolute -bottom-4 left-2 text-[10px] font-black text-[#ee665b]">
                  Debe completar este campo
                </p>
              )}
            </div>

            {/* WhatsApp / Phone */}
            <div className="mb-5 relative">
              <label className="block text-xs font-black text-[#23274d] mb-1.5">
                WhatsApp / Phone <span className="font-semibold text-[#60668a]">(Teléfono)</span>
              </label>
              <div
                className={`w-full rounded-2xl px-4 py-2.5 transition-colors border-2 ${
                  errors.phone
                    ? 'border-[#ee665b] bg-[#ee665b]/10'
                    : 'border-[#dfe2f2] bg-[#f6f7fc] focus-within:border-[#626a9f] focus-within:bg-white'
                }`}
              >
                <PhoneInput
                  defaultCountry="VE"
                  international
                  placeholder="+58 412 000 0000"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                />
              </div>
              {errors.phone && (
                <p className="absolute -bottom-4 left-2 text-[10px] font-black text-[#ee665b]">
                  Debe completar este campo
                </p>
              )}
            </div>
          </div>

          {/* COLUMN 2: COURSE GOALS */}
          <div className="flex flex-col lg:border-l-2 lg:border-r-2 lg:border-[#e8eaf7] lg:px-8">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-7 h-7 rounded-lg bg-[#626a9f] border-2 border-[#23274d] text-white text-xs font-black flex items-center justify-center shrink-0">
                2
              </span>
              <h4 className="text-xs font-black text-[#626a9f] uppercase tracking-widest">
                Section 2: Course Goals
              </h4>
            </div>

            <LightDropdown
              titleEng="Why do you want to learn English?"
              titleSpan="¿Por qué quieres aprender inglés?"
              options={REASON_OPTIONS}
              value={formData.reason}
              onChange={(val) => handleInputChange('reason', val)}
              hasError={errors.reason}
            />
            <LightDropdown
              titleEng="You expect to be fluent in..."
              titleSpan="¿En cuánto tiempo te gustaría hablar fluido?"
              options={FLUENT_OPTIONS}
              value={formData.fluentTime}
              onChange={(val) => handleInputChange('fluentTime', val)}
              hasError={errors.fluentTime}
            />
            <LightDropdown
              titleEng="Select one interest category"
              titleSpan="Selecciona 1 Interés"
              options={INTEREST_OPTIONS}
              value={formData.interest}
              onChange={(val) => handleInputChange('interest', val)}
              hasError={errors.interest}
            />
            <LightDropdown
              titleEng="How much time can you invest?"
              titleSpan="¿De cuánto tiempo dispones para aprender?"
              options={INVEST_OPTIONS}
              value={formData.investTime}
              onChange={(val) => handleInputChange('investTime', val)}
              hasError={errors.investTime}
            />

            {/* Optional Referral Drawer */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, referralToggle: !prev.referralToggle }))}
                className="w-full cursor-pointer flex justify-between items-center rounded-2xl bg-[#e8eaf7]/70 hover:bg-[#e8eaf7] border-2 border-[#dfe2f2] px-4 py-3 text-xs font-bold text-[#23274d] transition-colors"
              >
                <span>Quiero recomendar este curso a alguien</span>
                <svg
                  className={`w-4 h-4 text-[#626a9f] transition-transform duration-200 ${
                    formData.referralToggle ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {formData.referralToggle && (
                <div className="mt-3 flex flex-col gap-2.5 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Nombre del referido"
                    value={formData.refName}
                    onChange={(e) => handleInputChange('refName', e.target.value)}
                    className="w-full rounded-2xl bg-[#f6f7fc] border-2 border-[#dfe2f2] focus:border-[#626a9f] focus:bg-white px-4 py-2.5 text-xs font-semibold text-[#23274d] outline-none"
                  />
                  <div className="w-full rounded-2xl bg-[#f6f7fc] border-2 border-[#dfe2f2] focus-within:border-[#626a9f] focus-within:bg-white px-4 py-2">
                    <PhoneInput
                      defaultCountry="VE"
                      international
                      placeholder="Teléfono del referido"
                      value={formData.refPhone}
                      onChange={(value) => handleInputChange('refPhone', value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: CONFIRMATION & ACTIONS */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-lg bg-[#e8eaf7] border-2 border-[#23274d] text-[#23274d] text-xs font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <h4 className="text-xs font-black text-[#626a9f] uppercase tracking-widest">
                  Confirmación
                </h4>
              </div>

              <div className="bg-[#f6f7fc] border-2 border-[#dfe2f2] rounded-2xl p-5 space-y-3 mb-6">
                <p className="text-xs text-[#60668a] font-medium leading-relaxed">
                  Al hacer clic en <strong className="font-black text-[#23274d]">ENVIAR</strong>, tu planilla ingresará al sistema y un{' '}
                  <strong className="font-black text-[#23274d]">agente se pondrá en contacto contigo</strong> a través de WhatsApp para explicarte los planes, confirmar tu cohorte y formalizar tu inscripción.
                </p>
                <p className="text-xs text-[#60668a] font-medium leading-relaxed">
                  Asegúrate de que tu correo y número de WhatsApp sean correctos.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {submitError && (
                <div className="bg-[#ee665b]/10 border-2 border-[#ee665b] text-[#b9382d] rounded-xl px-4 py-2.5 text-xs font-bold text-center">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="ola-btn-yellow w-full py-4 rounded-full font-black tracking-widest text-xs uppercase cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando Planilla...' : 'Submit / Enviar Inscripción →'}
              </button>

              {onFreeTrialClick && (
                <button
                  type="button"
                  onClick={onFreeTrialClick}
                  className="ola-btn-outline w-full py-3.5 rounded-full font-black tracking-widest text-xs uppercase cursor-pointer"
                >
                  Free Trial / Prueba Gratis
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

// =========================================
// MAIN EXPORT: STAGE 4 + STAGE 5 + FOOTER
// =========================================
export default function LandingTrialAndEnroll({
  onFreeLessonClick,
  onPlacementClick,
  onScrollTo,
  onOpenLogin,
}) {
  return (
    <>
      {/* ================================================== */}
      {/* STAGE 4: FREE LESSON & PLACEMENT TEST GATEWAY      */}
      {/* ================================================== */}
      <section id="free-trial" className="py-16 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* PRIMARY CARD: FREE INTERACTIVE LESSON */}
            <div className="lg:col-span-7 bg-[#fff3d1] border-2 border-[#23274d] rounded-[2.5rem] p-7 sm:p-10 shadow-[0_10px_0_#23274d] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#ffc749]/45 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white border-2 border-[#23274d] rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#23274d] mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-pulse" />
                  <span>Experiencia Interactiva Sin Registro</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-[#23274d] tracking-tight leading-tight mb-4">
                  Prueba una lección real <span className="text-[#626a9f]">ahora mismo</span>
                </h2>

                <p className="text-sm sm:text-base text-[#23274d]/80 font-medium leading-relaxed mb-7 max-w-xl">
                  Entra como invitado a nuestra Unidad 1 de Nivel A1. Escucha audio nativo, graba tu voz con nuestro motor de comparación instantánea y comprueba por ti mismo cómo se siente estudiar en OutLoud.
                </p>

                <div className="flex flex-wrap gap-2.5 mb-8">
                  {['Audio Nativo', 'Práctica Vocal', 'Ejercicios Interactivos', '100% Gratis'].map((pill) => (
                    <span
                      key={pill}
                      className="text-[11px] font-black uppercase tracking-wider bg-white/85 border border-[#23274d]/20 text-[#23274d] px-3 py-1.5 rounded-xl"
                    >
                      ✓ {pill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onFreeLessonClick}
                  className="ola-btn-yellow w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Iniciar Clase de Prueba</span>
                  <span>▶</span>
                </button>
              </div>
            </div>

            {/* SECONDARY CARD: PLACEMENT TEST */}
            <div className="lg:col-span-5 bg-[#626a9f] border-2 border-[#23274d] rounded-[2.5rem] p-7 sm:p-10 text-white shadow-[0_10px_0_#23274d] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-2 bg-[#23274d]/40 border border-white/20 rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#ffc749]">
                    Evaluación Diagnóstica
                  </span>
                  <OutLoudIcon className="w-12 h-12 shrink-0" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3">
                  ¿Ya sabes algo de inglés?
                </h3>

                <p className="text-sm text-white/85 font-medium leading-relaxed mb-6">
                  Realiza nuestro <strong className="text-[#ffc749] font-black">Placement Test</strong> en línea para medir tu nivel CEFR real (A1–C2) y ubicarte en la unidad exacta donde debes comenzar.
                </p>

                <ul className="space-y-2 text-xs font-semibold text-white/85 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#ffc749] text-[#23274d] font-black text-[10px] flex items-center justify-center">✓</span>
                    Evaluación escrita rápida + entrevista oral
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#ffc749] text-[#23274d] font-black text-[10px] flex items-center justify-center">✓</span>
                    Resultados revisados por instructores reales
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onPlacementClick}
                className="relative z-10 w-full py-4 rounded-full bg-white hover:bg-[#ffc749] text-[#23274d] border-2 border-[#23274d] shadow-[0_4px_0_#23274d] active:translate-y-0.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Tomar Placement Test →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* STAGE 5: EMBEDDED ONBOARDING FORM (#enroll)        */}
      {/* ================================================== */}
      <section id="enroll" className="py-16 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <OnboardingFormCard onFreeTrialClick={onFreeLessonClick} />
        </div>
      </section>

      {/* ================================================== */}
      {/* LIGHT-MODE BRAND FOOTER & SOCIALS                  */}
      {/* ================================================== */}
      <footer className="bg-white border-t-2 border-[#dfe2f2] pt-14 pb-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b-2 border-[#e8eaf7]">
            {/* Brand Column */}
            <div className="md:col-span-5 flex flex-col items-start">
              <OutLoudHorizontalLogo iconClass="w-11 h-11" wordmarkClass="h-9 w-auto" />
              <p className="text-xs sm:text-sm text-[#60668a] font-medium leading-relaxed mt-4 max-w-sm">
                Plataforma académica de inmersión en inglés con lecciones interactivas 24/7, clases en vivo y comunidad estudiantil moderada.
              </p>
              <a
                href="https://wa.me/584226885683"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fff3d1] hover:bg-[#ffc749] border-2 border-[#23274d] text-[#23274d] text-xs font-black uppercase tracking-wider transition-colors"
              >
                <span>💬</span>
                <span>Soporte WhatsApp</span>
              </a>
            </div>

            {/* Quick Navigation */}
            <div className="md:col-span-3">
              <h5 className="text-xs font-black uppercase tracking-widest text-[#23274d] mb-4">
                Explorar
              </h5>
              <ul className="space-y-2.5 text-xs font-bold text-[#60668a]">
                {[
                  { label: 'Método & Cursos', href: '#method' },
                  { label: 'Ciclo de Estudio', href: '#cycle' },
                  { label: 'Niveles CEFR', href: '#levels' },
                  { label: 'Planes & Costos', href: '#plans' },
                  { label: 'Inscripción', href: '#enroll' },
                ].map((item) => (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => onScrollTo?.(item.href)}
                      className="hover:text-[#626a9f] transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials & Campus Access */}
            <div className="md:col-span-4 flex flex-col justify-between gap-6">
              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-[#23274d] mb-4">
                  Comunidad &amp; Redes
                </h5>
                <div className="flex flex-wrap gap-2.5">
                  {SOCIAL_LINKS.map((soc) => (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full bg-[#f6f7fc] hover:bg-[#626a9f] text-[#23274d] hover:text-white border-2 border-[#dfe2f2] hover:border-[#23274d] text-xs font-black uppercase tracking-wider transition-all"
                    >
                      {soc.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-[#f6f7fc] border-2 border-[#dfe2f2] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#23274d]">¿Ya eres estudiante?</p>
                  <p className="text-[11px] font-medium text-[#60668a]">Accede a tu Hub ahora.</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="ola-btn-yellow px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest cursor-pointer shrink-0"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-bold text-[#60668a]">
            <span>© {new Date().getFullYear()} OutLoud Language Academy. All rights reserved.</span>
            <span className="uppercase tracking-widest text-[#626a9f]">outloudlanguage.com</span>
          </div>
        </div>
      </footer>
    </>
  );
}