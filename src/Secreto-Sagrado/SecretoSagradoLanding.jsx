// src/Secreto-Sagrado/SecretoSagradoLanding.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  NODOS_MULTIMODALES_POR_ERA,
  generarDesafioConGemini,
  evaluarExplicacionFamiliarConGemini,
  verificarBibliaConCamaraGemini
} from './geminiDirectorEngine';

/* ==========================================================================
   ACTIVOS OFICIALES EN CLOUDFLARE R2 PROPORCIONADOS
   ========================================================================== */
const URL_FONDO_MONTANA = 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/1791990986647.jpg';
const URL_MUSICA_MENU = 'https://pub-f968bc599b9e4b30965522b355899a7e.r2.dev/crown_of_the_morning_mist.mp3';
const URL_LOGO_OFICIAL = 'https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/S%20ECRETO%20SAGRADO.png';

/* ==========================================================================
   CATÁLOGO DE LOS 6 ARQUETIPOS DEL SYSTEM DM Y LOS 8 ROLES DE JUGADOR
   ========================================================================== */
const CATALOGO_DMS = [
  {
    id: 'pastor',
    nombre: 'El Pastor Amoroso',
    subtitulo: 'Cálido, paciente y consolador',
    icono: '🌿',
    colorHex: '#10b981',
    colorSecundario: '#34d399',
    pitchVoz: 0.96,
    rateVoz: 0.95,
    introHistoria: 'Bienvenidos, queridos amigos. Soy su compañero de estudio en este viaje a través de las ocho eras bíblicas. Juntos veremos cómo Jehová fue revelando paso a paso el Secreto Sagrado desde Edén hasta el Reino Mesiánico. En cada turno les indicaré qué pasaje abrir en su Biblia física y qué acción realizar en la Tablet. ¿Me dan su permiso para comenzar?'
  },
  {
    id: 'historiador',
    nombre: 'El Historiador Dedicado',
    subtitulo: 'Cronología exacta, mapas y linajes',
    icono: '📜',
    colorHex: '#38bdf8',
    colorSecundario: '#60a5fa',
    pitchVoz: 1.0,
    rateVoz: 1.0,
    introHistoria: 'Saludos, investigadores de las Escrituras. Como su cronista y compañero de estudio, los guiaré por las ocho eras históricas desde el año 4026 antes de nuestra era hasta el cumplimiento final en Revelación. En cada desafío verificaremos citas, fechas y pruebas en su Biblia impresa. ¿Me conceden su permiso para iniciar la travesía?'
  },
  {
    id: 'profeta',
    nombre: 'El Profeta Exhortador',
    subtitulo: 'Sombras sagradas y visiones proféticas',
    icono: '🔥',
    colorHex: '#a855f7',
    colorSecundario: '#f59e0b',
    pitchVoz: 0.92,
    rateVoz: 0.98,
    introHistoria: '¡Presten atención a la palabra profética! Como coesclavo de ustedes, hoy contemplaremos cómo cada sacrificio, pacto y profecía apuntaba con precisión infalible hacia el Mesías. Tengan lista su Biblia física y su discernimiento. ¿Me dan su permiso para abrir el primer sello?'
  },
  {
    id: 'rey',
    nombre: 'El Rey Valiente',
    subtitulo: 'Pactos reales y defensa de la Soberanía',
    icono: '👑',
    colorHex: '#f59e0b',
    colorSecundario: '#fbbf24',
    pitchVoz: 0.9,
    rateVoz: 0.96,
    introHistoria: '¡Bienvenidos a la sala del pacto! A lo largo de ocho eras veremos cómo Jehová defendió Su legítima Soberanía y protegió el derecho legal al trono de Su Rey Ungido. Yo dirigiré el orden de los turnos y les indicaré cómo superar cada prueba. ¿Me dan su permiso para comenzar?'
  },
  {
    id: 'angel',
    nombre: 'El Ángel Mensajero',
    subtitulo: 'Siervo revelador (Apocalipsis 19:10)',
    icono: '✨',
    colorHex: '#22d3ee',
    colorSecundario: '#818cf8',
    pitchVoz: 1.08,
    rateVoz: 0.98,
    introHistoria: '¡Adoren a Dios! Todo lo que soy es un coesclavo de ustedes y de sus hermanos. Hoy recorreremos las cosas en las que los mismos ángeles deseaban mirar con atención a medida que se desvelaba el Secreto Sagrado. Abran sus Biblias y preparen su corazón. ¿Me dan su permiso para comenzar?'
  },
  {
    id: 'guerrero',
    nombre: 'El Poderoso Guerrero',
    subtitulo: 'Combate espiritual y firmeza bajo prueba',
    icono: '⚔️',
    colorHex: '#f97316',
    colorSecundario: '#ef4444',
    pitchVoz: 0.88,
    rateVoz: 1.02,
    introHistoria: '¡Empuñen la Espada del Espíritu, que es la Palabra de Dios! La Serpiente original intentó quebrar la fe de los siervos leales y cortar el linaje mesiánico en cada época, pero jamás pudo vencer el propósito de Jehová. ¿Están listos y me dan su permiso para entrar en acción?'
  }
];

const CLASES_ROLES = [
  { id: 'escriba', nombre: 'El Escriba', icono: '📜', color: '#38bdf8', ventaja: 'Ilumina pistas conectadas directamente con la cita bíblica' },
  { id: 'sacerdote', nombre: 'El Sacerdote', icono: '🏛️', color: '#facc15', ventaja: 'Escudo de Expiación: evita perder Convicción ante un error' },
  { id: 'profeta', nombre: 'El Profeta', icono: '👁️', color: '#c084fc', ventaja: 'Luz Profética: descarta 2 opciones falsas en pantalla' },
  { id: 'noble', nombre: 'El Noble', icono: '👑', color: '#fb7185', ventaja: 'Decreto Real: puede participar sin entrar en enfriamiento' },
  { id: 'mayordomo', nombre: 'El Mayordomo', icono: '💼', color: '#34d399', ventaja: 'Archivo Real: muestra contexto histórico y arqueológico' },
  { id: 'juez', nombre: 'El Juez', icono: '🛡️', color: '#fb923c', ventaja: 'Llamado de Valor: otorga +1 Convicción extra al acertar' },
  { id: 'proselito', nombre: 'El Prosélito', icono: '🕊️', color: '#22d3ee', ventaja: 'Hambre de Verdad: restaura +1 Convicción al explicar la verdad' },
  { id: 'patriarca', nombre: 'El Patriarca', icono: '🌾', color: '#818cf8', ventaja: 'Bendición Ancestral: reactiva a un compañero en enfriamiento' }
];

const TITULOS_OCHO_ERAS = [
  { era: 1, nombre: 'Edén y el Linaje Antediluviano' },
  { era: 2, nombre: 'Los Patriarcas y la Promesa de Siló' },
  { era: 3, nombre: 'La Ley Mosaica y el Santuario' },
  { era: 4, nombre: 'Los Jueces y el Pacto Davídico' },
  { era: 5, nombre: 'Los Profetas y las 70 Semanas' },
  { era: 6, nombre: 'La Llegada del Mesías y el Rescate' },
  { era: 7, nombre: 'La Congregación y los Coherederos' },
  { era: 8, nombre: 'El Clímax de Revelación y el Paraíso' }
];

/* ==========================================================================
   COMPONENTE DEL ORBE LÍQUIDO GLASSMÓRFICO REACTIVO A LA VOZ
   ========================================================================== */
