import React, { useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient';

// ==========================================
// PRE-COMPILED RENDERING ENGINES
// ==========================================
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

const renderFallbackSVG = (tier, color) => (
  <svg className="absolute inset-0 w-full h-full drop-shadow-2xl z-20 scale-50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <circle cx="50" cy="50" r="10" fill={color} filter={`url(#glow-${tier})`} opacity="0.8"/>
    <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9"/>
  </svg>
);

const TrophyPlayer = ({ assetUrl, videoUrl, tier, color, isModal = false, isUnlocked = false }) => {
  const [showSpawn, setShowSpawn] = useState(isModal && isUnlocked && !!videoUrl);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // If opened in modal, play spawn animation, then smoothly crossfade to idle loop
    if (isModal && isUnlocked && videoUrl) {
      setShowSpawn(true);
      setFading(false);
      const fadeOutTimer = setTimeout(() => setFading(true), 3500); 
      const swapTimer = setTimeout(() => {
        setShowSpawn(false);
        setFading(false);
      }, 4000); 
      return () => { clearTimeout(fadeOutTimer); clearTimeout(swapTimer); };
    } else {
      setShowSpawn(false);
      setFading(false);
    }
  }, [isModal, isUnlocked, videoUrl, assetUrl]);

  const activeUrl = showSpawn ? videoUrl : assetUrl;
  const isLooping = !showSpawn;

  if (!activeUrl) return renderFallbackSVG(tier, color);

  if (activeUrl.includes('<iframe')) {
    const match = activeUrl.match(/src=["'](.*?)["']/);
    let src = match ? match[1] : '';
    if (!src) return renderFallbackSVG(tier, color);

    // CRITICAL: Strip any existing controls/background parameters and force Autoplay & Mute
    src = src.replace(/\?.*/, ''); 
    src += `?autoplay=true&muted=true&controls=false&background=true${isLooping ? '&loop=true' : ''}`;

    return (
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen transition-opacity duration-500 z-20 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        {/* The 150% scaling forces 9:16 vertical videos to cover the bounding box without letterboxing */}
        <div className="w-[150%] h-[150%] min-w-[300px] min-h-[400px] flex items-center justify-center">
          <iframe
            src={src}
            className="w-full h-full border-none mix-blend-screen"
            allow="autoplay; encrypted-media; picture-in-picture;"
            title="Trophy Animation"
          />
        </div>
      </div>
    );
  }

  return <img src={activeUrl} alt="Trophy" className="absolute inset-0 w-full h-full object-contain mix-blend-screen drop-shadow-2xl z-20 p-8" style={{ filter: 'contrast(1.2) brightness(1.1)' }} />;
};


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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10 flex flex-wrap justify-center gap-8">
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
                  className={`relative w-full max-w-[280px] h-[22rem] md:h-[26rem] rounded-t-[2.5rem] rounded-b-2xl border flex flex-col justify-end text-center transition-all duration-500 cursor-pointer group overflow-hidden ${
                    isUnlocked 
                      ? 'border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.9)]' 
                      : 'border-white/5 shadow-inner hover:bg-black/40 opacity-80'
                  }`}
                >
                  {/* Deep Glass Background */}
                  <div className={`absolute inset-0 z-0 ${isUnlocked ? 'bg-gradient-to-b from-white/10 via-[#0a1229]/60 to-[#070b19]/90 backdrop-blur-xl' : 'bg-black/80'}`}></div>
                  
                  {isUnlocked && (
                    <>
                      {/* Dynamic Ambient Back-Glow */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-48 blur-[60px] opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none z-0" style={{ backgroundColor: hexColor }}></div>

                      {/* The Physical 3D Pedestal Base */}
                      <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 w-3/4 h-12 perspective-[500px] z-10 pointer-events-none">
                        <div className="w-full h-full border-t-2 border-l border-white/30 bg-gradient-to-b from-white/20 to-black/90 rounded-[100%]" style={{ transform: 'rotateX(75deg)', boxShadow: `inset 0 0 30px ${hexColor}50` }}></div>
                        {/* Condensed inner glow hitting the pedestal floor */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 blur-[20px] rounded-full" style={{ backgroundColor: hexColor, opacity: 0.8 }}></div>
                      </div>
                    </>
                  )}

                  {/* 3D Asset or Fallback */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 pointer-events-none overflow-hidden ${
                    isUnlocked ? 'scale-100 opacity-100 group-hover:scale-110' : 'scale-90 opacity-20 grayscale blur-[2px]'
                  }`} style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                    <div style={{ color: hexColor, filter: isUnlocked ? `drop-shadow(0 20px 30px ${hexColor}80)` : 'none' }} className="w-full h-full flex items-center justify-center transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:-rotate-x-12 relative">
                      <TrophyPlayer assetUrl={trophy.asset_url} videoUrl={trophy.video_url} tier={trophy.tier} color={hexColor} isModal={false} isUnlocked={isUnlocked} />
                    </div>
                  </div>

                  {/* Foreground Glass Glare Overlay */}
                  {isUnlocked && <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-30 z-30 pointer-events-none rounded-t-[2.5rem]"></div>}

                  {/* The Padlock Seal */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-40">
                      <div className="bg-black/60 backdrop-blur-md p-4 rounded-full border border-white/10 shadow-2xl">
                        <svg className="w-8 h-8 text-white/60 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      </div>
                    </div>
                  )}

                  {/* The Engraved Plaque */}
                  <div className="relative z-40 w-full p-5 text-center bg-black/80 border-t border-white/10 backdrop-blur-2xl mt-auto shadow-inner flex flex-col items-center">
                    <h3 className={`text-xs md:text-sm font-black uppercase tracking-widest mb-1.5 transition-colors line-clamp-2 px-2 ${isUnlocked ? 'text-white drop-shadow-md' : 'text-white/50'}`}>
                      {isSecret && currentUserRole === 'admin' ? `[SECRET] ${trophy.title}` : trophy.title}
                    </h3>
                    <div className={`px-4 py-1.5 rounded-full border text-[8px] font-black tracking-widest uppercase shadow-md inline-block ${
                      isUnlocked ? 'bg-black border-white/10' : 'bg-black/60 border-transparent text-white/30'
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

      {/* INSPECTION MODAL */}
      {selectedTrophy && (
        <div className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in select-none overflow-y-auto custom-scrollbar" onClick={() => setSelectedTrophy(null)}>
          <div className="bg-[#0a0e1a] border border-white/10 rounded-[3rem] p-6 md:p-10 max-w-2xl w-full shadow-[0_30px_100px_rgba(0,0,0,1)] relative flex flex-col items-center text-center animate-slide-up my-auto" onClick={e => e.stopPropagation()}>
            
            {/* Massive Environmental Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-3/4 blur-[120px] rounded-full pointer-events-none opacity-30" style={{ backgroundColor: getTierColor(selectedTrophy.tier) }} />
            
            <button onClick={() => setSelectedTrophy(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/5 border border-white/10 hover:bg-white/20 text-white rounded-full font-black transition-colors flex items-center justify-center z-50 shadow-md">✕</button>
            
            {/* The Fullscreen Cinematic Player Container */}
            <div className={`w-full max-w-sm aspect-[3/4] mb-8 relative z-10 flex items-center justify-center overflow-hidden rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-700 ${selectedTrophy.isUnlocked ? 'opacity-100 scale-100' : 'opacity-50 grayscale blur-[2px] scale-95'}`}>
              <div style={{ color: getTierColor(selectedTrophy.tier), filter: selectedTrophy.isUnlocked ? `drop-shadow(0 20px 40px ${getTierColor(selectedTrophy.tier)})` : 'none' }} className="absolute inset-0 flex items-center justify-center w-full h-full">
                <TrophyPlayer assetUrl={selectedTrophy.asset_url} videoUrl={selectedTrophy.video_url} tier={selectedTrophy.tier} color={getTierColor(selectedTrophy.tier)} isModal={true} isUnlocked={selectedTrophy.isUnlocked} />
              </div>

              {/* The Padlock Seal */}
              {!selectedTrophy.isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                  <div className="bg-black/80 backdrop-blur-xl p-8 rounded-full border border-white/20 shadow-2xl">
                    <svg className="w-16 h-16 text-white/80 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-4 relative z-10 drop-shadow-lg">{selectedTrophy.title}</h2>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="px-5 py-2 rounded-full border bg-black/60 text-[10px] font-black tracking-widest uppercase shadow-inner" style={{ color: getTierColor(selectedTrophy.tier), borderColor: `${getTierColor(selectedTrophy.tier)}50` }}>
                {selectedTrophy.tier} Tier
              </span>
              <span className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-[10px] font-black tracking-widest uppercase">
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
              <div className="w-full py-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black text-sm uppercase tracking-widest shadow-inner flex items-center justify-center gap-3 relative z-10">
                <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Achievement Unlocked
              </div>
            )}

            {/* Admin God Mode Tools */}
            {isAdminOverrideEnabled && currentUserRole === 'admin' && (
              <div className="w-full mt-6 pt-6 border-t border-white/10 flex gap-4 relative z-10">
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