import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Popconfirm, Space, Switch, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { OBJECT_TYPE, PROVIDER } from '@/lib/labels';
import { museumService } from '@/services/museum.service';

export default function AdminObjectsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['objects', 'admin'], queryFn: () => museumService.list({ pageSize: 100 }) });
  const done = (msg: string) => () => {
    qc.invalidateQueries({ queryKey: ['objects'] });
    notify.success(msg);
  };
  const toggle = useMutation({ mutationFn: (v: { id: string; on: boolean }) => museumService.setActive(v.id, v.on), onSuccess: done('Holat o‘zgartirildi'), onError: (e) => notify.error(e) });
  const remove = useMutation({ mutationFn: museumService.remove, onSuccess: done('Obyekt o‘chirildi'), onError: (e) => notify.error(e) });

  return (
    <>
      <PageHeader
        title="Virtual obyektlar katalogi (3D/360°)"
        description="Sketchfab model sahifasi URL’idan rasmiy embed manzili avtomatik hosil qilinadi. Model identifikatorlarini taxmin bilan kiritmang."
        extra={<Link to="/app/admin/objects/new"><Button type="primary" icon={<PlusOutlined />}>Yangi obyekt</Button></Link>}
      />
      <Card>
        <QueryState query={q}>
          {(d) => (
            <Table
              rowKey="id"
              dataSource={d.data}
              scroll={{ x: 900 }}
              pagination={{ pageSize: 20 }}
              columns={[
                { title: 'Nomi', render: (_, o) => <Space><Link to={`/app/museum/${o.slug}`}>{o.title}</Link></Space> },
                { title: 'Turi', width: 130, render: (_, o) => <Tag>{OBJECT_TYPE[o.type]}</Tag> },
                { title: 'Platforma', width: 140, render: (_, o) => PROVIDER[o.provider] },
                {
                  title: 'Ko‘rinadi',
                  width: 100,
                  render: (_, o) => <Switch checked={o.isActive} loading={toggle.isPending} onChange={(on) => toggle.mutate({ id: o.id, on })} aria-label="Faollik" />,
                },
                {
                  title: 'Amallar',
                  width: 110,
                  render: (_, o) => (
                    <Space>
                      <Link to={`/app/admin/objects/${o.id}/edit`}><Button size="small" icon={<EditOutlined />} aria-label="Tahrirlash" /></Link>
                      <Popconfirm title="Obyektni o‘chirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => remove.mutate(o.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} aria-label="O‘chirish" />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          )}
        </QueryState>
      </Card>
    </>
  );
}
