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
import { GROUP_KIND, toOptions } from '@/lib/labels';
import { groupsService } from '@/services/people.service';

const schema = z.object({
  name: z.string().trim().min(2, 'Guruh nomini kiriting'),
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
      notify.success('Guruh yaratildi');
      setOpen(false);
      form.reset();
    },
    onError: (e) => notify.error(e),
  });
  return (
    <>
      <PageHeader
        title="O‘quv guruhlari"
        description="Pedagogik eksperiment uchun guruhni «Tajriba» yoki «Nazorat» turi bilan belgilang — eksperiment hisobotida ular taqqoslanadi."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Yangi guruh</Button>}
      />
      <Card>
        <QueryState query={q} isEmpty={(d) => d.length === 0} empty="Guruhlar yo‘q">
          {(groups) => (
            <Table
              rowKey="id"
              dataSource={groups}
              scroll={{ x: 700 }}
              columns={[
                { title: 'Guruh', render: (_, g) => <Link to={`/app/groups/${g.id}`}>{g.name}</Link> },
                { title: 'Turi', render: (_, g) => <StatusTag map={GROUP_KIND} value={g.kind} /> },
                { title: 'O‘quv yili', dataIndex: 'academicYear' },
                { title: 'O‘qituvchi', render: (_, g) => g.teacher.fullName },
                { title: 'Talabalar', render: (_, g) => g._count.members },
                { title: 'Topshiriqlar', render: (_, g) => g._count.assignments },
              ]}
            />
          )}
        </QueryState>
      </Card>
      <Modal open={open} title="Yangi guruh" okText="Yaratish" cancelText="Bekor qilish" confirmLoading={create.isPending} onCancel={() => setOpen(false)} onOk={form.handleSubmit((v) => create.mutate(v))}>
        <Form layout="vertical" component="div">
          <TextField control={form.control} name="name" label="Nomi" required />
          <div className="grid gap-x-4 sm:grid-cols-2">
            <SelectField control={form.control} name="kind" label="Turi" options={toOptions(GROUP_KIND)} />
            <TextField control={form.control} name="academicYear" label="O‘quv yili" placeholder="2026–2027" />
          </div>
          <TextAreaField control={form.control} name="description" label="Tavsif" rows={2} />
        </Form>
      </Modal>
    </>
  );
}
