import React, { useState, useEffect } from 'react';

const AdminCalendar = ({ supabase }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    level: 'A1',
    teacher_id: 'Gabo' // Defaulting to you!
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lab_sessions')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) console.error('Error fetching sessions:', error);
    else setSessions(data || []);
    
    setLoading(false);
  };

  const handleAddSession = async () => {
    if (!newSession.date || !newSession.time) {
      alert("Please select both a date and a time.");
      return;
    }

    // Combine date and time into a database-friendly timestamp
    const startTimestamp = new Date(`${newSession.date}T${newSession.time}`).toISOString();

    const { error } = await supabase
      .from('lab_sessions')
      .insert([{
        start_time: startTimestamp,
        level: newSession.level,
        teacher_id: newSession.teacher_id,
        current_capacity: 0 // Starts empty!
      }]);

    if (error) {
      console.error('Error adding session:', error);
      alert('Failed to save the session.');
    } else {
      setShowAddModal(false);
      setNewSession({ date: '', time: '', level: 'A1', teacher_id: 'Gabo' }); // Reset form
      fetchSessions(); // Instantly refresh the calendar
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col items-center bg-gray-50/50">
      
      {/* Header and Add Button */}
      <div className="max-w-6xl w-full flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide">
          Manage Lab Sessions
        </h2>
        <button 
          className="bg-student-yellow text-outloud-blue font-black px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md uppercase text-sm tracking-widest"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Slot
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-lg p-6 min-h-[500px] border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center h-full mt-20">
            <p className="text-lg text-outloud-blue/60 font-bold animate-pulse">Loading schedule...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-lg text-gray-500 font-medium">No sessions scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <div key={session.id} className="border-2 border-outloud-blue/10 rounded-2xl p-5 bg-[#eef5fc] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-student-yellow"></div>
                <p className="font-bold text-outloud-blue text-lg">
                  {new Date(session.start_time).toLocaleDateString()}
                </p>
                <p className="text-gray-600 font-medium mt-1">
                  Time: {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="bg-outloud-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {session.level}
                  </span>
                  <span className="bg-white text-outloud-blue border border-outloud-blue/20 text-xs font-bold px-3 py-1 rounded-full">
                    {session.teacher_id}
                  </span>
                  <span className="ml-auto text-xs font-bold text-gray-500 flex items-center">
                    {session.current_capacity}/12 Booked
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW: Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-outloud-blue/40 backdrop-blur-sm z-[200] flex justify-center items-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative">
            <h3 className="text-2xl font-black text-outloud-blue uppercase tracking-wide mb-6">Create New Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-outloud-blue font-bold focus:border-student-yellow outline-none"
                  value={newSession.date}
                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                <input 
                  type="time" 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-outloud-blue font-bold focus:border-student-yellow outline-none"
                  value={newSession.time}
                  onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label>
                  <select 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-outloud-blue font-bold focus:border-student-yellow outline-none"
                    value={newSession.level}
                    onChange={(e) => setNewSession({...newSession, level: e.target.value})}
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teacher</label>
                  <select 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-outloud-blue font-bold focus:border-student-yellow outline-none"
                    value={newSession.teacher_id}
                    onChange={(e) => setNewSession({...newSession, teacher_id: e.target.value})}
                  >
                    <option value="Gabo">Gabo</option>
                    <option value="David">David</option>
                    <option value="Daniel">Daniel</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 px-4 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-all"
              >
                CANCEL
              </button>
              <button 
                onClick={handleAddSession}
                className="flex-1 py-3 px-4 rounded-xl bg-student-yellow text-outloud-blue font-black shadow-md active:scale-95 transition-all"
              >
                SAVE SLOT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCalendar;