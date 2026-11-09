import { BookOutlined, CheckSquareOutlined, RiseOutlined, TrophyOutlined } from '@ant-design/icons';
import { Button, Card, Empty, List } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { percentColor } from '@/features/tests/pages/TestPage';
import { PORTFOLIO_TYPE } from '@/lib/labels';
import type { StudentDashboard } from '@/services/dashboard.service';
import type { PortfolioItemType } from '@/types/api';
import { fmtDateTime, fmtPercent } from '@/utils/format';
import { StatCard } from './StatCard';

export const StudentDashboardView = ({ d }: { d: StudentDashboard }) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-6">
    <div className="stagger grid gap-4 sm:grid-cols-3">
      <StatCard title={t('dashboard.pendingTests')} value={d.testStats.total - d.testStats.done} icon={<CheckSquareOutlined />} to="/app/assignments" />
      <StatCard title={t('dashboard.doneTests')} value={`${d.testStats.done} / ${d.testStats.total}`} icon={<TrophyOutlined />} to="/app?tab=yol" />
      <StatCard title={t('dashboard.average')} value={fmtPercent(d.testStats.averagePercent)} icon={<RiseOutlined />} to="/app?tab=yol" />
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title={t('dashboard.todoTitle')} extra={<Link to="/app/assignments">{t('guest.all')}</Link>}>
        <List
          dataSource={d.pendingTests}
          locale={{ emptyText: <Empty description={t('dashboard.allDone')} /> }}
          renderItem={(test) => (
            <List.Item extra={<Link to={`/app/assignments/${test.id}`}><Button type="primary" size="small">{t('topic.start')}</Button></Link>}>
              <List.Item.Meta
                title={<Link to={`/app/assignments/${test.id}`}>{test.title}</Link>}
                description={`${test.source?.title ?? t('dashboard.generalTest')} · ${t('dashboard.questionsN', { n: test.questionCount })}`}
              />
            </List.Item>
          )}
        />
      </Card>
      <Card title={t('dashboard.recentResults')} extra={<Link to="/app?tab=yol">{t('dashboard.myPath')}</Link>}>
        <List
          dataSource={d.recentResults}
          locale={{ emptyText: <Empty description={t('dashboard.noneTaken')} /> }}
          renderItem={(test) => (
            <List.Item extra={<b style={{ color: percentColor(test.attempt.percent) }}>{test.attempt.correctCount}/{test.attempt.total}</b>}>
              <List.Item.Meta
                title={<Link to={`/app/assignments/${test.id}`}>{test.title}</Link>}
                description={fmtDateTime(test.attempt.submittedAt)}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-2xl text-primary"><BookOutlined /></span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{t('nav.sources')}</div>
            <div className="text-sm text-muted">{t('dashboard.sourcesDesc')}</div>
          </div>
          <Link to="/app/sources"><Button>{t('guest.open')}</Button></Link>
        </div>
      </Card>
      <Card title={t('dashboard.recentActivity')} size="small">
        <List
          size="small"
          dataSource={d.recentActivity}
          locale={{ emptyText: t('dashboard.noActivity') }}
          renderItem={(i) => (
            <List.Item>
              <List.Item.Meta
                title={<Link to={`/app/portfolio/items/${i.id}`}>{i.title}</Link>}
                description={`${PORTFOLIO_TYPE[i.type as PortfolioItemType] ?? i.type} · ${fmtDateTime(i.updatedAt)}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  </div>
  );
};
