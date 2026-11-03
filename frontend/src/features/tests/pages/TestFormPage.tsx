import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Skeleton, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { SingleFileUpload } from '@/features/source-library/components/MaterialsUpload';
import { TEST_FILE_ACCEPT } from '@/features/source-library/files';
import type { UploadedFile } from '@/features/source-library/sourceForm.schema';
import { useNotify } from '@/hooks/useNotify';
import { sourcesService } from '@/services/catalog.service';
import { testsService } from '@/services/learning.service';
import type { TestOption } from '@/types/api';
import { AnswerSheet, OPTIONS } from '../components/AnswerSheet';

const MAX = 200;

/** «ABCD…» yoki «1A 2C …» ko'rinishidagi matndan kalit: faqat A–D harflari olinadi */
const parseKey = (text: string): TestOption[] =>
  [...text.toUpperCase().replace(/\d+[.)]?/g, ' ')].filter((c): c is TestOption => (OPTIONS as string[]).includes(c));

export default function TestFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const qc = useQueryClient();
  const existing = useQuery({ queryKey: ['test', id], queryFn: () => testsService.get(id!), enabled: Boolean(id) });
  const topics = useQuery({ queryKey: ['sources', 'library', ''], queryFn: () => sourcesService.list({ sort: 'order', pageSize: 100 }) });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [count, setCount] = useState(20);
  const [key, setKey] = useState<(TestOption | null)[]>([]);
  const [isPublished, setPublished] = useState(true);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const t = existing.data;
    if (!t) return;
    setTitle(t.title);
    setDescription(t.description ?? '');
    setSourceId(t.sourceId);
    setFile(t.file);
    setCount(t.questionCount);
    setKey(t.answerKey ?? []);
    setPublished(t.isPublished);
  }, [existing.data]);

  const sheet = Array.from({ length: count }, (_, i) => key[i] ?? null);
  const missing = sheet.map((v, i) => (v ? null : i + 1)).filter((x): x is number => x !== null);
  const errors = [
    !title.trim() && 'Test nomini kiriting',
    !file && 'Test faylini yuklang',
    missing.length > 0 && `Javobi belgilanmagan savollar: ${missing.slice(0, 15).join(', ')}${missing.length > 15 ? '…' : ''}`,
  ].filter(Boolean) as string[];

  const save = useMutation({
    mutationFn: () => {
      const body = { title: title.trim(), description: description.trim() || null, sourceId, fileId: file!.id, answerKey: sheet as TestOption[], isPublished };
      return id ? testsService.update(id, body) : testsService.create(body);
    },
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      qc.invalidateQueries({ queryKey: ['test'] });
      notify.success('Test saqlandi');
      navigate(`/app/assignments/${t.id}`);
    },
    onError: (e) => notify.error(e, 'Test saqlanmadi'),
  });
  const onSave = () => {
    setTried(true);
    if (errors.length === 0) save.mutate();
  };

  if (id && existing.isLoading) return <Skeleton active />;

  return (
    <>
      <PageHeader
        title={id ? 'Testni tahrirlash' : 'Test yuklash'}
        description="1) Test faylini (PDF yoki Word) yuklang. 2) Savollar sonini kiriting. 3) Har bir savolning to‘g‘ri javobini belgilang."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card title="Test haqida">
            <Form layout="vertical" component="div">
              <Form.Item label="Test nomi" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} placeholder="Masalan: Amir Temur davlati — yakuniy test" />
              </Form.Item>
              <div className="grid gap-x-4 md:grid-cols-2">
                <Form.Item label="Mavzu" help="Test shu mavzu sahifasida ham ko‘rinadi">
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Mavzuni tanlang"
                    value={sourceId ?? undefined}
                    onChange={(v) => setSourceId(v ?? null)}
                    loading={topics.isLoading}
                    options={topics.data?.data.map((s) => ({ value: s.id, label: s.title })) ?? []}
                  />
                </Form.Item>
                <Form.Item label="Talabalarga ko‘rinadi">
                  <Switch checked={isPublished} onChange={setPublished} checkedChildren="Ha" unCheckedChildren="Yo‘q" />
                </Form.Item>
              </div>
              <Form.Item label="Izoh (ixtiyoriy)" className="mb-0">
                <Input.TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={2000} placeholder="Masalan: 30 daqiqa ichida bajaring" />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Test fayli">
            <SingleFileUpload value={file} onChange={setFile} accept={TEST_FILE_ACCEPT} hint="PDF yoki Word (.docx) — savollar va A, B, C, D variantlari yozilgan fayl" preview />
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">
          <Card
            title="To‘g‘ri javoblar"
            actions={[
              <div key="save" className="px-4">
                <Button type="primary" block size="large" loading={save.isPending} onClick={onSave}>Saqlash</Button>
              </div>,
            ]}
          >
            <Form layout="vertical" component="div">
              <Form.Item label="Savollar soni" className="mb-3">
                <InputNumber min={1} max={MAX} value={count} onChange={(v) => setCount(Math.min(MAX, Math.max(1, Number(v) || 1)))} className="w-full" />
              </Form.Item>
              <Form.Item label="Tez kiritish (ixtiyoriy)" help="Javoblarni ketma-ket yozing: ABCDA… yoki 1A 2C 3B" className="mb-4">
                <Input
                  placeholder="ACBDA…"
                  onChange={(e) => {
                    const parsed = parseKey(e.target.value);
                    if (parsed.length) {
                      setKey(parsed.slice(0, MAX));
                      if (parsed.length > count) setCount(Math.min(MAX, parsed.length));
                    }
                  }}
                />
              </Form.Item>
            </Form>
            {tried && errors.length > 0 && <Alert type="error" showIcon className="mb-3" message={errors.map((e) => <div key={e}>{e}</div>)} />}
            <div className="mb-2 text-sm text-muted">Belgilangan: {count - missing.length} / {count}</div>
            <AnswerSheet count={count} value={sheet} onChange={setKey} keyMode />
          </Card>
        </aside>
      </div>
    </>
  );
}
