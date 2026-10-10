import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Sparkles,
  Radio,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { PROJECTS, SKILLS, PROFILE } from '@/data';
import { cn } from '@/utils/cn';
import { TiltCard } from '@/components/ui/TiltCard';

// Emil Kowalski custom ease curve
const EMIL_EASE = [0.23, 1, 0.32, 1] as const;

// Container viewport stagger orchestration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Card entrance physics: starts from y: 24 with custom easing
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: EMIL_EASE,
    },
  },
};

interface BentoGridProps {
  onSelectProject?: (projectId: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ onSelectProject }) => {
  const labelSense = PROJECTS.find((p) => p.id === 'labelsense') || PROJECTS[0];
  const atlInventory = PROJECTS.find((p) => p.id === 'atl-inventory') || PROJECTS[1];
  const cartograph = PROJECTS.find((p) => p.id === 'cartograph') || PROJECTS[2];
  const coreSkills = SKILLS.filter((s) => s.isCore);

  return (
    <motion.section
      id="projects"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
      aria-label="Flagship Projects Bento Grid"
    >
      {/* Section Header with Eyebrow Restraint */}
      <div className="flex flex-col items-start mb-10 md:mb-12">
        <motion.div variants={cardVariants} className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-cyan-400">
            Selected Work &amp; Architecture
          </span>
        </motion.div>

        <motion.h2
          variants={cardVariants}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3"
        >
          Flagship Systems <span className="text-gradient-cyan">&amp; Engineering</span>
        </motion.h2>

        <motion.p
          variants={cardVariants}
          className="max-w-[56ch] text-base md:text-lg text-neutral-400 leading-relaxed font-sans"
        >
          Architecting multimodal AI scanners, real-time hardware lab synchronization, and spatial
          knowledge landscapes.
        </motion.p>
      </div>

      {/* Asymmetric Bento Grid: 4 Columns on Desktop, Exactly 4 Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[minmax(280px,auto)]">
        {/* =========================================================================
            TILE 1: LabelSense (Flagship Live AI App — 2 cols, 2 rows)
            ========================================================================= */}
        <TiltCard
          role="article"
          variants={cardVariants}
          spotlightColor="rgba(0, 242, 254, 0.16)"
          maxTilt={5}
          className={cn(
            'group relative lg:col-span-2 lg:row-span-2 rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden',
            'glass-panel bg-gradient-to-br from-cyan-950/20 via-white/[0.02] to-transparent',
            'border border-cyan-500/20 hover:border-cyan-400/40 transition-colors shadow-[0_0_35px_rgba(0,242,254,0.05)]'
          )}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-500" />

          {/* Card Top: Status & Badges */}
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live App
              </span>
              <span className="text-xs font-mono text-neutral-400 tracking-wide">
                labelsense.ai.studio
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              {labelSense.title}
            </h3>
            <p className="font-display text-sm sm:text-base font-medium text-cyan-200/80 mb-3">
              {labelSense.tagline}
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-xl mb-6">
              {labelSense.description}
            </p>

            {/* Interactive Feature Architecture Mockup Preview */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-3 border-b border-white/5 pb-2">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Multimodal Risk Engine
                </span>
                <span className="text-emerald-400 font-semibold">15–20 Qs Profile Active</span>
              </div>

              {/* Sample Ingredient Breakdown Telemetry */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-neutral-200 font-medium">Palm Oil &amp; Saturated Fats</span>
                  </div>
                  <span className="text-red-300 font-mono text-[11px]">Flagged • High Processing</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-neutral-200 font-medium">Additive E621 (MSG)</span>
                  </div>
                  <span className="text-amber-300 font-mono text-[11px]">Moderate Sensitivity</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-neutral-200 font-medium">Dietary Allergen Profile</span>
                  </div>
                  <span className="text-emerald-300 font-mono text-[11px]">Match: Gluten Free</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Bottom: Tags, Metrics & Direct CTAs */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            {/* Tech Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-5">
              {labelSense.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.04] text-neutral-300 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.a
                href={labelSense.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.16, ease: EMIL_EASE }}
                className={cn(
                  'min-h-[42px] px-5 py-2 rounded-full inline-flex items-center gap-2 text-xs font-semibold whitespace-nowrap',
                  'bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950',
                  'shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_22px_rgba(0,242,254,0.5)] transition-shadow',
                  'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none'
                )}
              >
                <span>Launch LabelSense</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.a>

              <motion.button
                onClick={() => onSelectProject?.(labelSense.id)}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.16, ease: EMIL_EASE }}
                className={cn(
                  'min-h-[42px] px-4 py-2 rounded-full inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
                  'glass-pill text-white hover:bg-white/[0.08] hover:border-white/20',
                  'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors'
                )}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-300" />
                <span>Architecture Breakdown</span>
              </motion.button>
            </div>
          </div>
        </TiltCard>

        {/* =========================================================================
            TILE 2: ATL Inventory (Realtime Lab OS — 2 cols, 1 row)
            ========================================================================= */}
        <TiltCard
          role="article"
          variants={cardVariants}
          spotlightColor="rgba(245, 158, 11, 0.16)"
          maxTilt={5}
          className={cn(
            'group relative lg:col-span-2 lg:row-span-1 rounded-2xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden',
            'glass-panel bg-gradient-to-br from-amber-950/20 via-white/[0.02] to-transparent',
            'border border-amber-500/20 hover:border-amber-400/40 transition-colors shadow-[0_0_30px_rgba(245,158,11,0.05)]'
          )}
        >
          {/* Subtle Ambient Amber Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />

          {/* Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Under Process
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Atal Tinkering Lab • AIM, NITI Aayog
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                {atlInventory.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 w-fit">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>&lt;50ms Supabase Realtime Sync</span>
              </div>
            </div>

            <p className="font-display text-xs sm:text-sm font-medium text-amber-200/80 mb-2">
              {atlInventory.tagline}
            </p>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
              {atlInventory.description}
            </p>
          </div>

          {/* Bottom Row */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {atlInventory.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.04] text-neutral-300 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            <motion.button
              onClick={() => onSelectProject?.(atlInventory.id)}
              whileTap={{ scale: 0.97 }}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 inline-flex items-center gap-1"
            >
              <span>Explore OS Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </TiltCard>

        {/* =========================================================================
            TILE 3: Cartograph (Spatial & Graph Mapping — 1 col, 1 row)
            ========================================================================= */}
        <TiltCard
          role="article"
          variants={cardVariants}
          spotlightColor="rgba(168, 85, 247, 0.16)"
          maxTilt={6}
          className={cn(
            'group relative lg:col-span-1 lg:row-span-1 rounded-2xl p-6 flex flex-col justify-between overflow-hidden',
            'glass-panel bg-gradient-to-br from-purple-950/25 via-white/[0.02] to-transparent',
            'border border-purple-500/20 hover:border-purple-400/40 transition-colors shadow-[0_0_25px_rgba(138,43,226,0.05)]'
          )}
        >
          {/* Subtle Ambient Violet Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all" />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Under Process
              </span>
              <span className="text-[11px] font-mono text-purple-300">Spatial &amp; 3D</span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
              {cartograph.title}
            </h3>
            <p className="font-display text-xs text-purple-200/80 mb-2">{cartograph.tagline}</p>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4 line-clamp-3">
              {cartograph.description}
            </p>

            {/* Visual Constellation Graph Motif */}
            <div className="h-14 rounded-lg bg-black/40 border border-purple-500/15 p-2 flex items-center justify-around text-neutral-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
                <span className="text-[10px] font-mono text-cyan-300">WebGL Force</span>
              </div>
              <div className="h-0.5 w-6 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-50" />
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#8a2be2]" />
                <span className="text-[10px] font-mono text-purple-300">3D Nodes</span>
              </div>
            </div>
          </div>

          {/* Footer Tags */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-neutral-300 border border-white/10">
                Three.js
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-neutral-300 border border-white/10">
                TypeScript
              </span>
            </div>
            <motion.button
              onClick={() => onSelectProject?.(cartograph.id)}
              whileTap={{ scale: 0.97 }}
              className="text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1 font-medium"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </TiltCard>

        {/* =========================================================================
            TILE 4: School & Core Learning Stack (1 col, 1 row)
            ========================================================================= */}
        <TiltCard
          role="article"
          variants={cardVariants}
          spotlightColor="rgba(16, 185, 129, 0.16)"
          maxTilt={6}
          className={cn(
            'group relative lg:col-span-1 lg:row-span-1 rounded-2xl p-6 flex flex-col justify-between overflow-hidden',
            'glass-panel bg-gradient-to-br from-indigo-950/25 via-white/[0.02] to-emerald-950/15',
            'border border-indigo-500/20 hover:border-emerald-400/40 transition-colors shadow-[0_0_25px_rgba(79,70,229,0.05)]'
          )}
        >
          {/* Subtle Ambient Indigo Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all" />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Campus Innovation Hub</span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
              {PROFILE.school}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Student developer combining rigorous academic foundation with active daily mastery of
              production web architecture.
            </p>

            {/* Core Learning Stack Badges */}
            <div className="space-y-1.5 mb-2">
              {coreSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-black/40 border border-white/5"
                >
                  <span className="text-xs font-medium text-neutral-200">{skill.name}</span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Affiliation */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Kolkata, India</span>
            <span className="text-emerald-400 font-semibold">Active Builder</span>
          </div>
        </TiltCard>
      </div>
    </motion.section>
  );
};

export default BentoGrid;
