import { AppstoreOutlined, BulbOutlined, CalendarOutlined, EditOutlined, EnvironmentOutlined, FileTextOutlined, HistoryOutlined, StarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Empty, Image, List, Tag } from 'antd';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmbedViewer } from '@/components/common/EmbedViewer';
import { PageHeader } from '@/components/common/PageHeader';
import { Section } from '@/components/common/Section';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { ASSIGNMENT_TYPE, OBJECT_TYPE, SOURCE_TYPE, WORK_STATUS } from '@/lib/labels';
import { museumService } from '@/services/museum.service';
import type { AssignmentType, SourceType, VirtualObject } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { ObjectWorkPanel } from '../components/ObjectWorkPanel';
import { TaskCard } from '../components/TaskCard';

/** Obyektning asosiy faktlari — bir qarashda: turi, davri, joylashuvi, topshiriq va manbalar soni */
const FactList = ({ o }: { o: VirtualObject }) => {
  const facts: { icon: ReactNode; label: string; value: ReactNode }[] = [
    { icon: <AppstoreOutlined />, label: 'Obyekt turi', value: OBJECT_TYPE[o.type] },
    { icon: <CalendarOutlined />, label: 'Davr', value: o.periodLabel },
    { icon: <HistoryOutlined />, label: 'Tarixiy bosqich', value: o.period?.name },
    {
      icon: <EnvironmentOutlined />,
      label: 'Joylashuv',
      value: o.location && (o.latitude != null && o.longitude != null
        ? <a href={`https://www.openstreetmap.org/?mlat=${o.latitude}&mlon=${o.longitude}#map=16/${o.latitude}/${o.longitude}`} target="_blank" rel="noopener noreferrer">{o.location}</a>
        : o.location),
    },
    { icon: <FileTextOutlined />, label: 'Topshiriqlar', value: o.tasks.length > 0 ? `${o.tasks.length} ta topshiriq` : null },
  ];
  const shown = facts.filter((f) => f.value);
  if (shown.length === 0) return null;
  return (
    <Section title="Qisqacha ma’lumot">
      <ul className="m-0 list-none divide-x-0 divide-y divide-solid divide-line p-0">
        {shown.map((f) => (
          <li key={f.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-base text-primary">{f.icon}</span>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">{f.label}</div>
              <div className="mt-0.5 break-words text-[15px] font-medium text-ink">{f.value}</div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
};

/** «Obyekt haqida» ichidagi sarlavhali matn bloki */
const InfoBlock = ({ icon, title, accent, children }: { icon: ReactNode; title: string; accent?: boolean; children: ReactNode }) => (
  <section className={`rounded-lg p-4 ${accent ? 'border-0 border-l-4 border-solid border-accent bg-accent-soft' : 'bg-canvas'}`}>
    <h3 className="m-0 mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
      <span className={accent ? 'text-accent' : 'text-primary'}>{icon}</span>
      {title}
    </h3>
    <p className="prose-text m-0 text-[15px] text-ink">{children}</p>
  </section>
);

export default function ObjectPage() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['object', id], queryFn: () => museumService.get(id) });
  return <QueryState query={q}>{(o) => <ObjectView o={o} />}</QueryState>;
}

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);

/** Hujjat, 4-modul: «tarixiy yodgorliklarning fotosuratlari» — obyektga bog'langan tasviriy manbalar galereyasi */
const PhotoGallery = ({ o, sourcesPath }: { o: VirtualObject; sourcesPath: string }) => {
  const photos = o.sources.flatMap((s) => {
    const src = s.mediaFile?.mimeType.startsWith('image/') ? `/api/v1/media/${s.mediaFile.id}` : s.mediaUrl && isImageUrl(s.mediaUrl) ? s.mediaUrl : null;
    return src ? [{ ...s, src }] : [];
  });
  if (photos.length === 0) return null;
  return (
    <Section title="Yodgorlik fotosuratlari va tasvirlari">
      <Image.PreviewGroup>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <figure key={p.id} className="m-0">
              <Image src={p.src} alt={p.title} className="aspect-[4/3] w-full rounded-lg object-cover" rootClassName="w-full" />
              <figcaption className="mt-1 text-xs leading-snug">
                <Link to={`${sourcesPath}/${p.slug}`}>{p.title}</Link>
                {p.dateLabel && <span className="text-muted"> · {p.dateLabel}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </Image.PreviewGroup>
    </Section>
  );
};

const ObjectView = ({ o }: { o: VirtualObject }) => {
  const { user, isStudent, isStaff, isAdmin } = useAuth();
  const { inApp, sources } = useAreaPath();
  const responses = useQuery({ queryKey: ['object-responses', o.id], queryFn: () => museumService.responses(o.id), enabled: inApp && isStaff });

  return (
    <div className="space-y-6">
      <PageHeader
        title={o.title}
        tag={<Tag color="blue">{OBJECT_TYPE[o.type]}</Tag>}
        extra={inApp && isAdmin && <Link to={`/app/admin/objects/${o.id}/edit`}><Button icon={<EditOutlined />}>Tahrirlash</Button></Link>}
      />
      <EmbedViewer title={o.title} embedUrl={o.embedUrl} externalUrl={o.externalUrl} thumbnailUrl={o.thumbnailUrl} kind={o.type === 'TOUR_360' ? '360' : '3d'} />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div>
          <Section title="Obyekt haqida" className="h-full">
            <div className="space-y-6">
              <p className="prose-text m-0 text-base text-ink">{o.description}</p>
              {o.historicalSignificance && (
                <InfoBlock icon={<StarOutlined />} title="Tarixiy ahamiyati" accent>{o.historicalSignificance}</InfoBlock>
              )}
              {o.methodicalRecommendations && (
                <InfoBlock icon={<BulbOutlined />} title="O‘qituvchi uchun metodik tavsiyalar">{o.methodicalRecommendations}</InfoBlock>
              )}
            </div>
          </Section>
        </div>
        <div className="space-y-6">
          <FactList o={o} />
          <Card title="Bog‘langan tarixiy manbalar">
            <List
              dataSource={o.sources}
              locale={{ emptyText: 'Bog‘langan manba yo‘q' }}
              renderItem={(s) => (
                <List.Item>
                  <Link to={`${sources}/${s.slug}`}>{s.title}</Link>
                  <Tag>{SOURCE_TYPE[s.type as SourceType]}</Tag>
                </List.Item>
              )}
            />
          </Card>
          {inApp && user && (
            <Card title="Obyektga oid topshiriqlar">
              <List
                dataSource={o.assignments}
                locale={{ emptyText: 'Topshiriqlar yo‘q' }}
                renderItem={(a) => (
                  <List.Item>
                    <Link to={`/app/assignments/${a.id}`}>{a.title}</Link>
                    <Tag>{ASSIGNMENT_TYPE[a.type as AssignmentType]}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      </div>
      {/* Topshiriqlar butun kenglikda — yon ustun qisqa bo'lgani uchun o'ng tomonda bo'sh joy qolmasin */}
      <Section title="Pedagogik topshiriqlar" extra={o.tasks.length > 0 && <span className="text-sm text-muted">{o.tasks.length} ta</span>}>
        {o.tasks.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Topshiriqlar biriktirilmagan" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {o.tasks.map((t, i) => <TaskCard key={t.id} task={t} index={i} />)}
          </div>
        )}
        {!user && <Alert className="mt-4" type="info" showIcon message={<>Topshiriqlarni bajarish uchun <Link to={`/login?next=${encodeURIComponent(`/app/museum/${o.slug}`)}`}>tizimga kiring</Link>.</>} />}
      </Section>
      <PhotoGallery o={o} sourcesPath={sources} />
      {inApp && isStudent && <ObjectWorkPanel o={o} />}
      {inApp && isStaff && (
        <Card title="Talabalar ishlari">
          <List
            loading={responses.isLoading}
            dataSource={responses.data ?? []}
            locale={{ emptyText: 'Topshirilgan ishlar yo‘q' }}
            renderItem={(r) => (
              <List.Item extra={<StatusTag map={WORK_STATUS} value={r.status} />}>
                <List.Item.Meta title={<Link to={`/app/museum/responses/${r.id}`}>{r.student?.fullName}</Link>} description={fmtDateTime(r.submittedAt)} />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};
