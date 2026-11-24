import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-[#1e2246] p-3.5 rounded-2xl shadow-[0_6px_0_rgba(30,34,70,0.12)] hide-on-print font-montserrat">
        <p className="text-[#128063] font-extrabold text-xs uppercase tracking-wider mb-1">
          {data.studentName}
        </p>
        <div className="text-[#1e2246] text-xs font-semibold space-y-0.5">
          <p>
            Tiempo Matriculado:{' '}
            <span className="text-[#454d82] font-extrabold">{data.exactMonths.toFixed(1)} meses</span>
          </p>
          <p>
            Avance:{' '}
            <span className="text-[#454d82] font-extrabold">{data.exactLevels} niveles completados</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const PacingScatterPlotModule = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ standard: [], outliers: [] });

  useEffect(() => {
    const fetchPacingData = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            payments (paid_date, level_billed),
            engine_student_status (is_optimal_pace)
          `)
          .in('role', ['student', 'Student']);

        if (studentId) {
          query = query.eq('id', studentId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const standard = [];
        const outliers = [];

        const jitter = (value, range = 0.35) => Math.max(0, value + (Math.random() - 0.5) * range);

        if (data && data.length > 0) {
          data.forEach((student) => {
            if (!student.payments || student.payments.length === 0) return;

            const dates = student.payments
              .map((p) => new Date(p.paid_date))
              .filter((d) => !isNaN(d));

            if (dates.length === 0) return;

            const firstBillingDate = new Date(Math.min(...dates));
            const monthsEnrolled = (new Date() - firstBillingDate) / (1000 * 60 * 60 * 24 * 30.44);

            const uniqueLevels = new Set(student.payments.map((p) => p.level_billed));
            const levelsCompleted = uniqueLevels.size;

            const plotX = parseFloat(jitter(monthsEnrolled, studentId ? 0 : 0.4).toFixed(2));
            const plotY = parseFloat(jitter(levelsCompleted, studentId ? 0 : 0.4).toFixed(2));

            const studentName = `${student.first_name || 'Estudiante'} ${student.last_name || ''}`.trim();

            const dataPoint = {
              x: plotX,
              y: plotY,
              exactMonths: monthsEnrolled,
              exactLevels: levelsCompleted,
              studentName,
              studentId: student.id,
            };

            const isAbovePace = student.engine_student_status?.[0]?.is_optimal_pace;

            if (levelsCompleted >= 4 && monthsEnrolled <= 3 && isAbovePace) {
              outliers.push(dataPoint);
            } else {
              standard.push(dataPoint);
            }
          });
        }

        setChartData({ standard, outliers });
      } catch (error) {
        console.error('Error fetching pacing data:', error);
        setChartData({ standard: [], outliers: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchPacingData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Pacing Data...
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

  const totalCount = chartData.standard.length + chartData.outliers.length;
  const outlierCount = chartData.outliers.length;
  const outlierPct = totalCount > 0 ? ((outlierCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div
      id="printable-pacing-report"
      className="relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-pacing-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-pacing-report, #printable-pacing-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
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
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full mb-1.5">
            {studentId ? 'Velocidad Individual' : 'Outliers • Acelerados'}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            {studentId ? 'Ritmo Personal de Estudio' : 'Desempeño Global y Acelerado'}
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            {studentId ? 'Meses Matriculado vs Niveles Completados' : 'Casos Atípicos (Outliers)'}
          </p>
        </div>

        <div className="bg-[#e7faf3] border border-[#16a37f]/35 rounded-2xl px-4 py-2 text-right">
          <p className="text-[9.5px] text-[#128063] uppercase font-bold tracking-widest">
            {studentId ? 'Categoría' : 'Acelerados'}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#128063] leading-tight">
            {studentId ? (outlierCount > 0 ? 'Top' : 'Std') : `${outlierPct}%`}
          </p>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="h-72 w-full mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 16, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 106, 159, 0.2)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Meses Matriculado"
              domain={[0, 12]}
              tickCount={7}
              tick={{ fill: '#454d82', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(98, 106, 159, 0.25)' }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Niveles Completados"
              domain={[0, 4]}
              tickCount={5}
              tick={{ fill: '#454d82', fontSize: 11, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis type="number" range={[70, 70]} />
            <Tooltip
              cursor={{ strokeDasharray: '4 4', stroke: '#626a9f' }}
              wrapperClassName="hide-on-print"
              content={<CustomScatterTooltip />}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e2246',
              }}
            />
            <Scatter
              name={studentId ? 'Ritmo de Estudiante' : 'Ritmo Estándar'}
              data={chartData.standard}
              fill="#5b64a0"
              fillOpacity={0.75}
              isAnimationActive={false}
            />
            <Scatter
              name="Casos Acelerados"
              data={chartData.outliers}
              fill="#16a37f"
              fillOpacity={0.95}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Directive Footer */}
      <div className="mt-auto bg-[#f9fafe] border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#e7faf3] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] flex items-center justify-center shrink-0 hide-on-print text-[#128063]">
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
          <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82] block mb-1.5">
            {studentId ? 'Directiva de Seguimiento' : 'Directiva Académica Global'}
          </span>

          {(() => {
            if (totalCount === 0) {
              return (
                <p>
                  No se han registrado datos de progresión y pagos suficientes para realizar un análisis de ritmo de aprendizaje.
                </p>
              );
            }

            if (studentId) {
              const studentData =
                chartData.outliers.length > 0 ? chartData.outliers[0] : chartData.standard[0];
              if (!studentData) {
                return (
                  <p>
                    Faltan datos de facturación o progreso para calcular el ritmo exacto de este estudiante.
                  </p>
                );
              }

              const isOutlier = chartData.outliers.length > 0;
              const estado = isOutlier ? 'ACELERADO' : 'ESTÁNDAR';
              const colorClass = isOutlier ? 'text-[#128063]' : 'text-[#454d82]';
              const estrategia = isOutlier
                ? 'El estudiante avanza a un ritmo excepcional (≥ 4 niveles completados en ≤ 3 meses). Considerar invitarlo al programa intensivo o utilizarlo como caso de éxito en marketing.'
                : 'El estudiante mantiene una velocidad de aprendizaje dentro del promedio proyectado. Continuar monitoreando su rendimiento general en clases para asegurar retención a largo plazo.';

              return (
                <p>
                  Este estudiante ha estado matriculado de forma continua durante{' '}
                  <strong className="text-[#1e2246]">{studentData.exactMonths.toFixed(1)} meses</strong> y ha
                  completado un total de{' '}
                  <strong className="text-[#1e2246]">{studentData.exactLevels} niveles</strong>. Basado en este
                  historial de progresión, su ritmo de aprendizaje actual se clasifica como{' '}
                  <strong className={colorClass}>{estado}</strong>. {estrategia}
                </p>
              );
            }

            let estado = 'NORMAL';
            let colorClass = 'text-[#454d82]';
            let estrategia =
              'La cohorte de estudiantes en general avanza al ritmo esperado. Mantener las metodologías y ciclos de enseñanza estándar.';

            if (parseFloat(outlierPct) >= 10) {
              estado = 'ALTO RENDIMIENTO';
              colorClass = 'text-[#128063]';
              estrategia =
                'Existe un porcentaje significativo de estudiantes acelerados. Se recomienda abrir más horarios de niveles avanzados y considerar estrategias de ventas adicionales (upsells) hacia programas de inmersión.';
            } else if (parseFloat(outlierPct) > 0) {
              estado = 'PROMEDIO SÓLIDO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Aparición temprana de estudiantes de alto rendimiento identificada. Monitorear de cerca a estos casos atípicos (puntos verdes) para proveer material estimulante y evitar desgaste por aburrimiento.';
            }

            return (
              <p>
                De los <strong className="text-[#1e2246]">{totalCount}</strong> perfiles activos analizados
                globalmente, <strong className="text-[#1e2246]">{outlierCount}</strong> estudiantes ({outlierPct}%) se
                clasifican como atípicos acelerados, logrando completar 4 o más niveles en periodos inferiores a 3
                meses. Este volumen indica un comportamiento de progresión global de categoría{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default PacingScatterPlotModule;