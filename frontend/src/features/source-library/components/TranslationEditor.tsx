import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Form, Popconfirm, Skeleton } from 'antd';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { TextAreaField, TextField } from '@/components/forms/fields';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { sourcesService, type SourceTranslationInput } from '@/services/catalog.service';
import type { SourceTranslation } from '@/types/api';
import { LECTURE_FILE_ACCEPT, PRESENTATION_ACCEPT, youtubeEmbedUrl } from '../files';
import { LegacyVideoNotice, SingleFileUpload } from './MaterialsUpload';

const fileRef = z.object({ id: z.string(), originalName: z.string(), mimeType: z.string(), size: z.number() });

const schema = z.object({
  title: z.string().trim().min(2, 'validation.titleShort').max(300),
  summary: z.string().trim().max(1000),
  lectureContent: z.string().max(400_000),
  lectureFile: fileRef.nullable(),
  presentationFile: fileRef.nullable(),
  videoFile: fileRef.nullable(),
  videoUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => !v || Boolean(youtubeEmbedUrl(v)), 'validation.youtube'),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = { title: '', summary: '', lectureContent: '', lectureFile: null, presentationFile: null, videoFile: null, videoUrl: '' };

const toForm = (t: SourceTranslation): Values => ({
  title: t.title,
  summary: t.summary ?? '',
  lectureContent: t.lectureContent ?? '',
  lectureFile: t.lectureFile,
  presentationFile: t.presentationFile,
  videoFile: t.videoFile,
  videoUrl: t.videoUrl ?? '',
});

const toPayload = (v: Values): SourceTranslationInput => ({
  title: v.title,
  summary: v.summary || null,
  lectureContent: v.lectureContent.trim() ? v.lectureContent : null,
  lectureFileId: v.lectureFile?.id ?? null,
  presentationFileId: v.presentationFile?.id ?? null,
  videoFileId: v.videoFile?.id ?? null,
  videoUrl: v.videoUrl || null,
});

const langName = (l: 'ru' | 'en') => i18n.t(l === 'ru' ? 'translation.langRu' : 'translation.langEn');

/**
 * Mavzuning rus/ingliz tilidagi varianti. Boʻsh qoldirilgan qism saytda oʻzbekcha koʻrsatiladi.
 * Ma'ruza (matn + fayl) va video (havola + fayl) bir butun sifatida almashadi.
 */
export const TranslationEditor = ({ sourceId, locale }: { sourceId: string; locale: 'ru' | 'en' }) => {
  const notify = useNotify();
  const qc = useQueryClient();
  const all = useQuery({ queryKey: ['source-translations', sourceId], queryFn: () => sourcesService.translations(sourceId) });
  const current = all.data?.find((t) => t.locale === locale);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const { control } = form;

  useEffect(() => {
    if (all.data) form.reset(current ? toForm(current) : EMPTY);
  }, [all.data, current, form]);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['source-translations', sourceId] });
    void qc.invalidateQueries({ queryKey: ['source'] });
    void qc.invalidateQueries({ queryKey: ['sources'] });
  };

  const save = useMutation({
    mutationFn: (v: Values) => sourcesService.saveTranslation(sourceId, locale, toPayload(v)),
    onSuccess: () => {
      refresh();
      notify.success(i18n.t('translation.saved', { lang: langName(locale) }));
    },
    onError: (e) => notify.error(e, i18n.t('translation.saveFail')),
  });

  const remove = useMutation({
    mutationFn: () => sourcesService.removeTranslation(sourceId, locale),
    onSuccess: () => {
      refresh();
      notify.success(i18n.t('translation.deleted'));
    },
    onError: (e) => notify.error(e, i18n.t('translation.deleteFail')),
  });

  if (all.isLoading) return <Skeleton active />;

  return (
    <Form layout="vertical" component="form" onFinish={form.handleSubmit((v) => save.mutate(v))}>
      <Alert
        type="info"
        showIcon
        className="mb-6"
        message={current ? i18n.t('translation.exists', { lang: langName(locale) }) : i18n.t('translation.missing', { lang: langName(locale) })}
        description={i18n.t('translation.hint')}
      />
      <div className="min-w-0 space-y-6">
        <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-6">
          <TextField control={control} name="title" label={i18n.t('translation.name')} required />
          <TextAreaField control={control} name="summary" label={i18n.t('translation.summary')} rows={2} maxLength={1000} />
        </section>

        <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-6">
          <h2 className="mb-4 mt-0 text-base font-semibold">{i18n.t('translation.lecture')}</h2>
          <TextAreaField
            control={control}
            name="lectureContent"
            label={i18n.t('translation.lectureText')}
            rows={14}
            help={i18n.t('translation.lectureHelp')}
          />
          <Form.Item label={i18n.t('translation.lectureFile')}>
            <Controller control={control} name="lectureFile" render={({ field }) => (
              <SingleFileUpload value={field.value} onChange={field.onChange} accept={LECTURE_FILE_ACCEPT} hint={i18n.t('sourceForm.lectureFile')} />
            )} />
          </Form.Item>
        </section>

        <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-6">
          <h2 className="mb-4 mt-0 text-base font-semibold">{i18n.t('translation.pres')}</h2>
          <Controller control={control} name="presentationFile" render={({ field }) => (
            <SingleFileUpload value={field.value} onChange={field.onChange} accept={PRESENTATION_ACCEPT} hint={i18n.t('sourceForm.presFile')} preview />
          )} />
        </section>

        <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-6">
          <h2 className="mb-4 mt-0 text-base font-semibold">{i18n.t('translation.video')}</h2>
          <TextField control={control} name="videoUrl" label={i18n.t('sourceForm.youtube')} placeholder="https://www.youtube.com/watch?v=..." />
          <Controller control={control} name="videoFile" render={({ field }) => <LegacyVideoNotice value={field.value} onChange={field.onChange} />} />
        </section>
      </div>

      <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-2 border-0 border-t border-solid border-line bg-canvas py-3">
        {current && (
          <Popconfirm title={i18n.t('translation.delQ')} okText={i18n.t('users.del')} cancelText={i18n.t('common.cancel')} okButtonProps={{ danger: true }} onConfirm={() => remove.mutate()}>
            <Button danger loading={remove.isPending}>{i18n.t('translation.delBtn')}</Button>
          </Popconfirm>
        )}
        <Button type="primary" htmlType="submit" loading={save.isPending}>{i18n.t('translation.saveBtn')}</Button>
      </div>
    </Form>
  );
};
