/**
 * Tarixiy davrlar va mavzular (boshlang‘ich taksonomiya).
 * Yillar taxminiy chegaralar; aniq davrlashtirish tadqiqotchi tomonidan tasdiqlanishi kerak.
 */
export const PERIODS = [
  {
    slug: 'ilk-orta-asrlar',
    name: 'Ilk o‘rta asrlar (Sug‘d va Movarounnahr, V–VIII asrlar)',
    startYear: 400,
    endYear: 800,
    sortOrder: 1,
    description: 'Sug‘d shahar-davlatlari davri; Samarqand (Afrosiyob) madaniyati.',
    reference: 'Taxminiy davrlashtirish.',
  },
  {
    slug: 'temuriylar-davri',
    name: 'Amir Temur va Temuriylar davri (1370–1507)',
    startYear: 1370,
    endYear: 1507,
    sortOrder: 2,
    description: 'Amir Temur hokimiyatining o‘rnatilishidan Temuriylar davlatining yemirilishigacha bo‘lgan davr.',
    reference: 'Encyclopaedia Britannica: Timurid dynasty — https://www.britannica.com/topic/Timurid-dynasty',
  },
  {
    slug: 'buxoro-xonligi',
    name: 'Buxoro xonligi davri (XVI–XVIII asrlar)',
    startYear: 1500,
    endYear: 1785,
    sortOrder: 3,
    description: 'Shayboniylar va Ashtarxoniylar sulolalari davri. Samarqanddagi Sherdor va Tillakori madrasalari shu davrda qurilgan.',
    reference: 'Taxminiy chegaralar. UNESCO: Samarkand – Crossroads of Cultures — https://whc.unesco.org/en/list/603',
  },
  {
    slug: 'xonliklar-va-amirlik',
    name: 'Buxoro amirligi, Xiva va Qo‘qon xonliklari (XVIII–XX asr boshi)',
    startYear: 1750,
    endYear: 1920,
    sortOrder: 4,
    description: 'O‘rta Osiyo xonliklari va Buxoro amirligi davri.',
    reference: 'Taxminiy chegaralar.',
  },
  {
    slug: 'jadidchilik',
    name: 'Jadidchilik harakati (XIX asr oxiri – XX asr boshi)',
    startYear: 1890,
    endYear: 1930,
    sortOrder: 5,
    description: 'Ma’rifatparvarlik, yangi usul maktablari, matbuot va teatr orqali jamiyatni isloh qilish harakati.',
    reference: 'Taxminiy chegaralar.',
  },
];

export const TOPICS: { slug: string; name: string; period: string | null; description?: string }[] = [
  {
    slug: 'amir-temur-davlati',
    name: 'Amir Temur davlati',
    period: 'temuriylar-davri',
    description: 'Saroy tarixchilari, muxolif muallif va xorijiy elchi nigohidagi Amir Temur davlati: yozma manbalarni taqqoslash uchun to‘plam.',
  },
  { slug: 'temuriylar-memorchiligi', name: 'Temuriylar davri me’morchiligi', period: 'temuriylar-davri' },
  { slug: 'ulugbek-va-ilm-fan', name: 'Mirzo Ulug‘bek va ilm-fan', period: 'temuriylar-davri' },
  { slug: 'sugd-madaniyati', name: 'Sug‘d madaniyati', period: 'ilk-orta-asrlar' },
  { slug: 'samarqand-madrasalari', name: 'Samarqand madrasalari', period: 'buxoro-xonligi' },
  { slug: 'xiva-memorchiligi', name: 'Xiva me’morchiligi', period: 'xonliklar-va-amirlik' },
  {
    slug: 'buxoro-amirligi',
    name: 'Buxoro amirligi tarixi',
    period: 'xonliklar-va-amirlik',
    description: 'Amirlik davri fotosuratlari, ichki tanqidiy asar, memuar va sovet davri filmi — turli turdagi va turli davrda yaratilgan manbalar.',
  },
  {
    slug: 'jadidlar-marifatparvarligi',
    name: 'Jadidlar ma’rifatparvarligi',
    period: 'jadidchilik',
    description: 'Jadid matbuoti, teatri va yetakchilari: jurnal, afisha va fotosuratlar asosida dars loyihalash uchun manbalar.',
  },
  { slug: 'arxeologik-yodgorliklar', name: 'Arxeologik yodgorliklar va topilmalar', period: null },
  { slug: 'musiqiy-meros', name: 'O‘zbek musiqiy merosi', period: null },
  { slug: 'manbashunoslik', name: 'Tarixiy manbashunoslik', period: null },
];
