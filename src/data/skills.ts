import { SkillItem } from '@/types';

export const SKILLS: SkillItem[] = [
  // Core Learning (Flagship Student Learning Stack)
  {
    name: 'JavaScript',
    category: 'Core Learning',
    level: 'Mastering',
    icon: 'FileCode2',
    isCore: true,
  },
  {
    name: 'TypeScript',
    category: 'Core Learning',
    level: 'Mastering',
    icon: 'FileType',
    isCore: true,
  },
  {
    name: 'React',
    category: 'Core Learning',
    level: 'Mastering',
    icon: 'Atom',
    isCore: true,
  },

  // Frontend & 3D
  {
    name: 'Three.js',
    category: 'Frontend & 3D',
    level: 'Building',
    icon: 'Box',
    isCore: false,
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend & 3D',
    level: 'Mastering',
    icon: 'Palette',
    isCore: false,
  },
  {
    name: 'Framer Motion',
    category: 'Frontend & 3D',
    level: 'Building',
    icon: 'Sparkles',
    isCore: false,
  },

  // Backend & Cloud
  {
    name: 'Supabase',
    category: 'Backend & Cloud',
    level: 'Building',
    icon: 'Database',
    isCore: false,
  },
  {
    name: 'WebSockets',
    category: 'Backend & Cloud',
    level: 'Active Learning',
    icon: 'Radio',
    isCore: false,
  },
  {
    name: 'Python',
    category: 'Backend & Cloud',
    level: 'Building',
    icon: 'Terminal',
    isCore: false,
  },

  // Tools & Runtime
  {
    name: 'Vite',
    category: 'Tools & Runtime',
    level: 'Mastering',
    icon: 'Zap',
    isCore: false,
  },
  {
    name: 'Git',
    category: 'Tools & Runtime',
    level: 'Mastering',
    icon: 'GitBranch',
    isCore: false,
  },
];
