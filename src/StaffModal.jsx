import React, { useState, useMemo } from 'react';
import {
  X, Users, ClipboardCheck, Calendar, ShieldCheck, Clock,
  CheckCircle2, Search, Plus, Check, Sparkles, Lock,
  RotateCw, DollarSign, Briefcase, Key, Send
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

// ==========================================
// 1. CATEGORÍAS DE DEPARTAMENTOS (NIVEL 1)
// ==========================================
const STAFF_CATEGORIES = [
  {
    id: 'Todos',
    title: 'Todo el Personal',
    subtitle: 'Plantilla Casa Roquedal',
    accent: '#5E7AC6',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=700'
  },
  {
    id: 'Dirección y Cocina',
    title: 'Dirección & Cocina',
    subtitle: 'Intendencia y Gastronomía',
    accent: '#EE6B5F',
    img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=700'
  },
  {
    id: 'Salud',
    title: 'Salud & Enfermería',
    subtitle: 'Cuidado Dr. Jiménez 24h',
    accent: '#10B981',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=700'
  },
  {
    id: 'Hospitalidad',
    title: 'Hospitalidad & Lencería',
    subtitle: 'Suites, Lavandería y Áreas',
    accent: '#BE7AC6',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=700'
  },
  {
    id: 'Mantenimiento',
    title: 'Mantenimiento & Planta',
    subtitle: 'Ingeniería, Jardín y Piscina',
    accent: '#F59E0B',
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=700'
  },
  {
    id: 'Seguridad Polar',
    title: 'Seguridad & Flota',
    subtitle: 'Garita y Chóferes Ejecutivos',
    accent: '#5E7AC6',
    img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=700'
  }
];

const SUB_FILTERS = [
  { id: 'TODOS', name: 'Plantilla Completa', icon: '👥' },
  { id: 'ACTIVO', name: 'En Turno Ahora', icon: '🟢' },
  { id: 'JEFES', name: 'Supervisores y Jefes', icon: '⭐' },
  { id: 'GUARDIA', name: 'Guardias 12h / 24h', icon: '🛡️' },
  { id: 'DESCANSO', name: 'En Descanso / Libre', icon: '🌙' }
];

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const ALL_PERMITS = ['Alacena', 'Balanza', 'Salud', 'Hospitalidad', 'Mantenimiento', 'Garita', 'Flota', 'Personal'];

// ==========================================
// 2. PLANTILLA CON FOTOS DE PERFIL Y DATOS EDITABLES
// ==========================================
const INITIAL_STAFF = [
  {
    id: 'st-1',
    name: 'Sra. Belkys',
    role: 'Ama de Llaves Ejecutiva',
    department: 'Dirección y Cocina',
    shiftType: 'JEFES',
    hours: '06:30 AM - 06:00 PM',
    daysOff: ['Dom'],
    salary: 1200,
    status: 'ACTIVO',
    pin: '1042',
    accessLevel: 'ADMIN_CASA',
    permissions: ['Alacena', 'Balanza', 'Personal', 'Salud', 'Hospitalidad', 'Mantenimiento', 'Garita', 'Flota'],
    phone: '+58 414-2891042',
    avatar: 'SB',
    color: '#5E7AC6',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre']
  },
  {
    id: 'st-2',
    name: 'Chef Jesús Sequea',
    role: 'Chef Ejecutivo Residencial',
    department: 'Dirección y Cocina',
    shiftType: 'JEFES',
    hours: '07:00 AM - 04:00 PM',
    daysOff: ['Dom'],
    salary: 1400,
    status: 'ACTIVO',
    pin: '8821',
    accessLevel: 'JEFE_AREA',
    permissions: ['Alacena', 'Balanza', 'Hospitalidad'],
    phone: '+58 412-9014421',
    avatar: 'JS',
    color: '#EE6B5F',
    photo: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Especial', 'Libre']
  },
  {
    id: 'st-3',
    name: 'María Fernanda Rojas',
    role: 'Auxiliar de Cocina y Comedor',
    department: 'Dirección y Cocina',
    shiftType: 'DIURNO',
    hours: '06:30 AM - 03:30 PM',
    daysOff: ['Sáb'],
    salary: 520,
    status: 'ACTIVO',
    pin: '3319',
    accessLevel: 'OPERATIVO',
    permissions: ['Alacena', 'Balanza'],
    phone: '+58 414-3118765',
    avatar: 'MR',
    color: '#EE6B5F',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Diurno']
  },
  {
    id: 'st-4',
    name: 'Lic. Carmen Valero',
    role: 'Enfermera Jefe Diurna',
    department: 'Salud',
    shiftType: 'GUARDIA',
    hours: '07:00 AM - 07:00 PM',
    daysOff: ['Mié', 'Sáb'],
    salary: 950,
    status: 'ACTIVO',
    pin: '7740',
    accessLevel: 'SALUD',
    permissions: ['Salud', 'Alacena', 'Hospitalidad'],
    phone: '+58 424-1983320',
    avatar: 'CV',
    color: '#10B981',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Libre', 'Diurno', 'Diurno', 'Libre', 'Diurno']
  },
  {
    id: 'st-5',
    name: 'Lic. Gabriela Méndez',
    role: 'Enfermera Especialista Nocturna',
    department: 'Salud',
    shiftType: 'GUARDIA',
    hours: '07:00 PM - 07:00 AM',
    daysOff: ['Mié', 'Sáb'],
    salary: 980,
    status: 'DESCANSO',
    pin: '7741',
    accessLevel: 'SALUD',
    permissions: ['Salud'],
    phone: '+58 412-5549081',
    avatar: 'GM',
    color: '#10B981',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600',
    schedule: ['Nocturno', 'Nocturno', 'Libre', 'Nocturno', 'Nocturno', 'Libre', 'Nocturno']
  },
  {
    id: 'st-6',
    name: 'Elena Castillo',
    role: 'Camarera de Suites y Lencería',
    department: 'Hospitalidad',
    shiftType: 'DIURNO',
    hours: '07:30 AM - 04:30 PM',
    daysOff: ['Sáb', 'Dom'],
    salary: 480,
    status: 'ACTIVO',
    pin: '4102',
    accessLevel: 'OPERATIVO',
    permissions: ['Hospitalidad', 'Alacena'],
    phone: '+58 416-8221904',
    avatar: 'EC',
    color: '#BE7AC6',
    photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Libre']
  },
  {
    id: 'st-7',
    name: 'Rosaura Díaz',
    role: 'Lavandería, Planchado y Áreas',
    department: 'Hospitalidad',
    shiftType: 'DIURNO',
    hours: '07:30 AM - 04:30 PM',
    daysOff: ['Jue', 'Dom'],
    salary: 480,
    status: 'ACTIVO',
    pin: '4105',
    accessLevel: 'OPERATIVO',
    permissions: ['Hospitalidad'],
    phone: '+58 414-7723109',
    avatar: 'RD',
    color: '#BE7AC6',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Libre', 'Diurno', 'Diurno', 'Libre']
  },
  {
    id: 'st-8',
    name: 'Carlos Padrón',
    role: 'Jefe de Mantenimiento y Planta',
    department: 'Mantenimiento',
    shiftType: 'JEFES',
    hours: '07:30 AM - 04:30 PM',
    daysOff: ['Dom'],
    salary: 780,
    status: 'ACTIVO',
    pin: '5091',
    accessLevel: 'JEFE_AREA',
    permissions: ['Mantenimiento', 'Garita'],
    phone: '+58 424-2094412',
    avatar: 'CP',
    color: '#F59E0B',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Guardia', 'Libre']
  },
  {
    id: 'st-9',
    name: 'José Gregorio Tovar',
    role: 'Paisajismo, Jardines y Piscina',
    department: 'Mantenimiento',
    shiftType: 'DIURNO',
    hours: '07:00 AM - 03:30 PM',
    daysOff: ['Sáb', 'Dom'],
    salary: 460,
    status: 'ACTIVO',
    pin: '5098',
    accessLevel: 'OPERATIVO',
    permissions: ['Mantenimiento'],
    phone: '+58 412-3391028',
    avatar: 'JT',
    color: '#F59E0B',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Libre']
  },
  {
    id: 'st-10',
    name: 'Sup. Marcos Rivas',
    role: 'Jefe de Garita · Seguridad Patrimonial',
    department: 'Seguridad Polar',
    shiftType: 'GUARDIA',
    hours: 'Guardia 24x24 (07:00 AM)',
    daysOff: ['Mar', 'Jue', 'Sáb'],
    salary: 850,
    status: 'ACTIVO',
    pin: '9001',
    accessLevel: 'ENLACE_GARITA',
    permissions: ['Garita'],
    phone: 'Enlace Directo Garita',
    avatar: 'MR',
    color: '#5E7AC6',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
    schedule: ['24h', 'Libre', '24h', 'Libre', '24h', 'Libre', '24h']
  },
  {
    id: 'st-11',
    name: 'Andrés Mendoza',
    role: 'Chófer Ejecutivo y Escolta Principal',
    department: 'Seguridad Polar',
    shiftType: 'GUARDIA',
    hours: 'Disponibilidad Ejecutiva',
    daysOff: ['Dom'],
    salary: 820,
    status: 'ACTIVO',
    pin: '9004',
    accessLevel: 'FLOTA',
    permissions: ['Flota', 'Garita'],
    phone: '+58 414-9002211',
    avatar: 'AM',
    color: '#5E7AC6',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Guardia', 'Libre']
  }
];

const INITIAL_TASKS = [
  { id: 'tk-1', title: 'Preparación y emplatado de almuerzo bajo en sodio (Dr. Jiménez)', staffId: 'st-2', department: 'Dirección y Cocina', time: '12:30 PM', priority: 'ALTA', done: true },
  { id: 'tk-2', title: 'Cambio de lencería egipcia y climatización a 22°C en Suite Principal', staffId: 'st-6', department: 'Hospitalidad', time: '10:00 AM', priority: 'ALTA', done: true },
  { id: 'tk-3', title: 'Toma de tensión arterial vespertina y registro en curva médica', staffId: 'st-4', department: 'Salud', time: '03:00 PM', priority: 'URGENTE', done: false },
  { id: 'tk-4', title: 'Purga de filtros de sedimento y verificación de presión (65 PSI)', staffId: 'st-8', department: 'Mantenimiento', time: '02:00 PM', priority: 'NORMAL', done: false },
  { id: 'tk-5', title: 'Recepción en garita de encomienda de farmacia y aviso al ama de llaves', staffId: 'st-10', department: 'Seguridad Polar', time: '04:00 PM', priority: 'NORMAL', done: true },
  { id: 'tk-6', title: 'Reporte de kilometraje y presión de neumáticos en Toyota Land Cruiser', staffId: 'st-11', department: 'Seguridad Polar', time: '05:00 PM', priority: 'NORMAL', done: false },
  { id: 'tk-7', title: 'Inventario vespertino de productos hipoalergénicos en lavandería', staffId: 'st-7', department: 'Hospitalidad', time: '03:30 PM', priority: 'NORMAL', done: false }
];

const SHIFT_CYCLE = ['Diurno', 'Nocturno', '24h', 'Guardia', 'Libre'];

export default function StaffModal({ isOpen, onClose, initialTab = 'DIRECTORIO' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Estado de Progressive Disclosure (Nivel 1 -> Nivel 2 -> Nivel 3)
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [selectedSubFilter, setSelectedSubFilter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado de Flip Card 3D y Guardado
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [savedBannerId, setSavedBannerId] = useState(null);

  // Modal Flotante para Asignar Tarea Rápida desde la Tarjeta 3D
  const [quickTaskTarget, setQuickTaskTarget] = useState(null);
  const [quickTaskText, setQuickTaskText] = useState('');
  const [quickTaskTime, setQuickTaskTime] = useState('04:30 PM');
  const [quickTaskPriority, setQuickTaskPriority] = useState('ALTA');

  // Filtros de la pestaña Tareas
  const [filterStaffTasks, setFilterStaffTasks] = useState('ALL');

  // Formulario para Nuevo Empleado
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserDept, setNewUserDept] = useState('Hospitalidad');
  const [newUserShift, setNewUserShift] = useState('07:30 AM - 04:30 PM');
  const [newUserSalary, setNewUserSalary] = useState(500);
  const [newUserPin, setNewUserPin] = useState('4580');

  const activeCategoryObj = useMemo(
    () => STAFF_CATEGORIES.find((c) => c.id === selectedDept) || STAFF_CATEGORIES[0],
    [selectedDept]
  );

  const activeCount = useMemo(() => staffList.filter((s) => s.status === 'ACTIVO').length, [staffList]);
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);
  const totalPayroll = useMemo(() => staffList.reduce((acc, s) => acc + Number(s.salary || 0), 0), [staffList]);

  // Filtrado en Cascada para las Flip Cards (Nivel 3)
  const filteredStaff = useMemo(() => {
    return staffList.filter((person) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          person.name.toLowerCase().includes(q) ||
          person.role.toLowerCase().includes(q) ||
          person.department.toLowerCase().includes(q)
        );
      }
      const matchDept = selectedDept === 'Todos' || person.department === selectedDept;
      let matchSub = true;
      if (selectedSubFilter === 'ACTIVO') matchSub = person.status === 'ACTIVO';
      else if (selectedSubFilter === 'DESCANSO') matchSub = person.status !== 'ACTIVO';
      else if (selectedSubFilter === 'JEFES') matchSub = person.shiftType === 'JEFES';
      else if (selectedSubFilter === 'GUARDIA') matchSub = person.shiftType === 'GUARDIA';

      return matchDept && matchSub;
    });
  }, [staffList, selectedDept, selectedSubFilter, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (filterStaffTasks === 'ALL') return tasks;
    return tasks.filter((t) => t.staffId === filterStaffTasks);
  }, [tasks, filterStaffTasks]);

  // Actualizar cualquier campo del empleado en tiempo real desde el reverso 3D
  const updateStaffField = (staffId, field, value) => {
    setStaffList((prev) =>
      prev.map((person) => (person.id === staffId ? { ...person, [field]: value } : person))
    );
  };

  // Alternar día libre en el reverso de la tarjeta
  const toggleDayOff = (e, staffId, dayName) => {
    e.stopPropagation();
    setStaffList((prev) =>
      prev.map((person) => {
        if (person.id !== staffId) return person;
        const exists = person.daysOff.includes(dayName);
        const nextDaysOff = exists
          ? person.daysOff.filter((d) => d !== dayName)
          : [...person.daysOff, dayName];

        const dayIdx = DAYS_OF_WEEK.indexOf(dayName);
        const nextSchedule = [...person.schedule];
        if (dayIdx !== -1) {
          nextSchedule[dayIdx] = exists ? 'Diurno' : 'Libre';
        }
        return { ...person, daysOff: nextDaysOff, schedule: nextSchedule };
      })
    );
  };

  // Alternar permiso de aplicación en el reverso de la tarjeta
  const toggleStaffPermit = (e, staffId, permitName) => {
    e.stopPropagation();
    setStaffList((prev) =>
      prev.map((person) => {
        if (person.id !== staffId) return person;
        const hasPerm = person.permissions.includes(permitName);
        const nextPerms = hasPerm
          ? person.permissions.filter((p) => p !== permitName)
          : [...person.permissions, permitName];
        return { ...person, permissions: nextPerms };
      })
    );
  };

  // Ciclar estatus (En Turno -> Descanso -> Día Libre)
  const toggleStaffStatus = (e, id) => {
    e.stopPropagation();
    const order = ['ACTIVO', 'DESCANSO', 'LIBRE'];
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = order[(order.indexOf(s.status) + 1) % order.length];
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleSaveCardChanges = (e, staffId) => {
    e.stopPropagation();
    setSavedBannerId(staffId);
    setTimeout(() => {
      setSavedBannerId(null);
      setFlippedCardId(null);
    }, 900);
  };

  const handleConfirmQuickTask = (e) => {
    e.preventDefault();
    if (!quickTaskTarget || !quickTaskText.trim()) return;
    const created = {
      id: `tk-${Date.now()}`,
      title: quickTaskText.trim(),
      staffId: quickTaskTarget.id,
      department: quickTaskTarget.department,
      time: quickTaskTime,
      priority: quickTaskPriority,
      done: false
    };
    setTasks([created, ...tasks]);
    setQuickTaskText('');
    setQuickTaskTarget(null);
    setFlippedCardId(null);
  };

  const toggleTaskDone = (taskId) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)));
  };

  const cycleShiftCell = (staffId, dayIndex) => {
    setStaffList((prev) =>
      prev.map((person) => {
        if (person.id !== staffId) return person;
        const nextSchedule = [...person.schedule];
        const currentShift = nextSchedule[dayIndex];
        const nextIdx = (SHIFT_CYCLE.indexOf(currentShift) + 1) % SHIFT_CYCLE.length;
        nextSchedule[dayIndex] = SHIFT_CYCLE[nextIdx];
        return { ...person, schedule: nextSchedule };
      })
    );
  };

  const handleCreateNewEmployee = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserRole.trim()) return;
    const parts = newUserName.trim().split(' ');
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    const newEmp = {
      id: `st-${Date.now()}`,
      name: newUserName.trim(),
      role: newUserRole.trim(),
      department: newUserDept,
      shiftType: 'DIURNO',
      hours: newUserShift,
      daysOff: ['Sáb', 'Dom'],
      salary: Number(newUserSalary) || 500,
      status: 'ACTIVO',
      pin: newUserPin,
      accessLevel: 'OPERATIVO',
      permissions: ['Hospitalidad', 'Alacena'],
      phone: '+58 414-0000000',
      avatar: initials,
      color: '#5E7AC6',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Libre']
    };

    setStaffList([newEmp, ...staffList]);
    setNewUserName('');
    setNewUserRole('');
    setShowAddDrawer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-stf-overlay" onClick={onClose}>
      <div className="domus-stf-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-stf-watermark" />

        {/* ==========================================
            CABECERA EJECUTIVA DEL MODAL DE PERSONAL
            ========================================== */}
        <header className="domus-stf-header">
          <div className="domus-stf-title-wrap">
            <div className="domus-stf-eyebrow">
              <Sparkles size={13} color="#EE6B5F" />
              <span>CASA ROQUEDAL · EXPEDIENTES INTERACTIVOS 3D, HORARIOS Y PERMISOS</span>
            </div>
            <h2>Centro de Gestión de Personal y Turnos</h2>
          </div>

          <div className="domus-stf-kpis">
            <div className="domus-stf-kpi">
              <small>EN POSICIÓN HOY</small>
              <strong style={{ color: '#10B981' }}>{activeCount} / {staffList.length} Activos</strong>
            </div>
            <div className="domus-stf-kpi" onClick={() => setActiveTab('TAREAS')} style={{ cursor: 'pointer' }}>
              <small>TAREAS DEL DÍA</small>
              <strong style={{ color: '#5E7AC6' }}>{completedTasksCount} / {tasks.length} Listas</strong>
            </div>
            <div className="domus-stf-kpi">
              <small>NÓMINA MENSUAL</small>
              <strong style={{ color: '#202020' }}>${totalPayroll.toLocaleString('en-US')}</strong>
            </div>
            <button className="domus-stf-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
            BARRA DE PESTAÑAS Y BUSCADOR
            ========================================== */}
        <div className="domus-stf-tabs-bar">
          <div className="domus-stf-tabs">
            <button
              className={`domus-stf-tab ${activeTab === 'DIRECTORIO' ? 'active' : ''}`}
              onClick={() => setActiveTab('DIRECTORIO')}
            >
              <Users size={16} />
              <span>Explorador de Personal 3D ({staffList.length})</span>
            </button>
            <button
              className={`domus-stf-tab ${activeTab === 'TAREAS' ? 'active' : ''}`}
              onClick={() => setActiveTab('TAREAS')}
            >
              <ClipboardCheck size={16} />
              <span>Tablero de Tareas ({tasks.length})</span>
            </button>
            <button
              className={`domus-stf-tab ${activeTab === 'HORARIOS' ? 'active' : ''}`}
              onClick={() => setActiveTab('HORARIOS')}
            >
              <Calendar size={16} />
              <span>Cuadrante Semanal</span>
            </button>
          </div>

          {activeTab === 'DIRECTORIO' && (
            <div className="domus-stf-search-row">
              <div className="domus-stf-search">
                <Search size={15} color="#808080" />
                <input
                  type="text"
                  placeholder="Buscar nombre, cargo o área..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="domus-stf-new-btn"
                onClick={() => setShowAddDrawer(!showAddDrawer)}
              >
                <Plus size={15} />
                <span>Nuevo Empleado</span>
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO PRINCIPAL
            ========================================== */}
        <div className="domus-stf-body">

          {/* VISTA 1: EXPLORADOR EN CASCADA + FLIP CARDS 3D EDITABLES */}
          {activeTab === 'DIRECTORIO' && (
            <>
              {/* Gaveta rápida para registrar nuevo miembro del personal */}
              {showAddDrawer && (
                <form className="domus-stf-add-drawer" onSubmit={handleCreateNewEmployee}>
                  <div className="domus-stf-drawer-head">
                    <div>
                      <span>ALTA DE PERSONAL EN CASA ROQUEDAL</span>
                      <h4>Registrar Nuevo Integrante en la Plantilla</h4>
                    </div>
                    <button type="button" onClick={() => setShowAddDrawer(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="domus-stf-drawer-grid">
                    <div>
                      <label>Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Roberto Méndez"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Cargo / Función</label>
                      <input
                        type="text"
                        placeholder="Ej. Asistente de Mantenimiento"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Área / Departamento</label>
                      <select value={newUserDept} onChange={(e) => setNewUserDept(e.target.value)}>
                        <option value="Dirección y Cocina">Dirección & Cocina</option>
                        <option value="Salud">Salud & Enfermería</option>
                        <option value="Hospitalidad">Hospitalidad & Lencería</option>
                        <option value="Mantenimiento">Mantenimiento & Planta</option>
                        <option value="Seguridad Polar">Seguridad & Flota</option>
                      </select>
                    </div>
                    <div>
                      <label>Horario Asignado</label>
                      <input
                        type="text"
                        value={newUserShift}
                        onChange={(e) => setNewUserShift(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Salario Mensual ($)</label>
                      <input
                        type="number"
                        value={newUserSalary}
                        onChange={(e) => setNewUserSalary(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>PIN Tableta (4 dígitos)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={newUserPin}
                        onChange={(e) => setNewUserPin(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="domus-stf-drawer-foot">
                    <button type="submit" className="domus-stf-save-new">
                      <Check size={15} /> Crear Ficha 3D del Empleado
                    </button>
                  </div>
                </form>
              )}

              {/* ==========================================
                  NIVEL 1: CARRUSEL DE DEPARTAMENTOS
                  ========================================== */}
              <div className="domus-stf-level">
                <div className="domus-stf-lvl-head">
                  <span className="domus-stf-step-badge">NIVEL 1</span>
                  <h3>Departamentos Operativos de Casa Roquedal</h3>
                </div>

                <div className="domus-stf-lvl1-carousel">
                  {STAFF_CATEGORIES.map((cat) => {
                    const isSelected = selectedDept === cat.id && !searchQuery;
                    const deptMembers = cat.id === 'Todos'
                      ? staffList
                      : staffList.filter((s) => s.department === cat.id);
                    const deptActive = deptMembers.filter((s) => s.status === 'ACTIVO').length;

                    return (
                      <div
                        key={cat.id}
                        className={`domus-stf-lvl1-card ${isSelected ? 'active' : ''}`}
                        style={{ '--cat-accent': cat.accent }}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedDept(cat.id);
                          setSelectedSubFilter('TODOS');
                          setFlippedCardId(null);
                        }}
                      >
                        <div className="domus-stf-lvl1-backlight"></div>
                        <div className="domus-stf-lvl1-inner">
                          <div
                            className="domus-stf-lvl1-bg"
                            style={{ backgroundImage: `url('${cat.img}')` }}
                          ></div>
                          <div className="domus-stf-lvl1-overlay"></div>

                          <div className="domus-stf-lvl1-top">
                            <span className="domus-stf-lvl1-sub">{cat.subtitle}</span>
                            <span className="domus-stf-lvl1-ok">{deptActive}/{deptMembers.length} Activos</span>
                          </div>

                          <div className="domus-stf-lvl1-bottom">
                            <h4>{cat.title}</h4>
                            <span>{deptMembers.length} integrantes en nómina</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ==========================================
                  NIVEL 2: CARRUSEL DE SUB-FILTROS DE TURNO / ROL
                  ========================================== */}
              {!searchQuery && (
                <div className="domus-stf-level domus-stf-lvl2-anim" key={selectedDept}>
                  <div className="domus-stf-lvl-head">
                    <span className="domus-stf-step-badge" style={{ background: activeCategoryObj.accent }}>
                      NIVEL 2
                    </span>
                    <h3>Filtro Rápido de Guardia y Rol ({activeCategoryObj.title})</h3>
                  </div>

                  <div className="domus-stf-lvl2-carousel">
                    {SUB_FILTERS.map((sub) => {
                      const isSubActive = selectedSubFilter === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubFilter(sub.id);
                            setFlippedCardId(null);
                          }}
                          className={`domus-stf-lvl2-pill ${isSubActive ? 'active' : ''}`}
                          style={{ '--sub-accent': activeCategoryObj.accent }}
                        >
                          <div className="domus-stf-lvl2-icon">{sub.icon}</div>
                          <div className="domus-stf-lvl2-info">
                            <strong>{sub.name}</strong>
                            <span>Filtrar vista</span>
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
              <div className="domus-stf-level">
                <div className="domus-stf-lvl-head">
                  <span className="domus-stf-step-badge" style={{ background: '#10B981' }}>
                    NIVEL 3
                  </span>
                  <h3>
                    Perfiles del Personal ({filteredStaff.length}) · Toque cualquier tarjeta para girar y editar su expediente completo
                  </h3>
                </div>

                <div className="domus-stf-flip-grid">
                  {filteredStaff.map((person) => {
                    const isFlipped = flippedCardId === person.id;
                    const personTasks = tasks.filter((t) => t.staffId === person.id);
                    const doneCount = personTasks.filter((t) => t.done).length;
                    const taskPct = personTasks.length > 0
                      ? Math.round((doneCount / personTasks.length) * 100)
                      : 100;

                    const statusColor =
                      person.status === 'ACTIVO'
                        ? '#10B981'
                        : person.status === 'DESCANSO'
                        ? '#F59E0B'
                        : '#94A3B8';

                    return (
                      <div
                        key={person.id}
                        className={`domus-stf-flip-scene ${isFlipped ? 'is-flipped' : ''}`}
                        style={{ '--card-glow': person.color || '#5E7AC6' }}
                        onClick={() => setFlippedCardId(isFlipped ? null : person.id)}
                      >
                        <div className="domus-stf-flip-backlight"></div>

                        <div className="domus-stf-flip-inner">
                          {/* ==========================================
                              CARA FRONTAL: FOTO DE PERFIL + DATOS BÁSICOS
                              ========================================== */}
                          <div className="domus-stf-face domus-stf-front">
                            <div
                              className="domus-stf-front-bg"
                              style={{ backgroundImage: `url('${person.photo}')` }}
                            ></div>
                            <div className="domus-stf-front-shade"></div>

                            <div className="domus-stf-front-top">
                              <button
                                type="button"
                                className="domus-stf-status-pill"
                                style={{ background: statusColor }}
                                onClick={(e) => toggleStaffStatus(e, person.id)}
                                title="Toque para cambiar estatus en vivo"
                              >
                                {person.status === 'ACTIVO'
                                  ? '● EN TURNO ACTIVO'
                                  : person.status === 'DESCANSO'
                                  ? '◐ EN DESCANSO'
                                  : '○ DÍA LIBRE'}
                              </button>

                              <span className="domus-stf-flip-hint">
                                <RotateCw size={13} /> Editar Ficha 3D
                              </span>
                            </div>

                            <div className="domus-stf-front-glass">
                              <div className="domus-stf-front-title-row">
                                <div>
                                  <small>{person.department}</small>
                                  <h4>{person.name}</h4>
                                  <p>{person.role}</p>
                                </div>
                                <div className="domus-stf-pin-chip">
                                  <small>PIN</small>
                                  <strong>{person.pin}</strong>
                                </div>
                              </div>

                              <div className="domus-stf-front-meta">
                                <div>
                                  <Clock size={12} color="#5E7AC6" />
                                  <span>{person.hours}</span>
                                </div>
                                <strong>Libre: {person.daysOff.join(', ') || 'Ninguno'}</strong>
                              </div>

                              <div className="domus-stf-front-bar">
                                <div className="domus-stf-bar-labels">
                                  <span>Tareas hoy: {doneCount}/{personTasks.length}</span>
                                  <span>{person.permissions.length} permisos app</span>
                                </div>
                                <div className="domus-stf-bar-track">
                                  <div
                                    className="domus-stf-bar-fill"
                                    style={{ width: `${taskPct}%`, background: person.color }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ==========================================
                              CARA REVERSO: EXPEDIENTE 100% EDITABLE EN VIVO
                              ========================================== */}
                          <div
                            className="domus-stf-face domus-stf-back"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Cabecera del Reverso con botón para volver a girar */}
                            <div className="domus-stf-back-head">
                              <div className="domus-stf-back-person">
                                <img src={person.photo} alt={person.name} />
                                <div>
                                  <h4>{person.name}</h4>
                                  <span>Expediente Editable en Vivo</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="domus-stf-unflip-btn"
                                onClick={() => setFlippedCardId(null)}
                                title="Volver a la foto frontal"
                              >
                                <RotateCw size={14} /> Frente
                              </button>
                            </div>

                            {/* Campos Editables: Cargo, Área, Horario, Salario y PIN */}
                            <div className="domus-stf-edit-form">
                              <div className="domus-stf-edit-row-2">
                                <div>
                                  <label><Briefcase size={10} /> Área de Trabajo</label>
                                  <select
                                    value={person.department}
                                    onChange={(e) => updateStaffField(person.id, 'department', e.target.value)}
                                  >
                                    <option value="Dirección y Cocina">Dirección & Cocina</option>
                                    <option value="Salud">Salud & Enfermería</option>
                                    <option value="Hospitalidad">Hospitalidad & Suites</option>
                                    <option value="Mantenimiento">Mantenimiento & Planta</option>
                                    <option value="Seguridad Polar">Seguridad & Flota</option>
                                  </select>
                                </div>
                                <div>
                                  <label>Cargo Específico</label>
                                  <input
                                    type="text"
                                    value={person.role}
                                    onChange={(e) => updateStaffField(person.id, 'role', e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="domus-stf-edit-row-3">
                                <div className="span-horario">
                                  <label><Clock size={10} /> Horario de Turno</label>
                                  <input
                                    type="text"
                                    value={person.hours}
                                    onChange={(e) => updateStaffField(person.id, 'hours', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label><DollarSign size={10} /> Salario ($)</label>
                                  <input
                                    type="number"
                                    value={person.salary}
                                    onChange={(e) => updateStaffField(person.id, 'salary', Number(e.target.value))}
                                  />
                                </div>
                                <div>
                                  <label><Key size={10} /> PIN App</label>
                                  <input
                                    type="text"
                                    maxLength={4}
                                    value={person.pin}
                                    onChange={(e) => updateStaffField(person.id, 'pin', e.target.value)}
                                  />
                                </div>
                              </div>

                              {/* Selector Táctil de Días Libres */}
                              <div className="domus-stf-edit-block">
                                <label>Días Libres Asignados (Toque para activar/desactivar)</label>
                                <div className="domus-stf-days-row">
                                  {DAYS_OF_WEEK.map((day) => {
                                    const isOff = person.daysOff.includes(day);
                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        className={`domus-stf-day-btn ${isOff ? 'is-off' : ''}`}
                                        onClick={(e) => toggleDayOff(e, person.id, day)}
                                      >
                                        {day}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Selector Táctil de Permisos en la App */}
                              <div className="domus-stf-edit-block">
                                <label><ShieldCheck size={10} /> Permisos de App y Tabletas ({person.permissions.length})</label>
                                <div className="domus-stf-permits-grid">
                                  {ALL_PERMITS.map((perm) => {
                                    const hasPerm = person.permissions.includes(perm);
                                    return (
                                      <button
                                        key={perm}
                                        type="button"
                                        className={`domus-stf-perm-btn ${hasPerm ? 'active' : ''}`}
                                        onClick={(e) => toggleStaffPermit(e, person.id, perm)}
                                      >
                                        {hasPerm && <Check size={10} />}
                                        <span>{perm}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Botones de Acción del Reverso */}
                            {savedBannerId === person.id ? (
                              <div className="domus-stf-saved-pill">
                                <CheckCircle2 size={15} /> ¡Expediente actualizado!
                              </div>
                            ) : (
                              <div className="domus-stf-back-actions">
                                <button
                                  type="button"
                                  className="domus-stf-btn-save"
                                  onClick={(e) => handleSaveCardChanges(e, person.id)}
                                >
                                  <Check size={14} />
                                  <span>[ GUARDAR ]</span>
                                </button>
                                <button
                                  type="button"
                                  className="domus-stf-btn-task"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickTaskTarget(person);
                                  }}
                                >
                                  <Plus size={14} />
                                  <span>[ + ASIGNAR TAREA ]</span>
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

          {/* VISTA 2: TABLERO DE TAREAS DEL DÍA */}
          {activeTab === 'TAREAS' && (
            <div className="domus-stf-list-card">
              <div className="domus-stf-list-head">
                <div>
                  <h3>Supervisión de Tareas Operativas ({tasks.length})</h3>
                  <p>Toque cualquier tarea para verificar o marcar su cumplimiento en tiempo real</p>
                </div>
                <select
                  value={filterStaffTasks}
                  onChange={(e) => setFilterStaffTasks(e.target.value)}
                  className="domus-stf-filter-select"
                >
                  <option value="ALL">Todo el Personal ({tasks.length})</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                  ))}
                </select>
              </div>

              <div className="domus-stf-tasks-stack">
                {filteredTasks.map((task) => {
                  const person = staffList.find((s) => s.id === task.staffId);
                  return (
                    <div
                      key={task.id}
                      className={`domus-task-row ${task.done ? 'done' : ''}`}
                      onClick={() => toggleTaskDone(task.id)}
                    >
                      <div className="domus-task-check">
                        {task.done && <Check size={14} />}
                      </div>
                      {person && (
                        <img
                          src={person.photo}
                          alt={person.name}
                          style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover' }}
                        />
                      )}
                      <div className="domus-task-body">
                        <div className="domus-task-top">
                          <span className={`domus-task-prio ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          <span className="domus-task-time">{task.time}</span>
                        </div>
                        <strong>{task.title}</strong>
                        <small>
                          Responsable: {person ? person.name : 'Staff'} · {task.department}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 3: CUADRANTE SEMANAL INTERACTIVO */}
          {activeTab === 'HORARIOS' && (
            <div className="domus-schedule-panel">
              <div className="domus-schedule-head">
                <div>
                  <h3>Cuadrante Semanal Sincronizado con las Fichas 3D</h3>
                  <p>Toque cualquier celda para rotar el turno (Diurno · Nocturno · Guardia 24h · Libre)</p>
                </div>
              </div>

              <div className="domus-schedule-table-wrap">
                <table className="domus-schedule-table">
                  <thead>
                    <tr>
                      <th>Integrante / Cargo</th>
                      {DAYS_OF_WEEK.map((d) => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((person) => (
                      <tr key={person.id}>
                        <td>
                          <div className="domus-sched-person">
                            <img
                              src={person.photo}
                              alt={person.name}
                              style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }}
                            />
                            <div>
                              <strong>{person.name}</strong>
                              <small>{person.role} · ${person.salary}/mes</small>
                            </div>
                          </div>
                        </td>
                        {person.schedule.map((shift, dayIdx) => (
                          <td key={dayIdx}>
                            <button
                              type="button"
                              onClick={() => cycleShiftCell(person.id, dayIdx)}
                              className={`domus-shift-Chip shift-${shift.toLowerCase()}`}
                            >
                              {shift}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* ==========================================
            MODAL FLOTANTE PARA ASIGNAR TAREA RÁPIDA DESDE LA FLIP CARD
            ========================================== */}
        {quickTaskTarget && (
          <div className="domus-stf-quick-backdrop" onClick={() => setQuickTaskTarget(null)}>
            <form
              className="domus-stf-quick-modal"
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleConfirmQuickTask}
            >
              <div className="domus-stf-quick-head">
                <div className="domus-stf-back-person">
                  <img src={quickTaskTarget.photo} alt={quickTaskTarget.name} />
                  <div>
                    <span>ASIGNACIÓN DIRECTA A TABLETA</span>
                    <h4>{quickTaskTarget.name}</h4>
                  </div>
                </div>
                <button type="button" onClick={() => setQuickTaskTarget(null)} className="domus-stf-close-sm">
                  <X size={16} />
                </button>
              </div>

              <label className="domus-stf-q-label">Instrucción / Tarea Operativa</label>
              <textarea
                rows={3}
                placeholder={`Ej. ${quickTaskTarget.name.split(' ')[0]}, favor preparar servicio especial en terraza principal...`}
                value={quickTaskText}
                onChange={(e) => setQuickTaskText(e.target.value)}
                required
                autoFocus
              />

              <div className="domus-stf-q-row">
                <div>
                  <label className="domus-stf-q-label">Hora Límite</label>
                  <input
                    type="text"
                    value={quickTaskTime}
                    onChange={(e) => setQuickTaskTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="domus-stf-q-label">Prioridad</label>
                  <select
                    value={quickTaskPriority}
                    onChange={(e) => setQuickTaskPriority(e.target.value)}
                  >
                    <option value="NORMAL">Normal / Rutina</option>
                    <option value="ALTA">Alta Prioridad</option>
                    <option value="URGENTE">Urgente / Inmediata</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="domus-stf-q-submit">
                <Send size={16} />
                <span>[ ENVIAR ORDEN A {quickTaskTarget.name.toUpperCase()} ]</span>
              </button>
            </form>
          </div>
        )}

        {/* ==========================================
            PIE DEL MODAL
            ========================================== */}
        <footer className="domus-stf-footer">
          <span>Progressive Disclosure & 3D Flip Cards · Todo cambio en horarios, salarios o permisos se sincroniza al instante</span>
          <button className="domus-stf-close-btn" onClick={onClose}>
            VOLVER AL PANEL PRINCIPAL
          </button>
        </footer>

        {/* ==========================================
            ESTILOS AISLADOS (3D FLIP STAFF + PROGRESSIVE DISCLOSURE)
            ========================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          .domus-stf-overlay {
            position: fixed; inset: 0; z-index: 185;
            background: rgba(18, 22, 36, 0.58);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            animation: domusStfFade 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 768px) {
            .domus-stf-overlay { padding: 20px; }
          }
          @keyframes domusStfFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-stf-modal {
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
            .domus-stf-modal {
              height: 92vh;
              border-radius: 36px;
            }
          }

          .domus-stf-watermark {
            position: absolute; right: -40px; bottom: 40px;
            width: 280px; height: 280px; object-fit: contain;
            opacity: 0.04; pointer-events: none; z-index: 0;
          }

          /* HEADER */
          .domus-stf-header {
            position: relative; z-index: 2;
            padding: 16px 18px 14px;
            background: rgba(255, 255, 255, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.92);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-stf-header { padding: 20px 32px 16px; }
          }
          .domus-stf-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 10px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
            margin-bottom: 3px;
          }
          .domus-stf-title-wrap h2 {
            font-size: clamp(20px, 2.5vw, 27px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-stf-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-stf-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 7px 14px; border-radius: 15px;
          }
          @media (min-width: 680px) { .domus-stf-kpi { display: flex; } }
          .domus-stf-kpi small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080; }
          .domus-stf-kpi strong { font-size: 13px; font-weight: 900; }

          .domus-stf-close {
            width: 40px; height: 40px; border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.08);
            background: #fff; color: #202020;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-stf-close:hover {
            background: #EE6B5F; color: #fff; border-color: #EE6B5F; transform: rotate(90deg);
          }

          /* TABS & SEARCH */
          .domus-stf-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.48);
            border-bottom: 1px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-stf-tabs-bar { padding: 12px 32px; } }
          .domus-stf-tabs { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; }
          .domus-stf-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 16px; border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.7);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer; transition: all 0.22s ease;
          }
          .domus-stf-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-stf-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }

          .domus-stf-search-row { display: flex; align-items: center; gap: 8px; }
          .domus-stf-search {
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 14px; min-width: 220px;
          }
          .domus-stf-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }
          .domus-stf-new-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 14px; border: none;
            background: #202020; color: #fff;
            font-size: 11px; font-weight: 900; cursor: pointer; white-space: nowrap;
          }
          .domus-stf-new-btn:hover { background: #5E7AC6; }

          /* BODY */
          .domus-stf-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
            display: flex; flex-direction: column; gap: 22px;
          }
          @media (min-width: 768px) { .domus-stf-body { padding: 22px 32px; } }

          /* LEVELS */
          .domus-stf-level { display: flex; flex-direction: column; gap: 12px; }
          .domus-stf-lvl-head { display: flex; align-items: center; gap: 10px; }
          .domus-stf-step-badge {
            background: #5E7AC6; color: #fff;
            font-size: 9px; font-weight: 900; letter-spacing: 0.12em;
            padding: 4px 9px; border-radius: 99px;
          }
          .domus-stf-lvl-head h3 {
            margin: 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }

          /* NIVEL 1: CARRUSEL DEPARTAMENTOS */
          .domus-stf-lvl1-carousel {
            display: flex; gap: 14px; overflow-x: auto;
            padding: 6px 4px 12px; scroll-snap-type: x mandatory;
          }
          .domus-stf-lvl1-card {
            position: relative;
            min-width: 210px; height: 118px; flex: 1;
            scroll-snap-align: start; cursor: pointer;
            transition: transform 0.25s ease;
          }
          .domus-stf-lvl1-card:hover { transform: translateY(-4px); }
          .domus-stf-lvl1-backlight {
            position: absolute; inset: -5px; border-radius: 24px;
            background: var(--cat-accent); filter: blur(14px);
            opacity: 0; transition: opacity 0.28s ease; z-index: 0;
          }
          .domus-stf-lvl1-card.active .domus-stf-lvl1-backlight,
          .domus-stf-lvl1-card:hover .domus-stf-lvl1-backlight {
            opacity: 0.55;
          }
          .domus-stf-lvl1-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%; border-radius: 20px; overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.85);
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 12px 14px; box-sizing: border-box;
          }
          .domus-stf-lvl1-bg {
            position: absolute; inset: 0; background-size: cover; background-position: center;
            transition: transform 0.5s ease;
          }
          .domus-stf-lvl1-card:hover .domus-stf-lvl1-bg { transform: scale(1.08); }
          .domus-stf-lvl1-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.82) 100%);
          }
          .domus-stf-lvl1-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between; gap: 6px;
          }
          .domus-stf-lvl1-sub {
            font-size: 8.5px; font-weight: 900; text-transform: uppercase;
            color: #fff; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-stf-lvl1-ok {
            font-size: 9px; font-weight: 900; background: #10B981; color: #fff;
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-stf-lvl1-bottom { position: relative; z-index: 2; color: #fff; }
          .domus-stf-lvl1-bottom h4 { margin: 0; font-size: 16.5px; font-weight: 900; }
          .domus-stf-lvl1-bottom span { font-size: 10px; font-weight: 700; opacity: 0.85; }

          /* NIVEL 2: SUB-FILTROS */
          .domus-stf-lvl2-carousel {
            display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 8px;
          }
          .domus-stf-lvl2-pill {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px; border-radius: 18px;
            background: rgba(255, 255, 255, 0.78);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
          }
          .domus-stf-lvl2-pill.active {
            background: var(--sub-accent); color: #fff;
            box-shadow: 0 10px 22px -6px var(--sub-accent);
          }
          .domus-stf-lvl2-icon {
            width: 32px; height: 32px; border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            display: flex; align-items: center; justify-content: center; font-size: 15px;
          }
          .domus-stf-lvl2-info { text-align: left; display: flex; flex-direction: column; }
          .domus-stf-lvl2-info strong { font-size: 12.5px; font-weight: 900; color: #202020; }
          .domus-stf-lvl2-info span { font-size: 10px; font-weight: 700; color: #666; }
          .domus-stf-lvl2-pill.active .domus-stf-lvl2-info strong,
          .domus-stf-lvl2-pill.active .domus-stf-lvl2-info span {
            color: #fff;
          }

          /* NIVEL 3: GRILLA DE FLIP CARDS 3D DEL PERSONAL */
          .domus-stf-flip-grid {
            display: grid; grid-template-columns: 1fr; gap: 22px;
          }
          @media (min-width: 680px) {
            .domus-stf-flip-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1120px) {
            .domus-stf-flip-grid { grid-template-columns: repeat(3, 1fr); }
          }

          .domus-stf-flip-scene {
            position: relative;
            height: 430px;
            perspective: 1400px;
            cursor: pointer;
          }
          .domus-stf-flip-backlight {
            position: absolute; inset: -6px; border-radius: 32px;
            background: var(--card-glow);
            filter: blur(18px); opacity: 0.2;
            transition: opacity 0.3s ease; z-index: 0;
          }
          .domus-stf-flip-scene:hover .domus-stf-flip-backlight,
          .domus-stf-flip-scene.is-flipped .domus-stf-flip-backlight {
            opacity: 0.55;
          }

          .domus-stf-flip-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%;
            transition: transform 0.68s cubic-bezier(0.22, 1, 0.36, 1);
            transform-style: preserve-3d;
          }
          .domus-stf-flip-scene.is-flipped .domus-stf-flip-inner {
            transform: rotateY(180deg);
          }

          .domus-stf-face {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            border-radius: 28px; overflow: hidden;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            box-sizing: border-box;
            border: 1.5px solid rgba(255, 255, 255, 0.92);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
          }

          /* FRENTE DE LA TARJETA */
          .domus-stf-front {
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 16px;
          }
          .domus-stf-front-bg {
            position: absolute; inset: 0;
            background-size: cover; background-position: center top;
            transition: transform 0.6s ease;
          }
          .domus-stf-flip-scene:hover .domus-stf-front-bg { transform: scale(1.06); }
          .domus-stf-front-shade {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.25) 45%, rgba(15, 23, 42, 0.85) 100%);
          }
          .domus-stf-front-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-stf-status-pill {
            border: none; cursor: pointer;
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.08em;
            color: #fff; padding: 6px 12px; border-radius: 99px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          }
          .domus-stf-flip-hint {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
            color: #202020; font-size: 10px; font-weight: 900;
            padding: 6px 11px; border-radius: 99px;
          }

          .domus-stf-front-glass {
            position: relative; z-index: 2;
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.96);
            border-radius: 22px; padding: 15px;
            display: flex; flex-direction: column; gap: 10px;
          }
          .domus-stf-front-title-row {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          }
          .domus-stf-front-title-row small {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.07em; color: #5E7AC6;
          }
          .domus-stf-front-title-row h4 {
            margin: 2px 0; font-size: 18px; font-weight: 900; color: #202020; line-height: 1.1;
          }
          .domus-stf-front-title-row p {
            margin: 0; font-size: 11.5px; font-weight: 700; color: #666;
          }
          .domus-stf-pin-chip {
            background: #181C26; color: #fff;
            padding: 5px 10px; border-radius: 12px; text-align: center; flex-shrink: 0;
          }
          .domus-stf-pin-chip small {
            display: block; font-size: 8px; font-weight: 800; color: rgba(255,255,255,0.65);
          }
          .domus-stf-pin-chip strong {
            font-size: 13px; font-weight: 900; color: #6EE7B7; letter-spacing: 0.08em;
          }

          .domus-stf-front-meta {
            display: flex; align-items: center; justify-content: space-between;
            background: rgba(94, 122, 198, 0.08);
            padding: 7px 10px; border-radius: 11px;
            font-size: 11px; font-weight: 700; color: #444;
          }
          .domus-stf-front-meta div { display: flex; align-items: center; gap: 5px; }
          .domus-stf-front-meta strong { font-size: 10.5px; color: #EE6B5F; font-weight: 900; }

          .domus-stf-front-bar { display: flex; flex-direction: column; gap: 4px; }
          .domus-stf-bar-labels {
            display: flex; justify-content: space-between;
            font-size: 10px; font-weight: 800; color: #555;
          }
          .domus-stf-bar-track {
            width: 100%; height: 6px; border-radius: 99px;
            background: rgba(0, 0, 0, 0.08); overflow: hidden;
          }
          .domus-stf-bar-fill { height: 100%; border-radius: 99px; }

          /* REVERSO DE LA TARJETA (EXPEDIENTE EDITABLE) */
          .domus-stf-back {
            transform: rotateY(180deg);
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(28px);
            padding: 15px 16px;
            display: flex; flex-direction: column; justify-content: space-between;
            cursor: default;
          }
          .domus-stf-back-head {
            display: flex; align-items: center; justify-content: space-between;
            padding-bottom: 8px; border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          }
          .domus-stf-back-person {
            display: flex; align-items: center; gap: 10px;
          }
          .domus-stf-back-person img {
            width: 38px; height: 38px; border-radius: 12px; object-fit: cover;
          }
          .domus-stf-back-person h4 {
            margin: 0; font-size: 14.5px; font-weight: 900; color: #202020;
          }
          .domus-stf-back-person span {
            font-size: 9.5px; font-weight: 800; color: #5E7AC6; text-transform: uppercase;
          }
          .domus-stf-unflip-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 11px; border-radius: 99px;
            border: 1px solid rgba(0,0,0,0.1); background: #F4F6FA;
            font-size: 10px; font-weight: 900; color: #202020; cursor: pointer;
          }
          .domus-stf-unflip-btn:hover { background: #5E7AC6; color: #fff; }

          .domus-stf-edit-form {
            display: flex; flex-direction: column; gap: 8px;
          }
          .domus-stf-edit-form label {
            display: flex; align-items: center; gap: 4px;
            font-size: 8.5px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.06em; color: #666; margin-bottom: 3px;
          }
          .domus-stf-edit-form input, .domus-stf-edit-form select {
            width: 100%; box-sizing: border-box;
            padding: 6px 9px; border-radius: 9px;
            border: 1px solid rgba(0, 0, 0, 0.12); background: #F7F9FC;
            font-size: 11px; font-weight: 800; color: #202020; outline: none;
          }
          .domus-stf-edit-form input:focus, .domus-stf-edit-form select:focus {
            border-color: #5E7AC6; background: #fff;
          }
          .domus-stf-edit-row-2 {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          }
          .domus-stf-edit-row-3 {
            display: grid; grid-template-columns: 1.4fr 0.85fr 0.75fr; gap: 6px;
          }

          .domus-stf-days-row {
            display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
          }
          .domus-stf-day-btn {
            padding: 5px 0; border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #F4F6FA; color: #555;
            font-size: 9.5px; font-weight: 900; cursor: pointer;
            transition: all 0.15s ease;
          }
          .domus-stf-day-btn.is-off {
            background: #EE6B5F; color: #fff; border-color: #EE6B5F;
            box-shadow: 0 3px 8px rgba(238, 107, 95, 0.3);
          }

          .domus-stf-permits-grid {
            display: flex; flex-wrap: wrap; gap: 4px;
          }
          .domus-stf-perm-btn {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 4px 8px; border-radius: 7px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #F4F6FA; color: #666;
            font-size: 9.5px; font-weight: 800; cursor: pointer;
          }
          .domus-stf-perm-btn.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
          }

          .domus-stf-back-actions {
            display: grid; grid-template-columns: 1fr 1.15fr; gap: 8px;
            padding-top: 4px;
          }
          .domus-stf-btn-save {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #10B981; color: #fff;
            font-size: 10px; font-weight: 900; cursor: pointer;
            box-shadow: 0 6px 14px rgba(16, 185, 129, 0.3);
          }
          .domus-stf-btn-task {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 9px 8px; border-radius: 12px; border: none;
            background: #5E7AC6; color: #fff;
            font-size: 10px; font-weight: 900; cursor: pointer;
            box-shadow: 0 6px 14px rgba(94, 122, 198, 0.3);
          }
          .domus-stf-saved-pill {
            padding: 9px; border-radius: 12px;
            background: rgba(16, 185, 129, 0.16); color: #065F46;
            font-size: 11px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 6px;
          }

          /* QUICK TASK MODAL */
          .domus-stf-quick-backdrop {
            position: fixed; inset: 0; z-index: 230;
            background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center; padding: 16px;
          }
          .domus-stf-quick-modal {
            width: 100%; max-width: 440px;
            background: #fff; border-radius: 28px; padding: 22px;
            box-shadow: 0 28px 65px rgba(15, 23, 42, 0.35);
            display: flex; flex-direction: column; gap: 12px;
          }
          .domus-stf-quick-head {
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-stf-close-sm {
            width: 32px; height: 32px; border-radius: 50%; border: none;
            background: #F4F6FA; cursor: pointer; display: flex; align-items: center; justify-content: center;
          }
          .domus-stf-q-label {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; color: #5E7AC6; margin-bottom: 4px;
          }
          .domus-stf-quick-modal textarea,
          .domus-stf-quick-modal input,
          .domus-stf-quick-modal select {
            width: 100%; box-sizing: border-box;
            padding: 10px 12px; border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC;
            font-size: 12px; font-weight: 700; color: #202020; font-family: inherit;
          }
          .domus-stf-q-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .domus-stf-q-submit {
            padding: 14px; border-radius: 15px; border: none;
            background: #5E7AC6; color: #fff; font-size: 11.5px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer; margin-top: 4px;
          }

          /* ADD DRAWER, TASKS & SCHEDULE */
          .domus-stf-add-drawer {
            background: #fff; border: 1.5px solid rgba(94, 122, 198, 0.35);
            border-radius: 24px; padding: 18px;
          }
          .domus-stf-drawer-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
          }
          .domus-stf-drawer-head span { font-size: 9.5px; font-weight: 900; color: #5E7AC6; }
          .domus-stf-drawer-head h4 { margin: 2px 0 0; font-size: 16px; font-weight: 900; }
          .domus-stf-drawer-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;
          }
          .domus-stf-drawer-grid label {
            display: block; font-size: 9.5px; font-weight: 900; color: #666; margin-bottom: 4px;
          }
          .domus-stf-drawer-grid input, .domus-stf-drawer-grid select {
            width: 100%; box-sizing: border-box; padding: 9px 11px; border-radius: 11px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC; font-size: 12px; font-weight: 700;
          }
          .domus-stf-drawer-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
          .domus-stf-save-new {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 10px 18px; border-radius: 12px; border: none;
            background: #10B981; color: #fff; font-size: 11.5px; font-weight: 900; cursor: pointer;
          }

          .domus-stf-list-card, .domus-schedule-panel {
            background: rgba(255, 255, 255, 0.85); border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
          }
          .domus-stf-list-head {
            display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
            gap: 10px; margin-bottom: 14px;
          }
          .domus-stf-list-head h3, .domus-schedule-head h3 { margin: 0 0 4px; font-size: 18px; font-weight: 900; }
          .domus-stf-list-head p, .domus-schedule-head p { margin: 0; font-size: 12px; color: #666; }
          .domus-stf-filter-select {
            padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
            background: #F7F9FC; font-size: 11.5px; font-weight: 800;
          }
          .domus-stf-tasks-stack { display: flex; flex-direction: column; gap: 10px; }
          .domus-task-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 15px; border-radius: 16px; background: #F7F9FC;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-task-row.done { opacity: 0.65; }
          .domus-task-check {
            width: 22px; height: 22px; border-radius: 7px;
            border: 2px solid #5E7AC6; background: #fff; color: #fff;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .domus-task-row.done .domus-task-check { background: #5E7AC6; }
          .domus-task-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
          .domus-task-top { display: flex; align-items: center; gap: 8px; }
          .domus-task-prio { font-size: 8.5px; font-weight: 900; padding: 2px 7px; border-radius: 99px; }
          .domus-task-prio.urgente { background: rgba(238,107,95,0.18); color: #EE6B5F; }
          .domus-task-prio.alta { background: rgba(94,122,198,0.16); color: #5E7AC6; }
          .domus-task-prio.normal { background: rgba(0,0,0,0.06); color: #555; }
          .domus-task-time { font-size: 10px; font-weight: 800; color: #888; }
          .domus-task-body strong { font-size: 13px; font-weight: 800; color: #202020; }
          .domus-task-body small { font-size: 11px; color: #666; font-weight: 600; }

          .domus-schedule-table-wrap { width: 100%; overflow-x: auto; margin-top: 14px; }
          .domus-schedule-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 780px; }
          .domus-schedule-table th {
            text-align: left; font-size: 10px; font-weight: 900;
            text-transform: uppercase; color: #808080; padding: 6px 10px;
          }
          .domus-schedule-table td { background: #F7F9FC; padding: 10px; }
          .domus-sched-person { display: flex; align-items: center; gap: 10px; }
          .domus-sched-person strong { display: block; font-size: 12.5px; font-weight: 900; }
          .domus-sched-person small { font-size: 10px; color: #666; font-weight: 600; }
          .domus-shift-Chip {
            width: 100%; padding: 7px 8px; border-radius: 10px; border: none;
            font-size: 10px; font-weight: 900; cursor: pointer;
          }
          .shift-diurno { background: rgba(94, 122, 198, 0.15); color: #5E7AC6; }
          .shift-nocturno { background: rgba(190, 122, 198, 0.18); color: #9333EA; }
          .shift-24h, .shift-guardia, .shift-especial { background: rgba(238, 107, 95, 0.18); color: #EE6B5F; }
          .shift-libre { background: rgba(148, 163, 184, 0.18); color: #64748B; }

          /* FOOTER */
          .domus-stf-footer {
            position: relative; z-index: 2;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.78);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px; font-size: 11px; font-weight: 700; color: #666;
          }
          .domus-stf-close-btn {
            padding: 11px 18px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.12); background: #fff;
            font-size: 11px; font-weight: 900; color: #202020; cursor: pointer;
          }
        `}} />
      </div>
    </div>
  );
}