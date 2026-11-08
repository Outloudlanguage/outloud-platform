import React, { useState, useEffect, useRef } from 'react';
import InventoryModal from './InventoryModal';
import StaffModal from './StaffModal';
import NursingModal from './NursingModal';
import {
  Clock, Calendar, Bell, ClipboardCheck, Coffee, ShoppingBag,
  Wrench, CarFront, FileSignature, AlertCircle, CheckCircle2,
  HeartPulse, ShieldCheck, Sparkles, ArrowUpRight, Check, X,
  Activity, Thermometer, Droplets, Users, LayoutGrid, Layers,
  Maximize2, Minimize2
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
// 2. ÍCONOS SVG A MEDIDA + TARJETA CON VIDRIO ESMERILADO
// ==========================================
const DepartmentSvgIcon = ({ id, className = "domus-dept-svg-icon" }) => {
  switch (id) {
    case 'cocina':
      // Ingrediente culinario (Hoja aromática + bulbo/vegetal)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    case 'personal':
      // Grupo de 3 personas
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'seguridad':
      // Escudo de seguridad patrimonial
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'hospitalidad':
      // Suite / Cama de hospitalidad
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 4v16" />
          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" />
          <path d="M6 8v9" />
        </svg>
      );
    case 'mantenimiento':
      // Herramienta (Llave mecánica)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'cuidados':
    default:
      // Salud (Corazón con pulso médico)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
        </svg>
      );
  }
};

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
          <div className="domus-dept-svg-badge">
            <DepartmentSvgIcon id={area.id} />
          </div>
        </div>

        {/* Panel inferior en Vidrio Esmerilado (Frosted Glass) */}
        <div className="domus-dept-bottom">
          <div className="domus-dept-glass-watermark">
            <DepartmentSvgIcon id={area.id} />
          </div>

          <div className="domus-dept-title-row">
            <h3 className="domus-dept-title">{area.title}</h3>
          </div>
          <p className="domus-dept-desc">{area.description}</p>

          <div className="domus-dept-stat-pill">
            <span>{area.stats.label}</span>
            <strong>{area.stats.value}</strong>
          </div>

          <div className="domus-dept-cta">
            <span>GESTIONAR ÁREA</span>
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
  const [inventoryModalTab, setInventoryModalTab] = useState(null);
  const [staffModalTab, setStaffModalTab] = useState(null);
  const [nursingModalTab, setNursingModalTab] = useState(null);
  const [completedMeds, setCompletedMeds] = useState([true, false, false]);
  const [resolvedAlerts, setResolvedAlerts] = useState([false, false, false]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoFullscreenTriggered = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Animación inicial pausada y ceremonial (2.8 segundos)
    const splashTimer = setTimeout(() => setSplashDone(true), 2800);

    // Meta tags para apariencia de App Nativa en móviles
    let metaCapable = document.querySelector('meta[name="mobile-web-app-capable"]');
    if (!metaCapable) {
      metaCapable = document.createElement('meta');
      metaCapable.name = 'mobile-web-app-capable';
      metaCapable.content = 'yes';
      document.head.appendChild(metaCapable);
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(timer);
      clearTimeout(splashTimer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Activa pantalla completa automáticamente al primer toque para ocultar la UI del navegador
  const handleFirstInteraction = () => {
    if (!autoFullscreenTriggered.current) {
      autoFullscreenTriggered.current = true;
      const elem = document.documentElement;
      if (!document.fullscreenElement && elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    }
  };

  const toggleFullScreen = (e) => {
    if (e) e.stopPropagation();
    autoFullscreenTriggered.current = true;
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

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
    if (item.id === 'ALACENA') {
      setInventoryModalTab('STOCK');
      return;
    }
    if (item.id === 'SALUD & CUIDADOS') {
      setNursingModalTab('SIGNOS');
      return;
    }
    const el = document.getElementById(item.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 6 Departamentos Principales (Incluyendo PERSONAL)
  // Si tus IDs pertenecen a Cloudflare Images, pega tu Account Hash aquí (ej. "abc123xyz")
  const CF_IMAGES_HASH = "";
  const resolveImg = (idOrUrl) => {
    if (idOrUrl.startsWith('http')) return idOrUrl;
    if (CF_IMAGES_HASH) return `https://imagedelivery.net/${CF_IMAGES_HASH}/${idOrUrl}/public`;
    return idOrUrl;
  };

  const departments = [
    {
      id: 'cocina',
      abbr: '01',
      title: "Cocina & Despensa",
      subtitle: "Gastronomía",
      accentColor: "#EE6B5F",
      imgUrl: "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/1794149874168.jpg",
      stats: { label: "Alacena & Menú", value: "78% Stock · 3 Tiempos" },
      description: "Inventario en tiempo real, pesaje en balanza, recetario familiar y control de mermas.",
      details: [
        "Almuerzo Dr. Jiménez: Crema de auyama asada, Mero al vapor con finas hierbas.",
        "Merma auditada hoy: 0.45 kg (cáscaras y recortes vegetales).",
        "Próxima recepción: Frutas y hortalizas frescas (Mañana 8:30 AM)."
      ]
    },
    {
      id: 'personal',
      abbr: '02',
      title: "Personal",
      subtitle: "Staff & Turnos",
      accentColor: "#5E7AC6",
      imgUrl: "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/1794150174830.jpg",
      stats: { label: "Asistencia Hoy", value: "11 / 11 en Posición" },
      description: "Gestión de horarios, asistencia, asignación de tareas diarias, descansos y desempeño.",
      details: [
        "Personal Doméstico y Cocina: 5/5 activos en residencia.",
        "Enfermería: Lic. Carmen en turno diurno · Relevos confirmados.",
        "Jardinería, Mantenimiento y Chóferes: 100% operativos y sin novedades."
      ]
    },
    {
      id: 'seguridad',
      abbr: '03',
      title: "Seguridad",
      subtitle: "Enlace Garita",
      accentColor: "#5E7AC6",
      imgUrl: "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/1794150065473.jpg",
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
      abbr: '04',
      title: "Hospitalidad",
      subtitle: "Suites & Lencería",
      accentColor: "#BE7AC6",
      imgUrl: "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/1794150276283.jpg",
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
      abbr: '05',
      title: "Mantenimiento",
      subtitle: "Instalaciones",
      accentColor: "#EE6B5F",
      imgUrl: "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/1794150373743.jpg",
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
      abbr: '06',
      title: "Cuidados Médicos",
      subtitle: "Salud & Enfermería",
      accentColor: "#5E7AC6",
      imgUrl: "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/1794150443908.jpg",
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
    <div className="domus-root" onClick={handleFirstInteraction}>
      {/* ==========================================
          SPLASH SCREEN PAUSADO Y ELEGANTE (2.8s)
          ========================================== */}
      <div className={`domus-splash ${splashDone ? 'domus-splash-hide' : ''}`}>
        <div className="domus-splash-box">
          <div className="domus-splash-ring">
            <img src={STANDALONE_LOGO_URL} alt="Domus" className="domus-splash-logo" />
          </div>
          <strong>DOMUS</strong>
          <span>CASA ROQUEDAL · GESTIÓN DOMÉSTICA</span>
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
          BARRA DE NAVEGACIÓN SUPERIOR (SIN CORTES EN MÓVIL)
          ========================================== */}
      <nav className="domus-navbar">
        <div className="domus-navbar-inner">
          {/* Logo principal bien dimensionado y sin recortes */}
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

          {/* Controles derechos: Pantalla Completa, Reloj y Avatar */}
          <div className="domus-nav-right">
            <button
              onClick={toggleFullScreen}
              className="domus-fullscreen-btn"
              title={isFullscreen ? "Salir de Pantalla Completa" : "Modo App (Ocultar Navegador)"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span className="domus-fs-label">
                {isFullscreen ? "Salir" : "Modo App"}
              </span>
            </button>

            <div className="domus-clock-pill">
              <Clock size={14} color="#EE6B5F" />
              <span>{formatTime(time)}</span>
            </div>

            <div className="domus-profile-pill" onClick={() => setSelectedModal(departments[1])}>
              <div className="domus-avatar-circle">
                <span>SB</span>
                <i className="domus-avatar-status"></i>
              </div>
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

        {/* CABECERA DE BIENVENIDA + 4 PÍLDORAS DE TAMAÑO IDÉNTICO */}
        <section id="sec-hero" className="domus-hero-bar">
          {/* Marca de agua arquitectónica sutil con el isotipo standalone */}
          <img src={STANDALONE_LOGO_URL} alt="" className="domus-hero-watermark" />

          <div className="domus-hero-greeting">
            <div className="domus-eyebrow">
              <span><Sparkles size={13} color="#EE6B5F" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />CASA ROQUEDAL · SISTEMA INTEGRAL DE GESTIÓN</span>
              <small>RESIDENCIA DR. GUSTAVO JIMÉNEZ</small>
            </div>
            <h1 className="domus-main-title">Buenos días, Sra. Belkys.</h1>
          </div>

          {/* 4 Píldoras en Cuadrícula 2x2 de idéntico ancho y alto */}
          <div className="domus-hero-pills-grid">
            <div className="domus-stat-chip" onClick={() => setNursingModalTab('SIGNOS')}>
              <div className="domus-chip-icon" style={{ background: 'rgba(238,107,95,0.14)' }}>
                <HeartPulse size={18} color="#EE6B5F" />
              </div>
              <div className="domus-chip-text">
                <small>DR. GUSTAVO JIMÉNEZ</small>
                <strong>Estable · 120/78 mmHg</strong>
              </div>
            </div>

            <div className="domus-stat-chip" onClick={() => setStaffModalTab('DIRECTORIO')}>
              <div className="domus-chip-icon" style={{ background: 'rgba(94,122,198,0.14)' }}>
                <Users size={18} color="#5E7AC6" />
              </div>
              <div className="domus-chip-text">
                <small>PERSONAL EN TURNO</small>
                <strong>11 / 11 Activos Hoy</strong>
              </div>
            </div>

            <div className="domus-stat-chip" onClick={() => setSelectedModal(departments[4])}>
              <div className="domus-chip-icon" style={{ background: 'rgba(16,185,129,0.14)' }}>
                <ShieldCheck size={18} color="#10B981" />
              </div>
              <div className="domus-chip-text">
                <small>RESERVAS & PLANTA</small>
                <strong>Agua 100% · Diésel 98%</strong>
              </div>
            </div>

            <div className="domus-stat-chip">
              <div className="domus-chip-icon" style={{ background: 'rgba(190,122,198,0.16)' }}>
                <Calendar size={18} color="#BE7AC6" />
              </div>
              <div className="domus-chip-text">
                <small>FECHA OPERATIVA</small>
                <strong>{formatDate(time)}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            1. PRIMERO: BOTONES GRANDES (6 DEPARTAMENTOS EN 3x2)
            ========================================== */}
        <section id="sec-depts" className="domus-block">
          <div className="domus-block-header">
            <div className="domus-section-head-left">
              <span className="domus-dot-indicator" style={{ background: '#5E7AC6' }}></span>
              <div>
                <h2 className="domus-block-title">Gestión por Departamentos</h2>
                <p className="domus-block-sub">Toque cualquier área para inspeccionar el estado en tiempo real</p>
              </div>
            </div>
            <span className="domus-live-badge">
              <i></i> 6 MÓDULOS SINCRONIZADOS
            </span>
          </div>

          <div className="domus-dept-grid">
            {departments.map((area) => (
              <DepartmentCard
                key={area.id}
                area={area}
                onSelect={(item) => {
                  if (item.id === 'cocina') {
                    setInventoryModalTab('STOCK');
                  } else if (item.id === 'personal') {
                    setStaffModalTab('DIRECTORIO');
                  } else if (item.id === 'cuidados') {
                    setNursingModalTab('SIGNOS');
                  } else {
                    setSelectedModal(item);
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* ==========================================
            2. SEGUNDO: BOTONES DE ACCIONES RÁPIDAS (SIN RECORTES)
            ========================================== */}
        <section id="sec-bitacora" className="domus-block">
          <div className="domus-block-header">
            <div className="domus-section-head-left">
              <span className="domus-dot-indicator" style={{ background: '#EE6B5F' }}></span>
              <div>
                <h2 className="domus-block-title">Acciones Rápidas del Ama de Llaves</h2>
                <p className="domus-block-sub">Registros directos para administración, cocina, garita y mantenimiento</p>
              </div>
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
              subtext="Inventario y lista de compras"
              icon={ShoppingBag}
              accent="#EE6B5F"
              onClick={() => setInventoryModalTab('ORDEN')}
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
              onClick={() => setSelectedModal(departments[3])}
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
              onClick={() => setSelectedModal(departments[2])}
            />
          </div>
        </section>

        {/* ==========================================
            3. TERCERO: DASHBOARD ANALÍTICO CON MOCK DATA COMPLETO
            ========================================== */}
        <section className="domus-block">
          <div className="domus-block-header">
            <div className="domus-section-head-left">
              <span className="domus-dot-indicator" style={{ background: '#5E7AC6' }}></span>
              <div>
                <h2 className="domus-block-title">Métricas y Monitoreo en Tiempo Real</h2>
                <p className="domus-block-sub">Auditoría de alacena, signos vitales del Dr. Jiménez, personal y alertas</p>
              </div>
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

            {/* WIDGET 3: CARGA OPERATIVA + CENTRO DE ALERTAS CON SELLO DE AGUA SUTIL */}
            <div className="domus-glass-panel domus-panel-accent">
              <img src={STANDALONE_LOGO_URL} alt="" className="domus-accent-panel-watermark" />

              <div className="domus-panel-head" style={{ position: 'relative', zIndex: 2 }}>
                <div>
                  <h3 style={{ color: '#fff' }}>Centro de Control y Alertas</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)' }}>TOQUE PARA MARCAR RESUELTA</p>
                </div>
                <span className="domus-alert-count">
                  {resolvedAlerts.filter(Boolean).length}/3 Resueltas
                </span>
              </div>

              <div className="domus-alerts-stack" style={{ position: 'relative', zIndex: 2 }}>
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

              <div className="domus-staff-bar" style={{ position: 'relative', zIndex: 2 }}>
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

      <InventoryModal
        isOpen={Boolean(inventoryModalTab)}
        initialTab={inventoryModalTab || 'STOCK'}
        onClose={() => setInventoryModalTab(null)}
      />

      <StaffModal
        isOpen={Boolean(staffModalTab)}
        initialTab={staffModalTab || 'DIRECTORIO'}
        onClose={() => setStaffModalTab(null)}
      />

      <NursingModal
        isOpen={Boolean(nursingModalTab)}
        initialTab={nursingModalTab || 'SIGNOS'}
        onClose={() => setNursingModalTab(null)}
      />

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
          width: 100%;
          max-width: 100vw;
          background-color: #F0F0F2;
          color: #202020;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        /* SPLASH SCREEN PAUSADO (2.8s) */
        .domus-splash {
          position: fixed; inset: 0; z-index: 200;
          background: radial-gradient(circle at center, #FFFFFF 0%, #E8ECF7 100%);
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.9s ease;
        }
        .domus-splash-hide {
          opacity: 0; visibility: hidden; pointer-events: none;
        }
        .domus-splash-box {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          animation: domusSplashCeremony 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .domus-splash-ring {
          width: 124px; height: 124px; border-radius: 36px;
          background: rgba(255, 255, 255, 0.85);
          border: 2px solid rgba(94, 122, 198, 0.25);
          box-shadow: 0 24px 60px rgba(94, 122, 198, 0.28);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .domus-splash-logo {
          width: 78px; height: 78px; object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(94, 122, 198, 0.3));
        }
        .domus-splash-box strong {
          font-size: 24px; font-weight: 900; letter-spacing: 0.22em; color: #202020;
        }
        .domus-splash-box span {
          font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #5E7AC6;
        }
        @keyframes domusSplashCeremony {
          0% { transform: scale(0.84) translateY(12px); opacity: 0; }
          22% { transform: scale(1) translateY(0); opacity: 1; }
          80% { transform: scale(1.03) translateY(0); opacity: 1; }
          100% { transform: scale(1.1) translateY(-6px); opacity: 0; }
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

        /* NAVBAR SUPERIOR SIN RECORTE EN MÓVIL NI ESCRITORIO */
        .domus-navbar {
          position: sticky; top: 0; z-index: 50;
          width: 100%; box-sizing: border-box;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 32px rgba(32, 32, 32, 0.04);
        }
        .domus-navbar-inner {
          max-width: 1540px; margin: 0 auto;
          padding: 8px 12px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .domus-navbar-inner { padding: 10px 28px; gap: 20px; }
        }

        .domus-brand-left {
          display: flex; align-items: center; cursor: pointer;
          flex-shrink: 1; min-width: 0;
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-brand-left:hover { transform: scale(1.03); }

        .domus-header-logo-img {
          height: 46px;
          width: auto;
          max-width: 48vw;
          object-fit: contain;
          object-position: left center;
          margin-left: 8px;
          filter: drop-shadow(0 3px 8px rgba(94, 122, 198, 0.16));
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .domus-header-logo-img {
            height: 62px;
            max-width: 320px;
            margin-left: 6px;
          }
        }

        /* Ocultamos las pestañas superiores para usar la Isla Flotante en todas las pantallas */
        .domus-nav-tabs {
          display: none !important;
        }
        .domus-nav-tab {
          border: none; background: transparent; cursor: pointer;
          padding: 9px 18px; border-radius: 99px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.08em; color: #555;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-nav-tab:hover { color: #5E7AC6; background: rgba(255, 255, 255, 0.8); }
        .domus-nav-tab.active {
          background: #5E7AC6; color: #fff;
          box-shadow: 0 6px 18px rgba(94, 122, 198, 0.4);
        }

        .domus-nav-right {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .domus-nav-right { gap: 10px; }
        }

        .domus-fullscreen-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: rgba(94, 122, 198, 0.12);
          border: 1px solid rgba(94, 122, 198, 0.25);
          color: #5E7AC6;
          padding: 8px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 800; cursor: pointer;
          transition: all 0.25s ease;
        }
        .domus-fullscreen-btn:hover {
          background: #5E7AC6; color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(94, 122, 198, 0.3);
        }
        .domus-fs-label { display: none; }
        @media (min-width: 900px) {
          .domus-fs-label { display: inline; }
          .domus-fullscreen-btn { padding: 8px 14px; }
        }

        .domus-clock-pill {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.95);
          padding: 7px 10px; border-radius: 99px;
          font-size: 11.5px; font-weight: 900; color: #202020;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        }
        @media (min-width: 768px) {
          .domus-clock-pill { padding: 8px 15px; font-size: 13px; gap: 8px; }
        }

        .domus-profile-pill {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.95);
          padding: 3px; border-radius: 99px;
          cursor: pointer; transition: all 0.25s ease;
        }
        @media (min-width: 640px) {
          .domus-profile-pill { padding: 4px 14px 4px 5px; }
        }
        .domus-profile-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(94, 122, 198, 0.2);
        }
        .domus-avatar-circle {
          position: relative;
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #5E7AC6 0%, #EE6B5F 100%);
          color: #fff; font-size: 11px; font-weight: 900; letter-spacing: 0.04em;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(94, 122, 198, 0.35);
        }
        .domus-avatar-status {
          position: absolute; bottom: 0; right: 0;
          width: 9px; height: 9px; border-radius: 50%;
          background: #10B981; border: 2px solid #fff;
        }
        /* En móvil se oculta el texto de 2 líneas del avatar para que el header jamás se corte */
        .domus-profile-text {
          display: none; flex-direction: column; line-height: 1.05;
        }
        @media (min-width: 640px) {
          .domus-profile-text { display: flex; }
        }
        .domus-profile-text strong { font-size: 12px; font-weight: 800; color: #202020; white-space: nowrap; }
        .domus-profile-text small { font-size: 9px; font-weight: 700; color: #5E7AC6; text-transform: uppercase; white-space: nowrap; }

        /* BARRA INFERIOR ANCLADA EN MÓVIL (BOTTOM DOCK) */
        .domus-mobile-bottom-nav {
          position: fixed;
          bottom: 14px; left: 12px; right: 12px;
          z-index: 95;
          display: flex; align-items: center; justify-content: space-around;
          padding: 8px 8px;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(30px) saturate(200%);
          -webkit-backdrop-filter: blur(30px) saturate(200%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 28px;
          box-shadow: 0 18px 45px rgba(32, 32, 48, 0.18);
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (min-width: 768px) {
          .domus-mobile-bottom-nav {
            left: 50%; right: auto;
            transform: translateX(-50%);
            bottom: 22px;
            width: auto; min-width: 620px;
            padding: 8px 14px;
            border-radius: 99px;
            gap: 8px;
          }
        }
        .domus-mobile-nav-item {
          flex: 1;
          border: none; background: transparent;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; padding: 6px 6px; border-radius: 18px;
          color: #555; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (min-width: 768px) {
          .domus-mobile-nav-item {
            flex-direction: row;
            gap: 8px; padding: 8px 16px;
            border-radius: 99px;
          }
          .domus-mobile-nav-item:hover {
            background: rgba(94, 122, 198, 0.1);
            color: #5E7AC6;
          }
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
          padding: 18px 14px 110px;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .domus-main { padding: 28px 28px 60px; }
        }

        /* HERO GREETING BAR + 4 PÍLDORAS DE TAMAÑO IDÉNTICO */
        .domus-hero-bar {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: space-between; gap: 24px;
          margin-bottom: 38px; padding: 22px 18px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.52);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 16px 40px rgba(32, 32, 32, 0.05);
          transition: all 0.3s ease;
          scroll-margin-top: 90px;
        }
        @media (min-width: 768px) {
          .domus-hero-bar { padding: 30px 34px; }
        }
        @media (min-width: 1100px) {
          .domus-hero-bar { flex-direction: row; align-items: center; }
        }
        .domus-hero-bar:hover {
          background: rgba(255, 255, 255, 0.65);
          box-shadow: 0 20px 50px rgba(94, 122, 198, 0.15);
        }
        .domus-hero-watermark {
          position: absolute; right: 32%; bottom: -45px;
          width: 220px; height: 220px; object-fit: contain;
          opacity: 0.055; pointer-events: none;
          transform: rotate(-10deg);
          transition: transform 0.6s ease, opacity 0.6s ease;
        }
        .domus-hero-bar:hover .domus-hero-watermark {
          transform: rotate(0deg) scale(1.06); opacity: 0.09;
        }

        .domus-hero-greeting {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; gap: 10px;
        }
        .domus-eyebrow {
          display: flex; flex-direction: column; gap: 3px;
        }
        .domus-eyebrow span {
          font-size: 10.5px; font-weight: 900; letter-spacing: 0.13em; color: #5E7AC6;
        }
        .domus-eyebrow small {
          font-size: 9.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080;
        }
        .domus-main-title {
          font-size: clamp(26px, 3.8vw, 46px); font-weight: 900; letter-spacing: -0.04em;
          margin: 0; color: #202020; line-height: 1.05;
          transition: color 0.25s ease, transform 0.25s ease;
          cursor: default;
        }
        .domus-main-title:hover {
          color: #5E7AC6; transform: translateX(4px);
        }

        /* CUADRÍCULA 2x2 DE 4 PÍLDORAS DE IDÉNTICO TAMAÑO */
        .domus-hero-pills-grid {
          position: relative; z-index: 2;
          display: grid;
          grid-template-columns: 1fr;
          grid-auto-rows: 1fr;
          gap: 12px;
          width: 100%;
        }
        @media (min-width: 600px) {
          .domus-hero-pills-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1100px) {
          .domus-hero-pills-grid {
            width: 560px;
            flex-shrink: 0;
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .domus-stat-chip {
          display: flex; align-items: center; gap: 12px;
          height: 68px; width: 100%; box-sizing: border-box;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.96);
          padding: 12px 16px; border-radius: 20px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
        }
        .domus-stat-chip:hover {
          transform: translateY(-4px) scale(1.02);
          background: #fff;
          box-shadow: 0 14px 28px rgba(94, 122, 198, 0.22);
        }
        .domus-stat-chip:active { transform: scale(0.97); }
        .domus-chip-icon {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .domus-chip-text {
          display: flex; flex-direction: column; min-width: 0;
        }
        .domus-chip-text small {
          font-size: 9px; font-weight: 800; letter-spacing: 0.09em; color: #808080;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .domus-chip-text strong {
          font-size: 12.5px; font-weight: 900; color: #202020;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* BLOQUES DE SECCIÓN LIMPIOS */
        .domus-block { margin-bottom: 44px; scroll-margin-top: 90px; }
        .domus-block-header {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
          gap: 12px; margin-bottom: 20px; padding: 0 4px;
        }
        .domus-section-head-left {
          display: flex; align-items: center; gap: 12px;
        }
        .domus-dot-indicator {
          width: 10px; height: 10px; border-radius: 50%;
          box-shadow: 0 0 12px currentColor; flex-shrink: 0;
        }
        .domus-block-title {
          font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em;
          color: #202020; margin: 0;
          cursor: pointer; transition: transform 0.25s ease, color 0.25s ease;
        }
        .domus-block-title:hover { transform: translateX(4px); color: #5E7AC6; }
        .domus-block-sub {
          font-size: 12px; font-weight: 600; color: #666; margin: 2px 0 0 0;
        }
        .domus-live-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255, 255, 255, 0.75); border: 1px solid #fff;
          padding: 6px 14px; border-radius: 99px;
          font-size: 10px; font-weight: 900; letter-spacing: 0.1em; color: #5E7AC6;
        }
        .domus-live-badge i {
          width: 8px; height: 8px; border-radius: 50%; background: #10B981;
          box-shadow: 0 0 8px #10B981; animation: domusBlink 1.5s infinite;
        }
        @keyframes domusBlink { 50% { opacity: 0.4; } }

        /* 1. GRID DE 6 DEPARTAMENTOS (3 COLUMNAS x 2 FILAS EN ESCRITORIO) */
        .domus-dept-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .domus-dept-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .domus-dept-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }

        .domus-dept-wrapper {
          position: relative; height: 340px; cursor: pointer;
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
          padding: 22px; box-sizing: border-box;
        }
        .domus-dept-bg {
          position: absolute; inset: 0; background-size: cover; background-position: center;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-dept-wrapper:hover .domus-dept-bg { transform: scale(1.1); }

        /* Vidrio esmerilado permanente sobre cada imagen que se despeja e ilumina al hacer hover */
        .domus-dept-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.82) 100%);
          backdrop-filter: blur(3.5px) saturate(140%);
          -webkit-backdrop-filter: blur(3.5px) saturate(140%);
          transition: all 0.4s ease;
        }
        .domus-dept-frost {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(94, 122, 198, 0.22) 0%, rgba(20, 24, 40, 0.85) 100%);
          backdrop-filter: blur(8px) saturate(180%);
          -webkit-backdrop-filter: blur(8px) saturate(180%);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .domus-dept-wrapper:hover .domus-dept-frost { opacity: 1; }

        .domus-dept-top {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
        }
        .domus-dept-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(12px);
          padding: 6px 13px; border-radius: 99px;
          font-size: 10px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;
          color: #202020; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .domus-dept-tag i { width: 8px; height: 8px; border-radius: 50%; }

        .domus-dept-svg-badge {
          width: 44px; height: 44px; border-radius: 15px;
          background: rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(18px) saturate(190%);
          -webkit-backdrop-filter: blur(18px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.65);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.6);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .domus-dept-wrapper:hover .domus-dept-svg-badge {
          background: var(--dept-accent);
          border-color: #fff;
          transform: scale(1.1) rotate(-6deg);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
        }
        .domus-dept-svg-icon {
          width: 22px; height: 22px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .domus-dept-bottom {
          position: relative; z-index: 2; color: #fff;
          display: flex; flex-direction: column; gap: 10px;
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(22px) saturate(190%);
          -webkit-backdrop-filter: blur(22px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.52);
          border-radius: 22px;
          padding: 16px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.55);
          transition: all 0.3s ease;
        }
        .domus-dept-wrapper:hover .domus-dept-bottom {
          background: rgba(255, 255, 255, 0.28);
          border-color: rgba(255, 255, 255, 0.85);
        }
        .domus-dept-glass-watermark {
          position: absolute; right: -12px; top: -12px;
          opacity: 0.12; pointer-events: none;
          transform: rotate(12deg);
        }
        .domus-dept-glass-watermark .domus-dept-svg-icon {
          width: 84px; height: 84px;
        }
        .domus-dept-title {
          font-size: 24px; font-weight: 900; letter-spacing: -0.03em;
          margin: 0; line-height: 1.1; color: #fff;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          transition: transform 0.25s ease;
        }
        .domus-dept-wrapper:hover .domus-dept-title {
          transform: translateY(-2px);
        }
        .domus-dept-desc {
          font-size: 12px; line-height: 1.4; color: rgba(255, 255, 255, 0.86);
          margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .domus-dept-stat-pill {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255, 255, 255, 0.16); backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 9px 14px; border-radius: 14px; font-size: 11.5px;
        }
        .domus-dept-stat-pill span { color: rgba(255, 255, 255, 0.85); font-weight: 700; }
        .domus-dept-stat-pill strong { color: #fff; font-weight: 900; }

        .domus-dept-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255, 255, 255, 0.95); color: #202020;
          padding: 12px; border-radius: 14px;
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
          position: relative; width: 100%; box-sizing: border-box;
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
          position: relative; overflow: hidden;
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
        .domus-accent-panel-watermark {
          position: absolute; right: -25px; bottom: -25px;
          width: 190px; height: 190px; object-fit: contain;
          opacity: 0.12; filter: brightness(2.2); pointer-events: none;
          transition: transform 0.6s ease;
        }
        .domus-panel-accent:hover .domus-accent-panel-watermark {
          transform: scale(1.1) rotate(8deg);
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

        /* DONA SVG */
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
          font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
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
        @media (min-width: 1180px) {
          .domus-footer { padding: 20px 28px; }
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