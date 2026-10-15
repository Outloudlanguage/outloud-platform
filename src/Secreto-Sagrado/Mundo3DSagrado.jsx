// src/Secreto-Sagrado/Mundo3DSagrado.jsx
import React, { useState } from 'react';
import MundoEden3D from './MundoEden3D';

const CATALOGO_MUNDOS_CARRUSEL = [
  {
    id: 'eden',
    era: 1,
    titulo: 'El Jardín de Edén',
    subtitulo: 'Génesis 2:8 - 3:24',
    disponible: true,
    gradiente: 'from-emerald-500/40 via-cyan-500/30 to-amber-400/30'
  },
  {
    id: 'arca_noe',
    era: 1,
    titulo: 'El Arca de Noé',
    subtitulo: 'En construcción para la siguiente etapa',
    disponible: false,
    gradiente: 'from-slate-800/60 to-slate-900/80'
  },
  {
    id: 'monte_moria',
    era: 2,
    titulo: 'El Monte Moria',
    subtitulo: 'En construcción para la siguiente etapa',
    disponible: false,
    gradiente: 'from-slate-800/60 to-slate-900/80'
  },
  {
    id: 'mar_rojo',
    era: 3,
    titulo: 'El Mar Rojo Dividido',
    subtitulo: 'En construcción para la siguiente etapa',
    disponible: false,
    gradiente: 'from-slate-800/60 to-slate-900/80'
  },
  {
    id: 'tabernaculo',
    era: 3,
    titulo: 'El Tabernáculo',
    subtitulo: 'En construcción para la siguiente etapa',
    disponible: false,
    gradiente: 'from-slate-800/60 to-slate-900/80'
  }
];

export default function Mundo3DSagrado({
  modoMenu = false,
  hablarConVozDM = null,
  onCerrar = null
}) {
  // Si se abre al finalizar la Pregunta 1 (modoMenu = false), entra directo a Edén sin interfaz intermedia
  const [mundoActivoId, setMundoActivoId] = useState(modoMenu ? null : 'eden');
  const [indiceCoverflow, setIndiceCoverflow] = useState(0);
  const [touchInicioX, setTouchInicioX] = useState(null);

  if (mundoActivoId === 'eden') {
    return (
      <MundoEden3D
        hablarConVozDM={hablarConVozDM}
        onCompletar={() => {
          if (onCerrar) onCerrar();
        }}
      />
    );
  }

  // CARRUSEL COVERFLOW 3D PARA EL MENÚ DE MUNDOS
  return (
    <div
      onTouchStart={(e) => setTouchInicioX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchInicioX === null) return;
        const delta = e.changedTouches[0].clientX - touchInicioX;
        if (delta < -40) {
          setIndiceCoverflow((i) => Math.min(CATALOGO_MUNDOS_CARRUSEL.length - 1, i + 1));
        } else if (delta > 40) {
          setIndiceCoverflow((i) => Math.max(0, i - 1));
        }
        setTouchInicioX(null);
      }}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-3xl flex flex-col justify-between p-8 md:p-14 select-none text-white overflow-hidden"
    >
      <header className="flex items-center justify-between">
        <button
          onClick={onCerrar}
          className="px-6 py-2.5 rounded-full bg-white/15 hover:bg-white/30 border border-white/40 text-xs font-black tracking-widest uppercase transition-all"
        >
          ← Menú Principal
        </button>
        <span className="text-xs font-black tracking-[0.28em] uppercase text-amber-200">
          Desliza para elegir un Mundo 3D
        </span>
        <div className="w-28" />
      </header>

      {/* CARRUSEL COVERFLOW 3D */}
      <main
        style={{ perspective: '1200px' }}
        className="relative flex-1 flex items-center justify-center w-full"
      >
        {CATALOGO_MUNDOS_CARRUSEL.map((m, idx) => {
          const offset = idx - indiceCoverflow;
          const absOffset = Math.abs(offset);
          const esCentro = offset === 0;

          return (
            <div
              key={m.id}
              onClick={() => {
                if (!esCentro) {
                  setIndiceCoverflow(idx);
                } else if (m.disponible) {
                  setMundoActivoId(m.id);
                }
              }}
              style={{
                transform: `translateX(${offset * 240}px) translateZ(${-absOffset * 160}px) rotateY(${
                  offset * -32
                }deg)`,
                zIndex: 20 - absOffset,
                opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.28
              }}
              className={`absolute w-80 md:w-96 h-96 rounded-[40px] p-8 backdrop-blur-2xl border-2 flex flex-col items-center justify-between text-center transition-all duration-500 cursor-pointer bg-gradient-to-br ${
                m.gradiente
              } ${
                esCentro
                  ? 'border-white shadow-[0_0_60px_rgba(56,189,248,0.45)]'
                  : 'border-white/25'
              }`}
            >
              <span className="px-4 py-1 rounded-full bg-black/40 border border-white/30 text-[11px] font-black tracking-widest uppercase text-amber-200">
                Era {m.era}
              </span>

              <div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                  {m.titulo}
                </h2>
                <p className="text-xs font-bold text-white/80 tracking-widest uppercase mt-2">
                  {m.subtitulo}
                </p>
              </div>

              {m.disponible ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMundoActivoId(m.id);
                  }}
                  className="w-full py-4 rounded-full bg-white text-slate-950 font-black text-xs tracking-widest uppercase shadow-xl hover:scale-105 transition-transform"
                >
                  Entrar al Mundo 3D →
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-full bg-black/40 border border-white/20 text-white/60 font-bold text-xs tracking-widest uppercase">
                  Próximamente
                </div>
              )}
            </div>
          );
        })}
      </main>

      <footer className="flex items-center justify-center gap-3">
        {CATALOGO_MUNDOS_CARRUSEL.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setIndiceCoverflow(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === indiceCoverflow ? 'w-10 bg-amber-300' : 'w-2.5 bg-white/30'
            }`}
          />
        ))}
      </footer>
    </div>
  );
}