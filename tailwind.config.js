/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './views/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep obsidian luxury canvas
        void: {
          950: '#070709',
          900: '#09090B',
          850: '#0F0F13',
          800: '#121216',
          700: '#1B1B21',
          600: '#27272F',
        },
        // Crimson seal & warm stone accents
        aurora: {
          50: '#fef2f2',
          100: '#fde3e2',
          200: '#fbcbc9',
          300: '#f59e99',
          400: '#eb6861',
          500: '#E03E36',
          600: '#c8322b',
          700: '#a62620',
          800: '#89221d',
          900: '#72211d',
        },
        cyber: {
          300: '#F2EFE9',
          400: '#D8D2C7',
          500: '#9E988E',
          600: '#787269',
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
        'aurora-gradient': 'linear-gradient(135deg, #E03E36 0%, #b82922 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f5e6b8 0%, #d4af37 60%, #b8942a 100%)',
        'void-radial': 'radial-gradient(ellipse at top, #16161B 0%, #09090B 60%, #070709 100%)',
        'mesh': 'radial-gradient(at 20% 20%, rgba(224,62,54,0.12) 0px, transparent 45%), radial-gradient(at 80% 10%, rgba(242,239,233,0.06) 0px, transparent 40%), radial-gradient(at 60% 80%, rgba(224,62,54,0.08) 0px, transparent 45%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.55)',
        glow: '0 0 24px rgba(224, 62, 54, 0.35)',
        'glow-cyan': '0 0 24px rgba(242, 239, 233, 0.2)',
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
