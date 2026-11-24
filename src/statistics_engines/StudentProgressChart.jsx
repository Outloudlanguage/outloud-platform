import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const StudentProgressChart = ({ studentId = 'default-student-id' }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ actual: 0, variance: 0 });

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: lessons, error } = await supabase
          .from('student_lesson_progress')
          .select('completed_at, total_score')
          .eq('user_id', studentId)
          .eq('status', 'completed')
          .gte('total_score', 75)
          .gte('completed_at', sixMonthsAgo.toISOString())
          .order('completed_at', { ascending: true });

        if (error) throw error;

        const targetUnits = [4, 8, 12, 16, 20, 24];
        const monthlyCounts = [0, 0, 0, 0, 0, 0];

        if (lessons && lessons.length > 0) {
          lessons.forEach((lesson) => {
            const completedDate = new Date(lesson.completed_at);
            const monthDiff =
              (completedDate.getFullYear() - sixMonthsAgo.getFullYear()) * 12 +
              (completedDate.getMonth() - sixMonthsAgo.getMonth());
            const bucketIndex = Math.max(0, Math.min(5, monthDiff));
            monthlyCounts[bucketIndex] += 1;
          });
        }

        let cumulativeActual = 0;
        const processedData = targetUnits.map((target, index) => {
          cumulativeActual += monthlyCounts[index];
          return {
            month: `Mes ${index + 1}`,
            target,
            actual: cumulativeActual,
          };
        });

        const finalTarget = targetUnits[5];
        const finalActual = processedData[5].actual;
        const variance = finalActual - finalTarget;

        setChartData(processedData);
        setSummary({
          actual: finalActual,
          variance,
        });
      } catch (error) {
        console.error('Error fetching student progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Progress...
        </span>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusPill =
    summary.variance >= 0
      ? { label: 'Acelerado', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
      : summary.variance >= -4
      ? { label: 'A Ritmo', cls: 'bg-[#e8eaf7] text-[#454d82] border-[#626a9f]/30' }
      : { label: 'Retrasado', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' };

  return (
    <div
      id="printable-progress-report"
      className="student-progress-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
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
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte de Rendimiento Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-0.5 rounded-full mb-1.5">
            Meta 4 Unidades / Mes
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            Progreso del Estudiante
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Ritmo Real vs Meta Esperada (6 Meses)
          </p>
        </div>

        <div className="bg-[#fff8e1] border border-[#ffc749] rounded-2xl px-4 py-2 text-right">
          <p className="text-[9.5px] text-[#454d82] uppercase font-bold tracking-widest">Unidades Válidas</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] leading-tight">
            {summary.actual} <span className="text-sm font-bold text-[#626a9f]">/ 24</span>
          </p>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-72 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 106, 159, 0.18)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#454d82', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(98, 106, 159, 0.25)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#454d82', fontSize: 11, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              wrapperClassName="hide-on-print"
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '2px solid #1e2246',
                borderRadius: '16px',
                color: '#1e2246',
                fontWeight: 700,
                fontSize: '12px',
                boxShadow: '0 6px 0 rgba(30,34,70,0.1)',
              }}
              itemStyle={{ fontWeight: 700 }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '10px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e2246',
              }}
            />

            <Line
              type="monotone"
              dataKey="target"
              name="Meta Académica (4/mes)"
              stroke="#5b64a0"
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={{ r: 4, fill: '#ffffff', stroke: '#5b64a0', strokeWidth: 2 }}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="actual"
              name="Progreso Real"
              stroke="#d99600"
              strokeWidth={3.5}
              dot={{ r: 5, fill: '#ffc749', stroke: '#1e2246', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#ffc749', stroke: '#1e2246', strokeWidth: 2.5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Directive Footer */}
      <div className="mt-auto bg-[#f9fafe] border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#fff3d1] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] flex items-center justify-center shrink-0 hide-on-print text-[#1e2246]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Plan de Acción
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            const variance = summary.variance;
            let estado = 'RETRASADO';
            let colorClass = 'text-[#c93f34]';
            let estrategia =
              'El estudiante presenta un rezago significativo respecto al plan de estudios. Asignar sesiones de nivelación obligatorias de inmediato e investigar posibles bloqueos de retención en los módulos previos.';
            let statusText = `retrasado por ${Math.abs(variance).toFixed(1)} unidades`;

            if (variance >= 0) {
              estado = 'ACELERADO';
              colorClass = 'text-[#128063]';
              estrategia =
                'Ritmo de aprendizaje sobresaliente. El estudiante avanza por encima de la curva esperada. Mantener estimulación académica y considerar una promoción de nivel anticipada si supera los exámenes orales de validación.';
              statusText = `adelantado por ${variance.toFixed(1)} unidades`;
            } else if (variance >= -4) {
              estado = 'A RITMO ESPERADO';
              colorClass = 'text-[#454d82]';
              estrategia =
                'Progresión estable y dentro de los márgenes aceptables. Mantener el seguimiento estándar y motivar al estudiante a sostener la constancia de asistencia semanal.';
              statusText = `ligeramente desviado por ${Math.abs(variance).toFixed(1)} unidades`;
            }

            return (
              <p>
                Este gráfico compara la velocidad real de aprendizaje del estudiante contra nuestro estándar académico
                de 4 unidades por mes. Durante el semestre proyectado, completó con éxito{' '}
                <strong className="text-[#1e2246]">{summary.actual}</strong> unidades válidas, ubicándose{' '}
                <strong className="text-[#1e2246]">{statusText}</strong> de la meta trazada, marcando un ritmo{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressChart;