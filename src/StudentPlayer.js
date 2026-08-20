import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import StudentPlayer from './StudentPlayer';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// ==========================================
// 1. DASHBOARD VIEWS (Desktop & Mobile)
// ==========================================
const DesktopView = ({ student, onReturnHome, onStartActivity, isFetching }) => {
  const currentUnit = student?.unit || 1;
  const totalUnits = 12; 
  const progressPercentage = Math.round((Math.max(0, currentUnit - 1) / totalUnits) * 100);
  const circleCircumference = 2 * Math.PI * 40; 
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  // Gatekeeper Checks
  const lessonScore = student?.lesson_score || 0;
  const workbookScore = student?.workbook_score || 0;
  const isWorkbookUnlocked = lessonScore >= 75;
  const isCalendarUnlocked = isWorkbookUnlocked && workbookScore >= 75;

  const LockIcon = () => (
    <svg className="w-6 h-6 text-white/40 absolute top-6 right-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="min-h-screen w-full font-montserrat flex justify-center p-8 relative overflow-hidden bg-[#070b19] text-white">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <div className="max-w-[1200px] w-full flex gap-8 relative z-10">
        <div className="w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 shadow-2xl flex flex-col shrink-0 relative overflow-hidden">
          <h2 className="text-white font-black text-lg text-center mb-6 tracking-wide drop-shadow-md">STUDENT PROGRESS</h2>
          <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
               <circle cx="50" cy="50" r="40" stroke="#fcd34d" strokeWidth="8" fill="transparent" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white leading-none drop-shadow-md">{progressPercentage}%</span>
                <span className="text-[9px] font-bold text-white/70 tracking-widest uppercase mt-1">COMPLETED</span>
             </div>
          </div>
          <p className="text-center text-white/80 font-bold text-sm mb-8 tracking-widest uppercase">UNIT {currentUnit}/{totalUnits}</p>

          <h3 className="text-white font-black text-sm mb-4 tracking-widest uppercase">UPCOMING ACTIVITIES</h3>
          <ul className="space-y-3 mb-auto text-xs font-medium text-white/80">
            <li className="flex items-center gap-3"><span className="opacity-70">📅</span> Aug 15: Live Lab Session</li>
            <li className="flex items-center gap-3"><span className="opacity-70">💬</span> Aug 18: Chat room meeting</li>
          </ul>

          <button className="w-full bg-white/90 text-[#08203e] font-black text-[10px] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:scale-105 transition-transform shadow-lg mt-8 mb-6 uppercase tracking-widest">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            SUPPORT
          </button>
        </div>

        <div className="flex-1 flex flex-col pt-2">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-4">
                <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 object-contain opacity-90" />
                <div className="h-6 w-[1px] bg-white/30"></div>
                <span className="text-sm font-light text-white/80 tracking-wide uppercase">Online Platform</span>
             </div>
             <div className="flex items-center gap-4">
               <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 pr-6 pl-2 flex items-center gap-3 shadow-lg">
                 <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden border border-white/50 shrink-0"><img src={student?.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile" className="w-full h-full object-cover" /></div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight text-white">{student?.first_name || 'Student'} {student?.last_name || ''}</span>
                    <span className="text-[9px] text-[#fcd34d] font-bold tracking-widest uppercase">Level {student?.level || 'A1'}</span>
                 </div>
               </div>
               <button onClick={onReturnHome} className="text-white hover:text-red-400 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            <div className="grid grid-cols-3 gap-6 h-[45%]">
              
              {/* LESSON BUTTON - ALWAYS ACTIVE FOR CURRENT UNIT */}
              <button onClick={() => onStartActivity('Lesson')} disabled={isFetching} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/wxw0tRXY/1(7).png" alt="Lesson" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex flex-col items-center">
                  <h3 className="font-light tracking-wide text-2xl uppercase text-[#fcd34d] drop-shadow-md">{isFetching ? 'Loading...' : `Lesson ${student?.unit || 1}`}</h3>
                  {lessonScore > 0 && <span className="text-[10px] font-bold text-white/50 mt-1">SCORE: {lessonScore}%</span>}
                </div>
              </button>

              {/* WORKBOOK BUTTON - UNLOCKS AT 75% LESSON SCORE */}
              <button onClick={() => onStartActivity('Workbook')} disabled={!isWorkbookUnlocked || isFetching} className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 transition-all group ${!isWorkbookUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/20 hover:scale-[1.02]'}`}>
                {!isWorkbookUnlocked && <LockIcon />}
                <img src="https://i.postimg.cc/s2J5tbKz/2(9).png" alt="Workbook" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex flex-col items-center">
                  <h3 className="font-light tracking-wide text-2xl uppercase">Workbook</h3>
                  {workbookScore > 0 && <span className="text-[10px] font-bold text-white/50 mt-1">SCORE: {workbookScore}%</span>}
                </div>
              </button>

              {/* CALENDAR BUTTON - UNLOCKS AT 75% WORKBOOK SCORE */}
              <button onClick={() => onStartActivity('Calendar')} disabled={!isCalendarUnlocked || isFetching} className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 transition-all group ${!isCalendarUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/20 hover:scale-[1.02]'}`}>
                {!isCalendarUnlocked && <LockIcon />}
                <img src="https://i.postimg.cc/vT49xTyn/3(6).png" alt="Calendar" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-2xl uppercase">Calendar</h3>
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-6 flex-1">
              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group"><img src="https://i.postimg.cc/rpgthxF0/4(5).png" alt="Forum" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" /><h3 className="font-light tracking-wide text-lg text-center leading-tight">Open<br/>forum</h3></button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group"><img src="https://i.postimg.cc/XNrQC7QY/5(4).png" alt="Chat" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" /><h3 className="font-light tracking-wide text-lg text-center leading-tight">Chat<br/>room</h3></button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group"><img src="https://i.postimg.cc/PqfMrtCH/6(4).png" alt="Info" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" /><h3 className="font-light tracking-wide text-lg text-center leading-tight">Info<br/>board</h3></button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group"><img src="https://i.postimg.cc/Wpqw4Y1x/7(6).png" alt="Live Class" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" /><h3 className="font-light tracking-wide text-lg text-center leading-tight">Live<br/>class</h3></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileView = ({ student, onReturnHome, onStartActivity, isFetching }) => {
  const currentUnit = student?.unit || 1;
  const totalUnits = 12; 
  const progressPercentage = Math.round((Math.max(0, currentUnit - 1) / totalUnits) * 100);
  const circleCircumference = 2 * Math.PI * 30; 
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  // Gatekeeper Checks
  const isWorkbookUnlocked = (student?.lesson_score || 0) >= 75;
  const isCalendarUnlocked = isWorkbookUnlocked && (student?.workbook_score || 0) >= 75;

  const cards = [
    { title: `Lesson ${student?.unit || 1}`, action: isFetching ? "LOADING..." : "START", img: "https://i.postimg.cc/wxw0tRXY/1(7).png", active: true, onClick: () => onStartActivity('Lesson') },
    { title: "Workbook", action: "START", img: "https://i.postimg.cc/s2J5tbKz/2(9).png", active: isWorkbookUnlocked, onClick: () => onStartActivity('Workbook') },
    { title: "Calendar", action: "SCHEDULE", img: "https://i.postimg.cc/vT49xTyn/3(6).png", active: isCalendarUnlocked, onClick: () => onStartActivity('Calendar') },
    { title: "Open Forum", action: "COMMENT", img: "https://i.postimg.cc/rpgthxF0/4(5).png", active: false },
    { title: "Chat Room", action: "JOIN", img: "https://i.postimg.cc/XNrQC7QY/5(4).png", active: false },
  ];

  return (
    <div className="min-h-screen w-full font-montserrat flex flex-col overflow-x-hidden pb-10 bg-[#070b19] text-white relative z-0">
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/30 blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[90px] mix-blend-screen"></div>
      </div>

      <div className="flex justify-between items-center p-5 z-10 border-b border-white/10 bg-[#070b19]/80 backdrop-blur-md">
        <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-6 object-contain opacity-90" />
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-[10px] uppercase tracking-widest">{student?.first_name || 'Student'}</span>
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden border border-white/30" onClick={onReturnHome}><img src={student?.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile" className="w-full h-full object-cover" /></div>
        </div>
      </div>

      <div className="mx-5 mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl flex gap-4 z-10">
        <div className="flex flex-col items-center justify-center border-r border-white/10 pr-5">
          <div className="relative w-[70px] h-[70px] flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
               <circle cx="50" cy="50" r="30" stroke="#fcd34d" strokeWidth="6" fill="transparent" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-center"><span className="text-sm font-black text-white leading-none">{progressPercentage}%</span></div>
          </div>
          <p className="text-[8px] font-bold tracking-widest text-white/70 mt-2 uppercase">Unit {currentUnit}/{totalUnits}</p>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-[#fcd34d] font-black text-[10px] mb-2 uppercase tracking-widest drop-shadow-md">Upcoming Activities</h3>
          <ul className="space-y-2 text-[9px] font-medium text-white/80">
            <li className="flex items-center gap-2"><span className="opacity-70">📅</span> Aug 15: Live Lab Session</li>
            <li className="flex items-center gap-2"><span className="opacity-70">💬</span> Aug 18: Chat room meeting</li>
          </ul>
        </div>
      </div>

      <h2 className="text-center font-black text-white text-sm mt-10 mb-6 tracking-[0.2em] drop-shadow-md z-10">INTERACTIVE DASHBOARD</h2>

      <div className="w-full h-64 relative z-10">
        <Swiper effect={'coverflow'} grabCursor={true} centeredSlides={true} slidesPerView={'auto'} coverflowEffect={{ rotate: 0, stretch: 0, depth: 150, modifier: 2.5, slideShadows: false }} modules={[EffectCoverflow, Pagination]} className="w-full h-full">
          {cards.map((card, idx) => (
            <SwiperSlide key={idx} className={`w-48 h-60 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 shadow-2xl flex flex-col items-center justify-between transition-all ${!card.active ? 'opacity-50 grayscale' : ''}`}>
              {!card.active && (
                <svg className="w-6 h-6 text-white/50 absolute top-4 right-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              )}
              <img src={card.img} alt={card.title} className="h-24 object-contain mt-4 drop-shadow-md opacity-90" />
              <div className="w-full text-center">
                <h3 className={`font-light text-xl mb-4 tracking-wide uppercase ${card.active ? 'text-[#fcd34d] font-bold drop-shadow-md' : 'text-white/70'}`}>{card.title}</h3>
                <button 
                  disabled={!card.active}
                  onClick={() => card.onClick && card.onClick()} 
                  className={`w-full font-black text-[10px] py-3 rounded-full shadow-lg tracking-widest uppercase transition-transform active:scale-95 ${card.active ? 'bg-[#fcd34d] text-[#08203e]' : 'bg-white/20 text-white cursor-not-allowed'}`}
                >
                  {card.action}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

// ==========================================
// 2. TEMPLATE 9: THE GATEKEEPER
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
          <h2 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-4 tracking-wide uppercase drop-shadow-md">
            {level}: UNIT {unit}
          </h2>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-6 tracking-wide uppercase drop-shadow-md">
            {type} 1
          </h3>
          <h1 className={`text-5xl md:text-7xl font-black uppercase tracking-wider ${passed ? 'text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]' : 'text-red-100 drop-shadow-[0_0_25px_rgba(248,113,113,0.9)]'}`}>
            {passed ? 'COMPLETED' : 'RESULTS'}
          </h1>
        </div>

        <div className="flex-[0.8] flex flex-col items-center justify-center w-full max-w-sm">
          
          <div className="w-full space-y-3 md:space-y-4 mb-6 md:mb-8">
            {skillEntries.map(([skill, score]) => (
              <div key={skill} className="flex items-center justify-between gap-3 md:gap-4">
                <span className="w-24 md:w-32 text-left text-xs md:text-sm font-medium text-white tracking-wide">
                  {skill}:
                </span>
                <div className="flex-1 bg-white rounded-full h-3 md:h-3.5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${score >= 75 ? 'bg-[#fcd34d] shadow-[0_0_10px_rgba(252,211,77,0.8)]' : 'bg-red-400'}`} 
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className={`text-7xl md:text-[7rem] leading-none font-black mb-6 md:mb-8 ${passed ? 'text-[#fcd34d] drop-shadow-[0_0_30px_rgba(252,211,77,0.6)]' : 'text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.6)]'}`}>
            {average}%
          </div>

          <div className="w-full max-w-[240px]">
            {passed ? (
              <button 
                onClick={onProceed} 
                className="w-full py-3.5 md:py-4 bg-gradient-to-b from-[#e8e8e8] to-[#999999] border border-white/50 text-[#1a1a1a] hover:from-white hover:to-[#b3b3b3] font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.4)] whitespace-pre-line leading-tight"
              >
                {type === 'Lesson' ? 'PROCEED TO\nWORKBOOK' : 'RESERVAR\nCLASE EN VIVO'}
              </button>
            ) : fails === 0 ? (
              <button 
                onClick={onRetry} 
                className="w-full py-3.5 md:py-4 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-pre-line leading-tight"
              >
                INTENTAR\nDE NUEVO
              </button>
            ) : fails === 1 ? (
              <button 
                onClick={onScheduleComplementary} 
                className="w-full py-3.5 md:py-4 bg-orange-400 text-white font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(251,146,60,0.5)] whitespace-pre-line leading-tight"
              >
                RESERVAR CLASE\nCOMPLEMENTARIA
              </button>
            ) : (
              <button 
                onClick={onScheduleTutoring} 
                className="w-full py-3.5 md:py-4 bg-red-500 text-white font-black tracking-widest text-xs md:text-sm uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] whitespace-pre-line leading-tight"
              >
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
// 3. TEMPLATE 10: STUDENT SCHEDULING CALENDAR
// ==========================================
const StudentCalendar = ({ student, filterType, onConfirm, onCancel }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const isAvailable = (dayIndex, timeIndex) => {
    return (dayIndex + timeIndex + currentWeekOffset) % 5 === 0;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070b19]/90 backdrop-blur-md p-4 font-montserrat">
      
      {showConfirmation && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-[#070b19]/80 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-[30px] p-8 md:p-12 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8 drop-shadow-md leading-relaxed">
                YOUR {filterType} HAS BEEN SCHEDULED ALREADY
              </h2>
              <button onClick={() => { setShowConfirmation(false); onConfirm(); }} className="w-full py-4 bg-[#fcd34d] text-[#08203e] font-black tracking-widest text-xs uppercase rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(252,211,77,0.4)]">
                GO TO STUDENT HUB
              </button>
           </div>
        </div>
      )}

      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/20 rounded-[30px] shadow-2xl p-6 md:p-10 flex flex-col lg:flex-row gap-10 animate-fade-in relative">
        <button onClick={onCancel} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-colors">✕</button>

        <div className="flex-1 flex flex-col gap-6">
           <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">SCHEDULE A LESSON</h2>
           <p className="text-white/80 font-medium text-sm leading-relaxed mb-4">
             CHOOSE AN AVAILABLE DATE FOR YOUR NEXT {filterType}.<br/><br/>
             Only the <span className="font-black text-[#fcd34d]">YELLOW</span> blocks are currently available for your level.
           </p>
           
           <div className="flex flex-col gap-4">
              <select className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none appearance-none">
                 <option>{filterType}</option>
              </select>
              <select className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none appearance-none">
                 <option>DAY OF THE WEEK ▾</option>
              </select>
              <select className="w-full p-4 bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:outline-none appearance-none">
                 <option>HOUR ▾</option>
              </select>
              <button className="w-full py-4 mt-2 bg-transparent border-2 border-white/20 text-white font-black tracking-widest text-xs uppercase rounded-xl hover:bg-white/10 transition-colors">
                FILTER RESULTS
              </button>
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
                   const available = isAvailable(dIdx, tIdx);
                   return (
                     <div 
                       key={`${dIdx}-${tIdx}`} 
                       onClick={() => available && setShowConfirmation(true)}
                       className={`h-10 md:h-12 flex items-center justify-center text-[8px] md:text-[9px] font-bold tracking-widest border border-white/5 rounded-sm transition-all ${available ? 'bg-[#fcd34d] text-[#08203e] cursor-pointer hover:scale-105 shadow-[0_0_10px_rgba(252,211,77,0.3)] z-10 relative' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                     >
                       {time}
                     </div>
                   );
                 })}
               </React.Fragment>
             ))}
           </div>
           <button className="w-full mt-auto py-3 bg-white/10 border border-white/20 text-white/50 font-black tracking-widest text-xs uppercase rounded-full cursor-not-allowed">
             SAVE LAB SESSION
           </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN ROUTER COMPONENT (Traffic Cop)
// ==========================================
const StudentHub = ({ onReturnHome, preloadedStudent }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeActivity, setActiveActivity] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // Gatekeeper States
  const [showGatekeeper, setShowGatekeeper] = useState(false);
  const [gatekeeperData, setGatekeeperData] = useState(null);
  
  // Calendar States
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState('LAB SESSION');

  useEffect(() => {
    if (preloadedStudent) {
      setStudentData(preloadedStudent);
      setLoading(false);
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
    } catch (err) {
      console.error("Error loading student profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartActivity = async (type) => {
    if (!studentData) return;
    if (type === 'Calendar') {
      setCalendarFilter('LAB SESSION');
      setShowCalendar(true);
      return;
    }

    setIsFetching(true);
    try {
      setTimeout(() => {
         setActiveActivity(type);
         setIsFetching(false);
      }, 1000);
    } catch (err) {
      setIsFetching(false);
    }
  };

  // --- TRIGGERED WHEN LESSON OR WORKBOOK ENDS ---
  const handleActivityComplete = (type, mockScores) => {
    setActiveActivity(null);
    
    const finalScores = type === 'Workbook' 
      ? { Reading: mockScores.Reading, Grammar: mockScores.Grammar, Comprehension: mockScores.Comprehension, Writing: mockScores.Writing || 80 } 
      : { Listening: mockScores.Listening, Reading: mockScores.Reading, Grammar: mockScores.Grammar, Comprehension: mockScores.Comprehension, Speaking: mockScores.Speaking || 75 };

    const scoreValues = Object.values(finalScores);
    const average = scoreValues.length > 0 ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 0;
    const passed = average >= 75;

    setGatekeeperData({
      type,
      level: studentData?.level || 'A1',
      unit: studentData?.unit || 1,
      scores: finalScores,
      average,
      passed,
      fails: studentData?.unit_fail_count || 0
    });
    
    setShowGatekeeper(true);
  };

  // --- TRIGGERED WHEN STUDENT CLICKS "PROCEED" IN GATEKEEPER ---
  const handleGatekeeperProceed = async () => {
    try {
      // 1. Identify which activity they passed
      const isLesson = gatekeeperData.type === 'Lesson';
      const updatePayload = isLesson 
        ? { lesson_score: gatekeeperData.average } 
        : { workbook_score: gatekeeperData.average };

      // 2. Save the score to Supabase so the UI unlocks the next step
      await supabase.from('profiles').update(updatePayload).eq('id', studentData.id);
      
      // 3. Update local state to instantly unlock the next button
      setStudentData(prev => ({ ...prev, ...updatePayload }));
      setShowGatekeeper(false);

      // 4. Optional: If they just passed the Workbook, instantly prompt the Calendar
      if (!isLesson) {
        setCalendarFilter('LIVE LAB SESSION');
        setShowCalendar(true);
      }
    } catch (err) {
      console.error("Error saving progress:", err);
      alert("Hubo un error guardando tu progreso.");
    }
  };

  // --- TRIGGERED WHEN STUDENT FAILS AND CLICKS "RETRY" ---
  const handleRetry = async () => {
    try {
      const newFails = (studentData.unit_fail_count || 0) + 1;
      await supabase.from('profiles').update({ unit_fail_count: newFails }).eq('id', studentData.id);
      setStudentData({ ...studentData, unit_fail_count: newFails });
      setShowGatekeeper(false);
    } catch (err) {
      console.error("Error saving failure:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b19]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fcd34d]"></div>
      </div>
    );
  }

  if (activeActivity) {
    return (
      <StudentPlayer 
        activityType={activeActivity}
        student={studentData} 
        onExit={() => setActiveActivity(null)}
        onComplete={(scores) => handleActivityComplete(activeActivity, scores)}
      />
    );
  }

  return (
    <>
      {showGatekeeper && (
        <EvaluationCrossroad 
          data={gatekeeperData}
          onProceed={handleGatekeeperProceed}
          onRetry={handleRetry}
          onScheduleLive={() => { setShowGatekeeper(false); setCalendarFilter('LIVE LAB SESSION'); setShowCalendar(true); }}
          onScheduleComplementary={() => { setShowGatekeeper(false); setCalendarFilter('COMPLEMENTARY CLASS'); setShowCalendar(true); }}
          onScheduleTutoring={() => { setShowGatekeeper(false); setCalendarFilter('1-ON-1 TUTORING'); setShowCalendar(true); }}
        />
      )}

      {showCalendar && (
        <StudentCalendar 
          student={studentData} 
          filterType={calendarFilter} 
          onCancel={() => setShowCalendar(false)} 
          onConfirm={() => { setShowCalendar(false); /* Await Teacher Grade to unlock next unit */ }} 
        />
      )}
      
      <div className="hidden md:block">
        <DesktopView student={studentData} onReturnHome={onReturnHome} onStartActivity={handleStartActivity} isFetching={isFetching} />
      </div>
      <div className="block md:hidden">
        <MobileView student={studentData} onReturnHome={onReturnHome} onStartActivity={handleStartActivity} isFetching={isFetching} />
      </div>
    </>
  );
};

export default StudentHub;