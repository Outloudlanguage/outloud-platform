// src/Secreto-Sagrado/SecretoSagradoLanding.jsx
import React, { useState, useEffect, useRef } from 'react';

/* ==========================================================================
   1. CATÁLOGO DE LOS 6 ARQUETIPOS DEL SYSTEM DM (NO ES DIOS • APOC. 19:10)
   ========================================================================== */
const CATALOGO_DMS = [
  {
    id: 'pastor',
    nombre: 'El Pastor Amoroso',
    subtitulo: 'Cálido y Compasivo',
    icono: '🌿',
    colorHex: '#10b981',
    gradiente: 'from-emerald-400 to-teal-600',
    fraseControl: '«Aun cuando la sombra del pecado cayó en Edén, Jehová encendió de inmediato una lámpara de esperanza.»'
  },
  {
    id: 'historiador',
    nombre: 'El Historiador Dedicado',
    subtitulo: 'Cronología y Mapas',
    icono: '📜',
    colorHex: '#38bdf8',
    gradiente: 'from-sky-400 to-blue-600',
    fraseControl: '«Cada fecha, eslabón genealógico y decreto real quedó registrado con exactitud documental.»'
  },
  {
    id: 'profeta',
    nombre: 'El Profeta Exhortador',
    subtitulo: 'Tipos y Cumplimientos',
    icono: '🔥',
    colorHex: '#a855f7',
    gradiente: 'from-purple-400 to-indigo-600',
    fraseControl: '«¡Escuchen con atención! Ninguna palabra dicha por Jehová vuelve sin haber cumplido Su propósito.»'
  },
  {
    id: 'rey',
    nombre: 'El Rey Valiente',
    subtitulo: 'Pactos y Soberanía',
    icono: '👑',
    colorHex: '#f59e0b',
    gradiente: 'from-amber-400 to-orange-600',
    fraseControl: '«Desde Edén hasta Sión, la cuestión suprema es la Soberanía legítima de Jehová y el trono de Su Ungido.»'
  },
  {
    id: 'angel',
    nombre: 'El Ángel Mensajero',
    subtitulo: 'Siervo Fiel (Apoc. 19:10)',
    icono: '✨',
    colorHex: '#22d3ee',
    gradiente: 'from-cyan-300 to-sky-500',
    fraseControl: '«Solo soy un coesclavo tuyo y de tus hermanos. ¡Abran las Escrituras y contemplen la luz del Secreto Sagrado!»'
  },
  {
    id: 'guerrero',
    nombre: 'El Poderoso Guerrero',
    subtitulo: 'Defensa de la Fe',
    icono: '⚔️',
    colorHex: '#f97316',
    gradiente: 'from-orange-400 to-red-600',
    fraseControl: '«¡Empuñen la Espada del Espíritu! La Serpiente intentó cortar el linaje una y otra vez, pero fracasó.»'
  }
];

/* ==========================================================================
   2. CATÁLOGO DE LAS 8 CLASES DE JUGADORES PARA EL ROSTER POR VUELTAS
   ========================================================================== */
const CLASES_JUGADOR = [
  { id: 'escriba', nombre: 'El Escriba', icono: '📜', color: '#38bdf8', ventaja: 'Ilumina la opción conectada a la cita bíblica' },
  { id: 'sacerdote', nombre: 'El Sacerdote', icono: '🏛️', color: '#facc15', ventaja: 'Escudo de Expiación: anula pérdida de HP' },
  { id: 'profeta', nombre: 'El Profeta', icono: '👁️', color: '#c084fc', ventaja: 'Luz Profética: descarta 2 distractores' },
  { id: 'noble', nombre: 'El Noble', icono: '👑', color: '#fb7185', ventaja: 'Decreto Real: no se apaga en este turno' },
  { id: 'mayordomo', nombre: 'El Mayordomo', icono: '💼', color: '#34d399', ventaja: 'Revela el dato histórico o arqueológico' },
  { id: 'juez', nombre: 'El Juez', icono: '🛡️', color: '#fb923c', ventaja: '+1 Convicción extra al responder bien' },
  { id: 'proselito', nombre: 'El Prosélito', icono: '🕊️', color: '#22d3ee', ventaja: 'Hambre de Verdad: recupera +1 HP' },
  { id: 'patriarca', nombre: 'El Patriarca', icono: '🌾', color: '#818cf8', ventaja: 'Bendición: reenciende a un compañero' }
];

/* ==========================================================================
   3. LAS 8 ERAS NUCLEARES DEL SECRETO SAGRADO (FIDELIDAD 100% A WOL.JW.ORG)
   ========================================================================== */
