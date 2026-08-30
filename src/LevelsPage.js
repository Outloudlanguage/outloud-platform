import React, { useState, useEffect, useRef } from 'react';

// =========================================
// 1. SHARED DATA
// =========================================
const levelsData = [
  {
    id: 'A1',
    title: 'BÁSICO 1',
    score: '0.0 - 2.0',
    duration: '3 MESES',
    height: '20%',
    color: 'bg-[#5b9bd5]',
    textColor: 'text-white',
    desc: 'Tus primeros pasos. Aprenderás a presentarte, dar información básica y manejar interacciones cotidianas. Este nivel es tu ventana inicial al idioma; aquí construirás la base sólida sobre la cual dominarás el inglés en su totalidad.',
  },
  {
    id: 'A2',
    title: 'BÁSICO 2',
    score: '2.5 - 4.0',
    duration: '3 MESES',
    height: '40%',
    color: 'bg-[#2f5597]',
    textColor: 'text-white',
    desc: 'Supervivencia asegurada. Podrás comunicarte en situaciones de viaje, ir de compras y conversar sobre tu rutina. Ampliarás tus horizontes progresivamente, adquiriendo las herramientas prácticas necesarias para abarcar todos los aspectos del idioma.',
  },
  {
    id: 'B1',
    title: 'INTER. 1',
    score: '4.5 - 5.0',
    duration: '3 MESES',
    height: '60%',
    color: 'bg-[#ffd966]',
    textColor: 'text-[#08203e]',
    desc: 'Independencia comunicativa. Expresarás opiniones, describirás experiencias y resolverás imprevistos cotidianos. Le dirás adiós a traducir en tu cabeza, incorporando el inglés de forma integral para desenvolverte en el mundo real.',
  },
  {
    id: 'B2',
    title: 'INTER. 2',
    score: '5.5 - 6.5',
    duration: '3 MESES',
    height: '80%',
    color: 'bg-[#ffc000]',
    textColor: 'text-[#08203e]',
    desc: 'Fluidez activa. Podrás interactuar con nativos de forma natural, argumentar tus ideas y desenvolverte con total seguridad. Explorarás el idioma a profundidad, preparándote para utilizarlo sin límites en entornos profesionales y personales.',
  },
  {
    id: 'C1',
    title: 'AVANZ. 1',
    score: '7.0 - 8.0',
    duration: '5 MESES',
    height: '90%',
    color: 'bg-[#d9534f]',
    textColor: 'text-white',
    desc: 'Dominio avanzado. Te expresarás de manera espontánea, comprenderás textos complejos y hablarás con absoluta precisión. Tu inmersión será casi total, otorgándote el poder de dominar el inglés incluso en los contextos más exigentes.',
  },
  {
    id: 'C2',
    title: 'AVANZ. 2',
    score: '8.5 - 9.0',
    duration: '5 MESES',
    height: '100%',
    color: 'bg-[#a30000]',
    textColor: 'text-white',
    desc: 'Maestría definitiva. Hablarás y comprenderás el idioma captando todos los matices, expresiones idiomáticas y sutilezas. Alcanzarás la meta de aprender el inglés por completo, comunicándote con la misma destreza y naturalidad que un hablante nativo.',
  },
];

