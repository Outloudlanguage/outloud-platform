import React, { useState } from 'react';

const LoginPage = ({ onLogin, onInfoClick }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the credentials up or handle login logic here
    if (onLogin) onLogin();
  };

  return (
    <div className="relative min-h-screen w-full font-montserrat overflow-hidden bg-[#eef5fc]">
      
      {/* =========================================
          MOBILE & TABLET PORTRAIT UI (md:hidden)
          ========================================= */}
      <div className="block md:hidden relative min-h-screen w-full flex flex-col">
        
        {/* Mobile Background Image with Blur & Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[3px]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop')" }}
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
            
            {/* Watermark Logo inside card */}
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
                  <label className="block text-[11px] font-black text-outloud-blue mb-1.5">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Student_Example"
                    className="w-full h-10 rounded-lg px-3 text-[13px] text-outloud-blue outline-none border border-transparent focus:border-outloud-blue transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-outloud-blue mb-1.5">
                    Password
                  </label>
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

      {/* =========================================
          DESKTOP & PC UI (hidden md:flex)
          ========================================= */}
      <div className="hidden md:flex w-full min-h-screen">
        
        {/* Left Side: Login Panel */}
        <div className="w-1/2 lg:w-[40%] xl:w-[35%] bg-student-yellow min-h-screen flex flex-col justify-center items-center p-12 relative overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.1)] z-20">
          
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
            <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Watermark" className="w-[150%] h-[150%] object-contain" />
          </div>

          <div className="w-full max-w-sm relative z-10 flex flex-col">
            <div className="flex items-center space-x-3 mb-12">
              <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Outloud Logo" className="h-10 object-contain" />
              <div className="h-8 w-[2px] bg-outloud-blue opacity-40"></div>
              <span className="text-sm font-light text-outloud-blue whitespace-nowrap">Online Platform</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-outloud-blue leading-tight mb-2">
              Student Portal Login
            </h2>
            <p className="text-sm text-outloud-blue/80 mb-8">
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              <div>
                <label className="block text-xs font-black text-outloud-blue mb-2 uppercase tracking-wide">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Student_Example"
                  className="w-full h-12 rounded-xl px-4 text-sm text-outloud-blue outline-none border-2 border-transparent focus:border-outloud-blue transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-outloud-blue mb-2 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-xl px-4 text-sm text-outloud-blue outline-none border-2 border-transparent focus:border-outloud-blue transition-colors shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-outloud-blue text-white font-black text-base h-14 rounded-full mt-4 shadow-xl hover:bg-blue-900 transition-transform hover:scale-[1.02] active:scale-95"
              >
                Login
              </button>
            </form>

            <div className="flex flex-col items-center mt-8 space-y-2">
              <button onClick={onInfoClick} className="text-xs font-black text-outloud-blue uppercase tracking-widest hover:text-blue-900 transition-colors">
                OBTENER INFORMACIÓN
              </button>
              <p className="text-xs text-outloud-blue">
                Take a placement test <button className="font-bold hover:underline">here.</button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Image Banner */}
        <div className="w-1/2 lg:w-[60%] xl:w-[65%] relative z-10 flex items-center justify-center p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#08203e]/90 via-[#08203e]/40 to-transparent"></div>
          
          <h1 className="relative z-20 text-white text-5xl lg:text-7xl font-light leading-[1.1] text-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mt-auto mb-12">
            YOUR JOURNEY<br/>
            TO SUCCESS<br/>
            STARTS TODAY
          </h1>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;