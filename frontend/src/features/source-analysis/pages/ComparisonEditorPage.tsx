import { DeleteOutlined, EyeOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Drawer, Input, Popconfirm, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { ReviewPanel, TeacherVerdict } from '@/components/common/ReviewPanel';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { errorDetails } from '@/lib/http';
import { SOURCE_TYPE, WORK_STATUS } from '@/lib/labels';
import { comparisonService } from '@/services/catalog.service';
import type { Comparison } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { SourcePreview } from '../components/SourcePreview';

/** Hujjat, 2-modul misoli: taqqoslash → dalillar → xulosa → maktab darsida qo'llash savoli (hammasi majburiy) */
const FIELDS = [
  { key: 'similarities', label: 'O‘xshash jihatlar', hint: 'Manbalar qaysi faktlarda bir-biriga mos keladi?' },
  { key: 'differences', label: 'Farqli jihatlar', hint: 'Faktlar, baholar, urg‘u va muallif pozitsiyasidagi farqlar.' },
  { key: 'evidence', label: 'Tarixiy dalillar', hint: 'Har bir manbadan aniq iqtibos yoki tafsilot keltiring.' },
  { key: 'conclusion', label: 'Xulosa', hint: 'Qaysi manba nimasi bilan ishonchliroq? Xulosangizni yuqoridagi dalillarga tayaning.' },
  {
    key: 'teachingUse',
    label: 'Ushbu manbalarni maktabda tarix darsini tashkil etishda qanday qo‘llash mumkin va o‘quvchilarga qanday topshiriqlar berish maqsadga muvofiq?',
    hint: 'Sinf, dars bosqichi, metod va o‘quvchilar uchun aniq topshiriq matnini yozing.',
  },
] as const;
type FieldKey = (typeof FIELDS)[number]['key'];
// Tailwind JIT uchun to'liq klass nomlari
const COLS: Record<number, string> = { 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4' };

export default function ComparisonEditorPage() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['comparison', id], queryFn: () => comparisonService.get(id) });
  return <QueryState query={q}>{(c) => <Editor c={c} />}</QueryState>;
}

