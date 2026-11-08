# 🧭 AGENT HANDOFF: 3D Minecraft Portfolio Blueprint & Codebase Manual

> **Document Version:** 4.0  
> **Target Audience:** Incoming Autonomous Coding Agent / Engineer  
> **Status:** Architecture Solidified • Ready for Opening Flow, Color Remediation & Building Construction  

---

## 📌 1. Executive Summary & Core Mission

You are taking over the **3D Minecraft Portfolio** project. This is a fully interactive, in-browser 3D portfolio styled like authentic Minecraft, built in vanilla JavaScript using **Three.js (r128)**, running on an HTML5 WebGL canvas.

### The Vision
Instead of a static flat webpage or generic résumé, visitors explore a handcrafted, floating voxel landscape featuring broad meadows, birch and spruce groves, a winding diagonal river, and a rising mountain massif. Different facets of the creator's career are housed inside physical voxel buildings:
1. **Spawn Plaza & Guide Villager**: Onboarding and welcome.
2. **"About Me" House**: Personal story, engineering philosophy, and background.
3. **Projects District**: Individual bespoke voxel structures representing flagship AI and hardware projects.
4. **Contact Tower**: An elevated observation tower perched on the mountain ridge for inquiries, socials, and contact details.

---

## 🚨 2. CRITICAL USER DIRECTIVES (Read Before Coding!)

The user has explicitly given two vital instructions:

### Directive A: "Don't build anything right now."
This document serves as the master onboarding guide. Align with this architecture and the design blueprint before writing ad-hoc code.

### Directive B: Urgent Visual Remediation (Colors & Textures)
> *"The colors look very desaturated and very pale, and the textures are not at all close to Minecraft. Remember to change those."*

#### What Went Wrong:
1. **Paleness & Desaturation**: The atmospheric lighting (directional key light + hemisphere fill + post-filter) currently bleaches out the terrain. The textures lack the punchy, rich, earthy saturation that characterizes Minecraft (e.g. lush foliage green `#598f32`, warm loamy dirt `#866043`, crisp stone `#7d7d7d`).
2. **Texture Fidelity**: The current procedural textures have too little contrast between neighboring texels or use non-standard tones. They must be upgraded to **authentic 16×16 Minecraft pixel-art palettes** with punchy micro-contrast, zero blur (`THREE.NearestFilter`), and proper voxel block face luminance.

---

## 📂 3. Complete Codebase Architecture & File Map

```
d:\Portfolio\
├── index.html                           # Main entry point, DOM overlays, loop, renderer & state contract
├── textures\
│   ├── natural_landscape.js             # 50x36 Voxel terrain generator, river valley, mountains, water, vegetation
│   ├── voxel_trees.js                   # Procedural birch & spruce trees (THREE.InstancedMesh)
│   ├── landscape_camera_haze.js         # Camera optics, dual-tone lighting, atmospheric haze
│   ├── workshop_building.js             # Architectural building generator module
│   ├── terrain_ponds.js                 # Legacy island generator (retained for reference)
│   ├── sunset_sky.js                    # Legacy sunset shader (retained for reference)
│   └── primary_16x16_block_set\         # 16x16 Pixel Art PNG textures
│       ├── grass_top.png, grass_side.png, dirt.png, stone_generic.png, cobblestone.png
│       ├── sand.png, gravel.png, oak_planks.png, oak_log_side.png, oak_log_top.png
│       ├── tall_grass.png, flower_yellow.png, flower_red.png, flower_white.png, bush.png
│       └── lantern.png, chest_front.png, lectern_top.png, barrel_side.png
├── loop\
│   ├── daytime_landscape_check.js       # Playwright automated QA verification test runner
│   ├── report.json                      # Automated test output report
│   └── shots\
│       └── 01_daytime_landscape_spawn.png # Reference screenshot of the current spawn view
├── apply_daytime_sky.py                 # Atomic Python patch script
└── integrate_natural_landscape.py       # Atomic Python landscape integration script
```

---

## ⚙️ 4. How It Works: Runtime Technical Reference

### 4.1 Coordinate System & Spatial Conventions
* **Engine**: Three.js r128 (imported via CDN in `index.html`).
* **Axes**:
  * `+X` = Right / East
  * `+Y` = Up / Altitude (Elevation)
  * `+Z` = Behind Player / South (Spawn meadow is at positive Z)
  * `-Z` = Forward / North (Camera faces `-Z` toward the river and distant mountain)
