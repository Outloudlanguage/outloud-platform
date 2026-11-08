import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag, Wrench, CarFront, FileSignature, AlertCircle, CheckCircle2 } from 'lucide-react';

// ==========================================
// 1. COMPONENTES REUTILIZABLES (Glassmorphism Premium)
// ==========================================

const AnimatedButton = ({ text, fullWidth = false, onClick, secondary = false, icon: Icon }) => {
  return (
    <button 
      onClick={onClick} 
      className={`group relative flex items-center justify-center gap-2 px-4 py-3 md:px-5 md:py-3.5 rounded-2xl font-bold tracking-wide text-xs transition-all duration-500 hover:-translate-y-1 active:scale-95 shadow-sm overflow-hidden ${
        fullWidth ? 'w-full' : ''
      } ${
        secondary 
          ? 'bg-white/50 backdrop-blur-xl border border-white/60 text-[#202020] hover:bg-white/80 hover:border-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)]' 
          : 'bg-[#5E7AC6]/90 backdrop-blur-xl border border-[#5E7AC6]/50 text-white hover:bg-[#5E7AC6] hover:shadow-[0_8px_25px_rgba(94,122,198,0.4)]'
      }`}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:animate-[shine_1.5s_ease-out]"></div>
      {Icon && <Icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110 z-10" />}
      <span className="z-10">{text}</span>
    </button>
  );
};

const AreaCard = ({ title, subtitle, imgUrl, accentColor, stats }) => (
  <div className="relative group min-w-[280px] w-full md:min-w-0 snap-center shrink-0">
    <div className="absolute -inset-1 bg-gradient-to-r from-[#5E7AC6] to-[#EE6B5F] rounded-[32px] blur-lg opacity-0 group-hover:opacity-40 transition duration-700 ease-out"></div>
    <div className="relative h-full bg-white/40 backdrop-blur-2xl rounded-[28px] overflow-hidden shadow-[0_8px_32px_rgb(0,0,0,0.04)] border border-white/60 transition-transform duration-500 group-hover:-translate-y-2 flex flex-col z-10">
      <div className="relative w-full h-40 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-[#202020] shadow-sm">
          {subtitle}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight text-[#202020] mb-1">{title}</h3>
          <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: accentColor }}></div>
          <div className="flex justify-between items-center bg-white/50 rounded-xl p-2 mb-4 border border-white/40">
            <span className="text-[10px] font-bold text-[#808080] uppercase">{stats.label}</span>
            <span className="text-xs font-black text-[#202020]">{stats.value}</span>
          </div>
        </div>
        <button className="w-full py-3 rounded-xl bg-white/60 border border-white/60 text-[#202020] text-xs font-bold hover:bg-white hover:shadow-md transition-all duration-300">
          Entrar al Módulo
        </button>
      </div>
    </div>
  </div>
);

// ==========================================
// 2. DASHBOARD PRINCIPAL (CASA ROQUEDAL)
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
    { title: "Cuidados", subtitle: "Salud", accentColor: "#5E7AC6", imgUrl: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=800", stats: { label: "Tratamientos", value: "Al día" } }
  ];

  return (
    <div className="relative min-h-screen font-sans text-[#202020] overflow-x-hidden selection:bg-[#5E7AC6]/20 bg-[#F0F0F2]">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[60px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-4">
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/Copia%20de%20Copia%20de%20Outloud%20(1920%20x%20600%20px)%20(1920%20x%20500%20px)%20(1).png" 
              alt="Domus" 
              className="h-8 md:h-10 object-contain drop-shadow-sm"
            />
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#202020]">
                Buenos días, Sra. Belkys.
              </h1>
              <p className="mt-1 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#808080]">
                CASA ROQUEDAL · Panel de Operaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 rounded-2xl bg-white/40 backdrop-blur-xl px-4 py-2 border border-white/60 shadow-sm">
              <Calendar className="h-4 w-4 text-[#5E7AC6]" />
              <span className="text-[10px] font-bold tracking-widest text-[#808080]">{formatDate(time)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/40 backdrop-blur-xl px-4 py-2 border border-white/60 shadow-sm">
              <Clock className="h-4 w-4 text-[#EE6B5F]" />
              <span className="text-sm font-black tracking-tighter text-[#202020]">{formatTime(time)}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 flex items-center justify-between group hover:bg-white/60 transition-colors duration-500">
            <div className="w-1/2">
              <h3 className="text-sm font-bold text-[#202020] mb-1">Estado de Alacena</h3>
              <p className="text-[9px] uppercase tracking-widest text-[#808080] mb-4">Métricas de Stock</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#5E7AC6]"></span> Cárnicos</span> <span>85%</span></div>
                <div className="flex justify-between items-center text-[10px] font-bold"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#BE7AC6]"></span> Lácteos</span> <span>60%</span></div>
                <div className="flex justify-between items-center text-[10px] font-bold"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#EE6B5F]"></span> Limpieza</span> <span className="text-[#EE6B5F]">20%</span></div>
              </div>
            </div>
            <div className="relative w-28 h-28 drop-shadow-xl">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path className="text-white/50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-[#5E7AC6]" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="animate-[drawRing_1.5s_ease-out_forwards]" />
                <path className="text-[#EE6B5F]" strokeDasharray="20, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDashoffset="-80" className="animate-[drawRing_2s_ease-out_forwards]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-black text-[#202020]">55%</span>
                <span className="text-[8px] font-bold text-[#808080] uppercase tracking-widest">Global</span>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col justify-between group hover:bg-white/60 transition-colors duration-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202020] mb-1">Carga Operativa</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#808080]">Tareas por día</p>
              </div>
              <div className="bg-white border border-white/60 text-[#5E7AC6] px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">68 Tareas</div>
            </div>
            <div className="flex items-end justify-between h-20 gap-1.5 md:gap-2">
              {[
                { d: 'L', h: '60%', c: '#5E7AC6' }, { d: 'M', h: '80%', c: '#5E7AC6' }, { d: 'M', h: '40%', c: '#5E7AC6' }, 
                { d: 'J', h: '95%', c: '#EE6B5F' }, { d: 'V', h: '70%', c: '#5E7AC6' }, { d: 'S', h: '30%', c: '#808080' }, { d: 'D', h: '20%', c: '#808080' }
              ].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full group/bar relative">
                  <div className="absolute -top-6 bg-[#202020] text-white text-[8px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {day.h}
                  </div>
                  <div className="w-full bg-white/50 border border-white/60 rounded-t-md h-full relative overflow-hidden flex items-end">
                    <div className="w-full transition-all duration-1000 ease-out rounded-t-md opacity-90 group-hover/bar:opacity-100" style={{ height: day.h, backgroundColor: day.c }}></div>
                  </div>
                  <span className="text-[9px] font-bold text-[#808080]">{day.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#5E7AC6] to-[#4A64A4] rounded-[32px] p-6 shadow-[0_15px_30px_rgba(94,122,198,0.3)] text-white flex flex-col justify-between overflow-hidden">
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" 
              alt="Domus Watermark" 
              className="absolute -right-4 -bottom-4 w-40 h-40 object-contain opacity-10 grayscale brightness-200"
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                  <Bell className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Alertas Activas</span>
                </div>
                <span className="w-3 h-3 rounded-full bg-[#EE6B5F] animate-pulse shadow-[0_0_10px_#EE6B5F]"></span>
              </div>
              
              <div className="space-y-3 mt-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#EE6B5F] shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-tight">Mantenimiento preventivo: <br/><span className="font-normal text-white/80">Planta Eléctrica Principal</span></p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-tight">Visita autorizada en garita: <br/><span className="font-normal text-white/80">Sr. Álvaro Jiménez</span></p>
                </div>
              </div>
            </div>
            <button className="relative z-10 w-full py-3 bg-white/10 hover:bg-white text-white hover:text-[#5E7AC6] border border-white/30 hover:border-white text-xs font-bold rounded-xl transition-all duration-300">
              Abrir Centro de Control
            </button>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#808080]">
              Gestión por Departamentos
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5">
            {areas.map((area, index) => (
              <AreaCard key={index} {...area} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#808080] px-1">
            Accesos Directos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            <AnimatedButton text="Reportar Novedad" icon={ClipboardCheck} />
            <AnimatedButton text="Solicitar Insumos" icon={ShoppingBag} secondary={true} />
            <AnimatedButton text="Menú del Día" icon={Coffee} secondary={true} />
            <AnimatedButton text="Agenda Familiar" icon={Calendar} secondary={true} />
            <AnimatedButton text="Logística / Autos" icon={CarFront} secondary={true} />
            <AnimatedButton text="Autorizar Visita" icon={FileSignature} secondary={true} />
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes drawRing { 
          from { stroke-dashoffset: 200; } 
        }

        @keyframes shine {
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          mix-blend-mode: multiply;
          animation: blobAnim 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blob-1 {
          top: -10%; left: -10%;
          width: 55vw; height: 55vw;
          background-color: #5E7AC6;
          animation-delay: 0s;
        }
        .blob-2 {
          top: 20%; right: -10%;
          width: 45vw; height: 45vw;
          background-color: #EE6B5F;
          animation-duration: 25s;
          animation-direction: alternate-reverse;
        }
        .blob-3 {
          bottom: -20%; left: 20%;
          width: 65vw; height: 65vw;
          background-color: #BE7AC6;
          animation-duration: 30s;
          animation-delay: -5s;
        }
        
        @keyframes blobAnim {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5vw, -8vh) scale(1.05); }
          66% { transform: translate(-5vw, 8vh) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default DomusApp;