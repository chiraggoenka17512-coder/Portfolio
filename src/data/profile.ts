import { DeveloperProfile, TimelineMilestone } from '@/types';

export const MILESTONES: TimelineMilestone[] = [
  {
    year: '2024 - Present',
    title: 'Mastery of the Modern Web & Spatial Systems',
    organization: 'Self-Directed Deep Dive & Open Source',
    role: 'React & TypeScript Engineer',
    description:
      'Rigorous daily practice mastering JavaScript, TypeScript strict mode, and React 19 component architectures. Developing Cartograph for GPU-accelerated 3D spatial concept-mapping and force-directed knowledge topologies.',
    tags: ['React 19', 'TypeScript', 'JavaScript', 'Three.js', 'WebGL'],
    isCurrent: true,
  },
  {
    year: '2024',
    title: 'AI Engineering & Shipping LabelSense',
    organization: 'Production AI Deployment • labelsense.ai.studio',
    role: 'Multimodal AI Architect',
    description:
      'Engineered and shipped LabelSense to production. Developed multimodal AI vision pipelines for packaged food additive safety, 15–20 question personalized health evaluation profiles, and quick-commerce integrations (Blinkit).',
    tags: ['Multimodal AI', 'Computer Vision', 'React 19', 'HealthTech', 'Vite'],
    isCurrent: true,
  },
  {
    year: '2024',
    title: 'Atal Tinkering Lab (ATL) OS Innovations',
    organization: 'Atal Innovation Mission (AIM, NITI Aayog) • LSA Kolkata',
    role: 'Realtime Systems Engineer',
    description:
      'Architected ATL Inventory to synchronize robotics sensors, hardware components, and checkout telemetry across lab workstations and student tablets using WebSockets and Supabase Realtime with <50ms sync latency.',
    tags: ['WebSockets', 'Supabase Realtime', 'Lab Systems', 'AIM / NITI Aayog'],
    isCurrent: true,
  },
  {
    year: '2023 - 2024',
    title: 'Academic Foundation & Technical Leadership',
    organization: 'Lakshmipat Singhania Academy, Kolkata (LSA Kolkata)',
    role: 'Student Innovator & STEM Lead',
    description:
      'Combining rigorous academic discipline with active technical leadership in school robotics exhibitions, science symposiums, and national computing competitions.',
    tags: ['LSA Kolkata', 'Robotics', 'Python', 'Algorithms', 'STEM'],
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
