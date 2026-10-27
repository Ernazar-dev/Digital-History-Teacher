import type { SeedObject } from './objects-a';

const SKETCHFAB_TERMS =
  'Model Sketchfab platformasida Global Digital Heritage tomonidan CC BY-NC (Attribution-NonCommercial) litsenziyasi bilan e’lon qilingan: muallifni ko‘rsatish shart, tijorat maqsadida foydalanish taqiqlangan. Model ID Sketchfab API orqali tekshirilgan.';
const VERIFY = 'Tarixiy tavsif qisqa ta’limiy matn — tadqiqotchi tomonidan manbalar bilan tekshirilishi kerak.';

const sketchfab = (uid: string, thumb: string) => ({
  provider: 'SKETCHFAB' as const,
  type: 'MODEL_3D' as const,
  externalUrl: `https://sketchfab.com/models/${uid}`,
  embedUrl: `https://sketchfab.com/models/${uid}/embed`,
  authorOrOrganization: 'Global Digital Heritage (Sketchfab)',
  license: 'CC BY-NC 4.0 (Creative Commons Attribution-NonCommercial)',
  termsNote: SKETCHFAB_TERMS,
  thumbnailUrl: `https://media.sketchfab.com/models/${uid}/thumbnails/${thumb}`,
  isDemo: false,
  status: 'PUBLISHED' as const,
});

const tasks = (name: string) => [
  { kind: 'OBSERVATION' as const, prompt: `${name}ni turli burchaklardan kuzating. Qaysi me’moriy yoki texnik elementlarni aniqladingiz?` },
  { kind: 'EVIDENCE' as const, prompt: 'Obyektning qaysi tafsilotlari uning davri va vazifasi haqida dalil bo‘la oladi?' },
  { kind: 'LESSON_APPLICATION' as const, prompt: 'Ushbu obyekt asosida o‘quvchilar uchun kuzatuv varag‘ini (3–5 savol) tuzing.' },
];

export const OBJECTS_B: SeedObject[] = [
  {
    slug: 'bibixonim-masjidi',
    title: 'Bibixonim masjidi, Samarqand',
    ...sketchfab('c830abac7e854e22b51b13b807f0c912', '785f6f3d1da04443b96a44c811eb2a47/b575408c00f5421f82dfb4b09acefdd5.jpeg'),
    period: 'temuriylar-davri',
    periodLabel: 'XIV asr oxiri – XV asr boshi',
    location: 'Samarqand, O‘zbekiston',
    latitude: 39.6608,
    longitude: 66.9792,
    description: 'Amir Temur davrida qurilgan Samarqanddagi yirik jome masjidi.',
    historicalSignificance: 'Temuriylar davri monumental me’morchiligining yorqin namunasi; Klavixo kabi zamondoshlar qurilish jarayoniga guvoh bo‘lgan.',
    historicalReferences: `UNESCO: https://whc.unesco.org/en/list/603. ${VERIFY}`,
    methodicalRecommendations: 'Klavixo kundaligi bilan birga «guvoh matni va bugungi obyekt» taqqoslash mashg‘uloti.',
    sources: ['klavixo-kundaligi', 'zafarnoma-sharafuddin-ali-yazdiy'],
    tasks: tasks('Bibixonim masjidi'),
  },
  {
    slug: 'ulugbek-rasadxonasi-sekstanti',
    title: 'Ulug‘bek rasadxonasi sekstanti, Samarqand',
    ...sketchfab('20775c69c259465eb15c1463cd20564a', '905d5dea02a444ed87ab022b84ba1075/fa41508d2d0c4898b74b55180c4b9277.jpeg'),
    period: 'temuriylar-davri',
    periodLabel: 'XV asrning 20-yillari',
    location: 'Samarqand, O‘zbekiston',
    latitude: 39.6747,
    longitude: 67.0058,
    description: 'Mirzo Ulug‘bek rasadxonasining saqlanib qolgan yer osti qismi — ulkan astronomik asbob qoldig‘i.',
    historicalSignificance: 'Temuriylar davridagi ilm-fan, xususan astronomiya rivojining moddiy dalili.',
    historicalReferences: `UNESCO: https://whc.unesco.org/en/list/603. ${VERIFY}`,
    methodicalRecommendations: '«Ulug‘bek va ilm-fan» mavzusida obyekt orqali muammoli savol qo‘yish: nega bunday katta asbob kerak bo‘lgan?',
    sources: [],
    tasks: tasks('Rasadxona sekstanti'),
  },
  {
    slug: 'oqsaroy-shahrisabz',
    title: 'Oqsaroy saroyi, Shahrisabz',
    ...sketchfab('e2e7f83a5c4d40869dc19f21b3d17b59', 'f81e6c0e96f5489fb001767321d64080/e828538e0fbd44c0a92f7b3734a3b92a.jpeg'),
    period: 'temuriylar-davri',
    periodLabel: 'XIV asr oxiri – XV asr boshi',
    location: 'Shahrisabz, O‘zbekiston',
    latitude: 39.057,
    longitude: 66.8297,
    description: 'Amir Temur qurdirgan saroyning saqlanib qolgan peshtoq qismi.',
    historicalSignificance: 'Shahrisabz tarixiy markazi UNESCO Butunjahon merosi ro‘yxatiga kiritilgan.',
    historicalReferences: `UNESCO: Historic Centre of Shakhrisyabz — https://whc.unesco.org/en/list/885. ${VERIFY}`,
    methodicalRecommendations: 'Saroyning qolgan qismi va yo‘qolgan qismlarini taxmin qilish: rekonstruksiya va dalil o‘rtasidagi farqni muhokama qiling.',
    sources: ['klavixo-kundaligi'],
    tasks: tasks('Oqsaroy peshtoqi'),
  },
  {
    slug: 'hazrati-imom-majmuasi-shahrisabz',
    title: 'Hazrati Imom majmuasi, Shahrisabz',
    ...sketchfab('0717ad31ae4b48cfb54ed11f12c5b2f2', '1c8020274cec4cf791db613fe7263d44/fb006dbd033a4486b79ed5e16a0035d1.jpeg'),
    period: 'temuriylar-davri',
    periodLabel: 'XIV–XV asrlar',
    location: 'Shahrisabz, O‘zbekiston',
    latitude: null,
    longitude: null,
    description: 'Shahrisabzdagi me’moriy majmua (Dorus-Siyodat ansambli bilan bog‘liq).',
    historicalSignificance: 'Temuriylar sulolasi bilan bog‘liq memorial me’morchilik namunasi.',
    historicalReferences: `UNESCO: https://whc.unesco.org/en/list/885. ${VERIFY}`,
    methodicalRecommendations: 'Majmua tarkibidagi binolarni sanab chiqish va ularning vazifasini manbalar asosida aniqlash.',
    sources: [],
    tasks: tasks('Hazrati Imom majmuasi'),
  },
];
