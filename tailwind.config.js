/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    extend: {colors: {
      'soft-pink': '#C9B1BD',
      'mauve': '#8E7CC3',
      'cyan': '#38A3A5',
      'yellow': '#F4D06F',
      'mint': '#98d0ae',
      'charcoal': '#36454F',
      'terracotta': '#E2725B',
      'cream': '#eae8e0',
      'lavender': '#AE9AC6',
      'peach': '#FFD1DC',
      'darkblue': '#1A237E'

    }},
    
  },
  plugins: [],
}

