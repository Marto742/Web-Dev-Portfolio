/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#F5A623',
          light: '#FFD060',
          dark: '#D4881A',
        },
        bg: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          alt: 'rgb(var(--color-bg-alt) / <alpha-value>)',
          card: 'rgb(var(--color-bg-card) / <alpha-value>)',
          glass: 'rgba(255,255,255,0.03)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', '"Fira Code"', 'monospace'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'grain': 'grain 8s steps(10) infinite',
        'spin-slow': 'spin 25s linear infinite',
        'spin-reverse': 'spin 35s linear infinite reverse',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-2%, -3%)' },
          '20%': { transform: 'translate(3%, 2%)' },
          '30%': { transform: 'translate(-1%, 4%)' },
          '40%': { transform: 'translate(4%, -1%)' },
          '50%': { transform: 'translate(-3%, 1%)' },
          '60%': { transform: 'translate(1%, -4%)' },
          '70%': { transform: 'translate(-4%, 3%)' },
          '80%': { transform: 'translate(2%, -2%)' },
          '90%': { transform: 'translate(-1%, 3%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(245,166,35,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(245,166,35,0.7)' },
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
