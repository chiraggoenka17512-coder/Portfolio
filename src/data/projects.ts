import { Project } from '@/types';

export const PROJECTS: Project[] = [
  {
    id: 'labelsense',
    title: 'LabelSense',
    tagline: 'Multimodal AI Food Scanner & Personalized Health Analyzer',
    description:
      'Demystifies complex packaged food labels and ambiguous chemical additives using multimodal AI vision. Features a 15–20 question personalized health evaluation profile, quick-commerce overlay (e.g., Blinkit), and multi-product comparative nutrition breakdown.',
    status: 'live',
    category: 'Multimodal AI',
    liveUrl: 'https://labelsense.ai.studio',
    githubUrl: 'https://github.com/chirag/labelsense',
    tags: ['Multimodal AI', 'Computer Vision', 'React 19', 'TypeScript', 'HealthTech'],
    metrics: [
      { label: 'Health Profile', value: '15-20 Qs', hint: 'Comprehensive diagnostic evaluation' },
      { label: 'Scanner Status', value: 'Live on Web', hint: 'Production deployment' },
      { label: 'Commerce', value: 'Quick-Commerce', hint: 'Blinkit & Instamart integration overlay' },
    ],
    architecturePoints: [
      'Multimodal vision extraction for ingredient lists and nutrition fact tables',
      'Personalized risk scoring engine based on clinical allergen and dietary questionnaires',
      'Comparative additive analysis pipeline evaluating processing severity',
    ],
    featured: true,
    accentColor: '#00f2fe',
  },
  {
    id: 'atl-inventory',
    title: 'ATL Inventory',
    tagline: 'Real-Time Lab Inventory OS & Student Coding Platform',
    description:
      'Engineered for Atal Tinkering Labs (ATLs) under the Atal Innovation Mission (AIM, NITI Aayog). Employs WebSockets and Supabase Realtime to keep lab workstations and student tablets continuously synchronized, paired with integrated educational coding guides.',
    status: 'under-process',
    category: 'Realtime Lab OS',
    githubUrl: 'https://github.com/chirag/atl-inventory',
    tags: ['WebSockets', 'Supabase Realtime', 'React 19', 'Hardware Lab OS', 'AIM / NITI Aayog'],
    metrics: [
      { label: 'Sync Latency', value: '<50ms', hint: 'Instant multi-tablet state sync' },
      { label: 'Architecture', value: 'Multi-Device', hint: 'Lab kiosk + tablet checkout' },
      { label: 'Status', value: 'In Progress', hint: 'Active development & lab testing' },
    ],
    architecturePoints: [
      'Supabase Realtime channels for bi-directional state sync across lab workstations',
      'Component checkout tracking for robotics sensors, development boards, and microcontrollers',
      'Interactive student tutorials and STEM coding guides embedded in the lab OS',
    ],
    featured: true,
    accentColor: '#f59e0b',
  },
  {
    id: 'cartograph',
    title: 'Cartograph',
    tagline: 'Spatial Concept Mapping & Knowledge Graph Engine',
    description:
      'An interactive spatial exploration engine for mapping complex concept dependencies, algorithmic graphs, and multi-dimensional knowledge models into fluid 3D landscapes.',
    status: 'under-process',
    category: 'Spatial & 3D',
    githubUrl: 'https://github.com/chirag/cartograph',
    tags: ['Three.js', 'WebGL', 'TypeScript', 'Spatial Mapping', 'Graph Theory'],
    metrics: [
      { label: 'Canvas Engine', value: 'Three.js / WebGL', hint: '60fps GPU-accelerated rendering' },
      { label: 'Physics', value: 'Spatial Force', hint: 'Interactive repulsive node dynamics' },
      { label: 'Status', value: 'In Progress', hint: 'Core graph algorithms underway' },
    ],
    architecturePoints: [
      'Procedural node graph geometry with custom shader lighting and depth cues',
      'Spatial clustering and dynamic node connection algorithms',
      'Reactive camera framing for focused, multi-scale concept inspection',
    ],
    featured: true,
    accentColor: '#8a2be2',
  },
];
