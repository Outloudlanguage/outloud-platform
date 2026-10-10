import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// 1. Reusable Animated Button Component
const AnimatedButton = ({ text, fullWidth = false }) => (
  <button className={`group relative px-8 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/40 text-white font-bold tracking-widest transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-white/30 hover:scale-105 hover:-translate-y-1 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 ${fullWidth ? 'w-full' : ''}`}>
    <div className="relative overflow-hidden h-[1.3em] flex items-center justify-center">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-[150%]">
        {text}
      </span>
      <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] translate-y-[150%] group-hover:translate-y-0">
        {text}
      </span>
    </div>
  </button>
);

// 2. Interactive Service Card Component (Pangram Style)
const ServiceCard = ({ title, subtitle, description, abbreviation }) => (
  <div className="group relative w-full h-[400px] rounded-[30px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50 transition-all duration-500 hover:bg-[#111111] hover:border-[#333333] shadow-lg cursor-default flex flex-col p-8">
    
    {/* Default State (Light) */}
    <div className="absolute inset-0 p-8 transition-opacity duration-500 group-hover:opacity-0 flex flex-col">
      <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">{title}</h3>
      <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mt-3">{subtitle}</p>
      
      {/* Abstract Background Graphic (Similar to the 'Aa' font preview) */}
      <div className="absolute bottom-4 left-6 text-gray-200 text-[140px] font-black leading-none tracking-tighter select-none">
        {abbreviation}
      </div>
    </div>

    {/* Hover State (Dark, reveals description and button) */}
    <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-0 translate-y-8 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-100 group-hover:translate-y-0 text-white z-10">
      <div>
        <h3 className="text-2xl font-extrabold tracking-tight leading-none">{title}</h3>
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mt-3">{subtitle}</p>
      </div>
      
      <p className="text-lg font-medium leading-snug mb-6 drop-shadow-md">
        {description}
      </p>
      
      <div className="w-full">
        <AnimatedButton text="COTIZAR" fullWidth={true} />
      </div>
    </div>
  </div>
);

