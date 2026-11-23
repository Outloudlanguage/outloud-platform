import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Respect OS accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => onFinish?.(), 400);
      return () => clearTimeout(quickTimer);
    }

    // 1.52s: Trigger the rush-forward exit transition
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1520);

    // 2.02s: Unmount completely so the live app is 100% interactive
    const doneTimer = setTimeout(() => {
      onFinish?.();
    }, 2020);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden select-none pointer-events-auto transition-opacity duration-300 ${
        isExiting ? 'ola-splash-backdrop-exit' : ''
      }`}
      style={{ backgroundColor: '#f6f7fc' }}
      aria-label="Loading OutLoud Language Academy"
    >
      <style>{`
        /* ==========================================
           OUTLOUD 2.0s KINETIC SPLASH CHOREOGRAPHY
           ========================================== */

        /* Soft lavender halo behind everything */
        @keyframes olaHaloPop {
          0% { transform: scale(0.2); opacity: 0; }
          55% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* 1. Rounded yellow tile springs in first */
        @keyframes olaTileIn {
          0% { transform: scale(0) rotate(-18deg); opacity: 0; }
          65% { transform: scale(1.08) rotate(4deg); opacity: 1; }
          85% { transform: scale(0.97) rotate(-1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* 2. Smile / face halves pop in inside the tile */
        @keyframes olaFaceIn {
          0% { transform: translateY(55px) scale(0.45); opacity: 0; }
          65% { transform: translateY(-10px) scale(1.06); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* 3. Headphones drop down onto the tile with a beat bounce */
        @keyframes olaHeadphonesDrop {
          0% { transform: translateY(-130px) scale(1.12); opacity: 0; }
          60% { transform: translateY(14px) scale(0.97); opacity: 1; }
          80% { transform: translateY(-6px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Playful head-nod beat right after headphones land */
        @keyframes olaIconBeat {
          0% { transform: scale(1) rotate(0deg); }
          35% { transform: scale(1.07) rotate(-4deg); }
          70% { transform: scale(0.98) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        /* 4. Icon slides up smoothly to make room for the vertical lockup */
        @keyframes olaIconLift {
          0% { transform: translateY(34px) scale(1.12); }
          65% { transform: translateY(-4px) scale(0.98); }
          100% { transform: translateY(0px) scale(1); }
        }

        /* 5. OutLoud script whips up into the vertical stack */
        @keyframes olaWordmarkSnap {
          0% { transform: translateY(52px) scale(0.72) rotate(-3deg); opacity: 0; }
          68% { transform: translateY(-5px) scale(1.05) rotate(1deg); opacity: 1; }
          100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 1; }
        }

        /* Surrounding brand patterns pop in */
        @keyframes olaPatternPop {
          0% { transform: scale(0) translateY(16px); opacity: 0; }
          70% { transform: scale(1.1) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* Equalizer bar groove */
        @keyframes olaEqPulse {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }

        /* Final Rush Forward (1.52s -> 2.00s) */
        @keyframes olaRushForward {
          0% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); }
          35% { transform: scale(0.94) translateZ(0); opacity: 1; filter: blur(0px); }
          100% { transform: scale(3.1) translateZ(0); opacity: 0; filter: blur(4px); }
        }

        @keyframes olaPatternsBurstOut {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.85); opacity: 0; }
        }

        @keyframes olaBackdropFade {
          0% { opacity: 1; }
          45% { opacity: 1; }
          100% { opacity: 0; }
        }

        .ola-halo {
          animation: olaHaloPop 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .ola-tile-layer {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: olaTileIn 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards;
        }

        .ola-face-layer {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: olaFaceIn 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
        }

        .ola-headphones-layer {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: olaHeadphonesDrop 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) 0.32s forwards;
        }

        .ola-icon-beat-wrap {
          animation: olaIconBeat 0.38s ease-in-out 0.72s forwards;
        }

        .ola-icon-lift-wrap {
          transform: translateY(34px) scale(1.12);
          animation: olaIconLift 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.88s forwards;
        }

        .ola-wordmark-wrap {
          opacity: 0;
          animation: olaWordmarkSnap 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) 0.96s forwards;
        }

        .ola-pattern-1 { opacity: 0; animation: olaPatternPop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.38s forwards; }
        .ola-pattern-2 { opacity: 0; animation: olaPatternPop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.46s forwards; }
        .ola-pattern-3 { opacity: 0; animation: olaPatternPop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.54s forwards; }
        .ola-pattern-4 { opacity: 0; animation: olaPatternPop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.60s forwards; }
        .ola-pattern-wave { opacity: 0; animation: olaPatternPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 0.42s forwards; }

        .ola-eq-bar {
          transform-origin: center;
          animation: olaEqPulse 0.45s ease-in-out infinite;
        }

        .ola-lockup-rush {
          animation: olaRushForward 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
          will-change: transform, opacity, filter;
        }

        .ola-patterns-exit {
          animation: olaPatternsBurstOut 0.42s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
          will-change: transform, opacity;
        }

        .ola-splash-backdrop-exit {
          animation: olaBackdropFade 0.5s ease-in forwards;
          pointer-events: none;
        }
      `}</style>

      {/* SOFT LAVENDER HALO & CORNER ACCENTS */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className={`ola-halo w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full ${
            isExiting ? 'ola-patterns-exit' : ''
          }`}
          style={{ backgroundColor: '#e8eaf7' }}
        />
        {/* Subtle decorative corner circle matching mockup */}
        <div
          className={`absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-55 ${
            isExiting ? 'ola-patterns-exit' : ''
          }`}
          style={{ backgroundColor: '#fff3d1' }}
        />
        <div
          className={`absolute -bottom-20 -right-16 w-56 h-56 rounded-full opacity-60 ${
            isExiting ? 'ola-patterns-exit' : ''
          }`}
          style={{ backgroundColor: '#e8eaf7' }}
        />
      </div>

      {/* KINETIC BRAND PATTERNS LAYER */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
          isExiting ? 'ola-patterns-exit' : ''
        }`}
      >
        <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[420px]">
          {/* TOP-LEFT: Audio Pill Badge */}
          <div className="ola-pattern-1 absolute top-4 left-2 sm:top-6 sm:left-6">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm border"
              style={{ backgroundColor: '#fff3d1', borderColor: '#ffc749' }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#626a9f' }}
              >
                <span className="w-2 h-2 rounded-full bg-[#ffc749]" />
              </span>
              <div className="flex items-center gap-[3px] h-4">
                {[10, 16, 8, 14, 10, 6].map((h, i) => (
                  <span
                    key={i}
                    className="ola-eq-bar w-[3px] rounded-full"
                    style={{
                      height: `${h}px`,
                      backgroundColor: '#626a9f',
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TOP-RIGHT: Layered Speech Bubbles */}
          <div className="ola-pattern-2 absolute top-3 right-2 sm:top-5 sm:right-6">
            <svg width="86" height="58" viewBox="0 0 86 58" fill="none">
              {/* Indigo/Periwinkle Bubble */}
              <rect x="6" y="4" width="58" height="34" rx="10" fill="#a8b0de" />
              <path d="M18 38L14 48L28 38H18Z" fill="#a8b0de" />
              <circle cx="22" cy="21" r="3" fill="#ffffff" />
              <circle cx="35" cy="21" r="3" fill="#ffffff" />
              <circle cx="48" cy="21" r="3" fill="#ffffff" />
              {/* Yellow Accent Bubble */}
              <rect x="46" y="22" width="36" height="24" rx="8" fill="#ffc749" />
              <path d="M72 46L76 54L64 46H72Z" fill="#ffc749" />
              <rect x="55" y="32" width="18" height="4" rx="2" fill="#626a9f" />
            </svg>
          </div>

          {/* LEFT & RIGHT SOUNDWAVE BARS (Radiating from Headphones) */}
          <div className="ola-pattern-wave absolute top-[38%] left-1 sm:left-8 -translate-y-1/2 flex items-center gap-[4px]">
            {[12, 24, 16, 34, 22, 42, 18].map((h, i) => (
              <span
                key={`l-${i}`}
                className="ola-eq-bar w-[4px] rounded-full"
                style={{
                  height: `${h}px`,
                  backgroundColor: i % 3 === 0 ? '#ffc749' : '#626a9f',
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>

          <div className="ola-pattern-wave absolute top-[38%] right-1 sm:right-8 -translate-y-1/2 flex items-center gap-[4px]">
            {[18, 42, 22, 34, 16, 24, 12].map((h, i) => (
              <span
                key={`r-${i}`}
                className="ola-eq-bar w-[4px] rounded-full"
                style={{
                  height: `${h}px`,
                  backgroundColor: i % 3 === 0 ? '#ffc749' : '#626a9f',
                  animationDelay: `${(6 - i) * 0.07}s`,
                }}
              />
            ))}
          </div>

          {/* BOTTOM-LEFT: Dot Matrix Pattern */}
          <div className="ola-pattern-3 absolute bottom-6 left-4 sm:bottom-8 sm:left-10">
            <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
              {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3, 4].map((col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={6 + col * 13}
                    cy={6 + row * 12}
                    r="3.2"
                    fill={(row + col) % 4 === 0 ? '#ffc749' : '#b7bee6'}
                  />
                ))
              )}
            </svg>
          </div>

          {/* BOTTOM-RIGHT: Geometric Quarter-Arcs & Triangle */}
          <div className="ola-pattern-4 absolute bottom-5 right-4 sm:bottom-8 sm:right-10">
            <svg width="68" height="62" viewBox="0 0 68 62" fill="none">
              <path d="M12 24A16 16 0 0 1 28 8V24H12Z" fill="#ffc749" />
              <path d="M32 8A20 20 0 0 1 52 28H32V8Z" fill="#a8b0de" />
              <rect x="14" y="30" width="22" height="22" rx="4" fill="#ffc749" />
              <path d="M44 36L58 50H38L44 36Z" fill="#626a9f" />
            </svg>
          </div>
        </div>
      </div>

      {/* VERTICAL STACK-UP LOGO CONTAINER (Rushes forward on exit) */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center ${
          isExiting ? 'ola-lockup-rush' : ''
        }`}
      >
        {/* LAYER 1: HEADPHONE ICON (Separated Tile, Smile & Headphones) */}
        <div className="ola-icon-lift-wrap">
          <div className="ola-icon-beat-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 904.72 904.72"
              className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-[0_14px_24px_rgba(98,106,159,0.2)] overflow-visible"
            >
              {/* Yellow Rounded Square Tile (Animated independently) */}
              <rect
                className="ola-tile-layer"
                x="76.01"
                y="117.44"
                width="751.97"
                height="751.97"
                rx="120.32"
                ry="120.32"
                fill="#ffc749"
                stroke="#ffffff"
                strokeMiterlimit="10"
                strokeWidth="2"
              />

              {/* Smiling Quote Face Halves (Pop in after tile) */}
              <g className="ola-face-layer">
                <path
                  fill="#626a9f"
                  d="M433.61,831.95c.46-50.58.32-57.11.46-109.97-99.49.15-172.57-44.98-172.07-147.86h172.79c-1.14-48.9,1.55-96.79.04-145.57-2.7-194.75-282.01-186.14-289.21,4.69-7.14,189.25-1.79,393.2,230.02,398.57"
                />
                <path
                  fill="#626a9f"
                  d="M470.91,831.95c-.46-50.58-.32-57.11-.46-109.97,99.49.15,172.57-44.98,172.07-147.86h-172.79c1.14-48.9-1.55-96.79-.04-145.57,2.7-194.75,282.01-186.14,289.21,4.69,7.14,189.25,1.79,393.2-230.02,398.57"
                />
              </g>

              {/* Headphones Arch & Earcups (Drop down from above) */}
              <path
                className="ola-headphones-layer"
                fill="#626a9f"
                d="M789.62,562.95c-.55-21.4-.23-43.36.09-64.61.35-23.41.71-47.59-.09-71.3-2.56-75.99-45.3-136.01-117.26-164.67-2.47-.98-4.62-1.66-6.71-2.32-4.67-1.47-7.01-2.21-9.55-5.11-2.57-2.93-5.02-6.24-7.61-9.74-2.83-3.82-5.75-7.76-9.04-11.51-47.63-54.12-115.92-85.15-187.36-85.15s-140.5,31.43-188.07,86.23c-3.09,3.57-5.87,7.46-8.55,11.24-2.74,3.85-5.32,7.48-7.91,10.3-1.49,1.62-5.3,2.79-8.99,3.92-2.08.64-4.22,1.29-6.36,2.13-68.92,27.09-113.68,86.62-116.79,155.36-1.14,25.25-.63,51.21-.13,76.31.45,22.42.91,45.6.17,67.95-.03.33-.06.6-.1.83h-.24c-1.81,0-4.25-.37-6.83-.76l-.41-.06c-26.87-4.08-47.39-16.68-60.99-37.46-25.44-38.86-22.34-98.3-10.96-140.98,11-41.25,30.42-63.78,62.95-73.07,5.1-1.46,10.29-2.15,15.79-2.9,2.47-.33,4.95-.67,7.49-1.08l5.93-.95,1.95-5.68c14.93-43.6,37.68-82.76,67.61-116.39,33.36-37.5,73.09-66.57,118.07-86.41,43.23-19.07,89.18-28.74,136.57-28.74s94.7,9.94,138.52,29.56c45.56,20.39,85.62,50.2,119.09,88.59,27.68,31.76,49.54,70.08,64.98,113.9l2.26,6.41,6.79.26c11.97.46,22.87,2.92,33.32,7.51,34.39,15.11,46.78,44.03,54.8,82.79,4.92,23.77,6.43,47.67,4.36,69.11-2.33,24.24-9.01,44.45-19.86,60.09-13.52,19.49-33.51,31.42-59.42,35.44-.49.08-1,.16-1.51.24l-.21.03c-2.05.32-4.14.67-5.79.69Z"
              />
            </svg>
          </div>
        </div>

        {/* LAYER 2: OUTLOUD WORDMARK (Transparent background, exact paths) */}
        <div className="ola-wordmark-wrap -mt-1 sm:-mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1078.27 409.8"
            className="w-60 sm:w-80 h-auto drop-shadow-[0_6px_14px_rgba(98,106,159,0.14)]"
          >
            <path
              fill="#626a9f"
              d="M913.78,142.09c1.27-16.89,2.21-33.86,4.99-50.57,3.93-23.67,5.92-43.91,36.03-41.21,7.23.65,24.66,7.16,23.75,16.21-11.92,31.72-21.68,64.43-27.08,98-3.98,24.79-7.29,56.66-2.68,81.28.19.99.87,5.59,1.74,5.78,7.45-4.41,14.09-9.23,22.65-11.65,28.23-7.97,53.67,9.89,46.3,40.44-8.38,34.75-54.81,34.84-79.38,17.6-1.24-.87-2.73-3.29-4.49-2.84-21.18,22.36-46.3,41.41-77.04,47.99-27.07,5.79-49.79,1.52-76.18-4.29-22.32-4.91-45.49-14.65-67.37-2.53-9.93,5.51-14.19,12.9-13.04,24.51.41,4.14,3.77,7.6-.95,10.33-14.07,8.14-37.33-4.27-45.07-16.88-16.21-26.43,2.15-56.91,27.79-68.05,45.36-19.71,88.01,10.78,130.91,20.28,37.1,8.22,66.94-.63,97.12-22.28,1.5-1.08,8.19-5.83,8.67-6.89.97-2.11-2.54-6.92-3.57-9.29-4.11-9.43-5.18-15.3-6.87-25.33-.13-.77.02-1.37-.82-1.87-1.33-.28-4.64,7.59-5.72,9.29-16.36,25.55-53.9,22.63-66.11-5-15.21-34.45-3.4-103.62,38.45-114.47,10.67-2.77,24.06-2.01,32.35,6.03.96.93,4.41,6.57,5.62,5.41ZM894.89,161.55c-11.98,1.45-18.14,23.49-19.64,33.49-1.26,8.4-3.34,30.61,5.26,35.38,7.5,4.16,13.01-3.14,16.2-9.06,7.57-14.04,10.22-34.23,9.05-50.03-.5-6.81-3.66-10.65-10.87-9.78ZM979.61,258.17c-6.62.91-15.05,6.78-19.47,11.69l-.16.7c4.1,6.38,13.11,10.03,20.56,9.48,7.34-.55,15.38-5.12,14.09-13.55-1.21-7.83-8.14-9.27-15.02-8.32Z"
            />
            <path
              fill="#626a9f"
              d="M188.2,47.78c28.5-2.35,49.55,13.58,60.62,38.83,27.3,62.28-3.43,190.18-75.65,211.28-21.88,6.39-45.33,4.48-64.71-7.97-65.25-41.91-47.47-181.84,11.9-222.03,4.7-3.18,16.98-10.44,16.78.14-14.94,17.71-21.73,41.92-15.92,64.72,1.36,5.34,3.76,8.38,3.22,14.36-.53,5.86-2.76,12.8-3.61,18.93-3.31,23.83-3.12,59.12,8.95,80.53,15.04,26.69,41.21,19.16,56.08-3.09,22.13-33.11,33.78-101.96,22.44-139.92-3.7-12.38-11.83-25.88-26.95-19.71-19,7.75-16.62,43.02,6.73,43.22,4.11.04,7.33-2.61,8.24,4.06,4.6,33.9-44.82,43.36-61,9-17.8-37.76,10.91-88.88,52.88-92.35Z"
            />
            <path
              fill="#626a9f"
              d="M772.76,239.25c-.91-.11-1.2-.08-1.87.54-1.04.98-3.89,7.07-5.42,9.07-10.42,13.68-27.71,21.8-44.72,15.34-25.15-9.56-22.12-43.78-18.7-65.41.57-3.63,2.49-8.61,2.6-11.89.03-.8.38-1.55-.79-1.32-5.19,4.97-11.63,8.08-17.38,12.13-5.91,37.32-30.59,72.63-72.2,70.01-48.84-3.08-60.11-56.65-45.01-95.56,5.88-15.15,22.21-39.65,40.73-38.11,3.11.26,5.47,1.86,8.47,2.06,5.08-6.45,12.17-11.32,20.56-12.2,24.9-2.6,39.69,13.52,45.42,35.99.65,2.56,1.27,9.17,2.08,10.79.92,1.82,2.85.38,4.14-.46,8-5.18,19.54-19.74,21.24-29.19,1.6-8.86-3.04-10.26,7.61-14.39,13.05-5.07,35.84-3.98,38.17,13.61,3.26,24.69-20.27,60.53-11.1,83.04,2.86,7.03,8.71,5.97,13.29,1.18,13.03-13.62,12.46-51.24,17.32-69.62,2.79-10.54,8.67-16.09,19.55-18.01,8.82-1.55,28.28-1.37,27.5,11.43-.54,8.91-6.32,24.32-8.35,34.05-3.96,19.03-9.11,55.64,5.9,70.89,5.13,5.22,11.83,5.52,5.02,14.65-5.96,7.99-20.41,13.44-30.19,12.7-20.19-1.53-24.31-24.91-23.87-41.32ZM639.11,154.56c-7.44,1.54-4.61,12.55-1.15,17,1.81,2.33,9.45,7.75,12.2,6.97,2.31-.65.59-8.7.2-10.79-1.15-6.1-3.19-14.84-11.25-13.18ZM611.38,175.37c-5.67,12.62-7.55,45.14,4.85,53.91,13.39,9.47,25.39-6.22,29.72-17.42.88-2.27,3.94-8.8,1.06-9.63-12.48-3.59-24.38-7.41-31.09-19.87-.78-1.45-2.67-8.27-4.54-6.99Z"
            />
            <path
              fill="#626a9f"
              d="M541.55,45.63c16.61-1.61,26.85,7.09,30.41,22.92,6.2,27.55-8.74,58.96-16.5,84.94-10.24,34.24-12.85,70.76-15.3,106.32.31,1.03,9.37,5.64,11.14,6.55,19.76,10.21,50.98,25.67,73.07,17.31,5.89-2.23,9.99-8.43,13.12.54,7.82,22.43-12.16,47.64-34.98,49.5-42.32,3.44-67.9-47.53-105.11-45.1-6.2.41-11.96,4.27-13.41-4.78-1.23-7.67.52-18.66,6.46-24.18,1.98-1.84,7.91-3.61,8.3-5.65.97-40.71,6.29-81.09,13.04-121.14,3.66-21.7,9.65-44.86,11.1-66.72.23-3.47-.58-8.58.12-11.69,1.1-4.94,14.1-8.39,18.54-8.82Z"
            />
            <path
              fill="#626a9f"
              d="M450.58,143.24c-3.14,18.36-6.07,36.85-6.49,55.5-.16,7.01-.76,14.51,1.71,21.33,5.13,14.16,18.85,9.59,26.96.93,1.01-1.08,4.3-6.15,4.64-6.35,2.47-1.45,6.24,5.78,6.9,7.67,7.53,21.58-19.43,41.94-38.41,44.78-69.12,10.35-41.98-99.73-35.1-136.1l-.64-2.74c-8.98-3.57-17.96-7.51-27.07-10.73-24.31-8.6-58.26-17.44-82.01-3.46-6.51,3.83-8.06,9.67-13.47-.27-11.47-21.09,3.93-42.43,25.98-45.72,35.89-5.35,70.84,18.1,101.19,33.66,1.37-.25,2.05-5.22,2.34-6.77,1.54-8.02,1.91-16.43,3.49-24.42.88-4.44,3.57-6.15,7.22-8.34,10.18-6.12,26.64-9.18,37.52-3.42,7.45,3.94,5.51,8.97,3.66,15.66-3.24,11.71-8.97,24.7-11.28,36.47-.25,1.28-.54,2.54-.01,3.82,8.19,2,17.97.47,25.32-3.7,1.73-.98,6.76-5.45,7.87-5.35,3.98.38,7.31,10.34,7.71,13.73,2.38,20.04-12.22,28.12-30.17,26.98-6.16-.38-11.84-2.77-17.86-3.16Z"
            />
            <path
              fill="#626a9f"
              d="M338.44,238.71c-.85-.18-1.11.26-1.61.8-1.66,1.8-3.92,6.57-5.91,9.11-12.19,15.55-33.03,24.56-51.11,12.54-29.29-19.47-4.43-80.03-6.23-108.63-.21-3.39-2.27-9.39-.59-12.35,2.46-4.32,21.43-10.06,26.55-10.46,18.96-1.47,25.13,6.56,22.72,24.89-2.27,17.28-19.22,55.57-9.47,70.32,5.63,8.52,13.47-.44,16.62-6.26,7.53-13.89,8.48-33.46,10.71-48.86,2.32-15.99,3.42-29.23,21.88-32.85,8.59-1.68,26.5-1.26,27.87,10.14-6.16,27.91-23.63,78.64-4.47,103.9,4.18,5.51,12.67,6.9,8.48,15.02-4.17,8.07-19.77,14.64-28.46,14.88-22.92.63-27.88-23.98-26.98-42.19Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}