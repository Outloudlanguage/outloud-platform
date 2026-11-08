import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag, Wrench, CarFront, FileSignature, AlertCircle, CheckCircle2 } from 'lucide-react';

// ==========================================
// 1. COMPONENTES REUTILIZABLES (Glassmorphism Premium Forzado)
// ==========================================

const AnimatedButton = ({ text, fullWidth = false, onClick, secondary = false, icon: Icon }) => {
  return (
    <button 
      onClick={onClick} 
      className={`group relative flex items-center justify-center gap-3 px-6 py-4 rounded-[20px] font-extrabold tracking-widest text-xs transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden ${
        fullWidth ? 'w-full' : ''
      } ${
        secondary 
          ? 'bg-white/40 backdrop-blur-2xl border border-white/80 text-[#202020] hover:bg-white/70 hover:shadow-lg' 
          : 'bg-[#5E7AC6]/80 backdrop-blur-2xl border border-[#5E7AC6]/50 text-white hover:bg-[#5E7AC6] hover:shadow-[0_15px_40px_rgba(94,122,198,0.4)]'
      }`}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[shine_1.5s_ease-out]"></div>
      {Icon && <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 z-10" />}
      <span className="z-10">{text}</span>
    </button>
  );
};

const AreaCard = ({ title, subtitle, imgUrl, accentColor, stats }) => (
  <div className="relative group min-w-[300px] w-full md:min-w-0 snap-center shrink-0">
    {/* Efecto Glow en Hover */}
    <div className="absolute -inset-2 bg-gradient-to-br from-white/60 to-transparent rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition duration-700 ease-out z-0"></div>
    
    <div className="relative h-full bg-white/30 backdrop-blur-[30px] rounded-[32px] overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/60 transition-transform duration-500 group-hover:-translate-y-2 flex flex-col z-10">
      
      <div className="relative w-full h-44 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-[#202020] shadow-sm flex items-center gap-2">
           <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span> {subtitle}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow justify-between bg-gradient-to-b from-white/10 to-white/40">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-[#202020] mb-2">{title}</h3>
          
          <div className="flex justify-between items-center bg-white/40 backdrop-blur-md rounded-2xl p-3 mb-5 border border-white/50 shadow-sm">
            <span className="text-[10px] font-bold text-[#5E7AC6] uppercase tracking-wider">{stats.label}</span>
            <span className="text-sm font-black text-[#202020]">{stats.value}</span>
          </div>
        </div>
        <button className="w-full py-3.5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 text-[#202020] text-[11px] font-extrabold tracking-widest uppercase hover:bg-white hover:shadow-lg hover:text-[#5E7AC6] transition-all duration-300">
          Entrar al Módulo
        </button>
      </div>
    </div>
  </div>
);

// ==========================================
// 2. DASHBOARD PRINCIPAL 
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
        FONDO DINÁMICO (MESH GRADIENT ANIMADO FORZADO POR CSS)
        ==========================================
      */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-[#F0F0F2]">
        <div className="absolute inset-0 opacity-40 mix-blend-multiply animated-mesh-bg"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        
        {/* ==========================================
            CABECERA (HEADER) ALINEADO A LA IZQUIERDA
            ========================================== */}
        <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-black/5 pb-8">
          <div className="flex flex-col items-start gap-4">
            {/* Logo grande y alineado a la izquierda */}
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
            <div className="flex items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-2xl px-5 py-3 border border-white/60 shadow-sm">
              <Calendar className="h-5 w-5 text-[#5E7AC6]" />
              <span className="text-[11px] font-bold tracking-widest text-[#808080]">{formatDate(time)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-2xl px-5 py-3 border border-white/60 shadow-sm">
              <Clock className="h-5 w-5 text-[#EE6B5F]" />
              <span className="text-base font-black tracking-tighter text-[#202020]">{formatTime(time)}</span>
            </div>
          </div>
        </header>

        {/* ==========================================
            SECCIÓN 1: DASHBOARD GRÁFICO (Widgets 100% Glassmorfismo)
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          
          {/* Widget 1: Dona de Inventario (CSS Conic Gradient Puro) */}
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[36px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/70 flex items-center justify-between group hover:bg-white/40 transition-colors duration-500">
            <div className="w-1/2">
              <h3 className="text-lg font-black text-[#202020] mb-1 leading-tight">Estado de Alacena</h3>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#808080] mb-6">Métricas de Stock</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#202020]">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#5E7AC6] shadow-sm"></span> Cárnicos</span> <span>85%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#202020]">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#BE7AC6] shadow-sm"></span> Lácteos</span> <span>60%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#EE6B5F]">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#EE6B5F] shadow-sm animate-pulse"></span> Limpieza</span> <span>20%</span>
                </div>
              </div>
            </div>
            
            <div className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-xl flex-shrink-0">
               {/* Gráfico Conic Gradient Seguro para Tailwind */}
               <div className="w-full h-full rounded-full" 
                    style={{ background: `conic-gradient(#5E7AC6 0% 60%, #BE7AC6 60% 80%, #EE6B5F 80% 90%, #F0F0F2 90% 100%)` }}>
               </div>
               {/* Hueco central de la dona (Glassmorphism interno) */}
               <div className="absolute inset-3 bg-[#F0F0F2]/80 backdrop-blur-md rounded-full border border-white flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xl md:text-3xl font-black text-[#202020] tracking-tighter">55%</span>
                  <span className="text-[9px] font-extrabold text-[#5E7AC6] uppercase tracking-widest">Global</span>
               </div>
            </div>
          </div>

          {/* Widget 2: Actividad de Tareas Detallada */}
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[36px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/70 flex flex-col justify-between group hover:bg-white/40 transition-colors duration-500 relative overflow-hidden">
             {/* Logo Standalone de Fondo Suave */}
             <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" alt="Domus Logo" className="absolute -left-10 -bottom-10 w-48 h-48 opacity-5 grayscale object-contain" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-lg font-black text-[#202020] mb-1 leading-tight">Carga Operativa</h3>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#808080]">Tareas completadas</p>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/80 text-[#5E7AC6] px-3 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1">
                 <ClipboardCheck className="w-3.5 h-3.5" /> 68 Tareas
              </div>
            </div>
            
            {/* Gráfico de Barras Seguro */}
            <div className="flex items-end justify-between h-32 gap-2 relative z-10">
              {[
                { d: 'L', h: '60%', c: '#5E7AC6' }, { d: 'M', h: '80%', c: '#5E7AC6' }, { d: 'M', h: '40%', c: '#5E7AC6' }, 
                { d: 'J', h: '95%', c: '#EE6B5F' }, { d: 'V', h: '70%', c: '#5E7AC6' }, { d: 'S', h: '30%', c: '#808080' }, { d: 'D', h: '20%', c: '#808080' }
              ].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group/bar relative">
                  <div className="absolute -top-8 bg-[#202020] text-white text-[9px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 shadow-lg z-20">
                    {day.h}
                  </div>
                  <div className="w-full bg-black/5 rounded-t-lg relative overflow-hidden flex items-end h-[80%] transition-transform duration-300 group-hover/bar:scale-x-110">
                    <div className="w-full rounded-t-lg transition-all duration-1000 ease-out shadow-inner" style={{ height: day.h, backgroundColor: day.c }}></div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#808080] uppercase">{day.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Novedades / Alertas (Glassmorphism Oscuro / Marca Domus) */}
          <div className="relative bg-[#5E7AC6]/90 backdrop-blur-[40px] rounded-[36px] p-8 shadow-[0_20px_50px_rgba(94,122,198,0.3)] border border-white/20 text-white flex flex-col justify-between overflow-hidden">
            {/* Logo Standalone Superpuesto Grande */}
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" 
              alt="Domus Watermark" 
              className="absolute -right-8 -bottom-8 w-56 h-56 object-contain opacity-20 brightness-200"
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 px-4 py-2 rounded-full shadow-inner">
                  <Bell className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-white drop-shadow-sm">Alertas Activas</span>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md">
                   <span className="w-3 h-3 rounded-full bg-[#EE6B5F] animate-pulse shadow-[0_0_15px_#EE6B5F]"></span>
                </div>
              </div>
              
              <div className="space-y-4 mb-6 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="bg-[#EE6B5F]/20 p-1.5 rounded-lg"><AlertCircle className="w-4 h-4 text-[#EE6B5F]" /></div>
                  <p className="text-xs font-bold leading-relaxed text-white drop-shadow-sm">Mantenimiento preventivo: <br/><span className="font-medium text-white/80">Planta Eléctrica Principal</span></p>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-400/20 p-1.5 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-300" /></div>
                  <p className="text-xs font-bold leading-relaxed text-white drop-shadow-sm">Visita autorizada en garita: <br/><span className="font-medium text-white/80">Sr. Álvaro Jiménez</span></p>
                </div>
              </div>
            </div>
            
            <button className="relative z-10 w-full py-4 bg-white hover:bg-transparent text-[#5E7AC6] hover:text-white border border-transparent hover:border-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all duration-500 shadow-lg hover:shadow-none">
              Abrir Centro de Control
            </button>
          </div>
        </div>

        {/* ==========================================
            SECCIÓN 2: DEPARTAMENTOS (Carrusel Táctil Glassmorphism)
            ========================================== */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#5E7AC6]">
              Gestión por Departamentos
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-6 md:gap-8 pb-10 pt-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5">
            {areas.map((area, index) => (
              <AreaCard key={index} {...area} />
            ))}
          </div>
        </div>

        {/* ==========================================
            SECCIÓN 3: ACCIONES RÁPIDAS (Botones Grandes)
            ========================================== */}
        <div className="mb-10">
          <h2 className="mb-6 text-xs md:text-sm font-black uppercase tracking-widest text-[#5E7AC6] px-2">
            Accesos Directos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            <AnimatedButton text="Reportar Novedad" icon={ClipboardCheck} />
            <AnimatedButton text="Solicitar Insumos" icon={ShoppingBag} secondary={true} />
            <AnimatedButton text="Menú del Día" icon={Coffee} secondary={true} />
            <AnimatedButton text="Agenda Familiar" icon={Calendar} secondary={true} />
            <AnimatedButton text="Logística / Autos" icon={CarFront} secondary={true} />
            <AnimatedButton text="Autorizar Visita" icon={FileSignature} secondary={true} />
          </div>
        </div>

      </div>

      {/* ==========================================
          ANIMACIONES Y ESTILOS FORZADOS 
          ========================================== */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Ocultar barra de scroll en el carrusel */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Animación para el brillo interno de los botones */
        @keyframes shine {
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        
        /* Sistema de Fondo Dinámico (Mesh Gradient en CSS puro) */
        .animated-mesh-bg {
          background-color: #F0F0F2;
          background-image: 
            radial-gradient(at 0% 0%, rgba(94, 122, 198, 0.4) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(238, 107, 95, 0.3) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(190, 122, 198, 0.3) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(94, 122, 198, 0.4) 0px, transparent 50%);
          background-size: 200% 200%;
          animation: meshMove 20s ease-in-out infinite alternate;
        }

        @keyframes meshMove {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
      `}} />
    </div>
  );
};

export default DomusApp;