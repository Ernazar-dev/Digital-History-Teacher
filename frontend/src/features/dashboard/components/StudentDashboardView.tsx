import { CheckSquareOutlined, FolderOpenOutlined, TrophyOutlined } from '@ant-design/icons';
import { Card, Empty, List, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { StatusTag } from '@/components/common/StatusTag';
import { CompetenceRadar } from '@/features/diagnostics/components/CompetenceChart';
import { ASSIGNMENT_TYPE, PORTFOLIO_TYPE, SUBMISSION_STATUS } from '@/lib/labels';
import type { StudentDashboard } from '@/services/dashboard.service';
import type { PortfolioItemType } from '@/types/api';
import { fmtDate, fmtDateTime, fmtPercent, isOverdue } from '@/utils/format';
import { StatCard } from './StatCard';

export const StudentDashboardView = ({ d }: { d: StudentDashboard }) => (
  <div className="space-y-6">
    <div className="stagger grid gap-4 sm:grid-cols-3">
      <StatCard title="Davom etayotgan topshiriqlar" value={d.assignmentStats.active} icon={<CheckSquareOutlined />} to="/app/assignments" />
      <StatCard title="Baholangan topshiriqlar" value={`${d.assignmentStats.graded} / ${d.assignmentStats.total}`} icon={<TrophyOutlined />} />
      <StatCard title="Portfolio elementlari" value={d.portfolio.total} icon={<FolderOpenOutlined />} to="/app/profile" />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Card title="Davom etayotgan topshiriqlar" extra={<Link to="/app/assignments">Barchasi</Link>}>
        <List
          dataSource={d.activeAssignments}
          locale={{ emptyText: <Empty description="Faol topshiriqlar yo‘q" /> }}
          renderItem={(a) => (
            <List.Item extra={<StatusTag map={SUBMISSION_STATUS} value={a.status} />}>
              <List.Item.Meta
                title={<Link to={`/app/assignments/${a.id}`}>{a.title}</Link>}
                description={
                  <span>
                    {ASSIGNMENT_TYPE[a.type]} · Muddat:{' '}
                    <span className={isOverdue(a.dueDate) ? 'text-red-700' : ''}>{fmtDate(a.dueDate)}</span>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>
      <Card title="Kompetensiya komponentlari" extra={<Link to="/app/competence">Batafsil</Link>}>
        <CompetenceRadar items={d.competence.components} height={240} />
        <div className="mt-2 text-center text-sm text-muted">
          Umumiy ko‘rsatkich: <b>{fmtPercent(d.competence.overall)}</b>{' '}
          {d.competence.level && <Tag color="blue">{d.competence.level.name}</Tag>}
        </div>
      </Card>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Yaqin muddatlar (14 kun)">
        <List
          size="small"
          dataSource={d.upcomingDeadlines}
          locale={{ emptyText: 'Yaqin muddatlar yo‘q' }}
          renderItem={(a) => (
            <List.Item>
              <Link to={`/app/assignments/${a.id}`}>{a.title}</Link>
              <span className="text-muted">{fmtDate(a.dueDate)}</span>
            </List.Item>
          )}
        />
      </Card>
      <Card title="Oxirgi faoliyat">
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
    {d.recentFeedback.length > 0 && (
      <Card title="O‘qituvchining so‘nggi izohlari">
        <List
          dataSource={d.recentFeedback}
          renderItem={(f) => (
            <List.Item extra={<span className="text-muted">{fmtDateTime(f.createdAt)}</span>}>
              <List.Item.Meta
                title={<Link to={`/app/assignments/${f.submission.assignment.id}`}>{f.submission.assignment.title}</Link>}
                description={<span className="prose-text">{f.comment}</span>}
              />
            </List.Item>
          )}
        />
      </Card>
    )}
  </div>
);
