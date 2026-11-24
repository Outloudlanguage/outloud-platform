import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';
import './StatisticsHub.css';

// Import all Statistics Engines (Finances Engines Excluded)
import TeacherPerformanceRadar from '../statistics_engines/TeacherPerformanceRadar';
import PacingScatterPlotModule from '../statistics_engines/PacingScatterPlotModule';
import RiskChart from '../statistics_engines/RiskChart';
import RemedialMatrix from '../statistics_engines/RemedialMatrix';
import StudentProgressChart from '../statistics_engines/StudentProgressChart';
import LiveClassAttendanceChart from '../statistics_engines/LiveClassAttendanceChart';
import TutoringAdoptionDashboard from '../statistics_engines/TutoringAdoptionDashboard';
import StudentUsageHistogram from '../statistics_engines/StudentUsageHistogram';
import MonthlyActiveUsers from '../statistics_engines/MonthlyActiveUsers';
import CefrHeadcountDashboard from '../statistics_engines/CefrHeadcountDashboard';
import CurriculumBottleneckHeatmap from '../statistics_engines/CurriculumBottleneckHeatmap';
import TrafficAnalyticsModule from '../statistics_engines/TrafficAnalyticsModule';

const ENGINE_DIRECTORY = [
  { id: 'e0', code: 'E0', category: 'Growth', name: 'Engine 0: Traffic & Conversions', short: 'Traffic & Conversions', component: TrafficAnalyticsModule, allowedScopes: ['global'] },
  { id: 'e1', code: 'E1', category: 'Faculty', name: 'Engine 1: Teacher Radar', short: 'Teacher Radar', component: TeacherPerformanceRadar, allowedScopes: ['teacher'] },
  { id: 'e2', code: 'E2', category: 'Pacing', name: 'Engine 2: Accelerated Outliers', short: 'Accelerated Outliers', component: PacingScatterPlotModule, allowedScopes: ['global', 'student'] },
  { id: 'e3', code: 'E3', category: 'Retention', name: 'Engine 3: Performance Risk', short: 'Performance Risk', component: RiskChart, allowedScopes: ['global', 'student'] },
  { id: 'e4', code: 'E4', category: 'Academic', name: 'Engine 4: Remedial Matrix', short: 'Remedial Matrix', component: RemedialMatrix, allowedScopes: ['global', 'student'] },
  { id: 'e5', code: 'E5', category: 'Academic', name: 'Engine 5: Student Progress', short: 'Student Progress', component: StudentProgressChart, allowedScopes: ['student'] },
  { id: 'e6', code: 'E6', category: 'Live Lab', name: 'Engine 6: Class Attendance', short: 'Class Attendance', component: LiveClassAttendanceChart, allowedScopes: ['global', 'student'] },
  { id: 'e7', code: 'E7', category: 'Live Lab', name: 'Engine 7: Tutoring Adoption', short: 'Tutoring Adoption', component: TutoringAdoptionDashboard, allowedScopes: ['global', 'student'] },
  { id: 'e8', code: 'E8', category: 'Engagement', name: 'Engine 8: Weekly Usage', short: 'Weekly Usage', component: StudentUsageHistogram, allowedScopes: ['global', 'student'] },
  { id: 'e9', code: 'E9', category: 'Engagement', name: 'Engine 9: Monthly Active Users', short: 'Monthly Active Users', component: MonthlyActiveUsers, allowedScopes: ['global'] },
  { id: 'e10', code: 'E10', category: 'Enrollment', name: 'Engine 10: CEFR Headcount', short: 'CEFR Headcount', component: CefrHeadcountDashboard, allowedScopes: ['global'] },
  { id: 'e12', code: 'E12', category: 'Curriculum', name: 'Engine 12: Curriculum Bottlenecks', short: 'Curriculum Bottlenecks', component: CurriculumBottleneckHeatmap, allowedScopes: ['global', 'student'] },
];

