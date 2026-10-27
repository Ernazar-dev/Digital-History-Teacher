import { PlusOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Skeleton } from 'antd';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { NumberField, SelectField, SwitchField, TextAreaField, TextField } from '@/components/forms/fields';
import { SourcePicker } from '@/features/source-analysis/components/SourcePicker';
import { useNotify } from '@/hooks/useNotify';
import { DIAGNOSTIC_KIND, STAGE, toOptions } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import { diagnosticsService } from '@/services/learning.service';
import { QuestionEditor } from '../components/QuestionEditor';
import { diagnosticFormSchema, newQuestion, type DiagnosticFormValues } from '../diagnosticForm';

const STAGES = Object.fromEntries(Object.entries(STAGE).filter(([k]) => k !== 'ONGOING')) as Record<'INITIAL' | 'INTERMEDIATE' | 'FINAL', string>;

export default function DiagnosticFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const config = useQuery({ queryKey: ['assessment-config'], queryFn: assessmentsService.config });
  const existing = useQuery({ queryKey: ['diagnostic', id], queryFn: () => diagnosticsService.get(id!), enabled: Boolean(id) });
  const form = useForm<DiagnosticFormValues>({
    resolver: zodResolver(diagnosticFormSchema),
    defaultValues: { title: '', description: '', stage: 'INITIAL', kind: 'TEST', isActive: true, timeLimitMinutes: null, questions: [] },
  });
  const questions = useFieldArray({ control: form.control, name: 'questions' });
  useEffect(() => {
    const d = existing.data;
    if (d) {
      form.reset({
        title: d.title, description: d.description ?? '', stage: d.stage, kind: d.kind, sourceId: d.sourceId ?? null, isActive: d.isActive, timeLimitMinutes: d.timeLimitMinutes,
        questions: (d.questions ?? []).map((q) => ({ componentId: q.componentId, type: q.type, prompt: q.prompt, points: q.points, options: q.options ?? [], correct: q.correct ?? [] })),
      });
    }
  }, [existing.data, form]);
  const hasAttempts = (existing.data?._count?.attempts ?? 0) > 0;
  const kind = form.watch('kind');

  const save = useMutation({
    mutationFn: (v: DiagnosticFormValues) => {
      const body = { ...v, questions: v.questions.map((q) => ({ ...q, options: q.type === 'TEXT' ? null : q.options, correct: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.type) ? q.correct : null })) };
      if (!id) return diagnosticsService.create(body);
      const { questions: qs, ...meta } = body;
      return diagnosticsService.update(id, form.formState.dirtyFields.questions ? { ...meta, questions: qs } : meta);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diagnostics'] });
      notify.success('Diagnostika saqlandi');
      navigate('/app/diagnostics');
    },
    onError: (e) => notify.error(e),
  });

  if ((id && existing.isLoading) || config.isLoading) return <Skeleton active />;
  const components = config.data?.components ?? [];
  return (
    <>
      <PageHeader title={id ? 'Diagnostikani tahrirlash' : 'Yangi diagnostika'} description="Har bir savol kompetensiya komponentiga bog‘lanadi. Boshlang‘ich va yakuniy diagnostikada taqqoslanadigan savollardan foydalaning." />
      {hasAttempts && <Alert className="mb-4" type="warning" showIcon message="Urinishlar mavjud — savollarni o‘zgartirish bloklangan (natijalar taqqoslanuvchanligi uchun). Faqat nom, tavsif va faollikni o‘zgartirish mumkin." />}
      <Form layout="vertical" component="form" onFinish={form.handleSubmit((v) => save.mutate(v), () => notify.info('Formadagi xatolarni tuzating'))}>
        <Card title="Asosiy" className="mb-6">
          <div className="grid gap-x-6 md:grid-cols-2">
            <TextField control={form.control} name="title" label="Nomi" required />
            <div className="grid grid-cols-2 gap-4">
              <SelectField control={form.control} name="stage" label="Bosqich" options={toOptions(STAGES)} />
              <SelectField control={form.control} name="kind" label="Turi" options={toOptions(DIAGNOSTIC_KIND)} />
            </div>
            {kind === 'CASE' && (
              <Controller
                control={form.control}
                name="sourceId"
                render={({ field, fieldState }) => (
                  <Form.Item
                    className="md:col-span-2"
                    label="Keys uchun tarixiy hujjat"
                    required
                    validateStatus={fieldState.error ? 'error' : undefined}
                    help={fieldState.error?.message ?? 'Talaba keysni bajarayotganda hujjat ekranda ko‘rinib turadi'}
                  >
                    <SourcePicker value={field.value ?? undefined} onChange={(v) => field.onChange(v)} placeholder="Hujjatni qidiring va tanlang" />
                  </Form.Item>
                )}
              />
            )}
            <TextAreaField control={form.control} name="description" label="Tavsif" rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <NumberField control={form.control} name="timeLimitMinutes" label="Vaqt (daqiqa, ixtiyoriy)" min={1} />
              <SwitchField control={form.control} name="isActive" label="Faol" />
            </div>
          </div>
        </Card>
        <Card title="Savollar" extra={!hasAttempts && <Button icon={<PlusOutlined />} onClick={() => questions.append(newQuestion(components[0]?.id))}>Savol qo‘shish</Button>}>
          {form.formState.errors.questions?.message && <Alert className="mb-3" type="error" message={form.formState.errors.questions.message} />}
          <fieldset disabled={hasAttempts} className="m-0 border-0 p-0">
            {questions.fields.map((f, i) => (
              <QuestionEditor key={f.id} form={form} index={i} components={components} onRemove={() => questions.remove(i)} />
            ))}
          </fieldset>
        </Card>
        <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-2 border-t border-line bg-canvas py-3">
          <Button onClick={() => navigate(-1)}>Bekor qilish</Button>
          <Button type="primary" htmlType="submit" loading={save.isPending}>Saqlash</Button>
        </div>
      </Form>
    </>
  );
}
