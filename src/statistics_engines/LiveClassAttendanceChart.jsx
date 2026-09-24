import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './LiveClassAttendanceChart.css';

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
        eightWeeksAgo.setDate(now.getDate() - (8 * 7));

        // Fetch Booked classes from the last 8 weeks.
        // Joining live_classes to get the scheduled_start date for bucketing.
        const { data, error } = await supabase
          .from('live_class_attendance')
          .select('attended, live_classes!inner(scheduled_start)')
          .eq('is_booked', true)
          .gte('live_classes.scheduled_start', eightWeeksAgo.toISOString());

        if (error) throw error;

        let totalBookedAllTime = 0;
        
        // Initialize 8 empty weekly buckets
        const weeklyBuckets = Array.from({ length: 8 }, (_, i) => ({
          week: `Week ${i + 1}`,
          booked: 0,
          attended: 0,
          noShows: 0
        }));

        if (data && data.length > 0) {
          data.forEach(record => {
            const classDate = new Date(record.live_classes.scheduled_start);
            const daysDiff = Math.floor((classDate - eightWeeksAgo) / (1000 * 60 * 60 * 24));
            const bucketIndex = Math.min(Math.floor(daysDiff / 7), 7); // Ensure it stays within 0-7

            weeklyBuckets[bucketIndex].booked += 1;
            if (record.attended) {
              weeklyBuckets[bucketIndex].attended += 1;
            } else {
              weeklyBuckets[bucketIndex].noShows += 1;
            }
            totalBookedAllTime += 1;
          });
        }
        // Strict reality: No mock padding. Buckets remain at 0 if no data exists.

        const currentWeek = weeklyBuckets[7];
        const currentRate = currentWeek.booked > 0 
          ? ((currentWeek.noShows / currentWeek.booked) * 100).toFixed(1) 
          : 0;

        setChartData(weeklyBuckets);
        setSummary({
          totalBooked: totalBookedAllTime,
          currentWeekMissed: currentWeek.noShows,
          currentWeekRate: currentRate
        });

      } catch (error) {
        console.error("Error fetching live class attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Custom tooltip to explicitly highlight the variance gap
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const attended = payload[0].value;
      const noShows = payload[1].value;
      const total = attended + noShows;
      const rate = total > 0 ? ((noShows / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl hide-on-print">
          <p className="text-white font-bold mb-2">{label}</p>
          <p className="text-blue-400 font-semibold">Asistencias: {attended}</p>
          <p className="text-red-400 font-bold">Ausencias: {noShows} ({rate}%)</p>
          <p className="text-slate-400 text-xs mt-2 border-t border-slate-700 pt-1">Total Reservas: {total}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING ATTENDANCE...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-attendance-report" className="live-attendance-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
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
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte Operativo Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          Asistencia a Clases en Vivo
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          Reservas vs Ausentismo (8 Semanas)
        </p>
      </div>

      <div className="w-full h-72 mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
            
            <XAxis 
              dataKey="week" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} wrapperClassName="hide-on-print" />
            
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 'bold' }} />
            
            <Bar 
              dataKey="attended" 
              name="Asistencias Confirmadas" 
              stackId="a" 
              fill="#3b82f6" 
              isAnimationActive={false} 
            />
            
            <Bar 
              dataKey="noShows" 
              name="Ausencias (No-Shows)" 
              stackId="a" 
              fill="#ef4444" 
              isAnimationActive={false} 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (summary.totalBooked === 0) return <p>No se han registrado reservas de clases en el sistema durante las últimas 8 semanas.</p>;
            
            const rate = parseFloat(summary.currentWeekRate);
            let estado = "ÓPTIMO";
            let colorClass = "text-emerald-400";
            let estrategia = "El índice de ausentismo es bajo. Los costos operativos están optimizados y los profesores están maximizando sus bloques horarios facturables.";
            
            if (rate >= 15) {
              estado = "CRÍTICO";
              colorClass = "text-red-400";
              estrategia = "Alta pérdida financiera por horas de profesor pagadas pero no utilizadas. Implementar inmediatamente política de penalización por inasistencia (descuento de sesión) sin previo aviso y activar recordatorios SMS automáticos 2 horas antes de la clase.";
            } else if (rate >= 8) {
              estado = "INTERMEDIO";
              colorClass = "text-yellow-400";
              estrategia = "El ausentismo está impactando levemente el margen de rentabilidad operativa. Reforzar la comunicación de la política de cancelación e incentivar a los estudiantes a usar el botón de reprogramación anticipada en la plataforma.";
            }

            return (
              <p>
                Durante las últimas 8 semanas, se han registrado <strong>{summary.totalBooked.toLocaleString()}</strong> reservas totales de clases en vivo. 
                En la semana en curso, se observa una tasa de ausentismo del <strong>{summary.currentWeekRate}%</strong> ({summary.currentWeekMissed} clases perdidas), marcando un nivel de eficiencia operativa <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva de Rentabilidad:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default LiveClassAttendanceChart;