import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './SupabaseClient';
import ForumBoard from './ForumBoard';
import SeminarRoom from './SeminarRoom';
import { OutLoudHorizontalLogo, OutLoudIcon } from './components/OutLoudBrand';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const INFO_CATEGORIES = [
  'Website Functionality',
  'General Information',
  'Academy Rules',
  'Upcoming Events',
  'Promos & Discounts',
  'Financial Data',
];

const CAPSTONE_UNITS = [12, 24, 36, 48, 70, 92];

// ==========================================
// 0. DESIGN ENGINE & BACKDROP (OutLoud Landing Grammar)
// ==========================================
const TeacherThemeStyles = () => (
  <style>{`
    .ola-th-canvas {
      background: linear-gradient(125deg, #fdebc0 0%, #f6eff5 44%, #e5e8fa 76%, #d9dff8 100%);
    }
    .ola-th-card-gold {
      background: linear-gradient(160deg, #fff9e8 0%, #ffe69e 100%);
      border: 2px solid #ffffff;
      box-shadow: 0 22px 44px -18px rgba(196, 138, 12, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.96);
    }
    .ola-th-card-indigo {
      background: linear-gradient(160deg, #747db8 0%, #5b64a0 100%);
      border: 2px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 24px 48px -18px rgba(45, 51, 96, 0.38), inset 0 2px 2px rgba(255, 255, 255, 0.25);
    }
    .ola-th-card-pearl {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 244, 253, 0.82) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(55, 63, 118, 0.2), inset 0 2px 2px #ffffff;
    }
    .ola-th-card-mint {
      background: linear-gradient(160deg, rgba(235, 252, 246, 0.95) 0%, rgba(209, 244, 232, 0.82) 100%);
      border: 2px solid rgba(22, 163, 127, 0.45);
      box-shadow: 0 18px 38px -14px rgba(18, 128, 99, 0.22), inset 0 2px 2px #ffffff;
    }
    .ola-th-lift {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease;
    }
    .ola-th-lift:hover {
      transform: translateY(-5px);
    }
    .ola-th-lift:active {
      transform: translateY(-1px) scale(0.99);
      transition-duration: 0.08s;
    }
    .ola-th-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 10px 22px -6px rgba(255, 199, 73, 0.55);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
    }
    .ola-th-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246, 0 14px 26px -6px rgba(255, 199, 73, 0.72);
    }
    .ola-th-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
    }
    .ola-th-btn-outline {
      background: rgba(255, 255, 255, 0.94);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 rgba(30, 34, 70, 0.16);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, background 0.14s ease;
    }
    .ola-th-btn-outline:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #626a9f;
    }
    .ola-th-btn-outline:active {
      transform: translateY(2px) scale(0.99);
      box-shadow: 0 1px 0 rgba(30, 34, 70, 0.2);
    }
    @keyframes olaThModalPop {
      0% { opacity: 0; transform: translateY(14px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ola-th-modal-pop { animation: olaThModalPop 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

    .ola-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .ola-no-scrollbar::-webkit-scrollbar { display: none; }

    @media (max-width: 1023px) {
      .ola-th-card-pearl {
        background: #fdfcf8 !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border: 2px solid rgba(30, 34, 70, 0.14) !important;
        box-shadow: 0 5px 0 rgba(30, 34, 70, 0.08), 0 12px 24px -14px rgba(30, 34, 70, 0.18) !important;
      }
      .ola-th-card-gold,
      .ola-th-card-indigo {
        border: 2px solid #1e2246 !important;
        box-shadow: 0 5px 0 #1e2246 !important;
      }
      .ola-th-card-mint {
        border: 2px solid rgba(22, 163, 127, 0.65) !important;
        box-shadow: 0 5px 0 rgba(18, 128, 99, 0.18) !important;
      }
      .ola-th-lift:hover {
        transform: none !important;
      }
    }
  `}</style>
);

