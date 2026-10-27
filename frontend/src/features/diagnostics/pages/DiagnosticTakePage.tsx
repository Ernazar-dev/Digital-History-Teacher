import { CheckOutlined, ClockCircleOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Popconfirm, Progress, Result, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useNotify } from '@/hooks/useNotify';
import { errorMessage } from '@/lib/http';
import { STAGE } from '@/lib/labels';
import type { QuestionType } from '@/types/api';
import { diagnosticsService } from '@/services/learning.service';
import { SourcePreview } from '@/features/source-analysis/components/SourcePreview';
import { QuestionInput, type AnswerValue } from '../components/QuestionInput';

export default function DiagnosticTakePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const dirty = useRef(false);
  const start = useQuery({ queryKey: ['attempt-start', id], queryFn: () => diagnosticsService.start(id), staleTime: Infinity, retry: false });
  const attemptId = start.data?.id;
  const attempt = useQuery({ queryKey: ['attempt', attemptId], queryFn: () => diagnosticsService.attempt(attemptId!), enabled: Boolean(attemptId) });

  useEffect(() => {
    if (attempt.data) setAnswers(Object.fromEntries(attempt.data.responses.map((r) => [r.questionId, r.answer as AnswerValue])));
  }, [attempt.data]);

  const [savedAt, setSavedAt] = useState<number | null>(null);
  // Qolgan vaqtni yangilab turish uchun (har 30 soniyada)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);
  const save = useMutation({
    mutationFn: () => diagnosticsService.saveAnswers(attemptId!, answers as Record<string, unknown>),
    onSuccess: () => { dirty.current = false; setSavedAt(Date.now()); },
  });
  // Har 30 soniyada avtomatik saqlash
  useEffect(() => {
    const t = window.setInterval(() => dirty.current && attemptId && save.mutate(), 30000);
    return () => window.clearInterval(t);
  }, [attemptId, save]);

  const submit = useMutation({
    mutationFn: async () => {
      await diagnosticsService.saveAnswers(attemptId!, answers as Record<string, unknown>).catch(() => undefined);
      return diagnosticsService.submit(attemptId!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diagnostics'] });
      notify.success('Javoblar topshirildi');
      navigate(`/app/diagnostics/attempts/${attemptId}`, { replace: true });
    },
    onError: (e) => notify.error(e, 'Topshirilmadi'),
  });

  if (start.isError) return <Result status="warning" title="Diagnostikani boshlab bo‘lmadi" subTitle={errorMessage(start.error)} extra={<Link to="/app/diagnostics"><Button>Orqaga</Button></Link>} />;
  if (!attempt.data) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  const a = attempt.data;
  if (a.status !== 'IN_PROGRESS') {
    return <Result status="info" title="Bu diagnostika allaqachon topshirilgan" extra={<Link to={`/app/diagnostics/attempts/${a.id}`}><Button type="primary">Natijani ko‘rish</Button></Link>} />;
  }
  const questions = a.diagnostic.questions;
  const answered = questions.filter((q) => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());
  }).length;
  const deadline = a.diagnostic.timeLimitMinutes ? dayjs(a.startedAt).add(a.diagnostic.timeLimitMinutes, 'minute') : null;
  const minutesLeft = deadline ? Math.max(0, deadline.diff(dayjs(now), 'minute')) : null;
  const isAnswered = (qid: string) => {
    const v = answers[qid];
    return Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());
  };
  const unanswered = questions.length - answered;
  const goTo = (qid: string) => document.getElementById(`q-${qid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const submitButton = (block?: boolean) => (
    <Popconfirm
      title={unanswered > 0 ? `${unanswered} ta savolga javob berilmagan. Baribir topshirasizmi?` : 'Javoblarni topshirasizmi?'}
      description="Topshirgandan keyin javoblarni o‘zgartirib bo‘lmaydi."
      okText="Topshirish"
      cancelText="Yo‘q"
      onConfirm={() => submit.mutate()}
    >
      <Button type="primary" size="large" block={block} icon={<SendOutlined />} loading={submit.isPending}>Topshirish</Button>
    </Popconfirm>
  );

  return (
    <>
      <PageHeader title={a.diagnostic.title} tag={<Tag color="gold">{STAGE[a.diagnostic.stage]}</Tag>} description={a.diagnostic.description} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Holat paneli: telefonda tepada, kompyuterda o'ngda yopishqoq */}
        <aside className="xl:order-2">
          <Card className="xl:sticky xl:top-20">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Javob berildi</span>
              <span className="text-lg font-semibold text-ink">{answered} / {questions.length}</span>
            </div>
            <Progress percent={Math.round((answered / Math.max(1, questions.length)) * 100)} showInfo={false} className="!mb-3" />
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Savollar</div>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goTo(q.id)}
                  aria-label={`${i + 1}-savol${isAnswered(q.id) ? ' (javob berilgan)' : ''}`}
                  className={`h-8 w-8 cursor-pointer rounded-md border border-solid text-sm font-medium transition-colors ${
                    isAnswered(q.id) ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink hover:border-primary'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {minutesLeft !== null && (
              <Alert
                className="mb-4"
                type={minutesLeft <= 5 ? 'error' : 'warning'}
                showIcon
                icon={<ClockCircleOutlined />}
                message={minutesLeft > 0 ? `Qolgan vaqt: ${minutesLeft} daqiqa` : 'Vaqt tugadi — javoblarni topshiring'}
                description={`Tugash vaqti: ${deadline!.format('HH:mm')}`}
              />
            )}
            {submitButton(true)}
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>{save.isPending ? 'Saqlanmoqda…' : savedAt ? `Saqlandi: ${dayjs(savedAt).format('HH:mm')}` : 'Avtomatik saqlanadi'}</span>
              <Button size="small" type="link" className="!px-0" icon={<SaveOutlined />} onClick={() => save.mutate(undefined, { onSuccess: () => notify.success('Saqlandi'), onError: (e) => notify.error(e) })}>
                Saqlash
              </Button>
            </div>
          </Card>
        </aside>

        <div className="min-w-0 space-y-4 xl:order-1">
          {a.diagnostic.source && (
            <Card title={`Keys hujjati: ${a.diagnostic.source.title}`} className="border-accent">
              <SourcePreview slug={a.diagnostic.source.slug} />
            </Card>
          )}
          {questions.map((q, i) => (
            <section
              key={q.id}
              id={`q-${q.id}`}
              className={`scroll-mt-24 rounded-xl border border-solid bg-white p-5 shadow-sm transition-colors ${isAnswered(q.id) ? 'border-primary/40' : 'border-line'}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isAnswered(q.id) ? 'bg-primary text-white' : 'bg-canvas text-ink'}`}>
                  {isAnswered(q.id) ? <CheckOutlined /> : i + 1}
                </span>
                <span className="text-xs font-medium text-muted">{i + 1}-savol · {HINT[q.type]}</span>
              </div>
              <h2 className="m-0 mb-4 whitespace-pre-line text-[17px] font-semibold leading-relaxed text-ink">{q.prompt}</h2>
              <QuestionInput q={q} value={answers[q.id]} onChange={(v) => { dirty.current = true; setAnswers((s) => ({ ...s, [q.id]: v })); }} />
            </section>
          ))}
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-white p-5 text-center">
            <div className="text-sm text-muted">
              {unanswered > 0 ? `Yana ${unanswered} ta savolga javob berilmagan.` : 'Barcha savollarga javob berdingiz.'}
            </div>
            {submitButton()}
          </div>
        </div>
      </div>
    </>
  );
}

/** Talabaga nima qilish kerakligini aytadigan qisqa ko'rsatma */
const HINT: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'bitta javobni tanlang',
  MULTIPLE_CHOICE: 'bir yoki bir nechta javobni belgilang',
  LIKERT: 'fikringizga mos darajani tanlang',
  TEXT: 'javobingizni yozing',
};
