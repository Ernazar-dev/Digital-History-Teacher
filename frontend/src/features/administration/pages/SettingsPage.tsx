import { DeleteOutlined, HomeOutlined, IdcardOutlined, UploadOutlined, UserAddOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Skeleton, Upload } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { SwitchField, TextAreaField, TextField } from '@/components/forms/fields';
import { useNotify } from '@/hooks/useNotify';
import { DEFAULT_LOGO } from '@/hooks/usePlatform';
import { adminService } from '@/services/portfolio.service';
import type { Settings } from '@/types/api';

const schema = z.object({
  name: z.string().trim().min(2, 'Platforma nomini kiriting'),
  fullName: z.string().max(500),
  description: z.string().max(2000),
  /** Yuklangan rasm manzili (/api/v1/media/<id>) yoki avvalgi tashqi havola */
  logoUrl: z.string().trim(),
  institution: z.string().max(300),
  studentAutoApprove: z.boolean(),
});
type Values = z.infer<typeof schema>;

const Section = ({ icon, title, hint, children }: { icon: ReactNode; title: string; hint: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-solid border-line bg-white p-5 md:p-6">
    <header className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg text-primary">{icon}</span>
      <div>
        <h2 className="font-serif-title m-0 text-xl font-semibold text-ink">{title}</h2>
        <p className="m-0 mt-1 text-sm text-muted">{hint}</p>
      </div>
    </header>
    {children}
  </section>
);

/** Logotip rasmini serverga yuklaydi; maydonda yuklangan fayl manzili saqlanadi */
const LogoUpload = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const notify = useNotify();
  const [busy, setBusy] = useState(false);
  return (
    <div className="mb-6 flex items-center gap-4 rounded-xl border border-dashed border-line bg-canvas p-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-solid border-line bg-white">
        <img src={value || DEFAULT_LOGO} alt="Logotip" className="h-12 w-12 object-contain" onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }} />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium">Logotip</div>
        <div className="mb-2 text-xs text-muted">PNG, JPG, WEBP yoki GIF — kvadrat rasm yaxshi ko‘rinadi. Bo‘sh qolsa, standart belgi chiqadi.</div>
        <div className="flex flex-wrap gap-2">
          <Upload
            accept="image/png,image/jpeg,image/webp,image/gif"
            showUploadList={false}
            customRequest={({ file }) => {
              setBusy(true);
              adminService
                .uploadMedia(file as File)
                .then((m) => onChange(`/api/v1/media/${m.id}`))
                .catch((e) => notify.error(e, 'Rasm yuklanmadi'))
                .finally(() => setBusy(false));
            }}
          >
            <Button icon={<UploadOutlined />} loading={busy}>{value ? 'Almashtirish' : 'Rasm yuklash'}</Button>
          </Upload>
          {value && <Button danger icon={<DeleteOutlined />} onClick={() => onChange('')}>Olib tashlash</Button>}
        </div>
      </div>
    </div>
  );
};

/** Saqlashdan oldin navbar va bosh sahifada qanday ko'rinishini ko'rsatadi */
const Preview = ({ v }: { v: Partial<Values> }) => (
  <div className="overflow-hidden rounded-2xl border border-solid border-line bg-white">
    <div className="border-0 border-b border-solid border-line px-5 py-3 text-xs font-medium uppercase tracking-wider text-accent">Ko‘rinishi</div>
    <div className="flex items-center gap-3 border-0 border-b border-solid border-line px-5 py-4">
      <img src={v.logoUrl || DEFAULT_LOGO} alt="" className="h-10 w-10 shrink-0 rounded-xl object-contain" onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }} />
      <span className="font-serif-title truncate text-lg font-bold text-primary">{v.name || 'Platforma nomi'}</span>
    </div>
    <div className="bg-canvas px-5 py-6">
      <div className="gold-rule mb-3" aria-hidden />
      <p className="font-serif-title m-0 text-base font-semibold leading-snug text-ink">{v.fullName || 'Rasmiy to‘liq nomi'}</p>
      <p className="m-0 mt-2 line-clamp-4 text-sm leading-relaxed text-muted">{v.description || 'Bosh sahifadagi qisqa tavsif shu yerda ko‘rinadi.'}</p>
      {v.institution && <p className="m-0 mt-3 text-xs text-muted">{v.institution}</p>}
    </div>
  </div>
);

export default function SettingsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['admin-settings'], queryFn: adminService.settings });
  const form = useForm<Values>({ resolver: zodResolver(schema) });
  const { control } = form;
  const values = form.watch();
  useEffect(() => {
    const s = q.data;
    if (s) {
      form.reset({
        name: s['platform.name'], fullName: s['platform.fullName'], description: s['platform.description'],
        logoUrl: s['platform.logoUrl'], institution: s['platform.institution'], studentAutoApprove: s['auth.studentAutoApprove'],
      });
    }
  }, [q.data, form]);
  const save = useMutation({
    mutationFn: (v: Values) =>
      adminService.saveSettings({
        'platform.name': v.name, 'platform.fullName': v.fullName, 'platform.description': v.description,
        'platform.logoUrl': v.logoUrl, 'platform.institution': v.institution, 'auth.studentAutoApprove': v.studentAutoApprove,
      } satisfies Partial<Settings>),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      form.reset(v);
      notify.success('Sozlamalar saqlandi');
    },
    onError: (e) => notify.error(e),
  });
  if (q.isLoading) return <Skeleton active />;

  return (
    <>
      <PageHeader title="Sozlamalar" description="Platforma nomi, bosh sahifa matni va ro‘yxatdan o‘tish qoidasi." />
      <Form layout="vertical" component="form" onFinish={form.handleSubmit((v) => save.mutate(v))}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <Section icon={<IdcardOutlined />} title="Platforma" hint="Navbar, sahifa sarlavhasi va pastki qismda ko‘rinadi.">
              <div className="grid gap-x-4 md:grid-cols-2">
                <TextField control={control} name="name" label="Platforma nomi" required placeholder="Digital History Teacher" />
                <TextField control={control} name="institution" label="Muassasa" placeholder="Masalan: universitet nomi" />
              </div>
              <Controller control={control} name="logoUrl" render={({ field }) => <LogoUpload value={field.value ?? ''} onChange={field.onChange} />} />
            </Section>

            <Section icon={<HomeOutlined />} title="Bosh sahifa" hint="Platforma haqidagi matnlar.">
              <TextAreaField control={control} name="fullName" label="Rasmiy to‘liq nomi" rows={2} />
              <TextAreaField control={control} name="description" label="Qisqa tavsif" rows={3} maxLength={2000} />
            </Section>

            <Section icon={<UserAddOutlined />} title="Ro‘yxatdan o‘tish" hint="Yangi talabalar platformaga qanday kiradi.">
              <SwitchField
                control={control}
                name="studentAutoApprove"
                label="Talabalar ro‘yxatdan o‘tishi bilan kira olsin"
                help="O‘chirilsa, har bir yangi talabani «Foydalanuvchilar» bo‘limida tasdiqlaysiz. O‘qituvchilar har doim tasdiqlanadi."
              />
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Preview v={values} />
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-2 border-0 border-t border-solid border-line bg-canvas py-3">
          <Button disabled={!form.formState.isDirty} onClick={() => form.reset()}>Bekor qilish</Button>
          <Button type="primary" htmlType="submit" loading={save.isPending} disabled={!form.formState.isDirty}>Saqlash</Button>
        </div>
      </Form>
    </>
  );
}
