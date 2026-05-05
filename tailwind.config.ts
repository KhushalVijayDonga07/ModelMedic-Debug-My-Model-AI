import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7c3aed",
          foreground: "#f5f3ff"
        },
        accent: {
          DEFAULT: "#14b8a6",
          foreground: "#ecfeff"
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
