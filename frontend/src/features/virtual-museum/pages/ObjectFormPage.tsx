import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Skeleton } from 'antd';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { museumService } from '@/services/museum.service';
import type { VirtualObject } from '@/types/api';
import { ObjectFormFields } from '../components/ObjectFormFields';
import { EMPTY_OBJECT, objectFormSchema, type ObjectFormValues } from '../objectForm.schema';

const toForm = (o: VirtualObject): ObjectFormValues => ({
  title: o.title,
  externalUrl: o.externalUrl,
  description: o.description,
});

// Faqat shu uch maydon yuboriladi — obyektning boshqa ma'lumotlari (topshiriqlar va h.k.) oʻzgarmaydi
const toPayload = (v: ObjectFormValues): ObjectFormValues => ({ ...v });

export default function ObjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const existing = useQuery({ queryKey: ['object', id, 'base'], queryFn: () => museumService.getBase(id!), enabled: Boolean(id) });
  const form = useForm<ObjectFormValues>({ resolver: zodResolver(objectFormSchema), defaultValues: EMPTY_OBJECT });
  useEffect(() => {
    if (existing.data) form.reset(toForm(existing.data));
  }, [existing.data, form]);

  const save = useMutation({
    mutationFn: (v: ObjectFormValues) => (id ? museumService.update(id, toPayload(v)) : museumService.create(toPayload(v))),
    onSuccess: (o) => {
      qc.invalidateQueries({ queryKey: ['objects'] });
      qc.invalidateQueries({ queryKey: ['object'] });
      notify.success(i18n.t('objectForm.saved'));
      navigate(`/app/museum/${o.slug}`);
    },
    onError: (e) => notify.error(e, i18n.t('objectForm.saveFail')),
  });

  if (id && existing.isLoading) return <Skeleton active />;
  return (
    <>
      <PageHeader
        title={id ? i18n.t('objectForm.editTitle') : i18n.t('objectForm.newTitle')}
        description={i18n.t('objectForm.desc')}
      />
      <Form layout="vertical" component="form" onFinish={form.handleSubmit((v) => save.mutate(v))}>
        <ObjectFormFields form={form} />
        <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-2 border-t border-line bg-canvas py-3">
          <Button onClick={() => navigate(-1)}>{i18n.t('common.cancel')}</Button>
          <Button type="primary" htmlType="submit" loading={save.isPending}>{i18n.t('common.save')}</Button>
        </div>
      </Form>
    </>
  );
}
