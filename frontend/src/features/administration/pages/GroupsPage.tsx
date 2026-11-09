import { PlusOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Form, Modal, Table } from 'antd';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { SelectField, TextAreaField, TextField } from '@/components/forms/fields';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { GROUP_KIND, toOptions } from '@/lib/labels';
import { groupsService } from '@/services/people.service';

const schema = z.object({
  name: z.string().trim().min(2, 'validation.groupName'),
  kind: z.enum(['REGULAR', 'EXPERIMENTAL', 'CONTROL']),
  academicYear: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});
type Values = z.infer<typeof schema>;

export default function GroupsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const q = useQuery({ queryKey: ['groups'], queryFn: groupsService.list });
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', kind: 'REGULAR', academicYear: '', description: '' } });
  const create = useMutation({
    mutationFn: groupsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      notify.success(i18n.t('groups.created'));
      setOpen(false);
      form.reset();
    },
    onError: (e) => notify.error(e),
  });
  return (
    <>
      <PageHeader
        title={i18n.t('groups.title')}
        description={i18n.t('groups.desc')}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>{i18n.t('groups.new')}</Button>}
      />
      <Card>
        <QueryState query={q} isEmpty={(d) => d.length === 0} empty={i18n.t('groups.empty')}>
          {(groups) => (
            <Table
              rowKey="id"
              dataSource={groups}
              scroll={{ x: 700 }}
              columns={[
                { title: i18n.t('groups.colGroup'), render: (_, g) => <Link to={`/app/groups/${g.id}`}>{g.name}</Link> },
                { title: i18n.t('groups.colKind'), render: (_, g) => <StatusTag map={GROUP_KIND} value={g.kind} /> },
                { title: i18n.t('groups.colYear'), dataIndex: 'academicYear' },
                { title: i18n.t('groups.colTeacher'), render: (_, g) => g.teacher.fullName },
                { title: i18n.t('groups.colStudents'), render: (_, g) => g._count.members },
              ]}
            />
          )}
        </QueryState>
      </Card>
      <Modal open={open} title={i18n.t('groups.new')} okText={i18n.t('users.create')} cancelText={i18n.t('common.cancel')} confirmLoading={create.isPending} onCancel={() => setOpen(false)} onOk={form.handleSubmit((v) => create.mutate(v))}>
        <Form layout="vertical" component="div">
          <TextField control={form.control} name="name" label={i18n.t('groups.name')} required />
          <div className="grid gap-x-4 sm:grid-cols-2">
            <SelectField control={form.control} name="kind" label={i18n.t('groups.colKind')} options={toOptions(GROUP_KIND)} />
            <TextField control={form.control} name="academicYear" label={i18n.t('groups.colYear')} placeholder="2026–2027" />
          </div>
          <TextAreaField control={form.control} name="description" label={i18n.t('groups.description')} rows={2} />
        </Form>
      </Modal>
    </>
  );
}
