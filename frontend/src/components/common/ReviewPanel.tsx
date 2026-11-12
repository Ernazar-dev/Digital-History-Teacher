import { Alert, Button, Card, Input, InputNumber, Radio } from 'antd';
import { useState } from 'react';
import i18n from '@/i18n';

export interface ReviewValues { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number }

/**
 * Oʻqituvchi koʻrib chiqish paneli: qayta ishlashga qaytarish yoki qabul qilib baholash (0–100 ball).
 */
export const ReviewPanel = ({
  onSubmit, loading, title = i18n.t('reviewPanel.title'),
}: { onSubmit: (v: ReviewValues) => void; loading?: boolean; title?: string }) => {
  const [decision, setDecision] = useState<'RETURN' | 'ACCEPT'>('ACCEPT');
  const [comment, setComment] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const invalid = comment.trim().length < 2 || (decision === 'ACCEPT' && score === null);

  return (
    <Card title={title} className="border-accent">
      <Radio.Group value={decision} onChange={(e) => setDecision(e.target.value)} className="mb-4" optionType="button" buttonStyle="solid">
        <Radio.Button value="ACCEPT">{i18n.t('reviewPanel.accept')}</Radio.Button>
        <Radio.Button value="RETURN">{i18n.t('reviewPanel.return')}</Radio.Button>
      </Radio.Group>
      <Input.TextArea rows={4} placeholder={i18n.t('reviewPanel.comment')} value={comment} onChange={(e) => setComment(e.target.value)} className="mb-4" />
      {decision === 'ACCEPT' && (
        <div className="mb-4 max-w-[200px]">
          <div className="mb-1 text-sm">{i18n.t('reviewPanel.score')}</div>
          <InputNumber min={0} max={100} value={score} onChange={setScore} className="w-full" />
        </div>
      )}
      <Button
        type="primary"
        disabled={invalid}
        loading={loading}
        onClick={() => onSubmit({ decision, comment, score: decision === 'ACCEPT' ? score ?? undefined : undefined })}
      >
        {i18n.t('reviewPanel.send')}
      </Button>
    </Card>
  );
};

/** Talabaga koʻrinadigan oʻqituvchi xulosasi */
export const TeacherVerdict = ({ comment, score, status }: { comment: string | null; score: number | null; status: string }) => {
  if (!comment) return null;
  return (
    <Alert
      type={status === 'RETURNED' ? 'warning' : 'success'}
      showIcon
      message={status === 'RETURNED' ? i18n.t('reviewPanel.returned') : score !== null ? i18n.t('reviewPanel.gradedScore', { n: score }) : i18n.t('reviewPanel.graded')}
      description={<span className="prose-text">{comment}</span>}
    />
  );
};
