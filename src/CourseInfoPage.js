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
              src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" 
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[11px] whitespace-nowrap tracking-wide uppercase">Return Home</span>
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
                <img
                  src="https://i.postimg.cc/LssD8BWw/Agregar-algo-de-texto-(14).png"
                  alt="Inmersión Total Icon"
                  className="h-20 w-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
                />
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
                <img
                  src="https://i.postimg.cc/mDJHRQff/6(2).png"
                  alt="Acceso 24/7 Icon"
                  className="h-20 w-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
                />
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
                <img
                  src="https://i.postimg.cc/LXn1rxWs/7(3).png"
                  alt="Clases En Vivo Icon"
                  className="h-20 w-auto object-contain mb-3 brightness-0 invert opacity-90 drop-shadow-md"
                />
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
        
        {/* Top Header */}
        <div className="relative z-10 flex flex-row justify-between items-center w-full mb-6 lg:mb-10 shrink-0">
          
          <div className="flex items-center space-x-4 md:space-x-5">
            <div className="flex-none flex items-center">
              <img 
                src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" 
                alt="Outloud Logo" 
                className="h-10 md:h-12 lg:h-14 object-contain opacity-90 drop-shadow-md" 
              />
            </div>
            
            <div className="flex-none h-8 md:h-10 w-[2px] bg-white/30"></div>
            
            <span className="flex-none hidden md:block text-xs lg:text-sm font-light text-white/80 font-montserrat whitespace-nowrap tracking-wide">
              Online Platform
            </span>
            
            <h1 className="flex-none text-[14px] sm:text-[15px] md:text-lg lg:text-[22px] xl:text-[28px] font-black text-white drop-shadow-md font-montserrat tracking-widest uppercase whitespace-nowrap ml-2">
              INFORMACIÓN ACERCA DE LOS CURSOS
            </h1>
          </div>

          <button 
            onClick={onReturnHome} 
            className="flex-none flex items-center space-x-2 md:space-x-3 text-white font-bold font-montserrat hover:text-[#fcd34d] transition-colors ml-4"
          >
            <svg className="flex-none w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="flex-none text-xs md:text-sm lg:text-base whitespace-nowrap tracking-wider uppercase">Return Home</span>
            
            <svg className="flex-none w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </button>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 flex-grow min-h-0 pb-6">
          
          {/* COLUMN 1 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-[2.5rem] p-6 lg:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(252,211,77,0.15)] items-center text-center cursor-default overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="h-[5rem] lg:h-[6.5rem] xl:h-[8rem] w-full flex items-end justify-center mb-2 lg:mb-4 shrink-0 relative z-10">
                <img
                  src="https://i.postimg.cc/LssD8BWw/Agregar-algo-de-texto-(14).png"
                  alt="Inmersión Total Icon"
                  className="h-full w-auto object-contain scale-[1.5] xl:scale-[1.7] origin-bottom translate-y-4 lg:translate-y-6 xl:translate-y-8 brightness-0 invert opacity-90 drop-shadow-lg"
                />
              </div>
              <p className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase mb-1 lg:mb-2 shrink-0 relative z-10">
                ¿CÓMO FUNCIONA EL CURSO?
              </p>
              
              <h3 className="min-h-[3.5rem] lg:min-h-[4.5rem] xl:min-h-[5rem] text-2xl lg:text-3xl xl:text-[2.2rem] font-black text-white drop-shadow-md font-tabarra mb-1 lg:mb-2 leading-none shrink-0 relative z-10">
                INMERSIÓN TOTAL
              </h3>
              
              <p className="text-[11px] lg:text-[12px] xl:text-[14px] text-white/90 font-montserrat text-justify leading-[1.6] flex-grow mt-2 relative z-10">
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
              
              <p className="text-[9px] lg:text-[10px] xl:text-[11px] font-black text-white/50 font-montserrat mt-4 tracking-widest uppercase shrink-0 relative z-10">
                ¿CÓMO FUNCIONA? SIGUE LEYENDO.
              </p>
            </div>

            <button
              onClick={onCycleClick}
              className="mt-4 lg:mt-6 w-full rounded-full border-[2.5px] border-dashed border-[#fcd34d] px-4 py-3 lg:py-4 text-[11px] lg:text-xs xl:text-sm font-black text-[#fcd34d] transition-all duration-300 hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-solid shadow-[0_0_15px_rgba(252,211,77,0.15)] hover:shadow-[0_0_25px_rgba(252,211,77,0.4)] uppercase tracking-widest shrink-0"
            >
              VER EL CICLO DE ESTUDIO
            </button>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-[2.5rem] p-6 lg:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(252,211,77,0.15)] items-center text-center cursor-default overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

              <div className="h-[5rem] lg:h-[6.5rem] xl:h-[8rem] w-full flex items-end justify-center mb-2 lg:mb-4 shrink-0 relative z-10">
                <img
                  src="https://i.postimg.cc/mDJHRQff/6(2).png"
                  alt="Acceso 24/7 Icon"
                  className="h-full w-auto object-contain scale-[1.35] xl:scale-[1.5] origin-bottom translate-y-3 lg:translate-y-4 xl:translate-y-6 brightness-0 invert opacity-90 drop-shadow-lg"
                />
              </div>
              <p className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase mb-1 lg:mb-2 shrink-0 relative z-10">
                ESTUDIA A TU RITMO
              </p>
              
              <h3 className="min-h-[3.5rem] lg:min-h-[4.5rem] xl:min-h-[5rem] text-2xl lg:text-3xl xl:text-[2.2rem] font-black text-white drop-shadow-md font-tabarra mb-1 lg:mb-2 leading-none shrink-0 relative z-10">
                ACCESO 24/7
              </h3>
              
              <p className="text-[11px] lg:text-[12px] xl:text-[14px] text-white/90 font-montserrat text-justify leading-[1.6] flex-grow mt-2 relative z-10">
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

            <button
              onClick={onLevelsClick}
              className="mt-4 lg:mt-6 w-full rounded-full border-[2.5px] border-dashed border-[#fcd34d] px-4 py-3 lg:py-4 text-[11px] lg:text-xs xl:text-sm font-black text-[#fcd34d] transition-all duration-300 hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-solid shadow-[0_0_15px_rgba(252,211,77,0.15)] hover:shadow-[0_0_25px_rgba(252,211,77,0.4)] uppercase tracking-widest shrink-0"
            >
              NIVELES Y MÓDULOS
            </button>
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-[2.5rem] p-6 lg:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(252,211,77,0.15)] items-center text-center cursor-default overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

              <div className="h-[5rem] lg:h-[6.5rem] xl:h-[8rem] w-full flex items-end justify-center mb-2 lg:mb-4 shrink-0 relative z-10">
                <img
                  src="https://i.postimg.cc/LXn1rxWs/7(3).png"
                  alt="Clases En Vivo Icon"
                  className="h-full w-auto object-contain origin-bottom brightness-0 invert opacity-90 drop-shadow-lg"
                />
              </div>
              <p className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-[#fcd34d] font-montserrat tracking-widest uppercase mb-1 lg:mb-2 shrink-0 relative z-10">
                INTERACCIÓN REAL
              </p>
              
              <h3 className="min-h-[3.5rem] lg:min-h-[4.5rem] xl:min-h-[5rem] text-2xl lg:text-3xl xl:text-[2.2rem] font-black text-white drop-shadow-md font-tabarra mb-1 lg:mb-2 leading-none whitespace-pre-line shrink-0 relative z-10">
                CLASES 100%{'\n'}EN VIVO
              </h3>
              
              <p className="text-[11px] lg:text-[12px] xl:text-[14px] text-white/90 font-montserrat text-justify leading-[1.6] flex-grow mt-2 relative z-10">
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
            
            <button
              onClick={onRegister}
              className="mt-4 lg:mt-6 w-full rounded-full border-[2.5px] border-dashed border-[#fcd34d] px-4 py-3 lg:py-4 text-[11px] lg:text-xs xl:text-sm font-black text-[#fcd34d] transition-all duration-300 hover:bg-[#fcd34d] hover:text-[#08203e] hover:border-solid shadow-[0_0_15px_rgba(252,211,77,0.15)] hover:shadow-[0_0_25px_rgba(252,211,77,0.4)] uppercase tracking-widest shrink-0"
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
  return isMobile ? <MobileCourseInfo {...props} /> : <DesktopCourseInfo {...props} />;
};

export default CourseInfoPage;