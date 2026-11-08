import React, { useState, useMemo } from 'react';
import {
  X, Users, ClipboardCheck, Calendar, ShieldCheck, Clock,
  CheckCircle2, AlertCircle, Search, Plus, Check, Sparkles,
  Lock, Settings, ArrowUpRight, Coffee
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

const INITIAL_STAFF = [
  {
    id: 'st-1',
    name: 'Sra. Belkys',
    role: 'Ama de Llaves Ejecutiva',
    department: 'Dirección',
    shift: 'Residente · Supervisión',
    hours: '06:30 AM - 06:00 PM',
    status: 'ACTIVO',
    pin: '1042',
    accessLevel: 'ADMIN_CASA',
    permissions: ['Alacena', 'Personal', 'Salud', 'Hospitalidad', 'Mantenimiento', 'Garita'],
    phone: '+58 414-2891042',
    avatar: 'SB',
    color: '#5E7AC6',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre']
  },
  {
    id: 'st-2',
    name: 'Chef Jesús Sequea',
    role: 'Chef Ejecutivo',
    department: 'Cocina',
    shift: 'Diurno · Producción',
    hours: '07:00 AM - 04:00 PM',
    status: 'ACTIVO',
    pin: '8821',
    accessLevel: 'JEFE_AREA',
    permissions: ['Alacena', 'Menú', 'Balanza'],
    phone: '+58 412-9014421',
    avatar: 'JS',
    color: '#EE6B5F',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Especial', 'Libre']
  },
  {
    id: 'st-3',
    name: 'María Fernanda Rojas',
    role: 'Auxiliar de Cocina y Comedor',
    department: 'Cocina',
    shift: 'Diurno · Apoyo',
    hours: '06:30 AM - 03:30 PM',
    status: 'ACTIVO',
    pin: '3319',
    accessLevel: 'OPERATIVO',
    permissions: ['Alacena', 'Balanza'],
    phone: '+58 414-3118765',
    avatar: 'MR',
    color: '#EE6B5F',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Diurno']
  },
  {
    id: 'st-4',
    name: 'Lic. Carmen Valero',
    role: 'Enfermera Jefe Diurna',
    department: 'Salud',
    shift: 'Guardia Diurna 12h',
    hours: '07:00 AM - 07:00 PM',
    status: 'ACTIVO',
    pin: '7740',
    accessLevel: 'SALUD',
    permissions: ['Salud', 'Farmacia', 'Alacena'],
    phone: '+58 424-1983320',
    avatar: 'CV',
    color: '#5E7AC6',
    schedule: ['Diurno', 'Diurno', 'Libre', 'Diurno', 'Diurno', 'Libre', 'Diurno']
  },
  {
    id: 'st-5',
    name: 'Lic. Gabriela Méndez',
    role: 'Enfermera Especialista Nocturna',
    department: 'Salud',
    shift: 'Guardia Nocturna 12h',
    hours: '07:00 PM - 07:00 AM',
    status: 'DESCANSO',
    pin: '7741',
    accessLevel: 'SALUD',
    permissions: ['Salud', 'Farmacia'],
    phone: '+58 412-5549081',
    avatar: 'GM',
    color: '#5E7AC6',
    schedule: ['Nocturno', 'Nocturno', 'Libre', 'Nocturno', 'Nocturno', 'Libre', 'Nocturno']
  },
  {
    id: 'st-6',
    name: 'Elena Castillo',
    role: 'Camarera de Suites y Lencería',
    department: 'Hospitalidad',
    shift: 'Diurno · Interior',
    hours: '07:30 AM - 04:30 PM',
    status: 'ACTIVO',
    pin: '4102',
    accessLevel: 'OPERATIVO',
    permissions: ['Hospitalidad', 'Alacena'],
    phone: '+58 416-8221904',
    avatar: 'EC',
    color: '#BE7AC6',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Libre']
  },
  {
    id: 'st-7',
    name: 'Rosaura Díaz',
    role: 'Lavandería, Planchado y Áreas',
    department: 'Hospitalidad',
    shift: 'Diurno · Interior',
    hours: '07:30 AM - 04:30 PM',
    status: 'ACTIVO',
    pin: '4105',
    accessLevel: 'OPERATIVO',
    permissions: ['Hospitalidad'],
    phone: '+58 414-7723109',
    avatar: 'RD',
    color: '#BE7AC6',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Libre', 'Diurno', 'Diurno', 'Libre']
  },
  {
    id: 'st-8',
    name: 'Carlos Padrón',
    role: 'Jefe de Mantenimiento y Planta',
    department: 'Mantenimiento',
    shift: 'Diurno · Técnico',
    hours: '07:30 AM - 04:30 PM',
    status: 'ACTIVO',
    pin: '5091',
    accessLevel: 'JEFE_AREA',
    permissions: ['Mantenimiento', 'Garita'],
    phone: '+58 424-2094412',
    avatar: 'CP',
    color: '#10B981',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Guardia', 'Libre']
  },
  {
    id: 'st-9',
    name: 'José Gregorio Tovar',
    role: 'Jardinería, Paisajismo y Piscina',
    department: 'Mantenimiento',
    shift: 'Diurno · Exterior',
    hours: '07:00 AM - 03:30 PM',
    status: 'ACTIVO',
    pin: '5098',
    accessLevel: 'OPERATIVO',
    permissions: ['Mantenimiento'],
    phone: '+58 412-3391028',
    avatar: 'JT',
    color: '#10B981',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Libre']
  },
  {
    id: 'st-10',
    name: 'Sup. Marcos Rivas',
    role: 'Jefe de Garita · Seguridad Polar',
    department: 'Seguridad Polar',
    shift: 'Guardia Patrimonial 24x24',
    hours: '07:00 AM - 07:00 AM',
    status: 'ACTIVO',
    pin: '9001',
    accessLevel: 'ENLACE_GARITA',
    permissions: ['Garita', 'Proveedores'],
    phone: 'Enlace Corporativo Polar',
    avatar: 'MR',
    color: '#5E7AC6',
    schedule: ['24h', 'Libre', '24h', 'Libre', '24h', 'Libre', '24h']
  },
  {
    id: 'st-11',
    name: 'Andrés Mendoza',
    role: 'Escolta y Chófer Principal · Polar',
    department: 'Seguridad Polar',
    shift: 'Esquema Dr. Jiménez',
    hours: 'Disponibilidad Operativa',
    status: 'ACTIVO',
    pin: '9004',
    accessLevel: 'FLOTA',
    permissions: ['Flota Vehicular', 'Garita'],
    phone: 'Enlace Corporativo Polar',
    avatar: 'AM',
    color: '#5E7AC6',
    schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Guardia', 'Libre']
  }
];

const INITIAL_TASKS = [
  {
    id: 'tk-1',
    title: 'Preparación y emplatado de almuerzo bajo en sodio (Dr. Jiménez)',
    staffId: 'st-2',
    department: 'Cocina',
    time: '12:30 PM',
    priority: 'ALTA',
    done: true
  },
  {
    id: 'tk-2',
    title: 'Cambio de lencería egipcia y climatización a 22°C en Suite Principal',
    staffId: 'st-6',
    department: 'Hospitalidad',
    time: '10:00 AM',
    priority: 'ALTA',
    done: true
  },
  {
    id: 'tk-3',
    title: 'Toma de tensión arterial vespertina y registro en curva médica',
    staffId: 'st-4',
    department: 'Salud',
    time: '03:00 PM',
    priority: 'URGENTE',
    done: false
  },
  {
    id: 'tk-4',
    title: 'Purga de filtros de sedimento y verificación de presión (65 PSI)',
    staffId: 'st-8',
    department: 'Mantenimiento',
    time: '02:00 PM',
    priority: 'NORMAL',
    done: false
  },
  {
    id: 'tk-5',
    title: 'Recepción en garita de encomienda de farmacia y aviso al ama de llaves',
    staffId: 'st-10',
    department: 'Seguridad Polar',
    time: '04:00 PM',
    priority: 'NORMAL',
    done: true
  },
  {
    id: 'tk-6',
    title: 'Reporte de kilometraje y presión de blindaje en Toyota Land Cruiser',
    staffId: 'st-11',
    department: 'Seguridad Polar',
    time: '05:00 PM',
    priority: 'NORMAL',
    done: false
  },
  {
    id: 'tk-7',
    title: 'Inventario vespertino de productos hipoalergénicos en lavandería',
    staffId: 'st-7',
    department: 'Hospitalidad',
    time: '03:30 PM',
    priority: 'NORMAL',
    done: false
  }
];

const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const SHIFT_CYCLE = ['Diurno', 'Nocturno', '24h', 'Guardia', 'Libre'];

export default function StaffModal({ isOpen, onClose, initialTab = 'DIRECTORIO' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStaffTasks, setFilterStaffTasks] = useState('ALL');

  // Estado para formulario de Nueva Tarea
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStaff, setNewTaskStaff] = useState('st-6');
  const [newTaskTime, setNewTaskTime] = useState('04:00 PM');
  const [newTaskPriority, setNewTaskPriority] = useState('NORMAL');
  const [taskCreatedToast, setTaskCreatedToast] = useState(false);

  // Estado para Creación / Edición de Usuario y Accesos
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserDept, setNewUserDept] = useState('Hospitalidad');
  const [newUserShift, setNewUserShift] = useState('07:30 AM - 04:30 PM');
  const [newUserAccess, setNewUserAccess] = useState('OPERATIVO');
  const [newUserPin, setNewUserPin] = useState('4580');
  const [newUserPerms, setNewUserPerms] = useState(['Hospitalidad']);
  const [userCreatedToast, setUserCreatedToast] = useState(false);

  const departments = ['Todos', 'Dirección', 'Cocina', 'Salud', 'Hospitalidad', 'Mantenimiento', 'Seguridad Polar'];
  const availableModules = ['Alacena', 'Balanza', 'Salud', 'Hospitalidad', 'Mantenimiento', 'Garita', 'Flota Vehicular', 'Personal'];

  const activeCount = useMemo(() => staffList.filter((s) => s.status === 'ACTIVO').length, [staffList]);
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((person) => {
      const matchDept = selectedDept === 'Todos' || person.department === selectedDept;
      const matchSearch =
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [staffList, selectedDept, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (filterStaffTasks === 'ALL') return tasks;
    return tasks.filter((t) => t.staffId === filterStaffTasks);
  }, [tasks, filterStaffTasks]);

  const toggleStaffStatus = (id) => {
    const order = ['ACTIVO', 'DESCANSO', 'LIBRE'];
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = order[(order.indexOf(s.status) + 1) % order.length];
        return { ...s, status: nextStatus };
      })
    );
  };

  const toggleTaskDone = (taskId) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const assignedPerson = staffList.find((s) => s.id === newTaskStaff);
    const created = {
      id: `tk-${Date.now()}`,
      title: newTaskTitle.trim(),
      staffId: newTaskStaff,
      department: assignedPerson ? assignedPerson.department : 'General',
      time: newTaskTime,
      priority: newTaskPriority,
      done: false
    };
    setTasks([created, ...tasks]);
    setNewTaskTitle('');
    setTaskCreatedToast(true);
    setTimeout(() => setTaskCreatedToast(false), 2400);
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

  const togglePermissionSelection = (mod) => {
    setNewUserPerms((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const generateRandomPin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewUserPin(randomPin);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserRole.trim()) return;
    const parts = newUserName.trim().split(' ');
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();

    const newEmployee = {
      id: `st-${Date.now()}`,
      name: newUserName.trim(),
      role: newUserRole.trim(),
      department: newUserDept,
      shift: 'Turno Asignado',
      hours: newUserShift,
      status: 'ACTIVO',
      pin: newUserPin,
      accessLevel: newUserAccess,
      permissions: newUserPerms.length ? newUserPerms : ['Hospitalidad'],
      phone: 'Registrado en Sistema',
      avatar: initials,
      color: newUserDept === 'Cocina' ? '#EE6B5F' : newUserDept === 'Hospitalidad' ? '#BE7AC6' : '#5E7AC6',
      schedule: ['Diurno', 'Diurno', 'Diurno', 'Diurno', 'Diurno', 'Libre', 'Libre']
    };

    setStaffList([newEmployee, ...staffList]);
    setNewUserName('');
    setNewUserRole('');
    generateRandomPin();
    setUserCreatedToast(true);
    setTimeout(() => setUserCreatedToast(false), 2600);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-stf-overlay" onClick={onClose}>
      <div className="domus-stf-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-stf-watermark" />

        {/* ==========================================
            CABECERA DEL MODAL DE PERSONAL
            ========================================== */}
        <header className="domus-stf-header">
          <div className="domus-stf-title-wrap">
            <div className="domus-stf-eyebrow">
              <Sparkles size={13} color="#EE6B5F" />
              <span>CASA ROQUEDAL · RECURSOS HUMANOS Y OPERACIONES</span>
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
            <button className="domus-stf-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
            BARRA DE PESTAÑAS INTERNAS (4 MÓDULOS)
            ========================================== */}
        <div className="domus-stf-tabs-bar">
          <div className="domus-stf-tabs">
            <button
              className={`domus-stf-tab ${activeTab === 'DIRECTORIO' ? 'active' : ''}`}
              onClick={() => setActiveTab('DIRECTORIO')}
            >
              <Users size={16} />
              <span>Personal en Vivo ({staffList.length})</span>
            </button>
            <button
              className={`domus-stf-tab ${activeTab === 'TAREAS' ? 'active' : ''}`}
              onClick={() => setActiveTab('TAREAS')}
            >
              <ClipboardCheck size={16} />
              <span>Asignación de Tareas ({tasks.length})</span>
            </button>
            <button
              className={`domus-stf-tab ${activeTab === 'HORARIOS' ? 'active' : ''}`}
              onClick={() => setActiveTab('HORARIOS')}
            >
              <Calendar size={16} />
              <span>Cuadrante de Horarios</span>
            </button>
            <button
              className={`domus-stf-tab ${activeTab === 'USUARIOS' ? 'active' : ''}`}
              onClick={() => setActiveTab('USUARIOS')}
            >
              <Lock size={16} />
              <span>Usuarios, Roles y PINs</span>
            </button>
          </div>

          {activeTab === 'DIRECTORIO' && (
            <div className="domus-stf-search">
              <Search size={15} color="#808080" />
              <input
                type="text"
                placeholder="Buscar empleado o cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO PRINCIPAL SEGÚN PESTAÑA
            ========================================== */}
        <div className="domus-stf-body">

          {/* PESTAÑA 1: DIRECTORIO Y ASISTENCIA EN VIVO */}
          {activeTab === 'DIRECTORIO' && (
            <>
              <div className="domus-stf-dept-pills">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`domus-stf-dept-pill ${selectedDept === dept ? 'active' : ''}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              <div className="domus-stf-grid">
                {filteredStaff.map((person) => {
                  const personTasks = tasks.filter((t) => t.staffId === person.id);
                  const doneCount = personTasks.filter((t) => t.done).length;
                  return (
                    <div key={person.id} className="domus-person-card">
                      <div className="domus-person-top">
                        <div className="domus-person-avatar" style={{ background: person.color }}>
                          <span>{person.avatar}</span>
                          <i
                            className={`domus-status-dot ${person.status.toLowerCase()}`}
                            title={person.status}
                          ></i>
                        </div>
                        <div className="domus-person-info">
                          <div className="domus-person-tags">
                            <span className="domus-person-dept">{person.department}</span>
                            <button
                              type="button"
                              onClick={() => toggleStaffStatus(person.id)}
                              className={`domus-status-badge ${person.status.toLowerCase()}`}
                              title="Toque para cambiar estatus"
                            >
                              {person.status === 'ACTIVO' ? 'En Turno' : person.status === 'DESCANSO' ? 'En Descanso' : 'Día Libre'}
                            </button>
                          </div>
                          <h4>{person.name}</h4>
                          <p>{person.role}</p>
                        </div>
                      </div>

                      <div className="domus-person-schedule-bar">
                        <div>
                          <Clock size={13} color="#5E7AC6" />
                          <span>{person.hours}</span>
                        </div>
                        <strong>PIN: ••{person.pin.slice(-2)}</strong>
                      </div>

                      <div className="domus-person-Perms">
                        {person.permissions.map((perm, idx) => (
                          <span key={idx} className="domus-perm-chip">{perm}</span>
                        ))}
                      </div>

                      <div className="domus-person-footer">
                        <div className="domus-person-task-summary">
                          <span>Tareas hoy: <strong>{doneCount}/{personTasks.length}</strong></span>
                        </div>
                        <div className="domus-person-actions">
                          <button
                            type="button"
                            className="domus-person-btn"
                            onClick={() => {
                              setFilterStaffTasks(person.id);
                              setNewTaskStaff(person.id);
                              setActiveTab('TAREAS');
                            }}
                          >
                            Asignar Tarea
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* PESTAÑA 2: ASIGNACIÓN Y SUPERVISIÓN DE TAREAS */}
          {activeTab === 'TAREAS' && (
            <div className="domus-stf-split-layout">
              <form className="domus-stf-form-card" onSubmit={handleCreateTask}>
                <h4>Asignar Nueva Tarea Operativa</h4>
                <p className="domus-stf-sub">
                  La tarea aparecerá de inmediato en la tableta del área correspondiente con alerta sonora suave.
                </p>

                <label className="domus-stf-label">Descripción de la Tarea</label>
                <textarea
                  rows={3}
                  placeholder="Ej. Preparar bandeja de té e infusiones para visita en terraza a las 4:30 PM..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="domus-stf-textarea"
                />

                <label className="domus-stf-label">Asignar a Empleado</label>
                <select
                  value={newTaskStaff}
                  onChange={(e) => setNewTaskStaff(e.target.value)}
                  className="domus-stf-select"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.department} ({s.role})
                    </option>
                  ))}
                </select>

                <div className="domus-stf-row-2">
                  <div>
                    <label className="domus-stf-label">Hora Límite</label>
                    <input
                      type="text"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="domus-stf-input"
                    />
                  </div>
                  <div>
                    <label className="domus-stf-label">Nivel de Prioridad</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="domus-stf-select"
                    >
                      <option value="NORMAL">Rutina / Normal</option>
                      <option value="ALTA">Prioridad Alta</option>
                      <option value="URGENTE">Urgente / Inmediata</option>
                    </select>
                  </div>
                </div>

                {taskCreatedToast ? (
                  <div className="domus-stf-toast">
                    <CheckCircle2 size={20} />
                    <span>¡Tarea asignada y sincronizada en tableta!</span>
                  </div>
                ) : (
                  <button type="submit" className="domus-stf-submit-btn">
                    <Plus size={17} />
                    <span>ASIGNAR TAREA AL EMPLEADO</span>
                  </button>
                )}
              </form>

              <div className="domus-stf-list-card">
                <div className="domus-stf-list-head">
                  <div>
                    <h3>Tablero de Tareas del Día</h3>
                    <p>Toque cualquier tarea para verificar o marcar su cumplimiento</p>
                  </div>
                  <select
                    value={filterStaffTasks}
                    onChange={(e) => setFilterStaffTasks(e.target.value)}
                    className="domus-stf-filter-select"
                  >
                    <option value="ALL">Todo el Personal ({tasks.length})</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
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
            </div>
          )}

          {/* PESTAÑA 3: CUADRANTE DE HORARIOS Y TURNOS SEMANALES */}
          {activeTab === 'HORARIOS' && (
            <div className="domus-schedule-panel">
              <div className="domus-schedule-head">
                <div>
                  <h3>Cuadrante Semanal de Turnos y Guardias</h3>
                  <p>Toque cualquier día para rotar el turno (Diurno · Nocturno · Guardia 24h · Libre)</p>
                </div>
                <div className="domus-schedule-legend">
                  <span><i style={{ background: '#5E7AC6' }}></i> Diurno</span>
                  <span><i style={{ background: '#BE7AC6' }}></i> Nocturno</span>
                  <span><i style={{ background: '#EE6B5F' }}></i> Guardia 24h</span>
                  <span><i style={{ background: '#94A3B8' }}></i> Libre</span>
                </div>
              </div>

              <div className="domus-schedule-table-wrap">
                <table className="domus-schedule-table">
                  <thead>
                    <tr>
                      <th>Empleado / Área</th>
                      {DAYS_SHORT.map((d) => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((person) => (
                      <tr key={person.id}>
                        <td>
                          <div className="domus-sched-person">
                            <div className="domus-sched-avatar" style={{ background: person.color }}>
                              {person.avatar}
                            </div>
                            <div>
                              <strong>{person.name}</strong>
                              <small>{person.department} · {person.hours}</small>
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

          {/* PESTAÑA 4: CREACIÓN Y MANEJO DE USUARIOS, ROLES Y PIN DE TABLETAS */}
          {activeTab === 'USUARIOS' && (
            <div className="domus-stf-split-layout">
              <form className="domus-stf-form-card" onSubmit={handleCreateUser}>
                <h4>Registrar Nuevo Empleado / Usuario</h4>
                <p className="domus-stf-sub">
                  Cree el perfil del trabajador, asigne los módulos que podrá ver y genere su código PIN para las tabletas de pared.
                </p>

                <label className="domus-stf-label">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Roberto Méndez"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="domus-stf-input"
                />

                <div className="domus-stf-row-2">
                  <div>
                    <label className="domus-stf-label">Cargo / Función</label>
                    <input
                      type="text"
                      placeholder="Ej. Chofer / Asistente"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="domus-stf-input"
                    />
                  </div>
                  <div>
                    <label className="domus-stf-label">Departamento</label>
                    <select
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      className="domus-stf-select"
                    >
                      <option value="Cocina">Cocina & Despensa</option>
                      <option value="Hospitalidad">Hospitalidad & Lencería</option>
                      <option value="Salud">Cuidados Médicos</option>
                      <option value="Mantenimiento">Mantenimiento & Planta</option>
                      <option value="Seguridad Polar">Seguridad / Flota</option>
                    </select>
                  </div>
                </div>

                <div className="domus-stf-row-2">
                  <div>
                    <label className="domus-stf-label">Horario Asignado</label>
                    <input
                      type="text"
                      value={newUserShift}
                      onChange={(e) => setNewUserShift(e.target.value)}
                      className="domus-stf-input"
                    />
                  </div>
                  <div>
                    <label className="domus-stf-label">Nivel de Acceso</label>
                    <select
                      value={newUserAccess}
                      onChange={(e) => setNewUserAccess(e.target.value)}
                      className="domus-stf-select"
                    >
                      <option value="ADMIN_CASA">Administrador / Ama de Llaves</option>
                      <option value="JEFE_AREA">Jefe de Área (Cocina / Mant.)</option>
                      <option value="SALUD">Personal Médico / Enfermería</option>
                      <option value="OPERATIVO">Operativo (Tableta de Área)</option>
                      <option value="ENLACE_GARITA">Garita / Flota (Sin datos médicos)</option>
                    </select>
                  </div>
                </div>

                <label className="domus-stf-label">Código PIN de Acceso en Tabletas (4 dígitos)</label>
                <div className="domus-pin-generator">
                  <div className="domus-pin-display">{newUserPin}</div>
                  <button type="button" onClick={generateRandomPin} className="domus-pin-btn">
                    Generar Nuevo PIN
                  </button>
                </div>

                <label className="domus-stf-label">Módulos Autorizados para este Usuario</label>
                <div className="domus-perms-selector">
                  {availableModules.map((mod) => {
                    const active = newUserPerms.includes(mod);
                    return (
                      <button
                        type="button"
                        key={mod}
                        onClick={() => togglePermissionSelection(mod)}
                        className={`domus-perm-toggle ${active ? 'active' : ''}`}
                      >
                        {active && <Check size={12} />}
                        <span>{mod}</span>
                      </button>
                    );
                  })}
                </div>

                {userCreatedToast ? (
                  <div className="domus-stf-toast">
                    <CheckCircle2 size={20} />
                    <span>¡Usuario creado y PIN activado en las tabletas!</span>
                  </div>
                ) : (
                  <button type="submit" className="domus-stf-submit-btn">
                    <ShieldCheck size={17} />
                    <span>CREAR USUARIO Y ACTIVAR CREDENCIALES</span>
                  </button>
                )}
              </form>

              <div className="domus-stf-list-card">
                <div className="domus-stf-list-head">
                  <div>
                    <h3>Credenciales y Niveles de Acceso</h3>
                    <p>Control de privacidad y permisos por rol en Casa Roquedal</p>
                  </div>
                </div>

                <div className="domus-stf-tasks-stack">
                  {staffList.map((user) => (
                    <div key={user.id} className="domus-user-access-row">
                      <div className="domus-sched-avatar" style={{ background: user.color }}>
                        {user.avatar}
                      </div>
                      <div className="domus-user-access-info">
                        <strong>{user.name} · <span style={{ color: '#5E7AC6' }}>{user.accessLevel}</span></strong>
                        <small>{user.role} · Acceso a: {user.permissions.join(', ')}</small>
                      </div>
                      <div className="domus-user-pin-box">
                        <small>PIN TABLETA</small>
                        <strong>{user.pin}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ==========================================
            PIE DEL MODAL
            ========================================== */}
        <footer className="domus-stf-footer">
          <span>Roles protegidos · Los custodios y chóferes solo ven módulos de intendencia y flota</span>
          <button className="domus-stf-close-btn" onClick={onClose}>
            VOLVER AL PANEL PRINCIPAL
          </button>
        </footer>

        {/* ==========================================
            ESTILOS AISLADOS DEL MODAL DE PERSONAL
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
            .domus-stf-overlay { padding: 24px; }
          }
          @keyframes domusStfFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-stf-modal {
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
            .domus-stf-modal {
              height: 90vh;
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
            padding: 18px 18px 14px;
            background: rgba(255, 255, 255, 0.68);
            border-bottom: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-stf-header { padding: 22px 32px 18px; }
          }
          .domus-stf-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 10px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
            margin-bottom: 4px;
          }
          .domus-stf-title-wrap h2 {
            font-size: clamp(20px, 2.5vw, 28px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-stf-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-stf-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 16px;
          }
          @media (min-width: 640px) { .domus-stf-kpi { display: flex; } }
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

          /* TABS BAR */
          .domus-stf-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.45);
            border-bottom: 1px solid rgba(255, 255, 255, 0.85);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-stf-tabs-bar { padding: 14px 32px; } }
          .domus-stf-tabs {
            display: flex; gap: 8px; overflow-x: auto; max-width: 100%; padding-bottom: 2px;
          }
          .domus-stf-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 16px; border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.68);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer; transition: all 0.22s ease;
          }
          .domus-stf-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-stf-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }

          .domus-stf-search {
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid #fff;
            padding: 9px 14px; border-radius: 14px; min-width: 240px;
          }
          .domus-stf-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }

          /* BODY */
          .domus-stf-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
          }
          @media (min-width: 768px) { .domus-stf-body { padding: 24px 32px; } }

          .domus-stf-dept-pills {
            display: flex; gap: 8px; overflow-x: auto; margin-bottom: 18px; padding-bottom: 4px;
          }
          .domus-stf-dept-pill {
            padding: 7px 15px; border-radius: 99px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.65);
            font-size: 11px; font-weight: 800; color: #555;
            cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
          }
          .domus-stf-dept-pill.active {
            background: #202020; color: #fff; border-color: #202020;
          }

          /* STAFF CARDS GRID */
          .domus-stf-grid {
            display: grid; grid-template-columns: 1fr; gap: 16px;
          }
          @media (min-width: 640px) { .domus-stf-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1060px) { .domus-stf-grid { grid-template-columns: repeat(3, 1fr); } }

          .domus-person-card {
            background: rgba(255, 255, 255, 0.8);
            border: 1.5px solid rgba(255, 255, 255, 0.96);
            border-radius: 24px; padding: 18px;
            box-shadow: 0 8px 24px rgba(32, 32, 32, 0.04);
            display: flex; flex-direction: column; justify-content: space-between;
            gap: 12px; transition: all 0.25s ease;
          }
          .domus-person-card:hover {
            transform: translateY(-4px); background: #fff;
            box-shadow: 0 16px 32px rgba(94, 122, 198, 0.14);
          }

          .domus-person-top { display: flex; align-items: center; gap: 14px; }
          .domus-person-avatar {
            position: relative;
            width: 52px; height: 52px; border-radius: 16px;
            color: #fff; font-size: 16px; font-weight: 900;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; box-shadow: 0 6px 16px rgba(0,0,0,0.12);
          }
          .domus-status-dot {
            position: absolute; bottom: -2px; right: -2px;
            width: 13px; height: 13px; border-radius: 50%;
            border: 2.5px solid #fff;
          }
          .domus-status-dot.activo { background: #10B981; }
          .domus-status-dot.descanso { background: #F59E0B; }
          .domus-status-dot.libre { background: #94A3B8; }

          .domus-person-info { flex: 1; min-width: 0; }
          .domus-person-tags {
            display: flex; align-items: center; justify-content: space-between;
            gap: 6px; margin-bottom: 4px;
          }
          .domus-person-dept {
            font-size: 9px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.08em; color: #5E7AC6;
            background: rgba(94, 122, 198, 0.12);
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-status-badge {
            border: none; cursor: pointer;
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            padding: 3px 9px; border-radius: 99px;
          }
          .domus-status-badge.activo { background: rgba(16, 185, 129, 0.15); color: #059669; }
          .domus-status-badge.descanso { background: rgba(245, 158, 11, 0.18); color: #B45309; }
          .domus-status-badge.libre { background: rgba(148, 163, 184, 0.2); color: #475569; }

          .domus-person-info h4 {
            font-size: 15.5px; font-weight: 900; color: #202020; margin: 0 0 2px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .domus-person-info p {
            font-size: 11.5px; font-weight: 600; color: #666; margin: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          .domus-person-schedule-bar {
            display: flex; align-items: center; justify-content: space-between;
            background: #F5F7FB; padding: 8px 12px; border-radius: 12px;
            font-size: 11px; font-weight: 700; color: #444;
          }
          .domus-person-schedule-bar div { display: flex; align-items: center; gap: 6px; }
          .domus-person-schedule-bar strong { font-size: 10.5px; color: #5E7AC6; }

          .domus-person-Perms {
            display: flex; flex-wrap: wrap; gap: 5px;
          }
          .domus-perm-chip {
            font-size: 9.5px; font-weight: 700; color: #555;
            background: rgba(0,0,0,0.04); padding: 3px 8px; border-radius: 8px;
          }

          .domus-person-footer {
            display: flex; align-items: center; justify-content: space-between;
            padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.05);
            font-size: 11.5px; color: #666;
          }
          .domus-person-btn {
            padding: 7px 12px; border-radius: 10px; border: none;
            background: rgba(94, 122, 198, 0.14); color: #5E7AC6;
            font-size: 11px; font-weight: 800; cursor: pointer;
            transition: all 0.2s ease;
          }
          .domus-person-btn:hover { background: #5E7AC6; color: #fff; }

          /* SPLIT LAYOUT (TAREAS Y USUARIOS) */
          .domus-stf-split-layout {
            display: grid; grid-template-columns: 1fr; gap: 20px;
          }
          @media (min-width: 980px) {
            .domus-stf-split-layout { grid-template-columns: 1fr 1.35fr; }
          }

          .domus-stf-form-card, .domus-stf-list-card, .domus-schedule-panel {
            background: rgba(255, 255, 255, 0.82);
            border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          }
          .domus-stf-form-card h4, .domus-stf-list-head h3, .domus-schedule-head h3 {
            margin: 0 0 4px; font-size: 18px; font-weight: 900; color: #202020;
          }
          .domus-stf-sub, .domus-stf-list-head p, .domus-schedule-head p {
            margin: 0 0 14px; font-size: 12px; color: #666; line-height: 1.4;
          }
          .domus-stf-label {
            display: block; font-size: 10px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.08em; color: #5E7AC6;
            margin: 12px 0 5px;
          }
          .domus-stf-input, .domus-stf-select, .domus-stf-textarea {
            width: 100%; box-sizing: border-box;
            padding: 11px 13px; border-radius: 13px;
            border: 1px solid rgba(0,0,0,0.1); background: #F7F9FC;
            font-size: 12.5px; font-weight: 600; color: #202020;
            font-family: inherit; outline: none;
          }
          .domus-stf-row-2 {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          }
          .domus-stf-submit-btn {
            width: 100%; padding: 14px; border: none; border-radius: 15px;
            background: #5E7AC6; color: #fff;
            font-size: 11.5px; font-weight: 900; letter-spacing: 0.08em;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer; margin-top: 16px;
            box-shadow: 0 10px 24px rgba(94, 122, 198, 0.35);
            transition: all 0.2s ease;
          }
          .domus-stf-submit-btn:hover { background: #4864B0; transform: translateY(-2px); }

          .domus-stf-toast {
            margin-top: 14px; padding: 12px 14px; border-radius: 14px;
            background: rgba(16, 185, 129, 0.15); color: #065F46;
            font-size: 12px; font-weight: 800;
            display: flex; align-items: center; gap: 10px;
          }

          .domus-stf-list-head {
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 10px; margin-bottom: 14px;
          }
          .domus-stf-filter-select {
            padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
            background: #F7F9FC; font-size: 11.5px; font-weight: 800; color: #202020;
          }

          .domus-stf-tasks-stack { display: flex; flex-direction: column; gap: 10px; }
          .domus-task-row {
            display: flex; align-items: flex-start; gap: 12px;
            padding: 13px 15px; border-radius: 16px;
            background: #F7F9FC; border: 1px solid rgba(0,0,0,0.05);
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-task-row:hover { background: #fff; transform: translateX(4px); }
          .domus-task-row.done { opacity: 0.65; }
          .domus-task-check {
            width: 22px; height: 22px; border-radius: 7px;
            border: 2px solid #5E7AC6; background: #fff; color: #fff;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            margin-top: 2px;
          }
          .domus-task-row.done .domus-task-check { background: #5E7AC6; }
          .domus-task-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
          .domus-task-top { display: flex; align-items: center; gap: 8px; }
          .domus-task-prio {
            font-size: 8.5px; font-weight: 900; padding: 2px 7px; border-radius: 99px;
          }
          .domus-task-prio.urgente { background: rgba(238,107,95,0.18); color: #EE6B5F; }
          .domus-task-prio.alta { background: rgba(94,122,198,0.16); color: #5E7AC6; }
          .domus-task-prio.normal { background: rgba(0,0,0,0.06); color: #555; }
          .domus-task-time { font-size: 10px; font-weight: 800; color: #888; }
          .domus-task-body strong { font-size: 13px; font-weight: 800; color: #202020; }
          .domus-task-body small { font-size: 11px; color: #666; font-weight: 600; }

          /* SCHEDULE TABLE */
          .domus-schedule-head {
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px; margin-bottom: 16px;
          }
          .domus-schedule-legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; font-weight: 800; }
          .domus-schedule-legend span { display: flex; align-items: center; gap: 6px; }
          .domus-schedule-legend i { width: 10px; height: 10px; border-radius: 50%; }
          .domus-schedule-table-wrap { width: 100%; overflow-x: auto; }
          .domus-schedule-table {
            width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 780px;
          }
          .domus-schedule-table th {
            text-align: left; font-size: 10px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.08em; color: #808080;
            padding: 6px 10px;
          }
          .domus-schedule-table td {
            background: #F7F9FC; padding: 10px;
          }
          .domus-schedule-table tr td:first-child { border-radius: 14px 0 0 14px; }
          .domus-schedule-table tr td:last-child { border-radius: 0 14px 14px 0; }
          .domus-sched-person { display: flex; align-items: center; gap: 10px; }
          .domus-sched-avatar {
            width: 36px; height: 36px; border-radius: 11px; color: #fff;
            font-size: 12px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .domus-sched-person strong { display: block; font-size: 12.5px; font-weight: 900; color: #202020; }
          .domus-sched-person small { font-size: 10px; color: #666; font-weight: 600; }

          .domus-shift-Chip {
            width: 100%; padding: 7px 8px; border-radius: 10px; border: none;
            font-size: 10px; font-weight: 900; cursor: pointer;
            transition: transform 0.15s ease;
          }
          .domus-shift-Chip:hover { transform: scale(1.06); }
          .shift-diurno { background: rgba(94, 122, 198, 0.15); color: #5E7AC6; }
          .shift-nocturno { background: rgba(190, 122, 198, 0.18); color: #9333EA; }
          .shift-24h, .shift-guardia, .shift-especial { background: rgba(238, 107, 95, 0.18); color: #EE6B5F; }
          .shift-libre { background: rgba(148, 163, 184, 0.18); color: #64748B; }

          /* PIN GENERATOR & PERMISSIONS */
          .domus-pin-generator {
            display: flex; align-items: center; gap: 10px;
          }
          .domus-pin-display {
            flex: 1; background: #202020; color: #6EE7B7;
            padding: 10px 16px; border-radius: 13px;
            font-size: 20px; font-weight: 900; letter-spacing: 0.25em; text-align: center;
          }
          .domus-pin-btn {
            padding: 12px 16px; border-radius: 13px; border: 1px solid rgba(0,0,0,0.1);
            background: #fff; font-size: 11px; font-weight: 800; cursor: pointer;
          }
          .domus-perms-selector {
            display: flex; flex-wrap: wrap; gap: 6px;
          }
          .domus-perm-toggle {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 7px 11px; border-radius: 10px;
            border: 1px solid rgba(0,0,0,0.1); background: #F7F9FC;
            font-size: 11px; font-weight: 800; color: #555; cursor: pointer;
          }
          .domus-perm-toggle.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
          }

          .domus-user-access-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px; border-radius: 16px; background: #F7F9FC;
          }
          .domus-user-access-info { flex: 1; display: flex; flex-direction: column; }
          .domus-user-access-info strong { font-size: 13px; font-weight: 900; color: #202020; }
          .domus-user-access-info small { font-size: 11px; color: #666; font-weight: 600; }
          .domus-user-pin-box {
            background: #fff; border: 1px solid rgba(0,0,0,0.06);
            padding: 6px 12px; border-radius: 12px; text-align: center;
          }
          .domus-user-pin-box small { display: block; font-size: 8px; font-weight: 800; color: #888; }
          .domus-user-pin-box strong { font-size: 14px; font-weight: 900; color: #202020; letter-spacing: 0.1em; }

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