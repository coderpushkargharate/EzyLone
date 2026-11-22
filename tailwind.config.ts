import type { Config } from 'tailwindcss'

// Logo blue #2064c8 sits at 600, logo orange #ff9100 at 500.
const brandBlue = {
  50: '#eef4fc',
  100: '#d9e6f8',
  200: '#b8d0f2',
  300: '#8bb3e9',
  400: '#5a91de',
  500: '#3577d3',
  600: '#2064c8',
  700: '#1a52a6',
  800: '#184586',
  900: '#173b6d',
  950: '#0f2547',
}

const brandOrange = {
  50: '#fff8eb',
  100: '#ffecc9',
  200: '#ffd690',
  300: '#ffbb52',
  400: '#ffa424',
  500: '#ff9100',
  600: '#e07400',
  700: '#b95500',
  800: '#94420a',
  900: '#7a370c',
  950: '#461a02',
}

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palettes derived from the EzyLoan logo. `blue` and `orange` are
        // remapped site-wide so every existing blue-*/orange-* class is on-brand.
        blue: brandBlue,
        orange: brandOrange,
        brand: { ...brandBlue, DEFAULT: brandBlue[600], orange: brandOrange[500] },
        primary: brandBlue,
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        accent: brandOrange,
      },
      fontFamily: {
        // Inter (via next/font, exposed as --font-inter on <html>) is the primary
        // typeface, with a robust native-font fallback stack so text never reflows
        // to a wildly different metric before Inter loads.
        sans: [
          'var(--font-inter)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Tightened, consistent type scale with sensible line-heights baked in
        // so headings and body keep a clean vertical rhythm site-wide.
        'display': ['clamp(2.25rem, 1.5rem + 3vw, 3.75rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '800' }],
        'h1': ['clamp(1.875rem, 1.3rem + 2.2vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['clamp(1.5rem, 1.15rem + 1.4vw, 2.25rem)', { lineHeight: '1.18', letterSpacing: '-0.018em', fontWeight: '700' }],
        'h3': ['clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.012em', fontWeight: '600' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // ✅ Replaced heavy glass shadow with softer, faster-to-paint shadow
        soft: '0 4px 12px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        glow: '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config