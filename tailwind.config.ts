import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7CB342', // Green
        accent: '#D4AF37', // Gold
        purple: '#9B59B6',
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
        'gradient-green': 'linear-gradient(135deg, #7CB342 0%, #689F38 100%)',
        'gradient-purple': 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      },
      fontFamily: {
        school: ['"Comic Neue"', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config;
