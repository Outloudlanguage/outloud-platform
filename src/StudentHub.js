import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import StudentPlayer from './StudentPlayer';
import CommunityPanel from './components/CommunityPanel'; 

// ==========================================
// 1. REUSABLE UI CARDS (For both Desktop & Mobile)
// ==========================================

const ProgressCard = ({ percentage, currentUnit, totalUnits }) => {
  const safePercentage = isNaN(percentage) ? 0 : percentage;
  const circleCircumference = 2 * Math.PI * 40; 
  const strokeDashoffset = circleCircumference - (safePercentage / 100) * circleCircumference;

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden h-full">
      <h3 className="text-white/90 font-bold text-[10px] sm:text-xs tracking-widest uppercase text-center whitespace-nowrap">
        COURSE COMPLETION
      </h3>
      
      <div className="flex-1 w-full flex items-center justify-center min-h-0 my-2">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
           <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="transparent" />
             <circle cx="50" cy="50" r="40" stroke="#fcd34d" strokeWidth="6" fill="transparent" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-white leading-none drop-shadow-md">{safePercentage}%</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-white/70 tracking-widest uppercase mt-1">COMPLETED</span>
           </div>
        </div>
      </div>
      
      <p className="text-center text-white font-bold text-[10px] sm:text-xs tracking-widest uppercase mt-auto whitespace-nowrap">
        LESSONS UNIT {currentUnit}/{totalUnits}
      </p>
    </div>
  );
};

const ActivitiesCard = ({ activeLiveSession }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col h-full">
    <h3 className="text-white font-black text-xl sm:text-2xl tracking-wide mb-2 sm:mb-4 text-center sm:text-left drop-shadow-md shrink-0">Activities</h3>
    <ul className="space-y-4 sm:space-y-5 text-xs sm:text-sm font-medium text-white/90 flex-1 flex flex-col justify-center px-1">
      {activeLiveSession ? (
        <li className="flex items-center gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="leading-tight"><span className="font-bold text-emerald-400 block sm:inline">Live Lab:</span> {activeLiveSession.session_date}</span>
        </li>
      ) : (
        <li className="flex items-center gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="opacity-50 italic leading-tight">No live sessions booked</span>
        </li>
      )}
      <li className="flex items-center gap-3">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        <span className="leading-tight"><strong className="font-bold block sm:inline">Next:</strong> Chat room meeting</span>
      </li>
      <li className="flex items-center gap-3">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <span className="leading-tight"><strong className="font-bold block sm:inline">Soon:</strong> Conversation Club</span>
      </li>
    </ul>
  </div>
);

const MainActionCard = ({ title, iconType, isFetching, isActive, onClick, score }) => {
  const iconSrc = iconType === 'headphones' 
    ? 'https://i.postimg.cc/CLG47dtk/3(7).png' 
    : 'https://i.postimg.cc/HLx4TzxY/4(6).png';

  return (
    <button 
      onClick={onClick} 
      disabled={!isActive || isFetching} 
      className={`w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center gap-4 transition-all group ${!isActive ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/20 hover:scale-[1.02]'}`}
    >
      {!isActive && (
        <svg className="w-6 h-6 text-white/40 absolute top-4 right-4 sm:top-6 sm:right-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      )}
      
      <img 
        src={iconSrc} 
        alt={title} 
        className="w-24 h-24 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500 drop-shadow-md" 
      />
      
      <div className="flex flex-col items-center mt-2">
        <h3 className="font-black tracking-wide text-2xl sm:text-3xl lg:text-4xl drop-shadow-md">{isFetching ? 'Loading...' : title}</h3>
        {score > 0 && <span className="text-[9px] sm:text-[10px] font-bold text-[#fcd34d] mt-1 tracking-widest uppercase">SCORE: {score}%</span>}
      </div>
    </button>
  );
};

const PillButton = ({ title, hasNotification, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative w-full py-4 px-2 backdrop-blur-md rounded-xl text-center text-[10px] sm:text-xs transition-all shadow-md active:scale-95 border ${isActive ? 'bg-[#fcd34d] border-[#fcd34d] text-[#08203e] font-black scale-105' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'}`}
  >
    {hasNotification && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>}
    {title}
  </button>
);

const INFO_CATEGORIES = ['Website Functionality', 'General Information', 'Academy Rules', 'Upcoming Events', 'Promos & Discounts', 'Financial Data'];

const NavIconBtn = ({ iconSvg, active, onClick, hasNotification, isProfile, avatarUrl }) => (
  <button onClick={onClick} className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-white/20 border border-white/40 shadow-inner' : 'hover:bg-white/10 border border-transparent'}`}>
    {hasNotification && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#070b19] z-10 animate-pulse"></div>}
    {isProfile ? (
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white/50 bg-gray-300">
        <img src={avatarUrl || 'https://i.pravatar.cc/150'} alt="Profile" className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className={`w-8 h-8 md:w-9 md:h-9 ${active ? 'text-white' : 'text-white/70'}`}>
        {iconSvg}
      </div>
    )}
  </button>
);

const SocialButton = ({ src, url }) => (
  <a href={url} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-12 md:h-12 hover:scale-110 transition-transform shrink-0 drop-shadow-md">
    <img src={src} alt="Social" className="w-full h-full object-contain" />
  </a>
);

// SVGs for Nav
const navIcons = {
  calendar: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><rect x="7" y="11" width="2" height="2" fill="currentColor"/><rect x="11" y="11" width="2" height="2" fill="currentColor"/><rect x="15" y="11" width="2" height="2" fill="currentColor"/><rect x="7" y="15" width="2" height="2" fill="currentColor"/><rect x="11" y="15" width="2" height="2" fill="currentColor"/><rect x="15" y="15" width="2" height="2" fill="currentColor"/></svg>,
  monitor: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /><circle cx="9" cy="8" r="1.5" fill="currentColor"/><circle cx="15" cy="8" r="1.5" fill="currentColor"/><path strokeLinecap="round" d="M7 11h4M13 11h4" /></svg>,
  bell: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  chat: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l-1-1m0 0l-1 1m1-1v3" /></svg>,
  forum: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
};

// ==========================================
// 2. CURRICULUM LOGIC & OVERLAYS
// ==========================================
const getProgressData = (student) => {
  const currentUnit = Number(student?.unit) || 1;
  const baseLevel = student?.level ? student.level.split(':')[0].trim() : 'A1';
  const bounds = {
    'A1': { start: 1, end: 12 }, 'A2': { start: 13, end: 24 },
    'B1': { start: 25, end: 36 }, 'B2': { start: 37, end: 48 },
    'C1': { start: 49, end: 70 }, 'C2': { start: 71, end: 92 }
  }[baseLevel] || { start: 1, end: 12 };
  
  const levelTotalUnits = bounds.end - bounds.start + 1;
  // Calculate percentage based on completed units within the current level bounds
  const unitsCompletedInLevel = Math.max(0, currentUnit - bounds.start);
  let progressPercentage = Math.round((unitsCompletedInLevel / levelTotalUnits) * 100);
  if (isNaN(progressPercentage)) progressPercentage = 0;
  
  return { progressPercentage, currentUnit, levelTotalUnits };
};

const LevelCompleteOverlay = ({ student }) => {
  if (!student?.level_completed) return null;
  const baseLevel = student.level ? student.level.split(':')[0].trim() : 'A1';
  
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#070b19]/95 backdrop-blur-3xl animate-fade-in font-montserrat">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
         <div className="w-[800px] h-[800px] bg-[#fcd34d]/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>
      <div className="bg-white/10 border border-[#fcd34d]/50 rounded-[3rem] p-10 md:p-16 max-w-2xl w-full shadow-[0_0_50px_rgba(252,211,77,0.2)] flex flex-col items-center text-center relative z-10">
        <div className="w-24 h-24 bg-[#fcd34d] text-[#08203e] rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(252,211,77,0.6)]">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-md">LEVEL {baseLevel} COMPLETE!</h1>
        <p className="text-lg text-white/80 font-medium mb-8 leading-relaxed">
          Congratulations on mastering this level! You are now ready to advance. To unlock the next level's curriculum and resume your progress, please process your enrollment renewal.
        </p>
        <a href="https://wa.me/584226885683" target="_blank" rel="noreferrer" className="w-full md:w-auto px-10 py-5 bg-[#fcd34d] hover:bg-white text-[#08203e] font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(252,211,77,0.3)]">
          CONTACT SUPPORT TO RENEW
        </a>
      </div>
    </div>
  );
};

// ==========================================
// 3. DESKTOP VIEW
// ==========================================
const DesktopView = ({ student, onReturnHome, onStartActivity, isFetching, activeLiveSession, announcements = [], activeCategory, setActiveCategory }) => {
  const filteredAnnouncements = activeCategory ? announcements.filter(a => a.category === activeCategory) : announcements;
  const { progressPercentage, currentUnit, levelTotalUnits } = getProgressData(student);

  const lessonScore = student?.lesson_score || 0;
  const workbookScore = student?.workbook_score || 0;
  const isWorkbookUnlocked = lessonScore >= 75;

  return (
    <div className="flex min-h-screen bg-[#070b19] relative overflow-hidden z-0 font-montserrat text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div 
          className="absolute inset-0 opacity-100 blur-sm scale-[1.05]" 
          style={{ backgroundImage: `url("https://i.postimg.cc/kg4rxNH2/Gemini-Generated-Image-ohtdmbohtdmbohtd.jpg")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        ></div>
        <div className="absolute inset-0 bg-[#070b19]/40"></div>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <div className="w-28 border-r border-white/10 bg-black/20 backdrop-blur-2xl flex flex-col items-center py-10 gap-6 shrink-0 z-10 shadow-2xl">
        <NavIconBtn isProfile avatarUrl={student?.avatar_url} onClick={onReturnHome} />
        <div className="w-12 h-px bg-white/10 my-2"></div>
        <NavIconBtn iconSvg={navIcons.calendar} onClick={() => onStartActivity('Calendar')} />
        <NavIconBtn iconSvg={navIcons.monitor} onClick={() => onStartActivity('LiveClass')} hasNotification={!!activeLiveSession?.meeting_link} />
        <NavIconBtn iconSvg={navIcons.bell} hasNotification />
        <NavIconBtn iconSvg={navIcons.chat} onClick={() => onStartActivity('Community_CHAT')} />
        <NavIconBtn iconSvg={navIcons.forum} onClick={() => onStartActivity('Community_BOARD')} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar z-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10 pl-2">
          <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-12 lg:h-14 object-contain opacity-100" />
          <div className="h-10 w-[2px] bg-white/40"></div>
          <span className="text-2xl lg:text-3xl font-light text-white tracking-wide">Online Platform</span>
        </div>

        {/* 3-COLUMN GRID */}
        <div className="grid grid-cols-12 gap-6 w-full max-w-[1400px] h-[calc(100vh-160px)]">
          
          {/* LEFT COLUMN: Status & Agenda */}
          <div className="col-span-3 flex flex-col gap-6 h-full">
            <div className="flex-[0.4]">
              <ProgressCard percentage={progressPercentage} currentUnit={currentUnit} totalUnits={levelTotalUnits} />
            </div>
            <div className="flex-[0.6]">
              <ActivitiesCard activeLiveSession={activeLiveSession} />
            </div>
            <div className="flex flex-col gap-4 mt-auto">
              <a href="https://wa.me/584226885683" target="_blank" rel="noreferrer" className="w-full py-4 bg-[#e2e8f0] text-[#0f172a] hover:bg-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-xl leading-tight text-center">
                <img src="https://i.postimg.cc/mrtXmB72/Copia-de-Diseno-sin-titulo-(2).png" alt="Help" className="w-8 h-8 object-contain shrink-0" />
                REQUEST<br/>ASSISTANCE
              </a>
              <div className="flex justify-center gap-5 items-center px-2 mt-2">
                <SocialButton src="https://i.postimg.cc/ry0TD2Hv/11(6).png" url="https://www.facebook.com/share/1KxawRX9vA/" />
                <SocialButton src="https://i.postimg.cc/MpD2C6cs/10(5).png" url="https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==" />
                <SocialButton src="https://i.postimg.cc/pXbwyhzD/9(3).png" url="https://www.tiktok.com/@outloudlanguage" />
                <SocialButton src="https://i.postimg.cc/0y9hdTtf/8(4).png" url="https://discord.gg/847PMD2DbV" />
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Action Cards */}
          <div className="col-span-4 flex flex-col gap-6 h-full">
            <div className="flex-1">
              <MainActionCard 
                title="Lesson" 
                iconType="headphones" 
                isActive={true} 
                isFetching={isFetching} 
                onClick={() => onStartActivity('Lesson')} 
                score={lessonScore} 
              />
            </div>
            <div className="flex-1">
              <MainActionCard 
                title="Workbook" 
                iconType="workbook" 
                isActive={isWorkbookUnlocked} 
                isFetching={isFetching} 
                onClick={() => onStartActivity('Workbook')} 
                score={workbookScore} 
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Info Board & Feed */}
          <div className="col-span-5 flex flex-col gap-6 h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 shrink-0">
              {INFO_CATEGORIES.map(cat => (
                <PillButton 
                  key={cat} 
                  title={cat} 
                  isActive={activeCategory === cat} 
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} 
                />
              ))}
            </div>

            <div className="flex-1 flex flex-col gap-4 mt-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center text-white/50 font-bold tracking-widest text-xs py-10 uppercase">
                  No announcements to display.
                </div>
              ) : (
                filteredAnnouncements.map(ann => (
                  <div key={ann.id} className="bg-white/10 border border-white/20 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 hover:bg-white/20 transition-colors shadow-md">
                    {ann.image_url && (
                      <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-white/30 shadow-sm">
                        <img src={ann.image_url} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col text-center sm:text-left w-full">
                      <h4 className="text-sm font-black uppercase tracking-widest mb-1 text-white drop-shadow-sm">{ann.title}</h4>
                      <p className="text-[10px] md:text-xs text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MOBILE VIEW
// ==========================================
const MobileView = ({ student, onReturnHome, onStartActivity, isFetching, activeLiveSession, announcements = [], activeCategory, setActiveCategory }) => {
  const filteredAnnouncements = activeCategory ? announcements.filter(a => a.category === activeCategory) : announcements;
  const { progressPercentage, currentUnit, levelTotalUnits } = getProgressData(student);

  const lessonScore = student?.lesson_score || 0;
  const workbookScore = student?.workbook_score || 0;
  const isWorkbookUnlocked = lessonScore >= 75;

  return (
    <div className="min-h-screen flex flex-col bg-[#070b19] relative overflow-x-hidden z-0 font-montserrat text-white pb-32">
      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden fixed">
        <div 
          className="absolute inset-0 opacity-100 blur-sm scale-[1.05]" 
          style={{ backgroundImage: `url("https://i.postimg.cc/kg4rxNH2/Gemini-Generated-Image-ohtdmbohtdmbohtd.jpg")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        ></div>
        <div className="absolute inset-0 bg-[#070b19]/40"></div>
      </div>

      {/* HEADER */}
      <div className="p-5 flex items-center gap-3 border-b border-white/10 bg-black/10 backdrop-blur-md sticky top-0 z-40">
        <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-8 sm:h-10 object-contain opacity-100" />
        <div className="h-6 w-[1px] bg-white/40"></div>
        <span className="text-base sm:text-lg font-light text-white tracking-wide">Online Platform</span>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex flex-col gap-4 p-4 z-10">
        
        {/* ROW 1: Completion & Activities */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="h-60 sm:h-64">
            <ProgressCard percentage={progressPercentage} currentUnit={currentUnit} totalUnits={levelTotalUnits} />
          </div>
          <div className="h-60 sm:h-64">
            <ActivitiesCard activeLiveSession={activeLiveSession} />
          </div>
        </div>

        {/* ROW 2: Lesson & Workbook */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-4">
          <div className="h-60 sm:h-64">
            <MainActionCard title="Lesson" iconType="headphones" isActive={true} isFetching={isFetching} onClick={() => onStartActivity('Lesson')} score={lessonScore} />
          </div>
          <div className="h-60 sm:h-64">
            <MainActionCard title="Workbook" iconType="workbook" isActive={isWorkbookUnlocked} isFetching={isFetching} onClick={() => onStartActivity('Workbook')} score={workbookScore} />
          </div>
        </div>

        {/* RIGHT COLUMN DATA (Now below) */}
        <div className="flex flex-col gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 shadow-2xl mt-2 sm:mt-4">
          {/* PILLS */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {INFO_CATEGORIES.map(cat => (
              <PillButton 
                key={cat} 
                title={cat} 
                isActive={activeCategory === cat} 
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} 
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center text-white/50 font-bold tracking-widest text-xs py-6 uppercase">
                No announcements to display.
              </div>
            ) : (
              filteredAnnouncements.map(ann => (
                <div key={ann.id} className="bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 mt-2 hover:bg-white/20 transition-colors">
                  {ann.image_url && (
                    <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-white/30">
                      <img src={ann.image_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-col text-center sm:text-left">
                    <h4 className="text-sm font-black uppercase tracking-widest mb-1 text-white">{ann.title}</h4>
                    <p className="text-[10px] text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{ann.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SOCIALS & SUPPORT */}
        <div className="flex flex-col items-center gap-5 mt-4 px-2">
          <div className="flex justify-center gap-4 sm:gap-6 w-full">
            <SocialButton src="https://i.postimg.cc/ry0TD2Hv/11(6).png" url="https://www.facebook.com/share/1KxawRX9vA/" />
            <SocialButton src="https://i.postimg.cc/MpD2C6cs/10(5).png" url="https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==" />
            <SocialButton src="https://i.postimg.cc/pXbwyhzD/9(3).png" url="https://www.tiktok.com/@outloudlanguage" />
            <SocialButton src="https://i.postimg.cc/0y9hdTtf/8(4).png" url="https://discord.gg/847PMD2DbV" />
          </div>
          <a href="https://wa.me/584226885683" target="_blank" rel="noreferrer" className="w-full py-4 bg-[#e2e8f0] text-[#0f172a] font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl leading-tight">
            <img src="https://i.postimg.cc/mrtXmB72/Copia-de-Diseno-sin-titulo-(2).png" alt="Help" className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
            REQUEST ASSISTANCE
          </a>
        </div>

      </div>

      {/* FIXED BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 h-20 sm:h-24 bg-white/10 backdrop-blur-2xl border-t border-white/20 flex items-center justify-between px-2 sm:px-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavIconBtn isProfile avatarUrl={student?.avatar_url} onClick={onReturnHome} />
        <NavIconBtn iconSvg={navIcons.calendar} onClick={() => onStartActivity('Calendar')} />
        <NavIconBtn iconSvg={navIcons.monitor} onClick={() => onStartActivity('LiveClass')} hasNotification={!!activeLiveSession?.meeting_link} />
        <NavIconBtn iconSvg={navIcons.bell} hasNotification />
        <NavIconBtn iconSvg={navIcons.chat} onClick={() => onStartActivity('Community_CHAT')} />
        <NavIconBtn iconSvg={navIcons.forum} onClick={() => onStartActivity('Community_BOARD')} />
      </div>

    </div>
  );
};

// ==========================================
// 3.5 NEW TAB JITSI CONTROLLER (Student)
// ==========================================
const JitsiRoom = ({ session, student, onLeave }) => {
  const [alertState, setAlertState] = useState('active'); 

  useEffect(() => {
    // Open Jitsi passively & forcefully bypass the Moderator splash screen
    const roomUrl = `https://meet.jit.si/OLA-Unit${session.unit}-${session.id}#config.prejoinPageEnabled=false`;
    window.open(roomUrl, '_blank');

    const monitor = setInterval(async () => {
      const { data } = await supabase.from('live_sessions')
        .select('last_ping_at, status')
        .eq('id', session.id)
        .single();

      if (data) {
        // If an admin manually cancels or reassigns the class, boot the student
        if (data.status !== 'in_progress') {
           setAlertState('admin_handled');
           return;
        }

        if (data.last_ping_at) {
          const pingStr = data.last_ping_at.endsWith('Z') ? data.last_ping_at : data.last_ping_at + 'Z';
          const msSincePing = Date.now() - new Date(pingStr).getTime();
          
          if (msSincePing > 600000 && alertState !== 'terminated') {
            // 10 MINUTES: Teacher MIA. Just update UI, no database/refund action.
            setAlertState('terminated');
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
          } 
          else if (msSincePing > 45000 && msSincePing <= 600000 && alertState !== 'warning') {
            // 45 SECONDS: Display Technical Difficulties
            setAlertState('warning');
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
          }
          else if (msSincePing <= 45000 && alertState === 'warning') {
            // Teacher Reconnected safely
            setAlertState('active');
          }
        }
      }
    }, 10000); 

    return () => clearInterval(monitor);
  }, [session, alertState]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#070b19]/95 backdrop-blur-md p-4">
      {alertState === 'active' && (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl flex flex-col items-center">
          <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse mb-6 shadow-[0_0_15px_#34d399]"></div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Clase en Curso</h2>
          <p className="text-sm font-medium text-white/70 mb-8 leading-relaxed">
            Tu sala de video se ha abierto en una nueva pestaña. Cuando termines, cierra la pestaña de video y haz clic abajo.
          </p>
          <button onClick={onLeave} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/20 hover:scale-105">
            Volver al Inicio
          </button>
        </div>
      )}

      {alertState === 'warning' && (
        <div className="bg-[#fcd34d]/10 border border-[#fcd34d]/50 rounded-[2rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(252,211,77,0.2)] flex flex-col items-center animate-fade-in">
          <div className="w-8 h-8 bg-[#fcd34d] rounded-full animate-pulse mb-6 shadow-[0_0_25px_#fcd34d]"></div>
          <h2 className="text-2xl font-black text-[#fcd34d] uppercase tracking-widest mb-2 drop-shadow-md">Conexión Perdida</h2>
          <p className="text-sm font-medium text-white/90 mb-8 leading-relaxed">
            Tu profesor está experimentando dificultades técnicas. Por favor, mantente en la sala. Nuestros administradores han sido notificados.
          </p>
        </div>
      )}

      {alertState === 'terminated' && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-[2rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col items-center animate-fade-in">
          <div className="w-8 h-8 bg-red-500 rounded-full mb-6 shadow-[0_0_25px_#ef4444]"></div>
          <h2 className="text-2xl font-black text-red-400 uppercase tracking-widest mb-2 drop-shadow-md">Sesión Interrumpida</h2>
          <p className="text-sm font-medium text-white/90 mb-8 leading-relaxed">
            No se pudo restaurar la conexión. Por favor cierra tu pestaña de video. Un administrador te contactará para reprogramar tu clase.
          </p>
          <button onClick={onLeave} className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105">
            Entendido
          </button>
        </div>
      )}

      {alertState === 'admin_handled' && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-[2rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col items-center animate-fade-in">
          <div className="w-8 h-8 bg-blue-500 rounded-full mb-6 shadow-[0_0_25px_#3b82f6]"></div>
          <h2 className="text-2xl font-black text-blue-400 uppercase tracking-widest mb-2 drop-shadow-md">Sesión Actualizada</h2>
          <p className="text-sm font-medium text-white/90 mb-8 leading-relaxed">
            Esta sesión ha sido modificada por un administrador. Por favor regresa a tu panel principal.
          </p>
          <button onClick={onLeave} className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105">
            Volver al Inicio
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. THE GATEKEEPER (Evaluation Modal)
// ==========================================
const EvaluationCrossroad = ({ data, onProceed, onRetry, onScheduleLive, onScheduleComplementary, onScheduleTutoring }) => {
  const { type, scores, fails, unit, level, average, passed } = data;
  const skillEntries = Object.entries(scores);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050814]/95 px-4 md:px-10 font-montserrat overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-100,50 Q250,150 600,50 T1300,50' fill='none' stroke='%23fcd34d' stroke-width='1.5' opacity='0.3'/%3E%3Cpath d='M-100,70 Q250,-10 600,70 T1300,70' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.1'/%3E%3Cpath d='M-100,90 Q250,190 600,90 T1300,90' fill='none' stroke='%23fcd34d' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`, 
             backgroundSize: 'cover', backgroundPosition: 'center' 
           }}>
      </div>

      <div className="bg-white/10 border border-white/20 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 w-full max-w-sm md:max-w-5xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-16 relative z-10">
        <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left w-full">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-4 tracking-wide uppercase drop-shadow-md">{level}: UNIT {unit}</h2>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-6 tracking-wide uppercase drop-shadow-md">{type} 1</h3>
          <h1 className={`text-5xl md:text-7xl font-black uppercase tracking-wider ${passed ? 'text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]' : 'text-red-100 drop-shadow-[0_0_25px_rgba(248,113,113,0.9)]'}`}>
            {passed ? 'COMPLETED' : 'RESULTS'}
          </h1>
        </div>

        <div className="flex-[0.8] flex flex-col items-center justify-center w-full max-w-sm">
          <div className="w-full space-y-3 md:space-y-4 mb-6 md:mb-8">
            {skillEntries.map(([skill, score]) => (
              <div key={skill} className="flex items-center justify-between gap-3 md:gap-4">
                <span className="w-24 md:w-32 text-left text-xs md:text-sm font-medium text-white tracking-wide">{skill}:</span>
                <div className="flex-1 bg-white rounded-full h-3 md:h-3.5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                  <div className={`h-full rounded-full transition-all duration-1000 ${score >= 75 ? 'bg-[#fcd34d] shadow-[0_0_10px_rgba(252,211,77,0.8)]' : 'bg-red-400'}`} style={{ width: `${score}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className={`text-7xl md:text-[7rem] leading-none font-black mb-6 md:mb-8 ${passed ? 'text-[#fcd34d] drop-shadow-[0_0_30px_rgba(252,211,77,0.6)]' : 'text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.6)]'}`}>
            {average}%
          </div>

          <div className="w-full max-w-[240px]">
            {passed ? (
              <button onClick={onProceed} className="w-full py-3.5 md:py-4 bg-gradient-to-b from-[#e8e8e8] to-[#999999] border border-white/50 text-[#1a1a1a] hover:from-white hover:to-[#b3b3b3] font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.4)] whitespace-pre-line leading-tight">
                {type === 'Lesson' ? 'PROCEED TO\nWORKBOOK' : 'RESERVAR\nCLASE EN VIVO'}
              </button>
            ) : fails === 0 ? (
              <button onClick={onRetry} className="w-full py-3.5 md:py-4 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-pre-line leading-tight">
                INTENTAR\nDE NUEVO
              </button>
            ) : fails === 1 ? (
              <button onClick={onScheduleComplementary} className="w-full py-3.5 md:py-4 bg-orange-400 text-white font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(251,146,60,0.5)] whitespace-pre-line leading-tight">
                RESERVAR CLASE\nCOMPLEMENTARIA
              </button>
            ) : (
              <button onClick={onScheduleTutoring} className="w-full py-3.5 md:py-4 bg-red-500 text-white font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] whitespace-pre-line leading-tight">
                RESERVAR TUTORIA\n1-ON-1
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. THE LIVE CALENDAR BRIDGE
// ==========================================
const StudentCalendar = ({ student, filterType, onConfirm, onCancel }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!student || !filterType) return;

      // Extracts "A1" from "A1: Básico 1" to match standard calendar formats
      const baseLevel = student.level ? student.level.split(':')[0].trim() : 'A1';

      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('status', 'available')
        .eq('class_type', filterType) // Only shows the specific class they clicked (e.g., Live Lab, Tutoring)
        .eq('level', baseLevel)       // Strictly matches their current CEFR level
        .eq('unit', student.unit || 1); // Strictly matches their current unit
        
      if (!error && data) {
        // Map the database timestamp into the visual strings the calendar grid expects
        const mappedData = data.map(slot => {
          if (slot.scheduled_at && !slot.session_date) {
            const d = new Date(slot.scheduled_at);
            return {
              ...slot,
              session_date: d.toISOString().split('T')[0],
              // Formats as "9:00 AM" to snap perfectly into your UI grid
              time_slot: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/^0/, '')
            };
          }
          return slot;
        });
        setAvailableSlots(mappedData);
      }
    };
    
    fetchAvailability();
  }, [student, filterType]);

  const getWeekDates = (offsetWeeks) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + (offsetWeeks * 7));
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates; 
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const times = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'];

  const getSlotData = (date, timeStr) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.find(s => s.session_date === dateStr && s.time_slot === timeStr);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !student) return;
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('live_sessions')
        .update({
          status: 'booked',
          student_id: student.id,
          unit: student.unit || 1
        })
        .eq('id', selectedSlot.id);
        
      if (error) throw error;
      
      setShowConfirmation(false);
      onConfirm(); 
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Lo sentimos, este horario ya no está disponible.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070b19]/90 backdrop-blur-md p-4 font-montserrat">
      
      {showConfirmation && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-[30px] p-8 md:p-12 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-md leading-relaxed">
                CONFIRM YOUR {filterType}
              </h2>
              <p className="text-white/70 text-sm mb-8">
                {selectedSlot?.session_date} at {selectedSlot?.time_slot}
              </p>
              
              <div className="flex w-full gap-4">
                <button onClick={() => setShowConfirmation(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-xl transition-colors">CANCEL</button>
                <button 
                  onClick={handleConfirmBooking} 
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-[#fcd34d] text-[#08203e] font-black tracking-widest text-xs uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)] disabled:opacity-50"
                >
                  {isProcessing ? 'SAVING...' : 'CONFIRM'}
                </button>
              </div>
           </div>
        </div>
      )}

      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl p-6 md:p-10 flex flex-col lg:flex-row gap-10 animate-fade-in relative">
        <button onClick={onCancel} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-colors">✕</button>

        <div className="flex-1 flex flex-col gap-6">
           <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">SCHEDULE A LESSON</h2>
           <p className="text-white/80 font-medium text-sm leading-relaxed mb-4">
             CHOOSE AN AVAILABLE DATE FOR YOUR NEXT {filterType}.<br/><br/>
             Only the <span className="font-black text-[#fcd34d]">YELLOW</span> blocks are currently available for <strong className="text-white">UNIT {student?.unit || 1}</strong>.
           </p>
           
           <div className="flex flex-col gap-4">
              <select className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none appearance-none"><option>{filterType}</option></select>
              <select className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none appearance-none"><option>DAY OF THE WEEK ▾</option></select>
              <select className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none appearance-none"><option>HOUR ▾</option></select>
           </div>
        </div>

        <div className="flex-[1.5] flex flex-col bg-black/20 rounded-3xl border border-white/10 p-4 md:p-6 relative shadow-inner">
           <h3 className="text-center font-black text-white text-lg uppercase tracking-widest mb-6 drop-shadow-md">{filterType} CALENDAR</h3>
           
           <button disabled={currentWeekOffset === 0} onClick={() => setCurrentWeekOffset(prev => prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 z-10 transition-colors">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
           </button>
           <button disabled={currentWeekOffset === 2} onClick={() => setCurrentWeekOffset(prev => prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 z-10 transition-colors">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
           </button>

           <div className="grid grid-cols-6 gap-1 md:gap-2 mb-4">
             {dayNames.map((day, idx) => (
               <div key={day} className="flex flex-col items-center bg-[#08203e] py-2 rounded-t-xl border border-white/10 shadow-sm">
                 <span className="text-[10px] font-black text-white tracking-widest">{day}</span>
                 <span className="text-[8px] font-bold text-white/50">{weekDates[idx].getDate()}/{weekDates[idx].getMonth()+1}</span>
               </div>
             ))}
             
             {times.map((time, tIdx) => (
               <React.Fragment key={time}>
                 {dayNames.map((_, dIdx) => {
                   const slotData = getSlotData(weekDates[dIdx], time);
                   const isAvailable = !!slotData;
                   
                   return (
                     <div 
                       key={`${dIdx}-${tIdx}`} 
                       onClick={() => isAvailable && handleSlotClick(slotData)}
                       className={`h-10 md:h-12 flex items-center justify-center text-[8px] md:text-[9px] font-bold tracking-widest border border-white/5 rounded-sm transition-all ${isAvailable ? 'bg-[#fcd34d] text-[#08203e] cursor-pointer hover:scale-105 shadow-[0_0_10px_rgba(252,211,77,0.3)] z-10 relative' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                     >
                       {time}
                     </div>
                   );
                 })}
               </React.Fragment>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. MAIN ROUTER COMPONENT (Traffic Cop)
// ==========================================
const StudentHub = ({ onReturnHome, preloadedStudent }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeActivity, setActiveActivity] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState(null);
  const [activeJitsiSession, setActiveJitsiSession] = useState(null);
  
  const [showGatekeeper, setShowGatekeeper] = useState(false);
  const [gatekeeperData, setGatekeeperData] = useState(null);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState('LAB SESSION');

  // Community Panel State
  const [showCommunity, setShowCommunity] = useState(false);
  const [communityTab, setCommunityTab] = useState('CHAT');
  
  const [announcements, setAnnouncements] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const fetchAnnouncements = async (levelFullStr) => {
    if (!levelFullStr) return;
    const levelCode = levelFullStr.split(':')[0].trim();
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .or(`audience.eq.EVERYONE_WITH_STAFF,audience.eq.LEVEL_${levelCode}`)
        .order('created_at', { ascending: false });
      if (!error && data) setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    if (preloadedStudent) {
      setStudentData(preloadedStudent);
      setLoading(false);
      fetchUpcomingSession(preloadedStudent.id);
      fetchAnnouncements(preloadedStudent.level);
    } else {
      fetchStudentProfile();
    }
  }, [preloadedStudent]);

  const fetchStudentProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setStudentData(profile);
      fetchUpcomingSession(profile.id);
      fetchAnnouncements(profile.level);
    } catch (err) {
      console.error("Error loading student profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSession = async (studentId) => {
    if (!studentId) return;
    // Look back 24 hours to catch running classes regardless of timezone differences
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('student_id', studentId)
      .in('status', ['booked', 'in_progress'])
      .gte('scheduled_at', yesterday)
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      // Format the date for the UI card
      const d = new Date(data.scheduled_at);
      data.session_date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      setActiveLiveSession(data);
    }
  };

  const handleStartActivity = async (type) => {
    if (!studentData) return;
    
    // Community Routing
    if (type.startsWith('Community_')) {
      setCommunityTab(type.split('_')[1]);
      setShowCommunity(true);
      return;
    }

    if (type === 'Calendar') {
      setCalendarFilter('LAB SESSION');
      setShowCalendar(true);
      return;
    }
    if (type === 'LiveClass') {
      if (activeLiveSession) {
        setIsFetching(true);
        const { data, error } = await supabase.from('live_sessions').select('status').eq('id', activeLiveSession.id).single();
        setIsFetching(false);
        
        if (error) {
          alert("Error de conexión al verificar la sala: " + error.message);
          return;
        }

        if (data && data.status !== 'in_progress') {
          alert("El profesor está abriendo la sala. Por favor, intenta de nuevo en unos segundos.");
          return;
        }
        
        setActiveJitsiSession(activeLiveSession);
      } else {
        alert("No tienes ninguna clase activa programada en este momento.");
      }
      return;
    }
    setIsFetching(true);
    setTimeout(() => {
       setActiveActivity(type);
       setIsFetching(false);
    }, 1000);
  };

  const handleActivityComplete = async (type, mockScores) => {
    setActiveActivity(null);
    const finalScores = type === 'Workbook' 
      ? { Reading: mockScores.Reading, Grammar: mockScores.Grammar, Comprehension: mockScores.Comprehension, Writing: mockScores.Writing || 80 } 
      : { Listening: mockScores.Listening, Reading: mockScores.Reading, Grammar: mockScores.Grammar, Comprehension: mockScores.Comprehension, Speaking: mockScores.Speaking || 75 };

    const scoreValues = Object.values(finalScores);
    const average = scoreValues.length > 0 ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 0;
    const passed = average >= 75;

    try {
      await supabase.from('academic_records').insert({
        student_id: studentData.id,
        unit: studentData.unit || 1,
        activity_type: type,
        score_percentage: average,
        teacher_notes: 'Auto-Graded'
      });
    } catch (e) {
      console.error("Failed to log academic record", e);
    }

    setGatekeeperData({
      type, level: studentData?.level || 'A1', unit: studentData?.unit || 1, scores: finalScores, average, passed, fails: studentData?.unit_fail_count || 0
    });
    setShowGatekeeper(true);
  };

  const handleGatekeeperProceed = async () => {
    try {
      const isLesson = gatekeeperData.type === 'Lesson';
      const updatePayload = isLesson ? { lesson_score: gatekeeperData.average } : { workbook_score: gatekeeperData.average };

      await supabase.from('profiles').update(updatePayload).eq('id', studentData.id);
      setStudentData(prev => ({ ...prev, ...updatePayload }));
      setShowGatekeeper(false);

      if (!isLesson) {
        setCalendarFilter('LIVE LAB SESSION');
        setShowCalendar(true);
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const handleRetry = async () => {
    try {
      const newFails = (studentData.unit_fail_count || 0) + 1;
      await supabase.from('profiles').update({ unit_fail_count: newFails }).eq('id', studentData.id);
      setStudentData({ ...studentData, unit_fail_count: newFails });
      setShowGatekeeper(false);
    } catch (err) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#070b19]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fcd34d]"></div></div>;

  if (activeActivity) {
    return <StudentPlayer activityType={activeActivity} student={studentData} onExit={() => setActiveActivity(null)} onComplete={(scores) => handleActivityComplete(activeActivity, scores)} />;
  }

  return (
    <>
      <LevelCompleteOverlay student={studentData} />

      {activeJitsiSession && (
        <JitsiRoom 
          session={activeJitsiSession} 
          student={studentData} 
          onLeave={() => setActiveJitsiSession(null)} 
        />
      )}

      <CommunityPanel 
        isOpen={showCommunity} 
        onClose={() => setShowCommunity(false)} 
        initialTab={communityTab}
        userProfile={studentData}
        supabase={supabase}
      />

      {showGatekeeper && (
        <EvaluationCrossroad 
          data={gatekeeperData} onProceed={handleGatekeeperProceed} onRetry={handleRetry}
          onScheduleLive={() => { setShowGatekeeper(false); setCalendarFilter('LIVE LAB SESSION'); setShowCalendar(true); }}
          onScheduleComplementary={() => { setShowGatekeeper(false); setCalendarFilter('COMPLEMENTARY CLASS'); setShowCalendar(true); }}
          onScheduleTutoring={() => { setShowGatekeeper(false); setCalendarFilter('1-ON-1 TUTORING'); setShowCalendar(true); }}
        />
      )}

      {showCalendar && (
        <StudentCalendar 
          student={studentData} filterType={calendarFilter} onCancel={() => setShowCalendar(false)} 
          onConfirm={() => { 
            setShowCalendar(false); 
            fetchUpcomingSession(studentData.id);
            alert("¡Reserva confirmada exitosamente!"); 
          }} 
        />
      )}
      
      <div className="hidden md:block">
        <DesktopView 
          student={studentData} onReturnHome={onReturnHome} onStartActivity={handleStartActivity} isFetching={isFetching} activeLiveSession={activeLiveSession} 
          announcements={announcements} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
        />
      </div>
      <div className="block md:hidden">
        <MobileView 
          student={studentData} onReturnHome={onReturnHome} onStartActivity={handleStartActivity} isFetching={isFetching} activeLiveSession={activeLiveSession} 
          announcements={announcements} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
        />
      </div>
    </>
  );
};

export default StudentHub;