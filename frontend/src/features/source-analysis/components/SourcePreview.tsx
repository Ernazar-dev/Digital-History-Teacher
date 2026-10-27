import { ExportOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { SOURCE_TYPE } from '@/lib/labels';
import { sourcesService } from '@/services/catalog.service';
import { MaterialViewer } from '@/features/source-library/components/MaterialViewer';
import { SourceContent, sourceMaterials } from '@/features/source-library/components/SourceSections';
import { SourceMedia } from '@/features/source-library/components/SourceMedia';

/**
 * Tahlil paytida manbaning o'zi (raqamli nusxa va matn variantlari) ko'z oldida turadi.
 * Ekspert izohlari (ishonchlilik, cheklovlar) atayin ko'rsatilmaydi — talaba ularni o'zi aniqlashi kerak.
 */
export const SourcePreview = ({ slug }: { slug: string }) => {
  const q = useQuery({ queryKey: ['source', slug], queryFn: () => sourcesService.get(slug) });
  if (q.isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!q.data) return <p className="m-0 text-muted">Manbani yuklab bo‘lmadi.</p>;
  const s = q.data;
  const materials = sourceMaterials(s);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tag color="blue" className="m-0">{SOURCE_TYPE[s.type]}</Tag>
        <Link to={`/app/sources/${s.slug}`} target="_blank" className="text-sm">
          Katalog kartasi <ExportOutlined />
        </Link>
      </div>
      {materials.length > 0 ? <MaterialViewer files={materials} /> : <SourceMedia s={s} />}
      {(s.description || s.variants.length > 0 || materials.length === 0) && <SourceContent s={s} />}
    </div>
  );
};
