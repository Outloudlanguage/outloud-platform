import React, { useState, useEffect, useRef, useCallback } from 'react';
import StudentManagerModal from './StudentManagerModal';

const CustomerManagement = ({ supabase }) => {
  const [activeSubTab, setActiveSubTab] = useState('Estudiantes'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  
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

  // Community & Realtime State
  const [communityTab, setCommunityTab] = useState('BOARD'); // Segregates Board, Chat, and Forum
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceAudience, setAnnounceAudience] = useState('EVERYONE_NO_STAFF'); 
  const [isChatActive, setIsChatActive] = useState(true); 
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Editing State for Info Board
  const [editingAnnounce, setEditingAnnounce] = useState(null);

  // 1. STABILIZED AUTH INIT (Runs strictly once on mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          setCurrentUser(user);
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (isMounted) setAdminProfile(data);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, []); // Empty dependency array prevents the infinite render loop

  // 2. DIRECTORY FETCHER
  const fetchDirectoryData = useCallback(async () => {
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
  }, [supabase]);

  // 3. FINANCE FETCHER
  const fetchFinanceData = useCallback(async () => {
    setIsFinanceLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: paymentsData } = await supabase
        .from('student_payments')
        .select(`*, student:profiles!student_id(first_name, last_name, level)`)
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: false });

      const { data: activeStudents } = await supabase
        .from('profiles')
        .select('level')
        .eq('role', 'Student')
        .eq('status', 'active');

      let expected = 0;
      activeStudents?.forEach(s => {
        const lvl = String(s.level || '');
        if (lvl.includes('C')) expected += 50;
        else if (lvl.includes('B')) expected += 30;
        else expected += 20;
      });

      const { data: unpaidSessions } = await supabase
        .from('live_sessions')
        .select(`teacher_id, teacher:profiles!teacher_id(first_name, last_name, hourly_rate)`)
        .eq('status', 'completed')
        .eq('is_paid_out', false);

      const payrollMap = {};
      unpaidSessions?.forEach(session => {
        const tId = session.teacher_id;
        if (!payrollMap[tId]) {
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
      const actual = paymentsData?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

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
  }, [supabase]);

  // 4. SUBTAB DATA TRIGGERS
  useEffect(() => {
    if (activeSubTab === 'Estudiantes' || activeSubTab === 'Inactividad') {
      fetchDirectoryData();
    }
    if (activeSubTab === 'Pagos') {
      fetchFinanceData();
    }
  }, [activeSubTab, fetchDirectoryData, fetchFinanceData]);

  // 5. COMMUNITY REALTIME LISTENERS
  useEffect(() => {
    if (activeSubTab !== 'Comunidad') return;

    let isMounted = true;
    const fetchCommunity = async () => {
      setIsCommunityLoading(true);
      try {
        const [msgRes, annRes, settingsRes] = await Promise.all([
          supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('platform_settings').select('is_chat_active').eq('id', 1).maybeSingle()
        ]);
        if (isMounted) {
          if (msgRes.data) setMessages(msgRes.data);
          if (annRes.data) setAnnouncements(annRes.data);
          if (settingsRes.data) setIsChatActive(settingsRes.data.is_chat_active);
          setIsCommunityLoading(false);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.error("Community fetch error:", err);
        if (isMounted) setIsCommunityLoading(false);
      }
    };

    fetchCommunity();

    const messageChannel = supabase.channel('cm:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      }).subscribe();

    const announcementChannel = supabase.channel('cm:announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncements(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncements(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncements(prev => prev.filter(a => a.id !== payload.old.id));
      }).subscribe();

    const settingsChannel = supabase.channel('cm:platform_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings' }, payload => {
        if (payload.new?.id === 1) setIsChatActive(payload.new.is_chat_active);
      }).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(announcementChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [activeSubTab, supabase]);

  // --- FILTERS & RADAR ---
  const query = searchQuery.toLowerCase();
  const filteredStudents = students.filter(student => 
    `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase().includes(query)
  );
  const filteredPending = pendingLeads.filter(lead => 
    `${lead.full_name || ''} ${lead.email || ''} ${lead.phone || ''}`.toLowerCase().includes(query)
  );

  const inactiveStudents = students.map(student => {
    const rawDate = student.last_active_at || student.created_at;
    const lastActive = rawDate ? new Date(rawDate) : new Date();
    const today = new Date();
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
    return { ...student, daysInactive: diffDays };
  }).filter(s => s.status === 'active' && s.daysInactive >= 7).sort((a, b) => b.daysInactive - a.daysInactive);

  const formatPhoneForWA = (phone) => phone ? String(phone).replace(/\D/g, '') : '';

  const handlePayTeacher = async (teacherId) => {
    const isConfirm = window.confirm("¿Confirmas que has transferido el pago a este profesor? Esto reseteará sus horas acumuladas a cero.");
    if (!isConfirm) return;
    try {
      await supabase.from('live_sessions').update({ is_paid_out: true }).eq('teacher_id', teacherId).eq('status', 'completed').eq('is_paid_out', false);
      alert("Nómina liquidada exitosamente.");
      fetchFinanceData();
    } catch (e) {
      console.error(e);
      alert("Error al liquidar nómina.");
    }
  };

  // --- ACTIONS ---
  const handleToggleChatDb = async () => {
    const newState = !isChatActive;
    setIsChatActive(newState);
    try {
      await supabase.from('platform_settings').update({ is_chat_active: newState }).eq('id', 1);
    } catch (err) {
      console.error(err);
      setIsChatActive(!newState);
      alert("Error al cambiar el estado del chat en la base de datos.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser || !adminProfile) return;
    try {
      await supabase.from('messages').insert({
        sender_id: currentUser.id,
        sender_name: `${adminProfile.first_name || ''} ${adminProfile.last_name || ''}`.trim() || 'Admin',
        sender_role: adminProfile.role || 'Admin',
        content: chatInput.trim()
      });
      setChatInput('');
    } catch (error) { 
      console.error(error); 
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("¿Eliminar este mensaje del chat público?")) return;
    try { 
      await supabase.from('messages').delete().eq('id', msgId); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const handleDismissReport = async (msgId) => {
    try { 
      await supabase.from('messages').update({ is_reported: false }).eq('id', msgId); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim() || !currentUser) return;
    try {
      await supabase.from('announcements').insert({
        author_id: currentUser.id,
        title: announceTitle.trim(),
        content: announceContent.trim(),
        audience: announceAudience 
      });
      setAnnounceTitle('');
      setAnnounceContent('');
      alert("Anuncio publicado exitosamente.");
    } catch (error) { 
      console.error(error); 
      alert("Error publicando anuncio."); 
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm("¿Eliminar este anuncio global?")) return;
    try { 
      await supabase.from('announcements').delete().eq('id', annId); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    if (!editingAnnounce) return;
    try {
      await supabase.from('announcements').update({
        title: editingAnnounce.title,
        content: editingAnnounce.content,
        audience: editingAnnounce.audience
      }).eq('id', editingAnnounce.id);
      setEditingAnnounce(null);
      alert("Anuncio actualizado exitosamente.");
    } catch (err) {
      console.error(err);
      alert("Error actualizando anuncio.");
    }
  };

  const translateAudience = (audienceCode) => {
    const map = {
      'EVERYONE_NO_STAFF': 'Estudiantes (Excluyendo Staff)',
      'EVERYONE_WITH_STAFF': 'Toda la Academia',
      'STAFF_ONLY': 'Solo Staff',
      'LEVEL_A1': 'Solo A1',
      'LEVEL_A2': 'Solo A2',
      'LEVEL_B1': 'Solo B1',
      'LEVEL_B2': 'Solo B2',
      'LEVEL_C1': 'Solo C1',
      'LEVEL_C2': 'Solo C2',
    };
    return map[audienceCode] || 'Todos';
  };

  return (
    <div className="w-full flex flex-col items-center font-montserrat relative z-10">
      
      {/* Sub-Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
        {['Estudiantes', 'Pagos', 'Inactividad', 'Comunidad'].map((tab) => (
          <button 
            key={tab} type="button" onClick={() => setActiveSubTab(tab)} 
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === tab 
                ? 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_15px_rgba(252,211,77,0.4)] scale-105' 
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
             {tab}
          </button>
        ))}
      </div>

      {/* --- ESTUDIANTES TAB --- */}
      {activeSubTab === 'Estudiantes' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-6 drop-shadow-md">DIRECTORIO DE ESTUDIANTES</h2>
          <input 
            type="text" placeholder="Buscar estudiante o prospecto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-[#070b19] border border-white/20 rounded-xl px-5 py-4 text-sm text-white font-semibold focus:outline-none focus:ring-1 focus:ring-[#fcd34d] transition-colors mb-8 shadow-inner placeholder-white/30" 
          />
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-bold text-white/50 uppercase tracking-widest flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
                Cargando base de datos...
              </div>
            ) : errorMsg ? (
              <div className="py-12 text-center text-xs font-bold text-red-400/80 uppercase tracking-widest bg-red-500/10 rounded-2xl border border-red-500/20 shadow-inner">{errorMsg}</div>
            ) : (filteredPending.length > 0 || filteredStudents.length > 0) ? (
              <>
                {filteredPending.map((lead) => (
                  <div key={`lead-${lead.id}`} className="flex items-center p-4 bg-[#070b19]/60 rounded-2xl border-l-4 border-l-[#fcd34d] border-y border-r border-white/10 shadow-lg hover:bg-white/5 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fcd34d]/10 to-transparent opacity-50 pointer-events-none"></div>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white/50 mr-4 md:mr-5 shrink-0 shadow-inner z-10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
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
                    <span className="bg-[#fcd34d] text-[#08203e] rounded-md text-[10px] px-3 py-1.5 font-black tracking-widest mr-3 shrink-0 shadow-md">{String(student.level || 'A1').split(':')[0]}</span>
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

      {/* --- PAGOS FINANCIEROS TAB --- */}
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

      {/* --- INACTVIDAD ENGINE TAB --- */}
      {activeSubTab === 'Inactividad' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6 relative z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">RADAR DE INACTIVIDAD</h2>
              <p className="text-sm text-white/50 font-medium mt-2">Monitorea estudiantes en riesgo de deserción (7+ días sin actividad).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
            <div className="bg-white/5 border border-[#fcd34d]/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-[#fcd34d]">{inactiveStudents.filter(s => s.daysInactive >= 7 && s.daysInactive < 15).length}</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">En Riesgo (7-14 Días)</span>
            </div>
            <div className="bg-white/5 border border-orange-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-orange-400">{inactiveStudents.filter(s => s.daysInactive >= 15 && s.daysInactive <= 30).length}</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Inactivos (15-30 Días)</span>
            </div>
            <div className="bg-white/5 border border-red-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
              <span className="text-2xl font-black text-red-500">{inactiveStudents.filter(s => s.daysInactive > 30).length}</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Desaparecidos (+30 Días)</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {isLoading ? (
               <div className="py-12 text-center text-xs font-bold text-white/50 uppercase tracking-widest flex flex-col items-center justify-center gap-3">
                 <div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
                 Cargando radar...
               </div>
            ) : inactiveStudents.length === 0 ? (
               <div className="py-12 text-center text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                 ¡Excelente! Ningún estudiante activo tiene más de 7 días sin conectarse.
               </div>
            ) : (
               inactiveStudents.map((student) => {
                 let riskColor = "text-[#fcd34d] border-[#fcd34d]/30 bg-[#fcd34d]/10";
                 if (student.daysInactive >= 15 && student.daysInactive <= 30) {
                    riskColor = "text-orange-400 border-orange-500/30 bg-orange-500/10";
                 } else if (student.daysInactive > 30) {
                    riskColor = "text-red-500 border-red-500/40 bg-red-500/10";
                 }

                 return (
                   <div key={`inactive-${student.id}`} className="flex items-center p-4 md:p-5 bg-[#070b19]/60 rounded-2xl border border-white/10 shadow-lg transition-all relative overflow-hidden">
                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 overflow-hidden border-2 border-white/20 shrink-0 z-10 mr-4">
                       <img src={student.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col flex-grow truncate z-10">
                       <span className="font-bold text-white text-sm md:text-base truncate">{student.first_name} {student.last_name}</span>
                       <span className="text-[10px] md:text-xs text-white/50 font-medium truncate mt-0.5">Nivel {String(student.level || 'A1').split(':')[0]} • Unidad {student.unit || 1}</span>
                     </div>
                     <div className="flex items-center gap-4 shrink-0 z-10">
                       <div className={`flex flex-col items-center justify-center px-4 py-2 border rounded-xl shadow-inner ${riskColor}`}>
                          <span className="text-xl font-black leading-none">{student.daysInactive}</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Días Sin Actividad</span>
                       </div>
                       <a href={`https://wa.me/${formatPhoneForWA(student.phone)}`} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 hover:bg-emerald-400 text-[#08203e] rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-95" title="Contactar por WhatsApp">
                         <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                       </a>
                     </div>
                   </div>
                 );
               })
            )}
          </div>
        </div>
      )}

      {/* --- COMUNIDAD & MODERATION TAB --- */}
      {activeSubTab === 'Comunidad' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">COMUNIDAD Y MODERACIÓN</h2>
              <p className="text-sm text-white/50 font-medium mt-2">Gestiona el Info Board, el Chat en Vivo y el Foro de forma independiente.</p>
            </div>
            {isCommunityLoading && <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          {/* ISOLATED INTERNAL NAVIGATION FOR THE 3 WORKSPACES */}
          <div className="flex gap-4 border-b border-white/10 pb-4 mb-6 relative z-10 overflow-x-auto custom-scrollbar">
             <button 
                onClick={() => setCommunityTab('BOARD')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  communityTab === 'BOARD' 
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
             >
                Tablero de Anuncios (Info Board)
             </button>
             <button 
                onClick={() => setCommunityTab('CHAT')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  communityTab === 'CHAT' 
                    ? 'bg-emerald-500 text-[#08203e] shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
             >
                Chat Público en Vivo
             </button>
             <button 
                onClick={() => setCommunityTab('FORUM')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  communityTab === 'FORUM' 
                    ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
             >
                Foro de Discusión
             </button>
          </div>

          <div className="relative z-10">
            {/* WORKSPACE 1: INFO BOARD */}
            {communityTab === 'BOARD' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Board: Create Announcement Form */}
                <div className="bg-black/20 border border-indigo-500/30 rounded-3xl p-6 flex flex-col">
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    Publicar Nuevo Anuncio
                  </h3>

                  <form onSubmit={handlePostAnnouncement} className="space-y-4">
                    <input type="text" placeholder="Título del anuncio..." value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400" required />
                    
                    <select 
                      value={announceAudience} 
                      onChange={(e) => setAnnounceAudience(e.target.value)} 
                      className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 appearance-none"
                      required
                    >
                      <option value="EVERYONE_NO_STAFF">Todos los Estudiantes (Excluyendo Staff)</option>
                      <option value="EVERYONE_WITH_STAFF">Toda la Academia (Incluyendo Staff)</option>
                      <option value="STAFF_ONLY">Solo Staff (Profesores y Administradores)</option>
                      <option value="LEVEL_A1">Solo Nivel A1</option>
                      <option value="LEVEL_A2">Solo Nivel A2</option>
                      <option value="LEVEL_B1">Solo Nivel B1</option>
                      <option value="LEVEL_B2">Solo Nivel B2</option>
                      <option value="LEVEL_C1">Solo Nivel C1</option>
                      <option value="LEVEL_C2">Solo Nivel C2</option>
                    </select>

                    <textarea placeholder="Escribe el mensaje global..." value={announceContent} onChange={(e) => setAnnounceContent(e.target.value)} className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 h-32 resize-none" required />
                    <button type="submit" className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]">Publicar Anuncio</button>
                  </form>
                </div>

                {/* Board: Management List */}
                <div className="bg-black/20 border border-white/10 rounded-3xl p-6 flex flex-col h-[600px]">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Anuncios Activos</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {editingAnnounce ? (
                      <form onSubmit={handleUpdateAnnouncement} className="bg-white/5 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
                        <h3 className="text-indigo-400 font-black uppercase tracking-widest text-sm mb-2">Editando Anuncio</h3>
                        <input type="text" value={editingAnnounce.title} onChange={(e) => setEditingAnnounce({...editingAnnounce, title: e.target.value})} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400" required />
                        <select 
                          value={editingAnnounce.audience} 
                          onChange={(e) => setEditingAnnounce({...editingAnnounce, audience: e.target.value})} 
                          className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 appearance-none"
                        >
                          <option value="EVERYONE_NO_STAFF">Todos los Estudiantes (Excluyendo Staff)</option>
                          <option value="EVERYONE_WITH_STAFF">Toda la Academia (Incluyendo Staff)</option>
                          <option value="STAFF_ONLY">Solo Staff (Profesores y Administradores)</option>
                          <option value="LEVEL_A1">Solo Nivel A1</option>
                          <option value="LEVEL_A2">Solo Nivel A2</option>
                          <option value="LEVEL_B1">Solo Nivel B1</option>
                          <option value="LEVEL_B2">Solo Nivel B2</option>
                          <option value="LEVEL_C1">Solo Nivel C1</option>
                          <option value="LEVEL_C2">Solo Nivel C2</option>
                        </select>
                        <textarea value={editingAnnounce.content} onChange={(e) => setEditingAnnounce({...editingAnnounce, content: e.target.value})} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400 h-24 resize-none" required />
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setEditingAnnounce(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all">Cancelar</button>
                          <button type="submit" className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]">Guardar</button>
                        </div>
                      </form>
                    ) : announcements.length === 0 ? (
                      <div className="text-center text-xs text-white/40 font-bold uppercase tracking-widest py-10">No hay anuncios activos.</div>
                    ) : (
                      announcements.map(ann => (
                        <div key={ann.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-indigo-500/50 transition-colors group">
                          <div>
                            <h4 className="text-white font-bold tracking-wide text-lg">{ann.title}</h4>
                            <div className="mt-1 mb-2 inline-block bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                              {translateAudience(ann.audience || 'EVERYONE_NO_STAFF')}
                            </div>
                            <p className="text-xs text-white/60">{ann.content}</p>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-2">{new Date(ann.created_at).toLocaleString('es-ES')}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingAnnounce(ann)} className="px-4 py-1.5 bg-white/10 hover:bg-indigo-500 hover:text-white text-white/70 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Editar</button>
                            <button onClick={() => handleDeleteAnnouncement(ann.id)} className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Eliminar</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE 2: CHAT ROOM */}
            {communityTab === 'CHAT' && (
              <div className="bg-black/20 border border-emerald-500/30 rounded-3xl p-6 flex flex-col h-[700px] w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                    Moderación del Chat Público
                  </h3>

                  <button 
                    onClick={handleToggleChatDb} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                      isChatActive 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30' 
                        : 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${isChatActive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400 shadow-[0_0_8px_#f87171]'}`}></div>
                    {isChatActive ? 'Chat Global Activo' : 'Chat Global Silenciado'}
                  </button>
                </div>

                {!isChatActive && (
                  <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest p-4 rounded-xl mb-4 text-center">
                    ⚠️ El chat público está bloqueado. Los estudiantes no pueden enviar mensajes.
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4 mb-6 flex flex-col">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-white/40 font-bold uppercase tracking-widest">El chat está silencioso...</div>
                  ) : (
                    messages.map(msg => {
                      const isAdmin = msg.sender_role?.includes('Admin');
                      const isTeacher = msg.sender_role === 'Teacher';
                      return (
                        <div key={msg.id} className="flex flex-col group">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-[#fcd34d]' : isTeacher ? 'text-emerald-400' : 'text-white/60'}`}>{msg.sender_name}</span>
                            <span className="text-[8px] text-white/30">{new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' })}</span>
                            <button onClick={() => handleDeleteMessage(msg.id)} className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto underline cursor-pointer hover:text-red-400">Eliminar</button>
                            {msg.is_reported && <button onClick={() => handleDismissReport(msg.id)} className="text-[10px] text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity underline cursor-pointer ml-2">Limpiar Reporte</button>}
                          </div>
                          <div className={`text-sm py-3 px-4 rounded-xl w-fit max-w-[85%] ${
                            msg.is_reported 
                              ? 'bg-red-500/20 border-2 border-red-500/50 text-white' 
                              : isAdmin 
                              ? 'bg-[#fcd34d]/20 text-[#fcd34d] border border-[#fcd34d]/30' 
                              : isTeacher 
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                              : 'bg-white/10 text-white/90 border border-white/5'
                          }`}>
                            {msg.is_reported && <div className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1">⚠️ REPORTADO POR USUARIOS</div>}
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input type="text" placeholder="Enviar mensaje oficial como Admin..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-[#070b19] border border-white/20 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-400 shadow-inner" />
                  <button type="submit" className="px-8 bg-emerald-500 hover:bg-emerald-400 text-[#08203e] rounded-xl font-black transition-colors shadow-lg active:scale-95">ENVIAR</button>
                </form>
              </div>
            )}

            {/* WORKSPACE 3: FORUM */}
            {communityTab === 'FORUM' && (
              <div className="bg-black/20 border border-purple-500/30 rounded-3xl p-12 flex flex-col items-center justify-center h-[500px] text-center w-full max-w-4xl mx-auto">
                <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-6 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Foro de Discusión</h3>
                <p className="text-sm text-white/50 max-w-md">El módulo de moderación y gestión del foro está siendo estructurado. Este espacio está reservado para su próxima actualización.</p>
                <div className="mt-8 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Módulo en Construcción
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <StudentManagerModal 
        isOpen={isManagerOpen} 
        onClose={() => setIsManagerOpen(false)} 
        userData={selectedUser} 
        isPending={isSelectedPending} 
        supabase={supabase} 
        onSuccess={() => { 
          fetchDirectoryData(); 
          if (activeSubTab === 'Pagos') fetchFinanceData(); 
        }} 
      />
    </div>
  );
};

export default CustomerManagement;