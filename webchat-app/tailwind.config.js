/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
 
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',],
  theme: {
    extend: {
      backgroundImage: {
        'wood-pattern': "url('/assets/wood.png')",
      },
      fontFamily: {
        questrial: ["Questrial", "sans-serif"],
        ramaraja: ["Ramaraja", "serif"],
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '0.50' }, // Start and end at 50% opacity
          '50%': { opacity: '0.1' }, // Middle of animation at 65% opacity
        },
      },
    },
  },
  plugins: [],
}

