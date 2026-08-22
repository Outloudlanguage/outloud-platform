import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import CommunityPanel from './components/CommunityPanel'; 

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// ==========================================
// 1. REUSABLE PROFILE DROPDOWN
// ==========================================
const ProfileDropdown = ({ teacher, pendingCount, onOpenEvaluations, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-1.5 pr-6 pl-2 flex items-center gap-3 shadow-lg cursor-pointer hover:bg-white/20 transition-all">
        <div className="relative w-10 h-10 bg-gray-300 rounded-full overflow-hidden border border-white/50 shrink-0">
          <img src={teacher?.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile" className="w-full h-full object-cover" />
          {pendingCount > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-[#070b19] animate-pulse"></div>}
        </div>
        <div className="flex flex-col hidden sm:flex">
          <span className="text-xs font-bold leading-tight text-white">{teacher?.first_name || 'Teacher'} {teacher?.last_name || ''}</span>
          <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase">INSTRUCTOR</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-[#070b19]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-white/10">
             <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Admin Controls</p>
          </div>
          <div className="flex flex-col">
            <button className="flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors text-left font-semibold">My Profile</button>
            <button onClick={() => { setIsOpen(false); onOpenEvaluations(); }} className="flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors text-left font-semibold group">
              <span>Pending Gradings</span>
              {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform">{pendingCount}</span>}
            </button>
            <button onClick={onLogout} className="flex items-center justify-between px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors text-left font-semibold border-t border-white/10">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. THE ULTIMATE GATEKEEPER (DB CONNECTED)
// ==========================================
const EvaluationModal = ({ isOpen, onClose, pendingClasses, onGradeSubmitted, teacherId }) => {
  const [activeClassIndex, setActiveClassIndex] = useState(0);
  const [scores, setScores] = useState({ q1: 0, q2: 0, q3: 0, q4: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || pendingClasses.length === 0) return null;

  const currentEvaluation = pendingClasses[activeClassIndex];
  const totalScore = scores.q1 + scores.q2 + scores.q3 + scores.q4;
  const isPassed = totalScore >= 13;
  const isComplete = scores.q1 > 0 && scores.q2 > 0 && scores.q3 > 0 && scores.q4 > 0;

  const criteria = [
    { id: 'q1', title: 'Core Comprehension', desc: 'Demonstrates clear understanding of the lesson’s target structures and vocabulary.' },
    { id: 'q2', title: 'Contextual Application', desc: 'Accurately adapts and applies the target language to new, unscripted scenarios.' },
    { id: 'q3', title: 'Independent Production', desc: 'Generates the target language autonomously with minimal teacher elicitation.' },
    { id: 'q4', title: 'Verbal Proficiency', desc: 'Exhibits appropriate pronunciation, cadence, and overall verbal fluidity.' }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await supabase.from('academic_records').insert({
        student_id: currentEvaluation.student_id,
        teacher_id: teacherId,
        unit: currentEvaluation.unit,
        activity_type: 'Live Class',
        score_percentage: (totalScore / 20) * 100,
        teacher_notes: `Q1:${scores.q1} Q2:${scores.q2} Q3:${scores.q3} Q4:${scores.q4}`
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

      setScores({ q1: 0, q2: 0, q3: 0, q4: 0 });
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
      <div className="relative w-full max-w-2xl bg-[#070b19]/95 border border-white/20 rounded-[2rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden my-8">
        <div className="p-6 border-b border-white/10 bg-white/5 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-[#fcd34d] uppercase tracking-widest drop-shadow-md">Live Class Evaluation</h2>
            {pendingClasses.length > 1 && <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-widest animate-pulse">{pendingClasses.length} Pending</span>}
          </div>
          <p className="text-sm text-white/70">Student: <strong className="text-white text-lg">{currentEvaluation.student_name}</strong> • Unit {currentEvaluation.unit}</p>
        </div>

        <div className="p-6 space-y-6 relative z-10">
          {criteria.map((crit) => (
            <div key={crit.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{crit.title}</h3>
              <p className="text-[10px] text-white/50 mb-3">{crit.desc}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val} onClick={() => setScores(prev => ({ ...prev, [crit.id]: val }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${scores[crit.id] === val ? 'bg-[#fcd34d] text-[#08203e] shadow-[0_0_10px_rgba(252,211,77,0.4)] scale-105' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Final Score</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Threshold: 13/20</span>
            </div>
            <div className={`text-4xl font-black drop-shadow-md ${totalScore === 0 ? 'text-white/20' : isPassed ? 'text-emerald-400' : 'text-red-400'}`}>{totalScore}/20</div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-xl transition-colors">Postpone</button>
            <button 
              disabled={!isComplete || isSubmitting} onClick={handleSubmit} 
              className={`flex-1 sm:flex-none px-6 py-3.5 font-black text-xs uppercase rounded-xl shadow-lg transition-all ${!isComplete ? 'bg-white/10 text-white/30 cursor-not-allowed' : isPassed ? 'bg-emerald-400 text-[#08203e] shadow-[0_0_15px_rgba(52,211,153,0.4)] hover:bg-emerald-300' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-400'}`}
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
// 3. DASHBOARD VIEWS
// ==========================================
const DesktopView = ({ teacher, nextClass, pendingEvaluations, payrollStats, onReturnHome, onAction, onRequestSub, onOpenEvaluations, isLaunching, hasNewStaffBoard }) => {
  const goal = payrollStats?.monthlyGoal || 100;
  const acquired = payrollStats?.current || 0;
  const progressPercentage = Math.round((Math.min(acquired, goal) / goal) * 100);
  const circleCircumference = 2 * Math.PI * 40; 
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <div className="min-h-screen w-full font-montserrat flex justify-center p-8 relative overflow-hidden bg-[#070b19] text-white">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="max-w-[1200px] w-full flex gap-8 relative z-10">
        <div className="w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 shadow-2xl flex flex-col shrink-0">
          <h2 className="text-white font-black text-lg text-center mb-6 tracking-wide drop-shadow-md">MONTHLY PAYROLL</h2>
          <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
               <circle cx="50" cy="50" r="40" stroke="#34d399" strokeWidth="8" fill="transparent" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white leading-none drop-shadow-md">{acquired}h</span>
                <span className="text-[9px] font-bold text-white/70 tracking-widest uppercase mt-1">LOGGED</span>
             </div>
          </div>
          <p className="text-center text-white/80 font-bold text-sm mb-8 tracking-widest uppercase">TARGET: {goal}h</p>

          <h3 className="text-[#fcd34d] font-black text-sm mb-4 tracking-widest uppercase">UPCOMING CLASSES</h3>
          <ul className="space-y-3 mb-auto text-xs font-medium text-white/80">
            {nextClass ? (
              <li className="flex flex-col gap-1 border-l-2 border-[#fcd34d] pl-3">
                <span className="text-white font-bold">{nextClass.student_name}</span>
                <span className="opacity-70">{new Date(nextClass.date).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })} • Unit {nextClass.unit}</span>
              </li>
            ) : <li className="opacity-50 italic">No upcoming classes.</li>}
          </ul>

          <button onClick={onRequestSub} className="w-full bg-red-500/10 border border-red-500/50 text-red-400 font-black text-[10px] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white hover:scale-105 transition-all shadow-lg mt-8 mb-6 uppercase tracking-widest">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            REQUEST A SUBSTITUTE
          </button>
        </div>

        <div className="flex-1 flex flex-col pt-2">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-4">
                <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-8 object-contain opacity-90" />
                <div className="h-6 w-[1px] bg-white/30"></div>
                <span className="text-sm font-light text-white/80 tracking-wide uppercase">Teacher Hub</span>
             </div>
             <ProfileDropdown teacher={teacher} pendingCount={pendingEvaluations.length} onOpenEvaluations={onOpenEvaluations} onLogout={onReturnHome} />
          </div>

          <div className="flex flex-col gap-6 flex-1">
            <div className="grid grid-cols-3 gap-6 h-[45%]">
              <button onClick={() => onAction('Manual')} disabled={!nextClass} className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 transition-all group ${!nextClass ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/20 hover:scale-[1.02]'}`}>
                <img src="https://i.postimg.cc/Hnj3rbmt/1(8).png" alt="Manual" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex flex-col items-center">
                  <h3 className="font-light tracking-wide text-2xl uppercase text-[#fcd34d] drop-shadow-md">Manual</h3>
                  <span className="text-[10px] font-bold text-white/50 mt-1 uppercase">{nextClass ? `UNIT ${nextClass.unit}` : 'NO CLASS'}</span>
                </div>
              </button>

              <button onClick={() => onAction('Tools')} disabled={!nextClass} className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 transition-all group ${!nextClass ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/20 hover:scale-[1.02]'}`}>
                <img src="https://i.postimg.cc/g23sLz9n/2(10).png" alt="Tools" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex flex-col items-center">
                  <h3 className="font-light tracking-wide text-2xl uppercase">Class Tools</h3>
                  <span className="text-[10px] font-bold text-white/50 mt-1 uppercase">{nextClass ? 'LIBRARY ACTIVE' : 'LOCKED'}</span>
                </div>
              </button>

              <button onClick={() => onAction('Calendar')} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/vT49xTyn/3(6).png" alt="Calendar" className="h-28 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-light tracking-wide text-2xl uppercase">My Roster</h3>
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-6 flex-1">
              <button onClick={() => onAction('Community_BOARD')} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                <img src="https://i.postimg.cc/rpgthxF0/4(5).png" alt="Forum" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-light tracking-wide text-lg text-center leading-tight">Open<br/>forum</h3>
              </button>
              
              <button onClick={() => onAction('Community_CHAT')} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 transition-all group hover:bg-white/20 hover:scale-[1.02]">
                <img src="https://i.postimg.cc/XNrQC7QY/5(4).png" alt="Chat" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-light tracking-wide text-lg text-center leading-tight">Class<br/>Chat</h3>
              </button>
              
              <button onClick={() => onAction('Community_BOARD')} className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 hover:bg-white/20 hover:scale-[1.02] transition-all group">
                {/* DYNAMIC NOTIFICATION DOT */}
                {hasNewStaffBoard && <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10"></div>}
                <img src="https://i.postimg.cc/PqfMrtCH/6(4).png" alt="Info" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-light tracking-wide text-lg text-center leading-tight">Staff<br/>Board</h3>
              </button>
              
              {/* START CLASS LAUNCHER */}
              <button 
                onClick={() => onAction('Live')} 
                disabled={!nextClass || isLaunching} 
                className={`bg-white/10 backdrop-blur-md border-2 border-[#fcd34d]/50 rounded-3xl p-6 shadow-[0_0_20px_rgba(252,211,77,0.15)] flex flex-col items-center justify-center gap-4 transition-all group ${
                  !nextClass ? 'opacity-50 grayscale cursor-not-allowed border-white/20' : 'hover:bg-[#fcd34d]/10 hover:border-[#fcd34d] hover:scale-[1.02]'
                }`}
              >
                <img src="https://i.postimg.cc/Wpqw4Y1x/7(6).png" alt="Live Class" className="h-20 object-contain opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className={`font-black tracking-wide text-lg text-center leading-tight ${nextClass ? 'text-[#fcd34d]' : 'text-white'}`}>
                  {isLaunching ? 'Launching...' : 'Start\nClass'}
                </h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileView = ({ teacher, nextClass, pendingEvaluations, payrollStats, onReturnHome, onAction, onRequestSub, onOpenEvaluations, isLaunching, hasNewStaffBoard }) => {
  const goal = payrollStats?.monthlyGoal || 100;
  const acquired = payrollStats?.current || 0;
  const progressPercentage = Math.round((Math.min(acquired, goal) / goal) * 100);
  const circleCircumference = 2 * Math.PI * 30; 
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  const cards = [
    { title: `Teacher Manual`, subtitle: nextClass ? `Unit ${nextClass.unit}` : 'Locked', action: "OPEN", img: "https://i.postimg.cc/Hnj3rbmt/1(8).png", active: !!nextClass, onClick: () => onAction('Manual') },
    { title: "Class Tools", subtitle: nextClass ? 'Library Active' : 'Locked', action: "ACCESS", img: "https://i.postimg.cc/g23sLz9n/2(10).png", active: !!nextClass, onClick: () => onAction('Tools') },
    { title: "My Roster", subtitle: 'Schedule', action: "VIEW", img: "https://i.postimg.cc/vT49xTyn/3(6).png", active: true, onClick: () => onAction('Calendar') },
    { title: "Start Class", subtitle: isLaunching ? 'Generating...' : 'Live Trigger', action: isLaunching ? "WAIT" : "LAUNCH", img: "https://i.postimg.cc/Wpqw4Y1x/7(6).png", active: !!nextClass && !isLaunching, highlight: true, onClick: () => onAction('Live') },
    { title: "Class Chat", subtitle: "Live", action: "JOIN", img: "https://i.postimg.cc/XNrQC7QY/5(4).png", active: true, onClick: () => onAction('Community_CHAT') },
    { title: "Staff Board", subtitle: "Announcements", action: "VIEW", img: "https://i.postimg.cc/PqfMrtCH/6(4).png", active: true, hasNotification: hasNewStaffBoard, onClick: () => onAction('Community_BOARD') },
  ];

  return (
    <div className="min-h-screen w-full font-montserrat flex flex-col overflow-x-hidden pb-10 bg-[#070b19] text-white relative z-0">
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-emerald-900/30 blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/10 blur-[90px] mix-blend-screen"></div>
      </div>

      <div className="flex justify-between items-center p-5 z-10 border-b border-white/10 bg-[#070b19]/80 backdrop-blur-md">
        <img src="https://i.postimg.cc/43zTZQhx/Diseno-sin-titulo-(20).png" alt="Outloud Logo" className="h-6 object-contain opacity-90" />
        <ProfileDropdown teacher={teacher} pendingCount={pendingEvaluations.length} onOpenEvaluations={onOpenEvaluations} onLogout={onReturnHome} />
      </div>

      <div className="mx-5 mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl flex gap-4 z-10">
        <div className="flex flex-col items-center justify-center border-r border-white/10 pr-5">
          <div className="relative w-[70px] h-[70px] flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
               <circle cx="50" cy="50" r="30" stroke="#34d399" strokeWidth="6" fill="transparent" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-center"><span className="text-sm font-black text-white leading-none">{acquired}h</span></div>
          </div>
          <p className="text-[8px] font-bold tracking-widest text-white/70 mt-2 uppercase">Goal: {goal}h</p>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-[#fcd34d] font-black text-[10px] mb-2 uppercase tracking-widest drop-shadow-md">Next Scheduled</h3>
          {nextClass ? (
            <ul className="space-y-1 text-[9px] font-medium text-white/80">
              <li className="font-bold text-white">{nextClass.student_name}</li>
              <li>{new Date(nextClass.date).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</li>
              <li>Unit {nextClass.unit}</li>
            </ul>
          ) : <p className="text-[9px] text-white/50 italic">No upcoming classes.</p>}
        </div>
      </div>

      <div className="w-full h-64 relative z-10 mt-10">
        <Swiper effect={'coverflow'} grabCursor={true} centeredSlides={true} slidesPerView={'auto'} coverflowEffect={{ rotate: 0, stretch: 0, depth: 150, modifier: 2.5, slideShadows: false }} modules={[EffectCoverflow, Pagination]} className="w-full h-full">
          {cards.map((card, idx) => (
            <SwiperSlide key={idx} className={`w-48 h-60 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 shadow-2xl flex flex-col items-center justify-between transition-all ${!card.active ? 'opacity-50 grayscale' : ''} ${card.highlight ? 'border-[#fcd34d]/50 bg-[#fcd34d]/5' : ''}`}>
              {/* DYNAMIC NOTIFICATION DOT FOR MOBILE */}
              {card.hasNotification && <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10"></div>}
              {!card.active && !card.hasNotification && <svg className="w-6 h-6 text-white/50 absolute top-4 right-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
              <img src={card.img} alt={card.title} className="h-24 object-contain mt-4 drop-shadow-md opacity-90" />
              <div className="w-full text-center">
                <h3 className={`font-light text-xl tracking-wide uppercase ${card.highlight ? 'text-[#fcd34d] font-bold' : 'text-white'}`}>{card.title}</h3>
                <button disabled={!card.active || isLaunching} onClick={() => card.onClick && card.onClick()} className={`w-full font-black text-[10px] py-3 rounded-full shadow-lg tracking-widest uppercase mt-3 transition-transform ${card.highlight && card.active ? 'bg-[#fcd34d] text-[#08203e]' : card.active ? 'bg-white/20 text-white' : 'bg-black/30 text-white/30 cursor-not-allowed'}`}>{card.action}</button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN ROUTER COMPONENT
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

  // Dynamic Notification State (defaults to false)
  const [hasNewStaffBoard, setHasNewStaffBoard] = useState(false);

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

      const currentDate = new Date();
      const todayStr = currentDate.toISOString().split('T')[0];
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];

      // Fetch Real Next Class
      const { data: upcoming } = await supabase
        .from('live_sessions')
        .select(`*, student:profiles!student_id(first_name, last_name)`)
        .eq('teacher_id', session.user.id)
        .eq('status', 'booked')
        .gte('session_date', todayStr)
        .order('session_date', { ascending: true })
        .limit(1);

      if (upcoming && upcoming.length > 0) {
        setNextClass({
          id: upcoming[0].id,
          student_id: upcoming[0].student_id,
          student_name: `${upcoming[0].student?.first_name || ''} ${upcoming[0].student?.last_name || ''}`.trim(),
          unit: upcoming[0].unit,
          date: `${upcoming[0].session_date}T${upcoming[0].time_slot.replace(' AM', ':00').replace(' PM', ':00')}`
        });
      }

      // Fetch Real Pending Gradings
      const { data: pending } = await supabase
        .from('live_sessions')
        .select(`*, student:profiles!student_id(first_name, last_name)`)
        .eq('teacher_id', session.user.id)
        .eq('status', 'completed')
        .eq('is_graded', false);

      if (pending) {
        setPendingEvaluations(pending.map(p => ({
          id: p.id,
          student_id: p.student_id,
          student_name: `${p.student?.first_name || ''} ${p.student?.last_name || ''}`.trim(),
          unit: p.unit,
          date: `${p.session_date} ${p.time_slot}`
        })));
      }

      // FETCH REAL LOGGED HOURS
      // Counts all completed sessions for this teacher in the current month
      const { count: loggedHours } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', session.user.id)
        .eq('status', 'completed')
        .gte('session_date', firstDayOfMonth);

      setPayrollStats({ current: loggedHours || 0, monthlyGoal: 80 });

    } catch (err) {
      console.error("Error loading teacher dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType) => {
    // Community Routing
    if (actionType.startsWith('Community_')) {
      setCommunityTab(actionType.split('_')[1]);
      setShowCommunity(true);
      // Turn off notification dot if they click the Staff Board
      if (actionType === 'Community_BOARD') setHasNewStaffBoard(false);
      return;
    }

    if (actionType === 'Live' && nextClass) {
      setIsLaunching(true);
      try {
        // 1. Call Edge Function to create/retrieve meeting link
        const { data, error } = await supabase.functions.invoke('create-zoom-meeting', {
          body: { 
            sessionId: nextClass.id,
            topic: `Outloud Unit ${nextClass.unit} - ${nextClass.student_name}`
          }
        });

        const launchUrl = data?.startUrl || `https://meet.jit.si/OLA-${nextClass.id}`;
        
        // 2. Open meeting in a new browser tab
        window.open(launchUrl, '_blank');

        // 3. Mark session as completed in database
        await supabase.from('live_sessions').update({ status: 'completed' }).eq('id', nextClass.id);
        
        // 4. Update local state and trigger Evaluation Modal
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

      <EvaluationModal isOpen={isEvalModalOpen} onClose={() => setIsEvalModalOpen(false)} pendingClasses={pendingEvaluations} onGradeSubmitted={removeEvaluatedClass} teacherId={teacherData?.id} />

      <div className="hidden md:block">
        <DesktopView 
          teacher={teacherData} 
          nextClass={nextClass} 
          payrollStats={payrollStats} 
          pendingEvaluations={pendingEvaluations} 
          onReturnHome={onReturnHome} 
          onAction={handleAction} 
          onRequestSub={() => setIsSubModalOpen(true)} 
          onOpenEvaluations={() => setIsEvalModalOpen(true)} 
          isLaunching={isLaunching}
          hasNewStaffBoard={hasNewStaffBoard}
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
          onOpenEvaluations={() => setIsEvalModalOpen(true)} 
          isLaunching={isLaunching} 
          hasNewStaffBoard={hasNewStaffBoard}
        />
      </div>
    </>
  );
};

export default TeacherHub;