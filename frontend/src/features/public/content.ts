/** DOCX hujjatdagi platforma konsepsiyasi (7 modul va pedagogik zanjir) */
export const CHAIN = [
  'Raqamli tarixiy manbani topish',
  'Manbani tanlash va tekshirish',
  'Tanqidiy tahlil qilish',
  'Dars maqsadiga moslashtirish',
  'Metodik topshiriq yaratish',
  'Dars ishlanmasini tuzish',
  'Natijani baholash',
  'Refleksiya va takomillashtirish',
];

export const MODULES = [
  { n: 1, short: 'Manbalar kutubxonasi', brief: 'Yozma hujjatlar, fotosuratlar, xaritalar va multimedia', title: 'Raqamli tarixiy manbalar kutubxonasi', text: 'Yozma, vizual, kartografik, audio-video va arxeologik manbalar: kelib chiqishi, ishonchliligi, cheklovlari va metodik tavsiyalari bilan.', to: '/app/sources' },
  { n: 2, short: 'Tahlil laboratoriyasi', brief: 'Manbalarni tanqidiy tahlil qiling va taqqoslang', title: 'Manbalarni tahlil qilish laboratoriyasi', text: 'Manba turiga moslashgan tanqidiy tahlil savollari, manbalarni yonma-yon taqqoslash va xulosani dalillar bilan asoslash.', to: '/app/analysis' },
  { n: 3, short: 'Dars konstruktori', brief: 'Manba asosida dars loyihasini yarating', title: 'Interaktiv tarix darsi konstruktori', text: 'Sinf, mavzu, maqsad, manbalar, muammoli savollar, metodlar, bosqichlar va baholash mezonlarini mustaqil loyihalash.', to: '/app/lessons' },
  { n: 4, short: 'Virtual muzey va xarita', brief: '3D modellar, 360° panoramalar va interaktiv xarita', title: 'Virtual tarixiy sayohat va muzey', text: 'Sketchfab 3D modellari va Uzbekistan360 panoramalari asosida kuzatuv, dalil va mashg‘ulot topshiriqlari.', to: '/app/museum' },
  { n: 5, short: 'Baholash markazi', brief: 'Kompetensiya monitoringi va diagnostika', title: 'Metodik kompetensiyani baholash markazi', text: 'To‘rt komponentli ishchi model, boshlang‘ich–oraliq–yakuniy diagnostika va rivojlanish dinamikasi.', to: '/app/diagnostics' },
  { n: 6, short: 'Topshiriqlar va simulyator', brief: 'Real pedagogik vaziyatlar va interaktiv mashqlar', title: 'Metodik topshiriqlar va raqamli simulyator', text: 'Real pedagogik vaziyatlarga o‘xshash topshiriqlar, rubrika asosida baholash va qayta ishlash.', to: '/app/assignments' },
  { n: 7, short: 'Shaxsiy kabinet', brief: 'Portfolio, baholar va o‘quv yo‘li', title: 'Shaxsiy kabinet va elektron portfolio', text: 'Shaxsiy kabinet: o‘z ishlaringizni (PDF, Word, taqdimot) yuklab, elektron portfolio yuriting.', to: '/app/profile' },
];

export const COMPONENTS_INFO = [
  { name: 'Motivatsion-qadriyatli', skills: 'Raqamli tarixiy manbalardan foydalanishga qiziqish va kasbiy intilish', methods: 'So‘rovnoma, refleksiv savollar' },
  { name: 'Kognitiv', skills: 'Raqamli manbalar, tarixiy materiallar va ularni o‘qitish metodikasini bilish', methods: 'Test, manbalarni tahlil qilish' },
  { name: 'Faoliyatli-metodik', skills: 'Manbalarni saralash, topshiriq tuzish va dars ishlanmasini ishlab chiqish', methods: 'Amaliy topshiriq, dars ishlanmasi ekspertizasi' },
  { name: 'Refleksiv-baholash', skills: 'O‘z metodik faoliyatini tahlil qilish va xatolarini tuzatish', methods: 'O‘zini baholash, elektron portfolio, ekspert bahosi' },
];
