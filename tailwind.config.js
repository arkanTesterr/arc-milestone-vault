/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        arc: {
          50:  '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#59afff',
          500: '#338dff',
          600: '#1a6df5',
          700: '#1356e1',
          800: '#1646b6',
          900: '#183d8f',
          950: '#132757',
        },
        vault: {
          dark:    '#0a0e1a',
          panel:   '#111827',
          surface: '#1a2236',
          border:  '#283350',
          muted:   '#6b7fa3',
        },
        status: {
          pending:   '#f59e0b',
          submitted: '#3b82f6',
          approved:  '#10b981',
          rejected:  '#ef4444',
          paid:      '#8b5cf6',
        },
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(51, 141, 255, 0.2)' },
          '50%':      { boxShadow: '0 0 20px rgba(51, 141, 255, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
