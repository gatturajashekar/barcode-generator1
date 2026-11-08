/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fbf2f4',
          100: '#f6e3e8',
          200: '#ecc5cf',
          300: '#dc9aac',
          400: '#c66780',
          500: '#a83f5d',
          600: '#8d2f49',
          700: '#800020',
          800: '#6b0019',
          900: '#4d0011',
          950: '#2e000a',
        },
        gold: {
          50: '#fdfaef',
          100: '#faf2d4',
          200: '#f4e3a8',
          300: '#eccd6f',
          400: '#e3b642',
          500: '#d4a02e',
          600: '#b87f24',
          700: '#925f21',
          800: '#7a4c22',
          900: '#684020',
        },
      },
      fontFamily: {
        serif: ['Marcellus', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'maroon': '0 10px 40px -10px rgba(128, 0, 32, 0.25)',
        'card': '0 4px 24px -8px rgba(15, 23, 42, 0.12)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
