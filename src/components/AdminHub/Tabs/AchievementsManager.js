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
  { id: 'forum_replies_given', label: 'Forum Replies', desc: 'Responses given to other users\' threads.', group: 'Community & Network' },
  { id: 'community_golden_apples_received', label: 'Golden Apples Received', desc: 'Teacher/Peer upvotes received on forum contributions.', group: 'Community & Network' },
  { id: 'community_seminar_attendances', label: 'Seminar Attendances', desc: 'Total open-room conversational seminars joined.', group: 'Community & Network' },

  // 5. Staff & Operations
  { id: 'staff_classes_started_on_time', label: 'Punctual Class Starts', desc: 'Classes opened by the teacher with 0 minutes of delay.', group: 'Staff & Operations' },
  { id: 'staff_5_star_ratings', label: '5-Star Ratings', desc: 'Perfect feedback scores received from students post-class.', group: 'Staff & Operations' },
  { id: 'staff_sos_shifts_covered', label: 'Emergency Shifts Covered', desc: 'Dropped sessions successfully picked up and completed.', group: 'Staff & Operations' },
  { id: 'staff_evals_under_10m', label: 'Fast Evals Submitted', desc: 'Post-class grading submitted within 10 minutes of class end.', group: 'Staff & Operations' },
  { id: 'staff_eval_notes_words', label: 'Eval Notes Word Count', desc: 'Depth of qualitative feedback written for students.', group: 'Staff & Operations' }
];

// ==========================================
// STUDENT VIEW PREVIEW RENDERERS
// ==========================================
const getTierColor = (tier) => {
  const colors = { 'Bronze': '#d97706', 'Silver': '#cbd5e1', 'Gold': '#fcd34d', 'Diamond': '#38bdf8', 'Emerald': '#10b981' };
  return colors[tier] || '#ffffff';
};

const renderFallbackSVG = (tier, color) => {
  return (
    <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`grad-${tier}`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.8" />
          <stop offset="0.5" stopColor={color} stopOpacity="0.2" />
          <stop offset="1" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <filter id={`glow-${tier}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d="M50 5 L85 30 L85 70 L50 95 L15 70 L15 30 Z" fill={`url(#grad-${tier})`} stroke={color} strokeWidth="1.5" strokeOpacity="0.8"/>
      <path d="M50 5 L50 50 L85 30" fill="white" fillOpacity="0.1" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      <path d="M50 5 L50 50 L15 30" fill="black" fillOpacity="0.2" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      <path d="M15 30 L50 50 L15 70" fill="white" fillOpacity="0.05" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      <path d="M85 30 L50 50 L85 70" fill="black" fillOpacity="0.3" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      <path d="M15 70 L50 50 L50 95" fill="white" fillOpacity="0.15" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      <path d="M85 70 L50 50 L50 95" fill="black" fillOpacity="0.4" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      <circle cx="50" cy="50" r="10" fill={color} filter={`url(#glow-${tier})`} opacity="0.8"/>
      <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9"/>
    </svg>
  );
};

const renderCloudflareIframe = (iframeHtml) => {
  if (!iframeHtml || !iframeHtml.includes('<iframe')) return null;
  const match = iframeHtml.match(/src=["'](.*?)["']/);
  const src = match ? match[1] : '';
  if (!src) return null;
  return (
    <div className="w-full h-full relative" style={{ paddingTop: '177.77777777777777%' }}>
      <iframe
        src={src}
        loading="lazy"
        style={{ border: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={true}
        title="Trophy Animation"
        className="mix-blend-screen pointer-events-none"
      />
    </div>
  );
};


export default function AchievementsManager({ onBack }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null); 
  const [showPreviewModal, setShowPreviewModal] = useState(false); // STUDENT SPAWN PREVIEW STATE

  const [formData, setFormData] = useState({
    id: null, title: '', description: '', category: 'Milestone', 
    tier: 'Bronze', target_audience: 'student', asset_url: '', video_url: '', 
    is_secret: false, is_active: true, sort_order: 0,
    conditions: [] 
  });

  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('achievements').select('*').order('sort_order', { ascending: true });
    if (error) console.error("Error fetching achievements", error);
    else setAchievements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAchievements(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.conditions.length === 0) {
      return alert("You must add at least one logic condition to save this trophy.");
    }
    
    const payload = { ...formData };
    if (!payload.id) delete payload.id;
    
    const { error } = await supabase.from('achievements').upsert(payload);
    if (error) {
      alert("Error saving achievement: " + error.message);
    } else {
      alert("Achievement saved successfully!");
      setIsEditing(false);
      fetchAchievements();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    await supabase.from('achievements').delete().eq('id', id);
    fetchAchievements();
  };

  const openEditor = (ach = null) => {
    if (ach) {
      setFormData({
        ...ach,
        conditions: ach.conditions || []
      });
    } else {
      setFormData({ 
        id: null, title: '', description: '', category: 'Milestone', 
        tier: 'Bronze', target_audience: 'student', asset_url: '', video_url: '', 
        is_secret: false, is_active: true, sort_order: 0,
        conditions: [{ metric: 'academic_lessons_completed', operator: '>=', value: 1 }]
      });
    }
    setIsEditing(true);
  };

  // --- Logic Builder Handlers ---
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { metric: 'academic_lessons_completed', operator: '>=', value: 1 }]
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
    <div className="flex flex-col w-full h-[calc(100vh-160px)] animate-fade-in relative z-10 font-montserrat">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-white/10 hover:bg-[#fcd34d] text-white hover:text-[#08203e] rounded-full flex items-center justify-center font-black transition-all shadow-md hover:scale-105">←</button>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">Trophy Composer</h2>
          <p className="text-xs font-bold text-[#fcd34d] uppercase tracking-widest mt-1">Rule Engine & Asset Management</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        
        {/* ========================================== */}
        {/* LEFT PANE: CATALOG LIST */}
        {/* ========================================== */}
        <div className={`relative rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col bg-black/20 ${isEditing ? 'hidden lg:flex flex-[0.8]' : 'flex-1'}`}>
          <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
            <h3 className="font-black text-white uppercase tracking-widest text-sm">Active Database</h3>
            <button onClick={() => openEditor()} className="bg-[#fcd34d] text-[#08203e] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(252,211,77,0.3)]">
              + New Trophy
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-3">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : achievements.length === 0 ? (
              <div className="text-center text-white/50 text-xs font-bold py-10 uppercase tracking-widest">Catalog is empty. Add your first trophy.</div>
            ) : (
              achievements.map(ach => (
                <div key={ach.id} className={`bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl flex items-center justify-between transition-colors shadow-sm ${!ach.is_active ? 'opacity-50 grayscale' : 'hover:bg-white/10'}`}>
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 shrink-0 shadow-inner ${ach.asset_url ? 'bg-black/40' : 'bg-white/5'}`}>
                      {ach.asset_url ? (
                         ach.asset_url.includes('<iframe') ? <span className="text-[8px] font-black text-[#fcd34d] uppercase tracking-widest">VID</span> : <img src={ach.asset_url} alt="icon" className="w-8 h-8 object-contain mix-blend-screen" />
                      ) : <span className="text-xl">🏆</span>}
                    </div>
                    <div className="truncate">
                      <h4 className="font-black text-white text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 truncate">
                        {ach.title}
                        {!ach.is_active && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[8px] tracking-widest shrink-0">INACTIVE</span>}
                      </h4>
                      <p className="text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-widest truncate mt-1">
                        {ach.tier} • {ach.category} • <span className="text-[#fcd34d]">{ach.target_audience}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditor(ach)} className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl flex items-center justify-center shadow-md transition-all text-lg">✏️</button>
                    <button onClick={() => handleDelete(ach.id)} className="w-10 h-10 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl flex items-center justify-center shadow-md transition-all text-sm font-black">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANE: OMNI-TRACK COMPOSER */}
        {/* ========================================== */}
        {isEditing && (
          <div className="flex-[1.4] relative rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col bg-black/40 backdrop-blur-xl animate-slide-up lg:animate-fade-in">
            <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 shrink-0 flex justify-between items-center relative z-20">
              <h3 className="font-black text-[#fcd34d] uppercase tracking-widest text-lg drop-shadow-md">
                {formData.id ? 'Edit Achievement' : 'Create New Trophy'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="lg:hidden w-10 h-10 bg-white/10 text-white rounded-full font-black flex items-center justify-center">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
              <form onSubmit={handleSave} className="flex flex-col gap-8">
                
                {/* Basic Meta */}
                <div className="flex flex-col gap-5 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-inner">
                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Trophy Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#fcd34d] transition-colors" placeholder="e.g., The Metronome" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Lore / Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#fcd34d] resize-none h-24 transition-colors" placeholder="Let the light guide you..." required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Audience</label>
                      <select value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#fcd34d] appearance-none cursor-pointer">
                        <option className="bg-[#0f172a]" value="student">Student</option>
                        <option className="bg-[#0f172a]" value="teacher">Teacher</option>
                        <option className="bg-[#0f172a]" value="all">Everyone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#fcd34d] appearance-none cursor-pointer">
                        <option className="bg-[#0f172a]">Milestone</option>
                        <option className="bg-[#0f172a]">Consistency</option>
                        <option className="bg-[#0f172a]">Excellence</option>
                        <option className="bg-[#0f172a]">Community</option>
                        <option className="bg-[#0f172a]">Operations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Tier</label>
                      <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#fcd34d] appearance-none cursor-pointer">
                        <option className="bg-[#0f172a]">Bronze</option>
                        <option className="bg-[#0f172a]">Silver</option>
                        <option className="bg-[#0f172a]">Gold</option>
                        <option className="bg-[#0f172a]">Diamond</option>
                        <option className="bg-[#0f172a]">Emerald</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* THE CASCADING RULE BUILDER */}
                <div className="bg-black/30 border border-[#fcd34d]/30 rounded-3xl p-6 md:p-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-xs md:text-sm font-black text-[#fcd34d] uppercase tracking-widest drop-shadow-md">Logic Conditions</h4>
                      <p className="text-[10px] font-medium text-white/50 leading-relaxed mt-1">Stack rules together. The trophy unlocks only when ALL conditions are met simultaneously.</p>
                    </div>
                    <button type="button" onClick={addCondition} className="bg-white/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shrink-0 flex items-center gap-2">
                      <span className="text-lg leading-none">+</span> Add
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {formData.conditions.map((cond, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 relative group">
                        
                        {/* Domain/Metric Dropdown with "i" Tooltip */}
                        <div className="flex-[2] relative">
                          <div className="flex justify-between items-end mb-1">
                            <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest">Tracked Action</label>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const dictEntry = METRICS_DICTIONARY.find(m => m.id === cond.metric);
                                setActiveTooltip(activeTooltip === dictEntry?.desc ? null : dictEntry?.desc);
                              }}
                              className="w-5 h-5 rounded-full bg-white/10 text-white/70 hover:bg-[#fcd34d] hover:text-[#08203e] flex items-center justify-center text-[10px] font-black transition-colors"
                            >
                              i
                            </button>
                          </div>
                          
                          <select 
                            value={cond.metric} 
                            onChange={e => updateCondition(index, 'metric', e.target.value)} 
                            className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-3 text-white text-xs outline-none focus:border-[#fcd34d] appearance-none cursor-pointer"
                          >
                            {Object.entries(groupedMetrics).map(([groupName, metrics]) => (
                              <optgroup key={groupName} label={groupName} className="bg-[#0f172a] text-[#fcd34d] font-bold">
                                {metrics.map(m => (
                                  <option key={m.id} value={m.id} className="text-white">{m.label}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {/* Operator */}
                        <div className="flex-1">
                          <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-1">Requirement</label>
                          <select 
                            value={cond.operator} 
                            onChange={e => updateCondition(index, 'operator', e.target.value)} 
                            className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-3 text-white text-xs font-black outline-none focus:border-[#fcd34d] appearance-none cursor-pointer text-center"
                          >
                            <option className="bg-[#0f172a]" value=">=">Greater or Eq (&gt;=)</option>
                            <option className="bg-[#0f172a]" value="<=">Less or Eq (&lt;=)</option>
                            <option className="bg-[#0f172a]" value="==">Exactly Eq (==)</option>
                          </select>
                        </div>

                        {/* Value */}
                        <div className="flex-1">
                          <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-1">Target</label>
                          <input 
                            type="number" 
                            value={cond.value} 
                            onChange={e => updateCondition(index, 'value', parseInt(e.target.value) || 0)} 
                            className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-3 text-white text-xs font-black outline-none focus:border-[#fcd34d] text-center" 
                            required 
                          />
                        </div>

                        {/* Delete Row Button */}
                        <button 
                          type="button" 
                          onClick={() => removeCondition(index)} 
                          className="absolute -top-3 -right-3 md:top-auto md:bottom-2 md:-right-4 w-8 h-8 bg-red-500/90 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all shadow-lg flex items-center justify-center font-black hover:scale-110 md:-translate-y-1 z-10"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Global Tooltip Anchor */}
                    {activeTooltip && (
                      <div ref={tooltipRef} className="bg-[#fcd34d] text-[#08203e] p-4 rounded-xl shadow-[0_10px_30px_rgba(252,211,77,0.3)] animate-slide-up relative z-50 text-xs font-bold leading-relaxed border border-[#ca8a04]">
                        <div className="absolute -top-2 left-6 w-4 h-4 bg-[#fcd34d] rotate-45 border-t border-l border-[#ca8a04]"></div>
                        <span className="uppercase tracking-widest opacity-60 text-[9px] block mb-1">Metric Definition</span>
                        {activeTooltip}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cloudflare Asset Fields */}
                <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-inner">
                  <div>
                    <label className="block text-[10px] text-[#fcd34d] font-bold uppercase tracking-widest mb-2">Cloudflare Asset URL (Idle Image/Loop)</label>
                    <input type="text" placeholder="https://..." value={formData.asset_url} onChange={e => setFormData({...formData, asset_url: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#fcd34d] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2">Cloudflare Video URL (Spawn Animation)</label>
                    <input type="text" placeholder="https://..." value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Sort Order</label>
                    <input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#fcd34d] transition-colors" />
                  </div>
                </div>

                {/* ========================================== */}
                {/* LIVE STUDENT PREVIEW (IDLE CABINET GRID)   */}
                {/* ========================================== */}
                <div className="flex flex-col items-center justify-center bg-black/20 border border-[#fcd34d]/20 rounded-3xl p-8 shadow-inner relative overflow-hidden select-none">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fcd34d]/50 to-transparent"></div>
                  <h4 className="text-[10px] font-black text-[#fcd34d] uppercase tracking-widest mb-2">Live Student Render</h4>
                  <p className="text-[9px] text-white/50 mb-6 text-center max-w-xs leading-relaxed">This is exactly how the trophy will loop in the Student's glass cabinet. Click the card to test the explosive unlock animation.</p>
                  
                  <div 
                    onClick={() => setShowPreviewModal(true)}
                    className="relative aspect-[4/5] w-56 md:w-64 rounded-[2rem] border flex flex-col items-center justify-between p-6 text-center transition-all duration-500 cursor-pointer group overflow-hidden bg-gradient-to-b from-white/10 to-black/60 border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                  >
                    {/* Dynamic Pedestal & Glow (Unlocked State) */}
                    <div className="absolute inset-0 opacity-20 blur-[50px] transition-opacity duration-700 group-hover:opacity-50 rounded-[2rem] pointer-events-none" style={{ backgroundColor: hexColorPreview }} />
                    <div className="absolute bottom-0 w-3/4 h-8 blur-[20px] rounded-[100%]" style={{ backgroundColor: hexColorPreview, opacity: 0.4 }} />
                    <div className="absolute bottom-4 w-1/2 h-1 bg-white/40 blur-[2px] rounded-full" />

                    {/* 3D Asset or Fallback */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 mt-4 transition-all duration-700 pointer-events-none flex items-center justify-center overflow-visible scale-100 opacity-100 group-hover:scale-110" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                      <div style={{ color: hexColorPreview, filter: `drop-shadow(0 20px 30px ${hexColorPreview}80)` }} className="w-full h-full flex items-center justify-center transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:-rotate-x-12">
                        {formData.asset_url ? (
                          formData.asset_url.includes('<iframe') 
                            ? renderCloudflareIframe(formData.asset_url)
                            : <img src={formData.asset_url} alt={formData.title} className="w-full h-full object-contain drop-shadow-2xl mix-blend-screen" style={{ filter: 'contrast(1.2) brightness(1.1)' }} />
                        ) : renderFallbackSVG(formData.tier, hexColorPreview)}
                      </div>
                    </div>

                    <div className="w-full z-10 flex flex-col items-center mt-auto">
                      <h3 className="text-xs md:text-sm font-black uppercase tracking-widest mb-1.5 transition-colors line-clamp-2 px-2 text-white drop-shadow-md">
                        {formData.title || 'Trophy Title'}
                      </h3>
                      <div className="px-3 py-1 rounded-full border border-transparent text-[8px] font-black tracking-widest uppercase shadow-sm bg-black/40" style={{ color: hexColorPreview }}>
                        {formData.tier}
                      </div>
                    </div>

                    {/* Instruction Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-50 backdrop-blur-sm rounded-[2rem]">
                        <span className="text-white font-black text-xs uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full bg-white/10 shadow-lg">TEST SPAWN</span>
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex items-center gap-4 cursor-pointer group bg-white/5 px-6 py-5 rounded-2xl border border-white/10 hover:border-[#fcd34d]/50 transition-colors w-full shadow-inner">
                    <input type="checkbox" checked={formData.is_secret} onChange={e => setFormData({...formData, is_secret: e.target.checked})} className="w-5 h-5 rounded border-white/20 bg-black/40 text-[#fcd34d] focus:ring-[#fcd34d]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-[#fcd34d] transition-colors">Secret Trophy</span>
                      <span className="text-[10px] font-medium text-white/50 leading-tight mt-0.5">Hidden entirely until earned.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group bg-white/5 px-6 py-5 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors w-full shadow-inner">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500" />
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Active Link</span>
                      <span className="text-[10px] font-medium text-white/50 leading-tight mt-0.5">Visible in catalog and evaluation loop.</span>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-white/10 mt-auto">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4.5 bg-transparent hover:bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors border border-white/20">Cancel</button>
                  <button type="submit" className="flex-[2] py-4.5 bg-[#fcd34d] text-[#08203e] hover:bg-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(252,211,77,0.3)] hover:scale-105">Save Logic & Asset</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* STUDENT SPAWN PREVIEW MODAL                */}
      {/* ========================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in select-none" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-[#0a0e1a] border border-white/10 rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-[0_30px_100px_rgba(0,0,0,1)] relative flex flex-col items-center text-center animate-slide-up" onClick={e => e.stopPropagation()}>
            
            {/* Dynamic Modal Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 blur-[100px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: hexColorPreview }} />
            
            <button onClick={() => setShowPreviewModal(false)} className="absolute top-6 right-6 w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/20 text-white rounded-full font-black transition-colors flex items-center justify-center z-50 shadow-md">✕</button>
            
            <div className="w-48 h-48 md:w-64 md:h-64 mb-10 transition-all duration-700 relative z-10 flex items-center justify-center overflow-visible opacity-100 scale-100">
              <div style={{ color: hexColorPreview, filter: `drop-shadow(0 20px 40px ${hexColorPreview})` }} className="w-full h-full flex items-center justify-center">
                {formData.video_url ? (
                  renderCloudflareIframe(formData.video_url)
                ) : formData.asset_url ? (
                  formData.asset_url.includes('<iframe') 
                    ? renderCloudflareIframe(formData.asset_url)
                    : <img src={formData.asset_url} alt="Trophy" className="w-full h-full object-contain mix-blend-screen drop-shadow-2xl" style={{ filter: 'contrast(1.2) brightness(1.1)' }} />
                ) : renderFallbackSVG(formData.tier, hexColorPreview)}
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-3 relative z-10 drop-shadow-md">{formData.title || 'Trophy Title'}</h2>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="px-4 py-1.5 rounded-full border bg-black/40 text-[10px] font-black tracking-widest uppercase shadow-inner" style={{ color: hexColorPreview, borderColor: `${hexColorPreview}40` }}>
                {formData.tier} Tier
              </span>
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-[10px] font-black tracking-widest uppercase">
                {formData.category}
              </span>
            </div>
            
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative z-10 shadow-inner">
              <h4 className="text-[10px] font-black text-[#fcd34d] uppercase tracking-widest mb-2">Objective</h4>
              <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
                {formData.description || 'Description will appear here...'}
              </p>
            </div>

            <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black text-sm uppercase tracking-widest shadow-inner flex items-center justify-center gap-3 mb-8 relative z-10">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Achievement Unlocked
            </div>
          </div>
        </div>
      )}

    </div>
  );
}