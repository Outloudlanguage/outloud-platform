import React, { useState, useEffect } from 'react';
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

const TrophyRoomStyles = () => (
  <style>{`
    .ola-trophy-shell {
      background: linear-gradient(155deg, #d7dcf5 0%, #eaedfb 34%, #f7eff0 66%, #fdebc0 100%);
    }
    .ola-trophy-glass {
      background: linear-gradient(142deg, rgba(255, 255, 255, 0.86) 0%, rgba(244, 246, 255, 0.66) 100%);
      backdrop-filter: blur(26px) saturate(185%);
      -webkit-backdrop-filter: blur(26px) saturate(185%);
      border: 1.5px solid rgba(255, 255, 255, 0.96);
      box-shadow: 0 22px 50px -16px rgba(55, 63, 118, 0.25), inset 0 1.5px 1px #ffffff;
    }
    .ola-trophy-card {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease, border-color 0.22s ease;
    }
    .ola-trophy-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 46px -14px rgba(30, 34, 70, 0.32);
    }
    .ola-trophy-card:active {
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

  useEffect(() => {
    if (!targetUser?.id) return;
    fetchTrophyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  };

  const categories = ['ALL', ...new Set(catalog.map((a) => a.category))];
  const filteredCatalog =
    activeCategory === 'ALL' ? catalog : catalog.filter((a) => a.category === activeCategory);
  const unlockedCount = catalog.filter((a) => !!userProgress[a.id]?.unlocked_at).length;

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

      <div className="ola-trophy-shell ola-trophy-modal-in w-full h-full max-w-7xl relative border-2 border-white/95 shadow-2xl rounded-none sm:rounded-[2.5rem] flex flex-col overflow-hidden z-10">
        {/* Subtle Architectural Dotted Grid */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-75"
          style={{
            backgroundImage: 'radial-gradient(rgba(72, 80, 134, 0.2) 1.4px, transparent 1.4px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* TOP HEADER */}
        <header className="flex justify-between items-center p-5 sm:px-8 sm:py-6 border-b border-white/90 shrink-0 bg-white/65 backdrop-blur-2xl relative z-20 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#ffc749] rounded-2xl border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] flex items-center justify-center text-[#1e2246] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e2246] uppercase tracking-tight leading-none">
                Trophy Cabinet
              </h2>
              <p className="text-[#454d82] font-bold text-[10.5px] sm:text-xs uppercase tracking-widest mt-1">
                {currentUserRole === 'admin'
                  ? `Viewing: ${targetUser.first_name}'s Achievements`
                  : `OutLoud Legacy • ${unlockedCount} / ${catalog.length} Unlocked`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trophy Cabinet"
            className="w-10 h-10 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full flex items-center justify-center transition-all active:scale-90 font-bold cursor-pointer shadow-sm"
          >
            ✕
          </button>
        </header>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar px-5 sm:px-8 py-3.5 bg-white/45 shrink-0 border-b border-white/80 relative z-20">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-bold text-[10.5px] sm:text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
                activeCategory === cat
                  ? 'bg-[#1e2246] text-[#ffc749] shadow-sm'
                  : 'bg-white/80 text-[#454d82] hover:bg-white border border-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TROPHY SHOWCASE GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 relative z-10">
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
                    className={`ola-trophy-card relative w-full max-w-[290px] rounded-[2rem] border-2 flex flex-col overflow-hidden cursor-pointer group ${
                      isUnlocked
                        ? 'bg-white/85 border-white shadow-[0_18px_38px_-14px_rgba(55,63,118,0.24)]'
                        : 'bg-white/60 border-white/80 opacity-85'
                    }`}
                  >
                    {/* DEEP INDIGO 3D PEDESTAL CHAMBER (Preserves mix-blend-screen video brilliance) */}
                    <div className="relative h-60 sm:h-64 w-full bg-gradient-to-b from-[#1e2246] via-[#171b3a] to-[#0f132b] overflow-hidden flex items-center justify-center">
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
                          <div className="bg-[#1e2246]/80 backdrop-blur-md p-3.5 rounded-full border border-white/25 shadow-xl">
                            <svg className="w-7 h-7 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LIGHT-GLASS PLAQUE */}
                    <div className="p-4 sm:p-5 text-center flex flex-col items-center flex-1 justify-between bg-white/85">
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-[#1e2246] mb-1.5 line-clamp-2">
                          {isSecret && currentUserRole === 'admin' ? `[SECRET] ${trophy.title}` : trophy.title}
                        </h3>
                        <span
                          className="inline-block px-3 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-widest border"
                          style={{
                            color: isUnlocked ? '#1e2246' : '#626a9f',
                            backgroundColor: isUnlocked ? `${hexColor}30` : '#f2f4fb',
                            borderColor: isUnlocked ? hexColor : '#dfe2f2',
                          }}
                        >
                          {trophy.tier} Tier
                        </span>
                      </div>

                      {!isUnlocked && trophy.target_value > 1 && (
                        <div className="w-full mt-3.5">
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
            className="ola-trophy-glass ola-trophy-modal-in rounded-[2.5rem] p-6 sm:p-9 max-w-xl w-full relative flex flex-col items-center text-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedTrophy(null)}
              className="absolute top-5 right-5 w-9 h-9 bg-white hover:bg-[#ffc749] border-2 border-[#1e2246] text-[#1e2246] rounded-full font-bold flex items-center justify-center z-50 cursor-pointer"
            >
              ✕
            </button>

            {/* Cinematic 3D Viewport */}
            <div
              className={`w-full max-w-[280px] aspect-[3/4] mb-6 relative z-10 flex items-center justify-center overflow-hidden rounded-[2rem] shadow-xl border-2 border-[#1e2246] bg-gradient-to-b from-[#1e2246] to-[#0f132b] ${
                selectedTrophy.isUnlocked ? 'opacity-100' : 'opacity-65 grayscale'
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
                  <div className="bg-[#1e2246]/85 p-6 rounded-full border border-white/25 shadow-2xl">
                    <svg className="w-12 h-12 text-white/85" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
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
                className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                style={{
                  color: '#1e2246',
                  backgroundColor: `${getTierColor(selectedTrophy.tier)}35`,
                  borderColor: getTierColor(selectedTrophy.tier),
                }}
              >
                {selectedTrophy.tier} Tier
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[#e8eaf7] text-[#454d82] text-[10px] font-bold uppercase tracking-widest">
                {selectedTrophy.category}
              </span>
            </div>

            <div className="w-full bg-white/85 border border-white rounded-2xl p-5 mb-5 shadow-sm">
              <h4 className="text-[10px] font-bold text-[#454d82] uppercase tracking-widest mb-1.5">Objective</h4>
              <p className="text-xs sm:text-sm text-[#282d57] font-medium leading-relaxed">
                {selectedTrophy.description}
              </p>
            </div>

            {!selectedTrophy.isUnlocked && selectedTrophy.target_value > 1 && (
              <div className="w-full bg-white/85 border border-white rounded-2xl p-5 mb-5 shadow-sm">
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
                <div className="w-full h-2.5 bg-[#e8eaf7] rounded-full overflow-hidden">
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
                    className="flex-1 py-3 bg-[#ee665b] text-white border-2 border-[#1e2246] shadow-[0_3px_0_#1e2246] rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer"
                  >
                    Force Unlock
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex-1 py-3 bg-[#ee665b]/15 hover:bg-[#ee665b] text-[#c93f34] hover:text-white border-2 border-[#ee665b] rounded-full font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
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