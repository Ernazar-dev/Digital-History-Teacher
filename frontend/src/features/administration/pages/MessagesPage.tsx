import { CheckOutlined, DeleteOutlined, MailOutlined, PhoneOutlined, UndoOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, Popconfirm, Segmented, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { messagesService, type ContactMessage } from '@/services/messages.service';
import { fmtDateTime } from '@/utils/format';

const PAGE_SIZE = 20;

/** Administrator: «Muallif va boğlaniş» formasidan kelgan xabarlar */
export default function MessagesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const notify = useNotify();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ['messages', filter, page],
    queryFn: () => messagesService.list({ page, pageSize: PAGE_SIZE, unread: filter === 'unread' }),
  });
  const unread = useQuery({ queryKey: ['messages', 'unread-count'], queryFn: messagesService.unreadCount, refetchInterval: 60_000 });

  const refresh = () => qc.invalidateQueries({ queryKey: ['messages'] });
  const toggle = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => messagesService.setRead(id, isRead),
    onSuccess: refresh,
    onError: (e) => notify.error(e),
  });
  const remove = useMutation({
    mutationFn: messagesService.remove,
    onSuccess: () => {
      refresh();
      notify.success(i18n.t('deleteBtn.done', { what: t('messages.what') }));
    },
    onError: (e) => notify.error(e, i18n.t('deleteBtn.fail', { what: t('messages.what') })),
  });

  return (
    <>
      <PageHeader
        title={t('messages.title')}
        description={t('messages.desc')}
        tag={unread.data ? <Tag color="blue">{t('messages.unread', { count: unread.data })}</Tag> : undefined}
        extra={
          <Segmented
            value={filter}
            onChange={(v) => {
              setFilter(v as 'all' | 'unread');
              setPage(1);
            }}
            options={[
              { value: 'all', label: t('messages.all') },
              { value: 'unread', label: t('messages.unreadOnly') },
            ]}
          />
        }
      />
      <Card>
        <QueryState query={list} isEmpty={(d) => d.data.length === 0} empty={t('messages.empty')}>
          {(res) => (
            <Table<ContactMessage>
              rowKey="id"
              dataSource={res.data}
              scroll={{ x: 760 }}
              pagination={{ current: page, pageSize: PAGE_SIZE, total: res.meta.total, showSizeChanger: false, onChange: setPage, hideOnSinglePage: true }}
              columns={[
                {
                  title: t('messages.colFrom'),
                  width: 190,
                  render: (_, m) => (
                    <Space size={8} align="start">
                      <Badge status={m.isRead ? 'default' : 'processing'} className="mt-1.5" />
                      <div>
                        <Typography.Text strong={!m.isRead}>{m.name}</Typography.Text>
                        {!m.isRead && <Tag color="blue" className="ml-2">{t('messages.new')}</Tag>}
                      </div>
                    </Space>
                  ),
                },
                {
                  title: t('messages.colContact'),
                  width: 230,
                  render: (_, m) => (
                    <div className="space-y-1 text-sm">
                      {m.email && <div><MailOutlined className="mr-2 text-muted" /><a href={`mailto:${m.email}`}>{m.email}</a></div>}
                      {m.phone && <div><PhoneOutlined className="mr-2 text-muted" /><a href={`tel:${m.phone.replace(/[^\d+]/g, '')}`}>{m.phone}</a></div>}
                    </div>
                  ),
                },
                {
                  title: t('messages.colMessage'),
                  render: (_, m) => <div className={`whitespace-pre-wrap break-words ${m.isRead ? 'text-muted' : ''}`}>{m.message}</div>,
                },
                { title: t('messages.colDate'), width: 150, render: (_, m) => <span className="whitespace-nowrap text-muted">{fmtDateTime(m.createdAt)}</span> },
                {
                  title: '',
                  width: 110,
                  render: (_, m) => (
                    <Space>
                      <Tooltip title={m.isRead ? t('messages.markUnread') : t('messages.markRead')}>
                        <Button
                          aria-label={m.isRead ? t('messages.markUnread') : t('messages.markRead')}
                          icon={m.isRead ? <UndoOutlined /> : <CheckOutlined />}
                          loading={toggle.isPending && toggle.variables?.id === m.id}
                          onClick={() => toggle.mutate({ id: m.id, isRead: !m.isRead })}
                        />
                      </Tooltip>
                      <Popconfirm
                        title={i18n.t('deleteBtn.confirm', { what: t('messages.what') })}
                        okText={i18n.t('deleteBtn.yes')}
                        okButtonProps={{ danger: true }}
                        onConfirm={() => remove.mutate(m.id)}
                      >
                        <Button danger aria-label={t('messages.what')} icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          )}
        </QueryState>
      </Card>
    </>
  );
}