const TeacherBackdrop = () => (
  <div className="ola-th-canvas fixed inset-0 pointer-events-none z-0 overflow-hidden">
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
// 0.1 CUSTOM FLAT DUOTONE VECTOR ILLUSTRATIONS
// ==========================================
const LiveClassIllustration = ({ isReady }) => (
  <svg className="w-40 h-28 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 120" fill="none">
    <path d="M24 28 L26.5 34 L32.5 36.5 L26.5 39 L24 45 L21.5 39 L15.5 36.5 L21.5 34 Z" fill="#626a9f" />
    <circle cx="156" cy="30" r="4" fill={isReady ? '#16a37f' : '#b8bfd9'} />
    <rect x="34" y="24" width="112" height="72" rx="16" fill="#ffffff" stroke="#1e2246" strokeWidth="2.5" />
    <circle cx="90" cy="54" r="16" fill={isReady ? '#ffc749' : '#e8eaf7'} stroke="#1e2246" strokeWidth="2.3" />
    <polygon points="86,47 98,54 86,61" fill="#1e2246" />
    <rect x="56" y="78" width="68" height="7" rx="3.5" fill="#e8eaf7" />
    <rect x="56" y="78" width={isReady ? '42' : '16'} height="7" rx="3.5" fill={isReady ? '#16a37f' : '#9ba3d4'} />
  </svg>
);

const TeachingKitIllustration = () => (
  <svg className="w-40 h-28 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 120" fill="none">
    <path d="M24 26 L26.5 32 L32.5 34.5 L26.5 37 L24 43 L21.5 37 L15.5 34.5 L21.5 32 Z" fill="#ffc749" />
    <rect x="34" y="24" width="54" height="70" rx="10" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
    <rect x="88" y="24" width="54" height="70" rx="10" fill="#fff9e8" stroke="#1e2246" strokeWidth="2.4" />
    <rect x="44" y="38" width="28" height="6" rx="3" fill="#626a9f" />
    <rect x="44" y="50" width="34" height="4.5" rx="2.25" fill="#d5daf2" />
    <rect x="44" y="60" width="26" height="4.5" rx="2.25" fill="#d5daf2" />
    <rect x="98" y="38" width="32" height="12" rx="6" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
    <rect x="98" y="58" width="28" height="4.5" rx="2.25" fill="#626a9f" opacity="0.45" />
    <circle cx="144" cy="84" r="14" fill="#16a37f" stroke="#1e2246" strokeWidth="2.4" />
    <path d="M138 84 L142 88 L150 80" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RosterIllustration = () => (
  <svg className="w-36 h-24 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 110" fill="none">
    <rect x="40" y="22" width="76" height="68" rx="12" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
    <path d="M40 34 C40 27.37 45.37 22 52 22 H104 C110.63 22 116 27.37 116 34 V40 H40 V34 Z" fill="#626a9f" stroke="#1e2246" strokeWidth="2.4" />
    <rect x="57" y="14" width="6" height="14" rx="3" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
    <rect x="93" y="14" width="6" height="14" rx="3" fill="#ffc749" stroke="#1e2246" strokeWidth="2" />
    <rect x="50" y="50" width="24" height="24" rx="6" fill="#fff3d1" stroke="#ffc749" strokeWidth="1.8" />
    <rect x="82" y="50" width="24" height="24" rx="6" fill="#454d82" />
    <text x="62" y="66" textAnchor="middle" fill="#1e2246" fontSize="10" fontWeight="800">7D</text>
    <text x="94" y="66" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">LAB</text>
  </svg>
);

const GradingIllustration = ({ hasPending }) => (
  <svg className="w-36 h-24 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 110" fill="none">
    <rect x="46" y="18" width="64" height="74" rx="12" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
    <rect x="64" y="12" width="28" height="12" rx="5" fill="#626a9f" stroke="#1e2246" strokeWidth="2" />
    <rect x="58" y="38" width="38" height="5" rx="2.5" fill="#d5daf2" />
    <rect x="58" y="50" width="30" height="5" rx="2.5" fill="#d5daf2" />
    <rect x="58" y="62" width="24" height="5" rx="2.5" fill="#d5daf2" />
    <circle cx="110" cy="74" r="15" fill={hasPending ? '#ee665b' : '#16a37f'} stroke="#1e2246" strokeWidth="2.4" />
    {hasPending ? (
      <text x="110" y="79" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="800">!</text>
    ) : (
      <path d="M103 74 L108 79 L117 69" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const CommunityIllustration = () => (
  <svg className="w-36 h-24 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 110" fill="none">
    <rect x="24" y="20" width="74" height="44" rx="14" fill="#626a9f" stroke="#1e2246" strokeWidth="2.4" />
    <circle cx="48" cy="42" r="3.5" fill="#ffc749" />
    <circle cx="62" cy="42" r="3.5" fill="#ffffff" />
    <circle cx="76" cy="42" r="3.5" fill="#ffffff" />
    <rect x="62" y="44" width="74" height="44" rx="14" fill="#ffc749" stroke="#1e2246" strokeWidth="2.4" />
    <rect x="78" y="60" width="42" height="5" rx="2.5" fill="#1e2246" />
    <rect x="78" y="71" width="26" height="5" rx="2.5" fill="#1e2246" opacity="0.45" />
  </svg>
);

// ==========================================
// 1. PROFILE MENU OVERLAY (Light Glass)
// ==========================================
const ProfileOverlay = ({ isOpen, onClose, teacher, pendingCount, onOpenEvaluations, onLogout }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1e2246]/65 sm:backdrop-blur-xl font-montserrat"
      onClick={onClose}
    >
      <div
        className="ola-th-card-pearl ola-th-modal-pop rounded-t-[2rem] sm:rounded-[2.25rem] p-5 sm:p-6 pb-8 sm:pb-6 w-full sm:max-w-sm flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-[#1e2246]/20 mx-auto mb-1" />
        <div className="flex items-center gap-3.5 border-b border-[#626a9f]/15 pb-4 mb-1">
          <img
            src={
              teacher?.avatar_url ||
              `https://ui-avatars.com/api/?name=${teacher?.first_name || 'T'}+${teacher?.last_name || ''}&background=626a9f&color=fff`
            }
            className="w-14 h-14 rounded-2xl border-2 border-[#1e2246] object-cover shrink-0 bg-[#e8eaf7]"
            alt="Profile"
          />
          <div className="flex flex-col min-w-0">
            <h3 className="text-[#1e2246] font-extrabold text-base truncate">
              {teacher?.first_name || 'Teacher'} {teacher?.last_name || ''}
            </h3>
            <span className="inline-block w-fit text-[9.5px] font-extrabold tracking-widest uppercase bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full mt-1">
              Instructor
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenEvaluations();
          }}
          className="w-full py-3.5 bg-white hover:bg-[#fff3d1] border border-[#dfe2f2] text-[#1e2246] rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-colors text-left px-4 flex justify-between items-center cursor-pointer"
        >
          <span>Pending Gradings</span>
          {pendingCount > 0 && (
            <span className="bg-[#ee665b] text-white text-[10px] px-2.5 py-0.5 rounded-full font-extrabold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3.5 bg-[#fff2f1] hover:bg-[#ee665b] text-[#c93f34] hover:text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-colors text-left px-4 border border-[#ee665b]/35 cursor-pointer"
        >
          Log Out / Return Home
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. FLOATING JITSI CONTROLLER (30s Heartbeat)
// ==========================================
const JitsiRoom = ({ session, teacher, onLeave }) => {
  useEffect(() => {
    const roomUrl = `https://meet.jit.si/OLA-Unit${session.unit}-${session.id}#config.prejoinPageEnabled=false`;
    const jitsiTab = window.open(roomUrl, '_blank');

    const heartbeat = setInterval(async () => {
      if (jitsiTab && jitsiTab.closed) {
        clearInterval(heartbeat);
        return;
      }

      await supabase
        .from('live_sessions')
        .update({ last_ping_at: new Date().toISOString() })
        .eq('id', session.id);
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [session, teacher]);

  const handleEndClass = async () => {
    await supabase
      .from('live_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        actual_end_at: new Date().toISOString(),
      })
      .eq('id', session.id);
    onLeave();
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[9999] bg-[#1e2246] text-white border-2 border-[#ffc749] shadow-[0_20px_44px_-12px_rgba(30,34,70,0.6)] rounded-[2rem] p-5 sm:max-w-xs sm:w-full text-center flex flex-col items-center font-montserrat">
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-3 h-3 bg-[#ee665b] rounded-full animate-pulse shadow-[0_0_12px_#ee665b]" />
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#ffc749]">
          Class in Progress • U{session.unit}
        </h2>
      </div>
      <p className="text-[11px] font-medium text-white/80 mb-4 leading-relaxed">
        Video is open in a new tab. You can safely browse Manuals and Cue Cards here.
      </p>
      <button
        type="button"
        onClick={handleEndClass}
        className="w-full py-3 bg-[#ee665b] hover:brightness-110 text-white border-2 border-white/25 font-extrabold text-[11px] uppercase tracking-widest rounded-full transition-all cursor-pointer"
      >
        End Class &amp; Grade →
      </button>
    </div>
  );
};

// ==========================================
// 3. EVALUATION MODAL (Gatekeeper — Light Glass)
// ==========================================
const EvaluationModal = ({ isOpen, onClose, pendingClasses, onGradeSubmitted, teacherId }) => {
  const [scores, setScores] = useState({ listening: 0, speaking: 0, reading: 0, writing: 0, grammar: 0 });
  const [deductions, setDeductions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || pendingClasses.length === 0) return null;

  const currentEvaluation = pendingClasses[0];

  const criteria = [
    { id: 'listening', title: 'Listening', desc: 'Aural comprehension and responsiveness to live instructions.' },
    { id: 'speaking', title: 'Speaking', desc: 'Verbal fluency, pronunciation, and conversational interaction.' },
    { id: 'reading', title: 'Reading', desc: 'Textual interpretation and reading comprehension.' },
    { id: 'writing', title: 'Writing', desc: 'Structural output, spelling, and sentence formulation.' },
    { id: 'grammar', title: 'Grammar', desc: 'Syntactic accuracy and target structure application.' },
  ];

  const deductionOptions = [
    { id: 'd1', label: 'Pronunciation / L1 Interference', penalty: 0.5 },
    { id: 'd2', label: 'Minor Grammatical Slips', penalty: 0.5 },
    { id: 'd3', label: 'Over-reliance on Fillers (Uh/Um)', penalty: 0.5 },
    { id: 'd4', label: 'Hesitation / Pacing Issues', penalty: 0.5 },
    { id: 'd5', label: 'Incomplete Task Fulfillment', penalty: 1.0 },
    { id: 'd6', label: 'Severe Lexical Range Deficit', penalty: 1.0 },
  ];

  const baseScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const deductionTotal = deductionOptions.reduce((total, opt) => (deductions[opt.id] ? total + opt.penalty : total), 0);
  const finalScore = Math.max(0, baseScore - deductionTotal);

  const isPassed = finalScore >= 13.5;
  const isComplete =
    scores.listening > 0 && scores.speaking > 0 && scores.reading > 0 && scores.writing > 0 && scores.grammar > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const activeDeds = deductionOptions
        .filter((d) => deductions[d.id])
        .map((d) => d.label)
        .join(', ');
      const notes = `L:${scores.listening}/4 | S:${scores.speaking}/4 | R:${scores.reading}/4 | W:${scores.writing}/4 | G:${scores.grammar}/4. Deductions: ${
        activeDeds || 'None'
      }.`;

      await supabase.from('academic_records').insert({
        student_id: currentEvaluation.student_id,
        teacher_id: teacherId,
        unit: currentEvaluation.unit,
        activity_type: 'Live Class',
        score_percentage: (finalScore / 20) * 100,
        teacher_notes: notes,
      });

      await supabase
        .from('live_sessions')
        .update({
          is_graded: true,
          grading_completed_at: new Date().toISOString(),
        })
        .eq('id', currentEvaluation.id);

      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('unit, unit_fail_count')
        .eq('id', currentEvaluation.student_id)
        .single();

      if (isPassed) {
        const isCapstone = CAPSTONE_UNITS.includes(currentEvaluation.unit);
        if (isCapstone) {
          await supabase
            .from('profiles')
            .update({
              level_completed: true,
              lesson_score: 0,
              workbook_score: 0,
              unit_fail_count: 0,
            })
            .eq('id', currentEvaluation.student_id);
        } else {
          await supabase
            .from('profiles')
            .update({
              unit: (studentProfile.unit || 1) + 1,
              lesson_score: 0,
              workbook_score: 0,
              unit_fail_count: 0,
            })
            .eq('id', currentEvaluation.student_id);
        }
      } else {
        await supabase
          .from('profiles')
          .update({
            unit_fail_count: (studentProfile.unit_fail_count || 0) + 1,
          })
          .eq('id', currentEvaluation.student_id);
      }

      setScores({ listening: 0, speaking: 0, reading: 0, writing: 0, grammar: 0 });
      setDeductions({});
      onGradeSubmitted(currentEvaluation.id);
      if (pendingClasses.length <= 1) onClose();
    } catch (error) {
      console.error('Evaluation Saving Error:', error);
      alert('Hubo un error al guardar la evaluación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1e2246]/65 md:backdrop-blur-xl font-montserrat overflow-y-auto">
      <div className="ola-th-card-pearl ola-th-modal-pop relative w-full max-w-3xl rounded-t-[2rem] md:rounded-[2.25rem] flex flex-col overflow-hidden md:my-auto max-h-[92dvh]">
        <div className="md:hidden pt-3 pb-1 bg-[#fdfcf8] shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[#1e2246]/20 mx-auto" />
        </div>
        <div className="p-5 sm:p-7 border-b border-[#626a9f]/15 bg-white/75 flex justify-between items-start gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-2.5 py-0.5 rounded-full">
                5-Min Grading Window
              </span>
              {pendingClasses.length > 1 && (
                <span className="bg-[#ee665b] text-white text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {pendingClasses.length} Pending
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight">
              Live Class Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-[#4c5384] font-semibold mt-0.5">
              Student: <strong className="text-[#1e2246]">{currentEvaluation.student_name}</strong> • Unit{' '}
              {currentEvaluation.unit}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-[10.5px] font-extrabold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2">
            5 Core Competencies (4 pts each)
          </h3>

          <div className="space-y-3">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="bg-white border border-[#dfe2f2] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-sm"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-extrabold text-[#1e2246] uppercase tracking-tight">{crit.title}</h4>
                  <p className="text-xs text-[#50567d] font-medium">{crit.desc}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {[1, 2, 3, 4].map((val) => {
                    const active = scores[crit.id] === val;
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setScores((prev) => ({ ...prev, [crit.id]: val }))}
                        className={`flex-1 md:w-12 h-10 rounded-xl text-xs font-extrabold border-2 transition-all cursor-pointer ${
                          active
                            ? 'bg-[#ffc749] text-[#1e2246] border-[#1e2246] shadow-[0_3px_0_#1e2246] -translate-y-0.5'
                            : 'bg-[#f4f6fc] text-[#454d82] border-transparent hover:border-[#626a9f]/45'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-[10.5px] font-extrabold text-[#c93f34] uppercase tracking-widest border-b border-[#ee665b]/25 pb-2 pt-2">
            Paralinguistic Deductions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#fff2f1] border border-[#ee665b]/35 rounded-2xl p-4">
            {deductionOptions.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer bg-white/85 p-2.5 rounded-xl border border-white">
                <input
                  type="checkbox"
                  checked={deductions[opt.id] || false}
                  onChange={(e) => setDeductions((prev) => ({ ...prev, [opt.id]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#ee665b] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#1e2246] flex-1">{opt.label}</span>
                <span className="text-[#c93f34] font-extrabold text-[10px] bg-[#ee665b]/15 px-2 py-0.5 rounded-full">
                  -{opt.penalty}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-white/80 border-t border-[#626a9f]/15 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div>
              <span className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest block">Final Score</span>
              <span className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest">
                Pass Threshold: 13.5 / 20
              </span>
            </div>
            <div
              className={`text-4xl sm:text-5xl font-extrabold ${
                finalScore === 0 ? 'text-[#626a9f]/35' : isPassed ? 'text-[#128063]' : 'text-[#c93f34]'
              }`}
            >
              {finalScore.toFixed(1)}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="ola-th-btn-outline flex-1 md:flex-none px-6 py-3.5 font-bold text-xs uppercase rounded-full cursor-pointer"
            >
              Postpone
            </button>
            <button
              type="button"
              disabled={!isComplete || isSubmitting}
              onClick={handleSubmit}
              className={`flex-[2] md:flex-none px-7 py-3.5 font-extrabold text-xs uppercase tracking-widest rounded-full border-2 transition-all ${
                !isComplete
                  ? 'bg-[#e8eaf7] text-[#626a9f] border-transparent cursor-not-allowed'
                  : isPassed
                  ? 'bg-[#16a37f] text-white border-[#1e2246] shadow-[0_4px_0_#1e2246] cursor-pointer hover:-translate-y-0.5'
                  : 'bg-[#ee665b] text-white border-[#1e2246] shadow-[0_4px_0_#1e2246] cursor-pointer hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? 'Saving...' : isPassed ? 'Approve Student ✓' : 'Fail & Require Tutoring'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. TEACHER 7-DAY ROSTER MODAL (Light Glass)
// ==========================================
const TeacherRosterModal = ({ isOpen, onClose, teacherId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !teacherId) return;
    const fetchRoster = async () => {
      setLoading(true);
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data } = await supabase
        .from('live_sessions')
        .select('*, student:profiles!student_id(first_name, last_name)')
        .eq('teacher_id', teacherId)
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', nextWeek.toISOString())
        .order('scheduled_at', { ascending: true });

      if (data) setSessions(data);
      setLoading(false);
    };
    fetchRoster();
  }, [isOpen, teacherId]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[250] flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1e2246]/65 md:backdrop-blur-xl font-montserrat"
    >
      <div className="ola-th-card-pearl ola-th-modal-pop relative w-full max-w-2xl rounded-t-[2rem] md:rounded-[2.25rem] flex flex-col max-h-[88dvh] overflow-hidden">
        <div className="md:hidden pt-3 pb-1 bg-[#fdfcf8] shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[#1e2246]/20 mx-auto" />
        </div>
        <div className="p-5 sm:p-6 border-b border-[#626a9f]/15 flex justify-between items-center bg-white/75 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82] block">
              Next 7 Days
            </span>
            <h2 className="text-xl font-extrabold text-[#1e2246] uppercase tracking-tight">My Schedule</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-[#626a9f] font-bold uppercase tracking-widest text-xs py-12">
              No classes scheduled for the next 7 days.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((s) => {
                const d = new Date(s.scheduled_at);
                const isBooked = s.status === 'booked' || s.status === 'completed';
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-sm ${
                      isBooked
                        ? 'bg-gradient-to-r from-[#fff9e8] to-[#ffe69e] border-[#ffc749]'
                        : 'bg-white border-white'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold uppercase tracking-wider text-xs sm:text-sm text-[#1e2246]">
                        {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} @{' '}
                        {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="text-[#4c5384] text-xs font-semibold mt-1 truncate">
                        {isBooked
                          ? `Student: ${s.student?.first_name || 'Estudiante'} ${s.student?.last_name || ''} • U${s.unit || 1}`
                          : 'Open Slot (Available)'}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-bold text-[#626a9f] uppercase">{s.class_type}</span>
                      {isBooked ? (
                        <span className="bg-[#1e2246] text-[#ffc749] text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 uppercase">
                          Booked
                        </span>
                      ) : (
                        <span className="bg-[#e7faf3] text-[#128063] text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 uppercase">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. TEACHER PDF VIEWER (Glass Shielded — Light Glass)
// ==========================================
const TeacherPdfViewerModal = ({ isOpen, type, onClose, defaultUnit }) => {
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedUnit, setSelectedUnit] = useState(defaultUnit || 1);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPdf = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('content_blueprints')
        .select('blueprint_data')
        .ilike('level', `${selectedLevel}%`)
        .ilike('unit', `Unit ${selectedUnit}`)
        .eq('content_type', type)
        .maybeSingle();

      setPdfUrl(data?.blueprint_data?.pdfUrl || '');
      setLoading(false);
    };
    fetchPdf();
  }, [isOpen, selectedLevel, selectedUnit, type]);

  if (!isOpen) return null;

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const getUnitRange = (lvl) => {
    const bounds = { A1: 12, A2: 24, B1: 36, B2: 48, C1: 70, C2: 92 }[lvl] || 12;
    const start = { A1: 1, A2: 13, B1: 25, B2: 37, C1: 49, C2: 71 }[lvl] || 1;
    return Array.from({ length: bounds - start + 1 }, (_, i) => start + i);
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-[#1e2246]/65 backdrop-blur-xl font-montserrat"
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none' }}
    >
      <div className="ola-th-card-pearl ola-th-modal-pop relative w-full max-w-5xl rounded-[2.25rem] flex flex-col h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#626a9f]/15 flex flex-wrap justify-between items-center gap-3 bg-white/80 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[9.5px] font-bold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-2.5 py-0.5 rounded-full">
                Proprietary OutLoud Material
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1e2246] uppercase tracking-tight mt-1">
                {type}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setSelectedUnit(getUnitRange(e.target.value)[0]);
                }}
                className="bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] text-[#1e2246] text-xs font-bold uppercase rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                {levels.map((l) => (
                  <option key={l} value={l}>
                    Level {l}
                  </option>
                ))}
              </select>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] text-[#1e2246] text-xs font-bold uppercase rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                {getUnitRange(selectedLevel).map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-[#ee665b] hover:text-white border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-5 flex flex-col items-center justify-center bg-[#f4f6fc] relative overflow-hidden">
          {CAPSTONE_UNITS.includes(Number(selectedUnit)) && (
            <div className="w-full mb-3 bg-gradient-to-r from-[#fff9e8] to-[#ffe69e] text-[#1e2246] p-3.5 rounded-2xl border-2 border-[#1e2246] shadow-sm flex flex-col gap-0.5 shrink-0">
              <h4 className="font-extrabold uppercase tracking-wider text-xs">
                Capstone Unit Protocol (Unit {selectedUnit})
              </h4>
              <p className="text-[11px] font-semibold leading-snug text-[#3b4170]">
                Focus on praising progress, reviewing key concepts, and reminding the student to contact Support to process their Level Renewal.
              </p>
            </div>
          )}

          {loading ? (
            <div className="w-10 h-10 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
          ) : pdfUrl ? (
            <div className="w-full flex-1 relative rounded-2xl overflow-hidden border-2 border-white bg-white shadow-md">
              {/* THE GLASS SHIELD: Blocks clicks on the top toolbar where download/print buttons live */}
              <div
                className="absolute top-0 left-0 right-0 h-[60px] bg-transparent z-50 cursor-not-allowed"
                title="Downloading disabled for proprietary materials"
              />
              <iframe
                src={pdfUrl.includes('google.com') ? pdfUrl.replace('/view', '/preview') : `${pdfUrl}#toolbar=0`}
                className="w-full h-full border-none pointer-events-auto"
                title="Secure PDF Viewer"
              />
            </div>
          ) : (
            <div className="text-center text-[#626a9f] flex flex-col items-center">
              <h3 className="font-extrabold uppercase tracking-widest text-sm text-[#1e2246]">
                No Document Available
              </h3>
              <p className="text-xs font-medium mt-1">
                There is no {type} uploaded for {selectedLevel} Unit {selectedUnit} yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. TEACHER METRICS & PAYROLL MODAL (Light Glass)
// ==========================================
const TeacherMetricsModal = ({ isOpen, onClose, teacherId, teacherData }) => {
  const [activeTab, setActiveTab] = useState('PAYROLL');
  const [infoOverlay, setInfoOverlay] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opMetrics, setOpMetrics] = useState(null);
  const [opScore, setOpScore] = useState(0);

  useEffect(() => {
    if (!isOpen || !teacherId) return;
    const fetchMetrics = async () => {
      setLoading(true);
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: sessionData } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('status', 'completed')
        .gte('scheduled_at', firstDayOfMonth)
        .order('scheduled_at', { ascending: false });
      if (sessionData) setSessions(sessionData);

      const { data: shiftData } = await supabase
        .from('teacher_shifts')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('shift_date', firstDayOfMonth)
        .order('shift_date', { ascending: false });
      if (shiftData) setShifts(shiftData);

      const { data: evalData } = await supabase.from('class_evaluations').select('*').eq('teacher_id', teacherId);
      if (evalData) setEvaluations(evalData);

      let punctualityScore = 100;
      let responsibilityScore = 100;
      let socialScore = 100;
      let teachingScore = 100;
      let passRateScore = 100;

      const { data: allSessions } = await supabase.from('live_sessions').select('*').eq('teacher_id', teacherId);

      if (allSessions && allSessions.length > 0) {
        const standardClasses = allSessions.filter(
          (s) => s.status === 'completed' && (!s.class_type || !s.class_type.toLowerCase().includes('social'))
        );
        if (standardClasses.length > 0) {
          let totalPunctuality = 0;
          standardClasses.forEach((c) => {
            const sched = new Date(c.scheduled_at);
            const prepStart = c.prep_started_at
              ? new Date(c.prep_started_at)
              : new Date(sched.getTime() - 10 * 60000);
            const actualStart = c.actual_start_at ? new Date(c.actual_start_at) : sched;
            const actualEnd = c.ended_at ? new Date(c.ended_at) : new Date(sched.getTime() + 45 * 60000);
            const gradedAt = c.graded_at ? new Date(c.graded_at) : new Date(actualEnd.getTime() + 5 * 60000);

            let classMins = 60;
            const prepDiff = (sched - prepStart) / 60000;
            if (prepDiff < 10) classMins -= 10 - Math.max(0, prepDiff);
            const startDelay = (actualStart - sched) / 60000;
            if (startDelay > 0) classMins -= startDelay;
            const endEarly = (new Date(sched.getTime() + 45 * 60000) - actualEnd) / 60000;
            if (endEarly > 0) classMins -= endEarly;
            const gradeDelay = (gradedAt - actualEnd) / 60000;
            if (gradeDelay > 5) classMins -= Math.min(6, gradeDelay - 5);

            totalPunctuality += Math.max(0, (classMins / 60) * 100);
          });
          punctualityScore = Math.round(totalPunctuality / standardClasses.length);
        }

        const cancelledCount = allSessions.filter(
          (s) => s.status === 'cancelled' && s.cancelled_by === teacherId
        ).length;
        responsibilityScore -= cancelledCount * 15;

        const socialClasses = allSessions.filter(
          (s) => s.class_type && s.class_type.toLowerCase().includes('social')
        );
        if (socialClasses.length > 0) {
          const successfulSocials = socialClasses.filter((s) => {
            if (s.status !== 'completed') return false;
            const start = new Date(s.actual_start_at || s.scheduled_at);
            const end = new Date(s.ended_at || new Date(start.getTime() + 60 * 60000));
            return (end - start) / 60000 >= 55;
          }).length;
          socialScore = Math.round((successfulSocials / socialClasses.length) * 100);
        }
      }

      const { data: allShifts } = await supabase.from('teacher_shifts').select('status').eq('teacher_id', teacherId);
      if (allShifts && allShifts.length > 0) {
        const missedShifts = allShifts.filter((s) => s.status === 'missed').length;
        responsibilityScore -= missedShifts * 10;
      }
      responsibilityScore = Math.max(0, responsibilityScore);

      if (teacherData && teacherData.total_rating_questions > 0) {
        teachingScore = Math.round((teacherData.total_positive_ratings / teacherData.total_rating_questions) * 100);
      } else {
        teachingScore = 95;
      }

      const { data: supervision } = await supabase
        .from('engine_teacher_supervision')
        .select('teacher_fail_rate')
        .eq('teacher_id', teacherId)
        .maybeSingle();
      if (supervision && supervision.teacher_fail_rate !== null) {
        passRateScore = Math.round(100 - supervision.teacher_fail_rate * 100);
      } else {
        passRateScore = 92;
      }

      setOpMetrics([
        { subject: 'Puntualidad', score: punctualityScore, fullMark: 100 },
        { subject: 'Responsabilidad', score: responsibilityScore, fullMark: 100 },
        { subject: 'Pedagogía', score: teachingScore, fullMark: 100 },
        { subject: 'Aprobación', score: passRateScore, fullMark: 100 },
        { subject: 'Eventos Sociales', score: socialScore, fullMark: 100 },
      ]);
      setOpScore(Math.round((punctualityScore + responsibilityScore + teachingScore + passRateScore + socialScore) / 5));

      setLoading(false);
    };
    fetchMetrics();
  }, [isOpen, teacherId, teacherData]);

  if (!isOpen) return null;

  const totalSessionPay = sessions.reduce((sum, s) => sum + (Number(s.final_pay) || 0), 0);
  const totalShiftBonus = shifts.reduce((sum, s) => sum + (Number(s.bonus_earned) || 0), 0);
  const totalEarned = (totalSessionPay + totalShiftBonus).toFixed(2);

  const totalEvals = evaluations.length;
  let radarData = [
    { subject: 'Actitud', A: 100 },
    { subject: 'Claridad', A: 100 },
    { subject: 'Participación', A: 100 },
    { subject: 'Contenido', A: 100 },
    { subject: 'Tiempo', A: 100 },
  ];
  let globalRating = '5.0';

  if (totalEvals > 0) {
    const sum = (key) => evaluations.filter((e) => e[key] === true).length;
    radarData = [
      { subject: 'Actitud', A: (sum('q_demeanor') / totalEvals) * 100 },
      { subject: 'Claridad', A: (sum('q_clarity') / totalEvals) * 100 },
      { subject: 'Participación', A: (sum('q_facilitation') / totalEvals) * 100 },
      { subject: 'Contenido', A: (sum('q_content') / totalEvals) * 100 },
      { subject: 'Tiempo', A: (sum('q_time') / totalEvals) * 100 },
    ];
    const totalPositives =
      sum('q_demeanor') + sum('q_clarity') + sum('q_facilitation') + sum('q_content') + sum('q_time');
    globalRating = ((totalPositives / (totalEvals * 5)) * 5).toFixed(1);
  } else if (teacherData?.total_rating_questions > 0) {
    globalRating = ((teacherData.total_positive_ratings / teacherData.total_rating_questions) * 5).toFixed(1);
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[700] flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1e2246]/65 md:backdrop-blur-xl font-montserrat"
    >
      {/* INFO OVERLAYS */}
      {infoOverlay && (
        <div
          className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-[#1e2246]/65 backdrop-blur-md"
          onClick={() => setInfoOverlay(null)}
        >
          <div
            className="ola-th-card-pearl ola-th-modal-pop rounded-[2.25rem] p-6 sm:p-8 max-w-lg w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 border-b border-[#626a9f]/15 pb-3">
              <h3 className="text-lg font-extrabold text-[#1e2246] uppercase tracking-tight">
                {infoOverlay === 'time'
                  ? 'How Your Time is Calculated'
                  : infoOverlay === 'shift'
                  ? 'Standby Shifts'
                  : 'Your Performance Breakdown'}
              </h3>
              <button
                type="button"
                onClick={() => setInfoOverlay(null)}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#1e2246] text-[#1e2246] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm text-[#3b4170] font-medium leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {infoOverlay === 'time' && (
                <>
                  <p>Your standard billable block is exactly 60 minutes, strictly segmented into three phases:</p>
                  <ul className="list-disc pl-5 space-y-2 text-[#1e2246]">
                    <li><strong>Prep (10 mins max):</strong> Starts when you open your manual before class.</li>
                    <li><strong>Live Class (45 mins max):</strong> Starts when you enter Jitsi. Ending early or joining late deducts minutes.</li>
                    <li><strong>Grading (5 mins max):</strong> Stops when you submit the final evaluation.</li>
                  </ul>
                  <p className="text-[#c93f34] font-bold">
                    Overtime is not paid and is discouraged as it affects student schedules.
                  </p>
                </>
              )}
              {infoOverlay === 'shift' && (
                <>
                  <p>A Standby Shift is a 12-hour window (7:30 AM – 7:30 PM) assigned by Administration.</p>
                  <p>
                    Maintain a stable connection to earn the flat <strong className="text-[#128063]">$2.00 bonus</strong>. Any class covered during the shift pays your standard hourly rate on top of the bonus.
                  </p>
                </>
              )}
              {infoOverlay === 'report' && (
                <>
                  <p>
                    Your Star Rating reflects post-class student evaluations. An average ≥ 90% in a class with 5+ students earns an instant <strong className="text-[#128063]">$1.00 Excellence Bonus</strong>.
                  </p>
                  <ul className="space-y-2.5">
                    <li><strong>Actitud:</strong> Espacio seguro, paciencia y trato acogedor.</li>
                    <li><strong>Claridad:</strong> Vocabulario adaptado al nivel CEFR y ejemplos claros.</li>
                    <li><strong>Participación:</strong> Balance de conversación (STT &gt; TTT).</li>
                    <li><strong>Contenido:</strong> Uso fluido de manuales y flashcards.</li>
                    <li><strong>Tiempo:</strong> Precisión en el bloque de 45 minutos.</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="ola-th-card-pearl ola-th-modal-pop relative w-full max-w-4xl rounded-t-[2rem] md:rounded-[2.25rem] flex flex-col h-[90dvh] md:h-[85vh] overflow-hidden">
        <div className="md:hidden pt-3 pb-1 bg-[#fdfcf8] shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[#1e2246]/20 mx-auto" />
        </div>
        <div className="flex flex-col border-b border-[#626a9f]/15 shrink-0 bg-white/80 pt-5 px-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold text-[#128063] uppercase tracking-widest block">
                OutLoud Instructor
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246]">Metrics &amp; Payroll</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-1.5 bg-[#e8eaf7] p-1 rounded-full border border-white">
            {['PAYROLL', 'SHIFTS', 'PERFORMANCE'].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-4 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-9 h-9 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
            </div>
          ) : activeTab === 'PAYROLL' ? (
            <div className="flex flex-col gap-5 h-full">
              <div className="ola-th-card-mint rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#128063] uppercase tracking-widest mb-1">
                    Current Month Payout
                  </p>
                  <h3 className="text-4xl font-extrabold text-[#1e2246]">
                    ${totalEarned} <span className="text-base font-bold text-[#4c5384]">USD</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOverlay('time')}
                  className="px-4 py-2 rounded-full bg-white border-2 border-[#1e2246] text-[#1e2246] text-[10.5px] font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  How time is calculated ?
                </button>
              </div>

              <div className="flex-1 bg-white border border-[#dfe2f2] rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 p-3.5 bg-[#f4f6fc] border-b border-[#dfe2f2] text-[9.5px] font-extrabold text-[#454d82] uppercase tracking-widest">
                  <div className="col-span-2">Session Date</div>
                  <div className="hidden md:block">Base Rate</div>
                  <div className="text-center text-[#c93f34]">Penalty</div>
                  <div className="text-center text-[#b37a00]">Bonus</div>
                  <div className="text-right text-[#128063]">Final Pay</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {sessions.length === 0 ? (
                    <div className="text-center py-10 text-[#626a9f] font-bold uppercase tracking-widest text-xs">
                      No classes completed this month.
                    </div>
                  ) : (
                    sessions.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-[#f9fafe] rounded-xl border border-[#dfe2f2] text-xs items-center"
                      >
                        <div className="col-span-2 font-bold text-[#1e2246] truncate">
                          {new Date(s.scheduled_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="hidden md:block text-[#4c5384] font-semibold">
                          ${s.base_rate_applied || '0.00'}
                        </div>
                        <div className="text-center font-extrabold text-[#c93f34]">${s.minute_penalty || '0.00'}</div>
                        <div className="text-center font-extrabold text-[#b37a00]">
                          ${s.performance_bonus || '0.00'}
                        </div>
                        <div className="text-right font-extrabold text-[#128063]">${s.final_pay || '0.00'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'SHIFTS' ? (
            <div className="flex flex-col gap-5 h-full">
              <div className="ola-th-card-gold rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1">
                    Total Shift Bonuses
                  </p>
                  <h3 className="text-4xl font-extrabold text-[#1e2246]">
                    ${totalShiftBonus.toFixed(2)} <span className="text-base font-bold text-[#4c5384]">USD</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOverlay('shift')}
                  className="px-4 py-2 rounded-full bg-white border-2 border-[#1e2246] text-[#1e2246] text-[10.5px] font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  What is a shift ?
                </button>
              </div>

              <div className="flex-1 bg-white border border-[#dfe2f2] rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="grid grid-cols-3 gap-2 p-3.5 bg-[#f4f6fc] border-b border-[#dfe2f2] text-[9.5px] font-extrabold text-[#454d82] uppercase tracking-widest">
                  <div>Assigned Date</div>
                  <div className="text-center">Status</div>
                  <div className="text-right text-[#b37a00]">Bonus Earned</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {shifts.length === 0 ? (
                    <div className="text-center py-10 text-[#626a9f] font-bold uppercase tracking-widest text-xs">
                      No shifts assigned this month.
                    </div>
                  ) : (
                    shifts.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-3 gap-2 p-3.5 bg-[#f9fafe] rounded-xl border border-[#dfe2f2] text-xs items-center"
                      >
                        <div className="font-bold text-[#1e2246]">
                          {new Date(s.shift_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9.5px] font-extrabold uppercase ${
                              s.status === 'completed'
                                ? 'bg-[#e7faf3] text-[#128063]'
                                : s.status === 'missed'
                                ? 'bg-[#fff2f1] text-[#c93f34]'
                                : 'bg-[#e8eaf7] text-[#454d82]'
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>
                        <div className="text-right font-extrabold text-[#1e2246]">
                          ${s.bonus_earned || '0.00'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner flex flex-col items-center">
                <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mb-1">
                  Calificación Pedagógica
                </p>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-5xl font-extrabold text-[#1e2246]">{globalRating}</span>
                  <span className="text-xl font-bold text-[#626a9f]">/ 5.0</span>
                </div>
                <div className="w-full h-[230px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(98,106,159,0.25)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b4170', fontSize: 10.5, fontWeight: 700 }} />
                      <Radar name="Pedagogical" dataKey="A" stroke="#454d82" strokeWidth={2.5} fill="#ffc749" fillOpacity={0.55} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOverlay('report')}
                  className="ola-th-btn-yellow w-full py-3 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest cursor-pointer mt-auto"
                >
                  Excellence Info
                </button>
              </div>

              <div className="bg-[#f4f6fc] border border-white rounded-3xl p-5 shadow-inner flex flex-col items-center">
                <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-widest mb-1">
                  Cumplimiento Operativo
                </p>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-5xl font-extrabold text-[#454d82]">{opScore || 0}</span>
                  <span className="text-xl font-bold text-[#626a9f]">/ 100</span>
                </div>
                <div className="w-full h-[230px] mb-4">
                  {opMetrics ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={opMetrics}>
                        <PolarGrid stroke="rgba(98,106,159,0.25)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b4170', fontSize: 10.5, fontWeight: 700 }} />
                        <Radar name="Operational" dataKey="score" stroke="#16a37f" strokeWidth={2.5} fill="#16a37f" fillOpacity={0.35} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#626a9f] text-xs font-bold uppercase">
                      Cargando...
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOverlay('time')}
                  className="ola-th-btn-outline w-full py-3 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest cursor-pointer mt-auto"
                >
                  Time Tracking Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. MAIN TEACHER HUB (Workflow-First OutLoud Architecture)
// ==========================================
const TeacherHub = ({ onReturnHome }) => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextClass, setNextClass] = useState(null);
  const [payrollStats, setPayrollStats] = useState({ current: 0, monthlyGoal: 80 });
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [latestForumPost, setLatestForumPost] = useState(null);

  const [showCommunity, setShowCommunity] = useState(false);
  const [showSeminarRoom, setShowSeminarRoom] = useState(false);
  const [pdfViewerConfig, setPdfViewerConfig] = useState({ isOpen: false, type: 'Manuals' });
  const [activeJitsiSession, setActiveJitsiSession] = useState(null);

  // ANTI-PIRACY: Global Right-Click Lock for Teachers
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const fetchTeacherDashboard = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setTeacherData(profile);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      // 1. Upcoming booked classes
      const { data: upcoming, error: upcomingError } = await supabase
        .from('live_sessions')
        .select('*, student:profiles!student_id(first_name, last_name)')
        .eq('teacher_id', session.user.id)
        .in('status', ['booked', 'Booked', 'BOOKED'])
        .gte('scheduled_at', twentyFourHoursAgo);

      if (upcomingError) console.error('Database Fetch Error:', upcomingError);

      if (upcoming && upcoming.length > 0) {
        const sortedClasses = upcoming
          .map((cls) => ({
            ...cls,
            parsedDate: cls.scheduled_at ? new Date(cls.scheduled_at) : new Date(),
          }))
          .filter((cls) => cls.parsedDate.getTime() >= now.getTime() - 60 * 60 * 1000)
          .sort((a, b) => a.parsedDate - b.parsedDate);

        if (sortedClasses.length > 0) {
          const next = sortedClasses[0];
          setNextClass({
            id: next.id,
            student_id: next.student_id,
            student_name: `${next.student?.first_name || 'Estudiante'} ${next.student?.last_name || ''}`.trim(),
            unit: next.unit || 1,
            date: next.parsedDate.toISOString(),
            actual_start_at: next.actual_start_at,
            prep_started_at: next.prep_started_at,
          });
        }
      }

      // 2. Pending gradings
      const { data: pending } = await supabase
        .from('live_sessions')
        .select('*, student:profiles!student_id(first_name, last_name)')
        .eq('teacher_id', session.user.id)
        .in('status', ['completed', 'Completed', 'COMPLETED'])
        .eq('is_graded', false);

      if (pending) {
        setPendingEvaluations(
          pending.map((p) => {
            const d = p.scheduled_at ? new Date(p.scheduled_at) : new Date();
            return {
              id: p.id,
              student_id: p.student_id,
              student_name: `${p.student?.first_name || 'Estudiante'} ${p.student?.last_name || ''}`.trim(),
              unit: p.unit || 1,
              date: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString(
                'en-US',
                { hour: 'numeric', minute: '2-digit', hour12: true }
              )}`,
            };
          })
        );
      }

      // 3. Logged hours
      const { count: loggedHours } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', session.user.id)
        .in('status', ['completed', 'Completed', 'COMPLETED'])
        .gte('scheduled_at', firstDayOfMonth);

      setPayrollStats({ current: loggedHours || 0, monthlyGoal: 80 });

      // 4. Staff announcements
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .in('audience', ['EVERYONE_WITH_STAFF', 'STAFF_ONLY'])
        .order('created_at', { ascending: false });
      if (annData) setAnnouncements(annData);

      // 5. Latest forum post
      const { data: forumData } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (forumData && forumData.length > 0) setLatestForumPost(forumData[0]);
    } catch (err) {
      console.error('Critical Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeacherDashboard();
  }, [fetchTeacherDashboard]);

  const handleAction = async (actionType) => {
    if (actionType === 'Manual') {
      setPdfViewerConfig({ isOpen: true, type: 'Manuals' });
      if (nextClass && !nextClass.prep_started_at && !nextClass.actual_start_at) {
        const prepTime = new Date().toISOString();
        await supabase.from('live_sessions').update({ prep_started_at: prepTime }).eq('id', nextClass.id);
        setNextClass((prev) => ({ ...prev, prep_started_at: prepTime }));
      }
      return;
    }

    if (actionType === 'Tools') {
      setPdfViewerConfig({ isOpen: true, type: 'Cue Cards' });
      return;
    }

    if (actionType === 'Calendar') {
      setIsRosterOpen(true);
      return;
    }

    if (actionType === 'Community_CHAT') {
      setShowSeminarRoom(true);
      return;
    }

    if (actionType === 'Community_BOARD') {
      setShowCommunity(true);
      return;
    }

    if (actionType === 'Live' && nextClass) {
      setIsLaunching(true);
      const payload = {
        status: 'in_progress',
        last_ping_at: new Date().toISOString(),
      };
      if (!nextClass.actual_start_at) {
        payload.actual_start_at = new Date().toISOString();
      }

      const { error } = await supabase.from('live_sessions').update(payload).eq('id', nextClass.id);
      setIsLaunching(false);

      if (error) {
        alert('Database Error: Could not start the class. ' + error.message);
        return;
      }

      setActiveJitsiSession(nextClass);
    }
  };

  const handleJitsiLeave = () => {
    const completedClass = activeJitsiSession;
    setActiveJitsiSession(null);
    if (completedClass) {
      setPendingEvaluations((prev) => [...prev, completedClass]);
    }
    setNextClass(null);
    setIsEvalModalOpen(true);
  };

  const removeEvaluatedClass = (classId) =>
    setPendingEvaluations((prev) => prev.filter((c) => c.id !== classId));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative font-montserrat">
        <TeacherThemeStyles />
        <TeacherBackdrop />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <OutLoudIcon className="w-16 h-16 animate-bounce" />
          <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const safeAcquired = isNaN(payrollStats.current) ? 0 : payrollStats.current;
  const safeGoal = payrollStats.monthlyGoal || 80;
  const payrollPct = Math.round((Math.min(safeAcquired, safeGoal) / safeGoal) * 100);
  const ringRadius = 44;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (payrollPct / 100) * ringCircumference;

  const filteredAnnouncements = activeCategory
    ? announcements.filter((a) => a.category === activeCategory)
    : announcements;

  return (
    <div className="min-h-screen relative font-montserrat text-[#1e2246] pb-28 lg:pb-16 overflow-x-hidden">
      <TeacherThemeStyles />
      <TeacherBackdrop />

      {/* ==========================================
          1. FLOATING LANDING-STYLE TOP NAVBAR
      ========================================== */}
      <header className="sticky top-0 z-40 px-3.5 sm:px-6 lg:px-10 py-3 lg:py-3.5 bg-[#fdfcf8]/95 lg:bg-white/60 lg:backdrop-blur-2xl border-b-2 border-[#1e2246]/10 lg:border-white/85">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Real OutLoud Logo + Role Pill */}
          <button
            type="button"
            onClick={onReturnHome}
            className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
            title="Volver al inicio"
          >
            <OutLoudHorizontalLogo iconClass="w-8 h-8 sm:w-10 sm:h-10" wordmarkClass="h-6 sm:h-8 w-auto" />
            <span className="inline-flex lg:hidden xl:inline-flex items-center text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-2.5 py-1 rounded-full">
              Teacher
            </span>
          </button>

          {/* Center: Floating White Pill Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/95 border border-white rounded-full px-2 py-1.5 shadow-[0_10px_28px_-10px_rgba(69,77,130,0.22)]">
            <a
              href="#teacher-stage"
              className="px-4 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#1e2246] text-[#ffc749]"
            >
              Aula
            </a>
            <button
              type="button"
              onClick={() => handleAction('Calendar')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              My Roster
            </button>
            <button
              type="button"
              onClick={() => handleAction('Manual')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              Manuals
            </button>
            <button
              type="button"
              onClick={() => handleAction('Tools')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              Cue Cards
            </button>
            <button
              type="button"
              onClick={() => handleAction('Community_CHAT')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              Seminar
            </button>
            <button
              type="button"
              onClick={() => handleAction('Community_BOARD')}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#3b4170] hover:text-[#1e2246] hover:bg-[#f2f4fc] transition-colors cursor-pointer"
            >
              Forum
            </button>
          </nav>

          {/* Right: Logged Hours Coin Pill + Profile Capsule */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMetricsOpen(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-[#fff8e1] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full px-3 sm:px-4 py-1.5 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a37f] shrink-0" />
              <span className="text-[11px] sm:text-xs font-extrabold text-[#1e2246] whitespace-nowrap">
                {safeAcquired}h / {safeGoal}h
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(true)}
              className="relative inline-flex items-center gap-2 bg-white/95 hover:bg-white border border-white rounded-full p-1 pr-3 shadow-sm cursor-pointer transition-colors"
            >
              {pendingEvaluations.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ee665b] text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
                  {pendingEvaluations.length}
                </span>
              )}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#1e2246] bg-[#e8eaf7] flex items-center justify-center shrink-0">
                {teacherData?.avatar_url ? (
                  <img src={teacherData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-extrabold text-[#454d82]">
                    {teacherData?.first_name?.[0] || 'T'}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[11px] font-extrabold text-[#1e2246] max-w-[90px] truncate">
                Prof. {teacherData?.first_name || 'Teacher'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          2. MAIN WORKFLOW CONTENT
      ========================================== */}
      <main id="teacher-stage" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-7 sm:pt-10 space-y-8">
        {/* EDITORIAL WELCOME */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/95 border border-white rounded-full px-3.5 py-1.5 shadow-sm mb-3">
              <span className={`w-2 h-2 rounded-full ${nextClass ? 'bg-[#16a37f] animate-pulse' : 'bg-[#ffc749]'}`} />
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#454d82]">
                Instructor Command • {pendingEvaluations.length} Pending Gradings
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.06]">
              <span className="text-[#1e2246]">Hola, Prof. {teacherData?.first_name || 'Instructor'}. </span>
              <span className="text-[#626a9f]">
                Tu aula, lista<span className="text-[#ffc749]">.</span>
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#4c5384] font-medium mt-2 max-w-xl">
              Prepara tu manual 10 minutos antes, inicia tu Live Lab puntual y califica en los 5 minutos posteriores.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <a
              href="https://wa.me/584226885683"
              target="_blank"
              rel="noreferrer"
              className="ola-th-btn-outline flex-1 md:flex-none text-center px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest"
            >
              Request Sub
            </a>
            {nextClass && (
              <button
                type="button"
                onClick={() => handleAction('Live')}
                disabled={isLaunching}
                className="ola-th-btn-yellow flex-1 md:flex-none text-center px-4 sm:px-5 py-3 sm:py-2.5 rounded-full text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest cursor-pointer disabled:opacity-50"
              >
                {isLaunching ? 'Launching...' : `Start (U${nextClass.unit}) →`}
              </button>
            )}
          </div>
        </section>

        {/* DARK-NAVY LIVE OPERATIONAL STRIP (Next Class + Urgent Pending Grading) */}
        <section className="bg-[#1e2246] text-white rounded-[1.85rem] px-5 py-4 sm:px-7 sm:py-5 shadow-[0_18px_36px_-14px_rgba(30,34,70,0.45)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                pendingEvaluations.length > 0
                  ? 'bg-[#ee665b] text-white animate-pulse'
                  : nextClass
                  ? 'bg-[#ffc749] text-[#1e2246]'
                  : 'bg-white/10 text-[#ffc749]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ffc749] block">
                {pendingEvaluations.length > 0
                  ? `ACCIÓN INMEDIATA • ${pendingEvaluations.length} EVALUACIÓN PENDIENTE`
                  : nextClass
                  ? `PRÓXIMA CLASE • UNIDAD ${nextClass.unit}`
                  : 'SIN CLASES PRÓXIMAS EN COLA'}
              </span>
              <p className="text-xs sm:text-sm text-white/90 font-medium mt-0.5 truncate">
                {pendingEvaluations.length > 0
                  ? `Califica a ${pendingEvaluations[0].student_name} (Unidad ${pendingEvaluations[0].unit}) para detener el reloj de nómina.`
                  : nextClass
                  ? `${nextClass.student_name} — ${new Date(nextClass.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}`
                  : 'Revisa tu agenda de 7 días o mantente disponible para guardias.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            {pendingEvaluations.length > 0 && (
              <button
                type="button"
                onClick={() => setIsEvalModalOpen(true)}
                className="flex-1 lg:flex-none px-5 py-2.5 rounded-full bg-[#ee665b] hover:brightness-110 text-white font-extrabold text-[11px] uppercase tracking-widest cursor-pointer"
              >
                Grade Now ({pendingEvaluations.length}) →
              </button>
            )}
            {nextClass && (
              <button
                type="button"
                onClick={() => handleAction('Manual')}
                className="flex-1 lg:flex-none px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] uppercase tracking-widest cursor-pointer"
              >
                {nextClass.prep_started_at ? 'Prep Active ✓' : 'Start Prep (Manual)'}
              </button>
            )}
          </div>
        </section>

        {/* ==========================================
            3. THE 3-CARD WORKFLOW HERO ROW
            (Start Class / Teaching Kit / Payroll & Metrics)
        ========================================== */}
        <section className="flex flex-col gap-2.5">
          <div className="lg:hidden flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#454d82]">
              Flujo de Clase
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#626a9f] bg-white px-2.5 py-0.5 rounded-full border border-[#1e2246]/15">
              Desliza →
            </span>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-3 ola-no-scrollbar lg:grid lg:grid-cols-3 lg:gap-6 lg:mx-0 lg:px-0 lg:pb-0 lg:overflow-visible">
          {/* HERO 1: BUTTER-GOLD — START CLASS */}
          <button
            type="button"
            disabled={!nextClass || isLaunching}
            onClick={() => handleAction('Live')}
            className={`ola-th-card-gold group relative rounded-[2rem] lg:rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between text-left overflow-hidden focus:outline-none w-[84vw] max-w-[345px] shrink-0 snap-center lg:w-auto lg:max-w-none min-h-[330px] lg:min-h-[370px] ${
              nextClass ? 'ola-th-lift cursor-pointer' : 'opacity-85 cursor-not-allowed'
            }`}
          >
            <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.09]">
              <OutLoudIcon withTile={false} className="w-44 h-44" />
            </div>

            <div className="relative z-10 w-full h-40 rounded-[1.5rem] bg-white/75 border border-white shadow-inner flex items-center justify-center mb-5">
              <LiveClassIllustration isReady={!!nextClass} />
            </div>

            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3 py-1 rounded-full">
                  {nextClass ? `Unit ${nextClass.unit} • Ready` : 'Standby'}
                </span>
                {nextClass?.prep_started_at && (
                  <span className="text-[10px] font-extrabold uppercase bg-[#16a37f] text-white px-2.5 py-1 rounded-full">
                    Prep Logged ✓
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-1.5">
                {isLaunching ? 'Launching...' : 'Start Class'}
              </h2>
              <p className="text-xs sm:text-sm text-[#3b4170] font-medium leading-relaxed">
                {nextClass
                  ? `Estudiante: ${nextClass.student_name}. Al iniciar se abre Jitsi y arranca tu reloj de 45 minutos.`
                  : 'No tienes una clase reservada en este momento. Consulta tu agenda de 7 días.'}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-[#1e2246]/10">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1e2246]">
                {nextClass ? 'Abrir Sala Jitsi' : 'Sin Clase Activa'}
              </span>
              <span className="w-10 h-10 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </button>

          {/* HERO 2: PERIWINKLE-INDIGO — TEACHING KIT (MANUALS + CUE CARDS) */}
          <div className="ola-th-card-indigo ola-th-lift group relative rounded-[2rem] lg:rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between text-left overflow-hidden w-[84vw] max-w-[345px] shrink-0 snap-center lg:w-auto lg:max-w-none min-h-[330px] lg:min-h-[370px]">
            <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.12]">
              <OutLoudIcon withTile={false} className="w-44 h-44" />
            </div>

            <div className="relative z-10 w-full h-40 rounded-[1.5rem] bg-white/15 border border-white/25 flex items-center justify-center mb-5">
              <TeachingKitIllustration />
            </div>

            <div className="relative z-10 flex-1">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full mb-2.5">
                Prep &amp; Live Materials
              </span>
              <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-1.5">
                Teaching Kit
              </h2>
              <p className="text-xs sm:text-sm text-white/85 font-medium leading-relaxed">
                Abre los manuales oficiales (activa tu reloj de preparación de 10 min) y tus Cue Cards interactivas.
              </p>
            </div>

            <div className="relative z-10 flex gap-2.5 pt-4 mt-4 border-t border-white/15">
              <button
                type="button"
                onClick={() => handleAction('Manual')}
                className="flex-1 py-2.5 px-3 rounded-full bg-[#ffc749] hover:bg-[#ffd66b] text-[#1e2246] border-2 border-[#1e2246] font-extrabold text-[11px] uppercase tracking-wider cursor-pointer transition-transform active:scale-95"
              >
                Manuals
              </button>
              <button
                type="button"
                onClick={() => handleAction('Tools')}
                className="flex-1 py-2.5 px-3 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/35 font-extrabold text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cue Cards
              </button>
            </div>
          </div>

          {/* HERO 3: PEARL-WHITE FROSTED — MONTHLY PAYROLL & METRICS */}
          <button
            type="button"
            onClick={() => setIsMetricsOpen(true)}
            className="ola-th-card-pearl ola-th-lift group relative rounded-[2rem] lg:rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between text-left overflow-hidden cursor-pointer focus:outline-none w-[84vw] max-w-[345px] shrink-0 snap-center lg:w-auto lg:max-w-none min-h-[330px] lg:min-h-[370px]"
          >
            <div className="relative z-10 w-full h-40 rounded-[1.5rem] bg-[#f4f6fc] border border-white shadow-inner flex items-center justify-center gap-5 px-4 mb-5">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 108 108">
                  <circle cx="54" cy="54" r={ringRadius} stroke="rgba(98,106,159,0.18)" strokeWidth="9" fill="transparent" />
                  <circle
                    cx="54"
                    cy="54"
                    r={ringRadius}
                    stroke="#16a37f"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-[#1e2246] leading-none">{safeAcquired}h</span>
                  <span className="text-[8.5px] font-bold uppercase tracking-widest text-[#128063] mt-1">
                    Logged
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#e7faf3] text-[#128063] px-3 py-1 rounded-full text-center">
                  Meta: {safeGoal}h
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3 py-1 rounded-full text-center">
                  {payrollPct}% Mes
                </span>
              </div>
            </div>

            <div className="relative z-10 flex-1">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-3 py-1 rounded-full mb-2.5">
                Nómina &amp; Calidad
              </span>
              <h2 className="text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-1.5">
                Payroll &amp; Radar
              </h2>
              <p className="text-xs sm:text-sm text-[#4c5384] font-medium leading-relaxed">
                Consulta tus pagos del mes, bonos por guardias, calificación pedagógica (5 estrellas) y cumplimiento operativo.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-[#626a9f]/15">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#454d82]">
                Ver Detalles y Radars
              </span>
              <span className="w-10 h-10 rounded-full bg-[#626a9f] text-white flex items-center justify-center shadow-md group-hover:bg-[#1e2246] group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          </button>
          </div>
        </section>

        {/* ==========================================
            4. QUICK-ACCESS BENTO ROW (Roster / Gradings / Community)
        ========================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BENTO A: MY 7-DAY ROSTER */}
          <button
            type="button"
            onClick={() => handleAction('Calendar')}
            className="ola-th-card-pearl ola-th-lift group rounded-[2rem] p-5 flex flex-col justify-between text-left cursor-pointer"
          >
            <div className="w-full h-32 rounded-[1.35rem] bg-[#f4f6fc] border border-white flex items-center justify-center mb-4">
              <RosterIllustration />
            </div>
            <div>
              <span className="inline-block text-[9.5px] font-extrabold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-1 rounded-full mb-2">
                Agenda 7 Días
              </span>
              <h3 className="text-base font-extrabold text-[#1e2246] uppercase tracking-tight mb-1">
                My Roster
              </h3>
              <p className="text-xs text-[#4c5384] font-medium leading-relaxed">
                Revisa tus bloques abiertos y estudiantes confirmados para los próximos 7 días.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#626a9f]/12">
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#1e2246]">
                Ver Horario
              </span>
              <span className="w-8 h-8 rounded-full bg-[#ffc749] border border-[#1e2246] text-[#1e2246] flex items-center justify-center text-xs font-extrabold">
                →
              </span>
            </div>
          </button>

          {/* BENTO B: PENDING GRADINGS */}
          <button
            type="button"
            disabled={pendingEvaluations.length === 0}
            onClick={() => setIsEvalModalOpen(true)}
            className={`rounded-[2rem] p-5 flex flex-col justify-between text-left transition-all ${
              pendingEvaluations.length > 0
                ? 'ola-th-card-gold ola-th-lift cursor-pointer'
                : 'ola-th-card-mint cursor-default'
            }`}
          >
            <div className="w-full h-32 rounded-[1.35rem] bg-white/80 border border-white flex items-center justify-center mb-4">
              <GradingIllustration hasPending={pendingEvaluations.length > 0} />
            </div>
            <div>
              <span
                className={`inline-block text-[9.5px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 ${
                  pendingEvaluations.length > 0
                    ? 'bg-[#ee665b] text-white'
                    : 'bg-[#16a37f] text-white'
                }`}
              >
                {pendingEvaluations.length > 0
                  ? `${pendingEvaluations.length} Pendientes`
                  : 'Al Día ✓'}
              </span>
              <h3 className="text-base font-extrabold text-[#1e2246] uppercase tracking-tight mb-1">
                Class Evaluations
              </h3>
              <p className="text-xs text-[#3b4170] font-medium leading-relaxed">
                {pendingEvaluations.length > 0
                  ? `Tienes ${pendingEvaluations.length} evaluación(es) esperando nota final.`
                  : 'Todas tus clases completadas han sido calificadas a tiempo.'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#1e2246]/10">
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#1e2246]">
                {pendingEvaluations.length > 0 ? 'Calificar Ahora' : 'Sin Pendientes'}
              </span>
              {pendingEvaluations.length > 0 && (
                <span className="w-8 h-8 rounded-full bg-[#1e2246] text-[#ffc749] flex items-center justify-center text-xs font-extrabold">
                  →
                </span>
              )}
            </div>
          </button>

          {/* BENTO C: COMMUNITY (SEMINAR + FORUM) */}
          <div className="ola-th-card-pearl ola-th-lift rounded-[2rem] p-5 flex flex-col justify-between text-left">
            <div className="w-full h-32 rounded-[1.35rem] bg-[#f4f6fc] border border-white flex items-center justify-center mb-4">
              <CommunityIllustration />
            </div>
            <div>
              <span className="inline-block text-[9.5px] font-extrabold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-1 rounded-full mb-2">
                Staff &amp; Students
              </span>
              <h3 className="text-base font-extrabold text-[#1e2246] uppercase tracking-tight mb-1">
                Community Rooms
              </h3>
              <p className="text-xs text-[#4c5384] font-medium leading-relaxed line-clamp-2">
                {latestForumPost
                  ? `Último tema: "${latestForumPost.title}"`
                  : 'Modera salas de seminario en vivo o otorga manzanas doradas en el foro.'}
              </p>
            </div>
            <div className="flex gap-2 pt-4 mt-4 border-t border-[#626a9f]/15">
              <button
                type="button"
                onClick={() => handleAction('Community_CHAT')}
                className="flex-1 py-2.5 px-3 rounded-full bg-[#1e2246] hover:bg-[#454d82] text-[#ffc749] text-[10.5px] font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Seminar
              </button>
              <button
                type="button"
                onClick={() => handleAction('Community_BOARD')}
                className="flex-1 py-2.5 px-3 rounded-full bg-white hover:bg-[#fff3d1] text-[#1e2246] border-2 border-[#1e2246] text-[10.5px] font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Forum
              </button>
            </div>
          </div>
        </section>

        {/* ==========================================
            5. EDITORIAL STAFF INFO BOARD
        ========================================== */}
        <section className="ola-th-card-pearl rounded-[2.25rem] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#626a9f]/15">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#ffc749] border-2 border-[#1e2246]" />
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1e2246] uppercase tracking-tight leading-none">
                  Staff Info Board
                </h2>
                <p className="text-[10.5px] font-semibold text-[#626a9f] mt-0.5">
                  Comunicados internos, reglas y actualizaciones para docentes
                </p>
              </div>
            </div>
            {activeCategory && (
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="px-3 py-1.5 rounded-full bg-[#fff2f1] text-[#c93f34] text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
              >
                ✕ Limpiar Filtro
              </button>
            )}
          </div>

          <div className="-mx-5 px-5 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-2 mb-5 ola-no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-[11px] font-extrabold whitespace-nowrap cursor-pointer border-2 sm:border ${
                !activeCategory
                  ? 'bg-[#1e2246] border-[#1e2246] text-[#ffc749]'
                  : 'bg-white border-[#1e2246]/15 sm:border-white text-[#454d82]'
              }`}
            >
              Todos ({announcements.length})
            </button>
            {INFO_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer border-2 sm:border ${
                  activeCategory === cat
                    ? 'bg-[#1e2246] border-[#1e2246] text-[#ffc749]'
                    : 'bg-white border-[#1e2246]/15 sm:border-white text-[#454d82] hover:border-[#626a9f]/35'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white/75 rounded-2xl border border-white py-10 text-center text-xs font-bold uppercase tracking-widest text-[#626a9f]">
              No hay anuncios publicados en esta categoría.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => handleAction('Community_BOARD')}
                  className="bg-white border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {ann.image_url && (
                    <div className="w-full sm:w-28 h-36 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-[#dfe2f2]">
                      <img src={ann.image_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="inline-block w-fit text-[9.5px] font-extrabold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
                      {ann.category || 'Staff Update'}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#1e2246] mb-1 truncate">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-[#4c5384] font-medium leading-relaxed line-clamp-3">
                      {ann.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ==========================================
6. MOBILE FLOATING EDITORIAL CAPSULE DOCK
      ========================================== */}
      <nav
        className="lg:hidden fixed bottom-3 left-2.5 right-2.5 bg-[#fdfcf8] border-2 border-[#1e2246] rounded-[1.75rem] flex items-center justify-between px-1.5 py-1.5 z-50 shadow-[0_5px_0_#1e2246,0_14px_28px_-8px_rgba(30,34,70,0.32)]"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          type="button"
          onClick={() => handleAction('Calendar')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Roster</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('Manual')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Manuals</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('Tools')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Cards</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('Community_CHAT')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[#454d82] active:bg-[#fff3d1] active:text-[#1e2246] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[9px] font-extrabold leading-none">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => (pendingEvaluations.length > 0 ? setIsEvalModalOpen(true) : handleAction('Community_BOARD'))}
          className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl cursor-pointer ${
            pendingEvaluations.length > 0
              ? 'bg-[#ee665b] text-white border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] -translate-y-0.5'
              : 'bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] -translate-y-0.5'
          }`}
        >
          {pendingEvaluations.length > 0 ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[9px] font-extrabold leading-none">Grade ({pendingEvaluations.length})</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span className="text-[9px] font-extrabold leading-none">Forum</span>
            </>
          )}
        </button>
      </nav>

      {/* ==========================================
          7. MODALS & OVERLAYS
      ========================================== */}
      {activeJitsiSession && (
        <JitsiRoom session={activeJitsiSession} teacher={teacherData} onLeave={handleJitsiLeave} />
      )}

      {showCommunity && (
        <div className="fixed inset-0 z-[650] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 md:p-10 font-montserrat">
          <div className="w-full h-full max-w-7xl relative shadow-2xl rounded-[2.5rem]">
            <ForumBoard
              currentUser={{
                id: teacherData.id,
                role: 'teacher',
                level: 'ALL',
                first_name: teacherData.first_name,
                last_name: teacherData.last_name,
                avatar_url: teacherData.avatar_url,
              }}
              onClose={() => setShowCommunity(false)}
            />
          </div>
        </div>
      )}

      {showSeminarRoom && (
        <div className="fixed inset-0 z-[650] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 md:p-10 font-montserrat">
          <div className="w-full h-full max-w-7xl relative shadow-2xl rounded-[2.5rem]">
            <SeminarRoom
              currentUser={{
                id: teacherData.id,
                full_name: `${teacherData.first_name} ${teacherData.last_name}`,
                avatar_url: teacherData.avatar_url,
                level: 'ALL',
              }}
              userRole="teacher"
              roomScope="dual"
              onClose={() => setShowSeminarRoom(false)}
            />
          </div>
        </div>
      )}

      <EvaluationModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        pendingClasses={pendingEvaluations}
        onGradeSubmitted={removeEvaluatedClass}
        teacherId={teacherData?.id}
      />

      <TeacherRosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        teacherId={teacherData?.id}
      />

      <TeacherPdfViewerModal
        isOpen={pdfViewerConfig.isOpen}
        type={pdfViewerConfig.type}
        onClose={() => setPdfViewerConfig((prev) => ({ ...prev, isOpen: false }))}
        defaultUnit={nextClass?.unit || 1}
      />

      <TeacherMetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
        teacherId={teacherData?.id}
        teacherData={teacherData}
      />

      <ProfileOverlay
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        teacher={teacherData}
        pendingCount={pendingEvaluations.length}
        onOpenEvaluations={() => setIsEvalModalOpen(true)}
        onLogout={onReturnHome}
      />
    </div>
  );
};

export default TeacherHub;