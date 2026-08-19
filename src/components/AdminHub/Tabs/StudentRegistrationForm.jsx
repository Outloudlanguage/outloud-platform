import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const StudentRegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('Registering student in Auth Vault...');

    try {
      const ghostClient = createClient(
        'https://kuvsmrheywhzxfiyivtg.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dnNtcmhleXdoenhmaXlpdnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTc4MzYsImV4cCI6MjEwMTc5MzgzNn0.upJqo4zdmO3xj4KN7zUURDTI0ZY2RNWqgvLbSSCu3BA',
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data, error } = await ghostClient.auth.signUp({ email, password });
      if (error) throw error;

      setStatusMessage(`Success! ${email} is registered.`);
      setEmail('');
      setPassword('');
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-[30px] shadow-2xl border border-white/10 mt-6 mb-8">
      <h3 className="text-lg font-black text-[#fcd34d] uppercase tracking-widest mb-6 drop-shadow-md">Register New Student</h3>
      <form onSubmit={handleCreateStudent} className="flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full flex flex-col gap-2">
          <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Student Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-[#070b19] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#fcd34d] transition-colors placeholder-white/30 shadow-inner" placeholder="student@example.com" />
        </div>
        <div className="flex-1 w-full flex flex-col gap-2">
          <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Temp Password</label>
          <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-[#070b19] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#fcd34d] transition-colors placeholder-white/30 shadow-inner" placeholder="SecurePassword123" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-[#fcd34d] text-[#08203e] font-black px-8 py-4 rounded-xl shadow-[0_0_15px_rgba(252,211,77,0.4)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 text-xs">
          {isLoading ? 'WAIT...' : 'CREATE'}
        </button>
      </form>
      {statusMessage && (
        <div className={`mt-6 p-4 rounded-xl text-xs font-bold text-center tracking-widest uppercase shadow-inner border ${statusMessage.includes('Error') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default StudentRegistrationForm;