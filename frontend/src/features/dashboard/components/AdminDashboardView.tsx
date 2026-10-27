import { BankOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Descriptions, List } from 'antd';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { tokens } from '@/app/tokens';
import { OBJECT_TYPE, PUBLICATION, ROLE, USER_STATUS } from '@/lib/labels';
import type { AdminDashboard } from '@/services/dashboard.service';
import type { ObjectType, PublicationStatus, Role, UserStatus } from '@/types/api';
import { fmtDate, fmtDateTime } from '@/utils/format';
import { StatCard } from './StatCard';
import { TeacherDashboardView } from './TeacherDashboardView';

const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

export const AdminDashboardView = ({ d }: { d: AdminDashboard }) => (
  <div className="space-y-6">
    <div className="stagger grid gap-4 sm:grid-cols-3">
      <StatCard title="Foydalanuvchilar" value={sum(d.users.byRole)} icon={<TeamOutlined />} to="/app/admin/users" />
      <StatCard title="Nashr etilgan manbalar" value={d.sources.PUBLISHED ?? 0} icon={<BookOutlined />} to="/app/admin/sources" />
      <StatCard title="Virtual obyektlar" value={sum(d.virtualObjects)} icon={<BankOutlined />} to="/app/admin/objects" />
    </div>
    <div className="grid gap-6 xl:grid-cols-3">
      <Card title="Foydalanuvchilar">
        <Descriptions column={1} size="small">
          {Object.entries(d.users.byRole).map(([k, v]) => <Descriptions.Item key={k} label={ROLE[k as Role]}>{v}</Descriptions.Item>)}
          {Object.entries(d.users.byStatus).map(([k, v]) => <Descriptions.Item key={k} label={USER_STATUS[k as UserStatus].label}>{v}</Descriptions.Item>)}
        </Descriptions>
      </Card>
      <Card title="Katalog">
        <Descriptions column={1} size="small">
          {Object.entries(d.sources).map(([k, v]) => <Descriptions.Item key={k} label={`Manbalar: ${PUBLICATION[k as PublicationStatus].label}`}>{v}</Descriptions.Item>)}
          {Object.entries(d.virtualObjects).map(([k, v]) => <Descriptions.Item key={k} label={OBJECT_TYPE[k as ObjectType]}>{v}</Descriptions.Item>)}
        </Descriptions>
      </Card>
      <Card title="O‘quv faoliyati">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Topshiriqlar">{d.counts.assignments}</Descriptions.Item>
          <Descriptions.Item label="Topshirilgan javoblar">{d.counts.submissions}</Descriptions.Item>
          <Descriptions.Item label="Manba tahlillari">{d.counts.sourceAnalyses}</Descriptions.Item>
          <Descriptions.Item label="Dars ishlanmalari">{d.counts.lessonPlans}</Descriptions.Item>
          <Descriptions.Item label="Diagnostika urinishlari">{d.counts.diagnosticAttempts}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <Card title="Faoliyat (oxirgi 30 kun, portfolio yozuvlari)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={d.activity.map((a) => ({ day: fmtDate(a.day), count: a.count }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" name="Yozuvlar" stroke={tokens.color.primary} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="So‘nggi audit yozuvlari">
        <List
          size="small"
          dataSource={d.recentAudit}
          renderItem={(a) => (
            <List.Item>
              <List.Item.Meta title={a.action} description={`${a.actor?.fullName ?? 'Tizim'} · ${fmtDateTime(a.createdAt)}`} />
            </List.Item>
          )}
        />
      </Card>
    </div>
    <TeacherDashboardView d={d.teaching} />
  </div>
);
