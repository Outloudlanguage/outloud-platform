import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';

// ==========================================
// Safe URL Extractor for Bunny/Video IFrames
// ==========================================
const extractVideoUrl = (rawInput) => {
  if (!rawInput) return '';
  // If the admin pasted the full <iframe> embed code, extract just the URL
  if (rawInput.includes('<iframe') && rawInput.includes('src=')) {
    const match = rawInput.match(/src=["'](.*?)["']/);
    if (match && match[1]) return match[1];
  }
  return rawInput;
};

// ==========================================
// 1. DYNAMIC CANVAS RENDERER
// ==========================================
const CanvasScreen = ({ elements, onContinue }) => {
  return (
    <div 
      className="relative w-[1200px] h-[700px] bg-transparent origin-top transition-transform duration-300" 
      style={{ transform: 'scale(var(--scale-factor, 1))' }}
    >
      {elements.map((el, index) => {
        
        // 1. SHAPES (With Auto-Glassmorphism)
        if (el.type === 'shape') {
          // If the admin lowered the opacity, we assume they want the premium glass look
          const isTransparent = (el.data.opacity || 100) < 100;
          return (
            <div 
              key={index}
              className={isTransparent ? "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20" : ""}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                backgroundColor: el.data.fillColor || '#ffffff',
                opacity: (el.data.opacity || 100) / 100,
                borderRadius: `${el.data.roundness || 0}px`,
                border: isTransparent ? undefined : `${el.data.strokeWidth || 0}px solid ${el.data.strokeColor || 'transparent'}`,
                zIndex: el.layer || 1
              }}
            />
          );
        }

        // 2. TEXT
        if (el.type === 'text') {
          return (
            <div 
              key={index}
              style={{
                position: 'absolute',
                left: `${el.x || 0}px`,
                top: `${el.y || 0}px`,
                zIndex: el.layer || 10,
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: el.htmlContent }}
            />
          );
        }

        // 3. VIDEO (With 404 Fix / URL Extractor)
        if (el.type === 'image' && (el.url?.includes('mediadelivery') || el.url?.includes('bunny') || el.url?.includes('iframe'))) {
          const cleanUrl = extractVideoUrl(el.url);
          return (
            <div 
              key={index}
              className="shadow-[0_15px_50px_rgba(0,0,0,0.5)]"
              style={{
                position: 'absolute',
                left: `${el.x || 150}px`, 
                top: `${el.y || 150}px`,
                width: `${el.width || 900}px`,
                height: `${el.height || 500}px`,
                zIndex: el.layer || 5,
                backgroundColor: '#070b19',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              <iframe 
                src={cleanUrl} 
                className="w-full h-full border-none" 
                allow="encrypted-media; picture-in-picture" 
                allowFullScreen 
              />
            </div>
          );
        }

        // 4. CONTINUE BUTTON (Mockup Accurate Glowing Style)
        if (el.type === 'nav_button') {
          return (
            <button 
              key={index}
              onClick={onContinue}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                zIndex: el.layer || 20
              }}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-[#fcd34d] font-black rounded-full shadow-[0_0_20px_rgba(252,211,77,0.3)] hover:shadow-[0_0_30px_rgba(252,211,77,0.5)] hover:bg-white/20 uppercase tracking-widest active:scale-95 transition-all text-xl"
            >
              {el.data.buttonStyle === 'finish_pill' ? 'FINISH' : 'CONTINUE'}
            </button>
          );
        }

        return null;
      })}
    </div>
  );
};


// ==========================================
// 2. THE PLAYER ENGINE
// ==========================================
const StudentPlayer = ({ activityType, student, onExit, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [screensData, setScreensData] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  
  // Dynamic Scaling State
  const [scale, setScale] = useState(1);

  const [sessionScores, setSessionScores] = useState({
    Listening: [], Reading: [], Grammar: [], Comprehension: [], Speaking: [], Writing: [], Vocabulary: []
  });

  // Calculate perfect scale factor for the 1200x700 canvas based on device screen
  useEffect(() => {
    const handleResize = () => {
      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - 80; // Minus 80px for the top nav bar
      const scaleX = availableWidth / 1200;
      const scaleY = availableHeight / 700;
      // Use the smallest scale to ensure it all fits without scrolling, but don't zoom in past 100%
      setScale(Math.min(scaleX, scaleY, 1)); 
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Safe Parser for Database
  const safeParse = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data === 'object') return data;
    if (typeof data === 'string') {
      try {
        if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
          const cleaned = data.trim().replace('{', '[').replace('}', ']');
          return JSON.parse(cleaned);
        }
        return JSON.parse(data);
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('content_blueprints') 
          .select('*')
          .eq('level', student.level)
          .eq('unit', student.unit)
          .eq('content_type', activityType)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("No data found.");

        const parsedScreens = safeParse(data.screens, []);
        const parsedBlueprint = safeParse(data.blueprint_data, { elements: [] });
        const elementsArr = parsedBlueprint.elements || [];
        
        const structuredScreens = parsedScreens.map(screenId => {
          return elementsArr.filter(e => e.screenId === screenId);
        });

        if (structuredScreens.length === 0) throw new Error("This blueprint is empty.");

        setScreensData(structuredScreens);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Error loading content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [activityType, student]);

  const handleContinueClick = () => {
    const updatedScores = { ...sessionScores, Comprehension: [...sessionScores.Comprehension, 100] };
    setSessionScores(updatedScores);

    if (currentStep < screensData.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const finalAverages = {};
      Object.keys(updatedScores).forEach(skill => {
        const scoresArr = updatedScores[skill];
        if (scoresArr.length > 0) finalAverages[skill] = Math.round(scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length);
      });
      onComplete(finalAverages);
    }
  };

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b19]"><div className="w-16 h-16 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b19] text-white font-montserrat">
      <p className="text-red-400 font-bold mb-4">{error}</p>
      <button onClick={onExit} className="px-8 py-4 border border-white/20 bg-white/5 rounded-full hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest">Return to Hub</button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#070b19] text-white font-montserrat overflow-hidden">
      
      {/* 13(7).jpg Background Mirror - Deep Blue with Gold/Orange Wavy Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#08203e]/40 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#ca8a04]/10 blur-[150px] rounded-full mix-blend-screen"></div>
        {/* Subtle wavy lines overlay */}
        <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23fcd34d' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, 
            backgroundSize: '150px 30px',
            transform: 'rotate(-5deg) scale(1.5)'
        }}></div>
      </div>

      {/* Global Navbar */}
      <div className="h-20 w-full flex items-center justify-between px-6 md:px-12 relative z-50 shrink-0 border-b border-white/10 bg-[#070b19]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 md:h-10 object-contain drop-shadow-md" />
          <div className="h-6 w-[1px] bg-white/20 hidden md:block"></div>
          <span className="hidden md:block text-sm font-light text-white/80 tracking-wide">Online Platform</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Glassmorphic Profile Pill exactly matching the mockup */}
          <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 pl-4 pr-1.5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">{student?.first_name} {student?.last_name}</span>
              <span className="text-[10px] text-white/60 font-medium">Level {student?.level}</span>
            </div>
            <img src={student?.avatar_url || 'https://i.pravatar.cc/150'} className="w-9 h-9 rounded-full object-cover border border-white/30" alt="Avatar"/>
          </div>

          <button onClick={onExit} className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-red-500/80 p-2 rounded-full border border-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Scalable Canvas Container */}
      <div 
        className="flex-1 w-full relative z-10 flex items-center justify-center overflow-hidden"
        style={{ '--scale-factor': scale }}
      >
         <CanvasScreen 
           elements={screensData[currentStep]} 
           onContinue={handleContinueClick} 
         />
      </div>
    </div>
  );
};

export default StudentPlayer;