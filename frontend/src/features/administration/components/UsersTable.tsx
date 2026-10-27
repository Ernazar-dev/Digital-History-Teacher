import { CheckOutlined, DeleteOutlined, KeyOutlined, LockOutlined, MoreOutlined, UnlockOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Avatar, Button, Dropdown, Select, Space, Table, Tooltip, type MenuProps } from 'antd';
import dayjs from 'dayjs';
import { StatusTag } from '@/components/common/StatusTag';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { ROLE, toOptions, USER_STATUS } from '@/lib/labels';
import { groupsService, usersService } from '@/services/people.service';
import type { Role, User, UserStatus } from '@/types/api';
import { fmtDateTime } from '@/utils/format';

interface Props { data: User[]; total: number; page: number; onPage: (p: number) => void; onResetPassword: (u: User) => void }

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || '?';
const AVATAR_BG: Record<Role, string> = { ADMIN: 'linear-gradient(135deg,#f3dd9e,#c29a45)', TEACHER: 'linear-gradient(135deg,#284b8a,#0b1530)', STUDENT: 'linear-gradient(135deg,#9fb3d6,#5a74a3)' };

/** Oxirgi kirish: yaqin sanalar odamga tushunarli shaklda, ustiga kelganda aniq vaqt */
const lastSeen = (d: string | null) => {
  if (!d) return <span className="text-muted">Kirmagan</span>;
  const days = dayjs().startOf('day').diff(dayjs(d).startOf('day'), 'day');
  const label = days === 0 ? `Bugun, ${dayjs(d).format('HH:mm')}` : days === 1 ? `Kecha, ${dayjs(d).format('HH:mm')}` : days < 7 ? `${days} kun oldin` : dayjs(d).format('DD.MM.YYYY');
  return <Tooltip title={fmtDateTime(d)}><span>{label}</span></Tooltip>;
};

export const UsersTable = ({ data, total, page, onPage, onResetPassword }: Props) => {
  const { user: me } = useAuth();
  const { modal } = App.useApp();
  const qc = useQueryClient();
  const notify = useNotify();
  const done = (msg: string) => () => {
    qc.invalidateQueries({ queryKey: ['users'] });
    notify.success(msg);
  };
  const update = useMutation({
    mutationFn: (v: { id: string; role?: Role; status?: UserStatus }) => usersService.update(v.id, { role: v.role, status: v.status }),
    onSuccess: done('Saqlandi'),
    onError: (e) => notify.error(e),
  });
  const groups = useQuery({ queryKey: ['groups'], queryFn: groupsService.list });
  const setGroup = useMutation({
    mutationFn: (v: { id: string; groupId: string | null }) => usersService.setGroup(v.id, v.groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['group'] });
      done('Guruh saqlandi')();
    },
    onError: (e) => notify.error(e),
  });
  const approve = useMutation({ mutationFn: usersService.approve, onSuccess: done('Tasdiqlandi'), onError: (e) => notify.error(e) });
  const remove = useMutation({ mutationFn: usersService.remove, onSuccess: done('O‘chirildi'), onError: (e) => notify.error(e) });

  /** Kam ishlatiladigan amallar bitta «⋯» menyuda — jadval ixcham qoladi */
  const actions = (u: User): MenuProps['items'] => [
    u.status === 'ACTIVE'
      ? { key: 'block', icon: <LockOutlined />, label: 'Bloklash', onClick: () => update.mutate({ id: u.id, status: 'BLOCKED' }) }
      : u.status === 'BLOCKED'
        ? { key: 'unblock', icon: <UnlockOutlined />, label: 'Faollashtirish', onClick: () => update.mutate({ id: u.id, status: 'ACTIVE' }) }
        : null,
    { key: 'reset', icon: <KeyOutlined />, label: 'Parolni tiklash', onClick: () => onResetPassword(u) },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      danger: true,
      label: 'O‘chirish',
      onClick: () =>
        modal.confirm({
          title: `${u.fullName} o‘chirilsinmi?`,
          content: 'Hisob o‘chiriladi, lekin uning ishlari va natijalari saqlanib qoladi.',
          okText: 'O‘chirish',
          okButtonProps: { danger: true },
          cancelText: 'Bekor qilish',
          onOk: () => remove.mutateAsync(u.id),
        }),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={data}
      scroll={{ x: 880 }}
      rowClassName={(u) => (u.status === 'PENDING' ? 'bg-accent-soft/40' : '')}
      pagination={{ current: page, pageSize: 20, total, onChange: onPage, showSizeChanger: false, hideOnSinglePage: true, showTotal: (t) => `Jami: ${t}` }}
      columns={[
        {
          title: 'Foydalanuvchi',
          render: (_, u) => (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size={38} className="shrink-0 !text-[13px] !font-semibold !text-white" style={{ background: AVATAR_BG[u.role] }}>{initials(u.fullName)}</Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium text-ink">{u.fullName}{u.id === me?.id && <span className="ml-2 text-xs font-normal text-muted">(siz)</span>}</div>
                <div className="truncate text-xs text-muted">@{u.username}{u.email ? ` · ${u.email}` : ''}</div>
              </div>
            </div>
          ),
        },
        {
          title: 'Rol',
          width: 150,
          render: (_, u) => (
            <Select size="small" variant="filled" className="w-[132px]" value={u.role} disabled={u.id === me?.id} options={toOptions(ROLE)} onChange={(role) => update.mutate({ id: u.id, role })} />
          ),
        },
        {
          title: 'Guruh',
          width: 200,
          render: (_, u) =>
            u.role === 'STUDENT' ? (
              <Select
                size="small"
                variant="filled"
                className="w-[180px]"
                allowClear
                placeholder={<span className="text-amber-700">Guruhsiz</span>}
                value={u.groups?.[0]?.id}
                loading={groups.isLoading}
                options={(groups.data ?? []).map((g) => ({ value: g.id, label: g.name }))}
                onChange={(groupId?: string) => setGroup.mutate({ id: u.id, groupId: groupId ?? null })}
              />
            ) : (
              <span className="text-muted">—</span>
            ),
        },
        { title: 'Holat', width: 140, render: (_, u) => <StatusTag map={USER_STATUS} value={u.status} /> },
        { title: 'Oxirgi kirish', width: 140, render: (_, u) => <span className="whitespace-nowrap text-sm">{lastSeen(u.lastLoginAt)}</span> },
        {
          title: '',
          width: 150,
          align: 'right',
          render: (_, u) =>
            u.id !== me?.id && (
              <Space size={6}>
                {u.status === 'PENDING' && (
                  <Button size="small" type="primary" icon={<CheckOutlined />} loading={approve.isPending && approve.variables === u.id} onClick={() => approve.mutate(u.id)}>
                    Tasdiqlash
                  </Button>
                )}
                <Dropdown menu={{ items: actions(u) }} trigger={['click']} placement="bottomRight">
                  <Button size="small" type="text" icon={<MoreOutlined />} aria-label={`${u.fullName}: amallar`} />
                </Dropdown>
              </Space>
            ),
        },
      ]}
    />
  );
};
