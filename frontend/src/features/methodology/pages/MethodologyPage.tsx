import { ArrowRightOutlined, BulbOutlined, OrderedListOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useUrlState } from '@/hooks/useUrlState';
import i18n from '@/i18n';
import { CATEGORIES, METHODS, type Method, type MethodCategory } from '../methods';
import { TOOLS } from '../tools';

const norm = (s: string) => s.toLowerCase().replace(/[‘’ʻʼ'`]/g, '');
const matches = (m: Method, q: string) =>
  norm([m.title, m.goal, m.exampleTopic, m.example, m.question ?? '', ...m.steps].join(' ')).includes(norm(q));

const pad = (n: number) => String(n).padStart(2, '0');

const MethodCard = ({ m }: { m: Method }) => {
  const cat = CATEGORIES[m.category];
  return (
    <Link
      to={`/app/methodology/${m.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-solid border-line bg-white p-5 no-underline shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift md:p-6"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${cat.bar}`} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <span className="font-serif-title text-5xl font-bold leading-none text-primary/15 transition-colors duration-300 group-hover:text-accent">{pad(m.n)}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cat.tone}`}>{cat.label}</span>
      </div>

      <h2 className="font-serif-title m-0 mt-5 text-[19px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary">{m.title}</h2>
      <p className="m-0 mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted">{m.goal}</p>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-canvas px-3.5 py-3 text-[13px] leading-snug text-ink/80">
        <BulbOutlined className="mt-0.5 shrink-0 text-accent" />
        <span><span className="font-medium text-ink">{i18n.t('methodology.example')}</span>«{m.exampleTopic}»</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-0 border-t border-solid border-line pt-4 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">
          <OrderedListOutlined /> {i18n.t('methodology.stagesCount', { n: m.steps.length })}
        </span>
        <span className="flex items-center gap-2.5">
          {m.tools.map((t) => (
            <span key={t} title={TOOLS[t].label} className="text-base text-primary/60">{TOOLS[t].icon}</span>
          ))}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <ArrowRightOutlined className="text-xs" />
          </span>
        </span>
      </div>
    </Link>
  );
};

/** Metodika — tarix darslarida raqamli manbalar bilan ishlash metodlari: qidiruv, yoʻnalish boʻyicha saralash va kartochkalar */
export default function MethodologyPage() {
  const [filters, setFilters] = useUrlState<{ q?: string; yo?: string }>();
  const cat = filters.yo && filters.yo in CATEGORIES ? (filters.yo as MethodCategory) : undefined;
  const q = filters.q?.trim() ?? '';
  const list = METHODS.filter((m) => (!cat || m.category === cat) && (!q || matches(m, q)));
  const chip = (on: boolean) =>
    `cursor-pointer rounded-full border border-solid px-4 py-2 text-sm font-medium transition-colors ${
      on ? 'border-primary bg-primary text-white shadow-sm' : 'border-line bg-white text-ink hover:border-primary/50'
    }`;

  return (
    <>
      <PageHeader
        title={i18n.t('nav.methodology')}
        description={i18n.t('methodology.description')}
        extra={
          <Input.Search
            allowClear
            size="large"
            className="w-full md:w-[24rem]"
            placeholder={i18n.t('methodology.searchPlaceholder')}
            defaultValue={filters.q}
            onSearch={(v) => setFilters({ q: v || undefined })}
            aria-label={i18n.t('methodology.searchAria')}
          />
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label={i18n.t('methodology.filterAria')}>
        <button type="button" className={chip(!cat)} aria-pressed={!cat} onClick={() => setFilters({ yo: undefined })}>
          {i18n.t('methodology.all')} <span className="opacity-60">{METHODS.length}</span>
        </button>
        {(Object.keys(CATEGORIES) as MethodCategory[]).map((k) => (
          <button key={k} type="button" className={chip(cat === k)} aria-pressed={cat === k} onClick={() => setFilters({ yo: k })}>
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${CATEGORIES[k].bar}`} aria-hidden />
            {CATEGORIES[k].label} <span className="opacity-60">{METHODS.filter((m) => m.category === k).length}</span>
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => <MethodCard key={m.slug} m={m} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center text-muted">
          <SearchOutlined className="text-3xl text-primary/40" />
          <span>{i18n.t('methodology.empty')}</span>
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-medium text-primary" onClick={() => setFilters({ q: undefined, yo: undefined })}>
            {i18n.t('methodology.clearFilter')}
          </button>
        </div>
      )}
    </>
  );
}
