import React, { useState, useEffect } from 'react';
import StudentRegistrationForm from './StudentRegistrationForm';

const CustomerManagement = ({ supabase }) => {
  const [activeSubTab, setActiveSubTab] = useState('Estudiantes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Database State
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Empty states for unbuilt features
  const [payments, setPayments] = useState([]);
  const [inactiveStudents, setInactiveStudents] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [activeChannel, setActiveChannel] = useState('#chat-general');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const channels = ['#anuncios', '#reglas', '#chat-general', '#foro-gramatica'];

  // Fetch REAL Students from Supabase
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'Student');
      if (!error && data) {
        setStudents(data);
      } else {
        console.error("Error fetching students:", error);
      }
      setIsLoading(false);
    };
    fetchStudents();
  }, [supabase, activeSubTab]);

  const filteredStudents = students.filter(student => 
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col items-center font-montserrat relative z-10">

      <StudentRegistrationForm />
      
      <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
        {['Pagos', 'Estudiantes', 'Inactividad', 'Comunidad'].map((tab) => (
          <button key={tab} onClick={() => setActiveSubTab(tab)} className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_15px_rgba(252,211,77,0.4)] scale-105' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}>
             {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'Estudiantes' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-6 drop-shadow-md">DIRECTORIO DE ESTUDIANTES</h2>
          <input type="text" placeholder="Buscar estudiante..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-xl px-5 py-4 text-sm text-white font-semibold focus:outline-none focus:ring-1 focus:ring-[#fcd34d] transition-colors mb-8 shadow-inner placeholder-white/30" />
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-bold text-white/50 uppercase tracking-widest flex flex-col items-center justify-center gap-3">
                 <div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
                 Cargando base de datos...
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center p-4 bg-black/20 rounded-2xl border border-white/10 shadow-inner hover:border-[#fcd34d]/50 hover:bg-white/5 transition-all group">
                  <img src={student.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-md mr-5 shrink-0 group-hover:border-[#fcd34d]/50 transition-colors" />
                  <span className="font-bold text-white text-base md:text-lg mr-4 truncate flex-grow drop-shadow-md">{student.first_name} {student.last_name}</span>
                  <span className="bg-[#fcd34d] text-[#08203e] rounded-md text-[10px] px-3 py-1.5 font-black tracking-widest mr-3 shrink-0 shadow-md">{student.level?.split(':')[0] || 'A1'}</span>
                  <span className="text-xs text-white/40 italic font-bold tracking-widest uppercase shrink-0">({student.role})</span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">No se encontraron estudiantes en la base de datos</div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'Pagos' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-md">VERIFICACIÓN DE PAGOS</h2>
          <div className="py-16 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">No hay transacciones registradas</div>
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
    </div>
  );
};

export default CustomerManagement;