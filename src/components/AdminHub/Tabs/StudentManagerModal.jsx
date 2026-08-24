import React, { useState, useEffect } from 'react';
import { LEVEL_OPTIONS } from '../../../constants/adminConfigs';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const StudentManagerModal = ({ isOpen, onClose, userData, isPending, supabase, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('INFO_PERSONAL');

  // ==========================================
  // TAB 1: INFO PERSONAL (Provisioning, Creds, Overrides)
  // ==========================================
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provFirstName, setProvFirstName] = useState('');
  const [provLastName, setProvLastName] = useState('');
  const [provPhone, setProvPhone] = useState(''); 
  const [provAvatarUrl, setProvAvatarUrl] = useState(''); // NEW: URL-based Avatar
  
  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState(''); // NEW: Edit Existing Avatar
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountStatus, setAccountStatus] = useState('active');

  // Academic Overrides State
  const [levelOverride, setLevelOverride] = useState('A1: Básico 1');
  const [unitOverride, setUnitOverride] = useState(1);

  // ==========================================
  // TAB 2: FINANZAS (Cohorts, Proration, Credits, Payments)
  // ==========================================
  const getDefaultCohort = () => new Date().getDate() <= 15 ? 15 : 30;
  const [cohort, setCohort] = useState(15);
  const [credits, setCredits] = useState(0);
  
  const [payType, setPayType] = useState('Mensualidad');
  const [payAmount, setPayAmount] = useState(40);
  const [payRef, setPayRef] = useState('');
  const [payFile, setPayFile] = useState(null);

  // ==========================================
  // TAB 3: ESTADISTICAS (Reporting Engine)
  // ==========================================
  const [academicHistory, setAcademicHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // ADJUST THESE MONTHLY PRICES AS NEEDED FOR YOUR BUSINESS
  const MONTHLY_PRICES = { A1: 40, A2: 45, B1: 50, B2: 55, C1: 60, C2: 65 };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  useEffect(() => {
    if (userData) {
      setProvEmail(userData.email || '');
      setProvPassword('');
      setProvAvatarUrl(userData.avatar_url || '');
      
      const nameParts = (userData.full_name || '').trim().split(' ');
      setProvFirstName(userData.first_name || nameParts[0] || '');
      setProvLastName(userData.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''));
      
      // Load existing whatsapp or fallback to phone
      setProvPhone(userData.whatsapp || userData.phone || ''); 

      setIsProvisioning(false);
      
      setEditEmail(userData.email || '');
      setEditPassword(userData.assigned_password || '');
      setEditAvatarUrl(userData.avatar_url || '');
      setIsEditingCreds(false);
      
      setAccountStatus(userData.status || 'active');
      setLevelOverride(userData.level || 'A1: Básico 1');
      setUnitOverride(userData.unit || 1);

      setCohort(userData.cohort || getDefaultCohort());
      setCredits(userData.available_credits || 0);

      setActiveTab('INFO_PERSONAL');
      updatePrice(payType, userData.level || 'A1: Básico 1');
    }
  }, [userData]);

  useEffect(() => {
    if (isOpen && !isPending && userData?.id && activeTab === 'ESTADISTICAS' && !userData.id.startsWith('mock')) {
      fetchAcademicHistory();
    }
  }, [isOpen, isPending, userData, activeTab]);

  // ==========================================
  // ACADEMIC LOGIC
  // ==========================================
  const fetchAcademicHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('academic_records')
        .select(`*, teacher:profiles!teacher_id(first_name, last_name)`)
        .eq('student_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAcademicHistory(data || []);
    } catch (error) {
      console.error("Error fetching academic history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Reporte académico generado para ${userData?.first_name} ${userData?.last_name}. (La descarga de PDF se conectará aquí).`);
    }, 2000);
  };

  const handleSaveOverrides = async () => {
    setIsProcessing(true);
    try {
      if (userData.id.startsWith('mock')) { if(onSuccess) onSuccess(); return; }
      const { error } = await supabase.from('profiles').update({ level: levelOverride, unit: unitOverride }).eq('id', userData.id);
      if (error) throw error;
      alert("Overrides Académicos Guardados Exitosamente.");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error guardando los overrides.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // FINANCIAL LOGIC
  // ==========================================
  const getBaseLevel = (lvlString) => lvlString ? lvlString.split(':')[0].trim() : 'A1';

  const updatePrice = (type, levelString) => {
    if (type === 'Extra') setPayAmount(12);
    else setPayAmount(MONTHLY_PRICES[getBaseLevel(levelString)] || 40);
  };

  const handlePayTypeChange = (e) => {
    const newType = e.target.value;
    setPayType(newType);
    updatePrice(newType, levelOverride);
  };

  const calculateProration = (targetCohort, price) => {
    const today = new Date();
    let nextBilling = new Date(today.getFullYear(), today.getMonth(), targetCohort);
    if (today.getDate() >= targetCohort) nextBilling.setMonth(nextBilling.getMonth() + 1);
    const daysLeft = Math.max(0, Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24)));
    return ((price / 30) * daysLeft).toFixed(2);
  };

  const proratedDue = calculateProration(cohort, MONTHLY_PRICES[getBaseLevel(levelOverride)] || 40);

  const handleSaveCohort = async () => {
    setIsProcessing(true);
    try {
      if (userData.id.startsWith('mock')) { if(onSuccess) onSuccess(); return; }
      const today = new Date();
      let nextBilling = new Date(today.getFullYear(), today.getMonth(), cohort);
      if (today.getDate() >= cohort) nextBilling.setMonth(nextBilling.getMonth() + 1);

      const { error } = await supabase.from('profiles').update({ 
        cohort: cohort, 
        next_billing_date: nextBilling.toISOString().split('T')[0] 
      }).eq('id', userData.id);
      
      if (error) throw error;
      alert(`Cohorte actualizada al día ${cohort}. Se debe cobrar el prorrateo de $${proratedDue}.`);
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      alert("Error actualizando la cohorte.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    const newCredits = credits + 1;
    setCredits(newCredits);
    if (userData.id.startsWith('mock')) return;
    try {
      await supabase.from('profiles').update({ available_credits: newCredits }).eq('id', userData.id);
      await supabase.from('financial_logs').insert({
        student_id: userData.id,
        type: 'refund',
        description: '+1 Credit (Academy Fault)',
        amount: 0
      });
      if (onSuccess) onSuccess();
    } catch(e) { console.error(e); alert("Error procesando el reembolso."); }
  };

  const calculateNextBillingDate = () => {
    const d = new Date();
    let nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, cohort);
    if (cohort === 30 && nextMonth.getMonth() !== (d.getMonth() + 1) % 12) {
        nextMonth = new Date(d.getFullYear(), d.getMonth() + 2, 0); 
    }
    return nextMonth.toISOString().split('T')[0];
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payRef || !payFile) { alert("Debes incluir un número de referencia y el comprobante de pago."); return; }

    setIsProcessing(true);
    try {
      if (userData.id.startsWith('mock')) {
         alert("Simulación de pago en datos de prueba exitosa.");
         setIsProcessing(false);
         return;
      }

      const fileExt = payFile.name.split('.').pop();
      const fileName = `${userData.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('payment_proofs').upload(fileName, payFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('payment_proofs').getPublicUrl(fileName);

      const { error: ledgerError } = await supabase.from('student_payments').insert({
        student_id: userData.id,
        payment_type: payType === 'Mensualidad' ? 'Monthly Subscription' : 'Extra Credits',
        amount: payAmount,
        reference_number: payRef,
        proof_image_url: publicUrl,
        status: 'verified' 
      });
      if (ledgerError) throw ledgerError;

      const newCredits = payType === 'Mensualidad' ? 4 : credits + 2;
      const updates = { available_credits: newCredits };

      if (payType === 'Mensualidad') {
        updates.next_billing_date = calculateNextBillingDate();
      }

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', userData.id);
      if (profileError) throw profileError;

      setCredits(newCredits);
      alert("Pago registrado y créditos aplicados exitosamente.");
      setPayRef('');
      setPayFile(null);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Hubo un error procesando el pago. Revisa los permisos del bucket de Storage.");
    } finally {
      setIsProcessing(false);
    }
  };


  // ==========================================
  // ACCOUNT CONTROL LOGIC (Auth & DB Link)
  // ==========================================
  const handleProvisionAccount = async () => {
    if (!provEmail || !provPassword || !provFirstName || !provLastName) { 
      alert("Nombres, apellidos, correo y contraseña son obligatorios."); 
      return; 
    }
    
    setIsProcessing(true);
    try {
      if (userData?.id?.startsWith('mock')) {
        alert('Modo de Prueba: Cuenta simulada aprovisionada exitosamente.');
        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      const cleanEmail = provEmail.trim().toLowerCase();
      const fullName = `${provFirstName.trim()} ${provLastName.trim()}`;

      // 1. Edge Function with STRICT Payload (Bypassing 400 error handling if needed)
      const { error: authError } = await supabase.functions.invoke('provision-user', {
        body: { 
          email: cleanEmail, 
          password: provPassword, 
          fullName: fullName, 
          role: 'student' 
        }
      });
      
      if (authError) {
         console.warn("Edge Function catch: Proceeding to DB injection...", authError);
      }

      // 2. Exact DB Injection mapping to the correct 'whatsapp' column
      const updates = {
          first_name: provFirstName.trim(),
          last_name: provLastName.trim(),
          whatsapp: provPhone || null, // STRICTLY TARGETING WHATSAPP
          role: 'student',
          status: 'active',
          level: levelOverride, 
          unit: unitOverride,
          cohort: cohort,
          available_credits: 0,              
          assigned_password: provPassword 
      };

      if (provAvatarUrl.trim() !== '') {
          updates.avatar_url = provAvatarUrl.trim();
      }

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('email', cleanEmail); 
        
      if (profileError) throw new Error(`Fallo en la Base de Datos: ${profileError.message}`);

      // 3. Approve Registration Lead
      const { error: regError } = await supabase.from('registrations').update({ status: 'approved' }).eq('id', userData.id);
      if (regError) console.warn("No se pudo actualizar la tabla registrations, pero el perfil fue creado.");

      alert('Cuenta aprovisionada exitosamente. El estudiante ya está activo en el directorio.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Provisioning Fatal Error:", error);
      alert(`Error Crítico:\n\n${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!editEmail || !editPassword) { alert("El correo y contraseña no pueden estar vacíos."); return; }

    setIsProcessing(true);
    try {
      if (userData.id.startsWith('mock')) {
         alert("Simulación de cambio de credenciales en datos de prueba exitosa.");
         setIsEditingCreds(false);
         setIsProcessing(false);
         return;
      }

      const { error: authError } = await supabase.functions.invoke('manage-credentials', {
        body: { userId: userData.id, email: editEmail, password: editPassword }
      });
      if (authError) throw authError;

      const updates = { email: editEmail, assigned_password: editPassword };
      if (editAvatarUrl.trim() !== '') {
         updates.avatar_url = editAvatarUrl.trim();
      }

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', userData.id);
      if (profileError) throw profileError;

      alert("Credenciales actualizadas correctamente.");
      setIsEditingCreds(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Credential Update Error:", error);
      alert(`Error al actualizar credenciales: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKillSwitch = async (newStatus) => {
    const isConfirm = window.confirm(
      newStatus === 'suspended' ? '¿Estás seguro de que deseas SUSPENDER el acceso de este estudiante?' : '¿Deseas REACTIVAR el acceso de este estudiante?'
    );
    if (!isConfirm) return;

    setIsProcessing(true);
    try {
      if (userData.id.startsWith('mock')) {
         setAccountStatus(newStatus);
         setIsProcessing(false);
         return;
      }

      const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userData.id);
      if (error) throw error;
      setAccountStatus(newStatus);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Kill Switch Error:", error);
      alert('Hubo un error al cambiar el estado del usuario.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') onClose();
  };

  if (!isOpen || !userData) return null;

  const isPastDue = userData.next_billing_date && new Date(userData.next_billing_date) < new Date();

  return (
    <div id="modal-overlay" onClick={handleOverlayClick} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in font-montserrat">
      
      {/* CSS INJECTION FOR THE PHONE INPUT TO ENSURE DARK STYLING */}
      <style>{`
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

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#070b19]/95 border border-white/20 rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-up">
        
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#fcd34d]/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>

        {/* HEADER */}
        <div className="relative z-10 flex items-start justify-between p-6 md:p-8 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-5 overflow-hidden w-full pr-4">
            <div className="relative shrink-0">
              <img 
                src={userData.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile Avatar" 
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 shadow-lg ${isPending ? 'border-amber-400' : accountStatus === 'suspended' ? 'border-red-500 opacity-50 grayscale' : 'border-white/20'}`}
              />
              {isPending && <div className="absolute -bottom-2 -right-2 bg-amber-400 text-[#08203e] text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-md animate-pulse">PENDING</div>}
              {accountStatus === 'suspended' && <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-md">SUSPENDED</div>}
            </div>
            <div className="flex flex-col overflow-hidden w-full">
              <h2 className={`text-xl md:text-2xl font-black tracking-wide drop-shadow-md truncate ${accountStatus === 'suspended' ? 'text-white/50' : 'text-white'}`}>
                {userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Sin Nombre'}
              </h2>
              <p className="text-xs md:text-sm text-white/60 font-semibold mt-1 truncate">{userData.email} {userData.whatsapp ? `• ${userData.whatsapp}` : ''}</p>
              {!isPending && (
                <p className="text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest mt-1">
                  NIVEL: {levelOverride.split(':')[0]} • CRÉDITOS: <span className="text-white">{credits}</span>
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all hover:rotate-90 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* TABS */}
        <div className="relative z-10 flex flex-wrap border-b border-white/10 bg-black/20 shrink-0">
          {[
            { id: 'INFO_PERSONAL', label: 'Info Personal & Control' },
            { id: 'FINANZAS', label: 'Manejo de Finanzas' },
            { id: 'ESTADISTICAS', label: 'Estadísticas del Alumno' }
          ].map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id ? 'border-[#fcd34d] text-[#fcd34d] bg-white/5' : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="relative z-10 flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8">
          
          {/* ==================================================== */}
          {/* TAB 1: INFO PERSONAL                                 */}
          {/* ==================================================== */}
          {activeTab === 'INFO_PERSONAL' && (
            <div className="animate-fade-in space-y-6">
              
              {/* Provisioning Block for Pending Leads */}
              {isPending && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 transition-all shadow-inner">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 border-b border-amber-500/20 pb-4">
                    <div>
                      <h4 className="text-amber-400 font-black tracking-widest text-sm uppercase">Aprobación de Cuenta</h4>
                      <p className="text-xs text-amber-200/70 mt-1">Verifica la información y asigna las credenciales maestras para activar a este estudiante.</p>
                    </div>
                  </div>

                  {/* URL AVATAR UPLOAD UI */}
                  <div className="flex flex-col md:flex-row gap-6 items-center bg-black/20 border border-amber-500/20 p-5 rounded-2xl mb-6">
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className="w-20 h-20 rounded-full border-2 border-amber-500/30 overflow-hidden bg-black/40 flex items-center justify-center">
                        {provAvatarUrl ? (
                          <img src={provAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl text-amber-500/30">+</span>
                        )}
                      </div>
                      {provAvatarUrl && (
                        <button type="button" onClick={() => setProvAvatarUrl('')} className="text-[9px] text-red-400 font-bold uppercase tracking-widest hover:text-red-300 transition-colors">
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-2">URL Foto de Perfil (Opcional)</label>
                      <input type="text" value={provAvatarUrl} onChange={e => setProvAvatarUrl(e.target.value)} placeholder="Pega el enlace de la imagen aquí..." className="w-full bg-black/30 border border-amber-500/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Nombres</label>
                      <input type="text" value={provFirstName} onChange={e => setProvFirstName(e.target.value)} className="w-full bg-black/30 border border-amber-500/30 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Apellidos</label>
                      <input type="text" value={provLastName} onChange={e => setProvLastName(e.target.value)} className="w-full bg-black/30 border border-amber-500/30 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Email Registrado</label>
                      <input type="email" value={provEmail} onChange={(e) => setProvEmail(e.target.value)} className="w-full bg-black/30 border border-amber-500/30 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Contraseña Asignada</label>
                      <input type="text" placeholder="Asigna una clave" value={provPassword} onChange={(e) => setProvPassword(e.target.value)} className="w-full bg-black/30 border border-amber-500/30 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400 transition-colors" />
                    </div>
                    
                    {/* INTEGRATED PHONE LIBRARY FIX: Resized grid to sit cleanly */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                       <div>
                          <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Teléfono (WhatsApp)</label>
                          <div 
                            className="w-full rounded-lg px-4 py-2.5 text-[11px] lg:text-sm font-montserrat transition-all shadow-inner border border-amber-500/30 bg-black/30 text-white focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400"
                            style={{ colorScheme: 'dark' }}
                          >
                            <PhoneInput 
                              defaultCountry="VE" 
                              international 
                              value={provPhone} 
                              onChange={(value) => setProvPhone(value)} 
                              className="PhoneInputCustom w-full bg-transparent outline-none"
                            />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-amber-500/20">
                    <div>
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Nivel Inicial</label>
                      <select value={levelOverride} onChange={e => setLevelOverride(e.target.value)} className="w-full bg-black/40 border border-amber-500/30 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-amber-400 cursor-pointer appearance-none">
                        {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l.split(':')[0]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Unidad</label>
                      <input type="number" min="1" max="12" value={unitOverride} onChange={e => setUnitOverride(parseInt(e.target.value))} className="w-full bg-black/40 border border-amber-500/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Día de Corte</label>
                      <select value={cohort} onChange={e => setCohort(parseInt(e.target.value))} className="w-full bg-black/40 border border-amber-500/30 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-amber-400 cursor-pointer appearance-none">
                        <option value={15}>15 del mes</option>
                        <option value={30}>30 del mes</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleProvisionAccount} disabled={isProcessing} className="w-full mt-6 py-4 bg-amber-400 hover:bg-white text-[#08203e] font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] disabled:opacity-50 hover:scale-[1.02]">
                    {isProcessing ? 'PROCESANDO EN BD...' : 'CONFIRMAR Y ACTIVAR ESTUDIANTE'}
                  </button>
                </div>
              )}

              {/* God Mode Overrides */}
              {!isPending && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                    <h4 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Academic Overrides (God Mode)</h4>
                    <button onClick={handleSaveOverrides} disabled={isProcessing} className="text-[10px] uppercase font-black text-[#08203e] bg-[#fcd34d] hover:bg-white px-4 py-2 rounded-lg transition-all shadow-md disabled:opacity-50">
                      Guardar Overrides
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-white/50 font-bold uppercase mb-2">Override Nivel</label>
                      <select value={levelOverride} onChange={e => setLevelOverride(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] cursor-pointer appearance-none">
                        {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 font-bold uppercase mb-2">Override Unidad</label>
                      <input type="number" min="1" max="12" value={unitOverride} onChange={e => setUnitOverride(parseInt(e.target.value))} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Credentials & Kill Switch */}
              {!isPending && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 relative shadow-md">
                     <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                        <h4 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Credenciales & Perfil</h4>
                        {!isEditingCreds ? (
                          <button onClick={() => setIsEditingCreds(true)} className="text-[10px] uppercase font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-all">Editar</button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => setIsEditingCreds(false)} className="text-[10px] uppercase font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-all">Cancelar</button>
                            <button onClick={handleUpdateCredentials} disabled={isProcessing} className="text-[10px] uppercase font-black text-[#08203e] bg-[#fcd34d] hover:bg-white px-3 py-1.5 rounded-md shadow-md transition-all disabled:opacity-50">{isProcessing ? '...' : 'Guardar'}</button>
                          </div>
                        )}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="overflow-hidden">
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Email</label>
                          {!isEditingCreds ? <p className="text-sm text-white font-semibold py-2 truncate">{editEmail}</p> : <input type="text" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full bg-black/40 border border-[#fcd34d]/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />}
                        </div>
                        <div className="overflow-hidden">
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Contraseña</label>
                          {!isEditingCreds ? <p className="text-sm text-white font-semibold py-2 tracking-widest truncate">{editPassword || '********'}</p> : <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full bg-black/40 border border-[#fcd34d]/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />}
                        </div>
                        
                        {/* URL Avatar Edit for Existing Users */}
                        {isEditingCreds && (
                          <div className="overflow-hidden col-span-1 md:col-span-2 mt-2">
                            <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">URL Avatar de Perfil</label>
                            <input type="text" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} placeholder="Enlace a la foto..." className="w-full bg-black/40 border border-[#fcd34d]/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                          </div>
                        )}
                     </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md">
                    <div>
                      <h4 className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Estado de Cuenta</h4>
                      <p className={`text-xl font-black uppercase tracking-widest ${accountStatus === 'active' ? 'text-emerald-400' : 'text-red-500'}`}>{accountStatus}</p>
                    </div>
                    <button onClick={() => handleKillSwitch(accountStatus === 'active' ? 'suspended' : 'active')} disabled={isProcessing} className={`w-full mt-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-md ${accountStatus === 'active' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white' : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-white'}`}>
                      {accountStatus === 'active' ? 'Suspender' : 'Reactivar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Registration Data */}
              <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest mb-4 border-b border-white/10 pb-2 mt-8">Respuestas de Registro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Motivo del Curso</p><p className="text-sm text-white font-semibold truncate">{userData.reason || 'No especificado'}</p></div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Meta de Fluidez</p><p className="text-sm text-white font-semibold truncate">{userData.fluent_time || 'No especificado'}</p></div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Categoría de Interés</p><p className="text-sm text-white font-semibold truncate">{userData.interest || 'No especificado'}</p></div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Fecha de Registro</p><p className="text-sm text-white font-semibold truncate">{new Date(userData.created_at || Date.now()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: FINANZAS                                      */}
          {/* ==================================================== */}
          {activeTab === 'FINANZAS' && (
            <div className="animate-fade-in space-y-6">
              {!isPending ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Proration & Cohort Control */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md">
                       <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                          <h4 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Billing & Cohort</h4>
                          <button onClick={handleSaveCohort} disabled={isProcessing} className="text-[10px] uppercase font-black text-white bg-white/10 border border-white/20 hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-transparent px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0">Change Cohort</button>
                       </div>
                       <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] text-white/50 font-bold uppercase mb-2">Billing Cohort</label>
                            <select value={cohort} onChange={e => setCohort(parseInt(e.target.value))} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] cursor-pointer appearance-none">
                               <option value={15}>15th of the Month</option>
                               <option value={30}>30th of the Month</option>
                            </select>
                          </div>
                          <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col justify-center items-center text-center shadow-inner h-[46px]">
                            <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-0.5">Prorated Due Now</span>
                            <span className="text-lg font-black text-[#fcd34d] leading-none">${proratedDue}</span>
                          </div>
                       </div>
                    </div>

                    {/* Credit Economy & Refunds */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center shadow-md">
                       <div className="flex justify-between items-center mb-3">
                         <h3 className="text-white font-black text-xl">Class Credits: <span className="text-[#fcd34d]">{credits}</span></h3>
                         <button onClick={handleRefund} className="bg-white/10 hover:bg-[#fcd34d] hover:text-[#08203e] text-white border border-white/20 hover:border-transparent font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0">
                            +1 Credit (Refund)
                         </button>
                       </div>
                       <p className="text-[10px] text-white/50 leading-relaxed font-medium">Students automatically receive <strong className="text-white">4 credits</strong> upon monthly renewal. Use the refund button strictly for academy-fault disruptions (Logs automatically to Finances).</p>
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest mt-8 mb-4 border-b border-white/10 pb-2">Estado de Suscripción</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-md">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Tarifa Mensual</p>
                      <p className="text-2xl text-white font-black">${MONTHLY_PRICES[getBaseLevel(levelOverride)] || 40}</p>
                      <p className="text-[9px] text-[#fcd34d] uppercase mt-1">Nivel {getBaseLevel(levelOverride)}</p>
                    </div>
                    <div className={`border rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-md ${isPastDue ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Próximo Pago</p>
                      <p className={`text-xl font-black ${isPastDue ? 'text-red-400' : 'text-white'}`}>
                        {userData.next_billing_date ? new Date(userData.next_billing_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No asignada'}
                      </p>
                      {isPastDue && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 animate-pulse">VENCIDO - CRÉDITOS A 0</p>}
                    </div>
                  </div>

                  <div className="bg-black/30 border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-inner">
                    <h3 className="text-emerald-400 font-black uppercase tracking-widest mb-2">Registrar Pago Manual</h3>
                    <p className="text-xs text-white/60 mb-6 font-medium">Sube el comprobante y el número de referencia para verificar el pago y aplicar los créditos automáticamente.</p>
                    
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Tipo de Compra</label>
                          <select value={payType} onChange={handlePayTypeChange} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer">
                            <option value="Mensualidad">Suscripción Mensual (+4 Créditos)</option>
                            <option value="Extra">Créditos Extra (+2 Créditos)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Monto a Verificar (USD)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-black">$</span>
                            <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" required />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Número de Referencia (Zelle / Transferencia)</label>
                        <input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Ej: REF-92384729" className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" required />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Comprobante (Screenshot)</label>
                        <input type="file" accept="image/*" onChange={(e) => setPayFile(e.target.files[0])} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-2 text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer" required />
                      </div>

                      <button type="submit" disabled={isProcessing} className="w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-[#08203e] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 hover:scale-[1.02]">
                        {isProcessing ? 'Verificando y Aplicando...' : `Confirmar Pago de $${payAmount}`}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">
                  El estudiante debe estar activo para registrar pagos.
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: ESTADISTICAS                                  */}
          {/* ==================================================== */}
          {activeTab === 'ESTADISTICAS' && (
            <div className="animate-fade-in space-y-6">
              {!isPending ? (
                <>
                  <div className="flex justify-between items-end border-b border-white/10 pb-2 mb-4">
                    <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Progreso Académico</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-md"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Última Unidad</p><p className="text-sm text-white font-semibold">{userData.unit || 'Ninguna'}</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-md"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Puntaje Promedio</p><p className="text-sm text-white font-semibold">{userData.lesson_score || '0'} / 100</p></div>
                  </div>

                  <div className="mt-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest drop-shadow-sm">HISTORIAL ACADÉMICO</h3>
                        <p className="text-xs text-white/50 mt-1">Auditoría permanente de clases, notas y evaluaciones.</p>
                      </div>
                      <button onClick={handleGenerateReport} disabled={isGenerating || academicHistory.length === 0} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-md">
                        {isGenerating ? <><div className="w-3 h-3 border-2 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div> GENERANDO...</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> EXPORTAR REPORTE</>}
                      </button>
                    </div>

                    {isLoadingHistory ? (
                      <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>
                    ) : academicHistory.length === 0 ? (
                      <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">El estudiante aún no tiene registros académicos.</div>
                    ) : (
                      <div className="space-y-4">
                        {academicHistory.map((record) => (
                          <div key={record.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/10 transition-colors shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shadow-inner shrink-0 ${record.score_percentage >= 75 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{Math.round(record.score_percentage)}%</div>
                              <div className="flex flex-col"><span className="font-bold text-white text-sm uppercase tracking-wider">{record.activity_type}</span><span className="text-[10px] text-white/50 uppercase tracking-widest">Unidad {record.unit} • {new Date(record.created_at).toLocaleDateString('es-ES')}</span></div>
                            </div>
                            <div className="flex flex-col md:text-right"><span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Evaluador / Notas</span><span className="text-xs font-semibold text-white truncate max-w-[200px]">{record.teacher ? `${record.teacher.first_name} ${record.teacher.last_name}` : 'Sistema (Auto-Grader)'}</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">Las estadísticas se generarán una vez que la cuenta esté activa.</div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentManagerModal;