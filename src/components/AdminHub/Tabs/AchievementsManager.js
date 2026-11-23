import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../SupabaseClient';

// ==========================================
// THE OMNI-TRACK METRICS DICTIONARY
// ==========================================
const METRICS_DICTIONARY = [
  // 1. Academic & Curriculum
  { id: 'academic_lessons_completed', label: 'Lessons Completed', desc: 'Total video lessons and subsequent exercises fully completed.', group: 'Academic & Curriculum' },
  { id: 'academic_workbooks_completed', label: 'Workbooks Completed', desc: 'Total dedicated workbook modules finished.', group: 'Academic & Curriculum' },
  { id: 'academic_capstones_passed', label: 'Capstones Passed', desc: 'Major level-end evaluations successfully passed.', group: 'Academic & Curriculum' },
  { id: 'academic_levels_completed', label: 'Levels Conquered', desc: 'Full CEFR levels (e.g., A1, B2) completed.', group: 'Academic & Curriculum' },
  { id: 'exercise_fitb_perfect', label: 'FITB Perfect Matches', desc: 'Fill-in-the-blank exercises completed with zero mistakes.', group: 'Academic & Curriculum' },
  { id: 'exercise_dnd_perfect', label: 'DnD Perfect Matches', desc: 'Drag-and-drop exercises completed without swapping errors.', group: 'Academic & Curriculum' },
  { id: 'written_total_words', label: 'Total Words Typed', desc: 'Lifetime sum of words typed in short-answer inputs.', group: 'Academic & Curriculum' },
  { id: 'oral_record_compare_attempts', label: 'Pronunciation Attempts', desc: 'Total times the student used the Record & Compare tool.', group: 'Academic & Curriculum' },
  { id: 'oral_eval_score_raw', label: 'Oral Eval Score', desc: 'The exact score received on a live oral evaluation (out of 20).', group: 'Academic & Curriculum' },
  { id: 'oral_eval_deduction_phonology', label: 'Phonology Deductions', desc: 'Amount of points lost due to pronunciation errors.', group: 'Academic & Curriculum' },

  // 2. Temporal & Pacing
  { id: 'time_platform_active_minutes', label: 'Total Active Minutes', desc: 'Lifetime minutes spent actively interacting with the platform.', group: 'Temporal & Pacing' },
  { id: 'time_login_streak_days', label: 'Daily Login Streak', desc: 'Consecutive days logging into the platform.', group: 'Temporal & Pacing' },
  { id: 'time_morning_classes', label: 'Morning Classes', desc: 'Live classes completed between 5:00 AM and 9:00 AM.', group: 'Temporal & Pacing' },
  { id: 'time_night_classes', label: 'Night Owl Classes', desc: 'Live classes completed between 8:00 PM and 12:00 AM.', group: 'Temporal & Pacing' },
  { id: 'pacing_lesson_seconds_spent', label: 'Lesson Duration (Secs)', desc: 'Exact time spent on a single lesson before completing or abandoning.', group: 'Temporal & Pacing' },
  { id: 'live_class_punctuality_minutes', label: 'Class Punctuality (Mins)', desc: 'Minutes joined before (-) or after (+) the official live class start time.', group: 'Temporal & Pacing' },

  // 3. UI & Micro-Interactions
  { id: 'ui_audio_rewind_count', label: 'Audio Rewinds', desc: 'Times a user clicked rewind during an audio playback.', group: 'UI & Micro-Interactions' },
  { id: 'ui_video_pause_count', label: 'Video Pauses', desc: 'Times a video lesson was manually paused.', group: 'UI & Micro-Interactions' },
  { id: 'ui_mic_rerecord_count', label: 'Audio Re-records', desc: 'Times a user discarded an audio recording to try again.', group: 'UI & Micro-Interactions' },
  { id: 'ui_help_button_clicks', label: 'Help/SOS Clicks', desc: 'Usage of the platform support/help buttons.', group: 'UI & Micro-Interactions' },
  { id: 'ui_trophy_cabinet_views', label: 'Trophy Cabinet Views', desc: 'Times the user opened this specific screen.', group: 'UI & Micro-Interactions' },
  { id: 'ui_input_backspaces', label: 'Backspaces Used', desc: 'Total backspaces hit during typing exercises (measures hesitation/correction).', group: 'UI & Micro-Interactions' },

  // 4. Community & Network
  { id: 'forum_threads_created', label: 'Forum Threads Created', desc: 'New debate or Q&A topics published to the forum.', group: 'Community & Network' },
  { id: 'forum_replies_given', label: 'Forum Replies', desc: "Responses given to other users' threads.", group: 'Community & Network' },
  { id: 'community_golden_apples_received', label: 'Golden Apples Received', desc: 'Teacher/Peer upvotes received on forum contributions.', group: 'Community & Network' },
  { id: 'community_seminar_attendances', label: 'Seminar Attendances', desc: 'Total open-room conversational seminars joined.', group: 'Community & Network' },

  // 5. Staff & Operations
  { id: 'staff_classes_started_on_time', label: 'Punctual Class Starts', desc: 'Classes opened by the teacher with 0 minutes of delay.', group: 'Staff & Operations' },
  { id: 'staff_5_star_ratings', label: '5-Star Ratings', desc: 'Perfect feedback scores received from students post-class.', group: 'Staff & Operations' },
  { id: 'staff_sos_shifts_covered', label: 'Emergency Shifts Covered', desc: 'Dropped sessions successfully picked up and completed.', group: 'Staff & Operations' },
  { id: 'staff_evals_under_10m', label: 'Fast Evals Submitted', desc: 'Post-class grading submitted within 10 minutes of class end.', group: 'Staff & Operations' },
  { id: 'staff_eval_notes_words', label: 'Eval Notes Word Count', desc: 'Depth of qualitative feedback written for students.', group: 'Staff & Operations' },
];

// ==========================================
// PRE-COMPILED RENDERING ENGINES
// ==========================================
const getTierColor = (tier) => {
  const colors = {
    Bronze: '#d97706',
    Silver: '#94a3b8',
    Gold: '#ffc749',
    Diamond: '#38bdf8',
    Emerald: '#16a37f',
  };
  return colors[tier] || '#ffc749';
};

const renderFallbackSVG = (tier, color) => (
  <svg
    className="absolute inset-0 w-full h-full drop-shadow-2xl z-20 scale-55"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id={`grad-mgr-${tier}`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor={color} stopOpacity="0.85" />
        <stop offset="0.5" stopColor={color} stopOpacity="0.25" />
        <stop offset="1" stopColor={color} stopOpacity="0.7" />
      </linearGradient>
      <filter id={`glow-mgr-${tier}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path
      d="M50 5 L85 30 L85 70 L50 95 L15 70 L15 30 Z"
      fill={`url(#grad-mgr-${tier})`}
      stroke={color}
      strokeWidth="1.5"
      strokeOpacity="0.85"
    />
    <path d="M50 5 L50 50 L85 30" fill="white" fillOpacity="0.12" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />
    <path d="M50 5 L50 50 L15 30" fill="black" fillOpacity="0.2" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />
    <circle cx="50" cy="50" r="10" fill={color} filter={`url(#glow-mgr-${tier})`} opacity="0.85" />
    <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.95" />
  </svg>
);

const TrophyPlayer = ({ assetUrl, videoUrl, tier, color, isModal = false, isUnlocked = false }) => {
  const [showSpawn, setShowSpawn] = useState(isModal && isUnlocked && !!videoUrl);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (isModal && isUnlocked && videoUrl) {
      setShowSpawn(true);
      setFading(false);
      const fadeOutTimer = setTimeout(() => setFading(true), 3500);
      const swapTimer = setTimeout(() => {
        setShowSpawn(false);
        setFading(false);
      }, 4000);
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(swapTimer);
      };
    } else {
      setShowSpawn(false);
      setFading(false);
    }
  }, [isModal, isUnlocked, videoUrl, assetUrl]);

  const activeUrl = showSpawn ? videoUrl : assetUrl;
  const isLooping = !showSpawn;

  if (!activeUrl) return renderFallbackSVG(tier, color);

  if (activeUrl.includes('<iframe')) {
    const match = activeUrl.match(/src=["'](.*?)["']/);
    let src = match ? match[1] : '';
    if (!src) return renderFallbackSVG(tier, color);

    src = src.replace(/\?.*/, '');
    src += `?autoplay=true&muted=true&controls=false&background=true${isLooping ? '&loop=true' : ''}`;

    return (
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen transition-opacity duration-500 z-20 ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="w-[150%] h-[150%] min-w-[300px] min-h-[400px] flex items-center justify-center">
          <iframe
            src={src}
            className="w-full h-full border-none mix-blend-screen"
            allow="autoplay; encrypted-media; picture-in-picture;"
            title="Trophy Animation"
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={activeUrl}
      alt="Trophy"
      className="absolute inset-0 w-full h-full object-contain mix-blend-screen drop-shadow-2xl z-20 p-7"
      style={{ filter: 'contrast(1.18) brightness(1.08)' }}
    />
  );
};

export default function AchievementsManager({ onBack }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    category: 'Milestone',
    tier: 'Bronze',
    target_audience: 'student',
    asset_url: '',
    video_url: '',
    is_secret: false,
    is_active: true,
    sort_order: 0,
    conditions: [],
  });

  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) console.error('Error fetching achievements', error);
    else setAchievements(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.conditions.length === 0) {
      return alert('You must add at least one logic condition to save this trophy.');
    }

    const payload = { ...formData };
    if (!payload.id) delete payload.id;

    const { error } = await supabase.from('achievements').upsert(payload);
    if (error) {
      alert('Error saving achievement: ' + error.message);
    } else {
      alert('Achievement saved successfully!');
      setIsEditing(false);
      fetchAchievements();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    await supabase.from('achievements').delete().eq('id', id);
    fetchAchievements();
  };

  const openEditor = (ach = null) => {
    if (ach) {
      setFormData({
        ...ach,
        conditions: ach.conditions || [],
      });
    } else {
      setFormData({
        id: null,
        title: '',
        description: '',
        category: 'Milestone',
        tier: 'Bronze',
        target_audience: 'student',
        asset_url: '',
        video_url: '',
        is_secret: false,
        is_active: true,
        sort_order: 0,
        conditions: [{ metric: 'academic_lessons_completed', operator: '>=', value: 1 }],
      });
    }
    setIsEditing(true);
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { metric: 'academic_lessons_completed', operator: '>=', value: 1 }],
    });
  };

  const removeCondition = (index) => {
    const newConditions = formData.conditions.filter((_, i) => i !== index);
    setFormData({ ...formData, conditions: newConditions });
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index][field] = value;
    setFormData({ ...formData, conditions: newConditions });
  };

  const groupedMetrics = METRICS_DICTIONARY.reduce((acc, metric) => {
    (acc[metric.group] = acc[metric.group] || []).push(metric);
    return acc;
  }, {});

  const hexColorPreview = getTierColor(formData.tier);

  return (
    <div className="flex flex-col w-full max-w-[1440px] lg:h-[calc(100vh-145px)] relative z-10 font-montserrat text-[#1e2246] pb-10 lg:pb-0">
      {/* HEADER */}
      <div className="flex items-center gap-3.5 mb-5 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center font-bold transition-all active:scale-90 cursor-pointer shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#1e2246] leading-none">
            Trophy Composer
          </h2>
          <p className="text-[11px] font-bold text-[#454d82] uppercase tracking-widest mt-1">
            Omni-Track Rule Engine &amp; 3D Assets
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        {/* ========================================== */}
        {/* LEFT PANE: CATALOG LIST                    */}
        {/* ========================================== */}
        <div
          className={`ola-adm-glass rounded-[2.25rem] overflow-hidden flex flex-col ${
            isEditing ? 'hidden lg:flex flex-[0.82]' : 'flex-1'
          }`}
        >
          <div className="p-5 sm:px-6 border-b border-[#626a9f]/15 flex justify-between items-center bg-white/55 shrink-0">
            <div>
              <h3 className="font-extrabold text-[#1e2246] uppercase tracking-wider text-xs sm:text-sm">
                Active Database
              </h3>
              <span className="text-[10px] font-bold text-[#626a9f] uppercase">
                {achievements.length} Trophies
              </span>
            </div>
            <button
              type="button"
              onClick={() => openEditor()}
              className="ola-adm-btn-yellow px-4 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-wider cursor-pointer"
            >
              + New Trophy
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 flex flex-col gap-2.5">
            {loading ? (
              <div className="h-full flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
              </div>
            ) : achievements.length === 0 ? (
              <div className="text-center text-[#626a9f] text-xs font-bold py-12 uppercase tracking-widest">
                Catalog is empty. Add your first trophy.
              </div>
            ) : (
              achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`bg-white/85 hover:bg-white border border-white p-3.5 sm:p-4 rounded-2xl flex items-center justify-between transition-all shadow-sm ${
                    !ach.is_active ? 'opacity-55 grayscale' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-[#1e2246]/20 shrink-0 bg-[#1e2246] text-[#ffc749] overflow-hidden">
                      {ach.asset_url ? (
                        ach.asset_url.includes('<iframe') ? (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider">VID</span>
                        ) : (
                          <img
                            src={ach.asset_url}
                            alt="icon"
                            className="w-8 h-8 object-contain mix-blend-screen"
                          />
                        )
                      ) : (
                        <span className="text-lg">🏆</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[#1e2246] text-xs sm:text-sm uppercase tracking-tight flex items-center gap-2 truncate">
                        <span className="truncate">{ach.title}</span>
                        {!ach.is_active && (
                          <span className="px-2 py-0.5 bg-[#ee665b]/15 text-[#c93f34] rounded-full text-[8.5px] font-bold shrink-0">
                            Inactive
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] font-bold text-[#626a9f] uppercase tracking-wider truncate mt-0.5">
                        {ach.tier} • {ach.category} •{' '}
                        <span className="text-[#454d82]">{ach.target_audience}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditor(ach)}
                      className="w-9 h-9 bg-[#e8eaf7] hover:bg-[#454d82] text-[#454d82] hover:text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer text-sm"
                      title="Edit Trophy"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ach.id)}
                      className="w-9 h-9 bg-[#ee665b]/15 hover:bg-[#ee665b] text-[#c93f34] hover:text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                      title="Delete Trophy"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANE: OMNI-TRACK COMPOSER            */}
        {/* ========================================== */}
        {isEditing && (
          <div className="ola-adm-glass ola-adm-modal-in flex-[1.35] rounded-[2.25rem] overflow-hidden flex flex-col">
            <div className="p-5 sm:px-6 border-b border-[#626a9f]/15 bg-white/55 shrink-0 flex justify-between items-center">
              <h3 className="font-extrabold text-[#1e2246] uppercase tracking-tight text-base sm:text-lg">
                {formData.id ? 'Edit Achievement' : 'Create New Trophy'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
              <form onSubmit={handleSave} className="flex flex-col gap-6">
                {/* Basic Meta */}
                <div className="flex flex-col gap-4 bg-white/75 border border-white rounded-3xl p-5 shadow-sm">
                  <div>
                    <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1.5">
                      Trophy Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-4 py-2.5 text-[#1e2246] text-sm font-semibold outline-none shadow-sm"
                      placeholder="e.g., The Metronome"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1.5">
                      Lore / Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-4 py-2.5 text-[#1e2246] text-sm font-medium outline-none resize-none h-20 shadow-sm"
                      placeholder="Describe how to earn this achievement..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1.5">
                        Audience
                      </label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                        className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="all">Everyone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option>Milestone</option>
                        <option>Consistency</option>
                        <option>Excellence</option>
                        <option>Community</option>
                        <option>Operations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1.5">
                        Tier
                      </label>
                      <select
                        value={formData.tier}
                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                        className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option>Bronze</option>
                        <option>Silver</option>
                        <option>Gold</option>
                        <option>Diamond</option>
                        <option>Emerald</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CASCADING RULE BUILDER */}
                <div className="ola-adm-glass-gold rounded-3xl p-5">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-4 border-b border-[#1e2246]/15 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#1e2246] uppercase tracking-wider">
                        Logic Conditions
                      </h4>
                      <p className="text-[11px] font-medium text-[#4c5384] mt-0.5">
                        Trophy unlocks when ALL stacked conditions are met simultaneously.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCondition}
                      className="bg-[#1e2246] hover:bg-[#454d82] text-[#ffc749] px-3.5 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-wider cursor-pointer shrink-0"
                    >
                      + Add Rule
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {formData.conditions.map((cond, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-2.5 bg-white/85 p-3.5 rounded-2xl border border-white relative group shadow-sm"
                      >
                        <div className="flex-[2] relative">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9.5px] text-[#454d82] font-bold uppercase tracking-wider">
                              Tracked Action
                            </label>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const dictEntry = METRICS_DICTIONARY.find((m) => m.id === cond.metric);
                                setActiveTooltip(activeTooltip === dictEntry?.desc ? null : dictEntry?.desc);
                              }}
                              className="w-5 h-5 rounded-full bg-[#e8eaf7] text-[#454d82] hover:bg-[#1e2246] hover:text-[#ffc749] flex items-center justify-center text-[10px] font-extrabold cursor-pointer"
                            >
                              i
                            </button>
                          </div>

                          <select
                            value={cond.metric}
                            onChange={(e) => updateCondition(index, 'metric', e.target.value)}
                            className="w-full bg-[#f6f7fc] border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-semibold outline-none cursor-pointer"
                          >
                            {Object.entries(groupedMetrics).map(([groupName, metrics]) => (
                              <optgroup key={groupName} label={groupName}>
                                {metrics.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.label}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-[9.5px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                            Requirement
                          </label>
                          <select
                            value={cond.operator}
                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                            className="w-full bg-[#f6f7fc] border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-2.5 py-2.5 text-[#1e2246] text-xs font-bold outline-none cursor-pointer text-center"
                          >
                            <option value=">=">Greater or Eq (&gt;=)</option>
                            <option value="<=">Less or Eq (&lt;=)</option>
                            <option value="==">Exactly Eq (==)</option>
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-[9.5px] text-[#454d82] font-bold uppercase tracking-wider mb-1">
                            Target
                          </label>
                          <input
                            type="number"
                            value={cond.value}
                            onChange={(e) => updateCondition(index, 'value', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-[#f6f7fc] border border-[#dfe2f2] focus:border-[#454d82] rounded-xl px-3 py-2.5 text-[#1e2246] text-xs font-extrabold outline-none text-center"
                            required
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-[#ee665b] text-white rounded-full shadow-md flex items-center justify-center text-xs font-bold cursor-pointer"
                          title="Remove condition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {activeTooltip && (
                      <div
                        ref={tooltipRef}
                        className="bg-[#1e2246] text-white p-4 rounded-2xl shadow-lg text-xs font-medium leading-relaxed border-2 border-[#ffc749]"
                      >
                        <span className="uppercase tracking-widest text-[#ffc749] text-[9.5px] font-bold block mb-1">
                          Metric Definition
                        </span>
                        {activeTooltip}
                      </div>
                    )}
                  </div>
                </div>

                {/* CLOUDFLARE ASSET FIELDS */}
                <div className="flex flex-col gap-3.5 bg-white/75 border border-white rounded-3xl p-5 shadow-sm">
                  <div>
                    <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1.5">
                      Cloudflare Asset URL (Idle Image / Loop Iframe)
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or <iframe>..."
                      value={formData.asset_url}
                      onChange={(e) => setFormData({ ...formData, asset_url: e.target.value })}
                      className="w-full bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-4 py-2.5 text-[#1e2246] text-xs sm:text-sm font-medium outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#128063] font-bold uppercase tracking-widest mb-1.5">
                      Cloudflare Video URL (Spawn Animation)
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or <iframe>..."
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full bg-white border-2 border-white focus:border-[#16a37f] rounded-xl px-4 py-2.5 text-[#1e2246] text-xs sm:text-sm font-medium outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#454d82] font-bold uppercase tracking-widest mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                      className="w-28 bg-white border-2 border-white focus:border-[#454d82] rounded-xl px-3.5 py-2.5 text-[#1e2246] text-sm font-bold outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* LIVE STUDENT RENDER PREVIEW */}
                <div className="flex flex-col items-center justify-center bg-white/65 border border-white rounded-3xl p-6 shadow-inner select-none">
                  <span className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1">
                    Live Student Render
                  </span>
                  <p className="text-xs text-[#50567d] mb-5 text-center max-w-xs">
                    Tap the preview card to test the full spawn animation modal.
                  </p>

                  <div
                    onClick={() => setShowPreviewModal(true)}
                    className="relative w-full max-w-[260px] rounded-[2rem] border-2 border-white bg-white/90 shadow-xl overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all"
                  >
                    <div className="relative h-56 w-full bg-gradient-to-b from-[#1e2246] via-[#171b3a] to-[#0f132b] overflow-hidden flex items-center justify-center">
                      <div
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-32 h-36 blur-[50px] opacity-55 pointer-events-none"
                        style={{ backgroundColor: hexColorPreview }}
                      />
                      <TrophyPlayer
                        assetUrl={formData.asset_url}
                        videoUrl={formData.video_url}
                        tier={formData.tier}
                        color={hexColorPreview}
                        isModal={false}
                        isUnlocked={true}
                      />
                      <div className="absolute inset-0 bg-[#1e2246]/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-40">
                        <span className="bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                          Test Spawn →
                        </span>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <h4 className="text-xs font-extrabold uppercase text-[#1e2246] truncate mb-1">
                        {formData.title || 'Trophy Title'}
                      </h4>
                      <span
                        className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border"
                        style={{
                          color: '#1e2246',
                          backgroundColor: `${hexColorPreview}35`,
                          borderColor: hexColorPreview,
                        }}
                      >
                        {formData.tier} Tier
                      </span>
                    </div>
                  </div>
                </div>

                {/* VISIBILITY TOGGLES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="flex items-center gap-3.5 cursor-pointer bg-white/80 p-4 rounded-2xl border border-white hover:border-[#ffc749] transition-colors shadow-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_secret}
                      onChange={(e) => setFormData({ ...formData, is_secret: e.target.checked })}
                      className="w-5 h-5 rounded accent-[#454d82] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-[#1e2246] uppercase block">Secret Trophy</span>
                      <span className="text-[10.5px] font-medium text-[#50567d]">Hidden entirely until earned.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3.5 cursor-pointer bg-white/80 p-4 rounded-2xl border border-white hover:border-[#16a37f] transition-colors shadow-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded accent-[#16a37f] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-[#1e2246] uppercase block">Active Link</span>
                      <span className="text-[10.5px] font-medium text-[#50567d]">Visible in catalog &amp; rules.</span>
                    </div>
                  </label>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 pt-4 border-t border-[#626a9f]/15">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="ola-adm-btn-outline flex-1 py-3.5 text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ola-adm-btn-yellow flex-[2] py-3.5 text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer"
                  >
                    Save Logic &amp; Asset ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT SPAWN PREVIEW MODAL */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-[9999] bg-[#1e2246]/65 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="ola-adm-glass ola-adm-modal-in rounded-[2.5rem] p-6 sm:p-9 max-w-xl w-full relative flex flex-col items-center text-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-5 right-5 w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center z-50 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-full max-w-[280px] aspect-[3/4] mb-6 relative z-10 flex items-center justify-center overflow-hidden rounded-[2rem] shadow-xl border-2 border-[#1e2246] bg-gradient-to-b from-[#1e2246] to-[#0f132b]">
              <TrophyPlayer
                assetUrl={formData.asset_url}
                videoUrl={formData.video_url}
                tier={formData.tier}
                color={hexColorPreview}
                isModal={true}
                isUnlocked={true}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-2">
              {formData.title || 'Trophy Title'}
            </h2>

            <div className="flex items-center gap-2 mb-5">
              <span
                className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                style={{
                  color: '#1e2246',
                  backgroundColor: `${hexColorPreview}35`,
                  borderColor: hexColorPreview,
                }}
              >
                {formData.tier} Tier
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[#e8eaf7] text-[#454d82] text-[10px] font-bold uppercase tracking-widest">
                {formData.category}
              </span>
            </div>

            <div className="w-full bg-white/85 border border-white rounded-2xl p-5 mb-5 shadow-sm">
              <h4 className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1.5">
                Objective Completed
              </h4>
              <p className="text-xs sm:text-sm text-[#282d57] font-medium leading-relaxed">
                {formData.description || 'Description will appear here...'}
              </p>
            </div>

            <div className="w-full py-3.5 bg-[#e7faf3] border-2 border-[#16a37f] text-[#128063] rounded-2xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Achievement Unlocked</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}