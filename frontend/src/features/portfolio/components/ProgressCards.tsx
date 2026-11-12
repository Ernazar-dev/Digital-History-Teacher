import { Card, List, Tag } from 'antd';
import { Link } from 'react-router-dom';
import i18n from '@/i18n';
import { PORTFOLIO_TYPE } from '@/lib/labels';
import type { Portfolio, PortfolioItem } from '@/types/api';
import { fmtDateTime, fmtPercent } from '@/utils/format';

/** Turli modullardagi holatlar bitta tuşunarli nomga keltiriladi */
const OUTCOME_COLORS: Record<string, string> = {
  NOT_STARTED: 'default', IN_PROGRESS: 'default', DRAFT: 'default', SUBMITTED: 'blue', UNDER_REVIEW: 'gold',
  RETURNED: 'orange', REVIEWED: 'green', GRADED: 'green',
};
/** Nomlar öqilganda joriy tilda hisoblanadi */
export const OUTCOME_STATUS: Record<string, { label: string; color: string }> = Object.fromEntries(
  Object.entries(OUTCOME_COLORS).map(([k, color]) => [k, { get label() { return i18n.t(`outcome.${k}`); }, color }]),
);

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

/** Hujjat, 7-modul: «öqituvçining izohlari» — barcha işlar böyiça oxirgi izohlar bir joyda */
export const TeacherCommentsCard = ({ p }: { p: Portfolio }) => (
  <Card title={i18n.t('portfolio.teacherComments')}>
    <List
      dataSource={p.teacherComments}
      locale={{ emptyText: i18n.t('portfolio.noComments') }}
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
