import React from 'react';

const METHOD_SCENES = [
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%201.webp',
    alt: 'Estudiante escuchando y practicando pronunciación en Live Lab',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%202.webp',
    alt: 'Estudiante practicando en su workbook digital desde casa',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%203.webp',
    alt: 'Práctica flexible de inglés en horario nocturno',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%204.webp',
    alt: 'Profesor y estudiantes en una clase práctica 100% en vivo',
  },
  {
    src: 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Method%20Images/Scene%205.webp',
    alt: 'Comunidad de estudiantes conversando juntos en inglés',
  },
];

export default function OutLoudCycleScene({ stepIndex = 0 }) {
  const safeIndex = stepIndex >= 0 && stepIndex < METHOD_SCENES.length ? stepIndex : 0;
  const activeScene = METHOD_SCENES[safeIndex];

  return (
    <div className="w-full flex items-center justify-center font-montserrat">
      <style>{`
        @keyframes olaStageSettle {
          0% { opacity: 0; transform: scale(1.045); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes olaBadgePop {
          0% { opacity: 0; transform: translateY(10px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaBarFill {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes olaMiniEq {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        @keyframes olaDotBob {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes olaLivePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.55; }
        }

        .ola-stage-settle {
          animation: olaStageSettle 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ola-badge-pop {
          opacity: 0;
          animation: olaBadgePop 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ola-bar-fill {
          transform-origin: left center;
          animation: olaBarFill 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both;
        }
        .ola-mini-eq {
          transform-origin: center;
          animation: olaMiniEq 1.05s ease-in-out infinite;
        }
        .ola-dot-bob {
          animation: olaDotBob 1.2s ease-in-out infinite;
        }
        .ola-live-pulse {
          animation: olaLivePulse 1.6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .ola-stage-settle,
          .ola-badge-pop,
          .ola-bar-fill,
          .ola-mini-eq,
          .ola-dot-bob,
          .ola-live-pulse {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        key={safeIndex}
        className="relative w-full max-w-[490px] aspect-[4/3] rounded-[1.85rem] overflow-hidden bg-[#fdfcf8] border-2 border-[#1e2246] shadow-[0_7px_0_#1e2246,0_18px_36px_-14px_rgba(30,34,70,0.3)] select-none"
      >
        {/* OPTIMIZED STATIC WEBP SCENE */}
        <img
          src={activeScene.src}
          alt={activeScene.alt}
          width={1000}
          height={750}
          loading={safeIndex === 0 ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
          className="ola-stage-settle w-full h-full object-cover block"
        />

        {/* Subtle bottom vignette purely for crisp overlay readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1e2246]/18 to-transparent" />

        {/* ============================================================
            SCENE 0: LIVE LAB — Escucha y repite con voz real
        ============================================================ */}
        {safeIndex === 0 && (
          <>
            {/* Top-Right Step Tag */}
            <div
              className="ola-badge-pop absolute top-3 right-3 bg-[#1e2246] text-[#ffc749] border-2 border-[#1e2246] px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest shadow-sm"
              style={{ animationDelay: '80ms' }}
            >
              01 • Live Lab
            </div>

            {/* Speech Bubble over open wall between plants & laptop */}
            <div
              className="ola-badge-pop absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#fdfcf8] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-2xl rounded-bl-sm px-3 py-2 sm:px-3.5 sm:py-2.5 max-w-[58%]"
              style={{ animationDelay: '180ms' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-[#ffc749] border border-[#1e2246] flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-[#1e2246] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </span>
                <div className="flex items-center gap-[2px] h-3">
                  <span className="ola-mini-eq w-[2.5px] h-2 bg-[#626a9f] rounded-full" />
                  <span className="ola-mini-eq w-[2.5px] h-3 bg-[#ffc749] rounded-full" style={{ animationDelay: '0.15s' }} />
                  <span className="ola-mini-eq w-[2.5px] h-2 bg-[#626a9f] rounded-full" style={{ animationDelay: '0.3s' }} />
                  <span className="ola-mini-eq w-[2.5px] h-3 bg-[#16a37f] rounded-full" style={{ animationDelay: '0.45s' }} />
                </div>
                <span className="text-[8.5px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#626a9f]">
                  Audio nativo
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-extrabold text-[#1e2246] leading-tight">
                &ldquo;Nice to meet you!&rdquo;
              </p>
            </div>

            {/* Bottom-Left Feedback Pill */}
            <div
              className="ola-badge-pop absolute bottom-3 left-3 bg-[#1e2246] text-white border-2 border-[#1e2246] shadow-[0_3px_0_#ffc749] rounded-full pl-2 pr-3.5 py-1.5 flex items-center gap-2"
              style={{ animationDelay: '340ms' }}
            >
              <span className="w-5 h-5 rounded-full bg-[#16a37f] flex items-center justify-center text-[10px] font-extrabold text-white shrink-0">
                ✓
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap">
                Pronunciación natural
              </span>
            </div>
          </>
        )}

        {/* ============================================================
            SCENE 1: PRÁCTICA — Workbook interactivo a tu ritmo
        ============================================================ */}
        {safeIndex === 1 && (
          <>
            {/* Top-Right Workbook Progress Card on open sage wall */}
            <div
              className="ola-badge-pop absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#fdfcf8] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-2xl p-2.5 sm:p-3 w-[168px] sm:w-[192px]"
              style={{ animationDelay: '140ms' }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[8.5px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#454d82]">
                  Workbook • U04
                </span>
                <span className="text-[9px] font-extrabold text-[#128063] bg-[#e7faf3] px-1.5 py-0.5 rounded-full">
                  85%
                </span>
              </div>
              <div className="w-full h-2 bg-[#e8eaf7] rounded-full overflow-hidden mb-2 border border-[#1e2246]/15">
                <div className="ola-bar-fill h-full w-[85%] bg-[#16a37f] rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8.5px] font-extrabold bg-[#ffc749] text-[#1e2246] border border-[#1e2246] px-2 py-0.5 rounded-full">
                  ✓ Listening
                </span>
                <span className="text-[8.5px] font-extrabold bg-[#626a9f] text-white px-2 py-0.5 rounded-full">
                  ✓ Vocab
                </span>
              </div>
            </div>

            {/* Bottom-Left Self-Paced Pill */}
            <div
              className="ola-badge-pop absolute bottom-3 left-3 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full px-3.5 py-1.5 flex items-center gap-1.5"
              style={{ animationDelay: '300ms' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#1e2246]" />
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight whitespace-nowrap">
                Sin presiones • A tu ritmo
              </span>
            </div>
          </>
        )}

        {/* ============================================================
            SCENE 2: AGENDA — Horarios flexibles que se adaptan a ti
        ============================================================ */}
        {safeIndex === 2 && (
          <>
            {/* Top-Left Calendar Card popping over dark starry window */}
            <div
              className="ola-badge-pop absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#fdfcf8] border-2 border-[#1e2246] shadow-[0_4px_0_#ffc749] rounded-2xl overflow-hidden w-[138px] sm:w-[154px]"
              style={{ animationDelay: '140ms' }}
            >
              <div className="bg-[#ffc749] border-b-2 border-[#1e2246] px-2.5 py-1 text-center">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#1e2246]">
                  MIÉ • 8:00 PM
                </span>
              </div>
              <div className="px-2.5 py-2 flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#16a37f] text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                  ✓
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] font-extrabold text-[#1e2246]">
                  Reservada
                </span>
              </div>
            </div>

            {/* Bottom-Right Flexible Hours Pill on clean counter */}
            <div
              className="ola-badge-pop absolute bottom-3 right-3 bg-[#1e2246] text-white border-2 border-[#1e2246] shadow-[0_3px_0_#ffc749] rounded-full px-3.5 py-1.5 flex items-center gap-2"
              style={{ animationDelay: '300ms' }}
            >
              <span className="text-[#ffc749] text-xs font-extrabold">●</span>
              <span className="text-[10px] sm:text-[11px] font-bold whitespace-nowrap">
                Tú eliges • 8 AM – 9 PM
              </span>
            </div>
          </>
        )}

        {/* ============================================================
            SCENE 3: EN VIVO — Conversación real con profes
        ============================================================ */}
        {safeIndex === 3 && (
          <>
            {/* Top-Right LIVE Indicator above laptop */}
            <div
              className="ola-badge-pop absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2"
              style={{ animationDelay: '120ms' }}
            >
              <div className="bg-[#1e2246] text-white border-2 border-[#1e2246] shadow-[0_3px_0_#ffc749] rounded-full px-3 py-1.5 flex items-center gap-2">
                <span className="ola-live-pulse w-2.5 h-2.5 rounded-full bg-[#ee665b] shrink-0" />
                <span className="text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-wider whitespace-nowrap">
                  En Vivo • 45 min
                </span>
              </div>
            </div>

            {/* Contextual Roleplay Tag */}
            <div
              className="ola-badge-pop hidden sm:flex absolute top-[54px] right-4 bg-[#fdfcf8] text-[#454d82] border-2 border-[#1e2246] rounded-full px-3 py-1 text-[9.5px] font-extrabold uppercase tracking-wider shadow-sm"
              style={{ animationDelay: '240ms' }}
            >
              Situación real: Aeropuerto
            </div>

            {/* Bottom-Left Live Teacher Feedback Bubble */}
            <div
              className="ola-badge-pop absolute bottom-3 left-3 bg-[#16a37f] text-white border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-2xl rounded-bl-sm px-3.5 py-2 max-w-[66%]"
              style={{ animationDelay: '340ms' }}
            >
              <span className="block text-[8.5px] font-extrabold uppercase tracking-widest text-[#ffe69e] leading-none mb-0.5">
                Feedback del profe
              </span>
              <p className="text-[10.5px] sm:text-xs font-extrabold leading-tight">
                &ldquo;Great pronunciation!&rdquo;
              </p>
            </div>
          </>
        )}

        {/* ============================================================
            SCENE 4: COMUNIDAD — Foro, chat y práctica entre pares
        ============================================================ */}
        {safeIndex === 4 && (
          <>
            {/* Top-Right Live Chat Pill with 3 sequential bobbing dots */}
            <div
              className="ola-badge-pop absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#1e2246] text-white border-2 border-[#1e2246] shadow-[0_3px_0_#ffc749] rounded-full px-3 py-1.5 flex items-center gap-2"
              style={{ animationDelay: '120ms' }}
            >
              <div className="flex items-center gap-[3px]">
                <span className="ola-dot-bob w-1.5 h-1.5 rounded-full bg-[#ffc749]" />
                <span className="ola-dot-bob w-1.5 h-1.5 rounded-full bg-[#ffc749]" style={{ animationDelay: '0.18s' }} />
                <span className="ola-dot-bob w-1.5 h-1.5 rounded-full bg-[#ffc749]" style={{ animationDelay: '0.36s' }} />
              </div>
              <span className="text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-wider whitespace-nowrap">
                24/7 Foro &amp; Chat
              </span>
            </div>

            {/* Bottom-Left Peer Practice Badge */}
            <div
              className="ola-badge-pop absolute bottom-3 left-3 bg-[#fdfcf8] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full px-3 py-1.5 flex items-center gap-1.5"
              style={{ animationDelay: '240ms' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#16a37f]" />
              <span className="text-[9.5px] sm:text-[10.5px] font-extrabold whitespace-nowrap">
                Practica sin miedo
              </span>
            </div>

            {/* Bottom-Right Teacher Approved Badge */}
            <div
              className="ola-badge-pop absolute bottom-3 right-3 bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full px-3 py-1.5 text-[9.5px] sm:text-[10.5px] font-extrabold whitespace-nowrap"
              style={{ animationDelay: '360ms' }}
            >
              🍎 Guía docente
            </div>
          </>
        )}
      </div>
    </div>
  );
}