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
        canvas: "#f8f9fc",
        "canvas-soft": "#f1f3f9",
        card: "#ffffff",
        ink: "#111827",
        "ink-soft": "#1f2937",
        body: "#6b7280",
        hairline: "#e5e7eb",
        link: "#4f46e5",
        budget: {
          green: "#10b981",
          yellow: "#f59e0b",
          red: "#ef4444"
        }
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
