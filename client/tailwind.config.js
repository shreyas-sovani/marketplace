/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors
        'primary-bg': '#020202',
        'secondary-bg': '#081A28',
        'card-bg': '#0D324D',
        'border': '#464668',
        'accent': '#7F5A83',
        'accent-hover': '#907195',
        'secondary-text': '#A188A6',
        'muted-text': '#9DA2AB',
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'garamond': ['EB Garamond', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'share-tech': ['Share Tech', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'marquee': 'marquee 30s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #7F5A83, 0 0 10px #7F5A83' },
          '100%': { boxShadow: '0 0 10px #7F5A83, 0 0 20px #7F5A83, 0 0 30px #7F5A83' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '8xs': '0.125rem',
        '7xs': '0.25rem',
        '6xs': '0.375rem',
        '5xs': '0.5rem',
        '4xs': '0.625rem',
        '3xs': '0.75rem',
        '2xs': '1rem',
        'xs': '1.5rem',
        'sm': '2rem',
        'md': '2.5rem',
        'lg': '3rem',
        'xl': '4rem',
        '2xl': '5rem',
        '3xl': '6rem',
      },
      borderRadius: {
        'sm': '0.375rem',
        'base': '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
    },
  },
  plugins: [],
}
