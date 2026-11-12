import {
  ArrowLeftOutlined, BookOutlined, CheckSquareOutlined, CompassOutlined, EditOutlined, FilePptOutlined, PlayCircleOutlined, RightOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Tag } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { DeleteButton } from '@/components/common/DeleteButton';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { sourcesService } from '@/services/catalog.service';
import { currentLang } from '@/i18n';
import { OBJECT_TYPE } from '@/lib/labels';
import type { Source } from '@/types/api';
import { LectureFileView } from '../components/LectureFileView';
import { LectureReader } from '../components/LectureReader';
import { MaterialViewer } from '../components/MaterialViewer';
import { coverOf, mediaFileUrl, youtubeEmbedUrl } from '../files';

export default function SourceDetailPage() {
  const { id = '' } = useParams();
  const query = useQuery({ queryKey: ['source', id], queryFn: () => sourcesService.get(id) });
  return <QueryState query={query}>{(s) => <TopicView s={s} />}</QueryState>;
}

type PartKey = 'maruza' | 'taqdimot' | 'video' | 'virtual' | 'test';
interface Part { key: PartKey; label: string; icon: ReactNode; hint: string; ready: boolean }

const wordsToPages = (text: string | null) => (text ? Math.max(1, Math.round(text.split(/\s+/).length / 300)) : 0);

/** Afisha: mavzu rasmi fonida sarlavha — sahifa boshida mavzuni darhol tanitadi */
const Hero = ({ s, cover, back, editTo }: { s: Source; cover: string | null; back: string; editTo: string | null }) => {
  const { t } = useTranslation();
  return (
  <header className="relative mb-6 overflow-hidden rounded-3xl bg-midnight text-white">
    {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_30%] opacity-60" />}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" aria-hidden />
    <div className="relative flex min-h-[260px] flex-col justify-between gap-6 p-6 md:min-h-[340px] md:p-10">
      <div className="flex items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm text-white no-underline backdrop-blur hover:bg-white/25">
          <ArrowLeftOutlined /> {t('topic.topics')}
        </Link>
        {editTo && (
          <span className="flex gap-2">
            <Link to={editTo}><Button icon={<EditOutlined />}>{t('topic.edit')}</Button></Link>
            <DeleteButton what={t('topic.subject')} onDelete={() => sourcesService.remove(s.id)} invalidate={['sources', 'source']} backTo={back} />
          </span>
        )}
      </div>
      <div className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
          {s.bookLabel?.split(' · ')[1] ?? s.author}
        </div>
        <h1 className="font-serif-title m-0 mt-3 text-3xl font-bold leading-tight text-white md:text-[42px]">{s.title}</h1>
        <p className="mb-0 mt-3 max-w-2xl text-[15px] leading-relaxed text-white/80">{s.summary}</p>
        {s.status !== 'PUBLISHED' && <Tag className="mt-3">{t('topic.draft')}</Tag>}
      </div>
    </div>
  </header>
  );
};

const Pending = ({ text, editTo }: { text: string; editTo: string | null }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-4 py-16 text-center text-muted">
      <p className="m-0 text-base">{text}</p>
      {editTo && <Link to={editTo}><Button icon={<EditOutlined />}>{t('topic.upload')}</Button></Link>}
    </div>
  );
};

