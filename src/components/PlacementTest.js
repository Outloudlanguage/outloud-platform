import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../SupabaseClient'; // Ensure this path matches your project structure

// ==========================================
// FULL ASSESSMENT DATA (50 Questions)
// ==========================================
const MCQ_QUESTIONS = [
  { id: 1, text: "Where _______ you from?", options: ["is", "are", "am", "be"] },
  { id: 2, text: "_______ to the store yesterday to buy some bread.", options: ["go", "going", "went", "gone"] },
  { id: 3, text: "She has two _______.", options: ["childs", "childes", "children", "childrens"] },
  { id: 4, text: "Look! It _______ outside right now.", options: ["rains", "is raining", "rain", "rained"] },
  { id: 5, text: "I don't have _______ money in my wallet.", options: ["some", "any", "many", "a"] },
  { id: 6, text: "The cat is sitting _______ the chair.", options: ["in", "on", "between", "for"] },
  { id: 7, text: "_______ you like to listen to music?", options: ["Does", "Are", "Do", "Is"] },
  { id: 8, text: "This is the _______ book I have ever read.", options: ["goodest", "better", "best", "more good"] },
  { id: 9, text: "If I _______ you, I would take the job offer immediately.", options: ["am", "was", "were", "would be"] },
  { id: 10, text: "I've been working here _______ five years.", options: ["since", "during", "for", "ago"] },
  { id: 11, text: "By the time the guests arrived, we _______ cooking the dinner.", options: ["already finished", "have already finished", "had already finished", "will have finished"] },
  { id: 12, text: "You _______ come to the meeting, but it would be helpful if you did.", options: ["mustn't", "don't have to", "can't", "shouldn't"] },
  { id: 13, text: "I'm looking forward _______ the new museum gallery.", options: ["to visit", "visit", "to visiting", "visiting"] },
  { id: 14, text: "The sourdough starter _______ fed every morning to stay active.", options: ["needs", "must to be", "needs to be", "is need"] },
  { id: 15, text: "I'm not used _______ in such a humid climate.", options: ["to live", "living", "to living", "live"] },
  { id: 16, text: "He _______ have forgotten his keys; he usually keeps them in his hand.", options: ["must", "should", "can", " ought"] },
  { id: 17, text: "The technical proposal _______ reviewed by the board before Friday.", options: ["will be", "is being", "has been", "was being"] },
  { id: 18, text: "She asked me _______ I had seen the latest Star Wars film.", options: ["that", "weather", "if", "what"] },
  { id: 19, text: "Hardly _______ the plane landed when the passengers started checking their phones.", options: ["did", "had", "was", "has"] },
  { id: 20, text: "It is essential that the consultant _______ the report by midnight.", options: ["completes", "complete", "will complete", "is completing"] },
  { id: 21, text: "The two concepts are similar, but there is a _______ difference in their application.", options: ["shallow", "subtle", "thin", "weak"] },
  { id: 22, text: "I'd rather you _______ me about the rescheduling earlier.", options: ["tell", "have told", "had told", "would tell"] },
  { id: 23, text: "He was so _______ in his book that he didn't hear the doorbell.", options: ["submerged", "engrossed", "occupied", "engaged"] },
  { id: 24, text: "To all intents and _______ the project is a success.", options: ["purposes", "reasons", "goals", "meanings"] },
  { id: 25, text: "The argument was _______ leaving no room for further debate.", options: ["impeccable", "compelling", "conclusive", "All of the above"] },
  { id: 26, text: "Were I _______ the situation again, I would choose a different approach.", options: ["to handle", "handling", "handle", "handled"] },
  { id: 27, text: "Her success is _______ to her hard work and dedication.", options: ["attributed", "contributed", "distributed", "implicated"] },
  { id: 28, text: "The nuances of the Elvish language are _______ to grasp without years of study.", options: ["arduous", "tedious", "strenuous", "laborious"] },
  { id: 29, text: "Despite the evidence, he remained _______ that he was innocent.", options: ["adamant", "persistent", "stubborn", "willful"] },
  { id: 30, text: "The manager's comments _______ on the unprofessional, though he stopped just short of it.", options: ["edged", "bordered", "neared", "reached"] }
];

