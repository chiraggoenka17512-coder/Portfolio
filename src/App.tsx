import { useState } from 'react';
import { Navbar } from '@/components/sections/Navbar';
import { ParticleGalaxy } from '@/components/canvas/ParticleGalaxy';
import { Hero } from '@/components/sections/Hero';
import { BentoGrid } from '@/components/sections/BentoGrid';
import { TechMarquee } from '@/components/sections/TechMarquee';
import { EducationTimeline } from '@/components/sections/EducationTimeline';
import { ContactSection } from '@/components/sections/ContactSection';
import { Modal } from '@/components/ui/Modal';
import { PROJECTS } from '@/data';

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject =
    PROJECTS.find((p) => p.id === selectedProjectId) || null;

  return (
    <div className="relative min-h-[100dvh] bg-transparent text-white selection:bg-accent-cyan/20 selection:text-accent-cyan overflow-x-hidden">
      {/* 2D Canvas Interactive Particle Starfield */}
      <ParticleGalaxy />

      {/* Floating Glassmorphic Dock Navbar */}
      <Navbar />

      {/* Main Content Hierarchy */}
      <main className="relative z-10 w-full flex flex-col items-center">
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
