import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import RecordCompareActivity from './RecordCompareActivity';
import { OutLoudHorizontalLogo, OutLoudIcon } from './components/OutLoudBrand';

const isDirectVideoUrl = (url) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url || '');

const extractVideoUrl = (rawInput) => {
  if (!rawInput) return '';
  let url = rawInput.trim();
  if (url.includes('<iframe') && url.includes('src=')) {
    const match = url.match(/src=["'](.*?)["']/);
    if (match && match[1]) url = match[1];
  }

  // Cloudflare Stream: transparent pillarbox/letterbox + OutLoud gold controls
  if (/cloudflarestream\.com|videodelivery\.net/i.test(url)) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('letterboxColor', 'transparent');
      parsed.searchParams.set('primaryColor', '#ffc749');
      return parsed.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}letterboxColor=transparent&primaryColor=%23ffc749`;
    }
  }

  return url;
};

// Strips punctuation and spaces for bulletproof string comparison
const cleanStr = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim().toLowerCase();
};

// Ensures legacy dark-mode white inline text saved in Supabase stays readable on light cards
const normalizeLightHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/color\s*:\s*(#ffffff|#fff|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#e2e8f0|#f8fafc|#f1f5f9)/gi, 'color: #1e2246')
    .replace(/color=["'](#ffffff|#fff|white)["']/gi, 'color="#1e2246"');
};

const PlayerThemeStyles = () => (
  <style>{`
    .ola-sp-canvas {
      background: linear-gradient(125deg, #fdebc0 0%, #f6eff5 44%, #e5e8fa 76%, #d9dff8 100%);
    }
    .ola-sp-card-pearl {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 244, 253, 0.82) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(55, 63, 118, 0.2), inset 0 2px 2px #ffffff;
    }
    .ola-sp-card-gold {
      background: linear-gradient(160deg, #fff9e8 0%, #ffe69e 100%);
      border: 2px solid #ffffff;
      box-shadow: 0 22px 44px -18px rgba(196, 138, 12, 0.26), inset 0 2px 2px rgba(255, 255, 255, 0.96);
    }
    .ola-sp-card-indigo {
      background: linear-gradient(160deg, #747db8 0%, #5b64a0 100%);
      border: 2px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 22px 46px -18px rgba(45, 51, 96, 0.36), inset 0 2px 2px rgba(255, 255, 255, 0.25);
    }
    .ola-sp-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 12px 24px -6px rgba(255, 199, 73, 0.58);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
    }
    .ola-sp-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246, 0 16px 30px -6px rgba(255, 199, 73, 0.74);
    }
    .ola-sp-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
      transition-duration: 0.06s;
    }
    .ola-sp-btn-outline {
      background: rgba(255, 255, 255, 0.94);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 rgba(30, 34, 70, 0.16);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, background 0.14s ease;
    }
    .ola-sp-btn-outline:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #626a9f;
    }
    .ola-sp-btn-outline:active {
      transform: translateY(2px) scale(0.99);
      box-shadow: 0 1px 0 rgba(30, 34, 70, 0.2);
    }
    .ola-sp-btn-mint {
      background: #16a37f;
      color: #ffffff;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 12px 24px -8px rgba(22, 163, 127, 0.55);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease;
    }
    .ola-sp-btn-mint:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246;
    }
    .ola-sp-btn-mint:active {
      transform: translateY(3px);
      box-shadow: 0 1px 0 #1e2246;
    }
    .ola-sp-btn-coral {
      background: #ee665b;
      color: #ffffff;
      border: 2px solid #1e2246;
      box-shadow: 0 4px 0 #1e2246, 0 12px 24px -8px rgba(238, 102, 91, 0.5);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease;
    }
    .ola-sp-btn-coral:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #1e2246;
    }
    .ola-sp-btn-coral:active {
      transform: translateY(3px);
      box-shadow: 0 1px 0 #1e2246;
    }

    /* Custom Neo-Tactile Range Slider */
    .ola-sp-slider {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
    }
    .ola-sp-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 30px;
      height: 30px;
      border-radius: 9999px;
      background: var(--thumb-color, #ffc749);
      border: 3px solid #1e2246;
      box-shadow: 0 3px 0 #1e2246;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .ola-sp-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }
    .ola-sp-slider::-moz-range-thumb {
      width: 30px;
      height: 30px;
      border-radius: 9999px;
      background: var(--thumb-color, #ffc749);
      border: 3px solid #1e2246;
      box-shadow: 0 3px 0 #1e2246;
      cursor: pointer;
    }

    @keyframes olaSpWave {
      0%, 100% { transform: scaleY(0.42); }
      50% { transform: scaleY(1); }
    }
    @keyframes olaSpFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes olaSpEnter {
      0% { opacity: 0; transform: translateY(14px) scale(0.985); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes olaSpSpark {
      0% { transform: translateY(0px) scale(0.35); opacity: 1; }
      75% { opacity: 1; }
      100% { transform: translateY(-58px) scale(1); opacity: 0; }
    }
    .ola-sp-wave {
      transform-origin: center;
      animation: olaSpWave 1.4s ease-in-out infinite;
    }
    .ola-sp-float { animation: olaSpFloat 4.2s ease-in-out infinite; }
    .ola-sp-enter { animation: olaSpEnter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .ola-sp-spark { animation: olaSpSpark 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

    .ola-sp-video-stage {
      background: linear-gradient(135deg, #fdebc0 0%, #eaedfb 52%, #cfd6f7 100%);
    }

    .ola-sp-root .font-black { font-weight: 800; }
    .ola-sp-root .font-extrabold { font-weight: 700; }

    @media (max-width: 1023px) {
      .ola-sp-card-pearl {
        background: #fdfcf8 !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border: 2px solid #1e2246 !important;
        box-shadow: 0 5px 0 rgba(30, 34, 70, 0.14), 0 12px 24px -14px rgba(30, 34, 70, 0.18) !important;
      }
      .ola-sp-card-gold,
      .ola-sp-card-indigo {
        border: 2px solid #1e2246 !important;
        box-shadow: 0 5px 0 #1e2246 !important;
      }
      .ola-sp-float,
      .ola-sp-wave {
        animation: none !important;
      }
    }
  `}</style>
);

const PlayerBackdrop = () => (
  <div className="ola-sp-canvas fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Architectural Dot Grid matching Landing Page */}
    <div
      className="absolute inset-0 opacity-75"
      style={{
        backgroundImage: 'radial-gradient(rgba(82, 91, 146, 0.22) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
      }}
    />

    {/* Floating Dot Matrix Accent (Top Left) */}
    <svg
      className="hidden md:block absolute top-28 left-8 w-16 h-16 opacity-60 ola-sp-float"
      viewBox="0 0 60 60"
      fill="none"
    >
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

    {/* Floating Brand Geometry (Bottom Right) */}
    <svg
      className="hidden lg:block absolute bottom-12 right-10 w-24 h-24 opacity-60 ola-sp-float"
      style={{ animationDelay: '0.8s' }}
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle cx="72" cy="24" r="14" fill="#ffc749" />
      <path d="M58 56 A18 18 0 0 1 94 56 Z" fill="#626a9f" opacity="0.75" />
      <rect x="20" y="64" width="22" height="22" rx="6" fill="#ffc749" opacity="0.8" />
      <path d="M26 24 L29 31 L36 34 L29 37 L26 44 L23 37 L16 34 L23 31 Z" fill="#626a9f" />
    </svg>
  </div>
);

const ELEMENT_META = {
  record_compare: { label: 'Pronunciación Interactiva', badge: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' },
  fill_in_the_blank: { label: 'Completar Espacios', badge: 'bg-[#e8eaf7] text-[#454d82] border-[#626a9f]/30' },
  short_answer: { label: 'Respuesta Escrita', badge: 'bg-[#e8eaf7] text-[#454d82] border-[#626a9f]/30' },
  multiple_selection: { label: 'Selección Múltiple', badge: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' },
  drag_and_drop: { label: 'Emparejar Conceptos', badge: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' },
  slider_bar: { label: 'Escala Interactiva', badge: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' },
  crossword: { label: 'Crucigrama', badge: 'bg-[#e8eaf7] text-[#454d82] border-[#626a9f]/30' },
  word_search: { label: 'Sopa de Letras', badge: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' },
};

const StudentPlayer = ({ activityType, student, onExit, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const [screensData, setScreensData] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({});
  const [selectedBankWord, setSelectedBankWord] = useState(null);

  // Tracking & Media States
  const [videoWatched, setVideoWatched] = useState(false);
  const [recordState, setRecordState] = useState('idle');

  // Audio Refs & Feedback States
  const mediaRecorderRef = useRef(null);
  const userAudioRef = useRef(null);
  const targetAudioRef = useRef(null);
  const correctSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);
  const [navButtonState, setNavButtonState] = useState('idle'); // 'idle', 'correct', 'incorrect'
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const safeParse = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data === 'object') return data;
    if (typeof data === 'string') {
      try {
        if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
          const cleaned = data.trim().replace('{', '[').replace('}', ']');
          return JSON.parse(cleaned);
        }
        return JSON.parse(data);
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const rawLevel = student?.level || 'A1';
        const queryLevel = rawLevel === 'Staff' ? 'A1' : rawLevel.split(':')[0].trim();
        const rawUnit = String(student?.unit || '1').trim();
        const queryUnit = rawUnit.toLowerCase().startsWith('unit') ? rawUnit : `Unit ${rawUnit}`;

        const { data, error: fetchError } = await supabase
          .from('content_blueprints')
          .select('*')
          .ilike('level', `${queryLevel}%`)
          .ilike('unit', queryUnit)
          .ilike('content_type', activityType)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('No content blueprint found for this specific unit and level.');

        const parsedScreens = safeParse(data.screens, []);
        const parsedBlueprint = safeParse(data.blueprint_data, { elements: [] });
        const elementsArr = parsedBlueprint.elements || [];

        const structuredScreens = parsedScreens.map((screenId) =>
          elementsArr.filter((e) => e.screenId === screenId)
        );

        if (structuredScreens.length === 0) throw new Error('This blueprint is completely empty.');
        setLessonId(data.id);
        setScreensData(structuredScreens);
      } catch (err) {
        setError(`Error loading content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [activityType, student]);

  // Listen for Bunny.net / Cloudflare video completion
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && (data.event === 'ended' || data.type === 'ended' || data.event === 'videoEnded')) {
          setVideoWatched(true);
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Anti-Piracy: Blocks right-clicking anywhere inside the player
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const evaluateElement = (el) => {
    let possible = 0;
    let correct = 0;
    let incorrect = 0;

    if (el.type === 'short_answer' && el.data?.correctAnswer) {
      possible++;
      const ans = cleanStr(studentAnswers[el.id]);
      const target = cleanStr(el.data.correctAnswer);
      if (!ans) incorrect++;
      else if (ans === target) correct++;
      else incorrect++;
    } else if (el.type === 'fill_in_the_blank' && el.data?.answerText) {
      const rawGroups = el.data.answerText.split(',');
      rawGroups.forEach((group, index) => {
        const cleanedTarget = group.replace(/^["'\s]+|["'\s]+$/g, '');
        if (cleanedTarget) {
          possible++;
          const studentAns = (studentAnswers[`${el.id}_${index}`] || '').trim();
          const validOptions = cleanedTarget.split(/[|/]/).map((w) => w.trim());
          if (!studentAns) incorrect++;
          else if (validOptions.some((opt) => cleanStr(opt) === cleanStr(studentAns))) correct++;
          else incorrect++;
        }
      });
    } else if (el.type === 'multiple_selection') {
      el.data.options?.forEach((opt) => {
        if (opt.isCorrect) {
          possible++;
          if (studentAnswers[`${el.id}_${opt.id}`]) correct++;
          else incorrect++;
        } else if (studentAnswers[`${el.id}_${opt.id}`]) {
          incorrect++;
        }
      });
    } else if (el.type === 'drag_and_drop') {
      el.data.items?.forEach((item, idx) => {
        if (item.targetText && item.imageUrl) {
          possible++;
          const placed = cleanStr(dndAnswers[`${el.id}_${idx}`]);
          const target = cleanStr(item.targetText);
          if (!placed) incorrect++;
          else if (placed === target) correct++;
          else incorrect++;
        }
      });
    } else if (el.type === 'slider_bar' && el.data?.options) {
      const correctIdx = el.data.options.findIndex((opt) => opt.isCorrect);
      if (correctIdx !== -1) {
        possible++;
        const maxIdx = Math.max(0, el.data.options.length - 1);
        const defaultIdx = Math.floor(maxIdx / 2);
        const ans = studentAnswers[el.id] !== undefined ? parseInt(studentAnswers[el.id], 10) : defaultIdx;
        if (ans === correctIdx) correct++;
        else incorrect++;
      }
    } else if (el.type === 'word_search') {
      let isGraded = false;
      if (el.data?.placedWords) {
        el.data.placedWords.forEach((pw) => {
          possible++;
          isGraded = true;
          const studentCells = studentAnswers[`${el.id}_cells`] || [];
          const allSelected = pw.cells.every((c) => {
            const altC = c.replace('-', '_');
            return studentCells.includes(c) || studentCells.includes(altC);
          });
          if (allSelected) correct++;
          else incorrect++;
        });

        const studentCells = studentAnswers[`${el.id}_cells`] || [];
        const allCorrectCells = el.data.placedWords.flatMap((pw) =>
          pw.cells.flatMap((c) => [c, c.replace('-', '_')])
        );
        studentCells.forEach((sc) => {
          if (!allCorrectCells.includes(sc)) incorrect++;
        });
      }
      if (!isGraded) possible++;
    } else if (el.type === 'crossword' && el.data?.grid) {
      let isGraded = false;
      ['across', 'down'].forEach((dir) => {
        (el.data[dir] || []).forEach((wordObj) => {
          if (wordObj.answer && wordObj.row !== undefined && wordObj.col !== undefined) {
            possible++;
            isGraded = true;
            let isWordCorrect = true;
            for (let i = 0; i < wordObj.answer.length; i++) {
              const r = dir === 'across' ? wordObj.row : wordObj.row + i;
              const c = dir === 'across' ? wordObj.col + i : wordObj.col;
              const studentLetter = studentAnswers[`${el.id}_${r}_${c}`] || '';
              if (studentLetter.toUpperCase() !== wordObj.answer[i].toUpperCase()) isWordCorrect = false;
            }
            if (isWordCorrect) correct++;
            else incorrect++;
          }
        });
      });
      if (!isGraded) possible++;
    } else if (el.type === 'record_compare') {
      possible++;
      if (studentAnswers[`${el.id}_recorded`]) correct++;
      else incorrect++;
    }

    return { possible, correct, incorrect };
  };

  const proceedToNext = () => {
    setNavButtonState('idle');
    setSelectedBankWord(null);
    if (currentStep < screensData.length - 1) {
      setCurrentStep((prev) => prev + 1);
      const container = document.getElementById('student-player-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const sessionEndTime = Date.now();
      const timeSpentSeconds = Math.floor((sessionEndTime - sessionStartTime) / 1000);

      const rawSubmissionPayload = {
        security_flag: 'raw_payload',
        studentId: student?.id,
        level: student?.level,
        unit: student?.unit,
        activityType: activityType,
        timeSpentSeconds: timeSpentSeconds,
        rawAnswers: { ...studentAnswers, ...dndAnswers },
      };

      onComplete(rawSubmissionPayload);
    }
  };

  const handleContinueClick = () => {
    if (navButtonState !== 'idle') {
      proceedToNext();
      return;
    }

    if (mediaRecorderRef.current && recordState === 'recording') mediaRecorderRef.current.stop();
    setRecordState('idle');
    if (targetAudioRef.current) targetAudioRef.current.pause();
    if (userAudioRef.current) userAudioRef.current.pause();

    const currentElements = screensData[currentStep] || [];
    const contentElements = currentElements.filter((el) => !['nav_button'].includes(el.type));

    let screenPossible = 0;
    let screenIncorrect = 0;

    contentElements.forEach((el) => {
      const { possible, incorrect } = evaluateElement(el);
      screenPossible += possible;
      screenIncorrect += incorrect;
    });

    if (screenPossible > 0) {
      if (screenIncorrect > 0) {
        setNavButtonState('incorrect');
        if (incorrectSoundRef.current) {
          incorrectSoundRef.current.currentTime = 0;
          incorrectSoundRef.current.play().catch(() => {});
        }
        const container = document.getElementById('student-player-container');
        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setNavButtonState('correct');
        if (correctSoundRef.current) {
          correctSoundRef.current.currentTime = 0;
          correctSoundRef.current.play().catch(() => {});
        }
      }
    } else {
      proceedToNext();
    }
  };

  const handleDragStart = (e, word) => {
    e.dataTransfer.setData('text/plain', word);
    setSelectedBankWord(word);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    if (navButtonState !== 'idle') return;
    const word = e.dataTransfer.getData('text/plain') || selectedBankWord;
    if (word) {
      setDndAnswers((prev) => ({ ...prev, [zoneId]: word }));
      setSelectedBankWord(null);
    }
  };

  const handleStartSession = () => {
    [correctSoundRef, incorrectSoundRef].forEach((ref) => {
      if (ref.current) {
        ref.current
          .play()
          .then(() => {
            ref.current.pause();
            ref.current.currentTime = 0;
          })
          .catch(() => {});
      }
    });
    setSessionStarted(true);
    setSessionStartTime(Date.now());
  };

  const levelCode = student?.level ? String(student.level).split(':')[0].trim() : 'A1';
  const unitDisplay = String(student?.unit || '1').replace(/^unit\s*/i, '');

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading) {
    return (
      <div className="ola-sp-root fixed inset-0 z-50 flex flex-col items-center justify-center font-montserrat">
        <PlayerThemeStyles />
        <PlayerBackdrop />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <OutLoudIcon className="w-16 h-16 animate-bounce" />
          <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR SCREEN
  // ==========================================
  if (error) {
    return (
      <div className="ola-sp-root fixed inset-0 z-50 flex flex-col items-center justify-center text-[#1e2246] font-montserrat px-5 text-center">
        <PlayerThemeStyles />
        <PlayerBackdrop />
        <div className="ola-sp-card-pearl ola-sp-enter relative z-10 rounded-[2.25rem] p-8 sm:p-10 max-w-md w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#ee665b]/15 border-2 border-[#ee665b] text-[#c93f34] flex items-center justify-center mb-4 font-extrabold text-2xl">
            !
          </div>
          <h2 className="text-2xl font-extrabold text-[#1e2246] mb-2 tracking-tight">
            Contenido No Encontrado
          </h2>
          <p className="text-[#4c5384] font-medium text-sm mb-7 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={onExit}
            className="ola-sp-btn-yellow w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            ← Volver al Hub
          </button>
        </div>
      </div>
    );
  }

  const showFeedback = navButtonState !== 'idle';
  const currentElements = screensData[currentStep] || [];
  const contentElements = currentElements.filter((el) => !['nav_button'].includes(el.type));
  const dockElements = currentElements.filter((el) => ['nav_button'].includes(el.type));
  const totalSteps = screensData.length || 1;
  const stepProgressPct = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <>
      <PlayerThemeStyles />
      <audio ref={correctSoundRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      <audio ref={incorrectSoundRef} src="https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3" preload="auto" />

      {/* ==========================================
          1. AUDIO GATEWAY LAUNCH CARD (Landing Grammar)
      ========================================== */}
      {!sessionStarted ? (
        <div className="ola-sp-root fixed inset-0 z-[600] flex flex-col items-center justify-center text-[#1e2246] font-montserrat px-4 sm:px-6 overflow-y-auto">
          <PlayerBackdrop />

          <div className="ola-sp-card-pearl ola-sp-enter relative z-10 p-6 sm:p-9 rounded-[2.5rem] flex flex-col items-center max-w-lg w-full text-center overflow-hidden my-auto">
            {/* Corner Watermark */}
            <div className="pointer-events-none select-none absolute -bottom-10 -right-10 opacity-[0.07]">
              <OutLoudIcon withTile={false} className="w-48 h-48" />
            </div>

            {/* Recessed Animated Audio Studio Stage */}
            <div className="w-full h-44 rounded-[1.75rem] bg-gradient-to-br from-[#fff9e8] via-[#f6f7fc] to-[#e8eaf7] border-2 border-white shadow-inner flex items-center justify-center relative mb-6 overflow-hidden">
              <div className="absolute top-3 left-3 bg-white/95 border border-[#ffc749] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1e2246] shadow-sm">
                Audio Listo
              </div>
              <div className="absolute top-3 right-3 bg-[#626a9f] text-white rounded-xl rounded-bl-sm px-2.5 py-1 text-[10px] font-bold shadow-sm">
                • • •
              </div>

              <div className="flex items-center gap-1.5 mr-4">
                {[14, 28, 18, 32].map((h, i) => (
                  <span
                    key={`gl-${i}`}
                    className="ola-sp-wave w-1.5 rounded-full"
                    style={{
                      height: `${h}px`,
                      backgroundColor: i % 2 === 0 ? '#626a9f' : '#ffc749',
                      animationDelay: `${i * 0.16}s`,
                    }}
                  />
                ))}
              </div>

              <div className="ola-sp-float relative z-10">
                <OutLoudIcon className="w-20 h-20 drop-shadow-[0_12px_20px_rgba(98,106,159,0.28)]" />
              </div>

              <div className="flex items-center gap-1.5 ml-4">
                {[32, 18, 28, 14].map((h, i) => (
                  <span
                    key={`gr-${i}`}
                    className="ola-sp-wave w-1.5 rounded-full"
                    style={{
                      height: `${h}px`,
                      backgroundColor: i % 2 === 0 ? '#ffc749' : '#626a9f',
                      animationDelay: `${(i + 2) * 0.16}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3 py-1 rounded-full">
                {activityType}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-3 py-1 rounded-full">
                Nivel {levelCode} • Unidad {unitDisplay}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-3 py-1 rounded-full">
                {totalSteps} {totalSteps === 1 ? 'Pantalla' : 'Pantallas'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e2246] mb-2 relative z-10">
              ¿Listo para <span className="text-[#626a9f]">empezar</span>
              <span className="text-[#ffc749]">?</span>
            </h1>
            <p className="text-[#4c5384] font-medium mb-7 text-xs sm:text-sm leading-relaxed max-w-sm relative z-10">
              Al iniciar activaremos el audio interactivo, reconocimiento vocal y el sistema de evaluación en tiempo real.
            </p>

            <button
              type="button"
              onClick={handleStartSession}
              className="ola-sp-btn-yellow w-full font-bold px-8 py-4 rounded-full uppercase tracking-widest cursor-pointer text-xs sm:text-sm relative z-10"
            >
              Comenzar {activityType} →
            </button>

            <button
              type="button"
              onClick={onExit}
              className="mt-4 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#454d82] hover:text-[#1e2246] hover:bg-white/75 transition-colors cursor-pointer relative z-10"
            >
              Volver al Hub
            </button>
          </div>
        </div>
      ) : (
        /* ==========================================
           2. ACTIVE INTERACTIVE STUDIO STAGE
        ========================================== */
        <div
          id="student-player-container"
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: 'none' }}
          className="ola-sp-root fixed inset-0 z-[500] flex flex-col text-[#1e2246] font-montserrat overflow-y-auto custom-scrollbar"
        >
          <PlayerBackdrop />

          {/* STICKY FLOATING-PILL TOP HEADER */}
          <header className="sticky top-0 w-full px-3.5 sm:px-6 lg:px-10 py-3 lg:py-3.5 z-50 shrink-0 border-b-2 lg:border-b border-[#1e2246]/10 lg:border-white/85 bg-[#fdfcf8]/95 lg:bg-white/60 lg:backdrop-blur-2xl">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
              {/* Left: Real OutLoud Logo */}
              <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                <OutLoudHorizontalLogo iconClass="w-9 h-9" wordmarkClass="h-7 w-auto" />
                <span className="hidden xl:inline-flex items-center text-[10px] font-bold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3 py-1 rounded-full">
                  {activityType} • U{unitDisplay}
                </span>
              </div>

              {/* Center: Floating White Progress Pill (Matches Landing Navbar Pill) */}
              <div className="flex-1 max-w-md bg-white/95 border border-white rounded-full px-3.5 sm:px-5 py-2 shadow-[0_10px_26px_-10px_rgba(69,77,130,0.22)] flex items-center gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1e2246] whitespace-nowrap">
                  {currentStep + 1} / {totalSteps}
                </span>
                <div className="flex-1 h-2.5 bg-[#e8eaf7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#626a9f] via-[#16a37f] to-[#ffc749] transition-all duration-500 ease-out"
                    style={{ width: `${stepProgressPct}%` }}
                  />
                </div>
                <span className="hidden sm:inline text-[10px] font-bold text-[#626a9f]">
                  {stepProgressPct}%
                </span>
              </div>

              {/* Right: Student Pill + Circular Exit Button */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="hidden md:flex items-center gap-2 bg-white/95 border border-white rounded-full py-1 pl-3 pr-1 shadow-sm">
                  <div className="flex flex-col text-right leading-none">
                    <span className="text-[11px] font-bold text-[#1e2246] max-w-[100px] truncate">
                      {student?.first_name}
                    </span>
                    <span className="text-[9px] text-[#626a9f] font-bold uppercase tracking-wider mt-0.5">
                      Nivel {levelCode}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#1e2246] bg-[#e8eaf7] flex items-center justify-center shrink-0">
                    {student?.avatar_url ? (
                      <img src={student.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="text-xs font-extrabold text-[#454d82]">
                        {student?.first_name?.[0] || 'O'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onExit}
                  aria-label="Salir de la actividad"
                  title="Volver al Hub"
                  className="w-10 h-10 bg-white hover:bg-[#ee665b] text-[#1e2246] hover:text-white rounded-full border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center transition-all active:translate-y-0.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* STAGE CANVAS */}
          <main
            key={currentStep}
            className="ola-sp-enter flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-10 pb-36 relative z-10 flex flex-col gap-7"
          >
            {contentElements.map((el) => {
              const isMedia = ['video', 'image', 'audio'].includes(el.type);
              const isCard = [
                'short_answer',
                'multiple_selection',
                'slider_bar',
                'fill_in_the_blank',
                'drag_and_drop',
                'crossword',
                'word_search',
                'record_compare',
              ].includes(el.type);

              /* ---------- MEDIA CARDS (VIDEO / IMAGE / AUDIO) ---------- */
              if (isMedia) {
                return (
                  <div
                    key={el.id}
                    className={`ola-sp-card-pearl w-full ${
                      el.type === 'video' ? 'max-w-5xl' : 'max-w-4xl'
                    } rounded-[2.25rem] p-3 sm:p-5 mx-auto relative overflow-hidden`}
                  >
                    {el.type === 'video' && (() => {
                      const videoSrc = extractVideoUrl(el.url);
                      const directFile = isDirectVideoUrl(videoSrc);
                      const isBunnyEmbed = /mediadelivery\.net/i.test(videoSrc);

                      return (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between px-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3 py-1 rounded-full">
                              Video Interactivo
                            </span>
                            {videoWatched && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#e7faf3] text-[#128063] px-3 py-1 rounded-full">
                                ✓ Visto
                              </span>
                            )}
                          </div>

                          <div className="ola-sp-video-stage w-full rounded-[1.6rem] border-2 border-[#1e2246]/15 overflow-hidden flex items-center justify-center p-2 sm:p-3 shadow-inner">
                            {directFile ? (
                              <video
                                src={videoSrc}
                                controls
                                playsInline
                                controlsList="nodownload"
                                onContextMenu={(e) => e.preventDefault()}
                                onEnded={() => setVideoWatched(true)}
                                className="w-auto max-w-full max-h-[68vh] rounded-[1.15rem] bg-transparent shadow-md"
                              />
                            ) : (
                              <iframe
                                src={videoSrc}
                                title="Lesson Video"
                                allowTransparency="true"
                                className={`border-0 rounded-[1.15rem] bg-transparent ${
                                  isBunnyEmbed
                                    ? 'w-full max-w-[740px] aspect-[4/3] mx-auto shadow-md'
                                    : 'w-full aspect-video'
                                }`}
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                allowFullScreen
                              />
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {el.type === 'image' && (
                      <div className="bg-[#f4f6fc] rounded-[1.6rem] p-2 sm:p-3 border border-white flex items-center justify-center">
                        <img
                          src={el.url || el.data?.imageUrl}
                          alt="Visual Lesson Asset"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ WebkitUserDrag: 'none' }}
                          className="w-full h-auto max-h-[650px] object-contain rounded-[1.25rem] select-none pointer-events-none"
                        />
                      </div>
                    )}

                    {el.type === 'audio' && (
                      <div className="p-4 sm:p-7 w-full flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3.5 py-1 rounded-full">
                            <span className="flex items-center gap-0.5 h-3">
                              {[5, 10, 7, 11, 6].map((h, i) => (
                                <span
                                  key={i}
                                  className="ola-sp-wave w-0.5 rounded-full bg-[#454d82]"
                                  style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                                />
                              ))}
                            </span>
                            <span>Escucha con Atención</span>
                          </span>
                        </div>

                        {el.data?.imageUrl && (
                          <img
                            src={el.data.imageUrl}
                            alt="Audio Cover"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ WebkitUserDrag: 'none' }}
                            className="w-full max-w-md rounded-3xl shadow-md mb-6 border-2 border-white select-none pointer-events-none"
                          />
                        )}

                        <div className="w-full max-w-2xl bg-[#f4f6fc] border-2 border-white rounded-2xl p-3 shadow-inner">
                          <audio
                            src={el.url || el.data?.audioUrl}
                            controls
                            controlsList="nodownload"
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              /* ---------- EDITORIAL TEXT BANNER (Signature Periwinkle-Indigo Hero Card) ---------- */
              if (el.type === 'text') {
                return (
                  <div
                    key={el.id}
                    className="ola-sp-card-indigo w-full max-w-4xl mx-auto rounded-[2.25rem] p-6 sm:p-10 text-center text-white relative overflow-hidden"
                  >
                    <div className="pointer-events-none select-none absolute -bottom-12 -right-10 opacity-[0.12]">
                      <OutLoudIcon withTile={false} className="w-44 h-44" />
                    </div>
                    <div
                      dangerouslySetInnerHTML={{ __html: el.htmlContent }}
                      className="rich-text-content relative z-10 pointer-events-none text-white text-sm sm:text-base leading-relaxed [&_span]:!leading-snug [&_span]:!whitespace-normal"
                    />
                  </div>
                );
              }

              /* ---------- INTERACTIVE EXERCISE CARDS ---------- */
              if (isCard) {
                const meta = ELEMENT_META[el.type] || {
                  label: 'Actividad',
                  badge: 'bg-[#e8eaf7] text-[#454d82] border-[#626a9f]/30',
                };

                return (
                  <div
                    key={el.id}
                    className="ola-sp-card-pearl w-full max-w-4xl mx-auto rounded-[2.25rem] p-5 sm:p-8 flex flex-col gap-6 relative overflow-hidden"
                  >
                    {/* Card Header Badge Strip */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#626a9f]/15">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#626a9f]">
                        Unidad {unitDisplay}
                      </span>
                    </div>

                    {/* Optional Visual Prompt Image */}
                    {el.data?.imageUrl && (
                      <div className="w-full rounded-[1.5rem] bg-[#f4f6fc] border border-white p-2 flex items-center justify-center">
                        <img
                          src={el.data.imageUrl}
                          alt="Visual Prompt"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ WebkitUserDrag: 'none' }}
                          className="w-full h-64 sm:h-80 object-cover rounded-[1.2rem] select-none pointer-events-none"
                        />
                      </div>
                    )}

                    {/* 1. RECORD & COMPARE */}
                    {el.type === 'record_compare' && (
                      <RecordCompareActivity
                        targetText={el.data?.transcriptText || el.data?.text || ''}
                        audioUrl={el.data?.audioUrl || el.data?.audio || ''}
                        lessonId={el.data?.lessonId || lessonId || student?.lessonId || 'standalone-lesson'}
                        nodeId={el.id}
                        cefrLevel={levelCode}
                        onComplete={({ overallScore, pointsAwarded, passed }) => {
                          setNavButtonState('idle');
                          setStudentAnswers((prev) => ({
                            ...prev,
                            [`${el.id}_recorded`]: passed,
                            [`${el.id}_score`]: overallScore,
                            [`${el.id}_points`]: pointsAwarded,
                          }));
                          proceedToNext();
                        }}
                      />
                    )}

                    {/* 2. FILL IN THE BLANK */}
                    {el.type === 'fill_in_the_blank' &&
                      el.data &&
                      (() => {
                        const rawText = el.data.templateText || '';
                        if (!rawText) return null;
                        const parts = rawText.split(/(_+)/);
                        let blankIndex = 0;
                        const rawGroups = (el.data.answerText || '').split(',');

                        return (
                          <div className="w-full bg-[#f4f6fc] border border-white rounded-[1.5rem] p-5 sm:p-8 flex flex-col justify-center items-center">
                            <div
                              className="text-center w-full break-words leading-[3.7rem] text-[#1e2246]"
                              style={{
                                fontSize: el.data.t_fontSize ? `${el.data.t_fontSize}px` : '20px',
                                fontFamily: el.data.t_fontFamily || 'Montserrat',
                                fontWeight: el.data.t_isBold ? 'bold' : '600',
                              }}
                            >
                              {parts.map((part, i) => {
                                if (part.includes('_')) {
                                  const currentBlankIndex = blankIndex++;
                                  const blankWidth = Math.max(88, Math.min(part.length * 20, 280));

                                  const targetGroup = rawGroups[currentBlankIndex] || '';
                                  const cleanedTarget = targetGroup.replace(/^["'\s]+|["'\s]+$/g, '');
                                  const validOptions = cleanedTarget.split(/[|/]/).map((w) => w.trim());
                                  const studentAns = (studentAnswers[`${el.id}_${currentBlankIndex}`] || '').trim();
                                  const isCorrect = validOptions.some((opt) => cleanStr(opt) === cleanStr(studentAns));

                                  return (
                                    <span key={i} className="relative inline-block mx-2">
                                      {showFeedback && !isCorrect && (
                                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-[#128063] font-extrabold text-xs whitespace-nowrap bg-[#e7faf3] px-3 py-1 rounded-full border-2 border-[#16a37f] shadow-md z-50">
                                          ✓ {validOptions[0]}
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        disabled={showFeedback}
                                        value={studentAnswers[`${el.id}_${currentBlankIndex}`] || ''}
                                        onChange={(e) =>
                                          setStudentAnswers((prev) => ({
                                            ...prev,
                                            [`${el.id}_${currentBlankIndex}`]: e.target.value,
                                          }))
                                        }
                                        className={`px-3.5 py-1.5 border-2 outline-none transition-all rounded-xl font-extrabold text-center shadow-sm ${
                                          showFeedback
                                            ? isCorrect
                                              ? 'bg-[#e7faf3] border-[#16a37f] text-[#128063]'
                                              : 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                                            : 'bg-white border-[#626a9f]/35 text-[#1e2246] focus:border-[#1e2246] focus:bg-[#fff9e8]'
                                        }`}
                                        style={{ width: `${blankWidth}px` }}
                                      />
                                    </span>
                                  );
                                }
                                return <span key={i} dangerouslySetInnerHTML={{ __html: normalizeLightHtml(part) }} />;
                              })}
                            </div>
                          </div>
                        );
                      })()}

                    {/* 3. SHORT ANSWER */}
                    {el.type === 'short_answer' &&
                      el.data &&
                      (() => {
                        const ans = cleanStr(studentAnswers[el.id]);
                        const target = cleanStr(el.data.correctAnswer);
                        const isCorrect = ans === target;

                        return (
                          <div className="flex flex-col w-full gap-4">
                            <div
                              dangerouslySetInnerHTML={{ __html: normalizeLightHtml(el.data.questionHtml) }}
                              className="w-full break-words text-[#1e2246] text-lg sm:text-xl font-bold leading-snug"
                            />
                            <div className="relative w-full">
                              {showFeedback && !isCorrect && (
                                <div className="mb-3 inline-flex items-center gap-2 text-[#128063] font-bold text-xs sm:text-sm bg-[#e7faf3] border-2 border-[#16a37f]/45 rounded-2xl px-4 py-2">
                                  <span>Respuesta esperada:</span>
                                  <strong>{el.data.correctAnswer}</strong>
                                </div>
                              )}
                              <input
                                type="text"
                                placeholder="Escribe tu respuesta aquí..."
                                disabled={showFeedback}
                                value={studentAnswers[el.id] || ''}
                                onChange={(e) =>
                                  setStudentAnswers((prev) => ({ ...prev, [el.id]: e.target.value }))
                                }
                                className={`w-full p-4 sm:p-5 border-2 rounded-2xl font-bold transition-all placeholder-[#626a9f]/50 text-base sm:text-lg outline-none shadow-sm ${
                                  showFeedback
                                    ? isCorrect
                                      ? 'bg-[#e7faf3] border-[#16a37f] text-[#128063]'
                                      : 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                                    : 'bg-white border-[#dfe2f2] focus:border-[#1e2246] focus:bg-[#fffdf6] text-[#1e2246]'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })()}

                    {/* 4. MULTIPLE SELECTION (Tactile A/B/C/D Keycaps) */}
                    {el.type === 'multiple_selection' && el.data && (
                      <div className="flex flex-col w-full gap-5">
                        {el.data.promptHtml && (
                          <div
                            dangerouslySetInnerHTML={{ __html: normalizeLightHtml(el.data.promptHtml) }}
                            className="text-lg sm:text-xl font-bold text-[#1e2246] leading-snug"
                          />
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
                          {el.data.options?.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                            const isCorrectOpt = opt.isCorrect;

                            let cardClasses =
                              'bg-white border-[#dfe2f2] text-[#1e2246] hover:border-[#454d82] hover:-translate-y-0.5 shadow-sm';
                            let keycapClasses = 'bg-[#e8eaf7] text-[#454d82] border-transparent';

                            if (isSelected && !showFeedback) {
                              cardClasses =
                                'bg-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_4px_0_#1e2246] -translate-y-0.5';
                              keycapClasses = 'bg-[#1e2246] text-[#ffc749] border-[#1e2246]';
                            }

                            if (showFeedback) {
                              if (isSelected && isCorrectOpt) {
                                cardClasses = 'bg-[#e7faf3] border-[#16a37f] text-[#128063] shadow-[0_3px_0_#16a37f]';
                                keycapClasses = 'bg-[#16a37f] text-white border-[#16a37f]';
                              } else if (isSelected && !isCorrectOpt) {
                                cardClasses = 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34] shadow-[0_3px_0_#ee665b]';
                                keycapClasses = 'bg-[#ee665b] text-white border-[#ee665b]';
                              } else if (!isSelected && isCorrectOpt) {
                                cardClasses = 'bg-[#e7faf3]/70 border-[#16a37f] text-[#128063] border-dashed';
                                keycapClasses = 'bg-[#16a37f] text-white border-[#16a37f]';
                              } else {
                                cardClasses = 'bg-white/60 border-[#dfe2f2] text-[#626a9f] opacity-65';
                                keycapClasses = 'bg-[#f4f6fc] text-[#626a9f] border-transparent';
                              }
                            }

                            return (
                              <button
                                type="button"
                                key={opt.id}
                                disabled={showFeedback}
                                onClick={() =>
                                  setStudentAnswers((prev) => ({
                                    ...prev,
                                    [`${el.id}_${opt.id}`]: !prev[`${el.id}_${opt.id}`],
                                  }))
                                }
                                className={`w-full p-4 sm:p-5 border-2 rounded-2xl text-left transition-all duration-150 active:translate-y-0.5 flex items-center gap-3.5 cursor-pointer ${cardClasses}`}
                              >
                                <span
                                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${keycapClasses}`}
                                >
                                  {showFeedback && isCorrectOpt ? '✓' : showFeedback && isSelected ? '✕' : letter}
                                </span>
                                <div
                                  dangerouslySetInnerHTML={{ __html: normalizeLightHtml(opt.html) }}
                                  className="pointer-events-none text-sm sm:text-base font-bold leading-snug"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 5. DRAG AND DROP (Supports Desktop Drag + Mobile Tap-to-Place) */}
                    {el.type === 'drag_and_drop' && el.data && (
                      <div className="flex flex-col gap-6 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                          {el.data.items.map((item, idx) => {
                            if (!item.imageUrl) return null;
                            const zoneId = `${el.id}_${idx}`;
                            const placed = dndAnswers[zoneId];
                            const target = item.targetText;
                            const isCorrect = cleanStr(placed) === cleanStr(target);

                            let dropClass = selectedBankWord
                              ? 'bg-[#fff9e8] border-[#ffc749] ring-2 ring-[#ffc749]/40 cursor-pointer'
                              : 'bg-[#f4f6fc] border-[#626a9f]/35';
                            let pillClass = 'bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246]';

                            if (showFeedback && placed) {
                              if (isCorrect) {
                                dropClass = 'bg-[#e7faf3] border-[#16a37f]';
                                pillClass = 'bg-[#16a37f] text-white border-2 border-[#1e2246]';
                              } else {
                                dropClass = 'bg-[#ee665b]/15 border-[#ee665b]';
                                pillClass = 'bg-[#ee665b] text-white border-2 border-[#1e2246]';
                              }
                            }

                            return (
                              <div key={idx} className="bg-white rounded-[1.75rem] border border-[#dfe2f2] p-3.5 flex flex-col items-center gap-3.5 shadow-sm">
                                <img
                                  src={item.imageUrl}
                                  draggable="false"
                                  onContextMenu={(e) => e.preventDefault()}
                                  style={{ WebkitUserDrag: 'none' }}
                                  className="w-full aspect-[4/5] rounded-2xl object-cover border border-[#dfe2f2] select-none pointer-events-none"
                                  alt="Match Target"
                                />
                                <div
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, zoneId)}
                                  onClick={() => {
                                    if (showFeedback) return;
                                    if (selectedBankWord) {
                                      setDndAnswers((prev) => ({ ...prev, [zoneId]: selectedBankWord }));
                                      setSelectedBankWord(null);
                                    }
                                  }}
                                  className={`w-full min-h-[68px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all p-2 ${dropClass}`}
                                >
                                  {placed ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        if (!showFeedback) {
                                          e.stopPropagation();
                                          setDndAnswers((prev) => {
                                            const copy = { ...prev };
                                            delete copy[zoneId];
                                            return copy;
                                          });
                                        }
                                      }}
                                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm w-full text-center transition-transform ${
                                        showFeedback ? '' : 'hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer'
                                      } ${pillClass}`}
                                    >
                                      {placed}
                                    </button>
                                  ) : (
                                    <span className="text-[10.5px] uppercase font-bold tracking-widest text-[#626a9f]/70">
                                      {selectedBankWord ? 'Toca aquí para soltar' : 'Arrastra o toca aquí'}
                                    </span>
                                  )}
                                  {showFeedback && !isCorrect && (
                                    <span className="mt-1.5 text-[11px] font-bold text-[#128063]">
                                      ✓ {target}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Butter-Gold Word Bank Tray */}
                        <div className="ola-sp-card-gold w-full p-5 sm:p-6 rounded-[1.75rem] flex flex-col items-center">
                          <div className="text-center font-extrabold text-[#1e2246] text-[11px] uppercase tracking-widest mb-4">
                            Banco de Palabras • Arrastra o toca una ficha
                          </div>
                          <div className="flex flex-wrap justify-center gap-2.5 w-full">
                            {el.data.items.map((item, idx) => {
                              if (!item.studentViewText) return null;
                              const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                              if (isUsed) return null;
                              const isPicked = selectedBankWord === item.studentViewText;
                              return (
                                <button
                                  type="button"
                                  key={`bank-${idx}`}
                                  draggable={!showFeedback}
                                  onDragStart={(e) => handleDragStart(e, item.studentViewText)}
                                  onClick={() =>
                                    !showFeedback &&
                                    setSelectedBankWord((prev) =>
                                      prev === item.studentViewText ? null : item.studentViewText
                                    )
                                  }
                                  className={`px-5 py-2.5 border-2 rounded-xl font-bold text-xs sm:text-sm cursor-grab active:cursor-grabbing transition-all ${
                                    isPicked
                                      ? 'bg-[#1e2246] text-[#ffc749] border-[#1e2246] -translate-y-1 shadow-md'
                                      : 'bg-white text-[#1e2246] border-[#1e2246] shadow-[0_3px_0_#1e2246] hover:-translate-y-0.5'
                                  }`}
                                >
                                  {item.studentViewText}
                                </button>
                              );
                            })}
                            {Object.keys(dndAnswers).length ===
                              el.data.items.filter((i) => i.imageUrl).length && (
                              <span className="text-[#128063] font-extrabold text-xs uppercase tracking-widest py-2">
                                ✓ Todas las fichas ubicadas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. SLIDER BAR */}
                    {el.type === 'slider_bar' &&
                      el.data &&
                      (() => {
                        const isVert = el.data.orientation === 'vertical';
                        const opts = el.data.options || [];
                        const maxIdx = Math.max(0, opts.length - 1);
                        const currentIdx =
                          studentAnswers[el.id] !== undefined
                            ? parseInt(studentAnswers[el.id], 10)
                            : Math.floor(maxIdx / 2);
                        const activeOpt = opts[currentIdx] || {};
                        const pct = maxIdx === 0 ? 50 : (currentIdx / maxIdx) * 100;

                        const correctIdx = opts.findIndex((opt) => opt.isCorrect);
                        const isCorrect = currentIdx === correctIdx;
                        const barBg = showFeedback
                          ? isCorrect
                            ? 'rgba(22, 163, 127, 0.45)'
                            : 'rgba(238, 102, 91, 0.45)'
                          : el.data.barColor || '#dfe2f2';
                        const thumbColor = showFeedback
                          ? isCorrect
                            ? '#16a37f'
                            : '#ee665b'
                          : el.data.handleColor || '#ffc749';

                        return (
                          <div className="w-full bg-[#f4f6fc] border border-white rounded-[1.5rem] p-6 sm:p-8 flex flex-col min-h-[210px] justify-center relative">
                            <div className="relative w-full h-36 flex flex-col items-center justify-center">
                              <div
                                className="absolute rounded-full border border-[#1e2246]/15"
                                style={{
                                  backgroundColor: barBg,
                                  width: isVert ? `${el.data.barThickness || 14}px` : '100%',
                                  height: isVert ? '100%' : `${el.data.barThickness || 14}px`,
                                }}
                              />
                              <input
                                type="range"
                                min="0"
                                max={maxIdx}
                                step="1"
                                disabled={showFeedback}
                                value={currentIdx}
                                onChange={(e) =>
                                  setStudentAnswers((prev) => ({ ...prev, [el.id]: e.target.value }))
                                }
                                className="ola-sp-slider absolute w-full h-full z-10 cursor-pointer"
                                style={{
                                  '--thumb-color': thumbColor,
                                  transform: isVert ? 'rotate(-90deg)' : 'none',
                                }}
                              />
                              {!isVert && (
                                <div
                                  className="absolute flex flex-col items-center transition-all duration-150 pointer-events-none z-20"
                                  style={{
                                    left: `${pct}%`,
                                    bottom: 'calc(50% + 26px)',
                                    transform: 'translateX(-50%)',
                                  }}
                                >
                                  <div className="bg-[#1e2246] text-[#ffc749] px-4 py-2 rounded-xl shadow-lg font-extrabold text-xs sm:text-sm whitespace-nowrap">
                                    {activeOpt.text}
                                  </div>
                                  <div
                                    className="w-0 h-0 border-solid"
                                    style={{
                                      borderWidth: '8px 6px 0 6px',
                                      borderColor: '#1e2246 transparent transparent transparent',
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {showFeedback && !isCorrect && correctIdx !== -1 && (
                              <p className="text-center text-xs font-bold text-[#128063] mt-2">
                                Respuesta correcta: {opts[correctIdx]?.text}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                    {/* 7. CROSSWORD & WORD SEARCH */}
                    {(el.type === 'crossword' || el.type === 'word_search') && el.data && (
                      <div className="w-full flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-[36%] flex flex-col gap-4">
                          {el.type === 'crossword' && (
                            <>
                              <div className="bg-[#f4f6fc] p-5 rounded-2xl border border-white">
                                <h4 className="text-[11px] font-extrabold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2 mb-3">
                                  Horizontales (Across)
                                </h4>
                                <div className="flex flex-col gap-2.5">
                                  {el.data.across?.map((a) => (
                                    <div key={`a-${a.num}`} className="text-xs sm:text-sm text-[#1e2246] flex gap-2">
                                      <span className="font-extrabold text-[#454d82]">{a.num}.</span>
                                      <span className="font-medium leading-snug">{a.prompt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-[#f4f6fc] p-5 rounded-2xl border border-white">
                                <h4 className="text-[11px] font-extrabold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2 mb-3">
                                  Verticales (Down)
                                </h4>
                                <div className="flex flex-col gap-2.5">
                                  {el.data.down?.map((d) => (
                                    <div key={`d-${d.num}`} className="text-xs sm:text-sm text-[#1e2246] flex gap-2">
                                      <span className="font-extrabold text-[#454d82]">{d.num}.</span>
                                      <span className="font-medium leading-snug">{d.prompt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {el.type === 'word_search' && (
                            <div className="bg-[#f4f6fc] p-5 rounded-2xl border border-white flex flex-col gap-4">
                              <div
                                dangerouslySetInnerHTML={{ __html: normalizeLightHtml(el.data.promptHtml) }}
                                className="w-full whitespace-pre-wrap break-words border-b border-[#626a9f]/15 pb-3 text-base font-bold text-[#1e2246]"
                              />
                              <div className="flex flex-wrap gap-2">
                                {el.data.targetWords?.map((w, i) => (
                                  <div
                                    key={i}
                                    className="bg-white px-3 py-1.5 rounded-xl border border-[#dfe2f2] text-xs font-extrabold text-[#1e2246] tracking-wider flex items-center gap-2 shadow-sm"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-[#ffc749] border border-[#1e2246]" />
                                    {w}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-full lg:w-[64%] bg-[#f4f6fc] rounded-[1.75rem] border border-white p-3 sm:p-5 flex flex-col items-center shadow-inner">
                          <div className="lg:hidden w-full text-center py-1.5 mb-3 bg-[#fff3d1] border border-[#ffc749] rounded-xl">
                            <span className="text-[10px] font-bold text-[#1e2246] uppercase tracking-widest">
                              Desliza para explorar el tablero
                            </span>
                          </div>

                          <div
                            className="w-full max-h-[60vh] lg:max-h-none overflow-auto custom-scrollbar touch-pan-x touch-pan-y rounded-2xl flex justify-center items-start"
                            style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
                          >
                            <div className="w-fit p-2 min-w-full flex justify-center items-center">
                              {el.type === 'crossword' && (
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${el.data.grid[0]?.length || 1}, minmax(40px, 1fr))`,
                                    gap: '4px',
                                    width: 'fit-content',
                                  }}
                                  className="mx-auto"
                                >
                                  {el.data.grid.map((row, rIdx) =>
                                    row.map((cell, cIdx) => {
                                      if (!cell) {
                                        return (
                                          <div
                                            key={`${rIdx}-${cIdx}`}
                                            className="relative aspect-square w-10 md:w-12 bg-transparent"
                                          />
                                        );
                                      }

                                      const studentLetter = studentAnswers[`${el.id}_${rIdx}_${cIdx}`] || '';
                                      const targetLetter = cell.char || '';
                                      const isCellFeedback = showFeedback && studentLetter;
                                      const isCorrect = studentLetter.toUpperCase() === targetLetter.toUpperCase();

                                      return (
                                        <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-10 md:w-12">
                                          <div className="w-full h-full relative">
                                            {cell.num && (
                                              <span className="absolute top-1 left-1.5 text-[9px] font-extrabold text-[#454d82] z-10 pointer-events-none">
                                                {cell.num}
                                              </span>
                                            )}
                                            <input
                                              type="text"
                                              maxLength={1}
                                              disabled={showFeedback}
                                              value={studentLetter}
                                              onChange={(e) =>
                                                setStudentAnswers((prev) => ({
                                                  ...prev,
                                                  [`${el.id}_${rIdx}_${cIdx}`]: e.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z]/g, ''),
                                                }))
                                              }
                                              style={{
                                                fontSize: el.data.fontSize ? `${el.data.fontSize}px` : undefined,
                                                fontFamily: el.data.fontFamily,
                                                fontWeight: el.data.isBold ? 'bold' : '700',
                                              }}
                                              className={`w-full h-full text-center uppercase focus:outline-none transition rounded-xl font-bold shadow-sm ${
                                                isCellFeedback
                                                  ? isCorrect
                                                    ? 'bg-[#e7faf3] border-2 border-[#16a37f] text-[#128063]'
                                                    : 'bg-[#ee665b]/20 border-2 border-[#ee665b] text-[#c93f34]'
                                                  : 'bg-white border-2 border-[#626a9f]/35 text-[#1e2246] focus:border-[#1e2246] focus:bg-[#fff9e8]'
                                              }`}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}

                              {el.type === 'word_search' && (
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${el.data.size || 10}, 1fr)`,
                                    borderWidth: '3px',
                                    borderStyle: 'solid',
                                    borderColor: el.data.lineColor || '#1e2246',
                                    backgroundColor: el.data.cellColor || '#ffffff',
                                  }}
                                  className="shadow-md w-full max-w-[460px] aspect-square rounded-2xl overflow-hidden relative mx-auto"
                                >
                                  {el.data.grid?.map((row, rIdx) =>
                                    row.map((char, cIdx) => {
                                      const cellId = `${rIdx}_${cIdx}`;
                                      const studentCells = studentAnswers[`${el.id}_cells`] || [];
                                      const isSelected = studentCells.includes(cellId);

                                      let isTargetCell = false;
                                      if (el.data.placedWords) {
                                        isTargetCell = el.data.placedWords.some(
                                          (pw) =>
                                            pw.cells.includes(cellId) || pw.cells.includes(`${rIdx}-${cIdx}`)
                                        );
                                      }

                                      let cellBg = isSelected ? 'rgba(255, 199, 73, 0.72)' : 'transparent';

                                      if (showFeedback) {
                                        if (isSelected && isTargetCell) {
                                          cellBg = 'rgba(22, 163, 127, 0.35)';
                                        } else if (isSelected && !isTargetCell) {
                                          cellBg = 'rgba(238, 102, 91, 0.35)';
                                        } else if (!isSelected && isTargetCell) {
                                          cellBg = 'rgba(22, 163, 127, 0.16)';
                                        }
                                      }

                                      return (
                                        <div
                                          key={cellId}
                                          onClick={() =>
                                            !showFeedback &&
                                            setStudentAnswers((prev) => {
                                              const current = prev[`${el.id}_cells`] || [];
                                              return {
                                                ...prev,
                                                [`${el.id}_cells`]: current.includes(cellId)
                                                  ? current.filter((c) => c !== cellId)
                                                  : [...current, cellId],
                                              };
                                            })
                                          }
                                          style={{
                                            fontSize: el.data.fontSize ? `${el.data.fontSize}px` : undefined,
                                            fontFamily: el.data.fontFamily,
                                            fontWeight: el.data.isBold ? 'bold' : '700',
                                            borderRight:
                                              cIdx < (el.data.size || 10) - 1
                                                ? `1px solid ${el.data.lineColor || 'rgba(98,106,159,0.22)'}`
                                                : 'none',
                                            borderBottom:
                                              rIdx < (el.data.size || 10) - 1
                                                ? `1px solid ${el.data.lineColor || 'rgba(98,106,159,0.22)'}`
                                                : 'none',
                                            backgroundColor: cellBg,
                                            cursor: showFeedback ? 'default' : 'pointer',
                                          }}
                                          className="flex items-center justify-center transition-colors select-none font-bold text-[#1e2246]"
                                        >
                                          {char}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </main>

          {/* FLOATING BOTTOM ACTION & FEEDBACK DOCK */}
          {dockElements.some(
            (el) => el.type === 'nav_button' && !contentElements.some((c) => c.type === 'record_compare')
          ) && (
            <div
              className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-[520] flex justify-center pointer-events-none"
              style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              <div className="ola-sp-card-pearl pointer-events-auto rounded-full p-1.5 sm:p-2 pl-4 sm:pl-6 max-w-2xl w-full flex items-center justify-between gap-2.5 sm:gap-3 relative shadow-[0_6px_0_#1e2246,0_16px_32px_-10px_rgba(30,34,70,0.34)] lg:shadow-[0_18px_40px_-12px_rgba(30,34,70,0.34)]">
                {/* Spark burst on perfect check */}
                {navButtonState === 'correct' && (
                  <div className="pointer-events-none absolute -top-2 left-10 flex items-center justify-center">
                    {[0, 60, 120, 180, 240, 300].map((deg, idx) => (
                      <span key={deg} className="absolute" style={{ transform: `rotate(${deg}deg)` }}>
                        <span
                          className="ola-sp-spark block rounded-full"
                          style={{
                            width: '7px',
                            height: '7px',
                            backgroundColor: idx % 2 === 0 ? '#ffc749' : '#16a37f',
                          }}
                        />
                      </span>
                    ))}
                  </div>
                )}

                {/* Left Status Text */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      navButtonState === 'correct'
                        ? 'bg-[#16a37f]'
                        : navButtonState === 'incorrect'
                        ? 'bg-[#ee665b]'
                        : 'bg-[#ffc749] border border-[#1e2246]'
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm font-extrabold truncate ${
                      navButtonState === 'correct'
                        ? 'text-[#128063]'
                        : navButtonState === 'incorrect'
                        ? 'text-[#c93f34]'
                        : 'text-[#454d82]'
                    }`}
                  >
                    {navButtonState === 'correct'
                      ? '¡Excelente! Respuesta correcta.'
                      : navButtonState === 'incorrect'
                      ? 'Revisa las correcciones arriba.'
                      : `Paso ${currentStep + 1} de ${totalSteps}`}
                  </span>
                </div>

                {/* Right Tactile Action Button */}
                {dockElements.map((el) => {
                  if (el.type !== 'nav_button') return null;

                  let btnClass = 'ola-sp-btn-yellow';
                  let btnText = 'Confirmar';

                  if (navButtonState === 'correct') {
                    btnClass = 'ola-sp-btn-mint';
                    btnText =
                      el.data?.buttonStyle === 'finish_pill'
                        ? 'Finalizar y Ver Nota ✓'
                        : 'Continuar →';
                  } else if (navButtonState === 'incorrect') {
                    btnClass = 'ola-sp-btn-coral';
                    btnText =
                      el.data?.buttonStyle === 'finish_pill'
                        ? 'Finalizar y Ver Nota →'
                        : 'Continuar →';
                  }

                  return (
                    <button
                      type="button"
                      key={el.id}
                      onClick={handleContinueClick}
                      className={`font-bold px-6 sm:px-9 py-3 rounded-full uppercase tracking-widest text-[11px] sm:text-xs text-center cursor-pointer shrink-0 ${btnClass}`}
                    >
                      {btnText}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentPlayer;