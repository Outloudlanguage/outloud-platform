import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const AccountCreationModal = ({ isOpen, onClose, onSave }) => {
  const [role, setRole] = useState('Student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', whatsapp: '', avatarUrl: '', username: '', password: '',
    level: 'A1: Básico 1', unit: 'Unit 1', discount: '0', credits: '0', cefr: 'C1', rate: '15.00', bioUrl: '', adminLevel: 'Admin (Content)',
  });

  if (!isOpen) return null;

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.email || !formData.whatsapp || !formData.username || !formData.password) {
      return alert('Please fill in all required universal fields (Name, Email, Phone, Username, Password).');
    }
    setIsSubmitting(true);
    await onSave({ ...formData, role });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 font-montserrat">
      <style>{`
        .custom-phone-input .PhoneInputInput { border: none; background: transparent; outline: none; width: 100%; font-size: 0.875rem; color: white; } 
        .custom-phone-input .PhoneInputCountryIcon { box-shadow: none; border: none; }
        .custom-phone-input .PhoneInputCountryIconImg { border-radius: 4px; }
      `}</style>
      
      <div className="w-full max-w-4xl bg-[#070b19]/40 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-white/5 p-6 border-b border-white/10 shrink-0 flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center">
          <div>
            <h2 className="text-white font-black text-xl uppercase tracking-widest drop-shadow-md">CREATE NEW ACCOUNT</h2>
          </div>
          <div className="flex gap-2 bg-black/20 p-1.5 rounded-xl border border-white/10">
            {['Student', 'Teacher', 'Admin'].map(r => (
              <button key={r} onClick={() => setRole(r)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${role === r ? 'bg-[#fcd34d] text-[#08203e] shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                 {r === 'Admin' ? 'Admin / Super' : r}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8 bg-white/5 shadow-inner flex-grow">
          <div className="flex-1 flex flex-col gap-5">
            <h3 className="text-[10px] font-bold text-[#fcd34d] uppercase tracking-widest border-b border-white/10 pb-2 drop-shadow-md">Universal Profile Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">First Name *</label>
                 <input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d]" />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Last Name *</label>
                 <input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d]" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Username *</label>
                 <input type="text" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d]" />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Password *</label>
                 <input type="text" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d]" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
               <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Email Address *</label>
               <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d]" />
            </div>
            
            <div className="flex flex-col gap-2">
               <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">WhatsApp Number *</label>
               <PhoneInput international defaultCountry="US" value={formData.whatsapp} onChange={(value) => handleInputChange('whatsapp', value)} className="custom-phone-input w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus-within:border-[#fcd34d] transition-colors flex items-center gap-3" />
            </div>
            
            <div className="flex flex-col gap-2">
               <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Profile Picture URL</label>
               <input type="url" value={formData.avatarUrl} onChange={(e) => handleInputChange('avatarUrl', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d] placeholder-white/30" placeholder="https://..." />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <h3 className="text-[10px] font-bold text-[#fcd34d] uppercase tracking-widest border-b border-white/10 pb-2 flex items-center justify-between drop-shadow-md">
              {role} Configuration
            </h3>
            
            {role === 'Student' && (
              <div className="grid grid-cols-2 gap-4 bg-black/20 p-5 rounded-2xl border border-white/10 shadow-inner">
                <div className="flex flex-col gap-2 w-full">
                   <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Initial Level</span>
                   <select name="level" className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                      <option value="A1">A1: Básico 1</option><option value="A2">A2: Básico 2</option><option value="B1">B1: Intermedio 1</option><option value="B2">B2: Intermedio 2</option><option value="C1">C1: Avanzado 1</option><option value="C2">C2: Avanzado 2</option>
                   </select>
                </div>
                <div className="flex flex-col gap-2 w-full">
                   <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Initial Unit</span>
                   <select name="unit" className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                      {Array.from({length: 93}, (_, i) => (<option key={i+1} value={i+1}>Unit {i+1}</option>))}
                   </select>
                </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Discount Applied (%)</label>
                   <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => handleInputChange('discount', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d] text-center" />
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Starting Credits</label>
                   <input type="number" min="0" value={formData.credits} onChange={(e) => handleInputChange('credits', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d] text-center" />
                 </div>
              </div>
            )}
            
            {role === 'Teacher' && (
              <div className="grid grid-cols-2 gap-4 bg-black/20 p-5 rounded-2xl border border-white/10 shadow-inner">
                 <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">CEFR Certification</label>
                   <select value={formData.cefr} onChange={(e) => handleInputChange('cefr', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                      <option>B2</option><option>C1</option><option>C2</option><option>Native</option>
                   </select>
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Hourly Rate (USD)</label>
                   <input type="number" step="0.50" value={formData.rate} onChange={(e) => handleInputChange('rate', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d] text-center" />
                 </div>
                 <div className="flex flex-col gap-2 col-span-2">
                   <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Resume / Bio PDF URL</label>
                   <input type="url" value={formData.bioUrl} onChange={(e) => handleInputChange('bioUrl', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fcd34d] placeholder-white/30" placeholder="https://..." />
                 </div>
              </div>
            )}
            
            {role === 'Admin' && (
              <div className="flex flex-col gap-2 bg-black/20 p-5 rounded-2xl border border-white/10 shadow-inner">
                 <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Admin Tier</label>
                 <select value={formData.adminLevel} onChange={(e) => handleInputChange('adminLevel', e.target.value)} className="w-full p-3 bg-[#070b19] border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#fcd34d]">
                    <option>Admin (Content & Teachers)</option><option>Admin (Financials & Students)</option><option>Super Admin (General Manager)</option>
                 </select>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0 rounded-b-[30px]">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all">CANCEL</button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest text-[#08203e] bg-[#fcd34d] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)] disabled:opacity-50">
             {isSubmitting ? 'PROVISIONING...' : `PROVISION ${role}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCreationModal;