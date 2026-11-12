import { AimOutlined, ArrowLeftOutlined, ArrowRightOutlined, BookOutlined, BulbOutlined, CheckCircleFilled, OrderedListOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import i18n from '@/i18n';
import { CATEGORIES, METHODS } from '../methods';
import { TOOLS } from '../tools';

const pad = (n: number) => String(n).padStart(2, '0');

const Block = ({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-24 rounded-2xl border border-solid border-line bg-white p-5 shadow-card md:p-8">
    <h2 className="font-serif-title m-0 mb-5 flex items-center gap-3 text-xl font-semibold">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-lg text-primary">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

const SECTIONS = [
  { id: 'maqsad', key: 'secGoal' },
  { id: 'misol', key: 'secExample' },
  { id: 'tartib', key: 'secSteps' },
];

/** Bitta metod: maqsad, amaliy misol, bajariş tartibi (bosqiçlar) va platformada qöllaş */
export default function MethodPage() {
  const { slug } = useParams();
  const i = METHODS.findIndex((m) => m.slug === slug);
  const m = METHODS[i];

  if (!m) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
        <p className="m-0 text-muted">{i18n.t('methodology.notFound')}</p>
        <Link to="/app/methodology" className="mt-4 inline-block">{i18n.t('methodology.allMethods')}</Link>
      </div>
    );
  }
  const prev = METHODS[i - 1];
  const next = METHODS[i + 1];
  const cat = CATEGORIES[m.category];

  return (
    <article>
      <Link to="/app/methodology" className="mb-5 inline-flex items-center gap-2 text-sm text-muted no-underline hover:text-primary">
        <ArrowLeftOutlined /> {i18n.t('methodology.allMethods')}
      </Link>

      {/* Sarlavha bloki */}
      <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-midnight to-primary px-6 py-8 text-white md:px-10 md:py-12">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <span className="font-serif-title pointer-events-none absolute -right-2 -top-6 select-none text-[9rem] font-bold leading-none text-white/10 md:text-[13rem]" aria-hidden>
          {pad(m.n)}
        </span>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">{cat.label}</span>
            <span className="text-white/70">{i18n.t('methodology.methodOf', { n: m.n, total: METHODS.length })}</span>
          </div>
          <h1 className="font-serif-title m-0 mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-[42px]">{m.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/85">
            <span className="flex items-center gap-2"><OrderedListOutlined /> {i18n.t('methodology.stagesCount', { n: m.steps.length })}</span>
            <span className="flex items-center gap-2"><BulbOutlined /> {i18n.t('methodology.example')}«{m.exampleTopic}»</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Block id="maqsad" icon={<AimOutlined />} title={i18n.t('methodology.secGoal')}>
            <p className="m-0 border-0 border-l-4 border-solid border-accent pl-5 text-[17px] leading-relaxed text-ink">{m.goal}</p>
          </Block>

          <Block id="misol" icon={<BulbOutlined />} title={i18n.t('methodology.secExample')}>
            <div className="mb-4 inline-block rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-ink">{i18n.t('methodology.topicLabel', { t: m.exampleTopic })}</div>
            <p className="m-0 text-[16px] leading-relaxed text-ink">{m.example}</p>
            {m.exampleItems && (
              <ul className="m-0 mt-4 list-none space-y-2 p-0">
                {m.exampleItems.map((t) => (
                  <li key={t} className="flex items-start gap-3 rounded-xl bg-canvas px-4 py-3 text-ink">
                    <CheckCircleFilled className="mt-1 shrink-0 text-primary" />
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            )}
            {m.question && (
              <blockquote className="font-serif-title m-0 mt-5 rounded-r-2xl border-0 border-l-4 border-solid border-accent bg-accent-soft/60 px-6 py-5 text-[18px] italic leading-relaxed text-ink">
                «{m.question}»
              </blockquote>
            )}
          </Block>

          <Block id="tartib" icon={<OrderedListOutlined />} title={i18n.t('methodology.secSteps')}>
            <ol className="m-0 list-none space-y-3 p-0">
              {m.steps.map((s, k) => (
                <li key={s} className="relative flex gap-4 rounded-xl border border-solid border-line bg-canvas/60 p-4 transition-colors hover:border-primary/30 hover:bg-white md:p-5">
                  <span className="font-serif-title flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-sm">{k + 1}</span>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-accent">{i18n.t('methodology.stageN', { n: k + 1 })}</div>
                    <p className="m-0 mt-1 leading-relaxed text-ink">{s}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Block>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <nav className="hidden rounded-2xl border border-solid border-line bg-white p-5 shadow-card lg:block" aria-label={i18n.t('methodology.navAria')}>
            <h2 className="m-0 mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{i18n.t('methodology.sections')}</h2>
            <ul className="m-0 list-none space-y-0.5 p-0">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-lg px-3 py-2 text-sm text-ink no-underline transition-colors hover:bg-canvas hover:text-primary">{i18n.t(`methodology.${s.key}`)}</a>
                </li>
              ))}
            </ul>
          </nav>

          <section className="rounded-2xl border border-solid border-line bg-white p-5 shadow-card">
            <h2 className="m-0 mb-1 text-base font-semibold">{i18n.t('methodology.applyTitle')}</h2>
            <p className="m-0 mb-4 text-sm text-muted">{i18n.t('methodology.applyHint')}</p>
            {m.topic && (
              <Link to={`/app/sources/${m.topic.slug}`} className="mb-3 flex gap-3 rounded-xl bg-primary-soft p-3 no-underline transition-colors hover:bg-primary/15">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white"><BookOutlined /></span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted">{i18n.t('methodology.matchingLecture')}</span>
                  <span className="block text-sm font-semibold leading-snug text-ink">{m.topic.title}</span>
                </span>
              </Link>
            )}
            <div className="space-y-1">
              {m.tools.map((t) => (
                <Link key={t} to={TOOLS[t].to} className="flex items-center gap-3 rounded-xl p-2.5 no-underline transition-colors hover:bg-canvas">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-primary">{TOOLS[t].icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{TOOLS[t].label}</span>
                    <span className="block text-xs text-muted">{TOOLS[t].desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label={i18n.t('methodology.otherAria')}>
        {prev ? (
          <Link to={`/app/methodology/${prev.slug}`} className="group rounded-2xl border border-solid border-line bg-white p-5 no-underline shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift">
            <span className="flex items-center gap-2 text-xs text-muted"><ArrowLeftOutlined className="transition-transform group-hover:-translate-x-1" /> {i18n.t('methodology.prev', { n: pad(prev.n) })}</span>
            <span className="font-serif-title mt-1.5 block text-base font-semibold leading-snug text-ink">{prev.title}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/app/methodology/${next.slug}`} className="group rounded-2xl border border-solid border-line bg-white p-5 text-right no-underline shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift">
            <span className="flex items-center justify-end gap-2 text-xs text-muted">{i18n.t('methodology.next', { n: pad(next.n) })} <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" /></span>
            <span className="font-serif-title mt-1.5 block text-base font-semibold leading-snug text-ink">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
