import React from 'react';

// ==========================================================
// CAPA 1: CABELLO TRASERO (Siempre renderizado DETRÁS del
// cuello, cuello de camisa y hombros — cero efecto hijab/barba)
// ==========================================================
function CharacterBackHair({
  hairStyle = 'wavy', // 'wavy' | 'bun' | 'short' | 'locs' | 'curly'
  hairColor = '#1e2246',
  hairHighlight = '#3b437a',
}) {
  if (hairStyle === 'wavy') {
    return (
      <g>
        {/* Melena larga cayendo libremente por detrás del cuello y los hombros */}
        <path
          d="M -35 -42 C -38 -70, -20 -80, 0 -80 C 20 -80, 38 -70, 35 -42 C 37 -18, 44 10, 44 38 C 44 47, 36 52, 26 48 L -26 48 C -36 52, -44 47, -44 38 C -44 10, -37 -18, -35 -42 Z"
          fill={hairColor}
        />
        <path
          d="M -37 8 C -39 22, -41 34, -36 42 M 37 8 C 39 22, 41 34, 36 42"
          stroke={hairHighlight}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>
    );
  }

  if (hairStyle === 'locs') {
    return (
      <g>
        {/* Cabello largo trenzado/locs cayendo por detrás de la nuca y hombros */}
        <path
          d="M -35 -42 C -37 -69, -21 -79, 0 -79 C 21 -79, 37 -69, 35 -42 C 38 -12, 42 14, 41 36 C 41 44, 33 48, 24 44 L -24 44 C -33 48, -41 44, -41 36 C -42 14, -38 -12, -35 -42 Z"
          fill={hairColor}
        />
        <circle cx="-36" cy="36" r="6" fill={hairColor} />
        <circle cx="36" cy="36" r="6" fill={hairColor} />
        <circle cx="-39" cy="20" r="5.5" fill={hairColor} />
        <circle cx="39" cy="20" r="5.5" fill={hairColor} />
      </g>
    );
  }

  if (hairStyle === 'bun') {
    return (
      <g>
        <circle cx="-11" cy="-78" r="16.5" fill={hairColor} />
        <path d="M -23 -78 Q -11 -88 1 -78" stroke={hairHighlight} strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        {/* Solo parte superior detrás de la cabeza (no baja frente al cuello) */}
        <path d="M -32 -36 C -34 -64, -18 -76, 0 -76 C 18 -76, 34 -64, 32 -36 L 26 -20 L -26 -20 Z" fill={hairColor} />
      </g>
    );
  }

  if (hairStyle === 'curly') {
    return (
      <g fill={hairColor}>
        <circle cx="-23" cy="-58" r="17" />
        <circle cx="-8" cy="-68" r="18" />
        <circle cx="10" cy="-68" r="18" />
        <circle cx="24" cy="-57" r="17" />
        <circle cx="-29" cy="-41" r="13" />
        <circle cx="29" cy="-41" r="13" />
      </g>
    );
  }

  // 'short'
  return (
    <path
      d="M -31 -34 C -33 -63, -18 -77, 2 -77 C 22 -77, 34 -62, 31 -34 L 26 -22 L -26 -22 Z"
      fill={hairColor}
    />
  );
}

// ==========================================================
// CAPA 2: TORSO Y HOMBROS ANATÓMICOS (ESTRICTAMENTE 2 BRAZOS)
// Si leftArmRaised / rightArmRaised es true, NO dibuja brazo
// colgando en ese lado — solo queda el costado limpio del torso.
// ==========================================================
function CharacterTorso({
  shirtColor = '#626a9f',
  shirtShadow = '#4c548a',
  collarStyle = 'crew', // 'crew' | 'collared' | 'cardigan'
  collarColor = '#ffffff',
  skinColor = '#f4c5a3',
  skinShadow = '#da9e77',
  leftArmRaised = false,
  rightArmRaised = false,
}) {
  return (
    <g>
      {/* Cuello anatómico afinado entrando limpio dentro del cuello de la prenda */}
      <path
        d="M -10 -14 L 10 -14 C 10 -2, 13 9, 20 18 L 20 26 L -20 26 L -20 18 C -13 9, -10 -2, -10 -14 Z"
        fill={skinColor}
      />
      {/* Sombra proyectada por la mandíbula sobre el cuello */}
      <path
        d="M -10.5 -12 L 10.5 -12 C 10.5 -3, 11 1, 11.5 4 C 4.5 9, -4.5 9, -11.5 4 C -11 1, -10.5 -3, -10.5 -12 Z"
        fill={skinShadow}
      />

      {/* BRAZO IZQUIERDO COLGANDO (Solo si NO está levantado) */}
      {!leftArmRaised && (
        <g>
          <path
            d="M -22 16 C -41 18, -52 28, -54 48 L -51 98 L -32 98 L -33 44 C -32 30, -28 22, -22 16 Z"
            fill={shirtColor}
          />
          <path
            d="M -35 45 Q -33 70 -35 96"
            stroke={shirtShadow}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      )}

      {/* BRAZO DERECHO COLGANDO (Solo si NO está levantado) */}
      {!rightArmRaised && (
        <g>
          <path
            d="M 22 16 C 41 18, 52 28, 54 48 L 51 98 L 32 98 L 33 44 C 32 30, 28 22, 22 16 Z"
            fill={shirtColor}
          />
          <path
            d="M 33 22 C 45 27, 52 36, 54 48 L 51 98 L 36 98 L 37 44 C 37 34, 36 27, 33 22 Z"
            fill={shirtShadow}
            fillOpacity="0.38"
          />
          <path
            d="M 35 45 Q 33 70 35 96"
            stroke={shirtShadow}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      )}

      {/* PECHO / TRONCO CENTRAL (Costados limpios; nunca duplica brazos) */}
      <path
        d="M -19 15 C -28 16, -34 21, -35 32 L -33 98 L 33 98 L 35 32 C 34 21, 28 16, 19 15 Q 0 28 -19 15 Z"
        fill={shirtColor}
      />

      {/* Sombra sutil lateral derecha sobre el torso */}
      <path
        d="M 22 17 C 30 19, 34 24, 35 32 L 33 98 L 22 98 L 23 36 C 23 26, 23 21, 22 17 Z"
        fill={shirtShadow}
        fillOpacity="0.22"
      />

      {/* Variaciones de Cuello de Prenda */}
      {collarStyle === 'crew' && (
        <path
          d="M -20 14 Q 0 30 20 14 L 22 20 Q 0 36 -22 20 Z"
          fill={collarColor}
          opacity="0.95"
        />
      )}

      {collarStyle === 'collared' && (
        <g>
          <path
            d="M -19 14 L -6 31 L 0 23 L 6 31 L 19 14 Q 0 24 -19 14 Z"
            fill={collarColor}
          />
          <path
            d="M -19 14 L -6 31 L 0 23 L 6 31 L 19 14"
            stroke="#1e2246"
            strokeOpacity="0.18"
            strokeWidth="1.6"
            fill="none"
            strokeLinejoin="round"
          />
        </g>
      )}

      {collarStyle === 'cardigan' && (
        <g>
          <path d="M -19 14 L 0 46 L 19 14 Q 0 25 -19 14 Z" fill={collarColor} />
          <path
            d="M -22 14 L -3 50 L -3 98 L -12 98 L -12 52 L -26 17 Z"
            fill={shirtShadow}
            opacity="0.5"
          />
          <path
            d="M 22 14 L 3 50 L 3 98 L 12 98 L 12 52 L 26 17 Z"
            fill={shirtShadow}
            opacity="0.5"
          />
        </g>
      )}
    </g>
  );
}

