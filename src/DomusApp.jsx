import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag, Wrench, CarFront, FileSignature, AlertCircle, CheckCircle2 } from 'lucide-react';

// ==========================================
// 1. COMPONENTES REUTILIZABLES (Interactividad Extrema)
// ==========================================

const AnimatedButton = ({ text, fullWidth = false, onClick, secondary = false, icon: Icon }) => {
  const chars = text.split('');
  return (
    <button 
      onClick={onClick} 
      className={`group/btn relative px-5 py-3.5 rounded-[20px] font-black tracking-widest text-[10px] md:text-xs transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.02] hover:-translate-y-1 active:scale-95 shadow-sm overflow-hidden flex items-center justify-center gap-3 ${
        fullWidth ? 'w-full' : ''
      } ${
        secondary 
          ? 'bg-white/40 backdrop-blur-2xl border border-white/80 text-[#202020] hover:bg-white/70 hover:shadow-lg hover:border-white' 
          : 'bg-[#5E7AC6]/90 backdrop-blur-2xl border border-[#5E7AC6]/50 text-white hover:bg-[#5E7AC6] hover:shadow-[0_15px_40px_rgba(94,122,198,0.4)]'
      }`}
    >
      {/* Brillo transversal CSS */}
      <div className="absolute inset-0 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] -skew-x-[20deg] transition-all duration-700 ease-in-out group-hover/btn:translate-x-[50%] z-0 pointer-events-none"></div>
      
      {Icon && <Icon className="w-4 h-4 transition-transform duration-500 group-hover/btn:scale-110 z-10" />}
      
      {/* Texto en cascada (Estilo Cata) */}
      <div className="relative overflow-hidden flex items-center justify-center z-10">
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

const AreaCard = ({ title, subtitle, imgUrl, accentColor, stats }) => (
  <div className="relative group/card min-w-[300px] w-full md:min-w-0 snap-center shrink-0 cursor-pointer">
    {/* Glow background que reacciona al hover */}
    <div className="absolute -inset-2 bg-gradient-to-br from-white/80 via-white/20 to-transparent rounded-[40px] blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 ease-out z-0"></div>
    
    <div className="relative h-full bg-white/40 backdrop-blur-[30px] rounded-[32px] overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/60 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/card:-translate-y-3 group-hover/card:border-white z-10 flex flex-col">
      
      <div className="relative w-full h-44 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/card:scale-110" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 transition-opacity duration-500 group-hover/card:opacity-80"></div>
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-[#202020] shadow-sm flex items-center gap-2 transition-transform duration-500 group-hover/card:scale-105">
           <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span> {subtitle}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow justify-between bg-gradient-to-b from-white/10 to-white/40">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-[#202020] mb-2 transition-colors duration-300 group-hover/card:text-[#5E7AC6]">{title}</h3>
          
          <div className="flex justify-between items-center bg-white/50 backdrop-blur-md rounded-2xl p-3 mb-5 border border-white/50 shadow-sm transition-transform duration-500 group-hover/card:-translate-y-1">
            <span className="text-[10px] font-bold text-[#5E7AC6] uppercase tracking-wider">{stats.label}</span>
            <span className="text-sm font-black text-[#202020]">{stats.value}</span>
          </div>
        </div>
        <button className="w-full py-3.5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 text-[#202020] text-[11px] font-black tracking-widest uppercase hover:bg-white hover:shadow-[0_10px_20px_rgba(94,122,198,0.2)] hover:text-[#5E7AC6] transition-all duration-300">
          Entrar al Módulo
        </button>
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
    { title: "Cocina & Despensa", subtitle: "Operaciones", accentColor: "#EE6B5F", imgUrl: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&q=80&w=800", stats: { label: "Mermas Hoy", value: "1.2 kg" } },
    { title: "Seguridad", subtitle: "Perímetro", accentColor: "#5E7AC6", imgUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800", stats: { label: "Rondas Check", value: "4 / 4" } },
    { title: "Hospitalidad", subtitle: "Servicio", accentColor: "#808080", imgUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800", stats: { label: "Habitaciones", value: "Listas" } },
    { title: "Mantenimiento", subtitle: "Instalaciones", accentColor: "#EE6B5F", imgUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", stats: { label: "Tickets Abiertos", value: "2 Pendientes" } },
    { title: "Cuidados Médicos", subtitle: "Salud", accentColor: "#5E7AC6", imgUrl: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=800", stats: { label: "Control Tensión", value: "120/80 mmHg" } }
  ];

  return (
    <div className="relative min-h-screen font-sans text-[#202020] overflow-x-hidden selection:bg-[#5E7AC6]/20">
      
      {/* 
        ==========================================
        FONDO DINÁMICO (Blobs forzados con style tag)
        ==========================================
      */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-[#F0F0F2]">
        <div className="domus-blob domus-blob-1"></div>
        <div className="domus-blob domus-blob-2"></div>
        <div className="domus-blob domus-blob-3"></div>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[60px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        
        {/* ==========================================
            CABECERA (HEADER) ALINEADO A LA IZQUIERDA
            ========================================== */}
        <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-[#202020]/5 pb-8">
          <div className="flex flex-col items-start gap-4">
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/Copia%20de%20Copia%20de%20Outloud%20(1920%20x%20600%20px)%20(1920%20x%20500%20px)%20(1).png" 
              alt="Domus" 
              className="h-16 md:h-20 object-contain drop-shadow-sm -ml-2"
            />
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#202020] leading-none">
                Buenos días, Sra. Belkys.
              </h1>
              <p className="mt-2 text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#5E7AC6]">
                CASA ROQUEDAL · Panel de Operaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start xl:self-auto">
            <div className="flex items-center gap-3 rounded-[20px] bg-white/50 backdrop-blur-2xl px-5 py-3.5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-transform">
              <Calendar className="h-5 w-5 text-[#5E7AC6]" />
              <span className="text-[11px] font-bold tracking-widest text-[#808080]">{formatDate(time)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-[20px] bg-white/50 backdrop-blur-2xl px-5 py-3.5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-transform">
              <Clock className="h-5 w-5 text-[#EE6B5F]" />
              <span className="text-base font-black tracking-tighter text-[#202020]">{formatTime(time)}</span>
            </div>
          </div>
        </header>

        {/* ==========================================
            SECCIÓN 1: DASHBOARD GRÁFICO (Glassmorphism Puro)
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          
          {/* Widget 1: Inventario */}
          <div className="bg-white/40 backdrop-blur-[40px] rounded-[36px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/80 flex items-center justify-between group hover:bg-white/60 transition-colors duration-500">
            <div className="w-1/2">
              <h3 className="text-xl font-black text-[#202020] mb-1 leading-tight group-hover:text-[#5E7AC6] transition-colors">Estado de Alacena</h3>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#808080] mb-6">Métricas de Stock</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#202020] bg-white/40 px-3 py-2 rounded-xl border border-white/50">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#5E7AC6]"></span> Cárnicos</span> <span>85%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#202020] bg-white/40 px-3 py-2 rounded-xl border border-white/50">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#BE7AC6]"></span> Lácteos</span> <span>60%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#EE6B5F] bg-white/40 px-3 py-2 rounded-xl border border-white/50">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#EE6B5F] animate-pulse shadow-[0_0_8px_#EE6B5F]"></span> Limpieza</span> <span>20%</span>
                </div>
              </div>
            </div>
            
            <div className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-xl flex-shrink-0 transition-transform duration-700 group-hover:scale-105">
               <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(#5E7AC6 0% 60%, #BE7AC6 60% 80%, #EE6B5F 80% 90%, transparent 90% 100%)` }}></div>
               <div className="absolute inset-3 bg-[#F0F0F2]/90 backdrop-blur-xl rounded-full border border-white flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl md:text-3xl font-black text-[#202020] tracking-tighter">55%</span>
                  <span className="text-[9px] font-extrabold text-[#5E7AC6] uppercase tracking-widest">Global</span>
               </div>
            </div>
          </div>

          {/* Widget 2: Carga Operativa */}
          <div className="bg-white/40 backdrop-blur-[40px] rounded-[36px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/80 flex flex-col justify-between group hover:bg-white/60 transition-colors duration-500 relative overflow-hidden">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" alt="Domus" className="absolute -left-10 -bottom-10 w-48 h-48 opacity-[0.03] grayscale object-contain transition-transform duration-700 group-hover:scale-110" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-xl font-black text-[#202020] mb-1 leading-tight group-hover:text-[#5E7AC6] transition-colors">Carga Operativa</h3>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#808080]">Tareas completadas</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white text-[#5E7AC6] px-3 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 transition-transform duration-300 group-hover:scale-105">
                 <ClipboardCheck className="w-3.5 h-3.5" /> 68
              </div>
            </div>
            
            <div className="flex items-end justify-between h-32 gap-2 md:gap-3 relative z-10">
              {[
                { d: 'L', h: '60%', c: '#5E7AC6' }, { d: 'M', h: '80%', c: '#5E7AC6' }, { d: 'M', h: '40%', c: '#5E7AC6' }, 
                { d: 'J', h: '95%', c: '#EE6B5F' }, { d: 'V', h: '70%', c: '#5E7AC6' }, { d: 'S', h: '30%', c: '#808080' }, { d: 'D', h: '20%', c: '#808080' }
              ].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group/bar relative cursor-pointer">
                  <div className="absolute -top-8 bg-white text-[#202020] border border-[#202020]/10 text-[10px] font-black py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 shadow-lg z-20 whitespace-nowrap">
                    {day.h}
                  </div>
                  <div className="w-full bg-[#202020]/5 rounded-t-xl relative overflow-hidden flex items-end h-[85%] transition-transform duration-300 group-hover/bar:-translate-y-1">
                    <div className="w-full rounded-t-xl transition-all duration-1000 ease-out shadow-inner" style={{ height: day.h, backgroundColor: day.c }}></div>
                  </div>
                  <span className="text-[11px] font-black text-[#808080] uppercase group-hover/bar:text-[#202020] transition-colors">{day.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Novedades */}
          <div className="relative bg-[#5E7AC6]/90 backdrop-blur-[50px] rounded-[36px] p-8 shadow-[0_20px_50px_rgba(94,122,198,0.3)] border border-white/30 text-white flex flex-col justify-between overflow-hidden group">
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" 
              alt="Domus" 
              className="absolute -right-8 -bottom-8 w-56 h-56 object-contain opacity-20 brightness-200 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-6"
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-2xl border border-white/40 px-4 py-2 rounded-full shadow-inner">
                  <Bell className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-white drop-shadow-sm">Alertas Activas</span>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md">
                   <span className="w-3 h-3 rounded-full bg-[#EE6B5F] animate-pulse shadow-[0_0_15px_#EE6B5F]"></span>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md hover:bg-black/20 transition-colors cursor-pointer">
                  <div className="bg-[#EE6B5F]/30 p-1.5 rounded-lg"><AlertCircle className="w-4 h-4 text-[#EE6B5F]" /></div>
                  <p className="text-xs font-bold leading-relaxed text-white drop-shadow-sm">Mantenimiento preventivo: <br/><span className="font-medium text-white/80">Planta Eléctrica Principal</span></p>
                </div>
                <div className="flex items-start gap-3 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md hover:bg-black/20 transition-colors cursor-pointer">
                  <div className="bg-emerald-400/30 p-1.5 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-300" /></div>
                  <p className="text-xs font-bold leading-relaxed text-white drop-shadow-sm">Visita autorizada en garita: <br/><span className="font-medium text-white/80">Sr. Álvaro Jiménez</span></p>
                </div>
              </div>
            </div>
            
            <button className="relative z-10 w-full py-4 bg-white hover:bg-transparent text-[#5E7AC6] hover:text-white border border-transparent hover:border-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all duration-300 shadow-lg hover:shadow-none hover:-translate-y-1">
              Abrir Centro de Control
            </button>
          </div>
        </div>

        {/* ==========================================
            SECCIÓN 2: DEPARTAMENTOS (Carrusel Táctil Interactivo)
            ========================================== */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#5E7AC6] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5E7AC6]"></span> Gestión por Departamentos
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-6 md:gap-8 pb-10 pt-4 snap-x snap-mandatory domus-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5">
            {areas.map((area, index) => (
              <AreaCard key={index} {...area} />
            ))}
          </div>
        </div>

        {/* ==========================================
            SECCIÓN 3: ACCIONES RÁPIDAS
            ========================================== */}
        <div className="mb-10">
          <h2 className="mb-6 text-xs md:text-sm font-black uppercase tracking-widest text-[#5E7AC6] px-2 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#5E7AC6]"></span> Accesos Directos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            <AnimatedButton text="REPORTAR NOVEDAD" icon={ClipboardCheck} />
            <AnimatedButton text="SOLICITAR INSUMOS" icon={ShoppingBag} secondary={true} />
            <AnimatedButton text="MENÚ DEL DÍA" icon={Coffee} secondary={true} />
            <AnimatedButton text="AGENDA FAMILIAR" icon={Calendar} secondary={true} />
            <AnimatedButton text="LOGÍSTICA / AUTOS" icon={CarFront} secondary={true} />
            <AnimatedButton text="AUTORIZAR VISITA" icon={FileSignature} secondary={true} />
          </div>
        </div>

      </div>

      {/* ==========================================
          ANIMACIONES Y ESTILOS INYECTADOS
          ========================================== */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Scrollbar minimalista para el carrusel */
        .domus-scrollbar::-webkit-scrollbar { height: 6px; }
        .domus-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 10px; margin: 0 20px; }
        .domus-scrollbar::-webkit-scrollbar-thumb { background: rgba(94, 122, 198, 0.3); border-radius: 10px; }
        .domus-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(94, 122, 198, 0.6); }
        
        /* Blobs forzados en CSS para ignorar Tailwind */
        .domus-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          mix-blend-mode: multiply;
          animation: domusBlobAnim 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
        .domus-blob-1 {
          top: -10%; left: -10%;
          width: 50vw; height: 50vw;
          background-color: #5E7AC6;
          animation-delay: 0s;
        }
        .domus-blob-2 {
          top: 10%; right: -10%;
          width: 45vw; height: 45vw;
          background-color: #EE6B5F;
          animation-duration: 25s;
          animation-direction: alternate-reverse;
        }
        .domus-blob-3 {
          bottom: -20%; left: 20%;
          width: 60vw; height: 60vw;
          background-color: #BE7AC6;
          animation-duration: 30s;
          animation-delay: -5s;
        }
        
        @keyframes domusBlobAnim {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5vw, -5vh) scale(1.1); }
          66% { transform: translate(-5vw, 5vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default DomusApp;