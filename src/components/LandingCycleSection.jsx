import React, { useState, useEffect, useRef } from 'react';

const STEP_DURATION_MS = 5500;

const CYCLE_STEPS = [
  {
    num: '01',
    shortLabel: 'Live Lab',
    title: 'Escucha y repite con voz real',
    stageSubtitle: 'Entrenas tu oído y tu pronunciación en situaciones cotidianas, sin traducir.',
    desc: 'Entra a tu cuenta, escucha voces reales y entrena tu pronunciación hablando desde el primer minuto.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3.5 3.5 0 00-3.5 3.5v6a3.5 3.5 0 007 0v-6A3.5 3.5 0 0012 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10.5a7 7 0 01-14 0m7 7V21m-3.5 0h7" />
      </svg>
    ),
  },
  {
    num: '02',
    shortLabel: 'Práctica',
    title: 'Afianza a tu propio ritmo',
    stageSubtitle: 'Ejercicios cortos y dinámicos que fijan lo aprendido antes de tu clase en vivo.',
    desc: 'Completa actividades prácticas en tu workbook digital para consolidar vocabulario y confianza.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    num: '03',
    shortLabel: 'Agenda',
    title: 'Tú eliges cuándo conectar',
    stageSubtitle: 'Reservas el día y la hora que encajan con tu vida junto a un instructor disponible.',
    desc: 'Coordina tus sesiones individuales o grupales según tu horario, sin ataduras rígidas.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: '04',
    shortLabel: 'En Vivo',
    title: 'Conversación real cara a cara',
    stageSubtitle: 'Un profesor te escucha, corrige tu pronunciación al instante y guía tu avance.',
    desc: 'Vives clases 100% prácticas donde hablas de verdad, recibes feedback humano y avanzas de unidad.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: '05',
    shortLabel: 'Comunidad',
    title: 'Habla con personas reales',
    stageSubtitle: 'Foros, debates y club de conversación para convertir el inglés en parte de tu día.',
    desc: 'Comparte con compañeros de tu mismo nivel en dinámicas sociales que te dan soltura natural.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ==========================================================
// 5 HUMAN-CENTERED EDITORIAL VECTOR SCENES (Custom SVGs)
// ==========================================================
function HumanCycleIllustration({ stepIndex }) {
  // SCENE 1: LIVE LAB — Student wearing headphones smiling & speaking back to an audio voice
  if (stepIndex === 0) {
    return (
      <svg
        key="human-0"
        viewBox="0 0 420 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ola-stage-in w-full max-w-[430px] h-auto overflow-visible"
        aria-label="Estudiante escuchando y practicando pronunciación con audífonos"
      >
        {/* Warm Ambient Backdrop Halo */}
        <circle cx="155" cy="118" r="82" fill="#ffc749" fillOpacity="0.28" />
        <circle cx="305" cy="95" r="56" fill="#626a9f" fillOpacity="0.16" />

        {/* Human Character: Smiling Student with Headphones */}
        <g className="ola-human-breathe">
          {/* Shoulders / Sweater */}
          <path
            d="M84 206 C84 166, 114 148, 155 148 C196 148, 226 166, 226 206 Z"
            fill="#626a9f"
          />
          <path
            d="M132 150 Q155 170 178 150"
            stroke="#ffc749"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Neck */}
          <rect x="143" y="128" width="24" height="26" rx="10" fill="#eab694" />
          {/* Hair Back */}
          <circle cx="155" cy="94" r="46" fill="#1e2246" />
          {/* Face */}
          <circle cx="155" cy="98" r="37" fill="#f5c9a8" />
          {/* Stylish Fringe */}
          <path
            d="M119 90 C124 62, 152 54, 178 62 C188 66, 193 78, 192 88 C178 75, 144 74, 119 90 Z"
            fill="#1e2246"
          />
          {/* Rosy Cheeks */}
          <ellipse cx="136" cy="108" rx="6" ry="3.5" fill="#ee665b" fillOpacity="0.32" />
          <ellipse cx="176" cy="108" rx="6" ry="3.5" fill="#ee665b" fillOpacity="0.32" />
          {/* Friendly Eyes */}
          <path d="M139 95 Q144 90 149 95" stroke="#1e2246" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M164 95 Q169 90 174 95" stroke="#1e2246" strokeWidth="3.2" strokeLinecap="round" />
          {/* Warm Talking Smile */}
          <path
            className="ola-smile-talk"
            d="M145 110 Q156 123 168 110 Z"
            fill="#1e2246"
          />
          <path d="M150 115 Q156 119 163 115" stroke="#ee665b" strokeWidth="2.5" strokeLinecap="round" />

          {/* OutLoud Brand Headphones */}
          <path
            d="M112 96 C112 46, 198 46, 198 96"
            stroke="#ffc749"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <rect x="103" y="84" width="16" height="32" rx="8" fill="#454d82" stroke="#1e2246" strokeWidth="2.5" />
          <rect x="191" y="84" width="16" height="32" rx="8" fill="#454d82" stroke="#1e2246" strokeWidth="2.5" />
          <circle cx="111" cy="100" r="3" fill="#ffc749" />
          <circle cx="199" cy="100" r="3" fill="#ffc749" />
        </g>

        {/* Animated Sound Arcs Radiating Between Voice & Listener */}
        <g className="ola-wave-float">
          <path d="M220 96 Q230 105 220 114" stroke="#626a9f" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M231 87 Q246 105 231 123" stroke="#ffc749" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M243 79 Q262 105 243 131" stroke="#626a9f" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.65" />
        </g>

        {/* Expressive English Speech Bubble (Zero Translations) */}
        <g className="ola-bubble-bob">
          <rect
            x="252"
            y="42"
            width="154"
            height="62"
            rx="20"
            fill="#ffffff"
            stroke="#1e2246"
            strokeWidth="2.5"
          />
          <path d="M268 104 L256 119 L286 104 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="266" y="99" width="22" height="7" fill="#ffffff" />

          {/* Audio Play Dot + Equalizer */}
          <circle cx="275" cy="64" r="9" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
          <path d="M273 60 L279 64 L273 68 Z" fill="#1e2246" />
          <rect x="292" y="59" width="4" height="10" rx="2" fill="#626a9f" className="ola-cyc-wave" />
          <rect x="299" y="55" width="4" height="18" rx="2" fill="#ffc749" className="ola-cyc-wave" style={{ animationDelay: '0.15s' }} />
          <rect x="306" y="58" width="4" height="12" rx="2" fill="#626a9f" className="ola-cyc-wave" style={{ animationDelay: '0.3s' }} />
          <rect x="313" y="54" width="4" height="20" rx="2" fill="#626a9f" className="ola-cyc-wave" style={{ animationDelay: '0.45s' }} />

          <text x="266" y="91" fill="#1e2246" fontSize="13.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
            &ldquo;Nice to meet you!&rdquo;
          </text>
        </g>

        {/* Student Echo Reply Pill */}
        <g className="ola-pop-delay-1">
          <rect x="260" y="132" width="136" height="40" rx="20" fill="#626a9f" />
          <circle cx="281" cy="152" r="10" fill="#16a37f" />
          <path d="M277 152 L280 155 L286 149" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="298" y="156" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="Montserrat, sans-serif">
            Natural &amp; clear!
          </text>
        </g>
      </svg>
    );
  }

  // SCENE 2: PRÁCTICA INTERACTIVA — Relaxed student with coffee & tablet having an "aha!" moment
  if (stepIndex === 1) {
    return (
      <svg
        key="human-1"
        viewBox="0 0 420 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ola-stage-in w-full max-w-[430px] h-auto overflow-visible"
        aria-label="Estudiante practicando cómodamente con su cuaderno digital y una taza de café"
      >
        <circle cx="205" cy="116" r="86" fill="#626a9f" fillOpacity="0.14" />
        <circle cx="112" cy="80" r="44" fill="#ffc749" fillOpacity="0.28" />

        {/* Cozy Desk Surface */}
        <rect x="36" y="182" width="348" height="12" rx="6" fill="#626a9f" fillOpacity="0.25" />

        {/* Student Character Leaning In Comfortably */}
        <g className="ola-human-breathe">
          {/* Torso */}
          <path
            d="M118 184 C118 148, 146 134, 180 134 C214 134, 240 148, 240 184 Z"
            fill="#ffc749"
            stroke="#1e2246"
            strokeWidth="2.5"
          />
          {/* Neck */}
          <rect x="169" y="114" width="22" height="24" rx="9" fill="#d99f79" />
          {/* Curly Hair Bun & Crown */}
          <circle cx="154" cy="60" r="18" fill="#1e2246" />
          <circle cx="180" cy="86" r="38" fill="#1e2246" />
          {/* Face */}
          <circle cx="184" cy="90" r="32" fill="#e5ad87" />
          {/* Hair Bangs */}
          <path d="M153 84 C162 60, 198 56, 214 78 C196 72, 174 72, 153 84 Z" fill="#1e2246" />
          {/* Glasses (Academic Warmth) */}
          <circle cx="174" cy="90" r="8.5" stroke="#1e2246" strokeWidth="2.4" fill="#ffffff" fillOpacity="0.3" />
          <circle cx="197" cy="90" r="8.5" stroke="#1e2246" strokeWidth="2.4" fill="#ffffff" fillOpacity="0.3" />
          <path d="M182.5 90 L188.5 90" stroke="#1e2246" strokeWidth="2.4" />
          <circle cx="175" cy="90" r="2.3" fill="#1e2246" />
          <circle cx="198" cy="90" r="2.3" fill="#1e2246" />
          {/* Confident Smile */}
          <path d="M177 104 Q186 112 195 104" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" />

          {/* Tablet / Digital Workbook Held Up */}
          <rect
            x="206"
            y="112"
            width="118"
            height="74"
            rx="14"
            fill="#ffffff"
            stroke="#1e2246"
            strokeWidth="2.8"
          />
          <rect x="218" y="124" width="54" height="8" rx="4" fill="#626a9f" fillOpacity="0.3" />
          <rect x="218" y="139" width="92" height="10" rx="5" fill="#e8eaf7" />
          <rect x="218" y="139" width="76" height="10" rx="5" fill="#16a37f" className="ola-bar-fill" />
          {/* Interactive Check Pills Inside Tablet */}
          <rect x="218" y="157" width="44" height="18" rx="9" fill="#ffc749" />
          <rect x="268" y="157" width="44" height="18" rx="9" fill="#626a9f" />
          <path d="M235 166 L239 170 L246 162" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M285 166 L289 170 L296 162" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Warm Coffee Mug on Desk (Human Touch) */}
        <g>
          <path d="M74 148 H102 V174 C102 180 97 184 91 184 H85 C79 184 74 180 74 174 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.5" />
          <path d="M102 155 C112 155, 112 173, 102 173" stroke="#1e2246" strokeWidth="2.5" strokeLinecap="round" />
          <path className="ola-steam" d="M82 140 Q78 132 84 126" stroke="#626a9f" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.6" />
          <path className="ola-steam" d="M93 139 Q89 131 95 125" stroke="#ffc749" strokeWidth="2.2" strokeLinecap="round" style={{ animationDelay: '0.5s' }} />
        </g>

        {/* Floating "Aha!" Lightbulb Spark */}
        <g className="ola-bubble-bob">
          <circle cx="312" cy="64" r="24" fill="#ffc749" stroke="#1e2246" strokeWidth="2.5" />
          <path
            d="M312 52 C305 52 301 57 301 63 C301 67 303.5 70 306 72 L306 75 H318 L318 72 C320.5 70 323 67 323 63 C323 57 319 52 312 52 Z"
            fill="#ffffff"
            stroke="#1e2246"
            strokeWidth="2"
          />
          <path d="M308 79 H316" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M312 31 V36 M340 46 L336 50 M344 68 H339 M284 46 L288 50" stroke="#454d82" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // SCENE 3: AGENDA TUS CLASES — Student choosing a flexible time & connecting with a real instructor
  if (stepIndex === 2) {
    return (
      <svg
        key="human-2"
        viewBox="0 0 420 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ola-stage-in w-full max-w-[430px] h-auto overflow-visible"
        aria-label="Estudiante coordinando horario flexible con un profesor en vivo"
      >
        <circle cx="115" cy="122" r="66" fill="#ffc749" fillOpacity="0.26" />
        <circle cx="310" cy="112" r="68" fill="#626a9f" fillOpacity="0.18" />

        {/* Flowing Connection Arc Linking Student & Teacher */}
        <path
          d="M155 92 Q210 42 268 88"
          stroke="#626a9f"
          strokeWidth="3.5"
          strokeDasharray="7 7"
          strokeLinecap="round"
        />

        {/* LEFT PERSON: Student Picking a Time */}
        <g className="ola-human-breathe">
          <path d="M56 202 C56 168, 80 152, 114 152 C148 152, 172 168, 172 202 Z" fill="#454d82" />
          <rect x="104" y="134" width="20" height="22" rx="8" fill="#f3c5a2" />
          <circle cx="114" cy="102" r="34" fill="#1e2246" />
          <circle cx="114" cy="106" r="29" fill="#f3c5a2" />
          <path d="M86 98 C92 75, 126 70, 142 94 C126 86, 102 86, 86 98 Z" fill="#1e2246" />
          <circle cx="104" cy="106" r="2.6" fill="#1e2246" />
          <circle cx="124" cy="106" r="2.6" fill="#1e2246" />
          <path d="M105 117 Q114 125 123 117" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" />
        </g>

        {/* CENTER FLOATING SCHEDULE BADGE */}
        <g className="ola-bubble-bob">
          <rect x="164" y="90" width="94" height="84" rx="20" fill="#ffffff" stroke="#1e2246" strokeWidth="2.6" />
          <rect x="164" y="90" width="94" height="26" rx="14" fill="#ffc749" />
          <rect x="164" y="106" width="94" height="10" fill="#ffc749" />
          <text x="211" y="108" textAnchor="middle" fill="#1e2246" fontSize="10" fontWeight="900" fontFamily="Montserrat, sans-serif">
            MIÉ • 7 PM
          </text>
          {/* Checkmark Confirmation */}
          <circle cx="211" cy="145" r="18" fill="#16a37f" />
          <path d="M203 145 L209 151 L220 139" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* RIGHT PERSON: Friendly Teacher Ready & Waiting */}
        <g className="ola-human-breathe" style={{ animationDelay: '0.6s' }}>
          <path d="M250 202 C250 168, 274 152, 308 152 C342 152, 366 168, 366 202 Z" fill="#ffc749" stroke="#1e2246" strokeWidth="2.5" />
          <rect x="298" y="134" width="20" height="22" rx="8" fill="#c98d68" />
          <circle cx="308" cy="102" r="34" fill="#2d2640" />
          <circle cx="308" cy="106" r="29" fill="#d49872" />
          <path d="M280 96 C290 74, 326 74, 336 96 C322 86, 294 86, 280 96 Z" fill="#2d2640" />
          <circle cx="298" cy="106" r="2.6" fill="#1e2246" />
          <circle cx="318" cy="106" r="2.6" fill="#1e2246" />
          <path d="M299 117 Q308 125 317 117" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" />
          {/* Teacher Headset Mic */}
          <path d="M276 105 C276 66, 340 66, 340 105" stroke="#626a9f" strokeWidth="6" strokeLinecap="round" />
          <path d="M338 108 Q336 122 321 122" stroke="#1e2246" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Floating "See you then!" Chip */}
        <g className="ola-pop-delay-1">
          <rect x="266" y="34" width="114" height="30" rx="15" fill="#1e2246" />
          <text x="323" y="53" textAnchor="middle" fill="#ffc749" fontSize="10.5" fontWeight="800" fontFamily="Montserrat, sans-serif">
            &ldquo;See you at 7!&rdquo;
          </text>
        </g>
      </svg>
    );
  }

  // SCENE 4: CLASE 100% EN VIVO — Expressive teacher & student talking face-to-face with live dialogue
  if (stepIndex === 3) {
    return (
      <svg
        key="human-3"
        viewBox="0 0 420 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ola-stage-in w-full max-w-[430px] h-auto overflow-visible"
        aria-label="Profesor y estudiante conversando cara a cara en clase en vivo"
      >
        {/* Warm Split Live Frame */}
        <rect x="26" y="34" width="174" height="156" rx="26" fill="#626a9f" stroke="#1e2246" strokeWidth="2.6" />
        <rect x="220" y="34" width="174" height="156" rx="26" fill="#fff3d1" stroke="#1e2246" strokeWidth="2.6" />

        {/* Live Dot Badge */}
        <rect x="42" y="48" width="66" height="22" rx="11" fill="#1e2246" fillOpacity="0.45" />
        <circle cx="55" cy="59" r="4.5" fill="#ee665b" className="ola-pulse-dot" />
        <text x="66" y="63" fill="#ffffff" fontSize="9.5" fontWeight="900" fontFamily="Montserrat, sans-serif">
          EN VIVO
        </text>

        {/* LEFT: Smiling Instructor Guiding & Encouraging */}
        <g className="ola-human-breathe">
          <path d="M62 188 C62 156, 82 144, 113 144 C144 144, 164 156, 164 188 Z" fill="#ffc749" />
          <rect x="103" y="126" width="20" height="22" rx="8" fill="#e6b08a" />
          <circle cx="113" cy="98" r="31" fill="#1e2246" />
          <circle cx="113" cy="102" r="26" fill="#f0bf9c" />
          <path d="M88 94 C94 74, 126 70, 138 92 C124 84, 102 84, 88 94 Z" fill="#1e2246" />
          <path d="M100 100 Q104 96 108 100" stroke="#1e2246" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M118 100 Q122 96 126 100" stroke="#1e2246" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M104 112 Q113 121 122 112 Z" fill="#1e2246" className="ola-smile-talk" />
          {/* Friendly Raised Hand Wave */}
          <path d="M156 154 C166 138, 174 132, 178 140 C182 148, 172 166, 162 172 Z" fill="#f0bf9c" stroke="#1e2246" strokeWidth="2" />
        </g>

        {/* RIGHT: Confident Student Speaking Back */}
        <g className="ola-human-breathe" style={{ animationDelay: '0.5s' }}>
          <path d="M256 188 C256 156, 276 144, 307 144 C338 144, 358 156, 358 188 Z" fill="#454d82" />
          <rect x="297" y="126" width="20" height="22" rx="8" fill="#cf9570" />
          <circle cx="307" cy="96" r="32" fill="#1e2246" />
          <circle cx="307" cy="102" r="26" fill="#dba07c" />
          <path d="M282 95 C288 73, 326 73, 332 95 C318 85, 296 85, 282 95 Z" fill="#1e2246" />
          <circle cx="298" cy="101" r="2.6" fill="#1e2246" />
          <circle cx="316" cy="101" r="2.6" fill="#1e2246" />
          <path d="M298 112 Q307 121 316 112" stroke="#1e2246" strokeWidth="2.8" strokeLinecap="round" />
        </g>

        {/* Center Bridge: Live Voice Connection Heartbeat */}
        <g className="ola-bubble-bob">
          <circle cx="210" cy="112" r="24" fill="#ffffff" stroke="#1e2246" strokeWidth="2.6" />
          <rect x="197" y="106" width="4" height="12" rx="2" fill="#626a9f" className="ola-cyc-wave" />
          <rect x="204" y="100" width="4" height="24" rx="2" fill="#ffc749" className="ola-cyc-wave" style={{ animationDelay: '0.15s' }} />
          <rect x="211" y="103" width="4" height="18" rx="2" fill="#16a37f" className="ola-cyc-wave" style={{ animationDelay: '0.3s' }} />
          <rect x="218" y="107" width="4" height="10" rx="2" fill="#626a9f" className="ola-cyc-wave" style={{ animationDelay: '0.45s' }} />
        </g>

        {/* Encouragement Spark Banner */}
        <g className="ola-pop-delay-1">
          <rect x="122" y="176" width="176" height="32" rx="16" fill="#16a37f" stroke="#1e2246" strokeWidth="2.2" />
          <text x="210" y="196" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="Montserrat, sans-serif">
            &ldquo;Great pronunciation!&rdquo;
          </text>
        </g>
      </svg>
    );
  }

  // SCENE 5: COMUNIDAD OUTLOUD — 3 diverse classmates chatting & laughing together
  return (
    <svg
      key="human-4"
      viewBox="0 0 420 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ola-stage-in w-full max-w-[430px] h-auto overflow-visible"
      aria-label="Comunidad de estudiantes conversando juntos en inglés"
    >
      {/* Warm Community Circle Aura */}
      <circle cx="210" cy="126" r="88" fill="#ffc749" fillOpacity="0.24" />
      <circle cx="210" cy="126" r="64" stroke="#626a9f" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.35" />

      {/* PERSON 1 (Left) */}
      <g className="ola-human-breathe">
        <path d="M46 202 C46 170, 68 156, 98 156 C128 156, 150 170, 150 202 Z" fill="#626a9f" />
        <rect x="89" y="140" width="18" height="20" rx="7" fill="#f3c5a2" />
        <circle cx="98" cy="112" r="28" fill="#1e2246" />
        <circle cx="98" cy="116" r="24" fill="#f3c5a2" />
        <path d="M75 110 C80 90, 114 88, 121 108 C108 100, 88 100, 75 110 Z" fill="#1e2246" />
        <path d="M88 115 Q92 111 96 115" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M101 115 Q105 111 109 115" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M91 124 Q98 131 106 124" stroke="#1e2246" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* PERSON 3 (Right) */}
      <g className="ola-human-breathe" style={{ animationDelay: '0.7s' }}>
        <path d="M270 202 C270 170, 292 156, 322 156 C352 156, 374 170, 374 202 Z" fill="#ee665b" />
        <rect x="313" y="140" width="18" height="20" rx="7" fill="#c78a65" />
        <circle cx="322" cy="110" r="30" fill="#1e2246" />
        <circle cx="322" cy="116" r="24" fill="#d49670" />
        <path d="M299 109 C305 90, 338 90, 345 109 C332 101, 312 101, 299 109 Z" fill="#1e2246" />
        <circle cx="314" cy="115" r="2.3" fill="#1e2246" />
        <circle cx="330" cy="115" r="2.3" fill="#1e2246" />
        <path d="M314 124 Q322 132 330 124" stroke="#1e2246" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* PERSON 2 (Center Foreground — Warm Spotlight) */}
      <g className="ola-human-breathe" style={{ animationDelay: '0.35s' }}>
        <path d="M150 206 C150 168, 174 152, 210 152 C246 152, 270 168, 270 206 Z" fill="#ffc749" stroke="#1e2246" strokeWidth="2.6" />
        <rect x="200" y="134" width="20" height="22" rx="8" fill="#e6b18c" />
        <circle cx="210" cy="100" r="34" fill="#2b2240" />
        <circle cx="210" cy="106" r="28" fill="#f0be9b" />
        <path d="M182 99 C188 76, 232 76, 238 99 C222 89, 198 89, 182 99 Z" fill="#2b2240" />
        <path d="M197 105 Q201 100 205 105" stroke="#1e2246" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M215 105 Q219 100 223 105" stroke="#1e2246" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M201 116 Q210 126 219 116 Z" fill="#1e2246" className="ola-smile-talk" />
      </g>

      {/* Floating Shared Conversation Bubbles Above the Group */}
      <g className="ola-bubble-bob">
        <rect x="64" y="34" width="112" height="34" rx="17" fill="#ffffff" stroke="#1e2246" strokeWidth="2.2" />
        <text x="120" y="55" textAnchor="middle" fill="#1e2246" fontSize="11" fontWeight="900" fontFamily="Montserrat, sans-serif">
          &ldquo;Let&apos;s chat!&rdquo;
        </text>
      </g>

      <g className="ola-bubble-bob" style={{ animationDelay: '0.45s' }}>
        <rect x="234" y="28" width="132" height="36" rx="18" fill="#454d82" stroke="#1e2246" strokeWidth="2.2" />
        <text x="300" y="50" textAnchor="middle" fill="#ffc749" fontSize="11" fontWeight="900" fontFamily="Montserrat, sans-serif">
          &ldquo;Count me in!&rdquo;
        </text>
      </g>
    </svg>
  );
}

