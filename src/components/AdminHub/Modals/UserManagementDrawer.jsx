import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const UserManagementDrawer = ({ user, onClose }) => {
  const [editableWhatsApp, setEditableWhatsApp] = useState('');

  useEffect(() => { if (user) setEditableWhatsApp(user.whatsapp || ''); }, [user]);

  if (!user) return null;

  return (
    <>
      <style>{`
        .custom-phone-input .PhoneInputInput { border: none; background: transparent; outline: none; width: 100%; font-size: 0.875rem; color: white; font-weight: bold; } 
        .custom-phone-input .PhoneInputCountryIcon { box-shadow: none; border: none; }
        .custom-phone-input .PhoneInputCountryIconImg { border-radius: 4px; }
      `}</style>
      
      <div className="fixed inset-0 bg-[#070b19]/80 backdrop-blur-sm z-[299] transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#070b19]/90 backdrop-blur-xl z-[300] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-white/20 animate-fade-in overflow-hidden font-montserrat shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-[#fcd34d] uppercase tracking-widest drop-shadow-md">{user.role} Profile</h3>
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">ID: {user.id.substring(0,8)}...</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 flex-grow bg-transparent">
          
          <div className="flex flex-col items-center bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
            <img src={user.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg mb-4" />
            <h4 className="text-xl font-black text-white tracking-wide mb-2 text-center">{user.first_name} {user.last_name}</h4>
            <div className="flex gap-2">
              <span className={`text-white rounded-md text-[10px] px-3 py-1 font-black uppercase tracking-widest shadow-md border border-white/20 ${user.role === 'Student' ? 'bg-blue-600/80' : user.role === 'Teacher' ? 'bg-purple-600/80' : 'bg-red-600/80'}`}>{user.role}</span>
              {user.cefr && <span className="bg-[#fcd34d] text-[#08203e] rounded-md text-[10px] px-3 py-1 font-black tracking-widest shadow-md">{user.cefr}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <h4 className="text-[10px] font-bold text-[#fcd34d] uppercase tracking-widest border-b border-white/10 pb-1 drop-shadow-md">Contact Information</h4>
             <div className="bg-black/20 p-4 rounded-2xl border border-white/10 shadow-inner flex flex-col gap-4 text-sm">
               <div className="flex justify-between items-center">
                 <span className="font-bold text-[10px] tracking-widest uppercase text-white/50">Email</span>
                 <input type="email" defaultValue={user.email} className="w-48 bg-[#070b19] border border-white/20 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-[#fcd34d] transition-colors" />
               </div>
               <div className="flex justify-between items-center">
                 <span className="font-bold text-[10px] tracking-widest uppercase text-white/50">WhatsApp</span>
                 <div className="w-48 bg-[#070b19] border border-white/20 rounded-lg p-2 focus-within:border-[#fcd34d] transition-colors">
                    <PhoneInput international defaultCountry="US" value={editableWhatsApp} onChange={setEditableWhatsApp} className="custom-phone-input flex items-center gap-2" />
                 </div>
               </div>
             </div>
          </div>

          {user.role === 'Student' && (
             <div className="flex flex-col gap-3">
               <h4 className="text-[10px] font-bold text-[#fcd34d] uppercase tracking-widest border-b border-white/10 pb-1 drop-shadow-md">Academic & Financial</h4>
               <div className="bg-black/20 p-4 rounded-2xl border border-white/10 shadow-inner flex flex-col gap-4 text-sm">
                 <div className="flex justify-between items-center">
                   <span className="font-bold text-[10px] tracking-widest uppercase text-white/50">Current Level</span>
                   <select name="level" defaultValue={user.level} className="w-40 bg-[#070b19] border border-white/20 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-[#fcd34d]">
                     <option value="A1">A1: Básico 1</option><option value="A2">A2: Básico 2</option><option value="B1">B1: Intermedio 1</option><option value="B2">B2: Intermedio 2</option><option value="C1">C1: Avanzado 1</option><option value="C2">C2: Avanzado 2</option>
                   </select>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-bold text-[10px] tracking-widest uppercase text-white/50">Current Unit</span>
                   <select name="unit" defaultValue={user.unit || 1} className="w-24 bg-[#070b19] border border-white/20 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-[#fcd34d]">
                     {Array.from({length: 93}, (_, i) => (<option key={i+1} value={i+1}>Unit {i+1}</option>))}
                   </select>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-bold text-[10px] tracking-widest uppercase text-white/50">Discounts (%)</span>
                   <input type="number" name="discount" defaultValue={user.discount || 0} className="w-24 bg-[#070b19] border border-white/20 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-bold text-[10px] tracking-widest uppercase text-white/50">Available Credits</span>
                   <input type="number" name="credits" defaultValue={user.credits || 0} className="w-24 bg-[#070b19] border border-white/20 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-[#fcd34d] text-center" />
                 </div>
               </div>
             </div>
          )}
          
          <div className="flex flex-col gap-3">
             <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest border-b border-red-500/20 pb-1 drop-shadow-md">System Security</h4>
             <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 shadow-inner flex flex-col gap-4 text-sm">
               <div className="flex justify-between items-center">
                 <span className="font-bold text-[10px] tracking-widest uppercase text-red-300">Username</span>
                 <input type="text" defaultValue={user.username} className="w-48 bg-[#070b19] border border-red-500/30 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-red-400 transition-colors" />
               </div>
             </div>
          </div>
        </div>

        <div className="p-5 bg-black/40 border-t border-white/10 shrink-0">
          <button className="w-full bg-[#fcd34d] text-[#08203e] font-black rounded-full py-4 shadow-[0_0_15px_rgba(252,211,77,0.4)] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all text-xs">
            SAVE CHANGES
          </button>
        </div>
      </div>
    </>
  );
};

export default UserManagementDrawer;