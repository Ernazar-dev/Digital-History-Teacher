import {
  ArrowRightOutlined, BankOutlined, BookOutlined, BulbOutlined, CheckSquareOutlined, ExperimentOutlined,
  HistoryOutlined, SettingOutlined, SolutionOutlined, TeamOutlined,
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
    id: 'taxonomy',
    icon: <HistoryOutlined />,
    title: 'Davrlar va mavzular',
    lead: 'Manbalar shu davr va mavzular bo‘yicha guruhlanadi — avval ularni tayyorlab oling.',
    steps: [
      '«Davrlar» ro‘yxatiga tarixiy davr qo‘shing (masalan: «Temuriylar davri»).',
      '«Mavzular» ro‘yxatiga mavzu qo‘shing va uni davrga bog‘lang.',
      'Keraksiz davr yoki mavzuni o‘chirish tugmasi bilan olib tashlang.',
    ],
    link: { to: '/app/admin/taxonomy', label: 'Davrlar va mavzularni ochish' },
    adminOnly: true,
  },
  {
    id: 'sources',
    icon: <BookOutlined />,
    title: 'Manba qo‘shish',
    lead: 'Asosiy ish — materialni yuklash. O‘quvchi faylni manba sahifasida yuklab olmasdan ochib ko‘radi.',
    steps: [
      '«Manba nomi» va 1–3 gapdan iborat «Qisqacha tavsif»ni yozing.',
      '«Manba turi», «Tarixiy davr» va (ixtiyoriy) «Mavzu»ni tanlang.',
      '«O‘quv materiallari» maydoniga PDF, Word (.docx), PowerPoint (.pptx), rasm, audio yoki video fayllarni tashlang. Bir nechta fayl bo‘lsa, tartibini strelkalar bilan o‘zgartiring.',
      'O‘ng tomonda muqova rasmini yuklang — u kutubxonadagi kartochkada ko‘rinadi.',
      '«Saqlash»ni bosing. Manba darhol o‘quvchilarga ko‘rinadi.',
    ],
    tip: 'Eski .doc yoki .ppt fayllarni Word/PowerPoint’da «Saqlash sifatida» orqali .docx/.pptx (yoki PDF) qilib saqlang — shunda ular sahifada ochiladi.',
    link: { to: '/app/admin/sources/new', label: 'Yangi manba qo‘shish' },
  },
  {
    id: 'museum',
    icon: <BankOutlined />,
    title: 'Virtual muzey obyekti',
    lead: '3D model yoki 360° panorama — Sketchfab yoki Uzbekistan360 havolasi orqali qo‘shiladi.',
    steps: [
      '«Nomi», «Obyekt turi» (3D model yoki 360° tur) va «Platforma»ni tanlang.',
      '«Tavsif»ni yozing va «Tashqi manba URL» maydoniga model sahifasining havolasini qo‘ying (masalan, https://sketchfab.com/models/…).',
      '«Preview rasm URL» — kartochkada ko‘rinadigan rasm havolasi.',
      'Xohlasangiz, «Pedagogik topshiriqlar»ga kuzatuv savollarini qo‘shing va obyektni tegishli manbalarga bog‘lang.',
      '«O‘quvchilarga ko‘rinadi» yoqilgan holda saqlang.',
    ],
    link: { to: '/app/admin/objects/new', label: 'Yangi obyekt qo‘shish' },
    adminOnly: true,
  },
  {
    id: 'users',
    icon: <TeamOutlined />,
    title: 'Foydalanuvchilar va guruhlar',
    lead: 'Talabalarni guruhlarga biriktirsangiz, topshiriq va diagnostikani butun guruhga bir bosishda berasiz.',
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
    title: 'Topshiriq berish',
    lead: 'Manba yoki muzey obyekti asosida metodik topshiriq tuzib, guruhga yuboring.',
    steps: [
      '«Sarlavha» va «Ko‘rsatmalar»ni yozing — talaba nima qilishi kerakligini aniq ko‘rsating.',
      '«Guruhlar»ni, «Muddat» va «Maksimal ball»ni belgilang.',
      'Kerak bo‘lsa, «Tarixiy manbalar» yoki «3D/360° obyektlar»ni biriktiring.',
      '«Holati»ni «Nashr etilgan» qilib saqlang — topshiriq talabalarda paydo bo‘ladi.',
    ],
    link: { to: '/app/assignments/new', label: 'Yangi topshiriq' },
  },
  {
    id: 'diagnostics',
    icon: <ExperimentOutlined />,
    title: 'Diagnostika (test)',
    lead: 'Boshlang‘ich, oraliq va yakuniy diagnostika — kompetensiya o‘sishini o‘lchash uchun.',
    steps: [
      '«Nomi», «Bosqich» va «Turi»ni tanlang, kerak bo‘lsa vaqt chegarasini kiriting.',
      '«Savollar» bo‘limida savollarni qo‘shing.',
      '«Faol»ni yoqib saqlang.',
    ],
    link: { to: '/app/diagnostics/new', label: 'Yangi diagnostika' },
  },
  {
    id: 'review',
    icon: <SolutionOutlined />,
    title: 'Tekshirish va baholash',
    lead: 'Talabalar topshirgan barcha ishlar bitta navbatda yig‘iladi.',
    steps: [
      '«Tekshiruv navbati»dan ishni oching.',
      'Izoh yozing va ball qo‘ying yoki ishni qayta ishlashga qaytaring.',
      'Talaba natijani va izohingizni o‘z kabinetida ko‘radi.',
    ],
    link: { to: '/app/review', label: 'Tekshiruv navbati' },
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