* **Block Dimensions**: Each voxel block is strictly `1.0 × 1.0 × 1.0` Three.js world units.

### 4.2 The Global Contract State Object (`window.__game`)
`index.html` exposes `window.__game` as the single source of truth:
```javascript
window.__game = {
  player: {
    position: { x: 0, y: 3.0, z: 8.0 },
    yaw: 0,
    isGrounded: true,
    screenHeightRatio: 0.20 // Player takes ~20% of vertical screen height
  },
  island: {
    blockCount: 10097,
    dimensions: { x: 50, z: 36 },
    landscapeData: { ... }, // Exported from natural_landscape.js
    treeData: { ... }       // Exported from voxel_trees.js
  },
  cinematic: {
    introPlaying: false,
    cameraY: 7.2,
    fov: 60,
    pitchDegrees: 20.0,
    textureMode: 'pixel_art_16x16',
    faceLuminance: { top: 1.05, side: 0.78, shadow: 0.60, bottom: 0.38 }
  },
  buildings: [],            // List of registered interactive buildings
  activePanel: null         // Currently open modal dialog or null
};
```

### 4.3 Camera Framing Optics
* **FOV**: 60.0 degrees (`PerspectiveCamera(60, aspect, 0.1, 1200)`).
* **Position**: $(0, 7.2, 17.5)$ — 4.2 blocks above ground, 9.5 blocks behind player $(0, 3.0, 8.0)$.
* **Pitch Angle**: Downward tilt of $20.0^\circ$ ($0.349$ rad).
* **Horizon Placement**: Projected at $Y \approx 188\text{px}$ from the top on 720p (upper third), ensuring 3 visible depth layers:
  1. *Foreground* ($Z \in [4, 12]$): Player spawn, wildflower meadow, sand riverbank.
  2. *Midground* ($Z \in [-4, 2]$): Diagonal blue river, birch trees, and bridge crossing.
  3. *Background* ($Z \in [-22, -6]$): Rising mountain bluff with stone cliffs, spruce trees, and sky horizon.

### 4.4 Shading & Voxel Textures
* **Filtering**: All voxel textures must enforce:
  ```javascript
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  ```
* **Directional Shading**: In `textures/natural_landscape.js`, voxels use a 6-material array:
  * Top face (`+Y`): `1.05` multiplier (bright direct sunlight)
  * Front face (`+Z`): `0.78` multiplier (sun-facing side)
  * Side faces (`+X`): `0.78` multiplier
  * Shadow faces (`-X`, `-Z`): `0.60` multiplier (darkened shadow side for block separation)
  * Bottom face (`-Y`): `0.38` multiplier (ambient occlusion underbelly)

---

## 🎨 5. The Desaturation Fix: Authentic Minecraft Palette Spec

To satisfy Directive B, replace pale/washed-out materials with authentic Minecraft colors:

| Block Type | Face | Authentic Hex | Tone Character |
| :--- | :--- | :--- | :--- |
| **Grass Block** | Top (`+Y`) | `#598f32` (Lush Forest) or `#6aa136` | Punchy green, yellow-tinted highlights, micro-dithered |
| **Grass Block** | Sides | `#866043` dirt base + `#598f32` fringe | 3-4 pixel jagged overhang fringe |
| **Dirt** | All Faces | `#866043` / `#735135` | Rich earthy loamy brown with dark gravel speckles |
| **Stone** | All Faces | `#737373` / `#616161` | Medium neutral stone grey with darker flecks; no beige/blue tint |
| **Sand** | All Faces | `#dbcb98` / `#cfbf87` | Warm pale golden desert sand; not bleached white |
| **Gravel** | All Faces | `#857d7b` / `#736c6a` | High-contrast flecked pebble grey |
| **Oak Planks** | All Faces | `#a68352` / `#947243` | Warm golden-tan timber with horizontal wood grain lines |
| **Oak Logs** | Side / Rings | `#6d5332` bark / `#a98b58` core | Dark furrowed bark with pale annual growth rings |
| **River Water**| Top Quad | `#236ebd` (Opacity `0.85`, Emissive `#0a2d52`) | Vibrant saturated sapphire blue, darker than sky |

> **Shader/Filter Note:** Remove or calibrate CSS `filter: saturate(...) contrast(...)` on `#canvas-container canvas` so colors are authentic directly in WebGL textures rather than artificially distorted in DOM post-processing.

