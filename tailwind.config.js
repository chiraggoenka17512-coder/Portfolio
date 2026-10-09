/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Direct tokens from AGENTS.md and prompt specifications
        'bg-space': '#07080d',
        'bg-space-dark': '#0b0d14',
        'bg-surface': 'rgba(17, 19, 31, 0.7)',
        'accent-cyan': '#00f2fe',
        'accent-blue': '#4facfe',
        'accent-purple': '#8a2be2',
        'accent-emerald': '#10b981',
        'accent-amber': '#f59e0b',
        // Grouped semantic scales
        space: {
          DEFAULT: '#07080d',
          dark: '#0b0d14',
          surface: 'rgba(17, 19, 31, 0.7)',
          card: 'rgba(255, 255, 255, 0.03)',
        },
        accent: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#8a2be2',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'glow-spin': 'glow-spin 8s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      transitionTimingFunction: {
        'emil-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'emil-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'emil-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        highlight: 'rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
