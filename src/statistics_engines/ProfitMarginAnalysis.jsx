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

let totalRev = 0;
        let totalCost = 0;

        if (payments && payments.length > 0) {
            totalRev = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        }
        if (logs && logs.length > 0) {
            totalCost = logs.reduce((sum, log) => {
                const hours = (new Date(log.logout_time) - new Date(log.login_time)) / 3600000;
                return sum + (hours * (log.users?.hourly_rate || 3));
            }, 0);
        }

        setChartData([]);
        const marginCalc = totalRev > 0 ? (((totalRev - totalCost) / totalRev) * 100).toFixed(1) : 0;
        setMetrics({ revenue: totalRev, payroll: totalCost, margin: marginCalc });

      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (loading) return <div className="p-8 text-white/50 text-center font-bold tracking-widest">LOADING MARGINS...</div>;

  return (
    <div className="margin-analysis-card relative flex flex-col w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl break-inside-avoid print:bg-white print:border-slate-300 print:shadow-none print:p-4">
      <div className="mb-6 flex justify-between items-end border-b border-white/10 print:border-slate-300 pb-4">
        <div>
          <h3 className="text-2xl font-black tracking-widest uppercase text-white print:text-black">Profit Margin</h3>
          <p className="text-sm font-bold text-green-400 print:text-green-700 uppercase tracking-wide">Gross Revenue vs Payroll Overhead</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 print:text-slate-500 uppercase font-bold tracking-wider">Gross Margin</p>
          <p className="text-4xl font-black text-green-400 print:text-green-700">{metrics.margin}%</p>
        </div>
      </div>

      <div className="w-full h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} className="print:!stroke-slate-200" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
            <Tooltip wrapperClassName="print:hidden" contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 'bold' }} />
            <Bar dataKey="revenue" name="Gross Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line type="monotone" dataKey="cost" name="Teacher Payroll" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 print:border-slate-300 flex items-start gap-4">
        <div className="bg-black/40 print:bg-slate-100 p-3 rounded-xl flex-shrink-0">
          <svg className="w-6 h-6 text-white print:text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm leading-relaxed text-slate-300 print:text-slate-800 font-medium">
          Current data indicates a gross monthly revenue of <strong>${metrics.revenue.toLocaleString()}</strong> offset by <strong>${metrics.payroll.toLocaleString()}</strong> in logged teacher hourly payroll, sustaining an overall gross operational margin of <strong>{metrics.margin}%</strong>.
        </p>
      </div>
    </div>
  );
};

export default ProfitMarginAnalysis;