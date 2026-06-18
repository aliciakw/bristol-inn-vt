/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    screens: {
      mobile: '0px', // Unprefixed, all devices (mobile-first base)
      tablet: '640px', // tablet: prefix for tablet and up
      desktop: '1024px', // desktop: prefix for desktop and up
    },
    borderRadius: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
    },
    extend: {},
  },
  plugins: [],
};
