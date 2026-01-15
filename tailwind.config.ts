import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--color-bg) / <alpha-value>)",
        surface: "hsl(var(--color-surface) / <alpha-value>)",
        ink: "hsl(var(--color-ink) / <alpha-value>)",
        muted: "hsl(var(--color-muted) / <alpha-value>)",
        accent: "hsl(var(--color-accent) / <alpha-value>)",
        accent2: "hsl(var(--color-accent-2) / <alpha-value>)",
        border: "hsl(var(--color-border) / <alpha-value>)",
        ring: "hsl(var(--color-ring) / <alpha-value>)"
      },
      borderRadius: {
        xl: "var(--radius)",
        "2xl": "var(--radius)"
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)"
      },
      boxShadow: {
        soft: "var(--shadow)"
      }
    }
  },
  plugins: []
};

export default config;
