/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      spacing: {
        '24': '6rem',  // Make sure p-24 works as 6rem (96px)
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
      },
    },
  },
  plugins: [],
  important: true, // Changed from '#app-root' to true for global importance
  corePlugins: {
    preflight: false
  }
}
