import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#182230",
        paper: "#f8faf7",
        sage: "#6f8f72",
        lagoon: "#1c7c82",
        coral: "#e56a54",
        lemon: "#f4c95d",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(24, 34, 48, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
