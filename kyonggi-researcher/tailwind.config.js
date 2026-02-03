/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kyonggi: {
          primary: '#003366',
          secondary: '#0066cc',
          accent: '#ff6600',
        },
      },
    },
  },
  plugins: [],
};
