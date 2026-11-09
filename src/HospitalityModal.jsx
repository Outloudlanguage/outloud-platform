import React, { useState, useMemo } from 'react';
import {
  X, Sparkles, Users, Coffee, ShieldCheck, Bed, Calendar,
  CheckCircle2, Plus, Search, CarFront, Thermometer, Heart,
  Clock, Check, Bell, Utensils, RotateCw, Send, Layers, Minus
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

// ==========================================
// 1. CATEGORÍAS EN CASCADA (NIVEL 1 Y NIVEL 2)
// ==========================================
const HOSPITALITY_CATEGORIES = [
  {
    id: 'Familia',
    title: 'Familia Directa',
    subtitle: 'Hijos, Nietos y Residencia',
    accent: '#5E7AC6',
    type: 'GUESTS',
    img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Toda la Familia', icon: '👨‍👩‍👧‍👦' },
      { id: 'EN_CASA', name: 'En Casa Hoy (VIP Activo)', icon: '🟢' },
      { id: 'PROXIMA', name: 'Próximas Llegadas', icon: '📅' },
      { id: 'ALERGIAS', name: 'Cuidado Dietético', icon: '🥗' }
    ]
  },
  {
    id: 'Invitado VIP',
    title: 'Invitados & Médicos VIP',
    subtitle: 'Visitas de Honor y Especialistas',
    accent: '#BE7AC6',
    type: 'GUESTS',
    img: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Todos los Invitados', icon: '🎩' },
      { id: 'MEDICOS', name: 'Médicos Tratantes', icon: '🩺' },
      { id: 'SOCIAL', name: 'Amigos de la Casa', icon: '🥂' },
      { id: 'EN_CASA', name: 'Protocolo Activo', icon: '✨' }
    ]
  },
  {
    id: 'Suites',
    title: 'Suites & Lencería',
    subtitle: 'Habitaciones, Clima y Áreas',
    accent: '#10B981',
    type: 'SUITES',
    img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODAS', name: 'Todas las Suites (5)', icon: '🛏️' },
      { id: 'LISTA', name: 'Impecables / Listas', icon: '✅' },
      { id: 'OCUPADA_VIP', name: 'En Uso / Ocupadas', icon: '🔑' },
      { id: 'SOCIALES', name: 'Salones y Terrazas', icon: '🌿' }
    ]
  }
];

const AMENITY_OPTIONS = [
  'Flores Frescas',
  'Agua con Gas',
  'Prensa del Día',
  'Aroma Lavanda',
  'Cobertura 7PM',
  'Toallas Térmicas'
];

const SUITE_CHECK_OPTIONS = [
  'Clima Activo',
  'Egipcia 600H',
  'Flores Tocador',
  'Agua en Noche',
  'Baño Sanitizado',
  'Cobertura 7PM'
];

// ==========================================
// 2. BIBLIOTECA DE HUÉSPEDES VIP (CON FOTOS Y PREFERENCIAS EDITABLES)
// ==========================================
const INITIAL_VIP_GUESTS = [
  {
    id: 'vip-1',
    name: 'Sr. Álvaro Jiménez',
    relation: 'Hijo · Familia Directa',
    category: 'Familia',
    subGroup: 'EN_CASA',
    hasAllergy: true,
    avatar: 'AJ',
    color: '#5E7AC6',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    status: 'EN_CASA',
    lastVisit: 'Hoy · En Residencia',
    suite: 'Suite Terraza Norte',
    temp: 21,
    pillow: 'Firme Ortopédica · Algodón Egipcio',
    dietary: 'Sin lácteos enteros · Carnes término medio y mero a la plancha',
    beverage: 'Espresso doble sin azúcar al llegar · Agua con gas fría',
    vehicle: 'Toyota 4Runner Plata · Placa AA892KL',
    amenities: ['Agua con Gas', 'Prensa del Día', 'Cobertura 7PM'],
    protocolActive: true
  },
  {
    id: 'vip-2',
    name: 'Sra. Carolina Jiménez',
    relation: 'Hija · Familia Directa',
    category: 'Familia',
    subGroup: 'PROXIMA',
    hasAllergy: true,
    avatar: 'CJ',
    color: '#BE7AC6',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    status: 'PROXIMA_VISITA',
    lastVisit: 'Mañana · 12:30 PM',
    suite: 'Suite Huéspedes Jardín',
    temp: 23,
    pillow: 'Pluma de Ganso Suave · Edredón Ligero',
    dietary: 'ALERTA: Alergia estricta a mariscos · Dieta pescetariana suave',
    beverage: 'Infusión de flor de jamaica o té verde tibio con jengibre',
    vehicle: 'Mercedes-Benz GLC Blanco · Placa AB104MM',
    amenities: ['Flores Frescas', 'Aroma Lavanda', 'Toallas Térmicas'],
    protocolActive: false
  },
  {
    id: 'vip-3',
    name: 'Andrés y Sofía Jiménez',
    relation: 'Nietos · Fin de Semana',
    category: 'Familia',
    subGroup: 'PROXIMA',
    hasAllergy: false,
    avatar: 'AS',
    color: '#EE6B5F',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    status: 'REGISTRADO',
    lastVisit: 'Viernes · 04:00 PM',
    suite: 'Suite Doble Estudio',
    temp: 22,
    pillow: 'Estándar Hipoalergénica · Mantas Extra',
    dietary: 'Menú joven: Pastas artesanales, milanesa de pollo orgánica y frutas',
    beverage: 'Jugo natural de parchita o fresa sin azúcar · Merienda 4:30 PM',
    vehicle: 'Ingreso con Chófer Familiar (Pase Directo)',
    amenities: ['Toallas Térmicas', 'Agua con Gas'],
    protocolActive: false
  },
  {
    id: 'vip-4',
    name: 'Dr. Alejandro Vegas',
    relation: 'Cardiólogo de Cabecera & Amigo',
    category: 'Invitado VIP',
    subGroup: 'MEDICOS',
    hasAllergy: false,
    avatar: 'AV',
    color: '#10B981',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    status: 'REGISTRADO',
    lastVisit: 'Jueves · Visita Médica',
    suite: 'Salón Biblioteca & Estudio',
    temp: 22,
    pillow: 'Recepción Ejecutiva en Estudio',
    dietary: 'Bajo en sodio · Acompaña al Dr. Gustavo en almuerzos de pescado blanco',
    beverage: 'Café negro recién molido en porcelana al pasar a biblioteca',
    vehicle: 'Ford Explorer Negra · Placa AD441OP (Prioridad Médica)',
    amenities: ['Prensa del Día', 'Agua con Gas'],
    protocolActive: false
  },
  {
    id: 'vip-5',
    name: 'Sr. Henrique Mendoza & Sra.',
    relation: 'Amigos Íntimos de la Familia',
    category: 'Invitado VIP',
    subGroup: 'SOCIAL',
    hasAllergy: true,
    avatar: 'HM',
    color: '#5E7AC6',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    status: 'REGISTRADO',
    lastVisit: 'Domingo · Almuerzo Terraza',
    suite: 'Salón Comedor & Terraza VIP',
    temp: 22,
    pillow: 'Recepción Social en Terraza',
    dietary: 'Sra. Mendoza: Intolerancia al gluten (Celíaca) · Lomito y ensaladas',
    beverage: 'Vino Tinto Reserva a 16°C y agua mineral en copa de cristal',
    vehicle: 'Escoltas y Chófer (Avisar a Sup. Marcos en Garita)',
    amenities: ['Flores Frescas', 'Agua con Gas', 'Aroma Lavanda'],
    protocolActive: false
  },
  {
    id: 'vip-6',
    name: 'Dra. Beatriz Urdaneta',
    relation: 'Fisioterapeuta y Rehabilitación',
    category: 'Invitado VIP',
    subGroup: 'MEDICOS',
    hasAllergy: false,
    avatar: 'BU',
    color: '#10B981',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600',
    status: 'REGISTRADO',
    lastVisit: 'Lun / Mié / Vie · 10:00 AM',
    suite: 'Terraza & Gimnasio Suave',
    temp: 23,
    pillow: 'Toallas de Terapia y Camilla Lista',
    dietary: 'No almuerza en casa · Merienda ligera de frutas',
    beverage: 'Té verde frío o agua mineral natural al finalizar sesión',
    vehicle: 'Toyota Corolla Gris · Placa AE901BC',
    amenities: ['Toallas Térmicas', 'Agua con Gas'],
    protocolActive: false
  }
];

// ==========================================
// 3. SUITES Y HABITACIONES (TARJETAS 3D INTERACTIVAS)
// ==========================================
const INITIAL_SUITES = [
  {
    id: 'su-1',
    name: 'Suite Terraza Norte',
    zone: 'Planta Alta · Vista Ávila',
    subType: 'OCUPADA_VIP',
    temp: 21,
    status: 'OCUPADA_VIP',
    assignedTo: 'Sr. Álvaro Jiménez',
    linen: 'Algodón Egipcio 600 Hilos · Almohada Firme',
    housekeeper: 'Elena Castillo',
    scent: 'Cedro Blanco y Bergamota',
    img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600',
    checks: ['Clima Activo', 'Egipcia 600H', 'Agua en Noche', 'Baño Sanitizado', 'Cobertura 7PM']
  },
  {
    id: 'su-2',
    name: 'Suite Huéspedes Jardín',
    zone: 'Ala Este · Planta Baja',
    subType: 'LISTA',
    temp: 23,
    status: 'LISTA',
    assignedTo: 'Reservada: Sra. Carolina Jiménez',
    linen: 'Lino Hipolergénico · Pluma Suave',
    housekeeper: 'Elena Castillo',
    scent: 'Lavanda Francesa Suave',
    img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600',
    checks: ['Clima Activo', 'Egipcia 600H', 'Flores Tocador', 'Agua en Noche', 'Baño Sanitizado']
  },
  {
    id: 'su-3',
    name: 'Suite Doble Estudio',
    zone: 'Ala Oeste · Jardín Sur',
    subType: 'LISTA',
    temp: 22,
    status: 'LISTA',
    assignedTo: 'Disponible: Nietos / Familia',
    linen: 'Percal Blanco Suave · Doble Queen',
    housekeeper: 'Rosaura Díaz',
    scent: 'Verbena y Limón Fresco',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600',
    checks: ['Egipcia 600H', 'Agua en Noche', 'Baño Sanitizado']
  },
  {
    id: 'su-4',
    name: 'Salón Comedor & Terraza VIP',
    zone: 'Área Social Principal',
    subType: 'SOCIALES',
    temp: 22,
    status: 'LISTA',
    assignedTo: 'Montaje Imperial (Hasta 10 puestos)',
    linen: 'Mantelería Lino Crudo · Vajilla Principal',
    housekeeper: 'María Fernanda Rojas',
    scent: 'Brisa Natural de Jardín',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
    checks: ['Clima Activo', 'Flores Tocador', 'Agua en Noche']
  },
  {
    id: 'su-5',
    name: 'Salón Biblioteca & Estudio',
    zone: 'Ala Norte · Privado',
    subType: 'SOCIALES',
    temp: 22,
    status: 'LISTA',
    assignedTo: 'Reuniones Médicas y Lectura',
    linen: 'Poltronas de Cuero Hidratadas · Servicio Café',
    housekeeper: 'Rosaura Díaz',
    scent: 'Sándalo y Madera Suave',
    img: 'https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&q=80&w=600',
    checks: ['Clima Activo', 'Agua en Noche', 'Baño Sanitizado']
  }
];

const INITIAL_DISPATCH_LOGS = [
  {
    id: 'dl-1',
    guest: 'Sr. Álvaro Jiménez',
    eta: 'En Casa Ahora',
    pax: '1 Persona',
    orders: 'Cocina: Espresso doble sin azúcar · Suite Norte: 21°C · Garita: Pase activo',
    time: '11:30 AM',
    color: '#10B981'
  },
  {
    id: 'dl-2',
    guest: 'Sra. Carolina Jiménez',
    eta: 'Mañana 12:30 PM',
    pax: '1 Persona',
    orders: 'Cocina: Menú libre de mariscos · Suite Jardín: Orquídeas y 23°C',
    time: '09:15 AM',
    color: '#5E7AC6'
  }
];