---

## 🏛️ 6. The Portfolio Opening & Exploration Blueprint

The user specified a **7-layered approach** to make open exploration intuitive from the first 5 seconds.

```
                  ┌──────────────────────────────────────────────┐
                  │ 1. OPENING MOMENT: Title Card & Quick Skip   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ 2. SPAWN PLAZA: Villager NPC & Welcome Sign  │
                  │    "Each building is a part of my work..."   │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │ 3. OBJECTIVE HUD / QUESTS │                   │ 4. VISIBLE BEACON/COMPASS │
   │  "Visit About Me House"   │                   │  Direction without gating │
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │ 5 & 7. "WHO I AM" HUB: About Me House (Immediate next stop near spawn)    │
   │        Sign: "About Me: Background, philosophy & what I'm building"       │
   └─────────────────────────────────────┬─────────────────────────────────────┘
                                         │
                                         ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │ 5. PROJECTS DISTRICT: Individual bespoke buildings (AI, Hardware, Tools)  │
   │    Signs on every door: Problem solved + Proximity [E] to Enter           │
   │    6. MINIMAP: Fog of war lifts & marks buildings as discovered           │
   └─────────────────────────────────────┬─────────────────────────────────────┘
                                         │
                                         ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │ 5. CONTACT TOWER: Mountain Peak Observation Tower (Resume, Links, Mail)   │
   └───────────────────────────────────────────────────────────────────────────┘
```

### Detailed Layer Specifications:

#### Layer 1: Opening Moment (First 3 Seconds)
* **Component**: Fullscreen semi-transparent overlay title card.
* **Content**:
  * Title: **[CREATOR NAME]**
  * One-line role: *"Builder of AI and hardware projects"*
  * Context: *"A playable 3D voxel portfolio. Explore the world to discover my work."*
  * Quick-controls legend: `WASD: Move` • `Mouse: Look / Orbit` • `E: Enter & Inspect`
  * Action buttons: `[Start Exploring (Space)]` and `[Skip to Interactive Map / List]`
* **Behavior**: Fades out smoothly on Space / click / first WASD press.

#### Layer 2: Guide Character at Spawn
* **Component**: A blocky, villager-style NPC standing on the spawn cobblestone pad at $(0, 2, 6)$ facing the player.
* **Visual**: Brown robe, beige head, crossed arms, gentle idling bobbing animation.
* **Proximity Interaction**: When player is within 2.5 blocks, a clean Minecraft speech bubble / dialog box opens:
  > *"Greetings! Welcome to my portfolio island. Each building represents a part of my work. Walk up to any door and press **E** to enter and explore the details."*
* **Purpose**: Teaches the mechanics naturally in-world without requiring external documentation.

#### Layer 3: Quest Log / Objective HUD
* **Component**: A clean, compact Minecraft-themed parchment or dark glass HUD widget pinned to the top-left or top-right.
* **Progression (Non-gated)**:
  * Objective 1: `[ ] Visit the About Me House`
  * Objective 2: `[ ] Explore the Projects District (0/3)`
  * Objective 3: `[ ] Ascend the Mountain Contact Tower`
* **Rule**: Objectives automatically check off as the player visits corresponding zones. Visitors can freely wander anywhere at any time.

#### Layer 4: Visible Landmarks & Compass
* **Flagship Beacon**: Erect a golden obsidian/beacon pillar with an upward glowing vertical light beam on the flagship project building in the Projects District, clearly visible across the river from spawn.
* **Compass HUD**: A classic Minecraft circular compass widget in the hotbar (slot 9) or top compass strip whose needle always dynamically rotates to point toward the active objective.

#### Layer 5: Signs on Every Building Entrance
* **Component**: Hanging wooden sign block mounted adjacent to every entrance door.
* **Sign Content Format**:
  * Line 1: `[Building Name]` (e.g. *LabelSense AI*, *ATL Inventory*)
  * Line 2: `[One-line Problem & Solution]` (e.g. *"Autonomous CV pipeline for warehouse logistics"*)
* **Proximity Prompt**: Floating tooltip `[Press E to Inspect]` appears when the player is within 2.5 blocks of the entrance.

#### Layer 6: Minimap with Discovered Locations
* **Component**: Small circular or square minimap in the top corner (toggleable with `M`).
* **Display**:
  * Top-down 2D orthographic canvas rendering the island outline.
  * Player indicator arrow (showing position and yaw).
  * Icons for buildings: Grey `?` icon when undiscovered $\rightarrow$ Golden badge with checkmark once entered.

