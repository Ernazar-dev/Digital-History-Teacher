import { BankOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Descriptions, List } from 'antd';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { tokens } from '@/app/tokens';
import i18n from '@/i18n';
import { OBJECT_TYPE, ROLE, USER_STATUS } from '@/lib/labels';
import type { AdminDashboard } from '@/services/dashboard.service';
import type { ObjectType, Role, UserStatus } from '@/types/api';
import { fmtDate, fmtDateTime } from '@/utils/format';
import { StatCard } from './StatCard';
import { TeacherDashboardView } from './TeacherDashboardView';

const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

export const AdminDashboardView = ({ d }: { d: AdminDashboard }) => (
  <div className="space-y-6">
    <div className="stagger grid gap-4 sm:grid-cols-3">
      <StatCard title={i18n.t('staffNav.users')} value={sum(d.users.byRole)} icon={<TeamOutlined />} to="/app/admin/users" />
      <StatCard title={i18n.t('adminDash.topicsLectures')} value={d.counts.topics} icon={<BookOutlined />} to="/app/sources" />
      <StatCard title={i18n.t('seg.objects')} value={sum(d.virtualObjects)} icon={<BankOutlined />} to="/app/museum" />
    </div>
    <div className="grid gap-6 xl:grid-cols-3">
      <Card title={i18n.t('staffNav.users')}>
        <Descriptions column={1} size="small">
          {Object.entries(d.users.byRole).map(([k, v]) => <Descriptions.Item key={k} label={ROLE[k as Role]}>{v}</Descriptions.Item>)}
          {Object.entries(d.users.byStatus).map(([k, v]) => <Descriptions.Item key={k} label={USER_STATUS[k as UserStatus].label}>{v}</Descriptions.Item>)}
        </Descriptions>
      </Card>
      <Card title={i18n.t('adminDash.catalog')}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label={i18n.t('topic.topics')}>{d.counts.topics}</Descriptions.Item>
          <Descriptions.Item label={i18n.t('adminDash.books')}>{d.counts.books}</Descriptions.Item>
          {Object.entries(d.virtualObjects).map(([k, v]) => <Descriptions.Item key={k} label={OBJECT_TYPE[k as ObjectType]}>{v}</Descriptions.Item>)}
        </Descriptions>
      </Card>
      <Card title={i18n.t('adminDash.learning')}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label={i18n.t('search.tests')}>{d.counts.tests}</Descriptions.Item>
          <Descriptions.Item label={i18n.t('dashboard.doneTests')}>{d.counts.testAttempts}</Descriptions.Item>
          <Descriptions.Item label={i18n.t('lesson.list.title')}>{d.counts.lessonPlans}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <Card title={i18n.t('adminDash.activity')}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={d.activity.map((a) => ({ day: fmtDate(a.day), count: a.count }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" name={i18n.t('adminDash.records')} stroke={tokens.color.primary} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title={i18n.t('adminDash.audit')}>
        <List
          size="small"
          dataSource={d.recentAudit}
          renderItem={(a) => (
            <List.Item>
              <List.Item.Meta title={a.action} description={`${a.actor?.fullName ?? i18n.t('adminDash.system')} · ${fmtDateTime(a.createdAt)}`} />
            </List.Item>
          )}
        />
      </Card>
    </div>
    <TeacherDashboardView d={d.teaching} />
  </div>
);
