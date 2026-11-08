import React, { useState, useEffect } from 'react';
import {
  Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag,
  Wrench, CarFront, FileSignature, AlertCircle, CheckCircle2,
  HeartPulse, ShieldCheck, Sparkles, ArrowUpRight, Check, X,
  Activity, Thermometer, Droplets, Users, LayoutGrid, Layers
} from 'lucide-react';

// ==========================================
// ASSETS OFICIALES DOMUS
// ==========================================
const HEADER_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/Copia%20de%20Copia%20de%20Outloud%20(1920%20x%20600%20px)%20(1920%20x%20500%20px)%20(1).png";
const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

// ==========================================
// 1. BOTÓN CON CASCADA DE LETRAS (SIN RECORTES)
// ==========================================
const CascadeButton = ({ text, subtext, icon: Icon, accent = "#5E7AC6", onClick }) => {
  const chars = text.split('');
  return (
    <button
      onClick={onClick}
      className="domus-cascade-btn"
      style={{ '--btn-accent': accent }}
    >
      <div className="domus-cascade-icon-box">
        {Icon && <Icon size={20} />}
      </div>
      <div className="domus-cascade-content">
        <div className="domus-cascade-wave">
          <div className="domus-wave-row domus-wave-vis">
            {chars.map((char, i) => (
              <span key={`v-${i}`} style={{ transitionDelay: `${i * 0.012}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
          <div className="domus-wave-row domus-wave-hid">
            {chars.map((char, i) => (
              <span key={`h-${i}`} style={{ transitionDelay: `${i * 0.012}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </div>
        {subtext && <span className="domus-cascade-sub">{subtext}</span>}
      </div>
      <ArrowUpRight size={18} className="domus-cascade-arrow" />
    </button>
  );
};

// ==========================================
// 2. TARJETA DE DEPARTAMENTO (ESTILO CATA + BACKLIGHT)
// ==========================================
const DepartmentCard = ({ area, onSelect }) => {
  return (
    <div
      className="domus-dept-wrapper"
      style={{ '--dept-accent': area.accentColor }}
      onClick={() => onSelect(area)}
    >
      <div className="domus-dept-backlight"></div>

      <div className="domus-dept-card">
        <div
          className="domus-dept-bg"
          style={{ backgroundImage: `url('${area.imgUrl}')` }}
        ></div>
        <div className="domus-dept-gradient"></div>
        <div className="domus-dept-frost"></div>

        <div className="domus-dept-top">
          <span className="domus-dept-tag">
            <i style={{ backgroundColor: area.accentColor }}></i>
            {area.subtitle}
          </span>
          <span className="domus-dept-abbr">{area.abbr}</span>
        </div>

        <div className="domus-dept-bottom">
          <h3 className="domus-dept-title">{area.title}</h3>
          <p className="domus-dept-desc">{area.description}</p>

          <div className="domus-dept-stat-pill">
            <span>{area.stats.label}</span>
            <strong>{area.stats.value}</strong>
          </div>

          <div className="domus-dept-cta">
            <span>ABRIR MÓDULO</span>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. APLICACIÓN PRINCIPAL DOMUS
// ==========================================
export default function DomusApp() {
  const [time, setTime] = useState(new Date());
  const [splashDone, setSplashDone] = useState(false);
  const [activeNav, setActiveNav] = useState('PANEL GENERAL');
  const [hoveredStock, setHoveredStock] = useState(null);
  const [selectedModal, setSelectedModal] = useState(null);
  const [completedMeds, setCompletedMeds] = useState([true, false, false]);
  const [resolvedAlerts, setResolvedAlerts] = useState([false, false, false]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const splashTimer = setTimeout(() => setSplashDone(true), 850);
    return () => {
      clearInterval(timer);
      clearTimeout(splashTimer);
    };
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options).toUpperCase();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const navItems = [
    { id: 'PANEL GENERAL', mobileLabel: 'Panel', target: 'sec-hero', icon: LayoutGrid },
    { id: 'DEPARTAMENTOS', mobileLabel: 'Áreas', target: 'sec-depts', icon: Layers },
    { id: 'SALUD & CUIDADOS', mobileLabel: 'Salud', target: 'sec-salud', icon: HeartPulse },
    { id: 'ALACENA', mobileLabel: 'Alacena', target: 'sec-alacena', icon: ShoppingBag },
    { id: 'BITÁCORA', mobileLabel: 'Bitácora', target: 'sec-bitacora', icon: ClipboardCheck }
  ];

  const handleNavClick = (item) => {
    setActiveNav(item.id);
    const el = document.getElementById(item.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const departments = [
    {
      id: 'cocina',
      abbr: 'CD',
      title: "Cocina & Despensa",
      subtitle: "Gastronomía",
      accentColor: "#EE6B5F",
      imgUrl: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&q=80&w=900",
      stats: { label: "Menú de Hoy", value: "Listo · 3 Tiempos" },
      description: "Control de alacena, pesaje en balanza, recetario estandarizado y registro de mermas.",
      details: [
        "Almuerzo Dr. Jiménez: Crema de auyama asada, Mero al vapor con finas hierbas.",
        "Merma auditada hoy: 0.45 kg (cáscaras y recortes vegetales).",
        "Próxima recepción: Frutas y hortalizas frescas (Mañana 8:30 AM)."
      ]
    },
    {
      id: 'seguridad',
      abbr: 'SG',
      title: "Seguridad",
      subtitle: "Enlace Garita",
      accentColor: "#5E7AC6",
      imgUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=900",
      stats: { label: "Garita & Accesos", value: "4 Custodios Activos" },
      description: "Aviso de llegada de proveedores, paquetería y enlace rápido con garita sin alterar su bitácora.",
      details: [
        "Guardia en turno: 4 efectivos activos en perímetro y garita principal.",
        "Visita autorizada hoy: Sr. Álvaro Jiménez (Ingreso directo).",
        "Encomienda recibida: Farmatodo (Entregado a Enfermería 09:15 AM)."
      ]
    },
    {
      id: 'hospitalidad',
      abbr: 'HP',
      title: "Hospitalidad",
      subtitle: "Suites & Lencería",
      accentColor: "#BE7AC6",
      imgUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900",
      stats: { label: "Habitaciones", value: "5 / 5 Impecables" },
      description: "Protocolo de habitaciones principales, visitas familiares, tintorería y lencería fina.",
      details: [
        "Suite Principal: Climatización a 22°C, cambio de lencería egipcia completado.",
        "Habitaciones de Huéspedes: 2 suites listas para posible visita el fin de semana.",
        "Tintorería: 6 prendas del Dr. Jiménez listas en vestier."
      ]
    },
    {
      id: 'mantenimiento',
      abbr: 'MT',
      title: "Mantenimiento",
      subtitle: "Instalaciones",
      accentColor: "#EE6B5F",
      imgUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=900",
      stats: { label: "Equipos Críticos", value: "Planta 98% Diésel" },
      description: "Bombas hidroneumáticas, planta eléctrica, climatización y cronograma de técnicos.",
      details: [
        "Planta Eléctrica: Nivel de gasoil al 98% · Prueba automática superada.",
        "Sistema Hidroneumático: Presión estable a 65 PSI · Filtros limpios.",
        "Pendiente: Revisión trimestral de Chiller central (Jueves 10:00 AM)."
      ]
    },
    {
      id: 'cuidados',
      abbr: 'CM',
      title: "Cuidados Médicos",
      subtitle: "Salud & Enfermería",
      accentColor: "#5E7AC6",
      imgUrl: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=900",
      stats: { label: "Tensión Arterial", value: "120/78 mmHg" },
      description: "Signos vitales del Dr. Gustavo Jiménez, bitácora de enfermería y stock de medicamentos.",
      details: [
        "08:00 AM - Tensión Arterial: 120/78 mmHg | Pulso: 68 BPM | SpO2: 98%.",
        "Tratamiento matutino administrado puntualmente por Lic. Carmen.",
        "Stock de medicación crónica cubierto para los próximos 45 días."
      ]
    }
  ];

  const stockSegments = [
    { label: "Proteínas y Cárnicos", val: 88, share: 30, color: "#5E7AC6", status: "Óptimo" },
    { label: "Lácteos y Refrigerados", val: 72, share: 25, color: "#BE7AC6", status: "Estable" },
    { label: "Despensa Seca y Aceites", val: 90, share: 25, color: "#34D399", status: "Completo" },
    { label: "Insumos de Limpieza", val: 22, share: 20, color: "#EE6B5F", status: "Por Pedir" }
  ];

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;
  const donutRings = stockSegments.map((seg, idx) => {
    const dash = (seg.share / 100) * circumference;
    const ring = {
      ...seg,
      idx,
      dashArray: `${dash - 3} ${circumference}`,
      dashOffset: -accumulatedOffset
    };
    accumulatedOffset += dash;
    return ring;
  });

  const medicalReadings = [
    { time: "06:00", sys: 118, dia: 76, bpm: 65 },
    { time: "09:00", sys: 122, dia: 79, bpm: 70 },
    { time: "12:00", sys: 120, dia: 78, bpm: 68 },
    { time: "15:00", sys: 124, dia: 80, bpm: 72 },
    { time: "18:00", sys: 119, dia: 77, bpm: 67 },
    { time: "21:00", sys: 120, dia: 78, bpm: 68 }
  ];

  const medications = [
    { time: "08:00 AM", name: "Protector Gástrico + Vitamina D3", nurse: "Lic. Carmen" },
    { time: "12:30 PM", name: "Omega 3 Ultra + Enzimas Digestivas", nurse: "Turno Tarde" },
    { time: "08:00 PM", name: "Control de Tensión Nocturno", nurse: "Turno Noche" }
  ];

  return (
    <div className="domus-root">
      {/* ==========================================
          SPLASH SCREEN INICIAL CON LOGO STANDALONE
          ========================================== */}
      <div className={`domus-splash ${splashDone ? 'domus-splash-hide' : ''}`}>
        <div className="domus-splash-box">
          <img src={STANDALONE_LOGO_URL} alt="Domus" className="domus-splash-logo" />
          <span>CASA ROQUEDAL</span>
        </div>
      </div>

      {/* ==========================================
          FONDO PASTEL DINÁMICO EN MOVIMIENTO VISIBLE
          ========================================== */}
      <div className="domus-bg-canvas">
        <div className="domus-orb domus-orb-blue"></div>
        <div className="domus-orb domus-orb-coral"></div>
        <div className="domus-orb domus-orb-lavender"></div>
        <div className="domus-orb domus-orb-sky"></div>
      </div>

      {/* ==========================================
          BARRA DE NAVEGACIÓN SUPERIOR (LOGO COMPLETO Y AJUSTE MÓVIL)
          ========================================== */}
      <nav className="domus-navbar">
        <div className="domus-navbar-inner">
          {/* Logo completo sin recortes alineado a la izquierda */}
          <div className="domus-brand-left" onClick={() => handleNavClick(navItems[0])}>
            <img
              src={HEADER_LOGO_URL}
              alt="Domus Gestión Doméstica"
              className="domus-header-logo-img"
            />
          </div>

          {/* Pestañas en Escritorio */}
          <div className="domus-nav-tabs">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`domus-nav-tab ${activeNav === item.id ? 'active' : ''}`}
              >
                {item.id}
              </button>
            ))}
          </div>

          {/* Reloj y Perfil (Compactos en móvil para que nunca desborden) */}
          <div className="domus-nav-right">
            <div className="domus-clock-pill">
              <Clock size={14} color="#EE6B5F" />
              <span>{formatTime(time)}</span>
            </div>
            <div className="domus-profile-pill" onClick={() => setSelectedModal(departments[2])}>
              <img src={STANDALONE_LOGO_URL} alt="Domus" />
              <div className="domus-profile-text">
                <strong>Sra. Belkys</strong>
                <small>Ama de Llaves</small>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ==========================================
          BARRA INFERIOR ANCLADA EN MÓVIL (BOTTOM NAV BAR)
          ========================================== */}
      <nav className="domus-mobile-bottom-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`domus-mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="domus-mobile-nav-icon">
                <IconComponent size={18} />
              </div>
              <span>{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* ==========================================
          CONTENIDO PRINCIPAL
          ========================================== */}
      <main className="domus-main">

        {/* CABECERA DE BIENVENIDA + RESUMEN EJECUTIVO */}
        <section id="sec-hero" className="domus-hero-bar">
          <div className="domus-hero-greeting">
            <div className="domus-eyebrow">
              <Sparkles size={14} color="#EE6B5F" />
              <span>CASA ROQUEDAL · SISTEMA INTEGRAL DE GESTIÓN</span>
            </div>
            <h1 className="domus-main-title">Buenos días, Sra. Belkys.</h1>
          </div>

          <div className="domus-hero-pills">
            <div className="domus-stat-chip" onClick={() => setSelectedModal(departments[4])}>
              <HeartPulse size={18} color="#EE6B5F" />
              <div>
                <small>DR. GUSTAVO JIMÉNEZ</small>
                <strong>Estable · 120/78 mmHg</strong>
              </div>
            </div>
            <div className="domus-stat-chip" onClick={() => setSelectedModal(departments[1])}>
              <Users size={18} color="#5E7AC6" />
              <div>
                <small>PERSONAL EN TURNO</small>
                <strong>11 / 11 Activos Hoy</strong>
              </div>
            </div>
            <div className="domus-stat-chip">
              <Calendar size={18} color="#5E7AC6" />
              <div>
                <small>FECHA OPERATIVA</small>
                <strong>{formatDate(time)}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            1. PRIMERO: BOTONES GRANDES (5 DEPARTAMENTOS)
            ========================================== */}
        <section id="sec-depts" className="domus-block">
          <div className="domus-block-header">
            <div>
              <h2 className="domus-block-title">
                <span className="domus-dot-indicator" style={{ background: '#5E7AC6' }}></span>
                Gestión por Departamentos
              </h2>
              <p className="domus-block-sub">Toque cualquier área para inspeccionar el estado en tiempo real</p>
            </div>
            <span className="domus-live-badge">
              <i></i> 5 MÓDULOS SINCRONIZADOS
            </span>
          </div>

          <div className="domus-dept-grid">
            {departments.map((area) => (
              <DepartmentCard
                key={area.id}
                area={area}
                onSelect={(item) => setSelectedModal(item)}
              />
            ))}
          </div>
        </section>

        {/* ==========================================
            2. SEGUNDO: BOTONES DE ACCIONES RÁPIDAS (SIN RECORTES)
            ========================================== */}
        <section id="sec-bitacora" className="domus-block">
          <div className="domus-block-header">
            <div>
              <h2 className="domus-block-title">
                <span className="domus-dot-indicator" style={{ background: '#EE6B5F' }}></span>
                Acciones Rápidas del Ama de Llaves
              </h2>
              <p className="domus-block-sub">Registros directos para administración, cocina, garita y mantenimiento</p>
            </div>
          </div>

          <div className="domus-shortcuts-grid">
            <CascadeButton
              text="REPORTAR NOVEDAD"
              subtext="Bitácora diaria de la casa"
              icon={ClipboardCheck}
              accent="#5E7AC6"
              onClick={() => setSelectedModal({ title: "Reportar Novedad Operativa", subtitle: "Bitácora Directa", description: "Registre cualquier novedad con foto o nota de voz para que quede asentada automáticamente en el reporte administrativo.", details: ["Categoría: Infraestructura / Personal / Insumos", "Notificación automática a Administración", "Respaldo con fecha y hora exacta"] })}
            />
            <CascadeButton
              text="SOLICITAR INSUMOS"
              subtext="Lista de compras y reposición"
              icon={ShoppingBag}
              accent="#EE6B5F"
              onClick={() => setSelectedModal({ title: "Solicitud de Insumos y Compras", subtitle: "Abastecimiento", description: "Envíe requerimientos de mercado, productos de limpieza o farmacia directamente a la administradora con un toque.", details: ["Urgente: Detergente hipoalergénico y desinfectante", "Cocina: Aceite de oliva extra virgen y pescado fresco", "Farmacia: Gasas estériles y alcohol antiséptico"] })}
            />
            <CascadeButton
              text="MENÚ DEL DÍA"
              subtext="Desayuno, almuerzo y cena"
              icon={Coffee}
              accent="#BE7AC6"
              onClick={() => setSelectedModal(departments[0])}
            />
            <CascadeButton
              text="AGENDA FAMILIAR"
              subtext="Visitas de hijos y sobrinos"
              icon={Calendar}
              accent="#5E7AC6"
              onClick={() => setSelectedModal(departments[2])}
            />
            <CascadeButton
              text="FLOTA Y CHÓFERES"
              subtext="Combustible y mantenimiento"
              icon={CarFront}
              accent="#EE6B5F"
              onClick={() => setSelectedModal({ title: "Estado de Vehículos (Sin Rutas)", subtitle: "Mantenimiento de Flota", description: "Control exclusivo de kilometraje para cambio de aceite, batería, cauchos y combustible, respetando los protocolos de seguridad.", details: ["Toyota Land Cruiser: Tanque lleno (100%) · Próximo servicio en 1,800 km", "Camioneta de Apoyo: Presión de neumáticos verificada hoy", "Sin solicitudes de repuestos pendientes"] })}
            />
            <CascadeButton
              text="AVISAR A GARITA"
              subtext="Autorizar técnicos o visitas"
              icon={FileSignature}
              accent="#5E7AC6"
              onClick={() => setSelectedModal(departments[1])}
            />
          </div>
        </section>

        {/* ==========================================
            3. TERCERO: DASHBOARD ANALÍTICO CON MOCK DATA COMPLETO
            ========================================== */}
        <section className="domus-block">
          <div className="domus-block-header">
            <div>
              <h2 className="domus-block-title">
                <span className="domus-dot-indicator" style={{ background: '#5E7AC6' }}></span>
                Métricas y Monitoreo en Tiempo Real
              </h2>
              <p className="domus-block-sub">Auditoría de alacena, signos vitales del Dr. Jiménez, personal y alertas</p>
            </div>
          </div>

          <div className="domus-analytics-grid">

            {/* WIDGET 1: DONA INTERACTIVA DE ALACENA */}
            <div id="sec-alacena" className="domus-glass-panel">
              <div className="domus-panel-head">
                <div>
                  <h3>Estado de Alacena e Inventario</h3>
                  <p>TOQUE O PASE EL CURSOR SOBRE CADA RUBRO</p>
                </div>
                <span className="domus-pill-tag">Auditoría Activa</span>
              </div>

              <div className="domus-donut-layout">
                <div className="domus-svg-donut-wrap">
                  <svg viewBox="0 0 100 100" className="domus-svg-donut">
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(94,122,198,0.1)" strokeWidth="10" />
                    {donutRings.map((ring) => {
                      const isHover = hoveredStock === ring.idx;
                      return (
                        <circle
                          key={ring.idx}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={ring.color}
                          strokeWidth={isHover ? "13" : "10"}
                          strokeDasharray={ring.dashArray}
                          strokeDashoffset={ring.dashOffset}
                          strokeLinecap="round"
                          className="domus-donut-segment"
                          style={{
                            opacity: hoveredStock === null || isHover ? 1 : 0.35
                          }}
                          onMouseEnter={() => setHoveredStock(ring.idx)}
                          onMouseLeave={() => setHoveredStock(null)}
                          onClick={() => setHoveredStock(ring.idx)}
                        />
                      );
                    })}
                  </svg>
                  <div className="domus-donut-center">
                    <strong>
                      {hoveredStock !== null ? `${stockSegments[hoveredStock].val}%` : '78%'}
                    </strong>
                    <span>
                      {hoveredStock !== null ? stockSegments[hoveredStock].status : 'Stock Global'}
                    </span>
                  </div>
                </div>

                <div className="domus-stock-legend">
                  {stockSegments.map((item, idx) => (
                    <div
                      key={idx}
                      className={`domus-legend-row ${hoveredStock === idx ? 'active' : ''}`}
                      onMouseEnter={() => setHoveredStock(idx)}
                      onMouseLeave={() => setHoveredStock(null)}
                      onClick={() => setHoveredStock(idx)}
                    >
                      <div className="domus-legend-name">
                        <i style={{ backgroundColor: item.color }}></i>
                        <span>{item.label}</span>
                      </div>
                      <div className="domus-legend-val">
                        <strong style={{ color: item.val < 30 ? '#EE6B5F' : '#202020' }}>
                          {item.val}%
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WIDGET 2: MONITOR MÉDICO DR. GUSTAVO JIMÉNEZ */}
            <div id="sec-salud" className="domus-glass-panel">
              <div className="domus-panel-head">
                <div>
                  <h3>Cuidados Médicos · Dr. Jiménez</h3>
                  <p>SIGNOS VITALES Y MEDICACIÓN DE HOY</p>
                </div>
                <span className="domus-pill-tag domus-pill-coral">
                  <HeartPulse size={14} /> 120/78 mmHg
                </span>
              </div>

              <div className="domus-vitals-row">
                <div className="domus-vital-box">
                  <Activity size={16} color="#5E7AC6" />
                  <small>PULSO</small>
                  <strong>68 BPM</strong>
                </div>
                <div className="domus-vital-box">
                  <Droplets size={16} color="#EE6B5F" />
                  <small>OXIGENACIÓN</small>
                  <strong>98% SpO2</strong>
                </div>
                <div className="domus-vital-box">
                  <Thermometer size={16} color="#BE7AC6" />
                  <small>GLUCEMIA</small>
                  <strong>94 mg/dL</strong>
                </div>
              </div>

              <div className="domus-med-chart">
                <div className="domus-med-chart-header">
                  <span>Curva de Presión Arterial (Últimas 6 tomas)</span>
                  <strong>Rango Óptimo</strong>
                </div>
                <div className="domus-med-bars">
                  {medicalReadings.map((reading, i) => (
                    <div key={i} className="domus-med-col">
                      <div className="domus-med-tooltip">{reading.sys}/{reading.dia}</div>
                      <div className="domus-med-pill-bar">
                        <div
                          className="domus-med-fill"
                          style={{ height: `${(reading.sys / 150) * 100}%` }}
                        ></div>
                      </div>
                      <span className="domus-med-time">{reading.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="domus-med-list">
                {medications.map((med, i) => (
                  <div
                    key={i}
                    className={`domus-med-item ${completedMeds[i] ? 'done' : ''}`}
                    onClick={() => {
                      const next = [...completedMeds];
                      next[i] = !next[i];
                      setCompletedMeds(next);
                    }}
                  >
                    <div className="domus-check-circle">
                      {completedMeds[i] && <Check size={12} />}
                    </div>
                    <div className="domus-med-info">
                      <strong>{med.time} · {med.name}</strong>
                      <small>{med.nurse}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 3: CARGA OPERATIVA + CENTRO DE ALERTAS */}
            <div className="domus-glass-panel domus-panel-accent">
              <div className="domus-panel-head">
                <div>
                  <h3 style={{ color: '#fff' }}>Centro de Control y Alertas</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)' }}>TOQUE UNA ALERTA PARA MARCARLA RESUELTA</p>
                </div>
                <span className="domus-alert-count">
                  {resolvedAlerts.filter(Boolean).length}/3 Resueltas
                </span>
              </div>

              <div className="domus-alerts-stack">
                {[
                  { title: "Reposición Alacena Limpieza", desc: "Stock de detergente neutro al 22% · Incluir en pedido semanal", tag: "Administración" },
                  { title: "Mantenimiento Preventivo", desc: "Prueba semanal de Planta Eléctrica Principal completada al 100%", tag: "Instalaciones" },
                  { title: "Visita Familiar Confirmada", desc: "Sr. Álvaro Jiménez autorizado en garita principal", tag: "Garita" }
                ].map((al, i) => (
                  <div
                    key={i}
                    className={`domus-alert-card ${resolvedAlerts[i] ? 'resolved' : ''}`}
                    onClick={() => {
                      const next = [...resolvedAlerts];
                      next[i] = !next[i];
                      setResolvedAlerts(next);
                    }}
                  >
                    <div className="domus-alert-status">
                      {resolvedAlerts[i] ? <CheckCircle2 size={18} color="#6EE7B7" /> : <AlertCircle size={18} color="#EE6B5F" />}
                    </div>
                    <div className="domus-alert-body">
                      <div className="domus-alert-row">
                        <strong>{al.title}</strong>
                        <span>{al.tag}</span>
                      </div>
                      <p>{al.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="domus-staff-bar">
                <div className="domus-staff-head">
                  <span>CUMPLIMIENTO SEMANAL DEL STAFF (11 EMPLEADOS)</span>
                  <strong>96% Completado</strong>
                </div>
                <div className="domus-progress-track">
                  <div className="domus-progress-fill" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ==========================================
          FOOTER CON LOGO STANDALONE
          ========================================== */}
      <footer className="domus-footer">
        <div className="domus-footer-inner">
          <div className="domus-footer-brand">
            <img src={STANDALONE_LOGO_URL} alt="Domus" />
            <div>
              <strong>DOMUS · GESTIÓN DOMÉSTICA</strong>
              <span>Plataforma Privada · Casa Roquedal</span>
            </div>
          </div>
          <div className="domus-footer-status">
            <ShieldCheck size={16} color="#5E7AC6" />
            <span>Conexión Encriptada · Auditoría Activa</span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          MODAL INTERACTIVO AL TOCAR CUALQUIER TARJETA
          ========================================== */}
      {selectedModal && (
        <div className="domus-modal-backdrop" onClick={() => setSelectedModal(null)}>
          <div className="domus-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="domus-modal-top">
              <div className="domus-modal-brand">
                <img src={STANDALONE_LOGO_URL} alt="Domus" />
                <div>
                  <span>{selectedModal.subtitle}</span>
                  <h3>{selectedModal.title}</h3>
                </div>
              </div>
              <button className="domus-modal-close" onClick={() => setSelectedModal(null)}>
                <X size={20} />
              </button>
            </div>
            <p className="domus-modal-desc">{selectedModal.description}</p>
            <div className="domus-modal-list">
              {selectedModal.details?.map((detail, idx) => (
                <div key={idx} className="domus-modal-item">
                  <CheckCircle2 size={18} color="#5E7AC6" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
            <button className="domus-modal-btn" onClick={() => setSelectedModal(null)}>
              ENTENDIDO · VOLVER AL PANEL
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          HOJA DE ESTILOS AISLADA Y ULTRA-REACTIVA
          ========================================== */}
      <style dangerouslySetInnerHTML={{ __html: `
        .domus-root {
          position: relative;
          min-height: 100vh;
          background-color: #F0F0F2;
          color: #202020;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
        }

        /* SPLASH SCREEN */
        .domus-splash {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(240, 240, 242, 0.92);
          backdrop-filter: blur(30px);
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        .domus-splash-hide {
          opacity: 0; visibility: hidden; pointer-events: none;
        }
        .domus-splash-box {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          animation: domusSplashPulse 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .domus-splash-logo {
          width: 84px; height: 84px; object-fit: contain;
          filter: drop-shadow(0 12px 24px rgba(94, 122, 198, 0.35));
        }
        .domus-splash-box span {
          font-size: 11px; font-weight: 900; letter-spacing: 0.25em; color: #5E7AC6;
        }
        @keyframes domusSplashPulse {
          0% { transform: scale(0.85); opacity: 0; }
          50% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1.15); opacity: 0; }
        }

        /* FONDO PASTEL EN MOVIMIENTO VISIBLE */
        .domus-bg-canvas {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
          background: linear-gradient(135deg, #F0F0F2 0%, #E9EEF8 50%, #F7ECEB 100%);
        }
        .domus-orb {
          position: absolute; border-radius: 50%;
          filter: blur(65px); opacity: 0.65;
          will-change: transform;
        }
        .domus-orb-blue {
          width: 48vw; height: 48vw; top: -12%; left: -8%;
          background: radial-gradient(circle, #5E7AC6 0%, transparent 70%);
          animation: orbFloat1 8s ease-in-out infinite alternate;
        }
        .domus-orb-coral {
          width: 45vw; height: 45vw; top: 8%; right: -10%;
          background: radial-gradient(circle, #EE6B5F 0%, transparent 70%);
          animation: orbFloat2 9s ease-in-out infinite alternate;
        }
        .domus-orb-lavender {
          width: 50vw; height: 50vw; bottom: -15%; left: 18%;
          background: radial-gradient(circle, #BE7AC6 0%, transparent 70%);
          animation: orbFloat3 10s ease-in-out infinite alternate;
        }
        .domus-orb-sky {
          width: 36vw; height: 36vw; bottom: 15%; right: 15%;
          background: radial-gradient(circle, #5E7AC6 0%, #EE6B5F 100%);
          opacity: 0.35;
          animation: orbFloat1 7s ease-in-out infinite alternate-reverse;
        }
        @keyframes orbFloat1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(14vw, 12vh) scale(1.22); }
        }
        @keyframes orbFloat2 {
          0% { transform: translate(0, 0) scale(1.1); }
          100% { transform: translate(-16vw, 14vh) scale(0.9); }
        }
        @keyframes orbFloat3 {
          0% { transform: translate(0, 0) scale(0.95); }
          100% { transform: translate(12vw, -14vh) scale(1.2); }
        }

        /* NAVBAR SUPERIOR CON LOGO COMPLETO Y RESPONSIVO */
        .domus-navbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255, 255, 255, 0.62);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.88);
          box-shadow: 0 8px 32px rgba(32, 32, 32, 0.04);
        }
        .domus-navbar-inner {
          max-width: 1540px; margin: 0 auto;
          padding: 8px 14px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px;
        }
        @media (min-width: 768px) {
          .domus-navbar-inner { padding: 10px 24px; gap: 16px; }
        }

        .domus-brand-left {
          display: flex; align-items: center; cursor: pointer; flex-shrink: 0;
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-brand-left:hover { transform: scale(1.04); }

        /* Compensa el margen transparente interno del PNG 1920x500 sin recortar nada */
        .domus-header-logo-img {
          height: 44px;
          width: auto;
          object-fit: contain;
          margin-left: -26px;
          margin-right: -26px;
          filter: drop-shadow(0 2px 6px rgba(94, 122, 198, 0.14));
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .domus-header-logo-img {
            height: 60px;
            margin-left: -36px;
            margin-right: -32px;
          }
        }

        .domus-nav-tabs {
          display: none; align-items: center; gap: 6px;
          background: rgba(255, 255, 255, 0.5);
          padding: 5px; border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.85);
        }
        @media (min-width: 1100px) { .domus-nav-tabs { display: flex; } }
        .domus-nav-tab {
          border: none; background: transparent; cursor: pointer;
          padding: 9px 18px; border-radius: 99px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.08em; color: #555;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-nav-tab:hover { color: #5E7AC6; background: rgba(255, 255, 255, 0.75); }
        .domus-nav-tab.active {
          background: #5E7AC6; color: #fff;
          box-shadow: 0 6px 18px rgba(94, 122, 198, 0.4);
        }

        .domus-nav-right {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .domus-nav-right { gap: 12px; }
        }
        .domus-clock-pill {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.95);
          padding: 6px 10px; border-radius: 99px;
          font-size: 11.5px; font-weight: 900; color: #202020;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        }
        @media (min-width: 768px) {
          .domus-clock-pill { padding: 8px 14px; font-size: 13px; gap: 8px; }
        }
        .domus-profile-pill {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.95);
          padding: 4px 10px 4px 4px; border-radius: 99px;
          cursor: pointer; transition: all 0.25s ease;
        }
        @media (min-width: 768px) {
          .domus-profile-pill { padding: 5px 14px 5px 6px; gap: 10px; }
        }
        .domus-profile-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(94, 122, 198, 0.2);
        }
        .domus-profile-pill img {
          width: 28px; height: 28px; border-radius: 50%; object-fit: contain;
          background: rgba(94, 122, 198, 0.12); padding: 3px; flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .domus-profile-pill img { width: 32px; height: 32px; padding: 4px; }
        }
        .domus-profile-text { display: flex; flex-direction: column; line-height: 1.05; }
        .domus-profile-text strong { font-size: 11px; font-weight: 800; color: #202020; white-space: nowrap; }
        .domus-profile-text small { font-size: 8px; font-weight: 700; color: #5E7AC6; text-transform: uppercase; white-space: nowrap; }
        @media (min-width: 768px) {
          .domus-profile-text strong { font-size: 12px; }
          .domus-profile-text small { font-size: 9px; }
        }

        /* BARRA INFERIOR ANCLADA EN MÓVIL (BOTTOM DOCK) */
        .domus-mobile-bottom-nav {
          position: fixed;
          bottom: 12px; left: 12px; right: 12px;
          z-index: 95;
          display: flex; align-items: center; justify-content: space-around;
          padding: 8px 6px;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 26px;
          box-shadow: 0 14px 36px rgba(32, 32, 48, 0.16);
        }
        @media (min-width: 1100px) {
          .domus-mobile-bottom-nav { display: none; }
        }
        .domus-mobile-nav-item {
          flex: 1;
          border: none; background: transparent;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; padding: 6px 2px; border-radius: 18px;
          color: #666; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-mobile-nav-icon {
          width: 34px; height: 28px; border-radius: 99px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s ease;
        }
        .domus-mobile-nav-item span {
          font-size: 9.5px; font-weight: 800; letter-spacing: 0.03em;
          white-space: nowrap;
        }
        .domus-mobile-nav-item.active {
          color: #5E7AC6;
        }
        .domus-mobile-nav-item.active .domus-mobile-nav-icon {
          background: #5E7AC6; color: #fff;
          box-shadow: 0 4px 12px rgba(94, 122, 198, 0.4);
          transform: translateY(-2px);
        }

        /* MAIN CONTAINER */
        .domus-main {
          position: relative; z-index: 10;
          max-width: 1540px; margin: 0 auto;
          padding: 20px 16px 110px;
        }
        @media (min-width: 768px) {
          .domus-main { padding: 28px 24px 60px; }
        }

        /* HERO GREETING BAR */
        .domus-hero-bar {
          display: flex; flex-direction: column; justify-content: space-between; gap: 20px;
          margin-bottom: 36px; padding: 22px 20px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.48);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.88);
          box-shadow: 0 16px 40px rgba(32, 32, 32, 0.05);
          transition: all 0.3s ease;
          scroll-margin-top: 90px;
        }
        @media (min-width: 768px) {
          .domus-hero-bar { padding: 26px 32px; }
        }
        @media (min-width: 1024px) {
          .domus-hero-bar { flex-direction: row; align-items: center; }
        }
        .domus-hero-bar:hover {
          background: rgba(255, 255, 255, 0.62);
          box-shadow: 0 20px 50px rgba(94, 122, 198, 0.15);
        }
        .domus-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10.5px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
          margin-bottom: 6px;
        }
        .domus-main-title {
          font-size: clamp(28px, 4vw, 46px); font-weight: 900; letter-spacing: -0.04em;
          margin: 0; color: #202020; line-height: 1.05;
          transition: color 0.25s ease, transform 0.25s ease;
          cursor: default;
        }
        .domus-main-title:hover {
          color: #5E7AC6; transform: translateX(4px);
        }

        .domus-hero-pills {
          display: flex; flex-wrap: wrap; gap: 12px;
        }
        .domus-stat-chip {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.95);
          padding: 12px 18px; border-radius: 20px;
          cursor: pointer; width: 100%;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
        }
        @media (min-width: 640px) {
          .domus-stat-chip { width: auto; }
        }
        .domus-stat-chip:hover {
          transform: translateY(-4px) scale(1.02);
          background: #fff;
          box-shadow: 0 14px 28px rgba(94, 122, 198, 0.22);
        }
        .domus-stat-chip:active { transform: scale(0.96); }
        .domus-stat-chip div { display: flex; flex-direction: column; }
        .domus-stat-chip small { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; color: #808080; }
        .domus-stat-chip strong { font-size: 13px; font-weight: 900; color: #202020; }

        /* BLOQUES DE SECCIÓN */
        .domus-block { margin-bottom: 44px; scroll-margin-top: 90px; }
        .domus-block-header {
          display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between;
          gap: 12px; margin-bottom: 20px; padding: 0 4px;
        }
        .domus-block-title {
          font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em;
          color: #202020; margin: 0; display: flex; align-items: center; gap: 10px;
          cursor: pointer; transition: transform 0.25s ease, color 0.25s ease;
        }
        .domus-block-title:hover { transform: translateX(6px); color: #5E7AC6; }
        .domus-dot-indicator {
          width: 10px; height: 10px; border-radius: 50%;
          box-shadow: 0 0 12px currentColor; flex-shrink: 0;
        }
        .domus-block-sub {
          font-size: 12px; font-weight: 600; color: #666; margin: 4px 0 0 20px;
        }
        .domus-live-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255, 255, 255, 0.7); border: 1px solid #fff;
          padding: 6px 14px; border-radius: 99px;
          font-size: 10px; font-weight: 900; letter-spacing: 0.1em; color: #5E7AC6;
        }
        .domus-live-badge i {
          width: 8px; height: 8px; border-radius: 50%; background: #10B981;
          box-shadow: 0 0 8px #10B981; animation: domusBlink 1.5s infinite;
        }
        @keyframes domusBlink { 50% { opacity: 0.4; } }

        /* 1. GRID DE 5 DEPARTAMENTOS */
        .domus-dept-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .domus-dept-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .domus-dept-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1280px) {
          .domus-dept-grid { grid-template-columns: repeat(5, 1fr); }
        }

        .domus-dept-wrapper {
          position: relative; height: 350px; cursor: pointer;
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-dept-wrapper:hover { transform: translateY(-10px) scale(1.015); }
        .domus-dept-wrapper:active { transform: scale(0.97); }

        .domus-dept-backlight {
          position: absolute; inset: -8px; border-radius: 36px;
          background: var(--dept-accent);
          filter: blur(22px); opacity: 0;
          transition: opacity 0.28s ease; z-index: 0;
        }
        .domus-dept-wrapper:hover .domus-dept-backlight { opacity: 0.55; }

        .domus-dept-card {
          position: relative; z-index: 1; width: 100%; height: 100%;
          border-radius: 28px; overflow: hidden;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 14px 34px rgba(20, 20, 30, 0.12);
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 20px;
        }
        .domus-dept-bg {
          position: absolute; inset: 0; background-size: cover; background-position: center;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-dept-wrapper:hover .domus-dept-bg { transform: scale(1.12); }

        .domus-dept-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.4) 45%, rgba(15, 23, 42, 0.88) 100%);
          transition: opacity 0.3s ease;
        }
        .domus-dept-frost {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(94, 122, 198, 0.25) 0%, rgba(20, 24, 40, 0.88) 100%);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          opacity: 0; transition: opacity 0.28s ease;
        }
        .domus-dept-wrapper:hover .domus-dept-frost { opacity: 1; }

        .domus-dept-top {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
        }
        .domus-dept-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px);
          padding: 6px 12px; border-radius: 99px;
          font-size: 10px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;
          color: #202020; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .domus-dept-tag i { width: 8px; height: 8px; border-radius: 50%; }
        .domus-dept-abbr {
          font-size: 32px; font-weight: 900; color: rgba(255, 255, 255, 0.28);
          letter-spacing: -0.05em; line-height: 1;
        }

        .domus-dept-bottom {
          position: relative; z-index: 2; color: #fff;
          display: flex; flex-direction: column; gap: 10px;
        }
        .domus-dept-title {
          font-size: 22px; font-weight: 900; letter-spacing: -0.03em;
          margin: 0; line-height: 1.1; color: #fff;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .domus-dept-wrapper:hover .domus-dept-title {
          transform: translateY(-2px); color: #fff;
        }
        .domus-dept-desc {
          font-size: 11.5px; line-height: 1.4; color: rgba(255, 255, 255, 0.85);
          margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .domus-dept-stat-pill {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255, 255, 255, 0.16); backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 9px 12px; border-radius: 14px; font-size: 11px;
        }
        .domus-dept-stat-pill span { color: rgba(255, 255, 255, 0.8); font-weight: 700; }
        .domus-dept-stat-pill strong { color: #fff; font-weight: 900; }

        .domus-dept-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255, 255, 255, 0.95); color: #202020;
          padding: 11px; border-radius: 14px;
          font-size: 11px; font-weight: 900; letter-spacing: 0.1em;
          transition: all 0.25s ease;
        }
        .domus-dept-wrapper:hover .domus-dept-cta {
          background: var(--dept-accent); color: #fff;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }

        /* 2. BOTONES DE ACCIONES RÁPIDAS */
        .domus-shortcuts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .domus-shortcuts-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .domus-shortcuts-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }

        .domus-cascade-btn {
          position: relative; width: 100%;
          display: flex; align-items: center; gap: 16px;
          padding: 18px 22px; border-radius: 24px;
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 28px rgba(32, 32, 32, 0.05);
          cursor: pointer; text-align: left;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-cascade-btn:hover {
          transform: translateY(-5px) scale(1.015);
          background: var(--btn-accent);
          border-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 18px 38px -6px var(--btn-accent);
        }
        .domus-cascade-btn:active { transform: scale(0.96); }

        .domus-cascade-icon-box {
          width: 46px; height: 46px; border-radius: 16px; flex-shrink: 0;
          background: rgba(94, 122, 198, 0.12); color: var(--btn-accent);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s ease;
        }
        .domus-cascade-btn:hover .domus-cascade-icon-box {
          background: rgba(255, 255, 255, 0.22); color: #fff;
          transform: scale(1.1) rotate(-6deg);
        }

        .domus-cascade-content {
          flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;
        }
        .domus-cascade-wave {
          position: relative; height: 20px; overflow: hidden;
          display: flex; align-items: center;
        }
        .domus-wave-row {
          display: flex; font-size: 13px; font-weight: 900; letter-spacing: 0.06em;
          color: #202020; white-space: nowrap;
        }
        .domus-wave-row span {
          display: inline-block;
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s ease;
        }
        .domus-wave-hid {
          position: absolute; top: 0; left: 0; color: #fff;
        }
        .domus-wave-hid span { transform: translateY(140%) rotate(6deg); color: #fff; }
        .domus-cascade-btn:hover .domus-wave-vis span {
          transform: translateY(-140%) rotate(-6deg);
        }
        .domus-cascade-btn:hover .domus-wave-hid span {
          transform: translateY(0) rotate(0deg);
        }

        .domus-cascade-sub {
          font-size: 11px; font-weight: 600; color: #666;
          transition: color 0.25s ease;
        }
        .domus-cascade-btn:hover .domus-cascade-sub { color: rgba(255, 255, 255, 0.88); }

        .domus-cascade-arrow {
          color: #808080; flex-shrink: 0;
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .domus-cascade-btn:hover .domus-cascade-arrow {
          color: #fff; transform: translate(3px, -3px);
        }

        /* 3. DASHBOARD ANALÍTICO */
        .domus-analytics-grid {
          display: grid; grid-template-columns: 1fr; gap: 24px;
        }
        @media (min-width: 1150px) {
          .domus-analytics-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .domus-glass-panel {
          background: rgba(255, 255, 255, 0.52);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 32px; padding: 26px;
          box-shadow: 0 16px 40px rgba(32, 32, 32, 0.05);
          display: flex; flex-direction: column; justify-content: space-between; gap: 20px;
          transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          scroll-margin-top: 90px;
        }
        .domus-glass-panel:hover {
          transform: translateY(-6px);
          background: rgba(255, 255, 255, 0.68);
          box-shadow: 0 24px 50px rgba(94, 122, 198, 0.18);
        }
        .domus-panel-accent {
          background: linear-gradient(145deg, rgba(94, 122, 198, 0.95) 0%, rgba(68, 92, 160, 0.96) 100%);
          border-color: rgba(255, 255, 255, 0.35); color: #fff;
        }
        .domus-panel-accent:hover {
          background: linear-gradient(145deg, #5E7AC6 0%, #445CA0 100%);
          box-shadow: 0 26px 55px rgba(94, 122, 198, 0.45);
        }

        .domus-panel-head {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
        }
        .domus-panel-head h3 {
          font-size: 19px; font-weight: 900; letter-spacing: -0.03em; margin: 0; color: #202020;
        }
        .domus-panel-head p {
          font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #808080; margin: 4px 0 0;
        }
        .domus-pill-tag {
          background: rgba(94, 122, 198, 0.14); color: #5E7AC6;
          padding: 6px 12px; border-radius: 99px;
          font-size: 11px; font-weight: 900; white-space: nowrap;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .domus-pill-coral {
          background: rgba(238, 107, 95, 0.15); color: #EE6B5F;
        }

        /* DONA SVG CON ESPACIO SEPARADO */
        .domus-donut-layout {
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }
        .domus-svg-donut-wrap {
          position: relative; width: 170px; height: 170px; flex-shrink: 0;
        }
        .domus-svg-donut {
          width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible;
        }
        .domus-donut-segment {
          cursor: pointer; transition: all 0.25s ease;
        }
        .domus-donut-center {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .domus-donut-center strong {
          font-size: 28px; font-weight: 900; color: #202020; line-height: 1;
        }
        .domus-donut-center span {
          font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
          color: #5E7AC6; margin-top: 4px;
        }

        .domus-stock-legend {
          width: 100%; display: flex; flex-direction: column; gap: 8px;
        }
        .domus-legend-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-radius: 14px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.9);
          cursor: pointer; transition: all 0.2s ease;
        }
        .domus-legend-row:hover, .domus-legend-row.active {
          transform: translateX(6px); background: #fff;
          box-shadow: 0 6px 16px rgba(94, 122, 198, 0.15);
        }
        .domus-legend-name {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; font-weight: 700; color: #202020;
        }
        .domus-legend-name i { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .domus-legend-val strong { font-size: 13px; font-weight: 900; }

        /* WIDGET MÉDICO COMPLETO */
        .domus-vitals-row {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        .domus-vital-box {
          background: rgba(255, 255, 255, 0.68);
          border: 1px solid rgba(255, 255, 255, 0.95);
          padding: 12px; border-radius: 18px;
          display: flex; flex-direction: column; gap: 4px;
          transition: transform 0.2s ease; cursor: pointer;
        }
        .domus-vital-box:hover { transform: translateY(-3px); background: #fff; }
        .domus-vital-box small { font-size: 9px; font-weight: 800; color: #808080; }
        .domus-vital-box strong { font-size: 14px; font-weight: 900; color: #202020; }

        .domus-med-chart {
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 20px; padding: 14px 16px;
        }
        .domus-med-chart-header {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; font-weight: 700; color: #555; margin-bottom: 12px;
        }
        .domus-med-chart-header strong { color: #10B981; font-weight: 900; }
        .domus-med-bars {
          display: flex; align-items: flex-end; justify-content: space-between;
          height: 76px; gap: 8px;
        }
        .domus-med-col {
          flex: 1; height: 100%; display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end; gap: 6px;
          position: relative; cursor: pointer;
        }
        .domus-med-tooltip {
          position: absolute; top: -24px;
          background: #202020; color: #fff; font-size: 9px; font-weight: 800;
          padding: 3px 6px; border-radius: 6px; opacity: 0;
          transition: opacity 0.2s ease; pointer-events: none; white-space: nowrap;
        }
        .domus-med-col:hover .domus-med-tooltip { opacity: 1; }
        .domus-med-pill-bar {
          width: 100%; height: 54px; background: rgba(94, 122, 198, 0.12);
          border-radius: 99px; display: flex; align-items: flex-end; overflow: hidden;
        }
        .domus-med-fill {
          width: 100%; background: linear-gradient(180deg, #EE6B5F 0%, #5E7AC6 100%);
          border-radius: 99px; transition: height 0.4s ease, filter 0.2s ease;
        }
        .domus-med-col:hover .domus-med-fill { filter: brightness(1.2); }
        .domus-med-time { font-size: 9px; font-weight: 800; color: #808080; }

        .domus-med-list { display: flex; flex-direction: column; gap: 8px; }
        .domus-med-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 14px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.9);
          cursor: pointer; transition: all 0.2s ease;
        }
        .domus-med-item:hover { background: #fff; transform: translateX(4px); }
        .domus-med-item.done { opacity: 0.7; }
        .domus-check-circle {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #5E7AC6; display: flex; align-items: center; justify-content: center;
          background: #fff; color: #fff; flex-shrink: 0;
        }
        .domus-med-item.done .domus-check-circle { background: #5E7AC6; }
        .domus-med-info { display: flex; flex-direction: column; }
        .domus-med-info strong { font-size: 11.5px; font-weight: 800; color: #202020; }
        .domus-med-info small { font-size: 10px; color: #666; font-weight: 600; }

        /* ALERTAS INTERACTIVAS */
        .domus-alert-count {
          background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4);
          padding: 6px 12px; border-radius: 99px; font-size: 11px; font-weight: 900; color: #fff;
        }
        .domus-alerts-stack { display: flex; flex-direction: column; gap: 12px; }
        .domus-alert-card {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; border-radius: 20px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.25);
          cursor: pointer; transition: all 0.25s ease;
        }
        .domus-alert-card:hover {
          background: rgba(255, 255, 255, 0.24); transform: translateX(5px);
        }
        .domus-alert-card.resolved { opacity: 0.65; }
        .domus-alert-body { flex: 1; }
        .domus-alert-row {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          margin-bottom: 4px;
        }
        .domus-alert-row strong { font-size: 13px; font-weight: 900; color: #fff; }
        .domus-alert-row span {
          font-size: 9px; font-weight: 800; text-transform: uppercase;
          background: rgba(0, 0, 0, 0.2); padding: 3px 8px; border-radius: 99px;
        }
        .domus-alert-body p { font-size: 11.5px; color: rgba(255, 255, 255, 0.85); margin: 0; line-height: 1.35; }

        .domus-staff-bar {
          background: rgba(0, 0, 0, 0.18); border-radius: 18px; padding: 14px 16px;
        }
        .domus-staff-head {
          display: flex; justify-content: space-between; font-size: 10px; font-weight: 800;
          margin-bottom: 8px; color: rgba(255, 255, 255, 0.9);
        }
        .domus-progress-track {
          width: 100%; height: 8px; background: rgba(255, 255, 255, 0.2);
          border-radius: 99px; overflow: hidden;
        }
        .domus-progress-fill {
          height: 100%; background: linear-gradient(90deg, #6EE7B7, #fff); border-radius: 99px;
        }

        /* FOOTER */
        .domus-footer {
          position: relative; z-index: 10;
          border-top: 1px solid rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          padding: 20px 24px 96px;
        }
        @media (min-width: 1100px) {
          .domus-footer { padding: 20px 24px; }
        }
        .domus-footer-inner {
          max-width: 1540px; margin: 0 auto;
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;
        }
        .domus-footer-brand { display: flex; align-items: center; gap: 12px; }
        .domus-footer-brand img { width: 34px; height: 34px; object-fit: contain; }
        .domus-footer-brand div { display: flex; flex-direction: column; }
        .domus-footer-brand strong { font-size: 12px; font-weight: 900; letter-spacing: 0.08em; }
        .domus-footer-brand span { font-size: 11px; color: #666; font-weight: 600; }
        .domus-footer-status {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 800; color: #5E7AC6;
        }

        /* MODAL INTERACTIVO */
        .domus-modal-backdrop {
          position: fixed; inset: 0; z-index: 150;
          background: rgba(20, 24, 40, 0.45); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: modalFadeIn 0.2s ease;
        }
        .domus-modal-card {
          width: 100%; max-width: 520px;
          background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(30px);
          border: 1.5px solid #fff; border-radius: 32px; padding: 28px;
          box-shadow: 0 25px 60px rgba(20, 24, 40, 0.25);
        }
        .domus-modal-top {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
        }
        .domus-modal-brand { display: flex; align-items: center; gap: 12px; }
        .domus-modal-brand img { width: 42px; height: 42px; object-fit: contain; }
        .domus-modal-brand span {
          font-size: 10px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.1em; color: #5E7AC6;
        }
        .domus-modal-brand h3 { font-size: 22px; font-weight: 900; margin: 2px 0 0; color: #202020; }
        .domus-modal-close {
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: rgba(0,0,0,0.06); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .domus-modal-desc { font-size: 13.5px; line-height: 1.5; color: #444; margin-bottom: 18px; }
        .domus-modal-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }
        .domus-modal-item {
          display: flex; align-items: center; gap: 10px;
          background: #F5F7FA; padding: 12px 14px; border-radius: 14px;
          font-size: 12.5px; font-weight: 700; color: #202020;
        }
        .domus-modal-btn {
          width: 100%; padding: 14px; border: none; border-radius: 16px;
          background: #5E7AC6; color: #fff; font-size: 12px; font-weight: 900;
          letter-spacing: 0.1em; cursor: pointer; transition: background 0.2s ease;
        }
        .domus-modal-btn:hover { background: #4662AD; }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}