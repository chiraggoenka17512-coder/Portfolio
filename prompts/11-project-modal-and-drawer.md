Read AGENTS.md first and follow it strictly.

# Prompt 11: Project Deep-Dive Modal & Architectural Spec Drawer

### Goal
Build an accessible, animated modal dialog in `src/components/ui/Modal.tsx` displaying deep architectural specifications, data flows, problem-solution breakdowns, and live outbound links for **LabelSense**, **ATL Inventory**, and **Cartograph**, engineered with Framer Motion `AnimatePresence`, Emil Kowalski modal motion principles, and UI/UX Pro Max accessibility guardrails.

### Standards & Skills Integration
* **Framer Motion & AnimatePresence**:
  - Render inside a React Portal into `document.body`.
  - Wrap dialog with `AnimatePresence` for smooth exit transitions.
  - Backdrop animation: `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}` with duration `0.2s`.
* **Emil Kowalski Modal Engineering**:
  - **Never Animate from `scale(0)`**: Card enters from `scale(0.95)` and `opacity: 0` (`initial={{ opacity: 0, scale: 0.95, y: 16 }}`).
  - **Transform Origin Centered**: Modals maintain `transform-origin: center` (centered in viewport, unlike popovers).
  - **Snappy Durations**: Total entrance duration `220ms` using custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`.
  - Tactile close button with `whileTap={{ scale: 0.92 }}`.
* **UI/UX Pro Max (Accessibility & Dialog Patterns)**:
  - **Scroll Lock & Shift Prevention**: Lock body scrolling (`document.body.style.overflow = 'hidden'`) while modal is active.
  - **Keyboard Dismissal**: Listen to `keydown` for `Escape` key to immediately close.
  - **Backdrop Dismissal**: Clicking outside the dialog card triggers close.
  - **Screen Reader Compliance**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`.
  - Close button includes explicit `aria-label="Close project modal"`.
* **Impeccable Storytelling**:
  - Deep technical transparency for each project:
    - *LabelSense*: 15–20 question personalized health evaluation profile, Blinkit quick-commerce overlay, additive safety analysis, and direct launch button to `https://labelsense.ai.studio`.
    - *ATL Inventory*: Realtime WebSockets + Supabase sync across lab hardware workstations and Android tablets; student coding lessons.
    - *Cartograph*: Three.js/WebGL spatial concept-mapping algorithms and force-directed knowledge topologies.

### Negative Constraints
- ❌ Do NOT animate modal entrance from `scale(0)` (violates Emil Kowalski motion rules).
- ❌ Do NOT allow page background to scroll while the dialog is active.
- ❌ Do NOT omit `aria-label` or `Escape` key handling.

### Action Items
1. Create `src/components/ui/Modal.tsx` using `createPortal` and `motion.div`.
2. Implement dialog backdrop (`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md`).
3. Dialog container: `.glass-panel max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 md:p-8 relative border border-white/15`.
4. Render project-specific content sections:
   - Header: Title, Category, Status pill, and Close button (`X` icon).
   - Metrics grid: 3-column stats with large numbers.
   - Architectural specs: Bulleted engineering decisions.
   - Outbound actions: "Launch Live App" (for LabelSense) or "View Repository".
5. Integrate modal trigger with Bento Grid cards.

### Visual Grounding & Acceptance Checklist
- [ ] Clicking "View Details" opens the dialog smoothly without layout jump.
- [ ] Modal enters from `scale(0.95)` with custom ease-out.
- [ ] Pressing `Escape` or clicking backdrop closes the modal instantly.
- [ ] Body scrolling is locked while open and restored upon close.
- [ ] LabelSense links directly to `https://labelsense.ai.studio`.
