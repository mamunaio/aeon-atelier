/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep space canvas
        void: {
          950: '#050508',
          900: '#0a0a0f',
          850: '#0d0d16',
          800: '#12121d',
          700: '#1a1a2e',
          600: '#242438',
        },
        // Neon accent — electric violet / cyan
        aurora: {
          50: '#f2f0ff',
          100: '#e6e1ff',
          200: '#ccc2ff',
          300: '#a394ff',
          400: '#8b6dff',
          500: '#7b4dff',
          600: '#6a2fff',
          700: '#5a1fe6',
          800: '#4a19bd',
          900: '#3d1799',
        },
        cyber: {
          300: '#7df9ff',
          400: '#3ee6f0',
          500: '#12d3e0',
          600: '#06b6c9',
        },
        gold: {
          300: '#f5e6b8',
          400: '#e8cf8a',
          500: '#d4af37',
          600: '#b8942a',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #7b4dff 0%, #12d3e0 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f5e6b8 0%, #d4af37 60%, #b8942a 100%)',
        'void-radial': 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 55%, #050508 100%)',
        'mesh': 'radial-gradient(at 20% 20%, rgba(123,77,255,0.22) 0px, transparent 45%), radial-gradient(at 80% 10%, rgba(18,211,224,0.16) 0px, transparent 40%), radial-gradient(at 60% 80%, rgba(123,77,255,0.14) 0px, transparent 45%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        glow: '0 0 24px rgba(123, 77, 255, 0.45)',
        'glow-cyan': '0 0 24px rgba(18, 211, 224, 0.4)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.35)',
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-16px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(18deg)' },
          '75%': { transform: 'rotate(-8deg)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        blink: 'blink 4s ease-in-out infinite',
        wave: 'wave 1.2s ease-in-out',
      },
    },
  },
  plugins: [],
}
