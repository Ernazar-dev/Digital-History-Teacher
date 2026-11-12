import { ExportOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, Tag } from 'antd';
import { Link } from 'react-router-dom';
import i18n from '@/i18n';
import { sourcesService } from '@/services/catalog.service';
import { LectureFileView } from './LectureFileView';
import { LectureReader } from './LectureReader';
import { MaterialViewer } from './MaterialViewer';

/** Dars loyihalaş paytida mavzu materiali (ma'ruza yoki taqdimot) yon panelda körinadi */
export const SourcePreview = ({ slug }: { slug: string }) => {
  const q = useQuery({ queryKey: ['source', slug], queryFn: () => sourcesService.get(slug) });
  if (q.isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!q.data) return <p className="m-0 text-muted">{i18n.t('misc.previewFail')}</p>;
  const s = q.data;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {s.bookLabel ? <Tag color="gold" className="m-0">{s.bookLabel}</Tag> : <span />}
        <Link to={`/app/sources/${s.slug}`} target="_blank" className="text-sm">
          {i18n.t('misc.previewPage')} <ExportOutlined />
        </Link>
      </div>
      <p className="m-0 text-muted">{s.summary}</p>
      {/* Ma'ruza — bitta: yuklangan fayl bölsa öşa, bölmasa tayyor matn */}
      {s.lectureFile ? (
        <LectureFileView file={s.lectureFile} />
      ) : s.lectureContent ? (
        <LectureReader content={s.lectureContent} title={s.title} />
      ) : s.presentationFile ? (
        <MaterialViewer files={[s.presentationFile]} />
      ) : (
        <p className="m-0 text-muted">{i18n.t('misc.previewEmpty')}</p>
      )}
    </div>
  );
};
