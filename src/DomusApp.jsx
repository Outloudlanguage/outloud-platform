import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag, Wrench, CarFront, FileSignature, AlertCircle, CheckCircle2 } from 'lucide-react';

// ==========================================
// 1. COMPONENTES (Reactividad Pura y Anti-Clipping)
// ==========================================

const AnimatedButton = ({ text, onClick, secondary = false, icon: Icon }) => {
  const chars = text.split('');
  return (
    <button 
      onClick={onClick} 
      className={`domus-btn ${secondary ? 'domus-btn-secondary' : 'domus-btn-primary'}`}
    >
      <div className="domus-btn-shine"></div>
      {Icon && <Icon className="domus-btn-icon" />}
      <div className="domus-btn-text-container">
        <div className="domus-btn-text-row domus-btn-text-visible">
          {chars.map((char, i) => (
            <span key={`vis-${i}`} style={{ transitionDelay: `${i * 0.02}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div className="domus-btn-text-row domus-btn-text-hidden">
          {chars.map((char, i) => (
            <span key={`hid-${i}`} style={{ transitionDelay: `${i * 0.02}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

const AreaCard = ({ title, subtitle, imgUrl, accentColor, stats }) => (
  <div className="domus-area-card-wrapper">
    <div className="domus-area-card-glow" style={{ background: `linear-gradient(135deg, ${accentColor}80, #ffffff80)` }}></div>
    <div className="domus-area-card">
      <div className="domus-area-img-container">
        <div className="domus-area-img" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
        <div className="domus-area-img-overlay"></div>
        <div className="domus-area-badge">
           <span className="domus-area-dot" style={{ backgroundColor: accentColor }}></span> {subtitle}
        </div>
      </div>
      <div className="domus-area-content">
        <div className="domus-area-glow-inner"></div>
        <div className="domus-area-body">
          <h3 className="domus-area-title">{title}</h3>
          <div className="domus-area-stats">
            <span className="domus-area-stats-label">{stats.label}</span>
            <span className="domus-area-stats-val">{stats.value}</span>
          </div>
        </div>
        <button className="domus-area-action">Entrar al Módulo</button>
      </div>
    </div>
  </div>
);

// ==========================================
// 2. DASHBOARD PRINCIPAL (Estructura Blindada CSS)
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
    <div className="domus-app-container">
      
      {/* FONDO DINÁMICO */}
      <div className="domus-bg">
        <div className="domus-blob domus-blob-1"></div>
        <div className="domus-blob domus-blob-2"></div>
        <div className="domus-blob domus-blob-3"></div>
        <div className="domus-bg-overlay"></div>
      </div>

      <div className="domus-content">
        
        {/* HEADER */}
        <header className="domus-header">
          <div className="domus-header-left">
            <img 
              src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/Copia%20de%20Copia%20de%20Outloud%20(1920%20x%20600%20px)%20(1920%20x%20500%20px)%20(1).png" 
              alt="Domus" 
              className="domus-logo"
            />
            <div className="domus-title-group">
              <h1 className="domus-title">Buenos días, Sra. Belkys.</h1>
              <p className="domus-subtitle">CASA ROQUEDAL · Panel de Operaciones</p>
            </div>
          </div>
          <div className="domus-header-right">
            <div className="domus-time-widget">
              <Calendar className="domus-icon-blue" />
              <span>{formatDate(time)}</span>
            </div>
            <div className="domus-time-widget">
              <Clock className="domus-icon-red" />
              <span className="domus-time-text">{formatTime(time)}</span>
            </div>
          </div>
        </header>

        {/* WIDGETS */}
        <div className="domus-widgets-grid">
          
          {/* Widget 1: Inventario */}
          <div className="domus-widget">
            <div className="domus-widget-text">
              <h3>Estado de Alacena</h3>
              <p>Métricas de Stock</p>
              <div className="domus-stock-list">
                <div className="domus-stock-item"><span><i className="domus-dot domus-dot-blue"></i> Cárnicos</span> <strong>85%</strong></div>
                <div className="domus-stock-item"><span><i className="domus-dot domus-dot-purple"></i> Lácteos</span> <strong>60%</strong></div>
                <div className="domus-stock-item"><span><i className="domus-dot domus-dot-red domus-pulse"></i> Limpieza</span> <strong style={{color: '#EE6B5F'}}>20%</strong></div>
              </div>
            </div>
            <div className="domus-donut-container">
               <div className="domus-donut"></div>
               <div className="domus-donut-hole">
                  <span className="domus-donut-val">55%</span>
                  <span className="domus-donut-label">Global</span>
               </div>
            </div>
          </div>

          {/* Widget 2: Carga Operativa */}
          <div className="domus-widget domus-widget-bars-container">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" alt="Domus" className="domus-widget-bg-logo" />
            <div className="domus-widget-top">
              <div className="domus-widget-text">
                <h3>Carga Operativa</h3>
                <p>Tareas completadas</p>
              </div>
              <div className="domus-badge-blue"><ClipboardCheck size={14} /> 68</div>
            </div>
            <div className="domus-bars-wrap">
              {[
                { d: 'L', h: '60%', c: '#5E7AC6' }, { d: 'M', h: '80%', c: '#5E7AC6' }, { d: 'M', h: '40%', c: '#5E7AC6' }, 
                { d: 'J', h: '95%', c: '#EE6B5F' }, { d: 'V', h: '70%', c: '#5E7AC6' }, { d: 'S', h: '30%', c: '#808080' }, { d: 'D', h: '20%', c: '#808080' }
              ].map((day, i) => (
                <div key={i} className="domus-bar-group">
                  <div className="domus-bar-tooltip">{day.h}</div>
                  <div className="domus-bar-track">
                    <div className="domus-bar-fill" style={{ height: day.h, backgroundColor: day.c }}></div>
                  </div>
                  <span className="domus-bar-label">{day.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Alertas */}
          <div className="domus-widget domus-widget-alerts">
            <img src="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png" alt="Domus" className="domus-alert-bg-logo" />
            <div className="domus-alert-content">
              <div className="domus-alert-top">
                <div className="domus-alert-badge"><Bell size={14} /> Alertas Activas</div>
                <div className="domus-alert-pulse-wrap"><i className="domus-dot domus-dot-red domus-pulse-lg"></i></div>
              </div>
              <div className="domus-alert-list">
                <div className="domus-alert-item">
                  <div className="domus-alert-icon-wrap domus-bg-red"><AlertCircle size={16} color="#EE6B5F" /></div>
                  <p>Mantenimiento preventivo: <br/><span>Planta Eléctrica Principal</span></p>
                </div>
                <div className="domus-alert-item">
                  <div className="domus-alert-icon-wrap domus-bg-green"><CheckCircle2 size={16} color="#6EE7B7" /></div>
                  <p>Visita autorizada garita: <br/><span>Sr. Álvaro Jiménez</span></p>
                </div>
              </div>
            </div>
            <button className="domus-alert-btn">Abrir Centro de Control</button>
          </div>
        </div>

        {/* CARRUSEL DEPARTAMENTOS */}
        <div className="domus-section">
          <h2 className="domus-section-title"><i className="domus-dot domus-dot-blue"></i> Gestión por Departamentos</h2>
          <div className="domus-carousel">
            {areas.map((area, index) => <AreaCard key={index} {...area} />)}
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="domus-section">
          <h2 className="domus-section-title"><i className="domus-dot domus-dot-red"></i> Accesos Directos</h2>
          <div className="domus-actions-grid">
            <AnimatedButton text="REPORTAR NOVEDAD" icon={ClipboardCheck} />
            <AnimatedButton text="SOLICITAR INSUMOS" icon={ShoppingBag} secondary={true} />
            <AnimatedButton text="MENÚ DEL DÍA" icon={Coffee} secondary={true} />
            <AnimatedButton text="AGENDA FAMILIAR" icon={Calendar} secondary={true} />
            <AnimatedButton text="LOGÍSTICA / AUTOS" icon={CarFront} secondary={true} />
            <AnimatedButton text="AUTORIZAR VISITA" icon={FileSignature} secondary={true} />
          </div>
        </div>

      </div>

      {/* MOTOR VISUAL (ESTRUCTURA Y DISEÑO AISLADOS) */}
      <style dangerouslySetInnerHTML={{__html: `
        /* RESET & BASE */
        .domus-app-container {
          position: relative; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif;
          color: #202020; background: #F5F7FA; overflow-x: hidden;
        }
        .domus-content {
          position: relative; z-index: 10; max-width: 1500px; margin: 0 auto; padding: 2rem 1.5rem;
        }

        /* BACKGROUND */
        .domus-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: #F2F4F8; overflow: hidden; pointer-events: none; }
        .domus-blob { position: absolute; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; filter: blur(90px); opacity: 0.7; mix-blend-mode: multiply; animation: domusMorph 15s ease-in-out infinite alternate; }
        .domus-blob-1 { top: -10%; left: -10%; width: 60vw; height: 60vw; background: radial-gradient(circle, #5E7AC6 0%, #8DA2DD 100%); }
        .domus-blob-2 { top: 10%; right: -15%; width: 55vw; height: 55vw; background: radial-gradient(circle, #EE6B5F 0%, #F5A39B 100%); animation-duration: 22s; animation-direction: alternate-reverse; }
        .domus-blob-3 { bottom: -20%; left: 15%; width: 70vw; height: 70vw; background: radial-gradient(circle, #BE7AC6 0%, #D8A9DE 100%); animation-duration: 28s; animation-delay: -3s; }
        .domus-bg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.4); backdrop-filter: blur(80px); -webkit-backdrop-filter: blur(80px); }
        @keyframes domusMorph { 0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0, 0) scale(1) rotate(0deg); } 34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: translate(6vw, -8vh) scale(1.05) rotate(5deg); } 67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: translate(-4vw, 6vh) scale(0.95) rotate(-5deg); } 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0, 0) scale(1) rotate(0deg); } }

        /* HEADER */
        .domus-header { display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; margin-bottom: 3rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 2rem; }
        @media (min-width: 1024px) { .domus-header { flex-direction: row; align-items: flex-end; } }
        .domus-header-left { display: flex; flex-direction: column; gap: 1rem; }
        .domus-logo { height: 4rem; object-fit: contain; cursor: pointer; transition: transform 0.3s; margin-left: -0.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        .domus-logo:hover { transform: scale(1.05); }
        .domus-title-group { cursor: pointer; }
        .domus-title { font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; margin: 0; line-height: 1; transition: color 0.3s; }
        .domus-subtitle { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #5E7AC6; margin: 0.5rem 0 0 0; transition: transform 0.3s; }
        @media (min-width: 768px) { .domus-title { font-size: 3.75rem; } .domus-subtitle { font-size: 0.875rem; } }
        .domus-title-group:hover .domus-title { color: #5E7AC6; }
        .domus-title-group:hover .domus-subtitle { transform: translateX(8px); }
        .domus-header-right { display: flex; gap: 1rem; }
        .domus-time-widget { display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); padding: 0.875rem 1.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 4px 20px rgba(0,0,0,0.03); cursor: pointer; transition: all 0.3s; }
        .domus-time-widget:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .domus-time-widget span { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; color: #808080; }
        .domus-time-widget .domus-time-text { font-size: 1.125rem; font-weight: 900; letter-spacing: -0.05em; color: #202020; }
        .domus-icon-blue { color: #5E7AC6; width: 1.25rem; height: 1.25rem; }
        .domus-icon-red { color: #EE6B5F; width: 1.25rem; height: 1.25rem; }

        /* WIDGETS GRID */
        .domus-widgets-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 4rem; }
        @media (min-width: 1024px) { .domus-widgets-grid { grid-template-columns: repeat(3, 1fr); gap: 2rem; } }
        
        .domus-widget { background: rgba(255,255,255,0.4); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border-radius: 40px; padding: 2rem; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 10px 40px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.5s; overflow: hidden; position: relative; }
        .domus-widget:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(94,122,198,0.15); background: rgba(255,255,255,0.5); }
        
        .domus-widget-text { width: 50%; z-index: 10; position: relative; }
        .domus-widget-text h3 { font-size: 1.5rem; font-weight: 900; line-height: 1.1; margin: 0 0 0.25rem 0; transition: color 0.3s; }
        .domus-widget:hover h3 { color: #5E7AC6; }
        .domus-widget-text p { font-size: 0.625rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #808080; margin: 0 0 1.5rem 0; transition: transform 0.3s; }
        .domus-widget:hover p { transform: translateX(4px); }
        
        .domus-stock-list { display: flex; flex-direction: column; gap: 1rem; }
        .domus-stock-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.4); padding: 0.5rem 0.75rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.5); transition: transform 0.3s; }
        .domus-widget:hover .domus-stock-item { transform: translateX(8px); }
        .domus-stock-item span { display: flex; align-items: center; gap: 0.5rem; }
        .domus-dot { display: block; width: 10px; height: 10px; border-radius: 50%; }
        .domus-dot-blue { background: #5E7AC6; }
        .domus-dot-purple { background: #BE7AC6; }
        .domus-dot-red { background: #EE6B5F; }
        .domus-pulse { box-shadow: 0 0 10px #EE6B5F; animation: pulseAnim 2s infinite; }
        .domus-pulse-lg { width: 16px; height: 16px; box-shadow: 0 0 15px #EE6B5F; animation: pulseAnim 2s infinite; }
        @keyframes pulseAnim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        
        /* DONUT CHART CSS */
        .domus-donut-container { position: relative; width: 9rem; height: 9rem; flex-shrink: 0; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1)); transition: all 0.7s; }
        .domus-widget:hover .domus-donut-container { transform: scale(1.1) rotate(12deg); }
        .domus-donut { width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(#5E7AC6 0% 60%, #BE7AC6 60% 80%, #EE6B5F 80% 90%, transparent 90% 100%); }
        .domus-donut-hole { position: absolute; top: 1rem; left: 1rem; right: 1rem; bottom: 1rem; background: rgba(245,247,250,0.9); backdrop-filter: blur(20px); border-radius: 50%; border: 1px solid white; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 2px 5px rgba(0,0,0,0.1); transition: transform 0.7s; }
        .domus-widget:hover .domus-donut-hole { transform: rotate(-12deg); }
        .domus-donut-val { font-size: 1.875rem; font-weight: 900; letter-spacing: -0.05em; color: #202020; line-height: 1; }
        .domus-donut-label { font-size: 0.625rem; font-weight: 900; color: #5E7AC6; text-transform: uppercase; letter-spacing: 0.1em; }

        /* BARS WIDGET */
        .domus-widget-bars-container { flex-direction: column; justify-content: space-between; }
        .domus-widget-bg-logo { position: absolute; left: -2.5rem; bottom: -2.5rem; width: 14rem; height: 14rem; opacity: 0.04; filter: grayscale(100%); object-fit: contain; transition: all 1s; }
        .domus-widget:hover .domus-widget-bg-logo { transform: scale(1.25) rotate(12deg); }
        .domus-widget-top { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 1.5rem; z-index: 10; position: relative; }
        .domus-badge-blue { background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border: 1px solid white; color: #5E7AC6; padding: 0.5rem 1rem; border-radius: 16px; font-size: 0.875rem; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 0.5rem; transition: all 0.5s; }
        .domus-widget:hover .domus-badge-blue { transform: scale(1.1); background: #5E7AC6; color: white; }
        .domus-bars-wrap { display: flex; align-items: flex-end; justify-content: space-between; height: 9rem; width: 100%; gap: 0.5rem; z-index: 10; position: relative; }
        .domus-bar-group { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 100%; height: 100%; justify-content: flex-end; position: relative; cursor: pointer; }
        .domus-bar-tooltip { position: absolute; top: -2.5rem; background: white; color: #5E7AC6; border: 1px solid rgba(255,255,255,0.6); font-size: 0.6875rem; font-weight: 900; padding: 0.375rem 0.625rem; border-radius: 12px; opacity: 0; transform: translateY(1rem); transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1); z-index: 20; white-space: nowrap; }
        .domus-bar-group:hover .domus-bar-tooltip { opacity: 1; transform: translateY(0); }
        .domus-bar-track { width: 100%; background: rgba(32,32,32,0.05); border-radius: 16px 16px 0 0; position: relative; overflow: hidden; display: flex; align-items: flex-end; height: 85%; transition: all 0.3s; }
        .domus-bar-group:hover .domus-bar-track { transform: translateY(-8px); background: rgba(32,32,32,0.1); }
        .domus-bar-fill { width: 100%; border-radius: 16px 16px 0 0; transition: all 1s ease-out; box-shadow: inset 0 2px 10px rgba(0,0,0,0.1); }
        .domus-bar-group:hover .domus-bar-fill { filter: brightness(1.2); }
        .domus-bar-label { font-size: 0.6875rem; font-weight: 900; color: #808080; text-transform: uppercase; transition: color 0.3s; }
        .domus-bar-group:hover .domus-bar-label { color: #5E7AC6; }

        /* ALERTS WIDGET */
        .domus-widget-alerts { background: rgba(94, 122, 198, 0.95); backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px); box-shadow: 0 20px 50px rgba(94,122,198,0.4); border: 1px solid rgba(255,255,255,0.3); color: white; flex-direction: column; justify-content: space-between; padding: 2rem; border-radius: 40px; }
        .domus-widget-alerts:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(94,122,198,0.6); }
        .domus-alert-bg-logo { position: absolute; right: -2rem; bottom: -2rem; width: 16rem; height: 16rem; object-fit: contain; opacity: 0.2; filter: brightness(2); transition: all 1s; }
        .domus-widget-alerts:hover .domus-alert-bg-logo { transform: scale(1.25) rotate(12deg); }
        .domus-alert-content { position: relative; z-index: 10; width: 100%; }
        .domus-alert-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .domus-alert-badge { display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.4); padding: 0.625rem 1.25rem; border-radius: 99px; box-shadow: inset 0 2px 5px rgba(255,255,255,0.2); transition: transform 0.5s; font-size: 0.625rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .domus-widget-alerts:hover .domus-alert-badge { transform: scale(1.05); }
        .domus-alert-pulse-wrap { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: rgba(255,255,255,0.1); backdrop-filter: blur(12px); }
        .domus-alert-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
        .domus-alert-item { display: flex; align-items: flex-start; gap: 1rem; background: rgba(0,0,0,0.1); border-radius: 1rem; padding: 1rem; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); transition: all 0.3s; cursor: pointer; }
        .domus-alert-item:hover { background: rgba(0,0,0,0.2); transform: scale(1.02); }
        .domus-alert-icon-wrap { padding: 0.5rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .domus-bg-red { background: rgba(238, 107, 95, 0.3); }
        .domus-bg-green { background: rgba(110, 231, 183, 0.3); }
        .domus-alert-item p { font-size: 0.75rem; font-weight: 700; line-height: 1.5; margin: 0.125rem 0 0 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .domus-alert-item p span { font-weight: 500; color: rgba(255,255,255,0.8); }
        .domus-alert-btn { position: relative; z-index: 10; width: 100%; padding: 1rem; background: white; color: #5E7AC6; border: 1px solid transparent; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 1rem; transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1); cursor: pointer; }
        .domus-alert-btn:hover { background: transparent; color: white; border-color: white; box-shadow: none; transform: translateY(-4px); }

        /* SECCIONES COMUNES */
        .domus-section { margin-bottom: 4rem; }
        .domus-section-title { font-size: 0.875rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #5E7AC6; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; cursor: pointer; transition: transform 0.3s; width: max-content; }
        .domus-section-title:hover { transform: translateX(8px); }
        
        /* CAROUSEL */
        .domus-carousel { display: flex; overflow-x: auto; gap: 1.5rem; padding-bottom: 3rem; padding-top: 1rem; scroll-snap-type: x mandatory; }
        .domus-carousel::-webkit-scrollbar { height: 8px; }
        .domus-carousel::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); border-radius: 20px; }
        .domus-carousel::-webkit-scrollbar-thumb { background: rgba(94, 122, 198, 0.4); border-radius: 20px; border: 2px solid transparent; background-clip: padding-box; }
        .domus-carousel::-webkit-scrollbar-thumb:hover { background-color: rgba(94, 122, 198, 0.8); }

        /* AREA CARDS (Grid Evitado por CSS Puro Flex) */
        .domus-area-card-wrapper { position: relative; min-width: 320px; width: 100%; scroll-snap-align: center; flex-shrink: 0; cursor: pointer; }
        @media (min-width: 768px) { .domus-area-card-wrapper { flex: 1 1 0; min-width: 0; } }
        
        .domus-area-card-glow { position: absolute; top: -12px; left: -12px; right: -12px; bottom: -12px; border-radius: 40px; filter: blur(20px); opacity: 0; transition: opacity 0.7s ease-out; z-index: 0; }
        .domus-area-card-wrapper:hover .domus-area-card-glow { opacity: 1; }
        
        .domus-area-card { position: relative; height: 100%; background: rgba(255,255,255,0.4); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 40px rgba(0,0,0,0.06); display: flex; flex-direction: column; z-index: 10; transition: all 0.5s cubic-bezier(0.25,1,0.5,1); }
        .domus-area-card-wrapper:hover .domus-area-card { transform: translateY(-12px); border-color: white; }
        .domus-area-card-wrapper:active .domus-area-card { transform: scale(0.95); }
        
        .domus-area-img-container { position: relative; width: 100%; height: 12rem; overflow: hidden; }
        .domus-area-img { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 1s; }
        .domus-area-card-wrapper:hover .domus-area-img { transform: scale(1.1); }
        .domus-area-img-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent, rgba(0,0,0,0.5)); transition: opacity 0.5s; }
        .domus-area-card-wrapper:hover .domus-area-img-overlay { opacity: 0.8; }
        
        .domus-area-badge { position: absolute; top: 1rem; left: 1rem; background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); padding: 0.375rem 1rem; border-radius: 99px; font-size: 0.625rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #202020; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 0.5rem; transition: transform 0.5s; }
        .domus-area-card-wrapper:hover .domus-area-badge { transform: scale(1.05); }
        
        .domus-area-content { padding: 1.5rem; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between; position: relative; background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.4)); }
        .domus-area-glow-inner { position: absolute; inset: 0; background: linear-gradient(to top, rgba(255,255,255,0.3), transparent); opacity: 0; transition: opacity 0.5s; pointer-events: none; }
        .domus-area-card-wrapper:hover .domus-area-glow-inner { opacity: 1; }
        
        .domus-area-body { position: relative; z-index: 10; }
        .domus-area-title { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.05em; color: #202020; margin: 0 0 1rem 0; transition: color 0.3s; }
        .domus-area-card-wrapper:hover .domus-area-title { color: #5E7AC6; }
        
        .domus-area-stats { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); border-radius: 16px; padding: 1rem; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.5s; }
        .domus-area-card-wrapper:hover .domus-area-stats { transform: translateY(-4px); }
        .domus-area-stats-label { font-size: 0.625rem; font-weight: 900; color: #5E7AC6; text-transform: uppercase; letter-spacing: 0.1em; }
        .domus-area-stats-val { font-size: 0.875rem; font-weight: 900; color: #202020; }
        
        .domus-area-action { position: relative; z-index: 10; width: 100%; padding: 0.875rem; border-radius: 16px; background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.8); color: #202020; font-size: 0.6875rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
        .domus-area-action:hover { background: white; box-shadow: 0 15px 30px rgba(94,122,198,0.25); color: #5E7AC6; }
        .domus-area-card-wrapper:active .domus-area-action { transform: scale(0.95); }

        /* ACCIONES RÁPIDAS GRID Pura */
        .domus-actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (min-width: 768px) { .domus-actions-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; } }
        @media (min-width: 1280px) { .domus-actions-grid { grid-template-columns: repeat(6, 1fr); gap: 1.5rem; } }

        /* BOTONES ANIMADOS CSS PURO */
        .domus-btn { position: relative; padding: 1rem 1.5rem; border-radius: 24px; font-weight: 900; letter-spacing: 0.1em; font-size: 0.625rem; transition: all 0.5s cubic-bezier(0.25,1,0.5,1); display: flex; align-items: center; justify-content: center; gap: 0.75rem; width: 100%; cursor: pointer; overflow: hidden; border: none; outline: none; }
        @media (min-width: 768px) { .domus-btn { font-size: 0.6875rem; } }
        .domus-btn:hover { transform: translateY(-6px); }
        .domus-btn:active { transform: scale(0.9); }
        
        .domus-btn-primary { background: rgba(94, 122, 198, 0.8); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.4); color: white; box-shadow: 0 10px 30px rgba(94,122,198,0.4); }
        .domus-btn-primary:hover { background: #5E7AC6; }
        
        .domus-btn-secondary { background: rgba(255,255,255,0.4); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.8); color: #202020; box-shadow: 0 8px 32px rgba(0,0,0,0.05); }
        .domus-btn-secondary:hover { color: #5E7AC6; border-color: white; background: rgba(255,255,255,0.7); box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        
        .domus-btn-shine { position: absolute; inset: 0; width: 200%; height: 200%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); transform: translateX(-150%) skewX(-20deg); transition: transform 0.7s ease-in-out; z-index: 0; pointer-events: none; border-radius: 24px; }
        .domus-btn:hover .domus-btn-shine { transform: translateX(50%) skewX(-20deg); }
        
        .domus-btn-icon { width: 1.25rem; height: 1.25rem; transition: transform 0.5s; z-index: 10; }
        .domus-btn:hover .domus-btn-icon { transform: scale(1.25) rotate(6deg); }
        
        .domus-btn-text-container { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; z-index: 10; height: 1.25rem; width: auto; }
        .domus-btn-text-row { display: flex; white-space: nowrap; }
        .domus-btn-text-row span { display: inline-block; transition: transform 0.5s cubic-bezier(0.25,1,0.5,1); }
        
        .domus-btn-text-visible { position: relative; }
        .domus-btn:hover .domus-btn-text-visible span { transform: translateY(-150%) rotate(-10deg); }
        
        .domus-btn-text-hidden { position: absolute; top: 0; left: 0; width: 100%; height: 100%; justify-content: center; }
        .domus-btn-text-hidden span { transform: translateY(150%) rotate(10deg); }
        .domus-btn:hover .domus-btn-text-hidden span { transform: translateY(0) rotate(0); }
      `}} />
    </div>
  );
};

export default DomusApp;