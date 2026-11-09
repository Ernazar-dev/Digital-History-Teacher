import { CheckSquareOutlined, PlusOutlined, SolutionOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Card, Empty, List, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { StatusTag } from '@/components/common/StatusTag';
import i18n from '@/i18n';
import { GROUP_KIND } from '@/lib/labels';
import type { TeacherDashboardData } from '@/services/dashboard.service';
import type { ReviewItem } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { StatCard } from './StatCard';

const reviewLink = (r: ReviewItem) => (r.kind === 'LESSON' ? `/app/lessons/${r.id}` : `/app/museum/responses/${r.id}`);

export const TeacherDashboardView = ({ d }: { d: TeacherDashboardData }) => (
  <div className="space-y-6">
    <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard title={i18n.t('staffNav.groups')} value={d.groups.length} icon={<TeamOutlined />} to="/app/groups" />
      <StatCard title={i18n.t('groups.colStudents')} value={d.totalStudents} icon={<UsergroupAddOutlined />} />
      <StatCard title={i18n.t('adminDash.pendingReview')} value={d.pendingReviewCount} icon={<SolutionOutlined />} />
    </div>
    <Card
      title={i18n.t('adminDash.testsAndResults')}
      extra={<Link to="/app/assignments/new"><Button type="primary" size="small" icon={<PlusOutlined />}>{i18n.t('tests.upload')}</Button></Link>}
    >
      <Table
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={d.tests}
        scroll={{ x: 520 }}
        locale={{ emptyText: <Empty image={<CheckSquareOutlined className="text-4xl text-muted" />} description={i18n.t('tests.emptyStaff')} /> }}
        columns={[
          { title: i18n.t('tests.colTest'), render: (_, t) => <Link to={`/app/assignments/${t.id}`}>{t.title}</Link> },
          { title: i18n.t('tests.colQuestions'), width: 100, dataIndex: 'questionCount' },
          { title: i18n.t('tests.colAttempts'), width: 130, render: (_, t) => <Link to={`/app/assignments/${t.id}`}>{t.attemptCount}</Link> },
          { title: i18n.t('tests.colStatus'), width: 110, render: (_, t) => (t.isPublished ? <Tag color="green">{i18n.t('tests.open')}</Tag> : <Tag>{i18n.t('tests.hidden')}</Tag>) },
        ]}
      />
    </Card>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card title={i18n.t('adminDash.toReview')}>
        <List
          dataSource={d.pendingReviews}
          locale={{ emptyText: <Empty description={i18n.t('adminDash.noReview')} /> }}
          renderItem={(r) => (
            <List.Item extra={<span className="text-muted">{fmtDateTime(r.submittedAt)}</span>}>
              <List.Item.Meta title={<Link to={reviewLink(r)}>{r.title}</Link>} description={r.student.fullName} />
            </List.Item>
          )}
        />
      </Card>
      <Card title={i18n.t('staffNav.groups')} extra={<Link to="/app/groups">{i18n.t('guest.all')}</Link>}>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={d.groups}
          locale={{ emptyText: i18n.t('groups.empty') }}
          columns={[
            { title: i18n.t('groups.colGroup'), render: (_, g) => <Link to={`/app/groups/${g.id}`}>{g.name}</Link> },
            { title: i18n.t('groups.colKind'), render: (_, g) => <StatusTag map={GROUP_KIND} value={g.kind as keyof typeof GROUP_KIND} /> },
            { title: i18n.t('groups.colStudents'), dataIndex: 'members' },
          ]}
        />
      </Card>
    </div>
  </div>
);
