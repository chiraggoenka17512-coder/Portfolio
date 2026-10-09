Read AGENTS.md first and follow it strictly.

# Prompt 02: Design Tokens, Typography & Emil Kowalski Motion Curves

### Goal
Establish the global design tokens, color palette, custom fonts (Inter & Outfit), Emil Kowalski custom easing curves, glassmorphic utilities, subtle scrollbar styling, and base resets in `src/index.css` and `tailwind.config.js`.

### Standards & Skills Integration
* **Emil Kowalski Custom Easing Curves**:
  - Add custom physics curves to `:root` and `tailwind.config.js`:
    - `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` (snappy, instant feedback).
    - `--ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)` (natural movement).
    - `--ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-grade sheet slide).
* **Taste Skill Anti-Slop Discipline**:
  - Clean neutral palette with single high-contrast cyan/purple accent system; no generic AI-purple wash.
  - Physical edge refraction on glassmorphism: 1px translucent border (`border-white/10`) + inner highlight (`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`).
* **UI/UX Pro Max Contrast Guardrails**:
  - Deep luxury dark canvas (`#07080d`) with crisp, high-contrast text (`#f8fafc` text primary, `#94a3b8` text secondary).
  - Anti-aliased font rendering across all browser engines.

### Negative Constraints
- ❌ Do NOT build any application sections, headers, or navbars in this step.
- ❌ Do NOT import Three.js or create canvas animations yet.
- ❌ Do NOT use built-in weak CSS easings like `ease-in` for entering UI.

### Documentation Injection
```css
/* Color Palette & Emil Kowalski Easing Specifications */
:root {
  --bg-primary: #07080d;
  --bg-secondary: #0b0d14;
  --bg-surface: rgba(17, 19, 31, 0.7);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(255, 255, 255, 0.2);
  --accent-cyan: #00f2fe;
  --accent-blue: #4facfe;
  --accent-purple: #8a2be2;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Emil Kowalski Custom Easing Curves */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

### Action Items
1. Update `index.html` to load Google Fonts: `Inter` (sans) and `Outfit` (display).
2. Extend `tailwind.config.js` with:
   - Custom fonts (`font-sans: ['Inter', 'sans-serif']`, `font-display: ['Outfit', 'sans-serif']`).
   - Theme colors: `bg-space`, `bg-surface`, `accent-cyan`, `accent-purple`, `accent-emerald`, `accent-amber`.
   - Emil Kowalski easing curves: `emil-out`, `emil-in-out`, `emil-drawer`.
   - Custom keyframe animations: `pulse-slow`, `float`, `glow-spin`, `shimmer`.
3. In `src/index.css`:
   - Set up `@tailwind base; @tailwind components; @tailwind utilities;`.
   - Apply base dark theme styling on `html` and `body` (`background-color: #07080d; color: #f8fafc; font-family: Inter;`).
   - Define reusable utility classes:
     - `.glass-panel` (`backdrop-blur-md bg-white/[0.03] border border-white/10 shadow-2xl`).
     - `.glass-pill` (`backdrop-blur-sm bg-white/[0.06] border border-white/15 rounded-full`).
     - `.text-gradient-cyan` (`bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent`).
     - `.text-gradient-purple` (`bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent`).
   - Add clean dark scrollbar styles (`::-webkit-scrollbar`).

### Visual Grounding & Acceptance Checklist
- Visual Target: Refer to the dark deep-space background and glowing cyan/purple hues in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] `body` renders in pure deep space black (`#07080d`).
- [ ] Typography renders with crisp anti-aliasing.
- [ ] Emil Kowalski easing curves available in CSS variables and Tailwind.
- [ ] `.glass-panel` produces the translucent frosted effect when overlaid on content.
