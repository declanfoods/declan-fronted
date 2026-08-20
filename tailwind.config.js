/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D8E2D",
        "primary-dark": "#066038",
        "primary-deep": "#34602B",
        "primary-bright": "#6DBE47",
        "primary-olive": "#808847",
        accent: "#D07F2E",
      },
      fontFamily: {
  sans: ["Inter", "sans-serif"],
  heading: ["Plus Jakarta Sans", "sans-serif"],
},
    },
  },
  plugins: [],
};