const WRITTEN_QUESTIONS = [
  { id: 31, text: "According to Paragraph 1, what are three common rooms found in a house?" },
  { id: 32, text: "What is the main reason people like to return home after work or school?" },
  { id: 33, text: "What materials did ancient people use to build their homes?" },
  { id: 34, text: "In Paragraph 2, besides sleeping, why were houses important to ancient families?" },
  { id: 35, text: "How did the growth of towns affect the design of houses?" },
  { id: 36, text: "What specific event caused the shift toward modern urbanization?" },
  { id: 37, text: "Why did people move from rural areas to cities during the industrial era?" },
  { id: 38, text: "According to Paragraph 3, what was sacrificed to build high-density housing quickly?" },
  { id: 39, text: "How did the 'home' change psychologically during the industrial revolution?" },
  { id: 40, text: "What is one of the primary goals of a 'smart' home?" },
  { id: 41, text: "In Paragraph 4, what are the two main concerns regarding the rise of smart homes?" },
  { id: 42, text: "What irony does the author suggest regarding modern connectivity?" },
  { id: 43, text: "Based on Paragraph 4, what is happening to physical shared spaces today?" },
  { id: 44, text: "What does the word 'metamorphosis' in Paragraph 5 imply about human dwellings?" },
  { id: 45, text: "According to the text, what two societal values are currently in conflict?" },
  { id: 46, text: "How does the author define the 'home of tomorrow'?" },
  { id: 47, text: "Explain the 'paradox' mentioned in the final paragraphs regarding technology and community?" },
  { id: 48, text: "Rewrite the phrase 'inextricably linked' in Paragraph 4 using your own words." },
  { id: 49, text: "Summarize the author's tone regarding the future of human habitats." },
  { id: 50, text: "In your opinion, based on the text, has the evolution of the 'home' been entirely positive? Explain why or why not using evidence from the passage." }
];

const READING_PASSAGE = `Paragraph 1: Many people live in houses or apartments. A house usually has a kitchen, a living room, and bedrooms. Some houses have a small garden with flowers and trees. In a city, buildings are very tall and close together. Most people go to work or school every day, and they like to come home to rest. It is important to have a comfortable place to live.

Paragraph 2: Historically, the way we lived was quite different. In ancient times, communities were smaller, and people often built their own homes using local materials like stone, wood, or mud. These structures were not just for sleeping; they were central to survival. Families spent most of their time together, sharing chores and meals. As towns grew into cities, the design of houses changed to save space, but the goal of creating a "home" remained the same.

Paragraph 3: The industrial revolution acted as a primary catalyst for the shift toward modern urbanization. As factories sprouted in urban centers, thousands of people migrated from rural areas in search of employment. This mass influx necessitated the rapid construction of high-density housing, often at the expense of aesthetic value and personal space. Consequently, the psychological relationship between a person and their environment began to transform, as the "home" became a sanctuary from the frantic pace of industrial life.

Paragraph 4: In the contemporary era, the concept of a "habitat" has transcended physical boundaries, becoming inextricably linked with digital connectivity and sustainable architecture. We are currently witnessing a shift toward "smart" homes that integrate technology to minimize energy consumption while maximizing efficiency. However, this advancement invites a complex debate regarding privacy and the potential for social isolation. While we are more "connected" than ever through our devices, the physical shared spaces that once defined community life are increasingly underutilized.

Paragraph 5: Ultimately, the metamorphosis of the human dwelling reflects our broader societal values and tensions. The tension between the desire for individualistic luxury and the burgeoning necessity for collective environmental responsibility remains unresolved. As we look toward the future, the challenge lies in reconciling our ancestral need for physical community with the relentless march of technological progress. The "home" of tomorrow will likely be a synthesis of these competing forces, serving as both a high-tech node and a primal refuge.`;

