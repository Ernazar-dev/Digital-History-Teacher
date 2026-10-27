import { FolderOpenOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Collapse, Empty, Progress, Segmented, Tag } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { STAGE } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import type { AssessmentStage, CompetenceProfile, LevelRef } from '@/types/api';
import { fmtPercent } from '@/utils/format';
import { CompetenceRadar, StageCompareBars } from '../components/CompetenceChart';
import { AssessmentModel } from '../components/AssessmentModel';
import { EvidenceTable } from '../components/EvidenceTable';
import { IndicatorRatingForm } from '../components/IndicatorRatingForm';
import { ExpertRecordForm } from '../components/ExpertRecordForm';

/** Daraja ranglari: Past — qizil, O'rta — sariq, Yuqori — yashil */
const LEVEL_STYLE: Record<string, { tag: string; stroke: string }> = {
  LOW: { tag: 'red', stroke: '#dc2626' },
  MEDIUM: { tag: 'gold', stroke: '#d97706' },
  HIGH: { tag: 'green', stroke: '#16a34a' },
};
const levelStyle = (l: LevelRef | null) => (l && LEVEL_STYLE[l.code]) || { tag: 'blue', stroke: '#1b3768' };

/** Umumiy natija (doira) va har bir komponent (chiziq) — bir qarashda */
const Summary = ({ p }: { p: CompetenceProfile }) => {
  const overall = levelStyle(p.overallLevel);
  return (
    <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
      <div className="flex flex-col items-center text-center">
        <Progress
          type="circle"
          size={170}
          percent={Math.round(p.overall ?? 0)}
          strokeColor={overall.stroke}
          format={() => (
            <div>
              <div className="text-[34px] font-bold leading-none text-ink">{p.overall == null ? '—' : fmtPercent(p.overall)}</div>
              <div className="mt-1 text-xs text-muted">umumiy natija</div>
            </div>
          )}
        />
        {p.overallLevel && <Tag color={overall.tag} className="!mr-0 !mt-3 !px-3 !py-0.5 !text-sm">{p.overallLevel.name} daraja</Tag>}
        <div className="mt-2 text-xs text-muted">{p.recordCount} ta dalil asosida</div>
      </div>
      <div className="space-y-4">
        {p.components.map((c) => {
          const s = levelStyle(c.level);
          return (
            <div key={c.componentId}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[15px] font-medium text-ink">{c.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {c.level && <Tag color={s.tag} className="!m-0">{c.level.name}</Tag>}
                  <b className="w-12 text-right text-ink">{c.score == null ? '—' : fmtPercent(c.score)}</b>
                </span>
              </div>
              <Progress percent={Math.round(c.score ?? 0)} showInfo={false} strokeColor={s.stroke} className="!m-0" />
              {c.score == null && <div className="text-xs text-muted">Hali dalil yo‘q</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CompetencePage() {
  const { studentId: paramId } = useParams();
  const { user, isStudent, isStaff } = useAuth();
  const studentId = paramId ?? user!.id;
  const own = !paramId;
  const [stage, setStage] = useState<AssessmentStage | 'ALL'>('ALL');
  const profile = useQuery({
    queryKey: ['competence', 'profile', studentId, stage],
    queryFn: () => assessmentsService.profile(studentId, stage === 'ALL' ? undefined : stage),
  });
  const dynamics = useQuery({ queryKey: ['competence', 'dynamics', studentId], queryFn: () => assessmentsService.dynamics(studentId) });

  return (
    <>
      <PageHeader
        title="Metodik kompetensiya profili"
        description="Natija to‘rt komponent bo‘yicha hisoblanadi: motivatsion-qadriyatli, kognitiv, faoliyatli-metodik va refleksiv-baholash."
        extra={<Link to={paramId ? `/app/portfolio/students/${studentId}` : '/app/profile'}><Button icon={<FolderOpenOutlined />}>Portfolio</Button></Link>}
      />
      <QueryState query={profile}>
        {(p) => (
          <div className="space-y-6">
            <Card
              title={own ? 'Mening natijam' : 'Talaba natijasi'}
              extra={
                <div className="max-w-[60vw] overflow-x-auto">
                  <Segmented
                    size="small"
                    value={stage}
                    onChange={(v) => setStage(v as AssessmentStage | 'ALL')}
                    options={[{ value: 'ALL', label: 'Barchasi' }, ...(['INITIAL', 'INTERMEDIATE', 'FINAL', 'ONGOING'] as const).map((s) => ({ value: s, label: STAGE[s] }))]}
                  />
                </div>
              }
            >
              {p.recordCount === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={own ? 'Hali natija yo‘q. Diagnostika testlarini yeching va topshiriqlarni bajaring — natija shu yerda paydo bo‘ladi.' : 'Bu talaba bo‘yicha hali dalil yo‘q'}
                >
                  {own && isStudent && <Link to="/app/diagnostics"><Button type="primary">Diagnostikaga o‘tish</Button></Link>}
                </Empty>
              ) : (
                <Summary p={p} />
              )}
              {p.warnings.map((w) => <Alert key={w} className="mt-4" type="warning" showIcon message={w} />)}
              <p className="mb-0 mt-4 text-xs text-muted">{p.disclaimer}</p>
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card title="Komponentlar xaritasi">
                <CompetenceRadar items={p.components} />
              </Card>
              <Card title="Rivojlanish: boshlang‘ich → yakuniy">
                <QueryState query={dynamics}>
                  {(d) => (
                    <>
                      <StageCompareBars data={d.initialVsFinal.map((c) => ({ name: c.name, initial: c.initial, final: c.final }))} />
                      <ul className="m-0 mt-4 list-none space-y-2 p-0">
                        {d.initialVsFinal.map((c) => (
                          <li key={c.code} className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate">{c.name}</span>
                            <span className="flex shrink-0 items-center gap-2 text-muted">
                              {fmtPercent(c.initial)} → <b className="text-ink">{fmtPercent(c.final)}</b>
                              {c.change !== null && <Tag color={c.change >= 0 ? 'green' : 'red'} className="!m-0">{c.change > 0 ? '+' : ''}{c.change}</Tag>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </QueryState>
              </Card>
            </div>

            {isStaff && paramId && (
              <div className="space-y-6">
                <IndicatorRatingForm studentId={studentId} />
                <ExpertRecordForm studentId={studentId} components={p.components} />
              </div>
            )}

            {/* Ma'lumotnoma qismlari — kerak bo'lganda ochiladi */}
            <Collapse
              className="bg-white"
              items={[
                { key: 'how', label: <span className="font-medium">Natija qanday hisoblandi (dalillar va vaznlar)</span>, children: <EvidenceTable components={p.components} /> },
                { key: 'model', label: <span className="font-medium">Baholash modeli: komponentlar, indikatorlar va darajalar</span>, children: <AssessmentModel /> },
              ]}
            />
          </div>
        )}
      </QueryState>
    </>
  );
}
