import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const TutoringAdoptionDashboard = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ bookedCount: 0, unbookedCount: 0, totalActive: 0 });
  const [bookedIds, setBookedIds] = useState([]);

  useEffect(() => {
    const fetchAdoptionData = async () => {
      try {
        setLoading(true);

        // 1. Fetch active student pool
        let activeQuery = supabase
          .from('engine_student_status')
          .select('user_id')
          .eq('activity_status', 'Active');

        if (studentId) activeQuery = activeQuery.eq('user_id', studentId);

        const { data: activeStudents, error: activeError } = await activeQuery;
        if (activeError) throw activeError;

        // 2. Fetch booked live classes
        let bookedQuery = supabase
          .from('live_class_attendance')
          .select('student_id')
          .eq('is_booked', true);

        if (studentId) bookedQuery = bookedQuery.eq('student_id', studentId);

        const { data: bookedClasses, error: bookedError } = await bookedQuery;
        if (bookedError) throw bookedError;

        if (activeStudents && activeStudents.length > 0) {
          const totalActive = activeStudents.length;
          const uniqueBookedIds = [...new Set((bookedClasses || []).map((record) => record.student_id))];
          const activeBookedIds = uniqueBookedIds.filter((id) =>
            activeStudents.some((active) => active.user_id === id)
          );

          const bookedCount = activeBookedIds.length;
          const unbookedCount = totalActive - bookedCount;

          setMetrics({ bookedCount, unbookedCount, totalActive });
          setBookedIds(activeBookedIds);
        } else {
          setMetrics({ bookedCount: 0, unbookedCount: 0, totalActive: 0 });
          setBookedIds([]);
        }
      } catch (error) {
        console.error('Error fetching tutoring adoption data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Adoption Data...
        </span>
      </div>
    );
  }

  const chartData = [
    { name: 'Tutorías Asignadas', value: metrics.bookedCount, color: '#ffc749', stroke: '#1e2246' },
    { name: 'Dominio Regular', value: metrics.unbookedCount, color: '#5b64a0', stroke: '#ffffff' },
  ];

  const bookedPercentage =
    metrics.totalActive > 0 ? ((metrics.bookedCount / metrics.totalActive) * 100).toFixed(1) : 0;
  const unbookedPercentage =
    metrics.totalActive > 0 ? ((metrics.unbookedCount / metrics.totalActive) * 100).toFixed(1) : 0;

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const bookedRate = parseFloat(bookedPercentage);
  const statusPill =
    metrics.totalActive === 0
      ? { label: 'Sin Datos', cls: 'bg-[#e8eaf7] text-[#454d82] border-transparent' }
      : studentId
      ? metrics.bookedCount > 0
        ? { label: 'En Tutoría', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
        : { label: 'Autónomo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
      : bookedRate >= 30
      ? { label: 'Sobrecarga', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' }
      : bookedRate >= 15
      ? { label: 'Demanda Sostenida', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
      : { label: 'Dominio Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' };

  return (
    <div
      id="printable-adoption-report"
      className="tutoring-adoption-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
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
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte Operativo Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
            Soporte Remedial • 1-a-1
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            {studentId ? 'Perfil Personal de Tutorías' : 'Adopción de Tutorías'}
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            {studentId ? 'Estado Individual de Reservas' : 'Ratio de Demanda de Recuperación'}
          </p>
        </div>

        <div className="bg-[#fff8e1] border border-[#ffc749] rounded-2xl px-4 py-2 text-right">
          <p className="text-[9.5px] text-[#454d82] uppercase font-bold tracking-widest">Adopción</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] leading-tight">
            {bookedPercentage}%
          </p>
        </div>
      </div>

      {/* Grid Layout: Donut Chart (Left) + Roster Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Left: Recessed Donut Chart Well */}
        <div className="flex flex-col items-center justify-center h-64 bg-[#f4f6fc] border border-white rounded-3xl p-3 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="80%"
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.stroke}
                    strokeWidth={1.5}
                  />
                ))}
              </Pie>
              <Tooltip
                wrapperClassName="hide-on-print"
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #1e2246',
                  borderRadius: '16px',
                  color: '#1e2246',
                  fontWeight: 700,
                  fontSize: '12px',
                  boxShadow: '0 6px 0 rgba(30,34,70,0.1)',
                }}
                itemStyle={{ fontWeight: 700 }}
              />
              <Legend
                verticalAlign="bottom"
                height={34}
                wrapperStyle={{ fontWeight: 700, fontSize: '12px', color: '#1e2246' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Clean Roster Card */}
        <div className="flex flex-col bg-[#f4f6fc] border border-white rounded-3xl overflow-hidden h-64 shadow-inner">
          <div className="bg-white/85 px-4 py-3 border-b border-[#dfe2f2] flex items-center justify-between">
            <h4 className="text-[10.5px] font-extrabold text-[#454d82] tracking-widest uppercase">
              {studentId ? 'Registro de Reserva' : 'Nómina de Tutorías'}
            </h4>
            <span className="text-[10px] font-extrabold bg-[#1e2246] text-[#ffc749] px-2.5 py-0.5 rounded-full">
              {metrics.bookedCount}
            </span>
          </div>

          <div className="p-3.5 overflow-y-auto flex-1 custom-scrollbar">
            <ul className="grid grid-cols-1 gap-2">
              {bookedIds.length > 0 ? (
                bookedIds.map((id, index) => (
                  <li
                    key={index}
                    className="text-xs font-mono font-semibold text-[#1e2246] bg-white px-3.5 py-2 rounded-xl border border-[#dfe2f2] truncate shadow-sm"
                  >
                    {id}
                  </li>
                ))
              ) : (
                <li className="text-xs font-bold uppercase tracking-wider text-[#626a9f] text-center py-12">
                  No se registraron tutorías.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Narrative Directive Footer */}
      <div className="mt-auto bg-[#f9fafe] border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#e8eaf7] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] flex items-center justify-center shrink-0 hide-on-print text-[#1e2246]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              {studentId ? 'Directiva Académica' : 'Estrategia Operativa Global'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (metrics.totalActive === 0) {
              return (
                <p>
                  No existen datos suficientes para generar un reporte de adopción. Actualmente no hay estudiantes activos registrados.
                </p>
              );
            }

            if (studentId) {
              const isBooked = metrics.bookedCount > 0;
              const estado = isBooked ? 'EN TUTORÍA' : 'AUTÓNOMO';
              const colorClass = isBooked ? 'text-[#b37a00]' : 'text-[#128063]';
              const estrategia = isBooked
                ? 'El estudiante ha solicitado activamente apoyo remedial 1-a-1 fuera de su flujo regular de dominio. Monitorear su desempeño en la próxima evaluación para verificar la efectividad de la sesión.'
                : 'El estudiante está manteniendo un dominio regular y avanzando en el currículo sin requerir la reserva de soporte remedial adicional. Mantener el seguimiento estándar.';

              return (
                <p>
                  El historial operativo indica que la adopción de tutorías de este estudiante se clasifica como{' '}
                  <strong className={colorClass}>{estado}</strong>. {estrategia}
                </p>
              );
            }

            let estado = 'DOMINIO ÓPTIMO';
            let colorClass = 'text-[#128063]';
            let estrategia =
              'El ecosistema fluye de manera autónoma. La mayoría de los estudiantes está absorbiendo el contenido en sus clases regulares sin saturar el sistema de tutorías 1-a-1.';

            if (bookedRate >= 30) {
              estado = 'SOBRECARGA OPERATIVA';
              colorClass = 'text-[#c93f34]';
              estrategia =
                'Alta dependencia del sistema de soporte. Revisar inmediatamente la claridad del material asíncrono y abrir más bloques horarios para profesores de apoyo antes de que se genere un cuello de botella.';
            } else if (bookedRate >= 15) {
              estado = 'DEMANDA SOSTENIDA';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Adopción de tutorías dentro de márgenes aceptables pero en zona de precaución. Mantener a los profesores de guardia notificados y vigilar la capacidad de reservas disponibles.';
            }

            return (
              <p>
                De los <strong className="text-[#1e2246]">{metrics.totalActive}</strong> estudiantes activos este mes,
                el <strong className="text-[#1e2246]">{bookedPercentage}%</strong> requirió reservar soporte remedial
                extra (1-a-1), mientras que el{' '}
                <strong className="text-[#1e2246]">{unbookedPercentage}%</strong> restante logró dominar el material
                directamente en sus clases regulares. Esto sitúa nuestra capacidad operativa en estado de{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TutoringAdoptionDashboard;