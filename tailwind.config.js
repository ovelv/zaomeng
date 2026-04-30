/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 20px 80px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
