module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      fontFamily: {
        sans: ['var(--font-family)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
