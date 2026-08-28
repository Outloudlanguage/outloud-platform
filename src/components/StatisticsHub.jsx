import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient'; // Adjust path if necessary
import './StatisticsHub.css';

// Import all Statistics Engines
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

const ENGINE_DIRECTORY = [
  { id: 'e1', name: 'Engine 1: Teacher Radar', component: TeacherPerformanceRadar, scope: 'teacher' },
  { id: 'e2', name: 'Engine 2: Accelerated Outliers', component: PacingScatterPlotModule, scope: 'global' },
  { id: 'e3', name: 'Engine 3: Performance Risk', component: RiskChart, scope: 'global' },
  { id: 'e4', name: 'Engine 4: Remedial Matrix', component: RemedialMatrix, scope: 'global' },
  { id: 'e5', name: 'Engine 5: Student Progress', component: StudentProgressChart, scope: 'student' },
  { id: 'e6', name: 'Engine 6: Class Attendance', component: LiveClassAttendanceChart, scope: 'global' },
  { id: 'e7', name: 'Engine 7: Tutoring Adoption', component: TutoringAdoptionDashboard, scope: 'global' },
  { id: 'e8', name: 'Engine 8: Weekly Usage', component: StudentUsageHistogram, scope: 'global' },
  { id: 'e9', name: 'Engine 9: Monthly Active Users', component: MonthlyActiveUsers, scope: 'global' },
  { id: 'e10', name: 'Engine 10: CEFR Headcount', component: CefrHeadcountDashboard, scope: 'global' },
  { id: 'e12', name: 'Engine 12: Curriculum Bottlenecks', component: CurriculumBottleneckHeatmap, scope: 'global' }
];

const StatisticsHub = () => {
  const [activeEngineId, setActiveEngineId] = useState(ENGINE_DIRECTORY[0].id);
  const [showReport, setShowReport] = useState(false);
  const [users, setUsers] = useState({ teachers: [], students: [] });
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  const activeEngine = ENGINE_DIRECTORY.find(e => e.id === activeEngineId);

  // Fetch Users for the Individual Dropdown
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoadingUsers(true);
        // Assuming your users table uses 'role' and has an email or name column
        const { data, error } = await supabase
          .from('users')
          .select('id, role, email'); 
          
        if (error) throw error;

        if (data) {
          const teachers = data.filter(u => u.role === 'teacher');
          const students = data.filter(u => u.role === 'student');
          setUsers({ teachers, students });
          
          if (activeEngine.scope === 'teacher' && teachers.length > 0) setSelectedEntityId(teachers[0].id);
          if (activeEngine.scope === 'student' && students.length > 0) setSelectedEntityId(students[0].id);
        }
      } catch (err) {
        console.error("Error fetching entities for dropdown:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchEntities();
  }, []);

  // Handle Engine Change
  const handleEngineChange = (e) => {
    const newEngine = ENGINE_DIRECTORY.find(eng => eng.id === e.target.value);
    setActiveEngineId(newEngine.id);
    setShowReport(false); // Reset report visibility on chart change

    // Auto-select the first available entity if scope requires it
    if (newEngine.scope === 'teacher' && users.teachers.length > 0) {
      setSelectedEntityId(users.teachers[0].id);
    } else if (newEngine.scope === 'student' && users.students.length > 0) {
      setSelectedEntityId(users.students[0].id);
    } else {
      setSelectedEntityId('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Render dynamic list for Dropdown 3
  const getEntityOptions = () => {
    if (activeEngine.scope === 'global') return <option value="">N/A (Global View)</option>;
    
    const list = activeEngine.scope === 'teacher' ? users.teachers : users.students;
    if (loadingUsers) return <option value="">Loading...</option>;
    if (list.length === 0) return <option value="">No records found</option>;
    
    return list.map((user, idx) => (
      <option key={user.id} value={user.id}>
        {/* Fallback to index if your DB doesn't use email/name strings directly */}
        {user.email ? user.email.split('@')[0] : `${activeEngine.scope.charAt(0).toUpperCase() + activeEngine.scope.slice(1)} ${idx + 1}`}
      </option>
    ));
  };

  const ActiveComponent = activeEngine.component;

  return (
    <div className="ola-statistics-hub print:p-0">
      {/* Glassmorphic Main Container matching your mockup */}
      <div className="hub-glass-container relative flex flex-col md:flex-row w-full max-w-6xl mx-auto rounded-[2rem] shadow-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Right Print Button */}
        <button 
          onClick={handlePrint}
          className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all print:hidden group"
          title="Print or Export PDF"
        >
          <svg className="w-6 h-6 text-white group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>

        {/* LEFT COLUMN: Controls & UI */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-black/40 border-r border-white/10 p-8 flex flex-col print:hidden">
          
          <div className="mb-10">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Statistics</h1>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Data Engine Hub</p>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            {/* Dropdown 1: Engine Selector */}
            <div className="control-group">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest ml-2 mb-1 block">Data Engine</label>
              <select 
                value={activeEngineId} 
                onChange={handleEngineChange}
                className="w-full bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-full px-4 py-3 appearance-none focus:outline-none focus:border-yellow-400 transition-colors"
              >
                {ENGINE_DIRECTORY.map(eng => (
                  <option key={eng.id} value={eng.id} className="text-slate-900">{eng.name}</option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Scope Selector (Auto-locked) */}
            <div className="control-group">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest ml-2 mb-1 block">Scope</label>
              <select 
                disabled
                value={activeEngine.scope === 'global' ? 'global' : 'individual'} 
                className="w-full bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold rounded-full px-4 py-3 appearance-none opacity-80 cursor-not-allowed"
              >
                <option value="global" className="text-slate-900">Global</option>
                <option value="individual" className="text-slate-900">Individual</option>
              </select>
            </div>

            {/* Dropdown 3: Entity Selector */}
            <div className="control-group">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest ml-2 mb-1 block">Target Profile</label>
              <select 
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                disabled={activeEngine.scope === 'global' || loadingUsers}
                className={`w-full text-sm font-semibold rounded-full px-4 py-3 appearance-none transition-colors ${
                  activeEngine.scope === 'global' 
                    ? 'bg-white/5 border border-white/10 text-slate-500 opacity-50 cursor-not-allowed' 
                    : 'bg-white/10 border border-white/20 text-white focus:outline-none focus:border-yellow-400'
                }`}
              >
                {getEntityOptions()}
              </select>
            </div>
          </div>

          {/* Action Button: Read Report */}
          <button 
            onClick={() => setShowReport(!showReport)}
            className="mt-8 w-full bg-gradient-to-r from-slate-200 to-white text-slate-900 font-black text-xs tracking-widest uppercase rounded-full py-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
          >
            {showReport ? 'Hide Report' : 'Read Report'}
          </button>
        </div>

        {/* RIGHT COLUMN: Engine Display Area */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-8 flex items-center justify-center bg-black/20 print:w-full print:p-0 print:bg-white">
          <div className={`engine-wrapper w-full max-w-2xl ${showReport ? 'report-visible' : ''}`}>
            <ActiveComponent 
              teacherId={activeEngine.scope === 'teacher' ? selectedEntityId : undefined}
              studentId={activeEngine.scope === 'student' ? selectedEntityId : undefined}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatisticsHub;