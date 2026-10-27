import type { SeedSource } from './types';

/**
 * DEMO manbalar. Har bir yozuvda isDemo=true — matnlar qisqa ta'limiy tavsif bo'lib,
 * tadqiqotchi/admin tomonidan birlamchi nashrlar bilan tekshirilishi kerak.
 * Manba matnidan iqtiboslar KELTIRILMAGAN (o'ylab topilgan iqtibos bo'lmasligi uchun).
 */
export const SOURCES_A: SeedSource[] = [
  {
    slug: 'zafarnoma-sharafuddin-ali-yazdiy',
    title: '«Zafarnoma» — Sharafuddin Ali Yazdiy',
    summary: 'Amir Temur faoliyatiga bag‘ishlangan, Temuriylar saroyida yozilgan rasmiy tarixiy asar (fors tilida).',
    description:
      'Asar Temuriy shahzoda Ibrohim Sulton topshirig‘i bilan yozilgan va XV asrning 20-yillarida yakunlangan. Saroy tarixchiligi namunasi sifatida u Amir Temur yurishlari va davlat boshqaruvi haqida batafsil ma’lumot beradi.',
    type: 'WRITTEN',
    format: 'Qo‘lyozma / nashr',
    period: 'temuriylar-davri',
    topics: ['amir-temur-davlati', 'manbashunoslik'],
    dateLabel: 'XV asrning 20-yillari (taxm. 1424–1425)',
    yearFrom: 1424,
    yearTo: 1425,
    author: 'Sharafuddin Ali Yazdiy',
    origin: 'Temuriylar saroyi (Sheroz), Ibrohim Sulton buyurtmasi',
    repository: 'Qo‘lyozma nusxalari turli kutubxonalarda saqlanadi (aniq nusxani tadqiqotchi belgilaydi).',
    originalUrl: null,
    license: 'Asl matn jamoat mulki; tarjima va nashrlar mualliflik huquqiga ega bo‘lishi mumkin',
    reliabilityNotes:
      'Saroy buyurtmasi bilan yozilgani sababli hukmdorni ulug‘lash yo‘nalishi kuchli. Xronologiya uchun muhim, ammo baholovchi fikrlar tanqidiy o‘qilishi kerak.',
    limitations: 'Muallif nuqtayi nazari sulola manfaatiga bog‘liq; raqiblar haqidagi ma’lumotlar bir tomonlama bo‘lishi mumkin.',
    teachingUse: 'Rasmiy saroy tarixini muqobil manbalar (Ibn Arabshoh, Klavixo) bilan taqqoslash mashg‘ulotlari uchun qulay.',
    methodicalRecommendations:
      'O‘quvchilarga muallif va buyurtmachini aniqlashni, so‘ngra matndagi baholovchi so‘zlarni ajratishni topshiring. Moslashtirilgan qisqa parchadan foydalaning.',
    practicalTasks: "Asar kim tomonidan va kimning buyurtmasi bilan yozilganini aniqlang. Bu muallif nuqtayi nazariga qanday ta’sir qilgan?\nMoslashtirilgan parchadagi baholovchi so‘zlarni (maqtov, tanqid) ajratib, ularni faktlardan farqlang.\n«Zafarnoma» va Ibn Arabshoh asaridagi Amir Temur obrazini taqqoslovchi jadval tuzing.\nUshbu manba asosida 7-sinf o‘quvchilari uchun «Rasmiy tarix va muqobil nuqtayi nazar» mavzusida muammoli savol tuzing.",
    variants: [
      {
        kind: 'SCHOLARLY_COMMENTARY',
        title: 'Manbashunoslik sharhi (qisqa)',
        content:
          'Zafarnoma Temuriylar davri tarixnavisligining asosiy asarlaridan biri. Uning ma’lumotlarini boshqa, jumladan Temuriylarga muxolif manbalar bilan tekshirish tavsiya etiladi.',
        citation: 'Encyclopaedia Britannica: Timur — https://www.britannica.com/biography/Timur',
      },
      {
        kind: 'EDUCATIONAL_ADAPTATION',
        title: 'O‘quvchilar uchun moslashtirilgan tavsif',
        content:
          '«Zafarnoma» — «G‘alabalar kitobi». Uni Amir Temurning nevarasi buyurtmasi bilan saroy tarixchisi yozgan, shuning uchun Amir Temur asosan ijobiy ko‘rsatiladi. Savol: nega muallif shunday yozgan bo‘lishi mumkin?',
      },
    ],
  },
];
