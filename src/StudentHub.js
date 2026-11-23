import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './SupabaseClient';
import RecordCompareActivity from './RecordCompareActivity';
import { OutLoudHorizontalLogo, OutLoudIcon } from './components/OutLoudBrand';

const extractVideoUrl = (rawInput) => {
  if (!rawInput) return '';
  if (rawInput.includes('<iframe') && rawInput.includes('src=')) {
    const match = rawInput.match(/src=["'](.*?)["']/);
    if (match && match[1]) return match[1];
  }
  return rawInput;
};

// Strips punctuation and spaces for bulletproof string comparison
const cleanStr = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim().toLowerCase();
};

const PlayerThemeStyles = () => (
  <style>{`
    .ola-player-glass {
      background: linear-gradient(142deg, rgba(255, 255, 255, 0.82) 0%, rgba(244, 246, 255, 0.62) 100%);
      backdrop-filter: blur(26px) saturate(185%);
      -webkit-backdrop-filter: blur(26px) saturate(185%);
      border: 1.5px solid rgba(255, 255, 255, 0.94);
      box-shadow:
        0 18px 42px -14px rgba(55, 63, 118, 0.22),
        inset 0 1.5px 1px rgba(255, 255, 255, 0.96);
    }
    .ola-player-glass-gold {
      background: linear-gradient(148deg, rgba(255, 246, 218, 0.92) 0%, rgba(255, 229, 156, 0.72) 100%);
      backdrop-filter: blur(26px) saturate(190%);
      -webkit-backdrop-filter: blur(26px) saturate(190%);
      border: 1.5px solid rgba(255, 255, 255, 0.95);
      box-shadow:
        0 20px 44px -14px rgba(196, 138, 12, 0.24),
        inset 0 2px 2px rgba(255, 255, 255, 0.95);
    }
    .ola-player-btn-yellow {
      background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
      color: #1e2246;
      border: 2px solid #1e2246;
      box-shadow: 0 5px 0 #1e2246, 0 14px 28px -6px rgba(255, 199, 73, 0.6);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s cubic-bezier(0.22, 1, 0.36, 1), filter 0.14s ease-out;
    }
    .ola-player-btn-yellow:hover {
      filter: brightness(1.04);
      transform: translateY(-2px);
      box-shadow: 0 7px 0 #1e2246, 0 18px 34px -6px rgba(255, 199, 73, 0.75);
    }
    .ola-player-btn-yellow:active {
      transform: translateY(3px) scale(0.99);
      box-shadow: 0 1px 0 #1e2246;
      transition-duration: 0.06s;
    }
    .ola-player-btn-outline {
      background: rgba(255, 255, 255, 0.82);
      color: #1e2246;
      border: 2px solid rgba(30, 34, 70, 0.85);
      box-shadow: 0 3px 0 rgba(30, 34, 70, 0.18);
      transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, background 0.14s ease;
    }
    .ola-player-btn-outline:hover {
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 5px 0 #626a9f;
    }
    .ola-player-btn-outline:active {
      transform: translateY(2px) scale(0.99);
      box-shadow: 0 1px 0 rgba(30, 34, 70, 0.2);
    }
    .ola-player-root .font-black { font-weight: 800; }
    .ola-player-root .font-extrabold { font-weight: 700; }
    .ola-player-root h2.font-black,
    .ola-player-root h4.font-black,
    .ola-player-root button.font-black { font-weight: 700; }
  `}</style>
);

const PlayerLuminousBackdrop = () => (
  <div
    className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    style={{
      background: 'linear-gradient(155deg, #d7dcf5 0%, #eaedfb 34%, #f7eff0 66%, #fdebc0 100%)',
    }}
  >
    <div
      className="absolute -top-24 -left-24 w-[440px] h-[440px] sm:w-[660px] sm:h-[660px] rounded-full blur-[85px]"
      style={{
        background: 'radial-gradient(circle, rgba(255,199,73,0.6) 0%, rgba(255,214,107,0.24) 48%, transparent 74%)',
      }}
    />
    <div
      className="absolute top-[18%] -right-24 w-[440px] h-[440px] sm:w-[680px] sm:h-[680px] rounded-full blur-[90px]"
      style={{
        background: 'radial-gradient(circle, rgba(98,106,159,0.48) 0%, rgba(145,155,218,0.22) 50%, transparent 76%)',
      }}
    />
    <div
      className="absolute -bottom-28 left-[28%] w-[440px] h-[440px] sm:w-[640px] sm:h-[640px] rounded-full blur-[95px]"
      style={{
        background: 'radial-gradient(circle, rgba(255,199,73,0.42) 0%, rgba(98,106,159,0.22) 55%, transparent 78%)',
      }}
    />
    <div
      className="absolute inset-0 opacity-80"
      style={{
        backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.22) 1.4px, transparent 1.4px)',
        backgroundSize: '26px 26px',
      }}
    />
  </div>
);

const StudentPlayer = ({ activityType, student, onExit, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const [screensData, setScreensData] = useState([]);
  const [, setAllElements] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  const [studentAnswers, setStudentAnswers] = useState({});
  const [dndAnswers, setDndAnswers] = useState({});

  // Tracking & Penalty States
  const [, setVideoWatched] = useState(false);
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

        const structuredScreens = parsedScreens.map((screenId) => {
          return elementsArr.filter((e) => e.screenId === screenId);
        });

        if (structuredScreens.length === 0) throw new Error('This blueprint is completely empty.');
        setLessonId(data.id);
        setAllElements(elementsArr);
        setScreensData(structuredScreens);
      } catch (err) {
        setError(`Error loading content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [activityType, student]);

  // Listen for Bunny.net / Cloudflare video completion to remove penalty
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

  // Anti-Piracy: Blocks right-clicking anywhere in the app
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

  const handleDragStart = (e, word) => e.dataTransfer.setData('text/plain', word);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    if (navButtonState !== 'idle') return;
    const word = e.dataTransfer.getData('text/plain');
    if (word) setDndAnswers((prev) => ({ ...prev, [zoneId]: word }));
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

  if (loading) {
    return (
      <div className="ola-player-root fixed inset-0 z-50 flex flex-col items-center justify-center font-montserrat">
        <PlayerThemeStyles />
        <PlayerLuminousBackdrop />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <OutLoudIcon className="w-16 h-16 animate-bounce" />
          <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ola-player-root fixed inset-0 z-50 flex flex-col items-center justify-center text-[#1e2246] font-montserrat px-6 text-center">
        <PlayerThemeStyles />
        <PlayerLuminousBackdrop />
        <div className="ola-player-glass relative z-10 rounded-[2.25rem] p-8 sm:p-10 max-w-md w-full flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#c93f34] mb-3 uppercase tracking-tight">
            Content Not Found
          </h2>
          <p className="text-[#4c5384] font-medium text-sm mb-7 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={onExit}
            className="ola-player-btn-yellow w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            Return to Hub
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

      {!sessionStarted ? (
        <div className="ola-player-root fixed inset-0 z-[600] flex flex-col items-center justify-center text-[#1e2246] font-montserrat px-6 text-center">
          <PlayerLuminousBackdrop />
          <div className="ola-player-glass relative z-10 p-8 sm:p-12 rounded-[2.5rem] flex flex-col items-center max-w-lg w-full">
            <div className="mb-5">
              <OutLoudIcon className="w-16 h-16" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-3.5 py-1 rounded-full mb-3">
              OutLoud Interactive Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e2246] mb-3 uppercase tracking-tight">
              Ready?
            </h2>
            <p className="text-[#4c5384] font-medium mb-8 text-sm sm:text-base leading-relaxed">
              Interactive audio and scoring systems initialize when you begin. Tap below to start your {activityType}.
            </p>
            <button
              type="button"
              onClick={handleStartSession}
              className="ola-player-btn-yellow w-full font-bold px-8 py-4 rounded-full uppercase tracking-widest cursor-pointer text-sm sm:text-base"
            >
              Start {activityType} →
            </button>
          </div>
        </div>
      ) : (
        <div
          id="student-player-container"
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: 'none' }}
          className="ola-player-root fixed inset-0 z-[500] flex flex-col text-[#1e2246] font-montserrat overflow-y-auto custom-scrollbar"
        >
          <PlayerLuminousBackdrop />

          {/* STICKY LIGHT-GLASS TOP HEADER */}
          <header className="sticky top-0 h-20 w-full flex items-center justify-between px-4 sm:px-8 lg:px-12 z-50 shrink-0 border-b border-white/85 bg-white/65 backdrop-blur-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <OutLoudHorizontalLogo iconClass="w-9 h-9 sm:w-10 sm:h-10" wordmarkClass="h-7 sm:h-8 w-auto" />
              <div className="h-6 w-px bg-[#626a9f]/25 hidden sm:block" />
              <span className="hidden sm:inline-block text-xs font-bold text-[#454d82] uppercase tracking-widest truncate">
                {activityType} • Unit {student?.unit || 1}
              </span>
            </div>

            {/* Step Progress Pill */}
            <div className="hidden md:flex items-center gap-3 bg-white/80 border border-white rounded-full px-4 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#454d82]">
                Step {currentStep + 1} / {totalSteps}
              </span>
              <div className="w-24 h-2 bg-[#e8eaf7] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#626a9f] to-[#ffc749] transition-all duration-300"
                  style={{ width: `${stepProgressPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2.5 bg-white/80 border border-white rounded-full py-1 pl-3.5 pr-1 shadow-sm">
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-xs font-bold text-[#1e2246]">
                    {student?.first_name} {student?.last_name}
                  </span>
                  <span className="text-[9.5px] text-[#454d82] font-bold uppercase tracking-widest">
                    Level {student?.level?.split(':')[0]}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#626a9f]/30 bg-[#e8eaf7] flex items-center justify-center text-[#454d82] shrink-0">
                  {student?.avatar_url ? (
                    <img src={student.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onExit}
                aria-label="Exit activity"
                className="text-[#1e2246] hover:text-white bg-white/85 hover:bg-[#ee665b] p-2.5 rounded-full border-2 border-[#1e2246] transition-all active:scale-90 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          {/* STAGE CANVAS */}
          <div className="flex-1 w-full max-w-[78rem] mx-auto p-4 sm:p-8 lg:p-10 relative z-10 flex flex-col pb-28">
            <div className="flex flex-col items-center gap-8 w-full">
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

                if (isMedia) {
                  return (
                    <div
                      key={el.id}
                      className={`ola-player-glass w-full ${
                        el.type === 'video' ? 'max-w-5xl' : 'max-w-4xl'
                      } rounded-[2.25rem] overflow-hidden relative mx-auto p-2 sm:p-4`}
                    >
                      {el.type === 'video' && (
                        <iframe
                          src={extractVideoUrl(el.url)}
                          title="Lesson Video"
                          className="w-full aspect-video border-none rounded-[1.75rem] bg-[#1e2246]"
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          allowFullScreen
                        />
                      )}
                      {el.type === 'image' && (
                        <img
                          src={el.url || el.data?.imageUrl}
                          alt="Content"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ WebkitUserDrag: 'none' }}
                          className="w-full h-auto max-h-[700px] object-contain rounded-[1.75rem] select-none pointer-events-none"
                        />
                      )}
                      {el.type === 'audio' && (
                        <div className="p-6 sm:p-10 w-full flex flex-col items-center">
                          {el.data?.imageUrl && (
                            <img
                              src={el.data.imageUrl}
                              alt="Audio Cover"
                              draggable="false"
                              onContextMenu={(e) => e.preventDefault()}
                              style={{ WebkitUserDrag: 'none' }}
                              className="w-full max-w-md rounded-3xl shadow-md mb-6 border border-white select-none pointer-events-none"
                            />
                          )}
                          <audio
                            src={el.url || el.data?.audioUrl}
                            controls
                            controlsList="nodownload"
                            className="w-full max-w-2xl"
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={el.id} className="relative flex flex-col w-full max-w-4xl mx-auto items-center">
                    {el.type === 'text' && (
                      <div className="ola-player-glass w-full rounded-[2.25rem] p-7 sm:p-12 text-center z-20">
                        <div
                          dangerouslySetInnerHTML={{ __html: el.htmlContent }}
                          className="rich-text-content pointer-events-none text-[#1e2246] text-sm sm:text-base [&_span]:!text-lg sm:[&_span]:!text-2xl [&_span]:!leading-tight [&_span]:!whitespace-normal"
                        />
                      </div>
                    )}

                    {isCard && (
                      <div className="ola-player-glass w-full rounded-[2.25rem] p-6 sm:p-10 flex flex-col gap-6 h-full justify-between">
                        {el.data?.imageUrl && (
                          <img
                            src={el.data.imageUrl}
                            alt="Visual Prompt"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ WebkitUserDrag: 'none' }}
                            className="w-full h-72 sm:h-80 object-cover rounded-3xl border border-white mb-2 select-none pointer-events-none shadow-sm"
                          />
                        )}

                        {el.type === 'record_compare' && (
                          <RecordCompareActivity
                            targetText={el.data?.transcriptText || el.data?.text || ''}
                            audioUrl={el.data?.audioUrl || el.data?.audio || ''}
                            lessonId={el.data?.lessonId || lessonId || student?.lessonId || 'standalone-lesson'}
                            nodeId={el.id}
                            cefrLevel={student?.level ? student.level.split(':')[0] : 'A1'}
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

                        {el.type === 'fill_in_the_blank' &&
                          el.data &&
                          (() => {
                            const rawText = el.data.templateText || '';
                            if (!rawText) return null;
                            const parts = rawText.split(/(_+)/);
                            let blankIndex = 0;
                            const rawGroups = (el.data.answerText || '').split(',');

                            return (
                              <div className="w-full h-full flex flex-col justify-center items-center mt-4">
                                <div
                                  className="text-center w-full break-words leading-[3.8rem] text-[#1e2246]"
                                  style={{
                                    fontSize: el.data.t_fontSize ? `${el.data.t_fontSize}px` : '21px',
                                    fontFamily: el.data.t_fontFamily || 'Montserrat',
                                    fontWeight: el.data.t_isBold ? 'bold' : 'normal',
                                  }}
                                >
                                  {parts.map((part, i) => {
                                    if (part.includes('_')) {
                                      const currentBlankIndex = blankIndex++;
                                      const blankWidth = Math.max(84, Math.min(part.length * 20, 300));

                                      const targetGroup = rawGroups[currentBlankIndex] || '';
                                      const cleanedTarget = targetGroup.replace(/^["'\s]+|["'\s]+$/g, '');
                                      const validOptions = cleanedTarget.split(/[|/]/).map((w) => w.trim());
                                      const studentAns = (studentAnswers[`${el.id}_${currentBlankIndex}`] || '').trim();
                                      const isCorrect = validOptions.some((opt) => cleanStr(opt) === cleanStr(studentAns));

                                      return (
                                        <span key={i} className="relative inline-block mx-2.5">
                                          {showFeedback && !isCorrect && (
                                            <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-[#128063] font-extrabold text-xs sm:text-sm whitespace-nowrap bg-[#e7faf3] px-3 py-1 rounded-xl border border-[#16a37f] shadow-md z-50">
                                              {validOptions[0]}
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
                                            className={`px-3.5 py-1.5 border-b-4 border-t-0 border-x-0 outline-none transition-colors rounded-t-xl font-bold text-center shadow-inner ${
                                              showFeedback
                                                ? isCorrect
                                                  ? 'bg-[#16a37f]/15 border-[#16a37f] text-[#128063]'
                                                  : 'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]'
                                                : 'bg-white/90 border-[#626a9f]/50 text-[#1e2246] focus:border-[#454d82]'
                                            }`}
                                            style={{ width: `${blankWidth}px` }}
                                          />
                                        </span>
                                      );
                                    }
                                    return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                        {el.type === 'short_answer' &&
                          el.data &&
                          (() => {
                            const ans = cleanStr(studentAnswers[el.id]);
                            const target = cleanStr(el.data.correctAnswer);
                            const isCorrect = ans === target;

                            return (
                              <div className="flex flex-col w-full h-full justify-center">
                                <div
                                  dangerouslySetInnerHTML={{ __html: el.data.questionHtml }}
                                  className="w-full break-words text-[#1e2246] mt-1 text-lg sm:text-xl font-semibold mb-6"
                                />
                                <div className="relative w-full">
                                  {showFeedback && !isCorrect && (
                                    <div className="mb-2 text-[#128063] font-bold text-xs sm:text-sm bg-[#e7faf3] border border-[#16a37f]/40 rounded-xl px-4 py-2">
                                      Correct answer: {el.data.correctAnswer}
                                    </div>
                                  )}
                                  <input
                                    type="text"
                                    placeholder="Type your answer here..."
                                    disabled={showFeedback}
                                    value={studentAnswers[el.id] || ''}
                                    onChange={(e) =>
                                      setStudentAnswers((prev) => ({ ...prev, [el.id]: e.target.value }))
                                    }
                                    className={`w-full p-4 sm:p-5 border-2 rounded-2xl font-bold transition-all placeholder-[#50567d]/50 text-base sm:text-lg outline-none shadow-sm ${
                                      showFeedback
                                        ? isCorrect
                                          ? 'bg-[#16a37f]/12 border-[#16a37f] text-[#128063]'
                                          : 'bg-[#ee665b]/12 border-[#ee665b] text-[#c93f34]'
                                        : 'bg-white/90 border-white focus:border-[#454d82] text-[#1e2246]'
                                    }`}
                                  />
                                </div>
                              </div>
                            );
                          })()}

                        {el.type === 'multiple_selection' && el.data && (
                          <div className="flex flex-col w-full">
                            {el.data.promptHtml && (
                              <div
                                dangerouslySetInnerHTML={{ __html: el.data.promptHtml }}
                                className="mb-6 text-lg sm:text-xl font-semibold text-[#1e2246]"
                              />
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
                              {el.data.options?.map((opt) => {
                                const isSelected = studentAnswers[`${el.id}_${opt.id}`] === true;
                                const isCorrectOpt = opt.isCorrect;

                                let cardClasses =
                                  'bg-white/80 border-white text-[#1e2246] hover:bg-white hover:border-[#626a9f]/50';
                                let dotClasses = 'border-[#626a9f]/40 bg-transparent';

                                if (isSelected && !showFeedback) {
                                  cardClasses =
                                    'bg-[#ffc749] border-[#1e2246] text-[#1e2246] shadow-[0_3px_0_#1e2246]';
                                  dotClasses = 'border-[#1e2246] bg-[#1e2246]';
                                }

                                if (showFeedback) {
                                  if (isSelected && isCorrectOpt) {
                                    cardClasses =
                                      'bg-[#16a37f]/15 border-[#16a37f] text-[#128063]';
                                    dotClasses = 'border-[#16a37f] bg-[#16a37f]';
                                  } else if (isSelected && !isCorrectOpt) {
                                    cardClasses =
                                      'bg-[#ee665b]/15 border-[#ee665b] text-[#c93f34]';
                                    dotClasses = 'border-[#ee665b] bg-[#ee665b]';
                                  } else if (!isSelected && isCorrectOpt) {
                                    cardClasses =
                                      'bg-[#16a37f]/10 border-[#16a37f] text-[#128063]';
                                    dotClasses = 'border-[#16a37f] bg-transparent';
                                  } else {
                                    cardClasses =
                                      'bg-white/55 border-white/80 text-[#50567d] opacity-75';
                                    dotClasses = 'border-[#626a9f]/25 bg-transparent';
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
                                    className={`w-full p-4 sm:p-5 border-2 rounded-2xl text-left transition-all duration-150 active:scale-[0.98] flex items-center shadow-sm cursor-pointer ${cardClasses}`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors ${dotClasses}`}
                                    >
                                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div
                                      dangerouslySetInnerHTML={{ __html: opt.html }}
                                      className="pointer-events-none text-base sm:text-lg font-bold"
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {el.type === 'drag_and_drop' && el.data && (
                          <div className="flex flex-col gap-8 w-full mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                              {el.data.items.map((item, idx) => {
                                if (!item.imageUrl) return null;
                                const placed = dndAnswers[`${el.id}_${idx}`];
                                const target = item.targetText;
                                const isCorrect = cleanStr(placed) === cleanStr(target);

                                let dropClass = 'bg-white/60 border-[#626a9f]/35';
                                let pillClass = 'bg-[#ffc749] text-[#1e2246] border-2 border-[#1e2246]';

                                if (showFeedback && placed) {
                                  if (isCorrect) {
                                    dropClass = 'bg-[#16a37f]/15 border-[#16a37f]';
                                    pillClass = 'bg-[#16a37f] text-white border-2 border-[#1e2246]';
                                  } else {
                                    dropClass = 'bg-[#ee665b]/15 border-[#ee665b]';
                                    pillClass = 'bg-[#ee665b] text-white border-2 border-[#1e2246]';
                                  }
                                }

                                return (
                                  <div key={idx} className="flex flex-col items-center gap-4">
                                    <img
                                      src={item.imageUrl}
                                      draggable="false"
                                      onContextMenu={(e) => e.preventDefault()}
                                      style={{ WebkitUserDrag: 'none' }}
                                      className="w-full aspect-[4/5] rounded-3xl shadow-sm object-cover border border-white select-none pointer-events-none"
                                      alt="DnD Target"
                                    />
                                    <div
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, `${el.id}_${idx}`)}
                                      className={`w-full min-h-[76px] border-2 border-dashed rounded-2xl flex items-center justify-center transition-all p-2 ${dropClass}`}
                                    >
                                      {placed ? (
                                        <div
                                          onClick={(e) => {
                                            if (!showFeedback) {
                                              e.stopPropagation();
                                              setDndAnswers((prev) => {
                                                const copy = { ...prev };
                                                delete copy[`${el.id}_${idx}`];
                                                return copy;
                                              });
                                            }
                                          }}
                                          className={`px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base shadow-sm w-[92%] text-center transition-transform ${
                                            showFeedback ? '' : 'hover:scale-[1.02] active:scale-95 cursor-pointer'
                                          } ${pillClass}`}
                                        >
                                          {placed}
                                        </div>
                                      ) : (
                                        <span className="text-[11px] uppercase font-bold tracking-widest text-[#626a9f]/60">
                                          Drop here
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="w-full bg-white/75 p-6 sm:p-8 rounded-[2rem] border border-white shadow-inner flex flex-col items-center">
                              <div className="text-center font-bold text-[#454d82] text-xs uppercase tracking-widest mb-5">
                                Word Bank • Drag to match
                              </div>
                              <div className="flex flex-wrap justify-center gap-3 w-full">
                                {el.data.items.map((item, idx) => {
                                  if (!item.studentViewText) return null;
                                  const isUsed = Object.values(dndAnswers).includes(item.studentViewText);
                                  if (isUsed) return null;
                                  return (
                                    <div
                                      key={`bank-${idx}`}
                                      draggable={!showFeedback}
                                      onDragStart={(e) => handleDragStart(e, item.studentViewText)}
                                      className="px-5 py-3 border-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-0.5 bg-white hover:bg-[#fff3d1] text-[#1e2246] border-[#626a9f]/30"
                                    >
                                      {item.studentViewText}
                                    </div>
                                  );
                                })}
                                {Object.keys(dndAnswers).length ===
                                  el.data.items.filter((i) => i.imageUrl).length && (
                                  <span className="text-[#128063] font-bold text-sm tracking-wider uppercase py-2 w-full text-center block">
                                    All items placed!
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

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
                              : el.data.barColor || 'rgba(98, 106, 159, 0.25)';
                            const thumbColor = showFeedback
                              ? isCorrect
                                ? '#16a37f'
                                : '#ee665b'
                              : el.data.handleColor || '#ffc749';

                            return (
                              <div className="w-full flex flex-col h-full min-h-[190px] justify-end relative pb-8 mt-4">
                                <div className="absolute w-full h-full flex flex-col items-center justify-center">
                                  <div
                                    className="absolute flex items-center justify-center rounded-full overflow-hidden transition-colors"
                                    style={{
                                      backgroundColor: barBg,
                                      width: isVert ? `${el.data.barThickness}px` : '100%',
                                      height: isVert ? '100%' : `${el.data.barThickness}px`,
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
                                    className="absolute custom-slider w-full h-full z-10 cursor-pointer"
                                    style={{
                                      '--thumb-color': thumbColor,
                                      transform: isVert ? 'rotate(-90deg)' : 'none',
                                      WebkitAppearance: 'none',
                                      background: 'transparent',
                                    }}
                                  />
                                  {!isVert && (
                                    <div
                                      className="absolute flex flex-col items-center transition-all duration-200 pointer-events-none z-0"
                                      style={{
                                        left: `${pct}%`,
                                        bottom: 'calc(50% + 24px)',
                                        transform: 'translateX(-50%)',
                                      }}
                                    >
                                      <div className="bg-[#1e2246] text-[#ffc749] px-5 py-2.5 rounded-xl shadow-lg font-bold text-sm sm:text-base whitespace-nowrap">
                                        {activeOpt.text}
                                      </div>
                                      <div
                                        className="w-0 h-0 border-solid"
                                        style={{
                                          borderWidth: '9px 7px 0 7px',
                                          borderColor: '#1e2246 transparent transparent transparent',
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                        {(el.type === 'crossword' || el.type === 'word_search') && el.data && (
                          <div className="w-full flex flex-col lg:flex-row gap-6 mt-4">
                            <div className="w-full lg:w-1/3 flex flex-col gap-5">
                              {el.type === 'crossword' && (
                                <>
                                  <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm">
                                    <h4 className="text-xs font-bold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2 mb-3">
                                      Across
                                    </h4>
                                    <div className="flex flex-col gap-2.5">
                                      {el.data.across?.map((a) => (
                                        <div key={`a-${a.num}`} className="text-xs sm:text-sm text-[#1e2246] flex gap-2.5">
                                          <span className="font-extrabold text-[#454d82]">{a.num}.</span>
                                          <span className="font-medium leading-snug">{a.prompt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm">
                                    <h4 className="text-xs font-bold text-[#454d82] uppercase tracking-widest border-b border-[#626a9f]/15 pb-2 mb-3">
                                      Down
                                    </h4>
                                    <div className="flex flex-col gap-2.5">
                                      {el.data.down?.map((d) => (
                                        <div key={`d-${d.num}`} className="text-xs sm:text-sm text-[#1e2246] flex gap-2.5">
                                          <span className="font-extrabold text-[#454d82]">{d.num}.</span>
                                          <span className="font-medium leading-snug">{d.prompt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                              {el.type === 'word_search' && (
                                <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm flex flex-col gap-4">
                                  <div
                                    dangerouslySetInnerHTML={{ __html: el.data.promptHtml }}
                                    className="w-full whitespace-pre-wrap break-words border-b border-[#626a9f]/15 pb-3 text-base sm:text-lg font-semibold text-[#1e2246]"
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    {el.data.targetWords?.map((w, i) => (
                                      <div
                                        key={i}
                                        className="bg-[#f6f7fc] px-3 py-1.5 rounded-lg border border-[#dfe2f2] text-xs sm:text-sm font-bold text-[#1e2246] tracking-wider flex items-center gap-2"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-[#ffc749] border border-[#1e2246]" />
                                        {w}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="w-full lg:w-2/3 bg-white/75 rounded-[2rem] border border-white p-3 sm:p-6 flex flex-col items-center shadow-inner relative">
                              <div className="lg:hidden w-full text-center py-2 mb-3 bg-[#fff3d1] border border-[#ffc749] rounded-xl">
                                <span className="text-[10px] font-bold text-[#1e2246] uppercase tracking-widest">
                                  Pinch &amp; Drag to Navigate Board
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
                                          if (!cell)
                                            return <div key={`${rIdx}-${cIdx}`} className="relative aspect-square w-10 md:w-12 bg-transparent" />;

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
                                                    fontWeight: el.data.isBold ? 'bold' : 'normal',
                                                  }}
                                                  className={`w-full h-full text-center uppercase focus:outline-none transition rounded-xl font-bold shadow-sm ${
                                                    isCellFeedback
                                                      ? isCorrect
                                                        ? 'bg-[#16a37f]/20 border-2 border-[#16a37f] text-[#128063]'
                                                        : 'bg-[#ee665b]/20 border-2 border-[#ee665b] text-[#c93f34]'
                                                      : 'bg-white border-2 border-[#626a9f]/30 text-[#1e2246] focus:border-[#454d82]'
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
                                        borderColor: el.data.lineColor || '#454d82',
                                        backgroundColor: el.data.cellColor || '#ffffff',
                                      }}
                                      className="shadow-md w-full max-w-[480px] aspect-square rounded-2xl overflow-hidden relative mx-auto"
                                    >
                                      {el.data.grid?.map((row, rIdx) =>
                                        row.map((char, cIdx) => {
                                          const cellId = `${rIdx}_${cIdx}`;
                                          const studentCells = studentAnswers[`${el.id}_cells`] || [];
                                          const isSelected = studentCells.includes(cellId);

                                          let isTargetCell = false;
                                          if (el.data.placedWords) {
                                            isTargetCell = el.data.placedWords.some(
                                              (pw) => pw.cells.includes(cellId) || pw.cells.includes(`${rIdx}-${cIdx}`)
                                            );
                                          }

                                          let cellBg = isSelected ? 'rgba(255, 199, 73, 0.65)' : 'transparent';
                                          const cellClass =
                                            'flex items-center justify-center transition-colors select-none font-bold text-[#1e2246]';

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
                                                fontWeight: el.data.isBold ? 'bold' : 'normal',
                                                borderRight:
                                                  cIdx < (el.data.size || 10) - 1
                                                    ? `1px solid ${el.data.lineColor || 'rgba(98,106,159,0.25)'}`
                                                    : 'none',
                                                borderBottom:
                                                  rIdx < (el.data.size || 10) - 1
                                                    ? `1px solid ${el.data.lineColor || 'rgba(98,106,159,0.25)'}`
                                                    : 'none',
                                                backgroundColor: cellBg,
                                                cursor: showFeedback ? 'default' : 'pointer',
                                              }}
                                              className={cellClass}
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
                    )}
                  </div>
                );
              })}
            </div>

            {/* BOTTOM ACTION DOCK */}
            <div className="w-full mt-auto pt-12 flex flex-col sm:flex-row justify-center items-center gap-4 px-4 relative z-50">
              {dockElements.map((el) => {
                if (el.type === 'nav_button') {
                  const hasVocalActivity = contentElements.some((c) => c.type === 'record_compare');
                  if (hasVocalActivity) return null;

                  let btnClass = 'ola-player-btn-yellow';
                  let btnText = 'Confirm';

                  if (navButtonState === 'correct') {
                    btnClass =
                      'bg-[#16a37f] text-white border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246]';
                    btnText =
                      el.data?.buttonStyle === 'finish_pill'
                        ? 'Finish & See Grades ✓'
                        : 'Continue →';
                  } else if (navButtonState === 'incorrect') {
                    btnClass =
                      'bg-[#ee665b] text-white border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246]';
                    btnText =
                      el.data?.buttonStyle === 'finish_pill'
                        ? 'Finish & See Grades →'
                        : 'Continue →';
                  }

                  return (
                    <button
                      type="button"
                      key={el.id}
                      onClick={handleContinueClick}
                      className={`w-full sm:w-auto font-bold px-8 py-3.5 md:px-12 md:py-4 rounded-full uppercase tracking-widest active:scale-[0.98] transition-all text-xs sm:text-sm md:text-base text-center cursor-pointer ${btnClass}`}
                    >
                      {btnText}
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentPlayer;