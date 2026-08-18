import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import StudentPlayer from './StudentPlayer';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// ==========================================
// 1. DESKTOP UI COMPONENT (Isolated)
// ==========================================
const DesktopView = ({ student, onReturnHome, onStartLesson, isFetchingLesson }) => {
  const isClassTime = false;
  
  // Progress Ring Math (Dynamic based on Level)
  const currentUnit = student?.unit || 1;
  const totalUnits = 12; // Assuming 12 units per level (e.g., Level A1)
  const completedUnits = Math.max(0, currentUnit - 1); // If on Unit 1, 0 are completed.
  const progressPercentage = Math.round((completedUnits / totalUnits) * 100);
  
  const circleCircumference = 2 * Math.PI * 40; 
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <div className="min-h-screen w-full font-montserrat flex justify-center p-8 relative overflow-hidden bg-[#070b19] text-white">
      
      {/* Neon Wavy Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      <div className="max-w-[1200px] w-full flex gap-8 relative z-10">
        
        {/* LEFT SIDEBAR: GLASSMORPHISM */}
        <div className="w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 shadow-2xl flex flex-col shrink-0 relative overflow-hidden">
          <h2 className="text-white font-black text-lg text-center mb-6 tracking-wide drop-shadow-md">STUDENT PROGRESS</h2>
          
          {/* Glowing SVG Ring */}
          <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
               <circle 
                 cx="50" cy="50" r="40" 
                 stroke="#fcd34d" 
                 strokeWidth="8" 
                 fill="transparent" 
                 strokeDasharray={circleCircumference}
                 strokeDashoffset={strokeDashoffset}
                 strokeLinecap="round"
                 className="transition-all duration-1000 ease-out"
               />
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
            <li className="flex items-center gap-3"><span className="opacity-70">👥</span> Aug 25: Conversation Club</li>
          </ul>

          <button className="w-full bg-white/90 text-[#08203e] font-black text-xs py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-white hover:scale-105 transition-transform shadow-lg mt-8 mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            REQUEST HUMAN ASSISTANCE
          </button>

          <div className="text-center">
            <p className="text-white/80 font-black text-xs md:text-sm mb-4 tracking-widest uppercase">CONNECT WITH US</p>
            <div className="flex justify-center items-center gap-3">
              {/* Custom Facebook */}
              <a href="https://www.facebook.com/share/1KxawRX9vA/" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
                <img src="https://i.postimg.cc/G2gBJR3M/11(4).png" alt="Facebook" className="w-10 h-10 object-contain shadow-md rounded-full" />
              </a>
              {/* Custom Instagram */}
              <a href="https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
                <img src="https://i.postimg.cc/hGShkvfs/10(3).png" alt="Instagram" className="w-10 h-10 object-contain shadow-md rounded-full" />
              </a>
              {/* Custom TikTok */}
              <a href="https://tiktok.com/@outloudlanguage" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
                <img src="https://i.postimg.cc/FFfbWCtD/9(1).png" alt="TikTok" className="w-10 h-10 object-contain shadow-md rounded-full" />
              </a>
              {/* Custom WhatsApp */}
              <a href="https://wa.me/584226885683" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
                <img src="https://i.postimg.cc/h4b4BcRY/Copia-de-Diseno-sin-titulo.png" alt="WhatsApp" className="w-10 h-10 object-contain shadow-md rounded-full" />
              </a>
              <button className="bg-white/20 text-white font-bold text-xs h-10 px-4 rounded-full hover:bg-white/30 transition border border-white/20 shadow-md">FAQs</button>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: Glassmorphism Main Dashboard */}
        <div className="flex-1 flex flex-col pt-2">
          
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-4">
                <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 object-contain opacity-90" />
                <div className="h-6 w-[1px] bg-white/30"></div>
                <span className="text-sm font-light text-white/80 tracking-wide">Online Platform</span>
             </div>

             <div className="flex items-center gap-4">
               <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 pr-6 pl-2 flex items-center gap-3 shadow-lg">
                 <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden border border-white/50 shrink-0">
                   <img src="https://i.postimg.cc/P5V486CM/Sin-titulo-(Post-para-Instagram-(45))-(2).png" alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight text-white">{student?.first_name || 'Student'} {student?.last_name || ''}</span>
                    <span className="text-[9px] text-white/70 tracking-widest uppercase">Level {student?.level || 'A1'}</span>
                 </div>
               </div>
               <button onClick={onReturnHome} className="text-white hover:text-red-400 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            {/* TOP ROW */}
            <div className="grid grid-cols-3 gap-6 h-[45%]">
              <button onClick={onStartLesson} disabled={isFetchingLesson} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/wxw0tRXY/1(7).png" alt="Lesson" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-2xl uppercase">{isFetchingLesson ? 'Loading...' : `Lesson ${student?.unit || 1}`}</h3>
              </button>

              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/s2J5tbKz/2(9).png" alt="Workbook" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-2xl uppercase">Workbook</h3>
              </button>

              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/vT49xTyn/3(6).png" alt="Calendar" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-2xl uppercase">Calendar</h3>
              </button>
            </div>

            {/* BOTTOM ROW (RESIZED & ENLARGED) */}
            <div className="grid grid-cols-4 gap-6 flex-1">
              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/rpgthxF0/4(5).png" alt="Forum" className="h-20 md:h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-lg md:text-2xl text-center leading-tight">Open<br/>forum</h3>
              </button>

              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/XNrQC7QY/5(4).png" alt="Chat" className="h-20 md:h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-lg md:text-2xl text-center leading-tight">Chat<br/>room</h3>
              </button>

              <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/PqfMrtCH/6(4).png" alt="Info" className="h-20 md:h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-lg md:text-2xl text-center leading-tight">Info<br/>board</h3>
              </button>

              <button className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group ${isClassTime ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
                <img src="https://i.postimg.cc/Wpqw4Y1x/7(6).png" alt="Live Class" className="h-20 md:h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-lg md:text-2xl text-center leading-tight">Live<br/>class</h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MOBILE UI COMPONENT (Isolated + Swiper)
// ==========================================
const MobileView = ({ student, onReturnHome, onStartLesson, isFetchingLesson }) => {
  const cards = [
    { title: `Lesson ${student?.unit || 1}`, action: isFetchingLesson ? "LOADING..." : "START", img: "https://i.postimg.cc/wxw0tRXY/1(7).png", active: true, onClick: onStartLesson },
    { title: "Workbook", action: "START", img: "https://i.postimg.cc/s2J5tbKz/2(9).png", active: false },
    { title: "Calendar", action: "SCHEDULE", img: "https://i.postimg.cc/vT49xTyn/3(6).png", active: false },
    { title: "Open Forum", action: "COMMENT", img: "https://i.postimg.cc/rpgthxF0/4(5).png", active: false },
    { title: "Chat Room", action: "JOIN", img: "https://i.postimg.cc/XNrQC7QY/5(4).png", active: false },
    { title: "Info Board", action: "CHECK NEWS", img: "https://i.postimg.cc/PqfMrtCH/6(4).png", active: false },
    { title: "Live Class", action: "ENTER ROOM", img: "https://i.postimg.cc/Wpqw4Y1x/7(6).png", active: false },
  ];

  const currentUnit = student?.unit || 1;
  const totalUnits = 12; 
  const completedUnits = Math.max(0, currentUnit - 1);
  const progressPercentage = Math.round((completedUnits / totalUnits) * 100);
  
  const circleCircumference = 2 * Math.PI * 30; 
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <div className="min-h-screen w-full font-montserrat flex flex-col overflow-x-hidden pb-10 bg-[#070b19] text-white relative z-0">
      
      {/* Background Waves */}
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/30 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[90px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '100px 20px' }}></div>
      </div>

      {/* Top Header */}
      <div className="flex justify-between items-center p-5 z-10">
        <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-6 object-contain opacity-90" />
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-[10px]">{student?.first_name || 'Student'}</span>
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden border border-white/30" onClick={onReturnHome}>
             <img src="https://i.postimg.cc/P5V486CM/Sin-titulo-(Post-para-Instagram-(45))-(2).png" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Glassmorphism Metrics Banner */}
      <div className="mx-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl flex gap-4 z-10">
        <div className="flex flex-col items-center justify-center border-r border-white/10 pr-5">
          {/* Mobile Glowing SVG Ring */}
          <div className="relative w-[70px] h-[70px] flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
               <circle 
                 cx="50" cy="50" r="30" 
                 stroke="#fcd34d" 
                 strokeWidth="6" 
                 fill="transparent" 
                 strokeDasharray={circleCircumference}
                 strokeDashoffset={strokeDashoffset}
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-center">
              <span className="text-sm font-black text-white leading-none">{progressPercentage}%</span>
            </div>
          </div>
          <p className="text-[8px] font-bold tracking-widest text-white/70 mt-2 uppercase">Unit {currentUnit}/{totalUnits}</p>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-white font-black text-[10px] mb-2 uppercase tracking-widest drop-shadow-md">Upcoming Activities</h3>
          <ul className="space-y-2 text-[9px] font-medium text-white/80">
            <li className="flex items-center gap-2"><span className="opacity-70">📅</span> Aug 15: Live Lab Session</li>
            <li className="flex items-center gap-2"><span className="opacity-70">💬</span> Aug 18: Chat room meeting</li>
            <li className="flex items-center gap-2"><span className="opacity-70">👥</span> Aug 25: Conversation Club</li>
          </ul>
        </div>
      </div>

      <h2 className="text-center font-black text-white text-base mt-10 mb-6 tracking-[0.2em] drop-shadow-md z-10">INTERACTIVE DASHBOARD</h2>

      {/* SWIPER 3D CAROUSEL */}
      <div className="w-full h-64 relative z-10">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          initialSlide={0}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 150,
            modifier: 2.5,
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Pagination]}
          className="w-full h-full"
        >
          {cards.map((card, idx) => (
            <SwiperSlide key={idx} className="w-48 h-60 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 shadow-2xl flex flex-col items-center justify-between">
              <img src={card.img} alt={card.title} className="h-24 object-contain mt-4 drop-shadow-md opacity-90" />
              <div className="w-full text-center">
                <h3 className={`font-light text-xl mb-4 tracking-wide ${card.active ? 'text-white' : 'text-white/70'}`}>{card.title}</h3>
                <button 
                  onClick={() => card.onClick && card.onClick()}
                  className={`w-full font-black text-[10px] py-3 rounded-full shadow-lg tracking-widest uppercase transition-transform active:scale-95 ${card.active ? 'bg-[#fcd34d] text-outloud-blue' : 'bg-white/20 text-white'}`}
                >
                  {card.action}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Footer Anchors */}
      <div className="px-6 mt-12 flex flex-col items-center gap-4 z-10">
        <button className="w-full max-w-sm bg-white/90 text-[#08203e] font-black tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          REQUEST HUMAN ASSISTANCE
        </button>
        <p className="font-black tracking-widest text-white/80 text-xs uppercase mt-4">CONNECT WITH US</p>
        <div className="flex justify-center items-center gap-3">
          {/* Custom Facebook */}
          <a href="https://www.facebook.com/share/1KxawRX9vA/" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
            <img src="https://i.postimg.cc/G2gBJR3M/11(4).png" alt="Facebook" className="w-10 h-10 object-contain shadow-md rounded-full" />
          </a>
          {/* Custom Instagram */}
          <a href="https://www.instagram.com/outloudlanguage?igsh=MXU5dmRzeTZ3YTk1cg==" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
            <img src="https://i.postimg.cc/hGShkvfs/10(3).png" alt="Instagram" className="w-10 h-10 object-contain shadow-md rounded-full" />
          </a>
          {/* Custom TikTok */}
          <a href="https://tiktok.com/@outloudlanguage" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
            <img src="https://i.postimg.cc/FFfbWCtD/9(1).png" alt="TikTok" className="w-10 h-10 object-contain shadow-md rounded-full" />
          </a>
          {/* Custom WhatsApp */}
          <a href="https://wa.me/584226885683" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
            <img src="https://i.postimg.cc/h4b4BcRY/Copia-de-Diseno-sin-titulo.png" alt="WhatsApp" className="w-10 h-10 object-contain shadow-md rounded-full" />
          </a>
        </div>
        <button className="bg-white/10 border border-white/20 text-white font-bold text-xs px-6 py-2 rounded-full mt-2 shadow-md hover:bg-white/20 transition">FAQs</button>
      </div>

    </div>
  );
};

