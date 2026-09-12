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
        // Design System Extracted Tokens from Realty Hub / Soft Pastel Aesthetic
        realty: {
          dark: '#111625',
          darkHover: '#1c2336',
          card: '#ffffff',
          cardSubtle: '#f7fbfd',
          border: 'rgba(0, 0, 0, 0.05)',
          textPrimary: '#111625',
          textSecondary: '#5e6d82',
          textMuted: '#94a3b8',
        },
        pastel: {
          lime: '#d7f4b7',
          limeDark: '#27520d',
          limeBadge: '#c8f596',
          mint: '#9ce5d7',
          mintDark: '#0a4c41',
          mintBadge: '#b7f3e8',
          pink: '#f5b5b5',
          pinkDark: '#6b1a1a',
          pinkBadge: '#fcd5d5',
        },
        tag: {
          rental: '#3dbda7',
          sale: '#f16462',
          subtle: '#eef3f6',
        },
        // Backward-compatible surface mappings for m3 and mono aliases
        mono: {
          black: '#111625',
          white: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b0f19',
          surface: {
            DEFAULT: '#ffffff',
            elevated: '#ffffff',
            card: '#ffffff',
            border: '#e2e8f0',
          }
        },
        openai: {
          dark: '#111625',
          surface: '#ffffff',
          elevated: '#f7fbfd',
          border: '#e2e8f0',
          accent: '#111625',
          accentHover: '#1c2336',
          subtle: '#94a3b8',
          muted: '#64748b',
        },
        m3: {
          surface0: '#eef5f7',
          surface1: '#ffffff',
          surface2: '#f7fbfd',
          surface3: '#e5eff2',
          surface4: '#cbd5e1',
          surface5: '#94a3b8',
          primary: '#111625',
          primaryContainer: '#111625',
          onPrimaryContainer: '#ffffff',
          secondaryContainer: '#d7f4b7',
          onSecondaryContainer: '#27520d',
          outline: 'rgba(0, 0, 0, 0.06)',
          outlineVariant: 'rgba(0, 0, 0, 0.04)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '28px',
        'full': '9999px',
      },
      borderWidth: {
        '1': '1px',
        '1.5': '1.5px',
      },
      boxShadow: {
        'soft-card': '0 10px 30px -5px rgba(17, 22, 37, 0.03), 0 4px 12px 0 rgba(17, 22, 37, 0.02)',
        'float-bar': '0 14px 35px rgba(17, 22, 37, 0.08)',
        'pill-active': '0 6px 18px rgba(17, 22, 37, 0.18)',
        'glass-subtle': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'card': '0 10px 30px -5px rgba(17, 22, 37, 0.03)',
        'elevated': '0 20px 40px -10px rgba(17, 22, 37, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
};
