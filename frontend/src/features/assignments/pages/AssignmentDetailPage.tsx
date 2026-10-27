import { EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Table } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { ASSIGNMENT_STATUS, SUBMISSION_STATUS } from '@/lib/labels';
import { assignmentsService, submissionsService } from '@/services/learning.service';
import { fmtDateTime } from '@/utils/format';
import { AssignmentBrief } from '../components/AssignmentBrief';
import { StudentSubmission } from '../components/StudentSubmission';

export default function AssignmentDetailPage() {
  const { id = '' } = useParams();
  const { isStudent, isStaff, isAdmin, user } = useAuth();
  const q = useQuery({ queryKey: ['assignment', id], queryFn: () => assignmentsService.get(id) });
  const subs = useQuery({ queryKey: ['submissions', id], queryFn: () => submissionsService.list({ assignmentId: id }), enabled: isStaff });

  return (
    <QueryState query={q}>
      {(a) => (
        <>
          <PageHeader
            title={a.title}
            tag={isStaff && <StatusTag map={ASSIGNMENT_STATUS} value={a.status} />}
            extra={(isAdmin || a.createdBy?.id === user?.id) && <Link to={`/app/assignments/${a.id}/edit`}><Button icon={<EditOutlined />}>Tahrirlash</Button></Link>}
          />
          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <AssignmentBrief a={a} />
            {isStudent && <StudentSubmission a={a} />}
            {isStaff && (
              <Card title="Talabalar javoblari">
                <Table
                  rowKey="id"
                  loading={subs.isLoading}
                  dataSource={subs.data?.data ?? []}
                  locale={{ emptyText: 'Hali topshirilgan javob yo‘q' }}
                  scroll={{ x: 600 }}
                  columns={[
                    { title: 'Talaba', render: (_, s) => <Link to={`/app/submissions/${s.id}`}>{s.student?.fullName}</Link> },
                    { title: 'Holat', render: (_, s) => <StatusTag map={SUBMISSION_STATUS} value={s.status} /> },
                    { title: 'Ball', width: 80, render: (_, s) => s.score ?? '—' },
                    { title: 'Topshirilgan', render: (_, s) => fmtDateTime(s.submittedAt) },
                    {
                      title: '',
                      width: 110,
                      render: (_, s) => (
                        <Link to={`/app/submissions/${s.id}`}>
                          <Button size="small" type={['SUBMITTED', 'UNDER_REVIEW'].includes(s.status) ? 'primary' : 'default'}>
                            {['SUBMITTED', 'UNDER_REVIEW'].includes(s.status) ? 'Tekshirish' : 'Ko‘rish'}
                          </Button>
                        </Link>
                      ),
                    },
                  ]}
                />
              </Card>
            )}
          </div>
        </>
      )}
    </QueryState>
  );
}