// =========================================
// 2. MOBILE & TABLET PORTRAIT UI (UNTOUCHED)
// =========================================
const MobileLevelsPage = ({ onReturnHome }) => {
  const [blinkId, setBlinkId] = useState(null);
  const descRefs = useRef({});

  const handleBarClick = (id) => {
    if (descRefs.current[id]) {
      descRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    setBlinkId(null);
    setTimeout(() => {
      setBlinkId(id);
    }, 10);

    setTimeout(() => {
      setBlinkId((prev) => (prev === id ? null : prev));
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full font-sans bg-[#070b19] text-white overflow-y-auto overflow-x-hidden flex flex-col items-center pb-12">
      <style>{`
        @keyframes chartGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .animate-chart-grow {
          transform-origin: bottom;
          animation: chartGrow 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
        }
        @keyframes flashYellowOverlay {
          0% { opacity: 0; }
          20% { opacity: 0.4; }
          40% { opacity: 0; }
          60% { opacity: 0.4; }
          80% { opacity: 0.15; }
          100% { opacity: 0; } 
        }
        .animate-flash-overlay {
          animation: flashYellowOverlay 1.2s ease-in-out forwards;
        }
      `}</style>

      {/* Neon Wavy Background Simulation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/30 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[90px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      {/* Mobile Compact Header */}
      <div className="relative z-10 flex flex-row justify-between items-center w-full px-5 py-6 shrink-0 mb-2">
        <div className="flex items-center space-x-3">
          <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-8 object-contain opacity-90 drop-shadow-md" />
          <div className="h-6 w-[1px] bg-white/30"></div>
          <span className="text-xs font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide">Online Platform</span>
        </div>
        <button onClick={onReturnHome} className="flex items-center space-x-1.5 text-white/90 font-bold font-montserrat hover:text-[#fcd34d] transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          <span className="text-[10px] whitespace-nowrap tracking-wide uppercase">Return Home</span>
        </button>
      </div>

      {/* Mobile Title */}
      <div className="relative z-10 w-full px-5 text-center mb-6 mt-2">
        <h2 className="text-3xl font-black text-white drop-shadow-md font-tabarra leading-none mb-2">
          MÓDULOS DEL CURSO
        </h2>
        <p className="text-[10px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase">
          SEGÚN EL CEFR Y EL IELTS
        </p>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative z-10 w-[90%] max-w-md bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] p-5 border border-white/20 mb-8 flex flex-col">
        <p className="text-[11px] font-medium text-white/80 font-montserrat text-center mb-4 leading-snug">
          En este gráfico puede ver cada nivel, su duración en meses y el porcentaje de dominio del idioma que alcanzará al completarlo.
        </p>
        
        <p className="text-[10px] font-black text-[#08203e] font-montserrat text-center mb-6 px-5 py-2 bg-[#fcd34d] rounded-full shadow-[0_0_15px_rgba(252,211,77,0.3)] self-center uppercase tracking-widest">
          <span className="animate-pulse">👆 Toque la barra para leer</span>
        </p>

        {/* Mobile Bar Chart */}
        <div className="relative w-full h-[16rem] flex flex-col pl-[60px] pr-2 pb-8 pt-2 mt-2">
          
          <div className="absolute left-0 top-2 bottom-8 w-[24px] flex items-center justify-center pointer-events-none z-20">
            <span className="-rotate-90 text-[8px] font-black text-white/50 tracking-widest whitespace-nowrap">
              DOMINIO DEL IDIOMA
            </span>
          </div>

          <div className="absolute left-0 bottom-2 h-6 w-[60px] flex items-center justify-center pointer-events-none z-20">
            <span className="text-[8px] font-black text-white/50 tracking-widest whitespace-nowrap">
              DURACIÓN
            </span>
          </div>

          {/* Inner Chart Area */}
          <div className="relative w-full flex-grow border-b-[2px] border-white/20 flex items-end gap-1 z-10">
            {/* Percentages */}
            <div className="absolute inset-0 pointer-events-none">
              {[100, 80, 60, 40, 20].map((val) => (
                <div key={val} className="absolute w-full border-t border-white/10" style={{ bottom: `${val}%` }}>
                  <span className="absolute right-[100%] pr-2 top-0 -translate-y-1/2 text-[8px] font-bold text-white/50">
                    {val}%
                  </span>
                </div>
              ))}
            </div>

            {/* Bars */}
            {levelsData.map((bar, idx) => (
              <div key={bar.id} className="relative flex-1 flex flex-col justify-end h-full group z-10">
                <div
                  onClick={() => handleBarClick(bar.id)}
                  className={`relative w-full rounded-t-[4px] flex flex-col items-center justify-start pt-1.5 text-center shadow-lg transition-transform active:scale-95 animate-chart-grow overflow-hidden ${bar.color}`}
                  style={{ height: bar.height, animationDelay: `${idx * 0.1}s` }}
                >
                  <span className={`relative z-10 text-[9px] font-black leading-none ${bar.textColor}`}>{bar.id}</span>
                  <span className={`relative z-10 text-[4px] font-bold leading-none mt-1 px-0.5 ${bar.textColor}`}>{bar.title}</span>
                  <span className={`relative z-10 text-[4px] font-medium leading-none mt-0.5 px-0.5 ${bar.textColor}`}>{bar.score}</span>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 flex items-center text-[7px] font-black text-white/80 whitespace-nowrap">
                  {bar.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked Descriptions Area */}
      <div className="relative z-10 w-[90%] max-w-md flex flex-col space-y-4">
        {levelsData.map((lvl) => (
          <div
            key={lvl.id}
            ref={(el) => (descRefs.current[lvl.id] = el)}
            className="relative bg-white/10 backdrop-blur-md rounded-[1.5rem] p-4 shadow-lg flex items-start gap-4 overflow-hidden border border-white/20"
          >
            {/* Blinking Animation Overlay for scroll target */}
            <div
              className={`absolute inset-0 bg-[#fcd34d] pointer-events-none transition-opacity duration-300 ${
                blinkId === lvl.id ? 'animate-flash-overlay' : 'opacity-0'
              }`}
            ></div>

            <div className={`relative z-10 shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-white/20 ${lvl.color} ${lvl.textColor}`}>
              {lvl.id}
            </div>
            <div className="relative z-10 flex flex-col justify-center pt-0.5 pr-2">
              <h4 className="text-[12px] font-black text-white drop-shadow-md font-montserrat uppercase leading-tight mb-1">
                {lvl.title}
              </h4>
              <p className="text-[11px] text-white/80 font-montserrat text-justify leading-relaxed">
                {lvl.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================
// 3. DESKTOP UI
// =========================================
const DesktopLevelsPage = ({ onReturnHome }) => {
  const [hoveredLevel, setHoveredLevel] = useState(null);

  return (
    <div className="relative h-screen w-full font-sans bg-[#070b19] text-white overflow-hidden flex flex-col p-4 md:p-6 lg:p-8">
      <style>{`
        @keyframes chartGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .animate-chart-grow {
          transform-origin: bottom;
          animation: chartGrow 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
        }

        /* Double Blink Animation for Hover Sync */
        @keyframes flashYellowOverlay {
          0% { opacity: 0; }
          20% { opacity: 0.3; }
          40% { opacity: 0; }
          60% { opacity: 0.3; }
          80% { opacity: 0.1; }
          100% { opacity: 0.1; }
        }
        .animate-flash-overlay {
          animation: flashYellowOverlay 1s ease-in-out forwards;
        }
      `}</style>

      {/* Neon Wavy Background Simulation */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex flex-row justify-between items-center w-full max-w-[90rem] mx-auto mb-4 lg:mb-6 shrink-0">
        <div className="flex items-center">
          <img
            src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png"
            alt="Outloud Logo"
            className="h-10 lg:h-12 object-contain opacity-90 drop-shadow-md shrink-0"
          />
          <div className="mx-4 h-8 w-[2px] bg-white/30 shrink-0"></div>
          <span className="text-base lg:text-xl font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide">
            Online Platform
          </span>
        </div>

        <button
          onClick={onReturnHome}
          className="flex items-center space-x-2 text-white font-bold font-montserrat hover:text-[#fcd34d] transition-colors z-50 shrink-0 ml-4"
        >
          <svg className="flex-none w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="flex-none text-xs md:text-sm lg:text-base whitespace-nowrap tracking-wider uppercase">Return Home</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="flex-none w-5 h-5 md:w-6 md:h-6">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </svg>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex-grow w-full max-w-[90rem] mx-auto flex items-center justify-center pb-2 min-h-0">
        <div className="w-full h-full bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] p-6 lg:p-10 border border-white/20 flex flex-row gap-8 lg:gap-12 overflow-hidden">
          
          {/* LEFT HALF: Texts & Descriptions */}
          <div className="w-1/2 flex flex-col justify-start h-full min-h-0 pt-2 lg:pt-4">
            <h2 className="text-3xl lg:text-4xl xl:text-[3rem] font-black text-white drop-shadow-md font-tabarra leading-none mb-2 shrink-0">
              MÓDULOS DEL CURSO
            </h2>
            <p className="text-[10px] lg:text-[12px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase mb-8 shrink-0">
              SEGÚN EL CEFR Y EL IELTS
            </p>

            <div className="flex flex-col gap-3 lg:gap-4 flex-grow justify-start min-h-0 overflow-y-auto pr-4 pb-2">
              {levelsData.map((lvl) => (
                <div
                  key={lvl.id}
                  className="relative flex gap-4 lg:gap-5 items-center group shrink-0 p-3 -ml-3 rounded-2xl cursor-default transition-all duration-300"
                  onMouseEnter={() => setHoveredLevel(lvl.id)}
                  onMouseLeave={() => setHoveredLevel(null)}
                >
                  {/* Hover Blink Overlay for Descriptor Box */}
                  <div
                    className={`absolute inset-0 bg-[#fcd34d] rounded-2xl pointer-events-none transition-opacity duration-300 ${
                      hoveredLevel === lvl.id
                        ? 'animate-flash-overlay'
                        : 'opacity-0'
                    }`}
                  ></div>

                  <div
                    className={`relative z-10 shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center font-black text-base lg:text-lg border border-white/20 transition-transform duration-300 ${
                      lvl.color
                    } ${lvl.textColor} ${
                      hoveredLevel === lvl.id
                        ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'scale-100 shadow-sm'
                    }`}
                  >
                    {lvl.id}
                  </div>
                  <div className="relative z-10 flex flex-col justify-center">
                    <h4 className="text-[11px] lg:text-sm font-black text-white drop-shadow-md font-montserrat uppercase leading-tight">
                      {lvl.title}
                    </h4>
                    <p className="text-[10px] lg:text-[11px] xl:text-[13px] text-white/80 font-montserrat leading-relaxed mt-1 lg:mt-1.5 pr-2">
                      {lvl.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT HALF: CSS Bar Chart */}
          <div className="w-1/2 flex flex-col justify-center h-full min-h-0 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <img
                src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png"
                alt="Watermark"
                className="w-1/2 object-contain invert brightness-0"
              />
            </div>

            <div className="relative w-full h-full flex flex-col pl-[110px] md:pl-[130px] lg:pl-[160px] pb-10 lg:pb-14 pt-4 z-10">
              <p className="text-[11px] lg:text-[13px] xl:text-[15px] font-medium text-white/80 font-montserrat text-center mb-8 lg:mb-10 leading-snug shrink-0">
                En este gráfico puede ver cada nivel, su duración en meses y el
                porcentaje de dominio del idioma que alcanzará al completarlo.
              </p>

              {/* Main Graph Area */}
              <div className="relative w-full flex-grow border-b-[2px] border-white/20 flex items-end gap-2 lg:gap-3 z-10">
                
                <div className="absolute -left-[100px] md:-left-[120px] lg:-left-[145px] top-1/2 -rotate-90 -translate-y-1/2 text-[9px] md:text-[10px] lg:text-[11px] font-black text-white/50 tracking-widest whitespace-nowrap z-20">
                  DOMINIO DEL IDIOMA
                </div>

                <div className="absolute -left-[65px] md:-left-[75px] lg:-left-[90px] -bottom-[28px] lg:-bottom-[34px] h-6 flex items-center text-[9px] md:text-[10px] lg:text-[11px] font-black text-white/50 tracking-widest whitespace-nowrap">
                  DURACIÓN
                </div>

                {/* Percentages */}
                <div className="absolute inset-0 pointer-events-none">
                  {[100, 80, 60, 40, 20].map((val) => (
                    <div
                      key={val}
                      className="absolute w-full border-t-[1.5px] border-white/10"
                      style={{ bottom: `${val}%` }}
                    >
                      <span className="absolute right-[100%] pr-3 lg:pr-4 top-0 -translate-y-1/2 text-[10px] lg:text-[12px] font-bold text-white/50">
                        {val}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chart Bars */}
                {levelsData.map((bar, idx) => (
                  <div
                    key={bar.id}
                    className="relative flex-1 flex flex-col justify-end h-full group z-10 cursor-default"
                    onMouseEnter={() => setHoveredLevel(bar.id)}
                    onMouseLeave={() => setHoveredLevel(null)}
                  >
                    <div
                      className={`relative w-full rounded-t-md flex flex-col items-center justify-start pt-1 text-center shadow-lg transition-all duration-300 animate-chart-grow overflow-hidden ${
                        bar.color
                      } ${
                        hoveredLevel === bar.id
                          ? 'shadow-[0_0_20px_rgba(255,255,255,0.3)] opacity-100'
                          : 'opacity-90'
                      }`}
                      style={{
                        height: bar.height,
                        animationDelay: `${idx * 0.1}s`,
                      }}
                    >
                      <div
                        className={`absolute inset-0 bg-white/20 pointer-events-none transition-opacity duration-300 ${
                          hoveredLevel === bar.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      ></div>

                      {/* Adjusted font sizes and tighter margins so it fits securely inside the A1 bar */}
                      <span className={`relative z-10 text-[9px] lg:text-[11px] xl:text-[13px] font-black leading-none ${bar.textColor}`}>
                        {bar.id}
                      </span>
                      <span className={`relative z-10 text-[5px] lg:text-[6px] xl:text-[7px] font-bold leading-none mt-0.5 px-0.5 ${bar.textColor}`}>
                        {bar.title}
                      </span>
                      <span className={`relative z-10 text-[4.5px] lg:text-[5px] xl:text-[6px] font-medium leading-none mt-0.5 px-0.5 ${bar.textColor}`}>
                        {bar.score}
                      </span>
                    </div>

                    {/* Duration labels beneath the bar */}
                    <div
                      className={`absolute -bottom-[28px] lg:-bottom-[34px] left-1/2 -translate-x-1/2 h-6 flex items-center text-[9px] lg:text-[11px] font-black whitespace-nowrap transition-colors duration-300 ${
                        hoveredLevel === bar.id
                          ? 'text-[#fcd34d]'
                          : 'text-white/80'
                      }`}
                    >
                      {bar.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// 4. THE ROUTER
// =========================================
const LevelsPage = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileLevelsPage {...props} /> : <DesktopLevelsPage {...props} />;
};

export default LevelsPage;