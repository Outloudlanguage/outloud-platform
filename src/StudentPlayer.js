import React, { useState, useEffect } from 'react';

const StudentPlayer = ({ lessonData, student, onExit }) => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- THE RESPONSIVE LISTENER ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Extract configuration from the cloned database row
  const isLesson = lessonData?.content_type === 'Lesson';
  const elements = lessonData?.session_data?.blueprint_data?.elements || lessonData?.blueprint_data?.elements || [];
  
  // Calculate total screens based on the saved array, default to 1 if missing
  const totalScreens = Array.isArray(lessonData?.screens) 
    ? lessonData.screens.length 
    : lessonData?.screens || 1;

  // Progress Bar Math
  const progressPercentage = Math.round((currentScreen / totalScreens) * 100);

  // --- NAVIGATION HANDLERS ---
  const handleNext = () => {
    if (currentScreen < totalScreens) setCurrentScreen(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentScreen > 1) setCurrentScreen(prev => prev - 1);
  };

  const handleFinish = () => {
    window.alert("Submitting answers to the database and loading Analytics...");
    // Future Phase: Wire this to calculate the grade and route to the Analytics screen
    onExit(); 
  };

  // --- THE CANVAS RENDERER ---
  const renderElement = (el) => {
    // Responsive Transformer Engine: Desktop uses absolute X/Y. Mobile uses relative flex stacking.
    const elementStyle = isMobile 
      ? {
          position: 'relative',
          width: '100%',
          minHeight: el.type === 'image' ? 'auto' : `${el.height}px`, // Images scale naturally
          zIndex: el.layer || 10,
          marginBottom: '1.25rem', // Creates the vertical gaps between stacked elements
        }
      : {
          position: 'absolute',
          top: `${el.y}px`,
          left: `${el.x}px`,
          width: `${el.width}px`,
          height: `${el.height}px`,
          zIndex: el.layer || 10,
        };

    switch (el.type) {
      case 'text':
        return (
          <div key={el.id} style={elementStyle} className="pointer-events-none">
            <div dangerouslySetInnerHTML={{ __html: el.htmlContent || el.data?.text || '' }} />
          </div>
        );
      
      case 'image':
        return (
          <img 
            key={el.id} 
            src={el.data?.src} 
            alt="Lesson Graphic" 
            style={elementStyle} 
            className={`object-contain rounded-xl shadow-sm ${isMobile ? 'mx-auto' : ''}`}
          />
        );
      
      case 'nav_button':
        const isFinish = el.data?.buttonStyle === 'finish_pill';
        return (
          <button 
            key={el.id} 
            style={elementStyle} 
            onClick={isFinish ? handleFinish : handleNext}
            className={`font-black py-3 rounded-full shadow-md hover:scale-105 transition-transform uppercase tracking-widest ${
              isFinish ? 'bg-outloud-blue text-white' : 'bg-[#fcd34d] text-outloud-blue'
            } ${isMobile ? 'text-sm w-full mt-2' : 'text-xs'}`} // Forces full-width buttons on mobile
          >
            {isFinish ? 'FINISH' : 'CONTINUE'}
          </button>
        );

      case 'drop_zone':
      case 'interactive_input':
        return (
          <div key={el.id} style={elementStyle} className="border-2 border-dashed border-outloud-blue/40 rounded-xl bg-white/50 flex items-center justify-center p-4 cursor-pointer hover:bg-outloud-blue/10 transition">
             <span className="text-[10px] text-outloud-blue opacity-50 font-bold">Interactive Zone</span>
          </div>
        );

      default:
        return <div key={el.id} style={elementStyle} className="bg-gray-200/50 rounded-lg border border-gray-300/50"></div>;
    }
  };

  // --- VISIBILITY & SORTING LOGIC ---
  let visibleElements = isLesson 
    ? elements.filter(el => el.screenId === currentScreen || !el.screenId)
    : elements;

  // The Transformer: If mobile, dynamically sort all elements by their saved Y coordinate (Top to Bottom)
  if (isMobile) {
    visibleElements = [...visibleElements].sort((a, b) => (a.y || 0) - (b.y || 0));
  }

  // --- CONTAINER STYLING ---
  const canvasContainerClass = isMobile 
    ? "relative w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col overflow-y-auto" 
    : "relative w-full bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden";
    
  const canvasContainerStyle = isMobile
    ? { minHeight: '70vh' } // Allows mobile to stretch down based on content
    : { height: isLesson ? '800px' : `${totalScreens * 800}px` };

  return (
    <div className="fixed inset-0 z-[300] bg-[#eef5fc] flex flex-col font-montserrat overflow-hidden">
      
      {/* 1. BRANDING HEADER (Responsive) */}
      <div className="relative z-10 flex justify-between items-center w-full px-4 md:px-6 py-3 md:py-4 bg-white/80 backdrop-blur-md shadow-sm shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Outloud Logo" className="h-6 md:h-8 object-contain" />
          <div className="h-4 md:h-6 w-[2px] bg-outloud-blue opacity-20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-sm font-black text-outloud-blue tracking-widest uppercase">{lessonData?.level || student?.level}: UNIT {lessonData?.unit || student?.unit}</span>
            <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase">{lessonData?.content_type || 'Activity'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-bold text-outloud-blue">{student?.first_name || 'Student'} {student?.last_name || ''}</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://i.postimg.cc/P5V486CM/Sin-titulo-(Post-para-Instagram-(45))-(2).png" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <button onClick={onExit} className="text-[9px] md:text-[10px] font-black bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition uppercase tracking-widest">
            Close
          </button>
        </div>
      </div>

      {/* 2. THE CANVAS AREA */}
      <div className={`relative flex-grow w-full max-w-[1200px] mx-auto p-4 md:p-8 ${isLesson && !isMobile ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div className={canvasContainerClass} style={canvasContainerStyle}>
          {visibleElements.map(renderElement)}
        </div>
      </div>

      {/* 3. PROGRESS FOOTER (Lessons Only) */}
      {isLesson && (
        <div className="relative z-10 w-full bg-white border-t border-gray-200 p-3 md:p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 md:gap-8">
            
            <button 
              onClick={handlePrev} 
              disabled={currentScreen === 1}
              className={`font-black text-[10px] md:text-xs px-5 md:px-6 py-2.5 rounded-full uppercase tracking-widest transition-all ${
                currentScreen === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-outloud-blue hover:bg-gray-300'
              }`}
            >
              Back
            </button>
            
            <div className="flex-grow flex flex-col gap-1.5 md:gap-2 max-w-md">
              <div className="flex justify-between text-[9px] md:text-[10px] font-black text-outloud-blue uppercase tracking-widest">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#fcd34d] transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={handleNext} 
              disabled={currentScreen === totalScreens}
              className={`font-black text-[10px] md:text-xs px-5 md:px-6 py-2.5 rounded-full uppercase tracking-widest transition-all ${
                currentScreen === totalScreens ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-outloud-blue text-white hover:scale-105 shadow-md'
              }`}
            >
              Next
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPlayer;