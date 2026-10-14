// src/Secreto-Sagrado/SecretoSagradoLanding.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  CATALOGO_DMS,
  CLASES_JUGADOR,
  OCHO_ERAS_SECRETO_SAGRADO
} from './bdErasNucleares';
import {
  guardarPartidaEnSupabase,
  listarPartidasDeSupabase
} from './secretoSupabaseClient';

export default function SecretoSagradoLanding() {
  // Estados de Navegación y Configuración
  const [cortinaLista, setCortinaLista] = useState(false);
  const [vista, setVista] = useState('BIENVENIDA'); // BIENVENIDA | CONFIG_PARTY | JUEGO
  const [codigoSala, setCodigoSala] = useState(() => 'SALA-' + Math.floor(1000 + Math.random() * 9000));
  const [nombreFamilia, setNombreFamilia] = useState('Familia Sequea');
  const [modoPartida, setModoPartida] = useState('ESTANDAR'); // ESTANDAR | EXPRESS (ambos recorren las 8 Eras)
  const [dmActivoId, setDmActivoId] = useState('historiador');
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('ss_custom_logo') || '');

  // Estados de Modales (Estilo CataLanding)
  const [modalLogoOpen, setModalLogoOpen] = useState(false);
  const [modalCargarOpen, setModalCargarOpen] = useState(false);
  const [partidasNube, setPartidasNube] = useState([]);
  const [guardandoNube, setGuardandoNube] = useState(false);
  const [modalHiloDorado, setModalHiloDorado] = useState(null);

  // Estados del Juego y Roster por Vueltas
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
    const t = setTimeout(() => setCortinaLista(true), 400);
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

    const polenSolar = Array.from({ length: 42 }, () => ({
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
     PERSISTENCIA EN SUPABASE (CON FALLBACK EN LOCALSTORAGE)
     ========================================================================== */
  const handleGuardarPartida = async (e) => {
    e.stopPropagation();
    setGuardandoNube(true);
    lanzarChispasYSonido(e, '#38bdf8', 45, [523.25, 783.99, 1046.5]);

    const estadoPartida = {
      codigoSala,
      nombreFamilia,
      modoPartida,
      dmActivoId,
      eraActual: eraDatos.era,
      nodoActual: indiceEra,
      conviccionHP,
      tokensOracion,
      vueltaRoster,
      heroeEnTurnoId,
      party,
      logoUrl
    };

    localStorage.setItem('ss_backup_local', JSON.stringify(estadoPartida));

    try {
      await guardarPartidaEnSupabase(estadoPartida);
    } catch (err) {
      console.warn('Guardado local aplicado (verifica que creaste la tabla ss_partidas en Supabase):', err.message);
    } finally {
      setGuardandoNube(false);
    }
  };

  const abrirBuscadorPartidas = async (e) => {
    e.stopPropagation();
    lanzarChispasYSonido(e, '#fef08a', 30);
    setModalCargarOpen(true);

    try {
      const lista = await listarPartidasDeSupabase();
      setPartidasNube(lista);
    } catch (err) {
      const local = localStorage.getItem('ss_backup_local');
      if (local) {
        const p = JSON.parse(local);
        setPartidasNube([{
          codigo_sala: p.codigoSala,
          nombre_familia: p.nombreFamilia,
          modo_partida: p.modoPartida,
          dm_activo: p.dmActivoId,
          era_actual: p.eraActual,
          nodo_actual: p.nodoActual,
          conviccion_hp: p.conviccionHP,
          vuelta_roster: p.vueltaRoster,
          roster_jugadores: p.party
        }]);
      }
    }
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

  /* ==========================================================================
     LÓGICA DE JUEGO Y ROSTER POR VUELTAS
     ========================================================================== */
  const evaluarRespuesta = (op, e) => {
    e.stopPropagation();
    if (!heroeActivo) {
      lanzarChispasYSonido(e, '#fb7185', 25, [220, 196]);
      return;
    }

    // 1. Apagar al jugador que acaba de participar (salvo Decreto Real del Noble)
    let nuevoRoster = party.map(p => {
      if (p.id === heroeActivo.id && claseActiva.id !== 'noble') {
        return { ...p, disponible: false };
      }
      return p;
    });

    // 2. Si todos los miembros ya pasaron en esta vuelta, se vuelven a encender todos
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
        rol: claseActiva.nombre,
        era: eraDatos.nombre,
        cita: eraDatos.citaBiblia,
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
      {/* CORTINA DE ENTRADA SUAVE */}
      <div
        className={`fixed inset-0 z-50 bg-[#070b14] flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.83,0,0.17,1)] pointer-events-none ${
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

      {/* PAISAJE ATMOSFÉRICO ABIERTO AL 100% */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url('${eraDatos.paisajeUrl}')` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(254,249,195,0.52)_0%,rgba(56,189,248,0.16)_42%,transparent_72%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/25" />
      </div>

      {/* LIENZO DE CHISPAS 3D Y BRISA LUMINOSA */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* ====================================================================
          VISTA 1: BIENVENIDA ABIERTA (FRANJA LATERAL GLASS + HORIZONTE LIBRE)
          ==================================================================== */}
      {vista === 'BIENVENIDA' && (
        <section className="relative z-10 w-full h-full flex items-center justify-between px-6 md:px-16">
          <aside className="h-full w-80 md:w-96 bg-black/35 backdrop-blur-xl border-x border-white/25 flex flex-col justify-center px-8 py-10 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-200 text-[11px] font-black tracking-widest uppercase w-fit mb-6">
              ✨ Conectado con Supabase
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
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rotate-45 bg-amber-300 scale-0 group-hover:scale-100 transition-transform shadow-[0_0_12px_#fde047]" />
                  <span className="font-extrabold text-base">Nueva Partida (8 Eras)</span>
                </div>
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
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rotate-45 bg-sky-300 scale-0 group-hover:scale-100 transition-transform shadow-[0_0_12px_#38bdf8]" />
                  <span className="font-extrabold text-base">⚡ Partida Express</span>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-black/40 text-sky-200">
                  8 ERAS RÁPIDAS
                </span>
              </button>

              <button
                onClick={abrirBuscadorPartidas}
                className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl hover:bg-white/15 border border-transparent hover:border-white/30 transition-all duration-300 hover:translate-x-2 text-left"
              >
                <span className="w-2.5 h-2.5 rotate-45 bg-emerald-300 scale-0 group-hover:scale-100 transition-transform" />
                <span className="font-bold text-sm">📂 Buscar Partidas Guardadas</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setModalLogoOpen(true); }}
                className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl hover:bg-white/15 border border-transparent hover:border-white/30 transition-all duration-300 hover:translate-x-2 text-left text-white/80"
              >
                <span className="w-2.5 h-2.5 rotate-45 bg-amber-300 scale-0 group-hover:scale-100 transition-transform" />
                <span className="font-bold text-sm">🖼️ Personalizar URL del Logo</span>
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-white/15 text-xs text-white/75 leading-relaxed">
              Ruta aislada en <strong>#secreto-sagrado</strong>.<br />
              Fidelidad 100% a <strong>wol.jw.org</strong>.
            </div>
          </aside>

          {/* Bloque de Título y Logo a la Derecha */}
          <div className="text-right max-w-xl">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo El Secreto Sagrado"
                className="max-h-36 ml-auto mb-5 drop-shadow-[0_14px_30px_rgba(0,0,0,0.6)]"
              />
            )}
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/40 text-amber-200 text-xs font-black tracking-[0.2em] uppercase mb-3">
              El Camino de la Revelación
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)]">
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
              className="px-5 py-2.5 rounded-full bg-black/45 backdrop-blur-xl border border-white/30 font-bold text-xs hover:bg-white/20 transition-all"
            >
              ← Menú Principal
            </button>

            <div className="flex items-center gap-3 bg-black/45 backdrop-blur-xl border border-white/30 px-4 py-2 rounded-full">
              <span className="text-xs font-extrabold text-amber-200">Familia / Grupo:</span>
              <input
                type="text"
                value={nombreFamilia}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setNombreFamilia(e.target.value)}
                className="bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-300"
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
              className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-105 transition-all"
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
                      className="w-full bg-black/45 border border-white/30 rounded-xl px-2 py-1 text-center font-extrabold text-xs text-white focus:outline-none focus:border-amber-300"
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
          {/* HUD Superior */}
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
              {/* Selector rápido de las 8 Eras */}
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
                    i < conviccionHP ? 'scale-100 drop-shadow-[0_0_8px_#fde047]' : 'opacity-25 grayscale scale-75'
                  }`}
                >
                  💎
                </span>
              ))}
            </div>

            {/* Acciones y Guardado en Supabase */}
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
                {guardandoNube ? '⏳ Guardando...' : '💾 Guardar en Supabase'}
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

            {/* 4 Orbes de Respuesta */}
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
                        ? 'bg-amber-400/30 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
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
                        ? 'bg-white/30 -translate-y-2 scale-110 shadow-[0_0_28px_rgba(254,240,138,0.65)]'
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

      {/* ====================================================================
          MODALES ESTILO CATALANDING (HILO DORADO, SUPABASE Y LOGO)
          ==================================================================== */}
      {modalHiloDorado && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setModalHiloDorado(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[#111]/95 border border-white/25 rounded-3xl p-8 text-center shadow-2xl"
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
            <h3 className="text-xl font-black mb-2">📂 Partidas Guardadas (Supabase)</h3>
            <p className="text-xs text-gray-400 mb-4">
              Selecciona una sesión familiar para retomarla exactamente donde quedó:
            </p>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto mb-5">
              {partidasNube.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 text-xs text-gray-300 text-center">
                  No se encontraron partidas guardadas aún.
                </div>
              ) : (
                partidasNube.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/15"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-amber-200">
                        {p.nombre_familia} ({p.codigo_sala})
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Era {p.era_actual} de 8 • Modo {p.modo_partida} • HP: {p.conviccion_hp}/10
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
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/25 text-sm text-white mb-4 focus:outline-none focus:border-amber-300"
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
                  localStorage.setItem('ss_custom_logo', logoUrl);
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