/**
 * Manbalar kutubxonasidagi 13 ta o'quv mavzusi.
 * Asos: «O‘zbekiston tarixi» darsligi — I kitob (12–16-mavzular) va II kitob (1–8-mavzular).
 * Ma'ruza matni `lectures/<slug>.md` faylida (Markdown). Taqdimot va video admin paneldan yuklanadi.
 */
const BOOK_1 = 'O‘zbekiston tarixi, I kitob';
const BOOK_2 = 'O‘zbekiston tarixi, II kitob (B.J. Eshov, A.A. Odilov)';

export interface SeedLecture {
  slug: string;
  title: string;
  summary: string;
  bookLabel: string;
  period: string | null;
  dateLabel: string;
  yearFrom: number;
  yearTo: number;
  /** Afisha rasmi — frontend/public/covers ichida (manbasi: Wikimedia Commons, erkin litsenziya) */
  coverUrl: string;
  /** Rasm sahifasi — muallif va litsenziya manbasi */
  coverPage: string;
  /** Rasm tavsifi, muallifi va litsenziyasi */
  coverCredit: string;
}

export const LECTURES: SeedLecture[] = [
  {
    slug: 'ix-xii-asrlar-tarixi',
    title: 'IX–XII asrlarda Movarounnahr va Xuroson davlatlari',
    summary: 'Arab xalifaligining parchalanishi, Tohiriylar, Somoniylar, Qoraxoniylar davlatlari, G‘aznaviylar va Saljuqiylar bilan munosabatlar, Xorazmshohlar-Anushteginiylar davlati.',
    bookLabel: `${BOOK_1} · 12-mavzu`,
    period: 'ix-xiii-asrlar',
    dateLabel: 'IX–XIII asr boshi',
    yearFrom: 821,
    yearTo: 1220,
    coverUrl: '/covers/ix-xii-asrlar-tarixi.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Samanid_Mausoleum,_Bukhara.jpg',
    coverCredit: 'Somoniylar maqbarasi, Buxoro. Foto: Bgag, CC0',
  },
  {
    slug: 'sharq-uygonish-davri',
    title: 'IX–XII asrlarda Uyg‘onish davri. Ajdodlarimizning jahon sivilizatsiyasiga qo‘shgan hissasi',
    summary: 'Madaniy yuksalish omillari, buyuk qomusiy allomalar, Xorazm Ma’mun akademiyasi, islom ilmlari va tasavvuf, me’morchilik va san’at.',
    bookLabel: `${BOOK_1} · 13-mavzu`,
    period: 'ix-xiii-asrlar',
    dateLabel: 'IX–XII asrlar',
    yearFrom: 800,
    yearTo: 1200,
    coverUrl: '/covers/sharq-uygonish-davri.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Ibn_Sina,_Bukhara.jpg',
    coverCredit: 'Ibn Sino haykali, Buxoro. Foto: Davide Mauro, CC BY-SA 4.0',
  },
  {
    slug: 'mogullar-bosqini',
    title: 'O‘rta Osiyoga mo‘g‘ullar bosqini va unga qarshi kurash',
    summary: 'Mo‘g‘ul davlatining tashkil topishi, Chingizxon va Muhammad Xorazmshoh munosabatlari, bosqin, Jaloliddin Manguberdi, Chig‘atoy ulusi davri.',
    bookLabel: `${BOOK_1} · 14-mavzu`,
    period: 'mogullar-davri',
    dateLabel: 'XIII – XIV asr birinchi yarmi',
    yearFrom: 1206,
    yearTo: 1360,
    coverUrl: '/covers/mogullar-bosqini.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Manguberdi.jpg',
    coverCredit: 'Jaloliddin Manguberdi haykali, Urganch. Foto: DierkA, CC BY-SA 3.0 DE',
  },
  {
    slug: 'buyuk-ipak-yoli',
    title: 'Buyuk ipak yo‘li — muloqot va hamkorlik yo‘li',
    summary: 'Eng qadimgi aloqa yo‘llari, Buyuk ipak yo‘lining shakllanishi va taraqqiyot bosqichlari, o‘rta asrlar savdo yo‘llari, Ipak yo‘li va hozirgi zamon.',
    bookLabel: `${BOOK_1} · 15-mavzu`,
    period: null,
    dateLabel: 'Mil. avv. II asr – XVI asr',
    yearFrom: -200,
    yearTo: 1600,
    coverUrl: '/covers/buyuk-ipak-yoli.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Caravane_sur_la_Route_de_la_soie_-_Atlas_catalan.jpg',
    coverCredit: 'Ipak yo‘lidagi karvon. «Katalon atlasi», 1375. Abraham Cresques, jamoat mulki',
  },
  {
    slug: 'etnogenez-va-etnik-tarix',
    title: 'Etnogenez va etnik tarix masalalari',
    summary: 'Etnogenez va etnik jarayonlarning xususiyatlari, qadimgi migratsiyalar va etnomadaniy jarayonlar, o‘zbek xalqining shakllanishi masalasi.',
    bookLabel: `${BOOK_1} · 16-mavzu`,
    period: null,
    dateLabel: 'Qadimgi davrdan XVI asrgacha',
    yearFrom: -1000,
    yearTo: 1600,
    coverUrl: '/covers/etnogenez-va-etnik-tarix.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Ambassadors_painting_Afrasiyab_01.jpg',
    coverCredit: 'Afrosiyob devoriy suratlari («Elchilar zali») nusxasi. Foto: Nassima Chahboun, CC BY-SA 4.0',
  },
  {
    slug: 'amir-temur-davlati',
    title: 'Amir Temur hukmronligi davrida o‘zbek davlatchiligi',
    summary: 'Manbalar, markazlashgan davlatning tashkil topishi, davlat boshqaruvi, harbiy soha, diplomatiya, Amir Temur ma’naviyati va madaniy hayot.',
    bookLabel: `${BOOK_2} · 1-mavzu`,
    period: 'temuriylar-davri',
    dateLabel: '1370–1405',
    yearFrom: 1370,
    yearTo: 1405,
    coverUrl: '/covers/amir-temur-davlati.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Gur-e_Amir_01.jpg',
    coverCredit: 'Go‘ri Amir maqbarasi, Samarqand. Foto: Bgag, CC0',
  },
  {
    slug: 'temuriylar-davri',
    title: 'Temuriylar hukmronligi davri. Ijtimoiy-siyosiy, iqtisodiy va madaniy hayot',
    summary: 'Mirzo Ulug‘bek, Sulton Husayn Boyqaro, Alisher Navoiy, Zahiriddin Muhammad Bobur; ijtimoiy-iqtisodiy hayot, ilm-fan va madaniyat.',
    bookLabel: `${BOOK_2} · 2-mavzu`,
    period: 'temuriylar-davri',
    dateLabel: '1405–1507',
    yearFrom: 1405,
    yearTo: 1507,
    coverUrl: '/covers/temuriylar-davri.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Ulugh_Beg_Madrasa,_Samarkand.jpg',
    coverCredit: 'Ulug‘bek madrasasi, Samarqand. Foto: Bgag, CC0',
  },
  {
    slug: 'shayboniylar-davlati',
    title: 'Shayboniylar sulolasi hukmronligi davrida o‘zbek davlatchiligi',
    summary: 'Shayboniylar davlatining tashkil topishi va siyosiy voqealar, Buxoro xonligida davlat boshqaruvi, harbiy ish, yer egaligi, iqtisodiy va madaniy hayot.',
    bookLabel: `${BOOK_2} · 3-mavzu`,
    period: 'buxoro-xonligi',
    dateLabel: '1500–1601',
    yearFrom: 1500,
    yearTo: 1601,
    coverUrl: '/covers/shayboniylar-davlati.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Po-i-Kalyan_in_Bukhara.jpg',
    coverCredit: 'Poyi Kalon majmuasi, Buxoro. Foto: Maksimsokolov, CC BY-SA 4.0',
  },
  {
    slug: 'ashtarxoniylar-davlati',
    title: 'XVII–XVIII asrlar birinchi yarmida Ashtarxoniylar davlati',
    summary: 'Ashtarxoniylar davlatining siyosiy tarixi, davlat tizimi, qishloq xo‘jaligi, shaharlar, hunarmandchilik va savdo, ilm-fan va me’morchilik.',
    bookLabel: `${BOOK_2} · 4-mavzu`,
    period: 'buxoro-xonligi',
    dateLabel: '1601–1756',
    yearFrom: 1601,
    yearTo: 1756,
    coverUrl: '/covers/ashtarxoniylar-davlati.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Tilya-Kori_Madrasa_01.jpg',
    coverCredit: 'Tillakori madrasasi, Samarqand. Foto: Bernard Gagnon, CC0',
  },
  {
    slug: 'buxoro-amirligi',
    title: 'XVIII asr ikkinchi yarmi – XIX asr birinchi yarmida Buxoro amirligi',
    summary: 'Buxoro amirligining siyosiy tarixi, hududi va aholisi, davlat boshqaruvi, mansab va unvonlar, yer egaligi, xo‘jalik va madaniy hayot.',
    bookLabel: `${BOOK_2} · 5-mavzu`,
    period: 'xonliklar-va-amirlik',
    dateLabel: '1756–1860-yillar',
    yearFrom: 1756,
    yearTo: 1860,
    coverUrl: '/covers/buxoro-amirligi.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Ark_of_Bukhara_(%D0%A6%D0%B8%D1%82%D0%B0%D0%B4%D0%B5%D0%BB%D1%8C_%D0%90%D1%80%D0%BA._Buxoro_arki).jpg',
    coverCredit: 'Buxoro Arki. Foto: Petar Milošević, CC BY-SA 4.0',
  },
  {
    slug: 'xiva-xonligi',
    title: 'XVI – XIX asr birinchi yarmida Xiva xonligi',
    summary: 'Xiva xonligining tashkil topishi va siyosiy tarixi, qo‘ng‘irotlar sulolasi, ma’muriy tuzilish, unvon va mansablar, xo‘jalik, shaharlar va madaniy hayot.',
    bookLabel: `${BOOK_2} · 6-mavzu`,
    period: 'xonliklar-va-amirlik',
    dateLabel: '1511–1860-yillar',
    yearFrom: 1511,
    yearTo: 1860,
    coverUrl: '/covers/xiva-xonligi.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Kalta_Minor_01.jpg',
    coverCredit: 'Kalta minor, Xiva. Foto: Bgag, CC0',
  },
  {
    slug: 'qoqon-xonligi',
    title: 'Qo‘qon xonligi. Siyosiy, ijtimoiy-iqtisodiy va madaniy hayot',
    summary: 'Qo‘qon xonligining siyosiy tarixi, ma’muriy-hududiy tuzilishi, davlat boshqaruvi, yer egaligi va soliqlar, madaniy hayot, XVIII–XIX asrlarda Toshkent.',
    bookLabel: `${BOOK_2} · 7-mavzu`,
    period: 'xonliklar-va-amirlik',
    dateLabel: '1709–1860-yillar',
    yearFrom: 1709,
    yearTo: 1860,
    coverUrl: '/covers/qoqon-xonligi.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Palace_of_Khudayar_Khan.jpg',
    coverCredit: 'Xudoyorxon saroyi, Qo‘qon. Foto: Bgag, CC0',
  },
  {
    slug: 'qoraqalpoqlar-tarixi',
    title: 'So‘nggi o‘rta asrlarda qoraqalpoqlar',
    summary: 'Qoraqalpoqlarning so‘nggi o‘rta asrlardagi siyosiy tarixi, ijtimoiy-iqtisodiy munosabatlari va madaniy hayoti.',
    bookLabel: `${BOOK_2} · 8-mavzu`,
    period: 'xonliklar-va-amirlik',
    dateLabel: 'XVI – XIX asr birinchi yarmi',
    yearFrom: 1500,
    yearTo: 1860,
    coverUrl: '/covers/qoraqalpoqlar-tarixi.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Ancient_Complex_Mizdahkan_in_Karakalpakstan.jpg',
    coverCredit: 'Mizdahkon majmuasi, Qoraqalpog‘iston. Foto: damda.uz, CC BY-SA 4.0',
  },
];
