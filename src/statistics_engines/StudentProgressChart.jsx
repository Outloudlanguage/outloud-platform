import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './StudentProgressChart.css';

const StudentProgressChart = ({ studentId = 'default-student-id' }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ actual: 0, variance: 0, status: '' });

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Fetch only completed async lessons with a passing grade (>= 75%) from the last 6 months
        const { data: lessons, error } = await supabase
          .from('student_lesson_progress')
          .select('completed_at, total_score')
          .eq('user_id', studentId)
          .eq('status', 'completed')
          .gte('total_score', 75)
          .gte('completed_at', sixMonthsAgo.toISOString())
          .order('completed_at', { ascending: true });

        if (error) throw error;

        // Base target array representing 4 units per month
        const targetUnits = [4, 8, 12, 16, 20, 24];
        let monthlyCounts = [0, 0, 0, 0, 0, 0];

        // Bucket the fetched lessons into their respective months (0 to 5)
        if (lessons && lessons.length > 0) {
          lessons.forEach(lesson => {
            const completedDate = new Date(lesson.completed_at);
            const monthDiff = (completedDate.getFullYear() - sixMonthsAgo.getFullYear()) * 12 + (completedDate.getMonth() - sixMonthsAgo.getMonth());
            
            // Constrain to the 6-month array bounds
            const bucketIndex = Math.max(0, Math.min(5, monthDiff));
            monthlyCounts[bucketIndex] += 1;
          });
        }
        // Strict Reality: No mock data padding. Empty records will stay at 0.

        let cumulativeActual = 0;
        const processedData = targetUnits.map((target, index) => {
          cumulativeActual += monthlyCounts[index];
          return {
            month: `Mes ${index + 1}`,
            target: target,
            actual: cumulativeActual
          };
        });

        // Calculate Final Variance
        const finalTarget = targetUnits[5];
        const finalActual = processedData[5].actual;
        const variance = finalActual - finalTarget;

        setChartData(processedData);
        setSummary({
          actual: finalActual,
          variance: variance
        });

      } catch (error) {
        console.error("Error fetching student progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [studentId]);

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING PROGRESS...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-progress-report" className="student-progress-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-progress-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-progress-report, #printable-progress-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte de Rendimiento Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          Progreso del Estudiante
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          Ritmo Real vs Meta Esperada (6 Meses)
        </p>
      </div>

      <div className="w-full h-72 mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            <Tooltip 
              wrapperClassName="hide-on-print" 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 'bold' }} 
            />
            
            {/* Target Line (Blue) */}
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Meta Académica (4/mes)" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} 
              activeDot={{ r: 6 }} 
              isAnimationActive={false} 
            />
            
            {/* Actual Line (Yellow) */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Progreso Real" 
              stroke="#eab308" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} 
              activeDot={{ r: 6 }} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            const variance = summary.variance;
            let estado = "RETRASADO";
            let colorClass = "text-red-400";
            let estrategia = "El estudiante presenta un rezago significativo respecto al plan de estudios. Asignar sesiones de nivelación obligatorias de inmediato e investigar posibles bloqueos de retención en los módulos previos.";
            let statusText = `retrasado por ${Math.abs(variance).toFixed(1)} unidades`;
            
            if (variance >= 0) {
              estado = "ACELERADO";
              colorClass = "text-emerald-400";
              estrategia = "Ritmo de aprendizaje sobresaliente. El estudiante avanza por encima de la curva esperada. Mantener estimulación académica y considerar una promoción de nivel anticipada si supera los exámenes orales de validación.";
              statusText = `adelantado por ${variance.toFixed(1)} unidades`;
            } else if (variance >= -4) {
              estado = "A RITMO ESPERADO";
              colorClass = "text-blue-400";
              estrategia = "Progresión estable y dentro de los márgenes aceptables. Mantener el seguimiento estándar y motivar al estudiante a sostener la constancia de asistencia semanal.";
              statusText = `ligeramente desviado por ${Math.abs(variance).toFixed(1)} unidades`;
            }

            return (
              <p>
                Este gráfico compara la velocidad real de aprendizaje del estudiante contra nuestro estándar académico de 4 unidades por mes. 
                Durante el semestre proyectado, el estudiante ha completado con éxito <strong>{summary.actual}</strong> unidades válidas, lo que indica que se encuentra <strong>{statusText}</strong> de la meta trazada, marcando un ritmo <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Plan de Acción:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressChart;