import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Descriptions, Input, InputNumber, Tag } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { QUESTION_TYPE, STAGE } from '@/lib/labels';
import { diagnosticsService } from '@/services/learning.service';
import type { DiagnosticQuestion } from '@/types/api';
import { fmtDateTime } from '@/utils/format';

const answerText = (q: DiagnosticQuestion, answer: unknown) => {
  if (answer === undefined || answer === null || answer === '') return '—';
  const opts = q.options ?? [];
  const ids = Array.isArray(answer) ? answer : [answer];
  return q.type === 'TEXT' ? String(answer) : ids.map((id) => opts.find((o) => o.id === id)?.text ?? String(id)).join('; ');
};

export default function AttemptPage() {
  const { attemptId = '' } = useParams();
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const notify = useNotify();
  const [grades, setGrades] = useState<Record<string, { score: number | null; comment: string }>>({});
  const q = useQuery({ queryKey: ['attempt', attemptId], queryFn: () => diagnosticsService.attempt(attemptId) });
  const grade = useMutation({
    mutationFn: () =>
      diagnosticsService.grade(
        attemptId,
        Object.entries(grades)
          .filter(([, g]) => g.score !== null)
          .map(([questionId, g]) => ({ questionId, score: g.score as number, comment: g.comment || undefined })),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attempt', attemptId] });
      qc.invalidateQueries({ queryKey: ['review-queue'] });
      notify.success('Baholar saqlandi');
    },
    onError: (e) => notify.error(e),
  });

  return (
    <QueryState query={q}>
      {(a) => (
        <>
          <PageHeader
            title={a.diagnostic.title}
            tag={<Tag color="gold">{STAGE[a.diagnostic.stage]}</Tag>}
            description={
              <>
                {isStaff && `Talaba: ${a.student.fullName}`}
                {a.diagnostic.source && (
                  <span className="block">
                    Keys hujjati: <Link to={`/app/sources/${a.diagnostic.source.slug}`} target="_blank">{a.diagnostic.source.title}</Link>
                  </span>
                )}
              </>
            }
          />
          <Card className="mb-6">
            <Descriptions column={{ xs: 1, md: 3 }}>
              <Descriptions.Item label="Holat">{a.status === 'REVIEWED' ? 'Yakunlangan' : a.status === 'SUBMITTED' ? 'Matnli javoblar tekshiruvi kutilmoqda' : 'Jarayonda'}</Descriptions.Item>
              <Descriptions.Item label="Topshirilgan">{fmtDateTime(a.submittedAt)}</Descriptions.Item>
              <Descriptions.Item label="Ball">{a.maxAutoScore ? `${Math.round((a.autoScore ?? 0) * 10) / 10} / ${a.maxAutoScore}` : '—'}</Descriptions.Item>
            </Descriptions>
            {!isStaff && (
              <Alert type="info" showIcon message="Natijalar kompetensiya profilingizga qo‘shildi." description={<>To‘g‘ri javoblar keyingi diagnostikalarning xolisligi uchun ko‘rsatilmaydi. <Link to="/app/competence">Kompetensiya profilini ko‘rish</Link></>} />
            )}
          </Card>
          <div className="space-y-4">
            {a.diagnostic.questions.map((question, i) => {
              const r = a.responses.find((x) => x.questionId === question.id);
              const needsGrade = isStaff && question.type === 'TEXT' && a.status !== 'IN_PROGRESS';
              return (
                <Card key={question.id} size="small" title={<span className="whitespace-normal">{i + 1}. {question.prompt}</span>} extra={<Tag>{QUESTION_TYPE[question.type]}</Tag>}>
                  <div className="prose-text rounded bg-canvas p-3">{answerText(question, r?.answer)}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    {isStaff && r?.isCorrect !== null && r?.isCorrect !== undefined && (r.isCorrect ? <span><CheckCircleTwoTone twoToneColor="#2f7d4f" /> To‘g‘ri</span> : <span><CloseCircleTwoTone twoToneColor="#b42318" /> Noto‘g‘ri</span>)}
                    <span>Ball: {r?.score ?? (question.type === 'TEXT' ? 'baholanmagan' : 0)} / {question.points}</span>
                    {r?.teacherComment && <span className="text-muted">Izoh: {r.teacherComment}</span>}
                  </div>
                  {needsGrade && (
                    <div className="mt-3 grid gap-2 md:grid-cols-[160px_1fr]">
                      <InputNumber min={0} max={question.points} placeholder="Ball" value={grades[question.id]?.score ?? r?.score ?? null} onChange={(v) => setGrades((g) => ({ ...g, [question.id]: { score: v, comment: g[question.id]?.comment ?? '' } }))} suffix={`/ ${question.points}`} />
                      <Input placeholder="Izoh (ixtiyoriy)" value={grades[question.id]?.comment ?? ''} onChange={(e) => setGrades((g) => ({ ...g, [question.id]: { score: g[question.id]?.score ?? r?.score ?? null, comment: e.target.value } }))} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          {isStaff && a.diagnostic.questions.some((x) => x.type === 'TEXT') && a.status !== 'IN_PROGRESS' && (
            <div className="mt-6 flex justify-end">
              <Button type="primary" loading={grade.isPending} disabled={!Object.values(grades).some((g) => g.score !== null)} onClick={() => grade.mutate()}>
                Matnli javoblar bahosini saqlash
              </Button>
            </div>
          )}
        </>
      )}
    </QueryState>
  );
}