// ==========================================================
// MAIN MODERN INTERACTIVE STUDY CYCLE SECTION
// ==========================================================
export default function LandingCycleSection({ onScrollTo }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cycleTick, setCycleTick] = useState(0); // Forces fresh progress animation on every step switch
  const touchStartX = useRef(null);

  // Guaranteed automatic cycling — only pauses if user explicitly toggles Pause
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % CYCLE_STEPS.length);
      setCycleTick((t) => t + 1);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, cycleTick]);

  const handleSelectStep = (idx) => {
    setActiveIndex(idx);
    setCycleTick((t) => t + 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 42) {
      const nextIdx =
        diff > 0
          ? (activeIndex + 1) % CYCLE_STEPS.length
          : (activeIndex - 1 + CYCLE_STEPS.length) % CYCLE_STEPS.length;
      handleSelectStep(nextIdx);
    }
    touchStartX.current = null;
  };

  const activeStep = CYCLE_STEPS[activeIndex];

  return (
    <div id="cycle" className="mt-20 sm:mt-28 scroll-mt-24 relative">
      <style>{`
        @keyframes olaStageIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaPopDelay {
          0% { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes olaStepProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes olaHumanBreathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes olaBubbleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes olaSmileTalk {
          0%, 100% { transform: scaleY(1); }
          45% { transform: scaleY(0.65); }
          70% { transform: scaleY(1.12); }
        }
        @keyframes olaSteamRise {
          0% { opacity: 0; transform: translateY(4px); }
          50% { opacity: 0.9; transform: translateY(-3px); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes olaCycWave {
          0%, 100% { transform: scaleY(0.45); }
          50% { transform: scaleY(1); }
        }
        @keyframes olaBarFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes olaPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.25); }
        }

        .ola-stage-in {
          animation: olaStageIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ola-pop-delay-1 {
          opacity: 0;
          animation: olaPopDelay 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.16s forwards;
        }
        .ola-human-breathe {
          animation: olaHumanBreathe 3.6s ease-in-out infinite;
        }
        .ola-bubble-bob {
          animation: olaBubbleBob 3.2s ease-in-out infinite;
        }
        .ola-smile-talk {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaSmileTalk 1.6s ease-in-out infinite;
        }
        .ola-steam {
          animation: olaSteamRise 2.2s ease-in-out infinite;
        }
        .ola-wave-float {
          animation: olaBubbleBob 2.4s ease-in-out infinite;
        }
        .ola-cyc-wave {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaCycWave 1.05s ease-in-out infinite;
        }
        .ola-bar-fill {
          transform-box: fill-box;
          transform-origin: left;
          animation: olaBarFill 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
        }
        .ola-pulse-dot {
          transform-box: fill-box;
          transform-origin: center;
          animation: olaPulseDot 1.3s ease-in-out infinite;
        }
        .ola-step-progress {
          transform-origin: left;
          animation: olaStepProgress ${STEP_DURATION_MS}ms linear forwards;
        }
        .ola-cycle-stage-glass {
          background: linear-gradient(
            148deg,
            rgba(235, 238, 255, 0.82) 0%,
            rgba(213, 219, 249, 0.7) 55%,
            rgba(255, 244, 214, 0.76) 100%
          );
          backdrop-filter: blur(28px) saturate(195%);
          -webkit-backdrop-filter: blur(28px) saturate(195%);
          border: 1.5px solid rgba(255, 255, 255, 0.94);
          box-shadow:
            0 24px 54px -14px rgba(72, 80, 136, 0.28),
            inset 0 2px 2px rgba(255, 255, 255, 0.96);
        }
      `}</style>

      {/* CLEAN EDITORIAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
        <div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e2246] tracking-tight leading-[1.06]">
            Tu ciclo para{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#454d82]">dominar cada unidad</span>
              <span className="absolute -left-1 -right-1 bottom-1 h-3.5 bg-[#ffc749]/85 -z-0 rounded-full -rotate-1" />
            </span>
          </h3>
          <p className="text-sm sm:text-base text-[#4c5384] font-semibold mt-3 max-w-xl">
            Cinco momentos pensados alrededor de personas reales, práctica constante y conversación en vivo.
          </p>
        </div>

        {/* Clear Play / Pause Toggle */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="ola-glass self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-[#454d82] hover:text-[#1e2246] cursor-pointer shrink-0"
        >
          {isPaused ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
              <span>Reanudar</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                <rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
              <span>Pausar</span>
            </>
          )}
        </button>
      </div>

      {/* ================================================== */}
      {/* MODERN SPLIT STUDIO: STEP DECK + HUMAN SCENE STAGE */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* MOBILE HORIZONTAL STEP SELECTOR */}
        <div className="lg:hidden grid grid-cols-5 gap-1.5">
          {CYCLE_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`relative rounded-2xl py-2.5 px-1 flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-[#1e2246] border-[#1e2246] text-white shadow-md -translate-y-0.5'
                    : 'bg-white/65 border-white text-[#454d82]'
                }`}
              >
                <span className={`text-xs font-black ${isActive ? 'text-[#ffc749]' : 'text-[#1e2246]'}`}>
                  {step.num}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-tight truncate max-w-full">
                  {step.shortLabel}
                </span>
                {isActive && !isPaused && (
                  <span
                    key={`mprog-${cycleTick}`}
                    className="ola-step-progress absolute bottom-0 left-0 right-0 h-[3px] bg-[#ffc749]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* LEFT COLUMN (DESKTOP): KINETIC STEP DECK */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-3 justify-between">
          {CYCLE_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`group relative w-full text-left rounded-[1.6rem] p-4 sm:p-5 transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none ${
                  isActive
                    ? 'bg-white/90 backdrop-blur-2xl border-2 border-[#1e2246] shadow-[0_8px_0_#1e2246,0_18px_36px_-10px_rgba(69,77,130,0.3)] -translate-y-0.5'
                    : 'bg-white/45 hover:bg-white/75 backdrop-blur-xl border border-white/85 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_3px_0_#1e2246] scale-105'
                        : 'bg-white/80 border-white text-[#454d82] group-hover:bg-[#e8eaf7]'
                    }`}
                  >
                    {step.icon}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm sm:text-base font-black tracking-tight transition-colors ${
                          isActive ? 'text-[#1e2246]' : 'text-[#3b4170] group-hover:text-[#1e2246]'
                        }`}
                      >
                        {step.shortLabel}
                      </h4>
                      <span
                        className={`text-xs font-black tabular-nums ${
                          isActive ? 'text-[#454d82]' : 'text-[#50567d]/60'
                        }`}
                      >
                        {step.num}
                      </span>
                    </div>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isActive ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                    >
                      <p className="overflow-hidden text-xs sm:text-[13px] text-[#4c5384] font-semibold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Auto-Advance Progress Line */}
                {isActive && !isPaused && (
                  <span
                    key={`dprog-${cycleTick}`}
                    className="ola-step-progress absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#626a9f] via-[#ffc749] to-[#16a37f]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN (DESKTOP) / MAIN STAGE (MOBILE): CLEAR CONTEXT + HUMAN ILLUSTRATION */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-7 relative flex flex-col"
        >
          {/* Ambient Backlight Glow */}
          <div
            className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-80 -z-10 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 25% 20%, rgba(255,199,73,0.62), transparent 55%), radial-gradient(circle at 80% 80%, rgba(98,106,159,0.58), transparent 62%)',
            }}
          />

          <div className="ola-cycle-stage-glass flex-1 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[430px] sm:min-h-[480px]">
            {/* Subtle Dotted Glass Texture */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.3) 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />

            {/* Giant Soft Watermark Number */}
            <span className="pointer-events-none select-none absolute -top-5 right-6 text-[7.5rem] sm:text-[9rem] font-black leading-none text-[#454d82]/[0.07]">
              {activeStep.num}
            </span>

            {/* CLEAR STAGE CONTEXT HEADER (Replaces the Empty Top Space) */}
            <div key={`head-${activeStep.num}`} className="ola-stage-in relative z-10 pr-12">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#1e2246] text-[#ffc749] text-[10px] font-black uppercase tracking-widest">
                  Paso {activeStep.num} de 05 • {activeStep.shortLabel}
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-[#1e2246] tracking-tight leading-snug">
                {activeStep.title}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-[#4c5384] mt-1 leading-relaxed max-w-lg">
                {activeStep.stageSubtitle}
              </p>
            </div>

            {/* HUMAN-CENTERED EDITORIAL SVG SCENE */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-4 sm:py-5">
              <HumanCycleIllustration stepIndex={activeIndex} />
            </div>

            {/* Bottom Progress Dots + Loop Bar */}
            <div className="relative z-10 pt-4 border-t border-white/75 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {CYCLE_STEPS.map((s, idx) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    aria-label={`Ver paso ${s.num}: ${s.shortLabel}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex
                        ? 'w-8 bg-[#1e2246]'
                        : 'w-2 bg-[#626a9f]/35 hover:bg-[#626a9f]'
                    }`}
                  />
                ))}
                <span className="ml-2 text-[11px] font-extrabold text-[#454d82]">
                  Bucle continuo A1 → C2
                </span>
              </div>

              <button
                type="button"
                onClick={() => onScrollTo?.('#enroll')}
                className="ola-btn-yellow w-full sm:w-auto px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 shrink-0 group"
              >
                <span>Empezar Ahora</span>
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}