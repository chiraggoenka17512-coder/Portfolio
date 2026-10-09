# AGENTS.md — System Instructions & Architecture Contract

## 1. Project Overview & Developer Profile
This repository contains the source code for an **Awwwards-grade, high-performance 3D Bento Portfolio** tailored for:
* **Developer**: Student developer at **Lakshmipat Singhania Academy, Kolkata (LSA Kolkata)**.
* **Specialization**: AI & Full-Stack Engineering, actively learning and mastering **JavaScript, TypeScript, and React**.
* **Featured Flagship Projects**:
  1. **LabelSense** (`labelsense.ai.studio`): Multimodal AI-powered food label scanner demystifying complex food packaging, additives, and nutrition with personalized health risk profiles and quick-commerce overlay.
  2. **ATL Inventory** *(Under Process)*: Real-time inventory management OS & educational coding platform engineered for Atal Tinkering Labs (AIM, NITI Aayog) using WebSockets/Supabase Realtime.
  3. **Cartograph** *(Under Process)*: Interactive spatial and concept-mapping exploration engine.

---

## 2. Tech Stack & Dependencies
* **Build Engine & Framework**: Vite 6 + React 19 + TypeScript (Strict Mode)
* **Styling**: Tailwind CSS + Custom Design Tokens (Deep Space Palette)
* **Icons**: `lucide-react`
* **Motion & Micro-interactions**: `framer-motion`
* **3D & Spatial Engine**: Three.js (`three` + `@types/three`)
* **Utilities**: `clsx`, `tailwind-merge`
* **Form Handling**: Native React 19 hooks or lightweight email action

---

## 3. Development Philosophy
1. **Authentic Student-Innovator Story**:
   - Highlight ambitious, high-impact projects (LabelSense, ATL Inventory, Cartograph) alongside a relentless learning journey in JavaScript, TypeScript, and React.
   - Combine humility of learning with the ambition of shipping real-world AI applications.
2. **Performance First (No Heavy 3D Bloat)**:
   - Procedural geometries, particle starfields, and Three.js math over multi-megabyte GLTF assets.
   - Dynamic pause on `requestAnimationFrame` when tab is blurred or off-screen.
   - Zero layout shift (CLS < 0.05).
3. **Dark Modern Aesthetic**:
   - Deep luxury dark canvas (`#07080d`, `#0b0d14`), translucent glassmorphism surfaces (`backdrop-blur-md bg-white/[0.03] border border-white/10`).
   - Glowing accent colors: Cyan (`#00f2fe`), Violet (`#8a2be2`), Emerald (`#10b981`), and Amber (`#f59e0b` for "Under Process" tags).

---

## 4. Architecture Guidelines & Directory Structure
```
src/
├── assets/                  # Static media, icons, badges
├── components/
│   ├── canvas/              # WebGL & 2D/3D Canvas visualizations
│   │   ├── ParticleGalaxy.tsx
│   │   └── InteractiveGlobe.tsx
│   ├── ui/                  # Reusable low-level UI primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── TiltCard.tsx
│   │   ├── Modal.tsx
│   │   └── GlowBorder.tsx
│   └── sections/            # Core layout sections
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── BentoGrid.tsx
│       ├── TechMarquee.tsx
│       ├── EducationTimeline.tsx
│       ├── ContactSection.tsx
│       └── Footer.tsx
├── data/                    # Type-safe portfolio data
│   ├── projects.ts          # LabelSense, ATL Inventory, Cartograph
│   ├── skills.ts            # JS, TS, React, Three.js, Python, AI
│   └── profile.ts           # Bio, LSA Kolkata details, socials
├── types/                   # Central TypeScript contracts
│   └── index.ts
├── utils/                   # Helper functions (cn, formatters)
│   └── cn.ts
├── App.tsx                  # Root assembly component
├── main.tsx                 # Application entrypoint
```

---

## 5. Design Engineering & Motion Directives
All implementations across prompts must strictly comply with these five unified design skills:

1. **Framer Motion (`framer-motion` / `motion/react`)**:
   - Use `motion` primitives (`motion.div`, `motion.nav`, `motion.section`, `motion.button`).
   - Use Motion hooks (`useMotionValue`, `useSpring`, `useTransform`) for continuous mouse tracking; **never** use React `useState`.
   - Layout transitions: Use `layoutId` for active tab indicators and shared element morphing.
   - Exit transitions: Wrap dialogs, drawers, and toasts in `AnimatePresence`.

2. **Emil Kowalski Design Engineering (`emil-design-eng`)**:
   - **Tactile feedback**: All buttons and clickable tiles MUST include `whileTap={{ scale: 0.97 }}`.
   - **Never animate from `scale(0)`**: Entrances must start from `scale(0.95)` with `opacity: 0`.
   - **Custom easing curves**: Use custom physics `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. Avoid `ease-in` for entering UI.
   - **Snappy UI durations**: UI transitions must remain under 300ms (100–160ms for button clicks, 150–220ms for dropdowns/modals).
   - **Origin awareness**: Popovers scale from their trigger; modals stay centered.

3. **Taste Skill Anti-Slop (`design-taste-frontend`)**:
   - **Anti-default discipline**: No generic AI purple gradients, no fake screenshot divs, no emoji soup.
   - **Hero stack discipline**: Headline max 2 lines, subtext max 20 words, CTA fits on one line (max 3 words).
   - **Eyebrow restraint**: Maximum 1 eyebrow per 3 sections (hero counts as 1). Do not paste small-caps uppercase badges above every section.
   - **Single-line navigation**: Desktop nav height capped at 64–72px; never wrap to a second line.
   - **Bento grid rhythm**: Varied tile spans (2×2, 2×1, 1×1), varied material backdrops, exactly as many cells as content.
   - **Marquee limit**: Maximum 1 marquee across the entire page.

4. **UI/UX Pro Max (`ui-ux-pro-max`)**:
   - **Viewport stability**: Use `min-h-[100dvh]` (never `h-screen` on mobile).
   - **Accessible contrast**: All text must meet WCAG AA (≥4.5:1 ratio) against dark canvas `#07080d`.
   - **Form accessibility**: Field labels strictly ABOVE inputs; error text below; visible focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400`).
   - **Touch targets**: Minimum 44x44px for all mobile interactive elements.

5. **Impeccable Craft (`impeccable`)**:
   - Out-of-distribution craft, peak creativity, production-grade code.
   - Authentic student-innovator story: student developer at **Lakshmipat Singhania Academy, Kolkata** mastering **JavaScript, TypeScript, and React**, shipping **LabelSense**, **ATL Inventory**, and **Cartograph**.
   - Zero layout shift (CLS < 0.02) and seamless GitHub Pages relative asset paths (`base: './'`).

