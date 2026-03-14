import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "rgb(var(--bg-app))",
        surface: "rgb(var(--bg-surface))",
        "surface-muted": "rgb(var(--bg-surface-muted))",
        "surface-elevated": "rgb(var(--bg-surface-elevated))",
        sidebar: "rgb(var(--bg-sidebar))",
        chat: "rgb(var(--bg-chat))",
        composer: "rgb(var(--bg-composer))",
        primary: {
          DEFAULT: "rgb(var(--text-primary))",
          secondary: "rgb(var(--text-secondary))",
          muted: "rgb(var(--text-muted))",
          inverse: "rgb(var(--text-inverse))",
          brand: "rgb(var(--text-brand))",
        },
        border: {
          default: "rgb(var(--border-default))",
          muted: "rgb(var(--border-muted))",
          strong: "rgb(var(--border-strong))",
        },
        brand: {
          DEFAULT: "rgb(var(--brand-primary))",
          hover: "rgb(var(--brand-primary-hover))",
          soft: "rgb(var(--brand-primary-soft))",
        },
        message: {
          own: "rgb(var(--message-own-bg))",
          "own-text": "rgb(var(--message-own-text))",
          other: "rgb(var(--message-other-bg))",
          "other-text": "rgb(var(--message-other-text))",
        },
        state: {
          success: "rgb(var(--success))",
          warning: "rgb(var(--warning))",
          danger: "rgb(var(--danger))",
          info: "rgb(var(--info))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        overlay: "var(--shadow-overlay)",
      },
      spacing: {
        18: "var(--space-6)",
        22: "var(--space-5)",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        drawer: "var(--z-drawer)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
