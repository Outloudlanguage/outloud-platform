import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ChefHat, Users, Box, Wrench, ChevronRight } from 'lucide-react';

// --- Componente: Botón Animado con Texto en Cascada ---
const AnimatedButton = ({ text, onClick, icon: Icon, colorClass = "text-white hover:text-blue-200" }) => {
  const characters = text.split('');

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-full border border-white/10 bg-black/40 px-8 py-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] ${colorClass}`}
    >
      <div className="relative flex items-center justify-center overflow-hidden">
        {Icon && <Icon className="mr-3 h-5 w-5 transition-transform duration-500 group-hover:scale-110" />}
        
        {/* Fila visible original */}
        <div className="flex font-black tracking-tighter">
          {characters.map((char, index) => (
            <span
              key={`visible-${index}`}
              className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-[150%] group-hover:-rotate-[8deg]"
              style={{ transitionDelay: `${index * 0.02}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Fila oculta inferior */}
        <div className="absolute left-0 top-0 flex flex-1 items-center justify-center font-black tracking-tighter">
            {Icon && <div className="mr-3 h-5 w-5 opacity-0"></div>} {/* Espaciador invisible para alinear */}
          {characters.map((char, index) => (
            <span
              key={`hidden-${index}`}
              className="inline-block translate-y-[150%] rotate-[8deg] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-0 group-hover:rotate-0"
              style={{ transitionDelay: `${index * 0.02}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

// --- Componente: Tarjeta de Acción Rápida (Hero Card) ---
const ActionCard = ({ title, subtitle, bgImage, icon: Icon, delay }) => {
  return (
    <div 
        className="group relative h-64 w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10"
        style={{ animationDelay: delay }}
    >
      {/* Fondo de Imagen con Filtro y Zoom en Hover */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundColor: '#1a1a1a', // Fallback
        }}
      />
      {/* Overlay oscuro para Glassmorphism */}
      <div className="absolute inset-0 bg-black/60 transition-colors duration-500 group-hover:bg-black/40" />

      {/* Contenido (Glassmorphism) */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:bg-blue-900/40">
            <Icon className="h-6 w-6 text-gray-300 transition-colors duration-500 group-hover:text-blue-300" />
            </div>
            <div className="rounded-full border border-white/10 bg-black/30 p-2 backdrop-blur-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <ChevronRight className="h-5 w-5 text-white" />
            </div>
        </div>

        <div className="transform transition-all duration-500 group-hover:-translate-y-2">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors duration-500 group-hover:text-blue-200">
            {subtitle}
          </p>
          <h3 className="text-2xl font-black tracking-tighter text-white transition-all duration-500 group-hover:tracking-wide group-hover:text-blue-50 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal: Dashboard Domus ---
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

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Fondo Ambient Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-amber-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-2xl md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 sm:text-5xl">
              Buenos días, Sra. Belkys.
            </h1>
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-gray-400">
              Operaciones · Residencia Principal
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold tracking-widest text-gray-300">{formatDate(time)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-black tracking-tighter text-white">{formatTime(time)}</span>
                </div>
            </div>
            {/* Ejemplo del botón animado */}
            <AnimatedButton text="NUEVA TAREA" colorClass="text-blue-300" />
          </div>
        </header>

        {/* Grid de Acciones Rápidas */}
        <div className="mb-8">
            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">Paneles de Control</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <ActionCard
                title="Producción"
                subtitle="Cocina & Despensa"
                bgImage="https://images.unsplash.com/photo-1556910103-1c02745a872e?auto=format&fit=crop&q=80&w=800"
                icon={ChefHat}
                delay="0ms"
            />
            
            <ActionCard
                title="Suministros"
                subtitle="Inventario General"
                bgImage="https://images.unsplash.com/photo-1585252875152-4dc56788db3d?auto=format&fit=crop&q=80&w=800"
                icon={Box}
                delay="100ms"
            />
            
            <ActionCard
                title="Supervisión"
                subtitle="Staff & Turnos"
                bgImage="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800"
                icon={Users}
                delay="200ms"
            />
            
            <ActionCard
                title="Instalaciones"
                subtitle="Mantenimiento"
                bgImage="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
                icon={Wrench}
                delay="300ms"
            />
            
            </div>
        </div>

        {/* Sección inferior de ejemplo */}
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl">
             <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-500">Acceso Rápido</h2>
             <div className="flex flex-wrap gap-4">
                <AnimatedButton text="REPORTAR NOVEDAD" />
                <AnimatedButton text="VER PREFERENCIAS" />
                <AnimatedButton text="MENÚ DEL DÍA" />
             </div>
        </div>

      </div>
    </div>
  );
};

export default DomusApp;