// ==========================================
// GATEKEEPER UI: THE EVALUATION CROSSROAD
// ==========================================
const EvaluationCrossroad = ({ data, onRetry, onBookClass, onBookTutoring }) => {
  const { lessonScore, workbookScore, fails } = data;
  const passed = lessonScore >= 75 && workbookScore >= 75;
  const isStrikeTwo = fails >= 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070b19]/90 backdrop-blur-md px-4 font-montserrat">
      <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-[30px] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-black text-white mb-6 tracking-wide drop-shadow-md">
          {passed ? "¡Felicidades!" : "Resultados de la Unidad"}
        </h2>

        <div className="w-full space-y-5 mb-8">
          <div>
            <div className="flex justify-between text-xs font-bold text-white/70 tracking-widest uppercase mb-2">
              <span>Lección</span>
              <span>{lessonScore}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-1000 ${lessonScore >= 75 ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'}`} style={{ width: `${lessonScore}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs font-bold text-white/70 tracking-widest uppercase mb-2">
              <span>Workbook</span>
              <span>{workbookScore}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-1000 ${workbookScore >= 75 ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'}`} style={{ width: `${workbookScore}%` }}></div>
            </div>
          </div>
        </div>

        {passed ? (
          <>
            <p className="text-white/90 mb-8 text-sm leading-relaxed">¡Has superado el 75% en ambas actividades! Ya puedes agendar tu clase en vivo.</p>
            <button onClick={onBookClass} className="w-full py-4 bg-[#fcd34d] text-outloud-blue font-black tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(252,211,77,0.5)]">
              OPEN CALENDAR
            </button>
          </>
        ) : !isStrikeTwo ? (
          <>
            <p className="text-sm text-red-300 font-bold mb-8 leading-relaxed">
              Necesitas al menos 75% para avanzar al siguiente nivel. Inténtalo de nuevo, un tutor se pondrá en contacto contigo para definir cómo ayudarte.
            </p>
            <button onClick={onRetry} className="w-full py-4 bg-white/20 border border-white/30 text-white font-black tracking-widest rounded-full hover:bg-white/30 hover:scale-105 transition-all shadow-lg">
              TRY AGAIN
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-red-300 font-bold mb-8 leading-relaxed">
              Has completado tu segundo intento. Por favor agenda una clase complementaria personalizada.
            </p>
            <button onClick={onBookTutoring} className="w-full py-4 bg-red-500 text-white font-black tracking-widest rounded-full hover:bg-red-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              COMPLEMENTARY CLASS
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN ROUTER COMPONENT (Traffic Cop)
// ==========================================
const StudentHub = ({ onReturnHome, preloadedStudent }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isFetchingLesson, setIsFetchingLesson] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationData, setEvaluationData] = useState({ lessonScore: 0, workbookScore: 0, fails: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    if (preloadedStudent) {
      setStudentData(preloadedStudent);
      setLoading(false);
    } else {
      fetchStudentProfile();
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [preloadedStudent]);

  const fetchStudentProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setStudentData(profile);
    } catch (err) {
      console.error("Error loading student profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LESSON RETRIEVAL LOGIC ---
  const handleStartLesson = async () => {
    if (!studentData) return;
    setIsFetchingLesson(true);

    try {
      const { data: masterData, error: masterError } = await supabase
        .from('content_blueprints')
        .select('*')
        .eq('level', studentData.level)
        .eq('unit', studentData.unit || 1)
        .eq('content_type', 'Lesson')
        .maybeSingle();

      if (masterError) throw masterError;
      if (!masterData) {
        alert(`Lesson ${studentData.unit || 1} for ${studentData.level} has not been published yet!`);
        setIsFetchingLesson(false);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from('student_sessions')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('blueprint_id', masterData.id)
        .maybeSingle();

      if (sessionError) throw sessionError;

      if (sessionData) {
        setActiveLesson(sessionData.session_data);
        console.log("SUCCESS! Loaded existing student session.");
      } else {
        const newSession = {
          student_id: studentData.id,
          blueprint_id: masterData.id,
          session_data: masterData,
          status: 'in_progress'
        };
        const { data: insertedSession, error: insertError } = await supabase
          .from('student_sessions')
          .insert(newSession)
          .select()
          .single();
          
        if (insertError) throw insertError;
        setActiveLesson(insertedSession.session_data);
        console.log("SUCCESS! Cloned master lesson for student.");
      }
    } catch (err) {
      console.error("Error loading lesson:", err);
      alert("Failed to connect to the lesson server.");
    } finally {
      setIsFetchingLesson(false);
    }
  };

  // --- 75% GATEKEEPER LOGIC ---
  const handleWorkbookComplete = async (calculatedLessonScore, calculatedWorkbookScore) => {
    if (!studentData) return;
    
    const currentFails = studentData.unit_fail_count || 0;
    
    setEvaluationData({
      lessonScore: calculatedLessonScore,
      workbookScore: calculatedWorkbookScore,
      fails: currentFails
    });

    setShowEvaluation(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        lesson_score: calculatedLessonScore, 
        workbook_score: calculatedWorkbookScore 
      })
      .eq('id', studentData.id);

    if (error) console.error("Error saving scores:", error);
  };

  // --- EVALUATION HANDLERS ---
  const handleRetry = async () => {
    if (!studentData) return;
    const newFails = (studentData.unit_fail_count || 0) + 1;
    
    await supabase
      .from('profiles')
      .update({ 
        unit_fail_count: newFails,
        lesson_score: null,
        workbook_score: null
      })
      .eq('id', studentData.id);

    setStudentData({ ...studentData, unit_fail_count: newFails, lesson_score: null, workbook_score: null });
    setShowEvaluation(false);
  };

  const handleBookClass = () => {
    console.log("Opening standard calendar...");
    setShowEvaluation(false);
  };

  const handleBookTutoring = () => {
    console.log("Opening tutoring calendar...");
    setShowEvaluation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b19]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fcd34d]"></div>
      </div>
    );
  }

  // --- LESSON INTERCEPTOR SWITCH ---
  if (activeLesson) {
    return (
      <StudentPlayer 
        lessonData={activeLesson} 
        student={studentData} 
        onExit={() => setActiveLesson(null)} 
      />
    );
  }

  return (
    <>
      {showEvaluation && (
        <EvaluationCrossroad 
          data={evaluationData}
          onRetry={handleRetry}
          onBookClass={handleBookClass}
          onBookTutoring={handleBookTutoring}
        />
      )}
      
      {isMobile ? (
        <MobileView student={studentData} onReturnHome={onReturnHome} onStartLesson={handleStartLesson} isFetchingLesson={isFetchingLesson} />
      ) : (
        <DesktopView student={studentData} onReturnHome={onReturnHome} onStartLesson={handleStartLesson} isFetchingLesson={isFetchingLesson} />
      )}
    </>
  );
};

export default StudentHub;