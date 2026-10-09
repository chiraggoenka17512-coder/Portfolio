import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Overview', href: '#hero' },
  { label: 'Innovations', href: '#projects' },
  { label: 'Stack', href: '#skills' },
  { label: 'Journey', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 md:pt-4 pointer-events-none">
      <div className="max-w-4xl mx-auto relative pointer-events-auto">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'glass-panel rounded-full h-14 md:h-16 flex items-center justify-between px-3 md:px-5 transition-all duration-300',
            isScrolled
              ? 'bg-[#07080d]/80 border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]'
              : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
          )}
          aria-label="Main Navigation"
        >
          {/* Brand Identity / Student Monogram */}
          <a
            href="#hero"
            className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded-full py-1 px-1.5"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-display font-bold text-sm shadow-[0_0_12px_rgba(0,242,254,0.35)] group-hover:shadow-[0_0_16px_rgba(0,242,254,0.6)] transition-shadow">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Chirag
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-neutral-400 font-mono tracking-tight leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LSA Kolkata
              </span>
            </div>
          </a>

          {/* Desktop Nav Links with Framer Motion layoutId Indicator */}
          <div
            className="hidden md:flex items-center gap-1"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {NAV_LINKS.map((link, idx) => (
              <motion.a
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHoveredIdx(idx)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors duration-150 rounded-full',
                  'text-neutral-300 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none'
                )}
              >
                {hoveredIdx === idx && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-full -z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Right Action: Connect CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3.5 md:px-4 py-2 rounded-full',
                'bg-gradient-to-r from-cyan-400 to-blue-500 text-black',
                'shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_22px_rgba(0,242,254,0.55)]',
                'focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-shadow'
              )}
            >
              <span>Connect</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.a>

            {/* Mobile Hamburger Toggle */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full glass-pill text-neutral-300 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-cyan-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </motion.nav>

        {/* Mobile Dropdown Panel with AnimatePresence */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="md:hidden mt-2 p-3 glass-panel rounded-2xl border border-white/15 shadow-2xl backdrop-blur-xl bg-[#07080d]/95"
            >
              <div className="flex flex-col space-y-1">
                {NAV_LINKS.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={handleLinkClick}
                    whileTap={{ scale: 0.98 }}
                    className="min-h-[44px] flex items-center justify-between px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                  >
                    <span>{link.label}</span>
                    <span className="text-neutral-500 text-xs font-mono">→</span>
                  </motion.a>
                ))}

                <div className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between px-4 py-2 text-[11px] text-neutral-400 font-mono">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Student Innovator @ LSA
                  </span>
                  <span>Kolkata, IN</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
