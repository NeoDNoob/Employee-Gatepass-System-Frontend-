/** @type {import('tailwindcss').Config} */
module.exports = {
  classic: true,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [ require('tailwindcss-animated'),],
}

