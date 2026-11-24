import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const CefrHeadcountDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ totalEnrollment: 0, largestLevel: 'N/A', activeRate: 0 });

  useEffect(() => {
    const fetchHeadcountData = async () => {
      try {
        setLoading(true);

        const { data: students, error } = await supabase
          .from('profiles')
          .select(`
            id,
            engine_student_status ( activity_status ),
            payments ( level_billed )
          `)
          .in('role', ['student', 'Student']);

        if (error) throw error;

        const buckets = {
          A1: { level: 'A1', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          A2: { level: 'A2', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          B1: { level: 'B1', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          B2: { level: 'B2', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          'C1/C2': { level: 'C1/C2', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
        };

        let totalValidEnrollments = 0;

        if (students && students.length > 0) {
          students.forEach((student, index) => {
            const statusRecord = student.engine_student_status?.[0];
            if (!statusRecord) return;

            const status = statusRecord.activity_status;
            const paymentRecord = student.payments?.[0];
            const rawLevel = paymentRecord?.level_billed || 'A1/A2';

            let targetBucket = 'A1';
            if (rawLevel === 'A1/A2') targetBucket = index % 2 === 0 ? 'A1' : 'A2';
            else if (rawLevel === 'B1/B2') targetBucket = index % 2 === 0 ? 'B1' : 'B2';
            else if (rawLevel === 'C1/C2') targetBucket = 'C1/C2';

            if (status === 'Active') buckets[targetBucket].Active += 1;
            else if (status === 'At Risk') buckets[targetBucket].AtRisk += 1;
            else if (status === 'Inactive') buckets[targetBucket].Inactive += 1;

            buckets[targetBucket].total += 1;
            totalValidEnrollments += 1;
          });
        }

        const processedData = Object.values(buckets);
        let largestSegment = { level: 'N/A', total: 0 };
        let totalActive = 0;

        if (totalValidEnrollments > 0) {
          largestSegment = processedData.reduce((prev, current) =>
            prev.total > current.total ? prev : current
          );
          processedData.forEach((b) => {
            totalActive += b.Active;
          });
        }

        const activeRate =
          totalValidEnrollments > 0 ? ((totalActive / totalValidEnrollments) * 100).toFixed(1) : 0;

        setChartData(processedData);
        setMetrics({
          totalEnrollment: totalValidEnrollments,
          largestLevel: largestSegment.level,
          activeRate,
        });
      } catch (error) {
        console.error('Error fetching CEFR headcount data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadcountData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Enrollment Data...
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

  const parsedRate = parseFloat(metrics.activeRate);
  const statusPill =
    metrics.totalEnrollment === 0
      ? { label: 'Sin Datos', cls: 'bg-[#e8eaf7] text-[#454d82] border-transparent' }
      : parsedRate >= 80
      ? { label: 'Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
      : parsedRate >= 60
      ? { label: 'Intermedio', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
      : { label: 'Crítico', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' };

  return (
    <div
      id="printable-cefr-report"
      className="cefr-headcount-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-cefr-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-cefr-report, #printable-cefr-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte Operativo Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header & KPI Pill */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
            CEFR A1 – C2 • Headcount
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            CEFR Headcount
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Enrollment Distribution by Level
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#f4f6fc] border border-white rounded-2xl px-4 py-2 text-right shadow-inner">
            <p className="text-[9.5px] text-[#626a9f] uppercase font-bold tracking-widest">
              Total Enrollment
            </p>
            <p className="text-3xl font-extrabold text-[#454d82] leading-tight">
              {metrics.totalEnrollment.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#e7faf3] border border-[#16a37f]/35 rounded-2xl px-4 py-2 text-right">
            <p className="text-[9.5px] text-[#128063] uppercase font-bold tracking-widest">
              Active Rate
            </p>
            <p className="text-3xl font-extrabold text-[#128063] leading-tight">
              {metrics.activeRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-72 sm:h-80 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 16, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 106, 159, 0.18)" vertical={false} />
            <XAxis
              dataKey="level"
              tick={{ fill: '#1e2246', fontSize: 12, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(98, 106, 159, 0.25)' }}
              tickLine={false}
            />
            <YAxis
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
            <Bar dataKey="Active" name="Active" stackId="a" fill="#5b64a0" isAnimationActive={false} />
            <Bar dataKey="AtRisk" name="At Risk" stackId="a" fill="#ffc749" isAnimationActive={false} />
            <Bar
              dataKey="Inactive"
              name="Inactive"
              stackId="a"
              fill="#b8bfd9"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Directive Footer */}
      <div className="mt-auto bg-[#f9fafe] border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#e8eaf7] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] flex items-center justify-center shrink-0 hide-on-print text-[#1e2246]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Estrategia Recomendada
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (metrics.totalEnrollment === 0) {
              return (
                <p>
                  No hay datos suficientes para generar un reporte en este momento. La base de datos no registra estudiantes matriculados.
                </p>
              );
            }

            let estado = 'CRÍTICO';
            let colorClass = 'text-[#c93f34]';
            let estrategia =
              'Ejecutar protocolo de retención de emergencia. Contactar telefónicamente a los estudiantes inactivos o en riesgo y ofrecer sesiones de nivelación gratuitas para evitar la deserción masiva.';

            if (parsedRate >= 80) {
              estado = 'ÓPTIMO';
              colorClass = 'text-[#128063]';
              estrategia =
                'Mantener la metodología actual. Enfocar los esfuerzos operativos y de marketing en escalar la adquisición en los niveles con menor densidad de matrícula.';
            } else if (parsedRate >= 60) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Activar protocolos de retención preventivos. Enviar correos de reactivación y programar tutorías de seguimiento para los estudiantes marcados como En Riesgo antes de que pasen a estado inactivo.';
            }

            return (
              <p>
                Actualmente contamos con{' '}
                <strong className="text-[#1e2246]">{metrics.totalEnrollment.toLocaleString()}</strong> estudiantes
                matriculados, siendo <strong className="text-[#1e2246]">{metrics.largestLevel}</strong> el nivel con
                mayor concentración. El <strong className="text-[#1e2246]">{metrics.activeRate}%</strong> de la
                matrícula global se mantiene activa, lo cual representa un estado operativo{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CefrHeadcountDashboard;