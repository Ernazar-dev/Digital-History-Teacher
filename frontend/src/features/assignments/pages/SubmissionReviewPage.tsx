import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Collapse, Input, InputNumber, Radio, Table } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { SUBMISSION_STATUS } from '@/lib/labels';
import { submissionsService, type FeedbackInput } from '@/services/learning.service';
import type { Submission } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { FeedbackHistory } from '../components/FeedbackHistory';
import { SimulatorResultView } from '../components/Simulator';

export default function SubmissionReviewPage() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['submission', id], queryFn: () => submissionsService.get(id) });
  return <QueryState query={q}>{(s) => <Review s={s} />}</QueryState>;
}

const Review = ({ s }: { s: Submission }) => {
  const qc = useQueryClient();
  const notify = useNotify();
  const criteria = s.assignment?.rubric?.criteria ?? [];
  const [decision, setDecision] = useState<FeedbackInput['decision']>('GRADE');
  const [comment, setComment] = useState('');
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [total, setTotal] = useState<number | null>(null);
  const reviewable = ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['submission', s.id] });
    qc.invalidateQueries({ queryKey: ['review-queue'] });
  };
  const send = useMutation({
    mutationFn: () =>
      submissionsService.feedback(s.id, {
        decision,
        comment,
        ...(decision === 'GRADE' && criteria.length
          ? { criterionScores: criteria.map((c) => ({ criterionId: c.id, score: scores[c.id] ?? 0 })) }
          : {}),
        ...(decision === 'GRADE' && !criteria.length ? { totalScore: total ?? undefined } : {}),
      }),
    onSuccess: () => {
      refresh();
      setComment('');
      notify.success('Fikr-mulohaza yuborildi');
    },
    onError: (e) => notify.error(e),
  });
  const sum = criteria.reduce((a, c) => a + (scores[c.id] ?? 0), 0);
  const max = criteria.reduce((a, c) => a + c.maxScore, 0);

  return (
    <>
      <PageHeader
        title={s.assignment?.title ?? 'Javob'}
        tag={<StatusTag map={SUBMISSION_STATUS} value={s.status} />}
        description={`Talaba: ${s.student?.fullName} · ${s.version}-versiya · ${fmtDateTime(s.submittedAt)}`}
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {s.autoDetails && (
            <Card title={s.assignment?.simulator?.kind === 'MAP' ? 'Simulyator: xaritada belgilash' : 'Simulyator: xronologik tartib'}>
              <SimulatorResultView result={s.autoDetails} config={s.assignment?.simulator} />
            </Card>
          )}
          <Card title="Talaba javobi">
            <div className="prose-text">{s.content || '—'}</div>
            {s.lessonPlan && (
              <Alert className="mt-4" type="info" showIcon message={<>Biriktirilgan dars ishlanmasi: <Link to={`/app/lessons/${s.lessonPlan.id}`}>{s.lessonPlan.title}</Link></>} />
            )}
          </Card>
          {s.revisions && s.revisions.length > 1 && (
            <Card title="Oldingi versiyalar">
              <Collapse items={s.revisions.map((r) => ({ key: r.id, label: `${r.version}-versiya · ${fmtDateTime(r.createdAt)}`, children: <div className="prose-text">{r.content}</div> }))} />
            </Card>
          )}
          <FeedbackHistory feedbacks={s.feedbacks ?? []} rubric={s.assignment?.rubric} />
        </div>
        <Card title="Baho va izoh" className="h-fit">
          {!reviewable ? (
            <Alert
              type={s.status === 'GRADED' ? 'success' : 'warning'}
              showIcon
              message={s.status === 'GRADED' ? `Baholangan: ${s.score} / ${s.assignment?.maxScore}` : 'Ish talabaga qayta ishlash uchun qaytarilgan'}
              description={s.status === 'RETURNED' ? 'Talaba qayta topshirgach, ish yana «Tekshiruv navbati»da paydo bo‘ladi.' : undefined}
            />
          ) : (
          <>
          <Radio.Group value={decision} onChange={(e) => setDecision(e.target.value)} className="mb-4 flex flex-col gap-2">
            <Radio value="GRADE">Baholash</Radio>
            <Radio value="RETURN_FOR_REVISION">Qayta ishlashga qaytarish</Radio>
          </Radio.Group>
          {decision === 'GRADE' && criteria.length > 0 && (
            <Table
              className="mb-4"
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={criteria}
              columns={[
                { title: 'Mezon', dataIndex: 'title' },
                {
                  title: 'Ball',
                  width: 120,
                  render: (_, c) => (
                    <InputNumber min={0} max={c.maxScore} value={scores[c.id] ?? null} onChange={(v) => setScores((x) => ({ ...x, [c.id]: v }))} suffix={`/ ${c.maxScore}`} />
                  ),
                },
              ]}
              footer={() => <b>Jami: {sum} / {max} ({max ? Math.round((sum / max) * 100) : 0}%)</b>}
            />
          )}
          {decision === 'GRADE' && criteria.length === 0 && (
            <div className="mb-4">
              <div className="mb-1 text-sm">Umumiy ball (maks. {s.assignment?.maxScore})</div>
              <InputNumber min={0} max={s.assignment?.maxScore} value={total} onChange={setTotal} className="w-full" />
              {s.autoScore != null && s.assignment != null && (
                <Button size="small" type="link" className="px-0" onClick={() => setTotal(Math.round((s.autoScore! / 100) * s.assignment!.maxScore * 10) / 10)}>
                  Avtomatik natijani qo‘yish ({Math.round((s.autoScore / 100) * s.assignment.maxScore * 10) / 10})
                </Button>
              )}
            </div>
          )}
          <Input.TextArea
            rows={5}
            placeholder={decision === 'GRADE' ? 'Talabaga izoh va tavsiyalar' : 'Nimani tuzatish kerakligini yozing'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button className="mt-4" type="primary" block disabled={comment.trim().length < 2} loading={send.isPending} onClick={() => send.mutate()}>
            {decision === 'GRADE' ? 'Bahoni yuborish' : 'Talabaga qaytarish'}
          </Button>
          </>
          )}
        </Card>
      </div>
    </>
  );
};
