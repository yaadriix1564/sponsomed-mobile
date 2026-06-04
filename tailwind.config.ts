import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e40af', light: '#dbeafe', dark: '#1e3a8a' },
        accent:  { DEFAULT: '#0891b2', light: '#cffafe' },
        surface: '#f8faff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        card: '0 2px 16px -2px rgba(30,64,175,0.10)',
        'card-hover': '0 8px 32px -4px rgba(30,64,175,0.18)',
        bottom: '0 -2px 16px -2px rgba(30,64,175,0.08)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.4s ease-out',
      },
      keyframes: {
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        bounceSoft: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(0.92)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
