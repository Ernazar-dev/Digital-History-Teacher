import { BookOutlined, FilePptOutlined, FileTextOutlined, PictureOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Form, Skeleton, Tabs } from 'antd';
import { useEffect, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { TextAreaField, TextField } from '@/components/forms/fields';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { sourcesService, type SourceInput } from '@/services/catalog.service';
import type { Source } from '@/types/api';
import { CoverUpload, LegacyVideoNotice, SingleFileUpload } from '../components/MaterialsUpload';
import { TranslationEditor } from '../components/TranslationEditor';
import { LECTURE_FILE_ACCEPT, PRESENTATION_ACCEPT } from '../files';
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
  // Mavzu saqlanishi bilan talabalarga koʻrinadi
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
  // Tahrirlash doim asosiy (oʻzbekcha) yozuv bilan: interfeys tili ruscha boʻlsa ham tarjima ustiga yozilib ketmaydi
  const existing = useQuery({ queryKey: ['source', id, 'base'], queryFn: () => sourcesService.getBase(id!), enabled: Boolean(id) });
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
      notify.success(i18n.t('sourceForm.saved'));
      navigate(`/app/sources/${s.slug}`);
    },
    onError: (e) => notify.error(e, i18n.t('sourceForm.saveFail')),
  });

  if (id && existing.isLoading) return <Skeleton active />;

  return (
    <>
      <PageHeader
        title={id ? i18n.t('sourceForm.editTitle') : i18n.t('sourceForm.newTitle')}
        description={i18n.t('sourceForm.desc')}
      />
      <Tabs
        items={[
          {
            key: 'uz',
            label: i18n.t('sourceForm.tabUz'),
            children: (
              <Form layout="vertical" component="form" onFinish={form.handleSubmit((v) => save.mutate(v))}>
                <Alert type="info" showIcon className="mb-6" message={i18n.t('sourceForm.langNote')} />
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-w-0 space-y-6">
                    <Section title={i18n.t('sourceForm.basic')} icon={<FileTextOutlined />}>
                      <TextField
                        control={control}
                        name="title"
                        label={i18n.t('sourceForm.name')}
                        required
                        placeholder={i18n.t('sourceForm.namePh')}
                      />
                      <TextAreaField
                        control={control}
                        name="summary"
                        label={i18n.t('sourceForm.summary')}
                        required
                        rows={2}
                        maxLength={1000}
                        placeholder={i18n.t('sourceForm.summaryPh')}
                      />{' '}
                    </Section>

                    <Section
                      title={i18n.t('sourceForm.lecture')}
                      hint={i18n.t('sourceForm.lectureHint')}
                      icon={<BookOutlined />}
                    >
                      <Controller
                        control={control}
                        name="lectureFile"
                        render={({ field }) => (
                          <SingleFileUpload
                            value={field.value}
                            onChange={field.onChange}
                            accept={LECTURE_FILE_ACCEPT}
                            hint={i18n.t('sourceForm.lectureFile')}
                            preview
                          />
                        )}
                      />
                    </Section>

                    <Section
                      title={i18n.t('sourceForm.pres')}
                      hint={i18n.t('sourceForm.presHint')}
                      icon={<FilePptOutlined />}
                    >
                      <Controller
                        control={control}
                        name="presentationFile"
                        render={({ field }) => (
                          <SingleFileUpload
                            value={field.value}
                            onChange={field.onChange}
                            accept={PRESENTATION_ACCEPT}
                            hint={i18n.t('sourceForm.presFile')}
                            preview
                          />
                        )}
                      />
                    </Section>

                    <Section
                      title={i18n.t('sourceForm.video')}
                      hint={i18n.t('sourceForm.videoHint')}
                      icon={<PlayCircleOutlined />}
                    >
                      <TextField
                        control={control}
                        name="videoUrl"
                        label={i18n.t('sourceForm.youtube')}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <Controller
                        control={control}
                        name="videoFile"
                        render={({ field }) => <LegacyVideoNotice value={field.value} onChange={field.onChange} />}
                      />
                    </Section>
                  </div>

                  <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <Section
                      title={i18n.t('sourceForm.cover')}
                      hint={i18n.t('sourceForm.coverHint')}
                      icon={<PictureOutlined />}
                    >
                      <Controller
                        control={control}
                        name="cover"
                        render={({ field }) => <CoverUpload value={field.value} onChange={field.onChange} />}
                      />
                    </Section>
                  </aside>
                </div>

                <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-2 border-0 border-t border-solid border-line bg-canvas py-3">
                  <Button onClick={() => navigate(-1)}>{i18n.t('common.cancel')}</Button>
                  <Button type="primary" htmlType="submit" loading={save.isPending}>
                    {i18n.t('common.save')}
                  </Button>
                </div>
              </Form>
            ),
          },
          // Tarjima mavzu saqlangandan keyingina mumkin (asosiy yozuv kerak)
          { key: 'ru', label: 'Русский', disabled: !id, children: id ? <TranslationEditor sourceId={id} locale="ru" /> : null },
          { key: 'en', label: 'English', disabled: !id, children: id ? <TranslationEditor sourceId={id} locale="en" /> : null },
        ]}
      />
      {!id && <p className="mt-0 text-sm text-muted">{i18n.t('sourceForm.translateLater')}</p>}
    </>
  );
}
