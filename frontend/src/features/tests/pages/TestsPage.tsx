import { CheckCircleFilled, DeleteOutlined, EditOutlined, FileTextOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Popconfirm, Space, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { testsService } from '@/services/learning.service';
import type { TestListItem } from '@/types/api';
import { fmtDate } from '@/utils/format';
import { percentColor } from './TestPage';

export default function TestsPage() {
  const { isStaff } = useAuth();
  const query = useQuery({ queryKey: ['tests'], queryFn: testsService.list });
  return (
    <>
      <PageHeader
        title="Topshiriqlar"
        description={isStaff
          ? 'Test faylini yuklang va to‘g‘ri javoblarni belgilang — talabalar faylni o‘qib, javoblar varag‘ida belgilaydi.'
          : 'Testni oching: chapda savollar fayli, o‘ngda javoblar varag‘i. Har bir testni bir marta topshirasiz.'}
        extra={isStaff && <Link to="/app/assignments/new"><Button type="primary" icon={<PlusOutlined />}>Test yuklash</Button></Link>}
      />
      <QueryState query={query} isEmpty={(d) => d.length === 0} empty={isStaff ? 'Hali test yuklanmagan.' : 'Hozircha topshiriqlar yo‘q.'}>
        {(d) => (isStaff ? <StaffList items={d} /> : <StudentList items={d} />)}
      </QueryState>
    </>
  );
}

const Row = ({ t }: { t: TestListItem }) => (
  <Link to={`/app/assignments/${t.id}`} className="group flex items-center gap-4 rounded-xl border border-solid border-line bg-white px-4 py-3 no-underline hover:border-primary">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${t.myAttempt ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-soft text-primary'}`}>
      {t.myAttempt ? <CheckCircleFilled /> : <FileTextOutlined />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-medium text-ink group-hover:text-primary">{t.title}</span>
      <span className="block truncate text-sm text-muted">{t.source?.title ?? 'Umumiy test'} · {t.questionCount} ta savol</span>
    </span>
    {t.myAttempt ? (
      <b className="shrink-0" style={{ color: percentColor(t.myAttempt.percent) }}>
        {t.myAttempt.correctCount}/{t.myAttempt.total}
      </b>
    ) : (
      <span className="shrink-0 text-sm font-medium text-primary">Boshlash <RightOutlined /></span>
    )}
  </Link>
);

const StudentList = ({ items }: { items: TestListItem[] }) => {
  const pending = items.filter((t) => !t.myAttempt);
  const done = items.filter((t) => t.myAttempt);
  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Bajarilmagan ({pending.length})</h2>
          <div className="grid gap-3 md:grid-cols-2">{pending.map((t) => <Row key={t.id} t={t} />)}</div>
        </section>
      )}
      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Topshirilgan ({done.length})</h2>
          <div className="grid gap-3 md:grid-cols-2">{done.map((t) => <Row key={t.id} t={t} />)}</div>
        </section>
      )}
    </div>
  );
};

const StaffList = ({ items }: { items: TestListItem[] }) => {
  const { user, isAdmin } = useAuth();
  const notify = useNotify();
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: testsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      notify.success('Test o‘chirildi');
    },
    onError: (e) => notify.error(e),
  });
  return (
    <Card>
      <Table
        rowKey="id"
        dataSource={items}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        scroll={{ x: 800 }}
        columns={[
          { title: 'Test', render: (_, t) => <Link to={`/app/assignments/${t.id}`}>{t.title}</Link> },
          { title: 'Mavzu', width: 260, render: (_, t) => t.source?.title ?? '—' },
          { title: 'Savollar', width: 100, dataIndex: 'questionCount' },
          { title: 'Topshirganlar', width: 130, render: (_, t) => <Link to={`/app/assignments/${t.id}`}>{t.attemptCount}</Link> },
          { title: 'Holat', width: 120, render: (_, t) => (t.isPublished ? <Tag color="green">Ochiq</Tag> : <Tag>Yashirin</Tag>) },
          { title: 'Yuklangan', width: 120, render: (_, t) => fmtDate(t.createdAt) },
          {
            title: '',
            width: 100,
            render: (_, t) =>
              (isAdmin || t.createdById === user?.id) && (
                <Space>
                  <Link to={`/app/assignments/${t.id}/edit`}><Button size="small" icon={<EditOutlined />} aria-label="Tahrirlash" /></Link>
                  <Popconfirm title="Testni o‘chirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => remove.mutate(t.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} aria-label="O‘chirish" />
                  </Popconfirm>
                </Space>
              ),
          },
        ]}
      />
    </Card>
  );
};
