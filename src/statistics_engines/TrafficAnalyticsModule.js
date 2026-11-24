import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

const calculateConversion = (visits, lessons) => {
  if (!visits) return '0.0';
  return ((lessons / visits) * 100).toFixed(1);
};

const TrafficMetricCard = ({ title, data, accentClass }) => {
  const rate = parseFloat(calculateConversion(data.visits, data.lessons));
  const isStrong = rate >= 10;

  return (
    <div
      className={`rounded-3xl p-5 flex flex-col border-2 border-white shadow-sm hover:-translate-y-0.5 transition-all break-inside-avoid ${accentClass}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#626a9f]/15 pb-2.5 mb-4">
        <h3 className="text-[#454d82] font-extrabold text-[10.5px] uppercase tracking-widest">
          {title}
        </h3>
        <span className="w-2 h-2 rounded-full bg-[#ffc749] border border-[#1e2246]" />
      </div>

      <div className="flex justify-between items-end gap-3 mb-4">
        <div>
          <span className="block text-[9.5px] text-[#626a9f] uppercase tracking-wider font-bold mb-1">
            Visitas Web
          </span>
          <span className="text-3xl font-extrabold text-[#1e2246] leading-none">
            {data.visits.toLocaleString()}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[9.5px] text-[#128063] uppercase tracking-wider font-bold mb-1">
            Clases Prueba
          </span>
          <span className="text-3xl font-extrabold text-[#128063] leading-none">
            {data.lessons.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-[#626a9f]/15 flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#626a9f]">
          Conversión
        </span>
        <span
          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
            isStrong
              ? 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40'
              : 'bg-white text-[#1e2246] border-[#dfe2f2]'
          }`}
        >
          {rate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

const TrafficAnalyticsModule = () => {
  const [stats, setStats] = useState({
    today: { visits: 0, lessons: 0 },
    week: { visits: 0, lessons: 0 },
    month: { visits: 0, lessons: 0 },
    year: { visits: 0, lessons: 0 },
    total: { visits: 0, lessons: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_analytics')
        .select('event_type, created_at');

      if (!error && data) {
        const now = new Date();
        const todayStr = now.toDateString();

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newStats = {
          today: { visits: 0, lessons: 0 },
          week: { visits: 0, lessons: 0 },
          month: { visits: 0, lessons: 0 },
          year: { visits: 0, lessons: 0 },
          total: { visits: 0, lessons: 0 },
        };

        data.forEach((row) => {
          const date = new Date(row.created_at);
          const isVisit = row.event_type === 'site_visit';
          const typeKey = isVisit ? 'visits' : 'lessons';

          newStats.total[typeKey]++;
          if (date.toDateString() === todayStr) newStats.today[typeKey]++;
          if (date >= startOfWeek) newStats.week[typeKey]++;
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            newStats.month[typeKey]++;
          }
          if (date.getFullYear() === currentYear) newStats.year[typeKey]++;
        });

        setStats(newStats);
      }
      setIsLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Analizando Tráfico Web...
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

  const monthRate = parseFloat(calculateConversion(stats.month.visits, stats.month.lessons));
  const statusPill =
    stats.month.visits === 0
      ? { label: 'Sin Tráfico', cls: 'bg-[#e8eaf7] text-[#454d82] border-transparent' }
      : monthRate >= 10
      ? { label: 'Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
      : monthRate >= 4
      ? { label: 'Intermedio', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
      : { label: 'Crítico', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' };

  return (
    <div
      id="printable-traffic-report"
      className="relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-traffic-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-traffic-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte de Tráfico Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#e7faf3] text-[#128063] px-2.5 py-0.5 rounded-full mb-1.5">
            Live Web Analytics
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1e2246] uppercase tracking-tight">
            Adquisición y Tráfico
          </h2>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Métricas de Conversión Web en Tiempo Real
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#fff9e8] to-[#ffe69e] border-2 border-[#ffc749] rounded-2xl px-4 py-2 text-right shadow-sm">
          <p className="text-[9.5px] font-bold uppercase text-[#454d82] tracking-widest">
            Visitas Históricas Totales
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] leading-tight">
            {stats.total.visits.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 4-Window Metric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <TrafficMetricCard
          title="Hoy (Últimas 24h)"
          data={stats.today}
          accentClass="bg-gradient-to-br from-[#fff9e8] to-[#fff1c7]"
        />
        <TrafficMetricCard
          title="Esta Semana"
          data={stats.week}
          accentClass="bg-[#f4f6fc]"
        />
        <TrafficMetricCard
          title="Este Mes"
          data={stats.month}
          accentClass="bg-[#eef1fb]"
        />
        <TrafficMetricCard
          title="Este Año"
          data={stats.year}
          accentClass="bg-gradient-to-br from-[#edfbf6] to-[#ddf5ec]"
        />
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
            <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Estrategia Comercial Recomendada
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (stats.month.visits === 0) {
              return (
                <p>
                  No se ha registrado tráfico web en el mes en curso. Verifique la conexión con el servidor analítico o la instalación de los píxeles de seguimiento.
                </p>
              );
            }

            let estado = 'CRÍTICO';
            let colorClass = 'text-[#c93f34]';
            let estrategia =
              'Severa deficiencia en conversión superior. El tráfico está llegando pero rebotando sin agendar clases de prueba. Detener pauta publicitaria y revisar inmediatamente el diseño de la Landing Page, la oferta principal (CTA) y verificar que el formulario no esté roto.';

            if (monthRate >= 10) {
              estado = 'ÓPTIMO';
              colorClass = 'text-[#128063]';
              estrategia =
                'Conversión de tráfico altamente efectiva. El mensaje resuena perfectamente con la audiencia objetivo. Proceder a escalar gradualmente el presupuesto publicitario manteniendo los mismos parámetros de segmentación demográfica.';
            } else if (monthRate >= 4) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Rendimiento publicitario promedio. La página convierte pero genera fricción. Implementar pruebas A/B en los textos de venta y colores de los botones para destrabar y optimizar la captación de clases de prueba.';
            }

            return (
              <p>
                Durante este mes, la plataforma ha recibido{' '}
                <strong className="text-[#1e2246]">{stats.month.visits.toLocaleString()} visitas web</strong>, logrando
                concretar{' '}
                <strong className="text-[#1e2246]">{stats.month.lessons.toLocaleString()} agendamientos de clases de prueba</strong>.
                Esto resulta en una tasa de conversión superior del{' '}
                <strong className="text-[#1e2246]">{monthRate}%</strong>, clasificando el rendimiento de adquisición
                mensual en estado <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalyticsModule;