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

  // Shift Assignment States
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTeacherId, setShiftTeacherId] = useState('');

  // Lightweight Toast
  const [calToast, setCalToast] = useState(null);
  const showToast = (message, tone = 'success') => {
    setCalToast({ message, tone });
    setTimeout(() => {
      setCalToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  };

  const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  const times = [
    '8:00 am',
    '9:00 am',
    '10:00 am',
    '11:00 am',
    '12:00 pm',
    '1:00 pm',
    '2:00 pm',
    '3:00 pm',
    '4:00 pm',
    '5:00 pm',
    '6:00 pm',
    '7:00 pm',
    '8:00 pm',
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
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
    new Date().getDate()
  ).padStart(2, '0')}`;

  const handleWeekChange = (direction) => {
    setBaseDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  };

  const handleMonthChange = (direction) => {
    setBaseDate((prev) => {
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
      const { data: teachersData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'Teacher');

      if (teachersData) {
        setTeachers(teachersData);
        if (teachersData.length > 0 && !selectedTeacherId) {
          setSelectedTeacherId(teachersData[0].id);
        }
      }

      const { data: allStudentsData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, current_lesson')
        .eq('role', 'Student');

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

      const startDate = new Date(weekDates[0]);
      startDate.setHours(0, 0, 0, 0);
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
        const mappedSessions = sessionsData.map((session) => {
          if (!session.scheduled_at) return session;
          const d = new Date(session.scheduled_at);
          const dateStr = getLocalDateString(d);

          let hours = d.getHours();
          const ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12;

          const timeStr = `${hours}:00 ${ampm}`;
          const exactMins = String(d.getMinutes()).padStart(2, '0');
          const exactTimeStr = `${hours}:${exactMins} ${ampm}`;

          return { ...session, session_date: dateStr, time_slot: timeStr, exact_time: exactTimeStr };
        });
        setSessions(mappedSessions);

        const totalStudents = allStudentsData ? allStudentsData.length : 0;
        const bookedStudentIds = new Set(
          sessionsData
            .filter((s) => s.status === 'booked' || s.status === 'completed')
            .map((s) => s.student_id)
            .filter(Boolean)
        );

        if (allStudentsData) {
          const unbooked = allStudentsData.filter((student) => !bookedStudentIds.has(student.id));
          setUnbookedStudents(unbooked);
          const calculatedPercentage =
            totalStudents > 0 ? Math.round((bookedStudentIds.size / totalStudents) * 100) : 0;
          setBookedPercentage(calculatedPercentage);
        }
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  useEffect(() => {
    fetchCalendarData();
    
  }, [baseDate]);

  // --- 3. MODAL ACTIONS ---
  const handleOpenBlock = async () => {
    if (!selectedTeacherId) return showToast('Debes asignar un profesor.', 'error');
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
        unit: selectedClassType === 'Unit Class' ? selectedUnit : null,
      });

      if (error) throw error;
      await fetchCalendarData();
      closeSlotModal();
      showToast('Bloque abierto exitosamente.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Error al abrir el bloque.', 'error');
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
      showToast('Disponibilidad cerrada.', 'info');
    } catch (error) {
      console.error(error);
      showToast('Error al cerrar el bloque.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('¿Cancelar reserva? El bloque volverá a estar disponible.')) return;
    setIsProcessing(true);
    try {
      await supabase
        .from('live_sessions')
        .update({
          status: 'available',
          student_id: null,
          unit: null,
        })
        .eq('id', selectedSlot.data.id);
      await fetchCalendarData();
      closeSlotModal();
      showToast('Reserva cancelada. El bloque está disponible.', 'info');
    } catch (error) {
      console.error(error);
      showToast('Error al cancelar la reserva.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlotClick = (dIdx, tIdx, currentData) => {
    setSelectedSlot({
      day: dIdx,
      time: tIdx,
      date: weekDates[dIdx],
      timeStr: times[tIdx],
      data: currentData,
    });
    if (!currentData && teachers.length > 0) {
      setSelectedTeacherId(teachers[0].id);
      setSelectedClassType(
        activeTab === 'SOCIALS'
          ? 'Social Activity'
          : activeTab === 'TUTORING'
          ? '1-on-1 Tutoring'
          : 'Unit Class'
      );
      setSelectedUnit(1);
    }
  };

  const closeSlotModal = () => setSelectedSlot(null);

  const handleAssignShift = async (e) => {
    e.preventDefault();
    if (!shiftTeacherId || !shiftDate) return showToast('Selecciona un profesor y una fecha.', 'error');
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('teacher_shifts').insert({
        teacher_id: shiftTeacherId,
        shift_date: shiftDate,
        status: 'scheduled',
      });
      if (error) throw error;
      showToast('Guardia asignada exitosamente.', 'success');
      setShowShiftModal(false);
      setShiftDate('');
    } catch (err) {
      console.error(err);
      showToast('Error al asignar la guardia.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSlotStyle = (slotData) => {
    if (!slotData) {
      return 'bg-white/60 hover:bg-white text-[#626a9f]/55 border-white/90 hover:border-[#626a9f]/45';
    }
    if (slotData.status === 'booked' || slotData.status === 'completed') {
      if (slotData.class_type === 'Unit Class') {
        return 'bg-[#ffc749] text-[#1e2246] font-bold border-[#1e2246] shadow-[0_3px_0_#1e2246]';
      }
      if (slotData.class_type === '1-on-1 Tutoring') {
        return 'bg-[#454d82] text-white font-bold border-[#1e2246] shadow-[0_3px_0_#1e2246]';
      }
      if (slotData.class_type === 'Social Activity') {
        return 'bg-[#7c5dfa] text-white font-bold border-[#1e2246] shadow-[0_3px_0_#1e2246]';
      }
    }
    return 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/55 hover:bg-[#d2f5e8]';
  };

  const selectedTeacherObj = teachers.find((t) => t.id === filterTeacherId);

  // Ring Chart Math
  const circleRadius = 64;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (bookedPercentage / 100) * circleCircumference;

  return (
    <div className="w-full max-w-[1440px] flex flex-col xl:h-[calc(100vh-145px)] xl:min-h-[650px] font-montserrat gap-5 relative z-10 text-[#1e2246] pb-8 xl:pb-0">
      {/* TOAST FEEDBACK */}
      {calToast && (
        <div className="ola-adm-toast-in fixed bottom-24 lg:bottom-8 left-1/2 z-[9500] px-5 py-3 rounded-full bg-[#1e2246] text-white border-2 border-[#ffc749] shadow-2xl flex items-center gap-2.5 text-xs font-bold max-w-[92vw]">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              calToast.tone === 'error'
                ? 'bg-[#ee665b]'
                : calToast.tone === 'info'
                ? 'bg-[#ffc749]'
                : 'bg-[#16a37f]'
            }`}
          />
          <span>{calToast.message}</span>
        </div>
      )}

      {/* TOP CONTROLS BAR (Clean in-flow pill bar — no fragile absolute collisions) */}
      <div className="ola-adm-glass rounded-[1.75rem] px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setShiftTeacherId(teachers.length > 0 ? teachers[0].id : '');
              setShowShiftModal(true);
            }}
            className="ola-adm-btn-yellow px-4 py-2 rounded-full font-bold text-[10.5px] sm:text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <span className="text-sm leading-none">+</span>
            <span>Assign Shift</span>
          </button>

          <button
            type="button"
            onClick={() => setBaseDate(new Date())}
            className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white border border-white text-[10.5px] font-bold uppercase tracking-wider text-[#454d82] hover:text-[#1e2246] cursor-pointer shadow-sm"
          >
            Hoy
          </button>
        </div>

        {/* Week & Month Steppers */}
        <div className="flex items-center gap-2 sm:gap-4 bg-white/75 border border-white rounded-full px-3 py-1.5 shadow-inner ml-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => handleWeekChange(-1)}
              aria-label="Semana anterior"
              className="w-7 h-7 rounded-full hover:bg-[#e8eaf7] text-[#454d82] hover:text-[#1e2246] flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[10px] sm:text-xs font-extrabold text-[#1e2246] uppercase tracking-widest min-w-[60px] text-center">
              Semana
            </span>
            <button
              type="button"
              onClick={() => handleWeekChange(1)}
              aria-label="Semana siguiente"
              className="w-7 h-7 rounded-full hover:bg-[#e8eaf7] text-[#454d82] hover:text-[#1e2246] flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="w-px h-5 bg-[#626a9f]/20" />

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              aria-label="Mes anterior"
              className="w-7 h-7 rounded-full hover:bg-[#e8eaf7] text-[#454d82] hover:text-[#1e2246] flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[10px] sm:text-xs font-extrabold text-[#454d82] uppercase tracking-widest min-w-[84px] text-center">
              {currentMonthName}
            </span>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              aria-label="Mes siguiente"
              className="w-7 h-7 rounded-full hover:bg-[#e8eaf7] text-[#454d82] hover:text-[#1e2246] flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT ROW */}
      <div className="flex flex-col xl:flex-row gap-5 flex-1 min-h-0 relative z-20">
        {/* LEFT COLUMN: Bento Booking Ring + Upcoming */}
        <div className="w-full xl:w-[29%] flex flex-col sm:grid sm:grid-cols-2 xl:flex xl:flex-col gap-5 xl:h-full shrink-0">
          {/* Interactive Students Booked Bento Card */}
          <button
            type="button"
            onClick={() => setShowUnbookedModal(true)}
            className="ola-adm-glass-gold ola-adm-bento w-full rounded-[2rem] p-5 flex flex-col items-center justify-center cursor-pointer focus:outline-none group shrink-0"
          >
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#454d82]">
                Weekly Coverage
              </span>
              <span className="text-[9.5px] font-bold uppercase tracking-wider bg-[#1e2246] text-[#ffc749] px-2.5 py-0.5 rounded-full">
                {unbookedStudents.length} Unbooked
              </span>
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center my-1 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(30,34,70,0.12)" strokeWidth="11" />
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="#1e2246"
                  strokeWidth="11"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-[#1e2246] leading-none">{bookedPercentage}%</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#454d82] mt-1">Booked</span>
              </div>
            </div>

            <p className="text-[11px] font-bold text-[#1e2246] uppercase tracking-widest mt-1">
              View Unbooked Students →
            </p>
          </button>

          {/* Upcoming Sessions Card */}
          <div className="ola-adm-glass rounded-[2rem] p-5 flex-1 flex flex-col min-h-[280px] xl:min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-extrabold text-[#1e2246] tracking-tight">Upcoming Live</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82] bg-white/80 px-2.5 py-0.5 rounded-full">
                Next {upcomingActivities.length}
              </span>
            </div>

            <ul className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
              {upcomingActivities.length === 0 ? (
                <li className="text-center text-[#626a9f] text-xs font-bold uppercase tracking-widest py-10">
                  No upcoming sessions
                </li>
              ) : (
                upcomingActivities.map((act) => {
                  const d = new Date(act.scheduled_at);
                  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  return (
                    <li
                      key={act.id}
                      className="flex flex-col gap-1 text-xs bg-white/80 hover:bg-white p-3.5 rounded-2xl border border-white shadow-sm transition-colors"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              act.class_type === 'Unit Class'
                                ? 'bg-[#ffc749] border border-[#1e2246]'
                                : act.class_type === '1-on-1 Tutoring'
                                ? 'bg-[#454d82]'
                                : 'bg-[#7c5dfa]'
                            }`}
                          />
                          <span className="font-bold text-[#1e2246] uppercase tracking-wider text-[10.5px] truncate">
                            {act.class_type}
                          </span>
                        </div>
                        <span className="font-bold text-[#454d82] text-[11px] shrink-0">{timeStr}</span>
                      </div>
                      <div className="flex items-center justify-between pl-4 text-[11px]">
                        <span className="text-[#50567d] font-medium truncate pr-2">
                          Prof. {act.teacher?.first_name || 'TBA'}
                        </span>
                        <span className="text-[#128063] font-bold shrink-0">{dateStr}</span>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            <a
              href="https://wa.me/584226885683"
              target="_blank"
              rel="noreferrer"
              className="ola-adm-btn-outline w-full mt-4 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4 text-[#16a37f]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Request Substitute</span>
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Master Weekly Schedule Grid */}
        <div className="ola-adm-glass w-full xl:w-[71%] rounded-[2.25rem] min-h-[560px] xl:h-full flex flex-col overflow-hidden">
          {/* Filter Tabs + Non-Clipped Teacher Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:px-6 border-b border-[#626a9f]/15 gap-3 relative z-40 shrink-0 bg-white/45">
            <div className="flex overflow-x-auto gap-1.5 bg-[#e8eaf7]/85 p-1 rounded-full border border-white [&::-webkit-scrollbar]:hidden">
              {['OVERALL', 'LIVE LABS', 'TUTORING', 'SOCIALS'].map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                      : 'text-[#454d82] hover:text-[#1e2246]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Teacher Filter Placed Outside Overflow-X Container (Zero Clipping) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowTeacherDropdown((prev) => !prev)}
                className={`w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 px-4 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-wider border-2 cursor-pointer transition-colors ${
                  filterTeacherId !== 'ALL' || showTeacherDropdown
                    ? 'bg-[#1e2246] border-[#1e2246] text-[#ffc749]'
                    : 'bg-white border-white text-[#454d82] hover:border-[#626a9f]/40'
                }`}
              >
                <span className="truncate max-w-[140px]">
                  {selectedTeacherObj
                    ? `Prof. ${selectedTeacherObj.first_name}`
                    : 'All Teachers'}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    showTeacherDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showTeacherDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTeacherDropdown(false)}
                  />
                  <div className="ola-adm-modal-in absolute top-full mt-2 right-0 w-56 bg-white/95 backdrop-blur-2xl border-2 border-[#1e2246] rounded-2xl shadow-2xl py-1.5 z-50 flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTeacherId('ALL');
                        setShowTeacherDropdown(false);
                      }}
                      className={`text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                        filterTeacherId === 'ALL'
                          ? 'bg-[#fff3d1] text-[#1e2246]'
                          : 'text-[#454d82] hover:bg-[#f2f4fb]'
                      }`}
                    >
                      All Teachers
                    </button>
                    <div className="h-px bg-[#dfe2f2] my-1" />
                    {teachers.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          setFilterTeacherId(t.id);
                          setShowTeacherDropdown(false);
                        }}
                        className={`text-left px-4 py-2.5 text-xs font-semibold truncate cursor-pointer ${
                          filterTeacherId === t.id
                            ? 'bg-[#454d82] text-[#ffc749] font-bold'
                            : 'text-[#1e2246] hover:bg-[#f2f4fb]'
                        }`}
                      >
                        {t.first_name} {t.last_name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Color Legend Strip */}
          <div className="px-4 sm:px-6 py-2 bg-white/30 border-b border-[#626a9f]/10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-[#50567d] shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f]" /> Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffc749] border border-[#1e2246]" /> Unit Class
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#454d82]" /> 1-on-1 Tutoring
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7c5dfa]" /> Social
            </span>
            <span className="ml-auto text-[9.5px] text-[#626a9f] sm:hidden">← Swipe grid →</span>
          </div>

          {/* Scrollable 7-Day Grid (Safe horizontal scroll on mobile so columns never squish) */}
          <div className="flex-1 overflow-auto custom-scrollbar relative z-20 min-h-0">
            <div className="min-w-[660px] w-full flex flex-col">
              {/* Sticky Day Headers */}
              <div className="grid grid-cols-7 gap-2 px-4 sm:px-6 py-3 bg-[#f3f5fc]/95 backdrop-blur-md border-b border-[#626a9f]/15 sticky top-0 z-30">
                {dayNames.map((day, idx) => {
                  const isToday = getLocalDateString(weekDates[idx]) === todayStr;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl ${
                        isToday ? 'bg-[#1e2246] text-[#ffc749] shadow-sm' : 'text-[#454d82]'
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-widest">{day}</span>
                      <span className={`text-xs font-extrabold ${isToday ? 'text-white' : 'text-[#1e2246]'}`}>
                        {weekDates[idx].getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-7 gap-2">
                  {times.map((time, tIdx) => (
                    <React.Fragment key={time}>
                      {dayNames.map((_, dIdx) => {
                        const dateStr = getLocalDateString(weekDates[dIdx]);
                        const slotData = sessions.find((s) => {
                          if (s.session_date !== dateStr || s.time_slot.toLowerCase() !== time.toLowerCase())
                            return false;
                          if (activeTab === 'LIVE LABS' && s.class_type !== 'Unit Class') return false;
                          if (activeTab === 'TUTORING' && s.class_type !== '1-on-1 Tutoring') return false;
                          if (activeTab === 'SOCIALS' && s.class_type !== 'Social Activity') return false;
                          if (filterTeacherId !== 'ALL' && s.teacher_id !== filterTeacherId) return false;
                          return true;
                        });

                        return (
                          <button
                            type="button"
                            key={`${dIdx}-${tIdx}`}
                            onClick={() => handleSlotClick(dIdx, tIdx, slotData)}
                            className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative group hover:-translate-y-0.5 active:scale-[0.97] overflow-hidden px-1 ${getSlotStyle(
                              slotData
                            )}`}
                          >
                            <span className="absolute top-1 left-2 text-[7.5px] font-bold opacity-60 uppercase tracking-tight pointer-events-none">
                              {time}
                            </span>

                            {!slotData ? (
                              <span className="text-[9px] font-bold text-[#454d82] opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                                + ABRIR
                              </span>
                            ) : slotData.status === 'available' ? (
                              <div className="flex flex-col items-center justify-center text-center leading-tight pointer-events-none w-full mt-2.5">
                                <span className="text-[9.5px] font-extrabold text-[#128063] truncate w-full uppercase">
                                  {slotData.class_type === 'Unit Class'
                                    ? `Unit ${slotData.unit}`
                                    : slotData.class_type}
                                </span>
                                <span className="text-[8px] font-semibold text-[#3b4170] truncate w-full">
                                  {slotData.teacher?.first_name || 'Prof.'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center leading-tight pointer-events-none w-full mt-2.5">
                                <span className="text-[9.5px] font-extrabold truncate w-full">
                                  {slotData.student?.first_name || 'Student'}
                                </span>
                                <span className="text-[8px] opacity-85 truncate w-full">
                                  U{slotData.unit || '?'} • {slotData.teacher?.first_name || 'Prof.'}
                                </span>
                              </div>
                            )}
                          </button>
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
        <div
          onClick={(e) => e.target === e.currentTarget && closeSlotModal()}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1e2246]/55 backdrop-blur-xl"
        >
          <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] w-full max-w-md p-6 sm:p-8 relative">
            <button
              type="button"
              onClick={closeSlotModal}
              aria-label="Cerrar"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82] block">
              {selectedSlot.date.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
            <p className="text-[#1e2246] font-extrabold text-2xl tracking-tight mb-5">
              {selectedSlot.data?.exact_time || selectedSlot.timeStr}
            </p>

            {selectedSlot.data?.status === 'booked' || selectedSlot.data?.status === 'completed' ? (
              <div className="space-y-4">
                <div className="bg-[#e7faf3] border border-[#16a37f]/45 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-[#128063] font-bold uppercase tracking-widest mb-0.5">
                    Estado
                  </p>
                  <p className="text-sm font-extrabold text-[#1e2246] uppercase">
                    {selectedSlot.data.status === 'completed' ? 'Clase Completada' : 'Clase Reservada'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 border border-white rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-[#626a9f] font-bold uppercase tracking-widest mb-1">
                      Estudiante
                    </p>
                    <p className="text-sm font-bold text-[#1e2246] truncate">
                      {selectedSlot.data.student?.first_name || 'Sin Nombre'}
                    </p>
                  </div>
                  <div className="bg-white/80 border border-white rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-[#626a9f] font-bold uppercase tracking-widest mb-1">
                      Profesor
                    </p>
                    <p className="text-sm font-bold text-[#1e2246] truncate">
                      {selectedSlot.data.teacher?.first_name || 'Sin Asignar'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCancelBooking}
                  className="ola-adm-btn-danger w-full py-3.5 mt-2 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Cancelar Reserva'}
                </button>
              </div>
            ) : selectedSlot.data?.status === 'available' ? (
              <div className="space-y-5 text-center py-2">
                <div className="w-16 h-16 bg-[#e7faf3] text-[#128063] border-2 border-[#16a37f] rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-[#1e2246]">
                    {selectedSlot.data.class_type === 'Unit Class'
                      ? `Unidad ${selectedSlot.data.unit} Disponible`
                      : `${selectedSlot.data.class_type} Disponible`}
                  </h4>
                  <p className="text-xs text-[#4c5384] font-medium mt-1.5">
                    Profesor Asignado:{' '}
                    <strong className="text-[#1e2246]">
                      {selectedSlot.data.teacher?.first_name} {selectedSlot.data.teacher?.last_name}
                    </strong>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCloseBlock}
                  className="ola-adm-btn-outline w-full py-3.5 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Cerrar Disponibilidad'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-1">
                <div className="text-center">
                  <h4 className="text-base font-extrabold text-[#1e2246] uppercase">Abrir Bloque</h4>
                  <p className="text-xs text-[#4c5384] font-medium mt-1">
                    Asigna un profesor y tipo de clase para habilitar este horario.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#454d82] mb-1">
                      Profesor
                    </label>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full p-3 bg-white border-2 border-white focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer shadow-sm"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.first_name} {t.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#454d82] mb-1">
                      Tipo de Clase
                    </label>
                    <select
                      value={selectedClassType}
                      onChange={(e) => setSelectedClassType(e.target.value)}
                      className="w-full p-3 bg-white border-2 border-white focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer shadow-sm"
                    >
                      <option value="Unit Class">Unit Class (Regular)</option>
                      <option value="1-on-1 Tutoring">1-on-1 Tutoring</option>
                      <option value="Social Activity">Social Activity</option>
                    </select>
                  </div>

                  {selectedClassType === 'Unit Class' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#128063] mb-1">
                        Unidad CEFR
                      </label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(parseInt(e.target.value, 10))}
                        className="w-full p-3 bg-[#e7faf3] border-2 border-[#16a37f]/50 rounded-xl text-xs font-bold text-[#128063] outline-none cursor-pointer"
                      >
                        {[
                          { label: 'A1', start: 1, end: 12 },
                          { label: 'A2', start: 13, end: 24 },
                          { label: 'B1', start: 25, end: 36 },
                          { label: 'B2', start: 37, end: 48 },
                          { label: 'C1', start: 49, end: 70 },
                          { label: 'C2', start: 71, end: 92 },
                        ].map((lvl) => (
                          <optgroup key={lvl.label} label={`NIVEL ${lvl.label}`}>
                            {Array.from({ length: lvl.end - lvl.start + 1 }, (_, i) => lvl.start + i).map((unit) => (
                              <option key={unit} value={unit}>
                                Unidad {unit}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleOpenBlock}
                  className="ola-adm-btn-yellow w-full mt-2 py-3.5 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Abrir Bloque ✓'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- UNBOOKED STUDENTS MODAL --- */}
      {showUnbookedModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowUnbookedModal(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1e2246]/55 backdrop-blur-xl"
        >
          <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] w-full max-w-md p-6 sm:p-8 relative flex flex-col max-h-[80vh]">
            <button
              type="button"
              onClick={() => setShowUnbookedModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold text-[#1e2246] shrink-0">Unbooked Students</h3>
            <p className="text-xs text-[#454d82] mb-5 shrink-0 font-bold uppercase tracking-wider">
              Sin reservas esta semana: {unbookedStudents.length}
            </p>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5 min-h-0">
              {unbookedStudents.length === 0 ? (
                <p className="text-center text-[#128063] font-bold py-10 uppercase tracking-widest text-xs">
                  Todos los estudiantes tienen reserva activa.
                </p>
              ) : (
                unbookedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white/85 border border-white rounded-2xl p-3.5 flex items-center justify-between shadow-sm"
                  >
                    <p className="text-sm font-bold text-[#1e2246] truncate max-w-[170px]">
                      {student.first_name} {student.last_name}
                    </p>
                    <div className="text-right shrink-0 pl-3">
                      <span className="text-[9px] text-[#626a9f] font-bold uppercase block">Lección Actual</span>
                      <span className="text-xs font-extrabold text-[#454d82] uppercase">
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

      {/* --- STANDBY SHIFT MODAL --- */}
      {showShiftModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowShiftModal(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#1e2246]/55 backdrop-blur-xl"
        >
          <div className="ola-adm-glass ola-adm-modal-in rounded-[2.25rem] w-full max-w-md p-6 sm:p-8 relative flex flex-col">
            <button
              type="button"
              onClick={() => setShowShiftModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="w-14 h-14 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-[#1e2246] text-center mb-1">Assign Standby Shift</h3>
            <p className="text-xs text-[#4c5384] mb-6 text-center font-medium leading-relaxed">
              Authorize a teacher for a 12-hour on-duty window (7:30 AM – 7:30 PM). They earn a $2 bonus upon maintaining connection.
            </p>

            <form onSubmit={handleAssignShift} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1.5 block">
                  Select Teacher
                </label>
                <select
                  value={shiftTeacherId}
                  onChange={(e) => setShiftTeacherId(e.target.value)}
                  className="w-full p-3.5 bg-white border-2 border-white focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer shadow-sm"
                  required
                >
                  <option value="" disabled>
                    Choose a teacher...
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1.5 block">
                  Shift Date
                </label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full p-3.5 bg-white border-2 border-white focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer shadow-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="ola-adm-btn-yellow w-full mt-2 py-3.5 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Authorize Shift ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;