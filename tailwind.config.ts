import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7CB342', // Pasture green
        accent: '#D4AF37', // Curious gold
        'summit': {
          light: '#FFFFFF',
          DEFAULT: '#D4AF37',
          dark: '#1A1A1A',
        },
        'pasture': {
          light: '#7CB342',
          DEFAULT: '#F5E6D3',
          dark: '#8B7355',
        },
        'star': {
          light: '#9B59B6',
          DEFAULT: '#D4AF37',
          bright: '#FFFFFF',
        },
      },
      backgroundImage: {
        'gradient-summit': 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 50%, #1A1A1A 100%)',
        'gradient-pasture': 'linear-gradient(135deg, #7CB342 0%, #F5E6D3 50%, #8B7355 100%)',
        'gradient-star': 'linear-gradient(135deg, #9B59B6 0%, #D4AF37 50%, #FFFFFF 100%)',
      },
      fontFamily: {
        school: ['"Comic Neue"', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config;
