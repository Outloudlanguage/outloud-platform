import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../SupabaseClient';
import { OutLoudHorizontalLogo, OutLoudIcon } from './OutLoudBrand';

// ==========================================
// 1. CEFR-CALIBRATED ASSESSMENT DATA (50 Questions)
//    Section 1: 30 MCQs (5 per CEFR band: A1 -> C2)
//    Balanced Answer Positions: A=7, B=8, C=8, D=7
// ==========================================
const MCQ_QUESTIONS = [
  // --- A1 (Questions 1–5) ---
  {
    id: 1,
    text: 'My sister _______ a doctor at the local hospital.',
    options: ['is', 'are', 'am', 'be'],
  },
  {
    id: 2,
    text: 'I usually _______ coffee in the morning, not tea.',
    options: ['drinks', 'drinking', 'drink', 'drank'],
  },
  {
    id: 3,
    text: "There aren't _______ chairs left in the meeting room.",
    options: ['some', 'any', 'much', 'a'],
  },
  {
    id: 4,
    text: '_______ you go to the concert last Saturday?',
    options: ['Do', 'Were', 'Have', 'Did'],
  },
  {
    id: 5,
    text: 'Please put the keys _______ the kitchen table.',
    options: ['in', 'on', 'at', 'to'],
  },

  // --- A2 (Questions 6–10) ---
  {
    id: 6,
    text: 'She _______ for this company since 2021.',
    options: ['works', 'worked', 'has worked', 'is working'],
  },
  {
    id: 7,
    text: 'This route is much _______ than the highway during rush hour.',
    options: ['faster', 'more fast', 'fastest', 'fast'],
  },
  {
    id: 8,
    text: 'We were having dinner when the lights suddenly _______ out.',
    options: ['were going', 'go', 'have gone', 'went'],
  },
  {
    id: 9,
    text: "You _______ wear a tie to the office on Fridays; it's completely optional.",
    options: ["mustn't", "don't have to", "can't", "shouldn't"],
  },
  {
    id: 10,
    text: "I'm really looking forward _______ you next week.",
    options: ['to see', 'seeing', 'to seeing', 'for seeing'],
  },

  // --- B1 (Questions 11–15) ---
  {
    id: 11,
    text: 'If I _______ enough time, I would learn a third language.',
    options: ['had', 'have', 'would have', 'will have'],
  },
  {
    id: 12,
    text: 'By the time we reached the station, the train _______.',
    options: ['already left', 'has already left', 'was leaving', 'had already left'],
  },
  {
    id: 13,
    text: 'She asked me _______ I had finished reviewing the contract.',
    options: ['that', 'whether', 'what', 'which'],
  },
  {
    id: 14,
    text: 'It took me a few months to get used _______ on the left side of the road.',
    options: ['to drive', 'driving', 'to driving', 'for driving'],
  },
  {
    id: 15,
    text: "He _______ have left his phone at home; his messages aren't going through.",
    options: ['must', 'should', 'can', 'would'],
  },

  // --- B2 (Questions 16–20) ---
  {
    id: 16,
    text: 'The final report needs _______ before the board meets on Friday.',
    options: ['revising it', 'be revised', 'to revise', 'to be revised'],
  },
  {
    id: 17,
    text: "I'd rather you _______ anyone about the restructuring until Monday.",
    options: ["don't tell", "didn't tell", "won't tell", "haven't told"],
  },
  {
    id: 18,
    text: 'Despite _______ thoroughly for the interview, she still felt nervous.',
    options: ['she prepared', 'to prepare', 'having prepared', 'of preparing'],
  },
  {
    id: 19,
    text: 'The two proposals look identical at first glance, yet there is a _______ difference in cost.',
    options: ['subtle', 'shallow', 'faint', 'slender'],
  },
  {
    id: 20,
    text: 'If they had invested earlier, the company _______ in a much stronger position today.',
    options: ['would have been', 'will be', 'were', 'would be'],
  },

  // --- C1 (Questions 21–25) ---
  {
    id: 21,
    text: 'Hardly _______ the presentation begun when the projector failed.',
    options: ['did', 'had', 'was', 'has'],
  },
  {
    id: 22,
    text: 'It is imperative that every applicant _______ the form prior to the deadline.',
    options: ['submits', 'submitted', 'submit', 'will submit'],
  },
  {
    id: 23,
    text: 'She was so _______ in her research that she completely lost track of time.',
    options: ['engrossed', 'submerged', 'occupied', 'indulged'],
  },
  {
    id: 24,
    text: 'Were I _______ the negotiations again, I would insist on clearer terms.',
    options: ['leading', 'lead', 'led', 'to lead'],
  },
  {
    id: 25,
    text: 'Her rapid promotion was largely _______ to her ability to resolve crises calmly.',
    options: ['contributed', 'attributed', 'distributed', 'assigned'],
  },

  // --- C2 (Questions 26–30) ---
  {
    id: 26,
    text: 'To all intents and _______, the new regulation has already taken effect.',
    options: ['reasons', 'objectives', 'purposes', 'ends'],
  },
  {
    id: 27,
    text: "The committee's remarks _______ on the dismissive, though they stopped short of outright hostility.",
    options: ['bordered', 'edged', 'neared', 'brushed'],
  },
  {
    id: 28,
    text: 'Notwithstanding the mounting evidence, the witness remained _______ that he had seen nothing.',
    options: ['persistent', 'stubborn', 'inflexible', 'adamant'],
  },
  {
    id: 29,
    text: 'Mastering the finer nuances of legal translation is an _______ endeavor requiring years of practice.',
    options: ['tedious', 'arduous', 'strenuous', 'frivolous'],
  },
  {
    id: 30,
    text: 'Not only _______ the original budget, but the project also fell three months behind schedule.',
    options: ['it exceeded', 'exceeded it', 'did it exceed', 'had it been exceeding'],
  },
];

