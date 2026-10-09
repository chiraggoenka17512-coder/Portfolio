Read AGENTS.md first and follow it strictly.

# Prompt 01: Project Scaffolding & Dependencies

### Goal
Initialize a clean Vite + React 19 + TypeScript project, configure path aliases, install all core dependencies, and establish the directory hierarchy.

### Negative Constraints
- ❌ Do NOT implement any UI screens, components, or CSS styles in this step.
- ❌ Do NOT add mock data or create 3D canvas files yet.
- ❌ Do NOT create sample boilerplate files from default Vite (delete default `App.css`, replace `App.tsx` with a minimal placeholder).

### Documentation Injection
```json
// Target Dependencies to install:
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.170.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/three": "^0.170.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

### Action Items
1. Initialize the Vite project with React and TypeScript template if not already present.
2. Configure `tailwind.config.js` and `postcss.config.js`.
3. Set up path alias `@/` pointing to `src/` in both `vite.config.ts` and `tsconfig.json`.
4. Create the helper utility `src/utils/cn.ts` using `clsx` and `tailwind-merge`.
5. Create empty directories matching the architecture outlined in `AGENTS.md`:
   - `src/components/canvas`
   - `src/components/ui`
   - `src/components/sections`
   - `src/data`
   - `src/types`
   - `src/utils`
6. Verify that running `npm run build` passes with zero TypeScript or build errors.

### Visual & Acceptance Grounding
- [ ] Running `npm run build` succeeds without warnings.
- [ ] Path alias `@/...` resolves correctly.
- [ ] `src/utils/cn.ts` is available and exported.
