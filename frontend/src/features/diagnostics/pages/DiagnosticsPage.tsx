import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Collapse, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { DIAGNOSTIC_KIND, STAGE } from '@/lib/labels';
import { diagnosticsService } from '@/services/learning.service';
import type { Diagnostic } from '@/types/api';
import { fmtDateTime } from '@/utils/format';

const ATTEMPT_STATUS = { IN_PROGRESS: 'Jarayonda', SUBMITTED: 'Topshirilgan (tekshiruv kutilmoqda)', REVIEWED: 'Yakunlangan' };

const StudentAction = ({ d }: { d: Diagnostic }) => {
  const a = d.myAttempt;
  if (!a) return <Link to={`/app/diagnostics/${d.id}/take`}><Button type="primary">Boshlash</Button></Link>;
  if (a.status === 'IN_PROGRESS') return <Link to={`/app/diagnostics/${d.id}/take`}><Button>Davom ettirish</Button></Link>;
  return <Link to={`/app/diagnostics/attempts/${a.id}`}><Button>Natija</Button></Link>;
};

const Attempts = ({ id }: { id: string }) => {
  const q = useQuery({ queryKey: ['attempts', id], queryFn: () => diagnosticsService.attempts(id) });
  return (
    <Table
      size="small"
      rowKey="id"
      loading={q.isLoading}
      dataSource={q.data ?? []}
      pagination={false}
      locale={{ emptyText: 'Urinishlar yo‘q' }}
      columns={[
        { title: 'Talaba', render: (_, a) => <Link to={`/app/diagnostics/attempts/${a.id}`}>{a.student.fullName}</Link> },
        { title: 'Holat', render: (_, a) => ATTEMPT_STATUS[a.status as keyof typeof ATTEMPT_STATUS] },
        { title: 'Ball', render: (_, a) => (a.maxAutoScore ? `${Math.round((a.autoScore ?? 0) * 10) / 10} / ${a.maxAutoScore}` : '—') },
        { title: 'Topshirilgan', render: (_, a) => fmtDateTime(a.submittedAt) },
      ]}
    />
  );
};

export default function DiagnosticsPage() {
  const { isStudent, isStaff } = useAuth();
  const q = useQuery({ queryKey: ['diagnostics'], queryFn: diagnosticsService.list });
  return (
    <>
      <PageHeader
        title="Metodik kompetensiya diagnostikasi"
        description="Boshlang‘ich, oraliq va yakuniy diagnostika: test, so‘rovnoma va refleksiv savollar. Natijalar kompetensiya profilingizga qo‘shiladi."
        extra={isStaff && <Link to="/app/diagnostics/new"><Button type="primary" icon={<PlusOutlined />}>Yangi diagnostika</Button></Link>}
      />
      {isStudent && (
        <Alert
          className="mb-6"
          type="info"
          showIcon
          message="Har bir diagnostikani bir marta bajarasiz. Boshlang‘ich va yakuniy diagnostikada bir xil savollar ishlatiladi — to‘g‘ri javoblar oshkor qilinmaydi."
        />
      )}
      <QueryState query={q} isEmpty={(d) => d.length === 0} empty="Faol diagnostikalar yo‘q">
        {(items) =>
          isStudent ? (
            <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((d) => (
                <Card key={d.id} title={<span className="whitespace-normal">{d.title}</span>} extra={<Tag color="gold">{STAGE[d.stage]}</Tag>}>
                  <p className="text-sm text-muted">{d.description}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Tag>{DIAGNOSTIC_KIND[d.kind]}</Tag>
                    <Tag>{d._count?.questions} savol</Tag>
                    {d.timeLimitMinutes && <Tag>{d.timeLimitMinutes} daqiqa</Tag>}
                    {d.myAttempt && <Tag color="blue">{ATTEMPT_STATUS[d.myAttempt.status]}</Tag>}
                  </div>
                  <StudentAction d={d} />
                </Card>
              ))}
            </div>
          ) : (
            <Collapse
              items={items.map((d) => ({
                key: d.id,
                label: (
                  <span>
                    <b>{d.title}</b> <Tag color="gold">{STAGE[d.stage]}</Tag><Tag>{DIAGNOSTIC_KIND[d.kind]}</Tag>
                    {!d.isActive && <Tag color="red">Nofaol</Tag>}
                    <span className="text-muted"> · {d._count?.questions} savol · {d._count?.attempts} urinish</span>
                  </span>
                ),
                extra: <Link to={`/app/diagnostics/${d.id}/edit`} onClick={(e) => e.stopPropagation()}><Button size="small" icon={<EditOutlined />}>Tahrirlash</Button></Link>,
                children: <Attempts id={d.id} />,
              }))}
            />
          )
        }
      </QueryState>
    </>
  );
}
