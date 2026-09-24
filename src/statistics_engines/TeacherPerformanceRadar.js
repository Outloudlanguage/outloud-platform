import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { supabase } from '../SupabaseClient';

const TeacherPerformanceRadar = ({ teacherId = 'default-teacher-id' }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [compositeScore, setCompositeScore] = useState(0);

  useEffect(() => {
    const fetchTeacherMetrics = async () => {
      try {
        setLoading(true);

        let punctualityScore = 100;
        let responsibilityScore = 100;
        let socialScore = 100;
        let teachingScore = 100;
        let passRateScore = 100;

        // 1. Fetch Live Sessions for Punctuality, Cancellations, and Social
        const { data: sessions } = await supabase
          .from('live_sessions')
          .select('*')
          .eq('teacher_id', teacherId);

        if (sessions && sessions.length > 0) {
          // A. Punctuality (60 min = 100% with strict deductibles)
          const standardClasses = sessions.filter(s => s.status === 'completed' && (!s.class_type || !s.class_type.toLowerCase().includes('social')));
          if (standardClasses.length > 0) {
            let totalPunctuality = 0;
            standardClasses.forEach(c => {
              const sched = new Date(c.scheduled_at);
              const prepStart = c.prep_started_at ? new Date(c.prep_started_at) : new Date(sched.getTime() - 10 * 60000);
              const actualStart = c.actual_start_at ? new Date(c.actual_start_at) : sched;
              const actualEnd = c.ended_at ? new Date(c.ended_at) : new Date(sched.getTime() + 45 * 60000);
              const gradedAt = c.graded_at ? new Date(c.graded_at) : new Date(actualEnd.getTime() + 5 * 60000);

              let classMins = 60;

              // Prep penalty
              const prepDiff = (sched - prepStart) / 60000;
              if (prepDiff < 10) classMins -= (10 - Math.max(0, prepDiff));

              // Live penalty
              const startDelay = (actualStart - sched) / 60000;
              if (startDelay > 0) classMins -= startDelay;
              const endEarly = (new Date(sched.getTime() + 45 * 60000) - actualEnd) / 60000;
              if (endEarly > 0) classMins -= endEarly;

              // Grading penalty (Max 10% deduction = 6 mins)
              const gradeDelay = (gradedAt - actualEnd) / 60000;
              if (gradeDelay > 5) classMins -= Math.min(6, gradeDelay - 5);

              totalPunctuality += Math.max(0, (classMins / 60) * 100);
            });
            punctualityScore = Math.round(totalPunctuality / standardClasses.length);
          }

          // B. Responsibility (Cancelled classes penalty)
          const cancelledCount = sessions.filter(s => s.status === 'cancelled' && s.cancelled_by === teacherId).length;
          responsibilityScore -= (cancelledCount * 15);

          // C. Social Activities (>= 60 mins)
          const socialClasses = sessions.filter(s => s.class_type && s.class_type.toLowerCase().includes('social'));
          if (socialClasses.length > 0) {
            const successfulSocials = socialClasses.filter(s => {
              if (s.status !== 'completed') return false;
              const start = new Date(s.actual_start_at || s.scheduled_at);
              const end = new Date(s.ended_at || new Date(start.getTime() + 60 * 60000));
              return ((end - start) / 60000) >= 55;
            }).length;
            socialScore = Math.round((successfulSocials / socialClasses.length) * 100);
          }
        }

        // 2. Fetch Shifts for Responsibility
        const { data: shifts } = await supabase.from('teacher_shifts').select('status').eq('teacher_id', teacherId);
        if (shifts && shifts.length > 0) {
          const missedShifts = shifts.filter(s => s.status === 'missed').length;
          responsibilityScore -= (missedShifts * 10);
        }
        responsibilityScore = Math.max(0, responsibilityScore);

        // 3. Teaching Performance (5-Star Rating converted to %)
        const { data: profile } = await supabase.from('profiles').select('total_positive_ratings, total_rating_questions').eq('id', teacherId).single();
        if (profile && profile.total_rating_questions > 0) {
          teachingScore = Math.round((profile.total_positive_ratings / profile.total_rating_questions) * 100);
        } else {
          teachingScore = 95; // Default assumption if new
        }

        // 4. Student Pass Rate
        const { data: supervision } = await supabase.from('engine_teacher_supervision').select('teacher_fail_rate').eq('teacher_id', teacherId).single();
        if (supervision && supervision.teacher_fail_rate !== null) {
          passRateScore = Math.round(100 - (supervision.teacher_fail_rate * 100));
        } else {
          passRateScore = 92; // Default assumption if new
        }

        const calculatedComposite = Math.round((punctualityScore + responsibilityScore + teachingScore + passRateScore + socialScore) / 5);
        
        setMetrics([
          { subject: 'Puntualidad', score: punctualityScore, fullMark: 100 },
          { subject: 'Responsabilidad', score: responsibilityScore, fullMark: 100 },
          { subject: 'Pedagogía', score: teachingScore, fullMark: 100 },
          { subject: 'Aprobación', score: passRateScore, fullMark: 100 },
          { subject: 'Eventos Sociales', score: socialScore, fullMark: 100 }
        ]);
        setCompositeScore(calculatedComposite);

      } catch (error) {
        console.error("Error fetching teacher metrics:", error);
        // Strict Reality: No mock data padding. Show 0s if failure occurs.
        setMetrics([
          { subject: 'Puntualidad', score: 0, fullMark: 100 },
          { subject: 'Responsabilidad', score: 0, fullMark: 100 },
          { subject: 'Pedagogía', score: 0, fullMark: 100 },
          { subject: 'Aprobación', score: 0, fullMark: 100 },
          { subject: 'Eventos Sociales', score: 0, fullMark: 100 }
        ]);
        setCompositeScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherMetrics();
  }, [teacherId]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500 font-bold tracking-widest">LOADING METRICS...</div>;
  }

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-radar-report" className="flex flex-col bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl w-full">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-radar-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-radar-report, #printable-radar-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte de Rendimiento Docente:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      {/* Header */}
      <div className="mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          Radar de Desempeño
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          Puntuación Global: <span className="text-white print:text-black">{compositeScore}/100</span>
        </p>
      </div>

      {/* Radar Chart */}
      <div className="w-full aspect-square md:aspect-auto md:min-h-[450px] mb-6 mt-4 flex-1" style={{ minHeight: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics}>
            <PolarGrid stroke="#ffffff20" />
            
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
            />
            
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickCount={6}
            />
            
            <Radar
              name="Rendimiento (Score)"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
              isAnimationActive={false} 
            />
            
            <Tooltip wrapperClassName="hide-on-print" contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (metrics.every(m => m.score === 0)) return <p>No hay datos registrados o no se han dictado clases para calcular el rendimiento de este profesor.</p>;

            let estado = "DEFICIENTE";
            let colorClass = "text-red-400";
            let estrategia = "Rendimiento inaceptable. Iniciar protocolo de despido o colocar en periodo de prueba estricto por 15 días con micro-supervisión en todas sus clases.";
            
            if (compositeScore >= 90) {
              estado = "EXCELENCIA";
              colorClass = "text-emerald-400";
              estrategia = "Desempeño operativo óptimo. El profesor ejecuta la metodología a la perfección, mantiene asistencia intachable y genera retención. Elegible para bonificación salarial o aumento de tarifa base.";
            } else if (compositeScore >= 80) {
              estado = "ESTÁNDAR";
              colorClass = "text-blue-400";
              estrategia = "Desempeño sólido y confiable. Cumple con los requerimientos operativos básicos de la academia. Identificar el área más baja en el radar y proveer feedback formativo.";
            } else if (compositeScore >= 60) {
              estado = "EN RIESGO";
              colorClass = "text-yellow-400";
              estrategia = "Rendimiento irregular. Suspender temporalmente la asignación de nuevos estudiantes y agendar reunión disciplinaria para corregir métricas específicas (puntualidad/responsabilidad).";
            }

            return (
              <p>
                Este gráfico evalúa la disciplina operativa y pedagógica del profesor a través de 5 métricas exactas (Puntualidad, Responsabilidad, Pedagogía, Tasa de Aprobación, y Eventos Sociales). 
                Con una puntuación global de <strong>{compositeScore}/100</strong>, el perfil laboral de este profesor se clasifica en estado de <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Decisión Administrativa Recomendada:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TeacherPerformanceRadar;