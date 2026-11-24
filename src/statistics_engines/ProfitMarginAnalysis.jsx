import React, { useState, useEffect, useRef } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const ProfitMarginAnalysis = ({ onMetricsUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ revenue: 0, payroll: 0, margin: 0 });

  const onMetricsUpdateRef = useRef(onMetricsUpdate);
  onMetricsUpdateRef.current = onMetricsUpdate;

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);

        // Fetch paid revenue
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, paid_date')
          .in('status', ['on_time', 'late']);

        // Fetch teacher logs joined with hourly rate
        const { data: logs } = await supabase
          .from('teacher_class_logs')
          .select('login_time, logout_time, users(hourly_rate)');

        // Build 6-month historical buckets
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          months.push({
            month: d.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
            year: d.getFullYear(),
            monthNum: d.getMonth(),
            revenue: 0,
            cost: 0,
          });
        }

        let totalRev = 0;
        let totalCost = 0;

        if (payments && payments.length > 0) {
          payments.forEach((p) => {
            const val = Number(p.amount) || 0;
            totalRev += val;
            const date = new Date(p.paid_date);
            const bucket = months.find(
              (m) => m.monthNum === date.getMonth() && m.year === date.getFullYear()
            );
            if (bucket) bucket.revenue += val;
          });
        }

        if (logs && logs.length > 0) {
          logs.forEach((log) => {
            if (!log.login_time || !log.logout_time) return;
            const hours = (new Date(log.logout_time) - new Date(log.login_time)) / 3600000;
            if (hours < 0) return;

            const cost = hours * (log.users?.hourly_rate || 3);
            totalCost += cost;
            const date = new Date(log.login_time);
            const bucket = months.find(
              (m) => m.monthNum === date.getMonth() && m.year === date.getFullYear()
            );
            if (bucket) bucket.cost += cost;
          });
        }

        const marginCalc =
          totalRev > 0 ? (((totalRev - totalCost) / totalRev) * 100).toFixed(1) : 0;
        const summary = { revenue: totalRev, payroll: totalCost, margin: marginCalc };

        setMetrics(summary);
        setChartData(months);

        if (typeof onMetricsUpdateRef.current === 'function') {
          onMetricsUpdateRef.current(summary);
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Margins...
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

  const parsedMargin = parseFloat(metrics.margin);
  const statusPill =
    metrics.revenue === 0
      ? { label: 'Sin Datos', cls: 'bg-[#e8eaf7] text-[#454d82]' }
      : parsedMargin >= 60
      ? { label: 'Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
      : parsedMargin >= 40
      ? { label: 'Intermedio', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
      : { label: 'Crítico', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' };

  return (
    <div
      id="printable-margin-report"
      className="margin-analysis-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-margin-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-margin-report, #printable-margin-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte Financiero Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full mb-1.5">
            6 Meses • P&amp;L
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            Margen de Beneficio
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Ingresos Brutos vs Nómina Docente
          </p>
        </div>

        <div className="bg-[#f4f6fc] border border-white rounded-2xl px-4 py-2 text-right shadow-inner">
          <p className="text-[9.5px] text-[#626a9f] uppercase font-bold tracking-widest">
            Margen Bruto Global
          </p>
          <p className="text-3xl font-extrabold text-[#128063] leading-tight">
            {metrics.margin}%
          </p>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-64 sm:h-72 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
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
              tickFormatter={(value) => `$${value}`}
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
              formatter={(value) => [`$${Number(value).toFixed(2)}`, undefined]}
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
              dataKey="revenue"
              name="Ingresos Brutos"
              fill="#5b64a0"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="cost"
              name="Nómina Docente"
              stroke="#ee665b"
              strokeWidth={3}
              dot={{ r: 5, fill: '#ffc749', stroke: '#1e2246', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#ffc749', stroke: '#1e2246', strokeWidth: 2.5 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Executive Directive Footer */}
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
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Directiva Financiera
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (metrics.revenue === 0) {
              return (
                <p>
                  No hay datos suficientes registrados para calcular el margen de beneficio en este periodo.
                </p>
              );
            }

            let estado = 'CRÍTICO';
            let colorClass = 'text-[#c93f34]';
            let estrategia =
              'Costos operativos excesivamente altos en proporción a los ingresos. Auditar inmediatamente las nóminas docentes, reducir estrictamente las horas en espera (standby) no facturables, y consolidar los grupos con baja asistencia para reducir el gasto por hora.';

            if (parsedMargin >= 60) {
              estado = 'ÓPTIMO';
              colorClass = 'text-[#128063]';
              estrategia =
                'El margen de beneficio bruto es altamente rentable, superando el estándar de la industria. Se recomienda destinar un porcentaje del excedente hacia la reinversión en captación de leads (pauta publicitaria) o bonificaciones por rendimiento para el personal.';
            } else if (parsedMargin >= 40) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Rentabilidad dentro de los parámetros estándar. Vigilar de cerca la densidad de estudiantes por clase para optimizar el pago del docente y evitar fugas de capital asociadas a bloques horarios vacíos.';
            }

            return (
              <p>
                Los datos acumulados indican ingresos brutos de{' '}
                <strong className="text-[#1e2246]">
                  ${metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </strong>
                , contrarrestados por{' '}
                <strong className="text-[#1e2246]">
                  ${metrics.payroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </strong>{' '}
                en costos de nómina docente, resultando en un margen operativo bruto global del{' '}
                <strong className="text-[#1e2246]">{metrics.margin}%</strong>. Esto señala un estado de viabilidad financiera{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProfitMarginAnalysis;