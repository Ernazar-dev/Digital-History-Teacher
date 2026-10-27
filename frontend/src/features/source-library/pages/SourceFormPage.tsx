import { FileTextOutlined, PictureOutlined, SendOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Skeleton } from 'antd';
import { useEffect, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { SelectField, TextAreaField, TextField } from '@/components/forms/fields';
import { useNotify } from '@/hooks/useNotify';
import { SOURCE_TYPE, toOptions } from '@/lib/labels';
import { catalogService, sourcesService } from '@/services/catalog.service';
import type { Source } from '@/types/api';
import { CoverUpload, FilesUpload } from '../components/MaterialsUpload';
import { fileKind } from '../files';
import { EMPTY_SOURCE, sourceFormSchema, type SourceFormValues } from '../sourceForm.schema';

/** Avvalgi (eski formadagi) rasm bo'lmagan asosiy fayl ham materiallar ro'yxatiga o'tkaziladi */
const toForm = (s: Source): SourceFormValues => {
  const coverIsImage = s.mediaFile && fileKind(s.mediaFile) === 'image';
  const legacy = s.mediaFile && !coverIsImage && !s.files.some((f) => f.id === s.mediaFile!.id) ? [s.mediaFile] : [];
  return {
    title: s.title,
    summary: s.summary,
    type: s.type,
    periodId: s.period?.id ?? null,
    topicIds: s.topics.map((t) => t.id),
    cover: coverIsImage ? s.mediaFile : null,
    files: [...legacy, ...s.files],
  };
};

const toPayload = (v: SourceFormValues) => ({
  title: v.title,
  summary: v.summary,
  type: v.type,
  periodId: v.periodId ?? null,
  topicIds: v.topicIds,
  // Manba doim nashr etilgan holatda — saqlanishi bilan o'quvchilarga ko'rinadi
  status: 'PUBLISHED' as const,
  mediaFileId: v.cover?.id ?? null,
  fileIds: v.files.map((f) => f.id),
});

const Section = ({ step, title, hint, icon, children }: { step: number; title: string; hint?: string; icon: ReactNode; children: ReactNode }) => (
  <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-6">
    <header className="mb-5 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">{step}-qadam</div>
        <h2 className="m-0 text-base font-semibold">{title}</h2>
        {hint && <p className="m-0 mt-1 text-sm text-muted">{hint}</p>}
      </div>
    </header>
    {children}
  </section>
);

export default function SourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const existing = useQuery({ queryKey: ['source', id], queryFn: () => sourcesService.get(id!), enabled: Boolean(id) });
  const periods = useQuery({ queryKey: ['periods'], queryFn: catalogService.periods });
  const topics = useQuery({ queryKey: ['topics'], queryFn: () => catalogService.topics() });
  const form = useForm<SourceFormValues>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: EMPTY_SOURCE,
  });
  const { control } = form;

  useEffect(() => {
    if (existing.data) form.reset(toForm(existing.data));
  }, [existing.data, form]);

  const save = useMutation({
    mutationFn: (v: SourceFormValues) => (id ? sourcesService.update(id, toPayload(v)) : sourcesService.create(toPayload(v))),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      qc.invalidateQueries({ queryKey: ['source'] });
      notify.success('Manba saqlandi');
      navigate(`/app/sources/${s.slug}`);
    },
    onError: (e) => notify.error(e, 'Manba saqlanmadi'),
  });

  if (id && existing.isLoading) return <Skeleton active />;

  return (
    <>
      <PageHeader
        title={id ? 'Manbani tahrirlash' : 'Yangi manba qo‘shish'}
        description="Nomini yozing, materialni (PDF, Word, PowerPoint yoki rasm) yuklang — o‘quvchilar uni manba sahifasida darhol ochib ko‘radi."
      />
      <Form layout="vertical" component="form" onFinish={form.handleSubmit((v) => save.mutate(v))}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <Section step={1} title="Asosiy ma’lumot" icon={<FileTextOutlined />}>
              <TextField control={control} name="title" label="Manba nomi" required placeholder="Masalan: Amir Temur tuzuklari" />
              <TextAreaField control={control} name="summary" label="Qisqacha tavsif" required rows={3} maxLength={1000} placeholder="Manba nima haqida, darsda qanday foydalaniladi — 1–3 gap" />
              <div className="grid gap-x-4 md:grid-cols-3">
                <SelectField control={control} name="type" label="Manba turi" required options={toOptions(SOURCE_TYPE)} />
                <SelectField control={control} name="periodId" label="Tarixiy davr" allowClear placeholder="Tanlang" loading={periods.isLoading} options={periods.data?.map((p) => ({ value: p.id, label: p.name })) ?? []} />
                <SelectField control={control} name="topicIds" label="Mavzu" mode="multiple" placeholder="Ixtiyoriy" loading={topics.isLoading} options={topics.data?.map((t) => ({ value: t.id, label: t.name })) ?? []} />
              </div>
            </Section>

            <Section step={2} title="O‘quv materiallari" hint="O‘quvchi bu fayllarni manba sahifasida yuklab olmasdan ko‘ra oladi. Tartibini strelkalar bilan o‘zgartiring." icon={<SendOutlined />}>
              <Controller control={control} name="files" render={({ field, fieldState }) => (
                <>
                  <FilesUpload value={field.value} onChange={field.onChange} />
                  {fieldState.error && <div className="mt-2 text-sm text-red-600">{fieldState.error.message}</div>}
                </>
              )} />
            </Section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Section step={3} title="Muqova rasmi" hint="Kutubxonada kartochka ustida ko‘rinadi" icon={<PictureOutlined />}>
              <Controller control={control} name="cover" render={({ field }) => <CoverUpload value={field.value} onChange={field.onChange} />} />
            </Section>
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-2 border-0 border-t border-solid border-line bg-canvas py-3">
          <Button onClick={() => navigate(-1)}>Bekor qilish</Button>
          <Button type="primary" htmlType="submit" loading={save.isPending}>Saqlash</Button>
        </div>
      </Form>
    </>
  );
}
