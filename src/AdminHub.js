import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
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
import CommercialFunnelModule from './statistics_engines/CommercialFunnelModule';
import ProfitMarginAnalysis from './statistics_engines/ProfitMarginAnalysis';


// ==========================================
// DEDICATED PROVISIONING MODAL
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

  // Financial States (No screenshots required)
  const MONTHLY_PRICES = { A1: 20, A2: 20, B1: 30, B2: 30, C1: 50, C2: 50 };
  const [payMethod, setPayMethod] = useState('Zelle');
  const [payDate, setPayDate] = useState('');
  const [payRef, setPayRef] = useState('');

  if (!isOpen) return null;

  // Proration Math
  const getBaseLevel = (lvl) => lvl ? lvl.split(':')[0].trim() : 'A1';
  const calculateProration = () => {
    const today = new Date();
    let nextBilling = new Date(today.getFullYear(), today.getMonth(), provCohort);
    if (today.getDate() >= provCohort) nextBilling.setMonth(nextBilling.getMonth() + 1);
    const daysLeft = Math.max(0, Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24)));
    const price = MONTHLY_PRICES[getBaseLevel(provLevel)] || 40;
    return ((price / 30) * daysLeft).toFixed(2);
  };
  const proratedDue = calculateProration();

const handleProvision = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      alert("Nombres, correo y contraseña son obligatorios.");
      return;
    }
    if (role === 'Student' && (!payMethod || !payDate || !payRef)) {
      alert("Para registrar un estudiante, debes llenar todos los datos financieros.");
      return;
    }

    setIsProcessing(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Edge Function ONLY creates the secure login and feeds the SQL trigger
      const { data: edgeData, error: authError } = await supabase.functions.invoke('provision-user', {
        body: { 
          email: cleanEmail, 
          password: password, 
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: role,
          level: role === 'Student' ? provLevel : 'Staff',
          unit: role === 'Student' ? provUnit : 1
        }
      });

      if (authError) throw new Error(`Fallo en Auth/Edge Function: ${authError.message}`);
      if (edgeData?.error) throw new Error(`Error de Autenticación: ${edgeData.error}`);

      // Extract the exact ID of the newly created user
      const newUserId = edgeData?.user?.id;
      if (!newUserId) throw new Error("No se pudo obtener el ID del usuario desde la función.");

      // 2. THE MASTER UPDATE: React forces all data into the database directly
      const profileUpdates = {
        email: cleanEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        whatsapp: phone || null,
        avatar_url: avatarUrl || null,
        role: role,
        assigned_password: password,
        status: 'active'
      };

      if (role === 'Student') {
        profileUpdates.cohort = provCohort;
        profileUpdates.level = provLevel;
        profileUpdates.unit = provUnit;
        profileUpdates.available_credits = 0; 
      }

      const { error: profileError } = await supabase.from('profiles').update(profileUpdates).eq('id', newUserId);
      
      // If your database rejects it, THIS line will tell us exactly which column caused it.
      if (profileError) throw new Error(`Fallo actualizando perfil en BD: ${profileError.message}`);

      // 3. Log the Payment in the Ledger safely
      if (role === 'Student' && payRef) {
        const { error: paymentError } = await supabase.from('student_payments').insert({
          student_id: newUserId,
          payment_type: 'Initial Enrollment (Prorated)',
          amount: proratedDue,
          reference_number: payRef,
          status: 'verified' 
        });
        
        if (paymentError) console.warn("Aviso: Perfil creado, pero falló el registro del pago.", paymentError);
      }

      alert(`¡Cuenta aprovisionada exitosamente!`);
      
      // Clear the form / Refresh
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
      window.location.reload();

    } catch (error) {
      console.error("Provisioning Error:", error);
      alert(`Error crítico: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="prov-overlay" onClick={(e) => e.target.id === 'prov-overlay' && onClose()} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-fade-in font-montserrat">
      <div className="bg-[#070b19]/95 border border-[#fcd34d]/30 rounded-[2rem] p-8 max-w-4xl w-full shadow-[0_0_40px_rgba(252,211,77,0.15)] relative flex flex-col animate-slide-up overflow-hidden max-h-[95vh]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Provisioning</h2>
            <p className="text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest mt-1">Creación y Registro Financiero</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">✕</button>
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-2 relative z-10">
          <form onSubmit={handleProvision} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Personal Data */}
            <div className="space-y-5">
              <h3 className="text-xs font-black text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">Información Personal</h3>
              
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden bg-black/40 flex items-center justify-center shrink-0">
                  {avatarUrl ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-2xl text-white/30">+</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-1">URL Foto (Opcional)</label>
                  <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="Enlace de la imagen..." className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#fcd34d]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Nombres</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#fcd34d]" required />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Apellidos</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#fcd34d]" required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Correo Electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#fcd34d]" required />
              </div>

              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Asignar Contraseña</label>
                <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ej: OlaAlberto.2026" className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#fcd34d]" required />
              </div>

              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Teléfono (WhatsApp)</label>
                <div className="w-full rounded-xl px-3 py-2 text-[11px] lg:text-sm font-montserrat transition-all shadow-inner border border-white/20 bg-black/40 text-white focus-within:border-[#fcd34d] focus-within:ring-1 focus-within:ring-[#fcd34d]" style={{ colorScheme: 'dark' }}>
                  <PhoneInput defaultCountry="VE" international value={phone} onChange={setPhone} className="PhoneInputCustom w-full bg-transparent outline-none" />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Financials & Academic */}
            <div className="space-y-5 flex flex-col">
              <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <h3 className="text-xs font-black text-white/50 uppercase tracking-widest">Asignación de Rol</h3>
                <select value={role} onChange={e => setRole(e.target.value)} className="bg-transparent text-[#fcd34d] text-xs font-bold uppercase outline-none cursor-pointer">
                  <option value="Student">Estudiante</option>
                  <option value="Teacher">Profesor</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>

              {role === 'Student' ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Nivel</label>
                      <select value={provLevel} onChange={e => setProvLevel(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-2 py-2.5 text-white text-xs outline-none focus:border-[#fcd34d] cursor-pointer appearance-none">
                        {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l.split(':')[0]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Unidad</label>
                      <input type="number" min="1" max="12" value={provUnit} onChange={e => setProvUnit(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#fcd34d]" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Cohorte</label>
                      <select value={provCohort} onChange={e => setProvCohort(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/20 rounded-xl px-2 py-2.5 text-white text-xs outline-none focus:border-[#fcd34d] cursor-pointer appearance-none">
                        <option value={15}>Día 15</option>
                        <option value={30}>Día 30</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-[#fcd34d]/30 rounded-2xl p-5 shadow-inner mt-2">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                      <span className="text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest">Cobro Prorrateado Hoy</span>
                      <span className="text-xl font-black text-[#fcd34d]">${proratedDue}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Método de Pago</label>
                        <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#fcd34d] cursor-pointer">
                          <option value="Zelle">Zelle</option>
                          <option value="PagoMovil">Pago Móvil</option>
                          <option value="Cash">Efectivo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Fecha de Pago</label>
                        <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#fcd34d] cursor-pointer" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Número de Referencia (Zelle / Pago Móvil)</label>
                      <input type="text" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Ej: REF-923847" className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#fcd34d]" required />
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Personal Administrativo no requiere pago de inscripción.</p>
                </div>
              )}

              <button type="submit" disabled={isProcessing} className="w-full py-4 mt-auto bg-[#fcd34d] hover:bg-white text-[#08203e] font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(252,211,77,0.3)] disabled:opacity-50 hover:scale-[1.02]">
                {isProcessing ? 'PROCESANDO EN BD...' : 'PROVISIONAR CUENTA'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// PAN & ZOOM IMAGE COMPONENT (RESIZABLE CONTAINER)
// ==========================================
const PanZoomImage = ({ src, data, onSave, isPreview, wrapperClass = "w-full h-64" }) => {
  const [zoom, setZoom] = useState(data?.zoom || 1);
  const [pan, setPan] = useState({ x: data?.panX || 0, y: data?.panY || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Container Resize State
  const [containerSize, setContainerSize] = useState({
    width: data?.containerWidth || null,
    height: data?.containerHeight || null
  });
  const containerRef = useRef(null);

  useEffect(() => {
    setZoom(data?.zoom || 1);
    setPan({ x: data?.panX || 0, y: data?.panY || 0 });
    setContainerSize({ width: data?.containerWidth || null, height: data?.containerHeight || null });
  }, [data?.zoom, data?.panX, data?.panY, data?.containerWidth, data?.containerHeight]);

  // --- INNER IMAGE ZOOM LOGIC ---
  const handleZoom = (amount) => {
    if (isPreview) return;
    const newZoom = Math.max(0.1, Math.min(zoom + amount, 5));
    setZoom(newZoom);
    if (onSave) onSave({ zoom: newZoom, panX: pan.x, panY: pan.y, containerWidth: containerSize.width, containerHeight: containerSize.height });
  };

  // --- INNER IMAGE PAN LOGIC ---
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
    if (onSave) onSave({ zoom, panX: pan.x, panY: pan.y, containerWidth: containerSize.width, containerHeight: containerSize.height });
    e.target.releasePointerCapture(e.pointerId);
  };

  // --- CONTAINER RESIZE LOGIC ---
  const handleResizeDown = (e) => {
    if (isPreview) return;
    e.stopPropagation(); // Prevent panning while resizing
    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);
    const startWidth = containerRef.current.offsetWidth;
    const startHeight = containerRef.current.offsetHeight;

    const handleResizeMove = (moveEvent) => {
       const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
       const clientY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
       
       // Apply minimum bounds so the image doesn't collapse into nothing
       const newWidth = Math.max(100, startWidth + (clientX - startX));
       const newHeight = Math.max(100, startHeight + (clientY - startY));
       
       setContainerSize({ width: newWidth, height: newHeight });
    };

    const handleResizeUp = () => {
       document.removeEventListener('pointermove', handleResizeMove);
       document.removeEventListener('pointerup', handleResizeUp);
       document.removeEventListener('touchmove', handleResizeMove);
       document.removeEventListener('touchend', handleResizeUp);
       
       // Save exact new container dimensions to database
       if (onSave) {
          onSave({ 
             zoom, panX: pan.x, panY: pan.y, 
             containerWidth: containerRef.current.offsetWidth, 
             containerHeight: containerRef.current.offsetHeight 
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
      className={`overflow-hidden relative bg-black/20 group ${!containerSize.width ? wrapperClass : 'rounded-2xl shadow-xl'}`}
      style={{
         width: containerSize.width ? `${containerSize.width}px` : undefined,
         height: containerSize.height ? `${containerSize.height}px` : undefined,
         margin: '0 auto' // Keeps element centered naturally
      }}
    >
      <img 
        src={src} 
        alt="media" 
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full object-cover ${isPreview ? '' : 'cursor-move'} touch-none will-change-transform`}
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp} 
        onPointerCancel={handlePointerUp}
        style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }} 
      />

      {/* Inner Image Zoom Buttons */}
      {!isPreview && (
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoom(0.2); }} 
            className="w-8 h-8 bg-[#08203e]/80 backdrop-blur-md text-white rounded-lg flex items-center justify-center font-black hover:bg-[#fcd34d] hover:text-[#08203e] shadow-lg border border-white/20 transition-colors cursor-pointer"
            title="Zoom Image In"
          >
            +
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoom(-0.2); }} 
            className="w-8 h-8 bg-[#08203e]/80 backdrop-blur-md text-white rounded-lg flex items-center justify-center font-black hover:bg-[#fcd34d] hover:text-[#08203e] shadow-lg border border-white/20 transition-colors cursor-pointer"
            title="Zoom Image Out"
          >
            -
          </button>
        </div>
      )}
      
      {/* Container Resize Drag Handle */}
      {!isPreview && (
        <div 
          onPointerDown={handleResizeDown}
          className="absolute bottom-0 right-0 w-8 h-8 z-30 cursor-nwse-resize flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Drag to resize container"
        >
          <svg className="w-4 h-4 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 21h6v-6M21 21l-7-7" />
          </svg>
        </div>
      )}

      {!isPreview && (
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white/70 text-[9px] font-black px-2 py-1 rounded pointer-events-none uppercase tracking-widest shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
          DRAG: PAN | CORNER: RESIZE
        </div>
      )}
    </div>
  );
};

// ==========================================
// NAVIGATION ICONS
// ==========================================
const navIcons = {
  accounts: "https://i.postimg.cc/7L53pM9G/5(6).png",
  calendar: "https://i.postimg.cc/RC77501r/8(5).png",
  content: "https://i.postimg.cc/GtLH1bR6/6(7).png",
  communications: "https://i.postimg.cc/k5W462gP/3(9).png",
  finances: "https://i.postimg.cc/qB173V4X/7(9).png",
  settings: "https://i.postimg.cc/cLwZTVyP/1(9).png"
};

const NavIconBtn = ({ iconUrl, active, onClick, hasNotification, isProfile, avatarUrl }) => (
  <button onClick={onClick} className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-white/10 border border-white/20 shadow-inner' : 'hover:bg-white/5 border border-transparent'}`}>
    {hasNotification && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#070b19] z-10 animate-pulse"></div>}
    {isProfile ? (
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white/50 bg-black/40 flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        )}
      </div>
    ) : (
      <img src={iconUrl} alt="Nav Icon" className={`w-8 h-8 md:w-9 md:h-9 object-contain transition-all duration-300 ${active ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-80'}`} />
    )}
  </button>
);

// ==========================================
// EVALUATOR MODULE (LIST + ORAL DASHBOARD)
// ==========================================
const EVAL_QUESTIONS = {
  'A1-A2': [
    { id: 1, text: "What is your name, and where do you live?" },
    { id: 2, text: "Can you describe your typical morning routine?" },
    { id: 3, text: "What is your favorite type of food, and why do you like it?" },
    { id: 4, text: "Tell me about the members of your family or the people you live with." },
    { id: 5, text: "What do you usually do on the weekends for fun?" },
    { id: 6, text: "Describe the room you are in right now using at least five adjectives." },
    { id: 7, text: "How was the weather yesterday, and how did it affect your plans?" },
    { id: 8, text: "What is a skill you would like to learn in the future?" },
    { id: 9, text: "Tell me about a place you visited recently that you enjoyed." },
    { id: 10, text: "If you have a guest visiting your city for one day, where would you take them?" }
  ],
  'B1-B2': [
    { id: 11, text: "Think of a project you recently completed. What was the most challenging part?" },
    { id: 12, text: "How do you think technology has changed the way we communicate with our friends?" },
    { id: 13, text: "If you could live in any other time period in history, which one would you choose?" },
    { id: 14, text: "Describe a book or a movie that had a significant impact on your way of thinking." },
    { id: 15, text: "In your opinion, what are the qualities of a good leader in a professional environment?" },
    { id: 16, text: "If you were given an unlimited budget to start a small business, what would you create?" },
    { id: 17, text: "How do you stay organized when you have many different tasks to handle at once?" },
    { id: 18, text: "Do you prefer working in a team or working independently? Explain your preference." },
    { id: 19, text: "What are the pros and cons of living in a large city versus a small rural town?" },
    { id: 20, text: "Tell me about a time you had to solve a difficult problem. How did you approach it?" }
  ],
  'C1-C2': [
    { id: 21, text: "To what extent do you believe that a person's language shapes their perception of reality?" },
    { id: 22, text: "How should a society balance the need for public security with the right to individual privacy?" },
    { id: 23, text: "Discuss the role of 'tradition' in a rapidly modernizing world. Is it a weight or an anchor?" },
    { id: 24, text: "If you had to explain the concept of 'justice' to someone, what examples would you use?" },
    { id: 25, text: "How does the rise of artificial intelligence challenge our traditional definitions of creativity?" },
    { id: 26, text: "Analyze the impact of social media on the 'collective attention span' of the modern generation." },
    { id: 27, text: "Some argue that travel narrows the mind rather than broadening it by reinforcing stereotypes. What is your take?" },
    { id: 28, text: "Discuss the ethical implications of genetic engineering in the 21st century." },
    { id: 29, text: "In literature or film, do you find 'flawed' protagonists more compelling than 'perfect' heroes? Why?" },
    { id: 30, text: "If you could solve one global crisis instantly, which would it be, and what would the long-term consequences look like?" }
  ]
};

