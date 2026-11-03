import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { GROUP_KIND, toOptions } from '@/lib/labels';
import { groupsService } from '@/services/people.service';
import type { GroupKind } from '@/types/api';
import { AddMembers } from '../components/AddMembers';

export default function GroupDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const notify = useNotify();
  const group = useQuery({ queryKey: ['group', id], queryFn: () => groupsService.get(id) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['group', id] });
    qc.invalidateQueries({ queryKey: ['groups'] });
  };
  const setKind = useMutation({ mutationFn: (kind: GroupKind) => groupsService.update(id, { kind }), onSuccess: () => { refresh(); notify.success('Guruh turi o‘zgartirildi'); }, onError: (e) => notify.error(e) });
  const removeMember = useMutation({ mutationFn: (studentId: string) => groupsService.removeMember(id, studentId), onSuccess: refresh, onError: (e) => notify.error(e) });
  const removeGroup = useMutation({ mutationFn: () => groupsService.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); navigate('/app/groups'); }, onError: (e) => notify.error(e) });

  return (
    <QueryState query={group}>
      {(g) => (
        <>
          <PageHeader
            title={g.name}
            description={`O‘qituvchi: ${g.teacher.fullName}${g.academicYear ? ` · ${g.academicYear}` : ''}`}
            tag={<Tag color={GROUP_KIND[g.kind].color}>{GROUP_KIND[g.kind].label}</Tag>}
            extra={
              <>
                <Select value={g.kind} options={toOptions(GROUP_KIND)} onChange={(k) => setKind.mutate(k)} className="w-44" />
                <Popconfirm title="Guruhni o‘chirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => removeGroup.mutate()}>
                  <Button danger>O‘chirish</Button>
                </Popconfirm>
              </>
            }
          />
          <Card title={`Talabalar (${g.members?.length ?? 0})`} className="mb-6">
            <AddMembers groupId={g.id} existing={g.members?.map((m) => m.studentId) ?? []} />
          </Card>
          <Card title="Guruh a’zolari">
            <Table
              rowKey="studentId"
              dataSource={g.members ?? []}
              pagination={false}
              scroll={{ x: 640 }}
              locale={{ emptyText: 'Guruhda talaba yo‘q' }}
              columns={[
                { title: 'Talaba', render: (_, m) => <div><div>{m.student.fullName}</div><div className="text-xs text-muted">@{m.student.username}</div></div> },
                {
                  title: '',
                  width: 300,
                  render: (_, m) => (
                    <Space>
                      <Link to={`/app/progress/students/${m.studentId}`}>Test natijalari</Link>
                      <Link to={`/app/portfolio/students/${m.studentId}`}>Portfolio</Link>
                      <Popconfirm title="Guruhdan chiqarasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => removeMember.mutate(m.studentId)}>
                        <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="Chiqarish" />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </QueryState>
  );
}
