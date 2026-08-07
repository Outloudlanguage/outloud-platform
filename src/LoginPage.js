import React from 'react';

const LoginPage = ({ onLogin, onInfoClick }) => {
  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-student-yellow">
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

              <div className="flex w-full flex-col space-y-3 font-montserrat">
                <div className="w-full text-left">
                  <label className="mb-1 block text-xs md:text-sm font-bold text-outloud-blue">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    placeholder="Student_Example"
                    className="w-full rounded-lg border-none bg-white p-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-outloud-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                  />
                </div>

                <div className="w-full text-left">
                  <label className="mb-1 block text-xs md:text-sm font-bold text-outloud-blue">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border-none bg-white p-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-outloud-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                  />
                </div>

                {/* Centered Pill Button */}
                <button
                  onClick={onLogin}
                  className="mt-3 mx-auto w-[85%] rounded-full bg-outloud-blue p-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-900"
                >
                  Login
                </button>

                {/* NEW Sub-links with Information Button */}
                <div className="mt-3 text-center text-[10px] md:text-[11px] text-outloud-blue flex flex-col items-center">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onInfoClick) onInfoClick();
                    }}
                    className="font-extrabold uppercase tracking-wide hover:underline cursor-pointer animate-pulse"
                  >
                    Obtener información
                  </a>
                  <p className="mt-1">
                    Take a placement test{' '}
                    <a href="#" className="font-bold underline">
                      here
                    </a>
                    .
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
            YOUR JOURNEY
            <br />
            TO SUCCESS
            <br />
            STARTS TODAY
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
