import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function CataLanding() {
  const containerRef = useRef();
  const logoUrl = "https://i.postimg.cc/4dgfQW7T/Logo-Cata-Azul.png";
  
  // High-res placeholder video (replace with your actual catering kitchen footage later)
  const videoUrl = "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4"; 

  useGSAP(() => {
    const tl = gsap.timeline();

    // 1. The Suspense Beat: Hold for 0.8 seconds on the solid blue logo
    tl.to('#solid-logo', { duration: 0.8 })
      
      // 2. The Inversion: Crossfade solid logo with the masked video layer instantly
      .to('#solid-logo', { opacity: 0, duration: 0.1 }, "swap")
      .to('#masked-video-layer', { opacity: 1, duration: 0.1 }, "swap")
      
      // 3. The Rush: Aggressive exponential scale up of the mask size
      .to('#masked-video-layer', {
        webkitMaskSize: "20000px",
        maskSize: "20000px",
        duration: 1.2,
        ease: "expo.in"
      })
      
      // 4. The Drop: Fade out the white loading overlay to reveal the live site
      .to('#loading-screen', {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          document.getElementById('loading-screen').style.display = 'none';
        }
      }, "-=0.3"); // Start fading slightly before the mask fully finishes expanding
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#f4f4f4] overflow-x-hidden font-sans">
      
      {/* ==========================================
          BUFFER ZONE / LOADING SCREEN
      ========================================== */}
      <div id="loading-screen" className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden">
        
        {/* Layer A: Solid Blue Logo (Visible first) */}
        <img
          id="solid-logo"
          src={logoUrl}
          alt="CATA Logo Loading"
          className="absolute w-[180px] z-20"
        />

        {/* Layer B: Masked Video (Revealed and Scaled) */}
        <div
          id="masked-video-layer"
          className="absolute inset-0 z-10 opacity-0"
          style={{
            WebkitMaskImage: `url(${logoUrl})`,
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskSize: '180px',
            maskImage: `url(${logoUrl})`,
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            maskSize: '180px',
          }}
        >
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      </div>


      {/* ==========================================
          LIVE SITE FRONT END (NEO-BRUTALIST MOCKUP)
      ========================================== */}
      
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-[1800px] mx-auto">
        <div className="flex items-center space-x-3 text-[#333333]">
          <img src={logoUrl} alt="CATA Logo" className="w-[50px] object-contain" />
          <div>
            <h2 className="text-xl font-bold tracking-widest leading-none">CATA</h2>
            <p className="text-[10px] tracking-[0.2em] font-medium mt-1">SERVICIOS GASTRONÓMICOS</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wider text-gray-700">
          <button className="hover:text-black transition-colors">SERVICIOS</button>
          <button className="hover:text-black transition-colors">GALERÍA</button>
          <button className="hover:text-black transition-colors">PRESUPUESTOS</button>
          <button className="hover:text-black transition-colors">CONTACTO</button>
          <button className="hover:text-black transition-colors">EMPLEOS</button>
          <button className="ml-4 p-2 text-xl hover:text-black">≡</button>
        </div>
      </nav>

      {/* Main Video Hero Section */}
      <main className="px-6 pb-10 max-w-[1800px] mx-auto h-[80vh]">
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-black shadow-2xl">
          
          {/* Blurred Background Video */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 filter blur-sm"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          
          {/* Center Typographic Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
            <h1 className="text-[12vw] font-black tracking-tighter leading-none mb-2 drop-shadow-lg">
              CATERING
            </h1>
            <p className="text-xl md:text-2xl font-medium tracking-wide mb-10 drop-shadow-md">
              ALMUERZOS Y MENÚS PARA EVENTOS Y COMPAÑÍAS
            </p>
            
            <div className="flex space-x-4">
              <button className="px-10 py-3 rounded-full border border-white bg-white/10 hover:bg-white hover:text-black transition-all backdrop-blur-md font-semibold tracking-wider">
                PRECIOS
              </button>
              <button className="px-10 py-3 rounded-full border border-white bg-transparent hover:bg-white hover:text-black transition-all backdrop-blur-md font-semibold tracking-wider">
                CATÁLOGO
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}