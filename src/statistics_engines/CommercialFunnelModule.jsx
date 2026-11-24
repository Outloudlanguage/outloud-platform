import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { supabase } from '../SupabaseClient';

const CommercialFunnelModule = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({ visitors: 0, leads: 0, conversions: 0, rate: 0 });

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        setLoading(true);

        // 1. Get Site Visitors from site_analytics
        const { count: visitorCount } = await supabase
          .from('site_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('event_type', 'site_visit');

        // 2. Get Pending Leads from Registrations
        const { count: pendingCount } = await supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true });

        // 3. Get Paid Students from Profiles
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'Student');

        const safeVisitors = visitorCount || 0;
        const safePending = pendingCount || 0;
        const safeStudents = studentCount || 0;

        const totalLeads = safePending + safeStudents;
        const finalVisitors = safeVisitors;

        setChartData([
          { stage: 'Visitas Web', count: finalVisitors, color: '#9ba3d4' },
          { stage: 'Prospectos (Leads)', count: totalLeads, color: '#5b64a0' },
          { stage: 'Estudiantes Pagos', count: safeStudents, color: '#ffc749' },
        ]);

        const conversionRate =
          finalVisitors > 0 ? ((safeStudents / finalVisitors) * 100).toFixed(1) : 0;
        setMetrics({
          visitors: finalVisitors,
          leads: totalLeads,
          conversions: safeStudents,
          rate: conversionRate,
        });
      } catch (error) {
        console.error('Error fetching funnel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[300px] font-montserrat">
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
        <span className="text-[#454d82] font-bold uppercase tracking-widest text-xs">
          Loading Funnel...
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

  const parsedRate = parseFloat(metrics.rate);
  const statusPill =
    metrics.visitors === 0 && metrics.leads === 0
      ? { label: 'Sin Tráfico', cls: 'bg-[#e8eaf7] text-[#454d82]' }
      : parsedRate >= 10
      ? { label: 'Óptimo', cls: 'bg-[#e7faf3] text-[#128063] border-[#16a37f]/40' }
      : parsedRate >= 5
      ? { label: 'Intermedio', cls: 'bg-[#fff3d1] text-[#1e2246] border-[#ffc749]' }
      : { label: 'Crítico', cls: 'bg-[#ee665b]/15 text-[#c93f34] border-[#ee665b]/40' };

  return (
    <div
      id="printable-funnel-report"
      className="commercial-funnel-card relative flex flex-col w-full h-full bg-white/75 rounded-[1.75rem] p-4 sm:p-6 font-montserrat text-[#1e2246]"
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-funnel-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          #printable-funnel-report, #printable-funnel-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          .recharts-responsive-container { height: 350px !important; min-height: 350px !important; margin-bottom: 20px !important; }
          .recharts-text { fill: #333 !important; font-weight: bold !important; }
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Reporte Comercial Generado:
        </p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>
          {currentDate}
        </p>
      </div>

      {/* Header */}
      <div className="mb-4 flex flex-wrap justify-between items-end gap-3 border-b border-[#626a9f]/15 pb-4">
        <div>
          <span className="inline-block text-[9.5px] font-bold uppercase tracking-widest bg-[#fff3d1] text-[#1e2246] border border-[#ffc749] px-2.5 py-0.5 rounded-full mb-1.5">
            Tráfico → Inscripción
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-[#1e2246]">
            Embudo de Adquisición
          </h3>
          <p className="text-[11px] font-bold text-[#4c5384] uppercase tracking-wider">
            Conversión End-to-End
          </p>
        </div>

        <div className="bg-[#f4f6fc] border border-white rounded-2xl px-4 py-2 text-right shadow-inner">
          <p className="text-[9.5px] text-[#626a9f] uppercase font-bold tracking-widest">
            Tasa de Conversión
          </p>
          <p className="text-3xl font-extrabold text-[#454d82] leading-tight">
            {metrics.rate}%
          </p>
        </div>
      </div>

      {/* Compact 3-Stage Tally Pills */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="bg-[#f4f6fc] border border-white rounded-2xl p-2.5 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#626a9f] block">
            Visitas
          </span>
          <span className="text-lg font-extrabold text-[#1e2246]">
            {metrics.visitors.toLocaleString()}
          </span>
        </div>
        <div className="bg-[#e8eaf7] border border-white rounded-2xl p-2.5 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#454d82] block">
            Leads
          </span>
          <span className="text-lg font-extrabold text-[#454d82]">
            {metrics.leads.toLocaleString()}
          </span>
        </div>
        <div className="bg-[#fff8e1] border border-[#ffc749] rounded-2xl p-2.5 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#1e2246] block">
            Alumnos
          </span>
          <span className="text-lg font-extrabold text-[#1e2246]">
            {metrics.conversions.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Recessed Chart Well */}
      <div className="w-full h-56 sm:h-64 mb-5 bg-[#f4f6fc] border border-white rounded-3xl p-3 sm:p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 6, right: 24, bottom: 6, left: 26 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 106, 159, 0.18)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#454d82', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(98, 106, 159, 0.25)' }}
              tickLine={false}
            />
            <YAxis
              dataKey="stage"
              type="category"
              width={118}
              tick={{ fill: '#1e2246', fontSize: 11, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
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
              cursor={{ fill: 'rgba(98, 106, 159, 0.08)' }}
            />
            <Bar dataKey="count" name="Cantidad" radius={[0, 10, 10, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={index === 2 ? '#1e2246' : 'none'}
                  strokeWidth={index === 2 ? 1.5 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Executive Directive Footer */}
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
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed text-[#3b4170] font-medium w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="uppercase tracking-widest text-[10px] font-extrabold text-[#454d82]">
              Directiva Comercial
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border ${statusPill.cls}`}
            >
              {statusPill.label}
            </span>
          </div>

          {(() => {
            if (metrics.visitors === 0 && metrics.leads === 0) {
              return (
                <p>
                  No hay datos suficientes para generar un reporte comercial. El rastreador web no ha registrado tráfico.
                </p>
              );
            }

            let estado = 'CRÍTICO';
            let colorClass = 'text-[#c93f34]';
            let estrategia =
              'Auditar inmediatamente el embudo. El tráfico no está convirtiendo. Revisar la propuesta de valor en la página web, asegurar que el formulario de registro funcione sin fricciones, y contactar directamente a los prospectos (leads) caídos.';

            if (parsedRate >= 10) {
              estado = 'ÓPTIMO';
              colorClass = 'text-[#128063]';
              estrategia =
                'Tasa de conversión extremadamente saludable. Se recomienda escalar gradualmente la inversión en adquisición de tráfico (pauta publicitaria) manteniendo el mismo segmento de audiencia objetivo para maximizar ingresos.';
            } else if (parsedRate >= 5) {
              estado = 'INTERMEDIO';
              colorClass = 'text-[#b37a00]';
              estrategia =
                'Conversión aceptable pero con margen de mejora. Implementar pruebas A/B en los llamados a la acción (CTAs) de la landing page y ejecutar campañas de retargeting para los prospectos indecisos.';
            }

            return (
              <p>
                De un total de <strong className="text-[#1e2246]">{metrics.visitors.toLocaleString()}</strong> visitas
                registradas en la web, se han capturado{' '}
                <strong className="text-[#1e2246]">{metrics.leads.toLocaleString()}</strong> prospectos, de los cuales{' '}
                <strong className="text-[#1e2246]">{metrics.conversions.toLocaleString()}</strong> completaron el proceso
                de inscripción para convertirse en estudiantes pagos. Esto resulta en una tasa de conversión End-to-End del{' '}
                <strong className="text-[#1e2246]">{metrics.rate}%</strong>, indicando un estado comercial{' '}
                <strong className={colorClass}>{estado}</strong>. {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CommercialFunnelModule;