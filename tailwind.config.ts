import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#ffffff",
        "canvas-soft": "#f5f5f5",
        ink: "#000000",
        "ink-soft": "#1a1a1a",
        body: "#757575",
        hairline: "#e0e0e0",
        link: "#057dbc",
        budget: {
          green: "#16a34a",
          yellow: "#d97706",
          red: "#dc2626"
        }
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "sans-serif"]
      },
      borderRadius: {
        none: "0"
      }
    }
  },
  plugins: []
};

export default config;
