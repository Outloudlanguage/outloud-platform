import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './MonthlyActiveUsers.css';

const MonthlyActiveUsers = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ 
    total: 0, 
    active: 0, 
    rate: 0, 
    target: 0,
    variance: 0 
  });

  useEffect(() => {
    const fetchMAUData = async () => {
      try {
        setLoading(true);

        // 1. Fetch current status pool (Total and Currently Active)
        const { data: statusData, error: statusError } = await supabase
          .from('engine_student_status')
          .select('user_id, activity_status');

        if (statusError) throw statusError;

        let totalStudents = 0;
        let currentActive = 0;

        if (statusData && statusData.length > 0) {
          totalStudents = statusData.length;
          currentActive = statusData.filter(s => s.activity_status === 'Active').length;
        }

        // 2. Fetch trailing 12-month historical interaction logs
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const { data: historyData, error: historyError } = await supabase
          .from('student_lesson_progress')
          .select('user_id, completed_at')
          .gte('completed_at', oneYearAgo.toISOString());

        if (historyError) throw historyError;

        // Generate the last 12 months for the X-axis
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          months.push({
            label: d.toLocaleString('default', { month: 'short' }),
            year: d.getFullYear(),
            monthNum: d.getMonth(),
            activeUsers: new Set()
          });
        }

        if (historyData && historyData.length > 0) {
          historyData.forEach(log => {
            const date = new Date(log.completed_at);
            const targetMonth = months.find(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
            if (targetMonth) {
              targetMonth.activeUsers.add(log.user_id);
            }
          });
        }

        let formattedChartData = months.map(m => ({
          month: m.label,
          users: m.activeUsers.size
        }));

        // Strict Reality: No fake math padding.
        
        const targetBenchmark = Math.round(totalStudents * 0.8);
        const activeRate = totalStudents > 0 ? ((currentActive / totalStudents) * 100).toFixed(1) : 0;
        const activeVariance = currentActive - targetBenchmark;

        setMetrics({
          total: totalStudents,
          active: currentActive,
          rate: activeRate,
          target: targetBenchmark,
          variance: activeVariance
        });

        setChartData(formattedChartData);

      } catch (error) {
        console.error("Error fetching MAU data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMAUData();
  }, []);

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING MAU DATA...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-mau-report" className="mau-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
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
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte de Engagement Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      {/* Header & KPIs */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 gap-4" style={{ borderBottomWidth: '1px' }}>
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
            Usuarios Activos Mensuales
          </h3>
          <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
            Tendencia de Engagement (12 Meses)
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">MAU Actual</p>
            <p className="text-2xl font-black text-blue-400">{metrics.active.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tasa Activa</p>
            <p className={`text-2xl font-black ${metrics.variance >= 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {metrics.rate}%
            </p>
          </div>
        </div>
      </div>

      {/* 12-Month Trend Line Chart */}
      <div className="w-full h-72 mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
            
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }}
              domain={[0, 'dataMax + 50']} 
            />
            
            <Tooltip 
              wrapperClassName="hide-on-print" 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontWeight: 'bold', color: '#3b82f6' }}
            />
            
            {/* 80% Benchmark Reference Line */}
            <ReferenceLine 
              y={metrics.target} 
              stroke="#eab308" 
              strokeDasharray="4 4" 
              label={{ 
                position: 'top', 
                value: `Meta 80% (${metrics.target})`, 
                fill: '#eab308', 
                fontSize: 12, 
                fontWeight: 'bold' 
              }} 
            />

            <Line 
              type="monotone" 
              dataKey="users" 
              name="Usuarios Activos" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} 
              activeDot={{ r: 6 }} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (metrics.total === 0) return <p>No hay datos suficientes para generar un reporte de retención. Actualmente no hay estudiantes matriculados en la base de datos.</p>;
            
            const rate = parseFloat(metrics.rate);
            const varianceAbs = Math.abs(metrics.variance);
            let estado = "CRÍTICO";
            let colorClass = "text-red-400";
            let estrategia = "Riesgo extremo de deserción ('Churn'). Gran parte de la base de estudiantes está pagando pero no consumiendo sus clases. Ejecutar protocolo de reactivación urgente: Contactar uno a uno y ofrecer sesiones de onboarding de recuperación.";
            
            if (rate >= 80) {
              estado = "ÓPTIMO";
              colorClass = "text-emerald-400";
              estrategia = "La retención de la plataforma es excelente, superando el benchmark del 80%. Los estudiantes están comprometidos. Se recomienda mantener la estrategia actual de notificaciones y seguimiento continuo.";
            } else if (rate >= 60) {
              estado = "INTERMEDIO";
              colorClass = "text-yellow-400";
              estrategia = "Alerta temprana de desvinculación. Un segmento importante no está tomando clases activamente. Activar campaña automatizada de correos de re-engagement ('Te extrañamos') para reincorporarlos antes de su próximo ciclo de cobro.";
            }

            const statusText = metrics.variance >= 0 
              ? `superando la meta objetivo del 80% por ${varianceAbs} estudiantes`
              : `lo cual nos sitúa ${varianceAbs} estudiantes por debajo de la meta objetivo del 80%`;

            return (
              <p>
                Actualmente, <strong>{metrics.active.toLocaleString()}</strong> de nuestros <strong>{metrics.total.toLocaleString()}</strong> estudiantes matriculados están tomando clases activamente este mes. 
                Esto se traduce en una tasa de actividad del <strong>{metrics.rate}%</strong>, {statusText}, marcando un estado de engagement <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva de Retención:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default MonthlyActiveUsers;