/** @type {import('tailwindcss').Config} */
// As cores vêm de src/theme/tokens.js (fonte única de verdade).
// Para re-tematizar o app inteiro, edite os valores naquele arquivo.
const { light } = require('./src/theme/tokens');

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: light,
    },
  },
  plugins: [],
};
