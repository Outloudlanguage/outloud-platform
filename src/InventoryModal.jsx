import React, { useState, useMemo } from 'react';
import {
  X, Search, Plus, ShoppingBag, AlertCircle, CheckCircle2,
  Package, Scale, Sparkles, Check, Send, Clock, RotateCw,
  Utensils, RefreshCw, Calendar, Phone, MapPin, Layers, Delete
} from 'lucide-react';

const STANDALONE_LOGO_URL = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Domus/DOMUS.png";

// ==========================================
// 1. ESTRUCTURA DE NAVEGACIÓN EN CASCADA (NIVEL 1 Y NIVEL 2)
// ==========================================
const MAIN_CATEGORIES = [
  {
    id: 'Proteínas',
    title: 'Proteínas',
    subtitle: 'Cava y Congelación',
    accent: '#5E7AC6',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=700',
    subcategories: [
      { id: 'Res', name: 'Carnes de Res', icon: '🥩' },
      { id: 'Pollo', name: 'Aves y Pollo', icon: '🍗' },
      { id: 'Pescados', name: 'Pescados y Mar', icon: '🐟' },
      { id: 'Huevos', name: 'Huevos y Claras', icon: '🥚' }
    ]
  },
  {
    id: 'Despensa',
    title: 'Despensa Seca',
    subtitle: 'Alacena Central',
    accent: '#F59E0B',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=700',
    subcategories: [
      { id: 'Granos y Pastas', name: 'Granos y Cereales', icon: '🌾' },
      { id: 'Aceites y Condimentos', name: 'Aceites y Especias', icon: '🫒' },
      { id: 'Café e Infusiones', name: 'Café e Infusiones', icon: '☕' }
    ]
  },
  {
    id: 'Vegetales',
    title: 'Vegetales y Frutas',
    subtitle: 'Cava Climatizada',
    accent: '#10B981',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=700',
    subcategories: [
      { id: 'Verduras y Hortalizas', name: 'Hortalizas y Raíces', icon: '🎃' },
      { id: 'Hojas y Hierbas', name: 'Hojas y Aromáticas', icon: '🌿' },
      { id: 'Frutas Frescas', name: 'Frutas Seleccionadas', icon: '🥑' }
    ]
  },
  {
    id: 'Lácteos y Misc.',
    title: 'Lácteos y Misc.',
    subtitle: 'Refrigerados Gourmet',
    accent: '#BE7AC6',
    img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=700',
    subcategories: [
      { id: 'Quesos y Lácteos', name: 'Quesos y Leches', icon: '🧀' },
      { id: 'Panadería y Meriendas', name: 'Panadería y Dietéticos', icon: '🍪' },
      { id: 'Insumos de Cocina', name: 'Empaque y Mise en Place', icon: '🥡' }
    ]
  },
  {
    id: 'Limpieza',
    title: 'Limpieza y Hogar',
    subtitle: 'Lencería y Desinfección',
    accent: '#EE6B5F',
    img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=700',
    subcategories: [
      { id: 'Lavandería y Lencería', name: 'Cuidado de Lencería', icon: '🧺' },
      { id: 'Superficies y Clínica', name: 'Desinfección Clínica', icon: '✨' }
    ]
  }
];

