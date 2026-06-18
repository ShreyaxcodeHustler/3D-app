/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-0": "#050610",
        "bg-1": "#0b1022",
        "bg-2": "#121a36",
        "neon": "#aa3bff",
        "neon-2": "#22c55e",
        "warn": "#fbbf24",
      },
      boxShadow: {
        neon: "0 0 20px rgba(170, 59, 255, 0.35)",
      },
    },
  },
  plugins: [],
}

