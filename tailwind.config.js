/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensure Tailwind scans your components
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Custom primary color
        accent: "#2563EB",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  darkMode: "class", // Ensure "class" mode is enabled
  theme: {
    extend: {},
  },
  plugins: [],
};
