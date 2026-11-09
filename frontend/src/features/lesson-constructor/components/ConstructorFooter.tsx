import { SaveOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm } from 'antd';
import type { UseFormReturn } from 'react-hook-form';
import i18n from '@/i18n';
import type { LessonFormValues } from '../lessonForm';
import { checklist } from './StepReview';

interface Props {
  step: number; last: number; setStep: (n: number) => void; showNote: boolean; note: string; setNote: (s: string) => void;
  form: UseFormReturn<LessonFormValues>; saving: boolean; submitting: boolean; onSave: () => void; onSubmit: () => void;
}

export const ConstructorFooter = ({ step, last, setStep, showNote, note, setNote, form, saving, submitting, onSave, onSubmit }: Props) => (
  <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas py-3">
    <div className="flex gap-2">
      <Button disabled={step === 0} onClick={() => setStep(step - 1)}>{i18n.t('lesson.footer.back')}</Button>
      <Button disabled={step === last} onClick={() => setStep(step + 1)}>{i18n.t('lesson.footer.next')}</Button>
    </div>
    <div className="flex flex-wrap gap-2">
      {showNote && <Input placeholder={i18n.t('lesson.footer.noteVersion')} value={note} onChange={(e) => setNote(e.target.value)} className="w-56" />}
      <Button icon={<SaveOutlined />} loading={saving} onClick={onSave}>{i18n.t('lesson.footer.save')}</Button>
      <Popconfirm
        title={i18n.t('lesson.footer.submitQ')}
        description={checklist(form.getValues()).every((i) => i.ok) ? i18n.t('lesson.footer.submitFinal') : i18n.t('lesson.footer.submitIncomplete')}
        okText={i18n.t('lesson.footer.submit')}
        cancelText={i18n.t('lesson.footer.no')}
        onConfirm={onSubmit}
      >
        <Button type="primary" icon={<SendOutlined />} loading={submitting}>{i18n.t('lesson.footer.submit')}</Button>
      </Popconfirm>
    </div>
  </div>
);
