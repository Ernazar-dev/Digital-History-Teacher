import { Card, List, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PORTFOLIO_TYPE } from '@/lib/labels';
import type { Portfolio, PortfolioItem } from '@/types/api';
import { fmtDateTime, fmtPercent } from '@/utils/format';

/** Turli modullardagi holatlar bitta tushunarli nomga keltiriladi */
export const OUTCOME_STATUS: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Boshlanmagan', color: 'default' },
  IN_PROGRESS: { label: 'Jarayonda', color: 'default' },
  DRAFT: { label: 'Qoralama', color: 'default' },
  SUBMITTED: { label: 'Topshirilgan', color: 'blue' },
  UNDER_REVIEW: { label: 'Tekshirilmoqda', color: 'gold' },
  RETURNED: { label: 'Qaytarilgan', color: 'orange' },
  REVIEWED: { label: 'Baholangan', color: 'green' },
  GRADED: { label: 'Baholangan', color: 'green' },
};

export const OutcomeCell = ({ outcome }: { outcome: PortfolioItem['outcome'] }) => {
  if (!outcome?.status) return <span className="text-muted">—</span>;
  const s = OUTCOME_STATUS[outcome.status];
  return (
    <span className="flex flex-wrap items-center gap-1">
      {s && <Tag color={s.color} className="m-0">{s.label}</Tag>}
      {outcome.percent !== null && <b>{fmtPercent(outcome.percent)}</b>}
    </span>
  );
};

export const Delta = ({ from, to }: { from: number | null | undefined; to: number | null | undefined }) => {
  if (from === null || from === undefined || to === null || to === undefined) return <span className="text-muted">—</span>;
  const d = Math.round((to - from) * 10) / 10;
  return <Tag color={d > 0 ? 'green' : d < 0 ? 'red' : 'default'} className="m-0">{d > 0 ? '+' : ''}{d}</Tag>;
};

/** Hujjat, 7-modul: «o'qituvchining izohlari» — barcha ishlar bo'yicha oxirgi izohlar bir joyda */
export const TeacherCommentsCard = ({ p }: { p: Portfolio }) => (
  <Card title="O‘qituvchi izohlari">
    <List
      dataSource={p.teacherComments}
      locale={{ emptyText: 'Izohlar hali yo‘q' }}
      renderItem={(c) => (
        <List.Item>
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link to={`/app/portfolio/items/${c.itemId}`} className="font-medium">{c.title}</Link>
              {c.percent !== null && <b>{fmtPercent(c.percent)}</b>}
            </div>
            <p className="prose-text m-0 mt-1 text-sm">{c.comment}</p>
            <div className="mt-1 text-xs text-muted">{PORTFOLIO_TYPE[c.type]} · {fmtDateTime(c.date)}</div>
          </div>
        </List.Item>
      )}
    />
  </Card>
);
