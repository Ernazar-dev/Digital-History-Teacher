import { ArrowRightOutlined, LockOutlined, TrophyFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Progress as Bar, Tag } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { progressService, type Progress, type TrajectoryStep } from '@/services/progress.service';
import { fmtDateTime } from '@/utils/format';
import { LeaderboardCard } from '../components/LeaderboardCard';

const STEP_KIND: Record<TrajectoryStep['kind'], { label: string; color: string }> = {
  RETURNED: { label: 'Qayta ishlash', color: 'orange' },
  ASSIGNMENT: { label: 'Topshiriq', color: 'blue' },
  DIAGNOSTIC: { label: 'Diagnostika', color: 'purple' },
  COMPONENT: { label: 'Kompetensiyani kuchaytirish', color: 'green' },
};

/** Hujjat, 6-modul: o'yin elementlari (ball, daraja, yutuqlar, reyting) va individual o'quv traektoriyasi */
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

const View = ({ p, own, embedded = false }: { p: Progress; own: boolean; embedded?: boolean }) => {
  const { level } = p;
  const toNext = level.nextAt !== null ? level.nextAt - level.points : null;
  const earned = p.achievements.filter((a) => a.earned).length;

  return (
    <>
      {embedded ? (
        <p className="mb-6 mt-0 text-sm text-muted">Ball faqat o‘qituvchi baholagan ishlardan hisoblanadi. Keyingi qadamlar ishlaringiz va kompetensiya profilingizga qarab tuziladi.</p>
      ) : (
        <PageHeader title={own ? 'Mening o‘quv yo‘lim' : 'Talabaning o‘quv yo‘li'} description="Ball faqat o‘qituvchi baholagan ishlardan hisoblanadi. Keyingi qadamlar ishlaringiz va kompetensiya profilingizga qarab tuziladi." />
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">{level.index}</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-muted">Daraja</div>
                <div className="font-serif-title text-2xl">{level.name}</div>
                <Bar percent={level.nextAt ? Math.round((level.points / level.nextAt) * 100) : 100} showInfo={false} className="m-0" />
                <div className="text-sm text-muted">
                  {toNext !== null ? `«${level.nextName}» darajasigacha ${toNext} ball` : 'Eng yuqori daraja'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-semibold">{p.points}</div><div className="text-xs text-muted">ball</div></div>
                <div><div className="text-2xl font-semibold">{p.reviewedCount}</div><div className="text-xs text-muted">baholangan ish</div></div>
                <div><div className="text-2xl font-semibold">{earned}/{p.achievements.length}</div><div className="text-xs text-muted">yutuq</div></div>
              </div>
            </div>
          </Card>

          <Card title="Keyingi qadamlar (individual traektoriya)">
            {p.trajectory.length === 0 ? (
              <Empty description="Hozircha barcha ishlar bajarilgan — ajoyib!" />
            ) : (
              <ol className="m-0 list-none space-y-3 p-0">
                {p.trajectory.map((s, i) => (
                  <li key={`${s.link}-${i}`}>
                    <Link to={s.link} className="flex items-start gap-3 rounded-lg border border-solid border-line p-3 text-inherit no-underline hover:border-primary">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <Tag color={STEP_KIND[s.kind].color} className="mb-1">{STEP_KIND[s.kind].label}</Tag>
                        <span className="block font-medium">{s.title}</span>
                        <span className="block text-sm text-muted">{s.reason}{s.due ? ` · muddat: ${fmtDateTime(s.due)}` : ''}</span>
                      </span>
                      <ArrowRightOutlined className="mt-2 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Yutuqlar">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {p.achievements.map((a) => (
                <div key={a.code} className={`rounded-lg border border-solid p-3 ${a.earned ? 'border-accent bg-primary-soft' : 'border-line opacity-80'}`}>
                  <div className="flex items-center gap-2 font-medium">
                    {a.earned ? <TrophyFilled className="text-accent" /> : <LockOutlined className="text-muted" />}
                    {a.title}
                  </div>
                  <div className="mt-1 text-xs text-muted">{a.description}</div>
                  {!a.earned && a.target > 1 && <Bar percent={Math.round((a.current / a.target) * 100)} size="small" format={() => `${a.current}/${a.target}`} />}
                </div>
              ))}
            </div>
          </Card>
          {p.groups.map((g) => <LeaderboardCard key={g.id} groupId={g.id} staff={!own} />)}
        </div>
      </div>
    </>
  );
};
