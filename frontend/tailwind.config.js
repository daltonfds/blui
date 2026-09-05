/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          white: '#FFFFFF',
          fog: '#F6F8F7',
          ink: '#12140F',
          charcoal: '#1C1F19',
        },
        brand: {
          50: '#EAFBF1',
          100: '#CFF5DF',
          300: '#7FE0AA',
          500: '#1FAE64',
          600: '#178C50',
          700: '#0F6B3D',
          900: '#0A3D24',
        },
        signal: {
          red: '#E23B3B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '6px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 20, 15, 0.06), 0 1px 0 rgba(18, 20, 15, 0.04)',
      },
    },
  },
  plugins: [],
};