export default function CataLanding() {
  const containerRef = useRef();
  const [activeTab, setActiveTab] = useState('SERVICIOS');

  // Assets
  const loadingLogoUrl = "https://i.postimg.cc/4dgfQW7T/Logo-Cata-Azul.png";
  const headerLogoUrl = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/Cata%20horizontal%20logo%20(1).png";
  const cateringImg = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/photo-1512061942530-e6a4e9a5cf27%20(1).avif";
  const pasapalosImg = "https://pub-4ca81ef087364b84a5b486b76cc2b72e.r2.dev/photo-1518619745898-93e765966dcd%20(1).avif";
  const cloudflareVideo = "https://customer-b0aw0ze4tgacea6a.cloudflarestream.com/0a048c047845136e3bccd777d507dfde/iframe?autoplay=true&loop=true&muted=true&controls=false&poster=https%3A%2F%2Fcustomer-b0aw0ze4tgacea6a.cloudflarestream.com%2F0a048c047845136e3bccd777d507dfde%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600";

  const navItems = ['SERVICIOS', 'GALERÍA', 'PRESUPUESTOS', 'CONTACTO', 'EMPLEOS'];

  // Mock Data for the progression grid
  const mockServices = [
    {
      title: "Menú Ejecutivo",
      subtitle: "Almuerzos Corporativos",
      description: "Opciones de almuerzo de alto nivel diseñadas específicamente para juntas directivas y reuniones corporativas.",
      abbreviation: "Ej"
    },
    {
      title: "Coffee Break",
      subtitle: "Pausas Activas",
      description: "Estaciones de café de especialidad, infusiones y bollería artesanal para mantener la energía en conferencias.",
      abbreviation: "Cb"
    },
    {
      title: "Estaciones Vivas",
      subtitle: "Cocina Interactiva",
      description: "Barras de sushi, ceviche o pastas preparadas al momento por nuestros chefs frente a los invitados.",
      abbreviation: "Ev"
    },
    {
      title: "Bodas y Galas",
      subtitle: "Banquetes a 3 Tiempos",
      description: "Servicio de alta cocina con emplatado de precisión milimétrica para eventos de gran envergadura.",
      abbreviation: "Bg"
    }
  ];

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.to('#solid-logo', { duration: 0.8 })
      .to('#solid-logo', { scale: 150, opacity: 0, duration: 1.2, ease: "expo.inOut" })
      .to('#loading-screen', {
        opacity: 0, duration: 0.6, ease: "power2.out",
        onComplete: () => { document.getElementById('loading-screen').style.display = 'none'; }
      }, "-=0.8");
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* Loading Screen */}
      <div id="loading-screen" className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden pointer-events-none">
        <img id="solid-logo" src={loadingLogoUrl} alt="Loading..." className="absolute w-[180px] z-20" />
      </div>

      {/* Seamless Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-60">
          <iframe src={cloudflareVideo} loading="lazy" className="w-full h-full scale-105 pointer-events-none" style={{ border: 'none' }} allow="autoplay; encrypted-media;" allowFullScreen></iframe>
        </div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]"></div>
      </div>

      {/* Glassmorphic Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <img src={headerLogoUrl} alt="CATA" className="h-[45px] object-contain drop-shadow-md" />
          <div className="hidden md:flex items-center space-x-2 text-sm font-semibold tracking-wider">
            {navItems.map(item => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`px-5 py-2.5 rounded-xl transition-all duration-300 border ${
                  activeTab === item
                    ? 'bg-white/30 backdrop-blur-md border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'border-transparent text-gray-200 hover:bg-white/20 hover:backdrop-blur-md hover:border-white/40 hover:text-white hover:-translate-y-0.5'
                }`}
              >
                {item}
              </button>
            ))}
            <button className="ml-4 p-2 text-2xl hover:text-blue-300 transition-colors">≡</button>
          </div>
        </div>
      </nav>

      {/* Main Content Sections */}
      <main className="relative z-10 px-6 pt-[120px] pb-20 max-w-[1800px] mx-auto flex flex-col gap-10">
        
        {/* HUGE BLOCK 1: CATERING */}
        <section className="relative w-full h-[70vh] rounded-[40px] overflow-hidden shadow-2xl group border border-white/20">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('${cateringImg}')` }}></div>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] group-hover:bg-black/10 transition-colors duration-500"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
            <h1 className="text-[12vw] font-black tracking-tighter leading-none mb-4 text-white drop-shadow-2xl transition-all duration-500 ease-out cursor-default hover:scale-110 hover:-translate-y-2 hover:text-[#4A90E2] hover:tracking-wide hover:drop-shadow-[0_10px_30px_rgba(74,144,226,0.6)]">
              CATERING
            </h1>
            <div className="flex space-x-6 mt-8">
              <AnimatedButton text="PRECIOS" />
              <AnimatedButton text="CATÁLOGO" />
            </div>
          </div>
        </section>

        {/* HUGE BLOCK 2: PASAPALOS */}
        <section className="relative w-full h-[70vh] rounded-[40px] overflow-hidden shadow-2xl group border border-white/20">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('${pasapalosImg}')` }}></div>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] group-hover:bg-black/10 transition-colors duration-500"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
            <h1 className="text-[12vw] font-black tracking-tighter leading-none mb-4 text-white drop-shadow-2xl transition-all duration-500 ease-out cursor-default hover:scale-110 hover:-translate-y-2 hover:text-[#4A90E2] hover:tracking-wide hover:drop-shadow-[0_10px_30px_rgba(74,144,226,0.6)]">
              PASAPALOS
            </h1>
            <div className="flex space-x-6 mt-8">
              <AnimatedButton text="PRECIOS" />
              <AnimatedButton text="CATÁLOGO" />
            </div>
          </div>
        </section>

        {/* PROGRESSION GRID: SMALLER OPTIONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {mockServices.map((service, index) => (
            <ServiceCard 
              key={index}
              title={service.title}
              subtitle={service.subtitle}
              description={service.description}
              abbreviation={service.abbreviation}
            />
          ))}
        </section>

      </main>
    </div>
  );
}