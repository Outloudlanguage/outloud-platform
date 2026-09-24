import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './CurriculumBottleneckHeatmap.css';

const CurriculumBottleneckHeatmap = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [topBottleneck, setTopBottleneck] = useState('');

  useEffect(() => {
    const fetchBottlenecks = async () => {
      try {
        setLoading(true);
        
        // Build the query to fetch lesson progress joined with lesson titles
        let query = supabase
          .from('student_lesson_progress')
          .select('failed, lessons(title)');

        // Apply dual-mode filter
        if (studentId) {
          query = query.eq('user_id', studentId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const lessonStats = {};

        if (data && data.length > 0) {
          data.forEach(record => {
            const title = record.lessons?.title || 'Unknown Lesson';
            if (!lessonStats[title]) lessonStats[title] = { title, attempts: 0, fails: 0 };
            lessonStats[title].attempts += 1;
            if (record.failed) lessonStats[title].fails += 1;
          });
        }

        let processedData = Object.values(lessonStats)
          .map(l => ({ ...l, failRate: parseFloat(((l.fails / Math.max(l.attempts, 1)) * 100).toFixed(1)) }))
          .filter(l => l.failRate > 0) // Only show things they actually failed
          .sort((a, b) => b.failRate - a.failRate)
          .slice(0, 5); // Top 5 bottlenecks

        // Strict Reality: No fake math padding.
        setChartData(processedData);
        setTopBottleneck(processedData[0] || null);

      } catch (error) {
        console.error("Error fetching bottlenecks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBottlenecks();
  }, [studentId]); // Re-fire anytime the dual-mode dropdown changes

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING BOTTLENECKS...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-bottleneck-report" className="bottleneck-heatmap-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-bottleneck-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-bottleneck-report, #printable-bottleneck-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte Académico Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          {studentId ? "Dificultades Personales" : "Cuellos de Botella Académicos"}
        </h3>
        <p className="text-sm font-bold text-red-400 uppercase tracking-wide">
          {studentId ? "Mayor Tasa de Reprobación por Módulo" : "Top 5 Módulos Críticos"}
        </p>
      </div>

      <div className="w-full h-72 mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
            <XAxis dataKey="title" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={{ stroke: '#64748b' }} tickLine={{ stroke: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
            <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#64748b' }} tickLine={{ stroke: '#64748b' }} />
            <Tooltip wrapperClassName="hide-on-print" contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} cursor={{ fill: '#ffffff10' }} />
            <Bar dataKey="failRate" name="Tasa de Reprobación (%)" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (!topBottleneck) {
              return <p>No se han registrado reprobaciones en el periodo actual. El rendimiento académico general se encuentra en un estado saludable y sin fricciones detectadas.</p>;
            }

            const failRate = parseFloat(topBottleneck.failRate);
            let estado = "ÓPTIMO";
            let colorClass = "text-emerald-400";
            let estrategia = "La tasa de fallo es baja y se considera un nivel normal de fricción de aprendizaje. No se requiere intervención inmediata en el diseño del currículo.";
            
            if (failRate >= 40) {
              estado = "CRÍTICO";
              colorClass = "text-red-400";
              estrategia = studentId 
                ? `Intervención obligatoria requerida. Asignar de inmediato una sesión de tutoría de recuperación 1-a-1 enfocada en '${topBottleneck.title}' antes de permitir su avance al siguiente módulo.` 
                : `Revisión curricular de emergencia. El módulo '${topBottleneck.title}' está bloqueando masivamente a los estudiantes. Auditar el material didáctico y proporcionar guías suplementarias a los profesores.`;
            } else if (failRate >= 20) {
              estado = "INTERMEDIO";
              colorClass = "text-yellow-400";
              estrategia = studentId
                ? `Asignar material de práctica adicional sobre '${topBottleneck.title}' y notificar a su próximo profesor para que refuerce el tema durante la clase conversacional.`
                : `Vigilancia requerida. El módulo '${topBottleneck.title}' presenta fricción elevada. Sugerimos agendar talleres grupales enfocados en esta competencia específica para descongestionar.`;
            }

            return (
              <p>
                El diagnóstico académico indica que <strong>'{topBottleneck.title}'</strong> es actualmente el punto de mayor dificultad, con una tasa de reprobación del <strong>{failRate}%</strong>. 
                Este indicador señala un estado de fluidez académica <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">
                  {studentId ? "Plan de Acción Estudiantil:" : "Directiva Académica Global:"}
                </span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CurriculumBottleneckHeatmap;