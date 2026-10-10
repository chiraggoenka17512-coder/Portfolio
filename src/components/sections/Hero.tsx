import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Code2, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

const InteractiveGlobe = React.lazy(() => import('@/components/canvas/InteractiveGlobe'));

// Emil Kowalski custom ease curve
const EMIL_EASE = [0.23, 1, 0.32, 1] as const;

// Staggered container orchestration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Subtle vertical lift child variants (starts fast, feels instant)
const childVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EMIL_EASE,
    },
  },
};

// Right column spatial canvas dock entrance (starts from 0.95 scale, never 0)
const spatialDockVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: 0.2,
      ease: EMIL_EASE,
    },
  },
};

export const Hero: React.FC = () => {
  return (
    <motion.section
      id="hero"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full min-h-[100dvh] flex items-center justify-center pt-24 md:pt-28 pb-12 overflow-hidden"
      aria-label="Hero Introduction"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (lg:col-span-7): Developer Narrative & Staggered Hierarchy */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7 z-10 text-left">
          {/* Moment 1: Live Student Beacon Badge */}
          <motion.div variants={childVariants}>
            <motion.div
              whileTap={{ scale: 0.97 }}
              className={cn(
                'inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill',
                'border border-emerald-500/25 bg-emerald-500/[0.07] text-xs font-medium text-emerald-300',
                'shadow-[0_0_16px_rgba(16,185,129,0.12)] hover:border-emerald-500/40 transition-colors cursor-default'
              )}
            >
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="tracking-wide">
                Student @ Lakshmipat Singhania Academy, Kolkata
                <span className="text-emerald-400/40 mx-1.5">•</span>
                Building with JS, TS &amp; React
              </span>
            </motion.div>
          </motion.div>

          {/* Moment 2: High-Contrast Headline (Max 2 lines on desktop) */}
          <motion.h1
            variants={childVariants}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white"
          >
            Architecting Intelligent Systems{' '}
            <br className="hidden sm:inline" />
            <span className="text-gradient-cyan">&amp; Full-Stack Apps</span>
          </motion.h1>

          {/* Moment 3: Subtext Bio (Strictly <= 20 words) */}
          <motion.p
            variants={childVariants}
            className="max-w-[54ch] text-base md:text-lg text-neutral-400 leading-relaxed font-sans"
          >
            Student developer crafting multimodal AI tools like{' '}
            <span className="text-neutral-200 font-medium">LabelSense</span> and real-time lab
            platforms while mastering{' '}
            <span className="text-neutral-200 font-medium">JavaScript</span>,{' '}
            <span className="text-neutral-200 font-medium">TypeScript</span>, and{' '}
            <span className="text-neutral-200 font-medium">React</span>.
          </motion.p>

          {/* Moment 4: CTA Button Group (Single line, no wrapping, tactile press) */}
          <motion.div
            variants={childVariants}
            className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 pt-1"
          >
            {/* Primary CTA: Luminous Cyan Sheen */}
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: EMIL_EASE }}
              className={cn(
                'min-h-[44px] px-6 py-2.5 rounded-full inline-flex items-center justify-center gap-2 font-display text-sm font-semibold whitespace-nowrap',
                'bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950',
                'shadow-[0_0_20px_rgba(0,242,254,0.35)] hover:shadow-[0_0_28px_rgba(0,242,254,0.55)]',
                'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-shadow'
              )}
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </motion.a>

            {/* Secondary CTA: Frosted Glass Pill with Outbound Arrow */}
            <motion.a
              href="https://labelsense.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: EMIL_EASE }}
              className={cn(
                'min-h-[44px] px-5 py-2.5 rounded-full inline-flex items-center justify-center gap-2 font-display text-sm font-medium whitespace-nowrap',
                'glass-pill text-white hover:bg-white/[0.08] hover:border-white/25',
                'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all'
              )}
            >
              <span>Live App: LabelSense</span>
              <ArrowUpRight className="w-4 h-4 text-neutral-400" />
            </motion.a>
          </motion.div>

          {/* Quick Metric Badges Row */}
          <motion.div
            variants={childVariants}
            className="pt-3 flex flex-wrap items-center gap-3"
          >
            {/* Metric 1: Systems */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="glass-pill px-3.5 py-1.5 flex items-center gap-2 border border-white/10 hover:border-cyan-400/30 transition-colors cursor-default"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-cyan-300 font-bold text-xs tracking-tight">3+</span>
              <span className="text-xs text-neutral-300">Flagship Systems</span>
            </motion.div>

            {/* Metric 2: Core Stack */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="glass-pill px-3.5 py-1.5 flex items-center gap-2 border border-white/10 hover:border-purple-400/30 transition-colors cursor-default"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-neutral-200 font-medium">JS • TS • React</span>
            </motion.div>

            {/* Metric 3: Location */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="glass-pill px-3.5 py-1.5 flex items-center gap-2 border border-white/10 hover:border-emerald-400/30 transition-colors cursor-default"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-neutral-300">Kolkata, IN</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column (lg:col-span-5): Designated 3D WebGL Spatial Globe Dock */}
        <motion.div
          variants={spatialDockVariants}
          className="lg:col-span-5 flex items-center justify-center relative w-full"
        >
          <div
            id="hero-spatial-canvas-dock"
            data-spatial-dock="globe"
            className="aspect-square w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px] relative flex items-center justify-center"
            aria-label="3D Spatial Globe Canvas Viewport"
          >
            <React.Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="aspect-square w-full rounded-full glow-cyan-subtle animate-pulse-slow border border-cyan-500/10 flex items-center justify-center"
                >
                  <div className="w-24 h-24 rounded-full border border-cyan-400/20 animate-ping opacity-25" />
                </div>
              }
            >
              <InteractiveGlobe />
            </React.Suspense>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;
