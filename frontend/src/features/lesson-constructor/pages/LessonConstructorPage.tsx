import { EyeOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Progress, Select, Skeleton, Steps } from 'antd';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { useNotify } from '@/hooks/useNotify';
import { WORK_STATUS } from '@/lib/labels';
import { lessonsService } from '@/services/learning.service';
import { ConstructorFooter } from '../components/ConstructorFooter';
import { StepAssessment, StepBasics, StepGoals } from '../components/StepBasics';
import { StepResources } from '../components/StepResources';
import { StepReview } from '../components/StepReview';
import { StepStages } from '../components/StepStages';
import { StepTasks } from '../components/StepTasks';
import { EMPTY_LESSON, fromLesson, lessonFormSchema, toPayload, type LessonFormValues } from '../lessonForm';

const STEPS = [
  { title: 'Sinf va mavzu', C: StepBasics },
  { title: 'Maqsad va natijalar', C: StepGoals },
  { title: 'Tarixiy manbalar', C: StepResources },
  { title: 'Savollar va topshiriqlar', C: StepTasks },
  { title: 'Bosqichlar va vaqt', C: StepStages },
  { title: 'Baholash va refleksiya', C: StepAssessment },
  { title: 'Tekshirish va topshirish', C: StepReview },
];

export default function LessonConstructorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');
  const existing = useQuery({ queryKey: ['lesson', id], queryFn: () => lessonsService.get(id!), enabled: Boolean(id) });
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: { ...EMPTY_LESSON, assignmentId: params.get('assignmentId') },
  });
  useEffect(() => {
    if (existing.data) form.reset(fromLesson(existing.data));
  }, [existing.data, form]);

  const persist = async (v: LessonFormValues) => {
    const body = toPayload(v);
    return id ? lessonsService.update(id, { ...body, versionNote: note || undefined }) : lessonsService.create(body);
  };
  const save = useMutation({
    mutationFn: persist,
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      qc.setQueryData(['lesson', l.id], l);
      setNote('');
      notify.success(`Saqlandi (${l.currentVersion}-versiya)`);
      if (!id) navigate(`/app/lessons/${l.id}/edit`, { replace: true });
    },
    onError: (e) => notify.error(e, 'Saqlanmadi'),
  });
  const submit = useMutation({
    mutationFn: async (v: LessonFormValues) => lessonsService.submit((await persist(v)).id),
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      notify.success('Dars ishlanmasi topshirildi va portfolioga qo‘shildi');
      navigate(`/app/lessons/${l.id}`);
    },
    onError: (e) => notify.error(e, 'Topshirilmadi'),
  });

  if (id && existing.isLoading) return <Skeleton active />;
  if (existing.data && !['DRAFT', 'RETURNED'].includes(existing.data.status)) {
    return (
      <Alert type="info" showIcon message="Ishlanma topshirilgan — tahrirlash yopiq" action={<Link to={`/app/lessons/${id}`}><Button>Ko‘rish</Button></Link>} />
    );
  }
  const Current = STEPS[step].C;
  const onInvalid = () => notify.info('Formadagi xatolarni tuzating (qizil bilan belgilangan maydonlar)');

  return (
    <>
      <PageHeader
        title={id ? 'Dars ishlanmasini tahrirlash' : 'Interaktiv tarix darsi konstruktori'}
        tag={existing.data && <StatusTag map={WORK_STATUS} value={existing.data.status} />}
        description="Platforma tayyor dars bermaydi: har bir bosqichda metodik qarorni o‘zingiz qabul qilasiz va asoslaysiz."
        extra={id && <Link to={`/app/lessons/${id}`}><Button icon={<EyeOutlined />}>Ko‘rish / chop etish</Button></Link>}
      />
      {existing.data?.teacherComment && existing.data.status === 'RETURNED' && (
        <Alert className="mb-4" type="warning" showIcon message="O‘qituvchi izohi" description={existing.data.teacherComment} />
      )}
      <Card className="mb-6">
        <Steps className="!hidden xl:!flex" size="small" labelPlacement="vertical" current={step} onChange={setStep} items={STEPS.map((s) => ({ title: s.title }))} />
        {/* Kichik ekranlarda ixcham ko'rinish: gorizontal skrolsiz */}
        <div className="xl:hidden">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">{step + 1}/{STEPS.length}-qadam</span>
            <Select
              size="small"
              aria-label="Qadamni tanlash"
              className="min-w-0 flex-1 sm:max-w-xs"
              value={step}
              onChange={setStep}
              options={STEPS.map((s, i) => ({ value: i, label: `${i + 1}. ${s.title}` }))}
            />
          </div>
          <Progress percent={Math.round(((step + 1) / STEPS.length) * 100)} showInfo={false} size="small" />
        </div>
      </Card>
      <Form layout="vertical" component="div">
        <Card title={STEPS[step].title}>
          {Current === StepReview ? (
            <StepReview form={form} goTo={(n) => { setStep(n - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          ) : (
            <Current form={form} />
          )}
        </Card>
      </Form>
      <ConstructorFooter
        step={step}
        last={STEPS.length - 1}
        setStep={setStep}
        showNote={Boolean(id)}
        note={note}
        setNote={setNote}
        form={form}
        saving={save.isPending}
        submitting={submit.isPending}
        onSave={form.handleSubmit((v) => save.mutate(v), onInvalid)}
        onSubmit={form.handleSubmit((v) => submit.mutate(v), onInvalid)}
      />
    </>
  );
}