const READING_PARAGRAPHS = [
  {
    num: 1,
    text: 'Many people live in houses or apartments. A house usually has a kitchen, a living room, and bedrooms. Some houses have a small garden with flowers and trees. In a city, buildings are very tall and close together. Most people go to work or school every day, and they like to come home to rest. It is important to have a comfortable place to live.',
  },
  {
    num: 2,
    text: 'Historically, the way we lived was quite different. In ancient times, communities were smaller, and people often built their own homes using local materials like stone, wood, or mud. These structures were not just for sleeping; they were central to survival. Families spent most of their time together, sharing chores and meals. As towns grew into cities, the design of houses changed to save space, but the goal of creating a "home" remained the same.',
  },
  {
    num: 3,
    text: 'The industrial revolution acted as a primary catalyst for the shift toward modern urbanization. As factories sprouted in urban centers, thousands of people migrated from rural areas in search of employment. This mass influx necessitated the rapid construction of high-density housing, often at the expense of aesthetic value and personal space. Consequently, the psychological relationship between a person and their environment began to transform, as the "home" became a sanctuary from the frantic pace of industrial life.',
  },
  {
    num: 4,
    text: 'In the contemporary era, the concept of a "habitat" has transcended physical boundaries, becoming inextricably linked with digital connectivity and sustainable architecture. We are currently witnessing a shift toward "smart" homes that integrate technology to minimize energy consumption while maximizing efficiency. However, this advancement invites a complex debate regarding privacy and the potential for social isolation. While we are more "connected" than ever through our devices, the physical shared spaces that once defined community life are increasingly underutilized.',
  },
  {
    num: 5,
    text: 'Ultimately, the metamorphosis of the human dwelling reflects our broader societal values and tensions. The tension between the desire for individualistic luxury and the burgeoning necessity for collective environmental responsibility remains unresolved. As we look toward the future, the challenge lies in reconciling our ancestral need for physical community with the relentless march of technological progress. The "home" of tomorrow will likely be a synthesis of these competing forces, serving as both a high-tech node and a primal refuge.',
  },
];

