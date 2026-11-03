import { ArrowRightOutlined, OrderedListOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useUrlState } from '@/hooks/useUrlState';
import { CATEGORIES, METHODS, type Method, type MethodCategory } from '../methods';
import { TOOLS } from '../tools';

const norm = (s: string) => s.toLowerCase().replace(/[‘’ʻʼ'`]/g, '');
const matches = (m: Method, q: string) =>
  norm([m.title, m.goal, m.exampleTopic, m.example, m.question ?? '', ...m.steps].join(' ')).includes(norm(q));

const pad = (n: number) => String(n).padStart(2, '0');

const MethodCard = ({ m }: { m: Method }) => (
  <Link
    to={`/app/methodology/${m.slug}`}
    className="group flex h-full flex-col rounded-2xl border border-solid border-line bg-white p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift md:p-6"
  >
    <div className="flex items-start justify-between gap-3">
      <span className="font-serif-title text-4xl font-bold leading-none text-primary/25 transition-colors group-hover:text-primary">{pad(m.n)}</span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORIES[m.category].tone}`}>{CATEGORIES[m.category].label}</span>
    </div>
    <h2 className="font-serif-title m-0 mt-4 text-lg font-semibold leading-snug text-ink">{m.title}</h2>
    <p className="m-0 mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{m.goal}</p>
    <div className="mt-4 rounded-xl bg-canvas px-3 py-2 text-[13px] leading-snug text-ink/80">
      <span className="font-medium text-ink">Misol: </span>«{m.exampleTopic}»
    </div>
    <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[13px] text-muted">
      <span className="flex items-center gap-1.5">
        <OrderedListOutlined /> {m.steps.length} bosqich
      </span>
      <span className="flex items-center gap-2">
        {m.tools.map((t) => (
          <span key={t} title={TOOLS[t].label} className="text-base opacity-60">{TOOLS[t].icon}</span>
        ))}
        <ArrowRightOutlined className="ml-1 text-primary transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);

/** Metodika — tarix darslarida raqamli manbalar bilan ishlash metodlari: qidiruv, yo'nalish bo'yicha saralash va kartochkalar */
export default function MethodologyPage() {
  const [filters, setFilters] = useUrlState<{ q?: string; yo?: string }>();
  const cat = filters.yo && filters.yo in CATEGORIES ? (filters.yo as MethodCategory) : undefined;
  const q = filters.q?.trim() ?? '';
  const list = METHODS.filter((m) => (!cat || m.category === cat) && (!q || matches(m, q)));
  const chip = (on: boolean) =>
    `cursor-pointer rounded-full border border-solid px-4 py-1.5 text-sm font-medium transition-colors ${
      on ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink hover:border-primary/50'
    }`;

  return (
    <>
      <PageHeader
        title="Metodika"
        description="Tarix darslarida raqamli manbalar bilan ishlash metodlari. Har bir metodda — maqsad, amaliy misol, bosqichma-bosqich bajarish tartibi va uni platformada qo‘llash yo‘li."
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Yo‘nalish bo‘yicha saralash">
          <button type="button" className={chip(!cat)} aria-pressed={!cat} onClick={() => setFilters({ yo: undefined })}>
            Hammasi <span className="opacity-60">{METHODS.length}</span>
          </button>
          {(Object.keys(CATEGORIES) as MethodCategory[]).map((k) => (
            <button key={k} type="button" className={chip(cat === k)} aria-pressed={cat === k} onClick={() => setFilters({ yo: k })}>
              {CATEGORIES[k].label} <span className="opacity-60">{METHODS.filter((m) => m.category === k).length}</span>
            </button>
          ))}
        </div>
        <Input.Search
          allowClear
          size="large"
          className="lg:max-w-xs"
          placeholder="Metod, mavzu yoki bosqich bo‘yicha"
          defaultValue={filters.q}
          onSearch={(v) => setFilters({ q: v || undefined })}
          aria-label="Metodlardan qidirish"
        />
      </div>

      {list.length ? (
        <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => <MethodCard key={m.slug} m={m} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center text-muted">
          Mos metod topilmadi.{' '}
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-medium text-primary" onClick={() => setFilters({ q: undefined, yo: undefined })}>
            Filtrni tozalash
          </button>
        </div>
      )}
    </>
  );
}
