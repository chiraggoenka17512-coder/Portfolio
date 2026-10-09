Read AGENTS.md first and follow it strictly.

# Prompt 12: Tech Marquee & Categorized Skill Matrix

### Goal
Implement an ultra-smooth, hardware-accelerated tech marquee paired with an interactive categorized skill matrix in `src/components/sections/TechMarquee.tsx`, spotlighting active learning and mastery of **JavaScript**, **TypeScript**, and **React** alongside full-stack tools, adhering to Taste Skill marquee limits and Emil Kowalski motion standards.

### Standards & Skills Integration
* **Taste Skill Anti-Slop (Marquee Max-One Rule)**:
  - **Single Marquee Section**: Adhere to the strict Taste Skill limit of **maximum 1 marquee on the entire page** to avoid repetitive filler.
  - Combine the marquee with an organized, interactive Skill Matrix below it, giving visitors both instantaneous brand recognition and deep technical scanability.
* **Emil Kowalski Motion Polish**:
  - Continuous marquee uses strict `linear` keyframe physics at 60fps.
  - Pause on hover (`group-hover:[animation-play-state:paused]`) so users can inspect tags without chasing moving targets.
  - Skill cards in the matrix feature tactile micro-interactions: `whileHover={{ y: -3, scale: 1.02 }}` and `whileTap={{ scale: 0.97 }}`.
* **UI/UX Pro Max (Visual Hierarchy & Accessibility)**:
  - **Special Highlight for Core Learning Stack**: **JavaScript**, **TypeScript**, and **React 19** receive prominent illuminated Cyan borders (`border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,254,0.2)]`) and an authentic `"Core Learning"` badge.
  - Clean categorization: *Core Learning*, *Frontend & 3D*, *Backend & Realtime*, *Tools & AI Runtime*.
  - Semantic list elements with `aria-label="Technology stack and skills"`.

### Negative Constraints
- ❌ Do NOT use multiple scattered marquees across the page (violates Taste Skill).
- ❌ Do NOT use JavaScript intervals for marquee animation; use CSS keyframes (`transform: translate3d`).
- ❌ Do NOT hide the fact that JS/TS/React are actively being mastered; embrace the student learning journey.

### Documentation Injection
```css
@keyframes marquee {
  0% { transform: translate3d(0%, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

.animate-marquee {
  display: flex;
  width: max-content;
  animation: marquee 28s linear infinite;
  will-change: transform;
}
```

### Action Items
1. Create `src/components/sections/TechMarquee.tsx` using `motion.div`.
2. Header: Section title *"Technical Ecosystem & Active Stack"* with subtext focusing on student engineering.
3. Top Marquee Track: Seamless duplicated ribbon containing all tools (React 19, TypeScript, JavaScript, Three.js, Tailwind CSS, Vite, Supabase, WebSockets, Python, Git).
4. Categorized Skill Matrix below marquee:
   - 4-column responsive grid mapping `src/data/skills.ts`.
   - Cards styled with `.glass-panel` and rounded corners.
   - Core learning cards (JS, TS, React) featuring glowing cyan pulses.
5. Mount `<TechMarquee />` in `App.tsx` directly below `BentoGrid`.

### Visual Grounding & Acceptance Checklist
- [ ] Marquee scrolls with zero visual stutter or seam gaps.
- [ ] Hovering over the track pauses scrolling cleanly.
- [ ] Core learning items (JS, TS, React) stand out with luminous styling.
- [ ] Skill matrix tiles respond to click/tap with `scale(0.97)`.
