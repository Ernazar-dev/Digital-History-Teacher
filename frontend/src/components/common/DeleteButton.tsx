import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';

/**
 * Kontent sahifasining özida öçiriş tugmasi (tasdiq söraladi).
 * Öçirilgaç röyxat yangilanadi va foydalanuvçi röyxat sahifasiga qaytariladi.
 */
export const DeleteButton = ({ onDelete, invalidate, backTo, what }: {
  onDelete: () => Promise<unknown>;
  invalidate: string[];
  backTo: string;
  what: string;
}) => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const notify = useNotify();
  const remove = useMutation({
    mutationFn: onDelete,
    onSuccess: () => {
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      notify.success(i18n.t('deleteBtn.done', { what }));
      navigate(backTo);
    },
    onError: (e) => notify.error(e, i18n.t('deleteBtn.fail', { what })),
  });
  return (
    <Popconfirm title={i18n.t('deleteBtn.confirm', { what })} okText={i18n.t('deleteBtn.yes')} cancelText={i18n.t('tests.no')} okButtonProps={{ danger: true }} onConfirm={() => remove.mutate()}>
      <Button danger icon={<DeleteOutlined />} loading={remove.isPending}>{i18n.t('users.del')}</Button>
    </Popconfirm>
  );
};
