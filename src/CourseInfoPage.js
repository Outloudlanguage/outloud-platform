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
        <div className="flex flex-row justify-between items-center w-full mb-3 lg:mb-4 shrink-0">
          <div className="flex items-center shrink-0">
            <img
              src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png"
              alt="Outloud Logo"
              className="h-10 lg:h-12 xl:h-14 object-contain shrink-0"
            />
            <div className="mx-4 lg:mx-6 h-8 lg:h-10 w-[2px] min-w-[2px] bg-outloud-blue opacity-40 shrink-0"></div>
            <span className="text-base lg:text-xl font-light text-outloud-blue font-montserrat whitespace-nowrap shrink-0">
              Online Platform
            </span>
          </div>

          <div className="flex items-center shrink-0 pl-4 space-x-4 lg:space-x-6">
            <h2 className="text-outloud-blue text-lg lg:text-3xl xl:text-[2rem] font-black tracking-wide font-montserrat uppercase whitespace-nowrap shrink-0">
              INFORMACIÓN ACERCA DE LOS CURSOS
            </h2>

            <button
              onClick={onReturnHome}
              className="flex items-center space-x-2 text-outloud-blue font-bold font-montserrat hover:text-blue-900 transition shrink-0"
            >
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm lg:text-base whitespace-nowrap">
                Return Home
              </span>
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </button>
          </div>
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
              <h3 className="text-xl lg:text-3xl xl:text-[2rem] font-black text-outloud-blue font-tabarra mb-0.5 lg:mb-1 leading-none shrink-0">
                INMERSIÓN TOTAL
              </h3>
              <p className="text-[11px] lg:text-[12px] xl:text-[13px] text-outloud-blue font-montserrat text-justify leading-[1.35] flex-grow mt-1">
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
              <h3 className="text-xl lg:text-3xl xl:text-[2rem] font-black text-outloud-blue font-tabarra mb-0.5 lg:mb-1 leading-none shrink-0">
                ACCESO 24/7
              </h3>
              <p className="text-[11px] lg:text-[12px] xl:text-[13px] text-outloud-blue font-montserrat text-justify leading-[1.35] flex-grow mt-1">
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

            {/* UPDATED MIDDLE BUTTON */}
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
              <h3 className="text-xl lg:text-3xl xl:text-[2rem] font-black text-outloud-blue font-tabarra mb-0.5 lg:mb-1 leading-none whitespace-pre-line shrink-0">
                CLASES 100%{'\n'}EN VIVO
              </h3>
              <p className="text-[11px] lg:text-[12px] xl:text-[13px] text-outloud-blue font-montserrat text-justify leading-[1.35] flex-grow mt-1">
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
