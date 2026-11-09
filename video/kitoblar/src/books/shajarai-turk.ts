import type { Book } from '../types';

/**
 * «Shajarai turk» (Abulg‘ozi Bahodirxon) video ssenariysi.
 * Faktlar: platformadagi kitob matni (boblari sarlavhalari) va umum e’tirof etilgan tarixiy ma’lumotlar.
 */
export const SHAJARAI_TURK: Book = {
  slug: 'shajarai-turk',
  compId: 'ShajaraiTurk',
  title: 'Shajarai turk',
  author: 'Abulg‘ozi Bahodirxon',
  years: 'Turkiy xalqlar shajarasi',
  images: [
    'chingiz-taxt', 'chingiz-qarorgoh', 'oguz-taxt', 'oguz-jang', 'oguz-elchi', 'xiva-devor', 'kunya-ark',
    'tosh-hovli', 'kalta-minor', 'ota-darvoza', 'islomxoja',
  ],
  wide: ['xiva-devor'],
  scenes: [
    {
      id: 'title',
      kind: 'title',
      kicker: 'Tarixiy asar',
      heading: 'Shajarai turk',
      lines: [
        'Shajarai turk.',
        'Xiva xoni va tarixchi Abulg‘ozi Bahodirxonning turkiy xalqlar shajarasi va tarixiga bag‘ishlangan asari.',
      ],
      images: ['chingiz-taxt', 'kunya-ark'],
    },
    {
      id: 'author',
      kind: 'story',
      kicker: 'Muallif',
      heading: 'Abulg‘ozi Bahodirxon',
      lines: [
        'Abulg‘ozi 1603-yilda tug‘ilgan, 1643-yildan boshlab Xiva xonligini boshqargan.',
        'U nafaqat hukmdor, balki o‘z davrining yirik tarixchisi ham edi.',
        'Davlat tashvishlari orasida ikki tarixiy asar yaratgan, ularning eng mashhuri — Shajarai turkdir.',
      ],
      stamps: ['1603', '1643', null],
      chips: ['Xiva xoni', 'Tarixchi'],
      images: ['kunya-ark', 'tosh-hovli', 'xiva-devor'],
    },
    {
      id: 'language',
      kind: 'story',
      kicker: 'Asar tili',
      heading: 'Xalq tilida',
      lines: [
        'Shajarai turk eski o‘zbek, ya’ni chig‘atoy turkiy tilida yozilgan.',
        'Muallif asarni xalq tushunadigan sodda tilda yozishni maqsad qilgan.',
        'U Rashididdin, Sharafiddin Yazdiy kabi o‘ndan ortiq tarixchilar asarlaridan va turkiy xalq rivoyatlaridan foydalangan.',
      ],
      chips: ['Chig‘atoy turkiysi', 'Sodda uslub', 'Yozma va og‘zaki manbalar'],
      images: ['oguz-elchi', 'chingiz-qarorgoh'],
    },
    {
      id: 'content',
      kind: 'story',
      kicker: 'Mazmuni',
      heading: 'Shajara boblari',
      lines: [
        'Asar Odam Ato yaratilgani haqidagi bobdan boshlanadi.',
        'Rivoyatga ko‘ra, turkiy xalqlar Nuh payg‘ambarning o‘g‘li Yofasdan tarqalgan.',
        'Undan keyin Mo‘g‘ulxon, Qorahon va Oguzxon haqidagi rivoyatlar keladi.',
        'Asar to‘qqiz bobga bo‘lingan. Har bir bobda turkiy va mo‘g‘ul xalqlarining ajdodlari va ularning avlodlari zikr etiladi.',
      ],
      chips: ['Odam Ato', 'Nuh va Yofas', 'Mo‘g‘ulxon va Oguzxon', 'To‘qqiz bob'],
      images: ['oguz-taxt', 'oguz-elchi', 'oguz-jang'],
    },
    {
      id: 'oguz',
      kind: 'story',
      kicker: 'Rivoyatlar',
      heading: 'Oguzxon',
      lines: [
        'Oguzxon haqidagi bob asarning eng sevib o‘qiladigan qismlaridan biridir.',
        'Unda Oguzxonning oltita o‘g‘li va yigirma to‘rtta nabirasi, ularning ismlari ma’nolari bayon etiladi.',
        'Bu rivoyatlar turkiy xalqlar og‘zaki ijodidan olingan bo‘lib, asarga alohida joziba bag‘ishlaydi.',
      ],
      stamps: [null, '6 o‘g‘il · 24 nabira'],
      chips: ['Oguzxon', 'Avlodlar'],
      images: ['oguz-jang', 'oguz-taxt'],
    },
    {
      id: 'chingiz',
      kind: 'story',
      kicker: 'Tarixiy voqealar',
      heading: 'Chingizxon va avlodlari',
      lines: [
        'Keyingi boblar Chingizxon va uning avlodlari tarixiga bag‘ishlangan.',
        '1206-yilda qurultoyda Temujin Chingizxon deb e’lon qilindi.',
        'Chingizxonning to‘rt o‘g‘li — Jo‘ji, Chig‘atoy, O‘gaday va Tuluy — ulkan ulus hukmdorlari bo‘ldi.',
        'Asar Chingiziylar sulolasining Movarounnahr va Xorazmga ta’sirini ham yoritadi.',
      ],
      stamps: [null, '1206', '4 o‘g‘il', null],
      chips: ['Chingizxon', 'Qurultoy', 'To‘rt o‘g‘il', 'Chingiziylar'],
      images: ['chingiz-taxt', 'chingiz-qarorgoh'],
    },
    {
      id: 'khiva',
      kind: 'story',
      kicker: 'Xorazm tarixi',
      heading: 'O‘z zamonining guvohi',
      lines: [
        'Asarning oxirgi qismlarida Xorazm va Xiva xonlarining tarixi bayon etiladi.',
        'Bu yerda muallif o‘zi ishtirok etgan voqealarni ko‘rganidek yozadi.',
        'Muallif xonlik tarixini bevosita guvoh sifatida yozgani uchun, bu ma’lumotlar alohida qadrlanadi.',
      ],
      chips: ['Xorazm xonlari', 'Ko‘rgan-kechirganlar'],
      images: ['xiva-devor', 'ota-darvoza', 'kalta-minor', 'islomxoja'],
    },
    {
      id: 'legacy',
      kind: 'story',
      kicker: 'Meros',
      heading: 'Asrlar osha',
      lines: [
        'Abulg‘ozi asarni tugata olmay vafot etdi, uni o‘g‘li Anushaxon yakunladi.',
        '1825-yilda asar Qozonda bosmadan chiqdi va keyinchalik ko‘plab tillarga tarjima qilindi.',
        'Bugun Shajarai turk turkiy xalqlar tarixini o‘rganishda eng qadrli manbalardan biri hisoblanadi.',
        'Asar turkiy xalqlarning umumiy tarixiy xotirasini saqlab qolgan qadimiy manbadir.',
      ],
      stamps: [null, '1825', null],
      chips: ['Anushaxon', 'Bosma nashr', 'Tarjimalar'],
      images: ['kunya-ark', 'tosh-hovli', 'kalta-minor'],
    },
    {
      id: 'outro',
      kind: 'outro',
      kicker: 'Digital History Teacher',
      heading: 'Shajarai turkni o‘qing',
      lines: [
        'Kitobning to‘liq matnini «Digital History Teacher» platformasining Manbalar bo‘limida o‘qishingiz va undan kerakli so‘zni qidirib topishingiz mumkin.',
      ],
      images: ['chingiz-taxt', 'kunya-ark'],
    },
  ],
};
