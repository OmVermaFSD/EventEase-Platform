/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: { green: '#00ff41', red: '#ff003c', yellow: '#ffb900' },
        bg: { dark: '#050505', card: '#0a0a0a', grid: '#111111' }
      },
      fontFamily: { mono: ['monospace'] },
      animation: { 'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' }
    },
  },
  plugins: [],
}
