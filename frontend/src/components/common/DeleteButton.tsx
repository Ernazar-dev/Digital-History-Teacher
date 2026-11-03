import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '@/hooks/useNotify';

/**
 * Kontent sahifasining o'zida o'chirish tugmasi (tasdiq so'raladi).
 * O'chirilgach ro'yxat yangilanadi va foydalanuvchi ro'yxat sahifasiga qaytariladi.
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
      notify.success(`${what} o‘chirildi`);
      navigate(backTo);
    },
    onError: (e) => notify.error(e, `${what} o‘chirilmadi`),
  });
  return (
    <Popconfirm title={`${what}ni o‘chirasizmi?`} okText="Ha, o‘chirish" cancelText="Yo‘q" okButtonProps={{ danger: true }} onConfirm={() => remove.mutate()}>
      <Button danger icon={<DeleteOutlined />} loading={remove.isPending}>O‘chirish</Button>
    </Popconfirm>
  );
};