#### Layer 7: "Who I Am" Hub Near Spawn
* **Location**: Situated immediately along the cobblestone path at $(-6, 3, 4)$, reachable in 3 seconds from spawn.
* **Building Style**: Cozy timber-framed cottage with pitched plank roof, glass pane windows, and a warm interior lantern.
* **Interior**: Interactive lectern and framed posters containing:
  * Creator's background, journey, and technical strengths.
  * Current technical focus (AI models, robotics, edge computing).
  * Link to downloadable résumé PDF.

---

## 🗺️ 7. Master Island Layout & Coordinate Blueprint

The 50×36 voxel island is partitioned into four deliberate districts:

```
                  Z = -22 (North)
  ┌────────────────────────────────────────────────────────┐
  │ [CONTACT TOWER]                                        │
  │ High Mountain Ridge                                    │
  │ X: -14 to -8, Z: -18 to -12, Y: 8..15                  │
  │                                                        │
  │                         [PROJECTS DISTRICT]            │
  │                         Rolling Hill Valley            │
  │                         Building 1: (6, 3, -12)        │
  │                         Building 2: (14, 4, -10) BEACON│
  │                         Building 3: (18, 3, -4)        │
  │~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│
  │ RIVER VALLEY (Translucent Blue Water at Y = 0.85)      │
  │ Diagonal: (-22, 1) to (28, -3), Width: 4..6 blocks     │
  │~~~~~~~~~~~~~~~~~~~~~[COBBLE BRIDGE]~~~~~~~~~~~~~~~~~~~~│
  │                     Bridge: (0, 2, 0)                  │
  │                                                        │
  │ [ABOUT ME HOUSE]                                       │
  │ Timber Cottage                                         │
  │ X: -8 to -4, Z: 2 to 6, Y: 2..5                        │
  │                          [SPAWN PLAZA]                 │
  │                          Player Spawn: (0, 3, 8)       │
  │                          Guide Villager: (0, 2, 6)     │
  │                          Wildflower Meadow             │
  └────────────────────────────────────────────────────────┘
                  Z = +14 (South)
```

---

## 🛠️ 8. Step-by-Step Implementation Roadmap for Next Agent

When approved to build, follow this sequence:

### Phase 1: Color & Texture Punch-Up (Directive B)
1. **Calibrate Textures**: Ensure `primary_16x16_block_set` images have authentic high-contrast Minecraft tones.
2. **Remove Washed-Out Shading**: In `textures/natural_landscape.js` and `textures/landscape_camera_haze.js`:
   * Set key light to `#fff2db` (intensity 1.25).
   * Set hemisphere light to `#8ec0ed` (sky) and `#4f7529` (ground), intensity 0.65.
   * Verify face contrast between top, side lit, and side shadow.

### Phase 2: Opening Moment & Guide Villager (Layers 1 & 2)
1. Build Title Card overlay in `index.html` with skip button and controls guide.
2. Add procedural Villager NPC at $(0, 2, 6)$ in `natural_landscape.js` with idle head-bob and proximity dialogue bubble.

### Phase 3: Objective HUD & Dynamic Compass (Layers 3 & 4)
1. Create lightweight `#objective-hud` in HTML/CSS.
2. Add hotbar slot 9 Compass item whose icon angle rotates to track active objective.
3. Add vertical beacon beam at $(14, 4, -10)$.

### Phase 4: Construct Buildings with Signs & Proximity Prompts (Layers 5 & 7)
1. Build **About Me House** at $(-6, 2, 4)$ using oak planks, cobblestone foundation, and glass.
2. Build **Projects District** (3 distinct structures) across the river bridge.
3. Build **Contact Tower** on the high mountain peak at $(-12, 8, -14)$.
4. Add entrance signs with one-line descriptions and `[E] Enter` trigger zones.

### Phase 5: Minimap & Verification (Layer 6)
1. Implement 2D canvas minimap showing player arrow and discovered building badges.
2. Run automated verification with Playwright test runner (`node loop/daytime_landscape_check.js`) and record 60 FPS performance.

---

## 🏁 9. Definition of Done Checklist

