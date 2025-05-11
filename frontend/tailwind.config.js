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
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('data-hover', '&[data-hover]');
      addVariant('data-active', '&[data-active]');
      addVariant('data-current', '&[data-current]');
    }
  ],
}