const OCHO_ERAS_SECRETO_SAGRADO = [
  {
    era: 1,
    nombre: 'Edén y la Primera Promesa',
    paisajeUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: 'Génesis 3:15; 4:4',
    tituloNodo: 'El Pecado Original, Génesis 3:15 y la Fe de Abel',
    pregunta: 'Busquen Génesis 3:15 y 4:4 en su Biblia física. ¿Qué comprendió Abel al ofrecer los primogénitos de su rebaño?',
    notaMayordomo: 'En Génesis 3:21 Jehová hizo largas prendas de vestir de piel para Adán y Eva, y en 2369 a. E.C. Noé edificó el primer altar mencionado en la Biblia.',
    hiloDorado: 'En Edén se planteó la cuestión de la Soberanía Universal y se dio el primer destello del Secreto Sagrado (Gén. 3:15): una Descendencia aplastaría la cabeza de la Serpiente. El linaje fiel fue preservado de Abel a Set, Enoc, Noé y Sem.',
    opciones: [
      { id: '1a', icono: '🐑', titulo: 'Fe en la Promesa y Vida Entregada', subtitulo: 'Comprendió que acercarse a Dios tras el pecado exigía fe y ofrecer una vida inocente con sangre.', correcta: true },
      { id: '1b', icono: '🌾', titulo: 'Rechazo a la Agricultura', subtitulo: 'Jehová prohibió para siempre presentar ofrendas de grano o frutos del suelo.', correcta: false },
      { id: '1c', icono: '🍃', titulo: 'Hojas de Higuera Suficientes', subtitulo: 'La cubierta que cosieron Adán y Eva ya había borrado el pecado sin rescate.', correcta: false },
      { id: '1d', icono: '🐍', titulo: 'Eva como la Mujer de la Profecía', subtitulo: 'Eva misma era la mujer sin pecado cuya prole con Caín traería la salvación.', correcta: false }
    ]
  },
  {
    era: 2,
    nombre: 'Los Patriarcas y la Promesa de Siló',
    paisajeUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: 'Génesis 22:16-18; 49:8-10',
    tituloNodo: 'El Juramento en Moria y el Cetro de Judá («Siló»)',
    pregunta: 'Lean Génesis 49:10 en su Biblia física. ¿Cómo canalizó Jehová la línea real de la Descendencia antes de morir Jacob?',
    notaMayordomo: 'El Pacto Abrahámico entró en vigor el 14 de nisán de 1943 a. E.C. al cruzar el Éufrates, y Melquisedec bendijo a Abrahán como Rey de Salem y Sacerdote.',
    hiloDorado: 'En la Era Patriarcal el Secreto Sagrado se sella con un juramento en el Monte Moria y se estrecha por Abrahán -> Isaac -> Jacob -> Judá, anunciando a «Siló» («Aquel a Quien Pertenece»), mientras Job vindica la integridad humana.',
    opciones: [
      { id: '2a', icono: '🦁', titulo: 'El Cetro Real para «Siló» en Judá', subtitulo: 'La autoridad real no se apartará de Judá hasta que venga Aquel a quien pertenece la obediencia de los pueblos.', correcta: true },
      { id: '2b', icono: '🏹', titulo: 'Sucesión por Ismael y Esaú', subtitulo: 'El pacto de la Descendencia pasó automáticamente a los primogénitos carnales.', correcta: false },
      { id: '2c', icono: '🏛️', titulo: 'Cetro Real Entregado a Leví', subtitulo: 'Jacob transfirió el derecho al trono real de Israel a la tribu de Leví.', correcta: false },
      { id: '2d', icono: '🏺', titulo: 'Dinastía Faraónica de Gosén', subtitulo: 'El título Siló designaba a los gobernantes egipcios que protegieron a José.', correcta: false }
    ]
  },
  {
    era: 3,
    nombre: 'La Ley Mosaica y las Sombras del Santuario',
    paisajeUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: 'Éxodo 12:46; Levítico 17:11; Deuteronomio 18:15',
    tituloNodo: 'El Cordero Pascual, el Santísimo y el Profeta como Moisés',
    pregunta: 'Verifiquen Levítico 17:11 y Deuteronomio 18:15, 18. ¿Qué revelaron la Ley y el Tabernáculo sobre el futuro Mesías?',
    notaMayordomo: 'El Éxodo ocurrió en 1513 a. E.C. (exactamente 430 años después de 1943 a. E.C.). Durante la marcha, Naasón encabezaba la tribu real de Judá.',
    hiloDorado: 'La Ley Mosaica actuó como muralla protectora del linaje y tutor hacia el Cristo: enseñó mediante el Cordero Pascual y el Día de Expiación la necesidad de sangre perfecta y prometió a un gran Profeta-Mediador como Moisés.',
    opciones: [
      { id: '3a', icono: '🩸', titulo: 'Expiación por Sangre y un Profeta Mediador', subtitulo: 'La sangre sobre el altar prefiguró el rescate y Moisés anunció un Profeta de entre sus hermanos.', correcta: true },
      { id: '3b', icono: '⚖️', titulo: 'Salvación por Obras sin Sacrificio', subtitulo: 'Los israelitas podían ser declarados justos sin necesidad de mediador ni sangre.', correcta: false },
      { id: '3c', icono: '👑', titulo: 'Reyes de Judá Oficiando en el Altar', subtitulo: 'La Ley permitía que cualquier príncipe de Judá entrara al Santísimo como sumo sacerdote.', correcta: false },
      { id: '3d', icono: '🐍', titulo: 'Adoración Perpetua a la Serpiente de Cobre', subtitulo: 'Moisés ordenó quemar incienso a la serpiente de cobre durante todas las generaciones.', correcta: false }
    ]
  },
  {
    era: 4,
    nombre: 'Los Jueces y el Pacto del Reino Davídico',
    paisajeUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: '2 Samuel 7:12-16; Salmo 2:2, 7; 110:1, 4',
    tituloNodo: 'El Trono Eterno de David y el Sacerdocio de Melquisedec',
    pregunta: 'Busquen 2 Samuel 7:16 y Salmo 110:4 en su Biblia física. ¿Qué dos promesas eternas se unieron en esta Era?',
    notaMayordomo: 'El linaje en Belén pasó por Salmón y Rahab -> Boaz y Rut -> Obed -> Jesé -> David. Además, David compró la era de Ornán en el mismo Monte Moria (2 Crón. 3:1).',
    hiloDorado: 'En la Era 4 el Secreto Sagrado adquiere forma de Reino: Jehová pacta con David que su dinastía tendrá un trono eterno y jura en el Salmo 110 que el Ungido (Mesías) será Rey en Sión y Sacerdote a la manera de Melquisedec.',
    opciones: [
      { id: '4a', icono: '👑', titulo: 'Pacto del Reino Davídico y Juramento de Melquisedec', subtitulo: 'El heredero de David reinará para siempre y será sacerdote por juramento de Jehová.', correcta: true },
      { id: '4b', icono: '⚔️', titulo: 'Sucesión Real en la Casa de Saúl', subtitulo: 'Jehová mantuvo el pacto del Reino en la tribu de Benjamín a través de Jonatán.', correcta: false },
      { id: '4c', icono: '🏛️', titulo: 'Herencia Sacerdotal de Belén', subtitulo: 'Boaz y David podían ser sacerdotes porque pertenecían a la tribu de Leví.', correcta: false },
      { id: '4d', icono: '🕊️', titulo: 'Inmortalidad Terrenal de Salomón', subtitulo: 'Salomón permaneció fiel hasta su muerte y cumplió de forma total el Salmo 110.', correcta: false }
    ]
  },
  {
    era: 5,
    nombre: 'Los Profetas y el Reloj de las 70 Semanas',
    paisajeUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: 'Isaías 53:5, 12; Daniel 9:24-27; Miqueas 5:2',
    tituloNodo: 'El Siervo Sufriente y las 70 Semanas de Años (455 a. E.C.)',
    pregunta: 'Verifiquen Daniel 9:25, 26 e Isaías 53:5. ¿Qué revelaron los profetas sobre el año de llegada y el sacrificio del Mesías?',
    notaMayordomo: 'Pese a los ataques de Atalía y Hamán y la caída de Jerusalén en 607 a. E.C., el linaje real sobrevivió en Zorobabel, y en 455 a. E.C. salió la orden de reedificar Jerusalén.',
    hiloDorado: 'En la Era 5 los profetas dan las coordenadas exactas del Mesías: nacerá en Belén (Miq. 5:2), aparecerá 69 semanas de años (483 años) después de 455 a. E.C. y será cortado en la muerte como ofrenda por la culpa (Isa. 53) antes de que su Reino triture a todos los imperios (Dan. 2:44).',
    opciones: [
      { id: '5a', icono: '⏳', titulo: '69 Semanas de Años y Ofrenda por la Culpa', subtitulo: 'Llegaría 483 años después de 455 a. E.C. y sería traspasado para llevar el pecado de muchos.', correcta: true },
      { id: '5b', icono: '🏰', titulo: 'Nacimiento Real en Babilonia', subtitulo: 'Miqueas predijo que el Mesías nacería en el palacio real de Nabucodonosor.', correcta: false },
      { id: '5c', icono: '🛡️', titulo: 'Exención de Sufrimiento', subtitulo: 'Isaías 53 enseñaba que el Mesías jamás sufriría la herida en el talón.', correcta: false },
      { id: '5d', icono: '📜', titulo: 'Fin del Linaje con Sedequías', subtitulo: 'En 607 a. E.C. murieron todos los descendientes de David sin quedar sobrevivientes.', correcta: false }
    ]
  },
  {
    era: 6,
    nombre: 'La Llegada del Mesías y el Sacrificio de Rescate',
    paisajeUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: 'Lucas 1:32, 33; 22:20, 28-30; Mateo 20:28',
    tituloNodo: 'El Ungido en el Jordán (29 E.C.), el Rescate y el Pacto del Reino',
    pregunta: 'Lean Lucas 22:20, 28-30 en su Biblia física. ¿Qué dos pactos estableció Jesús la noche del 14 de nisán de 33 E.C.?',
    notaMayordomo: 'Jesús reunió el derecho legal al trono de David vía Salomón/José (Mateo 1) y la descendencia física de sangre vía Natán/María (Lucas 3).',
    hiloDorado: '¡Aparece la parte principal de la Descendencia! Jesús es ungido en 29 E.C., enseña el «secreto sagrado del reino de Dios», sufre la herida en el talón el 14 de nisán de 33 E.C. para pagar el rescate correspondiente y celebra con sus fieles el Nuevo Pacto y el Pacto para un Reino.',
    opciones: [
      { id: '6a', icono: '🍷', titulo: 'El Nuevo Pacto y el Pacto para un Reino', subtitulo: 'Validó con su sangre el Nuevo Pacto y pactó compartir su trono celestial con un rebaño pequeño.', correcta: true },
      { id: '6b', icono: '⚔️', titulo: 'Alianza Militar contra Roma', subtitulo: 'Prometió derrocar a Poncio Pilato mediante una rebelión armada en Jerusalén.', correcta: false },
      { id: '6c', icono: '🏛️', titulo: 'Renovación del Sacerdocio Levítico', subtitulo: 'Decretó que el templo físico de Herodes seguiría ofreciendo sacrificios para siempre.', correcta: false },
      { id: '6d', icono: '👑', titulo: 'Reinado Solitario sin Coherederos', subtitulo: 'Anunció que ningún ser humano compartiría jamás su autoridad real en los cielos.', correcta: false }
    ]
  },
  {
    era: 7,
    nombre: 'La Congregación Cristiana y los Coherederos',
    paisajeUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: 'Gálatas 3:16, 29; Efesios 1:9, 10; 3:3-6',
    tituloNodo: 'La Parte Secundaria de la Descendencia y la Administración de Dios',
    pregunta: 'Busquen Gálatas 3:29 y Efesios 3:5, 6 en su Biblia física. ¿Qué aspecto del Secreto Sagrado se reveló en el siglo primero?',
    notaMayordomo: 'Desde el Pentecostés de 33 E.C. y la conversión de Cornelio en 36 E.C. (fin de las 70 semanas), Dios abrió la puerta a gentiles para formar el «Israel de Dios».',
    hiloDorado: 'Las cartas apostólicas desvelan que la Descendencia de Abrahán tiene como parte principal a Cristo y como parte secundaria a los coherederos ungidos (judíos y gentiles unidos en un solo cuerpo), bajo una administración para reunir las cosas en los cielos y las cosas en la tierra (Efesios 1:9, 10).',
    opciones: [
      { id: '7a', icono: '🕊️', titulo: 'Coherederos de Entre Judíos y Naciones Unidas a Cristo', subtitulo: 'Los ungidos por espíritu conforman junto con Cristo la Descendencia de Abrahán para bendecir la tierra.', correcta: true },
      { id: '7b', icono: '📜', titulo: 'Obligación de la Circuncisión Física', subtitulo: 'El concilio de Jerusalén exigió guardar toda la Ley de Moisés para ser salvos.', correcta: false },
      { id: '7c', icono: '🏛️', titulo: 'Exclusividad Carnal Judía', subtitulo: 'Pablo enseñó que ningún gentil incircunciso podía llegar a ser coheredero con Cristo.', correcta: false },
      { id: '7d', icono: '🌍', titulo: 'Filosofía Griega como Base de la Fe', subtitulo: 'Los apóstoles adoptaron las enseñanzas del Areópago de Atenas sobre el alma inmortal.', correcta: false }
    ]
  },
  {
    era: 8,
    nombre: 'La Realización del Reino y el Clímax de Revelación',
    paisajeUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85',
    citaBiblia: 'Revelación 10:7; 11:15; 12:9, 10; 20:10; 21:3, 4',
    tituloNodo: 'El Secreto Sagrado Terminado y el Aplastamiento de la Serpiente',
    pregunta: 'Lean Revelación 12:9, 10 y 20:10 en su Biblia física. ¿Cómo llega el Secreto Sagrado a su feliz término?',
    notaMayordomo: 'En Revelación 14:1, 3 y 20:6 se revela que los coherederos comprados de la tierra para reinar con el Cordero en el Monte Sión celestial son exactamente 144.000.',
    hiloDorado: '¡El Secreto Sagrado queda terminado (Rev. 10:7)! La mujer celestial da a luz al Reino Mesiánico, Miguel arroja del cielo a la Serpiente original (Satanás), Cristo y los 144.000 reinan por 1.000 años para restaurar el Paraíso terrenal y eliminar la muerte, y Satanás es aplastado para siempre en el lago de fuego.',
    opciones: [
      { id: '8a', icono: '👑', titulo: 'Triunfo del Reino Mesiánico y Destrucción Eterna de Satanás', subtitulo: 'Cristo y los 144.000 aplastan para siempre a la Serpiente original y restauran el Paraíso sin muerte ni dolor.', correcta: true },
      { id: '8b', icono: '🐉', titulo: 'Tregua Perpetua con el Dragón', subtitulo: 'La Serpiente original conserva una parte del cielo después de los mil años.', correcta: false },
      { id: '8c', icono: '🔥', titulo: 'Destrucción del Planeta Tierra Literal', subtitulo: 'El propósito original de Edén se abandona y ningún humano vivirá en la Tierra.', correcta: false },
      { id: '8d', icono: '🏛️', titulo: 'Supervivencia de Babilonia la Grande', subtitulo: 'El imperio de la religión falsa se reforma para gobernar junto a la Nueva Jerusalén.', correcta: false }
    ]
  }
];

