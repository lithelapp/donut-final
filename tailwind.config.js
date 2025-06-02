/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    theme: {
    extend: {
      colors: {
        customBackground: {
          blue: "#2069FA", // Background for blue theme
          pink: "#FFDCFA", // Background for pink theme
        },
      },
    },
  },
  },
  plugins: [],
};
