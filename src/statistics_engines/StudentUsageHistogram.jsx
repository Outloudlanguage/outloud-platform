import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const StudentUsageHistogram = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ mean: 0, meanCategory: '0-1h', modalBin: '0-1h', modalRange: '0 and 1 hours' });

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);

        let activeQuery = supabase
          .from('engine_student_status')
          .select('user_id')
          .eq('activity_status', 'Active');

        if (studentId) {
          activeQuery = activeQuery.eq('user_id', studentId);
        }

        const { data: activeStudents, error: activeError } = await activeQuery;
        if (activeError) throw activeError;

        let timeData = [];
        if (activeStudents && activeStudents.length > 0) {
          const activeIds = activeStudents.map((s) => s.user_id);

          const { data: times, error: timeError } = await supabase
            .from('engine_time_dedication')
            .select('user_id, mins_this_week')
            .in('user_id', activeIds);

          if (timeError) throw timeError;
          timeData = times;
        }

        const bins = [
          { bin: '0-1h', range: '0 y 1 hora', count: 0 },
          { bin: '1-2h', range: '1 y 2 horas', count: 0 },
          { bin: '2-3h', range: '2 y 3 horas', count: 0 },
          { bin: '3-4h', range: '3 y 4 horas', count: 0 },
          { bin: '4h+', range: 'más de 4 horas', count: 0 },
        ];

        let totalHours = 0;
        let validUsers = 0;

        if (timeData && timeData.length > 0) {
          timeData.forEach((record) => {
            const hours = (record.mins_this_week || 0) / 60;
            totalHours += hours;
            validUsers += 1;

            if (hours < 1) bins[0].count += 1;
            else if (hours < 2) bins[1].count += 1;
            else if (hours < 3) bins[2].count += 1;
            else if (hours < 4) bins[3].count += 1;
            else bins[4].count += 1;
          });
        }

        const calculatedMean = validUsers > 0 ? totalHours / validUsers : 0;
        const modalBinObj = bins.reduce((prev, current) =>
          prev.count > current.count ? prev : current
        );

        let meanBinLabel = '0-1h';
        if (calculatedMean >= 1 && calculatedMean < 2) meanBinLabel = '1-2h';
        if (calculatedMean >= 2 && calculatedMean < 3) meanBinLabel = '2-3h';
        if (calculatedMean >= 3 && calculatedMean < 4) meanBinLabel = '3-4h';
        if (calculatedMean >= 4) meanBinLabel = '4h+';

        setChartData(bins);
        setMetrics({
          mean: calculatedMean.toFixed(1),
          meanCategory: meanBinLabel,
          modalBin: modalBinObj.bin,
          modalRange: modalBinObj.range,
        });
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Usage Matrix...
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

  const meanHours = parseFloat(metrics.mean);

  return (
    <div
      id="printable-usage-report"
      className="usage-histogram-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-usage-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-usage-report, #printable-usage-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte de Dedicación Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
            Inmersión Semanal
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            {studentId ? 'Uso Personal de Plataforma' : 'Dedicación Semanal Global'}
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            {studentId ? 'Tiempo de Inmersión Individual' : 'Distribución de Horas por Estudiante'}
          </p>
        </div>

        <div className="bg-[#fff8e1] border border-[#ffc749] rounded-2xl px-4 py-2 text-right">
          <p className="text-[9.5px] text-[#454d82] uppercase font-bold tracking-widest">Media Semanal</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] leading-tight">
            {metrics.mean}h
          </p>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-72 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 106, 159, 0.18)" vertical={false} />
            <XAxis
              dataKey="bin"
              tick={{ fill: '#1e2246', fontSize: 12, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(98, 106, 159, 0.25)' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#454d82', fontSize: 11, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(98, 106, 159, 0.08)' }}
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
              itemStyle={{ fontWeight: 800, color: '#454d82' }}
            />
            <Bar
              dataKey="count"
              name={studentId ? 'Estudiante' : 'Estudiantes'}
              radius={[10, 10, 0, 0]}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.bin === metrics.modalBin ? '#ffc749' : '#5b64a0'}
                  stroke={entry.bin === metrics.modalBin ? '#1e2246' : 'none'}
                  strokeWidth={entry.bin === metrics.modalBin ? 1.5 : 0}
                />
              ))}
            </Bar>

            <ReferenceLine
              x={metrics.meanCategory}
              stroke="#b37a00"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                position: 'top',
                value: `Media: ${metrics.mean}h`,
                fill: '#b37a00',
                fontSize: 11,
                fontWeight: 800,
              }}
            />
          </BarChart>
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
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82] block mb-1.5">
            {studentId ? 'Directiva de Acompañamiento' : 'Estrategia de Engagement Global'}
          </span>

          {(() => {
            if (meanHours === 0) {
              return (
                <p>
                  No se registran horas de uso en la plataforma esta semana. Seguimiento inmediato requerido.
                </p>
              );
            }

            let estado = 'CRÍTICO';
            let colorClass = 'text-[#c93f34]';
            let estrategia = '';

            if (studentId) {
              if (meanHours >= 3) {
                estado = 'ÓPTIMO';
                colorClass = 'text-[#128063]';
                estrategia =
                  'Excelente nivel de inmersión. El estudiante está cumpliendo con los requisitos de contacto frecuente con el idioma para garantizar retención a largo plazo.';
              } else if (meanHours >= 1.5) {
                estado = 'INTERMEDIO';
                colorClass = 'text-[#b37a00]';
                estrategia =
                  'Tiempo de estudio límite. Sugerirle al estudiante dividir sus sesiones en bloques cortos (micro-learning) durante la semana para evitar picos de saturación.';
              } else {
                estrategia =
                  'Alerta de abandono. El tiempo invertido es insuficiente para la adquisición del idioma. Programar intervención telefónica para identificar bloqueos técnicos o de motivación.';
              }

              return (
                <p>
                  Esta semana, el estudiante registró{' '}
                  <strong className="text-[#1e2246]">{metrics.mean} horas</strong> de inmersión en la plataforma,
                  ubicándose en el segmento de <strong className="text-[#1e2246]">{metrics.meanCategory}</strong>. Su
                  nivel de dedicación actual se considera <strong className={colorClass}>{estado}</strong>. {estrategia}
                </p>
              );
            }

            if (meanHours >= 2.5) {
              estado = 'ÓPTIMO';
              colorClass = 'text-[#128063]';
              estrategia =
                'La base activa presenta un excelente nivel de inmersión global. Mantener dinámicas de gamificación y estructura curricular actuales.';
            } else if (meanHours >= 1.5) {
              estado = 'PROMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Uso estándar pero susceptible a mejora. Enviar boletines o alertas push con micro-desafíos para incentivar entradas más frecuentes a la plataforma web.';
            } else {
              estrategia =
                'El engagement ha caído drásticamente. Auditar plataforma por posibles caídas de servidor y preparar campaña inmediata de reactivación de usuarios (retargeting).';
            }

            return (
              <p>
                A nivel global, la cohorte activa dedicó en promedio{' '}
                <strong className="text-[#1e2246]">{metrics.mean} horas</strong> al aprendizaje esta semana. La
                distribución indica que la mayor concentración (moda) invirtió entre{' '}
                <strong className="text-[#1e2246]">{metrics.modalRange}</strong>. El nivel de inmersión de la academia
                se encuentra en estado <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default StudentUsageHistogram;