import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

const TrafficAnalyticsModule = () => {
  const [stats, setStats] = useState({
    today: { visits: 0, lessons: 0 },
    week: { visits: 0, lessons: 0 },
    month: { visits: 0, lessons: 0 },
    year: { visits: 0, lessons: 0 },
    total: { visits: 0, lessons: 0 }
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
        
        // Calculate the start of the current week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newStats = {
          today: { visits: 0, lessons: 0 },
          week: { visits: 0, lessons: 0 },
          month: { visits: 0, lessons: 0 },
          year: { visits: 0, lessons: 0 },
          total: { visits: 0, lessons: 0 }
        };

        data.forEach(row => {
          const date = new Date(row.created_at);
          const isVisit = row.event_type === 'site_visit';
          const typeKey = isVisit ? 'visits' : 'lessons';

          // Total
          newStats.total[typeKey]++;

          // Today
          if (date.toDateString() === todayStr) newStats.today[typeKey]++;
          
          // This Week
          if (date >= startOfWeek) newStats.week[typeKey]++;
          
          // This Month
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) newStats.month[typeKey]++;
          
          // This Year
          if (date.getFullYear() === currentYear) newStats.year[typeKey]++;
        });

        setStats(newStats);
      }
      setIsLoading(false);
    };

    fetchAnalytics();
  }, []);

  const calculateConversion = (visits, lessons) => {
    if (visits === 0) return 0;
    return ((lessons / visits) * 100).toFixed(1);
  };

  const MetricCard = ({ title, data }) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col shadow-inner hover:bg-white/10 transition-colors group break-inside-avoid">
      <h3 className="text-[#fcd34d] font-black text-[10px] uppercase tracking-widest mb-4 drop-shadow-md border-b border-white/10 pb-2">{title}</h3>
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="block text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Visitas Web</span>
          <span className="text-3xl font-black text-white">{data.visits.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Clases de Prueba</span>
          <span className="text-3xl font-black text-emerald-400">{data.lessons.toLocaleString()}</span>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tasa de Conversión</span>
        <span className={`text-xs font-black px-3 py-1 rounded-md shadow-inner hide-on-print ${calculateConversion(data.visits, data.lessons) >= 10 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
          {calculateConversion(data.visits, data.lessons)}%
        </span>
      </div>
    </div>
  );

  if (isLoading) return <div className="p-8 text-center text-white/50 font-black tracking-widest uppercase">ANALIZANDO TRÁFICO WEB...</div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-traffic-report" className="relative flex flex-col w-full bg-transparent md:bg-white/5 md:backdrop-blur-xl border-transparent md:border-white/10 md:rounded-[2rem] p-0 md:p-8 shadow-none md:shadow-2xl">
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 15mm; }
          .w-28, .w-64, nav, aside { display: none !important; }
          .flex-1 { padding: 0 !important; margin: 0 !important; width: 100% !important; flex: none !important; display: block !important; }
          body, html { background: white !important; }
          #printable-traffic-report { background-color: white !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }
          
          /* Force all text inside the report to print black, ensuring grid labels are visible */
          #printable-traffic-report * { color: black !important; text-shadow: none !important; border-color: #ccc !important; }
          
          .print-header { display: block !important; margin-bottom: 20px !important; padding-bottom: 10px !important; border-bottom: 2px solid #000 !important; text-align: left !important; }
          .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* Print-Only Header Date */}
      <div className="print-header" style={{ display: 'none' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reporte de Tráfico Generado:</p>
        <p style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate}</p>
      </div>

      <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4" style={{ borderBottomWidth: '1px' }}>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest drop-shadow-md">Adquisición y Tráfico</h2>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Métricas de Conversión Web en Tiempo Real</p>
        </div>
        <div className="text-right bg-white/5 px-6 py-3 rounded-xl border border-white/10 shadow-inner hide-on-print">
          <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Visitas Históricas Totales</p>
          <p className="text-2xl font-black text-[#fcd34d] leading-none mt-1">{stats.total.visits.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Hoy (Últimas 24h)" data={stats.today} />
        <MetricCard title="Esta Semana" data={stats.week} />
        <MetricCard title="Este Mes" data={stats.month} />
        <MetricCard title="Este Año" data={stats.year} />
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 flex items-start gap-4" style={{ paddingTop: '24px' }}>
        <div className="bg-black/40 p-3 rounded-xl flex-shrink-0 hide-on-print">
          <svg className="w-6 h-6 text-white hide-on-print" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-slate-300 font-medium w-full" style={{ textAlign: 'justify', color: 'inherit' }}>
          {(() => {
            if (stats.month.visits === 0) return <p>No se ha registrado tráfico web en el mes en curso. Verifique la conexión con el servidor analítico o la instalación de los píxeles de seguimiento.</p>;
            
            const rate = parseFloat(calculateConversion(stats.month.visits, stats.month.lessons));
            let estado = "CRÍTICO";
            let colorClass = "text-red-400";
            let estrategia = "Severa deficiencia en conversión superior. El tráfico está llegando pero rebotando sin agendar clases de prueba. Detener pauta publicitaria y revisar inmediatamente el diseño de la Landing Page, la oferta principal (CTA) y verificar que el formulario no esté roto.";
            
            if (rate >= 10) {
              estado = "ÓPTIMO";
              colorClass = "text-emerald-400";
              estrategia = "Conversión de tráfico altamente efectiva. El mensaje resuena perfectamente con la audiencia objetivo. Proceder a escalar gradualmente el presupuesto publicitario manteniendo los mismos parámetros de segmentación demográfica.";
            } else if (rate >= 4) {
              estado = "INTERMEDIO";
              colorClass = "text-yellow-400";
              estrategia = "Rendimiento publicitario promedio. La página convierte pero genera fricción. Implementar pruebas A/B en los textos de venta y colores de los botones para intentar destrabar y optimizar la captación de clases de prueba.";
            }

            return (
              <p>
                Durante este mes, la plataforma ha recibido <strong>{stats.month.visits.toLocaleString()} visitas web</strong>, logrando concretar <strong>{stats.month.lessons.toLocaleString()} agendamientos de clases de prueba</strong>. 
                Esto resulta en una tasa de conversión superior del <strong>{rate}%</strong>, clasificando el rendimiento de adquisición mensual en estado <strong className={colorClass}>{estado}</strong>.
                <br/><br/>
                <span className="uppercase tracking-widest text-[10px] font-black opacity-70 block mb-1">Estrategia Comercial Recomendada:</span>
                {estrategia}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalyticsModule;