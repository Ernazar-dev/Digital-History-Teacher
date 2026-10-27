import type { EvidenceKind } from '@prisma/client';

/**
 * Kompetensiya komponentlari — DOCX hujjat, 5-modul jadvalidan olingan ISHCHI MODEL.
 * Hujjatda ta'kidlanganidek, ular nazariy tahlil, ekspertlar fikri va dastlabki diagnostika
 * natijalari asosida takomillashtirilishi kerak. Vaznlar va daraja chegaralari —
 * DASTLABKI konfiguratsiya (admin panelidan o'zgartiriladi), ilmiy tasdiqlangan qiymat emas.
 */
export const COMPONENTS: {
  code: string;
  name: string;
  definition: string;
  methods: string;
  weight: number;
  weights: Partial<Record<EvidenceKind, number>>;
  criteria: { title: string; description: string; indicators: string[] }[];
}[] = [
  {
    code: 'MOTIVATIONAL',
    name: 'Motivatsion-qadriyatli',
    definition: 'Raqamli tarixiy manbalardan foydalanishga qiziqish va kasbiy intilish.',
    methods: 'So‘rovnoma, refleksiv savollar',
    weight: 1,
    weights: { SURVEY: 0.6, REFLECTION: 0.4 },
    criteria: [
      {
        title: 'Raqamli tarixiy manbalarga qiziqish',
        description: 'Talabaning raqamli manbalar bilan ishlashga ichki motivatsiyasi.',
        indicators: ['Manbalar bilan ishlashga qiziqishini so‘rovnomada ifodalaydi', 'Qo‘shimcha manbalarni mustaqil izlaydi'],
      },
      {
        title: 'Kasbiy intilish',
        description: 'Raqamli manbalarni kelajakdagi o‘qituvchilik faoliyati bilan bog‘lash.',
        indicators: ['Raqamli manbalarning dars uchun ahamiyatini asoslaydi'],
      },
    ],
  },
  {
    code: 'COGNITIVE',
    name: 'Kognitiv',
    definition: 'Raqamli manbalar, tarixiy materiallar va ularni o‘qitish metodikasini bilish.',
    methods: 'Test, manbalarni tahlil qilish',
    weight: 1,
    weights: { TEST: 0.5, SOURCE_ANALYSIS: 0.5 },
    criteria: [
      {
        title: 'Manba turlari va manbashunoslik tushunchalarini bilish',
        description: 'Birlamchi va ikkilamchi manba, kelib chiqish, ishonchlilik tushunchalari.',
        indicators: ['Manba turini to‘g‘ri aniqlaydi', 'Birlamchi va ikkilamchi manbalarni farqlaydi'],
      },
      {
        title: 'Manbalarni tanqidiy tahlil qilish',
        description: 'Muallif, maqsad, kontekst, ishonchlilik va cheklovlarni baholash.',
        indicators: ['Muallif nuqtayi nazarini aniqlaydi', 'Ishonchlilik va cheklovlarni dalil bilan asoslaydi'],
      },
    ],
  },
  {
    code: 'ACTIVITY',
    name: 'Faoliyatli-metodik',
    definition: 'Manbalarni saralash, topshiriq tuzish va dars ishlanmasini ishlab chiqish.',
    methods: 'Amaliy topshiriq, dars ishlanmasini ekspertiza qilish',
    weight: 1,
    weights: { PRACTICAL_TASK: 0.4, LESSON_PLAN: 0.6 },
    criteria: [
      {
        title: 'Manbalarni saralash va dars maqsadiga moslashtirish',
        description: 'Mavzu va o‘quvchilar yoshiga mos manbalarni tanlash.',
        indicators: ['Tanlangan manbalar dars maqsadiga mos', 'Manba o‘quvchilar yoshiga moslashtirilgan'],
      },
      {
        title: 'Metodik topshiriq va dars ishlanmasini loyihalash',
        description: 'Muammoli savollar, interaktiv metodlar, bosqichlar va baholash mezonlari.',
        indicators: ['Muammoli savollar manbaga asoslangan', 'Dars bosqichlari va vaqt taqsimoti asoslangan', 'Baholash mezonlari aniq'],
      },
    ],
  },
  {
    code: 'REFLECTIVE',
    name: 'Refleksiv-baholash',
    definition: 'O‘z metodik faoliyatini tahlil qilish va xatolarini tuzatish.',
    methods: 'Elektron portfolio, ekspert bahosi',
    weight: 1,
    weights: { PORTFOLIO: 0.3, EXPERT: 0.4, REFLECTION: 0.3 },
    criteria: [
      {
        title: 'O‘z faoliyatini tahlil qilish',
        description: 'Metodik qarorlarni asoslash va natijani baholash.',
        indicators: ['Metodik qarorlarini izohlaydi', 'O‘zini baholashi o‘qituvchi bahosiga yaqin'],
      },
      {
        title: 'Ishni takomillashtirish',
        description: 'Fikr-mulohaza asosida ishini qayta ishlash.',
        indicators: ['Qaytarilgan ishni izohlar asosida yaxshilaydi'],
      },
    ],
  },
];

/**
 * Indikator darajalari tavsifi — hujjat, 5-modul: «darajalarni aniq indikatorlar, ball mezonlari orqali belgilash».
 * Ball: Past = 1, O'rta = 2, Yuqori = 3. Kalit — indikator nomi. DASTLABKI ishchi tavsiflar (admin tahrirlaydi).
 */
export const INDICATOR_DESCRIPTORS: Record<string, [low: string, medium: string, high: string]> = {
  'Manbalar bilan ishlashga qiziqishini so‘rovnomada ifodalaydi': [
    'Qiziqish past yoki befarq; manbalar bilan faqat topshiriq talab qilganda ishlaydi',
    'Qiziqishini ifodalaydi, ammo uni aniq misollar bilan asoslamaydi',
    'Barqaror qiziqish bildiradi va uni o‘z tajribasidan aniq misollar bilan asoslaydi',
  ],
  'Qo‘shimcha manbalarni mustaqil izlaydi': [
    'Faqat berilgan manbalardan foydalanadi',
    'Ba’zan qo‘shimcha manba topadi, lekin manzil va ishonchliligini tekshirmaydi',
    'Mustaqil ravishda ishonchli raqamli arxiv va kataloglardan qo‘shimcha manba topadi',
  ],
  'Raqamli manbalarning dars uchun ahamiyatini asoslaydi': [
    'Ahamiyatini umumiy so‘zlar bilan ifodalaydi yoki asoslamaydi',
    'Bitta-ikkita foydasini aytadi, o‘quvchi faoliyati bilan bog‘lamaydi',
    'Manba o‘quvchilarning tarixiy tafakkurini qanday rivojlantirishini aniq asoslaydi',
  ],
  'Manba turini to‘g‘ri aniqlaydi': [
    'Manba turini noto‘g‘ri belgilaydi',
    'Turini to‘g‘ri aniqlaydi, ammo xususiyatlarini izohlamaydi',
    'Turini aniqlaydi va uning tahlil uchun ahamiyatli xususiyatlarini izohlaydi',
  ],
  'Birlamchi va ikkilamchi manbalarni farqlaydi': [
    'Birlamchi va ikkilamchi manbalarni chalkashtiradi',
    'Ko‘p hollarda farqlaydi, murakkab holatlarda xato qiladi',
    'Barqaror farqlaydi va farqning talqin uchun ahamiyatini tushuntiradi',
  ],
  'Muallif nuqtayi nazarini aniqlaydi': [
    'Muallif pozitsiyasini e’tiborga olmaydi, matnni yagona haqiqat deb qabul qiladi',
    'Muallifni aniqlaydi, ammo maqsadi va tarafkashligini yuzaki baholaydi',
    'Muallif maqsadi, kontekst va tarafkashligini matndagi dalillar bilan ko‘rsatadi',
  ],
  'Ishonchlilik va cheklovlarni dalil bilan asoslaydi': [
    'Ishonchlilik haqida asossiz xulosa chiqaradi',
    'Ishonchlilikni baholaydi, lekin dalillar yetarli emas yoki cheklovlarni ko‘rsatmaydi',
    'Ishonchlilik va cheklovlarni boshqa manbalar bilan solishtirib asoslaydi',
  ],
  'Tanlangan manbalar dars maqsadiga mos': [
    'Manbalar dars maqsadiga aloqasiz yoki tasodifiy tanlangan',
    'Manbalar mavzuga mos, ammo maqsadga erishishdagi o‘rni aniq emas',
    'Har bir manbaning dars maqsadiga erishishdagi o‘rni aniq ko‘rsatilgan',
  ],
  'Manba o‘quvchilar yoshiga moslashtirilgan': [
    'Manba moslashtirilmagan — o‘quvchilar uchun murakkab yoki juda soddalashtirilgan',
    'Qisman moslashtirilgan (masalan, faqat matn qisqartirilgan)',
    'Til, hajm va topshiriq o‘quvchilar yoshiga mos, asl manba mazmuni saqlangan',
  ],
  'Muammoli savollar manbaga asoslangan': [
    'Savollar reproduktiv yoki manbaga bog‘liq emas',
    'Savollar manbaga bog‘liq, ammo bitta javobli',
    'Savollar manbadagi dalillar asosida bir nechta asosli javobni talab qiladi',
  ],
  'Dars bosqichlari va vaqt taqsimoti asoslangan': [
    'Bosqichlar mantiqsiz yoki vaqt dars davomiyligidan oshib ketgan',
    'Bosqichlar mantiqiy, lekin manba bilan ishlashga vaqt yetarli emas',
    'Bosqichlar mantiqiy, manba bilan ishlashga yetarli vaqt ajratilgan',
  ],
  'Baholash mezonlari aniq': [
    'Mezonlar yo‘q yoki umumiy («yaxshi javob»)',
    'Mezonlar bor, lekin o‘lchab bo‘lmaydi',
    'Mezonlar aniq, kuzatiladigan va dars maqsadi bilan bog‘langan',
  ],
  'Metodik qarorlarini izohlaydi': [
    'Qarorlarini izohlamaydi',
    'Izohlaydi, ammo pedagogik asos keltirmaydi',
    'Har bir qarorni maqsad, o‘quvchilar va manba xususiyatlari bilan asoslaydi',
  ],
  'O‘zini baholashi o‘qituvchi bahosiga yaqin': [
    'O‘z bahosi o‘qituvchi bahosidan keskin farq qiladi (20 balldan ortiq)',
    'Farq 10–20 ball oralig‘ida',
    'Farq 10 balldan kam va farqning sababini tushuntira oladi',
  ],
  'Qaytarilgan ishni izohlar asosida yaxshilaydi': [
    'Izohlarni hisobga olmaydi yoki ishni qayta topshirmaydi',
    'Izohlarning bir qismini hisobga oladi',
    'Barcha izohlarni hisobga oladi va o‘zgarishlarini asoslaydi',
  ],
};

/** Uchta daraja — hujjatdagi ta'riflar; foiz chegaralari DASTLABKI taklif (sozlanadi) */
export const LEVELS = [
  {
    code: 'LOW', name: 'Past', minPercent: 0, maxPercent: 54.9,
    description: 'Talaba raqamli tarixiy manbalarni tanlash va ular asosida dars tashkil etishda qiynaladi.',
  },
  {
    code: 'MEDIUM', name: 'O‘rta', minPercent: 55, maxPercent: 79.9,
    description: 'Talaba manbalardan foydalana oladi, ammo ularni mustaqil tahlil qilish va metodik jihatdan moslashtirishda yordamga muhtoj.',
  },
  {
    code: 'HIGH', name: 'Yuqori', minPercent: 80, maxPercent: 100,
    description: 'Talaba manbalarni mustaqil saralaydi, tanqidiy tahlil qiladi va samarali tarix darsini loyihalay oladi.',
  },
];
