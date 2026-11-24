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

const CustomAttendanceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const attended = payload[0]?.value || 0;
    const noShows = payload[1]?.value || 0;
    const total = attended + noShows;
    const rate = total > 0 ? ((noShows / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white border-2 border-[#1e2246] p-3.5 rounded-2xl shadow-[0_6px_0_rgba(30,34,70,0.12)] hide-on-print font-montserrat">
        <p className="text-[#1e2246] font-extrabold text-xs uppercase tracking-wider mb-1.5">{label}</p>
        <p className="text-[#454d82] font-bold text-xs">Asistencias: {attended}</p>
        <p className="text-[#c93f34] font-extrabold text-xs">
          Ausencias: {noShows} ({rate}%)
        </p>
        <p className="text-[#626a9f] text-[10.5px] font-bold mt-2 border-t border-[#dfe2f2] pt-1.5">
          Total Reservas: {total}
        </p>
      </div>
    );
  }
  return null;
};

const LiveClassAttendanceChart = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ totalBooked: 0, currentWeekMissed: 0, currentWeekRate: 0 });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);

        const now = new Date();
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(now.getDate() - 8 * 7);

        const { data, error } = await supabase
          .from('live_class_attendance')
          .select('attended, live_classes!inner(scheduled_start)')
          .eq('is_booked', true)
          .gte('live_classes.scheduled_start', eightWeeksAgo.toISOString());

        if (error) throw error;

        let totalBookedAllTime = 0;

        const weeklyBuckets = Array.from({ length: 8 }, (_, i) => ({
          week: `Week ${i + 1}`,
          booked: 0,
          attended: 0,
          noShows: 0,
        }));

        if (data && data.length > 0) {
          data.forEach((record) => {
            const classDate = new Date(record.live_classes.scheduled_start);
            const daysDiff = Math.floor((classDate - eightWeeksAgo) / (1000 * 60 * 60 * 24));
            const bucketIndex = Math.max(0, Math.min(Math.floor(daysDiff / 7), 7));

            weeklyBuckets[bucketIndex].booked += 1;
            if (record.attended) {
              weeklyBuckets[bucketIndex].attended += 1;
            } else {
              weeklyBuckets[bucketIndex].noShows += 1;
            }
            totalBookedAllTime += 1;
          });
        }

        const currentWeek = weeklyBuckets[7];
        const currentRate =
          currentWeek.booked > 0 ? ((currentWeek.noShows / currentWeek.booked) * 100).toFixed(1) : 0;

        setChartData(weeklyBuckets);
        setSummary({
          totalBooked: totalBookedAllTime,
          currentWeekMissed: currentWeek.noShows,
          currentWeekRate: currentRate,
        });
      } catch (error) {
        console.error('Error fetching live class attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Attendance...
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

  const parsedRate = parseFloat(summary.currentWeekRate);
  const statusPill =
    summary.totalBooked === 0
      ? { label: 'Sin Reservas', cls: 'bg-[#e8eaf7] text-[#454d82] border-transparent' }
      : parsedRate >= 15
      ? { label: 'Crítico', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' }
      : parsedRate >= 8
      ? { label: 'Intermedio', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
      : { label: 'Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' };

  return (
    <div
      id="printable-attendance-report"
      className="live-attendance-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-attendance-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-attendance-report, #printable-attendance-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
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

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
            Live Labs • 8 Semanas
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            Asistencia a Clases en Vivo
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Reservas Confirmadas vs Ausentismo
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#f4f6fc] border border-white rounded-2xl px-4 py-2 text-right shadow-inner">
            <p className="text-[9.5px] text-[#626a9f] uppercase font-bold tracking-widest">Reservas</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] leading-tight">
              {summary.totalBooked.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#fff2f1] border border-[#ee665b]/35 rounded-2xl px-4 py-2 text-right">
            <p className="text-[9.5px] text-[#c93f34] uppercase font-bold tracking-widest">No-Show Sem.</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#c93f34] leading-tight">
              {summary.currentWeekRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-72 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 16, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 106, 159, 0.18)" vertical={false} />
            <XAxis
              dataKey="week"
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
              content={<CustomAttendanceTooltip />}
              cursor={{ fill: 'rgba(98, 106, 159, 0.08)' }}
              wrapperClassName="hide-on-print"
            />
            <Legend
              wrapperStyle={{
                paddingTop: '10px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e2246',
              }}
            />
            <Bar
              dataKey="attended"
              name="Asistencias Confirmadas"
              stackId="a"
              fill="#5b64a0"
              isAnimationActive={false}
            />
            <Bar
              dataKey="noShows"
              name="Ausencias (No-Shows)"
              stackId="a"
              fill="#ee665b"
              isAnimationActive={false}
              radius={[8, 8, 0, 0]}
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
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Directiva de Rentabilidad
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (summary.totalBooked === 0) {
              return (
                <p>No se han registrado reservas de clases en el sistema durante las últimas 8 semanas.</p>
              );
            }

            let estado = 'ÓPTIMO';
            let colorClass = 'text-[#128063]';
            let estrategia =
              'El índice de ausentismo es bajo. Los costos operativos están optimizados y los profesores están maximizando sus bloques horarios facturables.';

            if (parsedRate >= 15) {
              estado = 'CRÍTICO';
              colorClass = 'text-[#c93f34]';
              estrategia =
                'Alta pérdida financiera por horas de profesor pagadas pero no utilizadas. Implementar inmediatamente política de penalización por inasistencia (descuento de sesión) sin previo aviso y activar recordatorios SMS automáticos 2 horas antes de la clase.';
            } else if (parsedRate >= 8) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'El ausentismo está impactando levemente el margen de rentabilidad operativa. Reforzar la comunicación de la política de cancelación e incentivar a los estudiantes a usar el botón de reprogramación anticipada en la plataforma.';
            }

            return (
              <p>
                Durante las últimas 8 semanas, se han registrado{' '}
                <strong className="text-[#1e2246]">{summary.totalBooked.toLocaleString()}</strong> reservas totales de
                clases en vivo. En la semana en curso, se observa una tasa de ausentismo del{' '}
                <strong className="text-[#1e2246]">{summary.currentWeekRate}%</strong> ({summary.currentWeekMissed}{' '}
                clases perdidas), marcando un nivel de eficiencia operativa{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default LiveClassAttendanceChart;