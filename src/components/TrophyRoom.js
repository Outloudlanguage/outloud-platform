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
      // 1. Fetch the master catalog
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .order('sort_order', { ascending: true });
        
      // 2. Fetch this specific user's progress
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

  // Dynamically generate tabs based on the database
  const categories = ['ALL', ...new Set(catalog.map(a => a.category))];
  const filteredCatalog = activeCategory === 'ALL' ? catalog : catalog.filter(a => a.category === activeCategory);

  const getTierColor = (tier) => {
    const colors = {
      'Bronze': '#b45309', // Amber-700
      'Silver': '#94a3b8', // Slate-400
      'Gold': '#fcd34d',   // OLA Yellow
      'Diamond': '#38bdf8',// Sky-400
      'Emerald': '#10b981' // Emerald-500
    };
    return colors[tier] || '#ffffff';
  };

  // Procedural SVG Fallback if you haven't uploaded the Cloudflare R2 PNG yet
  const renderFallbackSVG = (tier, color) => (
    <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M50 10 L50 90 M10 30 L90 30 M10 70 L90 70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
      <circle cx="50" cy="50" r="15" fill="currentColor"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in font-montserrat">
        <div className="w-16 h-16 border-4 border-[#fcd34d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[700] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-6 md:p-10 animate-fade-in font-montserrat select-none">
      
      {/* Dynamic Lighting Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#fcd34d]/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="w-full h-full max-w-7xl relative bg-[#070b19]/60 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex flex-col overflow-hidden z-10">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/10 shrink-0 bg-white/5 relative z-20">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">Trophy Cabinet</h2>
            <p className="text-[#fcd34d] font-bold text-xs uppercase tracking-widest mt-1">
              {currentUserRole === 'admin' ? `Viewing: ${targetUser.first_name}'s Achievements` : 'Your Legacy'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all shadow-md font-black hover:scale-110">✕</button>
        </div>

        {/* DYNAMIC CATEGORY TABS */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar px-6 md:px-8 py-4 bg-black/20 shrink-0 border-b border-white/5 relative z-20">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-md border ${activeCategory === cat ? 'bg-[#fcd34d] text-[#08203e] border-[#fcd34d] scale-105' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* THE GLASS CABINET (Trophy Grid) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            
            {filteredCatalog.map(trophy => {
              const pData = userProgress[trophy.id];
              const isUnlocked = !!pData?.unlocked_at;
              const currentVal = pData?.current_progress || 0;
              const isSecret = trophy.is_secret && !isUnlocked;
              const hexColor = getTierColor(trophy.tier);

              if (isSecret && currentUserRole !== 'admin') return null; // Hide completely from students if secret and locked

              return (
                <div 
                  key={trophy.id}
                  onClick={() => setSelectedTrophy({...trophy, isUnlocked, currentVal})}
                  className={`relative aspect-[3/4] rounded-3xl border flex flex-col items-center justify-center p-6 text-center transition-all duration-500 cursor-pointer group ${
                    isUnlocked 
                      ? 'bg-gradient-to-b from-white/10 to-black/40 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
                      : 'bg-black/40 border-white/5 shadow-inner hover:bg-white/5'
                  }`}
                >
                  {/* Dynamic Unlocked Glow */}
                  {isUnlocked && (
                    <div className="absolute inset-0 opacity-20 blur-[40px] transition-opacity group-hover:opacity-40 rounded-3xl pointer-events-none" style={{ backgroundColor: hexColor }} />
                  )}

                  {/* 3D Asset or Fallback */}
                  <div className={`relative w-24 h-24 md:w-32 md:h-32 mb-6 transition-all duration-700 pointer-events-none ${
                    isUnlocked ? 'scale-100 opacity-100' : 'scale-90 opacity-20 grayscale blur-[2px]'
                  }`}>
                    <div style={{ color: hexColor, filter: isUnlocked ? `drop-shadow(0 10px 20px ${hexColor}80)` : 'none' }} className="w-full h-full flex items-center justify-center">
                      {trophy.asset_url ? <img src={trophy.asset_url} alt={trophy.title} className="w-full h-full object-contain" /> : renderFallbackSVG(trophy.tier, hexColor)}
                    </div>
                    
                    {/* The Padlock Seal */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white/60 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      </div>
                    )}
                  </div>

                  <h3 className={`text-sm font-black uppercase tracking-widest mb-1 transition-colors z-10 ${isUnlocked ? 'text-white drop-shadow-md' : 'text-white/40'}`}>
                    {isSecret && currentUserRole === 'admin' ? `[SECRET] ${trophy.title}` : trophy.title}
                  </h3>
                  <p className={`text-[9px] font-bold tracking-widest uppercase z-10 ${isUnlocked ? 'text-[#fcd34d]' : 'text-white/30'}`}>
                    {trophy.tier} Tier
                  </p>

                  {/* Minimal Progress Bar (Appears on hover for locked items) */}
                  {!isUnlocked && trophy.target_value > 1 && (
                    <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden shadow-inner border border-white/5">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(currentVal / trophy.target_value) * 100}%`, backgroundColor: hexColor }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* INSPECTION MODAL */}
      {selectedTrophy && (
        <div className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedTrophy(null)}>
          <div className="bg-[#070b19] border border-white/20 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-[0_0_60px_rgba(0,0,0,0.8)] relative flex flex-col items-center text-center animate-slide-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedTrophy(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full font-black transition-colors">✕</button>
            
            <div className={`w-40 h-40 md:w-56 md:h-56 mb-8 transition-all duration-500 ${selectedTrophy.isUnlocked ? 'opacity-100' : 'opacity-30 grayscale blur-sm'}`}>
              <div style={{ color: getTierColor(selectedTrophy.tier), filter: selectedTrophy.isUnlocked ? `drop-shadow(0 15px 30px ${getTierColor(selectedTrophy.tier)})` : 'none' }} className="w-full h-full flex items-center justify-center">
                {selectedTrophy.asset_url ? <img src={selectedTrophy.asset_url} alt="Trophy" className="w-full h-full object-contain" /> : renderFallbackSVG(selectedTrophy.tier, getTierColor(selectedTrophy.tier))}
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-2">{selectedTrophy.title}</h2>
            <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: getTierColor(selectedTrophy.tier) }}>{selectedTrophy.tier} • {selectedTrophy.category}</p>
            
            <p className="text-sm text-white/80 font-medium leading-relaxed mb-8 px-4">
              {selectedTrophy.isUnlocked || currentUserRole === 'admin' ? selectedTrophy.description : 'Keep learning to discover how to unlock this mystery.'}
            </p>

            {/* Progress Section */}
            {!selectedTrophy.isUnlocked && selectedTrophy.target_value > 1 && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">
                  <span>Acquisition Progress</span>
                  <span className="text-white">{selectedTrophy.currentVal} / {selectedTrophy.target_value}</span>
                </div>
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(selectedTrophy.currentVal / selectedTrophy.target_value) * 100}%`, backgroundColor: getTierColor(selectedTrophy.tier) }} />
                </div>
              </div>
            )}

            {selectedTrophy.isUnlocked && (
              <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest shadow-inner flex items-center justify-center gap-2 mb-6">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Achievement Unlocked
              </div>
            )}

            {/* Admin God Mode Tools */}
            {isAdminOverrideEnabled && currentUserRole === 'admin' && (
              <div className="w-full mt-4 pt-6 border-t border-red-500/30 flex gap-3">
                {!selectedTrophy.isUnlocked && (
                  <button className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-colors">
                    Force Unlock
                  </button>
                )}
                {selectedTrophy.isUnlocked && (
                  <button className="flex-1 py-3 bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors">
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