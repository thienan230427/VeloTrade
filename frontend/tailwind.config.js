/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080B11',
        surface: '#111622',
        surfaceLighter: '#1A2132',
        primary: '#00C2FF',
        secondary: '#7B61FF',
        success: '#00D26A',
        danger: '#FF4D6D',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
