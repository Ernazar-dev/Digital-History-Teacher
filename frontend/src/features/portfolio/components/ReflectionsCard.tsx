import { DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, List, Popconfirm } from 'antd';
import { useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { portfolioService } from '@/services/portfolio.service';
import type { Reflection } from '@/types/api';
import { fmtDateTime } from '@/utils/format';

/** Refleksiv yozuvlar — refleksiv-baholash komponentining sifat dalili */
export const ReflectionsCard = ({ items, editable }: { items: Reflection[]; editable: boolean }) => {
  const qc = useQueryClient();
  const notify = useNotify();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['portfolio'] });
  const add = useMutation({
    mutationFn: () => portfolioService.addReflection({ title, content }),
    onSuccess: () => { refresh(); setTitle(''); setContent(''); notify.success(i18n.t('portfolio.refAdded')); },
    onError: (e) => notify.error(e),
  });
  const remove = useMutation({ mutationFn: portfolioService.deleteReflection, onSuccess: refresh, onError: (e) => notify.error(e) });
  return (
    <Card title={i18n.t('portfolio.refTitle')}>
      {editable && (
        <div className="mb-4 space-y-2">
          <Input placeholder={i18n.t('portfolio.refTitlePh')} value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input.TextArea rows={3} placeholder={i18n.t('portfolio.refContentPh')} value={content} onChange={(e) => setContent(e.target.value)} />
          <Button type="primary" disabled={title.trim().length < 2 || content.trim().length < 10} loading={add.isPending} onClick={() => add.mutate()}>{i18n.t('portfolio.add')}</Button>
        </div>
      )}
      <List
        dataSource={items}
        locale={{ emptyText: i18n.t('portfolio.refEmpty') }}
        renderItem={(r) => (
          <List.Item
            actions={editable ? [
              <Popconfirm key="d" title={i18n.t('portfolio.delQ')} okText={i18n.t('portfolio.yes')} cancelText={i18n.t('portfolio.no')} onConfirm={() => remove.mutate(r.id)}>
                <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label={i18n.t('portfolio.del')} />
              </Popconfirm>,
            ] : []}
          >
            <List.Item.Meta title={r.title} description={<><div className="text-xs">{fmtDateTime(r.createdAt)}</div><p className="prose-text mb-0 mt-1 text-ink">{r.content}</p></>} />
          </List.Item>
        )}
      />
    </Card>
  );
};
