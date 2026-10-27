import { CheckCircleTwoTone, CloseCircleOutlined } from '@ant-design/icons';
import { Alert, Card, Table, Tag } from 'antd';
import { PageHeader } from '@/components/common/PageHeader';
import { ROLE } from '@/lib/labels';
import type { Role } from '@/types/api';
import { PERMISSIONS, type Access } from '../permissions';

const Cell = ({ v }: { v: Access }) => {
  if (v === true) return <CheckCircleTwoTone twoToneColor="#2f7d4f" aria-label="Ruxsat bor" />;
  if (v === 'own') return <Tag color="blue">faqat o‘ziniki</Tag>;
  if (v === 'group') return <Tag color="purple">o‘z guruhi</Tag>;
  return <CloseCircleOutlined className="text-muted" aria-label="Ruxsat yo‘q" />;
};

export default function RolesPage() {
  const roles: Role[] = ['ADMIN', 'TEACHER', 'STUDENT'];
  return (
    <>
      <PageHeader title="Rollar va ruxsatlar" description="Platformadagi uchta rol va ularning amallari. Rol foydalanuvchilar sahifasida tayinlanadi." />
      <Alert
        className="mb-6"
        type="info"
        showIcon
        message="Ruxsatlar server tomonida majburiy tekshiriladi"
        description="Bu jadval backend marshrutlaridagi rol va kirish tekshiruvlarini aks ettiradi. Frontenddagi menyu va himoyalangan sahifalar faqat qulaylik uchun — ruxsatsiz so‘rov serverda 401/403 bilan rad etiladi."
      />
      <Card>
        <Table
          rowKey={(r) => `${r.area}-${r.action}`}
          pagination={false}
          dataSource={PERMISSIONS}
          scroll={{ x: 760 }}
          columns={[
            { title: 'Bo‘lim', dataIndex: 'area', width: 170 },
            { title: 'Amal', dataIndex: 'action' },
            ...roles.map((role) => ({ title: ROLE[role], width: 150, align: 'center' as const, render: (_: unknown, r: (typeof PERMISSIONS)[number]) => <Cell v={r.roles[role]} /> })),
          ]}
        />
      </Card>
    </>
  );
}
