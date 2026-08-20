import React, { useState, useEffect } from 'react';
import StudentRegistrationForm from './StudentRegistrationForm';
import StudentManagerModal from './StudentManagerModal';
import AdminCalendar from './AdminCalendar';

const CustomerManagement = ({ supabase }) => {
  const [activeSubTab, setActiveSubTab] = useState('Calendario'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Directory State
  const [students, setStudents] = useState([]);
  const [pendingLeads, setPendingLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Modal State
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSelectedPending, setIsSelectedPending] = useState(false);

  // Financial Dashboard State
  const [financeData, setFinanceData] = useState({ payments: [], payroll: [], metrics: { expected: 0, actual: 0, liability: 0, net: 0 } });
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);

  // Fetch Directory
  const fetchDirectoryData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [profilesResponse, registrationsResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'Student').order('first_name', { ascending: true }),
        supabase.from('registrations').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      ]);

      if (profilesResponse.error) throw profilesResponse.error;
      if (registrationsResponse.error) throw registrationsResponse.error;

      setStudents(profilesResponse.data || []);
      setPendingLeads(registrationsResponse.data || []);
    } catch (error) {
      console.error("Error fetching directory data:", error);
      setErrorMsg("Error al cargar la base de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Finance Data
  const fetchFinanceData = async () => {
    setIsFinanceLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);

      // 1. Fetch Payments (Actual Revenue)
      const { data: paymentsData } = await supabase
        .from('student_payments')
        .select(`*, student:profiles!student_id(first_name, last_name, level)`)
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: false });

      // 2. Calculate Expected Revenue from Active Students
      const { data: activeStudents } = await supabase
        .from('profiles')
        .select('level')
        .eq('role', 'Student')
        .eq('status', 'active');

      let expected = 0;
      activeStudents?.forEach(s => {
         if (s.level?.includes('C')) expected += 50;
         else if (s.level?.includes('B')) expected += 30;
         else expected += 20;
      });

      // 3. Calculate Pending Payroll from unpaid completed sessions
      const { data: unpaidSessions } = await supabase
        .from('live_sessions')
        .select(`teacher_id, teacher:profiles!teacher_id(first_name, last_name, hourly_rate)`)
        .eq('status', 'completed')
        .eq('is_paid_out', false);

      const payrollMap = {};
      unpaidSessions?.forEach(session => {
         const tId = session.teacher_id;
         if(!payrollMap[tId]) {
            payrollMap[tId] = {
               id: tId,
               name: `${session.teacher?.first_name || ''} ${session.teacher?.last_name || ''}`.trim(),
               hours: 0,
               rate: session.teacher?.hourly_rate || 0,
               total: 0
            };
         }
         payrollMap[tId].hours += 1; 
         payrollMap[tId].total += Number(session.teacher?.hourly_rate || 0);
      });
      const payrollArray = Object.values(payrollMap);
      const totalLiability = payrollArray.reduce((acc, curr) => acc + curr.total, 0);

      const actual = paymentsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      setFinanceData({
        payments: paymentsData || [],
        payroll: payrollArray,
        metrics: { expected, actual, liability: totalLiability, net: actual - totalLiability }
      });

    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setIsFinanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'Estudiantes' || activeSubTab === 'Calendario') fetchDirectoryData();
    if (activeSubTab === 'Pagos') fetchFinanceData();
  }, [activeSubTab]);

  const query = searchQuery.toLowerCase();
  const filteredStudents = students.filter(student => `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase().includes(query));
  const filteredPending = pendingLeads.filter(lead => `${lead.full_name || ''} ${lead.email || ''} ${lead.phone || ''}`.toLowerCase().includes(query));

  // Handle Mark Payroll as Paid
  const handlePayTeacher = async (teacherId) => {
    const isConfirm = window.confirm("¿Confirmas que has transferido el pago a este profesor? Esto reseteará sus horas acumuladas a cero.");
    if(!isConfirm) return;

    try {
      await supabase.from('live_sessions').update({ is_paid_out: true }).eq('teacher_id', teacherId).eq('status', 'completed').eq('is_paid_out', false);
      alert("Nómina liquidada exitosamente.");
      fetchFinanceData();
    } catch (e) {
      console.error(e);
      alert("Error al liquidar nómina.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center font-montserrat relative z-10">

      <StudentRegistrationForm />
      
      <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
        {['Calendario', 'Estudiantes', 'Pagos', 'Inactividad', 'Comunidad'].map((tab) => (
          <button 
            key={tab} type="button" onClick={() => setActiveSubTab(tab)} 
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_15px_rgba(252,211,77,0.4)] scale-105' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
             {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'Calendario' && <AdminCalendar supabase={supabase} />}

      {activeSubTab === 'Estudiantes' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-6 drop-shadow-md">DIRECTORIO DE ESTUDIANTES</h2>
          <input 
            type="text" placeholder="Buscar estudiante o prospecto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-[#070b19] border border-white/20 rounded-xl px-5 py-4 text-sm text-white font-semibold focus:outline-none focus:ring-1 focus:ring-[#fcd34d] transition-colors mb-8 shadow-inner placeholder-white/30" 
          />
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-bold text-white/50 uppercase tracking-widest flex flex-col items-center justify-center gap-3"><div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>Cargando base de datos...</div>
            ) : errorMsg ? (
              <div className="py-12 text-center text-xs font-bold text-red-400/80 uppercase tracking-widest bg-red-500/10 rounded-2xl border border-red-500/20 shadow-inner">{errorMsg}</div>
            ) : (filteredPending.length > 0 || filteredStudents.length > 0) ? (
              <>
                {filteredPending.map((lead) => (
                  <div key={`lead-${lead.id}`} className="flex items-center p-4 bg-[#070b19]/60 rounded-2xl border-l-4 border-l-[#fcd34d] border-y border-r border-white/10 shadow-lg hover:bg-white/5 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fcd34d]/10 to-transparent opacity-50 pointer-events-none"></div>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white/50 mr-4 md:mr-5 shrink-0 shadow-inner z-10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                    <div className="flex flex-col flex-grow mr-4 truncate z-10">
                      <span className="font-bold text-white text-base md:text-lg truncate drop-shadow-md">{lead.full_name}</span>
                      <span className="text-xs text-white/50 font-medium truncate">{lead.email} {lead.phone ? `• ${lead.phone}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 z-10">
                      <span className="hidden md:inline-block bg-[#fcd34d]/20 text-[#fcd34d] border border-[#fcd34d]/30 rounded-md text-[9px] px-2.5 py-1 font-black tracking-widest shadow-sm uppercase animate-pulse">PENDIENTE</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedUser(lead); setIsSelectedPending(true); setIsManagerOpen(true); }} className="bg-[#fcd34d] text-[#08203e] hover:bg-white text-[10px] md:text-xs font-black uppercase px-4 py-2.5 rounded-xl transition-all shadow-[0_0_10px_rgba(252,211,77,0.3)] hover:scale-105 active:scale-95">Gestionar</button>
                    </div>
                  </div>
                ))}
                {filteredStudents.map((student) => (
                  <div key={`student-${student.id}`} onClick={() => { setSelectedUser(student); setIsSelectedPending(false); setIsManagerOpen(true); }} className="flex items-center p-4 bg-black/20 rounded-2xl border border-white/10 shadow-inner hover:border-[#fcd34d]/50 hover:bg-white/5 transition-all group cursor-pointer">
                    <img src={student.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white/20 shadow-md mr-4 md:mr-5 shrink-0 group-hover:border-[#fcd34d]/50 transition-colors" />
                    <span className="font-bold text-white text-base md:text-lg mr-4 truncate flex-grow drop-shadow-md">{student.first_name} {student.last_name}</span>
                    <span className="bg-[#fcd34d] text-[#08203e] rounded-md text-[10px] px-3 py-1.5 font-black tracking-widest mr-3 shrink-0 shadow-md">{student.level?.split(':')[0] || 'A1'}</span>
                    <span className="text-[10px] md:text-xs text-white/40 italic font-bold tracking-widest uppercase shrink-0">({student.role})</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">No se encontraron estudiantes ni prospectos</div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'Pagos' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6 relative z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">BALANCE FINANCIERO</h2>
              <p className="text-sm text-white/50 font-medium mt-2">Métricas en tiempo real del mes en curso.</p>
            </div>
            <button onClick={fetchFinanceData} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
              <svg className={`w-5 h-5 ${isFinanceLoading ? 'animate-spin text-[#fcd34d]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Ingreso Esperado</p>
              <p className="text-3xl font-black text-[#fcd34d]">${financeData.metrics.expected}</p>
            </div>
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Ingreso Recaudado</p>
              <p className="text-3xl font-black text-emerald-400">${financeData.metrics.actual}</p>
            </div>
            <div className="bg-white/5 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Nómina Pendiente</p>
              <p className="text-3xl font-black text-red-400">${financeData.metrics.liability}</p>
            </div>
            <div className="bg-black/30 border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Ganancia Neta</p>
              <p className={`text-3xl font-black ${financeData.metrics.net >= 0 ? 'text-white' : 'text-red-500'}`}>${financeData.metrics.net}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            
            {/* PAYROLL SECTION */}
            <div className="bg-black/20 border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Nómina de Profesores
              </h3>
              {financeData.payroll.length === 0 ? (
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest text-center py-8">Nómina liquidada / Sin clases pendientes</p>
              ) : (
                <div className="space-y-4">
                  {financeData.payroll.map((p) => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{p.name}</p>
                        <p className="text-[10px] text-white/50 uppercase mt-1">{p.hours} Horas Completadas • Tarifa: ${p.rate}/h</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-black text-red-400">${p.total}</span>
                        <button onClick={() => handlePayTeacher(p.id)} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-black uppercase px-3 py-2 rounded-lg transition-colors">Liquidar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TRANSACTIONS SECTION */}
            <div className="bg-black/20 border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Transacciones Recientes
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {financeData.payments.length === 0 ? (
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest text-center py-8">Sin ingresos registrados este mes</p>
                ) : (
                  financeData.payments.map((payment) => (
                    <div key={payment.id} className="bg-white/5 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center gap-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="text-emerald-400 font-black text-xs">${Number(payment.amount)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-xs">{payment.student?.first_name} {payment.student?.last_name}</span>
                          <span className="text-[9px] text-white/50 uppercase mt-0.5">{payment.payment_type} • Ref: {payment.reference_number}</span>
                        </div>
                      </div>
                      <a href={payment.proof_image_url} target="_blank" rel="noreferrer" className="text-[10px] text-[#fcd34d] hover:text-white uppercase font-black tracking-widest flex items-center gap-1 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Ver Recibo
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === 'Inactividad' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-md">ALERTAS DE INACTIVIDAD</h2>
          <div className="py-16 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">Sin datos de actividad reciente</div>
        </div>
      )}

      {activeSubTab === 'Comunidad' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-md">MODERACIÓN DE COMUNIDAD</h2>
          <div className="py-16 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">El chat está vacío</div>
        </div>
      )}

      <StudentManagerModal 
        isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} userData={selectedUser} 
        isPending={isSelectedPending} supabase={supabase} onSuccess={() => { fetchDirectoryData(); if(activeSubTab === 'Pagos') fetchFinanceData(); }} 
      />
    </div>
  );
};

export default CustomerManagement;