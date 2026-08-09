import React, { useState, useEffect, useRef } from 'react';

// =========================================
// 1. MOBILE & TABLET PORTRAIT UI
// =========================================
const MobileLogin = ({ onLogin, onInfoClick }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin();
  };

  return (
    <div className="relative min-h-screen w-full font-montserrat flex flex-col overflow-hidden bg-[#eef5fc]">
      {/* Mobile Background Image with Blur & Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[3px]"
          style={{ backgroundImage: "url('https://i.postimg.cc/PqcTcM02/Sin-titulo-(Post-para-Instagram-(45)).png')" }}
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
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg px-3 text-[13px] text-outloud-blue outline-none border border-transparent focus:border-outloud-blue transition-colors shadow-inner"
                />
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
// 2. DESKTOP & PC UI (Recovered Code)
// =========================================
const DesktopLogin = ({ onLogin, onInfoClick }) => {
  // State and Timer Ref for the temporary under development message
  const [devMessage, setDevMessage] = useState('');
  const devTimerRef = useRef(null);

  // Effect to clear the dev message if the user clicks anywhere else
  useEffect(() => {
    if (!devMessage) return;

    const handleGlobalClick = () => {
      setDevMessage('');
      if (devTimerRef.current) clearTimeout(devTimerRef.current);
    };

    // Small delay ensures the button click itself doesn't immediately close the message
    const delayTimer = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
    }, 50);

    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [devMessage]);

  // Handler for buttons currently under development
  const handleDevClick = (e) => {
    e.preventDefault();
    setDevMessage('Esta función se encuentra en desarrollo y estará lista en los próximos días');
    
    // Clear any existing timer so they don't overlap
    if (devTimerRef.current) clearTimeout(devTimerRef.current);
    
    // Clear the message automatically after 3 seconds
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
              
              {/* Dynamic Under Development Alert */}
              {devMessage && (
                <div className="w-full text-center bg-red-100 border border-red-200 text-red-700 text-[10px] md:text-[11px] font-bold p-2 rounded-lg font-montserrat shadow-sm mb-4">
                  {devMessage}
                </div>
              )}
              
              <div className="flex w-full flex-col space-y-3 font-montserrat">
                
                <div className="w-full text-left">
                  <label className="mb-1 block text-xs md:text-sm font-bold text-outloud-blue">Username or Email</label>
                  <input 
                    type="text" 
                    placeholder="Student_Example" 
                    className="w-full rounded-lg border-none bg-white p-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-outloud-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                  />
                </div>
                
                <div className="w-full text-left">
                  <label className="mb-1 block text-xs md:text-sm font-bold text-outloud-blue">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full rounded-lg border-none bg-white p-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-outloud-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                  />
                </div>
                
                {/* Centered Pill Button (Wired to Dev Alert) */}
                <button 
                  onClick={handleDevClick}
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
                
              </div>
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