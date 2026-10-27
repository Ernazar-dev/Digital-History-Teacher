import { CheckOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Drawer, Empty, Skeleton, Tag } from 'antd';
import { useState } from 'react';
import { SourcePreview } from '@/features/source-analysis/components/SourcePreview';
import { OBJECT_TYPE, SOURCE_TYPE } from '@/lib/labels';
import { catalogService, sourcesService } from '@/services/catalog.service';
import { museumService } from '@/services/museum.service';
import type { ObjectType } from '@/types/api';

interface Props {
  topicId: string;
  addedSourceIds: string[];
  addedObjectIds: string[];
  onAddSource: (id: string, title: string) => void;
  onAddObject: (id: string, title: string) => void;
}

/**
 * Hujjat, 3-modul: talaba mavzuni tanlaganda platforma unga shu mavzuga oid manbalarni
 * (fotosuratlar, matnlar, nashrlar) va davrga oid 3D/360° obyektlarni taklif qiladi.
 * Tanlov talabaning o'zida qoladi — hech narsa avtomatik qo'shilmaydi.
 */
export const TopicMaterials = ({ topicId, addedSourceIds, addedObjectIds, onAddSource, onAddObject }: Props) => {
  const [preview, setPreview] = useState<{ slug: string; title: string }>();
  const topics = useQuery({ queryKey: ['topics', 'all'], queryFn: () => catalogService.topics() });
  const topic = topics.data?.find((t) => t.id === topicId);
  const sources = useQuery({
    queryKey: ['topic-materials', topicId],
    queryFn: () => sourcesService.list({ topicId, status: 'PUBLISHED', pageSize: 50 }),
  });
  const objects = useQuery({
    queryKey: ['topic-objects', topic?.periodId],
    queryFn: () => museumService.list({ periodId: topic!.periodId!, pageSize: 30 }),
    enabled: Boolean(topic?.periodId),
  });

  const sourceList = sources.data?.data ?? [];
  const objectList = objects.data?.data ?? [];

  return (
    <Card
      size="small"
      className="mb-6"
      title={`«${topic?.name ?? 'Mavzu'}» mavzusiga oid materiallar`}
      extra={<span className="hidden text-sm text-muted sm:inline">Darsingizga mosini o‘zingiz saralang</span>}
    >
      {sources.isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : sourceList.length === 0 && objectList.length === 0 ? (
        <Empty description="Bu mavzuga hali materiallar biriktirilmagan — quyidagi qidiruvdan foydalaning" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sourceList.map((s) => {
            const added = addedSourceIds.includes(s.id);
            return (
              <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-solid border-line p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag color="blue" className="m-0">{SOURCE_TYPE[s.type]}</Tag>
                  {s.dateLabel && <span className="text-xs text-muted">{s.dateLabel}</span>}
                </div>
                <b className="leading-snug">{s.title}</b>
                <p className="m-0 line-clamp-2 text-sm text-muted">{s.summary}</p>
                <div className="mt-auto flex gap-2">
                  <Button size="small" icon={<EyeOutlined />} onClick={() => setPreview({ slug: s.slug, title: s.title })}>Ko‘rish</Button>
                  <Button
                    size="small"
                    type={added ? 'default' : 'primary'}
                    disabled={added}
                    icon={added ? <CheckOutlined /> : <PlusOutlined />}
                    onClick={() => onAddSource(s.id, s.title)}
                  >
                    {added ? 'Qo‘shilgan' : 'Darsga qo‘shish'}
                  </Button>
                </div>
              </div>
            );
          })}
          {objectList.map((o) => {
            const added = addedObjectIds.includes(o.id);
            return (
              <div key={o.id} className="flex flex-col gap-2 rounded-lg border border-solid border-line p-3">
                <Tag color="purple" className="m-0 self-start">{OBJECT_TYPE[o.type as ObjectType]}</Tag>
                <b className="leading-snug">{o.title}</b>
                <p className="m-0 line-clamp-2 text-sm text-muted">{o.description}</p>
                <div className="mt-auto">
                  <Button
                    size="small"
                    type={added ? 'default' : 'primary'}
                    disabled={added}
                    icon={added ? <CheckOutlined /> : <PlusOutlined />}
                    onClick={() => onAddObject(o.id, o.title)}
                  >
                    {added ? 'Qo‘shilgan' : 'Darsga qo‘shish'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Drawer open={!!preview} onClose={() => setPreview(undefined)} title={preview?.title} width="min(720px, 100vw)" destroyOnClose>
        {preview && <SourcePreview slug={preview.slug} />}
      </Drawer>
    </Card>
  );
};