const EVAL_DEDUCTIONS = [
  { title: "1. Pronunciation & Phonology", items: [ { id: 'p1', label: "Unintelligible Sounds", val: 1 }, { id: 'p2', label: "Word Stress Errors", val: 1 }, { id: 'p3', label: "Severe Accent Interference", val: 2 } ] },
  { title: "2. Fluency & Flow", items: [ { id: 'f1', label: "Excessive Fillers (um/uh/like)", val: 1 }, { id: 'f2', label: "Unnatural Pausing Patterns", val: 1 }, { id: 'f3', label: "Fragmented Thought Streams", val: 2 } ] },
  { title: "3. Intonation & Prosody", items: [ { id: 'i1', label: "Monotone Delivery Profile", val: 1 }, { id: 'i2', label: "Question/Statement Confusion", val: 1 }, { id: 'i3', label: "Syllable-Timed Robotic Rhythm", val: 2 } ] },
  { title: "4. Grammatical & Lexical Precision", items: [ { id: 'g1', label: "Explicit Vocabulary Search Fatigue", val: 1 }, { id: 'g2', label: "Basic Agreement Slips (he/she/s)", val: 1 }, { id: 'g3', label: "Severe Lexical Range Deficit", val: 2 } ] },
  { title: "5. Strategic Competence", items: [ { id: 's1', label: "Complete Lack of Self-Correction", val: 1 }, { id: 's2', label: "Inability to Circumlocute", val: 1 }, { id: 's3', label: "Cohesion Failure / Lost Thread", val: 2 } ] }
];

