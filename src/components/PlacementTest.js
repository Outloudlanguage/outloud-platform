import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// MOCK DATA (Expand with your exact questions)
// ==========================================
const MCQ_QUESTIONS = [
  { id: 1, text: "Where _______ you from?", options: ["is", "are", "am", "be"] },
  { id: 2, text: "She has two _______.", options: ["childs", "childes", "children", "childrens"] },
  { id: 9, text: "If I _______ you, I would take the job offer immediately.", options: ["am", "was", "were", "would be"] }
];

const WRITTEN_QUESTIONS = [
  { id: 31, text: "According to Paragraph 1, what are three common rooms found in a house?" },
  { id: 32, text: "What is the main reason people like to return home after work or school?" }
];

const READING_PASSAGE = `Paragraph 1: Many people live in houses or apartments. A house usually has a kitchen, a living room, and bedrooms. Some houses have a small garden with flowers and trees. In a city, buildings are very tall and close together. Most people go to work or school every day, and they like to come home to rest. It is important to have a comfortable place to live.

Paragraph 2: Historically, the way we lived was quite different. In ancient times, communities were smaller, and people often built their own homes using local materials like stone, wood, or mud. These structures were not just for sleeping; they were central to survival.`;

// ==========================================
// PROCTORED PLACEMENT TEST COMPONENT
// ==========================================
const PlacementTest = () => {
  const [currentSection, setCurrentSection] = useState(0); 
  const [candidateInfo, setCandidateInfo] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [answers, setAnswers] = useState({});
  
  // Anti-Cheat State
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);
  const blurTimeoutRef = useRef(null);

  // --- ANTI-CHEAT ENGINE ---
  useEffect(() => {
    if (currentSection < 2 || currentSection > 3) return;

    const handleBlur = () => {
      blurTimeoutRef.current = setTimeout(() => {
        triggerFail("You left the test window for more than 20 seconds.");
      }, 20000);
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        setCheatWarnings(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            triggerFail("You navigated away from the test too many times.");
          } else {
            alert(`SECURITY WARNING: Do not leave the test window. You have ${3 - newCount} warning(s) remaining before your test is voided.`);
          }
          return newCount;
        });
      }
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' || 
        (e.metaKey && e.shiftKey) || 
        (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'p'))
      ) {
        e.preventDefault();
        setIsBlackout(true);
        alert("SECURITY ALERT: Screenshots and copying are strictly prohibited.");
        setTimeout(() => setIsBlackout(false), 4000);
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [currentSection]);

  const triggerFail = (reason) => {
    alert(`TEST VOIDED: ${reason} Your progress has been erased.`);
    setAnswers({});
    setCheatWarnings(0);
    setCurrentSection(0);
  };

  const renderRegistration = () => (
    <div className="flex flex-col gap-6 animate-fade-in mt-10">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 border-t-8 border-t-[#fcd34d] rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-black text-white font-montserrat tracking-widest uppercase mb-2">
          Candidate Registration
        </h1>
        <p className="text-white/70 font-medium mb-8 text-sm">
          Please enter your details to begin the Outloud Placement Assessment.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">First Name</label>
            <input type="text" value={candidateInfo.firstName} onChange={e => setCandidateInfo({...candidateInfo, firstName: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner" required />
          </div>
          <div>
            <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">Last Name</label>
            <input type="text" value={candidateInfo.lastName} onChange={e => setCandidateInfo({...candidateInfo, lastName: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner" required />
          </div>
          <div>
            <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">Email Address</label>
            <input type="email" value={candidateInfo.email} onChange={e => setCandidateInfo({...candidateInfo, email: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner" required />
          </div>
          <div>
            <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">Phone Number</label>
            <input type="tel" value={candidateInfo.phone} onChange={e => setCandidateInfo({...candidateInfo, phone: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner" required />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
          <button 
            disabled={!candidateInfo.firstName || !candidateInfo.lastName || !candidateInfo.email}
            onClick={() => setCurrentSection(1)}
            className="bg-[#fcd34d] text-[#08203e] font-black px-10 py-4 rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(252,211,77,0.3)] disabled:opacity-50 disabled:hover:scale-100"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="flex flex-col gap-6 animate-fade-in mt-10">
      <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/50 border-t-8 border-t-red-500 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-red-400 font-montserrat tracking-widest uppercase mb-4">
          Strict Security Rules
        </h2>
        <ul className="text-white/90 space-y-4 text-sm md:text-base font-medium list-disc pl-5">
          <li><strong>No Copying or Pasting:</strong> The clipboard is disabled.</li>
          <li><strong>No Leaving the Screen:</strong> If you switch tabs or minimize the browser, you will receive a strike. 3 strikes will void your test.</li>
          <li><strong>Time Limit:</strong> If you leave the screen for more than 20 uninterrupted seconds, the test is instantly voided.</li>
          <li><strong>No Screenshots:</strong> Attempting to screenshot will black out the exam and log a security violation.</li>
        </ul>
        <div className="mt-8 pt-6 border-t border-red-500/20 flex justify-end">
          <button onClick={() => setCurrentSection(2)} className="bg-red-500 text-white font-black px-8 py-4 rounded-full uppercase tracking-widest hover:bg-red-400 transition-colors shadow-lg">
            I Understand, Start Test
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection1 = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 border-t-8 border-t-[#fcd34d] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-white font-montserrat tracking-widest uppercase">
          Section 1: Grammar & Nuance
        </h2>
      </div>

      {MCQ_QUESTIONS.map((q, index) => (
        <div key={q.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-lg text-white font-bold mb-6 select-none">
            <span className="text-[#fcd34d] mr-2">{index + 1}.</span> {q.text}
          </h3>
          <div className="flex flex-col gap-3">
            {q.options.map(opt => {
              const isSelected = answers[q.id] === opt;
              return (
                <label key={opt} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border select-none ${isSelected ? 'bg-[#fcd34d]/10 border-[#fcd34d]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#fcd34d]' : 'border-white/40'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-[#fcd34d] rounded-full"></div>}
                  </div>
                  <input type="radio" name={`q-${q.id}`} value={opt} checked={isSelected} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))} className="hidden" />
                  <span className={`text-sm md:text-base ${isSelected ? 'text-[#fcd34d] font-bold' : 'text-white/90'}`}>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end items-center mt-4">
        <button onClick={() => setCurrentSection(3)} className="bg-[#fcd34d] text-[#08203e] font-black px-8 py-4 rounded-full uppercase tracking-widest hover:scale-105 transition-transform">
          Next Section
        </button>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 border-t-8 border-t-[#fcd34d] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-white font-montserrat tracking-widest uppercase">
          Section 2: Reading Comprehension
        </h2>
      </div>

      <div className="bg-[#08203e]/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl select-none">
        <h3 className="text-[#fcd34d] font-black uppercase tracking-widest mb-4">Reading Passage: The Evolution of Human Habitats</h3>
        <div className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
          {READING_PASSAGE}
        </div>
      </div>

      {WRITTEN_QUESTIONS.map((q, index) => (
        <div key={q.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-lg text-white font-bold mb-4 leading-snug select-none">
            <span className="text-[#fcd34d] mr-2">{index + 31}.</span> {q.text}
          </h3>
          <textarea 
            value={answers[q.id] || ''}
            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            placeholder="Type your answer manually..."
            className="w-full bg-black/40 border border-white/20 rounded-xl p-4 text-white text-sm md:text-base focus:outline-none focus:border-[#fcd34d] transition-all min-h-[120px] resize-y custom-scrollbar"
          />
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <button onClick={() => setCurrentSection(2)} className="text-white/50 hover:text-white font-bold uppercase tracking-widest text-xs px-6 py-3 transition-colors">
          Back
        </button>
        <button onClick={() => setCurrentSection(4)} className="bg-emerald-500 text-white font-black px-10 py-4 rounded-full uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          Submit Exam
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full font-montserrat bg-[#070b19] flex justify-center pb-20 select-none">
      
      {/* SCREENSHOT BLACKOUT OVERLAY */}
      {isBlackout && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
          <svg className="w-24 h-24 text-red-600 mb-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h1 className="text-4xl font-black text-red-600 uppercase tracking-widest text-center">Security Violation</h1>
          <p className="text-white/50 mt-2 font-bold uppercase">Screen recording and capturing is blocked.</p>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[60%] bg-[#fcd34d]/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-3xl px-4 md:px-0 relative z-10">
        
        {/* HEADER BRANDING */}
        <div className="w-full flex justify-center py-10">
          <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-12 object-contain drop-shadow-md" />
        </div>

        {currentSection === 0 && renderRegistration()}
        {currentSection === 1 && renderRules()}
        {currentSection === 2 && renderSection1()}
        {currentSection === 3 && renderSection2()}
        {currentSection === 4 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center mt-10">
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Exam Submitted</h2>
            <p className="text-white/60">
              Your written and grammar components have been securely transmitted.<br/><br/>
              A live session will be programmed with you to complete the assessment.<br/>
              Our academic team will contact you shortly to book your interview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementTest;