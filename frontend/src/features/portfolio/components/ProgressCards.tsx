import { Card, Empty, List, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PORTFOLIO_TYPE, STAGE } from '@/lib/labels';
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

const STAGE_ORDER = ['INITIAL', 'INTERMEDIATE', 'FINAL'];

/** Hujjat, 7-modul: «kompetensiya darajasining dinamikasi» — boshlang'ich, oraliq va yakuniy bosqichlar */
export const DynamicsCard = ({ p }: { p: Portfolio }) => {
  const [initial, , final] = p.dynamics;
  const hasData = p.dynamics.some((d) => d.overall !== null);
  return (
    <Card title="Kompetensiya dinamikasi">
      {!hasData ? (
        <Empty description="Bosqichli diagnostika natijalari hali yo‘q" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            {p.dynamics.map((d) => (
              <div key={d.stage} className="rounded-lg border border-solid border-line p-2">
                <div className="text-xs text-muted">{STAGE[d.stage]}</div>
                <div className="text-lg font-semibold">{fmtPercent(d.overall)}</div>
                {d.level && <Tag color="blue" className="m-0 text-xs">{d.level.name}</Tag>}
              </div>
            ))}
          </div>
          <Table
            size="small"
            rowKey="code"
            pagination={false}
            dataSource={initial.components.map((c, i) => ({ ...c, initial: c.score, final: final.components[i]?.score ?? null }))}
            columns={[
              { title: 'Komponent', dataIndex: 'name' },
              { title: 'Boshl.', width: 70, render: (_, c) => fmtPercent(c.initial) },
              { title: 'Yakuniy', width: 70, render: (_, c) => fmtPercent(c.final) },
              { title: 'O‘zgarish', width: 80, render: (_, c) => <Delta from={c.initial} to={c.final} /> },
            ]}
          />
        </>
      )}
    </Card>
  );
};

/** Hujjat, 7-modul: «oraliq va yakuniy test natijalari» */
export const DiagnosticsCard = ({ p }: { p: Portfolio }) => (
  <Card title="Diagnostika va test natijalari">
    <List
      dataSource={[...p.diagnostics].sort((a, b) => STAGE_ORDER.indexOf(a.stage ?? '') - STAGE_ORDER.indexOf(b.stage ?? ''))}
      locale={{ emptyText: 'Diagnostikalar hali topshirilmagan' }}
      renderItem={(d) => (
        <List.Item extra={d.percent !== null ? <b>{fmtPercent(d.percent)}</b> : <Tag color="gold" className="m-0">Tekshirilmoqda</Tag>}>
          <List.Item.Meta
            title={<Link to={`/app/portfolio/items/${d.itemId}`}>{d.title}</Link>}
            description={<>{d.stage && <Tag className="m-0 mr-1">{STAGE[d.stage]}</Tag>}{fmtDateTime(d.date)}</>}
          />
        </List.Item>
      )}
    />
  </Card>
);

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
