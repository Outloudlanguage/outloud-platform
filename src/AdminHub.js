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

// ==========================================
// DEDICATED PROVISIONING MODAL
// ==========================================
const ProvisioningModal = ({ isOpen, onClose, supabase, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Student');
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      // 1. Auth Edge Function - SENDING THE CORRECT PAYLOAD
      const { data: edgeData, error: authError } = await supabase.functions.invoke('provision-user', {
        body: { 
          email: cleanEmail, 
          password: password, 
          firstName: firstName,   // Make sure this matches your React state for "NOMBRES"
          lastName: lastName,     // Make sure this matches your React state for "APELLIDOS"
          whatsapp: whatsapp,     // Include the phone number from the form!
          role: role,
          level: level,           // Example: "A1", "B2"
          unit: unit              // Example: 1
        }
      });

      if (authError) {
        // If the Edge function fails, this forces it to print the exact rejection reason to the console
        console.error("EDGE FUNCTION REJECTION:", authError);
        throw new Error(`Fallo en Auth/Edge Function: ${authError.message}.`);
      }

       /*
      //  Safe Database Injection
      const updates = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        whatsapp: phone || null, 
        role: role,
        status: 'active',
        assigned_password: password
      };

      if (avatarUrl.trim() !== '') updates.avatar_url = avatarUrl.trim();
      
      if (role === 'Student') {
        updates.level = provLevel;
        updates.unit = provUnit;
        updates.cohort = provCohort;
        updates.available_credits = 4;
        const d = new Date();
        let nextBilling = new Date(d.getFullYear(), d.getMonth() + 1, provCohort);
        if (provCohort === 30 && nextBilling.getMonth() !== (d.getMonth() + 1) % 12) {
            nextBilling = new Date(d.getFullYear(), d.getMonth() + 2, 0); 
        }
        updates.next_billing_date = nextBilling.toISOString().split('T')[0];
      }

      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('email', cleanEmail)
        .select();

      if (updateError) {
        console.error("SUPABASE UPDATE ERROR:", updateError);
        alert(`Profile Update Failed: ${updateError.message}`);
      } else if (!updateData || updateData.length === 0) {
        console.warn("WARNING: Profile row not found. Trigger missing or RLS blocked.");
        alert("The login was created, but the profile data couldn't be saved. Check console.");
      }
      */

      // 3. Log the Payment in the Ledger safely
      if (role === 'Student') {
        const { data: userRecords } = await supabase.from('profiles').select('id').eq('email', cleanEmail);
        const studentId = userRecords && userRecords.length > 0 ? userRecords[0].id : null;

        if (studentId) {
          await supabase.from('student_payments').insert({
            student_id: studentId,
            payment_type: 'Initial Enrollment (Prorated)',
            amount: proratedDue,
            reference_number: payRef,
            status: 'verified' 
          });
        }
      }

      alert(`Cuenta aprovisionada exitosamente.`);
      if (onSuccess) onSuccess();
      onClose();
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
// PAN & ZOOM IMAGE COMPONENT (Preserved)
// ==========================================
const PanZoomImage = ({ src, data, onSave, isPreview, wrapperClass = "w-full h-64" }) => {
  const [zoom, setZoom] = useState(data?.zoom || 1);
  const [pan, setPan] = useState({ x: data?.panX || 0, y: data?.panY || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setZoom(data?.zoom || 1);
    setPan({ x: data?.panX || 0, y: data?.panY || 0 });
  }, [data?.zoom, data?.panX, data?.panY]);

  const handleWheel = (e) => {
    if (isPreview) return;
    e.preventDefault();
    const newZoom = Math.max(1, Math.min(zoom + (e.deltaY < 0 ? 0.1 : -0.1), 5));
    setZoom(newZoom);
    if (onSave) onSave({ zoom: newZoom, panX: pan.x, panY: pan.y });
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
    if (onSave) onSave({ zoom, panX: pan.x, panY: pan.y });
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={`overflow-hidden relative bg-black/20 ${wrapperClass}`} onWheel={handleWheel}>
      <img 
        src={src} 
        alt="media" 
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full object-cover ${isPreview ? '' : 'cursor-move'} touch-none`}
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp} 
        onPointerCancel={handlePointerUp}
        style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }} 
      />
      {!isPreview && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-md pointer-events-none uppercase tracking-widest shadow-md">
          Scroll: Zoom | Drag: Pan
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

const NavIconBtn = ({ iconUrl, active, onClick, hasNotification, isProfile }) => (
  <button onClick={onClick} className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-white/10 border border-white/20 shadow-inner' : 'hover:bg-white/5 border border-transparent'}`}>
    {hasNotification && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#070b19] z-10 animate-pulse"></div>}
    {isProfile ? (
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white/50 bg-gray-300">
        <img src="https://i.pravatar.cc/150?img=32" alt="Admin" className="w-full h-full object-cover" />
      </div>
    ) : (
      <img src={iconUrl} alt="Nav Icon" className={`w-8 h-8 md:w-9 md:h-9 object-contain transition-all duration-300 ${active ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-80'}`} />
    )}
  </button>
);

// ==========================================
// MAIN ADMIN HUB COMPONENT
// ==========================================
const AdminHub = () => {
  const [activeModule, setActiveModule] = useState('ACCOUNTS');

  const [directoryTab, setDirectoryTab] = useState('students');
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);

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
        const liveNode = document.querySelector(`#element-${el.id} .rich-text-content`);
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
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden h-[35%]">
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
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col h-[65%]">
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

      <div className="col-span-3 flex flex-col gap-6 h-full">
        {/* ADDED 'isolate' TO FIX HORIZONTAL BACKDROP-BLUR ARTIFACT */}
        <div onClick={() => setIsProvisioningModalOpen(true)} className="isolate flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center relative cursor-pointer hover:bg-white/10 transition-colors group">
          <svg className="w-24 h-24 mb-6 text-white drop-shadow-md group-hover:scale-110 transition-transform relative z-10" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 19v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="10" cy="7" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 8v6M17 11h6" />
          </svg>
          <h3 className="text-white font-black text-xl md:text-2xl tracking-widest uppercase text-center relative z-10">Provisioning</h3>
        </div>
        
        {/* ADDED 'isolate' TO FIX HORIZONTAL BACKDROP-BLUR ARTIFACT */}
        <div onClick={() => alert('Módulo de Estadísticas en construcción...')} className="isolate flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center relative cursor-pointer hover:bg-white/10 transition-colors group">
          <svg className="w-24 h-24 mb-6 text-white drop-shadow-md group-hover:scale-110 transition-transform relative z-10" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16v-4m4 4v-7m4 7V8m0 0l-4 4m4-4l-4-4" />
          </svg>
          <h3 className="text-white font-black text-xl md:text-2xl tracking-widest uppercase text-center relative z-10">Stats</h3>
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
                  <img src={user.avatar_url || `https://i.pravatar.cc/150?img=${i+10}`} className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-[#fcd34d] transition-colors object-cover shadow-md shrink-0" alt="User" />
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

  const renderCalendars = () => (
    <div className="grid grid-cols-12 gap-6 w-full max-w-[1500px] h-[calc(100vh-160px)] animate-fade-in">
      <div className="col-span-3 flex flex-col gap-6 h-full">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden h-[35%]">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0 mb-2">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="#fcd34d" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (90 / 100) * (2 * Math.PI * 40)} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white leading-none drop-shadow-md">90%</span>
            </div>
          </div>
          <h3 className="text-white/90 font-bold text-xs tracking-widest uppercase text-center mt-2 whitespace-nowrap">STUDENTS BOOKED</h3>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col h-[65%]">
          <h3 className="text-white font-black text-2xl tracking-wide mb-4 drop-shadow-md shrink-0">Session stats</h3>
          <ul className="space-y-4 text-xs font-medium text-white/90 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
            <li className="flex items-center justify-between"><div className="flex items-center gap-3"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V3a1 1 0 00-2 0v1H8V3a1 1 0 00-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 20V9h14v11H5z" /></svg><span>Aug 15: 45 minutes</span></div><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span></li>
            <li className="flex items-center justify-between"><div className="flex items-center gap-3"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V3a1 1 0 00-2 0v1H8V3a1 1 0 00-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 20V9h14v11H5z" /></svg><span>Aug 18: 44 minutes</span></div><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></span></li>
            <li className="flex items-center justify-between"><div className="flex items-center gap-3"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V3a1 1 0 00-2 0v1H8V3a1 1 0 00-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 20V9h14v11H5z" /></svg><span>Aug 25: 46 minutes</span></div><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></span></li>
            <li className="flex items-center justify-between"><div className="flex items-center gap-3"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V3a1 1 0 00-2 0v1H8V3a1 1 0 00-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 20V9h14v11H5z" /></svg><span>Aug 15: 40 minutes</span></div><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span></li>
          </ul>
          <button className="w-full py-4 bg-[#e2e8f0] text-[#0f172a] hover:bg-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-105 shrink-0 mt-auto">
            <img src="https://i.postimg.cc/mrtXmB72/Copia-de-Diseno-sin-titulo-(2).png" alt="Substitute" className="w-6 h-6 object-contain" />
            <span>REQUEST SUBSTITUTE</span>
          </button>
        </div>
      </div>
      <div className="col-span-9 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-full overflow-hidden relative">
        {/* Calendar Top Header Actions */}
        <div className="absolute top-8 right-8 flex gap-4 z-10">
          <div className="bg-black/30 rounded-xl flex items-center shadow-inner">
            <button className="px-3 py-2 text-white/50 hover:text-white font-bold">&lt;</button>
            <span className="px-4 text-sm font-black text-white tracking-widest uppercase">Octubre</span>
            <button className="px-3 py-2 text-white/50 hover:text-white font-bold">&gt;</button>
          </div>
          <div className="bg-black/30 rounded-xl flex items-center shadow-inner">
            <button className="px-3 py-2 text-white/50 hover:text-white font-bold">&lt;</button>
            <span className="px-4 text-sm font-black text-white tracking-widest uppercase">Semana</span>
            <button className="px-3 py-2 text-white/50 hover:text-white font-bold">&gt;</button>
          </div>
        </div>

        <div className="flex bg-black/20 rounded-2xl p-2 mb-6 w-fit shadow-inner">
          <button className="px-6 py-2.5 bg-white/20 rounded-xl font-bold text-xs text-white shadow-md uppercase tracking-widest">Live Labs</button>
          <button className="px-6 py-2.5 text-white/50 hover:text-white font-bold text-xs transition-colors uppercase tracking-widest">Tutoring</button>
          <button className="px-6 py-2.5 text-white/50 hover:text-white font-bold text-xs transition-colors uppercase tracking-widest">Socials</button>
          <button className="px-6 py-2.5 text-white/50 hover:text-white font-bold text-xs transition-colors uppercase tracking-widest">Teacher</button>
          <button className="px-6 py-2.5 text-white/50 hover:text-white font-bold text-xs transition-colors uppercase tracking-widest">Overall</button>
        </div>

        {/* Master Grid Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-white/10 pt-4 flex flex-col">
          <div className="grid grid-cols-7 gap-2 text-center mb-4 sticky top-0 bg-[#070b19]/80 backdrop-blur-md z-10 py-2 rounded-xl">
            {['LUN 11', 'MAR 12', 'MIE 13', 'JUE 14', 'VIE 15', 'SAB 16', 'DOM 17'].map(d => (
              <div key={d} className="text-xs font-black text-white/50 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 pb-10">
            {['3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm'].map(time => (
              <React.Fragment key={time}>
                {[0,1,2,3,4,5,6].map(day => {
                  let bgColor = 'bg-black/20 text-white/50';
                  let cursor = 'cursor-default';
                  let shadow = '';
                  
                  // Mock Logic based on image
                  if (time === '3:00 pm' && day === 1) { bgColor = 'bg-[#fcd34d] text-[#08203e] scale-105 z-10'; cursor='cursor-pointer'; shadow='shadow-[0_0_15px_rgba(252,211,77,0.4)]'; }
                  if (time === '4:00 pm' && day === 3) { bgColor = 'bg-[#fcd34d] text-[#08203e] scale-105 z-10'; cursor='cursor-pointer'; shadow='shadow-[0_0_15px_rgba(252,211,77,0.4)]'; }
                  if (time === '6:00 pm' && day === 6) { bgColor = 'bg-[#fcd34d] text-[#08203e] scale-105 z-10'; cursor='cursor-pointer'; shadow='shadow-[0_0_15px_rgba(252,211,77,0.4)]'; }
                  if (time === '7:00 pm' && (day === 0 || day === 2)) { bgColor = 'bg-blue-500 text-white scale-105 z-10'; cursor='cursor-pointer'; shadow='shadow-[0_0_15px_rgba(59,130,246,0.4)]'; }
                  if (time === '3:00 pm' && day === 5) { bgColor = 'bg-purple-500 text-white scale-105 z-10'; cursor='cursor-pointer'; shadow='shadow-[0_0_15px_rgba(168,85,247,0.4)]'; }

                  return (
                    <div key={`${day}-${time}`} className={`h-12 rounded-xl border border-white/5 flex items-center justify-center text-xs font-bold transition-all ${bgColor} ${cursor} ${shadow}`}>
                      {time}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="flex flex-col w-full max-w-[1500px] h-[calc(100vh-160px)] animate-fade-in relative z-10">
      {/* Sub Navigation */}
      <div className="flex bg-white/5 backdrop-blur-xl rounded-full p-2 mb-8 shadow-2xl w-fit mx-auto border border-white/10 overflow-x-auto max-w-full">
        {['General', 'Staff', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Chat', 'Forum'].map((tab, i) => (
          <button key={tab} className={`px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${i===0 ? 'bg-[#fcd34d] text-[#08203e] shadow-md scale-105' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Communications Content Layout */}
      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Composer Left */}
        <div className="col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-fit">
          <div className="flex gap-4 mb-6">
            <button className="w-32 h-32 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0">
              <span className="text-5xl font-light leading-none mb-2">+</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">UPLOAD<br/>IMAGE</span>
            </button>
            <textarea placeholder="Choose your filter and start typing here." className="flex-1 bg-white/5 border border-white/20 rounded-2xl p-4 text-white resize-none focus:outline-none focus:border-[#fcd34d] placeholder-white/30"></textarea>
          </div>
          <div className="flex gap-4">
            <AdminDropdown placeholder="CATEGORY" options={['Website Functionality', 'General Information', 'Academy Rules', 'Upcoming Events', 'Promos & Discounts', 'Financial Data']} value="" onChange={()=>{}} />
            <button className="flex-1 bg-white/20 hover:bg-[#fcd34d] hover:text-[#08203e] text-white font-black rounded-xl uppercase tracking-widest transition-colors shadow-lg">
              PUBLISH
            </button>
          </div>
        </div>

        {/* Feed Right */}
        <div className="col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col gap-4">
          
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center gap-6 relative group hover:bg-white/20 transition-colors">
            <button className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30 hover:text-white">✏️</button>
            <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-white/30 shadow-md">
              <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=400" alt="Game Night" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-lg font-black uppercase tracking-widest mb-2 text-white drop-shadow-sm">SOCIAL CLUB: GAME NIGHT</h4>
              <p className="text-xs text-white/80 leading-relaxed font-medium pr-8">We're happy to announce that very soon we will be hosting our live game-night. Don't miss it, check out the calendar, look for the green box and claim your spot.</p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 relative group hover:bg-white/20 transition-colors text-center">
            <button className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30 hover:text-white">✏️</button>
            <h4 className="text-lg font-black uppercase tracking-widest mb-3 text-white drop-shadow-sm">DID YOU CHECK THE OPEN FORUM?</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium px-8">The latest post on the open forum is already being commented on. Everyone is waiting for you to share your opinion; go and see it for yourself, and remember, be friendly to everyone. Happy posting!</p>
          </div>

        </div>
      </div>
    </div>
  );

  const renderFinances = () => (
    <div className="grid grid-cols-12 gap-8 w-full max-w-[1500px] h-[calc(100vh-160px)] animate-fade-in relative z-10">
      <div className="col-span-3 flex flex-col gap-8 h-full justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center relative h-[45%] justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0 mb-4">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="#fcd34d" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (90 / 100) * (2 * Math.PI * 40)} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-white drop-shadow-md">90%</span>
            </div>
          </div>
          <h3 className="text-white/90 font-black text-lg tracking-widest uppercase text-center mt-2">Renewals</h3>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center relative h-[45%] justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0 mb-4 cursor-pointer hover:scale-105 transition-transform group">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (45 / 100) * (2 * Math.PI * 40)} strokeLinecap="round" className="group-hover:stroke-blue-400 transition-colors" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-white drop-shadow-md">45%</span>
            </div>
          </div>
          <h3 className="text-white/90 font-black text-lg tracking-widest uppercase text-center mt-2 whitespace-nowrap">Profit Margin</h3>
        </div>
      </div>

      <div className="col-span-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-full items-center justify-center">
        {/* MOCKUP BAR CHART FOR EXPECTED VS COLLECTED */}
        <div className="flex gap-6 mb-10 w-full justify-center">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-600"></span><span className="text-sm font-bold text-white/70">Expected</span></div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#fcd34d]"></span><span className="text-sm font-bold text-white/70">Collected</span></div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-400"></span><span className="text-sm font-bold text-white/70">Paid</span></div>
        </div>
        <div className="w-full h-[60%] flex items-end justify-center gap-10 px-8 border-b border-l border-white/20 pb-4 relative">
          <div className="absolute -left-10 top-0 text-xs font-bold text-white/40">3,000</div>
          <div className="absolute -left-10 top-1/2 text-xs font-bold text-white/40">1,500</div>
          
          <div className="flex items-end gap-2 h-full">
            <div className="w-12 bg-slate-600 rounded-t-lg h-[80%] hover:brightness-110 transition-all cursor-pointer"></div>
            <div className="w-12 bg-[#fcd34d] rounded-t-lg h-[40%] hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(252,211,77,0.3)]"></div>
            <div className="w-12 bg-red-400 rounded-t-lg h-[20%] hover:brightness-110 transition-all cursor-pointer"></div>
          </div>
          <div className="flex items-end gap-2 h-full">
            <div className="w-12 bg-slate-600 rounded-t-lg h-[85%] hover:brightness-110 transition-all cursor-pointer"></div>
            <div className="w-12 bg-[#fcd34d] rounded-t-lg h-[82%] hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(252,211,77,0.3)]"></div>
            <div className="w-12 bg-red-400 rounded-t-lg h-[35%] hover:brightness-110 transition-all cursor-pointer"></div>
          </div>
          <div className="flex items-end gap-2 h-full">
            <div className="w-12 bg-slate-600 rounded-t-lg h-[75%] hover:brightness-110 transition-all cursor-pointer"></div>
            <div className="w-12 bg-[#fcd34d] rounded-t-lg h-[70%] hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(252,211,77,0.3)]"></div>
            <div className="w-12 bg-red-400 rounded-t-lg h-[30%] hover:brightness-110 transition-all cursor-pointer"></div>
          </div>
        </div>
        <div className="w-full flex justify-center gap-32 mt-4 text-white/70 font-bold uppercase tracking-widest text-sm pr-12">
          <span>Ene</span><span>Feb</span><span>Mar</span>
        </div>
      </div>

      <div className="col-span-3 flex flex-col gap-6 h-full justify-center">
        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center">
          <h4 className="text-white font-black text-xl tracking-widest uppercase drop-shadow-md">Gross Revenue</h4>
          <span className="text-5xl font-black text-[#fcd34d] mt-2 drop-shadow-lg">$5,230</span>
        </div>
        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
          <h4 className="text-white font-black text-xl tracking-widest uppercase drop-shadow-md text-center leading-tight">Payroll<br/>Liability</h4>
          <span className="text-5xl font-black text-red-400 mt-2 drop-shadow-lg">$1,180</span>
        </div>
        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center">
          <h4 className="text-white font-black text-xl tracking-widest uppercase drop-shadow-md">Net Profit</h4>
          <span className="text-5xl font-black text-green-400 mt-2 drop-shadow-lg">$3,370</span>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex items-center justify-center w-full h-[calc(100vh-160px)] animate-fade-in relative z-10">
      <div className="grid grid-cols-4 gap-8 max-w-[1200px] w-full">
        {['Tenants', 'Public logs', 'Shifts', 'Evaluator', 'Reports', 'B2B Clients', 'Resumes', 'Language'].map((setting, i) => (
          <button key={setting} className="aspect-square bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 shadow-2xl flex flex-col items-center justify-center gap-6 hover:bg-white/10 hover:scale-105 transition-all group">
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

      {isProvisioningModalOpen && (
        <ProvisioningModal 
          isOpen={isProvisioningModalOpen} 
          onClose={() => setIsProvisioningModalOpen(false)} 
          supabase={supabase} 
          onSuccess={() => fetchDirectory(directoryTab)} 
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
        <NavIconBtn isProfile />
        <div className="w-12 h-px bg-white/10 my-2 shrink-0"></div>
        <NavIconBtn iconUrl={navIcons.accounts} active={activeModule === 'ACCOUNTS'} onClick={() => setActiveModule('ACCOUNTS')} />
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
            <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-12 object-contain drop-shadow-md" />
            <div className="h-10 w-[2px] bg-white/20"></div>
            <span className="text-3xl font-light text-white tracking-widest uppercase drop-shadow-sm">{activeModule}</span>
          </div>
        )}

        {/* DYNAMIC MODULE RENDERING */}
        {activeModule === 'ACCOUNTS' && renderAccounts()}
        {activeModule === 'CALENDARS' && renderCalendars()}
        {activeModule === 'COMMUNICATIONS' && renderCommunications()}
        {activeModule === 'FINANCES' && renderFinances()}
        {activeModule === 'SETTINGS' && renderSettings()}
        
        {/* ==========================================
            CONTENTS MODULE (PRESERVED LOGIC)
        ========================================== */}
        {activeModule === 'CONTENTS' && (
          <div className="relative z-10 flex flex-col w-full flex-grow">
            {!isPreviewMode && (
              <div className="fixed top-0 left-28 right-0 z-[150] bg-[#070b19]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl flex items-center px-8 py-4 gap-6">
                <div className="flex items-center gap-4 shrink-0 border-r border-white/10 pr-6">
                  <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 object-contain opacity-100" />
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
                  <AdminDropdown placeholder="LEVEL" options={LEVEL_OPTIONS} value={selectedLevel} onChange={setSelectedLevel} />
                  <AdminDropdown placeholder="UNIT" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} />
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
                                       <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#070b19]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center gap-2 shadow-2xl whitespace-nowrap text-white z-[100]">
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('bold')}} className="px-4 py-2 font-bold hover:bg-white/10 rounded-xl">B</button>
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('italic')}} className="px-4 py-2 italic hover:bg-white/10 rounded-xl">I</button>
                                          <button onMouseDown={(e)=>{e.preventDefault(); formatText('underline')}} className="px-4 py-2 underline hover:bg-white/10 rounded-xl">U</button>
                                          <div className="w-px h-6 bg-white/20 my-auto mx-2"></div>
                                          <input type="color" onInput={(e)=>formatText('foreColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                                          <select onChange={(e)=>formatText('fontName', e.target.value)} className="bg-[#070b19] border border-white/20 rounded-xl px-3 py-2 text-sm outline-none ml-2">
                                             <option value="Montserrat" className="text-white">Montserrat</option>
                                             <option value="Arial" className="text-white">Arial</option>
                                             <option value="Times New Roman" className="text-white">Times New Roman</option>
                                          </select>
                                          <select onChange={(e)=>formatText('fontSize', e.target.value)} className="bg-[#070b19] border border-white/20 rounded-xl px-3 py-2 text-sm outline-none ml-2">
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