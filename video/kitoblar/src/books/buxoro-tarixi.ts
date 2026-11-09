import type { Book } from '../types';

/**
 * «Buxoro tarixi» (Abu Bakr Narshaxiy) video ssenariysi.
 * Faktlar: platformadagi kitob matni (mundarijasi va so‘zboshisi) va umum e’tirof etilgan tarixiy ma’lumotlar.
 */
export const BUXORO_TARIXI: Book = {
  slug: 'buxoro-tarixi',
  compId: 'BuxoroTarixi',
  title: 'Buxoro tarixi',
  author: 'Abu Bakr Narshaxiy',
  years: 'X asr',
  images: [
    'ark', 'ark-devor', 'ark-hovli', 'ismoil-maqbara', 'ismoil-maqbara-2', 'ismoil-eshik', 'somoniy-maqbara',
    'magoki-attori', 'magoki-attori-2', 'chashma-ayub', 'ark-yon',
  ],
  scenes: [
    {
      id: 'title',
      kind: 'title',
      kicker: 'Tarixiy asar',
      heading: 'Buxoro tarixi',
      lines: [
        'Buxoro tarixi.',
        'Abu Bakr Narshaxiy qalamiga mansub, shahrimiz o‘tmishi haqidagi eng qadimiy va qimmatli manbalardan biri.',
      ],
      images: ['ark', 'somoniy-maqbara'],
    },
    {
      id: 'author',
      kind: 'story',
      kicker: 'Muallif va zamon',
      heading: 'Narshaxiy',
      lines: [
        'Abu Bakr Muhammad ibn Ja’far Narshaxiy Buxoro yaqinidagi Narshax qishlog‘ida tug‘ilgan.',
        'U asarini X asrda Somoniylar davrida, amir Nuh ibn Nasr uchun arab tilida yozgan.',
        'Arabcha asl nusxa saqlanmagan. Asar keyinchalik forschaga o‘girilib, shu ko‘rinishda bizgacha yetib kelgan.',
      ],
      chips: ['Narshax qishlog‘i', 'Somoniylar davri', 'Forscha tarjima'],
      images: ['somoniy-maqbara', 'ismoil-maqbara', 'ark-devor'],
    },
    {
      id: 'city',
      kind: 'story',
      kicker: 'Shahar tarixi',
      heading: 'Buxoroning tug‘ilishi',
      lines: [
        'Kitobda Buxoroning turli nomlari, Arkning bino etilishi, shahar devori va anhorlari haqida batafsil so‘z yuritiladi.',
        'Arkning qurilishi haqida qadimiy rivoyatlar keltirilgan.',
        'Buxoro va unga qo‘shiladigan joylar, solig‘i va tangalari ham tasvirlangan.',
      ],
      chips: ['Buxoro nomlari', 'Ark', 'Shahar devori'],
      images: ['ark', 'ark-hovli', 'ark-yon'],
    },
    {
      id: 'queen',
      kind: 'story',
      kicker: 'Qiziqarli sahifalar',
      heading: 'Hukmdor ayol',
      lines: [
        'Asarda Buxoroga podshoh bo‘lgan xotin va undan keyingi hukmdorlar haqida ham ma’lumot bor.',
        'Narshaxiy shahardagi qozilik qilgan kishilar, bozorlar, qishloqlar va mahallalarni ham sinchkovlik bilan sanab o‘tadi.',
      ],
      chips: ['Hukmdor xotin', 'Qozilar', 'Bozorlar'],
      images: ['ark-hovli', 'ark-devor'],
    },
    {
      id: 'arab',
      kind: 'story',
      kicker: 'Yangi davr',
      heading: 'Arablar va islom',
      lines: [
        'Kitobning muhim qismi Buxoroning arablar tomonidan fath etilishiga bag‘ishlangan.',
        'Fathdan so‘ng shaharda Masjidi Jome qurilgani va Iyd namozgohi bino etilgani ham yozilgan.',
        'Narshaxiy shaharning ilk islom davridagi hayotini jonli tasvirlaydi.',
      ],
      stamps: ['VIII asr', null, null],
      chips: ['Fath', 'Masjidi Jome', 'Iyd namozgohi'],
      images: ['magoki-attori', 'magoki-attori-2', 'chashma-ayub'],
    },
    {
      id: 'samanids',
      kind: 'story',
      kicker: 'Oltin davr',
      heading: 'Somoniylar',
      lines: [
        'Asarning so‘nggi bobi Somoniylar va ularning nasabi haqida.',
        'Somoniylar davrida Buxoro ilm, savdo va hunarmandchilikning yirik markaziga aylandi.',
        'Ismoil Somoniy maqbarasi esa o‘sha davr me’morchiligining noyob namunasi bo‘lib qoldi.',
      ],
      stamps: ['IX – X asrlar', null, null],
      chips: ['Ismoil Somoniy', 'Ilm va savdo', 'Maqbara'],
      images: ['ismoil-maqbara-2', 'ismoil-eshik', 'somoniy-maqbara', 'ismoil-maqbara'],
    },
    {
      id: 'value',
      kind: 'story',
      kicker: 'Qadri',
      heading: 'Nima uchun muhim?',
      lines: [
        'Buxoro tarixi — Movarounnahrning ilk o‘rta asrlardagi hayoti, boshqaruvi va madaniyatini o‘rganishda asosiy manbalardan biri.',
        'Kitobning so‘zboshisida yozilishicha, uning bizgacha yetgan qo‘lyozma nusxalari bir-biridan ayrim farq qiladi.',
      ],
      chips: ['Asosiy manba', 'Qo‘lyozma nusxalar'],
      images: ['ark-devor', 'ark'],
    },
    {
      id: 'places',
      kind: 'story',
      kicker: 'Joylar va yodgorliklar',
      heading: 'Shahar atrofida',
      lines: [
        'Kitobda Jo‘yi Muliyon, Shamsobod va Kashkashon kabi joylarning bino etilishi va tavsifi berilgan.',
        '«Kampirak devor» deb atalgan devor, shahar devori va anhorlar haqida ham qimmatli ma’lumotlar bor.',
        'Buxoro va unga tobe joylardan olinadigan xiroj, ya’ni soliq ham alohida bobda bayon etilgan.',
      ],
      chips: ['Jo‘yi Muliyon', 'Shamsobod', 'Kampirak devor'],
      images: ['ark-yon', 'magoki-attori-2', 'chashma-ayub'],
    },
    {
      id: 'legacy',
      kind: 'story',
      kicker: 'Meros',
      heading: 'Asrlar osha',
      lines: [
        'Asar ko‘p tillarga tarjima qilingan va bugun ham tarixchilar uchun ishonchli manba sifatida o‘rganiladi.',
        'Uning sahifalarida Buxoroning ming yillik tarixi bugungi kunga qadar saqlanib qolgan.',
        'Ark, Ismoil Somoniy maqbarasi va qadimiy masjidlar kitobdagi ma’lumotlarni bugun ham eslatib turadi.',
      ],
      chips: ['Tarjimalar', 'Ming yillik tarix'],
      images: ['ismoil-maqbara', 'magoki-attori'],
    },
    {
      id: 'outro',
      kind: 'outro',
      kicker: 'Digital History Teacher',
      heading: 'Buxoro tarixini o‘qing',
      lines: [
        'Kitobning to‘liq matnini «Digital History Teacher» platformasining Manbalar bo‘limida o‘qishingiz va undan kerakli so‘zni qidirib topishingiz mumkin.',
      ],
      images: ['ark', 'ismoil-maqbara-2'],
    },
  ],
};
