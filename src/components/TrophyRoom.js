import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

export default function TrophyRoom({ targetUser, currentUserRole, onClose, isAdminOverrideEnabled = false }) {
  const [catalog, setCatalog] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedTrophy, setSelectedTrophy] = useState(null);

  useEffect(() => {
    if (!targetUser?.id) return;
    fetchTrophyData();
  }, [targetUser]);

  const fetchTrophyData = async () => {
    setLoading(true);
    try {
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .order('sort_order', { ascending: true });
        
      const { data: progress } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', targetUser.id);

      const progressMap = {};
      if (progress) {
        progress.forEach(p => { progressMap[p.achievement_id] = p; });
      }

      setCatalog(achievements || []);
      setUserProgress(progressMap);
    } catch (err) {
      console.error("Error fetching trophies:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', ...new Set(catalog.map(a => a.category))];
  const filteredCatalog = activeCategory === 'ALL' ? catalog : catalog.filter(a => a.category === activeCategory);

  const getTierColor = (tier) => {
    const colors = {
      'Bronze': '#d97706', // Richer amber
      'Silver': '#cbd5e1', // Bright slate
      'Gold': '#fcd34d',   // OLA Yellow
      'Diamond': '#38bdf8',// Bright Sky
      'Emerald': '#10b981' // Bright Emerald
    };
    return colors[tier] || '#ffffff';
  };

  // ==========================================
// PRE-COMPILED RENDERING ENGINES
// ==========================================
const renderFallbackSVG = (tier, color) => (
  <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`grad-${tier}`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor={color} stopOpacity="0.8" />
        <stop offset="0.5" stopColor={color} stopOpacity="0.2" />
        <stop offset="1" stopColor={color} stopOpacity="0.6" />
      </linearGradient>
      <filter id={`glow-${tier}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path d="M50 5 L85 30 L85 70 L50 95 L15 70 L15 30 Z" fill={`url(#grad-${tier})`} stroke={color} strokeWidth="1.5" strokeOpacity="0.8"/>
    <path d="M50 5 L50 50 L85 30" fill="white" fillOpacity="0.1" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
    <path d="M50 5 L50 50 L15 30" fill="black" fillOpacity="0.2" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
    <path d="M15 30 L50 50 L15 70" fill="white" fillOpacity="0.05" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
    <path d="M85 30 L50 50 L85 70" fill="black" fillOpacity="0.3" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
    <path d="M15 70 L50 50 L50 95" fill="white" fillOpacity="0.15" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
    <path d="M85 70 L50 50 L50 95" fill="black" fillOpacity="0.4" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
    <circle cx="50" cy="50" r="10" fill={color} filter={`url(#glow-${tier})`} opacity="0.8"/>
    <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9"/>
  </svg>
);

const TrophyPlayer = ({ assetUrl, videoUrl, tier, color, isModal = false, isUnlocked = false }) => {
  const [showSpawn, setShowSpawn] = useState(isModal && isUnlocked && !!videoUrl);

  useEffect(() => {
    if (isModal && isUnlocked && videoUrl) {
      setShowSpawn(true);
      const timer = setTimeout(() => setShowSpawn(false), 4000); 
      return () => clearTimeout(timer);
    }
  }, [isModal, isUnlocked, videoUrl, assetUrl]);

  const activeUrl = showSpawn ? videoUrl : assetUrl;

  if (!activeUrl) return renderFallbackSVG(tier, color);

  if (activeUrl.includes('<iframe')) {
    const match = activeUrl.match(/src=["'](.*?)["']/);
    let src = match ? match[1] : '';
    if (!src) return renderFallbackSVG(tier, color);

    // Forcefully strip old params and inject the required Cloudflare auto-play parameters
    src = src.replace(/&?(autoplay|muted|controls|loop)=[^&]*/g, '');
    src += (src.includes('?') ? '&' : '?') + `autoplay=true&muted=true&controls=false${showSpawn ? '' : '&loop=true'}`;

    return (
      <iframe
        src={src}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] mix-blend-screen pointer-events-none"
        style={{ border: 'none', maxWidth: 'none' }}
        allow="autoplay; encrypted-media; picture-in-picture;"
        title="Trophy Animation"
      />
    );
  }

  return <img src={activeUrl} alt="Trophy" className="w-full h-full object-contain mix-blend-screen drop-shadow-2xl" style={{ filter: 'contrast(1.2) brightness(1.1)' }} />;
};

  if (loading) {
    return (
      <div className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in font-montserrat">
        <div className="w-16 h-16 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-md flex items-center justify-center p-0 sm:p-6 md:p-10 animate-fade-in font-montserrat select-none">
      
      {/* Dynamic Lighting Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[150px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="w-full h-full max-w-7xl relative bg-gradient-to-br from-[#070b19]/90 to-[#0a1229]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-none sm:rounded-[2.5rem] flex flex-col overflow-hidden z-10">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/5 shrink-0 bg-white/5 relative z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#fcd34d]/10 rounded-xl border border-[#fcd34d]/30 flex items-center justify-center text-[#fcd34d] shadow-[0_0_15px_rgba(252,211,77,0.2)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">Trophy Cabinet</h2>
              <p className="text-[#fcd34d] font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">
                {currentUserRole === 'admin' ? `Viewing: ${targetUser.first_name}'s Achievements` : 'Your Legacy'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 border border-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all shadow-md font-black hover:scale-110">✕</button>
        </div>

        {/* DYNAMIC CATEGORY TABS */}
        <div className="flex gap-3 overflow-x-auto custom-scrollbar px-6 md:px-8 py-4 bg-black/40 shrink-0 border-b border-white/5 relative z-20 shadow-inner">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap shadow-md border ${activeCategory === cat ? 'bg-[#fcd34d] text-[#08203e] border-[#fcd34d] scale-105' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* THE GLASS CABINET (Trophy Grid) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            
            {filteredCatalog.map(trophy => {
              const pData = userProgress[trophy.id];
              const isUnlocked = !!pData?.unlocked_at;
              const currentVal = pData?.current_progress || 0;
              const isSecret = trophy.is_secret && !isUnlocked;
              const hexColor = getTierColor(trophy.tier);

              if (isSecret && currentUserRole !== 'admin') return null;

              return (
                <div 
                  key={trophy.id}
                  onClick={() => setSelectedTrophy({...trophy, isUnlocked, currentVal})}
                  className={`relative aspect-[4/5] rounded-[2rem] border flex flex-col items-center justify-between p-6 text-center transition-all duration-500 cursor-pointer group overflow-hidden ${
                    isUnlocked 
                      ? 'bg-gradient-to-b from-white/10 to-black/60 border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)]' 
                      : 'bg-black/60 border-white/5 shadow-inner hover:bg-black/40'
                  }`}
                >
                  {/* Dynamic Pedestal & Glow (Unlocked) */}
                  {isUnlocked && (
                    <>
                      <div className="absolute inset-0 opacity-20 blur-[50px] transition-opacity duration-700 group-hover:opacity-50 rounded-[2rem] pointer-events-none" style={{ backgroundColor: hexColor }} />
                      <div className="absolute bottom-0 w-3/4 h-8 blur-[20px] rounded-[100%]" style={{ backgroundColor: hexColor, opacity: 0.4 }} />
                      <div className="absolute bottom-4 w-1/2 h-1 bg-white/40 blur-[2px] rounded-full" />
                    </>
                  )}

                  {/* 3D Asset, Video Iframe, or Fallback */}
                  <div className={`relative w-28 h-28 md:w-36 md:h-36 mt-4 transition-all duration-700 pointer-events-none flex items-center justify-center overflow-hidden ${
                    isUnlocked ? 'scale-100 opacity-100 group-hover:scale-110' : 'scale-90 opacity-20 grayscale blur-[2px]'
                  }`} style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                    
                    <div style={{ color: hexColor, filter: isUnlocked ? `drop-shadow(0 20px 30px ${hexColor}80)` : 'none' }} className="w-full h-full flex items-center justify-center transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:-rotate-x-12 relative">
                      <TrophyPlayer assetUrl={trophy.asset_url} videoUrl={trophy.video_url} tier={trophy.tier} color={hexColor} isModal={false} isUnlocked={isUnlocked} />
                    </div>
                    
                    {/* The Padlock Seal */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 backdrop-blur-md p-4 rounded-full border border-white/10 shadow-2xl">
                          <svg className="w-8 h-8 text-white/60 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full z-10 flex flex-col items-center mt-auto">
                    <h3 className={`text-xs md:text-sm font-black uppercase tracking-widest mb-1.5 transition-colors line-clamp-2 px-2 ${isUnlocked ? 'text-white drop-shadow-md' : 'text-white/50'}`}>
                      {isSecret && currentUserRole === 'admin' ? `[SECRET] ${trophy.title}` : trophy.title}
                    </h3>
                    
                    <div className={`px-3 py-1 rounded-full border text-[8px] font-black tracking-widest uppercase shadow-sm ${
                      isUnlocked ? 'bg-black/40 border-transparent' : 'bg-black/60 border-white/5 text-white/30'
                    }`} style={{ color: isUnlocked ? hexColor : undefined }}>
                      {trophy.tier}
                    </div>

                    {/* Progress Bar */}
                    {!isUnlocked && trophy.target_value > 1 && (
                      <div className="w-full mt-4 px-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden shadow-inner border border-white/5">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(currentVal / trophy.target_value) * 100}%`, backgroundColor: hexColor }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* INSPECTION MODAL */}
      {selectedTrophy && (
        <div className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in select-none" onClick={() => setSelectedTrophy(null)}>
          <div className="bg-[#0a0e1a] border border-white/10 rounded-[3rem] p-6 md:p-10 max-w-lg w-full shadow-[0_30px_100px_rgba(0,0,0,1)] relative flex flex-col items-center text-center animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            
            {/* Dynamic Modal Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 blur-[100px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: getTierColor(selectedTrophy.tier) }} />
            
            <button onClick={() => setSelectedTrophy(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/5 border border-white/10 hover:bg-white/20 text-white rounded-full font-black transition-colors flex items-center justify-center z-50 shadow-md">✕</button>
            
            <div className={`w-48 md:w-56 aspect-[3/4] mb-6 transition-all duration-700 relative z-10 flex items-center justify-center overflow-hidden ${selectedTrophy.isUnlocked ? 'opacity-100 scale-100' : 'opacity-30 grayscale blur-[2px] scale-90'}`}>
              <div style={{ color: getTierColor(selectedTrophy.tier), filter: selectedTrophy.isUnlocked ? `drop-shadow(0 20px 40px ${getTierColor(selectedTrophy.tier)})` : 'none' }} className="absolute inset-0 flex items-center justify-center w-full h-full">
                <TrophyPlayer assetUrl={selectedTrophy.asset_url} videoUrl={selectedTrophy.video_url} tier={selectedTrophy.tier} color={getTierColor(selectedTrophy.tier)} isModal={true} isUnlocked={selectedTrophy.isUnlocked} />
              </div>
              
              {!selectedTrophy.isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/80 backdrop-blur-xl p-6 rounded-full border border-white/10 shadow-2xl">
                    <svg className="w-12 h-12 text-white/50 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-3 relative z-10 drop-shadow-md">{selectedTrophy.title}</h2>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="px-4 py-1.5 rounded-full border bg-black/40 text-[10px] font-black tracking-widest uppercase shadow-inner" style={{ color: getTierColor(selectedTrophy.tier), borderColor: `${getTierColor(selectedTrophy.tier)}40` }}>
                {selectedTrophy.tier} Tier
              </span>
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-[10px] font-black tracking-widest uppercase">
                {selectedTrophy.category}
              </span>
            </div>
            
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative z-10 shadow-inner">
              <h4 className="text-[10px] font-black text-[#fcd34d] uppercase tracking-widest mb-2">Objective</h4>
              <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
                {selectedTrophy.description}
              </p>
            </div>

            {/* Detailed Progress Section */}
            {!selectedTrophy.isUnlocked && selectedTrophy.target_value > 1 && (
              <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 relative z-10 shadow-inner">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1">Current Progress</span>
                    <span className="text-2xl font-black text-white">{selectedTrophy.currentVal} <span className="text-sm text-white/40 font-bold">/ {selectedTrophy.target_value}</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black" style={{ color: getTierColor(selectedTrophy.tier) }}>
                      {Math.round((selectedTrophy.currentVal / selectedTrophy.target_value) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-white/5">
                  <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${(selectedTrophy.currentVal / selectedTrophy.target_value) * 100}%`, backgroundColor: getTierColor(selectedTrophy.tier) }}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {selectedTrophy.isUnlocked && (
              <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black text-sm uppercase tracking-widest shadow-inner flex items-center justify-center gap-3 mb-8 relative z-10">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Achievement Unlocked
              </div>
            )}

            {/* Admin God Mode Tools */}
            {isAdminOverrideEnabled && currentUserRole === 'admin' && (
              <div className="w-full mt-2 pt-6 border-t border-white/10 flex gap-4 relative z-10">
                {!selectedTrophy.isUnlocked && (
                  <button className="flex-1 py-4 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all">
                    Force Unlock
                  </button>
                )}
                {selectedTrophy.isUnlocked && (
                  <button className="flex-1 py-4 bg-red-900/40 hover:bg-red-900 text-red-400 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors">
                    Revoke Trophy
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}