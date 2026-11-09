/**
 * Ssenariy: har sahna uchun diktor matni (subtitr qatorlari).
 * Faktlar manbasi: «O‘zbekiston tarixi» II kitob (Eshov B.J., Odilov A.A.), 1-mavzu «Amir Temur hukmronligi davrida
 * o‘zbek davlatchiligi», hamda backend/prisma/seed-data/lectures/amir-temur-davlati.docx ma’ruzasi.
 * Rim raqamlari (XIV, XV) subtitrda o‘z holicha turadi, ovozga berishda scripts/speech.mjs ularni so‘zga aylantiradi.
 */
export interface SceneScript {
  id: string;
  lines: string[];
}

export const SCRIPT: SceneScript[] = [
  {
    id: 'title',
    lines: ['Amir Temur davlati.', 'XIV asr oxiri – XV asr boshida Movarounnahrda vujudga kelgan markazlashgan saltanat.'],
  },
  {
    id: 'rise',
    lines: [
      'XIV asr o‘rtalarida Chig‘atoy ulusi parokandalikka uchradi. Temur esa 1336-yilda Keshda tug‘ildi.',
      '1362-yilda Seyistonda jang chog‘ida o‘q tegib, umrbod oqsoqlanib qoldi.',
      '1365-yilgi Loy jangida yomg‘ir tufayli chekinishga to‘g‘ri keldi.',
      '1370-yilda Balx egallandi, qurultoy Temurni Movarounnahr amiri deb tan oldi, poytaxt Samarqandga ko‘chirildi.',
    ],
  },
  {
    id: 'campaigns',
    lines: [
      '1388-yilda Urganch egallanib, Xorazm to‘liq bo‘ysundirildi.',
      '1391-yilda Qunduzcha tekisligida To‘xtamishxon qo‘shini tor-mor etildi.',
      '1395-yilda Terek bo‘yida g‘alaba qozonilib, Oltin O‘rda poytaxti Saroy Berka olindi.',
      '1398-yildan 1399-yilgacha Hindistonga yurish bo‘ldi, o‘ljalar orasida yuz yigirmata fil ham bor edi.',
      '1402-yil 20-iyulda Anqara yonida Usmoniylar sultoni Boyazid mag‘lub etildi.',
    ],
  },
  {
    id: 'tactics',
    lines: [
      'Qunduzchada Amir Temur ilk bor qo‘shinni yetti qo‘lga, ya’ni yettita korpusga bo‘ldi.',
      'Terek jangida qariyb to‘rt yuz ming kishi qatnashdi. Taslim bo‘lgan shaharlarga esa ziyon yetkazilmadi.',
    ],
  },
  {
    id: 'ankara',
    lines: [
      'Anqarada Boyazid asirga olindi, Temur unga yaxshi muomala qildi.',
      'Bu g‘alaba turklarning Yevropaga hujumini taxminan ellik yilga kechiktirdi.',
    ],
  },
  {
    id: 'government',
    lines: [
      'Boshqaruv dargoh va devonga tayangan. Devonda yetti vazir xizmat qilgan, aholi esa o‘n ikki toifaga bo‘lingan.',
      '«Temur tuzuklari»da shunday deyiladi: saltanat ishlarining to‘qqiz ulushi kengash va tadbir, bir ulushi qilich bilan bajariladi.',
      'Ayblov to‘rt kishi guvohlik bergandagina isbotlangan hisoblangan.',
    ],
  },
  {
    id: 'army',
    lines: [
      'Qo‘shin o‘nlik, yuzlik, minglik va tumanlarga bo‘lingan, uni uch yuz o‘n uch amir boshqargan.',
      'Har bir jasorat uchun martaba oshgan: o‘nboshi, yuzboshi, mingboshi. Qariganda ham sipohiyning oyligi to‘xtatilmagan.',
    ],
  },
  {
    id: 'sources',
    lines: [
      'Kastiliya elchisi Klavixo 1404-yilda Samarqandda Temur qabulida bo‘lib, kundalik yozib qoldirdi.',
      'Ibn Arabshoh esa Temurga ko‘pincha salbiy qaragan, shunga qaramay uning fazilatlarini ham tan olgan.',
    ],
  },
  {
    id: 'finale',
    lines: [
      '1404-yil 27-noyabrda Temur ikki yuz ming kishilik qo‘shin bilan Xitoyga yo‘l oldi. Qish juda qahraton edi.',
      '1405-yil 18-fevralda O‘trorda vafot etdi. U yigirma yetti mamlakat va o‘lkani o‘z ichiga olgan saltanat barpo etgan edi.',
    ],
  },
  {
    id: 'legacy',
    lines: [
      'Marlou 1588-yilda pyesa, Gendel 1724-yilda opera, Po 1827-yilda doston yaratgan: Amir Temur jahon madaniyatida iz qoldirdi.',
      '2000-yilga kelib Yevropa tillarida yetti yuzdan ortiq asar chop etildi. O‘zbekistonda 1996-yil «Amir Temur yili» deb e’lon qilindi.',
    ],
  },
  {
    id: 'outro',
    lines: [
      'Fransuz olimi Keren yozishicha, davlat bayrog‘ida «Kuch — adolatda» iborasi bo‘lgan.',
      'Endi savol: Ibn Arabshoh va Klavixo Amir Temurni qanday baholagan? Manbalarni taqqoslang.',
    ],
  },
];
