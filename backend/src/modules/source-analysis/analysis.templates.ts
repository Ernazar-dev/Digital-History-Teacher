import type { SourceType } from '@prisma/client';

export interface AnalysisQuestion {
  key: string;
  label: string;
  hint?: string;
  /// Tahlil bosqichi (tanqidiy tahlil zanjiri)
  section: 'identification' | 'critical' | 'synthesis' | 'pedagogical';
  required: boolean;
  /// text — erkin javob; choice — variantlardan biri (masalan, ishonchlilik darajasi)
  kind?: 'text' | 'choice';
  options?: { value: string; label: string }[];
}

/** Ishonchlilik darajasi — hujjat, 2-modul: «manbaning ishonchliligini baholash» */
export const RELIABILITY_LEVELS = [
  { value: 'HIGH', label: 'Yuqori — boshqa manbalar bilan tasdiqlanadi, muallif voqeaga yaqin' },
  { value: 'MEDIUM', label: 'O‘rta — qisman tasdiqlanadi, tarafkashlik belgilari bor' },
  { value: 'LOW', label: 'Past — tasdiqlanmaydi yoki kelib chiqishi noaniq' },
];

/** Barcha manba turlari uchun umumiy savollar (master prompt, 6.2-bo'lim) */
const COMMON: AnalysisQuestion[] = [
  { key: 'sourceType', section: 'identification', required: true, label: 'Manba qanday turga mansub?' },
  {
    key: 'created',
    section: 'identification',
    required: true,
    label: 'Qachon yaratilgan?',
    hint: 'Aniq sana noma’lum bo‘lsa, taxminiy davr va uning asosini yozing.',
  },
  { key: 'author', section: 'identification', required: true, label: 'Muallifi yoki yaratuvchisi kim?' },
  {
    key: 'origin',
    section: 'identification',
    required: true,
    label: 'Manbaning kelib chiqishi qanday?',
    hint: 'Qayerda, qanday sharoitda yaratilgan va hozir qayerda saqlanadi?',
  },
  { key: 'purpose', section: 'critical', required: true, label: 'Muallifning maqsadi va nuqtayi nazari qanday bo‘lishi mumkin?' },
  { key: 'information', section: 'critical', required: true, label: 'Manbada qanday tarixiy ma’lumotlar mavjud?' },
  {
    key: 'evidence',
    section: 'critical',
    required: true,
    label: 'Qaysi dalillar bevosita manbada ko‘rsatilgan?',
    hint: 'Iqtibos yoki aniq tafsilotlarga tayaning.',
  },
  {
    key: 'reliabilityLevel',
    section: 'critical',
    required: true,
    kind: 'choice',
    options: RELIABILITY_LEVELS,
    label: 'Manbaning ishonchlilik darajasini baholang',
  },
  { key: 'reliability', section: 'critical', required: true, label: 'Ishonchlilik bahoingizni qanday asoslaysiz?' },
  { key: 'limitations', section: 'critical', required: true, label: 'Uning qanday cheklovlari mavjud?' },
  { key: 'comparison', section: 'synthesis', required: false, label: 'Boshqa manbalar bilan qanday o‘xshash va farqli tomonlari bor?' },
  {
    key: 'conclusion',
    section: 'synthesis',
    required: true,
    label: 'Manba asosida qanday xulosa chiqarish mumkin?',
    hint: 'Xulosangizni manbadagi aniq dalillar bilan asoslang: «... chunki manbada ... deyilgan».',
  },
  { key: 'teachingUse', section: 'pedagogical', required: true, label: 'Ushbu manbani tarix darsida qanday qo‘llash mumkin?' },
  {
    key: 'studentTasks',
    section: 'pedagogical',
    required: true,
    label: 'O‘quvchilar uchun qanday savol va amaliy topshiriq ishlab chiqish mumkin?',
  },
];

/** Manba turiga xos qo'shimcha savollar */
const SPECIFIC: Partial<Record<SourceType, AnalysisQuestion[]>> = {
  WRITTEN: [
    { key: 'textEvidence', section: 'critical', required: false, label: 'Matndagi qaysi jumlalar asosiy dalil bo‘lib xizmat qiladi?' },
    {
      key: 'language',
      section: 'critical',
      required: false,
      label: 'Matn tili, uslubi va tarjimasi (agar mavjud bo‘lsa) talqinga qanday ta’sir qiladi?',
    },
  ],
  MAP: [
    { key: 'territory', section: 'critical', required: false, label: 'Xaritada qaysi hudud va qaysi davr tasvirlangan?' },
    { key: 'legend', section: 'critical', required: false, label: 'Legenda va shartli belgilar nimani ko‘rsatadi?' },
    { key: 'geoChanges', section: 'critical', required: false, label: 'Qanday hududiy yoki geografik o‘zgarishlar aks etgan?' },
  ],
  VISUAL: [
    { key: 'composition', section: 'critical', required: false, label: 'Tasvirda kimlar/nimalar va qanday kompozitsiyada ko‘rsatilgan?' },
    { key: 'symbols', section: 'critical', required: false, label: 'Qanday ramz va badiiy vositalar qo‘llangan?' },
  ],
  ARCHAEOLOGICAL: [
    { key: 'findContext', section: 'critical', required: false, label: 'Topilma qayerda va qanday kontekstda aniqlangan?' },
    { key: 'material', section: 'critical', required: false, label: 'Material va ishlov berish texnikasi nima haqida guvohlik beradi?' },
  ],
  AUDIO: [
    { key: 'production', section: 'critical', required: false, label: 'Yozuv kim tomonidan, qachon va qanday maqsadda yaratilgan?' },
  ],
  VIDEO: [
    { key: 'production', section: 'critical', required: false, label: 'Video kim tomonidan, qachon va qanday maqsadda yaratilgan?' },
    { key: 'editing', section: 'critical', required: false, label: 'Montaj va kadr tanlovi talqinga qanday ta’sir qiladi?' },
  ],
};

export const getAnalysisTemplate = (type: SourceType): AnalysisQuestion[] => {
  const specific = SPECIFIC[type] ?? [];
  // Turga xos savollar tanqidiy bo'lim oxirida, xulosa va pedagogik savollardan oldin joylashadi
  const of = (section: AnalysisQuestion['section']) => COMMON.filter((q) => q.section === section);
  return [...of('identification'), ...of('critical'), ...specific, ...of('synthesis'), ...of('pedagogical')];
};

const isAnswered = (q: AnalysisQuestion, value: string | undefined) =>
  q.kind === 'choice' ? !!q.options?.some((o) => o.value === value) : !!(value ?? '').trim();

/** Topshirishdan oldin majburiy savollarga javob berilganini tekshiradi */
export const missingRequired = (type: SourceType, answers: Record<string, string>) =>
  getAnalysisTemplate(type)
    .filter((q) => q.required && !isAnswered(q, answers[q.key]))
    .map((q) => q.label);