const WRITTEN_QUESTIONS = [
  { id: 31, text: 'According to Paragraph 1, what are three common rooms found in a house?' },
  { id: 32, text: 'What is the main reason people like to return home after work or school?' },
  { id: 33, text: 'What materials did ancient people use to build their homes?' },
  { id: 34, text: 'In Paragraph 2, besides sleeping, why were houses important to ancient families?' },
  { id: 35, text: 'How did the growth of towns affect the design of houses?' },
  { id: 36, text: 'What specific historical event caused the shift toward modern urbanization?' },
  { id: 37, text: 'Why did people move from rural areas to cities during the industrial era?' },
  { id: 38, text: 'According to Paragraph 3, what was sacrificed to build high-density housing quickly?' },
  { id: 39, text: 'How did the psychological role of the "home" change during the industrial revolution?' },
  { id: 40, text: 'What is one of the primary goals of a "smart" home?' },
  { id: 41, text: 'In Paragraph 4, what are the two main concerns regarding the rise of smart homes?' },
  { id: 42, text: 'What irony does the author suggest regarding modern connectivity?' },
  { id: 43, text: 'Based on Paragraph 4, what is happening to physical shared spaces today?' },
  { id: 44, text: 'What does the word "metamorphosis" in Paragraph 5 imply about human dwellings?' },
  { id: 45, text: 'According to the text, what two societal values are currently in conflict?' },
  { id: 46, text: 'How does the author define the "home of tomorrow"?' },
  { id: 47, text: 'Explain the paradox mentioned in the final paragraphs regarding technology and community.' },
  { id: 48, text: 'Rewrite the phrase "inextricably linked" in Paragraph 4 using your own words.' },
  { id: 49, text: "Summarize the author's tone regarding the future of human habitats." },
  { id: 50, text: 'In your opinion, based on the text, has the evolution of the "home" been entirely positive? Explain why or why not using evidence from the passage.' },
];

// ==========================================
// 2. OUTLOUD DESIGN ENGINE & BACKDROP
// ==========================================
const PlacementThemeStyles = () => (
  <style>{`
    .ola-pt-canvas {
      background: linear-gradient(125deg, #fdebc0 0%, #f6eff5 44%, #e5e8fa 76%, #d9dff8 100%);
    }
    .ola-pt-card-pearl {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.95) 0%, rgba(242, 244, 253, 0.85) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(55, 63, 118, 0.2), inset 0 2px 2px #ffffff;
    }
    .ola-pt-card-gold {
      background: linear-gradient(160deg, #fff9e8 0%, #ffe69e 100%);
      border: 2px solid #ffffff;
      box-shadow: 0 22px 44px -18px rgba(196, 138, 12, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.96);
    }
    .ola-pt-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 10px 22px -6px rgba(255, 199, 73, 0.55);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
    }
    .ola-pt-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246, 0 14px 26px -6px rgba(255, 199, 73, 0.72);
    }
    .ola-pt-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
    }
    .ola-pt-btn-outline {
      background: rgba(255, 255, 255, 0.95);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 rgba(30, 34, 70, 0.16);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease;
    }
    .ola-pt-btn-outline:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #626a9f;
    }
    .ola-pt-btn-mint {
      background: #16a37f;
      color: #ffffff;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 12px 24px -8px rgba(22, 163, 127, 0.55);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease;
    }
    .ola-pt-btn-mint:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246;
    }
    .ola-pt-btn-coral {
      background: #ee665b;
      color: #ffffff;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246;
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease;
    }
    .ola-pt-btn-coral:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246;
    }
    @keyframes olaPtPop {
      0% { opacity: 0; transform: translateY(12px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ola-pt-pop { animation: olaPtPop 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  `}</style>
);

