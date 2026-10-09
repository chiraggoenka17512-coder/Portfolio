Read AGENTS.md first and follow it strictly.

# Prompt 13: Education & Innovation Journey Timeline

### Goal
Build an illuminated vertical milestone timeline in `src/components/sections/EducationTimeline.tsx` celebrating the user's authentic journey at **Lakshmipat Singhania Academy, Kolkata**, hands-on engineering in the **Atal Tinkering Lab**, and self-driven progression in **JavaScript, TypeScript, and React**, engineered with Framer Motion scroll reveals and Impeccable storytelling.

### Standards & Skills Integration
* **Taste Skill Authenticity & Resume Anti-Patterns**:
  - **Zero Corporate Hallucination**: Strictly avoid fabricated corporate roles. The authenticity of a high-achieving high school builder is ten times more compelling than fake titles.
  - Asymmetric vertical layout with an illuminated spine that anchors the visual flow through the page.
* **Framer Motion Scroll Choreography**:
  - Timeline cards trigger entry animations via `whileInView={{ opacity: 1, y: 0, scale: 1 }}` with `viewport={{ once: true, amount: 0.25 }}`.
  - Easing: Custom curve `[0.23, 1, 0.32, 1]` with duration `0.45s`.
* **Emil Kowalski Motion Polish**:
  - Cards enter from `scale(0.96)` and `y: 20` (never from `scale(0)`).
  - Glowing timeline node beacons feature subtle continuous breathing animation (`pulse-slow`).
  - Cards feature responsive hover lift (`whileHover={{ y: -3 }}`).
* **UI/UX Pro Max (Responsive Rail Mechanics)**:
  - Desktop: Alternating milestone cards left and right of a centered glowing spine.
  - Mobile (<768px): Rail shifts smoothly to the far left, with all milestone cards neatly stacked on the right.
  - High-contrast date pill badges and clear typography hierarchy.

### Negative Constraints
- ❌ Do NOT use generic placeholder corporate resumes or fake enterprise roles.
- ❌ Do NOT make the timeline static or unresponsive on small viewports.

### Timeline Milestones to Feature
1. **Lakshmipat Singhania Academy, Kolkata (LSA Kolkata)**:
   - *Academic Foundation & Technical Leadership*
   - Active participation in school technology exhibitions, robotics labs, and national STEM competitions.
2. **Atal Tinkering Lab (ATL) Innovations**:
   - *Engineering ATL Inventory under AIM / NITI Aayog*
   - Architected real-time hardware checkout and synchronization across lab workstations and student tablets using WebSockets and Supabase Realtime.
3. **AI Engineering & Shipping LabelSense**:
   - *Deploying to Production (`labelsense.ai.studio`)*
   - Engineered multimodal AI vision analysis for packaged food additives, 15–20 question personalized health evaluation profiles, and quick-commerce integrations.
4. **Mastery of the Modern Web**:
   - *Deep Dive into JavaScript, TypeScript & React 19*
   - Developing **Cartograph** for 3D spatial knowledge exploration and mastering strict-mode React architectures.

### Action Items
1. Create `src/components/sections/EducationTimeline.tsx` using `motion.div`.
2. Construct vertical glowing line structure:
   - Centered on desktop, left-aligned on mobile (`w-0.5 bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-500`).
3. Milestone cards:
   - Glowing circular node markers on the line.
   - Date badge, Institution tag (**Lakshmipat Singhania Academy, Kolkata**), description, and tech pills.
4. Wire up Framer Motion `whileInView` staggered reveals.
5. Mount `<EducationTimeline />` in `App.tsx` below `TechMarquee`.

### Visual Grounding & Acceptance Checklist
- [ ] Prominently features Lakshmipat Singhania Academy, Kolkata and authentic projects.
- [ ] Connected vertical line illuminates with a smooth gradient.
- [ ] Cards stagger in with Emil Kowalski ease-out as the user scrolls.
- [ ] Mobile collapse neatly transforms to a single left-aligned rail.
