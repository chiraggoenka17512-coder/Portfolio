Read AGENTS.md first and follow it strictly.

# Prompt 16: Bundle Optimization, Lazy-Loading & Final Craft Polish

### Goal
Fine-tune bundle sizes with Rollup manual chunk splitting, implement dynamic `React.lazy` loading for 3D canvas components with glowing skeleton fallbacks, eliminate layout shifts, and run an exhaustive production build verification pass adhering to Impeccable and Emil Kowalski performance benchmarks.

### Standards & Skills Integration
* **Bundle Architecture & Chunk Splitting**:
  - Isolate heavy vendor packages (`three`, `framer-motion`, `lucide-react`) into dedicated vendor chunks in `vite.config.ts` to maximize browser caching and keep the entry bundle ultra-lean.
* **Emil Kowalski Perceived Performance & Skeleton Fallbacks**:
  - Lazy load `<InteractiveGlobe />` and `<ParticleGalaxy />` using `React.lazy()` and `React.Suspense`.
  - Provide a high-fidelity glowing skeleton fallback (`aspect-square max-w-[480px] w-full rounded-full glow-cyan-subtle animate-pulse-slow`) so visitors experience zero layout jump while WebGL shaders compile.
* **UI/UX Pro Max & CWV (Core Web Vitals)**:
  - Cumulative Layout Shift (CLS) < 0.02.
  - Largest Contentful Paint (LCP) < 1.5s.
  - First Input Delay / INP < 50ms.
* **Impeccable Final Craft Pass**:
  - Mobile responsiveness verification from 360px to 1920px (zero horizontal scroll).
  - Verify all outbound links (`https://labelsense.ai.studio`, GitHub, social profiles) have `rel="noopener noreferrer"`.
  - Verification of GitHub Pages base path readiness (`base: './'`).

### Negative Constraints
- ❌ Do NOT introduce flash-of-unstyled-content (FOUC); always provide an elegant skeleton while 3D components mount.
- ❌ Do NOT allow single bundle chunks to exceed 500kB uncompressed.
- ❌ Do NOT ship with unresolved TypeScript warnings or console errors.

### Documentation Injection
```typescript
// vite.config.ts Rollup Manual Chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'three-vendor': ['three'],
        'motion-vendor': ['framer-motion'],
        'icons': ['lucide-react'],
      },
    },
  },
}
```

### Action Items
1. In `vite.config.ts`, configure `rollupOptions.output.manualChunks` for `three`, `framer-motion`, and `lucide-react`.
2. In `src/App.tsx`:
   - Dynamically import heavy components via `React.lazy()`:
     ```tsx
     const ParticleGalaxy = React.lazy(() => import('@/components/canvas/ParticleGalaxy'));
     const InteractiveGlobe = React.lazy(() => import('@/components/canvas/InteractiveGlobe'));
     ```
   - Wrap slots with `React.Suspense` and render glowing shimmer fallbacks.
3. Test production build by executing `npm run build`:
   - Verify all chunks generate without warnings.
   - Verify output directory `dist/` contains all assets with relative links.
4. Final UX Polish:
   - Ensure smooth scrolling behavior across all browsers (`html { scroll-behavior: smooth; }`).
   - Validate on simulated mobile viewports (iPhone, Pixel) to verify zero horizontal scroll and fluid touch interactions.

### Visual Grounding & Acceptance Checklist
- Visual Target: Compare the final running application against `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] `npm run build` completes with optimized, cleanly split vendor chunks under 500kB.
- [ ] 3D globe loads gracefully without blocking initial text paint.
- [ ] Portfolio runs at a smooth 60fps with zero layout shifts (CLS < 0.02).
- [ ] Entire application is verified ready for deployment to GitHub Pages.
