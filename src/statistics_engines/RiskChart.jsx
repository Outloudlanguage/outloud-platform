import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';
import './RiskChart.css';

const RiskChart = ({ studentId }) => {
  const [data, setData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndCategorizeMetrics = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('student_metrics')
          .select('student_id, grade_average, classes_per_week')
          .eq('status', 'active');

        // Apply dual-mode filter
        if (studentId) {
          query = query.eq('student_id', studentId);
        }

        const { data: metrics, error: dbError } = await query;

        if (dbError) throw dbError;

        let processedData = [];
        let total = 0;

        // Bucket initialization
        const buckets = {
          atRisk: { id: 'atRisk', label: 'En Riesgo', count: 0, color: '#ef4444' },
          needsAttention: { id: 'needsAttention', label: 'Requiere Atención', count: 0, color: '#f59e0b' },
          onTrack: { id: 'onTrack', label: 'Buen Ritmo', count: 0, color: '#3b82f6' },
          highPerforming: { id: 'highPerforming', label: 'Alto Rendimiento', count: 0, color: '#22c55e' }
        };

        if (metrics && metrics.length > 0) {
          total = metrics.length;
          metrics.forEach(student => {
            const grade = student.grade_average;
            const classes = student.classes_per_week;

            if (grade < 75 && classes < 1) {
              buckets.atRisk.count++;
            } else if (grade >= 90 && classes >= 3) {
              buckets.highPerforming.count++;
            } else if (grade >= 80 && grade < 90 && classes >= 2 && classes < 3) {
              buckets.onTrack.count++;
            } else {
              // Catches 75-79% grade OR 1-2 classes/wk logic
              buckets.needsAttention.count++;
            }
          });
        }
        // Strict Reality: No mock data padding.

        processedData = [
          buckets.atRisk,
          buckets.needsAttention,
          buckets.onTrack,
          buckets.highPerforming
        ].map(bucket => ({
          ...bucket,
          percentage: total > 0 ? ((bucket.count / total) * 100).toFixed(1) : 0
        }));

        setData(processedData);
        setTotalStudents(total);
      } catch (err) {
        console.error("Error fetching risk metrics:", err);
        setError("Unable to load performance risk metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndCategorizeMetrics();
  }, [studentId]); // Re-fire anytime the dual-mode dropdown changes

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING RISK MATRIX...</div>;
  if (error) return <div className="p-8 text-red-400 text-center font-bold tracking-widest">{error}</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-risk-report" className="relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-risk-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          
          /* Force SVG Text & elements to be black for printing */
          #printable-risk-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          #printable-risk-report text { fill: black !important; font-weight: bold !important; }
          #printable-risk-report rect.fill-white\\/10 { fill: #f1f5f9 !important; }
          
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte de Riesgo Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          {studentId ? "Evaluación de Riesgo Personal" : "Riesgo de Rendimiento Académico"}
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          {studentId ? "Evaluación de Métricas Individuales" : `Cohorte Activa Total: ${totalStudents.toLocaleString()} Estudiantes`}
        </p>
      </div>

      <div className="w-full h-72 mb-6">
        <svg viewBox="0 0 800 320" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {data.map((item, index) => {
            const rowHeight = 60;
            const yOffset = index * (rowHeight + 20) + 10;
            const barWidth = totalStudents > 0 ? (item.count / totalStudents) * 500 : 0; 
            
            return (
              <g key={item.id} transform={`translate(20, ${yOffset})`}>
                {/* Category Label */}
                <text 
                  x="140" 
                  y="30" 
                  textAnchor="end" 
                  dominantBaseline="middle"
                  className="font-bold fill-white print:fill-slate-900"
                  fontSize="16"
                >
                  {item.label}
                </text>
                
                {/* Background Track */}
                <rect 
                  x="160" 
                  y="10" 
                  width="500" 
                  height="40" 
                  rx="6" 
                  className="fill-white/10 print:fill-slate-100" 
                />
                
                {/* Data Bar */}
                {barWidth > 0 && (
                  <rect 
                    x="160" 
                    y="10" 
                    width={barWidth} 
                    height="40" 
                    rx="6" 
                    fill={item.color} 
                  />
                )}
                
                {/* Absolute Count & Percentage Label */}
                <text 
                  x={175 + barWidth} 
                  y="30" 
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="font-bold fill-slate-300 print:fill-slate-500"
                  fontSize="14"
                >
                  {item.count} ({item.percentage}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (totalStudents === 0) return <p>No hay datos suficientes para calcular las métricas de riesgo en este periodo.</p>;
            
            if (studentId) {
              const studentRisk = data.find(d => d.count > 0)?.id;
              let estado = "ESTABLE";
              let colorClass = "text-emerald-400";
              let estrategia = "El estudiante mantiene un ritmo y promedio óptimos. No se requiere intervención inmediata.";
              
              if (studentRisk === 'atRisk') {
                estado = "EN RIESGO CRÍTICO";
                colorClass = "text-red-400";
                estrategia = "Intervención inmediata requerida. El estudiante presenta un promedio inferior al 75% y asistencia casi nula. Programar contacto directo (llamada) y agendar sesión de nivelación obligatoria para evitar deserción.";
              } else if (studentRisk === 'needsAttention') {
                estado = "REQUIERE ATENCIÓN";
                colorClass = "text-yellow-400";
                estrategia = "El estudiante muestra ligeras caídas en su rendimiento o asistencia. Asignar seguimiento preventivo por parte de su profesor actual para evitar que decaiga al estado de riesgo.";
              } else if (studentRisk === 'highPerforming') {
                estado = "ALTO RENDIMIENTO";
                colorClass = "text-emerald-400";
                estrategia = "Rendimiento sobresaliente. Promedio excelente y asistencia perfecta. Considerar ofrecer oportunidades de avance acelerado o utilizarlo como testimonio de éxito.";
              }

              return (
                <p>
                  Con base en la frecuencia de clases y el promedio de calificaciones, el perfil de este estudiante se clasifica como <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva Académica:</span>
                  {estrategia}
                </p>
              );
            } else {
              const atRiskPercent = parseFloat(data.find(d => d.id === 'atRisk')?.percentage || 0);
              let estado = "SALUDABLE";
              let colorClass = "text-emerald-400";
              let estrategia = "La distribución de riesgo de la academia es óptima. Mantener las metodologías de inmersión actuales y continuar el seguimiento automatizado.";
              
              if (atRiskPercent >= 15) {
                estado = "CRÍTICO";
                colorClass = "text-red-400";
                estrategia = "Alerta de capacidad operativa. Una gran porción de la cohorte está en riesgo inminente de deserción o reprobación. Se exige asistencia obligatoria a sesiones remediales 1-a-1 y auditoría de la claridad del material impartido recientemente.";
              } else if (atRiskPercent >= 8) {
                estado = "INTERMEDIO";
                colorClass = "text-yellow-400";
                estrategia = "Volumen de riesgo moderado. Aumentar la frecuencia de correos de reactivación y asegurar que los profesores identifiquen tempranamente las dudas durante las clases en vivo.";
              }

              return (
                <p>
                  Nuestra academia utiliza una estricta metodología de inmersión total. Actualmente, el <strong>{atRiskPercent}%</strong> de la cohorte activa se encuentra en la categoría roja de riesgo. 
                  Esto representa un estado operativo <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Estrategia Operativa Global:</span>
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

export default RiskChart;