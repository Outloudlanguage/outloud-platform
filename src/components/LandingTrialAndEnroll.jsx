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

// =========================================
// MINI-RETO GRAMATICAL (2 PALABRAS FALTANTES)
// =========================================
const GRAMMAR_SENTENCE = {
  before: 'They',
  after: 'English together right now.',
  fullCorrect: 'They are speaking English together right now.',
};

const MINI_TRIAL_OPTIONS = [
  { id: 'a', text: 'are speaking', isCorrect: true },
  { id: 'b', text: 'is speaking', isCorrect: false },
  { id: 'c', text: 'are speak', isCorrect: false },
];

// =========================================
// EXPLORADOR RÁPIDO CEFR (CARD PRUEBA DE NIVELACIÓN)
// =========================================
const DIAGNOSTIC_BANDS = [
  { id: 'A1', pct: 18, ielts: '0.0 – 2.0', canDo: 'Te presentas y manejas saludos o pedidos simples.' },
  { id: 'A2', pct: 36, ielts: '2.5 – 4.0', canDo: 'Resuelves compras, viajes y hablas de tu rutina.' },
  { id: 'B1', pct: 56, ielts: '4.5 – 5.0', canDo: 'Opinas y cuentas experiencias sin traducir mentalmente.' },
  { id: 'B2', pct: 74, ielts: '5.5 – 6.5', canDo: 'Conversas con fluidez en reuniones y charlas abiertas.' },
  { id: 'C1', pct: 88, ielts: '7.0 – 8.0', canDo: 'Argumentas temas complejos con precisión ejecutiva.' },
  { id: 'C2', pct: 100, ielts: '8.5 – 9.0', canDo: 'Dominas modismos, humor y sutilezas como nativo.' },
];

// =========================================
// CUSTOM VECTOR ICONS (Cero emojis genéricos)
// =========================================
const CheckSvg = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const PlaySvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5.14v14l11-7-11-7z" />
  </svg>
);

const VolumeSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const WhatsAppSvg = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@outloudlanguage',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/share/1KxawRX9vA/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
      </svg>
    ),
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/847PMD2DbV',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