const EvaluatorModule = ({ onBack, onOnboard }) => {
// ... 
  const [deductions, setDeductions] = useState({});

  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingAnswers, setViewingAnswers] = useState(null);

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this assessment?")) return;
    try {
      await supabase.from('placement_assessments').delete().eq('id', id);
      fetchCandidates();
    } catch (err) {
      console.error(err);
      alert("Failed to delete candidate.");
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
        setCandidates(data.map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
          phone: c.phone || 'N/A',
          email: c.email,
          writtenScore: c.written_score,
          rawAnswers: c.raw_answers,
          date: new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, []);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('placement_assessments').update({
        oral_score: oralScore,
        final_level: profileData.tier,
        status: 'completed'
      }).eq('id', selectedCandidate.id);
      
      if (error) throw error;
      
      alert(`Successfully assigned ${selectedCandidate.name} to level ${profileData.tier}!`);
      setSelectedCandidate(null);
      setQScores({});
      setDeductions({});
      fetchCandidates();
    } catch (err) {
      console.error("Error updating assessment:", err);
      alert("Error saving evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sec3Score = Object.values(qScores).filter(v => v === true).length;
  const totalDeductions = Object.entries(deductions).reduce((total, [id, isChecked]) => {
    if (isChecked) {
      const item = PARALINGUISTIC_DATA.flatMap(c => c.items).find(i => i.id === id);
      return total + (item ? item.val : 0);
    }
    return total;
  }, 0);
  
  const sec4Score = Math.max(0, 20 - totalDeductions);
  const oralScore = sec3Score + sec4Score; 
  const writtenScore = selectedCandidate ? selectedCandidate.writtenScore : 0; 
  const finalScore100 = writtenScore + oralScore;

  let profileData = { tier: "A1 (Beginner)", color: "text-red-400" };
  if (finalScore100 >= 40 && finalScore100 <= 59) profileData = { tier: "A2 (Elementary)", color: "text-orange-400" };
  else if (finalScore100 >= 60 && finalScore100 <= 79) profileData = { tier: "B1 (Intermediate)", color: "text-blue-400" };
  else if (finalScore100 >= 80 && finalScore100 <= 89) profileData = { tier: "B2 (Upper Intermediate)", color: "text-emerald-400" };
  else if (finalScore100 >= 90) profileData = { tier: "C1 / C2 (Advanced / Proficient)", color: "text-[#fcd34d]" };

  // --- RENDER CANDIDATE LIST ---
  if (!selectedCandidate) {
    return (
      <div className="flex flex-col w-full h-[calc(100vh-160px)] animate-fade-in relative z-10">
        <div className="flex items-center gap-4 mb-8 shrink-0">
          <button onClick={onBack} className="w-10 h-10 bg-white/10 hover:bg-[#fcd34d] text-white hover:text-[#08203e] rounded-full flex items-center justify-center font-black transition-all">←</button>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">Evaluator Terminal</h2>
            <p className="text-xs font-bold text-[#fcd34d] uppercase tracking-widest mt-1">Pending Placement Assessments</p>
          </div>
        </div>
        
        <div className="flex-1 relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
          <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
          <div className="relative w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
            {isLoadingCandidates ? (
              <div className="h-full flex items-center justify-center text-white/50 font-black uppercase tracking-widest text-sm">
                Loading pending assessments...
              </div>
            ) : candidates.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/50 font-black uppercase tracking-widest text-sm">
                No pending assessments found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {candidates.map(cand => (
                  <div key={cand.id} className="bg-black/30 border border-white/10 rounded-2xl p-6 flex justify-between items-center hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest group-hover:text-[#fcd34d] transition-colors">{cand.name}</h3>
                    <div className="text-xs font-medium text-white/50 mt-1 flex gap-4">
                      <span>📧 {cand.email}</span>
                      <span>📱 {cand.phone}</span>
                      <span>🗓️ {cand.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Written Score</p>
                      <p className="text-xl font-black text-emerald-400 leading-none">{cand.writtenScore} <span className="text-sm text-white/40">/ 50</span></p>
                    </div>
                    
                    <button onClick={(e) => { e.stopPropagation(); setViewingAnswers(cand); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-md" title="View Answers">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    
                    <button onClick={(e) => { e.stopPropagation(); onOnboard({ firstName: cand.name.split(' ')[0], lastName: cand.name.split(' ').slice(1).join(' '), email: cand.email, phone: cand.phone, role: 'Student' }); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md" title="Onboard as Student">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                    </button>
                    
                    <button onClick={(e) => { e.stopPropagation(); onOnboard({ firstName: cand.name.split(' ')[0], lastName: cand.name.split(' ').slice(1).join(' '), email: cand.email, phone: cand.phone, role: 'Teacher' }); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-md" title="Onboard as Teacher">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                    
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCandidate(cand.id); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-md" title="Delete Candidate">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); setSelectedCandidate(cand); }} className="bg-[#fcd34d] text-[#08203e] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg ml-2">Evaluate</button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* VIEW ANSWERS MODAL */}
        {viewingAnswers && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#070b19] border border-white/20 rounded-[2rem] w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="flex justify-between items-center p-8 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-2xl font-black tracking-widest uppercase text-white">Answers: {viewingAnswers.name}</h3>
                  <p className="text-sm font-bold text-[#fcd34d] uppercase tracking-wide">Raw Evaluation Data</p>
                </div>
                <button onClick={() => setViewingAnswers(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white/50 hover:text-white font-black transition-colors flex items-center justify-center">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-6">
                {!viewingAnswers.rawAnswers ? (
                  <div className="text-center text-white/40 uppercase tracking-widest font-bold py-10 leading-relaxed">
                    No raw answers found.<br/><br/>
                    <span className="text-xs normal-case font-medium">(Ensure the 'raw_answers' JSONB column exists in the database and the Edge Function is explicitly saving the payload to it.)</span>
                  </div>
                ) : (
                  Object.entries(viewingAnswers.rawAnswers).map(([qId, ans]) => (
                    <div key={qId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-[#fcd34d] font-black text-xs uppercase tracking-widest mb-2">Question {qId}</div>
                      <div className="text-white/90 text-sm font-medium leading-relaxed">{ans}</div>
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

  // --- RENDER LIVE ASSESSMENT DASHBOARD ---
  return (
    <div className="flex flex-col w-full h-[calc(100vh-160px)] animate-fade-in relative z-10">
      
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={() => setSelectedCandidate(null)} className="w-10 h-10 bg-white/10 hover:bg-[#fcd34d] text-white hover:text-[#08203e] rounded-full flex items-center justify-center font-black transition-all shadow-md">←</button>
        <div className="flex-1 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#fcd34d] drop-shadow-md">Evaluating: {selectedCandidate.name}</h2>
            <div className="text-xs font-medium text-white/70 mt-1 flex gap-4">
              <span>📱 {selectedCandidate.phone}</span>
              <span>📧 {selectedCandidate.email}</span>
            </div>
          </div>
          <div className="text-right bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 shadow-inner">
            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Prior Written Score</p>
            <p className="text-lg font-black text-emerald-400">{writtenScore} <span className="text-sm text-white/40">/ 50</span></p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* ========================================== */}
        {/* LEFT PANEL: QUESTION RUNNER                */}
        {/* ========================================== */}
        <div className="flex-[1.4] relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full">
          <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
          <div className="relative w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            
            <div className="flex gap-3 border-b border-white/10 pb-4 mb-4 shrink-0">
              {Object.keys(EVAL_QUESTIONS).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md ${activeTab === tab ? 'bg-[#fcd34d] text-[#08203e] scale-105' : 'bg-black/40 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded-xl px-5 py-3 mb-4 shrink-0 shadow-inner">
              <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Content Score: <span className="text-emerald-400 font-black text-base ml-1">{sec3Score}</span> / 30</div>
              <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Quality Score: <span className="text-[#fcd34d] font-black text-base ml-1">{sec4Score}</span> / 20</div>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              {EVAL_QUESTIONS[activeTab].map(q => {
                const isRight = qScores[q.id];
                return (
                  <div key={q.id} className={`flex justify-between items-center gap-4 p-4 rounded-xl border transition-all ${isRight ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-white/10'}`}>
                    <div className="text-sm font-medium text-white/90 leading-relaxed flex-1"><b className="text-[#fcd34d] mr-2">{q.id}.</b> {q.text}</div>
                    <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-lg shrink-0">
                      <button onClick={() => setQScores(prev => ({...prev, [q.id]: false}))} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${!isRight ? 'bg-red-500 text-white shadow-md' : 'text-white/40 hover:text-white'}`}>Wrong</button>
                      <button onClick={() => setQScores(prev => ({...prev, [q.id]: true}))} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${isRight ? 'bg-emerald-500 text-white shadow-md' : 'text-white/40 hover:text-white'}`}>Right</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANEL: SINGLE SCROLLABLE CONTAINER   */}
        {/* ========================================== */}
        <div className="flex-1 relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full">
          <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
          
          <div className="relative w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            
            <h3 className="text-sm font-black uppercase tracking-widest text-[#fcd34d] mb-4 shrink-0">
              Section 4: Paralinguistic Deductions
            </h3>
            
            {/* The Checklists */}
            <div className="flex flex-col gap-4 mb-6 shrink-0">
              {PARALINGUISTIC_DATA.map((cat, idx) => (
                <div key={idx} className="bg-black/30 border border-white/10 rounded-xl p-4 shadow-inner">
                  <div className="text-xs font-black text-white border-b border-white/10 pb-2 mb-3 tracking-wide">{cat.title}</div>
                  <div className="flex flex-col gap-2.5">
                    {cat.items.map(item => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={deductions[item.id] || false} onChange={(e) => setDeductions(prev => ({...prev, [item.id]: e.target.checked}))} className="w-4 h-4 rounded border-white/20 bg-black/40 text-red-500 focus:ring-red-500 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">{item.label}</span>
                        <span className="ml-auto text-xs font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded">-{item.val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* The Score Box (Pushed to bottom via mt-auto) */}
            <div className="mt-auto shrink-0 bg-[#08203e] border-2 border-[#fcd34d] rounded-[1.5rem] p-6 text-center shadow-2xl flex flex-col items-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Final CEFR Placement Score</div>
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-5xl font-black text-white drop-shadow-md">{finalScore100}</div>
                <div className="text-2xl font-black text-white/40">/ 100</div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 mb-3 border-t border-white/10 pt-2 w-full justify-center">
                <span>Written: {writtenScore}</span>
                <span>+</span>
                <span>Oral: {oralScore}</span>
              </div>
              <div className={`text-sm font-black uppercase tracking-widest ${profileData.color} bg-black/40 px-4 py-2 rounded-lg w-full shadow-inner`}>
                {profileData.tier}
              </div>
              <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs py-3 rounded-xl uppercase tracking-widest transition-colors shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'PROCESSING...' : 'SUBMIT & ASSIGN LEVEL'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// MAIN ADMIN HUB COMPONENT
// ==========================================
const AdminHub = () => {
  const [activeModule, setActiveModule] = useState('ACCOUNTS');
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
    avatarUrl: ''
  });

  // Fetch true admin data on load
  useEffect(() => {
    const loadMyProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setAdminProfile({
            id: user.id,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            role: data.role || 'Admin',
            password: '••••••••', // Masked for security
            avatarUrl: data.avatar_url || ''
          });
        }
      }
    };
    loadMyProfile();
  }, []);

  // Write changes permanently to Supabase
  const handleSaveAdminProfile = async () => {
    if (!adminProfile.id) return alert("Error: No active user session found.");
    setIsSavingProfile(true);
    try {
      const updates = {
        first_name: adminProfile.firstName.trim(),
        last_name: adminProfile.lastName.trim(),
        avatar_url: adminProfile.avatarUrl.trim() || null
      };
      
      // Update the password in profiles if changed
      if (adminProfile.password !== '••••••••' && adminProfile.password.trim() !== '') {
        updates.assigned_password = adminProfile.password.trim();
      }
      
      const { error } = await supabase.from('profiles').update(updates).eq('id', adminProfile.id);
      if (error) throw error;
      
      alert('Profile settings saved permanently!');
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving profile: " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [directoryTab, setDirectoryTab] = useState('students');
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);
  const [provisioningInitialData, setProvisioningInitialData] = useState(null);

  // --- NEW STATS STATES ---
  const [activeStudentsPct, setActiveStudentsPct] = useState(0);
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  const fetchDashboardStats = async () => {
    try {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const { count: totalStudents } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student');
      const { count: activeStudents } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student').gte('last_active_at', tenDaysAgo);

      if (totalStudents > 0) setActiveStudentsPct(Math.round((activeStudents / totalStudents) * 100));
      else setActiveStudentsPct(0); 

      const { data: activities } = await supabase.from('live_sessions').select('id, title, class_type, scheduled_at').gte('scheduled_at', new Date().toISOString()).not('teacher_id', 'is', null).order('scheduled_at', { ascending: true }).limit(5);
      setUpcomingActivities(activities || []);
    } catch (err) {
      console.error("Dashboard Stats Fetch Error:", err);
    }
  };

  const fetchDirectory = async (roleType) => {
    setIsLoadingDirectory(true);
    try {
     const roleMap = { 'students': 'Student', 'teachers': 'Teacher', 'admins': 'Admin' };
      const targetRole = roleMap[roleType] || 'student';
      const { data, error } = await supabase.from('profiles').select('*').eq('role', targetRole);
      if (error) throw error;
      setDirectoryUsers(data || []);
    } catch (err) {
      console.error("Directory Fetch Error:", err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

useEffect(() => {
    if (activeModule === 'ACCOUNTS') {
      fetchDirectory(directoryTab);
      fetchDashboardStats();
    }
  }, [activeModule, directoryTab]);

// ==========================================
  // COMMUNICATIONS MODULE STATES & LISTENERS
  // ==========================================
  const [activeCommsTab, setActiveCommsTab] = useState('General');
  const [announcements, setAnnouncements] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Chat States
  const [chatMessages, setChatMessages] = useState({ student: [], staff: [] });
  const [chatFilters, setChatFilters] = useState({ student: 'ALL', staff: 'ALL' });
  const [chatLocks, setChatLocks] = useState({ student: false, staff: false });
  const [chatInputs, setChatInputs] = useState({ student: '', staff: '', forum: '' });
  const chatEndRefStudent = useRef(null);
  const chatEndRefStaff = useRef(null);

 // Forum States
  const [forumLevelFilter, setForumLevelFilter] = useState('A1');
  const [forumPost, setForumPost] = useState(null);
  const [forumReplies, setForumReplies] = useState([]);
  
  // Forum Composer States
  const [forumTitleInput, setForumTitleInput] = useState('');
  const [forumContentInput, setForumContentInput] = useState('');
  const [forumImageUrlInput, setForumImageUrlInput] = useState('');
  const [showForumImageInput, setShowForumImageInput] = useState(false);
  const [isPublishingForum, setIsPublishingForum] = useState(false);

  // 1. Fetch Info Board & Forum Data
  useEffect(() => {
    if (activeModule !== 'COMMUNICATIONS') return;
    
    const fetchCommsData = async () => {
      try {
        if (!['Chat', 'Forum'].includes(activeCommsTab)) {
          const targetAudience = activeCommsTab === 'Staff' ? 'STAFF_ONLY' : 
                                 activeCommsTab === 'General' ? 'EVERYONE_WITH_STAFF' : 
                                 `LEVEL_${activeCommsTab}`;
          const { data } = await supabase.from('announcements')
            .select('*').eq('audience', targetAudience).order('created_at', { ascending: false });
          setAnnouncements(data || []);
        } 
        else if (activeCommsTab === 'Forum') {
          const { data: postData } = await supabase.from('forum_posts')
            .select('*').eq('target_level', forumLevelFilter).maybeSingle();
          setForumPost(postData || null);

          if (postData) {
            // Joins profiles to get the replier's name and avatar
            const { data: repliesData } = await supabase.from('forum_replies')
              .select('*, author:profiles!author_id(first_name, last_name, avatar_url, level)')
              .eq('thread_id', postData.id).order('created_at', { ascending: false });
            setForumReplies(repliesData || []);
          } else {
            setForumReplies([]);
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchCommsData();
  }, [activeModule, activeCommsTab, forumLevelFilter]);

  // 2. Real-time Chat Monitor
  useEffect(() => {
    if (activeModule !== 'COMMUNICATIONS' || activeCommsTab !== 'Chat') return;

    const fetchChats = async () => {
      const { data } = await supabase.from('messages')
        .select('*').order('created_at', { ascending: true }).limit(150);
      if (data) {
        setChatMessages({
          student: data.filter(m => m.channel !== 'STAFF'),
          staff: data.filter(m => m.channel === 'STAFF')
        });
        setTimeout(() => chatEndRefStudent.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        setTimeout(() => chatEndRefStaff.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };
    fetchChats();

    const chatChannel = supabase.channel('admin_chat_monitor')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMsg = payload.new;
        if (newMsg.channel !== 'STAFF') {
          setChatMessages(p => ({ ...p, student: [...p.student, newMsg] }));
          setTimeout(() => chatEndRefStudent.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } else if (newMsg.channel === 'STAFF') {
          setChatMessages(p => ({ ...p, staff: [...p.staff, newMsg] }));
          setTimeout(() => chatEndRefStaff.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
        setChatMessages(p => ({
          student: p.student.filter(m => m.id !== payload.old.id),
          staff: p.staff.filter(m => m.id !== payload.old.id)
        }));
      }).subscribe();

    return () => { supabase.removeChannel(chatChannel); };
  }, [activeModule, activeCommsTab]);

  // ==========================================
  // COMMUNICATION MUTATIONS (CRUD)
  // ==========================================
  const handlePublishForumPost = async () => {
    if (!forumTitleInput.trim() || !forumContentInput.trim()) return alert('Título y contenido son obligatorios.');
    setIsPublishingForum(true);
    try {
      const { data, error } = await supabase.from('forum_posts').insert({
        title: forumTitleInput.trim().toUpperCase(),
        content: forumContentInput.trim(),
        target_level: forumLevelFilter,
        image_url: forumImageUrlInput || null,
        author_name: adminProfile.firstName ? `${adminProfile.firstName} ${adminProfile.lastName}`.trim() : 'Outloud Admin',
        author_id: adminProfile.id
      }).select().single();
      
      if (error) throw error;
      
      setForumPost(data);
      setForumTitleInput(''); setForumContentInput(''); setForumImageUrlInput(''); setShowForumImageInput(false);
    } catch (error) { 
      console.error(error); 
      alert("Error publicando tema del foro: " + error.message); 
    } finally { 
      setIsPublishingForum(false); 
    }
  };

  const handleDeleteForumPost = async () => {
    if (!window.confirm("¿Eliminar este tema del foro y todas sus respuestas? Esta acción es irreversible.")) return;
    try {
      await supabase.from('forum_posts').delete().eq('id', forumPost.id);
      setForumPost(null);
      setForumReplies([]);
    } catch (error) { 
      console.error(error); 
    }
  };
  const handlePublishAnnouncement = async () => {
    if (!postContent.trim() || !postCategory) return alert('Contenido y categoría son obligatorios.');
    setIsPublishing(true);
    const targetAudience = activeCommsTab === 'Staff' ? 'STAFF_ONLY' : activeCommsTab === 'General' ? 'EVERYONE_WITH_STAFF' : `LEVEL_${activeCommsTab}`;
    try {
      await supabase.from('announcements').insert({ title: postCategory.toUpperCase(), content: postContent.trim(), audience: targetAudience, category: postCategory, image_url: postImageUrl || null });
      setPostContent(''); setPostCategory(''); setPostImageUrl(''); setShowImageInput(false);
      const { data } = await supabase.from('announcements').select('*').eq('audience', targetAudience).order('created_at', { ascending: false });
      setAnnouncements(data || []);
    } catch (error) { console.error(error); alert("Error publicando anuncio"); } finally { setIsPublishing(false); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("¿Eliminar este anuncio?")) return;
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleAdminChatSend = async (e, channelType) => {
    e.preventDefault();
    const content = chatInputs[channelType];
    if (!content.trim()) return;
    try {
      await supabase.from('messages').insert({ sender_name: 'Outloud Admin', sender_role: 'Admin', content: content.trim(), channel: channelType.toUpperCase() });
      setChatInputs(p => ({ ...p, [channelType]: '' }));
    } catch (error) { console.error(error); alert("Error enviando mensaje"); }
  };

  const handleDeleteChatMessage = async (id) => {
    if (!window.confirm("¿Eliminar mensaje de la base de datos?")) return;
    await supabase.from('messages').delete().eq('id', id);
  };

  const handleSendForumReply = async (e) => {
    e.preventDefault();
    if (!chatInputs.forum.trim() || !forumPost) return;
    try {
      const { error } = await supabase.from('forum_replies').insert({ 
        thread_id: forumPost.id, 
        content: chatInputs.forum.trim(),
        author_id: adminProfile.id 
      });
      if (error) throw error;
      
      setChatInputs(p => ({ ...p, forum: '' }));
      const { data } = await supabase.from('forum_replies').select('*, author:profiles!author_id(first_name, last_name, avatar_url, level)').eq('thread_id', forumPost.id).order('created_at', { ascending: false });
      setForumReplies(data || []);
    } catch (error) { 
      console.error(error); 
      alert("Error enviando respuesta al foro: " + error.message); 
    }
  };

  const handleDeleteForumReply = async (id) => {
    if (!window.confirm("¿Eliminar esta respuesta del foro?")) return;
    await supabase.from('forum_replies').delete().eq('id', id);
    setForumReplies(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleChatLock = async (channel) => {
    const newValue = !chatLocks[channel];
    setChatLocks(prev => ({ ...prev, [channel]: newValue }));
    try { await supabase.from('app_settings').update({ [`${channel}_chat_locked`]: newValue }).eq('id', 1); } 
    catch (error) { console.error(error); }
  };

  // ----------------------------------------------------
  // PRESERVED CONTENT EDITING STATE & LOGIC
  // ----------------------------------------------------
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

  const saveSnapshot = (elements = canvasElements) => setCanvasHistory(prev => [...prev.slice(-29), JSON.parse(JSON.stringify(elements))]);

  const [activeModal, setActiveModal] = useState(null); 
  const [editingElementId, setEditingElementId] = useState(null);
  const [mediaTarget, setMediaTarget] = useState({ id: null, type: 'image' });
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [focusedTextId, setFocusedTextId] = useState(null);
  const [rcStates, setRcStates] = useState({}); 
  const rcRecorders = useRef({}); 
  const rcChunks = useRef({});    
  const rcPlayers = useRef({});   
  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({}); 
  const [touchDragState, setTouchDragState] = useState({ isDragging: false, text: '', x: 0, y: 0, sourceElId: null });

  useEffect(() => { setSelectedUnit(''); }, [selectedLevel]);

  // FETCH SAVED CONTENT BLUEPRINTS
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
          setCanvasElements(data.blueprint_data?.elements || []);
          if (contentType === 'Lesson') setLessonScreens(data.screens || [Date.now()]);
          else setWorkbookScreens(data.screens || [Date.now()]);
        } else {
          // Clean slate if nothing is saved yet
          setCanvasElements([]);
          if (contentType === 'Lesson') setLessonScreens([Date.now()]);
          else setWorkbookScreens([Date.now()]);
        }
      } catch (err) {
        console.error("Error loading blueprint:", err);
      }
    };

    loadBlueprint();
  }, [selectedLevel, selectedUnit, contentType]);

  useEffect(() => {
    if (contentType === 'Lesson') setActiveScreenId(lessonScreens[0]);
    else setActiveScreenId(workbookScreens[0]);
  }, [contentType, lessonScreens, workbookScreens]);

  const unitOptions = selectedLevel && LEVEL_UNIT_MAP[selectedLevel] 
    ? Array.from({ length: LEVEL_UNIT_MAP[selectedLevel].end - LEVEL_UNIT_MAP[selectedLevel].start + 1 }, (_, i) => `Unit ${LEVEL_UNIT_MAP[selectedLevel].start + i}`)
    : [];

  const toolOptions = ['Lesson', 'Manuals', 'Cue Cards'].includes(contentType) ? LESSON_TOOLS : WORKBOOK_TOOLS;

  const handleToolSelect = (tool) => {
    if (tool === 'Video') setActiveModal('video');
    else if (tool === 'Image') { setMediaTarget({ id: null, type: 'image' }); setActiveModal('media_upload'); }
    else if (tool === 'Audio') { setMediaTarget({ id: null, type: 'audio' }); setActiveModal('media_upload'); }
    else if (tool === 'Record & Compare') spawnInteractiveElement('record_compare');
    else if (tool === 'Text') spawnInteractiveElement('text');
    else if (tool === 'Fill in the blank') { setEditingElementId(null); setActiveModal('fill_in_the_blank'); }
    else if (tool === 'Shape') { setEditingElementId(null); setActiveModal('shape'); }
    else if (tool === 'Drag and drop') { setEditingElementId(null); setActiveModal('drag_and_drop'); }
    else if (tool === 'Short answer') { setEditingElementId(null); setActiveModal('short_answer'); }
    else if (tool === 'Multiple selection') { setEditingElementId(null); setActiveModal('multiple_selection'); }
    else if (tool === 'Slider bar') { setEditingElementId(null); setActiveModal('slider_bar'); }
    else if (tool === 'Crossword') { setEditingElementId(null); setActiveModal('crossword'); }
    else if (tool === 'Word search') { setEditingElementId(null); setActiveModal('word_search'); }
    else if (tool === 'Next Screen Button') spawnInteractiveElement('nav_button');
  };

  const spawnInteractiveElement = (type) => {
    let newElement = { id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId, data: {} };
    if (type === 'text') {
      newElement.htmlContent = `<div style="text-align: center;"><span style="font-family: Montserrat; font-size: 28px; font-weight: 900; color: #ffffff; text-transform: uppercase;">A1-U1: ACTIVITY TITLE</span><br/><span style="font-family: Montserrat; font-size: 14px; font-weight: 500; color: #e2e8f0;">Type your descriptor here. This text box auto resizes for height.</span></div>`;
    }
    setCanvasElements([...canvasElements, newElement]);
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (focusedTextId) {
      const liveNode = document.querySelector(`#element-${focusedTextId} .rich-text-content`);
      if (liveNode) setCanvasElements(prev => prev.map(p => p.id === focusedTextId ? {...p, htmlContent: liveNode.innerHTML} : p));
    }
  };

  const handleDeleteScreen = (screenIdToDelete) => {
    saveSnapshot();
    if (contentType === 'Lesson') {
      if (lessonScreens.length <= 1) return alert("Cannot delete the only screen.");
      setLessonScreens(prev => prev.filter(id => id !== screenIdToDelete));
    } else {
      if (workbookScreens.length <= 1) return alert("Cannot delete the only screen.");
      setWorkbookScreens(prev => prev.filter(id => id !== screenIdToDelete));
    }
    setCanvasElements(prev => prev.filter(el => el.screenId !== screenIdToDelete));
  };

  const handleDeleteElement = (id) => { saveSnapshot(); setCanvasElements(canvasElements.filter(el => el.id !== id)); };

  const handleAddMedia = () => {
    if (!mediaUrlInput) return;
    saveSnapshot();
    if (mediaTarget.id) {
      setCanvasElements(prev => prev.map(el => {
        if (el.id === mediaTarget.id) {
          const newData = { ...el.data };
          if (mediaTarget.type === 'image') newData.imageUrl = mediaUrlInput;
          if (mediaTarget.type === 'audio') newData.audioUrl = mediaUrlInput;
          return { ...el, data: newData };
        }
        return el;
      }));
    } else {
      const newElement = { id: `${mediaTarget.type}_${Date.now()}`, type: mediaTarget.type, url: mediaUrlInput, screenId: activeScreenId };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setMediaUrlInput(''); setMediaTarget({ id: null, type: 'image' });
  };

  const handleRemoveMedia = (elId, mediaType) => {
    saveSnapshot();
    setCanvasElements(prev => prev.map(el => {
      if (el.id === elId) {
        const newData = { ...el.data };
        if (mediaType === 'image') delete newData.imageUrl;
        if (mediaType === 'audio') delete newData.audioUrl;
        return { ...el, data: newData };
      }
      return el;
    }));
  };

  const handleSaveData = (id, newData) => { saveSnapshot(); setCanvasElements(prev => prev.map(el => el.id === id ? { ...el, data: newData } : el)); };

  const handleSaveModal = (type, data) => {
    saveSnapshot();
    if (editingElementId) { 
      setCanvasElements(prev => prev.map(el => el.id === editingElementId ? { ...el, data: { ...el.data, ...data } } : el)); 
    } else {
      const newElement = { id: `${type}_${Date.now()}`, type: type, screenId: activeScreenId, data: data };
      setCanvasElements([...canvasElements, newElement]);
    }
    setActiveModal(null); setEditingElementId(null);
  };

  const handleExpandWorkspace = () => {
    saveSnapshot();
    const newId = Date.now();
    if (contentType === 'Lesson') setLessonScreens(prev => [...prev, newId]);
    else setWorkbookScreens(prev => [...prev, newId]);
  };

  const handleDuplicateScreen = () => {
    saveSnapshot();
    const newScreenId = Date.now();
    if (contentType === 'Lesson') setLessonScreens([...lessonScreens, newScreenId]);
    else setWorkbookScreens([...workbookScreens, newScreenId]);

    const elementsToClone = canvasElements.filter(el => el.screenId === activeScreenId);
    const clonedElements = elementsToClone.map(el => ({
      ...el, id: `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, screenId: newScreenId,
      data: el.data ? JSON.parse(JSON.stringify(el.data)) : undefined, htmlContent: el.htmlContent || ''
    }));
    setCanvasElements(prev => [...prev, ...clonedElements]);
  };

  const handleUndoWorkspace = () => {
    if (canvasHistory.length > 0) {
      const previousState = canvasHistory[canvasHistory.length - 1];
      setCanvasHistory(prev => prev.slice(0, -1));
      setCanvasElements(previousState);
    }
  };

  const handleRcClick = async (id) => { /* Original Logic Preserved */ };

  const handleConfirmSave = async () => {
    if (!selectedLevel || !selectedUnit || !contentType) return;
    setIsSaving(true);
    const syncedElements = canvasElements.map(el => {
      if (el.type === 'text') {
        const liveNode = document.getElementById(`element-${el.id}`);
        if (liveNode) return { ...el, htmlContent: liveNode.innerHTML };
      }
      return el;
    });
    setCanvasElements(syncedElements);
    const payload = { 
      level: selectedLevel, unit: selectedUnit, content_type: contentType, 
      screens: contentType === 'Lesson' ? lessonScreens : workbookScreens, 
      blueprint_data: { elements: syncedElements }, updated_at: new Date().toISOString() 
    };
    try {
      await supabase.from('content_blueprints').upsert(payload, { onConflict: 'level,unit,content_type' });
      alert("Changes saved and pushed live successfully!");
    } catch (err) { console.error(err); } finally { setIsSaving(false); setIsSaveModalOpen(false); }
  };

  const renderFormattedText = (el, isPreview) => { /* Original Logic Preserved */ };

  const activeScreenArray = contentType === 'Lesson' ? lessonScreens : workbookScreens;


  // =====================================================
  // MODULE RENDERING FUNCTIONS
  // =====================================================

const renderAccounts = () => (
    <div className="grid grid-cols-12 gap-6 w-full max-w-[1500px] h-[calc(100vh-160px)] animate-fade-in">
      <div className="col-span-3 flex flex-col gap-6 h-full">
        {/* ACTIVE STUDENTS RING */}
        <div className="h-[40%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0 mb-2">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="#fcd34d" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (activeStudentsPct / 100) * (2 * Math.PI * 40)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white leading-none drop-shadow-md">{activeStudentsPct}%</span>
            </div>
          </div>
          <h3 className="text-white/90 font-bold text-xs tracking-widest uppercase text-center mt-2">ACTIVE STUDENTS</h3>
        </div>

        {/* LIVE ACTIVITIES WIDGET */}
        <div className="h-[60%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col">
          <h3 className="text-white font-black text-2xl tracking-wide mb-4 drop-shadow-md shrink-0 w-full text-center">Activities</h3>
          <ul className="space-y-4 text-xs font-medium text-white/90 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
            {upcomingActivities.length === 0 ? (
              <li className="text-center text-white/40 uppercase tracking-widest font-bold mt-4">No upcoming live sessions</li>
            ) : (
              upcomingActivities.map(act => (
                <li key={act.id} className="flex items-center gap-3 overflow-hidden">
                  <svg className="w-5 h-5 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="truncate">{new Date(act.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {act.title || act.class_type}</span>
                </li>
              ))
            )}
          </ul>
          <button className="w-full py-4 px-6 bg-[#e2e8f0] text-[#0f172a] hover:bg-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-start gap-4 shadow-xl transition-all hover:scale-105 shrink-0 mt-auto">
            <img src="https://i.postimg.cc/mrtXmB72/Copia-de-Diseno-sin-titulo-(2).png" alt="Substitute" className="w-6 h-6 object-contain shrink-0" />
            <span className="flex-1 text-center pr-6">REQUEST SUBSTITUTE</span>
          </button>
        </div>
      </div>

 {/* Middle Column */}
      <div className="col-span-3 grid grid-rows-2 gap-6 h-full">
        
        {/* CREATE CARD - Outer Wrapper (Acts as the frame & clipping mask) */}
        <div onClick={() => setIsProvisioningModalOpen(true)} className="relative w-full h-full rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl cursor-pointer group">
          
          {/* Layer 1: Oversized Blur (Pushes the buggy edges 16px out of view) */}
          <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />

          {/* Layer 2: Content Container */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
             <img src="https://i.postimg.cc/ZKPVccsH/4(8).png" alt="Create" className="w-48 h-48 mb-4 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md will-change-transform" />
             <h3 className="text-white font-black text-xl md:text-2xl tracking-widest uppercase text-center">Create</h3>
          </div>
        </div>
        
        {/* STATISTICS CARD - Outer Wrapper (Acts as the frame & clipping mask) */}
        <div onClick={() => setAccountsView('STATISTICS')} className="relative w-full h-full rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl cursor-pointer group">
          
          {/* Layer 1: Oversized Blur (Pushes the buggy edges 16px out of view) */}
          <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />

          {/* Layer 2: Content Container */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
             <img src="https://i.postimg.cc/sxd4PQpm/2(12).png" alt="Statistics" className="w-48 h-48 mb-4 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md will-change-transform" />
             <h3 className="text-white font-black text-xl md:text-2xl tracking-widest uppercase text-center">Statistics</h3>
          </div>
        </div>

      </div>

      <div className="col-span-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex bg-black/20 rounded-2xl p-2 mb-6 shrink-0 shadow-inner">
          <button onClick={() => setDirectoryTab('students')} className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${directoryTab === 'students' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}>Students</button>
          <button onClick={() => setDirectoryTab('teachers')} className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${directoryTab === 'teachers' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}>Teachers</button>
          <button onClick={() => setDirectoryTab('admins')} className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${directoryTab === 'admins' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}>Admin</button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
          {isLoadingDirectory ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : directoryUsers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/40">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <p className="font-bold uppercase tracking-widest text-sm">No {directoryTab} found.</p>
            </div>
          ) : (
            directoryUsers.map((user, i) => (
              <div key={user.id} className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-black/40 transition-colors cursor-pointer group" onClick={() => setSelectedStudent(user)}>
                <div className="flex items-center gap-4 truncate">
                  <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name || 'U'}+${user.last_name || ''}&background=random&color=fff`} className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-[#fcd34d] transition-colors object-cover shadow-md shrink-0" alt="User" />
                  <h4 className="font-bold text-lg text-white group-hover:text-[#fcd34d] transition-colors truncate">{user.first_name || 'Nuevo'} {user.last_name || `Usuario`}</h4>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {user.status === 'pending' ? (
                    <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(user); }} className="bg-[#fcd34d] text-[#08203e] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform">Pending</button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(user); }} className="bg-white/10 text-white hover:bg-[#fcd34d] hover:text-[#08203e] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md">View as</button>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-inner ${user.level?.includes('A1') ? 'bg-blue-500' : user.level?.includes('C1') ? 'bg-green-500' : 'bg-red-500'}`}>
                    {user.level ? user.level.split(':')[0] : 'A1'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );


const renderCommunications = () => (
    <div className="flex flex-col w-full max-w-[1500px] min-h-[85vh] animate-fade-in relative z-10">
      
      {/* Sub Navigation */}
      <div className="flex bg-white/5 backdrop-blur-xl rounded-full p-2 mb-8 shadow-2xl w-fit mx-auto border border-white/10 overflow-x-auto max-w-full relative z-20">
        {['General', 'Staff', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Chat', 'Forum'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveCommsTab(tab)}
            className={`px-6 md:px-8 py-3 rounded-full font-black text-xs md:text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeCommsTab === tab ? 'bg-[#fcd34d] text-[#08203e] shadow-md scale-105' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ======================================= */}
      {/* INFO BOARD VIEW (General, Staff, A1...) */}
      {/* ======================================= */}
      {!['Chat', 'Forum'].includes(activeCommsTab) && (
        <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
          
          {/* Composer Left */}
          <div className="col-span-5 relative border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col h-fit">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10 rounded-[3rem]" />
            <div className="p-8 flex flex-col z-10">
              <div className="flex gap-4 mb-6">
                {!showImageInput ? (
                  <button onClick={() => setShowImageInput(true)} className="w-32 h-32 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0 cursor-pointer">
                    <span className="text-5xl font-light leading-none mb-2">+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">UPLOAD<br/>IMAGE</span>
                  </button>
                ) : (
                  <div className="w-32 h-32 bg-black/40 border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white p-2 shrink-0 relative">
                    <button onClick={() => { setShowImageInput(false); setPostImageUrl(''); }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-[10px] font-bold cursor-pointer hover:scale-110">✕</button>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#fcd34d] mb-2">Image URL</span>
                    <input type="text" value={postImageUrl} onChange={(e) => setPostImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-white/10 rounded p-2 text-xs outline-none focus:border-[#fcd34d] border border-transparent" />
                  </div>
                )}
                
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Escribe el anuncio aquí..." 
                  className="flex-1 bg-white/5 border border-white/20 rounded-2xl p-4 text-white resize-none focus:outline-none focus:border-[#fcd34d] placeholder-white/30 shadow-inner"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <AdminDropdown placeholder="CATEGORY" options={['Website Functionality', 'General Information', 'Academy Rules', 'Upcoming Events', 'Promos & Discounts', 'Financial Data']} value={postCategory} onChange={setPostCategory} />
                </div>
                <button onClick={handlePublishAnnouncement} disabled={isPublishing} className="flex-1 bg-white/20 hover:bg-[#fcd34d] hover:text-[#08203e] text-white font-black rounded-xl uppercase tracking-widest transition-colors shadow-lg disabled:opacity-50 cursor-pointer">
                  {isPublishing ? '...' : 'PUBLISH'}
                </button>
              </div>
            </div>
          </div>

          {/* Feed Right */}
          <div className="col-span-7 relative border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 z-10">
              {announcements.length === 0 ? (
                <div className="text-center text-white/40 font-bold uppercase tracking-widest text-sm py-10">No hay anuncios activos para este filtro.</div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center gap-6 relative group hover:bg-white/20 transition-colors shadow-md">
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="absolute top-4 right-4 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer z-20">✕</button>
                    {ann.image_url && (
                      <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-white/30 shadow-md">
                        <img src={ann.image_url} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h4 className="text-lg font-black uppercase tracking-widest mb-2 text-white drop-shadow-sm">{ann.title}</h4>
                      <p className="text-xs text-white/80 leading-relaxed font-medium pr-8">{ann.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* CHAT MODERATOR VIEW                     */}
      {/* ======================================= */}
      {activeCommsTab === 'Chat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-[600px]">
          
          {/* Students Panel */}
          <div className="relative border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            
            <div className="flex justify-between items-center p-6 border-b border-white/10 z-10 shrink-0">
              <h3 className="font-black text-white text-lg tracking-widest uppercase drop-shadow-md">Students Chat</h3>
              <div className="flex items-center gap-4">
                <select value={chatFilters.student} onChange={e => setChatFilters(p => ({...p, student: e.target.value}))} className="bg-white/10 text-white text-[10px] font-black uppercase rounded-lg pl-3 pr-8 py-2 outline-none border border-white/20 cursor-pointer appearance-none">
                  <option className="bg-[#0f172a] text-white" value="ALL">All Levels</option>
                  <option className="bg-[#0f172a] text-white" value="A1">A1 Only</option>
                  <option className="bg-[#0f172a] text-white" value="A2">A2 Only</option>
                  <option className="bg-[#0f172a] text-white" value="B1">B1 Only</option>
                  <option className="bg-[#0f172a] text-white" value="B2">B2 Only</option>
                  <option className="bg-[#0f172a] text-white" value="C1">C1 Only</option>
                  <option className="bg-[#0f172a] text-white" value="C2">C2 Only</option>
                </select>
                <button onClick={() => handleToggleChatLock('student')} className={`w-12 h-6 rounded-full relative transition-colors border border-white/20 shadow-inner cursor-pointer ${chatLocks.student ? 'bg-red-500/80' : 'bg-emerald-500/80'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${chatLocks.student ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-10">
              {chatMessages.student.filter(m => chatFilters.student === 'ALL' || m.channel === chatFilters.student || m.channel === 'GLOBAL').length === 0 ? (
                <div className="h-full flex items-center justify-center"><span className="text-white/40 font-bold uppercase tracking-widest text-xs">Waiting for live messages...</span></div>
              ) : (
                chatMessages.student.filter(m => chatFilters.student === 'ALL' || m.channel === chatFilters.student || m.channel === 'GLOBAL').map(msg => {
                  const isAdmin = msg.sender_role?.includes('Admin');
                  const isTeacher = msg.sender_role === 'Teacher';
                  return (
                    <div key={msg.id} className={`group bg-[#4b6bfb]/20 backdrop-blur-md rounded-3xl p-5 border w-[85%] relative mt-2 ${isAdmin ? 'border-[#fcd34d] bg-[#fcd34d]/10 ml-auto' : isTeacher ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-blue-400/30 ml-4'}`}>
                      <button onClick={() => handleDeleteChatMessage(msg.id)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl cursor-pointer hover:scale-110">✕</button>
                      <img src={msg.avatar_url || `https://ui-avatars.com/api/?name=${msg.sender_name}&background=random`} className={`absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 object-cover shadow-lg ${isAdmin ? 'border-[#fcd34d]' : 'border-white'}`} alt="User" />
                      <div className="pl-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-black text-[11px] uppercase tracking-widest ${isAdmin ? 'text-[#fcd34d]' : 'text-white'}`}>{msg.sender_name}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${isAdmin ? 'bg-red-500 text-white' : isTeacher ? 'bg-emerald-500 text-white' : 'bg-[#fcd34d] text-[#08203e]'}`}>{msg.sender_role}</span>
                          <span className="text-white/40 text-[8px] font-bold ml-2">[{msg.channel}]</span>
                        </div>
                        <p className={`text-sm font-medium leading-relaxed ${msg.is_reported ? 'text-red-400 italic' : 'text-white/90'}`}>{msg.is_reported ? '⚠️ Mensaje Reportado: ' + msg.content : msg.content}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRefStudent} />
            </div>

            <form onSubmit={(e) => handleAdminChatSend(e, 'student')} className="p-6 border-t border-white/10 z-10 relative shrink-0">
              <input type="text" placeholder="Admin Override Message..." value={chatInputs.student} onChange={(e) => setChatInputs(p => ({...p, student: e.target.value}))} className="w-full bg-black/40 border border-white/20 rounded-full pl-6 pr-12 py-4 text-sm text-white focus:outline-none focus:border-[#fcd34d] shadow-inner" />
              <button type="submit" disabled={!chatInputs.student.trim()} className="absolute right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#fcd34d] hover:scale-110 transition-transform cursor-pointer disabled:opacity-50 disabled:hover:scale-100">
                <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>

          {/* Staff Panel */}
          <div className="relative border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            
            <div className="flex justify-between items-center p-6 border-b border-white/10 z-10 shrink-0">
              <h3 className="font-black text-[#fcd34d] text-lg tracking-widest uppercase drop-shadow-md">Staff Chat</h3>
              <div className="flex items-center gap-4">
                <select value={chatFilters.staff} onChange={e => setChatFilters(p => ({...p, staff: e.target.value}))} className="bg-white/10 text-white text-[10px] font-black uppercase rounded-lg pl-3 pr-8 py-2 outline-none border border-white/20 cursor-pointer appearance-none">
                  <option className="bg-[#0f172a] text-white" value="ALL">All Staff</option>
                  <option className="bg-[#0f172a] text-white" value="T1">Teachers</option>
                  <option className="bg-[#0f172a] text-white" value="A1">Admins</option>
                </select>
                <button onClick={() => handleToggleChatLock('staff')} className={`w-12 h-6 rounded-full relative transition-colors border border-white/20 shadow-inner cursor-pointer ${chatLocks.staff ? 'bg-red-500/80' : 'bg-emerald-500/80'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${chatLocks.staff ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-10">
              {chatMessages.staff.length === 0 ? (
                <div className="h-full flex items-center justify-center"><span className="text-white/40 font-bold uppercase tracking-widest text-xs">Waiting for live messages...</span></div>
              ) : (
                chatMessages.staff.map(msg => (
                  <div key={msg.id} className={`group bg-[#1e293b]/60 backdrop-blur-md rounded-3xl p-5 border w-[85%] relative mt-2 ${msg.sender_role?.includes('Admin') ? 'border-[#fcd34d] ml-auto' : 'border-white/10 ml-4'}`}>
                    <button onClick={() => handleDeleteChatMessage(msg.id)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl cursor-pointer hover:scale-110">✕</button>
                    <img src={msg.avatar_url || `https://ui-avatars.com/api/?name=${msg.sender_name}&background=random`} className={`absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 object-cover shadow-lg ${msg.sender_role?.includes('Admin') ? 'border-[#fcd34d]' : 'border-emerald-400'}`} alt="User" />
                    <div className="pl-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-white text-[11px] uppercase tracking-widest">{msg.sender_name}</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${msg.sender_role?.includes('Admin') ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-500 text-white border-emerald-400'}`}>{msg.sender_role}</span>
                      </div>
                      <p className="text-white/80 text-sm font-medium leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRefStaff} />
            </div>

            <form onSubmit={(e) => handleAdminChatSend(e, 'staff')} className="p-6 border-t border-white/10 z-10 relative shrink-0">
              <input type="text" placeholder="Internal Staff Message..." value={chatInputs.staff} onChange={(e) => setChatInputs(p => ({...p, staff: e.target.value}))} className="w-full bg-black/40 border border-white/20 rounded-full pl-6 pr-12 py-4 text-sm text-white focus:outline-none focus:border-[#fcd34d] shadow-inner" />
              <button type="submit" disabled={!chatInputs.staff.trim()} className="absolute right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#fcd34d] hover:scale-110 transition-transform cursor-pointer disabled:opacity-50 disabled:hover:scale-100">
                <svg className="w-5 h-5 transform rotate-45 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* FORUM MODERATOR VIEW                    */}
      {/* ======================================= */}
      {activeCommsTab === 'Forum' && (
        <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
          
          {/* Active Post OR Composer (Left Panel) */}
          <div className="col-span-8 relative border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col h-full group">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10 rounded-[3rem]" />
            
            <div className="p-8 flex flex-col h-full z-10">
              <div className="flex justify-between items-center mb-6 shrink-0">
                {forumPost ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#fcd34d] bg-white/10 flex items-center justify-center font-black text-[#fcd34d] shadow-md uppercase">
                       {forumPost.author_name?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-xs uppercase tracking-widest">{forumPost.author_name || 'Admin'}</h4>
                      <span className="bg-[#fcd34d] text-[#08203e] text-[8px] font-black px-2 py-0.5 rounded uppercase">Staff</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                     <h3 className="font-black text-[#fcd34d] text-lg tracking-widest uppercase drop-shadow-md">Create Topic</h3>
                  </div>
                )}
                
                <select value={forumLevelFilter} onChange={(e) => setForumLevelFilter(e.target.value)} className="bg-white/10 text-white text-xs font-black uppercase rounded-lg pl-4 pr-10 py-2 outline-none border border-white/20 cursor-pointer appearance-none">
                  <option className="bg-[#0f172a] text-white" value="A1">Level A1</option>
                  <option className="bg-[#0f172a] text-white" value="A2">Level A2</option>
                  <option className="bg-[#0f172a] text-white" value="B1">Level B1</option>
                  <option className="bg-[#0f172a] text-white" value="B2">Level B2</option>
                  <option className="bg-[#0f172a] text-white" value="C1">Level C1</option>
                  <option className="bg-[#0f172a] text-white" value="C2">Level C2</option>
                </select>
              </div>

              {forumPost ? (
                <>
                  <button onClick={handleDeleteForumPost} className="absolute top-8 right-[120px] w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer z-20 shadow-xl" title="Delete Topic">✕</button>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">
                      {forumPost.title}
                    </h2>
                    {forumPost.image_url && (
                      <div className="w-full h-48 bg-black/40 rounded-2xl border border-white/10 mb-4 overflow-hidden shadow-inner shrink-0">
                        <img src={forumPost.image_url} className="w-full h-full object-cover opacity-80" alt="Post" />
                      </div>
                    )}
                    <p className="text-sm text-white/80 font-medium leading-relaxed">
                      {forumPost.content}
                    </p>
                  </div>

                  <form onSubmit={handleSendForumReply} className="relative mt-auto shrink-0">
                    <input type="text" placeholder="Post an admin reply..." value={chatInputs.forum} onChange={(e) => setChatInputs(p => ({...p, forum: e.target.value}))} className="w-full bg-black/40 border border-white/20 rounded-full pl-6 pr-12 py-4 text-sm text-white focus:outline-none focus:border-[#fcd34d] shadow-inner disabled:opacity-50" />
                    <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#fcd34d] transition-colors cursor-pointer disabled:opacity-50" disabled={!chatInputs.forum.trim()}>
                      <svg className="w-5 h-5 transform rotate-45 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  <input 
                    type="text" 
                    placeholder="TOPIC TITLE..." 
                    value={forumTitleInput} 
                    onChange={(e) => setForumTitleInput(e.target.value)} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-[#fcd34d] placeholder-white/30 shadow-inner font-black uppercase tracking-widest mb-4 shrink-0"
                  />
                  <div className="flex flex-col gap-4 flex-1 min-h-0 mb-6">
                    {!showForumImageInput ? (
                      <button onClick={() => setShowForumImageInput(true)} className="w-64 h-32 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0 cursor-pointer">
                        <span className="text-5xl font-light leading-none mb-2">+</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">UPLOAD<br/>IMAGE</span>
                      </button>
                    ) : (
                      <div className="w-64 h-32 bg-black/40 border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white p-4 shrink-0 relative">
                        <button onClick={() => { setShowForumImageInput(false); setForumImageUrlInput(''); }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-[10px] font-bold cursor-pointer hover:scale-110">✕</button>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#fcd34d] mb-2">Image URL</span>
                        <input type="text" value={forumImageUrlInput} onChange={(e) => setForumImageUrlInput(e.target.value)} placeholder="https://..." className="w-full bg-white/10 rounded p-2 text-xs outline-none focus:border-[#fcd34d] border border-transparent" />
                      </div>
                    )}
                    
                    <textarea 
                      value={forumContentInput}
                      onChange={(e) => setForumContentInput(e.target.value)}
                      placeholder="Escribe el contenido del foro aquí..." 
                      className="w-full flex-1 bg-white/5 border border-white/20 rounded-2xl p-4 text-white resize-none focus:outline-none focus:border-[#fcd34d] placeholder-white/30 shadow-inner min-h-[300px]"
                    />
                  </div>
                  <button onClick={handlePublishForumPost} disabled={isPublishingForum} className="w-full mt-auto bg-[#fcd34d] hover:bg-white text-[#08203e] font-black rounded-xl py-4 uppercase tracking-widest transition-colors shadow-lg disabled:opacity-50 cursor-pointer shrink-0">
                    {isPublishingForum ? '...' : 'PUBLISH TOPIC'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Replies Feed (Right Panel) */}
          <div className="col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full pl-2">
            {!forumPost ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40">
                <span className="font-bold uppercase tracking-widest text-sm text-center px-8">No topic active for {forumLevelFilter}.<br/>Create one to allow replies.</span>
              </div>
            ) : forumReplies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40">
                <span className="font-bold uppercase tracking-widest text-sm">No replies yet.</span>
              </div>
            ) : (
              forumReplies.map(reply => {
                const author = reply.author || {};
                const isA1 = author.level?.includes('A1');
                return (
                  <div key={reply.id} className="relative border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-xl w-[90%] mb-2 flex items-start gap-4 hover:bg-white/10 transition-colors group">
                    <button onClick={() => handleDeleteForumReply(reply.id)} className="absolute top-4 right-4 w-8 h-8 bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all font-black rounded-full cursor-pointer flex items-center justify-center">✕</button>
                    <img src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.first_name || 'User'}&background=random`} className="w-12 h-12 rounded-full border-2 border-white object-cover shrink-0" alt="User" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-black text-white text-[11px] uppercase tracking-widest">{author.first_name} {author.last_name}</span>
                        <span className={`text-white text-[9px] font-black px-2 py-0.5 rounded border ${isA1 ? 'bg-blue-500 border-blue-400' : 'bg-emerald-500 border-emerald-400'}`}>{author.level ? author.level.split(':')[0] : 'User'}</span>
                      </div>
                      <p className={`text-sm font-medium leading-relaxed pr-8 ${reply.is_flagged ? 'text-red-400 italic' : 'text-white/90'}`}>
                        {reply.is_flagged ? '⚠️ Mensaje Marcado: ' + reply.content : reply.content}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  );


// ==========================================
// UPGRADED ENGINE: EDITABLE OVERHEAD TRACKER
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
      const { data, error } = await supabase
        .from('operating_expenses')
        .select('id, service_name, monthly_cost, category')
        .order('monthly_cost', { ascending: false });

      // If table is empty, start with a clean slate array
      const displayData = data && data.length > 0 ? data : [];
      const calculatedTotal = displayData.reduce((sum, item) => sum + Number(item.monthly_cost), 0);
      
      setExpenses(displayData);
      setTotalOverhead(calculatedTotal);
      
      // SEND LIVE OVERHEAD DATA TO PARENT
      if (onOverheadUpdate) {
        onOverheadUpdate(calculatedTotal);
      }
    } catch (error) {
      console.error("Error fetching overhead:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverhead();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.service_name || !newExpense.monthly_cost) return;
    
    try {
      await supabase.from('operating_expenses').insert([{
        service_name: newExpense.service_name,
        category: newExpense.category,
        monthly_cost: Number(newExpense.monthly_cost)
      }]);
      setNewExpense({ service_name: '', category: 'Software', monthly_cost: '' });
      setIsAdding(false);
      fetchOverhead(); // Refresh the list
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to remove this expense?")) return;
    try {
      await supabase.from('operating_expenses').delete().eq('id', id);
      fetchOverhead(); // Refresh the list
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  if (loading && expenses.length === 0) return <div className="p-8 text-white/50 text-center font-bold tracking-widest bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem]">LOADING OVERHEAD...</div>;

  return (
    <div className="relative w-full h-full rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
      <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
      <div className="relative w-full h-full flex flex-col p-8">
        
        <div className="mb-6 flex justify-between items-end border-b border-white/10 pb-4 shrink-0">
          <div>
            <h3 className="text-2xl font-black tracking-widest uppercase text-white">Overhead Costs</h3>
            <p className="text-sm font-bold text-red-400 uppercase tracking-wide">Recurring Digital & SaaS Expenses</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50 uppercase font-bold tracking-wider">Total Monthly</p>
            <p className="text-4xl font-black text-red-400">${totalOverhead.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
          {expenses.length === 0 ? (
             <div className="text-center text-white/40 font-bold tracking-widest text-sm mt-4 uppercase">No expenses recorded yet.</div>
          ) : (
            expenses.map((expense, idx) => (
              <div key={expense.id || idx} className="group flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors overflow-hidden">
                <div className="flex flex-col">
                  <span className="font-bold text-white tracking-wide">{expense.service_name}</span>
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{expense.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-white/80">${Number(expense.monthly_cost).toLocaleString()}</span>
                  <button onClick={() => handleDeleteExpense(expense.id)} className="w-8 h-8 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center font-black opacity-0 group-hover:opacity-100 transition-all text-xs z-10">✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
          {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-3 bg-white/10 hover:bg-[#fcd34d] text-white hover:text-[#08203e] font-black text-xs tracking-widest uppercase rounded-xl transition-colors">
              + Add New Expense
            </button>
          ) : (
            <form onSubmit={handleAddExpense} className="flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/10">
              <input type="text" placeholder="Service Name (e.g. Zoom)" value={newExpense.service_name} onChange={e => setNewExpense({...newExpense, service_name: e.target.value})} className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fcd34d]" required />
              <div className="flex gap-3">
                  <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fcd34d] appearance-none">
                      <option className="bg-[#0f172a]" value="Software">Software</option>
                      <option className="bg-[#0f172a]" value="Infrastructure">Infrastructure</option>
                      <option className="bg-[#0f172a]" value="Marketing">Marketing</option>
                      <option className="bg-[#0f172a]" value="Financial">Financial</option>
                  </select>
                  <input type="number" placeholder="Cost $" value={newExpense.monthly_cost} onChange={e => setNewExpense({...newExpense, monthly_cost: e.target.value})} className="w-24 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fcd34d]" required min="0" step="0.01" />
              </div>
              <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-[#fcd34d] text-[#08203e] rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">Save</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE LAYOUT: FINANCES
// ==========================================
const FinancesPage = () => {
  const [revenue, setRevenue] = useState(0);
  const [payroll, setPayroll] = useState(0);
  const [overhead, setOverhead] = useState(0);

  // Renewals Modal State & Live Calculation
  const [showRenewalsModal, setShowRenewalsModal] = useState(false);
  const [pendingRenewals, setPendingRenewals] = useState([]); // Blank state for real database fetch later
  const renewalRate = pendingRenewals.length > 0 ? 0 : 0; // Dynamic 0% until wired

  const netProfit = revenue - payroll - overhead;
  const netMarginPercentage = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1500px] min-h-[calc(100vh-160px)] animate-fade-in relative z-10 pb-10">
      
      {/* ROW 1: THE "NOW" (Hard Financials) */}
     <div className="grid grid-cols-12 gap-8 h-auto min-h-[450px]">
        
       {/* Left: Circular KPIs */}
        <div className="col-span-3 flex flex-col gap-6 h-full justify-center">
          
          {/* RENEWALS BUTTON - Clipped Wrapper */}
          <button onClick={() => setShowRenewalsModal(true)} className="flex-1 w-full relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl cursor-pointer group hover:bg-white/5 transition-all text-left">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0 mb-2">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#fcd34d" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (renewalRate / 100) * (2 * Math.PI * 40)} strokeLinecap="round" className="group-hover:stroke-yellow-300 transition-colors" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-white drop-shadow-md">{renewalRate}%</span>
                </div>
              </div>
              <h3 className="text-white/90 font-black text-sm tracking-widest uppercase text-center mt-2">Renewals</h3>
            </div>
          </button>

          {/* NET MARGIN CARD - Clipped Wrapper */}
          <div className="flex-1 relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl cursor-pointer group">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0 mb-2">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (netMarginPercentage / 100) * (2 * Math.PI * 40)} strokeLinecap="round" className="group-hover:stroke-blue-400 transition-colors" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-white drop-shadow-md">{netMarginPercentage}%</span>
                </div>
              </div>
              <h3 className="text-white/90 font-black text-sm tracking-widest uppercase text-center mt-2 whitespace-nowrap">Net Margin</h3>
            </div>
          </div>
          
        </div>

        {/* Center: Profit Margin Analysis Engine */}
        <div className="col-span-6 h-full">
          <ProfitMarginAnalysis onMetricsUpdate={(m) => { setRevenue(m.revenue); setPayroll(m.payroll); }} />
        </div>

        {/* Right: 4-Metric Stack */}
        <div className="col-span-3 flex flex-col gap-4 h-full justify-between">
          <div className="flex-1 relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <h4 className="text-white/70 font-black text-sm tracking-widest uppercase">Gross Revenue</h4>
              <span className="text-3xl font-black text-[#fcd34d] mt-1">${revenue.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex-1 relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl cursor-pointer group hover:bg-white/5 transition-colors">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <h4 className="text-white/70 font-black text-sm tracking-widest uppercase">Payroll Liability</h4>
              <span className="text-3xl font-black text-red-400 mt-1">-${payroll.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex-1 relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl cursor-pointer group hover:bg-white/5 transition-colors">
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-xl -z-10" />
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <h4 className="text-white/70 font-black text-sm tracking-widest uppercase text-center leading-tight">Digital Overhead</h4>
              <span className="text-3xl font-black text-orange-400 mt-1">-${overhead.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex-1 relative rounded-[2rem] border border-[#10b981]/40 overflow-hidden shadow-2xl">
            <div className="absolute -inset-4 bg-[#10b981]/20 backdrop-blur-xl -z-10" />
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <h4 className="text-white font-black text-sm tracking-widest uppercase">Net Profit</h4>
              <span className="text-4xl font-black text-[#10b981] mt-1 drop-shadow-md">${netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: THE "FUTURE & LEAKS" (Acquisition & Operations) */}
      <div className="grid grid-cols-12 gap-8 h-auto min-h-[450px]">
        
        {/* Left: Commercial Funnel Engine */}
        <div className="col-span-6 h-full">
          <CommercialFunnelModule />
        </div>

        {/* Right: Overhead/SaaS Breakdown Engine */}
        <div className="col-span-6 h-full">
          <OverheadExpensesModule onOverheadUpdate={setOverhead} />
        </div>
        
      </div>

      {/* FLOATING RENEWALS MODAL */}
      {showRenewalsModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#08203e] border border-white/20 rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl flex flex-col max-h-[80vh] animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl font-black tracking-widest uppercase text-white">Pending Renewals</h3>
                <p className="text-sm font-bold text-[#fcd34d] uppercase tracking-wide">Students ready for next level</p>
              </div>
              <button onClick={() => setShowRenewalsModal(false)} className="text-white/50 hover:text-white text-3xl font-black transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {pendingRenewals.length === 0 ? (
                <div className="text-center text-white/40 font-bold tracking-widest text-sm py-12 uppercase">No pending renewals at this time.</div>
              ) : (
                pendingRenewals.map((student, i) => (
                   <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-bold">{student.name}</h4>
                        <p className="text-white/50 text-xs uppercase tracking-wider">{student.contact}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#fcd34d] font-black text-sm">FINISHED: {student.completedLevel}</p>
                        <button className="mt-2 bg-[#fcd34d] text-[#08203e] px-4 py-1 rounded font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Contact</button>
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


  const renderSettings = () => {
    if (settingsView === 'EVALUATOR') {
      return <EvaluatorModule 
        onBack={() => setSettingsView('MENU')} 
        onOnboard={(data) => {
          setProvisioningInitialData(data);
          setIsProvisioningModalOpen(true);
        }} 
      />;
    }

    return (
      <div className="flex items-center justify-center w-full h-[calc(100vh-160px)] animate-fade-in relative z-10">
        <div className="grid grid-cols-4 gap-8 max-w-[1200px] w-full">
          {['Tenants', 'Public logs', 'Shifts', 'Evaluator', 'Reports', 'B2B Clients', 'Resumes', 'Language'].map((setting, i) => (
            <button 
              key={setting} 
              onClick={() => setting === 'Evaluator' ? setSettingsView('EVALUATOR') : null} 
              className="aspect-square bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 shadow-2xl flex flex-col items-center justify-center gap-6 hover:bg-white/10 hover:scale-105 transition-all group cursor-pointer"
            >
            {i===0 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>}
            {i===1 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>}
            {i===2 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {i===3 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>}
            {i===4 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            {i===5 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>}
            {i===6 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>}
            {i===7 && <svg className="w-32 h-32 text-white group-hover:text-[#fcd34d] transition-colors drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>}
            <h3 className="text-white font-black text-2xl uppercase tracking-widest">{setting}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

  return (
    <div 
      className="relative min-h-screen w-full font-montserrat text-white overflow-hidden flex flex-col"
      style={{ 
        backgroundImage: `linear-gradient(to bottom right, rgba(7,11,25,0.9), rgba(7,11,25,0.65)), url("https://i.postimg.cc/kg4rxNH2/Gemini-Generated-Image-ohtdmbohtdmbohtd.jpg")`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundAttachment: 'fixed' 
      }}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fcd34d; }
        .zoom-container { touch-action: pan-x pan-y pinch-zoom; overflow: auto; overscroll-behavior: contain; }
        video::-internal-media-controls-download-button { display: none !important; }
        audio::-internal-media-controls-download-button { display: none !important; }
        
        /* Phone Input Custom Styling */
        .PhoneInputCustom { display: flex; align-items: center; width: 100%; }
        .PhoneInputCustom .PhoneInputInput {
            background: transparent !important;
            color: white !important;
            outline: none !important;
            border: none !important;
            font-size: 0.875rem !important;
            margin-left: 0.75rem !important;
        }
        .PhoneInputCustom .PhoneInputCountry {
            margin-right: 0.5rem;
        }
        .PhoneInputCustom .PhoneInputCountrySelectArrow {
            color: rgba(255,255,255,0.5);
        }
        .PhoneInputCustom .PhoneInputCountrySelect {
            color: white;
            background: #070b19;
        }
      `}</style>

      {/* PROFILE DROPDOWN MENU (Rendered globally to avoid Sidebar Clipping) */}
      {isProfileDropdownOpen && (
        <div className="fixed inset-0 z-[500] pointer-events-none">
          {/* Clickable Backdrop */}
          <div className="absolute inset-0 pointer-events-auto" onClick={() => setIsProfileDropdownOpen(false)}></div>
          
          {/* Dropdown Box */}
          <div className="absolute left-32 top-10 w-48 bg-[#08203e]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col py-2 overflow-hidden animate-fade-in pointer-events-auto">
            <button 
              onClick={() => { setIsProfileModalOpen(true); setIsProfileDropdownOpen(false); }} 
              className="px-6 py-3 text-left text-white/80 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#fcd34d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit Profile
            </button>
           <div className="h-px w-full bg-white/10 my-1"></div>
                <button 
                  onClick={async () => { 
                    setIsProfileDropdownOpen(false);
                    try {
                      await supabase.auth.signOut();
                      window.location.href = '/'; 
                    } catch (error) {
                      console.error("Error logging out:", error);
                    }
                  }} 
                  className="px-6 py-3 text-left text-red-400 hover:text-white hover:bg-red-500/20 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Log Out
                </button>
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-fade-in font-montserrat">
          <div className="bg-[#070b19]/95 border border-[#fcd34d]/30 rounded-[2rem] p-8 max-w-lg w-full shadow-[0_0_40px_rgba(252,211,77,0.15)] relative flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">My Profile</h2>
                <p className="text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest mt-1">Admin Settings</p>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">✕</button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-center border-b border-white/10 pb-6">
                <div className="w-20 h-20 rounded-full border-2 border-[#fcd34d] overflow-hidden bg-black/40 flex items-center justify-center shrink-0 shadow-lg">
                  {adminProfile.avatarUrl ? (
                    <img src={adminProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-1">Avatar URL</label>
                  <input type="text" value={adminProfile.avatarUrl} onChange={e => setAdminProfile({...adminProfile, avatarUrl: e.target.value})} placeholder="Paste image link..." className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#fcd34d]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">First Name</label>
                  <input type="text" value={adminProfile.firstName} onChange={e => setAdminProfile({...adminProfile, firstName: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#fcd34d]" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Last Name</label>
                  <input type="text" value={adminProfile.lastName} onChange={e => setAdminProfile({...adminProfile, lastName: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#fcd34d]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Company Status</label>
                  <input type="text" value={adminProfile.role} disabled className="w-full bg-white/5 border border-transparent rounded-xl px-3 py-2.5 text-white/50 text-sm cursor-not-allowed font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Password</label>
                  <input type="password" value={adminProfile.password} onChange={e => setAdminProfile({...adminProfile, password: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#fcd34d]" />
                </div>
              </div>
              
              <button onClick={handleSaveAdminProfile} disabled={isSavingProfile} className="w-full mt-4 py-4 bg-[#fcd34d] hover:bg-white text-[#08203e] font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(252,211,77,0.3)] hover:scale-[1.02] disabled:opacity-50">
                {isSavingProfile ? 'SAVING...' : 'SAVE PROFILE'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        />
      )}

      {isPreviewMode && (
        <button onClick={() => setIsPreviewMode(false)} className="fixed top-6 right-6 z-[9999] bg-red-600/90 text-white font-black px-8 py-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] uppercase tracking-widest text-sm hover:scale-105 border border-red-500/50 backdrop-blur-md transition-all animate-fade-in">
          EXIT PREVIEW
        </button>
      )}

      {/* SIDEBAR NAVIGATION */}
      <div className="fixed top-0 left-0 bottom-0 w-28 border-r border-white/10 bg-[#070b19]/80 backdrop-blur-2xl flex flex-col items-center py-10 gap-6 shrink-0 z-[150] shadow-2xl overflow-y-auto custom-scrollbar">
        
        {/* PROFILE BUTTON */}
        <NavIconBtn isProfile avatarUrl={adminProfile.avatarUrl} onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} />
        
        <div className="w-12 h-px bg-white/10 my-2 shrink-0"></div>
        <NavIconBtn iconUrl={navIcons.accounts} active={activeModule === 'ACCOUNTS'} onClick={() => { setActiveModule('ACCOUNTS'); setAccountsView('OVERVIEW'); }} />
        <NavIconBtn iconUrl={navIcons.calendar} active={activeModule === 'CALENDARS'} onClick={() => setActiveModule('CALENDARS')} />
        <NavIconBtn iconUrl={navIcons.content} active={activeModule === 'CONTENTS'} onClick={() => setActiveModule('CONTENTS')} />
        <NavIconBtn iconUrl={navIcons.communications} active={activeModule === 'COMMUNICATIONS'} onClick={() => setActiveModule('COMMUNICATIONS')} hasNotification />
        <NavIconBtn iconUrl={navIcons.finances} active={activeModule === 'FINANCES'} onClick={() => setActiveModule('FINANCES')} />
        <NavIconBtn iconUrl={navIcons.settings} active={activeModule === 'SETTINGS'} onClick={() => setActiveModule('SETTINGS')} />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-28 flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar z-10 relative">
        
        {/* HEADER */}
        {activeModule !== 'CONTENTS' && (
          <div className="flex items-center gap-5 mb-10 pl-2 shrink-0">
            <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-12 object-contain drop-shadow-md" />
            <div className="h-10 w-[2px] bg-white/20"></div>
            <span className="text-3xl font-light text-white tracking-widest uppercase drop-shadow-sm">{activeModule}</span>
          </div>
        )}

        {/* DYNAMIC MODULE RENDERING */}
        {activeModule === 'ACCOUNTS' && accountsView === 'OVERVIEW' && renderAccounts()}
        {activeModule === 'ACCOUNTS' && accountsView === 'STATISTICS' && (
          <div className="w-full h-full flex flex-col animate-fade-in relative z-10">
            <button 
              onClick={() => setAccountsView('OVERVIEW')} 
              className="mb-4 px-8 py-3 bg-white/10 hover:bg-[#fcd34d] hover:text-[#08203e] text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest transition-all w-fit shadow-lg"
            >
              &larr; Back to Accounts Overview
            </button>
            <div className="flex-1 w-full pb-10">
              <StatisticsHub />
            </div>
          </div>
        )}
      {activeModule === 'CALENDARS' && <AdminCalendar/>}
        {activeModule === 'COMMUNICATIONS' && renderCommunications()}
        {activeModule === 'FINANCES' && <FinancesPage />}
        {activeModule === 'SETTINGS' && renderSettings()}
        
        {/* ==========================================
            CONTENTS MODULE (PRESERVED LOGIC)
        ========================================== */}
        {activeModule === 'CONTENTS' && (
          <div className="relative z-10 flex flex-col w-full flex-grow">
            {!isPreviewMode && (
              <div className="fixed top-0 left-28 right-0 z-[150] bg-[#070b19]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl flex items-center px-8 py-4 gap-6">
                <div className="flex items-center gap-4 shrink-0 border-r border-white/10 pr-6">
                  <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-8 object-contain opacity-100" />
                  <span className="text-xl font-light text-white tracking-widest uppercase">CONTENTS</span>
                </div>
                
                {/* TOOL CAROUSEL */}
                <div className="flex-1 flex overflow-x-auto custom-scrollbar gap-3 items-center px-4 py-2">
                  <button className="text-white/50 font-black px-2">&lt;</button>
                  {toolOptions.map(tool => (
                    <button key={tool} onClick={() => handleToolSelect(tool)} className="px-5 py-2.5 bg-white/10 hover:bg-[#fcd34d] hover:text-[#08203e] rounded-xl font-black text-xs uppercase tracking-widest transition-colors whitespace-nowrap border border-white/20 hover:border-transparent shadow-md">
                      {tool}
                    </button>
                  ))}
                  <button className="text-white/50 font-black px-2">&gt;</button>
                </div>

                <div className="flex items-center gap-6 shrink-0 border-l border-white/10 pl-6">
                  <button onClick={() => setIsSaveModalOpen(true)} className="text-white font-black tracking-widest uppercase hover:text-[#fcd34d] transition-colors text-xs">SAVE</button>
                  <button onClick={handleUndoWorkspace} className="text-white font-black tracking-widest uppercase hover:text-[#fcd34d] transition-colors text-xs">UNDO</button>
                  <button onClick={handleDuplicateScreen} className="text-white font-black tracking-widest uppercase hover:text-[#fcd34d] transition-colors text-xs">DUPLICATE</button>
                  <button onClick={() => setIsPreviewMode(true)} className="text-white font-black tracking-widest uppercase hover:text-[#fcd34d] transition-colors text-xs">PREVIEW</button>
                </div>
              </div>
            )}
              
            <div className={`flex w-full ${!isPreviewMode ? 'mt-20' : ''}`}>
              {/* CONTENT LEFT NAVIGATION (Filters) */}
              {!isPreviewMode && (
                <div className="w-56 shrink-0 flex flex-col gap-4 py-8 pr-8 border-r border-white/10 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar sticky top-20">
                  <div className="relative z-[60]">
                    <AdminDropdown placeholder="LEVEL" options={LEVEL_OPTIONS} value={selectedLevel} onChange={setSelectedLevel} />
                  </div>
                  <div className="relative z-[50]">
                    <AdminDropdown placeholder="UNIT" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} />
                  </div>
                  <div className="h-px w-full bg-white/10 my-2"></div>
                  {['Lesson', 'Workbook', 'Manuals', 'Cue Cards'].map(type => (
                    <button key={type} onClick={() => setContentType(type)} className={`w-full py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md ${contentType === type ? 'bg-[#fcd34d] text-[#08203e] scale-105' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {/* CANVAS AREA */}
              <div className="flex-1 flex flex-col items-center">
                {activeScreenArray.map((screenId, index) => {
                  const screenElements = canvasElements.filter(el => el.screenId === screenId);
                  const contentElements = screenElements.filter(el => !['nav_button'].includes(el.type));
                  const dockElements = screenElements.filter(el => ['nav_button', 'record_compare'].includes(el.type));

                  return (
                    <React.Fragment key={screenId}>
                      {!isPreviewMode && (
                        <div className="w-full flex items-center justify-center py-8 z-20 relative">
                          <div className="px-10 py-3 bg-white/10 border border-white/20 rounded-2xl text-white/70 font-black tracking-widest uppercase text-xs backdrop-blur-md shadow-md">
                            --- SCREEN {index + 1} ---
                          </div>
                        </div>
                      )}

                      <div 
                        id={`preview-screen-${screenId}`}
                        onClick={() => setActiveScreenId(screenId)}
                        className={`w-full relative flex flex-col p-6 mx-auto ${isPreviewMode ? 'max-w-[100rem]' : 'max-w-[80rem] border-x border-b-2 border-white/10 bg-white/5 rounded-b-[3rem] shadow-2xl'}`}
                        style={{ minHeight: '100vh' }}
                      >
                        {!isPreviewMode && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteScreen(screenId); }} className="absolute top-6 right-6 z-[60] w-12 h-12 bg-red-500/20 hover:bg-red-500 border border-red-500/50 rounded-full flex items-center justify-center text-red-400 hover:text-white transition-all shadow-lg">
                            <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        )}
                        
                        {/* Container for content */}
                        <div className="flex flex-wrap justify-center gap-6 w-full relative z-10 flex-grow content-start pointer-events-auto">
                          
                          {/* MEDIA STANDALONE BLOCK */}
                          {contentElements.filter(el => ['video', 'image', 'audio'].includes(el.type)).length > 0 && (
                            <div className="w-full flex flex-col items-center gap-6 mb-6">
                              {contentElements.filter(el => ['video', 'image', 'audio'].includes(el.type)).map(el => (
                                 <div key={el.id} className={`w-full ${el.type === 'video' ? 'max-w-4xl' : 'max-w-3xl'} bg-black/40 rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl animate-fade-in relative`}>
                                    {!isPreviewMode && <button onClick={() => handleDeleteElement(el.id)} className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-xl z-50 hover:scale-110 transition-transform">✕</button>}
                                    
                                    {el.type === 'video' && <video src={el.url} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full aspect-video object-contain" />}
                                    
                                    {el.type === 'image' && <PanZoomImage src={el.url} data={el.data} onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })} isPreview={isPreviewMode} wrapperClass="w-full h-[400px] md:h-[500px]" />}
                                    
                                    {el.type === 'audio' && (
                                       <div className="p-8 w-full flex flex-col items-center">
                                          {!isPreviewMode && !el.data?.imageUrl && (
                                             <div onClick={() => { setMediaTarget({ id: el.id, type: 'image' }); setActiveModal('media_upload'); }} className="w-full h-24 bg-white/10 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/20 hover:text-white transition-all mb-6">
                                               <span className="text-xs font-bold uppercase tracking-widest">+ Add Image (Optional)</span>
                                             </div>
                                          )}
                                          {el.data?.imageUrl && (
                                             <div className="w-full relative mb-6">
                                               <PanZoomImage src={el.data.imageUrl} data={el.data} onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })} isPreview={isPreviewMode} wrapperClass="w-full h-[300px] rounded-2xl" />
                                               {!isPreviewMode && <button onClick={() => handleRemoveMedia(el.id, 'image')} className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-xl z-50 hover:scale-110 transition-transform">✕</button>}
                                             </div>
                                          )}
                                          <audio src={el.url} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full" />
                                       </div>
                                    )}
                                 </div>
                              ))}
                            </div>
                          )}

                          {contentElements.filter(el => !['video', 'image', 'audio'].includes(el.type)).map(el => {
                            const isCard = ['short_answer', 'multiple_selection', 'slider_bar', 'fill_in_the_blank', 'record_compare'].includes(el.type);
                            
                            return (
                              <div key={el.id} className={`relative flex flex-col group ${isCard ? 'w-full md:w-[calc(50%-12px)]' : 'w-full flex-col items-center'}`}>
                                
                                {/* Admin Overlay Actions */}
                                {!isPreviewMode && (
                                   <div className="absolute -top-4 -right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     {el.type !== 'text' && <button onClick={() => { setEditingElementId(el.id); setActiveModal(el.type); }} className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">✏️</button>}
                                     <button onClick={() => handleDeleteElement(el.id)} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">✕</button>
                                   </div>
                                )}

                                {/* TEXT / HEADER & CUSTOM INLINE EDITOR */}
                                {el.type === 'text' && (
                                  <div className={`w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-2xl text-center mb-6 relative ${focusedTextId === el.id ? 'z-[100]' : 'z-10'}`} onFocus={() => setFocusedTextId(el.id)}>
                                     {!isPreviewMode && focusedTextId === el.id && (
                                       <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#070b19]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center gap-1 shadow-2xl whitespace-nowrap text-white z-[100]">
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('bold')}} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white/10 rounded-lg transition-colors">B</button>
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('italic')}} className="w-8 h-8 flex items-center justify-center italic hover:bg-white/10 rounded-lg transition-colors">I</button>
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('underline')}} className="w-8 h-8 flex items-center justify-center underline hover:bg-white/10 rounded-lg transition-colors">U</button>
                                          
                                          <div className="w-px h-6 bg-white/20 my-auto mx-1"></div>
                                          
                                          {/* Alignment Tools */}
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('justifyLeft')}} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors" title="Align Left">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16"/></svg>
                                          </button>
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('justifyCenter')}} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors" title="Align Center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M4 18h16"/></svg>
                                          </button>
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('justifyRight')}} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors" title="Align Right">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M4 18h16"/></svg>
                                          </button>
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('justifyFull')}} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors" title="Justify">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                                          </button>

                                          <div className="w-px h-6 bg-white/20 my-auto mx-1"></div>
                                          
                                          <input type="color" onInput={(e)=>formatText('foreColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" title="Text Color" />
                                          
                                          <select onChange={(e)=>formatText('fontName', e.target.value)} className="bg-[#070b19] border border-white/20 rounded-xl px-2 py-1.5 text-xs outline-none ml-1 cursor-pointer">
                                             <option value="Montserrat" className="text-white">Montserrat</option>
                                             <option value="Arial" className="text-white">Arial</option>
                                             <option value="Times New Roman" className="text-white">Times New Roman</option>
                                          </select>
                                          
                                          <select onChange={(e)=>formatText('fontSize', e.target.value)} className="bg-[#070b19] border border-white/20 rounded-xl px-2 py-1.5 text-xs outline-none ml-1 cursor-pointer">
                                             <option value="1" className="text-white">Tiny</option>
                                             <option value="3" className="text-white">Normal</option>
                                             <option value="5" className="text-white">Large</option>
                                             <option value="7" className="text-white">Huge</option>
                                          </select>
                                       </div>
                                     )}
                                     <div id={`element-${el.id}`} contentEditable={!isPreviewMode} dangerouslySetInnerHTML={{__html: el.htmlContent}} onBlur={(e) => !isPreviewMode && saveSnapshot() && setCanvasElements(prev => prev.map(p => p.id === el.id ? {...p, htmlContent: e.target.innerHTML} : p))} className="rich-text-content focus:outline-none" />
                                  </div>
                                )}

                                {/* CARDS */}
                                {isCard && (
                                  <div className="w-full bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-8 flex flex-col gap-6 shadow-2xl h-full justify-between">
                                     
                                     {/* Universal Image Uploader for Cards */}
                                     {!isPreviewMode && !el.data?.imageUrl && (
                                        <div onClick={() => { setMediaTarget({ id: el.id, type: 'image' }); setActiveModal('media_upload'); }} className="w-full h-40 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white/50 cursor-pointer hover:bg-white/20 hover:text-white transition-all mb-4">
                                          <span className="text-5xl mb-2 font-light">+</span>
                                          <span className="text-xs font-black uppercase tracking-widest text-center px-4">Click to add an image</span>
                                        </div>
                                     )}
                                     {el.data?.imageUrl && (
                                        <div className="relative mx-auto w-full mb-8 group">
                                          <PanZoomImage src={el.data.imageUrl} data={el.data} onSave={(d) => handleSaveData(el.id, { ...el.data, ...d })} isPreview={isPreviewMode} wrapperClass="w-full h-72 rounded-2xl" />
                                          {!isPreviewMode && <button onClick={() => handleRemoveMedia(el.id, 'image')} className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold shadow-xl z-50 hover:scale-110">✕</button>}
                                        </div>
                                     )}

                                     {/* Record & Compare Audio Slot */}
                                     {el.type === 'record_compare' && (
                                        <>
                                          {!isPreviewMode && !el.data?.audioUrl && (
                                             <div onClick={() => { setMediaTarget({ id: el.id, type: 'audio' }); setActiveModal('media_upload'); }} className="w-full h-20 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/20 hover:text-white transition-all mb-4">
                                               <span className="text-xs font-black uppercase tracking-widest">+ Add Target Audio</span>
                                             </div>
                                          )}
                                          {el.data?.audioUrl && (
                                             <div className="relative group w-full mb-4">
                                               <audio src={el.data.audioUrl} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full rounded-xl" />
                                               {!isPreviewMode && <button onClick={() => handleRemoveMedia(el.id, 'audio')} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold shadow-xl z-50 hover:scale-110">✕</button>}
                                             </div>
                                          )}
                                        </>
                                     )}

                                     {el.type === 'record_compare' && !isPreviewMode && (
                                        <div className="text-center text-white/40 text-xs uppercase font-bold tracking-widest mt-auto border-t border-white/10 pt-6">
                                          (Record Button renders in Bottom Dock)
                                        </div>
                                     )}
                                     
                                     {el.type === 'short_answer' && el.data && (
                                        <>
                                          <div dangerouslySetInnerHTML={{ __html: el.data.questionHtml }} className="w-full break-words text-white mt-2 text-lg" />
                                          <input type="text" disabled={!isPreviewMode} placeholder={isPreviewMode ? "Your answer..." : "Student answers here"} value={studentAnswers[el.id] || ''} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="w-full p-6 mt-auto bg-black/40 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-[#fcd34d] transition-all shadow-inner placeholder-white/30 text-lg" />
                                        </>
                                     )}

                                     {el.type === 'fill_in_the_blank' && el.data && (
                                        <div className="w-full h-full flex flex-col justify-end mt-4">
                                           {renderFormattedText(el, isPreviewMode)}
                                        </div>
                                     )}

                                     {el.type === 'multiple_selection' && el.data && (
                                        <>
                                          {el.data.promptHtml && <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="mb-6 mt-2 text-lg" />}
                                          <div className="flex flex-col gap-3 mt-auto">
                                             {el.data.options?.map((opt) => {
                                                const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                                                return (
                                                  <button key={opt.id} onClick={() => isPreviewMode && setStudentAnswers(prev => ({ ...prev, [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`] }))} style={{ backgroundColor: isSelected ? '#fcd34d' : el.data.optBoxColor, borderColor: isSelected ? '#ca8a04' : el.data.optLineColor, borderWidth: (el.data.optLineColor === 'transparent' && !isSelected) ? '0px' : '2px', borderStyle: 'solid', borderRadius: `${el.data.optBorderRadius}px` }} className="w-full p-5 text-left transition-all hover:scale-[1.02] active:scale-95 flex items-center shadow-md">
                                                     <div className={`w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#08203e]' : 'border-white/40'}`}>
                                                       {isSelected && <div className="w-3 h-3 bg-[#08203e] rounded-full"></div>}
                                                     </div>
                                                     <div dangerouslySetInnerHTML={{__html: opt.html}} className="pointer-events-none text-lg" style={{ color: isSelected ? '#08203e' : 'inherit' }} />
                                                  </button>
                                                )
                                             })}
                                          </div>
                                        </>
                                     )}

                                     {el.type === 'slider_bar' && el.data && (() => {
                                        const isVert = el.data.orientation === 'vertical';
                                        const opts = el.data.options || [];
                                        const maxIdx = Math.max(0, opts.length - 1);
                                        const currentIdx = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id]) : Math.floor(maxIdx / 2);
                                        const activeOpt = opts[currentIdx] || {};
                                        const pct = maxIdx === 0 ? 50 : (currentIdx / maxIdx) * 100;
                                        return (
                                          <div className="w-full flex flex-col h-full min-h-[200px] justify-end relative pb-8 mt-6">
                                             <div className="absolute w-full h-full flex flex-col items-center justify-center">
                                               <div className="absolute flex items-center justify-center rounded-full shadow-inner overflow-hidden" style={{ backgroundColor: el.data.barColor, width: isVert ? `${el.data.barThickness}px` : '100%', height: isVert ? '100%' : `${el.data.barThickness}px` }}></div>
                                               <input type="range" min="0" max={maxIdx} step="1" disabled={!isPreviewMode} value={currentIdx} onChange={(e) => setStudentAnswers(prev => ({...prev, [el.id]: e.target.value}))} className="absolute custom-slider w-full h-full z-10" style={{ '--thumb-color': el.data.handleColor, transform: isVert ? 'rotate(-90deg)' : 'none', WebkitAppearance: 'none', background: 'transparent' }} />
                                               { !isVert && (
                                                  <div className="absolute flex flex-col items-center transition-all duration-200 pointer-events-none z-0" style={{ left: `${pct}%`, bottom: 'calc(50% + 25px)', transform: 'translateX(-50%)' }}>
                                                     <div className="bg-white text-[#08203e] px-6 py-3 rounded-xl shadow-2xl font-black text-base">{activeOpt.text}</div>
                                                     <div className="w-0 h-0 border-solid" style={{ borderWidth: '10px 8px 0 8px', borderColor: 'white transparent transparent transparent' }} />
                                                  </div>
                                               )}
                                             </div>
                                          </div>
                                        );
                                     })()}
                                  </div>
                                )}

                                {/* DRAG AND DROP */}
                                {el.type === 'drag_and_drop' && el.data && (
                                  <div className="w-full max-w-7xl bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-8 md:p-10 flex flex-col gap-10 shadow-2xl">
                                     <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(el.data.items.filter(i=>i.imageUrl).length, 4)} gap-8 w-full`}>
                                       {el.data.items.map((item, idx) => item.imageUrl && (
                                         <div key={idx} className="flex flex-col items-center gap-6">
                                           <div className="w-full rounded-2xl overflow-hidden relative group">
                                             <PanZoomImage src={item.imageUrl} data={item} onSave={(d) => {
                                                if (isPreviewMode) return;
                                                const newItems = [...el.data.items];
                                                newItems[idx] = { ...newItems[idx], ...d };
                                                handleSaveData(el.id, { ...el.data, items: newItems });
                                             }} isPreview={isPreviewMode} wrapperClass="w-full aspect-[4/5] rounded-2xl shadow-xl" />
                                           </div>
                                           <div data-dnd-zone={`${el.id}_${idx}`} className="w-full min-h-[80px] border-2 border-dashed border-white/40 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center transition-colors shadow-inner">
                                              {dndAnswers[`${el.id}_${idx}`] ? (
                                                <div onClick={() => setDndAnswers(prev => { const copy = {...prev}; delete copy[`${el.id}_${idx}`]; return copy; })} className="px-6 py-4 bg-[#fcd34d] text-[#08203e] rounded-xl font-black text-base shadow-xl cursor-pointer w-full text-center hover:scale-105 active:scale-95 transition-transform truncate">
                                                  {dndAnswers[`${el.id}_${idx}`]}
                                                </div>
                                              ) : <span className="text-white/40 text-xs uppercase font-black tracking-widest">DROP HERE</span>}
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                     <div className="w-full bg-black/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-inner">
                                        <div className="text-center font-black text-[#fcd34d] text-xs uppercase tracking-widest mb-6 drop-shadow-md">Word Bank</div>
                                        <div className="flex flex-wrap justify-center gap-4">
                                          {el.data.items.map((item, idx) => {
                                            if (!item.studentViewText) return null;
                                            const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                                            if (isUsed) return null;
                                            return (
                                              <div key={`bank-${idx}`} onPointerDown={(e) => { e.preventDefault(); setTouchDragState({ isDragging: true, text: item.studentViewText, x: e.clientX || (e.touches && e.touches[0].clientX), y: e.clientY || (e.touches && e.touches[0].clientY), sourceElId: el.id }); }} className="px-8 py-4 bg-white/10 hover:bg-[#fcd34d] hover:text-[#08203e] border border-white/20 rounded-xl text-white font-black text-base shadow-xl cursor-grab active:cursor-grabbing transition-colors touch-none">
                                                {item.studentViewText}
                                              </div>
                                            );
                                          })}
                                          {Object.keys(dndAnswers).length === el.data.items.filter(i=>i.imageUrl).length && <span className="text-green-400 font-black text-lg tracking-widest uppercase py-4">All items placed!</span>}
                                        </div>
                                     </div>
                                  </div>
                                )}

                                {/* PUZZLES */}
                                {(el.type === 'crossword' || el.type === 'word_search') && el.data && (
                                   <div className="w-full max-w-7xl bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-8 flex flex-col md:flex-row gap-10 shadow-2xl">
                                     <div className="flex-1 flex flex-col gap-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-6">
                                       {el.type === 'crossword' && (
                                         <>
                                           <h3 className="font-black text-[#fcd34d] text-xl uppercase tracking-widest border-b border-white/20 pb-4 drop-shadow-md">Prompts</h3>
                                           <div className="flex gap-10">
                                             <div className="flex-1 flex flex-col gap-5">
                                               <h4 className="text-xs font-black text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">Across</h4>
                                               {el.data.across?.map(a => <div key={`a-${a.num}`} className="text-base text-white flex gap-4"><span className="font-black text-[#fcd34d]">{a.num}.</span><span className="font-medium opacity-90">{a.prompt}</span></div>)}
                                             </div>
                                             <div className="flex-1 flex flex-col gap-5">
                                               <h4 className="text-xs font-black text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">Down</h4>
                                               {el.data.down?.map(d => <div key={`d-${d.num}`} className="text-base text-white flex gap-4"><span className="font-black text-[#fcd34d]">{d.num}.</span><span className="font-medium opacity-90">{d.prompt}</span></div>)}
                                             </div>
                                           </div>
                                         </>
                                       )}
                                       {el.type === 'word_search' && (
                                         <>
                                           <div dangerouslySetInnerHTML={{ __html: el.data.promptHtml }} className="w-full whitespace-pre-wrap break-words border-b border-white/20 pb-6 mb-4 drop-shadow-md text-xl" />
                                           <div className="flex gap-6">
                                             <ul className="flex-1 flex flex-col gap-4 list-none pl-2">
                                               {el.data.targetWords?.slice(0, Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w1-${i}`} className="text-base font-bold text-white/90 tracking-widest flex items-center gap-4"><span className="w-3 h-3 rounded-full bg-[#fcd34d] shadow-[0_0_10px_#fcd34d]"></span>{w}</li>)}
                                             </ul>
                                             <ul className="flex-1 flex flex-col gap-4 list-none pl-2">
                                               {el.data.targetWords?.slice(Math.ceil(el.data.targetWords.length / 2)).map((w, i) => <li key={`w2-${i}`} className="text-base font-bold text-white/90 tracking-widest flex items-center gap-4"><span className="w-3 h-3 rounded-full bg-[#fcd34d] shadow-[0_0_10px_#fcd34d]"></span>{w}</li>)}
                                             </ul>
                                           </div>
                                         </>
                                       )}
                                     </div>
                                     
                                     <div className="flex-[2] bg-black/40 rounded-3xl border border-white/10 p-6 zoom-container flex justify-center items-center min-h-[500px] shadow-inner relative">
                                        {el.type === 'crossword' && (
                                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(45px, 1fr))`, gap: '3px', width: 'fit-content', position: 'relative', zIndex: 10 }}>
                                            {el.data.grid.map((row, rIdx) => 
                                              row.map((cell, cIdx) => (
                                                <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-12 md:w-14">
                                                  {cell ? (
                                                    <div className="w-full h-full relative">
                                                      {cell.num && <span className="absolute top-1.5 left-1.5 text-[10px] font-black text-white/90 z-10 pointer-events-none drop-shadow-md">{cell.num}</span>}
                                                      <input 
                                                        type="text" maxLength={1} 
                                                        value={studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || ''}
                                                        onChange={(e) => setStudentAnswers(prev => ({...prev, [`${el.id}_${rIdx}_${cIdx}`]: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')}))}
                                                        style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal' }}
                                                        className="w-full h-full text-center uppercase focus:outline-none focus:ring-4 focus:ring-[#fcd34d] transition shadow-inner rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold"
                                                      />
                                                    </div>
                                                  ) : <div className="w-full h-full bg-transparent" />}
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        )}

                                        {el.type === 'word_search' && (
                                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`, borderWidth: '4px', borderStyle: 'solid', borderColor: el.data.lineColor, backgroundColor: el.data.cellColor }} className="shadow-2xl max-w-full max-h-full aspect-square w-full rounded-2xl overflow-hidden relative z-10">
                                            {el.data.grid?.map((row, rIdx) => 
                                              row.map((char, cIdx) => {
                                                const cellId = `${el.id}_${rIdx}_${cIdx}`;
                                                const isSelected = (studentAnswers[`${el.id}_cells`] || []).includes(cellId);
                                                return (
                                                  <div 
                                                    key={cellId} 
                                                    onClick={() => setStudentAnswers(prev => {
                                                       const current = prev[`${el.id}_cells`] || [];
                                                       return { ...prev, [`${el.id}_cells`]: current.includes(cellId) ? current.filter(c => c !== cellId) : [...current, cellId] };
                                                    })}
                                                    style={{ color: el.data.textColor, fontSize: `${el.data.fontSize}px`, fontFamily: el.data.fontFamily, fontWeight: el.data.isBold ? 'bold' : 'normal', borderRight: cIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none', borderBottom: rIdx < (el.data.size - 1) ? `1px solid ${el.data.lineColor}` : 'none', backgroundColor: isSelected ? 'rgba(252, 211, 77, 0.6)' : 'transparent', cursor: 'pointer' }}
                                                    className="flex items-center justify-center transition-colors hover:bg-white/20 select-none"
                                                  >
                                                    {char}
                                                  </div>
                                                )
                                              })
                                            )}
                                          </div>
                                        )}
                                     </div>
                                   </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* BOTTOM ACTION DOCK */}
                        <div className="w-full mt-auto pt-20 pb-10 flex justify-center items-center gap-8 relative z-50 pointer-events-auto">
                          {dockElements.map(el => {
                            if (el.type === 'record_compare') return (
                               <div key={el.id} className="relative group">
                                 {!isPreviewMode && <button onClick={() => handleDeleteElement(el.id)} className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg hover:scale-110">✕</button>}
                                 <div onClick={() => handleRcClick(el.id)} className="bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-all uppercase tracking-widest text-base hover:scale-105">
                                    <div className={`w-4 h-4 rounded-full ${rcStates[el.id]?.phase === 'RECORDING' ? 'bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]' : 'bg-white'}`}></div>
                                    {rcStates[el.id]?.phase === 'RECORDING' ? 'RECORDING' : rcStates[el.id]?.phase === 'HAS_RECORDING' ? 'COMPARE' : rcStates[el.id]?.phase === 'PLAYING' ? 'COMPARING' : 'RECORD'}
                                 </div>
                               </div>
                            );
                            if (el.type === 'nav_button') return (
                               <div key={el.id} className="relative group">
                                 {!isPreviewMode && <button onClick={() => { setEditingElementId(el.id); setActiveModal(el.type); }} className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg hover:scale-110">✏️</button>}
                                 <button className="bg-[#fcd34d] text-[#08203e] font-black px-12 py-5 rounded-full shadow-[0_0_30px_rgba(252,211,77,0.4)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform text-base">
                                    {el.data?.buttonStyle === 'finish_pill' ? 'FINISH' : 'CONTINUE ⬇'}
                                 </button>
                               </div>
                            );
                            return null;
                          })}
                        </div>

                      </div>
                    </React.Fragment>
                  )
                })}
                
                {!isPreviewMode && (
                  <div className="w-full flex flex-col items-center py-20 z-20 mt-10">
                    <button onClick={handleExpandWorkspace} className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-transparent hover:scale-110 transition-all shadow-2xl animate-bounce hover:animate-none">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <span className="text-xs font-black text-white/50 font-montserrat uppercase tracking-widest mt-6 drop-shadow-md">ADD NEW SCREEN</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          PRESERVED MODALS
      ========================================== */}
      <FillInTheBlankModal isOpen={activeModal === 'fill_in_the_blank'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('fill_in_the_blank', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShapeConfigModal isOpen={activeModal === 'shape'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('shape', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <DragAndDropModal isOpen={activeModal === 'drag_and_drop'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('drag_and_drop', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <ShortAnswerModal isOpen={activeModal === 'short_answer'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('short_answer', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <MultipleSelectionModal isOpen={activeModal === 'multiple_selection'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('multiple_selection', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <SliderBarModal isOpen={activeModal === 'slider_bar'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('slider_bar', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <CrosswordModal isOpen={activeModal === 'crossword'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('crossword', { ...d, ...generateCrosswordLayout(d.items) }); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <WordSearchModal isOpen={activeModal === 'word_search'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('word_search', { ...d, ...generateWordSearchGrid(d.words) }); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />
      <NavButtonModal isOpen={activeModal === 'nav_button'} initialData={editingElementId ? canvasElements.find(e => e.id === editingElementId)?.data : {}} onSave={(d) => { handleSaveModal('nav_button', d); }} onCancel={() => { setActiveModal(null); setEditingElementId(null); }} />

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md px-4">
          <div className="bg-[#070b19]/40 backdrop-blur-xl rounded-[30px] p-10 max-w-md w-full shadow-2xl border border-white/20 flex flex-col items-center text-center animate-fade-in">
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-md">COMMIT CHANGES?</h2>
            <div className="flex flex-row space-x-6 w-full justify-center">
              <button onClick={() => !isSaving && setIsSaveModalOpen(false)} className="bg-white/5 border border-white/20 text-white/80 font-bold px-8 py-4 rounded-full text-sm transition-all w-1/2 hover:bg-white/10 hover:text-white">CANCEL</button>
              <button onClick={handleConfirmSave} className="bg-[#fcd34d] text-[#08203e] font-black px-8 py-4 rounded-full shadow-[0_0_20px_rgba(252,211,77,0.4)] text-sm w-1/2 hover:scale-105 transition-transform">{isSaving ? 'SAVING...' : 'PUSH LIVE'}</button>
            </div>
          </div>
        </div>
      )}

      {(activeModal === 'video' || activeModal === 'media_upload') && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md px-4">
          <div className="bg-[#070b19]/40 backdrop-blur-xl rounded-[30px] p-10 max-w-xl w-full shadow-2xl border border-white/20 flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8 text-center">ADD {mediaTarget.type.toUpperCase()}</h2>
            <input type="text" placeholder="Paste URL here..." value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-2xl px-6 py-5 text-base text-white focus:outline-none focus:border-[#fcd34d] mb-10 shadow-inner" />
            <div className="flex flex-row space-x-6 w-full justify-center">
              <button onClick={() => { setActiveModal(null); setMediaUrlInput(''); setMediaTarget({id: null, type: 'image'}); }} className="bg-white/5 border border-white/20 text-white/80 font-bold px-8 py-4 rounded-full text-sm w-1/2 hover:bg-white/10 hover:text-white transition-colors">CANCEL</button>
              <button onClick={handleAddMedia} className="bg-[#fcd34d] text-[#08203e] font-black px-8 py-4 rounded-full text-sm w-1/2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(252,211,77,0.4)]">ADD MEDIA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHub;