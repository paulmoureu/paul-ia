import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#eaf6ff",
        paper: "#0b111c",
        sage: "#7dd3c7",
        lagoon: "#38bdf8",
        coral: "#fb7185",
        lemon: "#d9f99d",
      },
      boxShadow: {
        soft: "0 28px 90px rgba(0, 0, 0, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
