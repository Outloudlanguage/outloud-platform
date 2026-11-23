import React, { useEffect, useRef } from 'react';

const BRAND_SHAPES = ['bubble', 'pill', 'arc', 'triangle', 'spark', 'orb'];

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default function OutLoudParticleField({ phase = 'idle', micLevelRef }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);
  const celebrateQueuedRef = useRef(false);

  useEffect(() => {
    if (phase === 'congrats' && phaseRef.current !== 'congrats') {
      celebrateQueuedRef.current = true;
    }
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = parent.clientWidth || 360;
    let height = parent.clientHeight || 320;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = parent.clientWidth || 360;
      height = parent.clientHeight || 320;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // Mascot bumper geometry (keeps particles framed actively in the left/right wings)
    const getMascotBumper = () => ({
      x: width * 0.5,
      y: Math.min(height * 0.34, 118),
      r: width < 380 ? 64 : 74,
    });

    const getPalette = (currentPhase) => {
      if (currentPhase === 'recording' || currentPhase === 'ready_to_record') {
        return ['#ee665b', '#ffc749', '#ffffff', '#ff8c82', '#626a9f'];
      }
      if (currentPhase === 'comparing_user' || currentPhase === 'congrats') {
        return ['#16a37f', '#ffc749', '#ffffff', '#626a9f', '#7de0c5'];
      }
      return ['#ffc749', '#626a9f', '#ffffff', '#8f98d4', '#ffd875'];
    };

    const targetCount = width < 400 ? 14 : 18;
    const particles = [];
    const ripples = [];
    const microPopDots = [];
    const pointer = { x: -999, y: -999, active: false };

    const addRipple = (x, y, color, maxR = 26) => {
      if (ripples.length > 18) ripples.shift();
      ripples.push({ x, y, r: 4, maxR, alpha: 0.65, color });
    };

    const addPopBurst = (x, y, color) => {
      addRipple(x, y, color, 28);
      for (let i = 0; i < 5; i++) {
        if (microPopDots.length > 36) microPopDots.shift();
        const ang = (Math.PI * 2 * i) / 5 + Math.random() * 0.5;
        const spd = 1.1 + Math.random() * 1.4;
        microPopDots.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 2 + Math.random() * 2,
          color,
          life: 0,
          maxLife: 0.42 + Math.random() * 0.2,
        });
      }
    };

    const createParticle = (initial = false, customPos = null) => {
      const bumper = getMascotBumper();
      const palette = getPalette(phaseRef.current);
      const kind = BRAND_SHAPES[Math.floor(Math.random() * BRAND_SHAPES.length)];
      const baseR =
        kind === 'bubble' || kind === 'pill'
          ? 15 + Math.random() * 5
          : kind === 'orb'
          ? 9 + Math.random() * 7
          : 11 + Math.random() * 6;

      let x = customPos ? customPos.x : 0;
      let y = customPos ? customPos.y : 0;

      if (!customPos) {
        // Pick an open position strongly favoring the left/right wings around the mascot
        for (let attempt = 0; attempt < 24; attempt++) {
          const preferSide = Math.random() < 0.78;
          if (preferSide) {
            const leftSide = Math.random() < 0.5;
            x = leftSide
              ? baseR + 10 + Math.random() * Math.max(24, width * 0.34 - baseR)
              : width - (baseR + 10 + Math.random() * Math.max(24, width * 0.34 - baseR));
            y = baseR + 12 + Math.random() * Math.max(40, height * 0.64 - baseR);
          } else {
            x = baseR + 12 + Math.random() * Math.max(30, width - baseR * 2 - 24);
            y = baseR + 12 + Math.random() * Math.max(30, height - baseR * 2 - 24);
          }

          const distBumper = Math.hypot(x - bumper.x, y - bumper.y);
          if (distBumper < bumper.r + baseR + 6) continue;

          let overlaps = false;
          for (let j = 0; j < particles.length; j++) {
            if (Math.hypot(x - particles[j].x, y - particles[j].y) < baseR + particles[j].r + 6) {
              overlaps = true;
              break;
            }
          }
          if (!overlaps) break;
        }
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.32 + Math.random() * 0.52;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const maxLife = 6.5 + Math.random() * 7.5;

      if (!initial) {
        addRipple(x, y, color, baseR * 1.45);
      }

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: baseR,
        mass: baseR * 0.1,
        kind,
        color,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.022,
        age: initial ? Math.random() * (maxLife * 0.65) : 0,
        maxLife,
        bumpScale: initial ? 1 : 1.15,
        cooldown: 0,
      };
    };

    for (let i = 0; i < targetCount; i++) {
      particles.push(createParticle(true));
    }

    // Pointer / Touch Interaction directly on parent card (doesn't block button clicks)
    const onPointerMove = (e) => {
      const rect = parent.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onPointerDown = (e) => {
      if (e.target && e.target.closest && e.target.closest('button')) return;
      const rect = parent.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const palette = getPalette(phaseRef.current);
      addPopBurst(px, py, palette[0]);

      // Spawn a fresh playful particle right where the user tapped (keeping cap healthy)
      if (particles.length >= targetCount + 4) {
        particles.shift();
      }
      const p = createParticle(false, { x: px, y: py });
      p.vx = (Math.random() - 0.5) * 2.2;
      p.vy = (Math.random() - 0.5) * 2.2;
      particles.push(p);

      // Gentle outward wave nudging nearby particles
      particles.forEach((other) => {
        const dx = other.x - px;
        const dy = other.y - py;
        const d = Math.hypot(dx, dy);
        if (d > 1 && d < 110) {
          const push = ((110 - d) / 110) * 1.9;
          other.vx += (dx / d) * push;
          other.vy += (dy / d) * push;
          other.bumpScale = 1.2;
        }
      });
    };

    parent.addEventListener('pointermove', onPointerMove, { passive: true });
    parent.addEventListener('pointerleave', onPointerLeave, { passive: true });
    parent.addEventListener('pointerdown', onPointerDown, { passive: true });

    // Custom Brand Shape Renderer
    const drawParticle = (p, scale, alpha) => {
      if (scale <= 0.02 || alpha <= 0.01) return;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;

      const r = p.r;

      if (p.kind === 'bubble') {
        // Brand Speech Bubble with 3 dots
        const w = r * 1.85;
        const h = r * 1.25;
        ctx.fillStyle = p.color;
        drawRoundedRect(ctx, -w / 2, -h / 2, w, h, h * 0.42);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w * 0.24, h * 0.44);
        ctx.lineTo(-w * 0.36, h * 0.82);
        ctx.lineTo(-w * 0.02, h * 0.44);
        ctx.closePath();
        ctx.fill();

        // Subtle inner typing dots
        ctx.fillStyle = p.color === '#ffffff' ? '#626a9f' : '#ffffff';
        ctx.globalAlpha = alpha * 0.9;
        [-w * 0.22, 0, w * 0.22].forEach((dx) => {
          ctx.beginPath();
          ctx.arc(dx, 0, Math.max(1.5, r * 0.12), 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (p.kind === 'pill') {
        // Mini Acoustic Wave Capsule
        const w = r * 1.95;
        const h = r * 1.05;
        ctx.fillStyle = p.color;
        drawRoundedRect(ctx, -w / 2, -h / 2, w, h, h / 2);
        ctx.fill();

        ctx.fillStyle = p.color === '#ffffff' || p.color === '#ffc749' ? '#454d82' : '#ffffff';
        const bars = [0.35, 0.65, 0.45, 0.58];
        bars.forEach((bh, idx) => {
          const bx = -w * 0.27 + idx * (w * 0.18);
          const barH = h * bh;
          drawRoundedRect(ctx, bx - 1.3, -barH / 2, 2.6, barH, 1.3);
          ctx.fill();
        });
      } else if (p.kind === 'arc') {
        // Brand Quarter-Circle Wedge
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-r * 0.55, r * 0.55);
        ctx.arc(-r * 0.55, r * 0.55, r * 1.25, -Math.PI / 2, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.kind === 'triangle') {
        // Soft Rounded Geometric Triangle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.92);
        ctx.lineTo(r * 0.86, r * 0.72);
        ctx.lineTo(-r * 0.86, r * 0.72);
        ctx.closePath();
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = p.color;
        ctx.stroke();
        ctx.fill();
      } else if (p.kind === 'spark') {
        // 4-Point Brand Star Sparkle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const rad = i % 2 === 0 ? r * 0.98 : r * 0.34;
          const a = (i * Math.PI) / 4;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Soft Glass Orb with Specular Rim
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(-r * 0.24, -r * 0.24, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    let lastTime = performance.now();
    let rafId = null;

    const renderFrame = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const currentPhase = phaseRef.current;
      const bumper = getMascotBumper();
      const micBoost = micLevelRef && micLevelRef.current ? micLevelRef.current : 0;

      // Celebratory radial impulse when user finishes the exercise
      if (celebrateQueuedRef.current) {
        celebrateQueuedRef.current = false;
        particles.forEach((p) => {
          const dx = p.x - bumper.x;
          const dy = p.y - bumper.y;
          const d = Math.hypot(dx, dy) || 1;
          p.vx += (dx / d) * (2.2 + Math.random() * 1.4);
          p.vy += (dy / d) * (2.2 + Math.random() * 1.4);
          p.bumpScale = 1.32;
        });
        addRipple(bumper.x, bumper.y, '#16a37f', 110);
        addRipple(bumper.x, bumper.y, '#ffc749', 82);
      }

      const speedMult =
        currentPhase === 'recording'
          ? 1.35 + micBoost * 1.4
          : currentPhase === 'playing_model' || currentPhase === 'comparing_model' || currentPhase === 'comparing_user'
          ? 1.25
          : 1;

      // 1. Update positions, lifecycles & wall/bumper bounces
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age += dt;
        if (p.cooldown > 0) p.cooldown -= dt;

        // Pop out of existence & respawn fresh elsewhere
        if (p.age >= p.maxLife) {
          addPopBurst(p.x, p.y, p.color);
          particles[i] = createParticle(false);
          continue;
        }

        // Gentle organic float drift + damping toward comfortable cruise speed
        p.x += p.vx * speedMult * (dt * 60);
        p.y += p.vy * speedMult * (dt * 60);
        p.rotation += p.vRot * speedMult * (dt * 60);

        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 2.2) {
          p.vx *= 0.96;
          p.vy *= 0.96;
        } else if (speed < 0.25) {
          p.vx *= 1.03;
          p.vy *= 1.03;
        }

        // Smooth decay of collision squash/pop scale back to 1
        p.bumpScale += (1 - p.bumpScale) * Math.min(1, dt * 10);

        // Live microphone radial pulse during recording
        if (currentPhase === 'recording' && micBoost > 0.12) {
          const dx = p.x - bumper.x;
          const dy = p.y - bumper.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 170) {
            p.vx += (dx / d) * micBoost * 0.14;
            p.vy += (dy / d) * micBoost * 0.14;
          }
        }

        // Pointer / finger playful push
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          const minHover = p.r + 44;
          if (d > 0.5 && d < minHover) {
            const force = ((minHover - d) / minHover) * 0.42;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
            p.bumpScale = Math.max(p.bumpScale, 1.12);
          }
        }

        // Soft elastic container walls
        const pad = p.r + 8;
        if (p.x < pad) {
          p.x = pad;
          p.vx = Math.abs(p.vx) * 0.92;
          p.bumpScale = 1.15;
        } else if (p.x > width - pad) {
          p.x = width - pad;
          p.vx = -Math.abs(p.vx) * 0.92;
          p.bumpScale = 1.15;
        }

        if (p.y < pad) {
          p.y = pad;
          p.vy = Math.abs(p.vy) * 0.92;
          p.bumpScale = 1.15;
        } else if (p.y > height - pad) {
          p.y = height - pad;
          p.vy = -Math.abs(p.vy) * 0.92;
          p.bumpScale = 1.15;
        }

        // Mascot center bumper (keeps particles visibly framing the mascot)
        const bdx = p.x - bumper.x;
        const bdy = p.y - bumper.y;
        const bDist = Math.hypot(bdx, bdy);
        const minBumper = bumper.r + p.r;
        if (bDist < minBumper && bDist > 0.01) {
          const nx = bdx / bDist;
          const ny = bdy / bDist;
          p.x = bumper.x + nx * minBumper;
          p.y = bumper.y + ny * minBumper;
          const dot = p.vx * nx + p.vy * ny;
          if (dot < 0) {
            p.vx -= 1.85 * dot * nx;
            p.vy -= 1.85 * dot * ny;
            p.bumpScale = 1.22;
            if (p.cooldown <= 0) {
              addRipple(bumper.x + nx * bumper.r, bumper.y + ny * bumper.r, p.color, 18);
              p.cooldown = 0.45;
            }
          }
        }
      }

      // 2. Real Elastic Particle-to-Particle Collisions
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.r + b.r + 3;

          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.52;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;

            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
              const restitution = 0.88;
              const impulse = (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
              a.vx -= (impulse / a.mass) * nx;
              a.vy -= (impulse / a.mass) * ny;
              b.vx += (impulse / b.mass) * nx;
              b.vy += (impulse / b.mass) * ny;

              a.vRot += (Math.random() - 0.5) * 0.025;
              b.vRot += (Math.random() - 0.5) * 0.025;
              a.bumpScale = 1.25;
              b.bumpScale = 1.25;

              if (a.cooldown <= 0 && b.cooldown <= 0) {
                addRipple(a.x + nx * a.r, a.y + ny * a.r, a.color, 22);
                a.cooldown = 0.35;
                b.cooldown = 0.35;
              }
            }
          }
        }
      }

      // 3. Draw Expanding Collision & Pop Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.r += (rip.maxR - rip.r) * Math.min(1, dt * 8.5) + 0.35;
        rip.alpha -= dt * 1.45;
        if (rip.alpha <= 0.01) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = rip.alpha * 0.65;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Micro Pop-Out Dots
      for (let i = microPopDots.length - 1; i >= 0; i--) {
        const d = microPopDots[i];
        d.life += dt;
        if (d.life >= d.maxLife) {
          microPopDots.splice(i, 1);
          continue;
        }
        d.x += d.vx * (dt * 60);
        d.y += d.vy * (dt * 60);
        const t = d.life / d.maxLife;
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (1 - t * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = (1 - t) * 0.85;
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw Particles with Smooth Pop-In & Pop-Out Easing
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let lifeScale = 1;
        let alpha = 0.72;

        if (p.age < 0.42) {
          // Spring pop-in
          const t = p.age / 0.42;
          lifeScale = Math.max(0, easeOutBack(t));
          alpha = Math.min(0.72, t * 0.9);
        } else if (p.age > p.maxLife - 0.38) {
          // Quick swell then pop out
          const t = (p.age - (p.maxLife - 0.38)) / 0.38;
          lifeScale = t < 0.35 ? 1 + t * 0.45 : Math.max(0, 1.16 * (1 - (t - 0.35) / 0.65));
          alpha = 0.72 * (1 - t);
        }

        const voiceScale = currentPhase === 'recording' ? 1 + micBoost * 0.25 : 1;
        drawParticle(p, lifeScale * p.bumpScale * voiceScale, alpha);
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      parent.removeEventListener('pointermove', onPointerMove);
      parent.removeEventListener('pointerleave', onPointerLeave);
      parent.removeEventListener('pointerdown', onPointerDown);
    };
  }, [micLevelRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}