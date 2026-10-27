import { Alert, Button, Card, Input, InputNumber, Radio } from 'antd';
import { useState } from 'react';

export interface ReviewValues { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number; reflectiveScore?: number }

/**
 * O'qituvchi ko'rib chiqish paneli: qayta ishlashga qaytarish yoki qabul qilib baholash.
 * Ball (0–100) kompetensiya dalili sifatida yoziladi — qaysi komponentga borishi panelda ko'rsatiladi.
 */
export const ReviewPanel = ({
  onSubmit, loading, componentHint, withReflective = false,
}: { onSubmit: (v: ReviewValues) => void; loading?: boolean; componentHint: string; withReflective?: boolean }) => {
  const [decision, setDecision] = useState<'RETURN' | 'ACCEPT'>('ACCEPT');
  const [comment, setComment] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [reflective, setReflective] = useState<number | null>(null);
  const invalid = comment.trim().length < 2 || (decision === 'ACCEPT' && score === null);

  return (
    <Card title="O‘qituvchi bahosi va izohi" className="no-print border-accent">
      <Radio.Group value={decision} onChange={(e) => setDecision(e.target.value)} className="mb-4" optionType="button" buttonStyle="solid">
        <Radio.Button value="ACCEPT">Qabul qilish va baholash</Radio.Button>
        <Radio.Button value="RETURN">Qayta ishlashga qaytarish</Radio.Button>
      </Radio.Group>
      <Input.TextArea rows={4} placeholder="Izoh va tavsiyalar (majburiy)" value={comment} onChange={(e) => setComment(e.target.value)} className="mb-4" />
      {decision === 'ACCEPT' && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm">Ball (0–100)</div>
            <InputNumber min={0} max={100} value={score} onChange={setScore} className="w-full" />
          </div>
          {withReflective && (
            <div>
              <div className="mb-1 text-sm">Metodik qarorlar asosnomasi (refleksiv, ixtiyoriy)</div>
              <InputNumber min={0} max={100} value={reflective} onChange={setReflective} className="w-full" />
            </div>
          )}
        </div>
      )}
      <Alert className="mb-4" type="info" showIcon message={componentHint} />
      <Button
        type="primary"
        disabled={invalid}
        loading={loading}
        onClick={() =>
          onSubmit({ decision, comment, score: score ?? undefined, reflectiveScore: withReflective ? reflective ?? undefined : undefined })
        }
      >
        Yuborish
      </Button>
    </Card>
  );
};

/** Talabaga ko'rinadigan o'qituvchi xulosasi */
export const TeacherVerdict = ({ comment, score, status }: { comment: string | null; score: number | null; status: string }) => {
  if (!comment) return null;
  return (
    <Alert
      type={status === 'RETURNED' ? 'warning' : 'success'}
      showIcon
      message={status === 'RETURNED' ? 'O‘qituvchi ishni qayta ishlashga qaytardi' : `O‘qituvchi bahosi${score !== null ? `: ${score} ball` : ''}`}
      description={<span className="prose-text">{comment}</span>}
    />
  );
};
