import React, { useState, useEffect, useRef } from 'react';

// =========================================
// 1. MOBILE & TABLET PORTRAIT UI
// =========================================
const MobileLogin = ({ onLogin, onInfoClick }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear error message when user starts typing again
    if (authError) setAuthError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Hardcoded Admin Authentication Check
    if (credentials.username === 'admin@outloudlanguage.com' && credentials.password === 'OlaAdmin_2026!') {
      if (onLogin) onLogin();
    } else {
      setAuthError('Credenciales inválidas. Por favor, intente de nuevo.');
      setTimeout(() => setAuthError(''), 3000);
    }
  };

  return (
    <div className="relative min-h-screen w-full font-montserrat flex flex-col overflow-hidden bg-[#eef5fc]">
      {/* Mobile Background Image with Blur & Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[3px]"
          style={{ backgroundImage: "url('https://i.postimg.cc/QtmtPdr7/Diseno-sin-titulo-(16).png')" }}
        ></div>
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#08203e]/80 via-transparent to-white/40"></div>
      </div>

      {/* Mobile Content */}
      <div className="relative z-10 flex flex-col h-full min-h-screen p-6">
        
        {/* Header Logo */}
        <div className="flex items-center space-x-2 mb-6 mt-4">
          <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Outloud Logo" className="h-8 object-contain drop-shadow-md" />
          <div className="h-6 w-[2px] bg-outloud-blue opacity-40"></div>
          <span className="text-xs font-light text-outloud-blue whitespace-nowrap drop-shadow-sm">Online Platform</span>
        </div>

        {/* Yellow Login Card */}
        <div className="w-full max-w-sm mx-auto bg-student-yellow rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.2)] p-6 relative overflow-hidden flex flex-col">
          
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none z-0">
            <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Watermark" className="w-64 h-64 object-contain" />
          </div>

          <div className="relative z-10">
            <h2 className="text-[22px] font-bold text-outloud-blue text-center leading-tight mb-1">
              Student Portal Login
            </h2>
            <p className="text-[13px] text-outloud-blue/80 text-center mb-6">
              Enter your credentials to continue
            </p>

            {/* Authentication Error Alert */}
            {authError && (
              <div className="w-full text-center bg-red-100 border border-red-200 text-red-700 text-[11px] font-bold p-2 rounded-lg font-montserrat shadow-sm mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div>
                <label className="block text-[11px] font-black text-outloud-blue mb-1.5">Username or Email</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Student_Example"
                  className="w-full h-10 rounded-lg px-3 text-[13px] text-outloud-blue outline-none border border-transparent focus:border-outloud-blue transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-outloud-blue mb-1.5">Password</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 rounded-lg pl-3 pr-10 text-[13px] text-outloud-blue outline-none border border-transparent focus:border-outloud-blue transition-colors shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-outloud-blue/60 hover:text-outloud-blue transition-colors"
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
                className="w-full bg-outloud-blue text-white font-bold text-sm h-11 rounded-full mt-2 shadow-md hover:bg-blue-900 transition-colors active:scale-95"
              >
                Login
              </button>
            </form>

            <div className="flex flex-col items-center mt-5 space-y-1">
              <button onClick={onInfoClick} className="text-[11px] font-black text-outloud-blue uppercase tracking-wide hover:underline">
                OBTENER INFORMACIÓN
              </button>
              <p className="text-[11px] text-outloud-blue">
                Take a placement test <button className="font-bold hover:underline">here.</button>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Typography */}
        <div className="mt-auto pt-10 pb-6 flex justify-center w-full">
          <h1 className="text-white text-[32px] font-light leading-[1.1] text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            YOUR JOURNEY<br/>
            TO SUCCESS<br/>
            STARTS TODAY
          </h1>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 2. DESKTOP & PC UI
// =========================================
const DesktopLogin = ({ onLogin, onInfoClick }) => {
  // State for Credentials, Errors & Password Visibility
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const authTimerRef = useRef(null);

  // State and Timer Ref for the temporary under development message (kept for the "here" link)
  const [devMessage, setDevMessage] = useState('');
  const devTimerRef = useRef(null);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (authError) setAuthError('');
  };

  // Auth Submit Logic
  const handleLoginSubmit = (e) => {
    e.preventDefault(); // Prevents page reload
    
    if (credentials.username === 'admin@outloudlanguage.com' && credentials.password === 'OlaAdmin_2026!') {
      if (onLogin) onLogin();
    } else {
      setAuthError('Credenciales inválidas. Por favor, intente de nuevo.');
      if (authTimerRef.current) clearTimeout(authTimerRef.current);
      authTimerRef.current = setTimeout(() => {
        setAuthError('');
      }, 3000);
    }
  };

  // Effect to clear the dev message if the user clicks anywhere else
  useEffect(() => {
    if (!devMessage) return;

    const handleGlobalClick = () => {
      setDevMessage('');
      if (devTimerRef.current) clearTimeout(devTimerRef.current);
    };

    const delayTimer = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
    }, 50);

    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [devMessage]);

  // Clean up auth error timer on unmount
  useEffect(() => {
    return () => {
      if (authTimerRef.current) clearTimeout(authTimerRef.current);
    }
  }, []);

  // Handler for links currently under development
  const handleDevClick = (e) => {
    e.preventDefault();
    setDevMessage('Esta función se encuentra en desarrollo y estará lista en los próximos días');
    
    if (devTimerRef.current) clearTimeout(devTimerRef.current);
    
    devTimerRef.current = setTimeout(() => {
      setDevMessage('');
    }, 3000);
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-student-yellow">
      
      {/* Custom Hard Blink Animation */}
      <style>{`
        @keyframes hardBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        .animate-hard-blink {
          animation: hardBlink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* LEFT PANE: 45% Width, Solid Yellow Background */}
      <div className="relative flex w-[45%] flex-col items-center justify-center px-6 md:px-10">
        
        {/* Wrapper to keep Header and Login Box the exact same width and vertically centered */}
        <div className="w-full max-w-[24rem] flex flex-col -mt-4">
          
          {/* Top Header */}
          <div className="flex items-center justify-start w-full mb-3 shrink-0">
            <img 
              src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" 
              alt="Outloud Logo" 
              className="h-10 md:h-12 object-contain"
            />
            <div className="mx-3 h-8 w-[1px] bg-outloud-blue opacity-50 shrink-0"></div>
            <span className="text-base md:text-lg font-light text-outloud-blue font-montserrat whitespace-nowrap">
              Online Platform
            </span>
          </div>
          
          {/* White Login Box */}
          <div className="relative w-full rounded-[1.5rem] bg-white/85 px-6 py-6 md:px-8 md:py-8 shadow-[12px_12px_20px_rgba(0,0,0,0.15)] flex flex-col backdrop-blur-sm shrink-0">
            
            {/* Monogram Watermark INSIDE the white box */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.12] overflow-hidden rounded-[1.5rem]">
              <img 
                src="https://i.postimg.cc/Kj5HBG23/Agregar-algo-de-texto-(10).png" 
                alt="Monogram Watermark" 
                className="w-[75%] object-contain" 
              />
            </div>
            
            {/* Box Content */}
            <div className="relative z-10 flex flex-col">
              <h2 className="mb-1 text-xl md:text-[1.5rem] font-extrabold text-outloud-blue font-tabarra text-center leading-tight whitespace-nowrap">
                Student Portal Login
              </h2>
              <p className="mb-5 text-xs text-gray-500 font-montserrat text-center">
                Enter your credentials to continue
              </p>
              
              {/* Dynamic Alert Box (Shared for both Dev Message and Auth Errors) */}
              {(devMessage || authError) && (
                <div className="w-full text-center bg-red-100 border border-red-200 text-red-700 text-[10px] md:text-[11px] font-bold p-2 rounded-lg font-montserrat shadow-sm mb-4">
                  {devMessage || authError}
                </div>
              )}
              
              {/* Wrapped in a form so "Enter" key works */}
              <form onSubmit={handleLoginSubmit} className="flex w-full flex-col space-y-3 font-montserrat">
                
                <div className="w-full text-left">
                  <label className="mb-1 block text-xs md:text-sm font-bold text-outloud-blue">Username or Email</label>
                  <input 
                    type="text" 
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Student_Example" 
                    className="w-full rounded-lg border-none bg-white p-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-outloud-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                  />
                </div>
                
                <div className="w-full text-left">
                  <label className="mb-1 block text-xs md:text-sm font-bold text-outloud-blue">Password</label>
                  <div className="relative w-full">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="••••••••" 
                      className="w-full rounded-lg border-none bg-white p-2.5 pr-10 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-outloud-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-outloud-blue/60 hover:text-outloud-blue transition-colors"
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
                
                {/* Changed to type="submit" and pointing to auth function */}
                <button 
                  type="submit"
                  className="mt-3 mx-auto w-[85%] rounded-full bg-outloud-blue p-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-900"
                >
                  Login
                </button>

                {/* Sub-links with Information Button */}
                <div className="mt-3 text-center text-[10px] md:text-[11px] text-outloud-blue flex flex-col items-center">
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault(); 
                      if (onInfoClick) onInfoClick(); 
                    }} 
                    className="font-extrabold uppercase tracking-wide hover:underline cursor-pointer animate-hard-blink"
                  >
                    Obtener información
                  </a>
                  <p className="mt-1">
                    Take a placement test <a href="#" onClick={handleDevClick} className="font-bold underline">here</a>.
                  </p>
                </div>
                
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT PANE: 55% Width, Image Background */}
      <div className="relative flex w-[55%] bg-gray-200">
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://i.postimg.cc/P5V486CM/Sin-titulo-(Post-para-Instagram-(45))-(2).png"
            alt="Student Background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Vertical Blue Transparency Block */}
        <div className="absolute left-0 top-0 bottom-0 w-[55%] bg-outloud-blue/90 flex flex-col items-center justify-center text-center px-4 md:px-8 shadow-[10px_0_20px_rgba(0,0,0,0.2)]">
          
          <div className="mb-6 flex flex-col items-center">
            <img 
              src="https://i.postimg.cc/gjMxxhnD/Agregar-algo-de-texto-(7).png" 
              alt="Outloud Logo" 
              className="w-48 md:w-56 object-contain drop-shadow-md"
            />
          </div>
          
          <h1 className="text-[1.5rem] md:text-[2rem] lg:text-[2.25rem] font-light tracking-widest leading-[1.35] text-white font-uni-sans whitespace-nowrap">
            YOUR JOURNEY<br/>
            TO SUCCESS<br/>
            STARTS TODAY
          </h1>
        </div>
      </div>

    </div>
  );
};

// =========================================
// 3. THE INDEPENDENT ROUTER
// =========================================
const LoginPage = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Determines if the device screen is mobile/tablet portrait width
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Serves completely isolated components based on device type
  return isMobile ? <MobileLogin {...props} /> : <DesktopLogin {...props} />;
};

export default LoginPage;