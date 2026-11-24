import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const MonthlyActiveUsers = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    rate: 0,
    target: 0,
    variance: 0,
  });

  useEffect(() => {
    const fetchMAUData = async () => {
      try {
        setLoading(true);

        const { data: statusData, error: statusError } = await supabase
          .from('engine_student_status')
          .select('user_id, activity_status');

        if (statusError) throw statusError;

        let totalStudents = 0;
        let currentActive = 0;

        if (statusData && statusData.length > 0) {
          totalStudents = statusData.length;
          currentActive = statusData.filter((s) => s.activity_status === 'Active').length;
        }

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const { data: historyData, error: historyError } = await supabase
          .from('student_lesson_progress')
          .select('user_id, completed_at')
          .gte('completed_at', oneYearAgo.toISOString());

        if (historyError) throw historyError;

        const months = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          months.push({
            label: d.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
            year: d.getFullYear(),
            monthNum: d.getMonth(),
            activeUsers: new Set(),
          });
        }

        if (historyData && historyData.length > 0) {
          historyData.forEach((log) => {
            const date = new Date(log.completed_at);
            const targetMonth = months.find(
              (m) => m.monthNum === date.getMonth() && m.year === date.getFullYear()
            );
            if (targetMonth) {
              targetMonth.activeUsers.add(log.user_id);
            }
          });
        }

        const formattedChartData = months.map((m) => ({
          month: m.label,
          users: m.activeUsers.size,
        }));

        const targetBenchmark = Math.round(totalStudents * 0.8);
        const activeRate = totalStudents > 0 ? ((currentActive / totalStudents) * 100).toFixed(1) : 0;
        const activeVariance = currentActive - targetBenchmark;

        setMetrics({
          total: totalStudents,
          active: currentActive,
          rate: activeRate,
          target: targetBenchmark,
          variance: activeVariance,
        });

        setChartData(formattedChartData);
      } catch (error) {
        console.error('Error fetching MAU data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMAUData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading MAU Data...
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

  const parsedRate = parseFloat(metrics.rate);
  const statusPill =
    metrics.total === 0
      ? { label: 'Sin Datos', cls: 'bg-[#e8eaf7] text-[#454d82] border-transparent' }
      : parsedRate >= 80
      ? { label: 'Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
      : parsedRate >= 60
      ? { label: 'Intermedio', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
      : { label: 'Crítico', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' };

  return (
    <div
      id="printable-mau-report"
      className="mau-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-mau-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-mau-report, #printable-mau-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte de Engagement Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header & KPIs */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-0.5 rounded-full mb-1.5">
            Retención • 12 Meses
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            Usuarios Activos Mensuales
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Tendencia de Engagement (MAU)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#f4f6fc] border border-white rounded-2xl px-4 py-2 text-right shadow-inner">
            <p className="text-[9.5px] text-[#626a9f] uppercase font-bold tracking-widest">MAU Actual</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#454d82] leading-tight">
              {metrics.active.toLocaleString()}
            </p>
          </div>
          <div
            className={`rounded-2xl px-4 py-2 text-right border ${
              metrics.variance >= 0
                ? 'bg-[#e7faf3] border-[#16a37f]/35'
                : 'bg-[#fff3d1] border-[#ffc749]'
            }`}
          >
            <p className="text-[9.5px] text-[#454d82] uppercase font-bold tracking-widest">Tasa Activa</p>
            <p
              className={`text-2xl sm:text-3xl font-extrabold leading-tight ${
                metrics.variance >= 0 ? 'text-[#128063]' : 'text-[#1e2246]'
              }`}
            >
              {metrics.rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-72 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 18, right: 20, bottom: 4, left: -16 }}>
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
              domain={[0, 'dataMax + 10']}
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
              itemStyle={{ fontWeight: 800, color: '#454d82' }}
            />
            <ReferenceLine
              y={metrics.target}
              stroke="#b37a00"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                position: 'top',
                value: `Meta 80% (${metrics.target})`,
                fill: '#b37a00',
                fontSize: 11,
                fontWeight: 800,
              }}
            />
            <Line
              type="monotone"
              dataKey="users"
              name="Usuarios Activos"
              stroke="#5b64a0"
              strokeWidth={3}
              dot={{ r: 5, fill: '#ffc749', stroke: '#1e2246', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#ffc749', stroke: '#1e2246', strokeWidth: 2.5 }}
              isAnimationActive={false}
            />
          </LineChart>
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
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Directiva de Retención
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (metrics.total === 0) {
              return (
                <p>
                  No hay datos suficientes para generar un reporte de retención. Actualmente no hay estudiantes matriculados en la base de datos.
                </p>
              );
            }

            const varianceAbs = Math.abs(metrics.variance);
            let estado = 'CRÍTICO';
            let colorClass = 'text-[#c93f34]';
            let estrategia =
              'Riesgo extremo de deserción (Churn). Gran parte de la base de estudiantes está pagando pero no consumiendo sus clases. Ejecutar protocolo de reactivación urgente: contactar uno a uno y ofrecer sesiones de onboarding de recuperación.';

            if (parsedRate >= 80) {
              estado = 'ÓPTIMO';
              colorClass = 'text-[#128063]';
              estrategia =
                'La retención de la plataforma es excelente, superando el benchmark del 80%. Los estudiantes están comprometidos. Se recomienda mantener la estrategia actual de notificaciones y seguimiento continuo.';
            } else if (parsedRate >= 60) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Alerta temprana de desvinculación. Un segmento importante no está tomando clases activamente. Activar campaña automatizada de correos de re-engagement para reincorporarlos antes de su próximo ciclo de cobro.';
            }

            const statusText =
              metrics.variance >= 0
                ? `superando la meta objetivo del 80% por ${varianceAbs} estudiantes`
                : `lo cual nos sitúa ${varianceAbs} estudiantes por debajo de la meta objetivo del 80%`;

            return (
              <p>
                Actualmente, <strong className="text-[#1e2246]">{metrics.active.toLocaleString()}</strong> de nuestros{' '}
                <strong className="text-[#1e2246]">{metrics.total.toLocaleString()}</strong> estudiantes matriculados
                están tomando clases activamente este mes. Esto se traduce en una tasa de actividad del{' '}
                <strong className="text-[#1e2246]">{metrics.rate}%</strong>, {statusText}, marcando un estado de
                engagement <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default MonthlyActiveUsers;