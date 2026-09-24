import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';
import './RemedialMatrix.css';

const RemedialMatrix = ({ studentId }) => {
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
        let asyncQuery = supabase.from('student_lesson_progress').select('total_score, failed');
        if (studentId) asyncQuery = asyncQuery.eq('user_id', studentId);
        const { data: asyncProgress } = await asyncQuery;

        // 2. Fetch Live Class Attendance (Pass/Fail rates)
        let liveQuery = supabase.from('live_class_attendance').select('failed').eq('attended', true);
        if (studentId) liveQuery = liveQuery.eq('user_id', studentId);
        const { data: liveClasses } = await liveQuery;

        // 3. Fetch Help Requests
        let helpQuery = supabase.from('help_requests').select('*', { count: 'exact', head: true });
        if (studentId) helpQuery = helpQuery.eq('user_id', studentId);
        const { count: helpCount } = await helpQuery;

        let needsHelpCount = 0;
        let asyncFailCount = 0;
        let totalAsync = asyncProgress?.length || 0; 
        
        let liveFailCount = 0;
        let totalLive = liveClasses?.length || 0;
        let finalHelpCount = helpCount || 0;

        // Process Async Data
        if (asyncProgress && asyncProgress.length > 0) {
          asyncProgress.forEach(lesson => {
            if (lesson.total_score < 75) needsHelpCount++;
            if (lesson.failed) asyncFailCount++;
          });
        }

        // Process Live Data
        if (liveClasses && liveClasses.length > 0) {
          liveFailCount = liveClasses.filter(c => c.failed).length;
        }

        // Strict Reality: No fake data padding
        // Prevent division by zero
        const safeTotalAsync = totalAsync || 1;
        const safeTotalLive = totalLive || 1;

        // Calculate visual percentages (capping at 100 for the SVG bars)
        setMetrics({
          needsHelp: { 
            value: needsHelpCount, 
            percentage: Math.min(((needsHelpCount / safeTotalAsync) * 100).toFixed(1), 100),
            label: 'Calificaciones < 75% (Riesgo)'
          },
          liveFails: { 
            value: liveFailCount, 
            percentage: Math.min(((liveFailCount / safeTotalLive) * 100).toFixed(1), 100),
            label: 'Clases en Vivo Reprobadas'
          },
          asyncFails: { 
            value: asyncFailCount, 
            percentage: Math.min(((asyncFailCount / safeTotalAsync) * 100).toFixed(1), 100),
            label: 'Asignaciones Reprobadas'
          },
          helpRequests: { 
            rawCount: finalHelpCount,
            percentage: Math.min(((finalHelpCount / (studentId ? 5 : 50)) * 100).toFixed(1), 100),
            label: 'Solicitudes de Tutoría'
          }
        });

      } catch (error) {
        console.error("Error fetching remedial matrix data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, [studentId]); // Re-fire anytime the dual-mode dropdown changes

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING MATRIX...</div>;

  const dataArray = [
    { ...metrics.needsHelp, color: '#eab308', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { ...metrics.liveFails, color: '#3b82f6', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { ...metrics.asyncFails, color: '#3b82f6', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { ...metrics.helpRequests, color: '#eab308', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-matrix-report" className="relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-matrix-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          
          /* Force SVG Text & elements to be black for printing */
          #printable-matrix-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          #printable-matrix-report text { fill: black !important; font-weight: bold !important; }
          #printable-matrix-report rect.fill-white\\/10 { fill: #f1f5f9 !important; }
          
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte Operativo Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-8 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          {studentId ? "Perfil de Recuperación Personal" : "Matriz Operativa de Tutorías"}
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          {studentId ? "Indicadores de Riesgo Estudiantil" : "Métricas Globales de Intervención"}
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
      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            const hasData = metrics.needsHelp.value > 0 || metrics.liveFails.value > 0 || metrics.asyncFails.value > 0 || metrics.helpRequests.rawCount > 0;
            if (!hasData) return <p>No se han registrado fallos, calificaciones de riesgo o solicitudes de tutoría en el periodo actual. El rendimiento es excepcionalmente fluido.</p>;

            const avgFailRate = (Number(metrics.liveFails.percentage) + Number(metrics.asyncFails.percentage)) / 2;
            const helpCount = metrics.helpRequests.rawCount;
            
            if (studentId) {
              let estado = "ESTABLE";
              let colorClass = "text-emerald-400";
              let estrategia = "La progresión de este estudiante es saludable. Sus tasas de reprobación y solicitudes de asistencia se mantienen dentro de los parámetros esperados de autonomía.";
              
              if (avgFailRate > 15 || helpCount >= 2) {
                estado = "EN RIESGO";
                colorClass = "text-red-400";
                estrategia = "Intervención prioritaria requerida. Las altas tasas de reprobación combinadas con solicitudes de ayuda directas indican frustración activa. Programar una sesión de tutoría 1-a-1 de recuperación inmediatamente para evitar la deserción (churn).";
              }

              return (
                <p>
                  El sistema detecta una tasa de fallo combinada del <strong>{avgFailRate.toFixed(1)}%</strong> y <strong>{helpCount}</strong> solicitudes formales de ayuda. 
                  El estado de asimilación de este estudiante se clasifica como <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva Académica:</span>
                  {estrategia}
                </p>
              );
            } else {
              let estado = "CAPACIDAD ÓPTIMA";
              let colorClass = "text-emerald-400";
              let estrategia = "La cohorte avanza fluidamente. El volumen actual de estudiantes en riesgo de rezago es mínimo y las solicitudes de tutoría pueden ser absorbidas sin estrés operativo para el equipo docente.";
              
              if (avgFailRate > 15 || helpCount > 20) {
                estado = "CUELLO DE BOTELLA OPERATIVO";
                colorClass = "text-red-400";
                estrategia = "La demanda de intervenciones de recuperación está superando el flujo estándar. Un segmento significativo de la cohorte está reprobando o solicitando asistencia. Abrir nuevos bloques horarios de tutoría 1-a-1 esta semana para descongestionar el sistema.";
              }

              return (
                <p>
                  El ecosistema académico global muestra una tasa promedio de reprobación del <strong>{avgFailRate.toFixed(1)}%</strong> y <strong>{helpCount}</strong> tickets abiertos de asistencia. 
                  La carga actual del sistema de tutorías remediales se clasifica en <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Estrategia Operativa:</span>
                  {estrategia}
                </p>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default RemedialMatrix;