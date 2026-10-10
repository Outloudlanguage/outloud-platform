import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// ==========================================
// 1. REUSABLE UI COMPONENTS
// ==========================================
const AnimatedButton = ({ text, fullWidth = false, onClick, secondary = false }) => {
  const chars = text.split('');
  return (
    <button onClick={onClick} className={`group/btn relative px-4 py-2 md:px-8 md:py-3 rounded-full backdrop-blur-lg border font-bold tracking-widest text-[9px] md:text-base transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 hover:-translate-y-1 active:scale-95 ${fullWidth ? 'w-full' : ''} ${secondary ? 'bg-transparent border-white/40 text-white hover:bg-white/10 hover:border-white' : 'bg-white/10 border-[#4A90E2]/50 text-white hover:bg-[#4A90E2]/20 hover:border-[#4A90E2] hover:shadow-[0_0_20px_rgba(74,144,226,0.4)]'}`}>
      <div className="relative overflow-hidden flex items-center justify-center">
        <div className="flex">
          {chars.map((char, i) => (
            <span key={i} className="block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/btn:-translate-y-[150%] group-hover/btn:rotate-[-8deg]" style={{ transitionDelay: `${i * 0.02}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="flex">
            {chars.map((char, i) => (
              <span key={i} className="block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] translate-y-[150%] rotate-[8deg] group-hover/btn:translate-y-0 group-hover/btn:rotate-0" style={{ transitionDelay: `${i * 0.02}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

const LargeHeroCard = ({ title, imgUrl, textSize = "text-[12vw] md:text-[9vw]" }) => {
  const renderTitle = () => {
    if (typeof title === 'string') {
      if (title.toUpperCase() === 'CATERING') {
        return <>C<span className="inline-block mr-[0.05em] md:mr-[0.08em]"></span>ATERING</>;
      }
      if (title.toUpperCase() === 'MENÚ EJECUTIVO') {
        return <>MENÚ <span className="whitespace-nowrap"><span className="inline-block mr-[0.03em] md:mr-[0.05em]">E</span>JECUTIVO</span></>;
      }
    }
    return title;
  };

  return (
    <section className="relative w-full h-[250px] md:h-[70vh] rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl group border border-white/20">
      <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] group-hover:bg-black/10 transition-colors duration-500"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
        <h1 className={`${textSize} font-black tracking-tight leading-none mb-2 md:mb-4 text-white drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out cursor-default hover:scale-105 hover:-translate-y-2 hover:text-[#F3A712] hover:tracking-wide hover:drop-shadow-[0_10px_30px_rgba(243,167,18,0.85)] uppercase`}>
          {renderTitle()}
        </h1>
        <div className="flex space-x-3 md:space-x-6 mt-2 md:mt-8">
          <AnimatedButton text="PRECIOS" secondary={true} />
          <AnimatedButton text="CATÁLOGO" />
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ title, subtitle, description, abbreviation, bgImage }) => (
  <div className="group/card relative w-full h-[200px] md:h-[400px] rounded-[16px] md:rounded-[30px] overflow-hidden shadow-lg cursor-default flex flex-col border border-white/30 transition-all duration-500 hover:border-white/80">
    <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover/card:scale-110" style={{ backgroundImage: `url('${bgImage}')` }}></div>
    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-500 group-hover/card:opacity-0"></div>
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"></div>

    <div className="absolute inset-0 p-4 md:p-8 transition-opacity duration-500 group-hover/card:opacity-0 flex flex-col z-10">
      <h3 className="text-sm md:text-2xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">{title}</h3>
      <p className="text-[8px] md:text-xs font-bold text-white/90 tracking-widest uppercase mt-1 md:mt-3 drop-shadow-md">{subtitle}</p>
      <div className="absolute bottom-2 md:bottom-4 left-4 md:left-6 text-white/30 text-[60px] md:text-[140px] font-black leading-none tracking-tighter select-none drop-shadow-lg">
        {abbreviation}
      </div>
    </div>

    <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between opacity-0 translate-y-4 md:translate-y-8 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/card:opacity-100 group-hover/card:translate-y-0 text-white z-20">
      <div>
        <h3 className="text-sm md:text-2xl font-extrabold tracking-tight leading-none">{title}</h3>
        <p className="text-[8px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mt-1 md:mt-3 hidden md:block">{subtitle}</p>
      </div>
      <p className="text-[10px] md:text-lg font-medium leading-tight md:leading-snug mb-2 md:mb-6 drop-shadow-md line-clamp-3 md:line-clamp-none">
        {description}
      </p>
      <div className="w-full">
        <AnimatedButton text="COTIZAR" fullWidth={true} />
      </div>
    </div>
  </div>
);


// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================
export default function CataLanding() {
  const containerRef = useRef();
  const [activeTab, setActiveTab] = useState('SERVICIOS');
  
  // ==========================================
  // STATE: CALCULATOR
  // ==========================================
  const [activeCategory, setActiveCategory] = useState('invitados');
  const [invitados, setInvitados] = useState(50);
  const [salados, setSalados] = useState(6);
  const [dulces, setDulces] = useState(3);
  const [basicos, setBasicos] = useState(1);
  const [premium, setPremium] = useState(0);
  const [bebidas, setBebidas] = useState(3);
  const [isDelivery, setIsDelivery] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const costoSalados = (invitados * salados) * ((invitados * salados) >= 100 ? 0.65 : 0.80);
  const costoDulces = (invitados * dulces) * ((invitados * dulces) >= 100 ? 0.65 : 0.80);
  const costoBasicos = invitados * basicos * 8.00;
  const costoPremium = invitados * premium * 12.00;
  const costoBebidas = invitados * bebidas * 4.00;
  const costoExtras = isDelivery ? 50.00 : 15.00;
  const costoTotal = costoSalados + costoDulces + costoBasicos + costoPremium + costoBebidas + costoExtras;
  const maxChartValue = Math.max(costoSalados, costoDulces, costoBasicos, costoPremium, costoBebidas, costoExtras, 1);

  const categoryConfig = {
    invitados: { label: 'Cantidad de Invitados', min: 10, max: 500, step: 5, unit: 'personas', val: invitados, set: setInvitados },
    salados: { label: 'Pasapalos Salados', min: 0, max: 25, step: 1, unit: 'unidades por persona', val: salados, set: setSalados },
    dulces: { label: 'Pasapalos Dulces', min: 0, max: 25, step: 1, unit: 'unidades por persona', val: dulces, set: setDulces },
    basicos: { label: 'Platos Principales (Básicos)', min: 0, max: 3, step: 1, unit: 'por persona', val: basicos, set: setBasicos },
    premium: { label: 'Platos Principales (Premium)', min: 0, max: 3, step: 1, unit: 'por persona', val: premium, set: setPremium },
    bebidas: { label: 'Bebidas Variadas', min: 0, max: 10, step: 1, unit: 'por persona', val: bebidas, set: setBebidas }
  };
  const activeConfig = categoryConfig[activeCategory];

  // ==========================================
  // STATE: COVERFLOW & DISTRIBUTION DOUGHNUT
  // ==========================================
  const [activePaquete, setActivePaquete] = useState(0);
  const [hoveredRing, setHoveredRing] = useState(null);
  const scrollIntervalRef = useRef(null); // Ref para controlar el auto-scroll

  const paquetesData = [
    { 
      title: "Corporativos", desc: "Coffee break premium, almuerzo de negocios y logística audiovisual para juntas de alto nivel.", price: "450", img: "https://images.unsplash.com/photo-1528605105345-5344ea20e269?auto=format&fit=crop&q=80&w=800",
      distribution: [ { label: "Platos Fuertes", val: 40, color: "#4A90E2" }, { label: "Bebidas", val: 30, color: "#F3A712" }, { label: "Servicios", val: 20, color: "#FFFFFF" }, { label: "Postres", val: 10, color: "#A855F7" } ]
    },
    { 
      title: "Fiestas", desc: "Selección de pasapalos, coctelería de autor y montaje lounge para celebraciones vibrantes.", price: "350", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
      distribution: [ { label: "Bebidas/Barra", val: 40, color: "#F3A712" }, { label: "P. Salados", val: 30, color: "#E11D48" }, { label: "Entretenimiento", val: 20, color: "#10B981" }, { label: "P. Dulces", val: 10, color: "#A855F7" } ]
    },
    { 
      title: "Bodas", desc: "Banquete a 3 tiempos, decoración floral inmersiva y barra libre premium para tu gran día.", price: "850", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
      distribution: [ { label: "Platos Fuertes", val: 45, color: "#4A90E2" }, { label: "Bebidas", val: 25, color: "#F3A712" }, { label: "Decoración", val: 20, color: "#EC4899" }, { label: "Postres", val: 10, color: "#A855F7" } ]
    },
    { 
      title: "Fijos", desc: "Servicio de comedor ejecutivo con menús rotativos diarios. Contratación mensual.", price: "1200", img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800",
      distribution: [ { label: "Platos Fuertes", val: 75, color: "#4A90E2" }, { label: "Bebidas", val: 15, color: "#F3A712" }, { label: "Postres", val: 10, color: "#A855F7" } ]
    },
    { 
      title: "Postres", desc: "Boutique dulce con mesa de tartas, macarons, bombones artesanales y pastelería fina.", price: "200", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800",
      distribution: [ { label: "Postres Finos", val: 80, color: "#A855F7" }, { label: "Bebidas", val: 10, color: "#F3A712" }, { label: "Decoración", val: 10, color: "#EC4899" } ]
    },
    { 
      title: "Temporada", desc: "Hallacas, pan de jamón, y menú navideño tradicional con ambientación festiva exclusiva.", price: "500", img: "https://images.unsplash.com/photo-1607335614551-3062bf90f30e?auto=format&fit=crop&q=80&w=800",
      distribution: [ { label: "Platos Fuertes", val: 40, color: "#4A90E2" }, { label: "Bebidas", val: 30, color: "#F3A712" }, { label: "P. Salados", val: 15, color: "#E11D48" }, { label: "Postres", val: 15, color: "#A855F7" } ]
    }
  ];

  // Controladores de Auto-Scroll Laterales
  const triggerNext = () => setActivePaquete(prev => (prev < paquetesData.length - 1 ? prev + 1 : prev));
  const triggerPrev = () => setActivePaquete(prev => (prev > 0 ? prev - 1 : prev));

  const startHoverScroll = (dir) => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    if (dir === 'next') triggerNext(); else triggerPrev(); // Avanza 1 de inmediato
    
    scrollIntervalRef.current = setInterval(() => {
      if (dir === 'next') triggerNext(); else triggerPrev();
    }, 1000); // 1 segundo da tiempo perfecto para que termine la transición de 700ms
  };

  const stopHoverScroll = () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
  };

  useEffect(() => {
    return () => stopHoverScroll(); // Limpia el intervalo si el usuario sale de la página
  }, []);

  // Doughnut Math Calculations
  const radius = 42;
  const circum = 2 * Math.PI * radius; 
  const gap = 2;

  const getDoughnutSegments = () => {
    let currentOffset = 0;
    return paquetesData[activePaquete].distribution.map((item, index) => {
      const segmentValue = item.val / 100;
      const segmentDash = segmentValue * circum;
      const offsetToApply = currentOffset;
      currentOffset -= segmentDash;

      return {
        ...item,
        dashArray: `${segmentDash - gap} ${circum}`,
        dashOffset: offsetToApply,
        index
      };
    });
  };

  const segments = getDoughnutSegments();

  // Assets
  const loadingLogoUrl = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Logo%20Cata%20Azul.png";
  const headerLogoUrl = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Cata%20horizontal%20logo%20(1).png";
  const cloudflareVideo = "https://customer-b0aw0ze4tgacea6a.cloudflarestream.com/0a048c047845136e3bccd777d507dfde/iframe?autoplay=true&loop=true&muted=true&controls=false&poster=https%3A%2F%2Fcustomer-b0aw0ze4tgacea6a.cloudflarestream.com%2F0a048c047845136e3bccd777d507dfde%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600";

  const gastroServices = [
    { title: "Eventos Corporativos", subtitle: "Reuniones de Negocios", description: "Soluciones gastronómicas integrales para potenciar la imagen de su empresa en cada evento corporativo.", abbreviation: "Ec", bgImage: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800" },
    { title: "Coffee Break", subtitle: "Pausas Activas", description: "Café de especialidad y bollería artesanal para conferencias.", abbreviation: "Cb", bgImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800" },
    { title: "Postres", subtitle: "Alta Repostería", description: "Creaciones dulces artesanales que deslumbran la vista y conquistan el paladar.", abbreviation: "Pt", bgImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800" },
    { title: "Bodas y Galas", subtitle: "Banquetes a 3 Tiempos", description: "Alta cocina con emplatado de precisión milimétrica.", abbreviation: "Bg", bgImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800" }
  ];

  const orgServices = [
    { title: "Mobiliario", subtitle: "Alquiler de Espacios", description: "Sillas, mesas y lounges de diseño para estructurar y acomodar cómodamente tu evento.", abbreviation: "Mb", bgImage: "https://images.unsplash.com/photo-1600224503431-2b507981ad32?q=80&w=876&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" },
    { title: "Decoraciones", subtitle: "Ambientación Temática", description: "Transformamos los espacios con conceptos visuales que reflejan fielmente tu visión.", abbreviation: "Dc", bgImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800" },
    { title: "Arreglos Florales", subtitle: "Diseño Botánico", description: "Centros de mesa y composiciones florales frescas para aportar vida y elegancia.", abbreviation: "Af", bgImage: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800" },
    { title: "Servicios Limpieza", subtitle: "Mantenimiento Integral", description: "Personal discreto y dedicado a mantener la impecabilidad del lugar en todo momento.", abbreviation: "Lm", bgImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" }
  ];

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.to('#solid-logo', { duration: 0.8 })
      .to('#solid-logo', { scale: 150, opacity: 0, duration: 1.2, ease: "expo.inOut" })
      .to('#loading-screen', { opacity: 0, duration: 0.6, ease: "power2.out", onComplete: () => { document.getElementById('loading-screen').style.display = 'none'; } }, "-=0.8");
  }, { scope: containerRef });

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
  }, [isModalOpen]);

  return (
    <div ref={containerRef} className="relative min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* Loading Screen */}
      <div id="loading-screen" className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden pointer-events-none">
        <img id="solid-logo" src={loadingLogoUrl} alt="Loading..." className="absolute w-[120px] md:w-[180px] z-20" />
      </div>

      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-80">
          <iframe src={cloudflareVideo} loading="lazy" className="w-full h-full scale-105 pointer-events-none" style={{ border: 'none' }} allow="autoplay; encrypted-media;" allowFullScreen></iframe>
        </div>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[4px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <img src={headerLogoUrl} alt="CATA" className="ml-3 md:ml-5 h-[35px] md:h-[45px] object-contain drop-shadow-md" />
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-2 text-sm font-semibold tracking-wider">
              {['SERVICIOS', 'GALERÍA', 'PRESUPUESTOS', 'CONTACTO', 'EMPLEOS'].map(item => (
                <button key={item} onClick={() => setActiveTab(item)} className={`px-5 py-2.5 rounded-xl transition-all duration-300 border ${activeTab === item ? 'bg-white/30 backdrop-blur-md border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-transparent text-gray-200 hover:bg-white/20 hover:backdrop-blur-md hover:border-white/40 hover:text-white hover:-translate-y-0.5'}`}>
                  {item}
                </button>
              ))}
            </div>
            <button className="ml-4 md:ml-8 p-2 text-2xl text-white hover:text-blue-300 transition-colors">≡</button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 md:px-6 pt-[90px] md:pt-[120px] pb-10 max-w-[1800px] mx-auto flex flex-col gap-4 md:gap-10">
        
        {/* ==========================================
            GASTRONOMY SECTION (HERO CARDS)
        ========================================== */}
        <LargeHeroCard title="CATERING" imgUrl="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/photo-1512061942530-e6a4e9a5cf27%20(1).avif" />
        <LargeHeroCard title="MENÚ EJECUTIVO" textSize="text-[10vw] md:text-[8vw]" imgUrl="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200" />
        <LargeHeroCard title="PASAPALOS" imgUrl="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/photo-1518619745898-93e765966dcd%20(1).avif" />
        <LargeHeroCard title="BUFFETS" imgUrl="https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Gemini_Generated_Image_kegi84kegi84kegi.jfif" />

        {/* ==========================================
            GASTRONOMY SECTION (SMALL GRID)
        ========================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-2 md:mt-6">
          {gastroServices.map((service, index) => <ServiceCard key={index} {...service} />)}
        </section>

        {/* ==========================================
            COVERFLOW PAQUETES & RESOURCE DOUGHNUT
        ========================================== */}
        <section className="w-full mt-10 md:mt-16 rounded-[24px] md:rounded-[40px] bg-[#111]/80 backdrop-blur-3xl border border-white/10 p-4 md:p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#F3A712]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="mb-8 md:mb-10 text-center md:text-left pl-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 text-white">COLECCIONES CATA</h2>
            <p className="text-sm md:text-base text-gray-400 font-medium">Experiencias pre-diseñadas con la firma de nuestros expertos.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-6 items-center">
            
            {/* Lado Izquierdo: 3D Coverflow Slider con Hitboxes de Auto-Scroll */}
            <div className="relative w-full h-[450px] md:h-[500px] flex items-center justify-center perspective-[1200px] overflow-hidden md:overflow-visible">
              
              {/* ZONA DE HOVER/CLICK IZQUIERDA (Para retroceder) */}
              <div 
                className="absolute left-0 top-0 w-[20%] h-full z-50 flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onMouseEnter={() => startHoverScroll('prev')}
                onMouseLeave={stopHoverScroll}
                onClick={(e) => { e.preventDefault(); stopHoverScroll(); triggerPrev(); }}
              >
                <div className="w-full h-full bg-gradient-to-r from-black/60 to-transparent flex items-center pl-2 md:pl-6">
                  <span className="text-white text-4xl md:text-5xl drop-shadow-lg">‹</span>
                </div>
              </div>

              {/* ZONA DE HOVER/CLICK DERECHA (Para avanzar) */}
              <div 
                className="absolute right-0 top-0 w-[20%] h-full z-50 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onMouseEnter={() => startHoverScroll('next')}
                onMouseLeave={stopHoverScroll}
                onClick={(e) => { e.preventDefault(); stopHoverScroll(); triggerNext(); }}
              >
                <div className="w-full h-full bg-gradient-to-l from-black/60 to-transparent flex items-center justify-end pr-2 md:pr-6">
                  <span className="text-white text-4xl md:text-5xl drop-shadow-lg">›</span>
                </div>
              </div>

              {paquetesData.map((paquete, index) => {
                const offset = index - activePaquete;
                const absOffset = Math.abs(offset);
                const isActive = offset === 0;
                
                // Coverflow math parameters
                const translateX = offset * 45; 
                const scale = isActive ? 1 : Math.max(0.6, 1 - absOffset * 0.15);
                const rotateY = offset === 0 ? 0 : offset > 0 ? -35 : 35;
                const zIndex = 20 - absOffset;
                const opacity = isActive ? 1 : Math.max(0.4, 0.8 - absOffset * 0.15);

                return (
                  <div 
                    key={index}
                    className="absolute w-[80%] max-w-[320px] h-[400px] md:h-[450px] rounded-[24px] overflow-hidden shadow-2xl border border-white/20 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-end p-6"
                    style={{
                      transform: `translateX(${translateX}%) translateZ(${isActive ? 50 : -absOffset * 100}px) rotateY(${rotateY}deg) scale(${scale})`,
                      zIndex: zIndex,
                      opacity: opacity,
                      transformStyle: 'preserve-3d',
                      backgroundImage: `url('${paquete.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${isActive ? 'opacity-30' : 'opacity-60'}`}></div>
                    
                    {/* Tarjeta de Contenido Activo */}
                    <div className={`relative z-10 bg-black/60 backdrop-blur-md p-5 md:p-6 rounded-[20px] border border-white/10 transition-all duration-500 transform ${isActive ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                      <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-1 leading-none">{paquete.title}</h3>
                      <p className="text-[#F3A712] font-bold text-lg md:text-xl mb-3">Desde ${paquete.price}</p>
                      <p className="text-[10px] md:text-xs text-gray-200 leading-snug mb-5 hidden md:block">{paquete.desc}</p>
                      <div className="flex flex-col gap-2">
                        <AnimatedButton text="CONTRATAR" fullWidth={true} />
                        <button onClick={(e) => { e.stopPropagation(); document.getElementById('calculadora-section')?.scrollIntoView({behavior: 'smooth'}); }} className="px-4 py-2 rounded-full border border-white/40 text-white font-bold tracking-widest text-[10px] md:text-xs hover:bg-white hover:text-black transition-colors w-full text-center">
                          PERSONALIZAR
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lado Derecho: Resource Distribution Doughnut Chart */}
            <div className="flex flex-col items-center justify-center relative h-[350px] md:h-[500px] bg-black/20 rounded-[30px] border border-white/5 p-4 md:p-8">
              <h3 className="absolute top-6 left-8 text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase">Distribución de Recursos</h3>
              
              <div className="relative w-[240px] h-[240px] md:w-[320px] md:h-[320px] mt-4">
                
                {/* Centro Dinámico (Valor Numérico y Etiqueta) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                   {hoveredRing !== null ? (
                      <>
                        <span className="text-5xl md:text-6xl font-black text-white drop-shadow-lg" style={{ color: segments[hoveredRing].color }}>
                          {segments[hoveredRing].val}%
                        </span>
                        <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest mt-1 text-center max-w-[120px]">
                          {segments[hoveredRing].label}
                        </span>
                      </>
                   ) : (
                      <>
                        <span className="text-xl md:text-2xl font-black text-white/50 tracking-tighter uppercase text-center leading-none">
                          {paquetesData[activePaquete].title}
                        </span>
                        <span className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">
                          Distribución
                        </span>
                      </>
                   )}
                </div>

                {/* Anillo SVG Dinámico */}
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-2xl overflow-visible">
                  {segments.map((segment) => {
                    const isHovered = hoveredRing === segment.index;
                    const isAnyHovered = hoveredRing !== null;
                    return (
                      <circle
                        key={`${activePaquete}-${segment.index}`} 
                        cx="50" cy="50" r={radius}
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth={isHovered ? "14" : "10"}
                        strokeDasharray={segment.dashArray}
                        strokeDashoffset={segment.dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer origin-center animate-[drawRing_1s_ease-out_forwards]"
                        style={{ 
                          opacity: !isAnyHovered || isHovered ? 1 : 0.3, 
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                        onMouseEnter={() => setHoveredRing(segment.index)}
                        onMouseLeave={() => setHoveredRing(null)}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Leyenda Horizontal Inferior */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6 md:mt-10">
                {segments.map((seg) => (
                  <div key={seg.index} className="flex items-center gap-2" onMouseEnter={() => setHoveredRing(seg.index)} onMouseLeave={() => setHoveredRing(null)}>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                    <span className="text-[9px] md:text-[10px] text-gray-300 font-bold uppercase tracking-wider cursor-pointer hover:text-white transition-colors">{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          <p className="text-[9px] md:text-[11px] text-gray-500 mt-8 text-center border-t border-white/10 pt-4">
            * Todos los paquetes mostrados toman como base referencial un aforo de 20 personas. Si se selecciona la opción de personalizar para un evento de mayor capacidad, la cotización se ajustará proporcionalmente mediante el cotizador.
          </p>
        </section>

        {/* ==========================================
            DYNAMIC CALCULATOR SECTION 
        ========================================== */}
        <section id="calculadora-section" className="w-full mt-10 md:mt-16 rounded-[24px] md:rounded-[40px] bg-white/10 backdrop-blur-2xl border border-white/20 p-6 md:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4A90E2]/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 text-white">PROYECTA TU EVENTO</h2>
            <p className="text-sm md:text-base text-white/90 font-medium">Configura las variables y obtén un estimado al instante.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <label className="text-xs font-bold text-white tracking-widest uppercase mb-2 block">Variable a ajustar</label>
                <select 
                  value={activeCategory} 
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full bg-black/40 text-white text-base md:text-lg p-4 rounded-2xl border border-white/20 appearance-none outline-none focus:border-[#4A90E2] transition-colors cursor-pointer font-semibold"
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key} className="bg-gray-900 text-white">{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-black/20 p-6 rounded-3xl border border-white/10">
                <div className="flex flex-col items-center justify-center mb-6">
                  <span className="text-6xl font-black text-white drop-shadow-lg mb-1">{activeConfig.val}</span>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{activeConfig.unit}</span>
                </div>
                <input 
                  type="range" 
                  min={activeConfig.min} max={activeConfig.max} step={activeConfig.step}
                  value={activeConfig.val} 
                  onChange={(e) => activeConfig.set(Number(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#4A90E2] transition-all"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/10">
                <span className="text-sm font-bold text-white tracking-wide">Modalidad</span>
                <div className="flex space-x-2 bg-black/60 rounded-full p-1">
                  <button onClick={() => setIsDelivery(false)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${!isDelivery ? 'bg-[#4A90E2] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}>Pick Up</button>
                  <button onClick={() => setIsDelivery(true)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${isDelivery ? 'bg-[#4A90E2] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}>Delivery</button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-black/40 rounded-[30px] border border-white/10 p-6 md:p-8 flex flex-col justify-between">
              <div className="w-full h-[220px] md:h-[280px] flex items-end justify-between gap-2 md:gap-4 mb-10 md:mb-12 relative">
                <div className="absolute bottom-0 left-0 w-full h-px bg-white/40"></div>
                
                {[
                  { label: "Salados", val: costoSalados, color: "bg-[#4A90E2]" },
                  { label: "Dulces", val: costoDulces, color: "bg-[#4A90E2]/80" },
                  { label: "Básicos", val: costoBasicos, color: "bg-white/80" },
                  { label: "Premium", val: costoPremium, color: "bg-white/60" },
                  { label: "Bebidas", val: costoBebidas, color: "bg-[#E2A74A]" },
                  { label: "Extras", val: costoExtras, color: "bg-purple-400/80", textCol: "text-purple-300" }
                ].map((bar, i) => (
                  <div key={i} className="w-full flex flex-col items-center justify-end h-full group relative pb-[1px]">
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 text-xs font-bold bg-white text-black px-2 py-1 rounded transition-opacity z-10">${bar.val.toFixed(0)}</span>
                    <div style={{ height: `${(bar.val / maxChartValue) * 100}%` }} className={`w-full ${bar.color} rounded-t-sm md:rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:brightness-125 min-h-[4px]`}></div>
                    <span className={`absolute top-full mt-2 text-[8px] md:text-[11px] ${bar.textCol || "text-white"} font-bold text-center w-[150%] left-1/2 -translate-x-1/2 tracking-tighter md:tracking-normal`}>{bar.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-lg md:text-xl font-bold text-white">Total Aproximado</span>
                  <span className="text-4xl md:text-5xl font-black text-[#4A90E2] tracking-tighter transition-all duration-500">
                    ${costoTotal.toFixed(2)}
                  </span>
                </div>
                
                <div className="text-[10px] md:text-xs text-white/80 leading-tight mb-6 space-y-1">
                  <p>* Los precios al mayor ($0.65/und) se aplican automáticamente en pasapalos salados y dulces al superar 100 unidades.</p>
                  {!isDelivery ? (
                    <p className="text-purple-300">* Se ha aplicado un cargo fijo de <strong>$15.00</strong> por concepto de empaque especial para Pick Up.</p>
                  ) : (
                    <p className="text-purple-300">* Se ha aplicado una tarifa base de <strong>$50.00</strong> por Delivery. Este monto puede variar si la distancia supera los 10 kilómetros.</p>
                  )}
                </div>

                <AnimatedButton text="SOLICITAR PRESUPUESTO" fullWidth={true} onClick={() => setIsModalOpen(true)} />
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            EVENT ORGANIZATION SECTION 
        ========================================== */}
        <div className="mt-16 md:mt-24 mb-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">ORGANIZACIÓN DE EVENTOS</h2>
          <div className="w-24 h-1 bg-[#4A90E2] mx-auto mt-4 rounded-full"></div>
        </div>

        <LargeHeroCard title="BARRAS DE BEBIDAS" textSize="text-[9vw] md:text-[7vw]" imgUrl="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200" />
        <LargeHeroCard title="MÚSICA" imgUrl="https://images.unsplash.com/photo-1769230364868-a3c7588ed628?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" />
        <LargeHeroCard title="FOTOGRAFÍA" textSize="text-[11vw] md:text-[8vw]" imgUrl="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200" />

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-2 md:mt-6">
          {orgServices.map((service, index) => <ServiceCard key={index} {...service} />)}
        </section>
        
      </main>

      {/* ==========================================
          FOOTER / CONTACT MOCKUP
      ========================================== */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 mt-10 p-10 md:p-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col items-center md:items-start space-y-6">
            <img src={headerLogoUrl} alt="CATA" className="h-[40px] md:h-[50px] object-contain drop-shadow-md opacity-80" />
            <p className="text-sm text-gray-400 text-center md:text-left max-w-xs">
              Elevando el estándar de la gastronomía y la producción de eventos para celebraciones inolvidables.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-[#4A90E2] transition-colors"><span className="text-lg">📷</span></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-[#4A90E2] transition-colors"><span className="text-lg">📘</span></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-[#4A90E2] transition-colors"><span className="text-lg">🎵</span></a>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end justify-center space-y-4 text-center md:text-right">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Escríbenos</p>
              <a href="mailto:contacto@cataservicios.com" className="text-lg font-medium text-white hover:text-[#4A90E2] transition-colors">contacto@cataservicios.com</a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Llámanos</p>
              <a href="tel:+584121234567" className="text-xl font-black text-white hover:text-[#4A90E2] tracking-wider transition-colors">+58 412 123 4567</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ==========================================
          DISCLAIMER MODAL
      ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#111] border border-white/20 rounded-[30px] p-8 md:p-10 shadow-2xl transform transition-all">
            <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-[#4A90E2]/20 flex items-center justify-center text-3xl">📄</div></div>
            <h3 className="text-2xl font-black tracking-tight text-center mb-4">Aviso Importante</h3>
            <p className="text-gray-300 text-sm leading-relaxed text-center mb-8">
              Este cálculo es una <strong>estimación referencial</strong> basada en los datos proporcionados y no constituye un contrato vinculante.
            </p>
            <div className="flex flex-col space-y-3">
              <button onClick={() => setIsModalOpen(false)} className="w-full py-4 rounded-full bg-[#4A90E2] hover:bg-[#357ABD] text-white font-bold tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(74,144,226,0.3)]">ENTENDIDO</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-3 rounded-full bg-transparent hover:bg-white/10 text-white/80 hover:text-white font-semibold tracking-widest text-xs transition-all">VOLVER</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Animaciones Base */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drawRing { from { stroke-dashoffset: 264; } }
      `}</style>
    </div>
  );
}