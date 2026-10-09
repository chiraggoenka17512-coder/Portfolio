Read AGENTS.md first and follow it strictly.

# Prompt 03: Particle Galaxy Background Canvas & Neural Constellation

### Goal
Build an ultra-lightweight, high-performance interactive 2D HTML5 Canvas particle background component in `src/components/canvas/ParticleGalaxy.tsx` that renders subtle floating stars and neural nodes responding smoothly to cursor movement, adhering to Emil Kowalski continuous interpolation and UI/UX Pro Max 60fps performance guardrails.

### Standards & Skills Integration
* **Emil Kowalski Interpolation Physics**:
  - Continuous mouse velocity interpolation (`mouse.x += (targetX - mouse.x) * 0.12`) for silky smooth physical response without jitter.
  - Dampened velocity decay (`p.vx *= 0.985; p.vy *= 0.985`) so particles drift naturally.
* **UI/UX Pro Max & Performance Guardrails**:
  - Strict `pointer-events-none` so the background canvas never intercepts mouse clicks or touch scrolling.
  - DPI calibration: `Math.min(window.devicePixelRatio || 1, 2)` for razor-sharp rendering on Retina screens without wasteful pixel-fill costs.
  - Background throttling: Pause `requestAnimationFrame` loop whenever document is hidden (`document.hidden`).
* **Impeccable Visual Depth**:
  - Cosmic constellation aesthetic with faint neural mesh connections (<90px) rendered in `#4facfe` with dynamic distance-alpha attenuation.

### Negative Constraints
- ❌ Do NOT use heavy Three.js shaders or 3D models for this background layer. Keep it pure canvas 2D for 60fps performance across all devices.
- ❌ Do NOT block page scrolling or capture pointer events (`pointer-events-none`).
- ❌ Do NOT add text or page content inside this canvas component.

### Documentation Injection
```typescript
// Canvas Particle Properties:
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
```

### Action Items
1. Create `src/components/canvas/ParticleGalaxy.tsx`.
2. Implement canvas resize listener adhering to window size and `Math.min(window.devicePixelRatio, 2)`.
3. Generate ~100–140 randomized particles with varying opacities and subtle cyan/purple/white hues.
4. Add mouse tracking with interpolated deflection: when the cursor moves across the viewport, nearby particles experience subtle repulsion and dampening.
5. Draw faint connection lines between particles that are within distance threshold (<90px) to simulate a neural network mesh.
6. Performance optimization:
   - Cancel `requestAnimationFrame` on component unmount.
   - Pause the animation loop when document visibility changes (`document.hidden`).
7. Mount `<ParticleGalaxy />` in `App.tsx` as a fixed full-screen background layer (`fixed inset-0 pointer-events-none -z-10`).

### Visual Grounding & Acceptance Checklist
- Visual Target: Observe the subtle starfield and cosmic depth behind the UI in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Particles render smoothly without lag or high CPU usage.
- [ ] Canvas resizes cleanly on window resize without distortion.
- [ ] Background is non-interactive to clicks (`pointer-events: none`).
