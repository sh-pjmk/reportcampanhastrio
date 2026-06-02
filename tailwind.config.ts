import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: "#6B0F1A",
        gold: "#C9A84C",
        cream: "#FAF7F2",
        trio: {
          wine: "#6B0F1A",
          gold: "#C9A84C",
          cream: "#FAF7F2",
          text: "#2C1810",
          muted: "#8C7B6B",
        },
        status: {
          read: "#1a7a4a",
          delivered: "#1a4f7a",
          sent: "#6b6862",
          failed: "#9c2828",
          pending: "#7a5c1a",
          ignored: "#7a3c1a",
        },
      },
      fontFamily: {
        baskerville: ["var(--font-baskerville)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(44, 24, 16, 0.06), 0 1px 2px rgba(44, 24, 16, 0.04)",
        "card-hover": "0 4px 12px rgba(44, 24, 16, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
