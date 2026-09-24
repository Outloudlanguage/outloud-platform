import React, { useState, useEffect } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { supabase } from '../SupabaseClient';

const PacingScatterPlotModule = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ standard: [], outliers: [] });

  useEffect(() => {
    const fetchPacingData = async () => {
      try {
        setLoading(true);

        // Build the base query
        let query = supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            payments (paid_date, level_billed),
            engine_student_status (is_optimal_pace)
          `)
          .in('role', ['student', 'Student']);

        // Apply dual-mode filter
        if (studentId) {
          query = query.eq('id', studentId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const standard = [];
        const outliers = [];

        // Helper function to add visual jitter to prevent dot overlapping in the SVG
        const jitter = (value, range = 0.35) => Math.max(0, value + (Math.random() - 0.5) * range);

        if (data && data.length > 0) {
          data.forEach(student => {
            if (!student.payments || student.payments.length === 0) return;

            // 1. Calculate Time Enrolled (X-Axis)
            const dates = student.payments
              .map(p => new Date(p.paid_date))
              .filter(d => !isNaN(d));
            
            if (dates.length === 0) return;
            
            const firstBillingDate = new Date(Math.min(...dates));
            const monthsEnrolled = (new Date() - firstBillingDate) / (1000 * 60 * 60 * 24 * 30.44);

            // 2. Calculate Levels Completed (Y-Axis)
            const uniqueLevels = new Set(student.payments.map(p => p.level_billed));
            let levelsCompleted = uniqueLevels.size; 
            
            // 3. Jitter coordinates (less jitter for an individual dot to keep it accurate)
            const plotX = parseFloat(jitter(monthsEnrolled, studentId ? 0 : 0.4).toFixed(2));
            const plotY = parseFloat(jitter(levelsCompleted, studentId ? 0 : 0.4).toFixed(2));
            
            const studentName = `${student.first_name || 'Estudiante'} ${student.last_name || ''}`.trim();

            const dataPoint = { 
              x: plotX, 
              y: plotY, 
              exactMonths: monthsEnrolled, 
              exactLevels: levelsCompleted,
              studentName: studentName,
              studentId: student.id
            };

            // 4. Isolate Outliers (Completed 4 levels in <= 3 months AND above pace)
            const isAbovePace = student.engine_student_status?.[0]?.is_optimal_pace;
            
            if (levelsCompleted >= 4 && monthsEnrolled <= 3 && isAbovePace) {
              outliers.push(dataPoint);
            } else {
              standard.push(dataPoint);
            }
          });
        }

        // Strict Reality: No mock data padding.
        setChartData({ standard, outliers });

      } catch (error) {
        console.error("Error fetching pacing data:", error);
        setChartData({ standard: [], outliers: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchPacingData();
  }, [studentId]); // Re-fire anytime the dual-mode dropdown changes

  // Custom Tooltip to identify the specific student
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl hide-on-print">
          <p className="text-emerald-400 font-black mb-1 uppercase tracking-wider">{data.studentName}</p>
          <div className="text-white text-xs font-medium space-y-1">
            <p>Tiempo Matriculado: <span className="text-slate-300">{data.exactMonths.toFixed(1)} meses</span></p>
            <p>Avance: <span className="text-slate-300">{data.exactLevels} niveles completados</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING PACING DATA...</div>;
  }

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-pacing-report" className="relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-pacing-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-pacing-report, #printable-pacing-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte de Rendimiento Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          {studentId ? "Ritmo Personal de Estudio" : "Desempeño Global y Acelerado"}
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          {studentId ? "Seguimiento de Progreso Individual" : "Casos Atípicos (Outliers)"}
        </p>
      </div>

      <div className="h-72 w-full mb-6" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Meses Matriculado" 
              domain={[0, 12]} 
              tickCount={7}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: '#64748b' }}
              tickLine={{ stroke: '#64748b' }}
            />
            
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Niveles Completados" 
              domain={[0, 4]} 
              tickCount={5}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: '#64748b' }}
              tickLine={{ stroke: '#64748b' }}
            />
            
            {/* ZAxis ensures consistent dot sizing across the SVG */}
            <ZAxis type="number" range={[50, 50]} />
            
            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: '#ffffff40' }} 
              wrapperClassName="hide-on-print"
              content={<CustomScatterTooltip />}
            />
            
            {/* Standard Cohort Progression */}
            <Scatter 
              name={studentId ? "Ritmo de Estudiante" : "Ritmo Estándar"} 
              data={chartData.standard} 
              fill="#64748b" 
              fillOpacity={0.6} 
              isAnimationActive={false} 
            />
            
            {/* Fast-Track Outliers Highlight (Only renders if data exists) */}
            <Scatter 
              name="Casos Acelerados" 
              data={chartData.outliers} 
              fill="#10b981" 
              fillOpacity={0.9} 
              isAnimationActive={false} 
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            const hasData = chartData.standard.length > 0 || chartData.outliers.length > 0;
            if (!hasData) return <p>No se han registrado datos de progresión y pagos suficientes para realizar un análisis de ritmo de aprendizaje.</p>;
            
            if (studentId) {
              const studentData = chartData.outliers.length > 0 ? chartData.outliers[0] : chartData.standard[0];
              if (!studentData) return <p>Faltan datos de facturación o progreso para calcular el ritmo exacto de este estudiante.</p>;
              
              const isOutlier = chartData.outliers.length > 0;
              const estado = isOutlier ? "ACELERADO" : "ESTÁNDAR";
              const colorClass = isOutlier ? "text-emerald-400" : "text-blue-400";
              const estrategia = isOutlier 
                ? "El estudiante avanza a un ritmo excepcional (≥ 4 niveles completados en ≤ 3 meses). Considerar invitarlo al programa intensivo o utilizarlo como caso de éxito en marketing." 
                : "El estudiante mantiene una velocidad de aprendizaje dentro del promedio proyectado. Continuar monitoreando su rendimiento general en clases para asegurar retención a largo plazo.";

              return (
                <p>
                  Este estudiante ha estado matriculado de forma continua durante <strong>{studentData.exactMonths.toFixed(1)} meses</strong> y ha completado un total de <strong>{studentData.exactLevels} niveles</strong>. 
                  Basado en este historial de progresión, su ritmo de aprendizaje actual se clasifica como <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva de Seguimiento:</span>
                  {estrategia}
                </p>
              );
            } else {
              const totalStudents = chartData.standard.length + chartData.outliers.length;
              const outlierCount = chartData.outliers.length;
              const outlierPercent = ((outlierCount / totalStudents) * 100).toFixed(1);
              
              let estado = "NORMAL";
              let colorClass = "text-blue-400";
              let estrategia = "La cohorte de estudiantes en general avanza al ritmo esperado. Mantener las metodologías y ciclos de enseñanza estándar.";
              
              if (outlierPercent >= 10) {
                estado = "ALTO RENDIMIENTO";
                colorClass = "text-emerald-400";
                estrategia = "Existe un porcentaje significativo de estudiantes acelerados. Se recomienda abrir más horarios de niveles avanzados y considerar estrategias de ventas adicionales ('upsells') hacia programas de inmersión.";
              } else if (outlierPercent > 0) {
                estado = "PROMEDIO SÓLIDO";
                colorClass = "text-yellow-400";
                estrategia = "Aparición temprana de estudiantes de alto rendimiento identificada. Monitorear de cerca a estos casos atípicos (puntos verdes) para proveer material estimulante y evitar desgaste por aburrimiento.";
              }

              return (
                <p>
                  De los <strong>{totalStudents}</strong> perfiles activos analizados globalmente, <strong>{outlierCount}</strong> estudiantes ({outlierPercent}%) se clasifican como atípicos acelerados, logrando completar 4 o más niveles en periodos inferiores a 3 meses. 
                  Este volumen indica un comportamiento de progresión global de categoría <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva Académica Global:</span>
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

export default PacingScatterPlotModule;