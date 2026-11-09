import React, { useState, useMemo } from 'react';
import {
  X, ShieldCheck, CarFront, Package, FileSignature, Coffee,
  Sparkles, Search, Plus, Check, CheckCircle2, AlertCircle,
  Clock, RotateCw, Send, Layers, Wrench, Fuel, Key, UserCheck,
  Bell, Delete, Lock
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

// ==========================================
// 1. ARQUITECTURA EN CASCADA (NIVEL 1 Y NIVEL 2)
// ==========================================
const SECURITY_CATEGORIES = [
  {
    id: 'Accesos',
    title: 'Pases y Pre-Autorizaciones',
    subtitle: 'Proveedores, Técnicos y Visitas',
    accent: '#5E7AC6',
    img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Todos los Pases', icon: '🪪' },
      { id: 'EN_SITIO', name: 'Dentro de la Propiedad', icon: '🟢' },
      { id: 'ESPERADO', name: 'Autorizados por Llegar', icon: '⏳' },
      { id: 'PERMANENTE', name: 'Pases Permanentes', icon: '🔑' }
    ]
  },
  {
    id: 'Encomiendas',
    title: 'Encomiendas y Paquetería',
    subtitle: 'Farmacia, Mercado y Correspondencia',
    accent: '#10B981',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Toda la Paquetería', icon: '📦' },
      { id: 'EN_GARITA', name: 'Por Retirar en Garita', icon: '🔔' },
      { id: 'ENTREGADO', name: 'Recibidos en Casa', icon: '✅' }
    ]
  },
  {
    id: 'Flota',
    title: 'Flota Vehicular (Mecánica)',
    subtitle: 'Combustible y Servicio · Cero Rutas',
    accent: '#EE6B5F',
    img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Toda la Flota (4)', icon: '🚙' },
      { id: 'OPTIMO', name: '100% Operativos', icon: '🟢' },
      { id: 'SERVICIO', name: 'Próximo Mantenimiento', icon: '🔧' }
    ]
  },
  {
    id: 'Intendencia',
    title: 'Intendencia de Garita',
    subtitle: 'Comidas de Guardia y Caseta',
    accent: '#BE7AC6',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=700',
    subfilters: [
      { id: 'TODOS', name: 'Servicios a Garita', icon: '☕' },
      { id: 'ALIMENTACION', name: 'Bandejas y Termos', icon: '🍽️' },
      { id: 'INFRAESTRUCTURA', name: 'Equipos de Caseta', icon: '⚡' }
    ]
  }
];

