import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Skeleton, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { DateField, NumberField, SelectField, TextAreaField, TextField } from '@/components/forms/fields';
import { SourcePicker } from '@/features/source-analysis/components/SourcePicker';
import { useNotify } from '@/hooks/useNotify';
import { ASSIGNMENT_STATUS, ASSIGNMENT_TYPE, EVIDENCE_KIND, toOptions } from '@/lib/labels';
import { assignmentsService } from '@/services/learning.service';
import { museumService } from '@/services/museum.service';
import { groupsService } from '@/services/people.service';
import type { SimulatorConfig } from '@/types/api';
import { emptySimulator, SimulatorEditor, simulatorKindFor, simulatorProblems } from '../components/Simulator';

const schema = z.object({
  title: z.string().trim().min(3, 'Sarlavha kamida 3 belgi'),
  scenario: z.string().trim().min(10, 'Pedagogik vaziyatni yozing'),
  instructions: z.string().optional().nullable(),
  type: z.enum(Object.keys(ASSIGNMENT_TYPE) as [keyof typeof ASSIGNMENT_TYPE, ...(keyof typeof ASSIGNMENT_TYPE)[]]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  dueDate: z.string().nullable().optional(),
  maxScore: z.number({ invalid_type_error: 'Ball kiriting' }).positive(),
  rubricId: z.string().nullable().optional(),
  evidenceKind: z.string(),
  groupIds: z.array(z.string()),
  sourceIds: z.array(z.string()),
  virtualObjectIds: z.array(z.string()),
});
type Values = z.infer<typeof schema>;
const EMPTY: Values = {
  title: '', scenario: '', instructions: '', type: 'INTERACTIVE_TASK_DESIGN', status: 'DRAFT', dueDate: null, maxScore: 100,
  rubricId: null, evidenceKind: 'PRACTICAL_TASK', groupIds: [], sourceIds: [], virtualObjectIds: [],
};

export default function AssignmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const existing = useQuery({ queryKey: ['assignment', id], queryFn: () => assignmentsService.get(id!), enabled: Boolean(id) });
  const groups = useQuery({ queryKey: ['groups'], queryFn: groupsService.list });
  const rubrics = useQuery({ queryKey: ['rubrics'], queryFn: assignmentsService.rubrics });
  const objects = useQuery({ queryKey: ['objects', 'picker'], queryFn: () => museumService.list({ pageSize: 100 }) });
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  // Raqamli simulyator — «Xronologik tartib» va «Xaritada belgilash» turlari uchun (6-modul)
  const [simulator, setSimulator] = useState<SimulatorConfig | null>(null);
  const [useSim, setUseSim] = useState(true);
  useEffect(() => {
    const a = existing.data;
    if (a) {
      form.reset({
        title: a.title, scenario: a.scenario, instructions: a.instructions ?? '', type: a.type, status: a.status, dueDate: a.dueDate,
        maxScore: a.maxScore, rubricId: a.rubricId, evidenceKind: a.evidenceKind, groupIds: a.groups.map((g) => g.id),
        sourceIds: a.sources.map((s) => s.id), virtualObjectIds: a.virtualObjects.map((o) => o.id),
      });
      setSimulator(a.simulator ?? null);
      setUseSim(Boolean(a.simulator) || !simulatorKindFor(a.type));
    }
  }, [existing.data, form]);

  const simKind = simulatorKindFor(form.watch('type'));
  const activeSim = simKind ? (simulator?.kind === simKind ? simulator : emptySimulator(simKind)) : null;
  const simIssues = activeSim && useSim ? simulatorProblems(activeSim) : [];

  const save = useMutation({
    mutationFn: (v: Values) => {
      const body = { ...v, simulator: activeSim && useSim ? activeSim : null };
      return id ? assignmentsService.update(id, body) : assignmentsService.create(body);
    },
    onSuccess: (a) => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['assignment'] });
      notify.success('Topshiriq saqlandi');
      navigate(`/app/assignments/${a.id}`);
    },
    onError: (e) => notify.error(e),
  });
  if (id && existing.isLoading) return <Skeleton active />;
  const { control } = form;
  const onValid = (v: Values) => (simIssues.length ? notify.info(simIssues.join('. ')) : save.mutate(v));

  return (
    <>
      <PageHeader title={id ? 'Topshiriqni tahrirlash' : 'Yangi metodik topshiriq'} description="Guruh tanlanmasa, topshiriq barcha talabalarga ko‘rinadi." />
      <Form layout="vertical" component="form" onFinish={form.handleSubmit(onValid)}>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0 space-y-6">
            <Card title="Topshiriq mazmuni">
              <TextField control={control} name="title" label="Sarlavha" required />
              <TextAreaField control={control} name="scenario" label="Pedagogik vaziyat (ssenariy)" required rows={6} />
              <TextAreaField control={control} name="instructions" label="Ko‘rsatmalar" rows={4} />
              <Controller
                control={control}
                name="sourceIds"
                render={({ field }) => (
                  <Form.Item label="Tarixiy manbalar" layout="vertical">
                    <SourcePicker mode="multiple" value={field.value} onChange={(v) => field.onChange(v)} />
                  </Form.Item>
                )}
              />
              <SelectField control={control} name="virtualObjectIds" label="3D/360° obyektlar" mode="multiple" options={objects.data?.data.map((o) => ({ value: o.id, label: o.title })) ?? []} />
            </Card>
            {activeSim && (
              <Card
                title={activeSim.kind === 'CHRONOLOGY' ? 'Raqamli simulyator: xronologik tartib' : 'Raqamli simulyator: xaritada belgilash'}
                extra={
                  <label className="flex items-center gap-2 text-sm">
                    <Switch size="small" checked={useSim} onChange={setUseSim} /> Avtomatik tekshiruv
                  </label>
                }
              >
                {useSim ? (
                  <>
                    <SimulatorEditor value={activeSim} onChange={setSimulator} />
                    {simIssues.length > 0 && <Alert className="mt-3" type="warning" showIcon message={simIssues.join('. ')} />}
                  </>
                ) : (
                  <p className="m-0 text-sm text-muted">O‘chirilgan — talaba javobni matn ko‘rinishida yozadi.</p>
                )}
              </Card>
            )}
          </div>
          <Card title="Sozlamalar" className="h-fit">
            <SelectField control={control} name="type" label="Turi" options={toOptions(ASSIGNMENT_TYPE)} />
            <SelectField control={control} name="status" label="Holati" options={toOptions(ASSIGNMENT_STATUS)} />
            <DateField control={control} name="dueDate" label="Muddat" />
            <NumberField control={control} name="maxScore" label="Maksimal ball" min={1} />
            <SelectField control={control} name="rubricId" label="Baholash rubrikasi" allowClear options={rubrics.data?.map((r) => ({ value: r.id, label: r.title })) ?? []} />
            <SelectField control={control} name="evidenceKind" label="Kompetensiya dalili turi" options={toOptions(EVIDENCE_KIND)} />
            <SelectField control={control} name="groupIds" label="Guruhlar" mode="multiple" options={groups.data?.map((g) => ({ value: g.id, label: g.name })) ?? []} />
          </Card>
        </div>
        <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-2 border-t border-line bg-canvas py-3">
          <Button onClick={() => navigate(-1)}>Bekor qilish</Button>
          <Button type="primary" htmlType="submit" loading={save.isPending}>Saqlash</Button>
        </div>
      </Form>
    </>
  );
}
