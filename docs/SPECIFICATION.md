# 🗺️ Minecraft Portfolio Master Specification & Architecture Plan
**Author:** Chirag (Class 9 Agentic Systems Architect & Engineer)  
**Target:** Three.js 3D Floating Island Portfolio with 2D GUI Fallback  

---

## 1. The World
- **Setting:** One floating island in a clear sky, built from grass, dirt, and stone blocks. Small enough to walk across end-to-end in about one minute.
- **Style:** Blocks are $1 \times 1$ cubes with $16 \times 16$ pixel textures.
- **Shading:** Directional face shading (top brightest, sides medium, bottom darkest). Textures use **nearest-neighbour (`THREE.NearestFilter`)** filtering so pixel edges remain crisp.
- **Sky:** Flat blue gradient with clouds drifting slowly across the upper atmosphere. Short distance fog at the island's perimeter cleanly fades into the sky.
- **Camera:** Third-person follow camera, positioned behind and slightly above the player character, matching Minecraft's perspective. The visitor can orbit the camera using mouse drag or touch drag.
- **Player:** Simple blocky character model featuring a walking leg/arm cycle and jump animation.
- **Controls:**
  - **Desktop:** `WASD` or Arrow keys to move, `Space` to jump, Mouse drag to orbit/rotate camera, `E` or `Click` to interact with a building/station, `Esc` to close any open UI panel.
  - **Mobile / Touch:** Tap-to-move indicator on the ground, on-screen joystick pad, floating action buttons for Jump and Interact.
- **HUD:** Pixel-font overlay with:
  - Bottom hotbar (keys `1` to `6` to instantly teleport / select each building).
  - Top status bar: 10 hearts (health) and 10 drumsticks (hunger), Level 9 glowing green XP bar.
  - Centered crosshair indicator.

---

## 2. World Layout

The floating island is arranged as a **linear progression** (west-to-east path) rather than an arbitrary circle, giving the visitor an intuitive, guided walkthrough:

```
[West] ─────────────────────────────────────────────────────────────► [East]
Spawn (Workshop) ──► LabelSense ──► ReconOS ──► VibeLens ──► CrashLens ──► ATL Inventory OS
```

- Each building stands approximately **12 blocks apart**.
- An organic stone pathway connects the structures.
- A wooden standing sign at the spawn point reads: **"Chirag // Build Log"**.

---

## 3. The 6 Buildings & Architectural Symbolism

| # | Station / Project | Building Concept | Primary Voxel Materials | Symbolic Meaning |
| :-: | :--- | :--- | :--- | :--- |
| **0** | **The Workshop**<br>*(Multi-Agent Orchestration)* | Crafting-table room with a blueprint table, beacon beam on roof, and agent villagers at workbenches. | Crafting table, beacon, lectern, stone bricks. | Shows the meta-process: how all the other builds and systems were planned, generated, and verified. |
| **1** | **LabelSense** | Market stall with a glowing glass scanner window and shelves. | Glass panes, oak shelves, warm lanterns, wood planks. | Represents reading and parsing food packaging in real time. |
| **2** | **ReconOS** | Spruce watchtower with a high spyglass observation deck and a compass block on top. | Spruce logs, scaffolding, compass block, stone brick base. | Scout outpost symbolizing autonomous subagent swarms surveying code attack surfaces. |
| **3** | **VibeLens** | Tall obsidian monolith tower crowned with a floating, glowing 3D wireframe mesh. | Obsidian, crying obsidian / glowing frame blocks. | Represents source code visualised as an interactive 3D spatial topology graph. |
| **4** | **CrashLens** | Industrial stone dam with a telemetry gauge wall and illuminated fuse/redstone lines. | Stone bricks, water channel, gauge blocks, redstone lines. | A sturdy dam halting cascading system failures and stack trace floods. |
| **5** | **ATL Inventory OS** | Spacious warehouse storage hall with labelled double chests, barrels, item frames, and an interactive guide lectern. | Chests, barrels, item frames, oak lectern. | Hardware components organized in physical storage, coupled with an interactive wiring AI guide. |

*Note:* Each building is defined in code by a discrete layered matrix (slice-by-slice voxel array in `js/buildings.js`) so layouts are modular and simple to edit.

---

## 4. The Visitor's Journey & Interaction Flow
1. **Spawn:** Visitor spawns in The Workshop at the west end. A welcoming tutorial panel automatically opens once, explaining Chirag's agentic engineering method, then can be dismissed.
2. **Pathfinding:** Visitor traverses eastward along the stone trail. As they approach within 3–4 blocks of any building, a floating pixel name tag animates into view above the doorway.
3. **Inspection:** Pressing `E`, clicking, or tapping the building opens the deep-dive **Project Panel**. The 3D world pauses or stays softly visible through a blurred/translucent Minecraft vignette behind the modal.
4. **Engagement:** Visitor browses villager trade use cases, block-palette tech stack, interactive demo media, agent credentials, and live links.
5. **Resume / Fast-Travel:** Pressing `Esc` or clicking `[X]` closes the panel and returns control to the player. The visitor can continue walking or press hotbar keys `1`–`6` to instantly warp between buildings.

---

## 5. The Project Panel (Inventory / Chest Architecture)

Styled authentically after a Minecraft GUI container dialog:
1. **Header:** Project title, one-line value proposition, and an enchanted voxel block icon.
2. **Use Cases as Villager Trades:** 2–3 cards formatted as `[Input Item]` ➔ `[Output Result]`.
   - *Example (LabelSense):* `[Cryptic Jargon Label]` ➔ `[Plain-Language Health Report]`.
   - *Example (VibeLens):* `[Flat Static Repo Scan]` ➔ `[ReachableSec 3D Topology + 85% Noise Reduction]`.
