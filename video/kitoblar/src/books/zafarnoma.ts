import type { Book } from '../types';

/**
 * «Zafarnoma» (Sharafiddin Ali Yazdiy) video ssenariysi.
 * Faktlar: platformadagi kitob matni (so‘zboshisi — Muhammad Ali Buxoriy tarjimasi haqida) va umum e’tirof etilgan tarixiy ma’lumotlar.
 */
export const ZAFARNOMA: Book = {
  slug: 'zafarnoma',
  compId: 'Zafarnoma',
  title: 'Zafarnoma',
  author: 'Sharafiddin Ali Yazdiy',
  years: 'G‘alaba kitobi · 1425',
  images: [
    'temur-portret', 'balx-taxt', 'dehli', 'halab', 'anqara', 'shohrux', 'qal-a-qamali', 'gur-amir', 'oqsaroy',
    'haykal', 'shohizinda',
  ],
  scenes: [
    {
      id: 'title',
      kind: 'title',
      kicker: 'Tarixiy asar',
      heading: 'Zafarnoma',
      lines: [
        'Zafarnoma.',
        'Sharafiddin Ali Yazdiyning Amir Temur hayoti va yurishlari haqidagi mashhur asari. Nomi «G‘alaba kitobi» degan ma’noni anglatadi.',
      ],
      images: ['temur-portret', 'balx-taxt'],
    },
    {
      id: 'author',
      kind: 'story',
      kicker: 'Muallif va zamon',
      heading: 'Yazdiy',
      lines: [
        'Sharafiddin Ali Yazdiy Temuriylar davrining mashhur tarixchisi edi.',
        'U Zafarnomani 1425-yilda, ya’ni Amir Temur vafotidan taxminan yigirma yil o‘tgach yozib tugatdi.',
        'Muallif o‘zidan oldingi tarixiy asarlar va guvohlarning so‘ziga tayangan.',
        'Asar Shohrux mirzo davrida, Temuriylar saltanati barqaror bo‘lgan yillarda yaratildi.',
      ],
      stamps: [null, '1425', null],
      chips: ['Temuriylar tarixchisi', 'Yozilgan yili'],
      images: ['qal-a-qamali', 'shohrux'],
    },
    {
      id: 'journey',
      kind: 'journey',
      kicker: 'Asar mazmuni',
      heading: 'Temur yo‘llari',
      lines: [
        'Amir Temur 1336-yilda Keshda, hozirgi Shahrisabzda tug‘ildi.',
        '1370-yilda Balxda taxtga o‘tirib, Samarqandni poytaxt qildi.',
        '1398-yilda Hindistonga yurish qilib, Dehlini egalladi.',
        '1402-yilda Anqara yonida Usmoniylar sultoni Boyazid qo‘shinini mag‘lub etdi.',
        '1405-yilda esa Xitoyga yurish arafasida Otrorda vafot etdi.',
      ],
      images: ['balx-taxt'],
      route: [
        { name: 'Kesh', lat: 39.05, lon: 66.83, line: 0, note: '1336' },
        { name: 'Balx', lat: 36.76, lon: 66.9, line: 1, note: '1370' },
        { name: 'Dehli', lat: 28.61, lon: 77.21, line: 2, note: '1398' },
        { name: 'Anqara', lat: 39.93, lon: 32.86, line: 3, note: '1402' },
        { name: 'Otror', lat: 42.85, lon: 68.3, line: 4, note: '1405' },
      ],
    },
    {
      id: 'campaigns',
      kind: 'story',
      kicker: 'Yurishlar',
      heading: 'G‘alabalar bayoni',
      lines: [
        'Zafarnomada Amir Temurning harbiy yurishlari, jang tadbirlari va g‘alabalari batafsil bayon etilgan.',
        'Asar Temur davlatining shakllanishini va uning Sharq hamda G‘arbdagi harakatlarini ketma-ket yoritadi.',
      ],
      chips: ['Harbiy yurishlar', 'Davlat qurilishi'],
      images: ['halab', 'dehli', 'anqara'],
    },
    {
      id: 'miniatures',
      kind: 'story',
      kicker: 'Rasmli nusxa',
      heading: 'Ibrohim Sulton Zafarnomasi',
      lines: [
        '1436-yilda Temurning nabirasi Ibrohim Sulton uchun Zafarnomaning rasmli nusxasi yaratildi.',
        'Uning miniatyuralari Temuriylar davri tasviriy san’atining nodir namunalaridir.',
      ],
      stamps: ['1436', null],
      chips: ['Miniatyuralar', 'Temuriylar san’ati'],
      images: ['temur-portret', 'balx-taxt', 'halab', 'shohrux'],
    },
    {
      id: 'style',
      kind: 'story',
      kicker: 'Asar uslubi',
      heading: 'Voqealar bayoni',
      lines: [
        'Zafarnomada voqealar ketma-ket, yilma-yil bayon etilgan, sana va joy nomlari aniq ko‘rsatilgan.',
        'Nasriy bayon orasiga she’riy parchalar ham kiritilib, asarga ohangdorlik berilgan.',
        'Amir Temurning dargohi, qurultoylar, elchilar bilan uchrashuvlar va saroy marosimlari ham tasvirlangan.',
      ],
      chips: ['Yilma-yil bayon', 'She’riy parchalar', 'Dargoh hayoti'],
      images: ['balx-taxt', 'shohrux', 'qal-a-qamali'],
    },
    {
      id: 'translation',
      kind: 'story',
      kicker: 'O‘zbekcha tarjima',
      heading: 'Muhammad Ali tarjimasi',
      lines: [
        'XVI asrda Muhammad Ali Buxoriy Zafarnomani eski o‘zbek tiliga o‘girdi.',
        'Kitobning so‘zboshisida aytilishicha, bu tarjima yagona nodir nusxada, Istanbuldagi Nuri Usmoniya kutubxonasida saqlanadi.',
        'Platformadagi matn aynan shu o‘zbekcha tarjimaning nashridir.',
      ],
      chips: ['Eski o‘zbek tili', 'Nodir nusxa', 'Platformadagi matn'],
      images: ['qal-a-qamali', 'dehli', 'temur-portret'],
    },
    {
      id: 'architecture',
      kind: 'story',
      kicker: 'Bunyodkorlik',
      heading: 'Temur davri me’morchiligi',
      lines: [
        'Temur va temuriylar bunyod etgan yodgorliklar bugun ham o‘sha davrdan guvohlik beradi.',
        'Shahrisabzdagi Oqsaroy, Samarqanddagi Go‘ri Amir va Shohi Zinda majmuasi shular jumlasidandir.',
      ],
      chips: ['Oqsaroy', 'Go‘ri Amir', 'Shohi Zinda'],
      images: ['oqsaroy', 'gur-amir', 'shohizinda'],
    },
    {
      id: 'legacy',
      kind: 'story',
      kicker: 'Meros',
      heading: 'Xalq xotirasida',
      lines: [
        'Zafarnoma Amir Temur davrini o‘rganishda eng muhim manbalardan biri bo‘lib qolmoqda.',
        'Amir Temur nomi bugun ham xalqimiz xotirasida ulug‘ davlat arbobi sifatida yashaydi.',
      ],
      chips: ['Asosiy manba', 'Tarixiy xotira'],
      images: ['haykal', 'gur-amir'],
    },
    {
      id: 'outro',
      kind: 'outro',
      kicker: 'Digital History Teacher',
      heading: 'Zafarnomani o‘qing',
      lines: [
        'Zafarnomaning to‘liq matnini «Digital History Teacher» platformasining Manbalar bo‘limida o‘qishingiz va undan kerakli so‘zni qidirib topishingiz mumkin.',
      ],
      images: ['temur-portret', 'gur-amir'],
    },
  ],
};
