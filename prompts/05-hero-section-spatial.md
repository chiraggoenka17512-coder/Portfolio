Read AGENTS.md first and follow it strictly.

# Prompt 05: Spatial Hero Section & Student-Innovator Narrative

### Goal
Build the high-impact Hero section in `src/components/sections/Hero.tsx` showcasing developer identity, high-contrast typography, live status badges, Lakshmipat Singhania Academy credentials, learning journey in JS/TS/React, and CTA triggers, engineered with Framer Motion orchestration and Emil Kowalski design engineering principles.

### Standards & Skills Integration
* **Framer Motion Orchestration**:
  - Parent container with `staggerChildren: 0.08` and `delayChildren: 0.1`.
  - Child variants with subtle vertical lift (`initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}`).
  - Transition physics: duration `0.5s`, custom ease `[0.23, 1, 0.32, 1]` (starts fast, feels instant).
* **Emil Kowalski Motion & Tactile Feedback**:
  - `whileTap={{ scale: 0.97 }}` on all CTA buttons and interactive badges.
  - Never animate elements from `scale(0)`; start from `scale(0.95)` with `opacity: 0`.
  - Buttons feature `transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1)` and subtle background sheen.
* **Taste Skill Anti-Slop & Layout Discipline**:
  - **Viewport Stability**: Use `min-h-[100dvh]` (never `h-screen` to prevent iOS Safari jumping).
  - **Top Padding Cap**: Strict `pt-24 md:pt-28` to keep content above the fold.
  - **Headline Scale**: Max 2 lines on desktop (`text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.08] font-display`).
  - **Subtext Discipline**: Max 20 words (`max-w-[54ch] text-base md:text-lg text-neutral-400 leading-relaxed`).
  - **Hero Stack Cap**: Exactly 4 moments: (1) Student badge, (2) Headline, (3) Subtext, (4) CTA button group.
  - **CTA Wrapping Ban**: Primary and secondary button text MUST fit on one line at desktop (e.g. "Explore Projects" & "Live App: LabelSense").
* **UI/UX Pro Max**:
  - Strict WCAG AA contrast (≥4.5:1) for all body text.
  - Distinct primary vs secondary hierarchy:
    - Primary CTA: luminous cyan sheen (`bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-medium shadow-[0_0_20px_rgba(0,242,254,0.3)]`).
    - Secondary CTA: frosted glass border (`.glass-pill text-white hover:bg-white/[0.08]`).
  - Stat pill indicators with crisp numeric typography.
* **Impeccable Craft**:
  - Authentic student-innovator identity: Student at **Lakshmipat Singhania Academy, Kolkata** mastering **JavaScript, TypeScript, and React**, shipping **LabelSense**, **ATL Inventory**, and **Cartograph**.

### Negative Constraints
- ❌ Do NOT render the Three.js 3D Globe inside this step yet (provide a designated aspect-square container on the right where the globe will dock in Prompt 07 & 08).
- ❌ Do NOT exceed 20 words in the bio subtext or allow headlines to span 3+ lines.
- ❌ Do NOT build the Bento Grid project cards yet.

### Content & Persona Specifications
- **Badge**: `🟢 Student @ Lakshmipat Singhania Academy, Kolkata • Building with JS, TS & React`
- **Headline**: *"Architecting Intelligent Systems & Full-Stack Apps"*
- **Subtext**: *"Student developer crafting multimodal AI tools like LabelSense and real-time lab platforms while mastering JavaScript, TypeScript, and React."* (20 words)
- **CTAs**:
  - Primary: *"Explore Projects"* (scrolls to `#projects`)
  - Secondary: *"Live App: LabelSense"* (outbound link to `https://labelsense.ai.studio`)
- **Metric Badges**:
  - `3+ Flagship Systems`
  - `JS • TS • React`
  - `Kolkata, IN`

### Action Items
1. Create `src/components/sections/Hero.tsx` using `motion.section` and `motion.div`.
2. Implement two-column asymmetric spatial layout (`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto px-4 min-h-[100dvh] pt-24 pb-12`):
   - Left column (`lg:col-span-7`): Staggered text hierarchy, badge, headline, subtext, CTAs, and quick metric row.
   - Right column (`lg:col-span-5`): Designated 3D canvas viewport container with subtle ambient halo glow (`glow-cyan-subtle`).
3. Wire up Framer Motion staggered orchestration across all left-column elements.
4. Mount `<Hero />` in `App.tsx` directly under `<Navbar />`.

### Visual Grounding & Acceptance Checklist
- Visual Target: Refer to the left typography and layout composition in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Hero fits entirely in initial viewport without forcing scroll.
- [ ] Text hierarchy renders crisply with zero awkward wrapping on buttons.
- [ ] Tapping CTAs exhibits tactile scale press (`0.97`).
- [ ] Mobile collapse transitions cleanly from 12-column grid to vertical stack.
