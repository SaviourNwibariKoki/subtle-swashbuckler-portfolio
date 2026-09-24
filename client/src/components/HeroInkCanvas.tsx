import React, { useEffect, useRef } from "react";

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  speed: number;
}

interface CodeGlyph {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  opacity: number;
  angle: number;
  rotSpeed: number;
}

export function HeroInkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const heroElement = canvas.parentElement;
    if (!heroElement) return;

    // Accessibility check: prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    function handleMotionPreferenceChange(e: MediaQueryListEvent) {
      prefersReducedMotion = e.matches;
    }
    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    let width = (canvas.width = heroElement.clientWidth || window.innerWidth);
    let height = (canvas.height = heroElement.clientHeight || window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !heroElement) return;
      width = heroElement.clientWidth;
      height = heroElement.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    resize();

    // 1. Spring Physics State for Cursor Orb
    let targetX = width * 0.5;
    let targetY = height * 0.45;
    let orbX = targetX;
    let orbY = targetY;
    let orbVx = 0;
    let orbVy = 0;
    let orbOpacity = 0;
    let targetOpacity = 0;
    let isPointerActive = false;

    const springTension = prefersReducedMotion ? 0.35 : 0.18;
    const springDamping = prefersReducedMotion ? 0.6 : 0.72;

    // 2. Fluid Digital Smoke Particles Pool
    const smokeParticles: SmokeParticle[] = [];
    const MAX_SMOKE_PARTICLES = prefersReducedMotion ? 8 : 45;

    const smokeColors = [
      "rgba(139, 92, 246, ",  // violet-500
      "rgba(124, 58, 237, ",  // purple-600
      "rgba(168, 85, 247, ",  // purple-500
      "rgba(192, 132, 252, ", // purple-400
      "rgba(216, 180, 254, ", // purple-300
    ];

    function spawnSmokePuff(x: number, y: number, vx: number, vy: number, speed: number) {
      if (prefersReducedMotion) return;
      const count = Math.min(Math.floor(speed * 0.7) + 1, 3);

      for (let i = 0; i < count; i++) {
        if (smokeParticles.length >= MAX_SMOKE_PARTICLES) {
          smokeParticles.shift();
        }

        const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.5;
        const puffSpeed = Math.random() * (speed * 0.25 + 0.6);
        const baseColor = smokeColors[Math.floor(Math.random() * smokeColors.length)];
        const maxLife = 50 + Math.random() * 35;
        const initRadius = 8 + Math.random() * 12;
        const maxRadius = initRadius + 28 + Math.random() * 24;

        smokeParticles.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: Math.cos(angle) * puffSpeed * 0.35 + (Math.random() - 0.5) * 0.2,
          vy: Math.sin(angle) * puffSpeed * 0.35 - 0.18, // gentle upward thermal plume
          radius: initRadius,
          maxRadius,
          alpha: 0,
          maxAlpha: 0.16 + Math.random() * 0.14,
          life: 0,
          maxLife,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          color: baseColor,
        });
      }
    }

    // 3. Rapier Flourish Light Trail
    const rapierTrail: TrailPoint[] = [];
    const MAX_TRAIL_LENGTH = prefersReducedMotion ? 0 : 24;
    const TRAIL_LIFETIME = 300; // ms

    // 4. Sparse Floating Code Glyphs
    const codeGlyphs: CodeGlyph[] = [];
    const GLYPH_CHARS = ["{ }", "[ ]", "</>", "//", "=>", "::", "fn()", "λ", "x,y", "+", "~", "0x"];
    const glyphCount = width < 768 ? 14 : 24;

    for (let i = 0; i < glyphCount; i++) {
      codeGlyphs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        char: GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)],
        size: 11 + Math.random() * 3,
        opacity: 0.14 + Math.random() * 0.25,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.006,
      });
    }

    // Ambient floating gentle violet aura
    let ambientPulse = 0;

    let lastRawX = -1;
    let lastRawY = -1;
    let lastMoveTime = performance.now();
    let isVisible = true;
    let isIntersecting = true;
    let animationFrameId: number;

    function onPointerMove(clientX: number, clientY: number) {
      if (!heroElement) return;
      const heroRect = heroElement.getBoundingClientRect();
      const rawX = clientX - heroRect.left;
      const rawY = clientY - heroRect.top;

      if (rawX < -40 || rawX > width + 40 || rawY < -40 || rawY > height + 40) {
        targetOpacity = 0;
        isPointerActive = false;
        return;
      }

      const now = performance.now();
      const dt = Math.max(now - lastMoveTime, 8);

      let speed = 0;
      let vx = 0;
      let vy = 0;

      if (lastRawX !== -1 && lastRawY !== -1) {
        vx = (rawX - lastRawX) / dt;
        vy = (rawY - lastRawY) / dt;
        speed = Math.hypot(vx, vy);
      }

      targetX = rawX;
      targetY = rawY;
      targetOpacity = 1;
      isPointerActive = true;

      // Spawn smoke puffs
      spawnSmokePuff(rawX, rawY, vx, vy, speed);

      // Record rapier trail point
      if (!prefersReducedMotion && speed > 0.1) {
        rapierTrail.unshift({
          x: rawX,
          y: rawY,
          time: now,
          speed,
        });
      }

      lastRawX = rawX;
      lastRawY = rawY;
      lastMoveTime = now;
    }

    function handleMouseMove(e: MouseEvent) {
      onPointerMove(e.clientX, e.clientY);
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    function handlePointerLeave() {
      targetOpacity = 0;
      isPointerActive = false;
      lastRawX = -1;
      lastRawY = -1;
    }

    heroElement.addEventListener("mousemove", handleMouseMove, { passive: true });
    heroElement.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    heroElement.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    heroElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    heroElement.addEventListener("touchend", handlePointerLeave, { passive: true });
    heroElement.addEventListener("touchcancel", handlePointerLeave, { passive: true });

    // Performance Observers
    function handleVisibilityChange() {
      isVisible = !document.hidden;
      if (isVisible && isIntersecting) {
        lastMoveTime = performance.now();
        loop();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && isVisible) {
          lastMoveTime = performance.now();
          loop();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(heroElement);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(heroElement);

    // 60FPS Render Loop
    function loop() {
      if (!isVisible || !isIntersecting || !ctx) return;

      const now = performance.now();

      // Update Cursor Spring Physics
      const dx = targetX - orbX;
      const dy = targetY - orbY;
      const ax = dx * springTension;
      const ay = dy * springTension;

      orbVx = (orbVx + ax) * springDamping;
      orbVy = (orbVy + ay) * springDamping;
      orbX += orbVx;
      orbY += orbVy;

      orbOpacity += (targetOpacity - orbOpacity) * 0.12;

      // Clear Frame
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Background Violet Light
      ambientPulse += 0.008;
      const ambientR = Math.min(width, height) * 0.45 * (1 + 0.08 * Math.sin(ambientPulse));
      const ambientGrad = ctx.createRadialGradient(
        width * 0.75,
        height * 0.4,
        0,
        width * 0.75,
        height * 0.4,
        ambientR
      );
      ambientGrad.addColorStop(0, "rgba(139, 92, 246, 0.035)");
      ambientGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.4, ambientR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render Sparse Code Glyphs
      codeGlyphs.forEach((glyph) => {
        const motionScale = prefersReducedMotion ? 0.12 : 1.0;
        glyph.x += glyph.vx * motionScale;
        glyph.y += glyph.vy * motionScale;
        glyph.angle += glyph.rotSpeed * motionScale;

        // Screen wrap
        if (glyph.x < -30) glyph.x = width + 30;
        if (glyph.x > width + 30) glyph.x = -30;
        if (glyph.y < -30) glyph.y = height + 30;
        if (glyph.y > height + 30) glyph.y = -30;

        ctx.save();
        ctx.translate(glyph.x, glyph.y);
        ctx.rotate(glyph.angle);
        ctx.font = `600 ${glyph.size}px "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(124, 58, 237, ${glyph.opacity.toFixed(3)})`;
        ctx.fillText(glyph.char, 0, 0);
        ctx.restore();
      });

      // 3. Render Fluid Digital Smoke Particles
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.life += 1;
        if (p.life >= p.maxLife) {
          smokeParticles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.rotation += p.rotSpeed;

        const progress = p.life / p.maxLife;
        // Smooth expansion & bell-curve alpha fade
        const currentRadius = p.radius + (p.maxRadius - p.radius) * Math.sin(progress * Math.PI * 0.5);
        const currentAlpha = Math.sin(progress * Math.PI) * p.maxAlpha;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const smokeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
        smokeGrad.addColorStop(0, `${p.color}${currentAlpha.toFixed(3)})`);
        smokeGrad.addColorStop(0.5, `${p.color}${(currentAlpha * 0.45).toFixed(3)})`);
        smokeGrad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Render Rapier Flourish Light Trail
      while (rapierTrail.length > 0 && now - rapierTrail[rapierTrail.length - 1].time > TRAIL_LIFETIME) {
        rapierTrail.pop();
      }
      if (rapierTrail.length > MAX_TRAIL_LENGTH) {
        rapierTrail.splice(MAX_TRAIL_LENGTH);
      }

      if (rapierTrail.length >= 3 && !prefersReducedMotion) {
        // Outer glowing blade stroke
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(rapierTrail[0].x, rapierTrail[0].y);

        for (let i = 1; i < rapierTrail.length - 1; i++) {
          const xc = (rapierTrail[i].x + rapierTrail[i + 1].x) / 2;
          const yc = (rapierTrail[i].y + rapierTrail[i + 1].y) / 2;
          ctx.quadraticCurveTo(rapierTrail[i].x, rapierTrail[i].y, xc, yc);
        }

        const maxRecentSpeed = rapierTrail[0].speed || 0;
        const trailWidth = Math.min(Math.max(maxRecentSpeed * 2.4, 3), 10);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = `rgba(139, 92, 246, ${(0.28 * orbOpacity).toFixed(3)})`;
        ctx.lineWidth = trailWidth;
        ctx.shadowColor = "rgba(168, 85, 247, 0.75)";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // Core laser filament
        for (let i = 0; i < rapierTrail.length - 1; i++) {
          const p1 = rapierTrail[i];
          const p2 = rapierTrail[i + 1];
          const ageRatio = (now - p1.time) / TRAIL_LIFETIME;
          if (ageRatio >= 1) continue;

          const alpha = (1 - ageRatio) * 0.75 * orbOpacity;
          const coreWidth = Math.max(0.6, (1 - i / rapierTrail.length) * 2.2);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(245, 243, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = coreWidth;
          ctx.shadowColor = "rgba(192, 132, 252, 0.9)";
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 5. Render Violet Cursor Orb with Spring Physics
      if (orbOpacity > 0.01) {
        ctx.save();
        ctx.globalAlpha = orbOpacity;

        // Radiant Outer Violet Aura
        const auraGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 18);
        auraGrad.addColorStop(0, "rgba(168, 85, 247, 0.35)");
        auraGrad.addColorStop(0.5, "rgba(124, 58, 237, 0.15)");
        auraGrad.addColorStop(1, "rgba(124, 58, 237, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Violet Core Orb
        ctx.fillStyle = "#7c3aed";
        ctx.shadowColor = "rgba(168, 85, 247, 0.9)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 4.2, 0, Math.PI * 2);
        ctx.fill();

        // White Glint Center
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(orbX, orbY, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
      heroElement.removeEventListener("mousemove", handleMouseMove);
      heroElement.removeEventListener("mouseleave", handlePointerLeave);
      heroElement.removeEventListener("touchstart", handleMouseMove as any);
      heroElement.removeEventListener("touchmove", handleTouchMove);
      heroElement.removeEventListener("touchend", handlePointerLeave);
      heroElement.removeEventListener("touchcancel", handlePointerLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-ink-canvas"
      aria-hidden="true"
    />
  );
}
