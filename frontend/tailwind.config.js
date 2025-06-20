/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vfx-dark': '#1a1a1a',
        'vfx-darker': '#0f0f0f',
        'vfx-accent': '#ff6b35',
        'vfx-blue': '#4a9eff',
        'vfx-green': '#00d4aa',
        'vfx-purple': '#8b5cf6'
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}