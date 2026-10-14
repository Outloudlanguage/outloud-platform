// src/Secreto-Sagrado/bdErasNucleares.js

export const CATALOGO_DMS = [
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

export const CLASES_JUGADOR = [
  { id: 'escriba', nombre: 'El Escriba', icono: '📜', color: '#38bdf8', ventaja: 'Ilumina la opción conectada a la cita bíblica' },
  { id: 'sacerdote', nombre: 'El Sacerdote', icono: '🏛️', color: '#facc15', ventaja: 'Escudo de Expiación: anula pérdida de HP' },
  { id: 'profeta', nombre: 'El Profeta', icono: '👁️', color: '#c084fc', ventaja: 'Luz Profética: descarta 2 distractores' },
  { id: 'noble', nombre: 'El Noble', icono: '👑', color: '#fb7185', ventaja: 'Decreto Real: no se apaga en este turno' },
  { id: 'mayordomo', nombre: 'El Mayordomo', icono: '💼', color: '#34d399', ventaja: 'Revela el dato histórico o arqueológico' },
  { id: 'juez', nombre: 'El Juez', icono: '🛡️', color: '#fb923c', ventaja: '+1 Convicción extra al responder bien' },
  { id: 'proselito', nombre: 'El Prosélito', icono: '🕊️', color: '#22d3ee', ventaja: 'Hambre de Verdad: recupera +1 HP' },
  { id: 'patriarca', nombre: 'El Patriarca', icono: '🌾', color: '#818cf8', ventaja: 'Bendición: reenciende a un compañero' }
];

export const OCHO_ERAS_SECRETO_SAGRADO = [
  {
    era: 1,
    nombre: 'Edén y la Primera Promesa',
    rango: 'Génesis 1 al 11',
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
    rango: 'Génesis 12 al 50; Job',
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
    rango: 'Éxodo a Deuteronomio',
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
    rango: 'Josué a 1 Reyes 11; Salmos',
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
    rango: '1 Reyes 12 a Malaquías',
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
    rango: 'Mateo, Marcos, Lucas y Juan',
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
    rango: 'Hechos y las 21 Cartas (Romanos a Judas)',
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
    rango: 'Revelación (Apocalipsis) 1 al 22',
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