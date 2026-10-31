import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F3EFE6",
        surface: "#FAF7F0",
        sand: "#E6D9B8",
        border: "#D9D3C4",
        ink: "#1C211F",
        muted: "#5E655F",
        primary: {
          DEFAULT: "#0F4C45",
          hover: "#0B3934",
          light: "#E7EFEF",
        },
        accent: {
          DEFAULT: "#C0532D",
          hover: "#A64322",
          light: "#F9ECE8",
        },
        status: {
          active: "#2F6B3A",
          paid: "#2F6B3A",
          confirmed: "#2C4A6B",
          draft: "#7A7A72",
          closed: "#7A7A72",
          paused: "#A87B1E",
          warning: "#A87B1E",
          overdue: "#A3321F",
          error: "#A3321F",
        },
      },
      borderRadius: {
        arch: "170px 170px 26px 26px",
        leaf: "22px 4px 22px 4px",
        row: "14px 3px 14px 3px",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        sans: ["var(--font-instrument)", "sans-serif"],
        "mono-tabular": ["var(--font-ibm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
