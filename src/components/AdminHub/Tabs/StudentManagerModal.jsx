import React, { useState, useEffect } from 'react';
import { LEVEL_OPTIONS } from '../../../constants/adminConfigs';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

const StudentManagerModal = ({ isOpen, onClose, userData, isPending, supabase, onSuccess }) => {
  const reportRef = useRef(null);
  const [activeTab, setActiveTab] = useState('INFO_PERSONAL');
  const userRole = userData?.role || 'Student';

  // ==========================================
  // TAB 1: INFO PERSONAL (Provisioning, Creds, Overrides)
  // ==========================================
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provFirstName, setProvFirstName] = useState('');
  const [provLastName, setProvLastName] = useState('');
  const [provPhone, setProvPhone] = useState(''); 
  const [provAvatarUrl, setProvAvatarUrl] = useState(''); 
  
  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState(''); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountStatus, setAccountStatus] = useState('active');

  // Academic Overrides State
  const [levelOverride, setLevelOverride] = useState('A1: Básico 1');
  const [unitOverride, setUnitOverride] = useState(1);

  // ==========================================
  // TAB 2: FINANZAS (Students)
  // ==========================================
  const getDefaultCohort = () => new Date().getDate() <= 15 ? 15 : 30;
  const [cohort, setCohort] = useState(15);
  const [credits, setCredits] = useState(0);
  
  const [payType, setPayType] = useState('Mensualidad');
  const [payAmount, setPayAmount] = useState(20);
  const [payRef, setPayRef] = useState('');

  // ==========================================
  // TAB 3: ESTADISTICAS (Students)
  // ==========================================
  const [academicHistory, setAcademicHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // ==========================================
  // TEACHER PAYROLL ENGINE STATES
  // ==========================================
  const [pendingClasses, setPendingClasses] = useState([]);
  const [pendingShifts, setPendingShifts] = useState([]);
  const [payrollCadence, setPayrollCadence] = useState('Monthly');
  const [payrollRef, setPayrollRef] = useState('');
  const [isFetchingPayroll, setIsFetchingPayroll] = useState(false);

  // DYNAMIC TIERED PRICING MAPPED FROM INSTRUCTIONS
  const MONTHLY_PRICES = { A1: 20, A2: 20, B1: 30, B2: 30, C1: 50, C2: 50 };

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
    if (isOpen && !isPending && userData?.id && !userData.id.startsWith('mock')) {
      if (activeTab === 'ESTADISTICAS' && userRole === 'Student') {
        fetchAcademicHistory();
      }
      if (activeTab === 'PAYROLL' && userRole === 'Teacher') {
        fetchTeacherPayroll();
      }
    }
  }, [isOpen, isPending, userData, activeTab, userRole]);

  // ==========================================
  // TEACHER PAYROLL LOGIC
  // ==========================================
  const fetchTeacherPayroll = async () => {
    setIsFetchingPayroll(true);
    try {
      // 1. Fetch un-paid completed classes
      const { data: classes } = await supabase.from('live_sessions')
        .select('*')
        .eq('teacher_id', userData.id)
        .eq('is_paid_out', false)
        .eq('status', 'completed'); 
        
      // 2. Fetch un-paid daily retainers
      const { data: shifts } = await supabase.from('teacher_shifts')
        .select('*')
        .eq('teacher_id', userData.id)
        .eq('is_paid_out', false);
        
      setPendingClasses(classes || []);
      setPendingShifts(shifts || []);
      setPayrollCadence(userData.payroll_cadence || 'Monthly');
    } catch (e) {
      console.error("Error fetching payroll:", e);
    } finally {
      setIsFetchingPayroll(false);
    }
  };

  const handleSaveCadence = async (newCadence) => {
    setPayrollCadence(newCadence);
    try {
      await supabase.from('profiles').update({ payroll_cadence: newCadence }).eq('id', userData.id);
    } catch (e) { console.error("Error saving cadence", e); }
  };

  // Payroll Calculation Variables
  let totalPayroll = 0;
  let nightClassesCount = 0;
  let dayClassesCount = 0;
  let noShowCount = 0;

  pendingClasses.forEach(cls => {
    if (cls.student_no_show) {
      totalPayroll += 2;
      noShowCount++;
    } else {
      const date = new Date(cls.scheduled_at);
      const hour = date.getHours(); 
      const durationHrs = (cls.duration_minutes || 60) / 60;
      
      if (hour >= 18) {
        totalPayroll += (4 * durationHrs);
        nightClassesCount++;
      } else {
        totalPayroll += (3 * durationHrs);
        dayClassesCount++;
      }
    }
  });

  const shiftCount = pendingShifts.length;
  totalPayroll += (shiftCount * 2);

  const handleMarkAsPaid = async (e) => {
    e.preventDefault();
    if (!payrollRef) return alert("Por favor, ingresa un número de referencia.");
    
    setIsProcessing(true);
    try {
      if (pendingClasses.length > 0) {
        const classIds = pendingClasses.map(c => c.id);
        await supabase.from('live_sessions').update({ is_paid_out: true }).in('id', classIds);
      }
      
      if (pendingShifts.length > 0) {
        const shiftIds = pendingShifts.map(s => s.id);
        await supabase.from('teacher_shifts').update({ is_paid_out: true }).in('id', shiftIds);
      }
      
      await supabase.from('financial_logs').insert({
        student_id: userData.id, 
        type: 'payroll_payout',
        description: `Teacher Payout - Cadence: ${payrollCadence} | Ref: ${payrollRef}`,
        amount: totalPayroll
      });
      
      alert("¡Nómina liquidada exitosamente!");
      setPayrollRef('');
      fetchTeacherPayroll(); // Refresh to clear UI
    } catch (err) {
      console.error(err);
      alert("Hubo un error liquidando la nómina.");
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleGenerateReport = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Outloud_Report_${userData.first_name || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Hubo un error generando el reporte PDF.");
    } finally {
      setIsGenerating(false);
    }
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
  // FINANCIAL LOGIC (STUDENTS)
  // ==========================================
  const getBaseLevel = (lvlString) => lvlString ? lvlString.split(':')[0].trim() : 'A1';

  const updatePrice = (type, levelString) => {
    if (type === 'Extra') setPayAmount(12);
    else setPayAmount(MONTHLY_PRICES[getBaseLevel(levelString)] || 20);
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

  const proratedDue = calculateProration(cohort, MONTHLY_PRICES[getBaseLevel(levelOverride)] || 20);

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

  const handleProcessRenewal = async (e) => {
    e.preventDefault();
    if (!payRef) { alert("Debes incluir un número de referencia de pago."); return; }

    setIsProcessing(true);
    try {
      if (userData.id.startsWith('mock')) {
         alert("Simulación de renovación en datos de prueba exitosa.");
         setIsProcessing(false);
         return;
      }

      const currentBase = getBaseLevel(levelOverride);
      const nextLevelInfo = {
        'A1': { level: 'A2: Básico 2', unit: 13 },
        'A2': { level: 'B1: Intermedio 1', unit: 25 },
        'B1': { level: 'B2: Intermedio 2', unit: 37 },
        'B2': { level: 'C1: Avanzado 1', unit: 49 },
        'C1': { level: 'C2: Avanzado 2', unit: 71 },
        'C2': { level: 'C2: Avanzado 2', unit: 92 } // Cap/Graduate
      }[currentBase] || { level: 'A2: Básico 2', unit: 13 };

      const { error: ledgerError } = await supabase.from('student_payments').insert({
        student_id: userData.id,
        amount: payAmount,
        reference_number: payRef,
        status: 'verified' 
      });
      if (ledgerError) throw ledgerError;

      const newCredits = credits + 4;
      const updates = { 
        available_credits: newCredits,
        level_completed: false,
        level: nextLevelInfo.level,
        unit: nextLevelInfo.unit,
        next_billing_date: calculateNextBillingDate()
      };

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', userData.id);
      if (profileError) throw profileError;

      setCredits(newCredits);
      setLevelOverride(nextLevelInfo.level);
      setUnitOverride(nextLevelInfo.unit);
      
      alert(`¡Renovación de Nivel Exitosa!\nEl estudiante ha sido promovido a ${nextLevelInfo.level} (Unidad ${nextLevelInfo.unit}) y se agregaron 4 créditos.`);
      setPayRef('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Renewal Error:", error);
      alert("Hubo un error procesando la renovación en la base de datos.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payRef) { alert("Debes incluir un número de referencia de pago."); return; }

    setIsProcessing(true);
    try {
      if (userData.id.startsWith('mock')) {
         alert("Simulación de pago en datos de prueba exitosa.");
         setIsProcessing(false);
         return;
      }

      const { error: ledgerError } = await supabase.from('student_payments').insert({
        student_id: userData.id,
        amount: payAmount,
        reference_number: payRef,
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
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Hubo un error procesando el pago en la base de datos.");
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

      // 1. Edge Function ONLY handles the secure login creation.
      const { data, error: invokeError } = await supabase.functions.invoke('provision-user', {
        body: { 
          email: cleanEmail, 
          password: provPassword, 
          firstName: provFirstName.trim(), 
          lastName: provLastName.trim(),
          role: userData.role || 'Student', 
          level: userRole === 'Student' ? levelOverride : 'Staff',
          unit: userRole === 'Student' ? unitOverride : 1
        }
      });
      
      if (invokeError) throw new Error(`Fallo de Conexión: ${invokeError.message}`);
      if (data?.error) throw new Error(`Error de Autenticación: ${data.error}`);

      const newUserId = data?.user?.id;
      if (!newUserId) throw new Error("No se pudo obtener el ID del usuario desde la función.");

      // 2. THE MASTER UPDATE
      const updates = {
          email: cleanEmail,
          first_name: provFirstName.trim(),
          last_name: provLastName.trim(),
          whatsapp: provPhone || null,
          avatar_url: provAvatarUrl.trim() || null,
          assigned_password: provPassword,
          status: 'active',
          role: userData.role || 'Student'
      };

      if (userRole === 'Student') {
        updates.cohort = cohort;
        updates.available_credits = 0;
        updates.level = levelOverride;
        updates.unit = unitOverride;
      }

      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', newUserId); 
        
      if (profileError) throw new Error(`Fallo actualizando perfil en BD: ${profileError.message}`);

      // 3. Approve Registration (if applicable)
      await supabase.from('registrations').update({ status: 'approved' }).eq('id', userData.id);

      alert(`Cuenta de ${userRole} aprovisionada exitosamente. El usuario ya está activo en el directorio.`);
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
      newStatus === 'suspended' ? `¿Estás seguro de que deseas SUSPENDER el acceso de este ${userRole}?` : `¿Deseas REACTIVAR el acceso de este ${userRole}?`
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

  // DYNAMIC TABS BASED ON ROLE
  const getTabsForRole = () => {
    if (userRole === 'Admin') {
      return [{ id: 'INFO_PERSONAL', label: 'Info Personal & Control' }];
    }
    if (userRole === 'Teacher') {
      return [
        { id: 'INFO_PERSONAL', label: 'Info Personal & Control' },
        { id: 'PAYROLL', label: 'Nómina & Desglose' },
        { id: 'TEACHER_STATS', label: 'Estadísticas del Profesor' }
      ];
    }
    // Default to Student
    return [
      { id: 'INFO_PERSONAL', label: 'Info Personal & Control' },
      { id: 'FINANZAS', label: 'Manejo de Finanzas' },
      { id: 'ESTADISTICAS', label: 'Estadísticas del Alumno' }
    ];
  };

  const activeTabs = getTabsForRole();

  if (!isOpen || !userData) return null;

  const isPastDue = userData.next_billing_date && new Date(userData.next_billing_date) < new Date();

  return (
    <div id="modal-overlay" onClick={handleOverlayClick} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in font-montserrat">
      
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
        
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#fcd34d]/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 flex items-start justify-between p-6 md:p-8 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-5 overflow-hidden w-full pr-4">
            <div className="relative shrink-0">
              <img 
                src={userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name || userData.full_name || 'U')}&background=random&color=fff`} 
                alt="Profile Avatar" 
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
              
              {!isPending && userRole === 'Student' && (
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest">
                    NIVEL: {levelOverride.split(':')[0]} • CRÉDITOS: <span className="text-white">{credits}</span>
                  </p>
                  {userData.level_completed && (
                    <span className="bg-amber-500 text-[#08203e] text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit animate-pulse shadow-md">
                      Nivel Completado - Esperando Renovación
                    </span>
                  )}
                </div>
              )}
              {!isPending && userRole !== 'Student' && (
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                  ROLE: {userRole}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all hover:rotate-90 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="relative z-10 flex flex-wrap border-b border-white/10 bg-black/20 shrink-0">
          {activeTabs.map((tab) => (
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

        <div className="relative z-10 flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8">
          {/* ==========================================
              TAB 1: INFO PERSONAL (Universal)
          ========================================== */}
          {activeTab === 'INFO_PERSONAL' && (
            <div className="animate-fade-in space-y-6">
              {isPending && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 transition-all shadow-inner">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 border-b border-amber-500/20 pb-4">
                    <div>
                      <h4 className="text-amber-400 font-black tracking-widest text-sm uppercase">Aprobación de Cuenta ({userRole})</h4>
                      <p className="text-xs text-amber-200/70 mt-1">Verifica la información y asigna las credenciales maestras para activar.</p>
                    </div>
                  </div>

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

                  {userRole === 'Student' && (
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
                  )}

                  <button onClick={handleProvisionAccount} disabled={isProcessing} className="w-full mt-6 py-4 bg-amber-400 hover:bg-white text-[#08203e] font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] disabled:opacity-50 hover:scale-[1.02]">
                    {isProcessing ? 'PROCESANDO EN BD...' : 'CONFIRMAR Y ACTIVAR USUARIO'}
                  </button>
                </div>
              )}

              {!isPending && userRole === 'Student' && (
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

              {userRole === 'Student' && (
                <>
                  <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest mb-4 border-b border-white/10 pb-2 mt-8">Respuestas de Registro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Motivo del Curso</p><p className="text-sm text-white font-semibold truncate">{userData.reason || 'No especificado'}</p></div>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Meta de Fluidez</p><p className="text-sm text-white font-semibold truncate">{userData.fluent_time || 'No especificado'}</p></div>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Categoría de Interés</p><p className="text-sm text-white font-semibold truncate">{userData.interest || 'No especificado'}</p></div>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 shadow-inner overflow-hidden"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Fecha de Registro</p><p className="text-sm text-white font-semibold truncate">{new Date(userData.created_at || Date.now()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 2: FINANZAS (For Students)
          ========================================== */}
          {activeTab === 'FINANZAS' && userRole === 'Student' && (
            <div className="animate-fade-in space-y-6">
              {!isPending ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <p className="text-2xl text-white font-black">${MONTHLY_PRICES[getBaseLevel(levelOverride)] || 20}</p>
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

                  <div className={`bg-black/30 border rounded-2xl p-6 md:p-8 shadow-inner ${userData.level_completed ? 'border-amber-500/50' : 'border-emerald-500/30'}`}>
                    {userData.level_completed ? (
                      <>
                        <h3 className="text-amber-400 font-black uppercase tracking-widest mb-2">Procesar Renovación de Nivel</h3>
                        <p className="text-xs text-white/60 mb-6 font-medium">El estudiante aprobó el nivel {getBaseLevel(levelOverride)}. Registra el pago de renovación para promoverlo al siguiente nivel, reactivar sus créditos y desbloquear su cuenta.</p>
                        
                        <form onSubmit={handleProcessRenewal} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Monto de Renovación (USD)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-black">$</span>
                                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400" required />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Referencia (Zelle / Pago Móvil)</label>
                              <input type="text" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Ej: REF-923847" className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-3 text-white text-xs outline-none focus:border-amber-400" required />
                            </div>
                          </div>

                          <button type="submit" disabled={isProcessing} className="w-full py-4 mt-auto bg-amber-400 hover:bg-white text-[#08203e] font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-50 hover:scale-[1.02]">
                            {isProcessing ? 'Procesando...' : `Renovar Nivel y Cobrar $${payAmount}`}
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <h3 className="text-emerald-400 font-black uppercase tracking-widest mb-2">Registrar Pago Manual</h3>
                        <p className="text-xs text-white/60 mb-6 font-medium">Sube el comprobante y el número de referencia para verificar el pago y aplicar los créditos automáticamente.</p>
                        
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Tipo de Compra</label>
                              <select value={payType} onChange={handlePayTypeChange} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer">
                                <option value="Mensualidad">Suscripción Mensual (+4 Créditos)</option>
                                <option value="Extra">Créditos Extra (+2 Créditos por $12)</option>
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

                          <div className="mb-3">
                            <label className="block text-[9px] text-white/50 font-bold uppercase mb-1">Número de Referencia (Zelle / Pago Móvil)</label>
                            <input type="text" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Ej: REF-923847" className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#fcd34d]" required />
                          </div>

                          <button type="submit" disabled={isProcessing} className="w-full py-4 mt-auto bg-[#fcd34d] hover:bg-white text-[#08203e] font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(252,211,77,0.3)] disabled:opacity-50 hover:scale-[1.02]">
                            {isProcessing ? 'Verificando y Aplicando...' : `Confirmar Pago de $${payAmount}`}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">
                  El estudiante debe estar activo para registrar pagos.
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 3: ESTADISTICAS (For Students)
          ========================================== */}
          {activeTab === 'ESTADISTICAS' && userRole === 'Student' && (
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

          {/* ==========================================
              TAB 4: PAYROLL (For Teachers)
          ========================================== */}
          {activeTab === 'PAYROLL' && userRole === 'Teacher' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                 <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Nómina y Compensación</h3>
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] text-white/50 uppercase font-bold">Frecuencia:</span>
                   <select 
                      value={payrollCadence} 
                      onChange={(e) => handleSaveCadence(e.target.value)} 
                      className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs font-bold text-white outline-none focus:border-[#fcd34d] cursor-pointer appearance-none"
                   >
                     <option value="Weekly" className="bg-[#070b19]">Semanal</option>
                     <option value="Bi-Weekly" className="bg-[#070b19]">Quincenal</option>
                     <option value="Monthly" className="bg-[#070b19]">Mensual</option>
                   </select>
                 </div>
              </div>
              
              {isFetchingPayroll ? (
                 <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-[#08203e] border border-[#fcd34d]/50 rounded-2xl p-6 shadow-[0_0_15px_rgba(252,211,77,0.2)] flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Monto a Pagar</span>
                        <span className="text-4xl font-black text-[#fcd34d]">${totalPayroll.toFixed(2)}</span>
                        <span className="text-[9px] text-white/40 uppercase mt-2 font-black tracking-widest">Ciclo Pendiente</span>
                      </div>
                      
                      <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md flex flex-col justify-center">
                        <h4 className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-4 border-b border-white/10 pb-2">Desglose de Horas</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                           <div className="flex justify-between items-center"><span className="text-xs text-white/80 font-bold uppercase tracking-wider">Día ($3/hr)</span><span className="text-sm font-black text-white bg-white/10 px-3 py-1 rounded-lg">{dayClassesCount}</span></div>
                           <div className="flex justify-between items-center"><span className="text-xs text-white/80 font-bold uppercase tracking-wider">Noche ($4/hr)</span><span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">{nightClassesCount}</span></div>
                           <div className="flex justify-between items-center"><span className="text-xs text-white/80 font-bold uppercase tracking-wider">No-Shows ($2/clase)</span><span className="text-sm font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg">{noShowCount}</span></div>
                           <div className="flex justify-between items-center"><span className="text-xs text-white/80 font-bold uppercase tracking-wider">Guardias ($2/día)</span><span className="text-sm font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">{shiftCount}</span></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/30 border border-emerald-500/30 rounded-2xl p-6 shadow-inner">
                       <h4 className="text-emerald-400 font-black uppercase tracking-widest mb-2">Liquidar Ciclo</h4>
                       <p className="text-xs text-white/60 mb-6 font-medium">Ingresa el número de referencia para marcar estas clases y guardias como pagadas, enviando el registro contable a la base de datos.</p>
                       <form onSubmit={handleMarkAsPaid} className="flex flex-col md:flex-row gap-4">
                          <input type="text" value={payrollRef} onChange={(e)=>setPayrollRef(e.target.value)} placeholder="N° de Referencia (Ej. Zelle 9823)" className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-bold outline-none focus:border-emerald-400 shadow-inner" required />
                          <button type="submit" disabled={isProcessing || totalPayroll === 0} className="bg-emerald-500 hover:bg-emerald-400 text-[#070b19] font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shrink-0">Marcar como Pagado</button>
                       </form>
                    </div>
                 </>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 5: TEACHER_STATS (For Teachers)
          ========================================== */}
          {activeTab === 'TEACHER_STATS' && userRole === 'Teacher' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-2 mb-4">
                <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Rendimiento Académico</h3>
              </div>
              <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">
                Las estadísticas históricas de calidad y volumen del profesor estarán disponibles en la próxima actualización del motor analítico.
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==========================================
          HIDDEN PDF REPORT TEMPLATE (A4 Proportions)
      ========================================== */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none">
        <div ref={reportRef} className="w-[800px] min-h-[1131px] bg-white text-[#08203e] p-12 font-montserrat flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-end border-b-4 border-[#fcd34d] pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-widest text-[#08203e]">Outloud</h1>
              <p className="text-sm font-bold tracking-widest uppercase text-gray-500 mt-1">Language Academy</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black uppercase text-[#08203e]">{userData.full_name || `${userData.first_name} ${userData.last_name}`}</h2>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Nivel Actual: {levelOverride.split(':')[0]} • Unidad {userData.unit || 1}</p>
            </div>
          </div>

          {/* Academic Summary */}
          <h3 className="text-lg font-black uppercase tracking-widest bg-[#08203e] text-white px-4 py-2 mb-6">Resumen Académico</h3>
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="border-l-4 border-[#fcd34d] pl-4">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Puntaje Promedio</p>
              <p className="text-3xl font-black">{userData.lesson_score || 0}%</p>
            </div>
            <div className="border-l-4 border-emerald-400 pl-4">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Estado</p>
              <p className="text-xl font-black mt-2 text-emerald-600">Activo</p>
            </div>
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Fecha de Emisión</p>
              <p className="text-sm font-bold mt-3">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Teacher Evaluations Log */}
          <h3 className="text-lg font-black uppercase tracking-widest bg-[#08203e] text-white px-4 py-2 mb-6">Registro de Evaluaciones (Clases en Vivo)</h3>
          {academicHistory.length === 0 ? (
            <p className="text-sm font-bold text-gray-400 italic">No hay registros de evaluaciones disponibles para este periodo.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {academicHistory.map(record => {
                // Real-time Spanish translation for database-stored system notes
                const notasTraducidas = (record.teacher_notes || 'Sin observaciones.')
                  .replace('Deductions:', 'Deducciones:')
                  .replace('None', 'Ninguna')
                  .replace('Minor Grammatical Slips', 'Errores Gramaticales Menores')
                  .replace('Pronunciation / L1 Interference', 'Pronunciación / Interferencia L1')
                  .replace('Over-reliance on Fillers (Uh/Um)', 'Uso Excesivo de Muletillas')
                  .replace('Hesitation / Pacing Issues', 'Dudas / Problemas de Ritmo')
                  .replace('Incomplete Task Fulfillment', 'Tarea Incompleta')
                  .replace('Severe Lexical Range Deficit', 'Déficit Léxico Severo');

                const tipoActividad = record.activity_type === 'Live Class' ? 'Clase en Vivo' : 
                                      record.activity_type === 'Workbook' ? 'Libro de Práctica' : 
                                      record.activity_type === 'Lesson' ? 'Lección Multimedia' : 
                                      record.activity_type;

                return (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                      <span className="font-black uppercase text-[#08203e]">Unidad {record.unit} • {tipoActividad} • {new Date(record.created_at).toLocaleDateString('es-ES')}</span>
                      <span className={`font-black px-3 py-1 rounded text-sm ${record.score_percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        Calificación: {Math.round(record.score_percentage)} / 100
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest">Evaluador</span>
                        <span className="text-sm font-bold text-[#08203e]">{record.teacher ? `${record.teacher.first_name} ${record.teacher.last_name}` : 'Sistema Automático'}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest">Notas del Profesor & Deducciones</span>
                        <span className="text-sm font-medium text-gray-700 leading-relaxed">{notasTraducidas}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Validation */}
          <div className="mt-auto pt-8 border-t-2 border-gray-200 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Documento oficial generado automáticamente por Outloud Language Academy.</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default StudentManagerModal;