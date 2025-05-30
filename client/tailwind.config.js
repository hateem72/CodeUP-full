/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: "#3dffa2",
        "hover-teal": "#2ecc8b",
        yellow: "#f8ec9e",
        "hover-yellow": "#e6d87a",
        background: "#1a1a1a",
        tertiary: "#333333",
        quaternary: "#4d4d4d",
        quinary: "#666666",
        senary: "#808080",
        septenary: "#999999",
        octonary: "#b3b3b3",
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
        'serif': ['Lora', 'serif'],
        'Fira Code': ['Fira Code', 'monospace'],
        'Orbitron': ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to right, #9C27B0, #7B1FA2)",
      },
    },
  },
  plugins: [],
}