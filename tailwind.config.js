/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        accent: '#000000',
        'accent-dark': '#000000',
        black: '#000000'
      },
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        dmsans: ['var(--font-dm-sans)']
      }
    }
  },
  plugins: [],
};
