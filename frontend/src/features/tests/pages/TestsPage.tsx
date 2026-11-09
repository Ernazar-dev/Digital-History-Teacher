import { CheckCircleFilled, DeleteOutlined, EditOutlined, FileTextOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Popconfirm, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { testsService } from '@/services/learning.service';
import type { TestListItem } from '@/types/api';
import { fmtDate } from '@/utils/format';
import { percentColor } from './TestPage';

export default function TestsPage() {
  const { t } = useTranslation();
  const { isStaff: staff } = useAuth();
  // Saytni ko'rish rejimida sahifa talaba ko'rinishida chiqadi
  const siteView = useSiteViewStore((s) => s.siteView);
  const isStaff = staff && !siteView;
  const query = useQuery({ queryKey: ['tests'], queryFn: testsService.list });
  return (
    <>
      <PageHeader
        title={t('tests.title')}
        description={isStaff ? t('tests.descStaff') : t('tests.descStudent')}
        extra={isStaff && <Link to="/app/assignments/new"><Button type="primary" icon={<PlusOutlined />}>{t('tests.upload')}</Button></Link>}
      />
      <QueryState query={query} isEmpty={(d) => d.length === 0} empty={isStaff ? t('tests.emptyStaff') : t('tests.emptyStudent')}>
        {(d) => (isStaff ? <StaffList items={d} /> : <StudentList items={d} />)}
      </QueryState>
    </>
  );
}

const Row = ({ t: test }: { t: TestListItem }) => {
  const { t } = useTranslation();
  return (
  <Link to={`/app/assignments/${test.id}`} className="group flex items-center gap-4 rounded-xl border border-solid border-line bg-white px-4 py-3 no-underline hover:border-primary">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${test.myAttempt ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-soft text-primary'}`}>
      {test.myAttempt ? <CheckCircleFilled /> : <FileTextOutlined />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-medium text-ink group-hover:text-primary">{test.title}</span>
      <span className="block truncate text-sm text-muted">{test.source?.title ?? t('dashboard.generalTest')} · {t('dashboard.questionsN', { n: test.questionCount })}</span>
    </span>
    {test.myAttempt ? (
      <b className="shrink-0" style={{ color: percentColor(test.myAttempt.percent) }}>
        {test.myAttempt.correctCount}/{test.myAttempt.total}
      </b>
    ) : (
      <span className="shrink-0 text-sm font-medium text-primary">{t('topic.start')} <RightOutlined /></span>
    )}
  </Link>
  );
};

const StudentList = ({ items }: { items: TestListItem[] }) => {
  const { t } = useTranslation();
  const pending = items.filter((x) => !x.myAttempt);
  const done = items.filter((x) => x.myAttempt);
  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('tests.pending', { n: pending.length })}</h2>
          <div className="grid gap-3 md:grid-cols-2">{pending.map((x) => <Row key={x.id} t={x} />)}</div>
        </section>
      )}
      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('tests.done', { n: done.length })}</h2>
          <div className="grid gap-3 md:grid-cols-2">{done.map((x) => <Row key={x.id} t={x} />)}</div>
        </section>
      )}
    </div>
  );
};

const StaffList = ({ items }: { items: TestListItem[] }) => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const siteView = useSiteViewStore((s) => s.siteView);
  const notify = useNotify();
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: testsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      notify.success(t('tests.removed'));
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
          { title: t('tests.colTest'), render: (_, r) => <Link to={`/app/assignments/${r.id}`}>{r.title}</Link> },
          { title: t('tests.colTopic'), width: 260, render: (_, r) => r.source?.title ?? '—' },
          { title: t('tests.colQuestions'), width: 100, dataIndex: 'questionCount' },
          { title: t('tests.colAttempts'), width: 130, render: (_, r) => <Link to={`/app/assignments/${r.id}`}>{r.attemptCount}</Link> },
          { title: t('tests.colStatus'), width: 120, render: (_, r) => (r.isPublished ? <Tag color="green">{t('tests.open')}</Tag> : <Tag>{t('tests.hidden')}</Tag>) },
          { title: t('tests.colUploaded'), width: 120, render: (_, r) => fmtDate(r.createdAt) },
          {
            title: '',
            width: 100,
            render: (_, r) =>
              !siteView && (isAdmin || r.createdById === user?.id) && (
                <Space>
                  <Link to={`/app/assignments/${r.id}/edit`}><Button size="small" icon={<EditOutlined />} aria-label={t('tests.edit')} /></Link>
                  <Popconfirm title={t('tests.removeQ')} okText={t('tests.yes')} cancelText={t('tests.no')} onConfirm={() => remove.mutate(r.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} aria-label={t('tests.remove')} />
                  </Popconfirm>
                </Space>
              ),
          },
        ]}
      />
    </Card>
  );
};
