Read AGENTS.md first and follow it strictly.

# Prompt 06: Strict TypeScript Contracts & Authentic Project Data

### Goal
Define comprehensive TypeScript interfaces in `src/types/index.ts` and write verified data models in `src/data/` for **LabelSense**, **ATL Inventory**, **Cartograph**, educational background at **Lakshmipat Singhania Academy Kolkata**, and the **JS/TS/React** learning stack, adhering to Impeccable data fidelity and UI/UX Pro Max standards.

### Standards & Skills Integration
* **Taste Skill Data Discipline**:
  - **No Fake AI Numbers**: Reject arbitrary mock statistics (e.g. `98.42% AI accuracy`); use authentic architectural metrics (e.g. `15-20 Qs Personal Profile`, `<50ms Realtime Sync`, `3D WebGL Graph`).
  - **One Register of Copy**: Direct, engineering-grounded descriptions without marketing hyperbole.
* **UI/UX Pro Max Contract Rigor**:
  - Full discriminated unions for statuses (`'live' | 'under-process'`).
  - Strict typing for tech tags, metrics, outbound links, and educational milestones.
* **Impeccable Storytelling**:
  - Ground the profile in the authentic journey: high school student innovator at **Lakshmipat Singhania Academy, Kolkata (LSA Kolkata)** actively learning and mastering **JavaScript, TypeScript, and React** while engineering production tools.

### Negative Constraints
- ❌ Do NOT use `any` type in any interface.
- ❌ Do NOT invent corporate work experience or fake enterprise titles.
- ❌ Do NOT use generic placeholder names ("Project 1", "Portfolio v1").

### Data Schema Specifications
```typescript
// src/types/index.ts
export type ProjectStatus = 'live' | 'under-process';

export interface ProjectMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  category: 'Multimodal AI' | 'Realtime Lab OS' | 'Spatial & 3D';
  liveUrl?: string;
  githubUrl?: string;
  tags: string[];
  metrics: ProjectMetric[];
  architecturePoints: string[];
  featured: boolean;
  accentColor: string;
}

export interface SkillItem {
  name: string;
  category: 'Core Learning' | 'Frontend & 3D' | 'Backend & Cloud' | 'Tools & Runtime';
  level: 'Mastering' | 'Active Learning' | 'Building';
  icon: string;
  isCore?: boolean;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  organization: string;
  role: string;
  description: string;
  tags: string[];
  isCurrent?: boolean;
}
```

### Action Items
1. Create `src/types/index.ts` exporting all type contracts.
2. Create `src/data/projects.ts` containing the three flagship projects:
   - **LabelSense**:
     - Status: `'live'`
     - Live URL: `https://labelsense.ai.studio`
     - Tagline: *"Multimodal AI Food Scanner & Personalized Health Analyzer"*
     - Description: *"Demystifies complex packaged food labels and ambiguous chemical additives using multimodal AI vision. Features a 15–20 question personalized health evaluation profile, quick-commerce overlay (e.g., Blinkit), and multi-product comparative nutrition breakdown."*
     - Tags: `['Multimodal AI', 'Computer Vision', 'React 19', 'TypeScript', 'HealthTech']`
     - Metrics: `[{ label: 'Health Profile', value: '15-20 Qs' }, { label: 'Scanner Status', value: 'Live on Web' }, { label: 'Commerce', value: 'Quick-Commerce' }]`
     - Architecture: `['Multimodal vision extraction for ingredient lists', 'Personalized risk scoring engine based on user questionnaire', 'Comparative additive analysis pipeline']`
   - **ATL Inventory**:
     - Status: `'under-process'`
     - Tagline: *"Real-Time Lab Inventory OS & Student Coding Platform"*
     - Description: *"Engineered for Atal Tinkering Labs (ATLs) under the Atal Innovation Mission (AIM, NITI Aayog). Employs WebSockets and Supabase Realtime to keep lab workstations and student tablets continuously synchronized, paired with integrated educational coding guides."*
     - Tags: `['WebSockets', 'Supabase Realtime', 'React 19', 'Hardware Lab OS', 'AIM / NITI Aayog']`
     - Metrics: `[{ label: 'Sync Latency', value: '<50ms' }, { label: 'Architecture', value: 'Multi-Device' }, { label: 'Status', value: 'In Progress' }]`
     - Architecture: `['Supabase Realtime channels for bi-directional state sync', 'Component checkout tracking for robotics sensors and microcontrollers', 'Interactive student tutorials embedded in the lab OS']`
   - **Cartograph**:
     - Status: `'under-process'`
     - Tagline: *"Spatial Concept Mapping & Knowledge Graph Engine"*
     - Description: *"An interactive spatial exploration engine for mapping complex concept dependencies, algorithmic graphs, and multi-dimensional knowledge models into fluid 3D landscapes."*
     - Tags: `['Three.js', 'WebGL', 'TypeScript', 'Spatial Mapping', 'Graph Theory']`
     - Metrics: `[{ label: 'Canvas Engine', value: 'Three.js / WebGL' }, { label: 'Physics', value: 'Spatial Force' }, { label: 'Status', value: 'In Progress' }]`
     - Architecture: `['Procedural node graph geometry with shader lighting', 'Spatial clustering and node connection algorithms', 'Reactive camera framing for focused concept inspection']`
3. Create `src/data/skills.ts`:
   - Feature **JavaScript**, **TypeScript**, and **React** in the `'Core Learning'` category with `isCore: true`.
   - Include Tailwind CSS, Three.js, Vite, Supabase, WebSockets, Python, Git.
4. Create `src/data/profile.ts`:
   - Developer: Chirag
   - School: **Lakshmipat Singhania Academy, Kolkata**
   - Location: Kolkata, India
   - Bio & Social Links: GitHub, LinkedIn, Twitter/X, Email.
5. Verify build compiles with zero TypeScript errors.

### Visual Grounding & Acceptance Checklist
- [ ] Strict TypeScript contracts with zero `any` types.
- [ ] Data files import cleanly and pass `npm run build` verification.
- [ ] Authentic metrics and descriptions reflecting LSA Kolkata and real projects.
