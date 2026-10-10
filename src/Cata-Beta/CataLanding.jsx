import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

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

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // 1. Hold on the solid blue lobster
    tl.to('#solid-logo', { duration: 0.8 })
      
      // 2. Rush the camera: Massive scale up while fading out
      .to('#solid-logo', { 
        scale: 150, 
        opacity: 0, 
        duration: 1.2, 
        ease: "expo.inOut" 
      })
      
      // 3. Fade out the white loading screen to reveal the live site
      .to('#loading-screen', {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          document.getElementById('loading-screen').style.display = 'none';
        }
      }, "-=0.8");
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* ==========================================
          BUFFER ZONE / LOADING SCREEN
      ========================================== */}
      <div id="loading-screen" className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden pointer-events-none">
        <img
          id="solid-logo"
          src={loadingLogoUrl}
          alt="Loading..."
          className="absolute w-[180px] z-20"
        />
      </div>

      {/* ==========================================
          FIXED SEAMLESS VIDEO BACKGROUND
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        {/* CSS trick to ensure the iframe perfectly covers the viewport without black bars */}
        <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-60">
          <iframe
            src={cloudflareVideo}
            loading="lazy"
            className="w-full h-full scale-105 pointer-events-none"
            style={{ border: 'none' }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          ></iframe>
        </div>
        {/* Subtle glass overlay on the entire background to improve readability */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      </div>

      {/* ==========================================
          LIVE FRONT END (UI / UX)
      ========================================== */}
      
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

      {/* Main Content Grids */}
      <main className="relative z-10 px-6 pt-[120px] pb-20 max-w-[1800px] mx-auto flex flex-col gap-16">
        
        {/* BLOCK 1: CATERING */}
        <section className="relative w-full h-[80vh] rounded-[40px] overflow-hidden shadow-2xl group border border-white/20">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url('${cateringImg}')` }}
          ></div>
          
          {/* Glassmorphic overlay for the block */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] group-hover:bg-black/10 transition-colors duration-500"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
            {/* Interactive Typography */}
            <h1 className="text-[12vw] font-black tracking-tighter leading-none mb-4 text-white drop-shadow-2xl transition-all duration-500 ease-out cursor-default hover:scale-110 hover:-translate-y-2 hover:text-[#4A90E2] hover:tracking-wide hover:drop-shadow-[0_10px_30px_rgba(74,144,226,0.6)]">
              CATERING
            </h1>
            
            {/* Glassmorphic Button Container */}
            <div className="flex space-x-6 mt-8">
              <button className="px-10 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/40 text-white font-bold tracking-widest transition-all duration-300 ease-out hover:bg-white/30 hover:scale-110 hover:-translate-y-1 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95">
                PRECIOS
              </button>
              <button className="px-10 py-3 rounded-full bg-black/20 backdrop-blur-lg border border-white/40 text-white font-bold tracking-widest transition-all duration-300 ease-out hover:bg-white/30 hover:scale-110 hover:-translate-y-1 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95">
                CATÁLOGO
              </button>
            </div>
          </div>
        </section>

        {/* BLOCK 2: PASAPALOS */}
        <section className="relative w-full h-[80vh] rounded-[40px] overflow-hidden shadow-2xl group border border-white/20">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url('${pasapalosImg}')` }}
          ></div>
          
          {/* Glassmorphic overlay for the block */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] group-hover:bg-black/10 transition-colors duration-500"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
            {/* Interactive Typography */}
            <h1 className="text-[12vw] font-black tracking-tighter leading-none mb-4 text-white drop-shadow-2xl transition-all duration-500 ease-out cursor-default hover:scale-110 hover:-translate-y-2 hover:text-[#4A90E2] hover:tracking-wide hover:drop-shadow-[0_10px_30px_rgba(74,144,226,0.6)]">
              PASAPALOS
            </h1>
            
            {/* Glassmorphic Button Container */}
            <div className="flex space-x-6 mt-8">
              <button className="px-10 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/40 text-white font-bold tracking-widest transition-all duration-300 ease-out hover:bg-white/30 hover:scale-110 hover:-translate-y-1 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95">
                PRECIOS
              </button>
              <button className="px-10 py-3 rounded-full bg-black/20 backdrop-blur-lg border border-white/40 text-white font-bold tracking-widest transition-all duration-300 ease-out hover:bg-white/30 hover:scale-110 hover:-translate-y-1 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95">
                CATÁLOGO
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}