# 🎯 Phase 1 Specification: Empty World

## Goal
Prove that Three.js and the browser verification harness work end-to-end. Render a sky and one plain colored cube, with baseline movement and DOM contract hooks exposed.

## Requirements
1. **Three.js Setup:** Load Three.js from CDN (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`) in a single self-contained `index.html`.
2. **Visuals:**
   - Flat blue sky background (`#5c94fc` or similar Minecraft day sky color).
   - One plain colored cube (untextured, e.g., emerald green `#2ecc71` or gold `#f39c12`) positioned at $(0, 0.5, 0)$.
   - Baseline lighting (directional light from top-left + ambient light).
3. **Player & Movement:**
   - Player position represented at $(0, 1, 5)$ looking toward the cube.
   - Responds to `W`, `A`, `S`, `D` keys by translating the player position and camera.
4. **Contract Hooks:**
   - Expose `window.__game` with:
     - `player: { position: { x, y, z } }`
     - `buildings: []`
     - `activePanel: null`
   - Log `"READY"` to the console once initial render loop is active.
5. **DOM Hooks:**
   - `#hud` – Overlay container with crosshair and status stub.
   - `#panel` – Modal window (hidden by default).
   - `#panel-title` – Header title within the panel.
   - `#panel-close` – Clickable button that closes the panel.
   - Toggling: Pressing `KeyE` opens `#panel` (`activePanel = "spawn"`); pressing `Escape` or clicking `#panel-close` closes `#panel` (`activePanel = null`).

## Done Criteria
1. WebGL `<canvas>` renders cleanly.
2. The blue sky and colored cube are visible.
3. Automated Playwright checks pass all criteria with 0 console errors.
