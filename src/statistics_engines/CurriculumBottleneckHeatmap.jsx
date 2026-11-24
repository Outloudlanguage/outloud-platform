import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const CurriculumBottleneckHeatmap = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [topBottleneck, setTopBottleneck] = useState(null);

  useEffect(() => {
    const fetchBottlenecks = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('student_lesson_progress')
          .select('failed, lessons(title)');

        if (studentId) {
          query = query.eq('user_id', studentId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const lessonStats = {};

        if (data && data.length > 0) {
          data.forEach((record) => {
            const title = record.lessons?.title || 'Unknown Lesson';
            if (!lessonStats[title]) lessonStats[title] = { title, attempts: 0, fails: 0 };
            lessonStats[title].attempts += 1;
            if (record.failed) lessonStats[title].fails += 1;
          });
        }

        const processedData = Object.values(lessonStats)
          .map((l) => ({
            ...l,
            failRate: parseFloat(((l.fails / Math.max(l.attempts, 1)) * 100).toFixed(1)),
          }))
          .filter((l) => l.failRate > 0)
          .sort((a, b) => b.failRate - a.failRate)
          .slice(0, 5);

        setChartData(processedData);
        setTopBottleneck(processedData[0] || null);
      } catch (error) {
        console.error('Error fetching bottlenecks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBottlenecks();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Bottlenecks...
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

  const topRate = topBottleneck ? parseFloat(topBottleneck.failRate) : 0;
  const statusPill = !topBottleneck
    ? { label: 'Sin Fricción', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
    : topRate >= 40
    ? { label: 'Crítico', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' }
    : topRate >= 20
    ? { label: 'Intermedio', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
    : { label: 'Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' };

  return (
    <div
      id="printable-bottleneck-report"
      className="bottleneck-heatmap-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
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
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte Académico Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#ee665b]/15 text-[#c93f34] px-2.5 py-0.5 rounded-full mb-1.5">
            {studentId ? 'Diagnóstico Individual' : 'Top 5 Módulos Críticos'}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            {studentId ? 'Dificultades Personales' : 'Cuellos de Botella Académicos'}
          </h3>
          <p className="text-[11px] font-bold text-[#c93f34] uppercase tracking-wider">
            {studentId ? 'Mayor Tasa de Reprobación por Módulo' : 'Tasa de Fallo por Lección (%)'}
          </p>
        </div>

        <div className="bg-[#fff2f1] border border-[#ee665b]/35 rounded-2xl px-4 py-2 text-right">
          <p className="text-[9.5px] text-[#c93f34] uppercase font-bold tracking-widest">
            Pico de Fallo
          </p>
          <p className="text-3xl font-extrabold text-[#c93f34] leading-tight">
            {topBottleneck ? `${topBottleneck.failRate}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-72 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 16, bottom: 20, left: -16 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 106, 159, 0.18)" vertical={false} />
            <XAxis
              dataKey="title"
              tick={{ fill: '#1e2246', fontSize: 10, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(98, 106, 159, 0.25)' }}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: '#454d82', fontSize: 11, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
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
              cursor={{ fill: 'rgba(238, 102, 91, 0.08)' }}
              formatter={(value) => [`${value}%`, 'Reprobación']}
            />
            <Bar
              dataKey="failRate"
              name="Tasa de Reprobación (%)"
              fill="#ee665b"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Directive Footer */}
      <div className="mt-auto bg-[#f9fafe] border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#fff2f1] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] flex items-center justify-center shrink-0 hide-on-print text-[#c93f34]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              {studentId ? 'Plan de Acción Estudiantil' : 'Directiva Académica Global'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (!topBottleneck) {
              return (
                <p>
                  No se han registrado reprobaciones en el periodo actual. El rendimiento académico general se encuentra en un estado saludable y sin fricciones detectadas.
                </p>
              );
            }

            let estado = 'ÓPTIMO';
            let colorClass = 'text-[#128063]';
            let estrategia =
              'La tasa de fallo es baja y se considera un nivel normal de fricción de aprendizaje. No se requiere intervención inmediata en el diseño del currículo.';

            if (topRate >= 40) {
              estado = 'CRÍTICO';
              colorClass = 'text-[#c93f34]';
              estrategia = studentId
                ? `Intervención obligatoria requerida. Asignar de inmediato una sesión de tutoría de recuperación 1-a-1 enfocada en '${topBottleneck.title}' antes de permitir su avance al siguiente módulo.`
                : `Revisión curricular de emergencia. El módulo '${topBottleneck.title}' está bloqueando masivamente a los estudiantes. Auditar el material didáctico y proporcionar guías suplementarias a los profesores.`;
            } else if (topRate >= 20) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia = studentId
                ? `Asignar material de práctica adicional sobre '${topBottleneck.title}' y notificar a su próximo profesor para que refuerce el tema durante la clase conversacional.`
                : `Vigilancia requerida. El módulo '${topBottleneck.title}' presenta fricción elevada. Sugerimos agendar talleres grupales enfocados en esta competencia específica para descongestionar.`;
            }

            return (
              <p>
                El diagnóstico académico indica que{' '}
                <strong className="text-[#1e2246]">&apos;{topBottleneck.title}&apos;</strong> es actualmente el punto
                de mayor dificultad, con una tasa de reprobación del{' '}
                <strong className="text-[#1e2246]">{topRate}%</strong>. Este indicador señala un estado de fluidez
                académica <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CurriculumBottleneckHeatmap;