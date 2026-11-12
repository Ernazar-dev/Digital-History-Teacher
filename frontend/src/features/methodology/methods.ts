/**
 * Metodika boʻlimi — tarix darslarida raqamli manbalar bilan ishlash metodlari.
 * Manba: «Metodlar» hujjati (muallif tomonidan berilgan). Matn oʻzgartirilmagan.
 */

import i18n, { currentLang } from '@/i18n';
import { METHOD_TR } from './methods.tr';

export type MethodCategory = 'manba' | 'muammo' | 'vizual' | 'interaktiv';

/** tone — yorliq (chip) rangi; bar — kartochka ustidagi yoʻnalish chizigʻi */
const CATEGORY_STYLES: Record<MethodCategory, { tone: string; bar: string }> = {
  manba: { tone: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  muammo: { tone: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  vizual: { tone: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  interaktiv: { tone: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
};
/** Yoʻnalish nomi joriy tilda oʻqiladi */
export const CATEGORIES = Object.fromEntries(
  (Object.keys(CATEGORY_STYLES) as MethodCategory[]).map((k) => [k, { ...CATEGORY_STYLES[k], get label() { return i18n.t(`methodology.cat.${k}`); } }]),
) as Record<MethodCategory, { label: string; tone: string; bar: string }>;

/** Platformadagi boʻlim — metodni qoʻllashda yordam beradi */
export type MethodTool = 'sources' | 'museum' | 'explore' | 'lessons' | 'assignments' | 'profile';

export interface Method {
  slug: string;
  n: number;
  title: string;
  category: MethodCategory;
  goal: string;
  /** Amaliy misol mavzusi */
  exampleTopic: string;
  /** Oʻqituvchi nima qiladi */
  example: string;
  /** Misoldagi manbalar roʻyxati (boʻlsa) */
  exampleItems?: string[];
  /** Muammoli savol yoki vaziyat (boʻlsa) */
  question?: string;
  steps: string[];
  /** Misol mavzusiga mos platformadagi ma'ruza mavzusi */
  topic?: { slug: string; title: string };
  tools: MethodTool[];
}

const BASE_METHODS: Method[] = [
  {
    slug: 'raqamli-manbalarni-tahlil-qilish',
    n: 1,
    title: 'Raqamli tarixiy manbalarni tahlil qilish metodi',
    category: 'manba',
    goal: 'Boʻlajak tarix oʻqituvchilarida raqamli tarixiy hujjatlar, fotosuratlar, xaritalar, qoʻlyozmalar va arxiv materiallarini izlash, oʻrganish, tahlil qilish hamda ulardan dars jarayonida foydalanish koʻnikmalarini shakllantirish.',
    exampleTopic: 'Amir Temur davri tarixiy manbalar asosida',
    example: 'Oʻqituvchi talabalarga Amir Temur davriga oid raqamli tarixiy manbalarni taqdim etadi. Masalan:',
    exampleItems: [
      '«Temur tuzuklari» asarining elektron nusxasi;',
      'Amir Temur davriga oid tarixiy xaritalar;',
      'oʻsha davr meʼmoriy obidalari fotosuratlari.',
    ],
    steps: [
      'Talabalar raqamli platformalardan tarixiy manbalarni izlaydi.',
      'Tanlangan manbaning muallifi, yaratilgan davri va maqsadini aniqlaydi.',
      'Manbaning tarixiy voqealarni yoritishdagi ahamiyatini tahlil qiladi.',
      'Bir nechta manbadagi maʼlumotlarni oʻzaro taqqoslaydi.',
      'Olingan natijalar asosida qisqa taqdimot tayyorlaydi.',
    ],
    topic: { slug: 'amir-temur-davlati', title: 'Amir Temur hukmronligi davrida oʻzbek davlatchiligi' },
    tools: ['sources', 'museum'],
  },
  {
    slug: 'aqliy-hujum',
    n: 2,
    title: 'Aqliy hujum asosida tarixiy muammolarni tahlil qilish metodi',
    category: 'muammo',
    goal: 'Talabalarning mustaqil fikrlash, muammoga turli nuqtayi nazardan yondashish, tarixiy voqealar sabablarini aniqlash va oʻz fikrini dalillar bilan asoslash koʻnikmalarini rivojlantirish.',
    exampleTopic: 'IX asrda Movarounnahrda mustaqil davlatlarning shakllanishi',
    example: 'Oʻqituvchi mashgʻulot boshida quyidagi muammoli savolni beradi:',
    question: 'Nima sababdan IX asrda Movarounnahrda mahalliy sulolalar hokimiyatining kuchayishi va mustaqil davlatlarning shakllanishi jarayoni yuz berdi?',
    steps: [
      'Oʻqituvchi muammoli savolni taqdim etadi.',
      'Talabalar oʻz fikrlarini erkin bildiradi.',
      'Bildirilgan fikrlar elektron doska yoki interaktiv platformaga yozib boriladi.',
      'Talabalar fikrlarni siyosiy, iqtisodiy, ijtimoiy va madaniy omillarga ajratadi.',
      'Har bir guruh oʻz fikrini raqamli tarixiy manbalar bilan tekshiradi.',
      'Dalillar asosida umumiy xulosa shakllantiriladi.',
    ],
    topic: { slug: 'ix-xii-asrlar-tarixi', title: 'IX–XII asrlarda Movarounnahr va Xuroson davlatlari' },
    tools: ['sources', 'lessons'],
  },
  {
    slug: 'virtual-rekonstruksiya',
    n: 3,
    title: 'Virtual tarixiy rekonstruksiya metodi',
    category: 'vizual',
    goal: 'Tarixiy voqealar, meʼmoriy obidalar, shaharlar va tarixiy muhitni raqamli texnologiyalar yordamida qayta tasavvur qilish orqali talabalarning tarixiy tafakkurini rivojlantirish.',
    exampleTopic: 'Qadimgi Samarqand — Afrosiyob shahri',
    example: 'Oʻqituvchi talabalarga Afrosiyob qadimiy shaharchasining arxeologik topilmalari, devoriy suratlari, tarixiy xaritalari va 3D rekonstruksiya materiallarini namoyish etadi.',
    steps: [
      'Talabalar Afrosiyobga oid arxeologik va raqamli manbalarni oʻrganadi.',
      'Shaharning joylashuvi va tarixiy tuzilishini aniqlaydi.',
      'Tarixiy tasvirlar va arxeologik maʼlumotlar asosida shahar koʻrinishini tasavvur qiladi.',
      'Oddiy 3D model yoki raqamli maket yaratadi.',
      'Yaratilgan modelni tarixiy manbalar bilan asoslaydi.',
    ],
    tools: ['museum', 'explore'],
  },
  {
    slug: 'interaktiv-xaritalar',
    n: 4,
    title: 'Interaktiv tarixiy xaritalar bilan ishlash metodi',
    category: 'vizual',
    goal: 'Tarixiy voqealar, davlatlar chegaralari, harbiy yurishlar, migratsiya va savdo yoʻllarining geografik xususiyatlarini raqamli xaritalar yordamida oʻrgatish.',
    exampleTopic: 'Buyuk ipak yoʻli va uning tarixiy ahamiyati',
    example: 'Oʻqituvchi talabalar bilan interaktiv xarita orqali Buyuk ipak yoʻlining asosiy yoʻnalishlarini oʻrganadi.',
    steps: [
      'Talabalar raqamli xaritani ochadi.',
      'Buyuk ipak yoʻlining asosiy yoʻnalishlarini belgilaydi.',
      'Samarqand, Buxoro, Xiva, Termiz va boshqa tarixiy markazlarning joylashuvini aniqlaydi.',
      'Savdo yoʻllari orqali amalga oshirilgan iqtisodiy va madaniy aloqalarni oʻrganadi.',
      'Xarita asosida tarixiy xulosa tayyorlaydi.',
    ],
    topic: { slug: 'buyuk-ipak-yoli', title: 'Buyuk ipak yoʻli — muloqot va hamkorlik yoʻli' },
    tools: ['explore', 'sources'],
  },
  {
    slug: 'qiyosiy-tarixiy-tahlil',
    n: 5,
    title: 'Qiyosiy-tarixiy raqamli tahlil metodi',
    category: 'manba',
    goal: 'Tarixiy davrlar, davlatlar, siyosiy jarayonlar va tarixiy shaxslar faoliyatini raqamli manbalar asosida qiyoslash orqali talabalarning tahliliy fikrlash qobiliyatini rivojlantirish.',
    exampleTopic: 'Somoniylar va Qoraxoniylar davlatining siyosiy-iqtisodiy taraqqiyoti',
    example: 'Oʻqituvchi talabalarga ikki davlatga oid elektron tarixiy manbalar, xaritalar, tangalar tasvirlari va tarixiy maʼlumotlarni taqdim etadi.',
    steps: [
      'Talabalar Somoniylar va Qoraxoniylar davlatiga oid raqamli manbalarni oʻrganadi.',
      'Davlatlarning tashkil topishi va siyosiy boshqaruvini tahlil qiladi.',
      'Iqtisodiy hayot, savdo, madaniyat va ilm-fan rivojini taqqoslaydi.',
      'Oʻxshash va farqli jihatlarni elektron jadvalga joylashtiradi.',
      'Qiyosiy tahlil asosida xulosa chiqaradi.',
    ],
    topic: { slug: 'ix-xii-asrlar-tarixi', title: 'IX–XII asrlarda Movarounnahr va Xuroson davlatlari' },
    tools: ['sources', 'explore'],
  },
  {
    slug: 'raqamli-tarixiy-tadqiqot',
    n: 6,
    title: 'Raqamli tarixiy tadqiqot metodi',
    category: 'manba',
    goal: 'Talabalarda mustaqil tarixiy izlanish olib borish, elektron kutubxonalar, raqamli arxivlar, ilmiy maʼlumotlar bazalari va tarixiy hujjatlardan foydalanish koʻnikmalarini shakllantirish.',
    exampleTopic: 'Jadidchilik harakati va uning namoyandalari',
    example: 'Oʻqituvchi talabalarga jadidchilik harakati vakillarining faoliyatini raqamli manbalar orqali mustaqil oʻrganishni topshiradi.',
    steps: [
      'Talabalar elektron kutubxonalardan jadidchilikka oid adabiyotlarni izlaydi.',
      'Tarixiy gazeta va jurnallarning raqamli nusxalarini oʻrganadi.',
      'Jadid namoyandalarining hayoti va faoliyati haqida maʼlumot toʻplaydi.',
      'Maʼlumotlarni ishonchliligi va tarixiy ahamiyati boʻyicha saralaydi.',
      'Elektron tadqiqot hisoboti tayyorlaydi.',
    ],
    tools: ['sources', 'profile'],
  },
  {
    slug: 'muammoli-vaziyatlarni-modellashtirish',
    n: 7,
    title: 'Muammoli tarixiy vaziyatlarni modellashtirish metodi',
    category: 'muammo',
    goal: 'Talabalarning tarixiy muammolarni aniqlash, turli nuqtayi nazarlarni tahlil qilish, tarixiy sharoitni hisobga olgan holda qaror qabul qilish va dalillangan xulosa chiqarish qobiliyatini rivojlantirish.',
    exampleTopic: 'Amir Temurning davlatni markazlashtirish siyosati',
    example: 'Oʻqituvchi talabalarga quyidagi muammoli vaziyatni taqdim etadi:',
    question: 'Tasavvur qiling, siz XIV asrda Movarounnahrdagi siyosiy jarayonlarda ishtirok etayotgan maslahatchisiz. Mamlakatda siyosiy tarqoqlik mavjud. Davlatni birlashtirish va markaziy hokimiyatni mustahkamlash uchun qanday siyosiy choralarni taklif qilgan boʻlardingiz?',
    steps: [
      'Talabalar XIV asrdagi Movarounnahrning siyosiy vaziyatini oʻrganadi.',
      'Tarixiy xaritalar, yozma manbalar va elektron materiallarni tahlil qiladi.',
      'Muammoning kelib chiqish sabablarini aniqlaydi.',
      'Kichik guruhlarda muqobil yechimlarni ishlab chiqadi.',
      'Takliflarini tarixiy dalillar bilan asoslaydi.',
      'Amir Temur davridagi real siyosiy qarorlar bilan qiyoslaydi.',
    ],
    topic: { slug: 'amir-temur-davlati', title: 'Amir Temur hukmronligi davrida oʻzbek davlatchiligi' },
    tools: ['sources', 'lessons'],
  },
  {
    slug: 'gamifikatsiya',
    n: 8,
    title: 'Gamifikatsiya asosida tarixni oʻqitish metodi',
    category: 'interaktiv',
    goal: 'Oʻquv jarayoniga oʻyin elementlari, ball, reyting, topshiriq, musobaqa va interaktiv savollarni joriy etish orqali talabalarning tarix faniga qiziqishini oshirish.',
    exampleTopic: 'Oʻzbekiston tarixidagi tarixiy shaxslar',
    example: 'Oʻqituvchi Kahoot, Quizizz yoki boshqa interaktiv platformalardan foydalanib, tarixiy shaxslar faoliyatiga oid viktorina tashkil qiladi.',
    steps: [
      'Oʻqituvchi tarixiy shaxslar haqida 15–20 ta savol tayyorlaydi.',
      'Talabalar telefon yoki kompyuter orqali viktorinaga ulanadi.',
      'Savollarga belgilangan vaqt ichida javob beradi.',
      'Toʻgʼri javoblar uchun ball beriladi.',
      'Yakunda natijalar tahlil qilinadi va notoʻgʼri javoblar izohlanadi.',
    ],
    tools: ['assignments'],
  },
  {
    slug: 'raqamli-loyiha',
    n: 9,
    title: 'Raqamli loyiha asosida tarixni oʻqitish metodi',
    category: 'interaktiv',
    goal: 'Talabalarni muayyan tarixiy mavzu boʻyicha mustaqil yoki jamoaviy raqamli loyiha ishlab chiqishga yoʻnaltirish orqali ularning tadqiqotchilik, loyihalash va metodik tashkilotchilik kompetensiyalarini rivojlantirish.',
    exampleTopic: 'Buyuk allomalar va ularning jahon sivilizatsiyasiga qoʻshgan hissasi',
    example: 'Oʻqituvchi talabalarni guruhlarga ajratadi. Har bir guruh Markaziy Osiyoda yetishib chiqqan buyuk allomalardan biri haqida raqamli loyiha tayyorlaydi.',
    steps: [
      'Talabalar loyiha mavzusini tanlaydi.',
      'Elektron kutubxona va ilmiy manbalardan maʼlumot toʻplaydi.',
      'Tarixiy shaxsning hayoti, ilmiy faoliyati va merosini oʻrganadi.',
      'Raqamli taqdimot, veb-sahifa, elektron xarita yoki videoloyiha yaratadi.',
      'Loyiha natijalarini himoya qiladi.',
      'Oʻqituvchi loyiha natijalarini belgilangan mezonlar asosida baholaydi.',
    ],
    topic: { slug: 'sharq-uygonish-davri', title: 'IX–XII asrlarda Uygʻonish davri. Ajdodlarimizning jahon sivilizatsiyasiga qoʻshgan hissasi' },
    tools: ['sources', 'profile'],
  },
];

/** Tilga bogʻliq maydonlar joriy tilda oʻqiladi; tarjima boʻlmasa — oʻzbekcha */
const pick = <K extends keyof (typeof METHOD_TR)['ru'][string]>(slug: string, key: K) => {
  const lng = currentLang();
  return lng === 'uz' ? undefined : METHOD_TR[lng][slug]?.[key];
};

export const METHODS: Method[] = BASE_METHODS.map((m) => {
  const o: Method = { ...m };
  for (const key of ['title', 'goal', 'exampleTopic', 'example', 'exampleItems', 'question', 'steps'] as const) {
    if (m[key] === undefined) continue;
    Object.defineProperty(o, key, { enumerable: true, get: () => pick(m.slug, key) ?? m[key] });
  }
  if (m.topic) {
    const base = m.topic;
    Object.defineProperty(o, 'topic', { enumerable: true, get: () => ({ slug: base.slug, title: pick(m.slug, 'topicTitle') ?? base.title }) });
  }
  return o;
});
