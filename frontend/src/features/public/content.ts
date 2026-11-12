import i18n from '@/i18n';

/** Platforma konsepsiyasi: pedagogik zanjir qadamlari — i18n kalitlari (körsatişda t() bilan) */
export const CHAIN: readonly string[] = Array.from({ length: 8 }, (_, i) => `landing.chain${i + 1}`);

const MODULE_DEFS = [
  { n: 1, to: '/app/sources' },
  { n: 2, to: '/app/lessons' },
  { n: 3, to: '/app/museum' },
  { n: 4, to: '/app/assignments' },
  { n: 5, to: '/app/methodology' },
  { n: 6, to: '/app/profile' },
] as const;

/** Modullar: matnlar öqilganda joriy tilda hisoblanadi */
export const MODULES = MODULE_DEFS.map(({ n, to }) => ({
  n,
  to,
  get short() { return i18n.t(`landing.m${n}Short`); },
  get brief() { return i18n.t(`landing.m${n}Brief`); },
  get title() { return i18n.t(`landing.m${n}Title`); },
  get text() { return i18n.t(`landing.m${n}Text`); },
}));
