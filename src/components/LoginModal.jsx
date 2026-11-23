import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';
import { OutLoudIcon, OutLoudWordmark } from './OutLoudBrand';

export default function LoginModal({ isOpen, onClose, onLogin, onEnrollClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      // Best-effort activity stamp for Admin Hub stats
      if (data?.user?.id) {
        supabase
          .from('profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', data.user.id)
          .then(() => {})
          .catch(() => {});
      }

      onClose();
      onLogin();
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Invalid email or password. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ola-login-backdrop"
      onClick={(e) => e.target.id === 'ola-login-backdrop' && onClose()}
      className="fixed inset-0 z-[9000] bg-[#23274d]/45 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-montserrat"
    >
      <div className="relative w-full max-w-md bg-white border-2 border-[#23274d] rounded-[2rem] shadow-[0_14px_0_#23274d] p-7 sm:p-9 overflow-hidden animate-slide-up">
        {/* Decorative Corner Glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#fff3d1] pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-36 h-36 rounded-full bg-[#e8eaf7] pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login"
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-[#f6f7fc] hover:bg-[#e8eaf7] border-2 border-[#dfe2f2] text-[#23274d] font-black flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Brand Lockup */}
        <div className="relative z-10 flex flex-col items-center text-center mb-7">
          <OutLoudIcon className="w-16 h-16 mb-1.5 drop-shadow-[0_6px_12px_rgba(98,106,159,0.2)]" />
          <OutLoudWordmark className="h-9 w-auto mb-2" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#60668a]">
            Student &amp; Staff Campus Portal
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="relative z-10 mb-5 bg-[#ee665b]/10 border-2 border-[#ee665b] text-[#b9382d] rounded-xl px-4 py-3 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-[#23274d] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@outloudlanguage.com"
              required
              autoFocus
              className="w-full bg-[#f6f7fc] border-2 border-[#dfe2f2] focus:border-[#626a9f] focus:bg-white rounded-xl px-4 py-3.5 text-sm font-semibold text-[#23274d] placeholder-[#60668a]/50 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-[#23274d] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#f6f7fc] border-2 border-[#dfe2f2] focus:border-[#626a9f] focus:bg-white rounded-xl px-4 py-3.5 pr-12 text-sm font-semibold text-[#23274d] placeholder-[#60668a]/50 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase tracking-wider text-[#626a9f] hover:text-[#23274d] cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="ola-btn-yellow w-full py-4 mt-2 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Entering Campus...' : 'Sign In to My Hub'}
          </button>
        </form>

        {/* Footer Helper */}
        <div className="relative z-10 mt-6 pt-5 border-t border-[#e8eaf7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#60668a]">
          <span>New to OutLoud?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEnrollClick?.();
            }}
            className="text-[#626a9f] hover:text-[#23274d] font-black uppercase tracking-wider underline underline-offset-4 cursor-pointer"
          >
            Apply for Enrollment →
          </button>
        </div>
      </div>
    </div>
  );
}