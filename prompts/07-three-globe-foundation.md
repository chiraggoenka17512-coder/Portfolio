Read AGENTS.md first and follow it strictly.

# Prompt 07: Three.js Spatial Globe — Procedural WebGL Foundation

### Goal
Implement a high-performance procedural Three.js WebGL canvas in `src/components/canvas/InteractiveGlobe.tsx` featuring a Fibonacci particle star-globe, inner wireframe core, orbital atmospheric glow ring, and safe lifecycle disposal, adhering to Impeccable performance and UI/UX Pro Max zero-layout-shift standards.

### Standards & Skills Integration
* **Performance & Hardware Acceleration**:
  - Pure procedural geometry (Fibonacci spiral distribution) — **0 kB** external asset downloads.
  - Safe DPR clamping: `Math.min(window.devicePixelRatio || 1, 2)` to protect mobile GPUs from thermal throttling.
  - Frame budget: 60fps steady; pause RAF on blurred tabs or when canvas is unmounted.
* **UI/UX Pro Max (Zero Layout Shift)**:
  - Fixed aspect ratio placeholder (`aspect-square max-w-[480px] w-full`) ensuring CLS < 0.01 while WebGL initializes.
  - Graceful glowing shimmer backdrop during initialization.
* **Emil Kowalski Polish**:
  - Smooth continuous rotational physics without jerky starts.
  - Color harmony: deep cyan (`#00f2fe`) and indigo glow matching the Deep Space palette.
* **Impeccable Craft**:
  - Full WebGL resource teardown on unmount (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`) to guarantee zero memory leaks.

### Negative Constraints
- ❌ Do NOT import multi-megabyte GLTF or OBJ models.
- ❌ Do NOT cause WebGL context losses or retain event listeners on unmount.
- ❌ Do NOT implement location markers or drag interaction yet (reserved for Prompt 08).

### Documentation Injection
```typescript
import * as THREE from 'three';

// Procedural Fibonacci Sphere Points Generation:
export const createFibonacciSphere = (samples: number, radius: number): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1); // Golden angle
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
};
```

### Action Items
1. Create `src/components/canvas/InteractiveGlobe.tsx`.
2. Configure Three.js canvas lifecycle:
   - Mount `<canvas ref={canvasRef} />` inside a responsive wrapper.
   - Initialize `THREE.PerspectiveCamera`, `THREE.Scene`, and `THREE.WebGLRenderer` with `antialias: true` and `alpha: true`.
3. Construct procedural meshes:
   - Outer point cloud: ~1,200 particle vertices via Fibonacci distribution on a sphere (radius ~3.2).
   - Points material: `THREE.PointsMaterial` with color `#00f2fe`, size `0.045`, transparent with blending.
   - Inner core: `THREE.SphereGeometry` with low opacity wireframe (`color: #1e1b4b`, `opacity: 0.12`).
   - Atmosphere ring: Outer halo ring using transparent circular sprite or ring geometry.
4. Auto-rotation on the Y-axis with smooth constant angular velocity.
5. ResizeObserver on parent element for responsive re-computation.
6. Mount `<InteractiveGlobe />` into the right-hand container of `src/components/sections/Hero.tsx`.

### Visual Grounding & Acceptance Checklist
- Visual Target: Refer to the luminous 3D dotted globe with glowing orbital halos in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Globe renders smoothly in the Hero container without layout shift.
- [ ] Auto-rotation runs at a steady 60fps with low GPU overhead.
- [ ] Comprehensive WebGL cleanup verified on component unmount.
