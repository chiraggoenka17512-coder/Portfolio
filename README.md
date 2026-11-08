# 🎮 Chirag's Minecraft Portfolio // Realm of the Agentic Architect

Welcome to the official repository for **Chirag's Minecraft-Themed 3D Portfolio**.  
Engineered by **Chirag** — Class 9 Agentic Systems Architect & Engineer.

This portfolio merges retro **Minecraft voxel aesthetics** with **modern 3D WebGL (Three.js)** and **autonomous multi-agent engineering workflows**, presenting Chirag's signature systems in an interactive, explorable floating island world.

---

## 🌟 The High Concept

Instead of a generic flat SaaS portfolio, this portfolio is built as an interactive Minecraft world:
- **Environment:** A lush floating voxel island in a serene blue sky, flanked by drifting clouds and horizon fog.
- **Voxel Engine:** Powered by **Three.js** with directional face dimming, corner ambient occlusion, and $16 \times 16$ nearest-neighbor textures.
- **Controls & HUD:** Third-person follow camera, WASD / touch controls, jump physics, authentic Minecraft 9-slice inventory GUIs, villager-trade interaction cards, and a Level 9 XP bar.
- **Zero-Build Deployment:** Pure static web architecture (HTML5, Vanilla JS, Three.js via CDN), instantly deployable to GitHub Pages, Vercel, or Cloudflare Pages without bundlers.
- **Universal Fallback:** Seamless 2D interactive pixel-art UI for non-WebGL devices, low-power phones, and screen-reader accessibility.

---

## 🗺️ The World Layout & Linear Island Tour

The island is designed along a continuous west-to-east stone path (~12 blocks between structures) that walks visitors through Chirag's engineering achievements:

```
[Spawn: West] ─────────────────────────────────────────────────────────────► [East]
The Workshop  ──►  LabelSense  ──►  ReconOS  ──►  VibeLens  ──►  CrashLens  ──►  ATL Inventory OS
 (Meta Engine)     (Vision AI)     (Security)    (3D Topology)   (Telemetry)      (Robotics Lab)
```

---

## 🏰 The 6 Featured Stations & Architectural Metaphors

| Slot | Building / Project | Voxel Architecture | Minecraft Item & Rarity | Core Technical Innovation |
| :-: | :--- | :--- | :--- | :--- |
| **#0** | **The Workshop** | Stone-brick room with blueprint tables, skyward beacon beam, and villager engineer benches. | 🔨 **Crafting Table & Beacon**<br>*Epic (Purple)* | **Multi-Agent Orchestration:** Shows the autonomous agent factory (Planner, Builder, Reviewer, Evaluator) that generated, tested, and reviewed the portfolio itself. |
| **#1** | **LabelSense** | Vibrant market stall with an illuminated glass scanner counter and oak shelves. | 🧪 **Golden Apple**<br>*Epic (Purple)* | **Multimodal Vision AI:** Translates cryptic food additive numbers into plain language health risk assessments, tailored to user health profiles with instant Blinkit grocery alternatives. |
| **#2** | **ReconOS** | High spruce timber watchtower with a spyglass observation deck and rotating compass. | 🧭 **Autonomous Compass**<br>*Rare (Cyan)* | **Autonomous Reconnaissance:** Coordinates subagent swarms to map code attack surfaces, detect dependency drift, and generate proactive vulnerability patches. |
| **#3** | **VibeLens** | Towering obsidian monolith crowned with a floating, glowing 3D wireframe mesh. | 🔮 **Eye of Ender**<br>*Rare (Cyan)* | **3D Spatial Topology:** Visualizes tangled codebases as an interactive 3D callgraph galaxy; ReachableSec DAG callgraph analysis eliminates 85% of false-positive security alerts. |
| **#4** | **CrashLens** | Reinforced stone dam with active water flumes, telemetry gauges, and redstone fuse lines. | 🛡️ **Netherite Core**<br>*Epic (Purple)* | **Industrial Telemetry & De-Slop:** Eliminates pastel AI slop, parses catastrophic crash stacktraces into actionable blueprints, and halts cascade failures with circuit breakers. |
| **#5** | **ATL Inventory OS** | Organized warehouse storage hall with labelled double chests, barrels, and a central guide lectern. | 📦 **Chest & Lectern**<br>*Rare (Cyan)* | **Lab Hardware Inventory & Wiring AI:** Physical maker lab inventory manager combined with an interactive lectern guide that answers wiring questions with pinout diagrams. |

