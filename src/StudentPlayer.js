import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';

// ==========================================
// 1. DYNAMIC CANVAS RENDERER (Reads your JSON)
// ==========================================

const CanvasScreen = ({ elements, onContinue }) => {
  // This engine maps through the exact elements your Admin Editor generated
  return (
    <div className="relative w-full max-w-[1200px] min-h-[700px] mx-auto bg-transparent">
      {elements.map((el, index) => {
        
        // 1. Render Background Shapes (Pills, Boxes)
        if (el.type === 'shape') {
          return (
            <div 
              key={index}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                backgroundColor: el.data.fillColor || '#ffffff',
                opacity: (el.data.opacity || 100) / 100,
                borderRadius: `${el.data.roundness || 0}px`,
                border: `${el.data.strokeWidth || 0}px solid ${el.data.strokeColor || 'transparent'}`,
                zIndex: el.layer || 1
              }}
            />
          );
        }

        // 2. Render Exact HTML Text (Your Titles & Descriptors)
        if (el.type === 'text') {
          return (
            <div 
              key={index}
              style={{
                position: 'absolute',
                left: `${el.x || 0}px`,
                top: `${el.y || 0}px`,
                zIndex: el.layer || 10,
                width: '100%', // Text is usually centered in your HTML
                display: 'flex',
                justifyContent: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: el.htmlContent }}
            />
          );
        }

        // 3. Render Bunny Video
        if (el.type === 'image' && el.url?.includes('mediadelivery')) {
          return (
            <div 
              key={index}
              style={{
                position: 'absolute',
                left: `${el.x || 150}px`, // Fallbacks if X/Y missing on iframe
                top: `${el.y || 150}px`,
                width: `${el.width || 900}px`,
                height: `${el.height || 500}px`,
                zIndex: el.layer || 5,
                backgroundColor: '#000',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
            >
              <iframe 
                src={el.url} 
                className="w-full h-full border-none" 
                allow="encrypted-media" 
                allowFullScreen 
              />
            </div>
          );
        }

        // 4. Render Continue/Finish Buttons
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
              className="bg-gradient-to-b from-[#e8e8e8] to-[#999999] text-[#1a1a1a] font-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
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
  
  // Master Score Tracker
  const [sessionScores, setSessionScores] = useState({
    Listening: [], Reading: [], Grammar: [], Comprehension: [], Speaking: [], Writing: [], Vocabulary: []
  });

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // FIXED DATABASE FETCH: Targets the correct table and column
        const { data, error: fetchError } = await supabase
          .from('content_blueprints') 
          .select('*')
          .eq('level', student.level)
          .eq('unit', student.unit)
          .eq('content_type', activityType)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("No data found.");

        const parsedScreens = JSON.parse(data.screens || "[]");
        const parsedBlueprint = JSON.parse(data.blueprint_data || "{}");
        
        // Group elements by screen ID so the player can paginate through them
        const structuredScreens = parsedScreens.map(screenId => {
          const elementsForScreen = parsedBlueprint.elements?.filter(e => e.screenId === screenId) || [];
          return elementsForScreen;
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
    // Basic score injection for testing the loop. Later we map this to specific activity components.
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

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050814]"><div className="w-16 h-16 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050814] text-white">
      <p className="text-red-400 font-bold mb-4">{error}</p>
      <button onClick={onExit} className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all font-bold">Return to Hub</button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050814] text-white font-montserrat overflow-hidden">
      
      {/* Universal Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/5 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Global Navbar (Keep this so they can exit) */}
      <div className="h-20 w-full flex items-center justify-between px-6 md:px-12 relative z-50 shrink-0 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 md:h-10 object-contain drop-shadow-md" />
        </div>
        <button onClick={onExit} className="text-white hover:text-red-400 transition-colors"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>

      {/* Canvas Container: Fully relies on your JSON coordinates */}
      <div className="flex-1 w-full relative z-10 overflow-y-auto flex pt-8 overflow-x-hidden">
         <CanvasScreen 
           elements={screensData[currentStep]} 
           onContinue={handleContinueClick} 
         />
      </div>

    </div>
  );
};

export default StudentPlayer;