- [ ] All block textures look authentically Minecraft with rich saturation, not pale or desaturated.
- [ ] Title card introduces creator and role, with immediate skip option.
- [ ] Villager NPC at spawn explains the world mechanics via speech bubble.
- [ ] Objective log guides visitor through About Me, Projects, and Contact Tower.
- [ ] Beacon beam is visible from spawn pointing to the flagship project.
- [ ] Every building has a sign with a problem/solution summary and proximity prompt.
- [ ] Minimap tracks discovered landmarks.
- [ ] 0 console errors; steady 60 FPS on desktop and mobile.

---

## 🔁 10. The Agent Loop: Autonomous Closed-Loop Engineering System

This codebase is governed by an **Eval-Driven Agent Loop**. Autonomous agents working on this project must never rely on self-assertion or assume a visual change works. Every feature, bug fix, or refactor must run through the automated feedback loop.

### 10.1 The 5-Stage Agent Loop Lifecycle

```
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. SPECIFY (`loop/spec.md`)                                 │
  │    Write measurable criteria: colors, bounds, pixel bands   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. IMPLEMENT (`textures/<module>.js`)                       │
  │    Isolated single-file module (Zero Merge Conflicts)       │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. VERIFY VIA HEADLESS BROWSER (`node loop/<test>.js`)      │
  │    Playwright captures screenshot, decodes pixels & scene   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. REPORT & GATE CHECK (`loop/report.json`)                 │
  │    Check: All pass? (8/8)                                   │
  └──────────────┬───────────────────────────────┬──────────────┘
                 │ (FAIL)                        │ (PASS)
                 ▼                               ▼
  ┌───────────────────────────────┐ ┌───────────────────────────┐
  │ 5a. SURGICAL FIX              │ │ 5b. ATOMIC COMMIT & PUSH  │
  │     Inspect report detail,    │ │     git add & commit      │
  │     fix root cause, re-run    │ │     git push origin main  │
  └──────────────┬────────────────┘ └───────────────────────────┘
                 │                               │
                 └───────────────────────────────┘
```

### 10.2 Non-Conflicting Multi-Agent Execution Rules
When deploying multiple subagents in parallel (e.g., one agent on the Villager NPC, one on the Objective HUD, one on Building Architecture):
1. **Strict File Isolation**: Each subagent owns **exactly one new file** in `textures/` (e.g. `textures/guide_villager.js`, `textures/objective_hud.js`, `textures/portfolio_structures.js`).
2. **Never Edit `index.html` in Parallel**: Subagents must not write to `index.html`. Only the lead orchestrator or an atomic integration script wires completed modules into `index.html`.
3. **Universal Export Contract**: Every module must export a universal UMD / browser global factory function:
   ```javascript
   (function (root, factory) {
     if (typeof module === 'object' && module.exports) module.exports = factory();
     else root.ModuleName = factory();
   }(typeof self !== 'undefined' ? self : this, function () {
     return { init, update, dispose };
   }));
   ```

### 10.3 The Verification Engine (`loop/`)
* **Local HTTP Daemon**: Runs in background on `http://localhost:8000` (`python -m http.server 8000`).
* **Playwright Test Runner**: Uses Node.js + Playwright Chromium (`node loop/<phase>_check.js`).
* **In-Browser Pixel & Scene Evaluation**:
  ```javascript
  // Decode screenshot to HTML5 canvas and analyze real pixels
  const imgData = ctx.getImageData(0, 0, width, height).data;
  // Verify color spaces (HSV/HSL), luminance thresholds, and scene contract
  const sceneState = await page.evaluate(() => window.__game);
  ```
* **Structured Output (`loop/report.json`)**:
  ```json
  {
    "checks": [
      { "name": "sun disc visible in upper sky", "pass": true, "detail": "1402 bright pixels near (792, 5)" },
      { "name": "water pixels darker than sky", "pass": true, "detail": "Water lum: 47.4% vs Horizon: 79.4%" },
      { "name": "no console errors", "pass": true, "detail": "Zero console errors" }
    ],
    "consoleErrors": [],
    "screenshots": ["loop/shots/01_daytime_landscape_spawn.png"],
    "passed": true
  }
  ```

### 10.4 The Hard Stop Gate
An agent's task is **NOT DONE** until:
1. `node loop/<phase>_check.js` exits with code 0 and logs `REPORT: PASS (N/N)`.
2. `loop/report.json` contains `"passed": true` and `"consoleErrors": []`.
3. A visual screenshot is preserved in `loop/shots/` as proof.
4. Changes are committed and pushed to `origin main`.

