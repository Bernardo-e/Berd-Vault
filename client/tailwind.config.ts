import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        brand: {
          DEFAULT: "#6C63FF",
          50:  "#f0f0ff",
          100: "#e4e3ff",
          200: "#cccaff",
          300: "#aaa6ff",
          400: "#8a84ff",
          500: "#6C63FF",
          600: "#5a50f5",
          700: "#4a3ee0",
          800: "#3d33b8",
          900: "#342e96",
        },
        teal: {
          DEFAULT: "#00D4AA",
          400: "#34d9b8",
          500: "#00D4AA",
          600: "#00b894",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)",
        "gradient-dark":  "linear-gradient(135deg, #0A0A14 0%, #12122a 100%)",
        "mesh-gradient":  "radial-gradient(at 40% 20%, #6C63FF33 0px, transparent 50%), radial-gradient(at 80% 0%, #00D4AA22 0px, transparent 50%), radial-gradient(at 0% 50%, #6C63FF11 0px, transparent 50%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(108,99,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-lg": "0 16px 48px rgba(108,99,255,0.20), inset 0 1px 0 rgba(255,255,255,0.15)",
        glow:    "0 0 20px rgba(108,99,255,0.4)",
        "glow-teal": "0 0 20px rgba(0,212,170,0.4)",
      },
      animation: {
        "fade-in":     "fadeIn 0.5s ease forwards",
        "slide-up":    "slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "float":       "float 3s ease-in-out infinite",
        "pulse-slow":  "pulse 3s ease-in-out infinite",
        "gradient-x":  "gradientX 4s ease infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        float:     { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
        gradientX: { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
export default config;
