import React, { useState, useEffect } from 'react';
import AccountCreationModal from '../Modals/AccountCreationModal';
import UserManagementDrawer from '../Modals/UserManagementDrawer';
import StudentHub from '../../../StudentHub';

const MasterSettings = ({ supabase }) => {
  const [activeSubTab, setActiveSubTab] = useState('User Provisioning');
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [impersonatedStudent, setImpersonatedStudent] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) setUsersList(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [supabase, activeSubTab]);

 // REAL SUPABASE ADMIN CREATION LOGIC (BYPASSING THE BROWSER ALARM)
 // SECURE EDGE FUNCTION CREATION LOGIC
  const handleSaveNewAccount = async (data) => {
    try {
      // We ask the secure vault to do the heavy lifting
      const { data: responseData, error } = await supabase.functions.invoke('provision-user', {
        body: data
      });

      if (error) throw error;

      alert(`${data.role} account securely provisioned!`);
      fetchUsers(); // Refresh the directory list
      
    } catch (error) {
      console.error("Error creating user:", error);
      alert(`Failed to create user: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {impersonatedStudent && (
  <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col h-screen overflow-hidden">
    <div className="w-full bg-red-600 text-white px-6 py-3 flex justify-between items-center shadow-lg z-[10000]">
      <span className="font-bold uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
        <span className="animate-pulse">🔴</span> VIEWING AS: {impersonatedStudent.first_name} {impersonatedStudent.last_name}
      </span>
      <button 
        onClick={() => setImpersonatedStudent(null)} 
        className="bg-white text-red-600 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-md"
      >
        EXIT IMPERSONATION
      </button>
    </div>
    <div className="flex-1 overflow-y-auto relative">
      <StudentHub preloadedStudent={impersonatedStudent} /> 
    </div>
  </div>
)}
      <div className="flex flex-wrap justify-center gap-4 mb-8 w-full">
        {['Analytics', 'Teacher Directory', 'Candidate Evaluator', 'System Logs', 'User Provisioning'].map((tab) => (
          <button key={tab} onClick={() => setActiveSubTab(tab)} className={`px-6 py-3 rounded-xl text-xs md:text-sm font-montserrat font-bold uppercase tracking-wide transition-all shadow-sm ${activeSubTab === tab ? 'bg-outloud-blue text-white' : 'bg-[#e6f0f9] text-outloud-blue hover:bg-[#d6e6f5]'}`}>{tab}</button>
        ))}
      </div>

      {activeSubTab === 'User Provisioning' && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-8 w-full animate-fade-in relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide">USER PROVISIONING & ACCESS</h2>
            <button onClick={() => setIsCreationModalOpen(true)} className="bg-student-yellow text-outloud-blue font-black rounded-full px-6 py-3 shadow-md uppercase tracking-wide hover:scale-105 transition-transform text-xs">+ CREATE NEW ACCOUNT</button>
          </div>
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="py-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando base de datos...</div>
            ) : usersList.length > 0 ? usersList.map((u) => (
              <div key={u.id} onClick={() => setSelectedUser(u)} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-student-yellow hover:shadow-md cursor-pointer transition-all">
                <img src={u.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 mr-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-outloud-blue text-base md:text-lg mr-3 truncate block md:inline">{u.first_name} {u.last_name}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={`text-white rounded text-[10px] px-2 py-1 font-bold tracking-widest ${u.role === 'Student' ? 'bg-blue-500' : u.role === 'Teacher' ? 'bg-purple-500' : 'bg-red-500'}`}>{u.role}</span>
                  {u.role === 'Student' && (
  <button 
    onClick={(e) => { e.stopPropagation(); setImpersonatedStudent(u); }} 
    className="ml-2 bg-gray-100 text-gray-500 border border-gray-200 rounded text-[10px] px-2 py-1 font-bold tracking-widest hover:bg-outloud-blue hover:text-white transition-colors"
  >
    VIEW AS
  </button>
)}
                </div>
              </div>
            )) : <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs py-10">No users found in database.</p>}
          </div>

          <AccountCreationModal isOpen={isCreationModalOpen} onClose={() => setIsCreationModalOpen(false)} onSave={handleSaveNewAccount} />
          <UserManagementDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {/* Emptied views until built */}
      {activeSubTab === 'Analytics' && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-8 w-full animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-8">PLATFORM ANALYTICS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Monthly Recurring Revenue</span><span className="text-3xl font-black text-outloud-blue">$0.00</span></div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Active Cohort Split</span><span className="text-3xl font-black text-outloud-blue">0% / 0%</span></div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Class Utilization Rate</span><span className="text-3xl font-black text-outloud-blue">0%</span></div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Student Churn</span><span className="text-3xl font-black text-outloud-blue">0%</span></div>
          </div>
        </div>
      )}

      {activeSubTab === 'Teacher Directory' && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-8 w-full animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-black text-outloud-blue font-montserrat uppercase tracking-wide mb-6">TEACHER MANAGEMENT</h2>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? <div className="py-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando base de datos...</div> : usersList.filter(u => u.role === 'Teacher').length > 0 ? usersList.filter(u => u.role === 'Teacher').map((teacher) => (
              <div key={teacher.id} onClick={() => setSelectedUser(teacher)} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-student-yellow cursor-pointer transition-all">
                <img src={teacher.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 mr-4 shrink-0" />
                <span className="font-bold text-outloud-blue text-base md:text-lg mr-3 truncate">{teacher.first_name} {teacher.last_name}</span>
                <span className="bg-outloud-blue text-white rounded text-[10px] px-2 py-1 font-bold tracking-widest mr-2 shrink-0">{teacher.cefr}</span>
              </div>
            )) : <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs py-10">No teachers found in database.</p>}
          </div>
          <UserManagementDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {(activeSubTab === 'Candidate Evaluator' || activeSubTab === 'System Logs') && (
        <div className="bg-white/95 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-white/60 p-12 w-full flex items-center justify-center">
           <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center">Module {activeSubTab} empty pending data insertion.</p>
        </div>
      )}
    </div>
  );
};

export default MasterSettings;