// ==========================================
// PROCTORED PLACEMENT TEST COMPONENT
// ==========================================
const PlacementTest = () => {
  const [currentSection, setCurrentSection] = useState(0); 
  const [candidateInfo, setCandidateInfo] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

 const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('grade-placement', {
        body: { candidateInfo, answers }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setCurrentSection(4); 
    } catch (err) {
      console.error("Transmission Error:", err);
      alert("Error securely processing your exam. Please contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRegistration = () => (
    <div className="flex flex-col gap-6 animate-fade-in mt-10">
      <div className="bg-[#070b19]/60 backdrop-blur-xl border border-white/20 border-t-8 border-t-[#fcd34d] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-white font-montserrat tracking-widest uppercase mb-2">
            Candidate Registration
          </h1>
          <p className="text-white/70 font-medium mb-8 text-sm">
            Please enter your details to begin the Outloud Placement Assessment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">First Name</label>
              <input type="text" value={candidateInfo.firstName} onChange={e => setCandidateInfo({...candidateInfo, firstName: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">Last Name</label>
              <input type="text" value={candidateInfo.lastName} onChange={e => setCandidateInfo({...candidateInfo, lastName: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">Email Address</label>
              <input type="email" value={candidateInfo.email} onChange={e => setCandidateInfo({...candidateInfo, email: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] text-[#fcd34d] font-bold uppercase mb-2 tracking-widest">Phone Number</label>
              <input type="tel" value={candidateInfo.phone} onChange={e => setCandidateInfo({...candidateInfo, phone: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fcd34d] shadow-inner transition-colors" required />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
            <button 
              disabled={!candidateInfo.firstName || !candidateInfo.lastName || !candidateInfo.email}
              onClick={() => setCurrentSection(1)}
              className="bg-[#fcd34d] text-[#08203e] font-black px-10 py-4 rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(252,211,77,0.3)] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="flex flex-col gap-6 animate-fade-in mt-10">
      <div className="bg-red-900/40 backdrop-blur-xl border border-red-500/50 border-t-8 border-t-red-500 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-black text-red-400 font-montserrat tracking-widest uppercase mb-6 drop-shadow-md">
          Strict Security Rules
        </h2>
        <ul className="text-white/90 space-y-5 text-sm md:text-base font-medium list-none pl-0 relative z-10">
          <li className="flex gap-4 items-start">
            <span className="text-red-500 font-black shrink-0">1.</span>
            <span><strong className="text-white">No Copying or Pasting:</strong> The clipboard is completely disabled.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="text-red-500 font-black shrink-0">2.</span>
            <span><strong className="text-white">No Leaving the Screen:</strong> If you switch tabs or minimize the browser, you will receive a strike. 3 strikes will instantly void your test.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="text-red-500 font-black shrink-0">3.</span>
            <span><strong className="text-white">Time Limit:</strong> If you leave the screen for more than 20 uninterrupted seconds, the test is instantly voided.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="text-red-500 font-black shrink-0">4.</span>
            <span><strong className="text-white">No Screenshots:</strong> Attempting to screenshot will black out the exam and log a security violation.</span>
          </li>
        </ul>
        <div className="mt-10 pt-6 border-t border-red-500/20 flex justify-end relative z-10">
          <button onClick={() => setCurrentSection(2)} className="bg-red-500 text-white font-black px-10 py-4 rounded-full uppercase tracking-widest hover:bg-red-400 hover:scale-105 transition-all shadow-lg cursor-pointer">
            I Understand, Start Test
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection1 = () => (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="bg-[#070b19]/60 backdrop-blur-xl border border-white/20 border-t-8 border-t-[#fcd34d] rounded-[2rem] p-8 shadow-2xl sticky top-4 z-40">
        <h2 className="text-2xl font-black text-white font-montserrat tracking-widest uppercase">
          Section 1: Grammar & Nuance
        </h2>
        <p className="text-white/50 font-bold uppercase tracking-widest text-xs mt-2">Multiple Choice (30 Questions)</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-4">
        {MCQ_QUESTIONS.map((q, index) => (
          <div key={q.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl hover:bg-white/10 transition-colors">
            <h3 className="text-lg text-white font-bold mb-6 select-none leading-relaxed">
              <span className="text-[#fcd34d] mr-2">{index + 1}.</span> {q.text}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map(opt => {
                const isSelected = answers[q.id] === opt;
                return (
                  <label key={opt} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border select-none shadow-md ${isSelected ? 'bg-[#fcd34d] border-[#fcd34d]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#08203e]' : 'border-white/40'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-[#08203e] rounded-full"></div>}
                    </div>
                    <input type="radio" name={`q-${q.id}`} value={opt} checked={isSelected} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))} className="hidden" />
                    <span className={`text-sm md:text-base font-bold ${isSelected ? 'text-[#08203e]' : 'text-white/80'}`}>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end items-center mt-8 border-t border-white/10 pt-8">
        <button onClick={() => setCurrentSection(3)} className="bg-[#fcd34d] text-[#08203e] font-black px-10 py-4 rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(252,211,77,0.3)] cursor-pointer">
          Continue to Section 2
        </button>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="bg-[#070b19]/60 backdrop-blur-xl border border-white/20 border-t-8 border-t-[#fcd34d] rounded-[2rem] p-8 shadow-2xl sticky top-4 z-40">
        <h2 className="text-2xl font-black text-white font-montserrat tracking-widest uppercase">
          Section 2: Reading Comprehension
        </h2>
        <p className="text-white/50 font-bold uppercase tracking-widest text-xs mt-2">Written Expression (20 Questions)</p>
      </div>

      <div className="bg-black/60 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-10 shadow-2xl select-none mt-4">
        <h3 className="text-[#fcd34d] font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Reading Passage: The Evolution of Human Habitats</h3>
        <div className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
          {READING_PASSAGE}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-4">
        {WRITTEN_QUESTIONS.map((q, index) => (
          <div key={q.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">
            <h3 className="text-base md:text-lg text-white font-bold mb-4 leading-snug select-none">
              <span className="text-[#fcd34d] mr-2">{index + 31}.</span> {q.text}
            </h3>
            <textarea 
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              placeholder="Type your answer manually..."
              className="w-full bg-black/40 border border-white/20 rounded-xl p-5 text-white text-sm md:text-base focus:outline-none focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] transition-all min-h-[140px] resize-y custom-scrollbar shadow-inner"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8 border-t border-white/10 pt-8">
        <button onClick={() => setCurrentSection(2)} className="text-white/50 hover:text-white font-bold uppercase tracking-widest text-xs px-6 py-3 transition-colors cursor-pointer">
          &larr; Back to Section 1
        </button>
        <button 
          onClick={handleSubmitExam} 
          disabled={isSubmitting}
          className="bg-emerald-500 text-white font-black px-10 py-4 rounded-full uppercase tracking-widest hover:scale-105 hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSubmitting ? 'TRANSMITTING...' : 'SUBMIT EXAM'}
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="relative min-h-screen w-full font-montserrat text-white overflow-hidden flex flex-col items-center pb-20 select-none"
      style={{ 
        backgroundImage: `linear-gradient(to bottom right, rgba(7,11,25,0.95), rgba(7,11,25,0.85)), url("https://i.postimg.cc/kg4rxNH2/Gemini-Generated-Image-ohtdmbohtdmbohtd.jpg")`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundAttachment: 'fixed' 
      }}
    >
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fcd34d; }
      `}</style>

      {/* SCREENSHOT BLACKOUT OVERLAY */}
      {isBlackout && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
          <svg className="w-32 h-32 text-red-600 mb-8 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h1 className="text-5xl font-black text-red-600 uppercase tracking-widest text-center">Security Violation</h1>
          <p className="text-white/50 mt-4 font-bold uppercase tracking-widest">Screen recording and capturing is blocked.</p>
        </div>
      )}

      <div className="w-full max-w-4xl px-4 md:px-6 relative z-10 flex flex-col items-center">
        
        {/* HEADER BRANDING */}
        <div className="w-full flex justify-center py-10 z-10 relative">
          <img src="https://i.postimg.cc/W4wH7P4n/Diseno-sin-titulo-(24).png" alt="Outloud Logo" className="h-10 md:h-12 object-contain drop-shadow-md" />
        </div>

        <div className="w-full">
          {currentSection === 0 && renderRegistration()}
          {currentSection === 1 && renderRules()}
          {currentSection === 2 && renderSection1()}
          {currentSection === 3 && renderSection2()}
          
          {currentSection === 4 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center mt-10">
              <div className="bg-[#070b19]/60 backdrop-blur-xl border border-white/20 rounded-[3rem] p-12 md:p-16 shadow-2xl flex flex-col items-center max-w-2xl">
                <div className="w-28 h-28 rounded-full border-4 border-emerald-500 bg-emerald-500/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <svg className="w-14 h-14 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-6 drop-shadow-md">Exam Submitted</h2>
                <p className="text-white/70 font-medium leading-relaxed text-sm md:text-base">
                  Your written and grammar components have been securely transmitted to our academic database.
                  <br/><br/>
                  <strong className="text-[#fcd34d]">A live session will be programmed with you to complete the assessment.</strong>
                  <br/><br/>
                  Our academic team will contact you shortly to book your live interview.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;