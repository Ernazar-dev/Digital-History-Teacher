import { ClockCircleOutlined, PlusOutlined, ReadOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Modal, Segmented, Select } from 'antd';
import { useState, type ReactNode } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { useUrlState } from '@/hooks/useUrlState';
import { ROLE, toOptions, USER_STATUS } from '@/lib/labels';
import { usersService } from '@/services/people.service';
import type { Role, User, UserStatus } from '@/types/api';
import { UserFormModal } from '../components/UserFormModal';
import { UsersTable } from '../components/UsersTable';

/** Yuqoridagi kartalar: har biri ro'yxatni tegishli filtrga o'tkazadi */
const STATS: { key: string; label: string; icon: ReactNode; tone: string; role?: Role; status?: UserStatus }[] = [
  { key: 'ALL', label: 'Jami foydalanuvchi', icon: <TeamOutlined />, tone: 'bg-primary-soft text-primary' },
  { key: 'STUDENT', label: 'Talabalar', icon: <ReadOutlined />, tone: 'bg-sky-50 text-sky-700', role: 'STUDENT' },
  { key: 'TEACHER', label: 'O‘qituvchilar', icon: <UserOutlined />, tone: 'bg-emerald-50 text-emerald-700', role: 'TEACHER' },
  { key: 'PENDING', label: 'Tasdiq kutmoqda', icon: <ClockCircleOutlined />, tone: 'bg-accent-soft text-[#8f6a24]', status: 'PENDING' },
];

export default function UsersPage() {
  const [f, setF] = useUrlState<{ role?: Role; status?: UserStatus; q?: string; page?: number }>(['page']);
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['users', f], queryFn: () => usersService.list({ ...f, pageSize: 20 }), placeholderData: keepPreviousData });
  // Kartalardagi sonlar — faqat jami (pageSize: 1)
  const countList = useQueries({
    queries: STATS.map((s) => ({ queryKey: ['users', 'count', s.key], queryFn: () => usersService.list({ role: s.role, status: s.status, pageSize: 1 }) })),
  });
  const counts = Object.fromEntries(STATS.map((s, i) => [s.key, countList[i]]));
  const create = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      notify.success('Foydalanuvchi yaratildi');
      setCreating(false);
    },
    onError: (e) => notify.error(e),
  });
  const reset = useMutation({
    mutationFn: () => usersService.resetPassword(resetFor!.id, newPassword),
    onSuccess: () => {
      notify.success('Parol yangilandi, foydalanuvchi sessiyalari bekor qilindi');
      setResetFor(null);
      setNewPassword('');
    },
    onError: (e) => notify.error(e),
  });

  return (
    <>
      <PageHeader
        title="Foydalanuvchilar"
        description="Ro‘yxatdan o‘tganlarni tasdiqlash, rollarni tayinlash va hisoblarni boshqarish."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>Yangi foydalanuvchi</Button>}
      />
      {/* Umumiy ko'rinish — karta bosilsa, ro'yxat shunga filtrlanadi */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => {
          const active = s.key === 'ALL' ? !f.role && !f.status : s.status ? f.status === s.status : f.role === s.role && !f.status;
          const count = counts[s.key]?.data?.meta.total;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setF({ role: s.role, status: s.status, page: 1 })}
              className={`flex cursor-pointer items-center gap-4 rounded-2xl border border-solid p-4 text-left transition-all duration-200 ${
                active ? 'border-primary bg-primary-soft shadow-sm' : 'border-line bg-white hover:border-primary/40'
              }`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${s.tone}`}>{s.icon}</span>
              <span className="min-w-0">
                <span className="font-serif-title block text-2xl font-bold leading-none text-ink tabular-nums">{count ?? '…'}</span>
                <span className="mt-1 block truncate text-[13px] text-muted">{s.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      <Card styles={{ body: { padding: 0 } }}>
        <div className="flex flex-wrap items-center gap-3 border-0 border-b border-solid border-line p-4">
          <Input.Search className="max-w-sm flex-1" placeholder="Ism, login yoki email" allowClear defaultValue={f.q} onSearch={(v) => setF({ q: v, page: 1 })} />
          <Segmented
            value={f.role ?? 'ALL'}
            onChange={(v) => setF({ role: v === 'ALL' ? undefined : (v as Role), page: 1 })}
            options={[{ value: 'ALL', label: 'Barchasi' }, ...toOptions(ROLE)]}
          />
          <Select className="ml-auto w-44" allowClear placeholder="Holat" value={f.status} options={toOptions(USER_STATUS)} onChange={(v) => setF({ status: v, page: 1 })} />
        </div>
        <QueryState query={q}>
          {(d) => <UsersTable data={d.data} total={d.meta.total} page={f.page ?? 1} onPage={(page) => setF({ page })} onResetPassword={setResetFor} />}
        </QueryState>
      </Card>
      <UserFormModal open={creating} onClose={() => setCreating(false)} onSubmit={(v) => create.mutate({ ...v, institution: v.institution || undefined })} loading={create.isPending} />
      <Modal
        open={Boolean(resetFor)}
        title={`Parolni tiklash: ${resetFor?.fullName ?? ''}`}
        okText="Saqlash"
        cancelText="Bekor qilish"
        onCancel={() => setResetFor(null)}
        okButtonProps={{ disabled: newPassword.length < 8, loading: reset.isPending }}
        onOk={() => reset.mutate()}
      >
        <Input.Password placeholder="Yangi parol (kamida 8 belgi)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </Modal>
    </>
  );
}