const TopicView = ({ s }: { s: Source }) => {
  const { t } = useTranslation();
  const { user, isStaff, isAdmin } = useAuth();
  const { sources: back, museum } = useAreaPath();
  const [params, setParams] = useSearchParams();
  const siteView = useSiteViewStore((st) => st.siteView);
  // Saytni koʻrish rejimida tahrirlash/oʻchirish koʻrsatilmaydi — bular boshqaruv panelida bajariladi
  const canEdit = !siteView && (isAdmin || (isStaff && s.createdBy?.id === user?.id));
  const editTo = canEdit ? `/app/admin/sources/${s.id}/edit` : null;
  const video = youtubeEmbedUrl(s.videoUrl);
  const pages = wordsToPages(s.lectureContent);
  // Tarixiy kitob: boʻlaklarga boʻlinmaydi — kitobning oʻzi (Word) birinchi qism; qolgan qismlar mavzulardagidek
  const isBook = s.pageCount > 0;
  const initialQuery = params.get('izlash') ?? '';

  const parts: Part[] = [
    { key: 'maruza', label: isBook ? t('topic.book') : t('topic.lecture'), icon: <BookOutlined />, ready: Boolean(s.lectureContent || s.lectureFile), hint: s.lectureFile ? (isBook ? t('topic.hintBook') : t('topic.hintLecture')) : s.lectureContent ? t('topic.hintPages', { n: pages }) : t('topic.soon') },
    { key: 'taqdimot', label: t('topic.presentation'), icon: <FilePptOutlined />, ready: Boolean(s.presentationFile), hint: s.presentationFile ? t('topic.slides') : t('topic.soon') },
    { key: 'video', label: t('topic.videoPart'), icon: <PlayCircleOutlined />, ready: Boolean(video || s.videoFile), hint: video || s.videoFile ? t('topic.watch') : t('topic.soon') },
    // 3D model / 360° sayohat boʻlimi faqat mavzuga obyekt biriktirilgan boʻlsa chiqadi
    ...(s.virtualObjects.length
      ? [{ key: 'virtual' as const, label: t('topic.virtual'), icon: <CompassOutlined />, ready: true, hint: t('topic.objectsCount', { n: s.virtualObjects.length }) }]
      : []),
    ...(s.tests.length ? [{ key: 'test' as const, label: t('topic.test'), icon: <CheckSquareOutlined />, ready: true, hint: t('topic.testsCount', { n: s.tests.length }) }] : []),
  ];
  const requested = params.get('qism') as PartKey | null;
  const active = parts.find((p) => p.key === requested)?.key ?? 'maruza';
  const open = (key: PartKey) => {
    const next = new URLSearchParams(params);
    if (key === 'maruza') next.delete('qism');
    else next.set('qism', key);
    setParams(next, { replace: true });
  };

  return (
    <div>
      <Hero s={s} cover={coverOf(s)} back={back} editTo={editTo} />

      {/* Tanlangan tilda tarjima toʻliq boʻlmasa — qaysi qismlar oʻzbekchada ekani aytiladi */}
      {currentLang() !== 'uz' && (s.fallbacks?.length ?? 0) > 0 && (
        <p className="mb-4 mt-0 rounded-xl bg-primary-soft px-4 py-2 text-sm text-ink">{t('content.notTranslated')}</p>
      )}

      <div
        role="tablist"
        aria-label={t('topic.partsAria')}
        className={`mb-6 grid gap-3 ${
          parts.length >= 5
            ? 'grid-cols-2 lg:grid-cols-5'
            : parts.length === 4
              ? 'grid-cols-2 md:grid-cols-4'
              : parts.length === 1
                ? 'grid-cols-1 sm:max-w-sm'
                : 'grid-cols-3'
        }`}
      >
        {parts.map((p) => {
          const on = p.key === active;
          return (
            <button
              key={p.key}
              type="button"
              role="tab"
              id={`tab-${p.key}`}
              aria-selected={on}
              aria-controls={`panel-${p.key}`}
              onClick={() => open(p.key)}
              className={`group flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-solid p-3 text-left transition-all md:p-4 ${
                on ? 'border-primary bg-primary text-white shadow-lift' : 'border-line bg-white text-ink hover:border-primary/50'
              }`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${on ? 'bg-white/15' : 'bg-primary-soft text-primary'}`}>
                {p.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-tight">{p.label}</span>
                <span className={`block truncate text-xs ${on ? 'text-white/75' : p.ready ? 'text-muted' : 'text-muted/60'}`}>{p.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <section role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="rounded-3xl border border-solid border-line bg-white p-4 md:p-8">
        {/* Ma'ruza — bitta: yuklangan fayl boʻlsa oʻsha koʻrsatiladi, boʻlmasa tayyor matn */}
        {active === 'maruza' &&
          (s.lectureFile ? (
            <LectureFileView file={s.lectureFile} initialQuery={initialQuery} />
          ) : s.lectureContent ? (
            <LectureReader content={s.lectureContent} title={s.title} initialQuery={initialQuery} />
          ) : (
            <Pending text={t('topic.lecturePending')} editTo={editTo} />
          ))}

        {active === 'taqdimot' &&
          (s.presentationFile ? <MaterialViewer files={[s.presentationFile]} /> : <Pending text={t('topic.presentationPending')} editTo={editTo} />)}

        {active === 'video' &&
          (video ? (
            <div className="mx-auto aspect-video max-w-5xl overflow-hidden rounded-2xl bg-black">
              <iframe
                title={t('topic.videoTitle', { title: s.title })}
                src={video}
                className="h-full w-full border-0"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : s.videoFile ? (
            <video src={mediaFileUrl(s.videoFile.id)} controls preload="metadata" className="mx-auto block max-h-[75vh] w-full max-w-5xl rounded-2xl bg-black" />
          ) : (
            <Pending text={t('topic.videoPending')} editTo={editTo} />
          ))}

        {active === 'virtual' && (
          <div>
            <p className="mb-4 mt-0 text-muted">{t('topic.virtualIntro')}</p>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {s.virtualObjects.map((o) => (
                <li key={o.id}>
                  <Link to={`${museum}/${o.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-solid border-line bg-white no-underline transition-shadow hover:shadow-lift">
                    <div className="relative aspect-[16/10] bg-primary-soft">
                      {o.thumbnailUrl && <img src={o.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />}
                      <Tag color="blue" className="!absolute left-3 top-3 m-0">{OBJECT_TYPE[o.type]}</Tag>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      <span className="font-semibold leading-snug text-ink group-hover:text-primary">{o.title}</span>
                      <span className="text-xs text-muted">{[o.location, o.periodLabel].filter(Boolean).join(' · ')}</span>
                      <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium text-primary">{t('topic.view')} <RightOutlined /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {active === 'test' && (
          <div>
            <p className="mb-4 mt-0 text-muted">{t('topic.testIntro')}</p>
            <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
              {s.tests.map((test) => (
                <li key={test.id}>
                  <Link
                    to={user ? `/app/assignments/${test.id}` : `/login?next=${encodeURIComponent(`/app/assignments/${test.id}`)}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-solid border-line px-5 py-4 no-underline hover:border-primary"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink group-hover:text-primary">{test.title}</span>
                      <span className="text-sm text-muted">{t('topic.questions', { n: test.questionCount })}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">{t('topic.start')} <RightOutlined /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};
