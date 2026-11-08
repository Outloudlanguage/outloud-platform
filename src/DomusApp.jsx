import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag, Wrench, CarFront, FileSignature } from 'lucide-react';

// ==========================================
// 1. REUSABLE UI COMPONENTS (Cata Style - Light Theme)
// ==========================================
const AnimatedButton = ({ text, fullWidth = false, onClick, secondary = false, icon: Icon }) => {
  const chars = text.split('');
  return (
    <button 
      onClick={onClick} 
      className={`group/btn relative px-4 py-3 md:px-6 md:py-3 rounded-full backdrop-blur-lg border font-bold tracking-widest text-[9px] md:text-[11px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
        fullWidth ? 'w-full' : ''
      } ${
        secondary 
          ? 'bg-white/40 border-gray-300 text-slate-700 hover:bg-white/80 hover:border-gray-400 hover:shadow-md' 
          : 'bg-white/80 border-blue-200 text-blue-900 hover:bg-white hover:border-blue-400 hover:shadow-[0_10px_25px_rgba(59,130,246,0.15)]'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 z-10 transition-transform duration-500 group-hover/btn:scale-110" />}
      <div className="relative overflow-hidden flex items-center justify-center">
        <div className="flex">
          {chars.map((char, i) => (
            <span 
              key={`vis-${i}`} 
              className="block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/btn:-translate-y-[150%] group-hover/btn:rotate-[-8deg]" 
              style={{ transitionDelay: `${i * 0.02}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="flex">
            {chars.map((char, i) => (
              <span 
                key={`hid-${i}`} 
                className="block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] translate-y-[150%] rotate-[8deg] group-hover/btn:translate-y-0 group-hover/btn:rotate-0" 
                style={{ transitionDelay: `${i * 0.02}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

const AreaCard = ({ title, subtitle, description, bgImage }) => (
  <div className="group/card relative w-full h-[220px] md:h-[320px] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm cursor-default flex flex-col border border-white/60 transition-all duration-500 hover:shadow-2xl hover:border-white">
    {/* Fondo de Imagen */}
    <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover/card:scale-110" style={{ backgroundImage: `url('${bgImage}')` }}></div>
    
    {/* Overlays */}
    <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] transition-opacity duration-500 group-hover/card:opacity-0"></div>
    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"></div>

    {/* Estado Inicial (Fondo oscuro degradado para leer texto blanco) */}
    <div className="absolute inset-0 p-6 flex flex-col justify-end transition-opacity duration-500 group-hover/card:opacity-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10">
      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none drop-shadow-md">{title}</h3>
      <p className="text-[10px] md:text-xs font-bold text-white/90 tracking-widest uppercase mt-2 drop-shadow-md">{subtitle}</p>
    </div>

    {/* Estado Hover (Glassmorphism claro, texto oscuro) */}
    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between opacity-0 translate-y-8 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/card:opacity-100 group-hover/card:translate-y-0 text-slate-800 z-20">
      <div>
        <h3 className="text-xl md:text-2xl font-black tracking-tight leading-none text-slate-900">{title}</h3>
        <p className="text-[10px] md:text-xs font-bold text-blue-600 tracking-widest uppercase mt-2">{subtitle}</p>
      </div>
      <p className="text-xs md:text-sm font-medium leading-relaxed mb-4 text-slate-700">
        {description}
      </p>
      <div className="w-full">
        <AnimatedButton text="ENTRAR AL MÓDULO" fullWidth={true} />
      </div>
    </div>
  </div>
);

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================
const DomusApp = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options).toUpperCase();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const areas = [
    {
      title: "Cocina y Despensa",
      subtitle: "Operaciones Culinarias",
      description: "Recetario de la familia, control de mermas, inventario en tiempo real y planeación del menú diario.",
      bgImage: "https://images.unsplash.com/photo-1556910103-1c02745a872e?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Garita y Seguridad",
      subtitle: "Control Patrimonial",
      description: "Bitácora de rondas escaneadas, registro de proveedores y control de acceso a la residencia.",
      bgImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Hospitalidad",
      subtitle: "Preferencias Familiares",
      description: "Preparación de habitaciones para invitados, control de tintorería y exigencias de los residentes.",
      bgImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Mantenimiento",
      subtitle: "Instalaciones",
      description: "Historial de reparaciones, directorio técnico y alertas preventivas para equipos costosos.",
      bgImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="relative min-h-screen font-sans text-slate-800 overflow-x-hidden selection:bg-blue-200">
      
      {/* 
        ==========================================
        BACKGROUND: PASTEL WAVES ANIMATION
        ==========================================
      */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fafc]">
        {/* Blob 1 - Soft Blue */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-[blob_15s_infinite_alternate] bg-blue-100"></div>
        {/* Blob 2 - Soft Peach */}
        <div className="absolute top-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-[blob_18s_infinite_alternate-reverse] bg-orange-50"></div>
        {/* Blob 3 - Soft Lavender */}
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-[blob_20s_infinite_alternate] bg-purple-100"></div>
      </div>

      {/* 
        ==========================================
        MAIN CONTENT
        ==========================================
      */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        
        {/* HEADER SECTION */}
        <header className="mb-10 flex flex-col items-start justify-between gap-6 rounded-[32px] border border-white/60 bg-white/40 p-8 backdrop-blur-2xl shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
              Buenos días, Sra. Belkys.
            </h1>
            <p className="mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
              Panel Principal · Residencia Dr. Jiménez
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-2 backdrop-blur-md shadow-sm">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-bold tracking-widest text-slate-600">{formatDate(time)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-2 backdrop-blur-md shadow-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-black tracking-tighter text-slate-800">{formatTime(time)}</span>
              </div>
            </div>
            {/* Botón de Emergencia/Notificación */}
            <AnimatedButton text="NOTIFICACIONES (0)" icon={Bell} secondary={true} />
          </div>
        </header>

        {/* 
          ==========================================
          REALISTIC HOUSEKEEPER TASKS (Botones de Sra. Belkys)
          ==========================================
        */}
        <div className="mb-10 rounded-[32px] border border-white/50 bg-white/30 p-6 md:p-8 backdrop-blur-xl shadow-sm">
          <h2 className="mb-5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
            Acciones Rápidas (Diarias)
          </h2>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <AnimatedButton text="REPORTAR NOVEDAD" icon={ClipboardCheck} />
            <AnimatedButton text="SOLICITAR INSUMOS" icon={ShoppingBag} secondary={true} />
            <AnimatedButton text="MENÚ DEL DÍA" icon={Coffee} secondary={true} />
            <AnimatedButton text="AGENDA FAMILIAR" icon={Calendar} secondary={true} />
            <AnimatedButton text="MANTENIMIENTO" icon={Wrench} secondary={true} />
            <AnimatedButton text="CHÓFERES / LOGÍSTICA" icon={CarFront} secondary={true} />
            <AnimatedButton text="AUTORIZAR INGRESO" icon={FileSignature} secondary={true} />
          </div>
        </div>

        {/* 
          ==========================================
          AREAS DE LA CASA (Hero Cards de Cata adaptadas)
          ==========================================
        */}
        <div>
          <h2 className="mb-5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 pl-2">
            Gestión por Departamentos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area, index) => (
              <AreaCard key={index} {...area} />
            ))}
          </div>
        </div>

      </div>

      {/* Animación personalizada para el fondo */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}} />
    </div>
  );
};

export default DomusApp;