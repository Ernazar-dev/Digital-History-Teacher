import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Select, Table } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import i18n from '@/i18n';
import { toOptions, WORK_STATUS } from '@/lib/labels';
import { courseLabel } from '../lessonForm';
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
        title={i18n.t('lesson.list.title')}
        description={isStudent ? i18n.t('lesson.list.descStudent') : i18n.t('lesson.list.descStaff')}
        extra={<Link to="/app/lessons/new"><Button type="primary" icon={<PlusOutlined />}>{i18n.t('lesson.list.new')}</Button></Link>}
      />
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input.Search placeholder={i18n.t('lesson.list.search')} allowClear onSearch={setQ} />
          <Select allowClear placeholder={i18n.t('lesson.list.statusPh')} value={status} onChange={setStatus} options={toOptions(WORK_STATUS)} />
        </div>
        <QueryState
          query={query}
          isEmpty={(d) => d.data.length === 0}
          empty={i18n.t('lesson.list.empty')}
          emptyAction={<Link to="/app/lessons/new"><Button type="primary">{i18n.t('lesson.list.first')}</Button></Link>}
        >
          {(d) => (
            <Table
              rowKey="id"
              dataSource={d.data}
              scroll={{ x: 900 }}
              columns={[
                {
                  title: i18n.t('lesson.list.colTitle'),
                  render: (_, l) => (
                    <Link to={l.author.id === user?.id && ['DRAFT', 'RETURNED'].includes(l.status) ? `/app/lessons/${l.id}/edit` : `/app/lessons/${l.id}`}>{l.title}</Link>
                  ),
                },
                { title: i18n.t('lesson.list.colTopic'), dataIndex: 'topic' },
                { title: i18n.t('lesson.list.colCourse'), width: 90, render: (_, l) => courseLabel(l.gradeLevel) },
                ...(!isStudent ? [{ title: i18n.t('lesson.list.colAuthor'), width: 160, render: (_: unknown, l: (typeof d.data)[number]) => l.author.fullName }] : []),
                { title: i18n.t('lesson.list.colStatus'), width: 200, render: (_, l) => <StatusTag map={WORK_STATUS} value={l.status} /> },
                { title: i18n.t('lesson.list.colVersion'), width: 80, dataIndex: 'currentVersion' },
                { title: i18n.t('lesson.list.colScore'), width: 70, render: (_, l) => l.score ?? '—' },
                { title: i18n.t('lesson.list.colUpdated'), width: 150, render: (_, l) => fmtDateTime(l.updatedAt) },
              ]}
            />
          )}
        </QueryState>
      </Card>
    </>
  );
}
