/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ハードボイルドテーマカラー
        noir: {
          darkest: '#0a0a0a',
          darker: '#1a1a1a',
          dark: '#2a2a2a',
          DEFAULT: '#3a3a3a',
          light: '#4a4a4a',
        },
        detective: {
          gold: '#d4af37',
          amber: '#ffbf00',
          crimson: '#990000',
        }
      },
      fontFamily: {
        'detective': ['"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
