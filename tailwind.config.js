/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensure Tailwind scans your components
  theme: {
    extend: {
      fontFamily: {
        sans: ["KyivType", "sans-serif"], // Set KyivType as the default sans-serif font
      },
      colors: {
        primary: "#ff730f", // Custom primary color
        accent: "#1E3E62",
        customOrange: "#ff730f",
        peach: {
          100: "#ffe5b4",
          200: "#ffcc99",
          300: "#ffb380",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  darkMode: "class", // Ensure "class" mode is enabled
  plugins: [],
};
