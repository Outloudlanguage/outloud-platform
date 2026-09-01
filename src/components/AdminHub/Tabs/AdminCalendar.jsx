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
  
  // Booking & Unbooked Students States
  const [bookedPercentage, setBookedPercentage] = useState(0);
  const [unbookedStudents, setUnbookedStudents] = useState([]);
  const [showUnbookedModal, setShowUnbookedModal] = useState(false);
  
  // Assignment States
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('Unit Class');
  const [selectedUnit, setSelectedUnit] = useState(1);

  const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
  
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

      // Fetch All Students (to compare against booked sessions)
      const { data: allStudentsData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, current_lesson') 
        .eq('role', 'Student');

      // Fetch Upcoming Activities
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

      // Fetch Weekly Sessions
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
          
          // Snap to the grid: Force minutes to '00' so it drops into the correct UI bucket
          const timeStr = `${hours}:00 ${ampm}`;
          
          // Preserve the exact precise time for the modal display
          const exactMins = String(d.getMinutes()).padStart(2, '0');
          const exactTimeStr = `${hours}:${exactMins} ${ampm}`;
          
          return { ...session, session_date: dateStr, time_slot: timeStr, exact_time: exactTimeStr };
        });
        setSessions(mappedSessions);

        // --- Calculate Bookings & Unbooked Students ---
        const totalStudents = allStudentsData ? allStudentsData.length : 0;
        
        // Find which students have a booked or completed status this week
        const bookedStudentIds = new Set(
          sessionsData
            .filter(s => s.status === 'booked' || s.status === 'completed')
            .map(s => s.student_id)
            .filter(Boolean)
        );

        // Filter out the students who are already booked
        if (allStudentsData) {
          const unbooked = allStudentsData.filter(student => !bookedStudentIds.has(student.id));
          setUnbookedStudents(unbooked);
          
          // Set real percentage
          const calculatedPercentage = totalStudents > 0 ? Math.round((bookedStudentIds.size / totalStudents) * 100) : 0;
          setBookedPercentage(calculatedPercentage);
        }
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
        title: selectedClassType === 'Unit Class' ? `Unit ${selectedUnit}` : selectedClassType, 
        target_level: 'ALL', 
        scheduled_at: finalTimestamp,
        teacher_id: selectedTeacherId,
        class_type: selectedClassType,
        status: 'available',
        duration_minutes: 60,
        unit: selectedClassType === 'Unit Class' ? selectedUnit : null
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
      setSelectedUnit(1);
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

  // Ring Chart Mathematical Logic
  const circleRadius = 75;
  const circleCircumference = 2 * Math.PI * circleRadius; 
  const strokeDashoffset = circleCircumference - (bookedPercentage / 100) * circleCircumference;

  return (
    <div className="w-full h-[calc(100vh-100px)] min-h-[700px] p-2 md:p-6 font-montserrat flex flex-col gap-4 lg:gap-6 animate-fade-in relative z-10 overflow-visible">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* TOP NAVIGATION ROW */}
      <div className="absolute -top-12 lg:-top-16 right-2 lg:right-6 z-50 flex justify-end shrink-0">
         {/* Fix applied: Outer Wrapper for the pill */}
         <div className="relative border border-white/10 rounded-full shadow-xl overflow-hidden group">
           {/* Layer 1: Oversized Blur */}
           <div className="absolute -inset-4 bg-white/5 backdrop-blur-2xl -z-10" />
           {/* Layer 2: Content Container */}
           <div className="relative z-10 flex items-center gap-4 lg:gap-6 p-2 px-6">
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
      </div>

      {/* MAIN CONTENT SPLIT ROW */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1 min-h-0 relative z-20 mt-4 lg:mt-0">
        
        {/* LEFT COLUMN */}
        <div className="w-full xl:w-[30%] flex flex-col gap-6 h-full shrink-0">
          
          {/* Ring Chart as a Button - Fix applied */}
          <button 
            onClick={() => setShowUnbookedModal(true)}
            className="group relative w-full border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] shrink-0 transform-gpu cursor-pointer outline-none"
          >
            {/* Layer 1: Oversized Blur & Hover Background */}
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-2xl -z-10 group-hover:bg-white/10 transition-colors duration-300" />
            
            {/* Layer 2: Content Container */}
            <div className="relative w-full h-full p-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="75" fill="none" stroke="#ffffff10" strokeWidth="12" />
                  <circle 
                    cx="90" cy="90" r="75" fill="none" stroke="#fcd34d" strokeWidth="12" 
                    strokeDasharray={circleCircumference} 
                    strokeDashoffset={strokeDashoffset} 
                    className="drop-shadow-[0_0_15px_rgba(252,211,77,0.7)] transition-all duration-1000 ease-out" 
                  />
                </svg>
                <span className="absolute text-3xl lg:text-4xl font-black text-white drop-shadow-md">{bookedPercentage}%</span>
              </div>
              <p className="text-xs lg:text-sm font-black text-white/90 uppercase tracking-widest text-center group-hover:text-[#fcd34d] transition-colors">STUDENTS BOOKED</p>
            </div>
          </button>

          {/* Upcoming Sessions Card - Fix applied */}
          <div className="relative border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex-1 flex flex-col min-h-0 transform-gpu">
            
            {/* Layer 1: Oversized Blur */}
            <div className="absolute -inset-4 bg-white/5 backdrop-blur-2xl -z-10" />

            {/* Layer 2: Content Container */}
            <div className="relative w-full h-full p-6 lg:p-8 flex flex-col min-h-0 z-10">
              <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-widest drop-shadow-sm shrink-0">Upcoming</h3>
              
              <ul className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
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

              <button className="w-full mt-6 py-5 bg-[#f8fafc] hover:bg-white text-[#0f172a] rounded-2xl font-black text-[13px] lg:text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                REQUEST SUBSTITUTE
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Calendar Grid - Fix applied */}
        <div className="w-full xl:w-[70%] relative border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transform-gpu h-full flex flex-col">
          
          {/* Layer 1: Oversized Blur */}
          <div className="absolute -inset-4 bg-white/5 backdrop-blur-2xl -z-10" />

          {/* Layer 2: Content Container */}
          <div className="relative w-full h-full flex flex-col z-10 min-h-0">
            {/* Header containing Tabs */}
            <div className="flex flex-col xl:flex-row justify-between items-center p-4 lg:p-6 border-b border-white/10 gap-4 relative z-40 shrink-0">
              <div className="flex w-full gap-1 lg:gap-2 bg-black/20 p-1.5 lg:p-2 rounded-full border border-white/5 shadow-inner relative">
                {['OVERALL', 'LIVE LABS', 'TUTORING', 'SOCIALS'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-2 py-2 lg:py-2.5 rounded-full text-[9px] lg:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer text-center ${activeTab === tab ? 'bg-white/20 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                  >
                    {tab}
                  </button>
                ))}

                <div className="relative flex-1">
                  <button 
                    onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                    className={`w-full h-full flex items-center justify-center gap-1.5 px-2 py-2 lg:py-2.5 rounded-full text-[9px] lg:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${filterTeacherId !== 'ALL' || showTeacherDropdown ? 'bg-white/20 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                  >
                    TEACHERS {filterTeacherId !== 'ALL' && <span className="bg-[#fcd34d] text-[#08203e] px-1 rounded-full text-[7px] ml-0.5 flex items-center justify-center">✓</span>}
                  </button>
                  
                  {showTeacherDropdown && (
                    <>
                      <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowTeacherDropdown(false)}></div>
                      <div className="absolute top-full mt-3 right-0 w-56 bg-[#070b19]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 flex flex-col">
                         <button onClick={() => { setFilterTeacherId('ALL'); setShowTeacherDropdown(false); }} className={`text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${filterTeacherId === 'ALL' ? 'text-[#fcd34d] bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>ALL TEACHERS</button>
                         <div className="h-px w-full bg-white/10 my-1"></div>
                         {teachers.map(t => (
                           <button key={t.id} onClick={() => { setFilterTeacherId(t.id); setShowTeacherDropdown(false); }} className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors truncate ${filterTeacherId === t.id ? 'text-[#fcd34d] bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                             {t.first_name} {t.last_name}
                           </button>
                         ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 7-Column Grid Headers */}
            <div className="grid grid-cols-7 gap-2 lg:gap-3 px-4 lg:px-6 py-4 bg-white/5 border-b border-white/5 relative z-20 shrink-0">
              {dayNames.map((day, idx) => (
                <div key={day} className="flex items-center justify-center gap-1.5">
                  <span className="text-[10px] lg:text-[11px] font-bold text-white/50 tracking-widest">{day}</span>
                  <span className="text-[10px] lg:text-[11px] font-black text-white">{weekDates[idx].getDate()}</span>
                </div>
              ))}
            </div>

            {/* Scrollable Slots Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 min-h-0">
              <div className="p-4 lg:p-6 w-full min-w-0">
                <div className="grid grid-cols-7 gap-2 lg:gap-3">
                  {times.map((time, tIdx) => (
                    <React.Fragment key={time}>
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
                            className={`h-16 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all relative group hover:scale-[1.02] z-30 overflow-hidden ${getSlotStyle(slotData, false)}`}
                          >
                            <span className="absolute top-1 left-2 text-[7px] lg:text-[8px] font-black opacity-40 uppercase tracking-tighter pointer-events-none">
                              {time}
                            </span>

                            {!slotData ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none">
                                 <span className="text-[9px] font-black text-white tracking-widest">+ ABRIR</span>
                              </div>
                            ) : slotData.status === 'available' ? (
                              <div className="flex flex-col items-center justify-center text-center leading-tight p-1 overflow-hidden z-10 pointer-events-none w-full mt-2">
                                <span className="text-[9px] md:text-[10px] font-black text-emerald-400 truncate w-full px-1 uppercase">{slotData.class_type === 'Unit Class' ? `Unidad ${slotData.unit}` : slotData.class_type}</span>
                                <span className="text-[7px] md:text-[8px] opacity-80 mt-0.5 truncate w-full px-1 text-white">{slotData.teacher?.first_name || 'Prof.'}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center leading-tight p-1 overflow-hidden z-10 pointer-events-none w-full mt-2">
                                <span className="text-[9px] md:text-[10px] font-black truncate w-full px-1">{slotData.student?.first_name || 'Estudiante'}</span>
                                <span className="text-[7px] md:text-[8px] opacity-80 mt-0.5 truncate w-full px-1">U{slotData.unit || '?'} • {slotData.teacher?.first_name || 'Prof.'}</span>
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
      </div>

      {/* --- SLOT MANAGEMENT MODAL --- */}
      {selectedSlot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#070b19]/95 border border-white/20 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={closeSlotModal} className="absolute top-6 right-6 text-white/50 hover:text-white cursor-pointer"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1">
              {selectedSlot.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <p className="text-[#fcd34d] font-black text-2xl tracking-widest mb-6">
              {selectedSlot.data?.exact_time || selectedSlot.timeStr}
            </p>

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
                  <h4 className="text-lg font-black text-white uppercase tracking-widest">
                    {selectedSlot.data.class_type === 'Unit Class' ? `Unidad ${selectedSlot.data.unit} Disponible` : `${selectedSlot.data.class_type} Disponible`}
                  </h4>
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
                    {selectedClassType === 'Unit Class' && (
                      <select 
                        value={selectedUnit} 
                        onChange={(e) => setSelectedUnit(parseInt(e.target.value))}
                        className="w-full p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs font-black text-emerald-400 uppercase tracking-widest focus:outline-none appearance-none text-center cursor-pointer relative z-40"
                      >
                        {[
                          { label: 'A1', start: 1, end: 12 },
                          { label: 'A2', start: 13, end: 24 },
                          { label: 'B1', start: 25, end: 36 },
                          { label: 'B2', start: 37, end: 48 },
                          { label: 'C1', start: 49, end: 70 },
                          { label: 'C2', start: 71, end: 92 }
                        ].map(lvl => (
                          <optgroup key={lvl.label} label={`NIVEL ${lvl.label}`} className="text-slate-500 font-black bg-white">
                            {Array.from({ length: lvl.end - lvl.start + 1 }, (_, i) => lvl.start + i).map(unit => (
                              <option key={unit} value={unit} className="text-slate-900 font-bold">Unidad {unit}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
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

      {/* --- UNBOOKED STUDENTS MODAL --- */}
      {showUnbookedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#070b19]/95 border border-white/20 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative flex flex-col max-h-[80vh]">
            <button onClick={() => setShowUnbookedModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white cursor-pointer z-10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1 shrink-0">
              Unbooked Students
            </h3>
            <p className="text-xs text-white/60 mb-6 shrink-0 font-bold uppercase tracking-widest">
              Sin reservas esta semana: {unbookedStudents.length}
            </p>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 min-h-0">
              {unbookedStudents.length === 0 ? (
                <p className="text-center text-white/50 font-bold py-10 uppercase tracking-widest text-xs">
                  Todos los estudiantes tienen reserva activa.
                </p>
              ) : (
                unbookedStudents.map(student => (
                  <div key={student.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[150px]">
                        {student.first_name} {student.last_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0 pl-4">
                      <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest block mb-0.5">Lección Actual</span>
                      <span className="text-xs font-black text-[#fcd34d] uppercase truncate max-w-[100px] block">
                        {student.current_lesson || 'No Asignada'}
                      </span>
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

export default AdminCalendar;