---

## 📐 Master Builder Design Principles (Embedded Rules)

Built according to the proven principles of master Minecraft builders (BdoubleO100, Grian, fWhip, MythicalSausage, BlockWorks):
1. **Macro-Depth Before Micro-Detail:** Walls are never flat. Structural framing columns protrude 1 voxel; windows and doorways are recessed 1 block to cast natural geometric shadows.
2. **The 60-30-10 Palette Hierarchy:** 60% dominant stone/brick foundation, 30% structural wood framing/roof, and 10% high-contrast accents (lanterns, gold, obsidian).
3. **The Rule of Odds:** All building footprints use odd block dimensions ($5 \times 5$, $7 \times 9$, $11 \times 11$) to ensure clean 1-block centers for doorways and roof peaks.
4. **Hardcoded Directional Face Shading:** Minecraft's iconic lighting baked directly into vertex colors (Top: 100%, North/South: 80%, East/West: 60%, Bottom: 50%) with corner ambient occlusion, delivering 60 FPS on mobile.
5. **Telephoto Camera Framing:** Camera FOV clamped to $35^\circ$–$45^\circ$ to prevent spherical distortion and produce crisp isometric-adjacent diorama perspectives.

---

## ⚖️ Open-Source & Copyright Compliance

**100% Free of Mojang / Official Minecraft Game Assets.**  
No ripped textures, mod textures, or official game assets are used anywhere in this repository:
- **Primary Block Set:** [16x16 Block Texture Set](https://opengameart.org/content/16x16-block-texture-set) by ARoachIFoundOnMyPillow ([CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)).
- **Complementary Voxel Textures:** [Voxel Pack](https://kenney.nl/assets/voxel-pack) by Kenney ([CC0 1.0 Universal](http://creativecommons.org/publicdomain/zero/1.0/)).
- **Procedural Synthesized Tiles:** Chests, barrels, lectern, and lantern synthesized procedurally under CC0.
- See [`CREDITS.md`](file:///d:/Portfolio/CREDITS.md) for full licensing documentation.

---

## 📁 Repository Directory Structure

```
d:/Portfolio/
├── index.html                 # 2D Interactive UI prototype & 3D WebGL mount point
├── CREDITS.md                 # Permissive CC0 licenses & creator attributions
├── README.md                  # Master context and project documentation
├── data/
│   └── projects.json          # Single source of truth for all projects, copy, & trades
├── docs/
│   ├── BLUEPRINT.md           # Visual layout, flow charts, HUD specifications
│   ├── SPECIFICATION.md       # Full 10-part master architectural specification
│   ├── BUILDER_GUIDELINES.md  # Master builder rules, palettes, and Three.js tricks
│   └── concepts/              # Concept UI mockups and visual layout renders
├── media/                     # Rendered concepts, diagrams, and video clips
└── textures/                  # Verified CC0 16x16 textures & compiled atlas
    ├── atlas.png              # 256x256 px unified texture atlas (36 tiles)
    ├── atlas.json             # UV bounding coordinates for Three.js
    ├── compile_atlas.py       # Atlas build script
    ├── generate_complementary.py
    ├── primary_16x16_block_set/
    └── kenney_voxel_pack/
```

---

## 🚀 Execution & Implementation Roadmap

1. **Phase 1: Voxel World Engine (`js/world.js`)**
   - Initialize Three.js scene, sky gradient, clouds, and exponential fog.
   - Build floating grass/dirt/stone island using `THREE.InstancedMesh` indexed by `textures/atlas.json`.
   - Implement third-person player controller with walk/jump animations and mouse orbit camera.
2. **Phase 2: Building Matrix Parser (`js/buildings.js`)**
   - Render the 6 modular voxel structures from layered 3D matrices.
   - Add proximity detection and floating Minecraft nametags above entrances.
3. **Phase 3: Interactive Chest/Inventory Modal (`js/panel.js`)**
   - Implement the villager-trade UI, block-palette tech stack, and interactive demo containers.
   - Hook up pure Web Audio synthesis for wooden block clicks and level-up chimes.
4. **Phase 4: Responsive & Fallback Layer (`js/fallback.js`)**
   - Touch controls for mobile.
   - Seamless 2D fallback map for low-spec devices and full accessibility keyboard navigation.
