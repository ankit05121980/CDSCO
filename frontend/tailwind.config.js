/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CDSCO / Government of India palette
        navy: {
          DEFAULT: '#0b3d7b',
          50: '#eef4fb',
          100: '#d6e4f5',
          200: '#aecae9',
          300: '#7ba6d8',
          400: '#4a7fc2',
          500: '#2a5fa3',
          600: '#1b4884',
          700: '#0b3d7b',
          800: '#0a2f5e',
          900: '#082244',
        },
        saffron: {
          DEFAULT: '#FF9933',
          light: '#ffb866',
          dark: '#e07d1a',
        },
        indiagreen: {
          DEFAULT: '#138808',
          light: '#1fae12',
          dark: '#0e6606',
        },
        ink: '#1f2933',
        surface: '#f6f8fb',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.06)',
        cardhover: '0 8px 24px rgba(16,24,40,0.12)',
      },
    },
  },
  plugins: [],
};
