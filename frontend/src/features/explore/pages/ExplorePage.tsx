import { AppstoreOutlined, BankOutlined, BookOutlined, EnvironmentOutlined, HistoryOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Empty, Skeleton } from 'antd';
import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { CountUp } from '@/components/motion/motion';
import { exploreService, type TimelinePeriod } from '@/services/explore.service';
import { yearLabel } from '@/utils/format';
import { HistoryTimeline } from '../components/HistoryTimeline';
import { featureKey, featureType } from '../mapFeature';

const HistoryMap = lazy(() => import('../components/HistoryMap'));

const years = (p: TimelinePeriod) => [yearLabel(p.startYear), yearLabel(p.endYear)].filter(Boolean).join(' – ');

const Stat = ({ icon, value, label }: { icon: ReactNode; value: number; label: string }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-solid border-line bg-white px-4 py-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-lg text-primary">{icon}</span>
    <div>
      <CountUp value={value} className="font-serif-title text-2xl font-bold leading-none" />
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  </div>
);

/** Davrlar lentasi: rasmli kartalar — bosilganda xarita va vaqt chizig'i shu davrga moslashadi */
const EraRail = ({ periods, value, onChange }: { periods: TimelinePeriod[]; value?: string; onChange: (id?: string) => void }) => (
  <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
    <button
      type="button"
      onClick={() => onChange(undefined)}
      className={`flex w-40 shrink-0 cursor-pointer snap-start flex-col items-start justify-end rounded-2xl border-2 border-solid p-4 text-left transition-all duration-300 ${
        !value ? 'border-primary bg-primary text-white shadow-card' : 'border-line bg-white text-ink hover:border-primary/40'
      }`}
    >
      <AppstoreOutlined className="mb-6 text-xl" />
      <span className="text-sm font-semibold">Barcha davrlar</span>
      <span className={`text-xs ${!value ? 'text-white/70' : 'text-muted'}`}>{periods.length} ta davr</span>
    </button>
    {periods.map((p) => {
      const on = value === p.id;
      return (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(on ? undefined : p.id)}
          aria-pressed={on}
          className={`group relative h-32 w-56 shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border-2 border-solid p-0 text-left transition-all duration-300 ${
            on ? 'border-primary shadow-lift' : 'border-transparent hover:-translate-y-0.5'
          }`}
        >
          {p.coverUrl ? (
            <img src={p.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-110" />
          ) : (
            <span className="absolute inset-0 bg-primary" />
          )}
          <span className={`absolute inset-0 transition-colors duration-300 ${on ? 'bg-primary/70' : 'bg-gradient-to-t from-midnight/90 via-midnight/40 to-transparent'}`} />
          <span className="absolute inset-x-3 bottom-3 block">
            <span className="block text-[11px] font-semibold text-accent-light">{years(p) || '—'}</span>
            <span className="mt-0.5 line-clamp-2 block text-sm font-semibold leading-snug text-white">{p.name}</span>
          </span>
        </button>
      );
    })}
  </div>
);