function OrbeLiquidoReactivo({
  colorPrimario = '#38bdf8',
  colorSecundario = '#818cf8',
  amplitudVoz = 0,
  tamano = 220,
  etiquetaSuperior = '',
  nombreCentral = '',
  iconoCentral = '',
  enEsquina = false,
  onClick = null
}) {
  const canvasOrbRef = useRef(null);
  const faseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasOrbRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = tamano * dpr;
    canvas.height = tamano * dpr;
    ctx.scale(dpr, dpr);

    const renderizarFluido = () => {
      ctx.clearRect(0, 0, tamano, tamano);
      const cx = tamano / 2;
      const cy = tamano / 2;
      const radioBase = tamano * 0.36;

      // Velocidad y expansión moduladas por la voz en tiempo real
      const energia = Math.min(1.2, amplitudVoz * 1.6);
      faseRef.current += 0.032 + energia * 0.095;
      const f = faseRef.current;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 3 Capas de fluido orgánico (Metaballs / Ondas armónicas)
      const capas = [
        { color: colorPrimario, velocidad: 1.0, desfase: 0, escala: 1.0 + energia * 0.22 },
        { color: colorSecundario, velocidad: -1.3, desfase: 2.1, escala: 0.92 + energia * 0.28 },
        { color: '#ffffff', velocidad: 1.7, desfase: 4.2, escala: 0.65 + energia * 0.35 }
      ];

      capas.forEach((capa, idx) => {
        ctx.beginPath();
        const puntos = 64;
        for (let i = 0; i <= puntos; i++) {
          const ang = (i / puntos) * Math.PI * 2;
          const onda1 = Math.sin(ang * 3 + f * capa.velocidad + capa.desfase) * (6 + energia * 18);
          const onda2 = Math.cos(ang * 5 - f * 1.4 + idx) * (4 + energia * 12);
          const r = (radioBase + onda1 + onda2) * capa.escala;
          const x = cx + Math.cos(ang) * r;
          const y = cy + Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radioBase * 1.35);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.45, capa.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.globalAlpha = idx === 2 ? 0.45 + energia * 0.35 : 0.72;
        ctx.fill();
      });

      ctx.restore();
      rafId = requestAnimationFrame(renderizarFluido);
    };

    rafId = requestAnimationFrame(renderizarFluido);
    return () => cancelAnimationFrame(rafId);
  }, [colorPrimario, colorSecundario, amplitudVoz, tamano]);

  return (
    <div
      onClick={onClick}
      style={{
        width: tamano,
        height: tamano,
        boxShadow: `0 0 ${35 + amplitudVoz * 65}px ${colorPrimario}77, inset 0 0 28px rgba(255,255,255,0.45)`
      }}
      className={`relative rounded-full bg-white/10 backdrop-blur-2xl border border-white/50 flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-700 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
    >
      {/* Fluido Interno Reactivo */}
      <canvas
        ref={canvasOrbRef}
        style={{ width: tamano, height: tamano }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Reflejo Especular Superior de Cristal */}
      <div className="absolute top-2 left-1/4 right-1/4 h-1/4 rounded-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none blur-[1px]" />

      {/* Etiqueta y Nombre en el Núcleo del Orbe */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        {iconoCentral && (
          <span className={`${enEsquina ? 'text-xl' : 'text-3xl'} drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]`}>
            {iconoCentral}
          </span>
        )}
        {etiquetaSuperior && !enEsquina && (
          <span className="text-[10px] font-black tracking-[0.22em] uppercase text-white/90 drop-shadow mt-1">
            {etiquetaSuperior}
          </span>
        )}
        {nombreCentral && (
          <span
            className={`font-black tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] ${
              enEsquina ? 'text-[10px] mt-0.5' : 'text-lg md:text-xl mt-0.5'
            }`}
          >
            {nombreCentral}
          </span>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   COMPONENTE PRINCIPAL: SECRETO SAGRADO LANDING
   ========================================================================== */
export default function SecretoSagradoLanding() {
  /* ------------------------------------------------------------------------
     1. ESTADOS DE FLUJO DE PANTALLAS Y CONFIGURACIÓN LINEAL
     ------------------------------------------------------------------------ */
  // Pantallas: BOOT_LOGO | MENU_PRINCIPAL | SETUP_NARRADOR | SETUP_PARTIDA | SETUP_ESTILO | CONFIGURACION | RITUAL_PULGARES | JUEGO
  const [pantalla, setPantalla] = useState('BOOT_LOGO');
  const [faseBoot, setFaseBoot] = useState(0); // 0: Entrada Logo, 1: Brillo máximo, 2: Transición a Menú

  // Configuración del Juego
  const [dmId, setDmId] = useState('historiador');
  const [modoEstilo, setModoEstilo] = useState('ESTANDAR'); // EXPRESS | ESTANDAR
  const [jugadores, setJugadores] = useState([
    { id: 'j1', nombre: 'Jesús', rolIdx: 0, disponible: true, poderUsado: false },
    { id: 'j2', nombre: 'María', rolIdx: 2, disponible: true, poderUsado: false },
    { id: 'j3', nombre: 'David', rolIdx: 3, disponible: true, poderUsado: false }
  ]);
  const [nuevoNombreInput, setNuevoNombreInput] = useState('');
  const [nuevoRolIdxInput, setNuevoRolIdxInput] = useState(1);

  // Ajustes en "Configuración"
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return localStorage.getItem('ss_gemini_api_key') || process.env.REACT_APP_GEMINI_API_KEY || '';
    } catch (e) {
      return '';
    }
  });
  const [volumenMusica, setVolumenMusica] = useState(0.55);
  const [vozSinteticaActiva, setVozSinteticaActiva] = useState(true);
  const [vibracionActiva, setVibracionActiva] = useState(true);
  const [sensoresMovimientoActivos, setSensoresMovimientoActivos] = useState(true);

  /* ------------------------------------------------------------------------
     2. ESTADOS DEL RITUAL DE PULGARES (3 SEGUNDOS) PARA TRANSICIONES DE CONTROL
     ------------------------------------------------------------------------ */
  const [configRitual, setConfigRitual] = useState({
    titulo: 'Sostén la Tablet Horizontalmente',
    subtitulo: 'Coloca ambos pulgares en los círculos laterales durante 3 segundos para iniciar',
    colorLuz: '#38bdf8',
    destinoCallback: null
  });
  const [pulgarIzqActivo, setPulgarIzqActivo] = useState(false);
  const [pulgarDerActivo, setPulgarDerActivo] = useState(false);
  const [progresoPulgares, setProgresoPulgares] = useState(0); // 0 a 100
  const [explosionLuzCompleta, setExplosionLuzCompleta] = useState(false);

  /* ------------------------------------------------------------------------
     3. ESTADOS DEL JUEGO EN VIVO Y COREOGRAFÍA DEL ORBE
     ------------------------------------------------------------------------ */
  // Sub-fases dentro de JUEGO:
  // INTRO_HISTORIA -> ELEGIR_JUGADOR -> ANIMACION_DESVANECER_OTROS -> DM_PREGUNTA -> JUGADOR_ACTIVO -> REVELACION_HILO -> FIN_PARTIDA
  const [subFaseJuego, setSubFaseJuego] = useState('INTRO_HISTORIA');
  const [eraActualNum, setEraActualNum] = useState(1);
  const [indiceRetoEnEra, setIndiceRetoEnEra] = useState(0);
  const [conviccionHP, setConviccionHP] = useState(10);
  const [tokensOracion, setTokensOracion] = useState(2);
  const [vueltaNumero, setVueltaNumero] = useState(1);

  const [jugadorActivoId, setJugadorActivoId] = useState(null);
  const [retoActual, setRetoActual] = useState(NODOS_MULTIMODALES_POR_ERA[1][0]);
  const [cargandoRetoIA, setCargandoRetoIA] = useState(false);
  const [opcionesOcultasIds, setOpcionesOcultasIds] = useState([]);
  const [mensajeFeedbackDM, setMensajeFeedbackDM] = useState('');

  // Estados de Voz, Micrófono Push-to-Talk, Contador de Pasos y Cámara
  const [amplitudVozDM, setAmplitudVozDM] = useState(0);
  const [amplitudVozJugador, setAmplitudVozJugador] = useState(0);
  const [manteniendoMic, setManteniendoMic] = useState(false);
  const [transcripcionVoz, setTranscripcionVoz] = useState('');
  const [evaluandoIA, setEvaluandoIA] = useState(false);
  const [pasosCaminados, setPasosCaminados] = useState(0);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [notificacionGuardado, setNotificacionGuardado] = useState('');

  // Referencias
  const canvasAtmosferaRef = useRef(null);
  const audioMenuRef = useRef(null);
  const audioCtxRef = useRef(null);
  const reconocimientoVozRef = useRef(null);
  const videoCamaraRef = useRef(null);
  const streamCamaraRef = useRef(null);
  const streamMicAmbienteRef = useRef(null);

  const dmPerfil = CATALOGO_DMS.find((d) => d.id === dmId) || CATALOGO_DMS[0];
  const jugadorActivo = jugadores.find((j) => j.id === jugadorActivoId) || null;
  const claseJugadorActivo = jugadorActivo ? CLASES_ROLES[jugadorActivo.rolIdx] : null;
  const retosMetaPorEra = modoEstilo === 'EXPRESS' ? 1 : 2;

  /* ==========================================================================
     EFECTO 1: ANIMACIÓN DE ARRANQUE (BOOT CON EL LOGO OFICIAL)
     ========================================================================== */
  useEffect(() => {
    const t1 = setTimeout(() => setFaseBoot(1), 400);
    const t2 = setTimeout(() => setFaseBoot(2), 2600);
    const t3 = setTimeout(() => setPantalla('MENU_PRINCIPAL'), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  /* ==========================================================================
     EFECTO 2: MÚSICA DEL MENÚ Y SETUP (SE DETIENE AL INICIAR EL JUEGO REAL)
     ========================================================================== */
  useEffect(() => {
    if (!audioMenuRef.current) {
      const audio = new Audio(URL_MUSICA_MENU);
      audio.loop = true;
      audio.volume = volumenMusica;
      audioMenuRef.current = audio;
    } else {
      audioMenuRef.current.volume = volumenMusica;
    }

    const enMenuOSetup = [
      'BOOT_LOGO',
      'MENU_PRINCIPAL',
      'SETUP_NARRADOR',
      'SETUP_PARTIDA',
      'SETUP_ESTILO',
      'CONFIGURACION'
    ].includes(pantalla);

    if (enMenuOSetup) {
      audioMenuRef.current.play().catch(() => {
        // Se desbloquea automáticamente al primer toque del usuario en la pantalla
      });
    } else if (pantalla === 'JUEGO') {
      // Fade out suave y parada total cuando comienza el juego real
      const audio = audioMenuRef.current;
      let vol = audio.volume;
      const fadeInterval = setInterval(() => {
        if (vol > 0.05) {
          vol -= 0.05;
          audio.volume = Math.max(0, vol);
        } else {
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fadeInterval);
        }
      }, 80);
      return () => clearInterval(fadeInterval);
    }
  }, [pantalla, volumenMusica]);

  const desbloquearAudioAlTocar = () => {
    if (
      audioMenuRef.current &&
      audioMenuRef.current.paused &&
      pantalla !== 'JUEGO'
    ) {
      audioMenuRef.current.volume = volumenMusica;
      audioMenuRef.current.play().catch(() => {});
    }
  };

  /* ==========================================================================
     EFECTO 3: SÍNTESIS DE VOZ DEL SYSTEM DM + PULSO LÍQUIDO DEL ORBE
     ========================================================================== */
  const hablarConVozDM = useCallback(
    (texto, alTerminarCallback = null) => {
      if (!vozSinteticaActiva || typeof window.speechSynthesis === 'undefined') {
        // Simulación de pulso del orbe durante 3.2 segundos si la voz está desactivada
        let ticks = 0;
        const sim = setInterval(() => {
          ticks++;
          setAmplitudVozDM(0.35 + Math.sin(ticks * 0.6) * 0.3);
          if (ticks > 32) {
            clearInterval(sim);
            setAmplitudVozDM(0);
            if (alTerminarCallback) alTerminarCallback();
          }
        }, 100);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.pitch = dmPerfil.pitchVoz || 1.0;
      utterance.rate = dmPerfil.rateVoz || 1.0;

      let animInterval = null;
      utterance.onstart = () => {
        animInterval = setInterval(() => {
          setAmplitudVozDM(0.25 + Math.random() * 0.7);
        }, 90);
      };

      utterance.onboundary = () => {
        setAmplitudVozDM(0.5 + Math.random() * 0.5);
      };

      const finalizar = () => {
        if (animInterval) clearInterval(animInterval);
        setAmplitudVozDM(0);
        if (alTerminarCallback) alTerminarCallback();
      };

      utterance.onend = finalizar;
      utterance.onerror = finalizar;
      window.speechSynthesis.speak(utterance);
    },
    [vozSinteticaActiva, dmPerfil]
  );

  /* ==========================================================================
     EFECTO 4: CAPA DE FONDO EN CANVAS (NIEBLA EN MONTAÑA, BANDADA DE AVES Y BRILLO)
     ========================================================================== */
  useEffect(() => {
    const canvas = canvasAtmosferaRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const ajustar = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    ajustar();
    window.addEventListener('resize', ajustar);

    // 1. Bancos de niebla suave deslizándose sobre la montaña
    const bancosNiebla = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * (0.32 + (i % 4) * 0.14),
      radioX: window.innerWidth * (0.28 + Math.random() * 0.22),
      radioY: window.innerHeight * (0.09 + Math.random() * 0.06),
      velocidad: (i % 2 === 0 ? 1 : -1) * (0.18 + Math.random() * 0.25),
      opacidad: 0.12 + Math.random() * 0.14
    }));

    // 2. Bandada de aves volando en la distancia
    const bandadaAves = Array.from({ length: 14 }, (_, i) => ({
      x: -120 - i * 28 + Math.random() * 40,
      y: window.innerHeight * 0.22 + (i % 5) * 14 + Math.random() * 12,
      escala: 0.55 + Math.random() * 0.45,
      velX: 0.65 + Math.random() * 0.25,
      velY: -0.06 + Math.random() * 0.12,
      faseAla: Math.random() * Math.PI * 2
    }));

    // 3. Partículas de brillo solar flotante (Animated Shine)
    const destellosSol = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.4 + 0.8,
      vx: (Math.random() - 0.3) * 0.35,
      vy: -Math.random() * 0.3 - 0.08,
      faseBrillo: Math.random() * Math.PI * 2
    }));

    let tiempo = 0;

    const animarPaisaje = () => {
      tiempo += 0.018;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A. Resplandor Solar Animado Superior (Animated Shine)
      const pulsoSol = 0.22 + Math.sin(tiempo * 0.8) * 0.08;
      const gradSol = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.12,
        10,
        canvas.width * 0.5,
        canvas.height * 0.18,
        canvas.width * 0.65
      );
      gradSol.addColorStop(0, `rgba(255, 251, 235, ${pulsoSol + 0.15})`);
      gradSol.addColorStop(0.45, `rgba(253, 230, 138, ${pulsoSol * 0.55})`);
      gradSol.addColorStop(1, 'transparent');
      ctx.fillStyle = gradSol;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // B. Bandada de Aves Lejanas con Aleteo Orgánico
      ctx.save();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.58)';
      ctx.lineCap = 'round';
      bandadaAves.forEach((ave) => {
        ave.x += ave.velX;
        ave.y += ave.velY + Math.sin(tiempo * 1.5 + ave.faseAla) * 0.15;
        ave.faseAla += 0.14;

        if (ave.x > canvas.width + 140) {
          ave.x = -120;
          ave.y = canvas.innerHeight * (0.16 + Math.random() * 0.18);
        }

        const aleteoY = Math.sin(ave.faseAla) * 5.5 * ave.escala;
        const anchoAla = 9.5 * ave.escala;

        ctx.lineWidth = 1.6 * ave.escala;
        ctx.beginPath();
        // Ala izquierda
        ctx.moveTo(ave.x - anchoAla, ave.y - aleteoY);
        ctx.quadraticCurveTo(ave.x - anchoAla * 0.4, ave.y - aleteoY * 0.4, ave.x, ave.y);
        // Ala derecha
        ctx.quadraticCurveTo(ave.x + anchoAla * 0.4, ave.y - aleteoY * 0.4, ave.x + anchoAla, ave.y - aleteoY);
        ctx.stroke();
      });
      ctx.restore();

      // C. Bancos de Niebla Montañosa (Misty Clouds)
      bancosNiebla.forEach((nube) => {
        nube.x += nube.velocidad;
        if (nube.velocidad > 0 && nube.x - nube.radioX > canvas.width) {
          nube.x = -nube.radioX;
        } else if (nube.velocidad < 0 && nube.x + nube.radioX < 0) {
          nube.x = canvas.width + nube.radioX;
        }

        ctx.save();
        ctx.translate(nube.x, nube.y);
        ctx.scale(1, nube.radioY / nube.radioX);
        const gradNiebla = ctx.createRadialGradient(0, 0, 10, 0, 0, nube.radioX);
        gradNiebla.addColorStop(0, `rgba(255, 255, 255, ${nube.opacidad})`);
        gradNiebla.addColorStop(0.55, `rgba(241, 245, 249, ${nube.opacidad * 0.55})`);
        gradNiebla.addColorStop(1, 'transparent');
        ctx.fillStyle = gradNiebla;
        ctx.beginPath();
        ctx.arc(0, 0, nube.radioX, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // D. Motas de Brillo Flotantes
      destellosSol.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        d.faseBrillo += 0.04;
        if (d.y < -10) d.y = canvas.height + 10;
        if (d.x < -10) d.x = canvas.width + 10;
        if (d.x > canvas.width + 10) d.x = -10;

        const alfa = 0.25 + Math.abs(Math.sin(d.faseBrillo)) * 0.65;
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fffbeb';
        ctx.globalAlpha = alfa;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#fde047';
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(animarPaisaje);
    };

    raf = requestAnimationFrame(animarPaisaje);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', ajustar);
    };
  }, []);

  /* ==========================================================================
     SINTETIZADOR DE SONIDOS Y VIBRACIÓN PROGRESIVA
     ========================================================================== */
  const sonarAcordeSintetico = useCallback((frecuencias = [523.25, 659.25, 783.99], duracion = 0.55) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      const now = audioCtxRef.current.currentTime;
      frecuencias.forEach((f, i) => {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.001, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.09, now + i * 0.05 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + duracion);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + duracion + 0.04);
      });
    } catch (e) {}
  }, []);

  /* ==========================================================================
     LÓGICA DEL RITUAL DE 3 SEGUNDOS CON AMBOS PULGARES (TOMAR / DEVOLVER CONTROL)
     ========================================================================== */
  const lanzarRitualPulgares = ({ titulo, subtitulo, colorLuz, alCompletar }) => {
    setPulgarIzqActivo(false);
    setPulgarDerActivo(false);
    setProgresoPulgares(0);
    setExplosionLuzCompleta(false);
    setConfigRitual({ titulo, subtitulo, colorLuz, destinoCallback: alCompletar });
    setPantalla('RITUAL_PULGARES');
  };

  useEffect(() => {
    if (pantalla !== 'RITUAL_PULGARES') return;
    const ambosActivos = pulgarIzqActivo && pulgarDerActivo;

    if (!ambosActivos) {
      setProgresoPulgares((prev) => Math.max(0, prev - 8));
      return;
    }

    // Incremento durante 3.0 segundos (30 intervalos de 100ms)
    const timer = setInterval(() => {
      setProgresoPulgares((prev) => {
        const nuevo = Math.min(100, prev + 3.4);

        // Vibración progresiva más y más intensa en la Tablet
        if (vibracionActiva && navigator.vibrate) {
          const intensidadMs = Math.floor(25 + (nuevo / 100) * 95);
          navigator.vibrate(intensidadMs);
        }

        // Sonido ascendente de energía
        if (Math.floor(nuevo) % 12 === 0) {
          sonarAcordeSintetico([260 + nuevo * 4.8, 390 + nuevo * 5.2], 0.18);
        }

        if (nuevo >= 100) {
          clearInterval(timer);
          setExplosionLuzCompleta(true);
          if (vibracionActiva && navigator.vibrate) {
            navigator.vibrate([120, 40, 260]);
          }
          sonarAcordeSintetico([523.25, 659.25, 783.99, 1046.5, 1318.5], 1.2);

          setTimeout(() => {
            if (configRitual.destinoCallback) {
              configRitual.destinoCallback();
            }
          }, 680);
        }
        return nuevo;
      });
    }, 95);

    return () => clearInterval(timer);
  }, [pantalla, pulgarIzqActivo, pulgarDerActivo, vibracionActiva, configRitual, sonarAcordeSintetico]);

  /* ==========================================================================
     REACTIVIDAD DEL ORBE DEL JUGADOR A LA VOZ AMBIENTAL DE LA SALA
     ========================================================================== */
  useEffect(() => {
    if (pantalla !== 'JUEGO' || subFaseJuego !== 'JUGADOR_ACTIVO') {
      setAmplitudVozJugador(0);
      return;
    }

    let animId;
    let audioContextMic;

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        streamMicAmbienteRef.current = stream;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioContextMic = new Ctx();
        const source = audioContextMic.createMediaStreamSource(stream);
        const analyser = audioContextMic.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const leerVolumen = () => {
          analyser.getByteFrequencyData(dataArray);
          const promedio = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAmplitudVozJugador(Math.min(1, promedio / 95));
          animId = requestAnimationFrame(leerVolumen);
        };
        leerVolumen();
      })
      .catch(() => {
        // Pulso orgánico suave si no se concedió micrófono ambiental
        let t = 0;
        const loopSuave = () => {
          t += 0.05;
          setAmplitudVozJugador(0.15 + Math.abs(Math.sin(t)) * 0.2);
          animId = requestAnimationFrame(loopSuave);
        };
        loopSuave();
      });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (streamMicAmbienteRef.current) {
        streamMicAmbienteRef.current.getTracks().forEach((tr) => tr.stop());
      }
      if (audioContextMic) audioContextMic.close().catch(() => {});
    };
  }, [pantalla, subFaseJuego]);

  /* ==========================================================================
     DETECTOR DE PASOS FÍSICOS (ACELERÓMETRO) PARA RETOS DE CAMINATA
     ========================================================================== */
  useEffect(() => {
    if (
      pantalla !== 'JUEGO' ||
      subFaseJuego !== 'JUGADOR_ACTIVO' ||
      retoActual?.tipoMecanica !== 'CAMINATA_PEREGRINAJE' ||
      !sensoresMovimientoActivos
    ) {
      return;
    }

    let ultimoPasoMs = 0;
    const manejarMovimiento = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitud = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const ahora = Date.now();
      if (magnitud > 13.2 && ahora - ultimoPasoMs > 420) {
        ultimoPasoMs = ahora;
        setPasosCaminados((prev) => prev + 1);
      }
    };

    window.addEventListener('devicemotion', manejarMovimiento);
    return () => window.removeEventListener('devicemotion', manejarMovimiento);
  }, [pantalla, subFaseJuego, retoActual, sensoresMovimientoActivos]);

  /* ==========================================================================
     FLUJO DEL JUEGO EN VIVO: INICIO, SELECCIÓN DE JUGADOR Y PREGUNTA DEL DM
     ========================================================================== */
  const iniciarJuegoTrasConfiguracion = () => {
    lanzarRitualPulgares({
      titulo: 'Ritual de Apertura del Secreto Sagrado',
      subtitulo: 'Sostén la Tablet horizontalmente y mantén ambos pulgares en los círculos durante 3 segundos',
      colorLuz: dmPerfil.colorHex,
      alCompletar: () => {
        setPantalla('JUEGO');
        setSubFaseJuego('INTRO_HISTORIA');
        setEraActualNum(1);
        setIndiceRetoEnEra(0);
        setConviccionHP(10);
        setVueltaNumero(1);
        setJugadores((prev) => prev.map((j) => ({ ...j, disponible: true, poderUsado: false })));
        hablarConVozDM(dmPerfil.introHistoria);
      }
    });
  };

  const concederPermisoYPrepararReto = async (eraNum = eraActualNum, idxReto = indiceRetoEnEra) => {
    sonarAcordeSintetico([523.25, 659.25, 1046.5], 0.6);
    setSubFaseJuego('ELEGIR_JUGADOR');
    setOpcionesOcultasIds([]);
    setPasosCaminados(0);
    setTranscripcionVoz('');

    // Cargar el reto (desde Gemini si hay API Key, o desde la matriz multimodal de la Era)
    const listaEra = NODOS_MULTIMODALES_POR_ERA[eraNum] || NODOS_MULTIMODALES_POR_ERA[1];
    const retoFallback = listaEra[idxReto % listaEra.length];
    setRetoActual(retoFallback);

    hablarConVozDM(
      `Era ${eraNum}: ${TITULOS_OCHO_ERAS[eraNum - 1].nombre}. ¿Quién de los jugadores disponibles tomará el desafío en este turno?`
    );

    if (geminiApiKey && geminiApiKey.trim() !== '') {
      setCargandoRetoIA(true);
      try {
        const generado = await generarDesafioConGemini({
          apiKey: geminiApiKey,
          numeroEra: eraNum,
          dmPerfil,
          nombreFamilia: 'el equipo',
          conviccionHP,
          modoPartida: modoEstilo,
          indiceRetoEnEra: idxReto
        });
        setRetoActual(generado);
      } catch (e) {
        // Conserva el reto multimodal local si falla la red
      } finally {
        setCargandoRetoIA(false);
      }
    }
  };

  const elegirJugadorParaElTurno = (jugador) => {
    if (!jugador.disponible) return;
    const clase = CLASES_ROLES[jugador.rolIdx];
    setJugadorActivoId(jugador.id);
    sonarAcordeSintetico([523.25, 659.25, 783.99], 0.5);

    // 1. Todos los demás jugadores desaparecen con una animación energética
    setSubFaseJuego('ANIMACION_DESVANECER_OTROS');

    setTimeout(() => {
      // 2. Acción de Transición Poderosa cuando el jugador toma el control de la Tablet
      lanzarRitualPulgares({
        titulo: `${jugador.nombre} (${clase.nombre}) Toma el Control`,
        subtitulo: `${jugador.nombre}, coloca ambos pulgares durante 3 segundos para recibir el desafío`,
        colorLuz: clase.color,
        alCompletar: () => {
          setPantalla('JUEGO');
          setSubFaseJuego('DM_PREGUNTA');

          const locucionCompleta = `${retoActual.narrativaDM} Busquen en su Biblia física ${retoActual.citaBiblia}. ${retoActual.pregunta} ${retoActual.instruccionInput}`;
          hablarConVozDM(locucionCompleta, () => {
            // 3. Al terminar la pregunta, el círculo del DM se encoge hacia la esquina superior izquierda
            // y el círculo del jugador ocupa el centro junto con la pregunta al 70% arriba
            setSubFaseJuego('JUGADOR_ACTIVO');
          });
        }
      });
    }, 850);
  };

  /* ==========================================================================
     RESOLUCIÓN DE DESAFÍOS Y DEVOLUCIÓN DE CONTROL AL SYSTEM DM
     ========================================================================== */
  const completarTurnoYDevolverControlAlDM = (fueCorrecto, comentarioExtraDM = '') => {
    if (!jugadorActivo) return;
    const clase = CLASES_ROLES[jugadorActivo.rolIdx];

    // Poner al jugador en enfriamiento (gris) hasta que todos los demás jueguen
    let nuevaLista = jugadores.map((j) => {
      if (j.id === jugadorActivo.id && clase.id !== 'noble') {
        return { ...j, disponible: false };
      }
      return j;
    });

    if (!nuevaLista.some((j) => j.disponible)) {
      nuevaLista = nuevaLista.map((j) => ({ ...j, disponible: true }));
      setVueltaNumero((v) => v + 1);
    }
    setJugadores(nuevaLista);

    if (fueCorrecto) {
      if (clase.id === 'juez' || clase.id === 'proselito') {
        setConviccionHP((hp) => Math.min(10, hp + 1));
      }
    } else if (clase.id !== 'sacerdote') {
      setConviccionHP((hp) => Math.max(1, hp - 1));
    }

    // Acción de transición cuando el jugador devuelve el control al System DM
    lanzarRitualPulgares({
      titulo: `${jugadorActivo.nombre} Devuelve el Control al Guía`,
      subtitulo: 'Mantén ambos pulgares durante 3 segundos para sellar la respuesta y escuchar la revelación',
      colorLuz: fueCorrecto ? '#10b981' : '#f43f5e',
      alCompletar: () => {
        setPantalla('JUEGO');
        setSubFaseJuego('REVELACION_HILO');
        setJugadorActivoId(null);

        const textoFinal = fueCorrecto
          ? `${comentarioExtraDM || `¡Excelente trabajo, ${jugadorActivo.nombre}!`} ${retoActual.hiloDorado}`
          : `${comentarioExtraDM || `Necesitamos meditar un poco más en ${retoActual.citaBiblia}.`} ${retoActual.hiloDorado}`;

        setMensajeFeedbackDM(textoFinal);
        hablarConVozDM(textoFinal);
      }
    });
  };

  const avanzarAlSiguienteNodoOEra = () => {
    const siguienteRetoIdx = indiceRetoEnEra + 1;
    if (siguienteRetoIdx < retosMetaPorEra) {
      setIndiceRetoEnEra(siguienteRetoIdx);
      concederPermisoYPrepararReto(eraActualNum, siguienteRetoIdx);
    } else if (eraActualNum < 8) {
      const siguienteEra = eraActualNum + 1;
      setEraActualNum(siguienteEra);
      setIndiceRetoEnEra(0);
      concederPermisoYPrepararReto(siguienteEra, 0);
    } else {
      setSubFaseJuego('FIN_PARTIDA');
      hablarConVozDM(
        '¡Felicidades! Han completado las ocho eras del Secreto Sagrado, desde Génesis hasta Revelación. ¡El Reino Mesiánico ha triunfado para la gloria eterna de Jehová!'
      );
    }
  };

  /* ==========================================================================
     MICRÓFONO DEDICADO (PUSH-TO-TALK: SOLO ESCUCHA AL MANTENER PRESIONADO)
     ========================================================================== */
  const iniciarEscuchaPushToTalk = (e) => {
    e.preventDefault();
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    setManteniendoMic(true);

    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.lang = 'es-ES';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let texto = '';
      for (let i = 0; i < event.results.length; i++) {
        texto += event.results[i][0].transcript + ' ';
      }
      setTranscripcionVoz(texto.trim());
    };

    reconocimientoVozRef.current = rec;
    try {
      rec.start();
    } catch (err) {}
  };

  const soltarEscuchaPushToTalk = async () => {
    setManteniendoMic(false);
    if (reconocimientoVozRef.current) {
      try {
        reconocimientoVozRef.current.stop();
      } catch (err) {}
    }

    if (subFaseJuego === 'INTRO_HISTORIA' && transcripcionVoz.trim().length > 0) {
      concederPermisoYPrepararReto(1, 0);
      return;
    }

    if (subFaseJuego === 'JUGADOR_ACTIVO' && transcripcionVoz.trim().length > 3) {
      setEvaluandoIA(true);
      try {
        const res = await evaluarExplicacionFamiliarConGemini({
          apiKey: geminiApiKey,
          numeroEra: eraActualNum,
          dmPerfil,
          nombreJugador: jugadorActivo?.nombre || 'Jugador',
          citaBiblia: retoActual.citaBiblia,
          preguntaActual: retoActual.pregunta,
          explicacionDelJugador: transcripcionVoz
        });
        completarTurnoYDevolverControlAlDM(res.aprobado, res.comentarioDM);
      } catch (e) {
        completarTurnoYDevolverControlAlDM(true);
      } finally {
        setEvaluandoIA(false);
      }
    }
  };

  /* ==========================================================================
     CÁMARA PARA VERIFICAR LA BIBLIA FÍSICA
     ========================================================================== */
  const abrirCamaraBiblia = async () => {
    setCamaraActiva(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamCamaraRef.current = stream;
      if (videoCamaraRef.current) {
        videoCamaraRef.current.srcObject = stream;
      }
    } catch (e) {}
  };

  const capturarYVerificarBiblia = async () => {
    setEvaluandoIA(true);
    let base64 = '';
    try {
      if (videoCamaraRef.current && videoCamaraRef.current.videoWidth > 0) {
        const c = document.createElement('canvas');
        c.width = 480;
        c.height = 360;
        c.getContext('2d').drawImage(videoCamaraRef.current, 0, 0, c.width, c.height);
        base64 = c.toDataURL('image/jpeg', 0.75).split(',')[1];
      }
      if (streamCamaraRef.current) {
        streamCamaraRef.current.getTracks().forEach((t) => t.stop());
      }
      setCamaraActiva(false);

      const veredicto = await verificarBibliaConCamaraGemini({
        apiKey: geminiApiKey,
        base64JpegSinPrefijo: base64,
        citaBiblia: retoActual.citaBiblia,
        dmPerfil,
        nombreJugador: jugadorActivo?.nombre || 'Jugador'
      });
      completarTurnoYDevolverControlAlDM(veredicto.aprobado, veredicto.comentarioDM);
    } catch (e) {
      completarTurnoYDevolverControlAlDM(true);
    } finally {
      setEvaluandoIA(false);
    }
  };

  /* ==========================================================================
     GUARDAR Y CERRAR PARTIDA (SIEMPRE DISPONIBLES ARRIBA A LA DERECHA)
     ========================================================================== */
  const guardarPartidaActual = () => {
    try {
      const datos = {
        dmId,
        modoEstilo,
        jugadores,
        eraActualNum,
        indiceRetoEnEra,
        conviccionHP,
        tokensOracion,
        vueltaNumero,
        fecha: new Date().toLocaleString('es-ES')
      };
      localStorage.setItem('ss_partida_guardada_v4', JSON.stringify(datos));
      setNotificacionGuardado('Partida Guardada');
      setTimeout(() => setNotificacionGuardado(''), 2200);
    } catch (e) {}
  };

  const cargarPartidaGuardada = () => {
    try {
      const raw = localStorage.getItem('ss_partida_guardada_v4');
      if (!raw) return;
      const d = JSON.parse(raw);
      setDmId(d.dmId || 'historiador');
      setModoEstilo(d.modoEstilo || 'ESTANDAR');
      setJugadores(d.jugadores || jugadores);
      setEraActualNum(d.eraActualNum || 1);
      setIndiceRetoEnEra(d.indiceRetoEnEra || 0);
      setConviccionHP(d.conviccionHP || 10);
      setTokensOracion(d.tokensOracion ?? 2);
      setVueltaNumero(d.vueltaNumero || 1);
      setPantalla('JUEGO');
      setSubFaseJuego('ELEGIR_JUGADOR');
    } catch (e) {}
  };

  return (
    <div
      onClick={desbloquearAudioAlTocar}
      className="relative w-screen h-screen overflow-hidden select-none font-sans text-white bg-slate-950"
    >
      {/* 1. IMAGEN DE FONDO PERSONALIZADA DE MONTAÑA */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-transform duration-[15000ms] ease-out scale-105"
        style={{ backgroundImage: `url('${URL_FONDO_MONTANA}')` }}
      />

      {/* Sutil velo atmosférico para garantizar contraste con el cristal */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/45 pointer-events-none" />

      {/* 2. CAPA ANIMADA EN CANVAS: NIEBLA MÍSTICA, BANDADA DE AVES EN LA DISTANCIA Y BRILLO SOLAR */}
      <canvas ref={canvasAtmosferaRef} className="fixed inset-0 z-10 pointer-events-none" />

      {/* ====================================================================
          PANTALLA 0: ANIMACIÓN DE ARRANQUE (BOOT CON EL LOGO OFICIAL)
          ==================================================================== */}
      {pantalla === 'BOOT_LOGO' && (
        <section
          onClick={() => setPantalla('MENU_PRINCIPAL')}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 cursor-pointer ${
            faseBoot === 2 ? 'bg-slate-950/0 opacity-0' : 'bg-slate-950/90 opacity-100'
          }`}
        >
          <div
            className={`relative flex flex-col items-center transition-all duration-1000 transform ${
              faseBoot === 0
                ? 'scale-75 opacity-0 blur-md'
                : faseBoot === 1
                ? 'scale-100 opacity-100 blur-0'
                : 'scale-110 opacity-0'
            }`}
          >
            {/* Halo luminoso detrás del logo */}
            <div className="absolute -inset-12 rounded-full bg-cyan-400/25 blur-3xl animate-pulse pointer-events-none" />
            <img
              src={URL_LOGO_OFICIAL}
              alt="Secreto Sagrado"
              className="w-72 md:w-96 object-contain drop-shadow-[0_0_45px_rgba(255,255,255,0.85)]"
            />
            <span className="mt-8 text-xs tracking-[0.35em] uppercase text-white/80 font-bold animate-pulse">
              Toca para despertar la revelación
            </span>
          </div>
        </section>
      )}

      {/* ====================================================================
          PANTALLA 1: MENÚ PRINCIPAL (TEXTO PURO A LA IZQUIERDA SIN CAJAS)
          ==================================================================== */}
      {pantalla === 'MENU_PRINCIPAL' && (
        <section className="relative z-20 w-full h-full flex items-center justify-between px-10 md:px-24">
          {/* Opciones a la izquierda: SOLO las palabras sin contenedores, brillan al tocarlas */}
          <nav className="flex flex-col items-start gap-7">
            <button
              onClick={() => {
                sonarAcordeSintetico([523.25, 659.25, 783.99]);
                setPantalla('SETUP_NARRADOR');
              }}
              className="bg-transparent border-none text-left text-4xl md:text-6xl font-black tracking-wide text-white/90 hover:text-white active:scale-95 transition-all duration-300 hover:translate-x-3 hover:drop-shadow-[0_0_28px_rgba(255,255,255,1)] focus:outline-none"
            >
              Iniciar
            </button>

            {localStorage.getItem('ss_partida_guardada_v4') && (
              <button
                onClick={cargarPartidaGuardada}
                className="bg-transparent border-none text-left text-3xl md:text-5xl font-extrabold tracking-wide text-amber-200/90 hover:text-amber-100 active:scale-95 transition-all duration-300 hover:translate-x-3 hover:drop-shadow-[0_0_28px_rgba(253,224,71,1)] focus:outline-none"
              >
                Continuar
              </button>
            )}

            <button
              onClick={() => {
                sonarAcordeSintetico([440, 554.37, 659.25]);
                setPantalla('CONFIGURACION');
              }}
              className="bg-transparent border-none text-left text-4xl md:text-6xl font-black tracking-wide text-white/85 hover:text-white active:scale-95 transition-all duration-300 hover:translate-x-3 hover:drop-shadow-[0_0_28px_rgba(255,255,255,1)] focus:outline-none"
            >
              Configuración
            </button>
          </nav>

          {/* Logo Oficial Flotando a la Derecha */}
          <div className="hidden sm:flex flex-col items-end pointer-events-none">
            <img
              src={URL_LOGO_OFICIAL}
              alt="Logo Secreto Sagrado"
              className="w-64 md:w-80 object-contain drop-shadow-[0_12px_35px_rgba(0,0,0,0.45)] animate-[pulse_5s_ease-in-out_infinite]"
            />
          </div>
        </section>
      )}

      {/* ====================================================================
          PASO LINEAL 1: NARRADOR (CAJAS GLASSMORPHIC PARA EL ESTILO DE DM)
          ==================================================================== */}
      {pantalla === 'SETUP_NARRADOR' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12">
          {/* Barra Superior Izquierda: Regresar y Menú Principal */}
          <header className="flex items-center gap-4">
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
            >
              ← Regresar
            </button>
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-5 py-2.5 rounded-full bg-black/25 hover:bg-white/20 backdrop-blur-xl border border-white/25 text-xs font-bold tracking-wider uppercase transition-all"
            >
              Menú Principal
            </button>
          </header>

          {/* Centro: Selección Glassmorphic de Narrador */}
          <main className="my-auto max-w-5xl w-full mx-auto flex flex-col items-center gap-6">
            <div className="text-center">
              <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200 drop-shadow">
                Paso 1 de 3 • Narrador
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg mt-1">
                Elige el Estilo del Guía
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {CATALOGO_DMS.map((dm) => {
                const activo = dm.id === dmId;
                return (
                  <button
                    key={dm.id}
                    onClick={() => {
                      setDmId(dm.id);
                      sonarAcordeSintetico([523.25, 659.25]);
                    }}
                    style={{
                      boxShadow: activo ? `0 0 35px ${dm.colorHex}66` : undefined,
                      borderColor: activo ? '#ffffff' : 'rgba(255,255,255,0.35)'
                    }}
                    className={`p-5 rounded-3xl backdrop-blur-2xl border text-left transition-all duration-300 flex flex-col gap-2 ${
                      activo ? 'bg-white/30 scale-[1.03]' : 'bg-slate-950/35 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{dm.icono}</span>
                      <span className="font-black text-base md:text-lg leading-tight">{dm.nombre}</span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">{dm.subtitulo}</p>
                  </button>
                );
              })}
            </div>
          </main>

          {/* Abajo al Centro: Botón Continuar */}
          <footer className="flex justify-center">
            <button
              onClick={() => {
                sonarAcordeSintetico([523.25, 659.25, 783.99]);
                setPantalla('SETUP_PARTIDA');
              }}
              className="px-12 py-4 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-2xl border border-white/70 font-black text-base tracking-widest uppercase shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-105 transition-all"
            >
              Continuar →
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          PASO LINEAL 2: PARTIDA (NOMBRES Y ROLES, HASTA 8 JUGADORES MÁXIMO)
          ==================================================================== */}
      {pantalla === 'SETUP_PARTIDA' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12">
          <header className="flex items-center gap-4">
            <button
              onClick={() => setPantalla('SETUP_NARRADOR')}
              className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
            >
              ← Regresar
            </button>
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-5 py-2.5 rounded-full bg-black/25 hover:bg-white/20 backdrop-blur-xl border border-white/25 text-xs font-bold tracking-wider uppercase transition-all"
            >
              Menú Principal
            </button>
          </header>

          <main className="my-auto max-w-5xl w-full mx-auto flex flex-col items-center gap-5">
            <div className="text-center">
              <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200 drop-shadow">
                Paso 2 de 3 • Partida ({jugadores.length}/8 Jugadores)
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg mt-1">
                Registra a los Jugadores y su Rol
              </h2>
            </div>

            {/* Caja Glassmorphic para Añadir Jugador (Máximo 8) */}
            {jugadores.length < 8 && (
              <div className="w-full max-w-3xl p-4 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/50 flex flex-wrap items-center gap-3 shadow-2xl">
                <input
                  type="text"
                  value={nuevoNombreInput}
                  onChange={(e) => setNuevoNombreInput(e.target.value)}
                  placeholder="Escribe el nombre del jugador..."
                  className="flex-1 min-w-[180px] px-4 py-3 rounded-2xl bg-slate-950/40 border border-white/40 text-sm font-bold text-white placeholder-white/60 focus:outline-none focus:border-white"
                />
                <select
                  value={nuevoRolIdxInput}
                  onChange={(e) => setNuevoRolIdxInput(Number(e.target.value))}
                  className="px-4 py-3 rounded-2xl bg-slate-950/50 border border-white/40 text-sm font-bold text-white focus:outline-none"
                >
                  {CLASES_ROLES.map((r, i) => (
                    <option key={r.id} value={i} className="bg-slate-900 text-white">
                      {r.icono} {r.nombre}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!nuevoNombreInput.trim() || jugadores.length >= 8) return;
                    setJugadores([
                      ...jugadores,
                      {
                        id: 'j_' + Date.now(),
                        nombre: nuevoNombreInput.trim(),
                        rolIdx: nuevoRolIdxInput,
                        disponible: true,
                        poderUsado: false
                      }
                    ]);
                    setNuevoNombreInput('');
                    setNuevoRolIdxInput((nuevoRolIdxInput + 1) % CLASES_ROLES.length);
                    sonarAcordeSintetico([587.33, 880]);
                  }}
                  className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all"
                >
                  + Añadir ({8 - jugadores.length} disp.)
                </button>
              </div>
            )}

            {/* Tarjetas Glassmorphic de los Jugadores Registrados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full max-h-[42vh] overflow-y-auto p-1">
              {jugadores.map((jug, idx) => {
                const clase = CLASES_ROLES[jug.rolIdx];
                return (
                  <div
                    key={jug.id}
                    style={{ borderColor: clase.color }}
                    className="p-4 rounded-3xl bg-slate-950/40 backdrop-blur-2xl border-2 flex flex-col items-center gap-2 relative shadow-xl"
                  >
                    {jugadores.length > 1 && (
                      <button
                        onClick={() => setJugadores(jugadores.filter((_, i) => i !== idx))}
                        className="absolute top-2.5 right-3 text-xs text-white/60 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const copia = [...jugadores];
                        copia[idx].rolIdx = (copia[idx].rolIdx + 1) % CLASES_ROLES.length;
                        setJugadores(copia);
                      }}
                      style={{ backgroundColor: clase.color }}
                      className="w-12 h-12 rounded-full grid place-items-center text-2xl shadow-lg"
                      title="Toca para cambiar de Rol"
                    >
                      {clase.icono}
                    </button>
                    <input
                      type="text"
                      value={jug.nombre}
                      onChange={(e) => {
                        const copia = [...jugadores];
                        copia[idx].nombre = e.target.value;
                        setJugadores(copia);
                      }}
                      className="w-full bg-white/10 border border-white/25 rounded-xl px-2 py-1 text-center font-extrabold text-xs text-white focus:outline-none"
                    />
                    <span className="text-[11px] font-black text-amber-200">{clase.nombre}</span>
                    <span className="text-[10px] text-white/75 text-center leading-tight">{clase.ventaja}</span>
                  </div>
                );
              })}
            </div>
          </main>

          <footer className="flex justify-center">
            <button
              onClick={() => {
                sonarAcordeSintetico([523.25, 659.25, 783.99]);
                setPantalla('SETUP_ESTILO');
              }}
              className="px-12 py-4 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-2xl border border-white/70 font-black text-base tracking-widest uppercase shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-105 transition-all"
            >
              Continuar →
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          PASO LINEAL 3: ESTILO (EXPRESS 30 MIN VS ESTÁNDAR COMPLETO)
          ==================================================================== */}
      {pantalla === 'SETUP_ESTILO' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12">
          <header className="flex items-center gap-4">
            <button
              onClick={() => setPantalla('SETUP_PARTIDA')}
              className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
            >
              ← Regresar
            </button>
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-5 py-2.5 rounded-full bg-black/25 hover:bg-white/20 backdrop-blur-xl border border-white/25 text-xs font-bold tracking-wider uppercase transition-all"
            >
              Menú Principal
            </button>
          </header>

          <main className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center gap-8">
            <div className="text-center">
              <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200 drop-shadow">
                Paso 3 de 3 • Estilo
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg mt-1">
                Selecciona la Duración de la Partida
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <button
                onClick={() => setModoEstilo('EXPRESS')}
                className={`p-8 rounded-[34px] backdrop-blur-2xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${
                  modoEstilo === 'EXPRESS'
                    ? 'bg-white/30 border-white scale-105 shadow-[0_0_45px_rgba(255,255,255,0.45)]'
                    : 'bg-slate-950/40 border-white/30 hover:bg-white/15'
                }`}
              >
                <span className="text-4xl">⚡</span>
                <h3 className="text-2xl font-black">Express (~30 Minutos)</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Recorre las <strong>8 Eras completas</strong> con una selección directa de retos clave por época, ideal para una sesión familiar ágil y dinámica.
                </p>
              </button>

              <button
                onClick={() => setModoEstilo('ESTANDAR')}
                className={`p-8 rounded-[34px] backdrop-blur-2xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${
                  modoEstilo === 'ESTANDAR'
                    ? 'bg-white/30 border-white scale-105 shadow-[0_0_45px_rgba(255,255,255,0.45)]'
                    : 'bg-slate-950/40 border-white/30 hover:bg-white/15'
                }`}
              >
                <span className="text-4xl">🗺️</span>
                <h3 className="text-2xl font-black">Estándar (Recorrido Completo)</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Experiencia profunda a través de todos los nodos y desafíos sensoriales de las <strong>8 Eras bíblicas</strong>.
                </p>
              </button>
            </div>
          </main>

          <footer className="flex justify-center">
            <button
              onClick={iniciarJuegoTrasConfiguracion}
              className="px-14 py-4 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-200 text-slate-950 font-black text-base tracking-widest uppercase shadow-[0_0_45px_rgba(254,240,138,0.85)] hover:scale-105 transition-all"
            >
              Continuar al Ritual de Inicio →
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          PANTALLA DE CONFIGURACIÓN GENERAL (APIs, SONIDO, SENSORES Y AJUSTES)
          ==================================================================== */}
      {pantalla === 'CONFIGURACION' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
          <header className="flex items-center justify-between">
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-6 py-2.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-extrabold tracking-wider uppercase transition-all"
            >
              ← Menú Principal
            </button>
            <h2 className="text-2xl font-black tracking-wide">Configuración del Sistema</h2>
            <div className="w-28" />
          </header>

          <main className="my-auto max-w-3xl w-full mx-auto p-7 rounded-[36px] bg-slate-950/55 backdrop-blur-2xl border border-white/35 shadow-2xl flex flex-col gap-5">
            {/* API Key de Gemini */}
            <div className="flex flex-col gap-2 pb-4 border-b border-white/15">
              <label className="text-xs font-black tracking-widest uppercase text-cyan-300">
                🤖 Clave de API de Google Gemini (Storytelling, Preguntas y Visión)
              </label>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => {
                    setGeminiApiKey(e.target.value);
                    try {
                      localStorage.setItem('ss_gemini_api_key', e.target.value.trim());
                    } catch (err) {}
                  }}
                  placeholder="AIzaSy..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/30 text-sm text-white focus:outline-none focus:border-cyan-300"
                />
              </div>
            </div>

            {/* Volumen de Música del Menú */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15">
              <div>
                <div className="font-extrabold text-sm">🎵 Volumen de Música del Menú</div>
                <div className="text-xs text-white/70">Se detiene automáticamente cuando comienza la partida</div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volumenMusica}
                onChange={(e) => setVolumenMusica( parseFloat(e.target.value) )}
                className="w-40 accent-cyan-400"
              />
            </div>

            {/* Interruptores de Voz, Vibración y Sensores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setVozSinteticaActiva((v) => !v)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  vozSinteticaActiva ? 'bg-emerald-500/25 border-emerald-300' : 'bg-white/5 border-white/20 opacity-60'
                }`}
              >
                <div className="font-black text-xs uppercase">🔊 Voz del Narrador</div>
                <div className="text-[11px] mt-1">{vozSinteticaActiva ? 'Activada' : 'Silenciada'}</div>
              </button>

              <button
                onClick={() => setVibracionActiva((v) => !v)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  vibracionActiva ? 'bg-cyan-500/25 border-cyan-300' : 'bg-white/5 border-white/20 opacity-60'
                }`}
              >
                <div className="font-black text-xs uppercase">📳 Vibración Háptica</div>
                <div className="text-[11px] mt-1">{vibracionActiva ? 'Activada' : 'Desactivada'}</div>
              </button>

              <button
                onClick={() => setSensoresMovimientoActivos((v) => !v)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  sensoresMovimientoActivos ? 'bg-amber-500/25 border-amber-300' : 'bg-white/5 border-white/20 opacity-60'
                }`}
              >
                <div className="font-black text-xs uppercase">🧭 Contador de Pasos</div>
                <div className="text-[11px] mt-1">{sensoresMovimientoActivos ? 'Activado' : 'Modo Manual'}</div>
              </button>
            </div>
          </main>

          <footer className="flex justify-center">
            <button
              onClick={() => setPantalla('MENU_PRINCIPAL')}
              className="px-10 py-3.5 rounded-full bg-white text-slate-950 font-black text-xs tracking-widest uppercase"
            >
              Guardar y Volver
            </button>
          </footer>
        </section>
      )}

      {/* ====================================================================
          RITUAL DE 3 SEGUNDOS CON AMBOS PULGARES (TOMAR / DEVOLVER CONTROL)
          ==================================================================== */}
      {pantalla === 'RITUAL_PULGARES' && (
        <section className="fixed inset-0 z-40 flex items-center justify-between px-8 md:px-20 bg-slate-950/60 backdrop-blur-2xl overflow-hidden">
          {/* Resplandor que se extiende desde ambos pulgares hasta inundar toda la pantalla */}
          <div
            style={{
              transform: `scale(${0.2 + (progresoPulgares / 100) * 3.8})`,
              opacity: progresoPulgares / 100,
              background: `radial-gradient(circle, #ffffff 0%, ${configRitual.colorLuz} 55%, transparent 75%)`
            }}
            className="fixed inset-0 pointer-events-none transition-transform duration-100"
          />

          {/* Pantalla blanca total al llegar al 100% */}
          <div
            className={`fixed inset-0 bg-white pointer-events-none transition-opacity duration-500 z-50 ${
              explosionLuzCompleta ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* CÍRCULO DEL PULGAR IZQUIERDO */}
          <button
            onPointerDown={() => setPulgarIzqActivo(true)}
            onPointerUp={() => setPulgarIzqActivo(false)}
            onPointerLeave={() => setPulgarIzqActivo(false)}
            style={{
              borderColor: pulgarIzqActivo ? '#ffffff' : configRitual.colorLuz,
              boxShadow: pulgarIzqActivo ? `0 0 60px ${configRitual.colorLuz}` : undefined
            }}
            className={`relative z-20 w-36 h-36 md:w-44 md:h-44 rounded-full backdrop-blur-2xl border-4 flex flex-col items-center justify-center transition-all duration-200 ${
              pulgarIzqActivo ? 'bg-white/40 scale-110' : 'bg-white/10 animate-pulse'
            }`}
          >
            <span className="text-3xl mb-1">👍</span>
            <span className="text-xs font-black tracking-widest uppercase">Pulgar Izq.</span>
          </button>

          {/* TEXTO CENTRAL E INDICADOR DE LOS 3 SEGUNDOS */}
          <div className="relative z-20 max-w-md text-center flex flex-col items-center gap-4 px-4">
            <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200">
              Transición de Control • {Math.ceil((100 - progresoPulgares) / 33.4)}s
            </span>
            <h2 className="text-2xl md:text-4xl font-black leading-tight drop-shadow-lg">
              {configRitual.titulo}
            </h2>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed">
              {configRitual.subtitulo}
            </p>

            {/* Barra circular/lineal de carga */}
            <div className="w-64 h-2.5 rounded-full bg-white/20 overflow-hidden border border-white/40">
              <div
                style={{ width: `${progresoPulgares}%`, backgroundColor: configRitual.colorLuz }}
                className="h-full transition-all duration-100"
              />
            </div>

            {/* Botón de soporte para pruebas con un solo dedo o ratón en PC */}
            <button
              onPointerDown={() => {
                setPulgarIzqActivo(true);
                setPulgarDerActivo(true);
              }}
              onPointerUp={() => {
                setPulgarIzqActivo(false);
                setPulgarDerActivo(false);
              }}
              className="mt-2 px-5 py-2 rounded-full bg-white/15 border border-white/30 text-[11px] font-bold text-white/85 hover:bg-white/25"
            >
              Mantén presionado aquí si estás en PC con ratón
            </button>
          </div>

          {/* CÍRCULO DEL PULGAR DERECHO */}
          <button
            onPointerDown={() => setPulgarDerActivo(true)}
            onPointerUp={() => setPulgarDerActivo(false)}
            onPointerLeave={() => setPulgarDerActivo(false)}
            style={{
              borderColor: pulgarDerActivo ? '#ffffff' : configRitual.colorLuz,
              boxShadow: pulgarDerActivo ? `0 0 60px ${configRitual.colorLuz}` : undefined
            }}
            className={`relative z-20 w-36 h-36 md:w-44 md:h-44 rounded-full backdrop-blur-2xl border-4 flex flex-col items-center justify-center transition-all duration-200 ${
              pulgarDerActivo ? 'bg-white/40 scale-110' : 'bg-white/10 animate-pulse'
            }`}
          >
            <span className="text-3xl mb-1">👍</span>
            <span className="text-xs font-black tracking-widest uppercase">Pulgar Der.</span>
          </button>
        </section>
      )}

      {/* ====================================================================
          PANTALLA DE JUEGO EN VIVO (EL ORBE LÍQUIDO Y LA COREOGRAFÍA DINÁMICA)
          ==================================================================== */}
      {pantalla === 'JUEGO' && (
        <section className="relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-10">
          {/* ----------------------------------------------------------------
              ESQUINA SUPERIOR IZQUIERDA: ORBE DEL DM RETIRADO CUANDO JUEGA EL JUGADOR
              ---------------------------------------------------------------- */}
          <div className="fixed top-5 left-6 z-30 flex items-center gap-3">
            {subFaseJuego === 'JUGADOR_ACTIVO' ? (
              <div className="flex items-center gap-3 animate-[fadeIn_0.5s_ease-out]">
                <OrbeLiquidoReactivo
                  colorPrimario={dmPerfil.colorHex}
                  colorSecundario={dmPerfil.colorSecundario}
                  amplitudVoz={amplitudVozDM}
                  tamano={76}
                  iconoCentral={dmPerfil.icono}
                  nombreCentral="Guía"
                  enEsquina={true}
                  onClick={() => hablarConVozDM(`${retoActual.pregunta}. ${retoActual.instruccionInput}`)}
                />
                <span className="hidden xl:inline-block text-[11px] font-bold text-white/80 bg-slate-950/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/25">
                  Era {eraActualNum}/8
                </span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-full bg-slate-950/40 backdrop-blur-xl border border-white/35 text-xs font-black tracking-widest uppercase">
                Era {eraActualNum} de 8 • {TITULOS_OCHO_ERAS[eraActualNum - 1].nombre}
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------
              PARTE SUPERIOR CENTRAL (70% DEL ANCHO): CAJA GLASSMORPHIC DE PREGUNTA
              ---------------------------------------------------------------- */}
          {subFaseJuego === 'JUGADOR_ACTIVO' && (
            <div className="w-[70vw] mx-auto mt-1 p-5 rounded-3xl bg-slate-950/45 backdrop-blur-2xl border border-white/45 shadow-[0_15px_45px_rgba(0,0,0,0.45)] text-center z-20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/60 text-amber-200 text-[11px] font-black tracking-widest uppercase mb-1.5">
                📖 Biblia Física: {retoActual.citaBiblia}
              </div>
              <h2 className="text-lg md:text-2xl font-black leading-snug text-white">
                {retoActual.pregunta}
              </h2>
              <p className="text-xs text-cyan-200 font-semibold mt-1">
                {retoActual.instruccionInput}
              </p>
            </div>
          )}

          {/* ----------------------------------------------------------------
              ESQUINA SUPERIOR DERECHA: HP, HERRAMIENTAS, GUARDAR Y CERRAR
              ---------------------------------------------------------------- */}
          <div className="fixed top-5 right-6 z-30 flex items-center gap-2.5">
            {notificacionGuardado && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/80 text-xs font-black">
                ✓ {notificacionGuardado}
              </span>
            )}

            {/* Convicción (HP) */}
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950/45 backdrop-blur-xl border border-white/35">
              <span className="text-[11px] font-black text-amber-200">HP {conviccionHP}/10</span>
              <span className="text-sm">💎</span>
            </div>

            {/* Herramienta: Oración */}
            <button
              onClick={() => {
                if (tokensOracion <= 0) return;
                setTokensOracion((t) => t - 1);
                setConviccionHP((hp) => Math.min(10, hp + 2));
                sonarAcordeSintetico([523.25, 659.25, 1046.5]);
              }}
              title="Herramienta de Oración (+2 HP)"
              className="px-3.5 py-2 rounded-full bg-amber-400/25 hover:bg-amber-400/40 backdrop-blur-xl border border-amber-300/60 text-xs font-black"
            >
              🙏 {tokensOracion}
            </button>

            {/* Herramienta: Poder del Rol Activo */}
            {subFaseJuego === 'JUGADOR_ACTIVO' && jugadorActivo && !jugadorActivo.poderUsado && (
              <button
                onClick={() => {
                  const copia = jugadores.map((j) =>
                    j.id === jugadorActivo.id ? { ...j, poderUsado: true } : j
                  );
                  if (claseJugadorActivo.id === 'patriarca') {
                    const idxApagado = copia.findIndex((j) => !j.disponible);
                    if (idxApagado !== -1) copia[idxApagado].disponible = true;
                  } else if (retoActual.opciones?.length) {
                    const falsas = retoActual.opciones
                      .filter((o) => !o.correcta)
                      .slice(0, 2)
                      .map((o) => o.id);
                    setOpcionesOcultasIds(falsas);
                  }
                  setJugadores(copia);
                  sonarAcordeSintetico([659.25, 880, 1174.66]);
                }}
                className="px-3.5 py-2 rounded-full bg-purple-500/35 hover:bg-purple-500/55 backdrop-blur-xl border border-purple-300 text-xs font-black"
              >
                ⚡ {claseJugadorActivo.nombre}
              </button>
            )}

            {/* Botón Guardar */}
            <button
              onClick={guardarPartidaActual}
              title="Guardar Partida"
              className="px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-xs font-black"
            >
              💾 Guardar
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setPantalla('MENU_PRINCIPAL');
              }}
              title="Cerrar y salir al Menú Principal"
              className="w-9 h-9 rounded-full bg-rose-500/30 hover:bg-rose-500/55 backdrop-blur-xl border border-rose-300/60 grid place-items-center text-xs font-black"
            >
              ✕
            </button>
          </div>

          {/* ================================================================
              NÚCLEO CENTRAL DE LA PANTALLA SEGÚN LA SUB-FASE DEL TURNO
              ================================================================ */}
          <main className="my-auto w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-6">
            {/* SUB-FASE 1: INTRODUCCIÓN DEL DM Y SOLICITUD DE PERMISO */}
            {subFaseJuego === 'INTRO_HISTORIA' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
                <OrbeLiquidoReactivo
                  colorPrimario={dmPerfil.colorHex}
                  colorSecundario={dmPerfil.colorSecundario}
                  amplitudVoz={amplitudVozDM}
                  tamano={235}
                  iconoCentral={dmPerfil.icono}
                  etiquetaSuperior="Guía del Sistema"
                  nombreCentral={dmPerfil.nombre}
                />

                <div className="p-6 rounded-3xl bg-slate-950/45 backdrop-blur-2xl border border-white/40 shadow-2xl">
                  <p className="text-sm md:text-base text-white/95 leading-relaxed">
                    {dmPerfil.introHistoria}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => concederPermisoYPrepararReto(1, 0)}
                    className="px-9 py-4 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-2xl border border-white/80 font-black text-sm tracking-widest uppercase shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-105 transition-all"
                  >
                    ✨ Conceder Permiso y Comenzar
                  </button>

                  <button
                    onPointerDown={iniciarEscuchaPushToTalk}
                    onPointerUp={soltarEscuchaPushToTalk}
                    className={`px-7 py-4 rounded-full backdrop-blur-2xl border font-black text-xs tracking-wider uppercase transition-all ${
                      manteniendoMic
                        ? 'bg-emerald-400 text-slate-950 border-white scale-105 shadow-[0_0_35px_#34d399]'
                        : 'bg-slate-950/45 border-white/40 text-white'
                    }`}
                  >
                    🎙️ {manteniendoMic ? 'Escuchando tu permiso...' : 'Mantén para dar permiso con voz'}
                  </button>
                </div>
              </div>
            )}

            {/* SUB-FASE 2: EL DM PREGUNTA QUIÉN VA A JUGAR Y MUESTRA LOS CÍRCULOS DE JUGADORES */}
            {(subFaseJuego === 'ELEGIR_JUGADOR' || subFaseJuego === 'ANIMACION_DESVANECER_OTROS') && (
              <div className="flex flex-col items-center gap-8 text-center">
                <OrbeLiquidoReactivo
                  colorPrimario={dmPerfil.colorHex}
                  colorSecundario={dmPerfil.colorSecundario}
                  amplitudVoz={amplitudVozDM}
                  tamano={210}
                  iconoCentral={dmPerfil.icono}
                  etiquetaSuperior={`Vuelta ${vueltaNumero}`}
                  nombreCentral={dmPerfil.nombre}
                />

                <p className="text-lg md:text-2xl font-black tracking-wide drop-shadow-lg">
                  {cargandoRetoIA
                    ? 'Preparando el desafío de las Escrituras...'
                    : '¿Quién tomará el desafío en este turno?'}
                </p>

                {/* Círculos de los jugadores debajo del Orbe del DM */}
                <div className="flex flex-wrap items-center justify-center gap-5">
                  {jugadores.map((jug) => {
                    const clase = CLASES_ROLES[jug.rolIdx];
                    const fueElegido = jugadorActivoId === jug.id;
                    const desvanecer =
                      subFaseJuego === 'ANIMACION_DESVANECER_OTROS' && !fueElegido;

                    return (
                      <button
                        key={jug.id}
                        disabled={!jug.disponible || subFaseJuego === 'ANIMACION_DESVANECER_OTROS'}
                        onClick={() => elegirJugadorParaElTurno(jug)}
                        style={{
                          backgroundColor: jug.disponible ? `${clase.color}33` : 'rgba(15,23,42,0.4)',
                          borderColor: jug.disponible ? clase.color : 'rgba(148,163,184,0.3)',
                          boxShadow: jug.disponible ? `0 0 28px ${clase.color}66` : 'none'
                        }}
                        className={`w-28 h-28 md:w-32 md:h-32 rounded-full backdrop-blur-2xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-700 ${
                          desvanecer
                            ? 'scale-0 opacity-0 pointer-events-none'
                            : fueElegido
                            ? 'scale-125 ring-4 ring-white'
                            : jug.disponible
                            ? 'hover:scale-110 cursor-pointer'
                            : 'grayscale opacity-35 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-2xl mb-1">{clase.icono}</span>
                        <span className="font-black text-xs md:text-sm leading-tight truncate max-w-full">
                          {jug.nombre}
                        </span>
                        <span className="text-[10px] font-bold text-white/80 mt-0.5">
                          {jug.disponible ? clase.nombre.replace('El ', '') : 'En espera'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-FASE 3: EL DM ENUNCIA LA PREGUNTA ANTES DE RETIRARSE A LA ESQUINA */}
            {subFaseJuego === 'DM_PREGUNTA' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
                <OrbeLiquidoReactivo
                  colorPrimario={dmPerfil.colorHex}
                  colorSecundario={dmPerfil.colorSecundario}
                  amplitudVoz={amplitudVozDM}
                  tamano={230}
                  iconoCentral={dmPerfil.icono}
                  etiquetaSuperior={retoActual.citaBiblia}
                  nombreCentral={dmPerfil.nombre}
                />
                <div className="p-6 rounded-3xl bg-slate-950/50 backdrop-blur-2xl border border-white/40 shadow-2xl">
                  <h3 className="text-xl font-black text-amber-200 mb-2">{retoActual.tituloNodo}</h3>
                  <p className="text-base text-white/95 leading-relaxed mb-3">{retoActual.pregunta}</p>
                  <p className="text-xs text-cyan-200 font-bold">{retoActual.instruccionInput}</p>
                </div>
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setAmplitudVozDM(0);
                    setSubFaseJuego('JUGADOR_ACTIVO');
                  }}
                  className="px-8 py-3 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-xl border border-white/60 text-xs font-black uppercase tracking-widest"
                >
                  Resolver Ahora →
                </button>
              </div>
            )}

            {/* SUB-FASE 4: EL ORBE DEL JUGADOR OCUPA EL CENTRO + MECÁNICA DE INPUT ACTIVA */}
            {subFaseJuego === 'JUGADOR_ACTIVO' && jugadorActivo && (
              <div className="w-full flex flex-col items-center gap-5">
                {/* Orbe del Jugador en el Centro Reaccionando a la Voz */}
                <OrbeLiquidoReactivo
                  colorPrimario={claseJugadorActivo.color}
                  colorSecundario="#ffffff"
                  amplitudVoz={amplitudVozJugador}
                  tamano={165}
                  iconoCentral={claseJugadorActivo.icono}
                  etiquetaSuperior={claseJugadorActivo.nombre}
                  nombreCentral={jugadorActivo.nombre}
                />

                {/* MECÁNICA A: SELECCIÓN MÚLTIPLE GLASSMORPHIC CON BRILLO */}
                {retoActual.tipoMecanica === 'SELECCION_MULTIPLE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full max-w-4xl">
                    {retoActual.opciones?.map((op) => {
                      const oculta = opcionesOcultasIds.includes(op.id);
                      const pistaEscriba = claseJugadorActivo.id === 'escriba' && op.correcta;
                      return (
                        <button
                          key={op.id}
                          disabled={oculta}
                          onClick={() => completarTurnoYDevolverControlAlDM(op.correcta)}
                          className={`p-4 md:p-5 rounded-3xl backdrop-blur-2xl border text-left flex items-center gap-4 transition-all duration-300 ${
                            oculta
                              ? 'opacity-15 pointer-events-none grayscale bg-black/20 border-white/10'
                              : pistaEscriba
                              ? 'bg-amber-400/30 border-amber-200 shadow-[0_0_30px_rgba(253,224,71,0.55)] hover:scale-[1.02]'
                              : 'bg-slate-950/45 hover:bg-white/25 border-white/45 hover:border-white hover:shadow-[0_0_28px_rgba(255,255,255,0.45)] hover:scale-[1.02]'
                          }`}
                        >
                          <span className="text-2xl w-12 h-12 rounded-2xl bg-white/15 border border-white/35 grid place-items-center shrink-0">
                            {op.icono}
                          </span>
                          <div>
                            <div className="font-black text-sm md:text-base text-white">{op.titulo}</div>
                            <div className="text-xs text-white/85 leading-snug mt-0.5">{op.subtitulo}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* MECÁNICA B: CAMINATA FÍSICA CON CONTADOR DE PASOS Y GIROSCOPIO */}
                {retoActual.tipoMecanica === 'CAMINATA_PEREGRINAJE' && (
                  <div className="p-6 rounded-3xl bg-slate-950/50 backdrop-blur-2xl border border-white/45 max-w-xl w-full text-center flex flex-col items-center gap-4">
                    <div className="text-xs font-black tracking-widest uppercase text-cyan-200">
                      🚶 Contador de Pasos y Movimiento Activo
                    </div>
                    <div className="text-3xl font-black">
                      {pasosCaminados} / {retoActual.pasosObjetivo || 12} Pasos
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden border border-white/30">
                      <div
                        style={{
                          width: `${Math.min(100, (pasosCaminados / (retoActual.pasosObjetivo || 12)) * 100)}%`,
                          backgroundColor: claseJugadorActivo.color
                        }}
                        className="h-full transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const nuevo = pasosCaminados + 2;
                          setPasosCaminados(nuevo);
                          if (nuevo >= (retoActual.pasosObjetivo || 12)) {
                            completarTurnoYDevolverControlAlDM(
                              true,
                              `¡Peregrinaje completado con fe por ${jugadorActivo.nombre}!`
                            );
                          }
                        }}
                        className="px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/35 border border-white/50 text-xs font-black"
                      >
                        👣 Dar Paso (+2)
                      </button>
                      {pasosCaminados >= (retoActual.pasosObjetivo || 12) && (
                        <button
                          onClick={() => completarTurnoYDevolverControlAlDM(true)}
                          className="px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 text-xs font-black"
                        >
                          ✓ Completar Recorrido
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* MECÁNICA C: ESCANEO DE LA BIBLIA FÍSICA CON CÁMARA */}
                {retoActual.tipoMecanica === 'CAMARA_ESCRITURA' && (
                  <div className="p-5 rounded-3xl bg-slate-950/50 backdrop-blur-2xl border border-white/45 max-w-xl w-full text-center flex flex-col items-center gap-4">
                    {!camaraActiva ? (
                      <button
                        onClick={abrirCamaraBiblia}
                        className="px-8 py-4 rounded-full bg-cyan-400/30 hover:bg-cyan-400/50 border border-cyan-200 font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                      >
                        📷 Activar Cámara para Verificar {retoActual.citaBiblia}
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <video
                          ref={videoCamaraRef}
                          autoPlay
                          playsInline
                          className="w-64 h-44 object-cover rounded-2xl border-2 border-cyan-300"
                        />
                        <button
                          onClick={capturarYVerificarBiblia}
                          disabled={evaluandoIA}
                          className="px-8 py-3 rounded-full bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest"
                        >
                          {evaluandoIA ? 'Verificando con IA...' : '✨ Capturar y Verificar Escritura'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTÓN DEDICADO DE MICRÓFONO PUSH-TO-TALK (SIEMPRE DISPONIBLE PARA RESPONDER CON VOZ) */}
                <div className="flex flex-col items-center gap-2">
                  {transcripcionVoz && (
                    <div className="px-4 py-1.5 rounded-full bg-slate-950/60 border border-white/30 text-xs text-cyan-200 max-w-lg truncate">
                      «{transcripcionVoz}»
                    </div>
                  )}
                  <button
                    onPointerDown={iniciarEscuchaPushToTalk}
                    onPointerUp={soltarEscuchaPushToTalk}
                    disabled={evaluandoIA}
                    className={`px-8 py-3.5 rounded-full backdrop-blur-2xl border-2 font-black text-xs tracking-widest uppercase transition-all ${
                      manteniendoMic
                        ? 'bg-rose-500 border-white text-white scale-110 shadow-[0_0_40px_#f43f5e]'
                        : 'bg-white/20 hover:bg-white/30 border-white/60 text-white shadow-lg'
                    }`}
                  >
                    {evaluandoIA
                      ? '⏳ Evaluando con Gemini...'
                      : manteniendoMic
                      ? '🔴 Escuchando a la IA... Suelta para enviar'
                      : '🎙️ Mantén presionado para responder con voz'}
                  </button>
                </div>
              </div>
            )}

            {/* SUB-FASE 5: REVELACIÓN DEL HILO DORADO CON EL DM EN EL CENTRO */}
            {subFaseJuego === 'REVELACION_HILO' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
                <OrbeLiquidoReactivo
                  colorPrimario={dmPerfil.colorHex}
                  colorSecundario={dmPerfil.colorSecundario}
                  amplitudVoz={amplitudVozDM}
                  tamano={215}
                  iconoCentral="✨"
                  etiquetaSuperior={`Era ${eraActualNum} • El Hilo Dorado`}
                  nombreCentral={dmPerfil.nombre}
                />
                <div className="p-6 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-amber-300/60 shadow-[0_0_45px_rgba(251,191,36,0.3)]">
                  <p className="text-sm md:text-base text-white/95 leading-relaxed">
                    {mensajeFeedbackDM}
                  </p>
                </div>
                <button
                  onClick={avanzarAlSiguienteNodoOEra}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-amber-300 to-cyan-300 text-slate-950 font-black text-sm tracking-widest uppercase shadow-2xl hover:scale-105 transition-all"
                >
                  Continuar al Siguiente Desafío →
                </button>
              </div>
            )}

            {/* SUB-FASE 6: GRAN FINAL DE LAS 8 ERAS */}
            {subFaseJuego === 'FIN_PARTIDA' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
                <OrbeLiquidoReactivo
                  colorPrimario="#facc15"
                  colorSecundario="#38bdf8"
                  amplitudVoz={0.6}
                  tamano={240}
                  iconoCentral="👑"
                  etiquetaSuperior="Revelación 10:7"
                  nombreCentral="¡Secreto Sagrado Terminado!"
                />
                <div className="p-7 rounded-3xl bg-slate-950/55 backdrop-blur-2xl border border-white/50 shadow-2xl">
                  <h2 className="text-2xl md:text-4xl font-black text-amber-200 mb-3">
                    ¡Victoria del Reino Mesiánico!
                  </h2>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed">
                    Han recorrido en unidad las 8 Eras bíblicas verificando en su Biblia física cómo Jehová cumplió cada promesa desde Génesis 3:15 hasta el Paraíso restaurado de Revelación.
                  </p>
                </div>
                <button
                  onClick={() => setPantalla('MENU_PRINCIPAL')}
                  className="px-10 py-4 rounded-full bg-white text-slate-950 font-black text-xs tracking-widest uppercase"
                >
                  Volver al Menú Principal
                </button>
              </div>
            )}
          </main>

          <div className="h-2" />
        </section>
      )}
    </div>
  );
}