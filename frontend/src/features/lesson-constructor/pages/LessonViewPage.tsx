import { EditOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { ReviewPanel, TeacherVerdict } from '@/components/common/ReviewPanel';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { WORK_STATUS } from '@/lib/labels';
import { lessonsService, type LessonReviewInput } from '@/services/learning.service';
import { fmtDateTime } from '@/utils/format';
import { LessonDocument } from '../components/LessonDocument';

export default function LessonViewPage() {
  const { id = '' } = useParams();
  const { user, isStaff } = useAuth();
  const siteView = useSiteViewStore((s) => s.siteView);
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['lesson', id], queryFn: () => lessonsService.get(id) });
  const review = useMutation({
    mutationFn: (v: LessonReviewInput) => lessonsService.review(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lesson', id] }); notify.success('Ekspertiza natijasi saqlandi'); },
    onError: (e) => notify.error(e),
  });

  return (
    <QueryState query={q}>
      {(l) => (
        <div className="space-y-6">
          <PageHeader
            title={l.title}
            tag={<StatusTag map={WORK_STATUS} value={l.status} />}
            extra={
              <>
                {l.author.id === user?.id && ['DRAFT', 'RETURNED'].includes(l.status) && (
                  <Link to={`/app/lessons/${l.id}/edit`}><Button type="primary" icon={<EditOutlined />}>Tahrirlash</Button></Link>
                )}
              </>
            }
          />
          <div><TeacherVerdict comment={l.teacherComment} score={l.score} status={l.status} /></div>
          {l.reviewedBy && l.reviewedAt && (
            <p className="-mt-3 text-sm text-muted">Ekspert: {l.reviewedBy.fullName} · {fmtDateTime(l.reviewedAt)}</p>
          )}
          <LessonDocument l={l} />
          {isStaff && !siteView && l.author.id !== user?.id && ['SUBMITTED', 'UNDER_REVIEW'].includes(l.status) && (
            <ReviewPanel title="Dars ishlanmasi ekspertizasi" loading={review.isPending} onSubmit={(v) => review.mutate(v)} />
          )}
        </div>
      )}
    </QueryState>
  );
}
