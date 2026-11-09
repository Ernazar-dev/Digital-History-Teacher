import type { Book } from '../types';

/**
 * «Boburnoma» (Zahiriddin Muhammad Bobur) video ssenariysi.
 * Faktlar: Boburnoma matni (Sharq nashri — platformadagi Word fayl) va umum e'tirof etilgan tarixiy ma'lumotlar.
 */
export const BOBURNOMA: Book = {
  slug: 'boburnoma',
  compId: 'Boburnoma',
  title: 'Boburnoma',
  author: 'Zahiriddin Muhammad Bobur',
  years: '1483 – 1530',
  images: [
    'portret', 'andijon-xabar', 'samarqand-uchrashuv', 'samarqand-miniatyura', 'daryodan-otish', 'qal-a-chiqish', 'kobul-bogi',
    'kobul-maqbara', 'panipat', 'agra-xazina', 'agra-qal-a', 'hind-qushlari', 'hind-hayvonlar', 'suv-qurilishi', 'bayram',
  ],
  scenes: [
    {
      id: 'title',
      kind: 'title',
      kicker: 'Tarixiy asar',
      heading: 'Boburnoma',
      lines: [
        'Boburnoma.',
        'Zahiriddin Muhammad Bobur — shoh, shoir va tarixchi. Uning xotiralari besh yuz yildan beri o‘quvchini hayratga solib keladi.',
      ],
      images: ['portret', 'bayram'],
    },
    {
      id: 'birth',
      kind: 'story',
      kicker: 'Andijondan boshlangan yo‘l',
      heading: 'Yosh hukmdor',
      lines: [
        'Zahiriddin Muhammad Bobur 1483-yilda Andijonda tug‘ildi.',
        'Otasi Umarshayx mirzo Farg‘ona hukmdori edi. Bobur ota tomondan Amir Temurning, ona tomondan esa Chingizxonning avlodi hisoblanadi.',
        'O‘n ikki yoshida, 1494-yilda, otasi vafot etgach, Farg‘ona taxtiga o‘tirdi.',
      ],
      stamps: ['1483', null, '1494'],
      chips: ['Andijon', 'Temuriy', 'Farg‘ona hukmdori'],
      images: ['andijon-xabar', 'suv-qurilishi'],
    },
    {
      id: 'samarkand',
      kind: 'story',
      kicker: 'Samarqand orzusi',
      heading: 'Temur shahri sari',
      lines: [
        'Boburning eng katta orzusi — ajdodi Amir Temurning poytaxti Samarqandni egallash edi.',
        'U Samarqandni 1497, 1500 va 1511-yillarda uch marta oldi, ammo Shayboniyxon bosimi tufayli uni ushlab tura olmadi.',
        'Farg‘onadan ham ayrilgan Bobur yillar davomida sarson-sargardonlikda yurdi.',
      ],
      stamps: [null, '3 marta', null],
      chips: ['Samarqand', 'Shayboniyxon'],
      images: ['samarqand-miniatyura', 'samarqand-uchrashuv', 'daryodan-otish'],
    },
    {
      id: 'kabul',
      kind: 'story',
      kicker: 'Yangi makon',
      heading: 'Kobul',
      lines: [
        '1504-yilda Bobur oz sonli yigitlari bilan Hindiquish tog‘laridan oshib, Kobulni egalladi.',
        '1507-yilda esa o‘zini «Podshoh» deb e’lon qildi.',
        'Kobulning tog‘lari, bog‘lari va mevalarini u Boburnomada mehr bilan tasvirlaydi.',
      ],
      stamps: ['1504', '1507', null],
      chips: ['Hindiquish', 'Podshoh'],
      images: ['kobul-bogi', 'qal-a-chiqish'],
    },
    {
      id: 'journey',
      kind: 'journey',
      kicker: 'Bir umrlik safar',
      heading: 'Bobur yo‘li',
      lines: [
        'Bobur yo‘li Andijondan boshlandi va Samarqandga olib bordi.',
        'Keyin Kobul uning yangi makoniga aylandi.',
        'Umrining so‘nggi manzili esa Hindiston bo‘ldi.',
      ],
      images: ['daryodan-otish'],
      route: [
        { name: 'Andijon', lat: 40.78, lon: 72.34, line: 0, note: '1483' },
        { name: 'Samarqand', lat: 39.65, lon: 66.96, line: 0, note: '1497 · 1500 · 1511' },
        { name: 'Kobul', lat: 34.53, lon: 69.17, line: 1, note: '1504' },
        { name: 'Agra', lat: 27.18, lon: 78.01, line: 2, note: '1530' },
      ],
    },
    {
      id: 'india',
      kind: 'story',
      kicker: 'Hindiston',
      heading: 'Panipat jangi',
      lines: [
        '1526-yil aprelida Panipat yonidagi jangda Bobur Ibrohim Lodiy qo‘shinini tor-mor etdi.',
        'Shu g‘alaba bilan Hindistonda Boburiylar sulolasiga asos solindi. Bu sulola uch asrdan ortiq hukmronlik qildi.',
        'Bobur 1530-yilda Agrada vafot etdi. Uning jasadi Kobulga olib borilib, bugun «Bog‘i Bobur» deb ataladigan bog‘da qo‘yildi.',
      ],
      stamps: ['1526', 'Boburiylar', '1530'],
      chips: ['Panipat', 'Boburiylar sulolasi', 'Agra'],
      images: ['panipat', 'agra-xazina', 'agra-qal-a', 'kobul-maqbara'],
    },
    {
      id: 'book',
      kind: 'story',
      kicker: 'Xotira kitobi',
      heading: 'Boburnoma haqida',
      lines: [
        'Boburnoma — Bobur umrining oxirida eski o‘zbek, ya’ni chig‘atoy turkiysida yozgan xotira kitobidir.',
        'Unda Farg‘ona, Samarqand, Kobul va Hindiston voqealari ochiq-oydin, o‘z xato va yutuqlarini yashirmay bayon etilgan.',
        'Kitob yillar bo‘yicha — «to‘qqiz yuz birinchi yil voqealari» tarzida — bobma-bob yoziladi.',
      ],
      chips: ['Chig‘atoy turkiysi', 'Ochiq-oydin bayon', 'Yillar bo‘yicha'],
      images: ['bayram', 'hind-qushlari'],
    },
    {
      id: 'quote',
      kind: 'quote',
      kicker: 'Boburnomadan',
      heading: 'Bobur qalamida',
      lines: [
        'Bobur tabiatni ham olim kabi sinchkov kuzatgan. Vatani haqida u shunday yozadi:',
        '«Farg‘ona kichik viloyatdir. Don-duni ko‘p, mevasi farovon.»',
        'Hindiston mevalaridan anbani, ya’ni mangoni maqtab: «Hindistonning yaxshi mevasi shudir», deydi.',
      ],
      quote: { text: 'Farg‘ona kichik viloyatdir. Don-duni ko‘p, mevasi farovon.', by: 'Boburnoma' },
      images: ['kobul-bogi', 'hind-hayvonlar'],
    },
    {
      id: 'legacy',
      kind: 'story',
      kicker: 'Meros',
      heading: 'Asrlar osha',
      lines: [
        'Boburnoma 1589-yilda Abdurahimxon tomonidan fors tiliga o‘girildi, keyinchalik ingliz va boshqa ko‘plab tillarga tarjima qilindi.',
        'Bugun u jahon adabiyotining noyob yodgorligi sifatida o‘rganiladi.',
      ],
      stamps: ['1589', null],
      chips: ['Forscha tarjima', 'Jahon tillarida'],
      images: ['portret', 'kobul-maqbara'],
    },
    {
      id: 'outro',
      kind: 'outro',
      kicker: 'Digital History Teacher',
      heading: 'Boburnomani o‘qing',
      lines: [
        'Boburnomaning to‘liq matnini «Digital History Teacher» platformasining Manbalar bo‘limida o‘qishingiz va undan kerakli so‘zni qidirib topishingiz mumkin.',
      ],
      images: ['panipat', 'portret'],
    },
  ],
};
