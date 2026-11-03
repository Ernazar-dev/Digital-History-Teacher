import { BookOutlined, FilePptOutlined, FileTextOutlined, PictureOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Skeleton } from 'antd';
import { useEffect, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { TextAreaField, TextField } from '@/components/forms/fields';
import { useNotify } from '@/hooks/useNotify';
import { sourcesService, type SourceInput } from '@/services/catalog.service';
import type { Source } from '@/types/api';
import { CoverUpload, SingleFileUpload } from '../components/MaterialsUpload';
import { LECTURE_FILE_ACCEPT, PRESENTATION_ACCEPT, VIDEO_ACCEPT } from '../files';
import { EMPTY_SOURCE, sourceFormSchema, type SourceFormValues } from '../sourceForm.schema';

const toForm = (s: Source): SourceFormValues => ({
  title: s.title,
  summary: s.summary,
  lectureFile: s.lectureFile,
  presentationFile: s.presentationFile,
  videoFile: s.videoFile,
  videoUrl: s.videoUrl ?? '',
  cover: s.mediaFile?.mimeType.startsWith('image/') ? s.mediaFile : null,
});

const toPayload = (v: SourceFormValues): SourceInput => ({
  title: v.title,
  summary: v.summary,
  lectureFileId: v.lectureFile?.id ?? null,
  presentationFileId: v.presentationFile?.id ?? null,
  videoFileId: v.videoFile?.id ?? null,
  videoUrl: v.videoUrl || null,
  mediaFileId: v.cover?.id ?? null,
  // Mavzu saqlanishi bilan talabalarga ko'rinadi
  status: 'PUBLISHED',
});

const Section = ({ title, hint, icon, children }: { title: string; hint?: string; icon: ReactNode; children: ReactNode }) => (
  <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-6">
    <header className="mb-5 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</span>
      <div>
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
  const form = useForm<SourceFormValues>({ resolver: zodResolver(sourceFormSchema), defaultValues: EMPTY_SOURCE });
  const { control } = form;

  useEffect(() => {
    if (existing.data) form.reset(toForm(existing.data));
  }, [existing.data, form]);

  const save = useMutation({
    mutationFn: (v: SourceFormValues) => (id ? sourcesService.update(id, toPayload(v)) : sourcesService.create(toPayload(v))),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      qc.invalidateQueries({ queryKey: ['source'] });
      notify.success('Mavzu saqlandi');
      navigate(`/app/sources/${s.slug}`);
    },
    onError: (e) => notify.error(e, 'Mavzu saqlanmadi'),
  });

  if (id && existing.isLoading) return <Skeleton active />;

  return (
    <>
      <PageHeader
        title={id ? 'Mavzuni tahrirlash' : 'Yangi mavzu'}
        description="Mavzu uch qismdan iborat: ma’ruza, taqdimot va video rolik. Fayllarni hozir yoki keyinroq yuklashingiz mumkin."
      />
      <Form layout="vertical" component="form" onFinish={form.handleSubmit((v) => save.mutate(v))}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <Section title="Asosiy ma’lumot" icon={<FileTextOutlined />}>
              <TextField control={control} name="title" label="Mavzu nomi" required placeholder="Masalan: Amir Temur hukmronligi davrida o‘zbek davlatchiligi" />
              <TextAreaField control={control} name="summary" label="Qisqacha tavsif" required rows={2} maxLength={1000} placeholder="Mavzuda nimalar o‘rganiladi — 1–2 gap" />            </Section>

            <Section title="1. Ma’ruza" hint="Ma’ruza faylini yuklang — talaba uni sahifaning o‘zida o‘qiydi va yuklab oladi." icon={<BookOutlined />}>
              <Controller control={control} name="lectureFile" render={({ field }) => (
                <SingleFileUpload value={field.value} onChange={field.onChange} accept={LECTURE_FILE_ACCEPT} hint="Word (.docx) yoki PDF" preview />
              )} />
            </Section>

            <Section title="2. Taqdimot" hint="Mavzu bo‘yicha taqdimot — talaba sahifaning o‘zida ko‘radi" icon={<FilePptOutlined />}>
              <Controller control={control} name="presentationFile" render={({ field }) => (
                <SingleFileUpload value={field.value} onChange={field.onChange} accept={PRESENTATION_ACCEPT} hint="PowerPoint (.pptx) yoki PDF" preview />
              )} />
            </Section>

            <Section title="3. Video rolik" hint="YouTube havolasini qo‘ying (tavsiya etiladi) yoki MP4 fayl yuklang" icon={<PlayCircleOutlined />}>
              <TextField control={control} name="videoUrl" label="YouTube havolasi" placeholder="https://www.youtube.com/watch?v=..." />
              <Controller control={control} name="videoFile" render={({ field }) => (
                <SingleFileUpload value={field.value} onChange={field.onChange} accept={VIDEO_ACCEPT} hint="yoki video fayl · MP4" preview />
              )} />
            </Section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Section title="Afisha rasmi" hint="Kartochkada va mavzu sahifasi tepasida ko‘rinadi (ixtiyoriy)" icon={<PictureOutlined />}>
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
