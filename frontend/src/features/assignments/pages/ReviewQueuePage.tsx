import { useQuery } from '@tanstack/react-query';
import { Card, Segmented, Table, Tag } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { reviewService } from '@/services/learning.service';
import type { ReviewItem } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { reviewLink } from '../reviewLink';

const KIND: Record<ReviewItem['kind'], { label: string; color: string }> = {
  SUBMISSION: { label: 'Topshiriq', color: 'blue' },
  ANALYSIS: { label: 'Manba tahlili', color: 'purple' },
  COMPARISON: { label: 'Taqqoslash', color: 'geekblue' },
  LESSON: { label: 'Dars ishlanmasi', color: 'green' },
  VIRTUAL: { label: '3D/360° ish', color: 'cyan' },
  DIAGNOSTIC: { label: 'Diagnostika', color: 'gold' },
};

export default function ReviewQueuePage() {
  const [kind, setKind] = useState<string>('ALL');
  const q = useQuery({ queryKey: ['review-queue'], queryFn: reviewService.queue });
  return (
    <>
      <PageHeader title="Tekshiruv navbati" description="Guruhlaringizdagi talabalar topshirgan va baho kutayotgan barcha ishlar (eng eskisi birinchi)." />
      <Card>
        <div className="mb-4 max-w-full overflow-x-auto pb-1">
          <Segmented value={kind} onChange={(v) => setKind(String(v))} options={[{ value: 'ALL', label: 'Barchasi' }, ...Object.entries(KIND).map(([value, k]) => ({ value, label: k.label }))]} />
        </div>
        <QueryState query={q} isEmpty={(d) => d.length === 0} empty="Tekshirilishi kerak bo‘lgan ishlar yo‘q">
          {(items) => (
            <Table
              rowKey={(r) => `${r.kind}-${r.id}`}
              dataSource={items.filter((i) => kind === 'ALL' || i.kind === kind)}
              scroll={{ x: 700 }}
              columns={[
                { title: 'Turi', width: 160, render: (_, r) => <Tag color={KIND[r.kind].color}>{KIND[r.kind].label}</Tag> },
                { title: 'Ish', render: (_, r) => <Link to={reviewLink(r.kind, r.id)}>{r.title}</Link> },
                { title: 'Talaba', width: 200, render: (_, r) => r.student.fullName },
                { title: 'Topshirilgan', width: 160, render: (_, r) => fmtDateTime(r.submittedAt) },
              ]}
            />
          )}
        </QueryState>
      </Card>
    </>
  );
}
