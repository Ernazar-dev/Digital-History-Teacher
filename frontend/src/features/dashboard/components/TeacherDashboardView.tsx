import { SolutionOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Card, Empty, List, Progress, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { StatusTag } from '@/components/common/StatusTag';
import { reviewLink } from '@/features/assignments/reviewLink';
import { GROUP_KIND } from '@/lib/labels';
import type { TeacherDashboardData } from '@/services/dashboard.service';
import { fmtDate, fmtDateTime, fmtPercent } from '@/utils/format';
import { StatCard } from './StatCard';

export const TeacherDashboardView = ({ d }: { d: TeacherDashboardData }) => (
  <div className="space-y-6">
    <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard title="Guruhlar" value={d.groups.length} icon={<TeamOutlined />} to="/app/groups" />
      <StatCard title="Talabalar" value={d.totalStudents} icon={<UsergroupAddOutlined />} />
      <StatCard title="Tekshirilmagan ishlar" value={d.pendingReviewCount} icon={<SolutionOutlined />} to="/app/review" />
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card title="Tekshiruv navbati" extra={<Link to="/app/review">Barchasi</Link>}>
        <List
          dataSource={d.pendingReviews}
          locale={{ emptyText: <Empty description="Tekshirilishi kerak bo‘lgan ishlar yo‘q" /> }}
          renderItem={(r) => (
            <List.Item extra={<span className="text-muted">{fmtDateTime(r.submittedAt)}</span>}>
              <List.Item.Meta title={<Link to={reviewLink(r.kind, r.id)}>{r.title}</Link>} description={r.student.fullName} />
            </List.Item>
          )}
        />
      </Card>
      <Card title="Guruhlar va kompetensiya o‘rtachasi">
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={d.groups}
          scroll={{ x: 520 }}
          locale={{ emptyText: 'Guruhlar yo‘q' }}
          columns={[
            { title: 'Guruh', render: (_, g) => <Link to={`/app/groups/${g.id}`}>{g.name}</Link> },
            { title: 'Turi', render: (_, g) => <StatusTag map={GROUP_KIND} value={g.kind} /> },
            { title: 'Talabalar', dataIndex: 'members' },
            { title: 'O‘rtacha', render: (_, g) => `${fmtPercent(g.averageOverall)} (${g.assessedStudents} baholangan)` },
          ]}
        />
      </Card>
    </div>
    <Card title="Topshiriqlarning bajarilish holati" extra={<Link to="/app/assignments">Topshiriqlar</Link>}>
      <Table
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={d.assignments}
        scroll={{ x: 640 }}
        locale={{ emptyText: 'Topshiriqlar yo‘q' }}
        columns={[
          { title: 'Topshiriq', render: (_, a) => <Link to={`/app/assignments/${a.id}`}>{a.title}</Link> },
          { title: 'Muddat', render: (_, a) => fmtDate(a.dueDate) },
          {
            title: 'Holat',
            render: (_, a) => {
              const graded = a.counts.GRADED ?? 0;
              const waiting = (a.counts.SUBMITTED ?? 0) + (a.counts.UNDER_REVIEW ?? 0);
              return (
                <div className="min-w-[200px]">
                  <Progress percent={a.total ? Math.round((graded / a.total) * 100) : 0} size="small" />
                  <Tag color="blue">Kutilmoqda: {waiting}</Tag>
                  <Tag color="green">Baholangan: {graded}</Tag>
                </div>
              );
            },
          },
        ]}
      />
    </Card>
  </div>
);
