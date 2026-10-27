import { Card, Empty, Timeline } from 'antd';
import type { Feedback, Rubric } from '@/types/api';
import { fmtDateTime } from '@/utils/format';

const DECISION: Record<Feedback['decision'], { label: string; color: string }> = {
  COMMENT: { label: 'Izoh', color: 'blue' },
  RETURN_FOR_REVISION: { label: 'Qayta ishlashga qaytarildi', color: 'orange' },
  GRADE: { label: 'Baholandi', color: 'green' },
};

export const FeedbackHistory = ({ feedbacks, rubric }: { feedbacks: Feedback[]; rubric?: Rubric | null }) => (
  <Card title="O‘qituvchi fikr-mulohazalari">
    {feedbacks.length === 0 ? (
      <Empty description="Hali izoh yo‘q" />
    ) : (
      <Timeline
        items={feedbacks.map((f) => ({
          color: DECISION[f.decision].color,
          children: (
            <div>
              <div className="font-medium">
                {DECISION[f.decision].label} · {f.version}-versiya {f.totalScore !== null && `· ${f.totalScore} ball`}
              </div>
              <div className="text-xs text-muted">{f.author?.fullName} · {fmtDateTime(f.createdAt)}</div>
              <p className="prose-text mb-1 mt-2">{f.comment}</p>
              {f.scores.length > 0 && (
                <ul className="m-0 pl-5 text-sm">
                  {f.scores.map((s) => {
                    const c = rubric?.criteria.find((x) => x.id === s.criterionId);
                    return <li key={s.criterionId}>{c?.title ?? 'Mezon'}: {s.score}{c ? ` / ${c.maxScore}` : ''}</li>;
                  })}
                </ul>
              )}
            </div>
          ),
        }))}
      />
    )}
  </Card>
);
