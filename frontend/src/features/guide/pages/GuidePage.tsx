import {
  ArrowRightOutlined, BankOutlined, BookOutlined, BulbOutlined, CheckSquareOutlined, SettingOutlined,
  SolutionOutlined, TeamOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/features/auth/useAuth';

interface GuideSection {
  id: string;
  icon: ReactNode;
  title: string;
  lead: string;
  steps: string[];
  tip?: string;
  link: { to: string; label: string };
  adminOnly?: boolean;
}

/** Platformani to'ldirish tartibi — yuqoridan pastga shu ketma-ketlikda bajarish qulay */
const SECTIONS: GuideSection[] = [
  {
    id: 'sources',
    icon: <BookOutlined />,
    title: 'Mavzu: ma’ruza, taqdimot, video',
    lead: 'Har bir mavzu uch qismdan iborat. Fayllarni istalgan vaqtda qo‘shish yoki almashtirish mumkin.',
    steps: [
      '«Mavzular» ro‘yxatidan kerakli mavzuni oching va «Tahrirlash»ni bosing (yoki «Yangi mavzu» qo‘shing).',
      '«1. Ma’ruza» maydoniga matnni joylang. Bo‘lim sarlavhalarini «## » bilan boshlang — talabaga reja shulardan tuziladi. Xohlasangiz Word/PDF faylini ham biriktiring.',
      '«2. Taqdimot» — PowerPoint (.pptx) yoki PDF faylni tashlang. Talaba uni sahifaning o‘zida ko‘radi.',
      '«3. Video rolik» — YouTube havolasini qo‘ying (tavsiya etiladi) yoki MP4 fayl yuklang.',
      '«Saqlash»ni bosing — o‘zgarishlar talabalarga darhol ko‘rinadi.',
    ],
    tip: 'Katta video fayllar serverni sekinlashtiradi — videoni YouTube’ga yuklab, havolasini qo‘yish qulayroq.',
    link: { to: '/app/sources', label: 'Mavzularni ochish' },
  },
  {
    id: 'museum',
    icon: <BankOutlined />,
    title: 'Virtual muzey obyekti',
    lead: '3D model yoki 360° panorama — Sketchfab yoki Uzbekistan360 havolasi orqali qo‘shiladi.',
    steps: [
      '«Nomi»ni yozing.',
      'Sketchfab (3D model) yoki Uzbekistan360 (360° sayohat) havolasini qo‘ying — turini tizim o‘zi aniqlaydi.',
      '«Obyekt haqida ma’lumot»ni to‘ldiring va «Saqlash»ni bosing — obyekt darhol talabalarga ko‘rinadi.',
    ],
    link: { to: '/app/admin/objects/new', label: 'Yangi obyekt qo‘shish' },
    adminOnly: true,
  },
  {
    id: 'users',
    icon: <TeamOutlined />,
    title: 'Foydalanuvchilar va guruhlar',
    lead: 'Talabalarni guruhlarga biriktirsangiz, ularning test natijalarini guruh bo‘yicha kuzatasiz.',
    steps: [
      '«Foydalanuvchilar» bo‘limida «Yangi foydalanuvchi»: F.I.Sh., login, boshlang‘ich parol va rolni kiriting (talabalar o‘zi ham ro‘yxatdan o‘ta oladi).',
      '«Guruhlar» bo‘limida «Yangi guruh»: nomi va o‘quv yilini yozing.',
      'Guruh sahifasini ochib, talabalarni qo‘shing.',
    ],
    link: { to: '/app/groups', label: 'Guruhlarni ochish' },
  },
  {
    id: 'assignments',
    icon: <CheckSquareOutlined />,
    title: 'Test yuklash',
    lead: 'Savollar yozilgan faylni yuklang va to‘g‘ri javoblarni belgilang — har bir savolni alohida kiritish shart emas.',
    steps: [
      '«Test nomi»ni yozing va testni qaysi mavzuga tegishli ekanini tanlang.',
      '«Test fayli»ga PDF yoki Word faylni tashlang (savollar va A, B, C, D variantlari bilan).',
      '«Savollar soni»ni kiriting va har bir savol uchun to‘g‘ri javobni (A/B/C/D) belgilang. Tezroq: «Tez kiritish» maydoniga «ACBDA…» deb yozing.',
      '«Saqlash»ni bosing. Talaba faylni o‘qib, javoblar varag‘ida belgilaydi va natijani darhol ko‘radi.',
      'Test sahifasida natijalar jadvali bor; kerak bo‘lsa talabaga «qayta topshirish»ga ruxsat bering.',
    ],
    tip: 'Kalitda xato topsangiz, testni tahrirlab tuzating — oldin topshirgan talabalar natijasi avtomatik qayta hisoblanadi.',
    link: { to: '/app/assignments/new', label: 'Test yuklash' },
  },
  {
    id: 'review',
    icon: <SolutionOutlined />,
    title: 'Dars ishlanmalarini tekshirish',
    lead: 'Talabalar topshirgan dars ishlanmalari va muzey ishlari bosh sahifada «Tekshirilishi kerak» ro‘yxatida turadi.',
    steps: [
      'Bosh sahifadagi ro‘yxatdan ishni oching.',
      'Izoh yozing va ball qo‘ying yoki ishni qayta ishlashga qaytaring.',
      'Talaba natijani va izohingizni o‘z kabinetida ko‘radi.',
    ],
    link: { to: '/app', label: 'Bosh sahifa' },
  },
  {
    id: 'settings',
    icon: <SettingOutlined />,
    title: 'Platforma sozlamalari',
    lead: 'Platforma nomi, muassasa va bosh sahifadagi qisqa tavsif.',
    steps: [
      '«Platforma nomi», «Muassasa» va «Qisqa tavsif»ni to‘ldiring.',
      'Talabalar ro‘yxatdan o‘tganda avtomatik tasdiqlanishini yoqish yoki o‘chirish mumkin.',
    ],
    link: { to: '/app/admin/settings', label: 'Sozlamalarni ochish' },
    adminOnly: true,
  },
];

export default function GuidePage() {
  const { isAdmin } = useAuth();
  const sections = SECTIONS.filter((s) => isAdmin || !s.adminOnly);

  return (
    <>
      <PageHeader
        title="Qo‘llanma"
        description="Platformani qanday to‘ldirish kerak — qisqa va qadamma-qadam. Bo‘limlarni yuqoridan pastga shu tartibda bajaring."
      />

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Qo‘llanma bo‘limlari" className="hidden lg:block">
          <ol className="sticky top-24 m-0 list-none space-y-1 p-0">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink/80 no-underline transition-colors hover:bg-white hover:text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{i + 1}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="stagger min-w-0 space-y-6">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-solid border-line bg-white">
              <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
                <div className="md:w-[38%]">
                  <div className="text-xs font-medium uppercase tracking-wider text-accent">{i + 1}-bo‘lim</div>
                  <h2 className="font-serif-title m-0 mt-2 flex items-center gap-3 text-2xl font-bold text-ink">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg text-primary">{s.icon}</span>
                    {s.title}
                  </h2>
                  <p className="mb-5 mt-3 leading-relaxed text-muted">{s.lead}</p>
                  <Link to={s.link.to}>
                    <Button type="primary" icon={<ArrowRightOutlined />} iconPosition="end">{s.link.label}</Button>
                  </Link>
                </div>
                <div className="min-w-0 flex-1">
                  <ol className="m-0 list-none space-y-3 p-0">
                    {s.steps.map((step, n) => (
                      <li key={n} className="flex gap-3 rounded-xl bg-canvas p-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{n + 1}</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {s.tip && (
                    <p className="mb-0 mt-4 flex gap-2 rounded-xl border border-solid border-accent/30 bg-accent-soft p-4 text-sm leading-relaxed text-[#7a5a1c]">
                      <BulbOutlined className="mt-0.5" /> {s.tip}
                    </p>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
