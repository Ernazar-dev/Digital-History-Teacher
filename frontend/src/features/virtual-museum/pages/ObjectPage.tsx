import { EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Tag } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { EmbedViewer } from '@/components/common/EmbedViewer';
import { PageHeader } from '@/components/common/PageHeader';
import { Section } from '@/components/common/Section';
import { DeleteButton } from '@/components/common/DeleteButton';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { OBJECT_TYPE } from '@/lib/labels';
import { museumService } from '@/services/museum.service';
import type { VirtualObject } from '@/types/api';

export default function ObjectPage() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['object', id], queryFn: () => museumService.get(id) });
  return <QueryState query={q}>{(o) => <ObjectView o={o} />}</QueryState>;
}

/** Obyekt sahifasi — admin panelda kiritiladigan uch narsa: nomi, 3D/360° ko'rinishi va obyekt haqida ma'lumot */
const ObjectView = ({ o }: { o: VirtualObject }) => {
  const { isAdmin } = useAuth();
  const { inApp } = useAreaPath();

  return (
    <div className="space-y-6">
      <PageHeader
        title={o.title}
        tag={<Tag color="blue">{OBJECT_TYPE[o.type]}</Tag>}
        extra={inApp && isAdmin && (
          <span className="flex gap-2">
            <Link to={`/app/admin/objects/${o.id}/edit`}><Button icon={<EditOutlined />}>Tahrirlash</Button></Link>
            <DeleteButton what="Obyekt" onDelete={() => museumService.remove(o.id)} invalidate={['objects', 'object']} backTo="/app/museum" />
          </span>
        )}
      />
      <EmbedViewer title={o.title} embedUrl={o.embedUrl} externalUrl={o.externalUrl} thumbnailUrl={o.thumbnailUrl} kind={o.type === 'TOUR_360' ? '360' : '3d'} />
      <Section title="Obyekt haqida">
        <p className="prose-text m-0 whitespace-pre-line text-base text-ink">{o.description}</p>
      </Section>
    </div>
  );
};
