/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f4',
          200: '#c3d3e8',
          300: '#94b3d7',
          400: '#5e8ec1',
          500: '#396fab',
          600: '#28558f',
          700: '#204374',
          800: '#1c3960',
          900: '#0c1d37',
          950: '#071122',
        },
        academic: {
          gold: '#b45309',
          'gold-light': '#fef3c7',
          'gold-dark': '#92400e',
          maroon: '#831843',
          crimson: '#991b1b',
          parchment: '#fcfbf7',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
      }
    },
  },
  plugins: [],
}
