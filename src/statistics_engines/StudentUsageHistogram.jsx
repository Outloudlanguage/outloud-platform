import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './StudentUsageHistogram.css';

const StudentUsageHistogram = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ mean: 0, meanCategory: '', modalBin: '', modalRange: '' });

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);

        // 1. Fetch active students (Global or Individual)
        let activeQuery = supabase
          .from('engine_student_status')
          .select('user_id')
          .eq('activity_status', 'Active');
          
        if (studentId) {
          activeQuery = activeQuery.eq('user_id', studentId);
        }

        const { data: activeStudents, error: activeError } = await activeQuery;

        if (activeError) throw activeError;

        let timeData = [];
        if (activeStudents && activeStudents.length > 0) {
          const activeIds = activeStudents.map(s => s.user_id);
          
          // 2. Fetch weekly time dedication for those active students
          const { data: times, error: timeError } = await supabase
            .from('engine_time_dedication')
            .select('user_id, mins_this_week')
            .in('user_id', activeIds);

          if (timeError) throw timeError;
          timeData = times;
        }

        // Initialize bins
        const bins = [
          { bin: '0-1h', range: '0 and 1 hours', count: 0 },
          { bin: '1-2h', range: '1 and 2 hours', count: 0 },
          { bin: '2-3h', range: '2 and 3 hours', count: 0 },
          { bin: '3-4h', range: '3 and 4 hours', count: 0 },
          { bin: '4h+',  range: 'over 4 hours', count: 0 }
        ];

        let totalHours = 0;
        let validUsers = 0;

        if (timeData && timeData.length > 0) {
          timeData.forEach(record => {
            const hours = (record.mins_this_week || 0) / 60;
            totalHours += hours;
            validUsers += 1;

            if (hours < 1) bins[0].count += 1;
            else if (hours < 2) bins[1].count += 1;
            else if (hours < 3) bins[2].count += 1;
            else if (hours < 4) bins[3].count += 1;
            else bins[4].count += 1;
          });
        }
        // Strict Reality: No mock data padding.

        const calculatedMean = validUsers > 0 ? (totalHours / validUsers) : 0;
        
        // Find the modal (most frequent) bin for the narrative summary
        const modalBinObj = bins.reduce((prev, current) => (prev.count > current.count) ? prev : current);
        
        // Determine which categorical band the mean falls into to place the ReferenceLine
        let meanBinLabel = '0-1h';
        if (calculatedMean >= 1 && calculatedMean < 2) meanBinLabel = '1-2h';
        if (calculatedMean >= 2 && calculatedMean < 3) meanBinLabel = '2-3h';
        if (calculatedMean >= 3 && calculatedMean < 4) meanBinLabel = '3-4h';
        if (calculatedMean >= 4) meanBinLabel = '4h+';

        setChartData(bins);
        setMetrics({
          mean: calculatedMean.toFixed(1),
          meanCategory: meanBinLabel,
          modalBin: modalBinObj.bin,
          modalRange: modalBinObj.range
        });

      } catch (error) {
        console.error("Error fetching usage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [studentId]); // Re-fire anytime the dual-mode dropdown changes

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING USAGE MATRIX...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-usage-report" className="usage-histogram-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-usage-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-usage-report, #printable-usage-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte de Dedicación Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          {studentId ? "Uso Personal de Plataforma" : "Dedicación Semanal Global"}
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          {studentId ? "Tiempo de Inmersión Individual" : "Distribución de Horas por Estudiante"}
        </p>
      </div>

      <div className="w-full h-72 mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
            
            <XAxis 
              dataKey="bin" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            
            {/* allowDecimals={false} ensures we don't get 0.5 ticks when a single individual is loaded */}
            <YAxis 
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            
            <Tooltip 
              cursor={{ fill: '#ffffff10' }} 
              wrapperClassName="hide-on-print"
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontWeight: 'bold', color: '#eab308' }}
            />
            
            <Bar dataKey="count" name={studentId ? "Estudiante" : "Estudiantes"} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.bin === metrics.modalBin ? '#eab308' : '#3b82f6'} 
                />
              ))}
            </Bar>

            {/* Vertical dashed reference line for the mean */}
            <ReferenceLine 
              x={metrics.meanCategory} 
              stroke="#eab308" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              label={{ 
                position: 'top', 
                value: `Media: ${metrics.mean}h`, 
                fill: '#eab308', 
                fontSize: 12, 
                fontWeight: 'bold' 
              }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            const meanHours = parseFloat(metrics.mean);
            
            if (meanHours === 0) return <p>El estudiante no registra horas de uso en la plataforma esta semana. Seguimiento inmediato requerido.</p>;

            let estado = "CRÍTICO";
            let colorClass = "text-red-400";
            let estrategia = "";

            if (studentId) {
              if (meanHours >= 3) {
                estado = "ÓPTIMO";
                colorClass = "text-emerald-400";
                estrategia = "Excelente nivel de inmersión. El estudiante está cumpliendo con los requisitos de contacto frecuente con el idioma para garantizar retención a largo plazo.";
              } else if (meanHours >= 1.5) {
                estado = "INTERMEDIO";
                colorClass = "text-yellow-400";
                estrategia = "Tiempo de estudio límite. Sugerirle al estudiante dividir sus sesiones en bloques cortos (micro-learning) durante la semana para evitar picos de saturación.";
              } else {
                estrategia = "Alerta de abandono. El tiempo invertido es insuficiente para la adquisición del idioma. Programar intervención telefónica para identificar bloqueos técnicos o de motivación.";
              }

              return (
                <p>
                  Esta semana, el estudiante registró <strong>{metrics.mean} horas</strong> de inmersión en la plataforma, ubicándose en el segmento de <strong>{metrics.meanCategory}</strong>. 
                  Su nivel de dedicación actual se considera <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva de Acompañamiento:</span>
                  {estrategia}
                </p>
              );
            } else {
              if (meanHours >= 2.5) {
                estado = "ÓPTIMO";
                colorClass = "text-emerald-400";
                estrategia = "La base activa presenta un excelente nivel de inmersión global. Mantener dinámicas de gamificación y estructura curricular actuales.";
              } else if (meanHours >= 1.5) {
                estado = "PROMEDIO";
                colorClass = "text-yellow-400";
                estrategia = "Uso estándar pero susceptible a mejora. Enviar boletines o alertas push con micro-desafíos para incentivar entradas más frecuentes a la plataforma web.";
              } else {
                estrategia = "El engagement ha caído drásticamente. Auditar plataforma por posibles caídas de servidor y preparar campaña inmediata de reactivación de usuarios (retargeting).";
              }

              return (
                <p>
                  A nivel global, la cohorte activa dedicó en promedio <strong>{metrics.mean} horas</strong> al aprendizaje esta semana. La distribución indica que la mayor concentración (moda) invirtió entre <strong>{metrics.modalRange}</strong>. 
                  El nivel de inmersión de la academia se encuentra en estado <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Estrategia de Engagement Global:</span>
                  {estrategia}
                </p>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default StudentUsageHistogram;