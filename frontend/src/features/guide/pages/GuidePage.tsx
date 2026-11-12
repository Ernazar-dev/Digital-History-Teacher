import {
  ArrowRightOutlined, BankOutlined, BookOutlined, BulbOutlined, CheckSquareOutlined, SettingOutlined,
  SolutionOutlined, TeamOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/features/auth/useAuth';
import i18n from '@/i18n';

interface GuideSection {
  id: string;
  icon: ReactNode;
  link: string;
  adminOnly?: boolean;
  hasTip?: boolean;
}

/** Platformani töldiriş tartibi — yuqoridan pastga şu ketma-ketlikda bajariş qulay. Matnlar `guide.<id>` kalitlarida. */
const SECTIONS: GuideSection[] = [
  { id: 'sources', icon: <BookOutlined />, link: '/app/sources', hasTip: true },
  { id: 'museum', icon: <BankOutlined />, link: '/app/admin/objects/new', adminOnly: true },
  { id: 'users', icon: <TeamOutlined />, link: '/app/groups' },
  { id: 'assignments', icon: <CheckSquareOutlined />, link: '/app/assignments/new', hasTip: true },
  { id: 'review', icon: <SolutionOutlined />, link: '/app' },
  { id: 'settings', icon: <SettingOutlined />, link: '/app/admin/settings', adminOnly: true },
];

const steps = (id: string): string[] => {
  const v = i18n.t(`guide.${id}.steps`, { returnObjects: true }) as unknown;
  return Array.isArray(v) ? (v as string[]) : [];
};

export default function GuidePage() {
  const { isAdmin } = useAuth();
  const sections = SECTIONS.filter((s) => isAdmin || !s.adminOnly);

  return (
    <>
      <PageHeader title={i18n.t('staffNav.guide')} description={i18n.t('guide.desc')} />

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label={i18n.t('guide.navAria')} className="hidden lg:block">
          <ol className="sticky top-24 m-0 list-none space-y-1 p-0">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink/80 no-underline transition-colors hover:bg-white hover:text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{i + 1}</span>
                  {i18n.t(`guide.${s.id}.title`)}
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
                  <div className="text-xs font-medium uppercase tracking-wider text-accent">{i18n.t('guide.sectionN', { n: i + 1 })}</div>
                  <h2 className="font-serif-title m-0 mt-2 flex items-center gap-3 text-2xl font-bold text-ink">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg text-primary">{s.icon}</span>
                    {i18n.t(`guide.${s.id}.title`)}
                  </h2>
                  <p className="mb-5 mt-3 leading-relaxed text-muted">{i18n.t(`guide.${s.id}.lead`)}</p>
                  <Link to={s.link}>
                    <Button type="primary" icon={<ArrowRightOutlined />} iconPosition="end">{i18n.t(`guide.${s.id}.link`)}</Button>
                  </Link>
                </div>
                <div className="min-w-0 flex-1">
                  <ol className="m-0 list-none space-y-3 p-0">
                    {steps(s.id).map((step, n) => (
                      <li key={n} className="flex gap-3 rounded-xl bg-canvas p-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{n + 1}</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {s.hasTip && (
                    <p className="mb-0 mt-4 flex gap-2 rounded-xl border border-solid border-accent/30 bg-accent-soft p-4 text-sm leading-relaxed text-[#7a5a1c]">
                      <BulbOutlined className="mt-0.5" /> {i18n.t(`guide.${s.id}.tip`)}
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
