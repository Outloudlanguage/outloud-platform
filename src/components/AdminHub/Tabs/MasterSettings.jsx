import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) setUsersList(data);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, activeSubTab]);

  const handleSaveNewAccount = async (data) => {
    try {
      const ghostClient = createClient(
        'https://kuvsmrheywhzxfiyivtg.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dnNtcmhleXdoenhmaXlpdnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTc4MzYsImV4cCI6MjEwMTc5MzgzNn0.upJqo4zdmO3xj4KN7zUURDTI0ZY2RNWqgvLbSSCu3BA',
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { error } = await ghostClient.auth.signUp({
        email: data.username,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName || data.first_name || '',
            last_name: data.lastName || data.last_name || '',
            personal_email: data.email,
            role: data.role || 'Teacher',
            cefr: data.cefr || 'C2',
          },
        },
      });

      if (error) throw error;

      alert(`${data.role || 'Teacher'} account securely provisioned!`);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center font-montserrat text-[#1e2246] relative z-10 pb-12">
      {/* Floating Impersonation Interceptor */}
      {impersonatedStudent && (
        <div className="fixed inset-0 z-[9999] bg-[#f6f7fc] flex flex-col h-screen overflow-hidden">
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] bg-[#1e2246] border-2 border-[#ffc749] text-white pl-5 pr-1.5 py-1.5 rounded-full font-bold tracking-widest text-[10px] md:text-xs flex items-center gap-3.5 shadow-[0_14px_34px_-8px_rgba(30,34,70,0.6)]">
            <span className="animate-pulse w-2.5 h-2.5 bg-[#ee665b] rounded-full shrink-0" />
            <span className="uppercase truncate max-w-[180px] sm:max-w-xs">
              Viewing as: {impersonatedStudent.first_name} {impersonatedStudent.last_name}
            </span>
            <button
              type="button"
              onClick={() => setImpersonatedStudent(null)}
              className="bg-[#ffc749] hover:bg-[#ffd66b] text-[#1e2246] px-4 py-1.5 rounded-full font-extrabold text-[10.5px] uppercase tracking-wider cursor-pointer transition-transform active:scale-95"
            >
              Exit
            </button>
          </div>
          <div className="flex-1 overflow-y-auto relative">
            <StudentHub
              preloadedStudent={impersonatedStudent}
              onReturnHome={() => setImpersonatedStudent(null)}
            />
          </div>
        </div>
      )}

      {/* Floating White Pill Navigation */}
      <div className="bg-white/95 border-2 border-white rounded-full p-1.5 shadow-[0_12px_28px_-10px_rgba(69,77,130,0.22)] flex flex-wrap justify-center gap-1 mb-7">
        {['Analytics', 'Teacher Directory', 'Candidate Evaluator', 'System Logs', 'User Provisioning'].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === tab
                ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                : 'text-[#454d82] hover:text-[#1e2246] hover:bg-[#f2f4fc]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* USER PROVISIONING */}
      {activeSubTab === 'User Provisioning' && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-5 sm:p-8 w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-7 border-b border-[#626a9f]/15 pb-5">
            <div>
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full mb-2">
                Access Control
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="text-[#1e2246]">User </span>
                <span className="text-[#626a9f]">
                  Provisioning<span className="text-[#ffc749]">.</span>
                </span>
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsCreationModalOpen(true)}
              className="px-7 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              + Create New Account
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#454d82] uppercase tracking-widest">
                  Cargando base de datos...
                </span>
              </div>
            ) : usersList.length > 0 ? (
              usersList.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="flex items-center p-4 bg-white rounded-2xl border-2 border-white hover:border-[#626a9f]/45 shadow-sm hover:-translate-y-0.5 cursor-pointer transition-all"
                >
                  <img
                    src={
                      u.avatar_url ||
                      `https://ui-avatars.com/api/?name=${u.first_name || 'U'}+${u.last_name || ''}&background=626a9f&color=fff`
                    }
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#1e2246]/20 mr-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="font-extrabold text-[#1e2246] text-sm sm:text-base truncate block">
                      {u.first_name} {u.last_name}
                    </span>
                    <span className="text-xs text-[#626a9f] font-medium truncate block">{u.email}</span>
                  </div>
                  <div className="flex gap-2 shrink-0 items-center">
                    <span
                      className={`rounded-full text-[10px] px-3 py-1 font-extrabold tracking-wider uppercase ${
                        u.role === 'Student'
                          ? 'bg-[#e8eaf7] text-[#454d82]'
                          : u.role === 'Teacher'
                          ? 'bg-[#e7faf3] text-[#128063]'
                          : 'bg-[#ee665b]/15 text-[#c93f34]'
                      }`}
                    >
                      {u.role}
                    </span>
                    {u.role === 'Student' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImpersonatedStudent(u);
                        }}
                        className="bg-[#f4f6fc] hover:bg-[#ffc749] text-[#1e2246] border border-[#1e2246]/25 hover:border-[#1e2246] rounded-full text-[10px] px-3.5 py-1 font-extrabold tracking-wider uppercase transition-colors cursor-pointer"
                      >
                        View As
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-xs font-bold text-[#626a9f] uppercase tracking-widest bg-[#f4f6fc] rounded-2xl border border-white">
                No users found in database.
              </p>
            )}
          </div>

          <AccountCreationModal
            isOpen={isCreationModalOpen}
            onClose={() => setIsCreationModalOpen(false)}
            onSave={handleSaveNewAccount}
          />
          <UserManagementDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {/* ANALYTICS */}
      {activeSubTab === 'Analytics' && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-5 sm:p-8 w-full">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">
            <span className="text-[#1e2246]">Platform </span>
            <span className="text-[#626a9f]">
              Analytics<span className="text-[#ffc749]">.</span>
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-[#fff9e8] to-[#ffe69e] border-2 border-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-2">
                Monthly Recurring Revenue
              </span>
              <span className="text-4xl font-extrabold text-[#1e2246]">$0.00</span>
            </div>
            <div className="bg-gradient-to-br from-[#747db8] to-[#5b64a0] border-2 border-white/40 rounded-3xl p-8 flex flex-col items-center justify-center text-white shadow-sm">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-2">
                Active Cohort Split
              </span>
              <span className="text-4xl font-extrabold text-[#ffc749]">0% / 0%</span>
            </div>
            <div className="bg-[#f4f6fc] border-2 border-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner">
              <span className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mb-2">
                Class Utilization Rate
              </span>
              <span className="text-4xl font-extrabold text-[#1e2246]">0%</span>
            </div>
            <div className="bg-gradient-to-br from-[#ebfcf6] to-[#d1f4e8] border-2 border-[#16a37f]/35 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-[#128063] uppercase tracking-widest mb-2">
                Student Churn
              </span>
              <span className="text-4xl font-extrabold text-[#128063]">0%</span>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER DIRECTORY */}
      {activeSubTab === 'Teacher Directory' && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-5 sm:p-8 w-full">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">
            <span className="text-[#1e2246]">Teacher </span>
            <span className="text-[#626a9f]">
              Management<span className="text-[#ffc749]">.</span>
            </span>
          </h2>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#454d82] uppercase tracking-widest">
                  Cargando base de datos...
                </span>
              </div>
            ) : usersList.filter((u) => u.role === 'Teacher').length > 0 ? (
              usersList
                .filter((u) => u.role === 'Teacher')
                .map((teacher) => (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedUser(teacher)}
                    className="flex items-center p-4 bg-white rounded-2xl border-2 border-white hover:border-[#626a9f]/45 shadow-sm hover:-translate-y-0.5 cursor-pointer transition-all"
                  >
                    <img
                      src={
                        teacher.avatar_url ||
                        `https://ui-avatars.com/api/?name=${teacher.first_name || 'T'}+${teacher.last_name || ''}&background=626a9f&color=fff`
                      }
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1e2246]/20 mr-4 shrink-0"
                    />
                    <span className="font-extrabold text-[#1e2246] text-sm sm:text-base mr-4 truncate flex-grow">
                      {teacher.first_name} {teacher.last_name}
                    </span>
                    <span className="bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] rounded-xl text-[10px] px-3 py-1 font-extrabold tracking-widest shrink-0">
                      {teacher.cefr || 'C2'}
                    </span>
                  </div>
                ))
            ) : (
              <p className="py-12 text-center text-xs font-bold text-[#626a9f] uppercase tracking-widest bg-[#f4f6fc] rounded-2xl border border-white">
                No teachers found in database.
              </p>
            )}
          </div>
          <UserManagementDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {(activeSubTab === 'Candidate Evaluator' || activeSubTab === 'System Logs') && (
        <div className="bg-gradient-to-br from-white/95 to-[#f2f4fd]/85 backdrop-blur-2xl rounded-[2.25rem] shadow-[0_20px_42px_-18px_rgba(55,63,118,0.2)] border-2 border-white p-14 w-full flex items-center justify-center">
          <p className="text-[#626a9f] font-bold uppercase tracking-widest text-xs text-center border-2 border-dashed border-[#626a9f]/30 rounded-2xl p-8 bg-[#f4f6fc]">
            Module {activeSubTab} empty pending data insertion.
          </p>
        </div>
      )}
    </div>
  );
};

export default MasterSettings;