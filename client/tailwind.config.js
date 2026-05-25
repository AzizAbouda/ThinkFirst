/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Warm, academic palette — not corporate blue
        ink: {
          50: "#f7f6f3",
          100: "#edeae3",
          200: "#d9d3c7",
          300: "#c0b7a5",
          400: "#a4977f",
          500: "#8c7d63",
          600: "#736553",
          700: "#5e5244",
          800: "#4e4439",
          900: "#433b31",
          950: "#241f1a",
        },
        sage: {
          400: "#84a98c",
          500: "#6b8f74",
          600: "#527a5c",
        },
        amber: {
          400: "#f59e0b",
          500: "#d97706",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
