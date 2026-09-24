import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient'; 

// =========================================
// 1. MOBILE & TABLET PORTRAIT UI
// =========================================
const MobileLogin = ({ onLogin, onInfoClick, onPlacementClick, visitCount }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (authError) setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.username, 
      password: credentials.password,
    });

    if (error) {
      setAuthError('Credenciales inválidas. Por favor, intente de nuevo.');
      setLoading(false);
    } else {
      if (onLogin) onLogin();
    }
  };

  return (
    <div className="relative min-h-screen w-full font-montserrat flex flex-col overflow-hidden bg-[#070b19] text-white">
      
      {/* Background with Original Image + Dark Glass Aesthetic */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/267683.jpeg')",
            backgroundPosition: "center 20%" 
          }}
        ></div>
        <div className="absolute inset-0 bg-[#070b19]/85 backdrop-blur-[2px]"></div>

        {/* Neon Wavy Effects */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/40 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/15 blur-[90px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full min-h-screen p-6">
        <div className="flex items-center space-x-3 mb-8 mt-4">
          <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Header.png" alt="Outloud Logo" className="h-11 object-contain drop-shadow-md opacity-90" />
          <div className="h-8 w-[1px] bg-white/30"></div>
          {visitCount > 0 && (
            <div className="flex items-center gap-2 bg-[#070b19]/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></div>
              <span className="text-[9px] font-black text-white/50 uppercase tracking-widest flex items-center">
                Total Visits: <span className="text-[#fcd34d] text-[10px] ml-1.5">{visitCount.toLocaleString()}</span>
              </span>
            </div>
          )}
        </div>

        {/* TRUE DARK GLASSMORPHISM CONTAINER */}
        <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_0_35px_rgba(252,211,77,0.2)] p-8 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Monogram.png" alt="Watermark" className="w-64 h-64 object-contain invert brightness-0" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white text-center leading-tight mb-1 drop-shadow-md">
              Student Portal Login
            </h2>
            <p className="text-xs text-white/70 text-center mb-6 font-medium">
              Enter your credentials to continue
            </p>

            {authError && (
              <div className="w-full text-center bg-red-500/20 border border-red-500/50 text-red-200 text-[11px] font-bold p-2 rounded-lg font-montserrat shadow-sm mb-4 backdrop-blur-md">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5 tracking-wide">Username or Email</label>
                <input
                  type="email"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Student_Example@ola.com"
                  className="w-full h-11 rounded-lg px-4 text-sm text-white placeholder-white/30 outline-none border border-white/10 bg-white/5 focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] transition-all shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5 tracking-wide">Password</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-lg pl-4 pr-12 text-sm text-white placeholder-white/30 outline-none border border-white/10 bg-white/5 focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fcd34d] text-[#08203e] font-black text-sm h-12 rounded-full mt-4 shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:scale-[1.02] hover:bg-[#fde68a] transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            <div className="flex flex-col items-center mt-6 space-y-1.5">
              <button onClick={onInfoClick} className="text-[11px] font-black text-white uppercase tracking-wider hover:text-[#fcd34d] animate-hard-blink transition-colors cursor-pointer">
                OBTENER MÁS INFORMACIÓN
              </button>
              <p className="text-[11px] text-white/70">
                Take a placement test <button type="button" onClick={(e) => { e.preventDefault(); if (onPlacementClick) onPlacementClick(); }} className="font-bold text-[#fcd34d] hover:underline cursor-pointer">here.</button>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-12 flex flex-col items-center justify-center w-full gap-5">
          <h1 className="text-white text-[32px] font-light tracking-widest leading-[1.2] text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            FORWARD<br/>
            TOGETHER
          </h1>
          <a 
            href="https://wa.me/584226885683" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#08203e] text-white text-[11px] font-bold uppercase tracking-widest px-10 py-3.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-105 active:scale-95 transition-all"
          >
            WHATSAPP CHAT
          </a>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 2. DESKTOP & PC UI
// =========================================
const DesktopLogin = ({ onLogin, onInfoClick, onPlacementClick }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  const authTimerRef = useRef(null);
  const [devMessage, setDevMessage] = useState('');
  const devTimerRef = useRef(null);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (authError) setAuthError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setAuthError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.username, 
      password: credentials.password,
    });

    if (error) {
      setAuthError('Credenciales inválidas. Por favor, intente de nuevo.');
      setLoading(false);
      
      if (authTimerRef.current) clearTimeout(authTimerRef.current);
      authTimerRef.current = setTimeout(() => {
        setAuthError('');
      }, 3000);
    } else {
      if (onLogin) onLogin();
    }
  };

  useEffect(() => {
    if (!devMessage) return;
    const handleGlobalClick = () => {
      setDevMessage('');
      if (devTimerRef.current) clearTimeout(devTimerRef.current);
    };
    const delayTimer = setTimeout(() => { window.addEventListener('click', handleGlobalClick); }, 50);
    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [devMessage]);

  useEffect(() => {
    return () => { if (authTimerRef.current) clearTimeout(authTimerRef.current); }
  }, []);

  const handleDevClick = (e) => {
    e.preventDefault();
    setDevMessage('Esta función se encuentra en desarrollo y estará lista en los próximos días');
    if (devTimerRef.current) clearTimeout(devTimerRef.current);
    devTimerRef.current = setTimeout(() => { setDevMessage(''); }, 3000);
  };

  return (
    <div className="flex h-screen w-full font-montserrat overflow-hidden bg-[#070b19] text-white">

      {/* LEFT AREA: Glassmorphism Login Canvas */}
      <div className="relative flex w-[45%] flex-col items-center justify-center px-6 md:px-10 overflow-hidden">
        
        {/* Neon Wavy Background Simulation */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
        </div>

        <div className="w-full max-w-[26rem] flex flex-col relative z-10 -mt-4">
          <div className="flex items-center justify-start w-full mb-6 shrink-0 gap-4">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Header.png" alt="Outloud Logo" className="h-10 md:h-12 object-contain opacity-90" />
            <div className="h-8 w-[1px] bg-white/30 shrink-0"></div>
            <span className="text-sm md:text-base font-light text-white/80 tracking-wide whitespace-nowrap">Online Platform</span>
          </div>
          
          {/* TRUE DARK GLASSMORPHISM CONTAINER */}
          <div className="relative w-full rounded-[2rem] bg-white/10 px-8 py-10 shadow-[0_0_35px_rgba(252,211,77,0.2)] flex flex-col backdrop-blur-2xl border border-white/20 shrink-0">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden rounded-[2rem]">
              <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Monogram.png" alt="Monogram Watermark" className="w-[75%] object-contain invert brightness-0" />
            </div>
            
            <div className="relative z-10 flex flex-col">
              <h2 className="mb-1 text-2xl md:text-3xl font-black text-white text-center leading-tight whitespace-nowrap drop-shadow-md">
                Student Portal Login
              </h2>
              <p className="mb-8 text-sm text-white/70 font-medium text-center">
                Enter your credentials to continue
              </p>
              
              {(devMessage || authError) && (
                <div className="w-full text-center bg-red-500/20 border border-red-500/50 text-red-200 text-[10px] md:text-[11px] font-bold p-2.5 rounded-lg shadow-sm mb-5 backdrop-blur-md">
                  {devMessage || authError}
                </div>
              )}
              
              <form onSubmit={handleLoginSubmit} className="flex w-full flex-col space-y-4">
                <div className="w-full text-left">
                  <label className="mb-1.5 block text-xs md:text-sm font-bold text-white/90 tracking-wide">Username or Email</label>
                  <input 
                    type="email" 
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Student_Example@ola.com" 
                    className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#fcd34d] focus:border-[#fcd34d] shadow-inner transition-all"
                    required
                  />
                </div>
                
                <div className="w-full text-left">
                  <label className="mb-1.5 block text-xs md:text-sm font-bold text-white/90 tracking-wide">Password</label>
                  <div className="relative w-full">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="••••••••" 
                      className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-4 pr-12 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#fcd34d] focus:border-[#fcd34d] shadow-inner transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <button type="submit" disabled={loading} className="mt-4 mx-auto w-[85%] rounded-full bg-[#fcd34d] text-[#08203e] py-3 text-sm font-black shadow-[0_0_15px_rgba(252,211,77,0.4)] hover:bg-[#fde68a] hover:scale-105 transition-all disabled:opacity-70 active:scale-95">
                  {loading ? 'Authenticating...' : 'Login'}
                </button>

                <div className="mt-5 text-center text-xs text-white flex flex-col items-center gap-1.5">
                  <a href="#" onClick={(e) => { e.preventDefault(); if (onInfoClick) onInfoClick(); }} className="font-black uppercase tracking-wider hover:text-[#fcd34d] animate-hard-blink transition-colors cursor-pointer">
                    OBTENER MÁS INFORMACIÓN
                  </a>
                  <p className="text-[11px] text-white/70">
                    Take a placement test <a href="#" onClick={(e) => { e.preventDefault(); if (onPlacementClick) onPlacementClick(); }} className="font-bold text-[#fcd34d] hover:underline cursor-pointer">here.</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AREA: Photography Canvas */}
      <div className="relative flex w-[55%] bg-[#070b19]">
        <div className="absolute inset-0">
          <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/267683.jpeg" alt="Student Background" className="h-full w-full object-cover" />
        </div>
        
        {/* Dark Blue Overlay Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-[#070b19]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-10 lg:px-14 shadow-[20px_0_40px_rgba(0,0,0,0.5)] border-r border-white/5">
          <div className="mb-8 flex flex-col items-center">
            {/* Stacked logo inverted to white */}
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/stacked.png" alt="Outloud Stacked Logo" className="w-48 md:w-56 object-contain drop-shadow-lg brightness-0 invert opacity-90" />
          </div>
          <h1 className="text-[1.5rem] md:text-[1.8rem] lg:text-[2.2rem] font-light tracking-[0.1em] leading-[1.4] text-white drop-shadow-md w-full mb-8">
            FORWARD<br/> TOGETHER
          </h1>
          <a 
            href="https://wa.me/584226885683" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#08203e] text-white text-xs md:text-sm font-bold uppercase tracking-widest px-10 py-4 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-105 hover:bg-blue-900 active:scale-95 transition-all"
          >
            WHATSAPP CHAT
          </a>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 3. FLOATING TRAFFIC WIDGET (Desktop Only)
// =========================================
const FloatingTrafficWidget = ({ visitCount }) => {
  if (visitCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-[#070b19]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl animate-fade-in group hover:bg-[#070b19] transition-colors cursor-default">
      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></div>
      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:text-white transition-colors flex items-center">
        Total Visits: <span className="text-[#fcd34d] text-xs ml-2">{visitCount.toLocaleString()}</span>
      </span>
    </div>
  );
};

// =========================================
// 4. MAIN PAGE WRAPPER
// =========================================
const LoginPage = (props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    const handleResize = () => { setIsMobile(window.innerWidth < 768); };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const trackVisit = async () => {
      // Strict Reality: No 24h block. Counts every single page load.
      await supabase.from('site_analytics').insert({ event_type: 'site_visit' });
    };

    const fetchTotal = async () => {
      const { count } = await supabase
        .from('site_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', 'site_visit');
      if (count !== null) setVisitCount(count);
    };

    trackVisit();
    fetchTotal();

    const channel = supabase.channel('public_traffic')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_analytics', filter: "event_type=eq.site_visit" }, () => {
        setVisitCount(prev => prev + 1);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return (
    <>
      <style>{`
        @keyframes hardBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        .animate-hard-blink { animation: hardBlink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
      
      {isMobile ? <MobileLogin {...props} visitCount={visitCount} /> : <DesktopLogin {...props} />}
      
      {/* Floating widget handles desktop, mobile UI handles its own rendering */}
      {!isMobile && <FloatingTrafficWidget visitCount={visitCount} />}
    </>
  );
};

export default LoginPage;