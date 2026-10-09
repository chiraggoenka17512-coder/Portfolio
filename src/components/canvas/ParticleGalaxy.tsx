import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
}

const PARTICLE_COLORS = [
  '#00f2fe', // Cyan
  '#4facfe', // Soft Blue
  '#8a2be2', // Violet / Purple
  '#f8fafc', // Crisp White
  '#94a3b8', // Subtle Slate
];

const CONNECTION_DISTANCE = 90;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MOUSE_INFLUENCE_RADIUS = 130;
const MOUSE_RADIUS_SQ = MOUSE_INFLUENCE_RADIUS * MOUSE_INFLUENCE_RADIUS;

export const ParticleGalaxy: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = !document.hidden;

    // Viewport dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse coordinates (stored in logical CSS pixels)
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
    };

    // Calculate count based on viewport size (capped between 90 and 135)
    const particleCount = Math.min(
      135,
      Math.max(90, Math.floor((width * height) / 11000))
    );

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const baseAlpha = 0.2 + Math.random() * 0.6;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: 1 + Math.random() * 1.8,
          alpha: baseAlpha,
          baseAlpha,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Document visibility change listener to pause when tab is inactive
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastTime = performance.now();

    // Render loop
    const render = (time: number) => {
      if (!isVisible) return;

      const delta = Math.min((time - lastTime) / 16.67, 2.0); // Normalized to ~60fps
      lastTime = time;

      // Smooth mouse interpolation
      if (mouse.targetX > -1000) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Apply mouse deflection
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const distSq = mdx * mdx + mdy * mdy;

        if (distSq < MOUSE_RADIUS_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * 0.45;
          p.vx += (mdx / dist) * force * delta;
          p.vy += (mdy / dist) * force * delta;
        }

        // Apply friction dampening
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Position update
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        // Boundary wrapping with margin
        const margin = 20;
        if (p.x < -margin) p.x = width + margin;
        else if (p.x > width + margin) p.x = -margin;

        if (p.y < -margin) p.y = height + margin;
        else if (p.y > height + margin) p.y = -margin;

        // Draw particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius > 1.8 ? 8 : 4;
        ctx.fill();
        ctx.restore();

        // Connect nearby particles within threshold
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const connDistSq = cdx * cdx + cdy * cdy;

          if (connDistSq < CONNECTION_DISTANCE_SQ) {
            const connDist = Math.sqrt(connDistSq);
            const lineAlpha = (1 - connDist / CONNECTION_DISTANCE) * 0.16 * p.alpha;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#4facfe';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 block"
      aria-hidden="true"
    />
  );
};

export default ParticleGalaxy;
