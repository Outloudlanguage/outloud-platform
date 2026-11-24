import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const UserManagementDrawer = ({ user, onClose }) => {
  const [editableWhatsApp, setEditableWhatsApp] = useState('');

  useEffect(() => {
    if (user) setEditableWhatsApp(user.whatsapp || '');
  }, [user]);

  if (!user) return null;

  return (
    <>
      <style>{`
        .ola-drawer-phone .PhoneInputInput { border: none; background: transparent; outline: none; width: 100%; font-size: 0.8rem; color: #1e2246; font-weight: 700; }
        .ola-drawer-phone .PhoneInputCountryIcon { box-shadow: none; border: none; }
        .ola-drawer-phone .PhoneInputCountryIconImg { border-radius: 4px; }
        .ola-drawer-phone .PhoneInputCountrySelectArrow { color: #454d82; }
      `}</style>

      <div
        className="fixed inset-0 bg-[#1e2246]/50 backdrop-blur-md z-[299] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-to-b from-white/98 to-[#f2f4fd]/95 backdrop-blur-2xl z-[300] flex flex-col border-l-2 border-white overflow-hidden font-montserrat text-[#1e2246] shadow-[-16px_0_40px_rgba(30,34,70,0.22)]">
        {/* Header */}
        <div className="bg-white/80 p-5 sm:p-6 border-b border-[#626a9f]/15 flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <span className="inline-block w-fit text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1">
              {user.role} Profile
            </span>
            <h3 className="text-lg font-extrabold text-[#1e2246] tracking-tight">
              {user.first_name} {user.last_name}
            </h3>
            <span className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mt-0.5">
              ID: {user.id ? `${String(user.id).substring(0, 8)}...` : 'N/A'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] flex items-center justify-center text-[#1e2246] font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 flex-grow">
          {/* Identity Card */}
          <div className="flex flex-col items-center bg-[#f4f6fc] p-6 rounded-3xl border border-white shadow-inner">
            <img
              src={
                user.avatar_url ||
                `https://ui-avatars.com/api/?name=${user.first_name || 'O'}+${user.last_name || ''}&background=626a9f&color=fff`
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-3.5"
            />
            <h4 className="text-xl font-extrabold text-[#1e2246] tracking-tight mb-2 text-center">
              {user.first_name} {user.last_name}
            </h4>
            <div className="flex gap-2">
              <span
                className={`rounded-full text-[10px] px-3.5 py-1 font-extrabold uppercase tracking-widest ${
                  user.role === 'Student'
                    ? 'bg-[#e8eaf7] text-[#454d82]'
                    : user.role === 'Teacher'
                    ? 'bg-[#e7faf3] text-[#128063]'
                    : 'bg-[#ee665b]/15 text-[#c93f34]'
                }`}
              >
                {user.role}
              </span>
              {user.cefr && (
                <span className="bg-[#ffc749] text-[#1e2246] border border-[#1e2246] rounded-full text-[10px] px-3 py-1 font-extrabold tracking-widest">
                  {user.cefr}
                </span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[10.5px] font-extrabold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-1.5">
              Contact Information
            </h4>
            <div className="bg-[#f4f6fc] p-4 rounded-2xl border border-white shadow-inner flex flex-col gap-3.5">
              <div className="flex justify-between items-center gap-3">
                <span className="font-bold text-[10px] tracking-widest uppercase text-[#626a9f]">Email</span>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-52 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl p-2 text-xs font-bold text-[#1e2246] outline-none"
                />
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="font-bold text-[10px] tracking-widest uppercase text-[#626a9f]">WhatsApp</span>
                <div className="w-52 bg-white border-2 border-[#dfe2f2] focus-within:border-[#454d82] rounded-xl p-2">
                  <PhoneInput
                    international
                    defaultCountry="VE"
                    value={editableWhatsApp}
                    onChange={setEditableWhatsApp}
                    className="ola-drawer-phone flex items-center gap-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Academic & Financial */}
          {user.role === 'Student' && (
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[10.5px] font-extrabold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-1.5">
                Academic &amp; Financial
              </h4>
              <div className="bg-[#f4f6fc] p-4 rounded-2xl border border-white shadow-inner flex flex-col gap-3.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] tracking-widest uppercase text-[#626a9f]">Current Level</span>
                  <select
                    name="level"
                    defaultValue={user.level}
                    className="w-40 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl p-2 text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    <option value="A1">A1: Básico 1</option>
                    <option value="A2">A2: Básico 2</option>
                    <option value="B1">B1: Intermedio 1</option>
                    <option value="B2">B2: Intermedio 2</option>
                    <option value="C1">C1: Avanzado 1</option>
                    <option value="C2">C2: Avanzado 2</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] tracking-widest uppercase text-[#626a9f]">Current Unit</span>
                  <select
                    name="unit"
                    defaultValue={user.unit || 1}
                    className="w-28 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl p-2 text-xs font-bold text-[#1e2246] outline-none cursor-pointer"
                  >
                    {Array.from({ length: 92 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Unit {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] tracking-widest uppercase text-[#626a9f]">Discounts (%)</span>
                  <input
                    type="number"
                    name="discount"
                    defaultValue={user.discount || 0}
                    className="w-28 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl p-2 text-xs font-bold text-[#1e2246] outline-none text-center"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] tracking-widest uppercase text-[#626a9f]">
                    Available Credits
                  </span>
                  <input
                    type="number"
                    name="credits"
                    defaultValue={user.credits || 0}
                    className="w-28 bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-xl p-2 text-xs font-bold text-[#1e2246] outline-none text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Security */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[10.5px] font-extrabold text-[#c93f34] uppercase tracking-widest border-b border-[#ee665b]/25 pb-1.5">
              System Security
            </h4>
            <div className="bg-[#fff2f1] p-4 rounded-2xl border border-[#ee665b]/35 flex flex-col gap-3">
              <div className="flex justify-between items-center gap-3">
                <span className="font-bold text-[10px] tracking-widest uppercase text-[#c93f34]">Username</span>
                <input
                  type="text"
                  defaultValue={user.username}
                  className="w-52 bg-white border-2 border-[#ee665b]/40 focus:border-[#c93f34] rounded-xl p-2 text-xs font-bold text-[#1e2246] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white/80 border-t border-[#626a9f]/15 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest text-[#1e2246] bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Save Changes ✓
          </button>
        </div>
      </div>
    </>
  );
};

export default UserManagementDrawer;