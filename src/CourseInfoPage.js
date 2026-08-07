import React from 'react';

const CourseInfoPage = ({
  onReturnHome,
  onRegister,
  onCycleClick,
  onLevelsClick,
}) => {
  return (
    <div className="relative h-screen w-full font-sans bg-[#eef5fc] overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://i.postimg.cc/PJbrcZdF/Agregar-un-subtitulo-(5).png"
          alt="Outloud Bubble Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 flex flex-col h-full px-6 py-3 md:px-10 md:py-4 max-w-[90rem] mx-auto w-full">
        
        {/* Top Header */}
        <div className="relative z-10 flex flex-row justify-between items-center w-full mb-3 lg:mb-4 shrink-0">
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex-none flex items-center">
              <img 
                src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" 
                alt="Outloud Logo" 
                className="h-8 md:h-10 lg:h-11 object-contain" 
              />
            </div>
            
            <div className="flex-none h-6 md:h-8 w-[2px] bg-outloud-blue opacity-40"></div>
            
            <span className="flex-none hidden md:block text-xs lg:text-sm font-light text-outloud-blue font-montserrat whitespace-nowrap">
              Online Platform
            </span>
            
            {/* FIXED: Bumped text sizes to hit exactly where your cursor highlight ended */}
            <h1 className="flex-none text-[14px] sm:text-[15px] md:text-lg lg:text-[22px] xl:text-[28px] font-black text-outloud-blue font-montserrat tracking-wide uppercase whitespace-nowrap">
              INFORMACIÓN ACERCA DE LOS CURSOS
            </h1>
          </div>

          <button 
            onClick={onReturnHome} 
            className="flex-none flex items-center space-x-1.5 md:space-x-2 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition ml-2"
          >
            <svg className="flex-none w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="flex-none text-[11px] md:text-xs lg:text-sm whitespace-nowrap">Return Home</span>
            
            <svg className="flex-none w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </button>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 flex-grow min-h-0 pb-1">
          {/* COLUMN 1 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white hover:bg-student-yellow transition-colors duration-300 rounded-[2rem] p-5 lg:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] items-center text-center cursor-default overflow-hidden">
              <div className="h-[4.5rem] lg:h-[5.5rem] xl:h-[7rem] w-full flex items-end justify-center mb-1 lg:mb-2 shrink-0">
                <img
                  src="https://i.postimg.cc/LssD8BWw/Agregar-algo-de-texto-(14).png"
                  alt="Inmersión Total Icon"
                  className="h-full w-auto object-contain scale-[1.5] xl:scale-[1.7] origin-bottom translate-y-5 lg:translate-y-7 xl:translate-y-9"
                />
              </div>
              <p className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-outloud-blue font-montserrat mb-0.5 lg:mb-1 shrink-0">
                ¿CÓMO FUNCIONA EL CURSO?
              </p>
              
              <h3 className="min-h-[3rem] lg:min-h-[4rem] xl:min-h-[4.5rem] text-xl lg:text-3xl xl:text-[2rem] font-black text-outloud-blue font-tabarra mb-0.5 lg:mb-1 leading-none shrink-0">
                INMERSIÓN TOTAL
              </h3>
              
              <p className="text-[11px] lg:text-[12px] xl:text-[13.5px] text-outloud-blue font-montserrat text-justify leading-[1.5] flex-grow mt-2">
                Olvídate de la teoría rígida. Hemos diseñado un aprendizaje
                libre de distracciones, interactivo y directo, basado en{' '}
                <strong className="font-extrabold">
                  situaciones de la vida real
                </strong>{' '}
                que te servirá de guía para adquirir un nuevo idioma de forma
                natural y fluida,{' '}
                <strong className="font-extrabold">sin traducir</strong> y sin
                pasar horas estudiando listas de vocabulario o gramática.
              </p>
              
              <p className="text-[9px] lg:text-[10px] xl:text-[11px] font-extrabold text-outloud-blue font-montserrat mt-2 tracking-wider uppercase shrink-0">
                ¿CÓMO FUNCIONA? SIGUE LEYENDO.
              </p>
            </div>

            <button
              onClick={onCycleClick}
              className="mt-3 lg:mt-4 w-full rounded-full border-[2.5px] border-dashed border-outloud-blue px-4 py-2 lg:py-3 text-[10px] lg:text-xs xl:text-sm font-extrabold text-outloud-blue transition-all duration-300 hover:bg-student-yellow hover:border-solid hover:border-student-yellow shadow-sm hover:shadow-md uppercase shrink-0"
            >
              VER EL CICLO DE ESTUDIO
            </button>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white hover:bg-student-yellow transition-colors duration-300 rounded-[2rem] p-5 lg:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] items-center text-center cursor-default overflow-hidden">
              <div className="h-[4.5rem] lg:h-[5.5rem] xl:h-[7rem] w-full flex items-end justify-center mb-1 lg:mb-2 shrink-0">
                <img
                  src="https://i.postimg.cc/mDJHRQff/6(2).png"
                  alt="Acceso 24/7 Icon"
                  className="h-full w-auto object-contain scale-[1.35] xl:scale-[1.5] origin-bottom translate-y-4 lg:translate-y-5 xl:translate-y-7"
                />
              </div>
              <p className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-outloud-blue font-montserrat mb-0.5 lg:mb-1 shrink-0">
                ESTUDIA A TU RITMO
              </p>
              
              <h3 className="min-h-[3rem] lg:min-h-[4rem] xl:min-h-[4.5rem] text-xl lg:text-3xl xl:text-[2rem] font-black text-outloud-blue font-tabarra mb-0.5 lg:mb-1 leading-none shrink-0">
                ACCESO 24/7
              </h3>
              
              <p className="text-[11px] lg:text-[12px] xl:text-[13.5px] text-outloud-blue font-montserrat text-justify leading-[1.5] flex-grow mt-2">
                Accede cuando y donde quieras a lecciones dinámicas, audios,
                chats, foros,{' '}
                <strong className="font-extrabold">club de conversación</strong>
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
              className="mt-3 lg:mt-4 w-full rounded-full border-[2.5px] border-dashed border-outloud-blue px-4 py-2 lg:py-3 text-[10px] lg:text-xs xl:text-sm font-extrabold text-outloud-blue transition-all duration-300 hover:bg-student-yellow hover:border-solid hover:border-student-yellow shadow-sm hover:shadow-md uppercase shrink-0"
            >
              NIVELES Y MÓDULOS
            </button>
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col h-full min-h-0">
            <div className="group flex flex-col flex-grow bg-white hover:bg-student-yellow transition-colors duration-300 rounded-[2rem] p-5 lg:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] items-center text-center cursor-default overflow-hidden">
              <div className="h-[4.5rem] lg:h-[5.5rem] xl:h-[7rem] w-full flex items-end justify-center mb-1 lg:mb-2 shrink-0">
                <img
                  src="https://i.postimg.cc/LXn1rxWs/7(3).png"
                  alt="Clases En Vivo Icon"
                  className="h-full w-auto object-contain origin-bottom"
                />
              </div>
              <p className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-outloud-blue font-montserrat mb-0.5 lg:mb-1 shrink-0">
                INTERACCIÓN REAL
              </p>
              
              <h3 className="min-h-[3rem] lg:min-h-[4rem] xl:min-h-[4.5rem] text-xl lg:text-3xl xl:text-[2rem] font-black text-outloud-blue font-tabarra mb-0.5 lg:mb-1 leading-none whitespace-pre-line shrink-0">
                CLASES 100%{'\n'}EN VIVO
              </h3>
              
              <p className="text-[11px] lg:text-[12px] xl:text-[13.5px] text-outloud-blue font-montserrat text-justify leading-[1.5] flex-grow mt-2">
                Agenda sesiones individuales o grupales con un{' '}
                <strong className="font-extrabold">profesor en vivo</strong>{' '}
                según tu disponibilidad. Recibe tutoría{' '}
                <strong className="font-extrabold">personalizada</strong>,
                feedback instantáneo y corrección en pronunciación, vocabulario
                y más. <strong className="font-extrabold">Participa</strong> en
                escenificaciones, debates, dinámicas y actividades que{' '}
                <strong className="font-extrabold">te darán confianza</strong>{' '}
                al hablar y permitirán evaluar tu propio progreso.
              </p>
            </div>
            
            <button
              onClick={onRegister}
              className="mt-3 lg:mt-4 w-full rounded-full border-[2.5px] border-dashed border-outloud-blue px-4 py-2 lg:py-3 text-[10px] lg:text-xs xl:text-sm font-extrabold text-outloud-blue transition-all duration-300 hover:bg-student-yellow hover:border-solid hover:border-student-yellow shadow-sm hover:shadow-md uppercase shrink-0"
            >
              INSCRIBIRSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoPage;