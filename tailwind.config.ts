import type { Config } from 'tailwindcss';

/**
 * Цвета берутся из CSS-переменных, которые проставляет тема сада (палитра из админки)
 * и режим «для слабовидящих». Так один и тот же класс `bg-brand` работает и на портале,
 * и на сайте любого сада без пересборки.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
          ink: 'rgb(var(--brand-ink) / <alpha-value>)',
        },
        accent: 'rgb(var(--accent) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      borderRadius: {
        xl: 'var(--radius-md)',
        '2xl': 'var(--radius-lg)',
        '3xl': 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.12)',
        lift: '0 2px 4px rgb(15 23 42 / 0.05), 0 18px 40px -18px rgb(15 23 42 / 0.22)',
      },
      maxWidth: { content: '72rem' },
    },
  },
  plugins: [],
};

export default config;
