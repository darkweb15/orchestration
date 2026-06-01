/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B4FD4',
        'primary-light': '#7C5FE8',
        background: '#F5F3FF',
        'card-bg': '#FFFFFF',
        text: '#1F2937',
        'text-light': '#6B7280',
        accent: '#10B981',
        'accent-orange': '#F97316',
      },
    },
  },
  plugins: [],
}
