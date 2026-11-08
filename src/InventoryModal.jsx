import React, { useState, useMemo } from 'react';
import {
  X, Search, Plus, Minus, ShoppingBag, AlertCircle, CheckCircle2,
  Package, Scale, Sparkles, Check, Send, FileText, ArrowUpRight,
  Clock, Filter, Layers
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

const CATEGORY_STRUCTURE = {
  'Proteínas': ['Carnes', 'Pollo', 'Pescados', 'Huevos'],
  'Despensa': ['Granos y Pastas', 'Aceites y Condimentos', 'Lácteos y Café'],
  'Vegetales': ['Verduras y Hortalizas', 'Hojas y Hierbas', 'Frutas Frescas'],
  'Misceláneos': ['Panadería y Meriendas', 'Insumos de Cocina'],
  'Limpieza': ['Lavandería y Lencería', 'Superficies y Desinfección']
};

const INITIAL_ITEMS = [
  // PROTEÍNAS -> CARNES
  { id: 'inv-1', name: 'Medallones de Lomito', category: 'Proteínas', subcategory: 'Carnes', location: 'Congelador 1 · Gaveta Alta', current: 4.5, min: 3.0, max: 8.0, unit: 'kg', updated: 'Hoy, 08:30 AM', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-2', name: 'Bistec de Solomo', category: 'Proteínas', subcategory: 'Carnes', location: 'Congelador 1 · Gaveta Media', current: 3.5, min: 3.0, max: 7.0, unit: 'kg', updated: 'Ayer, 05:00 PM', img: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-3', name: 'Carne para Desmechar (Falda)', category: 'Proteínas', subcategory: 'Carnes', location: 'Congelador 1 · Gaveta Baja', current: 2.5, min: 2.0, max: 6.0, unit: 'kg', updated: 'Hoy, 09:00 AM', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-4', name: 'Carne Molida Magra Especial', category: 'Proteínas', subcategory: 'Carnes', location: 'Congelador 1 · Gaveta Media', current: 1.5, min: 2.5, max: 6.0, unit: 'kg', updated: 'Hoy, 11:10 AM', img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400' },

  // PROTEÍNAS -> POLLO
  { id: 'inv-5', name: 'Milanesa de Pollo Fileteada', category: 'Proteínas', subcategory: 'Pollo', location: 'Nevera Industrial · Nivel 2', current: 4.0, min: 3.0, max: 7.0, unit: 'kg', updated: 'Hoy, 08:00 AM', img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-6', name: 'Muslos Deshuesados', category: 'Proteínas', subcategory: 'Pollo', location: 'Congelador 2 · Nivel 1', current: 3.2, min: 2.5, max: 6.0, unit: 'kg', updated: 'Ayer, 06:00 PM', img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-7', name: 'Alas de Pollo Selección', category: 'Proteínas', subcategory: 'Pollo', location: 'Congelador 2 · Nivel 2', current: 2.0, min: 1.5, max: 5.0, unit: 'kg', updated: 'Ayer, 04:00 PM', img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=400' },

  // PROTEÍNAS -> PESCADOS
  { id: 'inv-8', name: 'Filete de Mero Fresco', category: 'Proteínas', subcategory: 'Pescados', location: 'Congelador 2 · Gaveta Mar', current: 1.2, min: 3.0, max: 6.0, unit: 'kg', updated: 'Hoy, 12:15 PM', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-9', name: 'Lomos de Salmón Fresco', category: 'Proteínas', subcategory: 'Pescados', location: 'Congelador 2 · Gaveta Mar', current: 2.5, min: 2.0, max: 5.0, unit: 'kg', updated: 'Hoy, 09:30 AM', img: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-10', name: 'Postas de Róbalo Blanco', category: 'Proteínas', subcategory: 'Pescados', location: 'Congelador 2 · Gaveta Mar', current: 2.2, min: 2.0, max: 5.0, unit: 'kg', updated: 'Ayer, 05:30 PM', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400' },

  // PROTEÍNAS -> HUEVOS
  { id: 'inv-11', name: 'Huevos Frescos de Campo', category: 'Proteínas', subcategory: 'Huevos', location: 'Alacena Fresca · Bandeja 1', current: 45, min: 24, max: 90, unit: 'unid', updated: 'Hoy, 07:30 AM', img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-12', name: 'Claras Pasteurizadas', category: 'Proteínas', subcategory: 'Huevos', location: 'Nevera Gourmet · Nivel 1', current: 3, min: 2, max: 6, unit: 'L', updated: 'Hoy, 08:10 AM', img: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400' },

  // DESPENSA
  { id: 'inv-13', name: 'Arroz Blanco Grano Entero', category: 'Despensa', subcategory: 'Granos y Pastas', location: 'Alacena Central · Estante A', current: 6.0, min: 3.0, max: 10.0, unit: 'kg', updated: 'Ayer, 03:00 PM', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-14', name: 'Avena Integral en Hojuelas', category: 'Despensa', subcategory: 'Granos y Pastas', location: 'Alacena Central · Estante A', current: 2.5, min: 2.0, max: 5.0, unit: 'kg', updated: 'Hoy, 08:00 AM', img: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-15', name: 'Aceite de Oliva Extra Virgen', category: 'Despensa', subcategory: 'Aceites y Condimentos', location: 'Alacena Central · Estante B', current: 1.0, min: 3.0, max: 8.0, unit: 'L', updated: 'Hoy, 09:10 AM', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-16', name: 'Queso Parmesano Reggiano', category: 'Despensa', subcategory: 'Lácteos y Café', location: 'Nevera Gourmet · Puerta', current: 1.8, min: 1.0, max: 3.0, unit: 'kg', updated: 'Ayer, 04:20 PM', img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-17', name: 'Leche de Almendras Sin Azúcar', category: 'Despensa', subcategory: 'Lácteos y Café', location: 'Alacena Fría · Nivel 1', current: 2, min: 4, max: 12, unit: 'unid', updated: 'Hoy, 07:45 AM', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-18', name: 'Café en Grano Especial', category: 'Despensa', subcategory: 'Lácteos y Café', location: 'Alacena Central · Estante C', current: 3.5, min: 2.0, max: 5.0, unit: 'kg', updated: 'Ayer, 08:00 AM', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400' },

  // VEGETALES
  { id: 'inv-19', name: 'Auyama Selección Dulce', category: 'Vegetales', subcategory: 'Verduras y Hortalizas', location: 'Cava Vegetales · Cesta 1', current: 4.0, min: 2.0, max: 6.0, unit: 'kg', updated: 'Hoy, 10:00 AM', img: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-20', name: 'Calabacín y Tomate Perita', category: 'Vegetales', subcategory: 'Verduras y Hortalizas', location: 'Cava Vegetales · Cesta 2', current: 3.5, min: 2.0, max: 6.0, unit: 'kg', updated: 'Hoy, 10:00 AM', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-21', name: 'Espinaca, Albahaca y Cilantro', category: 'Vegetales', subcategory: 'Hojas y Hierbas', location: 'Nevera Gourmet · Gaveta Verde', current: 1.5, min: 1.0, max: 3.0, unit: 'kg', updated: 'Hoy, 08:20 AM', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-22', name: 'Lechosa, Aguacate y Cambur', category: 'Vegetales', subcategory: 'Frutas Frescas', location: 'Frutero Climatizado', current: 5.0, min: 3.0, max: 8.0, unit: 'kg', updated: 'Hoy, 07:50 AM', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400' },

  // MISCELÁNEOS
  { id: 'inv-23', name: 'Galletas de Avena y Manzanilla', category: 'Misceláneos', subcategory: 'Panadería y Meriendas', location: 'Alacena de Té · Nivel 1', current: 6, min: 3, max: 10, unit: 'unid', updated: 'Ayer, 05:00 PM', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-24', name: 'Papel Film, Aluminio y Bolsas', category: 'Misceláneos', subcategory: 'Insumos de Cocina', location: 'Gaveta Utensilios 3', current: 5, min: 2, max: 8, unit: 'unid', updated: 'Ayer, 02:00 PM', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400' },

  // LIMPIEZA
  { id: 'inv-25', name: 'Detergente Hipoalergénico Neutro', category: 'Limpieza', subcategory: 'Lavandería y Lencería', location: 'Cuarto Lavandería · Estante 1', current: 0.8, min: 3.0, max: 10.0, unit: 'L', updated: 'Hoy, 10:00 AM', img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400' },
  { id: 'inv-26', name: 'Desinfectante Clínico Superficies', category: 'Limpieza', subcategory: 'Superficies y Desinfección', location: 'Cuarto Lavandería · Estante 2', current: 1.5, min: 4.0, max: 12.0, unit: 'L', updated: 'Hoy, 11:20 AM', img: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80&w=400' }
];

const INITIAL_LOGS = [
  { id: 1, type: 'Salida Cocina', item: 'Filete de Mero Fresco', qty: '-0.8 kg', user: 'Chef Jesús (Almuerzo Dr. Jiménez)', time: '11:40 AM', color: '#5E7AC6' },
  { id: 2, type: 'Merma Auditada', item: 'Recortes Vegetales (Auyama)', qty: '-0.45 kg', user: 'Balanza Digital Cocina', time: '10:15 AM', color: '#EE6B5F' },
  { id: 3, type: 'Recepción Garita', item: 'Insumos Farmacia & Cuidados', qty: '+4 unid', user: 'Recibido por Custodio Turno 1', time: '09:15 AM', color: '#10B981' }
];

export default function InventoryModal({ isOpen, onClose, initialTab = 'STOCK' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('Proteínas');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [orderSent, setOrderSent] = useState(false);
  const [customNote, setCustomNote] = useState('Favor priorizar el pescado fresco y el detergente hipoalergénico para antes del miércoles.');

  // Estado para añadir un nuevo insumo / corte dentro de cualquier subcategoría
  const [addingToSubcat, setAddingToSubcat] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSubcat, setNewItemSubcat] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('Congelador Principal');
  const [newItemCurrent, setNewItemCurrent] = useState(3.0);
  const [newItemMin, setNewItemMin] = useState(2.0);
  const [newItemMax, setNewItemMax] = useState(6.0);
  const [newItemUnit, setNewItemUnit] = useState('kg');

  // Estado para simulador de balanza / movimiento rápido
  const [movType, setMovType] = useState('SALIDA');
  const [movItemId, setMovItemId] = useState('inv-1');
  const [movQty, setMovQty] = useState(0.5);
  const [movReason, setMovReason] = useState('Preparación Almuerzo Principal');
  const [movSuccess, setMovSuccess] = useState(false);

  const categories = ['Proteínas', 'Despensa', 'Vegetales', 'Misceláneos', 'Limpieza'];

  const openAddItemForm = (subcatName) => {
    setAddingToSubcat(subcatName);
    setNewItemSubcat(subcatName === 'NUEVA' ? '' : subcatName);
    setNewItemName('');
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const targetSubcat = newItemSubcat.trim() || (CATEGORY_STRUCTURE[selectedCategory]?.[0] || 'General');
    const created = {
      id: `inv-${Date.now()}`,
      name: newItemName.trim(),
      category: selectedCategory,
      subcategory: targetSubcat,
      location: newItemLocation.trim() || 'Alacena Principal',
      current: Number(newItemCurrent),
      min: Number(newItemMin),
      max: Number(newItemMax),
      unit: newItemUnit,
      updated: 'Recién añadido',
      img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
    };
    setItems((prev) => [...prev, created]);
    setAddingToSubcat(null);
    setNewItemName('');
  };

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
      const matchesCat = item.category === selectedCategory;
      const matchesLow = !onlyLowStock || item.current < item.min;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesLow && matchesSearch;
    });
  }, [items, selectedCategory, onlyLowStock, searchQuery]);

  const groupedSubcategories = useMemo(() => {
    const baseSubcats = CATEGORY_STRUCTURE[selectedCategory] || [];
    const dynamicSubcats = Array.from(new Set(filteredItems.map((i) => i.subcategory || 'General')));
    const allSubcats = Array.from(new Set([...baseSubcats, ...dynamicSubcats]));

    return allSubcats
      .map((subName) => ({
        name: subName,
        items: filteredItems.filter((i) => (i.subcategory || 'General') === subName)
      }))
      .filter((group) => group.items.length > 0 || (!searchQuery && !onlyLowStock));
  }, [selectedCategory, filteredItems, searchQuery, onlyLowStock]);

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

          {/* VISTA 1: CATEGORÍAS Y CARRUSELES HORIZONTALES POR SUBDIVISIÓN */}
          {activeTab === 'STOCK' && (
            <>
              {/* Selector Principal de las 5 Categorías */}
              <div className="domus-inv-cats-bar">
                <div className="domus-inv-cats">
                  {categories.map((cat) => {
                    const catCount = items.filter((i) => i.category === cat).length;
                    const catLow = items.filter((i) => i.category === cat && i.current < i.min).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setAddingToSubcat(null);
                        }}
                        className={`domus-inv-cat-card ${selectedCategory === cat ? 'active' : ''}`}
                      >
                        <div className="domus-inv-cat-top">
                          <strong>{cat}</strong>
                          {catLow > 0 && <span className="domus-cat-alert-dot">{catLow}</span>}
                        </div>
                        <small>{catCount} rubros registrados</small>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="domus-add-global-btn"
                  onClick={() => openAddItemForm('NUEVA')}
                >
                  <Plus size={15} />
                  <span>Nuevo Rubro en {selectedCategory}</span>
                </button>
              </div>

              {/* Formulario Desplegable para Añadir Corte o Insumo */}
              {addingToSubcat && (
                <form className="domus-add-item-drawer" onSubmit={handleAddNewItem}>
                  <div className="domus-add-drawer-head">
                    <div>
                      <span>AÑADIR A {selectedCategory.toUpperCase()}</span>
                      <h4>
                        {addingToSubcat === 'NUEVA'
                          ? 'Registrar Nuevo Insumo o Subcategoría'
                          : `Nuevo Corte / Rubro en ${addingToSubcat}`}
                      </h4>
                    </div>
                    <button type="button" onClick={() => setAddingToSubcat(null)} className="domus-drawer-close">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="domus-add-drawer-grid">
                    <div>
                      <label>Nombre del Corte / Insumo</label>
                      <input
                        type="text"
                        placeholder="Ej. Churrasco, Milanesa, Tomate..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Subcategoría</label>
                      <input
                        type="text"
                        placeholder="Ej. Carnes, Pollo, Pescados..."
                        value={newItemSubcat}
                        onChange={(e) => setNewItemSubcat(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Ubicación en Casa</label>
                      <input
                        type="text"
                        value={newItemLocation}
                        onChange={(e) => setNewItemLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Stock Actual</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newItemCurrent}
                        onChange={(e) => setNewItemCurrent(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Mínimo Alerta</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newItemMin}
                        onChange={(e) => setNewItemMin(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Unidad</label>
                      <select value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)}>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="unid">Unidades (unid)</option>
                        <option value="L">Litros (L)</option>
                        <option value="paq">Paquetes (paq)</option>
                      </select>
                    </div>
                  </div>

                  <div className="domus-add-drawer-actions">
                    <button type="button" className="cancel" onClick={() => setAddingToSubcat(null)}>
                      Cancelar
                    </button>
                    <button type="submit" className="save">
                      <Check size={15} />
                      <span>Guardar en {newItemSubcat || selectedCategory}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Secciones Subdivididas con Carrusel Horizontal cada una */}
              <div className="domus-subcats-stack">
                {groupedSubcategories.map((group) => (
                  <div key={group.name} className="domus-subcat-section">
                    <div className="domus-subcat-header">
                      <div className="domus-subcat-title">
                        <span className="domus-subcat-dot"></span>
                        <h3>{group.name}</h3>
                        <span className="domus-subcat-count">{group.items.length} opciones</span>
                      </div>
                      <button
                        type="button"
                        className="domus-subcat-add-btn"
                        onClick={() => openAddItemForm(group.name)}
                      >
                        <Plus size={14} />
                        <span>Añadir a {group.name}</span>
                      </button>
                    </div>

                    {/* Carrusel Horizontal Deslizable */}
                    <div className="domus-subcat-carousel">
                      {group.items.map((item) => {
                        const isLow = item.current < item.min;
                        const pct = Math.min(100, Math.round((item.current / item.max) * 100));
                        return (
                          <div key={item.id} className={`domus-item-card domus-carousel-card ${isLow ? 'low-stock' : ''}`}>
                            <div className="domus-item-top">
                              <img src={item.img} alt={item.name} className="domus-item-img" />
                              <div className="domus-item-meta">
                                <div className="domus-item-tags">
                                  <span className="domus-item-cat">{item.subcategory}</span>
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
                                <span>Mínimo: {item.min} {item.unit}</span>
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

                      {/* Tarjeta Final del Carrusel para Añadir Rápido */}
                      <button
                        type="button"
                        className="domus-carousel-add-card"
                        onClick={() => openAddItemForm(group.name)}
                      >
                        <div className="domus-carousel-add-icon">
                          <Plus size={22} />
                        </div>
                        <strong>Añadir a {group.name}</strong>
                        <span>Nuevo corte o presentación</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <style dangerouslySetInnerHTML={{ __html: `
            .domus-inv-cats-bar {
              display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
              gap: 12px; margin-bottom: 22px;
            }
            .domus-inv-cats {
              display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 0 !important;
              flex: 1;
            }
            .domus-inv-cat-card {
              min-width: 148px; padding: 12px 16px; border-radius: 18px;
              border: 1.5px solid rgba(255, 255, 255, 0.95);
              background: rgba(255, 255, 255, 0.72);
              text-align: left; cursor: pointer;
              transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
              display: flex; flex-direction: column; gap: 3px;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
            }
            .domus-inv-cat-card:hover {
              transform: translateY(-2px); background: #fff;
            }
            .domus-inv-cat-card.active {
              background: #5E7AC6; color: #fff; border-color: #5E7AC6;
              box-shadow: 0 10px 24px rgba(94, 122, 198, 0.35);
            }
            .domus-inv-cat-top {
              display: flex; align-items: center; justify-content: space-between; gap: 8px;
            }
            .domus-inv-cat-card strong { font-size: 13.5px; font-weight: 900; }
            .domus-inv-cat-card small { font-size: 10.5px; font-weight: 700; opacity: 0.75; }
            .domus-cat-alert-dot {
              background: #EE6B5F; color: #fff; font-size: 9.5px; font-weight: 900;
              padding: 2px 7px; border-radius: 99px;
            }

            .domus-add-global-btn {
              display: inline-flex; align-items: center; gap: 7px;
              padding: 11px 16px; border-radius: 16px; border: none;
              background: #202020; color: #fff;
              font-size: 11.5px; font-weight: 900; cursor: pointer;
              white-space: nowrap; transition: all 0.2s ease;
            }
            .domus-add-global-btn:hover { background: #5E7AC6; transform: translateY(-2px); }

            /* FORMULARIO AÑADIR INSUMO */
            .domus-add-item-drawer {
              background: #fff; border: 1.5px solid rgba(94, 122, 198, 0.35);
              border-radius: 24px; padding: 20px; margin-bottom: 24px;
              box-shadow: 0 16px 40px rgba(94, 122, 198, 0.14);
            }
            .domus-add-drawer-head {
              display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;
            }
            .domus-add-drawer-head span {
              font-size: 9.5px; font-weight: 900; letter-spacing: 0.1em; color: #5E7AC6;
            }
            .domus-add-drawer-head h4 { margin: 2px 0 0; font-size: 17px; font-weight: 900; color: #202020; }
            .domus-drawer-close {
              width: 32px; height: 32px; border-radius: 50%; border: none;
              background: #F4F6FA; cursor: pointer; display: flex; align-items: center; justify-content: center;
            }
            .domus-add-drawer-grid {
              display: grid; grid-template-columns: 1fr; gap: 12px;
            }
            @media (min-width: 640px) {
              .domus-add-drawer-grid { grid-template-columns: repeat(3, 1fr); }
            }
            @media (min-width: 1024px) {
              .domus-add-drawer-grid { grid-template-columns: 1.6fr 1.2fr 1.3fr 0.8fr 0.8fr 1fr; }
            }
            .domus-add-drawer-grid label {
              display: block; font-size: 9.5px; font-weight: 900; text-transform: uppercase;
              color: #666; margin-bottom: 5px;
            }
            .domus-add-drawer-grid input, .domus-add-drawer-grid select {
              width: 100%; box-sizing: border-box;
              padding: 9px 12px; border-radius: 12px;
              border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC;
              font-size: 12px; font-weight: 700; color: #202020; outline: none;
            }
            .domus-add-drawer-actions {
              display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px;
            }
            .domus-add-drawer-actions button.cancel {
              padding: 9px 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
              background: #fff; font-size: 11.5px; font-weight: 800; cursor: pointer;
            }
            .domus-add-drawer-actions button.save {
              display: inline-flex; align-items: center; gap: 6px;
              padding: 9px 18px; border-radius: 12px; border: none;
              background: #5E7AC6; color: #fff; font-size: 11.5px; font-weight: 900; cursor: pointer;
            }

            /* CARRUSELES HORIZONTALES POR SUBDIVISIÓN */
            .domus-subcats-stack {
              display: flex; flex-direction: column; gap: 26px;
            }
            .domus-subcat-section {
              background: rgba(255, 255, 255, 0.45);
              border: 1px solid rgba(255, 255, 255, 0.9);
              border-radius: 28px; padding: 18px 20px;
            }
            .domus-subcat-header {
              display: flex; align-items: center; justify-content: space-between;
              gap: 10px; margin-bottom: 14px;
            }
            .domus-subcat-title {
              display: flex; align-items: center; gap: 10px;
            }
            .domus-subcat-dot {
              width: 10px; height: 10px; border-radius: 50%;
              background: #5E7AC6; box-shadow: 0 0 10px rgba(94, 122, 198, 0.5);
            }
            .domus-subcat-title h3 {
              margin: 0; font-size: 17px; font-weight: 900; letter-spacing: -0.02em; color: #202020;
            }
            .domus-subcat-count {
              font-size: 10.5px; font-weight: 800; color: #5E7AC6;
              background: rgba(94, 122, 198, 0.12); padding: 3px 10px; border-radius: 99px;
            }
            .domus-subcat-add-btn {
              display: inline-flex; align-items: center; gap: 5px;
              padding: 7px 13px; border-radius: 99px;
              border: 1px solid rgba(94, 122, 198, 0.3);
              background: rgba(255, 255, 255, 0.85); color: #5E7AC6;
              font-size: 11px; font-weight: 800; cursor: pointer;
              transition: all 0.2s ease;
            }
            .domus-subcat-add-btn:hover { background: #5E7AC6; color: #fff; }

            .domus-subcat-carousel {
              display: flex; align-items: stretch; gap: 16px;
              overflow-x: auto; padding: 4px 2px 12px;
              scroll-snap-type: x mandatory;
              scrollbar-width: thin;
              scrollbar-color: rgba(94, 122, 198, 0.35) transparent;
            }
            .domus-subcat-carousel::-webkit-scrollbar { height: 6px; }
            .domus-subcat-carousel::-webkit-scrollbar-thumb {
              background: rgba(94, 122, 198, 0.3); border-radius: 99px;
            }
            .domus-carousel-card {
              min-width: 290px; max-width: 310px; flex-shrink: 0;
              scroll-snap-align: start;
            }
            @media (min-width: 768px) {
              .domus-carousel-card { min-width: 320px; max-width: 340px; }
            }

            .domus-carousel-add-card {
              min-width: 210px; flex-shrink: 0; scroll-snap-align: start;
              border-radius: 24px;
              border: 2px dashed rgba(94, 122, 198, 0.35);
              background: rgba(255, 255, 255, 0.55);
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              gap: 6px; padding: 20px; cursor: pointer;
              color: #5E7AC6; transition: all 0.22s ease;
            }
            .domus-carousel-add-card:hover {
              background: #fff; border-color: #5E7AC6; transform: translateY(-4px);
              box-shadow: 0 12px 24px rgba(94, 122, 198, 0.14);
            }
            .domus-carousel-add-icon {
              width: 44px; height: 44px; border-radius: 50%;
              background: rgba(94, 122, 198, 0.12);
              display: flex; align-items: center; justify-content: center;
              margin-bottom: 4px;
            }
            .domus-carousel-add-card strong { font-size: 13px; font-weight: 900; color: #202020; }
            .domus-carousel-add-card span { font-size: 11px; font-weight: 600; color: #777; }
          `}} />

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