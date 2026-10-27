import type { SeedSource } from './types';

/**
 * DEMO manbalar (2-to'plam): Buxoro amirligi, jadidchilik, audio-video va arxeologik manbalar.
 * Raqamli nusxalar Wikimedia Commons'dan — litsenziya har bir yozuvda ko'rsatilgan (sahifa havolasi originalUrl'da).
 * Manba matnidan iqtiboslar KELTIRILMAGAN; tavsiflar ta'limiy maqsadda, tadqiqotchi tomonidan tekshirilishi kerak.
 */
const COMMONS = 'https://commons.wikimedia.org/wiki/File:';
const UPLOAD = 'https://upload.wikimedia.org/wikipedia/commons';

export const SOURCES_E: SeedSource[] = [
  {
    slug: 'olimxon-prokudin-gorskiy-1911',
    title: 'Buxoro amiri Olimxon — S. M. Prokudin-Gorskiy fotosurati (1911)',
    summary: 'Buxoroning so‘nggi amiri Sayyid Olimxonning ilk rangli fotosuratlardan biri bo‘lgan portreti.',
    description:
      'Fotosurat rus fotografi S. M. Prokudin-Gorskiy tomonidan 1911 yilda uch rangli (qizil, yashil, ko‘k filtrli) usulda olingan. Asl shisha negativlar AQSh Kongressi kutubxonasida saqlanadi; raqamli rangli nusxa keyinchalik negativlar asosida tiklangan.',
    type: 'VISUAL',
    format: 'Rangli fotosurat (uch rangli negativdan tiklangan)',
    period: 'xonliklar-va-amirlik',
    topics: ['buxoro-amirligi'],
    dateLabel: '1911 yil',
    yearFrom: 1911,
    yearTo: 1911,
    author: 'Sergey Mixaylovich Prokudin-Gorskiy',
    origin: 'Rossiya imperiyasi bo‘ylab fotohujjatlashtirish loyihasi doirasida Buxoroda olingan',
    repository: 'AQSh Kongressi kutubxonasi (Prokudin-Gorskiy kolleksiyasi); raqamli nusxa — Wikimedia Commons',
    originalUrl: `${COMMONS}Alim_Khan_(1880%E2%80%931944),_Emir_of_Bukhara,_photographed_by_S.M._Prokudin-Gorskiy_in_1911.jpg`,
    mediaUrl: `${UPLOAD}/thumb/7/7d/Alim_Khan_%281880%E2%80%931944%29%2C_Emir_of_Bukhara%2C_photographed_by_S.M._Prokudin-Gorskiy_in_1911.jpg/1280px-Alim_Khan_%281880%E2%80%931944%29%2C_Emir_of_Bukhara%2C_photographed_by_S.M._Prokudin-Gorskiy_in_1911.jpg`,
    license: 'Jamoat mulki (Public domain)',
    reliabilityNotes: 'Muallifi, sanasi va saqlanish joyi aniq hujjatlashtirilgan. Fotosurat sahnalashtirilgan rasmiy portret.',
    limitations:
      'Ranglar negativlardan raqamli tiklangan — asl ko‘rinishdan farq qilishi mumkin. Portret amir o‘zini qanday ko‘rsatmoqchi bo‘lganini aks ettiradi, kundalik hayotni emas.',
    teachingUse: '«Buxoro amirligi» mavzusida hokimiyat ramzlari (kiyim, mukofotlar, poza) orqali vizual manbani tahlil qilish.',
    methodicalRecommendations:
      'O‘quvchilar avval faqat ko‘rganlarini sanaydi (kiyim, nishonlar, fon), so‘ng ular nimani anglatishini taxmin qiladi. Fotograf kim va nima uchun suratga olganini muhokama qiling.',
    practicalTasks: [
      'Fotosuratdagi hokimiyat ramzlarini (kiyim, nishonlar, qurol, poza) ro‘yxat qiling va har birining ma’nosini izohlang.',
      'Fotograf kim bo‘lgani va 1911 yilda bu suratni nima maqsadda olgani haqida 3–4 jumlali farazingizni yozing.',
      'Ushbu portretni Sadriddin Ayniy esdaliklaridagi amirlik tasviri bilan taqqoslang: qaysi jihatlar mos keladi, qaysilari zid?',
      '8-sinf o‘quvchilari uchun shu fotosurat asosida 3 ta muammoli savol tuzing.',
    ].join('\n'),
    variants: [
      {
        kind: 'EDUCATIONAL_ADAPTATION',
        title: 'O‘quvchilar uchun moslashtirilgan tavsif',
        content:
          'Bu — Buxoroning so‘nggi amiri Olimxonning 110 yildan ko‘proq oldin olingan rangli surati. O‘sha davrda rangli fotosurat juda kam uchragan. Savol: amir nima uchun aynan shunday kiyimda va holatda suratga tushgan bo‘lishi mumkin?',
      },
    ],
  },
  {
    slug: 'ahmad-donish-navodir-ul-vaqoe',
    title: '«Navodir ul-vaqoe» — Ahmad Donish',
    summary: 'Buxorolik mutafakkir Ahmad Donishning amirlik boshqaruvini tanqid qilgan va islohotlar taklif etgan asari (fors tilida).',
    description:
      'Ahmad Donish (1827–1897) Buxoro amirligi elchiligi tarkibida bir necha bor Peterburgda bo‘lgan. «Navodir ul-vaqoe» («Nodir voqealar») asarida u amirlikdagi boshqaruv, ta’lim va ijtimoiy ahvolni tanqid qilib, davlatni isloh qilish g‘oyalarini ilgari surgan. Asar keyingi jadid ma’rifatparvarlariga ta’sir ko‘rsatgan deb hisoblanadi.',
    type: 'WRITTEN',
    format: 'Qo‘lyozma asar',
    period: 'xonliklar-va-amirlik',
    topics: ['buxoro-amirligi', 'manbashunoslik'],
    dateLabel: 'XIX asrning 2-yarmi',
    yearFrom: 1870,
    yearTo: 1897,
    author: 'Ahmad Donish (Ahmad Mahdum)',
    origin: 'Buxoro amirligi',
    repository: 'Qo‘lyozma nusxalari Toshkent va Dushanbe qo‘lyozmalar fondlarida saqlanadi (aniq nusxani tadqiqotchi belgilaydi).',
    originalUrl: null,
    license: 'Asl matn jamoat mulki; tarjima va nashrlar mualliflik huquqiga ega bo‘lishi mumkin',
    reliabilityNotes:
      'Zamondosh va amirlik saroyini ichkaridan bilgan muallifning guvohligi. Ayni paytda islohotchi sifatida u ahvolni ataylab keskin tanqidiy ko‘rsatgan.',
    limitations: 'Muallifning islohotchilik maqsadi baholarga ta’sir qilgan; boshqa nuqtayi nazarlar (saroy, ruhoniylar) aks etmagan.',
    teachingUse: '«Buxoro amirligidagi ijtimoiy-siyosiy ahvol» va «Jadidchilikning g‘oyaviy ildizlari» mavzulari uchun.',
    methodicalRecommendations:
      'Moslashtirilgan qisqa parcha bilan ishlang. O‘quvchilarga muallif nimani tanqid qilayotgani va qanday yechim taklif qilayotganini jadvalga ajratishni topshiring.',
    practicalTasks: [
      'Muallif amirlikdagi qaysi muammolarni tanqid qiladi va qanday islohotlarni taklif etadi? Ikki ustunli jadval tuzing.',
      'Ahmad Donishning Peterburg safarlari uning qarashlariga qanday ta’sir qilgan bo‘lishi mumkin? Dalil bilan asoslang.',
      'Donish g‘oyalarini Behbudiy «Oyina» jurnalidagi ta’lim g‘oyalari bilan taqqoslang: davomiylik bormi?',
      'Manbaning ishonchliligini baholang: muallifning maqsadi uning baholariga qanday ta’sir qilgan?',
    ].join('\n'),
    variants: [
      {
        kind: 'SCHOLARLY_COMMENTARY',
        title: 'Manbashunoslik sharhi (qisqa)',
        content:
          'Ahmad Donish O‘rta Osiyo ma’rifatparvarligining yirik vakillaridan biri hisoblanadi. Uning asari amirlik tarixining ichki tanqidiy manbasi sifatida qadrlanadi, ammo ma’lumotlarini rasmiy saroy tarixlari va xorijiy sayyohlar yozuvlari bilan solishtirish tavsiya etiladi.',
        citation: 'Wikipedia: Ahmad Donish — https://en.wikipedia.org/wiki/Ahmad_Donish',
      },
    ],
  },
  {
    slug: 'sadriddin-ayniy-esdaliklar',
    title: '«Esdaliklar» — Sadriddin Ayniy',
    summary: 'Ayniyning XIX asr oxiri – XX asr boshidagi Buxoro madrasalari va amirlik hayoti haqidagi xotiralari.',
    description:
      'Sadriddin Ayniy (1878–1954) yoshligida Buxoro madrasalarida tahsil olgan va jadidchilik harakatida qatnashgan. Keksalik chog‘ida yozgan esdaliklarida u madrasa ta’limi, shahar turmushi va amirlikdagi ijtimoiy munosabatlarni tasvirlaydi.',
    type: 'WRITTEN',
    format: 'Memuar (xotiralar)',
    period: 'xonliklar-va-amirlik',
    topics: ['buxoro-amirligi', 'jadidlar-marifatparvarligi'],
    dateLabel: 'XX asr o‘rtalarida yozilgan; XIX asr oxiri – XX asr boshi voqealari',
    yearFrom: 1890,
    yearTo: 1920,
    author: 'Sadriddin Ayniy',
    origin: 'Sovet Tojikistoni; muallifning shaxsiy xotiralari asosida',
    repository: 'Turli yillardagi nashrlar (aniq nashrni tadqiqotchi belgilaydi)',
    originalUrl: null,
    license: 'Nashrlar mualliflik huquqiga ega bo‘lishi mumkin — foydalanishdan oldin aniqlang',
    reliabilityNotes: 'Voqealarning bevosita ishtirokchisi yozgan. Kundalik turmush tafsilotlari uchun qimmatli.',
    limitations:
      'Voqealardan bir necha o‘n yil keyin, sovet mafkurasi sharoitida yozilgan: amirlik ataylab salbiy ko‘rsatilgan bo‘lishi mumkin. Xotira xatolari ehtimoli bor.',
    teachingUse: 'Retrospektiv manba (memuar) ni zamondosh manba bilan taqqoslash mashg‘uloti uchun qulay.',
    methodicalRecommendations:
      'O‘quvchilarga memuar qachon va qanday sharoitda yozilganini aniqlashni topshiring; voqea sodir bo‘lgan vaqt bilan yozilgan vaqt o‘rtasidagi farqni muhokama qiling.',
    practicalTasks: [
      'Esdaliklar voqealardan necha yil keyin yozilganini hisoblang. Bu farq manbaning ishonchliligiga qanday ta’sir qiladi?',
      'Madrasa ta’limi haqidagi tafsilotlarni ajratib, ularni bugungi maktab bilan taqqoslovchi jadval tuzing.',
      'Ayniy va Ahmad Donish amirlikni qanday ko‘rsatadi? O‘xshash va farqli jihatlarni dalillar bilan aniqlang.',
      'Sovet davri mafkurasi matnga qanday ta’sir qilgan bo‘lishi mumkinligini 2 ta misol bilan izohlang.',
    ].join('\n'),
    variants: [
      {
        kind: 'EDUCATIONAL_ADAPTATION',
        title: 'O‘quvchilar uchun moslashtirilgan tavsif',
        content:
          'Sadriddin Ayniy bolaligi va yoshligini Buxoroda o‘tkazgan, madrasada o‘qigan. Keyinchalik, keksayganda, o‘sha yillarni eslab kitob yozgan. Savol: odam 50 yil oldingi voqealarni qanchalik aniq eslay oladi va nimani boshqacha ko‘rsatishi mumkin?',
      },
    ],
  },
  {
    slug: 'nasriddin-buxoroda-film-1943',
    title: '«Nasriddin Buxoroda» badiiy filmi (1943)',
    summary: 'Toshkentda suratga olingan sovet badiiy filmi: amirlik davri Buxorosining XX asr o‘rtasidagi badiiy talqini.',
    description:
      'Film rejissyor Yakov Protazanov tomonidan Ikkinchi jahon urushi yillarida Toshkent kinostudiyasida suratga olingan. Unda xalq qahramoni Nasriddin Afandi amir va amaldorlarni masxara qiladi. Film tarixiy hujjat emas, balki sovet davrining o‘tmishga qarashini ko‘rsatuvchi manba sifatida o‘rganiladi.',
    type: 'VIDEO',
    format: 'Badiiy film (oq-qora, ovozli)',
    period: 'xonliklar-va-amirlik',
    topics: ['buxoro-amirligi', 'manbashunoslik'],
    dateLabel: '1943 yil',
    yearFrom: 1943,
    yearTo: 1943,
    author: 'Yakov Protazanov (rejissyor)',
    origin: 'Toshkent kinostudiyasi, SSSR',
    repository: 'Raqamli nusxa — Wikimedia Commons',
    originalUrl: `${COMMONS}Nasreddin_in_Bukhara_(1943).webm`,
    mediaUrl: `${UPLOAD}/9/94/Nasreddin_in_Bukhara_%281943%29.webm`,
    license: 'Wikimedia Commons’da jamoat mulki sifatida belgilangan',
    reliabilityNotes:
      'Film yaratilgan davr (1943) haqida ishonchli guvoh: o‘sha davr mafkurasi, kino tili va o‘tmishga munosabatni ko‘rsatadi.',
    limitations:
      'Badiiy asar — tasvirlangan Buxoro hayoti tarixiy fakt emas. Amirlik sovet mafkurasiga mos ravishda satirik ko‘rsatilgan. Fayl hajmi katta (taxm. 600 MB) — darsdan oldin yuklab oling.',
    teachingUse: '«Tarixiy film — tarixiy manbami?» mavzusidagi tanqidiy fikrlash mashg‘uloti; film davri va tasvirlangan davrni farqlash.',
    methodicalRecommendations:
      'Butun filmni emas, 3–5 daqiqalik parchani ko‘rsating. O‘quvchilar avval film qachon va kim tomonidan yaratilganini aniqlasin, so‘ng sahnadagi amirlik tasvirini yozma manbalar bilan solishtirsin.',
    practicalTasks: [
      'Film qachon, qayerda va kim tomonidan yaratilganini aniqlang. Bu ma’lumotlar film mazmuniga qanday ta’sir qilgan?',
      'Tanlangan 3–5 daqiqalik parchada amir va amaldorlar qanday ko‘rsatilgan? Kadr, musiqa va dialog vositalarini sanab o‘ting.',
      'Film va Ahmad Donish asaridagi amirlik tasvirini taqqoslang: qaysi biri qaysi davr haqida ko‘proq ma’lumot beradi?',
      '«Badiiy film tarixiy manba bo‘la oladimi?» savoli bo‘yicha 15 daqiqalik guruhli munozara rejasini tuzing.',
    ].join('\n'),
    variants: [],
  },
  {
    slug: 'ozbek-xalq-musiqasi-audioyozuv',
    title: 'O‘zbek an’anaviy xalq musiqasi (audioyozuv)',
    summary: 'Wikimedia Commons’dagi o‘zbek an’anaviy musiqasi yozuvi — audio manbaning kelib chiqishini tekshirish mashqi uchun.',
    description:
      'Yozuv Wikimedia Commons’ga «Uzbek traditional folk music» tavsifi bilan yuklangan. Ijrochilar, yozilgan joy va sana ko‘rsatilmagan. Shu sababli u audio manbani tanqidiy baholash — kelib chiqishi noma’lum materialni qanday tekshirish kerakligini o‘rganish uchun tanlangan. O‘zbek mumtoz musiqa merosi (Shashmaqom) haqida ishonchli ma’lumot UNESCO nomoddiy madaniy meros ro‘yxatida keltirilgan.',
    type: 'AUDIO',
    format: 'Audioyozuv (OGG)',
    period: null,
    topics: ['musiqiy-meros', 'manbashunoslik'],
    dateLabel: 'Aniqlanmagan',
    yearFrom: null,
    yearTo: null,
    author: 'Ijrochi noma’lum (yuklovchi: Wikimedia Commons foydalanuvchisi)',
    origin: 'Aniqlanmagan — yozuv metama’lumotlari yo‘q',
    repository: 'Wikimedia Commons',
    originalUrl: `${COMMONS}Uzbek_music.ogg`,
    mediaUrl: `${UPLOAD}/a/a0/Uzbek_music.ogg`,
    license: 'CC BY-SA 3.0 (Wikimedia Commons)',
    reliabilityNotes: 'Past: ijrochi, joy va sana noma’lum. Musiqiy uslub haqida umumiy tasavvur beradi, xolos.',
    limitations: 'Kelib chiqishi hujjatlashtirilmagan; uni ma’lum bir an’ana yoki davrga bog‘lash uchun qo‘shimcha dalil kerak.',
    teachingUse: 'Audio manbaning kelib chiqishini aniqlash va «ishonchli manba» mezonlarini ishlab chiqish mashg‘uloti.',
    methodicalRecommendations:
      'O‘quvchilar yozuvni tinglab, undan qanday ma’lumot olish mumkinligini va qanday ma’lumot yetishmasligini aniqlasin. So‘ng UNESCO sahifasidagi Shashmaqom tavsifi bilan solishtirsin.',
    practicalTasks: [
      'Yozuvni tinglang va undan aniqlash mumkin bo‘lgan ma’lumotlarni (cholg‘ular, ijro uslubi, ovoz) yozing.',
      'Bu audio manba haqida qanday ma’lumotlar yetishmaydi? Ularni qayerdan topish mumkinligini taklif qiling.',
      'Audio manba ishonchliligini baholash uchun 5 ta mezondan iborat nazorat ro‘yxatini tuzing.',
      'UNESCO’ning Shashmaqom sahifasi bilan solishtiring: ishonchli manba qanday ko‘rinishda bo‘ladi?',
    ].join('\n'),
    variants: [
      {
        kind: 'SCHOLARLY_COMMENTARY',
        title: 'Qo‘shimcha ishonchli manba',
        content:
          'Shashmaqom — Buxoroda shakllangan mumtoz musiqa an’anasi; 2008 yilda UNESCO Insoniyatning nomoddiy madaniy merosi reprezentativ ro‘yxatiga kiritilgan (O‘zbekiston va Tojikiston).',
        citation: 'UNESCO: Shashmaqom music — https://ich.unesco.org/en/RL/shashmaqom-music-00089',
      },
    ],
  },
  {
    slug: 'poykent-shisha-idish',
    title: 'Poykentdan topilgan shisha idish (X–XII asrlar)',
    summary:
      'Buxoro vohasidagi qadimiy Poykent shahri xarobalaridan topilgan shisha idish — Buyuk ipak yo‘lidagi shaharning hunarmandchiligi va savdo aloqalarini ko‘rsatuvchi moddiy manba.',
    description: [
      'Poykent (Paykend) — Buxorodan taxminan 40 km g‘arbda, Zarafshon daryosining quyi oqimida joylashgan qadimiy shahar xarobasi. Yodgorlik maydoni taxminan 20 gektar; ilk manzilgoh miloddan avvalgi III asrda paydo bo‘lgan.',
      'Shahar ark (sitadel), ikki shahriston va rabotdan iborat bo‘lgan. VI–VII asrlarda Poykentni xokim emas, savdogarlar kengashi boshqargan — bu uning yirik savdo markazi bo‘lganini ko‘rsatadi. 706-yilda arab sarkardasi Qutayba ibn Muslim shaharni qamal qilib egallagan. X asr tarixchisi Narshaxiy Poykentni mustahkam devorlari tufayli «Shahristoni royin» — «Mis shahar» deb ataydi.',
      'Zarafshon suvi shahargacha yetib kelmay qolgani sababli Poykentdagi hayot asta-sekin so‘ngan: tadqiqotchilar buni IX asr o‘rtalaridan XI asr boshigacha bo‘lgan davr bilan bog‘laydi. XII asrda Qoraxoniy hukmdor Arslonxon kanal qazdirib shaharni tiklashga uringan, ammo bu urinish muvaffaqiyatsiz chiqqan.',
      'Ushbu shisha idish Poykentdagi arxeologik qazishmalarda topilgan va X–XII asrlarga oid deb belgilangan. U shahar hayotining so‘nggi bosqichida ham hunarmandchilik va savdo davom etganini, shisha buyumlar kundalik turmushda ishlatilganini ko‘rsatadi.',
      '2023-yilda Poykent «Ipak yo‘llari: Zarafshon–Qoraqum yo‘lagi» seriyali obyekti tarkibida YUNESKO Jahon merosi ro‘yxatiga kiritilgan.',
    ].join('\n\n'),
    type: 'ARCHAEOLOGICAL',
    format: 'Arxeologik topilma — shisha idish; raqamli nusxa: fotosurat',
    period: null,
    topics: ['arxeologik-yodgorliklar'],
    dateLabel: 'X–XII asrlar (taxminiy)',
    yearFrom: 900,
    yearTo: 1200,
    author: 'Noma’lum shishasoz hunarmand',
    origin: 'Poykent arxeologik yodgorligi — Buxoro viloyati, Buxorodan ~40 km g‘arbda (39°35′ sh.k., 64°00′ sh.u.)',
    repository:
      'Asl buyum: Poykent arxeologik qazishmalari topilmasi (saqlanayotgan muzey rasm tavsifida ko‘rsatilmagan). Raqamli nusxa: Wikimedia Commons, fotosurat muallifi — ALFGRN (2006-yil 8-yanvar).',
    originalUrl: `${COMMONS}Glass_bottle,_Paykend,_10-12th_century.jpg`,
    mediaUrl: `${UPLOAD}/thumb/6/62/Glass_bottle%2C_Paykend%2C_10-12th_century.jpg/960px-Glass_bottle%2C_Paykend%2C_10-12th_century.jpg`,
    license: 'Fotosurat: CC BY-SA 2.0, muallif ALFGRN (Wikimedia Commons)',
    latitude: 39.5867,
    longitude: 64.0106,
    reliabilityNotes:
      'Buyum Poykent qazishmalaridan topilgan — kelib chiqish joyi ma’lum. Sanasi (X–XII asrlar) uslubi va arxeologik qatlam asosida taxminan belgilangan. Fotosurat ochiq litsenziya bilan e’lon qilingan, muallifi va olingan sanasi ko‘rsatilgan.',
    limitations:
      'Buyum qaysi qazish mavsumida, qaysi qatlamdan topilgani va hozir qaysi muzeyda saqlanayotgani rasm tavsifida ko‘rsatilmagan. Shisha mahalliy ustaxonada yasalganmi yoki savdo orqali keltirilganmi — buni aniqlash uchun kimyoviy tarkib tahlili kerak. Bitta buyum asosida shahar iqtisodiyoti haqida keng xulosa chiqarib bo‘lmaydi.',
    teachingUse:
      '«Buyuk ipak yo‘li va O‘rta Osiyo shaharlari», «Somoniylar va Qoraxoniylar davrida hunarmandchilik» mavzularida moddiy manba bilan ishlash; yozma manba (Narshaxiy) ma’lumotini arxeologik topilma bilan solishtirish.',
    methodicalRecommendations:
      'Avval o‘quvchilar buyumni faqat ko‘rib tasvirlasin (kuzatuv), so‘ng uni kim va qanday maqsadda yasagan bo‘lishi mumkinligini taxmin qilsin (talqin). Har bir taxminni dalil bilan asoslashni talab qiling. Darsni Poykent xaritasi va shahar tarixi haqidagi qisqa matn bilan boyiting.',
    practicalTasks: [
      'Idishni tasvirlang: shakli, rangi, bo‘yni va tubi haqida nimani aytish mumkin? Faqat ko‘rinib turgan belgilarni yozing.',
      'Shisha idish Poykent aholisining turmushi va hunarmandchiligi haqida qanday guvohlik beradi? Dalil bilan 3 ta faraz yozing.',
      'Narshaxiyning Poykent haqidagi ma’lumoti va ushbu topilmani solishtiring: ular bir-birini qanday to‘ldiradi?',
      'Nima uchun bitta topilma asosida keng xulosa chiqarish xavfli? Misol bilan tushuntiring.',
      'Afrosiyob devoriy suratlari bilan birga «Moddiy manbalar nimani aytadi?» mavzusida 15 daqiqalik mashg‘ulot rejasini tuzing.',
    ].join('\n'),
    references: [
      'Wikimedia Commons: «Glass bottle, Paykend, 10-12th century» (foto: ALFGRN, CC BY-SA 2.0) — https://commons.wikimedia.org/wiki/File:Glass_bottle,_Paykend,_10-12th_century.jpg',
      'Paykend — Wikipedia (ingliz tilida) — https://en.wikipedia.org/wiki/Paykend',
      'Пайкенд — Википедия (rus tilida) — https://ru.wikipedia.org/wiki/Пайкенд',
      'Мухамеджанов А. Р. и др. Городище Пайкенд. — Ташкент: Фан, 1988.',
      'Омельченко А. В. Цитадель Пайкенда в III–V вв. // Российская археология. — 2013. — № 2.',
      'Narshaxiy. Buxoro tarixi (X asr) — Poykent haqidagi bo‘lim.',
    ].join('\n'),
    variants: [
      {
        kind: 'SCHOLARLY_COMMENTARY',
        title: 'Poykent qazishmalari: ilmiy ma’lumot',
        content: [
          'Poykentda arxeologik tadqiqotlar 1914-yilda L. A. Zimin (Turkiston arxeologiya havaskorlari to‘garagi) tomonidan boshlangan. 1939–1940-yillarda yodgorlikni Davlat Ermitaji va Moddiy madaniyat tarixi instituti Zarafshon ekspeditsiyasi o‘rgangan. 1981-yildan buyon qazishmalarni Davlat Ermitaji va O‘zbekiston Fanlar akademiyasi Arxeologiya instituti qo‘shma Buxoro arxeologik ekspeditsiyasi olib bormoqda; 2010-yillarga kelib yodgorlikning taxminan 15 foizi qazilgan.',
          'Arkda zardushtiylik ibodatxonalari, saroy, IX asrga oid masjid va diametri taxminan 11 metr bo‘lgan minora poydevori topilgan. Shahar hududida mudofaa devorlari, darvozalar, turar-joy mahallalari, kulolchilik markazlari va karvonsaroylar aniqlangan. Topilmalar orasida VII–VIII asrlarga oid bezakli sanchqi, X–XII asrlarga oid shisha idish va XI–XII asrlarga oid ikki tumshuqli chiroq bor.',
        ].join('\n\n'),
        citation: 'Paykend va Пайкенд maqolalari (Wikipedia); Мухамеджанов А. Р. и др. Городище Пайкенд (1988)',
      },
      {
        kind: 'EDUCATIONAL_ADAPTATION',
        title: 'O‘quvchilar uchun: ming yillik shisha idish',
        content:
          'Tasavvur qiling: ming yil avval Buxoro yaqinidagi Poykent shahrida savdogarlar karvonlarni kutib olar, hunarmandlar esa ustaxonalarda sopol va shishadan buyumlar yasar edi. Arxeologlar shahar xarobalarini qazib, shunday shisha idishni topishdi. U bizga Poykent aholisi shisha buyumlardan foydalanganini va shahar Buyuk ipak yo‘lidagi savdo bilan bog‘liq bo‘lganini aytib beradi. Keyinchalik daryo suvi shahargacha yetmay qolgani uchun odamlar Poykentni tark etishgan.',
      },
    ],
  },
  {
    slug: 'behbudiy-fotosurati',
    title: 'Mahmudxo‘ja Behbudiy fotosurati (1919 yilgacha)',
    summary: 'Turkiston jadidlarining yetakchisi Mahmudxo‘ja Behbudiyning hayotligida olingan fotosurati.',
    description:
      'Mahmudxo‘ja Behbudiy (1875–1919) — jadidchilik harakatining asoschilaridan biri, «Padarkush» dramasi muallifi, «Oyina» jurnali va «Samarqand» gazetasining noshiri. Fotosurat uning hayotligida olingan.',
    type: 'VISUAL',
    format: 'Fotosurat',
    period: 'jadidchilik',
    topics: ['jadidlar-marifatparvarligi'],
    dateLabel: '1919 yilgacha',
    yearFrom: null,
    yearTo: 1919,
    author: 'Fotograf noma’lum',
    origin: 'Turkiston',
    repository: 'Raqamli nusxa — Wikimedia Commons',
    originalUrl: `${COMMONS}Photograph_of_Mahmud_Khoja_Behbudiy.jpg`,
    mediaUrl: `${UPLOAD}/d/db/Photograph_of_Mahmud_Khoja_Behbudiy.jpg`,
    license: 'Jamoat mulki (Public domain)',
    reliabilityNotes: 'Shaxsi aniqlangan tarixiy fotosurat; aniq sanasi va joyi noma’lum.',
    limitations: 'Fotograf va olingan sana ko‘rsatilmagan.',
    teachingUse: '«Jadidchilik harakati» darsida jadidlar qiyofasi va davr kiyinish madaniyati bilan tanishtirish.',
    methodicalRecommendations: 'Fotosuratni «Oyina» jurnali muqovasi va Turon truppasi afishasi bilan birga ko‘rsatib, jadidlar faoliyatining turli yo‘nalishlarini muhokama qiling.',
    practicalTasks: [
      'Fotosuratdagi tafsilotlar (kiyim, holat) Behbudiy haqida nimani aytadi? 3 ta kuzatuv yozing.',
      'Behbudiy faoliyatining yo‘nalishlarini (matbuot, teatr, maktab) manbalar asosida klaster ko‘rinishida ifodalang.',
      'Fotosurat, «Oyina» muqovasi va Turon afishasidan foydalanib, «Jadidlar kim edi?» mavzusidagi dars uchun kirish qismini rejalashtiring.',
    ].join('\n'),
    variants: [],
  },
  {
    slug: 'turon-truppasi-afishasi-1915',
    title: 'Turon truppasi spektakllari afishasi (Xo‘jand, 1915)',
    summary: 'Toshkentlik musulmon havaskor aktyorlari — Turon truppasining 1915 yil iyunida Xo‘jandda bergan spektakllari afishasi.',
    description:
      'Afishada 1915 yil 1–3 iyun kunlari Xo‘jandda Turon truppasi va mahalliy havaskorlar tomonidan qo‘yilgan spektakllar e’lon qilingan. Turon truppasi Abdulla Avloniy faoliyati bilan bog‘liq; jadid teatri ma’rifat tarqatish vositasi sifatida qaralgan. Afisha Abdulla Avloniy yodgorlik muzeyida saqlanadi.',
    type: 'VISUAL',
    format: 'Bosma afisha',
    period: 'jadidchilik',
    topics: ['jadidlar-marifatparvarligi'],
    dateLabel: '1915 yil iyun',
    yearFrom: 1915,
    yearTo: 1915,
    author: 'Turon truppasi (tayyorlovchi noma’lum)',
    origin: 'Xo‘jand',
    repository: 'Abdulla Avloniy yodgorlik muzeyi, Toshkent; raqamli nusxa — Wikimedia Commons',
    originalUrl: `${COMMONS}Turon_troupe_poster,_Khujand,_June_1915_(Abdulla_Avloniy_Memorial_Museum).jpg`,
    mediaUrl: `${UPLOAD}/4/4f/Turon_troupe_poster%2C_Khujand%2C_June_1915_%28Abdulla_Avloniy_Memorial_Museum%29.jpg`,
    license: 'Jamoat mulki (Public domain)',
    reliabilityNotes: 'Asl hujjat — voqea sodir bo‘lgan paytda yaratilgan birlamchi manba. Saqlanish joyi ma’lum.',
    limitations: 'Afisha spektakllar e’lonini ko‘rsatadi, ammo ular qanday o‘tgani va tomoshabinlar munosabati haqida ma’lumot bermaydi.',
    teachingUse: '«Jadid teatri» va «Ma’rifatparvarlik vositalari» mavzulari uchun birlamchi vizual manba.',
    methodicalRecommendations: 'O‘quvchilar afishadagi ma’lumotlarni (sana, joy, tashkilotchilar) ajratib olsin va jadidlar nima uchun teatrdan foydalanganini muhokama qilsin.',
    practicalTasks: [
      'Afishadan sana, joy, tashkilotchilar va spektakllar haqidagi ma’lumotlarni ajratib oling.',
      'Jadidlar nima uchun teatrni ma’rifat tarqatish vositasi sifatida tanlagan? Kamida 2 ta dalil keltiring.',
      'Afisha qanday savollarga javob bermaydi? Bu bo‘shliqni to‘ldirish uchun qanday qo‘shimcha manbalar kerak?',
      'O‘quvchilar uchun «Jadid teatri afishasini yarating» ijodiy topshirig‘i va uni baholash mezonlarini ishlab chiqing.',
    ].join('\n'),
    variants: [],
  },
];
