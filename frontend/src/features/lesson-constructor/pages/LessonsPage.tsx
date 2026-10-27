import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Select, Table } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { toOptions, WORK_STATUS } from '@/lib/labels';
import { lessonsService } from '@/services/learning.service';
import type { WorkStatus } from '@/types/api';
import { fmtDateTime } from '@/utils/format';

export default function LessonsPage() {
  const { isStudent, user } = useAuth();
  const [status, setStatus] = useState<WorkStatus>();
  const [q, setQ] = useState('');
  const query = useQuery({ queryKey: ['lessons', status, q], queryFn: () => lessonsService.list({ status, q: q || undefined }) });
  return (
    <>
      <PageHeader
        title="Dars ishlanmalari"
        description={isStudent ? 'Raqamli tarixiy manbalar asosida mustaqil loyihalagan darslaringiz.' : 'Talabalar topshirgan dars ishlanmalari va ekspertiza.'}
        extra={<Link to="/app/lessons/new"><Button type="primary" icon={<PlusOutlined />}>Yangi dars ishlanmasi</Button></Link>}
      />
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input.Search placeholder="Sarlavha bo‘yicha qidirish" allowClear onSearch={setQ} />
          <Select allowClear placeholder="Holati" value={status} onChange={setStatus} options={toOptions(WORK_STATUS)} />
        </div>
        <QueryState
          query={query}
          isEmpty={(d) => d.data.length === 0}
          empty="Dars ishlanmalari yo‘q"
          emptyAction={<Link to="/app/lessons/new"><Button type="primary">Birinchi ishlanmani yaratish</Button></Link>}
        >
          {(d) => (
            <Table
              rowKey="id"
              dataSource={d.data}
              scroll={{ x: 900 }}
              columns={[
                {
                  title: 'Sarlavha',
                  render: (_, l) => (
                    <Link to={l.author.id === user?.id && ['DRAFT', 'RETURNED'].includes(l.status) ? `/app/lessons/${l.id}/edit` : `/app/lessons/${l.id}`}>{l.title}</Link>
                  ),
                },
                { title: 'Mavzu', dataIndex: 'topic' },
                { title: 'Sinf', width: 80, dataIndex: 'gradeLevel' },
                ...(!isStudent ? [{ title: 'Muallif', width: 160, render: (_: unknown, l: (typeof d.data)[number]) => l.author.fullName }] : []),
                { title: 'Holat', width: 200, render: (_, l) => <StatusTag map={WORK_STATUS} value={l.status} /> },
                { title: 'Versiya', width: 80, dataIndex: 'currentVersion' },
                { title: 'Ball', width: 70, render: (_, l) => l.score ?? '—' },
                { title: 'Yangilangan', width: 150, render: (_, l) => fmtDateTime(l.updatedAt) },
              ]}
            />
          )}
        </QueryState>
      </Card>
    </>
  );
}
