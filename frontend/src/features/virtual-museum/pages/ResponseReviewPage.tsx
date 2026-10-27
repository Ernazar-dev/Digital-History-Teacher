import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Tag } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { ReviewPanel, TeacherVerdict } from '@/components/common/ReviewPanel';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { TASK_KIND, WORK_STATUS } from '@/lib/labels';
import { museumService } from '@/services/museum.service';

export default function ResponseReviewPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['virtual-response', id], queryFn: () => museumService.response(id) });
  const review = useMutation({
    mutationFn: (v: { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number }) => museumService.reviewResponse(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['virtual-response', id] }); notify.success('Saqlandi'); },
    onError: (e) => notify.error(e),
  });
  return (
    <QueryState query={q}>
      {(r) => (
        <div className="space-y-6">
          <PageHeader
            title={`Virtual obyekt asosidagi ish: ${r.virtualObject?.title ?? ''}`}
            tag={<StatusTag map={WORK_STATUS} value={r.status} />}
            description={<>Talaba: {r.student?.fullName} · <Link to={`/app/museum/${r.virtualObject?.slug}`}>Obyektni ochish</Link></>}
          />
          <TeacherVerdict comment={r.teacherComment} score={r.score} status={r.status} />
          <Card title="Javoblar">
            {r.virtualObject?.tasks.map((t, i) => (
              <div key={t.id} className="mb-4">
                <div className="mb-1 font-medium"><Tag color="gold">{TASK_KIND[t.kind]}</Tag> {i + 1}. {t.prompt}</div>
                <div className="prose-text rounded bg-canvas p-3">{r.answers[t.id] || '—'}</div>
              </div>
            ))}
            <div className="mb-1 font-medium">Mashg‘ulot loyihasi</div>
            <div className="prose-text rounded bg-canvas p-3">{r.activityDesign || '—'}</div>
          </Card>
          {['SUBMITTED', 'UNDER_REVIEW'].includes(r.status) && (
            <ReviewPanel loading={review.isPending} onSubmit={(v) => review.mutate(v)} componentHint="Baho «Faoliyatli-metodik» komponentga «Amaliy topshiriq» dalili sifatida yoziladi." />
          )}
        </div>
      )}
    </QueryState>
  );
}
