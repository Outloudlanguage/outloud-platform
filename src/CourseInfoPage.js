import React, { useState, useEffect } from 'react';

// =========================================
// 1. MOBILE & TABLET PORTRAIT UI
// =========================================
const MobileCourseInfo = ({
  onReturnHome,
  onRegister,
  onCycleClick,
  onLevelsClick,
}) => {
  return (
    <div className="relative min-h-screen w-full font-sans bg-[#070b19] text-white flex flex-col overflow-y-auto overflow-x-hidden">
      
      {/* Neon Wavy Background Simulation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/30 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[90px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <div className="relative z-10 flex flex-col w-full px-5 py-6">
        
        {/* Top Header */}
        <div className="flex flex-row justify-between items-center w-full mb-8">
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png"
              alt="Outloud Logo" 
              className="h-8 object-contain opacity-90 drop-shadow-md" 
            />
            <div className="h-6 w-[1px] bg-white/30"></div>
            <span className="text-xs font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide">
              Online Platform
            </span>
          </div>

          <button 
            onClick={onReturnHome} 
            className="flex items-center space-x-1.5 text-white/90 font-bold font-montserrat hover:text-[#fcd34d] transition-colors"
          >
            <span className="text-[11px] whitespace-nowrap tracking-wide uppercase">Return Home</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-center text-[22px] font-black text-white drop-shadow-md font-montserrat tracking-widest uppercase leading-tight mb-8">
          INFORMACIÓN ACERCA<br/>DE LOS CURSOS
        </h1>

        <div className="flex flex-col space-y-6">
          
          {/* CARD 1: INMERSIÓN TOTAL */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] w-full items-stretch relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              {/* Left Col */}
              <div className="w-[42%] flex flex-col items-center justify-center text-center pr-3 shrink-0 border-r border-white/10 relative z-10">
                <div className="h-16 w-16 mx-auto flex items-center justify-center mb-2 shrink-0">
                  <img
                    src="https://i.postimg.cc/LssD8BWw/Agregar-algo-de-texto-(14).png"
                    alt="Inmersión Total Icon"
                    className="w-full h-full object-contain brightness-0 invert opacity-90 drop-shadow-md"
                  />
                </div>
                <p className="text-[8px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase leading-tight mb-1">
                  ¿CÓMO FUNCIONA EL CURSO?
                </p>
                <h3 className="text-[14px] font-black text-white font-tabarra leading-none uppercase drop-shadow-sm">
                  INMERSIÓN TOTAL
                </h3>
              </div>
              
              {/* Right Col */}
              <div className="w-[58%] flex flex-col justify-center pl-4 relative z-10">
                <p className="text-[10px] text-white/90 font-montserrat text-justify leading-[1.5]">
                  Olvídate de la teoría rígida. Hemos diseñado un aprendizaje
                  libre de distracciones, interactivo y directo, basado en{' '}
                  <strong className="font-extrabold text-[#fcd34d]">
                    situaciones de la vida real
                  </strong>{' '}
                  que te servirá de guía para adquirir un nuevo idioma de forma
                  natural y fluida,{' '}
                  <strong className="font-extrabold text-[#fcd34d]">sin traducir</strong> y sin
                  pasar horas estudiando listas de vocabulario o gramática.
                </p>
                <p className="text-[8px] font-black text-white/60 font-montserrat mt-3 tracking-widest uppercase">
                  ¿CÓMO FUNCIONA? SIGUE LEYENDO.
                </p>
              </div>
            </div>

            {/* BUTTON 1 */}
            <button
              onClick={onCycleClick}
              className="mx-auto w-[85%] rounded-full border-[2px] border-dashed border-[#fcd34d] py-3 text-[11px] font-black text-[#fcd34d] transition-all duration-200 active:bg-[#fcd34d] active:text-[#08203e] active:border-solid uppercase tracking-widest shadow-[0_0_15px_rgba(252,211,77,0.15)]"
            >
              VER EL CICLO DE ESTUDIO
            </button>
          </div>

          {/* CARD 2: ACCESO 24/7 */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] w-full items-stretch relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              {/* Left Col */}
              <div className="w-[42%] flex flex-col items-center justify-center text-center pr-3 shrink-0 border-r border-white/10 relative z-10">
                <div className="h-16 w-16 mx-auto flex items-center justify-center mb-2 shrink-0">
                  <img
                    src="https://i.postimg.cc/mDJHRQff/6(2).png"
                    alt="Acceso 24/7 Icon"
                    className="w-full h-full object-contain brightness-0 invert opacity-90 drop-shadow-md"
                  />
                </div>
                <p className="text-[8px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase leading-tight mb-1">
                  ESTUDIA A TU RITMO
                </p>
                <h3 className="text-[14px] font-black text-white font-tabarra leading-none uppercase drop-shadow-sm">
                  ACCESO 24/7
                </h3>
              </div>
              
              {/* Right Col */}
              <div className="w-[58%] flex flex-col justify-center pl-4 relative z-10">
                <p className="text-[10px] text-white/90 font-montserrat text-justify leading-[1.5]">
                  Accede cuando y donde quieras a lecciones dinámicas, audios,
                  chats, foros,{' '}
                  <strong className="font-extrabold text-[#fcd34d]">club de conversación</strong>
                  , clases complementarias, libros de actividades y demás
                  funciones de la app o el sitio web.
                  <br /><br />
                  En ellas encontrarás contenido dinámico e interactivo que te
                  preparará para tu clase en vivo.
                </p>
              </div>
            </div>

            {/* BUTTON 2 */}
            <button
              onClick={onLevelsClick}
              className="mx-auto w-[85%] rounded-full border-[2px] border-dashed border-[#fcd34d] py-3 text-[11px] font-black text-[#fcd34d] transition-all duration-200 active:bg-[#fcd34d] active:text-[#08203e] active:border-solid uppercase tracking-widest shadow-[0_0_15px_rgba(252,211,77,0.15)]"
            >
              NIVELES Y MÓDULOS
            </button>
          </div>

          {/* CARD 3: CLASES 100% EN VIVO */}
          <div className="flex flex-col space-y-3 pb-8">
            <div className="flex flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] w-full items-stretch relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              
              {/* Left Col */}
              <div className="w-[42%] flex flex-col items-center justify-center text-center pr-3 shrink-0 border-r border-white/10 relative z-10">
                <div className="h-16 w-16 mx-auto flex items-center justify-center mb-2 shrink-0">
                  <img
                    src="https://i.postimg.cc/LXn1rxWs/7(3).png"
                    alt="Clases En Vivo Icon"
                    className="w-full h-full object-contain brightness-0 invert opacity-90 drop-shadow-md"
                  />
                </div>
                <p className="text-[8px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase leading-tight mb-1">
                  INTERACCIÓN REAL
                </p>
                <h3 className="text-[14px] font-black text-white font-tabarra leading-none uppercase whitespace-pre-line drop-shadow-sm">
                  CLASES 100%{'\n'}EN VIVO
                </h3>
              </div>
              
              {/* Right Col */}
              <div className="w-[58%] flex flex-col justify-center pl-4 relative z-10">
                <p className="text-[10px] text-white/90 font-montserrat text-justify leading-[1.5]">
                  Agenda sesiones individuales o grupales con un{' '}
                  <strong className="font-extrabold text-[#fcd34d]">profesor en vivo</strong>{' '}
                  según tu disponibilidad. Recibe tutoría{' '}
                  <strong className="font-extrabold text-[#fcd34d]">personalizada</strong>,
                  feedback instantáneo y corrección en pronunciación, vocabulario
                  y más. <strong className="font-extrabold text-[#fcd34d]">Participa</strong> en
                  escenificaciones, debates, dinámicas y actividades que{' '}
                  <strong className="font-extrabold text-[#fcd34d]">te darán confianza</strong>{' '}
                  al hablar y permitirán evaluar tu propio progreso.
                </p>
              </div>
            </div>

            {/* BUTTON 3 */}
            <button
              onClick={onRegister}
              className="mx-auto w-[85%] rounded-full border-[2px] border-dashed border-[#fcd34d] py-3 text-[11px] font-black text-[#fcd34d] transition-all duration-200 active:bg-[#fcd34d] active:text-[#08203e] active:border-solid uppercase tracking-widest shadow-[0_0_15px_rgba(252,211,77,0.15)]"
            >
              INSCRIBIRSE
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// =========================================
// 2. DESKTOP & PC UI
// =========================================
const DesktopCourseInfo = ({
  onReturnHome,
  onRegister,
  onCycleClick,
  onLevelsClick,
}) => {
  return (
    <div className="relative h-screen w-full font-sans bg-[#070b19] text-white overflow-hidden flex flex-col">
      
      {/* Neon Wavy Background Simulation */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full px-6 py-4 md:px-10 md:py-6 max-w-[90rem] mx-auto w-full">
        
        {/* Top Header - FIXED OVERLAP & SIZING */}
        <div className="relative z-10 flex flex-row justify-between items-center w-full mb-6 lg:mb-10 shrink-0 gap-4">
          
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex-none flex items-center">
              <img 
                src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" 
                alt="Outloud Logo" 
                className="h-10 md:h-12 lg:h-14 object-contain opacity-90 drop-shadow-md" 
              />
            </div>
            
            <div className="flex-none h-8 md:h-10 w-[2px] bg-white/30 mx-4 md:mx-5"></div>
            
            <span className="flex-none hidden md:block text-xs lg:text-sm font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide mr-2">
              Online Platform
            </span>
            
            <h1 className="flex-1 text-[14px] sm:text-[15px] md:text-base lg:text-xl xl:text-2xl font-black text-white drop-shadow-md font-montserrat tracking-widest uppercase leading-tight truncate">
              INFORMACIÓN ACERCA DE LOS CURSOS
            </h1>
          </div>

          <button 
            onClick={onReturnHome} 
            className="flex-none flex items-center space-x-2 md:space-x-3 text-white font-bold font-montserrat hover:text-[#fcd34d] transition-colors ml-4 shrink-0"
          >
            <span className="text-xs md:text-sm lg:text-base whitespace-nowrap tracking-wider uppercase">Return Home</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </button>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 flex-grow min-h-0 pb-6">
          
          {/* COLUMN 1 */}
          <div className="flex flex-col h-full min-h-0">
            {/* Reduced top padding from pt-8 to pt-5 to pull content up */}
            <div className="group flex flex-col flex-grow bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-[2.5rem] px-5 lg:px-7 pt-5 lg:pt-6 pb-5 lg:pb-6 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(252,211,77,0.15)] items-center text-center cursor-default overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              
              {/* Optically Balanced Icon Container */}
              <div className="h-20 w-20 xl:h-24 xl:w-24 mx-auto flex items-center justify-center mb-2 lg:mb-3 shrink-0 relative z-10">
                <img
                  src="https://i.postimg.cc/LssD8BWw/Agregar-algo-de-texto-(14).png"
                  alt="Inmersión Total Icon"
                  className="w-full h-full object-contain brightness-0 invert opacity-90 drop-shadow-lg"
                />
              </div>
              
              {/* Perfectly Balanced Titles Container */}
              <div className="flex flex-col items-center shrink-0 w-full mb-3 relative z-10">
                <div className="h-[14px] lg:h-[18px] flex items-end justify-center w-full mb-1">
                  <p className="text-[9px] lg:text-[10px] xl:text-[11px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase leading-none">
                    ¿CÓMO FUNCIONA EL CURSO?
                  </p>
                </div>
                <div className="h-[3.5rem] lg:h-[4rem] flex items-center justify-center w-full">
                  <h3 className="text-xl lg:text-2xl xl:text-3xl font-black text-white drop-shadow-md font-tabarra leading-none whitespace-pre-line">
                    INMERSIÓN TOTAL
                  </h3>
                </div>
              </div>
              
              {/* Flex-Grow Text Container with Scrollbar */}
              <div className="flex flex-col flex-grow w-full justify-start relative z-10 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[10.5px] lg:text-[11.5px] xl:text-[13px] text-white/90 font-montserrat text-justify leading-snug xl:leading-[1.5]">
                  Olvídate de la teoría rígida. Hemos diseñado un aprendizaje
                  libre de distracciones, interactivo y directo, basado en{' '}
                  <strong className="font-extrabold text-[#fcd34d]">
                    situaciones de la vida real
                  </strong>{' '}
                  que te servirá de guía para adquirir un nuevo idioma de forma
                  natural y fluida,{' '}
                  <strong className="font-extrabold text-[#fcd34d]">sin traducir</strong> y sin
                  pasar horas estudiando listas de vocabulario o gramática.
                </p>
              </div>
            </div>

            <button
              onClick={onCycleClick}
              className="mt-3 lg:mt-4 w-full rounded-full border-[2.5px] border-dashed border-[#fcd34d] px-4 py-3 lg:py-4 text-[11px] lg:text-xs xl:text-sm font-black text-[#fcd34d] transition-all duration-300 hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-solid shadow-[0_0_15px_rgba(252,211,77,0.15)] hover:shadow-[0_0_25px_rgba(252,211,77,0.4)] uppercase tracking-widest shrink-0"
            >
              VER EL CICLO DE ESTUDIO
            </button>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-[2.5rem] px-5 lg:px-7 pt-5 lg:pt-6 pb-5 lg:pb-6 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(252,211,77,0.15)] items-center text-center cursor-default overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

              {/* Optically Balanced Icon Container */}
              <div className="h-20 w-20 xl:h-24 xl:w-24 mx-auto flex items-center justify-center mb-2 lg:mb-3 shrink-0 relative z-10">
                <img
                  src="https://i.postimg.cc/mDJHRQff/6(2).png"
                  alt="Acceso 24/7 Icon"
                  className="w-full h-full object-contain brightness-0 invert opacity-90 drop-shadow-lg"
                />
              </div>
              
              {/* Perfectly Balanced Titles Container */}
              <div className="flex flex-col items-center shrink-0 w-full mb-3 relative z-10">
                <div className="h-[14px] lg:h-[18px] flex items-end justify-center w-full mb-1">
                  <p className="text-[9px] lg:text-[10px] xl:text-[11px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase leading-none">
                    ESTUDIA A TU RITMO
                  </p>
                </div>
                <div className="h-[3.5rem] lg:h-[4rem] flex items-center justify-center w-full">
                  <h3 className="text-xl lg:text-2xl xl:text-3xl font-black text-white drop-shadow-md font-tabarra leading-none whitespace-pre-line">
                    ACCESO 24/7
                  </h3>
                </div>
              </div>
              
              {/* Flex-Grow Text Container with Scrollbar */}
              <div className="flex flex-col flex-grow w-full justify-start relative z-10 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[10.5px] lg:text-[11.5px] xl:text-[13px] text-white/90 font-montserrat text-justify leading-snug xl:leading-[1.5]">
                  Accede cuando y donde quieras a lecciones dinámicas, audios,
                  chats, foros,{' '}
                  <strong className="font-extrabold text-[#fcd34d]">club de conversación</strong>
                  , clases complementarias, libros de actividades y demás
                  funciones de la app o el sitio web.
                  <br />
                  <br />
                  En ellas encontrarás contenido dinámico e interactivo que te
                  preparará para tu clase en vivo.
                </p>
              </div>
            </div>

            <button
              onClick={onLevelsClick}
              className="mt-3 lg:mt-4 w-full rounded-full border-[2.5px] border-dashed border-[#fcd34d] px-4 py-3 lg:py-4 text-[11px] lg:text-xs xl:text-sm font-black text-[#fcd34d] transition-all duration-300 hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-solid shadow-[0_0_15px_rgba(252,211,77,0.15)] hover:shadow-[0_0_25px_rgba(252,211,77,0.4)] uppercase tracking-widest shrink-0"
            >
              NIVELES Y MÓDULOS
            </button>
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-[2.5rem] px-5 lg:px-7 pt-5 lg:pt-6 pb-5 lg:pb-6 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(252,211,77,0.15)] items-center text-center cursor-default overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

              {/* Optically Balanced Icon Container */}
              <div className="h-20 w-20 xl:h-24 xl:w-24 mx-auto flex items-center justify-center mb-2 lg:mb-3 shrink-0 relative z-10">
                <img
                  src="https://i.postimg.cc/LXn1rxWs/7(3).png"
                  alt="Clases En Vivo Icon"
                  className="w-full h-full object-contain brightness-0 invert opacity-90 drop-shadow-lg"
                />
              </div>
              
              {/* Perfectly Balanced Titles Container */}
              <div className="flex flex-col items-center shrink-0 w-full mb-3 relative z-10">
                <div className="h-[14px] lg:h-[18px] flex items-end justify-center w-full mb-1">
                  <p className="text-[9px] lg:text-[10px] xl:text-[11px] font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase leading-none">
                    INTERACCIÓN REAL
                  </p>
                </div>
                <div className="h-[3.5rem] lg:h-[4rem] flex items-center justify-center w-full">
                  <h3 className="text-xl lg:text-2xl xl:text-3xl font-black text-white drop-shadow-md font-tabarra leading-none whitespace-pre-line">
                    CLASES 100%{'\n'}EN VIVO
                  </h3>
                </div>
              </div>
              
              {/* Flex-Grow Text Container with Scrollbar */}
              <div className="flex flex-col flex-grow w-full justify-start relative z-10 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[10.5px] lg:text-[11.5px] xl:text-[13px] text-white/90 font-montserrat text-justify leading-snug xl:leading-[1.5]">
                  Agenda sesiones individuales o grupales con un{' '}
                  <strong className="font-extrabold text-[#fcd34d]">profesor en vivo</strong>{' '}
                  según tu disponibilidad. Recibe tutoría{' '}
                  <strong className="font-extrabold text-[#fcd34d]">personalizada</strong>,
                  feedback instantáneo y corrección en pronunciación, vocabulario
                  y más. <strong className="font-extrabold text-[#fcd34d]">Participa</strong> en
                  escenificaciones, debates, dinámicas y actividades que{' '}
                  <strong className="font-extrabold text-[#fcd34d]">te darán confianza</strong>{' '}
                  al hablar y permitirán evaluar tu propio progreso.
                </p>
              </div>
            </div>
            
            <button
              onClick={onRegister}
              className="mt-3 lg:mt-4 w-full rounded-full border-[2.5px] border-dashed border-[#fcd34d] px-4 py-3 lg:py-4 text-[11px] lg:text-xs xl:text-sm font-black text-[#fcd34d] transition-all duration-300 hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-solid shadow-[0_0_15px_rgba(252,211,77,0.15)] hover:shadow-[0_0_25px_rgba(252,211,77,0.4)] uppercase tracking-widest shrink-0"
            >
              INSCRIBIRSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================
// 3. THE INDEPENDENT ROUTER
// =========================================
const CourseInfoPage = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileCourseInfo {...props} /> : <DesktopCourseInfo {...props} />;
};

export default CourseInfoPage;