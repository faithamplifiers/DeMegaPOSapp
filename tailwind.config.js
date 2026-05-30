/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A1F3C', // Navy Blue
          light: '#1A3A5F',
          dark: '#051528',
        },
        secondary: {
          DEFAULT: '#D4AF37', // Gold
          light: '#E5C76B',
          dark: '#B39020',
        },
        light: {
          DEFAULT: '#FFFFFF', // White
          gray: '#F5F5F5', // Light Gray
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};