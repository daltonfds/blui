/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          white: '#FFFFFF',
          fog: '#F5F8FF',
          ink: '#0B1220',
          charcoal: '#111827',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          300: '#93C5FD',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#172554',
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
        card: '0 1px 2px rgba(11, 18, 32, 0.06), 0 1px 0 rgba(11, 18, 32, 0.04)',
      },
    },
  },
  plugins: [],
};
