import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag, Wrench, CarFront, FileSignature, PieChart } from 'lucide-react';

// ==========================================
// 1. COMPONENTES REUTILIZABLES 
// ==========================================

const AnimatedButton = ({ text, fullWidth = false, onClick, secondary = false, icon: Icon }) => {
  return (
    <button 
      onClick={onClick} 
      className={`group relative flex items-center justify-center gap-2 px-4 py-3 md:px-5 md:py-3.5 rounded-2xl font-bold tracking-wide text-xs transition-all duration-300 active:scale-95 shadow-sm ${
        fullWidth ? 'w-full' : ''
      } ${
        secondary 
          ? 'bg-white border border-[#E0E0E0] text-[#202020] hover:border-[#5E7AC6] hover:text-[#5E7AC6] hover:shadow-md' 
          : 'bg-[#5E7AC6] border border-[#5E7AC6] text-white hover:bg-[#4A64A4] hover:shadow-[0_8px_20px_rgba(94,122,198,0.3)]'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
      <span>{text}</span>
    </button>
  );
};

const AreaCard = ({ title, subtitle, imgUrl, accentColor }) => (
  <div className="min-w-[280px] w-full md:min-w-0 bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] snap-center shrink-0 flex flex-col">
    <div className="relative w-full h-40 overflow-hidden bg-gray-100">
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-[#202020] shadow-sm">
        {subtitle}
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow justify-between">
      <div>
        <h3 className="text-xl font-black tracking-tight text-[#202020] mb-1">{title}</h3>
        <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: accentColor }}></div>
      </div>
      <button className="w-full py-3 rounded-xl bg-[#F0F0F2] text-[#202020] text-xs font-bold hover:bg-[#5E7AC6] hover:text-white transition-colors">
        Gestionar Área
      </button>
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
    { title: "Cocina & Despensa", subtitle: "Operaciones", accentColor: "#EE6B5F", imgUrl: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&q=80&w=800" },
    { title: "Seguridad", subtitle: "Perímetro", accentColor: "#5E7AC6", imgUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800" },
    { title: "Hospitalidad", subtitle: "Servicio", accentColor: "#808080", imgUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800" },
    { title: "Mantenimiento", subtitle: "Instalaciones", accentColor: "#EE6B5F", imgUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" },
    { title: "Cuidados", subtitle: "Salud", accentColor: "#5E7AC6", imgUrl: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <div className="relative min-h-screen font-sans text-[#202020] overflow-x-hidden selection:bg-[#5E7AC6]/20 bg-[#F0F0F2]">
      
      {/* 
        ==========================================
        FONDO DINÁMICO (BLOBS) 100% VISIBLE
        ==========================================
      */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#F0F0F2]">
        {/* Azul Primario */}
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#5E7AC6] opacity-30 mix-blend-multiply blur-[100px] animate-[blob_15s_infinite_alternate]"></div>
        {/* Coral Secundario */}
        <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#EE6B5F] opacity-25 mix-blend-multiply blur-[120px] animate-[blob_12s_infinite_alternate-reverse]"></div>
        {/* Variación Tonal (Lavanda) */}
        <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#BE7AC6] opacity-25 mix-blend-multiply blur-[120px] animate-[blob_18s_infinite_alternate]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        
        {/* ==========================================
            TOP BANNER (HEADER IMAGE)
            ========================================== */}
        <div className="w-full h-32 md:h-48 rounded-[32px] overflow-hidden shadow-lg mb-8 relative">
          <img 
            src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/Copia%20de%20Copia%20de%20Outloud%20(1920%20x%20600%20px)%20(1920%20x%20500%20px)%20(1).png" 
            alt="Domus Header" 
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* ==========================================
            CABECERA (LOGO + SALUDO)
            ========================================== */}
        <header className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" 
              alt="Domus Logo" 
              className="h-12 md:h-16 object-contain mb-4"
            />
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#202020]">
              Buenos días, Sra. Belkys.
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#808080]">
              CASA ROQUEDAL · Panel de Control
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md px-5 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-white">
              <Calendar className="h-4 w-4 text-[#5E7AC6]" />
              <span className="text-[10px] font-bold tracking-widest text-[#808080]">{formatDate(time)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md px-5 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-white">
              <Clock className="h-4 w-4 text-[#EE6B5F]" />
              <span className="text-sm font-black tracking-tighter text-[#202020]">{formatTime(time)}</span>
            </div>
          </div>
        </header>

        {/* ==========================================
            SECCIÓN 1: DASHBOARD GRÁFICO (Widgets)
            ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202020] mb-1">Inventario General</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#808080] mb-4">Estado de Alacena</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-[#5E7AC6]"></span> Óptimo (65%)</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#808080]"><span className="w-2 h-2 rounded-full bg-[#EE6B5F]"></span> Por pedir (35%)</div>
              </div>
            </div>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md">
                <path className="text-[#F0F0F2]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-[#5E7AC6]" strokeDasharray="65, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="animate-[drawRing_1.5s_ease-out_forwards]" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-[#5E7AC6]" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202020] mb-1">Tareas Completadas</h3>
                <p className="text-[10px] uppercase tracking-widest text-[#808080]">Esta semana</p>
              </div>
              <div className="bg-[#EE6B5F]/10 text-[#EE6B5F] px-2 py-1 rounded-lg text-xs font-bold">+12%</div>
            </div>
            <div className="flex items-end justify-between h-16 gap-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day, i) => {
                const heights = ['40%', '70%', '50%', '90%', '60%'];
                return (
                  <div key={day} className="flex flex-col items-center gap-2 w-full group">
                    <div className="w-full bg-[#F0F0F2] rounded-t-md h-full relative overflow-hidden flex items-end">
                      <div className="w-full bg-[#5E7AC6] transition-all duration-700 rounded-t-md group-hover:bg-[#EE6B5F]" style={{ height: heights[i] }}></div>
                    </div>
                    <span className="text-[9px] font-bold text-[#808080]">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#5E7AC6] rounded-[32px] p-6 shadow-[0_15px_30px_rgba(94,122,198,0.2)] text-white flex flex-col justify-between bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Bell className="w-5 h-5 text-white" /></div>
                <span className="w-3 h-3 rounded-full bg-[#EE6B5F] animate-pulse"></span>
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-1">3 Alertas</h3>
              <p className="text-xs font-medium text-white/80">Requieren tu atención hoy</p>
            </div>
            <button className="w-full py-2.5 bg-white text-[#5E7AC6] text-xs font-bold rounded-xl hover:scale-[1.02] transition-transform">Ver Detalles</button>
          </div>
        </div>

        {/* ==========================================
            SECCIÓN 2: DEPARTAMENTOS (Carrusel)
            ========================================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#808080]">
              Gestión por Departamentos
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5">
            {areas.map((area, index) => (
              <AreaCard key={index} {...area} />
            ))}
          </div>
        </div>

        {/* ==========================================
            SECCIÓN 3: ACCIONES RÁPIDAS
            ========================================== */}
        <div>
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#808080] px-1">
            Accesos Directos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            <AnimatedButton text="Reportar Novedad" icon={ClipboardCheck} />
            <AnimatedButton text="Solicitar Insumos" icon={ShoppingBag} secondary={true} />
            <AnimatedButton text="Menú del Día" icon={Coffee} secondary={true} />
            <AnimatedButton text="Agenda Familiar" icon={Calendar} secondary={true} />
            <AnimatedButton text="Chóferes / Autos" icon={CarFront} secondary={true} />
            <AnimatedButton text="Autorizar Visita" icon={FileSignature} secondary={true} />
          </div>
        </div>

      </div>

      {/* ==========================================
          ANIMACIONES CSS
          ========================================== */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes drawRing { 
          from { stroke-dashoffset: 200; } 
        }
        
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