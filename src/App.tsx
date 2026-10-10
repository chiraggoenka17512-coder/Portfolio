import { useState, lazy, Suspense } from 'react';
import { Navbar } from '@/components/sections/Navbar';
import { Hero } from '@/components/sections/Hero';
import { BentoGrid } from '@/components/sections/BentoGrid';
import { TechMarquee } from '@/components/sections/TechMarquee';
import { EducationTimeline } from '@/components/sections/EducationTimeline';
import { ContactSection } from '@/components/sections/ContactSection';
import { Modal } from '@/components/ui/Modal';
import { PROJECTS } from '@/data';

// Dynamic lazy-load for 2D Canvas Starfield
const ParticleGalaxy = lazy(() => import('@/components/canvas/ParticleGalaxy'));

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject =
    PROJECTS.find((p) => p.id === selectedProjectId) || null;

  return (
    <div className="relative min-h-[100dvh] bg-transparent text-white selection:bg-accent-cyan/20 selection:text-accent-cyan overflow-x-hidden">
      {/* Accessible Skip Link for Keyboard & Screen Reader Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 rounded-full bg-cyan-400 text-slate-950 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        Skip to main content
      </a>

      {/* 2D Canvas Interactive Particle Starfield (Suspended) */}
      <Suspense fallback={null}>
        <ParticleGalaxy />
      </Suspense>

      {/* Floating Glassmorphic Dock Navbar */}
      <Navbar />

      {/* Main Content Semantic Landmark */}
      <main id="main-content" className="relative z-10 w-full flex flex-col items-center">
        <Hero />
        <BentoGrid onSelectProject={setSelectedProjectId} />
        <TechMarquee />
        <EducationTimeline />
        <ContactSection />
      </main>

      {/* Project Architectural Deep-Dive Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProjectId(null)}
        project={selectedProject}
      />
    </div>
  );
}
