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

      // 1. Create User & Pass Metadata (The SQL Trigger handles the rest!)
      const { data, error } = await ghostClient.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: 'New',
            last_name: 'Student',
            role: 'Student',
            level: 'A1',
            unit: 1,
            status: 'active'
          }
        }
      });
      
      if (error) throw error;

      setStatusMessage(`Success! ${email} is registered and fully provisioned.`);
      setEmail('');
      setPassword('');
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md text-white font-montserrat">
      <h2 className="text-xl font-black uppercase tracking-widest mb-4 text-[#fcd34d]">Quick Provisioning</h2>
      
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-lg text-xs font-bold ${statusMessage.includes('Error') ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleCreateStudent} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-white/70 mb-1">EMAIL ADDRESS</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#fcd34d]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-white/70 mb-1">TEMPORARY PASSWORD</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#fcd34d]"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-2 w-full bg-[#fcd34d] text-[#08203e] font-black text-xs py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 tracking-widest uppercase"
        >
          {isLoading ? 'PROVISIONING...' : 'CREATE STUDENT ACCOUNT'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistrationForm;