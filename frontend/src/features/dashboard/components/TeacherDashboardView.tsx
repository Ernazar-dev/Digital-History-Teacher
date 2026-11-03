import { CheckSquareOutlined, PlusOutlined, SolutionOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Card, Empty, List, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { StatusTag } from '@/components/common/StatusTag';
import { GROUP_KIND } from '@/lib/labels';
import type { TeacherDashboardData } from '@/services/dashboard.service';
import type { ReviewItem } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { StatCard } from './StatCard';

const reviewLink = (r: ReviewItem) => (r.kind === 'LESSON' ? `/app/lessons/${r.id}` : `/app/museum/responses/${r.id}`);

export const TeacherDashboardView = ({ d }: { d: TeacherDashboardData }) => (
  <div className="space-y-6">
    <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard title="Guruhlar" value={d.groups.length} icon={<TeamOutlined />} to="/app/groups" />
      <StatCard title="Talabalar" value={d.totalStudents} icon={<UsergroupAddOutlined />} />
      <StatCard title="Tekshirilmagan ishlar" value={d.pendingReviewCount} icon={<SolutionOutlined />} />
    </div>
    <Card
      title="Testlar va natijalar"
      extra={<Link to="/app/assignments/new"><Button type="primary" size="small" icon={<PlusOutlined />}>Test yuklash</Button></Link>}
    >
      <Table
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={d.tests}
        scroll={{ x: 520 }}
        locale={{ emptyText: <Empty image={<CheckSquareOutlined className="text-4xl text-muted" />} description="Hali test yuklanmagan" /> }}
        columns={[
          { title: 'Test', render: (_, t) => <Link to={`/app/assignments/${t.id}`}>{t.title}</Link> },
          { title: 'Savollar', width: 100, dataIndex: 'questionCount' },
          { title: 'Topshirganlar', width: 130, render: (_, t) => <Link to={`/app/assignments/${t.id}`}>{t.attemptCount}</Link> },
          { title: 'Holat', width: 110, render: (_, t) => (t.isPublished ? <Tag color="green">Ochiq</Tag> : <Tag>Yashirin</Tag>) },
        ]}
      />
    </Card>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card title="Tekshirilishi kerak (dars ishlanmalari, muzey ishlari)">
        <List
          dataSource={d.pendingReviews}
          locale={{ emptyText: <Empty description="Tekshirilishi kerak bo‘lgan ishlar yo‘q" /> }}
          renderItem={(r) => (
            <List.Item extra={<span className="text-muted">{fmtDateTime(r.submittedAt)}</span>}>
              <List.Item.Meta title={<Link to={reviewLink(r)}>{r.title}</Link>} description={r.student.fullName} />
            </List.Item>
          )}
        />
      </Card>
      <Card title="Guruhlar" extra={<Link to="/app/groups">Barchasi</Link>}>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={d.groups}
          locale={{ emptyText: 'Guruhlar yo‘q' }}
          columns={[
            { title: 'Guruh', render: (_, g) => <Link to={`/app/groups/${g.id}`}>{g.name}</Link> },
            { title: 'Turi', render: (_, g) => <StatusTag map={GROUP_KIND} value={g.kind as keyof typeof GROUP_KIND} /> },
            { title: 'Talabalar', dataIndex: 'members' },
          ]}
        />
      </Card>
    </div>
  </div>
);
