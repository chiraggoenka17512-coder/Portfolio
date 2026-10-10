import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/utils/cn';

// Emil Kowalski custom ease curve
const EMIL_EASE = [0.23, 1, 0.32, 1] as const;

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  title = 'Message Dispatched',
  message = "Thanks for reaching out! I'll get back to you shortly.",
  duration = 4000,
}) => {
  // Auto-dismiss timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 pointer-events-none"
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            role="status"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: EMIL_EASE }}
            className={cn(
              'pointer-events-auto flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl',
              'glass-panel bg-neutral-950/95 border border-emerald-500/30',
              'shadow-[0_0_35px_rgba(16,185,129,0.18)] max-w-sm text-white'
            )}
          >
            {/* Status Icon */}
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            {/* Copy */}
            <div className="flex-1 pr-2">
              <h4 className="font-display text-sm font-bold text-white mb-0.5">{title}</h4>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">{message}</p>
            </div>

            {/* Tactile Close Button */}
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              aria-label="Close notification"
              className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
