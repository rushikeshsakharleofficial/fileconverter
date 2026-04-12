/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        'primary-foreground': '#ffffff',
        input: 'var(--border)',
        ring: 'var(--primary)',
        'base-content': 'var(--base-content)',
        'neutral': '#222222',
        'neutral-50': 'var(--neutral-50)',
        'base-300': 'var(--base-300)',
        highlight: 'var(--color-hightlight-light)',
        'accent-light': 'var(--color-accent-light)',
        'primary-light': 'var(--color-primary-light)',
        'secondary-light': 'var(--color-secondary-light)',
        'primary-new': 'var(--color-primary-new)',
        'accent-new': 'var(--color-accent-new)',
        'secondary-new': 'var(--color-secondary-new)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        display: ['var(--font-display)'],
        signika: ['Signika', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
      },
      animation: {
        'fade-in': 'simpleFadeIn 0.3s ease-out forwards',
        'pulse-bar': 'pulseBar 1.5s ease-in-out infinite',
        'pulse-bar-delay': 'pulseBarShort 1.5s ease-in-out 0.2s infinite',
        'pulse-bar-delay2': 'pulseBar 1.5s ease-in-out 0.4s infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        simpleFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseBar: {
          '0%, 100%': { 
            height: '24px',
            opacity: '0.6'
          },
          '50%': { 
            height: '12px',
            opacity: '0.2'
          }
        },
        pulseBarShort: {
          '0%, 100%': { 
            height: '16px',
            opacity: '0.6'
          },
          '50%': { 
            height: '8px',
            opacity: '0.2'
          }
        },
        glow: {
          '0%, 100%': { 
            opacity: '0.5',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.1)'
          }
        }
      },
    },
  },
  plugins: [],
};
