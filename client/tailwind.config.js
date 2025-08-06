// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tailwind will scan your files here
  ],
  darkMode: 'class', // 👈 This is the key line!
  theme: {
    extend: {},
  },
  plugins: [],
}
