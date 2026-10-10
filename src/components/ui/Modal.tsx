import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Github, CheckCircle2, Layers } from 'lucide-react';
import { Project } from '@/types';
import { cn } from '@/utils/cn';

// Emil Kowalski custom ease curve
const EMIL_EASE = [0.23, 1, 0.32, 1] as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, project }) => {
  // Keyboard Escape dismissal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Scroll lock & shift prevention on mount/open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && project && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
        >
          {/* Backdrop with blur & smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container: Emil Kowalski rules (scale 0.95 -> 1, origin centered, snappy 220ms) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: EMIL_EASE }}
            style={{ transformOrigin: 'center' }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl',
              'glass-panel bg-neutral-950/95 border border-white/15 p-6 sm:p-8 text-white',
              'shadow-[0_0_60px_rgba(0,0,0,0.85)] focus:outline-none'
            )}
          >
            {/* Header: Status, Category, Close Button */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {project.status === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live App
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Under Process
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.06] text-neutral-300 border border-white/10">
                  {project.category}
                </span>
              </div>

              {/* Tactile Close Button */}
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.16, ease: EMIL_EASE }}
                aria-label="Close project modal"
                className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Title & Tagline */}
            <h2
              id="modal-title"
              className="font-display text-2xl sm:text-3xl font-bold text-white mb-1.5"
            >
              {project.title}
            </h2>
            <p className="font-display text-sm sm:text-base font-medium text-cyan-300/90 mb-4">
              {project.tagline}
            </p>

            {/* Overview Paragraph */}
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 font-sans">
              {project.description}
            </p>

            {/* Metrics Grid: 3-column stats */}
            {project.metrics && project.metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {project.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex flex-col justify-between"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      {m.label}
                    </span>
                    <span className="font-display text-lg font-bold text-white mb-1">
                      {m.value}
                    </span>
                    {m.hint && (
                      <span className="text-[11px] text-neutral-400 leading-tight">
                        {m.hint}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Architectural Specs Breakdown */}
            {project.architecturePoints && project.architecturePoints.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 mb-3">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Architectural &amp; Engineering Decisions</span>
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
                  {project.architecturePoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.05] text-neutral-300 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Outbound Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {project.liveUrl && (
                  <motion.a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.16, ease: EMIL_EASE }}
                    className={cn(
                      'min-h-[42px] px-5 py-2 rounded-full inline-flex items-center gap-2 text-xs font-semibold',
                      'bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950',
                      'shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_22px_rgba(0,242,254,0.5)] transition-shadow'
                    )}
                  >
                    <span>Launch Live App</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </motion.a>
                )}

                {project.githubUrl && (
                  <motion.a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.16, ease: EMIL_EASE }}
                    className={cn(
                      'min-h-[42px] px-4 py-2 rounded-full inline-flex items-center gap-2 text-xs font-medium',
                      'glass-pill text-white hover:bg-white/[0.08] hover:border-white/20 transition-colors'
                    )}
                  >
                    <Github className="w-3.5 h-3.5 text-neutral-300" />
                    <span>View Repository</span>
                  </motion.a>
                )}
              </div>

              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.97 }}
                className="text-xs font-mono text-neutral-400 hover:text-white transition-colors ml-auto"
              >
                Press Esc or Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