// ==========================================================
// CAPA 3: ROSTRO, OREJAS Y FLEQUILLO FRONTAL
// (Solo frente de la cabeza — cero formas debajo del mentón)
// ==========================================================
function CharacterHead({
  skinColor = '#f4c5a3',
  skinShadow = '#da9e77',
  hairColor = '#1e2246',
  hairHighlight = '#3b437a',
  hairStyle = 'wavy',
  expression = 'talk',
  glasses = false,
  headphones = false,
  headset = false,
  gazeX = 0,
  blinkDelay = '0s',
}) {
  return (
    <g>
      {/* Orejas esculpidas */}
      <g>
        <path d="M -25 -35 C -33 -36, -34 -21, -25 -19 Z" fill={skinColor} />
        <path d="M -27 -30 Q -30 -27 -27 -23" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 25 -35 C 33 -36, 34 -21, 25 -19 Z" fill={skinColor} />
        <path d="M 27 -30 Q 30 -27 27 -23" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* Rostro y mandíbula esculpida */}
      <path
        d="M -26 -35 C -26 -55, -16 -65, 0 -65 C 16 -65, 26 -55, 26 -35 C 26 -17, 19 -5, 9 -1 C 3 1.5, -3 1.5, -9 -1 C -19 -5, -26 -17, -26 -35 Z"
        fill={skinColor}
      />

      {/* Rubor sutil */}
      <ellipse cx={-16 + gazeX * 0.45} cy="-21" rx="5.2" ry="2.7" fill="#ee665b" fillOpacity="0.22" />
      <ellipse cx={16 + gazeX * 0.45} cy="-21" rx="5.2" ry="2.7" fill="#ee665b" fillOpacity="0.22" />

      {/* Rasgos faciales */}
      <g transform={`translate(${gazeX}, 0)`}>
        <path d="M -16 -38 Q -11 -42 -5.5 -39" stroke={hairColor} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 5.5 -39 Q 11 -42 16 -38" stroke={hairColor} strokeWidth="2.4" strokeLinecap="round" fill="none" />

        <g className="ola-rig-blink" style={{ animationDelay: blinkDelay }}>
          {expression === 'laugh' ? (
            <>
              <path d="M -15 -29 Q -11 -34 -7 -29" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 7 -29 Q 11 -34 15 -29" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="-11" cy="-29" rx="3.1" ry="3.7" fill="#1e2246" />
              <circle cx="-9.9" cy="-30.4" r="1.15" fill="#ffffff" />
              <ellipse cx="11" cy="-29" rx="3.1" ry="3.7" fill="#1e2246" />
              <circle cx="12.1" cy="-30.4" r="1.15" fill="#ffffff" />
            </>
          )}
        </g>

        <path d="M 0 -29 C -2 -23.5, -2.5 -21, 2.2 -20" stroke={skinShadow} strokeWidth="2.1" strokeLinecap="round" fill="none" />

        {expression === 'talk' ? (
          <g className="ola-rig-talk">
            <path d="M -9 -13 Q 0 -11.5 9 -13 C 9 -4, 4 -2, 0 -2 C -4 -2, -9 -4, -9 -13 Z" fill="#3d2236" />
            <path d="M -7.5 -12.3 Q 0 -11 7.5 -12.3 L 6.6 -9.6 Q 0 -8.7 -6.6 -9.6 Z" fill="#ffffff" />
            <path d="M -4.2 -4.6 Q 0 -7.2 4.2 -4.6 Q 0 -2.2 -4.2 -4.6 Z" fill="#ee665b" />
          </g>
        ) : (
          <path d="M -9 -12.5 Q 0 -5.5 10 -13.5" stroke="#1e2246" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {glasses && (
          <g>
            <rect x="-20.5" y="-36" width="18" height="13.5" rx="6" stroke="#1e2246" strokeWidth="2.1" fill="#ffffff" fillOpacity="0.22" />
            <rect x="2.5" y="-36" width="18" height="13.5" rx="6" stroke="#1e2246" strokeWidth="2.1" fill="#ffffff" fillOpacity="0.22" />
            <path d="M -2.5 -29.5 H 2.5" stroke="#1e2246" strokeWidth="2.1" />
          </g>
        )}
      </g>

      {/* Flequillo y volumen superior del cabello */}
      {hairStyle === 'wavy' && (
        <g>
          <path
            d="M -28 -36 C -27 -62, -6 -74, 18 -64 C 27 -60, 30 -47, 27 -34 C 20 -48, 0 -51, -24 -40 L -27 -33 Z"
            fill={hairColor}
          />
          <path d="M -14 -59 Q 3 -66 17 -56" stroke={hairHighlight} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.72" />
        </g>
      )}
      {hairStyle === 'bun' && (
        <g>
          <path
            d="M -28 -35 C -26 -63, 8 -72, 28 -44 L 27 -34 C 15 -49, -10 -49, -27 -35 Z"
            fill={hairColor}
          />
          <path d="M -13 -57 Q 4 -63 16 -53" stroke={hairHighlight} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
      )}
      {hairStyle === 'short' && (
        <g>
          <path
            d="M -28 -32 C -30 -58, -14 -76, 8 -74 C 24 -72, 32 -56, 28 -32 L 24 -34 C 24 -44, 18 -49, 10 -49 C 0 -49, -10 -46, -24 -38 L -24 -30 Z"
            fill={hairColor}
          />
          <path d="M -12 -62 Q 6 -68 20 -58" stroke={hairHighlight} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.72" />
        </g>
      )}
      {hairStyle === 'locs' && (
        <g>
          <path
            d="M -28 -35 C -26 -64, 26 -64, 28 -35 C 16 -49, -16 -49, -28 -35 Z"
            fill={hairColor}
          />
          <path d="M -12 -57 Q 0 -62 12 -57" stroke={hairHighlight} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
      )}
      {hairStyle === 'curly' && (
        <g fill={hairColor}>
          <circle cx="-18" cy="-50" r="10.5" />
          <circle cx="-6" cy="-53" r="11" />
          <circle cx="7" cy="-53" r="11" />
          <circle cx="19" cy="-49" r="10" />
          <path d="M -10 -60 Q 2 -65 13 -59" stroke={hairHighlight} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
      )}

      {/* Audífonos OutLoud */}
      {headphones && (
        <g>
          <path d="M -32 -32 C -32 -78, 32 -78, 32 -32" stroke="#ffc749" strokeWidth="7.5" strokeLinecap="round" fill="none" />
          <rect x="-38" y="-42" width="12" height="27" rx="6" fill="#454d82" stroke="#1e2246" strokeWidth="2" />
          <rect x="26" y="-42" width="12" height="27" rx="6" fill="#454d82" stroke="#1e2246" strokeWidth="2" />
          <rect x="-34.5" y="-34" width="4.5" height="11" rx="2.2" fill="#ffc749" />
          <rect x="30" y="-34" width="4.5" height="11" rx="2.2" fill="#ffc749" />
        </g>
      )}

      {/* Headset profesional */}
      {headset && (
        <g>
          <path d="M -29 -32 C -29 -72, 29 -72, 29 -32" stroke="#454d82" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <rect x="25" y="-37" width="9" height="18" rx="4.5" fill="#1e2246" />
          <circle cx="29.5" cy="-28" r="2.2" fill="#ffc749" />
          <path d="M 29 -24 Q 26 -10 10 -10" stroke="#1e2246" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="9.5" cy="-10" r="2.5" fill="#1e2246" />
        </g>
      )}
    </g>
  );
}

// ==========================================================
// COMPONENTE PRINCIPAL: 5 ESCENAS HUMANAS ANATÓMICAS
// ==========================================================
export default function OutLoudCycleScene({ stepIndex }) {
  return (
    <div className="w-full flex items-center justify-center">
      <style>{`
        @keyframes olaSceneIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaRigBlink {
          0%, 44%, 48%, 94%, 98%, 100% { transform: scaleY(1); }
          46%, 96% { transform: scaleY(0.08); }
        }
        @keyframes olaRigHeadNod {
          0%, 100% { transform: rotate(-2.5deg); }
          40% { transform: rotate(3deg); }
          75% { transform: rotate(-1deg); }
        }
        @keyframes olaRigHeadListen {
          0%, 100% { transform: rotate(-3.5deg); }
          50% { transform: rotate(3.5deg); }
        }
        @keyframes olaRigTalk {
          0%, 100% { transform: scaleY(0.75); }
          25% { transform: scaleY(1.1); }
          50% { transform: scaleY(0.55); }
          75% { transform: scaleY(1.05); }
        }
        @keyframes olaRigBreathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes olaForearmWave {
          0%, 100% { transform: rotate(-9deg); }
          50% { transform: rotate(11deg); }
        }
        @keyframes olaHandWrite {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          35% { transform: translate(-3px, 2px) rotate(-5deg); }
          70% { transform: translate(3px, -2px) rotate(4deg); }
        }
        @keyframes olaHandTap {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-6deg); }
        }
        @keyframes olaThumbBounce {
          0%, 100% { transform: rotate(0deg); }
          45% { transform: rotate(-8deg); }
        }
        @keyframes olaGestureChat {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(7deg); }
        }
        @keyframes olaBubbleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes olaEqPulse {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        @keyframes olaSteamCurl {
          0% { opacity: 0; transform: translateY(4px); }
          50% { opacity: 0.85; transform: translateY(-3px); }
          100% { opacity: 0; transform: translateY(-9px); }
        }
        @keyframes olaDashFlow {
          to { stroke-dashoffset: -28; }
        }

        .ola-scene-in { animation: olaSceneIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .ola-rig-breathe { animation: olaRigBreathe 3.8s ease-in-out infinite; }
        .ola-rig-head-nod {
          transform-box: fill-box;
          transform-origin: 50% 92%;
          animation: olaRigHeadNod 4.2s ease-in-out infinite;
        }
        .ola-rig-head-listen {
          transform-box: fill-box;
          transform-origin: 50% 92%;
          animation: olaRigHeadListen 3.4s ease-in-out infinite;
        }
        .ola-rig-blink {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: olaRigBlink 4.6s ease-in-out infinite;
        }
        .ola-rig-talk {
          transform-box: fill-box;
          transform-origin: 50% 25%;
          animation: olaRigTalk 1.05s ease-in-out infinite;
        }
        .ola-forearm-wave {
          transform-box: fill-box;
          transform-origin: 20% 88%;
          animation: olaForearmWave 1.15s ease-in-out infinite;
        }
        .ola-hand-write {
          transform-box: fill-box;
          transform-origin: 20% 75%;
          animation: olaHandWrite 2.1s ease-in-out infinite;
        }
        .ola-hand-headphone {
          transform-box: fill-box;
          transform-origin: 22% 85%;
          animation: olaHandTap 3.4s ease-in-out infinite;
        }
        .ola-thumb-bounce {
          transform-box: fill-box;
          transform-origin: 25% 88%;
          animation: olaThumbBounce 2.2s ease-in-out infinite;
        }
        .ola-gesture-chat {
          transform-box: fill-box;
          transform-origin: 25% 88%;
          animation: olaGestureChat 2.4s ease-in-out infinite;
        }
        .ola-bubble-float { animation: olaBubbleFloat 3.4s ease-in-out infinite; }
        .ola-eq-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaEqPulse 1s ease-in-out infinite;
        }
        .ola-steam-curl { animation: olaSteamCurl 2.4s ease-in-out infinite; }
        .ola-dash-flow { animation: olaDashFlow 1.6s linear infinite; }
      `}</style>

      {/* ================================================== */}
      {/* SCENE 0: LIVE LAB (Cabello detrás + 2 brazos)      */}
      {/* ================================================== */}
      {stepIndex === 0 && (
        <svg
          key="scene-0"
          viewBox="0 0 460 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[460px] h-auto"
          aria-label="Estudiante escuchando y practicando pronunciación en Live Lab"
        >
          <defs>
            <clipPath id="ola-floor-0">
              <rect x="0" y="0" width="460" height="226" />
            </clipPath>
          </defs>

          <circle cx="148" cy="134" r="86" fill="#ffc749" fillOpacity="0.28" />
          <circle cx="338" cy="112" r="64" fill="#626a9f" fillOpacity="0.16" />

          <g clipPath="url(#ola-floor-0)">
            <g transform="translate(148, 138) scale(0.95)">
              <g className="ola-rig-breathe">
                {/* 1. CABELLO TRASERO DETRÁS DEL CUELLO Y HOMBROS */}
                <CharacterBackHair hairStyle="wavy" hairColor="#1e2246" hairHighlight="#3e467d" />

                {/* 2. TORSO (Sin brazo izquierdo colgando porque ese brazo está levantado) */}
                <CharacterTorso
                  shirtColor="#626a9f"
                  shirtShadow="#454d82"
                  collarStyle="collared"
                  collarColor="#ffffff"
                  skinColor="#f4c5a3"
                  skinShadow="#da9e77"
                  leftArmRaised={true}
                  rightArmRaised={false}
                />

                {/* BRAZO IZQUIERDO ARTICULADO (Único brazo en ese lado, conectado al hombro) */}
                <g>
                  <path
                    d="M -24 18 C -45 20, -64 26, -68 38 C -71 48, -60 55, -48 52 C -38 49, -32 45, -31 35 Z"
                    fill="#626a9f"
                  />
                  <g className="ola-hand-headphone">
                    <path
                      d="M -66 36 C -66 18, -58 -4, -50 -19 L -37 -14 C -43 2, -49 22, -52 40 C -56 46, -65 44, -66 36 Z"
                      fill="#626a9f"
                    />
                    <path d="M -51 -17 L -36 -12 L -34 -17 L -49 -22 Z" fill="#ffc749" />
                    <path
                      d="M -47 -20 C -48 -32, -41 -40, -33 -38 C -28 -37, -28 -29, -31 -21 C -33 -16, -43 -14, -47 -20 Z"
                      fill="#f4c5a3"
                    />
                    <path d="M -35 -21 C -29 -23, -27 -29, -31 -31" stroke="#da9e77" strokeWidth="2" strokeLinecap="round" />
                    <path d="M -43 -30 L -35 -32 M -43 -25 L -35 -27" stroke="#da9e77" strokeWidth="1.6" strokeLinecap="round" />
                  </g>
                </g>

                {/* 3. CABEZA AL FRENTE */}
                <g className="ola-rig-head-listen">
                  <CharacterHead
                    skinColor="#f4c5a3"
                    skinShadow="#da9e77"
                    hairColor="#1e2246"
                    hairHighlight="#3e467d"
                    hairStyle="wavy"
                    expression="talk"
                    headphones
                    gazeX={2}
                  />
                </g>
              </g>
            </g>
          </g>

          <rect x="44" y="224" width="372" height="6" rx="3" fill="#626a9f" fillOpacity="0.2" />

          <g transform="translate(216, 108)">
            <g className="ola-bubble-float">
              <path d="M 0 -12 Q 10 0 0 12" stroke="#626a9f" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 11 -22 Q 26 0 11 22" stroke="#ffc749" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 23 -30 Q 42 0 23 30" stroke="#626a9f" strokeWidth="2.8" strokeLinecap="round" strokeOpacity="0.55" />
            </g>
          </g>

          <g transform="translate(262, 40)">
            <g className="ola-bubble-float" style={{ animationDelay: '0.25s' }}>
              <rect x="0" y="0" width="174" height="72" rx="22" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
              <path d="M 16 72 L 4 86 L 34 72 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" strokeLinejoin="round" />
              <rect x="14" y="67" width="22" height="7" fill="#ffffff" />

              <circle cx="24" cy="24" r="10" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
              <path d="M 21.5 20 L 28 24 L 21.5 28 Z" fill="#1e2246" />
              <rect x="42" y="19" width="4" height="10" rx="2" fill="#626a9f" className="ola-eq-pulse" />
              <rect x="49" y="14" width="4" height="20" rx="2" fill="#ffc749" className="ola-eq-pulse" style={{ animationDelay: '0.15s' }} />
              <rect x="56" y="18" width="4" height="12" rx="2" fill="#626a9f" className="ola-eq-pulse" style={{ animationDelay: '0.3s' }} />
              <rect x="63" y="13" width="4" height="22" rx="2" fill="#626a9f" className="ola-eq-pulse" style={{ animationDelay: '0.45s' }} />
              <text x="76" y="27" fill="#626a9f" fontSize="9.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
                AUDIO NATIVO
              </text>

              <text x="16" y="56" fill="#1e2246" fontSize="14" fontWeight="900" fontFamily="Montserrat, sans-serif">
                &ldquo;Nice to meet you!&rdquo;
              </text>
            </g>
          </g>

          <g transform="translate(274, 146)">
            <g className="ola-bubble-float" style={{ animationDelay: '0.7s' }}>
              <rect x="0" y="0" width="150" height="44" rx="22" fill="#454d82" />
              <circle cx="22" cy="22" r="11" fill="#16a37f" />
              <path d="M 17.5 22 L 20.8 25.5 L 27 18.5" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <text x="40" y="26" fill="#ffffff" fontSize="11.5" fontWeight="800" fontFamily="Montserrat, sans-serif">
                Clear &amp; natural!
              </text>
            </g>
          </g>
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 1: PRÁCTICA (Ambos brazos activos al frente) */}
      {/* ================================================== */}
      {stepIndex === 1 && (
        <svg
          key="scene-1"
          viewBox="0 0 460 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[460px] h-auto"
          aria-label="Estudiante practicando en su workbook digital con lápiz óptico y café"
        >
          <defs>
            <clipPath id="ola-desk-clip">
              <rect x="0" y="0" width="460" height="214" />
            </clipPath>
          </defs>

          <circle cx="174" cy="130" r="88" fill="#626a9f" fillOpacity="0.14" />
          <circle cx="96" cy="96" r="44" fill="#ffc749" fillOpacity="0.28" />

          <g clipPath="url(#ola-desk-clip)">
            <g transform="translate(172, 134) scale(0.88)">
              <g className="ola-rig-breathe">
                {/* 1. CABELLO TRASERO */}
                <CharacterBackHair hairStyle="bun" hairColor="#1e2246" hairHighlight="#3c4375" />

                {/* 2. TORSO (Sin brazos colgando — ambos brazos están al frente trabajando) */}
                <CharacterTorso
                  shirtColor="#ffc749"
                  shirtShadow="#e0a422"
                  collarStyle="collared"
                  collarColor="#ffffff"
                  skinColor="#d99b72"
                  skinShadow="#b8774e"
                  leftArmRaised={true}
                  rightArmRaised={true}
                />

                {/* BRAZO IZQUIERDO apoyado sobre el escritorio */}
                <g>
                  <path
                    d="M -25 18 C -46 24, -56 48, -46 68 C -36 82, -18 82, -10 72 C -6 66, -14 58, -26 56 C -33 54, -33 36, -25 18 Z"
                    fill="#ffc749"
                  />
                  <path
                    d="M -18 65 C -8 62, 4 65, 6 72 C 8 78, -2 82, -14 80 C -20 79, -24 68, -18 65 Z"
                    fill="#d99b72"
                  />
                </g>

                {/* BRAZO DERECHO sosteniendo el lápiz óptico */}
                <g>
                  <path
                    d="M 25 18 C 46 24, 62 44, 58 60 C 53 70, 40 70, 32 58 C 29 48, 30 32, 25 18 Z"
                    fill="#e0a422"
                  />
                  <g className="ola-hand-write">
                    <path
                      d="M 48 52 C 64 55, 82 54, 94 48 L 98 60 C 84 68, 64 72, 46 66 C 41 63, 42 54, 48 52 Z"
                      fill="#ffc749"
                    />
                    <path
                      d="M 92 48 C 102 45, 111 49, 112 56 C 113 62, 105 66, 96 63 C 91 61, 88 53, 92 48 Z"
                      fill="#d99b72"
                    />
                    <path d="M 103 60 L 122 38" stroke="#1e2246" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 103 60 L 98 66" stroke="#ffc749" strokeWidth="3.5" strokeLinecap="round" />
                  </g>
                </g>

                {/* 3. CABEZA */}
                <g className="ola-rig-head-nod">
                  <CharacterHead
                    skinColor="#d99b72"
                    skinShadow="#b8774e"
                    hairColor="#1e2246"
                    hairHighlight="#3c4375"
                    hairStyle="bun"
                    expression="smile"
                    glasses
                    gazeX={2.5}
                    blinkDelay="0.6s"
                  />
                </g>
              </g>
            </g>
          </g>

          <rect x="28" y="212" width="404" height="10" rx="5" fill="#626a9f" fillOpacity="0.24" />

          <g transform="translate(260, 128)">
            <rect x="0" y="0" width="144" height="84" rx="16" fill="#ffffff" stroke="#1e2246" strokeWidth="2.5" />
            <rect x="14" y="14" width="60" height="8" rx="4" fill="#626a9f" fillOpacity="0.32" />
            <rect x="14" y="31" width="116" height="10" rx="5" fill="#e8eaf7" />
            <rect x="14" y="31" width="96" height="10" rx="5" fill="#16a37f" />
            <rect x="14" y="51" width="54" height="20" rx="10" fill="#ffc749" />
            <path d="M 35 61 L 39.5 65.5 L 47.5 56.5" stroke="#1e2246" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="76" y="51" width="54" height="20" rx="10" fill="#626a9f" />
            <path d="M 97 61 L 101.5 65.5 L 109.5 56.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          <g transform="translate(52, 170)">
            <path d="M 0 6 H 32 V 32 C 32 38 27 42 21 42 H 11 C 5 42 0 38 0 32 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
            <path d="M 32 13 C 42 13, 42 31, 32 31" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
            <rect x="5" y="12" width="22" height="5" rx="2.5" fill="#626a9f" fillOpacity="0.2" />
            <path className="ola-steam-curl" d="M 10 -2 Q 6 -10 12 -16" stroke="#626a9f" strokeWidth="2.2" strokeLinecap="round" />
            <path className="ola-steam-curl" d="M 22 -3 Q 18 -11 24 -17" stroke="#ffc749" strokeWidth="2.2" strokeLinecap="round" style={{ animationDelay: '0.8s' }} />
          </g>

          <g transform="translate(342, 62)">
            <g className="ola-bubble-float">
              <circle cx="0" cy="0" r="24" fill="#ffc749" stroke="#1e2246" strokeWidth="2.4" />
              <path
                d="M 0 -11 C -7 -11 -11 -6 -11 0 C -11 4 -8.5 7 -6 9 L -6 12 H 6 L 6 9 C 8.5 7 11 4 11 0 C 11 -6 7 -11 0 -11 Z"
                fill="#ffffff"
                stroke="#1e2246"
                strokeWidth="2"
              />
              <path d="M -4 16 H 4" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 0 -33 V -28 M 28 -18 L 24 -14 M 32 4 H 27 M -28 -18 L -24 -14" stroke="#454d82" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 2: AGENDA (2 brazos limpios + cabello atrás) */}
      {/* ================================================== */}
      {stepIndex === 2 && (
        <svg
          key="scene-2"
          viewBox="0 0 460 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[460px] h-auto"
          aria-label="Estudiante coordinando horario flexible con un profesor en vivo"
        >
          <defs>
            <clipPath id="ola-floor-2">
              <rect x="0" y="0" width="460" height="224" />
            </clipPath>
          </defs>

          <circle cx="96" cy="144" r="66" fill="#ffc749" fillOpacity="0.24" />
          <circle cx="364" cy="144" r="66" fill="#626a9f" fillOpacity="0.18" />

          <path
            d="M 122 80 Q 230 24 338 80"
            stroke="#626a9f"
            strokeWidth="3.2"
            strokeDasharray="7 7"
            strokeLinecap="round"
            className="ola-dash-flow"
          />

          <g clipPath="url(#ola-floor-2)">
            {/* ESTUDIANTE (Brazo izquierdo abajo, brazo derecho haciendo pulgar arriba) */}
            <g transform="translate(94, 146) scale(0.84)">
              <g className="ola-rig-breathe">
                <CharacterBackHair hairStyle="short" hairColor="#1e2246" hairHighlight="#3d457c" />
                <CharacterTorso
                  shirtColor="#626a9f"
                  shirtShadow="#454d82"
                  collarStyle="crew"
                  collarColor="#ffc749"
                  skinColor="#f2c4a0"
                  skinShadow="#d69c73"
                  leftArmRaised={false}
                  rightArmRaised={true}
                />

                {/* Único brazo derecho conectado al hombro levantando pulgar arriba */}
                <g>
                  <path
                    d="M 24 18 C 44 20, 62 26, 67 38 C 70 46, 60 53, 49 50 C 39 47, 32 42, 31 33 Z"
                    fill="#626a9f"
                  />
                  <g className="ola-thumb-bounce">
                    <path
                      d="M 54 36 C 59 20, 66 6, 70 -4 L 82 0 C 79 13, 74 28, 68 42 C 64 48, 54 44, 54 36 Z"
                      fill="#626a9f"
                    />
                    <rect x="68" y="-16" width="18" height="17" rx="7" fill="#f2c4a0" />
                    <path d="M 70 -14 C 69 -24, 73 -32, 78 -31 C 82 -30, 82 -22, 79 -15 Z" fill="#f2c4a0" />
                    <path d="M 77 -11 H 84 M 77 -7 H 84 M 77 -3 H 83" stroke="#d69c73" strokeWidth="1.8" strokeLinecap="round" />
                  </g>
                </g>

                <g className="ola-rig-head-nod">
                  <CharacterHead
                    skinColor="#f2c4a0"
                    skinShadow="#d69c73"
                    hairColor="#1e2246"
                    hairHighlight="#3d457c"
                    hairStyle="short"
                    expression="smile"
                    gazeX={2.2}
                    blinkDelay="0.4s"
                  />
                </g>
              </g>
            </g>

            {/* PROFESORA (Cabello largo detrás del cuello/hombros + ambos brazos relajados) */}
            <g transform="translate(366, 146) scale(0.84)">
              <g className="ola-rig-breathe" style={{ animationDelay: '0.6s' }}>
                <CharacterBackHair hairStyle="locs" hairColor="#1e2246" hairHighlight="#3a4173" />
                <CharacterTorso
                  shirtColor="#ffc749"
                  shirtShadow="#dfa21e"
                  collarStyle="cardigan"
                  collarColor="#ffffff"
                  skinColor="#b87b56"
                  skinShadow="#965d3b"
                  leftArmRaised={false}
                  rightArmRaised={false}
                />
                <g className="ola-rig-head-nod" style={{ animationDelay: '0.8s' }}>
                  <CharacterHead
                    skinColor="#b87b56"
                    skinShadow="#965d3b"
                    hairColor="#1e2246"
                    hairHighlight="#3a4173"
                    hairStyle="locs"
                    expression="talk"
                    headset
                    gazeX={-2.2}
                    blinkDelay="1.3s"
                  />
                </g>
              </g>
            </g>
          </g>

          <rect x="34" y="222" width="392" height="6" rx="3" fill="#626a9f" fillOpacity="0.2" />

          <g transform="translate(182, 96)">
            <g className="ola-bubble-float">
              <rect x="0" y="0" width="96" height="90" rx="22" fill="#ffffff" stroke="#1e2246" strokeWidth="2.5" />
              <path d="M 0 22 C 0 10 10 0 22 0 H 74 C 86 0 96 10 96 22 V 29 H 0 Z" fill="#ffc749" />
              <text x="48" y="19" textAnchor="middle" fill="#1e2246" fontSize="10.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
                MIÉ • 7 PM
              </text>
              <circle cx="48" cy="59" r="19" fill="#16a37f" />
              <path d="M 40 59 L 46 65 L 57 53" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          <g transform="translate(298, 22)">
            <g className="ola-bubble-float" style={{ animationDelay: '0.5s' }}>
              <rect x="0" y="0" width="124" height="32" rx="16" fill="#1e2246" />
              <text x="62" y="20" textAnchor="middle" fill="#ffc749" fontSize="11" fontWeight="800" fontFamily="Montserrat, sans-serif">
                &ldquo;See you at 7!&rdquo;
              </text>
            </g>
          </g>
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 3: EN VIVO (Cabello atrás + solo 2 brazos)   */}
      {/* ================================================== */}
      {stepIndex === 3 && (
        <svg
          key="scene-3"
          viewBox="0 0 460 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[460px] h-auto"
          aria-label="Profesor y estudiante conversando cara a cara en clase 100% en vivo"
        >
          <defs>
            <clipPath id="ola-frame-left">
              <rect x="24" y="22" width="190" height="178" rx="28" />
            </clipPath>
            <clipPath id="ola-frame-right">
              <rect x="246" y="22" width="190" height="178" rx="28" />
            </clipPath>
          </defs>

          {/* INSTRUCTORA SALUDANDO */}
          <rect x="24" y="22" width="190" height="178" rx="28" fill="#626a9f" />
          <g clipPath="url(#ola-frame-left)">
            <circle cx="118" cy="138" r="76" fill="#ffffff" fillOpacity="0.09" />

            <g transform="translate(106, 140) scale(0.86)">
              <g className="ola-rig-breathe">
                {/* 1. Cabello largo detrás del cuello y hombros */}
                <CharacterBackHair hairStyle="wavy" hairColor="#1e2246" hairHighlight="#3c4375" />

                {/* 2. Torso (Sin brazo derecho colgando porque está saludando) */}
                <CharacterTorso
                  shirtColor="#ffc749"
                  shirtShadow="#e0a422"
                  collarStyle="collared"
                  collarColor="#ffffff"
                  skinColor="#e8b48e"
                  skinShadow="#cc9066"
                  leftArmRaised={false}
                  rightArmRaised={true}
                />

                {/* Único brazo derecho saludando conectado al hombro */}
                <g>
                  <path
                    d="M 24 18 C 44 18, 64 19, 73 25 C 79 31, 75 41, 64 43 C 52 45, 36 45, 31 36 Z"
                    fill="#ffc749"
                  />
                  <g className="ola-forearm-wave">
                    <path
                      d="M 64 31 C 69 14, 76 -2, 80 -14 L 92 -10 C 89 4, 84 20, 78 35 C 74 41, 63 39, 64 31 Z"
                      fill="#ffc749"
                    />
                    <path d="M 79 -12 L 93 -8 L 91 -3 L 77 -7 Z" fill="#ffffff" />
                    <path
                      d="M 79 -12 C 77 -21, 81 -28, 89 -28 C 96 -28, 100 -21, 97 -12 C 95 -7, 81 -7, 79 -12 Z"
                      fill="#e8b48e"
                    />
                    <path d="M 80 -15 C 73 -18, 72 -25, 76 -27 C 79 -28, 82 -23, 83 -19 Z" fill="#e8b48e" />
                    <path d="M 81 -25 L 79 -37 C 79 -40, 84 -40, 84 -37 L 85 -26 Z" fill="#e8b48e" />
                    <path d="M 85 -27 L 85 -40 C 85 -43, 90 -43, 90 -40 L 89 -27 Z" fill="#e8b48e" />
                    <path d="M 89 -26 L 91 -38 C 92 -41, 96 -40, 96 -37 L 93 -25 Z" fill="#e8b48e" />
                    <path d="M 93 -23 L 97 -33 C 98 -35, 102 -34, 101 -31 L 96 -20 Z" fill="#e8b48e" />
                  </g>
                </g>

                {/* 3. Cabeza */}
                <g className="ola-rig-head-nod">
                  <CharacterHead
                    skinColor="#e8b48e"
                    skinShadow="#cc9066"
                    hairColor="#1e2246"
                    hairHighlight="#3c4375"
                    hairStyle="wavy"
                    expression="talk"
                    gazeX={2}
                  />
                </g>
              </g>
            </g>

            <rect x="38" y="36" width="70" height="24" rx="12" fill="#1e2246" fillOpacity="0.45" />
            <circle cx="51" cy="48" r="4.5" fill="#ee665b" className="ola-eq-pulse" />
            <text x="62" y="51.5" fill="#ffffff" fontSize="9.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
              EN VIVO
            </text>
          </g>
          <rect x="24" y="22" width="190" height="178" rx="28" stroke="#1e2246" strokeWidth="2.6" />

          {/* ESTUDIANTE CONVERSANDO */}
          <rect x="246" y="22" width="190" height="178" rx="28" fill="#fff3d1" />
          <g clipPath="url(#ola-frame-right)">
            <circle cx="341" cy="138" r="76" fill="#ffc749" fillOpacity="0.28" />

            <g transform="translate(341, 140) scale(0.86)">
              <g className="ola-rig-breathe" style={{ animationDelay: '0.5s' }}>
                <CharacterBackHair hairStyle="curly" hairColor="#1e2246" hairHighlight="#3c4375" />
                <CharacterTorso
                  shirtColor="#454d82"
                  shirtShadow="#2d3361"
                  collarStyle="crew"
                  collarColor="#ffffff"
                  skinColor="#ce926c"
                  skinShadow="#ad714c"
                  leftArmRaised={false}
                  rightArmRaised={false}
                />
                <g className="ola-rig-head-listen" style={{ animationDelay: '0.4s' }}>
                  <CharacterHead
                    skinColor="#ce926c"
                    skinShadow="#ad714c"
                    hairColor="#1e2246"
                    hairHighlight="#3c4375"
                    hairStyle="curly"
                    expression="talk"
                    gazeX={-2}
                    blinkDelay="1.1s"
                  />
                </g>
              </g>
            </g>
          </g>
          <rect x="246" y="22" width="190" height="178" rx="28" stroke="#1e2246" strokeWidth="2.6" />

          <g transform="translate(230, 111)">
            <g className="ola-bubble-float">
              <circle cx="0" cy="0" r="24" fill="#ffffff" stroke="#1e2246" strokeWidth="2.6" />
              <rect x="-13" y="-6" width="4" height="12" rx="2" fill="#626a9f" className="ola-eq-pulse" />
              <rect x="-6" y="-12" width="4" height="24" rx="2" fill="#ffc749" className="ola-eq-pulse" style={{ animationDelay: '0.15s' }} />
              <rect x="1" y="-9" width="4" height="18" rx="2" fill="#16a37f" className="ola-eq-pulse" style={{ animationDelay: '0.3s' }} />
              <rect x="8" y="-5" width="4" height="10" rx="2" fill="#626a9f" className="ola-eq-pulse" style={{ animationDelay: '0.45s' }} />
            </g>
          </g>

          <g transform="translate(138, 184)">
            <rect x="0" y="0" width="184" height="34" rx="17" fill="#16a37f" stroke="#1e2246" strokeWidth="2.4" />
            <text x="92" y="21" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
              &ldquo;Great pronunciation!&rdquo;
            </text>
          </g>
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 4: COMUNIDAD (3 compañeros, 2 brazos c/u)    */}
      {/* ================================================== */}
      {stepIndex === 4 && (
        <svg
          key="scene-4"
          viewBox="0 0 460 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[460px] h-auto"
          aria-label="Comunidad de estudiantes conversando juntos en inglés"
        >
          <defs>
            <clipPath id="ola-floor-4">
              <rect x="0" y="0" width="460" height="224" />
            </clipPath>
          </defs>

          <circle cx="230" cy="136" r="92" fill="#ffc749" fillOpacity="0.22" />
          <circle cx="230" cy="136" r="70" stroke="#626a9f" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.32" />

          <g clipPath="url(#ola-floor-4)">
            {/* COMPAÑERO IZQUIERDO */}
            <g transform="translate(106, 152) scale(0.78)">
              <g className="ola-rig-breathe">
                <CharacterBackHair hairStyle="short" hairColor="#1e2246" hairHighlight="#3d457c" />
                <CharacterTorso
                  shirtColor="#626a9f"
                  shirtShadow="#454d82"
                  collarStyle="collared"
                  collarColor="#ffffff"
                  skinColor="#f4c5a3"
                  skinShadow="#da9e77"
                  leftArmRaised={false}
                  rightArmRaised={false}
                />
                <g className="ola-rig-head-nod">
                  <CharacterHead
                    skinColor="#f4c5a3"
                    skinShadow="#da9e77"
                    hairColor="#1e2246"
                    hairHighlight="#3d457c"
                    hairStyle="short"
                    expression="laugh"
                    gazeX={2.5}
                    blinkDelay="0.2s"
                  />
                </g>
              </g>
            </g>

            {/* COMPAÑERA DERECHA */}
            <g transform="translate(354, 152) scale(0.78)">
              <g className="ola-rig-breathe" style={{ animationDelay: '0.7s' }}>
                <CharacterBackHair hairStyle="bun" hairColor="#1e2246" hairHighlight="#3a4173" />
                <CharacterTorso
                  shirtColor="#ee665b"
                  shirtShadow="#c94b41"
                  collarStyle="crew"
                  collarColor="#fff3d1"
                  skinColor="#b87b56"
                  skinShadow="#965d3b"
                  leftArmRaised={false}
                  rightArmRaised={false}
                />
                <g className="ola-rig-head-nod" style={{ animationDelay: '0.6s' }}>
                  <CharacterHead
                    skinColor="#b87b56"
                    skinShadow="#965d3b"
                    hairColor="#1e2246"
                    hairHighlight="#3a4173"
                    hairStyle="bun"
                    expression="smile"
                    glasses
                    gazeX={-2.5}
                    blinkDelay="1.5s"
                  />
                </g>
              </g>
            </g>

            {/* COMPAÑERO CENTRAL (Brazo izquierdo abajo, brazo derecho gesticulando) */}
            <g transform="translate(230, 148) scale(0.84)">
              <g className="ola-rig-breathe" style={{ animationDelay: '0.35s' }}>
                <CharacterBackHair hairStyle="curly" hairColor="#1e2246" hairHighlight="#483f66" />
                <CharacterTorso
                  shirtColor="#ffc749"
                  shirtShadow="#e0a422"
                  collarStyle="cardigan"
                  collarColor="#ffffff"
                  skinColor="#e2aa84"
                  skinShadow="#c28760"
                  leftArmRaised={false}
                  rightArmRaised={true}
                />

                {/* Único brazo derecho gesticulando */}
                <g>
                  <path
                    d="M 24 18 C 44 21, 61 28, 65 41 C 68 50, 58 56, 48 52 C 39 48, 32 42, 31 33 Z"
                    fill="#ffc749"
                  />
                  <g className="ola-gesture-chat">
                    <path
                      d="M 52 40 C 60 26, 70 14, 78 6 L 88 14 C 80 26, 72 38, 64 48 C 59 52, 50 48, 52 40 Z"
                      fill="#ffc749"
                    />
                    <path
                      d="M 76 4 C 78 -4, 86 -9, 93 -5 C 99 -1, 98 8, 91 13 C 86 16, 75 12, 76 4 Z"
                      fill="#e2aa84"
                    />
                    <path d="M 80 -2 C 76 -8, 79 -14, 83 -13 C 86 -12, 86 -7, 85 -4 Z" fill="#e2aa84" />
                    <path d="M 86 -6 L 92 -14 C 94 -16, 97 -13, 95 -10 L 90 -3 Z" fill="#e2aa84" />
                    <path d="M 90 -2 L 98 -8 C 101 -10, 103 -6, 100 -4 L 93 2 Z" fill="#e2aa84" />
                  </g>
                </g>

                <g className="ola-rig-head-listen">
                  <CharacterHead
                    skinColor="#e2aa84"
                    skinShadow="#c28760"
                    hairColor="#1e2246"
                    hairHighlight="#483f66"
                    hairStyle="curly"
                    expression="talk"
                    blinkDelay="0.9s"
                  />
                </g>
              </g>
            </g>
          </g>

          <rect x="38" y="222" width="384" height="6" rx="3" fill="#626a9f" fillOpacity="0.2" />

          <g transform="translate(62, 26)">
            <g className="ola-bubble-float">
              <rect x="0" y="0" width="118" height="36" rx="18" fill="#ffffff" stroke="#1e2246" strokeWidth="2.3" />
              <path d="M 42 36 L 36 47 L 56 36 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.3" strokeLinejoin="round" />
              <rect x="40" y="32" width="18" height="6" fill="#ffffff" />
              <text x="59" y="22" textAnchor="middle" fill="#1e2246" fontSize="12" fontWeight="900" fontFamily="Montserrat, sans-serif">
                &ldquo;Let&apos;s chat!&rdquo;
              </text>
            </g>
          </g>

          <g transform="translate(274, 22)">
            <g className="ola-bubble-float" style={{ animationDelay: '0.5s' }}>
              <rect x="0" y="0" width="136" height="36" rx="18" fill="#454d82" stroke="#1e2246" strokeWidth="2.3" />
              <path d="M 66 36 L 74 47 L 52 36 Z" fill="#454d82" stroke="#1e2246" strokeWidth="2.3" strokeLinejoin="round" />
              <rect x="51" y="32" width="18" height="6" fill="#454d82" />
              <text x="68" y="22" textAnchor="middle" fill="#ffc749" fontSize="12" fontWeight="900" fontFamily="Montserrat, sans-serif">
                &ldquo;Count me in!&rdquo;
              </text>
            </g>
          </g>
        </svg>
      )}
    </div>
  );
}