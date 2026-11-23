import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import StudentHub from './StudentHub';
import SeminarRoom from './SeminarRoom';
import ForumBoard from './ForumBoard';
import AdminCalendar from './components/AdminHub/Tabs/AdminCalendar';
import { LEVEL_UNIT_MAP, LEVEL_OPTIONS, LESSON_TOOLS, WORKBOOK_TOOLS } from './constants/adminConfigs';
import { generateCrosswordLayout } from './utils/crosswordGenerator';
import { generateWordSearchGrid } from './utils/wordSearchGenerator';
import FillInTheBlankModal from './components/AdminHub/Modals/FillInTheBlankModal';
import ShapeConfigModal from './components/AdminHub/Modals/ShapeConfigModal';
import DragAndDropModal from './components/AdminHub/Modals/DragAndDropModal';
import ShortAnswerModal from './components/AdminHub/Modals/ShortAnswerModal';
import MultipleSelectionModal from './components/AdminHub/Modals/MultipleSelectionModal';
import SliderBarModal from './components/AdminHub/Modals/SliderBarModal';
import CrosswordModal from './components/AdminHub/Modals/CrosswordModal';
import WordSearchModal from './components/AdminHub/Modals/WordSearchModal';
import NavButtonModal from './components/AdminHub/Modals/NavButtonModal';
import CustomerManagement from './components/AdminHub/Tabs/CustomerManagement';
import MasterSettings from './components/AdminHub/Tabs/MasterSettings';
import AdminDropdown from './components/ui/AdminDropdown';
import StudentManagerModal from './components/AdminHub/Tabs/StudentManagerModal';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import StatisticsHub from './components/StatisticsHub';
import AchievementsManager from './components/AdminHub/Tabs/AchievementsManager';
import CommercialFunnelModule from './statistics_engines/CommercialFunnelModule';
import ProfitMarginAnalysis from './statistics_engines/ProfitMarginAnalysis';
import { OutLoudHorizontalLogo, OutLoudIcon } from './components/OutLoudBrand';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// ==========================================
// SAFE URL EXTRACTOR FOR CLOUDFLARE IFRAMES
// ==========================================
const extractVideoUrl = (rawInput) => {
  if (!rawInput) return '';
  if (rawInput.includes('<iframe') && rawInput.includes('src=')) {
    const match = rawInput.match(/src=["'](.*?)["']/);
    if (match && match[1]) return match[1];
  }
  return rawInput;
};

// ==========================================
// OUTLOUD LIGHT-GLASS ADMIN DESIGN ENGINE
// ==========================================
const AdminThemeStyles = () => (
  <style>{`
    /* ADMIN OVERRIDE: FORCE ENABLE COPY/PASTE */
    #admin-hub-root,
    #admin-hub-root input,
    #admin-hub-root textarea,
    #admin-hub-root [contenteditable="true"] {
      -webkit-user-select: text !important;
      user-select: text !important;
    }

    .ola-adm-glass {
      background: linear-gradient(142deg, rgba(255, 255, 255, 0.82) 0%, rgba(244, 246, 255, 0.6) 100%);
      backdrop-filter: blur(26px) saturate(185%);
      -webkit-backdrop-filter: blur(26px) saturate(185%);
      border: 1.5px solid rgba(255, 255, 255, 0.94);
      box-shadow:
        0 18px 40px -14px rgba(55, 63, 118, 0.2),
        inset 0 1.5px 1px rgba(255, 255, 255, 0.96);
    }
    .ola-adm-glass-gold {
      background: linear-gradient(148deg, rgba(255, 246, 218, 0.94) 0%, rgba(255, 229, 156, 0.74) 100%);
      backdrop-filter: blur(26px) saturate(190%);
      -webkit-backdrop-filter: blur(26px) saturate(190%);
      border: 1.5px solid rgba(255, 255, 255, 0.95);
      box-shadow:
        0 20px 44px -14px rgba(196, 138, 12, 0.24),
        0 0 32px -10px rgba(255, 199, 73, 0.44),
        inset 0 2px 2px rgba(255, 255, 255, 0.95);
    }
    .ola-adm-glass-indigo {
      background: linear-gradient(148deg, rgba(102, 111, 168, 0.95) 0%, rgba(69, 77, 130, 0.94) 100%);
      backdrop-filter: blur(26px) saturate(185%);
      -webkit-backdrop-filter: blur(26px) saturate(185%);
      border: 1.5px solid rgba(255, 255, 255, 0.44);
      box-shadow:
        0 20px 46px -14px rgba(45, 51, 96, 0.36),
        inset 0 1.5px 1px rgba(255, 255, 255, 0.38);
    }
    .ola-adm-glass-mint {
      background: linear-gradient(148deg, rgba(235, 252, 246, 0.94) 0%, rgba(209, 244, 232, 0.78) 100%);
      backdrop-filter: blur(24px) saturate(185%);
      -webkit-backdrop-filter: blur(24px) saturate(185%);
      border: 1.5px solid rgba(22, 163, 127, 0.45);
      box-shadow:
        0 18px 38px -14px rgba(18, 128, 99, 0.24),
        inset 0 1.5px 1px #ffffff;
    }

    .ola-adm-bento {
      position: relative;
      overflow: hidden;
      transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .ola-adm-bento::before {
      content: '';
      position: absolute;
      top: 0;
      left: -135%;
      width: 68%;
      height: 100%;
      background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.46) 48%, transparent 100%);
      transform: skewX(-20deg);
      transition: left 0.65s cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
      z-index: 20;
    }
    .ola-adm-bento:hover::before {
      left: 165%;
    }
    .ola-adm-bento:hover {
      transform: translateY(-4px);
    }
    .ola-adm-bento:active {
      transform: translateY(1px) scale(0.99);
      transition-duration: 0.06s;
    }

    .ola-adm-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 12px 24px -6px rgba(255, 199, 73, 0.52);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s cubic-bezier(0.22, 1, 0.36, 1), filter 0.14s ease-out;
    }
    .ola-adm-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246, 0 16px 30px -6px rgba(255, 199, 73, 0.72);
    }
    .ola-adm-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
      transition-duration: 0.06s;
    }

    .ola-adm-btn-outline {
      background: rgba(255, 255, 255, 0.82);
      color: #1e2246;
      border: 2px solid rgba(30, 34, 70, 0.85);
      box-shadow: 0 3px 0 rgba(30, 34, 70, 0.16);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, background 0.14s ease;
    }
    .ola-adm-btn-outline:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 5px 0 #626a9f;
    }
    .ola-adm-btn-outline:active {
      transform: translateY(2px) scale(0.99);
      box-shadow: 0 1px 0 rgba(30, 34, 70, 0.2);
    }

    .ola-adm-btn-danger {
      background: #ee665b;
      color: #ffffff;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246;
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
    }
    .ola-adm-btn-danger:hover {
      filter: brightness(1.06);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246;
    }
    .ola-adm-btn-danger:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
    }

    @keyframes olaAdmModalIn {
      0% { opacity: 0; transform: translateY(12px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes olaAdmFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    @keyframes olaAdmToastIn {
      0% { opacity: 0; transform: translate(-50%, 16px) scale(0.94); }
      100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
    .ola-adm-modal-in { animation: olaAdmModalIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .ola-adm-float { animation: olaAdmFloat 3.8s ease-in-out infinite; }
    .ola-adm-toast-in { animation: olaAdmToastIn 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

    /* Refined editorial font weights */
    #admin-hub-root .font-black { font-weight: 800; }
    #admin-hub-root .font-extrabold { font-weight: 700; }
    #admin-hub-root h3.font-black,
    #admin-hub-root h4.font-black,
    #admin-hub-root button.font-black,
    #admin-hub-root span.font-black { font-weight: 700; }

    /* Custom Scrollbars & Media Locks */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(98, 106, 159, 0.28); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #626a9f; }
    .zoom-container { touch-action: pan-x pan-y pinch-zoom; overflow: auto; overscroll-behavior: contain; }
    video::-internal-media-controls-download-button { display: none !important; }
    audio::-internal-media-controls-download-button { display: none !important; }

    /* Light-Mode PhoneInput Styling */
    .PhoneInputCustom { display: flex; align-items: center; width: 100%; }
    .PhoneInputCustom .PhoneInputInput {
      background: transparent !important;
      color: #1e2246 !important;
      outline: none !important;
      border: none !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
      margin-left: 0.65rem !important;
      min-width: 0;
    }
    .PhoneInputCustom .PhoneInputCountry { margin-right: 0.4rem; }
    .PhoneInputCustom .PhoneInputCountrySelectArrow { color: #454d82; }
    .PhoneInputCustom .PhoneInputCountrySelect { color: #1e2246; background: #ffffff; }
  `}</style>
);

const AdminLuminousBackdrop = () => (
  <div
    className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    style={{
      background: 'linear-gradient(155deg, #d7dcf5 0%, #eaedfb 34%, #f7eff0 66%, #fdebc0 100%)',
    }}
  >
    <div
      className="absolute -top-24 -left-24 w-[440px] h-[440px] sm:w-[660px] sm:h-[660px] rounded-full blur-[85px]"
      style={{
        background: 'radial-gradient(circle, rgba(255,199,73,0.58) 0%, rgba(255,214,107,0.22) 48%, transparent 74%)',
      }}
    />
    <div
      className="absolute top-[18%] -right-24 w-[440px] h-[440px] sm:w-[680px] sm:h-[680px] rounded-full blur-[90px]"
      style={{
        background: 'radial-gradient(circle, rgba(98,106,159,0.46) 0%, rgba(145,155,218,0.2) 50%, transparent 76%)',
      }}
    />
    <div
      className="absolute -bottom-28 left-[28%] w-[440px] h-[440px] sm:w-[640px] sm:h-[640px] rounded-full blur-[95px]"
      style={{
        background: 'radial-gradient(circle, rgba(255,199,73,0.4) 0%, rgba(98,106,159,0.2) 55%, transparent 78%)',
      }}
    />
    <div
      className="absolute inset-0 opacity-80"
      style={{
        backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.22) 1.4px, transparent 1.4px)',
        backgroundSize: '26px 26px',
      }}
    />
  </div>
);

// ==========================================
// BESPOKE VECTOR NAVIGATION ICONS
// ==========================================
const adminNavIcons = {
  accounts: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  calendar: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  content: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  communications: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  finances: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  settings: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const NavIconBtn = ({ iconSvg, label, active, onClick, hasNotification, isProfile, avatarUrl }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`group relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all duration-150 cursor-pointer active:scale-90 shrink-0 ${
      active
        ? 'bg-[#1e2246] text-[#ffc749] shadow-md'
        : 'bg-white/60 hover:bg-white text-[#454d82] hover:text-[#1e2246] border border-white/90'
    }`}
  >
    {hasNotification && (
      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ee665b] rounded-full border-2 border-white z-10 animate-pulse" />
    )}
    {isProfile ? (
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#1e2246] bg-[#e8eaf7] flex items-center justify-center text-[#454d82]">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
    ) : (
      <div className="w-6 h-6">{iconSvg}</div>
    )}
  </button>
);

