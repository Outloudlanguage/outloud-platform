import React, { useState, useMemo } from 'react';
import {
  X, HeartPulse, Activity, Thermometer, Droplets, Clock,
  CheckCircle2, AlertCircle, Sparkles, Check, Plus, Minus,
  Coffee, ShieldCheck, FileSignature, Users, Calendar, Bell,
  ClipboardCheck, ArrowUpRight, Download, Printer
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

const INITIAL_READINGS = [
  { id: 'r-1', time: '06:00 AM', sys: 118, dia: 76, bpm: 65, spo2: 98, temp: 36.4, glu: 92, nurse: 'Lic. Gabriela (Noche)' },
  { id: 'r-2', time: '09:00 AM', sys: 122, dia: 79, bpm: 70, spo2: 98, temp: 36.5, glu: 108, nurse: 'Lic. Carmen (Día)' },
  { id: 'r-3', time: '12:00 PM', sys: 120, dia: 78, bpm: 68, spo2: 99, temp: 36.6, glu: 96, nurse: 'Lic. Carmen (Día)' },
  { id: 'r-4', time: '03:00 PM', sys: 124, dia: 80, bpm: 72, spo2: 97, temp: 36.5, glu: 112, nurse: 'Lic. Carmen (Día)' },
  { id: 'r-5', time: '06:00 PM', sys: 119, dia: 77, bpm: 67, spo2: 98, temp: 36.5, glu: 95, nurse: 'Lic. Carmen (Día)' },
  { id: 'r-6', time: 'Ahora', sys: 120, dia: 78, bpm: 68, spo2: 98, temp: 36.5, glu: 94, nurse: 'Lic. Carmen (Día)' }
];

const INITIAL_MEDS = [
  {
    id: 'med-1',
    slot: 'MAÑANA',
    time: '07:30 AM',
    name: 'Esomeprazol 40 mg',
    dose: '1 Cápsula',
    rule: 'Administrar en ayunas 30 min antes del desayuno',
    stock: 24,
    minStock: 10,
    done: true,
    signedBy: 'Lic. Carmen · 07:28 AM'
  },
  {
    id: 'med-2',
    slot: 'MAÑANA',
    time: '08:30 AM',
    name: 'Losartán Potásico 50 mg',
    dose: '1 Tableta',
    rule: 'Tomar después del desayuno · Verificar TA previa',
    stock: 18,
    minStock: 10,
    done: true,
    signedBy: 'Lic. Carmen · 08:35 AM'
  },
  {
    id: 'med-3',
    slot: 'MAÑANA',
    time: '08:30 AM',
    name: 'Vitamina D3 2000 UI + Calcio',
    dose: '1 Cápsula blanda',
    rule: 'Junto con alimentos matutinos',
    stock: 5,
    minStock: 7,
    done: true,
    signedBy: 'Lic. Carmen · 08:35 AM'
  },
  {
    id: 'med-4',
    slot: 'MEDIODÍA',
    time: '12:30 PM',
    name: 'Omega 3 Grado Médico + Enzimas',
    dose: '1 Cápsula',
    rule: 'Durante el almuerzo principal',
    stock: 22,
    minStock: 8,
    done: true,
    signedBy: 'Lic. Carmen · 12:40 PM'
  },
  {
    id: 'med-5',
    slot: 'TARDE',
    time: '05:00 PM',
    name: 'Bisoprolol 2.5 mg',
    dose: '1/2 Tableta',
    rule: 'No administrar si el pulso es menor a 55 BPM',
    stock: 14,
    minStock: 7,
    done: false,
    signedBy: null
  },
  {
    id: 'med-6',
    slot: 'NOCHE',
    time: '08:30 PM',
    name: 'Atorvastatina 20 mg',
    dose: '1 Tableta',
    rule: 'Administrar después de la cena ligera',
    stock: 4,
    minStock: 7,
    done: false,
    signedBy: null
  },
  {
    id: 'med-7',
    slot: 'NOCHE',
    time: '09:30 PM',
    name: 'Melatonina de Liberación Prolongada 3 mg',
    dose: '1 Tableta sublingual',
    rule: 'Al apagar luces de la suite principal',
    stock: 19,
    minStock: 5,
    done: false,
    signedBy: null
  },
  {
    id: 'med-8',
    slot: 'SOS',
    time: 'Condicional',
    name: 'Paracetamol 500 mg (Rescate)',
    dose: '1 Tableta si hay dolor o T° > 37.8°C',
    rule: 'Notificar al médico de cabecera antes de repetir dosis',
    stock: 12,
    minStock: 4,
    done: false,
    signedBy: null
  }
];

const INITIAL_MEALS = [
  { id: 'ml-1', meal: 'Desayuno (08:00 AM)', menu: 'Avena tibia en leche de almendras, claras pochadas y papaya picada fina', intake: 100, note: 'Excelente apetito y deglución sin fatiga.' },
  { id: 'ml-2', meal: 'Hidratación & Merienda AM (10:30 AM)', menu: 'Infusión de manzanilla tibia + compota artesanal de pera', intake: 100, note: 'Tolerado al 100%.' },
  { id: 'ml-3', meal: 'Almuerzo Principal (12:30 PM)', menu: 'Crema de auyama asada + Filete de mero al vapor con puré suave', intake: 75, note: 'Dejó una pequeña porción de guarnición.' },
  { id: 'ml-4', meal: 'Merienda PM (04:00 PM)', menu: 'Gelatina hipocalórica + Galleta de avena blanda', intake: 0, note: 'Pendiente por servir.' },
  { id: 'ml-5', meal: 'Cena Ligera (07:30 PM)', menu: 'Consomé desgrasado de aves + Soufflé suave de calabacín', intake: 0, note: 'Pendiente por servir.' }
];

const INITIAL_ROUTINES = [
  { id: 'rt-1', title: 'Aseo matutino asistido e higiene bucal completa', time: '07:15 AM', category: 'Higiene', done: true },
  { id: 'rt-2', title: 'Inspección de piel y humectación en zonas de apoyo (Sacro y talones)', time: '07:40 AM', category: 'Integridad Cutánea', done: true },
  { id: 'rt-3', title: 'Caminata asistida por terraza y jardín (15 minutos)', time: '09:30 AM', category: 'Movilidad', done: true },
  { id: 'rt-4', title: 'Ejercicios de fisioterapia respiratoria con espirómetro', time: '11:30 AM', category: 'Terapia', done: true },
  { id: 'rt-5', title: 'Cambio postural vespertino y masaje de retorno venoso en piernas', time: '04:00 PM', category: 'Prevención Escaras', done: false },
  { id: 'rt-6', title: 'Preparación de suite nocturna (Luz cálida tenue y barandas seguras)', time: '09:00 PM', category: 'Confort Nocturno', done: false }
];

const INITIAL_NOTES = [
  {
    id: 'nt-1',
    time: '12:45 PM',
    nurse: 'Lic. Carmen Valero (Turno Diurno)',
    tag: 'Nutrición & Estado',
    text: 'El Dr. Jiménez almorzó tranquilo en el comedor interno. Tensión arterial estable en 120/78 mmHg. Piel íntegra sin zonas de enrojecimiento.'
  },
  {
    id: 'nt-2',
    time: '07:05 AM',
    nurse: 'Lic. Gabriela Méndez (Entrega Guardia Nocturna)',
    tag: 'Relevo de Guardia',
    text: 'Noche reparadora de 7.5 horas continuas de sueño. Un solo despertar a las 03:20 AM para micción asistida sin dificultad. Queda pendiente reposición de Atorvastatina en alacena médica.'
  }
];

export default function NursingModal({ isOpen, onClose, initialTab = 'SIGNOS' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [readings, setReadings] = useState(INITIAL_READINGS);
  const [meds, setMeds] = useState(INITIAL_MEDS);
  const [medSlotFilter, setMedSlotFilter] = useState('TODOS');
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [routines, setRoutines] = useState(INITIAL_ROUTINES);
  const [notes, setNotes] = useState(INITIAL_NOTES);

  const [hydrationMl, setHydrationMl] = useState(1450);
  const hydrationGoal = 1800;
  const [currentPosture, setCurrentPosture] = useState('Sedestación en Sillón Reclinable');
  const [lastPostureTime, setLastPostureTime] = useState('Hace 45 min');
  const [kitchenOrderToast, setKitchenOrderToast] = useState(false);

  const [newSys, setNewSys] = useState(120);
  const [newDia, setNewDia] = useState(78);
  const [newBpm, setNewBpm] = useState(68);
  const [newSpo2, setNewSpo2] = useState(98);
  const [newTemp, setNewTemp] = useState(36.5);
  const [newGlu, setNewGlu] = useState(96);
  const [vitalSavedToast, setVitalSavedToast] = useState(false);

  const [outgoingNurse, setOutgoingNurse] = useState('Lic. Carmen Valero (Turno Diurno)');
  const [incomingNurse, setIncomingNurse] = useState('Lic. Gabriela Méndez (Turno Nocturno)');
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverSigned, setHandoverSigned] = useState(false);
  const [showSosPanel, setShowSosPanel] = useState(false);

  const latestReading = readings[readings.length - 1];
  const isBpWarning = latestReading.sys >= 138 || latestReading.sys <= 95 || latestReading.dia >= 88;
  const completedMedsCount = useMemo(() => meds.filter((m) => m.done).length, [meds]);
  const lowMedStock = useMemo(() => meds.filter((m) => m.stock <= m.minStock), [meds]);

  const filteredMeds = useMemo(() => {
    if (medSlotFilter === 'TODOS') return meds;
    return meds.filter((m) => m.slot === medSlotFilter);
  }, [meds, medSlotFilter]);

  const handleRecordVitals = (e) => {
    e.preventDefault();
    const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const entry = {
      id: `r-${Date.now()}`,
      time: nowStr,
      sys: Number(newSys),
      dia: Number(newDia),
      bpm: Number(newBpm),
      spo2: Number(newSpo2),
      temp: Number(newTemp),
      glu: Number(newGlu),
      nurse: 'Lic. Carmen (Día)'
    };
    setReadings([...readings.slice(1), entry]);

    const autoLog = {
      id: `nt-${Date.now()}`,
      time: nowStr,
      nurse: 'Lic. Carmen Valero (Registro Telemetría)',
      tag: 'Signos Vitales',
      text: `Toma registrada: TA ${newSys}/${newDia} mmHg · Pulso ${newBpm} BPM · SpO2 ${newSpo2}% · Temp ${newTemp}°C · Glucemia ${newGlu} mg/dL.`
    };
    setNotes([autoLog, ...notes]);
    setVitalSavedToast(true);
    setTimeout(() => setVitalSavedToast(false), 2500);
  };

  const toggleMedication = (id) => {
    const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    setMeds((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextDone = !m.done;
        return {
          ...m,
          done: nextDone,
          stock: nextDone ? Math.max(0, m.stock - 1) : m.stock + 1,
          signedBy: nextDone ? `Lic. Carmen · ${nowStr}` : null
        };
      })
    );
  };

  const addHydration = (amount) => {
    setHydrationMl((prev) => Math.min(2600, prev + amount));
  };

  const cycleMealIntake = (mealId) => {
    const steps = [100, 75, 50, 25, 0];
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id !== mealId) return m;
        const nextIntake = steps[(steps.indexOf(m.intake) + 1) % steps.length];
        return {
          ...m,
          intake: nextIntake,
          note: nextIntake >= 75 ? 'Tolerado adecuadamente.' : nextIntake > 0 ? 'Ingesta parcial registrada.' : 'Pendiente por servir.'
        };
      })
    );
  };

  const toggleRoutine = (id) => {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  const handleSignHandover = (e) => {
    e.preventDefault();
    const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const summaryText = handoverNote.trim()
      ? handoverNote.trim()
      : `Entrega de guardia conforme de ${outgoingNurse} a ${incomingNurse}. Signos vitales en ${latestReading.sys}/${latestReading.dia} mmHg y medicación verificada.`;

    setNotes([
      {
        id: `nt-${Date.now()}`,
        time: nowStr,
        nurse: `${outgoingNurse} → ${incomingNurse}`,
        tag: 'Acta de Relevo Firmada',
        text: summaryText
      },
      ...notes
    ]);
    setHandoverNote('');
    setHandoverSigned(true);
    setTimeout(() => setHandoverSigned(false), 3000);
  };

  // Disparador de impresión nativa optimizada para PDF Clínico y WhatsApp
  const handleExportPDF = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="domus-nur-overlay" onClick={onClose}>
      <div className="domus-nur-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-nur-watermark" />

        {/* ==========================================
            CABECERA CLÍNICA DEL ADULTO MAYOR
            ========================================== */}
        <header className="domus-nur-header">
          <div className="domus-nur-patient-profile">
            <div className="domus-nur-avatar">
              <HeartPulse size={24} color="#fff" />
              <i className="domus-nur-online"></i>
            </div>
            <div>
              <div className="domus-nur-eyebrow">
                <Sparkles size={12} color="#EE6B5F" />
                <span>SUITE PRINCIPAL · MONITOREO GERIÁTRICO CONTINUO</span>
              </div>
              <h2>Dr. Gustavo Jiménez <small>82 Años · Sangre O+</small></h2>
            </div>
          </div>

          <div className="domus-nur-kpis">
            <div className="domus-nur-kpi desktop-only">
              <small>MÉDICO TRATANTE</small>
              <strong>Dr. Alejandro Vegas</strong>
            </div>
            <button
              type="button"
              className="domus-nur-pdf-btn"
              onClick={handleExportPDF}
              title="Exportar Reporte Clínico en PDF o Imprimir"
            >
              <Printer size={15} />
              <span>Exportar PDF Clínico</span>
            </button>
            <button
              type="button"
              className={`domus-nur-sos-btn ${showSosPanel ? 'active' : ''}`}
              onClick={() => setShowSosPanel(!showSosPanel)}
            >
              <AlertCircle size={15} />
              <span>FICHA SOS</span>
            </button>
            <button className="domus-nur-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* BANNER DESPLEGABLE DE EMERGENCIA MÉDICA (SOS) */}
        {showSosPanel && (
          <div className="domus-nur-sos-banner">
            <div className="domus-nur-sos-col">
              <small>ALERGIAS MEDICAMENTOSAS</small>
              <strong>Penicilina y AINEs (Ibuprofeno / Ketoprofeno)</strong>
            </div>
            <div className="domus-nur-sos-col">
              <small>DIAGNÓSTICO BASE</small>
              <strong>Hipertensión Arterial Controlada · Régimen Hiposódico</strong>
            </div>
            <div className="domus-nur-sos-col">
              <small>MÉDICO DE CABECERA / CARDIÓLOGO</small>
              <strong>Dr. Alejandro Vegas · +58 414-3219900 (24h)</strong>
            </div>
            <div className="domus-nur-sos-col">
              <small>EMERGENCIA MÓVIL UCI</small>
              <strong>Venemergencia / Salud Chacao · Prioridad Roquedal</strong>
            </div>
          </div>
        )}

        {/* ==========================================
            PESTAÑAS INTERNAS DEL MODAL DE ENFERMERÍA
            ========================================== */}
        <div className="domus-nur-tabs-bar">
          <div className="domus-nur-tabs">
            <button
              className={`domus-nur-tab ${activeTab === 'SIGNOS' ? 'active' : ''}`}
              onClick={() => setActiveTab('SIGNOS')}
            >
              <Activity size={16} />
              <span>1. Signos Vitales y Telemetría</span>
            </button>
            <button
              className={`domus-nur-tab ${activeTab === 'KARDEX' ? 'active' : ''}`}
              onClick={() => setActiveTab('KARDEX')}
            >
              <ClipboardCheck size={16} />
              <span>2. Kardex de Medicación ({completedMedsCount}/{meds.length})</span>
              {lowMedStock.length > 0 && <i className="domus-nur-dot-coral"></i>}
            </button>
            <button
              className={`domus-nur-tab ${activeTab === 'CUIDADOS' ? 'active' : ''}`}
              onClick={() => setActiveTab('CUIDADOS')}
            >
              <Droplets size={16} />
              <span>3. Dieta, Hidratación y Postura</span>
            </button>
            <button
              className={`domus-nur-tab ${activeTab === 'GUARDIA' ? 'active' : ''}`}
              onClick={() => setActiveTab('GUARDIA')}
            >
              <FileSignature size={16} />
              <span>4. Entrega de Guardia y Bitácora</span>
            </button>
          </div>

          <div className="domus-nur-nurse-badge">
            <Users size={14} color="#5E7AC6" />
            <span>En turno: <strong>Lic. Carmen Valero</strong></span>
          </div>
        </div>

        {/* ==========================================
            CUERPO DEL MODAL SEGÚN PESTAÑA ACTIVA
            ========================================== */}
        <div className="domus-nur-body printable-report-area">

          {/* VISTA 1: SIGNOS VITALES Y TELEMETRÍA */}
          {activeTab === 'SIGNOS' && (
            <div className="domus-nur-split">
              <div className="domus-nur-left-stack">
                <div className="domus-nur-vitals-grid">
                  <div className="domus-nur-vital-card primary">
                    <div className="domus-nur-vital-head">
                      <span>PRESIÓN ARTERIAL</span>
                      <i className="domus-tag-ok">Óptima</i>
                    </div>
                    <strong>{latestReading.sys}/{latestReading.dia} <small>mmHg</small></strong>
                    <p> PAM: {Math.round((latestReading.sys + 2 * latestReading.dia) / 3)} mmHg · Tomada {latestReading.time}</p>
                  </div>

                  <div className="domus-nur-vital-card">
                    <div className="domus-nur-vital-head">
                      <span>FRECUENCIA CARDÍACA</span>
                      <Activity size={16} color="#5E7AC6" />
                    </div>
                    <strong>{latestReading.bpm} <small>BPM</small></strong>
                    <p>Ritmo sinusal regular en reposo</p>
                  </div>

                  <div className="domus-nur-vital-card">
                    <div className="domus-nur-vital-head">
                      <span>SATURACIÓN OXÍGENO</span>
                      <Droplets size={16} color="#10B981" />
                    </div>
                    <strong>{latestReading.spo2}% <small>SpO2</small></strong>
                    <p>Aire ambiente · Ventilación limpia</p>
                  </div>

                  <div className="domus-nur-vital-card">
                    <div className="domus-nur-vital-head">
                      <span>GLUCEMIA CAPILAR</span>
                      <Sparkles size={16} color="#BE7AC6" />
                    </div>
                    <strong>{latestReading.glu} <small>mg/dL</small></strong>
                    <p>Meta geriátrica: 85 - 130 mg/dL</p>
                  </div>

                  <div className="domus-nur-vital-card">
                    <div className="domus-nur-vital-head">
                      <span>TEMPERATURA</span>
                      <Thermometer size={16} color="#EE6B5F" />
                    </div>
                    <strong>{latestReading.temp} <small>°C</small></strong>
                    <p>Afebril · Confort térmico 22°C</p>
                  </div>
                </div>

                <div className="domus-nur-panel-card">
                  <div className="domus-nur-card-head">
                    <div>
                      <h3>Curva Hemodinámica de las Últimas 24 Horas</h3>
                      <p>Evolución de Presión Sistólica, Diastólica y Pulso por cada control de enfermería</p>
                    </div>
                    <span className="domus-nur-badge-soft">Rango Meta: 110/70 - 130/85</span>
                  </div>

                  <div className="domus-nur-chart-bars">
                    {readings.map((r) => {
                      const sysHeight = Math.min(100, Math.round((r.sys / 160) * 100));
                      const diaHeight = Math.min(100, Math.round((r.dia / 160) * 100));
                      return (
                        <div key={r.id} className="domus-nur-chart-col">
                          <div className="domus-nur-chart-tooltip">
                            <strong>{r.sys}/{r.dia} mmHg</strong>
                            <span>Pulso: {r.bpm} BPM · SpO2: {r.spo2}%</span>
                          </div>
                          <div className="domus-nur-dual-bar">
                            <div className="domus-bar-sys" style={{ height: `${sysHeight}%` }}>
                              <span>{r.sys}</span>
                            </div>
                            <div className="domus-bar-dia" style={{ height: `${diaHeight}%` }}>
                              <span>{r.dia}</span>
                            </div>
                          </div>
                          <strong className="domus-nur-chart-time">{r.time}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <form className="domus-nur-panel-card domus-nur-form-panel" onSubmit={handleRecordVitals}>
                <h3>Registrar Toma de Signos Ahora</h3>
                <p className="domus-nur-sub">
                  Ajuste los valores con los botones táctiles y presione guardar. Quedará asentado en la curva y bitácora.
                </p>

                <div className="domus-nur-stepper-grid">
                  <div className="domus-nur-stepper-box">
                    <label>Sistólica (mmHg)</label>
                    <div className="domus-nur-stepper">
                      <button type="button" onClick={() => setNewSys(newSys - 2)}><Minus size={14} /></button>
                      <strong>{newSys}</strong>
                      <button type="button" onClick={() => setNewSys(newSys + 2)}><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="domus-nur-stepper-box">
                    <label>Diastólica (mmHg)</label>
                    <div className="domus-nur-stepper">
                      <button type="button" onClick={() => setNewDia(newDia - 2)}><Minus size={14} /></button>
                      <strong>{newDia}</strong>
                      <button type="button" onClick={() => setNewDia(newDia + 2)}><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="domus-nur-stepper-box">
                    <label>Pulso (BPM)</label>
                    <div className="domus-nur-stepper">
                      <button type="button" onClick={() => setNewBpm(newBpm - 1)}><Minus size={14} /></button>
                      <strong>{newBpm}</strong>
                      <button type="button" onClick={() => setNewBpm(newBpm + 1)}><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="domus-nur-stepper-box">
                    <label>Oxígeno (SpO2 %)</label>
                    <div className="domus-nur-stepper">
                      <button type="button" onClick={() => setNewSpo2(Math.max(85, newSpo2 - 1))}><Minus size={14} /></button>
                      <strong>{newSpo2}%</strong>
                      <button type="button" onClick={() => setNewSpo2(Math.min(100, newSpo2 + 1))}><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="domus-nur-stepper-box">
                    <label>Glucemia (mg/dL)</label>
                    <div className="domus-nur-stepper">
                      <button type="button" onClick={() => setNewGlu(newGlu - 2)}><Minus size={14} /></button>
                      <strong>{newGlu}</strong>
                      <button type="button" onClick={() => setNewGlu(newGlu + 2)}><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="domus-nur-stepper-box">
                    <label>Temperatura (°C)</label>
                    <div className="domus-nur-stepper">
                      <button type="button" onClick={() => setNewTemp(Number((newTemp - 0.1).toFixed(1)))}><Minus size={14} /></button>
                      <strong>{newTemp}°</strong>
                      <button type="button" onClick={() => setNewTemp(Number((newTemp + 0.1).toFixed(1)))}><Plus size={14} /></button>
                    </div>
                  </div>
                </div>

                {vitalSavedToast ? (
                  <div className="domus-nur-toast-ok">
                    <CheckCircle2 size={20} />
                    <span>¡Signos vitales registrados y curva actualizada!</span>
                  </div>
                ) : (
                  <button type="submit" className="domus-nur-submit-btn">
                    <HeartPulse size={17} />
                    <span>GUARDAR TOMA EN HISTORIA CLÍNICA</span>
                  </button>
                )}
              </form>
            </div>
          )}

          {/* VISTA 2: KARDEX DE MEDICACIÓN (eMAR) */}
          {activeTab === 'KARDEX' && (
            <>
              <div className="domus-nur-slot-pills">
                {[
                  { id: 'TODOS', label: 'Todo el Día' },
                  { id: 'MAÑANA', label: 'Mañana (07:30 - 09:00)' },
                  { id: 'MEDIODÍA', label: 'Mediodía (12:30 PM)' },
                  { id: 'TARDE', label: 'Tarde (05:00 PM)' },
                  { id: 'NOCHE', label: 'Noche (08:30 - 09:30)' },
                  { id: 'SOS', label: 'SOS / Rescate' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setMedSlotFilter(s.id)}
                    className={`domus-nur-slot-pill ${medSlotFilter === s.id ? 'active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="domus-nur-meds-grid">
                {filteredMeds.map((med) => {
                  const isLow = med.stock <= med.minStock;
                  return (
                    <div
                      key={med.id}
                      className={`domus-nur-med-card ${med.done ? 'done' : ''} ${isLow ? 'low-stock' : ''}`}
                      onClick={() => toggleMedication(med.id)}
                    >
                      <div className="domus-nur-med-top">
                        <span className="domus-nur-med-time">{med.time} · {med.slot}</span>
                        <span className={`domus-nur-med-stock ${isLow ? 'low' : ''}`}>
                          {isLow ? `Stock Bajo: ${med.stock} unid` : `Botiquín: ${med.stock} unid`}
                        </span>
                      </div>

                      <div className="domus-nur-med-main">
                        <div className="domus-nur-med-check">
                          {med.done && <Check size={16} />}
                        </div>
                        <div>
                          <h4>{med.name}</h4>
                          <strong>Dosis: {med.dose}</strong>
                          <p>{med.rule}</p>
                        </div>
                      </div>

                      <div className="domus-nur-med-footer">
                        {med.done ? (
                          <span className="domus-nur-signed">
                            <CheckCircle2 size={13} color="#10B981" /> Administrado ({med.signedBy})
                          </span>
                        ) : (
                          <span className="domus-nur-pending">
                            Toque para confirmar administración y descontar del stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* VISTA 3: DIETA, HIDRATACIÓN Y POSTURA */}
          {activeTab === 'CUIDADOS' && (
            <div className="domus-nur-split">
              <div className="domus-nur-left-stack">
                <div className="domus-nur-panel-card">
                  <div className="domus-nur-card-head">
                    <div>
                      <h3>Balance de Hidratación Diaria</h3>
                      <p>Suma de agua, infusiones, caldos y gelatinas administradas hoy</p>
                    </div>
                    <strong className="domus-nur-hydro-val">{hydrationMl} / {hydrationGoal} ml</strong>
                  </div>

                  <div className="domus-nur-hydro-bar">
                    <div
                      className="domus-nur-hydro-fill"
                      style={{ width: `${Math.min(100, Math.round((hydrationMl / hydrationGoal) * 100))}%` }}
                    ></div>
                  </div>

                  <div className="domus-nur-hydro-btns">
                    <button type="button" onClick={() => addHydration(150)}>+150 ml Vaso Agua</button>
                    <button type="button" onClick={() => addHydration(200)}>+200 ml Infusión / Té</button>
                    <button type="button" onClick={() => addHydration(250)}>+250 ml Caldo / Sopa</button>
                    <button type="button" onClick={() => setHydrationMl(Math.max(0, hydrationMl - 150))} className="reset">- Corregir</button>
                  </div>
                </div>

                <div className="domus-nur-panel-card">
                  <div className="domus-nur-card-head">
                    <div>
                      <h3>Enlace Nutricional con Cocina & Despensa</h3>
                      <p>Toque cada comida para cambiar el porcentaje ingerido por el Dr. Jiménez</p>
                    </div>
                    <button
                      type="button"
                      className="domus-nur-kitchen-btn"
                      onClick={() => {
                        setKitchenOrderToast(true);
                        setTimeout(() => setKitchenOrderToast(false), 2600);
                      }}
                    >
                      <Coffee size={14} />
                      <span>Solicitar Merienda / Infusión a Cocina</span>
                    </button>
                  </div>

                  {kitchenOrderToast && (
                    <div className="domus-nur-toast-ok" style={{ marginBottom: 12 }}>
                      <CheckCircle2 size={18} />
                      <span>Aviso enviado a la pantalla de Cocina: Preparar infusión tibia para Suite Principal.</span>
                    </div>
                  )}

                  <div className="domus-nur-meals-list">
                    {meals.map((m) => (
                      <div key={m.id} className="domus-nur-meal-row" onClick={() => cycleMealIntake(m.id)}>
                        <div className="domus-nur-meal-info">
                          <strong>{m.meal}</strong>
                          <span>{m.menu}</span>
                          <small>{m.note}</small>
                        </div>
                        <div className={`domus-nur-intake-badge pct-${m.intake}`}>
                          <strong>{m.intake === 0 ? 'Pendiente' : `${m.intake}%`}</strong>
                          <small>{m.intake === 0 ? 'Toque al servir' : 'Ingerido'}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="domus-nur-panel-card">
                <h3>Posición Actual y Prevención de Escaras</h3>
                <p className="domus-nur-sub">
                  Seleccione la postura actual del paciente para reiniciar el cronómetro de rotación de 2 horas.
                </p>

                <div className="domus-nur-posture-grid">
                  {[
                    'Sedestación en Sillón Reclinable',
                    'Decúbito Supino (Boca Arriba · 30°)',
                    'Decúbito Lateral Derecho',
                    'Decúbito Lateral Izquierdo'
                  ].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => {
                        setCurrentPosture(pos);
                        setLastPostureTime('Recién actualizado');
                      }}
                      className={`domus-nur-posture-btn ${currentPosture === pos ? 'active' : ''}`}
                    >
                      <strong>{pos}</strong>
                      <span>{currentPosture === pos ? `Activa (${lastPostureTime})` : 'Cambiar a esta postura'}</span>
                    </button>
                  ))}
                </div>

                <h3 style={{ marginTop: 22 }}>Protocolo Diario de Higiene y Fisioterapia</h3>
                <div className="domus-nur-routines-stack">
                  {routines.map((rt) => (
                    <div
                      key={rt.id}
                      className={`domus-nur-routine-row ${rt.done ? 'done' : ''}`}
                      onClick={() => toggleRoutine(rt.id)}
                    >
                      <div className="domus-nur-med-check">
                        {rt.done && <Check size={14} />}
                      </div>
                      <div className="domus-nur-routine-info">
                        <strong>{rt.title}</strong>
                        <small>{rt.category} · Programado: {rt.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VISTA 4: ENTREGA DE GUARDIA Y BITÁCORA */}
          {activeTab === 'GUARDIA' && (
            <div className="domus-nur-split">
              <form className="domus-nur-panel-card" onSubmit={handleSignHandover}>
                <h3>Acta Digital de Entrega de Guardia</h3>
                <p className="domus-nur-sub">
                  Formalice el cambio de turno dejando constancia de novedades médicas, sueño, estado anímico y fármacos pendientes.
                </p>

                <label className="domus-nur-label">Enfermera que Entrega el Turno</label>
                <input
                  type="text"
                  value={outgoingNurse}
                  onChange={(e) => setOutgoingNurse(e.target.value)}
                  className="domus-nur-input"
                />

                <label className="domus-nur-label">Enfermera que Recibe la Guardia</label>
                <input
                  type="text"
                  value={incomingNurse}
                  onChange={(e) => setIncomingNurse(e.target.value)}
                  className="domus-nur-input"
                />

                <label className="domus-nur-label">Evolución Clínica y Novedades del Turno</label>
                <textarea
                  rows={4}
                  placeholder="Describa cómo pasó el turno el Dr. Jiménez, calidad del descanso, estado de ánimo y recomendaciones para la guardia entrante..."
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  className="domus-nur-textarea"
                />

                {handoverSigned ? (
                  <div className="domus-nur-toast-ok">
                    <CheckCircle2 size={20} />
                    <span>¡Entrega de guardia firmada y notificada a Sra. Belkys!</span>
                  </div>
                ) : (
                  <button type="submit" className="domus-nur-submit-btn">
                    <FileSignature size={17} />
                    <span>FIRMAR Y CERRAR ENTREGA DE GUARDIA</span>
                  </button>
                )}
              </form>

              <div className="domus-nur-panel-card">
                <div className="domus-nur-card-head">
                  <div>
                    <h3>Bitácora Cronológica de Enfermería</h3>
                    <p>Historial inalterable con sello de hora para auditoría médica y familiar</p>
                  </div>
                </div>

                <div className="domus-nur-notes-stack">
                  {notes.map((n) => (
                    <div key={n.id} className="domus-nur-note-card">
                      <div className="domus-nur-note-top">
                        <span className="domus-nur-note-tag">{n.tag}</span>
                        <span className="domus-nur-note-time">{n.time}</span>
                      </div>
                      <strong>{n.nurse}</strong>
                      <p>{n.text}</p>
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
        <footer className="domus-nur-footer">
          <span>Sincronizado con Cocina, Alacena de Farmacia y Panel Principal de Casa Roquedal</span>
          <button className="domus-nur-close-btn" onClick={onClose}>
            VOLVER AL PANEL PRINCIPAL
          </button>
        </footer>

        {/* ==========================================
            HOJA DE ESTILOS AISLADA + REGLAS DE IMPRESIÓN (PDF CLÍNICO)
            ========================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          .domus-nur-overlay {
            position: fixed; inset: 0; z-index: 190;
            background: rgba(18, 22, 36, 0.58);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            animation: domusNurFade 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 768px) {
            .domus-nur-overlay { padding: 24px; }
          }
          @keyframes domusNurFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-nur-modal {
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
            .domus-nur-modal {
              height: 90vh;
              border-radius: 36px;
            }
          }

          .domus-nur-watermark {
            position: absolute; right: -40px; bottom: 40px;
            width: 280px; height: 280px; object-fit: contain;
            opacity: 0.04; pointer-events: none; z-index: 0;
          }

          /* HEADER */
          .domus-nur-header {
            position: relative; z-index: 2;
            padding: 16px 18px 14px;
            background: rgba(255, 255, 255, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-nur-header { padding: 20px 32px 18px; }
          }
          .domus-nur-patient-profile {
            display: flex; align-items: center; gap: 14px;
          }
          .domus-nur-avatar {
            position: relative;
            width: 50px; height: 50px; border-radius: 16px;
            background: linear-gradient(135deg, #5E7AC6 0%, #EE6B5F 100%);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.3);
            flex-shrink: 0;
          }
          .domus-nur-online {
            position: absolute; bottom: -2px; right: -2px;
            width: 13px; height: 13px; border-radius: 50%;
            background: #10B981; border: 2.5px solid #fff;
          }
          .domus-nur-eyebrow {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
            margin-bottom: 3px;
          }
          .domus-nur-patient-profile h2 {
            font-size: clamp(18px, 2.4vw, 26px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
            display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px;
          }
          .domus-nur-patient-profile h2 small {
            font-size: 12px; font-weight: 800; color: #666;
            background: rgba(0,0,0,0.05); padding: 3px 10px; border-radius: 99px;
          }

          .domus-nur-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-nur-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 7px 14px; border-radius: 15px;
          }
          @media (min-width: 680px) { .domus-nur-kpi { display: flex; } }
          .domus-nur-kpi small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080; }
          .domus-nur-kpi strong { font-size: 13px; font-weight: 900; color: #059669; }

          .domus-nur-pdf-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 99px;
            border: 1.5px solid rgba(94, 122, 198, 0.45);
            background: rgba(94, 122, 198, 0.12);
            color: #5E7AC6; font-size: 11px; font-weight: 900;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-nur-pdf-btn:hover {
            background: #5E7AC6; color: #fff;
            box-shadow: 0 6px 18px rgba(94, 122, 198, 0.35);
          }

          .domus-nur-sos-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 99px;
            border: 1.5px solid rgba(238, 107, 95, 0.45);
            background: rgba(238, 107, 95, 0.12);
            color: #EE6B5F; font-size: 11px; font-weight: 900;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-nur-sos-btn:hover, .domus-nur-sos-btn.active {
            background: #EE6B5F; color: #fff;
            box-shadow: 0 6px 18px rgba(238, 107, 95, 0.35);
          }

          .domus-nur-close {
            width: 40px; height: 40px; border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.08);
            background: #fff; color: #202020;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-nur-close:hover {
            background: #EE6B5F; color: #fff; border-color: #EE6B5F; transform: rotate(90deg);
          }

          .domus-nur-sos-banner {
            position: relative; z-index: 2;
            background: linear-gradient(90deg, #EE6B5F 0%, #D94E41 100%);
            color: #fff; padding: 14px 28px;
            display: grid; grid-template-columns: 1fr; gap: 12px;
          }
          @media (min-width: 860px) {
            .domus-nur-sos-banner { grid-template-columns: repeat(4, 1fr); }
          }
          .domus-nur-sos-col small {
            display: block; font-size: 9px; font-weight: 900;
            letter-spacing: 0.1em; color: rgba(255,255,255,0.8); margin-bottom: 2px;
          }
          .domus-nur-sos-col strong { font-size: 12px; font-weight: 900; }

          .domus-nur-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.48);
            border-bottom: 1px solid rgba(255, 255, 255, 0.85);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-nur-tabs-bar { padding: 14px 32px; } }
          .domus-nur-tabs {
            display: flex; gap: 8px; overflow-x: auto; max-width: 100%; padding-bottom: 2px;
          }
          .domus-nur-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 16px; border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.7);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer; transition: all 0.22s ease;
          }
          .domus-nur-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-nur-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }
          .domus-nur-dot-coral {
            width: 8px; height: 8px; border-radius: 50%; background: #EE6B5F;
          }
          .domus-nur-nurse-badge {
            display: none; align-items: center; gap: 6px;
            background: rgba(255, 255, 255, 0.85);
            padding: 7px 14px; border-radius: 99px;
            font-size: 11.5px; color: #555;
          }
          @media (min-width: 1100px) { .domus-nur-nurse-badge { display: inline-flex; } }

          .domus-nur-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
          }
          @media (min-width: 768px) { .domus-nur-body { padding: 24px 32px; } }

          .domus-nur-split {
            display: grid; grid-template-columns: 1fr; gap: 20px;
          }
          @media (min-width: 1024px) {
            .domus-nur-split { grid-template-columns: 1.45fr 1fr; }
          }
          .domus-nur-left-stack {
            display: flex; flex-direction: column; gap: 20px;
          }

          .domus-nur-vitals-grid {
            display: grid; grid-template-columns: 1fr; gap: 12px;
          }
          @media (min-width: 560px) {
            .domus-nur-vitals-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 840px) {
            .domus-nur-vitals-grid { grid-template-columns: repeat(3, 1fr); }
          }
          .domus-nur-vital-card {
            background: rgba(255, 255, 255, 0.82);
            border: 1.5px solid #fff;
            border-radius: 22px; padding: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.03);
            display: flex; flex-direction: column; gap: 4px;
          }
          .domus-nur-vital-card.primary {
            background: linear-gradient(135deg, #5E7AC6 0%, #4864B0 100%);
            color: #fff; border-color: rgba(255,255,255,0.3);
          }
          .domus-nur-vital-head {
            display: flex; align-items: center; justify-content: space-between;
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.09em; color: #808080;
          }
          .domus-nur-vital-card.primary .domus-nur-vital-head { color: rgba(255,255,255,0.85); }
          .domus-tag-ok {
            font-style: normal; background: rgba(255,255,255,0.22);
            color: #fff; padding: 2px 8px; border-radius: 99px; font-size: 9px;
          }
          .domus-nur-vital-card strong {
            font-size: 24px; font-weight: 900; letter-spacing: -0.03em; color: #202020;
          }
          .domus-nur-vital-card.primary strong { color: #fff; }
          .domus-nur-vital-card strong small { font-size: 12px; font-weight: 700; opacity: 0.8; }
          .domus-nur-vital-card p {
            margin: 0; font-size: 11px; font-weight: 600; color: #666;
          }
          .domus-nur-vital-card.primary p { color: rgba(255,255,255,0.85); }

          .domus-nur-panel-card {
            background: rgba(255, 255, 255, 0.82);
            border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          }
          .domus-nur-card-head {
            display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between;
            gap: 10px; margin-bottom: 18px;
          }
          .domus-nur-panel-card h3 { margin: 0 0 4px; font-size: 17.5px; font-weight: 900; color: #202020; }
          .domus-nur-card-head p, .domus-nur-sub { margin: 0 0 14px; font-size: 12px; color: #666; line-height: 1.4; }
          .domus-nur-badge-soft {
            background: rgba(16, 185, 129, 0.14); color: #059669;
            padding: 5px 12px; border-radius: 99px; font-size: 11px; font-weight: 900;
          }

          .domus-nur-chart-bars {
            display: flex; align-items: flex-end; justify-content: space-between;
            height: 160px; gap: 10px; padding-top: 24px;
          }
          .domus-nur-chart-col {
            flex: 1; height: 100%; display: flex; flex-direction: column;
            align-items: center; justify-content: flex-end; gap: 8px;
            position: relative; cursor: pointer;
          }
          .domus-nur-chart-tooltip {
            position: absolute; top: -36px;
            background: #202020; color: #fff;
            padding: 5px 10px; border-radius: 10px;
            font-size: 10px; display: flex; flex-direction: column; align-items: center;
            opacity: 0; pointer-events: none; transition: opacity 0.2s ease; white-space: nowrap;
            z-index: 10;
          }
          .domus-nur-chart-col:hover .domus-nur-chart-tooltip { opacity: 1; }
          .domus-nur-dual-bar {
            width: 100%; max-width: 48px; height: 120px;
            background: rgba(94, 122, 198, 0.08);
            border-radius: 14px; padding: 4px;
            display: flex; align-items: flex-end; justify-content: center; gap: 4px;
          }
          .domus-bar-sys {
            flex: 1; background: linear-gradient(180deg, #EE6B5F 0%, #5E7AC6 100%);
            border-radius: 8px; display: flex; align-items: flex-start; justify-content: center;
            transition: height 0.35s ease;
          }
          .domus-bar-dia {
            flex: 1; background: rgba(94, 122, 198, 0.45);
            border-radius: 8px; display: flex; align-items: flex-start; justify-content: center;
            transition: height 0.35s ease;
          }
          .domus-bar-sys span, .domus-bar-dia span {
            font-size: 8.5px; font-weight: 900; color: #fff; margin-top: 4px;
          }
          .domus-nur-chart-time { font-size: 10px; font-weight: 800; color: #666; }

          .domus-nur-stepper-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;
          }
          .domus-nur-stepper-box {
            background: #F5F7FB; padding: 10px 12px; border-radius: 16px;
            border: 1px solid rgba(0,0,0,0.05);
          }
          .domus-nur-stepper-box label {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; color: #666; margin-bottom: 6px;
          }
          .domus-nur-stepper {
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-nur-stepper button {
            width: 30px; height: 30px; border-radius: 9px; border: none;
            background: #fff; color: #202020; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          }
          .domus-nur-stepper button:hover { background: #5E7AC6; color: #fff; }
          .domus-nur-stepper strong { font-size: 16px; font-weight: 900; color: #202020; }

          .domus-nur-submit-btn {
            width: 100%; padding: 15px; border: none; border-radius: 16px;
            background: #5E7AC6; color: #fff;
            font-size: 12px; font-weight: 900; letter-spacing: 0.08em;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer; box-shadow: 0 10px 24px rgba(94, 122, 198, 0.35);
            transition: all 0.2s ease;
          }
          .domus-nur-submit-btn:hover { background: #4864B0; transform: translateY(-2px); }

          .domus-nur-toast-ok {
            padding: 12px 14px; border-radius: 14px;
            background: rgba(16, 185, 129, 0.15); color: #065F46;
            font-size: 12px; font-weight: 800;
            display: flex; align-items: center; gap: 10px;
          }

          .domus-nur-slot-pills {
            display: flex; gap: 8px; overflow-x: auto; margin-bottom: 18px; padding-bottom: 4px;
          }
          .domus-nur-slot-pill {
            padding: 8px 15px; border-radius: 99px;
            border: 1px solid rgba(255,255,255,0.9);
            background: rgba(255,255,255,0.68);
            font-size: 11px; font-weight: 800; color: #555;
            cursor: pointer; white-space: nowrap;
          }
          .domus-nur-slot-pill.active { background: #202020; color: #fff; border-color: #202020; }

          .domus-nur-meds-grid {
            display: grid; grid-template-columns: 1fr; gap: 14px;
          }
          @media (min-width: 680px) { .domus-nur-meds-grid { grid-template-columns: repeat(2, 1fr); } }

          .domus-nur-med-card {
            background: rgba(255, 255, 255, 0.85);
            border: 1.5px solid #fff;
            border-radius: 22px; padding: 18px;
            cursor: pointer; transition: all 0.22s ease;
            display: flex; flex-direction: column; justify-content: space-between; gap: 12px;
          }
          .domus-nur-med-card:hover {
            transform: translateY(-3px); background: #fff;
            box-shadow: 0 12px 28px rgba(94, 122, 198, 0.14);
          }
          .domus-nur-med-card.done { opacity: 0.78; background: rgba(255,255,255,0.65); }
          .domus-nur-med-card.low-stock { border-color: rgba(238, 107, 95, 0.45); }

          .domus-nur-med-top {
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-nur-med-time {
            font-size: 10px; font-weight: 900; color: #5E7AC6;
            background: rgba(94, 122, 198, 0.12); padding: 4px 10px; border-radius: 99px;
          }
          .domus-nur-med-stock {
            font-size: 10px; font-weight: 800; color: #666;
          }
          .domus-nur-med-stock.low {
            color: #EE6B5F; background: rgba(238, 107, 95, 0.14);
            padding: 3px 9px; border-radius: 99px; font-weight: 900;
          }

          .domus-nur-med-main { display: flex; align-items: flex-start; gap: 12px; }
          .domus-nur-med-check {
            width: 24px; height: 24px; border-radius: 8px;
            border: 2px solid #5E7AC6; background: #fff; color: #fff;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            margin-top: 2px;
          }
          .domus-nur-med-card.done .domus-nur-med-check,
          .domus-nur-routine-row.done .domus-nur-med-check {
            background: #5E7AC6;
          }
          .domus-nur-med-main h4 { margin: 0 0 2px; font-size: 15.5px; font-weight: 900; color: #202020; }
          .domus-nur-med-main strong { font-size: 12px; color: #5E7AC6; display: block; margin-bottom: 4px; }
          .domus-nur-med-main p { margin: 0; font-size: 11.5px; color: #666; }

          .domus-nur-med-footer {
            padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.05);
            font-size: 11px; font-weight: 700;
          }
          .domus-nur-signed { display: flex; align-items: center; gap: 6px; color: #059669; }
          .domus-nur-pending { color: #888; }

          .domus-nur-hydro-val { font-size: 20px; font-weight: 900; color: #5E7AC6; }
          .domus-nur-hydro-bar {
            width: 100%; height: 12px; border-radius: 99px;
            background: rgba(94, 122, 198, 0.12); overflow: hidden; margin-bottom: 14px;
          }
          .domus-nur-hydro-fill {
            height: 100%; background: linear-gradient(90deg, #5E7AC6, #34D399);
            border-radius: 99px; transition: width 0.35s ease;
          }
          .domus-nur-hydro-btns {
            display: flex; flex-wrap: wrap; gap: 8px;
          }
          .domus-nur-hydro-btns button {
            padding: 8px 13px; border-radius: 12px;
            border: 1px solid rgba(94, 122, 198, 0.25);
            background: #F5F7FB; color: #5E7AC6;
            font-size: 11px; font-weight: 800; cursor: pointer;
          }
          .domus-nur-hydro-btns button:hover { background: #5E7AC6; color: #fff; }
          .domus-nur-hydro-btns button.reset { color: #888; border-color: rgba(0,0,0,0.1); }

          .domus-nur-kitchen-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 14px; border-radius: 12px; border: none;
            background: #EE6B5F; color: #fff;
            font-size: 11px; font-weight: 900; cursor: pointer;
          }
          .domus-nur-meals-list { display: flex; flex-direction: column; gap: 10px; }
          .domus-nur-meal-row {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            padding: 12px 14px; border-radius: 16px;
            background: #F7F9FC; cursor: pointer; transition: all 0.2s ease;
          }
          .domus-nur-meal-row:hover { background: #fff; transform: translateX(4px); }
          .domus-nur-meal-info { display: flex; flex-direction: column; gap: 2px; }
          .domus-nur-meal-info strong { font-size: 13px; font-weight: 900; color: #202020; }
          .domus-nur-meal-info span { font-size: 11.5px; color: #555; font-weight: 600; }
          .domus-nur-meal-info small { font-size: 10.5px; color: #888; }

          .domus-nur-intake-badge {
            padding: 6px 12px; border-radius: 12px; text-align: center; min-width: 74px;
            background: rgba(0,0,0,0.05);
          }
          .domus-nur-intake-badge.pct-100, .domus-nur-intake-badge.pct-75 {
            background: rgba(16, 185, 129, 0.15); color: #059669;
          }
          .domus-nur-intake-badge.pct-50, .domus-nur-intake-badge.pct-25 {
            background: rgba(245, 158, 11, 0.18); color: #B45309;
          }
          .domus-nur-intake-badge strong { display: block; font-size: 13px; font-weight: 900; }
          .domus-nur-intake-badge small { font-size: 9px; font-weight: 800; }

          .domus-nur-posture-grid {
            display: grid; grid-template-columns: 1fr; gap: 8px;
          }
          .domus-nur-posture-btn {
            text-align: left; padding: 11px 14px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.08); background: #F7F9FC;
            cursor: pointer; display: flex; align-items: center; justify-content: space-between;
          }
          .domus-nur-posture-btn strong { font-size: 12px; font-weight: 800; color: #202020; }
          .domus-nur-posture-btn span { font-size: 10.5px; font-weight: 700; color: #666; }
          .domus-nur-posture-btn.active {
            background: #5E7AC6; border-color: #5E7AC6;
          }
          .domus-nur-posture-btn.active strong, .domus-nur-posture-btn.active span { color: #fff; }

          .domus-nur-routines-stack {
            display: flex; flex-direction: column; gap: 8px; margin-top: 10px;
          }
          .domus-nur-routine-row {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-radius: 14px; background: #F7F9FC;
            cursor: pointer;
          }
          .domus-nur-routine-row.done { opacity: 0.68; }
          .domus-nur-routine-info { display: flex; flex-direction: column; }
          .domus-nur-routine-info strong { font-size: 12px; font-weight: 800; color: #202020; }
          .domus-nur-routine-info small { font-size: 10px; color: #666; font-weight: 600; }

          .domus-nur-label {
            display: block; font-size: 10px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.08em; color: #5E7AC6;
            margin: 12px 0 5px;
          }
          .domus-nur-input, .domus-nur-textarea {
            width: 100%; box-sizing: border-box;
            padding: 11px 13px; border-radius: 13px;
            border: 1px solid rgba(0,0,0,0.1); background: #F7F9FC;
            font-size: 12.5px; font-weight: 600; color: #202020;
            font-family: inherit; outline: none;
          }
          .domus-nur-notes-stack { display: flex; flex-direction: column; gap: 12px; }
          .domus-nur-note-card {
            padding: 14px 16px; border-radius: 16px; background: #F7F9FC;
            border-left: 4px solid #5E7AC6;
          }
          .domus-nur-note-top {
            display: flex; justify-content: space-between; margin-bottom: 4px;
          }
          .domus-nur-note-tag {
            font-size: 9.5px; font-weight: 900; text-transform: uppercase; color: #5E7AC6;
          }
          .domus-nur-note-time { font-size: 10.5px; font-weight: 800; color: #888; }
          .domus-nur-note-card strong { display: block; font-size: 12.5px; color: #202020; margin-bottom: 4px; }
          .domus-nur-note-card p { margin: 0; font-size: 12px; color: #555; line-height: 1.45; }

          .domus-nur-footer {
            position: relative; z-index: 2;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.78);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px; font-size: 11px; font-weight: 700; color: #666;
          }
          .domus-nur-close-btn {
            padding: 11px 18px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.12); background: #fff;
            font-size: 11px; font-weight: 900; color: #202020; cursor: pointer;
          }

          /* REGLAS DE IMPRESIÓN / EXPORTACIÓN A PDF CLÍNICO */
          @media print {
            body { background: #fff !important; }
            .domus-bg-canvas, .domus-navbar, .domus-mobile-bottom-nav, .domus-footer, .domus-nur-header button, .domus-nur-tabs-bar, .domus-nur-footer, form.domus-nur-form-panel {
              display: none !important;
            }
            .domus-nur-overlay {
              position: static !important; background: none !important; backdrop-filter: none !important; padding: 0 !important;
            }
            .domus-nur-modal {
              height: auto !important; max-width: 100% !important; box-shadow: none !important; border: none !important; background: #fff !important;
            }
            .domus-nur-body { overflow: visible !important; }
            .domus-nur-split { display: block !important; }
            .domus-nur-panel-card { break-inside: avoid; margin-bottom: 20px; border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; }
          }
        `}} />
      </div>
    </div>
  );
}