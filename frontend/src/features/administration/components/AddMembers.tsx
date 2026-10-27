import { UserAddOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Select } from 'antd';
import { useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { groupsService, usersService } from '@/services/people.service';

/** Faol talabalarni qidirib guruhga biriktirish */
export const AddMembers = ({ groupId, existing }: { groupId: string; existing: string[] }) => {
  const qc = useQueryClient();
  const notify = useNotify();
  const [q, setQ] = useState('');
  const [ids, setIds] = useState<string[]>([]);
  const students = useQuery({ queryKey: ['users', 'students', q], queryFn: () => usersService.list({ role: 'STUDENT', status: 'ACTIVE', q: q || undefined, pageSize: 50 }) });
  const add = useMutation({
    mutationFn: () => groupsService.addMembers(groupId, ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', groupId] });
      qc.invalidateQueries({ queryKey: ['group-summary', groupId] });
      setIds([]);
      notify.success('Talabalar biriktirildi');
    },
    onError: (e) => notify.error(e),
  });
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        mode="multiple"
        className="min-w-[280px] flex-1"
        placeholder="Talabalarni qidiring"
        filterOption={false}
        onSearch={setQ}
        value={ids}
        onChange={setIds}
        loading={students.isFetching}
        options={students.data?.data.filter((s) => !existing.includes(s.id)).map((s) => ({ value: s.id, label: `${s.fullName} (@${s.username})` }))}
      />
      <Button type="primary" icon={<UserAddOutlined />} disabled={!ids.length} loading={add.isPending} onClick={() => add.mutate()}>Biriktirish</Button>
    </div>
  );
};
