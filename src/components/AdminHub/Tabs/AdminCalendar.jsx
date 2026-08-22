import React, { useState, useEffect } from 'react';

const AdminCalendar = ({ supabase }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Real Database States
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Assignment States
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('Unit Class');

  const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const times = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'];

  // 1. GENERATE WEEK DATES
  const getWeekDates = (offsetWeeks) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + (offsetWeeks * 7));

    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates; 
  };

  const weekDates = getWeekDates(currentWeekOffset);

  // Helper to format local date to YYYY-MM-DD reliably
  const getLocalDateString = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // 2. FETCH DATA FROM SUPABASE
  const fetchCalendarData = async () => {
    try {
      const { data: teachersData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'Teacher');
      
      if (teachersData) {
        setTeachers(teachersData);
        if (teachersData.length > 0) setSelectedTeacherId(teachersData[0].id);
      }

      const { data: sessionsData, error } = await supabase
        .from('live_sessions')
        .select(`
          *,
          student:profiles!student_id(first_name, last_name),
          teacher:profiles!teacher_id(first_name, last_name)
        `);
        
      if (error) throw error;

      if (sessionsData) {
        // Map the single scheduled_at timestamp back into UI-friendly date and time strings
        const mappedSessions = sessionsData.map(session => {
          if (!session.scheduled_at) return session;
          
          const d = new Date(session.scheduled_at);
          const dateStr = getLocalDateString(d);
          
          let hours = d.getHours();
          const ampm = hours >= 12 ? 'PM' : 'AM';
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
  }, [currentWeekOffset]);

  // 3. ACTIONS: OPEN, CLOSE, OR CANCEL BLOCKS
  const handleOpenBlock = async () => {
    if (!selectedTeacherId) {
      alert("Debes asignar un profesor a este bloque.");
      return;
    }
    setIsProcessing(true);
    try {
      // Convert the selected UI Date and Time back into a strict DB Timestamp
      const year = selectedSlot.date.getFullYear();
      const month = selectedSlot.date.getMonth();
      const date = selectedSlot.date.getDate();
      
      const [time, modifier] = selectedSlot.timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      if (hours === 12 && modifier === 'AM') hours = 0;
      if (hours !== 12 && modifier === 'PM') hours += 12;
      
      const finalTimestamp = new Date(year, month, date, hours, parseInt(minutes, 10), 0).toISOString();

      const { error } = await supabase.from('live_sessions').insert({
        scheduled_at: finalTimestamp, // DB column matched
        teacher_id: selectedTeacherId,
        class_type: selectedClassType,
        status: 'available',
        duration_minutes: 60 // Good default based on your schema
      });
      
      if (error) throw error;

      await fetchCalendarData();
      closeSlotModal();
    } catch (error) {
      console.error(error);
      alert("Error al abrir el bloque. Mira la consola para detalles.");
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
    const confirmCancel = window.confirm("¿Estás seguro de cancelar esta reserva? El bloque volverá a estar disponible.");
    if (!confirmCancel) return;
    
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
      setSelectedClassType('Unit Class');
    }
  };

  const closeSlotModal = () => setSelectedSlot(null);

  const getTypeColor = (type) => {
    if (type === '1-on-1 Tutoring') return 'text-orange-400';
    if (type === 'Social Activity') return 'text-purple-400';
    return 'text-[#fcd34d]';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden font-montserrat">
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-white/10 pb-6 relative z-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">CONTROL DE CALENDARIO</h2>
          <p className="text-sm text-white/50 font-medium mt-2">Gestiona la disponibilidad de profesores y las reservas de los estudiantes.</p>
        </div>
        
        <div className="flex bg-black/40 rounded-xl border border-white/10 p-1">
          <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className="px-4 py-2 text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="px-4 py-2 text-xs font-black text-[#fcd34d] uppercase tracking-widest flex items-center border-x border-white/10">
            SEMANA {currentWeekOffset === 0 ? 'ACTUAL' : currentWeekOffset > 0 ? `+${currentWeekOffset}` : currentWeekOffset}
          </div>
          <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className="px-4 py-2 text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mb-6 px-2 relative z-10">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white/5 border border-white/20"></div><span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Inactivo / Oculto</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fcd34d] shadow-[0_0_8px_rgba(252,211,77,0.5)]"></div><span className="text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest">Disponible</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Reservada</span></div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pb-4 relative z-10">
        <div className="min-w-[700px] grid grid-cols-6 gap-2">
          
          {dayNames.map((day, idx) => (
            <div key={day} className="flex flex-col items-center bg-[#08203e]/80 py-3 rounded-t-xl border border-white/10 shadow-sm backdrop-blur-md">
              <span className="text-xs font-black text-white tracking-widest">{day}</span>
              <span className="text-[10px] font-bold text-[#fcd34d]">{weekDates[idx].getDate()}/{weekDates[idx].getMonth()+1}</span>
            </div>
          ))}

          {times.map((time, tIdx) => (
            <React.Fragment key={time}>
              {dayNames.map((_, dIdx) => {
                const dateStr = getLocalDateString(weekDates[dIdx]);
                const slotData = sessions.find(s => s.session_date === dateStr && s.time_slot === time);
                
                let bgClass = "bg-white/5 hover:bg-white/10 border-white/5 text-white/30";
                let content = time;

                if (slotData?.status === 'available') {
                  bgClass = "bg-[#fcd34d] hover:bg-[#fcd34d]/90 border-[#fcd34d] text-[#08203e] shadow-[0_0_15px_rgba(252,211,77,0.3)] z-10";
                } else if (slotData?.status === 'booked' || slotData?.status === 'completed') {
                  bgClass = "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] z-10";
                  content = (
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[8px] font-black">{slotData.student?.first_name || 'Estudiante'}</span>
                      <span className="text-[7px] opacity-70">U{slotData.unit || '?'} • {slotData.teacher?.first_name || 'Profesor'}</span>
                    </div>
                  );
                }

                return (
                  <div 
                    key={`${dIdx}-${tIdx}`} 
                    onClick={() => handleSlotClick(dIdx, tIdx, slotData)}
                    className={`h-16 flex items-center justify-center text-[10px] font-bold tracking-widest border rounded-lg transition-all cursor-pointer relative group ${bgClass}`}
                  >
                    {content}
                    {!slotData && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg backdrop-blur-sm">
                        <span className="text-white text-[8px]">+ ABRIR</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#070b19]/95 border border-white/20 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
            <button onClick={closeSlotModal} className="absolute top-6 right-6 text-white/50 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1">
              {selectedSlot.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <p className="text-[#fcd34d] font-black text-2xl tracking-widest mb-6">{selectedSlot.timeStr}</p>

            {selectedSlot.data?.status === 'booked' || selectedSlot.data?.status === 'completed' ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Estado</p>
                  <p className="text-sm font-black text-white uppercase">{selectedSlot.data.status === 'completed' ? 'Clase Completada' : 'Clase Reservada'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Estudiante</p>
                    <p className="text-sm font-bold text-white truncate">{selectedSlot.data.student?.first_name} {selectedSlot.data.student?.last_name}</p>
                    <p className="text-[10px] text-[#fcd34d] font-bold mt-1">UNIDAD {selectedSlot.data.unit}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Profesor</p>
                    <p className="text-sm font-bold text-white truncate">{selectedSlot.data.teacher?.first_name} {selectedSlot.data.teacher?.last_name}</p>
                    <p className={`text-[10px] font-bold mt-1 uppercase ${getTypeColor(selectedSlot.data.class_type)}`}>
                      {selectedSlot.data.class_type || 'Unit Class'}
                    </p>
                  </div>
                </div>
                <button disabled={isProcessing} onClick={handleCancelBooking} className="w-full py-3 mt-4 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors border border-red-500/30 disabled:opacity-50">
                  {isProcessing ? 'Procesando...' : 'Cancelar Reserva'}
                </button>
              </div>
            ) : selectedSlot.data?.status === 'available' ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-[#fcd34d]/20 text-[#fcd34d] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#fcd34d]/50">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-widest">Bloque Abierto</h4>
                  <p className="text-xs text-white/60 mt-2">Profesor Asignado: <span className="font-bold text-white">{selectedSlot.data.teacher?.first_name} {selectedSlot.data.teacher?.last_name}</span></p>
                  <p className={`text-[10px] font-bold mt-1 uppercase ${getTypeColor(selectedSlot.data.class_type)}`}>
                    Modalidad: {selectedSlot.data.class_type || 'Unit Class'}
                  </p>
                </div>
                <button disabled={isProcessing} onClick={handleCloseBlock} className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/20 disabled:opacity-50">
                  {isProcessing ? 'Procesando...' : 'Cerrar Disponibilidad'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 bg-white/5 text-white/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-widest mb-1">Bloque Inactivo</h4>
                  <p className="text-xs text-white/60 mb-6">Configura este bloque para habilitarlo en el calendario.</p>
                  
                  <div className="flex flex-col gap-3">
                    <select 
                      value={selectedTeacherId} 
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none appearance-none text-center"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                      ))}
                    </select>

                    <select 
                      value={selectedClassType} 
                      onChange={(e) => setSelectedClassType(e.target.value)}
                      className="w-full p-3 bg-black/40 border border-[#fcd34d]/50 rounded-xl text-xs font-bold text-[#fcd34d] uppercase tracking-widest focus:outline-none appearance-none text-center"
                    >
                      <option value="Unit Class">Unit Class (Regular)</option>
                      <option value="1-on-1 Tutoring">1-on-1 Tutoring</option>
                      <option value="Social Activity">Social Activity (Moderation)</option>
                    </select>
                  </div>
                </div>
                <button disabled={isProcessing} onClick={handleOpenBlock} className="w-full mt-4 py-3.5 bg-[#fcd34d] hover:bg-white text-[#08203e] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)] disabled:opacity-50">
                  {isProcessing ? 'Procesando...' : 'Abrir Bloque (Asignar)'}
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