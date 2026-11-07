import { BookOutlined, CheckSquareOutlined, RiseOutlined, TrophyOutlined } from '@ant-design/icons';
import { Button, Card, Empty, List } from 'antd';
import { Link } from 'react-router-dom';
import { percentColor } from '@/features/tests/pages/TestPage';
import { PORTFOLIO_TYPE } from '@/lib/labels';
import type { StudentDashboard } from '@/services/dashboard.service';
import type { PortfolioItemType } from '@/types/api';
import { fmtDateTime, fmtPercent } from '@/utils/format';
import { StatCard } from './StatCard';

export const StudentDashboardView = ({ d }: { d: StudentDashboard }) => (
  <div className="space-y-6">
    <div className="stagger grid gap-4 sm:grid-cols-3">
      <StatCard title="Bajarilmagan testlar" value={d.testStats.total - d.testStats.done} icon={<CheckSquareOutlined />} to="/app/assignments" />
      <StatCard title="Topshirilgan testlar" value={`${d.testStats.done} / ${d.testStats.total}`} icon={<TrophyOutlined />} to="/app?tab=yol" />
      <StatCard title="O‘rtacha natija" value={fmtPercent(d.testStats.averagePercent)} icon={<RiseOutlined />} to="/app?tab=yol" />
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Bajarilishi kerak bo‘lgan testlar" extra={<Link to="/app/assignments">Barchasi</Link>}>
        <List
          dataSource={d.pendingTests}
          locale={{ emptyText: <Empty description="Barcha testlar topshirilgan" /> }}
          renderItem={(t) => (
            <List.Item extra={<Link to={`/app/assignments/${t.id}`}><Button type="primary" size="small">Boshlash</Button></Link>}>
              <List.Item.Meta
                title={<Link to={`/app/assignments/${t.id}`}>{t.title}</Link>}
                description={`${t.source?.title ?? 'Umumiy test'} · ${t.questionCount} ta savol`}
              />
            </List.Item>
          )}
        />
      </Card>
      <Card title="So‘nggi natijalar" extra={<Link to="/app?tab=yol">O‘quv yo‘lim</Link>}>
        <List
          dataSource={d.recentResults}
          locale={{ emptyText: <Empty description="Hali test topshirilmagan" /> }}
          renderItem={(t) => (
            <List.Item extra={<b style={{ color: percentColor(t.attempt.percent) }}>{t.attempt.correctCount}/{t.attempt.total}</b>}>
              <List.Item.Meta
                title={<Link to={`/app/assignments/${t.id}`}>{t.title}</Link>}
                description={fmtDateTime(t.attempt.submittedAt)}
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
            <div className="font-semibold">Manbalar</div>
            <div className="text-sm text-muted">Mavzular bo‘yicha ma’ruza, taqdimot va video roliklar</div>
          </div>
          <Link to="/app/sources"><Button>Ochish</Button></Link>
        </div>
      </Card>
      <Card title="Oxirgi faoliyat" size="small">
        <List
          size="small"
          dataSource={d.recentActivity}
          locale={{ emptyText: 'Hali faoliyat yo‘q' }}
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
