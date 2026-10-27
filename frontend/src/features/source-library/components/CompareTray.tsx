import { DiffOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Affix, Alert, Button, Card, Input, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '@/hooks/useNotify';
import { comparisonService } from '@/services/catalog.service';
import { MAX_COMPARE, useCompareStore } from '../compare.store';

/** Tanlangan manbalar paneli: taqqoslash ishi 2-modulda (tahlil laboratoriyasi) yaratiladi */
export const CompareTray = () => {
  const { ids, clear } = useCompareStore();
  const navigate = useNavigate();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const start = useMutation({
    mutationFn: () => comparisonService.create({ title: title.trim(), sourceIds: ids }),
    onSuccess: (c) => {
      clear();
      setOpen(false);
      navigate(`/app/analysis/comparisons/${c.id}`);
    },
    onError: (e) => notify.error(e),
  });
  const canStart = title.trim().length >= 3;

  if (ids.length === 0) return null;
  return (
    <>
      <Affix offsetBottom={16}>
        <Card size="small" className="mx-auto mt-6 max-w-xl shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Taqqoslash uchun tanlandi: <b>{ids.length}</b> / {MAX_COMPARE}</span>
            <div className="flex gap-2">
              <Button onClick={clear}>Tozalash</Button>
              <Button type="primary" icon={<DiffOutlined />} disabled={ids.length < 2} onClick={() => setOpen(true)}>
                Taqqoslash ishini boshlash
              </Button>
            </div>
          </div>
        </Card>
      </Affix>
      <Modal
        open={open}
        title="Taqqoslash ishini boshlash"
        okText="Boshlash"
        cancelText="Bekor qilish"
        onCancel={() => setOpen(false)}
        okButtonProps={{ disabled: !canStart, loading: start.isPending }}
        onOk={() => start.mutate()}
      >
        <Alert
          className="mb-3"
          type="info"
          showIcon
          message="Ish tahlil laboratoriyasida ochiladi: manbalar yonma-yon ko‘rsatiladi, topshirilgach portfolioga tushadi."
        />
        <Input
          autoFocus
          placeholder="Ish sarlavhasi (masalan: Amir Temur haqidagi ikki nuqtayi nazar)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onPressEnter={() => canStart && start.mutate()}
        />
      </Modal>
    </>
  );
};
