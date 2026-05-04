import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#c0a060',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
