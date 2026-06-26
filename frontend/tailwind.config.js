/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables class-based dark mode toggling
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#8B6914',      // Warm gold
          cream: '#F5F0E8',     // Soft cream background
          dark: '#2C1810',      // Deep brown/walnut
          goldLight: '#C5A85C', // Lighter gold accent
          sand: '#E6DEC9',      // Secondary cream tone
          bgDark: '#1E100A',    // Pitch dark brown for dark mode bg
          cardDark: '#2D1B13',  // Dark brown for cards
          textMuted: '#8E8278', // Warm grey text
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', '"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
