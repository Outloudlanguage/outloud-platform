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
        
        // Strict Reality: No fake math padding. Show actual tracking numbers.
        const finalVisitors = safeVisitors;

        setChartData([
          { stage: 'Visitas Web', count: finalVisitors, color: '#64748b' },
          { stage: 'Prospectos (Leads)', count: totalLeads, color: '#3b82f6' },
          { stage: 'Estudiantes Pagos', count: safeStudents, color: '#eab308' }
        ]);

        const conversionRate = finalVisitors > 0 ? ((safeStudents / finalVisitors) * 100).toFixed(1) : 0;
        setMetrics({ visitors: finalVisitors, leads: totalLeads, conversions: safeStudents, rate: conversionRate });

      } catch (error) {
        console.error("Error fetching funnel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING FUNNEL...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-funnel-report" className="commercial-funnel-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-funnel-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-funnel-report, #printable-funnel-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte Comercial Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 flex justify-between items-end border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">Embudo de Adquisición</h3>
          <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">De Tráfico a Conversión</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tasa de Conversión</p>
          <p className="text-4xl font-black text-blue-400">{metrics.rate}%</p>
        </div>
      </div>

      <div className="w-full h-72 mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#64748b' }} tickLine={{ stroke: '#64748b' }} />
            <YAxis dataKey="stage" type="category" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} axisLine={{ stroke: '#64748b' }} tickLine={false} />
            <Tooltip wrapperClassName="hide-on-print" contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} cursor={{ fill: '#ffffff10' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (metrics.visitors === 0 && metrics.leads === 0) return <p>No hay datos suficientes para generar un reporte comercial. El rastreador web no ha registrado tráfico.</p>;
            
            const rate = parseFloat(metrics.rate);
            let estado = "CRÍTICO";
            let colorClass = "text-red-400";
            let estrategia = "Auditar inmediatamente el embudo. El tráfico no está convirtiendo. Revisar la propuesta de valor en la página web, asegurar que el formulario de registro funcione sin fricciones, y contactar directamente a los prospectos (leads) caídos.";
            
            if (rate >= 10) {
              estado = "ÓPTIMO";
              colorClass = "text-emerald-400";
              estrategia = "Tasa de conversión extremadamente saludable. Se recomienda escalar gradualmente la inversión en adquisición de tráfico (pauta publicitaria) manteniendo el mismo segmento de audiencia objetivo para maximizar ingresos.";
            } else if (rate >= 5) {
              estado = "INTERMEDIO";
              colorClass = "text-yellow-400";
              estrategia = "Conversión aceptable pero con margen de mejora. Implementar pruebas A/B en los llamados a la acción (CTAs) de la landing page y ejecutar campañas de retargeting para los prospectos indecisos.";
            }

            return (
              <p>
                De un total de <strong>{metrics.visitors.toLocaleString()}</strong> visitas registradas en la web, se han capturado <strong>{metrics.leads.toLocaleString()}</strong> prospectos, de los cuales <strong>{metrics.conversions.toLocaleString()}</strong> completaron el proceso de inscripción para convertirse en estudiantes pagos. Esto resulta en una tasa de conversión de adquisición (End-to-End) del <strong>{metrics.rate}%</strong>, indicando un estado comercial <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva Comercial:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CommercialFunnelModule;