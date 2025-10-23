/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Fondamento', 'serif'],
        body: ['Quintessential', 'cursive'],
      },
      colors: {
        folk: {
          text: '#2d3748',
          bg: '#fdfaf6',
          main: '#c05621',
          accent1: '#d69e2e',
          accent2: '#579dc2',
        },
      },
    },
  },
  plugins: [],
};
