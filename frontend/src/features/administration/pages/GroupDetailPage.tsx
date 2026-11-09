import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
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
  const setKind = useMutation({ mutationFn: (kind: GroupKind) => groupsService.update(id, { kind }), onSuccess: () => { refresh(); notify.success(i18n.t('groups.kindChanged')); }, onError: (e) => notify.error(e) });
  const removeMember = useMutation({ mutationFn: (studentId: string) => groupsService.removeMember(id, studentId), onSuccess: refresh, onError: (e) => notify.error(e) });
  const removeGroup = useMutation({ mutationFn: () => groupsService.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); navigate('/app/groups'); }, onError: (e) => notify.error(e) });

  return (
    <QueryState query={group}>
      {(g) => (
        <>
          <PageHeader
            title={g.name}
            description={`${i18n.t('groups.teacherOf', { name: g.teacher.fullName })}${g.academicYear ? ` · ${g.academicYear}` : ''}`}
            tag={<Tag color={GROUP_KIND[g.kind].color}>{GROUP_KIND[g.kind].label}</Tag>}
            extra={
              <>
                <Select value={g.kind} options={toOptions(GROUP_KIND)} onChange={(k) => setKind.mutate(k)} className="w-44" />
                <Popconfirm title={i18n.t('groups.delQ')} okText={i18n.t('tests.yes')} cancelText={i18n.t('tests.no')} onConfirm={() => removeGroup.mutate()}>
                  <Button danger>{i18n.t('groups.del')}</Button>
                </Popconfirm>
              </>
            }
          />
          <Card title={i18n.t('groups.studentsN', { n: g.members?.length ?? 0 })} className="mb-6">
            <AddMembers groupId={g.id} existing={g.members?.map((m) => m.studentId) ?? []} />
          </Card>
          <Card title={i18n.t('groups.members')}>
            <Table
              rowKey="studentId"
              dataSource={g.members ?? []}
              pagination={false}
              scroll={{ x: 640 }}
              locale={{ emptyText: i18n.t('groups.noMembers') }}
              columns={[
                { title: i18n.t('groups.student'), render: (_, m) => <div><div>{m.student.fullName}</div><div className="text-xs text-muted">@{m.student.username}</div></div> },
                {
                  title: '',
                  width: 300,
                  render: (_, m) => (
                    <Space>
                      <Link to={`/app/progress/students/${m.studentId}`}>{i18n.t('groups.results')}</Link>
                      <Link to={`/app/portfolio/students/${m.studentId}`}>{i18n.t('groups.portfolio')}</Link>
                      <Popconfirm title={i18n.t('groups.removeQ')} okText={i18n.t('tests.yes')} cancelText={i18n.t('tests.no')} onConfirm={() => removeMember.mutate(m.studentId)}>
                        <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label={i18n.t('groups.remove')} />
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
