/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#F0B90B",
          DEFAULT: "#F0B90B", // Binance Gold
          dark: "#C79A08",
        },
        secondary: "#1E2329", // Binance Dark
        accent: "#2B3139",
        success: "#0ECB81",
        error: "#F6465D",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  darkMode: "class", // Supports dark theme toggle
  plugins: [],
};