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
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col shadow-inner hover:bg-white/10 transition-colors group">
      <h3 className="text-[#fcd34d] font-black text-[10px] uppercase tracking-widest mb-4 drop-shadow-md border-b border-white/10 pb-2">{title}</h3>
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="block text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Site Visits</span>
          <span className="text-3xl font-black text-white">{data.visits.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Free Lessons</span>
          <span className="text-3xl font-black text-emerald-400">{data.lessons.toLocaleString()}</span>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Conversion Rate</span>
        <span className={`text-xs font-black px-3 py-1 rounded-md shadow-inner ${calculateConversion(data.visits, data.lessons) > 15 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
          {calculateConversion(data.visits, data.lessons)}%
        </span>
      </div>
    </div>
  );

  if (isLoading) return <div className="p-8 text-center text-white/50 font-black tracking-widest uppercase">Analyzing Traffic Data...</div>;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-md">Traffic & Conversion Funnel</h2>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Real-Time Acquisition Metrics</p>
        </div>
        <div className="text-right bg-white/5 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
          <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">All-Time Visitors</p>
          <p className="text-2xl font-black text-[#fcd34d] leading-none mt-1">{stats.total.visits.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Today (24h)" data={stats.today} />
        <MetricCard title="This Week" data={stats.week} />
        <MetricCard title="This Month" data={stats.month} />
        <MetricCard title="This Year" data={stats.year} />
      </div>
    </div>
  );
};

export default TrafficAnalyticsModule;