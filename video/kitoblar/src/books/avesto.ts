import type { Book } from '../types';

/**
 * «Avesto. Qadimgi yozma yodgorliklar» video ssenariysi.
 * Faktlar: platformadagi kitob matni (A. Qayumov, M. Ishoqov, A. Otaxo‘jayev, Q. Sodiqov — «Avesto», «So‘g‘d falsafiy-axloqiy
 * yozma yodgorliklari», «Turkiy matnnavislik tarixi») va umum e’tirof etilgan tarixiy ma’lumotlar.
 */
export const AVESTO: Book = {
  slug: 'avesto',
  compId: 'Avesto',
  title: 'Avesto',
  author: 'Qadimgi yozma yodgorliklar',
  years: 'Zardushtiylikning muqaddas kitobi',
  images: [
    'faravahar-persepolis', 'faravahar-yazd', 'olov-ibodatxona', 'muqaddas-olov', 'persepolis-relyef', 
    'toprak-qala-xarobalar', 'ayoz-qala', 'afrosiyob-elchilar', 'afrosiyob-devoriy', 'sugd-devoriy', 'panjakent-bazm',
  ],
  wide: ['toprak-qala-xarobalar'],
  scenes: [
    {
      id: 'title',
      kind: 'title',
      kicker: 'Qadimgi yozma yodgorliklar',
      heading: 'Avesto',
      lines: [
        'Avesto.',
        'O‘rta Osiyo va Eron xalqlarining eng qadimiy muqaddas kitobi hamda yozma merosi.',
      ],
      images: ['faravahar-persepolis', 'toprak-qala-xarobalar'],
    },
    {
      id: 'what',
      kind: 'story',
      kicker: 'Muqaddas kitob',
      heading: 'Avesto nima?',
      lines: [
        'Avesto — zardushtiylik ta’limotining muqaddas kitobi. Uni ta’limot asoschisi Zardushtga nisbat beradilar.',
        'Kitobning eng qadimgi qismlari — gatlar — Zardushtning o‘zi yaratgan, deb hisoblanadi.',
      ],
      chips: ['Zardushtiylik', 'Gatlar'],
      images: ['faravahar-yazd', 'persepolis-relyef'],
    },
    {
      id: 'homeland',
      kind: 'story',
      kicker: 'Qadimiy o‘lka',
      heading: 'Avesto yurti',
      lines: [
        'Olimlar Avesto yaratilgan joylar sifatida Xorazm, Baqtriya va Marg‘iyona kabi qadimiy o‘lkalarni ko‘rsatadilar.',
        'Avesto qadimda ham, bugun ham O‘rta Osiyo va Eron xalqlarining umumiy ma’naviy mulki hisoblanadi.',
        '2001-yilda Avestoning ikki ming yetti yuz yilligi YUNESKO ishtirokida keng nishonlandi.',
        'Qadimiy Xorazmda zardushtiylik urf-odatlari bilan bog‘liq qal’alar va suyak saqlash uchun mo‘ljallangan idishlar topilgan.',
      ],
      stamps: [null, null, '2700 yil'],
      chips: ['Xorazm', 'Baqtriya', 'Marg‘iyona'],
      images: ['toprak-qala-xarobalar', 'ayoz-qala'],
    },
    {
      id: 'teaching',
      kind: 'story',
      kicker: 'Ta’limot',
      heading: 'Yaxshilik va yomonlik',
      lines: [
        'Zardushtiylik ta’limotiga ko‘ra, dunyo yaxshilik va yomonlik o‘rtasidagi kurashdan iborat. Yaxshilik homiysi — Axura Mazda.',
        'Inson uchun yo‘l — ezgu fikr, ezgu so‘z va ezgu amal.',
        'Olov esa poklik va nur ramzi sifatida alohida e’zozlanadi.',
        'Yer, suv va havoni toza saqlash ham muqaddas burch hisoblangan.',
      ],
      chips: ['Axura Mazda', 'Ezgu fikr, so‘z, amal', 'Muqaddas olov'],
      images: ['olov-ibodatxona', 'muqaddas-olov', 'faravahar-yazd'],
    },
    {
      id: 'parts',
      kind: 'story',
      kicker: 'Tuzilishi',
      heading: 'Avesto qismlari',
      lines: [
        'Avesto bir necha qismdan iborat: Yasna, Yasht, Videvdat, Visparad va Xurda Avesto.',
        'Yasna ibodat matnlarini o‘z ichiga oladi, gatlar ham shu qismga kiradi.',
        'Xurda Avesto, ya’ni «Kichik Avesto» esa kundalik duolar to‘plamidir.',
      ],
      chips: ['Yasna', 'Yasht', 'Videvdat', 'Xurda Avesto'],
      images: ['persepolis-relyef', 'faravahar-persepolis'],
    },
    {
      id: 'manuscript',
      kind: 'story',
      kicker: 'Yozma meros',
      heading: 'Og‘zaki matndan kitobgacha',
      lines: [
        'Avesto asrlar davomida og‘zaki saqlangan, keyinroq esa maxsus Avesto yozuvida yozib olingan.',
        'Bizgacha yetib kelgan eng qadimgi qo‘lyozma 1323-yilga oid.',
      ],
      stamps: [null, '1323'],
      chips: ['Og‘zaki an’ana', 'Avesto yozuvi'],
      images: ['olov-ibodatxona', 'persepolis-relyef'],
    },
    {
      id: 'sogd',
      kind: 'story',
      kicker: 'Kitobning ikkinchi qismi',
      heading: 'So‘g‘d yodgorliklari',
      lines: [
        'Kitobning keyingi qismi So‘g‘d yozma yodgorliklariga bag‘ishlangan.',
        'So‘g‘d tilida bitilgan falsafiy-axloqiy matnlar, jumladan buddaviy sutralar qadimgi Movarounnahr ma’naviy hayotidan guvohlik beradi.',
        'Afrosiyob va Panjakent devoriy suratlari esa o‘sha davr hayotini ko‘z oldimizga keltiradi.',
      ],
      chips: ['So‘g‘d tili', 'Buddaviy sutralar', 'Devoriy suratlar'],
      images: ['sugd-devoriy', 'afrosiyob-elchilar', 'panjakent-bazm', 'afrosiyob-devoriy'],
    },
    {
      id: 'turkic',
      kind: 'story',
      kicker: 'Matnshunoslik',
      heading: 'Qadimgi turkiy bitiklar',
      lines: [
        'Kitobda qadimgi turkiy bitiklarning matnshunosligi, ya’ni ularni o‘qish va tahlil qilish tamoyillari ham yoritilgan.',
        'Bu yodgorliklar turkiy xalqlarning yozma madaniyati qanchalik qadimiy ekanini ko‘rsatadi.',
      ],
      chips: ['Turkiy bitiklar', 'Matn tahlili'],
      images: ['afrosiyob-devoriy', 'sugd-devoriy'],
    },
    {
      id: 'beruni',
      kind: 'story',
      kicker: 'Olimlar nigohida',
      heading: 'Beruniy va Avesto',
      lines: [
        'Abu Rayhon Beruniy asarlarida Avesto va zardushtiylik haqida qimmatli ma’lumotlar uchraydi.',
        'Kitobning muallifi bu ma’lumotlarni alohida tadqiq etgan va Avestoning tarixiy manba sifatidagi ahamiyatini ko‘rsatib bergan.',
        'Navro‘z kabi qadimiy bayramlarimiz ham zardushtiylik davri an’analari bilan bog‘liq deb hisoblanadi.',
      ],
      chips: ['Beruniy', 'Tarixiy manba', 'Navro‘z'],
      images: ['olov-ibodatxona', 'muqaddas-olov', 'faravahar-persepolis'],
    },
    {
      id: 'legacy',
      kind: 'story',
      kicker: 'Meros',
      heading: 'Qadimdan bugunga',
      lines: [
        'Kitob Xurda Avesto va So‘g‘d yodgorliklarining eng sara namunalarini ilk bor o‘zbek tiliga o‘girib, ilmiy izohlar bilan taqdim etadi.',
        'U tariximizning qadimiy sarchashmalarini haqqoniy o‘rganishga xizmat qiladi.',
      ],
      chips: ['Ilk o‘zbekcha tarjima', 'Ilmiy izohlar'],
      images: ['faravahar-yazd', 'toprak-qala-xarobalar'],
    },
    {
      id: 'outro',
      kind: 'outro',
      kicker: 'Digital History Teacher',
      heading: 'Avestoni o‘qing',
      lines: [
        'Kitobning to‘liq matnini «Digital History Teacher» platformasining Manbalar bo‘limida o‘qishingiz va undan kerakli so‘zni qidirib topishingiz mumkin.',
      ],
      images: ['faravahar-persepolis', 'toprak-qala-xarobalar'],
    },
  ],
};
