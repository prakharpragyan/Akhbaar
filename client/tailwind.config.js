/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#eeece6',
          200: '#d9d5c9',
          300: '#b8b2a0',
          500: '#7a7362',
          700: '#3d3830',
          900: '#1a1713',
        },
        accent: {
          DEFAULT: '#c8432b',
          light: '#f0e8e5',
          dark: '#9e3321',
        }
      }
    }
  },
  plugins: []
}
