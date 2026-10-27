import type { QuestionType } from '@prisma/client';

export interface SeedQuestion {
  component: string;
  type: QuestionType;
  prompt: string;
  options?: { id: string; text: string }[];
  correct?: string[];
  points?: number;
}

const LIKERT = [
  { id: '1', text: 'Mutlaqo qo‘shilmayman' },
  { id: '2', text: 'Qo‘shilmayman' },
  { id: '3', text: 'Betarafman' },
  { id: '4', text: 'Qo‘shilaman' },
  { id: '5', text: 'To‘liq qo‘shilaman' },
];

/**
 * Kognitiv test savollari manbashunoslik metodikasiga oid (munozarali tarixiy faktlar emas).
 * Boshlang'ich va yakuniy diagnostikada BIR XIL savollar — natijalar taqqoslanadigan bo'lishi uchun.
 */
export const TEST_QUESTIONS: SeedQuestion[] = [
  {
    component: 'COGNITIVE', type: 'SINGLE_CHOICE',
    prompt: 'Quyidagilardan qaysi biri birlamchi (asl) tarixiy manba hisoblanadi?',
    options: [
      { id: 'a', text: 'Zamonaviy darslikdagi paragraf' },
      { id: 'b', text: 'Voqealar zamondoshi yozib qoldirgan kundalik' },
      { id: 'c', text: 'Ensiklopediyadagi umumlashtiruvchi maqola' },
      { id: 'd', text: 'Tarixiy mavzudagi badiiy film' },
    ],
    correct: ['b'],
  },
  {
    component: 'COGNITIVE', type: 'SINGLE_CHOICE',
    prompt: 'Manbaning ishonchliligini baholashda birinchi navbatda nimani aniqlash kerak?',
    options: [
      { id: 'a', text: 'Manba qancha sahifadan iboratligini' },
      { id: 'b', text: 'Muallifi, yaratilgan vaqti, sharoiti va maqsadini' },
      { id: 'c', text: 'Manba internetda qancha ko‘rilganini' },
      { id: 'd', text: 'Manba qaysi tilda yozilganini' },
    ],
    correct: ['b'],
  },
  {
    component: 'COGNITIVE', type: 'MULTIPLE_CHOICE',
    prompt: 'Tarixiy obyektning raqamli 3D modeli asl obyektdan qanday jihatlarda farq qilishi mumkin? (bir nechta javob)',
    options: [
      { id: 'a', text: 'Rang va material aniq aks etmasligi mumkin' },
      { id: 'b', text: 'Model qisman rekonstruksiya qilingan bo‘lishi mumkin' },
      { id: 'c', text: '3D model har doim asl obyektning aniq nusxasi bo‘ladi' },
      { id: 'd', text: 'Skanerlash vaqtidagi holatni aks ettiradi' },
    ],
    correct: ['a', 'b', 'd'],
  },
  {
    component: 'COGNITIVE', type: 'SINGLE_CHOICE',
    prompt: 'Saroy buyurtmasi bilan yozilgan solnomadan darsda foydalanishda nimaga e’tibor berish kerak?',
    options: [
      { id: 'a', text: 'Unda keltirilgan barcha baholar xolis deb qabul qilinadi' },
      { id: 'b', text: 'Muallif nuqtayi nazari va buyurtmachi manfaatini hisobga olib, boshqa manbalar bilan solishtirish' },
      { id: 'c', text: 'Bunday manbalardan darsda foydalanib bo‘lmaydi' },
      { id: 'd', text: 'Faqat sanalarini yodlash kifoya' },
    ],
    correct: ['b'],
  },
  {
    component: 'COGNITIVE', type: 'SINGLE_CHOICE',
    prompt: 'CC BY-NC litsenziyali 3D modeldan maktab darsida foydalanishda qaysi shart majburiy?',
    options: [
      { id: 'a', text: 'Muallifni ko‘rsatish va tijorat maqsadida foydalanmaslik' },
      { id: 'b', text: 'Modelni sotish uchun ruxsat olish' },
      { id: 'c', text: 'Hech qanday shart yo‘q' },
      { id: 'd', text: 'Modelni o‘zgartirib, o‘z nomingizdan e’lon qilish' },
    ],
    correct: ['a'],
  },
  {
    component: 'ACTIVITY', type: 'TEXT', points: 4,
    prompt: '«Amir Temur davlati» mavzusida 8-sinf o‘quvchilari uchun ikki manbani taqqoslashga asoslangan bitta muammoli savol tuzing va uni qaysi manbalar bilan ishlatishingizni asoslang.',
  },
];

export const SURVEY_QUESTIONS: SeedQuestion[] = [
  { component: 'MOTIVATIONAL', type: 'LIKERT', prompt: 'Raqamli tarixiy manbalar bilan ishlash menga qiziq.', options: LIKERT },
  { component: 'MOTIVATIONAL', type: 'LIKERT', prompt: 'Kelajakda tarix darslarimda raqamli manbalardan muntazam foydalanmoqchiman.', options: LIKERT },
  { component: 'MOTIVATIONAL', type: 'LIKERT', prompt: 'Muzeylarning 3D modellari va virtual sayohatlari o‘quvchilar qiziqishini oshiradi, deb hisoblayman.', options: LIKERT },
  { component: 'MOTIVATIONAL', type: 'LIKERT', prompt: 'Men yangi raqamli manbalarni mustaqil izlab topishga harakat qilaman.', options: LIKERT },
];

export const REFLECTION_QUESTIONS: SeedQuestion[] = [
  { component: 'REFLECTIVE', type: 'TEXT', points: 4, prompt: 'Tarixiy manba bilan ishlashda o‘zingiz uchun eng qiyin bo‘lgan bosqich qaysi? Nima uchun?' },
  { component: 'REFLECTIVE', type: 'TEXT', points: 4, prompt: 'Oxirgi tayyorlagan topshirig‘ingiz yoki dars rejangizda nimani boshqacha qilgan bo‘lardingiz?' },
];

/**
 * Kompleks keys-topshiriq — hujjat, 5-modul misoli: talabaga tarixiy hujjat beriladi, u hujjatni tahlil qiladi,
 * ishonchliligini baholaydi, shu manba asosida topshiriq ishlab chiqadi va metodik qarorini izohlaydi.
 * Savollar turli komponentlarga bog'langan — tarixiy bilim ham, pedagogik qaror ham alohida hisobga olinadi.
 */
export const CASE_QUESTIONS: SeedQuestion[] = [
  {
    component: 'COGNITIVE', type: 'TEXT', points: 25,
    prompt: 'Hujjatni tahlil qiling: uni kim, qachon va qanday maqsadda yaratgan? Unda qanday tarixiy ma’lumotlar bor?',
  },
  {
    component: 'COGNITIVE', type: 'TEXT', points: 25,
    prompt: 'Manbaning ishonchliligini baholang: qaysi ma’lumotlarga ishonish mumkin, qaysilari boshqa manbalar bilan tekshirishni talab qiladi? Dalil keltiring.',
  },
  {
    component: 'ACTIVITY', type: 'TEXT', points: 25,
    prompt: 'Shu manba asosida 8-sinf o‘quvchilari uchun bitta muammoli savol va bitta guruhli topshiriq ishlab chiqing.',
  },
  {
    component: 'REFLECTIVE', type: 'TEXT', points: 25,
    prompt: 'Metodik qaroringizni izohlang: nega aynan shu topshiriqni tanladingiz va u o‘quvchilarda qaysi ko‘nikmani rivojlantiradi?',
  },
];
