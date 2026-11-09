import React, { useState, useMemo } from 'react';
import {
  X, Wrench, Droplets, Thermometer, ShieldCheck, AlertCircle,
  CheckCircle2, Clock, RotateCw, Plus, Minus, Check, Send,
  Layers, Search, Calendar, Phone, Settings, Activity, Delete,
  Sparkles, Bell, ClipboardCheck
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

// ==========================================
// 1. ARQUITECTURA EN CASCADA (NIVEL 1 Y NIVEL 2)
// ==========================================
const MAINTENANCE_CATEGORIES = [
  {
    id: 'Energía',
    title: 'Energía & Planta Eléctrica',
    subtitle: 'Generador, Diésel, ATS y UPS',
    accent: '#EE6B5F',
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Todo Energía', icon: '⚡' },
      { id: 'OPTIMO', name: 'En Línea / 100% OK', icon: '🟢' },
      { id: 'PREVENTIVO', name: 'Mantenimiento Próximo', icon: '🔧' }
    ]
  },
  {
    id: 'Agua',
    title: 'Agua & Hidroneumático',
    subtitle: 'Cisterna 80,000L, Bombas y Ósmosis',
    accent: '#5E7AC6',
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Todo el Sistema Hídrico', icon: '💧' },
      { id: 'OPTIMO', name: 'Presión y Nivel OK', icon: '🟢' },
      { id: 'FILTROS', name: 'Purga y Filtración', icon: '🧪' }
    ]
  },
  {
    id: 'Climatización',
    title: 'Climatización & Cadena de Frío',
    subtitle: 'Chillers, Splits Suites y Cavas',
    accent: '#10B981',
    img: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Todos los Equipos', icon: '❄️' },
      { id: 'SUITES', name: 'Clima Residencial', icon: '🛏️' },
      { id: 'CAVAS', name: 'Cavas y Congeladores', icon: '🧊' },
      { id: 'PREVENTIVO', name: 'Revisión Programada', icon: '⚠️' }
    ]
  },
  {
    id: 'Exteriores',
    title: 'Piscina, Jardines & Exteriores',
    subtitle: 'Química de Agua, Riego e Iluminación',
    accent: '#BE7AC6',
    img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Todo Exteriores', icon: '🌿' },
      { id: 'PISCINA', name: 'Piscina Climatizada', icon: '🏊' },
      { id: 'JARDIN', name: 'Riego y Paisajismo', icon: '🌺' }
    ]
  }
];

const CHECK_CHIPS_OPTIONS = [
  'Modo Automático',
  'Sin Fugas',
  'Presión Estable',
  'Filtros Limpios',
  'Batería 100%',
  'Inspección Hoy'
];

// ==========================================
// 2. EQUIPOS CRÍTICOS CON FICHA TÉCNICA 3D EDITABLE
// ==========================================
const INITIAL_EQUIPMENT = [
  // ENERGÍA & PLANTA ELÉCTRICA
  {
    id: 'eq-1',
    category: 'Energía',
    subGroup: 'OPTIMO',
    name: 'Planta Eléctrica Cummins 150 kVA',
    zone: 'Cuarto de Fuerza Exterior · Insonorizado',
    status: '98% DIÉSEL · AUTO',
    statusColor: '#10B981',
    metricVal: 98,
    metricUnit: '% Diésel',
    capacityPct: 98,
    location: 'Caseta Acústica Sur · Tablero ATS 1',
    nextService: '15 Dic 2026 (O a las 1,500 horas de uso)',
    contractor: 'Cummins Venezuela / Ing. Salazar · +58 414-2209182',
    internalResp: 'Carlos Padrón (Jefe de Mantenimiento)',
    checks: ['Modo Automático', 'Sin Fugas', 'Batería 100%', 'Inspección Hoy'],
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'eq-2',
    category: 'Energía',
    subGroup: 'OPTIMO',
    name: 'Tanque Reserva Gasoil (2,500 Litros)',
    zone: 'Depósito Subterráneo Blindado',
    status: '2,450 L DISPONIBLES',
    statusColor: '#10B981',
    metricVal: 2450,
    metricUnit: 'Litros',
    capacityPct: 98,
    location: 'Área Técnica Exterior · Válvula Doble Seguridad',
    nextService: 'Filtro separador agua/diésel purgado ayer',
    contractor: 'Suministros Energéticos VIP · +58 412-9004433',
    internalResp: 'Carlos Padrón / Supervisión Garita',
    checks: ['Sin Fugas', 'Filtros Limpios', 'Inspección Hoy'],
    img: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'eq-3',
    category: 'Energía',
    subGroup: 'OPTIMO',
    name: 'Banco UPS Médico & Suite Principal',
    zone: 'Respaldo Cero-Corte (Equipos Dr. Jiménez)',
    status: '100% CARGA · ONLINE',
    statusColor: '#10B981',
    metricVal: 100,
    metricUnit: '% Carga',
    capacityPct: 100,
    location: 'Clóset Técnico Planta Alta · Doble Conversión',
    nextService: '20 Ene 2027 · Baterías de Litio Ciclo Profundo',
    contractor: 'ElectroMed Sistemas · +58 414-3098871',
    internalResp: 'Carlos Padrón',
    checks: ['Modo Automático', 'Batería 100%', 'Inspección Hoy'],
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600'
  },

  // AGUA & HIDRONEUMÁTICO
  {
    id: 'eq-4',
    category: 'Agua',
    subGroup: 'OPTIMO',
    name: 'Tanque Subterráneo Principal (80,000 L)',
    zone: 'Cisterna Matriz · Autonomía 30 Días',
    status: '100% CAPACIDAD',
    statusColor: '#10B981',
    metricVal: 100,
    metricUnit: '% Nivel',
    capacityPct: 100,
    location: 'Subsuelo Jardín Norte · Sensor Ultrasónico Activo',
    nextService: 'Lavado y desinfección semestral al día',
    contractor: 'HidroSistemas Caracas · +58 424-1804422',
    internalResp: 'Carlos Padrón',
    checks: ['Modo Automático', 'Sin Fugas', 'Inspección Hoy'],
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'eq-5',
    category: 'Agua',
    subGroup: 'OPTIMO',
    name: 'Sistema Hidroneumático (Bombas Gemelas)',
    zone: 'Sala de Bombas · Alternancia Automática',
    status: '65 PSI · ESTABLE',
    statusColor: '#5E7AC6',
    metricVal: 65,
    metricUnit: 'PSI',
    capacityPct: 92,
    location: 'Cuarto Hidráulico Sótano · Bombas Grundfos 5HP',
    nextService: '10 Dic 2026 · Calibración de pulmón de aire',
    contractor: 'HidroSistemas Caracas · +58 424-1804422',
    internalResp: 'Carlos Padrón',
    checks: ['Modo Automático', 'Presión Estable', 'Sin Fugas'],
    img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'eq-6',
    category: 'Agua',
    subGroup: 'FILTROS',
    name: 'Planta de Filtración, Pasteur y Lámpara UV',
    zone: 'Potabilización Integral de la Casa y Cocina',
    status: 'PURGA PROGRAMADA HOY',
    statusColor: '#EE6B5F',
    metricVal: 82,
    metricUnit: '% Vida Filtro',
    capacityPct: 82,
    location: 'Entrada Principal de Agua y Bajo-Tope Cocina',
    nextService: 'Hoy 02:00 PM: Retrolavado de filtro de sedimento y carbón',
    contractor: 'AquaPure Venezuela · +58 414-9110022',
    internalResp: 'Carlos Padrón',
    checks: ['Presión Estable', 'Sin Fugas'],
    img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=600'
  },

  // CLIMATIZACIÓN & CADENA DE FRÍO
  {
    id: 'eq-7',
    category: 'Climatización',
    subGroup: 'PREVENTIVO',
    name: 'Chiller Central & UMA Áreas Sociales',
    zone: 'Salón Principal, Biblioteca y Comedor',
    status: 'REVISIÓN JUEVES 10AM',
    statusColor: '#EE6B5F',
    metricVal: 22,
    metricUnit: '°C Clima',
    capacityPct: 78,
    location: 'Terraza Técnica Techo · Unidad Carrier Inverter',
    nextService: 'Jueves 10:00 AM · Limpieza de serpentines y lectura de gas',
    contractor: 'ClimaTech C.A. / Ing. Roberto Salazar · +58 414-8821900',
    internalResp: 'Carlos Padrón',
    checks: ['Modo Automático', 'Filtros Limpios'],
    img: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'eq-8',
    category: 'Climatización',
    subGroup: 'SUITES',
    name: 'Climatización Silenciosa Suite Dr. Jiménez',
    zone: 'Suite Principal · Filtro HEPA Antibacterial',
    status: '22.0°C · SILENCIOSO',
    statusColor: '#10B981',
    metricVal: 22,
    metricUnit: '°C Suite',
    capacityPct: 100,
    location: 'Ala Principal · Unidad Daikin Ultra-Quiet',
    nextService: 'Filtro HEPA sanitizado esta semana',
    contractor: 'ClimaTech C.A. · +58 414-8821900',
    internalResp: 'Carlos Padrón / Elena Castillo',
    checks: ['Modo Automático', 'Filtros Limpios', 'Inspección Hoy'],
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'eq-9',
    category: 'Climatización',
    subGroup: 'CAVAS',
    name: 'Cavas Cuarto Frío & Congeladores Cocina',
    zone: 'Resguardo de Proteínas y Alacena Fría',
    status: '-18°C / +3°C · ÓPTIMO',
    statusColor: '#10B981',
    metricVal: -18,
    metricUnit: '°C Congelador',
    capacityPct: 96,
    location: 'Zona de Despensa Cocina · Termómetro Digital Externo',
    nextService: 'Empacaduras magnéticas y compresor verificados',
    contractor: 'FrigoServicio Industrial · +58 412-5543210',
    internalResp: 'Carlos Padrón / Chef Jesús Sequea',
    checks: ['Modo Automático', 'Presión Estable', 'Inspección Hoy'],
    img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=600'
  },

  // EXTERIORES, PISCINA & JARDINES
  {
    id: 'eq-10',
    category: 'Exteriores',
    subGroup: 'PISCINA',
    name: 'Piscina Climatizada & Espejos de Agua',
    zone: 'Terraza Jardín · Bomba de Calor y Clorador Salino',
    status: 'pH 7.4 · 28°C LISTA',
    statusColor: '#10B981',
    metricVal: 7.4,
    metricUnit: 'pH Agua',
    capacityPct: 95,
    location: 'Cuarto de Bombas Piscina · Terraza Sur',
    nextService: 'Aspirado y balance químico realizado hoy 07:30 AM',
    contractor: 'Piscinas & Spa Miranda · +58 414-7012288',
    internalResp: 'José Gregorio Tovar (Jardinería y Piscina)',
    checks: ['Modo Automático', 'Filtros Limpios', 'Inspección Hoy'],
    img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'eq-11',
    category: 'Exteriores',
    subGroup: 'JARDIN',
    name: 'Sistema de Riego Automatizado y Paisajismo',
    zone: '6 Zonas de Aspersión y Goteo · Jardín y Huerto',
    status: 'CICLO 05:30 AM OK',
    statusColor: '#5E7AC6',
    metricVal: 100,
    metricUnit: '% Aspersores',
    capacityPct: 94,
    location: 'Centralita RainBird en Jardín Principal',
    nextService: 'Poda de árboles y fertilización de orquídeas al día',
    contractor: 'Vivero & Paisajismo Roquedal',
    internalResp: 'José Gregorio Tovar',
    checks: ['Modo Automático', 'Sin Fugas', 'Presión Estable'],
    img: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80&w=600'
  }
];

