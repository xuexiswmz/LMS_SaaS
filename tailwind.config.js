/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./globals.css",
  ],
  theme: {
    extend: {},
  },
  darkMode: ["variant", { dark: "&:is(.dark *)" }],
  plugins: [],
};
