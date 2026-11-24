import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const AccountCreationModal = ({ isOpen, onClose, onSave }) => {
  const [role, setRole] = useState('Student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    avatarUrl: '',
    username: '',
    password: '',
    level: 'A1',
    unit: '1',
    discount: '0',
    credits: '0',
    cefr: 'C1',
    rate: '15.00',
    bioUrl: '',
    adminLevel: 'Admin (Content & Teachers)',
  });

  if (!isOpen) return null;

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

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
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[400] flex items-center justify-center bg-[#1e2246]/55 backdrop-blur-xl p-4 font-montserrat text-[#1e2246]"
    >
      <style>{`
        .ola-modal-phone .PhoneInputInput { border: none; background: transparent; outline: none; width: 100%; font-size: 0.875rem; color: #1e2246; font-weight: 600; }
        .ola-modal-phone .PhoneInputCountryIcon { box-shadow: none; border: none; }
        .ola-modal-phone .PhoneInputCountryIconImg { border-radius: 4px; }
        .ola-modal-phone .PhoneInputCountrySelectArrow { color: #454d82; }
      `}</style>

      <div className="w-full max-w-4xl bg-gradient-to-br from-white/95 to-[#f2f4fd]/90 backdrop-blur-2xl border-2 border-white rounded-[2.25rem] shadow-[0_24px_54px_-16px_rgba(30,34,70,0.34),inset_0_2px_2px_#ffffff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white/75 p-5 sm:p-6 border-b border-[#626a9f]/15 shrink-0 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="text-center md:text-left">
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1">
              OutLoud Accounts
            </span>
            <h2 className="text-[#1e2246] font-extrabold text-xl uppercase tracking-tight">
              Create New Account
            </h2>
          </div>

          <div className="flex gap-1 bg-[#e8eaf7] p-1 rounded-full border border-white">
            {['Student', 'Teacher', 'Admin'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  role === r
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246]'
                }`}
              >
                {r === 'Admin' ? 'Admin / Super' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-7 flex-grow">
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-[10.5px] font-extrabold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
              Universal Profile Details
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Password *</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">WhatsApp Number *</label>
              <PhoneInput
                international
                defaultCountry="VE"
                value={formData.whatsapp}
                onChange={(value) => handleInputChange('whatsapp', value)}
                className="ola-modal-phone w-full p-3 bg-white border-2 border-[#dfe2f2] focus-within:border-[#454d82] rounded-xl text-sm shadow-sm flex items-center gap-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Profile Picture URL</label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50 shadow-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-[10.5px] font-extrabold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
              {role} Configuration
            </h3>

            {role === 'Student' && (
              <div className="grid grid-cols-2 gap-4 bg-[#f4f6fc] p-5 rounded-2xl border border-white shadow-inner">
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Initial Level</span>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    <option value="A1">A1: Básico 1</option>
                    <option value="A2">A2: Básico 2</option>
                    <option value="B1">B1: Intermedio 1</option>
                    <option value="B2">B2: Intermedio 2</option>
                    <option value="C1">C1: Avanzado 1</option>
                    <option value="C2">C2: Avanzado 2</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Initial Unit</span>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    {Array.from({ length: 92 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Unit {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-bold text-[#1e2246] outline-none text-center"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Starting Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.credits}
                    onChange={(e) => handleInputChange('credits', e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-bold text-[#1e2246] outline-none text-center"
                  />
                </div>
              </div>
            )}

            {role === 'Teacher' && (
              <div className="grid grid-cols-2 gap-4 bg-[#f4f6fc] p-5 rounded-2xl border border-white shadow-inner">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">CEFR Certification</label>
                  <select
                    value={formData.cefr}
                    onChange={(e) => handleInputChange('cefr', e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    <option>B2</option>
                    <option>C1</option>
                    <option>C2</option>
                    <option>Native</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Hourly Rate (USD)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-bold text-[#1e2246] outline-none text-center"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Resume / Bio PDF URL</label>
                  <input
                    type="url"
                    value={formData.bioUrl}
                    onChange={(e) => handleInputChange('bioUrl', e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-sm font-semibold text-[#1e2246] outline-none placeholder-[#626a9f]/50"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {role === 'Admin' && (
              <div className="flex flex-col gap-2 bg-[#f4f6fc] p-5 rounded-2xl border border-white shadow-inner">
                <label className="text-[10px] font-bold text-[#454d82] uppercase tracking-wider">Admin Tier</label>
                <select
                  value={formData.adminLevel}
                  onChange={(e) => handleInputChange('adminLevel', e.target.value)}
                  className="w-full p-3 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                >
                  <option>Admin (Content &amp; Teachers)</option>
                  <option>Admin (Financials &amp; Students)</option>
                  <option>Super Admin (General Manager)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white/75 border-t border-[#626a9f]/15 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-[#1e2246] bg-white border-2 border-[#1e2246] shadow-[0_3px_0_rgba(30,34,70,0.16)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Provisioning...' : `Provision ${role} →`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCreationModal;