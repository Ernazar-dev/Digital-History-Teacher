import {
  BulbOutlined, CheckCircleOutlined, ExportOutlined, LinkOutlined, ReadOutlined, WarningOutlined,
} from '@ant-design/icons';
import { Button, Empty, List, Tabs, Tag } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAreaPath } from '@/hooks/useAreaPath';
import { ASSIGNMENT_TYPE, OBJECT_TYPE, SOURCE_TYPE, VARIANT } from '@/lib/labels';
import type { AssignmentType, ObjectType, Source } from '@/types/api';
import { fileKind } from '../files';
import { MaterialViewer } from './MaterialViewer';
import { SourceMedia } from './SourceMedia';

const VARIANT_COLOR = { ORIGINAL: 'blue', SCHOLARLY_COMMENTARY: 'purple', EDUCATIONAL_ADAPTATION: 'green' } as const;

/** Matnni bo'sh qatorlar bo'yicha xatboshilarga ajratadi */
const Paragraphs = ({ text }: { text: string }) => (
  <div className="max-w-prose space-y-3">
    {text.split(/\n\s*\n/).map((p, i) => <p key={i} className="m-0 whitespace-pre-line leading-relaxed">{p.trim()}</p>)}
  </div>
);

const isImageFile = (s: Source) => Boolean(s.mediaFile && fileKind(s.mediaFile) === 'image');

/** O'quvchi ko'radigan materiallar: biriktirilgan fayllar + (eski yozuvlarda) rasm bo'lmagan asosiy fayl */
export const sourceMaterials = (s: Source) => [
  ...(s.mediaFile && !isImageFile(s) && !s.files.some((f) => f.id === s.mediaFile!.id) ? [s.mediaFile] : []),
  ...s.files,
];

const hasText = (s: Source) => s.variants.length > 0 || Boolean(s.description);

/** Asl manba, ilmiy sharh va ta'limiy moslashtirish aniq ajratilgan holda ko'rsatiladi */
export const SourceContent = ({ s }: { s: Source }) =>
  !hasText(s) ? (
    <Empty description="Matn variantlari hali qo‘shilmagan" />
  ) : (
    <Tabs
      items={[
        ...(s.description ? [{ key: 'desc', label: 'Umumiy tavsif', children: <Paragraphs text={s.description} /> }] : []),
        ...s.variants.map((v, i) => ({
          key: `${v.kind}-${i}`,
          label: VARIANT[v.kind].label,
          children: (
            <div>
              <Tag color={VARIANT_COLOR[v.kind]}>{VARIANT[v.kind].hint}</Tag>
              <h4 className="mb-3 mt-3 text-base font-semibold">{v.title}</h4>
              <Paragraphs text={v.content} />
              {v.citation && <p className="mb-0 mt-4 text-sm text-muted">Manba: {v.citation}</p>}
            </div>
          ),
        })),
      ]}
    />
  );

/** Oq fonli, sarlavhali sodda blok */
const Block = ({ title, icon, children, className = '' }: { title: string; icon?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`rounded-2xl border border-solid border-line bg-white p-5 md:p-6 ${className}`}>
    <h2 className="m-0 mb-4 flex items-center gap-2 text-base font-semibold">
      {icon && <span className="text-primary">{icon}</span>}
      {title}
    </h2>
    {children}
  </section>
);

/** Matnli kartochka (ishonchlilik, cheklovlar va h.k.) — bo'sh bo'lsa ko'rsatilmaydi */
const NoteCard = ({ title, icon, tone, text }: { title: string; icon: ReactNode; tone: string; text?: string | null }) =>
  text ? (
    <div className="rounded-2xl border border-solid border-line bg-white p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
        {title}
      </div>
      <p className="m-0 leading-relaxed text-ink/85">{text}</p>
    </div>
  ) : null;

/** Pasportdagi bitta qator — qiymat bo'lmasa chiqmaydi */
const Fact = ({ label, children }: { label: string; children?: ReactNode }) =>
  children ? (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-0 border-b border-solid border-line py-3 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="m-0 text-sm leading-relaxed">{children}</dd>
    </div>
  ) : null;

