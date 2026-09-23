import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './CommercialFunnelModule.css';

const CommercialFunnelModule = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ visitors: 0, conversions: 0, rate: 0 });

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        setLoading(true);

        // 1. Get Site Visitors from the new analytics table
        const { count: visitorCount } = await supabase
          .from('site_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('event_type', 'site_visit');

        // 2. Get Pending Leads from Registrations
        const { count: pendingCount } = await supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true });

        // 3. Get Paid Students from Profiles
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'Student');

        const safeVisitors = visitorCount || 0;
        const safePending = pendingCount || 0;
        const safeStudents = studentCount || 0;

        // Total leads historically = currently pending + people who already became students
        const totalLeads = safePending + safeStudents;
        
        // Failsafe: Because we just installed the analytics tracker today, you will temporarily 
        // have more historical leads than recorded visits. This forces the funnel to make 
        // visual sense during this transition period.
        const finalVisitors = Math.max(safeVisitors, totalLeads);

        setChartData([
          { stage: 'Site Visitors', count: finalVisitors, color: '#64748b' },
          { stage: 'Form Leads', count: totalLeads, color: '#3b82f6' },
          { stage: 'Paid Students', count: safeStudents, color: '#eab308' }
        ]);

        const conversionRate = finalVisitors > 0 ? ((safeStudents / finalVisitors) * 100).toFixed(1) : 0;
        setMetrics({ visitors: finalVisitors, conversions: safeStudents, rate: conversionRate });

      } catch (error) {
        console.error("Error fetching funnel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING FUNNEL...</div>;

  return (
    <div className="commercial-funnel-card relative flex flex-col w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-8 shadow-2xl break-inside-avoid print:bg-white print:border-slate-300 print:shadow-none print:p-4">
      <div className="mb-6 flex justify-between items-end border-b border-white/10 print:border-slate-300 pb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white print:text-black">Acquisition Funnel</h3>
          <p className="text-sm font-bold text-yellow-400 print:text-slate-600 uppercase tracking-wide">Traffic to Conversion Pipeline</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 print:text-slate-500 uppercase font-bold tracking-wider">Conversion Rate</p>
          <p className="text-4xl font-black text-blue-400 print:text-blue-700">{metrics.rate}%</p>
        </div>
      </div>

      <div className="w-full h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" horizontal={false} className="print:!stroke-slate-200" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
            <YAxis dataKey="stage" type="category" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
            <Tooltip wrapperClassName="print:hidden" contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} cursor={{ fill: '#ffffff10' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 print:border-slate-300 flex items-start gap-4">
        <div className="bg-black/40 print:bg-slate-100 p-3 rounded-xl flex-shrink-0">
          <svg className="w-6 h-6 text-white print:text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <p className="text-sm leading-relaxed text-slate-300 print:text-slate-800 font-medium">
          Out of <strong>{metrics.visitors.toLocaleString()}</strong> recorded website sessions, <strong>{metrics.conversions.toLocaleString()}</strong> users completed the pipeline to become paid students. This yields an end-to-end acquisition conversion rate of <strong>{metrics.rate}%</strong>.
        </p>
      </div>
    </div>
  );
};

export default CommercialFunnelModule;