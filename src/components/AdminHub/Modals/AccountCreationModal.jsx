import React, { useState, useEffect } from 'react';
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-outloud-blue/40 backdrop-blur-sm p-4">
      <style>{`.custom-phone-input .PhoneInputInput { border: none; background: transparent; outline: none; width: 100%; font-size: 0.875rem; color: #08203e; } .custom-phone-input .PhoneInputCountryIcon { box-shadow: none; border: none; }`}</style>
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-[#eef5fc] p-6 border-b border-gray-200 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-outloud-blue font-black text-xl uppercase tracking-wider font-montserrat">CREATE NEW ACCOUNT</h2>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {['Student', 'Teacher', 'Admin'].map(r => (
              <button key={r} onClick={() => setRole(r)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${role === r ? 'bg-outloud-blue text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{r === 'Admin' ? 'Admin / Super' : r}</button>
            ))}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8 bg-gray-50 flex-grow">
          <div className="flex-1 flex flex-col gap-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Universal Profile Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">First Name *</label><input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Last Name *</label><input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Username *</label><input type="text" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Password *</label><input type="text" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow" /></div>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Email Address *</label><input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow" /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">WhatsApp Number *</label><PhoneInput international defaultCountry="US" value={formData.whatsapp} onChange={(value) => handleInputChange('whatsapp', value)} className="custom-phone-input w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus-within:ring-2 focus-within:ring-student-yellow transition flex items-center gap-3" /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Profile Picture URL</label><input type="url" value={formData.avatarUrl} onChange={(e) => handleInputChange('avatarUrl', e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-student-yellow" /></div>
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <h3 className="text-xs font-bold text-outloud-blue uppercase tracking-widest border-b border-outloud-blue/20 pb-2 flex items-center justify-between">
              {role} Configuration
            </h3>
            {role === 'Student' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 w-full"><span className="text-[10px] font-bold text-outloud-blue uppercase tracking-widest">Initial Level</span><select name="level" className="bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-student-yellow"><option value="A1">A1: Básico 1</option><option value="A2">A2: Básico 2</option><option value="B1">B1: Intermedio 1</option><option value="B2">B2: Intermedio 2</option><option value="C1">C1: Avanzado 1</option><option value="C2">C2: Avanzado 2</option></select></div>
<div className="flex flex-col gap-1 w-full"><span className="text-[10px] font-bold text-outloud-blue uppercase tracking-widest">Initial Unit</span><select name="unit" className="bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-student-yellow">{Array.from({length: 93}, (_, i) => (<option key={i+1} value={i+1}>Unit {i+1}</option>))}</select></div>
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Discount Applied (%)</label><input type="number" min="0" max="100" value={formData.discount} onChange={(e) => handleInputChange('discount', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none text-center" /></div>
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Starting Credits</label><input type="number" min="0" value={formData.credits} onChange={(e) => handleInputChange('credits', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none text-center" /></div>
              </div>
            )}
            {role === 'Teacher' && (
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">CEFR Certification</label><select value={formData.cefr} onChange={(e) => handleInputChange('cefr', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none font-bold"><option>B2</option><option>C1</option><option>C2</option><option>Native</option></select></div>
                 <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-gray-500 uppercase">Hourly Rate (USD)</label><input type="number" step="0.50" value={formData.rate} onChange={(e) => handleInputChange('rate', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none" /></div>
                 <div className="flex flex-col gap-1.5 col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Resume / Bio PDF URL</label><input type="url" value={formData.bioUrl} onChange={(e) => handleInputChange('bioUrl', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none" /></div>
              </div>
            )}
            {role === 'Admin' && (
              <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Admin Tier</label>
                 <select value={formData.adminLevel} onChange={(e) => handleInputChange('adminLevel', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none font-bold text-outloud-blue"><option>Admin (Content & Teachers)</option><option>Admin (Financials & Students)</option><option>Super Admin (General Manager)</option></select>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wide text-gray-600 bg-transparent border-2 border-gray-300 hover:bg-gray-200 transition">CANCEL</button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 rounded-full font-black text-xs uppercase tracking-wide text-outloud-blue bg-student-yellow hover:scale-105 active:scale-95 disabled:opacity-50">{isSubmitting ? 'PROVISIONING...' : `PROVISION ${role.toUpperCase()} ACCOUNT`}</button>
        </div>
      </div>
    </div>
  );
};

export default AccountCreationModal;