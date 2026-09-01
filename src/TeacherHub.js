import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import CommunityPanel from './components/CommunityPanel'; 

// ==========================================
// 1. REUSABLE UI CARDS (Unified Architecture)
// ==========================================

const PayrollCard = ({ acquired, goal }) => {
  const safeAcquired = isNaN(acquired) ? 0 : acquired;
  const safeGoal = goal || 80;
  let progressPercentage = Math.round((Math.min(safeAcquired, safeGoal) / safeGoal) * 100);
  if (isNaN(progressPercentage)) progressPercentage = 0;
  
  const circleCircumference = 2 * Math.PI * 40; 
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden h-full">
      <h3 className="text-white/90 font-bold text-[10px] sm:text-xs tracking-widest uppercase text-center whitespace-nowrap">
        MONTHLY PAYROLL
      </h3>
      
      <div className="flex-1 w-full flex items-center justify-center min-h-0 my-2">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
           <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="transparent" />
             <circle cx="50" cy="50" r="40" stroke="#34d399" strokeWidth="6" fill="transparent" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-white leading-none drop-shadow-md">{safeAcquired}h</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-white/70 tracking-widest uppercase mt-1">LOGGED</span>
           </div>
        </div>
      </div>
      
      <p className="text-center text-white font-bold text-[10px] sm:text-xs tracking-widest uppercase mt-auto whitespace-nowrap">
        TARGET: {safeGoal}h
      </p>
    </div>
  );
};

const UpcomingCard = ({ nextClass, pendingCount }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col h-full">
    <h3 className="text-white font-black text-xl sm:text-2xl tracking-wide mb-4 sm:mb-6 text-center sm:text-left drop-shadow-md shrink-0">Upcoming</h3>
    <ul className="space-y-4 sm:space-y-5 text-xs sm:text-sm font-medium text-white/90 px-1 mb-auto flex-1 flex flex-col justify-center">
      {nextClass ? (
        <li className="flex items-center gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#fcd34d] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="leading-tight"><span className="font-bold text-[#fcd34d] block sm:inline">{nextClass.student_name}:</span> {new Date(nextClass.date).toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
        </li>
      ) : (
        <li className="flex items-center gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="opacity-50 italic leading-tight">No upcoming classes</span>
        </li>
      )}
      <li className="flex items-center gap-3">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        <span className="leading-tight"><strong className="font-bold block sm:inline">Tasks:</strong> {pendingCount} Pending gradings</span>
      </li>
      <li className="flex items-center gap-3">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
        <span className="leading-tight"><strong className="font-bold block sm:inline">Updates:</strong> Check staff board</span>
      </li>
    </ul>
  </div>
);

const MainActionCard = ({ title, iconSrc, isFetching, isActive, onClick, subtitle, highlight }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={!isActive || isFetching} 
      className={`w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center gap-4 transition-all group ${!isActive ? 'opacity-50 grayscale cursor-not-allowed border-white/10' : highlight ? 'hover:bg-[#fcd34d]/10 hover:border-[#fcd34d]/50 hover:scale-[1.02] shadow-[0_0_20px_rgba(252,211,77,0.15)]' : 'hover:bg-white/20 hover:scale-[1.02]'}`}
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
        <h3 className={`font-black tracking-wide text-2xl sm:text-3xl lg:text-4xl drop-shadow-md ${highlight && isActive ? 'text-[#fcd34d]' : 'text-white'}`}>{isFetching ? 'Loading...' : title}</h3>
        {subtitle && <span className="text-[9px] sm:text-[10px] font-bold text-white/50 mt-1 tracking-widest uppercase">{subtitle}</span>}
      </div>
    </button>
  );
};

const PillButton = ({ title, hasNotification, onClick }) => (
  <button onClick={onClick} className="relative w-full py-4 px-2 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-xl text-center text-[10px] sm:text-xs text-white transition-all shadow-md active:scale-95">
    {hasNotification && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>}
    {title}
  </button>
);

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

// SVGs for Teacher Nav (Swapped Live/Calendar for Manual/Tools)
const navIcons = {
  manual: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  tools: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M15.17 11.42L21 5.58a2.652 2.652 0 00-3.75-3.75l-5.83 5.83m-1.5 1.5l-4.58 4.58a2.652 2.652 0 01-3.75-3.75l4.58-4.58" /></svg>,
  bell: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  chat: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l-1-1m0 0l-1 1m1-1v3" /></svg>,
  forum: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
};

// ==========================================
// 2. PROFILE MENU OVERLAY
// ==========================================
const ProfileOverlay = ({ isOpen, onClose, teacher, pendingCount, onOpenEvaluations, onLogout }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="bg-[#070b19]/95 border border-white/20 rounded-3xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <img src={teacher?.avatar_url || 'https://i.pravatar.cc/150'} className="w-16 h-16 rounded-full border-2 border-white/20 object-cover shrink-0 bg-gray-300" alt="Profile" />
          <div className="flex flex-col truncate">
            <h3 className="text-white font-bold text-lg truncate">{teacher?.first_name || 'Teacher'} {teacher?.last_name || ''}</h3>
            <p className="text-emerald-400 text-[10px] font-black tracking-widest uppercase mt-0.5">Instructor</p>
          </div>
        </div>
        
        <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors text-left px-5">My Profile</button>
        <button onClick={() => { onClose(); onOpenEvaluations(); }} className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors text-left px-5 flex justify-between items-center group">
          <span>Pending Gradings</span>
          {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-md">{pendingCount}</span>}
        </button>
        <button onClick={onLogout} className="w-full py-3.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-sm font-bold transition-colors text-left px-5 mt-2 border border-red-500/20 hover:border-transparent">Log Out</button>
      </div>
    </div>
  );
};