// ==========================================
// 2. TARJETAS 3D POR CATEGORÍA (FRENTE + REVERSO EDITABLE)
// ==========================================
const INITIAL_SECURITY_ITEMS = [
  // CATEGORÍA 1: PASES Y ACCESOS
  {
    id: 'sec-1',
    category: 'Accesos',
    subGroup: 'ESPERADO',
    title: 'Ing. Roberto Salazar (Climatización)',
    subtitle: 'Técnico Chiller Central · Mantenimiento',
    status: 'AUTORIZADO HOY',
    statusColor: '#5E7AC6',
    badgeMetric: '10:00 AM',
    badgeUnit: 'Ventana',
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    // Datos editables del reverso
    field1Label: 'Cédula / Identificación',
    field1Val: 'V-14.892.104 · ClimaTech C.A.',
    field2Label: 'Vehículo y Placa',
    field2Val: 'Furgón Kangoo Blanco · Placa A45BC1',
    field3Label: 'Área Autorizada en Casa',
    field3Val: 'Cuarto de Máquinas Exterior (Sin ingreso a Suites)',
    field4Label: 'Supervisión / Acompañante Interno',
    field4Val: 'Recibe y acompaña: Carlos Padrón',
    tags: ['Verificar Maletín', 'Acompañamiento Obligatorio', 'Salida < 2:00 PM']
  },
  {
    id: 'sec-2',
    category: 'Accesos',
    subGroup: 'EN_SITIO',
    title: 'Camión Proveedor Frigorífico',
    subtitle: 'Abastecimiento de Cocina & Despensa',
    status: 'EN DESCARGA',
    statusColor: '#10B981',
    badgeMetric: 'Garita 2',
    badgeUnit: 'Acceso Servicio',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Conductor Autorizado',
    field1Val: 'Sr. Luis Morales · V-12.304.991',
    field2Label: 'Vehículo Refrigerado',
    field2Val: 'NPR Blanco · Placa A88AA9',
    field3Label: 'Zona de Descarga',
    field3Val: 'Entrada de Servicio Cocina (Verificación en Balanza)',
    field4Label: 'Responsable de Recepción',
    field4Val: 'Chef Jesús Sequea / María Fernanda',
    tags: ['Pesar en Balanza', 'Sello de Cava', 'Pase Frecuente']
  },
  {
    id: 'sec-3',
    category: 'Accesos',
    subGroup: 'PERMANENTE',
    title: 'Dr. Alejandro Vegas (Cardiólogo)',
    subtitle: 'Médico de Cabecera Dr. Jiménez',
    status: 'PASE PERMANENTE VIP',
    statusColor: '#10B981',
    badgeMetric: 'Prioridad 1',
    badgeUnit: 'Sin Retención',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Credencial Médica',
    field1Val: 'Médico Tratante Principal · Acceso 24/7',
    field2Label: 'Vehículo Registrado',
    field2Val: 'Ford Explorer Negra · Placa AD441OP',
    field3Label: 'Estacionamiento Asignado',
    field3Val: 'Porche Principal frente a Entrada Noble',
    field4Label: 'Protocolo al Ingresar',
    field4Val: 'Avisar de inmediato a Lic. Carmen y Sra. Belkys',
    tags: ['Ingreso Directo', 'Sin Revisión', 'Avisar Enfermería']
  },

  // CATEGORÍA 2: ENCOMIENDAS Y PAQUETERÍA
  {
    id: 'sec-4',
    category: 'Encomiendas',
    subGroup: 'EN_GARITA',
    title: 'Pedido Sellado Farmatodo / Clínica',
    subtitle: 'Insumos Médicos para Suite Principal',
    status: 'EN GARITA · POR SUBIR',
    statusColor: '#EE6B5F',
    badgeMetric: '2 Bolsas',
    badgeUnit: 'Precintadas',
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Recibido en Garita por',
    field1Val: 'Sup. Marcos Rivas · Hoy 09:15 AM',
    field2Label: 'Estado del Empaque',
    field2Val: 'Precinto de seguridad intacto + Factura',
    field3Label: 'Destinatario Interno',
    field3Val: 'Enfermería (Lic. Carmen Valero)',
    field4Label: 'Instrucción de Entrega',
    field4Val: 'Subir a casa principal con personal interno',
    tags: ['Cadena de Frío', 'Prioridad Salud', 'Sello Intacto']
  },
  {
    id: 'sec-5',
    category: 'Encomiendas',
    subGroup: 'ENTREGADO',
    title: 'Tintorería Ecológica VIP (6 Prendas)',
    subtitle: 'Trajes y Lencería Fina Dr. Jiménez',
    status: 'ENTREGADO EN CASA',
    statusColor: '#10B981',
    badgeMetric: '6 Piezas',
    badgeUnit: 'Portatrajes',
    img: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Recibido en Garita por',
    field1Val: 'Custodio Turno Diurno · 08:30 AM',
    field2Label: 'Recibido en Casa por',
    field2Val: 'Elena Castillo (Hospitalidad & Vestier)',
    field3Label: 'Nota de Entrega',
    field3Val: 'Nota #TT-902 verificada sin pendientes',
    field4Label: 'Ubicación Final',
    field4Val: 'Vestier Principal Suite Dr. Jiménez',
    tags: ['Conteo Completo', 'Fundas Protectoras']
  },

  // CATEGORÍA 3: FLOTA RESIDENCIAL (MECÁNICA PURA · CERO RUTAS)
  {
    id: 'sec-6',
    category: 'Flota',
    subGroup: 'OPTIMO',
    title: 'Toyota Land Cruiser 300 (Principal)',
    subtitle: 'Unidad Principal · Estado Mecánico',
    status: '100% OPERATIVA',
    statusColor: '#10B981',
    badgeMetric: '95%',
    badgeUnit: 'Combustible',
    numericVal: 42180,
    numericUnit: 'km',
    fuelPct: 95,
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Odómetro Actual (Solo Mantenimiento)',
    field1Val: '42,180 km · Próximo servicio: 45,000 km',
    field2Label: 'Neumáticos y Blindaje',
    field2Val: '38 PSI verificados hoy · Cristales y suspensión OK',
    field3Label: 'Batería y Fluidos',
    field3Val: 'Batería AGM 100% · Aceite sintético al día',
    field4Label: 'Responsable de Unidad',
    field4Val: 'Andrés Mendoza (Chófer Ejecutivo)',
    tags: ['Tanque Lleno', 'Cauchos 38 PSI', 'Sin Rutas en App']
  },
  {
    id: 'sec-7',
    category: 'Flota',
    subGroup: 'OPTIMO',
    title: 'Toyota Fortuner (Unidad Apoyo / Escolta)',
    subtitle: 'Vehículo de Seguridad y Enlace',
    status: '100% OPERATIVA',
    statusColor: '#10B981',
    badgeMetric: '85%',
    badgeUnit: 'Combustible',
    numericVal: 68410,
    numericUnit: 'km',
    fuelPct: 85,
    img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Odómetro Actual',
    field1Val: '68,410 km · Próximo servicio: 70,000 km',
    field2Label: 'Neumáticos y Frenos',
    field2Val: 'Pastillas delanteras nuevas · 36 PSI',
    field3Label: 'Higiene y Desinfección',
    field3Val: 'Lavado interno/externo completado hoy 07:00 AM',
    field4Label: 'Asignación',
    field4Val: 'Esquema de Seguridad Patrimonial',
    tags: ['Frenos Nuevos', 'Tanque > 80%', 'Operativa']
  },
  {
    id: 'sec-8',
    category: 'Flota',
    subGroup: 'SERVICIO',
    title: 'Camioneta de Intendencia y Compras',
    subtitle: 'Logística de Mercado, Jardín y Mantenimiento',
    status: 'SERVICIO EN 350 KM',
    statusColor: '#EE6B5F',
    badgeMetric: '60%',
    badgeUnit: 'Combustible',
    numericVal: 89650,
    numericUnit: 'km',
    fuelPct: 60,
    img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Odómetro Actual (Alerta Preventiva)',
    field1Val: '89,650 km · Cambio de aceite a los 90,000 km',
    field2Label: 'Requerimiento Mecánico',
    field2Val: 'Programar cambio de aceite y filtro esta semana',
    field3Label: 'Neumáticos y Carga',
    field3Val: '40 PSI · Barras de carga operativas',
    field4Label: 'Coordinación con Administración',
    field4Val: 'Carlos Padrón / Sra. Belkys',
    tags: ['Agendar Aceite', 'Uso Doméstico', '60% Gasolina']
  },

  // CATEGORÍA 4: INTENDENCIA DE GARITA
  {
    id: 'sec-9',
    category: 'Intendencia',
    subGroup: 'ALIMENTACION',
    title: 'Servicio de Hidratación y Café a Garita',
    subtitle: 'Atención a los 4 Custodios en Guardia',
    status: 'SERVIDO 02:00 PM',
    statusColor: '#10B981',
    badgeMetric: '4 Raciones',
    badgeUnit: 'Termo Activo',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Suministro Matutino y Tarde',
    field1Val: 'Termo de café recién colado + Botellón agua 20L',
    field2Label: 'Almuerzo y Cena de Guardia',
    field2Val: '4 Bandejas enviadas desde Cocina a las 12:45 PM',
    field3Label: 'Responsable en Cocina',
    field3Val: 'María Fernanda Rojas (Auxiliar de Cocina)',
    field4Label: 'Observaciones de Intendencia',
    field4Val: 'Reponer azúcar, vasos térmicos y servilletas mañana',
    tags: ['Termo Café 2L', 'Agua Mineral 100%', '4 Almuerzos']
  },
  {
    id: 'sec-10',
    category: 'Intendencia',
    subGroup: 'INFRAESTRUCTURA',
    title: 'Confort y Equipos de Caseta Principal',
    subtitle: 'Climatización, Iluminación y Respaldo Garita',
    status: '100% OPERATIVO',
    statusColor: '#5E7AC6',
    badgeMetric: '22°C',
    badgeUnit: 'Split Garita',
    img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600',
    field1Label: 'Climatización y Baño de Garita',
    field1Val: 'Aire Split 12,000 BTU limpio · Insumos sanitarios al día',
    field2Label: 'Iluminación Exterior y Reflectores',
    field2Val: 'Fotocélulas perimetrales encendiendo a las 06:15 PM',
    field3Label: 'Respaldo Eléctrico de Caseta',
    field3Val: 'Conectado a Planta Principal + UPS de barrera',
    field4Label: 'Mantenimiento Interno',
    field4Val: 'Revisado por Carlos Padrón (Jefe Mantenimiento)',
    tags: ['A/C Operativo', 'UPS 100%', 'Insumos Baño OK']
  }
];

const INITIAL_GATE_LOGS = [
  { id: 'gl-1', type: 'Pre-Autorización Enviada', item: 'Ing. Roberto Salazar (Climatización)', detail: 'Pase temporal 10:00 AM · Recibe Carlos Padrón', time: '09:40 AM', color: '#5E7AC6' },
  { id: 'gl-2', type: 'Encomienda en Garita', item: 'Pedido Sellado Farmatodo', detail: 'Recibido por Sup. Marcos Rivas · Notificada Lic. Carmen', time: '09:15 AM', color: '#EE6B5F' },
  { id: 'gl-3', type: 'Check Mecánico Flota', item: 'Toyota Land Cruiser 300', detail: 'Odómetro: 42,180 km · Tanque al 95% (Sin registro de ruta)', time: '07:30 AM', color: '#10B981' }
];

