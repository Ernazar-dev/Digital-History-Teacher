import { useQueries } from '@tanstack/react-query';
import { Alert, Descriptions, Modal, Spin, Tag } from 'antd';
import { PORTFOLIO_TYPE } from '@/lib/labels';
import { portfolioService } from '@/services/portfolio.service';
import type { PortfolioItem, PortfolioItemDetail } from '@/types/api';
import { fmtDateTime, fmtPercent } from '@/utils/format';
import { Delta, OutcomeCell } from './ProgressCards';

const summary = (d: Record<string, unknown> | null) => {
  if (!d) return [];
  const rows: [string, string][] = [];
  if (d.version) rows.push(['Versiya', String(d.version)]);
  if (d.currentVersion) rows.push(['Versiya', String(d.currentVersion)]);
  if (d.teacherComment) rows.push(['O‘qituvchi izohi', String(d.teacherComment)]);
  if (d.content) rows.push(['Javob', String(d.content)]);
  if (d.conclusion) rows.push(['Xulosa', String(d.conclusion)]);
  if (d.activityDesign) rows.push(['Mashg‘ulot loyihasi', String(d.activityDesign)]);
  if (d.goal) rows.push(['Maqsad', String(d.goal)]);
  return rows;
};

const Column = ({ label, item, detail }: { label: string; item: PortfolioItem; detail?: PortfolioItemDetail }) => (
  <div className="min-w-0">
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{label}</div>
    <Tag color="blue">{PORTFOLIO_TYPE[item.type]}</Tag>
    <h4 className="mb-1 mt-2">{item.title}</h4>
    <div className="mb-2 text-xs text-muted">{fmtDateTime(item.createdAt)} · {item.version}-versiya</div>
    <div className="mb-3"><OutcomeCell outcome={item.outcome} /></div>
    <Descriptions column={1} size="small" bordered>
      {summary(detail?.detail ?? null).map(([k, v]) => (
        <Descriptions.Item key={k} label={k}><span className="prose-text">{v}</span></Descriptions.Item>
      ))}
    </Descriptions>
  </div>
);

/** Hujjat, 7-modul: «talaba o'zining avvalgi va keyingi ishlarini taqqoslashi mumkin» */
export const CompareItemsModal = ({ items, open, onClose }: { items: PortfolioItem[]; open: boolean; onClose: () => void }) => {
  const ordered = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const results = useQueries({ queries: ordered.map((i) => ({ queryKey: ['portfolio-item', i.id], queryFn: () => portfolioService.item(i.id), enabled: open })) });
  const [earlier, later] = ordered;
  const sameType = Boolean(earlier && later && earlier.type === later.type);

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="min(1000px, 100vw)" title="Avvalgi va keyingi ishni taqqoslash">
      {results.some((r) => r.isLoading) ? (
        <div className="flex justify-center py-10"><Spin /></div>
      ) : (
        <>
          {earlier && later && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-canvas p-3 text-sm">
              <span>Natija: {fmtPercent(earlier.outcome?.percent ?? null)} → {fmtPercent(later.outcome?.percent ?? null)}</span>
              <Delta from={earlier.outcome?.percent} to={later.outcome?.percent} />
            </div>
          )}
          {earlier && later && !sameType && (
            <Alert className="mb-4" type="info" showIcon message="Turli turdagi ishlar. Rivojlanishni aniqroq ko‘rish uchun bir turdagi ishlarni (masalan, ikkita manba tahlili) taqqoslang." />
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {ordered.map((item, i) => (
              <Column key={item.id} label={i === 0 ? 'Avvalgi ish' : 'Keyingi ish'} item={item} detail={results[i]?.data} />
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};
