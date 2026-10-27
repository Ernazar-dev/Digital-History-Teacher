import { SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Input, Popconfirm } from 'antd';
import { useState } from 'react';
import { TeacherVerdict } from '@/components/common/ReviewPanel';
import { StatusTag } from '@/components/common/StatusTag';
import { useNotify } from '@/hooks/useNotify';
import { errorDetails } from '@/lib/http';
import { WORK_STATUS } from '@/lib/labels';
import { museumService } from '@/services/museum.service';
import type { VirtualObject } from '@/types/api';
import { TaskCard } from './TaskCard';

/** Talaba: kuzatuv javoblari va obyekt asosida mashg'ulot loyihasi → topshirilgach portfolioga */
export const ObjectWorkPanel = ({ o }: { o: VirtualObject }) => {
  const r = o.myResponse;
  const qc = useQueryClient();
  const notify = useNotify();
  const [answers, setAnswers] = useState<Record<string, string>>(r?.answers ?? {});
  const [design, setDesign] = useState(r?.activityDesign ?? '');
  const [missing, setMissing] = useState<string[]>([]);
  const editable = !r || ['DRAFT', 'RETURNED'].includes(r.status);
  const refresh = () => qc.invalidateQueries({ queryKey: ['object'] });

  const save = useMutation({
    mutationFn: () => museumService.saveResponse(o.id, { answers, activityDesign: design }),
    onSuccess: () => { refresh(); notify.success('Javoblar saqlandi'); },
    onError: (e) => notify.error(e),
  });
  const submit = useMutation({
    mutationFn: async () => {
      await museumService.saveResponse(o.id, { answers, activityDesign: design });
      return museumService.submitResponse(o.id);
    },
    onSuccess: () => { refresh(); setMissing([]); notify.success('Ish topshirildi va portfolioga qo‘shildi'); },
    onError: (e) => { setMissing(errorDetails(e)); notify.error(e, 'Topshirilmadi'); },
  });

  return (
    <Card title="Mening ishim" extra={r && <StatusTag map={WORK_STATUS} value={r.status} />}>
      {r && <div className="mb-4"><TeacherVerdict comment={r.teacherComment} score={r.score} status={r.status} /></div>}
      <div className="mb-5 space-y-3">
        {o.tasks.map((t, i) => (
          <TaskCard key={t.id} task={t} index={i}>
            {editable ? (
              <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Javobingizni yozing…" aria-label={`${i + 1}-topshiriqqa javob`} value={answers[t.id] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [t.id]: e.target.value }))} />
            ) : (
              <div className="prose-text rounded bg-canvas p-3">{answers[t.id] || '—'}</div>
            )}
          </TaskCard>
        ))}
      </div>
      <div className="mb-5">
        <div className="mb-1 font-medium">Obyekt asosidagi mashg‘ulot loyihasi</div>
        <div className="mb-2 text-sm text-muted">Masalan: 8-sinf uchun 15 daqiqalik interaktiv mashg‘ulot — maqsad, o‘quvchilar faoliyati, topshiriq va baholash. Bir nechta obyektdan iborat sayohat uchun «Virtual sayohat loyihalari» bo‘limidan foydalaning.</div>
        {editable ? (
          <Input.TextArea autoSize={{ minRows: 4 }} value={design} onChange={(e) => setDesign(e.target.value)} />
        ) : (
          <div className="prose-text rounded bg-canvas p-3">{design || '—'}</div>
        )}
      </div>
      {missing.length > 0 && (
        <Alert className="mb-4" type="error" showIcon message="Ishni to‘liq bajaring" description={<ul className="m-0 pl-5">{missing.map((m) => <li key={m}>{m}</li>)}</ul>} />
      )}
      {editable && (
        <div className="flex gap-2">
          <Button icon={<SaveOutlined />} loading={save.isPending} onClick={() => save.mutate()}>Saqlash</Button>
          <Popconfirm title="Ishni topshirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => submit.mutate()}>
            <Button type="primary" icon={<SendOutlined />} loading={submit.isPending}>Topshirish</Button>
          </Popconfirm>
        </div>
      )}
    </Card>
  );
};
