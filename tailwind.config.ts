import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: { DEFAULT: "#10b981", dark: "#047857", light: "#d1fae5" },
        gold: { DEFAULT: "#f59e0b", light: "#fef3c7" },
        sky: { DEFAULT: "#0ea5e9", light: "#e0f2fe" },
        danger: { DEFAULT: "#f43f5e", light: "#ffe4e6" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        pulseLive: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        pulseLive: "pulseLive 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
