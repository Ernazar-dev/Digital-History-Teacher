import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Card, Input, Table } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { adminService } from '@/services/portfolio.service';
import { fmtDateTime } from '@/utils/format';

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const q = useQuery({ queryKey: ['audit', page, action], queryFn: () => adminService.auditLogs({ page, pageSize: 30, action: action || undefined }), placeholderData: keepPreviousData });
  return (
    <>
      <PageHeader title="Audit log" description="Muhim administrativ va baholash amallari tarixi." />
      <Card>
        <Input.Search className="mb-4 max-w-sm" placeholder="Amal bo‘yicha (masalan: user., source.)" allowClear onSearch={(v) => { setAction(v); setPage(1); }} />
        <QueryState query={q}>
          {(d) => (
            <Table
              rowKey="id"
              size="small"
              dataSource={d.data}
              scroll={{ x: 900 }}
              pagination={{ current: page, pageSize: 30, total: d.meta.total, onChange: setPage, showSizeChanger: false }}
              columns={[
                { title: 'Vaqt', width: 160, render: (_, a) => fmtDateTime(a.createdAt) },
                { title: 'Foydalanuvchi', width: 200, render: (_, a) => a.actor?.fullName ?? 'Tizim' },
                { title: 'Amal', dataIndex: 'action', width: 220 },
                { title: 'Obyekt', render: (_, a) => `${a.entity}${a.entityId ? ` · ${a.entityId.slice(0, 8)}` : ''}` },
                { title: 'IP', dataIndex: 'ip', width: 130 },
              ]}
            />
          )}
        </QueryState>
      </Card>
    </>
  );
}
