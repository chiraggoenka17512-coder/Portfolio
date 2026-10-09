// Central TypeScript Contracts & Schema Definitions

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

export interface ProfileSocials {
  github: string;
  linkedin: string;
  twitter: string;
  email: string;
}

export interface DeveloperProfile {
  name: string;
  school: string;
  location: string;
  headline: string;
  bio: string;
  learningFocus: string[];
  socials: ProfileSocials;
  milestones: TimelineMilestone[];
}
