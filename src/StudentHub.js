import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// ==========================================
// 1. DESKTOP UI COMPONENT (Isolated)
// ==========================================
const DesktopView = ({ student, onReturnHome }) => {
  const isClassTime = false; 

  return (
    <div className="min-h-screen w-full bg-[#eef5fc] font-montserrat flex justify-center p-8">
      <div className="max-w-[1200px] w-full flex gap-8">
        
        {/* LEFT SIDEBAR */}
        <div className="w-[320px] bg-[#fcd34d] rounded-[30px] p-8 shadow-xl flex flex-col shrink-0">
          <h2 className="text-outloud-blue font-black text-lg text-center mb-6 tracking-wide">STUDENT PROGRESS</h2>
          
          <div className="relative w-40 h-40 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-inner border-[12px] border-[#08203e]/10">
            <div className="absolute inset-0 rounded-full border-[12px] border-outloud-blue" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%)' }}></div>
            <div className="text-center z-10">
              <span className="text-3xl font-black text-outloud-blue block leading-none">45%</span>
              <span className="text-[10px] font-bold text-outloud-blue tracking-widest">ACQUIRED</span>
            </div>
          </div>
          <p className="text-center text-outloud-blue font-bold text-sm mb-8">LESSONS 36/80</p>

          <h3 className="text-outloud-blue font-black text-sm mb-4">UPCOMING ACTIVITIES</h3>
          <ul className="space-y-3 mb-auto text-xs font-bold text-outloud-blue/80">
            <li className="flex items-center gap-2"><span>📅</span> Aug 15: Live Lab Session</li>
            <li className="flex items-center gap-2"><span>💬</span> Aug 18: Chat room meeting</li>
            <li className="flex items-center gap-2"><span>👥</span> Aug 25: Conversation Club</li>
          </ul>

          <button className="w-full bg-[#08203e] text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors shadow-lg mt-8 mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            REQUEST HUMAN ASSISTANCE
          </button>

          <div className="text-center">
            <p className="text-outloud-blue font-black text-xs mb-2">CONNECT WITH US</p>
            <div className="flex justify-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer">f</div>
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center cursor-pointer">ig</div>
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer">tk</div>
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center cursor-pointer">dc</div>
              <button className="bg-white/50 text-outloud-blue font-bold text-xs px-3 rounded-full hover:bg-white transition-colors">FAQs</button>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: Interactive Dashboard */}
        <div className="flex-1 flex flex-col pt-4">
          
          <div className="flex justify-end items-center gap-3 mb-10">
            <span className="font-bold text-outloud-blue text-sm">{student?.first_name || 'Student'} {student?.last_name || 'Name'}</span>
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src="https://i.postimg.cc/P5V486CM/Sin-titulo-(Post-para-Instagram-(45))-(2).png" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button onClick={onReturnHome} className="text-xs text-gray-500 font-bold hover:text-outloud-blue ml-2">Logout</button>
          </div>

          <div className="flex flex-col gap-6">
            {/* TOP ROW */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-between border-b-4 border-transparent hover:border-[#fcd34d] transition-all cursor-pointer">
                <img src="https://i.postimg.cc/Z51cRLBR/1(6).png" alt="Lesson" className="h-32 object-contain mb-4" />
                <h3 className="font-black text-outloud-blue text-lg mb-3 uppercase">Lesson 25</h3>
                <button className="w-full bg-[#fcd34d] text-outloud-blue font-black text-xs py-2 rounded-full shadow-md">CONTINUE</button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-between border-b-4 border-transparent hover:border-[#fcd34d] transition-all cursor-pointer">
                <img src="https://i.postimg.cc/sXJ9Tdnz/2(8).png" alt="Workbook" className="h-32 object-contain mb-4" />
                <h3 className="font-black text-gray-400 text-lg mb-3 uppercase">Workbook</h3>
                <button className="w-full bg-[#94a3b8] text-white font-black text-xs py-2 rounded-full shadow-md">START</button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-between border-b-4 border-transparent hover:border-[#fcd34d] transition-all cursor-pointer">
                <img src="https://i.postimg.cc/1RJr6SnM/3(5).png" alt="Calendar" className="h-32 object-contain mb-4" />
                <h3 className="font-black text-gray-400 text-lg mb-3 uppercase">Calendar</h3>
                <button className="w-full bg-[#94a3b8] text-white font-black text-xs py-2 rounded-full shadow-md">VIEW SCHEDULE</button>
              </div>
            </div>

            {/* BOTTOM ROW (Reduced Distraction) */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-pointer">
                <img src="https://i.postimg.cc/tgQ3yCwT/4(4).png" alt="Forum" className="h-24 object-contain mb-2" />
                <h3 className="font-bold text-gray-400 text-sm mb-2 uppercase">Open Forum</h3>
                <button className="w-full bg-[#cbd5e1] text-white font-bold text-[10px] py-1.5 rounded-full">COMMENT</button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-pointer">
                <img src="https://i.postimg.cc/vBG5g2GX/5(3).png" alt="Chat" className="h-24 object-contain mb-2" />
                <h3 className="font-bold text-gray-400 text-sm mb-2 uppercase">Chat Room</h3>
                <button className="w-full bg-[#cbd5e1] text-white font-bold text-[10px] py-1.5 rounded-full">JOIN</button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-pointer">
                <img src="https://i.postimg.cc/qq5KFk2R/6(3).png" alt="Info" className="h-24 object-contain mb-2" />
                <h3 className="font-bold text-gray-400 text-sm mb-2 uppercase whitespace-nowrap">Info Board</h3>
                <button className="w-full bg-[#cbd5e1] text-white font-bold text-[10px] py-1.5 rounded-full">CHECK NEWS</button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-pointer">
                <img src="https://i.postimg.cc/9QT9xHMn/7(5).png" alt="Live Class" className="h-24 object-contain mb-2" />
                <h3 className="font-bold text-gray-400 text-sm mb-2 uppercase">Live Class</h3>
                <button className={`w-full font-bold text-[10px] py-1.5 rounded-full ${isClassTime ? 'bg-red-500 text-white animate-pulse' : 'bg-[#cbd5e1] text-white'}`}>
                  {isClassTime ? 'ENTER ROOM' : 'SCHEDULED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MOBILE UI COMPONENT (Isolated)
// ==========================================
const MobileView = ({ student, onReturnHome }) => {
  const cards = [
    { title: "Lesson 25", action: "CONTINUE", img: "https://i.postimg.cc/Z51cRLBR/1(6).png", active: true },
    { title: "Workbook", action: "START", img: "https://i.postimg.cc/sXJ9Tdnz/2(8).png", active: false },
    { title: "Calendar", action: "SCHEDULE", img: "https://i.postimg.cc/1RJr6SnM/3(5).png", active: false },
    { title: "Open Forum", action: "COMMENT", img: "https://i.postimg.cc/tgQ3yCwT/4(4).png", active: false },
    { title: "Chat Room", action: "JOIN", img: "https://i.postimg.cc/vBG5g2GX/5(3).png", active: false },
    { title: "Info Board", action: "CHECK NEWS", img: "https://i.postimg.cc/qq5KFk2R/6(3).png", active: false },
    { title: "Live Class", action: "ENTER ROOM", img: "https://i.postimg.cc/9QT9xHMn/7(5).png", active: false },
  ];

  return (
    <div className="min-h-screen w-full bg-[#eef5fc] font-montserrat flex flex-col overflow-x-hidden pb-10">
      
      {/* Top Header */}
      <div className="flex justify-between items-center p-4">
        <img src="https://i.postimg.cc/fyvnv4XT/Diseno-sin-titulo-(14).png" alt="Outloud Logo" className="h-6 object-contain" />
        <div className="flex items-center gap-2">
          <span className="font-bold text-outloud-blue text-[10px]">{student?.first_name || 'Student'}</span>
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden border border-white" onClick={onReturnHome}>
             <img src="https://i.postimg.cc/P5V486CM/Sin-titulo-(Post-para-Instagram-(45))-(2).png" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Yellow Metrics Banner */}
      <div className="mx-4 bg-[#fcd34d] rounded-2xl p-4 shadow-lg flex gap-4">
        <div className="flex flex-col items-center justify-center border-r border-[#08203e]/20 pr-4">
          <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center border-[6px] border-[#08203e]/10">
             <div className="absolute inset-0 rounded-full border-[6px] border-outloud-blue" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%)' }}></div>
             <div className="text-center z-10">
              <span className="text-sm font-black text-outloud-blue block leading-none">45%</span>
            </div>
          </div>
          <p className="text-[8px] font-bold text-outloud-blue mt-1">LESSONS 36/80</p>
        </div>
        
        <div className="flex-1">
          <h3 className="text-outloud-blue font-black text-[10px] mb-2 uppercase">Upcoming Activities</h3>
          <ul className="space-y-1.5 text-[9px] font-bold text-outloud-blue/80">
            <li className="flex items-center gap-1"><span>📅</span> Aug 15: Live Lab Session</li>
            <li className="flex items-center gap-1"><span>💬</span> Aug 18: Chat room meeting</li>
            <li className="flex items-center gap-1"><span>👥</span> Aug 25: Conversation Club</li>
          </ul>
        </div>
      </div>

      <h2 className="text-center font-black text-outloud-blue text-lg mt-8 mb-4 tracking-wide">INTERACTIVE DASHBOARD</h2>

      {/* SWIPER 3D CAROUSEL */}
      <div className="w-full h-64 relative">
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
            <SwiperSlide key={idx} className="w-48 h-56 bg-white rounded-2xl p-4 shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-between border-b-4 border-transparent">
              <img src={card.img} alt={card.title} className="h-24 object-contain mt-2 drop-shadow-sm" />
              <div className="w-full text-center">
                <h3 className={`font-black text-sm mb-2 uppercase ${card.active ? 'text-outloud-blue' : 'text-gray-400'}`}>{card.title}</h3>
                <button className={`w-full font-black text-[10px] py-2 rounded-full shadow-sm ${card.active ? 'bg-[#fcd34d] text-outloud-blue' : 'bg-[#94a3b8] text-white'}`}>
                  {card.action}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Footer Anchors */}
      <div className="px-6 mt-8 flex flex-col items-center gap-4">
        <button className="w-full max-w-sm bg-[#08203e] text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          REQUEST HUMAN ASSISTANCE
        </button>
        <p className="font-black text-outloud-blue text-sm">CONNECT WITH US</p>
        <div className="flex gap-3">
           <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">f</div>
           <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center shadow-md">ig</div>
           <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-md">tk</div>
           <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-md">dc</div>
        </div>
        <button className="bg-[#475569] text-white font-bold text-sm px-6 py-2 rounded-full mt-2 shadow-md">FAQs</button>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fc]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08203e]"></div>
      </div>
    );
  }

  // The switch that decides which isolated component to render
  return isMobile ? (
    <MobileView student={studentData} onReturnHome={onReturnHome} />
  ) : (
    <DesktopView student={studentData} onReturnHome={onReturnHome} />
  );
};

export default StudentHub;