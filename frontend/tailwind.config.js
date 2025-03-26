/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "bg-yellow-300", // 👈 zostawiamy, bo rozwiązuje Twój poprzedni problem
    "bg-green-500",
    "bg-red-500",
    "bg-blue-300",
  ],
  darkMode: "class", // 👈 WŁĄCZA OBSŁUGĘ MOTYWU CIEMNEGO
  theme: {
    extend: {},
  },
  plugins: [],
};
