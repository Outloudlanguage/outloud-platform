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
  const [financeData, setFinanceData] = useState({
    payments: [],
    payroll: [],
    metrics: { expected: 0, actual: 0, liability: 0, net: 0 },
  });
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);

  // Community & Realtime State
  const [communityTab, setCommunityTab] = useState('BOARD');
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

  // 1. Auth Init
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && isMounted) {
          setCurrentUser(user);
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (isMounted) setAdminProfile(data);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      }
    };
    initAuth();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // 2. Directory Fetcher
  const fetchDirectoryData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [profilesResponse, registrationsResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'Student').order('first_name', { ascending: true }),
        supabase.from('registrations').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      ]);
      if (profilesResponse.error) throw profilesResponse.error;
      if (registrationsResponse.error) throw registrationsResponse.error;

      setStudents(profilesResponse.data || []);
      setPendingLeads(registrationsResponse.data || []);
    } catch (error) {
      console.error('Error fetching directory data:', error);
      setErrorMsg('Error al cargar la base de datos.');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // 3. Finance Fetcher
  const fetchFinanceData = useCallback(async () => {
    setIsFinanceLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: paymentsData } = await supabase
        .from('student_payments')
        .select('*, student:profiles!student_id(first_name, last_name, level)')
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: false });

      const { data: activeStudents } = await supabase
        .from('profiles')
        .select('level')
        .eq('role', 'Student')
        .eq('status', 'active');

      let expected = 0;
      activeStudents?.forEach((s) => {
        const lvl = String(s.level || '');
        if (lvl.includes('C')) expected += 50;
        else if (lvl.includes('B')) expected += 30;
        else expected += 20;
      });

      const { data: unpaidSessions } = await supabase
        .from('live_sessions')
        .select('teacher_id, teacher:profiles!teacher_id(first_name, last_name, hourly_rate)')
        .eq('status', 'completed')
        .eq('is_paid_out', false);

      const payrollMap = {};
      unpaidSessions?.forEach((session) => {
        const tId = session.teacher_id;
        if (!payrollMap[tId]) {
          payrollMap[tId] = {
            id: tId,
            name: `${session.teacher?.first_name || ''} ${session.teacher?.last_name || ''}`.trim(),
            hours: 0,
            rate: session.teacher?.hourly_rate || 0,
            total: 0,
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
        metrics: { expected, actual, liability: totalLiability, net: actual - totalLiability },
      });
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setIsFinanceLoading(false);
    }
  }, [supabase]);

  // 4. Subtab Data Triggers
  useEffect(() => {
    if (activeSubTab === 'Estudiantes' || activeSubTab === 'Inactividad') {
      fetchDirectoryData();
    }
    if (activeSubTab === 'Pagos') {
      fetchFinanceData();
    }
  }, [activeSubTab, fetchDirectoryData, fetchFinanceData]);

  // 5. Community Realtime Listeners
  useEffect(() => {
    if (activeSubTab !== 'Comunidad') return;

    let isMounted = true;
    const fetchCommunity = async () => {
      setIsCommunityLoading(true);
      try {
        const [msgRes, annRes, settingsRes] = await Promise.all([
          supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('platform_settings').select('is_chat_active').eq('id', 1).maybeSingle(),
        ]);
        if (isMounted) {
          if (msgRes.data) setMessages(msgRes.data);
          if (annRes.data) setAnnouncements(annRes.data);
          if (settingsRes.data) setIsChatActive(settingsRes.data.is_chat_active);
          setIsCommunityLoading(false);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.error('Community fetch error:', err);
        if (isMounted) setIsCommunityLoading(false);
      }
    };

    fetchCommunity();

    const messageChannel = supabase
      .channel('cm:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();

    const announcementChannel = supabase
      .channel('cm:announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        setAnnouncements((prev) => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'announcements' }, (payload) => {
        setAnnouncements((prev) => prev.map((a) => (a.id === payload.new.id ? payload.new : a)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'announcements' }, (payload) => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== payload.old.id));
      })
      .subscribe();

    const settingsChannel = supabase
      .channel('cm:platform_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings' }, (payload) => {
        if (payload.new?.id === 1) setIsChatActive(payload.new.is_chat_active);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(announcementChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [activeSubTab, supabase]);

  // Filters & Radar
  const query = searchQuery.toLowerCase();
  const filteredStudents = students.filter((student) =>
    `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase().includes(query)
  );
  const filteredPending = pendingLeads.filter((lead) =>
    `${lead.full_name || ''} ${lead.email || ''} ${lead.phone || ''}`.toLowerCase().includes(query)
  );

  const inactiveStudents = students
    .map((student) => {
      const rawDate = student.last_active_at || student.created_at;
      const lastActive = rawDate ? new Date(rawDate) : new Date();
      const today = new Date();
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
      return { ...student, daysInactive: diffDays };
    })
    .filter((s) => s.status === 'active' && s.daysInactive >= 7)
    .sort((a, b) => b.daysInactive - a.daysInactive);

  const formatPhoneForWA = (phone) => (phone ? String(phone).replace(/\D/g, '') : '');

  const handlePayTeacher = async (teacherId) => {
    const isConfirm = window.confirm(
      '¿Confirmas que has transferido el pago a este profesor? Esto reseteará sus horas acumuladas a cero.'
    );
    if (!isConfirm) return;
    try {
      await supabase
        .from('live_sessions')
        .update({ is_paid_out: true })
        .eq('teacher_id', teacherId)
        .eq('status', 'completed')
        .eq('is_paid_out', false);
      alert('Nómina liquidada exitosamente.');
      fetchFinanceData();
    } catch (e) {
      console.error(e);
      alert('Error al liquidar nómina.');
    }
  };

  const handleToggleChatDb = async () => {
    const newState = !isChatActive;
    setIsChatActive(newState);
    try {
      await supabase.from('platform_settings').update({ is_chat_active: newState }).eq('id', 1);
    } catch (err) {
      console.error(err);
      setIsChatActive(!newState);
      alert('Error al cambiar el estado del chat en la base de datos.');
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
        content: chatInput.trim(),
      });
      setChatInput('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('¿Eliminar este mensaje del chat público?')) return;
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
        audience: announceAudience,
      });
      setAnnounceTitle('');
      setAnnounceContent('');
      alert('Anuncio publicado exitosamente.');
    } catch (error) {
      console.error(error);
      alert('Error publicando anuncio.');
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('¿Eliminar este anuncio global?')) return;
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
      await supabase
        .from('announcements')
        .update({
          title: editingAnnounce.title,
          content: editingAnnounce.content,
          audience: editingAnnounce.audience,
        })
        .eq('id', editingAnnounce.id);
      setEditingAnnounce(null);
      alert('Anuncio actualizado exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error actualizando anuncio.');
    }
  };

  const translateAudience = (audienceCode) => {
    const map = {
      EVERYONE_NO_STAFF: 'Estudiantes (Excluyendo Staff)',
      EVERYONE_WITH_STAFF: 'Toda la Academia',
      STAFF_ONLY: 'Solo Staff',
      LEVEL_A1: 'Solo A1',
      LEVEL_A2: 'Solo A2',
      LEVEL_B1: 'Solo B1',
      LEVEL_B2: 'Solo B2',
      LEVEL_C1: 'Solo C1',
      LEVEL_C2: 'Solo C2',
    };
    return map[audienceCode] || 'Todos';
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center font-montserrat text-[#1e2246] relative z-10 pb-12">
      {/* Floating White Sub-Tab Capsule */}
      <div className="bg-white/95 border-2 border-white rounded-full p-1.5 shadow-[0_12px_28px_-10px_rgba(69,77,130,0.22)] flex flex-wrap justify-center gap-1 mb-7">
        {['Estudiantes', 'Pagos', 'Inactividad', 'Comunidad'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveSubTab(tab)}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === tab
                ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                : 'text-[#454d82] hover:text-[#1e2246] hover:bg-[#f2f4fc]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- ESTUDIANTES TAB --- */}
      {activeSubTab === 'Estudiantes' && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-5 sm:p-8 w-full">
          <div className="mb-6">
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-3 py-1 rounded-full mb-2">
              OutLoud Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-[#1e2246]">Directorio de </span>
              <span className="text-[#626a9f]">
                Estudiantes<span className="text-[#ffc749]">.</span>
              </span>
            </h2>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar estudiante o prospecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl pl-11 pr-5 py-3.5 text-sm text-[#1e2246] font-semibold outline-none shadow-sm placeholder-[#626a9f]/55"
            />
            <svg
              className="w-4 h-4 text-[#626a9f] absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="py-14 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#454d82] uppercase tracking-widest">
                  Cargando base de datos...
                </span>
              </div>
            ) : errorMsg ? (
              <div className="py-10 text-center text-xs font-bold text-[#c93f34] uppercase tracking-widest bg-[#fff2f1] rounded-2xl border-2 border-[#ee665b]/40">
                {errorMsg}
              </div>
            ) : filteredPending.length > 0 || filteredStudents.length > 0 ? (
              <>
                {filteredPending.map((lead) => (
                  <div
                    key={`lead-${lead.id}`}
                    className="flex items-center p-4 bg-gradient-to-r from-[#fff9e8] to-[#ffe69e] rounded-2xl border-2 border-[#ffc749] shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] mr-4 shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col flex-grow mr-4 min-w-0">
                      <span className="font-extrabold text-[#1e2246] text-sm sm:text-base truncate">
                        {lead.full_name}
                      </span>
                      <span className="text-xs text-[#4c5384] font-semibold truncate">
                        {lead.email} {lead.phone ? `• ${lead.phone}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="hidden md:inline-block bg-[#1e2246] text-[#ffc749] rounded-full text-[9.5px] px-3 py-1 font-extrabold tracking-widest uppercase">
                        Pendiente
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(lead);
                          setIsSelectedPending(true);
                          setIsManagerOpen(true);
                        }}
                        className="px-4 py-2 rounded-full font-extrabold text-[11px] uppercase tracking-wider text-[#1e2246] bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] transition-transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>
                ))}

                {filteredStudents.map((student) => {
                  const lvlCode = String(student.level || 'A1').split(':')[0];
                  return (
                    <div
                      key={`student-${student.id}`}
                      onClick={() => {
                        setSelectedUser(student);
                        setIsSelectedPending(false);
                        setIsManagerOpen(true);
                      }}
                      className="flex items-center p-4 bg-white rounded-2xl border-2 border-white hover:border-[#626a9f]/45 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <img
                        src={
                          student.avatar_url ||
                          `https://ui-avatars.com/api/?name=${student.first_name || 'U'}+${student.last_name || ''}&background=626a9f&color=fff`
                        }
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#1e2246]/20 mr-4 shrink-0"
                      />
                      <div className="flex-1 min-w-0 mr-3">
                        <span className="font-extrabold text-[#1e2246] text-sm sm:text-base truncate block">
                          {student.first_name} {student.last_name}
                        </span>
                        <span className="text-[11px] text-[#626a9f] font-semibold uppercase tracking-wider">
                          {student.role}
                        </span>
                      </div>
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          lvlCode.includes('C')
                            ? 'bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246]'
                            : lvlCode.includes('B')
                            ? 'bg-[#5b64a0] text-[#ffc749]'
                            : 'bg-[#e8eaf7] text-[#1e2246]'
                        }`}
                      >
                        {lvlCode}
                      </span>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="py-12 text-center text-xs font-bold text-[#626a9f] uppercase tracking-widest bg-[#f4f6fc] rounded-2xl border border-white">
                No se encontraron estudiantes ni prospectos
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PAGOS FINANCIEROS TAB --- */}
      {activeSubTab === 'Pagos' && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-5 sm:p-8 w-full">
          <div className="flex justify-between items-end mb-7 border-b border-[#626a9f]/15 pb-5">
            <div>
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-3 py-1 rounded-full mb-2">
                Mes en Curso
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="text-[#1e2246]">Balance </span>
                <span className="text-[#626a9f]">
                  Financiero<span className="text-[#ffc749]">.</span>
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchFinanceData}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] cursor-pointer shadow-sm"
              title="Actualizar"
            >
              <svg
                className={`w-5 h-5 ${isFinanceLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#fff9e8] to-[#ffe69e] border-2 border-white rounded-3xl p-5 text-center shadow-sm">
              <p className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1">Ingreso Esperado</p>
              <p className="text-3xl font-extrabold text-[#1e2246]">${financeData.metrics.expected}</p>
            </div>
            <div className="bg-gradient-to-br from-[#ebfcf6] to-[#d1f4e8] border-2 border-[#16a37f]/35 rounded-3xl p-5 text-center shadow-sm">
              <p className="text-[10px] font-bold text-[#128063] uppercase tracking-widest mb-1">Ingreso Recaudado</p>
              <p className="text-3xl font-extrabold text-[#128063]">${financeData.metrics.actual}</p>
            </div>
            <div className="bg-gradient-to-br from-white to-[#fff0ef] border-2 border-[#ee665b]/35 rounded-3xl p-5 text-center shadow-sm">
              <p className="text-[10px] font-bold text-[#c93f34] uppercase tracking-widest mb-1">Nómina Pendiente</p>
              <p className="text-3xl font-extrabold text-[#c93f34]">${financeData.metrics.liability}</p>
            </div>
            <div className="bg-[#1e2246] text-white border-2 border-[#1e2246] rounded-3xl p-5 text-center shadow-md">
              <p className="text-[10px] font-bold text-[#ffc749] uppercase tracking-widest mb-1">Ganancia Neta</p>
              <p className={`text-3xl font-extrabold ${financeData.metrics.net >= 0 ? 'text-white' : 'text-[#ee665b]'}`}>
                ${financeData.metrics.net}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner">
              <h3 className="text-xs font-extrabold text-[#c93f34] uppercase tracking-widest mb-4 border-b border-[#626a9f]/15 pb-3">
                Nómina de Profesores
              </h3>
              {financeData.payroll.length === 0 ? (
                <p className="text-xs text-[#626a9f] font-bold uppercase tracking-widest text-center py-10">
                  Nómina liquidada / Sin clases pendientes
                </p>
              ) : (
                <div className="space-y-3">
                  {financeData.payroll.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-[#dfe2f2] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-extrabold text-[#1e2246]">{p.name}</p>
                        <p className="text-[11px] font-semibold text-[#626a9f] mt-0.5">
                          {p.hours} Horas Completadas • Tarifa: ${p.rate}/h
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-extrabold text-[#c93f34]">${p.total}</span>
                        <button
                          type="button"
                          onClick={() => handlePayTeacher(p.id)}
                          className="px-4 py-2 rounded-full bg-[#ffc749] hover:bg-[#ffd66b] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] text-[#1e2246] text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
                        >
                          Liquidar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner">
              <h3 className="text-xs font-extrabold text-[#128063] uppercase tracking-widest mb-4 border-b border-[#626a9f]/15 pb-3">
                Transacciones Recientes
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {financeData.payments.length === 0 ? (
                  <p className="text-xs text-[#626a9f] font-bold uppercase tracking-widest text-center py-10">
                    Sin ingresos registrados este mes
                  </p>
                ) : (
                  financeData.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white border border-[#dfe2f2] rounded-2xl p-4 flex justify-between items-center gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#e7faf3] border border-[#16a37f]/40 flex items-center justify-center shrink-0">
                          <span className="text-[#128063] font-extrabold text-xs">${Number(payment.amount)}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-[#1e2246] truncate">
                            {payment.student?.first_name} {payment.student?.last_name}
                          </span>
                          <span className="text-[10px] text-[#626a9f] font-semibold truncate">
                            {payment.payment_type} • Ref: {payment.reference_number}
                          </span>
                        </div>
                      </div>
                      {payment.proof_image_url && (
                        <a
                          href={payment.proof_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-[#fff3d1] hover:bg-[#ffc749] text-[#1e2246] border border-[#1e2246] px-3 py-1.5 rounded-full uppercase font-extrabold tracking-wider shrink-0"
                        >
                          Ver Recibo
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- INACTIVIDAD RADAR TAB --- */}
      {activeSubTab === 'Inactividad' && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-5 sm:p-8 w-full">
          <div className="mb-6 border-b border-[#626a9f]/15 pb-5">
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full mb-2">
              Retención Activa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-[#1e2246]">Radar de </span>
              <span className="text-[#626a9f]">
                Inactividad<span className="text-[#ffc749]">.</span>
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4c5384] font-medium mt-1">
              Monitorea estudiantes en riesgo de deserción (7+ días sin actividad).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            <div className="bg-gradient-to-br from-[#fff9e8] to-[#ffe69e] border-2 border-white rounded-3xl p-5 text-center shadow-sm">
              <span className="text-3xl font-extrabold text-[#1e2246]">
                {inactiveStudents.filter((s) => s.daysInactive >= 7 && s.daysInactive < 15).length}
              </span>
              <span className="block text-[10px] font-bold text-[#454d82] uppercase tracking-widest mt-1">
                En Riesgo (7–14 Días)
              </span>
            </div>
            <div className="bg-[#fff4e5] border-2 border-[#f59e0b]/40 rounded-3xl p-5 text-center shadow-sm">
              <span className="text-3xl font-extrabold text-[#b45309]">
                {inactiveStudents.filter((s) => s.daysInactive >= 15 && s.daysInactive <= 30).length}
              </span>
              <span className="block text-[10px] font-bold text-[#92400e] uppercase tracking-widest mt-1">
                Inactivos (15–30 Días)
              </span>
            </div>
            <div className="bg-[#fff2f1] border-2 border-[#ee665b]/45 rounded-3xl p-5 text-center shadow-sm">
              <span className="text-3xl font-extrabold text-[#c93f34]">
                {inactiveStudents.filter((s) => s.daysInactive > 30).length}
              </span>
              <span className="block text-[10px] font-bold text-[#c93f34] uppercase tracking-widest mt-1">
                Desaparecidos (+30 Días)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#454d82] uppercase tracking-widest">Cargando radar...</span>
              </div>
            ) : inactiveStudents.length === 0 ? (
              <div className="py-12 text-center text-xs font-extrabold text-[#128063] uppercase tracking-widest bg-[#e7faf3] rounded-2xl border border-[#16a37f]/40">
                ¡Excelente! Ningún estudiante activo tiene más de 7 días sin conectarse.
              </div>
            ) : (
              inactiveStudents.map((student) => {
                let riskBadge = 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]';
                if (student.daysInactive >= 15 && student.daysInactive <= 30) {
                  riskBadge = 'bg-[#fff4e5] text-[#b45309] border-[#f59e0b]';
                } else if (student.daysInactive > 30) {
                  riskBadge = 'bg-[#fff2f1] text-[#c93f34] border-[#ee665b]';
                }

                return (
                  <div
                    key={`inactive-${student.id}`}
                    className="flex items-center p-4 bg-white rounded-2xl border border-[#dfe2f2] shadow-sm gap-4"
                  >
                    <img
                      src={
                        student.avatar_url ||
                        `https://ui-avatars.com/api/?name=${student.first_name || 'U'}+${student.last_name || ''}&background=626a9f&color=fff`
                      }
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1e2246]/20 shrink-0"
                    />
                    <div className="flex flex-col flex-grow min-w-0">
                      <span className="font-extrabold text-[#1e2246] text-sm sm:text-base truncate">
                        {student.first_name} {student.last_name}
                      </span>
                      <span className="text-xs text-[#626a9f] font-semibold">
                        Nivel {String(student.level || 'A1').split(':')[0]} • Unidad {student.unit || 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`px-3.5 py-2 border-2 rounded-2xl text-center ${riskBadge}`}>
                        <span className="text-lg font-extrabold leading-none block">{student.daysInactive}</span>
                        <span className="text-[8.5px] font-extrabold uppercase tracking-wider">Días</span>
                      </div>
                      <a
                        href={`https://wa.me/${formatPhoneForWA(student.whatsapp || student.phone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-11 h-11 bg-[#16a37f] hover:brightness-105 text-white border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5"
                        title="Contactar por WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- COMUNIDAD & MODERACION TAB --- */}
      {activeSubTab === 'Comunidad' && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-5 sm:p-8 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-3 py-1 rounded-full mb-2">
                Moderación en Tiempo Real
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="text-[#1e2246]">Comunidad y </span>
                <span className="text-[#626a9f]">
                  Moderación<span className="text-[#ffc749]">.</span>
                </span>
              </h2>
            </div>
            {isCommunityLoading && (
              <div className="w-7 h-7 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
            )}
          </div>

          {/* 3-Workspace Pill Switcher */}
          <div className="flex gap-2 bg-[#e8eaf7] p-1 rounded-full border border-white mb-6 overflow-x-auto w-fit max-w-full">
            {[
              { id: 'BOARD', label: 'Tablero de Anuncios' },
              { id: 'CHAT', label: 'Chat Público en Vivo' },
              { id: 'FORUM', label: 'Foro de Discusión' },
            ].map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setCommunityTab(w.id)}
                className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  communityTab === w.id
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246]'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {communityTab === 'BOARD' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#f4f6fc] border border-white rounded-3xl p-6 shadow-inner">
                <h3 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest mb-4 border-b border-[#626a9f]/15 pb-3">
                  Publicar Nuevo Anuncio
                </h3>
                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título del anuncio..."
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-4 py-3 text-sm font-semibold text-[#1e2246] outline-none"
                    required
                  />
                  <select
                    value={announceAudience}
                    onChange={(e) => setAnnounceAudience(e.target.value)}
                    className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-4 py-3 text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
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
                  <textarea
                    placeholder="Escribe el mensaje global..."
                    value={announceContent}
                    onChange={(e) => setAnnounceContent(e.target.value)}
                    className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-4 py-3 text-sm font-medium text-[#1e2246] outline-none h-32 resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Publicar Anuncio →
                  </button>
                </form>
              </div>

              <div className="bg-[#f4f6fc] border border-white rounded-3xl p-6 flex flex-col h-[540px] shadow-inner">
                <h3 className="text-xs font-extrabold text-[#454d82] uppercase tracking-widest mb-4 border-b border-[#626a9f]/15 pb-3">
                  Anuncios Activos ({announcements.length})
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                  {editingAnnounce ? (
                    <form onSubmit={handleUpdateAnnouncement} className="bg-white border-2 border-[#454d82] rounded-2xl p-5 space-y-3.5 shadow-sm">
                      <h4 className="text-[#454d82] font-extrabold uppercase tracking-widest text-xs">
                        Editando Anuncio
                      </h4>
                      <input
                        type="text"
                        value={editingAnnounce.title}
                        onChange={(e) => setEditingAnnounce({ ...editingAnnounce, title: e.target.value })}
                        className="w-full bg-[#f4f6fc] border border-[#dfe2f2] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1e2246] outline-none"
                        required
                      />
                      <select
                        value={editingAnnounce.audience}
                        onChange={(e) => setEditingAnnounce({ ...editingAnnounce, audience: e.target.value })}
                        className="w-full bg-[#f4f6fc] border border-[#dfe2f2] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1e2246] outline-none"
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
                      <textarea
                        value={editingAnnounce.content}
                        onChange={(e) => setEditingAnnounce({ ...editingAnnounce, content: e.target.value })}
                        className="w-full bg-[#f4f6fc] border border-[#dfe2f2] rounded-xl px-4 py-2.5 text-sm font-medium text-[#1e2246] outline-none h-24 resize-none"
                        required
                      />
                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingAnnounce(null)}
                          className="flex-1 py-2.5 rounded-full bg-white border-2 border-[#1e2246] text-[#1e2246] font-bold text-xs uppercase cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-full bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] text-[#1e2246] font-extrabold text-xs uppercase cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  ) : announcements.length === 0 ? (
                    <div className="text-center text-xs text-[#626a9f] font-bold uppercase tracking-widest py-12">
                      No hay anuncios activos.
                    </div>
                  ) : (
                    announcements.map((ann) => (
                      <div key={ann.id} className="bg-white border border-[#dfe2f2] rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-[#1e2246] font-extrabold text-sm sm:text-base">{ann.title}</h4>
                          <span className="bg-[#fff3d1] border border-[#ffc749] text-[#1e2246] text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0">
                            {translateAudience(ann.audience || 'EVERYONE_NO_STAFF')}
                          </span>
                        </div>
                        <p className="text-xs text-[#4c5384] font-medium leading-relaxed">{ann.content}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#dfe2f2]">
                          <span className="text-[10px] text-[#626a9f] font-semibold">
                            {new Date(ann.created_at).toLocaleString('es-ES')}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAnnounce(ann)}
                              className="px-3 py-1 bg-[#e8eaf7] hover:bg-[#1e2246] text-[#454d82] hover:text-[#ffc749] rounded-full text-[10px] font-extrabold uppercase cursor-pointer transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="px-3 py-1 bg-[#ee665b]/15 hover:bg-[#ee665b] text-[#c93f34] hover:text-white rounded-full text-[10px] font-extrabold uppercase cursor-pointer transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {communityTab === 'CHAT' && (
            <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 sm:p-6 flex flex-col h-[640px] w-full max-w-4xl mx-auto shadow-inner">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-5 border-b border-[#626a9f]/15 pb-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#1e2246] uppercase tracking-wider">
                  Moderación del Chat Público
                </h3>
                <button
                  type="button"
                  onClick={handleToggleChatDb}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-[10.5px] font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
                    isChatActive
                      ? 'bg-[#e7faf3] border-[#16a37f] text-[#128063]'
                      : 'bg-[#fff2f1] border-[#ee665b] text-[#c93f34]'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${isChatActive ? 'bg-[#16a37f]' : 'bg-[#ee665b]'}`}
                  />
                  {isChatActive ? 'Chat Global Activo' : 'Chat Global Silenciado'}
                </button>
              </div>

              {!isChatActive && (
                <div className="w-full bg-[#fff2f1] border-2 border-[#ee665b]/50 text-[#c93f34] text-xs font-extrabold uppercase tracking-wider p-3.5 rounded-2xl mb-4 text-center">
                  El chat público está bloqueado. Los estudiantes no pueden enviar mensajes.
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3.5 mb-5 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#626a9f] font-bold uppercase tracking-widest">
                    El chat está silencioso...
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.sender_role?.includes('Admin');
                    const isTeacher = msg.sender_role === 'Teacher';
                    return (
                      <div key={msg.id} className="flex flex-col group">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10.5px] font-extrabold uppercase tracking-wider ${
                              isAdmin ? 'text-[#1e2246]' : isTeacher ? 'text-[#128063]' : 'text-[#454d82]'
                            }`}
                          >
                            {msg.sender_name}
                          </span>
                          <span className="text-[10px] text-[#626a9f] font-semibold">
                            {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-[10px] font-bold text-[#c93f34] opacity-0 group-hover:opacity-100 transition-opacity ml-auto underline cursor-pointer"
                          >
                            Eliminar
                          </button>
                          {msg.is_reported && (
                            <button
                              type="button"
                              onClick={() => handleDismissReport(msg.id)}
                              className="text-[10px] font-bold text-[#454d82] opacity-0 group-hover:opacity-100 transition-opacity underline cursor-pointer ml-2"
                            >
                              Limpiar Reporte
                            </button>
                          )}
                        </div>

                        <div
                          className={`text-sm font-medium py-3 px-4 rounded-2xl w-fit max-w-[85%] shadow-sm ${
                            msg.is_reported
                              ? 'bg-[#fff2f1] border-2 border-[#ee665b] text-[#1e2246]'
                              : isAdmin
                              ? 'bg-[#fff3d1] border-2 border-[#ffc749] text-[#1e2246]'
                              : isTeacher
                              ? 'bg-[#e7faf3] border border-[#16a37f]/45 text-[#1e2246]'
                              : 'bg-white border border-[#dfe2f2] text-[#1e2246]'
                          }`}
                        >
                          {msg.is_reported && (
                            <div className="text-[10px] text-[#c93f34] font-extrabold uppercase tracking-wider mb-1">
                              Reportado por Usuarios
                            </div>
                          )}
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Enviar mensaje oficial como Admin..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-full px-5 py-3 text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
                />
                <button
                  type="submit"
                  className="px-7 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] cursor-pointer"
                >
                  Enviar
                </button>
              </form>
            </div>
          )}

          {communityTab === 'FORUM' && (
            <div className="bg-[#f4f6fc] border border-white rounded-3xl p-12 flex flex-col items-center justify-center min-h-[380px] text-center max-w-4xl mx-auto shadow-inner">
              <div className="w-16 h-16 bg-[#e8eaf7] text-[#454d82] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-2">
                Foro de Discusión
              </h3>
              <p className="text-xs sm:text-sm text-[#4c5384] font-medium max-w-md">
                El módulo de moderación y gestión del foro está disponible directamente desde la pestaña Comms → Forum.
              </p>
              <span className="mt-6 px-4 py-1.5 bg-[#fff3d1] border border-[#ffc749] text-[#1e2246] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                Integrado en Comms
              </span>
            </div>
          )}
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