export default function HospitalityModal({ isOpen, onClose, initialTab = 'EXPLORADOR' }) {
  const [activeTab, setActiveTab] = useState('EXPLORADOR');
  const [guests, setGuests] = useState(INITIAL_VIP_GUESTS);
  const [suites, setSuites] = useState(INITIAL_SUITES);
  const [dispatchLogs, setDispatchLogs] = useState(INITIAL_DISPATCH_LOGS);

  // Estado Progressive Disclosure (Nivel 1 -> Nivel 2 -> Nivel 3)
  const [selectedCategory, setSelectedCategory] = useState('Familia');
  const [selectedSubfilter, setSelectedSubfilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado Giro 3D (Flip Card)
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [savedCardToast, setSavedCardToast] = useState(null);

  // Estado del Modal Flotante Despachador VIP (Concierge Dispatch Modal)
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [dispatchEta, setDispatchEta] = useState('En 15 minutos');
  const [dispatchPax, setDispatchPax] = useState(1);
  const [notifyKitchen, setNotifyKitchen] = useState(true);
  const [notifyHousekeeping, setNotifyHousekeeping] = useState(true);
  const [notifyGate, setNotifyGate] = useState(true);

  // Gaveta para Añadir Nuevo Huésped VIP
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newCat, setNewCat] = useState('Familia');
  const [newSuite, setNewSuite] = useState('Suite Huéspedes Jardín');
  const [newDietary, setNewDietary] = useState('');
  const [newBeverage, setNewBeverage] = useState('');
  const [newVehicle, setNewVehicle] = useState('');

  const activeCategoryObj = useMemo(
    () => HOSPITALITY_CATEGORIES.find((c) => c.id === selectedCategory) || HOSPITALITY_CATEGORIES[0],
    [selectedCategory]
  );

  const activeGuestsInHouse = useMemo(
    () => guests.filter((g) => g.protocolActive).length,
    [guests]
  );

  const readySuitesCount = useMemo(
    () => suites.filter((s) => s.status === 'LISTA' || s.status === 'OCUPADA_VIP').length,
    [suites]
  );

  // Cambio de Categoría (Nivel 1)
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    const catObj = HOSPITALITY_CATEGORIES.find((c) => c.id === catId);
    if (catObj && catObj.subfilters.length > 0) {
      setSelectedSubfilter(catObj.subfilters[0].id);
    }
    setFlippedCardId(null);
  };

  // Filtrado de Huéspedes (Nivel 3 cuando es Familia o Invitado VIP)
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.relation.toLowerCase().includes(q) ||
          g.dietary.toLowerCase().includes(q) ||
          g.suite.toLowerCase().includes(q)
        );
      }
      const matchCat = g.category === selectedCategory;
      let matchSub = true;
      if (selectedSubfilter === 'EN_CASA') matchSub = g.protocolActive;
      else if (selectedSubfilter === 'PROXIMA') matchSub = g.subGroup === 'PROXIMA';
      else if (selectedSubfilter === 'ALERGIAS') matchSub = g.hasAllergy;
      else if (selectedSubfilter === 'MEDICOS') matchSub = g.subGroup === 'MEDICOS';
      else if (selectedSubfilter === 'SOCIAL') matchSub = g.subGroup === 'SOCIAL';
      return matchCat && matchSub;
    });
  }, [guests, selectedCategory, selectedSubfilter, searchQuery]);

  // Filtrado de Suites (Nivel 3 cuando es Suites)
  const filteredSuites = useMemo(() => {
    return suites.filter((s) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.assignedTo.toLowerCase().includes(q) ||
          s.housekeeper.toLowerCase().includes(q)
        );
      }
      if (selectedSubfilter === 'TODAS') return true;
      if (selectedSubfilter === 'SOCIALES') return s.subType === 'SOCIALES';
      return s.status === selectedSubfilter;
    });
  }, [suites, selectedSubfilter, searchQuery]);

  // Edición en vivo de campos de Huésped VIP en el reverso 3D
  const updateGuestField = (guestId, field, value) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, [field]: value } : g))
    );
  };

  const toggleGuestAmenity = (e, guestId, amenity) => {
    e.stopPropagation();
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        const exists = g.amenities.includes(amenity);
        const next = exists
          ? g.amenities.filter((a) => a !== amenity)
          : [...g.amenities, amenity];
        return { ...g, amenities: next };
      })
    );
  };

  // Edición en vivo de campos de Suite en el reverso 3D
  const updateSuiteField = (suiteId, field, value) => {
    setSuites((prev) =>
      prev.map((s) => (s.id === suiteId ? { ...s, [field]: value } : s))
    );
  };

  const toggleSuiteCheck = (e, suiteId, checkName) => {
    e.stopPropagation();
    setSuites((prev) =>
      prev.map((s) => {
        if (s.id !== suiteId) return s;
        const exists = s.checks.includes(checkName);
        const next = exists
          ? s.checks.filter((c) => c !== checkName)
          : [...s.checks, checkName];
        return { ...s, checks: next };
      })
    );
  };

  const handleSaveCard = (e, id) => {
    e.stopPropagation();
    setSavedCardToast(id);
    setTimeout(() => {
      setSavedCardToast(null);
      setFlippedCardId(null);
    }, 850);
  };

  // Confirmar Despacho Multidepartamento desde el Modal Flotante
  const handleConfirmDispatch = () => {
    if (!dispatchTarget) return;
    setGuests((prev) =>
      prev.map((g) =>
        g.id === dispatchTarget.id
          ? { ...g, protocolActive: true, status: 'EN_CASA', lastVisit: `Activo · ${dispatchEta}` }
          : g
      )
    );

    const activeAreas = [];
    if (notifyKitchen) activeAreas.push(`Cocina: ${dispatchTarget.beverage.split('·')[0]}`);
    if (notifyHousekeeping) activeAreas.push(`${dispatchTarget.suite}: ${dispatchTarget.temp}°C`);
    if (notifyGate) activeAreas.push(`Garita: ${dispatchTarget.vehicle.split('·')[0]}`);

    const newLog = {
      id: `dl-${Date.now()}`,
      guest: dispatchTarget.name,
      eta: dispatchEta,
      pax: `${dispatchPax} ${dispatchPax === 1 ? 'Persona' : 'Personas'}`,
      orders: activeAreas.join(' · '),
      time: 'Justo ahora',
      color: '#10B981'
    };

    setDispatchLogs([newLog, ...dispatchLogs]);
    setDispatchTarget(null);
    setFlippedCardId(null);
  };

  const handleCreateGuest = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const parts = newName.trim().split(' ');
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    const created = {
      id: `vip-${Date.now()}`,
      name: newName.trim(),
      relation: newRelation.trim() || 'Invitado Especial',
      category: newCat,
      subGroup: 'PROXIMA',
      hasAllergy: newDietary.toLowerCase().includes('alerg') || newDietary.toLowerCase().includes('sin'),
      avatar: initials,
      color: newCat === 'Familia' ? '#5E7AC6' : '#BE7AC6',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      status: 'PROXIMA_VISITA',
      lastVisit: 'Ficha Recién Creada',
      suite: newSuite,
      temp: 22,
      pillow: 'Algodón Egipcio 600 Hilos · Almohada Suave',
      dietary: newDietary.trim() || 'Menú estándar de la casa sin restricciones',
      beverage: newBeverage.trim() || 'Café recién molido y agua mineral fría',
      vehicle: newVehicle.trim() || 'Autorizado por Administración en Garita',
      amenities: ['Flores Frescas', 'Agua con Gas'],
      protocolActive: false
    };

    setGuests([created, ...guests]);
    setSelectedCategory(newCat);
    setNewName('');
    setNewRelation('');
    setNewDietary('');
    setNewBeverage('');
    setNewVehicle('');
    setShowAddDrawer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-hsp-overlay" onClick={onClose}>
      <div className="domus-hsp-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-hsp-watermark" />

        {/* ==========================================
            CABECERA EJECUTIVA DE HOSPITALIDAD VIP
            ========================================== */}
        <header className="domus-hsp-header">
          <div className="domus-hsp-title-wrap">
            <div className="domus-hsp-eyebrow">
              <Sparkles size={13} color="#BE7AC6" />
              <span>CASA ROQUEDAL · CONSERJERÍA VIP 3D, SUITES Y ENLACE MULTIDEPARTAMENTO</span>
            </div>
            <h2>Hospitalidad, Familia, Invitados y Suites</h2>
          </div>

          <div className="domus-hsp-kpis">
            <div className="domus-hsp-kpi">
              <small>PROTOCOLOS ACTIVOS</small>
              <strong style={{ color: '#10B981' }}>{activeGuestsInHouse} VIP en Casa</strong>
            </div>
            <div
              className="domus-hsp-kpi"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectCategory('Suites')}
            >
              <small>ESTADO SUITES</small>
              <strong style={{ color: '#5E7AC6' }}>{readySuitesCount} / {suites.length} Impecables</strong>
            </div>
            <button className="domus-hsp-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
            BARRA DE VISTAS Y BUSCADOR
            ========================================== */}
        <div className="domus-hsp-tabs-bar">
          <div className="domus-hsp-tabs">
            <button
              className={`domus-hsp-tab ${activeTab === 'EXPLORADOR' ? 'active' : ''}`}
              onClick={() => setActiveTab('EXPLORADOR')}
            >
              <Layers size={16} />
              <span>Explorador VIP en Cascada ({guests.length + suites.length})</span>
            </button>
            <button
              className={`domus-hsp-tab ${activeTab === 'BITACORA' ? 'active' : ''}`}
              onClick={() => setActiveTab('BITACORA')}
            >
              <Bell size={16} />
              <span>Órdenes Enviadas a Departamentos ({dispatchLogs.length})</span>
            </button>
          </div>

          {activeTab === 'EXPLORADOR' && (
            <div className="domus-hsp-search-row">
              <div className="domus-hsp-search">
                <Search size={15} color="#808080" />
                <input
                  type="text"
                  placeholder="Buscar familiar, suite, plato o alergia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="domus-hsp-new-btn"
                onClick={() => setShowAddDrawer(!showAddDrawer)}
              >
                <Plus size={15} />
                <span>Nuevo Perfil VIP</span>
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO PRINCIPAL CON PROGRESSIVE DISCLOSURE
            ========================================== */}
        <div className="domus-hsp-body">

          {activeTab === 'EXPLORADOR' && (
            <>
              {/* GAVETA RÁPIDA PARA CREAR NUEVO PERFIL VIP */}
              {showAddDrawer && (
                <form className="domus-hsp-add-drawer" onSubmit={handleCreateGuest}>
                  <div className="domus-hsp-drawer-head">
                    <div>
                      <span>NUEVO PASAPORTE DE PREFERENCIAS 3D</span>
                      <h4>Registrar Familiar o Invitado VIP en la Biblioteca</h4>
                    </div>
                    <button type="button" onClick={() => setShowAddDrawer(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="domus-hsp-drawer-grid">
                    <div>
                      <label>Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Dra. Elena Jiménez"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Parentesco o Vínculo</label>
                      <input
                        type="text"
                        placeholder="Ej. Sobrina / Invitado de Honor"
                        value={newRelation}
                        onChange={(e) => setNewRelation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Categoría</label>
                      <select value={newCat} onChange={(e) => setNewCat(e.target.value)}>
                        <option value="Familia">Familia Directa</option>
                        <option value="Invitado VIP">Invitado VIP / Médico</option>
                      </select>
                    </div>
                    <div>
                      <label>Suite Asignada</label>
                      <select value={newSuite} onChange={(e) => setNewSuite(e.target.value)}>
                        {suites.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Dieta / Alergias (Para Cocina)</label>
                      <input
                        type="text"
                        placeholder="Ej. Sin lactosa, prefiere pescado..."
                        value={newDietary}
                        onChange={(e) => setNewDietary(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Bebida de Bienvenida</label>
                      <input
                        type="text"
                        placeholder="Ej. Espresso doble / Agua con gas"
                        value={newBeverage}
                        onChange={(e) => setNewBeverage(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="domus-hsp-drawer-foot">
                    <button type="submit" className="domus-hsp-save-new">
                      <Check size={15} /> Crear Pasaporte 3D
                    </button>
                  </div>
                </form>
              )}

              {/* ==========================================
                  NIVEL 1: CARRUSEL DE CATEGORÍAS DE HOSPITALIDAD
                  ========================================== */}
              <div className="domus-hsp-level">
                <div className="domus-hsp-lvl-head">
                  <span className="domus-hsp-step-badge">NIVEL 1</span>
                  <h3>Dimensiones de Hospitalidad y Conserjería</h3>
                </div>

                <div className="domus-hsp-lvl1-carousel">
                  {HOSPITALITY_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id && !searchQuery;
                    const count =
                      cat.type === 'SUITES'
                        ? suites.length
                        : guests.filter((g) => g.category === cat.id).length;

                    return (
                      <div
                        key={cat.id}
                        className={`domus-hsp-lvl1-card ${isSelected ? 'active' : ''}`}
                        style={{ '--cat-accent': cat.accent }}
                        onClick={() => {
                          setSearchQuery('');
                          handleSelectCategory(cat.id);
                        }}
                      >
                        <div className="domus-hsp-lvl1-backlight"></div>
                        <div className="domus-hsp-lvl1-inner">
                          <div
                            className="domus-hsp-lvl1-bg"
                            style={{ backgroundImage: `url('${cat.img}')` }}
                          ></div>
                          <div className="domus-hsp-lvl1-overlay"></div>

                          <div className="domus-hsp-lvl1-top">
                            <span className="domus-hsp-lvl1-sub">{cat.subtitle}</span>
                            <span className="domus-hsp-lvl1-ok">{count} Fichas 3D</span>
                          </div>

                          <div className="domus-hsp-lvl1-bottom">
                            <h4>{cat.title}</h4>
                            <span>Toque para desplegar subcategorías</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ==========================================
                  NIVEL 2: CARRUSEL DE SUB-FILTROS DINÁMICOS
                  ========================================== */}
              {!searchQuery && (
                <div className="domus-hsp-level domus-hsp-lvl2-anim" key={selectedCategory}>
                  <div className="domus-hsp-lvl-head">
                    <span className="domus-hsp-step-badge" style={{ background: activeCategoryObj.accent }}>
                      NIVEL 2
                    </span>
                    <h3>Filtro Operativo de {activeCategoryObj.title}</h3>
                  </div>

                  <div className="domus-hsp-lvl2-carousel">
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
                          className={`domus-hsp-lvl2-pill ${isSubActive ? 'active' : ''}`}
                          style={{ '--sub-accent': activeCategoryObj.accent }}
                        >
                          <div className="domus-hsp-lvl2-icon">{sub.icon}</div>
                          <div className="domus-hsp-lvl2-info">
                            <strong>{sub.name}</strong>
                            <span>Ver tarjetas</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==========================================
                  NIVEL 3: GRILLA DE TARJETAS 3D FLIP (HUÉSPEDES O SUITES)
                  ========================================== */}
              <div className="domus-hsp-level">
                <div className="domus-hsp-lvl-head">
                  <span className="domus-hsp-step-badge" style={{ background: '#10B981' }}>
                    NIVEL 3
                  </span>
                  <h3>
                    {activeCategoryObj.type === 'SUITES'
                      ? `Control de Suites y Áreas (${filteredSuites.length}) · Toque una tarjeta para ajustar clima, lencería y protocolo`
                      : `Pasaportes VIP (${filteredGuests.length}) · Toque cualquier tarjeta para editar preferencias o activar su llegada`}
                  </h3>
                </div>

                {/* MODO A: TARJETAS 3D DE HUÉSPEDES E INVITADOS VIP */}
                {activeCategoryObj.type === 'GUESTS' ? (
                  <div className="domus-hsp-flip-grid">
                    {filteredGuests.map((guest) => {
                      const isFlipped = flippedCardId === guest.id;
                      const glowCol = guest.protocolActive
                        ? '#10B981'
                        : guest.hasAllergy
                        ? '#EE6B5F'
                        : guest.color;

                      return (
                        <div
                          key={guest.id}
                          className={`domus-hsp-flip-scene ${isFlipped ? 'is-flipped' : ''}`}
                          style={{ '--card-glow': glowCol }}
                          onClick={() => setFlippedCardId(isFlipped ? null : guest.id)}
                        >
                          <div className="domus-hsp-flip-backlight"></div>

                          <div className="domus-hsp-flip-inner">
                            {/* CARA FRONTAL: RETRATO VIP + RESUMEN DE PREFERENCIAS */}
                            <div className="domus-hsp-face domus-hsp-front">
                              <div
                                className="domus-hsp-front-bg"
                                style={{ backgroundImage: `url('${guest.photo}')` }}
                              ></div>
                              <div className="domus-hsp-front-shade"></div>

                              <div className="domus-hsp-front-top">
                                <span
                                  className="domus-hsp-status-pill"
                                  style={{
                                    background: guest.protocolActive
                                      ? '#10B981'
                                      : guest.status === 'PROXIMA_VISITA'
                                      ? '#5E7AC6'
                                      : 'rgba(24, 28, 38, 0.78)'
                                  }}
                                >
                                  {guest.protocolActive
                                    ? '● PROTOCOLO VIP ACTIVO'
                                    : guest.lastVisit.toUpperCase()}
                                </span>

                                <span className="domus-hsp-flip-hint">
                                  <RotateCw size={13} /> Pasaporte 3D
                                </span>
                              </div>

                              <div className="domus-hsp-front-glass">
                                <div className="domus-hsp-front-title-row">
                                  <div>
                                    <small>{guest.relation}</small>
                                    <h4>{guest.name}</h4>
                                  </div>
                                  <div className="domus-hsp-temp-chip">
                                    <strong>{guest.temp}°C</strong>
                                    <span>Clima</span>
                                  </div>
                                </div>

                                <div className="domus-hsp-front-Suite">
                                  <Bed size={13} color="#5E7AC6" />
                                  <span>{guest.suite}</span>
                                </div>

                                <div className="domus-hsp-front-bev">
                                  <Coffee size={13} color="#BE7AC6" />
                                  <span>{guest.beverage}</span>
                                </div>

                                {guest.hasAllergy && (
                                  <div className="domus-hsp-allergy-strip">
                                    <span>⚠️ {guest.dietary}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* CARA REVERSO: PASAPORTE VIP 100% EDITABLE EN VIVO */}
                            <div
                              className="domus-hsp-face domus-hsp-back"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="domus-hsp-back-head">
                                <div className="domus-hsp-back-person">
                                  <img src={guest.photo} alt={guest.name} />
                                  <div>
                                    <h4>{guest.name}</h4>
                                    <span>Preferencias Multidepartamento</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="domus-hsp-unflip-btn"
                                  onClick={() => setFlippedCardId(null)}
                                >
                                  <RotateCw size={13} /> Frente
                                </button>
                              </div>

                              <div className="domus-hsp-edit-form">
                                {/* Suite y Clima */}
                                <div className="domus-hsp-row-climate">
                                  <div className="suite-col">
                                    <label><Bed size={10} /> Suite / Espacio Asignado</label>
                                    <select
                                      value={guest.suite}
                                      onChange={(e) => updateGuestField(guest.id, 'suite', e.target.value)}
                                    >
                                      {suites.map((s) => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="temp-col">
                                    <label><Thermometer size={10} /> Clima</label>
                                    <div className="domus-hsp-mini-stepper">
                                      <button
                                        type="button"
                                        onClick={() => updateGuestField(guest.id, 'temp', guest.temp - 1)}
                                      >
                                        <Minus size={11} />
                                      </button>
                                      <strong>{guest.temp}°C</strong>
                                      <button
                                        type="button"
                                        onClick={() => updateGuestField(guest.id, 'temp', guest.temp + 1)}
                                      >
                                        <Plus size={11} />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Gastronomía y Dieta */}
                                <div>
                                  <label><Utensils size={10} /> Dieta, Platos y Alergias (Sincronizado con Cocina)</label>
                                  <input
                                    type="text"
                                    value={guest.dietary}
                                    onChange={(e) => updateGuestField(guest.id, 'dietary', e.target.value)}
                                  />
                                </div>

                                {/* Bebida de Bienvenida */}
                                <div>
                                  <label><Coffee size={10} /> Protocolo de Bebida al Llegar</label>
                                  <input
                                    type="text"
                                    value={guest.beverage}
                                    onChange={(e) => updateGuestField(guest.id, 'beverage', e.target.value)}
                                  />
                                </div>

                                {/* Almohada & Vehículo */}
                                <div className="domus-hsp-row-2">
                                  <div>
                                    <label>Almohada y Lencería</label>
                                    <input
                                      type="text"
                                      value={guest.pillow}
                                      onChange={(e) => updateGuestField(guest.id, 'pillow', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label><CarFront size={10} /> Vehículo / Garita</label>
                                    <input
                                      type="text"
                                      value={guest.vehicle}
                                      onChange={(e) => updateGuestField(guest.id, 'vehicle', e.target.value)}
                                    />
                                  </div>
                                </div>

                                {/* Amenidades Táctiles */}
                                <div>
                                  <label><Heart size={10} /> Atenciones Especiales en Suite</label>
                                  <div className="domus-hsp-chips-wrap">
                                    {AMENITY_OPTIONS.map((am) => {
                                      const active = guest.amenities.includes(am);
                                      return (
                                        <button
                                          key={am}
                                          type="button"
                                          className={`domus-hsp-chip-btn ${active ? 'active' : ''}`}
                                          onClick={(e) => toggleGuestAmenity(e, guest.id, am)}
                                        >
                                          {active && <Check size={10} />}
                                          <span>{am}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {savedCardToast === guest.id ? (
                                <div className="domus-hsp-saved-pill">
                                  <CheckCircle2 size={15} /> ¡Pasaporte VIP Guardado!
                                </div>
                              ) : (
                                <div className="domus-hsp-back-actions">
                                  <button
                                    type="button"
                                    className="domus-hsp-btn-save"
                                    onClick={(e) => handleSaveCard(e, guest.id)}
                                  >
                                    <Check size={14} />
                                    <span>[ GUARDAR ]</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="domus-hsp-btn-dispatch"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDispatchTarget(guest);
                                    }}
                                  >
                                    <Bell size={14} />
                                    <span>[ ACTIVAR LLEGADA ]</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* MODO B: TARJETAS 3D DE SUITES Y SALONES */
                  <div className="domus-hsp-flip-grid">
                    {filteredSuites.map((suite) => {
                      const isFlipped = flippedCardId === suite.id;
                      const suiteColor =
                        suite.status === 'LISTA'
                          ? '#10B981'
                          : suite.status === 'OCUPADA_VIP'
                          ? '#5E7AC6'
                          : '#EE6B5F';

                      return (
                        <div
                          key={suite.id}
                          className={`domus-hsp-flip-scene ${isFlipped ? 'is-flipped' : ''}`}
                          style={{ '--card-glow': suiteColor }}
                          onClick={() => setFlippedCardId(isFlipped ? null : suite.id)}
                        >
                          <div className="domus-hsp-flip-backlight"></div>

                          <div className="domus-hsp-flip-inner">
                            {/* FRENTE DE LA SUITE */}
                            <div className="domus-hsp-face domus-hsp-front">
                              <div
                                className="domus-hsp-front-bg"
                                style={{ backgroundImage: `url('${suite.img}')` }}
                              ></div>
                              <div className="domus-hsp-front-shade"></div>

                              <div className="domus-hsp-front-top">
                                <span
                                  className="domus-hsp-status-pill"
                                  style={{ background: suiteColor }}
                                >
                                  {suite.status === 'LISTA'
                                    ? '● SUITE IMPECABLE · LISTA'
                                    : '● OCUPADA · PROTOCOLO VIP'}
                                </span>
                                <span className="domus-hsp-flip-hint">
                                  <RotateCw size={13} /> Control 3D
                                </span>
                              </div>

                              <div className="domus-hsp-front-glass">
                                <div className="domus-hsp-front-title-row">
                                  <div>
                                    <small>{suite.zone}</small>
                                    <h4>{suite.name}</h4>
                                  </div>
                                  <div className="domus-hsp-temp-chip">
                                    <strong>{suite.temp}°C</strong>
                                    <span>A/C</span>
                                  </div>
                                </div>

                                <div className="domus-hsp-front-Suite">
                                  <Users size={13} color="#5E7AC6" />
                                  <span>{suite.assignedTo}</span>
                                </div>

                                <div className="domus-hsp-front-bev">
                                  <Sparkles size={13} color="#BE7AC6" />
                                  <span>{suite.linen}</span>
                                </div>
                              </div>
                            </div>

                            {/* REVERSO EDITABLE DE LA SUITE */}
                            <div
                              className="domus-hsp-face domus-hsp-back"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="domus-hsp-back-head">
                                <div className="domus-hsp-back-person">
                                  <img src={suite.img} alt={suite.name} />
                                  <div>
                                    <h4>{suite.name}</h4>
                                    <span>Domótica, Lencería y Camarera</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="domus-hsp-unflip-btn"
                                  onClick={() => setFlippedCardId(null)}
                                >
                                  <RotateCw size={13} /> Frente
                                </button>
                              </div>

                              <div className="domus-hsp-edit-form">
                                <div className="domus-hsp-row-climate">
                                  <div className="suite-col">
                                    <label>Asignación / Huésped Actual</label>
                                    <input
                                      type="text"
                                      value={suite.assignedTo}
                                      onChange={(e) => updateSuiteField(suite.id, 'assignedTo', e.target.value)}
                                    />
                                  </div>
                                  <div className="temp-col">
                                    <label>Termostato</label>
                                    <div className="domus-hsp-mini-stepper">
                                      <button
                                        type="button"
                                        onClick={() => updateSuiteField(suite.id, 'temp', suite.temp - 1)}
                                      >
                                        <Minus size={11} />
                                      </button>
                                      <strong>{suite.temp}°C</strong>
                                      <button
                                        type="button"
                                        onClick={() => updateSuiteField(suite.id, 'temp', suite.temp + 1)}
                                      >
                                        <Plus size={11} />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label>Protocolo de Lencería y Almohadas</label>
                                  <input
                                    type="text"
                                    value={suite.linen}
                                    onChange={(e) => updateSuiteField(suite.id, 'linen', e.target.value)}
                                  />
                                </div>

                                <div className="domus-hsp-row-2">
                                  <div>
                                    <label>Camarera Responsable</label>
                                    <input
                                      type="text"
                                      value={suite.housekeeper}
                                      onChange={(e) => updateSuiteField(suite.id, 'housekeeper', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label>Aroma Ambiental</label>
                                    <input
                                      type="text"
                                      value={suite.scent}
                                      onChange={(e) => updateSuiteField(suite.id, 'scent', e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label>Checklist de Auditoría de Suite ({suite.checks.length}/6)</label>
                                  <div className="domus-hsp-chips-wrap">
                                    {SUITE_CHECK_OPTIONS.map((chk) => {
                                      const active = suite.checks.includes(chk);
                                      return (
                                        <button
                                          key={chk}
                                          type="button"
                                          className={`domus-hsp-chip-btn ${active ? 'active' : ''}`}
                                          onClick={(e) => toggleSuiteCheck(e, suite.id, chk)}
                                        >
                                          {active && <Check size={10} />}
                                          <span>{chk}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              <div className="domus-hsp-back-actions">
                                <button
                                  type="button"
                                  className="domus-hsp-btn-save"
                                  onClick={(e) => handleSaveCard(e, suite.id)}
                                >
                                  <Check size={14} />
                                  <span>[ GUARDAR SUITE ]</span>
                                </button>
                                <button
                                  type="button"
                                  className="domus-hsp-btn-dispatch"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateSuiteField(
                                      suite.id,
                                      'status',
                                      suite.status === 'LISTA' ? 'OCUPADA_VIP' : 'LISTA'
                                    );
                                    setFlippedCardId(null);
                                  }}
                                >
                                  <Sparkles size={14} />
                                  <span>[ CAMBIAR ESTATUS ]</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* VISTA 2: BITÁCORA DE ÓRDENES ENVIADAS A COCINA, GARITA Y CAMARERAS */}
          {activeTab === 'BITACORA' && (
            <div className="domus-hsp-logs-card">
              <div className="domus-hsp-logs-head">
                <div>
                  <h3>Historial de Despachos de Conserjería VIP</h3>
                  <p>Registro en tiempo real de las alertas enviadas a Cocina, Camareras, Mantenimiento y Garita</p>
                </div>
              </div>

              <div className="domus-hsp-logs-stack">
                {dispatchLogs.map((log) => (
                  <div key={log.id} className="domus-hsp-log-row">
                    <div className="domus-hsp-log-dot" style={{ background: log.color }}></div>
                    <div className="domus-hsp-log-info">
                      <strong>{log.guest} · <span style={{ color: '#5E7AC6' }}>{log.eta} ({log.pax})</span></strong>
                      <span>{log.orders}</span>
                    </div>
                    <small className="domus-hsp-log-time">{log.time}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ==========================================
            4. MODAL FLOTANTE DESPACHADOR CONCIERGE (CONCIERGE DISPATCH MODAL)
            ========================================== */}
        {dispatchTarget && (
          <div className="domus-hsp-dispatch-backdrop" onClick={() => setDispatchTarget(null)}>
            <div className="domus-hsp-dispatch-window" onClick={(e) => e.stopPropagation()}>
              <div className="domus-hsp-dispatch-top">
                <div className="domus-hsp-back-person">
                  <img src={dispatchTarget.photo} alt={dispatchTarget.name} />
                  <div>
                    <span className="domus-hsp-mode-tag">ACTIVACIÓN MULTIDEPARTAMENTO</span>
                    <h3>{dispatchTarget.name}</h3>
                    <small>{dispatchTarget.suite} · Clima preferido: {dispatchTarget.temp}°C</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="domus-hsp-close-sm"
                  onClick={() => setDispatchTarget(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tiempo estimado de llegada (Píldoras táctiles) */}
              <div className="domus-hsp-eta-section">
                <label>Tiempo Estimado de Llegada / Estado</label>
                <div className="domus-hsp-eta-pills">
                  {['Ya en Garita', 'En 15 minutos', 'En 1 hora', 'Mañana 12:30 PM'].map((eta) => (
                    <button
                      key={eta}
                      type="button"
                      className={`domus-hsp-eta-btn ${dispatchEta === eta ? 'active' : ''}`}
                      onClick={() => setDispatchEta(eta)}
                    >
                      {eta}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector numérico táctil de comensales / acompañantes */}
              <div className="domus-hsp-pax-screen">
                <div>
                  <small>COMENSALES / PERSONAS A RECIBIR</small>
                  <strong>{dispatchPax} {dispatchPax === 1 ? 'Persona' : 'Personas'}</strong>
                </div>
                <div className="domus-hsp-pax-controls">
                  <button type="button" onClick={() => setDispatchPax(Math.max(1, dispatchPax - 1))}>
                    <Minus size={18} />
                  </button>
                  <button type="button" onClick={() => setDispatchPax(dispatchPax + 1)}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Departamentos que recibirán la orden automática */}
              <div className="domus-hsp-depts-check">
                <label>Órdenes Simultáneas a Enviar a las Tabletas</label>
                <div
                  className={`domus-hsp-dept-toggle ${notifyKitchen ? 'on' : ''}`}
                  onClick={() => setNotifyKitchen(!notifyKitchen)}
                >
                  <div className="check-box">{notifyKitchen && <Check size={13} />}</div>
                  <div>
                    <strong>Cocina & Barismo</strong>
                    <span>Preparar: {dispatchTarget.beverage} · Dieta: {dispatchTarget.dietary}</span>
                  </div>
                </div>

                <div
                  className={`domus-hsp-dept-toggle ${notifyHousekeeping ? 'on' : ''}`}
                  onClick={() => setNotifyHousekeeping(!notifyHousekeeping)}
                >
                  <div className="check-box">{notifyHousekeeping && <Check size={13} />}</div>
                  <div>
                    <strong>Camareras & Climatización</strong>
                    <span>Habilitar {dispatchTarget.suite} a {dispatchTarget.temp}°C ({dispatchTarget.amenities.join(', ')})</span>
                  </div>
                </div>

                <div
                  className={`domus-hsp-dept-toggle ${notifyGate ? 'on' : ''}`}
                  onClick={() => setNotifyGate(!notifyGate)}
                >
                  <div className="check-box">{notifyGate && <Check size={13} />}</div>
                  <div>
                    <strong>Seguridad & Garita Principal</strong>
                    <span>Autorizar ingreso directo: {dispatchTarget.vehicle}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="domus-hsp-confirm-dispatch"
                onClick={handleConfirmDispatch}
              >
                <Send size={17} />
                <span>[ SINCRONIZAR LLEGADA VIP AHORA ]</span>
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            PIE DEL MODAL
            ========================================== */}
        <footer className="domus-hsp-footer">
          <span>Progressive Disclosure & 3D Concierge Cards · Conectado con Cocina, Lencería, Clima y Garita</span>
          <button className="domus-hsp-close-btn" onClick={onClose}>
            VOLVER AL PANEL PRINCIPAL
          </button>
        </footer>

        {/* ==========================================
            HOJA DE ESTILOS AISLADA (3D FLIP HOSPITALITY + CONCIERGE)
            ========================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          .domus-hsp-overlay {
            position: fixed; inset: 0; z-index: 190;
            background: rgba(18, 22, 36, 0.58);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            animation: domusHspFade 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 768px) {
            .domus-hsp-overlay { padding: 20px; }
          }
          @keyframes domusHspFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-hsp-modal {
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
            .domus-hsp-modal {
              height: 92vh;
              border-radius: 36px;
            }
          }

          .domus-hsp-watermark {
            position: absolute; right: -40px; bottom: 40px;
            width: 280px; height: 280px; object-fit: contain;
            opacity: 0.04; pointer-events: none; z-index: 0;
          }

          /* HEADER */
          .domus-hsp-header {
            position: relative; z-index: 2;
            padding: 16px 18px 14px;
            background: rgba(255, 255, 255, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.92);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-hsp-header { padding: 20px 32px 16px; }
          }
          .domus-hsp-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 10px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
            margin-bottom: 3px;
          }
          .domus-hsp-title-wrap h2 {
            font-size: clamp(20px, 2.5vw, 27px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-hsp-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-hsp-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 7px 14px; border-radius: 15px;
          }
          @media (min-width: 640px) { .domus-hsp-kpi { display: flex; } }
          .domus-hsp-kpi small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080; }
          .domus-hsp-kpi strong { font-size: 13px; font-weight: 900; }

          .domus-hsp-close {
            width: 40px; height: 40px; border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.08);
            background: #fff; color: #202020;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-hsp-close:hover {
            background: #EE6B5F; color: #fff; border-color: #EE6B5F; transform: rotate(90deg);
          }

          /* TABS & SEARCH */
          .domus-hsp-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.48);
            border-bottom: 1px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-hsp-tabs-bar { padding: 12px 32px; } }
          .domus-hsp-tabs { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; }
          .domus-hsp-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 16px; border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.7);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer; transition: all 0.22s ease;
          }
          .domus-hsp-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-hsp-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }

          .domus-hsp-search-row { display: flex; align-items: center; gap: 8px; }
          .domus-hsp-search {
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 14px; min-width: 220px;
          }
          .domus-hsp-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }
          .domus-hsp-new-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 14px; border: none;
            background: #202020; color: #fff;
            font-size: 11px; font-weight: 900; cursor: pointer; white-space: nowrap;
          }
          .domus-hsp-new-btn:hover { background: #5E7AC6; }

          /* BODY */
          .domus-hsp-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
            display: flex; flex-direction: column; gap: 22px;
          }
          @media (min-width: 768px) { .domus-hsp-body { padding: 22px 32px; } }

          /* LEVELS */
          .domus-hsp-level { display: flex; flex-direction: column; gap: 12px; }
          .domus-hsp-lvl-head { display: flex; align-items: center; gap: 10px; }
          .domus-hsp-step-badge {
            background: #5E7AC6; color: #fff;
            font-size: 9px; font-weight: 900; letter-spacing: 0.12em;
            padding: 4px 9px; border-radius: 99px;
          }
          .domus-hsp-lvl-head h3 {
            margin: 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }

          /* NIVEL 1: CARRUSEL HOSPITALIDAD */
          .domus-hsp-lvl1-carousel {
            display: flex; gap: 16px; overflow-x: auto;
            padding: 6px 4px 12px; scroll-snap-type: x mandatory;
          }
          .domus-hsp-lvl1-card {
            position: relative;
            min-width: 240px; height: 124px; flex: 1;
            scroll-snap-align: start; cursor: pointer;
            transition: transform 0.25s ease;
          }
          .domus-hsp-lvl1-card:hover { transform: translateY(-4px); }
          .domus-hsp-lvl1-backlight {
            position: absolute; inset: -5px; border-radius: 26px;
            background: var(--cat-accent); filter: blur(14px);
            opacity: 0; transition: opacity 0.28s ease; z-index: 0;
          }
          .domus-hsp-lvl1-card.active .domus-hsp-lvl1-backlight,
          .domus-hsp-lvl1-card:hover .domus-hsp-lvl1-backlight {
            opacity: 0.55;
          }
          .domus-hsp-lvl1-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%; border-radius: 22px; overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 12px 16px; box-sizing: border-box;
          }
          .domus-hsp-lvl1-bg {
            position: absolute; inset: 0; background-size: cover; background-position: center;
            transition: transform 0.5s ease;
          }
          .domus-hsp-lvl1-card:hover .domus-hsp-lvl1-bg { transform: scale(1.08); }
          .domus-hsp-lvl1-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0.82) 100%);
          }
          .domus-hsp-lvl1-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between; gap: 6px;
          }
          .domus-hsp-lvl1-sub {
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            color: #fff; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-hsp-lvl1-ok {
            font-size: 9px; font-weight: 900; background: #10B981; color: #fff;
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-hsp-lvl1-bottom { position: relative; z-index: 2; color: #fff; }
          .domus-hsp-lvl1-bottom h4 { margin: 0; font-size: 18px; font-weight: 900; }
          .domus-hsp-lvl1-bottom span { font-size: 10.5px; font-weight: 700; opacity: 0.85; }

          /* NIVEL 2: SUB-FILTROS */
          .domus-hsp-lvl2-carousel {
            display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 8px;
          }
          .domus-hsp-lvl2-pill {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px; border-radius: 18px;
            background: rgba(255, 255, 255, 0.78);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
          }
          .domus-hsp-lvl2-pill.active {
            background: var(--sub-accent); color: #fff;
            box-shadow: 0 10px 22px -6px var(--sub-accent);
          }
          .domus-hsp-lvl2-icon {
            width: 32px; height: 32px; border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            display: flex; align-items: center; justify-content: center; font-size: 15px;
          }
          .domus-hsp-lvl2-info { text-align: left; display: flex; flex-direction: column; }
          .domus-hsp-lvl2-info strong { font-size: 12.5px; font-weight: 900; color: #202020; }
          .domus-hsp-lvl2-info span { font-size: 10px; font-weight: 700; color: #666; }
          .domus-hsp-lvl2-pill.active .domus-hsp-lvl2-info strong,
          .domus-hsp-lvl2-pill.active .domus-hsp-lvl2-info span {
            color: #fff;
          }

          /* NIVEL 3: GRILLA DE TARJETAS 3D FLIP */
          .domus-hsp-flip-grid {
            display: grid; grid-template-columns: 1fr; gap: 22px;
          }
          @media (min-width: 680px) {
            .domus-hsp-flip-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1120px) {
            .domus-hsp-flip-grid { grid-template-columns: repeat(3, 1fr); }
          }

          .domus-hsp-flip-scene {
            position: relative;
            height: 430px;
            perspective: 1400px;
            cursor: pointer;
          }
          .domus-hsp-flip-backlight {
            position: absolute; inset: -6px; border-radius: 32px;
            background: var(--card-glow);
            filter: blur(18px); opacity: 0.22;
            transition: opacity 0.3s ease; z-index: 0;
          }
          .domus-hsp-flip-scene:hover .domus-hsp-flip-backlight,
          .domus-hsp-flip-scene.is-flipped .domus-hsp-flip-backlight {
            opacity: 0.58;
          }

          .domus-hsp-flip-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%;
            transition: transform 0.68s cubic-bezier(0.22, 1, 0.36, 1);
            transform-style: preserve-3d;
          }
          .domus-hsp-flip-scene.is-flipped .domus-hsp-flip-inner {
            transform: rotateY(180deg);
          }

          .domus-hsp-face {
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
          .domus-hsp-front {
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 16px;
          }
          .domus-hsp-front-bg {
            position: absolute; inset: 0;
            background-size: cover; background-position: center;
            transition: transform 0.6s ease;
          }
          .domus-hsp-flip-scene:hover .domus-hsp-front-bg { transform: scale(1.06); }
          .domus-hsp-front-shade {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.12) 0%, rgba(15, 23, 42, 0.3) 45%, rgba(15, 23, 42, 0.86) 100%);
          }
          .domus-hsp-front-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-hsp-status-pill {
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.08em;
            color: #fff; padding: 6px 12px; border-radius: 99px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          }
          .domus-hsp-flip-hint {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
            color: #202020; font-size: 10px; font-weight: 900;
            padding: 6px 11px; border-radius: 99px;
          }

          .domus-hsp-front-glass {
            position: relative; z-index: 2;
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.96);
            border-radius: 22px; padding: 15px;
            display: flex; flex-direction: column; gap: 8px;
          }
          .domus-hsp-front-title-row {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          }
          .domus-hsp-front-title-row small {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.07em; color: #5E7AC6;
          }
          .domus-hsp-front-title-row h4 {
            margin: 2px 0 0; font-size: 18px; font-weight: 900; color: #202020; line-height: 1.1;
          }
          .domus-hsp-temp-chip {
            background: #181C26; color: #fff;
            padding: 5px 10px; border-radius: 12px; text-align: center; flex-shrink: 0;
          }
          .domus-hsp-temp-chip strong { font-size: 14px; font-weight: 900; color: #6EE7B7; display: block; line-height: 1; }
          .domus-hsp-temp-chip span { font-size: 8.5px; font-weight: 800; color: rgba(255,255,255,0.7); }

          .domus-hsp-front-Suite, .domus-hsp-front-bev {
            display: flex; align-items: center; gap: 7px;
            font-size: 11px; font-weight: 800; color: #444;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .domus-hsp-allergy-strip {
            background: rgba(238, 107, 95, 0.14);
            border: 1px solid rgba(238, 107, 95, 0.35);
            color: #C83E31; font-size: 10px; font-weight: 900;
            padding: 5px 9px; border-radius: 10px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          /* REVERSO EDITABLE */
          .domus-hsp-back {
            transform: rotateY(180deg);
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(28px);
            padding: 15px 16px;
            display: flex; flex-direction: column; justify-content: space-between;
            cursor: default;
          }
          .domus-hsp-back-head {
            display: flex; align-items: center; justify-content: space-between;
            padding-bottom: 8px; border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          }
          .domus-hsp-back-person {
            display: flex; align-items: center; gap: 10px;
          }
          .domus-hsp-back-person img {
            width: 38px; height: 38px; border-radius: 12px; object-fit: cover;
          }
          .domus-hsp-back-person h4 {
            margin: 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }
          .domus-hsp-back-person span {
            font-size: 9.5px; font-weight: 800; color: #5E7AC6; text-transform: uppercase;
          }
          .domus-hsp-unflip-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 11px; border-radius: 99px;
            border: 1px solid rgba(0,0,0,0.1); background: #F4F6FA;
            font-size: 10px; font-weight: 900; color: #202020; cursor: pointer;
          }

          .domus-hsp-edit-form {
            display: flex; flex-direction: column; gap: 7px;
          }
          .domus-hsp-edit-form label {
            display: flex; align-items: center; gap: 4px;
            font-size: 8.5px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.06em; color: #666; margin-bottom: 2px;
          }
          .domus-hsp-edit-form input, .domus-hsp-edit-form select {
            width: 100%; box-sizing: border-box;
            padding: 6px 9px; border-radius: 9px;
            border: 1px solid rgba(0, 0, 0, 0.12); background: #F7F9FC;
            font-size: 11px; font-weight: 800; color: #202020; outline: none;
          }
          .domus-hsp-row-climate {
            display: grid; grid-template-columns: 1.45fr 0.9fr; gap: 8px;
          }
          .domus-hsp-row-2 {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          }
          .domus-hsp-mini-stepper {
            display: flex; align-items: center; justify-content: space-between;
            background: #181C26; color: #fff;
            padding: 4px 6px; border-radius: 9px;
          }
          .domus-hsp-mini-stepper button {
            width: 22px; height: 22px; border-radius: 6px; border: none;
            background: rgba(255,255,255,0.16); color: #fff;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
          }
          .domus-hsp-mini-stepper strong { font-size: 11.5px; font-weight: 900; color: #6EE7B7; }

          .domus-hsp-chips-wrap {
            display: flex; flex-wrap: wrap; gap: 4px;
          }
          .domus-hsp-chip-btn {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 4px 8px; border-radius: 7px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #F4F6FA; color: #666;
            font-size: 9.5px; font-weight: 800; cursor: pointer;
          }
          .domus-hsp-chip-btn.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
          }

          .domus-hsp-back-actions {
            display: grid; grid-template-columns: 0.9fr 1.25fr; gap: 8px;
            padding-top: 4px;
          }
          .domus-hsp-btn-save {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #10B981; color: #fff;
            font-size: 10px; font-weight: 900; cursor: pointer;
          }
          .domus-hsp-btn-dispatch {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #EE6B5F; color: #fff;
            font-size: 10px; font-weight: 900; cursor: pointer;
            box-shadow: 0 6px 14px rgba(238, 107, 95, 0.3);
          }
          .domus-hsp-saved-pill {
            padding: 9px; border-radius: 12px;
            background: rgba(16, 185, 129, 0.16); color: #065F46;
            font-size: 11px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 6px;
          }

          /* 4. MODAL FLOTANTE CONCIERGE DISPATCH */
          .domus-hsp-dispatch-backdrop {
            position: fixed; inset: 0; z-index: 230;
            background: rgba(15, 23, 42, 0.58); backdrop-filter: blur(12px);
            display: flex; align-items: center; justify-content: center; padding: 16px;
          }
          .domus-hsp-dispatch-window {
            width: 100%; max-width: 460px;
            background: rgba(255, 255, 255, 0.97);
            border-radius: 32px; padding: 22px;
            box-shadow: 0 28px 70px rgba(15, 23, 42, 0.4);
            display: flex; flex-direction: column; gap: 14px;
          }
          .domus-hsp-dispatch-top {
            display: flex; align-items: flex-start; justify-content: space-between;
          }
          .domus-hsp-mode-tag {
            display: inline-block; font-size: 8.5px; font-weight: 900;
            letter-spacing: 0.1em; color: #EE6B5F;
            background: rgba(238, 107, 95, 0.14); padding: 3px 8px; border-radius: 99px;
          }
          .domus-hsp-dispatch-top h3 { margin: 2px 0; font-size: 19px; font-weight: 900; }
          .domus-hsp-dispatch-top small { font-size: 11.5px; color: #666; }
          .domus-hsp-close-sm {
            width: 34px; height: 34px; border-radius: 50%; border: none;
            background: #F4F6FA; cursor: pointer; display: flex; align-items: center; justify-content: center;
          }

          .domus-hsp-eta-section label, .domus-hsp-depts-check label {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.08em; color: #5E7AC6;
            margin-bottom: 6px;
          }
          .domus-hsp-eta-pills {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
          }
          .domus-hsp-eta-btn {
            padding: 10px; border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.08); background: #F7F9FC;
            font-size: 11.5px; font-weight: 800; color: #444; cursor: pointer;
          }
          .domus-hsp-eta-btn.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
          }

          .domus-hsp-pax-screen {
            display: flex; align-items: center; justify-content: space-between;
            background: #181C26; color: #fff;
            padding: 12px 18px; border-radius: 18px;
          }
          .domus-hsp-pax-screen small {
            display: block; font-size: 8.5px; font-weight: 800; color: rgba(255,255,255,0.65);
          }
          .domus-hsp-pax-screen strong { font-size: 22px; font-weight: 900; color: #6EE7B7; }
          .domus-hsp-pax-controls { display: flex; gap: 8px; }
          .domus-hsp-pax-controls button {
            width: 38px; height: 38px; border-radius: 12px; border: none;
            background: rgba(255,255,255,0.16); color: #fff;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
          }

          .domus-hsp-depts-check { display: flex; flex-direction: column; gap: 8px; }
          .domus-hsp-dept-toggle {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-radius: 14px;
            background: #F7F9FC; border: 1px solid rgba(0,0,0,0.06);
            cursor: pointer; opacity: 0.6;
          }
          .domus-hsp-dept-toggle.on {
            opacity: 1; background: rgba(16, 185, 129, 0.08);
            border-color: rgba(16, 185, 129, 0.35);
          }
          .domus-hsp-dept-toggle .check-box {
            width: 22px; height: 22px; border-radius: 7px;
            background: #10B981; color: #fff;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .domus-hsp-dept-toggle strong { display: block; font-size: 12px; font-weight: 900; color: #202020; }
          .domus-hsp-dept-toggle span { font-size: 10.5px; color: #666; font-weight: 600; }

          .domus-hsp-confirm-dispatch {
            width: 100%; padding: 15px; border: none; border-radius: 16px;
            background: #10B981; color: #fff;
            font-size: 12.5px; font-weight: 900; letter-spacing: 0.08em;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer; box-shadow: 0 10px 24px rgba(16, 185, 129, 0.35);
          }

          /* ADD DRAWER & LOGS */
          .domus-hsp-add-drawer {
            background: #fff; border: 1.5px solid rgba(94, 122, 198, 0.35);
            border-radius: 24px; padding: 18px;
          }
          .domus-hsp-drawer-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
          }
          .domus-hsp-drawer-head span { font-size: 9.5px; font-weight: 900; color: #5E7AC6; }
          .domus-hsp-drawer-head h4 { margin: 2px 0 0; font-size: 16px; font-weight: 900; }
          .domus-hsp-drawer-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;
          }
          .domus-hsp-drawer-grid label {
            display: block; font-size: 9.5px; font-weight: 900; color: #666; margin-bottom: 4px;
          }
          .domus-hsp-drawer-grid input, .domus-hsp-drawer-grid select {
            width: 100%; box-sizing: border-box; padding: 9px 11px; border-radius: 11px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC; font-size: 12px; font-weight: 700;
          }
          .domus-hsp-drawer-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
          .domus-hsp-save-new {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 10px 18px; border-radius: 12px; border: none;
            background: #10B981; color: #fff; font-size: 11.5px; font-weight: 900; cursor: pointer;
          }

          .domus-hsp-logs-card {
            background: rgba(255,255,255,0.85); border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
          }
          .domus-hsp-logs-head h3 { margin: 0 0 4px; font-size: 18px; font-weight: 900; }
          .domus-hsp-logs-head p { margin: 0 0 16px; font-size: 12px; color: #666; }
          .domus-hsp-logs-stack { display: flex; flex-direction: column; gap: 10px; }
          .domus-hsp-log-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 16px; border-radius: 16px; background: #F7F9FC;
          }
          .domus-hsp-log-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
          .domus-hsp-log-info { flex: 1; display: flex; flex-direction: column; }
          .domus-hsp-log-info strong { font-size: 13.5px; font-weight: 900; color: #202020; }
          .domus-hsp-log-info span { font-size: 11.5px; color: #555; font-weight: 600; }
          .domus-hsp-log-time { font-size: 11px; font-weight: 800; color: #888; }

          /* FOOTER */
          .domus-hsp-footer {
            position: relative; z-index: 2;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.78);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px; font-size: 11px; font-weight: 700; color: #666;
          }
          .domus-hsp-close-btn {
            padding: 11px 18px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.12); background: #fff;
            font-size: 11px; font-weight: 900; color: #202020; cursor: pointer;
          }
        `}} />
      </div>
    </div>
  );
}