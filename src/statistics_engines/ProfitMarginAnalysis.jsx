import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './ProfitMarginAnalysis.css';

const ProfitMarginAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ revenue: 0, payroll: 0, margin: 0 });

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
            cost: 0
          });
        }

        let totalRev = 0;
        let totalCost = 0;

        if (payments && payments.length > 0) {
          payments.forEach(p => {
            const val = Number(p.amount) || 0;
            totalRev += val;
            const date = new Date(p.paid_date);
            const bucket = months.find(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
            if (bucket) bucket.revenue += val;
          });
        }

        if (logs && logs.length > 0) {
          logs.forEach(log => {
            if (!log.login_time || !log.logout_time) return;
            const hours = (new Date(log.logout_time) - new Date(log.login_time)) / 3600000;
            if (hours < 0) return;
            
            const cost = hours * (log.users?.hourly_rate || 3);
            totalCost += cost;
            const date = new Date(log.login_time);
            const bucket = months.find(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
            if (bucket) bucket.cost += cost;
          });
        }

        const marginCalc = totalRev > 0 ? (((totalRev - totalCost) / totalRev) * 100).toFixed(1) : 0;
        setMetrics({ revenue: totalRev, payroll: totalCost, margin: marginCalc });
        setChartData(months);

      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING MARGINS...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-margin-report" className="margin-analysis-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
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
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte Financiero Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 flex justify-between items-end border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">Margen de Beneficio</h3>
          <p className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Ingresos Brutos vs Nómina Docente (6 Meses)</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Margen Bruto Global</p>
          <p className="text-4xl font-black text-emerald-400">{metrics.margin}%</p>
        </div>
      </div>

      <div className="w-full h-72 mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#64748b' }} tickLine={{ stroke: '#64748b' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#64748b' }} tickLine={{ stroke: '#64748b' }} tickFormatter={(value) => `$${value}`} />
            <Tooltip wrapperClassName="hide-on-print" contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} formatter={(value) => [`$${value.toFixed(2)}`, undefined]} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 'bold' }} />
            <Bar dataKey="revenue" name="Ingresos Brutos" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line type="monotone" dataKey="cost" name="Nómina de Profesores" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (metrics.revenue === 0) return <p>No hay datos suficientes registrados para calcular el margen de beneficio en este periodo.</p>;
            
            const margin = parseFloat(metrics.margin);
            let estado = "CRÍTICO";
            let colorClass = "text-red-400";
            let estrategia = "Costos operativos excesivamente altos en proporción a los ingresos. Auditar inmediatamente las nóminas docentes, reducir estrictamente las horas en espera (standby) no facturables, y consolidar los grupos con baja asistencia para reducir el gasto por hora.";
            
            if (margin >= 60) {
              estado = "ÓPTIMO";
              colorClass = "text-emerald-400";
              estrategia = "El margen de beneficio bruto es altamente rentable, superando el estándar de la industria. Se recomienda destinar un porcentaje del excedente hacia la reinversión en captación de leads (pauta publicitaria) o bonificaciones por rendimiento para el personal.";
            } else if (margin >= 40) {
              estado = "INTERMEDIO";
              colorClass = "text-yellow-400";
              estrategia = "Rentabilidad dentro de los parámetros estándar. Vigilar de cerca la densidad de estudiantes por clase para optimizar el pago del docente y evitar fugas de capital asociadas a bloques horarios vacíos.";
            }

            return (
              <p>
                Los datos acumulados indican ingresos brutos de <strong>${metrics.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</strong>, 
                contrarrestados por <strong>${metrics.payroll.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</strong> en costos de nómina docente, resultando en un margen operativo bruto global del <strong>{metrics.margin}%</strong>. 
                Esto señala un estado de viabilidad financiera <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva Financiera:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProfitMarginAnalysis;