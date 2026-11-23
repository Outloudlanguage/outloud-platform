import React from 'react';

// ==========================================================
// REUSABLE ANATOMICAL PARTS (Sculpted Jaw, Tapered Neck,
// Cast Chin Shadow, Real Collars, Blinking Eyes & Hair)
// Local origin (0, 0) = Base of chin / top of neck
// ==========================================================

function CharacterTorso({
  shirtColor = '#626a9f',
  shirtShadow = '#4c548a',
  collarStyle = 'crew', // 'crew' | 'collared' | 'cardigan'
  collarColor = '#ffffff',
  skinColor = '#f4c5a3',
  skinShadow = '#da9e77',
}) {
  return (
    <g>
      {/* Tapered Neck Flowing into Trapezius (Zero Floating Pegs) */}
      <path
        d="M -10 -14 L 10 -14 C 10 -2, 13 9, 20 18 L 20 26 L -20 26 L -20 18 C -13 9, -10 -2, -10 -14 Z"
        fill={skinColor}
      />
      {/* Cast Shadow Directly Under the Jawline */}
      <path
        d="M -10.5 -12 L 10.5 -12 C 10.5 -3, 11 1, 11.5 4 C 4.5 9, -4.5 9, -11.5 4 C -11 1, -10.5 -3, -10.5 -12 Z"
        fill={skinShadow}
      />

      {/* Sculpted Sloping Shoulders & Upper Torso */}
      <path
        d="M -19 15 C -37 17, -51 25, -55 46 L -52 96 L 52 96 L 55 46 C 51 25, 37 17, 19 15 Q 0 28 -19 15 Z"
        fill={shirtColor}
      />
      {/* Subtle Cel-Shading Along Right Shoulder / Side */}
      <path
        d="M 28 19 C 43 24, 52 33, 55 46 L 52 96 L 34 96 L 36 44 C 36 32, 33 24, 28 19 Z"
        fill={shirtShadow}
        fillOpacity="0.45"
      />
      {/* Natural Armpit / Sleeve Seam Lines */}
      <path
        d="M -37 46 Q -35 68 -37 94"
        stroke={shirtShadow}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M 37 46 Q 35 68 37 94"
        stroke={shirtShadow}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Collar Variations */}
      {collarStyle === 'crew' && (
        <path
          d="M -20 14 Q 0 30 20 14 L 22 20 Q 0 36 -22 20 Z"
          fill={collarColor}
          opacity="0.92"
        />
      )}

      {collarStyle === 'collared' && (
        <g>
          {/* Crisp White Under-Collar Lapels */}
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
          {/* White Inner Tee V-Cut + Cardigan Lapels */}
          <path d="M -19 14 L 0 46 L 19 14 Q 0 25 -19 14 Z" fill={collarColor} />
          <path
            d="M -22 14 L -3 50 L -3 96 L -12 96 L -12 52 L -26 17 Z"
            fill={shirtShadow}
            opacity="0.55"
          />
          <path
            d="M 22 14 L 3 50 L 3 96 L 12 96 L 12 52 L 26 17 Z"
            fill={shirtShadow}
            opacity="0.55"
          />
        </g>
      )}
    </g>
  );
}

function CharacterHead({
  skinColor = '#f4c5a3',
  skinShadow = '#da9e77',
  hairColor = '#1e2246',
  hairHighlight = '#363d73',
  hairStyle = 'wavy', // 'wavy' | 'bun' | 'short' | 'locs' | 'curly'
  expression = 'talk', // 'talk' | 'smile' | 'laugh'
  glasses = false,
  headphones = false,
  headset = false,
  gazeX = 0, // -2 to +2 subtle gaze direction
  blinkDelay = '0s',
}) {
  return (
    <g>
      {/* BACK HAIR LAYER (Volume behind ears & neck) */}
      {hairStyle === 'wavy' && (
        <path
          d="M -34 -34 C -38 -62, -22 -76, 0 -76 C 22 -76, 38 -62, 34 -34 C 36 -14, 38 2, 26 8 C 18 11, -18 11, -26 8 C -38 2, -36 -14, -34 -34 Z"
          fill={hairColor}
        />
      )}
      {hairStyle === 'bun' && (
        <g>
          <circle cx="-12" cy="-76" r="16" fill={hairColor} />
          <path d="M -24 -76 Q -12 -86 0 -76" stroke={hairHighlight} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <ellipse cx="0" cy="-42" rx="33" ry="32" fill={hairColor} />
        </g>
      )}
      {hairStyle === 'short' && (
        <path
          d="M -30 -38 C -31 -62, -16 -72, 2 -72 C 20 -72, 32 -60, 30 -36 L 26 -24 L -26 -24 Z"
          fill={hairColor}
        />
      )}
      {hairStyle === 'locs' && (
        <g>
          <path
            d="M -34 -36 C -36 -64, -20 -74, 0 -74 C 20 -74, 36 -64, 34 -36 L 34 -2 C 34 6, 26 10, 20 6 L -20 6 C -26 10, -34 6, -34 -2 Z"
            fill={hairColor}
          />
          <circle cx="-30" cy="-10" r="6" fill={hairColor} />
          <circle cx="30" cy="-10" r="6" fill={hairColor} />
          <circle cx="-26" cy="2" r="5.5" fill={hairColor} />
          <circle cx="26" cy="2" r="5.5" fill={hairColor} />
        </g>
      )}
      {hairStyle === 'curly' && (
        <g fill={hairColor}>
          <circle cx="-22" cy="-58" r="16" />
          <circle cx="0" cy="-65" r="18" />
          <circle cx="22" cy="-58" r="16" />
          <circle cx="-28" cy="-42" r="12" />
          <circle cx="28" cy="-42" r="12" />
        </g>
      )}

      {/* SCULPTED EARS WITH INNER CONTOUR */}
      <g>
        <path d="M -25 -35 C -33 -36, -34 -21, -25 -19 Z" fill={skinColor} />
        <path d="M -27 -30 Q -30 -27 -27 -23" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 25 -35 C 33 -36, 34 -21, 25 -19 Z" fill={skinColor} />
        <path d="M 27 -30 Q 30 -27 27 -23" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* SCULPTED OVAL-TAPERED JAW & FACE (Not a plain circle!) */}
      <path
        d="M -26 -35 C -26 -55, -16 -65, 0 -65 C 16 -65, 26 -55, 26 -35 C 26 -17, 19 -5, 9 -1 C 3 1.5, -3 1.5, -9 -1 C -19 -5, -26 -17, -26 -35 Z"
        fill={skinColor}
      />

      {/* Subtle Cheekbone Warmth */}
      <ellipse cx={-16 + gazeX * 0.5} cy="-21" rx="5.2" ry="2.7" fill="#ee665b" fillOpacity="0.22" />
      <ellipse cx={16 + gazeX * 0.5} cy="-21" rx="5.2" ry="2.7" fill="#ee665b" fillOpacity="0.22" />

      {/* FACIAL FEATURES */}
      <g transform={`translate(${gazeX}, 0)`}>
        {/* Expressive Eyebrows */}
        <path
          d="M -16 -39 Q -11 -43 -5.5 -40"
          stroke={hairColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 5.5 -40 Q 11 -43 16 -39"
          stroke={hairColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Animated Blinking Eyes */}
        <g className="ola-rig-blink" style={{ animationDelay: blinkDelay }}>
          {expression === 'laugh' ? (
            <>
              <path d="M -15 -30 Q -11 -35 -7 -30" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 7 -30 Q 11 -35 15 -30" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="-11" cy="-30" rx="3.1" ry="3.7" fill="#1e2246" />
              <circle cx="-9.9" cy="-31.4" r="1.15" fill="#ffffff" />
              <ellipse cx="11" cy="-30" rx="3.1" ry="3.7" fill="#1e2246" />
              <circle cx="12.1" cy="-31.4" r="1.15" fill="#ffffff" />
            </>
          )}
        </g>

        {/* Subtle Editorial Nose */}
        <path
          d="M 0 -30 C -2 -24, -2.5 -21.5, 2.2 -20.5"
          stroke={skinShadow}
          strokeWidth="2.1"
          strokeLinecap="round"
          fill="none"
        />

        {/* Expressive Mouth (Animated Talking vs Warm Grin) */}
        {expression === 'talk' ? (
          <g className="ola-rig-talk">
            <path
              d="M -9 -13 Q 0 -11.5 9 -13 C 9 -4, 4 -2, 0 -2 C -4 -2, -9 -4, -9 -13 Z"
              fill="#3d2236"
            />
            <path
              d="M -7.5 -12.3 Q 0 -11 7.5 -12.3 L 6.6 -9.6 Q 0 -8.7 -6.6 -9.6 Z"
              fill="#ffffff"
            />
            <path
              d="M -4.2 -4.6 Q 0 -7.2 4.2 -4.6 Q 0 -2.2 -4.2 -4.6 Z"
              fill="#ee665b"
            />
          </g>
        ) : (
          <path
            d="M -9 -12.5 Q 0 -5.5 10 -13.5"
            stroke="#1e2246"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Stylish Glasses (Optional) */}
        {glasses && (
          <g>
            <rect x="-20.5" y="-37" width="18" height="13.5" rx="6" stroke="#1e2246" strokeWidth="2.1" fill="#ffffff" fillOpacity="0.22" />
            <rect x="2.5" y="-37" width="18" height="13.5" rx="6" stroke="#1e2246" strokeWidth="2.1" fill="#ffffff" fillOpacity="0.22" />
            <path d="M -2.5 -30.5 H 2.5" stroke="#1e2246" strokeWidth="2.1" />
          </g>
        )}
      </g>

      {/* FRONT HAIR / SWEEPING BANGS WITH HIGHLIGHT */}
      {hairStyle === 'wavy' && (
        <g>
          <path
            d="M -27 -42 C -24 -64, -4 -72, 16 -64 C 25 -60, 29 -48, 27 -38 C 18 -51, -2 -54, -27 -42 Z"
            fill={hairColor}
          />
          <path
            d="M -14 -59 Q 2 -65 16 -56"
            stroke={hairHighlight}
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </g>
      )}
      {hairStyle === 'bun' && (
        <path
          d="M -27 -40 C -22 -64, 10 -70, 27 -46 C 14 -54, -10 -53, -27 -40 Z"
          fill={hairColor}
        />
      )}
      {hairStyle === 'short' && (
        <g>
          <path
            d="M -27 -42 C -25 -65, -2 -74, 22 -62 C 29 -58, 30 -47, 26 -40 C 16 -52, -6 -54, -27 -42 Z"
            fill={hairColor}
          />
          <path d="M -10 -61 Q 6 -66 19 -56" stroke={hairHighlight} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65" />
        </g>
      )}
      {hairStyle === 'locs' && (
        <path
          d="M -27 -41 C -22 -64, 22 -64, 27 -41 C 14 -53, -14 -53, -27 -41 Z"
          fill={hairColor}
        />
      )}
      {hairStyle === 'curly' && (
        <path
          d="M -26 -42 C -20 -58, 20 -58, 26 -42 C 16 -49, 8 -46, 0 -51 C -8 -46, -16 -49, -26 -42 Z"
          fill={hairColor}
        />
      )}

      {/* OUTLOUD BRAND HEADPHONES (Optional) */}
      {headphones && (
        <g>
          <path
            d="M -32 -32 C -32 -78, 32 -78, 32 -32"
            stroke="#ffc749"
            strokeWidth="7.5"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="-38" y="-42" width="12" height="27" rx="6" fill="#454d82" stroke="#1e2246" strokeWidth="2" />
          <rect x="26" y="-42" width="12" height="27" rx="6" fill="#454d82" stroke="#1e2246" strokeWidth="2" />
          <rect x="-34.5" y="-34" width="4.5" height="11" rx="2.2" fill="#ffc749" />
          <rect x="30" y="-34" width="4.5" height="11" rx="2.2" fill="#ffc749" />
        </g>
      )}

      {/* SLIM STUDIO HEADSET MIC (Optional) */}
      {headset && (
        <g>
          <path
            d="M -29 -32 C -29 -72, 29 -72, 29 -32"
            stroke="#454d82"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
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
// MAIN EXPORT: 5 ANIMATED HUMAN EDITORIAL SCENES
// ==========================================================
export default function OutLoudCycleScene({ stepIndex }) {
  return (
    <div className="w-full flex items-center justify-center">
      <style>{`
        /* HIERARCHICAL CHARACTER RIGGING ANIMATIONS */
        @keyframes olaSceneIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaRigBlink {
          0%, 44%, 48%, 94%, 98%, 100% { transform: scaleY(1); }
          46%, 96% { transform: scaleY(0.08); }
        }
        @keyframes olaRigHeadNod {
          0%, 100% { transform: rotate(-2.5deg) translateY(0px); }
          35% { transform: rotate(3.2deg) translateY(-1.5px); }
          70% { transform: rotate(-1deg) translateY(0.5px); }
        }
        @keyframes olaRigHeadListen {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
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
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes olaHandWrite {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          30% { transform: translate(-4px, 2px) rotate(-6deg); }
          65% { transform: translate(3px, -2px) rotate(4deg); }
        }
        @keyframes olaHandTap {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes olaThumbBounce {
          0%, 100% { transform: rotate(0deg) translateY(0px); }
          40% { transform: rotate(-9deg) translateY(-3px); }
        }
        @keyframes olaGestureChat {
          0%, 100% { transform: rotate(-4deg) translateY(0px); }
          50% { transform: rotate(7deg) translateY(-3px); }
        }
        @keyframes olaBubbleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes olaEqPulse {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        @keyframes olaSteamCurl {
          0% { opacity: 0; transform: translateY(5px); }
          50% { opacity: 0.85; transform: translateY(-3px); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes olaDashFlow {
          to { stroke-dashoffset: -28; }
        }

        .ola-scene-in {
          animation: olaSceneIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ola-rig-breathe {
          animation: olaRigBreathe 3.8s ease-in-out infinite;
        }
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
          transform-origin: 82% 75%;
          animation: olaHandWrite 2.1s ease-in-out infinite;
        }
        .ola-hand-headphone {
          transform-box: fill-box;
          transform-origin: 18% 85%;
          animation: olaHandTap 3.4s ease-in-out infinite;
        }
        .ola-thumb-bounce {
          transform-box: fill-box;
          transform-origin: 22% 85%;
          animation: olaThumbBounce 2.2s ease-in-out infinite;
        }
        .ola-gesture-chat {
          transform-box: fill-box;
          transform-origin: 25% 88%;
          animation: olaGestureChat 2.4s ease-in-out infinite;
        }
        .ola-bubble-float {
          animation: olaBubbleFloat 3.4s ease-in-out infinite;
        }
        .ola-eq-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaEqPulse 1s ease-in-out infinite;
        }
        .ola-steam-curl {
          animation: olaSteamCurl 2.4s ease-in-out infinite;
        }
        .ola-dash-flow {
          animation: olaDashFlow 1.6s linear infinite;
        }
      `}</style>

      {/* ================================================== */}
      {/* SCENE 0: LIVE LAB — LISTENING & SPEAKING OUTLOUD   */}
      {/* ================================================== */}
      {stepIndex === 0 && (
        <svg
          key="scene-0"
          viewBox="0 0 440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[450px] h-auto overflow-visible"
          aria-label="Estudiante escuchando y practicando pronunciación en Live Lab"
        >
          {/* Ambient Composition Halos */}
          <circle cx="152" cy="132" r="88" fill="#ffc749" fillOpacity="0.26" />
          <circle cx="322" cy="108" r="62" fill="#626a9f" fillOpacity="0.16" />

          {/* HUMAN CHARACTER (Sculpted Anatomy + Connected Arm Touching Headphone) */}
          <g transform="translate(152, 134)" className="ola-rig-breathe">
            <CharacterTorso
              shirtColor="#626a9f"
              shirtShadow="#454d82"
              collarStyle="collared"
              collarColor="#ffffff"
              skinColor="#f4c5a3"
              skinShadow="#da9e77"
            />

            {/* Articulated Left Arm Reaching Naturally Up to Left Headphone Cup */}
            <g>
              {/* Upper Arm anchored cleanly inside left shoulder (-42, 34) -> elbow (-66, 36) */}
              <path
                d="M -38 25 C -56 26, -70 30, -72 41 C -74 50, -64 56, -54 53 C -45 50, -37 46, -34 38 Z"
                fill="#626a9f"
              />
              <path
                d="M -40 44 C -50 48, -62 50, -68 46"
                stroke="#454d82"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.5"
              />
              {/* Nested Forearm + Hand Gently Resting on Headphone Earcup */}
              <g className="ola-hand-headphone">
                {/* Sleeve Forearm */}
                <path
                  d="M -70 38 C -69 20, -60 -2, -52 -18 L -39 -13 C -45 3, -51 22, -54 40 C -58 46, -68 46, -70 38 Z"
                  fill="#626a9f"
                />
                {/* Crisp Cuff */}
                <path d="M -53 -16 L -38 -11 L -36 -16 L -51 -21 Z" fill="#ffc749" />
                {/* Sculpted Hand (Palm + Distinct Thumb & Curled Fingers on Earcup) */}
                <path
                  d="M -49 -19 C -50 -31, -43 -39, -35 -37 C -30 -36, -30 -28, -33 -20 C -35 -15, -45 -13, -49 -19 Z"
                  fill="#f4c5a3"
                />
                {/* Thumb Tucked Inward */}
                <path
                  d="M -37 -20 C -31 -22, -29 -28, -33 -30"
                  stroke="#da9e77"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Subtle Finger Separation Creases */}
                <path d="M -45 -29 L -37 -31 M -45 -24 L -37 -26" stroke="#da9e77" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            </g>

            {/* Animated Head Pivoting Naturally at Neck Base */}
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

          {/* Animated Acoustic Waves Flowing Out */}
          <g className="ola-bubble-float">
            <path d="M 216 96 Q 226 108 216 120" stroke="#626a9f" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 227 86 Q 242 108 227 130" stroke="#ffc749" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 239 78 Q 258 108 239 138" stroke="#626a9f" strokeWidth="2.8" strokeLinecap="round" strokeOpacity="0.55" />
          </g>

          {/* Expressive English Speech Bubble */}
          <g className="ola-bubble-float" style={{ animationDelay: '0.3s' }}>
            <rect x="258" y="42" width="166" height="68" rx="22" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
            <path d="M 274 110 L 260 126 L 292 110 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" strokeLinejoin="round" />
            <rect x="272" y="105" width="22" height="7" fill="#ffffff" />

            <circle cx="282" cy="66" r="10" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
            <path d="M 279.5 62 L 286 66 L 279.5 70 Z" fill="#1e2246" />
            <rect x="300" y="61" width="4" height="10" rx="2" fill="#626a9f" className="ola-eq-pulse" />
            <rect x="307" y="56" width="4" height="20" rx="2" fill="#ffc749" className="ola-eq-pulse" style={{ animationDelay: '0.15s' }} />
            <rect x="314" y="60" width="4" height="12" rx="2" fill="#626a9f" className="ola-eq-pulse" style={{ animationDelay: '0.3s' }} />
            <rect x="321" y="55" width="4" height="22" rx="2" fill="#626a9f" className="ola-eq-pulse" style={{ animationDelay: '0.45s' }} />
            <rect x="328" y="61" width="4" height="10" rx="2" fill="#ffc749" className="ola-eq-pulse" style={{ animationDelay: '0.6s' }} />

            <text x="272" y="96" fill="#1e2246" fontSize="14" fontWeight="900" fontFamily="Montserrat, sans-serif">
              &ldquo;Nice to meet you!&rdquo;
            </text>
          </g>

          {/* Voice Confidence Feedback Chip */}
          <g className="ola-bubble-float" style={{ animationDelay: '0.7s' }}>
            <rect x="270" y="144" width="144" height="42" rx="21" fill="#454d82" />
            <circle cx="292" cy="165" r="11" fill="#16a37f" />
            <path d="M 287.5 165 L 290.8 168.5 L 297 161.5" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <text x="310" y="169" fill="#ffffff" fontSize="11.5" fontWeight="800" fontFamily="Montserrat, sans-serif">
              Clear &amp; natural!
            </text>
          </g>
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 1: PRÁCTICA — RELAXED STUDY + STYLUS WRITING */}
      {/* ================================================== */}
      {stepIndex === 1 && (
        <svg
          key="scene-1"
          viewBox="0 0 440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[450px] h-auto overflow-visible"
          aria-label="Estudiante practicando en su workbook digital con lápiz óptico y café"
        >
          <circle cx="195" cy="126" r="90" fill="#626a9f" fillOpacity="0.14" />
          <circle cx="105" cy="86" r="46" fill="#ffc749" fillOpacity="0.28" />

          {/* HUMAN CHARACTER: Relaxed Student with Bun, Glasses & Cozy Yellow Sweater */}
          <g transform="translate(172, 128)" className="ola-rig-breathe">
            <CharacterTorso
              shirtColor="#ffc749"
              shirtShadow="#e0a422"
              collarStyle="collared"
              collarColor="#ffffff"
              skinColor="#d99b72"
              skinShadow="#b8774e"
            />

            {/* Animated Head Looking Slightly Right Toward Workbook */}
            <g className="ola-rig-head-nod">
              <CharacterHead
                skinColor="#d99b72"
                skinShadow="#b8774e"
                hairColor="#1e2246"
                hairHighlight="#3c4375"
                hairStyle="bun"
                expression="smile"
                glasses
                gazeX={2}
                blinkDelay="0.6s"
              />
            </g>

            {/* Left Arm Naturally Resting Forward Toward Desk */}
            <path
              d="M -38 26 C -54 34, -56 58, -42 70 C -30 78, -14 76, -8 66 C -4 58, -12 46, -24 44 C -30 42, -32 34, -38 26 Z"
              fill="#ffc749"
            />
            <circle cx="-12" cy="64" r="9" fill="#d99b72" />

            {/* Right Articulated Arm + Stylus Hand Writing on Workbook */}
            <g>
              {/* Upper Right Sleeve */}
              <path
                d="M 38 25 C 55 32, 66 48, 60 62 C 54 72, 42 70, 36 58 C 33 48, 34 34, 38 25 Z"
                fill="#e0a422"
              />
              {/* Animated Writing Forearm + Stylus Hand */}
              <g className="ola-hand-write">
                <path
                  d="M 52 54 C 66 56, 82 54, 94 48 L 98 60 C 84 68, 66 72, 50 68 C 44 65, 46 55, 52 54 Z"
                  fill="#ffc749"
                />
                {/* Sculpted Hand Holding Stylus */}
                <path
                  d="M 92 48 C 102 45, 111 49, 112 56 C 113 62, 105 66, 96 63 C 91 61, 88 53, 92 48 Z"
                  fill="#d99b72"
                />
                {/* Sleek Stylus Pen */}
                <path
                  d="M 103 60 L 122 38"
                  stroke="#1e2246"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 103 60 L 98 66"
                  stroke="#ffc749"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>

          {/* Clean Frosted Desk Line */}
          <rect x="28" y="210" width="384" height="10" rx="5" fill="#626a9f" fillOpacity="0.22" />

          {/* Tilted Interactive Workbook Tablet on Desk */}
          <g transform="translate(244, 128)">
            <rect x="0" y="0" width="136" height="84" rx="16" fill="#ffffff" stroke="#1e2246" strokeWidth="2.6" />
            <rect x="14" y="14" width="56" height="8" rx="4" fill="#626a9f" fillOpacity="0.32" />
            {/* Progress Track */}
            <rect x="14" y="31" width="108" height="10" rx="5" fill="#e8eaf7" />
            <rect x="14" y="31" width="90" height="10" rx="5" fill="#16a37f" />
            {/* Completed Answer Pills */}
            <rect x="14" y="51" width="50" height="20" rx="10" fill="#ffc749" />
            <path d="M 33 61 L 37.5 65.5 L 45.5 56.5" stroke="#1e2246" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="72" y="51" width="50" height="20" rx="10" fill="#626a9f" />
            <path d="M 91 61 L 95.5 65.5 L 103.5 56.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Warm Ceramic Coffee Mug + Rising Steam */}
          <g transform="translate(56, 168)">
            <path d="M 0 6 H 32 V 32 C 32 38 27 42 21 42 H 11 C 5 42 0 38 0 32 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
            <path d="M 32 13 C 42 13, 42 31, 32 31" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
            <rect x="5" y="12" width="22" height="5" rx="2.5" fill="#626a9f" fillOpacity="0.2" />
            <path className="ola-steam-curl" d="M 10 -2 Q 6 -10 12 -16" stroke="#626a9f" strokeWidth="2.2" strokeLinecap="round" />
            <path className="ola-steam-curl" d="M 22 -3 Q 18 -11 24 -17" stroke="#ffc749" strokeWidth="2.2" strokeLinecap="round" style={{ animationDelay: '0.8s' }} />
          </g>

          {/* Floating "Aha!" Spark Medallion */}
          <g className="ola-bubble-float" transform="translate(336, 56)">
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
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 2: AGENDA — HUMAN CONNECTION + THUMBS UP     */}
      {/* ================================================== */}
      {stepIndex === 2 && (
        <svg
          key="scene-2"
          viewBox="0 0 440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[450px] h-auto overflow-visible"
          aria-label="Estudiante coordinando horario flexible con un profesor en vivo"
        >
          <circle cx="106" cy="134" r="68" fill="#ffc749" fillOpacity="0.24" />
          <circle cx="334" cy="128" r="70" fill="#626a9f" fillOpacity="0.18" />

          {/* Animated Flowing Connection Arc */}
          <path
            d="M 132 82 Q 220 26 308 82"
            stroke="#626a9f"
            strokeWidth="3.2"
            strokeDasharray="7 7"
            strokeLinecap="round"
            className="ola-dash-flow"
          />

          {/* LEFT CHARACTER: Student Giving an Enthusiastic Attached Thumbs-Up */}
          <g transform="translate(102, 134) scale(0.88)" className="ola-rig-breathe">
            <CharacterTorso
              shirtColor="#626a9f"
              shirtShadow="#454d82"
              collarStyle="crew"
              collarColor="#ffc749"
              skinColor="#f2c4a0"
              skinShadow="#d69c73"
            />

            {/* Connected Right Arm Raising into a Clean Thumbs-Up */}
            <g>
              {/* Upper Sleeve from Right Shoulder */}
              <path
                d="M 38 24 C 54 24, 68 28, 72 38 C 75 46, 66 53, 56 50 C 46 47, 38 42, 36 34 Z"
                fill="#626a9f"
              />
              {/* Articulated Forearm + Sculpted Thumbs-Up Hand */}
              <g className="ola-thumb-bounce">
                <path
                  d="M 60 36 C 65 20, 72 6, 76 -4 L 88 0 C 85 13, 80 28, 74 42 C 70 48, 60 44, 60 36 Z"
                  fill="#626a9f"
                />
                {/* Wrist & Fist Palm */}
                <rect x="74" y="-16" width="18" height="17" rx="7" fill="#f2c4a0" />
                {/* Distinct Upright Thumb */}
                <path
                  d="M 76 -14 C 75 -24, 79 -32, 84 -31 C 88 -30, 88 -22, 85 -15 Z"
                  fill="#f2c4a0"
                />
                {/* Curled Finger Knuckle Lines */}
                <path d="M 83 -11 H 90 M 83 -7 H 90 M 83 -3 H 89" stroke="#d69c73" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </g>

            {/* Animated Head Looking Right Toward Calendar */}
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

          {/* CENTER FLOATING SCHEDULE CARD */}
          <g className="ola-bubble-float" transform="translate(172, 92)">
            <rect x="0" y="0" width="96" height="90" rx="22" fill="#ffffff" stroke="#1e2246" strokeWidth="2.5" />
            <path d="M 0 22 C 0 10 10 0 22 0 H 74 C 86 0 96 10 96 22 V 29 H 0 Z" fill="#ffc749" />
            <text x="48" y="19" textAnchor="middle" fill="#1e2246" fontSize="10.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
              MIÉ • 7 PM
            </text>
            <circle cx="48" cy="59" r="19" fill="#16a37f" />
            <path d="M 40 59 L 46 65 L 57 53" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* RIGHT CHARACTER: Warm Instructor with Cardigan & Studio Headset */}
          <g transform="translate(338, 134) scale(0.88)" className="ola-rig-breathe" style={{ animationDelay: '0.6s' }}>
            <CharacterTorso
              shirtColor="#ffc749"
              shirtShadow="#dfa21e"
              collarStyle="cardigan"
              collarColor="#ffffff"
              skinColor="#b87b56"
              skinShadow="#965d3b"
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

          {/* Friendly Teacher Confirmation Bubble */}
          <g className="ola-bubble-float" style={{ animationDelay: '0.5s' }}>
            <rect x="278" y="26" width="122" height="32" rx="16" fill="#1e2246" />
            <text x="339" y="46" textAnchor="middle" fill="#ffc749" fontSize="11" fontWeight="800" fontFamily="Montserrat, sans-serif">
              &ldquo;See you at 7!&rdquo;
            </text>
          </g>
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 3: EN VIVO — CLIPPED LIVE VIDEO FRAMES       */}
      {/* ================================================== */}
      {stepIndex === 3 && (
        <svg
          key="scene-3"
          viewBox="0 0 440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[450px] h-auto overflow-visible"
          aria-label="Profesor y estudiante conversando cara a cara en clase 100% en vivo"
        >
          <defs>
            <clipPath id="ola-frame-left">
              <rect x="22" y="26" width="184" height="170" rx="28" />
            </clipPath>
            <clipPath id="ola-frame-right">
              <rect x="234" y="26" width="184" height="170" rx="28" />
            </clipPath>
          </defs>

          {/* LEFT VIDEO TILE (Instructor) */}
          <rect x="22" y="26" width="184" height="170" rx="28" fill="#626a9f" />
          <g clipPath="url(#ola-frame-left)">
            <circle cx="114" cy="134" r="76" fill="#ffffff" fillOpacity="0.08" />

            {/* Instructor Character with Smooth Connected Waving Arm */}
            <g transform="translate(106, 134) scale(0.86)" className="ola-rig-breathe">
              <CharacterTorso
                shirtColor="#ffc749"
                shirtShadow="#e0a422"
                collarStyle="collared"
                collarColor="#ffffff"
                skinColor="#e8b48e"
                skinShadow="#cc9066"
              />

              {/* Connected Articulated Right Arm Waving Warmly from Elbow */}
              <g>
                {/* Upper Arm Attached Inside Shoulder Socket */}
                <path
                  d="M 38 24 C 54 20, 68 18, 76 24 C 82 30, 78 40, 68 42 C 56 44, 44 46, 38 40 Z"
                  fill="#ffc749"
                />
                {/* Nested Forearm + Real 5-Finger Waving Hand */}
                <g className="ola-forearm-wave">
                  <path
                    d="M 68 30 C 72 14, 78 -2, 82 -14 L 94 -10 C 91 4, 87 20, 81 34 C 77 40, 67 38, 68 30 Z"
                    fill="#ffc749"
                  />
                  {/* Wrist Cuff */}
                  <path d="M 81 -12 L 95 -8 L 93 -3 L 79 -7 Z" fill="#ffffff" />
                  {/* Sculpted Open Hand: Palm + Thumb + 4 Fingers */}
                  <path
                    d="M 81 -12 C 79 -21, 83 -28, 91 -28 C 98 -28, 102 -21, 99 -12 C 97 -7, 83 -7, 81 -12 Z"
                    fill="#e8b48e"
                  />
                  {/* Thumb */}
                  <path
                    d="M 82 -15 C 75 -18, 74 -25, 78 -27 C 81 -28, 84 -23, 85 -19 Z"
                    fill="#e8b48e"
                  />
                  {/* 4 Distinct Fingers */}
                  <path d="M 83 -25 L 81 -37 C 81 -40, 86 -40, 86 -37 L 87 -26 Z" fill="#e8b48e" />
                  <path d="M 87 -27 L 87 -40 C 87 -43, 92 -43, 92 -40 L 91 -27 Z" fill="#e8b48e" />
                  <path d="M 91 -26 L 93 -38 C 94 -41, 98 -40, 98 -37 L 95 -25 Z" fill="#e8b48e" />
                  <path d="M 95 -23 L 99 -33 C 100 -35, 104 -34, 103 -31 L 98 -20 Z" fill="#e8b48e" />
                </g>
              </g>

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

            {/* Live Indicator */}
            <rect x="36" y="40" width="70" height="24" rx="12" fill="#1e2246" fillOpacity="0.45" />
            <circle cx="49" cy="52" r="4.5" fill="#ee665b" className="ola-eq-pulse" />
            <text x="60" y="55.5" fill="#ffffff" fontSize="9.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
              EN VIVO
            </text>
          </g>
          <rect x="22" y="26" width="184" height="170" rx="28" stroke="#1e2246" strokeWidth="2.6" />

          {/* RIGHT VIDEO TILE (Student) */}
          <rect x="234" y="26" width="184" height="170" rx="28" fill="#fff3d1" />
          <g clipPath="url(#ola-frame-right)">
            <circle cx="326" cy="134" r="76" fill="#ffc749" fillOpacity="0.28" />

            <g transform="translate(326, 134) scale(0.86)" className="ola-rig-breathe" style={{ animationDelay: '0.5s' }}>
              <CharacterTorso
                shirtColor="#454d82"
                shirtShadow="#2d3361"
                collarStyle="crew"
                collarColor="#ffffff"
                skinColor="#ce926c"
                skinShadow="#ad714c"
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
          <rect x="234" y="26" width="184" height="170" rx="28" stroke="#1e2246" strokeWidth="2.6" />

          {/* Center Live Audio Bridge Medallion */}
          <g className="ola-bubble-float">
            <circle cx="220" cy="112" r="24" fill="#ffffff" stroke="#1e2246" strokeWidth="2.6" />
            <rect x="207" y="106" width="4" height="12" rx="2" fill="#626a9f" className="ola-eq-pulse" />
            <rect x="214" y="100" width="4" height="24" rx="2" fill="#ffc749" className="ola-eq-pulse" style={{ animationDelay: '0.15s' }} />
            <rect x="221" y="103" width="4" height="18" rx="2" fill="#16a37f" className="ola-eq-pulse" style={{ animationDelay: '0.3s' }} />
            <rect x="228" y="107" width="4" height="10" rx="2" fill="#626a9f" className="ola-eq-pulse" style={{ animationDelay: '0.45s' }} />
          </g>

          {/* Positive Feedback Banner */}
          <g>
            <rect x="128" y="182" width="184" height="34" rx="17" fill="#16a37f" stroke="#1e2246" strokeWidth="2.4" />
            <text x="220" y="203" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
              &ldquo;Great pronunciation!&rdquo;
            </text>
          </g>
        </svg>
      )}

      {/* ================================================== */}
      {/* SCENE 4: COMUNIDAD — 3 DIVERSE CLASSMATES CHATTING */}
      {/* ================================================== */}
      {stepIndex === 4 && (
        <svg
          key="scene-4"
          viewBox="0 0 440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ola-scene-in w-full max-w-[450px] h-auto overflow-visible"
          aria-label="Comunidad de estudiantes conversando juntos en inglés"
        >
          {/* Warm Social Circle Backdrop */}
          <circle cx="220" cy="134" r="94" fill="#ffc749" fillOpacity="0.22" />
          <circle cx="220" cy="134" r="72" stroke="#626a9f" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.32" />

          {/* CLASSMATE 1 (Left — Smiling & Listening Inward) */}
          <g transform="translate(106, 146) scale(0.76)" className="ola-rig-breathe">
            <CharacterTorso
              shirtColor="#626a9f"
              shirtShadow="#454d82"
              collarStyle="collared"
              collarColor="#ffffff"
              skinColor="#f4c5a3"
              skinShadow="#da9e77"
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

          {/* CLASSMATE 3 (Right — Engaged & Smiling Inward) */}
          <g transform="translate(334, 146) scale(0.76)" className="ola-rig-breathe" style={{ animationDelay: '0.7s' }}>
            <CharacterTorso
              shirtColor="#ee665b"
              shirtShadow="#c94b41"
              collarStyle="crew"
              collarColor="#fff3d1"
              skinColor="#b87b56"
              skinShadow="#965d3b"
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

          {/* CLASSMATE 2 (Center Foreground — Conversing with Expressive Connected Gesture) */}
          <g transform="translate(220, 142) scale(0.84)" className="ola-rig-breathe" style={{ animationDelay: '0.35s' }}>
            <CharacterTorso
              shirtColor="#ffc749"
              shirtShadow="#e0a422"
              collarStyle="cardigan"
              collarColor="#ffffff"
              skinColor="#e2aa84"
              skinShadow="#c28760"
            />

            {/* Expressive Conversational Right Arm & Open Hand */}
            <g>
              <path
                d="M 38 24 C 52 24, 65 30, 68 42 C 70 50, 62 56, 52 52 C 44 48, 38 42, 36 34 Z"
                fill="#ffc749"
              />
              <g className="ola-gesture-chat">
                <path
                  d="M 56 40 C 64 26, 74 14, 82 6 L 92 14 C 84 26, 76 38, 68 48 C 63 52, 54 48, 56 40 Z"
                  fill="#ffc749"
                />
                {/* Sculpted Open Conversational Hand */}
                <path
                  d="M 80 4 C 82 -4, 90 -9, 97 -5 C 103 -1, 102 8, 95 13 C 90 16, 79 12, 80 4 Z"
                  fill="#e2aa84"
                />
                <path d="M 84 -2 C 80 -8, 83 -14, 87 -13 C 90 -12, 90 -7, 89 -4 Z" fill="#e2aa84" />
                <path d="M 90 -6 L 96 -14 C 98 -16, 101 -13, 99 -10 L 94 -3 Z" fill="#e2aa84" />
                <path d="M 94 -2 L 102 -8 C 105 -10, 107 -6, 104 -4 L 97 2 Z" fill="#e2aa84" />
              </g>
            </g>

            <g className="ola-rig-head-listen">
              <CharacterHead
                skinColor="#e2aa84"
                skinShadow="#c28760"
                hairColor="#241e38"
                hairHighlight="#483f66"
                hairStyle="curly"
                expression="talk"
                blinkDelay="0.9s"
              />
            </g>
          </g>

          {/* Shared English Conversation Bubbles */}
          <g className="ola-bubble-float">
            <rect x="60" y="28" width="118" height="36" rx="18" fill="#ffffff" stroke="#1e2246" strokeWidth="2.3" />
            <path d="M 102 64 L 96 75 L 116 64 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.3" strokeLinejoin="round" />
            <rect x="100" y="60" width="18" height="6" fill="#ffffff" />
            <text x="119" y="50" textAnchor="middle" fill="#1e2246" fontSize="12" fontWeight="900" fontFamily="Montserrat, sans-serif">
              &ldquo;Let&apos;s chat!&rdquo;
            </text>
          </g>

          <g className="ola-bubble-float" style={{ animationDelay: '0.5s' }}>
            <rect x="252" y="22" width="136" height="36" rx="18" fill="#454d82" stroke="#1e2246" strokeWidth="2.3" />
            <path d="M 318 58 L 326 69 L 304 58 Z" fill="#454d82" stroke="#1e2246" strokeWidth="2.3" strokeLinejoin="round" />
            <rect x="303" y="54" width="18" height="6" fill="#454d82" />
            <text x="320" y="44" textAnchor="middle" fill="#ffc749" fontSize="12" fontWeight="900" fontFamily="Montserrat, sans-serif">
              &ldquo;Count me in!&rdquo;
            </text>
          </g>
        </svg>
      )}
    </div>
  );
}