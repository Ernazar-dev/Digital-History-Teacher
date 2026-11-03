import { EditOutlined, RedoOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Modal, Popconfirm, Progress, Table, Tag } from 'antd';
import { useState, type ReactNode } from 'react';
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
  // Saytni ko'rish rejimida test talaba ko'rinishida ochiladi
  const siteView = useSiteViewStore((s) => s.siteView);
  const isStaff = staff && !siteView;
  const query = useQuery({ queryKey: ['test', id], queryFn: () => testsService.get(id) });
  return <QueryState query={query}>{(t) => (isStaff ? <StaffView t={t} /> : <StudentView t={t} />)}</QueryState>;
}

export const percentColor = (p: number) => (p >= 86 ? '#059669' : p >= 56 ? '#d97706' : '#dc2626');

const ResultCard = ({ r }: { r: TestAttemptResult }) => (
  <div className="flex items-center gap-4 rounded-xl bg-canvas p-4">
    <Progress type="circle" size={72} percent={Math.round(r.percent)} strokeColor={percentColor(r.percent)} />
    <div>
      <div className="text-lg font-semibold">{r.correctCount} / {r.total} to‘g‘ri</div>
      <div className="text-sm text-muted">Topshirilgan: {fmtDateTime(r.submittedAt)}</div>
    </div>
  </div>
);

/** Ikki ustun: chapda test fayli, o'ngda javoblar varag'i (mobilda — ketma-ket) */
const Layout = ({ t, side }: { t: Test; side: ReactNode }) => (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="min-w-0"><MaterialViewer files={[t.file]} /></div>
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">{side}</aside>
  </div>
);

const Header = ({ t, extra }: { t: Test; extra?: ReactNode }) => (
  <PageHeader
    title={t.title}
    description={t.description ?? `${t.questionCount} ta savol. Faylni o‘qing va har bir savolga javobni belgilang.`}
    tag={t.source ? <Link to={`/app/sources/${t.source.slug}`}><Tag color="gold" className="m-0">{t.source.title}</Tag></Link> : undefined}
    extra={extra}
  />
);

const StudentView = ({ t }: { t: Test }) => {
  const notify = useNotify();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<(TestOption | null)[]>(() => Array(t.questionCount).fill(null));
  const filled = answers.filter(Boolean).length;
  const submit = useMutation({
    mutationFn: () => testsService.submit(t.id, answers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test', t.id] });
      qc.invalidateQueries({ queryKey: ['tests'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      notify.success('Test topshirildi');
    },
    onError: (e) => notify.error(e, 'Test topshirilmadi'),
  });
  const confirm = () => {
    const empty = t.questionCount - filled;
    Modal.confirm({
      title: 'Testni topshirasizmi?',
      content: empty > 0 ? `${empty} ta savolga javob belgilanmagan. Topshirgandan keyin javoblarni o‘zgartirib bo‘lmaydi.` : 'Topshirgandan keyin javoblarni o‘zgartirib bo‘lmaydi.',
      okText: 'Ha, topshirish',
      cancelText: 'Qaytish',
      onOk: () => submit.mutateAsync(),
    });
  };

  const done = t.myAttempt;
  return (
    <>
      <Header t={t} />
      <Layout
        t={t}
        side={
          done ? (
            <Card title="Natijangiz">
              <ResultCard r={done} />
              <p className="mb-3 mt-4 text-sm text-muted">Yashil — to‘g‘ri javob, qizil — siz belgilagan noto‘g‘ri javob.</p>
              <AnswerSheet count={done.total} value={done.answers ?? []} answerKey={done.answerKey ?? null} />
            </Card>
          ) : (
            <Card
              title="Javoblar varag‘i"
              extra={<span className="text-sm text-muted">{filled} / {t.questionCount}</span>}
              actions={[
                <div key="send" className="px-4">
                  <Button type="primary" block size="large" icon={<SendOutlined />} loading={submit.isPending} onClick={confirm}>
                    Topshirish
                  </Button>
                </div>,
              ]}
            >
              <Progress percent={Math.round((filled / t.questionCount) * 100)} showInfo={false} size="small" className="mb-3" />
              <AnswerSheet count={t.questionCount} value={answers} onChange={setAnswers} />
            </Card>
          )
        }
      />
    </>
  );
};

const StaffView = ({ t }: { t: Test }) => {
  const siteView = useSiteViewStore((s) => s.siteView);
  const notify = useNotify();
  const qc = useQueryClient();
  const results = useQuery({ queryKey: ['test-results', t.id], queryFn: () => testsService.results(t.id) });
  const reset = useMutation({
    mutationFn: (attemptId: string) => testsService.resetAttempt(t.id, attemptId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-results', t.id] });
      notify.success('Talaba testni qayta topshira oladi');
    },
    onError: (e) => notify.error(e),
  });
  const rows = results.data ?? [];
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length) : null;

  return (
    <>
      <Header t={t} extra={!siteView && <Link to={`/app/assignments/${t.id}/edit`}><Button icon={<EditOutlined />}>Tahrirlash</Button></Link>} />
      {!t.isPublished && <Alert type="info" showIcon className="mb-6" message="Test yashirilgan — talabalar uni ko‘rmaydi." />}
      <Card
        className="mb-6"
        title={`Natijalar (${rows.length})`}
        extra={avg !== null && <span className="text-sm text-muted">O‘rtacha: <b>{avg}%</b></span>}
      >
        <Table
          rowKey="id"
          loading={results.isLoading}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 640 }}
          locale={{ emptyText: 'Hali hech kim topshirmagan' }}
          columns={[
            { title: 'Talaba', render: (_, r) => r.student.fullName },
            { title: 'Guruh', render: (_, r) => r.student.groups.map((g) => g.name).join(', ') || '—' },
            { title: 'Natija', width: 160, render: (_, r) => <b style={{ color: percentColor(r.percent) }}>{r.correctCount}/{r.total} · {Math.round(r.percent)}%</b> },
            { title: 'Sana', width: 160, render: (_, r) => fmtDateTime(r.submittedAt) },
            {
              title: '',
              width: 70,
              render: (_, r) => (
                <Popconfirm title="Natija o‘chiriladi va talaba qayta topshira oladi. Davom etasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => reset.mutate(r.id)}>
                  <Button size="small" icon={<RedoOutlined />} aria-label="Qayta topshirishga ruxsat" title="Qayta topshirishga ruxsat" />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Card>
      <Layout
        t={t}
        side={
          <Card title="To‘g‘ri javoblar kaliti">
            <AnswerSheet count={t.questionCount} value={t.answerKey ?? []} keyMode />
          </Card>
        }
      />
    </>
  );
};
