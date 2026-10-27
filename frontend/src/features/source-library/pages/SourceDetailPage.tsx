import { DiffOutlined, EditOutlined, FileSearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { useNotify } from '@/hooks/useNotify';
import { analysisService, sourcesService } from '@/services/catalog.service';
import type { Source } from '@/types/api';
import { useCompareStore } from '../compare.store';
import { CompareTray } from '../components/CompareTray';
import { SourceDetails, SourceOverview } from '../components/SourceSections';

export default function SourceDetailPage() {
  const { id = '' } = useParams();
  const query = useQuery({ queryKey: ['source', id], queryFn: () => sourcesService.get(id) });
  return <QueryState query={query}>{(s) => <SourceView s={s} />}</QueryState>;
}

const SourceView = ({ s }: { s: Source }) => {
  const { user, isStudent, isStaff, isAdmin } = useAuth();
  const { inApp } = useAreaPath();
  const notify = useNotify();
  const navigate = useNavigate();
  const { ids, toggle } = useCompareStore();
  const analyze = useMutation({
    mutationFn: () => analysisService.create(s.id),
    onSuccess: (a) => navigate(`/app/analysis/${a.id}`),
    onError: (e) => notify.error(e),
  });
  const canEdit = isAdmin || (isStaff && s.createdBy?.id === user?.id);

  const actions = inApp ? (
    <>
      {isStudent && s.status === 'PUBLISHED' && (
        <Button icon={<DiffOutlined />} type={ids.includes(s.id) ? 'primary' : 'default'} onClick={() => toggle(s.id)}>
          {ids.includes(s.id) ? 'Taqqoslashda' : 'Taqqoslashga qo‘shish'}
        </Button>
      )}
      {isStudent && s.status === 'PUBLISHED' && (
        <Button type="primary" icon={<FileSearchOutlined />} loading={analyze.isPending} onClick={() => analyze.mutate()}>
          Tahlil qilish
        </Button>
      )}
      {canEdit && (
        <Link to={`/app/admin/sources/${s.id}/edit`}>
          <Button icon={<EditOutlined />}>Tahrirlash</Button>
        </Link>
      )}
    </>
  ) : !user ? (
    <Link to={`/login?next=${encodeURIComponent(`/app/sources/${s.slug}`)}`}>
      <Button type="primary">Tahlil qilish uchun kiring</Button>
    </Link>
  ) : (
    <Link to={`/app/sources/${s.slug}`}><Button type="primary">Kabinetda ochish</Button></Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.title}
        description={s.summary}
        extra={actions}
      />
      <SourceOverview s={s} />
      <SourceDetails s={s} inApp={inApp} />
      {inApp && isStudent && <CompareTray />}
    </div>
  );
};
