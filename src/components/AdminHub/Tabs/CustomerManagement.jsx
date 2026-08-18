import React, { useState, useEffect } from 'react';
import StudentRegistrationForm from './StudentRegistrationForm';

const CustomerManagement = ({ supabase }) => {
  const [activeSubTab, setActiveSubTab] = useState('Estudiantes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Database State (No Mocks!)
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
  }, [supabase, activeSubTab]); // Re-fetch when clicking tabs to ensure fresh data

  const filteredStudents = students.filter(student => 
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col items-center">

      <StudentRegistrationForm />
      <div className="flex flex-wrap justify-center gap-4 mb-8 w-full">
        {['Pagos', 'Estudiantes', 'Inactividad', 'Comunidad'].map((tab) => (
          <button key={tab} onClick={() => setActiveSubTab(tab)} className={`px-6 py-3 rounded-xl text-xs md:text-sm font-montserrat font-bold uppercase tracking-wide transition-all shadow-sm ${activeSubTab === tab ? 'bg-outloud-blue text-white' : 'bg-[#e6f0f9] text-outloud-blue hover:bg-[#d6e6f5]'}`}>{tab}</button>
        ))}
      </div>

      {activeSubTab === 'Estudiantes' && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-8 w-full animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-6">DIRECTORIO DE ESTUDIANTES</h2>
          <input type="text" placeholder="Buscar estudiante..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-outloud-blue font-semibold focus:outline-none focus:ring-2 focus:ring-student-yellow transition mb-6 shadow-inner" />
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="py-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando base de datos...</div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-student-yellow transition-colors">
                  <img src={student.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 mr-4 shrink-0" />
                  <span className="font-bold text-outloud-blue text-base md:text-lg mr-3 truncate">{student.first_name} {student.last_name}</span>
                  <span className="bg-outloud-blue text-white rounded text-[10px] px-2 py-1 font-bold tracking-widest mr-2 shrink-0">{student.level?.split(':')[0] || 'A1'}</span>
                  <span className="text-xs md:text-sm text-gray-400 italic font-semibold shrink-0">({student.role})</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl border border-gray-200">No se encontraron estudiantes en la base de datos</div>
            )}
          </div>
        </div>
      )}

      {/* Emptied views until we build their tables */}
      {activeSubTab === 'Pagos' && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-8 w-full animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-8">VERIFICACIÓN DE PAGOS</h2>
          <div className="py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl border border-gray-200">No hay transacciones registradas</div>
        </div>
      )}

      {activeSubTab === 'Inactividad' && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-8 w-full animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-6">ALERTAS DE INACTIVIDAD</h2>
          <div className="py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl border border-gray-200">Sin datos de actividad reciente</div>
        </div>
      )}

      {activeSubTab === 'Comunidad' && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-8 w-full animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-6">MODERACIÓN DE COMUNIDAD</h2>
          <div className="py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl border border-gray-200">El chat está vacío</div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;