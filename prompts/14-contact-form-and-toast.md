Read AGENTS.md first and follow it strictly.

# Prompt 14: Accessible Contact Section & Spring-Animated Toast

### Goal
Implement an accessible, high-contrast contact section and floating toast notification in `src/components/sections/ContactSection.tsx` and `src/components/ui/Toast.tsx`, engineered with UI/UX Pro Max form standards, Framer Motion exit animations, and Emil Kowalski tactile physics.

### Standards & Skills Integration
* **UI/UX Pro Max Form Accessibility**:
  - **Labels Above Inputs**: Every field has an explicit `<label>` tag positioned above the input with high contrast (`text-neutral-200 text-sm font-medium mb-1.5`). Never use placeholders as labels.
  - **Error Guidance**: Inline validation errors appear directly below invalid inputs with clear red/amber text and `aria-live="polite"`.
  - **Focus Management**: Visible focus rings on all inputs (`focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none`).
  - **Touch Friendly**: All inputs and buttons have a minimum height of 48px (`h-12`) for comfortable mobile typing.
* **Emil Kowalski Tactile Button & Toast Physics**:
  - **Tactile Submit Press**: `whileTap={{ scale: 0.97 }}` giving instant physical confirmation of clicks.
  - **Never Animate Toast from `scale(0)`**: Toast enters from `scale(0.95)` and `y: 20` with `opacity: 0`.
  - **Snappy Durations**: Fast entry (<240ms) using custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`.
* **Framer Motion Toast Orchestration**:
  - `AnimatePresence` with `mode="wait"`.
  - Auto-dismiss after 4 seconds with manual close trigger.
* **Impeccable Craft & Taste Skill**:
  - Direct connection options: Email (`mailto:`), location card (`📍 Kolkata, India`), school affiliation (**Lakshmipat Singhania Academy**), and verified social links (GitHub, LinkedIn, Twitter/X).
  - Single-line CTA label: *"Send Message"*.
  - Footer with credits, year, and smooth back-to-top button.

### Negative Constraints
- ❌ Do NOT use placeholder-as-label (violates UI/UX Pro Max accessibility rules).
- ❌ Do NOT trigger browser page reloads on submission (`e.preventDefault()`).
- ❌ Do NOT make form inputs hard to tap on mobile screens (<44px).

### Action Items
1. Create `src/components/ui/Toast.tsx` using `motion.div` and `AnimatePresence`:
   - Position: Fixed at bottom-right (`bottom-6 right-6 z-50`).
   - Frosted panel with emerald status icon and close button.
2. Create `src/components/sections/ContactSection.tsx`:
   - Left Column: Direct email link, location card (`📍 Kolkata, India`), student status at Lakshmipat Singhania Academy, social links (GitHub, LinkedIn, Twitter/X), and quick link to `labelsense.ai.studio`.
   - Right Column: Contact form with fields for Name, Email, Collaboration Type, and Message.
3. Validate inputs on submit:
   - Provide visual feedback during simulated dispatch (`isSubmitting` state with spinner).
   - Display toast upon success and reset fields.
4. Add Footer with:
   - Credits: *"Designed & Engineered by Chirag • Student @ Lakshmipat Singhania Academy, Kolkata"*.
   - Back-to-top button with smooth scroll.
5. Mount `<ContactSection />` in `App.tsx`.

### Visual Grounding & Acceptance Checklist
- Visual Target: Observe the lower right Contact inputs in `@prompt_material/00-portfolio-mockup.jpg`.
- [ ] Labels sit clearly above all form inputs.
- [ ] Focus rings illuminate sharply in cyan when keyboard-tabbed.
- [ ] Submit button provides tactile press feedback (`scale: 0.97`).
- [ ] Toast notification animates into view smoothly and auto-dismisses.
