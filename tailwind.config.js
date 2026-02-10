/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial color system - calm, credible, reading-focused
        primary: {
          DEFAULT: '#475569', // slate-600 - muted, professional
          dark: '#334155',    // slate-700
          light: '#64748b',   // slate-500
        },
        accent: {
          DEFAULT: '#6366f1', // indigo-500 - restrained, not loud
          dark: '#4f46e5',    // indigo-600
          light: '#818cf8',   // indigo-400
          subtle: '#e0e7ff',  // indigo-100
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc', // slate-50
          tertiary: '#f1f5f9',  // slate-100
        },
        editorial: {
          bg: '#fafaf9',       // stone-50 - warm neutral
          border: '#e7e5e4',   // stone-200
          text: '#292524',     // stone-800
          muted: '#78716c',    // stone-500
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['Charter', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'editorial-title': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em', fontWeight: '600' }],
        'article-title': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '500' }],
        'meta': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '500' }],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'editorial': '0.5rem',
      },
      spacing: {
        'editorial': '1.75rem',
      },
    },
  },
  plugins: [],
}