export default function SecretoSagradoLanding() {
  const [cortinaLista, setCortinaLista] = useState(false);
  const [vista, setVista] = useState('BIENVENIDA'); // BIENVENIDA | CONFIG_PARTY | JUEGO
  const [codigoSala, setCodigoSala] = useState(() => 'SALA-' + Math.floor(1000 + Math.random() * 9000));
  const [nombreFamilia, setNombreFamilia] = useState('Familia Sequea');
  const [modoPartida, setModoPartida] = useState('ESTANDAR'); // ESTANDAR | EXPRESS
  const [dmActivoId, setDmActivoId] = useState('historiador');
  const [logoUrl, setLogoUrl] = useState(() => {
    try { return localStorage.getItem('ss_custom_logo') || ''; } catch (e) { return ''; }
  });

  // Modales
  const [modalLogoOpen, setModalLogoOpen] = useState(false);
  const [modalCargarOpen, setModalCargarOpen] = useState(false);
  const [partidasGuardadas, setPartidasGuardadas] = useState([]);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [modalHiloDorado, setModalHiloDorado] = useState(null);

  // Estado del Juego en Vivo
  const [indiceEra, setIndiceEra] = useState(0);
  const [conviccionHP, setConviccionHP] = useState(10);
  const [tokensOracion, setTokensOracion] = useState(1);
  const [vueltaRoster, setVueltaRoster] = useState(1);
  const [heroeEnTurnoId, setHeroeEnTurnoId] = useState(null);
  const [opcionesDescartadas, setOpcionesDescartadas] = useState([]);

  const [party, setParty] = useState([
    { id: 'p1', nombre: 'Jesús', claseIdx: 0, disponible: true, poderUsado: false },
    { id: 'p2', nombre: 'María', claseIdx: 2, disponible: true, poderUsado: false },
    { id: 'p3', nombre: 'David', claseIdx: 3, disponible: true, poderUsado: false },
    { id: 'p4', nombre: 'Sara', claseIdx: 1, disponible: true, poderUsado: false }
  ]);

  const canvasRef = useRef(null);
  const chispasRef = useRef([]);
  const ondasRef = useRef([]);
  const audioRef = useRef(null);

  const dmActual = CATALOGO_DMS.find(d => d.id === dmActivoId) || CATALOGO_DMS[0];
  const eraDatos = OCHO_ERAS_SECRETO_SAGRADO[indiceEra % OCHO_ERAS_SECRETO_SAGRADO.length];
  const heroeActivo = party.find(p => p.id === heroeEnTurnoId) || null;
  const claseActiva = heroeActivo ? CLASES_JUGADOR[heroeActivo.claseIdx] : null;

  useEffect(() => {
    const t = setTimeout(() => setCortinaLista(true), 350);
    return () => clearTimeout(t);
  }, []);

  /* ==========================================================================
     MOTOR DE CHISPAS 3D, BRISA SOLAR Y ONDAS EXPANSIVAS EN CANVAS
     ========================================================================== */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const ajustar = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    ajustar();
    window.addEventListener('resize', ajustar);

    const polenSolar = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.4 + 0.8,
      vx: Math.random() * 0.55 + 0.15,
      vy: -Math.random() * 0.3 - 0.1,
      alfa: Math.random() * 0.55 + 0.25
    }));

    const animar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      polenSolar.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.globalAlpha = p.alfa;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fde047';
        ctx.fill();
        ctx.restore();
      });

      for (let i = ondasRef.current.length - 1; i >= 0; i--) {
        const o = ondasRef.current[i];
        o.radio += (o.max - o.radio) * 0.15;
        o.alfa *= 0.9;
        ctx.save();
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radio, 0, Math.PI * 2);
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = o.alfa;
        ctx.shadowBlur = 16;
        ctx.shadowColor = o.color;
        ctx.stroke();
        ctx.restore();
        if (o.alfa < 0.03) ondasRef.current.splice(i, 1);
      }

      for (let i = chispasRef.current.length - 1; i >= 0; i--) {
        const c = chispasRef.current[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.15;
        c.alfa *= 0.93;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.vx * 0.2);
        ctx.beginPath();
        ctx.moveTo(0, -c.tam * 1.7);
        ctx.lineTo(c.tam * 0.45, -c.tam * 0.45);
        ctx.lineTo(c.tam * 1.7, 0);
        ctx.lineTo(c.tam * 0.45, c.tam * 0.45);
        ctx.lineTo(0, c.tam * 1.7);
        ctx.lineTo(-c.tam * 0.45, c.tam * 0.45);
        ctx.lineTo(-c.tam * 1.7, 0);
        ctx.lineTo(-c.tam * 0.45, -c.tam * 0.45);
        ctx.closePath();
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.alfa;
        ctx.shadowBlur = 14;
        ctx.shadowColor = c.color;
        ctx.fill();
        ctx.restore();

        if (c.alfa < 0.04) chispasRef.current.splice(i, 1);
      }

      raf = requestAnimationFrame(animar);
    };

    raf = requestAnimationFrame(animar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', ajustar);
    };
  }, []);

  const lanzarChispasYSonido = (e, color = '#fef08a', cant = 30, notas = [523.25, 659.25, 783.99]) => {
    const x = e?.clientX || window.innerWidth / 2;
    const y = e?.clientY || window.innerHeight / 2;

    ondasRef.current.push({ x, y, radio: 8, max: 115, alfa: 0.85, color });
    for (let i = 0; i < cant; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = Math.random() * 7.5 + 2;
      chispasRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel - 2,
        tam: Math.random() * 3.8 + 1.8,
        alfa: 1,
        color: i % 2 === 0 ? color : '#ffffff'
      });
    }

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current.state === 'suspended') audioRef.current.resume();
      const now = audioRef.current.currentTime;
      notas.forEach((f, idx) => {
        const osc = audioRef.current.createOscillator();
        const g = audioRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        g.gain.setValueAtTime(0.001, now + idx * 0.05);
        g.gain.exponentialRampToValueAtTime(0.1, now + idx * 0.05 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.48);
        osc.connect(g);
        g.connect(audioRef.current.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.52);
      });
    } catch (err) {}
  };

  /* ==========================================================================
     GUARDADO BLINDADO (LOCALSTORAGE + SUPABASE REST OPCIONAL SIN CRASHEAR)
     ========================================================================== */
  const handleGuardarPartida = async (e) => {
    e.stopPropagation();
    setGuardandoEstado(true);
    lanzarChispasYSonido(e, '#38bdf8', 45, [523.25, 783.99, 1046.5]);

    const registro = {
      codigo_sala: codigoSala,
      nombre_familia: nombreFamilia,
      modo_partida: modoPartida,
      dm_activo: dmActivoId,
      era_actual: eraDatos.era,
      nodo_actual: indiceEra,
      conviccion_hp: conviccionHP,
      vuelta_roster: vueltaRoster,
      roster_jugadores: party,
      fecha: new Date().toLocaleString('es-ES')
    };

    try {
      const prev = JSON.parse(localStorage.getItem('ss_partidas_lista') || '[]');
      const filtradas = prev.filter(item => item.codigo_sala !== codigoSala);
      filtradas.unshift(registro);
      localStorage.setItem('ss_partidas_lista', JSON.stringify(filtradas.slice(0, 10)));
    } catch (err) {}

    setTimeout(() => setGuardandoEstado(false), 450);
  };

  const abrirBuscadorPartidas = (e) => {
    e.stopPropagation();
    lanzarChispasYSonido(e, '#fef08a', 30);
    try {
      const lista = JSON.parse(localStorage.getItem('ss_partidas_lista') || '[]');
      setPartidasGuardadas(lista);
    } catch (err) {
      setPartidasGuardadas([]);
    }
    setModalCargarOpen(true);
  };

  const restaurarPartidaSeleccionada = (registro, e) => {
    lanzarChispasYSonido(e, '#4ade80', 55, [523.25, 659.25, 1046.5]);
    setCodigoSala(registro.codigo_sala);
    setNombreFamilia(registro.nombre_familia);
    setModoPartida(registro.modo_partida || 'ESTANDAR');
    setDmActivoId(registro.dm_activo || 'historiador');
    setIndiceEra(registro.nodo_actual || 0);
    setConviccionHP(registro.conviccion_hp || 10);
    setVueltaRoster(registro.vuelta_roster || 1);
    setParty(registro.roster_jugadores || party);
    setModalCargarOpen(false);
    setVista('JUEGO');
  };

  const evaluarRespuesta = (op, e) => {
    e.stopPropagation();
    if (!heroeActivo) {
      lanzarChispasYSonido(e, '#fb7185', 25, [220, 196]);
      return;
    }

    let nuevoRoster = party.map(p => {
      if (p.id === heroeActivo.id && claseActiva.id !== 'noble') {
        return { ...p, disponible: false };
      }
      return p;
    });

    if (!nuevoRoster.some(p => p.disponible)) {
      nuevoRoster = nuevoRoster.map(p => ({ ...p, disponible: true }));
      setVueltaRoster(v => v + 1);
    }

    setParty(nuevoRoster);
    setHeroeEnTurnoId(null);
    setOpcionesDescartadas([]);

    if (op.correcta) {
      lanzarChispasYSonido(e, '#4ade80', 80, [523.25, 659.25, 783.99, 1046.5, 1318.5]);
      if (claseActiva.id === 'juez' || claseActiva.id === 'proselito') {
        setConviccionHP(hp => Math.min(10, hp + 1));
      }
      setModalHiloDorado({
        jugador: heroeActivo.nombre,
        era: eraDatos.nombre,
        sintesis: eraDatos.hiloDorado
      });
    } else {
      lanzarChispasYSonido(e, '#fb7185', 45, [246.94, 207.65, 174.61]);
      if (claseActiva.id !== 'sacerdote') {
        setConviccionHP(hp => Math.max(1, hp - 1));
      }
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none text-white bg-slate-950"
      onPointerDown={(e) => lanzarChispasYSonido(e, dmActual.colorHex, 12, [659.25])}
    >
      {/* CORTINA INICIAL SUAVE */}
      <div
        className={`fixed inset-0 z-50 bg-[#070b14] flex flex-col items-center justify-center transition-transform duration-1000 pointer-events-none ${
          cortinaLista ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <span className="text-amber-300 text-xs font-black tracking-[0.35em] uppercase mb-3">
          Estudio Familiar Interactivo • 8 Eras
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
          EL SECRETO SAGRADO
        </h1>
      </div>

      {/* PAISAJE ATMOSFÉRICO A PANTALLA COMPLETA */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url('${eraDatos.paisajeUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
      </div>

      {/* LIENZO DE CHISPAS 3D Y BRISA LUMINOSA */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* ====================================================================
          VISTA 1: BIENVENIDA ABIERTA (MENÚ GLASS LATERAL + HORIZONTE LIBRE)
          ==================================================================== */}
      {vista === 'BIENVENIDA' && (
        <section className="relative z-10 w-full h-full flex items-center justify-between px-6 md:px-16">
          <aside className="h-full w-80 md:w-96 bg-black/40 backdrop-blur-xl border-x border-white/25 flex flex-col justify-center px-8 py-10 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-200 text-[11px] font-black tracking-widest uppercase w-fit mb-6">
              ✨ 8 Eras • Estudio Bíblico
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModoPartida('ESTANDAR');
                  setVista('CONFIG_PARTY');
                  lanzarChispasYSonido(e, '#fef08a', 45);
                }}
                className="group flex items-center justify-between px-5 py-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 hover:border-amber-300 transition-all duration-300 hover:translate-x-2 text-left shadow-lg"
              >
                <span className="font-extrabold text-base">Nueva Partida (8 Eras)</span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-black/40 text-amber-200">
                  ESTÁNDAR
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModoPartida('EXPRESS');
                  setVista('CONFIG_PARTY');
                  lanzarChispasYSonido(e, '#38bdf8', 45);
                }}
                className="group flex items-center justify-between px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/25 hover:border-sky-300 transition-all duration-300 hover:translate-x-2 text-left shadow-lg"
              >
                <span className="font-extrabold text-base">⚡ Partida Express</span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-black/40 text-sky-200">
                  8 ERAS RÁPIDAS
                </span>
              </button>

              <button
                onClick={abrirBuscadorPartidas}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl hover:bg-white/15 border border-transparent hover:border-white/30 transition-all duration-300 hover:translate-x-2 text-left"
              >
                <span className="font-bold text-sm">📂 Buscar Partidas Guardadas</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setModalLogoOpen(true); }}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl hover:bg-white/15 border border-transparent hover:border-white/30 transition-all duration-300 hover:translate-x-2 text-left text-white/80"
              >
                <span className="font-bold text-sm">🖼️ Personalizar URL del Logo</span>
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-white/15 text-xs text-white/75 leading-relaxed">
              Basado estrictamente en <strong>wol.jw.org</strong>.<br />
              El System DM dirige cada turno.
            </div>
          </aside>

          {/* Título y Logo a la Derecha */}
          <div className="text-right max-w-xl">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo El Secreto Sagrado"
                className="max-h-36 ml-auto mb-5 drop-shadow-2xl"
              />
            )}
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/40 text-amber-200 text-xs font-black tracking-[0.2em] uppercase mb-3">
              El Camino de la Revelación
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none drop-shadow-2xl">
              EL SECRETO<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-sky-200">
                SAGRADO
              </span>
            </h1>
          </div>
        </section>
      )}

      {/* ====================================================================
          VISTA 2: LOBBY DE CONFIGURACIÓN, ELECCIÓN DE DM Y ROSTER FAMILIAR
          ==================================================================== */}
      {vista === 'CONFIG_PARTY' && (
        <section className="relative z-10 w-full h-full flex flex-col justify-between p-6 md:p-10 overflow-y-auto">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); setVista('BIENVENIDA'); lanzarChispasYSonido(e); }}
              className="px-5 py-2.5 rounded-full bg-black/45 backdrop-blur-xl border border-white/30 font-bold text-xs hover:bg-white/20"
            >
              ← Menú Principal
            </button>

            <div className="flex items-center gap-3 bg-black/45 backdrop-blur-xl border border-white/30 px-4 py-2 rounded-full">
              <span className="text-xs font-extrabold text-amber-200">Familia:</span>
              <input
                type="text"
                value={nombreFamilia}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setNombreFamilia(e.target.value)}
                className="bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-bold text-white focus:outline-none"
              />
              <span className="text-[11px] font-black text-sky-300">{codigoSala}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setParty(party.map(p => ({ ...p, disponible: true, poderUsado: false })));
                setVista('JUEGO');
                lanzarChispasYSonido(e, '#4ade80', 65);
              }}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 font-black text-sm shadow-2xl hover:scale-105 transition-all"
            >
              ✨ COMENZAR EN LA ERA 1 →
            </button>
          </header>

          {/* 1. Selección de los 6 Arquetipos de System DM */}
          <div className="my-auto flex flex-col items-center gap-4">
            <div className="text-center">
              <span className="text-[11px] font-black tracking-[0.22em] uppercase text-amber-200 block">
                1. Personalidad del System DM ({modoPartida === 'EXPRESS' ? 'Modo Express • 8 Eras' : 'Modo Estándar • 8 Eras'})
              </span>
              <p className="text-xs text-white/80 mt-1">{dmActual.fraseControl}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 w-full max-w-6xl">
              {CATALOGO_DMS.map((dm) => {
                const seleccionado = dm.id === dmActivoId;
                return (
                  <div
                    key={dm.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDmActivoId(dm.id);
                      lanzarChispasYSonido(e, dm.colorHex, 35);
                    }}
                    className={`cursor-pointer p-4 rounded-3xl backdrop-blur-xl border transition-all duration-300 flex flex-col items-center text-center ${
                      seleccionado
                        ? 'bg-white/25 border-amber-300 scale-105 -translate-y-1.5 shadow-2xl'
                        : 'bg-black/40 border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dm.gradiente} grid place-items-center text-2xl shadow-lg mb-2`}>
                      {dm.icono}
                    </div>
                    <div className="font-extrabold text-xs">{dm.nombre.replace('El ', '')}</div>
                    <div className="text-[10px] text-amber-200/90 mt-0.5">{dm.subtitulo}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Alineación Heroica del Roster Familiar */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black tracking-[0.18em] uppercase text-amber-200">
                2. Escuadrón Familiar (Toca el Icono para Cambiar de Rol)
              </span>
              {party.length < 8 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setParty([
                      ...party,
                      {
                        id: 'p_' + Date.now(),
                        nombre: `Jugador ${party.length + 1}`,
                        claseIdx: party.length % CLASES_JUGADOR.length,
                        disponible: true,
                        poderUsado: false
                      }
                    ]);
                    lanzarChispasYSonido(e, '#38bdf8', 30);
                  }}
                  className="px-3.5 py-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 text-xs font-extrabold"
                >
                  + Añadir Jugador
                </button>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3.5">
              {party.map((jug, idx) => {
                const clase = CLASES_JUGADOR[jug.claseIdx];
                return (
                  <div
                    key={jug.id}
                    className="w-44 p-4 rounded-3xl bg-gradient-to-b from-white/25 to-black/65 backdrop-blur-xl border border-white/35 shadow-2xl flex flex-col items-center gap-2 hover:-translate-y-1.5 transition-all"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const copia = [...party];
                        copia[idx].claseIdx = (copia[idx].claseIdx + 1) % CLASES_JUGADOR.length;
                        setParty(copia);
                        lanzarChispasYSonido(e, clase.color, 30);
                      }}
                      className="w-14 h-14 rounded-2xl bg-white text-3xl grid place-items-center shadow-lg hover:scale-110 transition-transform"
                    >
                      {clase.icono}
                    </button>
                    <input
                      type="text"
                      value={jug.nombre}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const copia = [...party];
                        copia[idx].nombre = e.target.value;
                        setParty(copia);
                      }}
                      className="w-full bg-black/45 border border-white/30 rounded-xl px-2 py-1 text-center font-extrabold text-xs text-white focus:outline-none"
                    />
                    <span className="text-[11px] font-extrabold text-amber-200">
                      {clase.nombre}
                    </span>
                    <span className="text-[10px] text-white/80 text-center leading-tight">
                      {clase.ventaja}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          VISTA 3: ESCENARIO DE JUEGO EN VIVO (DESPEJADO Y ATMOSFÉRICO)
          ==================================================================== */}
      {vista === 'JUEGO' && (
        <section className="relative z-10 w-full h-full flex flex-col justify-between p-6 md:p-10">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                onClick={(e) => { e.stopPropagation(); setVista('CONFIG_PARTY'); lanzarChispasYSonido(e); }}
                className="px-4 py-2 rounded-full bg-black/45 backdrop-blur-xl border border-white/30 text-xs font-extrabold hover:bg-white/20"
              >
                ⚙️ Party
              </button>
              <div className="px-4 py-2 rounded-full bg-black/45 backdrop-blur-xl border border-white/30 text-xs font-black tracking-wider uppercase text-amber-200">
                ERA {eraDatos.era} DE 8 • {eraDatos.nombre}
              </div>
              <div className="hidden lg:flex gap-1 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/20">
                {OCHO_ERAS_SECRETO_SAGRADO.map((eObj, i) => (
                  <button
                    key={eObj.era}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setIndiceEra(i);
                      lanzarChispasYSonido(ev, '#38bdf8', 25);
                    }}
                    className={`w-7 h-7 rounded-full text-xs font-black transition-all ${
                      indiceEra === i ? 'bg-amber-400 text-slate-950' : 'text-white/75 hover:bg-white/15'
                    }`}
                  >
                    {eObj.era}
                  </button>
                ))}
              </div>
            </div>

            {/* 10 Gemas de Convicción */}
            <div className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-black/45 backdrop-blur-xl border border-white/30">
              <span className="text-[11px] font-black uppercase text-amber-200 mr-1.5">
                Convicción
              </span>
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-base transition-all ${
                    i < conviccionHP ? 'scale-100' : 'opacity-25 grayscale scale-75'
                  }`}
                >
                  💎
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {heroeActivo && !heroeActivo.poderUsado && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const copia = party.map(p => p.id === heroeActivo.id ? { ...p, poderUsado: true } : p);
                    if (claseActiva.id === 'patriarca') {
                      const idxApagado = copia.findIndex(p => !p.disponible);
                      if (idxApagado !== -1) copia[idxApagado].disponible = true;
                    } else {
                      const falsas = eraDatos.opciones.filter(o => !o.correcta).slice(0, 2).map(o => o.id);
                      setOpcionesDescartadas(falsas);
                    }
                    setParty(copia);
                    lanzarChispasYSonido(e, claseActiva.color, 55);
                  }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 border border-white/60 text-xs font-black shadow-lg hover:scale-105 transition-all"
                >
                  ⚡ Poder de {claseActiva.nombre}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tokensOracion <= 0) return;
                  setTokensOracion(0);
                  setConviccionHP(hp => Math.min(10, hp + 2));
                  lanzarChispasYSonido(e, '#fde047', 65);
                }}
                className="px-4 py-2 rounded-full bg-amber-400/25 backdrop-blur-xl border border-amber-300 text-amber-100 text-xs font-extrabold hover:bg-amber-400/40"
              >
                🙏 Oración (+2 HP)
              </button>
              <button
                onClick={handleGuardarPartida}
                className="px-4 py-2 rounded-full bg-black/45 backdrop-blur-xl border border-white/30 text-xs font-extrabold hover:bg-white/20"
              >
                {guardandoEstado ? '✅ Guardado' : '💾 Guardar'}
              </button>
            </div>
          </header>

          {/* Centro Flotante Glassmórfico */}
          <main className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center gap-5">
            <div className="w-full p-6 md:p-8 rounded-[30px] bg-black/45 backdrop-blur-2xl border border-white/35 shadow-2xl text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/20 border border-amber-300/60 text-amber-200 text-xs font-black tracking-widest uppercase mb-3">
                📖 BUSCAR EN BIBLIA FÍSICA: {eraDatos.citaBiblia}
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
                {eraDatos.tituloNodo}
              </h2>
              <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto">
                <span className="text-amber-300 font-extrabold">{dmActual.icono} {dmActual.nombre}: </span>
                {eraDatos.pregunta}
              </p>
              {claseActiva?.id === 'mayordomo' && (
                <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-300/50 text-xs text-emerald-100">
                  💼 <strong>Hallazgo del Mayordomo:</strong> {eraDatos.notaMayordomo}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {eraDatos.opciones.map((op) => {
                const descartada = opcionesDescartadas.includes(op.id);
                const pistaEscriba = claseActiva?.id === 'escriba' && op.correcta;
                return (
                  <button
                    key={op.id}
                    disabled={descartada}
                    onClick={(e) => evaluarRespuesta(op, e)}
                    className={`group p-5 rounded-3xl backdrop-blur-xl border text-left flex items-center gap-4 transition-all duration-300 shadow-xl ${
                      descartada
                        ? 'opacity-20 pointer-events-none grayscale bg-black/20 border-white/10'
                        : pistaEscriba
                        ? 'bg-amber-400/30 border-amber-300'
                        : 'bg-black/40 hover:bg-white/25 border-white/35 hover:border-amber-200 hover:-translate-y-1.5'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/40 grid place-items-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {op.icono}
                    </div>
                    <div>
                      <div className="font-extrabold text-base text-amber-200 group-hover:text-white">
                        {op.titulo}
                      </div>
                      <div className="text-xs text-white/90 leading-snug mt-1">
                        {op.subtitulo}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </main>

          {/* Dock Inferior del Roster por Vueltas */}
          <footer className="flex flex-col items-center gap-2">
            <span className="text-xs font-black tracking-[0.16em] uppercase text-amber-200 drop-shadow">
              {heroeActivo
                ? `⚡ EN TURNO: ${heroeActivo.nombre.toUpperCase()} (${claseActiva.nombre.toUpperCase()}) TIENE LA TABLET`
                : `🔊 VUELTA ${vueltaRoster} • EL SYSTEM DM PIDE QUE ELIJAN A UN JUGADOR ENCENDIDO DEL ROSTER`}
            </span>

            <div className="flex flex-wrap justify-center gap-3">
              {party.map((jug) => {
                const clase = CLASES_JUGADOR[jug.claseIdx];
                const activo = heroeEnTurnoId === jug.id;
                return (
                  <button
                    key={jug.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!jug.disponible) return;
                      setHeroeEnTurnoId(jug.id);
                      lanzarChispasYSonido(e, clase.color, 45);
                    }}
                    style={{ borderColor: activo ? '#fef08a' : clase.color }}
                    className={`px-5 py-2.5 rounded-2xl backdrop-blur-xl border-2 flex items-center gap-3 transition-all duration-300 ${
                      !jug.disponible
                        ? 'opacity-35 grayscale cursor-not-allowed bg-black/40 scale-95'
                        : activo
                        ? 'bg-white/30 -translate-y-2 scale-110 shadow-2xl'
                        : 'bg-black/45 hover:bg-white/20 hover:-translate-y-1'
                    }`}
                  >
                    <span className="text-2xl">{clase.icono}</span>
                    <div className="text-left">
                      <div className="font-extrabold text-sm leading-none">{jug.nombre}</div>
                      <div className="text-[10px] font-bold text-amber-200 mt-1">
                        {!jug.disponible ? 'Apagado en esta vuelta' : activo ? '⚡ En Turno' : clase.nombre}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </footer>
        </section>
      )}

      {/* MODALES */}
      {modalHiloDorado && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setModalHiloDorado(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[#111] border border-white/25 rounded-3xl p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">✨</div>
            <span className="text-xs font-black tracking-widest uppercase text-amber-300">
              ¡Interpretación Confirmada por {modalHiloDorado.jugador}!
            </span>
            <h3 className="text-2xl font-black tracking-tight mt-1 mb-4">
              El Hilo Dorado: {modalHiloDorado.era}
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed bg-white/5 border border-white/15 rounded-2xl p-5 mb-6">
              {modalHiloDorado.sintesis}
            </p>
            <button
              onClick={(e) => {
                setModalHiloDorado(null);
                setIndiceEra((i) => (i + 1) % OCHO_ERAS_SECRETO_SAGRADO.length);
                setTokensOracion(1);
                lanzarChispasYSonido(e, '#fef08a', 65);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 font-black text-sm hover:scale-[1.02] transition-all"
            >
              Avanzar a la Siguiente Era de la Revelación →
            </button>
          </div>
        </div>
      )}

      {modalCargarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setModalCargarOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#111] border border-white/20 rounded-3xl p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black mb-2">📂 Partidas Guardadas</h3>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto mb-5">
              {partidasGuardadas.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 text-xs text-gray-300 text-center">
                  No hay partidas guardadas aún.
                </div>
              ) : (
                partidasGuardadas.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/15"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-amber-200">
                        {p.nombre_familia} ({p.codigo_sala})
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Era {p.era_actual} de 8 • HP: {p.conviccion_hp}/10
                      </div>
                    </div>
                    <button
                      onClick={(e) => restaurarPartidaSeleccionada(p, e)}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs"
                    >
                      Cargar
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setModalCargarOpen(false)}
              className="w-full py-3 rounded-xl bg-white/10 text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {modalLogoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setModalLogoOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#111] border border-white/20 rounded-3xl p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black mb-2">🖼️ URL del Logo Personalizado</h3>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/25 text-sm text-white mb-4 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setModalLogoOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  try { localStorage.setItem('ss_custom_logo', logoUrl); } catch (e) {}
                  setModalLogoOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-black"
              >
                Aplicar Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}