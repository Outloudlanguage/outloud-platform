import React, { useState, useMemo } from 'react';
import {
  X, Sparkles, Users, Coffee, ShieldCheck, Bed, Calendar,
  CheckCircle2, Plus, Search, CarFront, Thermometer, Heart,
  Clock, Check, Bell, Utensils, Wine, Key, Sun
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

const INITIAL_VIP_GUESTS = [
  {
    id: 'vip-1',
    name: 'Sr. Álvaro Jiménez',
    relation: 'Hijo · Familia Directa',
    category: 'Familia',
    avatar: 'AJ',
    color: '#5E7AC6',
    status: 'EN_CASA',
    lastVisit: 'Hoy · Almuerzo y Tarde',
    suite: 'Suite Terraza Norte',
    temp: '21°C',
    pillow: 'Firme Ortopédica + Lencería Egipcia Blanca',
    dietary: 'Sin lácteos enteros · Prefiere carnes término medio y pescado a la plancha',
    beverage: 'Espresso doble sin azúcar al llegar · Agua mineral con gas bien fría',
    vehicle: 'Toyota 4Runner Plata · Placa AA892KL (Pase Permanente Garita)',
    specialNotes: 'Dejar prensa del día y cargador USB-C en mesa de noche derecha.',
    protocolActive: true
  },
  {
    id: 'vip-2',
    name: 'Sra. Carolina Jiménez',
    relation: 'Hija · Familia Directa',
    category: 'Familia',
    avatar: 'CJ',
    color: '#BE7AC6',
    status: 'PROXIMA_VISITA',
    lastVisit: 'Mañana · 12:30 PM',
    suite: 'Suite Huéspedes Jardín',
    temp: '23°C',
    pillow: 'Pluma de Ganso Suave · Edredón hipoalergénico ligero',
    dietary: 'Vegetariana flexible (Consume pescado blanco) · Alergia estricta a mariscos',
    beverage: 'Infusión de flor de jamaica o té verde tibio con rodaja de jengibre',
    vehicle: 'Mercedes-Benz GLC Blanco · Placa AB104MM (Pase Permanente)',
    specialNotes: 'Colocar orquídeas frescas en el tocador y jabón neutro artesanal.',
    protocolActive: false
  },
  {
    id: 'vip-3',
    name: 'Andrés y Sofía Jiménez',
    relation: 'Nietos · Visita Fin de Semana',
    category: 'Familia',
    avatar: 'AS',
    color: '#EE6B5F',
    status: 'REGISTRADO',
    lastVisit: 'Sábado Pasado',
    suite: 'Suite Doble Estudio',
    temp: '22°C',
    pillow: 'Estándar Suave · Mantas adicionales de algodón',
    dietary: 'Menú joven: Pastas artesanales, milanesa de pollo orgánica, frutas picadas',
    beverage: 'Jugo natural de parchita o fresa sin azúcar refinada · Merienda 4:00 PM',
    vehicle: 'Autorizados con Chófer de la Familia o ingreso directo por garita',
    specialNotes: 'Tener lista el área de piscina climatizada y toallas extras en terraza.',
    protocolActive: false
  },
  {
    id: 'vip-4',
    name: 'Dr. Alejandro Vegas',
    relation: 'Médico de Cabecera & Amigo de la Casa',
    category: 'Invitado VIP',
    avatar: 'AV',
    color: '#10B981',
    status: 'REGISTRADO',
    lastVisit: 'Jueves Pasado',
    suite: 'Salón Biblioteca & Estudio Principal',
    temp: '22°C',
    pillow: 'Uso Diurno · Recepción Ejecutiva',
    dietary: 'Bajo en sodio · Acompaña al Dr. Gustavo en almuerzos ligeros de pescado',
    beverage: 'Café negro recién molido en taza de porcelana al pasar a biblioteca',
    vehicle: 'Ford Explorer Negra · Placa AD441OP (Acceso Prioritario Médicos)',
    specialNotes: 'Tener listo el reporte impreso de signos vitales del Dr. Jiménez al recibirlo.',
    protocolActive: false
  },
  {
    id: 'vip-5',
    name: 'Sr. Henrique Mendoza & Sra.',
    relation: 'Amigos Íntimos de la Familia',
    category: 'Invitado VIP',
    avatar: 'HM',
    color: '#5E7AC6',
    status: 'REGISTRADO',
    lastVisit: 'Hace 2 semanas',
    suite: 'Comedor Principal & Terraza Sur',
    temp: '22°C',
    pillow: 'Recepción Social',
    dietary: 'Intolerancia al gluten (Sra. Mendoza) · Preferencia por lomito y ensaladas verdes',
    beverage: 'Vino tinto Reserva a 16°C y agua mineral en cristal',
    vehicle: 'Conducido por escolta / chófer (Notificar a Sup. Marcos en Garita)',
    specialNotes: 'Habilitar música instrumental suave en terraza y mesa con mantelería de lino.',
    protocolActive: false
  }
];

const INITIAL_SUITES = [
  {
    id: 'su-1',
    name: 'Suite Huéspedes Jardín',
    zone: 'Ala Este · Planta Baja',
    temp: '23°C',
    status: 'LISTA',
    assignedTo: 'Reservada: Sra. Carolina Jiménez',
    linen: 'Algodón Egipcio 600 Hilos · Lavanda Suave',
    housekeeper: 'Elena Castillo',
    checklist: ['Climatización a 23°C', 'Flores frescas en consola', 'Agua mineral en mesa de noche', 'Toallas térmicas listas']
  },
  {
    id: 'su-2',
    name: 'Suite Terraza Norte',
    zone: 'Planta Alta · Vista Ávila',
    temp: '21°C',
    status: 'OCUPADA_VIP',
    assignedTo: 'En uso: Sr. Álvaro Jiménez',
    linen: 'Lino Fresco Hipoalergénico · Almohada Firme',
    housekeeper: 'Elena Castillo',
    checklist: ['Climatización activa 21°C', 'Café espresso servido', 'Prensa y cargador listos', 'Cobertura nocturna 7:00 PM']
  },
  {
    id: 'su-3',
    name: 'Suite Doble Estudio',
    zone: 'Ala Oeste · Jardín',
    temp: '22°C',
    status: 'LISTA',
    assignedTo: 'Disponible · Nietos / Familia',
    linen: 'Percal Blanco Suave · Doble Cama Queen',
    housekeeper: 'Rosaura Díaz',
    checklist: ['Ventilación natural', 'Toallas de piscina listas', 'Mini-bar con jugos naturales', 'Lencería impecable']
  },
  {
    id: 'su-4',
    name: 'Salón Comedor & Terraza VIP',
    zone: 'Área Social Principal',
    temp: '22°C',
    status: 'LISTA',
    assignedTo: 'Listo para Almuerzo Familiar (4 puestos)',
    linen: 'Mantelería Lino Crudo · Vajilla Principal',
    housekeeper: 'María Fernanda Rojas',
    checklist: ['Mesa montada para 4 comensales', 'Cristalería pulida', 'Climatización central encendida', 'Menú coordinado con Chef']
  }
];

const INITIAL_VISITS = [
  {
    id: 'vis-1',
    guestName: 'Sr. Álvaro Jiménez',
    date: 'HOY · EN CURSO',
    type: 'Almuerzo y Tarde de Trabajo',
    pax: '1 Persona',
    areasNotified: ['Cocina: Espresso y Lomito', 'Garita: Ingreso Directo', 'Suite Norte: 21°C'],
    confirmed: true
  },
  {
    id: 'vis-2',
    guestName: 'Sra. Carolina Jiménez',
    date: 'MAÑANA · 12:30 PM',
    type: 'Almuerzo con el Dr. Gustavo y Pernocta',
    pax: '1 Persona',
    areasNotified: ['Cocina: Menú sin mariscos', 'Hospitalidad: Suite Jardín 23°C', 'Garita: Placa AB104MM'],
    confirmed: true
  },
  {
    id: 'vis-3',
    guestName: 'Almuerzo Familiar Dominical (Hijos y Nietos)',
    date: 'PRÓXIMO DOMINGO · 01:00 PM',
    type: 'Recepción Familiar en Terraza',
    pax: '6 Personas',
    areasNotified: ['Cocina: Menú 3 Tiempos + Infantil', 'Hospitalidad: Mesa Imperial', 'Seguridad: 3 Vehículos'],
    confirmed: false
  }
];

export default function HospitalityModal({ isOpen, onClose, initialTab = 'DIRECTORIO' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [guests, setGuests] = useState(INITIAL_VIP_GUESTS);
  const [suites, setSuites] = useState(INITIAL_SUITES);
  const [visits, setVisits] = useState(INITIAL_VISITS);
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(INITIAL_VIP_GUESTS[0]);
  const [dispatchToast, setDispatchToast] = useState(null);

  // Formulario de Nuevo Huésped / Invitado VIP
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newCategory, setNewCategory] = useState('Familia');
  const [newSuite, setNewSuite] = useState('Suite Huéspedes Jardín');
  const [newTemp, setNewTemp] = useState('22°C');
  const [newPillow, setNewPillow] = useState('Almohada Suave + Algodón Egipcio');
  const [newDietary, setNewDietary] = useState('');
  const [newBeverage, setNewBeverage] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchCat = filterCategory === 'Todos' || g.category === filterCategory;
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.relation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.dietary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [guests, filterCategory, searchQuery]);

  // Activa el protocolo VIP y notifica automáticamente a Cocina, Garita, Camareras y Mantenimiento
  const triggerVipProtocol = (guest) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guest.id
          ? { ...g, protocolActive: !g.protocolActive, status: !g.protocolActive ? 'EN_CASA' : 'REGISTRADO' }
          : g
      )
    );
    if (selectedGuest?.id === guest.id) {
      setSelectedGuest((prev) => ({
        ...prev,
        protocolActive: !prev.protocolActive,
        status: !prev.protocolActive ? 'EN_CASA' : 'REGISTRADO'
      }));
    }
    setDispatchToast(
      `Protocolo VIP sincronizado para ${guest.name}: Cocina (${guest.beverage.split('·')[0]}), Clima (${guest.temp} en ${guest.suite}) y Garita autorizada.`
    );
    setTimeout(() => setDispatchToast(null), 4000);
  };

  const cycleSuiteStatus = (suiteId) => {
    const order = ['LISTA', 'OCUPADA_VIP', 'EN_PREPARACION'];
    setSuites((prev) =>
      prev.map((s) => {
        if (s.id !== suiteId) return s;
        const next = order[(order.indexOf(s.status) + 1) % order.length];
        return { ...s, status: next };
      })
    );
  };

  const toggleVisitConfirmed = (visitId) => {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, confirmed: !v.confirmed } : v))
    );
  };

  const handleCreateGuest = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const parts = newName.trim().split(' ');
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();

    const created = {
      id: `vip-${Date.now()}`,
      name: newName.trim(),
      relation: newRelation.trim() || 'Invitado Especial de la Familia',
      category: newCategory,
      avatar: initials,
      color: newCategory === 'Familia' ? '#5E7AC6' : '#BE7AC6',
      status: 'REGISTRADO',
      lastVisit: 'Ficha Recién Creada',
      suite: newSuite,
      temp: newTemp,
      pillow: newPillow,
      dietary: newDietary.trim() || 'Menú estándar de la casa · Sin alergias reportadas',
      beverage: newBeverage.trim() || 'Agua mineral y café recién hecho',
      vehicle: newVehicle.trim() || 'Notificar llegada en Garita Principal',
      specialNotes: newNotes.trim() || 'Atención preferencial Casa Roquedal.',
      protocolActive: false
    };

    setGuests([created, ...guests]);
    setSelectedGuest(created);
    setNewName('');
    setNewRelation('');
    setNewDietary('');
    setNewBeverage('');
    setNewVehicle('');
    setNewNotes('');
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      setActiveTab('DIRECTORIO');
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-hsp-overlay" onClick={onClose}>
      <div className="domus-hsp-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-hsp-watermark" />

        {/* ==========================================
            CABECERA DEL MODAL DE HUÉSPEDES E INVITADOS VIP
            ========================================== */}
        <header className="domus-hsp-header">
          <div className="domus-hsp-title-wrap">
            <div className="domus-hsp-eyebrow">
              <Sparkles size={13} color="#BE7AC6" />
              <span>CASA ROQUEDAL · HOSPITALIDAD, SUITES Y PREFERENCIAS VIP</span>
            </div>
            <h2>Biblioteca de Huéspedes, Familia e Invitados</h2>
          </div>

          <div className="domus-hsp-kpis">
            <div className="domus-hsp-kpi">
              <small>PERFILES VIP</small>
              <strong style={{ color: '#5E7AC6' }}>{guests.length} Registrados</strong>
            </div>
            <div className="domus-hsp-kpi" onClick={() => setActiveTab('SUITES')} style={{ cursor: 'pointer' }}>
              <small>ESTADO SUITES</small>
              <strong style={{ color: '#10B981' }}>5 / 5 Impecables</strong>
            </div>
            <button className="domus-hsp-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* NOTIFICACIÓN EN VIVO MULTIDEPARTAMENTO */}
        {dispatchToast && (
          <div className="domus-hsp-dispatch-banner">
            <CheckCircle2 size={18} />
            <span>{dispatchToast}</span>
          </div>
        )}

        {/* ==========================================
            BARRA DE PESTAÑAS INTERNAS
            ========================================== */}
        <div className="domus-hsp-tabs-bar">
          <div className="domus-hsp-tabs">
            <button
              className={`domus-hsp-tab ${activeTab === 'DIRECTORIO' ? 'active' : ''}`}
              onClick={() => setActiveTab('DIRECTORIO')}
            >
              <Users size={16} />
              <span>Biblioteca VIP y Preferencias ({guests.length})</span>
            </button>
            <button
              className={`domus-hsp-tab ${activeTab === 'SUITES' ? 'active' : ''}`}
              onClick={() => setActiveTab('SUITES')}
            >
              <Bed size={16} />
              <span>Suites, Clima y Lencería</span>
            </button>
            <button
              className={`domus-hsp-tab ${activeTab === 'AGENDA' ? 'active' : ''}`}
              onClick={() => setActiveTab('AGENDA')}
            >
              <Calendar size={16} />
              <span>Agenda de Visitas ({visits.length})</span>
            </button>
            <button
              className={`domus-hsp-tab ${activeTab === 'NUEVO' ? 'active' : ''}`}
              onClick={() => setActiveTab('NUEVO')}
            >
              <Plus size={16} />
              <span>Añadir Huésped / Invitado</span>
            </button>
          </div>

          {activeTab === 'DIRECTORIO' && (
            <div className="domus-hsp-search">
              <Search size={15} color="#808080" />
              <input
                type="text"
                placeholder="Buscar familiar, plato, alergia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO DEL MODAL
            ========================================== */}
        <div className="domus-hsp-body">

          {/* VISTA 1: BIBLIOTECA DE HUÉSPEDES + FICHA CONCIERGE 360° */}
          {activeTab === 'DIRECTORIO' && (
            <div className="domus-hsp-library-layout">
              {/* Columna Izquierda: Lista de Perfiles */}
              <div className="domus-hsp-guest-list-col">
                <div className="domus-hsp-filter-row">
                  {['Todos', 'Familia', 'Invitado VIP'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`domus-hsp-filter-pill ${filterCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="domus-hsp-guest-cards">
                  {filteredGuests.map((guest) => {
                    const isSelected = selectedGuest?.id === guest.id;
                    return (
                      <div
                        key={guest.id}
                        className={`domus-hsp-guest-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedGuest(guest)}
                      >
                        <div className="domus-hsp-avatar" style={{ background: guest.color }}>
                          <span>{guest.avatar}</span>
                          {guest.protocolActive && <i className="domus-hsp-live-dot" title="Protocolo Activo"></i>}
                        </div>
                        <div className="domus-hsp-guest-meta">
                          <div className="domus-hsp-guest-top">
                            <strong>{guest.name}</strong>
                            <span className={`domus-hsp-badge ${guest.protocolActive ? 'active' : ''}`}>
                              {guest.protocolActive ? 'En Casa · VIP Activo' : guest.lastVisit}
                            </span>
                          </div>
                          <small>{guest.relation}</small>
                          <p>{guest.beverage.split('·')[0]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Columna Derecha: Pasaporte VIP de Preferencias por Departamento */}
              {selectedGuest && (
                <div className="domus-hsp-passport-card">
                  <div className="domus-hsp-passport-header">
                    <div className="domus-hsp-passport-person">
                      <div className="domus-hsp-avatar-lg" style={{ background: selectedGuest.color }}>
                        {selectedGuest.avatar}
                      </div>
                      <div>
                        <span className="domus-hsp-passport-cat">{selectedGuest.category} · {selectedGuest.relation}</span>
                        <h3>{selectedGuest.name}</h3>
                        <small>Suite asignada: <strong>{selectedGuest.suite}</strong> ({selectedGuest.temp})</small>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerVipProtocol(selectedGuest)}
                      className={`domus-hsp-vip-trigger ${selectedGuest.protocolActive ? 'active' : ''}`}
                    >
                      <Bell size={16} />
                      <span>
                        {selectedGuest.protocolActive
                          ? 'PROTOCOLO VIP ACTIVO EN CASA'
                          : 'ACTIVAR LLEGADA / PROTOCOLO VIP'}
                      </span>
                    </button>
                  </div>

                  <p className="domus-hsp-passport-intro">
                    Al activar el protocolo de este huésped, Domus envía automáticamente sus preferencias a las tabletas de <strong>Cocina</strong>, <strong>Lencería</strong>, <strong>Climatización</strong> y <strong>Garita</strong>:
                  </p>

                  {/* Cuadrícula de Preferencias en las 4 Áreas de Servicio */}
                  <div className="domus-hsp-prefs-grid">
                    <div className="domus-hsp-pref-box">
                      <div className="domus-hsp-pref-head">
                        <div className="domus-hsp-pref-icon" style={{ background: 'rgba(238,107,95,0.14)', color: '#EE6B5F' }}>
                          <Utensils size={17} />
                        </div>
                        <div>
                          <small>ENLACE COCINA & DESPENSA</small>
                          <h4>Dieta, Alergias y Platos Favoritos</h4>
                        </div>
                      </div>
                      <p>{selectedGuest.dietary}</p>
                    </div>

                    <div className="domus-hsp-pref-box">
                      <div className="domus-hsp-pref-head">
                        <div className="domus-hsp-pref-icon" style={{ background: 'rgba(190,122,198,0.16)', color: '#BE7AC6' }}>
                          <Coffee size={17} />
                        </div>
                        <div>
                          <small>PROTOCOLO DE BIENVENIDA</small>
                          <h4>Bebida de Recibimiento y Mesa</h4>
                        </div>
                      </div>
                      <p>{selectedGuest.beverage}</p>
                    </div>

                    <div className="domus-hsp-pref-box">
                      <div className="domus-hsp-pref-head">
                        <div className="domus-hsp-pref-icon" style={{ background: 'rgba(94,122,198,0.14)', color: '#5E7AC6' }}>
                          <Bed size={17} />
                        </div>
                        <div>
                          <small>HOSPITALIDAD, LENCERÍA & CLIMA</small>
                          <h4>{selectedGuest.suite} · Clima {selectedGuest.temp}</h4>
                        </div>
                      </div>
                      <p>{selectedGuest.pillow}</p>
                    </div>

                    <div className="domus-hsp-pref-box">
                      <div className="domus-hsp-pref-head">
                        <div className="domus-hsp-pref-icon" style={{ background: 'rgba(16,185,129,0.14)', color: '#10B981' }}>
                          <CarFront size={17} />
                        </div>
                        <div>
                          <small>AUTORIZACIÓN EN GARITA</small>
                          <h4>Vehículo y Acceso</h4>
                        </div>
                      </div>
                      <p>{selectedGuest.vehicle}</p>
                    </div>
                  </div>

                  <div className="domus-hsp-special-note">
                    <Heart size={16} color="#EE6B5F" />
                    <div>
                      <small>DETALLE DE HOSPITALIDAD (AMA DE LLAVES)</small>
                      <strong>{selectedGuest.specialNotes}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTA 2: SUITES, CLIMATIZACIÓN Y LENCERÍA */}
          {activeTab === 'SUITES' && (
            <div className="domus-hsp-suites-grid">
              {suites.map((suite) => (
                <div key={suite.id} className="domus-hsp-suite-card">
                  <div className="domus-hsp-suite-top">
                    <div>
                      <span className="domus-hsp-suite-zone">{suite.zone}</span>
                      <h3>{suite.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => cycleSuiteStatus(suite.id)}
                      className={`domus-hsp-suite-status ${suite.status.toLowerCase()}`}
                    >
                      {suite.status === 'LISTA'
                        ? 'Impecable · Lista'
                        : suite.status === 'OCUPADA_VIP'
                        ? 'Ocupada VIP'
                        : 'En Preparación'}
                    </button>
                  </div>

                  <div className="domus-hsp-suite-meta">
                    <div>
                      <Thermometer size={14} color="#5E7AC6" />
                      <span>Clima: <strong>{suite.temp}</strong></span>
                    </div>
                    <div>
                      <Users size={14} color="#BE7AC6" />
                      <span>Camarera: <strong>{suite.housekeeper}</strong></span>
                    </div>
                  </div>

                  <div className="domus-hsp-suite-assign">
                    <small>ASIGNACIÓN ACTUAL</small>
                    <strong>{suite.assignedTo}</strong>
                    <span>{suite.linen}</span>
                  </div>

                  <div className="domus-hsp-suite-checks">
                    {suite.checklist.map((item, i) => (
                      <div key={i} className="domus-hsp-check-pill">
                        <Check size={12} color="#10B981" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA 3: AGENDA DE VISITAS Y EVENTOS FAMILIARES */}
          {activeTab === 'AGENDA' && (
            <div className="domus-hsp-agenda-stack">
              {visits.map((v) => (
                <div key={v.id} className="domus-hsp-visit-row" onClick={() => toggleVisitConfirmed(v.id)}>
                  <div className="domus-hsp-visit-left">
                    <span className="domus-hsp-visit-date">{v.date}</span>
                    <h4>{v.guestName}</h4>
                    <p>{v.type} · <strong>{v.pax}</strong></p>
                  </div>

                  <div className="domus-hsp-visit-tags">
                    {v.areasNotified.map((area, idx) => (
                      <span key={idx} className="domus-hsp-area-pill">
                        <Check size={12} /> {area}
                      </span>
                    ))}
                  </div>

                  <div className={`domus-hsp-visit-status ${v.confirmed ? 'ok' : 'pending'}`}>
                    {v.confirmed ? 'Protocolo Listo' : 'Por Confirmar'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA 4: CREAR NUEVO PERFIL VIP EN LA BIBLIOTECA */}
          {activeTab === 'NUEVO' && (
            <form className="domus-hsp-form-card" onSubmit={handleCreateGuest}>
              <h3>Registrar Nuevo Familiar o Invitado VIP</h3>
              <p>
                Guarde las preferencias una sola vez en la biblioteca de Casa Roquedal para que cada visita futura se prepare con un solo toque.
              </p>

              <div className="domus-hsp-form-grid">
                <div>
                  <label>Nombre del Huésped o Familia</label>
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
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="Familia">Familia Directa</option>
                    <option value="Invitado VIP">Invitado VIP / Amigo</option>
                  </select>
                </div>

                <div>
                  <label>Suite o Espacio Preferido</label>
                  <select value={newSuite} onChange={(e) => setNewSuite(e.target.value)}>
                    <option value="Suite Huéspedes Jardín">Suite Huéspedes Jardín</option>
                    <option value="Suite Terraza Norte">Suite Terraza Norte</option>
                    <option value="Suite Doble Estudio">Suite Doble Estudio</option>
                    <option value="Salón Comedor & Terraza VIP">Visita Social (Comedor / Terraza)</option>
                  </select>
                </div>
                <div>
                  <label>Climatización Preferida</label>
                  <input
                    type="text"
                    value={newTemp}
                    onChange={(e) => setNewTemp(e.target.value)}
                  />
                </div>
                <div>
                  <label>Preferencia de Almohada y Lencería</label>
                  <input
                    type="text"
                    value={newPillow}
                    onChange={(e) => setNewPillow(e.target.value)}
                  />
                </div>

                <div className="full-span">
                  <label>Preferencias Gastronómicas, Dieta y Alergias (Para Cocina)</label>
                  <input
                    type="text"
                    placeholder="Ej. Intolerante a la lactosa, prefiere pescado blanco al vapor y ensaladas..."
                    value={newDietary}
                    onChange={(e) => setNewDietary(e.target.value)}
                  />
                </div>

                <div className="full-span">
                  <label>Bebida de Bienvenida / Café / Té</label>
                  <input
                    type="text"
                    placeholder="Ej. Café guayoyo suave en taza grande o agua de coco fría..."
                    value={newBeverage}
                    onChange={(e) => setNewBeverage(e.target.value)}
                  />
                </div>

                <div>
                  <label>Vehículo / Placa (Para Garita)</label>
                  <input
                    type="text"
                    placeholder="Ej. camioneta BMW Gris · Placa AA112BB"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                  />
                </div>
                <div className="two-span">
                  <label>Atenciones Especiales de Hospitalidad</label>
                  <input
                    type="text"
                    placeholder="Ej. Flores frescas, agua al clima en mesa de noche..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              {savedToast ? (
                <div className="domus-hsp-dispatch-banner" style={{ marginTop: 16 }}>
                  <CheckCircle2 size={18} />
                  <span>¡Ficha VIP guardada exitosamente en la biblioteca de Casa Roquedal!</span>
                </div>
              ) : (
                <button type="submit" className="domus-hsp-submit-btn">
                  <Check size={17} />
                  <span>GUARDAR FICHA VIP EN BIBLIOTECA</span>
                </button>
              )}
            </form>
          )}

        </div>

        {/* ==========================================
            PIE DEL MODAL
            ========================================== */}
        <footer className="domus-hsp-footer">
          <span>Conectado en tiempo real con Cocina, Lencería, Mantenimiento y Garita Principal</span>
          <button className="domus-hsp-close-btn" onClick={onClose}>
            VOLVER AL PANEL PRINCIPAL
          </button>
        </footer>

        {/* ==========================================
            ESTILOS AISLADOS DEL MODAL DE HOSPITALIDAD
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
            .domus-hsp-overlay { padding: 24px; }
          }
          @keyframes domusHspFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-hsp-modal {
            position: relative; overflow: hidden;
            width: 100%; max-width: 1320px;
            height: 100dvh;
            background: rgba(244, 246, 251, 0.95);
            backdrop-filter: blur(36px) saturate(190%);
            -webkit-backdrop-filter: blur(36px) saturate(190%);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 32px 80px rgba(15, 23, 42, 0.35);
            display: flex; flex-direction: column;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .domus-hsp-modal {
              height: 90vh;
              border-radius: 36px;
            }
          }

          .domus-hsp-watermark {
            position: absolute; right: -40px; bottom: 40px;
            width: 280px; height: 280px; object-fit: contain;
            opacity: 0.04; pointer-events: none; z-index: 0;
          }

          .domus-hsp-header {
            position: relative; z-index: 2;
            padding: 18px 18px 14px;
            background: rgba(255, 255, 255, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-hsp-header { padding: 22px 32px 18px; }
          }
          .domus-hsp-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 10px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
            margin-bottom: 4px;
          }
          .domus-hsp-title-wrap h2 {
            font-size: clamp(20px, 2.5vw, 28px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-hsp-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-hsp-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 16px;
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

          .domus-hsp-dispatch-banner {
            position: relative; z-index: 3;
            background: linear-gradient(90deg, #10B981 0%, #059669 100%);
            color: #fff; padding: 12px 28px;
            font-size: 12.5px; font-weight: 800;
            display: flex; align-items: center; gap: 10px;
          }

          .domus-hsp-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.48);
            border-bottom: 1px solid rgba(255, 255, 255, 0.85);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-hsp-tabs-bar { padding: 14px 32px; } }
          .domus-hsp-tabs {
            display: flex; gap: 8px; overflow-x: auto; max-width: 100%; padding-bottom: 2px;
          }
          .domus-hsp-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 16px; border-radius: 16px;
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

          .domus-hsp-search {
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid #fff;
            padding: 9px 14px; border-radius: 14px; min-width: 240px;
          }
          .domus-hsp-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }

          .domus-hsp-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
          }
          @media (min-width: 768px) { .domus-hsp-body { padding: 24px 32px; } }

          /* BIBLIOTECA MASTER-DETAIL LAYOUT */
          .domus-hsp-library-layout {
            display: grid; grid-template-columns: 1fr; gap: 22px;
          }
          @media (min-width: 1024px) {
            .domus-hsp-library-layout { grid-template-columns: 1fr 1.55fr; }
          }

          .domus-hsp-filter-row {
            display: flex; gap: 8px; margin-bottom: 14px;
          }
          .domus-hsp-filter-pill {
            padding: 7px 14px; border-radius: 99px;
            border: 1px solid rgba(255,255,255,0.9);
            background: rgba(255,255,255,0.7);
            font-size: 11px; font-weight: 800; color: #555; cursor: pointer;
          }
          .domus-hsp-filter-pill.active {
            background: #202020; color: #fff; border-color: #202020;
          }

          .domus-hsp-guest-cards {
            display: flex; flex-direction: column; gap: 10px;
          }
          .domus-hsp-guest-item {
            display: flex; align-items: center; gap: 14px;
            padding: 14px 16px; border-radius: 22px;
            background: rgba(255, 255, 255, 0.76);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            cursor: pointer; transition: all 0.22s ease;
          }
          .domus-hsp-guest-item:hover {
            background: #fff; transform: translateX(4px);
          }
          .domus-hsp-guest-item.selected {
            background: #fff;
            border-color: #5E7AC6;
            box-shadow: 0 12px 28px rgba(94, 122, 198, 0.16);
          }
          .domus-hsp-avatar {
            position: relative;
            width: 48px; height: 48px; border-radius: 16px;
            color: #fff; font-size: 15px; font-weight: 900;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
          }
          .domus-hsp-live-dot {
            position: absolute; bottom: -2px; right: -2px;
            width: 13px; height: 13px; border-radius: 50%;
            background: #10B981; border: 2.5px solid #fff;
          }
          .domus-hsp-guest-meta { flex: 1; min-width: 0; }
          .domus-hsp-guest-top {
            display: flex; align-items: center; justify-content: space-between; gap: 8px;
          }
          .domus-hsp-guest-top strong {
            font-size: 14.5px; font-weight: 900; color: #202020;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .domus-hsp-badge {
            font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 99px;
            background: rgba(0,0,0,0.05); color: #666; white-space: nowrap;
          }
          .domus-hsp-badge.active {
            background: rgba(16, 185, 129, 0.16); color: #059669; font-weight: 900;
          }
          .domus-hsp-guest-meta small {
            display: block; font-size: 11px; font-weight: 700; color: #5E7AC6; margin: 2px 0;
          }
          .domus-hsp-guest-meta p {
            margin: 0; font-size: 11px; color: #666;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          /* PASAPORTE DE PREFERENCIAS 360 */
          .domus-hsp-passport-card {
            background: rgba(255, 255, 255, 0.88);
            border: 1.5px solid #fff;
            border-radius: 28px; padding: 24px;
            box-shadow: 0 14px 36px rgba(32, 32, 32, 0.05);
            display: flex; flex-direction: column; gap: 18px;
          }
          .domus-hsp-passport-header {
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px; padding-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.06);
          }
          .domus-hsp-passport-person {
            display: flex; align-items: center; gap: 14px;
          }
          .domus-hsp-avatar-lg {
            width: 60px; height: 60px; border-radius: 20px;
            color: #fff; font-size: 20px; font-weight: 900;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 10px 22px rgba(0,0,0,0.12);
          }
          .domus-hsp-passport-cat {
            font-size: 10px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.09em; color: #5E7AC6;
          }
          .domus-hsp-passport-person h3 {
            margin: 2px 0 3px; font-size: 22px; font-weight: 900; color: #202020;
          }
          .domus-hsp-passport-person small { font-size: 12px; color: #666; }

          .domus-hsp-vip-trigger {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 12px 18px; border-radius: 16px; border: none;
            background: #5E7AC6; color: #fff;
            font-size: 11px; font-weight: 900; letter-spacing: 0.07em;
            cursor: pointer; box-shadow: 0 10px 24px rgba(94, 122, 198, 0.35);
            transition: all 0.22s ease;
          }
          .domus-hsp-vip-trigger:hover { transform: translateY(-2px); background: #4763B0; }
          .domus-hsp-vip-trigger.active {
            background: #10B981;
            box-shadow: 0 10px 24px rgba(16, 185, 129, 0.35);
          }

          .domus-hsp-passport-intro {
            margin: 0; font-size: 12.5px; color: #555; line-height: 1.45;
          }

          .domus-hsp-prefs-grid {
            display: grid; grid-template-columns: 1fr; gap: 14px;
          }
          @media (min-width: 640px) {
            .domus-hsp-prefs-grid { grid-template-columns: repeat(2, 1fr); }
          }
          .domus-hsp-pref-box {
            background: #F7F9FC; border: 1px solid rgba(0,0,0,0.05);
            border-radius: 20px; padding: 16px;
          }
          .domus-hsp-pref-head {
            display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
          }
          .domus-hsp-pref-icon {
            width: 36px; height: 36px; border-radius: 11px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .domus-hsp-pref-head small {
            display: block; font-size: 9px; font-weight: 900; letter-spacing: 0.08em; color: #888;
          }
          .domus-hsp-pref-head h4 {
            margin: 0; font-size: 13.5px; font-weight: 900; color: #202020;
          }
          .domus-hsp-pref-box p {
            margin: 0; font-size: 12.5px; font-weight: 600; color: #444; line-height: 1.45;
          }

          .domus-hsp-special-note {
            display: flex; align-items: center; gap: 12px;
            background: rgba(238, 107, 95, 0.1);
            border: 1px solid rgba(238, 107, 95, 0.25);
            padding: 14px 16px; border-radius: 18px;
          }
          .domus-hsp-special-note small {
            display: block; font-size: 9px; font-weight: 900; letter-spacing: 0.08em; color: #EE6B5F;
          }
          .domus-hsp-special-note strong { font-size: 12.5px; font-weight: 800; color: #202020; }

          /* SUITES GRID */
          .domus-hsp-suites-grid {
            display: grid; grid-template-columns: 1fr; gap: 18px;
          }
          @media (min-width: 768px) {
            .domus-hsp-suites-grid { grid-template-columns: repeat(2, 1fr); }
          }
          .domus-hsp-suite-card {
            background: rgba(255,255,255,0.85); border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
            box-shadow: 0 10px 28px rgba(0,0,0,0.04);
            display: flex; flex-direction: column; gap: 14px;
          }
          .domus-hsp-suite-top {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
          }
          .domus-hsp-suite-zone {
            font-size: 10px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.08em; color: #5E7AC6;
          }
          .domus-hsp-suite-top h3 { margin: 2px 0 0; font-size: 19px; font-weight: 900; color: #202020; }
          .domus-hsp-suite-status {
            border: none; cursor: pointer; padding: 6px 12px; border-radius: 99px;
            font-size: 10px; font-weight: 900; text-transform: uppercase;
          }
          .domus-hsp-suite-status.lista { background: rgba(16,185,129,0.16); color: #059669; }
          .domus-hsp-suite-status.ocupada_vip { background: rgba(94,122,198,0.16); color: #5E7AC6; }
          .domus-hsp-suite-status.en_preparacion { background: rgba(238,107,95,0.16); color: #EE6B5F; }

          .domus-hsp-suite-meta {
            display: flex; gap: 16px; font-size: 12px; color: #555;
          }
          .domus-hsp-suite-meta div { display: flex; align-items: center; gap: 6px; }
          .domus-hsp-suite-assign {
            background: #F7F9FC; padding: 12px 14px; border-radius: 16px;
            display: flex; flex-direction: column; gap: 2px;
          }
          .domus-hsp-suite-assign small { font-size: 9px; font-weight: 900; color: #888; }
          .domus-hsp-suite-assign strong { font-size: 13.5px; font-weight: 900; color: #202020; }
          .domus-hsp-suite-assign span { font-size: 11.5px; color: #666; font-weight: 600; }

          .domus-hsp-suite-checks {
            display: flex; flex-wrap: wrap; gap: 8px;
          }
          .domus-hsp-check-pill {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(16,185,129,0.1); color: #065F46;
            padding: 5px 10px; border-radius: 10px; font-size: 11px; font-weight: 700;
          }

          /* AGENDA */
          .domus-hsp-agenda-stack { display: flex; flex-direction: column; gap: 14px; }
          .domus-hsp-visit-row {
            background: rgba(255,255,255,0.85); border: 1.5px solid #fff;
            border-radius: 22px; padding: 18px 22px;
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px; cursor: pointer; transition: all 0.2s ease;
          }
          .domus-hsp-visit-row:hover { background: #fff; transform: translateY(-2px); }
          .domus-hsp-visit-date {
            font-size: 10px; font-weight: 900; color: #EE6B5F; letter-spacing: 0.08em;
          }
          .domus-hsp-visit-left h4 { margin: 3px 0; font-size: 17px; font-weight: 900; color: #202020; }
          .domus-hsp-visit-left p { margin: 0; font-size: 12px; color: #666; }
          .domus-hsp-visit-tags { display: flex; flex-wrap: wrap; gap: 8px; }
          .domus-hsp-area-pill {
            display: inline-flex; align-items: center; gap: 5px;
            background: #F4F6FA; padding: 6px 11px; border-radius: 10px;
            font-size: 11px; font-weight: 800; color: #444;
          }
          .domus-hsp-visit-status {
            padding: 7px 14px; border-radius: 99px; font-size: 11px; font-weight: 900;
          }
          .domus-hsp-visit-status.ok { background: rgba(16,185,129,0.16); color: #059669; }
          .domus-hsp-visit-status.pending { background: rgba(245,158,11,0.18); color: #B45309; }

          /* FORMULARIO NUEVO VIP */
          .domus-hsp-form-card {
            background: rgba(255,255,255,0.88); border: 1.5px solid #fff;
            border-radius: 28px; padding: 26px; max-width: 920px; margin: 0 auto;
          }
          .domus-hsp-form-card h3 { margin: 0 0 4px; font-size: 20px; font-weight: 900; }
          .domus-hsp-form-card p { margin: 0 0 18px; font-size: 12.5px; color: #666; }
          .domus-hsp-form-grid {
            display: grid; grid-template-columns: 1fr; gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-hsp-form-grid { grid-template-columns: repeat(3, 1fr); }
            .domus-hsp-form-grid .full-span { grid-column: span 3; }
            .domus-hsp-form-grid .two-span { grid-column: span 2; }
          }
          .domus-hsp-form-grid label {
            display: block; font-size: 10px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.08em; color: #5E7AC6;
            margin-bottom: 6px;
          }
          .domus-hsp-form-grid input, .domus-hsp-form-grid select {
            width: 100%; box-sizing: border-box;
            padding: 11px 14px; border-radius: 13px;
            border: 1px solid rgba(0,0,0,0.1); background: #F7F9FC;
            font-size: 12.5px; font-weight: 600; color: #202020; outline: none;
          }
          .domus-hsp-submit-btn {
            width: 100%; padding: 15px; border: none; border-radius: 16px;
            background: #5E7AC6; color: #fff; font-size: 12px; font-weight: 900;
            letter-spacing: 0.08em; margin-top: 18px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 8px;
          }

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