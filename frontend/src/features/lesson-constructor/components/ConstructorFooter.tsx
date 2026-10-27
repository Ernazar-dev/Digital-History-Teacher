import { SaveOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm } from 'antd';
import type { UseFormReturn } from 'react-hook-form';
import type { LessonFormValues } from '../lessonForm';
import { checklist } from './StepReview';

interface Props {
  step: number; last: number; setStep: (n: number) => void; showNote: boolean; note: string; setNote: (s: string) => void;
  form: UseFormReturn<LessonFormValues>; saving: boolean; submitting: boolean; onSave: () => void; onSubmit: () => void;
}

export const ConstructorFooter = ({ step, last, setStep, showNote, note, setNote, form, saving, submitting, onSave, onSubmit }: Props) => (
  <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas py-3">
    <div className="flex gap-2">
      <Button disabled={step === 0} onClick={() => setStep(step - 1)}>Orqaga</Button>
      <Button disabled={step === last} onClick={() => setStep(step + 1)}>Keyingi</Button>
    </div>
    <div className="flex flex-wrap gap-2">
      {showNote && <Input placeholder="Versiya izohi (ixtiyoriy)" value={note} onChange={(e) => setNote(e.target.value)} className="w-56" />}
      <Button icon={<SaveOutlined />} loading={saving} onClick={onSave}>Saqlash</Button>
      <Popconfirm
        title="Dars ishlanmasini topshirasizmi?"
        description={checklist(form.getValues()).every((i) => i.ok) ? 'Topshirilgach tahrirlab bo‘lmaydi.' : 'Ba’zi bandlar to‘ldirilmagan — server topshirishni rad etadi.'}
        okText="Topshirish"
        cancelText="Yo‘q"
        onConfirm={onSubmit}
      >
        <Button type="primary" icon={<SendOutlined />} loading={submitting}>Topshirish</Button>
      </Popconfirm>
    </div>
  </div>
);
