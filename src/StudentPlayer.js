import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';

// ==========================================
// 1. STUDENT ACTIVITY RENDERERS (The Recovered UI Templates)
// ==========================================

const VideoActivity = ({ data, onScoreUpdate }) => {
  const videoRef = useRef(null);

  const handleContinue = () => {
    // 80% Rule Logic
    if (videoRef.current) {
      const percentageWatched = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      const score = percentageWatched >= 80 ? 100 : 85; 
      onScoreUpdate({ Comprehension: score });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="w-full max-w-4xl aspect-video bg-[#1a1a1a] rounded-[2rem] border-4 border-white/20 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Bunny.net Player Iframe Placeholder */}
        <div className="flex-1 bg-black relative" onContextMenu={(e) => e.preventDefault()}>
           {data.url ? (
             <iframe src={data.url} className="w-full h-full border-none" allow="encrypted-media" allowFullScreen />
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
               <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
               <span className="font-bold tracking-widest uppercase">Video Encrypted</span>
             </div>
           )}
        </div>
      </div>
      <button onClick={handleContinue} className="mt-8 w-full max-w-xs bg-gradient-to-b from-[#e8e8e8] to-[#999999] text-[#1a1a1a] font-black py-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
        CONTINUE
      </button>
    </div>
  );
};

const ListenRepeatActivity = ({ data, onScoreUpdate }) => {
  const [cycleState, setCycleState] = useState('DEFAULT'); // DEFAULT, RECORDING, COMPARE, COMPARING, RETRY
  const [retryCount, setRetryCount] = useState(0);

  const handleActionClick = () => {
    switch(cycleState) {
      case 'DEFAULT': setCycleState('RECORDING'); break; // Start Mic
      case 'RECORDING': setCycleState('COMPARE'); break; // Stop Mic, Save Blob
      case 'COMPARE': setCycleState('COMPARING'); break; // Play Blob
      case 'COMPARING': setCycleState('RETRY'); break; // End Playback
      case 'RETRY': 
        setRetryCount(prev => prev + 1);
        setCycleState('DEFAULT'); // Wipe Blob, Restart
        break;
      default: break;
    }
  };

  const handleContinue = () => {
    let score = 100;
    if (cycleState === 'DEFAULT' && retryCount === 0) {
      score = 90; // Skipped / Incomplete penalty
    } else if (retryCount > 0) {
      score = 95; // Used retry flat penalty
    }
    // Wipes audio blob from memory here
    onScoreUpdate({ Listening: score, Speaking: score });
  };

  const getButtonStyles = () => {
    if (cycleState === 'RECORDING') return 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    if (cycleState === 'COMPARE' || cycleState === 'COMPARING') return 'bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]';
    return 'bg-white/10 border-white/20 text-white hover:bg-white/20'; // Default/Retry
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-2xl p-4 flex flex-col mb-8">
        <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-black/40 rounded-2xl overflow-hidden relative mb-4 border border-white/10">
          {data.image_url ? <img src={data.image_url} alt="Scenario" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/30 font-black tracking-widest uppercase">SCENARIO IMAGE</div>}
        </div>
        {/* Source Audio Player */}
        <div className="h-14 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 gap-4">
          <button className="text-white hover:text-[#fcd34d] transition-colors"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="w-1/3 h-full bg-[#8badd3]"></div></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
        <button onClick={handleActionClick} className={`flex-1 font-black text-sm py-4 rounded-full uppercase tracking-widest transition-all border-2 ${getButtonStyles()}`}>
          {cycleState === 'DEFAULT' ? 'RECORD' : cycleState}
        </button>
        <button onClick={handleContinue} className="flex-1 bg-gradient-to-b from-[#e8e8e8] to-[#999999] text-[#1a1a1a] font-black text-sm py-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
          CONTINUE
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. THE PLAYER ENGINE (Traffic Cop & State Manager)
// ==========================================

const StudentPlayer = ({ activityType, student, onExit, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [lessonData, setLessonData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  
  // The Master Score Tracker arrays
  const [sessionScores, setSessionScores] = useState({
    Listening: [], Reading: [], Grammar: [], Comprehension: [], Speaking: [], Writing: [], Vocabulary: []
  });

  // 1. FETCH JSON FROM DATABASE
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data, fetchError } = await supabase
          .from('lessons') 
          .select('*')
          .eq('level', student.level)
          .eq('unit', student.unit)
          .eq('type', activityType) // 'Lesson' or 'Workbook'
          .single();

        if (fetchError) throw fetchError;

        // If testing without DB data yet, inject mock array to view UI
        const activities = data?.content || [
          { template_type: 'video', title: 'VIDEO TYPE ACTIVITY', descriptor: 'Watch the introductory video for this unit carefully.' },
          { template_type: 'listen', title: 'LISTEN & REPEAT ACTIVITY', descriptor: 'Listen to the audio and repeat out loud.' }
        ];

        setLessonData({ ...data, activities });
      } catch (err) {
        console.error("Fetch error:", err);
        // INJECT MOCK DATA SO YOU CAN TEST UI IMMEDIATELY
        setLessonData({
          activities: [
            { template_type: 'video', title: 'VIDEO TYPE ACTIVITY', descriptor: 'Watch the introductory video for this unit carefully.' },
            { template_type: 'listen', title: 'LISTEN & REPEAT ACTIVITY', descriptor: 'Listen to the audio and repeat out loud.' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [activityType, student]);

  // 2. SCORE ROUTING & PROGRESSION
  const handleScoreUpdate = (newScores) => {
    const updatedScores = { ...sessionScores };
    
    // Push micro-scores into the respective arrays
    Object.keys(newScores).forEach(skill => {
      updatedScores[skill].push(newScores[skill]);
    });
    setSessionScores(updatedScores);

    // Progress to next screen or finish
    if (currentStep < lessonData.activities.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate final averages before sending to Gatekeeper
      const finalAverages = {};
      Object.keys(updatedScores).forEach(skill => {
        const scoresArr = updatedScores[skill];
        if (scoresArr.length > 0) {
          finalAverages[skill] = Math.round(scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length);
        }
      });
      onComplete(finalAverages);
    }
  };

  // 3. THE DYNAMIC SWITCHBOARD
  const renderDynamicActivity = (activity) => {
    if (!activity) return null;

    switch (activity.template_type) {
      case 'video': return <VideoActivity data={activity} onScoreUpdate={handleScoreUpdate} />;
      case 'listen': return <ListenRepeatActivity data={activity} onScoreUpdate={handleScoreUpdate} />;
      
      // We will build the rest of these modular components exactly like the two above!
      case 'fill_in_blank': return <div className="text-[#fcd34d] font-black uppercase text-xl">Fill In Blank Component Pending...</div>;
      case 'drag_drop': return <div className="text-[#fcd34d] font-black uppercase text-xl">Drag & Drop Component Pending...</div>;
      case 'short_answer': return <div className="text-[#fcd34d] font-black uppercase text-xl">Short Answer Component Pending...</div>;
      case 'multiple_selection': return <div className="text-[#fcd34d] font-black uppercase text-xl">Multiple Selection Component Pending...</div>;
      case 'slider_bar': return <div className="text-[#fcd34d] font-black uppercase text-xl">Slider Component Pending...</div>;
      case 'crossword': return <div className="text-[#fcd34d] font-black uppercase text-xl">Crossword Component Pending...</div>;
      case 'word_search': return <div className="text-[#fcd34d] font-black uppercase text-xl">Word Search Component Pending...</div>;
      
      default: return <div className="text-red-400">Unknown Template: {activity.template_type}</div>;
    }
  };

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050814]"><div className="w-16 h-16 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div></div>;

  const currentActivity = lessonData.activities[currentStep];

  // 4. THE UNIVERSAL RESPONSIVE WRAPPER
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050814] text-white font-montserrat overflow-hidden">
      
      {/* Abstract Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/5 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* UNIVERSAL HEADER */}
      <div className="h-20 w-full flex items-center justify-between px-6 md:px-12 relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 md:h-10 object-contain drop-shadow-md" />
          <div className="hidden md:block h-6 w-[1px] bg-white/30"></div>
          <span className="hidden md:block text-sm font-light text-white/80 tracking-wide">Online Platform</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-white hover:text-red-400 transition-colors mr-2"><svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 pr-1.5 pl-4 md:pl-6 flex items-center gap-3 md:gap-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="flex flex-col text-right">
              <span className="text-[10px] md:text-xs font-bold leading-tight text-white">{student?.first_name || 'Student'} {student?.last_name || ''}</span>
              <span className="text-[9px] md:text-[10px] text-white/70 font-medium tracking-wide">Level {student?.level || 'A1'}</span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full overflow-hidden border-2 border-white shrink-0"><img src={student?.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile" className="w-full h-full object-cover" /></div>
          </div>
        </div>
      </div>

      {/* ACTIVITY TITLE BOX */}
      <div className="w-full flex justify-center px-4 mt-2 md:mt-6 relative z-10 shrink-0">
        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl py-3 px-6 md:py-5 md:px-12 text-center shadow-xl max-w-3xl w-full">
           <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
             {student?.level || 'A1'}-U{student?.unit || 1} {currentActivity.title}
           </h1>
           <p className="text-xs md:text-sm text-white/90 mt-1 md:mt-2 font-medium">{currentActivity.descriptor}</p>
        </div>
      </div>

      {/* DYNAMIC CANVAS (Injects component based on switchboard) */}
      <div className="flex-1 w-full relative z-10 overflow-y-auto pb-8 pt-4 md:pt-8 flex flex-col">
         {renderDynamicActivity(currentActivity)}
      </div>

    </div>
  );
};

export default StudentPlayer;