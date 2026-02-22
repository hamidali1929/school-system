/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#003366', // Deep Navy
          600: '#002a55',
          700: '#002144',
          800: '#001833',
          900: '#000f22',
          950: '#000611',
        },
        yellow: {
          50: '#fffbea',
          100: '#fff1c1',
          200: '#ffe382',
          300: '#ffca43',
          400: '#fbbf24', // Institutional Yellow
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        sidebar: {
          light: '#ffffff',
          dark: '#001833',
        },
        accent: {
          gold: '#fbbf24',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
