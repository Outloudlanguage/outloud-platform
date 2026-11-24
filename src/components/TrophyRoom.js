import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../SupabaseClient';
import { OutLoudIcon } from './OutLoudBrand';

// ==========================================
// PRE-COMPILED RENDERING ENGINES
// ==========================================
const getTierColor = (tier) => {
  const colors = {
    Bronze: '#d97706',
    Silver: '#94a3b8',
    Gold: '#ffc749',
    Diamond: '#38bdf8',
    Emerald: '#16a37f',
  };
  return colors[tier] || '#ffc749';
};

const renderFallbackSVG = (tier, color) => (
  <svg
    className="absolute inset-0 w-full h-full drop-shadow-2xl z-20 scale-55"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id={`grad-${tier}`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor={color} stopOpacity="0.85" />
        <stop offset="0.5" stopColor={color} stopOpacity="0.25" />
        <stop offset="1" stopColor={color} stopOpacity="0.7" />
      </linearGradient>
      <filter id={`glow-${tier}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path
      d="M50 5 L85 30 L85 70 L50 95 L15 70 L15 30 Z"
      fill={`url(#grad-${tier})`}
      stroke={color}
      strokeWidth="1.5"
      strokeOpacity="0.85"
    />
    <path d="M50 5 L50 50 L85 30" fill="white" fillOpacity="0.12" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />
    <path d="M50 5 L50 50 L15 30" fill="black" fillOpacity="0.2" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />
    <circle cx="50" cy="50" r="10" fill={color} filter={`url(#glow-${tier})`} opacity="0.85" />
    <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.95" />
  </svg>
);

const TrophyPlayer = ({ assetUrl, videoUrl, tier, color, isModal = false, isUnlocked = false }) => {
  const [showSpawn, setShowSpawn] = useState(isModal && isUnlocked && !!videoUrl);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (isModal && isUnlocked && videoUrl) {
      setShowSpawn(true);
      setFading(false);
      const fadeOutTimer = setTimeout(() => setFading(true), 3500);
      const swapTimer = setTimeout(() => {
        setShowSpawn(false);
        setFading(false);
      }, 4000);
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(swapTimer);
      };
    }
    setShowSpawn(false);
    setFading(false);
  }, [isModal, isUnlocked, videoUrl, assetUrl]);

  const activeUrl = showSpawn ? videoUrl : assetUrl;
  const isLooping = !showSpawn;

  if (!activeUrl) return renderFallbackSVG(tier, color);

  if (activeUrl.includes('<iframe')) {
    const match = activeUrl.match(/src=["'](.*?)["']/);
    let src = match ? match[1] : '';
    if (!src) return renderFallbackSVG(tier, color);

    src = src.replace(/\?.*/, '');
    src += `?autoplay=true&muted=true&controls=false&background=true${isLooping ? '&loop=true' : ''}`;

    return (
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen transition-opacity duration-500 z-20 ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
      >
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

  return (
    <img
      src={activeUrl}
      alt="Trophy"
      className="absolute inset-0 w-full h-full object-contain mix-blend-screen drop-shadow-2xl z-20 p-7"
      style={{ filter: 'contrast(1.18) brightness(1.08)' }}
    />
  );
};

// Flat 2px-Stroked Duotone Trophy Emblem matching Landing Page SVG grammar
const TrophyHeaderEmblem = () => (
  <svg className="w-12 h-12 shrink-0" viewBox="0 0 64 64" fill="none">
    <rect x="4" y="4" width="56" height="56" rx="16" fill="#ffc749" stroke="#1e2246" strokeWidth="2.6" />
    <path d="M22 20 H15 C15 29 18.5 34 24 34" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M42 20 H49 C49 29 45.5 34 40 34" stroke="#1e2246" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M21 16 H43 V29 C43 37 38 42 32 42 C26 42 21 37 21 29 V16 Z" fill="#ffffff" stroke="#1e2246" strokeWidth="2.4" />
    <circle cx="32" cy="27" r="5.5" fill="#5b64a0" />
    <rect x="29" y="42" width="6" height="5" fill="#5b64a0" stroke="#1e2246" strokeWidth="2" />
    <rect x="23" y="47" width="18" height="5" rx="2.5" fill="#16a37f" stroke="#1e2246" strokeWidth="2.2" />
  </svg>
);

const TrophyRoomStyles = () => (
  <style>{`
    .ola-trophy-canvas {
      background: linear-gradient(125deg, #fdebc0 0%, #f6eff5 44%, #e5e8fa 76%, #d9dff8 100%);
    }
    .ola-trophy-card-pearl {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 244, 253, 0.84) 100%);
      backdrop-filter: blur(22px) saturate(175%);
      -webkit-backdrop-filter: blur(22px) saturate(175%);
      border: 2px solid #ffffff;
      box-shadow: 0 20px 42px -18px rgba(55, 63, 118, 0.22), inset 0 2px 2px #ffffff;
    }
    .ola-trophy-lift {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease, border-color 0.22s ease;
    }
    .ola-trophy-lift:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 48px -16px rgba(30, 34, 70, 0.32);
    }
    .ola-trophy-lift:active {
      transform: translateY(-1px) scale(0.99);
    }
    @keyframes olaTrophyModalIn {
      0% { opacity: 0; transform: translateY(14px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ola-trophy-modal-in {
      animation: olaTrophyModalIn 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
  `}</style>
);

export default function TrophyRoom({ targetUser, currentUserRole, onClose, isAdminOverrideEnabled = false }) {
  const [catalog, setCatalog] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const [isUpdatingOverride, setIsUpdatingOverride] = useState(false);

  const targetUserId = targetUser?.id || null;

  const fetchTrophyData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .order('sort_order', { ascending: true });

      const { data: progress } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', targetUserId);

      const progressMap = {};
      if (progress) {
        progress.forEach((p) => {
          progressMap[p.achievement_id] = p;
        });
      }

      setCatalog(achievements || []);
      setUserProgress(progressMap);
    } catch (err) {
      console.error('Error fetching trophies:', err);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchTrophyData();
  }, [fetchTrophyData]);

  const handleAdminOverride = async (trophy, shouldUnlock) => {
    if (!isAdminOverrideEnabled || currentUserRole !== 'admin' || !targetUserId) return;
    setIsUpdatingOverride(true);
    try {
      if (shouldUnlock) {
        await supabase.from('user_achievements').upsert(
          {
            user_id: targetUserId,
            achievement_id: trophy.id,
            current_progress: trophy.target_value || 1,
            unlocked_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,achievement_id' }
        );
      } else {
        await supabase
          .from('user_achievements')
          .delete()
          .eq('user_id', targetUserId)
          .eq('achievement_id', trophy.id);
      }
      await fetchTrophyData();
      setSelectedTrophy((prev) =>
        prev
          ? {
              ...prev,
              isUnlocked: shouldUnlock,
              currentVal: shouldUnlock ? prev.target_value || 1 : 0,
            }
          : null
      );
    } catch (err) {
      console.error('Error updating trophy override:', err);
    } finally {
      setIsUpdatingOverride(false);
    }
  };

  const categories = ['ALL', ...new Set(catalog.map((a) => a.category).filter(Boolean))];
  const filteredCatalog =
    activeCategory === 'ALL' ? catalog : catalog.filter((a) => a.category === activeCategory);
  const unlockedCount = catalog.filter((a) => !!userProgress[a.id]?.unlocked_at).length;
  const completionPct = catalog.length > 0 ? Math.round((unlockedCount / catalog.length) * 100) : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[700] bg-[#1e2246]/55 backdrop-blur-xl flex flex-col items-center justify-center p-4 font-montserrat">
        <TrophyRoomStyles />
        <OutLoudIcon className="w-16 h-16 animate-bounce mb-3" />
        <div className="w-8 h-8 border-4 border-[#626a9f] border-t-[#ffc749] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[700] bg-[#1e2246]/55 backdrop-blur-xl flex items-center justify-center p-0 sm:p-6 md:p-8 font-montserrat select-none text-[#1e2246]"
    >
      <TrophyRoomStyles />

      <div className="ola-trophy-canvas ola-trophy-modal-in w-full h-full max-w-7xl relative border-2 border-white shadow-2xl rounded-none sm:rounded-[2.5rem] flex flex-col overflow-hidden z-10">
        {/* Architectural Dot Grid matching Landing Page */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-75"
          style={{
            backgroundImage: 'radial-gradient(rgba(82, 91, 146, 0.22) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* TOP HEADER */}
        <header className="flex justify-between items-center p-5 sm:px-8 sm:py-5 border-b-2 border-white shrink-0 bg-white/75 backdrop-blur-2xl relative z-20 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <TrophyHeaderEmblem />
            <div className="min-w-0">
              <span className="inline-block text-[9.5px] font-extrabold uppercase tracking-widest bg-[#1e2246] text-[#ffc749] px-2.5 py-0.5 rounded-full mb-1">
                {currentUserRole === 'admin'
                  ? `Viewing: ${targetUser?.first_name || 'Student'}`
                  : 'Tu Legado OutLoud'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none truncate">
                <span className="text-[#1e2246]">Trophy </span>
                <span className="text-[#626a9f]">
                  Cabinet<span className="text-[#ffc749]">.</span>
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trophy Cabinet"
            className="w-10 h-10 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] text-[#1e2246] rounded-full flex items-center justify-center transition-all active:translate-y-0.5 font-bold cursor-pointer shrink-0"
          >
            ✕
          </button>
        </header>

        {/* DARK-NAVY LEGACY PROGRESS STRIP + FLOATING CATEGORY PILLS */}
        <div className="px-5 sm:px-8 pt-4 pb-3 shrink-0 relative z-20 flex flex-col gap-3.5">
          <div className="bg-[#1e2246] text-white rounded-[1.5rem] px-5 py-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffc749] shrink-0" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ffc749] block leading-none">
                  Colección Desbloqueada
                </span>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  {unlockedCount} de {catalog.length} Trofeos Conquistados ({completionPct}%)
                </p>
              </div>
            </div>

            <div className="w-full sm:w-56 h-2.5 bg-white/15 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ffc749] to-[#16a37f] transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Floating White Pill Filter Capsule */}
          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar bg-white/95 border-2 border-white rounded-full p-1.5 w-fit max-w-full shadow-[0_10px_24px_-12px_rgba(69,77,130,0.22)]">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-extrabold text-[10.5px] sm:text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                    : 'text-[#454d82] hover:text-[#1e2246] hover:bg-[#f2f4fc]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TROPHY SHOWCASE GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 pb-8 pt-2 relative z-10">
          {filteredCatalog.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#626a9f] font-bold uppercase tracking-widest text-xs py-16">
              No trophies in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {filteredCatalog.map((trophy) => {
                const pData = userProgress[trophy.id];
                const isUnlocked = !!pData?.unlocked_at;
                const currentVal = pData?.current_progress || 0;
                const isSecret = trophy.is_secret && !isUnlocked;
                const hexColor = getTierColor(trophy.tier);

                if (isSecret && currentUserRole !== 'admin') return null;

                return (
                  <div
                    key={trophy.id}
                    onClick={() => setSelectedTrophy({ ...trophy, isUnlocked, currentVal })}
                    className={`ola-trophy-lift relative w-full max-w-[290px] rounded-[2rem] border-2 flex flex-col overflow-hidden cursor-pointer group ${
                      isUnlocked
                        ? 'bg-white border-white shadow-[0_20px_40px_-16px_rgba(55,63,118,0.24)]'
                        : 'bg-white/75 border-white/90 shadow-sm'
                    }`}
                  >
                    {/* DEEP INDIGO 3D PEDESTAL CHAMBER (Preserves mix-blend-screen video brilliance) */}
                    <div className="relative h-60 sm:h-64 w-full bg-gradient-to-b from-[#1e2246] via-[#171b3a] to-[#0f132b] overflow-hidden flex items-center justify-center">
                      {/* Top Status Pill */}
                      <span
                        className={`absolute top-3 right-3 z-30 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isUnlocked
                            ? 'bg-[#16a37f] text-white'
                            : 'bg-white/15 text-white/80 backdrop-blur-md'
                        }`}
                      >
                        {isUnlocked ? 'Unlocked ✓' : 'Locked'}
                      </span>

                      {isUnlocked && (
                        <>
                          <div
                            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-36 h-40 blur-[55px] opacity-45 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none z-0"
                            style={{ backgroundColor: hexColor }}
                          />
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-10 perspective-[500px] z-10 pointer-events-none">
                            <div
                              className="w-full h-full border-t-2 border-white/30 bg-gradient-to-b from-white/20 to-black/80 rounded-[100%]"
                              style={{
                                transform: 'rotateX(75deg)',
                                boxShadow: `inset 0 0 26px ${hexColor}55`,
                              }}
                            />
                          </div>
                        </>
                      )}

                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${
                          isUnlocked
                            ? 'scale-100 opacity-100 group-hover:scale-105'
                            : 'scale-90 opacity-20 grayscale blur-[2px]'
                        }`}
                      >
                        <TrophyPlayer
                          assetUrl={trophy.asset_url}
                          videoUrl={trophy.video_url}
                          tier={trophy.tier}
                          color={hexColor}
                          isModal={false}
                          isUnlocked={isUnlocked}
                        />
                      </div>

                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                          <div className="bg-white/95 p-3.5 rounded-2xl border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] text-[#1e2246]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LIGHT-GLASS PLAQUE */}
                    <div className="p-4 sm:p-5 text-center flex flex-col items-center flex-1 justify-between bg-white">
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-[#1e2246] mb-2 line-clamp-2">
                          {isSecret && currentUserRole === 'admin' ? `[SECRET] ${trophy.title}` : trophy.title}
                        </h3>
                        <span
                          className="inline-block px-3 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-widest border"
                          style={{
                            color: isUnlocked ? '#1e2246' : '#626a9f',
                            backgroundColor: isUnlocked ? `${hexColor}30` : '#f4f6fc',
                            borderColor: isUnlocked ? hexColor : '#dfe2f2',
                          }}
                        >
                          {trophy.tier} Tier
                        </span>
                      </div>

                      {!isUnlocked && trophy.target_value > 1 && (
                        <div className="w-full mt-3.5">
                          <div className="flex justify-between text-[9.5px] font-bold text-[#626a9f] mb-1">
                            <span>Progreso</span>
                            <span>
                              {currentVal}/{trophy.target_value}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#e8eaf7] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min(100, (currentVal / trophy.target_value) * 100)}%`,
                                backgroundColor: hexColor,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selectedTrophy && (
        <div
          className="fixed inset-0 z-[800] bg-[#1e2246]/65 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
          onClick={() => setSelectedTrophy(null)}
        >
          <div
            className="ola-trophy-card-pearl ola-trophy-modal-in rounded-[2.5rem] p-6 sm:p-9 max-w-xl w-full relative flex flex-col items-center text-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedTrophy(null)}
              className="absolute top-5 right-5 w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center z-50 cursor-pointer"
            >
              ✕
            </button>

            {/* Cinematic 3D Viewport */}
            <div
              className={`w-full max-w-[270px] aspect-[3/4] mb-6 relative z-10 flex items-center justify-center overflow-hidden rounded-[2rem] shadow-xl border-2 border-[#1e2246] bg-gradient-to-b from-[#1e2246] to-[#0f132b] ${
                selectedTrophy.isUnlocked ? 'opacity-100' : 'opacity-70 grayscale'
              }`}
            >
              <TrophyPlayer
                assetUrl={selectedTrophy.asset_url}
                videoUrl={selectedTrophy.video_url}
                tier={selectedTrophy.tier}
                color={getTierColor(selectedTrophy.tier)}
                isModal={true}
                isUnlocked={selectedTrophy.isUnlocked}
              />

              {!selectedTrophy.isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                  <div className="bg-white/95 p-5 rounded-3xl border-2 border-[#1e2246] shadow-[0_5px_0_#1e2246] text-[#1e2246]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e2246] uppercase tracking-tight mb-2">
              {selectedTrophy.title}
            </h2>

            <div className="flex items-center gap-2 mb-5">
              <span
                className="px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border"
                style={{
                  color: '#1e2246',
                  backgroundColor: `${getTierColor(selectedTrophy.tier)}35`,
                  borderColor: getTierColor(selectedTrophy.tier),
                }}
              >
                {selectedTrophy.tier} Tier
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[#e8eaf7] text-[#454d82] text-[10px] font-extrabold uppercase tracking-widest">
                {selectedTrophy.category}
              </span>
            </div>

            <div className="w-full bg-[#f4f6fc] border border-white rounded-2xl p-5 mb-5 shadow-inner">
              <h4 className="text-[10px] font-extrabold text-[#454d82] uppercase tracking-widest mb-1.5">
                Objective
              </h4>
              <p className="text-xs sm:text-sm text-[#282d57] font-medium leading-relaxed">
                {selectedTrophy.description}
              </p>
            </div>

            {!selectedTrophy.isUnlocked && selectedTrophy.target_value > 1 && (
              <div className="w-full bg-white border border-[#dfe2f2] rounded-2xl p-5 mb-5 shadow-sm">
                <div className="flex justify-between items-end mb-2.5">
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#626a9f] block">
                      Current Progress
                    </span>
                    <span className="text-xl font-extrabold text-[#1e2246]">
                      {selectedTrophy.currentVal}{' '}
                      <span className="text-xs text-[#626a9f]">/ {selectedTrophy.target_value}</span>
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-[#454d82]">
                    {Math.round((selectedTrophy.currentVal / selectedTrophy.target_value) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#e8eaf7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (selectedTrophy.currentVal / selectedTrophy.target_value) * 100)}%`,
                      backgroundColor: getTierColor(selectedTrophy.tier),
                    }}
                  />
                </div>
              </div>
            )}

            {selectedTrophy.isUnlocked && (
              <div className="w-full py-3.5 bg-[#e7faf3] border-2 border-[#16a37f] text-[#128063] rounded-2xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Achievement Unlocked</span>
              </div>
            )}

            {isAdminOverrideEnabled && currentUserRole === 'admin' && (
              <div className="w-full mt-5 pt-5 border-t border-[#626a9f]/15 flex gap-3">
                {!selectedTrophy.isUnlocked ? (
                  <button
                    type="button"
                    disabled={isUpdatingOverride}
                    onClick={() => handleAdminOverride(selectedTrophy, true)}
                    className="flex-1 py-3 bg-gradient-to-b from-[#ffd66b] to-[#ffc749] text-[#1e2246] border-2 border-[#1e2246] shadow-[0_4px_0_#1e2246] rounded-full font-extrabold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingOverride ? 'Updating...' : 'Force Unlock ✓'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUpdatingOverride}
                    onClick={() => handleAdminOverride(selectedTrophy, false)}
                    className="flex-1 py-3 bg-[#fff2f1] hover:bg-[#ee665b] text-[#c93f34] hover:text-white border-2 border-[#ee665b] rounded-full font-extrabold text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingOverride ? 'Updating...' : 'Revoke Trophy'}
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