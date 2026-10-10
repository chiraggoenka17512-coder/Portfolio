import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  GraduationCap,
  Github,
  Linkedin,
  Twitter,
  ArrowUpRight,
  Send,
  Loader2,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import { PROFILE } from '@/data';
import { Toast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';

// Emil Kowalski custom ease curve
const EMIL_EASE = [0.23, 1, 0.32, 1] as const;

interface FormState {
  name: string;
  email: string;
  collaborationType: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    collaborationType: 'Multimodal AI & LabelSense',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Validate form according to UI/UX Pro Max guidelines
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide your name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a message of at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsToastOpen(true);
      setFormData({
        name: '',
        email: '',
        collaborationType: 'Multimodal AI & LabelSense',
        message: '',
      });
      setErrors({});
    }, 900);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section
        id="contact"
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 pb-12"
        aria-label="Contact and Collaboration"
      >
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14 md:mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-cyan-400">
              Get in Touch
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Let's Build Something <span className="text-gradient-cyan">Meaningful</span>
          </h2>

          <p className="max-w-[56ch] text-base md:text-lg text-neutral-400 leading-relaxed font-sans">
            Open for technical discussions, AI collaborations, lab platform engineering, or student
            fellowship inquiries.
          </p>
        </div>

        {/* =========================================================================
            TWO-COLUMN CONTACT LAYOUT
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          {/* Left Column: Direct Links, Campus Status, Socials */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Campus Affiliation Card */}
              <div className="p-5 rounded-2xl glass-panel bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Affiliation</span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  {PROFILE.school}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Active high school builder combining academic study with hands-on AI vision and lab OS engineering.
                </p>
              </div>

              {/* Location Card */}
              <div className="p-5 rounded-2xl glass-panel bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                      Based In
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {PROFILE.location}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30">
                  IST (UTC+5:30)
                </span>
              </div>

              {/* Direct Email Card */}
              <a
                href={`mailto:${PROFILE.socials.email}`}
                className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-cyan-950/20 via-white/[0.02] to-transparent border border-cyan-500/20 hover:border-cyan-400/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-cyan-300/80 uppercase tracking-wider block">
                      Direct Email
                    </span>
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {PROFILE.socials.email}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* Live Flagship App Callout */}
              <a
                href="https://labelsense.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl glass-panel bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                      Flagship Live App
                    </span>
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      labelsense.ai.studio
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>

            {/* Social Connect Icons */}
            <div className="pt-4 border-t border-white/10">
              <span className="text-xs font-mono text-neutral-400 mb-3 block">
                Verified Channels
              </span>
              <div className="flex items-center gap-3">
                <motion.a
                  href={PROFILE.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="GitHub Profile"
                  className="p-3 rounded-xl glass-panel bg-white/[0.04] border border-white/10 hover:border-white/25 text-neutral-300 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </motion.a>

                <motion.a
                  href={PROFILE.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="LinkedIn Profile"
                  className="p-3 rounded-xl glass-panel bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 text-neutral-300 hover:text-cyan-300 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </motion.a>

                <motion.a
                  href={PROFILE.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="X / Twitter Profile"
                  className="p-3 rounded-xl glass-panel bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 text-neutral-300 hover:text-cyan-300 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Right Column: Accessible Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-6 sm:p-8 rounded-3xl glass-panel bg-neutral-950/60 border border-white/10 shadow-2xl space-y-5"
            >
              {/* Field 1: Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-neutral-200 mb-1.5"
                >
                  Your Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Alex Mercer"
                  className={cn(
                    'w-full min-h-[48px] px-4 rounded-xl text-sm text-white',
                    'bg-white/[0.03] border placeholder:text-neutral-500',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all',
                    errors.name ? 'border-red-500/60 bg-red-500/[0.02]' : 'border-white/10 hover:border-white/20'
                  )}
                />
                {errors.name && (
                  <p aria-live="polite" className="mt-1 text-xs text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-neutral-200 mb-1.5"
                >
                  Email Address <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="alex@domain.com"
                  className={cn(
                    'w-full min-h-[48px] px-4 rounded-xl text-sm text-white',
                    'bg-white/[0.03] border placeholder:text-neutral-500',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all',
                    errors.email ? 'border-red-500/60 bg-red-500/[0.02]' : 'border-white/10 hover:border-white/20'
                  )}
                />
                {errors.email && (
                  <p aria-live="polite" className="mt-1 text-xs text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Field 3: Collaboration Topic */}
              <div>
                <label
                  htmlFor="contact-topic"
                  className="block text-sm font-medium text-neutral-200 mb-1.5"
                >
                  Collaboration Interest
                </label>
                <div className="relative">
                  <select
                    id="contact-topic"
                    value={formData.collaborationType}
                    onChange={(e) =>
                      setFormData({ ...formData, collaborationType: e.target.value })
                    }
                    className={cn(
                      'w-full min-h-[48px] px-4 rounded-xl text-sm text-white appearance-none',
                      'bg-neutral-900 border border-white/10 hover:border-white/20',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all'
                    )}
                  >
                    <option value="Multimodal AI & LabelSense" className="bg-neutral-900 text-white">
                      Multimodal AI &amp; LabelSense
                    </option>
                    <option value="Atal Tinkering Lab Tech" className="bg-neutral-900 text-white">
                      Atal Tinkering Lab (ATL) Systems
                    </option>
                    <option value="Full-Stack Web Engineering" className="bg-neutral-900 text-white">
                      JavaScript, TypeScript &amp; React 19
                    </option>
                    <option value="General Inquiries" className="bg-neutral-900 text-white">
                      General Connection / Opportunity
                    </option>
                  </select>
                </div>
              </div>

              {/* Field 4: Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-neutral-200 mb-1.5"
                >
                  Your Message <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: undefined });
                  }}
                  placeholder="Share details about your idea, opportunity, or feedback..."
                  className={cn(
                    'w-full p-4 rounded-xl text-sm text-white resize-y',
                    'bg-white/[0.03] border placeholder:text-neutral-500',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all',
                    errors.message ? 'border-red-500/60 bg-red-500/[0.02]' : 'border-white/10 hover:border-white/20'
                  )}
                />
                {errors.message && (
                  <p aria-live="polite" className="mt-1 text-xs text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.16, ease: EMIL_EASE }}
                className={cn(
                  'w-full min-h-[48px] px-6 py-3 rounded-full flex items-center justify-center gap-2',
                  'text-sm font-semibold text-slate-950 transition-shadow',
                  'bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500',
                  'shadow-[0_0_20px_rgba(0,242,254,0.35)] hover:shadow-[0_0_28px_rgba(0,242,254,0.55)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* =========================================================================
            INTEGRATED FOOTER WITH BACK-TO-TOP & AUTHENTIC CREDITS
            ========================================================================= */}
        <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} {PROFILE.name}. All rights reserved.</span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="text-neutral-300">
              Student @ <strong className="font-semibold text-white">{PROFILE.school}</strong>
            </span>
          </div>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.16, ease: EMIL_EASE }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill hover:bg-white/[0.08] hover:text-white transition-colors"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
          </motion.button>
        </footer>
      </section>

      {/* Spring-Animated Floating Toast Notification */}
      <Toast
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        title="Message Dispatched"
        message="Thank you! Your note was sent successfully. I'll get back to you shortly."
      />
    </>
  );
};

export default ContactSection;