// ==========================================
// DEDICATED PROVISIONING MODAL (Light Glass)
// ==========================================
const ProvisioningModal = ({ isOpen, onClose, supabase, onSuccess, initialData }) => {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [role, setRole] = useState(initialData?.role || 'Student');
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Academic & Billing States
  const [provLevel, setProvLevel] = useState('A1: Básico 1');
  const [provUnit, setProvUnit] = useState(1);
  const [provCohort, setProvCohort] = useState(15);

  // Sync incoming initialData (e.g., from Evaluator onboarding buttons)
  useEffect(() => {
    if (isOpen) {
      setFirstName(initialData?.firstName || '');
      setLastName(initialData?.lastName || '');
      setEmail(initialData?.email || '');
      setPhone(initialData?.phone || '');
      setRole(initialData?.role || 'Student');
      setPassword('');
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const base = provLevel ? provLevel.split(':')[0].trim() : 'A1';
    const bounds = {
      A1: { start: 1, end: 12 },
      A2: { start: 13, end: 24 },
      B1: { start: 25, end: 36 },
      B2: { start: 37, end: 48 },
      C1: { start: 49, end: 70 },
      C2: { start: 71, end: 92 },
    }[base] || { start: 1, end: 12 };

    if (provUnit < bounds.start || provUnit > bounds.end) {
      setProvUnit(bounds.start);
    }
  }, [provLevel, provUnit]);

  const [payMethod, setPayMethod] = useState('Zinli');
  const [payDate, setPayDate] = useState('');
  const [payRef, setPayRef] = useState('');

  if (!isOpen) return null;

  const onboardingFee = 10.0;

  const handleProvision = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      alert('Nombres, correo y contraseña son obligatorios.');
      return;
    }
    if (role === 'Student' && (!payMethod || !payDate || !payRef)) {
      alert('Para registrar un estudiante, debes llenar todos los datos financieros.');
      return;
    }

    setIsProcessing(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data: edgeData, error: authError } = await supabase.functions.invoke('provision-user', {
        body: {
          email: cleanEmail,
          password: password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: role,
          level: role === 'Student' ? provLevel : 'Staff',
          unit: role === 'Student' ? provUnit : 1,
        },
      });

      if (authError) throw new Error(`Fallo en Auth/Edge Function: ${authError.message}`);
      if (edgeData?.error) throw new Error(`Error de Autenticación: ${edgeData.error}`);

      const newUserId = edgeData?.user?.id;
      if (!newUserId) throw new Error('No se pudo obtener el ID del usuario desde la función.');

      const profileUpdates = {
        email: cleanEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        whatsapp: phone || null,
        avatar_url: avatarUrl || null,
        role: role,
        assigned_password: password,
        status: role === 'Student' ? 'pending_activation' : 'active',
      };

      if (role === 'Student') {
        profileUpdates.cohort = provCohort;
        profileUpdates.level = provLevel;
        profileUpdates.unit = provUnit;
        profileUpdates.available_credits = 0;
        profileUpdates.payment_status = 'pending_first_month';
      }

      const { error: profileError } = await supabase.from('profiles').update(profileUpdates).eq('id', newUserId);
      if (profileError) throw new Error(`Fallo actualizando perfil en BD: ${profileError.message}`);

      if (role === 'Student' && payRef) {
        const { error: paymentError } = await supabase.from('student_payments').insert({
          student_id: newUserId,
          payment_type: 'Onboarding Fee',
          amount: onboardingFee,
          reference_number: `${payMethod}: ${payRef.trim()}`,
          status: 'verified',
        });

        if (paymentError) console.warn('Aviso: Perfil creado, pero falló el registro del pago.', paymentError);
      }

      alert('¡Cuenta aprovisionada exitosamente!');
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
      window.location.reload();
    } catch (error) {
      console.error('Provisioning Error:', error);
      alert(`Error crítico: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="prov-overlay"
      onClick={(e) => e.target.id === 'prov-overlay' && onClose()}
      className="fixed inset-0 z-[400] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl px-4 font-montserrat"
    >
      <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] p-6 sm:p-8 max-w-4xl w-full relative flex flex-col overflow-hidden max-h-[92vh]">
        <div className="flex justify-between items-center mb-5 border-b border-[#626a9f]/15 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#1e2246] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight leading-none">
                Provisioning
              </h2>
              <p className="text-[10.5px] text-[#454d82] font-bold uppercase tracking-widest mt-1">
                Creación de Cuenta &amp; Registro de Inscripción
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] transition-all active:scale-90 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-1">
          <form onSubmit={handleProvision} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* LEFT COLUMN: Personal Data */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
                Información Personal
              </h3>

              <div className="flex gap-3.5 items-center">
                <div className="w-14 h-14 rounded-2xl border-2 border-[#1e2246] overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-[#626a9f]">+</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                    URL Foto (Opcional)
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-semibold outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                  Asignar Contraseña
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ej: OlaAlberto.2026"
                  className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                  Teléfono (WhatsApp)
                </label>
                <div className="w-full rounded-xl px-3 py-2 bg-white/85 focus-within:bg-white border-2 border-white focus-within:border-[#454d82] shadow-sm transition-colors">
                  <PhoneInput
                    defaultCountry="VE"
                    international
                    value={phone}
                    onChange={setPhone}
                    className="PhoneInputCustom w-full bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Role, Academic & Financials */}
            <div className="space-y-4 flex flex-col">
              <div className="flex justify-between items-center border-b border-[#626a9f]/15 pb-2">
                <h3 className="text-[11px] font-bold text-[#454d82] uppercase tracking-widest">
                  Asignación de Rol
                </h3>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-[#fff3d1] border border-[#ffc749] text-[#1e2246] rounded-full px-3 py-1 text-xs font-bold uppercase outline-none cursor-pointer"
                >
                  <option value="Student">Estudiante</option>
                  <option value="Teacher">Profesor</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>

              {role === 'Student' ? (
                <>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[9.5px] text-[#454d82] font-bold uppercase mb-1">Nivel</label>
                      <select
                        value={provLevel}
                        onChange={(e) => setProvLevel(e.target.value)}
                        className="w-full bg-white/85 border-2 border-white focus:border-[#454d82] rounded-xl px-2.5 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        {LEVEL_OPTIONS.map((l) => (
                          <option key={l} value={l}>
                            {l.split(':')[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-[#454d82] font-bold uppercase mb-1">Unidad</label>
                      <select
                        value={provUnit}
                        onChange={(e) => setProvUnit(parseInt(e.target.value, 10))}
                        className="w-full bg-white/85 border-2 border-white focus:border-[#454d82] rounded-xl px-2.5 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        {(() => {
                          const base = provLevel ? provLevel.split(':')[0].trim() : 'A1';
                          const bounds = {
                            A1: { start: 1, end: 12 },
                            A2: { start: 13, end: 24 },
                            B1: { start: 25, end: 36 },
                            B2: { start: 37, end: 48 },
                            C1: { start: 49, end: 70 },
                            C2: { start: 71, end: 92 },
                          }[base] || { start: 1, end: 12 };
                          return Array.from({ length: bounds.end - bounds.start + 1 }, (_, i) => bounds.start + i).map((u) => (
                            <option key={u} value={u}>
                              Unidad {u}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-[#454d82] font-bold uppercase mb-1">Cohorte</label>
                      <select
                        value={provCohort}
                        onChange={(e) => setProvCohort(parseInt(e.target.value, 10))}
                        className="w-full bg-white/85 border-2 border-white focus:border-[#454d82] rounded-xl px-2.5 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value={15}>Día 15</option>
                        <option value={30}>Día 30</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#fff8e6] border-2 border-[#ffc749] rounded-2xl p-4 sm:p-5 shadow-inner">
                    <div className="flex justify-between items-center mb-3.5 border-b border-[#ffc749]/40 pb-2.5">
                      <span className="text-[10px] text-[#454d82] font-bold uppercase tracking-widest">
                        Inscripción por Nivel
                      </span>
                      <span className="text-xl font-extrabold text-[#1e2246]">$10.00 USD</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[9.5px] text-[#454d82] font-bold uppercase mb-1">
                          Método de Pago
                        </label>
                        <select
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value)}
                          className="w-full bg-white border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="Zinli">Zinli</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Binance">Binance</option>
                          <option value="Moneda Local">Moneda Local</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-[#454d82] font-bold uppercase mb-1">
                          Fecha de Pago
                        </label>
                        <input
                          type="date"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                          className="w-full bg-white border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-semibold outline-none cursor-pointer"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-[#454d82] font-bold uppercase mb-1">
                        Número de Referencia (Zinli / PayPal / Binance / Local)
                      </label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        placeholder="Ej: REF-923847"
                        className="w-full bg-white border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-semibold outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#626a9f] bg-white/55 border-2 border-dashed border-[#626a9f]/30 rounded-2xl p-6 text-center">
                  <svg className="w-10 h-10 mb-2 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[11px] uppercase tracking-wider font-bold">
                    Personal Administrativo / Docente no requiere pago de inscripción.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="ola-adm-btn-yellow w-full py-3.5 mt-auto font-bold tracking-widest text-xs uppercase rounded-full disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Procesando en BD...' : 'Provisionar Cuenta →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PAN & ZOOM IMAGE COMPONENT (RESIZABLE)
// ==========================================
const PanZoomImage = ({ src, data, onSave, isPreview, wrapperClass = 'w-full h-64', objectFit = 'cover' }) => {
  const [zoom, setZoom] = useState(data?.zoom || 1);
  const [pan, setPan] = useState({ x: data?.panX || 0, y: data?.panY || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [containerSize, setContainerSize] = useState({
    width: data?.containerWidth || null,
    height: data?.containerHeight || null,
  });
  const containerRef = useRef(null);

  useEffect(() => {
    setZoom(data?.zoom || 1);
    setPan({ x: data?.panX || 0, y: data?.panY || 0 });
    setContainerSize({ width: data?.containerWidth || null, height: data?.containerHeight || null });
  }, [data?.zoom, data?.panX, data?.panY, data?.containerWidth, data?.containerHeight]);

  const handleZoom = (amount) => {
    if (isPreview) return;
    const newZoom = Math.max(0.1, Math.min(zoom + amount, 5));
    setZoom(newZoom);
    if (onSave) {
      onSave({
        zoom: newZoom,
        panX: pan.x,
        panY: pan.y,
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
      });
    }
  };

  const handlePointerDown = (e) => {
    if (isPreview) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isPreview) return;
    setPan({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handlePointerUp = (e) => {
    if (isPreview) return;
    setIsDragging(false);
    if (onSave) {
      onSave({
        zoom,
        panX: pan.x,
        panY: pan.y,
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
      });
    }
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleResizeDown = (e) => {
    if (isPreview) return;
    e.stopPropagation();
    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);
    const startWidth = containerRef.current.offsetWidth;
    const startHeight = containerRef.current.offsetHeight;

    const handleResizeMove = (moveEvent) => {
      const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const clientY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      const newWidth = Math.max(100, startWidth + (clientX - startX));
      const newHeight = Math.max(100, startHeight + (clientY - startY));
      setContainerSize({ width: newWidth, height: newHeight });
    };

    const handleResizeUp = () => {
      document.removeEventListener('pointermove', handleResizeMove);
      document.removeEventListener('pointerup', handleResizeUp);
      document.removeEventListener('touchmove', handleResizeMove);
      document.removeEventListener('touchend', handleResizeUp);
      if (onSave) {
        onSave({
          zoom,
          panX: pan.x,
          panY: pan.y,
          containerWidth: containerRef.current.offsetWidth,
          containerHeight: containerRef.current.offsetHeight,
        });
      }
    };

    document.addEventListener('pointermove', handleResizeMove);
    document.addEventListener('pointerup', handleResizeUp);
    document.addEventListener('touchmove', handleResizeMove, { passive: false });
    document.addEventListener('touchend', handleResizeUp);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden relative bg-[#e8eaf7]/70 group ${!containerSize.width ? wrapperClass : 'rounded-2xl shadow-md'}`}
      style={{
        width: containerSize.width ? `${containerSize.width}px` : undefined,
        height: containerSize.height ? `${containerSize.height}px` : undefined,
        margin: '0 auto',
      }}
    >
      <img
        src={src}
        alt="media"
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full ${isPreview ? '' : 'cursor-move'} touch-none will-change-transform`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ objectFit: objectFit, transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
      />

      {!isPreview && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoom(0.2);
            }}
            className="w-8 h-8 bg-white/90 text-[#1e2246] rounded-xl flex items-center justify-center font-bold hover:bg-[#ffc749] shadow-md border border-[#1e2246] transition-colors cursor-pointer"
            title="Zoom Image In"
          >
            +
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoom(-0.2);
            }}
            className="w-8 h-8 bg-white/90 text-[#1e2246] rounded-xl flex items-center justify-center font-bold hover:bg-[#ffc749] shadow-md border border-[#1e2246] transition-colors cursor-pointer"
            title="Zoom Image Out"
          >
            −
          </button>
        </div>
      )}

      {!isPreview && (
        <div
          onPointerDown={handleResizeDown}
          className="absolute bottom-0 right-0 w-8 h-8 z-30 cursor-nwse-resize flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Drag to resize container"
        >
          <svg className="w-4 h-4 text-[#1e2246] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 21h6v-6M21 21l-7-7" />
          </svg>
        </div>
      )}

      {!isPreview && (
        <div className="absolute top-2 left-2 bg-[#1e2246]/80 text-[#ffc749] text-[9px] font-bold px-2.5 py-1 rounded-full pointer-events-none uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity z-10">
          Drag: Pan • Corner: Resize
        </div>
      )}
    </div>
  );
};

// ==========================================
// EVALUATOR MODULE (LIST + ORAL DASHBOARD)
// ==========================================
const EVAL_QUESTIONS = {
  'A1-A2': [
    { id: 1, text: 'What is your name, and where do you live?' },
    { id: 2, text: 'Can you describe your typical morning routine?' },
    { id: 3, text: 'What is your favorite type of food, and why do you like it?' },
    { id: 4, text: 'Tell me about the members of your family or the people you live with.' },
    { id: 5, text: 'What do you usually do on the weekends for fun?' },
    { id: 6, text: 'Describe the room you are in right now using at least five adjectives.' },
    { id: 7, text: 'How was the weather yesterday, and how did it affect your plans?' },
    { id: 8, text: 'What is a skill you would like to learn in the future?' },
    { id: 9, text: 'Tell me about a place you visited recently that you enjoyed.' },
    { id: 10, text: 'If you have a guest visiting your city for one day, where would you take them?' },
  ],
  'B1-B2': [
    { id: 11, text: 'Think of a project you recently completed. What was the most challenging part?' },
    { id: 12, text: 'How do you think technology has changed the way we communicate with our friends?' },
    { id: 13, text: 'If you could live in any other time period in history, which one would you choose?' },
    { id: 14, text: 'Describe a book or a movie that had a significant impact on your way of thinking.' },
    { id: 15, text: 'In your opinion, what are the qualities of a good leader in a professional environment?' },
    { id: 16, text: 'If you were given an unlimited budget to start a small business, what would you create?' },
    { id: 17, text: 'How do you stay organized when you have many different tasks to handle at once?' },
    { id: 18, text: 'Do you prefer working in a team or working independently? Explain your preference.' },
    { id: 19, text: 'What are the pros and cons of living in a large city versus a small rural town?' },
    { id: 20, text: 'Tell me about a time you had to solve a difficult problem. How did you approach it?' },
  ],
  'C1-C2': [
    { id: 21, text: "To what extent do you believe that a person's language shapes their perception of reality?" },
    { id: 22, text: 'How should a society balance the need for public security with the right to individual privacy?' },
    { id: 23, text: "Discuss the role of 'tradition' in a rapidly modernizing world. Is it a weight or an anchor?" },
    { id: 24, text: "If you had to explain the concept of 'justice' to someone, what examples would you use?" },
    { id: 25, text: 'How does the rise of artificial intelligence challenge our traditional definitions of creativity?' },
    { id: 26, text: "Analyze the impact of social media on the 'collective attention span' of the modern generation." },
    { id: 27, text: 'Some argue that travel narrows the mind rather than broadening it by reinforcing stereotypes. What is your take?' },
    { id: 28, text: 'Discuss the ethical implications of genetic engineering in the 21st century.' },
    { id: 29, text: "In literature or film, do you find 'flawed' protagonists more compelling than 'perfect' heroes? Why?" },
    { id: 30, text: 'If you could solve one global crisis instantly, which would it be, and what would the long-term consequences look like?' },
  ],
};

const EVAL_DEDUCTIONS = [
  {
    title: '1. Pronunciation & Phonology',
    items: [
      { id: 'p1', label: 'Unintelligible Sounds', val: 1 },
      { id: 'p2', label: 'Word Stress Errors', val: 1 },
      { id: 'p3', label: 'Severe Accent Interference', val: 2 },
    ],
  },
  {
    title: '2. Fluency & Flow',
    items: [
      { id: 'f1', label: 'Excessive Fillers (um/uh/like)', val: 1 },
      { id: 'f2', label: 'Unnatural Pausing Patterns', val: 1 },
      { id: 'f3', label: 'Fragmented Thought Streams', val: 2 },
    ],
  },
  {
    title: '3. Intonation & Prosody',
    items: [
      { id: 'i1', label: 'Monotone Delivery Profile', val: 1 },
      { id: 'i2', label: 'Question/Statement Confusion', val: 1 },
      { id: 'i3', label: 'Syllable-Timed Robotic Rhythm', val: 2 },
    ],
  },
  {
    title: '4. Grammatical & Lexical Precision',
    items: [
      { id: 'g1', label: 'Explicit Vocabulary Search Fatigue', val: 1 },
      { id: 'g2', label: 'Basic Agreement Slips (he/she/s)', val: 1 },
      { id: 'g3', label: 'Severe Lexical Range Deficit', val: 2 },
    ],
  },
  {
    title: '5. Strategic Competence',
    items: [
      { id: 's1', label: 'Complete Lack of Self-Correction', val: 1 },
      { id: 's2', label: 'Inability to Circumlocute', val: 1 },
      { id: 's3', label: 'Cohesion Failure / Lost Thread', val: 2 },
    ],
  },
];

const EvaluatorModule = ({ onBack, onOnboard }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('A1-A2');
  const [qScores, setQScores] = useState({});
  const [deductions, setDeductions] = useState({});

  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingAnswers, setViewingAnswers] = useState(null);

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this assessment?')) return;
    try {
      await supabase.from('placement_assessments').delete().eq('id', id);
      fetchCandidates();
    } catch (err) {
      console.error(err);
      alert('Failed to delete candidate.');
    }
  };

  const fetchCandidates = async () => {
    setIsLoadingCandidates(true);
    try {
      const { data, error } = await supabase
        .from('placement_assessments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setCandidates(
          data.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            phone: c.phone || 'N/A',
            email: c.email,
            writtenScore: c.written_score,
            rawAnswers: c.raw_answers,
            date: new Date(c.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const sec3Score = Object.values(qScores).filter((v) => v === true).length;
  const totalDeductions = Object.entries(deductions).reduce((total, [id, isChecked]) => {
    if (isChecked) {
      const item = EVAL_DEDUCTIONS.flatMap((c) => c.items).find((i) => i.id === id);
      return total + (item ? item.val : 0);
    }
    return total;
  }, 0);

  const sec4Score = Math.max(0, 20 - totalDeductions);
  const oralScore = sec3Score + sec4Score;
  const writtenScore = selectedCandidate ? selectedCandidate.writtenScore : 0;
  const finalScore100 = writtenScore + oralScore;

  let profileData = { tier: 'A1 (Beginner)', badgeBg: 'bg-[#ee665b]/15 text-[#c93f34]' };
  if (finalScore100 >= 40 && finalScore100 <= 59) {
    profileData = { tier: 'A2 (Elementary)', badgeBg: 'bg-[#ffc749]/35 text-[#1e2246]' };
  } else if (finalScore100 >= 60 && finalScore100 <= 79) {
    profileData = { tier: 'B1 (Intermediate)', badgeBg: 'bg-[#626a9f]/15 text-[#454d82]' };
  } else if (finalScore100 >= 80 && finalScore100 <= 89) {
    profileData = { tier: 'B2 (Upper Intermediate)', badgeBg: 'bg-[#16a37f]/15 text-[#128063]' };
  } else if (finalScore100 >= 90) {
    profileData = { tier: 'C1 / C2 (Advanced / Proficient)', badgeBg: 'bg-[#ffc749] text-[#1e2246]' };
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('placement_assessments')
        .update({
          oral_score: oralScore,
          final_level: profileData.tier,
          status: 'completed',
        })
        .eq('id', selectedCandidate.id);

      if (error) throw error;

      alert(`Successfully assigned ${selectedCandidate.name} to level ${profileData.tier}!`);
      setSelectedCandidate(null);
      setQScores({});
      setDeductions({});
      fetchCandidates();
    } catch (err) {
      console.error('Error updating assessment:', err);
      alert('Error saving evaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedCandidate) {
    return (
      <div className="flex flex-col w-full lg:h-[calc(100vh-150px)] relative z-10 pb-10 lg:pb-0">
        <div className="flex items-center gap-3.5 mb-6 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center font-bold transition-all active:scale-90 cursor-pointer shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#1e2246]">
              Evaluator Terminal
            </h2>
            <p className="text-[11px] font-bold text-[#454d82] uppercase tracking-widest">
              Pending Placement Assessments ({candidates.length})
            </p>
          </div>
        </div>

        <div className="ola-adm-glass flex-1 rounded-[2.25rem] p-4 sm:p-7 overflow-y-auto custom-scrollbar">
          {isLoadingCandidates ? (
            <div className="h-full flex items-center justify-center text-[#454d82] font-bold uppercase tracking-widest text-xs py-16">
              Loading pending assessments...
            </div>
          ) : candidates.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#626a9f] font-bold uppercase tracking-widest text-xs py-16">
              No pending assessments found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-white/80 hover:bg-white border border-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1e2246] truncate">
                      {cand.name}
                    </h3>
                    <div className="text-xs font-medium text-[#4c5384] mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{cand.email}</span>
                      <span>• {cand.phone}</span>
                      <span>• {cand.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                    <div className="bg-[#e7faf3] border border-[#16a37f]/40 rounded-xl px-3.5 py-1.5 text-center mr-1">
                      <span className="text-[9px] font-bold uppercase text-[#128063] block leading-none">
                        Written
                      </span>
                      <span className="text-base font-extrabold text-[#1e2246]">
                        {cand.writtenScore}
                        <span className="text-xs text-[#626a9f]">/50</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingAnswers(cand)}
                      className="w-9 h-9 rounded-xl bg-[#e8eaf7] hover:bg-[#454d82] text-[#454d82] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="View Written Answers"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOnboard({
                          firstName: cand.name.split(' ')[0],
                          lastName: cand.name.split(' ').slice(1).join(' '),
                          email: cand.email,
                          phone: cand.phone,
                          role: 'Student',
                        })
                      }
                      className="w-9 h-9 rounded-xl bg-[#e7faf3] hover:bg-[#16a37f] text-[#128063] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Onboard as Student"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOnboard({
                          firstName: cand.name.split(' ')[0],
                          lastName: cand.name.split(' ').slice(1).join(' '),
                          email: cand.email,
                          phone: cand.phone,
                          role: 'Teacher',
                        })
                      }
                      className="w-9 h-9 rounded-xl bg-[#fff3d1] hover:bg-[#454d82] text-[#1e2246] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Onboard as Teacher"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCandidate(cand.id)}
                      className="w-9 h-9 rounded-xl bg-[#ee665b]/15 hover:bg-[#ee665b] text-[#c93f34] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Assessment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(cand)}
                      className="ola-adm-btn-yellow px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer ml-1"
                    >
                      Evaluate →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VIEW WRITTEN ANSWERS MODAL */}
        {viewingAnswers && (
          <div
            onClick={(e) => e.target === e.currentTarget && setViewingAnswers(null)}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4"
          >
            <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-[#626a9f]/15 bg-white/55 shrink-0">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1e2246]">Answers: {viewingAnswers.name}</h3>
                  <p className="text-[11px] font-bold text-[#454d82] uppercase tracking-widest">
                    Written Placement Payload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingAnswers(null)}
                  className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] rounded-full text-[#1e2246] font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-3">
                {!viewingAnswers.rawAnswers ? (
                  <div className="text-center text-[#626a9f] uppercase tracking-wider font-bold text-xs py-10">
                    No raw answers saved for this submission.
                  </div>
                ) : (
                  Object.entries(viewingAnswers.rawAnswers).map(([qId, ans]) => (
                    <div key={qId} className="bg-white/80 border border-white rounded-2xl p-4 shadow-sm">
                      <div className="text-[#454d82] font-bold text-[10.5px] uppercase tracking-widest mb-1">
                        Question {qId}
                      </div>
                      <div className="text-[#1e2246] text-sm font-medium leading-relaxed">{String(ans)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full lg:h-[calc(100vh-150px)] relative z-10 pb-10 lg:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setSelectedCandidate(null)}
            className="w-10 h-10 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center font-bold cursor-pointer shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246]">
              Evaluating: {selectedCandidate.name}
            </h2>
            <p className="text-xs font-medium text-[#4c5384]">
              {selectedCandidate.phone} • {selectedCandidate.email}
            </p>
          </div>
        </div>

        <div className="bg-white/80 border border-white rounded-2xl px-4 py-2 text-right shadow-sm">
          <span className="text-[9.5px] font-bold uppercase text-[#626a9f] tracking-widest block">
            Prior Written Score
          </span>
          <span className="text-lg font-extrabold text-[#128063]">
            {writtenScore} <span className="text-xs text-[#626a9f]">/ 50</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* LEFT PANEL: ORAL QUESTION RUNNER */}
        <div className="ola-adm-glass flex-[1.4] rounded-[2rem] p-5 flex flex-col min-h-[420px] lg:h-full overflow-hidden">
          <div className="flex gap-2 border-b border-[#626a9f]/15 pb-3.5 mb-3.5 shrink-0 overflow-x-auto">
            {Object.keys(EVAL_QUESTIONS).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                  activeTab === tab
                    ? 'bg-[#1e2246] text-[#ffc749]'
                    : 'bg-white/75 text-[#454d82] hover:bg-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center bg-white/75 border border-white rounded-xl px-4 py-2.5 mb-3.5 shrink-0 text-xs font-bold text-[#454d82]">
            <span>
              Content: <strong className="text-[#128063] text-sm">{sec3Score}</strong> / 30
            </span>
            <span>
              Quality: <strong className="text-[#1e2246] text-sm">{sec4Score}</strong> / 20
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2.5">
            {EVAL_QUESTIONS[activeTab].map((q) => {
              const isRight = qScores[q.id];
              return (
                <div
                  key={q.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors ${
                    isRight
                      ? 'bg-[#e7faf3] border-[#16a37f]/45'
                      : 'bg-white/75 border-white'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-medium text-[#1e2246] leading-snug flex-1">
                    <strong className="text-[#454d82] mr-1.5">{q.id}.</strong>
                    {q.text}
                  </div>
                  <div className="flex gap-1.5 bg-[#e8eaf7] p-1 rounded-xl shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setQScores((prev) => ({ ...prev, [q.id]: false }))}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                        !isRight ? 'bg-[#ee665b] text-white' : 'text-[#50567d] hover:text-[#1e2246]'
                      }`}
                    >
                      Wrong
                    </button>
                    <button
                      type="button"
                      onClick={() => setQScores((prev) => ({ ...prev, [q.id]: true }))}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                        isRight ? 'bg-[#16a37f] text-white' : 'text-[#50567d] hover:text-[#1e2246]'
                      }`}
                    >
                      Right
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: DEDUCTIONS & FINAL SCORE */}
        <div className="ola-adm-glass flex-1 rounded-[2rem] p-5 flex flex-col min-h-[420px] lg:h-full overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#454d82] mb-3.5 shrink-0">
            Section 4: Paralinguistic Deductions
          </h3>

          <div className="flex flex-col gap-3 mb-5 shrink-0">
            {EVAL_DEDUCTIONS.map((cat, idx) => (
              <div key={idx} className="bg-white/75 border border-white rounded-2xl p-3.5 shadow-sm">
                <div className="text-xs font-bold text-[#1e2246] border-b border-[#626a9f]/15 pb-1.5 mb-2.5">
                  {cat.title}
                </div>
                <div className="flex flex-col gap-2">
                  {cat.items.map((item) => (
                    <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deductions[item.id] || false}
                        onChange={(e) => setDeductions((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[#ee665b] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#3b4170] flex-1">{item.label}</span>
                      <span className="text-[10.5px] font-bold text-[#c93f34] bg-[#ee665b]/12 px-2 py-0.5 rounded-md">
                        -{item.val}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto shrink-0 ola-adm-glass-gold rounded-3xl p-5 text-center flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82] mb-1">
              Final CEFR Placement Score
            </span>
            <div className="flex items-baseline gap-1.5 mb-1.5">
              <span className="text-5xl font-extrabold text-[#1e2246]">{finalScore100}</span>
              <span className="text-lg font-bold text-[#626a9f]">/ 100</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-[#4c5384] mb-3">
              <span>Written: {writtenScore}</span>
              <span>+</span>
              <span>Oral: {oralScore}</span>
            </div>
            <div className={`text-xs font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl w-full ${profileData.badgeBg}`}>
              {profileData.tier}
            </div>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="ola-adm-btn-yellow w-full mt-4 py-3 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Submit & Assign Level ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ADMIN TEACHER METRICS MODAL (Light Glass)
// ==========================================
const AdminTeacherMetricsModal = ({ isOpen, onClose, teacherId, teacherName, supabase }) => {
  const [activeTab, setActiveTab] = useState('PAYROLL');
  const [sessions, setSessions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState(null);

  useEffect(() => {
    if (!isOpen || !teacherId) return;
    const fetchMetrics = async () => {
      setLoading(true);
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', teacherId).single();
      if (profile) setTeacherProfile(profile);

      const { data: sessionData } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('status', 'completed')
        .gte('scheduled_at', firstDayOfMonth)
        .order('scheduled_at', { ascending: false });
      if (sessionData) setSessions(sessionData);

      const { data: shiftData } = await supabase
        .from('teacher_shifts')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('shift_date', firstDayOfMonth)
        .order('shift_date', { ascending: false });
      if (shiftData) setShifts(shiftData);

      const { data: evalData } = await supabase.from('class_evaluations').select('*').eq('teacher_id', teacherId);
      if (evalData) setEvaluations(evalData);

      setLoading(false);
    };
    fetchMetrics();
  }, [isOpen, teacherId, supabase]);

  if (!isOpen) return null;

  const totalSessionPay = sessions.reduce((sum, s) => sum + (Number(s.final_pay) || 0), 0);
  const totalShiftBonus = shifts.reduce((sum, s) => sum + (Number(s.bonus_earned) || 0), 0);
  const totalEarned = (totalSessionPay + totalShiftBonus).toFixed(2);

  const totalEvals = evaluations.length;
  let radarData = [
    { subject: 'Actitud', A: 100 },
    { subject: 'Claridad', A: 100 },
    { subject: 'Participación', A: 100 },
    { subject: 'Contenido', A: 100 },
    { subject: 'Tiempo', A: 100 },
  ];
  let globalRating = '5.0';

  if (totalEvals > 0) {
    const sum = (key) => evaluations.filter((e) => e[key] === true).length;
    radarData = [
      { subject: 'Actitud', A: (sum('q_demeanor') / totalEvals) * 100 },
      { subject: 'Claridad', A: (sum('q_clarity') / totalEvals) * 100 },
      { subject: 'Participación', A: (sum('q_facilitation') / totalEvals) * 100 },
      { subject: 'Contenido', A: (sum('q_content') / totalEvals) * 100 },
      { subject: 'Tiempo', A: (sum('q_time') / totalEvals) * 100 },
    ];
    const totalPositives =
      sum('q_demeanor') + sum('q_clarity') + sum('q_facilitation') + sum('q_content') + sum('q_time');
    globalRating = ((totalPositives / (totalEvals * 5)) * 5).toFixed(1);
  } else if (teacherProfile?.total_rating_questions > 0) {
    globalRating = ((teacherProfile.total_positive_ratings / teacherProfile.total_rating_questions) * 5).toFixed(1);
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-[#1e2246]/55 backdrop-blur-xl font-montserrat"
    >
      <div className="ola-adm-glass ola-adm-modal-in relative w-full max-w-4xl rounded-[2.25rem] flex flex-col h-[85vh] overflow-hidden">
        <div className="flex flex-col border-b border-[#626a9f]/15 shrink-0 bg-white/60 pt-5 px-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold text-[#128063] uppercase tracking-widest block">
                Instructor Payroll &amp; Quality
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246]">{teacherName}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2 bg-[#e8eaf7]/85 p-1 rounded-2xl border border-white">
            {['PAYROLL', 'SHIFTS', 'PERFORMANCE'].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-9 h-9 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
            </div>
          ) : activeTab === 'PAYROLL' ? (
            <div className="flex flex-col gap-5 h-full">
              <div className="ola-adm-glass-mint rounded-3xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#128063] uppercase tracking-widest mb-1">
                    Current Month Payout
                  </p>
                  <h3 className="text-4xl font-extrabold text-[#1e2246]">
                    ${totalEarned} <span className="text-base font-bold text-[#4c5384]">USD</span>
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#128063] bg-white/85 px-3.5 py-1.5 rounded-full border border-[#16a37f]/35">
                  {sessions.length} Completed
                </span>
              </div>

              <div className="flex-1 bg-white/75 border border-white rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 p-3.5 bg-[#e8eaf7]/75 border-b border-white text-[9.5px] font-bold text-[#454d82] uppercase tracking-widest">
                  <div className="col-span-2">Session Date</div>
                  <div className="hidden md:block">Base Rate</div>
                  <div className="text-center text-[#c93f34]">Penalty</div>
                  <div className="text-center text-[#b37a00]">Bonus</div>
                  <div className="text-right text-[#128063]">Final Pay</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {sessions.length === 0 ? (
                    <div className="text-center py-10 text-[#626a9f] font-bold uppercase tracking-widest text-xs">
                      No classes completed this month.
                    </div>
                  ) : (
                    sessions.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-white rounded-xl border border-[#dfe2f2] text-xs items-center"
                      >
                        <div className="col-span-2 font-bold text-[#1e2246] truncate">
                          {new Date(s.scheduled_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="hidden md:block text-[#4c5384] font-medium">
                          ${s.base_rate_applied || '0.00'}
                        </div>
                        <div className="text-center font-bold text-[#c93f34]">${s.minute_penalty || '0.00'}</div>
                        <div className="text-center font-bold text-[#b37a00]">
                          ${s.performance_bonus || '0.00'}
                        </div>
                        <div className="text-right font-extrabold text-[#128063]">${s.final_pay || '0.00'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'SHIFTS' ? (
            <div className="flex flex-col gap-5 h-full">
              <div className="ola-adm-glass-gold rounded-3xl p-5">
                <p className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1">
                  Total Shift Bonuses
                </p>
                <h3 className="text-4xl font-extrabold text-[#1e2246]">
                  ${totalShiftBonus.toFixed(2)} <span className="text-base font-bold text-[#4c5384]">USD</span>
                </h3>
              </div>

              <div className="flex-1 bg-white/75 border border-white rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="grid grid-cols-3 gap-2 p-3.5 bg-[#e8eaf7]/75 border-b border-white text-[9.5px] font-bold text-[#454d82] uppercase tracking-widest">
                  <div>Assigned Date</div>
                  <div className="text-center">Status</div>
                  <div className="text-right text-[#b37a00]">Bonus Earned</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {shifts.length === 0 ? (
                    <div className="text-center py-10 text-[#626a9f] font-bold uppercase tracking-widest text-xs">
                      No shifts assigned this month.
                    </div>
                  ) : (
                    shifts.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-3 gap-2 p-3.5 bg-white rounded-xl border border-[#dfe2f2] text-xs items-center"
                      >
                        <div className="font-bold text-[#1e2246]">
                          {new Date(s.shift_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase ${
                              s.status === 'completed'
                                ? 'bg-[#e7faf3] text-[#128063]'
                                : s.status === 'missed'
                                ? 'bg-[#ee665b]/15 text-[#c93f34]'
                                : 'bg-[#e8eaf7] text-[#454d82]'
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>
                        <div className="text-right font-extrabold text-[#1e2246]">
                          ${s.bonus_earned || '0.00'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-5 h-full">
              <div className="bg-white/80 border border-white rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mb-1">
                  Global Star Rating
                </p>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-5xl font-extrabold text-[#1e2246]">{globalRating}</span>
                  <span className="text-xl font-bold text-[#626a9f]">/ 5.0</span>
                </div>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(98,106,159,0.25)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b4170', fontSize: 11, fontWeight: 700 }} />
                      <Radar name="Teacher" dataKey="A" stroke="#454d82" strokeWidth={2.5} fill="#ffc749" fillOpacity={0.55} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white/80 border border-white rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#fff3d1] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-[#1e2246] uppercase tracking-tight mb-2">
                  Evaluations Tally ({totalEvals})
                </h3>
                <p className="text-xs text-[#4c5384] font-medium leading-relaxed">
                  Plots the average percentage of positive ratings submitted by students across OutLoud&apos;s 5 core pedagogical standards.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// ==========================================
// MAIN ADMIN HUB COMPONENT
// ==========================================
const AdminHub = () => {
  const [impersonatingStudent, setImpersonatingStudent] = useState(null);
  const [activeModule, setActiveModule] = useState('ACCOUNTS');

  // Provisioning State
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);
  const [provisioningInitialData, setProvisioningInitialData] = useState(null);

  // Non-blocking Status Toast
  const [adminToast, setAdminToast] = useState(null);
  const showToast = (message, tone = 'success') => {
    setAdminToast({ message, tone });
    setTimeout(() => {
      setAdminToast((curr) => (curr?.message === message ? null : curr));
    }, 3400);
  };

  // Responsive Architecture State
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [accountsView, setAccountsView] = useState('OVERVIEW');
  const [settingsView, setSettingsView] = useState('MENU');

  // Profile Settings State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    id: null,
    firstName: '',
    lastName: '',
    role: 'Admin',
    password: '••••••••',
    avatarUrl: '',
  });

  // --- ANTI-COPY OVERRIDE FOR ADMINS ---
  useEffect(() => {
    document.oncontextmenu = null;
    document.onselectstart = null;
    document.oncopy = null;
    document.onpaste = null;

    const allowCopyPaste = (e) => e.stopPropagation();
    const adminRoot = document.getElementById('admin-hub-root');

    if (adminRoot) {
      adminRoot.addEventListener('contextmenu', allowCopyPaste, true);
      adminRoot.addEventListener('copy', allowCopyPaste, true);
      adminRoot.addEventListener('paste', allowCopyPaste, true);
      adminRoot.addEventListener('selectstart', allowCopyPaste, true);
    }

    return () => {
      if (adminRoot) {
        adminRoot.removeEventListener('contextmenu', allowCopyPaste, true);
        adminRoot.removeEventListener('copy', allowCopyPaste, true);
        adminRoot.removeEventListener('paste', allowCopyPaste, true);
        adminRoot.removeEventListener('selectstart', allowCopyPaste, true);
      }
    };
  }, []);

  // Fetch true admin data on load
  useEffect(() => {
    const loadMyProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setAdminProfile({
            id: user.id,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            role: data.role || 'Admin',
            password: '••••••••',
            avatarUrl: data.avatar_url || '',
          });
        }
      }
    };
    loadMyProfile();
  }, []);

  const handleSaveAdminProfile = async () => {
    if (!adminProfile.id) return showToast('No active user session found.', 'error');
    setIsSavingProfile(true);
    try {
      const updates = {
        first_name: adminProfile.firstName.trim(),
        last_name: adminProfile.lastName.trim(),
        avatar_url: adminProfile.avatarUrl.trim() || null,
      };

      if (adminProfile.password !== '••••••••' && adminProfile.password.trim() !== '') {
        updates.assigned_password = adminProfile.password.trim();
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', adminProfile.id);
      if (error) throw error;

      showToast('Profile settings saved permanently!', 'success');
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error saving profile: ' + err.message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ==========================================
  // DIRECTORY & LIVE HEARTBEAT STATES
  // ==========================================
  const [directoryTab, setDirectoryTab] = useState('students');
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dirFilters, setDirFilters] = useState({ level: 'ALL', status: 'ALL', cohort: 'ALL', payment: 'ALL' });

  useEffect(() => {
    setSearchQuery('');
    setDirFilters({ level: 'ALL', status: 'ALL', cohort: 'ALL', payment: 'ALL' });
  }, [directoryTab]);

  const getFilteredDirectory = () => {
    return directoryUsers.filter((user) => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchStr) ||
        (user.email || '').toLowerCase().includes(searchStr) ||
        (user.whatsapp || '').includes(searchStr);

      if (directoryTab !== 'students') return matchesSearch;

      const matchesLevel = dirFilters.level === 'ALL' || (user.level && user.level.includes(dirFilters.level));
      const matchesStatus = dirFilters.status === 'ALL' || user.status === dirFilters.status;
      const matchesCohort = dirFilters.cohort === 'ALL' || String(user.cohort) === String(dirFilters.cohort);
      const matchesPayment = dirFilters.payment === 'ALL' || user.payment_status === dirFilters.payment;

      return matchesSearch && matchesLevel && matchesStatus && matchesCohort && matchesPayment;
    });
  };
  const filteredDirectory = getFilteredDirectory();

  const [activeStudentsPct, setActiveStudentsPct] = useState(0);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [droppedSessionTarget, setDroppedSessionTarget] = useState(null);
  const alarmedSessions = useRef(new Set());

  const fetchDashboardStats = async () => {
    try {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student');
      const { count: activeStudents } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student')
        .gte('last_active_at', tenDaysAgo);

      if (totalStudents > 0) setActiveStudentsPct(Math.round((activeStudents / totalStudents) * 100));
      else setActiveStudentsPct(0);

      const { data: activities } = await supabase
        .from('live_sessions')
        .select(
          'id, title, class_type, scheduled_at, status, last_ping_at, teacher_id, actual_start_at, teacher:profiles!teacher_id(first_name, last_name)'
        )
        .in('status', ['booked', 'in_progress'])
        .not('teacher_id', 'is', null)
        .order('scheduled_at', { ascending: true })
        .limit(5);

      setUpcomingActivities(activities || []);

      if (activities) {
        const now = new Date().getTime();
        activities.forEach((act) => {
          let triggerAlarm = false;
          let isCritical = false;
          let alarmReason = '';

          if (act.status === 'in_progress' && act.last_ping_at) {
            const pingStr = act.last_ping_at.endsWith('Z') ? act.last_ping_at : act.last_ping_at + 'Z';
            const msSincePing = now - new Date(pingStr).getTime();
            if (msSincePing > 120000) {
              triggerAlarm = true;
              isCritical = msSincePing > 600000;
              alarmReason = 'lost_connection';
            }
          }

          if (act.status === 'booked' && !act.actual_start_at && act.scheduled_at) {
            const schedStr = act.scheduled_at.endsWith('Z') ? act.scheduled_at : act.scheduled_at + 'Z';
            const msSinceStart = now - new Date(schedStr).getTime();
            if (msSinceStart > 120000) {
              triggerAlarm = true;
              isCritical = msSinceStart > 600000;
              alarmReason = 'late_start';
            }
          }

          if (triggerAlarm && !alarmedSessions.current.has(act.id)) {
            alarmedSessions.current.add(act.id);
            setDroppedSessionTarget({ ...act, isCritical, alarmReason });
            setShowSubModal(true);

            if (typeof Notification !== 'undefined') {
              if (Notification.permission === 'granted') {
                new Notification('CRITICAL: Teacher Disconnected', {
                  body: `Prof. ${act.teacher?.first_name} has lost connection. Reassign immediately.`,
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then((permission) => {
                  if (permission === 'granted') {
                    new Notification('CRITICAL: Teacher Disconnected', {
                      body: `Prof. ${act.teacher?.first_name} has lost connection.`,
                    });
                  }
                });
              }
            }

            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
            audio.play().catch(() => {});
          }
        });
      }
    } catch (err) {
      console.error('Dashboard Stats Fetch Error:', err);
    }
  };

  const fetchDirectory = async (roleType) => {
    setIsLoadingDirectory(true);
    try {
      const roleMap = { students: 'Student', teachers: 'Teacher', admins: 'Admin' };
      const targetRole = roleMap[roleType] || 'Student';

      let combinedUsers = [];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', targetRole);

      if (profilesError) throw profilesError;
      combinedUsers = profilesData || [];

      if (roleType === 'students') {
        const { data: regData, error: regError } = await supabase
          .from('registrations')
          .select('*')
          .eq('status', 'pending');

        if (regError) throw regError;

        if (regData && regData.length > 0) {
          const pendingStudents = regData.map((reg) => ({
            id: reg.id,
            full_name: reg.full_name,
            first_name: reg.full_name?.split(' ')[0] || 'Nuevo',
            last_name: reg.full_name?.split(' ').slice(1).join(' ') || 'Prospecto',
            email: reg.email,
            whatsapp: reg.phone,
            status: 'pending',
            role: 'Student',
            reason: reg.reason,
            fluent_time: reg.fluent_time,
            interest: reg.interest,
            created_at: reg.created_at,
          }));

          combinedUsers = [...pendingStudents, ...combinedUsers];
        }
      }

      combinedUsers.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        const nameA = (a.first_name || '').toLowerCase();
        const nameB = (b.first_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setDirectoryUsers(combinedUsers);
    } catch (err) {
      console.error('Directory Fetch Error:', err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  const handleDeleteUser = async (user, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar a ${user.first_name}? Esta acción borrará sus datos del directorio.`
      )
    ) {
      return;
    }

    try {
      if (user.status === 'pending') {
        const { error } = await supabase.from('registrations').delete().eq('id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('profiles').delete().eq('id', user.id);
        if (error) throw error;
      }

      showToast('Usuario eliminado correctamente del directorio.', 'success');
      fetchDirectory(directoryTab);
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error al eliminar usuario: ' + error.message, 'error');
    }
  };

  useEffect(() => {
    if (activeModule === 'ACCOUNTS') {
      fetchDirectory(directoryTab);
      fetchDashboardStats();

      const interval = setInterval(() => {
        fetchDashboardStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeModule, directoryTab]);

  // --- MASTER ALARM TRIGGER ---
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    let shouldPlaySiren = false;
    const now = new Date().getTime();

    upcomingActivities.forEach((act) => {
      let triggerAlarm = false;
      let isCritical = false;
      let alarmReason = '';

      if (act.status === 'in_progress' && act.last_ping_at) {
        const pingStr = act.last_ping_at.endsWith('Z') ? act.last_ping_at : act.last_ping_at + 'Z';
        const msSincePing = now - new Date(pingStr).getTime();
        if (msSincePing > 120000) {
          triggerAlarm = true;
          isCritical = msSincePing > 600000;
          alarmReason = 'lost_connection';
        }
      }

      if (act.status === 'booked' && !act.actual_start_at && act.scheduled_at) {
        const schedStr = act.scheduled_at.endsWith('Z') ? act.scheduled_at : act.scheduled_at + 'Z';
        const msSinceStart = now - new Date(schedStr).getTime();
        if (msSinceStart > 120000) {
          triggerAlarm = true;
          isCritical = msSinceStart > 600000;
          alarmReason = 'late_start';
        }
      }

      if (triggerAlarm && !alarmedSessions.current.has(act.id)) {
        alarmedSessions.current.add(act.id);
        setDroppedSessionTarget({ ...act, isCritical, alarmReason });
        setShowSubModal(true);
        shouldPlaySiren = true;

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const msg =
            alarmReason === 'late_start'
              ? `El Prof. ${act.teacher?.first_name} lleva >2 mins de retraso para abrir la sala.`
              : `El Prof. ${act.teacher?.first_name} se ha desconectado de la sala.`;
          new Notification('ALERTA CRÍTICA', { body: msg });
        }
      }
    });

    if (shouldPlaySiren) {
      new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg').play().catch(() => {});
    }
  }, [upcomingActivities]);

  // ==========================================
  // COMMUNICATIONS MODULE STATES & LISTENERS
  // ==========================================
  const [activeCommsTab, setActiveCommsTab] = useState('General');
  const [announcements, setAnnouncements] = useState([]);
  const [isMobileCommsComposerOpen, setIsMobileCommsComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [chatInputs, setChatInputs] = useState({ forum: '' });
  const [forumLevelFilter] = useState('A1');
  const [forumPost, setForumPost] = useState(null);
  const [, setForumReplies] = useState([]);

  useEffect(() => {
    if (activeModule !== 'COMMUNICATIONS') return;

    const fetchCommsData = async () => {
      try {
        if (!['Chat', 'Forum'].includes(activeCommsTab)) {
          const targetAudience =
            activeCommsTab === 'Staff'
              ? 'STAFF_ONLY'
              : activeCommsTab === 'General'
              ? 'EVERYONE_WITH_STAFF'
              : `LEVEL_${activeCommsTab}`;
          const { data } = await supabase
            .from('announcements')
            .select('*')
            .eq('audience', targetAudience)
            .order('created_at', { ascending: false });
          setAnnouncements(data || []);
        } else if (activeCommsTab === 'Forum') {
          const { data: postData } = await supabase
            .from('forum_posts')
            .select('*')
            .eq('target_level', forumLevelFilter)
            .maybeSingle();
          setForumPost(postData || null);

          if (postData) {
            const { data: repliesData } = await supabase
              .from('forum_replies')
              .select('*, author:profiles!author_id(first_name, last_name, avatar_url, level)')
              .eq('thread_id', postData.id)
              .order('created_at', { ascending: false });
            setForumReplies(repliesData || []);
          } else {
            setForumReplies([]);
          }
        }
      } catch (err) {
        console.error('Fetch Error:', err);
      }
    };
    fetchCommsData();
  }, [activeModule, activeCommsTab, forumLevelFilter]);

  const handlePublishAnnouncement = async () => {
    if (!postContent.trim() || !postCategory) return showToast('Contenido y categoría son obligatorios.', 'error');
    setIsPublishing(true);
    const targetAudience =
      activeCommsTab === 'Staff'
        ? 'STAFF_ONLY'
        : activeCommsTab === 'General'
        ? 'EVERYONE_WITH_STAFF'
        : `LEVEL_${activeCommsTab}`;
    try {
      await supabase.from('announcements').insert({
        title: postCategory.toUpperCase(),
        content: postContent.trim(),
        audience: targetAudience,
        category: postCategory,
        image_url: postImageUrl || null,
      });
      setPostContent('');
      setPostCategory('');
      setPostImageUrl('');
      setShowImageInput(false);
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('audience', targetAudience)
        .order('created_at', { ascending: false });
      setAnnouncements(data || []);
      showToast('Anuncio publicado en el Info Board.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Error publicando anuncio.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('¿Eliminar este anuncio?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast('Anuncio eliminado.', 'info');
  };

  // ==========================================
  // PRESERVED CONTENT EDITING STATE & LOGIC
  // ==========================================
  const [isMobileContentSettingsOpen, setIsMobileContentSettingsOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentType, setContentType] = useState('Lesson');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [lessonScreens, setLessonScreens] = useState([Date.now()]);
  const [workbookScreens, setWorkbookScreens] = useState([Date.now() + 1]);
  const [canvasElements, setCanvasElements] = useState([]);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [activeScreenId, setActiveScreenId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  const saveSnapshot = (elements = canvasElements) =>
    setCanvasHistory((prev) => [...prev.slice(-29), JSON.parse(JSON.stringify(elements))]);

  const [activeModal, setActiveModal] = useState(null);
  const [editingElementId, setEditingElementId] = useState(null);
  const [mediaTarget, setMediaTarget] = useState({ id: null, type: 'image' });
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [focusedTextId, setFocusedTextId] = useState(null);
  const [rcStates] = useState({});
  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({});
  const [, setTouchDragState] = useState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });

  useEffect(() => {
    setSelectedUnit('');
  }, [selectedLevel]);

  useEffect(() => {
    const loadBlueprint = async () => {
      if (!selectedLevel || !selectedUnit || !contentType) return;

      try {
        const { data, error } = await supabase
          .from('content_blueprints')
          .select('*')
          .eq('level', selectedLevel)
          .eq('unit', selectedUnit)
          .eq('content_type', contentType)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (contentType === 'Manuals' || contentType === 'Cue Cards') {
            setPdfUrl(data.blueprint_data?.pdfUrl || '');
          } else {
            setCanvasElements(data.blueprint_data?.elements || []);
            if (contentType === 'Lesson') setLessonScreens(data.screens || [Date.now()]);
            else setWorkbookScreens(data.screens || [Date.now()]);
          }
        } else {
          setCanvasElements([]);
          setPdfUrl('');
          if (contentType === 'Lesson') setLessonScreens([Date.now()]);
          else setWorkbookScreens([Date.now()]);
        }
      } catch (err) {
        console.error('Error loading blueprint:', err);
      }
    };

    loadBlueprint();
  }, [selectedLevel, selectedUnit, contentType]);

  useEffect(() => {
    if (contentType === 'Lesson') setActiveScreenId(lessonScreens[0]);
    else setActiveScreenId(workbookScreens[0]);
  }, [contentType, lessonScreens, workbookScreens]);

  const unitOptions = (() => {
    if (!selectedLevel) return [];
    const base = selectedLevel.split(':')[0].trim();
    const bounds = {
      A1: { start: 1, end: 12 },
      A2: { start: 13, end: 24 },
      B1: { start: 25, end: 36 },
      B2: { start: 37, end: 48 },
      C1: { start: 49, end: 70 },
      C2: { start: 71, end: 92 },
    }[base];
    if (!bounds) return [];
    return Array.from({ length: bounds.end - bounds.start + 1 }, (_, i) => `Unit ${bounds.start + i}`);
  })();

  const toolOptions = ['Lesson', 'Manuals', 'Cue Cards'].includes(contentType) ? LESSON_TOOLS : WORKBOOK_TOOLS;

  const handleToolSelect = (tool) => {
    if (tool === 'Video') {
      setMediaTarget({ id: null, type: 'video' });
      setActiveModal('video');
    } else if (tool === 'Image') {
      setMediaTarget({ id: null, type: 'image' });
      setActiveModal('media_upload');
    } else if (tool === 'Audio') {
      setMediaTarget({ id: null, type: 'audio' });
      setActiveModal('media_upload');
    } else if (tool === 'Record & Compare') spawnInteractiveElement('record_compare');
    else if (tool === 'Text') spawnInteractiveElement('text');
    else if (tool === 'Fill in the blank') {
      setEditingElementId(null);
      setActiveModal('fill_in_the_blank');
    } else if (tool === 'Shape') {
      setEditingElementId(null);
      setActiveModal('shape');
    } else if (tool === 'Drag and drop') {
      setEditingElementId(null);
      setActiveModal('drag_and_drop');
    } else if (tool === 'Short answer') {
      setEditingElementId(null);
      setActiveModal('short_answer');
    } else if (tool === 'Multiple selection') {
      setEditingElementId(null);
      setActiveModal('multiple_selection');
    } else if (tool === 'Slider bar') {
      setEditingElementId(null);
      setActiveModal('slider_bar');
    } else if (tool === 'Crossword') {
      setEditingElementId(null);
      setActiveModal('crossword');
    } else if (tool === 'Word search') {
      setEditingElementId(null);
      setActiveModal('word_search');
    } else if (tool === 'Next Screen Button') spawnInteractiveElement('nav_button');
  };

  const spawnInteractiveElement = (type) => {
    const newElement = { id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId, data: {} };
    if (type === 'text') {
      newElement.htmlContent = `<div style="text-align: center;"><span style="font-family: Montserrat; font-size: 26px; font-weight: 800; color: #1e2246; text-transform: uppercase;">A1-U1: ACTIVITY TITLE</span><br/><span style="font-family: Montserrat; font-size: 14px; font-weight: 500; color: #4c5384;">Type your descriptor here. This text box auto resizes for height.</span></div>`;
    }
    setCanvasElements([...canvasElements, newElement]);
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (focusedTextId) {
      const liveNode = document.querySelector(`#element-${focusedTextId} .rich-text-content`);
      if (liveNode) {
        setCanvasElements((prev) =>
          prev.map((p) => (p.id === focusedTextId ? { ...p, htmlContent: liveNode.innerHTML } : p))
        );
      }
    }
  };

  const handleDeleteScreen = (screenIdToDelete) => {
    saveSnapshot();
    if (contentType === 'Lesson') {
      if (lessonScreens.length <= 1) return showToast('Cannot delete the only screen.', 'error');
      setLessonScreens((prev) => prev.filter((id) => id !== screenIdToDelete));
    } else {
      if (workbookScreens.length <= 1) return showToast('Cannot delete the only screen.', 'error');
      setWorkbookScreens((prev) => prev.filter((id) => id !== screenIdToDelete));
    }
    setCanvasElements((prev) => prev.filter((el) => el.screenId !== screenIdToDelete));
  };

  const handleDeleteElement = (id) => {
    saveSnapshot();
    setCanvasElements(canvasElements.filter((el) => el.id !== id));
  };

  const handleAddMedia = () => {
    if (!mediaUrlInput) return;
    saveSnapshot();
    if (mediaTarget.id) {
      setCanvasElements((prev) =>
        prev.map((el) => {
          if (el.id === mediaTarget.id) {
            const newData = { ...el.data };
            if (mediaTarget.type === 'image') newData.imageUrl = mediaUrlInput;
            if (mediaTarget.type === 'audio') newData.audioUrl = mediaUrlInput;
            return { ...el, data: newData };
          }
          return el;
        })
      );
    } else {
      const newElement = {
        id: `${mediaTarget.type}_${Date.now()}`,
        type: mediaTarget.type,
        url: mediaUrlInput,
        screenId: activeScreenId,
      };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null);
    setMediaUrlInput('');
    setMediaTarget({ id: null, type: 'image' });
  };

  const handleRemoveMedia = (elId, mediaType) => {
    saveSnapshot();
    setCanvasElements((prev) =>
      prev.map((el) => {
        if (el.id === elId) {
          const newData = { ...el.data };
          if (mediaType === 'image') delete newData.imageUrl;
          if (mediaType === 'audio') delete newData.audioUrl;
          return { ...el, data: newData };
        }
        return el;
      })
    );
  };

  const handleSaveData = (id, newData) => {
    saveSnapshot();
    setCanvasElements((prev) => prev.map((el) => (el.id === id ? { ...el, data: newData } : el)));
  };

  const handleSaveModal = (type, data) => {
    saveSnapshot();
    if (editingElementId) {
      setCanvasElements((prev) =>
        prev.map((el) => (el.id === editingElementId ? { ...el, data: { ...el.data, ...data } } : el))
      );
    } else {
      const newElement = { id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId, data: data };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null);
    setEditingElementId(null);
  };

  const handleDuplicateElement = (idToDuplicate) => {
    saveSnapshot();
    const elementToClone = canvasElements.find((el) => el.id === idToDuplicate);
    if (!elementToClone) return;

    let currentHtmlContent = elementToClone.htmlContent || '';
    if (elementToClone.type === 'text') {
      const liveNode = document.getElementById(`element-${elementToClone.id}`);
      if (liveNode) currentHtmlContent = liveNode.innerHTML;
    }

    const clonedElement = {
      ...elementToClone,
      id: `${elementToClone.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      data: elementToClone.data ? JSON.parse(JSON.stringify(elementToClone.data)) : {},
      htmlContent: currentHtmlContent,
    };

    setCanvasElements((prev) => {
      const syncedPrev = prev.map((el) => {
        if (el.id === idToDuplicate && el.type === 'text') {
          const liveNode = document.getElementById(`element-${el.id}`);
          if (liveNode) return { ...el, htmlContent: liveNode.innerHTML };
        }
        return el;
      });
      const index = syncedPrev.findIndex((el) => el.id === idToDuplicate);
      const newElementsArray = [...syncedPrev];
      newElementsArray.splice(index + 1, 0, clonedElement);
      return newElementsArray;
    });
  };

  const handleExpandWorkspace = () => {
    saveSnapshot();
    const newId = Date.now();
    if (contentType === 'Lesson') setLessonScreens((prev) => [...prev, newId]);
    else setWorkbookScreens((prev) => [...prev, newId]);
  };

  const handleDuplicateScreen = () => {
    saveSnapshot();
    const newScreenId = Date.now();
    if (contentType === 'Lesson') setLessonScreens([...lessonScreens, newScreenId]);
    else setWorkbookScreens([...workbookScreens, newScreenId]);

    setCanvasElements((prev) => {
      const syncedPrev = prev.map((el) => {
        if (el.screenId === activeScreenId && el.type === 'text') {
          const liveNode = document.getElementById(`element-${el.id}`);
          if (liveNode) return { ...el, htmlContent: liveNode.innerHTML };
        }
        return el;
      });

      const elementsToClone = syncedPrev.filter((el) => el.screenId === activeScreenId);
      const clonedElements = elementsToClone.map((el) => ({
        ...el,
        id: `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        screenId: newScreenId,
        data: el.data ? JSON.parse(JSON.stringify(el.data)) : undefined,
        htmlContent: el.htmlContent || '',
      }));

      return [...syncedPrev, ...clonedElements];
    });
  };

  const handleUndoWorkspace = () => {
    if (canvasHistory.length > 0) {
      const previousState = canvasHistory[canvasHistory.length - 1];
      setCanvasHistory((prev) => prev.slice(0, -1));
      setCanvasElements(previousState);
    }
  };

  const handleRcClick = async () => {};

  const handleConfirmSave = async () => {
    if (!selectedLevel || !selectedUnit || !contentType) {
      showToast('Select Level, Unit, and Content Type before saving.', 'error');
      setIsSaveModalOpen(false);
      return;
    }
    setIsSaving(true);

    const payload = {
      level: selectedLevel,
      unit: selectedUnit,
      content_type: contentType,
      updated_at: new Date().toISOString(),
    };

    if (contentType === 'Manuals' || contentType === 'Cue Cards') {
      payload.blueprint_data = { pdfUrl: pdfUrl };
      payload.screens = [Date.now()];
    } else {
      const syncedElements = canvasElements.map((el) => {
        if (el.type === 'text') {
          const liveNode = document.getElementById(`element-${el.id}`);
          if (liveNode) return { ...el, htmlContent: liveNode.innerHTML };
        }
        return el;
      });
      setCanvasElements(syncedElements);
      payload.screens = contentType === 'Lesson' ? lessonScreens : workbookScreens;
      payload.blueprint_data = { elements: syncedElements };
    }

    try {
      const { error: blueprintError } = await supabase
        .from('content_blueprints')
        .upsert(payload, { onConflict: 'level,unit,content_type' })
        .select('id')
        .single();

      if (blueprintError) throw blueprintError;
      showToast('Changes saved and pushed live!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error saving: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
      setIsSaveModalOpen(false);
    }
  };

  const activeScreenArray = contentType === 'Lesson' ? lessonScreens : workbookScreens;

  // =====================================================
  // MODULE 1: ACCOUNTS (LIGHT-GLASS BENTO COMMAND CENTER)
  // =====================================================
  const renderAccounts = () => (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 w-full max-w-[1440px] lg:h-[calc(100vh-145px)] pb-10 lg:pb-0">
      {/* COLUMN 1: Active Pulse Ring & Live Class Monitor */}
      <div className="lg:col-span-3 flex flex-col gap-5 shrink-0 lg:h-full">
        {/* ACTIVE STUDENTS BENTO RING */}
        <div className="ola-adm-glass rounded-[2rem] p-5 flex flex-col items-center justify-center relative shrink-0 lg:h-[38%]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82] mb-2">
            10-Day Pulse
          </span>
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0 mb-1.5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(98,106,159,0.18)" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#olaAdminPulseGrad)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 - (activeStudentsPct / 100) * (2 * Math.PI * 40)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="olaAdminPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#626a9f" />
                  <stop offset="100%" stopColor="#ffc749" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-[#1e2246] leading-none">{activeStudentsPct}%</span>
            </div>
          </div>
          <h3 className="text-[#1e2246] font-bold text-[11px] tracking-widest uppercase text-center">
            Active Students
          </h3>
        </div>

        {/* LIVE ACTIVITIES MONITOR */}
        <div className="ola-adm-glass rounded-[2rem] p-5 flex flex-col flex-1 min-h-[280px] lg:min-h-0">
          <div className="flex items-center justify-between mb-3.5 shrink-0">
            <h3 className="text-[#1e2246] font-extrabold text-base tracking-tight">Live Monitor</h3>
            <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a37f] animate-pulse" />
              30s Ping
            </span>
          </div>

          <ul className="space-y-2.5 text-xs font-medium flex-1 overflow-y-auto custom-scrollbar pr-1 mb-4">
            {upcomingActivities.length === 0 ? (
              <li className="text-center text-[#626a9f] uppercase tracking-wider font-bold text-[11px] py-8">
                No upcoming live sessions
              </li>
            ) : (
              upcomingActivities.map((act) => {
                const isLive = act.status === 'in_progress';
                let isDropped = false;
                let isCritical = false;

                if (isLive && act.last_ping_at) {
                  const msSincePing = new Date().getTime() - new Date(act.last_ping_at).getTime();
                  if (msSincePing > 120000) isDropped = true;
                  if (msSincePing > 600000) isCritical = true;
                }

                return (
                  <li
                    key={act.id}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-colors ${
                      isCritical
                        ? 'bg-[#ee665b]/20 border-[#ee665b]'
                        : isDropped
                        ? 'bg-[#ee665b]/12 border-[#ee665b]/60'
                        : isLive
                        ? 'bg-[#e7faf3] border-[#16a37f]/40'
                        : 'bg-white/75 border-white'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isDropped
                          ? `bg-[#ee665b] ${isCritical ? 'animate-ping' : 'animate-pulse'}`
                          : isLive
                          ? 'bg-[#16a37f] animate-pulse'
                          : 'bg-[#626a9f]/40'
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-bold truncate block ${
                          isDropped ? 'text-[#c93f34]' : isLive ? 'text-[#128063]' : 'text-[#1e2246]'
                        }`}
                      >
                        {new Date(act.scheduled_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        • {act.title || act.class_type}
                      </span>
                      <span className="text-[10px] text-[#50567d] font-semibold uppercase block truncate">
                        Prof. {act.teacher?.first_name} {act.teacher?.last_name} {isCritical && '• MIA > 10m'}
                      </span>
                    </div>

                    {isDropped && (
                      <button
                        type="button"
                        onClick={() => {
                          setDroppedSessionTarget({ ...act, isCritical });
                          setShowSubModal(true);
                        }}
                        className="bg-[#ee665b] hover:brightness-110 text-white text-[9px] font-bold uppercase px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer shadow-sm"
                      >
                        {isCritical ? 'Resolve' : 'SOS'}
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          <button
            type="button"
            onClick={() => setActiveModule('CALENDARS')}
            className="ola-adm-btn-outline w-full py-3 px-4 font-bold text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shrink-0 mt-auto cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#454d82]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Manage Substitutes</span>
          </button>
        </div>
      </div>

      {/* COLUMN 2: Hero Illustrated Bento Action Cards */}
      <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 lg:gap-5 shrink-0 lg:h-full">
        {/* HERO BENTO 1: CREATE ACCOUNT */}
        <button
          type="button"
          onClick={() => {
            setProvisioningInitialData(null);
            setIsProvisioningModalOpen(true);
          }}
          className="ola-adm-glass-gold ola-adm-bento w-full rounded-[2rem] p-5 sm:p-6 flex flex-col items-center justify-between text-center cursor-pointer focus:outline-none group"
        >
          <span className="self-start text-[9.5px] font-bold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-2.5 py-1 rounded-full">
            Provisioning
          </span>

          <div className="my-3 ola-adm-float">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.4rem] bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246] flex items-center justify-center text-[#1e2246] group-hover:scale-105 transition-transform">
              <svg className="w-9 h-9 sm:w-10 sm:h-10" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-[#1e2246] font-extrabold text-lg sm:text-xl tracking-tight">Create Account</h3>
            <p className="text-[11px] font-medium text-[#4c5384] mt-0.5 hidden sm:block">
              Onboard students, teachers &amp; staff
            </p>
          </div>
        </button>

        {/* HERO BENTO 2: STATISTICS HUB */}
        <button
          type="button"
          onClick={() => setAccountsView('STATISTICS')}
          className="ola-adm-glass-indigo ola-adm-bento w-full rounded-[2rem] p-5 sm:p-6 flex flex-col items-center justify-between text-center text-white cursor-pointer focus:outline-none group"
        >
          <span className="self-start text-[9.5px] font-bold uppercase tracking-widest bg-white/15 border border-white/25 text-[#ffc749] px-2.5 py-1 rounded-full">
            Intelligence
          </span>

          <div className="my-3 ola-adm-float" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.4rem] bg-white/15 border-2 border-[#ffc749] flex items-center justify-center text-[#ffc749] group-hover:scale-105 transition-transform">
              <svg className="w-9 h-9 sm:w-10 sm:h-10" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">Statistics</h3>
            <p className="text-[11px] font-medium text-white/80 mt-0.5 hidden sm:block">
              Growth, retention &amp; academic KPIs
            </p>
          </div>
        </button>
      </div>

      {/* COLUMN 3: Searchable Light-Glass Directory */}
      <div className="lg:col-span-6 ola-adm-glass rounded-[2.25rem] p-4 sm:p-6 flex flex-col flex-1 min-h-[520px] lg:h-full overflow-hidden">
        {/* Instant Role Switcher */}
        <div className="flex bg-[#e8eaf7]/85 rounded-2xl p-1 mb-4 shrink-0 border border-white">
          {[
            { id: 'students', label: 'Students' },
            { id: 'teachers', label: 'Teachers' },
            { id: 'admins', label: 'Admins' },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setDirectoryTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer ${
                directoryTab === tab.id
                  ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                  : 'text-[#454d82] hover:text-[#1e2246]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-2.5 mb-4 shrink-0 bg-white/65 p-3 rounded-2xl border border-white shadow-inner">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl pl-10 pr-4 py-2.5 text-[#1e2246] text-xs sm:text-sm font-semibold placeholder-[#626a9f]/60 outline-none shadow-sm"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#626a9f]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {directoryTab === 'students' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                value={dirFilters.level}
                onChange={(e) => setDirFilters({ ...dirFilters, level: e.target.value })}
                className="bg-white text-[#1e2246] text-[10.5px] font-bold uppercase rounded-xl px-2.5 py-2 outline-none border border-[#dfe2f2] cursor-pointer"
              >
                <option value="ALL">All Levels</option>
                <option value="A1">Level A1</option>
                <option value="A2">Level A2</option>
                <option value="B1">Level B1</option>
                <option value="B2">Level B2</option>
                <option value="C1">Level C1</option>
                <option value="C2">Level C2</option>
              </select>
              <select
                value={dirFilters.status}
                onChange={(e) => setDirFilters({ ...dirFilters, status: e.target.value })}
                className="bg-white text-[#1e2246] text-[10.5px] font-bold uppercase rounded-xl px-2.5 py-2 outline-none border border-[#dfe2f2] cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
              </select>
              <select
                value={dirFilters.cohort}
                onChange={(e) => setDirFilters({ ...dirFilters, cohort: e.target.value })}
                className="bg-white text-[#1e2246] text-[10.5px] font-bold uppercase rounded-xl px-2.5 py-2 outline-none border border-[#dfe2f2] cursor-pointer"
              >
                <option value="ALL">All Cohorts</option>
                <option value="15">Day 15</option>
                <option value="30">Day 30</option>
              </select>
              <select
                value={dirFilters.payment}
                onChange={(e) => setDirFilters({ ...dirFilters, payment: e.target.value })}
                className="bg-white text-[#1e2246] text-[10.5px] font-bold uppercase rounded-xl px-2.5 py-2 outline-none border border-[#dfe2f2] cursor-pointer"
              >
                <option value="ALL">Payments</option>
                <option value="paid">Up to Date</option>
                <option value="past_due">Past Due</option>
              </select>
            </div>
          )}
        </div>

        {/* User Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2.5">
          {isLoadingDirectory ? (
            <div className="h-full flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
            </div>
          ) : filteredDirectory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#626a9f] py-12">
              <p className="font-bold uppercase tracking-widest text-xs">No matching users found.</p>
            </div>
          ) : (
            filteredDirectory.map((user) => {
              const isPending = user.status === 'pending';
              const levelBadge = user.level ? user.level.split(':')[0] : 'A1';

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedStudent(user)}
                  className={`border-2 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                    isPending
                      ? 'bg-[#fff3d1] border-[#ffc749] hover:bg-[#ffe9a8] shadow-sm'
                      : 'bg-white/80 border-white hover:bg-white hover:border-[#626a9f]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={
                        user.avatar_url ||
                        `https://ui-avatars.com/api/?name=${user.first_name || 'U'}+${user.last_name || ''}&background=626a9f&color=fff`
                      }
                      className="w-10 h-10 rounded-full border-2 border-[#1e2246]/20 object-cover shrink-0"
                      alt="User"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#1e2246] truncate">
                        {user.first_name || 'Nuevo'} {user.last_name || 'Usuario'}
                      </h4>
                      <p className="text-[11px] font-medium text-[#50567d] truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {directoryTab === 'teachers' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeacher(user);
                        }}
                        className="bg-[#e7faf3] hover:bg-[#16a37f] text-[#128063] hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Metrics
                      </button>
                    )}

                    <div className="hidden sm:block">
                      {isPending ? (
                        <span className="bg-[#1e2246] text-[#ffc749] px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          Lead
                        </span>
                      ) : directoryTab === 'students' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImpersonatingStudent(user);
                          }}
                          className="bg-[#e8eaf7] hover:bg-[#ffc749] text-[#454d82] hover:text-[#1e2246] px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          View As
                        </button>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteUser(user, e)}
                      className="w-8 h-8 rounded-xl bg-[#ee665b]/15 text-[#c93f34] hover:bg-[#ee665b] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Delete User"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        levelBadge.includes('C')
                          ? 'bg-[#ffc749] text-[#1e2246] border border-[#1e2246]'
                          : levelBadge.includes('B')
                          ? 'bg-[#454d82] text-[#ffc749]'
                          : 'bg-[#e8eaf7] text-[#1e2246]'
                      }`}
                    >
                      {levelBadge}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  // =====================================================
  // MODULE 2: COMMUNICATIONS (INFO BOARD, CHAT, FORUM)
  // =====================================================
  const renderCommunications = () => (
    <div className="flex flex-col w-full max-w-[1440px] min-h-[82vh] relative z-10 pb-10 lg:pb-0">
      {/* Sub Navigation Pills */}
      <div className="ola-adm-glass flex rounded-full p-1.5 mb-6 w-fit mx-auto overflow-x-auto max-w-full relative z-20 gap-1">
        {['General', 'Staff', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Chat', 'Forum'].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveCommsTab(tab)}
            className={`px-4 sm:px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer ${
              activeCommsTab === tab
                ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                : 'text-[#454d82] hover:text-[#1e2246] hover:bg-white/75'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* INFO BOARD VIEW */}
      {!['Chat', 'Forum'].includes(activeCommsTab) && (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 flex-1 min-h-0 relative">
          {/* Composer Left */}
          <div
            className={`${isMobile && !isMobileCommsComposerOpen ? 'hidden' : 'flex'} ${
              isMobile
                ? 'fixed inset-0 z-[300] bg-[#1e2246]/60 backdrop-blur-xl p-4 items-center justify-center'
                : 'lg:col-span-5 flex-col h-fit'
            }`}
          >
            <div className="ola-adm-glass rounded-[2.25rem] p-6 w-full max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#626a9f]/15 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82] block">
                    Channel: {activeCommsTab}
                  </span>
                  <h3 className="text-base font-extrabold text-[#1e2246]">Publish Announcement</h3>
                </div>
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => setIsMobileCommsComposerOpen(false)}
                    className="w-8 h-8 bg-white border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 mb-4">
                {!showImageInput ? (
                  <button
                    type="button"
                    onClick={() => setShowImageInput(true)}
                    className="w-full sm:w-28 h-24 sm:h-28 bg-white/70 border-2 border-dashed border-[#626a9f]/40 hover:border-[#454d82] rounded-2xl flex flex-col items-center justify-center text-[#454d82] hover:bg-white transition-colors shrink-0 cursor-pointer"
                  >
                    <span className="text-3xl font-light leading-none mb-1">+</span>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-center">Cover URL</span>
                  </button>
                ) : (
                  <div className="w-full sm:w-28 h-24 sm:h-28 bg-white border-2 border-[#454d82] rounded-2xl flex flex-col items-center justify-center p-2 shrink-0 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageInput(false);
                        setPostImageUrl('');
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-[#ee665b] text-white rounded-full text-[10px] font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                    <span className="text-[9px] font-bold uppercase text-[#454d82] mb-1">Image URL</span>
                    <input
                      type="text"
                      value={postImageUrl}
                      onChange={(e) => setPostImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#f6f7fc] rounded-lg p-1.5 text-xs text-[#1e2246] outline-none border border-[#dfe2f2]"
                    />
                  </div>
                )}

                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Escribe el anuncio oficial aquí..."
                  className="flex-1 bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-2xl p-3.5 text-sm font-medium text-[#1e2246] resize-none outline-none placeholder-[#626a9f]/60 shadow-inner min-h-[120px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <AdminDropdown
                    placeholder="CATEGORY"
                    options={[
                      'Website Functionality',
                      'General Information',
                      'Academy Rules',
                      'Upcoming Events',
                      'Promos & Discounts',
                      'Financial Data',
                    ]}
                    value={postCategory}
                    onChange={setPostCategory}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handlePublishAnnouncement();
                    setIsMobileCommsComposerOpen(false);
                  }}
                  disabled={isPublishing}
                  className="ola-adm-btn-yellow px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isPublishing ? 'Publishing...' : 'Publish →'}
                </button>
              </div>
            </div>
          </div>

          {/* Feed Right */}
          <div className="lg:col-span-7 ola-adm-glass rounded-[2.25rem] p-4 sm:p-6 flex flex-col h-[68vh] lg:h-[calc(100vh-230px)] relative overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3.5 pr-1 pb-16 lg:pb-2">
              {announcements.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#626a9f] font-bold uppercase tracking-widest text-xs py-12">
                  No hay anuncios activos para este filtro.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white/85 border border-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 relative group shadow-sm hover:shadow-md transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="absolute top-3.5 right-3.5 w-8 h-8 bg-[#ee665b]/15 hover:bg-[#ee665b] rounded-full flex items-center justify-center text-[#c93f34] hover:text-white transition-colors cursor-pointer z-20"
                      title="Delete Announcement"
                    >
                      ✕
                    </button>
                    {ann.image_url && (
                      <div className="w-full sm:w-28 h-36 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-[#dfe2f2]">
                        <img src={ann.image_url} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col w-full text-center sm:text-left pr-0 sm:pr-8">
                      <span className="inline-block self-center sm:self-start text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
                        {ann.category || 'Update'}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1e2246] mb-1">{ann.title}</h4>
                      <p className="text-xs text-[#4c5384] leading-relaxed font-medium whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isMobile && (
              <button
                type="button"
                onClick={() => setIsMobileCommsComposerOpen(true)}
                className="ola-adm-btn-yellow absolute bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold z-50 cursor-pointer"
                aria-label="New Announcement"
              >
                +
              </button>
            )}
          </div>
        </div>
      )}

      {/* CHAT MODERATOR VIEW */}
      {activeCommsTab === 'Chat' && (
        <div className="fixed inset-0 z-[650] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 md:p-10 font-montserrat">
          <div className="w-full h-full max-w-7xl relative shadow-2xl rounded-[2.5rem]">
            <SeminarRoom
              currentUser={{
                id: adminProfile.id,
                full_name: `${adminProfile.firstName} ${adminProfile.lastName}`,
                avatar_url: adminProfile.avatarUrl,
                level: 'ALL',
              }}
              userRole="admin"
              roomScope="dual"
              onClose={() => setActiveCommsTab('General')}
            />
          </div>
        </div>
      )}

      {/* FORUM MODERATOR VIEW */}
      {activeCommsTab === 'Forum' && (
        <div className="fixed inset-0 z-[650] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 md:p-10 font-montserrat">
          <div className="w-full h-full max-w-7xl relative shadow-2xl rounded-[2.5rem]">
            <ForumBoard
              currentUser={{
                id: adminProfile.id,
                role: 'admin',
                level: 'ALL',
                first_name: adminProfile.firstName,
                last_name: adminProfile.lastName,
                avatar_url: adminProfile.avatarUrl,
              }}
              onClose={() => setActiveCommsTab('General')}
            />
          </div>
        </div>
      )}
    </div>
  );

  // ==========================================
  // MODULE 3: OVERHEAD TRACKER & FINANCES PAGE
  // ==========================================
  const OverheadExpensesModule = ({ onOverheadUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [totalOverhead, setTotalOverhead] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState({ service_name: '', category: 'Software', monthly_cost: '' });

    const fetchOverhead = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('operating_expenses')
          .select('id, service_name, monthly_cost, category')
          .order('monthly_cost', { ascending: false });

        const displayData = data && data.length > 0 ? data : [];
        const calculatedTotal = displayData.reduce((sum, item) => sum + Number(item.monthly_cost), 0);

        setExpenses(displayData);
        setTotalOverhead(calculatedTotal);
        if (onOverheadUpdate) onOverheadUpdate(calculatedTotal);
      } catch (error) {
        console.error('Error fetching overhead:', error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchOverhead();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddExpense = async (e) => {
      e.preventDefault();
      if (!newExpense.service_name || !newExpense.monthly_cost) return;
      try {
        await supabase.from('operating_expenses').insert([
          {
            service_name: newExpense.service_name,
            category: newExpense.category,
            monthly_cost: Number(newExpense.monthly_cost),
          },
        ]);
        setNewExpense({ service_name: '', category: 'Software', monthly_cost: '' });
        setIsAdding(false);
        fetchOverhead();
      } catch (err) {
        console.error('Error adding expense:', err);
      }
    };

    const handleDeleteExpense = async (id) => {
      if (!window.confirm('Are you sure you want to remove this expense?')) return;
      try {
        await supabase.from('operating_expenses').delete().eq('id', id);
        fetchOverhead();
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    };

    if (loading && expenses.length === 0) {
      return (
        <div className="ola-adm-glass rounded-[2rem] p-8 text-[#626a9f] text-center font-bold uppercase tracking-widest text-xs">
          Loading Overhead...
        </div>
      );
    }

    return (
      <div className="ola-adm-glass rounded-[2rem] p-5 sm:p-7 flex flex-col w-full h-full">
        <div className="mb-5 flex justify-between items-end border-b border-[#626a9f]/15 pb-3.5 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1e2246]">Overhead Costs</h3>
            <p className="text-[11px] font-bold text-[#c93f34] uppercase tracking-wider">
              Recurring Digital &amp; SaaS Expenses
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#626a9f] uppercase font-bold block">Total Monthly</span>
            <span className="text-3xl font-extrabold text-[#c93f34]">${totalOverhead.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2.5">
          {expenses.length === 0 ? (
            <div className="text-center text-[#626a9f] font-bold tracking-widest text-xs py-8 uppercase">
              No expenses recorded yet.
            </div>
          ) : (
            expenses.map((expense, idx) => (
              <div
                key={expense.id || idx}
                className="group flex justify-between items-center bg-white/80 border border-white p-3.5 rounded-2xl hover:bg-white transition-colors shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#1e2246]">{expense.service_name}</span>
                  <span className="text-[10px] font-bold uppercase text-[#626a9f] tracking-wider">
                    {expense.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#1e2246]">
                    ${Number(expense.monthly_cost).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="w-7 h-7 bg-[#ee665b]/15 hover:bg-[#ee665b] text-[#c93f34] hover:text-white rounded-lg flex items-center justify-center font-bold transition-colors text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#626a9f]/15 shrink-0">
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="ola-adm-btn-outline w-full py-2.5 font-bold text-xs tracking-widest uppercase rounded-full cursor-pointer"
            >
              + Add New Expense
            </button>
          ) : (
            <form onSubmit={handleAddExpense} className="flex flex-col gap-2.5 bg-white/80 p-3.5 rounded-2xl border border-white">
              <input
                type="text"
                placeholder="Service Name (e.g. Bunny.net)"
                value={newExpense.service_name}
                onChange={(e) => setNewExpense({ ...newExpense, service_name: e.target.value })}
                className="bg-[#f6f7fc] border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-semibold outline-none"
                required
              />
              <div className="flex gap-2">
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="flex-1 bg-[#f6f7fc] border border-[#dfe2f2] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-bold outline-none"
                >
                  <option value="Software">Software</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Financial">Financial</option>
                </select>
                <input
                  type="number"
                  placeholder="Cost $"
                  value={newExpense.monthly_cost}
                  onChange={(e) => setNewExpense({ ...newExpense, monthly_cost: e.target.value })}
                  className="w-24 bg-[#f6f7fc] border border-[#dfe2f2] rounded-xl px-3 py-2 text-[#1e2246] text-xs font-bold outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-[#50567d] hover:text-[#1e2246] text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ola-adm-btn-yellow flex-1 py-2 rounded-full text-xs font-bold uppercase cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const FinancesPage = () => {
    const [revenue, setRevenue] = useState(0);
    const [payroll, setPayroll] = useState(0);
    const [overhead, setOverhead] = useState(0);

    const [showRenewalsModal, setShowRenewalsModal] = useState(false);
    const [pendingRenewals, setPendingRenewals] = useState([]);

    useEffect(() => {
      const fetchPendingRenewals = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, whatsapp, level, unit')
          .eq('level_completed', true);

        if (data) {
          setPendingRenewals(
            data.map((s) => ({
              name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
              contact: s.whatsapp || '',
              completedLevel: `${s.level?.split(':')[0] || 'A1'} (Unit ${s.unit})`,
            }))
          );
        }
      };
      fetchPendingRenewals();
    }, []);

    const renewalRate = Math.min(pendingRenewals.length * 10, 100);
    const netProfit = revenue - payroll - overhead;
    const netMarginPercentage = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

    return (
      <div className="flex flex-col gap-6 w-full max-w-[1440px] relative z-10 pb-20 lg:pb-10 lg:h-[calc(100vh-145px)] overflow-y-auto custom-scrollbar pr-0 lg:pr-2">
        {/* ROW 1: HARD FINANCIAL BENTO */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:min-h-[380px] shrink-0">
          {/* Left: Circular KPIs */}
          <div className="lg:col-span-3 grid grid-cols-2 lg:flex lg:flex-col gap-4 lg:h-full">
            <button
              type="button"
              onClick={() => setShowRenewalsModal(true)}
              className="ola-adm-glass-gold ola-adm-bento flex-1 rounded-[2rem] p-4 flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="relative w-24 h-24 flex items-center justify-center mb-1.5">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(30,34,70,0.12)" strokeWidth="9" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e2246"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - (renewalRate / 100) * (2 * Math.PI * 40)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xl font-extrabold text-[#1e2246]">{renewalRate}%</span>
              </div>
              <h3 className="text-[#1e2246] font-bold text-xs tracking-widest uppercase">Renewals →</h3>
            </button>

            <div className="ola-adm-glass flex-1 rounded-[2rem] p-4 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center mb-1.5">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(98,106,159,0.16)" strokeWidth="9" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#16a37f"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 - (Math.max(0, Math.min(100, Number(netMarginPercentage))) / 100) * (2 * Math.PI * 40)
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xl font-extrabold text-[#1e2246]">{netMarginPercentage}%</span>
              </div>
              <h3 className="text-[#454d82] font-bold text-xs tracking-widest uppercase">Net Margin</h3>
            </div>
          </div>

          {/* Center: Profit Margin Analysis */}
          <div className="lg:col-span-6 w-full min-h-[340px] lg:h-full">
            <ProfitMarginAnalysis
              onMetricsUpdate={(m) => {
                setRevenue(m.revenue);
                setPayroll(m.payroll);
              }}
            />
          </div>

          {/* Right: 4-Metric Bento Stack */}
          <div className="lg:col-span-3 grid grid-cols-2 lg:flex lg:flex-col gap-3.5 lg:h-full">
            <div className="ola-adm-glass flex-1 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest">Gross Revenue</span>
              <span className="text-2xl font-extrabold text-[#1e2246] mt-0.5">${revenue.toLocaleString()}</span>
            </div>
            <div className="ola-adm-glass flex-1 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest">Payroll Liability</span>
              <span className="text-2xl font-extrabold text-[#c93f34] mt-0.5">-${payroll.toLocaleString()}</span>
            </div>
            <div className="ola-adm-glass flex-1 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest">Digital Overhead</span>
              <span className="text-2xl font-extrabold text-[#b37a00] mt-0.5">-${overhead.toLocaleString()}</span>
            </div>
            <div className="ola-adm-glass-mint flex-1 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-[#128063] uppercase tracking-widest">Net Profit</span>
              <span className="text-3xl font-extrabold text-[#128063] mt-0.5">${netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ROW 2: FUNNEL & OVERHEAD */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:min-h-[380px] shrink-0">
          <div className="lg:col-span-6 w-full min-h-[380px]">
            <CommercialFunnelModule />
          </div>
          <div className="lg:col-span-6 w-full min-h-[380px]">
            <OverheadExpensesModule onOverheadUpdate={setOverhead} />
          </div>
        </div>

        {/* RENEWALS MODAL */}
        {showRenewalsModal && (
          <div
            onClick={(e) => e.target === e.currentTarget && setShowRenewalsModal(false)}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4"
          >
            <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] w-full max-w-2xl p-6 sm:p-8 flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-5 border-b border-[#626a9f]/15 pb-3.5">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1e2246]">Pending Level Renewals</h3>
                  <p className="text-xs font-bold text-[#454d82] uppercase tracking-wider">
                    Students ready for next CEFR level ($10 Enrollment)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRenewalsModal(false)}
                  className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5">
                {pendingRenewals.length === 0 ? (
                  <div className="text-center text-[#626a9f] font-bold tracking-widest text-xs py-12 uppercase">
                    No pending renewals at this time.
                  </div>
                ) : (
                  pendingRenewals.map((student, i) => (
                    <div
                      key={i}
                      className="bg-white/85 p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <h4 className="text-[#1e2246] font-bold text-sm">{student.name}</h4>
                        <p className="text-[#50567d] text-xs font-medium">{student.contact || 'No phone'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#454d82] font-bold text-xs uppercase">Finished: {student.completedLevel}</p>
                        {student.contact ? (
                          <a
                            href={`https://wa.me/${student.contact.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ola-adm-btn-yellow mt-1.5 inline-block px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider"
                          >
                            Contact WhatsApp
                          </a>
                        ) : (
                          <span className="mt-1.5 inline-block bg-[#e8eaf7] text-[#626a9f] px-3 py-1 rounded-full font-bold text-[10px] uppercase">
                            No Phone
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // MODULE 4: SETTINGS (9-TILE ILLUSTRATED BENTO GRID)
  // =====================================================
  const renderSettings = () => {
    if (settingsView === 'EVALUATOR') {
      return (
        <EvaluatorModule
          onBack={() => setSettingsView('MENU')}
          onOnboard={(data) => {
            setProvisioningInitialData(data);
            setIsProvisioningModalOpen(true);
          }}
        />
      );
    }

    if (settingsView === 'ACHIEVEMENTS') {
      return <AchievementsManager onBack={() => setSettingsView('MENU')} />;
    }

    const SETTINGS_TILES = [
      {
        name: 'Evaluator',
        desc: 'Grade oral placement tests',
        active: true,
        accent: 'ola-adm-glass-gold',
        action: () => setSettingsView('EVALUATOR'),
        icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
      },
      {
        name: 'Achievements',
        desc: 'Manage badges & trophies',
        active: true,
        accent: 'ola-adm-glass-mint',
        action: () => setSettingsView('ACHIEVEMENTS'),
        icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972',
      },
      {
        name: 'Tenants',
        desc: 'Workspace & access keys',
        active: false,
        accent: 'ola-adm-glass',
        icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
      },
      {
        name: 'Public logs',
        desc: 'Audit & login trails',
        active: false,
        accent: 'ola-adm-glass',
        icon: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75',
      },
      {
        name: 'Shifts',
        desc: 'Teacher shift rosters',
        active: false,
        accent: 'ola-adm-glass',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      {
        name: 'Reports',
        desc: 'Monthly PDF summaries',
        active: false,
        accent: 'ola-adm-glass',
        icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
      },
      {
        name: 'B2B Clients',
        desc: 'Corporate group accounts',
        active: false,
        accent: 'ola-adm-glass',
        icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387',
      },
      {
        name: 'Resumes',
        desc: 'Instructor applications',
        active: false,
        accent: 'ola-adm-glass',
        icon: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
      },
      {
        name: 'Language',
        desc: 'Interface localization',
        active: false,
        accent: 'ola-adm-glass',
        icon: 'M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502',
      },
    ];

    return (
      <div className="flex flex-col items-center w-full relative z-10 pb-24 lg:pb-6 lg:h-[calc(100vh-145px)] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 max-w-[1200px] w-full">
          {SETTINGS_TILES.map((tile) => (
            <button
              type="button"
              key={tile.name}
              onClick={() => (tile.action ? tile.action() : showToast(`${tile.name} module coming soon.`, 'info'))}
              className={`${tile.accent} ola-adm-bento rounded-[2rem] p-5 sm:p-6 flex flex-col items-center justify-between text-center min-h-[180px] sm:min-h-[210px] cursor-pointer group focus:outline-none`}
            >
              <span
                className={`self-end text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  tile.active ? 'bg-[#1e2246] text-[#ffc749]' : 'bg-white/75 text-[#626a9f]'
                }`}
              >
                {tile.active ? 'Active' : 'Soon'}
              </span>

              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/85 border-2 border-[#1e2246]/15 group-hover:border-[#1e2246] flex items-center justify-center text-[#454d82] group-hover:text-[#1e2246] transition-colors my-2 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={tile.icon} />
                </svg>
              </div>

              <div>
                <h3 className="text-[#1e2246] font-extrabold text-sm sm:text-base tracking-tight">{tile.name}</h3>
                <p className="text-[11px] text-[#50567d] font-medium mt-0.5 leading-snug">{tile.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };
  // =====================================================
  // IMPERSONATION INTERCEPTOR (Light-Glass Floating Pill)
  // =====================================================
  if (impersonatingStudent) {
    return (
      <>
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e2246] border-2 border-[#ffc749] text-white pl-5 pr-1.5 py-1.5 rounded-full font-bold tracking-widest text-[10px] md:text-xs flex items-center gap-3.5 shadow-[0_14px_34px_-8px_rgba(30,34,70,0.6)] font-montserrat">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ee665b] animate-pulse shrink-0" />
          <span className="truncate max-w-[160px] md:max-w-xs uppercase">
            Viewing as: {impersonatingStudent.first_name}
          </span>
          <button
            type="button"
            onClick={() => setImpersonatingStudent(null)}
            className="bg-[#ffc749] hover:bg-[#ffd66b] text-[#1e2246] px-4 py-1.5 rounded-full font-extrabold uppercase tracking-wider transition-transform active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Exit</span>
          </button>
        </div>
        <StudentHub
          preloadedStudent={impersonatingStudent}
          onReturnHome={() => setImpersonatingStudent(null)}
        />
      </>
    );
  }

  return (
    <div
      id="admin-hub-root"
      className="relative min-h-screen w-full font-montserrat text-[#1e2246] overflow-hidden flex flex-col"
    >
      <AdminThemeStyles />
      <AdminLuminousBackdrop />

      {/* NON-BLOCKING STATUS TOAST */}
      {adminToast && (
        <div className="ola-adm-toast-in fixed bottom-24 lg:bottom-7 left-1/2 z-[9500] px-5 py-3 rounded-full bg-[#1e2246] text-white border-2 border-[#ffc749] shadow-2xl flex items-center gap-2.5 text-xs font-bold max-w-[92vw]">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              adminToast.tone === 'error'
                ? 'bg-[#ee665b]'
                : adminToast.tone === 'info'
                ? 'bg-[#ffc749]'
                : 'bg-[#16a37f]'
            }`}
          />
          <span>{adminToast.message}</span>
        </div>
      )}

      {/* MOBILE COMPACT HEADER */}
      {isMobile && !isPreviewMode && (
        <header className="px-4 py-3 flex items-center justify-between border-b border-white/85 bg-white/65 backdrop-blur-2xl sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <OutLoudHorizontalLogo iconClass="w-9 h-9" wordmarkClass="h-7 w-auto" />
            <div className="h-5 w-px bg-[#626a9f]/25 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#454d82] truncate">
              {activeModule}
            </span>
          </div>
          <NavIconBtn
            isProfile
            label="Admin Profile"
            avatarUrl={adminProfile.avatarUrl}
            onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
          />
        </header>
      )}

      {/* PROFILE DROPDOWN MENU (Spatially Anchored) */}
      {isProfileDropdownOpen && (
        <div className="fixed inset-0 z-[500] pointer-events-none">
          <div
            className="absolute inset-0 bg-[#1e2246]/15 backdrop-blur-[1px] pointer-events-auto"
            onClick={() => setIsProfileDropdownOpen(false)}
          />
          <div
            className={`ola-adm-glass ola-adm-modal-in absolute ${
              isMobile ? 'right-4 top-20' : 'left-28 top-8'
            } w-52 rounded-2xl p-2 flex flex-col gap-1 pointer-events-auto shadow-2xl border-2 border-[#1e2246]`}
          >
            <div className="px-3.5 py-2 border-b border-[#626a9f]/15 mb-1">
              <p className="text-xs font-extrabold text-[#1e2246] truncate">
                {adminProfile.firstName || 'OutLoud'} {adminProfile.lastName || 'Admin'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#626a9f]">
                {adminProfile.role}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(true);
                setIsProfileDropdownOpen(false);
              }}
              className="px-3.5 py-2.5 rounded-xl text-left text-[#1e2246] hover:bg-[#fff3d1] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#454d82]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setIsProfileDropdownOpen(false);
                try {
                  await supabase.auth.signOut();
                  window.history.replaceState(null, '', '/');
                  window.location.href = '/';
                } catch (error) {
                  console.error('Error logging out:', error);
                }
              }}
              className="px-3.5 py-2.5 rounded-xl text-left text-[#c93f34] hover:bg-[#ee665b]/15 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ADMIN PROFILE EDITOR MODAL */}
      {isProfileModalOpen && (
        <div
          onClick={(e) => e.target === e.currentTarget && setIsProfileModalOpen(false)}
          className="fixed inset-0 z-[550] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4"
        >
          <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] p-6 sm:p-8 max-w-md w-full flex flex-col">
            <div className="flex justify-between items-center mb-5 border-b border-[#626a9f]/15 pb-3.5">
              <div>
                <h2 className="text-xl font-extrabold text-[#1e2246]">Admin Profile</h2>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#454d82]">
                  OutLoud Management Account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl border-2 border-[#1e2246] overflow-hidden bg-white flex items-center justify-center shrink-0">
                  {adminProfile.avatarUrl ? (
                    <img src={adminProfile.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    <OutLoudIcon className="w-10 h-10" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#454d82] mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={adminProfile.avatarUrl}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2 text-xs font-semibold text-[#1e2246] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#454d82] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={adminProfile.firstName}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1e2246] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#454d82] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={adminProfile.lastName}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1e2246] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#454d82] mb-1">
                  Reference Password (Optional Update)
                </label>
                <input
                  type="text"
                  value={adminProfile.password}
                  onChange={(e) => setAdminProfile((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-white/85 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1e2246] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="ola-adm-btn-outline flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={handleSaveAdminProfile}
                  className="ola-adm-btn-yellow flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROVISIONING, STUDENT MANAGER & TEACHER METRICS MODALS */}
      {isProvisioningModalOpen && (
        <ProvisioningModal
          isOpen={isProvisioningModalOpen}
          onClose={() => setIsProvisioningModalOpen(false)}
          supabase={supabase}
          onSuccess={() => fetchDirectory(directoryTab)}
          initialData={provisioningInitialData}
        />
      )}

      {selectedStudent && (
        <StudentManagerModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          userData={selectedStudent}
          isPending={selectedStudent?.status === 'pending'}
          supabase={supabase}
          onSuccess={() => fetchDirectory(directoryTab)}
          onImpersonate={(user) => {
            setSelectedStudent(null);
            setImpersonatingStudent(user);
          }}
        />
      )}

      {selectedTeacher && (
        <AdminTeacherMetricsModal
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          teacherId={selectedTeacher.id}
          teacherName={`${selectedTeacher.first_name} ${selectedTeacher.last_name}`}
          supabase={supabase}
        />
      )}

      {/* MAIN WORKSPACE SHELL */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* DESKTOP FROSTED SIDEBAR RAIL */}
        {!isMobile && !isPreviewMode && (
          <aside className="w-24 border-r border-white/80 bg-white/45 backdrop-blur-2xl flex flex-col items-center py-7 gap-4 shrink-0 z-[150] shadow-[8px_0_30px_-14px_rgba(55,63,118,0.2)] overflow-y-auto custom-scrollbar">
            <NavIconBtn
              isProfile
              label="Admin Profile"
              avatarUrl={adminProfile.avatarUrl}
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
            />
            <div className="w-10 h-px bg-[#626a9f]/20 my-1 shrink-0" />
            <NavIconBtn
              iconSvg={adminNavIcons.accounts}
              label="Accounts & Directory"
              active={activeModule === 'ACCOUNTS'}
              onClick={() => {
                setActiveModule('ACCOUNTS');
                setAccountsView('OVERVIEW');
              }}
            />
            <NavIconBtn
              iconSvg={adminNavIcons.calendar}
              label="Master Calendar"
              active={activeModule === 'CALENDARS'}
              onClick={() => setActiveModule('CALENDARS')}
            />
            <NavIconBtn
              iconSvg={adminNavIcons.content}
              label="Content Studio"
              active={activeModule === 'CONTENTS'}
              onClick={() => setActiveModule('CONTENTS')}
            />
            <NavIconBtn
              iconSvg={adminNavIcons.communications}
              label="Communications & Info Board"
              active={activeModule === 'COMMUNICATIONS'}
              onClick={() => setActiveModule('COMMUNICATIONS')}
              hasNotification
            />
            <NavIconBtn
              iconSvg={adminNavIcons.finances}
              label="Finances & Margin"
              active={activeModule === 'FINANCES'}
              onClick={() => setActiveModule('FINANCES')}
            />
            <NavIconBtn
              iconSvg={adminNavIcons.settings}
              label="Settings & Evaluator"
              active={activeModule === 'SETTINGS'}
              onClick={() => {
                setActiveModule('SETTINGS');
                setSettingsView('MENU');
              }}
            />
          </aside>
        )}

        {/* MAIN SCROLLABLE MODULE AREA */}
        <main
          className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar z-10 relative ${
            isMobile ? 'p-3 pb-28 overflow-x-hidden' : 'p-6 lg:p-9'
          }`}
        >
          {/* DESKTOP MODULE HEADER */}
          {!isMobile && activeModule !== 'CONTENTS' && (
            <header className="flex items-center justify-between gap-4 mb-6 max-w-[1440px] w-full shrink-0">
              <div className="flex items-center gap-4">
                <OutLoudHorizontalLogo iconClass="w-10 h-10" wordmarkClass="h-8 w-auto" />
                <div className="h-8 w-px bg-[#626a9f]/25" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#626a9f] block leading-none">
                    Admin Command Center
                  </span>
                  <h1 className="text-xl lg:text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight leading-tight">
                    {activeModule}
                  </h1>
                </div>
              </div>

              <div className="ola-adm-glass rounded-full px-4 py-2 flex items-center gap-2.5 text-xs font-bold text-[#1e2246]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f] shadow-[0_0_8px_#16a37f]" />
                <span>
                  {adminProfile.firstName || 'Admin'} {adminProfile.lastName}
                </span>
              </div>
            </header>
          )}

          {/* DYNAMIC MODULE ROUTING */}
          {activeModule === 'ACCOUNTS' && accountsView === 'OVERVIEW' && renderAccounts()}

          {activeModule === 'ACCOUNTS' && accountsView === 'STATISTICS' && (
            <div className="w-full h-full flex flex-col relative z-10">
              <button
                type="button"
                onClick={() => setAccountsView('OVERVIEW')}
                className="ola-adm-btn-outline mb-4 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest w-fit cursor-pointer"
              >
                ← Back to Accounts Overview
              </button>
              <div className="flex-1 w-full pb-10">
                <StatisticsHub />
              </div>
            </div>
          )}

          {activeModule === 'CALENDARS' && (
            <div className="flex-1 w-full h-full relative flex flex-col min-h-0">
              <AdminCalendar />
            </div>
          )}

          {activeModule === 'COMMUNICATIONS' && renderCommunications()}
          {activeModule === 'FINANCES' && <FinancesPage />}
          {activeModule === 'SETTINGS' && renderSettings()}

          {/* ==========================================
              MODULE 5: CONTENTS STUDIO (LIGHT-GLASS)
          ========================================== */}
          {activeModule === 'CONTENTS' && (
            <div className="relative z-10 flex flex-col w-full flex-grow">
              {/* FLOATING EXIT PREVIEW PILL */}
              {isPreviewMode && (
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="fixed top-5 right-5 z-[300] ola-adm-btn-yellow px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer shadow-xl"
                >
                  ✕ Exit Preview
                </button>
              )}

              {/* TOP STUDIO TOOLBAR */}
              {!isPreviewMode && (
                <div
                  className={`fixed z-[150] bg-white/80 backdrop-blur-2xl border-b border-white/95 shadow-md flex items-center px-4 lg:px-7 py-3 gap-3 lg:gap-5 ${
                    isMobile ? 'top-[69px] left-0 right-0' : 'top-0 left-24 right-0'
                  }`}
                >
                  {!isMobile && (
                    <div className="flex items-center gap-3 shrink-0 border-r border-[#626a9f]/20 pr-5">
                      <OutLoudHorizontalLogo iconClass="w-8 h-8" wordmarkClass="h-6 w-auto" />
                      <span className="text-xs font-extrabold text-[#454d82] tracking-widest uppercase">
                        Studio
                      </span>
                    </div>
                  )}

                  {/* TOOL CAROUSEL (Desktop) */}
                  {!isMobile && !['Manuals', 'Cue Cards'].includes(contentType) && (
                    <div className="flex-1 flex overflow-x-auto custom-scrollbar gap-2 items-center py-1">
                      {toolOptions.map((tool) => (
                        <button
                          type="button"
                          key={tool}
                          onClick={() => handleToolSelect(tool)}
                          className="px-3.5 py-2 bg-white hover:bg-[#ffc749] text-[#1e2246] rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap border border-[#dfe2f2] hover:border-[#1e2246] shadow-sm cursor-pointer active:scale-95"
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-2 sm:gap-3 shrink-0 w-full lg:w-auto overflow-x-auto custom-scrollbar ${
                      isMobile
                        ? 'justify-between'
                        : !['Manuals', 'Cue Cards'].includes(contentType)
                        ? 'border-l border-[#626a9f]/20 pl-4'
                        : 'ml-auto'
                    }`}
                  >
                    {isMobile && (
                      <button
                        type="button"
                        onClick={() => setIsMobileContentSettingsOpen(true)}
                        className="ola-adm-btn-outline px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                      >
                        Settings
                      </button>
                    )}

                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
                      {!['Manuals', 'Cue Cards'].includes(contentType) && (
                        <>
                          <button
                            type="button"
                            onClick={handleUndoWorkspace}
                            className="px-3 py-1.5 rounded-full bg-[#e8eaf7] hover:bg-white text-[#454d82] hover:text-[#1e2246] font-bold uppercase text-[10px] sm:text-[11px] tracking-wider cursor-pointer"
                          >
                            Undo
                          </button>
                          <button
                            type="button"
                            onClick={handleDuplicateScreen}
                            className="px-3 py-1.5 rounded-full bg-[#e8eaf7] hover:bg-white text-[#454d82] hover:text-[#1e2246] font-bold uppercase text-[10px] sm:text-[11px] tracking-wider cursor-pointer"
                          >
                            Duplicate
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsPreviewMode(true)}
                        className="ola-adm-btn-outline px-3.5 py-1.5 rounded-full font-bold uppercase text-[10px] sm:text-[11px] tracking-wider cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSaveModalOpen(true)}
                        className="ola-adm-btn-yellow px-4 py-1.5 rounded-full font-bold uppercase text-[10px] sm:text-[11px] tracking-wider cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={`flex w-full ${!isPreviewMode ? (isMobile ? 'mt-14' : 'mt-16') : ''}`}>
                {/* MOBILE SETTINGS BOTTOM SHEET */}
                {isMobile && isMobileContentSettingsOpen && !isPreviewMode && (
                  <div
                    className="fixed inset-0 z-[400] flex items-end justify-center bg-[#1e2246]/55 backdrop-blur-md p-4 pb-24"
                    onClick={() => setIsMobileContentSettingsOpen(false)}
                  >
                    <div
                      className="ola-adm-glass ola-adm-modal-in rounded-[2rem] w-full p-5 flex flex-col gap-3.5 max-h-[72vh] overflow-y-auto custom-scrollbar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center border-b border-[#626a9f]/15 pb-3">
                        <h3 className="text-base font-extrabold text-[#1e2246] uppercase">Studio Settings</h3>
                        <button
                          type="button"
                          onClick={() => setIsMobileContentSettingsOpen(false)}
                          className="w-8 h-8 bg-white border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="relative z-[60]">
                        <AdminDropdown placeholder="LEVEL" options={LEVEL_OPTIONS} value={selectedLevel} onChange={setSelectedLevel} />
                      </div>
                      <div className="relative z-[50]">
                        <AdminDropdown placeholder="UNIT" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 mt-1">
                        {['Lesson', 'Workbook', 'Manuals', 'Cue Cards'].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => {
                              setContentType(type);
                              setIsMobileContentSettingsOpen(false);
                            }}
                            className={`py-3 px-2 rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer ${
                              contentType === type
                                ? 'bg-[#1e2246] text-[#ffc749]'
                                : 'bg-white/80 text-[#454d82] border border-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* DESKTOP LEFT FILTER COLUMN */}
                {!isPreviewMode && !isMobile && (
                  <div className="w-52 shrink-0 flex flex-col gap-3 py-5 pr-5 border-r border-[#626a9f]/15 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar sticky top-16 z-[60]">
                    <div className="relative z-[60]">
                      <AdminDropdown placeholder="LEVEL" options={LEVEL_OPTIONS} value={selectedLevel} onChange={setSelectedLevel} />
                    </div>
                    <div className="relative z-[50]">
                      <AdminDropdown placeholder="UNIT" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} />
                    </div>
                    <div className="h-px w-full bg-[#626a9f]/15 my-1" />
                    {['Lesson', 'Workbook', 'Manuals', 'Cue Cards'].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setContentType(type)}
                        className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all ${
                          contentType === type
                            ? 'bg-[#1e2246] text-[#ffc749] shadow-md'
                            : 'bg-white/75 text-[#454d82] border border-white hover:bg-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                {/* CANVAS / PDF INTEGRATOR */}
                <div className="flex-1 flex flex-col items-center px-0 lg:px-6">
                  {['Manuals', 'Cue Cards'].includes(contentType) ? (
                    <div className="w-full flex flex-col items-center justify-center py-8">
                      <div className="ola-adm-glass w-full max-w-4xl rounded-[2.25rem] p-6 sm:p-9 flex flex-col items-center relative">
                        <span className="bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] px-6 py-2 rounded-full font-extrabold tracking-widest uppercase text-xs mb-4">
                          {contentType} PDF Integrator
                        </span>
                        <p className="text-[#4c5384] font-medium text-xs sm:text-sm text-center mb-6 max-w-xl leading-relaxed">
                          Paste the hosted PDF URL below. Instructors will view this document in a dedicated fullscreen reader during live sessions.
                        </p>

                        <div className="w-full relative mb-6">
                          <input
                            type="text"
                            placeholder="https://.../your-file.pdf"
                            value={pdfUrl}
                            onChange={(e) => setPdfUrl(e.target.value)}
                            className="w-full bg-white/90 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-2xl pl-5 pr-12 py-4 text-[#1e2246] outline-none shadow-sm font-semibold text-sm sm:text-base"
                          />
                          {pdfUrl && (
                            <button
                              type="button"
                              onClick={() => setPdfUrl('')}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#ee665b]/15 text-[#c93f34] hover:bg-[#ee665b] hover:text-white rounded-full flex items-center justify-center font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {pdfUrl ? (
                          <div className="w-full aspect-[1/1.35] md:aspect-[16/10] bg-white border-2 border-[#1e2246]/15 rounded-2xl overflow-hidden shadow-md">
                            <iframe
                              src={pdfUrl.includes('google.com') ? pdfUrl.replace('/view', '/preview') : `${pdfUrl}#toolbar=0`}
                              className="w-full h-full border-none bg-white"
                              title="PDF Preview"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-[16/9] bg-white/60 border-2 border-dashed border-[#626a9f]/35 rounded-2xl flex flex-col items-center justify-center text-[#626a9f]">
                            <svg className="w-12 h-12 mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-bold uppercase tracking-widest text-xs">No PDF Loaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    activeScreenArray.map((screenId, index) => {
                      const screenElements = canvasElements.filter((el) => el.screenId === screenId);
                      const contentElements = screenElements.filter((el) => !['nav_button'].includes(el.type));
                      const dockElements = screenElements.filter((el) => ['nav_button', 'record_compare'].includes(el.type));

                      return (
                        <React.Fragment key={screenId}>
                          {!isPreviewMode && (
                            <div className="w-full flex items-center justify-center py-5 z-20">
                              <span className="px-6 py-2 bg-white/85 border border-white rounded-full text-[#454d82] font-bold tracking-widest uppercase text-[11px] shadow-sm">
                                Screen {index + 1}
                              </span>
                            </div>
                          )}

                          <div
                            id={`preview-screen-${screenId}`}
                            onClick={() => setActiveScreenId(screenId)}
                            className={`w-full relative flex flex-col p-4 sm:p-7 mx-auto mb-6 ${
                              isPreviewMode ? 'max-w-[96rem]' : 'ola-adm-glass max-w-[78rem] rounded-[2.25rem]'
                            }`}
                            style={{ minHeight: '78vh' }}
                          >
                            {!isPreviewMode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteScreen(screenId);
                                }}
                                title="Delete Screen"
                                className="absolute top-4 right-4 z-[60] w-10 h-10 bg-[#ee665b]/15 hover:bg-[#ee665b] border border-[#ee665b]/40 rounded-full flex items-center justify-center text-[#c93f34] hover:text-white transition-colors cursor-pointer"
                              >
                                <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}

                            {/* ELEMENTS FLOW */}
                            <div className="flex flex-wrap justify-center gap-6 w-full relative z-10 flex-grow content-start">
                              {contentElements.map((el) => {
                                const isMedia = ['video', 'image', 'audio'].includes(el.type);
                                const isCard = [
                                  'short_answer',
                                  'multiple_selection',
                                  'slider_bar',
                                  'fill_in_the_blank',
                                  'record_compare',
                                ].includes(el.type);

                                if (isMedia) {
                                  return (
                                    <div
                                      key={el.id}
                                      className={`group w-full ${
                                        el.type === 'video' ? 'max-w-5xl' : 'max-w-3xl'
                                      } bg-white/85 rounded-[2rem] overflow-hidden border border-white shadow-md relative mx-auto mb-2 p-3`}
                                    >
                                      {!isPreviewMode && (
                                        <div
                                          className={`absolute top-4 right-4 z-50 flex gap-2 transition-opacity ${
                                            isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => handleDuplicateElement(el.id)}
                                            className="w-9 h-9 bg-[#16a37f] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                                            title="Duplicate Media"
                                          >
                                            📋
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteElement(el.id)}
                                            className="w-9 h-9 bg-[#ee665b] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                                            title="Delete Media"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      )}

                                      {el.type === 'video' && (
                                        <iframe
                                          src={extractVideoUrl(el.url)}
                                          title="Video Block"
                                          className="w-full aspect-video border-none rounded-2xl bg-[#1e2246]"
                                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                          allowFullScreen
                                        />
                                      )}

                                      {el.type === 'image' && (
                                        <PanZoomImage
                                          src={el.url}
                                          data={el.data}
                                          onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })}
                                          isPreview={isPreviewMode}
                                          wrapperClass="w-full h-[360px] md:h-[460px] rounded-2xl"
                                        />
                                      )}

                                      {el.type === 'audio' && (
                                        <div className="p-5 w-full flex flex-col items-center">
                                          {!isPreviewMode && !el.data?.imageUrl && (
                                            <div
                                              onClick={() => {
                                                setMediaTarget({ id: el.id, type: 'image' });
                                                setActiveModal('media_upload');
                                              }}
                                              className="w-full h-20 bg-[#f6f7fc] border-2 border-dashed border-[#626a9f]/35 rounded-2xl flex items-center justify-center text-[#454d82] cursor-pointer hover:bg-[#fff3d1]/50 transition-colors mb-4"
                                            >
                                              <span className="text-xs font-bold uppercase tracking-widest">
                                                + Add Cover Image (Optional)
                                              </span>
                                            </div>
                                          )}
                                          {el.data?.imageUrl && (
                                            <div className="w-full relative mb-5">
                                              <PanZoomImage
                                                src={el.data.imageUrl}
                                                data={el.data}
                                                onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })}
                                                isPreview={isPreviewMode}
                                                wrapperClass="w-full h-[280px] rounded-2xl"
                                              />
                                              {!isPreviewMode && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleRemoveMedia(el.id, 'image')}
                                                  className="absolute top-3 right-3 w-9 h-9 bg-[#ee665b] text-white rounded-full flex items-center justify-center font-bold shadow-md z-50 cursor-pointer"
                                                >
                                                  ✕
                                                </button>
                                              )}
                                            </div>
                                          )}
                                          <audio
                                            src={el.url}
                                            controls
                                            controlsList="nodownload"
                                            onContextMenu={(e) => e.preventDefault()}
                                            className="w-full"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={el.id}
                                    className={`relative flex flex-col group ${
                                      isCard ? 'w-full md:w-[calc(50%-12px)]' : 'w-full items-center'
                                    }`}
                                  >
                                    {!isPreviewMode && (
                                      <div
                                        className={`absolute -top-3.5 -right-3.5 z-50 flex gap-1.5 transition-opacity ${
                                          isMobile ? 'opacity-100 scale-90' : 'opacity-0 group-hover:opacity-100'
                                        }`}
                                      >
                                        {el.type !== 'text' && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingElementId(el.id);
                                              setActiveModal(el.type);
                                            }}
                                            className="w-9 h-9 bg-[#454d82] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                                            title="Edit Element"
                                          >
                                            ✏️
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateElement(el.id)}
                                          className="w-9 h-9 bg-[#16a37f] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                                          title="Duplicate Element"
                                        >
                                          📋
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteElement(el.id)}
                                          className="w-9 h-9 bg-[#ee665b] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                                          title="Delete Element"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    )}

                                    {/* INLINE RICH TEXT BLOCK */}
                                    {el.type === 'text' && (
                                      <div
                                        className={`w-full max-w-5xl bg-white/85 rounded-[2rem] p-6 sm:p-8 border border-white shadow-md text-center mb-2 relative ${
                                          focusedTextId === el.id ? 'z-[100] ring-2 ring-[#454d82]' : 'z-10'
                                        }`}
                                        onFocus={() => setFocusedTextId(el.id)}
                                      >
                                        {!isPreviewMode && focusedTextId === el.id && (
                                          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#1e2246] border border-[#ffc749]/60 rounded-2xl p-1.5 flex items-center gap-1 shadow-xl whitespace-nowrap text-white z-[100]">
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                formatText('bold');
                                              }}
                                              className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white/15 rounded-lg"
                                            >
                                              B
                                            </button>
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                formatText('italic');
                                              }}
                                              className="w-8 h-8 flex items-center justify-center italic hover:bg-white/15 rounded-lg"
                                            >
                                              I
                                            </button>
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                formatText('underline');
                                              }}
                                              className="w-8 h-8 flex items-center justify-center underline hover:bg-white/15 rounded-lg"
                                            >
                                              U
                                            </button>
                                            <div className="w-px h-5 bg-white/25 mx-1" />
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                formatText('justifyLeft');
                                              }}
                                              className="w-8 h-8 flex items-center justify-center hover:bg-white/15 rounded-lg"
                                              title="Align Left"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16" />
                                              </svg>
                                            </button>
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                formatText('justifyCenter');
                                              }}
                                              className="w-8 h-8 flex items-center justify-center hover:bg-white/15 rounded-lg"
                                              title="Align Center"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M4 18h16" />
                                              </svg>
                                            </button>
                                            <button
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                formatText('justifyRight');
                                              }}
                                              className="w-8 h-8 flex items-center justify-center hover:bg-white/15 rounded-lg"
                                              title="Align Right"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M4 18h16" />
                                              </svg>
                                            </button>
                                            <div className="w-px h-5 bg-white/25 mx-1" />
                                            <input
                                              type="color"
                                              onInput={(e) => formatText('foreColor', e.target.value)}
                                              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                              title="Text Color"
                                            />
                                            <select
                                              onChange={(e) => formatText('fontName', e.target.value)}
                                              className="bg-white/15 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                                            >
                                              <option value="Montserrat" className="text-[#1e2246]">Montserrat</option>
                                              <option value="Arial" className="text-[#1e2246]">Arial</option>
                                              <option value="Times New Roman" className="text-[#1e2246]">Times New Roman</option>
                                            </select>
                                            <select
                                              onChange={(e) => formatText('fontSize', e.target.value)}
                                              className="bg-white/15 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                                            >
                                              <option value="1" className="text-[#1e2246]">Tiny</option>
                                              <option value="3" className="text-[#1e2246]">Normal</option>
                                              <option value="5" className="text-[#1e2246]">Large</option>
                                              <option value="7" className="text-[#1e2246]">Huge</option>
                                            </select>
                                          </div>
                                        )}
                                        <div
                                          id={`element-${el.id}`}
                                          contentEditable={!isPreviewMode}
                                          suppressContentEditableWarning
                                          dangerouslySetInnerHTML={{ __html: el.htmlContent }}
                                          onBlur={(e) =>
                                            !isPreviewMode &&
                                            (saveSnapshot(),
                                            setCanvasElements((prev) =>
                                              prev.map((p) => (p.id === el.id ? { ...p, htmlContent: e.target.innerHTML } : p))
                                            ))
                                          }
                                          className="rich-text-content focus:outline-none text-[#1e2246]"
                                        />
                                      </div>
                                    )}

                                    {/* INTERACTIVE EXERCISE CARDS */}
                                    {isCard && (
                                      <div className="w-full bg-white/85 rounded-[2rem] border border-white p-6 flex flex-col gap-5 shadow-md h-full justify-between">
                                        {!isPreviewMode && !el.data?.imageUrl && (
                                          <div
                                            onClick={() => {
                                              setMediaTarget({ id: el.id, type: 'image' });
                                              setActiveModal('media_upload');
                                            }}
                                            className="w-full h-32 bg-[#f6f7fc] border-2 border-dashed border-[#626a9f]/35 rounded-2xl flex flex-col items-center justify-center text-[#454d82] cursor-pointer hover:bg-[#fff3d1]/50 transition-colors"
                                          >
                                            <span className="text-3xl font-light leading-none mb-1">+</span>
                                            <span className="text-[10.5px] font-bold uppercase tracking-wider">
                                              Click to add image
                                            </span>
                                          </div>
                                        )}
                                        {el.data?.imageUrl && (
                                          <div className="relative mx-auto w-full group">
                                            <PanZoomImage
                                              src={el.data.imageUrl}
                                              data={el.data}
                                              onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })}
                                              isPreview={isPreviewMode}
                                              objectFit="contain"
                                              wrapperClass="w-full h-auto min-h-[180px] max-h-[36vh] bg-[#f6f7fc] rounded-2xl flex items-center justify-center border border-[#dfe2f2]"
                                            />
                                            {!isPreviewMode && (
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveMedia(el.id, 'image')}
                                                className="absolute top-2.5 right-2.5 w-8 h-8 bg-[#ee665b] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold shadow-md z-50 cursor-pointer"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>
                                        )}

                                        {el.type === 'record_compare' && (
                                          <div className="flex flex-col gap-3 w-full">
                                            {!isPreviewMode && !el.data?.audioUrl && (
                                              <div
                                                onClick={() => {
                                                  setMediaTarget({ id: el.id, type: 'audio' });
                                                  setActiveModal('media_upload');
                                                }}
                                                className="w-full h-16 bg-[#f6f7fc] border-2 border-dashed border-[#626a9f]/35 rounded-2xl flex items-center justify-center text-[#454d82] cursor-pointer hover:bg-[#fff3d1]/50 transition-colors"
                                              >
                                                <span className="text-xs font-bold uppercase tracking-wider">
                                                  + Add Target Audio
                                                </span>
                                              </div>
                                            )}
                                            {el.data?.audioUrl && (
                                              <div className="relative group w-full">
                                                <audio
                                                  src={el.data.audioUrl}
                                                  controls
                                                  controlsList="nodownload"
                                                  onContextMenu={(e) => e.preventDefault()}
                                                  className="w-full rounded-xl"
                                                />
                                                {!isPreviewMode && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedia(el.id, 'audio')}
                                                    className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-[#ee665b] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold z-50 cursor-pointer"
                                                  >
                                                    ✕
                                                  </button>
                                                )}
                                              </div>
                                            )}

                                            {!isPreviewMode ? (
                                              <textarea
                                                placeholder="Escribe la frase en inglés para que el estudiante la lea..."
                                                value={el.data?.transcriptText || ''}
                                                onChange={(e) =>
                                                  handleSaveData(el.id, { ...el.data, transcriptText: e.target.value })
                                                }
                                                className="w-full bg-[#f6f7fc] border border-[#dfe2f2] focus:border-[#454d82] rounded-xl p-3.5 text-[#1e2246] text-xs sm:text-sm font-medium outline-none resize-none h-24"
                                              />
                                            ) : (
                                              el.data?.transcriptText && (
                                                <div className="w-full bg-[#f6f7fc] border border-[#dfe2f2] rounded-xl p-4 text-center">
                                                  <p className="text-[#1e2246] font-bold text-base">
                                                    &ldquo;{el.data.transcriptText}&rdquo;
                                                  </p>
                                                </div>
                                              )
                                            )}

                                            {!isPreviewMode && (
                                              <div className="text-center text-[#626a9f] text-[10px] uppercase font-bold tracking-widest border-t border-[#dfe2f2] pt-3">
                                                Record Button renders in Bottom Dock
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {el.type === 'short_answer' && el.data && (
                                          <>
                                            <div
                                              dangerouslySetInnerHTML={{ __html: el.data.questionHtml }}
                                              className="w-full break-words text-[#1e2246] text-base font-semibold"
                                            />
                                            <input
                                              type="text"
                                              disabled={!isPreviewMode}
                                              placeholder={isPreviewMode ? 'Your answer...' : 'Student answers here'}
                                              value={studentAnswers[el.id] || ''}
                                              onChange={(e) =>
                                                setStudentAnswers((prev) => ({ ...prev, [el.id]: e.target.value }))
                                              }
                                              className="w-full p-4 mt-auto bg-[#f6f7fc] border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl text-[#1e2246] font-semibold outline-none text-sm"
                                            />
                                          </>
                                        )}

                                        {el.type === 'fill_in_the_blank' &&
                                          el.data &&
                                          (() => {
                                            const rawText = el.data.templateText || '';
                                            if (!rawText) {
                                              return (
                                                <div className="text-[#626a9f] text-center font-bold uppercase text-xs py-6">
                                                  No template text provided.
                                                </div>
                                              );
                                            }
                                            const parts = rawText.split(/(_+)/);
                                            let blankIndex = 0;

                                            return (
                                              <div className="w-full flex flex-col justify-center items-center py-3">
                                                <div
                                                  className="text-center w-full break-words leading-[3rem] text-[#1e2246]"
                                                  style={{
                                                    fontSize: el.data.t_fontSize ? `${el.data.t_fontSize}px` : '18px',
                                                    fontFamily: el.data.t_fontFamily || 'Montserrat',
                                                    fontWeight: el.data.t_isBold ? 'bold' : 'normal',
                                                    fontStyle: el.data.t_isItalic ? 'italic' : 'normal',
                                                    textDecoration: el.data.t_isUnderline ? 'underline' : 'none',
                                                  }}
                                                >
                                                  {parts.map((part, i) => {
                                                    if (part.includes('_')) {
                                                      const currentBlankIndex = blankIndex++;
                                                      const blankWidth = Math.max(64, Math.min(part.length * 15, 280));
                                                      return (
                                                        <input
                                                          key={i}
                                                          type="text"
                                                          disabled={!isPreviewMode}
                                                          placeholder={isPreviewMode ? '' : part}
                                                          value={studentAnswers[`${el.id}_${currentBlankIndex}`] || ''}
                                                          onChange={(e) =>
                                                            setStudentAnswers((prev) => ({
                                                              ...prev,
                                                              [`${el.id}_${currentBlankIndex}`]: e.target.value,
                                                            }))
                                                          }
                                                          className="mx-2 px-3 py-1 bg-[#f6f7fc] border-b-2 border-[#454d82] text-center outline-none rounded-t-lg font-bold text-[#1e2246]"
                                                          style={{ width: `${blankWidth}px` }}
                                                        />
                                                      );
                                                    }
                                                    return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          })()}

                                        {el.type === 'multiple_selection' && el.data && (
                                          <>
                                            {el.data.promptHtml && (
                                              <div
                                                dangerouslySetInnerHTML={{ __html: el.data.promptHtml }}
                                                className="mb-3 text-base font-semibold text-[#1e2246]"
                                              />
                                            )}
                                            <div className="flex flex-col gap-2.5 mt-auto">
                                              {el.data.options?.map((opt) => {
                                                const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                                                return (
                                                  <button
                                                    type="button"
                                                    key={opt.id}
                                                    onClick={() =>
                                                      isPreviewMode &&
                                                      setStudentAnswers((prev) => ({
                                                        ...prev,
                                                        [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`],
                                                      }))
                                                    }
                                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center cursor-pointer ${
                                                      isSelected
                                                        ? 'bg-[#ffc749] border-[#1e2246] text-[#1e2246]'
                                                        : 'bg-[#f6f7fc] border-[#dfe2f2] text-[#1e2246] hover:border-[#454d82]'
                                                    }`}
                                                  >
                                                    <div
                                                      className={`w-5 h-5 rounded-full border-2 mr-3.5 flex items-center justify-center shrink-0 ${
                                                        isSelected ? 'border-[#1e2246]' : 'border-[#626a9f]/50'
                                                      }`}
                                                    >
                                                      {isSelected && <div className="w-2.5 h-2.5 bg-[#1e2246] rounded-full" />}
                                                    </div>
                                                    <div
                                                      dangerouslySetInnerHTML={{ __html: opt.html }}
                                                      className="pointer-events-none text-sm sm:text-base font-bold"
                                                    />
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </>
                                        )}

                                        {el.type === 'slider_bar' &&
                                          el.data &&
                                          (() => {
                                            const isVert = el.data.orientation === 'vertical';
                                            const opts = el.data.options || [];
                                            const maxIdx = Math.max(0, opts.length - 1);
                                            const currentIdx =
                                              studentAnswers[el.id] !== undefined
                                                ? parseInt(studentAnswers[el.id], 10)
                                                : Math.floor(maxIdx / 2);
                                            const activeOpt = opts[currentIdx] || {};
                                            const pct = maxIdx === 0 ? 50 : (currentIdx / maxIdx) * 100;
                                            return (
                                              <div className="w-full flex flex-col min-h-[180px] justify-end relative pb-6 mt-4">
                                                <div className="absolute w-full h-full flex flex-col items-center justify-center">
                                                  <div
                                                    className="absolute rounded-full"
                                                    style={{
                                                      backgroundColor: el.data.barColor || 'rgba(98,106,159,0.25)',
                                                      width: isVert ? `${el.data.barThickness}px` : '100%',
                                                      height: isVert ? '100%' : `${el.data.barThickness}px`,
                                                    }}
                                                  />
                                                  <input
                                                    type="range"
                                                    min="0"
                                                    max={maxIdx}
                                                    step="1"
                                                    disabled={!isPreviewMode}
                                                    value={currentIdx}
                                                    onChange={(e) =>
                                                      setStudentAnswers((prev) => ({ ...prev, [el.id]: e.target.value }))
                                                    }
                                                    className="absolute custom-slider w-full h-full z-10 cursor-pointer"
                                                    style={{
                                                      '--thumb-color': el.data.handleColor || '#ffc749',
                                                      transform: isVert ? 'rotate(-90deg)' : 'none',
                                                      WebkitAppearance: 'none',
                                                      background: 'transparent',
                                                    }}
                                                  />
                                                  {!isVert && (
                                                    <div
                                                      className="absolute flex flex-col items-center transition-all duration-200 pointer-events-none z-0"
                                                      style={{
                                                        left: `${pct}%`,
                                                        bottom: 'calc(50% + 22px)',
                                                        transform: 'translateX(-50%)',
                                                      }}
                                                    >
                                                      <div className="bg-[#1e2246] text-[#ffc749] px-4 py-2 rounded-xl shadow-md font-bold text-sm">
                                                        {activeOpt.text}
                                                      </div>
                                                      <div
                                                        className="w-0 h-0 border-solid"
                                                        style={{
                                                          borderWidth: '8px 6px 0 6px',
                                                          borderColor: '#1e2246 transparent transparent transparent',
                                                        }}
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })()}
                                      </div>
                                    )}

                                    {/* DRAG AND DROP */}
                                    {el.type === 'drag_and_drop' &&
                                      el.data &&
                                      (() => {
                                        const count = Math.min(el.data.items.filter((i) => i.imageUrl).length || 2, 4);
                                        const gridColsMap = {
                                          1: 'lg:grid-cols-1',
                                          2: 'lg:grid-cols-2',
                                          3: 'lg:grid-cols-3',
                                          4: 'lg:grid-cols-4',
                                        };
                                        return (
                                          <div className="w-full max-w-6xl bg-white/85 rounded-[2rem] border border-white p-6 sm:p-8 flex flex-col gap-7 shadow-md">
                                            <div className={`grid grid-cols-2 ${gridColsMap[count]} gap-5 w-full`}>
                                              {el.data.items.map(
                                                (item, idx) =>
                                                  item.imageUrl && (
                                                    <div key={idx} className="flex flex-col items-center gap-3.5">
                                                      <div className="w-full rounded-2xl overflow-hidden">
                                                        <PanZoomImage
                                                          src={item.imageUrl}
                                                          data={item}
                                                          onSave={(d) => {
                                                            if (isPreviewMode) return;
                                                            const newItems = [...el.data.items];
                                                            newItems[idx] = { ...newItems[idx], ...d };
                                                            handleSaveData(el.id, { ...el.data, items: newItems });
                                                          }}
                                                          isPreview={isPreviewMode}
                                                          objectFit="contain"
                                                          wrapperClass="w-full aspect-[4/5] bg-[#f6f7fc] rounded-2xl border border-[#dfe2f2] flex items-center justify-center p-2"
                                                        />
                                                      </div>
                                                      <div
                                                        data-dnd-zone={`${el.id}_${idx}`}
                                                        className="w-full min-h-[70px] border-2 border-dashed border-[#626a9f]/40 rounded-2xl bg-[#f6f7fc] flex items-center justify-center p-2"
                                                      >
                                                        {dndAnswers[`${el.id}_${idx}`] ? (
                                                          <div
                                                            onClick={() =>
                                                              setDndAnswers((prev) => {
                                                                const copy = { ...prev };
                                                                delete copy[`${el.id}_${idx}`];
                                                                return copy;
                                                              })
                                                            }
                                                            className="px-4 py-2.5 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] rounded-xl font-bold text-sm cursor-pointer w-full text-center truncate"
                                                          >
                                                            {dndAnswers[`${el.id}_${idx}`]}
                                                          </div>
                                                        ) : (
                                                          <span className="text-[#626a9f]/60 text-[10px] uppercase font-bold tracking-widest">
                                                            Drop Here
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  )
                                              )}
                                            </div>

                                            <div className="w-full bg-[#f6f7fc] p-5 rounded-2xl border border-[#dfe2f2]">
                                              <div className="text-center font-bold text-[#454d82] text-xs uppercase tracking-widest mb-4">
                                                Word Bank
                                              </div>
                                              <div className="flex flex-wrap justify-center gap-3">
                                                {el.data.items.map((item, idx) => {
                                                  if (!item.studentViewText) return null;
                                                  const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                                                  if (isUsed) return null;
                                                  return (
                                                    <div
                                                      key={`bank-${idx}`}
                                                      onPointerDown={(e) => {
                                                        e.preventDefault();
                                                        setTouchDragState({
                                                          isDragging: true,
                                                          text: item.studentViewText,
                                                          x: e.clientX || (e.touches && e.touches[0].clientX),
                                                          y: e.clientY || (e.touches && e.touches[0].clientY),
                                                          sourceElId: el.id,
                                                        });
                                                      }}
                                                      className="px-5 py-2.5 bg-white hover:bg-[#ffc749] border-2 border-[#dfe2f2] hover:border-[#1e2246] rounded-xl text-[#1e2246] font-bold text-sm shadow-sm cursor-grab touch-none"
                                                    >
                                                      {item.studentViewText}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}

                                    {/* PUZZLES (CROSSWORD & WORD SEARCH) */}
                                    {(el.type === 'crossword' || el.type === 'word_search') && el.data && (
                                      <div className="w-full max-w-6xl bg-white/85 rounded-[2rem] border border-white p-6 flex flex-col md:flex-row gap-7 shadow-md">
                                        <div className="flex-1 flex flex-col gap-5 max-h-[460px] overflow-y-auto custom-scrollbar pr-2">
                                          {el.type === 'crossword' && (
                                            <>
                                              <h3 className="font-extrabold text-[#454d82] text-sm uppercase tracking-widest border-b border-[#dfe2f2] pb-2">
                                                Prompts
                                              </h3>
                                              <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="flex-1 flex flex-col gap-2.5">
                                                  <h4 className="text-[11px] font-bold text-[#626a9f] uppercase">Across</h4>
                                                  {el.data.across?.map((a) => (
                                                    <div key={`a-${a.num}`} className="text-xs sm:text-sm text-[#1e2246] flex gap-2">
                                                      <span className="font-extrabold text-[#454d82]">{a.num}.</span>
                                                      <span>{a.prompt}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                                <div className="flex-1 flex flex-col gap-2.5">
                                                  <h4 className="text-[11px] font-bold text-[#626a9f] uppercase">Down</h4>
                                                  {el.data.down?.map((d) => (
                                                    <div key={`d-${d.num}`} className="text-xs sm:text-sm text-[#1e2246] flex gap-2">
                                                      <span className="font-extrabold text-[#454d82]">{d.num}.</span>
                                                      <span>{d.prompt}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          {el.type === 'word_search' && (
                                            <>
                                              <div
                                                dangerouslySetInnerHTML={{ __html: el.data.promptHtml }}
                                                className="w-full whitespace-pre-wrap break-words border-b border-[#dfe2f2] pb-4 text-base font-semibold text-[#1e2246]"
                                              />
                                              <div className="flex flex-wrap gap-2">
                                                {el.data.targetWords?.map((w, i) => (
                                                  <span
                                                    key={`w-${i}`}
                                                    className="bg-[#f6f7fc] border border-[#dfe2f2] px-3 py-1 rounded-lg text-xs font-bold text-[#1e2246] flex items-center gap-1.5"
                                                  >
                                                    <span className="w-2 h-2 rounded-full bg-[#ffc749] border border-[#1e2246]" />
                                                    {w}
                                                  </span>
                                                ))}
                                              </div>
                                            </>
                                          )}
                                        </div>

                                        <div className="flex-[1.6] bg-[#f6f7fc] rounded-2xl border border-[#dfe2f2] p-4 zoom-container flex justify-center items-center min-h-[380px]">
                                          {el.type === 'crossword' && (
                                            <div
                                              style={{
                                                display: 'grid',
                                                gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(40px, 1fr))`,
                                                gap: '3px',
                                                width: 'fit-content',
                                              }}
                                            >
                                              {el.data.grid.map((row, rIdx) =>
                                                row.map((cell, cIdx) => (
                                                  <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-10 md:w-12">
                                                    {cell ? (
                                                      <div className="w-full h-full relative">
                                                        {cell.num && (
                                                          <span className="absolute top-1 left-1 text-[9px] font-extrabold text-[#454d82] z-10 pointer-events-none">
                                                            {cell.num}
                                                          </span>
                                                        )}
                                                        <input
                                                          type="text"
                                                          maxLength={1}
                                                          value={studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || ''}
                                                          onChange={(e) =>
                                                            setStudentAnswers((prev) => ({
                                                              ...prev,
                                                              [`${el.id}_${rIdx}_${cIdx}`]: e.target.value
                                                                .toUpperCase()
                                                                .replace(/[^A-Z]/g, ''),
                                                            }))
                                                          }
                                                          className="w-full h-full text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#454d82] rounded-lg bg-white border border-[#626a9f]/35 text-[#1e2246] font-bold"
                                                        />
                                                      </div>
                                                    ) : (
                                                      <div className="w-full h-full bg-transparent" />
                                                    )}
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          )}

                                          {el.type === 'word_search' && (
                                            <div
                                              style={{
                                                display: 'grid',
                                                gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`,
                                                borderWidth: '3px',
                                                borderStyle: 'solid',
                                                borderColor: el.data.lineColor || '#454d82',
                                                backgroundColor: el.data.cellColor || '#ffffff',
                                              }}
                                              className="shadow-md max-w-[440px] aspect-square w-full rounded-2xl overflow-hidden"
                                            >
                                              {el.data.grid?.map((row, rIdx) =>
                                                row.map((char, cIdx) => {
                                                  const cellId = `${el.id}_${rIdx}_${cIdx}`;
                                                  const isSelected = (studentAnswers[`${el.id}_cells`] || []).includes(cellId);
                                                  return (
                                                    <div
                                                      key={cellId}
                                                      onClick={() =>
                                                        setStudentAnswers((prev) => {
                                                          const current = prev[`${el.id}_cells`] || [];
                                                          return {
                                                            ...prev,
                                                            [`${el.id}_cells`]: current.includes(cellId)
                                                              ? current.filter((c) => c !== cellId)
                                                              : [...current, cellId],
                                                          };
                                                        })
                                                      }
                                                      style={{
                                                        borderRight:
                                                          cIdx < (el.data.size || 10) - 1
                                                            ? `1px solid ${el.data.lineColor || 'rgba(98,106,159,0.25)'}`
                                                            : 'none',
                                                        borderBottom:
                                                          rIdx < (el.data.size || 10) - 1
                                                            ? `1px solid ${el.data.lineColor || 'rgba(98,106,159,0.25)'}`
                                                            : 'none',
                                                        backgroundColor: isSelected ? 'rgba(255, 199, 73, 0.65)' : 'transparent',
                                                        cursor: 'pointer',
                                                      }}
                                                      className="flex items-center justify-center font-bold text-[#1e2246] select-none"
                                                    >
                                                      {char}
                                                    </div>
                                                  );
                                                })
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* BOTTOM ACTION DOCK */}
                            <div className="w-full mt-auto pt-12 pb-4 flex justify-center items-center gap-5 relative z-50">
                              {dockElements.map((el) => {
                                if (el.type === 'record_compare') {
                                  return (
                                    <div key={el.id} className="relative group">
                                      {!isPreviewMode && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteElement(el.id)}
                                          className="absolute -top-3 -right-3 w-7 h-7 bg-[#ee665b] text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleRcClick(el.id)}
                                        className="ola-adm-btn-outline px-8 py-3.5 rounded-full flex items-center gap-3 font-bold uppercase tracking-widest text-xs cursor-pointer"
                                      >
                                        <span
                                          className={`w-3.5 h-3.5 rounded-full ${
                                            rcStates[el.id]?.phase === 'RECORDING'
                                              ? 'bg-[#ee665b] animate-pulse'
                                              : 'bg-[#454d82]'
                                          }`}
                                        />
                                        <span>
                                          {rcStates[el.id]?.phase === 'RECORDING'
                                            ? 'Recording'
                                            : rcStates[el.id]?.phase === 'HAS_RECORDING'
                                            ? 'Compare'
                                            : rcStates[el.id]?.phase === 'PLAYING'
                                            ? 'Comparing'
                                            : 'Record'}
                                        </span>
                                      </button>
                                    </div>
                                  );
                                }
                                if (el.type === 'nav_button') {
                                  return (
                                    <div key={el.id} className="relative group">
                                      {!isPreviewMode && (
                                        <div
                                          className={`absolute -top-3.5 -right-3.5 z-50 flex gap-1.5 transition-opacity ${
                                            isMobile ? 'opacity-100 scale-90' : 'opacity-0 group-hover:opacity-100'
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingElementId(el.id);
                                              setActiveModal(el.type);
                                            }}
                                            className="w-8 h-8 bg-[#454d82] text-white rounded-full text-xs shadow-md cursor-pointer flex items-center justify-center"
                                            title="Edit"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDuplicateElement(el.id)}
                                            className="w-8 h-8 bg-[#16a37f] text-white rounded-full text-xs shadow-md cursor-pointer flex items-center justify-center"
                                            title="Duplicate"
                                          >
                                            📋
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteElement(el.id)}
                                            className="w-8 h-8 bg-[#ee665b] text-white rounded-full text-xs shadow-md cursor-pointer flex items-center justify-center"
                                            title="Delete"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        className="ola-adm-btn-yellow px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm cursor-pointer"
                                      >
                                        {el.data?.buttonStyle === 'finish_pill' ? 'Finish' : 'Continue →'}
                                      </button>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}

                  {!isPreviewMode && !['Manuals', 'Cue Cards'].includes(contentType) && (
                    <div className={`w-full flex flex-col items-center py-10 z-20 ${isMobile ? 'pb-28' : ''}`}>
                      <button
                        type="button"
                        onClick={handleExpandWorkspace}
                        className="ola-adm-btn-yellow w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-2xl font-bold"
                        title="Add New Screen"
                      >
                        +
                      </button>
                      <span className="text-[11px] font-bold text-[#454d82] uppercase tracking-widest mt-3">
                        Add New Screen
                      </span>
                    </div>
                  )}
                </div>

                {/* MOBILE FAB FOR TOOLS */}
                {isMobile && !isPreviewMode && !['Manuals', 'Cue Cards'].includes(contentType) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsMobileToolsOpen(true)}
                      className="ola-adm-btn-yellow fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center z-[250] text-2xl font-bold cursor-pointer"
                      aria-label="Add Element"
                    >
                      +
                    </button>

                    {isMobileToolsOpen && (
                      <div
                        className="fixed inset-0 z-[400] flex items-end justify-center bg-[#1e2246]/55 backdrop-blur-md p-4 pb-24"
                        onClick={() => setIsMobileToolsOpen(false)}
                      >
                        <div
                          className="ola-adm-glass ola-adm-modal-in rounded-[2rem] w-full p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center border-b border-[#626a9f]/15 pb-3 shrink-0">
                            <h3 className="text-base font-extrabold text-[#1e2246] uppercase">Add Element</h3>
                            <button
                              type="button"
                              onClick={() => setIsMobileToolsOpen(false)}
                              className="w-8 h-8 bg-white border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5 overflow-y-auto custom-scrollbar">
                            {toolOptions.map((tool) => (
                              <button
                                type="button"
                                key={tool}
                                onClick={() => {
                                  handleToolSelect(tool);
                                  setIsMobileToolsOpen(false);
                                }}
                                className="py-3.5 px-3 bg-white/85 hover:bg-[#ffc749] border border-white text-[#1e2246] font-bold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer shadow-sm"
                              >
                                {tool}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      {isMobile && !isPreviewMode && (
        <nav className="fixed bottom-0 left-0 right-0 h-[76px] bg-white/75 backdrop-blur-2xl border-t border-white flex items-center justify-around px-2 z-[200] shadow-[0_-10px_28px_-10px_rgba(55,63,118,0.28)]">
          <NavIconBtn
            iconSvg={adminNavIcons.accounts}
            label="Accounts"
            active={activeModule === 'ACCOUNTS'}
            onClick={() => {
              setActiveModule('ACCOUNTS');
              setAccountsView('OVERVIEW');
            }}
          />
          <NavIconBtn
            iconSvg={adminNavIcons.calendar}
            label="Calendars"
            active={activeModule === 'CALENDARS'}
            onClick={() => setActiveModule('CALENDARS')}
          />
          <NavIconBtn
            iconSvg={adminNavIcons.content}
            label="Studio"
            active={activeModule === 'CONTENTS'}
            onClick={() => setActiveModule('CONTENTS')}
          />
          <NavIconBtn
            iconSvg={adminNavIcons.communications}
            label="Comms"
            active={activeModule === 'COMMUNICATIONS'}
            onClick={() => setActiveModule('COMMUNICATIONS')}
            hasNotification
          />
          <NavIconBtn
            iconSvg={adminNavIcons.finances}
            label="Finances"
            active={activeModule === 'FINANCES'}
            onClick={() => setActiveModule('FINANCES')}
          />
          <NavIconBtn
            iconSvg={adminNavIcons.settings}
            label="Settings"
            active={activeModule === 'SETTINGS'}
            onClick={() => {
              setActiveModule('SETTINGS');
              setSettingsView('MENU');
            }}
          />
        </nav>
      )}

      {/* ==========================================
          PRESERVED BUILDER MODALS
      ========================================== */}
      <FillInTheBlankModal
        isOpen={activeModal === 'fill_in_the_blank'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('fill_in_the_blank', d)}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <ShapeConfigModal
        isOpen={activeModal === 'shape'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('shape', d)}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <DragAndDropModal
        isOpen={activeModal === 'drag_and_drop'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('drag_and_drop', d)}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <ShortAnswerModal
        isOpen={activeModal === 'short_answer'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('short_answer', d)}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <MultipleSelectionModal
        isOpen={activeModal === 'multiple_selection'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('multiple_selection', d)}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <SliderBarModal
        isOpen={activeModal === 'slider_bar'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('slider_bar', d)}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <CrosswordModal
        isOpen={activeModal === 'crossword'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('crossword', { ...d, ...generateCrosswordLayout(d.items) })}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <WordSearchModal
        isOpen={activeModal === 'word_search'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('word_search', { ...d, ...generateWordSearchGrid(d.words) })}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />
      <NavButtonModal
        isOpen={activeModal === 'nav_button'}
        initialData={editingElementId ? canvasElements.find((e) => e.id === editingElementId)?.data : {}}
        onSave={(d) => handleSaveModal('nav_button', d)}
        onCancel={() => {
          setActiveModal(null);
          setEditingElementId(null);
        }}
      />

      {/* SAVE BLUEPRINT CONFIRMATION MODAL */}
      {isSaveModalOpen && (
        <div
          onClick={(e) => e.target === e.currentTarget && !isSaving && setIsSaveModalOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl px-4"
        >
          <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] p-8 max-w-md w-full flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full mb-3">
              {selectedLevel || 'No Level'} • {selectedUnit || 'No Unit'} • {contentType}
            </span>
            <h2 className="text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-2">
              Commit Changes?
            </h2>
            <p className="text-xs sm:text-sm text-[#4c5384] font-medium mb-7 leading-relaxed">
              This will publish the updated blueprint immediately for all active OutLoud students.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => !isSaving && setIsSaveModalOpen(false)}
                className="ola-adm-btn-outline flex-1 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmSave}
                className="ola-adm-btn-yellow flex-1 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Push Live'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDIA URL MODAL */}
      {(activeModal === 'video' || activeModal === 'media_upload') && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveModal(null);
              setMediaUrlInput('');
              setMediaTarget({ id: null, type: 'image' });
            }
          }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl px-4"
        >
          <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] p-7 sm:p-9 max-w-lg w-full flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-5 text-center">
              Add {mediaTarget.type}
            </h2>
            <input
              type="text"
              placeholder="Paste Bunny.net / R2 / Cloudflare URL..."
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              className="w-full bg-white/90 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-2xl px-5 py-4 text-sm font-semibold text-[#1e2246] outline-none mb-7 shadow-sm"
            />
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setMediaUrlInput('');
                  setMediaTarget({ id: null, type: 'image' });
                }}
                className="ola-adm-btn-outline flex-1 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMedia}
                className="ola-adm-btn-yellow flex-1 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Add Media
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRITICAL SOS SUBSTITUTE / KILL-STOP MODAL */}
      {showSubModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#1e2246]/65 backdrop-blur-xl p-4 font-montserrat">
          <div
            className={`ola-adm-glass ola-adm-modal-in rounded-[2.25rem] p-7 sm:p-8 max-w-md w-full border-2 ${
              droppedSessionTarget?.isCritical ? 'border-[#ee665b]' : 'border-[#ffc749]'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ee665b] animate-ping shrink-0" />
              <h3 className="text-lg sm:text-xl font-extrabold text-[#c93f34] uppercase tracking-tight">
                {droppedSessionTarget?.isCritical ? 'Critical: Session Lost' : 'Assign Substitute'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#4c5384] mb-5 leading-relaxed">
              Prof.{' '}
              <strong className="font-bold text-[#1e2246]">
                {droppedSessionTarget?.teacher?.first_name} {droppedSessionTarget?.teacher?.last_name}
              </strong>{' '}
              has been missing for over {droppedSessionTarget?.isCritical ? '10 minutes' : '2 minutes'}.{' '}
              {droppedSessionTarget?.isCritical
                ? 'Dispatch a substitute immediately or manually cancel the session to handle refund/rebooking.'
                : 'Assign an available instructor to immediately inherit this live session.'}
            </p>

            <div className="flex flex-col gap-3.5">
              <select
                id="sub-teacher-select"
                className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-[#1e2246] text-xs sm:text-sm font-bold outline-none cursor-pointer"
              >
                <option value="">Select a substitute teacher...</option>
                {directoryUsers
                  .filter((u) => u.role === 'Teacher' && u.id !== droppedSessionTarget?.teacher_id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      Prof. {t.first_name} {t.last_name}
                    </option>
                  ))}
              </select>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="ola-adm-btn-outline flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const subId = document.getElementById('sub-teacher-select').value;
                    if (!subId) return showToast('Please select a substitute teacher.', 'error');

                    await supabase
                      .from('live_sessions')
                      .update({
                        teacher_id: subId,
                        original_teacher_id: droppedSessionTarget.teacher_id,
                        status: 'booked',
                        last_ping_at: null,
                      })
                      .eq('id', droppedSessionTarget.id);

                    setShowSubModal(false);
                    setDroppedSessionTarget(null);
                    fetchDashboardStats();
                    showToast('Substitute dispatched successfully.', 'success');
                  }}
                  className="ola-adm-btn-danger flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Dispatch Sub
                </button>
              </div>

              {droppedSessionTarget?.isCritical && (
                <div className="mt-2 pt-4 border-t border-[#ee665b]/25">
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          'Are you sure? This will cancel the class entirely so you can manually manage the refund and rebooking with the student.'
                        )
                      ) {
                        return;
                      }

                      await supabase
                        .from('live_sessions')
                        .update({
                          status: 'cancelled',
                          ended_at: new Date().toISOString(),
                        })
                        .eq('id', droppedSessionTarget.id);

                      setShowSubModal(false);
                      setDroppedSessionTarget(null);
                      fetchDashboardStats();
                      showToast('Class cancelled. Contact student for manual rebooking.', 'info');
                    }}
                    className="w-full py-3 bg-[#ee665b]/12 hover:bg-[#ee665b] border-2 border-[#ee665b] text-[#c93f34] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors cursor-pointer"
                  >
                    Manual Cancel &amp; Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHub;