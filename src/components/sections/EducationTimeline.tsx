import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Building } from 'lucide-react';
import { PROFILE } from '@/data';
import { TimelineMilestone } from '@/types';
import { cn } from '@/utils/cn';

// Emil Kowalski custom ease curve
const EMIL_EASE = [0.23, 1, 0.32, 1] as const;

export const EducationTimeline: React.FC = () => {
  const milestones = PROFILE.milestones;

  return (
    <section
      id="education"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
      aria-label="Education and Journey Timeline"
    >
      {/* Section Header */}
      <div className="flex flex-col items-start mb-16 md:mb-20">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-cyan-400">
            Student Journey &amp; Milestones
          </span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
          Education &amp; Innovation <span className="text-gradient-cyan">Timeline</span>
        </h2>

        <p className="max-w-[58ch] text-base md:text-lg text-neutral-400 leading-relaxed font-sans">
          The authentic path combining rigorous academic ground at{' '}
          <span className="text-white font-medium">Lakshmipat Singhania Academy, Kolkata</span> with
          hardware tinkering in the Atal Tinkering Lab and self-directed mastery of modern web architecture.
        </p>
      </div>

      {/* =========================================================================
          VERTICAL ILLUMINATED TIMELINE
          ========================================================================= */}
      <div className="relative w-full">
        {/* Desktop Centered Glowing Spine */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 bottom-8 w-0.5 bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(0,242,254,0.35)]"
        />

        {/* Mobile Left-Aligned Glowing Spine */}
        <div
          aria-hidden="true"
          className="md:hidden absolute left-5 top-4 bottom-8 w-0.5 bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(0,242,254,0.35)]"
        />

        {/* Milestone Entries */}
        <div className="space-y-12 md:space-y-16">
          {milestones.map((milestone: TimelineMilestone, index: number) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={`${milestone.title}-${index}`}
                className={cn(
                  'relative flex items-start',
                  // Mobile: always offset from left rail
                  'pl-12 sm:pl-14 md:pl-0',
                  // Desktop: alternate left and right sides of the centered spine
                  isEven ? 'md:justify-start' : 'md:justify-end'
                )}
              >
                {/* Node Beacon Marker on the Line */}
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute top-6 z-20 -translate-y-1/2 -translate-x-1/2',
                    // Mobile: fixed to left-5
                    'left-5',
                    // Desktop: centered at left-1/2
                    'md:left-1/2'
                  )}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Breathing Outer Pulse */}
                    <span
                      className={cn(
                        'absolute w-7 h-7 rounded-full animate-ping opacity-30',
                        milestone.isCurrent ? 'bg-cyan-400' : 'bg-purple-400'
                      )}
                    />
                    {/* Glow Ring */}
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center bg-space-dark',
                        milestone.isCurrent
                          ? 'border-cyan-400 shadow-[0_0_12px_#00f2fe]'
                          : 'border-purple-400 shadow-[0_0_12px_#8a2be2]'
                      )}
                    >
                      {/* Core Dot */}
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          milestone.isCurrent ? 'bg-cyan-300' : 'bg-purple-300'
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Milestone Card Container */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, ease: EMIL_EASE }}
                  whileHover={{ y: -3 }}
                  className={cn(
                    'w-full md:w-[calc(50%-2.5rem)]',
                    'glass-panel bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-7',
                    'hover:border-cyan-500/30 transition-all duration-300 shadow-xl',
                    // Subtle ambient gradient sheen
                    milestone.isCurrent
                      ? 'bg-gradient-to-br from-cyan-950/20 via-white/[0.02] to-transparent'
                      : 'bg-gradient-to-br from-purple-950/20 via-white/[0.02] to-transparent'
                  )}
                >
                  {/* Top: Date Pill & Current Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>{milestone.year}</span>
                    </span>

                    {milestone.isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active Focus
                      </span>
                    )}
                  </div>

                  {/* Title & Role */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1">
                    {milestone.title}
                  </h3>

                  {/* Organization & Campus Affiliation */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-cyan-200/80 mb-3">
                    <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{milestone.organization}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-5 font-sans">
                    {milestone.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/10">
                    {milestone.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.04] text-neutral-300 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EducationTimeline;