export default function SecurityModal({ isOpen, onClose, initialCategory = 'Accesos' }) {
  const [activeTab, setActiveTab] = useState('EXPLORADOR');
  const [items, setItems] = useState(INITIAL_SECURITY_ITEMS);
  const [gateLogs, setGateLogs] = useState(INITIAL_GATE_LOGS);

  // Estado Progressive Disclosure (Nivel 1 -> Nivel 2 -> Nivel 3)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubfilter, setSelectedSubfilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado Giro 3D (Flip Card)
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [savedToastId, setSavedToastId] = useState(null);

  // Estado del Teclado Táctil / Despachador a Garita (Numpad & Gate Dispatch Modal)
  const [actionModal, setActionModal] = useState(null); // { item, mode: 'GARITA' | 'ODOMETRO' }
  const [numpadVal, setNumpadVal] = useState('');
  const [fuelSlider, setFuelSlider] = useState(90);
  const [gateActionNote, setGateActionNote] = useState('Autorizado por Sra. Belkys · Notificar al llegar a garita');

  // Gaveta para Crear Nuevo Pase de Acceso o Encomienda
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSub, setNewSub] = useState('');
  const [newIdDoc, setNewIdDoc] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newZone, setNewZone] = useState('Área Exterior / Jardines');
  const [newHost, setNewHost] = useState('Carlos Padrón (Mantenimiento)');

  const activeCategoryObj = useMemo(
    () => SECURITY_CATEGORIES.find((c) => c.id === selectedCategory) || SECURITY_CATEGORIES[0],
    [selectedCategory]
  );

  const pendingPackagesCount = useMemo(
    () => items.filter((i) => i.category === 'Encomiendas' && i.subGroup === 'EN_GARITA').length,
    [items]
  );

  const activePassesCount = useMemo(
    () => items.filter((i) => i.category === 'Accesos').length,
    [items]
  );

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubfilter('TODOS');
    setFlippedCardId(null);
  };

  // Filtrado Nivel 3
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.field1Val.toLowerCase().includes(q) ||
          item.field2Val.toLowerCase().includes(q)
        );
      }
      const matchCat = item.category === selectedCategory;
      const matchSub = selectedSubfilter === 'TODOS' || item.subGroup === selectedSubfilter;
      return matchCat && matchSub;
    });
  }, [items, selectedCategory, selectedSubfilter, searchQuery]);

  // Actualizar campos en vivo en el reverso de la tarjeta 3D
  const updateCardField = (id, key, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [key]: value } : it))
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

  // Abrir Modal Táctil (Teclado Odómetro para Flota o Despacho Instantáneo a Garita)
  const openActionModal = (e, item) => {
    e.stopPropagation();
    if (item.category === 'Flota') {
      setActionModal({ item, mode: 'ODOMETRO' });
      setNumpadVal(String(item.numericVal || 42180));
      setFuelSlider(item.fuelPct || 90);
    } else {
      setActionModal({ item, mode: 'GARITA' });
      setGateActionNote(`Confirmado por Sra. Belkys · ${item.field4Val}`);
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
    if (numpadVal.length >= 7) return;
    setNumpadVal((prev) => `${prev}${key}`);
  };

  const handleConfirmActionModal = () => {
    if (!actionModal) return;
    const { item, mode } = actionModal;

    if (mode === 'ODOMETRO') {
      const nextKm = parseInt(numpadVal, 10) || item.numericVal;
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                numericVal: nextKm,
                fuelPct: fuelSlider,
                badgeMetric: `${fuelSlider}%`,
                field1Val: `${nextKm.toLocaleString('en-US')} km · Actualizado hoy`,
                status: fuelSlider < 35 ? 'RECARGAR COMBUSTIBLE' : '100% OPERATIVA',
                statusColor: fuelSlider < 35 ? '#EE6B5F' : '#10B981'
              }
            : it
        )
      );

      setGateLogs((prev) => [
        {
          id: `gl-${Date.now()}`,
          type: 'Actualización Mecánica Flota',
          item: item.title,
          detail: `Odómetro: ${nextKm.toLocaleString('en-US')} km · Combustible: ${fuelSlider}% (Cero registro de rutas)`,
          time: 'Justo ahora',
          color: '#10B981'
        },
        ...prev
      ]);
    } else {
      // Modo transmisión a Garita / Recepción de encomienda
      const isPackage = item.category === 'Encomiendas';
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                status: isPackage ? 'RECIBIDO EN CASA' : 'TRANSMITIDO A GARITA',
                statusColor: '#10B981',
                subGroup: isPackage ? 'ENTREGADO' : 'EN_SITIO'
              }
            : it
        )
      );

      setGateLogs((prev) => [
        {
          id: `gl-${Date.now()}`,
          type: isPackage ? 'Encomienda Retirada' : 'Enlace Enviado a Garita',
          item: item.title,
          detail: gateActionNote,
          time: 'Justo ahora',
          color: '#5E7AC6'
        },
        ...prev
      ]);
    }

    setActionModal(null);
    setFlippedCardId(null);
  };

  const handleCreatePass = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = {
      id: `sec-${Date.now()}`,
      category: 'Accesos',
      subGroup: 'ESPERADO',
      title: newTitle.trim(),
      subtitle: newSub.trim() || 'Visita / Proveedor Autorizado',
      status: 'PRE-AUTORIZADO',
      statusColor: '#5E7AC6',
      badgeMetric: 'Hoy',
      badgeUnit: 'Pase Activo',
      img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600',
      field1Label: 'Cédula / Identificación',
      field1Val: newIdDoc.trim() || 'Verificación en Garita Principal',
      field2Label: 'Vehículo y Placa',
      field2Val: newPlate.trim() || 'Ingreso Peatonal / Por Confirmar',
      field3Label: 'Área Autorizada en Casa',
      field3Val: newZone,
      field4Label: 'Supervisión / Recibe en Casa',
      field4Val: newHost,
      tags: ['Autorizado por Ama de Llaves', 'Notificado a Garita']
    };

    setItems([created, ...items]);
    setSelectedCategory('Accesos');
    setNewTitle('');
    setNewSub('');
    setNewIdDoc('');
    setNewPlate('');
    setShowAddDrawer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-sec-overlay" onClick={onClose}>
      <div className="domus-sec-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-sec-watermark" />

        {/* ==========================================
            CABECERA CON SELLO DE NO-INTERFERENCIA TÁCTICA
            ========================================== */}
        <header className="domus-sec-header">
          <div className="domus-sec-title-wrap">
            <div className="domus-sec-eyebrow">
              <Lock size={12} color="#10B981" />
              <span>PUENTE ADMINISTRATIVO CON GARITA · PROTOCOLO DE PRIVACIDAD Y CERO INTERFERENCIA TÁCTICA</span>
            </div>
            <h2>Enlace de Seguridad, Accesos, Paquetería y Flota</h2>
          </div>

          <div className="domus-sec-kpis">
            <div className="domus-sec-kpi">
              <small>PASES ACTIVOS</small>
              <strong style={{ color: '#5E7AC6' }}>{activePassesCount} Autorizados</strong>
            </div>
            <div
              className={`domus-sec-kpi ${pendingPackagesCount > 0 ? 'alert' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectCategory('Encomiendas')}
            >
              <small>PAQUETERÍA GARITA</small>
              <strong>{pendingPackagesCount} Por Subir</strong>
            </div>
            <button className="domus-sec-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
            BARRA DE VISTAS Y BUSCADOR
            ========================================== */}
        <div className="domus-sec-tabs-bar">
          <div className="domus-sec-tabs">
            <button
              className={`domus-sec-tab ${activeTab === 'EXPLORADOR' ? 'active' : ''}`}
              onClick={() => setActiveTab('EXPLORADOR')}
            >
              <Layers size={16} />
              <span>Explorador en Cascada ({items.length})</span>
            </button>
            <button
              className={`domus-sec-tab ${activeTab === 'BITACORA' ? 'active' : ''}`}
              onClick={() => setActiveTab('BITACORA')}
            >
              <ShieldCheck size={16} />
              <span>Bitácora de Enlace Casa ↔ Garita ({gateLogs.length})</span>
            </button>
          </div>

          {activeTab === 'EXPLORADOR' && (
            <div className="domus-sec-search-row">
              <div className="domus-sec-search">
                <Search size={15} color="#808080" />
                <input
                  type="text"
                  placeholder="Buscar técnico, placa, paquete o vehículo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="domus-sec-new-btn"
                onClick={() => setShowAddDrawer(!showAddDrawer)}
              >
                <Plus size={15} />
                <span>Autorizar Visita / Técnico</span>
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO PRINCIPAL CON PROGRESSIVE DISCLOSURE
            ========================================== */}
        <div className="domus-sec-body">

          {activeTab === 'EXPLORADOR' && (
            <>
              {/* GAVETA PARA AUTORIZAR NUEVA VISITA / PROVEEDOR EN GARITA */}
              {showAddDrawer && (
                <form className="domus-sec-add-drawer" onSubmit={handleCreatePass}>
                  <div className="domus-sec-drawer-head">
                    <div>
                      <span>PRE-AUTORIZACIÓN PARA GARITA PRINCIPAL</span>
                      <h4>Notificar Ingreso de Técnico, Proveedor o Visita</h4>
                    </div>
                    <button type="button" onClick={() => setShowAddDrawer(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="domus-sec-drawer-grid">
                    <div>
                      <label>Nombre o Empresa</label>
                      <input
                        type="text"
                        placeholder="Ej. Técnico Hidroneumático"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Motivo / Labor</label>
                      <input
                        type="text"
                        placeholder="Ej. Revisión de bombas"
                        value={newSub}
                        onChange={(e) => setNewSub(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Cédula / ID</label>
                      <input
                        type="text"
                        placeholder="Ej. V-15.220.110"
                        value={newIdDoc}
                        onChange={(e) => setNewIdDoc(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Vehículo y Placa</label>
                      <input
                        type="text"
                        placeholder="Ej. Pick-up Blanca · AB123CD"
                        value={newPlate}
                        onChange={(e) => setNewPlate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Área Autorizada</label>
                      <input
                        type="text"
                        value={newZone}
                        onChange={(e) => setNewZone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Quién Recibe y Acompaña</label>
                      <input
                        type="text"
                        value={newHost}
                        onChange={(e) => setNewHost(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="domus-sec-drawer-foot">
                    <button type="submit" className="domus-sec-save-new">
                      <Check size={15} /> Crear Pase 3D y Avisar a Garita
                    </button>
                  </div>
                </form>
              )}

              {/* ==========================================
                  NIVEL 1: CARRUSEL DE DIMENSIONES DE ENLACE
                  ========================================== */}
              <div className="domus-sec-level">
                <div className="domus-sec-lvl-head">
                  <span className="domus-sec-step-badge">NIVEL 1</span>
                  <h3>Módulos de Enlace con Seguridad Patrimonial (Sin Interferencia Táctica)</h3>
                </div>

                <div className="domus-sec-lvl1-carousel">
                  {SECURITY_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id && !searchQuery;
                    const catItems = items.filter((i) => i.category === cat.id);

                    return (
                      <div
                        key={cat.id}
                        className={`domus-sec-lvl1-card ${isSelected ? 'active' : ''}`}
                        style={{ '--cat-accent': cat.accent }}
                        onClick={() => {
                          setSearchQuery('');
                          handleSelectCategory(cat.id);
                        }}
                      >
                        <div className="domus-sec-lvl1-backlight"></div>
                        <div className="domus-sec-lvl1-inner">
                          <div
                            className="domus-sec-lvl1-bg"
                            style={{ backgroundImage: `url('${cat.img}')` }}
                          ></div>
                          <div className="domus-sec-lvl1-overlay"></div>

                          <div className="domus-sec-lvl1-top">
                            <span className="domus-sec-lvl1-sub">{cat.subtitle}</span>
                            <span className="domus-sec-lvl1-ok">{catItems.length} Activos</span>
                          </div>

                          <div className="domus-sec-lvl1-bottom">
                            <h4>{cat.title}</h4>
                            <span>Toque para filtrar tarjetas 3D</span>
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
                <div className="domus-sec-level domus-sec-lvl2-anim" key={selectedCategory}>
                  <div className="domus-sec-lvl-head">
                    <span className="domus-sec-step-badge" style={{ background: activeCategoryObj.accent }}>
                      NIVEL 2
                    </span>
                    <h3>Filtro Rápido de {activeCategoryObj.title}</h3>
                  </div>

                  <div className="domus-sec-lvl2-carousel">
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
                          className={`domus-sec-lvl2-pill ${isSubActive ? 'active' : ''}`}
                          style={{ '--sub-accent': activeCategoryObj.accent }}
                        >
                          <div className="domus-sec-lvl2-icon">{sub.icon}</div>
                          <div className="domus-sec-lvl2-info">
                            <strong>{sub.name}</strong>
                            <span>Ver fichas</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==========================================
                  NIVEL 3: GRILLA DE TARJETAS 3D FLIP (FRENTE + REVERSO EDITABLE)
                  ========================================== */}
              <div className="domus-sec-level">
                <div className="domus-sec-lvl-head">
                  <span className="domus-sec-step-badge" style={{ background: '#10B981' }}>
                    NIVEL 3
                  </span>
                  <h3>
                    {activeCategoryObj.title} ({filteredItems.length}) · Toque cualquier tarjeta para girar su ficha técnica 3D y transmitir a Garita
                  </h3>
                </div>

                <div className="domus-sec-flip-grid">
                  {filteredItems.map((item) => {
                    const isFlipped = flippedCardId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`domus-sec-flip-scene ${isFlipped ? 'is-flipped' : ''}`}
                        style={{ '--card-glow': item.statusColor || activeCategoryObj.accent }}
                        onClick={() => setFlippedCardId(isFlipped ? null : item.id)}
                      >
                        <div className="domus-sec-flip-backlight"></div>

                        <div className="domus-sec-flip-inner">
                          {/* ==========================================
                              CARA FRONTAL (IMAGEN + RESUMEN GLASSMORPHISM)
                              ========================================== */}
                          <div className="domus-sec-face domus-sec-front">
                            <div
                              className="domus-sec-front-bg"
                              style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="domus-sec-front-shade"></div>

                            <div className="domus-sec-front-top">
                              <span
                                className="domus-sec-status-pill"
                                style={{ background: item.statusColor }}
                              >
                                {item.status}
                              </span>
                              <span className="domus-sec-flip-hint">
                                <RotateCw size={13} /> Ficha 3D
                              </span>
                            </div>

                            <div className="domus-sec-front-glass">
                              <div className="domus-sec-front-title-row">
                                <div>
                                  <small>{item.subtitle}</small>
                                  <h4>{item.title}</h4>
                                </div>
                                <div className="domus-sec-metric-chip">
                                  <strong>{item.badgeMetric}</strong>
                                  <span>{item.badgeUnit}</span>
                                </div>
                              </div>

                              <div className="domus-sec-front-meta">
                                <span>{item.field1Val}</span>
                              </div>

                              <div className="domus-sec-front-tags">
                                {item.tags.map((t, idx) => (
                                  <span key={idx} className="domus-sec-mini-tag">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* ==========================================
                              CARA REVERSO (FICHA TÉCNICA EDITABLE + DESPACHO)
                              ========================================== */}
                          <div
                            className="domus-sec-face domus-sec-back"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="domus-sec-back-head">
                              <div>
                                <span>{item.category.toUpperCase()} · PROTOCOLO ROQUEDAL</span>
                                <h4>{item.title}</h4>
                              </div>
                              <button
                                type="button"
                                className="domus-sec-unflip-btn"
                                onClick={() => setFlippedCardId(null)}
                              >
                                <RotateCw size={13} /> Frente
                              </button>
                            </div>

                            <div className="domus-sec-edit-form">
                              <div>
                                <label>{item.field1Label}</label>
                                <input
                                  type="text"
                                  value={item.field1Val}
                                  onChange={(e) => updateCardField(item.id, 'field1Val', e.target.value)}
                                />
                              </div>
                              <div>
                                <label>{item.field2Label}</label>
                                <input
                                  type="text"
                                  value={item.field2Val}
                                  onChange={(e) => updateCardField(item.id, 'field2Val', e.target.value)}
                                />
                              </div>
                              <div>
                                <label>{item.field3Label}</label>
                                <input
                                  type="text"
                                  value={item.field3Val}
                                  onChange={(e) => updateCardField(item.id, 'field3Val', e.target.value)}
                                />
                              </div>
                              <div>
                                <label>{item.field4Label}</label>
                                <input
                                  type="text"
                                  value={item.field4Val}
                                  onChange={(e) => updateCardField(item.id, 'field4Val', e.target.value)}
                                />
                              </div>
                            </div>

                            {savedToastId === item.id ? (
                              <div className="domus-sec-saved-pill">
                                <CheckCircle2 size={15} /> ¡Ficha de seguridad actualizada!
                              </div>
                            ) : (
                              <div className="domus-sec-back-actions">
                                <button
                                  type="button"
                                  className="domus-sec-btn-save"
                                  onClick={(e) => handleSaveCard(e, item.id)}
                                >
                                  <Check size={14} />
                                  <span>[ GUARDAR ]</span>
                                </button>
                                <button
                                  type="button"
                                  className="domus-sec-btn-dispatch"
                                  onClick={(e) => openActionModal(e, item)}
                                >
                                  {item.category === 'Flota' ? <Fuel size={14} /> : <Send size={14} />}
                                  <span>
                                    {item.category === 'Flota'
                                      ? '[ KM / GASOLINA ]'
                                      : item.category === 'Encomiendas'
                                      ? '[ CONFIRMAR RETIRO ]'
                                      : '[ AVISAR A GARITA ]'}
                                  </span>
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

          {/* VISTA 2: BITÁCORA DE ENLACE CASA ↔ GARITA */}
          {activeTab === 'BITACORA' && (
            <div className="domus-sec-logs-card">
              <div className="domus-sec-logs-head">
                <div>
                  <h3>Historial de Comunicaciones Casa ↔ Garita Principal</h3>
                  <p>Registro auditable de autorizaciones de acceso, retiro de paquetería y chequeos mecánicos de flota</p>
                </div>
              </div>

              <div className="domus-sec-logs-stack">
                {gateLogs.map((log) => (
                  <div key={log.id} className="domus-sec-log-row">
                    <div className="domus-sec-log-dot" style={{ background: log.color }}></div>
                    <div className="domus-sec-log-info">
                      <strong>{log.item} · <span style={{ color: log.color }}>{log.type}</span></strong>
                      <span>{log.detail}</span>
                    </div>
                    <small className="domus-sec-log-time">{log.time}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ==========================================
            4. MODAL FLOTANTE: NUMPAD DE ODÓMETRO/COMBUSTIBLE O DESPACHO A GARITA
            ========================================== */}
        {actionModal && (
          <div className="domus-sec-numpad-backdrop" onClick={() => setActionModal(null)}>
            <div className="domus-sec-numpad-window" onClick={(e) => e.stopPropagation()}>
              <div className="domus-sec-numpad-top">
                <div>
                  <span className="domus-sec-mode-tag">
                    {actionModal.mode === 'ODOMETRO'
                      ? 'CONTROL MECÁNICO DE FLOTA (CERO RUTAS)'
                      : 'TRANSMISIÓN DIRECTA A GARITA PRINCIPAL'}
                  </span>
                  <h3>{actionModal.item.title}</h3>
                  <small>{actionModal.item.subtitle}</small>
                </div>
                <button type="button" className="domus-sec-close-sm" onClick={() => setActionModal(null)}>
                  <X size={18} />
                </button>
              </div>

              {actionModal.mode === 'ODOMETRO' ? (
                <>
                  {/* Pantalla Digital de Odómetro */}
                  <div className="domus-sec-odo-screen">
                    <div>
                      <small>LECTURA DE ODÓMETRO (PARA CAMBIO DE ACEITE)</small>
                      <strong>{numpadVal ? Number(numpadVal).toLocaleString('en-US') : '0'}</strong>
                    </div>
                    <span className="domus-sec-odo-unit">KILÓMETROS</span>
                  </div>

                  {/* Control Táctil de Nivel de Combustible */}
                  <div className="domus-sec-fuel-box">
                    <div className="domus-sec-fuel-head">
                      <span>Nivel Actual de Tanque de Combustible</span>
                      <strong style={{ color: fuelSlider < 35 ? '#EE6B5F' : '#10B981' }}>{fuelSlider}%</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={fuelSlider}
                      onChange={(e) => setFuelSlider(Number(e.target.value))}
                      className="domus-sec-fuel-slider"
                    />
                  </div>

                  {/* Teclado Numérico Táctil */}
                  <div className="domus-sec-numpad-grid">
                    {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '00'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        className="domus-sec-key"
                        onClick={() => handleNumpadKey(digit)}
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="domus-sec-key back"
                      onClick={() => handleNumpadKey('BACK')}
                    >
                      <Delete size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="domus-sec-gate-summary">
                    <div>
                      <small>IDENTIFICACIÓN / DETALLE</small>
                      <strong>{actionModal.item.field1Val}</strong>
                    </div>
                    <div>
                      <small>VEHÍCULO / UBICACIÓN</small>
                      <strong>{actionModal.item.field2Val}</strong>
                    </div>
                    <div>
                      <small>PROTOCOLO INTERNO</small>
                      <strong>{actionModal.item.field3Val}</strong>
                    </div>
                  </div>

                  <div className="domus-sec-note-box">
                    <label>Instrucción para el Jefe de Garita (Sup. Marcos Rivas)</label>
                    <textarea
                      rows={3}
                      value={gateActionNote}
                      onChange={(e) => setGateActionNote(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="domus-sec-numpad-foot">
                <button
                  type="button"
                  className="domus-sec-cancel-btn"
                  onClick={() => setActionModal(null)}
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  className="domus-sec-confirm-btn"
                  onClick={handleConfirmActionModal}
                >
                  <Check size={17} />
                  <span>
                    {actionModal.mode === 'ODOMETRO'
                      ? '[ ACTUALIZAR UNIDAD ]'
                      : '[ TRANSMITIR A GARITA ]'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PIE DEL MODAL
            ========================================== */}
        <footer className="domus-sec-footer">
          <span>Protocolo de Privacidad Activo · Domus gestiona intendencia, accesos domésticos y mecánica sin interferir con la seguridad táctica</span>
          <button className="domus-sec-close-btn" onClick={onClose}>
            VOLVER AL PANEL PRINCIPAL
          </button>
        </footer>

        {/* ==========================================
            HOJA DE ESTILOS AISLADA (3D FLIP SECURITY + GATE LIAISON)
            ========================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          .domus-sec-overlay {
            position: fixed; inset: 0; z-index: 192;
            background: rgba(18, 22, 36, 0.58);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            animation: domusSecFade 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 768px) {
            .domus-sec-overlay { padding: 20px; }
          }
          @keyframes domusSecFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-sec-modal {
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
            .domus-sec-modal {
              height: 92vh;
              border-radius: 36px;
            }
          }

          .domus-sec-watermark {
            position: absolute; right: -40px; bottom: 40px;
            width: 280px; height: 280px; object-fit: contain;
            opacity: 0.04; pointer-events: none; z-index: 0;
          }

          /* HEADER */
          .domus-sec-header {
            position: relative; z-index: 2;
            padding: 16px 18px 14px;
            background: rgba(255, 255, 255, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.92);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-sec-header { padding: 20px 32px 16px; }
          }
          .domus-sec-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.11em; color: #059669;
            margin-bottom: 3px;
          }
          .domus-sec-title-wrap h2 {
            font-size: clamp(20px, 2.5vw, 27px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-sec-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-sec-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 7px 14px; border-radius: 15px;
          }
          @media (min-width: 640px) { .domus-sec-kpi { display: flex; } }
          .domus-sec-kpi small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080; }
          .domus-sec-kpi strong { font-size: 13px; font-weight: 900; color: #202020; }
          .domus-sec-kpi.alert {
            background: rgba(238, 107, 95, 0.12);
            border-color: rgba(238, 107, 95, 0.35);
          }
          .domus-sec-kpi.alert strong { color: #EE6B5F; }

          .domus-sec-close {
            width: 40px; height: 40px; border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.08);
            background: #fff; color: #202020;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-sec-close:hover {
            background: #EE6B5F; color: #fff; border-color: #EE6B5F; transform: rotate(90deg);
          }

          /* TABS & SEARCH */
          .domus-sec-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.48);
            border-bottom: 1px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-sec-tabs-bar { padding: 12px 32px; } }
          .domus-sec-tabs { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; }
          .domus-sec-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 16px; border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.7);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer; transition: all 0.22s ease;
          }
          .domus-sec-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-sec-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }

          .domus-sec-search-row { display: flex; align-items: center; gap: 8px; }
          .domus-sec-search {
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 14px; min-width: 220px;
          }
          .domus-sec-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }
          .domus-sec-new-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 14px; border: none;
            background: #202020; color: #fff;
            font-size: 11px; font-weight: 900; cursor: pointer; white-space: nowrap;
          }
          .domus-sec-new-btn:hover { background: #5E7AC6; }

          /* BODY */
          .domus-sec-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
            display: flex; flex-direction: column; gap: 22px;
          }
          @media (min-width: 768px) { .domus-sec-body { padding: 22px 32px; } }

          .domus-sec-level { display: flex; flex-direction: column; gap: 12px; }
          .domus-sec-lvl-head { display: flex; align-items: center; gap: 10px; }
          .domus-sec-step-badge {
            background: #5E7AC6; color: #fff;
            font-size: 9px; font-weight: 900; letter-spacing: 0.12em;
            padding: 4px 9px; border-radius: 99px;
          }
          .domus-sec-lvl-head h3 {
            margin: 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }

          /* NIVEL 1: CARRUSEL */
          .domus-sec-lvl1-carousel {
            display: flex; gap: 16px; overflow-x: auto;
            padding: 6px 4px 12px; scroll-snap-type: x mandatory;
          }
          .domus-sec-lvl1-card {
            position: relative;
            min-width: 230px; height: 124px; flex: 1;
            scroll-snap-align: start; cursor: pointer;
            transition: transform 0.25s ease;
          }
          .domus-sec-lvl1-card:hover { transform: translateY(-4px); }
          .domus-sec-lvl1-backlight {
            position: absolute; inset: -5px; border-radius: 26px;
            background: var(--cat-accent); filter: blur(14px);
            opacity: 0; transition: opacity 0.28s ease; z-index: 0;
          }
          .domus-sec-lvl1-card.active .domus-sec-lvl1-backlight,
          .domus-sec-lvl1-card:hover .domus-sec-lvl1-backlight {
            opacity: 0.55;
          }
          .domus-sec-lvl1-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%; border-radius: 22px; overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 12px 16px; box-sizing: border-box;
          }
          .domus-sec-lvl1-bg {
            position: absolute; inset: 0; background-size: cover; background-position: center;
            transition: transform 0.5s ease;
          }
          .domus-sec-lvl1-card:hover .domus-sec-lvl1-bg { transform: scale(1.08); }
          .domus-sec-lvl1-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0.84) 100%);
          }
          .domus-sec-lvl1-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between; gap: 6px;
          }
          .domus-sec-lvl1-sub {
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            color: #fff; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-sec-lvl1-ok {
            font-size: 9px; font-weight: 900; background: #10B981; color: #fff;
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-sec-lvl1-bottom { position: relative; z-index: 2; color: #fff; }
          .domus-sec-lvl1-bottom h4 { margin: 0; font-size: 17.5px; font-weight: 900; }
          .domus-sec-lvl1-bottom span { font-size: 10.5px; font-weight: 700; opacity: 0.85; }

          /* NIVEL 2: SUB-FILTROS */
          .domus-sec-lvl2-carousel {
            display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 8px;
          }
          .domus-sec-lvl2-pill {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px; border-radius: 18px;
            background: rgba(255, 255, 255, 0.78);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
          }
          .domus-sec-lvl2-pill.active {
            background: var(--sub-accent); color: #fff;
            box-shadow: 0 10px 22px -6px var(--sub-accent);
          }
          .domus-sec-lvl2-icon {
            width: 32px; height: 32px; border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            display: flex; align-items: center; justify-content: center; font-size: 15px;
          }
          .domus-sec-lvl2-info { text-align: left; display: flex; flex-direction: column; }
          .domus-sec-lvl2-info strong { font-size: 12.5px; font-weight: 900; color: #202020; }
          .domus-sec-lvl2-info span { font-size: 10px; font-weight: 700; color: #666; }
          .domus-sec-lvl2-pill.active .domus-sec-lvl2-info strong,
          .domus-sec-lvl2-pill.active .domus-sec-lvl2-info span {
            color: #fff;
          }

          /* NIVEL 3: GRILLA DE FLIP CARDS 3D */
          .domus-sec-flip-grid {
            display: grid; grid-template-columns: 1fr; gap: 22px;
          }
          @media (min-width: 680px) {
            .domus-sec-flip-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1120px) {
            .domus-sec-flip-grid { grid-template-columns: repeat(3, 1fr); }
          }

          .domus-sec-flip-scene {
            position: relative;
            height: 360px;
            perspective: 1400px;
            cursor: pointer;
          }
          .domus-sec-flip-backlight {
            position: absolute; inset: -6px; border-radius: 32px;
            background: var(--card-glow);
            filter: blur(18px); opacity: 0.22;
            transition: opacity 0.3s ease; z-index: 0;
          }
          .domus-sec-flip-scene:hover .domus-sec-flip-backlight,
          .domus-sec-flip-scene.is-flipped .domus-sec-flip-backlight {
            opacity: 0.58;
          }

          .domus-sec-flip-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%;
            transition: transform 0.68s cubic-bezier(0.22, 1, 0.36, 1);
            transform-style: preserve-3d;
          }
          .domus-sec-flip-scene.is-flipped .domus-sec-flip-inner {
            transform: rotateY(180deg);
          }

          .domus-sec-face {
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
          .domus-sec-front {
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 16px;
          }
          .domus-sec-front-bg {
            position: absolute; inset: 0;
            background-size: cover; background-position: center;
            transition: transform 0.6s ease;
          }
          .domus-sec-flip-scene:hover .domus-sec-front-bg { transform: scale(1.06); }
          .domus-sec-front-shade {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.86) 100%);
          }
          .domus-sec-front-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-sec-status-pill {
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.08em;
            color: #fff; padding: 6px 12px; border-radius: 99px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          }
          .domus-sec-flip-hint {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
            color: #202020; font-size: 10px; font-weight: 900;
            padding: 6px 11px; border-radius: 99px;
          }

          .domus-sec-front-glass {
            position: relative; z-index: 2;
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.96);
            border-radius: 22px; padding: 15px;
            display: flex; flex-direction: column; gap: 8px;
          }
          .domus-sec-front-title-row {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          }
          .domus-sec-front-title-row small {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.07em; color: #5E7AC6;
          }
          .domus-sec-front-title-row h4 {
            margin: 2px 0 0; font-size: 17px; font-weight: 900; color: #202020; line-height: 1.15;
          }
          .domus-sec-metric-chip {
            background: #181C26; color: #fff;
            padding: 5px 10px; border-radius: 12px; text-align: center; flex-shrink: 0;
          }
          .domus-sec-metric-chip strong { font-size: 13.5px; font-weight: 900; color: #6EE7B7; display: block; line-height: 1.1; }
          .domus-sec-metric-chip span { font-size: 8.5px; font-weight: 800; color: rgba(255,255,255,0.7); }

          .domus-sec-front-meta {
            font-size: 11px; font-weight: 800; color: #444;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .domus-sec-front-tags { display: flex; flex-wrap: wrap; gap: 5px; }
          .domus-sec-mini-tag {
            font-size: 9.5px; font-weight: 800; color: #5E7AC6;
            background: rgba(94, 122, 198, 0.12);
            padding: 3px 8px; border-radius: 8px;
          }

          /* REVERSO EDITABLE */
          .domus-sec-back {
            transform: rotateY(180deg);
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(28px);
            padding: 15px 16px;
            display: flex; flex-direction: column; justify-content: space-between;
            cursor: default;
          }
          .domus-sec-back-head {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06);
          }
          .domus-sec-back-head span {
            font-size: 8.5px; font-weight: 900; color: #5E7AC6; letter-spacing: 0.08em;
          }
          .domus-sec-back-head h4 {
            margin: 2px 0 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }
          .domus-sec-unflip-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 11px; border-radius: 99px;
            border: 1px solid rgba(0,0,0,0.1); background: #F4F6FA;
            font-size: 10px; font-weight: 900; color: #202020; cursor: pointer;
          }

          .domus-sec-edit-form { display: flex; flex-direction: column; gap: 7px; }
          .domus-sec-edit-form label {
            display: block; font-size: 8.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.06em; color: #666; margin-bottom: 2px;
          }
          .domus-sec-edit-form input {
            width: 100%; box-sizing: border-box;
            padding: 6px 9px; border-radius: 9px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC;
            font-size: 11px; font-weight: 800; color: #202020; outline: none;
          }

          .domus-sec-back-actions {
            display: grid; grid-template-columns: 0.9fr 1.25fr; gap: 8px; padding-top: 4px;
          }
          .domus-sec-btn-save {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #10B981; color: #fff; font-size: 10px; font-weight: 900; cursor: pointer;
          }
          .domus-sec-btn-dispatch {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #5E7AC6; color: #fff; font-size: 10px; font-weight: 900; cursor: pointer;
            box-shadow: 0 6px 14px rgba(94, 122, 198, 0.3);
          }
          .domus-sec-saved-pill {
            padding: 9px; border-radius: 12px;
            background: rgba(16, 185, 129, 0.16); color: #065F46;
            font-size: 11px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 6px;
          }

          /* 4. MODAL NUMPAD ODÓMETRO / TRANSMISIÓN A GARITA */
          .domus-sec-numpad-backdrop {
            position: fixed; inset: 0; z-index: 230;
            background: rgba(15, 23, 42, 0.58); backdrop-filter: blur(12px);
            display: flex; align-items: center; justify-content: center; padding: 16px;
          }
          .domus-sec-numpad-window {
            width: 100%; max-width: 440px;
            background: rgba(255, 255, 255, 0.97);
            border-radius: 32px; padding: 22px;
            box-shadow: 0 28px 70px rgba(15, 23, 42, 0.4);
            display: flex; flex-direction: column; gap: 14px;
          }
          .domus-sec-numpad-top {
            display: flex; align-items: flex-start; justify-content: space-between;
          }
          .domus-sec-mode-tag {
            display: inline-block; font-size: 8.5px; font-weight: 900;
            letter-spacing: 0.1em; color: #5E7AC6;
            background: rgba(94, 122, 198, 0.14); padding: 3px 9px; border-radius: 99px;
          }
          .domus-sec-numpad-top h3 { margin: 3px 0 2px; font-size: 19px; font-weight: 900; }
          .domus-sec-numpad-top small { font-size: 11.5px; color: #666; }
          .domus-sec-close-sm {
            width: 34px; height: 34px; border-radius: 50%; border: none;
            background: #F4F6FA; cursor: pointer; display: flex; align-items: center; justify-content: center;
          }

          .domus-sec-odo-screen {
            display: flex; align-items: center; justify-content: space-between;
            background: #181C26; color: #fff;
            padding: 14px 18px; border-radius: 20px;
          }
          .domus-sec-odo-screen small {
            display: block; font-size: 8.5px; font-weight: 800; color: rgba(255,255,255,0.65);
          }
          .domus-sec-odo-screen strong { font-size: 28px; font-weight: 900; color: #6EE7B7; }
          .domus-sec-odo-unit {
            font-size: 10px; font-weight: 900; background: rgba(255,255,255,0.12);
            padding: 6px 10px; border-radius: 10px;
          }

          .domus-sec-fuel-box {
            background: #F7F9FC; padding: 12px 14px; border-radius: 16px;
          }
          .domus-sec-fuel-head {
            display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 800; margin-bottom: 6px;
          }
          .domus-sec-fuel-slider { width: 100%; accent-color: #10B981; cursor: pointer; }

          .domus-sec-numpad-grid {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
          }
          .domus-sec-key {
            height: 48px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.06);
            background: #F4F6FA; color: #202020;
            font-size: 18px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
          }
          .domus-sec-key.back { color: #EE6B5F; }

          .domus-sec-gate-summary {
            background: #F7F9FC; padding: 14px; border-radius: 18px;
            display: flex; flex-direction: column; gap: 10px;
          }
          .domus-sec-gate-summary small {
            display: block; font-size: 8.5px; font-weight: 900; color: #888;
          }
          .domus-sec-gate-summary strong { font-size: 12.5px; font-weight: 800; color: #202020; }
          .domus-sec-note-box label {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; color: #5E7AC6; margin-bottom: 5px;
          }
          .domus-sec-note-box textarea {
            width: 100%; box-sizing: border-box; padding: 11px; border-radius: 13px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC;
            font-size: 12px; font-weight: 700; font-family: inherit;
          }

          .domus-sec-numpad-foot {
            display: grid; grid-template-columns: 1fr 1.7fr; gap: 10px;
          }
          .domus-sec-cancel-btn {
            padding: 13px; border-radius: 15px; border: 1px solid rgba(0,0,0,0.1);
            background: #fff; font-size: 11px; font-weight: 900; color: #666; cursor: pointer;
          }
          .domus-sec-confirm-btn {
            padding: 13px; border-radius: 15px; border: none;
            background: #5E7AC6; color: #fff; font-size: 11.5px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
          }

          /* ADD DRAWER & LOGS */
          .domus-sec-add-drawer {
            background: #fff; border: 1.5px solid rgba(94, 122, 198, 0.35);
            border-radius: 24px; padding: 18px;
          }
          .domus-sec-drawer-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
          }
          .domus-sec-drawer-head span { font-size: 9.5px; font-weight: 900; color: #5E7AC6; }
          .domus-sec-drawer-head h4 { margin: 2px 0 0; font-size: 16px; font-weight: 900; }
          .domus-sec-drawer-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;
          }
          .domus-sec-drawer-grid label {
            display: block; font-size: 9.5px; font-weight: 900; color: #666; margin-bottom: 4px;
          }
          .domus-sec-drawer-grid input {
            width: 100%; box-sizing: border-box; padding: 9px 11px; border-radius: 11px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC; font-size: 12px; font-weight: 700;
          }
          .domus-sec-drawer-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
          .domus-sec-save-new {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 10px 18px; border-radius: 12px; border: none;
            background: #10B981; color: #fff; font-size: 11.5px; font-weight: 900; cursor: pointer;
          }

          .domus-sec-logs-card {
            background: rgba(255,255,255,0.85); border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
          }
          .domus-sec-logs-head h3 { margin: 0 0 4px; font-size: 18px; font-weight: 900; }
          .domus-sec-logs-head p { margin: 0 0 16px; font-size: 12px; color: #666; }
          .domus-sec-logs-stack { display: flex; flex-direction: column; gap: 10px; }
          .domus-sec-log-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 16px; border-radius: 16px; background: #F7F9FC;
          }
          .domus-sec-log-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
          .domus-sec-log-info { flex: 1; display: flex; flex-direction: column; }
          .domus-sec-log-info strong { font-size: 13.5px; font-weight: 900; color: #202020; }
          .domus-sec-log-info span { font-size: 11.5px; color: #555; font-weight: 600; }
          .domus-sec-log-time { font-size: 11px; font-weight: 800; color: #888; }

          /* FOOTER */
          .domus-sec-footer {
            position: relative; z-index: 2;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.78);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px; font-size: 11px; font-weight: 700; color: #666;
          }
          .domus-sec-close-btn {
            padding: 11px 18px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.12); background: #fff;
            font-size: 11px; font-weight: 900; color: #202020; cursor: pointer;
          }
        `}} />
      </div>
    </div>
  );
}