// =========================================
// DESPLEGABLE ESPACIAL EN ESPAÑOL (FLASK PATTERN)
// =========================================
const LightDropdown = ({ options, value, onChange, titleSpan, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmingIdx, setConfirmingIdx] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSelect = (option, idx) => {
    setConfirmingIdx(idx);
    onChange(option);
    setTimeout(() => {
      setConfirmingIdx(null);
      setIsOpen(false);
    }, 115);
  };

  return (
    <div className={`relative w-full mb-5 ${isOpen ? 'z-[60]' : 'z-10'}`} ref={dropdownRef}>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#1e2246]/15 backdrop-blur-[1px] z-40 transition-opacity duration-150"
          aria-hidden="true"
        />
      )}

      <div className="relative z-50">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full cursor-pointer flex justify-between items-center rounded-2xl px-4 py-3 text-left text-xs font-montserrat transition-all duration-150 ease-out active:scale-[0.985] border-2 ${
            hasError
              ? 'border-[#ee665b] bg-[#ee665b]/10 text-[#b9382d]'
              : isOpen
              ? 'border-[#454d82] bg-white text-[#1e2246] shadow-lg'
              : 'border-white/90 bg-white/65 text-[#1e2246] hover:border-[#626a9f] hover:bg-white/90'
          }`}
        >
          <span className={`truncate pr-2 ${value ? 'font-bold text-[#1e2246]' : 'font-semibold text-[#50567d]'}`}>
            {value || titleSpan}
          </span>
          <svg
            className={`w-4 h-4 shrink-0 text-[#454d82] transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
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
        <div
          className="ola-dropdown-spring absolute left-0 right-0 mt-2 z-50 bg-white/96 backdrop-blur-2xl border-2 border-[#1e2246] rounded-2xl shadow-[0_18px_38px_-10px_rgba(30,34,70,0.4)] overflow-hidden"
          style={{ transformOrigin: 'top center' }}
        >
          <div className="px-4 py-3 bg-[#fff3d1] border-b border-[#1e2246]/15">
            <p className="text-[11px] font-black text-[#1e2246] leading-tight">{titleSpan}</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {options.map((option, idx) => {
              const selected = value === option;
              const isFlashing = confirmingIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(option, idx)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-100 border-b border-[#e8eaf7] last:border-none cursor-pointer flex items-center justify-between ${
                    isFlashing
                      ? 'bg-[#ffc749] text-[#1e2246] font-black'
                      : selected
                      ? 'bg-[#454d82] text-white font-black'
                      : 'text-[#1e2246] hover:bg-[#e8eaf7]'
                  }`}
                >
                  <span>{option}</span>
                  {(selected || isFlashing) && <CheckSvg className="w-3.5 h-3.5 shrink-0" />}
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
// PLANILLA DE INSCRIPCIÓN (100% EN ESPAÑOL)
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

      const [{ error: supabaseError }] = await Promise.all([
        supabase.from('registrations').insert([insertPayload]),
        new Promise((resolve) => setTimeout(resolve, 650)),
      ]);
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
    <div className="relative">
      <div
        className="absolute -inset-4 rounded-[3.2rem] blur-3xl opacity-75 -z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(125deg, rgba(255,199,73,0.48) 0%, rgba(121,131,196,0.48) 55%, rgba(98,106,159,0.52) 100%)',
        }}
      />

      <div className="ola-light-phone ola-glass rounded-[2.5rem] p-6 sm:p-8 lg:p-12 relative">
        <style>{`
          @keyframes olaDropdownSpring {
            0% { opacity: 0; transform: translateY(-6px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .ola-dropdown-spring {
            animation: olaDropdownSpring 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .ola-light-phone .PhoneInput { display: flex; align-items: center; width: 100%; }
          .ola-light-phone .PhoneInputInput {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.75rem;
            font-weight: 600;
            color: #1e2246;
            min-width: 0;
          }
          .ola-light-phone .PhoneInputInput::placeholder { color: rgba(80, 86, 125, 0.6); }
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
            border-right: 2px solid #454d82;
            border-bottom: 2px solid #454d82;
          }
        `}</style>

        {/* Encabezado 100% en español */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="ola-glass-yellow inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#1e2246] mb-3">
            Planilla de Inscripción
          </span>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1e2246] tracking-tight uppercase">
            Inscripción de Nuevo Estudiante
          </h3>
          <p className="text-xs sm:text-sm text-[#4c5384] font-medium mt-2">
            Completa tus datos y metas para que un asesor de OutLoud te contacte vía WhatsApp, aclare tus dudas y active tu cuenta.
          </p>
        </div>

        {submitSuccess ? (
          <div className="bg-white/75 backdrop-blur-xl border-2 border-[#16a37f] rounded-[2rem] p-8 sm:p-10 text-center max-w-xl mx-auto animate-fade-in shadow-lg">
            <div className="w-16 h-16 rounded-full bg-[#16a37f] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <CheckSvg className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-[#1e2246] uppercase mb-2">
              ¡Inscripción Enviada!
            </h4>
            <p className="text-sm text-[#4c5384] font-medium leading-relaxed mb-6">
              Tu planilla ingresó correctamente a nuestro sistema. Un asesor de OutLoud se pondrá en contacto contigo vía WhatsApp muy pronto.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onFreeTrialClick && (
                <button
                  type="button"
                  onClick={onFreeTrialClick}
                  className="ola-btn-yellow w-full sm:w-auto px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Probar Clase Gratis</span>
                  <ArrowRightSvg className="w-4 h-4" />
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
            {/* COLUMNA 1: DATOS PERSONALES */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-lg bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] text-xs font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <h4 className="text-xs font-black text-[#454d82] uppercase tracking-widest">
                  Sección 1: Datos Personales
                </h4>
              </div>

              <div className="mb-5 relative">
                <label className="block text-xs font-black text-[#1e2246] mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Ej. María González"
                  className={`w-full rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-colors border-2 ${
                    errors.fullName
                      ? 'border-[#ee665b] bg-[#ee665b]/10 text-[#b9382d]'
                      : 'border-white/90 bg-white/65 text-[#1e2246] focus:border-[#454d82] focus:bg-white'
                  }`}
                />
                {errors.fullName && (
                  <p className="absolute -bottom-4 left-2 text-[10px] font-black text-[#ee665b]">
                    Debe completar este campo
                  </p>
                )}
              </div>

              <div className="mb-5 relative">
                <label className="block text-xs font-black text-[#1e2246] mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@correo.com"
                  className={`w-full rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-colors border-2 ${
                    errors.email
                      ? 'border-[#ee665b] bg-[#ee665b]/10 text-[#b9382d]'
                      : 'border-white/90 bg-white/65 text-[#1e2246] focus:border-[#454d82] focus:bg-white'
                  }`}
                />
                {errors.email && (
                  <p className="absolute -bottom-4 left-2 text-[10px] font-black text-[#ee665b]">
                    Debe completar este campo
                  </p>
                )}
              </div>

              <div className="mb-5 relative">
                <label className="block text-xs font-black text-[#1e2246] mb-1.5">
                  WhatsApp / Teléfono
                </label>
                <div
                  className={`w-full rounded-2xl px-4 py-2.5 transition-colors border-2 ${
                    errors.phone
                      ? 'border-[#ee665b] bg-[#ee665b]/10'
                      : 'border-white/90 bg-white/65 focus-within:border-[#454d82] focus-within:bg-white'
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

            {/* COLUMNA 2: METAS DEL CURSO */}
            <div className="flex flex-col lg:border-l lg:border-r lg:border-white/70 lg:px-8">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-lg bg-[#454d82] border-2 border-[#1e2246] text-white text-xs font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="text-xs font-black text-[#454d82] uppercase tracking-widest">
                  Sección 2: Metas del Curso
                </h4>
              </div>

              <LightDropdown
                titleSpan="¿Por qué quieres aprender inglés?"
                options={REASON_OPTIONS}
                value={formData.reason}
                onChange={(val) => handleInputChange('reason', val)}
                hasError={errors.reason}
              />
              <LightDropdown
                titleSpan="¿En cuánto tiempo te gustaría hablar fluido?"
                options={FLUENT_OPTIONS}
                value={formData.fluentTime}
                onChange={(val) => handleInputChange('fluentTime', val)}
                hasError={errors.fluentTime}
              />
              <LightDropdown
                titleSpan="Selecciona 1 tema de interés"
                options={INTEREST_OPTIONS}
                value={formData.interest}
                onChange={(val) => handleInputChange('interest', val)}
                hasError={errors.interest}
              />
              <LightDropdown
                titleSpan="¿De cuánto tiempo dispones para aprender?"
                options={INVEST_OPTIONS}
                value={formData.investTime}
                onChange={(val) => handleInputChange('investTime', val)}
                hasError={errors.investTime}
              />

              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, referralToggle: !prev.referralToggle }))}
                  className="w-full cursor-pointer flex justify-between items-center rounded-2xl bg-white/60 hover:bg-white/90 border-2 border-white/90 px-4 py-3 text-xs font-bold text-[#1e2246] transition-colors"
                >
                  <span>Quiero recomendar este curso a alguien</span>
                  <svg
                    className={`w-4 h-4 text-[#454d82] transition-transform duration-200 ${
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
                      className="w-full rounded-2xl bg-white/70 border-2 border-white/90 focus:border-[#454d82] focus:bg-white px-4 py-2.5 text-xs font-semibold text-[#1e2246] outline-none"
                    />
                    <div className="w-full rounded-2xl bg-white/70 border-2 border-white/90 focus-within:border-[#454d82] focus-within:bg-white px-4 py-2">
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

            {/* COLUMNA 3: CONFIRMACIÓN */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-white border-2 border-[#1e2246] text-[#1e2246] text-xs font-black flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h4 className="text-xs font-black text-[#454d82] uppercase tracking-widest">
                    Sección 3: Confirmación
                  </h4>
                </div>

                <div className="bg-white/60 backdrop-blur-md border border-white/90 rounded-2xl p-5 space-y-3 mb-6 shadow-inner">
                  <p className="text-xs text-[#3e446b] font-medium leading-relaxed">
                    Al hacer clic en <strong className="font-black text-[#1e2246]">ENVIAR INSCRIPCIÓN</strong>, un asesor se comunicará contigo por WhatsApp para confirmar tu plan (Individual, Autónomo o B2B), tu fecha de cohorte y el método de pago (Zinli, PayPal, Binance o moneda local).
                  </p>
                  <p className="text-xs text-[#50567d] font-medium leading-relaxed">
                    Verifica que tu correo y número de WhatsApp estén bien escritos.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {submitError && (
                  <div className="bg-[#ee665b]/15 border-2 border-[#ee665b] text-[#9b2c23] rounded-xl px-4 py-2.5 text-xs font-bold text-center">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ola-btn-yellow w-full py-4 rounded-full font-black tracking-widest text-xs uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  <span>{isSubmitting ? 'Verificando y Enviando...' : 'Enviar Inscripción'}</span>
                  {!isSubmitting && <ArrowRightSvg className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>

                {onFreeTrialClick && (
                  <button
                    type="button"
                    onClick={onFreeTrialClick}
                    className="ola-btn-outline w-full py-3.5 rounded-full font-black tracking-widest text-xs uppercase cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PlaySvg className="w-3.5 h-3.5" />
                    <span>Probar Clase Gratis</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// =========================================
// MAIN EXPORT: STAGE 4 INTERACTIVO + STAGE 5 + FOOTER
// =========================================
export default function LandingTrialAndEnroll({
  onFreeLessonClick,
  onPlacementClick,
  onScrollTo,
  onOpenLogin,
}) {
  // Estado interactivo de la tarjeta Prueba Gratis (Mini-desafío real sin traducción)
  const [selectedOption, setSelectedOption] = useState(null);
  const [wrongShakeTick, setWrongShakeTick] = useState(0);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);

  // Estado interactivo de la tarjeta Prueba de Nivelación (Explorador de bandas CEFR)
  const [activeDiagIdx, setActiveDiagIdx] = useState(2); // Inicia en B1

  const activeDiag = DIAGNOSTIC_BANDS[activeDiagIdx];

  const handlePlayMiniPrompt = (textToRead = GRAMMAR_SENTENCE.fullCorrect) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(textToRead);
      utter.lang = 'en-US';
      utter.rate = 0.95;
      utter.onstart = () => setIsSpeakingPrompt(true);
      utter.onend = () => setIsSpeakingPrompt(false);
      utter.onerror = () => setIsSpeakingPrompt(false);
      setIsSpeakingPrompt(true);
      window.speechSynthesis.speak(utter);
    } catch {
      setIsSpeakingPrompt(false);
    }
  };

  const handleMiniOptionClick = (opt) => {
    setSelectedOption(opt);
    if (opt.isCorrect) {
      handlePlayMiniPrompt(GRAMMAR_SENTENCE.fullCorrect);
    } else {
      setWrongShakeTick((t) => t + 1);
    }
  };

  return (
    <>
      <style>{`
        @keyframes olaMiniShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          45% { transform: translateX(6px); }
          70% { transform: translateX(-4px); }
          90% { transform: translateX(3px); }
        }
        .ola-mini-shake {
          animation: olaMiniShake 0.34s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        /* Pulso intenso e invitante para el botón de Prueba Gratis */
        @keyframes olaTrialIntensePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 5px 0 #1e2246, 0 0 0 0 rgba(255, 199, 73, 0.95), 0 14px 30px -4px rgba(255, 199, 73, 0.75);
          }
          50% {
            transform: scale(1.055);
            box-shadow: 0 8px 0 #1e2246, 0 0 0 18px rgba(255, 199, 73, 0), 0 20px 42px -2px rgba(255, 199, 73, 1);
          }
        }
        .ola-trial-intense-pulse {
          animation: olaTrialIntensePulse 1.35s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .ola-trial-intense-pulse:hover {
          animation: none;
        }
        .ola-gateway-indigo {
          background: linear-gradient(150deg, rgba(104, 113, 172, 0.93) 0%, rgba(69, 77, 130, 0.92) 100%);
          backdrop-filter: blur(28px) saturate(185%);
          -webkit-backdrop-filter: blur(28px) saturate(185%);
          border: 1.5px solid rgba(255, 255, 255, 0.42);
          box-shadow:
            0 24px 52px -12px rgba(45, 51, 96, 0.42),
            0 0 40px -8px rgba(98, 106, 159, 0.52),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.42);
        }
      `}</style>

      {/* ================================================== */}
      {/* STAGE 4: TARJETAS INTERACTIVAS DE PRUEBA Y NIVEL   */}
      {/* ================================================== */}
      <section id="free-trial" className="py-16 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-stretch">
            {/* TARJETA 1: PRUEBA GRATIS + MINI-DESAFÍO CONVERSACIONAL INTERACTIVO */}
            <div className="lg:col-span-7 relative group flex flex-col">
              <div
                className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle at top left, rgba(255,199,73,0.75), rgba(255,224,145,0.2) 70%)' }}
              />

              <div className="ola-glass-yellow flex-1 rounded-[2.5rem] p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
                {/* Marca de agua sutil OutLoud */}
                <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.07]">
                  <OutLoudIcon withTile={false} className="w-44 h-44" />
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/85 backdrop-blur-md border border-white rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#1e2246] mb-4 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-pulse" />
                    <span>Experiencia Interactiva Sin Registro</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black text-[#1e2246] tracking-tight leading-tight mb-3">
                    Prueba una lección real <span className="text-[#454d82]">ahora mismo</span>
                  </h2>

                  <p className="text-sm text-[#282d57] font-semibold leading-relaxed mb-5 max-w-xl">
                    Completa las dos palabras que faltan en la oración y comprueba cómo practicas gramática en contexto real:
                  </p>

                  {/* MINI-RETO GRAMATICAL INTERACTIVO (COMPLETAR ESPACIOS) */}
                  <div
                    key={`trial-box-${wrongShakeTick}`}
                    className={`bg-white/88 backdrop-blur-xl border-2 border-white rounded-3xl p-4 sm:p-5 mb-6 shadow-[0_12px_28px_-12px_rgba(69,77,130,0.22)] ${
                      selectedOption && !selectedOption.isCorrect ? 'ola-mini-shake border-[#ee665b]/70' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#454d82]">
                        Práctica de gramática • Selecciona la opción correcta
                      </span>

                      {selectedOption?.isCorrect && (
                        <button
                          type="button"
                          onClick={() => handlePlayMiniPrompt(GRAMMAR_SENTENCE.fullCorrect)}
                          aria-label="Escuchar oración completa"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#1e2246] cursor-pointer transition-all ${
                            isSpeakingPrompt
                              ? 'bg-[#16a37f] text-white'
                              : 'bg-[#ffc749] text-[#1e2246] hover:brightness-105'
                          }`}
                        >
                          <VolumeSvg className="w-3.5 h-3.5" />
                          <span>Oír</span>
                        </button>
                      )}
                    </div>

                    {/* Oración con espacio interactivo */}
                    <p className="text-base sm:text-lg font-black text-[#1e2246] leading-relaxed mb-4">
                      &ldquo;{GRAMMAR_SENTENCE.before}{' '}
                      <span
                        className={`inline-flex items-center justify-center min-w-[126px] px-3 py-0.5 mx-1 rounded-xl border-2 transition-all duration-200 align-baseline ${
                          selectedOption?.isCorrect
                            ? 'bg-[#16a37f] border-[#1e2246] text-white shadow-sm'
                            : selectedOption && !selectedOption.isCorrect
                            ? 'bg-[#ee665b]/15 border-[#ee665b] text-[#9b2c23]'
                            : 'bg-[#fff3d1] border-dashed border-[#626a9f] text-[#626a9f]/70'
                        }`}
                      >
                        {selectedOption ? selectedOption.text : '_____ _____'}
                      </span>{' '}
                      {GRAMMAR_SENTENCE.after}&rdquo;
                    </p>

                    {/* 3 opciones gramaticales coherentes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {MINI_TRIAL_OPTIONS.map((opt) => {
                        const isPicked = selectedOption?.id === opt.id;
                        const isSuccess = isPicked && opt.isCorrect;
                        const isWrong = isPicked && !opt.isCorrect;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleMiniOptionClick(opt)}
                            className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold border-2 transition-all duration-150 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
                              isSuccess
                                ? 'bg-[#16a37f] border-[#1e2246] text-white shadow-[0_3px_0_#1e2246]'
                                : isWrong
                                ? 'bg-[#ee665b]/15 border-[#ee665b] text-[#9b2c23]'
                                : 'bg-[#f6f7fc] border-[#dfe2f2] text-[#1e2246] hover:border-[#454d82] hover:bg-white'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isSuccess && <CheckSvg className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback inmediato */}
                    {selectedOption && (
                      <div
                        className={`mt-3 text-xs font-black flex items-center gap-2 animate-fade-in ${
                          selectedOption.isCorrect ? 'text-[#128063]' : 'text-[#c93f34]'
                        }`}
                      >
                        {selectedOption.isCorrect ? (
                          <>
                            <span className="w-5 h-5 rounded-full bg-[#16a37f] text-white flex items-center justify-center shrink-0">
                              <CheckSvg className="w-3 h-3" />
                            </span>
                            <span>¡Exacto! Así dominas la gramática en uso real, sin memorizar tablas.</span>
                          </>
                        ) : (
                          <span>Revisa la concordancia con &ldquo;They&rdquo; y la acción en progreso (&ldquo;right now&rdquo;).</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={onFreeLessonClick}
                    className={`ola-btn-yellow ola-trial-intense-pulse w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2.5 group/btn ${
                      selectedOption?.isCorrect ? 'ring-4 ring-[#16a37f]/45' : ''
                    }`}
                  >
                    <span>
                      {selectedOption?.isCorrect ? 'Continuar Unidad 1 Gratis' : 'Iniciar Clase de Prueba'}
                    </span>
                    <PlaySvg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>

                  <span className="text-[11px] font-extrabold text-[#3b4170] uppercase tracking-wider">
                    Audio nativo • Práctica vocal • 100% Gratis
                  </span>
                </div>
              </div>
            </div>

            {/* TARJETA 2: PRUEBA DE NIVELACIÓN + EXPLORADOR INTERACTIVO DE BANDA CEFR */}
            <div className="lg:col-span-5 relative group flex flex-col">
              <div
                className="absolute -inset-3 rounded-[2.8rem] blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle at bottom right, rgba(98,106,159,0.82), rgba(255,199,73,0.38) 75%)' }}
              />

              <div className="ola-gateway-indigo flex-1 rounded-[2.5rem] p-7 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.1] brightness-0 invert">
                  <OutLoudIcon withTile={false} className="w-44 h-44" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#ffc749]">
                      Evaluación Diagnóstica
                    </span>
                    <OutLoudIcon className="w-11 h-11 shrink-0 drop-shadow-md" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2.5">
                    ¿Ya sabes algo de inglés?
                  </h3>

                  <p className="text-sm text-white/90 font-medium leading-relaxed mb-5">
                    ¿Dónde crees que estás hoy? Toca un nivel para explorar y luego confirma tu ubicación exacta con nuestra <strong className="text-[#ffc749] font-black">Prueba de Nivelación</strong>:
                  </p>

                  {/* EXPLORADOR INTERACTIVO CEFR EMBEBIDO */}
                  <div className="bg-[#1e2246]/45 backdrop-blur-xl border border-white/25 rounded-3xl p-4 sm:p-5 mb-6">
                    {/* 6 Selector Pills */}
                    <div className="grid grid-cols-6 gap-1.5 mb-4">
                      {DIAGNOSTIC_BANDS.map((band, idx) => {
                        const isPicked = idx === activeDiagIdx;
                        return (
                          <button
                            key={band.id}
                            type="button"
                            onClick={() => setActiveDiagIdx(idx)}
                            className={`py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer ${
                              isPicked
                                ? 'bg-[#ffc749] text-[#1e2246] scale-105 shadow-md'
                                : 'bg-white/10 text-white/85 hover:bg-white/20'
                            }`}
                          >
                            {band.id}
                          </button>
                        );
                      })}
                    </div>

                    {/* Medidor animado de dominio */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                        <span className="text-[#ffc749]">Nivel {activeDiag.id}</span>
                        <span className="text-white/80">IELTS {activeDiag.ielts}</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ffc749] to-[#16a37f] transition-all duration-300 ease-out"
                          style={{ width: `${activeDiag.pct}%` }}
                        />
                      </div>
                    </div>

                    <p
                      key={activeDiag.id}
                      className="text-xs font-semibold text-white/95 leading-snug min-h-[34px] animate-fade-in"
                    >
                      {activeDiag.canDo}
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs font-semibold text-white/90 mb-7">
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#ffc749] text-[#1e2246] flex items-center justify-center shrink-0">
                        <CheckSvg className="w-3 h-3" />
                      </span>
                      <span>Evaluación escrita rápida + entrevista oral</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#ffc749] text-[#1e2246] flex items-center justify-center shrink-0">
                        <CheckSvg className="w-3 h-3" />
                      </span>
                      <span>Resultados revisados por instructores reales</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={onPlacementClick}
                  className="ola-btn-yellow relative z-10 w-full py-4 px-5 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 group/btn"
                >
                  <span>Tomar Prueba de Nivelación</span>
                  <ArrowRightSvg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* STAGE 5: PLANILLA DE INSCRIPCIÓN (#enroll)         */}
      {/* ================================================== */}
      <section id="enroll" className="py-16 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <OnboardingFormCard onFreeTrialClick={onFreeLessonClick} />
        </div>
      </section>

      {/* ================================================== */}
      {/* FOOTER CON SVGs PERSONALIZADOS                     */}
      {/* ================================================== */}
      <footer className="bg-white/55 backdrop-blur-2xl border-t border-white/85 pt-14 pb-10 mt-8 shadow-[0_-12px_40px_-14px_rgba(55,63,118,0.22)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#626a9f]/20">
            <div className="md:col-span-5 flex flex-col items-start">
              <OutLoudHorizontalLogo iconClass="w-11 h-11" wordmarkClass="h-9 w-auto" />
              <p className="text-xs sm:text-sm text-[#4c5384] font-medium leading-relaxed mt-4 max-w-sm">
                Plataforma académica de inmersión en inglés con lecciones interactivas 24/7, clases en vivo y comunidad estudiantil moderada.
              </p>
              <a
                href="https://wa.me/584226885683"
                target="_blank"
                rel="noreferrer"
                className="ola-btn-outline mt-5 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider"
              >
                <WhatsAppSvg className="w-4 h-4 text-[#16a37f]" />
                <span>Soporte &amp; Pagos Locales</span>
              </a>
            </div>

            <div className="md:col-span-3">
              <h5 className="text-xs font-black uppercase tracking-widest text-[#1e2246] mb-4">
                Explorar
              </h5>
              <ul className="space-y-1.5 text-xs font-bold text-[#4c5384]">
                {[
                  { label: 'Método & Cursos', href: '#method' },
                  { label: 'Ciclo de Estudio', href: '#cycle' },
                  { label: 'Niveles CEFR', href: '#levels' },
                  { label: 'Planes & Créditos', href: '#plans' },
                  { label: 'Inscripción', href: '#enroll' },
                ].map((item) => (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => onScrollTo?.(item.href)}
                      className="ola-reactive-text text-[#4c5384] hover:text-[#1e2246] font-bold cursor-pointer -ml-3"
                    >
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4 flex flex-col justify-between gap-6">
              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-[#1e2246] mb-4">
                  Comunidad &amp; Redes
                </h5>
                <div className="flex flex-wrap gap-2.5">
                  {SOCIAL_LINKS.map((soc) => (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-[#454d82] text-[#1e2246] hover:text-white border border-white hover:border-[#1e2246] text-xs font-black uppercase tracking-wider shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      {soc.icon}
                      <span>{soc.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="ola-glass rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#1e2246]">¿Ya eres estudiante?</p>
                  <p className="text-[11px] font-medium text-[#4c5384]">Accede a tu Hub ahora.</p>
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

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-bold text-[#50567d]">
            <span>© {new Date().getFullYear()} OutLoud Language Academy. Todos los derechos reservados.</span>
            <span className="uppercase tracking-widest text-[#454d82] font-black">outloudlanguage.com</span>
          </div>
        </div>
      </footer>
    </>
  );
}