Read AGENTS.md first and follow it strictly.

# Prompt 15: SEO Optimization, Semantic Landmarks & Pre-Flight Audit

### Goal
Configure production-grade SEO metadata, social share cards (OpenGraph / Twitter), custom SVG favicon, theme colors, semantic HTML landmarks, and execute an exhaustive accessibility and Taste Skill pre-flight audit across the entire portfolio.

### Standards & Skills Integration
* **UI/UX Pro Max (WCAG AA Accessibility Audit)**:
  - **Skip Link**: Add an accessible *"Skip to main content"* link for keyboard and screen-reader users (`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-cyan-400 text-black font-semibold rounded-full`).
  - **Landmark Elements**: Full semantic layout: `<header>`, `<nav>`, `<main id="main-content">`, `<section id="...">`, `<footer>`.
  - **Interactive Affordances**: Every icon button includes an explicit `aria-label` attribute (mobile menu toggle, modal close, social links).
  - **Contrast Verification**: Ensure all body text exceeds the 4.5:1 minimum contrast threshold against the deep space background.
* **Taste Skill Pre-Flight Verification**:
  - Verify CTA button text fit on desktop (zero multi-line wrapping).
  - Verify eyebrow restraint (max 1 eyebrow per 3 sections).
  - Verify authentic copy without AI clichés or buzzword soup.
* **Impeccable SEO & Social Branding**:
  - Complete OpenGraph, Twitter card, description, and keywords metadata.
  - Custom modern SVG favicon with an illuminated monogram `C` symbol in `public/favicon.svg`.

### Negative Constraints
- ❌ Do NOT leave default Vite page title or default Vite icon.
- ❌ Do NOT use generic placeholder meta descriptions.
- ❌ Do NOT allow missing `aria-label` attributes on icon-only interactive elements.

### Documentation Injection
```html
<!-- Production Head Metadata Requirements -->
<title>Chirag | AI & Full-Stack Developer • Lakshmipat Singhania Academy</title>
<meta name="description" content="Portfolio of Chirag — Student innovator at Lakshmipat Singhania Academy Kolkata, mastering JS, TS & React. Creator of LabelSense, ATL Inventory, and Cartograph." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Chirag | AI & Full-Stack 3D Bento Portfolio" />
<meta property="og:description" content="Showcasing LabelSense (Multimodal AI Food Scanner), ATL Inventory (Lab OS), and Cartograph." />
<meta name="theme-color" content="#07080d" />
```

### Action Items
1. Update `index.html`:
   - Title: `Chirag | AI & Full-Stack Developer • Lakshmipat Singhania Academy, Kolkata`.
   - Comprehensive meta tags for description, keywords, OpenGraph, and Twitter cards.
   - Theme color: `#07080d`.
2. Create illuminated modern SVG favicon in `public/favicon.svg` with glowing cyan monogram and link it in `index.html`.
3. Wrap main application sections inside `<main id="main-content">` and add the skip-to-content anchor.
4. Add `aria-label` to all icon buttons across Navbar, Modal, Contact, and Footer.
5. Validate semantic HTML structure and color contrast across all sections.

### Visual Grounding & Acceptance Checklist
- [ ] Browser tab displays custom favicon and proper descriptive page title.
- [ ] Screen readers can navigate semantic landmark elements cleanly.
- [ ] All icon buttons include explicit `aria-label` attributes.
- [ ] Tab key navigation clearly exposes the skip-to-content button.
