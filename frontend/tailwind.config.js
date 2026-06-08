/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2dc275",
        secondary: "#2a2d34",
        accent: "#27272a",
      },
    },
  },
  plugins: [],
}
