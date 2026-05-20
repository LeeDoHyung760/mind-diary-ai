/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f7f3ec",
        ink: "#1f2937",
        brand: {
          50: "#eef5f1",
          100: "#d8e8de",
          300: "#91b59d",
          500: "#4e7d61",
          700: "#2f4d3b",
          900: "#1d2f25"
        },
        accent: {
          100: "#fde7cf",
          300: "#f5b97a",
          500: "#db7f32"
        }
      },
      boxShadow: {
        panel: "0 20px 45px rgba(31, 41, 55, 0.08)"
      },
      fontFamily: {
        sans: ["'Segoe UI'", "sans-serif"]
      }
    },
  },
  plugins: [],
};
