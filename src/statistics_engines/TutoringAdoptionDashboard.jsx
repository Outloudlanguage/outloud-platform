import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supabase } from '../SupabaseClient';
import './TutoringAdoptionDashboard.css';

const TutoringAdoptionDashboard = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ bookedCount: 0, unbookedCount: 0, totalActive: 0 });
  const [bookedIds, setBookedIds] = useState([]);

  useEffect(() => {
    const fetchAdoptionData = async () => {
      try {
        setLoading(true);

        // 1. Fetch the total pool of active students
        let activeQuery = supabase
          .from('engine_student_status')
          .select('user_id')
          .eq('activity_status', 'Active');
        
        if (studentId) activeQuery = activeQuery.eq('user_id', studentId);
        
        const { data: activeStudents, error: activeError } = await activeQuery;

        if (activeError) throw activeError;

        // 2. Fetch all booked live classes (Remedial/Support adoption)
        let bookedQuery = supabase
          .from('live_class_attendance')
          .select('student_id')
          .eq('is_booked', true);

        if (studentId) bookedQuery = bookedQuery.eq('student_id', studentId);

        const { data: bookedClasses, error: bookedError } = await bookedQuery;

        if (bookedError) throw bookedError;

        if (activeStudents && activeStudents.length > 0) {
          const totalActive = activeStudents.length;
          
          // Extract unique User IDs of students who booked a class
          const uniqueBookedIds = [...new Set(bookedClasses.map(record => record.student_id))];
          
          // Cross-reference to ensure we only count currently active students
          const activeBookedIds = uniqueBookedIds.filter(id => 
            activeStudents.some(active => active.user_id === id)
          );

          const bookedCount = activeBookedIds.length;
          const unbookedCount = totalActive - bookedCount;

          setMetrics({ bookedCount, unbookedCount, totalActive });
          setBookedIds(activeBookedIds);
        }
        // Strict Reality: No mock data padding.
      } catch (error) {
        console.error("Error fetching tutoring adoption data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionData();
  }, [studentId]); // Re-fire anytime the dual-mode dropdown changes

  if (loading) return <div className="p-4 md:p-8 text-white/50 text-center font-bold tracking-widest">LOADING ADOPTION DATA...</div>;

  const chartData = [
    { name: 'Tutorías Asignadas', value: metrics.bookedCount, color: '#eab308' },
    { name: 'Dominio Regular', value: metrics.unbookedCount, color: '#3b82f6' }
  ];

  const bookedPercentage = metrics.totalActive > 0 
    ? ((metrics.bookedCount / metrics.totalActive) * 100).toFixed(1) 
    : 0;
  
  const unbookedPercentage = metrics.totalActive > 0 
    ? ((metrics.unbookedCount / metrics.totalActive) * 100).toFixed(1) 
    : 0;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-adoption-report" className="tutoring-adoption-card relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-adoption-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-adoption-report, #printable-adoption-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
          .custom-scrollbar { overflow: visible !important; height: auto !important; max-height: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte Operativo Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
          {studentId ? "Perfil Personal de Tutorías" : "Adopción de Tutorías"}
        </h3>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
          {studentId ? "Estado Individual de Reservas" : "Ratio de Demanda de Recuperación (1-a-1)"}
        </p>
      </div>

      {/* Grid Layout: Chart (Left) + Data Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        
        {/* Left Side: SVG Donut Chart */}
        <div className="flex flex-col items-center justify-center h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={false} // Required for instant print-engine rendering
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                wrapperClassName="hide-on-print"
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: 'bold', fontSize: '14px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side: Clean Data Table of User IDs */}
        <div className="flex flex-col bg-black/20 border border-white/5 rounded-xl overflow-hidden h-64 custom-scrollbar">
          <div className="bg-black/40 px-4 py-2 border-b border-white/5" style={{ borderBottomWidth: '1px' }}>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {studentId ? "Registro de Reserva" : `Nómina de Tutorías (${metrics.bookedCount})`}
            </h4>
          </div>
          {/* Constrained scroll area to protect dashboard layout; expands gracefully in standard view */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            <ul className="grid grid-cols-1 gap-2">
              {bookedIds.length > 0 ? (
                bookedIds.map((id, index) => (
                  <li key={index} className="text-xs font-mono text-slate-300 bg-white/5 px-3 py-1.5 rounded-md border border-white/5 truncate" style={{ borderWidth: '1px' }}>
                    {id}
                  </li>
                ))
              ) : (
                <li className="text-sm font-semibold text-slate-500 italic text-center mt-4">
                  No se registraron tutorías.
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (metrics.totalActive === 0) return <p>No existen datos suficientes para generar un reporte de adopción. Actualmente no hay estudiantes activos registrados.</p>;

            let estado = "CRÍTICO";
            let colorClass = "text-red-400";
            let estrategia = "";

            if (studentId) {
              if (metrics.bookedCount > 0) {
                estado = "EN TUTORÍA";
                colorClass = "text-yellow-400";
                estrategia = "El estudiante ha solicitado activamente apoyo remedial 1-a-1 fuera de su flujo regular de dominio. Monitorear su desempeño en la próxima evaluación para verificar la efectividad de la sesión.";
              } else {
                estado = "AUTÓNOMO";
                colorClass = "text-emerald-400";
                estrategia = "El estudiante está manteniendo un dominio regular y avanzando en el currículo sin requerir la reserva de soporte remedial adicional. Mantener el seguimiento estándar.";
              }

              return (
                <p>
                  El historial operativo indica que la adopción de tutorías de este estudiante se clasifica como <strong className={colorClass}>{estado}</strong>.
                  <br/><br/>
                  <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Directiva Académica:</span>
                  {estrategia}
                </p>
              );
            } else {
              const bookedRate = parseFloat(bookedPercentage);
              
              if (bookedRate >= 30) {
                estado = "SOBRECARGA OPERATIVA";
                colorClass = "text-red-400";
                estrategia = "Alta dependencia del sistema de soporte. Revisar inmediatamente la claridad del material asíncrono y abrir más bloques horarios para profesores de apoyo antes de que se genere un cuello de botella.";
              } else if (bookedRate >= 15) {
                estado = "DEMANDA SOSTENIDA";
                colorClass = "text-yellow-400";
                estrategia = "Adopción de tutorías dentro de márgenes aceptables pero en zona de precaución. Mantener a los profesores de guardia notificados y vigilar la capacidad de reservas disponibles.";
              } else {
                estado = "DOMINIO ÓPTIMO";
                colorClass = "text-emerald-400";
                estrategia = "El ecosistema fluye de manera autónoma. La mayoría de los estudiantes está absorbiendo el contenido en sus clases regulares sin saturar el sistema de tutorías 1-a-1.";
              }

              return (
                <p>
                  De los <strong>{metrics.totalActive}</strong> estudiantes activos este mes, el <strong>{bookedPercentage}%</strong> requirió reservar soporte remedial extra (1-a-1), mientras que el <strong>{unbookedPercentage}%</strong> restante logró dominar el material directamente en sus clases regulares.
                  Esto sitúa nuestra capacidad operativa en estado de <strong className={colorClass}>{estado}</strong>.
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

export default TutoringAdoptionDashboard;