// ==========================================
// 2. INVENTARIO CON FICHA TÉCNICA COMPLETA (PARA REVERSO 3D)
// ==========================================
const INITIAL_ITEMS = [
  // PROTEÍNAS -> RES
  {
    id: 'inv-1',
    name: 'Medallones de Lomito',
    category: 'Proteínas',
    subcategory: 'Res',
    location: 'Congelador Principal · Gaveta 1',
    expiry: '24 Nov 2026 · Lote #L-804',
    processedState: 'Porcionado al vacío (200g c/u)',
    supplier: 'Frigorífico Santa Bárbara · +58 414-2901122',
    current: 4.5,
    min: 3.0,
    max: 8.0,
    unit: 'kg',
    updated: 'Hoy, 08:30 AM',
    img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-2',
    name: 'Bistec de Solomo de Cuerito',
    category: 'Proteínas',
    subcategory: 'Res',
    location: 'Congelador Principal · Gaveta 2',
    expiry: '20 Nov 2026 · Maduración 14d',
    processedState: 'Fileteado limpio sin exceso graso',
    supplier: 'Frigorífico Santa Bárbara · +58 414-2901122',
    current: 3.5,
    min: 3.0,
    max: 7.0,
    unit: 'kg',
    updated: 'Ayer, 05:00 PM',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-3',
    name: 'Carne para Desmechar (Falda)',
    category: 'Proteínas',
    subcategory: 'Res',
    location: 'Congelador Principal · Gaveta 3',
    expiry: '18 Nov 2026 · Empaque Sellado',
    processedState: 'Limpieza en bruto para cocción lenta',
    supplier: 'Frigorífico Santa Bárbara · +58 414-2901122',
    current: 1.4,
    min: 2.5,
    max: 6.0,
    unit: 'kg',
    updated: 'Hoy, 09:00 AM',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-4',
    name: 'Carne Molida Magra (95/5)',
    category: 'Proteínas',
    subcategory: 'Res',
    location: 'Nevera Industrial · Nivel 1',
    expiry: '12 Nov 2026 · Uso Prioritario',
    processedState: 'Doble molienda magra hiposódica',
    supplier: 'Frigorífico Santa Bárbara · +58 414-2901122',
    current: 1.2,
    min: 2.5,
    max: 6.0,
    unit: 'kg',
    updated: 'Hoy, 11:10 AM',
    img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=600'
  },

  // PROTEÍNAS -> POLLO
  {
    id: 'inv-5',
    name: 'Milanesa de Pollo Orgánico',
    category: 'Proteínas',
    subcategory: 'Pollo',
    location: 'Nevera Industrial · Nivel 2',
    expiry: '15 Nov 2026 · Fresco',
    processedState: 'Supremas fileteadas y desgrasadas',
    supplier: 'Granja Avícola El Hatillo · +58 412-6004411',
    current: 4.2,
    min: 3.0,
    max: 7.0,
    unit: 'kg',
    updated: 'Hoy, 08:00 AM',
    img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-6',
    name: 'Muslos Deshuesados',
    category: 'Proteínas',
    subcategory: 'Pollo',
    location: 'Congelador Auxiliar · Nivel 1',
    expiry: '28 Nov 2026 · Congelado IQF',
    processedState: 'Deshuesados sin piel · Paquetes 1kg',
    supplier: 'Granja Avícola El Hatillo · +58 412-6004411',
    current: 3.4,
    min: 2.5,
    max: 6.0,
    unit: 'kg',
    updated: 'Ayer, 06:00 PM',
    img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-7',
    name: 'Alas y Carcasas (Fondo Claro)',
    category: 'Proteínas',
    subcategory: 'Pollo',
    location: 'Congelador Auxiliar · Nivel 2',
    expiry: '30 Nov 2026 · Para Consomé',
    processedState: 'Blanqueadas y porcionadas para caldo',
    supplier: 'Granja Avícola El Hatillo · +58 412-6004411',
    current: 2.0,
    min: 1.5,
    max: 5.0,
    unit: 'kg',
    updated: 'Ayer, 04:00 PM',
    img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=600'
  },

  // PROTEÍNAS -> PESCADOS
  {
    id: 'inv-8',
    name: 'Filete de Mero Blanco',
    category: 'Proteínas',
    subcategory: 'Pescados',
    location: 'Cava de Mar · Gaveta 0°C',
    expiry: '10 Nov 2026 · Pesca del Día',
    processedState: 'Lomos sin espinas (180g porción Dr. Jiménez)',
    supplier: 'Pescadería La Guaira VIP · +58 414-9012233',
    current: 1.2,
    min: 3.0,
    max: 6.0,
    unit: 'kg',
    updated: 'Hoy, 12:15 PM',
    img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-9',
    name: 'Lomos de Salmón Atlántico',
    category: 'Proteínas',
    subcategory: 'Pescados',
    location: 'Cava de Mar · Gaveta Superior',
    expiry: '19 Nov 2026 · Sellado al Vacío',
    processedState: 'Porciones con piel escamada (220g)',
    supplier: 'Pescadería La Guaira VIP · +58 414-9012233',
    current: 2.8,
    min: 2.0,
    max: 5.0,
    unit: 'kg',
    updated: 'Hoy, 09:30 AM',
    img: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=600'
  },

  // PROTEÍNAS -> HUEVOS
  {
    id: 'inv-10',
    name: 'Huevos Camperos Orgánicos',
    category: 'Proteínas',
    subcategory: 'Huevos',
    location: 'Alacena Fresca · Bandeja Cerámica',
    expiry: '22 Nov 2026 · Recolección Semanal',
    processedState: 'Inspeccionados y sanitizados en seco',
    supplier: 'Hato Las Mercedes · +58 424-1189900',
    current: 42,
    min: 24,
    max: 90,
    unit: 'unidades',
    updated: 'Hoy, 07:30 AM',
    img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=600'
  },

  // DESPENSA SECA
  {
    id: 'inv-11',
    name: 'Arroz Arborio & Grano Entero',
    category: 'Despensa',
    subcategory: 'Granos y Pastas',
    location: 'Alacena Central · Contenedor Hermético 1',
    expiry: '15 Jun 2027 · Seco',
    processedState: 'Envasado en cristal hermético antihumedad',
    supplier: 'Distribuidora Gourmet Caracas · +58 414-3321000',
    current: 6.0,
    min: 3.0,
    max: 10.0,
    unit: 'kg',
    updated: 'Ayer, 03:00 PM',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-12',
    name: 'Avena Integral en Hojuelas',
    category: 'Despensa',
    subcategory: 'Granos y Pastas',
    location: 'Alacena Central · Contenedor 2',
    expiry: '10 Abr 2027 · Desayuno Dr. Jiménez',
    processedState: 'Hojuela gruesa libre de gluten contaminado',
    supplier: 'Distribuidora Gourmet Caracas · +58 414-3321000',
    current: 2.5,
    min: 2.0,
    max: 5.0,
    unit: 'kg',
    updated: 'Hoy, 08:00 AM',
    img: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-13',
    name: 'Aceite de Oliva Extra Virgen',
    category: 'Despensa',
    subcategory: 'Aceites y Condimentos',
    location: 'Alacena Oscura · Estante A',
    expiry: '01 Dic 2027 · Primera Prensa en Frío',
    processedState: 'Acidez 0.2% · Uso en crudo y cocción suave',
    supplier: 'Importadora Mediterránea · +58 412-9981122',
    current: 1.0,
    min: 3.0,
    max: 8.0,
    unit: 'litros',
    updated: 'Hoy, 09:10 AM',
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-14',
    name: 'Café en Grano Selección Merideña',
    category: 'Despensa',
    subcategory: 'Café e Infusiones',
    location: 'Estación de Barismo · Tolva Hermética',
    expiry: '30 Ene 2027 · Tueste Medio',
    processedState: 'En grano entero para molienda al instante',
    supplier: 'Tostaduría Especial Chacao · +58 414-7712020',
    current: 3.5,
    min: 2.0,
    max: 5.0,
    unit: 'kg',
    updated: 'Ayer, 08:00 AM',
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600'
  },

  // VEGETALES Y FRUTAS
  {
    id: 'inv-15',
    name: 'Auyama Dulce Macagua',
    category: 'Vegetales',
    subcategory: 'Verduras y Hortalizas',
    location: 'Cava Vegetales · Cesta 1 (12°C)',
    expiry: '16 Nov 2026 · Maduración Óptima',
    processedState: 'Mitad pelada y cortada en cubos para cremas',
    supplier: 'Agropecuaria Los Altos · +58 416-5501920',
    current: 4.0,
    min: 2.0,
    max: 6.0,
    unit: 'kg',
    updated: 'Hoy, 10:00 AM',
    img: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-16',
    name: 'Espinaca Baby, Albahaca y Cilantro',
    category: 'Vegetales',
    subcategory: 'Hojas y Hierbas',
    location: 'Nevera Gourmet · Gaveta Húmeda',
    expiry: '11 Nov 2026 · Lavado y Centrifugado',
    processedState: 'Desinfectado con hipoclorito grado alimenticio',
    supplier: 'Cultivos Hidropónicos Miranda · +58 414-8823110',
    current: 1.5,
    min: 1.0,
    max: 3.0,
    unit: 'kg',
    updated: 'Hoy, 08:20 AM',
    img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-17',
    name: 'Lechosa, Aguacate Hass y Cambur',
    category: 'Vegetales',
    subcategory: 'Frutas Frescas',
    location: 'Frutero Climatizado Cocina',
    expiry: '13 Nov 2026 · Consumo Diario',
    processedState: 'Lechosa porcionada en envase de cristal',
    supplier: 'Agropecuaria Los Altos · +58 416-5501920',
    current: 5.0,
    min: 3.0,
    max: 8.0,
    unit: 'kg',
    updated: 'Hoy, 07:50 AM',
    img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600'
  },

  // LÁCTEOS Y MISCELÁNEOS
  {
    id: 'inv-18',
    name: 'Queso Parmigiano Reggiano 24M',
    category: 'Lácteos y Misc.',
    subcategory: 'Quesos y Lácteos',
    location: 'Nevera Gourmet · Cava de Quesos',
    expiry: '20 Mar 2027 · Importado DOP',
    processedState: 'Cuña envuelta en papel encerado respirable',
    supplier: 'Importadora Mediterránea · +58 412-9981122',
    current: 1.8,
    min: 1.0,
    max: 3.0,
    unit: 'kg',
    updated: 'Ayer, 04:20 PM',
    img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-19',
    name: 'Leche de Almendras Sin Azúcar',
    category: 'Lácteos y Misc.',
    subcategory: 'Quesos y Lácteos',
    location: 'Alacena Fría · Nivel 1',
    expiry: '15 Feb 2027 · Dieta Dr. Jiménez',
    processedState: 'Envases Tetra Pak de 1 Litro sellados',
    supplier: 'Distribuidora Gourmet Caracas · +58 414-3321000',
    current: 2.0,
    min: 4.0,
    max: 12.0,
    unit: 'unidades',
    updated: 'Hoy, 07:45 AM',
    img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-20',
    name: 'Galletas Artesanales de Avena',
    category: 'Lácteos y Misc.',
    subcategory: 'Panadería y Meriendas',
    location: 'Alacena de Té · Nivel 1',
    expiry: '18 Nov 2026 · Sin Azúcar Refinada',
    processedState: 'Latas herméticas de 12 unidades',
    supplier: 'Pastelería Saludable Las Mercedes · +58 412-3019944',
    current: 5,
    min: 3,
    max: 10,
    unit: 'unidades',
    updated: 'Ayer, 05:00 PM',
    img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=600'
  },

  // LIMPIEZA Y HOGAR
  {
    id: 'inv-21',
    name: 'Detergente Hipoalergénico Neutro',
    category: 'Limpieza',
    subcategory: 'Lavandería y Lencería',
    location: 'Cuarto de Lavandería · Estante 1',
    expiry: 'Sin vencimiento · Lote Clínico',
    processedState: 'Especial para lencería egipcia de 600 hilos',
    supplier: 'Suministros Institucionales Klean · +58 414-2009911',
    current: 0.8,
    min: 3.0,
    max: 10.0,
    unit: 'litros',
    updated: 'Hoy, 10:00 AM',
    img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'inv-22',
    name: 'Desinfectante Clínico Amonio 5ta Gen',
    category: 'Limpieza',
    subcategory: 'Superficies y Clínica',
    location: 'Cuarto de Lavandería · Estante 2',
    expiry: '12 Ago 2027 · Uso Suite Médica',
    processedState: 'Concentrado diluible sin aroma irritante',
    supplier: 'Suministros Institucionales Klean · +58 414-2009911',
    current: 1.5,
    min: 4.0,
    max: 12.0,
    unit: 'litros',
    updated: 'Hoy, 11:20 AM',
    img: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80&w=600'
  }
];

const INITIAL_LOGS = [
  { id: 1, type: 'Usado en Receta', item: 'Filete de Mero Blanco', qty: '-0.8 kg', user: 'Almuerzo Dr. Jiménez (Mero al vapor)', time: '11:40 AM', color: '#5E7AC6' },
  { id: 2, type: 'Ajuste / Merma', item: 'Auyama Dulce Macagua', qty: '-0.45 kg', user: 'Merma de cáscara y semilla en balanza', time: '10:15 AM', color: '#EE6B5F' },
  { id: 3, type: 'Ingreso Proveedor', item: 'Medallones de Lomito', qty: '+4.5 kg', user: 'Recepción verificada por Sra. Belkys', time: '08:30 AM', color: '#10B981' }
];

export default function InventoryModal({ isOpen, onClose, initialTab = 'STOCK' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Estado de Progressive Disclosure (Nivel 1 -> Nivel 2 -> Nivel 3)
  const [selectedCategory, setSelectedCategory] = useState('Proteínas');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Res');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estado de Giro 3D (Flip Card)
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Estado del Teclado Numérico Táctil (Numpad Modal)
  const [numpadConfig, setNumpadConfig] = useState(null); // { item, mode: 'ACTUALIZAR' | 'RECETA' }
  const [numpadValue, setNumpadValue] = useState('');
  const [numpadUnit, setNumpadUnit] = useState('kg');
  const [updateOperation, setUpdateOperation] = useState('ENTRADA'); // 'ENTRADA' | 'CONTEO' | 'MERMA'
  const [selectedContextNote, setSelectedContextNote] = useState('');

  // Estado de Orden de Compra y Nuevo Rubro
  const [orderSent, setOrderSent] = useState(false);
  const [customNote, setCustomNote] = useState('Favor priorizar el pescado fresco, el aceite de oliva y el detergente hipoalergénico para antes del miércoles.');
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('Congelador Principal · Gaveta 1');
  const [newExpiry, setNewExpiry] = useState('30 Nov 2026 · Lote Fresco');
  const [newProcessed, setNewProcessed] = useState('Porcionado y etiquetado');
  const [newSupplier, setNewSupplier] = useState('Proveedor Certificado Casa Roquedal');
  const [newCurrent, setNewCurrent] = useState(3.0);
  const [newMin, setNewMin] = useState(2.0);
  const [newUnit, setNewUnit] = useState('kg');

  const activeCategoryObj = useMemo(
    () => MAIN_CATEGORIES.find((c) => c.id === selectedCategory) || MAIN_CATEGORIES[0],
    [selectedCategory]
  );

  const lowStockItems = useMemo(() => items.filter((i) => i.current < i.min), [items]);

  const globalHealth = useMemo(() => {
    const totalRatio = items.reduce((acc, i) => acc + Math.min(1, i.current / i.max), 0);
    return Math.round((totalRatio / items.length) * 100);
  }, [items]);

  // Selección en Nivel 1 (Categoría) -> Despliega Nivel 2 automáticamente
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    const found = MAIN_CATEGORIES.find((c) => c.id === catId);
    if (found && found.subcategories.length > 0) {
      setSelectedSubcategory(found.subcategories[0].id);
    } else {
      setSelectedSubcategory('TODAS');
    }
    setFlippedCardId(null);
  };

  // Filtrado de Nivel 3 (Grilla de Flip Cards)
  const level3Items = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.subcategory.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }
      if (onlyLowStock) {
        return item.current < item.min;
      }
      const matchCat = item.category === selectedCategory;
      const matchSub = selectedSubcategory === 'TODAS' || item.subcategory === selectedSubcategory;
      return matchCat && matchSub;
    });
  }, [items, selectedCategory, selectedSubcategory, onlyLowStock, searchQuery]);

  // Abrir el Teclado Numérico Táctil (Numpad Modal)
  const openNumpadModal = (e, item, mode) => {
    e.stopPropagation();
    setNumpadConfig({ item, mode });
    setNumpadValue('');
    setNumpadUnit(item.unit);
    if (mode === 'ACTUALIZAR') {
      setUpdateOperation('ENTRADA');
      setSelectedContextNote('Recepción de Proveedor Auditada');
    } else {
      setSelectedContextNote('Almuerzo Principal Dr. Jiménez');
    }
  };

  // Manejo de teclas del Numpad
  const handleNumpadKey = (key) => {
    if (key === 'CLEAR') {
      setNumpadValue('');
      return;
    }
    if (key === 'BACK') {
      setNumpadValue((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.' && numpadValue.includes('.')) return;
    if (numpadValue.length >= 6) return;
    setNumpadValue((prev) => `${prev}${key}`);
  };

  // Conversión inteligente de unidades (ej. g -> kg)
  const convertEnteredQuantity = (rawVal, selectedUnit, itemBaseUnit) => {
    const num = parseFloat(rawVal);
    if (isNaN(num) || num <= 0) return 0;
    if (selectedUnit === 'g' && itemBaseUnit === 'kg') {
      return num / 1000;
    }
    if (selectedUnit === 'kg' && itemBaseUnit === 'g') {
      return num * 1000;
    }
    return num;
  };

  // Confirmar operación en el Numpad Modal ([ CARGAR ])
  const handleConfirmNumpad = () => {
    if (!numpadConfig) return;
    const { item, mode } = numpadConfig;
    const rawNum = parseFloat(numpadValue);
    if (isNaN(rawNum) || rawNum <= 0) return;

    const convertedDelta = convertEnteredQuantity(rawNum, numpadUnit, item.unit);
    let nextCurrent = item.current;
    let logType = '';
    let logColor = '#5E7AC6';
    let signPrefix = '';

    if (mode === 'RECETA') {
      nextCurrent = Math.max(0, Number((item.current - convertedDelta).toFixed(2)));
      logType = 'Usado en Receta';
      logColor = '#5E7AC6';
      signPrefix = '-';
    } else {
      if (updateOperation === 'ENTRADA') {
        nextCurrent = Number((item.current + convertedDelta).toFixed(2));
        logType = 'Ingreso de Stock';
        logColor = '#10B981';
        signPrefix = '+';
      } else if (updateOperation === 'MERMA') {
        nextCurrent = Math.max(0, Number((item.current - convertedDelta).toFixed(2)));
        logType = 'Merma / Descarte';
        logColor = '#EE6B5F';
        signPrefix = '-';
      } else {
        // CONTEO FÍSICO EXACTO
        nextCurrent = Number(convertedDelta.toFixed(2));
        logType = 'Auditoría Física';
        logColor = '#BE7AC6';
        signPrefix = '=';
      }
    }

    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? { ...it, current: nextCurrent, updated: 'Justo ahora' }
          : it
      )
    );

    const newLogEntry = {
      id: Date.now(),
      type: logType,
      item: item.name,
      qty: `${signPrefix}${rawNum} ${numpadUnit}`,
      user: selectedContextNote,
      time: 'Justo ahora',
      color: logColor
    };

    setLogs((prev) => [newLogEntry, ...prev]);
    setNumpadConfig(null);
    setFlippedCardId(null);
  };

  const handleCreateNewItem = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const targetSub = selectedSubcategory === 'TODAS'
      ? activeCategoryObj.subcategories[0]?.id || 'General'
      : selectedSubcategory;

    const created = {
      id: `inv-${Date.now()}`,
      name: newName.trim(),
      category: selectedCategory,
      subcategory: targetSub,
      location: newLocation,
      expiry: newExpiry,
      processedState: newProcessed,
      supplier: newSupplier,
      current: Number(newCurrent),
      min: Number(newMin),
      max: Number(newCurrent) * 2 || 8,
      unit: newUnit,
      updated: 'Recién creado',
      img: activeCategoryObj.img
    };

    setItems((prev) => [created, ...prev]);
    setNewName('');
    setShowAddDrawer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="domus-inv-overlay" onClick={onClose}>
      <div className="domus-inv-modal" onClick={(e) => e.stopPropagation()}>
        <img src={STANDALONE_LOGO_URL} alt="" className="domus-inv-watermark" />

        {/* ==========================================
            CABECERA DEL MODAL DE INVENTARIO
            ========================================== */}
        <header className="domus-inv-header">
          <div className="domus-inv-title-wrap">
            <div className="domus-inv-badge-top">
              <Sparkles size={13} color="#EE6B5F" />
              <span>CASA ROQUEDAL · ARQUITECTURA DE ALACENA & BALANZA TÁCTIL</span>
            </div>
            <h2>Inventario Inteligente y Control de Insumos</h2>
          </div>

          <div className="domus-inv-kpis">
            <div className="domus-inv-kpi">
              <small>NIVEL DE ALACENA</small>
              <strong style={{ color: '#10B981' }}>{globalHealth}% Óptimo</strong>
            </div>
            <div
              className={`domus-inv-kpi domus-inv-kpi-alert ${lowStockItems.length > 0 ? 'has-alerts' : ''}`}
              onClick={() => setActiveTab('ORDEN')}
            >
              <small>ALERTAS DE STOCK</small>
              <strong>{lowStockItems.length} Por Reponer</strong>
            </div>
            <button className="domus-inv-close" onClick={onClose} title="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
            BARRA SUPERIOR DE VISTAS Y BUSCADOR
            ========================================== */}
        <div className="domus-inv-tabs-bar">
          <div className="domus-inv-tabs">
            <button
              className={`domus-inv-tab ${activeTab === 'STOCK' ? 'active' : ''}`}
              onClick={() => setActiveTab('STOCK')}
            >
              <Layers size={16} />
              <span>Explorador en Cascada ({items.length})</span>
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
              <span>Bitácora de Movimientos ({logs.length})</span>
            </button>
          </div>

          {activeTab === 'STOCK' && (
            <div className="domus-inv-search-row">
              <div className="domus-inv-search">
                <Search size={15} color="#808080" />
                <input
                  type="text"
                  placeholder="Buscar corte, ingrediente o cava..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className={`domus-inv-low-toggle ${onlyLowStock ? 'active' : ''}`}
                onClick={() => setOnlyLowStock(!onlyLowStock)}
              >
                <AlertCircle size={14} />
                <span>Críticos ({lowStockItems.length})</span>
              </button>
              <button
                type="button"
                className="domus-inv-new-btn"
                onClick={() => setShowAddDrawer(!showAddDrawer)}
              >
                <Plus size={15} />
                <span>Añadir Ítem</span>
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CUERPO PRINCIPAL CON PROGRESSIVE DISCLOSURE
            ========================================== */}
        <div className="domus-inv-body">

          {activeTab === 'STOCK' && (
            <>
              {/* GAVETA RÁPIDA PARA CREAR NUEVO ÍTEM */}
              {showAddDrawer && (
                <form className="domus-add-drawer" onSubmit={handleCreateNewItem}>
                  <div className="domus-add-drawer-head">
                    <div>
                      <span>NUEVA FICHA TÉCNICA EN {selectedCategory.toUpperCase()}</span>
                      <h4>Registrar Ingrediente o Insumo en {selectedSubcategory}</h4>
                    </div>
                    <button type="button" onClick={() => setShowAddDrawer(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="domus-add-drawer-grid">
                    <div>
                      <label>Nombre del Insumo</label>
                      <input
                        type="text"
                        placeholder="Ej. Churrasco de Solomo"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Ubicación</label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Caducidad / Lote</label>
                      <input
                        type="text"
                        value={newExpiry}
                        onChange={(e) => setNewExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Estado Procesado</label>
                      <input
                        type="text"
                        value={newProcessed}
                        onChange={(e) => setNewProcessed(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Stock Inicial</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCurrent}
                        onChange={(e) => setNewCurrent(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Unidad</label>
                      <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="unidades">unidades</option>
                        <option value="litros">litros</option>
                      </select>
                    </div>
                  </div>
                  <div className="domus-add-drawer-foot">
                    <button type="submit" className="domus-save-new-btn">
                      <Check size={15} /> Guardar Ficha 3D
                    </button>
                  </div>
                </form>
              )}

              {/* ==========================================
                  NIVEL 1: CARRUSEL DE CATEGORÍAS PRINCIPALES
                  ========================================== */}
              <div className="domus-cascade-level">
                <div className="domus-level-header">
                  <span className="domus-step-badge">NIVEL 1</span>
                  <h3>Categorías de Almacén y Cava</h3>
                </div>

                <div className="domus-lvl1-carousel">
                  {MAIN_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id && !onlyLowStock && !searchQuery;
                    const catItems = items.filter((i) => i.category === cat.id);
                    const catAlerts = catItems.filter((i) => i.current < i.min).length;

                    return (
                      <div
                        key={cat.id}
                        className={`domus-lvl1-card ${isSelected ? 'active' : ''}`}
                        style={{ '--cat-accent': cat.accent }}
                        onClick={() => {
                          setOnlyLowStock(false);
                          setSearchQuery('');
                          handleSelectCategory(cat.id);
                        }}
                      >
                        <div className="domus-lvl1-backlight"></div>
                        <div className="domus-lvl1-inner">
                          <div
                            className="domus-lvl1-bg"
                            style={{ backgroundImage: `url('${cat.img}')` }}
                          ></div>
                          <div className="domus-lvl1-overlay"></div>

                          <div className="domus-lvl1-top">
                            <span className="domus-lvl1-sub">{cat.subtitle}</span>
                            {catAlerts > 0 ? (
                              <span className="domus-lvl1-alert-pill">{catAlerts} Críticos</span>
                            ) : (
                              <span className="domus-lvl1-ok-pill">100% OK</span>
                            )}
                          </div>

                          <div className="domus-lvl1-bottom">
                            <h4>{cat.title}</h4>
                            <span>{catItems.length} ingredientes auditados</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ==========================================
                  NIVEL 2: CARRUSEL DE SUBCATEGORÍAS (DESPLIEGUE FLUIDO)
                  ========================================== */}
              {!onlyLowStock && !searchQuery && (
                <div className="domus-cascade-level domus-lvl2-animate" key={selectedCategory}>
                  <div className="domus-level-header">
                    <span className="domus-step-badge" style={{ background: activeCategoryObj.accent }}>
                      NIVEL 2
                    </span>
                    <h3>Subdivisiones de {activeCategoryObj.title}</h3>
                  </div>

                  <div className="domus-lvl2-carousel">
                    {activeCategoryObj.subcategories.map((sub) => {
                      const isSubActive = selectedSubcategory === sub.id;
                      const subItems = items.filter(
                        (i) => i.category === selectedCategory && i.subcategory === sub.id
                      );
                      const subLow = subItems.filter((i) => i.current < i.min).length;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubcategory(sub.id);
                            setFlippedCardId(null);
                          }}
                          className={`domus-lvl2-pill-card ${isSubActive ? 'active' : ''}`}
                          style={{ '--sub-accent': activeCategoryObj.accent }}
                        >
                          <div className="domus-lvl2-icon">{sub.icon}</div>
                          <div className="domus-lvl2-info">
                            <strong>{sub.name}</strong>
                            <span>{subItems.length} cortes / ítems</span>
                          </div>
                          {subLow > 0 && <i className="domus-lvl2-dot-alert">{subLow}</i>}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubcategory('TODAS');
                        setFlippedCardId(null);
                      }}
                      className={`domus-lvl2-pill-card ${selectedSubcategory === 'TODAS' ? 'active' : ''}`}
                      style={{ '--sub-accent': activeCategoryObj.accent }}
                    >
                      <div className="domus-lvl2-icon">📋</div>
                      <div className="domus-lvl2-info">
                        <strong>Ver Todo {activeCategoryObj.title}</strong>
                        <span>Vista completa</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ==========================================
                  NIVEL 3: GRILLA DE TARJETAS 3D CON EFECTO FLIP
                  ========================================== */}
              <div className="domus-cascade-level">
                <div className="domus-level-header">
                  <span className="domus-step-badge" style={{ background: '#10B981' }}>
                    NIVEL 3
                  </span>
                  <h3>
                    {onlyLowStock
                      ? 'Insumos Críticos por Debajo del Mínimo'
                      : searchQuery
                      ? `Resultados para "${searchQuery}"`
                      : `${selectedSubcategory === 'TODAS' ? activeCategoryObj.title : selectedSubcategory} · Toque una tarjeta para girar su Ficha 3D`}
                  </h3>
                </div>

                <div className="domus-lvl3-flip-grid">
                  {level3Items.map((item) => {
                    const isLow = item.current < item.min;
                    const isFlipped = flippedCardId === item.id;
                    const pct = Math.min(100, Math.round((item.current / item.max) * 100));
                    const glowColor = isLow ? '#EE6B5F' : activeCategoryObj.accent || '#10B981';
                    const statusBadgeColor = isLow ? '#EE6B5F' : '#10B981';

                    return (
                      <div
                        key={item.id}
                        className={`domus-flip-scene ${isFlipped ? 'is-flipped' : ''}`}
                        style={{ '--card-glow': glowColor }}
                        onClick={() => setFlippedCardId(isFlipped ? null : item.id)}
                      >
                        {/* Retroiluminación exterior (Backlighting) */}
                        <div className="domus-flip-backlight"></div>

                        <div className="domus-flip-card-inner">
                          {/* ==========================================
                              CARA FRONTAL (FOTOGRAFÍA + GLASSMORPHISM)
                              ========================================== */}
                          <div className="domus-flip-face domus-flip-front">
                            <div
                              className="domus-front-bg"
                              style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="domus-front-shade"></div>

                            <div className="domus-front-top">
                              <span
                                className="domus-front-status"
                                style={{ background: statusBadgeColor }}
                              >
                                {isLow ? 'ALERTA: STOCK BAJO' : 'STOCK ÓPTIMO'}
                              </span>
                              <span className="domus-flip-hint">
                                <RotateCw size={13} /> Ficha 3D
                              </span>
                            </div>

                            <div className="domus-front-glass-panel">
                              <div className="domus-front-title-row">
                                <div>
                                  <small>{item.subcategory} · {item.location.split('·')[0]}</small>
                                  <h4>{item.name}</h4>
                                </div>
                                <div className="domus-front-qty-badge">
                                  <strong>{item.current}</strong>
                                  <span>{item.unit}</span>
                                </div>
                              </div>

                              <div className="domus-front-bar-wrap">
                                <div className="domus-front-bar-labels">
                                  <span>Mínimo: {item.min} {item.unit}</span>
                                  <span>Capacidad: {pct}%</span>
                                </div>
                                <div className="domus-front-bar-track">
                                  <div
                                    className="domus-front-bar-fill"
                                    style={{
                                      width: `${pct}%`,
                                      background: isLow ? '#EE6B5F' : '#10B981'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ==========================================
                              CARA REVERSO (FICHA TÉCNICA + 2 BOTONES NUMPAD)
                              ========================================== */}
                          <div className="domus-flip-face domus-flip-back">
                            <div className="domus-back-header">
                              <div>
                                <span className="domus-back-sub">{item.category} · {item.subcategory}</span>
                                <h4>{item.name}</h4>
                              </div>
                              <div className="domus-back-stock-pill" style={{ color: statusBadgeColor }}>
                                {item.current} {item.unit}
                              </div>
                            </div>

                            <div className="domus-back-specs">
                              <div className="domus-spec-row">
                                <MapPin size={14} color="#5E7AC6" />
                                <div>
                                  <small>UBICACIÓN EN ALMACÉN</small>
                                  <strong>{item.location}</strong>
                                </div>
                              </div>
                              <div className="domus-spec-row">
                                <Calendar size={14} color="#EE6B5F" />
                                <div>
                                  <small>CADUCIDAD Y LOTE</small>
                                  <strong>{item.expiry}</strong>
                                </div>
                              </div>
                              <div className="domus-spec-row">
                                <Package size={14} color="#10B981" />
                                <div>
                                  <small>ESTADO PROCESADO</small>
                                  <strong>{item.processedState}</strong>
                                </div>
                              </div>
                              <div className="domus-spec-row">
                                <Phone size={14} color="#BE7AC6" />
                                <div>
                                  <small>PROVEEDOR DIRECTO</small>
                                  <strong>{item.supplier}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Dos Botones Independientes de Acción Táctil */}
                            <div className="domus-back-actions">
                              <button
                                type="button"
                                className="domus-action-btn domus-btn-update"
                                onClick={(e) => openNumpadModal(e, item, 'ACTUALIZAR')}
                              >
                                <RefreshCw size={14} />
                                <span>[ ACTUALIZAR ]</span>
                              </button>
                              <button
                                type="button"
                                className="domus-action-btn domus-btn-recipe"
                                onClick={(e) => openNumpadModal(e, item, 'RECETA')}
                              >
                                <Utensils size={14} />
                                <span>[ USAR EN RECETA ]</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* VISTA 2: ORDEN DE COMPRA AUTOMÁTICA */}
          {activeTab === 'ORDEN' && (
            <div className="domus-order-layout">
              <div className="domus-order-list-panel">
                <div className="domus-order-banner">
                  <div>
                    <h3>Lista de Reposición Automática</h3>
                    <p>Todo insumo en color rojo/terracota por debajo del mínimo se consolida aquí para Administración.</p>
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
                            <span>Actual: {item.current} {item.unit} · Mínimo: {item.min} {item.unit} ({item.supplier.split('·')[0]})</span>
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
                  Sra. Belkys, revise la nota adjunta y envíe la orden con un solo toque.
                </p>

                <label className="domus-order-label">Observaciones del Ama de Llaves</label>
                <textarea
                  rows={4}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="domus-order-textarea"
                />

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

          {/* VISTA 3: BITÁCORA DE MOVIMIENTOS */}
          {activeTab === 'BALANZA' && (
            <div className="domus-order-list-panel">
              <div className="domus-order-banner">
                <div>
                  <h3>Bitácora Auditada de Pesaje, Recetas y Mermas</h3>
                  <p>Cada uso del Teclado Numérico Táctil queda registrado con hora, unidad y justificación.</p>
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
          )}

        </div>

        {/* ==========================================
            4. COMPONENTE DE TECLADO NUMÉRICO TÁCTIL (NUMPAD MODAL)
            ========================================== */}
        {numpadConfig && (
          <div className="domus-numpad-backdrop" onClick={() => setNumpadConfig(null)}>
            <div className="domus-numpad-window" onClick={(e) => e.stopPropagation()}>
              <div className="domus-numpad-header">
                <div>
                  <span
                    className="domus-numpad-mode-tag"
                    style={{
                      background: numpadConfig.mode === 'ACTUALIZAR' ? 'rgba(238,107,95,0.16)' : 'rgba(94,122,198,0.16)',
                      color: numpadConfig.mode === 'ACTUALIZAR' ? '#EE6B5F' : '#5E7AC6'
                    }}
                  >
                    {numpadConfig.mode === 'ACTUALIZAR' ? 'AJUSTE Y AUDITORÍA DE STOCK' : 'DESCUENTO DIRECTO DE COCINA'}
                  </span>
                  <h3>{numpadConfig.item.name}</h3>
                  <small>Stock actual en alacena: <strong>{numpadConfig.item.current} {numpadConfig.item.unit}</strong></small>
                </div>
                <button
                  type="button"
                  className="domus-numpad-close"
                  onClick={() => setNumpadConfig(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Selector de Tipo de Ajuste (Solo en modo ACTUALIZAR) */}
              {numpadConfig.mode === 'ACTUALIZAR' ? (
                <div className="domus-numpad-ops">
                  {[
                    { id: 'ENTRADA', label: '+ Ingreso Proveedor', color: '#10B981', defaultNote: 'Recepción de Proveedor Auditada' },
                    { id: 'MERMA', label: '- Justificar Merma', color: '#EE6B5F', defaultNote: 'Merma de Limpieza / Caducidad' },
                    { id: 'CONTEO', label: '= Conteo Físico Exacto', color: '#5E7AC6', defaultNote: 'Ajuste por Inventario Físico' }
                  ].map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      className={`domus-numpad-op-btn ${updateOperation === op.id ? 'active' : ''}`}
                      style={{ '--op-col': op.color }}
                      onClick={() => {
                        setUpdateOperation(op.id);
                        setSelectedContextNote(op.defaultNote);
                      }}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="domus-numpad-recipe-select">
                  <label>Destino en Cocina / Receta Activa</label>
                  <select
                    value={selectedContextNote}
                    onChange={(e) => setSelectedContextNote(e.target.value)}
                  >
                    <option value="Almuerzo Principal Dr. Jiménez">Almuerzo Principal Dr. Jiménez (Dieta Hiposódica)</option>
                    <option value="Cena Ligera Suite Principal">Cena Ligera Suite Principal</option>
                    <option value="Menú Invitados VIP / Familia">Menú Invitados VIP / Familia</option>
                    <option value="Adición Improvisada / Mise en Place">Adición Improvisada / Mise en Place</option>
                  </select>
                </div>
              )}

              {/* Pantalla Digital del Valor + Dropdown de Unidad */}
              <div className="domus-numpad-screen">
                <div className="domus-numpad-value-box">
                  <span className="domus-numpad-sign">
                    {numpadConfig.mode === 'RECETA' || updateOperation === 'MERMA'
                      ? '-'
                      : updateOperation === 'ENTRADA'
                      ? '+'
                      : '='}
                  </span>
                  <strong className="domus-numpad-digits">
                    {numpadValue || '0.0'}
                  </strong>
                </div>

                <select
                  value={numpadUnit}
                  onChange={(e) => setNumpadUnit(e.target.value)}
                  className="domus-numpad-unit-dropdown"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="unidades">unidades</option>
                  <option value="litros">litros</option>
                </select>
              </div>

              {/* Píldoras de carga rápida táctil */}
              <div className="domus-numpad-presets">
                {['0.25', '0.5', '1', '2', '250', '500'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNumpadValue(val)}
                  >
                    {val} {numpadUnit}
                  </button>
                ))}
              </div>

              {/* Teclado Numérico Táctil de Gran Formato */}
              <div className="domus-numpad-grid">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    className="domus-numpad-key"
                    onClick={() => handleNumpadKey(digit)}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  className="domus-numpad-key domus-key-back"
                  onClick={() => handleNumpadKey('BACK')}
                  title="Borrar último dígito"
                >
                  <Delete size={20} />
                </button>
              </div>

              {/* Botón de Confirmación Rápida [ CARGAR ] */}
              <div className="domus-numpad-footer">
                <button
                  type="button"
                  className="domus-numpad-clear-btn"
                  onClick={() => handleNumpadKey('CLEAR')}
                >
                  LIMPIAR
                </button>
                <button
                  type="button"
                  className="domus-numpad-confirm-btn"
                  style={{
                    background:
                      numpadConfig.mode === 'ACTUALIZAR' && updateOperation === 'MERMA'
                        ? '#EE6B5F'
                        : numpadConfig.mode === 'ACTUALIZAR' && updateOperation === 'ENTRADA'
                        ? '#10B981'
                        : '#5E7AC6'
                  }}
                  onClick={handleConfirmNumpad}
                >
                  <Check size={18} />
                  <span>[ CARGAR ]</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PIE DEL MODAL DE INVENTARIO
            ========================================== */}
        <footer className="domus-inv-footer">
          <div className="domus-inv-footer-left">
            <span>Progressive Disclosure Activo · Toque cualquier tarjeta para girar su ficha técnica 3D</span>
          </div>
          <div className="domus-inv-footer-actions">
            {activeTab !== 'ORDEN' && (
              <button className="domus-inv-cta-coral" onClick={() => setActiveTab('ORDEN')}>
                <ShoppingBag size={16} />
                <span>Orden de Compra ({lowStockItems.length})</span>
              </button>
            )}
            <button className="domus-inv-cta-close" onClick={onClose}>
              VOLVER AL PANEL PRINCIPAL
            </button>
          </div>
        </footer>

        {/* ==========================================
            HOJA DE ESTILOS AISLADA (3D FLIP + GLASSMORPHISM + NUMPAD)
            ========================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          .domus-inv-overlay {
            position: fixed; inset: 0; z-index: 180;
            background: rgba(18, 22, 36, 0.58);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            animation: domusInvFade 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 768px) {
            .domus-inv-overlay { padding: 20px; }
          }
          @keyframes domusInvFade {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .domus-inv-modal {
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
            .domus-inv-modal {
              height: 92vh;
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
            padding: 16px 18px 14px;
            background: rgba(255, 255, 255, 0.72);
            border-bottom: 1px solid rgba(255, 255, 255, 0.92);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 14px;
          }
          @media (min-width: 768px) {
            .domus-inv-header { padding: 20px 32px 16px; }
          }
          .domus-inv-badge-top {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 10px; font-weight: 900; letter-spacing: 0.12em; color: #5E7AC6;
            margin-bottom: 3px;
          }
          .domus-inv-title-wrap h2 {
            font-size: clamp(20px, 2.5vw, 27px); font-weight: 900;
            letter-spacing: -0.03em; margin: 0; color: #202020;
          }

          .domus-inv-kpis { display: flex; align-items: center; gap: 10px; }
          .domus-inv-kpi {
            display: none; flex-direction: column;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 7px 14px; border-radius: 15px;
          }
          @media (min-width: 640px) { .domus-inv-kpi { display: flex; } }
          .domus-inv-kpi small { font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; color: #808080; }
          .domus-inv-kpi strong { font-size: 13px; font-weight: 900; color: #202020; }
          .domus-inv-kpi-alert { cursor: pointer; transition: transform 0.2s ease; }
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
            background: #EE6B5F; color: #fff; border-color: #EE6B5F; transform: rotate(90deg);
          }

          /* TABS & SEARCH BAR */
          .domus-inv-tabs-bar {
            position: relative; z-index: 2;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.48);
            border-bottom: 1px solid rgba(255, 255, 255, 0.88);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          @media (min-width: 768px) { .domus-inv-tabs-bar { padding: 12px 32px; } }
          .domus-inv-tabs { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; }
          .domus-inv-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 16px; border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.7);
            font-size: 11.5px; font-weight: 800; color: #555;
            white-space: nowrap; cursor: pointer; transition: all 0.22s ease;
          }
          .domus-inv-tab:hover { background: #fff; color: #5E7AC6; }
          .domus-inv-tab.active {
            background: #5E7AC6; color: #fff; border-color: #5E7AC6;
            box-shadow: 0 8px 20px rgba(94, 122, 198, 0.35);
          }
          .domus-inv-tab-dot {
            width: 8px; height: 8px; border-radius: 50%; background: #EE6B5F;
          }

          .domus-inv-search-row {
            display: flex; align-items: center; gap: 8px; flex-wrap: wrap; width: 100%;
          }
          @media (min-width: 980px) { .domus-inv-search-row { width: auto; } }
          .domus-inv-search {
            flex: 1; min-width: 200px;
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #fff;
            padding: 8px 14px; border-radius: 14px;
          }
          .domus-inv-search input {
            border: none; outline: none; background: transparent;
            font-size: 12px; font-weight: 600; color: #202020; width: 100%;
          }
          .domus-inv-low-toggle {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 13px; border-radius: 14px;
            border: 1px solid rgba(238, 107, 95, 0.4);
            background: rgba(255, 255, 255, 0.85);
            color: #EE6B5F; font-size: 11px; font-weight: 900;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-inv-low-toggle.active {
            background: #EE6B5F; color: #fff;
            box-shadow: 0 6px 16px rgba(238, 107, 95, 0.35);
          }
          .domus-inv-new-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: 14px; border: none;
            background: #202020; color: #fff;
            font-size: 11px; font-weight: 900; cursor: pointer;
          }
          .domus-inv-new-btn:hover { background: #5E7AC6; }

          /* BODY */
          .domus-inv-body {
            position: relative; z-index: 2;
            flex: 1; overflow-y: auto;
            padding: 18px;
            display: flex; flex-direction: column; gap: 22px;
          }
          @media (min-width: 768px) { .domus-inv-body { padding: 22px 32px; } }

          /* PROGRESSIVE DISCLOSURE LEVELS */
          .domus-cascade-level {
            display: flex; flex-direction: column; gap: 12px;
          }
          .domus-level-header {
            display: flex; align-items: center; gap: 10px;
          }
          .domus-step-badge {
            background: #5E7AC6; color: #fff;
            font-size: 9px; font-weight: 900; letter-spacing: 0.12em;
            padding: 4px 9px; border-radius: 99px;
          }
          .domus-level-header h3 {
            margin: 0; font-size: 14.5px; font-weight: 900;
            letter-spacing: -0.01em; color: #202020;
          }

          /* NIVEL 1: CARRUSEL CATEGORÍAS */
          .domus-lvl1-carousel {
            display: flex; gap: 16px; overflow-x: auto;
            padding: 6px 4px 12px; scroll-snap-type: x mandatory;
          }
          .domus-lvl1-carousel::-webkit-scrollbar { height: 6px; }
          .domus-lvl1-carousel::-webkit-scrollbar-thumb {
            background: rgba(94, 122, 198, 0.28); border-radius: 99px;
          }
          .domus-lvl1-card {
            position: relative;
            min-width: 220px; height: 126px; flex: 1;
            scroll-snap-align: start; cursor: pointer;
            transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .domus-lvl1-card:hover { transform: translateY(-5px); }
          .domus-lvl1-backlight {
            position: absolute; inset: -5px; border-radius: 26px;
            background: var(--cat-accent); filter: blur(14px);
            opacity: 0; transition: opacity 0.28s ease; z-index: 0;
          }
          .domus-lvl1-card.active .domus-lvl1-backlight,
          .domus-lvl1-card:hover .domus-lvl1-backlight {
            opacity: 0.55;
          }
          .domus-lvl1-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%; border-radius: 22px; overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.85);
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 12px 14px; box-sizing: border-box;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
          }
          .domus-lvl1-card.active .domus-lvl1-inner {
            border-color: #fff;
            box-shadow: 0 14px 30px rgba(15, 23, 42, 0.22);
          }
          .domus-lvl1-bg {
            position: absolute; inset: 0; background-size: cover; background-position: center;
            transition: transform 0.5s ease;
          }
          .domus-lvl1-card:hover .domus-lvl1-bg { transform: scale(1.08); }
          .domus-lvl1-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.82) 100%);
          }
          .domus-lvl1-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between; gap: 6px;
          }
          .domus-lvl1-sub {
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.08em; color: rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-lvl1-alert-pill {
            font-size: 9px; font-weight: 900; background: #EE6B5F; color: #fff;
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-lvl1-ok-pill {
            font-size: 9px; font-weight: 900; background: #10B981; color: #fff;
            padding: 3px 8px; border-radius: 99px;
          }
          .domus-lvl1-bottom {
            position: relative; z-index: 2; color: #fff;
          }
          .domus-lvl1-bottom h4 {
            margin: 0; font-size: 18px; font-weight: 900; letter-spacing: -0.02em;
          }
          .domus-lvl1-bottom span {
            font-size: 10.5px; font-weight: 700; color: rgba(255, 255, 255, 0.82);
          }

          /* NIVEL 2: CARRUSEL SUBCATEGORÍAS */
          .domus-lvl2-animate {
            animation: domusSlideDown 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes domusSlideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .domus-lvl2-carousel {
            display: flex; gap: 12px; overflow-x: auto; padding: 4px 2px 8px;
          }
          .domus-lvl2-pill-card {
            display: flex; align-items: center; gap: 12px;
            padding: 11px 18px; border-radius: 20px;
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(18px);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            cursor: pointer; white-space: nowrap;
            transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
          }
          .domus-lvl2-pill-card:hover {
            transform: translateY(-3px); background: #fff;
          }
          .domus-lvl2-pill-card.active {
            background: var(--sub-accent); color: #fff;
            border-color: rgba(255, 255, 255, 0.95);
            box-shadow: 0 12px 26px -6px var(--sub-accent);
          }
          .domus-lvl2-icon {
            width: 36px; height: 36px; border-radius: 12px;
            background: rgba(255, 255, 255, 0.85);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
          }
          .domus-lvl2-info { text-align: left; display: flex; flex-direction: column; }
          .domus-lvl2-info strong { font-size: 13px; font-weight: 900; color: #202020; }
          .domus-lvl2-info span { font-size: 10.5px; font-weight: 700; color: #666; }
          .domus-lvl2-pill-card.active .domus-lvl2-info strong,
          .domus-lvl2-pill-card.active .domus-lvl2-info span {
            color: #fff;
          }
          .domus-lvl2-dot-alert {
            font-style: normal; font-size: 10px; font-weight: 900;
            background: #EE6B5F; color: #fff;
            padding: 2px 7px; border-radius: 99px;
          }

          /* NIVEL 3: GRILLA DE TARJETAS 3D FLIP */
          .domus-lvl3-flip-grid {
            display: grid; grid-template-columns: 1fr; gap: 20px;
          }
          @media (min-width: 640px) {
            .domus-lvl3-flip-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1024px) {
            .domus-lvl3-flip-grid { grid-template-columns: repeat(3, 1fr); }
          }
          @media (min-width: 1280px) {
            .domus-lvl3-flip-grid { grid-template-columns: repeat(4, 1fr); }
          }

          .domus-flip-scene {
            position: relative;
            height: 310px;
            perspective: 1200px;
            cursor: pointer;
          }
          .domus-flip-backlight {
            position: absolute; inset: -6px; border-radius: 32px;
            background: var(--card-glow);
            filter: blur(18px); opacity: 0.22;
            transition: opacity 0.3s ease; z-index: 0;
          }
          .domus-flip-scene:hover .domus-flip-backlight,
          .domus-flip-scene.is-flipped .domus-flip-backlight {
            opacity: 0.58;
          }

          .domus-flip-card-inner {
            position: relative; z-index: 1;
            width: 100%; height: 100%;
            transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
            transform-style: preserve-3d;
          }
          .domus-flip-scene.is-flipped .domus-flip-card-inner {
            transform: rotateY(180deg);
          }

          .domus-flip-face {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            border-radius: 26px; overflow: hidden;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            box-sizing: border-box;
            border: 1.5px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
          }

          /* CARA FRONTAL */
          .domus-flip-front {
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 16px;
          }
          .domus-front-bg {
            position: absolute; inset: 0;
            background-size: cover; background-position: center;
            transition: transform 0.6s ease;
          }
          .domus-flip-scene:hover .domus-front-bg { transform: scale(1.08); }
          .domus-front-shade {
            position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.72) 100%);
          }
          .domus-front-top {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between;
          }
          .domus-front-status {
            font-size: 9.5px; font-weight: 900; letter-spacing: 0.08em;
            color: #fff; padding: 5px 11px; border-radius: 99px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          .domus-flip-hint {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(255, 255, 255, 0.88); backdrop-filter: blur(10px);
            color: #202020; font-size: 10px; font-weight: 900;
            padding: 5px 10px; border-radius: 99px;
          }

          .domus-front-glass-panel {
            position: relative; z-index: 2;
            background: rgba(255, 255, 255, 0.86);
            backdrop-filter: blur(18px) saturate(180%);
            -webkit-backdrop-filter: blur(18px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.95);
            border-radius: 20px; padding: 14px;
            display: flex; flex-direction: column; gap: 10px;
          }
          .domus-front-title-row {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          }
          .domus-front-title-row small {
            display: block; font-size: 9.5px; font-weight: 800;
            text-transform: uppercase; letter-spacing: 0.06em; color: #5E7AC6;
          }
          .domus-front-title-row h4 {
            margin: 2px 0 0; font-size: 16px; font-weight: 900;
            color: #202020; line-height: 1.15;
          }
          .domus-front-qty-badge {
            background: #202020; color: #fff;
            padding: 6px 10px; border-radius: 12px;
            text-align: right; flex-shrink: 0;
          }
          .domus-front-qty-badge strong { font-size: 16px; font-weight: 900; display: block; line-height: 1; }
          .domus-front-qty-badge span { font-size: 9.5px; font-weight: 700; color: rgba(255,255,255,0.75); }

          .domus-front-bar-wrap { display: flex; flex-direction: column; gap: 4px; }
          .domus-front-bar-labels {
            display: flex; justify-content: space-between;
            font-size: 10px; font-weight: 800; color: #555;
          }
          .domus-front-bar-track {
            width: 100%; height: 6px; border-radius: 99px;
            background: rgba(0, 0, 0, 0.08); overflow: hidden;
          }
          .domus-front-bar-fill { height: 100%; border-radius: 99px; }

          /* CARA REVERSO (FICHA TÉCNICA EDITABLE) */
          .domus-flip-back {
            transform: rotateY(180deg);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(28px);
            padding: 16px;
            display: flex; flex-direction: column; justify-content: space-between;
          }
          .domus-back-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            gap: 8px; padding-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.06);
          }
          .domus-back-sub {
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.08em; color: #5E7AC6;
          }
          .domus-back-header h4 {
            margin: 2px 0 0; font-size: 15px; font-weight: 900; color: #202020;
          }
          .domus-back-stock-pill {
            font-size: 13px; font-weight: 900;
            background: #F4F6FA; padding: 4px 10px; border-radius: 99px;
            white-space: nowrap;
          }

          .domus-back-specs {
            display: flex; flex-direction: column; gap: 7px;
          }
          .domus-spec-row {
            display: flex; align-items: center; gap: 9px;
            background: #F7F9FC; padding: 6px 10px; border-radius: 11px;
          }
          .domus-spec-row div { display: flex; flex-direction: column; min-width: 0; }
          .domus-spec-row small {
            font-size: 8px; font-weight: 900; letter-spacing: 0.08em; color: #888;
          }
          .domus-spec-row strong {
            font-size: 11px; font-weight: 800; color: #202020;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          .domus-back-actions {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
            padding-top: 6px;
          }
          .domus-action-btn {
            display: flex; align-items: center; justify-content: center; gap: 5px;
            padding: 10px 6px; border-radius: 12px; border: none;
            font-size: 10px; font-weight: 900; letter-spacing: 0.04em;
            cursor: pointer; transition: all 0.2s ease;
          }
          .domus-btn-update {
            background: #EE6B5F; color: #fff;
            box-shadow: 0 6px 16px rgba(238, 107, 95, 0.3);
          }
          .domus-btn-update:hover { background: #DC564A; transform: translateY(-2px); }
          .domus-btn-recipe {
            background: #5E7AC6; color: #fff;
            box-shadow: 0 6px 16px rgba(94, 122, 198, 0.3);
          }
          .domus-btn-recipe:hover { background: #4864B0; transform: translateY(-2px); }

          /* 4. MODAL FLOTANTE TECLADO NUMÉRICO TÁCTIL (NUMPAD MODAL) */
          .domus-numpad-backdrop {
            position: fixed; inset: 0; z-index: 230;
            background: rgba(15, 23, 42, 0.55);
            backdrop-filter: blur(12px);
            display: flex; align-items: center; justify-content: center;
            padding: 16px;
            animation: domusInvFade 0.2s ease;
          }
          .domus-numpad-window {
            width: 100%; max-width: 430px;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(30px);
            border: 1.5px solid #fff;
            border-radius: 32px; padding: 22px;
            box-shadow: 0 28px 70px rgba(15, 23, 42, 0.38);
            display: flex; flex-direction: column; gap: 14px;
          }
          .domus-numpad-header {
            display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
          }
          .domus-numpad-mode-tag {
            display: inline-block; font-size: 9px; font-weight: 900;
            letter-spacing: 0.1em; padding: 4px 10px; border-radius: 99px;
            margin-bottom: 4px;
          }
          .domus-numpad-header h3 {
            margin: 0; font-size: 20px; font-weight: 900; color: #202020;
          }
          .domus-numpad-header small { font-size: 11.5px; color: #666; }
          .domus-numpad-close {
            width: 34px; height: 34px; border-radius: 50%; border: none;
            background: #F4F6FA; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
          }

          .domus-numpad-ops {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
          }
          .domus-numpad-op-btn {
            padding: 9px 6px; border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.08); background: #F7F9FC;
            font-size: 10px; font-weight: 900; color: #555; cursor: pointer;
          }
          .domus-numpad-op-btn.active {
            background: var(--op-col); color: #fff; border-color: var(--op-col);
          }

          .domus-numpad-recipe-select label {
            display: block; font-size: 9.5px; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.08em; color: #5E7AC6;
            margin-bottom: 4px;
          }
          .domus-numpad-recipe-select select {
            width: 100%; padding: 10px 12px; border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC;
            font-size: 12px; font-weight: 800; color: #202020; outline: none;
          }

          .domus-numpad-screen {
            display: flex; align-items: center; justify-content: space-between;
            background: #181C26; color: #fff;
            padding: 14px 18px; border-radius: 20px;
            box-shadow: inset 0 3px 8px rgba(0,0,0,0.35);
          }
          .domus-numpad-value-box {
            display: flex; align-items: baseline; gap: 6px;
          }
          .domus-numpad-sign {
            font-size: 22px; font-weight: 900; color: #6EE7B7;
          }
          .domus-numpad-digits {
            font-size: 34px; font-weight: 900; letter-spacing: -0.03em; color: #fff;
          }
          .domus-numpad-unit-dropdown {
            background: rgba(255, 255, 255, 0.14);
            color: #fff; border: 1px solid rgba(255, 255, 255, 0.28);
            padding: 9px 12px; border-radius: 12px;
            font-size: 13px; font-weight: 900; cursor: pointer; outline: none;
          }
          .domus-numpad-unit-dropdown option {
            background: #181C26; color: #fff;
          }

          .domus-numpad-presets {
            display: flex; flex-wrap: wrap; gap: 6px;
          }
          .domus-numpad-presets button {
            flex: 1; min-width: 58px;
            padding: 7px 6px; border-radius: 10px;
            border: 1px solid rgba(94, 122, 198, 0.25);
            background: rgba(94, 122, 198, 0.08);
            color: #5E7AC6; font-size: 10.5px; font-weight: 900;
            cursor: pointer;
          }
          .domus-numpad-presets button:hover {
            background: #5E7AC6; color: #fff;
          }

          .domus-numpad-grid {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
          }
          .domus-numpad-key {
            height: 54px; border-radius: 16px;
            border: 1px solid rgba(0, 0, 0, 0.06);
            background: #F4F6FA; color: #202020;
            font-size: 20px; font-weight: 900;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.15s ease;
          }
          .domus-numpad-key:hover {
            background: #E8ECF5; transform: translateY(-2px);
          }
          .domus-numpad-key:active { transform: scale(0.94); }
          .domus-key-back { color: #EE6B5F; }

          .domus-numpad-footer {
            display: grid; grid-template-columns: 1fr 1.8fr; gap: 10px;
            margin-top: 2px;
          }
          .domus-numpad-clear-btn {
            padding: 14px; border-radius: 16px;
            border: 1px solid rgba(0,0,0,0.1); background: #fff;
            font-size: 11.5px; font-weight: 900; color: #666; cursor: pointer;
          }
          .domus-numpad-confirm-btn {
            padding: 14px; border-radius: 16px; border: none;
            color: #fff; font-size: 13px; font-weight: 900; letter-spacing: 0.08em;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer; box-shadow: 0 10px 24px rgba(94, 122, 198, 0.35);
          }

          /* ADD DRAWER & ORDER PANELS */
          .domus-add-drawer {
            background: #fff; border: 1.5px solid rgba(94, 122, 198, 0.35);
            border-radius: 24px; padding: 18px;
          }
          .domus-add-drawer-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
          }
          .domus-add-drawer-head span { font-size: 9.5px; font-weight: 900; color: #5E7AC6; }
          .domus-add-drawer-head h4 { margin: 2px 0 0; font-size: 16px; font-weight: 900; }
          .domus-add-drawer-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;
          }
          .domus-add-drawer-grid label {
            display: block; font-size: 9.5px; font-weight: 900; color: #666; margin-bottom: 4px;
          }
          .domus-add-drawer-grid input, .domus-add-drawer-grid select {
            width: 100%; box-sizing: border-box; padding: 9px 11px; border-radius: 11px;
            border: 1px solid rgba(0,0,0,0.12); background: #F7F9FC; font-size: 12px; font-weight: 700;
          }
          .domus-add-drawer-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
          .domus-save-new-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 10px 18px; border-radius: 12px; border: none;
            background: #10B981; color: #fff; font-size: 11.5px; font-weight: 900; cursor: pointer;
          }

          .domus-order-layout {
            display: grid; grid-template-columns: 1fr; gap: 20px;
          }
          @media (min-width: 960px) { .domus-order-layout { grid-template-columns: 1.3fr 1fr; } }
          .domus-order-list-panel, .domus-order-summary-panel {
            background: rgba(255, 255, 255, 0.85); border: 1.5px solid #fff;
            border-radius: 26px; padding: 22px;
          }
          .domus-order-banner {
            display: flex; justify-content: space-between; align-items: flex-start;
            gap: 12px; margin-bottom: 16px;
          }
          .domus-order-banner h3 { margin: 0 0 4px; font-size: 18px; font-weight: 900; }
          .domus-order-banner p { margin: 0; font-size: 12px; color: #666; }
          .domus-order-count {
            background: rgba(238, 107, 95, 0.15); color: #EE6B5F;
            padding: 6px 12px; border-radius: 99px; font-size: 11px; font-weight: 900;
          }
          .domus-order-items { display: flex; flex-direction: column; gap: 10px; }
          .domus-order-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px; border-radius: 16px; background: #F7F9FC;
          }
          .domus-order-row img { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; }
          .domus-order-info { flex: 1; display: flex; flex-direction: column; }
          .domus-order-info strong { font-size: 13.5px; font-weight: 900; color: #202020; }
          .domus-order-info span { font-size: 11px; color: #666; font-weight: 600; }
          .domus-order-suggest { text-align: right; }
          .domus-order-suggest small { display: block; font-size: 8.5px; font-weight: 800; color: #888; }
          .domus-order-suggest strong { font-size: 14px; font-weight: 900; color: #EE6B5F; }
          .domus-order-label {
            display: block; font-size: 10px; font-weight: 900; text-transform: uppercase;
            color: #5E7AC6; margin: 12px 0 6px;
          }
          .domus-order-textarea {
            width: 100%; box-sizing: border-box; padding: 12px; border-radius: 14px;
            border: 1px solid rgba(0,0,0,0.1); background: #F7F9FC; font-family: inherit;
          }
          .domus-order-submit-btn {
            width: 100%; padding: 15px; border: none; border-radius: 16px;
            background: #5E7AC6; color: #fff; font-size: 12px; font-weight: 900;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer; margin-top: 14px;
          }
          .domus-order-sent-box {
            margin-top: 14px; padding: 14px; border-radius: 16px;
            background: rgba(16, 185, 129, 0.14); color: #065F46;
            display: flex; align-items: center; gap: 12px;
          }
          .domus-log-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }

          /* FOOTER */
          .domus-inv-footer {
            position: relative; z-index: 2;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.78);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 12px;
          }
          .domus-inv-footer-left span { font-size: 11px; font-weight: 700; color: #666; }
          .domus-inv-footer-actions { display: flex; align-items: center; gap: 10px; }
          .domus-inv-cta-coral {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 11px 18px; border-radius: 14px; border: none;
            background: #EE6B5F; color: #fff; font-size: 11px; font-weight: 900; cursor: pointer;
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