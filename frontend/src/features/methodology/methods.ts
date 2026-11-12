/**
 * Metodika bölimi — tarix darslarida raqamli manbalar bilan işlaş metodlari.
 * Manba: «Metodlar» hujjati (muallif tomonidan berilgan). Matn özgartirilmagan.
 */

import i18n, { currentLang } from '@/i18n';
import { METHOD_TR } from './methods.tr';

export type MethodCategory = 'manba' | 'muammo' | 'vizual' | 'interaktiv';

/** tone — yorliq (chip) rangi; bar — kartoçka ustidagi yönaliş çiziği */
const CATEGORY_STYLES: Record<MethodCategory, { tone: string; bar: string }> = {
  manba: { tone: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  muammo: { tone: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  vizual: { tone: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  interaktiv: { tone: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
};
/** Yönaliş nomi joriy tilda öqiladi */
export const CATEGORIES = Object.fromEntries(
  (Object.keys(CATEGORY_STYLES) as MethodCategory[]).map((k) => [k, { ...CATEGORY_STYLES[k], get label() { return i18n.t(`methodology.cat.${k}`); } }]),
) as Record<MethodCategory, { label: string; tone: string; bar: string }>;

/** Platformadagi bölim — metodni qöllaşda yordam beradi */
export type MethodTool = 'sources' | 'museum' | 'explore' | 'lessons' | 'assignments' | 'profile';

export interface Method {
  slug: string;
  n: number;
  title: string;
  category: MethodCategory;
  goal: string;
  /** Amaliy misol mavzusi */
  exampleTopic: string;
  /** Öqituvçi nima qiladi */
  example: string;
  /** Misoldagi manbalar röyxati (bölsa) */
  exampleItems?: string[];
  /** Muammoli savol yoki vaziyat (bölsa) */
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
    title: 'Raqamli tarixiy manbalarni tahlil qiliş metodi',
    category: 'manba',
    goal: 'Bölajak tarix öqituvçilarida raqamli tarixiy hujjatlar, fotosuratlar, xaritalar, qölyozmalar va arxiv materiallarini izlaş, örganiş, tahlil qiliş hamda ulardan dars jarayonida foydalaniş könikmalarini şakllantiriş.',
    exampleTopic: 'Amir Temur davri tarixiy manbalar asosida',
    example: 'Öqituvçi talabalarga Amir Temur davriga oid raqamli tarixiy manbalarni taqdim etadi. Masalan:',
    exampleItems: [
      '«Temur tuzuklari» asarining elektron nusxasi;',
      'Amir Temur davriga oid tarixiy xaritalar;',
      'öşa davr me’moriy obidalari fotosuratlari.',
    ],
    steps: [
      'Talabalar raqamli platformalardan tarixiy manbalarni izlaydi.',
      'Tanlangan manbaning muallifi, yaratilgan davri va maqsadini aniqlaydi.',
      'Manbaning tarixiy voqealarni yoritişdagi ahamiyatini tahlil qiladi.',
      'Bir neçta manbadagi ma’lumotlarni özaro taqqoslaydi.',
      'Olingan natijalar asosida qisqa taqdimot tayyorlaydi.',
    ],
    topic: { slug: 'amir-temur-davlati', title: 'Amir Temur hukmronligi davrida özbek davlatçiligi' },
    tools: ['sources', 'museum'],
  },
  {
    slug: 'aqliy-hujum',
    n: 2,
    title: 'Aqliy hujum asosida tarixiy muammolarni tahlil qiliş metodi',
    category: 'muammo',
    goal: 'Talabalarning mustaqil fikrlaş, muammoga turli nuqtayi nazardan yondashish, tarixiy voqealar sabablarini aniqlaş va öz fikrini dalillar bilan asoslash könikmalarini rivojlantiriş.',
    exampleTopic: 'IX asrda Movarounnahrda mustaqil davlatlarning şakllanişi',
    example: 'Öqituvçi maşğulot boşida quyidagi muammoli savolni beradi:',
    question: 'Nima sababdan IX asrda Movarounnahrda mahalliy sulolalar hokimiyatining kuçayişi va mustaqil davlatlarning şakllanişi jarayoni yuz berdi?',
    steps: [
      'Öqituvçi muammoli savolni taqdim etadi.',
      'Talabalar öz fikrlarini erkin bildiradi.',
      'Bildirilgan fikrlar elektron doska yoki interaktiv platformaga yozib boriladi.',
      'Talabalar fikrlarni siyosiy, iqtisodiy, ijtimoiy va madaniy omillarga ajratadi.',
      'Har bir guruh öz fikrini raqamli tarixiy manbalar bilan tekşiradi.',
      'Dalillar asosida umumiy xulosa şakllantiriladi.',
    ],
    topic: { slug: 'ix-xii-asrlar-tarixi', title: 'IX–XII asrlarda Movarounnahr va Xuroson davlatlari' },
    tools: ['sources', 'lessons'],
  },
  {
    slug: 'virtual-rekonstruksiya',
    n: 3,
    title: 'Virtual tarixiy rekonstruksiya metodi',
    category: 'vizual',
    goal: 'Tarixiy voqealar, me’moriy obidalar, şaharlar va tarixiy muhitni raqamli texnologiyalar yordamida qayta tasavvur qiliş orqali talabalarning tarixiy tafakkurini rivojlantiriş.',
    exampleTopic: 'Qadimgi Samarqand — Afrosiyob şahri',
    example: 'Öqituvçi talabalarga Afrosiyob qadimiy shaharchasining arxeologik topilmalari, devoriy suratlari, tarixiy xaritalari va 3D rekonstruksiya materiallarini namoyiş etadi.',
    steps: [
      'Talabalar Afrosiyobga oid arxeologik va raqamli manbalarni örganadi.',
      'Şaharning joylaşuvi va tarixiy tuzilişini aniqlaydi.',
      'Tarixiy tasvirlar va arxeologik ma’lumotlar asosida şahar körinişini tasavvur qiladi.',
      'Oddiy 3D model yoki raqamli maket yaratadi.',
      'Yaratilgan modelni tarixiy manbalar bilan asoslaydi.',
    ],
    tools: ['museum', 'explore'],
  },
  {
    slug: 'interaktiv-xaritalar',
    n: 4,
    title: 'Interaktiv tarixiy xaritalar bilan işlaş metodi',
    category: 'vizual',
    goal: 'Tarixiy voqealar, davlatlar çegaralari, harbiy yurişlar, migratsiya va savdo yöllarining geografik xususiyatlarini raqamli xaritalar yordamida örgatiş.',
    exampleTopic: 'Buyuk ipak yöli va uning tarixiy ahamiyati',
    example: 'Öqituvçi talabalar bilan interaktiv xarita orqali Buyuk ipak yölining asosiy yönalişlarini örganadi.',
    steps: [
      'Talabalar raqamli xaritani oçadi.',
      'Buyuk ipak yölining asosiy yönalişlarini belgilaydi.',
      'Samarqand, Buxoro, Xiva, Termiz va boşqa tarixiy markazlarning joylaşuvini aniqlaydi.',
      'Savdo yöllari orqali amalga oşirilgan iqtisodiy va madaniy aloqalarni örganadi.',
      'Xarita asosida tarixiy xulosa tayyorlaydi.',
    ],
    topic: { slug: 'buyuk-ipak-yoli', title: 'Buyuk ipak yöli — muloqot va hamkorlik yöli' },
    tools: ['explore', 'sources'],
  },
  {
    slug: 'qiyosiy-tarixiy-tahlil',
    n: 5,
    title: 'Qiyosiy-tarixiy raqamli tahlil metodi',
    category: 'manba',
    goal: 'Tarixiy davrlar, davlatlar, siyosiy jarayonlar va tarixiy şaxslar faoliyatini raqamli manbalar asosida qiyoslash orqali talabalarning tahliliy fikrlaş qobiliyatini rivojlantiriş.',
    exampleTopic: 'Somoniylar va Qoraxoniylar davlatining siyosiy-iqtisodiy taraqqiyoti',
    example: 'Öqituvçi talabalarga ikki davlatga oid elektron tarixiy manbalar, xaritalar, tangalar tasvirlari va tarixiy ma’lumotlarni taqdim etadi.',
    steps: [
      'Talabalar Somoniylar va Qoraxoniylar davlatiga oid raqamli manbalarni örganadi.',
      'Davlatlarning taşkil topişi va siyosiy boşqaruvini tahlil qiladi.',
      'Iqtisodiy hayot, savdo, madaniyat va ilm-fan rivojini taqqoslaydi.',
      'Öxshash va farqli jihatlarni elektron jadvalga joylaştiradi.',
      'Qiyosiy tahlil asosida xulosa çiqaradi.',
    ],
    topic: { slug: 'ix-xii-asrlar-tarixi', title: 'IX–XII asrlarda Movarounnahr va Xuroson davlatlari' },
    tools: ['sources', 'explore'],
  },
  {
    slug: 'raqamli-tarixiy-tadqiqot',
    n: 6,
    title: 'Raqamli tarixiy tadqiqot metodi',
    category: 'manba',
    goal: 'Talabalarda mustaqil tarixiy izlaniş olib boriş, elektron kutubxonalar, raqamli arxivlar, ilmiy ma’lumotlar bazalari va tarixiy hujjatlardan foydalaniş könikmalarini şakllantiriş.',
    exampleTopic: 'Jadidçilik harakati va uning namoyandalari',
    example: 'Öqituvçi talabalarga jadidçilik harakati vakillarining faoliyatini raqamli manbalar orqali mustaqil örganişni topşiradi.',
    steps: [
      'Talabalar elektron kutubxonalardan jadidçilikka oid adabiyotlarni izlaydi.',
      'Tarixiy gazeta va jurnallarning raqamli nusxalarini örganadi.',
      'Jadid namoyandalarining hayoti va faoliyati haqida ma’lumot töplaydi.',
      'Ma’lumotlarni işonçliligi va tarixiy ahamiyati böyiça saralaydi.',
      'Elektron tadqiqot hisoboti tayyorlaydi.',
    ],
    tools: ['sources', 'profile'],
  },
  {
    slug: 'muammoli-vaziyatlarni-modellashtirish',
    n: 7,
    title: 'Muammoli tarixiy vaziyatlarni modellaştiriş metodi',
    category: 'muammo',
    goal: 'Talabalarning tarixiy muammolarni aniqlaş, turli nuqtayi nazarlarni tahlil qiliş, tarixiy şaroitni hisobga olgan holda qaror qabul qiliş va dalillangan xulosa çiqariş qobiliyatini rivojlantiriş.',
    exampleTopic: 'Amir Temurning davlatni markazlaştiriş siyosati',
    example: 'Öqituvçi talabalarga quyidagi muammoli vaziyatni taqdim etadi:',
    question: 'Tasavvur qiling, siz XIV asrda Movarounnahrdagi siyosiy jarayonlarda iştirok etayotgan maslahatçisiz. Mamlakatda siyosiy tarqoqlik mavjud. Davlatni birlaştiriş va markaziy hokimiyatni mustahkamlaş uçun qanday siyosiy çoralarni taklif qilgan bölardingiz?',
    steps: [
      'Talabalar XIV asrdagi Movarounnahrning siyosiy vaziyatini örganadi.',
      'Tarixiy xaritalar, yozma manbalar va elektron materiallarni tahlil qiladi.',
      'Muammoning kelib çiqiş sabablarini aniqlaydi.',
      'Kiçik guruhlarda muqobil yeçimlarni işlab çiqadi.',
      'Takliflarini tarixiy dalillar bilan asoslaydi.',
      'Amir Temur davridagi real siyosiy qarorlar bilan qiyoslaydi.',
    ],
    topic: { slug: 'amir-temur-davlati', title: 'Amir Temur hukmronligi davrida özbek davlatçiligi' },
    tools: ['sources', 'lessons'],
  },
  {
    slug: 'gamifikatsiya',
    n: 8,
    title: 'Gamifikatsiya asosida tarixni öqitiş metodi',
    category: 'interaktiv',
    goal: 'Öquv jarayoniga öyin elementlari, ball, reyting, topşiriq, musobaqa va interaktiv savollarni joriy etiş orqali talabalarning tarix faniga qiziqişini oşiriş.',
    exampleTopic: 'Özbekiston tarixidagi tarixiy şaxslar',
    example: 'Öqituvçi Kahoot, Quizizz yoki boşqa interaktiv platformalardan foydalanib, tarixiy şaxslar faoliyatiga oid viktorina taşkil qiladi.',
    steps: [
      'Öqituvçi tarixiy şaxslar haqida 15–20 ta savol tayyorlaydi.',
      'Talabalar telefon yoki kompyuter orqali viktorinaga ulanadi.',
      'Savollarga belgilangan vaqt içida javob beradi.',
      'Tög’ri javoblar uçun ball beriladi.',
      'Yakunda natijalar tahlil qilinadi va notög’ri javoblar izohlanadi.',
    ],
    tools: ['assignments'],
  },
  {
    slug: 'raqamli-loyiha',
    n: 9,
    title: 'Raqamli loyiha asosida tarixni öqitiş metodi',
    category: 'interaktiv',
    goal: 'Talabalarni muayyan tarixiy mavzu böyiça mustaqil yoki jamoaviy raqamli loyiha işlab çiqişga yönaltiriş orqali ularning tadqiqotçilik, loyihalaş va metodik taşkilotçilik kompetensiyalarini rivojlantiriş.',
    exampleTopic: 'Buyuk allomalar va ularning jahon sivilizatsiyasiga qöşgan hissasi',
    example: 'Öqituvçi talabalarni guruhlarga ajratadi. Har bir guruh Markaziy Osiyoda yetişib çiqqan buyuk allomalardan biri haqida raqamli loyiha tayyorlaydi.',
    steps: [
      'Talabalar loyiha mavzusini tanlaydi.',
      'Elektron kutubxona va ilmiy manbalardan ma’lumot töplaydi.',
      'Tarixiy şaxsning hayoti, ilmiy faoliyati va merosini örganadi.',
      'Raqamli taqdimot, veb-sahifa, elektron xarita yoki videoloyiha yaratadi.',
      'Loyiha natijalarini himoya qiladi.',
      'Öqituvçi loyiha natijalarini belgilangan mezonlar asosida baholaydi.',
    ],
    topic: { slug: 'sharq-uygonish-davri', title: 'IX–XII asrlarda Uyğoniş davri. Ajdodlarimizning jahon sivilizatsiyasiga qöşgan hissasi' },
    tools: ['sources', 'profile'],
  },
];

/** Tilga boğliq maydonlar joriy tilda öqiladi; tarjima bölmasa — özbekça */
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
