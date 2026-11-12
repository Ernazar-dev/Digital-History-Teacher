import { EyeOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Progress, Select, Skeleton, Steps } from 'antd';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { WORK_STATUS } from '@/lib/labels';
import { lessonsService } from '@/services/learning.service';
import { ConstructorFooter } from '../components/ConstructorFooter';
import { StepAssessment, StepBasics, StepGoals } from '../components/StepBasics';
import { StepResources } from '../components/StepResources';
import { StepReview } from '../components/StepReview';
import { StepStages } from '../components/StepStages';
import { StepTasks } from '../components/StepTasks';
import { EMPTY_LESSON, fromLesson, lessonFormSchema, toPayload, type LessonFormValues } from '../lessonForm';

const STEP_DEFS = [
  { key: 'basics', C: StepBasics },
  { key: 'goals', C: StepGoals },
  { key: 'resources', C: StepResources },
  { key: 'tasks', C: StepTasks },
  { key: 'stages', C: StepStages },
  { key: 'assessment', C: StepAssessment },
  { key: 'review', C: StepReview },
];

export default function LessonConstructorPage() {
  const STEPS = STEP_DEFS.map((s) => ({ title: i18n.t(`lesson.steps.${s.key}`), C: s.C }));
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');
  const existing = useQuery({ queryKey: ['lesson', id, 'base'], queryFn: () => lessonsService.getBase(id!), enabled: Boolean(id) });
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: EMPTY_LESSON,
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
      qc.setQueryData(['lesson', l.id, 'base'], l);
      setNote('');
      notify.success(i18n.t('lesson.page.saved', { v: l.currentVersion }));
      if (!id) navigate(`/app/lessons/${l.id}/edit`, { replace: true });
    },
    onError: (e) => notify.error(e, i18n.t('lesson.page.saveFail')),
  });
  const submit = useMutation({
    mutationFn: async (v: LessonFormValues) => lessonsService.submit((await persist(v)).id),
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      notify.success(i18n.t('lesson.page.submitted'));
      navigate(`/app/lessons/${l.id}`);
    },
    onError: (e) => notify.error(e, i18n.t('lesson.page.submitFail')),
  });

  if (id && existing.isLoading) return <Skeleton active />;
  if (existing.data && !['DRAFT', 'RETURNED'].includes(existing.data.status)) {
    return (
      <Alert type="info" showIcon message={i18n.t('lesson.page.locked')} action={<Link to={`/app/lessons/${id}`}><Button>{i18n.t('lesson.page.view')}</Button></Link>} />
    );
  }
  const Current = STEPS[step].C;
  const onInvalid = () => notify.info(i18n.t('lesson.page.fixErrors'));

  return (
    <>
      <PageHeader
        title={id ? i18n.t('lesson.page.editTitle') : i18n.t('lesson.page.builderTitle')}
        tag={existing.data && <StatusTag map={WORK_STATUS} value={existing.data.status} />}
        description={i18n.t('lesson.page.desc')}
        extra={id && <Link to={`/app/lessons/${id}`}><Button icon={<EyeOutlined />}>{i18n.t('lesson.page.view')}</Button></Link>}
      />
      {existing.data?.teacherComment && existing.data.status === 'RETURNED' && (
        <Alert className="mb-4" type="warning" showIcon message={i18n.t('lesson.page.teacherNote')} description={existing.data.teacherComment} />
      )}
      <Card className="mb-6">
        <Steps className="!hidden xl:!flex" size="small" labelPlacement="vertical" current={step} onChange={setStep} items={STEPS.map((s) => ({ title: s.title }))} />
        {/* Kiçik ekranlarda ixçam köriniş: gorizontal skrolsiz */}
        <div className="xl:hidden">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">{i18n.t('lesson.page.stepOf', { n: step + 1, total: STEPS.length })}</span>
            <Select
              size="small"
              aria-label={i18n.t('lesson.page.pickStep')}
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
