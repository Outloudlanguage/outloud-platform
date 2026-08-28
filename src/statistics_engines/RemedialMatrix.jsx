import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';
import './RemedialMatrix.css';

const RemedialMatrix = () => {
  const [metrics, setMetrics] = useState({
    needsHelp: { value: 0, percentage: 0, label: 'Grades < 75%' },
    liveFails: { value: 0, percentage: 0, label: 'Live Class Fails' },
    asyncFails: { value: 0, percentage: 0, label: 'Async Fails' },
    helpRequests: { value: 0, rawCount: 0, label: 'Help Requests' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Async Progress (Grades < 75% and Fails)
        const { data: asyncProgress } = await supabase
          .from('student_lesson_progress')
          .select('total_score, failed');

        let needsHelpCount = 0;
        let asyncFailCount = 0;
        const totalAsync = asyncProgress?.length || 1; // Prevent division by zero

        if (asyncProgress) {
          asyncProgress.forEach(lesson => {
            if (lesson.total_score < 75) needsHelpCount++;
            if (lesson.failed) asyncFailCount++;
          });
        }

        // 2. Fetch Live Class Attendance (Pass/Fail rates)
        const { data: liveClasses } = await supabase
          .from('live_class_attendance')
          .select('failed')
          .eq('attended', true);
        
        const liveFailCount = liveClasses?.filter(c => c.failed).length || 0;
        const totalLive = liveClasses?.length || 1;

        // 3. Fetch Help Requests
        const { count: helpCount } = await supabase
          .from('help_requests')
          .select('*', { count: 'exact', head: true });

        // Calculate visual percentages (capping at 100 for the SVG bars)
        setMetrics({
          needsHelp: { 
            value: needsHelpCount, 
            percentage: Math.min(((needsHelpCount / totalAsync) * 100).toFixed(1), 100),
            label: 'Grades < 75% (Needs Help)'
          },
          liveFails: { 
            value: liveFailCount, 
            percentage: Math.min(((liveFailCount / totalLive) * 100).toFixed(1), 100),
            label: 'Live Class Fails'
          },
          asyncFails: { 
            value: asyncFailCount, 
            percentage: Math.min(((asyncFailCount / totalAsync) * 100).toFixed(1), 100),
            label: 'Async Lesson Fails'
          },
          helpRequests: { 
            rawCount: helpCount || 0,
            // Normalize help requests to a 0-100 scale based on an operational threshold (e.g., 50 requests = 100% capacity)
            percentage: Math.min((((helpCount || 0) / 50) * 100).toFixed(1), 100),
            label: 'Active Help Requests'
          }
        });

      } catch (error) {
        console.error("Error fetching remedial matrix data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, []);

  // Dynamic Insight Generation
  const generateInsight = () => {
    const avgFailRate = (Number(metrics.liveFails.percentage) + Number(metrics.asyncFails.percentage)) / 2;
    if (avgFailRate > 15 || metrics.helpRequests.rawCount > 20) {
      return "Remedial intervention pipelines are currently experiencing high volume. A significant cluster of students is falling below the 75% progression threshold, correlating directly with an elevated volume of 'Request Help' clicks. Additional 1-to-1 remedial tutoring blocks must be scheduled immediately to stabilize the cohort's pacing.";
    }
    return "Remedial indicators are currently stable and manageable. The volume of students falling below the 75% progression threshold is low, and 'Request Help' triggers remain well within our operational capacity for 1-to-1 remedial tutoring. Overall cohort pacing is healthy.";
  };

  if (loading) return <div className="p-8 text-white/50 text-center font-bold tracking-widest">LOADING MATRIX...</div>;

  const dataArray = [
    { ...metrics.needsHelp, color: '#eab308', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { ...metrics.liveFails, color: '#3b82f6', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { ...metrics.asyncFails, color: '#3b82f6', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { ...metrics.helpRequests, color: '#eab308', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    // Glassmorphic container matching the AdminHub UI, with strict print overrides
    <div className="remedial-matrix relative flex flex-col w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl break-inside-avoid print:bg-white print:border-slate-300 print:shadow-none print:p-4">
      
      <div className="mb-8">
        <h3 className="text-2xl font-black tracking-widest uppercase text-white print:text-black">
          Remedial Tutoring Matrix
        </h3>
        <p className="text-sm font-bold text-yellow-400 print:text-slate-600 uppercase tracking-wide">
          Intervention Triggers vs. Help Requests
        </p>
      </div>

      <div className="w-full mb-8">
        <svg viewBox="0 0 800 320" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {dataArray.map((item, index) => {
            const yOffset = index * 75;
            const barWidth = (item.percentage / 100) * 450; 
            
            return (
              <g key={index} transform={`translate(10, ${yOffset})`}>
                {/* Thick, rounded minimalistic icon */}
                <path 
                  d={item.icon} 
                  fill="none" 
                  stroke={item.color} 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  transform="translate(0, 10)" 
                />
                
                {/* Label */}
                <text x="40" y="27" className="fill-white print:fill-slate-800" fontSize="16" fontWeight="bold">
                  {item.label}
                </text>
                
                {/* Background Track */}
                <rect x="250" y="12" width="450" height="24" rx="12" className="fill-white/10 print:fill-slate-100" />
                
                {/* Data Bar */}
                <rect x="250" y="12" width={Math.max(barWidth, 12)} height="24" rx="12" fill={item.color} />
                
                {/* Metric Value */}
                <text x={265 + barWidth} y="28" className="fill-slate-300 print:fill-slate-600" fontSize="14" fontWeight="bold">
                  {item.rawCount !== undefined ? `${item.rawCount} Total` : `${item.percentage}%`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 print:border-slate-300">
        <p className="text-sm leading-relaxed text-slate-300 print:text-slate-800 font-medium">
          {generateInsight()}
        </p>
      </div>
    </div>
  );
};

export default RemedialMatrix;