const INITIAL_ENGINE = ENGINE_DIRECTORY[0];

const StatisticsHub = () => {
  const [activeEngineId, setActiveEngineId] = useState(INITIAL_ENGINE.id);
  const [selectedScope, setSelectedScope] = useState(INITIAL_ENGINE.allowedScopes[0]);
  const [showReport, setShowReport] = useState(false);
  const [users, setUsers] = useState({ teachers: [], students: [] });
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  const activeEngine = ENGINE_DIRECTORY.find((e) => e.id === activeEngineId) || INITIAL_ENGINE;

  // Fetch Users for the Individual Dropdown (users table with profiles fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchEntities = async () => {
      try {
        setLoadingUsers(true);
        let rows = [];

        const { data: usersData, error: usersErr } = await supabase
          .from('users')
          .select('id, role, email');

        if (!usersErr && usersData && usersData.length > 0) {
          rows = usersData;
        } else {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, role, email, first_name, last_name');
          if (profilesData) rows = profilesData;
        }

        if (!isMounted) return;

        const teachers = rows.filter((u) => String(u.role || '').toLowerCase() === 'teacher');
        const students = rows.filter((u) => String(u.role || '').toLowerCase() === 'student');
        setUsers({ teachers, students });

        const defaultScope = INITIAL_ENGINE.allowedScopes[0];
        if (defaultScope === 'teacher' && teachers.length > 0) {
          setSelectedEntityId(teachers[0].id);
        } else if (defaultScope === 'student' && students.length > 0) {
          setSelectedEntityId(students[0].id);
        }
      } catch (err) {
        console.error('Error fetching entities for dropdown:', err);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    fetchEntities();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectEngineById = (engineId) => {
    const newEngine = ENGINE_DIRECTORY.find((eng) => eng.id === engineId);
    if (!newEngine) return;
    setActiveEngineId(newEngine.id);
    setShowReport(false);
    const defaultScope = newEngine.allowedScopes[0];
    setSelectedScope(defaultScope);

    if (defaultScope === 'teacher' && users.teachers.length > 0) {
      setSelectedEntityId(users.teachers[0].id);
    } else if (defaultScope === 'student' && users.students.length > 0) {
      setSelectedEntityId(users.students[0].id);
    } else {
      setSelectedEntityId('');
    }
  };

  const handleEngineChange = (e) => {
    selectEngineById(e.target.value);
  };

  const handleScopeChange = (newScope) => {
    setSelectedScope(newScope);
    if (newScope === 'teacher' && users.teachers.length > 0) {
      setSelectedEntityId(users.teachers[0].id);
    } else if (newScope === 'student' && users.students.length > 0) {
      setSelectedEntityId(users.students[0].id);
    } else {
      setSelectedEntityId('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getEntityLabel = (user, idx) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email ? user.email.split('@')[0] : `Profile ${idx + 1}`;
  };

  const getEntityOptions = () => {
    if (selectedScope === 'global') return <option value="">N/A (Global View)</option>;

    const list = selectedScope === 'teacher' ? users.teachers : users.students;
    if (loadingUsers) return <option value="">Loading profiles...</option>;
    if (list.length === 0) return <option value="">No records found</option>;

    return list.map((user, idx) => (
      <option key={user.id} value={user.id}>
        {getEntityLabel(user, idx)}
      </option>
    ));
  };

  const ActiveComponent = activeEngine.component;

  return (
    <div className="ola-statistics-hub ola-stats-light w-full font-montserrat text-[#1e2246] print:p-0">
      <style>{`
        .ola-stats-light {
          background: transparent !important;
          padding: 0 !important;
        }
        .ola-stats-light .hub-glass-container {
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 244, 253, 0.84) 100%) !important;
          backdrop-filter: blur(22px) saturate(175%) !important;
          -webkit-backdrop-filter: blur(22px) saturate(175%) !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 22px 46px -18px rgba(55, 63, 118, 0.22), inset 0 2px 2px #ffffff !important;
        }
        .ola-stats-btn-yellow {
          background: linear-gradient(180deg, #ffd66b 0%, #ffc749 100%);
          color: #1e2246;
          border: 2px solid #1e2246;
          box-shadow: 0 4px 0 #1e2246, 0 10px 22px -6px rgba(255, 199, 73, 0.55);
          transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, filter 0.14s ease;
        }
        .ola-stats-btn-yellow:hover {
          filter: brightness(1.04);
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #1e2246, 0 14px 26px -6px rgba(255, 199, 73, 0.72);
        }
        .ola-stats-btn-yellow:active {
          transform: translateY(3px) scale(0.99);
          box-shadow: 0 1px 0 #1e2246;
        }
        .ola-stats-btn-outline {
          background: rgba(255, 255, 255, 0.95);
          color: #1e2246;
          border: 2px solid #1e2246;
          box-shadow: 0 3px 0 rgba(30, 34, 70, 0.16);
          transition: transform 0.14s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.14s ease, background 0.14s ease;
        }
        .ola-stats-btn-outline:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 5px 0 #626a9f;
        }
        .ola-stats-btn-outline:active {
          transform: translateY(2px) scale(0.99);
          box-shadow: 0 1px 0 rgba(30, 34, 70, 0.2);
        }
        @keyframes olaStatsStageIn {
          0% { opacity: 0; transform: translateY(8px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ola-stats-stage-in {
          animation: olaStatsStageIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* MAIN BENTO CONTAINER */}
      <div className="hub-glass-container relative flex flex-col lg:flex-row w-full max-w-7xl mx-auto rounded-[2.25rem] overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* LEFT COLUMN: CONTROLS RAIL */}
        <aside className="w-full lg:w-[320px] xl:w-[345px] bg-white/70 border-b lg:border-b-0 lg:border-r border-[#626a9f]/15 p-5 sm:p-6 flex flex-col shrink-0 print:hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#626a9f]/15">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-3 py-0.5 rounded-full mb-1.5">
                OutLoud Intelligence
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none">
                <span className="text-[#1e2246]">Statistics </span>
                <span className="text-[#626a9f]">
                  Hub<span className="text-[#ffc749]">.</span>
                </span>
              </h1>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#1e2246] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Controls Stack */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Control 1: Engine Selector */}
            <div>
              <label className="text-[10px] text-[#454d82] uppercase font-extrabold tracking-widest mb-1.5 block">
                Data Engine ({ENGINE_DIRECTORY.length})
              </label>
              <div className="relative">
                <select
                  value={activeEngineId}
                  onChange={handleEngineChange}
                  className="w-full bg-white border-2 border-[#dfe2f2] focus:border-[#454d82] text-[#1e2246] text-xs sm:text-sm font-bold rounded-2xl pl-4 pr-10 py-3 truncate appearance-none outline-none shadow-sm cursor-pointer transition-colors"
                >
                  {ENGINE_DIRECTORY.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-4 h-4 text-[#454d82] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Control 2: Floating Pill Scope Switcher */}
            <div>
              <label className="text-[10px] text-[#454d82] uppercase font-extrabold tracking-widest mb-1.5 block">
                Analysis Scope
              </label>
              <div className="flex gap-1 bg-[#e8eaf7] p-1 rounded-full border border-white">
                {activeEngine.allowedScopes.map((scope) => {
                  const isPicked = selectedScope === scope;
                  return (
                    <button
                      type="button"
                      key={scope}
                      onClick={() => handleScopeChange(scope)}
                      className={`flex-1 py-2 px-3 rounded-full text-[11px] font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
                        isPicked
                          ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                          : 'text-[#454d82] hover:text-[#1e2246]'
                      }`}
                    >
                      {scope}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control 3: Target Profile */}
            <div>
              <label className="text-[10px] text-[#454d82] uppercase font-extrabold tracking-widest mb-1.5 block">
                Target Profile
              </label>
              <div className="relative">
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  disabled={selectedScope === 'global' || loadingUsers}
                  className={`w-full text-xs sm:text-sm font-bold rounded-2xl pl-4 pr-10 py-3 truncate appearance-none outline-none border-2 transition-colors ${
                    selectedScope === 'global'
                      ? 'bg-[#f4f6fc] border-white text-[#626a9f]/65 cursor-not-allowed'
                      : 'bg-white border-[#dfe2f2] focus:border-[#454d82] text-[#1e2246] shadow-sm cursor-pointer'
                  }`}
                >
                  {getEntityOptions()}
                </select>
                {selectedScope !== 'global' && (
                  <svg
                    className="w-4 h-4 text-[#454d82] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>

            {/* Quick-Jump Engine Directory (Desktop) */}
            <div className="hidden lg:flex flex-col flex-1 min-h-0 mt-1">
              <span className="text-[10px] text-[#626a9f] uppercase font-extrabold tracking-widest mb-2 block">
                Quick Switch
              </span>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5 max-h-[260px]">
                {ENGINE_DIRECTORY.map((eng) => {
                  const isActive = eng.id === activeEngineId;
                  return (
                    <button
                      type="button"
                      key={eng.id}
                      onClick={() => selectEngineById(eng.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 cursor-pointer transition-all border-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#fff9e8] to-[#ffe69e] text-[#1e2246] border-[#ffc749] shadow-sm'
                          : 'bg-white/75 hover:bg-white text-[#4c5384] border-transparent hover:border-[#dfe2f2]'
                      }`}
                    >
                      <span className="truncate">{eng.short}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          isActive ? 'bg-[#1e2246] text-[#ffc749]' : 'bg-[#e8eaf7] text-[#454d82]'
                        }`}
                      >
                        {eng.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Action: Read / Hide Report */}
          <button
            type="button"
            onClick={() => setShowReport((prev) => !prev)}
            className={`mt-5 w-full py-3.5 rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer ${
              showReport ? 'ola-stats-btn-outline' : 'ola-stats-btn-yellow'
            }`}
          >
            {showReport ? 'Hide Written Report' : 'Read Written Report →'}
          </button>
        </aside>

        {/* RIGHT COLUMN: ANALYTICS STAGE */}
        <section className="flex-1 flex flex-col min-w-0 p-5 sm:p-7 print:w-full print:p-0 print:bg-white">
          {/* Dark-Navy Status & Export Strip */}
          <div className="bg-[#1e2246] text-white rounded-[1.5rem] px-4 py-3.5 sm:px-6 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-[#ffc749] text-[#1e2246] font-extrabold text-xs flex items-center justify-center shrink-0">
                {activeEngine.code}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-white/15 text-[#ffc749] px-2.5 py-0.5 rounded-full">
                    {activeEngine.category}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 text-white/85 px-2.5 py-0.5 rounded-full">
                    Scope: {selectedScope}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                  {activeEngine.short}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-full bg-[#ffc749] hover:bg-[#ffd66b] text-[#1e2246] text-[10.5px] font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0 transition-transform active:scale-95"
              title="Print or Export PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / PDF</span>
            </button>
          </div>

          {/* Engine Viewport Stage */}
          <div className="flex-1 flex items-center justify-center bg-[#f4f6fc]/85 border-2 border-white rounded-[2rem] p-3 sm:p-5 shadow-inner print:bg-white print:border-none print:shadow-none print:p-0">
            <div
              key={`${activeEngineId}-${selectedScope}-${selectedEntityId}`}
              className={`engine-wrapper ola-stats-stage-in w-full max-w-4xl ${showReport ? 'report-visible' : ''}`}
            >
              <ActiveComponent
                teacherId={selectedScope === 'teacher' ? selectedEntityId : undefined}
                studentId={selectedScope === 'student' ? selectedEntityId : undefined}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatisticsHub;