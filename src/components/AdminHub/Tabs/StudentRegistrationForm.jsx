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
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6 mb-6">
      <h3 className="text-lg font-black text-outloud-blue uppercase tracking-widest mb-4">Register New Student</h3>
      <form onSubmit={handleCreateStudent} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Student Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-student-yellow" />
        </div>
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Temp Password</label>
          <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-student-yellow" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-student-yellow text-outloud-blue font-black px-8 py-3 rounded-xl shadow-md uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50">
          {isLoading ? 'WAIT...' : 'CREATE'}
        </button>
      </form>
      {statusMessage && (
        <div className={`mt-4 p-3 rounded-xl text-xs font-bold text-center ${statusMessage.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default StudentRegistrationForm;