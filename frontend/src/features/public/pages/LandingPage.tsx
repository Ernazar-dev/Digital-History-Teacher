import {
  AimOutlined, ArrowRightOutlined, BankOutlined, BarChartOutlined, BookOutlined, CaretRightFilled, ExperimentOutlined, FileTextOutlined,
  GlobalOutlined, SearchOutlined, UserOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Reveal, SplitWords, useInView } from '@/components/motion/motion';
import { useAuthStore } from '@/features/auth/auth.store';
import { OBJECT_TYPE } from '@/lib/labels';
import { exploreService } from '@/services/explore.service';
import { museumService } from '@/services/museum.service';
import type { VirtualObject, VirtualObjectListItem } from '@/types/api';
import { yearLabel } from '@/utils/format';
import heroImage from '@/assets/hero-arch.jpg';
import { CHAIN, MODULES } from '../content';

/** Barcha bo'limlar navbar bilan bir xil konteynerda — ikki chetdagi bo'shliq teng */
const CONTAINER = 'mx-auto w-full max-w-7xl px-4 md:px-8';

const SectionTitle = ({ title, text, link }: { title: string; text?: string; link?: { to: string; label: string } }) => (
  <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="font-serif-title m-0 text-3xl font-bold md:text-[44px]">{title}</h2>
      {text && <p className="mb-0 mt-3 max-w-prose text-muted">{text}</p>}
    </div>
    {link && <Link to={link.to} className="font-medium">{link.label} <ArrowRightOutlined /></Link>}
  </Reveal>
);

/** Rasm ustidagi aylanuvchi bosqich — platformadagi yo'l: manba → tahlil → dars */
const HERO_STAGES = ['Tarixiy manba', 'Tahlil', 'Dars'];
const pad2 = (n: number) => String(n).padStart(2, '0');
const onPhoto = { textShadow: '0 1px 10px rgba(11, 21, 48, 0.55)' };

/**
 * Hero rasmi: ravoq ichidagi Registon, qo'lyozma va planshet (qadimiy manbadan raqamli darsga).
 * Rasmda hech qanday yozuv yo'q — hisoblagich va obyekt nomi HTML'da, ma'lumot bazadan.
 * O'lchamlar rasm kengligiga bog'liq (container query birliklari — cqw).
 */
const HeroArch = ({ featured }: { featured?: Pick<VirtualObject, 'slug' | 'title' | 'periodLabel'> }) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s + 1) % HERO_STAGES.length), 3500);
    return () => clearInterval(t);
  }, []);
  const fade = 'linear-gradient(to right, transparent 0, #000 22%), linear-gradient(to bottom, #000 86%, transparent)';

  return (
    <div className="relative w-full" style={{ aspectRatio: '900 / 458', containerType: 'inline-size' }}>
      <img
        src={heroImage}
        alt="Ravoq ortida Registon majmuasi, oldida qadimiy qo‘lyozma va planshet"
        className="animate-hero-reveal absolute inset-0 h-full w-full object-cover"
        style={{ maskImage: fade, WebkitMaskImage: fade, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }}
      />
      {/* Bosqich hisoblagichi */}
      <div className="absolute flex flex-col items-center text-center text-white" style={{ left: '69%', top: '15%', width: '14%', ...onPhoto }} aria-live="polite">
        <div className="font-serif-title leading-none" style={{ fontSize: 'clamp(18px, 3.2cqw, 40px)' }}>
          <span key={stage} className="animate-fade-up inline-block">{pad2(stage + 1)}</span>
          <span className="text-white/60" style={{ fontSize: '0.45em' }}>/{pad2(HERO_STAGES.length)}</span>
        </div>
        <div key={`l${stage}`} className="animate-fade-in mt-2 font-medium uppercase tracking-[0.25em] text-white/90" style={{ fontSize: 'clamp(8px, 1cqw, 11px)' }}>
          {HERO_STAGES[stage]}
        </div>
        <span key={`ln${stage}`} className="animate-draw-line mt-3 block w-px bg-gradient-to-b from-accent to-transparent" style={{ height: '13cqw' }} aria-hidden />
      </div>
      {/* Obyekt nomi — bazadan */}
      {featured && (
        <Link
          to={`/app/museum/${featured.slug}`}
          className="animate-fade-in group absolute flex items-center gap-3 no-underline"
          style={{ right: '5%', bottom: '8%', animationDelay: '1.4s' }}
        >
          <span className="text-right leading-snug" style={onPhoto}>
            <span className="block text-[13px] text-white">{featured.title}</span>
            {featured.periodLabel && <span className="block text-[11px] text-white/70">{featured.periodLabel}</span>}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-solid border-accent/80 text-accent transition-colors group-hover:bg-accent group-hover:text-midnight">
            <ArrowRightOutlined className="text-xs" />
          </span>
        </Link>
      )}
    </div>
  );
};

