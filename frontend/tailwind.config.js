const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      backgroundColor: {
        'white/5': 'color-mix(in oklab, var(--color-white) 5%, transparent)',
      },
      spacing: {
        '1': 'calc(var(--spacing) * 1)',
        '2': 'calc(var(--spacing) * 2)',
        '3': 'calc(var(--spacing) * 3)',
        '4': 'calc(var(--spacing) * 4)',
        '5': 'calc(var(--spacing) * 5)',
        '6': 'calc(var(--spacing) * 6)',
        '7': 'calc(var(--spacing) * 7)',
        '8': 'calc(var(--spacing) * 8)',
        '9': 'calc(var(--spacing) * 9)',
        '10': 'calc(var(--spacing) * 10)',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('data-hover', '&[data-hover]');
      addVariant('data-active', '&[data-active]');
      addVariant('data-current', '&[data-current]');
    },
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.spacing': {
          '--spacing': '0.25rem',
        },
      })
    }),
  ],
}