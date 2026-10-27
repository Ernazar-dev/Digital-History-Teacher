import type { Config } from 'tailwindcss';
import { tokens } from './src/app/tokens';

/**
 * Tailwind — faqat layout, spacing, responsive va maxsus stillar uchun.
 * UI komponentlar (tugma, forma, jadval) — Ant Design. Preflight o'chirilgan,
 * chunki Ant Design o'zining reset stilini ishlatadi (to'qnashuvning oldini olish).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: tokens.color.primary, hover: tokens.color.primaryHover, soft: tokens.color.primarySoft },
        accent: { DEFAULT: tokens.color.accent, light: tokens.color.accentLight, soft: tokens.color.accentSoft },
        midnight: { DEFAULT: tokens.color.midnight, soft: tokens.color.midnightSoft },
        ink: tokens.color.ink,
        muted: tokens.color.muted,
        line: tokens.color.border,
        canvas: tokens.color.canvas,
      },
      borderRadius: { sm: `${tokens.radius.sm}px`, md: `${tokens.radius.md}px`, lg: `${tokens.radius.lg}px` },
      fontFamily: { sans: tokens.font.sans.split(','), serif: tokens.font.serif.split(',') },
      maxWidth: { prose: '68ch' },
      boxShadow: { card: tokens.shadow.card, lift: tokens.shadow.lift },
      transitionTimingFunction: { premium: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
} satisfies Config;