const MODULE_ICONS: Record<number, ReactNode> = {
  1: <BookOutlined />, 2: <SearchOutlined />, 3: <FileTextOutlined />, 4: <BankOutlined />,
  5: <BarChartOutlined />, 6: <AimOutlined />, 7: <UserOutlined />,
};

/** Yettita modul — hero ostidagi ingichka chiziqlar bilan ajratilgan qator */
const ModuleStrip = () => (
  <section className="border-0 border-y border-solid border-line bg-white/70">
    <div className={`${CONTAINER} flex items-stretch gap-6 py-7`}>
      <div className="hidden shrink-0 flex-col justify-between lg:flex">
        <span className="text-[11px] font-semibold uppercase leading-relaxed tracking-[0.25em] text-ink">
          7 ta
          <br />
          modul
        </span>
        <span className="h-10 w-px bg-accent" aria-hidden />
      </div>
      <ol className="m-0 flex flex-1 list-none snap-x overflow-x-auto p-0 pb-1 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
        {MODULES.map((m, i) => (
          <Reveal as="li" key={m.n} delay={i * 70} className="min-w-[190px] snap-start border-0 border-l border-solid border-line px-5 first:border-l-0 lg:min-w-0 lg:first:border-l">
            <Link to={m.to} className="group block no-underline">
              <span className="text-[26px] text-ink/75 transition-colors duration-300 group-hover:text-accent">{MODULE_ICONS[m.n]}</span>
              <div className="font-serif-title mt-3 text-[15px] leading-snug text-ink transition-colors group-hover:text-primary">{m.short}</div>
              <div className="mt-1.5 text-[12px] leading-relaxed text-muted">{m.brief}</div>
            </Link>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

const ADVANTAGES = [
  { icon: <GlobalOutlined />, title: 'Zamonaviy texnologiyalar', text: '3D modellar, 360° panoramalar va interaktiv xarita' },
  { icon: <ExperimentOutlined />, title: 'Ilmiy yondashuv', text: 'Metodik kompetensiyaning to‘rt komponentli modeli asosida' },
];

/** To'q ko'k bo'lim: platformaning afzalliklari va muzeydan bitta obyekt (bazadan) */
const AdvantagesBand = ({ media }: { media?: VirtualObjectListItem }) => (
  <section className="bg-midnight">
    <div className={`${CONTAINER} grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_1fr_1fr] lg:gap-12 lg:py-16`}>
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="h-px w-10 bg-accent" aria-hidden />
          <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">Platformaning afzalliklari</span>
        </div>
        <h2 className="font-serif-title m-0 mt-5 text-3xl font-semibold leading-tight text-white md:text-[40px]">
          Tarixni nafaqat o‘rganing,
          <br />
          <span className="font-normal italic text-accent">balki uni his qiling.</span>
        </h2>
      </Reveal>
      {media?.thumbnailUrl && (
        <Reveal delay={120}>
          <Link to={`/app/museum/${media.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-md no-underline">
            <img src={media.thumbnailUrl} alt={media.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-b from-midnight/75 via-midnight/5 to-transparent" aria-hidden />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-solid border-white/50 bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
              <CaretRightFilled />
            </span>
            {/* Pastdagi mualliflik (Sketchfab) belgisi ochiq qolsin — yozuv tepada */}
            <span className="absolute left-4 right-4 top-3 truncate text-[12px] text-white/85">
              {OBJECT_TYPE[media.type]} · {media.title}
            </span>
          </Link>
        </Reveal>
      )}
      <Reveal delay={240}>
        <ul className="m-0 list-none space-y-6 border-0 p-0 lg:border-l lg:border-solid lg:border-white/10 lg:pl-10">
          {ADVANTAGES.map((a) => (
            <li key={a.title} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-solid border-accent/50 bg-white/[0.04] text-lg text-accent">{a.icon}</span>
              <div>
                <div className="text-[15px] font-medium text-white">{a.title}</div>
                <div className="mt-0.5 text-[13px] text-white/60">{a.text}</div>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
);

/** Bo'lim ekranga kirganda qadamlarni birin-ketin yoqadi (bir marta) */
const useStepper = (count: number, step = 450) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (!inView) return;
    let i = -1;
    const t = setInterval(() => {
      i += 1;
      setActive(i);
      if (i >= count - 1) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [inView, count, step]);
  return { ref, active };
};

/** Sakkiz qadamli metodik yo'l — bitta ekranga sig'adigan 4×2 to'r */
const ChainSection = () => {
  const { ref, active } = useStepper(CHAIN.length);
  const progress = active < 0 ? 0 : ((active + 1) / CHAIN.length) * 100;
  return (
    <section className="border-y border-line bg-white">
      <div ref={ref} className={`${CONTAINER} flex flex-col justify-center py-14 lg:min-h-[calc(100dvh-64px)]`}>
        <div className="mb-10 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="font-serif-title m-0 text-3xl font-bold md:text-[44px]">Sakkiz qadamli metodik yo‘l</h2>
            <p className="mb-0 mt-3 max-w-prose text-muted">
              Platforma tayyor dars bermaydi — manbani topishdan refleksiyagacha har bir qarorni o‘zingiz qabul qilasiz.
            </p>
          </div>
          <div className="font-serif-title text-muted" aria-hidden>
            <span className="text-5xl font-bold text-primary">{String(Math.max(active + 1, 1)).padStart(2, '0')}</span>
            <span className="text-xl"> / {String(CHAIN.length).padStart(2, '0')}</span>
          </div>
        </div>
        {/* Umumiy progress chizig'i */}
        <div className="mb-6 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-premium" style={{ width: `${progress}%` }} />
        </div>
        <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {CHAIN.map((step, i) => {
            const on = i <= active;
            return (
              <li
                key={step}
                className={`relative flex min-h-[132px] flex-col justify-between rounded-2xl border border-solid p-5 transition-all duration-500 ${
                  on ? 'border-primary/30 bg-primary-soft' : 'border-line bg-canvas'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500 ${
                    on ? 'bg-primary text-white' : 'bg-white text-muted'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`mt-4 text-[17px] font-semibold leading-snug transition-colors duration-500 ${on ? 'text-ink' : 'text-ink/45'}`}>{step}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const objects = useQuery({ queryKey: ['landing-objects'], queryFn: () => museumService.list({ pageSize: 8 }) });
  const periods = useQuery({ queryKey: ['timeline'], queryFn: exploreService.timeline });
  const items = objects.data?.data ?? [];
  // Hero rasmidagi ravoq ortida Registon — uning nomi va davri bazadan olinadi
  const registon = useQuery({ queryKey: ['landing-registon'], queryFn: () => museumService.get('registon-majmuasi-samarqand'), retry: false });
  // Afzalliklar bo'limi uchun: 360° panorama bo'lsa — u, aks holda rasmli birinchi obyekt
  const featuredMedia = items.find((o) => o.type === 'TOUR_360' && o.thumbnailUrl) ?? items.find((o) => o.thumbnailUrl && o.slug !== 'registon-majmuasi-samarqand');

  return (
    <div className="overflow-x-clip">
      {/* ─────────────── HERO ─────────────── */}
      <section className="relative bg-canvas">
        <div className={`${CONTAINER} grid items-center gap-8 py-10 lg:grid-cols-[1.08fr_1.22fr] lg:gap-0 lg:py-4`}>
          <div className="relative z-[1] lg:py-10">
            <div className="flex items-center gap-4">
              <span className="animate-line-grow h-px w-12 bg-accent" aria-hidden />
              <span className="animate-fade-up text-[12px] font-medium uppercase tracking-[0.28em] text-muted" style={{ animationDelay: '250ms' }}>
                Tarix · Ta’lim · Kelajak
              </span>
            </div>
            <h1 className="font-serif-title m-0 mt-7 text-[44px] font-semibold leading-[1.04] text-ink sm:text-6xl lg:text-[54px] xl:text-[64px]">
              <SplitWords text={'Har bir manba —'} delay={80} />
              <br />
              <span className="font-normal italic text-accent">
                <SplitWords text="bo‘lajak dars" delay={300} />
              </span>
            </h1>
            <p className="animate-fade-up mb-0 mt-7 max-w-[42ch] text-[17px] leading-[1.75] text-muted" style={{ animationDelay: '500ms' }}>
              Raqamli tarixiy manbalarni toping, tahlil qiling va ularni zamonaviy dars loyihasiga aylantiring. Bo‘lajak tarix o‘qituvchilari uchun
              innovatsion platforma.
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: '620ms' }}>
              <Link to={user ? '/app' : '/register'}>
                <Button type="primary" size="large" className="group !h-12 !rounded-md !bg-midnight !px-8 hover:!bg-primary">
                  {user ? 'Kabinetga o‘tish' : 'Boshlash'} <ArrowRightOutlined className="ml-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about" className="group inline-flex items-center gap-3 font-medium text-ink no-underline hover:text-primary">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-solid border-accent text-[12px] text-ink transition-colors group-hover:bg-accent group-hover:text-white">
                  <CaretRightFilled />
                </span>
                Platforma haqida
              </Link>
            </div>
          </div>
          {/* Rasm o'ngda ekran chetigacha cho'ziladi, chapda matn ostiga singib ketadi */}
          <div className="relative lg:-ml-24 lg:-mr-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            <HeroArch featured={registon.data} />
          </div>
        </div>
      </section>
      <ModuleStrip />
      <AdvantagesBand media={featuredMedia} />

{/* ─────────────── VIRTUAL MUZEY ─────────────── */}
      {items.length > 0 && (
        <section className={`${CONTAINER} py-24`}>
          <SectionTitle
            title="Meros — bir bosish masofasida"
            text="3D modellar va 360° panoramalar — kuzatuv va dalil topshiriqlari bilan."
            link={{ to: '/app/museum', label: 'Muzeyga kirish' }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 3).map((o, i) => (
              <Reveal key={o.id} delay={i * 100}>
                <Link to={`/app/museum/${o.slug}`} className="group block no-underline">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-line/60">
                    {o.thumbnailUrl && (
                      <img src={o.thumbnailUrl} alt={o.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-105" />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-accent">{OBJECT_TYPE[o.type]}</div>
                      <h3 className="m-0 mt-1 text-lg font-semibold text-ink">{o.title}</h3>
                    </div>
                    <ArrowRightOutlined className="mt-6 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────── DAVRLAR ─────────────── */}
      {(periods.data?.length ?? 0) > 0 && (
        <section className={`${CONTAINER} pb-24`}>
          <SectionTitle
            title="Davrlar bo‘ylab sayohat"
            text="Har bir davrga bog‘langan manbalar va virtual obyektlar — xarita va vaqt chizig‘ida."
            link={{ to: '/app/explore', label: 'Vaqt chizig‘ini ochish' }}
          />
          {/* 6 ustunli to'r: soni 3 ga bo'linmasa, birinchi 2 (yoki 4) karta yarim kenglikda — oxirgi qatorda bo'sh joy qolmaydi */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {periods.data!.map((p, i, all) => (
              <Reveal
                key={p.id}
                delay={(i % 3) * 100}
                className={i < [0, 4, 2][all.length % 3] ? 'wide lg:col-span-3' : 'lg:col-span-2'}
              >
                <Link to="/app/explore" className="group block h-full overflow-hidden rounded-2xl border border-line bg-white no-underline transition-shadow duration-300 hover:shadow-lift">
                  <div className="relative aspect-[16/10] overflow-hidden bg-primary-soft [.wide_&]:lg:aspect-[16/7]">
                    {p.coverUrl && (
                      <img src={p.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-105" />
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                      {[yearLabel(p.startYear), yearLabel(p.endYear)].filter(Boolean).join(' – ') || '—'}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif-title m-0 text-xl font-semibold leading-snug text-ink">{p.name}</h3>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted">
                      <span>{p.sources.length} manba · {p.virtualObjects.length} obyekt</span>
                      <ArrowRightOutlined className="text-primary transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <ChainSection />
    </div>
  );
}
