import { DeveloperProfile, TimelineMilestone } from '@/types';

export const MILESTONES: TimelineMilestone[] = [
  {
    year: '2024 - Present',
    title: 'Student Innovator & Full-Stack Builder',
    organization: 'Lakshmipat Singhania Academy, Kolkata',
    role: 'Student Developer',
    description:
      'Mastering JavaScript, TypeScript, and React while architecting flagship production tools including LabelSense (multimodal AI food label scanner), ATL Inventory (real-time lab OS), and Cartograph (spatial 3D concept graph).',
    tags: ['React 19', 'TypeScript', 'Multimodal AI', 'Three.js', 'Supabase Realtime'],
    isCurrent: true,
  },
  {
    year: '2024',
    title: 'ATL Inventory OS Architect',
    organization: 'Atal Tinkering Lab (AIM, NITI Aayog) • LSA Kolkata',
    role: 'Lab Systems Engineer',
    description:
      'Engineered multi-device real-time state synchronization connecting lab workstations, student tablets, and sensor component checkout tracking with <50ms sync latency.',
    tags: ['WebSockets', 'Supabase Realtime', 'Lab Systems', 'AIM / NITI Aayog'],
    isCurrent: true,
  },
  {
    year: '2023 - 2024',
    title: 'Foundations of Modern Web & Computer Science',
    organization: 'Lakshmipat Singhania Academy Science & Computing Forum',
    role: 'Junior Builder',
    description:
      'Built algorithmic problem-solving discipline and Python data foundations before specializing in modern JavaScript, TypeScript, and reactive UI architecture.',
    tags: ['JavaScript', 'Python', 'Algorithms', 'Spatial Systems'],
    isCurrent: false,
  },
];

export const PROFILE: DeveloperProfile = {
  name: 'Chirag',
  school: 'Lakshmipat Singhania Academy, Kolkata',
  location: 'Kolkata, India',
  headline: 'Architecting Intelligent Systems & Full-Stack Apps',
  bio: 'Student developer at Lakshmipat Singhania Academy, Kolkata, crafting multimodal AI tools like LabelSense and real-time lab platforms while mastering JavaScript, TypeScript, and React.',
  learningFocus: ['JavaScript', 'TypeScript', 'React', 'Three.js', 'Real-Time Systems'],
  socials: {
    github: 'https://github.com/chirag',
    linkedin: 'https://linkedin.com/in/chirag',
    twitter: 'https://x.com/chirag',
    email: 'contact@chirag.dev',
  },
  milestones: MILESTONES,
};
