import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

const RemedialMatrix = ({ studentId }) => {
  const [metrics, setMetrics] = useState({
    needsHelp: { value: 0, percentage: 0, label: 'Calificaciones < 75% (Riesgo)' },
    liveFails: { value: 0, percentage: 0, label: 'Clases en Vivo Reprobadas' },
    asyncFails: { value: 0, percentage: 0, label: 'Asignaciones Reprobadas' },
    helpRequests: { rawCount: 0, percentage: 0, label: 'Solicitudes de Tutoría' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Async Progress (Grades < 75% and Fails)
        let asyncQuery = supabase.from('student_lesson_progress').select('total_score, failed');
        if (studentId) asyncQuery = asyncQuery.eq('user_id', studentId);
        const { data: asyncProgress } = await asyncQuery;

        // 2. Fetch Live Class Attendance (Pass/Fail rates)
        let liveQuery = supabase.from('live_class_attendance').select('failed').eq('attended', true);
        if (studentId) liveQuery = liveQuery.eq('user_id', studentId);
        const { data: liveClasses } = await liveQuery;

        // 3. Fetch Help Requests
        let helpQuery = supabase.from('help_requests').select('*', { count: 'exact', head: true });
        if (studentId) helpQuery = helpQuery.eq('user_id', studentId);
        const { count: helpCount } = await helpQuery;

        let needsHelpCount = 0;
        let asyncFailCount = 0;
        const totalAsync = asyncProgress?.length || 0;

        let liveFailCount = 0;
        const totalLive = liveClasses?.length || 0;
        const finalHelpCount = helpCount || 0;

        if (asyncProgress && asyncProgress.length > 0) {
          asyncProgress.forEach((lesson) => {
            if (lesson.total_score < 75) needsHelpCount++;
            if (lesson.failed) asyncFailCount++;
          });
        }

        if (liveClasses && liveClasses.length > 0) {
          liveFailCount = liveClasses.filter((c) => c.failed).length;
        }

        const safeTotalAsync = totalAsync || 1;
        const safeTotalLive = totalLive || 1;

        setMetrics({
          needsHelp: {
            value: needsHelpCount,
            percentage: Math.min(Number(((needsHelpCount / safeTotalAsync) * 100).toFixed(1)), 100),
            label: 'Calificaciones < 75% (Riesgo)',
          },
          liveFails: {
            value: liveFailCount,
            percentage: Math.min(Number(((liveFailCount / safeTotalLive) * 100).toFixed(1)), 100),
            label: 'Clases en Vivo Reprobadas',
          },
          asyncFails: {
            value: asyncFailCount,
            percentage: Math.min(Number(((asyncFailCount / safeTotalAsync) * 100).toFixed(1)), 100),
            label: 'Asignaciones Reprobadas',
          },
          helpRequests: {
            rawCount: finalHelpCount,
            percentage: Math.min(Number(((finalHelpCount / (studentId ? 5 : 50)) * 100).toFixed(1)), 100),
            label: 'Solicitudes de Tutoría',
          },
        });
      } catch (error) {
        console.error('Error fetching remedial matrix data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Matrix...
        </span>
      </div>
    );
  }

  const dataArray = [
    {
      ...metrics.needsHelp,
      color: '#ffc749',
      stroke: '#1e2246',
      iconColor: '#b37a00',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      ...metrics.liveFails,
      color: '#ee665b',
      stroke: 'none',
      iconColor: '#c93f34',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    },
    {
      ...metrics.asyncFails,
      color: '#5b64a0',
      stroke: 'none',
      iconColor: '#454d82',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    {
      ...metrics.helpRequests,
      color: '#16a37f',
      stroke: 'none',
      iconColor: '#128063',
      icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasData =
    metrics.needsHelp.value > 0 ||
    metrics.liveFails.value > 0 ||
    metrics.asyncFails.value > 0 ||
    metrics.helpRequests.rawCount > 0;
  const avgFailRate = (Number(metrics.liveFails.percentage) + Number(metrics.asyncFails.percentage)) / 2;
  const helpCount = metrics.helpRequests.rawCount;

  const isElevated = studentId
    ? avgFailRate > 15 || helpCount >= 2
    : avgFailRate > 15 || helpCount > 20;

  const statusPill = !hasData
    ? { label: 'Sin Fricción', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
    : isElevated
    ? { label: studentId ? 'En Riesgo' : 'Sobrecarga', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' }
    : { label: studentId ? 'Estable' : 'Óptima', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' };

  return (
    <div
      id="printable-matrix-report"
      className="relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-matrix-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-matrix-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          #printable-matrix-report text { fill: black !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
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
            {studentId ? 'Riesgo Individual' : 'Intervención Remedial'}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            {studentId ? 'Perfil de Recuperación Personal' : 'Matriz Operativa de Tutorías'}
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            {studentId ? 'Indicadores de Riesgo Estudiantil' : 'Métricas Globales de Intervención'}
          </p>
        </div>

        <div className="bg-[#f4f6fc] border border-white rounded-2xl px-4 py-2 text-right shadow-inner">
          <p className="text-[9.5px] text-[#626a9f] uppercase font-bold tracking-widest">Fallo Promedio</p>
          <p className={`text-2xl sm:text-3xl font-extrabold leading-tight ${isElevated ? 'text-[#c93f34]' : 'text-[#128063]'}`}>
            {avgFailRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Recessed SVG Matrix Well */}
      <div className="w-full mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-4 sm:p-5 shadow-inner">
        <svg viewBox="0 0 820 310" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {dataArray.map((item, index) => {
            const yOffset = index * 74 + 10;
            const barWidth = (Number(item.percentage) / 100) * 410;

            return (
              <g key={index} transform={`translate(8, ${yOffset})`}>
                <rect x="0" y="6" width="34" height="34" rx="10" fill="#ffffff" stroke="#dfe2f2" strokeWidth="1.5" />
                <path
                  d={item.icon}
                  fill="none"
                  stroke={item.iconColor}
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(5, 11)"
                />

                <text x="46" y="28" fill="#1e2246" fontSize="13.5" fontWeight="700">
                  {item.label}
                </text>

                <rect x="285" y="11" width="410" height="24" rx="12" fill="#e4e7f5" />

                <rect
                  x="285"
                  y="11"
                  width={Math.max(barWidth, 14)}
                  height="24"
                  rx="12"
                  fill={item.color}
                  stroke={item.stroke}
                  strokeWidth={item.stroke !== 'none' ? 1.5 : 0}
                />

                <text x="708" y="28" fill="#454d82" fontSize="13.5" fontWeight="800">
                  {item.rawCount !== undefined ? `${item.rawCount} Total` : `${item.percentage}%`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Narrative Directive Footer */}
      <div className="mt-auto bg-[#f9fafe] border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#fff3d1] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] flex items-center justify-center shrink-0 hide-on-print text-[#1e2246]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              {studentId ? 'Directiva Académica' : 'Estrategia Operativa'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (!hasData) {
              return (
                <p>
                  No se han registrado fallos, calificaciones de riesgo o solicitudes de tutoría en el periodo actual. El rendimiento es excepcionalmente fluido.
                </p>
              );
            }

            if (studentId) {
              const estado = isElevated ? 'EN RIESGO' : 'ESTABLE';
              const colorClass = isElevated ? 'text-[#c93f34]' : 'text-[#128063]';
              const estrategia = isElevated
                ? 'Intervención prioritaria requerida. Las altas tasas de reprobación combinadas con solicitudes de ayuda directas indican frustración activa. Programar una sesión de tutoría 1-a-1 de recuperación inmediatamente para evitar la deserción (churn).'
                : 'La progresión de este estudiante es saludable. Sus tasas de reprobación y solicitudes de asistencia se mantienen dentro de los parámetros esperados de autonomía.';

              return (
                <p>
                  El sistema detecta una tasa de fallo combinada del{' '}
                  <strong className="text-[#1e2246]">{avgFailRate.toFixed(1)}%</strong> y{' '}
                  <strong className="text-[#1e2246]">{helpCount}</strong> solicitudes formales de ayuda. El estado de
                  asimilación de este estudiante se clasifica como <strong className={colorClass}>{estado}</strong>.{' '}
                  {estrategia}
                </p>
              );
            }

            const estado = isElevated ? 'CUELLO DE BOTELLA OPERATIVO' : 'CAPACIDAD ÓPTIMA';
            const colorClass = isElevated ? 'text-[#c93f34]' : 'text-[#128063]';
            const estrategia = isElevated
              ? 'La demanda de intervenciones de recuperación está superando el flujo estándar. Un segmento significativo de la cohorte está reprobando o solicitando asistencia. Abrir nuevos bloques horarios de tutoría 1-a-1 esta semana para descongestionar el sistema.'
              : 'La cohorte avanza fluidamente. El volumen actual de estudiantes en riesgo de rezago es mínimo y las solicitudes de tutoría pueden ser absorbidas sin estrés operativo para el equipo docente.';

            return (
              <p>
                El ecosistema académico global muestra una tasa promedio de reprobación del{' '}
                <strong className="text-[#1e2246]">{avgFailRate.toFixed(1)}%</strong> y{' '}
                <strong className="text-[#1e2246]">{helpCount}</strong> tickets abiertos de asistencia. La carga actual
                del sistema de tutorías remediales se clasifica en <strong className={colorClass}>{estado}</strong>.{' '}
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default RemedialMatrix;