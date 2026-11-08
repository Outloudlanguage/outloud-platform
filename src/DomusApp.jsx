import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag, Wrench, CarFront, FileSignature, AlertCircle, CheckCircle2 } from 'lucide-react';

// ==========================================
// 1. COMPONENTES REUTILIZABLES (Ultra-Reactivos)
// ==========================================

const AnimatedButton = ({ text, fullWidth = false, onClick, secondary = false, icon: Icon }) => {
  const chars = text.split('');
  return (
    <button 
      onClick={onClick} 
      className={`group/btn relative px-6 py-4 rounded-[24px] font-black tracking-widest text-[10px] md:text-[11px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1.5 active:scale-90 flex items-center justify-center gap-3 w-full ${
        secondary 
          ? 'domus-glass text-[#202020] hover:text-[#5E7AC6] hover:border-white' 
          : 'bg-[#5E7AC6]/80 backdrop-blur-2xl border border-white/40 text-white hover:bg-[#5E7AC6]'
      }`}
      style={{
        boxShadow: secondary ? '0 8px 32px rgba(0,0,0,0.05)' : '0 10px 30px rgba(94,122,198,0.4)'
      }}
    >
      {/* Brillo interno de barrido */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] -skew-x-[20deg] transition-all duration-700 ease-in-out group-hover/btn:translate-x-[150%] z-0 rounded-[24px]"></div>
      
      {Icon && <Icon className="w-5 h-5 transition-transform duration-500 group-hover/btn:scale-125 group-hover/btn:rotate-6 z-10" />}
      
      {/* Contenedor anti-clipping con nowrap */}
      <div className="relative overflow-hidden flex items-center justify-center z-10 h-5 w-auto">
        <div className="flex whitespace-nowrap">
          {chars.map((char, i) => (
            <span 
              key={`vis-${i}`} 
              className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/btn:-translate-y-[150%] group-hover/btn:rotate-[-10deg]" 
              style={{ transitionDelay: `${i * 0.02}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center whitespace-nowrap">
          <div className="flex">
            {chars.map((char, i) => (
              <span 
                key={`hid-${i}`} 
                className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] translate-y-[150%] rotate-[10deg] group-hover/btn:translate-y-0 group-hover/btn:rotate-0" 
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
  <div className="relative group/card min-w-[300px] md:min-w-[320px] w-full snap-center shrink-0 cursor-pointer transition-all duration-500 hover:-translate-y-3 active:scale-95">
    
    {/* RETROILUMINACIÓN (Glow Externo): Separado del overflow-hidden para que no se ampute */}
    <div 
      className="absolute -inset-3 rounded-[40px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 ease-out z-0 domus-blur-glow"
      style={{ background: `linear-gradient(135deg, ${accentColor}80, #ffffff80)` }}
    ></div>
    
    {/* TARJETA DE CRISTAL (Glassmorphism Puro) */}
    <div className="relative h-full domus-glass rounded-[32px] overflow-hidden border border-white/60 z-10 flex flex-col">
      
      {/* Imagen Superior */}
      <div className="relative w-full h-48 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/card:scale-110" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 transition-opacity duration-500 group-hover/card:opacity-80"></div>
        <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-xl px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase text-[#202020] shadow-sm flex items-center gap-2 transition-transform duration-500 group-hover/card:scale-105">
           <span className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: accentColor }}></span> {subtitle}
        </div>
      </div>
      
      {/* Contenido Inferior */}
      <div className="p-6 flex flex-col flex-grow justify-between relative">
        {/* Glow interno muy sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-black tracking-tight text-[#202020] mb-4 transition-colors duration-300 group-hover/card:text-[#5E7AC6]">
            {title}
          </h3>
          
          <div className="flex justify-between items-center bg-white/40 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-transform duration-500 group-hover/card:-translate-y-1">
            <span className="text-[10px] font-extrabold text-[#5E7AC6] uppercase tracking-widest">{stats.label}</span>
            <span className="text-sm font-black text-[#202020]">{stats.value}</span>
          </div>
        </div>
        
        <button className="relative z-10 w-full py-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/80 text-[#202020] text-[11px] font-black tracking-widest uppercase hover:bg-white hover:shadow-[0_15px_30px_rgba(94,122,198,0.25)] hover:text-[#5E7AC6] transition-all duration-300 active:scale-95">
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
    <div className="relative min-h-screen font-sans text-[#202020] overflow-x-hidden selection:bg-[#5E7AC6]/20 bg-[#F5F7FA]">
      
      {/* 
        ==========================================
        FONDO DINÁMICO (MESH GRADIENT INYECTADO)
        ==========================================
      */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F2F4F8]">
        <div className="domus-blob domus-blob-1"></div>
        <div className="domus-blob domus-blob-2"></div>
        <div className="domus-blob domus-blob-3"></div>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[80px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        
        {/* ==========================================
            CABECERA (REACTIVA)
            ========================================== */}
        <header className="mb-14 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-[#202020]/10 pb-8">
          <div className="flex flex-col items-start gap-4">
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/Copia%20de%20Copia%20de%20Outloud%20(1920%20x%20600%20px)%20(1920%20x%20500%20px)%20(1).png" 
              alt="Domus" 
              className="h-16 md:h-20 object-contain drop-shadow-md -ml-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
            />
            <div className="group cursor-pointer">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#202020] leading-none group-hover:text-[#5E7AC6] transition-colors duration-300">
                Buenos días, Sra. Belkys.
              </h1>
              <p className="mt-3 text-xs md:text-sm font-black uppercase tracking-widest text-[#5E7AC6] group-hover:translate-x-2 transition-transform duration-300">
                CASA ROQUEDAL · Panel de Operaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start xl:self-auto">
            <div className="flex items-center gap-3 rounded-[24px] domus-glass px-6 py-4 border border-white/80 shadow-sm cursor-pointer hover:-translate-y-2 hover:shadow-lg active:scale-95 transition-all duration-300">
              <Calendar className="h-5 w-5 text-[#5E7AC6]" />
              <span className="text-xs font-bold tracking-widest text-[#808080]">{formatDate(time)}</span>
            </div>
            <div className="flex items-center gap-3 rounded-[24px] domus-glass px-6 py-4 border border-white/80 shadow-sm cursor-pointer hover:-translate-y-2 hover:shadow-lg active:scale-95 transition-all duration-300">
              <Clock className="h-5 w-5 text-[#EE6B5F]" />
              <span className="text-lg font-black tracking-tighter text-[#202020]">{formatTime(time)}</span>
            </div>
          </div>
        </header>

        {/* ==========================================
            DASHBOARD (Widgets Ultra-Reactivos)
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          
          {/* Widget 1: Inventario */}
          <div className="group domus-glass rounded-[40px] p-8 border border-white/80 flex items-center justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(94,122,198,0.15)] active:scale-[0.98] transition-all duration-500">
            <div className="w-1/2">
              <h3 className="text-2xl font-black text-[#202020] mb-1 leading-tight group-hover:text-[#5E7AC6] transition-colors">Estado de Alacena</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#808080] mb-6 group-hover:translate-x-1 transition-transform">Métricas de Stock</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#202020] bg-white/40 px-3 py-2 rounded-xl border border-white/50 transition-transform group-hover:translate-x-2">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#5E7AC6] shadow-sm"></span> Cárnicos</span> <span>85%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#202020] bg-white/40 px-3 py-2 rounded-xl border border-white/50 transition-transform group-hover:translate-x-2 delay-75">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#BE7AC6] shadow-sm"></span> Lácteos</span> <span>60%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#EE6B5F] bg-white/40 px-3 py-2 rounded-xl border border-white/50 transition-transform group-hover:translate-x-2 delay-100">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#EE6B5F] animate-pulse shadow-[0_0_10px_#EE6B5F]"></span> Limpieza</span> <span>20%</span>
                </div>
              </div>
            </div>
            
            <div className="relative w-36 h-36 md:w-44 md:h-44 drop-shadow-2xl flex-shrink-0 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
               <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(#5E7AC6 0% 60%, #BE7AC6 60% 80%, #EE6B5F 80% 90%, transparent 90% 100%)` }}></div>
               <div className="absolute inset-4 bg-[#F5F7FA]/90 backdrop-blur-xl rounded-full border border-white flex flex-col items-center justify-center shadow-inner group-hover:rotate-[-12deg] transition-transform duration-700">
                  <span className="text-3xl font-black text-[#202020] tracking-tighter">55%</span>
                  <span className="text-[10px] font-black text-[#5E7AC6] uppercase tracking-widest">Global</span>
               </div>
            </div>
          </div>

          {/* Widget 2: Carga Operativa */}
          <div className="group domus-glass rounded-[40px] p-8 border border-white/80 flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(94,122,198,0.15)] active:scale-[0.98] transition-all duration-500 relative overflow-hidden">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" alt="Domus" className="absolute -left-10 -bottom-10 w-56 h-56 opacity-[0.04] grayscale object-contain transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-12" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-[#202020] mb-1 leading-tight group-hover:text-[#5E7AC6] transition-colors">Carga Operativa</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#808080] group-hover:translate-x-1 transition-transform">Tareas completadas</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white text-[#5E7AC6] px-4 py-2 rounded-2xl text-sm font-black shadow-md flex items-center gap-2 transition-transform duration-500 group-hover:scale-110 group-hover:bg-[#5E7AC6] group-hover:text-white">
                 <ClipboardCheck className="w-4 h-4" /> 68
              </div>
            </div>
            
            <div className="flex items-end justify-between h-36 gap-2 md:gap-3 relative z-10">
              {[
                { d: 'L', h: '60%', c: '#5E7AC6' }, { d: 'M', h: '80%', c: '#5E7AC6' }, { d: 'M', h: '40%', c: '#5E7AC6' }, 
                { d: 'J', h: '95%', c: '#EE6B5F' }, { d: 'V', h: '70%', c: '#5E7AC6' }, { d: 'S', h: '30%', c: '#808080' }, { d: 'D', h: '20%', c: '#808080' }
              ].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group/bar relative">
                  <div className="absolute -top-10 bg-white text-[#5E7AC6] border border-white/60 text-[11px] font-black py-1.5 px-2.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-4 group-hover/bar:translate-y-0 shadow-xl z-20 whitespace-nowrap">
                    {day.h}
                  </div>
                  <div className="w-full bg-[#202020]/5 rounded-t-2xl relative overflow-hidden flex items-end h-[85%] transition-transform duration-300 group-hover/bar:-translate-y-2 group-hover/bar:bg-[#202020]/10">
                    <div className="w-full rounded-t-2xl transition-all duration-1000 ease-out shadow-inner group-hover/bar:brightness-125" style={{ height: day.h, backgroundColor: day.c }}></div>
                  </div>
                  <span className="text-[11px] font-black text-[#808080] uppercase group-hover/bar:text-[#5E7AC6] transition-colors">{day.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Novedades */}
          <div className="relative bg-[#5E7AC6]/95 backdrop-blur-[50px] rounded-[40px] p-8 shadow-[0_20px_50px_rgba(94,122,198,0.4)] border border-white/30 text-white flex flex-col justify-between overflow-hidden group cursor-pointer hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(94,122,198,0.6)] active:scale-[0.98] transition-all duration-500">
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" 
              alt="Domus" 
              className="absolute -right-8 -bottom-8 w-64 h-64 object-contain opacity-20 brightness-200 transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-12"
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-2xl border border-white/40 px-5 py-2.5 rounded-full shadow-inner transition-transform duration-500 group-hover:scale-105">
                  <Bell className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-white drop-shadow-sm">Alertas Activas</span>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md">
                   <span className="w-4 h-4 rounded-full bg-[#EE6B5F] animate-pulse shadow-[0_0_20px_#EE6B5F]"></span>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md hover:bg-black/20 hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-[#EE6B5F]/30 p-2 rounded-xl"><AlertCircle className="w-5 h-5 text-[#EE6B5F]" /></div>
                  <p className="text-xs font-bold leading-relaxed text-white drop-shadow-sm mt-0.5">Mantenimiento preventivo: <br/><span className="font-medium text-white/80">Planta Eléctrica Principal</span></p>
                </div>
                <div className="flex items-start gap-4 bg-black/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md hover:bg-black/20 hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-emerald-400/30 p-2 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-300" /></div>
                  <p className="text-xs font-bold leading-relaxed text-white drop-shadow-sm mt-0.5">Visita autorizada garita: <br/><span className="font-medium text-white/80">Sr. Álvaro Jiménez</span></p>
                </div>
              </div>
            </div>
            
            <button className="relative z-10 w-full py-4 bg-white hover:bg-transparent text-[#5E7AC6] hover:text-white border border-transparent hover:border-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all duration-300 shadow-xl hover:shadow-none">
              Abrir Centro de Control
            </button>
          </div>
        </div>

        {/* ==========================================
            CARRUSEL DE DEPARTAMENTOS
            ========================================== */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8 px-2 cursor-pointer group w-max">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#5E7AC6] flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5E7AC6] shadow-[0_0_10px_rgba(94,122,198,0.5)]"></span> Gestión por Departamentos
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-6 md:gap-8 pb-12 pt-4 snap-x snap-mandatory domus-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {areas.map((area, index) => (
              <AreaCard key={index} {...area} />
            ))}
          </div>
        </div>

        {/* ==========================================
            ACCIONES RÁPIDAS (Botones con espacio real para respirar)
            ========================================== */}
        <div className="mb-10">
          <h2 className="mb-8 text-sm font-black uppercase tracking-widest text-[#5E7AC6] px-2 flex items-center gap-3 w-max cursor-pointer group transition-transform duration-300 hover:translate-x-2">
             <span className="w-2.5 h-2.5 rounded-full bg-[#EE6B5F] shadow-[0_0_10px_rgba(238,107,95,0.5)]"></span> Accesos Directos
          </h2>
          
          {/* Grilla ajustada: 2 columnas en móvil, 3 en pantallas medianas, auto-fit en pantallas grandes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
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
          MOTOR VISUAL (CSS PURO Y BLINDADO)
          ========================================== */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Glassmorphism Supremo (Evita que Tailwind lo purgue) */
        .domus-glass {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }
        
        .domus-blur-glow {
          filter: blur(25px);
        }

        /* Scrollbar elegante y visible */
        .domus-scrollbar::-webkit-scrollbar { height: 8px; }
        .domus-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 20px; }
        .domus-scrollbar::-webkit-scrollbar-thumb { background: rgba(94, 122, 198, 0.4); border-radius: 20px; border: 2px solid transparent; background-clip: padding-box; }
        .domus-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(94, 122, 198, 0.8); }
        
        /* Blobs Orgánicos Avanzados */
        .domus-blob {
          position: absolute;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          filter: blur(90px);
          opacity: 0.7;
          mix-blend-mode: multiply;
          animation: domusMorph 15s ease-in-out infinite alternate;
        }
        .domus-blob-1 {
          top: -10%; left: -10%;
          width: 60vw; height: 60vw;
          background: radial-gradient(circle at center, #5E7AC6 0%, #8DA2DD 100%);
          animation-delay: 0s;
        }
        .domus-blob-2 {
          top: 10%; right: -15%;
          width: 55vw; height: 55vw;
          background: radial-gradient(circle at center, #EE6B5F 0%, #F5A39B 100%);
          animation-duration: 22s;
          animation-direction: alternate-reverse;
        }
        .domus-blob-3 {
          bottom: -20%; left: 15%;
          width: 70vw; height: 70vw;
          background: radial-gradient(circle at center, #BE7AC6 0%, #D8A9DE 100%);
          animation-duration: 28s;
          animation-delay: -3s;
        }
        
        @keyframes domusMorph {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0, 0) scale(1) rotate(0deg); }
          34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: translate(6vw, -8vh) scale(1.05) rotate(5deg); }
          67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: translate(-4vw, 6vh) scale(0.95) rotate(-5deg); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0, 0) scale(1) rotate(0deg); }
        }
      `}} />
    </div>
  );
};

export default DomusApp;