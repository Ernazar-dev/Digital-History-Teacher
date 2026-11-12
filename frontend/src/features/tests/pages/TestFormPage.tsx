import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Skeleton, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { SingleFileUpload } from '@/features/source-library/components/MaterialsUpload';
import { TEST_FILE_ACCEPT } from '@/features/source-library/files';
import type { UploadedFile } from '@/features/source-library/sourceForm.schema';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { sourcesService } from '@/services/catalog.service';
import { testsService } from '@/services/learning.service';
import type { TestOption } from '@/types/api';
import { AnswerSheet, OPTIONS } from '../components/AnswerSheet';

const MAX = 200;

/** «ABCD…» yoki «1A 2C …» koʻrinishidagi matndan kalit: faqat A–D harflari olinadi */
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
    !title.trim() && i18n.t('testForm.errName'),
    !file && i18n.t('testForm.errFile'),
    missing.length > 0 && i18n.t('testForm.errMissing', { list: `${missing.slice(0, 15).join(', ')}${missing.length > 15 ? '…' : ''}` }),
  ].filter(Boolean) as string[];

  const save = useMutation({
    mutationFn: () => {
      const body = { title: title.trim(), description: description.trim() || null, sourceId, fileId: file!.id, answerKey: sheet as TestOption[], isPublished };
      return id ? testsService.update(id, body) : testsService.create(body);
    },
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      qc.invalidateQueries({ queryKey: ['test'] });
      notify.success(i18n.t('testForm.saved'));
      navigate(`/app/assignments/${t.id}`);
    },
    onError: (e) => notify.error(e, i18n.t('testForm.saveFail')),
  });
  const onSave = () => {
    setTried(true);
    if (errors.length === 0) save.mutate();
  };

  if (id && existing.isLoading) return <Skeleton active />;

  return (
    <>
      <PageHeader
        title={id ? i18n.t('testForm.editTitle') : i18n.t('tests.upload')}
        description={i18n.t('testForm.desc')}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card title={i18n.t('testForm.about')}>
            <Form layout="vertical" component="div">
              <Form.Item label={i18n.t('testForm.nameLbl')} required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} placeholder={i18n.t('testForm.namePh')} />
              </Form.Item>
              <div className="grid gap-x-4 md:grid-cols-2">
                <Form.Item label={i18n.t('testForm.topic')} help={i18n.t('testForm.topicHelp')}>
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder={i18n.t('testForm.topicPh')}
                    value={sourceId ?? undefined}
                    onChange={(v) => setSourceId(v ?? null)}
                    loading={topics.isLoading}
                    options={topics.data?.data.map((s) => ({ value: s.id, label: s.title })) ?? []}
                  />
                </Form.Item>
                <Form.Item label={i18n.t('testForm.visible')}>
                  <Switch checked={isPublished} onChange={setPublished} checkedChildren={i18n.t('testForm.yes')} unCheckedChildren={i18n.t('testForm.no')} />
                </Form.Item>
              </div>
              <Form.Item label={i18n.t('testForm.noteOpt')} className="mb-0">
                <Input.TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={2000} placeholder={i18n.t('testForm.notePh')} />
              </Form.Item>
            </Form>
          </Card>

          <Card title={i18n.t('testForm.fileCard')}>
            <SingleFileUpload value={file} onChange={setFile} accept={TEST_FILE_ACCEPT} hint={i18n.t('testForm.fileHint')} preview />
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">
          <Card
            title={i18n.t('testForm.correct')}
            actions={[
              <div key="save" className="px-4">
                <Button type="primary" block size="large" loading={save.isPending} onClick={onSave}>{i18n.t('common.save')}</Button>
              </div>,
            ]}
          >
            <Form layout="vertical" component="div">
              <Form.Item label={i18n.t('testForm.count')} className="mb-3">
                <InputNumber min={1} max={MAX} value={count} onChange={(v) => setCount(Math.min(MAX, Math.max(1, Number(v) || 1)))} className="w-full" />
              </Form.Item>
              <Form.Item label={i18n.t('testForm.quick')} help={i18n.t('testForm.quickHelp')} className="mb-4">
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
            <div className="mb-2 text-sm text-muted">{i18n.t('testForm.marked', { a: count - missing.length, b: count })}</div>
            <AnswerSheet count={count} value={sheet} onChange={setKey} keyMode />
          </Card>
        </aside>
      </div>
    </>
  );
}
