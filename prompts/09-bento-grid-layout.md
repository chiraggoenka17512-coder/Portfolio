Read AGENTS.md first and follow it strictly.

# Prompt 09: Asymmetric Bento Grid Section & Material Diversity

### Goal
Implement an Awwwards-grade asymmetric Bento Grid section in `src/components/sections/BentoGrid.tsx` showcasing **LabelSense**, **ATL Inventory**, **Cartograph**, and **Lakshmipat Singhania Academy / Learning Stack**, engineered with Taste Skill bento rhythm, UI/UX Pro Max responsive mechanics, and Framer Motion viewport reveal.

### Standards & Skills Integration
* **Taste Skill Bento Rhythm & Diversity**:
  - **Asymmetric Tile Distribution**: Break monotony with varied dimensions (LabelSense spans 2 cols × 2 rows; ATL Inventory spans 2 cols × 1 row; Cartograph spans 1 col × 1 row; School/Learning spans 1 col × 1 row).
  - **Material Diversity**: Prevent repetitive grey boxes. Each card has distinctive visual personality:
    - *LabelSense*: Ambient cyan gradient sheen (`from-cyan-500/10 via-transparent to-transparent`) with live interactive product preview card.
    - *ATL Inventory*: Subtle amber telemetry grid texture with real-time sync badge.
    - *Cartograph*: Dark spatial constellation background with 3D graph tags.
    - *School & Stack*: Dual-tone violet glass with prominent JS/TS/React learning badges.
  - **Bento Cell Count Rule**: Exactly 4 richly detailed tiles; no awkward empty gaps or filler tiles.
  - **Eyebrow Restraint**: Section header uses clean, focused typography without redundant generic labels.
* **Framer Motion Viewport Stagger**:
  - Staggered entrance using `whileInView={{ opacity: 1, y: 0 }}` with `viewport={{ once: true, amount: 0.15 }}`.
  - Card initial state: `initial={{ opacity: 0, y: 24 }}` with custom ease `[0.23, 1, 0.32, 1]`.
* **UI/UX Pro Max (Accessible States & Contrast)**:
  - Responsive collapse: Flawless scaling from `lg:grid-cols-4` to `md:grid-cols-2` to `grid-cols-1`.
  - Accessible status indicators:
    - Live App: High-contrast Emerald pill (`bg-emerald-500/15 text-emerald-300 border border-emerald-500/30`).
    - Under Process: High-contrast Amber pill (`bg-amber-500/15 text-amber-300 border border-amber-500/30`).
* **Impeccable Craft**:
  - Highlight genuine innovation: Multimodal food vision, Atal Tinkering Lab hardware inventory sync under NITI Aayog, and spatial knowledge mapping.

### Negative Constraints
- ❌ Do NOT make all cards look like identical grey boxes; apply material diversity to each tile.
- ❌ Do NOT cause horizontal overflow or broken layouts on mobile screens.
- ❌ Do NOT include fake AI numbers or arbitrary metrics.

### Content & Tile Layout Specifications
* **Tile 1 (Flagship Live AI App — 2 cols, 2 rows)**:
  - **LabelSense** (`labelsense.ai.studio`)
  - Status: `🟢 Live App`
  - Tagline: *"Multimodal AI Food Scanner & Health Risk Analyzer"*
  - Key Specs: 15–20 question personalized health evaluation profile, Blinkit quick-commerce overlay, additive breakdown.
  - Direct Action: "View Architecture" (triggers deep-dive modal) + Outbound launch link.
* **Tile 2 (Realtime Lab OS — 2 cols, 1 row)**:
  - **ATL Inventory**
  - Status: `🟡 Under Process`
  - Tagline: *"Real-Time Lab Inventory OS & Student Coding Platform"*
  - Specs: Atal Tinkering Lab (AIM, NITI Aayog), WebSockets + Supabase Realtime synchronization (<50ms latency).
* **Tile 3 (Spatial & Graph Mapping — 1 col, 1 row)**:
  - **Cartograph**
  - Status: `🟡 Under Process`
  - Specs: Three.js/WebGL spatial concept explorer, interactive knowledge graphs.
* **Tile 4 (School & Learning Stack — 1 col, 1 row)**:
  - **Lakshmipat Singhania Academy, Kolkata**
  - Core learning badges: **JavaScript**, **TypeScript**, and **React 19**.

### Action Items
1. Create `src/components/sections/BentoGrid.tsx` using `motion.section` and `motion.div`.
2. Configure CSS Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto px-4`.
3. Render tiles with `.glass-panel` and unique gradient backdrops per tile.
4. Mount `<BentoGrid />` in `App.tsx` below `<Hero />`.

### Visual Grounding & Acceptance Checklist
- Visual Target: Match the modular Bento tile arrangement in the lower half of `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Grid displays LabelSense prominently spanning 2×2.
- [ ] Visual backgrounds vary across cards (material diversity).
- [ ] Status indicators meet WCAG AA contrast standards.
- [ ] Seamless collapse on mobile screens (stacked 1-column).