const INITIAL_TICKETS = [
  {
    id: 'mt-1',
    title: 'Purga quincenal de filtros de sedimento y revisión de manómetro (65 PSI)',
    equipment: 'Planta de Filtración y Lámpara UV',
    assignedTo: 'Carlos Padrón (Interno)',
    scheduled: 'Hoy · 02:00 PM',
    priority: 'ALTA',
    done: false
  },
  {
    id: 'mt-2',
    title: 'Mantenimiento preventivo trimestral de Chiller Central y limpieza de condensadores',
    equipment: 'Chiller Central & UMA Áreas Sociales',
    assignedTo: 'Ing. Roberto Salazar (ClimaTech C.A.) · Acompaña Carlos Padrón',
    scheduled: 'Jueves · 10:00 AM',
    priority: 'PROGRAMADO',
    done: false
  },
  {
    id: 'mt-3',
    title: 'Prueba automática semanal de arranque en vacío de Planta Eléctrica (15 min)',
    equipment: 'Planta Eléctrica Cummins 150 kVA',
    assignedTo: 'Carlos Padrón',
    scheduled: 'Completado Hoy · 08:00 AM',
    priority: 'NORMAL',
    done: true
  },
  {
    id: 'mt-4',
    title: 'Medición de pH (7.4), nivel de sal y retrolavado de filtro de arena de piscina',
    equipment: 'Piscina Climatizada & Espejos de Agua',
    assignedTo: 'José Gregorio Tovar',
    scheduled: 'Completado Hoy · 07:30 AM',
    priority: 'NORMAL',
    done: true
  }
];

const INITIAL_LOGS = [
  { id: 'ml-1', type: 'Prueba de Planta OK', item: 'Planta Eléctrica Cummins 150 kVA', detail: 'Nivel Diésel: 98% (2,450 L) · Tensión 220V estable · Batería 27.4V', time: '08:05 AM', color: '#10B981' },
  { id: 'ml-2', type: 'Lectura Hidroneumático', item: 'Sistema Hidroneumático Gemelo', detail: 'Presión constante en 65 PSI · Cisterna al 100% (80,000 L)', time: '07:45 AM', color: '#5E7AC6' },
  { id: 'ml-3', type: 'Química de Piscina', item: 'Piscina Climatizada', detail: 'pH calibrado en 7.4 · Temperatura 28°C · Clorador salino activo', time: '07:30 AM', color: '#BE7AC6' }
];