3. **Tech Stack as Block Palette:** Each technology is represented by a 16×16 block texture tile. Hovering reveals the framework/tool name and category (e.g. Languages = Oak, Frameworks = Iron, AI Tools = Lapis/Redstone).
4. **Interactive Demo Container:** Project-tailored interactive media format (see Section 6).
5. **Built By (Agent Attestation):** Clear statement of agent roles and verification rigor (e.g. *"Planned by Architect subagent, eval-tested and reviewed before merge"*).
6. **Build Log Milestones:** Row of redstone lamps—lit lamps represent completed production milestones, unlit lamps represent upcoming roadmap items.
7. **Action Links:** Minecraft wooden sign buttons linking to GitHub repository, live web app, demo clips, and technical writeups.

---

## 6. Project Demo Formats

| Project | Demo Presentation Format | Implementation Details |
| :--- | :--- | :--- |
| **LabelSense** | Mobile phone viewport with screenshot carousel | Interactive swipeable slides displaying label capture, ingredient OCR, health risk score, and Blinkit grocery overlay. |
| **ReconOS** | CRT/Retro terminal CLI playback | Typing animation replaying real CLI execution: subagents surveying attack surfaces, mapping ports, and reporting vulnerabilities. |
| **VibeLens** | Embedded 3D interactive viewer or looping clip | Orbitable 3D dependency callgraph galaxy, highlighting reachable CVEs vs phantom dead code. |
| **CrashLens** | Industrial dashboard iframe / animated cascade | Live telemetry gauges with an animated cascade simulation showing the circuit breaker trip when an error spike occurs. |
| **ATL Inventory OS** | Dual-pane Inventory View & Lectern Chatbot | **Left:** Interactive grid of bins, resistors, and sensors in lab stock.<br>**Right:** Interactive Q&A chat (*"How do I wire the HC-SR04 ultrasonic sensor?"*) providing annotated pinout diagrams and breadboard clips. |
| **The Workshop** | Animated Multi-Agent Factory Conveyor | Visual pipeline diagram with pixel art villagers (Planner, Builder, Reviewer, Evaluator) passing code blocks along a conveyor. |

---

## 7. The Workshop Panel (Meta-Process)
The Workshop is unique: rather than presenting a standalone application, it explains **how Chirag engineers software with autonomous agent swarms**:
- **Pipeline Diagram:** Visual flow of agents passing tasks through specification, red-green tests, implementation, and code review.
- **Quality Gates:** Documentation of strict eval harnesses, static analysis, and zero-compromise testing.
- **Index:** A central registry of all 5 projects with shortcuts to warp directly to their stations.

---

## 8. Mobile Responsiveness & 2D Fallback
- **Mobile Devices:**
  - Dynamic viewport scaling, touch joystick on left, action buttons on right.
  - Project panels scale fluidly to 95vw/90vh with scrollable container bodies.
- **Low-Power / Slow Devices:**
  - Automatic detection of hardware concurrency / GPU limits.
  - Graceful fallback: 2D interactive pixel-art map showing the linear island with all 6 clickable buildings, sharing the exact same `data/projects.json` and modal dialogues.
- **Zero WebGL Support:**
  - Seamlessly renders the 2D interactive UI (preserved in `index.html`).
- **Accessibility (A11y):**
  - Persistent accessible drawer menu listing all projects with direct keyboard access, screen-reader friendly markup, and non-spatial navigation.

---

## 9. Performance & Rendering Budgets
- **Target Frame Rate:** Solid 60 FPS on mid-tier mobile hardware.
- **Voxel Optimization:**
  - Greedy meshing / face culling (never render faces obscured by neighboring blocks).
  - `THREE.InstancedMesh` used for all repeated block types.
- **Texture Atlas:** Single $256 \times 256$ texture atlas (`textures/atlas.png`) combining all 36 block tiles; requires only **1 draw call** for voxel terrain.
- **Pixel Ratio:** Clamped at `Math.min(window.devicePixelRatio, 1.5)` to conserve GPU fill rate.
- **Visibility Optimization:** Automatic animation pausing (`cancelAnimationFrame`) when tab is blurred or out of focus.
- **Progressive Hydration:** Fast initial DOM load with loading skeleton; 3D WebGL canvas mounts asynchronously.

---

## 10. File Architecture & Zero-Build Deployment

```
portfolio/
├── index.html           # Main entry point, HUD overlays, dialog templates, CDN imports
├── js/
│   ├── world.js         # Island terrain, Three.js scene, sky, lighting, player physics & camera
│   ├── buildings.js     # Voxel matrix parser turning building schematics into InstancedMesh
│   ├── panel.js         # GUI modal controller, villager trades, audio soundscape
│   └── fallback.js      # 2D flat map canvas for low-power and non-WebGL clients
├── data/
│   └── projects.json    # Source of truth: project copy, tech stacks, trades, links, milestones
├── textures/            # Verified CC0 16x16 pixel textures & compiled atlas
│   ├── atlas.png        # 256x256 unified texture atlas
│   ├── atlas.json       # UV coordinates for all 36 blocks
│   └── ...
├── media/               # Screenshots, animated webm clips, pinout schematics
├── docs/                # Architecture blueprints, builder research, licenses
└── CREDITS.md           # Permissive open-source attributions
```

- **Hosting:** 100% static, zero-build deployment compatible with GitHub Pages, Cloudflare Pages, Vercel, and Netlify.
- **Dependencies:** Three.js and Google Fonts loaded via high-availability CDNs.
