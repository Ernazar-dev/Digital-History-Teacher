/**
 * Dizayn tokenlari — YAGONA manba. Ant Design temasi va Tailwind konfiguratsiyasi
 * shu qiymatlardan foydalanadi (rang/radius/shrift bir joyda o'zgartiriladi).
 * Konsepsiya: "tungi muzey" — chuqur lojuvard (lapis) + oltin + fil suyagi fon.
 */
export const tokens = {
  color: {
    primary: '#1b3768', // lojuvard ko'k
    primaryHover: '#284b8a',
    primarySoft: '#e9eef8',
    midnight: '#0b1530', // eng to'q fon (sidebar, hero)
    midnightSoft: '#13224a',
    accent: '#c29a45', // oltin aksent
    accentLight: '#e6c77c',
    accentSoft: '#f7f0e1',
    ink: '#141c2e',
    muted: '#5d6779',
    border: '#e6e3dc',
    surface: '#ffffff',
    canvas: '#f7f5f0', // fil suyagi
    success: '#2f7d4f',
    warning: '#b7791f',
    danger: '#b42318',
  },
  radius: { sm: 8, md: 12, lg: 18 },
  shadow: {
    card: '0 1px 2px rgba(11,21,48,0.04), 0 8px 24px -12px rgba(11,21,48,0.12)',
    lift: '0 2px 4px rgba(11,21,48,0.05), 0 22px 44px -18px rgba(11,21,48,0.28)',
  },
  font: {
    sans: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    serif: "'Playfair Display', 'Source Serif 4', Georgia, 'Times New Roman', serif",
  },
} as const;
