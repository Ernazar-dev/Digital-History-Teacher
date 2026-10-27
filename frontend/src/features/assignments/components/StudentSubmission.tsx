import { PlusOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Input, Popconfirm, Select, Steps } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusTag } from '@/components/common/StatusTag';
import { useNotify } from '@/hooks/useNotify';
import { errorDetails } from '@/lib/http';
import { SUBMISSION_STATUS } from '@/lib/labels';
import { assignmentsService, lessonsService } from '@/services/learning.service';
import type { Assignment, SimulatorAnswer } from '@/types/api';
import { FeedbackHistory } from './FeedbackHistory';
import { SimulatorResultView, SimulatorTask } from './Simulator';

/** Talabaning javobi: qoralama → topshirish → (qaytarilsa) qayta ishlash → baholash */
export const StudentSubmission = ({ a }: { a: Assignment }) => {
  const sub = a.mySubmission;
  const qc = useQueryClient();
  const notify = useNotify();
  const [content, setContent] = useState(sub?.content ?? '');
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(sub?.lessonPlanId ?? null);
  const [simAnswer, setSimAnswer] = useState<SimulatorAnswer | null>(sub?.simulatorAnswer ?? null);
  const [missing, setMissing] = useState<string[]>([]);
  useEffect(() => {
    setContent(sub?.content ?? '');
    setLessonPlanId(sub?.lessonPlanId ?? null);
    setSimAnswer(sub?.simulatorAnswer ?? null);
  }, [sub?.content, sub?.lessonPlanId, sub?.simulatorAnswer]);
  const lessons = useQuery({ queryKey: ['lessons', 'mine'], queryFn: () => lessonsService.list({}) });
  const editable = !sub || ['NOT_STARTED', 'IN_PROGRESS', 'RETURNED'].includes(sub.status);
  const hasSimulator = Boolean(a.simulator);
  const body = () => ({ content, lessonPlanId, ...(hasSimulator ? { simulatorAnswer: simAnswer } : {}) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['assignment', a.id] });
    qc.invalidateQueries({ queryKey: ['assignments'] });
  };
  const save = useMutation({
    mutationFn: () => assignmentsService.saveSubmission(a.id, body()),
    onSuccess: () => { refresh(); notify.success('Javob saqlandi'); },
    onError: (e) => notify.error(e),
  });
  const submit = useMutation({
    mutationFn: async () => {
      await assignmentsService.saveSubmission(a.id, body());
      return assignmentsService.submit(a.id);
    },
    onSuccess: () => { refresh(); setMissing([]); notify.success('Javob topshirildi va portfolioga qo‘shildi'); },
    onError: (e) => { setMissing(errorDetails(e)); notify.error(e, 'Topshirilmadi'); },
  });

  const status = sub?.status ?? 'NOT_STARTED';
  const step = status === 'GRADED' ? 2 : ['SUBMITTED', 'UNDER_REVIEW'].includes(status) ? 1 : 0;
  const needsLesson = a.type === 'LESSON_PLAN';

  return (
    <div className="space-y-6">
      <Card size="small">
        <Steps
          size="small"
          current={step}
          status={status === 'RETURNED' ? 'error' : step === 2 ? 'finish' : 'process'}
          items={[
            { title: status === 'RETURNED' ? 'Qayta ishlash' : 'Javob yozish', description: status === 'RETURNED' ? 'O‘qituvchi izohini ko‘ring' : 'Yozing va topshiring' },
            { title: 'Tekshiruv', description: 'O‘qituvchi ko‘rib chiqadi' },
            { title: 'Natija', description: status === 'GRADED' ? `${sub?.score} / ${a.maxScore} ball` : 'Baho va izoh' },
          ]}
        />
      </Card>
      {a.simulator && (
        <Card title={a.simulator.kind === 'CHRONOLOGY' ? 'Raqamli simulyator: xronologik tartib' : 'Raqamli simulyator: xaritada belgilash'}>
          <SimulatorTask config={a.simulator} answer={simAnswer} onChange={setSimAnswer} disabled={!editable} />
          {sub?.autoDetails && <div className="mt-4"><SimulatorResultView result={sub.autoDetails} config={a.simulator} /></div>}
          {!editable && !sub?.autoDetails && <Alert className="mt-4" type="info" showIcon message="Avtomatik tekshiruv natijasi o‘qituvchi ishingizni ko‘rib chiqqandan keyin ko‘rinadi." />}
        </Card>
      )}
      <Card title="Mening javobim" extra={<StatusTag map={SUBMISSION_STATUS} value={status} />}>
        {sub?.status === 'RETURNED' && <Alert className="mb-4" type="warning" showIcon message="Ish qayta ishlash uchun qaytarildi — izohlarni ko‘rib, javobni yaxshilang va qayta topshiring." />}
        {sub?.status === 'GRADED' && <Alert className="mb-4" type="success" showIcon message={`Baholandi: ${sub.score} / ${a.maxScore}`} />}
        {(sub?.status === 'SUBMITTED' || sub?.status === 'UNDER_REVIEW') && (
          <Alert className="mb-4" type="info" showIcon message="Javobingiz o‘qituvchiga yuborildi. Tekshirilgach, baho va izoh shu sahifada paydo bo‘ladi." />
        )}
        {missing.length > 0 && <Alert className="mb-4" type="error" showIcon message="Topshirib bo‘lmadi" description={<ul className="m-0 pl-5">{missing.map((m) => <li key={m}>{m}</li>)}</ul>} />}
        {editable ? (
          <Input.TextArea
            aria-label="Javob matni"
            autoSize={{ minRows: hasSimulator ? 3 : 8, maxRows: 24 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              hasSimulator
                ? 'Ixtiyoriy: tanlovingizni asoslang yoki shu topshiriqni darsda qanday qo‘llashni yozing.'
                : 'Metodik yechimingizni yozing: maqsad, o‘quvchilar faoliyati, topshiriqlar, vaqt taqsimoti, baholash va qarorlaringiz asosnomasi.'
            }
          />
        ) : (
          <div className="prose-text rounded bg-canvas p-3">{sub?.content || '—'}</div>
        )}
        {!hasSimulator && (needsLesson || lessonPlanId) && (
          <div className="mt-4">
            <div className="mb-1 text-sm font-medium">Dars ishlanmasini biriktirish {needsLesson && <span className="text-red-700">*</span>}</div>
            <div className="flex flex-wrap gap-2">
              <Select
                className="min-w-[280px] flex-1"
                allowClear
                aria-label="Dars ishlanmasi"
                disabled={!editable}
                placeholder="O‘z ishlanmalaringizdan tanlang"
                value={lessonPlanId ?? undefined}
                onChange={(v) => setLessonPlanId(v ?? null)}
                options={lessons.data?.data.map((l) => ({ value: l.id, label: `${l.title} (${l.currentVersion}-versiya)` }))}
              />
              {editable && <Link to={`/app/lessons/new?assignmentId=${a.id}`}><Button icon={<PlusOutlined />}>Konstruktorda yaratish</Button></Link>}
              {lessonPlanId && <Link to={`/app/lessons/${lessonPlanId}`}><Button>Ishlanmani ko‘rish</Button></Link>}
            </div>
          </div>
        )}
        {editable && (
          <div className="mt-4 flex gap-2">
            <Button icon={<SaveOutlined />} loading={save.isPending} onClick={() => save.mutate()}>Saqlash</Button>
            <Popconfirm title="Javobni topshirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => submit.mutate()}>
              <Button type="primary" icon={<SendOutlined />} loading={submit.isPending}>{sub?.status === 'RETURNED' ? 'Qayta topshirish' : 'Topshirish'}</Button>
            </Popconfirm>
          </div>
        )}
      </Card>
      {sub?.feedbacks && <FeedbackHistory feedbacks={sub.feedbacks} rubric={a.rubric} />}
    </div>
  );
};
