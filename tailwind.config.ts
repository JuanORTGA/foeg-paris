import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foeg: {
          white: '#F7F5F0', // Fond principal / Off-white
          black: '#1A1A1A', // Texte principal & éléments sombres / Noir doux
          navy: '#1B2A4A',  // Accent & identité de marque / Bleu marine profond
          // Tons neutres éditoriaux complémentaires pour le luxe silencieux
          muted: '#6E6B67',
          border: '#E6E3DC',
          surface: '#EFECE6',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '0px',
        md: '4px',
      },
      letterSpacing: {
        editorial: '0.08em',
        luxury: '0.18em',
        'luxury-wide': '0.28em',
      },
      boxShadow: {
        // En "silent luxury" les ombres sont quasi inexistantes ou ultra subtiles
        subtle: '0 1px 2px 0 rgba(26, 26, 26, 0.03)',
        floating: '0 4px 20px -2px rgba(27, 42, 74, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
