/**
 * Metodika bo'limi — tarix darslarida raqamli manbalar bilan ishlash metodlari.
 * Manba: «Metodlar» hujjati (muallif tomonidan berilgan). Matn o'zgartirilmagan.
 */

export type MethodCategory = 'manba' | 'muammo' | 'vizual' | 'interaktiv';

/** tone — yorliq (chip) rangi; bar — kartochka ustidagi yo'nalish chizig'i */
export const CATEGORIES: Record<MethodCategory, { label: string; tone: string; bar: string }> = {
  manba: { label: 'Manbalar bilan ishlash', tone: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  muammo: { label: 'Muammoli o‘qitish', tone: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  vizual: { label: 'Vizual va makon', tone: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  interaktiv: { label: 'Interaktiv va loyiha', tone: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
};

/** Platformadagi bo'lim — metodni qo'llashda yordam beradi */
export type MethodTool = 'sources' | 'museum' | 'explore' | 'lessons' | 'assignments' | 'profile';

export interface Method {
  slug: string;
  n: number;
  title: string;
  category: MethodCategory;
  goal: string;
  /** Amaliy misol mavzusi */
  exampleTopic: string;
  /** O'qituvchi nima qiladi */
  example: string;
  /** Misoldagi manbalar ro'yxati (bo'lsa) */
  exampleItems?: string[];
  /** Muammoli savol yoki vaziyat (bo'lsa) */
  question?: string;
  steps: string[];
  /** Misol mavzusiga mos platformadagi ma'ruza mavzusi */
  topic?: { slug: string; title: string };
  tools: MethodTool[];
}

export const METHODS: Method[] = [
  {
    slug: 'raqamli-manbalarni-tahlil-qilish',
    n: 1,
    title: 'Raqamli tarixiy manbalarni tahlil qilish metodi',
    category: 'manba',
    goal: 'Bo‘lajak tarix o‘qituvchilarida raqamli tarixiy hujjatlar, fotosuratlar, xaritalar, qo‘lyozmalar va arxiv materiallarini izlash, o‘rganish, tahlil qilish hamda ulardan dars jarayonida foydalanish ko‘nikmalarini shakllantirish.',
    exampleTopic: 'Amir Temur davri tarixiy manbalar asosida',
    example: 'O‘qituvchi talabalarga Amir Temur davriga oid raqamli tarixiy manbalarni taqdim etadi. Masalan:',
    exampleItems: [
      '«Temur tuzuklari» asarining elektron nusxasi;',
      'Amir Temur davriga oid tarixiy xaritalar;',
      'o‘sha davr me’moriy obidalari fotosuratlari.',
    ],
    steps: [
      'Talabalar raqamli platformalardan tarixiy manbalarni izlaydi.',
      'Tanlangan manbaning muallifi, yaratilgan davri va maqsadini aniqlaydi.',
      'Manbaning tarixiy voqealarni yoritishdagi ahamiyatini tahlil qiladi.',
      'Bir nechta manbadagi ma’lumotlarni o‘zaro taqqoslaydi.',
      'Olingan natijalar asosida qisqa taqdimot tayyorlaydi.',
    ],
    topic: { slug: 'amir-temur-davlati', title: 'Amir Temur hukmronligi davrida o‘zbek davlatchiligi' },
    tools: ['sources', 'museum'],
  },
  {
    slug: 'aqliy-hujum',
    n: 2,
    title: 'Aqliy hujum asosida tarixiy muammolarni tahlil qilish metodi',
    category: 'muammo',
    goal: 'Talabalarning mustaqil fikrlash, muammoga turli nuqtayi nazardan yondashish, tarixiy voqealar sabablarini aniqlash va o‘z fikrini dalillar bilan asoslash ko‘nikmalarini rivojlantirish.',
    exampleTopic: 'IX asrda Movarounnahrda mustaqil davlatlarning shakllanishi',
    example: 'O‘qituvchi mashg‘ulot boshida quyidagi muammoli savolni beradi:',
    question: 'Nima sababdan IX asrda Movarounnahrda mahalliy sulolalar hokimiyatining kuchayishi va mustaqil davlatlarning shakllanishi jarayoni yuz berdi?',
    steps: [
      'O‘qituvchi muammoli savolni taqdim etadi.',
      'Talabalar o‘z fikrlarini erkin bildiradi.',
      'Bildirilgan fikrlar elektron doska yoki interaktiv platformaga yozib boriladi.',
      'Talabalar fikrlarni siyosiy, iqtisodiy, ijtimoiy va madaniy omillarga ajratadi.',
      'Har bir guruh o‘z fikrini raqamli tarixiy manbalar bilan tekshiradi.',
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
    goal: 'Tarixiy voqealar, me’moriy obidalar, shaharlar va tarixiy muhitni raqamli texnologiyalar yordamida qayta tasavvur qilish orqali talabalarning tarixiy tafakkurini rivojlantirish.',
    exampleTopic: 'Qadimgi Samarqand — Afrosiyob shahri',
    example: 'O‘qituvchi talabalarga Afrosiyob qadimiy shaharchasining arxeologik topilmalari, devoriy suratlari, tarixiy xaritalari va 3D rekonstruksiya materiallarini namoyish etadi.',
    steps: [
      'Talabalar Afrosiyobga oid arxeologik va raqamli manbalarni o‘rganadi.',
      'Shaharning joylashuvi va tarixiy tuzilishini aniqlaydi.',
      'Tarixiy tasvirlar va arxeologik ma’lumotlar asosida shahar ko‘rinishini tasavvur qiladi.',
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
    goal: 'Tarixiy voqealar, davlatlar chegaralari, harbiy yurishlar, migratsiya va savdo yo‘llarining geografik xususiyatlarini raqamli xaritalar yordamida o‘rgatish.',
    exampleTopic: 'Buyuk ipak yo‘li va uning tarixiy ahamiyati',
    example: 'O‘qituvchi talabalar bilan interaktiv xarita orqali Buyuk ipak yo‘lining asosiy yo‘nalishlarini o‘rganadi.',
    steps: [
      'Talabalar raqamli xaritani ochadi.',
      'Buyuk ipak yo‘lining asosiy yo‘nalishlarini belgilaydi.',
      'Samarqand, Buxoro, Xiva, Termiz va boshqa tarixiy markazlarning joylashuvini aniqlaydi.',
      'Savdo yo‘llari orqali amalga oshirilgan iqtisodiy va madaniy aloqalarni o‘rganadi.',
      'Xarita asosida tarixiy xulosa tayyorlaydi.',
    ],
    topic: { slug: 'buyuk-ipak-yoli', title: 'Buyuk ipak yo‘li — muloqot va hamkorlik yo‘li' },
    tools: ['explore', 'sources'],
  },
  {
    slug: 'qiyosiy-tarixiy-tahlil',
    n: 5,
    title: 'Qiyosiy-tarixiy raqamli tahlil metodi',
    category: 'manba',
    goal: 'Tarixiy davrlar, davlatlar, siyosiy jarayonlar va tarixiy shaxslar faoliyatini raqamli manbalar asosida qiyoslash orqali talabalarning tahliliy fikrlash qobiliyatini rivojlantirish.',
    exampleTopic: 'Somoniylar va Qoraxoniylar davlatining siyosiy-iqtisodiy taraqqiyoti',
    example: 'O‘qituvchi talabalarga ikki davlatga oid elektron tarixiy manbalar, xaritalar, tangalar tasvirlari va tarixiy ma’lumotlarni taqdim etadi.',
    steps: [
      'Talabalar Somoniylar va Qoraxoniylar davlatiga oid raqamli manbalarni o‘rganadi.',
      'Davlatlarning tashkil topishi va siyosiy boshqaruvini tahlil qiladi.',
      'Iqtisodiy hayot, savdo, madaniyat va ilm-fan rivojini taqqoslaydi.',
      'O‘xshash va farqli jihatlarni elektron jadvalga joylashtiradi.',
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
    goal: 'Talabalarda mustaqil tarixiy izlanish olib borish, elektron kutubxonalar, raqamli arxivlar, ilmiy ma’lumotlar bazalari va tarixiy hujjatlardan foydalanish ko‘nikmalarini shakllantirish.',
    exampleTopic: 'Jadidchilik harakati va uning namoyandalari',
    example: 'O‘qituvchi talabalarga jadidchilik harakati vakillarining faoliyatini raqamli manbalar orqali mustaqil o‘rganishni topshiradi.',
    steps: [
      'Talabalar elektron kutubxonalardan jadidchilikka oid adabiyotlarni izlaydi.',
      'Tarixiy gazeta va jurnallarning raqamli nusxalarini o‘rganadi.',
      'Jadid namoyandalarining hayoti va faoliyati haqida ma’lumot to‘playdi.',
      'Ma’lumotlarni ishonchliligi va tarixiy ahamiyati bo‘yicha saralaydi.',
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
    example: 'O‘qituvchi talabalarga quyidagi muammoli vaziyatni taqdim etadi:',
    question: 'Tasavvur qiling, siz XIV asrda Movarounnahrdagi siyosiy jarayonlarda ishtirok etayotgan maslahatchisiz. Mamlakatda siyosiy tarqoqlik mavjud. Davlatni birlashtirish va markaziy hokimiyatni mustahkamlash uchun qanday siyosiy choralarni taklif qilgan bo‘lardingiz?',
    steps: [
      'Talabalar XIV asrdagi Movarounnahrning siyosiy vaziyatini o‘rganadi.',
      'Tarixiy xaritalar, yozma manbalar va elektron materiallarni tahlil qiladi.',
      'Muammoning kelib chiqish sabablarini aniqlaydi.',
      'Kichik guruhlarda muqobil yechimlarni ishlab chiqadi.',
      'Takliflarini tarixiy dalillar bilan asoslaydi.',
      'Amir Temur davridagi real siyosiy qarorlar bilan qiyoslaydi.',
    ],
    topic: { slug: 'amir-temur-davlati', title: 'Amir Temur hukmronligi davrida o‘zbek davlatchiligi' },
    tools: ['sources', 'lessons'],
  },
  {
    slug: 'gamifikatsiya',
    n: 8,
    title: 'Gamifikatsiya asosida tarixni o‘qitish metodi',
    category: 'interaktiv',
    goal: 'O‘quv jarayoniga o‘yin elementlari, ball, reyting, topshiriq, musobaqa va interaktiv savollarni joriy etish orqali talabalarning tarix faniga qiziqishini oshirish.',
    exampleTopic: 'O‘zbekiston tarixidagi tarixiy shaxslar',
    example: 'O‘qituvchi Kahoot, Quizizz yoki boshqa interaktiv platformalardan foydalanib, tarixiy shaxslar faoliyatiga oid viktorina tashkil qiladi.',
    steps: [
      'O‘qituvchi tarixiy shaxslar haqida 15–20 ta savol tayyorlaydi.',
      'Talabalar telefon yoki kompyuter orqali viktorinaga ulanadi.',
      'Savollarga belgilangan vaqt ichida javob beradi.',
      'To‘g‘ri javoblar uchun ball beriladi.',
      'Yakunda natijalar tahlil qilinadi va noto‘g‘ri javoblar izohlanadi.',
    ],
    tools: ['assignments'],
  },
  {
    slug: 'raqamli-loyiha',
    n: 9,
    title: 'Raqamli loyiha asosida tarixni o‘qitish metodi',
    category: 'interaktiv',
    goal: 'Talabalarni muayyan tarixiy mavzu bo‘yicha mustaqil yoki jamoaviy raqamli loyiha ishlab chiqishga yo‘naltirish orqali ularning tadqiqotchilik, loyihalash va metodik tashkilotchilik kompetensiyalarini rivojlantirish.',
    exampleTopic: 'Buyuk allomalar va ularning jahon sivilizatsiyasiga qo‘shgan hissasi',
    example: 'O‘qituvchi talabalarni guruhlarga ajratadi. Har bir guruh Markaziy Osiyoda yetishib chiqqan buyuk allomalardan biri haqida raqamli loyiha tayyorlaydi.',
    steps: [
      'Talabalar loyiha mavzusini tanlaydi.',
      'Elektron kutubxona va ilmiy manbalardan ma’lumot to‘playdi.',
      'Tarixiy shaxsning hayoti, ilmiy faoliyati va merosini o‘rganadi.',
      'Raqamli taqdimot, veb-sahifa, elektron xarita yoki videoloyiha yaratadi.',
      'Loyiha natijalarini himoya qiladi.',
      'O‘qituvchi loyiha natijalarini belgilangan mezonlar asosida baholaydi.',
    ],
    topic: { slug: 'sharq-uygonish-davri', title: 'IX–XII asrlarda Uyg‘onish davri. Ajdodlarimizning jahon sivilizatsiyasiga qo‘shgan hissasi' },
    tools: ['sources', 'profile'],
  },
];