const Editor = ({ c }: { c: Comparison }) => {
  const { user, isStaff } = useAuth();
  const qc = useQueryClient();
  const notify = useNotify();
  const navigate = useNavigate();
  const editable = c.studentId === user?.id && ['DRAFT', 'RETURNED'].includes(c.status);
  const initValues = () => Object.fromEntries(FIELDS.map((f) => [f.key, c[f.key] ?? ''])) as Record<FieldKey, string>;
  const initNotes = () => Object.fromEntries(c.items.map((i) => [i.sourceId, i.notes ?? ''])) as Record<string, string>;
  const [values, setValues] = useState(initValues);
  const [notes, setNotes] = useState(initNotes);
  const [missing, setMissing] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ slug: string; title: string }>();
  useEffect(() => {
    setValues(initValues());
    setNotes(initNotes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.updatedAt]);

  const dirty = editable && (JSON.stringify(values) !== JSON.stringify(initValues()) || JSON.stringify(notes) !== JSON.stringify(initNotes()));
  useUnsavedWarning(dirty);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['comparison', c.id] });
    qc.invalidateQueries({ queryKey: ['comparisons'] });
  };
  const save = useMutation({ mutationFn: () => comparisonService.update(c.id, { ...values, notes }), onSuccess: () => { refresh(); notify.success('Saqlandi'); }, onError: (e) => notify.error(e) });
  const submit = useMutation({
    mutationFn: async () => {
      await comparisonService.update(c.id, { ...values, notes });
      return comparisonService.submit(c.id);
    },
    onSuccess: () => { refresh(); setMissing([]); notify.success('Ish topshirildi va portfolioga qo‘shildi'); },
    onError: (e) => { refresh(); setMissing(errorDetails(e)); notify.error(e, 'Topshirilmadi'); },
  });
  const remove = useMutation({
    mutationFn: () => comparisonService.remove(c.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['comparisons'] }); notify.success('Qoralama o‘chirildi'); navigate('/app/analysis?tab=c'); },
    onError: (e) => notify.error(e),
  });
  const review = useMutation({
    mutationFn: (v: { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number }) => comparisonService.review(c.id, v),
    onSuccess: () => { refresh(); notify.success('Baho saqlandi'); },
    onError: (e) => notify.error(e),
  });

  return (
    <>
      <PageHeader
        title={c.title}
        tag={<StatusTag map={WORK_STATUS} value={c.status} />}
        description={
          isStaff
            ? `Talaba: ${c.student.fullName}${c.submittedAt ? ` · topshirilgan: ${fmtDateTime(c.submittedAt)}` : ''}`
            : 'Manbalarni yonma-yon o‘rganing, o‘xshash va farqli jihatlarni aniqlang va xulosangizni tarixiy dalillar bilan asoslang.'
        }
        extra={
          editable && (
            <>
              {c.status === 'DRAFT' && (
                <Popconfirm title="Qoralamani o‘chirasizmi?" okText="O‘chirish" okButtonProps={{ danger: true }} cancelText="Yo‘q" onConfirm={() => remove.mutate()}>
                  <Button danger icon={<DeleteOutlined />} loading={remove.isPending} aria-label="Qoralamani o‘chirish" />
                </Popconfirm>
              )}
              <Button icon={<SaveOutlined />} loading={save.isPending} disabled={!dirty} onClick={() => save.mutate()}>
                {dirty ? 'Saqlash' : 'Saqlangan'}
              </Button>
              <Popconfirm title="Ishni topshirasizmi? Topshirilgach tahrirlab bo‘lmaydi." okText="Topshirish" cancelText="Yo‘q" onConfirm={() => submit.mutate()}>
                <Button type="primary" icon={<SendOutlined />} loading={submit.isPending}>Topshirish</Button>
              </Popconfirm>
            </>
          )
        }
      />
      <div className="space-y-6">
        <TeacherVerdict comment={c.teacherComment} score={c.score} status={c.status} />
        {c.reviewedBy && c.reviewedAt && (
          <p className="-mt-3 text-sm text-muted">Baholovchi: {c.reviewedBy.fullName} · {fmtDateTime(c.reviewedAt)}</p>
        )}
        <div className={`grid gap-4 md:grid-cols-2 ${COLS[c.items.length] ?? ''}`}>
          {c.items.map((i, idx) => (
            <Card
              key={i.sourceId}
              size="small"
              title={<span className="whitespace-normal">{idx + 1}. {i.source.title}</span>}
              extra={
                <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => setPreview({ slug: i.source.slug, title: i.source.title })}>
                  Manba
                </Button>
              }
            >
              <Tag color="blue">{SOURCE_TYPE[i.source.type]}</Tag>
              <p className="mb-1 mt-2 text-sm"><b>Sana:</b> {i.source.dateLabel ?? '—'}</p>
              <p className="mb-1 text-sm"><b>Muallif:</b> {i.source.author ?? '—'}</p>
              <p className="mb-3 text-sm text-muted">{i.source.summary}</p>
              {editable ? (
                <Input.TextArea
                  aria-label={`${i.source.title} bo‘yicha qaydlar`}
                  placeholder="Shu manbadan olingan asosiy ma’lumotlar va qaydlaringiz"
                  autoSize={{ minRows: 3 }}
                  value={notes[i.sourceId]}
                  onChange={(e) => setNotes((n) => ({ ...n, [i.sourceId]: e.target.value }))}
                />
              ) : (
                i.notes && <div className="prose-text rounded bg-canvas p-2 text-sm">{i.notes}</div>
              )}
            </Card>
          ))}
        </div>
        {missing.length > 0 && <Alert type="error" showIcon message="Quyidagi maydonlarni to‘ldiring" description={<ul className="m-0 pl-5">{missing.map((m) => <li key={m}>{m}</li>)}</ul>} />}
        <Card title="Taqqoslash natijalari">
          {FIELDS.map((f) => (
            <div key={f.key} className="mb-5 last:mb-0">
              <label htmlFor={`f-${f.key}`} className="mb-1 block font-medium">{f.label} <span className="text-red-700">*</span></label>
              <div className="mb-2 text-sm text-muted">{f.hint}</div>
              {editable ? (
                <Input.TextArea id={`f-${f.key}`} autoSize={{ minRows: 3, maxRows: 12 }} value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
              ) : (
                <div className="prose-text rounded-md bg-canvas p-3">{values[f.key] || <span className="text-muted">—</span>}</div>
              )}
            </div>
          ))}
        </Card>
        {isStaff && ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status) && (
          <ReviewPanel loading={review.isPending} onSubmit={(v) => review.mutate(v)} componentHint="Baho «Kognitiv» komponentga «Manba tahlili» dalili sifatida yoziladi." />
        )}
      </div>
      <Drawer open={!!preview} onClose={() => setPreview(undefined)} title={preview?.title} width="min(720px, 100vw)" destroyOnClose>
        {preview && <SourcePreview slug={preview.slug} />}
      </Drawer>
    </>
  );
};
