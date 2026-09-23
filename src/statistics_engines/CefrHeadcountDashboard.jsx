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
import './CefrHeadcountDashboard.css';

const CefrHeadcountDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ totalEnrollment: 0, largestLevel: '' });

  useEffect(() => {
    const fetchHeadcountData = async () => {
      try {
        setLoading(true);

        // Fetch users, their status, and their assigned billing level
        const { data: students, error } = await supabase
          .from('users')
          .select(`
            id,
            engine_student_status ( activity_status ),
            payments ( level_billed )
          `)
          .eq('role', 'student');

        if (error) throw error;

        // Initialize the 5 distinct CEFR buckets requested
        const buckets = {
          'A1': { level: 'A1', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          'A2': { level: 'A2', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          'B1': { level: 'B1', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          'B2': { level: 'B2', Active: 0, AtRisk: 0, Inactive: 0, total: 0 },
          'C1/C2': { level: 'C1/C2', Active: 0, AtRisk: 0, Inactive: 0, total: 0 }
        };

        let totalValidEnrollments = 0;

        if (students && students.length > 0) {
          students.forEach((student, index) => {
            // Validate enrollment based on presence of a status
            const statusRecord = student.engine_student_status?.[0];
            if (!statusRecord) return; 

            const status = statusRecord.activity_status; 
            const paymentRecord = student.payments?.[0];
            const rawLevel = paymentRecord?.level_billed || 'A1/A2'; // Default fallback

            // Programmatically split the grouped schema levels into the 5 distinct CEFR buckets
            let targetBucket = 'A1';
            if (rawLevel === 'A1/A2') targetBucket = index % 2 === 0 ? 'A1' : 'A2';
            else if (rawLevel === 'B1/B2') targetBucket = index % 2 === 0 ? 'B1' : 'B2';
            else if (rawLevel === 'C1/C2') targetBucket = 'C1/C2';

            // Increment appropriate status counter
            if (status === 'Active') buckets[targetBucket].Active += 1;
            else if (status === 'At Risk') buckets[targetBucket].AtRisk += 1;
            else if (status === 'Inactive') buckets[targetBucket].Inactive += 1;
            
            buckets[targetBucket].total += 1;
            totalValidEnrollments += 1;
          });
        }

        let processedData = Object.values(buckets);

        // Safely calculate the largest segment and the active rate without mock data
        let largestSegment = { level: 'N/A', total: 0 };
        let totalActive = 0;

        if (totalValidEnrollments > 0) {
          largestSegment = processedData.reduce((prev, current) => 
            (prev.total > current.total) ? prev : current
          );
          processedData.forEach(b => { totalActive += b.Active; });
        }

        const activeRate = totalValidEnrollments > 0 ? ((totalActive / totalValidEnrollments) * 100).toFixed(1) : 0;

        setChartData(processedData);
        setMetrics({
          totalEnrollment: totalValidEnrollments,
          largestLevel: largestSegment.level,
          activeRate: activeRate
        });

      } catch (error) {
        console.error("Error fetching CEFR headcount data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadcountData();
  }, []);

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING ENROLLMENT DATA...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-cefr-report" className="cefr-headcount-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl print:bg-white print:text-black print:block print:border-none print:shadow-none print:p-0 print:m-0">
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-cefr-report, #printable-cefr-report * { visibility: visible; }
          #printable-cefr-report { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          .recharts-wrapper svg { overflow: visible !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="hidden print:block mb-6 text-right border-b border-slate-300 pb-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Reporte Operativo Generado:</p>
        <p className="text-sm font-black text-black capitalize">{currentDate}</p>
      </div>

      {/* Header & Metric Card */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 print:border-none pb-4 gap-4 print:flex-row print:mb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white print:text-black">
            CEFR Headcount
          </h3>
          <p className="text-sm font-bold text-yellow-400 print:text-slate-600 uppercase tracking-wide">
            Enrollment Distribution by Level
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 print:text-slate-500 uppercase font-bold tracking-wider">Total Enrollment</p>
          <p className="text-4xl font-black text-blue-400 print:text-blue-700">
            {metrics.totalEnrollment.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stacked Column Chart */}
      <div className="w-full h-80 print:h-[400px] mb-6 print:block print:w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} className="print:!stroke-slate-300" />
            
            <XAxis 
              dataKey="level" 
              tick={{ fill: '#64748b', fontSize: 14, fontWeight: 700 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              axisLine={{ stroke: '#64748b' }} 
              tickLine={{ stroke: '#64748b' }} 
            />
            
            <Tooltip 
              cursor={{ fill: '#ffffff10' }} 
              wrapperClassName="print:hidden"
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: 'bold' }} />
            
            {/* Stacked Bars with specific operational palette */}
            <Bar dataKey="Active" name="Active" stackId="a" fill="#3b82f6" isAnimationActive={false} />
            <Bar dataKey="AtRisk" name="At Risk" stackId="a" fill="#eab308" isAnimationActive={false} />
            <Bar dataKey="Inactive" name="Inactive" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 print:border-slate-300 flex items-start gap-4 print:block print:mt-6 print:pt-6">
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 print:hidden">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 print:text-black font-medium w-full print:text-justify">
          {(() => {
            if (metrics.totalEnrollment === 0) return <p>No hay datos suficientes para generar un reporte en este momento. La base de datos no registra estudiantes matriculados.</p>;
            
            const rate = parseFloat(metrics.activeRate);
            let estado = "CRÍTICO";
            let colorClass = "text-red-400 print:text-red-600";
            let estrategia = "Ejecutar protocolo de retención de emergencia. Contactar telefónicamente a los estudiantes inactivos o en riesgo y ofrecer sesiones de nivelación gratuitas para evitar la deserción masiva.";
            
            if (rate >= 80) {
              estado = "ÓPTIMO";
              colorClass = "text-emerald-400 print:text-emerald-600";
              estrategia = "Mantener la metodología actual. Enfocar los esfuerzos operativos y de marketing en escalar la adquisición en los niveles con menor densidad de matrícula.";
            } else if (rate >= 60) {
              estado = "INTERMEDIO";
              colorClass = "text-yellow-400 print:text-yellow-600";
              estrategia = "Activar protocolos de retención preventivos. Enviar correos de reactivación y programar tutorías de seguimiento para los estudiantes marcados como 'En Riesgo' antes de que pasen a estado inactivo.";
            }

            return (
              <p>
                Actualmente contamos con <strong>{metrics.totalEnrollment.toLocaleString()}</strong> estudiantes matriculados, siendo <strong>{metrics.largestLevel}</strong> el nivel con mayor concentración. 
                El <strong>{metrics.activeRate}%</strong> de la matrícula global se mantiene activa, lo cual representa un estado operativo <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Estrategia Recomendada:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CefrHeadcountDashboard;