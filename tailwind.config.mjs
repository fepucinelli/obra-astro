/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "obra-black": "#080808",
        "obra-white": "#F0EDE6",
        "obra-accent": "#C8FF00",
        "obra-card": "#1A1A1A",
        "obra-muted": "#444444",
      },
      fontFamily: {
        mono: ["New Science", "Courier New", "monospace"],
        display: ["New Science", "system-ui", "sans-serif"],
        body: ["Barlow Condensed", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.3em",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        "grain": "grain 8s steps(10) infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "20%": { transform: "translate(3%, 2%)" },
          "30%": { transform: "translate(-1%, 4%)" },
          "40%": { transform: "translate(2%, -1%)" },
          "50%": { transform: "translate(-3%, 3%)" },
          "60%": { transform: "translate(1%, -2%)" },
          "70%": { transform: "translate(4%, 1%)" },
          "80%": { transform: "translate(-2%, 4%)" },
          "90%": { transform: "translate(3%, -3%)" },
        },
      },
    },
  },
  plugins: [],
};
