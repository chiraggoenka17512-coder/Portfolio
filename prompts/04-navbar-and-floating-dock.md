Read AGENTS.md first and follow it strictly.

# Prompt 04: Glassmorphic Floating Dock Navbar & Fluid Transitions

### Goal
Implement an Awwwards-grade, responsive floating glassmorphic navigation bar in `src/components/sections/Navbar.tsx` engineered with Framer Motion layout orchestration, Emil Kowalski tactile physics, and UI/UX Pro Max accessibility standards.

### Standards & Skills Integration
* **Framer Motion**: Use `layoutId="active-indicator"` on nav pills for fluid layout morphing between links; `AnimatePresence` with `mode="wait"` for mobile menu transitions.
* **Emil Kowalski Motion**:
  - Add `whileTap={{ scale: 0.97 }}` on all interactive tabs and the primary CTA button for tactile press feedback.
  - Never animate entrance from `scale(0)`; start from `scale(0.95)` with `opacity: 0`.
  - Use custom ease-out curve `cubic-bezier(0.23, 1, 0.32, 1)` with snappy durations (140–200ms).
* **Taste Skill Anti-Slop**:
  - Single-line desktop navigation (strict height cap: 64–72px, e.g. `h-16`). No two-line wrapping under any circumstances.
  - No duplicate CTA intent across page; single concise label on CTA button ("Connect").
  - Refined physical edge refraction: `.glass-panel` + `border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`.
* **UI/UX Pro Max**:
  - Minimum 44x44px touch targets on mobile (`min-h-[44px] min-w-[44px]`).
  - Accessible focus states: `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`.
  - WCAG AA contrast (≥4.5:1) for all link labels.
* **Impeccable Craft**:
  - Monogram brand mark (`C` • Chirag) with subtle pulsing indicator for active student status at Lakshmipat Singhania Academy, Kolkata.

### Negative Constraints
- ❌ Do NOT allow navigation items to wrap into a second line on desktop.
- ❌ Do NOT use `useState` for mouse hover tracking when Motion `layoutId` or hover variants achieve 60fps GPU acceleration.
- ❌ Do NOT build the Hero or Bento sections inside this component.

### Documentation Injection
```typescript
interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Overview', href: '#hero' },
  { label: 'Innovations', href: '#projects' },
  { label: 'Stack', href: '#skills' },
  { label: 'Journey', href: '#education' },
  { label: 'Contact', href: '#contact' },
];
```

### Action Items
1. Create `src/components/sections/Navbar.tsx` using `motion.nav` and `motion.div`.
2. Desktop floating dock architecture:
   - Fixed at `top-4 z-50 inset-x-0 mx-auto max-w-4xl px-4`.
   - Pill container: `.glass-panel rounded-full h-14 md:h-16 flex items-center justify-between px-5`.
   - Left: Brand monogram (`Chirag`) + active student beacon (`🟢 LSA Kolkata`).
   - Center: Nav link list using Motion `layoutId` for smooth hover/active indicator pill underneath the link label.
   - Right: Primary CTA button ("Connect") with `whileHover={{ scale: 1.03 }}` and `whileTap={{ scale: 0.97 }}`.
3. Mobile drawer architecture:
   - Accessible hamburger toggle button (`aria-label="Toggle navigation menu"`, min 44x44px).
   - `AnimatePresence` mobile dropdown panel:
     `initial={{ opacity: 0, scale: 0.96, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -10 }}` with duration `0.2s` and easing `[0.23, 1, 0.32, 1]`.
4. Mount `<Navbar />` in `App.tsx` and verify sticky positioning while scrolling.

### Visual Grounding & Acceptance Checklist
- Visual Target: Observe the top floating pill navbar with rounded tabs in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Navbar stays docked at top with frosted glass refraction and no layout jumping.
- [ ] Hovering between links shows fluid pill animation (`layoutId`).
- [ ] Tapping buttons provides immediate physical feedback (`scale: 0.97`).
- [ ] Mobile drawer enters smoothly without animating from `scale(0)`.