const PlacementBackdrop = () => (
  <div className="ola-pt-canvas fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-75"
      style={{
        backgroundImage: 'radial-gradient(rgba(82, 91, 146, 0.22) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
      }}
    />
    <svg className="hidden xl:block absolute top-28 left-8 w-16 h-16 opacity-60" viewBox="0 0 60 60" fill="none">
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle
            key={`${r}-${c}`}
            cx={8 + c * 14}
            cy={8 + r * 14}
            r="3"
            fill={(r + c) % 3 === 0 ? '#ffc749' : '#626a9f'}
            opacity={(r + c) % 2 === 0 ? 0.85 : 0.45}
          />
        ))
      )}
    </svg>
    <svg className="hidden xl:block absolute bottom-10 right-10 w-24 h-24 opacity-60" viewBox="0 0 100 100" fill="none">
      <circle cx="72" cy="24" r="14" fill="#ffc749" />
      <path d="M58 56 A18 18 0 0 1 94 56 Z" fill="#626a9f" opacity="0.75" />
      <rect x="20" y="64" width="22" height="22" rx="6" fill="#ffc749" opacity="0.8" />
    </svg>
  </div>
);
// ==========================================
// 3. PROCTORED PLACEMENT TEST COMPONENT
// ==========================================
const PlacementTest = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [candidateInfo, setCandidateInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-Cheat & Proctor State
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);
  const [securityModal, setSecurityModal] = useState(null);
  const [showMobilePassage, setShowMobilePassage] = useState(false);
  const blurTimeoutRef = useRef(null);

  const isProctored = currentSection === 2 || currentSection === 3;

  const triggerFail = useCallback((reason) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setAnswers({});
    setCheatWarnings(0);
    setShowMobilePassage(false);
    setCurrentSection(0);
    setSecurityModal({
      tone: 'danger',
      title: 'Test Voided',
      message: `${reason} Your progress has been erased for security compliance.`,
    });
  }, []);

  // --- ANTI-CHEAT ENGINE ---
  useEffect(() => {
    if (!isProctored) return;

    const handleBlur = () => {
      blurTimeoutRef.current = setTimeout(() => {
        triggerFail('You left the test window for more than 20 uninterrupted seconds.');
      }, 20000);
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
        setCheatWarnings((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= 3) {
            triggerFail('You navigated away from the test window 3 times.');
          } else {
            setSecurityModal({
              tone: 'warning',
              title: `Security Strike ${nextCount} of 3`,
              message: `Do not switch tabs or leave the exam window. You have ${
                3 - nextCount
              } warning(s) remaining before your assessment is voided.`,
            });
          }
          return nextCount;
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
        setTimeout(() => setIsBlackout(false), 3500);
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
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };
  }, [isProctored, triggerFail]);

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('grade-placement', {
        body: { candidateInfo, answers },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentSection(4);
    } catch (err) {
      console.error('Transmission Error:', err);
      setSecurityModal({
        tone: 'danger',
        title: 'Transmission Error',
        message: 'Could not securely submit your exam. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mcqAnsweredCount = MCQ_QUESTIONS.filter((q) => Boolean(answers[q.id])).length;
  const writtenAnsweredCount = WRITTEN_QUESTIONS.filter((q) => Boolean(answers[q.id]?.trim())).length;
  const strikesLeft = Math.max(0, 3 - cheatWarnings);

  const STEPS = [
    { id: 0, label: 'Profile' },
    { id: 1, label: 'Rules' },
    { id: 2, label: 'Part 1 (30)' },
    { id: 3, label: 'Part 2 (20)' },
  ];

  // ==========================================
  // SECTION 0: CANDIDATE REGISTRATION
  // ==========================================
  const renderRegistration = () => (
    <div className="ola-pt-pop w-full max-w-2xl mx-auto">
      <div className="text-center mb-7">
        <span className="inline-flex items-center gap-2 bg-white/95 border border-white rounded-full px-3.5 py-1.5 shadow-sm mb-3">
          <span className="w-2 h-2 rounded-full bg-[#16a37f]" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#454d82]">
            CEFR A1 – C2 • 50-Item Proctored Assessment
          </span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.06]">
          <span className="text-[#1e2246]">Placement </span>
          <span className="text-[#626a9f]">
            Test<span className="text-[#ffc749]">.</span>
          </span>
        </h1>
        <p className="text-sm text-[#4c5384] font-medium mt-2 max-w-lg mx-auto">
          Enter your details below to begin your official OutLoud diagnostic.
        </p>
      </div>

      <div className="ola-pt-card-pearl rounded-[2.25rem] p-6 sm:p-9">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-extrabold text-[#454d82] uppercase tracking-widest mb-1.5">
              First Name *
            </label>
            <input
              type="text"
              value={candidateInfo.firstName}
              onChange={(e) => setCandidateInfo({ ...candidateInfo, firstName: e.target.value })}
              placeholder="e.g. Sofía"
              className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#454d82] uppercase tracking-widest mb-1.5">
              Last Name *
            </label>
            <input
              type="text"
              value={candidateInfo.lastName}
              onChange={(e) => setCandidateInfo({ ...candidateInfo, lastName: e.target.value })}
              placeholder="e.g. Mendoza"
              className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#454d82] uppercase tracking-widest mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={candidateInfo.email}
              onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#454d82] uppercase tracking-widest mb-1.5">
              WhatsApp / Phone
            </label>
            <input
              type="tel"
              value={candidateInfo.phone}
              onChange={(e) => setCandidateInfo({ ...candidateInfo, phone: e.target.value })}
              placeholder="+58 412 000 0000"
              className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1e2246] outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#626a9f]/15 flex justify-end">
          <button
            type="button"
            disabled={!candidateInfo.firstName.trim() || !candidateInfo.lastName.trim() || !candidateInfo.email.trim()}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentSection(1);
            }}
            className="ola-pt-btn-yellow px-9 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest disabled:opacity-45 cursor-pointer"
          >
            Continue to Rules →
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // SECTION 1: PROCTORING & SECURITY RULES
  // ==========================================
  const renderRules = () => (
    <div className="ola-pt-pop w-full max-w-2xl mx-auto">
      <div className="ola-pt-card-pearl rounded-[2.25rem] p-6 sm:p-9 border-2 border-[#ee665b]/45">
        <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-[#626a9f]/15">
          <div className="w-12 h-12 rounded-2xl bg-[#ee665b] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-white shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <span className="text-[9.5px] font-extrabold uppercase tracking-widest bg-[#fff2f1] text-[#c93f34] px-2.5 py-0.5 rounded-full">
              Proctored Session
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246] tracking-tight mt-1">
              Strict Security Rules
            </h2>
          </div>
        </div>

        <ul className="space-y-3.5 text-xs sm:text-sm font-medium text-[#3b4170]">
          {[
            {
              title: 'No Copying or Pasting',
              desc: 'Clipboard shortcuts and right-click menus are disabled throughout the exam.',
            },
            {
              title: 'Stay on This Screen',
              desc: 'Switching tabs or minimizing the browser triggers a strike. 3 strikes automatically void your test.',
            },
            {
              title: '20-Second Away Limit',
              desc: 'Leaving the exam window for more than 20 uninterrupted seconds voids your progress immediately.',
            },
            {
              title: 'No Screenshots',
              desc: 'Screen capture shortcuts black out the exam and log a security violation.',
            },
          ].map((rule, idx) => (
            <li key={idx} className="flex gap-3.5 items-start bg-[#f4f6fc] border border-white p-4 rounded-2xl shadow-inner">
              <span className="w-7 h-7 rounded-full bg-[#1e2246] text-[#ffc749] text-xs font-extrabold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div>
                <strong className="text-[#1e2246] font-extrabold block mb-0.5">{rule.title}</strong>
                <span>{rule.desc}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-[#626a9f]/15 flex flex-col sm:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentSection(0)}
            className="ola-pt-btn-outline px-6 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentSection(2);
            }}
            className="ola-pt-btn-coral px-9 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer"
          >
            I Understand, Start Test →
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // SECTION 2: GRAMMAR & NUANCE (30 MCQs)
  // ==========================================
  const renderSection1 = () => (
    <div className="ola-pt-pop w-full max-w-4xl mx-auto flex flex-col gap-6 pb-10">
      {/* Dark-Navy Sticky Progress Header */}
      <div className="sticky top-[74px] z-30 bg-[#1e2246] text-white rounded-[1.75rem] px-5 py-4 sm:px-7 shadow-[0_16px_34px_-12px_rgba(30,34,70,0.45)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#ffc749] block">
            Section 1 of 2 • Multiple Choice
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Grammar &amp; Lexical Nuance</h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 sm:w-40 h-2.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffc749] to-[#16a37f] transition-all duration-300"
              style={{ width: `${Math.round((mcqAnsweredCount / MCQ_QUESTIONS.length) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-extrabold text-[#ffc749] whitespace-nowrap">
            {mcqAnsweredCount} / {MCQ_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* 30 Graduated Question Cards */}
      <div className="flex flex-col gap-5">
        {MCQ_QUESTIONS.map((q, index) => (
          <div key={q.id} className="ola-pt-card-pearl rounded-[2rem] p-5 sm:p-7">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-8 h-8 rounded-xl bg-[#1e2246] text-[#ffc749] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#1e2246] leading-snug select-none">
                {q.text}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === opt;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all border-2 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#ffd66b] to-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_4px_0_#1e2246] -translate-y-0.5'
                        : 'bg-white border-[#dfe2f2] hover:border-[#454d82] text-[#1e2246] shadow-sm'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isSelected ? 'bg-[#1e2246] text-[#ffc749]' : 'bg-[#f4f6fc] text-[#454d82]'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm font-bold">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Nav */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentSection(3);
          }}
          className="ola-pt-btn-yellow px-10 py-4 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer"
        >
          Continue to Section 2 ({mcqAnsweredCount}/30) →
        </button>
      </div>
    </div>
  );

  // ==========================================
  // SECTION 3: SPLIT-PANE READING & WRITTEN (20 Questions)
  // ==========================================
  const renderSection2 = () => (
    <div className="ola-pt-pop w-full max-w-7xl mx-auto flex flex-col gap-6 pb-10">
      {/* Dark-Navy Sticky Header */}
      <div className="sticky top-[74px] z-30 bg-[#1e2246] text-white rounded-[1.75rem] px-5 py-4 sm:px-7 shadow-[0_16px_34px_-12px_rgba(30,34,70,0.45)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#ffc749] block">
            Section 2 of 2 • Reading &amp; Written Expression
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            The Evolution of Human Habitats
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowMobilePassage(true)}
            className="lg:hidden px-4 py-2 rounded-full bg-[#ffc749] text-[#1e2246] text-[10.5px] font-extrabold uppercase tracking-wider cursor-pointer"
          >
            Read Passage
          </button>
          <span className="text-xs font-extrabold text-[#ffc749] whitespace-nowrap">
            {writtenAnsweredCount} / {WRITTEN_QUESTIONS.length} Answered
          </span>
        </div>
      </div>

      {/* Split-Pane Grid: Sticky Passage (Left) + 20 Questions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sticky Reading Passage */}
        <aside className="hidden lg:flex lg:col-span-5 flex-col ola-pt-card-pearl rounded-[2rem] p-6 sticky top-[168px] max-h-[calc(100vh-195px)] overflow-hidden select-none">
          <div className="flex items-center justify-between border-b border-[#626a9f]/15 pb-3 mb-4 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full">
              Reading Passage
            </span>
            <span className="text-[10px] font-bold text-[#626a9f] uppercase">5 Paragraphs</span>
          </div>

          <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4 text-sm text-[#282d57] leading-relaxed font-medium">
            {READING_PARAGRAPHS.map((p) => (
              <div key={p.num} className="bg-white/80 border border-white rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#454d82] block mb-1.5">
                  Paragraph {p.num}
                </span>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Written Questions Column */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {WRITTEN_QUESTIONS.map((q) => (
            <div key={q.id} className="ola-pt-card-pearl rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="w-8 h-8 rounded-xl bg-[#5b64a0] text-[#ffc749] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {q.id}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1e2246] leading-snug select-none">
                  {q.text}
                </h3>
              </div>

              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                placeholder="Write your answer manually in English..."
                className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] rounded-2xl p-4 text-sm font-medium text-[#1e2246] outline-none min-h-[120px] resize-y shadow-inner placeholder-[#626a9f]/55"
              />
            </div>
          ))}

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentSection(2);
              }}
              className="ola-pt-btn-outline w-full sm:w-auto px-7 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer"
            >
              ← Back to Section 1
            </button>
            <button
              type="button"
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="ola-pt-btn-mint w-full sm:w-auto px-10 py-4 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Transmitting Exam...' : 'Submit Placement Exam ✓'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Reading Passage Drawer */}
      {showMobilePassage && (
        <div
          onClick={() => setShowMobilePassage(false)}
          className="fixed inset-0 z-[500] bg-[#1e2246]/60 backdrop-blur-xl p-4 flex items-center justify-center lg:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ola-pt-card-pearl ola-pt-pop rounded-[2rem] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-white/80 border-b border-[#626a9f]/15 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1e2246]">
                Reading Passage
              </h3>
              <button
                type="button"
                onClick={() => setShowMobilePassage(false)}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#1e2246] text-[#1e2246] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar space-y-3.5 text-xs sm:text-sm text-[#282d57] leading-relaxed font-medium select-none">
              {READING_PARAGRAPHS.map((p) => (
                <div key={p.num} className="bg-white rounded-2xl p-4 border border-[#dfe2f2]">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#454d82] block mb-1">
                    Paragraph {p.num}
                  </span>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ==========================================
  // SECTION 4: SUBMITTED CONFIRMATION
  // ==========================================
  const renderSubmitted = () => (
    <div className="ola-pt-pop w-full max-w-2xl mx-auto mt-6">
      <div className="ola-pt-card-pearl rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#16a37f] border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246] flex items-center justify-center mb-6 text-white">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-3.5 py-1 rounded-full mb-3">
          Assessment Received
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e2246] tracking-tight mb-4">
          Exam Submitted<span className="text-[#ffc749]">.</span>
        </h2>
        <p className="text-sm sm:text-base text-[#4c5384] font-medium leading-relaxed max-w-lg mb-6">
          Thank you, <strong className="text-[#1e2246]">{candidateInfo.firstName}</strong>. Your grammar and written
          components have been securely transmitted to our academic evaluation team.
        </p>

        <div className="ola-pt-card-gold rounded-2xl p-5 w-full text-center">
          <p className="text-xs sm:text-sm font-extrabold text-[#1e2246]">
            Next Step: Live Oral Evaluation
          </p>
          <p className="text-xs text-[#3b4170] font-medium mt-1">
            Our academic team will contact you shortly to schedule your brief live speaking interview and finalize your CEFR placement.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full font-montserrat text-[#1e2246] flex flex-col pb-20 select-none overflow-x-hidden">
      <PlacementThemeStyles />
      <PlacementBackdrop />

      {/* SCREENSHOT BLACKOUT OVERLAY */}
      {isBlackout && (
        <div className="fixed inset-0 z-[9999] bg-[#1e2246] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#ee665b] border-2 border-white flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#ffc749]">
            Security Violation
          </h1>
          <p className="text-white/80 mt-3 text-xs sm:text-sm font-bold uppercase tracking-widest max-w-md">
            Screenshots, printing, and clipboard actions are strictly blocked during the assessment.
          </p>
        </div>
      )}

      {/* IN-APP SECURITY / STATUS MODAL */}
      {securityModal && (
        <div className="fixed inset-0 z-[9500] bg-[#1e2246]/65 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="ola-pt-card-pearl ola-pt-pop rounded-[2.25rem] p-7 max-w-md w-full text-center border-2 border-[#ee665b]">
            <div
              className={`w-14 h-14 mx-auto mb-4 rounded-2xl border-2 border-[#1e2246] flex items-center justify-center text-white ${
                securityModal.tone === 'danger' ? 'bg-[#ee665b]' : 'bg-[#ffc749] text-[#1e2246]'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-2">
              {securityModal.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#4c5384] font-medium leading-relaxed mb-6">
              {securityModal.message}
            </p>
            <button
              type="button"
              onClick={() => setSecurityModal(null)}
              className="ola-pt-btn-yellow w-full py-3 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* STICKY FLOATING TOP NAVBAR */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-10 py-3.5 bg-white/65 backdrop-blur-2xl border-b border-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <OutLoudHorizontalLogo iconClass="w-9 h-9" wordmarkClass="h-7 w-auto" />
          </div>

          {/* Center Step Pills (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-white/95 border border-white rounded-full p-1 shadow-sm">
            {STEPS.map((step) => {
              const isCurrent = currentSection === step.id;
              const isDone = currentSection > step.id;
              return (
                <span
                  key={step.id}
                  className={`px-3.5 py-1.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider ${
                    isCurrent
                      ? 'bg-[#1e2246] text-[#ffc749]'
                      : isDone
                      ? 'bg-[#e7faf3] text-[#128063]'
                      : 'text-[#626a9f]'
                  }`}
                >
                  {isDone ? '✓ ' : ''}
                  {step.label}
                </span>
              );
            })}
          </div>

          {/* Right Proctor Shield Pill */}
          <div className="shrink-0">
            {isProctored ? (
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 text-[10.5px] font-extrabold uppercase tracking-wider ${
                  strikesLeft <= 1
                    ? 'bg-[#fff2f1] border-[#ee665b] text-[#c93f34] animate-pulse'
                    : 'bg-white border-[#1e2246] text-[#1e2246]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${strikesLeft <= 1 ? 'bg-[#ee665b]' : 'bg-[#16a37f]'}`}
                />
                <span>Proctor: {strikesLeft}/3</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-white/95 border border-white rounded-full px-3.5 py-1.5 shadow-sm">
                <OutLoudIcon className="w-5 h-5" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#454d82]">
                  CEFR Diagnostic
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT STAGE */}
      <main className="relative z-10 flex-1 w-full px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10">
        {currentSection === 0 && renderRegistration()}
        {currentSection === 1 && renderRules()}
        {currentSection === 2 && renderSection1()}
        {currentSection === 3 && renderSection2()}
        {currentSection === 4 && renderSubmitted()}
      </main>
    </div>
  );
};

export default PlacementTest;