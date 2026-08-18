import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
const UserManagementDrawer = ({ user, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [editableWhatsApp, setEditableWhatsApp] = useState('');

  useEffect(() => { if (user) setEditableWhatsApp(user.whatsapp || ''); }, [user]);

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-outloud-blue/20 backdrop-blur-sm z-[299] transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[300] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-white/60 animate-fade-in overflow-hidden">
        <div className="bg-[#eef5fc] p-6 border-b border-gray-200 flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-outloud-blue font-montserrat uppercase tracking-wide">{user.role} Profile Management</h3>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">ID: {user.id.substring(0,8)}...</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 flex-grow bg-gray-50">
          <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <img src={user.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm mb-4" />
            <h4 className="text-xl font-bold text-outloud-blue mb-1">{user.first_name} {user.last_name}</h4>
            <div className="flex gap-2 mt-2">
              <span className={`text-white rounded text-[10px] px-3 py-1 font-bold uppercase tracking-widest ${user.role === 'Student' ? 'bg-blue-500' : user.role === 'Teacher' ? 'bg-purple-500' : 'bg-red-500'}`}>{user.role}</span>
              {user.cefr && <span className="bg-outloud-blue text-white rounded text-[10px] px-3 py-1 font-bold tracking-widest">{user.cefr}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Contact Information</h4>
             <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 text-sm">
               <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Email:</span><input type="email" defaultValue={user.email} className="w-48 bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold text-outloud-blue focus:outline-none focus:border-student-yellow" /></div>
               <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">WhatsApp:</span><PhoneInput international defaultCountry="US" value={editableWhatsApp} onChange={setEditableWhatsApp} className="custom-phone-input w-48 bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold focus-within:border-student-yellow flex items-center gap-2" /></div>
             </div>
          </div>

          {user.role === 'Student' && (
             <div className="flex flex-col gap-3">
               <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Academic & Financial</h4>
               <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 text-sm">
                 <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Current Level:</span><select name="level" defaultValue={user.level} className="bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold text-outloud-blue focus:outline-none focus:border-student-yellow"><option value="A1">A1: Básico 1</option><option value="A2">A2: Básico 2</option><option value="B1">B1: Intermedio 1</option><option value="B2">B2: Intermedio 2</option><option value="C1">C1: Avanzado 1</option><option value="C2">C2: Avanzado 2</option></select></div>
          <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Current Unit:</span><select name="unit" defaultValue={user.unit || 1} className="bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold text-outloud-blue focus:outline-none focus:border-student-yellow">{Array.from({length: 93}, (_, i) => (<option key={i+1} value={i+1}>Unit {i+1}</option>))}</select></div>
          <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Discounts (%):</span><input type="number" name="discount" defaultValue={user.discount || 0} className="w-16 bg-gray-50 border border-gray-200 rounded p-1 text-xs font-bold text-center focus:outline-none focus:border-student-yellow" /></div>
          <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Available Credits:</span><input type="number" name="credits" defaultValue={user.credits || 0} className="w-16 bg-gray-50 border border-gray-200 rounded p-1 text-xs font-bold text-center focus:outline-none focus:border-student-yellow" /></div>
               </div>
             </div>
          )}
          
          {/* Real Authentication credentials cannot be fetched backwards from Supabase Auth for security, we only show the username from the profile table */}
          <div className="flex flex-col gap-3">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">System Security</h4>
             <div className="bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm flex flex-col gap-2 text-sm">
               <div className="flex justify-between items-center"><span className="font-semibold text-red-800">Username:</span><input type="text" defaultValue={user.username} className="w-48 bg-white border border-red-200 rounded p-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-400" /></div>
             </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex flex-col gap-2">
          <button className="w-full bg-student-yellow text-outloud-blue font-black rounded-xl py-3 shadow-md uppercase tracking-wide hover:opacity-90 transition-opacity text-xs">SAVE CHANGES</button>
        </div>
      </div>
    </>
  );
};

export default UserManagementDrawer;