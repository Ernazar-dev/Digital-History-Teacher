import { DeleteOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Input, Popconfirm, Progress, Radio } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { ReviewPanel, TeacherVerdict } from '@/components/common/ReviewPanel';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { errorDetails } from '@/lib/http';
import { WORK_STATUS } from '@/lib/labels';
import { analysisService } from '@/services/catalog.service';
import type { AnalysisQuestion, SourceAnalysis } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { SourcePreview } from '../components/SourcePreview';

/** Hujjat, 2-modul: aniqlash → tanqidiy tahlil → xulosa va dalillar → darsda qo'llash */
const SECTIONS: { key: AnalysisQuestion['section']; title: string; hint: string }[] = [
  { key: 'identification', title: '1. Manbani aniqlash', hint: 'Turi, vaqti, muallifi va kelib chiqishi' },
  { key: 'critical', title: '2. Tanqidiy tahlil', hint: 'Muallif maqsadi, ma’lumotlar, dalillar va ishonchlilik' },
  { key: 'synthesis', title: '3. Xulosa va dalillar', hint: 'Solishtirish va asoslangan xulosa' },
  { key: 'pedagogical', title: '4. Pedagogik qo‘llash', hint: 'Manbani dars jarayoniga moslashtirish' },
];

const isAnswered = (q: AnalysisQuestion, v: string | undefined) =>
  q.kind === 'choice' ? !!q.options?.some((o) => o.value === v) : !!(v ?? '').trim();

export default function AnalysisEditorPage() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['analysis', id], queryFn: () => analysisService.get(id) });
  return <QueryState query={q}>{(a) => <Editor a={a} />}</QueryState>;
}

