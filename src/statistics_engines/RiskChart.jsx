import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

const RiskChart = ({ studentId }) => {
  const [data, setData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndCategorizeMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('student_metrics')
          .select('student_id, grade_average, classes_per_week')
          .eq('status', 'active');

        if (studentId) {
          query = query.eq('student_id', studentId);
        }

        const { data: metrics, error: dbError } = await query;
        if (dbError) throw dbError;

        let total = 0;

        const buckets = {
          atRisk: { id: 'atRisk', label: 'En Riesgo', count: 0, color: '#ee665b', stroke: 'none' },
          needsAttention: {
            id: 'needsAttention',
            label: 'Requiere Atención',
            count: 0,
            color: '#ffc749',
            stroke: '#1e2246',
          },
          onTrack: { id: 'onTrack', label: 'Buen Ritmo', count: 0, color: '#5b64a0', stroke: 'none' },
          highPerforming: {
            id: 'highPerforming',
            label: 'Alto Rendimiento',
            count: 0,
            color: '#16a37f',
            stroke: 'none',
          },
        };

        if (metrics && metrics.length > 0) {
          total = metrics.length;
          metrics.forEach((student) => {
            const grade = student.grade_average;
            const classes = student.classes_per_week;

            if (grade < 75 && classes < 1) {
              buckets.atRisk.count++;
            } else if (grade >= 90 && classes >= 3) {
              buckets.highPerforming.count++;
            } else if (grade >= 80 && grade < 90 && classes >= 2 && classes < 3) {
              buckets.onTrack.count++;
            } else {
              buckets.needsAttention.count++;
            }
          });
        }

        const processedData = [
          buckets.atRisk,
          buckets.needsAttention,
          buckets.onTrack,
          buckets.highPerforming,
        ].map((bucket) => ({
          ...bucket,
          percentage: total > 0 ? ((bucket.count / total) * 100).toFixed(1) : 0,
        }));

        setData(processedData);
        setTotalStudents(total);
      } catch (err) {
        console.error('Error fetching risk metrics:', err);
        setError('Unable to load performance risk metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndCategorizeMetrics();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Risk Matrix...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#fff2f1] border-2 border-[#ee665b] rounded-3xl text-[#c93f34] text-center font-bold tracking-wider text-xs font-montserrat">
        {error}
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

  const atRiskPercent = parseFloat(data.find((d) => d.id === 'atRisk')?.percentage || 0);

  return (
    <div
      id="printable-risk-report"
      className="relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-risk-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-risk-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          #printable-risk-report text { fill: black !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte de Riesgo Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff2f1] text-[#c93f34] px-2.5 py-0.5 rounded-full mb-1.5">
            {studentId ? 'Evaluación Individual' : 'Salud de Cohorte'}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            {studentId ? 'Evaluación de Riesgo Personal' : 'Riesgo de Rendimiento Académico'}
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            {studentId
              ? 'Evaluación de Métricas Individuales'
              : `Cohorte Activa Total: ${totalStudents.toLocaleString()} Estudiantes`}
          </p>
        </div>

        <div className="bg-[#fff2f1] border border-[#ee665b]/35 rounded-2xl px-4 py-2 text-right">
          <p className="text-[9.5px] text-[#c93f34] uppercase font-bold tracking-widest">En Riesgo</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#c93f34] leading-tight">
            {atRiskPercent}%
          </p>
        </div>
      </div>

      {/* Recessed SVG Chart Well */}
      <div className="w-full mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-4 sm:p-5 shadow-inner">
        <svg viewBox="0 0 820 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {data.map((item, index) => {
            const yOffset = index * 72 + 12;
            const barWidth = totalStudents > 0 ? (item.count / totalStudents) * 470 : 0;

            return (
              <g key={item.id} transform={`translate(10, ${yOffset})`}>
                <text
                  x="168"
                  y="28"
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#1e2246"
                  fontSize="14.5"
                  fontWeight="700"
                >
                  {item.label}
                </text>

                <rect x="184" y="9" width="470" height="36" rx="12" fill="#e4e7f5" />

                {barWidth > 0 && (
                  <rect
                    x="184"
                    y="9"
                    width={Math.max(barWidth, 16)}
                    height="36"
                    rx="12"
                    fill={item.color}
                    stroke={item.stroke}
                    strokeWidth={item.stroke !== 'none' ? 1.5 : 0}
                  />
                )}

                <text
                  x="670"
                  y="28"
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill="#454d82"
                  fontSize="13.5"
                  fontWeight="800"
                >
                  {item.count} ({item.percentage}%)
                </text>
              </g>
            );
          })}
        </svg>
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
          <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82] block mb-1.5">
            {studentId ? 'Directiva Académica' : 'Estrategia Operativa Global'}
          </span>

          {(() => {
            if (totalStudents === 0) {
              return (
                <p>No hay datos suficientes para calcular las métricas de riesgo en este periodo.</p>
              );
            }

            if (studentId) {
              const studentRisk = data.find((d) => d.count > 0)?.id;
              let estado = 'ESTABLE';
              let colorClass = 'text-[#128063]';
              let estrategia =
                'El estudiante mantiene un ritmo y promedio óptimos. No se requiere intervención inmediata.';

              if (studentRisk === 'atRisk') {
                estado = 'EN RIESGO CRÍTICO';
                colorClass = 'text-[#c93f34]';
                estrategia =
                  'Intervención inmediata requerida. El estudiante presenta un promedio inferior al 75% y asistencia casi nula. Programar contacto directo (llamada) y agendar sesión de nivelación obligatoria para evitar deserción.';
              } else if (studentRisk === 'needsAttention') {
                estado = 'REQUIERE ATENCIÓN';
                colorClass = 'text-[#b37a00]';
                estrategia =
                  'El estudiante muestra ligeras caídas en su rendimiento o asistencia. Asignar seguimiento preventivo por parte de su profesor actual para evitar que decaiga al estado de riesgo.';
              } else if (studentRisk === 'highPerforming') {
                estado = 'ALTO RENDIMIENTO';
                colorClass = 'text-[#128063]';
                estrategia =
                  'Rendimiento sobresaliente. Promedio excelente y asistencia perfecta. Considerar ofrecer oportunidades de avance acelerado o utilizarlo como testimonio de éxito.';
              }

              return (
                <p>
                  Con base en la frecuencia de clases y el promedio de calificaciones, el perfil de este estudiante se
                  clasifica como <strong className={colorClass}>{estado}</strong>. {estrategia}
                </p>
              );
            }

            let estado = 'SALUDABLE';
            let colorClass = 'text-[#128063]';
            let estrategia =
              'La distribución de riesgo de la academia es óptima. Mantener las metodologías de inmersión actuales y continuar el seguimiento automatizado.';

            if (atRiskPercent >= 15) {
              estado = 'CRÍTICO';
              colorClass = 'text-[#c93f34]';
              estrategia =
                'Alerta de capacidad operativa. Una gran porción de la cohorte está en riesgo inminente de deserción o reprobación. Se exige asistencia obligatoria a sesiones remediales 1-a-1 y auditoría de la claridad del material impartido recientemente.';
            } else if (atRiskPercent >= 8) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Volumen de riesgo moderado. Aumentar la frecuencia de correos de reactivación y asegurar que los profesores identifiquen tempranamente las dudas durante las clases en vivo.';
            }

            return (
              <p>
                Nuestra academia utiliza una estricta metodología de inmersión total. Actualmente, el{' '}
                <strong className="text-[#1e2246]">{atRiskPercent}%</strong> de la cohorte activa se encuentra en la
                categoría roja de riesgo. Esto representa un estado operativo{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default RiskChart;