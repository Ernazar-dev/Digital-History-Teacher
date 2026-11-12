import { EditOutlined, RedoOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Modal, Popconfirm, Progress, Table, Tag } from 'antd';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { MaterialViewer } from '@/features/source-library/components/MaterialViewer';
import { useNotify } from '@/hooks/useNotify';
import { testsService } from '@/services/learning.service';
import type { Test, TestAttemptResult, TestOption } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { AnswerSheet } from '../components/AnswerSheet';

export default function TestPage() {
  const { id = '' } = useParams();
  const { isStaff: staff } = useAuth();
  // Saytni köriş rejimida test talaba körinişida oçiladi
  const siteView = useSiteViewStore((s) => s.siteView);
  const isStaff = staff && !siteView;
  const query = useQuery({ queryKey: ['test', id], queryFn: () => testsService.get(id) });
  return <QueryState query={query}>{(test) => (isStaff ? <StaffView t={test} /> : <StudentView t={test} />)}</QueryState>;
}

export const percentColor = (p: number) => (p >= 86 ? '#059669' : p >= 56 ? '#d97706' : '#dc2626');

const ResultCard = ({ r }: { r: TestAttemptResult }) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center gap-4 rounded-xl bg-canvas p-4">
    <Progress type="circle" size={72} percent={Math.round(r.percent)} strokeColor={percentColor(r.percent)} />
    <div>
      <div className="text-lg font-semibold">{t('tests.correctOf', { c: r.correctCount, t: r.total })}</div>
      <div className="text-sm text-muted">{t('tests.submittedAt', { d: fmtDateTime(r.submittedAt) })}</div>
    </div>
  </div>
  );
};

/** Ikki ustun: çapda test fayli, öngda javoblar varaği (mobilda — ketma-ket) */
const Layout = ({ t, side }: { t: Test; side: ReactNode }) => (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="min-w-0"><MaterialViewer files={[t.file]} /></div>
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">{side}</aside>
  </div>
);

const Header = ({ t: test, extra }: { t: Test; extra?: ReactNode }) => {
  const { t } = useTranslation();
  return (
  <PageHeader
    title={test.title}
    description={test.description ?? t('tests.defaultDesc', { n: test.questionCount })}
    tag={test.source ? <Link to={`/app/sources/${test.source.slug}`}><Tag color="gold" className="m-0">{test.source.title}</Tag></Link> : undefined}
    extra={extra}
  />
  );
};

const StudentView = ({ t: test }: { t: Test }) => {
  const { t } = useTranslation();
  const notify = useNotify();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<(TestOption | null)[]>(() => Array(test.questionCount).fill(null));
  const filled = answers.filter(Boolean).length;
  const submit = useMutation({
    mutationFn: () => testsService.submit(test.id, answers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test', test.id] });
      qc.invalidateQueries({ queryKey: ['tests'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      notify.success(t('tests.submittedOk'));
    },
    onError: (e) => notify.error(e, t('tests.submitFail')),
  });
  const confirm = () => {
    const empty = test.questionCount - filled;
    Modal.confirm({
      title: t('tests.confirmTitle'),
      content: empty > 0 ? t('tests.confirmEmpty', { n: empty }) : t('tests.confirmFinal'),
      okText: t('tests.confirmOk'),
      cancelText: t('tests.confirmCancel'),
      onOk: () => submit.mutateAsync(),
    });
  };

  const done = test.myAttempt;
  return (
    <>
      <Header t={test} />
      <Layout
        t={test}
        side={
          done ? (
            <Card title={t('tests.yourResult')}>
              <ResultCard r={done} />
              <p className="mb-3 mt-4 text-sm text-muted">{t('tests.legend')}</p>
              <AnswerSheet count={done.total} value={done.answers ?? []} answerKey={done.answerKey ?? null} />
            </Card>
          ) : (
            <Card
              title={t('tests.sheet')}
              extra={<span className="text-sm text-muted">{filled} / {test.questionCount}</span>}
              actions={[
                <div key="send" className="px-4">
                  <Button type="primary" block size="large" icon={<SendOutlined />} loading={submit.isPending} onClick={confirm}>
                    {t('tests.submit')}
                  </Button>
                </div>,
              ]}
            >
              <Progress percent={Math.round((filled / test.questionCount) * 100)} showInfo={false} size="small" className="mb-3" />
              <AnswerSheet count={test.questionCount} value={answers} onChange={setAnswers} />
            </Card>
          )
        }
      />
    </>
  );
};

const StaffView = ({ t: test }: { t: Test }) => {
  const { t } = useTranslation();
  const siteView = useSiteViewStore((s) => s.siteView);
  const notify = useNotify();
  const qc = useQueryClient();
  const results = useQuery({ queryKey: ['test-results', test.id], queryFn: () => testsService.results(test.id) });
  const reset = useMutation({
    mutationFn: (attemptId: string) => testsService.resetAttempt(test.id, attemptId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-results', test.id] });
      notify.success(t('tests.resetOk'));
    },
    onError: (e) => notify.error(e),
  });
  const rows = results.data ?? [];
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length) : null;

  return (
    <>
      <Header t={test} extra={!siteView && <Link to={`/app/assignments/${test.id}/edit`}><Button icon={<EditOutlined />}>{t('tests.edit')}</Button></Link>} />
      {!test.isPublished && <Alert type="info" showIcon className="mb-6" message={t('tests.hiddenAlert')} />}
      <Card
        className="mb-6"
        title={t('tests.results', { n: rows.length })}
        extra={avg !== null && <span className="text-sm text-muted">{t('tests.average')} <b>{avg}%</b></span>}
      >
        <Table
          rowKey="id"
          loading={results.isLoading}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 640 }}
          locale={{ emptyText: t('tests.noneSubmitted') }}
          columns={[
            { title: t('tests.student'), render: (_, r) => r.student.fullName },
            { title: t('tests.group'), render: (_, r) => r.student.groups.map((g) => g.name).join(', ') || '—' },
            { title: t('tests.result'), width: 160, render: (_, r) => <b style={{ color: percentColor(r.percent) }}>{r.correctCount}/{r.total} · {Math.round(r.percent)}%</b> },
            { title: t('tests.date'), width: 160, render: (_, r) => fmtDateTime(r.submittedAt) },
            {
              title: '',
              width: 70,
              render: (_, r) => (
                <Popconfirm title={t('tests.resetConfirm')} okText={t('tests.yes')} cancelText={t('tests.no')} onConfirm={() => reset.mutate(r.id)}>
                  <Button size="small" icon={<RedoOutlined />} aria-label={t('tests.resetAllow')} title={t('tests.resetAllow')} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Card>
      <Layout
        t={test}
        side={
          <Card title={t('tests.answerKey')}>
            <AnswerSheet count={test.questionCount} value={test.answerKey ?? []} keyMode />
          </Card>
        }
      />
    </>
  );
};