export default function ExplorePage() {
  const [periodId, setPeriodId] = useState<string>();
  const [selectedKey, setSelectedKey] = useState<string>();
  const map = useQuery({ queryKey: ['map', periodId], queryFn: () => exploreService.map(periodId) });
  const timeline = useQuery({ queryKey: ['timeline'], queryFn: exploreService.timeline });
  const periods = useMemo(() => timeline.data ?? [], [timeline.data]);
  useEffect(() => setSelectedKey(undefined), [periodId]);

  const totals = useMemo(
    () => ({
      sources: periods.reduce((n, p) => n + p.sources.length, 0),
      objects: periods.reduce((n, p) => n + p.virtualObjects.length, 0),
    }),
    [periods],
  );
  const activePeriod = periods.find((p) => p.id === periodId);

  return (
    <>
      <PageHeader
        title="Interaktiv tarixiy xarita va vaqt chizig‘i"
        description="Manbalar va 3D/360° obyektlarni joylashuvi hamda tarixiy davri bo‘yicha o‘rganing: davrni tanlang, xaritadagi joyni bosing yoki vaqt chizig‘i bo‘ylab sayohat qiling."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<HistoryOutlined />} value={periods.length} label="tarixiy davr" />
        <Stat icon={<EnvironmentOutlined />} value={map.data?.features.length ?? 0} label={activePeriod ? 'joy — tanlangan davrda' : 'joy xaritada'} />
        <Stat icon={<BookOutlined />} value={totals.sources} label="bog‘langan manba" />
        <Stat icon={<BankOutlined />} value={totals.objects} label="3D/360° obyekt" />
      </div>

      {periods.length > 0 && (
        <section className="mb-6">
          <h2 className="m-0 mb-3 text-base font-semibold">Davrni tanlang</h2>
          <EraRail periods={periods} value={periodId} onChange={setPeriodId} />
        </section>
      )}

      <section className="mb-10 overflow-hidden rounded-2xl border border-solid border-line bg-white">
        <QueryState query={map}>
          {(d) => (
            <div className="grid lg:h-[560px] lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="relative h-[420px] lg:h-full">
                <Suspense fallback={<Skeleton.Node active className="!h-full !w-full" />}>
                  <HistoryMap features={d.features} selectedKey={selectedKey} onSelect={setSelectedKey} />
                </Suspense>
                {/* Belgilar izohi */}
                <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex gap-3 rounded-full bg-white/90 px-3 py-1.5 text-xs shadow-card backdrop-blur">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-solid border-accent bg-white" /> 3D/360° obyekt</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> Manba</span>
                </div>
              </div>

              <aside className="flex min-h-0 flex-col border-0 border-t border-solid border-line lg:border-l lg:border-t-0">
                <div className="border-0 border-b border-solid border-line px-4 py-3">
                  <div className="text-sm font-semibold">{activePeriod ? activePeriod.name : 'Xaritadagi joylar'}</div>
                  <div className="text-xs text-muted">{d.features.length} ta joy · bosing — xarita o‘sha joyga uchadi</div>
                </div>
                {d.features.length === 0 ? (
                  <Empty className="my-10" image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bu davr uchun koordinatali joy yo‘q" />
                ) : (
                  <ul className="m-0 max-h-[360px] flex-1 list-none overflow-y-auto p-2 lg:max-h-none">
                    {d.features.map((f) => {
                      const key = featureKey(f);
                      const on = key === selectedKey;
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => setSelectedKey(key)}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 p-2 text-left transition-colors ${on ? 'bg-primary-soft' : 'bg-transparent hover:bg-canvas'}`}
                          >
                            {f.thumbnailUrl ? (
                              <img src={f.thumbnailUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg ${f.kind === 'object' ? 'bg-accent-soft text-accent' : 'bg-primary-soft text-primary'}`}>
                                {f.kind === 'object' ? <BankOutlined /> : <BookOutlined />}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className={`line-clamp-2 block text-sm font-medium leading-snug ${on ? 'text-primary' : 'text-ink'}`}>{f.title}</span>
                              <span className="mt-0.5 block truncate text-xs text-muted">{[featureType(f), f.period?.name].filter(Boolean).join(' · ')}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {d.withoutCoordinates > 0 && (
                  <div className="border-0 border-t border-solid border-line px-4 py-2.5 text-xs text-muted">
                    Yana {d.withoutCoordinates} ta yozuvning aniq koordinatasi kiritilmagan — ular xaritada ko‘rsatilmaydi.
                  </div>
                )}
              </aside>
            </div>
          )}
        </QueryState>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif-title m-0 text-2xl font-bold md:text-3xl">Vaqt chizig‘i</h2>
            <p className="mb-0 mt-1 text-sm text-muted">Davrlar xronologik tartibda — har birida bog‘langan manbalar va obyektlar.</p>
          </div>
          {activePeriod && (
            <button type="button" onClick={() => setPeriodId(undefined)} className="cursor-pointer border-0 bg-transparent text-sm font-medium text-primary">
              Barcha davrlarni ko‘rsatish
            </button>
          )}
        </div>
        <QueryState query={timeline}>{(p) => <HistoryTimeline periods={p} activeId={periodId} onSelect={setPeriodId} />}</QueryState>
      </section>
    </>
  );
}
