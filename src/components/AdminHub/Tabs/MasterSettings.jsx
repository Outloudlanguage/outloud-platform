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

  const handleSaveNewAccount = async (data) => {
    try {
      const { data: responseData, error } = await supabase.functions.invoke('provision-user', { body: data });
      if (error) throw error;
      alert(`${data.role} account securely provisioned!`);
      fetchUsers(); 
    } catch (error) {
      console.error("Error creating user:", error);
      alert(`Failed to create user: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center font-montserrat relative z-10">
      
      {impersonatedStudent && (
        <div className="fixed inset-0 z-[9999] bg-[#070b19] flex flex-col h-screen overflow-hidden">
          <div className="w-full bg-red-600/90 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center shadow-2xl z-[10000] border-b border-red-500/50">
            <span className="font-black uppercase tracking-widest text-xs md:text-sm flex items-center gap-3 drop-shadow-md">
              <span className="animate-pulse w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></span> VIEWING AS: {impersonatedStudent.first_name} {impersonatedStudent.last_name}
            </span>
            <button onClick={() => setImpersonatedStudent(null)} className="bg-white text-red-600 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
              EXIT IMPERSONATION
            </button>
          </div>
          <div className="flex-1 overflow-y-auto relative">
            <StudentHub preloadedStudent={impersonatedStudent} /> 
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
        {['Analytics', 'Teacher Directory', 'Candidate Evaluator', 'System Logs', 'User Provisioning'].map((tab) => (
          <button key={tab} onClick={() => setActiveSubTab(tab)} className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_15px_rgba(252,211,77,0.4)] scale-105' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}>
             {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'User Provisioning' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">USER PROVISIONING & ACCESS</h2>
            <button onClick={() => setIsCreationModalOpen(true)} className="bg-[#fcd34d] text-[#08203e] font-black rounded-full px-8 py-4 shadow-[0_0_15px_rgba(252,211,77,0.4)] uppercase tracking-widest hover:scale-105 transition-transform text-xs">
               + CREATE NEW ACCOUNT
            </button>
          </div>
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-bold text-white/50 uppercase tracking-widest flex flex-col items-center justify-center gap-3">
                 <div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
                 Cargando base de datos...
              </div>
            ) : usersList.length > 0 ? usersList.map((u) => (
              <div key={u.id} onClick={() => setSelectedUser(u)} className="flex items-center p-4 bg-black/20 rounded-2xl border border-white/10 shadow-inner hover:border-[#fcd34d]/50 hover:bg-white/5 cursor-pointer transition-all group">
                <img src={u.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-md mr-5 shrink-0 group-hover:border-[#fcd34d]/50 transition-colors" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white text-base md:text-lg mr-3 truncate block md:inline drop-shadow-md">{u.first_name} {u.last_name}</span>
                </div>
                <div className="flex gap-3 shrink-0 items-center">
                  <span className={`text-white rounded-md text-[10px] px-3 py-1.5 font-black tracking-widest uppercase shadow-md ${u.role === 'Student' ? 'bg-blue-600/80' : u.role === 'Teacher' ? 'bg-purple-600/80' : 'bg-red-600/80'}`}>{u.role}</span>
                  {u.role === 'Student' && (
                    <button onClick={(e) => { e.stopPropagation(); setImpersonatedStudent(u); }} className="ml-2 bg-white/10 text-white/80 border border-white/20 rounded-md text-[9px] px-3 py-1.5 font-black tracking-widest hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-transparent transition-all shadow-sm">
                      VIEW AS
                    </button>
                  )}
                </div>
              </div>
            )) : <p className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">No users found in database.</p>}
          </div>

          <AccountCreationModal isOpen={isCreationModalOpen} onClose={() => setIsCreationModalOpen(false)} onSave={handleSaveNewAccount} />
          <UserManagementDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {activeSubTab === 'Analytics' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-md">PLATFORM ANALYTICS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner hover:bg-white/5 transition-colors"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Monthly Recurring Revenue</span><span className="text-4xl font-black text-[#fcd34d] drop-shadow-md">$0.00</span></div>
            <div className="bg-black/20 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner hover:bg-white/5 transition-colors"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Active Cohort Split</span><span className="text-4xl font-black text-[#fcd34d] drop-shadow-md">0% / 0%</span></div>
            <div className="bg-black/20 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner hover:bg-white/5 transition-colors"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Class Utilization Rate</span><span className="text-4xl font-black text-[#fcd34d] drop-shadow-md">0%</span></div>
            <div className="bg-black/20 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner hover:bg-white/5 transition-colors"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Student Churn</span><span className="text-4xl font-black text-[#fcd34d] drop-shadow-md">0%</span></div>
          </div>
        </div>
      )}

      {activeSubTab === 'Teacher Directory' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-6 md:p-10 w-full animate-fade-in relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-md">TEACHER MANAGEMENT</h2>
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? <div className="py-12 text-center text-xs font-bold text-white/50 uppercase tracking-widest flex flex-col items-center justify-center gap-3"><div className="w-8 h-8 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>Cargando base de datos...</div> : usersList.filter(u => u.role === 'Teacher').length > 0 ? usersList.filter(u => u.role === 'Teacher').map((teacher) => (
              <div key={teacher.id} onClick={() => setSelectedUser(teacher)} className="flex items-center p-4 bg-black/20 rounded-2xl border border-white/10 shadow-inner hover:border-[#fcd34d]/50 hover:bg-white/5 cursor-pointer transition-all group">
                <img src={teacher.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-md mr-5 shrink-0 group-hover:border-[#fcd34d]/50 transition-colors" />
                <span className="font-bold text-white text-base md:text-lg mr-4 truncate flex-grow drop-shadow-md">{teacher.first_name} {teacher.last_name}</span>
                <span className="bg-[#fcd34d] text-[#08203e] rounded-md text-[10px] px-3 py-1.5 font-black tracking-widest mr-3 shrink-0 shadow-md">{teacher.cefr}</span>
              </div>
            )) : <p className="py-12 text-center text-xs font-bold text-white/40 uppercase tracking-widest bg-black/20 rounded-2xl border border-white/10 shadow-inner">No teachers found in database.</p>}
          </div>
          <UserManagementDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {(activeSubTab === 'Candidate Evaluator' || activeSubTab === 'System Logs') && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[30px] shadow-2xl border border-white/10 p-16 w-full flex items-center justify-center">
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs text-center border border-white/10 border-dashed rounded-xl p-10 bg-black/20">Module {activeSubTab} empty pending data insertion.</p>
        </div>
      )}
    </div>
  );
};

export default MasterSettings;