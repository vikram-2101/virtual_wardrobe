/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        serif: ['"Playfair Display"', "Georgia", "serif"],
        handwriting: ['"Caveat"', "cursive"],
      },
      colors: {
        canvas: {
          DEFAULT: "#FAF8F5",
          alt: "#F6F2EC",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F5EFEA",
          muted: "#EFE9E1",
          tag: "#F4EFEB",
        },
        ink: {
          primary: "#14171A",
          secondary: "#5F6774",
          muted: "#9CA3AF",
          handwriting: "#656E7B",
        },
        border: {
          light: "#EAE5DF",
          subtle: "#E2DBD2",
          active: "#14171A",
        },
        accent: {
          amber: "#FDF8EB",
          gold: "#E8C872",
          dark: "#1B1D20",
          hover: "#0D0E10",
        },
      },
      boxShadow: {
        card: "0 10px 30px -5px rgba(20, 23, 26, 0.05), 0 4px 12px -2px rgba(20, 23, 26, 0.02)",
        floating:
          "0 20px 40px -10px rgba(20, 23, 26, 0.08), 0 8px 16px -4px rgba(20, 23, 26, 0.04)",
        polaroid:
          "0 15px 35px -5px rgba(20, 23, 26, 0.12), 0 5px 15px rgba(20, 23, 26, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};
