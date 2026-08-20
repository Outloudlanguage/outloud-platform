import React, { useState, useEffect } from 'react';

const StudentManagerModal = ({ isOpen, onClose, userData, isPending, supabase, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('INFO_PERSONAL');

  // Provisioning State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  
  // Credentials Edit State
  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  
  // Processing & Kill Switch State
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountStatus, setAccountStatus] = useState('active');

  // Reporting Engine States
  const [academicHistory, setAcademicHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Financial Engine States
  const [payType, setPayType] = useState('Mensualidad');
  const [payAmount, setPayAmount] = useState(20);
  const [payRef, setPayRef] = useState('');
  const [payFile, setPayFile] = useState(null);

  // Pre-fill states whenever the selected user changes
  useEffect(() => {
    if (userData) {
      setProvEmail(userData.email || '');
      setProvPassword('');
      setIsProvisioning(false);
      
      setEditEmail(userData.email || '');
      setEditPassword(userData.assigned_password || '');
      setIsEditingCreds(false);
      
      setAccountStatus(userData.status || 'active');
      setActiveTab('INFO_PERSONAL');
      updatePrice(payType, userData.level);
    }
  }, [userData]);

  useEffect(() => {
    if (isOpen && !isPending && userData?.id && activeTab === 'ESTADISTICAS') {
      fetchAcademicHistory();
    }
  }, [isOpen, isPending, userData, activeTab]);

  // --- ACADEMIC LOGIC ---
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

  // --- FINANCIAL LOGIC ---
  const updatePrice = (type, level = 'A1') => {
    if (type === 'Extra') {
      setPayAmount(12);
    } else {
      if (level.includes('C')) setPayAmount(50);
      else if (level.includes('B')) setPayAmount(30);
      else setPayAmount(20);
    }
  };

  const handlePayTypeChange = (e) => {
    const newType = e.target.value;
    setPayType(newType);
    updatePrice(newType, userData?.level);
  };

  // Adapts to 15th, 30th, and Feb 28/29
  const calculateNextBillingDate = (currentDateString) => {
    const d = currentDateString ? new Date(currentDateString) : new Date();
    let day = d.getDate();
    const cohortDay = day <= 15 ? 15 : 30;
    
    let nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, cohortDay);
    
    // Check if JS rolled a 30th over to March 1st or 2nd (February anomaly)
    if (cohortDay === 30 && nextMonth.getMonth() !== (d.getMonth() + 1) % 12) {
        nextMonth = new Date(d.getFullYear(), d.getMonth() + 2, 0); 
    }
    return nextMonth.toISOString().split('T')[0];
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payRef || !payFile) {
      alert("Debes incluir un número de referencia y el comprobante de pago.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Upload the proof of payment to the bucket
      const fileExt = payFile.name.split('.').pop();
      const fileName = `${userData.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, payFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment_proofs')
        .getPublicUrl(fileName);

      // 2. Log transaction in student_payments ledger
      const { error: ledgerError } = await supabase
        .from('student_payments')
        .insert({
          student_id: userData.id,
          payment_type: payType === 'Mensualidad' ? 'Monthly Subscription' : 'Extra Credits',
          amount: payAmount,
          reference_number: payRef,
          proof_image_url: publicUrl,
          status: 'verified' // Admin is verifying it manually
        });

      if (ledgerError) throw ledgerError;

      // 3. Update the student's profile credits and billing date
      const newCredits = payType === 'Mensualidad' ? 4 : (userData.credits || 0) + 2;
      const updates = { credits: newCredits };

      if (payType === 'Mensualidad') {
        updates.next_billing_date = calculateNextBillingDate(userData.next_billing_date);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userData.id);

      if (profileError) throw profileError;

      alert("Pago registrado y créditos aplicados exitosamente.");
      setPayRef('');
      setPayFile(null);
      if (onSuccess) onSuccess();
      onClose();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Hubo un error procesando el pago. Revisa los permisos del bucket de Storage.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ACCOUNT CONTROL LOGIC ---
  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') onClose();
  };

  const handleProvisionAccount = async () => {
    if (!provEmail || !provPassword) {
      alert("Debes asignar un correo y una contraseña.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const { error: authError } = await supabase.functions.invoke('provision-user', {
        body: { email: provEmail, password: provPassword, fullName: userData.full_name, role: 'student' }
      });
      if (authError) throw authError;

      const { error: regError } = await supabase.from('registrations').update({ status: 'approved' }).eq('id', userData.id);
      if (regError) throw regError;

      alert('Cuenta aprovisionada exitosamente. El estudiante ya puede ingresar.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Provisioning Error:", error);
      alert(`Error al crear la cuenta: ${error.message || 'Fallo en la red'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!editEmail || !editPassword) {
      alert("El correo y contraseña no pueden estar vacíos.");
      return;
    }

    setIsProcessing(true);
    try {
      const { error: authError } = await supabase.functions.invoke('manage-credentials', {
        body: { userId: userData.id, email: editEmail, password: editPassword }
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase.from('profiles').update({ email: editEmail, assigned_password: editPassword }).eq('id', userData.id);
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

  if (!isOpen || !userData) return null;

  // Visual helper to check if past due
  const isPastDue = userData.next_billing_date && new Date(userData.next_billing_date) < new Date();

  return (
    <div id="modal-overlay" onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-montserrat">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#070b19]/95 border border-white/20 rounded-[2rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slide-up">
        
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#fcd34d]/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 flex items-start justify-between p-6 md:p-8 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src={userData.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile Avatar" 
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 shadow-lg ${isPending ? 'border-amber-400' : accountStatus === 'suspended' ? 'border-red-500 opacity-50 text-grayscale' : 'border-white/20'}`}
              />
              {isPending && <div className="absolute -bottom-2 -right-2 bg-amber-400 text-[#08203e] text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-md animate-pulse">PENDIENTE</div>}
              {accountStatus === 'suspended' && <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-md">SUSPENDIDO</div>}
            </div>
            <div className="flex flex-col">
              <h2 className={`text-xl md:text-2xl font-black tracking-wide drop-shadow-md truncate ${accountStatus === 'suspended' ? 'text-white/50' : 'text-white'}`}>
                {userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Sin Nombre'}
              </h2>
              <p className="text-xs md:text-sm text-white/60 font-semibold mt-1">{userData.email} {userData.phone ? `• ${userData.phone}` : ''}</p>
              {!isPending && (
                <p className="text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest mt-1">
                  NIVEL: {userData.level?.split(':')[0] || 'A1'} • CRÉDITOS: <span className="text-white">{userData.credits || 0}</span>
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all hover:rotate-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

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

        <div className="relative z-10 flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8">
          
          {activeTab === 'INFO_PERSONAL' && (
            <div className="animate-fade-in space-y-6">
              {isPending && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 transition-all">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-amber-400 font-black tracking-widest text-sm uppercase">Aprobación de Cuenta</h4>
                      <p className="text-xs text-amber-200/70 mt-1">Asigna las credenciales maestras para activar a este estudiante.</p>
                    </div>
                    {!isProvisioning && (
                      <button onClick={() => setIsProvisioning(true)} className="w-full md:w-auto bg-[#fcd34d] text-[#08203e] hover:bg-white text-xs font-black uppercase px-6 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:scale-105 active:scale-95">
                        Crear Cuenta
                      </button>
                    )}
                  </div>

                  {isProvisioning && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in mt-4 pt-4 border-t border-amber-500/20">
                      <div>
                        <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Nombre de Usuario (Email)</label>
                        <input type="email" value={provEmail} onChange={(e) => setProvEmail(e.target.value)} className="w-full bg-black/30 border border-amber-500/30 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-amber-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Contraseña Asignada</label>
                        <input type="text" placeholder="Asigna una clave (ej: OLA2026*)" value={provPassword} onChange={(e) => setProvPassword(e.target.value)} className="w-full bg-black/30 border border-amber-500/30 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-amber-400" />
                      </div>
                      <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
                        <button onClick={() => setIsProvisioning(false)} className="px-5 py-2.5 rounded-lg text-xs font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors uppercase tracking-wider">Cancelar</button>
                        <button onClick={handleProvisionAccount} disabled={isProcessing} className="px-5 py-2.5 rounded-lg text-xs font-black text-[#08203e] bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all uppercase tracking-wider disabled:opacity-50">
                          {isProcessing ? 'Procesando...' : 'Confirmar y Activar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isPending && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Credenciales de Acceso</h4>
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
                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Nombre de Usuario</label>
                        {!isEditingCreds ? <p className="text-sm text-white font-semibold py-2">{userData.email}</p> : <input type="text" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full bg-[#070b19] border border-[#fcd34d]/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />}
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Contraseña Actual</label>
                        {!isEditingCreds ? <p className="text-sm text-white font-semibold py-2 tracking-widest">{userData.assigned_password || '********'}</p> : <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full bg-[#070b19] border border-[#fcd34d]/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <h4 className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Estado de Cuenta</h4>
                      <p className={`text-xl font-black uppercase tracking-widest ${accountStatus === 'active' ? 'text-emerald-400' : 'text-red-500'}`}>{accountStatus === 'active' ? 'Activo' : 'Suspendido'}</p>
                    </div>
                    <button disabled={isProcessing} onClick={() => handleKillSwitch(accountStatus === 'active' ? 'suspended' : 'active')} className={`w-full mt-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50 ${accountStatus === 'active' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'}`}>
                      {accountStatus === 'active' ? 'Suspender Acceso' : 'Reactivar Acceso'}
                    </button>
                  </div>
                </div>
              )}

              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Respuestas de Registro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Motivo del Curso</p><p className="text-sm text-white font-semibold">{userData.reason || 'No especificado'}</p></div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Meta de Fluidez</p><p className="text-sm text-white font-semibold">{userData.fluent_time || 'No especificado'}</p></div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Categoría de Interés</p><p className="text-sm text-white font-semibold">{userData.interest || 'No especificado'}</p></div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Fecha de Registro</p><p className="text-sm text-white font-semibold">{new Date(userData.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
              </div>
            </div>
          )}

          {activeTab === 'FINANZAS' && (
            <div className="animate-fade-in space-y-6">
              {!isPending ? (
                <>
                  <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Estado de Facturación</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Créditos Actuales</p>
                      <p className={`text-4xl font-black ${userData.credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{userData.credits || '0'}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Tarifa Mensual</p>
                      <p className="text-2xl text-white font-black">${payAmount}</p>
                      <p className="text-[9px] text-[#fcd34d] uppercase mt-1">Nivel {userData.level?.split(':')[0] || 'A1'}</p>
                    </div>
                    <div className={`border rounded-xl p-4 flex flex-col justify-center items-center text-center ${isPastDue ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Próximo Pago</p>
                      <p className={`text-xl font-black ${isPastDue ? 'text-red-400' : 'text-white'}`}>
                        {userData.next_billing_date ? new Date(userData.next_billing_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No asignada'}
                      </p>
                      {isPastDue && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 animate-pulse">VENCIDO - CRÉDITOS A 0</p>}
                    </div>
                  </div>

                  <div className="bg-black/30 border border-emerald-500/20 rounded-2xl p-6 md:p-8">
                    <h3 className="text-emerald-400 font-black uppercase tracking-widest mb-2">Registrar Pago & Asignar Créditos</h3>
                    <p className="text-xs text-white/70 mb-6 font-medium">Sube el comprobante y el número de referencia para verificar el pago y aplicar los créditos automáticamente.</p>
                    
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Tipo de Compra</label>
                          <select value={payType} onChange={handlePayTypeChange} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none">
                            <option value="Mensualidad">Suscripción Mensual (4 Créditos)</option>
                            <option value="Extra">Créditos Extra (2 Créditos)</option>
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
                        <input type="file" accept="image/*" onChange={(e) => setPayFile(e.target.files[0])} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-2 text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-white/10 file:text-white hover:file:bg-white/20" required />
                      </div>

                      <button type="submit" disabled={isProcessing} className="w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-[#08203e] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50">
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

          {activeTab === 'ESTADISTICAS' && (
            <div className="animate-fade-in space-y-6">
              {!isPending ? (
                <>
                  <div className="flex justify-between items-end border-b border-white/10 pb-2 mb-4">
                    <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest">Progreso Académico</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Última Unidad</p><p className="text-sm text-white font-semibold">{userData.unit || 'Ninguna'}</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-[10px] text-white/50 font-bold uppercase mb-1">Puntaje Promedio</p><p className="text-sm text-white font-semibold">{userData.lesson_score || '0'} / 100</p></div>
                  </div>

                  <div className="mt-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">HISTORIAL ACADÉMICO</h3>
                        <p className="text-xs text-white/50 mt-1">Auditoría permanente de clases, notas y evaluaciones.</p>
                      </div>
                      <button onClick={handleGenerateReport} disabled={isGenerating || academicHistory.length === 0} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-md">
                        {isGenerating ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> GENERANDO...</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> EXPORTAR REPORTE</>}
                      </button>
                    </div>

                    {isLoadingHistory ? (
                      <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>
                    ) : academicHistory.length === 0 ? (
                      <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">El estudiante aún no tiene registros académicos.</div>
                    ) : (
                      <div className="space-y-4">
                        {academicHistory.map((record) => (
                          <div key={record.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/10 transition-colors">
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