Read AGENTS.md first and follow it strictly.

# Prompt 10: Spatial 3D Tilt Cards & Spring-Powered Spotlight

### Goal
Implement a reusable spatial 3D card tilt and mouse-tracking spotlight component in `src/components/ui/TiltCard.tsx` using Framer Motion spring physics (`useMotionValue` + `useSpring`), Emil Kowalski tactile interaction rules, and UI/UX Pro Max touch guardrails.

### Standards & Skills Integration
* **Framer Motion & Spring Physics**:
  - **No `useState` for Continuous Pointer Tracking**: Use Motion's `useMotionValue` and `useSpring` to completely decouple mouse tracking from React re-renders.
  - Spring parameters: `{ stiffness: 160, damping: 22 }` ensuring fluid momentum and natural physical settling when the mouse exits the card.
  - Compute `rotateX` and `rotateY` via `useTransform` and smooth them through `useSpring`.
* **Emil Kowalski Tactile Polish**:
  - Add `whileTap={{ scale: 0.98 }}` on the card container so clicking or pressing feels physically responsive.
  - Radial spotlight overlay tracks exact cursor coordinates without obscuring content (`pointer-events-none`).
  - Subtle physical edge lighting: inner shadow with 1px border highlight (`shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]`).
* **UI/UX Pro Max (Touch & Mobile Guardrails)**:
  - Detect touch devices (`pointer: coarse` or `hover: none`) and bypass 3D tilt calculations on mobile to preserve 60fps scrolling and avoid battery consumption.
  - Max tilt clamped to a subtle `6deg` to prevent perspective distortion or unreadable text.

### Negative Constraints
- ❌ Do NOT use `useState` for mouse coordinates (collapses performance on high-refresh-rate displays).
- ❌ Do NOT enable heavy 3D rotation on mobile touchscreens.
- ❌ Do NOT block clicks to child buttons or links (`pointer-events-none` on overlay).

### Documentation Injection
```typescript
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Example Spring-Physics Tilt Architecture:
const x = useMotionValue(0);
const y = useMotionValue(0);

const springConfig = { stiffness: 160, damping: 22 };
const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), springConfig);
const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), springConfig);
```

### Action Items
1. Create `src/components/ui/TiltCard.tsx` wrapping child content in `motion.div`.
2. Compute normalized mouse position (`-0.5` to `0.5`) on `onMouseMove` by querying `currentTarget.getBoundingClientRect()`.
3. Pass normalized values into `x` and `y` motion values.
4. On `onMouseLeave`, reset `x` and `y` to `0` (springs smoothly return card to level).
5. Render dynamic cursor spotlight:
   - Absolute positioned overlay with CSS radial gradient centered at cursor coordinates.
   - Blend mode: `mix-blend-overlay` or subtle opacity `rgba(0, 242, 254, 0.1)`.
6. Wrap all cards inside `src/components/sections/BentoGrid.tsx` with `<TiltCard>`.

### Visual Grounding & Acceptance Checklist
- Visual Target: Observe the subtle glowing card borders and tactile depth in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Hovering over a Bento card tilts it smoothly with spring momentum.
- [ ] Radial cyan spotlight follows the cursor across the card surface.
- [ ] Card smoothly levels out on mouse leave with zero abrupt snapping.
- [ ] Mobile touch scrolling remains smooth and unaffected.
