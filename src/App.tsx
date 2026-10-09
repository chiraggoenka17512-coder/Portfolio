import { Navbar } from '@/components/sections/Navbar';
import { ParticleGalaxy } from '@/components/canvas/ParticleGalaxy';
import { Hero } from '@/components/sections/Hero';
import { BentoGrid } from '@/components/sections/BentoGrid';

export default function App() {
  return (
    <div className="relative min-h-[100dvh] bg-transparent text-white selection:bg-accent-cyan/20 selection:text-accent-cyan overflow-x-hidden">
      {/* 2D Canvas Interactive Particle Starfield */}
      <ParticleGalaxy />

      {/* Floating Glassmorphic Dock Navbar */}
      <Navbar />

      {/* Main Content Hierarchy */}
      <main className="relative z-10 w-full flex flex-col items-center">
        <Hero />
        <BentoGrid />
      </main>
    </div>
  );
}