export default function MaintenanceModal({ isOpen, onClose, initialCategory = 'Energía' }) {
  const [activeTab, setActiveTab] = useState('EXPLORADOR');
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Estado Progressive Disclosure (Nivel 1 -> Nivel 2 -> Nivel 3)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubfilter, setSelectedSubfilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado Giro 3D (Flip Card)
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [savedToastId, setSavedToastId] = useState(null);

  // Estado del Modal Flotante (Numpad de Telemetría o Creador de Ticket de Falla)
  const [modalConfig, setModalConfig] = useState(null); // { item, mode: 'LECTURA' | 'TICKET' }
  const [numpadVal, setNumpadVal] = useState('');
  const [numpadUnit, setNumpadUnit] = useState('%');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('ALTA');
  const [ticketTech, setTicketTech] = useState('Carlos Padrón (Revisión Interna)');
  const [notifyGateForTech, setNotifyGateForTech] = useState(true);

  // Gaveta Rápida para Añadir Nuevo Equipo
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newEqName, setNewEqName] = useState('');
  const [newEqZone, setNewEqZone] = useState('');
  const [newEqContractor, setNewEqContractor] = useState('');
  const [newEqMetric, setNewEqMetric] = useState('100');
  const [newEqUnit, setNewEqUnit] = useState('%');

  const activeCategoryObj = useMemo(
    () => MAINTENANCE_CATEGORIES.find((c) => c.id === selectedCategory) || MAINTENANCE_CATEGORIES[0],
    [selectedCategory]
  );

  const openTicketsCount = useMemo(() => tickets.filter((t) => !t.done).length, [tickets]);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubfilter('TODOS');
    setFlippedCardId(null);
  };

  // Filtrado Nivel 3
  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          eq.name.toLowerCase().includes(q) ||
          eq.zone.toLowerCase().includes(q) ||
          eq.contractor.toLowerCase().includes(q) ||
          eq.internalResp.toLowerCase().includes(q)
        );
      }
      const matchCat = eq.category === selectedCategory;
      const matchSub = selectedSubfilter === 'TODOS' || eq.subGroup === selectedSubfilter;
      return matchCat && matchSub;
    });
  }, [equipment, selectedCategory, selectedSubfilter, searchQuery]);

  // Actualizar campos en vivo en el reverso de la tarjeta 3D
  const updateEquipmentField = (id, field, value) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, [field]: value } : eq))
    );
  };

  const toggleEquipmentCheck = (e, id, checkLabel) => {
    e.stopPropagation();
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== id) return eq;
        const exists = eq.checks.includes(checkLabel);
        const nextChecks = exists
          ? eq.checks.filter((c) => c !== checkLabel)
          : [...eq.checks, checkLabel];
        return { ...eq, checks: nextChecks };
      })
    );
  };

  const handleSaveCard = (e, id) => {
    e.stopPropagation();
    setSavedToastId(id);
    setTimeout(() => {
      setSavedToastId(null);
      setFlippedCardId(null);
    }, 850);
  };

  // Abrir el Numpad de Telemetría o el Despachador de Ticket Técnico
  const openActionModal = (e, item, mode) => {
    e.stopPropagation();
    setModalConfig({ item, mode });
    if (mode === 'LECTURA') {
      setNumpadVal(String(item.metricVal));
      setNumpadUnit(item.metricUnit);
    } else {
      setTicketDesc('');
      setTicketPriority('ALTA');
      setTicketTech(item.contractor);
      setNotifyGateForTech(true);
    }
  };

  const handleNumpadKey = (key) => {
    if (key === 'CLEAR') {
      setNumpadVal('');
      return;
    }
    if (key === 'BACK') {
      setNumpadVal((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.' && numpadVal.includes('.')) return;
    if (key === '-' && numpadVal.length === 0) {
      setNumpadVal('-');
      return;
    }
    if (numpadVal.length >= 6) return;
    setNumpadVal((prev) => `${prev}${key}`);
  };

  const handleConfirmAction = () => {
    if (!modalConfig) return;
    const { item, mode } = modalConfig;

    if (mode === 'LECTURA') {
      const parsed = parseFloat(numpadVal);
      if (isNaN(parsed)) return;

      const isAlert =
        (numpadUnit.includes('%') && parsed < 40) ||
        (numpadUnit === 'PSI' && (parsed < 45 || parsed > 85));

      setEquipment((prev) =>
        prev.map((eq) =>
          eq.id === item.id
            ? {
                ...eq,
                metricVal: parsed,
                metricUnit: numpadUnit,
                status: `${parsed} ${numpadUnit.toUpperCase()} · AUDITADO`,
                statusColor: isAlert ? '#EE6B5F' : '#10B981',
                capacityPct: numpadUnit.includes('%') ? Math.min(100, Math.max(10, parsed)) : eq.capacityPct
              }
            : eq
        )
      );

      setLogs((prev) => [
        {
          id: `ml-${Date.now()}`,
          type: 'Lectura de Telemetría',
          item: item.name,
          detail: `Valor registrado en campo: ${parsed} ${numpadUnit} · Verificado por ${item.internalResp}`,
          time: 'Justo ahora',
          color: isAlert ? '#EE6B5F' : '#10B981'
        },
        ...prev
      ]);
    } else {
      // Crear Ticket de Mantenimiento / Falla
      const desc = ticketDesc.trim() || `Inspección técnica solicitada para ${item.name}`;
      const newTicket = {
        id: `mt-${Date.now()}`,
        title: desc,
        equipment: item.name,
        assignedTo: `${ticketTech}${notifyGateForTech ? ' · Pase enviado a Garita' : ''}`,
        scheduled: 'Hoy · Atención Prioritaria',
        priority: ticketPriority,
        done: false
      };

      setTickets((prev) => [newTicket, ...prev]);
      setEquipment((prev) =>
        prev.map((eq) =>
          eq.id === item.id
            ? { ...eq, status: 'TICKET ABIERTO', statusColor: '#EE6B5F', subGroup: 'PREVENTIVO' }
            : eq
        )
      );

      setLogs((prev) => [
        {
          id: `ml-${Date.now()}`,
          type: 'Ticket Técnico Abierto',
          item: item.name,
          detail: `${desc} · Asignado a: ${ticketTech}`,
          time: 'Justo ahora',
          color: '#EE6B5F'
        },
        ...prev
      ]);
    }

    setModalConfig(null);
    setFlippedCardId(null);
  };

  const toggleTicketDone = (id) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleCreateEquipment = (e) => {
    e.preventDefault();
    if (!newEqName.trim()) return;
    const created = {
      id: `eq-${Date.now()}`,
      category: selectedCategory,
      subGroup: 'OPTIMO',
      name: newEqName.trim(),
      zone: newEqZone.trim() || 'Instalación Casa Roquedal',
      status: `${newEqMetric} ${newEqUnit} · OPERATIVO`,
      statusColor: '#10B981',
      metricVal: parseFloat(newEqMetric) || 100,
      metricUnit: newEqUnit,
      capacityPct: 100,
      location: newEqZone.trim() || 'Cuarto Técnico Principal',
      nextService: 'Mantenimiento preventivo al día',
      contractor: newEqContractor.trim() || 'Servicio Técnico Certificado',
      internalResp: 'Carlos Padrón (Jefe de Mantenimiento)',
      checks: ['Modo Automático', 'Inspección Hoy'],
      img: activeCategoryObj.img
    };

    setEquipment([created, ...equipment]);
    setNewEqName('');
    setNewEqZone('');
    setNewEqContractor('');
    setShowAddDrawer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-mnt-overlay" onClick={onClose}>
      <div className="domus-mnt-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-mnt-watermark" />

        {/* ==========================================
            CABECERA EJECUTIVA DE INGENIERÍA Y MANTENIMIENTO
            ========================================== */}
        <header className="domus-mnt-header">
          <div className="domus-mnt-title-wrap">
            <div className="domus-mnt-eyebrow">
              <Sparkles size={13} color="#EE6B5F" />
              <span>CASA ROQUEDAL · INFRAESTRUCTURA CRÍTICA, PLANTA ELÉCTRICA, AGUA Y CLIMATIZACIÓN</span>
            </div>
            <h2>Centro de Mantenimiento e Ingeniería Residencial</h2>
          </div>

          <div className="domus-mnt-kpis">
            <div className="domus-mnt-kpi">
              <small>AUTONOMÍA CASA</small>
              <strong style={{ color: '#10B981' }}>Agua 100% · Diésel 98%</strong>
            </div>
            <div
              className={`domus-mnt-kpi ${openTicketsCount > 0 ? 'alert' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab('TICKETS')}
            >
              <small>TICKETS TÉCNICOS</small>
              <strong>{openTicketsCount} Pendientes</strong>
            </div>
            <button className="domus-mnt-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
            BARRA DE VISTAS Y BUSCADOR
            ========================================== */}
        <div className="domus-mnt-tabs-bar">
          <div className="domus-mnt-tabs">
            <button
              className={`domus-mnt-tab ${activeTab === 'EXPLORADOR' ? 'active' : ''}`}
              onClick={() => setActiveTab('EXPLORADOR')}
            >
              <Layers size={16} />
              <span>Equipos en Cascada 3D ({equipment.length})</span>
            </button>
            <button
              className={`domus-mnt-tab ${activeTab === 'TICKETS' ? 'active' : ''}`}
              onClick={() => setActiveTab('TICKETS')}
            >
              <Wrench size={16} />
              <span>Tickets y Visitas Técnicas ({openTicketsCount})</span>
              {openTicketsCount > 0 && <i className="domus-mnt-tab-dot"></i>}
            </button>
            <button
              className={`domus-mnt-tab ${activeTab === 'BITACORA' ? 'active' : ''}`}
              onClick={() => setActiveTab('BITACORA')}
            >
              <ClipboardCheck size={16} />
              <span>Bitácora de Telemetría ({logs.length})</span>
            </button>
          </div>

          {activeTab === 'EXPLORADOR' && (
            <div className="domus-mnt-search-row">
              <div className="domus-mnt-search">
                <Search size={15} color="#808080" />
                <input
                  type="text"
                  placeholder="Buscar planta, bomba, chiller, piscina..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="domus-mnt-new-btn"
                onClick={() => setShowAddDrawer(!showAddDrawer)}
              >
                <Plus size={15} />
                <span>Añadir Equipo</span>
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO PRINCIPAL CON PROGRESSIVE DISCLOSURE
            ========================================== */}
        <div className="domus-mnt-body">

          {activeTab === 'EXPLORADOR' && (
            <>
              {/* GAVETA PARA REGISTRAR NUEVO EQUIPO */}
              {showAddDrawer && (
                <form className="domus-mnt-add-drawer" onSubmit={handleCreateEquipment}>
                  <div className="domus-mnt-drawer-head">
                    <div>
                      <span>NUEVA FICHA TÉCNICA EN {selectedCategory.toUpperCase()}</span>
                      <h4>Incorporar Equipo o Sistema al Monitoreo 3D</h4>
                    </div>
                    <button type="button" onClick={() => setShowAddDrawer(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="domus-mnt-drawer-grid">
                    <div>
                      <label>Nombre del Equipo</label>
                      <input
                        type="text"
                        placeholder="Ej. Bomba de Calor Jacuzzi"
                        value={newEqName}
                        onChange={(e) => setNewEqName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Ubicación / Zona</label>
                      <input
                        type="text"
                        placeholder="Ej. Cuarto de Bombas Sur"
                        value={newEqZone}
                        onChange={(e) => setNewEqZone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Empresa / Técnico Contratista</label>
                      <input
                        type="text"
                        placeholder="Ej. ClimaTech · +58 414..."
                        value={newEqContractor}
                        onChange={(e) => setNewEqContractor(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Lectura Inicial</label>
                      <input
                        type="text"
                        value={newEqMetric}
                        onChange={(e) => setNewEqMetric(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Unidad de Medida</label>
                      <select value={newEqUnit} onChange={(e) => setNewEqUnit(e.target.value)}>
                        <option value="%">% Capacidad</option>
                        <option value="PSI">PSI Presión</option>
                        <option value="°C">°C Temperatura</option>
                        <option value="Litros">Litros</option>
                        <option value="pH">pH Agua</option>
                      </select>
                    </div>
                  </div>
                  <div className="domus-mnt-drawer-foot">
                    <button type="submit" className="domus-mnt-save-new">
                      <Check size={15} /> Crear Ficha 3D del Equipo
                    </button>
                  </div>
                </form>
              )}

              {/* ==========================================
                  NIVEL 1: CARRUSEL DE SISTEMAS DE INGENIERÍA
                  ========================================== */}
              <div className="domus-mnt-level">
                <div className="domus-mnt-lvl-head">
                  <span className="domus-mnt-step-badge">NIVEL 1</span>
                  <h3>Sistemas Críticos e Instalaciones de Casa Roquedal</h3>
                </div>

                <div className="domus-mnt-lvl1-carousel">
                  {MAINTENANCE_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id && !searchQuery;
                    const catItems = equipment.filter((e) => e.category === cat.id);
                    const alerts = catItems.filter((e) => e.statusColor === '#EE6B5F').length;

                    return (
                      <div
                        key={cat.id}
                        className={`domus-mnt-lvl1-card ${isSelected ? 'active' : ''}`}
                        style={{ '--cat-accent': cat.accent }}
                        onClick={() => {
                          setSearchQuery('');
                          handleSelectCategory(cat.id);
                        }}
                      >
                        <div className="domus-mnt-lvl1-backlight"></div>
                        <div className="domus-mnt-lvl1-inner">
                          <div
                            className="domus-mnt-lvl1-bg"
                            style={{ backgroundImage: `url('${cat.img}')` }}
                          ></div>
                          <div className="domus-mnt-lvl1-overlay"></div>

                          <div className="domus-mnt-lvl1-top">
                            <span className="domus-mnt-lvl1-sub">{cat.subtitle}</span>
                            {alerts > 0 ? (
                              <span className="domus-mnt-lvl1-alert">{alerts} Preventivo</span>
                            ) : (
                              <span className="domus-mnt-lvl1-ok">100% OK</span>
                            )}
                          </div>

                          <div className="domus-mnt-lvl1-bottom">
                            <h4>{cat.title}</h4>
                            <span>{catItems.length} equipos monitoreados</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ==========================================
                  NIVEL 2: CARRUSEL DE SUB-FILTROS OPERATIVOS
                  ========================================== */}
              {!searchQuery && (
                <div className="domus-mnt-level domus-mnt-lvl2-anim" key={selectedCategory}>
                  <div className="domus-mnt-lvl-head">
                    <span className="domus-mnt-step-badge" style={{ background: activeCategoryObj.accent }}>
                      NIVEL 2
                    </span>
                    <h3>Subsistema de {activeCategoryObj.title}</h3>
                  </div>

                  <div className="domus-mnt-lvl2-carousel">
                    {activeCategoryObj.subfilters.map((sub) => {
                      const isSubActive = selectedSubfilter === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubfilter(sub.id);
                            setFlippedCardId(null);
                          }}
                          className={`domus-mnt-lvl2-pill ${isSubActive ? 'active' : ''}`}
                          style={{ '--sub-accent': activeCategoryObj.accent }}
                        >
                          <div className="domus-mnt-lvl2-icon">{sub.icon}</div>
                          <div className="domus-mnt-lvl2-info">
                            <strong>{sub.name}</strong>
                            <span>Filtrar equipos</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==========================================
                  NIVEL 3: GRILLA DE TARJETAS 3D FLIP (FRENTE + REVERSO TÉCNICO)
                  ========================================== */}
              <div className="domus-mnt-level">
                <div className="domus-mnt-lvl-head">
                  <span className="domus-mnt-step-badge" style={{ background: '#10B981' }}>
                    NIVEL 3
                  </span>
                  <h3>
                    Equipos de {activeCategoryObj.title} ({filteredEquipment.length}) · Toque cualquier tarjeta para girar su ficha técnica 3D
                  </h3>
                </div>

                <div className="domus-mnt-flip-grid">
                  {filteredEquipment.map((item) => {
                    const isFlipped = flippedCardId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`domus-mnt-flip-scene ${isFlipped ? 'is-flipped' : ''}`}
                        style={{ '--card-glow': item.statusColor || activeCategoryObj.accent }}
                        onClick={() => setFlippedCardId(isFlipped ? null : item.id)}
                      >
                        <div className="domus-mnt-flip-backlight"></div>

                        <div className="domus-mnt-flip-inner">
                          {/* ==========================================
                              CARA FRONTAL (TELEMETRÍA EN VIVO + GLASSMORPHISM)
                              ========================================== */}
                          <div className="domus-mnt-face domus-mnt-front">
                            <div
                              className="domus-mnt-front-bg"
                              style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="domus-mnt-front-shade"></div>

                            <div className="domus-mnt-front-top">
                              <span
                                className="domus-mnt-status-pill"
                                style={{ background: item.statusColor }}
                              >
                                {item.status}
                              </span>
                              <span className="domus-mnt-flip-hint">
                                <RotateCw size={13} /> Ficha 3D
                              </span>
                            </div>

                            <div className="domus-mnt-front-glass">
                              <div className="domus-mnt-front-title-row">
                                <div>
                                  <small>{item.zone}</small>
                                  <h4>{item.name}</h4>
                                </div>
                                <div className="domus-mnt-metric-chip">
                                  <strong>{item.metricVal}</strong>
                                  <span>{item.metricUnit}</span>
                                </div>
                              </div>

                              <div className="domus-mnt-front-meta">
                                <span>Próximo servicio: {item.nextService}</span>
                              </div>

                              <div className="domus-mnt-front-bar">
                                <div className="domus-mnt-bar-labels">
                                  <span>Responsable: {item.internalResp.split(' ')[0]}</span>
                                  <span>Operatividad: {item.capacityPct}%</span>
                                </div>
                                <div className="domus-mnt-bar-track">
                                  <div
                                    className="domus-mnt-bar-fill"
                                    style={{
                                      width: `${item.capacityPct}%`,
                                      background: item.statusColor
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ==========================================
                              CARA REVERSO (FICHA DE INGENIERÍA EDITABLE + 2 BOTONES)
                              ========================================== */}
                          <div
                            className="domus-mnt-face domus-mnt-back"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="domus-mnt-back-head">
                              <div>
                                <span>{item.category.toUpperCase()} · FICHA TÉCNICA</span>
                                <h4>{item.name}</h4>
                              </div>
                              <button
                                type="button"
                                className="domus-mnt-unflip-btn"
                                onClick={() => setFlippedCardId(null)}
                              >
                                <RotateCw size={13} /> Frente
                              </button>
                            </div>

                            <div className="domus-mnt-edit-form">
                              <div>
                                <label>Ubicación Técnica y Tablero</label>
                                <input
                                  type="text"
                                  value={item.location}
                                  onChange={(e) => updateEquipmentField(item.id, 'location', e.target.value)}
                                />
                              </div>

                              <div>
                                <label>Próximo Mantenimiento Preventivo</label>
                                <input
                                  type="text"
                                  value={item.nextService}
                                  onChange={(e) => updateEquipmentField(item.id, 'nextService', e.target.value)}
                                />
                              </div>

                              <div className="domus-mnt-row-2">
                                <div>
                                  <label>Contratista Especializado</label>
                                  <input
                                    type="text"
                                    value={item.contractor}
                                    onChange={(e) => updateEquipmentField(item.id, 'contractor', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label>Responsable en Casa</label>
                                  <input
                                    type="text"
                                    value={item.internalResp}
                                    onChange={(e) => updateEquipmentField(item.id, 'internalResp', e.target.value)}
                                  />
                                </div>
                              </div>

                              <div>
                                <label>Verificación de Protocolo Operativo ({item.checks.length}/6)</label>
                                <div className="domus-mnt-chips-wrap">
                                  {CHECK_CHIPS_OPTIONS.map((chk) => {
                                    const active = item.checks.includes(chk);
                                    return (
                                      <button
                                        key={chk}
                                        type="button"
                                        className={`domus-mnt-chip-btn ${active ? 'active' : ''}`}
                                        onClick={(e) => toggleEquipmentCheck(e, item.id, chk)}
                                      >
                                        {active && <Check size={10} />}
                                        <span>{chk}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Dos Botones Independientes de Acción Táctil */}
                            {savedToastId === item.id ? (
                              <div className="domus-mnt-saved-pill">
                                <CheckCircle2 size={15} /> ¡Ficha técnica actualizada!
                              </div>
                            ) : (
                              <div className="domus-mnt-back-actions">
                                <button
                                  type="button"
                                  className="domus-mnt-btn-reading"
                                  onClick={(e) => openActionModal(e, item, 'LECTURA')}
                                >
                                  <Activity size={14} />
                                  <span>[ REGISTRAR LECTURA ]</span>
                                </button>
                                <button
                                  type="button"
                                  className="domus-mnt-btn-ticket"
                                  onClick={(e) => openActionModal(e, item, 'TICKET')}
                                >
                                  <Wrench size={14} />
                                  <span>[ REPORTAR FALLA ]</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* VISTA 2: TABLERO DE TICKETS Y CRONOGRAMA DE TÉCNICOS */}
          {activeTab === 'TICKETS' && (
            <div className="domus-mnt-list-card">
              <div className="domus-mnt-list-head">
                <div>
                  <h3>Órdenes de Servicio y Mantenimiento Preventivo ({tickets.length})</h3>
                  <p>Toque cualquier orden para marcarla como resuelta y actualizar el estado del equipo</p>
                </div>
              </div>

              <div className="domus-mnt-tickets-stack">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className={`domus-mnt-ticket-row ${t.done ? 'done' : ''}`}
                    onClick={() => toggleTicketDone(t.id)}
                  >
                    <div className="domus-mnt-ticket-check">
                      {t.done && <Check size={14} />}
                    </div>
                    <div className="domus-mnt-ticket-body">
                      <div className="domus-mnt-ticket-top">
                        <span className={`domus-mnt-prio ${t.priority.toLowerCase()}`}>
                          {t.priority}
                        </span>
                        <span className="domus-mnt-ticket-time">{t.scheduled}</span>
                      </div>
                      <strong>{t.title}</strong>
                      <small>Equipo: {t.equipment} · Asignado a: {t.assignedTo}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 3: BITÁCORA DE LECTURAS DE PLANTA, AGUA Y CLIMA */}
          {activeTab === 'BITACORA' && (
            <div className="domus-mnt-list-card">
              <div className="domus-mnt-list-head">
                <div>
                  <h3>Bitácora de Telemetría y Mantenimiento</h3>
                  <p>Historial auditable de niveles de diésel, presión hidroneumática, agua y servicio técnico</p>
                </div>
              </div>

              <div className="domus-mnt-tickets-stack">
                {logs.map((log) => (
                  <div key={log.id} className="domus-mnt-log-row">
                    <div className="domus-mnt-log-dot" style={{ background: log.color }}></div>
                    <div className="domus-mnt-ticket-body">
                      <strong>{log.item} · <span style={{ color: log.color }}>{log.type}</span></strong>
                      <small>{log.detail}</small>
                    </div>
                    <span className="domus-mnt-ticket-time">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ==========================================
            4. MODAL FLOTANTE: TECLADO NUMÉRICO DE TELEMETRÍA O REPORTE DE FALLA
            ========================================== */}
        {modalConfig && (
          <div className="domus-mnt-numpad-backdrop" onClick={() => setModalConfig(null)}>
            <div className="domus-mnt-numpad-window" onClick={(e) => e.stopPropagation()}>
              <div className="domus-mnt-numpad-top">
                <div>
                  <span
                    className="domus-mnt-mode-tag"
                    style={{
                      background: modalConfig.mode === 'LECTURA' ? 'rgba(94,122,198,0.15)' : 'rgba(238,107,95,0.16)',
                      color: modalConfig.mode === 'LECTURA' ? '#5E7AC6' : '#EE6B5F'
                    }}
                  >
                    {modalConfig.mode === 'LECTURA'
                      ? 'TELEMETRÍA TÁCTIL DE CAMPO'
                      : 'ORDEN DE SERVICIO TÉCNICO / REPORTE DE FALLA'}
                  </span>
                  <h3>{modalConfig.item.name}</h3>
                  <small>Valor actual: <strong>{modalConfig.item.metricVal} {modalConfig.item.metricUnit}</strong></small>
                </div>
                <button type="button" className="domus-mnt-close-sm" onClick={() => setModalConfig(null)}>
                  <X size={18} />
                </button>
              </div>

              {modalConfig.mode === 'LECTURA' ? (
                <>
                  {/* Pantalla Digital de Telemetría + Selector de Unidad */}
                  <div className="domus-mnt-screen">
                    <strong className="domus-mnt-digits">{numpadVal || '0'}</strong>
                    <select
                      value={numpadUnit}
                      onChange={(e) => setNumpadUnit(e.target.value)}
                      className="domus-mnt-unit-select"
                    >
                      <option value="% Diésel">% Diésel</option>
                      <option value="% Nivel">% Nivel Agua</option>
                      <option value="PSI">PSI Presión</option>
                      <option value="Litros">Litros</option>
                      <option value="°C">°C Temp</option>
                      <option value="pH Agua">pH Agua</option>
                      <option value="Horas">Horas Uso</option>
                    </select>
                  </div>

                  {/* Presets Rápidos */}
                  <div className="domus-mnt-presets">
                    {['100', '98', '65', '22', '7.4', '-18'].map((p) => (
                      <button key={p} type="button" onClick={() => setNumpadVal(p)}>
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Teclado Numérico Táctil */}
                  <div className="domus-mnt-numpad-grid">
                    {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        className="domus-mnt-key"
                        onClick={() => handleNumpadKey(digit)}
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="domus-mnt-key back"
                      onClick={() => handleNumpadKey('BACK')}
                    >
                      <Delete size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="domus-mnt-ticket-form">
                    <label>Descripción de la Falla o Mantenimiento Requerido</label>
                    <textarea
                      rows={3}
                      placeholder={`Ej. Variación de presión o ruido inusual en ${modalConfig.item.name}...`}
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      autoFocus
                    />

                    <div className="domus-mnt-row-2">
                      <div>
                        <label>Nivel de Urgencia</label>
                        <select
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value)}
                        >
                          <option value="PROGRAMADO">Preventivo Programado</option>
                          <option value="ALTA">Prioridad Alta (Hoy)</option>
                          <option value="URGENTE">Urgente / Crítico</option>
                        </select>
                      </div>
                      <div>
                        <label>Asignar a Técnico / Contratista</label>
                        <input
                          type="text"
                          value={ticketTech}
                          onChange={(e) => setTicketTech(e.target.value)}
                        />
                      </div>
                    </div>

                    <div
                      className={`domus-mnt-gate-check ${notifyGateForTech ? 'on' : ''}`}
                      onClick={() => setNotifyGateForTech(!notifyGateForTech)}
                    >
                      <div className="box">{notifyGateForTech && <Check size={12} />}</div>
                      <div>
                        <strong>Pre-autorizar ingreso del técnico en Garita Principal</strong>
                        <span>Notifica automáticamente a Sup. Marcos Rivas y Carlos Padrón</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="domus-mnt-numpad-foot">
                <button
                  type="button"
                  className="domus-mnt-cancel-btn"
                  onClick={() => setModalConfig(null)}
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  className="domus-mnt-confirm-btn"
                  style={{
                    background: modalConfig.mode === 'LECTURA' ? '#5E7AC6' : '#EE6B5F'
                  }}
                  onClick={handleConfirmAction}
                >
                  <Check size={17} />
                  <span>
                    {modalConfig.mode === 'LECTURA'
                      ? '[ CARGAR LECTURA ]'
                      : '[ ABRIR TICKET TÉCNICO ]'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PIE DEL MODAL
            ========================================== */}
        <footer className="domus-mnt-footer">
          <span>Progressive Disclosure & 3D Engineering Cards · Monitoreo de Planta Eléctrica, Cisterna 80,000L y Climatización</span>
          <button className="domus-mnt-close-btn" onClick={onClose}>
            VOLVER AL PANEL PRINCIPAL
          </button>
        </footer>

        {/* ==========================================
            HOJA DE ESTILOS AISLADA (3D FLIP MAINTENANCE + NUMPAD)
            ========================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          .domus-mnt-overlay {
            position: fixed; inset: 0; z-index: 194;
            background: rgba(18, 22, 36, 0.58);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            animation: domusMntFade 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 768px) {
            .domus-mnt-overlay { padding: 20px; }
          }
          @keyframes domusMntFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-mnt-modal {
            position: relative; overflow: hidden;
            width: 100%; max-width: 1380px;
            height: 100dvh;
            background: rgba(242, 244, 249, 0.94);
            backdrop-filter: blur(36px) saturate(190%);
            -webkit-backdrop-filter: blur(36px) saturate(190%);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 32px 80px rgba(15, 23, 42, 0.38);
            display: flex; flex-direction: column;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .domus-mnt-modal {
              height: 92vh;
              border-radius: 36px;
            }
          }

          .domus-mnt-watermark {
            position: absolute; right: -40px; bottom: 40px;
            width: 280px; height: 280px; object-fit: contain;
            opacity: 0.04; pointer-events: none; z-index: 0;
          }

          /* HEADER */
          .domus-mnt-header {
            position: relative; z-index: 2;
            padding: 16px 18px 14px;
            background: rgba(255, 255, 255, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.92);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-mnt-header { padding: 20px 32px 16px; }
          }
          .domus-mnt-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.11em; color: #5E7AC6;
            margin-bottom: 3px;
          }
          .domus-mnt-title-wrap h2 {
            font-size: clamp(20px, 2.5vw, 27px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-mnt-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-mnt-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 7px 14px; border-radius: 15px;
          }
          @media (min-width: 640px) { .domus-mnt-kpi { display: flex; } }
          .domus-mnt-kpi small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080; }
          .domus-mnt-kpi strong { font-size: 13px; font-weight: 900; color: #202020; }
          .domus-mnt-kpi.alert {
            background: rgba(238, 107, 95, 0.12);
            border-color: rgba(238, 107, 95, 0.35);
          }
          .domus-mnt-kpi.alert strong { color: #EE6B5F; }

          .domus-mnt-close {
            width: 40px; height: 40px; border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.08);
            background: #fff; color: #202020;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-mnt-close:hover {
            background: #EE6B5F; color: #fff; border-color: #EE6B5F; transform: rotate(90deg);
          }

          /* TABS & SEARCH */
          .domus-mnt-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.48);
            border-bottom: 1px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-mnt-tabs-bar { padding: 12px 32px; } }
          .domus-mnt-tabs { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; }
          .domus-mnt-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 16px; border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.7);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer; transition: all 0.22s ease;
          }
          .domus-mnt-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-mnt-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }
          .domus-mnt-tab-dot {
            width: 8px; height: 8px; border-radius: 50%; background: #EE6B5F;
          }

          .domus-mnt-search-row { display: flex; align-items: center; gap: 8px; }
          .domus-mnt-search {
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 14px; min-width: 220px;
          }
          .domus-mnt-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }
          .domus-mnt-new-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 14px; border: none;
            background: #202020; color: #fff;
            font-size: 11px; font-weight: 900; cursor: pointer; white-space: nowrap;
          }
          .domus-mnt-new-btn:hover { background: #5E7AC6; }

          /* BODY */
          .domus-mnt-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
            display: flex; flex-direction: column; gap: 22px;
          }
          @media (min-width: 768px) { .domus-mnt-body { padding: 22px 32px; } }

          .domus-mnt-level { display: flex; flex-direction: column; gap: 12px; }
          .domus-mnt-lvl-head { display: flex; align-items: center; gap: 10px; }
          .domus-mnt-step-badge {
            background: #5E7AC6; color: #fff;
            font-size: 9px; font-weight: 900; letter-spacing: 0.12em;
            padding: 4px 9px; border-radius: 99px;
          }
          .domus-mnt-lvl-head h3 {
            margin: 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }

          /* NIVEL 1: CARRUSEL */
          .domus-mnt-lvl1-carousel {
            display: flex; gap: 16px; overflow-x: auto;
            padding: 6px 4px 12px; scroll-snap-type: x mandatory;
          }
          .domus-mnt-lvl1-card {
            position: relative;
            min-width: 230px; height: 124px; flex: 1;
            scroll-snap-align: start; cursor: pointer;
            transition: transform 0.25s ease;
          }
          .domus-mnt-lvl1-card:hover { transform: translateY(-4px); }
          .domus-mnt-lvl1-backlight {
            position: absolute; inset: -5px; border-radius: 26px;
            background: var(--cat-accent); filter: blur(14px);
            opacity: 0; transition: opacity 0.28s ease; z-index: 0;
          }
          .domus-mnt-lvl1-card.active .domus-mnt-lvl1-backlight,
          .domus-mnt-lvl1-card:hover .domus-mnt-lvl1-backlight {
            opacity: 0.55;
          }
          .domus-mnt-lvl1-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%; border-radius: 22px; overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 12px 16px; box-sizing: border-box;
          }
          .domus-mnt-lvl1-bg {
            position: absolute; inset: 0; background-size: cover; background-position: center;
            transition: transform 0.5s ease;
          }
          .domus-mnt-lvl1-card:hover .domus-mnt-lvl1-bg { transform: scale(1.08); }
          .domus-mnt-lvl1-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0.84) 100%);
          }
          .domus-mnt-lvl1-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between; gap: 6px;
          }
          .domus-mnt-lvl1-sub {
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            color: #fff; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-mnt-lvl1-ok {
            font-size: 9px; font-weight: 900; background: #10B981; color: #fff;
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-mnt-lvl1-alert {
            font-size: 9px; font-weight: 900; background: #EE6B5F; color: #fff;
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-mnt-lvl1-bottom { position: relative; z-index: 2; color: #fff; }
          .domus-mnt-lvl1-bottom h4 { margin: 0; font-size: 17.5px; font-weight: 900; }
          .domus-mnt-lvl1-bottom span { font-size: 10.5px; font-weight: 700; opacity: 0.85; }

          /* NIVEL 2: SUB-FILTROS */
          .domus-mnt-lvl2-carousel {
            display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 8px;
          }
          .domus-mnt-lvl2-pill {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px; border-radius: 18px;
            background: rgba(255, 255, 255, 0.78);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
          }
          .domus-mnt-lvl2-pill.active {
            background: var(--sub-accent); color: #fff;
            box-shadow: 0 10px 22px -6px var(--sub-accent);
          }
          .domus-mnt-lvl2-icon {
            width: 32px; height: 32px; border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            display: flex; align-items: center; justify-content: center; font-size: 15px;
          }
          .domus-mnt-lvl2-info { text-align: left; display: flex; flex-direction: column; }
          .domus-mnt-lvl2-info strong { font-size: 12.5px; font-weight: 900; color: #202020; }
          .domus-mnt-lvl2-info span { font-size: 10px; font-weight: 700; color: #666; }
          .domus-mnt-lvl2-pill.active .domus-mnt-lvl2-info strong,
          .domus-mnt-lvl2-pill.active .domus-mnt-lvl2-info span {
            color: #fff;
          }

          /* NIVEL 3: GRILLA DE FLIP CARDS 3D */
          .domus-mnt-flip-grid {
            display: grid; grid-template-columns: 1fr; gap: 22px;
          }
          @media (min-width: 680px) {
            .domus-mnt-flip-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1120px) {
            .domus-mnt-flip-grid { grid-template-columns: repeat(3, 1fr); }
          }

          .domus-mnt-flip-scene {
            position: relative;
            height: 380px;
            perspective: 1400px;
            cursor: pointer;
          }
          .domus-mnt-flip-backlight {
            position: absolute; inset: -6px; border-radius: 32px;
            background: var(--card-glow);
            filter: blur(18px); opacity: 0.22;
            transition: opacity 0.3s ease; z-index: 0;
          }
          .domus-mnt-flip-scene:hover .domus-mnt-flip-backlight,
          .domus-mnt-flip-scene.is-flipped .domus-mnt-flip-backlight {
            opacity: 0.58;
          }

          .domus-mnt-flip-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%;
            transition: transform 0.68s cubic-bezier(0.22, 1, 0.36, 1);
            transform-style: preserve-3d;
          }
          .domus-mnt-flip-scene.is-flipped .domus-mnt-flip-inner {
            transform: rotateY(180deg);
          }

          .domus-mnt-face {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            border-radius: 28px; overflow: hidden;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            box-sizing: border-box;
            border: 1.5px solid rgba(255, 255, 255, 0.92);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
          }

          /* FRENTE */
          .domus-mnt-front {
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 16px;
          }
          .domus-mnt-front-bg {
            position: absolute; inset: 0;
            background-size: cover; background-position: center;
            transition: transform 0.6s ease;
          }
          .domus-mnt-flip-scene:hover .domus-mnt-front-bg { transform: scale(1.06); }
          .domus-mnt-front-shade {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.86) 100%);
          }
          .domus-mnt-front-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-mnt-status-pill {
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.08em;
            color: #fff; padding: 6px 12px; border-radius: 99px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          }
          .domus-mnt-flip-hint {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
            color: #202020; font-size: 10px; font-weight: 900;
            padding: 6px 11px; border-radius: 99px;
          }

          .domus-mnt-front-glass {
            position: relative; z-index: 2;
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.96);
            border-radius: 22px; padding: 15px;
            display: flex; flex-direction: column; gap: 9px;
          }
          .domus-mnt-front-title-row {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          }
          .domus-mnt-front-title-row small {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.07em; color: #5E7AC6;
          }
          .domus-mnt-front-title-row h4 {
            margin: 2px 0 0; font-size: 16.5px; font-weight: 900; color: #202020; line-height: 1.15;
          }
          .domus-mnt-metric-chip {
            background: #181C26; color: #fff;
            padding: 6px 10px; border-radius: 12px; text-align: center; flex-shrink: 0;
          }
          .domus-mnt-metric-chip strong { font-size: 15px; font-weight: 900; color: #6EE7B7; display: block; line-height: 1; }
          .domus-mnt-metric-chip span { font-size: 8.5px; font-weight: 800; color: rgba(255,255,255,0.75); }

          .domus-mnt-front-meta {
            font-size: 11px; font-weight: 700; color: #444;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .domus-mnt-front-bar { display: flex; flex-direction: column; gap: 4px; }
          .domus-mnt-bar-labels {
            display: flex; justify-content: space-between;
            font-size: 10px; font-weight: 800; color: #555;
          }
          .domus-mnt-bar-track {
            width: 100%; height: 6px; border-radius: 99px;
            background: rgba(0, 0, 0, 0.08); overflow: hidden;
          }
          .domus-mnt-bar-fill { height: 100%; border-radius: 99px; }

          /* REVERSO EDITABLE */
          .domus-mnt-back {
            transform: rotateY(180deg);
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(28px);
            padding: 15px 16px;
            display: flex; flex-direction: column; justify-content: space-between;
            cursor: default;
          }
          .domus-mnt-back-head {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06);
          }
          .domus-mnt-back-head span {
            font-size: 8.5px; font-weight: 900; color: #5E7AC6; letter-spacing: 0.08em;
          }
          .domus-mnt-back-head h4 {
            margin: 2px 0 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }
          .domus-mnt-unflip-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 11px; border-radius: 99px;
            border: 1px solid rgba(0,0,0,0.1); background: #F4F6FA;
            font-size: 10px; font-weight: 900; color: #202020; cursor: pointer;
          }

          .domus-mnt-edit-form { display: flex; flex-direction: column; gap: 7px; }
          .domus-mnt-edit-form label {
            display: block; font-size: 8.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.06em; color: #666; margin-bottom: 2px;
          }
          .domus-mnt-edit-form input {
            width: 100%; box-sizing: border-box;
            padding: 6px 9px; border-radius: 9px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC;
            font-size: 11px; font-weight: 800; color: #202020; outline: none;
          }
          .domus-mnt-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

          .domus-mnt-chips-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
          .domus-mnt-chip-btn {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 4px 8px; border-radius: 7px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #F4F6FA; color: #666;
            font-size: 9.5px; font-weight: 800; cursor: pointer;
          }
          .domus-mnt-chip-btn.active {
            background: #10B981; color: #fff; border-color: #10B981;
          }

          .domus-mnt-back-actions {
            display: grid; grid-template-columns: 1.1fr 1fr; gap: 8px; padding-top: 4px;
          }
          .domus-mnt-btn-reading {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #5E7AC6; color: #fff; font-size: 10px; font-weight: 900; cursor: pointer;
            box-shadow: 0 6px 14px rgba(94, 122, 198, 0.3);
          }
          .domus-mnt-btn-ticket {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #EE6B5F; color: #fff; font-size: 10px; font-weight: 900; cursor: pointer;
            box-shadow: 0 6px 14px rgba(238, 107, 95, 0.3);
          }
          .domus-mnt-saved-pill {
            padding: 9px; border-radius: 12px;
            background: rgba(16, 185, 129, 0.16); color: #065F46;
            font-size: 11px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 6px;
          }

          /* 4. MODAL FLOTANTE NUMPAD TELEMETRÍA / TICKET */
          .domus-mnt-numpad-backdrop {
            position: fixed; inset: 0; z-index: 230;
            background: rgba(15, 23, 42, 0.58); backdrop-filter: blur(12px);
            display: flex; align-items: center; justify-content: center; padding: 16px;
          }
          .domus-mnt-numpad-window {
            width: 100%; max-width: 440px;
            background: rgba(255, 255, 255, 0.97);
            border-radius: 32px; padding: 22px;
            box-shadow: 0 28px 70px rgba(15, 23, 42, 0.4);
            display: flex; flex-direction: column; gap: 14px;
          }
          .domus-mnt-numpad-top {
            display: flex; align-items: flex-start; justify-content: space-between;
          }
          .domus-mnt-mode-tag {
            display: inline-block; font-size: 8.5px; font-weight: 900;
            letter-spacing: 0.1em; padding: 3px 9px; border-radius: 99px;
          }
          .domus-mnt-numpad-top h3 { margin: 3px 0 2px; font-size: 19px; font-weight: 900; }
          .domus-mnt-numpad-top small { font-size: 11.5px; color: #666; }
          .domus-mnt-close-sm {
            width: 34px; height: 34px; border-radius: 50%; border: none;
            background: #F4F6FA; cursor: pointer; display: flex; align-items: center; justify-content: center;
          }

          .domus-mnt-screen {
            display: flex; align-items: center; justify-content: space-between;
            background: #181C26; color: #fff;
            padding: 14px 18px; border-radius: 20px;
          }
          .domus-mnt-digits { font-size: 32px; font-weight: 900; color: #6EE7B7; }
          .domus-mnt-unit-select {
            background: rgba(255,255,255,0.14); color: #fff;
            border: 1px solid rgba(255,255,255,0.28);
            padding: 8px 12px; border-radius: 12px;
            font-size: 12px; font-weight: 900; outline: none;
          }
          .domus-mnt-unit-select option { background: #181C26; color: #fff; }

          .domus-mnt-presets { display: flex; flex-wrap: wrap; gap: 6px; }
          .domus-mnt-presets button {
            flex: 1; min-width: 54px; padding: 7px 6px; border-radius: 10px;
            border: 1px solid rgba(94, 122, 198, 0.25);
            background: rgba(94, 122, 198, 0.08);
            color: #5E7AC6; font-size: 11px; font-weight: 900; cursor: pointer;
          }

          .domus-mnt-numpad-grid {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
          }
          .domus-mnt-key {
            height: 48px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.06);
            background: #F4F6FA; color: #202020;
            font-size: 18px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
          }
          .domus-mnt-key.back { color: #EE6B5F; }

          .domus-mnt-ticket-form { display: flex; flex-direction: column; gap: 10px; }
          .domus-mnt-ticket-form label {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; color: #5E7AC6; margin-bottom: 4px;
          }
          .domus-mnt-ticket-form textarea,
          .domus-mnt-ticket-form input,
          .domus-mnt-ticket-form select {
            width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC;
            font-size: 12px; font-weight: 700; color: #202020; font-family: inherit;
          }
          .domus-mnt-gate-check {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-radius: 14px;
            background: #F7F9FC; border: 1px solid rgba(0,0,0,0.06);
            cursor: pointer; opacity: 0.65;
          }
          .domus-mnt-gate-check.on {
            opacity: 1; background: rgba(16, 185, 129, 0.08);
            border-color: rgba(16, 185, 129, 0.35);
          }
          .domus-mnt-gate-check .box {
            width: 22px; height: 22px; border-radius: 7px;
            background: #10B981; color: #fff;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .domus-mnt-gate-check strong { display: block; font-size: 11.5px; font-weight: 900; color: #202020; }
          .domus-mnt-gate-check span { font-size: 10px; color: #666; font-weight: 600; }

          .domus-mnt-numpad-foot {
            display: grid; grid-template-columns: 1fr 1.7fr; gap: 10px;
          }
          .domus-mnt-cancel-btn {
            padding: 13px; border-radius: 15px; border: 1px solid rgba(0,0,0,0.1);
            background: #fff; font-size: 11px; font-weight: 900; color: #666; cursor: pointer;
          }
          .domus-mnt-confirm-btn {
            padding: 13px; border-radius: 15px; border: none;
            color: #fff; font-size: 11.5px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
          }

          /* ADD DRAWER & TICKETS LIST */
          .domus-mnt-add-drawer {
            background: #fff; border: 1.5px solid rgba(94, 122, 198, 0.35);
            border-radius: 24px; padding: 18px;
          }
          .domus-mnt-drawer-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
          }
          .domus-mnt-drawer-head span { font-size: 9.5px; font-weight: 900; color: #5E7AC6; }
          .domus-mnt-drawer-head h4 { margin: 2px 0 0; font-size: 16px; font-weight: 900; }
          .domus-mnt-drawer-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;
          }
          .domus-mnt-drawer-grid label {
            display: block; font-size: 9.5px; font-weight: 900; color: #666; margin-bottom: 4px;
          }
          .domus-mnt-drawer-grid input, .domus-mnt-drawer-grid select {
            width: 100%; box-sizing: border-box; padding: 9px 11px; border-radius: 11px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC; font-size: 12px; font-weight: 700;
          }
          .domus-mnt-drawer-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
          .domus-mnt-save-new {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 10px 18px; border-radius: 12px; border: none;
            background: #10B981; color: #fff; font-size: 11.5px; font-weight: 900; cursor: pointer;
          }

          .domus-mnt-list-card {
            background: rgba(255,255,255,0.85); border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
          }
          .domus-mnt-list-head h3 { margin: 0 0 4px; font-size: 18px; font-weight: 900; }
          .domus-mnt-list-head p { margin: 0 0 16px; font-size: 12px; color: #666; }
          .domus-mnt-tickets-stack { display: flex; flex-direction: column; gap: 10px; }
          .domus-mnt-ticket-row, .domus-mnt-log-row {
            display: flex; align-items: center; gap: 12px;
            padding: 13px 16px; border-radius: 16px; background: #F7F9FC;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-mnt-ticket-row.done { opacity: 0.65; }
          .domus-mnt-ticket-check {
            width: 22px; height: 22px; border-radius: 7px;
            border: 2px solid #5E7AC6; background: #fff; color: #fff;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .domus-mnt-ticket-row.done .domus-mnt-ticket-check { background: #5E7AC6; }
          .domus-mnt-ticket-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
          .domus-mnt-ticket-top { display: flex; align-items: center; gap: 8px; }
          .domus-mnt-prio { font-size: 8.5px; font-weight: 900; padding: 2px 7px; border-radius: 99px; }
          .domus-mnt-prio.urgente, .domus-mnt-prio.alta { background: rgba(238,107,95,0.18); color: #EE6B5F; }
          .domus-mnt-prio.programado, .domus-mnt-prio.normal { background: rgba(94,122,198,0.16); color: #5E7AC6; }
          .domus-mnt-ticket-time { font-size: 10.5px; font-weight: 800; color: #888; }
          .domus-mnt-ticket-body strong { font-size: 13.5px; font-weight: 900; color: #202020; }
          .domus-mnt-ticket-body small { font-size: 11px; color: #666; font-weight: 600; }
          .domus-mnt-log-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }

          /* FOOTER */
          .domus-mnt-footer {
            position: relative; z-index: 2;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.78);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px; font-size: 11px; font-weight: 700; color: #666;
          }
          .domus-mnt-close-btn {
            padding: 11px 18px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.12); background: #fff;
            font-size: 11px; font-weight: 900; color: #202020; cursor: pointer;
          }
        `}} />
      </div>
    </div>
  );
}