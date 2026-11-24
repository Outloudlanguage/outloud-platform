import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const TeacherPerformanceRadar = ({ teacherId = 'default-teacher-id' }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [compositeScore, setCompositeScore] = useState(0);

  useEffect(() => {
    const fetchTeacherMetrics = async () => {
      try {
        setLoading(true);

        let punctualityScore = 100;
        let responsibilityScore = 100;
        let socialScore = 100;
        let teachingScore = 100;
        let passRateScore = 100;

        // 1. Fetch Live Sessions for Punctuality, Cancellations, and Social
        const { data: sessions } = await supabase
          .from('live_sessions')
          .select('*')
          .eq('teacher_id', teacherId);

        if (sessions && sessions.length > 0) {
          // A. Punctuality (60 min = 100% with strict deductibles)
          const standardClasses = sessions.filter(
            (s) =>
              s.status === 'completed' &&
              (!s.class_type || !s.class_type.toLowerCase().includes('social'))
          );
          if (standardClasses.length > 0) {
            let totalPunctuality = 0;
            standardClasses.forEach((c) => {
              const sched = new Date(c.scheduled_at);
              const prepStart = c.prep_started_at
                ? new Date(c.prep_started_at)
                : new Date(sched.getTime() - 10 * 60000);
              const actualStart = c.actual_start_at ? new Date(c.actual_start_at) : sched;
              const actualEnd = c.ended_at
                ? new Date(c.ended_at)
                : new Date(sched.getTime() + 45 * 60000);
              const gradedAt = c.graded_at
                ? new Date(c.graded_at)
                : new Date(actualEnd.getTime() + 5 * 60000);

              let classMins = 60;

              // Prep penalty
              const prepDiff = (sched - prepStart) / 60000;
              if (prepDiff < 10) classMins -= 10 - Math.max(0, prepDiff);

              // Live penalty
              const startDelay = (actualStart - sched) / 60000;
              if (startDelay > 0) classMins -= startDelay;
              const endEarly = (new Date(sched.getTime() + 45 * 60000) - actualEnd) / 60000;
              if (endEarly > 0) classMins -= endEarly;

              // Grading penalty (Max 10% deduction = 6 mins)
              const gradeDelay = (gradedAt - actualEnd) / 60000;
              if (gradeDelay > 5) classMins -= Math.min(6, gradeDelay - 5);

              totalPunctuality += Math.max(0, (classMins / 60) * 100);
            });
            punctualityScore = Math.round(totalPunctuality / standardClasses.length);
          }

          // B. Responsibility (Cancelled classes penalty)
          const cancelledCount = sessions.filter(
            (s) => s.status === 'cancelled' && s.cancelled_by === teacherId
          ).length;
          responsibilityScore -= cancelledCount * 15;

          // C. Social Activities (>= 60 mins)
          const socialClasses = sessions.filter(
            (s) => s.class_type && s.class_type.toLowerCase().includes('social')
          );
          if (socialClasses.length > 0) {
            const successfulSocials = socialClasses.filter((s) => {
              if (s.status !== 'completed') return false;
              const start = new Date(s.actual_start_at || s.scheduled_at);
              const end = new Date(s.ended_at || new Date(start.getTime() + 60 * 60000));
              return (end - start) / 60000 >= 55;
            }).length;
            socialScore = Math.round((successfulSocials / socialClasses.length) * 100);
          }
        }

        // 2. Fetch Shifts for Responsibility
        const { data: shifts } = await supabase
          .from('teacher_shifts')
          .select('status')
          .eq('teacher_id', teacherId);
        if (shifts && shifts.length > 0) {
          const missedShifts = shifts.filter((s) => s.status === 'missed').length;
          responsibilityScore -= missedShifts * 10;
        }
        responsibilityScore = Math.max(0, responsibilityScore);

        // 3. Teaching Performance (5-Star Rating converted to %)
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_positive_ratings, total_rating_questions')
          .eq('id', teacherId)
          .single();
        if (profile && profile.total_rating_questions > 0) {
          teachingScore = Math.round(
            (profile.total_positive_ratings / profile.total_rating_questions) * 100
          );
        } else {
          teachingScore = 95;
        }

        // 4. Student Pass Rate
        const { data: supervision } = await supabase
          .from('engine_teacher_supervision')
          .select('teacher_fail_rate')
          .eq('teacher_id', teacherId)
          .single();
        if (supervision && supervision.teacher_fail_rate !== null) {
          passRateScore = Math.round(100 - supervision.teacher_fail_rate * 100);
        } else {
          passRateScore = 92;
        }

        const calculatedComposite = Math.round(
          (punctualityScore + responsibilityScore + teachingScore + passRateScore + socialScore) / 5
        );

        setMetrics([
          { subject: 'Puntualidad', score: punctualityScore, fullMark: 100 },
          { subject: 'Responsabilidad', score: responsibilityScore, fullMark: 100 },
          { subject: 'Pedagogía', score: teachingScore, fullMark: 100 },
          { subject: 'Aprobación', score: passRateScore, fullMark: 100 },
          { subject: 'Eventos Sociales', score: socialScore, fullMark: 100 },
        ]);
        setCompositeScore(calculatedComposite);
      } catch (error) {
        console.error('Error fetching teacher metrics:', error);
        setMetrics([
          { subject: 'Puntualidad', score: 0, fullMark: 100 },
          { subject: 'Responsabilidad', score: 0, fullMark: 100 },
          { subject: 'Pedagogía', score: 0, fullMark: 100 },
          { subject: 'Aprobación', score: 0, fullMark: 100 },
          { subject: 'Eventos Sociales', score: 0, fullMark: 100 },
        ]);
        setCompositeScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherMetrics();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Metrics...
        </span>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const allZero = metrics.every((m) => m.score === 0);
  const statusPill = allZero
    ? { label: 'Sin Datos', cls: 'bg-[#e8eaf7] text-[#454d82] border-transparent' }
    : compositeScore >= 90
    ? { label: 'Excelencia', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
    : compositeScore >= 80
    ? { label: 'Estándar', cls: 'bg-[#e8eaf7] text-[#454d82] border-[#626a9f]/35' }
    : compositeScore >= 60
    ? { label: 'En Riesgo', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
    : { label: 'Deficiente', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' };

  return (
    <div
      id="printable-radar-report"
      className="relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-radar-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-radar-report, #printable-radar-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte de Rendimiento Docente:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e8eaf7] text-[#454d82] px-2.5 py-0.5 rounded-full mb-1.5">
            Evaluación Docente • 5 Ejes
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            Radar de Desempeño
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Disciplina Operativa &amp; Calidad Pedagógica
          </p>
        </div>

        <div className="bg-[#fff8e1] border border-[#ffc749] rounded-2xl px-4 py-2 text-right">
          <p className="text-[9.5px] text-[#454d82] uppercase font-bold tracking-widest">
            Puntuación Global
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] leading-tight">
            {compositeScore}
            <span className="text-sm font-bold text-[#626a9f]"> / 100</span>
          </p>
        </div>
      </div>

      {/* 5-Axis Score Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {metrics.map((m) => (
          <div
            key={m.subject}
            className="bg-[#f4f6fc] border border-white rounded-2xl px-3 py-2 text-center shadow-inner"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#626a9f] block truncate">
              {m.subject}
            </span>
            <span className="text-base font-extrabold text-[#1e2246]">{m.score}%</span>
          </div>
        ))}
      </div>

      {/* Recessed Radar Chart Well */}
      <div className="w-full h-80 sm:h-96 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={metrics}>
            <PolarGrid stroke="rgba(98, 106, 159, 0.24)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#1e2246', fontSize: 12, fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#626a9f', fontSize: 10, fontWeight: 700 }}
              tickCount={6}
            />
            <Radar
              name="Rendimiento (Score)"
              dataKey="score"
              stroke="#454d82"
              strokeWidth={2.5}
              fill="#ffc749"
              fillOpacity={0.55}
              isAnimationActive={false}
            />
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
              formatter={(value) => [`${value}/100`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Directive Footer */}
      <div className="mt-auto bg-[#f9fafe] border border-[#dfe2f2] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#e7faf3] border-2 border-[#1e2246] shadow-[0_2px_0_#1e2246] flex items-center justify-center shrink-0 hide-on-print text-[#128063]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Decisión Administrativa Recomendada
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (allZero) {
              return (
                <p>
                  No hay datos registrados o no se han dictado clases para calcular el rendimiento de este profesor.
                </p>
              );
            }

            let estado = 'DEFICIENTE';
            let colorClass = 'text-[#c93f34]';
            let estrategia =
              'Rendimiento inaceptable. Iniciar protocolo de despido o colocar en periodo de prueba estricto por 15 días con micro-supervisión en todas sus clases.';

            if (compositeScore >= 90) {
              estado = 'EXCELENCIA';
              colorClass = 'text-[#128063]';
              estrategia =
                'Desempeño operativo óptimo. El profesor ejecuta la metodología a la perfección, mantiene asistencia intachable y genera retención. Elegible para bonificación salarial o aumento de tarifa base.';
            } else if (compositeScore >= 80) {
              estado = 'ESTÁNDAR';
              colorClass = 'text-[#454d82]';
              estrategia =
                'Desempeño sólido y confiable. Cumple con los requerimientos operativos básicos de la academia. Identificar el área más baja en el radar y proveer feedback formativo.';
            } else if (compositeScore >= 60) {
              estado = 'EN RIESGO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Rendimiento irregular. Suspender temporalmente la asignación de nuevos estudiantes y agendar reunión disciplinaria para corregir métricas específicas (puntualidad/responsabilidad).';
            }

            return (
              <p>
                Este gráfico evalúa la disciplina operativa y pedagógica del profesor a través de 5 métricas exactas
                (Puntualidad, Responsabilidad, Pedagogía, Tasa de Aprobación y Eventos Sociales). Con una puntuación
                global de <strong className="text-[#1e2246]">{compositeScore}/100</strong>, el perfil laboral se
                clasifica en estado de <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TeacherPerformanceRadar;