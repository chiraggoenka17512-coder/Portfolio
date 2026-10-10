import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode2,
  FileType,
  Atom,
  Box,
  Palette,
  Sparkles,
  Database,
  Radio,
  Terminal,
  Zap,
  GitBranch,
  Code2,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { SKILLS } from '@/data';
import { cn } from '@/utils/cn';

// Emil Kowalski custom easing curve
const EMIL_EASE = [0.23, 1, 0.32, 1] as const;

// Lucide icon mapping
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileCode2,
  FileType,
  Atom,
  Box,
  Palette,
  Sparkles,
  Database,
  Radio,
  Terminal,
  Zap,
  GitBranch,
};

// Continuous Marquee Ribbon Items
const MARQUEE_ITEMS = [
  { name: 'React 19', icon: Atom, tag: 'Component Architecture' },
  { name: 'TypeScript', icon: FileType, tag: 'Type-Safe Logic' },
  { name: 'JavaScript (ESNext)', icon: FileCode2, tag: 'Core Web Standards' },
  { name: 'Three.js / WebGL', icon: Box, tag: '3D Spatial Graphics' },
  { name: 'Tailwind CSS', icon: Palette, tag: 'Design Systems' },
  { name: 'Framer Motion', icon: Sparkles, tag: 'Physics & Micro-interactions' },
  { name: 'Supabase', icon: Database, tag: 'Realtime Database' },
  { name: 'WebSockets', icon: Radio, tag: 'Low-Latency Sync' },
  { name: 'Python', icon: Terminal, tag: 'AI & Data Scripts' },
  { name: 'Vite', icon: Zap, tag: 'Next-Gen Build Engine' },
  { name: 'Git & GitHub', icon: GitBranch, tag: 'Version Control' },
];

const CATEGORIES = [
  'All',
  'Core Learning',
  'Frontend & 3D',
  'Backend & Cloud',
  'Tools & Runtime',
] as const;

type CategoryType = (typeof CATEGORIES)[number];

export const TechMarquee: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');

  const filteredSkills =
    activeCategory === 'All'
      ? SKILLS
      : SKILLS.filter((s) => s.category === activeCategory);

  return (
    <section
      id="skills"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
      aria-label="Technology stack and skills"
    >
      {/* Section Header */}
      <div className="flex flex-col items-start mb-12 md:mb-16">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-cyan-400">
            Technical Ecosystem &amp; Active Stack
          </span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
          Tooling, Systems <span className="text-gradient-cyan">&amp; Mastery</span>
        </h2>

        <p className="max-w-[56ch] text-base md:text-lg text-neutral-400 leading-relaxed font-sans">
          Combining foundational academic discipline with daily deliberate practice across modern
          JavaScript, TypeScript, and high-performance WebGL frameworks.
        </p>
      </div>

      {/* =========================================================================
          SINGLE PAGE MARQUEE (Taste Skill Strict Limit: Max 1 Marquee per page)
          ========================================================================= */}
      <div className="relative w-full overflow-hidden mb-16 py-3 select-none group">
        {/* Left & Right Edge Vignette Fades */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-space via-space/80 to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-space via-space/80 to-transparent z-10"
        />

        {/* Hardware-Accelerated Infinite Scrolling Ribbon with Pause on Hover */}
        <div className="animate-marquee flex items-center gap-4 group-hover:[animation-play-state:paused]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.name}-${index}`}
                className={cn(
                  'flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-full',
                  'glass-panel bg-white/[0.03] border border-white/10 hover:border-cyan-400/40',
                  'transition-colors duration-200 cursor-default shrink-0'
                )}
              >
                <div className="p-1.5 rounded-full bg-cyan-500/10 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 whitespace-nowrap">
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          CATEGORIZED SKILL MATRIX
          ========================================================================= */}
      <div className="w-full">
        {/* Category Filter Tabs with Framer Motion layoutId */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'relative px-4 py-2 rounded-full text-xs font-mono transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSkillTab"
                    transition={{ duration: 0.2, ease: EMIL_EASE }}
                    className="absolute inset-0 rounded-full bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]"
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>

        {/* Responsive Skill Cards Grid (4 Columns) */}
        <motion.ul
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          aria-label="Skill matrix"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => {
              const IconComponent = ICON_MAP[skill.icon] || Code2;
              const isCore = skill.isCore;

              return (
                <motion.li
                  layout
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: EMIL_EASE }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'group relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-default',
                    'glass-panel bg-white/[0.02]',
                    isCore
                      ? 'border border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,254,0.18)] bg-gradient-to-br from-cyan-950/20 to-transparent'
                      : 'border border-white/10 hover:border-white/20'
                  )}
                >
                  {/* Subtle Background Radial Sheen for Core items */}
                  {isCore && (
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-300" />
                  )}

                  {/* Top: Icon & Badge */}
                  <div className="relative z-10 flex items-start justify-between gap-2 mb-4">
                    <div
                      className={cn(
                        'p-2.5 rounded-xl border',
                        isCore
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                          : 'bg-white/[0.04] border-white/10 text-neutral-300 group-hover:text-white'
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {isCore ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(0,242,254,0.25)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Core Learning
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-neutral-400 bg-white/[0.03] border border-white/5">
                        {skill.category}
                      </span>
                    )}
                  </div>

                  {/* Body: Title & Category */}
                  <div className="relative z-10 mb-4">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {skill.name}
                    </h3>
                  </div>

                  {/* Footer: Mastery Level Pill */}
                  <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400 text-[11px]">Proficiency</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-medium font-mono flex items-center gap-1',
                        skill.level === 'Mastering'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                          : skill.level === 'Active Learning'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-white/[0.05] text-neutral-300 border border-white/10'
                      )}
                    >
                      {skill.level === 'Mastering' && (
                        <CheckCircle className="w-3 h-3 text-cyan-400" />
                      )}
                      {skill.level === 'Active Learning' && (
                        <TrendingUp className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{skill.level}</span>
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
};

export default TechMarquee;