const Editor = ({ a }: { a: SourceAnalysis }) => {
  const { user, isStaff } = useAuth();
  const qc = useQueryClient();
  const notify = useNotify();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>(a.answers ?? {});
  const [missing, setMissing] = useState<string[]>([]);
  const template = useQuery({ queryKey: ['analysis-template', a.source.type], queryFn: () => analysisService.template(a.source.type) });
  const editable = a.studentId === user?.id && ['DRAFT', 'RETURNED'].includes(a.status);
  useEffect(() => setAnswers(a.answers ?? {}), [a.answers]);

  const dirty = editable && JSON.stringify(answers) !== JSON.stringify(a.answers ?? {});
  useUnsavedWarning(dirty);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['analysis', a.id] });
    qc.invalidateQueries({ queryKey: ['analyses'] });
  };
  const save = useMutation({ mutationFn: () => analysisService.save(a.id, answers), onSuccess: () => { refresh(); notify.success('Javoblar saqlandi'); }, onError: (e) => notify.error(e) });
  const submit = useMutation({
    mutationFn: async () => {
      await analysisService.save(a.id, answers);
      return analysisService.submit(a.id);
    },
    onSuccess: () => { refresh(); setMissing([]); notify.success('Tahlil o‘qituvchiga yuborildi va portfolioga qo‘shildi'); },
    onError: (e) => { refresh(); setMissing(errorDetails(e)); notify.error(e, 'Topshirilmadi'); },
  });
  const remove = useMutation({
    mutationFn: () => analysisService.remove(a.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['analyses'] }); notify.success('Qoralama o‘chirildi'); navigate('/app/analysis'); },
    onError: (e) => notify.error(e),
  });
  const review = useMutation({
    mutationFn: (v: { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number }) => analysisService.review(a.id, v),
    onSuccess: () => { refresh(); notify.success('Baho saqlandi'); },
    onError: (e) => notify.error(e),
  });

  const questions = useMemo(() => template.data ?? [], [template.data]);
  const progress = useMemo(() => {
    const req = questions.filter((q) => q.required);
    return req.length ? Math.round((req.filter((q) => isAnswered(q, answers[q.key])).length / req.length) * 100) : 0;
  }, [questions, answers]);

  const renderAnswer = (q: AnalysisQuestion) => {
    const value = answers[q.key] ?? '';
    const set = (v: string) => setAnswers((s) => ({ ...s, [q.key]: v }));
    if (q.kind === 'choice') {
      if (!editable) {
        const label = q.options?.find((o) => o.value === value)?.label;
        return <div className="rounded-md bg-canvas p-3">{label ?? <span className="text-muted">Baholanmagan</span>}</div>;
      }
      return (
        <Radio.Group id={`q-${q.key}`} value={value || undefined} onChange={(e) => set(e.target.value)} className="flex flex-col gap-2">
          {q.options?.map((o) => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
        </Radio.Group>
      );
    }
    return editable ? (
      <Input.TextArea id={`q-${q.key}`} autoSize={{ minRows: 2, maxRows: 10 }} value={value} onChange={(e) => set(e.target.value)} />
    ) : (
      <div className="prose-text rounded-md bg-canvas p-3">{value || <span className="text-muted">Javob berilmagan</span>}</div>
    );
  };

  return (
    <>
      <PageHeader
        title={`Manba tahlili: ${a.source.title}`}
        tag={<StatusTag map={WORK_STATUS} value={a.status} />}
        description={
          isStaff
            ? `Talaba: ${a.student.fullName}${a.submittedAt ? ` · topshirilgan: ${fmtDateTime(a.submittedAt)}` : ''}`
            : 'Manbani o‘rganing va har bir savolga undagi dalillarga tayanib javob bering.'
        }
        extra={
          editable && (
            <>
              {a.status === 'DRAFT' && (
                <Popconfirm title="Qoralamani o‘chirasizmi?" okText="O‘chirish" okButtonProps={{ danger: true }} cancelText="Yo‘q" onConfirm={() => remove.mutate()}>
                  <Button danger icon={<DeleteOutlined />} loading={remove.isPending} aria-label="Qoralamani o‘chirish" />
                </Popconfirm>
              )}
              <Button icon={<SaveOutlined />} loading={save.isPending} disabled={!dirty} onClick={() => save.mutate()}>
                {dirty ? 'Saqlash' : 'Saqlangan'}
              </Button>
              <Popconfirm title="Tahlilni topshirasizmi? Topshirilgach tahrirlab bo‘lmaydi." okText="Topshirish" cancelText="Yo‘q" onConfirm={() => submit.mutate()}>
                <Button type="primary" icon={<SendOutlined />} loading={submit.isPending}>Topshirish</Button>
              </Popconfirm>
            </>
          )
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-y-auto">
          <Card title="Tahlil qilinayotgan manba" size="small">
            <SourcePreview slug={a.source.slug} />
          </Card>
        </aside>
        <div className="min-w-0 space-y-6">
          {editable && (
            <Card size="small">
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">Majburiy savollar</span>
                {dirty && <span className="text-muted">Saqlanmagan o‘zgarishlar bor</span>}
              </div>
              <Progress percent={progress} size="small" />
            </Card>
          )}
          <TeacherVerdict comment={a.teacherComment} score={a.score} status={a.status} />
          {a.reviewedBy && a.reviewedAt && (
            <p className="-mt-3 text-sm text-muted">Baholovchi: {a.reviewedBy.fullName} · {fmtDateTime(a.reviewedAt)}</p>
          )}
          {missing.length > 0 && <Alert type="error" showIcon message="Quyidagi majburiy savollarga javob bering" description={<ul className="m-0 pl-5">{missing.map((m) => <li key={m}>{m}</li>)}</ul>} />}
          {SECTIONS.map((section) => {
            const items = questions.filter((q) => q.section === section.key);
            if (!template.isLoading && items.length === 0) return null;
            return (
              <Card key={section.key} title={section.title} extra={<span className="hidden text-sm text-muted md:inline">{section.hint}</span>} loading={template.isLoading}>
                {items.map((q) => (
                  <div key={q.key} className="mb-5 last:mb-0">
                    <label htmlFor={`q-${q.key}`} className="mb-1 block font-medium">
                      {q.label} {q.required && <span className="text-red-700">*</span>}
                    </label>
                    {q.hint && <div className="mb-2 text-sm text-muted">{q.hint}</div>}
                    {renderAnswer(q)}
                  </div>
                ))}
              </Card>
            );
          })}
          {isStaff && ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status) && (
            <ReviewPanel loading={review.isPending} onSubmit={(v) => review.mutate(v)} componentHint="Qabul qilingan tahlil bahosi «Kognitiv» komponentga «Manba tahlili» dalili sifatida yoziladi." />
          )}
        </div>
      </div>
    </>
  );
};