// ==========================================
// 3. DESKTOP VIEW
// ==========================================
const DesktopView = ({ teacher, nextClass, pendingEvaluations, payrollStats, onReturnHome, onAction, onRequestSub, onOpenProfileMenu, isLaunching, hasNewStaffBoard, latestAnnouncement, latestForumPost }) => {
  const goal = payrollStats?.monthlyGoal || 100;
  const acquired = payrollStats?.current || 0;

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

      {/* SIDEBAR NAVIGATION (Modified for Teachers) */}
      <div className="w-28 border-r border-white/10 bg-black/20 backdrop-blur-2xl flex flex-col items-center py-10 gap-6 shrink-0 z-10 shadow-2xl">
        <NavIconBtn isProfile avatarUrl={teacher?.avatar_url} onClick={onOpenProfileMenu} hasNotification={pendingEvaluations.length > 0} />
        <div className="w-12 h-px bg-white/10 my-2"></div>
        <NavIconBtn iconSvg={navIcons.manual} onClick={() => onAction('Manual')} />
        <NavIconBtn iconSvg={navIcons.tools} onClick={() => onAction('Tools')} />
        <NavIconBtn iconSvg={navIcons.bell} hasNotification={hasNewStaffBoard} />
        <NavIconBtn iconSvg={navIcons.chat} onClick={() => onAction('Community_CHAT')} />
        <NavIconBtn iconSvg={navIcons.forum} onClick={() => onAction('Community_BOARD')} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar z-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10 pl-2">
          <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-12 lg:h-14 object-contain opacity-100" />
          <div className="h-10 w-[2px] bg-white/40"></div>
          <span className="text-2xl lg:text-3xl font-light text-white tracking-wide">Teacher Hub</span>
        </div>

        {/* 3-COLUMN GRID */}
        <div className="grid grid-cols-12 gap-6 w-full max-w-[1400px] h-[calc(100vh-160px)]">
          
          {/* LEFT COLUMN: Status & Agenda */}
          <div className="col-span-3 flex flex-col gap-6 h-full">
            <div className="flex-[0.4]">
              <PayrollCard acquired={acquired} goal={goal} />
            </div>
            <div className="flex-[0.6]">
              <UpcomingCard nextClass={nextClass} pendingCount={pendingEvaluations.length} />
            </div>
            <div className="flex flex-col gap-4 mt-auto">
              <button onClick={onRequestSub} className="w-full py-4 bg-[#e2e8f0] text-[#0f172a] hover:bg-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-xl leading-tight text-center">
                <img src="https://i.postimg.cc/mrtXmB72/Copia-de-Diseno-sin-titulo-(2).png" alt="Substitute" className="w-8 h-8 object-contain shrink-0" />
                REQUEST<br/>SUBSTITUTE
              </button>
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
                title="Start class" 
                iconSrc="https://i.postimg.cc/Wpqw4Y1x/7(6).png" 
                isActive={!!nextClass} 
                isFetching={isLaunching} 
                onClick={() => onAction('Live')} 
                subtitle={nextClass ? 'READY TO LAUNCH' : 'NO CLASS SCHEDULED'} 
                highlight={true}
              />
            </div>
            <div className="flex-1">
              <MainActionCard 
                title="My roster" 
                iconSrc="https://i.postimg.cc/vT49xTyn/3(6).png" 
                isActive={true} 
                isFetching={false} 
                onClick={() => onAction('Calendar')} 
                subtitle="VIEW SCHEDULE" 
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Info Board & Feed */}
          <div className="col-span-5 flex flex-col gap-6 h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 shrink-0">
              <PillButton title="Teacher Manual" onClick={() => onAction('Manual')} />
              <PillButton title="Class Tools" onClick={() => onAction('Tools')} />
              <PillButton title="Class Chat" onClick={() => onAction('Community_CHAT')} />
              <PillButton title="Staff Board" onClick={() => onAction('Community_BOARD')} hasNotification={hasNewStaffBoard} />
              <PillButton title="Open Forum" onClick={() => onAction('Community_BOARD')} />
              <PillButton title="Request Sub" onClick={onRequestSub} />
            </div>

            <div className="flex-1 flex flex-col gap-4 mt-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
                {/* DYNAMIC ANNOUNCEMENT CARD */}
                {latestAnnouncement ? (
                  <div onClick={() => onAction('Community_BOARD')} className="bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col xl:flex-row items-center gap-4 hover:bg-white/20 transition-all hover:scale-[1.02] cursor-pointer shadow-md">
                    {latestAnnouncement.image_url && (
                      <div className="w-full xl:w-24 h-32 xl:h-24 rounded-xl overflow-hidden shrink-0 border border-white/30 shadow-sm">
                        <img src={latestAnnouncement.image_url} alt="Announcement" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col w-full text-center xl:text-left">
                      <h4 className="text-sm font-black uppercase tracking-widest mb-1 text-[#fcd34d] drop-shadow-sm truncate">{latestAnnouncement.title}</h4>
                      <p className="text-[10px] text-white/80 leading-relaxed font-medium line-clamp-3">{latestAnnouncement.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center text-white/30 text-[10px] font-bold uppercase tracking-widest min-h-[100px]">
                    No recent announcements
                  </div>
                )}

                {/* DYNAMIC FORUM BANNER */}
                {latestForumPost ? (
                  <div onClick={() => onAction('Community_BOARD')} className="bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all hover:scale-[1.02] cursor-pointer text-center shadow-md">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 block">Latest Forum Topic</span>
                    <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-white drop-shadow-sm truncate">{latestForumPost.title}</h4>
                    <p className="text-[10px] text-white/80 leading-relaxed font-medium line-clamp-2">{latestForumPost.content}</p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-white/30 text-[10px] font-bold uppercase tracking-widest min-h-[100px]">
                    No active forum topics
                  </div>
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
const MobileView = ({ teacher, nextClass, pendingEvaluations, payrollStats, onReturnHome, onAction, onRequestSub, onOpenProfileMenu, isLaunching, hasNewStaffBoard, latestAnnouncement, latestForumPost }) => {
  const goal = payrollStats?.monthlyGoal || 100;
  const acquired = payrollStats?.current || 0;

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
        <span className="text-base sm:text-lg font-light text-white tracking-wide">Teacher Hub</span>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex flex-col gap-4 p-4 z-10">
        
        {/* ROW 1: Completion & Activities */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="h-60 sm:h-64">
            <PayrollCard acquired={acquired} goal={goal} />
          </div>
          <div className="h-60 sm:h-64">
            <UpcomingCard nextClass={nextClass} pendingCount={pendingEvaluations.length} />
          </div>
        </div>

        {/* ROW 2: Start Class & Roster */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-4">
          <div className="h-60 sm:h-64">
            <MainActionCard 
              title="Start class" 
              iconSrc="https://i.postimg.cc/Wpqw4Y1x/7(6).png" 
              isActive={!!nextClass} 
              isFetching={isLaunching} 
              onClick={() => onAction('Live')} 
              subtitle={nextClass ? 'READY' : 'NO CLASS'} 
              highlight={true}
            />
          </div>
          <div className="h-60 sm:h-64">
            <MainActionCard 
              title="My roster" 
              iconSrc="https://i.postimg.cc/vT49xTyn/3(6).png" 
              isActive={true} 
              isFetching={false} 
              onClick={() => onAction('Calendar')} 
              subtitle="SCHEDULE" 
            />
          </div>
        </div>

        {/* RIGHT COLUMN DATA (Now below) */}
        <div className="flex flex-col gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 shadow-2xl mt-2 sm:mt-4">
          {/* PILLS */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <PillButton title="Teacher Manual" onClick={() => onAction('Manual')} />
            <PillButton title="Class Tools" onClick={() => onAction('Tools')} />
            <PillButton title="Class Chat" onClick={() => onAction('Community_CHAT')} />
            <PillButton title="Staff Board" onClick={() => onAction('Community_BOARD')} hasNotification={hasNewStaffBoard} />
            <PillButton title="Open Forum" onClick={() => onAction('Community_BOARD')} />
            <PillButton title="Request Sub" onClick={onRequestSub} />
          </div>

          {/* DYNAMIC ANNOUNCEMENT CARD */}
          {latestAnnouncement ? (
            <div onClick={() => onAction('Community_BOARD')} className="bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 mt-2 hover:bg-white/20 transition-all cursor-pointer shadow-md">
              {latestAnnouncement.image_url && (
                <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-white/30">
                  <img src={latestAnnouncement.image_url} alt="Announcement" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col text-center sm:text-left">
                <h4 className="text-sm font-black uppercase tracking-widest mb-1 text-[#fcd34d] truncate">{latestAnnouncement.title}</h4>
                <p className="text-[10px] text-white/80 leading-relaxed font-medium line-clamp-3">{latestAnnouncement.content}</p>
              </div>
            </div>
          ) : (
             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center text-white/30 text-[10px] font-bold uppercase tracking-widest min-h-[100px] mt-2">
                No recent announcements
             </div>
          )}

          {/* DYNAMIC FORUM BANNER */}
          {latestForumPost ? (
            <div onClick={() => onAction('Community_BOARD')} className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center hover:bg-white/20 transition-all cursor-pointer shadow-md">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 block">Latest Forum Topic</span>
              <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-white truncate">{latestForumPost.title}</h4>
              <p className="text-[10px] text-white/80 leading-relaxed font-medium line-clamp-2">{latestForumPost.content}</p>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-white/30 text-[10px] font-bold uppercase tracking-widest min-h-[100px]">
              No active forum topics
            </div>
          )}
        </div>

        {/* SOCIALS & SUPPORT */}
        <div className="flex flex-col items-center gap-5 mt-4 px-2">
          <div className="flex justify-center gap-4 sm:gap-6 w-full">
            <SocialButton src="https://i.postimg.cc/ry0TD2Hv/11(6).png" url="https://www.facebook.com/share/1KxawRX9vA/" />
            <SocialButton src="https://i.postimg.cc/MpD2C6cs/10(5).png" url="https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==" />
            <SocialButton src="https://i.postimg.cc/pXbwyhzD/9(3).png" url="https://www.tiktok.com/@outloudlanguage" />
            <SocialButton src="https://i.postimg.cc/0y9hdTtf/8(4).png" url="https://discord.gg/847PMD2DbV" />
          </div>
          <button onClick={onRequestSub} className="w-full py-4 bg-[#e2e8f0] text-[#0f172a] font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl leading-tight">
            <img src="https://i.postimg.cc/mrtXmB72/Copia-de-Diseno-sin-titulo-(2).png" alt="Help" className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
            REQUEST SUBSTITUTE
          </button>
        </div>

      </div>

      {/* FIXED BOTTOM NAVIGATION (Modified for Teachers) */}
      <div className="fixed bottom-0 left-0 right-0 h-20 sm:h-24 bg-white/10 backdrop-blur-2xl border-t border-white/20 flex items-center justify-between px-2 sm:px-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavIconBtn isProfile avatarUrl={teacher?.avatar_url} onClick={onOpenProfileMenu} hasNotification={pendingEvaluations.length > 0} />
        <NavIconBtn iconSvg={navIcons.manual} onClick={() => onAction('Manual')} />
        <NavIconBtn iconSvg={navIcons.tools} onClick={() => onAction('Tools')} />
        <NavIconBtn iconSvg={navIcons.bell} hasNotification={hasNewStaffBoard} />
        <NavIconBtn iconSvg={navIcons.chat} onClick={() => onAction('Community_CHAT')} />
        <NavIconBtn iconSvg={navIcons.forum} onClick={() => onAction('Community_BOARD')} />
      </div>

    </div>
  );
};

// ==========================================
// 5. EVALUATION MODAL (Gatekeeper)
// ==========================================
const EvaluationModal = ({ isOpen, onClose, pendingClasses, onGradeSubmitted, teacherId }) => {
  const [activeClassIndex, setActiveClassIndex] = useState(0);
  const [scores, setScores] = useState({ listening: 0, speaking: 0, reading: 0, writing: 0, grammar: 0 });
  const [deductions, setDeductions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || pendingClasses.length === 0) return null;

  const currentEvaluation = pendingClasses[activeClassIndex];

  const criteria = [
    { id: 'listening', title: 'Listening', desc: 'Aural comprehension and responsiveness to live instructions.' },
    { id: 'speaking', title: 'Speaking', desc: 'Verbal fluency, pronunciation, and conversational interaction.' },
    { id: 'reading', title: 'Reading', desc: 'Textual interpretation and reading comprehension.' },
    { id: 'writing', title: 'Writing', desc: 'Structural output, spelling, and sentence formulation.' },
    { id: 'grammar', title: 'Grammar', desc: 'Syntactic accuracy and target structure application.' }
  ];

  const deductionOptions = [
    { id: 'd1', label: 'Pronunciation / L1 Interference', penalty: 0.5 },
    { id: 'd2', label: 'Minor Grammatical Slips', penalty: 0.5 },
    { id: 'd3', label: 'Over-reliance on Fillers (Uh/Um)', penalty: 0.5 },
    { id: 'd4', label: 'Hesitation / Pacing Issues', penalty: 0.5 },
    { id: 'd5', label: 'Incomplete Task Fulfillment', penalty: 1.0 },
    { id: 'd6', label: 'Severe Lexical Range Deficit', penalty: 1.0 }
  ];

  const baseScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const deductionTotal = deductionOptions.reduce((total, opt) => deductions[opt.id] ? total + opt.penalty : total, 0);
  const finalScore = Math.max(0, baseScore - deductionTotal);

  const isPassed = finalScore >= 13.5;
  const isComplete = scores.listening > 0 && scores.speaking > 0 && scores.reading > 0 && scores.writing > 0 && scores.grammar > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const activeDeds = deductionOptions.filter(d => deductions[d.id]).map(d => d.label).join(', ');
      const notes = `L:${scores.listening}/4 | S:${scores.speaking}/4 | R:${scores.reading}/4 | W:${scores.writing}/4 | G:${scores.grammar}/4. Deductions: ${activeDeds || 'None'}.`;

      await supabase.from('academic_records').insert({
        student_id: currentEvaluation.student_id,
        teacher_id: teacherId,
        unit: currentEvaluation.unit,
        activity_type: 'Live Class',
        score_percentage: (finalScore / 20) * 100, // Saves in 100% format for global average consistency
        teacher_notes: notes
      });

      await supabase.from('live_sessions').update({ is_graded: true }).eq('id', currentEvaluation.id);

      const { data: studentProfile } = await supabase.from('profiles').select('unit, unit_fail_count').eq('id', currentEvaluation.student_id).single();
      
      if (isPassed) {
        await supabase.from('profiles').update({
          unit: (studentProfile.unit || 1) + 1,
          lesson_score: 0,
          workbook_score: 0,
          unit_fail_count: 0
        }).eq('id', currentEvaluation.student_id);
      } else {
        await supabase.from('profiles').update({
          unit_fail_count: (studentProfile.unit_fail_count || 0) + 1
        }).eq('id', currentEvaluation.student_id);
      }

      setScores({ listening: 0, speaking: 0, reading: 0, writing: 0, grammar: 0 });
      setDeductions({});
      onGradeSubmitted(currentEvaluation.id);
      if (pendingClasses.length <= 1) onClose();
      setIsSubmitting(false);

    } catch (error) {
      console.error("Evaluation Saving Error:", error);
      alert("Hubo un error al guardar la evaluación.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-montserrat overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#070b19]/95 border border-white/20 rounded-[2rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden my-8">
        
        <div className="p-6 md:p-8 border-b border-white/10 bg-white/5 relative z-10 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl md:text-2xl font-black text-[#fcd34d] uppercase tracking-widest drop-shadow-md">Live Class Evaluation</h2>
            {pendingClasses.length > 1 && <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-widest animate-pulse">{pendingClasses.length} Pending</span>}
          </div>
          <p className="text-sm text-white/70">Student: <strong className="text-white text-lg">{currentEvaluation.student_name}</strong> • Unit {currentEvaluation.unit}</p>
        </div>

        <div className="p-6 md:p-8 space-y-6 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-black text-[#fcd34d] uppercase tracking-widest border-b border-white/10 pb-2 mb-4">5 Core Competencies (4 pts each)</h3>
          {criteria.map((crit) => (
            <div key={crit.id} className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{crit.title}</h3>
                <p className="text-[10px] text-white/50">{crit.desc}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {[1, 2, 3, 4].map((val) => (
                  <button
                    key={val} onClick={() => setScores(prev => ({ ...prev, [crit.id]: val }))}
                    className={`flex-1 md:w-12 h-10 rounded-lg text-xs font-black transition-all ${scores[crit.id] === val ? 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_10px_rgba(252,211,77,0.4)] scale-105' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <h3 className="text-xs font-black text-red-400 uppercase tracking-widest border-b border-red-500/20 pb-2 mt-8 mb-4">Paralinguistic Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-5 shadow-inner">
            {deductionOptions.map(opt => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={deductions[opt.id] || false} onChange={e => setDeductions(prev => ({...prev, [opt.id]: e.target.checked}))} className="w-5 h-5 rounded border-white/20 bg-black/40 text-red-500 focus:ring-red-500 focus:ring-offset-0 cursor-pointer" />
                <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors flex-1">{opt.label}</span>
                <span className="text-red-400 font-black text-[10px] bg-red-500/10 px-2 py-0.5 rounded">-{opt.penalty}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8 bg-black/40 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 shrink-0">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Final Score</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Pass/Fail Threshold: 13.5</span>
            </div>
            <div className={`text-5xl font-black drop-shadow-md ${finalScore === 0 ? 'text-white/20' : isPassed ? 'text-emerald-400' : 'text-red-400'}`}>{finalScore.toFixed(1)}</div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={onClose} className="flex-1 md:flex-none px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-xl transition-colors">Postpone</button>
            <button 
              disabled={!isComplete || isSubmitting} onClick={handleSubmit} 
              className={`flex-[2] md:flex-none px-8 py-4 font-black text-xs uppercase rounded-xl shadow-lg transition-all ${!isComplete ? 'bg-white/10 text-white/30 cursor-not-allowed' : isPassed ? 'bg-emerald-400 text-[#08203e] shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:bg-emerald-300' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-400'}`}
            >
              {isSubmitting ? 'Saving...' : isPassed ? 'APPROVE STUDENT' : 'FAIL & REQUIRE TUTORING'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 6. MAIN ROUTER COMPONENT
// ==========================================
const TeacherHub = ({ onReturnHome }) => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextClass, setNextClass] = useState(null);
  const [payrollStats, setPayrollStats] = useState({ current: 0, monthlyGoal: 80 }); 
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Dynamic Notification State (defaults to false)
  const [hasNewStaffBoard, setHasNewStaffBoard] = useState(false);
  
  // Real-time Feed States
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [latestForumPost, setLatestForumPost] = useState(null);

  // Community Panel State
  const [showCommunity, setShowCommunity] = useState(false);
  const [communityTab, setCommunityTab] = useState('CHAT');

  useEffect(() => {
    fetchTeacherDashboard();
  }, []);

  const fetchTeacherDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setTeacherData(profile);

      // 1. Secure Local Time Calculation
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60000;
      const localNow = new Date(now.getTime() - localOffset);
      const todayStr = localNow.toISOString().split('T')[0];
      const firstDayOfMonth = new Date(localNow.getFullYear(), localNow.getMonth(), 1).toISOString().split('T')[0];

      // 2. Fetch all upcoming classes safely handling capitalized statuses
      const { data: upcoming, error: upcomingError } = await supabase
        .from('live_sessions')
        .select(`*, student:profiles!student_id(first_name, last_name)`)
        .eq('teacher_id', session.user.id)
        .in('status', ['booked', 'Booked', 'BOOKED'])
        .gte('session_date', todayStr);

      if (upcomingError) console.error("Database Fetch Error:", upcomingError);

      if (upcoming && upcoming.length > 0) {
        const sortedClasses = upcoming.map(cls => {
          // Robust Time Parser for "9:00 AM" -> "09:00:00"
          const timeStr = cls.time_slot || "12:00 AM";
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          let hours = 0;
          let mins = "00";
          
          if (match) {
            hours = parseInt(match[1], 10);
            mins = match[2];
            const modifier = match[3].toUpperCase();
            if (hours === 12) hours = 0;
            if (modifier === 'PM') hours += 12;
          }
          
          const paddedHours = hours.toString().padStart(2, '0');
          const classDateTime = new Date(`${cls.session_date}T${paddedHours}:${mins}:00`);
          
          return { ...cls, parsedDate: classDateTime };
        })
        // Allow classes that started up to 1 hour ago to remain active
        .filter(cls => cls.parsedDate.getTime() >= (now.getTime() - (60 * 60 * 1000)))
        .sort((a, b) => a.parsedDate - b.parsedDate);

        if (sortedClasses.length > 0) {
          const next = sortedClasses[0];
          setNextClass({
            id: next.id,
            student_id: next.student_id,
            student_name: `${next.student?.first_name || 'Estudiante'} ${next.student?.last_name || ''}`.trim(),
            unit: next.unit || 1,
            date: next.parsedDate.toISOString() // Provides a safe string for React rendering
          });
        }
      }

      // 3. Fetch Pending Gradings
      const { data: pending } = await supabase
        .from('live_sessions')
        .select(`*, student:profiles!student_id(first_name, last_name)`)
        .eq('teacher_id', session.user.id)
        .in('status', ['completed', 'Completed', 'COMPLETED'])
        .eq('is_graded', false);

      if (pending) {
        setPendingEvaluations(pending.map(p => ({
          id: p.id,
          student_id: p.student_id,
          student_name: `${p.student?.first_name || 'Estudiante'} ${p.student?.last_name || ''}`.trim(),
          unit: p.unit || 1,
          date: `${p.session_date} ${p.time_slot}`
        })));
      }

      // 4. Fetch Logged Hours
      const { count: loggedHours } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', session.user.id)
        .in('status', ['completed', 'Completed', 'COMPLETED'])
        .gte('session_date', firstDayOfMonth);

      setPayrollStats({ current: loggedHours || 0, monthlyGoal: 80 });

      // 5. Fetch Latest Announcement
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .in('audience', ['EVERYONE_WITH_STAFF', 'STAFF_ONLY'])
        .order('created_at', { ascending: false })
        .limit(1);
      if (annData && annData.length > 0) setLatestAnnouncement(annData[0]);

      // 6. Fetch Latest Forum Post
      const { data: forumData } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (forumData && forumData.length > 0) setLatestForumPost(forumData[0]);

    } catch (err) {
      console.error("Critical Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType) => {
    // Community Routing
    if (actionType.startsWith('Community_')) {
      setCommunityTab(actionType.split('_')[1]);
      setShowCommunity(true);
      if (actionType === 'Community_BOARD') setHasNewStaffBoard(false);
      return;
    }

    if (actionType === 'Live' && nextClass) {
      setIsLaunching(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-zoom-meeting', {
          body: { 
            sessionId: nextClass.id,
            topic: `Outloud Unit ${nextClass.unit} - ${nextClass.student_name}`
          }
        });

        const launchUrl = data?.startUrl || `https://meet.jit.si/OLA-${nextClass.id}`;
        window.open(launchUrl, '_blank');

        await supabase.from('live_sessions').update({ status: 'completed' }).eq('id', nextClass.id);
        
        setPendingEvaluations(prev => [...prev, nextClass]);
        setNextClass(null);
        setIsEvalModalOpen(true);

      } catch (err) {
        console.error("Error launching class:", err);
        alert("Hubo un error al iniciar la clase virtual.");
      } finally {
        setIsLaunching(false);
      }
    }
  };

  const removeEvaluatedClass = (classId) => setPendingEvaluations(prev => prev.filter(c => c.id !== classId));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#070b19]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fcd34d]"></div></div>;

  return (
    <>
      <CommunityPanel 
        isOpen={showCommunity} 
        onClose={() => setShowCommunity(false)} 
        initialTab={communityTab}
        userProfile={teacherData}
        supabase={supabase}
      />

      <EvaluationModal 
        isOpen={isEvalModalOpen} 
        onClose={() => setIsEvalModalOpen(false)} 
        pendingClasses={pendingEvaluations} 
        onGradeSubmitted={removeEvaluatedClass} 
        teacherId={teacherData?.id} 
      />

      <ProfileOverlay 
        isOpen={isProfileMenuOpen} 
        onClose={() => setIsProfileMenuOpen(false)} 
        teacher={teacherData} 
        pendingCount={pendingEvaluations.length} 
        onOpenEvaluations={() => setIsEvalModalOpen(true)} 
        onLogout={onReturnHome} 
      />

      <div className="hidden md:block">
            <DesktopView 
              teacher={teacherData} 
              nextClass={nextClass} 
              payrollStats={payrollStats} 
              pendingEvaluations={pendingEvaluations} 
              onReturnHome={onReturnHome} 
              onAction={handleAction} 
              onRequestSub={() => setIsSubModalOpen(true)} 
              onOpenProfileMenu={() => setIsProfileMenuOpen(true)} 
              isLaunching={isLaunching}
              hasNewStaffBoard={hasNewStaffBoard}
              latestAnnouncement={latestAnnouncement}
              latestForumPost={latestForumPost}
            />
          </div>
          <div className="block md:hidden">
            <MobileView 
              teacher={teacherData} 
              nextClass={nextClass} 
              payrollStats={payrollStats} 
              pendingEvaluations={pendingEvaluations} 
              onReturnHome={onReturnHome} 
              onAction={handleAction} 
              onRequestSub={() => setIsSubModalOpen(true)} 
              onOpenProfileMenu={() => setIsProfileMenuOpen(true)} 
              isLaunching={isLaunching} 
              hasNewStaffBoard={hasNewStaffBoard}
              latestAnnouncement={latestAnnouncement}
              latestForumPost={latestForumPost}
            />
          </div>
    </>
  );
};

export default TeacherHub;