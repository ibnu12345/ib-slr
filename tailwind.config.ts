import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            DEFAULT: "#17324D",
            hover: "#12273D",
            light: "#244A70",
            dark: "#0E1F30",
          },
          teal: {
            DEFAULT: "#2F7D78",
            hover: "#266662",
            light: "#3E9C96",
            surface: "#EFF7F6",
          },
          bg: "#F7F8FA",
          surface: "#FFFFFF",
          text: {
            DEFAULT: "#17212B",
            muted: "#667085",
            subtle: "#98A2B3",
          },
          border: {
            DEFAULT: "#E4E7EC",
            dark: "#D0D5DD",
          },
          success: {
            DEFAULT: "#18794E",
            surface: "#ECFDF3",
          },
          warning: {
            DEFAULT: "#B7791F",
            surface: "#FEF7EC",
          },
          danger: {
            DEFAULT: "#B42318",
            surface: "#FEF3F2",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
        md: "6px",
      },
    },
  },
  plugins: [],
} satisfies Config;
