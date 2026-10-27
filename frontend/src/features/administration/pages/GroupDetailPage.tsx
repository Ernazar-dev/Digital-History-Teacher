import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { GROUP_KIND, toOptions } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import { groupsService } from '@/services/people.service';
import type { GroupKind } from '@/types/api';
import { fmtPercent } from '@/utils/format';
import { AddMembers } from '../components/AddMembers';
import { LeaderboardCard } from '@/features/progress/components/LeaderboardCard';

export default function GroupDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const notify = useNotify();
  const group = useQuery({ queryKey: ['group', id], queryFn: () => groupsService.get(id) });
  const summary = useQuery({ queryKey: ['group-summary', id], queryFn: () => assessmentsService.groupSummary(id) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['group', id] });
    qc.invalidateQueries({ queryKey: ['group-summary', id] });
    qc.invalidateQueries({ queryKey: ['groups'] });
  };
  const setKind = useMutation({ mutationFn: (kind: GroupKind) => groupsService.update(id, { kind }), onSuccess: () => { refresh(); notify.success('Guruh turi o‘zgartirildi'); }, onError: (e) => notify.error(e) });
  const removeMember = useMutation({ mutationFn: (studentId: string) => groupsService.removeMember(id, studentId), onSuccess: refresh, onError: (e) => notify.error(e) });
  const removeGroup = useMutation({ mutationFn: () => groupsService.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); navigate('/app/groups'); }, onError: (e) => notify.error(e) });
  const exportCsv = useMutation({ mutationFn: () => assessmentsService.downloadGroupCsv(id, group.data?.name ?? 'guruh'), onError: (e) => notify.error(e) });

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
                <Button icon={<DownloadOutlined />} loading={exportCsv.isPending} onClick={() => exportCsv.mutate()}>CSV hisobot</Button>
                <Popconfirm title="Guruhni o‘chirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => removeGroup.mutate()}>
                  <Button danger>O‘chirish</Button>
                </Popconfirm>
              </>
            }
          />
          <Card title={`Talabalar (${g.members?.length ?? 0})`} className="mb-6">
            <AddMembers groupId={g.id} existing={g.members?.map((m) => m.studentId) ?? []} />
          </Card>
          <div className="mb-6"><LeaderboardCard groupId={g.id} staff /></div>
          <Card title="Talabalar kompetensiyasi (komponentlar bo‘yicha)">
            <QueryState query={summary} isEmpty={(s) => s.rows.length === 0} empty="Guruhda talaba yo‘q">
              {(s) => (
                <Table
                  rowKey={(r) => r.student.id}
                  dataSource={s.rows}
                  pagination={false}
                  scroll={{ x: 1000 }}
                  columns={[
                    { title: 'Talaba', fixed: 'left', width: 200, render: (_, r) => <div><div>{r.student.fullName}</div><div className="text-xs text-muted">{r.student.username && `@${r.student.username}`}</div></div> },
                    { title: 'Boshlang‘ich', render: (_, r) => fmtPercent(r.initial) },
                    { title: 'Yakuniy', render: (_, r) => fmtPercent(r.final) },
                    { title: 'Umumiy', render: (_, r) => <span>{fmtPercent(r.overall)} {r.level && <Tag>{r.level.name}</Tag>}</span> },
                    ...s.components.map((c) => ({ title: c.name, render: (_: unknown, r: (typeof s.rows)[number]) => fmtPercent(r.components[c.code]) })),
                    {
                      title: '',
                      width: 230,
                      render: (_, r) => (
                        <Space>
                          <Link to={`/app/portfolio/students/${r.student.id}`}>Portfolio</Link>
                          <Link to={`/app/competence/students/${r.student.id}`}>Profil</Link>
                          <Popconfirm title="Guruhdan chiqarasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => removeMember.mutate(r.student.id)}>
                            <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="Chiqarish" />
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              )}
            </QueryState>
          </Card>
        </>
      )}
    </QueryState>
  );
}
