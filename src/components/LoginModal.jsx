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
      setErrorMsg('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ola-login-backdrop"
      onClick={(e) => e.target.id === 'ola-login-backdrop' && onClose()}
      className="fixed inset-0 z-[9000] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in font-montserrat"
    >
      <style>{`
        @keyframes olaModalPop {
          0% { opacity: 0; transform: translateY(18px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaModalEq {
          0%, 100% { transform: scaleY(0.32); }
          50% { transform: scaleY(1); }
        }
        .ola-modal-pop {
          animation: olaModalPop 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ola-modal-eq {
          transform-origin: center;
          animation: olaModalEq 1s ease-in-out infinite;
        }
        .ola-login-shell {
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.84) 0%, rgba(238, 241, 252, 0.78) 55%, rgba(255, 246, 222, 0.82) 100%);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow:
            0 28px 70px -12px rgba(20, 24, 58, 0.55),
            0 0 46px -8px rgba(255, 199, 73, 0.45),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.98);
        }
      `}</style>

      {/* Backlit Container Wrapper */}
      <div className="relative w-full max-w-[430px] ola-modal-pop">
        {/* Dual-Tone Ambient Backlight Halo */}
        <div
          className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-80 pointer-events-none -z-10"
          style={{
            background:
              'radial-gradient(circle at 20% 15%, rgba(255,199,73,0.65), transparent 55%), radial-gradient(circle at 85% 85%, rgba(98,106,159,0.75), transparent 60%)',
          }}
        />

        {/* Frosted Glass Modal Card */}
        <div className="ola-login-shell relative w-full rounded-[2.25rem] overflow-hidden">
          {/* ================================================== */}
          {/* EXPRESSIVE INDIGO GLASS HEADER STAGE               */}
          {/* ================================================== */}
          <div
            className="relative px-7 pt-7 pb-6 text-center overflow-hidden"
            style={{
              background:
                'linear-gradient(145deg, rgba(72, 80, 136, 0.96) 0%, rgba(35, 39, 77, 0.96) 100%)',
            }}
          >
            {/* Subtle Dot Texture & Corner Glow Inside Banner */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-56 h-24 rounded-full blur-2xl opacity-45 pointer-events-none"
              style={{ background: '#ffc749' }}
            />

            {/* Close Button (Custom SVG) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar inicio de sesión"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-[#ffc749] border border-white/25 hover:border-[#1e2246] text-white hover:text-[#1e2246] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Live Portal Pill */}
            <div className="relative z-10 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#16a37f] animate-pulse shadow-[0_0_8px_#16a37f]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ffc749]">
                Campus Portal • 24/7
              </span>
            </div>

            {/* Brand Lockup Flanked by Live Equalizer Bars */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="flex items-center gap-[3px] h-7">
                  {[10, 20, 14, 26].map((h, i) => (
                    <span
                      key={`ml-${i}`}
                      className="ola-modal-eq w-[3px] rounded-full"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 2 === 0 ? '#ffc749' : 'rgba(255,255,255,0.65)',
                        animationDelay: `${i * 0.14}s`,
                      }}
                    />
                  ))}
                </div>

                <OutLoudIcon className="w-16 h-16 drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]" />

                <div className="flex items-center gap-[3px] h-7">
                  {[26, 14, 20, 10].map((h, i) => (
                    <span
                      key={`mr-${i}`}
                      className="ola-modal-eq w-[3px] rounded-full"
                      style={{
                        height: `${h}px`,
                        backgroundColor: i % 2 === 1 ? '#ffc749' : 'rgba(255,255,255,0.65)',
                        animationDelay: `${(3 - i) * 0.14}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <OutLoudWordmark className="h-8 w-auto mb-1.5" fill="#ffffff" />
              <p className="text-[11px] font-semibold text-white/75 tracking-wide">
                Estudiantes, Profesores &amp; Administración
              </p>
            </div>
          </div>

          {/* ================================================== */}
          {/* FROSTED GLASS FORM BODY                            */}
          {/* ================================================== */}
          <div className="p-6 sm:p-8 relative z-10">
            {errorMsg && (
              <div className="mb-5 bg-[#ee665b]/15 border-2 border-[#ee665b] text-[#9b2c23] rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <svg className="w-4 h-4 shrink-0 text-[#ee665b]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#1e2246] mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#626a9f] group-focus-within:text-[#1e2246] transition-colors pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="student@outloudlanguage.com"
                    required
                    autoFocus
                    className="w-full bg-white/75 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-2xl pl-10 pr-4 py-3.5 text-sm font-semibold text-[#1e2246] placeholder-[#50567d]/55 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(255,199,73,0.3)] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#1e2246] mb-1.5">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#626a9f] group-focus-within:text-[#1e2246] transition-colors pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/75 focus:bg-white border-2 border-white focus:border-[#454d82] rounded-2xl pl-10 pr-12 py-3.5 text-sm font-semibold text-[#1e2246] placeholder-[#50567d]/55 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(255,199,73,0.3)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-[#626a9f] hover:text-[#1e2246] hover:bg-[#e8eaf7] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="ola-btn-yellow w-full py-4 mt-2 rounded-full font-black text-xs uppercase tracking-widest cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                    </svg>
                    <span>Ingresando al Campus...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar a Mi Hub</span>
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer Enrollment Helper */}
            <div className="mt-6 pt-5 border-t border-[#626a9f]/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-bold text-[#50567d]">
              <span>¿Aún no tienes cuenta?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEnrollClick?.();
                }}
                className="ola-reactive-text text-[#454d82] font-black uppercase tracking-wider text-[11px] cursor-pointer group"
              >
                <span>Solicitar Inscripción</span>
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}