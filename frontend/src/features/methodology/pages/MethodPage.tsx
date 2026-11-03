import { AimOutlined, ArrowLeftOutlined, ArrowRightOutlined, BookOutlined, BulbOutlined, OrderedListOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORIES, METHODS } from '../methods';
import { TOOLS } from '../tools';

const Block = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-7">
    <h2 className="m-0 mb-4 flex items-center gap-3 text-lg font-semibold">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

/** Bitta metod: maqsad, amaliy misol, bajarish tartibi (bosqichlar) va platformada qo'llash */
export default function MethodPage() {
  const { slug } = useParams();
  const i = METHODS.findIndex((m) => m.slug === slug);
  const m = METHODS[i];

  if (!m) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
        <p className="m-0 text-muted">Bunday metod topilmadi.</p>
        <Link to="/app/methodology" className="mt-4 inline-block">Barcha metodlar</Link>
      </div>
    );
  }
  const prev = METHODS[i - 1];
  const next = METHODS[i + 1];

  return (
    <article>
      <Link to="/app/methodology" className="no-print mb-6 inline-flex items-center gap-2 text-sm text-muted no-underline hover:text-primary">
        <ArrowLeftOutlined /> Barcha metodlar
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORIES[m.category].tone}`}>{CATEGORIES[m.category].label}</span>
          <span className="text-muted">Metod {m.n} / {METHODS.length}</span>
        </div>
        <h1 className="font-serif-title m-0 mt-3 max-w-4xl text-3xl font-bold leading-tight md:text-[40px]">{m.title}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Block icon={<AimOutlined />} title="Metodning maqsadi">
            <p className="m-0 text-[16px] leading-relaxed text-ink">{m.goal}</p>
          </Block>

          <Block icon={<BulbOutlined />} title="Amaliy misol">
            <div className="mb-4 inline-block rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-ink">Mavzu: «{m.exampleTopic}»</div>
            <p className="m-0 leading-relaxed text-ink">{m.example}</p>
            {m.exampleItems && (
              <ul className="mb-0 mt-3 space-y-1.5 pl-5 text-ink">
                {m.exampleItems.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
            {m.question && (
              <blockquote className="m-0 mt-4 rounded-r-xl border-0 border-l-4 border-solid border-accent bg-canvas px-5 py-4 font-serif-title text-[17px] italic leading-relaxed text-ink">
                «{m.question}»
              </blockquote>
            )}
          </Block>

          <Block icon={<OrderedListOutlined />} title="Bajarish tartibi">
            <ol className="m-0 list-none p-0">
              {m.steps.map((s, k) => (
                <li key={s} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Bosqichlarni bog'lovchi chiziq */}
                  {k < m.steps.length - 1 && <span className="absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-px bg-line" aria-hidden />}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{k + 1}</span>
                  <p className="m-0 pt-1.5 leading-relaxed text-ink">{s}</p>
                </li>
              ))}
            </ol>
          </Block>
        </div>

        <aside className="no-print space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-solid border-line bg-white p-5">
            <h2 className="m-0 mb-1 text-base font-semibold">Platformada qo‘llash</h2>
            <p className="m-0 mb-4 text-sm text-muted">Metod uchun kerakli materiallar shu yerda</p>
            {m.topic && (
              <Link to={`/app/sources/${m.topic.slug}`} className="mb-3 flex gap-3 rounded-xl bg-primary-soft p-3 no-underline transition-colors hover:bg-primary/15">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white"><BookOutlined /></span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Mos ma’ruza mavzusi</span>
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
          <Button block icon={<PrinterOutlined />} onClick={() => window.print()}>Chop etish</Button>
        </aside>
      </div>

      <nav className="no-print mt-10 grid gap-4 sm:grid-cols-2" aria-label="Boshqa metodlar">
        {prev ? (
          <Link to={`/app/methodology/${prev.slug}`} className="rounded-2xl border border-solid border-line bg-white p-4 no-underline transition-colors hover:border-primary/40">
            <span className="flex items-center gap-2 text-xs text-muted"><ArrowLeftOutlined /> Oldingi metod</span>
            <span className="mt-1 block font-medium leading-snug text-ink">{prev.title}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/app/methodology/${next.slug}`} className="rounded-2xl border border-solid border-line bg-white p-4 text-right no-underline transition-colors hover:border-primary/40">
            <span className="flex items-center justify-end gap-2 text-xs text-muted">Keyingi metod <ArrowRightOutlined /></span>
            <span className="mt-1 block font-medium leading-snug text-ink">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
