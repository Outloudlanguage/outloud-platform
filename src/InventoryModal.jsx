import React, { useState, useMemo } from 'react';
import {
  X, Search, Plus, Minus, ShoppingBag, AlertCircle, CheckCircle2,
  Package, Scale, Sparkles, Check, Send, FileText, ArrowUpRight,
  Clock, Filter, Layers
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

const INITIAL_ITEMS = [
  {
    id: 'inv-1',
    name: 'Lomito de Res Madurado',
    category: 'Proteínas',
    location: 'Congelador Principal · Gaveta 1',
    current: 6.5,
    min: 4.0,
    max: 10.0,
    unit: 'kg',
    updated: 'Hoy, 08:30 AM',
    img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-2',
    name: 'Filete de Mero Fresco',
    category: 'Proteínas',
    location: 'Congelador Principal · Gaveta 2',
    current: 1.2,
    min: 3.0,
    max: 6.0,
    unit: 'kg',
    updated: 'Hoy, 12:15 PM',
    img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-3',
    name: 'Pechuga de Pollo Orgánico',
    category: 'Proteínas',
    location: 'Nevera Industrial · Nivel 2',
    current: 5.0,
    min: 3.0,
    max: 8.0,
    unit: 'kg',
    updated: 'Ayer, 06:00 PM',
    img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-4',
    name: 'Aceite de Oliva Extra Virgen',
    category: 'Despensa',
    location: 'Alacena Central · Estante A',
    current: 1.0,
    min: 3.0,
    max: 8.0,
    unit: 'L',
    updated: 'Hoy, 09:10 AM',
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-5',
    name: 'Queso Parmesano Reggiano',
    category: 'Lácteos',
    location: 'Nevera Gourmet · Puerta Derecha',
    current: 1.8,
    min: 1.0,
    max: 3.0,
    unit: 'kg',
    updated: 'Ayer, 04:20 PM',
    img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-6',
    name: 'Leche Deslactosada Almendras',
    category: 'Lácteos',
    location: 'Alacena Fría · Nivel 1',
    current: 2.0,
    min: 4.0,
    max: 12.0,
    unit: 'unid',
    updated: 'Hoy, 07:45 AM',
    img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-7',
    name: 'Detergente Hipoalergénico Neutro',
    category: 'Limpieza',
    location: 'Cuarto de Lavandería · Estante 1',
    current: 0.8,
    min: 3.0,
    max: 10.0,
    unit: 'L',
    updated: 'Hoy, 10:00 AM',
    img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-8',
    name: 'Desinfectante Clínico Superficies',
    category: 'Limpieza',
    location: 'Cuarto de Lavandería · Estante 2',
    current: 1.5,
    min: 4.0,
    max: 12.0,
    unit: 'L',
    updated: 'Hoy, 11:20 AM',
    img: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'inv-9',
    name: 'Café en Grano Selección Especial',
    category: 'Despensa',
    location: 'Alacena Central · Estante B',
    current: 3.5,
    min: 2.0,
    max: 5.0,
    unit: 'kg',
    updated: 'Ayer, 08:00 AM',
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400'
  }
];

const INITIAL_LOGS = [
  { id: 1, type: 'Salida Cocina', item: 'Filete de Mero Fresco', qty: '-0.8 kg', user: 'Chef Jesús (Almuerzo Dr. Jiménez)', time: '11:40 AM', color: '#5E7AC6' },
  { id: 2, type: 'Merma Auditada', item: 'Recortes Vegetales (Auyama)', qty: '-0.45 kg', user: 'Balanza Digital Cocina', time: '10:15 AM', color: '#EE6B5F' },
  { id: 3, type: 'Recepción Garita', item: 'Insumos Farmacia & Cuidados', qty: '+4 unid', user: 'Recibido por Custodio Turno 1', time: '09:15 AM', color: '#10B981' }
];

export default function InventoryModal({ isOpen, onClose, initialTab = 'STOCK' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [orderSent, setOrderSent] = useState(false);
  const [customNote, setCustomNote] = useState('Favor priorizar el pescado fresco y el detergente hipoalergénico para antes del miércoles.');

  // Estado para simulador de balanza / movimiento rápido
  const [movType, setMovType] = useState('SALIDA');
  const [movItemId, setMovItemId] = useState('inv-1');
  const [movQty, setMovQty] = useState(0.5);
  const [movReason, setMovReason] = useState('Preparación Almuerzo Principal');
  const [movSuccess, setMovSuccess] = useState(false);

  const categories = ['Todos', 'Proteínas', 'Lácteos', 'Despensa', 'Limpieza'];

  const adjustQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const step = item.unit === 'unid' ? 1 : 0.5;
        const nextVal = Math.max(0, Number((item.current + delta * step).toFixed(1)));
        return { ...item, current: nextVal, updated: 'Justo ahora' };
      })
    );
    setOrderSent(false);
  };

  const lowStockItems = useMemo(() => {
    return items.filter((i) => i.current < i.min);
  }, [items]);

  const globalHealth = useMemo(() => {
    const totalRatio = items.reduce((acc, i) => acc + Math.min(1, i.current / i.max), 0);
    return Math.round((totalRatio / items.length) * 100);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat = selectedCategory === 'Todos' || item.category === selectedCategory;
      const matchesLow = !onlyLowStock || item.current < item.min;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesLow && matchesSearch;
    });
  }, [items, selectedCategory, onlyLowStock, searchQuery]);

  const handleRegisterMovement = (e) => {
    e.preventDefault();
    const target = items.find((i) => i.id === movItemId);
    if (!target) return;

    const signedDelta = movType === 'ENTRADA' ? Number(movQty) : -Number(movQty);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== movItemId) return item;
        return {
          ...item,
          current: Math.max(0, Number((item.current + signedDelta).toFixed(2))),
          updated: 'Justo ahora'
        };
      })
    );

    const newLog = {
      id: Date.now(),
      type: movType === 'ENTRADA' ? 'Recepción Proveedor' : movType === 'MERMA' ? 'Merma en Balanza' : 'Consumo Cocina',
      item: target.name,
      qty: `${signedDelta > 0 ? '+' : ''}${signedDelta} ${target.unit}`,
      user: movReason,
      time: 'Justo ahora',
      color: movType === 'ENTRADA' ? '#10B981' : movType === 'MERMA' ? '#EE6B5F' : '#5E7AC6'
    };

    setLogs([newLog, ...logs]);
    setMovSuccess(true);
    setTimeout(() => setMovSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-inv-overlay" onClick={onClose}>
      <div className="domus-inv-modal" onClick={(e) => e.stopPropagation()}>
        {/* Marca de agua sutil */}
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-inv-watermark" />

        {/* ==========================================
            CABECERA DEL MODAL
            ========================================== */}
        <header className="domus-inv-header">
          <div className="domus-inv-title-wrap">
            <div className="domus-inv-badge-top">
              <Sparkles size={13} color="#EE6B5F" />
              <span>CASA ROQUEDAL · AUDITORÍA DE ALACENA Y DESPENSA</span>
            </div>
            <h2>Control Inteligente de Inventario</h2>
          </div>

          {/* KPIs rápidos en cabecera */}
          <div className="domus-inv-kpis">
            <div className="domus-inv-kpi">
              <small>STOCK GLOBAL</small>
              <strong style={{ color: '#5E7AC6' }}>{globalHealth}% Capacidad</strong>
            </div>
            <div
              className={`domus-inv-kpi domus-inv-kpi-alert ${lowStockItems.length > 0 ? 'has-alerts' : ''}`}
              onClick={() => setActiveTab('ORDEN')}
            >
              <small>POR REPONER</small>
              <strong>{lowStockItems.length} Insumos Críticos</strong>
            </div>
            <button className="domus-inv-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
            PESTAÑAS INTERNAS DEL MODAL
            ========================================== */}
        <div className="domus-inv-tabs-bar">
          <div className="domus-inv-tabs">
            <button
              className={`domus-inv-tab ${activeTab === 'STOCK' ? 'active' : ''}`}
              onClick={() => setActiveTab('STOCK')}
            >
              <Package size={16} />
              <span>Existencias en Vivo ({items.length})</span>
            </button>
            <button
              className={`domus-inv-tab ${activeTab === 'ORDEN' ? 'active' : ''}`}
              onClick={() => setActiveTab('ORDEN')}
            >
              <ShoppingBag size={16} />
              <span>Orden de Compra ({lowStockItems.length})</span>
              {lowStockItems.length > 0 && <i className="domus-inv-tab-dot"></i>}
            </button>
            <button
              className={`domus-inv-tab ${activeTab === 'BALANZA' ? 'active' : ''}`}
              onClick={() => setActiveTab('BALANZA')}
            >
              <Scale size={16} />
              <span>Balanza · Entradas y Mermas</span>
            </button>
          </div>

          {activeTab === 'STOCK' && (
            <div className="domus-inv-search-row">
              <div className="domus-inv-search">
                <Search size={15} color="#808080" />
                <input
                  type="text"
                  placeholder="Buscar insumo o ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className={`domus-inv-low-toggle ${onlyLowStock ? 'active' : ''}`}
                onClick={() => setOnlyLowStock(!onlyLowStock)}
              >
                <AlertCircle size={14} />
                <span>Solo Por Pedir ({lowStockItems.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO DEL MODAL SEGÚN PESTAÑA ACTIVA
            ========================================== */}
        <div className="domus-inv-body">

          {/* VISTA 1: EXISTENCIAS EN VIVO */}
          {activeTab === 'STOCK' && (
            <>
              <div className="domus-inv-cats">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`domus-inv-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="domus-inv-grid">
                {filteredItems.map((item) => {
                  const isLow = item.current < item.min;
                  const pct = Math.min(100, Math.round((item.current / item.max) * 100));
                  return (
                    <div key={item.id} className={`domus-item-card ${isLow ? 'low-stock' : ''}`}>
                      <div className="domus-item-top">
                        <img src={item.img} alt={item.name} className="domus-item-img" />
                        <div className="domus-item-meta">
                          <div className="domus-item-tags">
                            <span className="domus-item-cat">{item.category}</span>
                            <span className={`domus-item-status ${isLow ? 'low' : 'ok'}`}>
                              {isLow ? 'Por Pedir' : 'Óptimo'}
                            </span>
                          </div>
                          <h4>{item.name}</h4>
                          <p>{item.location}</p>
                        </div>
                      </div>

                      <div className="domus-item-meter">
                        <div className="domus-item-meter-labels">
                          <span>Mínimo requerido: {item.min} {item.unit}</span>
                          <strong>{pct}%</strong>
                        </div>
                        <div className="domus-item-track">
                          <div
                            className="domus-item-fill"
                            style={{
                              width: `${pct}%`,
                              background: isLow ? '#EE6B5F' : '#5E7AC6'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="domus-item-controls">
                        <div className="domus-item-updated">
                          <Clock size={12} />
                          <span>{item.updated}</span>
                        </div>

                        <div className="domus-qty-stepper">
                          <button
                            onClick={() => adjustQuantity(item.id, -1)}
                            className="domus-step-btn"
                            title="Descontar uso"
                          >
                            <Minus size={15} />
                          </button>
                          <div className="domus-qty-display">
                            <strong>{item.current}</strong>
                            <small>{item.unit}</small>
                          </div>
                          <button
                            onClick={() => adjustQuantity(item.id, 1)}
                            className="domus-step-btn domus-step-plus"
                            title="Sumar entrada"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* VISTA 2: ORDEN DE COMPRA AUTOMÁTICA PARA ADMINISTRACIÓN */}
          {activeTab === 'ORDEN' && (
            <div className="domus-order-layout">
              <div className="domus-order-list-panel">
                <div className="domus-order-banner">
                  <div>
                    <h3>Lista de Reposición Automática</h3>
                    <p>El sistema detecta automáticamente todo insumo por debajo del stock mínimo de Casa Roquedal.</p>
                  </div>
                  <span className="domus-order-count">{lowStockItems.length} Productos</span>
                </div>

                {lowStockItems.length === 0 ? (
                  <div className="domus-empty-order">
                    <CheckCircle2 size={42} color="#10B981" />
                    <h4>¡Alacena al 100%!</h4>
                    <p>Ningún rubro se encuentra por debajo del mínimo crítico hoy.</p>
                  </div>
                ) : (
                  <div className="domus-order-items">
                    {lowStockItems.map((item) => {
                      const suggested = Number((item.max - item.current).toFixed(1));
                      return (
                        <div key={item.id} className="domus-order-row">
                          <img src={item.img} alt={item.name} />
                          <div className="domus-order-info">
                            <strong>{item.name}</strong>
                            <span>Actual: {item.current} {item.unit} · Mínimo: {item.min} {item.unit}</span>
                          </div>
                          <div className="domus-order-suggest">
                            <small>SUGERIDO A PEDIR</small>
                            <strong>+{suggested} {item.unit}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="domus-order-summary-panel">
                <h4>Enviar Requerimiento a Administración</h4>
                <p className="domus-order-sub">
                  Sra. Belkys, revise la nota adjunta y envíe la orden con un solo toque. Quedará registrada con fecha y hora para la administradora.
                </p>

                <label className="domus-order-label">Observaciones del Ama de Llaves</label>
                <textarea
                  rows={4}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="domus-order-textarea"
                />

                <div className="domus-order-meta-box">
                  <div>
                    <span>Destinatario</span>
                    <strong>Administración · Casa Roquedal</strong>
                  </div>
                  <div>
                    <span>Autorizado por</span>
                    <strong>Sra. Belkys (Ama de Llaves)</strong>
                  </div>
                </div>

                {orderSent ? (
                  <div className="domus-order-sent-box">
                    <CheckCircle2 size={22} />
                    <div>
                      <strong>¡Orden Enviada a Administración!</strong>
                      <span>Folio #RQ-4092 registrado exitosamente en bitácora.</span>
                    </div>
                  </div>
                ) : (
                  <button
                    className="domus-order-submit-btn"
                    onClick={() => setOrderSent(true)}
                  >
                    <Send size={17} />
                    <span>APROBAR Y ENVIAR PEDIDO AHORA</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VISTA 3: BALANZA DIGITAL / ENTRADAS Y MERMAS */}
          {activeTab === 'BALANZA' && (
            <div className="domus-order-layout">
              <form className="domus-order-summary-panel" onSubmit={handleRegisterMovement}>
                <h4>Registro Rápido de Balanza y Alacena</h4>
                <p className="domus-order-sub">
                  Asiente en 3 segundos cualquier ingreso de proveedor, consumo de cocina o merma pesada en balanza.
                </p>

                <div className="domus-mov-type-pills">
                  {[
                    { id: 'SALIDA', label: 'Consumo Cocina', color: '#5E7AC6' },
                    { id: 'ENTRADA', label: 'Entrada Proveedor', color: '#10B981' },
                    { id: 'MERMA', label: 'Merma / Descarte', color: '#EE6B5F' }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setMovType(t.id)}
                      className={`domus-mov-pill ${movType === t.id ? 'active' : ''}`}
                      style={{ '--mov-color': t.color }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <label className="domus-order-label">Seleccionar Insumo</label>
                <select
                  value={movItemId}
                  onChange={(e) => setMovItemId(e.target.value)}
                  className="domus-mov-select"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Actual: {i.current} {i.unit})
                    </option>
                  ))}
                </select>

                <label className="domus-order-label">Cantidad Pesada / Contada ({items.find((i) => i.id === movItemId)?.unit})</label>
                <div className="domus-scale-simulator">
                  <button type="button" onClick={() => setMovQty(Math.max(0.1, Number((movQty - 0.5).toFixed(1))))}>-</button>
                  <div className="domus-scale-readout">
                    <strong>{movQty}</strong>
                    <span>{items.find((i) => i.id === movItemId)?.unit}</span>
                  </div>
                  <button type="button" onClick={() => setMovQty(Number((movQty + 0.5).toFixed(1)))}>+</button>
                </div>

                <label className="domus-order-label">Motivo o Responsable</label>
                <input
                  type="text"
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  className="domus-mov-input"
                />

                {movSuccess ? (
                  <div className="domus-order-sent-box">
                    <CheckCircle2 size={20} />
                    <div>
                      <strong>Movimiento Asentado en Inventario</strong>
                      <span>El stock y la auditoría se actualizaron al instante.</span>
                    </div>
                  </div>
                ) : (
                  <button type="submit" className="domus-order-submit-btn">
                    <Scale size={17} />
                    <span>REGISTRAR EN BITÁCORA DE ALACENA</span>
                  </button>
                )}
              </form>

              <div className="domus-order-list-panel">
                <div className="domus-order-banner">
                  <div>
                    <h3>Historial de Movimientos Recientes</h3>
                    <p>Trazabilidad completa de quién retiró, recibió o pesó cada insumo en la casa.</p>
                  </div>
                </div>

                <div className="domus-order-items">
                  {logs.map((log) => (
                    <div key={log.id} className="domus-order-row">
                      <div className="domus-log-dot" style={{ background: log.color }}></div>
                      <div className="domus-order-info">
                        <strong>{log.item} · <span style={{ color: log.color }}>{log.type}</span></strong>
                        <span>{log.user} · {log.time}</span>
                      </div>
                      <div className="domus-order-suggest">
                        <strong style={{ color: log.color }}>{log.qty}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ==========================================
            PIE DEL MODAL (STICKY EN MÓVIL)
            ========================================== */}
        <footer className="domus-inv-footer">
          <div className="domus-inv-footer-left">
            <span>Sincronizado con Balanza de Cocina y Administración</span>
          </div>
          <div className="domus-inv-footer-actions">
            {activeTab !== 'ORDEN' && (
              <button className="domus-inv-cta-coral" onClick={() => setActiveTab('ORDEN')}>
                <ShoppingBag size={16} />
                <span>Ver Lista de Compra ({lowStockItems.length})</span>
              </button>
            )}
            <button className="domus-inv-cta-close" onClick={onClose}>
              VOLVER AL PANEL PRINCIPAL
            </button>
          </div>
        </footer>

        {/* ==========================================
            ESTILOS AISLADOS DEL MODAL DE INVENTARIO
            ========================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          .domus-inv-overlay {
            position: fixed; inset: 0; z-index: 180;
            background: rgba(18, 22, 36, 0.55);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            animation: domusInvFade 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 768px) {
            .domus-inv-overlay { padding: 24px; }
          }
          @keyframes domusInvFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-inv-modal {
            position: relative; overflow: hidden;
            width: 100%; max-width: 1280px;
            height: 100dvh;
            background: rgba(244, 246, 251, 0.94);
            backdrop-filter: blur(36px) saturate(190%);
            -webkit-backdrop-filter: blur(36px) saturate(190%);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 32px 80px rgba(15, 23, 42, 0.35);
            display: flex; flex-direction: column;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .domus-inv-modal {
              height: 90vh;
              border-radius: 36px;
            }
          }

          .domus-inv-watermark {
            position: absolute; right: -40px; bottom: 40px;
            width: 280px; height: 280px; object-fit: contain;
            opacity: 0.04; pointer-events: none; z-index: 0;
          }

          /* HEADER */
          .domus-inv-header {
            position: relative; z-index: 2;
            padding: 18px 18px 14px;
            background: rgba(255, 255, 255, 0.65);
            border-bottom: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-inv-header { padding: 22px 32px 18px; }
          }
          .domus-inv-badge-top {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 10px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
            margin-bottom: 4px;
          }
          .domus-inv-title-wrap h2 {
            font-size: clamp(20px, 2.6vw, 28px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-inv-kpis {
            display: flex; align-items: center; gap: 10px;
          }
          .domus-inv-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.85);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 16px;
          }
          @media (min-width: 640px) {
            .domus-inv-kpi { display: flex; }
          }
          .domus-inv-kpi small {
            font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080;
          }
          .domus-inv-kpi strong { font-size: 13px; font-weight: 900; color: #202020; }
          .domus-inv-kpi-alert { cursor: pointer; transition: transform 0.2s ease; }
          .domus-inv-kpi-alert:hover { transform: translateY(-2px); }
          .domus-inv-kpi-alert.has-alerts {
            background: rgba(238, 107, 95, 0.12);
            border-color: rgba(238, 107, 95, 0.35);
          }
          .domus-inv-kpi-alert.has-alerts strong { color: #EE6B5F; }

          .domus-inv-close {
            width: 40px; height: 40px; border-radius: 50%;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: #fff; color: #202020;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-inv-close:hover {
            background: #EE6B5F; color: #fff; border-color: #EE6B5F;
            transform: rotate(90deg);
          }

          /* TABS BAR & SEARCH */
          .domus-inv-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.45);
            border-bottom: 1px solid rgba(255, 255, 255, 0.85);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) {
            .domus-inv-tabs-bar { padding: 14px 32px; }
          }
          .domus-inv-tabs {
            display: flex; gap: 8px; overflow-x: auto; max-width: 100%;
            padding-bottom: 2px;
          }
          .domus-inv-tab {
            position: relative;
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 16px; border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.65);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer;
            transition: all 0.22s ease;
          }
          .domus-inv-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-inv-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }
          .domus-inv-tab-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #EE6B5F; box-shadow: 0 0 8px #EE6B5F;
          }

          .domus-inv-search-row {
            display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
            width: 100%;
          }
          @media (min-width: 980px) {
            .domus-inv-search-row { width: auto; }
          }
          .domus-inv-search {
            flex: 1; min-width: 200px;
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid #fff;
            padding: 9px 14px; border-radius: 14px;
          }
          .domus-inv-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }
          .domus-inv-low-toggle {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 14px;
            border: 1px solid rgba(238, 107, 95, 0.35);
            background: rgba(255, 255, 255, 0.8);
            color: #EE6B5F; font-size: 11px; font-weight: 800;
            cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
          }
          .domus-inv-low-toggle.active {
            background: #EE6B5F; color: #fff;
            box-shadow: 0 6px 16px rgba(238, 107, 95, 0.35);
          }

          /* BODY SCROLLABLE */
          .domus-inv-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
          }
          @media (min-width: 768px) {
            .domus-inv-body { padding: 24px 32px; }
          }

          .domus-inv-cats {
            display: flex; gap: 8px; overflow-x: auto;
            margin-bottom: 18px; padding-bottom: 4px;
          }
          .domus-inv-cat-pill {
            padding: 7px 15px; border-radius: 99px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.65);
            font-size: 11px; font-weight: 800; color: #555;
            cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
          }
          .domus-inv-cat-pill.active {
            background: #202020; color: #fff; border-color: #202020;
          }

          /* PRODUCT CARDS GRID */
          .domus-inv-grid {
            display: grid; grid-template-columns: 1fr; gap: 16px;
          }
          @media (min-width: 640px) {
            .domus-inv-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1060px) {
            .domus-inv-grid { grid-template-columns: repeat(3, 1fr); }
          }

          .domus-item-card {
            background: rgba(255, 255, 255, 0.78);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            border-radius: 24px; padding: 16px;
            box-shadow: 0 8px 24px rgba(32, 32, 32, 0.04);
            display: flex; flex-direction: column; justify-content: space-between;
            gap: 14px; transition: all 0.25s ease;
          }
          .domus-item-card:hover {
            transform: translateY(-4px);
            background: #fff;
            box-shadow: 0 16px 32px rgba(94, 122, 198, 0.14);
          }
          .domus-item-card.low-stock {
            border-color: rgba(238, 107, 95, 0.45);
            background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(254,242,242,0.85) 100%);
          }

          .domus-item-top {
            display: flex; align-items: center; gap: 14px;
          }
          .domus-item-img {
            width: 64px; height: 64px; border-radius: 16px;
            object-fit: cover; flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .domus-item-meta { flex: 1; min-width: 0; }
          .domus-item-tags {
            display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
          }
          .domus-item-cat {
            font-size: 9px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.08em; color: #5E7AC6;
            background: rgba(94, 122, 198, 0.12);
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-item-status {
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-item-status.ok {
            background: rgba(16, 185, 129, 0.14); color: #059669;
          }
          .domus-item-status.low {
            background: rgba(238, 107, 95, 0.18); color: #EE6B5F;
          }
          .domus-item-meta h4 {
            font-size: 15px; font-weight: 900; color: #202020;
            margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .domus-item-meta p {
            font-size: 11px; font-weight: 600; color: #777; margin: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          .domus-item-meter { display: flex; flex-direction: column; gap: 5px; }
          .domus-item-meter-labels {
            display: flex; justify-content: space-between;
            font-size: 10.5px; font-weight: 700; color: #666;
          }
          .domus-item-track {
            width: 100%; height: 7px; border-radius: 99px;
            background: rgba(0, 0, 0, 0.06); overflow: hidden;
          }
          .domus-item-fill {
            height: 100%; border-radius: 99px; transition: width 0.3s ease;
          }

          .domus-item-controls {
            display: flex; align-items: center; justify-content: space-between;
            padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.05);
          }
          .domus-item-updated {
            display: flex; align-items: center; gap: 5px;
            font-size: 10px; font-weight: 700; color: #888;
          }
          .domus-qty-stepper {
            display: flex; align-items: center; gap: 8px;
            background: #F4F6FA; padding: 4px; border-radius: 14px;
          }
          .domus-step-btn {
            width: 30px; height: 30px; border-radius: 10px; border: none;
            background: #fff; color: #202020;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.06);
            transition: all 0.18s ease;
          }
          .domus-step-btn:hover { background: #5E7AC6; color: #fff; }
          .domus-step-btn:active { transform: scale(0.9); }
          .domus-qty-display {
            min-width: 54px; text-align: center;
            display: flex; align-items: baseline; justify-content: center; gap: 3px;
          }
          .domus-qty-display strong { font-size: 15px; font-weight: 900; color: #202020; }
          .domus-qty-display small { font-size: 10px; font-weight: 800; color: #666; }

          /* ORDEN DE COMPRA & BALANZA LAYOUT */
          .domus-order-layout {
            display: grid; grid-template-columns: 1fr; gap: 20px;
          }
          @media (min-width: 960px) {
            .domus-order-layout { grid-template-columns: 1.3fr 1fr; }
          }
          .domus-order-list-panel, .domus-order-summary-panel {
            background: rgba(255, 255, 255, 0.8);
            border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          }
          .domus-order-banner {
            display: flex; align-items: flex-start; justify-content: space-between;
            gap: 12px; margin-bottom: 18px;
          }
          .domus-order-banner h3 { margin: 0 0 4px; font-size: 18px; font-weight: 900; }
          .domus-order-banner p { margin: 0; font-size: 12px; color: #666; }
          .domus-order-count {
            background: rgba(238, 107, 95, 0.15); color: #EE6B5F;
            padding: 6px 12px; border-radius: 99px; font-size: 11px; font-weight: 900;
            white-space: nowrap;
          }
          .domus-order-items { display: flex; flex-direction: column; gap: 10px; }
          .domus-order-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px; border-radius: 16px;
            background: #F7F9FC; border: 1px solid rgba(0,0,0,0.04);
          }
          .domus-order-row img {
            width: 48px; height: 48px; border-radius: 12px; object-fit: cover;
          }
          .domus-order-info { flex: 1; display: flex; flex-direction: column; }
          .domus-order-info strong { font-size: 13.5px; font-weight: 900; color: #202020; }
          .domus-order-info span { font-size: 11px; color: #666; font-weight: 600; }
          .domus-order-suggest { text-align: right; }
          .domus-order-suggest small { display: block; font-size: 8.5px; font-weight: 800; color: #888; }
          .domus-order-suggest strong { font-size: 14px; font-weight: 900; color: #EE6B5F; }

          .domus-order-summary-panel h4 { margin: 0 0 6px; font-size: 18px; font-weight: 900; }
          .domus-order-sub { font-size: 12px; color: #666; margin: 0 0 16px; line-height: 1.45; }
          .domus-order-label {
            display: block; font-size: 10px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.08em; color: #5E7AC6;
            margin: 12px 0 6px;
          }
          .domus-order-textarea, .domus-mov-select, .domus-mov-input {
            width: 100%; box-sizing: border-box;
            padding: 12px 14px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.1); background: #F7F9FC;
            font-size: 12.5px; font-weight: 600; color: #202020;
            font-family: inherit; outline: none;
          }
          .domus-order-meta-box {
            margin: 16px 0; padding: 12px 14px; border-radius: 16px;
            background: rgba(94, 122, 198, 0.08);
            display: flex; flex-direction: column; gap: 8px;
          }
          .domus-order-meta-box div { display: flex; justify-content: space-between; font-size: 11.5px; }
          .domus-order-meta-box span { color: #666; font-weight: 600; }
          .domus-order-meta-box strong { color: #202020; font-weight: 800; }

          .domus-order-submit-btn {
            width: 100%; padding: 15px; border: none; border-radius: 16px;
            background: #5E7AC6; color: #fff;
            font-size: 12px; font-weight: 900; letter-spacing: 0.08em;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer; margin-top: 14px;
            box-shadow: 0 10px 24px rgba(94, 122, 198, 0.35);
            transition: all 0.22s ease;
          }
          .domus-order-submit-btn:hover { background: #4864B0; transform: translateY(-2px); }

          .domus-order-sent-box {
            margin-top: 14px; padding: 14px 16px; border-radius: 16px;
            background: rgba(16, 185, 129, 0.14); color: #065F46;
            border: 1px solid rgba(16, 185, 129, 0.35);
            display: flex; align-items: center; gap: 12px;
          }
          .domus-order-sent-box div { display: flex; flex-direction: column; }
          .domus-order-sent-box strong { font-size: 13px; font-weight: 900; }
          .domus-order-sent-box span { font-size: 11px; }

          /* BALANZA SIMULATOR */
          .domus-mov-type-pills {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;
          }
          .domus-mov-pill {
            padding: 10px 8px; border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.08); background: #F7F9FC;
            font-size: 11px; font-weight: 800; color: #555; cursor: pointer;
            transition: all 0.2s ease;
          }
          .domus-mov-pill.active {
            background: var(--mov-color); color: #fff; border-color: var(--mov-color);
          }
          .domus-scale-simulator {
            display: flex; align-items: center; justify-content: space-between;
            background: #202020; color: #fff; padding: 10px 16px; border-radius: 16px;
          }
          .domus-scale-simulator button {
            width: 36px; height: 36px; border-radius: 10px; border: none;
            background: rgba(255,255,255,0.15); color: #fff;
            font-size: 18px; font-weight: 900; cursor: pointer;
          }
          .domus-scale-readout { display: flex; align-items: baseline; gap: 6px; }
          .domus-scale-readout strong { font-size: 26px; font-weight: 900; color: #6EE7B7; }
          .domus-scale-readout span { font-size: 12px; font-weight: 800; color: #ccc; }
          .domus-log-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }

          /* FOOTER */
          .domus-inv-footer {
            position: relative; z-index: 2;
            padding: 14px 18px;
            background: rgba(255, 255, 255, 0.75);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) {
            .domus-inv-footer { padding: 16px 32px; }
          }
          .domus-inv-footer-left span {
            font-size: 11px; font-weight: 700; color: #666;
          }
          .domus-inv-footer-actions {
            display: flex; align-items: center; gap: 10px; width: 100%; justify-content: flex-end;
          }
          @media (min-width: 640px) {
            .domus-inv-footer-actions { width: auto; }
          }
          .domus-inv-cta-coral {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 11px 18px; border-radius: 14px; border: none;
            background: #EE6B5F; color: #fff;
            font-size: 11px; font-weight: 900; cursor: pointer;
          }
          .domus-inv-cta-close {
            padding: 11px 18px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.12); background: #fff;
            font-size: 11px; font-weight: 900; color: #202020; cursor: pointer;
          }
        `}} />
      </div>
    </div>
  );
}