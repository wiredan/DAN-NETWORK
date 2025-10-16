/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f0b90b", // Binance-style gold
        dark: "#0b0e11",
        light: "#fafafa",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class", // enables dark theme toggle
  plugins: [],
};