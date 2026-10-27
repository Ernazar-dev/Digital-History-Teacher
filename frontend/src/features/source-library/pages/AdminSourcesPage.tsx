import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Popconfirm, Select, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { useUrlState } from '@/hooks/useUrlState';
import { SOURCE_TYPE, toOptions } from '@/lib/labels';
import { sourcesService, type SourceFilters } from '@/services/catalog.service';
import { fmtDate } from '@/utils/format';

export default function AdminSourcesPage() {
  const [f, setF] = useUrlState<SourceFilters & Record<string, string | number | undefined>>(['page']);
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['sources', 'admin', f], queryFn: () => sourcesService.list({ ...f, pageSize: 20 }), placeholderData: keepPreviousData });
  const remove = useMutation({
    mutationFn: sourcesService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      notify.success('Manba o‘chirildi');
    },
    onError: (e) => notify.error(e),
  });

  return (
    <>
      <PageHeader
        title="Manbalar"
        description="Manba qo‘shing yoki tahrirlang — saqlangan manba o‘quvchilarga darhol ko‘rinadi."
        extra={<Link to="/app/admin/sources/new"><Button type="primary" icon={<PlusOutlined />}>Yangi manba</Button></Link>}
      />
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-[2fr_1fr]">
          <Input.Search placeholder="Qidirish" allowClear defaultValue={f.q} onSearch={(v) => setF({ q: v, page: 1 })} />
          <Select allowClear placeholder="Turi" value={f.type} options={toOptions(SOURCE_TYPE)} onChange={(v) => setF({ type: v, page: 1 })} />
        </div>
        <QueryState query={q}>
          {(d) => (
            <Table
              rowKey="id"
              dataSource={d.data}
              scroll={{ x: 900 }}
              pagination={{ current: f.page ?? 1, pageSize: 20, total: d.meta.total, onChange: (page) => setF({ page }), showSizeChanger: false }}
              columns={[
                { title: 'Nomi', render: (_, s) => <Link to={`/app/sources/${s.slug}`}>{s.title}</Link> },
                { title: 'Turi', width: 150, render: (_, s) => SOURCE_TYPE[s.type] },
                { title: 'Davr', width: 200, render: (_, s) => s.period?.name ?? '—' },
                { title: 'Yangilangan', width: 120, render: (_, s) => fmtDate(s.updatedAt) },
                {
                  title: 'Amallar',
                  width: 120,
                  render: (_, s) => (
                    <Space>
                      <Link to={`/app/admin/sources/${s.id}/edit`}><Button size="small" icon={<EditOutlined />} aria-label="Tahrirlash" /></Link>
                      <Popconfirm title="Manbani o‘chirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => remove.mutate(s.id)}>
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
