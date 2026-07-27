import type { Config } from "tailwindcss";

function withOpacity(variableName: string): any {
  return ({ opacityValue }: { opacityValue?: string | number }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

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
        canvas: withOpacity("--canvas"),
        "canvas-soft": withOpacity("--canvas-soft"),
        card: withOpacity("--card"),
        ink: withOpacity("--ink"),
        "ink-soft": withOpacity("--ink-soft"),
        body: withOpacity("--body"),
        hairline: withOpacity("--hairline"),
        link: withOpacity("--link"),
        budget: {
          green: "#10b981",
          yellow: "#f59e0b",
          red: "#ef4444"
        }
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
