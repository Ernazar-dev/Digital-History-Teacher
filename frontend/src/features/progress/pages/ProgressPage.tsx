import { CheckCircleFilled, ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Progress as Bar } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { percentColor } from '@/features/tests/pages/TestPage';
import { progressService, type Progress, type ProgressTest } from '@/services/progress.service';
import { fmtPercent } from '@/utils/format';

/** O'quv yo'li: kutubxona mavzulari tartibida — har bir mavzu bo'yicha testlar va natijalar */
export default function ProgressPage() {
  const { studentId } = useParams();
  const q = useQuery({
    queryKey: ['progress', studentId ?? 'me'],
    queryFn: () => (studentId ? progressService.student(studentId) : progressService.mine()),
  });
  return <QueryState query={q}>{(p) => <View p={p} own={!studentId} />}</QueryState>;
}

/** Talaba kabinetidagi «Mening o'quv yo'lim» tabi (sahifa sarlavhasisiz) */
export const MyProgress = () => {
  const q = useQuery({ queryKey: ['progress', 'me'], queryFn: progressService.mine });
  return <QueryState query={q}>{(p) => <View p={p} own embedded />}</QueryState>;
};

const TestLine = ({ t, own }: { t: ProgressTest; own: boolean }) => {
  const body = (
    <>
      {t.attempt ? <CheckCircleFilled className="text-emerald-600" /> : <ClockCircleOutlined className="text-muted" />}
      <span className="min-w-0 flex-1 truncate">{t.title}</span>
      {t.attempt ? (
        <b style={{ color: percentColor(t.attempt.percent) }}>{t.attempt.correctCount}/{t.attempt.total}</b>
      ) : (
        <span className="text-sm text-muted">{own ? 'Topshirilmagan' : '—'}</span>
      )}
      {own && <RightOutlined className="text-xs text-muted" />}
    </>
  );
  return own ? (
    <Link to={`/app/assignments/${t.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-ink no-underline hover:bg-primary-soft">{body}</Link>
  ) : (
    <div className="flex items-center gap-3 px-3 py-2">{body}</div>
  );
};

const View = ({ p, own, embedded = false }: { p: Progress; own: boolean; embedded?: boolean }) => {
  const { testsTotal, testsDone, averagePercent } = p.summary;
  const withTests = p.topics.filter((t) => t.tests.length > 0);

  return (
    <>
      {!embedded && <PageHeader title={own ? 'Mening o‘quv yo‘lim' : 'Talabaning o‘quv yo‘li'} description="Mavzular bo‘yicha testlar va natijalar." />}
      <Card className="mb-6">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <div className="text-sm text-muted">Topshirilgan testlar</div>
            <div className="font-serif-title text-3xl">{testsDone} / {testsTotal}</div>
            <Bar percent={testsTotal ? Math.round((testsDone / testsTotal) * 100) : 0} showInfo={false} />
          </div>
          <div className="text-center">
            <div className="text-sm text-muted">O‘rtacha natija</div>
            <div className="text-3xl font-semibold" style={{ color: averagePercent !== null ? percentColor(averagePercent) : undefined }}>
              {fmtPercent(averagePercent)}
            </div>
          </div>
        </div>
      </Card>

      {withTests.length === 0 && p.otherTests.length === 0 ? (
        <Card><Empty description="Hozircha testlar yo‘q" /></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {withTests.map((topic) => (
            <Card
              key={topic.id}
              size="small"
              title={<Link to={`/app/sources/${topic.slug}`} className="text-ink">{topic.title}</Link>}
              extra={topic.bookLabel && <span className="hidden text-xs text-muted md:inline">{topic.bookLabel.split(' · ')[1]}</span>}
            >
              {topic.tests.map((t) => <TestLine key={t.id} t={t} own={own} />)}
            </Card>
          ))}
          {p.otherTests.length > 0 && (
            <Card size="small" title="Umumiy testlar">
              {p.otherTests.map((t) => <TestLine key={t.id} t={t} own={own} />)}
            </Card>
          )}
        </div>
      )}
    </>
  );
};
