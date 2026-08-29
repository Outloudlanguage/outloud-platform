import React, { useState, useEffect } from 'react';
import { supabase } from '../../../SupabaseClient';

const AdminCalendar = () => {
  // Navigation & Filter States
  const [baseDate, setBaseDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('OVERALL');
  const [filterTeacherId, setFilterTeacherId] = useState('ALL');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Database States
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Assignment States
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('Unit Class');

  const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
  
  // Updated time range: 8:00 AM to 8:00 PM
  const times = [
    '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm', 
    '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm'
  ];

  // --- 1. DATE LOGIC ---
  const getWeekDates = (date) => {
    const currentDay = date.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(date);
    monday.setDate(date.getDate() + distanceToMonday);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates; 
  };

  const weekDates = getWeekDates(baseDate);
  const currentMonthName = baseDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();

  const handleWeekChange = (direction) => {
    setBaseDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const handleMonthChange = (direction) => {
    setBaseDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getLocalDateString = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // --- 2. DATA FETCHING ---
  const fetchCalendarData = async () => {
    try {
      // Fetch Teachers
      const { data: teachersData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'Teacher');
      
      if (teachersData) {
        setTeachers(teachersData);
        if (teachersData.length > 0) setSelectedTeacherId(teachersData[0].id);
      }

      // Fetch Upcoming 5 Sessions (Global)
      const { data: upcomingData } = await supabase
        .from('live_sessions')
        .select(`
          id, title, class_type, scheduled_at, duration_minutes,
          teacher:profiles!teacher_id(first_name)
        `)
        .gte('scheduled_at', new Date().toISOString())
        .not('teacher_id', 'is', null)
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (upcomingData) setUpcomingActivities(upcomingData);

      // Fetch Sessions strictly for the visible week grid
      const startDate = weekDates[0];
      const endDate = new Date(weekDates[6]);
      endDate.setHours(23, 59, 59, 999);

      const { data: sessionsData, error } = await supabase
        .from('live_sessions')
        .select(`
          *,
          student:profiles!student_id(first_name, last_name),
          teacher:profiles!teacher_id(first_name, last_name)
        `)
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString());
        
      if (error) throw error;

      if (sessionsData) {
        const mappedSessions = sessionsData.map(session => {
          if (!session.scheduled_at) return session;
          const d = new Date(session.scheduled_at);
          const dateStr = getLocalDateString(d);
          
          let hours = d.getHours();
          const ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12; 
          const mins = String(d.getMinutes()).padStart(2, '0');
          const timeStr = `${hours}:${mins} ${ampm}`;
          
          return { ...session, session_date: dateStr, time_slot: timeStr };
        });
        setSessions(mappedSessions);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [baseDate]);

  // --- 3. MODAL ACTIONS ---
  const handleOpenBlock = async () => {
    if (!selectedTeacherId) return alert("Debes asignar un profesor.");
    setIsProcessing(true);
    try {
      const year = selectedSlot.date.getFullYear();
      const month = selectedSlot.date.getMonth();
      const date = selectedSlot.date.getDate();
      
      const [time, modifier] = selectedSlot.timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      if (hours === 12 && modifier.toLowerCase() === 'am') hours = 0;
      if (hours !== 12 && modifier.toLowerCase() === 'pm') hours += 12;
      
      const finalTimestamp = new Date(year, month, date, hours, parseInt(minutes, 10), 0).toISOString();

      const { error } = await supabase.from('live_sessions').insert({
        title: selectedClassType, 
        target_level: 'ALL', 
        scheduled_at: finalTimestamp,
        teacher_id: selectedTeacherId,
        class_type: selectedClassType,
        status: 'available',
        duration_minutes: 60 
      });
      
      if (error) throw error;
      await fetchCalendarData();
      closeSlotModal();
    } catch (error) {
      alert("Error al abrir el bloque.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseBlock = async () => {
    setIsProcessing(true);
    try {
      await supabase.from('live_sessions').delete().eq('id', selectedSlot.data.id);
      await fetchCalendarData();
      closeSlotModal();
    } catch (error) {
      alert("Error al cerrar el bloque.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("¿Cancelar reserva? El bloque volverá a estar disponible.")) return;
    setIsProcessing(true);
    try {
      await supabase.from('live_sessions').update({
        status: 'available',
        student_id: null,
        unit: null
      }).eq('id', selectedSlot.data.id);
      await fetchCalendarData();
      closeSlotModal();
    } catch (error) {
      alert("Error al cancelar la reserva.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlotClick = (dIdx, tIdx, currentData) => {
    setSelectedSlot({ 
      day: dIdx, time: tIdx, date: weekDates[dIdx], timeStr: times[tIdx], data: currentData 
    });
    if (!currentData && teachers.length > 0) {
      setSelectedTeacherId(teachers[0].id);
      setSelectedClassType(activeTab === 'SOCIALS' ? 'Social Activity' : activeTab === 'TUTORING' ? '1-on-1 Tutoring' : 'Unit Class');
    }
  };

  const closeSlotModal = () => setSelectedSlot(null);

  const getSlotStyle = (slotData, isHover) => {
    if (!slotData) return isHover ? 'bg-white/10 text-white border-white/20' : 'bg-black/20 backdrop-blur-sm text-white/40 border-white/5';
    if (slotData.status === 'booked' || slotData.status === 'completed') {
      if (slotData.class_type === 'Unit Class') return 'bg-[#fcd34d] text-black font-black border-[#fcd34d] shadow-[0_0_15px_rgba(252,211,77,0.3)]';
      if (slotData.class_type === '1-on-1 Tutoring') return 'bg-[#3b82f6] text-white font-black border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      if (slotData.class_type === 'Social Activity') return 'bg-[#a855f7] text-white font-black border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.3)]';
    }
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="w-full h-full p-2 md:p-6 font-montserrat flex flex-col xl:flex-row gap-8 animate-fade-in relative z-10">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* LEFT COLUMN: Stats Panel (Title Removed to save vertical space) */}
      <div className="w-full xl:w-1/4 flex flex-col gap-6 relative z-10">
        
        {/* Ring Chart Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col items-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff10" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#fcd34d" strokeWidth="8" strokeDasharray="251" strokeDashoffset="25" className="drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" />
            </svg>
            <span className="absolute text-3xl font-black text-white drop-shadow-md">90%</span>
          </div>
          <p className="text-xs font-black text-white/90 uppercase tracking-widest text-center">STUDENTS BOOKED</p>
        </div>

        {/* Dynamic Upcoming Sessions Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex-1 flex flex-col min-h-[400px]">
          <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-widest drop-shadow-sm">Upcoming</h3>
          
          <ul className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {upcomingActivities.length === 0 ? (
              <li className="text-center text-white/40 text-xs font-bold uppercase tracking-widest py-10">No upcoming sessions</li>
            ) : (
              upcomingActivities.map((act) => {
                const d = new Date(act.scheduled_at);
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                return (
                  <li key={act.id} className="flex flex-col gap-1 text-[11px] bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${act.class_type === 'Unit Class' ? 'bg-[#fcd34d]' : act.class_type === '1-on-1 Tutoring' ? 'bg-[#3b82f6]' : 'bg-[#a855f7]'}`}></div>
                        <span className="font-black text-white uppercase tracking-widest truncate">{act.class_type}</span>
                      </div>
                      <span className="font-bold text-white/80 shrink-0">{timeStr}</span>
                    </div>
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-white/50 truncate pr-2">Prof. {act.teacher?.first_name || 'TBA'}</span>
                      <span className="text-[#fcd34d]/80 font-bold shrink-0">{dateStr}</span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <button className="w-full mt-6 py-4 bg-[#f8fafc] hover:bg-white text-[#0f172a] rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg hover:scale-105 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            REQUEST SUBSTITUTE
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Calendar Grid + Outside Controls */}
      <div className="w-full xl:w-3/4 flex flex-col gap-6 relative z-20 h-[calc(100vh-160px)] max-h-[85vh]">
        
        {/* NEW: Outside Navigation Controls */}
        <div className="flex justify-end w-full shrink-0">
           <div className="flex items-center gap-4 lg:gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full p-2 px-6 shadow-xl">
             <div className="flex items-center gap-2 lg:gap-3">
               <button onClick={() => handleWeekChange(-1)} className="text-white/40 hover:text-white transition-colors p-2 cursor-pointer relative z-30"><svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
               <span className="text-[10px] lg:text-xs font-black text-white uppercase tracking-widest min-w-[70px] text-center">SEMANA</span>
               <button onClick={() => handleWeekChange(1)} className="text-white/40 hover:text-white transition-colors p-2 cursor-pointer relative z-30"><svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
             </div>
             <div className="w-px h-5 bg-white/20"></div>
             <div className="flex items-center gap-2 lg:gap-3">
               <button onClick={() => handleMonthChange(-1)} className="text-white/40 hover:text-white transition-colors p-2 cursor-pointer relative z-30"><svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
               <span className="text-[10px] lg:text-xs font-black text-white uppercase tracking-widest min-w-[90px] text-center">{currentMonthName}</span>
               <button onClick={() => handleMonthChange(1)} className="text-white/40 hover:text-white transition-colors p-2 cursor-pointer relative z-30"><svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
             </div>
           </div>
        </div>

        {/* Fully Glassmorphic Main Grid Container */}
        <div className="flex-1 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative">
          
          {/* Header containing regular tabs AND the Teacher dropdown Tab */}
          <div className="flex flex-col xl:flex-row justify-between items-center p-6 lg:p-8 border-b border-white/10 gap-6 relative z-40">
            <div className="flex gap-2 bg-black/20 p-1.5 rounded-full border border-white/5 overflow-x-auto w-full md:w-auto custom-scrollbar shadow-inner relative">
              {/* Type Tabs */}
              {['OVERALL', 'LIVE LABS', 'TUTORING', 'SOCIALS'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 lg:px-6 py-2.5 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${activeTab === tab ? 'bg-white/20 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                >
                  {tab}
                </button>
              ))}

              {/* Seamless Teacher Dropdown Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                  className={`px-4 lg:px-6 py-2.5 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${filterTeacherId !== 'ALL' || showTeacherDropdown ? 'bg-white/20 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                >
                  TEACHERS {filterTeacherId !== 'ALL' && <span className="bg-[#fcd34d] text-[#08203e] px-1.5 rounded-full text-[9px] ml-1 flex items-center justify-center">✓</span>}
                </button>
                
                {/* The Dropdown Menu */}
                {showTeacherDropdown && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowTeacherDropdown(false)}></div>
                    <div className="absolute top-full mt-3 right-0 w-56 bg-[#070b19]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 flex flex-col">
                       <button onClick={() => { setFilterTeacherId('ALL'); setShowTeacherDropdown(false); }} className={`text-left px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${filterTeacherId === 'ALL' ? 'text-[#fcd34d] bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>ALL TEACHERS</button>
                       <div className="h-px w-full bg-white/10 my-1"></div>
                       {teachers.map(t => (
                         <button key={t.id} onClick={() => { setFilterTeacherId(t.id); setShowTeacherDropdown(false); }} className={`text-left px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors truncate ${filterTeacherId === t.id ? 'text-[#fcd34d] bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                           {t.first_name} {t.last_name}
                         </button>
                       ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 8-Column Grid Headers */}
          <div className="grid grid-cols-[80px_repeat(7,_1fr)] gap-3 px-6 lg:px-8 py-4 bg-white/5 border-b border-white/5 relative z-20">
            <div className="invisible"></div> 
            {dayNames.map((day, idx) => (
              <div key={day} className="flex items-center justify-center gap-2">
                <span className="text-[11px] font-bold text-white/50 tracking-widest">{day}</span>
                <span className="text-[11px] font-black text-white">{weekDates[idx].getDate()}</span>
              </div>
            ))}
          </div>

          {/* Scrollable Slots Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20">
            <div className="p-6 lg:p-8 min-w-[750px]">
              <div className="grid grid-cols-[80px_repeat(7,_1fr)] gap-3">
                {times.map((time, tIdx) => (
                  <React.Fragment key={time}>
                    
                    {/* Y-Axis Label */}
                    <div className="flex items-center justify-end pr-4 text-[11px] font-black text-white/50 tracking-wider select-none">
                      {time}
                    </div>

                    {/* X-Axis Slots */}
                    {dayNames.map((_, dIdx) => {
                      const dateStr = getLocalDateString(weekDates[dIdx]);
                      const slotData = sessions.find(s => {
                        if (s.session_date !== dateStr || s.time_slot.toLowerCase() !== time.toLowerCase()) return false;
                        if (activeTab === 'LIVE LABS' && s.class_type !== 'Unit Class') return false;
                        if (activeTab === 'TUTORING' && s.class_type !== '1-on-1 Tutoring') return false;
                        if (activeTab === 'SOCIALS' && s.class_type !== 'Social Activity') return false;
                        if (filterTeacherId !== 'ALL' && s.teacher_id !== filterTeacherId) return false;
                        return true;
                      });
                      
                      return (
                        <div 
                          key={`${dIdx}-${tIdx}`} 
                          onClick={() => handleSlotClick(dIdx, tIdx, slotData)}
                          className={`h-16 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all relative group hover:scale-[1.02] relative z-30 ${getSlotStyle(slotData, false)}`}
                        >
                          {!slotData ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none">
                               <span className="text-[9px] font-black text-white tracking-widest">+ ABRIR</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center leading-tight p-1 overflow-hidden z-10 pointer-events-none w-full">
                              <span className="text-[10px] font-black truncate w-full px-1">{slotData.student?.first_name || 'Estudiante'}</span>
                              <span className="text-[8px] opacity-80 mt-1 truncate w-full px-1">U{slotData.unit || '?'} • {slotData.teacher?.first_name || 'Prof.'}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- THE MODAL --- */}
      {selectedSlot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#070b19]/95 border border-white/20 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={closeSlotModal} className="absolute top-6 right-6 text-white/50 hover:text-white cursor-pointer"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1">
              {selectedSlot.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <p className="text-[#fcd34d] font-black text-2xl tracking-widest mb-6">{selectedSlot.timeStr}</p>

            {selectedSlot.data?.status === 'booked' || selectedSlot.data?.status === 'completed' ? (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Estado</p>
                  <p className="text-sm font-black text-emerald-400 uppercase">{selectedSlot.data.status === 'completed' ? 'Clase Completada' : 'Clase Reservada'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Estudiante</p>
                    <p className="text-sm font-bold text-white truncate">{selectedSlot.data.student?.first_name || 'Sin Nombre'}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Profesor</p>
                    <p className="text-sm font-bold text-white truncate">{selectedSlot.data.teacher?.first_name || 'Sin Asignar'}</p>
                  </div>
                </div>
                <button disabled={isProcessing} onClick={handleCancelBooking} className="w-full py-3 mt-4 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors border border-red-500/30 cursor-pointer">
                  {isProcessing ? 'Procesando...' : 'Cancelar Reserva'}
                </button>
              </div>
            ) : selectedSlot.data?.status === 'available' ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-widest">Bloque Disponible</h4>
                  <p className="text-xs text-white/60 mt-2">Profesor Asignado: <span className="font-bold text-white">{selectedSlot.data.teacher?.first_name} {selectedSlot.data.teacher?.last_name}</span></p>
                </div>
                <button disabled={isProcessing} onClick={handleCloseBlock} className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/20 cursor-pointer">
                  {isProcessing ? 'Procesando...' : 'Cerrar Disponibilidad'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 bg-white/10 text-white/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-widest mb-1">Bloque Inactivo</h4>
                  <p className="text-xs text-white/60 mb-6">Asigna un profesor para abrir este bloque.</p>
                  
                  <div className="flex flex-col gap-3">
                    <select 
                      value={selectedTeacherId} 
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none focus:border-[#fcd34d] appearance-none text-center cursor-pointer relative z-40"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id} className="text-slate-900">{t.first_name} {t.last_name}</option>
                      ))}
                    </select>
                    <select 
                      value={selectedClassType} 
                      onChange={(e) => setSelectedClassType(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-[#fcd34d] uppercase tracking-widest focus:outline-none appearance-none text-center cursor-pointer relative z-40"
                    >
                      <option value="Unit Class" className="text-slate-900">Unit Class (Regular)</option>
                      <option value="1-on-1 Tutoring" className="text-slate-900">1-on-1 Tutoring</option>
                      <option value="Social Activity" className="text-slate-900">Social Activity</option>
                    </select>
                  </div>
                </div>
                <button disabled={isProcessing} onClick={handleOpenBlock} className="w-full mt-4 py-3.5 bg-[#fcd34d] hover:bg-white text-[#08203e] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)] cursor-pointer">
                  {isProcessing ? 'Procesando...' : 'Abrir Bloque'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;