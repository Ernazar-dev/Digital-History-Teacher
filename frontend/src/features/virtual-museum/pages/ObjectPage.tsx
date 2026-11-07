import { EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Tag } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { EmbedViewer } from '@/components/common/EmbedViewer';
import { PageHeader } from '@/components/common/PageHeader';
import { Field, Section } from '@/components/common/Section';
import { DeleteButton } from '@/components/common/DeleteButton';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { OBJECT_TYPE, PROVIDER } from '@/lib/labels';
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
  const siteView = useSiteViewStore((s) => s.siteView);
  const { inApp } = useAreaPath();

  return (
    <div className="space-y-6">
      <PageHeader
        title={o.title}
        tag={<Tag color="blue">{OBJECT_TYPE[o.type]}</Tag>}
        extra={inApp && isAdmin && !siteView && (
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
      <Section title="Manba va litsenziya">
        <div className="grid gap-x-8 sm:grid-cols-2">
          <Field label="Platforma">{PROVIDER[o.provider]}</Field>
          <Field label="Muallif / tashkilot">{o.authorOrOrganization}</Field>
          <Field label="Litsenziya">{o.license}</Field>
          <Field label="Asl manba">
            {o.externalUrl && (
              <a href={o.externalUrl} target="_blank" rel="noopener noreferrer" className="break-all">{o.externalUrl}</a>
            )}
          </Field>
        </div>
        {o.termsNote && <p className="m-0 border-t border-line pt-3 text-sm text-muted">{o.termsNote}</p>}
      </Section>
    </div>
  );
};
