# 🎯 Phase 2 Specification: Floating Island with Face Shading

## Goal
Transform the empty world into a multi-layered 3D floating island built from voxel cubes with authentic directional face shading and an orbitable third-person camera.

## Requirements
1. **Island Voxel Structure:**
   - Build a floating island with natural depth:
     - **Top Layer ($y = 0$):** Grass blocks (vibrant grass green top `#5fa83b`, earth brown sides `#79553a`, dark brown bottom `#543d2b`).
     - **Sub-surface Layer ($y = -1$):** Dirt blocks (earth brown `#79553a`).
     - **Underbelly / Keel Layers ($y = -2$ down to $-4$):** Stone blocks (slate grey `#6b7280` / `#4b5563`), tapering inward as it descends to create a natural floating landmass shape.
   - Scale: The island should span at least $30 \times 12$ blocks (oriented west-to-east along the X-axis) to prepare for the linear building tour.
   - Use `THREE.InstancedMesh` (or efficient batched geometry) for high performance so all blocks render in minimal draw calls.

2. **Directional Face Shading:**
   - Shading must be directional and consistent with Minecraft conventions:
     - **Top faces ($+Y$):** Brightest (multiplier $1.0$).
     - **Side faces ($\pm X, \pm Z$):** Medium tone (multiplier $0.7$–$0.8$).
     - **Bottom faces ($-Y$):** Darkest tone (multiplier $0.4$–$0.5$).
   - Directional light placed at top-left (`[-15, 30, 20]`) with soft ambient lighting so all faces have clear depth from every angle.

3. **Camera & Movement:**
   - **Player & Gravity/Surface Collision:** Player stands atop the island at $y = 1.0$ (ground level $y = 0$).
   - **WASD Movement:** Translates the player across the island surface relative to the camera direction.
   - **Orbit Camera:** Left-click mouse drag orbits the camera around the player; mouse wheel zooms follow distance.

4. **Contract Hooks & State:**
   - `window.__game`:
     - `player.position: { x, y, z }`
     - `island: { blockCount, dimensions }`
     - `buildings: []`
     - `activePanel: null`
   - Log `"READY"` to the console upon scene initialization.

5. **DOM Elements:**
   - `#hud`: Instructions & crosshair overlay.
   - `#panel`: Modal window (hidden by default).
   - `#panel-title`: Title element.
   - `#panel-close`: Close button.
   - `KeyE` opens `#panel` (`activePanel = "spawn"`), `Escape` or `#panel-close` closes `#panel` (`activePanel = null`).
   - Movement is paused while `#panel` is open.

## Done Criteria
1. The floating island renders with grass, dirt, and stone layers visible from above and below.
2. Directional face shading creates clear cube edges from every camera angle.
3. Automated Playwright checks pass (movement, camera orbit, panel open/close, 0 console errors).
