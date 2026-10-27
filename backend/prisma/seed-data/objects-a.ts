import type { EmbedProvider, VirtualObjectType, VirtualTaskKind } from '@prisma/client';

export interface SeedObject {
  slug: string;
  title: string;
  type: VirtualObjectType;
  provider: EmbedProvider;
  period: string | null;
  periodLabel: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  historicalSignificance: string;
  externalUrl: string;
  embedUrl: string | null;
  authorOrOrganization: string;
  license: string;
  termsNote: string;
  historicalReferences: string;
  methodicalRecommendations: string;
  thumbnailUrl: string | null;
  isDemo: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  sources: string[];
  tasks: { kind: VirtualTaskKind; prompt: string }[];
}

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

const STANDARD_TASKS = (name: string) => [
  { kind: 'OBSERVATION' as const, prompt: `${name} modelini turli burchaklardan kuzating. Qaysi me’moriy elementlarni aniqladingiz?` },
  { kind: 'EVIDENCE' as const, prompt: 'Obyektning qaysi tafsilotlari uning qurilgan davri va vazifasi haqida dalil bo‘la oladi?' },
  { kind: 'COMPARISON' as const, prompt: 'Obyektni bog‘langan yozma yoki vizual manba bilan taqqoslang: nimalar mos keladi, nimalar farq qiladi?' },
  { kind: 'LESSON_APPLICATION' as const, prompt: 'Ushbu obyekt asosida 8-sinf uchun 15 daqiqalik interaktiv mashg‘ulot g‘oyasini yozing (maqsad, topshiriq, baholash).' },
];

export const OBJECTS_A: SeedObject[] = [
  {
    slug: 'registon-majmuasi-samarqand',
    title: 'Registon majmuasi, Samarqand',
    ...sketchfab('af54f5280eb249beb6501eab4769c351', 'dec6901eadab47489674ea817f6cdf9c/63dea85f7bb247dd97303b83ae9252e9.jpeg'),
    period: 'buxoro-xonligi',
    periodLabel: 'XV–XVII asrlar',
    location: 'Samarqand, O‘zbekiston',
    latitude: 39.6547,
    longitude: 66.9758,
    description: 'Samarqandning markaziy maydoni va uni o‘rab turgan uchta madrasa: Ulug‘bek, Sherdor va Tillakori madrasalari.',
    historicalSignificance:
      'Ulug‘bek madrasasi Temuriylar davrida (XV asr boshi), Sherdor va Tillakori madrasalari XVII asrda qurilgan. Majmua UNESCO «Samarqand — madaniyatlar chorrahasi» ob’ekti tarkibiga kiradi.',
    historicalReferences: `UNESCO World Heritage: Samarkand – Crossroads of Cultures — https://whc.unesco.org/en/list/603. ${VERIFY}`,
    methodicalRecommendations: 'Uch madrasaning qurilish davrlari turlicha ekanini kuzatish orqali «bir makon — turli davrlar» g‘oyasini muhokama qiling.',
    sources: ['prokudin-gorskiy-samarqand-fotosuratlari'],
    tasks: STANDARD_TASKS('Registon majmuasi'),
  },
  {
    slug: 'gur-amir-maqbarasi',
    title: 'Go‘ri Amir maqbarasi, Samarqand',
    ...sketchfab('fd795227e0bc4f61bc1e4e453d29a74b', '33494be15de146fcb249dcf701ee2643/ac8b530609fb447ab996f4d0cfee2895.jpeg'),
    period: 'temuriylar-davri',
    periodLabel: 'XV asr boshi',
    location: 'Samarqand, O‘zbekiston',
    latitude: 39.6484,
    longitude: 66.969,
    description: 'Amir Temur va Temuriylar sulolasi vakillari dafn etilgan maqbara.',
    historicalSignificance: 'Temuriylar me’morchiligining muhim namunasi; keyingi davrlar maqbara me’morchiligiga ta’sir ko‘rsatgan, deb hisoblanadi.',
    historicalReferences: `UNESCO: https://whc.unesco.org/en/list/603. ${VERIFY}`,
    methodicalRecommendations: 'Maqbara gumbazi va bezaklarini kuzatib, Temuriylar davri san’ati haqida dalillarga asoslangan xulosa tuzdiring.',
    sources: ['zafarnoma-sharafuddin-ali-yazdiy'],
    tasks: STANDARD_TASKS('Go‘ri Amir maqbarasi'),
  },
];