/** Yuqori qism: chapda muqova / raqamli nusxa, o'ngda manba pasporti. Media bo'lmasa — faqat ixcham pasport */
export const SourceOverview = ({ s }: { s: Source }) => {
  const media = { ...s, mediaFile: isImageFile(s) ? s.mediaFile : null };
  const hasMedia = Boolean(media.mediaFile || s.mediaUrl || s.embedUrl);
  const materials = sourceMaterials(s).length;
  const passport = (
    <Block title="Manba pasporti">
      <dl className={hasMedia ? 'm-0' : 'm-0 grid gap-x-8 md:grid-cols-2 xl:grid-cols-3'}>
        <Fact label="Turi">{SOURCE_TYPE[s.type]}{s.format ? <div className="text-muted">{s.format}</div> : null}</Fact>
        <Fact label="Sana">{s.dateLabel}</Fact>
        <Fact label="Davr">{s.period?.name}</Fact>
        <Fact label="Muallif">{s.author}</Fact>
        <Fact label="Kelib chiqishi">{s.origin}</Fact>
        <Fact label="Saqlanish joyi">{s.repository}</Fact>
        <Fact label="Mavzular">{s.topics.length ? s.topics.map((t) => <Tag key={t.id} className="mb-1">{t.name}</Tag>) : null}</Fact>
        <Fact label="Materiallar">{materials ? `${materials} ta fayl — pastda ochiladi` : null}</Fact>
        <Fact label="Mualliflik huquqi">{s.copyright}</Fact>
      </dl>
      {s.originalUrl && (
        <a href={s.originalUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block">
          <Button block icon={<ExportOutlined />}>Asl manbani ochish</Button>
        </a>
      )}
    </Block>
  );
  if (!hasMedia) return passport;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <figure className="m-0 overflow-hidden rounded-2xl border border-solid border-line bg-white">
        <div className="flex min-h-[260px] items-center justify-center bg-canvas p-4 [&_.ant-image]:block [&_img]:mx-auto [&_img]:max-h-[520px] [&_img]:object-contain">
          <SourceMedia s={media} />
        </div>
        {(s.license || s.originalUrl) && (
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-0 border-t border-solid border-line px-4 py-3 text-xs text-muted">
            <span>{s.license}</span>
            {s.originalUrl && (
              <a href={s.originalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                Asl manba <ExportOutlined />
              </a>
            )}
          </figcaption>
        )}
      </figure>

      {passport}
    </div>
  );
};

/** «Nomi — https://...» qatorini matn va havolaga ajratadi */
const parseReference = (line: string) => {
  const m = line.match(/^(.*?)\s*[—–-]\s*(https?:\/\/\S+)\s*$/);
  return m ? { text: m[1], url: m[2] } : { text: line, url: null };
};

const References = ({ text }: { text?: string | null }) => {
  const items = (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean).map(parseReference);
  if (items.length === 0) return null;
  return (
    <Block title="Foydalanilgan manbalar" icon={<LinkOutlined />}>
      <ol className="m-0 space-y-2 pl-5 text-sm leading-relaxed">
        {items.map((r, i) => (
          <li key={i} className="pl-1">
            {r.url ? (
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-wrap items-baseline gap-1">
                {r.text} <ExportOutlined className="text-xs" />
              </a>
            ) : (
              r.text
            )}
          </li>
        ))}
      </ol>
    </Block>
  );
};

const PracticalTasks = ({ s, inApp }: { s: Source; inApp: boolean }) => {
  const tasks = (s.practicalTasks ?? '').split('\n').map((t) => t.trim()).filter(Boolean);
  const linked = inApp ? s.assignments : [];
  if (tasks.length === 0 && linked.length === 0) return null;
  return (
    <Block title="Manba asosidagi amaliy topshiriqlar" icon={<BulbOutlined />}>
      {tasks.length > 0 && (
        <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
          {tasks.map((t, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-canvas p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ol>
      )}
      {linked.length > 0 && (
        <div className={tasks.length ? 'mt-5 border-0 border-t border-solid border-line pt-4' : ''}>
          <div className="mb-2 text-sm font-medium text-muted">O‘qituvchi bergan topshiriqlar</div>
          <List
            size="small"
            dataSource={linked}
            renderItem={(a) => (
              <List.Item>
                <Link to={`/app/assignments/${a.id}`}>{a.title}</Link>
                <Tag>{ASSIGNMENT_TYPE[a.type as AssignmentType]}</Tag>
              </List.Item>
            )}
          />
        </div>
      )}
    </Block>
  );
};

/** Pastki qism: mazmun, ishonchlilik, o'qitishda qo'llash, topshiriqlar, adabiyotlar */
export const SourceDetails = ({ s, inApp }: { s: Source; inApp: boolean }) => {
  const { museum } = useAreaPath();
  const materials = sourceMaterials(s);
  return (
    <div className="space-y-6">
      <Block title="Manba haqida" icon={<ReadOutlined />}>
        {materials.length > 0 && <MaterialViewer files={materials} />}
        {hasText(s) && <div className={materials.length ? 'mt-6' : ''}><SourceContent s={s} /></div>}
        {materials.length === 0 && !hasText(s) && <Empty description="Bu manbaga hali material yuklanmagan" />}
      </Block>

      {(s.reliabilityNotes || s.limitations) && (
        <div className="grid gap-4 md:grid-cols-2">
          <NoteCard title="Ishonchliligi" icon={<CheckCircleOutlined />} tone="bg-green-50 text-green-700" text={s.reliabilityNotes} />
          <NoteCard title="Cheklovlari" icon={<WarningOutlined />} tone="bg-amber-50 text-amber-700" text={s.limitations} />
        </div>
      )}

      {(s.teachingUse || s.methodicalRecommendations) && (
        <div className="grid gap-4 md:grid-cols-2">
          <NoteCard title="Darsda qo‘llash" icon={<ReadOutlined />} tone="bg-primary-soft text-primary" text={s.teachingUse} />
          <NoteCard title="Metodik tavsiyalar" icon={<BulbOutlined />} tone="bg-primary-soft text-primary" text={s.methodicalRecommendations} />
        </div>
      )}

      <PracticalTasks s={s} inApp={inApp} />

      {s.virtualObjects.length > 0 && (
        <Block title="Bog‘langan 3D/360° obyektlar">
          <List
            dataSource={s.virtualObjects}
            renderItem={(o) => (
              <List.Item>
                <Link to={`${museum}/${o.slug}`}>{o.title}</Link>
                <Tag>{OBJECT_TYPE[o.type as ObjectType]}</Tag>
              </List.Item>
            )}
          />
        </Block>
      )}

      <References text={s.references} />
    </div>
  );
};
