Read AGENTS.md first and follow it strictly.

# Prompt 08: Three.js Spatial Globe — Momentum Physics & Kolkata Geo-Beacon

### Goal
Enhance `src/components/canvas/InteractiveGlobe.tsx` with tactile drag-to-rotate momentum physics, non-blocking touch interaction, pulsating geo-markers for **Kolkata, India**, glowing orbital connection arcs, and visibility-aware render pause, blending Three.js spatial engineering with Emil Kowalski interaction polish.

### Standards & Skills Integration
* **Emil Kowalski Tactile Physics**:
  - Pointer drag incorporates momentum and friction dampening (rotational velocity smoothly decays by `0.95` on release).
  - Cursor state feedback: `cursor-grab` on hover, `cursor-grabbing` on active drag.
  - Beacon pulse oscillates with smooth sine wave math rather than abrupt jumps.
* **UI/UX Pro Max (Touch Accessibility & Non-Blocking Scroll)**:
  - Add CSS `touch-action: pan-y` on canvas container so vertical swiping on mobile scrolls the page uninterrupted, while horizontal swiping rotates the globe.
  - Beacon label has high contrast readable tooltip (`📍 Lakshmipat Singhania Academy • Kolkata`).
* **Performance Guardrails (Zero Background CPU Drain)**:
  - `IntersectionObserver`: Pause `requestAnimationFrame` when the Hero section scrolls out of view.
  - Automatically resume rendering when the section re-enters the viewport.
* **Impeccable Storytelling**:
  - Spotlight the developer's exact home campus in **Kolkata, India** with a luminous beacon and orbital arcs radiating outward to global tech hubs.

### Negative Constraints
- ❌ Do NOT block page scrolling on mobile touch devices.
- ❌ Do NOT install heavy external OrbitControls; implement lightweight math directly.
- ❌ Do NOT leave the animation loop running when off-screen.

### Documentation Injection
```typescript
// Converting Lat/Long to 3D Cartesian Coordinates:
export function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
```

### Action Items
1. Add pointer interaction to `InteractiveGlobe.tsx`:
   - Track pointer down, move, and up events.
   - Calculate rotational velocity with friction decay (`velocity.x *= 0.95; velocity.y *= 0.95`).
   - Add `cursor-grab active:cursor-grabbing` styling.
2. Add Kolkata Geo-Beacon (Latitude 22.57° N, Longitude 88.36° E):
   - Place a glowing beacon mesh at the exact coordinates.
   - Render a pulsating wave ring that expands and fades out using sine oscillation in the render loop.
   - Position a floating glass pill badge: `📍 Lakshmipat Singhania Academy • Kolkata`.
3. Add 3–4 dynamic glowing bezier connection arcs linking Kolkata to global hubs (e.g. San Francisco, Tokyo, London) using `THREE.QuadraticBezierCurve3` with cyan/indigo vertex colors.
4. Add `IntersectionObserver` to halt the render loop whenever the hero section is not visible in the viewport.

### Visual Grounding & Acceptance Checklist
- Visual Target: Observe the connecting arcs and glowing orbital node markers surrounding the globe in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Dragging rotates the globe with natural physical momentum.
- [ ] Mobile vertical scrolling works without getting trapped on the canvas.
- [ ] Kolkata beacon pulses gracefully with visible school affiliation.
- [ ] Render loop pauses when scrolled past the hero section.
